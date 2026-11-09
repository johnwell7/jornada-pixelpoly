import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {lambFrames} from '../dist/lamb-frames-data.js';
import {animateFullLamb,returnToNeutral,actionFrames,sampleBreath} from '../dist/lamb-frames.js';
import {bitpolyLamb,bitpolyShadow} from '../dist/bitpoly-art.js';

test('complete frames and all atlas windows are in bounds',()=>{
 assert.equal(lambFrames.frames.length,117);
 for(const f of lambFrames.frames){const p=lambFrames.pages[f.page];assert.ok(f.x+256<=p.width&&f.y+286<=p.height);assert.ok(existsSync(new URL('../dist/'+p.src,import.meta.url)));}
 for(const clip of Object.values(lambFrames.clips))for(const i of clip)assert.ok(lambFrames.frames[i]);
});
test('breathing loop and every reaction reach neutral with contiguous authored poses',()=>{
 const seen=new Set();for(let ms=0;ms<10000;ms+=5){const i=sampleBreath(ms);seen.add(i);assert.ok(i>=0&&i<32);}
 assert.equal(seen.size,32);
 for(const name of ['blink','left','right','pet']){const seq=actionFrames(name);assert.equal(seq.at(-1),0);assert.deepEqual(seq.slice(0,-1),seq.slice(0,-1).reverse());}
 for(let i=0;i<lambFrames.frames.length;i++){const route=returnToNeutral(i);assert.equal(route[0],i);assert.equal(route.at(-1),0);assert.ok(route.every(n=>lambFrames.frames[n]));}
});
test('default lamb has no moving cutouts, preserved book/equipment, independent contact shadow',()=>{
 const art=bitpolyLamb({equipped:true,tag:true,studying:true});
 assert.ok(art.includes('data-lamb-frame-viewport'));assert.ok(!art.includes('<mask'));assert.ok(!art.includes('data-bp-part'));
 assert.ok(art.includes('liahona-inventory.png'));assert.ok(art.includes('missionary-tag-inventory.png'));assert.ok(art.includes('bp-reading-book'));
 const shadow=bitpolyShadow();assert.ok(shadow.includes('radialGradient'));assert.ok(!shadow.includes('<image'));assert.ok(!shadow.includes('matrix('));
});
test('actual rendered supporting region is byte-identical in all 81 frames',()=>{
 const report=JSON.parse(readFileSync(new URL('../qa/pixel-check.json',import.meta.url)));
 assert.equal(report.max_changed_ground_channels,0);assert.equal(report.frames,81);assert.ok(report.decoded_bytes<25*1024*1024);
});

test('new breathing, listening and alert frames keep the ground region unchanged',()=>{
 const report=JSON.parse(readFileSync(new URL('../qa/motion-ground.json',import.meta.url)));
 assert.equal(report.frames,68);assert.equal(report.changed_ground_channels,0);assert.equal(report.max_ground_delta,0);
 for(const kind of ['listenLeft','listenRight','perk'])assert.equal(lambFrames.clips[kind].length,12);
});

function environment(){
 const keys=['document','matchMedia','Image','requestAnimationFrame','cancelAnimationFrame'];const saved=Object.fromEntries(keys.map(k=>[k,globalThis[k]]));
 const media=new EventTarget();media.matches=false;const document=new EventTarget();document.hidden=false;
 let id=0,time=0,inert=false;const jobs=new Map(),writes=[];const listeners=new Set();
 const add=document.addEventListener.bind(document),del=document.removeEventListener.bind(document);
 document.addEventListener=(type,fn,...args)=>{listeners.add(fn);add(type,fn,...args);};document.removeEventListener=(type,fn)=>{listeners.delete(fn);del(type,fn);};
 const node=()=>({setAttribute(k,v){assert.notEqual(k,'transform');writes.push([k,v]);},attrs:{}});
 const viewport=node(),picture=node();const lamb={dataset:{},classList:{add(){}},querySelector:q=>q.includes('viewport')?viewport:picture,closest:()=>inert?{}:null,getBoundingClientRect:()=>({left:0,right:200,top:0,bottom:240})};
 Object.assign(globalThis,{document,matchMedia:()=>media,Image:class{set src(v){queueMicrotask(()=>this.onload());}},requestAnimationFrame:fn=>{jobs.set(++id,fn);return id;},cancelAnimationFrame:i=>jobs.delete(i)});
 return {lamb,media,document,jobs,writes,listeners,setInert:v=>inert=v,step(ms=1000/60){time+=ms;const callbacks=[...jobs.values()];jobs.clear();callbacks.forEach(f=>f(time));},restore(){Object.assign(globalThis,saved);}};
}

test('full player handles loading, repeated petting, all four actions, pauses and reduced motion',async()=>{
 const e=environment();try{
  const player=animateFullLamb(e.lamb,{random:()=>.2});await new Promise(resolve=>setImmediate(resolve));assert.equal(e.lamb.dataset.framesReady,'true');
  const visited=new Set();for(let n=0;n<500;n++){e.step();visited.add(+e.lamb.dataset.frame);}
  assert.ok(visited.has(31));assert.ok(visited.has(36));
  for(const kind of ['left','right','pet','blink']){
   player.play(kind);for(let n=0;n<220;n++){e.step();visited.add(+e.lamb.dataset.frame);}
  }
  assert.ok(visited.has(50));assert.ok(visited.has(64));assert.ok(visited.has(80));
  player.pet();for(let n=0;n<120;n++){player.pet();e.step();assert.ok(+e.lamb.dataset.frame<lambFrames.frames.length);}
  e.setInert(true);const held=e.lamb.dataset.frame;for(let n=0;n<180;n++)e.step();assert.equal(e.lamb.dataset.frame,held);e.setInert(false);
  e.document.hidden=true;e.document.dispatchEvent(new Event('visibilitychange'));assert.equal(e.jobs.size,0);
  e.document.hidden=false;e.document.dispatchEvent(new Event('visibilitychange'));assert.equal(e.jobs.size,1);
  e.media.matches=true;e.media.dispatchEvent(new Event('change'));assert.equal(e.lamb.dataset.frame,'0');assert.equal(e.jobs.size,0);player.pet();assert.equal(e.lamb.dataset.frame,'0');
  e.media.matches=false;e.media.dispatchEvent(new Event('change'));assert.equal(e.jobs.size,1);
  // Switching complete sprites must never shift or resize the sampling rectangle.
  for(const [attribute,expected] of [['x',110],['y',0],['width',1085],['height',1210]]){
   const values=e.writes.filter(([name])=>name===attribute).map(([,value])=>Number(value));
   assert.equal(values.length,1);assert.ok(values.every(v=>v===expected),attribute+' changed during playback');
  }
  player.dispose();assert.equal(e.jobs.size,0);assert.equal(e.listeners.size,0);
 }finally{e.restore();}
});

