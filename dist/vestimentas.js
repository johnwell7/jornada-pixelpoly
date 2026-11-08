function layer(outfit, name, x, y, width, height) {
  return `<image href="assets/artifacts/${outfit}/partes/${name}.png" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="none" aria-hidden="true"/>`;
}

function sleeve(outfit, side, x, y, width, height, cuffX, cuffY) {
  const angle = side === 'esquerda' ? 30 : -30;
  return `<g class="outfit-sleeve outfit-sleeve-${side}">
    <g transform="translate(${cuffX} ${cuffY}) rotate(${angle})">
      <path fill="#51372a" d="M-25-17Q0-26 25-17L23 20Q13 32-15 27L-24 19Z"/>
      <path fill="#35271f" d="M-24 10Q1 15 24 9L23 20Q13 32-15 27L-24 19Z"/>
    </g>
    ${layer(outfit,`manga_${side}`,x,y,width,height)}
  </g>`;
}

export function dressOutfit(rig, outfit, hasLiahona) {
  const priestly = outfit === 'vestes-sacerdotais';
  const part = (name,...box) => layer(outfit,name,...box);
  const back = priestly ? part('costas',500,545,450,343) : part('costas_base',488,550,474,338);
  const body = priestly
    ? part('frente',520,548,410,327) +
      part('aba_esquerda',500,730,225,153) + part('aba_direita',725,730,225,153) +
      part('efode',553,553,344,189) + part('faixa',533,750,384,53) +
      (hasLiahona ? part('peitoral',648,682,154,88) : part('peitoral',627,607,196,139))
    : `<clipPath id="jose-torso-clip"><path d="M552 532H898V734L985 905H465L552 734Z"/></clipPath>
      <g clip-path="url(#jose-torso-clip)">${part('frente_base',461,548,528,336)}</g>` +
      part('aba_esquerda',518,735,207,150) + part('aba_direita',725,735,207,150) +
      part('faixa',554,709,342,156);
  const arms = sleeve(outfit,'esquerda',480,561,180,208,529,745) +
    sleeve(outfit,'direita',790,561,180,208,921,745);

  // The dressed silhouette replaces the bare torso. The paired cuffs and paws
  // live in the same moving chest group so the paws cannot slide out of alignment.
  let dressed = rig
    .replace(/<g class="lamb-fleece">[\s\S]*?<\/g>/, back + body + arms)
    .replace(/<g class="lamb-forepaw">[\s\S]*?(?=<\/g>\s*<g class="lamb-head">)/, '');

  if (priestly) {
    dressed = dressed
      .replace('class="worn-liahona" transform="translate(725 683)"',
        'class="worn-liahona" transform="translate(725 651) scale(.62)"')
      .replace(/<\/g>(\s*<\/g>\s*<\/svg>)$/, part('mitra',631,231,185,89) + '</g>$1');
  }
  return dressed;
}
