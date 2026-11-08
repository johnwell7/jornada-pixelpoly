import test from 'node:test';
import assert from 'node:assert/strict';
import {animateFullLamb} from '../dist/lamb-frames.js';

function setup(studying){
 const keys=['document','matchMedia','Image','requestAnimationFrame','cancelAnimationFrame'];
 const saved=Object.fromEntries(keys.map(k=>[k,globalThis[k]]));
 const document=new EventTarget();document.hidden=false;const media=new EventTarget();media.matches=false;
 let now=0,id=0;const jobs=new Map();const node={setAttribute(){}};
 const lamb={dataset:{},classList:{add(){}},querySelector:()=>node,closest:()=>null};
 Object.assign(globalThis,{document,matchMedia:()=>media,Image:class{set src(v){queueMicrotask(()=>this.onload());}},requestAnimationFrame:fn=>{jobs.set(++id,fn);return id;},cancelAnimationFrame:id=>jobs.delete(id)});
 const player=animateFullLamb(lamb,{studying,random:()=>.2});
 return {lamb,player,document,advance(ms){for(let i=0;i<ms;i+=10){now+=10;const callbacks=[...jobs.values()];jobs.clear();callbacks.forEach(fn=>fn(now));}},close(){player.dispose();Object.assign(globalThis,saved);}};
}
test('lobby sleeps after 30 seconds, wakes after five seconds and gets a fresh awake interval',async()=>{
 const e=setup(false);try{
  await new Promise(r=>setImmediate(r));e.advance(29900);assert.equal(e.lamb.dataset.bpState,'awake');
  e.advance(1800);assert.equal(e.lamb.dataset.bpState,'sleeping');
  e.advance(2600);assert.equal(e.lamb.dataset.bpState,'sleeping');
  e.advance(2400);assert.equal(e.lamb.dataset.bpState,'awake');
  e.advance(20000);assert.equal(e.lamb.dataset.bpState,'awake');
 }finally{e.close();}
});
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
