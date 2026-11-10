import {studyProgress} from './study-progress.js';
import {books} from './bible-catalog.js';
import {discoveries} from './discoveries.js';

const translation = 'World English Bible · WEBP';
const byBook = new Map(books.map(book => [book[0], book]));
const byStudy = new Map(discoveries.map(study => [study.id, study]));
const cache = new Map();

function loadBook(code) {
  if (!cache.has(code)) {
    const pending = fetch(new URL(`./assets/webp/${code}.json`, import.meta.url))
      .then(response => {
        if (!response.ok) throw new Error('Unable to open this book.');
        return response.json();
      })
      .catch(error => { cache.delete(code); throw error; });
    cache.set(code, pending);
  }
  return cache.get(code);
}

const verseNumber = label => Number.parseInt(label, 10);
const includesVerse = (label, number) => {
  const [first, last = first] = label.split('-').map(verseNumber);
  return first <= number && number <= last;
};

function reference([code, chapter, first, last = first]) {
  return `${byBook.get(code)[1]} ${chapter}${first ? `:${first}${last !== first ? `–${last}` : ''}` : ''}`;
}

function parseReference(input) {
  const match = input.trim().match(/^(.+?)\s+(\d+)(?::(\d+)(?:\s*[-–—]\s*(\d+))?)?$/i);
  if (!match) return null;
  const [, name, chapter, first, last = first] = match;
  const book = books.find(([code, title]) => [code, title].some(key => key.toLowerCase() === name.toLowerCase()));
  if (!book || +chapter < 1 || +chapter > book[2] || (first && (+first < 1 || +last < +first))) return null;
  return [book[0], +chapter, first ? +first : null, last ? +last : null];
}

export function scriptureUI({getState, save, show, shell, esc, completed, portrait, animate}) {
  const data = () => getState().scripture;
  const libraryEnabled = () => data().bookOfMormon;
  const button = (label, command, value = '', kind = 'secondary') =>
    `<button type="button" class="button ${kind}" data-scripture="${command}" data-value="${value}">${esc(label)}</button>`;
  const link = (label, view) => `<button type="button" class="button secondary" data-view="${view}">${esc(label)}</button>`;
  const screen = (title, body, back = 'library', kicker = 'SCRIPTURE LIBRARY') =>
    shell(title, `<div class="scripture-ui">${body}</div>`, {back, kicker, icon:'book'});
  const passage = ([book, chapter, first, last]) =>
    `<div class="passage-text" data-passage="${book},${chapter},${first},${last}"><p role="status">Opening passage…</p></div>`;
  const themes = [...new Set(discoveries.map(study => study.theme))];
  let companionMotion, copyTimer, commentTimer, lastComment;
  const dispose = () => {
    companionMotion?.dispose();
    companionMotion = null;
    clearTimeout(copyTimer);
    clearTimeout(commentTimer);
  };
  let journeyFilter = 'discoveries';
  let readerRange = null;
  let browsingBook;
  let activeStudy = byStudy.has(data().last) ? data().last : discoveries[0].id;
  const newRecord = () => ({step:0,reflection:'',answer:'',connected:false,completedAt:null});
  const getRecord = () => data().studies[activeStudy] ??= newRecord();

  const panels = {
    library: () => screen('The Scripture Shelf', `
      <p>Pick a passage or follow a story a little further.</p>
      <div class="scripture-stack">${link('Explore Scripture', 'bible')}${link('Guided Discoveries', 'discoveries')}
      ${data().last ? button('Continue Exploring', 'resume', '', 'primary') : ''}</div>
      ${libraryEnabled() ? `<section class="text-section"><h3>Book of Mormon</h3><p>One guided study with links to the source text.</p>${link('Small things. Quiet direction.', 'study')}</section>` : ''}
      ${data().position && !data().librariesHintSeen ? `<section class="text-section"><p><strong>Your lamb</strong> · “You can choose which scripture collections appear on this shelf.”</p><div class="button-row">${button('Show me', 'hint', 'show')}${button('Maybe later', 'hint')}</div></section>` : ''}
      ${link('Scripture Libraries', 'scripture-settings')}`, 'home'),
    bible: () => screen('Explore Scripture', `
      <p class="scripture-credit">${translation}</p>
      <form data-reference class="reference-form"><label for="scripture-reference">Go to a reference</label><div>
        <input id="scripture-reference" name="reference" placeholder="Matthew 5:1–12" required>
        <button class="button primary">Go</button></div><p data-error role="status"></p></form>
      ${[['OT','Old Testament'],['NT','New Testament']].map(([part, title]) =>
        `<details><summary>${title}</summary><div class="scripture-grid">${books.filter(book => book[3] === part).map(([code,name]) => button(name,'book',code)).join('')}</div></details>`).join('')}`),
    chapters: () => {
      const [code, name, count] = byBook.get(browsingBook || data().position?.book || 'GEN');
      return screen(name, `<p>Select a chapter.</p><div class="scripture-grid chapter-grid">${Array.from({length:count}, (_, i) => button(String(i+1),'read',`${code},${i+1}`)).join('')}</div>`, 'bible');
    },
    reader: () => {
      const {book, chapter} = data().position || {book:'GEN',chapter:1};
      const index = books.findIndex(([code]) => code === book);
      const previous = chapter > 1 ? [book, chapter-1] : index > 0 ? [books[index-1][0], books[index-1][2]] : null;
      const next = chapter < books[index][2] ? [book, chapter+1] : index < books.length-1 ? [books[index+1][0],1] : null;
      const nav = `<div class="button-row">${previous ? button('Previous chapter','read',previous.join(',')) : ''}
        ${link('Chapters','chapters')}${next ? button('Next chapter','read',next.join(',')) : ''}</div>`;
      return `<p class="verse-feedback" role="status" aria-live="polite" aria-atomic="true"></p>
      ${screen(reference([book,chapter]), `<p class="scripture-credit">${translation}</p>${nav}
        <div class="passage-text reader-text" data-reader="${book},${chapter}"><p role="status">Opening chapter…</p></div>
        <div class="button-row" data-reading-actions hidden>${readButton(book,chapter)}</div>${nav}`, 'bible')}`;
    },
    discoveries: () => screen('Guided Discoveries', `<div class="scripture-stack">${themes.map(theme => `
      <details class="study-theme"><summary>${esc(theme)}</summary>
        ${discoveries.filter(study => study.theme === theme).map(study => `
          <section class="text-section"><p class="eyebrow">${reference(study.primary)}</p><h3>${esc(study.title)}</h3><p>${esc(study.introduction)}</p>
          ${button(data().studies[study.id]?.completedAt ? 'Revisit' : data().studies[study.id] ? 'Continue' : 'Explore','study',study.id)}</section>`).join('')}
      </details>`).join('')}</div>`),
    guided: () => {
      const study = byStudy.get(activeStudy);
      const record = data().studies[activeStudy] || newRecord();
      const step = record.step;
      const stages = ['Invitation','Passage','Context','Connection','Reflection'];
      const body = [
        `<p>“I found something in the Scriptures. Want to explore it?”</p><p>${esc(study.introduction)}</p>`,
        `<h3>${reference(study.primary)}</h3><p class="scripture-credit">${translation}</p>${passage(study.primary)}`,
        `<h3>What happens in the passage</h3><p>${esc(study.context)}</p>`,
        `<h3>${reference(study.connection)}</h3><p class="scripture-credit">${translation}</p>${passage(study.connection)}<h3>Why they connect</h3><p>${esc(study.discovery)}</p>`,
        `<label for="guided-reflection">${esc(study.prompt)}</label><textarea id="guided-reflection" data-guided-reflection maxlength="2000" placeholder="Optional reflection">${esc(record.reflection)}</textarea>
          <div class="choices">${study.answers.map((answer,i) => `<button type="button" class="choice" aria-pressed="${answer === record.answer}" data-scripture="answer" data-value="${i}">${esc(answer)}</button>`).join('')}</div>`
      ][step];
      return screen(study.title, `<p class="eyebrow">${esc(study.theme)} · ${step+1} / 5 · ${stages[step]}</p>${body}
        <div class="button-row">${step ? button('Back','step',step-1) : link('Maybe later','discoveries')}
        ${step === 4 ? button('Finish discovery','finish','','primary') : button(step === 0 ? 'Let’s explore' : 'Continue','step',step+1,'primary')}</div>`, 'discoveries', 'GUIDED DISCOVERY');
    },
    'discovery-complete': () => {
      const next = discoveries.find(study => study.theme === byStudy.get(activeStudy).theme && !data().studies[study.id]?.completedAt);
      return screen('Discovery recorded', `<p><strong>Your lamb</strong> · “Want to see where this leads next?”</p><div class="button-row">
        ${next ? button('Keep exploring','study',next.id) : link('Guided Discoveries','discoveries')}
        ${link('Back home','home')}</div>`, 'discoveries', 'GUIDED DISCOVERY');
    },
    'scripture-settings': () => screen('Scripture Libraries', `
      <section class="text-section"><h3>Bible</h3><p>Active · ${translation} · 66 books</p></section>
      <section class="text-section"><h3>Book of Mormon</h3><p>Optional · One guided study with links to official passages. Your reflections and artifacts stay saved when this collection is turned off.</p>
      ${button(libraryEnabled() ? 'Turn off Book of Mormon' : 'Enable Book of Mormon','toggle')}</section>`, 'settings')
  };

  function mountCompanion(root, view) {
    if (!Object.hasOwn(panels, view) && view !== 'study') return;
    root.classList.add('has-reading-lamb');
    const art = portrait();
    const companion = view === 'reader'
      ? `<button type="button" class="reader-lamb-art" data-scripture="companion" aria-label="Talk to your reading lamb" aria-expanded="false" aria-controls="lamb-comment">${art}</button>
         <aside id="lamb-comment" class="lamb-comment" aria-label="Your reading lamb" hidden>
           <button type="button" class="lamb-comment-close" data-scripture="dismiss-companion" aria-label="Dismiss lamb comment">×</button>
           <div data-lamb-context></div>
         </aside>`
      : `<div class="reader-lamb-art">${art}</div>`;
    root.querySelector('.panel-header').insertAdjacentHTML('beforeend', `<div class="reader-perch">${companion}</div>`);
  }

  function read(code, chapter, first = null, last = first, retainVerse = false) {
    const verse = retainVerse ? data().position?.verse || '' : first ? String(first) : '';
    browsingBook = code;
    data().position = {book:code,chapter,verse};
    data().last = 'reader';
    readerRange = first ? {code,chapter,first,last} : null;
    save();
    show('reader');
  }

  function openStudy(id) {
    if (!byStudy.has(id)) return;
    activeStudy = id;
    getRecord();
    data().last = id;
    save();
    show('guided');
  }

  function selectVerse(node) {
    const chapter = node.closest('[data-reader]');
    chapter.querySelector('[aria-current]')?.removeAttribute('aria-current');
    node.setAttribute('aria-current','true');
    const [code, number] = chapter.dataset.reader.split(',');
    data().position = {book:code, chapter:+number, verse:node.dataset.value};
    data().last = 'reader';
    save();
    return `${byBook.get(code)[1]} ${number}:${node.dataset.value}`;
  }

  async function copyVerse(node) {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed && node.contains(selection.anchorNode)) return;
    const feedback = node.closest('dialog').querySelector('.verse-feedback');
    const title = selectVerse(node);
    const text = `${node.querySelector('.verse-copy').textContent} — ${title} (WEBP)`;
    let message = 'Verse copied';
    try { await navigator.clipboard.writeText(text); }
    catch { message = 'Copy unavailable. Select the verse text to copy it manually.'; }
    if (!feedback.isConnected || !feedback.closest('dialog').open) return;
    clearTimeout(copyTimer);
    feedback.textContent = message;
    copyTimer = setTimeout(() => { feedback.textContent = ''; }, 2200);
  }

  function currentTopics(root) {
    const [code, chapter] = root.querySelector('[data-reader]').dataset.reader.split(',');
    const verse = data().position?.verse;
    const selected = verseNumber(verse || '');
    const matches = ([book,number,first,last]) => book === code && number === +chapter &&
      (!verse || (selected <= last && (selected >= first || includesVerse(verse,first))));
    return discoveries.filter(study => [study.primary,study.connection].some(matches));
  }

  function dismissCompanion(root, restoreFocus = true) {
    const bubble = root.querySelector('.lamb-comment');
    if (!bubble || bubble.hidden) return false;
    clearTimeout(commentTimer);
    bubble.hidden = true;
    const trigger = root.querySelector('.reader-lamb-art');
    trigger.setAttribute('aria-expanded','false');
    if (restoreFocus) trigger.focus({preventScroll:true});
    return true;
  }

  function readButton(book, chapter) {
    const key = `${book}:${chapter}`;
    const marked = data().readChapters.includes(key);
    return `<span data-read-status role="status">${marked ? 'Chapter marked as read' : ''}</span>
      ${button(marked ? 'Undo read mark' : 'Mark as Read','mark',key,marked ? 'secondary' : 'primary')}`;
  }

  function openCompanion(node, expanded = false) {
    const root = node.closest('dialog');
    const bubble = root.querySelector('.lamb-comment');
    if (!expanded && dismissCompanion(root)) return;
    clearTimeout(commentTimer);
    companionMotion?.pet();
    const content = bubble.querySelector('[data-lamb-context]');
    const topics = currentTopics(root);
    const [code, chapter] = root.querySelector('[data-reader]').dataset.reader.split(',');
    if (expanded) {
      content.innerHTML = topics.map(study => {
        const {id} = study;
        const [, , first, last] = study.primary;
        const verse = data().position?.verse;
        const selected = verseNumber(verse || '');
        const onPrimary = study.primary[0] === code && study.primary[1] === +chapter &&
          (!verse || (selected <= last && (selected >= first || includesVerse(verse,first))));
        const related = onPrimary ? study.connection : study.primary;
        return `<section class="lamb-topic"><h3>${esc(study.title)}</h3>${button('Open guided discovery','study',id)}
          <details><summary>What happened here?</summary><p>${esc(study.context)}</p><small>${reference(study.primary)}</small></details>
          <details><summary>Discover connections</summary><p>${esc(study.discovery)}</p>${button(reference(related),'open-passage',related.join(','))}</details>
          <details><summary>Reflect</summary><label for="lamb-reflection-${id}">${esc(study.prompt)}</label>
            <textarea id="lamb-reflection-${id}" data-companion-reflection="${id}" maxlength="2000" placeholder="Optional reflection">${esc(data().studies[id]?.reflection || '')}</textarea></details>
        </section>`;
      }).join('');
    } else {
      const contextual = {
        'LUK:10': 'Jesus tells a story about someone who stopped to help a stranger.',
        'MAT:14': 'Peter steps out of the boat and calls for help when he starts to sink.',
        'MAT:18': 'Jesus answers Peter’s question about forgiveness with a story about two debts.'
      };
      const lines = ['I’ll keep you company while you read.', 'Let’s see what we can discover!', 'We can take our time with this chapter.'];
      const choices = [topics.length ? contextual[`${code}:${chapter}`] : null,...lines].filter(line => line && line !== lastComment);
      lastComment = choices[Math.floor(Math.random() * choices.length)];
      content.innerHTML = `<p>${esc(lastComment)}</p>${topics.length ? button('Explore a connection','expand-companion') : ''}`;
      commentTimer = setTimeout(() => {
        if (!bubble.contains(document.activeElement)) dismissCompanion(root, false);
      }, 6500);
    }
    bubble.hidden = false;
    root.querySelector('.reader-lamb-art').setAttribute('aria-expanded','true');
    if (expanded) {
      const heading = content.querySelector('h3');
      if (heading) {
        heading.tabIndex = -1;
        heading.focus({preventScroll:true});
      }
    }
  }

  async function hydrate(root) {
    const lamb = root.querySelector('.reader-lamb-art');
    if (lamb && !companionMotion) companionMotion = animate(lamb);
    for (const node of root.querySelectorAll('[data-reader],[data-passage]')) {
      const reader = Boolean(node.dataset.reader);
      const [code, chapter, first, last] = (node.dataset.reader || node.dataset.passage).split(',');
      try {
        const entries = Object.entries((await loadBook(code))[chapter])
          .filter(([,text]) => text.trim())
          .sort(([a],[b]) => verseNumber(a)-verseNumber(b));
        if (!node.isConnected) continue;
        const range = readerRange?.code === code && readerRange.chapter === +chapter ? readerRange : null;
        if (reader && range && ![range.first, range.last].every(number => entries.some(([label]) => includesVerse(label,number)))) {
          node.insertAdjacentHTML('beforebegin','<p role="status">That verse is not numbered in this edition. The full chapter is shown below.</p>');
        }
        node.replaceChildren();
        for (const [label, text] of entries) {
          const number = verseNumber(label);
          if (!reader && (number > +last || (number < +first && !includesVerse(label,+first)))) continue;
          const marked = reader && range && number <= range.last && (number >= range.first || includesVerse(label,range.first));
          const content = `<span class="verse-number">${esc(label)}</span><span class="verse-copy">${esc(text)}</span>`;
          node.insertAdjacentHTML('beforeend', reader
            ? `<button type="button" class="verse-row${marked ? ' marked' : ''}" data-scripture="verse" data-value="${esc(label)}">${content}</button>`
            : `<p class="verse-row">${content}</p>`);
        }
        if (reader) {
          node.parentElement.querySelector('[data-reading-actions]').hidden = false;
          const verses = [...node.querySelectorAll('.verse-row')];
          const selected = verses.find(verse => verse.dataset.value === data().position?.verse || (range && includesVerse(verse.dataset.value,range.first)));
          if (selected) {
            selectVerse(selected);
            const page = node.closest('.panel-scroll');
            const {top, height} = selected.getBoundingClientRect();
            page.scrollTop += top - page.getBoundingClientRect().top - (page.clientHeight - height) / 2;
          }
        }
      } catch {
        if (node.isConnected) node.innerHTML = `<p role="status">Couldn’t load the text.</p>${button('Try again','retry')}`;
      }
    }
  }

  function input(event) {
    const id = event.target.dataset.companionReflection;
    if (byStudy.has(id)) {
      data().studies[id] ??= newRecord();
      data().studies[id].reflection = event.target.value;
      save();
    }
    if (event.target.matches('[data-guided-reflection]')) {
      getRecord().reflection = event.target.value;
      save();
    }
  }

  async function submit(event) {
    if (!event.target.matches('[data-reference]')) return;
    event.preventDefault();
    const form = event.target;
    const error = form.querySelector('[data-error]');
    const parsed = parseReference(form.elements.reference.value);
    if (!parsed) {
      error.textContent = 'Enter a book and chapter, such as Matthew 5:1–12.';
      return;
    }
    try {
      const [code, chapter, first, last] = parsed;
      if (first) {
        const labels = Object.keys((await loadBook(code))[chapter]);
        if (![first,last].every(number => labels.some(label => includesVerse(label,number)))) {
          error.textContent = 'Check the verse numbers in this edition.';
          return;
        }
      }
      if (form.isConnected) read(...parsed);
    } catch {
      error.textContent = 'Couldn’t load this reference. Please try again.';
    }
  }

  async function click(event) {
    const node = event.target.closest('[data-scripture]');
    if (!node) return;
    const {scripture:command, value} = node.dataset;
    switch (command) {
      case 'book':
        browsingBook = value;
        show('chapters'); break;
      case 'read': {
        const [code,chapter] = value.split(',');
        read(code,+chapter); break;
      }
      case 'resume':
        if (data().last === 'reader' && data().position) read(data().position.book,data().position.chapter,null,null,true);
        else openStudy(data().last);
        break;
      case 'verse': await copyVerse(node); break;
      case 'companion': openCompanion(node); break;
      case 'expand-companion': openCompanion(node,true); break;
      case 'dismiss-companion': dismissCompanion(node.closest('dialog')); break;
      case 'open-passage': {
        const [book, chapter, first, last] = value.split(',');
        read(book,+chapter,+first,+last); break;
      }
      case 'mark': {
        const chapters = data().readChapters;
        const index = chapters.indexOf(value);
        if (index === -1) chapters.push(value);
        else chapters.splice(index,1);
        save();
        const actions = node.parentElement;
        const marked = index === -1;
        actions.querySelector('[data-read-status]').textContent = marked ? 'Chapter marked as read' : 'Read mark removed';
        node.textContent = marked ? 'Undo read mark' : 'Mark as Read';
        node.classList.toggle('primary', !marked);
        node.classList.toggle('secondary', marked);
        break;
      }
      case 'journey-filter': setJourneyFilter(value); show('map'); break;
      case 'study': openStudy(value); break;
      case 'step': {
        const record = getRecord();
        record.step = +value;
        if (record.step >= 3) record.connected = true;
        data().last = activeStudy;
        save(); show('guided'); break;
      }
      case 'answer': {
        const record = getRecord();
        const answer = byStudy.get(activeStudy).answers[+value];
        record.answer = answer === record.answer ? '' : answer;
        save();
        for (const choice of node.parentElement.children) {
          choice.setAttribute('aria-pressed',String(byStudy.get(activeStudy).answers[+choice.dataset.value] === record.answer));
        }
        break;
      }
      case 'finish': {
        const record = getRecord();
        const first = !record.completedAt;
        record.completedAt ??= new Date().toISOString();
        record.step = 0;
        save();
        show('discovery-complete');
        if (first) completed();
        break;
      }
      case 'toggle':
        data().bookOfMormon = !libraryEnabled();
        save(); show('scripture-settings'); break;
      case 'hint':
        data().librariesHintSeen = true;
        save(); show(value === 'show' ? 'scripture-settings' : 'library'); break;
      case 'retry': hydrate(node.closest('.passage-text').parentElement); break;
    }
  }

  function setJourneyFilter(value) {
    journeyFilter = ['chapters','discoveries','themes'].includes(value) ? value : 'discoveries';
  }

  function journey() {
    const progress = studyProgress(getState());
    const labels = {chapters:'Chapters read',discoveries:'Discoveries',themes:'Themes explored'};
    const studyList = studies => `<div class="discovery-trail">${studies.map(study =>
      `<div><span class="eyebrow">${esc(study.theme)}</span>${button(study.title,'study',study.id)}</div>`).join('')}</div>`;
    const legacy = getState().completed ? `<p>${link('Small things. Quiet direction.', libraryEnabled() ? 'study' : 'scripture-settings')}</p>` : '';
    const results = {
      chapters: () => data().readChapters.length ? `<ul class="chapter-history">${[...data().readChapters].reverse().map(key => {
        const [code,chapter] = key.split(':');
        return `<li>${button(reference([code,chapter]),'read',`${code},${chapter}`)}</li>`;
      }).join('')}</ul>` : '<p>Chapters appear here when you mark them as read.</p>',
      discoveries: () => progress.discoveries ? studyList(progress.complete) + legacy : '<p>Completed discoveries will appear here.</p>',
      themes: () => progress.themes.size ? [...progress.themes].map(theme =>
        `<section><h4>${esc(theme)}</h4>${theme === 'Faith & Guidance' ? legacy : studyList(progress.complete.filter(study => study.theme === theme))}</section>`).join('') : '<p>Complete a discovery to explore its theme.</p>'
    };
    return `<section class="text-section journey-progress"><div class="button-row" aria-label="Journey history">${Object.entries(labels).map(([id,label]) =>
      button(label,'journey-filter',id,journeyFilter === id ? 'primary' : 'secondary')).join('')}</div>
      <h3>${labels[journeyFilter]}</h3>${results[journeyFilter]()}${link('Guided Discoveries','discoveries')}</section>`;
  }

  return {panels, libraryEnabled, mountCompanion, hydrate, input, submit, click, journey, setJourneyFilter, dispose, dismissCompanion};
}
