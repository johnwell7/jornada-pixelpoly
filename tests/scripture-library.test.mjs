import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { books } from '../dist/bible-catalog.js';

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
