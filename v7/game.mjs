import { bakeRoom, drawLights, drawScenery } from './art/room.mjs';
import { createSheet, drawLamb, lambShadow } from './art/lamb.mjs';
import { createBehavior } from './behavior.mjs';
import { createLamb, follow, go, orderAt, step, world } from './navigation.mjs';

const canvas = document.querySelector('#room');
const hint = document.querySelector('#hint');
const bubble = document.querySelector('#bubble');
const inviteButton = document.querySelector('#invite');
const petButton = document.querySelector('#pet');
const g = canvas.getContext('2d', { alpha: false });
const offscreen = () => document.createElement('canvas');
const room = bakeRoom(offscreen());
const sheet = createSheet(offscreen());
const lamb = createLamb();
const behavior = createBehavior(lamb);
const camera = { x:0, y:0 };
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const debug = new URLSearchParams(location.search).get('debug') === '1';
let frameScale, layout, stroke;
let time = 0, bubbleUntil = 0, previous, invitationId = null;

function resize() {
  layout = canvas.parentElement.getBoundingClientRect();
  const { width,height } = layout;
  frameScale = Math.max(1, Math.floor(width / world.width),
    Math.round(Math.min(height / (width >= height ? 244 : 172), width / 143)));
  canvas.width = Math.max(1, Math.min(world.width, Math.floor(width / frameScale)));
  canvas.height = Math.max(1, Math.min(world.height, Math.floor(height / frameScale)));
  canvas.style.width = canvas.width * frameScale+'px';
  canvas.style.height = canvas.height * frameScale+'px';
  g.imageSmoothingEnabled = false;
  follow(camera,lamb,canvas,Infinity);
}

function toWorld(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: Math.round(camera.x)+(event.clientX-rect.left)*canvas.width/rect.width,
    y: Math.round(camera.y)+(event.clientY-rect.top)*canvas.height/rect.height
  };
}
function touchesLamb(point) {
  const padding = Math.max(15,22/frameScale);
  const low = ['sleep','lie','stir'].includes(lamb.pose);
  return Math.abs(point.x-lamb.x) <= padding && point.y >= lamb.y-(low?21:34) && point.y <= lamb.y+6;
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
  const left = (layout.width-canvas.width*frameScale)/2;
  const top = (layout.height-canvas.height*frameScale)/2;
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
  g.drawImage(room,0,0);
  for (const id of orderAt(lamb.y)) {
    if (id === 'lamb') {
      lambShadow(g,lamb);
      drawLamb(g,sheet,lamb);
    } else drawScenery(g,id,visibleTime);
  }
  drawLights(g,visibleTime);
  g.restore();
}
function frame(now) {
  const dt = Math.min(.035,(now-(previous??now))/1000);
  previous = now;
  time += dt;
  if (debug) step(lamb,dt);
  else behavior.update(dt);
  follow(camera,lamb,canvas,dt);
  draw(reducedMotion.matches ? 0 : time);
  positionInterface();
  requestAnimationFrame(frame);
}
resize();
requestAnimationFrame(frame);
