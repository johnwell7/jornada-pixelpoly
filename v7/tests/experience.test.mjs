import test from 'node:test';
import assert from 'node:assert/strict';
import { activities } from '../activities.mjs';
import { createBehavior } from '../behavior.mjs';
import { cameraViewport, clearSegment, createLamb, follow, go, targets, world } from '../navigation.mjs';

function seeded(seed) {
  return () => ((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
}
function simulate(seconds, random, catalog) {
  const events=[], lamb=createLamb();
  const behavior=createBehavior(lamb,random,{catalog,observe:event=>events.push(event)});
  let walking=0;
  for (let n=0;n<seconds*30;n++) {
    behavior.update(1/30);
    if (behavior.mode==='walking') walking+=1/30;
  }
  return {events,lamb,walking};
}

test('tela vertical é coberta com escala inteira e enquadra a ovelha de perto',()=>{
  for (const [w,h] of [[320,568],[360,800],[390,844],[430,932],[540,960]]) {
    const view=cameraViewport(w,h);
    assert.equal(view.mobile,true);
    assert.ok(Number.isInteger(view.scale));
    assert.ok(view.width*view.scale>=w && view.height*view.scale>=h);
    assert.ok(view.width<120 && view.width>75);
    assert.ok(view.height<=world.height);
    const lamb=createLamb(), camera={x:0,y:0};
    follow(camera,lamb,view,Infinity);
    const initial={...camera};
    lamb.x+=3;
    follow(camera,lamb,view,1/60);
    assert.deepEqual(camera,initial);
    lamb.x+=30;
    follow(camera,lamb,view,1/60);
    assert.ok(camera.x>initial.x && camera.x<lamb.x-view.width/2);
  }
});
test('15 minutos fazem pausas longas, alternam durações e variam os trajetos',()=>{
  for (const seed of [29,47,71,103,270]) {
    const {events,walking}=simulate(900,seeded(seed));
    const starts=events.filter(e=>e.type==='start');
    const ids=starts.map(e=>e.id);
    assert.equal(new Set(ids).size,activities.length);
    assert.ok(walking>25 && walking<900*.31);
    const triples = ids.filter((id,i)=>i>1&&id===ids[i-1]&&id===ids[i-2]);
    assert.ok(triples.length<=1);
    assert.ok(!ids.some((_,i)=>{
      const phrase=ids.slice(i,i+3).join();
      return i+9<=ids.length && phrase===ids.slice(i+3,i+6).join() && phrase===ids.slice(i+6,i+9).join();
    }));
    const sequences=new Set(ids.slice(2).map((id,i)=>[ids[i],ids[i+1],id].join('>')));
    assert.ok(sequences.size>20);
    const phases=events.filter(e=>e.type==='phase'&&e.mode==='sleeping');
    assert.ok(phases.length>=3&&Math.max(...phases.map(e=>e.duration))-Math.min(...phases.map(e=>e.duration))>8);
    const routes=events.filter(e=>e.type==='travel');
    assert.ok(routes.length>10 && new Set(routes.map(e=>e.route.map(p=>[p.x,p.y].join(',')).join(';'))).size>5);
    routes.forEach(({from,route})=>route.forEach((point,i)=>assert.ok(clearSegment(i?route[i-1]:from,point))));
  }
});
test('um ponto de interesse externo herda navegação, animação e transições',()=>{
  const point={x:235,y:210};
  const book={
    id:'test-book',location:{x:245,y:188},approach:{...point,face:'east',pose:'look'},interaction:'inspect',
    available:()=>true,weight:()=>1,after:[{mode:'curious',pose:'look',duration:[3,4]},{mode:'calm',pose:'sit',duration:[2,3]}]
  };
  const {events}=simulate(30,seeded(11),[book]);
  assert.deepEqual(events.find(e=>e.type==='arrive').at,point);
  assert.ok(events.some(e=>e.id===book.id&&e.mode==='curious'));
  assert.ok(events.some(e=>e.id===book.id&&e.mode==='calm'));
  assert.ok(events.some(e=>e.id===book.id&&e.type==='finish'));
});

test('o mesmo par de destinos admite dois trajetos válidos',()=>{
  const origin=targets.rug, destination=targets.window;
  const direct={...createLamb(),...origin}, alternative={...createLamb(),...origin};
  assert.ok(go(direct,destination,'window',()=>.95));
  assert.ok(go(alternative,destination,'window',()=>0));
  assert.notDeepEqual(alternative.path,direct.path);
  assert.deepEqual(alternative.path.at(-1),destination);
  alternative.path.forEach((point,i)=>assert.ok(clearSegment(i?alternative.path[i-1]:origin,point)));
});
