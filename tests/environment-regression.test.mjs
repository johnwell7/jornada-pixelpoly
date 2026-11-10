import test from 'node:test';
import assert from 'node:assert/strict';
import {sampleLantern,animateBitpolyLantern,flameTimeline} from '../dist/bitpoly-lantern.js';
import {readFileSync,existsSync} from 'node:fs';
import {bitpolyLamb,bitpolyPlants,bitpolyAssets,flameFrames} from '../dist/bitpoly-art.js';
import {sampleBitpolyPose,samplePlantJoint,BITPOLY_IDLE_MS,animateBitpolyLamb,animateBitpolyPlants} from '../dist/bitpoly-motion.js';

test('new rig references unique clips and the exact supplied local textures',()=>{
  const drawing=bitpolyLamb({equipped:true,tag:true,studying:true})+bitpolyLamb()+bitpolyPlants();
  const ids=[...drawing.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(ids.length,new Set(ids).size);
  for(const m of drawing.matchAll(/url\(#([^\)]+)\)|href="#([^"]+)"/g))assert.ok(ids.includes(m[1]||m[2]),m[0]);
  for(const src of Object.values(bitpolyAssets))assert.ok(existsSync(new URL('../dist/'+src,import.meta.url)));
  assert.ok(drawing.includes('data-lamb-frame-viewport'));
  assert.ok(!drawing.includes('data-bp-part="foot'));
  assert.ok(!drawing.includes('data-bp-part="pot'));
  assert.ok(drawing.includes('bp-reading-book'));
});

test('anatomy remains bounded throughout greetings, affection, looking and sustained sleep',()=>{
  for(const action of ['','welcome-listen','welcome-peek','welcome-nod','welcome-perk','nuzzle','content','lean','curious','listen','glance','snuffle']){
    for(let t=0;t<30000;t+=67){
      const p=sampleBitpolyPose(t,{action,actionAge:t%1700,idle:t,gazeX:500,gazeY:-500});
      Object.values(p).forEach(n=>assert.ok(Number.isFinite(n)));
      assert.ok(Math.abs(p.headAngle)<5.2);
      assert.ok(p.torsoScale>=1&&p.torsoScale<=1.014);
      assert.ok(p.torsoY>=-1.61&&p.torsoY<=0);
      assert.ok(p.eyeScale>=.05&&p.eyeScale<=1.001);
      assert.ok(!('feetY' in p));
    }
  }
});

test('reading sleep closes eyes at 14s and interaction resets inactivity',()=>{
  assert.equal(BITPOLY_IDLE_MS,14000);
  assert.equal(sampleBitpolyPose(100,{idle:13000,studying:true}).eyeScale,1);
  assert.ok(sampleBitpolyPose(100,{idle:14000,studying:true}).eyeScale<.07);
  for(const idle of [19000,60000,3600000])assert.ok(sampleBitpolyPose(idle,{idle,studying:true}).eyeScale<.07);
  assert.equal(sampleBitpolyPose(60000,{idle:0}).eyeScale,1);
});

test('reduced motion holds all parts at rest, including wind and sleep',()=>{
  assert.deepEqual(sampleBitpolyPose(45900,{idle:45000,action:'nuzzle',actionAge:800,reduced:true}),sampleBitpolyPose(0,{reduced:true}));
  for(const kind of ['vine','shelf','floor'])assert.equal(samplePlantJoint(8000,2,kind,true),0);
});

test('wind joints have different phases and stay within modest angular limits',()=>{
  for(const kind of ['vine','shelf','floor']){
    for(let t=0;t<60000;t+=100){
      for(let i=0;i<5;i++)assert.ok(Math.abs(samplePlantJoint(t,i,kind))<=2.8);
    }
    assert.notEqual(samplePlantJoint(7000,0,kind),samplePlantJoint(7000,1,kind));
  }
});

function environment(reduced=false){
  const previous={};for(const key of ['document','matchMedia','requestAnimationFrame','cancelAnimationFrame','performance','sessionStorage'])previous[key]=globalThis[key];
  let now=0,id=0;const frames=new Map(),listeners=new Map(),media=new EventTarget();media.matches=reduced;
  const document=new EventTarget();document.hidden=false;
  const add=document.addEventListener.bind(document),remove=document.removeEventListener.bind(document);
  document.addEventListener=(type,fn,...args)=>{if(!listeners.has(type))listeners.set(type,new Set());listeners.get(type).add(fn);add(type,fn,...args);};
  document.removeEventListener=(type,fn)=>{listeners.get(type)?.delete(fn);remove(type,fn);};
  Object.assign(globalThis,{document,matchMedia:()=>media,performance:{now:()=>now},requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:id=>frames.delete(id),sessionStorage:{getItem:()=>null,setItem:()=>{}}});
  const node=(part,pivot='656 610')=>({dataset:{bpPart:part,pivot},attributes:{},setAttribute(k,v){this.attributes[k]=v;},removeAttribute(k){delete this.attributes[k];}});
  const parts=['torso','head','ear-left','ear-right','eye-left','eye-right','sleep-puff'].map(part=>node(part));
  const lamb={dataset:{},classList:{add(){}},querySelectorAll:()=>parts,querySelector:()=>null,closest:()=>null,getBoundingClientRect:()=>({left:10,top:10,width:300,height:300,right:310,bottom:310})};
  return {lamb,parts,document,frames,media,listeners,node,advance(t){now=t;const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn(t));},restore(){Object.assign(globalThis,previous);}};
}

test('retained legacy outfit controller sleeps, wakes by touch/keyboard, follows pointer, alternates greetings and disposes cleanly',()=>{
  const env=environment();try{
    const motion=animateBitpolyLamb(env.lamb,{studying:true,random:()=>.4});
    env.advance(20000);assert.equal(env.lamb.dataset.bpState,'sleeping');
    env.document.dispatchEvent(new Event('pointerdown'));env.advance(20100);assert.equal(env.lamb.dataset.bpState,'awake');
    env.document.dispatchEvent(Object.assign(new Event('pointermove'),{clientX:330,clientY:100}));env.advance(20200);
    assert.ok(env.parts.find(n=>n.dataset.bpPart==='eye-left').attributes.transform.includes('12.00'));
    motion.greet();const first=env.parts.find(n=>n.dataset.bpPart==='head').attributes.transform;
    env.advance(20900);const greeting=env.parts.find(n=>n.dataset.bpPart==='head').attributes.transform;assert.notEqual(greeting,first);
    motion.pet();env.advance(21600);assert.equal(env.lamb.dataset.bpState,'awake');
    env.advance(40000);assert.equal(env.lamb.dataset.bpState,'sleeping');
    env.document.dispatchEvent(new Event('keydown'));env.advance(40100);assert.equal(env.lamb.dataset.bpState,'awake');
    motion.dispose();assert.equal(env.frames.size,0);assert.ok([...env.listeners.values()].every(s=>s.size===0));
  }finally{env.restore();}
});

test('outfit lobby follows the 20 second awake and five second sleep cycle',()=>{
  const env=environment();try{
    const motion=animateBitpolyLamb(env.lamb,{random:()=>.4});
    env.advance(19000);assert.equal(env.lamb.dataset.bpState,'awake');
    env.advance(21000);assert.equal(env.lamb.dataset.bpState,'sleeping');
    env.advance(24000);assert.equal(env.lamb.dataset.bpState,'sleeping');
    env.advance(25100);assert.equal(env.lamb.dataset.bpState,'awake');
    motion.dispose();
  }finally{env.restore();}
});

test('wind controller changes articulated regions, pauses for reduced motion and cleans listeners',()=>{
  const env=environment();try{
    const joints=[env.node('crown','445 35'),env.node('middle','424 586')];
    const stage={querySelectorAll:()=>[{dataset:{bpPlant:'vine'},querySelectorAll:()=>joints}],closest:()=>null};
    const motion=animateBitpolyPlants(stage,{random:()=>.2});for(let t=0;t<=5000;t+=50)env.advance(t);
    assert.notEqual(joints[0].attributes.transform,joints[1].attributes.transform);
    env.media.matches=true;env.media.dispatchEvent(new Event('change'));assert.equal(env.frames.size,0);assert.equal(joints[0].attributes.transform,undefined);
    motion.dispose();assert.ok([...env.listeners.values()].every(s=>s.size===0));
  }finally{env.restore();}
});

test('active app uses the new controllers and restarts them when changing outfits',()=>{
  const app=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
  assert.ok(!app.includes("from './sheep-motion.js'"));
  assert.ok(app.includes('plantMotion?.dispose()'));
  assert.ok(app.includes('sheepMotion = animateBitpolyLamb(world.querySelector'));
  assert.ok(app.includes('if (!state.outfit || hasAnimatedOutfit(state.outfit))'));
  assert.ok(app.includes('${bitpolyPlants()}'));
});

test('retained legacy outfit updates on consecutive display frames rather than a 12 fps interval',()=>{
  const env=environment();try{
    const motion=animateBitpolyLamb(env.lamb);
    env.advance(16);const first=env.parts.find(n=>n.dataset.bpPart==='head').attributes.transform;
    env.advance(32);const second=env.parts.find(n=>n.dataset.bpPart==='head').attributes.transform;
    assert.notEqual(first,second);motion.dispose();
  }finally{env.restore();}
});

test('the home lamb is laid out at final width without scaling its sprite',()=>{
  const css=readFileSync(new URL('../dist/style.css',import.meta.url),'utf8');
  const lamb=css.match(/\.sunset-home \.lamb \{([^}]+)\}/)?.[1];
  assert.match(lamb,/width: 65%/);
  assert.match(lamb,/width: round\(nearest, 65%, 1px\)/);
  assert.doesNotMatch(lamb,/transform:|scale\(/);
  for(const name of ['room-sunset.png','haven-portrait.png','room-pot.png','room-shelf-matte.png'])assert.ok(!css.includes(name));
  const motion=readFileSync(new URL('../dist/bitpoly-motion.js',import.meta.url),'utf8');
  assert.ok(!motion.includes('1000/12'));
});


test('flame variations stay small and reduced motion holds a stable light',()=>{
  for(let t=0;t<120000;t+=37){
    const p=sampleLantern(t);assert.ok(Math.abs(p.dx)<=3);assert.ok(Math.abs(p.angle)<=2.4);
    assert.ok(p.sy>=.935&&p.sy<=1.065);assert.ok(p.sx>=.965&&p.sx<=1.035);
    assert.ok(p.opacity>.88&&p.opacity<=1);assert.ok(p.halo>.10&&p.halo<.18);
  }
  assert.deepEqual(sampleLantern(0,true),sampleLantern(15000,true));
});

test('lantern has separate fixed artwork and a clipped flame, with old controller removed',()=>{
  const app=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
  const art=readFileSync(new URL('../dist/bitpoly-art.js',import.meta.url),'utf8');
  assert.ok(app.includes('${bitpolyLantern()}'));assert.ok(app.includes('${bitpolyShadow()}'));
  assert.ok(app.includes('lanternMotion?.dispose()'));
  assert.ok(!app.includes('function flicker()'));assert.ok(!app.includes('<div class="lantern-flame"'));
  assert.ok(art.includes('data-lantern-flame'));assert.ok(art.includes('bp-lantern-body'));
  assert.ok(art.includes('M556 548H691L741 879L692 975H538L492 881Z'));
});

test('flame controller updates independently, respects reduced motion and disposes',()=>{
  const env=environment();try{
    const flame=env.node('flame'),halo={style:{}},body=env.node('fixed-body');
    const images=Array.from({length:8},(_,i)=>env.node(String(i)));
    images.forEach((n,i)=>n.setAttribute('visibility',i===0?'visible':'hidden'));
    flame.querySelectorAll=()=>images;
    const stage={querySelector:sel=>sel==='[data-lantern-flame]'?flame:sel==='.bp-lantern-halo'?halo:body,closest:()=>null};
    const motion=animateBitpolyLantern(stage);env.advance(1000);
    assert.equal(flame.attributes.transform,undefined);assert.equal(body.attributes.transform,undefined);
    env.advance(1200);assert.equal(images.filter(n=>n.attributes.visibility==='visible').length,1);
    assert.equal(images[1].attributes.visibility,'visible');
    env.media.matches=true;env.media.dispatchEvent(new Event('change'));assert.equal(env.frames.size,0);
    motion.dispose();assert.ok([...env.listeners.values()].every(s=>s.size===0));
  }finally{env.restore();}
});

test('support point sits in the rug center and wind is stronger than V116',()=>{
  const ground=.496+.46*941/1671*1210/1085*(.33355+.65*273/286);
  assert.ok(ground>.76&&ground<.78);
  let max=0;for(let t=0;t<30000;t+=100)max=Math.max(max,Math.abs(samplePlantJoint(t,0,'floor')));
  assert.ok(max>2);assert.ok(max<2.8);
});


test('eight distinct frames share a fixed wick and preserve their aspect ratio',()=>{
  assert.equal(flameFrames.length,8);assert.equal(new Set(flameFrames.map(f=>f.src)).size,8);
  const bottoms=[923,926,891,927,923,871,925,912];
  flameFrames.forEach((f,i)=>assert.ok(Math.abs(f.y+bottoms[i]*f.size/1254-935)<.002));
});

test('timeline alternates all eight shapes without position, rotation or scale animation',()=>{
  const visited=new Set();let t=0,previous=-1;
  for(const [frame,duration] of flameTimeline){
    const p=sampleLantern(t+1);assert.equal(p.frame,frame);assert.notEqual(frame,previous);
    assert.deepEqual([p.dx,p.dy,p.angle,p.sx,p.sy],[0,0,0,1,1]);
    assert.ok(duration>=85&&duration<=105);visited.add(frame);previous=frame;t+=duration;
  }
  assert.equal(visited.size,8);assert.equal(sampleLantern(t).frame,0);
});

test('a frame that has not loaded does not replace the currently visible flame',()=>{
  const env=environment(),previousImage=globalThis.Image;
  const loaders=[];
  globalThis.Image=class{constructor(){this.complete=false;this.naturalWidth=0;loaders.push(this);}};
  try{
    const flame=env.node('flame');const images=Array.from({length:8},(_,i)=>({...env.node(String(i)),getAttribute:()=>`frame-${i}.png`}));
    images.forEach((n,i)=>n.setAttribute('visibility',i===0?'visible':'hidden'));flame.querySelectorAll=()=>images;
    const stage={querySelector:sel=>sel==='[data-lantern-flame]'?flame:{style:{}},closest:()=>null};
    const motion=animateBitpolyLantern(stage);env.advance(1000);env.advance(1200);
    assert.equal(images[0].attributes.visibility,'visible');assert.equal(images[1].attributes.visibility,'hidden');
    loaders[1].onload();env.advance(1210);assert.equal(images[1].attributes.visibility,'visible');assert.equal(images[0].attributes.visibility,'hidden');
    motion.dispose();assert.ok(loaders.every(i=>i.onload===null));
  }finally{globalThis.Image=previousImage;env.restore();}
});

