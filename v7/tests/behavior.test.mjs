import test from 'node:test';
import assert from 'node:assert/strict';
import { createLamb, targets, walkable } from '../navigation.mjs';
import { createBehavior } from '../behavior.mjs';

function randomFor(seed) {
  return () => {
    seed = (Math.imul(seed,1664525)+1013904223) >>> 0;
    return seed/4294967296;
  };
}
const tick = (behavior, seconds) => {
  for (let i=0; i<seconds*30; i++) behavior.update(1/30);
};

test('rotinas espontâneas variam e incluem janela, descanso e despertar', () => {
  const signatures = new Set();
  for (let seed=69; seed<=100; seed++) {
    const lamb = createLamb(), behavior = createBehavior(lamb,randomFor(seed));
    const activities = new Set(), changes = [];
    let prior;
    for (let frame=0; frame<30*170; frame++) {
      behavior.update(1/30);
      assert.ok(walkable(lamb.x,lamb.y));
      if (behavior.mode !== prior) changes.push([frame,behavior.mode]);
      prior = behavior.mode;
      if (prior === 'curious' && lamb.x===targets.window.x) activities.add('window');
      if (prior === 'sleeping' && lamb.x===targets.bed.x) activities.add('bed');
      if (prior === 'waking') activities.add('wake');
    }
    assert.equal(activities.size,3);
    signatures.add(JSON.stringify(changes));
  }
  assert.ok(signatures.size>22);
});

test('carinho durante caminhada e observação preserva ação e posição', () => {
  const lamb = createLamb(), behavior = createBehavior(lamb,()=>.17);
  tick(behavior,4.1);
  assert.equal(behavior.mode,'walking');
  const target = lamb.target, x = lamb.x, y = lamb.y;
  behavior.pet();
  assert.equal(behavior.mode,'interacting');
  assert.equal(lamb.pose,'pet');
  tick(behavior,.5);
  assert.equal(lamb.x,x);
  assert.equal(lamb.y,y);
  assert.equal(lamb.target,target);
  tick(behavior,3);
  assert.equal(behavior.mode,'curious');
  behavior.pet();
  tick(behavior,1.2);
  assert.equal(behavior.mode,'curious');
  assert.equal(lamb.pose,'look');
});

test('carinho no sono provoca reação deitada e retoma o repouso', () => {
  const lamb = createLamb(), behavior = createBehavior(lamb,()=>.7);
  for (let i=0;i<30*150 && behavior.mode!=='sleeping';i++) behavior.update(1/30);
  assert.equal(behavior.mode,'sleeping');
  const {x,y} = lamb;
  behavior.pet();
  assert.equal(lamb.pose,'stir');
  tick(behavior,1.2);
  assert.equal(lamb.pose,'sleep');
  assert.equal(lamb.x,x);
  assert.equal(lamb.y,y);
});

test('toques rápidos geram reação leve e convite funciona como sugestão', () => {
  const lamb = createLamb(), behavior = createBehavior(lamb,()=>.71);
  assert.equal(behavior.invite('bed'),false);
  assert.equal(behavior.suggestion().id,'window');
  assert.equal(behavior.invite('window'),true);
  assert.equal(behavior.mode,'calm');
  for (let i=0;i<4;i++) behavior.pet();
  assert.equal(lamb.pose,'ruffled');
  tick(behavior,1.2);
  assert.equal(lamb.pose,'sit');
});
