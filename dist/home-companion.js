const lines = {
  first: ['Welcome in. Pick a book if you like, or sit with me for a while.'],
  returned: ['Good to see you. There’s room on the rug.', 'Hello again. Make yourself comfortable.'],
  study: ['Anything in that passage you’d like to sit with?', 'There’s time to think about what you just read.', 'What part of that study stayed with you?'],
  artifact: [name => `You found ${name}! I wonder what story it carries.`, name => `I’m glad we came across ${name}.`],
  outfit: ['This feels like a good outfit for a little exploring.', 'A new look for the same old rug.', 'I think this suits me. What do you think?'],
  pet: ['Oh, that was nice.', 'Right behind the ears. How did you know?', 'I like having you close.'],
  lantern: ['I like the little pool of light it makes.', 'That tiny flame does a lot of work.'],
  quiet: ['I could sit on this rug for ages.', 'It’s nice to have a quiet corner.', 'I think I heard a page turn. Was that you?'],
  talk: [
    'I wonder what we’d find if we opened one of those books.',
    'It’s nice having you here. Want to sit for a bit?',
    'Every book on that shelf has a story waiting inside.',
    'There might be something good to find in the guided discoveries.'
  ]
};

const actions = [
  ['Open the shelf', 'library'],
  ['Stay a little longer', null],
  ['Let’s explore', 'bible'],
  ['Show me', 'discoveries']
];

const memoryKey = 'jornada-home-dialogue-v1';
const pause = 22000;
const idleTime = 65000;

export function homeCompanion(world) {
  let memory = {};
  try { memory = JSON.parse(localStorage.getItem(memoryKey)) || {}; } catch {}
  const shown = new Map(Object.entries(memory));
  let pending, active, automatic, hideTimer, idleTimer, lastLine = -Infinity, pets = 0;

  function close(restoreFocus = false) {
    clearTimeout(hideTimer);
    const bubble = world.querySelector('#home-dialogue');
    const moveFocus = restoreFocus && bubble.contains(document.activeElement);
    bubble.hidden = true;
    bubble.querySelector('[data-home-line]').textContent = '';
    active = null;
    const lamb = world.querySelector('.lamb');
    lamb.setAttribute('aria-expanded', 'false');
    if (moveFocus) lamb.focus({preventScroll:true});
  }

  function speak(kind, name, requested = false) {
    if (world.inert || document.hidden || active?.requested || (!requested && performance.now() - lastLine < pause)) return false;
    const options = lines[kind];
    const recent = shown.get(kind);
    const index = Number.isInteger(recent) && recent >= 0 ? (recent + 1) % options.length : 0;
    const line = options[index];
    const bubble = world.querySelector('#home-dialogue');
    const controls = bubble.querySelector('[data-home-options]');
    const choice = controls.querySelector('[data-home-choice]');
    clearTimeout(hideTimer);
    active = {requested};
    bubble.hidden = false;
    bubble.classList.toggle('is-conversation', requested);
    controls.hidden = !requested;
    const [label, route] = actions[kind === 'talk' ? index : 1];
    choice.textContent = label;
    if (route) {
      choice.dataset.view = route;
      delete choice.dataset.action;
    } else {
      choice.dataset.action = 'home-dismiss';
      delete choice.dataset.view;
    }
    controls.querySelector('[data-home-later]').hidden = !route;
    world.querySelector('.lamb').setAttribute('aria-expanded', String(requested));
    bubble.querySelector('[data-home-line]').textContent = typeof line === 'function' ? line(name) : line;
    shown.set(kind, index);
    try { localStorage.setItem(memoryKey, JSON.stringify(Object.fromEntries(shown))); } catch {}
    lastLine = performance.now();
    if (!requested) hideTimer = setTimeout(close, 5600);
    return true;
  }

  function startIdle() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (!active) {
        const lamb = world.querySelector('.lamb');
        if (!['sleeping','drowsy'].includes(lamb.dataset.bpState)) speak('quiet');
      }
      startIdle();
    }, idleTime);
  }

  return {
    note(kind, name) { pending = {kind, name}; },
    enter() {
      clearTimeout(automatic);
      startIdle();
      const context = pending || {kind:shown.has('first') ? 'returned' : 'first'};
      const delay = pending ? Math.max(850, pause - (performance.now() - lastLine)) : 850;
      automatic = setTimeout(() => {
        if (speak(context.kind, context.name) && pending === context) pending = null;
      }, delay);
    },
    leave() {
      clearTimeout(automatic);
      clearTimeout(idleTimer);
      close();
    },
    touch(talk = false) {
      clearTimeout(automatic);
      startIdle();
      if (talk) {
        const context = pending;
        if (speak(context?.kind || 'talk', context?.name, true)) pending = null;
      } else if (++pets % 3 === 0) speak('pet');
    },
    lantern() {
      startIdle();
      if (!active) speak('lantern');
    },
    dismiss() {
      if (!active) return false;
      close(true);
      startIdle();
      return true;
    }
  };
}
