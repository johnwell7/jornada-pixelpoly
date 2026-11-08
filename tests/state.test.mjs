import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeState,completeStudy,parseProgress} from '../dist/state.js';
test('V0.1 progress remains compatible, including equipment and reflection',()=>{
 const old={found:true,equipped:true,completed:true,reflection:'Pause before reacting.',choice:'Pause and listen',completedAt:'2026-11-02T17:00:00.000Z'};
 const {scripture,...legacy}=normalizeState(JSON.parse(JSON.stringify(old)));
 assert.deepEqual(legacy,old);
 assert.equal(scripture.bookOfMormon,true);
 assert.deepEqual(scripture.studies,{});
 assert.equal(scripture.position,null);
});
test('an artifact cannot be equipped before discovery',()=>assert.equal(normalizeState({equipped:true}).equipped,false));
test('completion needs a reflection or takeaway; repeat visits do not grant another first completion',()=>{
 assert.equal(completeStudy(normalizeState()).accepted,false);
 const first=completeStudy(normalizeState({choice:'Notice small steps'}),'2026-11-02T18:00:00.000Z');
 assert.equal(first.firstCompletion,true);
 const again=completeStudy(first.state,'2026-11-03T18:00:00.000Z');
 assert.equal(again.firstCompletion,false);assert.equal(again.state.completedAt,first.state.completedAt);
});
test('progress export/import round-trip and malformed input rejection',()=>{
 const s=normalizeState({found:true,equipped:true,reflection:'<script>plain text</script>'});
 assert.deepEqual(parseProgress(JSON.stringify({app:'jornada',version:1,state:s})),s);
 assert.throws(()=>parseProgress('{bad'));
 assert.throws(()=>parseProgress(JSON.stringify({app:'other',version:1,state:s})));
 assert.throws(()=>normalizeState([]));
 assert.equal(normalizeState({reflection:'x'.repeat(3000)}).reflection.length,2000);
});
