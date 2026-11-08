import {normalizeScripture} from './scripture-state.js';
export const STORAGE_KEY = 'jornada-v1';
export const takeaways = ['Pause and listen', 'Notice small steps', 'Return to His words'];
export function normalizeState(value = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid progress file.');
  const completed = value.completed === true;
  const scripture = normalizeScripture(value.scripture);
  scripture.bookOfMormon ??= Boolean(value.found === true || completed ||
    (typeof value.reflection === 'string' && value.reflection.trim()) || takeaways.includes(value.choice));
  return {scripture, found:value.found === true, equipped:value.found === true && value.equipped === true,
    completed, reflection:typeof value.reflection === 'string' ? value.reflection.slice(0,2000) : '',
    choice:takeaways.includes(value.choice) ? value.choice : '',
    completedAt:completed && typeof value.completedAt === 'string' && !Number.isNaN(Date.parse(value.completedAt)) ? value.completedAt : null};
}
export function completeStudy(state, now = new Date().toISOString()) {
  if (!state.choice && !state.reflection.trim()) return {state, firstCompletion:false, accepted:false};
  return {state:{...state, completed:true, completedAt:state.completedAt || now}, firstCompletion:!state.completed, accepted:true};
}
export function parseProgress(text) {
  const envelope=JSON.parse(text);
  if(envelope.app!=='jornada' || envelope.version!==1 || !envelope.state || typeof envelope.state.found!=='boolean' || typeof envelope.state.completed!=='boolean') throw new Error('Choose a Jornada progress backup.');
  return normalizeState(envelope.state);
}
