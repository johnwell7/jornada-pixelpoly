import {fullLambSprite, frameManifestFor, hasAnimatedOutfit, PRIESTLY_OUTFIT, TUNIC_OUTFIT, DAVID_OUTFIT} from './lamb-frames.js';
// Plants retain articulated stems; the default lamb uses complete rendered frames.
let serial = 0;
export const bitpolyAssets = Object.freeze({
  room:'assets/bitpoly/room.png',
  vine:'assets/bitpoly/window-vine.png', shelf:'assets/bitpoly/shelf-plant.png',
  floor:'assets/bitpoly/floor-plant.png',
  lantern:'assets/bitpoly/lantern.png', flame:'assets/bitpoly/flame-01.png',flame2:'assets/bitpoly/flame-02.png',flame3:'assets/bitpoly/flame-03.png',flame4:'assets/bitpoly/flame-04.png',flame5:'assets/bitpoly/flame-05.png',flame6:'assets/bitpoly/flame-06.png',flame7:'assets/bitpoly/flame-07.png',flame8:'assets/bitpoly/flame-08.png'
});
const clip = (id, d) => `<clipPath id="${id}"><path d="${d}"/></clipPath>`;
const use = (id, region) => `<g clip-path="url(#${id}-${region})"><use href="#${id}-texture"/></g>`;
const texture = (id, src, w, h) => `<image id="${id}-texture" href="${src}" width="${w}" height="${h}"/>`;
const joint = (part, x, y, body) => `<g data-bp-part="${part}" data-pivot="${x} ${y}">${body}</g>`;

// Joint boundaries cross narrow stems. Four-pixel lap joints keep the stem continuous.
const vineSections = [
  ['crown','M0 0H1086V583L500 590L405 588L0 585Z',445,35],
  ['middle','M0 584L405 584L500 586L1086 579V836H0Z',424,586],
  ['lower','M0 832H1086V1084H0Z',421,834],
  ['tip','M0 1080H1086V1448H0Z',424,1082]
];
const shelfSections = [
  ['leaves','M0 0H1086V298H598L546 350L484 410L0 414Z',550,305],
  ['trail-top','M0 410H482L549 363L596 302V534L535 571H0Z',441,415],
  ['trail-mid','M0 530H539L600 565V897H0Z',360,534],
  ['trail-low','M0 893H1086V1186H0Z',360,895],
  ['trail-tip','M0 1182H1086V1448H0Z',345,1184]
];
const floorPot='M288 782L332 743L401 729L478 724L478 803H620V725L708 739L771 765L785 802L815 889L829 936L812 1051L775 1170L752 1255L680 1304L575 1320L460 1300L379 1269L322 1217L291 1127L259 1017L246 945L256 876Z';
const floorLeaves = [
  ['left-high','M0 0H478L540 736L480 800L0 800Z',488,785],
  ['center-high','M478 0H1086V321L760 340L616 734L540 800L478 736Z',540,785],
  ['right-high','M760 321H1086V599L748 621L617 781L540 800L616 734Z',550,790],
  ['right-low','M748 599H1086V806H550L617 781Z',553,793]
];
export function bitpolyPlants() {
  const id=`bp-plants-${++serial}`;
  const definitions=(regions,src,prefix)=>`<defs>${texture(prefix,src,1086,1448)}${regions.map(([name,d])=>clip(`${prefix}-${name}`,d)).join('')}</defs>`;
  const chain=(regions,prefix)=>regions.reduceRight((inside,[name,,x,y])=>joint(name,x,y,use(prefix,name)+inside),'');
  const vineId=id+'-vine', shelfId=id+'-shelf',floorId=id+'-floor';
  // Potted vine's tail is longer in the scene reference. Extend only the hanging stem.
  const shelfTail=`<g transform="translate(0 -192.5) scale(1 1.35)">${chain(shelfSections.slice(1),shelfId)}</g>`;
  return `<div class="bp-plant bp-window-vine" aria-hidden="true"><svg data-bp-plant="vine" viewBox="260 10 500 1700">${definitions(vineSections,bitpolyAssets.vine,vineId)}${joint('crown',445,35,use(vineId,'crown')+`<g transform="translate(0 -264.6) scale(1 1.45)">${chain(vineSections.slice(1),vineId)}</g>`)}</svg></div>
  <div class="bp-plant bp-shelf-plant" aria-hidden="true"><svg data-bp-plant="shelf" viewBox="240 20 590 1800">${definitions(shelfSections,bitpolyAssets.shelf,shelfId)}
  <defs><mask id="${shelfId}-pot"><rect width="1086" height="1448" fill="white"/>${shelfSections.map(([,d])=>`<path d="${d}" fill="black"/>`).join('')}</mask></defs>
  <g mask="url(#${shelfId}-pot)"><use href="#${shelfId}-texture"/></g>${shelfTail}${joint('leaves',550,305,use(shelfId,'leaves'))}</svg></div>
  <div class="bp-plant bp-floor-plant" aria-hidden="true"><svg data-bp-plant="floor" viewBox="45 45 990 1285">${definitions(floorLeaves,bitpolyAssets.floor,floorId)}
  <defs><mask id="${floorId}-foliage"><rect width="1086" height="1448" fill="white"/><path d="${floorPot}" fill="black"/></mask><mask id="${floorId}-fixed"><rect width="1086" height="1448" fill="white"/>${floorLeaves.map(([,d])=>`<path d="${d}" fill="black"/>`).join('')}<path d="${floorPot}" fill="white"/></mask>${clip(`${floorId}-pot`,'M0 802H1086V1448H0Z')}</defs>
  <g mask="url(#${floorId}-fixed)"><use href="#${floorId}-texture"/></g>
  ${floorLeaves.map(([name,,x,y])=>joint(name,x,y,`<g mask="url(#${floorId}-foliage)">${use(floorId,name)}</g>`)).join('')}${use(floorId,'pot')}</svg></div>`;
}

export function bitpolyLamb({equipped=false, tag=false, studying=false, outfit}={}) {
  const dressed = hasAnimatedOutfit(outfit);
  const equipment=`${equipped?`<image href="assets/artifacts/liahona-inventory.png" x="728" y="717" width="138" height="150"/>`:''}${tag?`<image href="assets/artifacts/missionary-tag-inventory.png" x="438" y="747" width="151" height="109" transform="rotate(-8 513 800)"/>`:''}`;
  const compactEquipment = `${equipped?'<image href="assets/artifacts/liahona-inventory.png" x="818" y="718" width="89" height="97"/>':''}${tag?'<image href="assets/artifacts/missionary-tag-inventory.png" x="400" y="721" width="107" height="77" transform="rotate(-8 454 760)"/>':''}`;
  const book=studying?`<g class="bp-reading-book"><path d="M400 817L652 866L911 817L899 1027L652 1083L412 1027Z" fill="#663219" stroke="#d88b35" stroke-width="10"/><path d="M406 814Q529 790 652 853Q779 790 904 814L888 837Q767 817 652 880Q535 817 421 837Z" fill="#ffe1a0"/><path d="M652 880V1080" stroke="#b36b2f" stroke-width="13"/><path d="M818 917L830 948L861 955L833 969L824 1000L812 970L781 960L808 946Z" fill="#e9af4d"/></g>`:'';
  const readingBook = dressed ? book.replace('class="bp-reading-book"', 'class="bp-reading-book" transform="translate(196 364) scale(.7)"') : book;
  const labels = {
    [PRIESTLY_OUTFIT]: 'Ovelha com as vestes sacerdotais de Arão',
    [TUNIC_OUTFIT]: 'Ovelha com a túnica de José',
    [DAVID_OUTFIT]: 'Ovelha com o traje do pequeno pastor de Davi'
  };
  return `<svg class="bitpoly-lamb" data-bp-rig="frames" viewBox="110 0 1085 1210" role="img" aria-label="${studying?'Ovelha lendo':labels[outfit]??'Ovelha Pixel-Poly'}">${fullLambSprite(frameManifestFor(outfit))}${dressed?compactEquipment:equipment}${readingBook}</svg>`;
}


// The supporting pixels end near y=1289 in the room's coordinate space.
export function bitpolyShadow(){
 const id=`bp-shadow-${++serial}`;
 return `<svg class="bp-lamb-ground-shadow" viewBox="0 0 941 1671" aria-hidden="true">
  <defs>
   <radialGradient id="${id}">
    <stop offset="0" stop-color="#241410" stop-opacity=".74"/>
    <stop offset=".55" stop-color="#28170f" stop-opacity=".42"/>
    <stop offset="1" stop-color="#28170f" stop-opacity="0"/>
   </radialGradient>
  </defs>
  <g fill="url(#${id})" transform="translate(470.5 0) scale(1.18 1) translate(-470.5 0)">
   <ellipse cx="472" cy="1290" rx="103" ry="14" opacity=".62"/>
   <ellipse cx="402" cy="1289" rx="32" ry="9"/>
   <ellipse cx="452" cy="1290" rx="24" ry="8"/>
   <ellipse cx="489" cy="1290" rx="24" ry="8"/>
   <ellipse cx="535" cy="1289" rx="33" ry="9"/>
  </g>
 </svg>`;
}

export const flameFrames = Object.freeze([{"src":"assets/bitpoly/flame-01.png","x":313.292,"y":484.316,"size":612.305},{"src":"assets/bitpoly/flame-02.png","x":351.804,"y":542.376,"size":531.696},{"src":"assets/bitpoly/flame-03.png","x":315.641,"y":507.548,"size":601.599},{"src":"assets/bitpoly/flame-04.png","x":391.274,"y":600.702,"size":452.222},{"src":"assets/bitpoly/flame-05.png","x":332.891,"y":514.705,"size":571.018},{"src":"assets/bitpoly/flame-06.png","x":322.473,"y":524.987,"size":590.305},{"src":"assets/bitpoly/flame-07.png","x":379.138,"y":581.701,"size":478.958},{"src":"assets/bitpoly/flame-08.png","x":310.299,"y":487.224,"size":615.691}]);

export function bitpolyLantern(){
  const id=`bp-lantern-${++serial}`;
  return `<div class="bp-lantern-halo" aria-hidden="true"></div><div class="bp-lantern" aria-hidden="true">
    <svg viewBox="300 70 650 1120"><defs>
      ${clip(id+'-glass','M556 548H691L741 879L692 975H538L492 881Z')}
    </defs>
    <image class="bp-lantern-body" href="${bitpolyAssets.lantern}" width="1254" height="1254"/>
    <g clip-path="url(#${id}-glass)">
      <g data-lantern-flame="">${flameFrames.map((f,i)=>`<image data-flame-frame="${i}" href="${f.src}" x="${f.x}" y="${f.y}" width="${f.size}" height="${f.size}" visibility="${i===0?'visible':'hidden'}" opacity="${i===0?1:0}"/>`).join('')}</g>
    </g></svg></div>`;
}

