const satchelTexture = 'assets/bitpoly/satchel.webp';
const flap = 'M0 0H1071V383H994L936 369L847 335L813 333L804 347H760L736 325H332L310 347H259L239 333L187 341L106 378H0Z';
const supplies = 'M189 339H815V424H189Z';

export function satchelArt() {
  return `<svg class="satchel-art" viewBox="0 0 1071 1469" aria-hidden="true">
    <defs>
      <image id="satchel-texture" href="${satchelTexture}" width="1071" height="1469"/>
      <clipPath id="satchel-flap"><path d="${flap}"/></clipPath>
      <clipPath id="satchel-supplies"><path d="${supplies}"/></clipPath>
      <mask id="satchel-body" maskUnits="userSpaceOnUse" x="0" y="0" width="1071" height="1469">
        <rect width="1071" height="1469" fill="white"/>
        <path d="${flap} ${supplies} M144 558H928V916H144Z M251 1014H437V1174H251Z"/>
      </mask>
      <pattern id="satchel-grid-cloth" patternUnits="userSpaceOnUse" width="13" height="27" viewBox="334 634 13 27">
        <use href="#satchel-texture"/>
      </pattern>
      <pattern id="satchel-equipped-cloth" patternUnits="userSpaceOnUse" width="29" height="29" viewBox="200 1066 29 29">
        <use href="#satchel-texture"/>
      </pattern>
    </defs>
    <path fill="#44220e" d="${supplies}"/>
    <g clip-path="url(#satchel-supplies)"><use href="#satchel-texture" class="bag-supplies"/></g>
    <use href="#satchel-texture" mask="url(#satchel-body)"/>
    <rect x="144" y="558" width="784" height="358" fill="url(#satchel-grid-cloth)"/>
    <rect x="251" y="1014" width="186" height="160" fill="url(#satchel-equipped-cloth)"/>
    <use href="#satchel-texture" class="bag-flap" clip-path="url(#satchel-flap)"/>
  </svg>`;
}

// The inventory illustration has its own editable rings, housing and needle.
export function satchelLiahona() {
  return `<svg class="satchel-compass" viewBox="0 0 120 120" aria-hidden="true">
    <ellipse cx="62" cy="105" rx="35" ry="8" fill="#48220d" opacity=".46"/>
    <path d="M53 27v-9a8 8 0 0 1 16 0v9" stroke="#f4c45f" stroke-width="4" fill="none"/>
    <path d="M61 21 85 29 100 49 103 70 89 92 63 102 38 96 22 78 19 55 31 33Z" fill="#ac7025" stroke="#e3aa47" stroke-width="2"/>
    <path d="m61 21 24 8 15 20-33-11-36-5Zm-42 34 12-22 36 5-25 19-20 21Z" fill="#f6ca65"/>
    <path d="m22 78 20-21 25 32-4 13-25-6Zm45 11 36-19-14 22-26 10Z" fill="#865018"/>
    <g fill="none" stroke="#f8d578" stroke-width="2.7">
      <ellipse cx="61" cy="62" rx="24" ry="49" transform="rotate(-29 61 62)"/>
      <ellipse cx="61" cy="62" rx="50" ry="18" transform="rotate(-24 61 62)"/>
    </g>
    <circle cx="61" cy="62" r="29" fill="#185053" stroke="#ffe297" stroke-width="4"/>
    <path d="m61 35-21 13-5 20 8 13 4-20 24-23Z" fill="#357374"/>
    <path d="m73 44-7 24-18 15 6-24Z" fill="#ffe6a0"/>
    <path d="m73 44-19 15 12 9Z" fill="#fff0c4"/>
  </svg>`;
}

export function satchelMark(kind) {
  const paths = {
    artifacts: '<path d="m12 2 2.7 7.3L22 12l-7.3 2.7L12 22l-2.7-7.3L2 12l7.3-2.7Z M12 2v20M2 12h20"/>',
    paintings: '<path d="M3 5h18v14H3zM4 17l5-6 4 4 3-3 4 5"/><circle cx="16" cy="9" r="1"/>',
    journal: '<path d="M4 4c4-1 6 0 8 2 2-2 4-3 8-2v15c-4-1-6 0-8 2-2-2-4-3-8-2ZM12 6v15"/>',
    shield: '<path d="M12 3c3 2 6 2 8 2v6c0 5-4 9-8 11-4-2-8-6-8-11V5c2 0 5 0 8-2Z"/>'
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true">${paths[kind]}</svg>`;
}
