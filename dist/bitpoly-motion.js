import {animateFullLamb} from './lamb-frames.js';
import {animateSheepAlive} from './sheep-alive.js';
// A fresh, sampled cutout animation system for V115. No legacy keyframes/timelines.
export const BITPOLY_IDLE_MS = 14000;
export const BITPOLY_ACTION_MS = 1100;
const TAU=Math.PI*2;
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
const rest=()=>({torsoY:0,torsoScale:1,headX:0,headY:0,headAngle:0,earLeft:0,earRight:0,eyeX:0,eyeY:0,eyeScale:1,puff:0});

// Pure pose sampler: supporting paws never receive transforms.
export function sampleBitpolyPose(t,{idle=0,action='',actionAge=0,gazeX=0,gazeY=0,blink=0,reduced=false,studying=false}={}) {
  const p=rest();
  if(reduced)return p;
  const sleepDelay=studying?BITPOLY_IDLE_MS:20000;
  const drowsy=smooth((idle-sleepDelay+800)/800);
  const breath=(Math.sin(t/3600*TAU-Math.PI/2)+1)/2;
  p.torsoScale=1+breath*(.013-drowsy*.004);
  p.torsoY=-breath*1.6;
  p.headY=breath*1.1+drowsy*(5+Math.sin(t/6800*TAU)*2.5);
  p.headAngle=Math.sin(t/6800*TAU)*.38+drowsy*Math.sin(t/7500*TAU)*1.45;
  p.eyeX=clamp(gazeX,-12,12)*(1-drowsy);
  p.eyeY=clamp(gazeY,-8,8)*(1-drowsy);
  p.eyeScale=Math.max(.055,(1-drowsy*.94)*(1-blink*.95));
  p.puff=drowsy>.98?(Math.sin(t/5200*TAU)+1)/2:0;
  // Ears rest between independently scheduled reactions; no repeating sine loop.
  if(action){
    const a=clamp(actionAge/BITPOLY_ACTION_MS,0,1), envelope=Math.sin(a*Math.PI);
    switch(action){
      case 'welcome-listen':p.earLeft+=envelope*5;p.headAngle-=envelope*1.3;break;
      case 'welcome-peek':p.headAngle+=envelope*2.2;p.eyeX+=envelope*9;break;
      case 'welcome-nod':p.headY+=Math.sin(a*Math.PI*2)*envelope*5;break;
      case 'welcome-perk':p.headY-=envelope*4;p.earRight-=envelope*4;break;
      case 'nuzzle':p.headAngle+=envelope*3;p.eyeScale=1-envelope*.9;p.earLeft+=envelope*2;break;
      case 'content':p.headY+=envelope*3;p.eyeScale=1-envelope*.86;break;
      case 'lean':p.headAngle-=envelope*2.7;p.earRight-=envelope*3;break;
      case 'curious':p.headAngle+=envelope*1.8;p.earLeft+=envelope*4;p.eyeY-=envelope*5;break;
      case 'listen':p.earRight-=envelope*5;p.headAngle-=envelope*.9;break;
      case 'listen-left':p.earLeft+=envelope*5;p.headAngle+=envelope*.7;break;
      case 'glance':p.eyeX+=envelope*8;p.headAngle+=envelope*.8;break;
      case 'snuffle':p.headY-=Math.sin(a*Math.PI*4)*envelope*2;break;
    }
  }
  p.eyeX=clamp(p.eyeX,-12,12);p.eyeY=clamp(p.eyeY,-8,8);
  if(studying){p.headAngle*=.65;p.headY*=.65;}
  return p;
}
export function samplePlantJoint(t,index,kind='vine',reduced=false){
  if(reduced)return 0;
  const amplitude=kind==='floor'?2.25:kind==='shelf'?1.65:1.25;
  // Two unequal wind periods, staggered at each joint, rather than one rotating sprite.
  return amplitude*(Math.sin(t/11200*TAU-index*.68)+.24*Math.sin(t/17300*TAU+index*1.2));
}
function pivotTransform(node,angle=0,dx=0,dy=0,sx=1,sy=1){
  const [x,y]=(node.dataset.pivot||'0 0').split(' ').map(Number);
  node.setAttribute('transform',`translate(${dx.toFixed(2)} ${dy.toFixed(2)}) translate(${x} ${y}) rotate(${angle.toFixed(3)}) scale(${sx.toFixed(4)} ${sy.toFixed(4)}) translate(${-x} ${-y})`);
}

// Finite gusts with independent waits. With multiple plants, at least one rests.
export function createPlantWindTracks(plants,{random=Math.random}={}){
  let clock=0,nextStart=0;
  const tracks=plants.map((p,i)=>({...p,next:500+random()*5500+i*700,gust:null}));
  const limit=Math.max(1,tracks.length-1);
  return {step(dt){
    clock+=Math.max(0,dt);
    for(const t of tracks)if(t.gust&&clock>=t.gust.start+t.gust.duration+t.gust.lag*(t.joints-1)){
      t.gust=null;t.next=clock+1500+random()*12000;
    }
    const ready=tracks.filter(t=>!t.gust&&t.next<=clock).sort((a,b)=>a.next-b.next);
    if(clock>=nextStart&&tracks.filter(t=>t.gust).length<limit&&ready.length){
      const t=ready[0];
      t.gust={start:clock,duration:3800+random()*6500,lag:100+random()*200,strength:.45+random()*.55,direction:random()<.5?-1:1,phase:random()*TAU,speed:.7+random()*.8};
      nextStart=clock+900+random()*2100;
    }
    return tracks.map(t=>Array.from({length:t.joints},(_,i)=>{
      if(!t.gust)return 0;
      const g=t.gust,age=clock-g.start-i*g.lag,u=age/g.duration;
      if(u<=0||u>=1)return 0;
      const envelope=Math.sin(Math.PI*u)**2;
      const amplitude=t.kind==='floor'?3.2:t.kind==='shelf'?2.45:1.9;
      return amplitude*g.strength*g.direction*envelope*(.7+.3*Math.sin(age/1700*g.speed+g.phase-i*.4));
    }));
  }};
}

export function animateBitpolyPlants(stage,{random=Math.random}={}){
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const groups=[...stage.querySelectorAll('[data-bp-plant]')].map(svg=>({kind:svg.dataset.bpPlant,nodes:[...svg.querySelectorAll('[data-bp-part]')]}));
  const wind=createPlantWindTracks(groups.map(g=>({kind:g.kind,joints:g.nodes.length})),{random});
  let frame=0,disposed=false,last=null;
  function reset(){groups.forEach(g=>g.nodes.forEach(node=>node.removeAttribute('transform')));}
  function tick(t){
    if(disposed)return;
    const dt=last===null?0:Math.min(100,Math.max(0,t-last));last=t;
    if(!stage.closest('[inert]')){const poses=wind.step(dt);groups.forEach((g,j)=>g.nodes.forEach((node,i)=>pivotTransform(node,poses[j][i])));}
    frame=requestAnimationFrame(tick);
  }
  function resume(){cancelAnimationFrame(frame);last=null;if(media.matches)reset();if(!disposed&&!document.hidden&&!media.matches)frame=requestAnimationFrame(tick);}
  document.addEventListener('visibilitychange',resume);media.addEventListener('change',resume);resume();
  return {dispose(){disposed=true;cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',resume);media.removeEventListener('change',resume);reset();}};
}

const greetings=['welcome-listen','welcome-peek','welcome-nod','welcome-perk'];
let lastGreeting=-1;
const pickNext=(count,previous,random)=>((previous+1+Math.floor(random()*(count-1)))%count);
export function animateBitpolyLamb(lamb,{studying=false,alive=false,random=Math.random}={}){
  const frameViewport=lamb.querySelector('[data-lamb-frame-viewport]');
  if(frameViewport) {
    if(alive&&!studying)return animateSheepAlive(lamb,{outfit:frameViewport.dataset.lambOutfit,random});
    return animateFullLamb(lamb,{studying,random});
  }
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  lamb.classList.add('bitpoly-motion');
  const parts=Object.fromEntries([...lamb.querySelectorAll('[data-bp-part]')].map(n=>[n.dataset.bpPart,n]));
  // Existing outfits remain equipable. Their geometry is retained, but the animation
  // is driven by this new sampler rather than the previous CSS pose system.
  const legacy=!parts.torso?{
    torso:lamb.querySelector('.lamb-chest'),head:lamb.querySelector('.lamb-head'),
    left:lamb.querySelector('.lamb-ear-left'),right:lamb.querySelector('.lamb-ear-right'),
    eyes:[...lamb.querySelectorAll('.eye')]
  }:null;
  let frame=0,lastActivity=performance.now(),action='',actionStart=0;
  const sleepDelay=studying?14000:20000;
  let blinkStart=0,nextBlink=performance.now()+2300+random()*2000,nextIdle=performance.now()+1800+random()*7500;
  let reactionDuration=BITPOLY_ACTION_MS,reactionStrength=1;
  let gazeX=0,gazeY=0,lastPet=-1,lastPoint=null,travel=0,lastTouch=-Infinity,disposed=false;
  function wake(){lastActivity=performance.now();lamb.dataset.bpState='awake';}
  function perform(name){wake();action=name;reactionDuration=BITPOLY_ACTION_MS;reactionStrength=1;actionStart=performance.now();render(actionStart);}
  function render(now){
    if(disposed)return;
    if(lamb.closest('[inert]')){lastActivity=now;return;}
    if(now>=nextBlink&&blinkStart===0){blinkStart=now;nextBlink=now+2900+random()*4200;}
    let blink=blinkStart?Math.sin(clamp((now-blinkStart)/140,0,1)*Math.PI):0;
    if(now-blinkStart>140)blinkStart=0;
    if(action&&now-actionStart>reactionDuration)action='';
    if(!action&&now>nextIdle&&now-lastActivity<sleepDelay-800){
      action=['listen-left','listen','glance','snuffle'][Math.floor(random()*4)];actionStart=now;
      reactionDuration=650+random()*1000;reactionStrength=.5+random()*.5;nextIdle=now+2500+random()*11000;
    }
    if(!studying&&now-lastActivity>=sleepDelay+5000){wake();action='welcome-perk';actionStart=now;}
    const idle=now-lastActivity;
    const p=sampleBitpolyPose(now,{idle,action,actionAge:(now-actionStart)*BITPOLY_ACTION_MS/reactionDuration,gazeX,gazeY,blink,reduced:media.matches,studying});
    p.earLeft*=reactionStrength;p.earRight*=reactionStrength;
    lamb.dataset.bpState=idle>=sleepDelay?'sleeping':idle>=sleepDelay-800?'drowsy':'awake';
    if(parts.torso){
      pivotTransform(parts.torso,0,0,p.torsoY,1,p.torsoScale);
      pivotTransform(parts.head,p.headAngle,p.headX,p.headY);
      pivotTransform(parts['ear-left'],p.earLeft);
      pivotTransform(parts['ear-right'],p.earRight);
      for(const side of ['left','right']){
        const eye=parts['eye-'+side];pivotTransform(eye,0,p.eyeX,p.eyeY,1,p.eyeScale);
        eye.setAttribute('opacity',p.eyeScale<.3?'0':'1');
        parts['lid-'+side]?.setAttribute('opacity',p.eyeScale<.3?'1':'0');
      }
      parts['sleep-puff'].setAttribute('opacity',String(p.puff*.6));
      parts['sleep-puff'].setAttribute('transform',`translate(${p.puff*6} ${-p.puff*5}) translate(733 512) scale(${.3+p.puff*.7}) translate(-733 -512)`);
    }else if(legacy){
      const move=(n,value,origin)=>{if(n){n.style.setProperty('transform',value,'important');n.style.setProperty('transform-origin',origin,'important');}};
      move(legacy.torso,`translateY(${p.torsoY*.25}px) scaleY(${p.torsoScale})`,'50% 100%');
      move(legacy.head,`translateY(${p.headY*.2}px) rotate(${p.headAngle}deg)`,'50% 95%');
      move(legacy.left,`rotate(${p.earLeft}deg)`,'90% 50%');move(legacy.right,`rotate(${p.earRight}deg)`,'10% 50%');
      legacy.eyes.forEach(n=>move(n,`translate(${p.eyeX*.2}px,${p.eyeY*.2}px) scaleY(${p.eyeScale})`,'50% 50%'));
    }
  }
  function tick(t){if(disposed)return;render(t);frame=requestAnimationFrame(tick);}
  function resume(){cancelAnimationFrame(frame);wake();render(performance.now());if(!disposed&&!document.hidden&&!media.matches)frame=requestAnimationFrame(tick);}
  function move(event){
    if(disposed||lamb.closest('[inert]'))return;
    const box=lamb.getBoundingClientRect();
    const x=event.clientX,y=event.clientY;
    gazeX=clamp((x-box.left-box.width*.5)/Math.max(box.width*.5,1)*12,-12,12);
    gazeY=clamp((y-box.top-box.height*.36)/Math.max(box.height*.4,1)*8,-8,8);
    if(lastPoint){travel+=Math.hypot(x-lastPoint.x,y-lastPoint.y);}
    lastPoint={x,y};wake();
    const near=x>box.left&&x<box.right&&y>box.top&&y<box.bottom;
    if(near&&event.buttons===0&&travel>18&&performance.now()-lastTouch>1500){lastTouch=performance.now();travel=0;api.pet();}
    if(media.matches)render(performance.now());
  }
  const events=['pointerdown','keydown','wheel'];
  events.forEach(name=>document.addEventListener(name,wake,{passive:true}));
  document.addEventListener('pointermove',move,{passive:true});
  document.addEventListener('visibilitychange',resume);media.addEventListener('change',resume);
  const api={
    greet(){
      try{const raw=sessionStorage.getItem('jornada:bitpoly-greeting');const saved=raw===null?-1:Number(raw);if(Number.isInteger(saved)&&saved>=0&&saved<greetings.length)lastGreeting=saved;}catch{}
      lastGreeting=pickNext(greetings.length,lastGreeting,random);
      try{sessionStorage.setItem('jornada:bitpoly-greeting',String(lastGreeting));}catch{}
      perform(greetings[lastGreeting]);
    },
    pet(vary=true){const poses=['nuzzle','content','lean','curious'];lastPet=vary?pickNext(poses.length,lastPet,random):1;perform(poses[lastPet]);},
    dispose(){disposed=true;cancelAnimationFrame(frame);events.forEach(name=>document.removeEventListener(name,wake));document.removeEventListener('pointermove',move);document.removeEventListener('visibilitychange',resume);media.removeEventListener('change',resume);}
  };
  resume();return api;
}

