import test from 'node:test';
import assert from 'node:assert/strict';
import {animateFullLamb, PRIESTLY_OUTFIT, TUNIC_OUTFIT, DAVID_OUTFIT, frameManifestFor} from '../dist/lamb-frames.js';
import {artifacts} from '../dist/artifacts.js';
import {bitpolyLamb} from '../dist/bitpoly-art.js';
import {existsSync} from 'node:fs';

function setup(studying, outfit){
 const keys=['document','matchMedia','Image','requestAnimationFrame','cancelAnimationFrame'];
 const saved=Object.fromEntries(keys.map(k=>[k,globalThis[k]]));
 const document=new EventTarget();document.hidden=false;const media=new EventTarget();media.matches=false;
 let now=0,id=0;const jobs=new Map(),sources=new Set();
 const node={dataset:{lambOutfit:outfit},setAttribute(name,value){if(name==='href')sources.add(value);}};
 const lamb={dataset:{},classList:{add(){}},querySelector:()=>node,closest:()=>null};
 Object.assign(globalThis,{document,matchMedia:()=>media,Image:class{set src(v){queueMicrotask(()=>this.onload());}},requestAnimationFrame:fn=>{jobs.set(++id,fn);return id;},cancelAnimationFrame:id=>jobs.delete(id)});
 const player=animateFullLamb(lamb,{studying,random:()=>.2});
 return {lamb,player,document,sources,advance(ms){for(let i=0;i<ms;i+=10){now+=10;const callbacks=[...jobs.values()];jobs.clear();callbacks.forEach(fn=>fn(now));}},close(){player.dispose();Object.assign(globalThis,saved);}};
}
test('lobby sleeps after 20 seconds, wakes after five seconds and gets a fresh awake interval',async()=>{
 const e=setup(false);try{
  await new Promise(r=>setImmediate(r));e.advance(19900);assert.equal(e.lamb.dataset.bpState,'awake');
  e.advance(1800);assert.equal(e.lamb.dataset.bpState,'sleeping');
  e.advance(2600);assert.equal(e.lamb.dataset.bpState,'sleeping');
  e.advance(2400);assert.equal(e.lamb.dataset.bpState,'awake');
  e.advance(12000);assert.equal(e.lamb.dataset.bpState,'awake');
 }finally{e.close();}
});

for (const [outfit, directory] of [[PRIESTLY_OUTFIT, 'priestly'], [TUNIC_OUTFIT, 'tunic'], [DAVID_OUTFIT, 'david']]) {
test(`${outfit} uses full frames throughout lobby and reading playback`,async()=>{
 const manifest=frameManifestFor(outfit);
 const home=bitpolyLamb({outfit,equipped:true,tag:true});
 const reader=bitpolyLamb({outfit,studying:true});
 assert.ok(home.includes(`data-lamb-outfit="${outfit}"`));
 assert.ok(reader.includes(`data-lamb-outfit="${outfit}"`));
 assert.match(home,/liahona-inventory\.png/);
 assert.match(home,/missionary-tag-inventory\.png/);
 assert.doesNotMatch(home,/<mask|skin-sleeve/);
 assert.match(reader,/bp-reading-book.*translate\(196 364\)/);
 const item=artifacts.find(artifact=>artifact.id===outfit);
 const portrait=`assets/bitpoly/${directory}/portrait.webp`;
 assert.equal(item.inventoryImage,portrait);
 assert.equal(item.presentation,portrait);
 assert.ok(existsSync(new URL('../dist/'+portrait,import.meta.url)));
 assert.equal(manifest.pages.length,117);
 for(const page of manifest.pages)assert.ok(existsSync(new URL('../dist/'+page.src,import.meta.url)),page.src);
 for(const studying of [false,true]){
  const e=setup(studying,outfit);
  try{
   await new Promise(r=>setImmediate(r));
   e.advance(10000);
   assert.ok(e.sources.has(manifest.pages[manifest.clips.breath.at(-1)].src));
   e.player.pet();e.advance(2500);
   assert.ok(e.sources.has(manifest.pages[manifest.clips.pet.at(-1)].src));
   e.advance(studying?15500:21500);
   assert.equal(e.lamb.dataset.bpState,'sleeping');
   e.document.dispatchEvent(new Event('pointerdown'));e.advance(1500);
   assert.equal(e.lamb.dataset.bpState,'awake');
   assert.ok(e.sources.has(manifest.pages[manifest.clips.perk.at(-1)].src));
   assert.ok([...e.sources].every(src=>src.startsWith(`assets/bitpoly/${directory}/`)));
  }finally{e.close();}
 }
});
}
test('reading sleeps after 14 seconds, stays asleep and wakes on screen interaction',async()=>{
 const e=setup(true);try{
  await new Promise(r=>setImmediate(r));e.advance(13900);assert.equal(e.lamb.dataset.bpState,'awake');
  e.advance(2000);assert.equal(e.lamb.dataset.bpState,'sleeping');
  e.advance(60000);assert.equal(e.lamb.dataset.bpState,'sleeping');
  e.document.dispatchEvent(new Event('pointerdown'));e.advance(1200);assert.equal(e.lamb.dataset.bpState,'awake');
  e.advance(11000);assert.equal(e.lamb.dataset.bpState,'awake');
  e.advance(4000);assert.equal(e.lamb.dataset.bpState,'sleeping');
 }finally{e.close();}
});
