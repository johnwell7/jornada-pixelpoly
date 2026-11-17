import test from 'node:test';
import assert from 'node:assert/strict';
import { clearSegment, createLamb, findPath, follow, go, orderAt, start, step, targets, walkable } from '../navigation.mjs';

test('percurso do tapete até a janela e a cama termina nas poses certas', () => {
  const lamb = createLamb();
  for (const id of ['window','bed']) {
    assert.equal(go(lamb, targets[id], id), true);
    let event;
    for (let i = 0; i < 600 && !event; i++) {
      event = step(lamb,1/60);
      assert.equal(walkable(lamb.x,lamb.y), true);
    }
    assert.equal(event,id);
    assert.equal(lamb.face,targets[id].face);
    assert.equal(lamb.pose,targets[id].pose);
    assert.ok(Math.hypot(lamb.x-targets[id].x,lamb.y-targets[id].y) < .001);
  }
});
test('a rota contorna a cama, e as setas respeitam a colisão', () => {
  const origin = { x:285, y:239 };
  const destination = { x:416, y:300 };
  assert.equal(clearSegment(origin,destination), false);
  const path = findPath(origin,destination);
  assert.ok(path.length > 1);
  let previous = origin;
  for (const next of path) {
    assert.equal(clearSegment(previous,next),true);
    previous = next;
  }
  const lamb = { ...createLamb(), ...origin };
  for (let i=0;i<100;i++) step(lamb,1/60,{x:1,y:0});
  assert.ok(lamb.x <= 312);
  assert.equal(walkable(lamb.x,lamb.y),true);
});
test('câmera vertical mantém limites e suaviza o deslocamento', () => {
  const camera = { x:0,y:0 }, view = { width:130,height:280 };
  follow(camera,start,view,Infinity);
  const priorX = camera.x;
  follow(camera,targets.window,view,1/60);
  assert.ok(camera.x < priorX && camera.x > targets.window.x-65);
  follow(camera,{x:448,y:336},view,Infinity);
  assert.deepEqual(camera,{x:318,y:56});
});
test('a cama passa à frente ou atrás da ovelha pela base', () => {
  const behind = orderAt(255), ahead = orderAt(295);
  assert.ok(behind.indexOf('lamb') < behind.indexOf('bed'));
  assert.ok(ahead.indexOf('lamb') > ahead.indexOf('bed'));
});
