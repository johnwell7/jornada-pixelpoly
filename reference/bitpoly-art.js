// V115 — new 2D cutout rigs. Supplied PNGs are immutable texture atlases.
// Each clip is an independent articulated region, not a transformed full sprite.
let serial = 0;
export const bitpolyAssets = Object.freeze({
  room:'assets/bitpoly/room.png', lamb:'assets/bitpoly/lamb.png',
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

export const lambRegions = Object.freeze({
  head:'M325 0H990V281L908 321L858 369L875 490L882 540L857 582L812 617L740 640L648 645L559 632L495 602L451 556L439 507L440 432L458 358L394 375L325 341Z',
  'ear-left':'M145 280H420L468 326L454 414L429 461L359 490L281 499L206 468L161 408Z',
  'ear-right':'M902 279H1167V458L1090 491L1002 500L934 475L878 437L858 369Z',
  'foot-left':'M240 988L271 957L331 937L398 957L449 1003L489 1072L500 1131L469 1169H261L229 1122Z',
  'foot-right':'M847 1001L902 958L962 939L1017 965L1050 1001L1080 1078L1070 1169H850L820 1124Z',
  'arm-left':'M473 894L539 914L608 917L630 992L644 1103L628 1169H516L485 1099Z',
  'arm-right':'M690 918L765 906L824 890L821 1023L808 1107L788 1169H676L662 1103Z'
});

export const lambSilhouette='M162 356L183 320L237 301L329 284L333 236L345 180L398 143L459 138L482 107L532 101L542 64L620 43L748 47L793 78L830 103L877 133L919 156L960 205L980 263L979 281L1061 288L1123 327L1148 355L1143 412L1116 449L1064 485L1017 498L984 492L1006 540L1016 584L1004 631L1009 649L1049 679L1051 730L1065 780L1044 798L1085 818L1115 855L1118 904L1097 945L1074 966L1067 1004L1079 1055L1086 1098L1067 1147L1035 1163H848L824 1146L804 1163H517L497 1145L469 1163H279L239 1143L225 1101L202 1066L201 1029L215 1003L199 978L171 948V886L184 853L208 827L224 811L225 768L245 741L240 696L253 657L282 636L280 607L271 580L286 538L306 506L330 489L281 502L227 484L190 451L163 405Z';

export function bitpolyLamb({equipped=false, tag=false, studying=false}={}) {
  const id=`bp-lamb-${++serial}`;
  const regions=Object.entries(lambRegions);
  const eyes=[['left',517,386],['right',748,386]];

  const defs=`<defs>${clip(`${id}-silhouette`,lambSilhouette)}<g id="${id}-texture" clip-path="url(#${id}-silhouette)"><image href="${bitpolyAssets.lamb}" width="1312" height="1199"/></g>
    ${regions.map(([name,d])=>clip(`${id}-${name}`,d)).join('')}
    ${eyes.map(([name,x,y])=>clip(`${id}-eye-${name}`,`M${x} ${y}h62v104h-62Z`)).join('')}
    <mask id="${id}-body"><rect width="1312" height="1199" fill="white"/>${regions.map(([,d])=>`<path d="${d}" fill="black"/>`).join('')}</mask>
    <radialGradient id="${id}-erase"><stop offset=".82" stop-color="black"/><stop offset="1" stop-color="white"/></radialGradient>
    <linearGradient id="${id}-skin-left"><stop stop-color="#98451f"/><stop offset="1" stop-color="#863e27"/></linearGradient>
    <linearGradient id="${id}-skin-right"><stop stop-color="#6b362a"/><stop offset="1" stop-color="#61332d"/></linearGradient>
    <mask id="${id}-face"><rect width="1312" height="1199" fill="white"/>${eyes.map(([,x,y])=>`<ellipse cx="${x+31}" cy="${y+52}" rx="44" ry="67" fill="url(#${id}-erase)"/>`).join('')}</mask></defs>`;
  const eyeParts=eyes.map(([name,x,y])=>`<ellipse cx="${x+31}" cy="${y+52}" rx="44" ry="67" fill="url(#${id}-skin-${name})"/>`).join('');
  const head=`${eyeParts}<g mask="url(#${id}-face)">${use(id,'head')}</g>`+
    eyes.map(([name])=>joint('eye-'+name,name==='left'?548:779,438,use(id,'eye-'+name))).join('')+
    eyes.map(([name,x])=>`<g data-bp-part="lid-${name}" opacity="0"><path d="M${x+8} 440Q${x+31} 456 ${x+54} 440" fill="none" stroke="#351b14" stroke-width="6" stroke-linecap="round"/></g>`).join('')+
    `<g data-bp-part="sleep-puff" opacity="0"><ellipse cx="733" cy="512" rx="18" ry="15" fill="#fff1cb" fill-opacity=".3" stroke="#ffe4b2" stroke-width="3"/></g>`;
  const equipment=`${equipped?`<image href="assets/artifacts/liahona-inventory.png" x="728" y="717" width="138" height="150"/>`:''}${tag?`<image href="assets/artifacts/missionary-tag-inventory.png" x="438" y="747" width="151" height="109" transform="rotate(-8 513 800)"/>`:''}`;
  const book=studying?`<g class="bp-reading-book"><path d="M400 817L652 866L911 817L899 1027L652 1083L412 1027Z" fill="#663219" stroke="#d88b35" stroke-width="10"/><path d="M406 814Q529 790 652 853Q779 790 904 814L888 837Q767 817 652 880Q535 817 421 837Z" fill="#ffe1a0"/><path d="M652 880V1080" stroke="#b36b2f" stroke-width="13"/><path d="M818 917L830 948L861 955L833 969L824 1000L812 970L781 960L808 946Z" fill="#e9af4d"/></g>`:'';
  return `<svg class="bitpoly-lamb" data-bp-rig="lamb" viewBox="110 0 1085 1210" role="img" aria-label="${studying?'Your bitpoly lamb reading a book':'Your bitpoly lamb in warm sunset light'}">${defs}
    <ellipse cx="657" cy="1153" rx="408" ry="22" fill="#31190f" opacity=".22"/>
    ${joint('torso',656,1070,`<g mask="url(#${id}-body)"><use href="#${id}-texture"/></g>
      <path d="M476 532H850L846 582L801 613L739 633H576L503 604Z" fill="#eab07c"/>
      ${joint('head',656,610,head+joint('ear-left',449,363,use(id,'ear-left'))+joint('ear-right',881,363,use(id,'ear-right')))}${equipment}`)}
    ${use(id,'arm-left')}${use(id,'arm-right')}${book}${use(id,'foot-left')}${use(id,'foot-right')}
  </svg>`;
}


// Sunlight enters from the upper-left window. Project the character's silhouette
// across the floor toward the lower-right; supporting point stays at rug center.
export function bitpolyShadow(){
  const id=`bp-shadow-${++serial}`;
  return `<svg class="bp-lamb-ground-shadow" viewBox="0 0 941 1671" aria-hidden="true"><defs>
    ${clip(id+'-shape',lambSilhouette)}
    <filter id="${id}-ink" x="-.1" y="-.1" width="1.2" height="1.2" color-interpolation-filters="sRGB">
      <feColorMatrix type="matrix" values="0 0 0 0 .12  0 0 0 0 .045  0 0 0 0 .02  0 0 0 .34 0"/>
      <feGaussianBlur stdDeviation="12"/>
    </filter></defs>
    <g transform="matrix(.18 .025 -.19 -.10 570.99 1388.9)">
      <g filter="url(#${id}-ink)"><image href="${bitpolyAssets.lamb}" width="1312" height="1199" clip-path="url(#${id}-shape)"/></g>
    </g></svg>`;
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
