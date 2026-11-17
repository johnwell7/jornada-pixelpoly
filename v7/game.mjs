import { cameraViewport, follow } from './navigation.mjs';
import { bindRoomControls } from './room-controls.mjs';
import { createRoomInterface } from './room-interface.mjs';
import { createRoomRenderer } from './room-renderer.mjs';
import { createRoomSession } from './room-session.mjs';

const canvas=document.querySelector('#room');
const params=new URLSearchParams(location.search);
const debug=params.get('debug')==='1';
const observe=params.get('observe')==='1';
const trace=observe ? [] : null;
const session=createRoomSession({debug,onActivity:trace ? event=>trace.push(event) : undefined});
const {lamb}=session;
const renderer=createRoomRenderer(canvas);
const camera={x:0,y:0};
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const ui=createRoomInterface(canvas.parentElement,{pet,invite:session.invite,suggestion:session.suggestion});
let view,layout,left,top,previous;

function pet(stroking=false) {
  const affection=session.pet(stroking);
  if (affection) ui.affection(affection);
}

function resize() {
  layout=canvas.parentElement.getBoundingClientRect();
  const {width,height}=layout;
  const next=cameraViewport(width,height);
  const reframe=!view || view.mobile!==next.mobile || view.scale!==next.scale;
  view=next;
  left=Math.floor((width-view.width*view.scale)/2);
  top=Math.floor((height-view.height*view.scale)/2);
  renderer.resize({...view,left,top});
  follow(camera,lamb,view,reframe ? Infinity : 0,session.focus);
}

function project(event) {
  const rect=canvas.getBoundingClientRect();
  return {
    x:Math.round(camera.x)+(event.clientX-rect.left)*canvas.width/rect.width,
    y:Math.round(camera.y)+(event.clientY-rect.top)*canvas.height/rect.height
  };
}

bindRoomControls(canvas,{
  debug,lamb,pet,project,move:session.moveTo,clock:()=>session.time,scale:()=>view.scale
});
addEventListener('resize',resize);

function frame(now) {
  const dt=Math.min(.035,(now-(previous??now))/1000);
  previous=now;
  session.advance(dt);
  follow(camera,lamb,view,dt,session.focus);
  renderer.draw(lamb,camera,reducedMotion.matches ? 0 : session.time);
  ui.update({
    time:session.time,scale:view.scale,width:layout.width,
    x:left+(Math.round(lamb.x)-Math.round(camera.x))*view.scale,
    y:top+(Math.round(lamb.y)-Math.round(camera.y))*view.scale
  });
  requestAnimationFrame(frame);
}

if (trace) {
  globalThis.jornadaObservation=()=>({...session.observation(),camera:{...camera},view:{...view},events:trace.slice()});
}
resize();
requestAnimationFrame(frame);

