import {normalizeReadChapters} from './study-progress.js';
import {books} from './bible-catalog.js';
import {discoveries} from './discoveries.js';

export function normalizeScripture(value) {
  const studies = {};
  for (const study of discoveries) {
    const record = value?.studies?.[study.id];
    if (!record) continue;
    const completedAt = typeof record.completedAt === 'string' && Number.isFinite(Date.parse(record.completedAt)) ? record.completedAt : null;
    studies[study.id] = {
      step: Number.isInteger(record.step) ? Math.min(4, Math.max(0, record.step)) : 0,
      reflection: typeof record.reflection === 'string' ? record.reflection.slice(0, 2000) : '',
      answer: study.answers.includes(record.answer) ? record.answer : '',
      connected: record.connected === true,
      completedAt
    };
  }
  const position = value?.position;
  const book = books.find(([id]) => id === position?.book);
  return {
    studies,
    readChapters: normalizeReadChapters(value?.readChapters),
    position: book && Number.isInteger(position.chapter) && position.chapter >= 1 && position.chapter <= book[2]
      ? {book: book[0], chapter: position.chapter, verse: /^\d+[a-z]?(?:-\d+[a-z]?)?$/.test(position.verse) ? position.verse : ''}
      : null,
    last: value?.last === 'reader' || discoveries.some(study => study.id === value?.last) ? value.last : '',
    bookOfMormon: typeof value?.bookOfMormon === 'boolean' ? value.bookOfMormon : null,
    librariesHintSeen: value?.librariesHintSeen === true
  };
}
