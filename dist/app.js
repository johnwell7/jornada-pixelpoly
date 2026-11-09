import {animateBitpolyLantern} from './bitpoly-lantern.js';
import {applyLambSkin} from './lamb-skins.js';
import {hasAnimatedOutfit} from './lamb-frames.js';
import {scrollInspection, toggleScroll} from './pentateuch.js';
import {artifacts, artifactStatus, restoreArtifactDiscoveries} from './artifacts.js';
import {satchelArt, satchelMark} from './satchel-art.js';
import {discoveries} from './discoveries.js';
import {studyProgress} from './study-progress.js';
import {scriptureUI} from './scripture.js';
import {bitpolyLamb, bitpolyPlants, bitpolyShadow, bitpolyLantern} from './bitpoly-art.js';
import {animateBitpolyLamb, animateBitpolyPlants} from './bitpoly-motion.js';
import {sheep, artifact, icon, bagArt, bookArt} from './art.js';
import {content} from './content.js';
import {STORAGE_KEY, normalizeState, completeStudy, parseProgress, takeaways} from './state.js';
let state = restoreArtifactDiscoveries(normalizeState()), storageOK = true;
try {
  const raw = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  state = restoreArtifactDiscoveries(normalizeState(raw), raw);
} catch { storageOK = false; }

const artifactRoute = (entry, mode) => entry.id === 'liahona'
  ? ({item:'item', inspect:'inspect', reveal:'discover'})[mode]
  : `artifact-${mode}-${entry.id}`;
const artifactRoutes = new Map(artifacts.flatMap(entry =>
  (entry.exploration ? ['item','inspect','reveal','trail'] : ['item','inspect','reveal'])
    .map(mode => [artifactRoute(entry, mode), {entry, mode}])));
let artifactReaderReturn;
const missionaryTag = artifacts.find(entry => entry.id === 'missionary-tag');

function dressedSheep(studying = false) {
  if (!state.outfit || hasAnimatedOutfit(state.outfit)) {
    return bitpolyLamb({equipped:state.equipped, tag:state.missionaryTagEquipped, studying, outfit:state.outfit});
  }
  const drawing = applyLambSkin(sheep(state.equipped, studying), state.outfit, studying);
  if (studying) return drawing;
  if (!state.missionaryTagEquipped) return drawing;
  // Insert inside the animated chest, after the fleece and central equipment.
  return drawing.replace(/<\/g>(\s*<g class="lamb-paws">)/, `<image class="worn-missionary-tag"
    href="${missionaryTag.model}" x="533" y="658" width="118" height="81"
    transform="rotate(-9 592 698)" aria-hidden="true"/>
    </g>$1`);
}
const panel=document.querySelector('#panel');
const world=document.querySelector('#world');
let view='home', petCount=0, toastTimer, reactionTimer, returnFocus=null, pendingImport=null;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const action=(label,act,kind='primary')=>`<button class="button ${kind}" data-action="${act}">${label}</button>`;
const routeButton=(label,route,kind='secondary')=>`<button class="button ${kind}" data-view="${route}">${label}</button>`;
function toast(message){const el=document.querySelector('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),4000);}
function save(){refreshStudyStats();try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));storageOK=true;return true;}catch{storageOK=false;toast('Storage is unavailable. Export your progress to keep it.');return false;}}
const statItems = [
  ['chapters','book','Chapters','Chapters read'],
  ['discoveries','map','Discoveries','Completed discoveries'],
  ['themes','spark','Themes','Themes explored']
];
function refreshStudyStats() {
  const progress = studyProgress(state);
  const values = {...progress, themes:progress.themes.size};
  world.querySelectorAll('[data-stat]').forEach(node => { node.textContent = values[node.dataset.stat]; });
}
function studyStats() {
  const progress = studyProgress(state);
  const values = {...progress, themes:progress.themes.size};
  return `<div class="study-stats" role="group" aria-label="Study progress">${statItems.map(([id,symbol,short,label]) =>
    `<button type="button" data-view="map" data-journey-filter="${id}"><span aria-hidden="true">${icon(symbol)}</span>
      <strong data-stat="${id}">${values[id]}</strong><span aria-hidden="true">${short}</span><span class="stat-label">${label}</span></button>`).join('')}</div>`;
}
function home(){return `<div class="game-shell sunset-home"><header class="hud"><div class="wordmark">${icon('spark')}<span>jornada</span><span class="version">02</span></div><button class="round-button" data-view="settings" aria-label="Settings and progress backup">${icon('settings')}</button>${studyStats()}</header><main class="haven"><div class="stage" aria-label="Your lamb’s cozy home"><picture><img class="room" src="assets/bitpoly/room.png" width="941" height="1671" fetchpriority="high" alt="A warm sunset room with an arched window, wooden shelves, a glowing lantern, floor books, a satchel, and a woven rug"></picture>${bitpolyPlants()}
<svg class="window-sky" viewBox="0 0 941 1671" preserveAspectRatio="none" aria-hidden="true"><defs>
<clipPath id="sunset-window-panes"><path d="M61 453Q67 410 133 410V546L61 531ZM168 420Q225 458 233 513V565L168 550ZM61 567 133 582V700L61 692ZM168 589 233 603V706L168 700Z"/></clipPath>
<radialGradient id="sunset-mist"><stop stop-color="#ffe5c9" stop-opacity=".6"/><stop offset=".48" stop-color="#ffd3b3" stop-opacity=".25"/><stop offset="1" stop-color="#f9cab3" stop-opacity="0"/></radialGradient>
<linearGradient id="sunset-leading-fade"><stop offset=".65" stop-color="white"/><stop offset="1" stop-color="white" stop-opacity="0"/></linearGradient>
<mask id="sunset-mist-mask"><rect x="-170" y="435" width="215" height="245" fill="url(#sunset-leading-fade)"/></mask></defs>
<g clip-path="url(#sunset-window-panes)"><g class="window-cloud-drift" mask="url(#sunset-mist-mask)" fill="url(#sunset-mist)"><ellipse cx="-60" cy="472" rx="100" ry="22"/><ellipse cx="-101" cy="631" rx="65" ry="17" opacity=".6"/></g></g></svg>
<button class="shelf-hotspot" data-view="library" aria-label="Open the Scripture Shelf" title="Scripture Shelf"></button>${bitpolyLantern()}<div class="dust dust-one"></div><div class="dust dust-two"></div><div class="dust dust-three"></div><button class="scene-prop book-prop" data-view="library" aria-label="Open scriptures from the floor books"></button><button class="scene-prop bag-prop" data-view="inventory" aria-label="Open satchel"></button>${bitpolyShadow()}<div class="lamb-area"><div class="speech" id="speech" role="status"></div><button class="lamb" data-action="pet" aria-label="Pet your lamb">${dressedSheep()}</button><div class="hearts" aria-hidden="true">♡<span>✧</span>♡</div></div>${!state.found && scripture.libraryEnabled()?`<button class="found-object" data-view="discover" aria-label="Discover the curious brass object">${icon('spark')}<span>Something new</span></button>`:''}</div><div id="completion-note" class="completion-note" role="status"></div></main><nav class="dock" aria-label="Your haven"><button data-view="home" aria-label="Home" class="active">${icon('home')}<span>Home</span></button><button data-view="inventory">${icon('bag')}<span>Satchel</span>${(state.equipped || state.missionaryTagEquipped || state.outfit) ? `<i role="img" aria-label="${Number(state.equipped) + Number(state.missionaryTagEquipped) + Number(Boolean(state.outfit))} equipped"></i>` : '' }</button><button data-view="library">${icon('book')}<span>Study</span></button><button data-view="map">${icon('map')}<span>Journey</span></button></nav></div>`;}
let sheepMotion, plantMotion, lanternMotion;
function renderWorld(){sheepMotion?.dispose();plantMotion?.dispose();lanternMotion?.dispose();world.innerHTML=home();world.inert=panel.open;const lamb=world.querySelector(".lamb"),stage=world.querySelector(".stage");sheepMotion=animateBitpolyLamb(lamb);plantMotion=animateBitpolyPlants(stage);lanternMotion=animateBitpolyLantern(stage);bindLambDrag(stage,lamb);}
function bindLambDrag(stage, lamb) {
  stage.style.touchAction = 'pinch-zoom';
  let gesture;

  stage.addEventListener('pointerdown', event => {
    if (gesture || !event.isPrimary || event.button !== 0 ||
        event.target.closest('button:not(.lamb)')) return;
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, dragging: false, petted: false };
  });

  function lookAt(x, y) {
    const face = (lamb.querySelector('[data-bp-part="head"],.lamb-head')||lamb).getBoundingClientRect();
    const dx = (x - face.left - face.width / 2) / Math.max(face.width * .3, 1);
    const dy = (y - face.top - face.height * .62) / Math.max(face.height * .3, 1);
    const distance = Math.max(1, Math.hypot(dx, dy));
    lamb.style.setProperty('--gaze-x', `${dx / distance * 26}px`);
    lamb.style.setProperty('--gaze-y', `${dy / distance * 20}px`);
  }

  function clearLook() {
    lamb.style.removeProperty('--gaze-x');
    lamb.style.removeProperty('--gaze-y');
  }

  stage.addEventListener('pointermove', event => {
    const { clientX: x, clientY: y } = event;
    if (gesture?.id !== event.pointerId) {
      if (!gesture && event.pointerType === 'mouse' && event.buttons === 0) lookAt(x, y);
      return;
    }

    if (!gesture.dragging) {
      if (Math.hypot(x - gesture.x, y - gesture.y) < 8) return;
      gesture.dragging = true;
      stage.setPointerCapture(event.pointerId);
    }

    lookAt(x, y);
    if (gesture.petted) return;
    const body = lamb.getBoundingClientRect();
    const reachX = body.width * .62;
    const reachY = body.height * .58;
    if (Math.hypot((x - body.left - body.width / 2) / reachX,
                   (y - body.top - body.height / 2) / reachY) <= 1) {
      gesture.petted = true;
      react('pet');
    }
  });

  function finish(event) {
    if (gesture?.id !== event.pointerId) return;
    gesture = undefined;
    clearLook();
  }

  stage.addEventListener('pointerup', finish);
  stage.addEventListener('pointercancel', finish);
  stage.addEventListener('lostpointercapture', event => {
    if (event.target === stage) finish(event);
  });
  stage.addEventListener('pointerleave', event => {
    if (gesture?.dragging) return;
    finish(event);
    clearLook();
  });
}
function panelShell(title,body,options={}){return `<div class="panel-header">${options.back?`<button class="round-button" data-view="${options.back}" aria-label="${options.backLabel||'Go back'}">${icon('back')}</button>`:'<span class="panel-symbol">'+icon(options.icon||'spark')+'</span>'}<div><span class="eyebrow">${options.kicker||'THE LITTLE HAVEN'}</span><h2 id="panel-title" tabindex="-1">${title}</h2></div><button class="round-button close-button" data-action="close" aria-label="Close panel">${icon('close')}</button></div><div class="panel-scroll">${body}</div>`;}
function isArtifactEquipped(entry) {
  return entry.equipment === 'outfit' ? state.outfit === entry.id : Boolean(entry.equipment && state[entry.equipment]);
}

function inventory(){
  const equipped = artifacts.filter(isArtifactEquipped);
  const notes = discoveries.flatMap(({id,title}) => {
    const reflection = state.scripture.studies[id]?.reflection;
    return reflection?.trim() ? [[title,reflection]] : [];
  });
  if (state.reflection.trim()) notes.unshift(['Small things. Quiet direction.',state.reflection]);
  return `<div class="panel-scroll satchel-rig" lang="en">
    ${satchelArt()}
    <h2 class="stat-label" id="panel-title" tabindex="-1">Satchel</h2>
    <button class="satchel-hit satchel-image-close" type="button" data-action="close" aria-label="Close panel">${icon('close')}</button>
    <div class="satchel-image-tabs" role="group" aria-label="Satchel compartments">
      ${[['artifacts','Artifacts'],['paintings','Paintings'],['journal','Journal']].map(([id,label],i) =>
        `<button type="button" class="satchel-hit" data-action="satchel-tab" data-satchel-tab="${id}" aria-pressed="${i===0}">${satchelMark(id)}<span>${label}</span></button>`).join('')}
    </div>
    <section data-compartment="artifacts" aria-label="Artifacts">
      <div class="satchel-rig-grid" tabindex="0" role="region" aria-label="Artefatos da mochila. Role para ver mais espaços.">${artifacts.map(artifactSlot).join('')}${'<span class="satchel-rig-slot" aria-hidden="true">✦</span>'.repeat(Math.max(0,18-artifacts.length))}</div>
      <div class="satchel-rig-note">
        <div>${equipped.length
          ? `<button class="satchel-equipped" type="button" data-view="${artifactRoute(equipped[0], 'item')}" aria-label="Open equipped ${equipped[0].name}">
            <span class="satchel-equipped-status">${satchelMark('shield')}${equipped.length === 1 ? 'Equipped' : `${equipped.length} equipped`}</span>
            <span class="satchel-equipped-art"><img src="${equipped[0].inventoryImage}" alt="" decoding="async"></span>
          </button>`
          : routeButton('Artifact Explorations','artifact-trails','primary')}</div>
        <p><svg viewBox="0 0 70 57" aria-hidden="true"><path fill="#a3672d" d="m5 50 15-20 7 5 14-22 10 13 5-4 13 28H54L40 22 27 41l-7-6-12 15Z"/><path fill="#efc17a" d="m20 48 20-26 14 28Z"/><path fill="none" stroke="#a3672d" stroke-width="2" stroke-linecap="round" d="m22 12-5-5m13 2-2-6m11 5 1-7m9 10 4-6m3 11 5-4"/></svg><button class="artifact-trails-link" type="button" data-view="artifact-trails">There is room for more discoveries on your journey.</button></p>
      </div>
    </section>
    <section class="satchel-image-pocket" data-compartment="paintings" aria-label="Paintings" hidden>
      <div class="satchel-empty">${icon('map')}<h3>Paintings</h3><p>No paintings stored yet.</p></div>
    </section>
    <section class="satchel-image-pocket" data-compartment="journal" aria-label="Journal" hidden>
      <div class="satchel-journal"><h3>Journal</h3>${notes.length ? notes.map(([title,note]) =>
        `<details><summary>${esc(title)}</summary><p>${esc(note)}</p></details>`).join('') : '<p>Your study reflections appear here.</p>'}
      ${routeButton('Open Journey','map')}</div>
    </section>
  </div>`;
}
function selectSatchelTab(target) {
  panel.querySelectorAll('[data-satchel-tab]').forEach(tab => tab.setAttribute('aria-pressed',String(tab === target)));
  panel.querySelectorAll('[data-compartment]').forEach(pocket => {
    pocket.hidden = pocket.dataset.compartment !== target.dataset.satchelTab;
  });
}
function artifactSlot(entry) {
  if (artifactStatus(state, entry) !== 'stored') {
    return '<button class="satchel-rig-slot" type="button" data-view="artifact-trails" aria-label="Unknown artifact. Open artifact explorations">✦</button>';
  }
  const equipped = isArtifactEquipped(entry);
  return `<button class="satchel-rig-slot has-artifact artifact-slot" type="button" data-view="${artifactRoute(entry, 'item')}" aria-label="Open ${entry.name}${equipped ? ', equipped' : ''}">
    <img src="${entry.inventoryImage}" alt="" decoding="async">
    ${equipped ? '<span class="satchel-equipped-pin" aria-hidden="true">✓</span>' : ''}</button>`;
}

function artifactArtwork(entry) {
  return `<img class="artifact-full-art" src="${entry.presentation}" alt="${entry.name}" decoding="async">`;
}

function artifactReferences(entry, references = entry.relatedScriptures) {
  return `<ul class="artifact-references">${references.map(([label, destination]) => `<li>${destination.startsWith('https:')
    ? `<a href="${destination}" target="_blank" rel="noopener">${label} ↗</a>`
    : `<button type="button" class="button secondary" data-artifact-reading data-scripture="open-passage" data-value="${destination}">${label}</button>`}</li>`).join('')}</ul>`;
}

function artifactActions(entry) {
  if (!entry.equipment) return '';
  const equipped = isArtifactEquipped(entry);
  return `<p class="badge" id="artifact-status" role="status">${equipped ? `${satchelMark('shield')} Equipped` : 'In your satchel'}</p>
    <button class="button primary" data-action="equip" aria-describedby="artifact-status">${equipped ? 'Unequip' : 'Equip'}</button>`;
}

function item(entry) {
  return panelShell(entry.name, `${artifactArtwork(entry)}
    <div class="artifact-description"><p>${entry.description.en ?? entry.description.pt}</p>
      <div class="artifact-controls">${artifactActions(entry)}
      ${routeButton('Inspect',artifactRoute(entry, 'inspect'),entry.equipment ? 'secondary' : 'primary')}</div>
    </div>`, {back:'inventory',backLabel:'Back to satchel',kicker:entry.type});
}

function inspect(entry) {
  const liahona = entry.id === 'liahona';
  const enabled = !liahona || scripture.libraryEnabled();
  return panelShell(entry.name, `${artifactArtwork(entry)}
    <div class="artifact-description"><p>${entry.description.en ?? entry.description.pt}</p>
      ${entry.effect && enabled ? `<section class="artifact-effect"><h3>${entry.effect}</h3>
        ${liahona ? `<p>While equipped, the Liahona reveals an additional scripture connection in the guided study.</p>${routeButton('Open the study','study')}` : ''}
        ${artifactReferences(entry)}</section>` : ''}
      ${!entry.effect ? artifactReferences(entry) : ''}
      ${entry.scroll ? scrollInspection() : ''}
      <div class="artifact-controls">${artifactActions(entry)}${routeButton('Back to satchel','inventory')}</div>
    </div>`, {back:'inventory',backLabel:'Back to satchel',kicker:entry.type});
}

function discover(entry) {
  const status = artifactStatus(state, entry);
  return panelShell(entry.name, `${artifactArtwork(entry)}<div class="artifact-description">
    <p>${entry.description.en ?? entry.description.pt}</p>
    ${status === 'stored' ? routeButton('Open in satchel',artifactRoute(entry, 'item'),'primary')
      : action('Keep in my satchel',entry.id === 'liahona' ? 'collect' : 'store-artifact')}
    </div>`, {back:'artifact-trails',kicker:'A quiet discovery'});
}

function artifactTrails() {
  return panelShell('Artifact Explorations', `<div class="scripture-stack">${artifacts.map(entry => {
    const status = artifactStatus(state, entry);
    if (status === 'stored') return routeButton(entry.name,artifactRoute(entry, 'item'));
    if (status === 'revealed') return routeButton(`Revisit ${entry.name}`,artifactRoute(entry, 'reveal'));
    if (entry.id === 'liahona') {
      return scripture.libraryEnabled() ? routeButton('Follow a brass glimmer','discover') : '';
    }
    return routeButton(entry.exploration.title,artifactRoute(entry, 'trail'));
  }).join('')}</div>`, {back:'inventory',kicker:'Scripture explorations'});
}

function artifactTrail(entry) {
  const [primary] = entry.relatedScriptures;
  return panelShell(entry.exploration.title, `<div class="scripture-ui"><p>${entry.exploration.context}</p>
    <p class="scripture-credit">${primary[0]} · World English Bible</p>
    <div class="passage-text" data-passage="${primary[1]}"><p role="status">Opening passage…</p></div>
    ${artifactReferences(entry,[primary])}
    <p>${entry.exploration.prompt}</p>
    ${action('Finish exploration','finish-artifact')}</div>`, {back:'artifact-trails',kicker:'Scripture exploration'});
}

function artifactJournal() {
  const found = artifacts.filter(entry => artifactStatus(state, entry) !== 'unknown');
  return `<section class="text-section"><h3>Artifact discoveries</h3>
    ${found.length ? `<ul class="artifact-references">${found.map(entry => `<li>${routeButton(entry.name,
      artifactRoute(entry, artifactStatus(state,entry) === 'stored' ? 'item' : 'reveal'))}</li>`).join('')}</ul>` : '<p>No artifacts recorded yet.</p>'}
    ${routeButton('Artifact Explorations','artifact-trails')}</section>`;
}

function study(){return panelShell('Small things. Quiet direction.',`<div class="study-meta"><span>BOOK OF MORMON</span><span>FAITH & GUIDANCE</span></div><div class="study-status ${state.equipped?'connected':''}">${icon(state.equipped?'spark':'book')}<div><strong>${state.equipped?'Liahona connection is open':'Your study book'}</strong><span>${state.equipped?'Two passages, one thread to follow.':'Begin here. An artifact can add a connection.'}</span></div>${state.equipped?'<button class="quiet-link" data-view="item" aria-label="View equipped Liahona">View</button>':''}</div><section class="text-section scripture"><p class="reference">${content.reference}</p><h3>Notice the small things.</h3><p>${content.summary}</p><a href="https://www.churchofjesuschrist.org/study/scriptures/bofm/1-ne/16?lang=eng&id=p28-p29#p28" target="_blank" rel="noopener">Read the passage ↗</a></section>${state.equipped?`<section class="connection" data-connection><div class="connection-mark">${icon('spark')}<span>REVEALED THROUGH YOUR LIAHONA</span></div><p class="reference">ALMA 37:44–45</p><h3>From a compass to Christ’s words.</h3><p>${content.connection}</p><a href="https://www.churchofjesuschrist.org/study/scriptures/bofm/alma/37?lang=eng&id=p44-p45#p44" target="_blank" rel="noopener">Read the connected passage ↗</a><p class="reflection-question">How might attending to Christ’s words change the way you respond to a small invitation?</p></section>`:`<div class="artifact-invitation">${icon('spark')}<p>The Liahona brings Alma’s teaching alongside this passage.</p>${routeButton(state.found?'Open satchel':'Discover','inventory','small')}</div>`}<section class="reflection"><label for="reflection"><span class="eyebrow">SOMETHING TO CARRY WITH YOU</span><span>${content.prompt}</span></label><textarea id="reflection" maxlength="2000" placeholder="Leave yourself a little thought…">${esc(state.reflection)}</textarea><p class="tiny-note left">Saved in this browser. Or choose a takeaway:</p><div class="choices">${takeaways.map(x=>`<button class="choice ${state.choice===x?'selected':''}" data-choice="${x}" aria-pressed="${state.choice===x}">${x}</button>`).join('')}</div><button class="button primary finish" data-action="complete" ${!state.choice&&!state.reflection.trim()?'disabled':''}>${state.completed?'Save & return home':'Carry this with me'} ${icon('home')}</button><p class="tiny-note">${state.completed?'Already explored. Returning adds no extra completion.':'A thought or a takeaway is enough. No perfect answers needed.'}</p></section>`,{icon:'book',kicker:'AT THE READING TABLE'});}
function journey(){return panelShell('Your journey',`${scripture.libraryEnabled() ? `<p class="item-summary">The ideas you’ve spent a little time with.</p><div class="theme-map"><svg viewBox="0 0 420 200" aria-hidden="true"><path d="M40 170q120 30 115-50T250 45q80-40 145-20" stroke="#b7ba9a" stroke-width="2" stroke-dasharray="5 9" fill="none"/><path d="m40 80 6-12 6 12m280 65 6-12 6 12" fill="none" stroke="#b4bd9b" stroke-width="3"/></svg><button class="theme-node ${state.completed?'explored':''}" data-view="study" aria-label="Open Faith and guidance study">${icon('spark')}</button><span>Faith & guidance</span></div><div class="journey-record"><span class="badge">${state.completed?'EXPLORED':'OPEN TO EXPLORE'}</span><h3>Small things. Quiet direction.</h3><p>${state.completed?'1 study explored':'Your first study is here whenever you’re ready.'}</p>${state.completed?`<p class="takeaway">${esc(state.choice||'A personal reflection')}</p>`:''}${scripture.libraryEnabled() ? routeButton(state.completed?'Revisit your study':'Open the study','study') : routeButton('Scripture Libraries','scripture-settings')}</div><p class="tiny-note">A record of exploration, never a measure of faith or worth.</p>` : ''}${scripture.journey()}${artifactJournal()}`,{icon:'map',kicker:'A JOURNEY, NOT A SCORE'});}
function settings(){return panelShell('Make yourself at home',`<section class="text-section"><h3>Scripture collections</h3>${routeButton('Scripture Libraries','scripture-settings')}</section><section class="text-section"><h3>Your journey goes with you.</h3><p>Progress and reflections are saved only in this browser, on this website. Export a copy before switching devices or moving to a different website.</p><div class="button-row">${action('Export progress','export','secondary')}${action('Import progress','import','secondary')}</div><p class="tiny-note left">The file contains your personal reflection. Keep it somewhere private.</p></section><section class="text-section"><h3>A companion, not a scorecard.</h3><p>Your lamb symbolizes your own inner journey. Christ is the Good Shepherd. The lamb doesn’t measure your worth or holiness, and nothing is lost while you’re away.</p><p class="tiny-note left">Jornada 0.2 · Independent prototype. Not affiliated with The Church of Jesus Christ of Latter-day Saints. Bible reading, guided discoveries, and an optional Book of Mormon study.</p></section>`,{kicker:'ABOUT & YOUR PROGRESS',icon:'settings'});}
function importPreview(){return panelShell('Bring your progress home',`<p>This backup contains ${Object.values(pendingImport.scripture.studies).filter(record=>record.completedAt).length + Number(pendingImport.completed)} completed studies${pendingImport.found?' and the Liahona':''}.</p><p>Importing will replace the progress and reflection saved in this browser. Export your current progress first if you want to keep both.</p><div class="button-row">${action('Export current progress','export','secondary')}${action('Replace with backup','confirm-import')}</div>`,{back:'settings',backLabel:'Cancel import',kicker:'REVIEW YOUR BACKUP'});}
let guidedReactionPending = false;
const scripture = scriptureUI({
  getState: () => state, save, show, shell: panelShell, esc,
  completed: () => { guidedReactionPending = true; },
  portrait: () => dressedSheep(true).replaceAll('lamb-wool','study-lamb-wool').replaceAll('lamb-face','study-lamb-face'),
  animate: lamb => animateBitpolyLamb(lamb, {studying:true})
});
const artifactPanels = {item, inspect, reveal:discover, trail:artifactTrail};
const panels = {...scripture.panels, inventory, study, map:journey, settings,
  'import-preview':importPreview, 'artifact-trails':artifactTrails,
  ...Object.fromEntries([...artifactRoutes].map(([route, {entry, mode}]) =>
    [route, () => artifactPanels[mode](entry)]))
};
const codexViews = new Set(['library','bible','chapters','reader','discoveries','guided',
  'study','discovery-complete','item','inspect','discover']);

function renderPanel(focus = true) {
  scripture.dispose();
  const mode = artifactRoutes.get(view)?.mode;
  const codex = codexViews.has(view) || mode || view === 'artifact-trails';
  panel.className = `panel-${view}${codex ? ' codex-panel' : ''}${mode ? ` artifact-panel artifact-${mode}-panel` : ''}`;
  const content = panel.querySelector('#panel-content');
  content.innerHTML = panels[view]();
  if (view === 'library' || view === 'discoveries') {
    content.querySelector('.panel-scroll').insertAdjacentHTML('beforeend',
      routeButton('Artifact Explorations','artifact-trails'));
  }
  if (view === 'reader' && artifactReaderReturn) {
    content.querySelector('.panel-scroll').insertAdjacentHTML('afterbegin',
      routeButton(artifactRoutes.get(artifactReaderReturn)?.mode === 'inspect' ? 'Return to artifact' : 'Return to exploration',artifactReaderReturn));
  }
  if (codex) {
    content.querySelector('.panel-header').insertAdjacentHTML('afterbegin',
      '<span class="codex-bookmark" aria-hidden="true">✦</span>');
    content.insertAdjacentHTML('beforeend', '<div class="codex-footer" aria-hidden="true"></div>');
    if (view === 'reader') {
      content.querySelectorAll('.panel-scroll .button-row').forEach(row => {
        const chapters = row.querySelector('[data-view="chapters"]');
        if (!chapters) return;
        row.classList.add('codex-chapter-nav');
        chapters.insertAdjacentHTML('afterbegin', icon('book'));
      });
    }
  }
  scripture.hydrate(panel);
  if (focus) content.querySelector('#panel-title').focus({preventScroll:true});
}
let satchelExit;

function closePanel() {
  if (view === 'reader' && artifactReaderReturn) return show(artifactReaderReturn);
  const mode = artifactRoutes.get(view)?.mode;
  if (mode === 'inspect') return leavePanel('inventory', 'artifact-closing', '.panel-scroll', 'artifact-dismiss');
  if (mode === 'item') return show('inventory');
  if (mode === 'trail' || mode === 'reveal') return show('artifact-trails');
  if (view === 'artifact-trails') return show('inventory');
  if (view !== 'inventory') return show('home');
  leavePanel('home', 'satchel-closing', '.satchel-rig', 'satchel-depart');
}

function leavePanel(destination, className, selector, animationName) {
  if (satchelExit) return;
  panel.classList.add(className);
  const exit = panel.querySelector(selector).getAnimations()
    .find(animation => animation.animationName === animationName);
  if (!exit) return show(destination);

  satchelExit = exit;
  const finish = () => {
    if (satchelExit === exit) show(destination);
  };
  exit.finished.then(finish, finish);
}

function show(next,push=true,initial=false){satchelExit=null;panel.classList.remove('satchel-closing','artifact-closing');if(next==='explore')next='library';if(next==='study'&&!scripture.libraryEnabled())next='scripture-settings';if(!panels[next]&&next!=='home')next='home';const artifactPage = artifactRoutes.get(next);
if (artifactPage) {
  const {entry, mode} = artifactPage;
  const status = artifactStatus(state, entry);
  if ((mode === 'item' || mode === 'inspect') && status !== 'stored') next = 'inventory';
  if (mode === 'reveal' && status === 'unknown') {
    if (entry.exploration) next = artifactRoute(entry,'trail');
    else if (!scripture.libraryEnabled()) next = 'scripture-settings';
  }
}
if(next!=='reader')artifactReaderReturn=null;if(next==='import-preview'&&!pendingImport)next='settings';const enteringHome=next==='home'&&(initial||view!=='home');view=next;if(push)history.replaceState(null,'',next==='home'?'#home':`#${next}`);if(next==='home'){scripture.dispose();if(panel.open)panel.close();world.inert=false;if(guidedReactionPending){guidedReactionPending=false;react('complete');}else if(enteringHome)sheepMotion.greet();(returnFocus?.isConnected ? returnFocus : document.querySelector('[data-view="home"]'))?.focus({preventScroll:true});return;}if(!panel.open){returnFocus=document.activeElement;renderPanel(false);panel.showModal();world.inert=true;}else renderPanel(false);document.querySelector('#panel-title').focus({preventScroll:true});document.querySelector('.panel-scroll').scrollTop=0;}
function react(kind){const speech=document.querySelector('#speech');const area=document.querySelector('.lamb-area');clearTimeout(reactionTimer);area.classList.remove('petting','nourished');void area.offsetWidth;area.classList.add(kind==='complete'?'nourished':'petting');sheepMotion.pet(kind !== 'complete');const messages=['Oh, hello you.','A little closer?','That’s the spot.','Happy you’re here.'];speech.textContent=kind==='complete'?'A little light to carry.':messages[petCount++%messages.length];speech.classList.add('visible');reactionTimer=setTimeout(()=>{speech.classList.remove('visible');area.classList.remove('petting','nourished');},4200);}
function toggleArtifactEquipment() {
  const page = artifactRoutes.get(view);
  if (!page || !['item','inspect'].includes(page.mode)) return;
  const {entry} = page;
  if (!entry.equipment || artifactStatus(state, entry) !== 'stored') return;
  const equipped = !isArtifactEquipped(entry);
  state[entry.equipment] = entry.equipment === 'outfit' ? (equipped ? entry.id : null) : equipped;
  save();
  if (entry.equipment === 'outfit') {
    world.querySelector('.lamb').innerHTML = dressedSheep();
    sheepMotion?.dispose();
    sheepMotion = animateBitpolyLamb(world.querySelector('.lamb'));
    const equipment = world.querySelector('.dock [data-view="inventory"]');
    equipment.querySelector('i')?.remove();
    const count = Number(state.equipped) + Number(state.missionaryTagEquipped) + Number(Boolean(state.outfit));
    if (count) equipment.insertAdjacentHTML('beforeend', `<i role="img" aria-label="${count} equipped"></i>`);
  } else renderWorld();
  renderPanel(false);
  panel.querySelector('[data-action="equip"]').focus();
  toast(equipped ? `${entry.name} equipped.` : `${entry.name} tucked back into your satchel.`);
}

function recordArtifact(actionName) {
  const page = artifactRoutes.get(view);
  if (!page?.entry.exploration) return;
  const {entry, mode} = page;
  const status = artifactStatus(state, entry);
  if (actionName === 'finish-artifact' && mode === 'trail') {
    if (status === 'unknown') {
      state.artifactDiscoveries[entry.id] = 'revealed';
      save();
    }
    show(artifactRoute(entry, status === 'stored' ? 'item' : 'reveal'));
  } else if (actionName === 'store-artifact' && mode === 'reveal' && status === 'revealed') {
    state.artifactDiscoveries[entry.id] = 'stored';
    save();
    show('inventory');
  }
}
function downloadProgress(){const blob=new Blob([JSON.stringify({app:'jornada',version:1,exportedAt:new Date().toISOString(),state},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='jornada-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Progress backup downloaded.');}
document.addEventListener('click',e=>{const target=e.target.closest('[data-view],[data-action],[data-choice]');if(!target||satchelExit)return;if(target.dataset.view){if(target.dataset.view==='inventory'&&artifactRoutes.get(view)?.mode==='inspect'){closePanel();return;}if(target.dataset.journeyFilter)scripture.setJourneyFilter(target.dataset.journeyFilter);show(target.dataset.view);return;}if(target.dataset.choice){state.choice=state.choice===target.dataset.choice?'':target.dataset.choice;save();document.querySelectorAll('[data-choice]').forEach(b=>{const selected=b.dataset.choice===state.choice;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',selected);});document.querySelector('.finish').disabled=!state.choice&&!state.reflection.trim();return;}switch(target.dataset.action){case'satchel-tab':selectSatchelTab(target);break;case'close':closePanel();break;case'pet':react('pet');break;case'finish-artifact':case'store-artifact':recordArtifact(target.dataset.action);break;case'collect':if(view!=='discover'||!scripture.libraryEnabled()||state.found)break;state.found=true;save();renderWorld();show('item');toast('A new discovery, tucked into your satchel.');break;case'equip':toggleArtifactEquipment();break;case'toggle-scroll':toggleScroll(target);break;case'complete':{const result=completeStudy(state);if(!result.accepted)return;state=result.state;const persisted=save();renderWorld();show('home');if(result.firstCompletion){react('complete');document.querySelector('#completion-note').textContent=persisted?'A small discovery. A little nourishment. Reflection saved.':'A small discovery. Export your progress to keep it.';}else toast(persisted?'Your reflection is saved.':'Export your progress to keep your reflection.');break;}case'export':downloadProgress();break;case'import':document.querySelector('#import-file').click();break;case'confirm-import':if(pendingImport){state=pendingImport;pendingImport=null;const persisted=save();renderWorld();show('home');toast(persisted?'Your journey is at home here.':'Loaded for this visit. Storage is unavailable.');}break;}});
document.addEventListener('input',e=>{if(e.target.id==='reflection'){state.reflection=e.target.value;save();document.querySelector('.finish').disabled=!state.choice&&!state.reflection.trim();}});
document.querySelector('#import-file').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>262144)throw new Error('That file is too large for a Jornada progress backup.');const backup=await file.text();pendingImport=restoreArtifactDiscoveries(parseProgress(backup),JSON.parse(backup).state);show('import-preview');}catch(err){toast(err.message||'Unable to read this backup.');}e.target.value='';});
panel.addEventListener('click', event => {
  if (event.target.closest('[data-artifact-reading]')) artifactReaderReturn = view;
  scripture.click(event);
});
panel.addEventListener('input', scripture.input);
panel.addEventListener('submit', scripture.submit);
panel.addEventListener('cancel',e=>{e.preventDefault();if(!scripture.dismissCompanion(panel))closePanel();});
panel.addEventListener('click',e=>{if(e.target===panel){const r=panel.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closePanel();}});
window.addEventListener('hashchange',()=>show(location.hash.slice(1)||'home',false));
renderWorld();show(location.hash.slice(1)||'home',false,true);if(!storageOK)toast('Storage is unavailable. Export progress to keep it.');


