import {lambFrames} from './lamb-frames-data.js';
import {priestlyFrames} from './priestly-frames-data.js';
import {tunicFrames} from './tunic-frames-data.js';

export const PRIESTLY_OUTFIT = 'vestes-sacerdotais';
export const TUNIC_OUTFIT = 'tunica-de-jose';
const outfitFrames = new Map([[PRIESTLY_OUTFIT, priestlyFrames], [TUNIC_OUTFIT, tunicFrames]]);
export function hasAnimatedOutfit(outfit) {
 return outfitFrames.has(outfit);
}
export function frameManifestFor(outfit) {
 return outfitFrames.get(outfit) ?? lambFrames;
}
// Complete RGBA sprites only. No head/torso/paw masks, scales or mesh at runtime.
let spriteSerial=0;
export function fullLambSprite(manifest=lambFrames){
 const p=manifest.pages[0],id=`complete-frame-${++spriteSerial}`;
 const outfit=[...outfitFrames].find(([,frames])=>frames===manifest)?.[0];
 const outfitAttribute=outfit?` data-lamb-outfit="${outfit}"`:'';
 return `<defs><clipPath id="${id}"><rect x="110" y="0" width="1085" height="1210"/></clipPath></defs><g data-lamb-frame-viewport=""${outfitAttribute} clip-path="url(#${id})"><image data-lamb-frame-image="" href="${p.src}" x="110" y="0" width="${p.width*1085/256}" height="${p.height*1210/286}"/></g>`;
}
export function returnToNeutral(index,manifest=lambFrames){
 const clip=Object.values(manifest.clips).find(frames=>frames.includes(index));
 if(!clip)return [0];
 const frames=clip.slice(0,clip.indexOf(index)+1).reverse();
 if(frames.at(-1)!==0)frames.push(0);return frames;
}
export function actionFrames(kind,manifest=lambFrames){
 const clip=manifest.clips[kind]||manifest.clips.pet;
 return [...clip,...clip.slice(0,-1).reverse(),0];
}
export function sampleBreath(ms,manifest=lambFrames){
 const frames=manifest.clips.breath,period=(frames.length-1)*2;
 const step=Math.floor(Math.max(0,ms)*16/1000)%period;
 return frames[step<frames.length?step:period-step];
}
// Decoding is shared across Lar and study. Never create an image per display frame.
const assetCache=new WeakMap();
function preload(manifest){
 if(!assetCache.has(manifest)){
  const images=[];
  const promise=Promise.all(manifest.pages.map(p=>new Promise(resolve=>{
   const image=new Image();images.push(image);image.onload=async()=>{try{if(image.decode)await image.decode();resolve(true);}catch{resolve(false);}};image.onerror=()=>resolve(false);image.src=p.src;
  }))).then(results=>results.every(Boolean));
  assetCache.set(manifest,{images,promise});
 }
 return assetCache.get(manifest).promise;
}
// Each reaction samples its side, range, tempo and pause independently.
export function randomEarReaction(random=Math.random){
 return {side:random()<.5?'listenLeft':'listenRight',depth:.55+random()*.45,fps:24+random()*24,hold:40+random()*320};
}
export function animateFullLamb(lamb,{studying=false,random=Math.random,manifest}={}){
 const viewport=lamb.querySelector('[data-lamb-frame-viewport]');
 manifest ??= frameManifestFor(viewport?.dataset?.lambOutfit);
 const picture=lamb.querySelector('[data-lamb-frame-image]');
 const media=matchMedia('(prefers-reduced-motion: reduce)');
 lamb.classList.add('bitpoly-motion');
 let disposed=false,ready=false,raf=0,index=0,page=-1,geometry='',clock=0,last=null,idle=0;
 let active=null,pending=null,breathStart=0,nextBlink=2100,nextTilt=5000+random()*9000,nextEar=1800+random()*7500,sleeping=false,sleepStart=0;
 const sleepDelay=studying?14000:20000;
 const neutralize=()=>returnToNeutral(index,manifest).slice(1).map(frame=>({frame,ms:1000/60}));
 function display(next){
  if(next===index&&page>=0)return;
  const f=manifest.frames[next],p=manifest.pages[f.page];
  const nextGeometry=`${p.width}:${p.height}:${f.x}:${f.y}`;
  if(geometry!==nextGeometry){
   picture.setAttribute('width',p.width*1085/256);picture.setAttribute('height',p.height*1210/286);
   picture.setAttribute('x',110-f.x*1085/256);picture.setAttribute('y',-f.y*1210/286);
   geometry=nextGeometry;
  }
  if(page!==f.page){picture.setAttribute('href',p.src);page=f.page;}
  index=next;lamb.dataset.frame=String(next);
 }
 function begin(kind){
  // Traversing authored frames back to neutral avoids snapping on rapid touches.
  const intro=neutralize();
  const seq=(name,fps=30,hold=0,depth=1)=>{
   const source=manifest.clips[name]||manifest.clips.pet;
   const clip=source.slice(0,Math.max(2,Math.ceil(source.length*depth)));
   return [...clip.map(frame=>({frame,ms:1000/fps})),...(hold?[{frame:clip.at(-1),ms:hold}]:[]),...clip.slice(0,-1).reverse().map(frame=>({frame,ms:1000/fps})),{frame:0,ms:1000/fps}];
  };
  const ear=()=>{const r=randomEarReaction(random);return seq(r.side,r.fps,r.hold,r.depth);};
  const bodies={
   listen:ear,
   curious:()=>[...seq(random()<.5?'left':'right',30,300),...seq('perk',30,120)],
   alert:()=>ear(),
   wake:()=>[...seq('perk',45,180),...seq('blink',60)],
   content:()=>seq('pet',24,320),
   doze:()=>manifest.clips.blink.map(frame=>({frame,ms:65}))
  };
  const body=bodies[kind]?bodies[kind]():seq(kind,kind==='blink'?60:30);
  active={kind,steps:[...intro,...body],start:clock};
 }
 function request(kind){
  wake();
  if(media.matches)return;
  if(active){pending=kind;return;}begin(kind);
 }
 function wake(){
  if(lamb.closest('[inert]'))return;
  idle=0;
  if(sleeping){sleeping=false;pending=null;begin('wake');}
  lamb.dataset.bpState='awake';
 }
 function render(dt){
  clock+=dt;idle+=dt;
  if(media.matches){active=null;pending=null;display(0);return;}
  if(active){
   let age=clock-active.start;
   for(const step of active.steps){if(age<step.ms){display(step.frame);return;}age-=step.ms;}
   active=null;display(0);breathStart=clock;
   if(pending){const kind=pending;pending=null;begin(kind);return;}
  }
  if(sleeping){
   if(!studying&&clock-sleepStart>=5000){wake();return;}
   display(manifest.clips.blink.at(-1));lamb.dataset.bpState='sleeping';return;
  }
  if(idle>=sleepDelay){
   sleeping=true;sleepStart=clock+manifest.clips.blink.length*65+neutralize().length*1000/60;
   lamb.dataset.bpState='drowsy';begin('doze');return;
  }
  lamb.dataset.bpState='awake';
  // Blink at a neutral breath point; no jump from expanded torso to neutral.
  const breath=sampleBreath(clock-breathStart,manifest);display(breath);
  if(clock>=nextEar){nextEar=clock+2500+random()*11000;begin('listen');}
  else if(breath<=1&&clock>=nextBlink){nextBlink=clock+2600+random()*1800;begin('blink');}
  else if(breath<=1&&clock>=nextTilt){nextTilt=clock+6000+random()*13000;begin('curious');}
 }
 function tick(now){
  if(disposed)return;
  const dt=last===null?0:Math.min(100,now-last);last=now;
  if(!lamb.closest('[inert]')&&ready)render(dt);
  raf=requestAnimationFrame(tick);
 }
 function resume(){
  cancelAnimationFrame(raf);last=null;
  if(media.matches){active=null;pending=null;breathStart=clock;display(0);}
  if(!disposed&&ready&&!document.hidden&&!media.matches)raf=requestAnimationFrame(tick);
 }
 let point=null,travel=0,lastPet=-Infinity;
 function pointer(e){
  if(lamb.closest('[inert]'))return;
  const b=lamb.getBoundingClientRect(),near=e.clientX>=b.left&&e.clientX<=b.right&&e.clientY>=b.top&&e.clientY<=b.bottom;
  if(!near){point=null;travel=0;return;}
  wake();if(point)travel+=Math.hypot(e.clientX-point.x,e.clientY-point.y);point={x:e.clientX,y:e.clientY};
  if(e.buttons===0&&travel>18&&clock-lastPet>1200){lastPet=clock;travel=0;request('pet');}
 }
 const activity=['pointerdown','touchstart','keydown','wheel'];activity.forEach(e=>document.addEventListener(e,wake,{passive:true}));
 document.addEventListener('pointermove',pointer,{passive:true});document.addEventListener('visibilitychange',resume);media.addEventListener('change',resume);
 display(0);preload(manifest).then(ok=>{if(disposed)return;ready=ok;lamb.dataset.framesReady=String(ok);if(ok)resume();else lamb.dataset.frameError='assets';});
 return {play(kind){if(['blink','left','right','pet','listen','curious','alert','wake','content'].includes(kind))request(kind);},greet(){request('alert');},pet(){request(random()<.5?'pet':'content');},dispose(){disposed=true;cancelAnimationFrame(raf);activity.forEach(e=>document.removeEventListener(e,wake));document.removeEventListener('pointermove',pointer);document.removeEventListener('visibilitychange',resume);media.removeEventListener('change',resume);}};
}

