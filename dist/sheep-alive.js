import {aliveFrames} from './sheep-alive-data.js';

const outfitKeys = {
 'vestes-sacerdotais':'priestly','tunica-de-jose':'tunic','pequeno-pastor-de-davi':'david'
};
const spontaneous = ['curious','playful','yawn','settle'];
const weighted = [3,2,3,2];
const HOLD = 7800;

export function tapBurst(windowMs=2000, cooldownMs=7000) {
 let touches=[], blockedUntil=-Infinity;
 return {
  add(now) {
   if(now<blockedUntil)return false;
   touches=touches.filter(t=>now-t<=windowMs);
   touches.push(now);
   if(touches.length<3)return false;
   touches=[];blockedUntil=now+cooldownMs;return true;
  },
  reset(){touches=[];}
 };
}

// Per-outfit, on-demand sheets. A decoded sheet is retained only while useful.
export function animateSheepAlive(lamb, {outfit, random=Math.random, now=()=>performance.now()}={}) {
 const clips=aliveFrames[outfitKeys[outfit] || 'base'];
 const sprite=lamb.querySelector('[data-lamb-frame-image]');
 const media=matchMedia('(prefers-reduced-motion: reduce)');
 const decoded=new Map(), loading=new Map(), failed=new Set();
 const burst=tapBurst();
 let active=null, waiting=null, queued=null, disposed=false, ready=false;
 let frame=0, last=null, clock=0, lastInput=0, nextIdle=6500+random()*5000;
 let lastIdle='', lastShown='', tapCount=0, lastAffection='nuzzle';
 const blocked=()=>disposed||document.hidden||lamb.closest('[inert]');
 const cue=kind=>lamb.dispatchEvent(new CustomEvent('jornada-lamb-cue',{bubbles:true,detail:kind}));
 lamb.classList.add('bitpoly-motion');

 function load(name) {
  if(failed.has(name))return Promise.resolve(false);
  if(decoded.has(name))return Promise.resolve(true);
  if(loading.has(name))return loading.get(name);
  const image=new Image();
  const work=new Promise(resolve=>{
   image.onload=async()=>{
    try {
     if(image.decode)await image.decode();
     if(disposed){resolve(false);return;}
     decoded.set(name,image);resolve(true);
    } catch {resolve(false);}
   };
   image.onerror=()=>resolve(false);
   image.src=clips[name].src;
  }).then(ok=>{if(!ok&&!disposed)failed.add(name);return ok;}).finally(()=>loading.delete(name));
  loading.set(name,work);return work;
 }
 function trim(keep=[]) {
  const pinned=new Set(['neutral',active?.name,...keep]);
  while(decoded.size>4) {
   const key=[...decoded.keys()].find(key=>!pinned.has(key));
   if(!key)break;
   decoded.delete(key);
  }
 }
 function paint(name,index) {
  const id=`${name}:${index}`;
  if(id===lastShown)return;
  const c=clips[name], x=(index%c.columns)*256, y=Math.floor(index/c.columns)*286;
  sprite.setAttribute('x',110-x*1085/256);sprite.setAttribute('y',-y*1210/286);
  if(!lastShown.startsWith(name+':')) {
   sprite.setAttribute('width',c.width*1085/256);sprite.setAttribute('height',c.height*1210/286);
   sprite.setAttribute('href',c.src);
  }
  lastShown=id;lamb.dataset.frame=id;
 }
 function request(name,{priority=1,line=null}={}) {
  if(blocked()||!clips[name])return false;
  if(media.matches){if(line)cue(line);return true;}
  if(active?.name==='annoyed'||(waiting&&waiting.priority>priority))return false;
  const job={name,priority,line};waiting=job;
  const needs=name==='doze'?[name,'sleeping','wake']:[name];
  Promise.all(needs.map(load)).then(results=>{
   if(waiting!==job||disposed)return;
   waiting=null;
   if(results.some(ok=>!ok)){
    lamb.dataset.frameError=name;lastInput=clock;nextIdle=clock+9000;return;
   }
   if(blocked()||media.matches)return;
   queued=job;
   if(active?.name==='sleeping'||active?.name==='doze'&&!active.reverse) {
    wake();
   } else if(active&&priority>=2&&active.name!=='wake'&&!active.reverse&&!active.exit) {
    // Return through the remaining authored poses, starting at the current frame.
    active.exit={from:Math.min(1,(clock-active.start)/(active.finish-active.start)),start:clock};
    active.finish=Math.min(active.finish,clock+240);
   }
   trim(needs);
  });
  return true;
 }
 function start(job) {
  active={...job,start:clock,finish:clock+(job.name==='sleeping'?HOLD:clips[job.name].duration),said:false};
  lamb.dataset.bpState={doze:'drowsy',sleeping:'sleeping',yawn:'drowsy',wake:'waking',talking:'talking',curious:'curious',playful:'playful'}[job.name]||'reacting';
  paint(job.name,0);
 }
 function wake() {
  if(blocked())return;
  lastInput=clock;nextIdle=Math.max(nextIdle,clock+5500+random()*4200);
  if(waiting?.priority===0)waiting=null;
  if(queued?.priority===0)queued=null;
  if(active?.name==='doze'&&!active.reverse) {
   const progress=Math.min(1,(clock-active.start)/clips.doze.duration);
   active={name:'doze',reverse:true,progress,start:clock,finish:clock+450+progress*650};
   lamb.dataset.bpState='waking';
  } else if(active?.name==='sleeping'&&decoded.has('wake')) {
   start({name:'wake',priority:4,line:null});
  }
 }
 function randomIdle(){
  const list=spontaneous.map((name,i)=>[name,weighted[i]]).filter(([name])=>name!==lastIdle);
  let pick=random()*list.reduce((sum,[,w])=>sum+w,0);
  for(const [name,weight] of list)if((pick-=weight)<0)return name;
  return list.at(-1)[0];
 }
 function draw(dt) {
  clock+=dt;
  if(active) {
   const {name,start:since,finish,line,reverse,exit}=active,c=clips[name];
   if(clock>=finish) {
    active=null;
    if(name==='doze'&&!reverse){start({name:'sleeping',priority:0});return;}
    if(name==='sleeping'){lastInput=clock;nextIdle=clock+7200;start({name:'wake',priority:4});return;}
   } else {
    const elapsed=clock-since;
    let progress=name==='sleeping'?(elapsed%c.duration)/c.duration:elapsed/(finish-since);
    if(reverse)progress=active.progress*(1-progress);
    if(exit)progress=exit.from+(1-exit.from)*(clock-exit.start)/(finish-exit.start);
    paint(name,Math.min(c.count-1,Math.floor(progress*c.count)));
    if(line&&!active.said&&elapsed>=Math.min(260,(finish-since)*.35)) {active.said=true;cue(line);}
    return;
   }
  }
  if(queued){const job=queued;queued=null;start(job);return;}
  if(!waiting&&clock-lastInput>=30000)request('doze',{priority:0});
  else if(!waiting&&clock>=nextIdle) {
   lastIdle=randomIdle();request(lastIdle,{priority:0});nextIdle=clock+7800+random()*6400;
  }
  lamb.dataset.bpState='awake';
  const c=clips.neutral;paint('neutral',Math.floor((clock%c.duration)*c.count/c.duration));
 }
 function tick(now) {
  const dt=last===null?0:Math.min(80,Math.max(0,now-last));last=now;
  if(!blocked()&&ready)draw(dt);
  if(!disposed&&!document.hidden&&!media.matches)frame=requestAnimationFrame(tick);
 }
 function resume() {
  cancelAnimationFrame(frame);last=null;
  if(disposed||!ready)return;
  if(media.matches){active=queued=waiting=null;lamb.dataset.bpState='awake';paint('neutral',0);return;}
  if(!document.hidden)frame=requestAnimationFrame(tick);
 }
 const events=['pointerdown','keydown','wheel'];
 events.forEach(event=>document.addEventListener(event,wake,{passive:true}));
 document.addEventListener('visibilitychange',resume);media.addEventListener('change',resume);
 load('neutral').then(ok=>{
  if(disposed)return;
  ready=ok;lamb.dataset.framesReady=String(ok);
  if(ok)resume();else lamb.dataset.frameError='neutral';
 });
 return {
  tap(isPointer=true) {
   if(blocked())return;
   wake();
   if(active?.name==='annoyed'||waiting?.name==='annoyed'||queued?.name==='annoyed')return;
   if(isPointer&&burst.add(now())){request('annoyed',{priority:4,line:'annoyed'});return;}
   if(++tapCount%3===1)request('talking',{priority:2,line:'talk'});
   else request(tapCount%2?'content':'curious',{priority:2});
  },
  pet(speak=true) {
   burst.reset();wake();
   lastAffection=lastAffection==='nuzzle'?'content':'nuzzle';
   request(lastAffection,{priority:2,line:speak&&random()<.24?'pet':null});
  },
  greet(){wake();request('curious',{priority:1});},
  dispose() {
   disposed=true;cancelAnimationFrame(frame);decoded.clear();
   events.forEach(event=>document.removeEventListener(event,wake));
   document.removeEventListener('visibilitychange',resume);media.removeEventListener('change',resume);
  }
 };
}
