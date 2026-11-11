import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {aliveFrames} from '../dist/sheep-alive-data.js';
import {animateSheepAlive, tapBurst} from '../dist/sheep-alive.js';

const outfits={base:null,priestly:'vestes-sacerdotais',tunic:'tunica-de-jose',david:'pequeno-pastor-de-davi'};

test('every available skin has an original and complete atlas for every behavior',()=>{
 const hashes=new Set();
 const expected=['neutral','curious','playful','annoyed','yawn','settle','doze','sleeping','wake','talking','content','nuzzle'];
 assert.deepEqual(Object.keys(aliveFrames),Object.keys(outfits));
 for(const [skin,clips] of Object.entries(aliveFrames)) {
  assert.deepEqual(Object.keys(clips),expected);
  for(const [name,clip] of Object.entries(clips)) {
   assert.match(clip.src,new RegExp(`/${skin}-${name}\\.webp$`));
   assert.ok(clip.count>12&&clip.width<=4096&&clip.height<=4096);
   assert.ok(clip.columns*256===clip.width&&Math.ceil(clip.count/clip.columns)*286===clip.height);
   const bytes=readFileSync(new URL('../dist/'+clip.src,import.meta.url));
   const hash=createHash('sha256').update(bytes).digest('hex');
   assert.ok(!hashes.has(hash),clip.src);hashes.add(hash);
  }
 }
});

test('only three recent taps trigger annoyance; drag reset and cooldown block repeat',()=>{
 const burst=tapBurst();
 for(const t of [0,100,2300,2450])assert.equal(burst.add(t),false);
 assert.equal(burst.add(2600),true);
 for(const t of [2700,2900,3000,9000])assert.equal(burst.add(t),false);
 assert.equal(burst.add(9600),false);assert.equal(burst.add(9700),false);
 burst.reset();assert.equal(burst.add(9800),false);
});

function setup(outfit){
 const keys=['document','matchMedia','Image','requestAnimationFrame','cancelAnimationFrame'];
 const previous=Object.fromEntries(keys.map(k=>[k,globalThis[k]]));
 const document=new EventTarget(),media=new EventTarget();document.hidden=false;media.matches=false;
 let now=0,id=0;const jobs=new Map(), cues=[], samples=[];
 const sprite={setAttribute(){}};
 const lamb=Object.assign(new EventTarget(),{dataset:{},classList:{add(){}},querySelector:()=>sprite,closest:()=>null});
 lamb.addEventListener('jornada-lamb-cue',e=>cues.push(e.detail));
 Object.assign(globalThis,{document,matchMedia:()=>media,
  Image:class {set src(v){queueMicrotask(()=>this.onload());}},
  requestAnimationFrame:fn=>{jobs.set(++id,fn);return id;},cancelAnimationFrame:id=>jobs.delete(id)});
 const player=animateSheepAlive(lamb,{outfit,random:()=>.6,now:()=>now});
 return {player,lamb,cues,samples,document,media,async advance(ms){
  for(let i=0;i<ms;i+=20){now+=20;const callbacks=[...jobs.values()];jobs.clear();callbacks.forEach(fn=>fn(now));samples.push(lamb.dataset.frame);
   if(i%200===0)await new Promise(r=>setImmediate(r));}
 },close(){player.dispose();Object.assign(globalThis,previous);}};
}

for(const [skin,outfit] of Object.entries(outfits))test(`${skin} runs repeated tap, affection, idle actions, sleep and wake`,async()=>{
 const e=setup(outfit);
 try {
  await e.advance(500);
  for(let i=0;i<3;i++){e.player.tap();await e.advance(120);}
  await e.advance(800);assert.ok(e.lamb.dataset.frame.startsWith('annoyed:'));
  assert.equal(e.cues.filter(c=>c==='annoyed').length,1);
  e.player.tap();await e.advance(1200);assert.equal(e.cues.filter(c=>c==='annoyed').length,1);
  e.player.pet(false);await e.advance(1300);assert.ok(e.lamb.dataset.frame.startsWith('content:'));
  await e.advance(2000);e.player.pet(false);await e.advance(1200);assert.ok(e.lamb.dataset.frame.startsWith('nuzzle:'));
  await e.advance(38500);
  assert.ok(e.samples.some(f=>f?.startsWith('doze:')));
  assert.ok(e.samples.some(f=>f?.startsWith('sleeping:')));
  e.document.dispatchEvent(new Event('pointerdown'));await e.advance(2500);
  assert.ok(e.samples.some(f=>f?.startsWith('wake:')));
  assert.equal(e.lamb.dataset.bpState,'awake');
  e.media.matches=true;e.media.dispatchEvent(new Event('change'));
  e.player.tap();await e.advance(1000);assert.equal(e.lamb.dataset.frame,'neutral:0');
 } finally {e.close();}
});
