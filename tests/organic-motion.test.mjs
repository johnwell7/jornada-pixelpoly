import test from 'node:test';
import assert from 'node:assert/strict';
import {createPlantWindTracks} from '../dist/bitpoly-motion.js';
import {randomEarReaction} from '../dist/lamb-frames.js';

function seeded(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};}
const plants=[{kind:'vine',joints:4},{kind:'shelf',joints:5},{kind:'floor',joints:4}];

test('ear choices vary independently in side, amplitude, speed and pause without forced alternation',()=>{
 const random=seeded(17),events=Array.from({length:100},()=>randomEarReaction(random));
 assert.equal(new Set(events.map(e=>e.side)).size,2);
 assert.ok(events.some((e,i)=>i>0&&e.side===events[i-1].side));
 for(const key of ['depth','fps','hold'])assert.ok(new Set(events.map(e=>e[key])).size>50);
 for(const e of events){assert.ok(e.depth>=.55&&e.depth<=1);assert.ok(e.fps>=24&&e.fps<=48);assert.ok(e.hold>=40&&e.hold<=360);}
});

test('independent plant gusts include rest, stagger their starts and never move all three plants together',()=>{
 const wind=createPlantWindTracks(plants,{random:seeded(42)}),starts=[[],[],[]],previous=[false,false,false];
 let maxChange=0;let previousAngles=null;
 for(let t=0;t<180000;t+=20){
  const poses=wind.step(20),moving=poses.map(a=>a.some(v=>Math.abs(v)>.000001));
  assert.ok(moving.filter(Boolean).length<=2);
  moving.forEach((on,i)=>{if(on&&!previous[i])starts[i].push(t);previous[i]=on;});
  poses.forEach((angles,i)=>angles.forEach((a,j)=>{
   assert.ok(Number.isFinite(a)&&Math.abs(a)<=[1.9,2.45,3.2][i]);
   if(previousAngles)maxChange=Math.max(maxChange,Math.abs(a-previousAngles[i][j]));
  }));previousAngles=poses;
 }
 assert.ok(starts.every(s=>s.length>=5));
 for(const s of starts){const intervals=s.slice(1).map((t,i)=>t-s[i]);assert.ok(new Set(intervals).size>2);}
 const allStarts=starts.flat();assert.equal(new Set(allStarts).size,allStarts.length);
 assert.ok(maxChange<.1,'gusts must enter and leave smoothly');
});

test('separate runs do not reuse one shared wind cycle, including plants of the same kind',()=>{
 const a=createPlantWindTracks([{kind:'vine',joints:3},{kind:'vine',joints:3}],{random:seeded(5)});
 const b=createPlantWindTracks([{kind:'vine',joints:3},{kind:'vine',joints:3}],{random:seeded(6)});
 let differentRun=false,differentPlants=false;
 for(let t=0;t<60000;t+=50){const aa=a.step(50),bb=b.step(50);differentRun ||= JSON.stringify(aa)!==JSON.stringify(bb);differentPlants ||= aa[0][0]!==aa[1][0];}
 assert.ok(differentRun&&differentPlants);
});
