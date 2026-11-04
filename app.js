(function () {
  'use strict';
  const E = EditEngine, $ = id => document.getElementById(id);
  const STORAGE = 'wendao-edit-project-v1';
  const phaseNames={intro:'序章',realm:'境界',fun:'荒唐日常',break:'轉折',epic:'真正戰績',final:'終章'};
  const characterNames={luyang:'陸陽',huang:'黃豆豆',yunzhi:'雲芝',trio:'三人同框'};
  const phaseKickers={intro:'THE ORDINARY INTRODUCTION',realm:'CULTIVATOR ARCHIVE',fun:'JUST ANOTHER ORDINARY DAY',break:'UNTIL THEY GET SERIOUS',epic:'WHEN LEGENDS BECOME REAL',final:'A CULTIVATION CHRONICLE'};
  let project=E.normalize(window.DEFAULT_PROJECT), selected=project.scenes[0].id;
  let activeId='', toastTimer, audioUrl=null, audioReady=false, wavePeaks=null, audioLoad=0, dragMode=null;
  let lastSave='本機草稿', pendingSave, lastTimeUpdate=0;
  try {const saved=localStorage.getItem(STORAGE);if(saved){project=E.normalize(JSON.parse(saved));selected=project.scenes[0].id;lastSave='已恢復草稿';}}catch{lastSave='使用示範分鏡';}
  const audio=$('audio');

  class Transport {
    constructor(){this.position=0;this.anchor=performance.now();this.playing=false;this.master=false;this.serial=0;}
    time(){
      if(!this.playing)return this.position;
      if(this.master)return E.clamp(audio.currentTime-project.music.musicOffsetSec,0,E.duration(project));
      return E.clamp(this.position+(performance.now()-this.anchor)/1000,0,E.duration(project));
    }
    pause(){this.position=this.time();this.anchor=performance.now();this.playing=false;this.master=false;this.serial++;audio.pause();updatePlayButton();}
    async play(){
      if(this.playing)return;
      if(this.position>=E.duration(project)-.001)this.position=0;
      this.anchor=performance.now();this.playing=true;this.master=false;const serial=++this.serial;updatePlayButton();
      const sourceTime=this.position+project.music.musicOffsetSec;
      if(audioReady&&sourceTime<audio.duration-.01){
        audio.currentTime=sourceTime;
        try {await audio.play();if(serial!==this.serial)return;this.master=true;}
        catch {if(serial===this.serial){this.master=false;toast('音樂未能播放，繼續無聲預覽。');}}
      }
    }
    seek(t){const resume=this.playing;this.pause();this.position=E.clamp(Number(t)||0,0,E.duration(project));this.anchor=performance.now();if(audioReady)audio.currentTime=Math.min(audio.duration,this.position+project.music.musicOffsetSec);const s=E.sceneAt(project,this.position);if(s&&s.id!==selected)selectScene(s.id);render(this.position,true);if(resume)this.play();}
    toggle(){if(this.playing)this.pause();else this.play();}
  }
  const transport=new Transport();
  audio.addEventListener('ended',()=>{
    if(!transport.master)return;
    transport.position=E.clamp(audio.duration-project.music.musicOffsetSec,0,E.duration(project));transport.anchor=performance.now();transport.master=false;
    $('audio-status').textContent='音檔已結束 · 剩餘畫面繼續無聲演出';
  });
  function toast(message){$('toast').textContent=message;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),3200);}
  function updatePlayButton(){$('play').textContent=transport.playing?'Ⅱ':'▶';$('play').setAttribute('aria-label',transport.playing?'暫停（空白鍵）':'播放（空白鍵）');}
  function save(){
    clearTimeout(pendingSave);
    pendingSave=setTimeout(()=>{try{localStorage.setItem(STORAGE,JSON.stringify(project));$('save-status').textContent='草稿已儲存';}catch{$('save-status').textContent='請匯出 JSON 備份';}},200);
  }
  function updateValidation(){
    const {errors,warnings}=E.validate(project),pending=project.scenes.filter(s=>s.needsVerification).length;
    const gaps=warnings.filter(w=>w.includes('留白'));
    const el=$('validation-status');
    el.textContent=errors.length?errors[0]:gaps.length?gaps.join(' · '):`時間軸完整${pending?` · ${pending} 幕原作細節待核對`:''}`;
    el.classList.toggle('issues',errors.length>0||gaps.length>0);el.title=[...errors,...warnings].join('\n');
  }
  function create(tag,className,text){const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;}
  function renderSceneList(){
    const list=$('scene-list');list.replaceChildren();let phase='';
    project.scenes.forEach((s,i)=>{
      if(s.phase!==phase){list.append(create('p','scene-group-label',phaseNames[s.phase]));phase=s.phase;}
      const button=create('button','scene-item'+(s.id===selected?' active':''));button.dataset.id=s.id;button.setAttribute('aria-label',`第 ${i+1} 幕，${s.text.replaceAll('\n','，')}`);
      button.append(create('span','shot-index',String(i+1).padStart(2,'0')));
      const thumb=create('span','shot-thumb',({luyang:'劍',huang:'仙',yunzhi:'道',trio:'問'})[s.character]||'序');thumb.style.setProperty('--shot-color',s.accent||'#cbb990');button.append(thumb);
      const info=create('span','shot-info'),name=create('span','shot-name',s.text.replaceAll('\n',''));
      info.append(name,create('span','shot-duration',`${s.startSec.toFixed(2)} — ${s.endSec.toFixed(2)}`));button.append(info);
      button.addEventListener('click',()=>selectScene(s.id,true));list.append(button);
    });
    $('scene-count').textContent=project.scenes.length+' SHOTS';
  }
  function populateInspector(){
    const s=project.scenes.find(s=>s.id===selected);if(!s)return;
    $('selected-number').textContent='SHOT '+String(project.scenes.indexOf(s)+1).padStart(2,'0');
    $('scene-text').value=s.text;$('scene-subtext').value=s.subtext||'';
    $('scene-start').value=Number(s.startSec.toFixed(4));$('scene-end').value=Number(s.endSec.toFixed(4));
    $('scene-character').value=s.character||'';$('scene-phase').value=s.phase;$('scene-effect').value=s.effect;$('scene-accent').value=s.accent||'#cbb990';
    $('scene-verified').checked=!s.needsVerification;
    $('source-note').replaceChildren(document.createTextNode((s.needsVerification?'待核對 · ':'已標記核實 · ')+(s.sourceNote||'未提供原文章節。')));
    if(s.sourceUrl){try{const u=new URL(s.sourceUrl);if(u.protocol==='https:'||u.protocol==='http:'){const a=create('a','',' 原著入口 ↗');a.href=u.href;a.target='_blank';a.rel='noopener noreferrer';$('source-note').append(a);}}catch{}}
    $('scene-error').textContent='';
    $('delete-scene').disabled=project.scenes.length<=1;
  }
  function selectScene(id,seek=false){selected=id;renderSceneList();populateInspector();document.querySelectorAll('.timeline-shot').forEach(el=>el.classList.toggle('selected',el.dataset.id===id));const s=project.scenes.find(s=>s.id===id);if(seek&&s)transport.seek(s.startSec);}
  function renderTimeline(){
    const d=E.duration(project);$('ruler').replaceChildren();
    const step=d>120?10:d>45?5:2;
    for(let t=0;t<d;t+=step){const tick=create('span','',String(t).padStart(2,'0'));tick.style.left=(t/d*100)+'%';$('ruler').append(tick);}
    $('timeline-shots').replaceChildren();
    project.scenes.forEach((s,i)=>{const b=create('button','timeline-shot '+s.phase+(s.id===selected?' selected':''),String(i+1).padStart(2,'0')+' '+(characterNames[s.character]||phaseNames[s.phase]));b.dataset.id=s.id;b.style.left=s.startSec/d*100+'%';b.style.width=(s.endSec-s.startSec)/d*100+'%';b.title=`${s.text.replaceAll('\n',' / ')} · ${s.startSec.toFixed(2)}–${s.endSec.toFixed(2)}s`;b.setAttribute('aria-label',b.title);$('timeline-shots').append(b);});
    $('drop-marker').style.left=project.music.dropAtSec/d*100+'%';
    $('beat-markers').replaceChildren();project.beats.forEach(t=>{const beat=create('span','beat');beat.style.left=t/d*100+'%';beat.title=t.toFixed(2)+'s';$('beat-markers').append(beat);});
    $('duration-label').replaceChildren(document.createTextNode(d.toFixed(2)+'s '));$('duration-label').append(create('i','','可編輯時間軸'));$('total-time').textContent=d.toFixed(2);$('time-input').max=d;
    $('drop-time').value=Number(project.music.dropAtSec.toFixed(3));$('drop-time').max=d-.1;
    drawWave();updateValidation();
  }
  function render(t,force=false){
    const s=E.sceneAt(project,t);EditArtwork.render(s,t,project);
    if(s){
      if(force||activeId!==s.id){
        activeId=s.id;const index=project.scenes.indexOf(s);
        $('film-kicker').textContent=s.phase==='realm'?'0'+(index)+' / '+phaseKickers[s.phase]:phaseKickers[s.phase];
        $('film-headline').textContent=s.text;$('film-subline').textContent=s.subtext||'';
        $('film-headline').className='film-headline'+(['realm','intro','final'].includes(s.phase)?' large':s.text.split('\n').some(x=>x.length>8)?' compact':'');
        $('film-index').textContent=String(index+1).padStart(2,'0')+' / '+String(project.scenes.length).padStart(2,'0');
        $('preview-phase').textContent=phaseNames[s.phase]+' / '+(characterNames[s.character]||'字卡');
        $('film').style.setProperty('--accent',s.accent||'#cbb990');
        // Inspector follows playback only when the user is not typing in it.
        if(transport.playing&&!$('scene-form').contains(document.activeElement))selectScene(s.id);
      }
      const p=E.progress(s,t),entry=.55+.45*(1-Math.pow(1-E.clamp(p*6,0,1),3));
      const exit=s.phase==='final'?1:E.clamp((1-p)*12,0,1);
      $('film-copy').style.opacity=String(entry*exit);
      $('film-copy').style.transform=`translateY(${(1-entry)*18}px) scale(${s.phase==='epic'?1+(1-entry)*.07:1})`;
      $('film-copy').style.top=s.phase==='break'?'35%':s.phase==='final'?'16%':'17%';
      if(s.phase==='break')$('film-copy').style.opacity=String(E.clamp(p*4,0,1)*exit);
    }else{activeId='';$('film-copy').style.opacity='0';$('preview-phase').textContent='時間軸留白';}
    $('playhead').style.left=(t/E.duration(project)*100)+'%';
    if(force||performance.now()-lastTimeUpdate>80){if(document.activeElement!==$('time-input'))$('time-input').value=t.toFixed(2);lastTimeUpdate=performance.now();}
  }
  function tick(){
    const t=transport.time();render(t);
    if(transport.playing&&t>=E.duration(project)-.00001){
      if(project.music.loop){transport.seek(0);}else{transport.pause();transport.position=E.duration(project);render(transport.position,true);}
    }
    requestAnimationFrame(tick);
  }
  function rebuild(){renderSceneList();populateInspector();renderTimeline();activeId='';render(transport.time(),true);save();}
  function jumpScene(direction){
    const t=transport.time(),s=E.sceneAt(project,t);let index=project.scenes.indexOf(s);
    if(index<0)index=project.scenes.findIndex(s=>s.startSec>t)-(direction>0?1:0);
    index=E.clamp(index+direction,0,project.scenes.length-1);selectScene(project.scenes[index].id,true);
  }
  function restart(){transport.pause();transport.seek(0);selectScene(project.scenes[0].id);transport.play();}
  function setCapture(on){document.body.classList.toggle('capture',on);document.body.classList.remove('clean');toast(on?'錄屏模式 · 空白鍵播放，R 重播，H / Esc 返回':'已返回編輯');}
  function applyDrop(value){
    const time=transport.time();transport.pause();
    try{project=E.retimeDrop(project,Number(value));rebuild();transport.seek(time);toast('已連動調整前後分鏡；總長保持不變。');}
    catch(error){toast(error.message);$('drop-time').value=project.music.dropAtSec;}
  }
  function addBeat(){const t=Number(transport.time().toFixed(3));if(project.beats.length>=1000)return toast('最多 1000 個節拍標記。');if(!project.beats.some(b=>Math.abs(b-t)<.05)){project.beats.push(t);project.beats.sort((a,b)=>a-b);renderTimeline();save();toast(`已標記 ${t.toFixed(2)}s`);}}
  function drawWave(){
    const canvas=$('waveform'),ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);
    ctx.fillStyle=wavePeaks?'#c1b388':'#3f4937';
    for(let x=0;x<w;x+=3){let amp=.025;if(wavePeaks){const source=(x/w*E.duration(project)+project.music.musicOffsetSec)/wavePeaks.duration;const i=Math.floor(source*wavePeaks.peaks.length);amp=source>=0&&source<1?wavePeaks.peaks[i]:0;}
      const height=Math.max(1,amp*(h-4));ctx.fillRect(x,(h-height)/2,2,height);}
  }
  async function decodeWave(file,serial){
    const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return;
    let ctx;
    try{ctx=new Ctx();const buffer=await ctx.decodeAudioData(await file.arrayBuffer());if(serial!==audioLoad)return;
      const data=buffer.getChannelData(0),bins=5000,peaks=[];
      for(let i=0;i<bins;i++){const start=Math.floor(i*data.length/bins),end=Math.floor((i+1)*data.length/bins);let peak=0;for(let j=start;j<end;j+=Math.max(1,Math.floor((end-start)/150)))peak=Math.max(peak,Math.abs(data[j]));peaks.push(peak);}
      wavePeaks={duration:buffer.duration,peaks};drawWave();
    }catch{if(serial===audioLoad)toast('音樂可播放；此音檔無法顯示波形。');}finally{if(ctx)ctx.close();}
  }
  function removeAudio(notify=true){
    transport.pause();audioLoad++;audioReady=false;audio.removeAttribute('src');audio.load();if(audioUrl)URL.revokeObjectURL(audioUrl);audioUrl=null;wavePeaks=null;
    $('audio-file').value='';$('audio-name').textContent='匯入本機音樂';$('audio-status').textContent='Wannabe — why mona · 尚未載入';$('preview-note').textContent='無聲預覽 · 匯入音樂後可校準節拍';drawWave();if(notify)toast('已切回無聲預覽。');
  }
  function loadAudio(file){
    if(!file)return;removeAudio(false);const serial=audioLoad;
    audioUrl=URL.createObjectURL(file);audio.src=audioUrl;
    $('audio-name').textContent=file.name;$('audio-status').textContent='正在讀取本機音檔…';
    audio.onloadedmetadata=()=>{
      if(serial!==audioLoad)return;if(!Number.isFinite(audio.duration)||audio.duration<=0){removeAudio(false);toast('無法讀取音檔長度，請換一個檔案。');return;}
      audioReady=true;audio.volume=project.music.volume;$('audio-status').textContent=`${audio.duration.toFixed(1)} 秒 · 音訊主時鐘`;
      $('preview-note').textContent='本機音樂已載入 · 請依實際重拍校準 Drop';transport.seek(transport.position);decodeWave(file,serial);
      if(audio.duration<project.music.musicOffsetSec+E.duration(project))toast('音檔短於作品區間；音樂結束後，畫面會繼續無聲演出。');else toast('已載入本機音樂，可開始校準。');
    };
    audio.onerror=()=>{if(serial!==audioLoad)return;removeAudio(false);toast('此音檔無法播放，已返回無聲預覽。');};audio.load();
  }
  // Wire controls once. The film itself never owns timers or accumulated animation state.
  Object.entries(E.EFFECTS).forEach(([id,name])=>{const opt=create('option','',name);opt.value=id;$('scene-effect').append(opt);});
  $('play').addEventListener('click',()=>transport.toggle());$('previous').addEventListener('click',()=>jumpScene(-1));$('next').addEventListener('click',()=>jumpScene(1));$('restart').addEventListener('click',restart);
  $('time-input').addEventListener('input',e=>{if(e.target.value!=='')transport.seek(e.target.value);});
  $('time-input').addEventListener('change',e=>transport.seek(e.target.value));
  $('loop').addEventListener('click',()=>{project.music.loop=!project.music.loop;$('loop').setAttribute('aria-pressed',project.music.loop);save();});
  $('scene-form').addEventListener('submit',e=>{
    e.preventDefault();const draft=E.clone(project),s=draft.scenes.find(s=>s.id===selected);
    Object.assign(s,{text:$('scene-text').value,subtext:$('scene-subtext').value,startSec:Number($('scene-start').value),endSec:Number($('scene-end').value),character:$('scene-character').value||null,phase:$('scene-phase').value,effect:$('scene-effect').value,accent:$('scene-accent').value,needsVerification:!$('scene-verified').checked});
    draft.format.durationSec=Math.max(...draft.scenes.map(s=>s.endSec));
    const result=E.validate(draft);if(result.errors.length){$('scene-error').textContent=result.errors[0];return;}
    transport.pause();project=E.normalize(draft);rebuild();transport.seek(s.startSec);toast('已套用鏡頭。');
  });
  $('delete-scene').addEventListener('click',()=>{if(project.scenes.length<=1)return;const index=project.scenes.findIndex(s=>s.id===selected);transport.pause();project.scenes.splice(index,1);selected=project.scenes[Math.min(index,project.scenes.length-1)].id;rebuild();toast('已刪除鏡頭；原區間保留為留白，可用入出點補齊。');});
  $('add-scene').addEventListener('click',()=>{
    if(project.scenes.length>=200)return toast('最多 200 個鏡頭。');transport.pause();
    const d=E.duration(project),id='shot-'+Date.now().toString(36);project.scenes.push({id,startSec:d,endSec:d+2,character:'luyang',phase:'epic',text:'新的戰績',subtext:'請填入已核實的具體事件。',effect:'sword-origin',accent:'#9ecbdc',needsVerification:true,sourceNote:'新鏡頭，原作細節待核對。'});project.format.durationSec=d+2;selected=id;rebuild();transport.seek(d);
  });
  $('music-offset').addEventListener('input',e=>{
    const n=Number(e.target.value);if(!Number.isFinite(n)||n<0){e.target.value=project.music.musicOffsetSec;return toast('音樂起播秒數不得小於 0。');}
    const t=transport.time();transport.pause();project.music.musicOffsetSec=n;transport.seek(t);drawWave();save();if(audioReady&&n>=audio.duration)toast('起播位置超出音檔，這個區間將無聲預覽。');
  });
  $('drop-time').addEventListener('change',e=>applyDrop(e.target.value));
  $('drop-time').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();applyDrop(e.target.value);}});
  $('apply-drop').addEventListener('click',()=>applyDrop($('drop-time').value));
  $('volume').addEventListener('input',e=>{project.music.volume=Number(e.target.value);audio.volume=project.music.volume;$('volume-value').textContent=Math.round(project.music.volume*100)+'%';save();});
  $('audio-file').addEventListener('change',e=>loadAudio(e.target.files[0]));$('remove-audio').addEventListener('click',()=>removeAudio());
  $('add-beat').addEventListener('click',addBeat);$('clear-beats').addEventListener('click',()=>{project.beats=[];renderTimeline();save();});
  $('capture').addEventListener('click',()=>setCapture(true));$('exit-capture').addEventListener('click',()=>setCapture(false));
  $('fullscreen').addEventListener('click',async()=>{setCapture(true);try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen();}catch{toast('此瀏覽器不支援全螢幕，已開啟乾淨錄屏模式。');}});
  $('help-open').addEventListener('click',()=>{$('help-dialog').showModal();});$('help-close').addEventListener('click',()=>$('help-dialog').close());
  $('export-project').addEventListener('click',()=>{
    const blob=new Blob([JSON.stringify(project,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='who-let-him-cultivate-edit.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('已匯出分鏡，音檔不包含在內。');
  });
  $('import-project').addEventListener('change',async e=>{
    const file=e.target.files[0];if(!file)return;
    try{if(file.size>1000000)throw new Error('分鏡 JSON 上限為 1 MB。');const draft=E.normalize(JSON.parse(await file.text()));transport.pause();project=draft;selected=project.scenes[0].id;syncSettings();rebuild();transport.seek(0);toast('已匯入分鏡。');}
    catch(error){toast('匯入失敗：'+error.message);}finally{e.target.value='';}
  });
  $('reset-project').addEventListener('click',()=>{
    if(!confirm('要還原示範分鏡嗎？目前的字幕、時碼與節拍標記將被取代；可先匯出 JSON。'))return;
    transport.pause();project=E.normalize(window.DEFAULT_PROJECT);selected=project.scenes[0].id;syncSettings();rebuild();transport.seek(0);toast('已還原示範。');
  });
  function timelineTime(event){const rect=$('timeline').getBoundingClientRect();return E.clamp((event.clientX-rect.left)/rect.width*E.duration(project),0,E.duration(project));}
  $('timeline').addEventListener('pointerdown',e=>{
    if(e.button!==0)return;transport.pause();dragMode=e.target.closest('#drop-marker')?'drop':'seek';$('timeline').setPointerCapture(e.pointerId);
    if(dragMode==='seek'){const shot=e.target.closest('.timeline-shot');if(shot)selectScene(shot.dataset.id);transport.seek(timelineTime(e));}
    else $('drop-marker').style.left=timelineTime(e)/E.duration(project)*100+'%';
  });
  $('timeline').addEventListener('pointermove',e=>{if(!dragMode)return;if(dragMode==='seek')transport.seek(timelineTime(e));else{$('drop-marker').style.left=timelineTime(e)/E.duration(project)*100+'%';$('drop-time').value=timelineTime(e).toFixed(2);}});
  $('timeline').addEventListener('pointerup',e=>{if(!dragMode)return;if(dragMode==='drop')applyDrop(timelineTime(e));dragMode=null;if($('timeline').hasPointerCapture(e.pointerId))$('timeline').releasePointerCapture(e.pointerId);});
  $('timeline').addEventListener('pointercancel',()=>{dragMode=null;renderTimeline();});
  document.addEventListener('keydown',e=>{
    if($('help-dialog').open)return;
    if(e.target.closest('input,textarea,select,[contenteditable=true]'))return;
    if(e.code==='Space'){e.preventDefault();transport.toggle();}
    else if(e.key==='ArrowRight'){e.preventDefault();jumpScene(1);}
    else if(e.key==='ArrowLeft'){e.preventDefault();jumpScene(-1);}
    else if(e.key.toLowerCase()==='r')restart();
    else if(e.key.toLowerCase()==='m')addBeat();
    else if(e.key.toLowerCase()==='h')setCapture(!document.body.classList.contains('capture'));
    else if(e.key==='Escape'){setCapture(false);if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});}
  });
  // Leave the screen completely clean once the pointer stops moving.
  let cleanTimer;
  document.addEventListener('pointermove',()=>{if(!document.body.classList.contains('capture'))return;document.body.classList.remove('clean');clearTimeout(cleanTimer);cleanTimer=setTimeout(()=>document.body.classList.add('clean'),1800);});
  window.addEventListener('pagehide',()=>{try{localStorage.setItem(STORAGE,JSON.stringify(project));}catch{}transport.pause();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&transport.playing)transport.pause();});
  function syncSettings(){$('music-offset').value=project.music.musicOffsetSec;$('volume').value=project.music.volume;audio.volume=project.music.volume;$('volume-value').textContent=Math.round(project.music.volume*100)+'%';$('loop').setAttribute('aria-pressed',project.music.loop);}
  function resizeFilm(){
    const holder=$('stage-holder'),unit=Math.min(holder.clientWidth/9,holder.clientHeight/16);
    $('film').style.width=(unit*9)+'px';$('film').style.height=(unit*16)+'px';
  }
  new ResizeObserver(resizeFilm).observe($('stage-holder'));
  EditArtwork.mount($('vector-stage'));syncSettings();$('save-status').textContent=lastSave;rebuild();resizeFilm();render(0,true);requestAnimationFrame(tick);
  // Read-only inspection hook for QA and future maintenance.
  window.EditStudio={get project(){return E.clone(project);},get time(){return transport.time();},get playing(){return transport.playing;},seek:t=>transport.seek(t)};
})();
