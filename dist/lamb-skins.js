const priestlySprite = 'assets/artifacts/vestes-sacerdotais/skin.png';
const feet = 'M173 1120Q171 1052 215 1019Q258 986 316 1004Q376 1027 410 1119Q460 1251 390 1272L382 1312H180Z M1026 1120Q1028 1052 984 1019Q941 986 883 1004Q823 1027 789 1119Q739 1251 809 1272L817 1312H1019Z';
const sleeves = [
  'M190 786L353 733Q416 802 440 928L405 1072L306 1076L166 1030L119 924Z',
  'M1009 786L846 733Q783 802 759 928L794 1072L893 1076L1033 1030L1080 924Z'
];
const torsoOutline = 'M98 491H186L365 467L361 531L382 590L469 662L593 682L720 661L800 591L819 533L816 467L1013 491H1101V1312H98Z';
const headOutline = 'M230 240L390 116L474 16H680L787 113L936 182L949 311H896Q882 353 819 381L717 303L594 340L461 305L378 381Q305 363 282 314H230Z';

const priestly = {id:'priest', sprite:priestlySprite, feet, sleeves, torsoOutline, headOutline,
  bookCuffs:985, hem:'<path d="M246 1012Q595 1066 953 1012V1141L811 1186H388L246 1141Z" fill="#253b72"/>',
  equipmentTransform:'translate(477 259) scale(.56)'};

const joseph = {
  id:'joseph',
  sprite:'assets/artifacts/tunica-de-jose/skin.png',
  feet:'M150 1192Q147 1123 191 1093Q234 1068 281 1091Q344 1115 375 1198Q405 1278 344 1303L336 1312H196Q154 1267 150 1192Z M999 1192Q1002 1123 958 1093Q915 1068 868 1091Q805 1115 774 1198Q744 1278 805 1303L813 1312H953Q995 1267 999 1192Z',
  sleeves:[
    'M216 762L290 738Q405 725 445 832L502 1057Q500 1139 416 1152L311 1144L216 1078Q174 954 216 762Z',
    'M940 762L866 738Q751 725 711 832L654 1057Q656 1139 740 1152L845 1144L940 1078Q982 954 940 762Z'
  ],
  torsoOutline:'M197 496L361 470L355 531L378 601L451 655L575 675L699 654L783 603L806 531L798 470L946 496L983 552L937 665L900 694L950 770L947 797L1019 947L1096 1098L1140 1153V1312H30V1158L80 1074L144 939L223 797L209 767L264 689L209 652L173 552Z',
  headOutline:'M242 300L264 222L310 159L371 135L430 62L517 10H662L748 53L814 145L861 173L921 270L919 312H868Q859 361 785 382L704 305L568 338L452 305L371 383Q303 368 286 312H242Z',
  bookCuffs:1019,
  hem:'<path d="M244 1085H919L826 1190H333Z" fill="#653342"/>'
};

const david = {
  id:'david',
  sprite:'assets/artifacts/pequeno-pastor-de-davi/skin.png',
  feet:'M179 1173Q181 1112 218 1091Q275 1062 323 1104Q390 1159 405 1252L390 1312H223Q181 1266 179 1173Z M975 1173Q973 1112 936 1091Q879 1062 831 1104Q764 1159 749 1252L764 1312H931Q973 1266 975 1173Z',
  sleeves:[
    'M313 940L422 879L495 944L539 1049L511 1125L492 1172H398L348 1117L325 1065Z',
    'M841 940L732 879L659 944L615 1049L643 1125L662 1172H756L806 1117L829 1065Z'
  ],
  torsoOutline:'M207 492L365 475L359 537L387 603L466 657L583 681L707 657L780 601L805 535L796 474L942 498L969 566L921 667L841 695L886 740L869 810L923 855L972 971L1011 1010L1085 1150L1014 1252L983 1312H166L83 1151L145 1038L134 1009L185 931L215 861L270 803L257 738L304 687L240 660L186 561Z',
  headOutline:joseph.headOutline + ' M852 300L887 276L928 310L922 351L993 536L952 561L979 622L906 651L887 551L855 542L859 350L850 330Z',
  bookCuffs:1024,
  hem:'<path d="M245 1115H910L826 1220H342Z" fill="#b3865a"/>'
};

function spriteSkin(rig, studying, skin) {
  const {sprite, feet, sleeves, torsoOutline, headOutline, bookCuffs, hem, equipmentTransform} = skin;
  // One registration for all regions in the supplied 1199×1312 sprite.
  const id = `${studying ? 'study' : 'home'}-${skin.id}`;
  const image = `<image href="${sprite}" width="1199" height="1312" aria-hidden="true"/>`;
  const registered = content => `<g transform="translate(407 227) scale(.53)">${content}</g>`;
  const clipped = region => `<g clip-path="url(#${id}-${region})">${image}</g>`;
  const clip = (name,d) => `<clipPath id="${id}-${name}"><path d="${d}"/></clipPath>`;
  const definitions = `<defs>
    ${clip('head',headOutline)}${clip('feet',feet)}${clip('torso',torsoOutline)}
    ${clip('grounded-hem','M0 1190H1199V1312H0Z')}
    ${studying ? clip('book-cuffs',`M0 0H1199V${bookCuffs}H0Z`) : ''}
    <mask id="${id}-body" maskUnits="userSpaceOnUse" x="0" y="0" width="1199" height="1312">
      <path fill="white" d="M0 0H1199V1312H0Z"/><path fill="black" d="${feet} ${sleeves.join(' ')}"/>
    </mask>
    ${sleeves.map((d,index)=>clip(`arm-${index}`,d)).join('')}
  </defs>`;
  const torso = registered(definitions + `<g clip-path="url(#${id}-torso)">
    ${hem}
    <g mask="url(#${id}-body)">${image}</g>
    <g ${studying ? `clip-path="url(#${id}-book-cuffs)"` : ''}>
      ${sleeves.map((_,index) => `<g class="skin-sleeve skin-sleeve-${index}">${clipped(`arm-${index}`)}</g>`).join('')}
    </g>
  </g>`);
  const head = rig.match(/<g class="lamb-head">[\s\S]*?(?=<\/g>\s*<\/g>\s*<\/svg>$)/);
  if (!head) return rig;
  const dressedHead = head[0] + registered(clipped('head')) + '</g>';
  const grounded = registered(`<g clip-path="url(#${id}-grounded-hem)">
    <g clip-path="url(#${id}-torso)" mask="url(#${id}-body)">${image}</g>
  </g>${clipped('feet')}`);

  // The neck shares the torso's motion. The hem and rear paws stay in the
  // stationary group, painted in front of the moving robe at ground level.
  return rig
    .replace(/<svg /, '<svg class="lamb-wearing-skin" ')
    .replace(/<g class="lamb-fleece">[\s\S]*?<\/g>/, torso)
    .replace(/<\/g>(\s*<g class="lamb-paws">)/, dressedHead + '</g>$1')
    .replace(/<g class="lamb-paws">[\s\S]*?(<\/g>\s*<\/svg>)$/,
      (_, ending) => `<g class="lamb-paws">${grounded}</g>${ending}`)
    // Place the medallion on the upper shoulder, clear of the breastplate.
    .replace('<g class="lamb-equipment">', equipmentTransform
      ? `<g class="lamb-equipment" transform="${equipmentTransform}">`
      : '<g class="lamb-equipment">');
}

const skins = {
  default: rig => rig,
  priestly_vestments: (rig, studying) => spriteSkin(rig, studying, priestly),
  joseph_tunic: (rig, studying) => spriteSkin(rig, studying, joseph),
  david_shepherd: (rig, studying) => spriteSkin(rig, studying, david)
};

const outfitSkins = {
  'vestes-sacerdotais': 'priestly_vestments',
  'tunica-de-jose': 'joseph_tunic',
  'pequeno-pastor-de-davi': 'david_shepherd'
};

export function applyLambSkin(rig, outfit, studying = false) {
  return skins[outfitSkins[outfit] ?? 'default'](rig,studying);
}
