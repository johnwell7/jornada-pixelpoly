const assets = 'assets/artifacts';

const scrollRoot = `${assets}/cantico-de-moises`;
export function scrollInspection() {
  return `<section class="moses-scroll" lang="pt-BR">
    <div class="moses-scroll-stage" aria-hidden="true">
      <img class="moses-paper" src="${scrollRoot}/partes/folha.png" alt="">
      <img class="moses-roll moses-roll-left" src="${scrollRoot}/partes/rolo_esquerdo.png" alt="">
      <img class="moses-roll moses-roll-right" src="${scrollRoot}/partes/rolo_direito.png" alt="">
      <img class="moses-closed" src="${scrollRoot}/03_fechado_animacao.png" alt="">
    </div>
    <button type="button" class="button primary" data-action="toggle-scroll" aria-expanded="false" aria-controls="moses-reading">Abrir pergaminho</button>
    <div class="moses-reading" id="moses-reading" role="region" aria-label="Leitura do Cântico de Moisés" tabindex="0" hidden></div>
  </section>`;
}

let readingPromise;
export async function toggleScroll(button) {
  const section = button.closest('.moses-scroll');
  const reading = section.querySelector('.moses-reading');
  const open = section.classList.toggle('is-open');
  button.setAttribute('aria-expanded', String(open));
  button.textContent = open ? 'Fechar pergaminho' : 'Abrir pergaminho';
  reading.hidden = !open;
  if (!open || reading.dataset.loaded) return;
  reading.textContent = 'Carregando leitura…';

  try {
    readingPromise ??= fetch(`${scrollRoot}/leitura.json`).then(response => {
      if (!response.ok) throw new Error('Reading unavailable');
      return response.json();
    }).catch(error => {
      readingPromise = null;
      throw error;
    });
    const content = await readingPromise;
    if (!section.isConnected || !section.classList.contains('is-open') || reading.dataset.loaded) return;
    const note = document.createElement('p');
    note.textContent = `Deuteronômio 32:1–43 · ${content.type}`;
    const rows = content.sections.flatMap(row => {
      const title = document.createElement('h4');
      title.textContent = row.reference;
      const text = document.createElement('p');
      text.textContent = row.text;
      return [title,text];
    });
    const link = document.createElement('a');
    link.href = content.source;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = 'Ler Deuteronômio 32 na íntegra';
    reading.replaceChildren(note,...rows,link);
    reading.dataset.loaded = 'true';
  } catch {
    if (section.isConnected && section.classList.contains('is-open')) {
      reading.textContent = 'A leitura não carregou. Feche o pergaminho e tente abrir novamente.';
    }
  }
}
