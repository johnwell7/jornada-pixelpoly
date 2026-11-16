import { bakeRoom, drawLights, drawScenery } from './art/room.mjs';
import { createSheet, drawLamb, lambShadow } from './art/lamb.mjs';
import { createLamb, follow, go, orderAt, step, targets, world } from './navigation.mjs';

const canvas = document.querySelector('#room');
const hint = document.querySelector('#hint');
const g = canvas.getContext('2d', { alpha: false });
const offscreen = () => document.createElement('canvas');
const room = bakeRoom(offscreen());
const sheet = createSheet(offscreen());
const lamb = createLamb();
const camera = { x: 0, y: 0 };
const keys = new Set();
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const controls = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  w: 'up', s: 'down', a: 'left', d: 'right'
};
const messages = {
  window: 'A ovelha observa a luz nas colinas.',
  bed: 'A ovelha se acomoda perto da cama.'
};
const defaultHint = 'Toque no chão para andar.';

function resize() {
  const { width, height } = canvas.parentElement.getBoundingClientRect();
  const scale = Math.max(1, Math.round(Math.min(height / 172, width / 143)), Math.ceil(width / 330));
  canvas.width = Math.max(1, Math.min(world.width, Math.floor(width / scale)));
  canvas.height = Math.max(1, Math.min(world.height, Math.floor(height / scale)));
  canvas.style.width = canvas.width * scale + 'px';
  canvas.style.height = canvas.height * scale + 'px';
  g.imageSmoothingEnabled = false;
  follow(camera, lamb, canvas, Infinity);
}
function choose(id) {
  if (go(lamb, targets[id], id)) {
    hint.textContent = id === 'window' ? 'A caminho da janela…' : 'A caminho da cama…';
  }
}

canvas.addEventListener('pointerdown', event => {
  if (!event.isPrimary || event.button !== 0) return;
  const rect = canvas.getBoundingClientRect();
  const x = Math.round(camera.x) + (event.clientX - rect.left) * canvas.width / rect.width;
  const y = Math.round(camera.y) + (event.clientY - rect.top) * canvas.height / rect.height;
  if (x >= 158 && x <= 265 && y >= 30 && y <= 138) choose('window');
  else if (x >= 300 && x <= 404 && y >= 93 && y <= 226) choose('bed');
  else if (go(lamb, { x, y })) hint.textContent = defaultHint;
});
document.querySelectorAll('[data-target]').forEach(button => {
  button.addEventListener('click', () => choose(button.dataset.target));
});
addEventListener('keydown', event => {
  const key = event.key.toLowerCase();
  if (!controls[event.key] && !controls[key] || event.altKey || event.ctrlKey || event.metaKey) return;
  event.preventDefault();
  if (!keys.size) hint.textContent = defaultHint;
  keys.add(event.key.startsWith('Arrow') ? event.key : key);
});
addEventListener('keyup', event => {
  keys.delete(event.key.startsWith('Arrow') ? event.key : event.key.toLowerCase());
});
addEventListener('blur', () => keys.clear());
addEventListener('resize', resize);

function input() {
  const active = new Set([...keys].map(key => controls[key]));
  return {
    x: Number(active.has('right')) - Number(active.has('left')),
    y: Number(active.has('down')) - Number(active.has('up'))
  };
}
function draw(time) {
  g.save();
  g.translate(-Math.round(camera.x), -Math.round(camera.y));
  g.drawImage(room,0,0);
  for (const id of orderAt(lamb.y)) {
    if (id === 'lamb') {
      lambShadow(g,lamb);
      drawLamb(g,sheet,lamb);
    } else drawScenery(g,id,time);
  }
  drawLights(g,time);
  g.restore();
}
let previous;
function frame(now) {
  const dt = Math.min(.035, (now - (previous ?? now)) / 1000);
  previous = now;
  const arrival = step(lamb, dt, input());
  if (arrival) hint.textContent = messages[arrival];
  follow(camera, lamb, canvas, dt);
  draw(reducedMotion.matches ? 0 : now / 1000);
  requestAnimationFrame(frame);
}
resize();
requestAnimationFrame(frame);
