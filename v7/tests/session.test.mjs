import test from 'node:test';
import assert from 'node:assert/strict';
import { createRoomSession } from '../room-session.mjs';

test('a sessão aceita comandos e publica atividades sem um renderizador ou DOM',()=>{
  const events=[];
  const session=createRoomSession({random:()=>.17,onActivity:event=>events.push(event)});
  assert.equal(session.suggestion()?.id,'window');
  assert.ok(session.invite('window'));
  for(let frame=0;frame<600 && session.observation().mode!=='walking';frame++) session.advance(1/30);
  assert.equal(session.observation().mode,'walking');
  const {x,y}=session.lamb;
  assert.equal(session.pet().time,session.time);
  session.advance(1/30);
  assert.equal(session.observation().mode,'interacting');
  assert.deepEqual([session.lamb.x,session.lamb.y],[x,y]);
  assert.deepEqual(events.filter(event=>['travel','pet'].includes(event.type)).map(event=>event.type),['travel','pet']);
});
