import {artifacts, artifactStatus} from './artifacts.js';
import {discoveries} from './discoveries.js';
import {studyProgress, themeExploration} from './study-progress.js';

export function satchelProgress(state, {esc, icon, routeButton, artifactRoute}) {
  const {chapters, discoveries: completedCount, complete} = studyProgress(state);
  const topics = themeExploration(state);
  const explored = topics.filter(([, count]) => count > 0);
  const guided = (label, id) => `<button type="button" class="button secondary" data-scripture="study" data-value="${id}">${esc(label)}</button>`;
  const artifactEntries = artifacts.flatMap(entry => {
    const status = artifactStatus(state, entry);
    if (status === 'unknown') return [];
    return [routeButton(esc(entry.name), artifactRoute(entry, status === 'stored' ? 'item' : 'reveal'))];
  });
  const list = entries => `<ul>${entries.map(entry => `<li>${entry}</li>`).join('')}</ul>`;
  const finished = complete.map(study => guided(study.title, study.id));
  if (state.completed) finished.push(routeButton('Small things. Quiet direction.', 'study'));
  const bibleTopics = topics.filter(([theme]) => discoveries.some(study => study.theme === theme));
  const leastCount = bibleTopics.at(-1)?.[1];
  const suggestions = bibleTopics.filter(([, count]) => count === leastCount).map(([theme]) => {
    const guide = discoveries.find(study => study.theme === theme && !state.scripture.studies[study.id]?.completedAt) ||
      discoveries.find(study => study.theme === theme);
    return `<li><span>${esc(theme)}</span>${guided(guide.title, guide.id)}</li>`;
  });
  return `<div class="satchel-progress">
    <h3>Your journey so far</h3>
    <dl class="satchel-progress-totals">
      ${[['book',chapters,'Chapters read'],['map',completedCount,'Discoveries'],['spark',explored.length,'Themes explored']].map(([symbol,total,label]) =>
        `<div>${icon(symbol)}<dt>${label}</dt><dd>${total}</dd></div>`).join('')}
    </dl>
    <p>${chapters ? 'Chapters are counted once when you mark them as read.' : 'Chapters appear here when you mark them as read.'}</p>
    <details><summary>Completed discoveries</summary>
      ${finished.length ? list(finished) : '<p>Your completed studies will appear here.</p>'}
    </details>
    <details><summary>Artifacts found <span>(${artifactEntries.length})</span></summary>
      ${artifactEntries.length ? list(artifactEntries) : '<p>Artifacts will appear here as you find them.</p>'}
    </details>
    <h4>Most explored</h4>
    ${explored.length ? `<p>${explored.filter(([, count]) => count === explored[0][1]).map(([theme]) => esc(theme)).join(' · ')}</p>
      <details><summary>All explored themes</summary>${list(explored.map(([theme,count]) =>
        `${esc(theme)} <span>· ${count} ${count === 1 ? 'entry' : 'entries'}</span>`))}</details>`
      : '<p>Recorded readings and completed discoveries with a linked theme will appear here.</p>'}
    <h4>${explored.length ? 'Less explored' : 'Themes to try'}</h4>
    <ul class="satchel-theme-suggestions">${suggestions.join('')}</ul>
    <p class="satchel-progress-note">These themes reflect the passages and studies you’ve explored.</p>
  </div>`;
}
