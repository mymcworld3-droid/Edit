const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const E=require('../engine.js');
const sandbox={window:{}};
vm.runInNewContext(fs.readFileSync(require.resolve('../scenes.js'),'utf8'),sandbox);
const original=E.normalize(sandbox.window.DEFAULT_PROJECT);

test('the supplied film has a complete, ordered 35 second timeline',()=>{
  assert.equal(E.duration(original),35);
  const result=E.validate(original);assert.deepEqual(result.errors,[]);
  assert.equal(result.warnings.filter(w=>w.includes('留白')).length,0);
  assert.ok(original.scenes.filter(s=>s.phase==='fun').length>=4);
  assert.ok(original.scenes.filter(s=>s.phase==='epic').length>=5);
});
test('seeking every boundary chooses the incoming scene; final endpoint holds',()=>{
  for(const s of original.scenes){assert.equal(E.sceneAt(original,s.startSec).id,s.id);assert.equal(E.sceneAt(original,(s.startSec+s.endSec)/2).id,s.id);}
  assert.equal(E.sceneAt(original,35).id,'final');assert.equal(E.sceneAt(original,-.1),null);
});
test('reverse seeking has no history and identical results',()=>{
  const times=[30.2,7.9,22.9,1.8,34,14.5,0,16,35,5];
  const a=times.map(t=>[E.sceneAt(original,t).id,E.progress(E.sceneAt(original,t),t)]);
  assert.deepEqual(times.toReversed().map(t=>[E.sceneAt(original,t).id,E.progress(E.sceneAt(original,t),t)]).toReversed(),a);
});
test('Drop retiming preserves continuity, total duration, and the climax boundary',()=>{
  const p=E.clone(original);p.beats=[0,8,16,25,35];
  for(const drop of [9,16.25,24]){
    const retimed=E.retimeDrop(p,drop);
    assert.equal(retimed.scenes.find(s=>s.id==='epic-1').startSec,drop);
    assert.equal(retimed.scenes.at(-1).endSec,35);assert.equal(retimed.beats[2],drop);
    assert.deepEqual(E.validate(retimed).errors,[]);
    assert.equal(E.validate(retimed).warnings.filter(w=>w.includes('留白')).length,0);
    for(let i=1;i<retimed.scenes.length;i++)assert.equal(retimed.scenes[i-1].endSec,retimed.scenes[i].startSec);
  }
  assert.equal(original.music.dropAtSec,16);
});
test('intentional gaps render as gaps and overlap is rejected',()=>{
  const p=E.clone(original);p.scenes[1].startSec=1.2;
  assert.equal(E.sceneAt(p,1.1),null);assert.ok(E.validate(p).warnings.some(w=>w.includes('留白')));
  p.scenes[1].startSec=.5;assert.ok(E.validate(p).errors.some(w=>w.includes('重疊')));
});
test('invalid and hostile imported effect/color/character data is rejected',()=>{
  for(const change of [{effect:'<script>'},{accent:'red;url(x)'},{character:'unknown'},{endSec:0},{startSec:NaN}]){
    const p=E.clone(original);Object.assign(p.scenes[0],change);assert.ok(E.validate(p).errors.length);
  }
  assert.throws(()=>E.normalize({scenes:[]}));
  const p=E.clone(original);p.scenes[1].id=p.scenes[0].id;assert.throws(()=>E.normalize(p));
});
test('retiming rejects endpoints, NaN, and out-of-range values',()=>{
  for(const drop of [0,.1,35,40,NaN])assert.throws(()=>E.retimeDrop(original,drop));
});
test('all novel claims remain transparently marked as editorial drafts',()=>{
  for(const s of original.scenes.filter(s=>['realm','fun','epic'].includes(s.phase)))assert.equal(s.needsVerification,true,s.id);
});
