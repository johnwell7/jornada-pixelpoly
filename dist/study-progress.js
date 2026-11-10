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

// A chapter counts for a theme only when the authored guide connects that theme
// to a passage in it. Repeated references to the same chapter count once per theme.
export function themeExploration(state) {
  const {complete} = studyProgress(state);
  const read = new Set(state.scripture.readChapters);
  const chapters = new Map();
  const counts = new Map();
  for (const {theme, primary, connection} of discoveries) {
    if (!chapters.has(theme)) chapters.set(theme, new Set());
    const linked = chapters.get(theme);
    for (const [book, chapter] of [primary, connection]) {
      const key = `${book}:${chapter}`;
      if (read.has(key)) linked.add(key);
    }
  }
  for (const [theme, linked] of chapters) counts.set(theme, linked.size);
  for (const {theme} of complete) counts.set(theme, counts.get(theme) + 1);
  if (state.completed) counts.set('Faith & Guidance', 1);
  return [...counts].sort(([a, n], [b, m]) => m - n || a.localeCompare(b));
}
