import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { books } from '../dist/bible-catalog.js';
import { normalizeState } from '../dist/state.js';
import { studyProgress, themeExploration } from '../dist/study-progress.js';

test('every book offered by the Bible catalog has all of its chapters', () => {
  assert.equal(books.length, 66);
  for (const [code, title, chapterCount] of books) {
    const url = new URL(`../dist/assets/webp/${code}.json`, import.meta.url);
    const chapters = JSON.parse(readFileSync(url, 'utf8'));
    assert.equal(Object.keys(chapters).length, chapterCount, title);
    for (let chapter = 1; chapter <= chapterCount; chapter++) {
      const verses = Object.values(chapters[chapter] ?? {});
      assert.ok(verses.every(text => typeof text === 'string') && verses.some(text => text.trim()), `${title} ${chapter}`);
    }
  }
});

test('satchel theme ranking uses completed studies and deduplicated, authored chapter links', () => {
  const state = normalizeState({completed:true, scripture:{
    readChapters:['MAT:25','MAT:25','JOS:9','MAT:14'],
    position:{book:'MAT',chapter:18},
    studies:{waves:{completedAt:'2026-11-10T00:00:00Z'}, forgiveness:{step:3}}
  }});
  assert.equal(studyProgress(state).chapters,3);
  assert.equal(studyProgress(state).discoveries,2);
  assert.deepEqual(themeExploration(state),[
    ['Faith & Courage',2], ['Compassion & Service',1], ['Faith & Guidance',1], ['Forgiveness',0]
  ]);
  state.scripture.readChapters = state.scripture.readChapters.filter(key => key !== 'MAT:25');
  assert.equal(new Map(themeExploration(state)).get('Compassion & Service'),0);
});
