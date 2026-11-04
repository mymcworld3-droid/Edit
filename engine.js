/* Pure timeline operations. Kept separate so seeking / retiming can be verified without a browser. */
(function (root) {
  'use strict';
  const PHASES = ['intro', 'realm', 'fun', 'break', 'epic', 'final'];
  const EFFECTS = {
    'ink-reveal': '古籍開卷', 'blue-sword-draw': '青鋒出鞘', 'gold-halo-draw': '不朽神環',
    'white-sleeve': '月白垂袖', 'sigil-pop': '喚醒古仙', 'seal-print': '天庭印章',
    'fire-sign': '燒烤招牌', 'small-halo': '靈台寄居', 'smoke-flare': '仙廚雷雲',
    'shrink-seal': '封印師父', 'freeze-chaos': '天地停滯', 'silence-dark': '抽黑轉折',
    'sword-origin': '萬劍歸源', 'dual-timeline': '雙時間線', 'stars-box': '四仙封天',
    'dual-shadow': '不朽與寂滅', 'one-hand-freeze': '抬手鎮仙', 'cosmic-dao': '大道巨環',
    'trio-title-reveal': '三人終章'
  };
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const clone = x => JSON.parse(JSON.stringify(x));
  function duration(project) { return Number(project.format.durationSec); }
  function sceneAt(project, time) {
    // Half-open intervals; an intentional gap has no scene, the final endpoint holds the last shot.
    const scenes = project.scenes;
    return scenes.find(s => time >= s.startSec && time < s.endSec) ||
      (time === duration(project) ? scenes.find(s => s.endSec === time) : null) || null;
  }
  function progress(scene, t) { return clamp((t - scene.startSec) / (scene.endSec - scene.startSec), 0, 1); }
  function validate(project) {
    const errors = [], warnings = [];
    if (!project || typeof project !== 'object' || !Array.isArray(project.scenes)) return { errors: ['缺少 scenes 分鏡陣列。'], warnings };
    const d = Number(project.format?.durationSec);
    if (!Number.isFinite(d) || d <= 0 || d > 3600) errors.push('作品長度必須介於 0 與 3600 秒。');
    if (!project.scenes.length || project.scenes.length > 200) errors.push('分鏡數量必須介於 1 與 200。');
    const ids = new Set();
    for (const s of project.scenes) {
      if (!s || typeof s !== 'object') { errors.push('分鏡格式錯誤。'); continue; }
      if (typeof s.id !== 'string' || !s.id || ids.has(s.id)) errors.push('每個鏡頭必須有不重複的 id。');
      ids.add(s.id);
      if (!Number.isFinite(s.startSec) || !Number.isFinite(s.endSec) || s.startSec < 0 || s.endSec <= s.startSec) errors.push(`${s.id}：出點須大於入點，且入點不得小於 0。`);
      if (s.endSec > d + 0.0001) errors.push(`${s.id}：超出作品總長。`);
      if (typeof s.text !== 'string' || s.text.length > 200) errors.push(`${s.id}：字幕須為 200 字以內文字。`);
      if (s.subtext !== undefined && (typeof s.subtext !== 'string' || s.subtext.length > 200)) errors.push(`${s.id}：補充字幕格式錯誤。`);
      if (!PHASES.includes(s.phase)) errors.push(`${s.id}：未知段落。`);
      if (![null, '', 'luyang', 'huang', 'yunzhi', 'trio'].includes(s.character)) errors.push(`${s.id}：未知人物。`);
      if (!Object.hasOwn(EFFECTS, s.effect)) errors.push(`${s.id}：未知效果。`);
      if (s.accent !== undefined && !/^#[0-9a-fA-F]{6}$/.test(s.accent)) errors.push(`${s.id}：光色須為 #RRGGBB。`);
      if (s.needsVerification) warnings.push(`${s.id}：原作細節待核對`);
    }
    const sorted = [...project.scenes].filter(s => s && Number.isFinite(s.startSec)).sort((a,b) => a.startSec - b.startSec);
    let edge = 0;
    for (const s of sorted) {
      if (s.startSec < edge - .0001) errors.push(`${s.id}：與前幕重疊。`);
      if (s.startSec > edge + .0001) warnings.push(`${edge.toFixed(2)}–${s.startSec.toFixed(2)} 秒留白`);
      edge = Math.max(edge, s.endSec);
    }
    if (Number.isFinite(d) && edge < d - .0001) warnings.push(`${edge.toFixed(2)}–${d.toFixed(2)} 秒留白`);
    if (!Number.isFinite(project.music?.musicOffsetSec) || project.music.musicOffsetSec < 0) errors.push('音樂起播秒數不得小於 0。');
    if (!Number.isFinite(project.music?.dropAtSec) || project.music.dropAtSec <= 0 || project.music.dropAtSec >= d) errors.push('Drop 須位於作品範圍內。');
    if (project.beats !== undefined && (!Array.isArray(project.beats) || project.beats.length > 1000 || project.beats.some(b=>!Number.isFinite(b)||b<0||b>d))) errors.push('節拍標記須位於作品範圍內，且不得超過 1000 個。');
    return { errors, warnings };
  }
  function normalize(input) {
    const p = clone(input);
    // Strip unrelated keys before persisting an imported project.
    p.music = { name: String(p.music?.name || 'Wannabe'), artist: String(p.music?.artist || 'why mona'), musicOffsetSec: p.music?.musicOffsetSec, dropAtSec: p.music?.dropAtSec, volume: clamp(Number(p.music?.volume ?? .75), 0, 1), loop: Boolean(p.music?.loop) };
    if (!Number.isFinite(p.music.volume)) p.music.volume = .75;
    p.beats = p.beats || [];
    const result = validate(p);
    if (result.errors.length) throw new Error(result.errors.join('\n'));
    p.scenes.sort((a,b)=>a.startSec-b.startSec);
    return p;
  }
  function retimeDrop(project, newDrop) {
    const p = clone(project), old = p.music.dropAtSec, d = duration(p);
    if (!Number.isFinite(newDrop) || newDrop <= .1 || newDrop >= d - .1) throw new Error('Drop 必須介於 0.1 秒與作品結束前 0.1 秒。');
    const map = t => t <= old ? t * newDrop / old : newDrop + (t-old) * (d-newDrop) / (d-old);
    for (const s of p.scenes) { s.startSec = map(s.startSec); s.endSec = map(s.endSec); }
    p.beats = p.beats.map(map); p.music.dropAtSec = newDrop;
    return p;
  }
  const api = { PHASES, EFFECTS, clamp, clone, duration, sceneAt, progress, validate, normalize, retimeDrop };
  root.EditEngine = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
