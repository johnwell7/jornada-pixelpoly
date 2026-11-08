import {books} from './bible-catalog.js';
import {discoveries} from './discoveries.js';

export function normalizeReadChapters(value) {
  const valid = Array.isArray(value) ? value.filter(key => {
    if (typeof key !== 'string') return false;
    const match = /^([A-Z0-9]{3}):([1-9]\d*)$/.exec(key);
    return match && books.some(([code,,count]) => code === match[1] && Number(match[2]) <= count);
  }) : [];
  return [...new Set(valid)];
}

export function studyProgress(state) {
  const complete = discoveries.filter(study => state.scripture.studies[study.id]?.completedAt);
  const themes = new Set(complete.map(study => study.theme));
  if (state.completed) themes.add('Faith & Guidance');
  return {
    complete, themes,
    chapters: state.scripture.readChapters.length,
    discoveries: complete.length + Number(state.completed)
  };
}
