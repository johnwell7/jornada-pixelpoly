import { artDensity, drawRoom, drawScenery, loadRoom } from './art/room.mjs';
import { createSheet, drawLamb, lambBounds, lambShadow } from './art/lamb.mjs';
import { createBehavior } from './behavior.mjs';
import { cameraViewport, createLamb, follow, go, orderAt, step } from './navigation.mjs';

const canvas = document.querySelector('#room');
const hint = document.querySelector('#hint');
const bubble = document.querySelector('#bubble');
const inviteButton = document.querySelector('#invite');
const petButton = document.querySelector('#pet');
const g = canvas.getContext('2d', { alpha: false });
let room, sheet;
try {
  [room,sheet]=await Promise.all([loadRoom(),createSheet()]);
} catch (error) {
  hint.textContent='Não foi possível carregar a arte do Lar.';
  throw error;
}
const lamb = createLamb();
const params = new URLSearchParams(location.search);
const observation = params.get('observe')==='1' ? [] : null;
const behavior = createBehavior(lamb,Math.random,{observe:observation ? event=>observation.push(event) : undefined});
const camera = { x:0, y:0 };
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const debug = params.get('debug')==='1';
let view, frameScale, layout, stroke, left, top;
let time = 0, bubbleUntil = 0, previous, invitationId = null;

function resize() {
  layout = canvas.parentElement.getBoundingClientRect();
  const { width,height } = layout;
  const next = cameraViewport(width,height);
  const reframe = !view || view.mobile!==next.mobile || view.scale!==next.scale;
  view = next;
  frameScale = view.scale;
  const canvasWidth = view.width*frameScale, canvasHeight = view.height*frameScale;
  left = Math.floor((width-canvasWidth)/2);
  top = Math.floor((height-canvasHeight)/2);
  canvas.width = view.width*artDensity;
  canvas.height = view.height*artDensity;
  canvas.style.width = canvasWidth+'px';
  canvas.style.height = canvasHeight+'px';
  canvas.style.left = left+'px';
  canvas.style.top = top+'px';
  g.setTransform(artDensity,0,0,artDensity,0,0);
  g.imageSmoothingEnabled = false;
  follow(camera,lamb,view,reframe ? Infinity : 0,behavior.focus);
}

function toWorld(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: Math.round(camera.x)+(event.clientX-rect.left)*view.width/rect.width,
    y: Math.round(camera.y)+(event.clientY-rect.top)*view.height/rect.height
  };
}
function touchesLamb(point) {
  const {halfWidth,head,foot}=lambBounds(lamb);
  return Math.abs(point.x-lamb.x)<=halfWidth && point.y>=lamb.y-head && point.y<=lamb.y+foot;
}
function giveAffection(stroking = false) {
  if (debug) return;
  hint.hidden = true;
  const line = behavior.pet(stroking);
  if (line) {
    bubble.textContent = line;
    bubble.toggleAttribute('data-visible', true);
    bubbleUntil = time+2.2;
  }
}
canvas.addEventListener('pointerdown', event => {
  if (!event.isPrimary || event.button !== 0) return;
  const point = toWorld(event);
  if (debug) {
    go(lamb,point);
  } else if (touchesLamb(point)) {
    stroke = { id:event.pointerId, x:event.clientX, y:event.clientY, time };
    canvas.setPointerCapture(event.pointerId);
    giveAffection();
  }
});
canvas.addEventListener('pointermove', event => {
  if (stroke?.id !== event.pointerId || time-stroke.time < .28 ||
    Math.hypot(event.clientX-stroke.x,event.clientY-stroke.y) < 8 ||
    !touchesLamb(toWorld(event))) return;
  stroke = { id:event.pointerId, x:event.clientX, y:event.clientY, time };
  giveAffection(true);
});
for (const name of ['pointerup','pointercancel','lostpointercapture']) {
  canvas.addEventListener(name,event => { if (stroke?.id === event.pointerId) stroke = null; });
}
petButton.addEventListener('click', () => giveAffection());
inviteButton.addEventListener('click', () => {
  if (behavior.invite(invitationId)) {
    hint.hidden = true;
    inviteButton.hidden = true;
  }
});
addEventListener('resize',resize);

function positionInterface() {
  const x = left+(Math.round(lamb.x)-Math.round(camera.x))*frameScale;
  const y = top+(Math.round(lamb.y)-Math.round(camera.y))*frameScale;
  petButton.style.left = x+'px';
  petButton.style.top = y-14*frameScale+'px';
  if (bubbleUntil) {
    bubble.style.left = Math.max(60,Math.min(layout.width-60,x))+'px';
    bubble.style.top = Math.max(66,y-36*frameScale)+'px';
    if (time >= bubbleUntil) {
      bubble.toggleAttribute('data-visible',false);
      bubbleUntil = 0;
    }
  }
  if (time > 11) hint.hidden = true;
  const suggestion = hint.hidden && !debug ? behavior.suggestion() : null;
  if (suggestion?.id !== invitationId || suggestion === null && !inviteButton.hidden) {
    invitationId = suggestion?.id ?? null;
    inviteButton.hidden = !suggestion;
    if (suggestion) inviteButton.textContent = suggestion.label;
  }
}
function draw(visibleTime) {
  g.save();
  g.translate(-Math.round(camera.x),-Math.round(camera.y));
  drawRoom(g,room);
  for (const id of orderAt(lamb.y)) {
    if (id === 'lamb') {
      lambShadow(g,lamb);
      drawLamb(g,sheet,lamb);
    } else drawScenery(g,id,room,visibleTime);
  }
  g.restore();
}
function frame(now) {
  const dt = Math.min(.035,(now-(previous??now))/1000);
  previous = now;
  time += dt;
  if (debug) step(lamb,dt);
  else behavior.update(dt);
  follow(camera,lamb,view,dt,behavior.focus);
  draw(reducedMotion.matches ? 0 : time);
  positionInterface();
  requestAnimationFrame(frame);
}
if (observation) {
  globalThis.jornadaObservation = () => ({
    time, mode:behavior.mode, camera:{...camera}, view:{...view},
    lamb:{x:lamb.x,y:lamb.y,pose:lamb.pose,face:lamb.face}, events:observation.slice()
  });
}
resize();
requestAnimationFrame(frame);
