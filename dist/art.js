function facets(pieces) {
 return pieces.map(([color, points]) => `<polygon fill="${color}" points="${points}"/>`).join('');
}

function studyBook() {
 return `<g class="study-book">
  <path fill="#d99952" d="M558 650q78 8 165 55 83-46 170-57l-24 152-141 51-145-50Z"/>
  <path fill="#fff0ce" d="M570 641q95 9 153 63 59-54 156-65l8 22-162 60-163-59Z"/>
  <path class="study-book-page" fill="#f5d6a0" d="M570 653q101 17 153 54 65-44 157-57l-3 15-151 61-155-57Z"/>
  <path fill="#75432a" d="m560 663 148 50 5 131-130-43Z"/>
  <path fill="#5e3524" d="m739 713 151-51-21 139-134 44Z"/>
  <path fill="#8d502d" d="m708 713 16 4 16-4-5 132-12 5-10-6Z"/>
  <path fill="#e8ad58" d="m812 720 6 17 17 3-17 9-6 18-6-16-18-4 18-8Z"/>
  <g class="study-paw-left">
   <path fill="#624131" d="m545 732 29-20 28 8 16 25-4 24-20 18-29-8-19-22Z"/>
   <path fill="#432c22" d="m584 738 18-18 16 25-4 24-20 18-13-5Z"/>
  </g>
  <g class="study-paw-right">
   <path fill="#624131" d="m905 732-29-20-28 8-16 25 4 24 20 18 29-8 19-22Z"/>
   <path fill="#432c22" d="m866 738-18-18-16 25 4 24 20 18 13-5Z"/>
  </g>
 </g>`;
}

export function sheep(equipped = false, studying = false) {
 return `<svg viewBox="${studying ? '51 12 198 230' : '0 0 300 270'}" role="img" aria-label="${studying ? 'A seated lamb holding an open book' : 'A seated cream wool lamb with a dark face'}">
  <ellipse cx="150" cy="238" rx="88" ry="11" fill="#48321e" opacity=".22"/>
  <g transform="translate(53 16) scale(.325) translate(-430 -238)">
   <defs>
    <linearGradient id="lamb-wool" x2="70%" y2="100%"><stop stop-color="#fff0cf"/><stop offset=".52" stop-color="#f6cb96"/><stop offset="1" stop-color="#c98b5e"/></linearGradient>
    <linearGradient id="lamb-face" x2="60%" y2="100%"><stop stop-color="#624131"/><stop offset="1" stop-color="#503529"/></linearGradient>
   </defs>
   <g class="lamb-chest">
   <g class="lamb-fleece">
    <path fill="url(#lamb-wool)" d="m535 484 55-29 268 1 51 36 22 31 6 35-22 37-15 8 28 23 22 32 4 45 31 39 4 43-12 59-54 39-87 20-112-4-113 4-91-21-53-36-21-44 1-70 36-38-2-30 6-36 38-38-26-42 11-38z"/>
    ${facets([
     ['#ffebbd','535,484 552,516 527,539 500,558 510,510'],
     ['#fbc88b','552,516 603,514 610,552 575,567 527,539'],
     ['#f7b977','500,558 527,539 575,567 552,607 525,598'],
     ['#f6d3a8','575,567 610,552 637,587 619,620 582,603 552,607'],
     ['#e6a676','619,620 637,587 727,603 693,633 646,641'],
     ['#f8d2aa','727,603 805,576 823,620 775,640 693,633'],
     ['#f2c397','823,620 805,576 852,552 899,572 915,595 886,623 847,637'],
     ['#e9af83','852,552 859,510 903,514 937,558 915,595 899,572'],
     ['#fff0c9','525,598 552,607 565,636 519,664 483,674 487,635'],
     ['#f4bc80','552,607 582,603 619,620 646,641 575,667 565,636'],
     ['#ffdc9d','483,674 519,664 565,636 575,667 543,724 501,712 483,694'],
     ['#ffe7b3','447,732 483,694 501,712 479,758'],
     ['#f5c48b','447,732 479,758 501,712 543,724 545,775 501,808 456,797'],
     ['#e7a774','543,724 597,740 609,758 591,813 545,775'],
     ['#f9d09e','575,667 646,641 693,633 726,687 701,775 609,758 597,740 543,724'],
     ['#f7c89d','726,687 775,640 847,637 875,682 900,726 840,758 751,775'],
     ['#dda276','726,739 751,775 724,824 701,775'],
     ['#e6af84','847,637 886,623 929,630 950,658 954,703 900,726 875,682'],
     ['#edb688','900,726 954,703 985,742 989,785 951,810 899,785'],
     ['#cf946a','899,785 951,810 977,844 923,883 835,903 840,758'],
     ['#c98e66','501,808 545,775 591,813 645,872 611,903 520,882 467,846']
    ])}
   </g>
   ${equipped ? `<g class="lamb-equipment">
    <path fill="#6b351e" d="m602 633 21-13q40 33 102 34 59 0 100-34l20 15q-39 43-120 48-78-4-123-50Z"/>
    <path fill="#99522a" d="m623 620 24 14-8 20-20-11Zm171 19 22-12 10 21-25 14Z"/>
    <g class="worn-liahona" transform="translate(725 683)">
     <path fill="#a75c10" d="m0-47 29 9 15 22-1 32-17 23-26 8-27-8-16-23-2-29 16-24Z"/>
     <path fill="#eaa82d" stroke="#ffca55" stroke-width="3" d="m0-43 25 8 15 20-1 28-16 21-23 7-23-7-16-21-2-27 16-20Z"/>
     <circle r="28" fill="#774218" stroke="#b47319" stroke-width="4"/>
     <path fill="#ffe082" d="m0-25 7 18 18 7-18 7-7 18-7-18-18-7 18-7Z"/>
    </g>
   </g>` : ''}
   ${studying ? studyBook() : ''}
   </g>
   <g class="lamb-paws">
    <path fill="#402c22" d="M468 849q0-43 52-44 63 2 105 91-24 30-82 29-56-4-75-76Zm514 0q0-43-52-44-63 2-105 91 24 30 82 29 56-4 75-76Z"/>
    <path fill="#503428" d="M468 849q4-41 48-39 54 2 64 75 1 27-19 37-63 11-93-73Zm514 0q-4-41-48-39-54 2-64 75-1 27 19 37 63 11 93-73Z"/>
    <g fill="#78503b">
     <path d="M496 884q-6-18 15-27 26-9 43 30 3 15-13 22-24 10-45-25Zm458 0q6-18-15-27-26-9-43 30-3 15 13 22 24 10 45-25Z"/>
     <ellipse cx="484" cy="855" rx="7" ry="10" transform="rotate(-24 484 855)"/><ellipse cx="498" cy="837" rx="8" ry="12" transform="rotate(-24 498 837)"/><ellipse cx="524" cy="836" rx="8" ry="12" transform="rotate(-24 524 836)"/>
     <ellipse cx="966" cy="855" rx="7" ry="10" transform="rotate(24 966 855)"/><ellipse cx="952" cy="837" rx="8" ry="12" transform="rotate(24 952 837)"/><ellipse cx="926" cy="836" rx="8" ry="12" transform="rotate(24 926 836)"/>
    </g>
    ${studying ? '' : `<g class="lamb-forepaw">
    <path fill="#51372a" d="m608 757 93 18 19 138q1 16-37 14-33 0-38-11l-26-89Z"/>
    <path fill="#644534" d="m608 757 23 13 30 116-24-3-18-56Z"/>
    <path fill="#35271f" d="m637 883 31 5 48-6 4 31q1 16-37 14-33 0-38-11Z"/>
    </g>
    <path fill="#51372a" d="M842 757l-92 18-17 138q-1 16 36 14 34 0 39-11l25-89Z"/>
    <path fill="#644534" d="M842 757l-21 13-31 116 26-3 17-56Z"/>
    <path fill="#35271f" d="M816 883l-31 5-48-6-4 31q-1 16 36 14 34 0 39-11Z"/>`}
   </g>
   <g class="lamb-head">
    <g class="lamb-ear lamb-ear-left">
    <path fill="#3f291f" d="M613 414q-78-67-182-23 16 78 105 98l66-16Z"/>
    <path fill="#604130" d="m432 391 57-22 47 4 67 30-44 8-61-27Z"/>
    <path fill="#523526" d="m437 402 137 49-47 17-52-1Z"/>
    </g>
    <g class="lamb-ear lamb-ear-right">
    <path fill="#3f291f" d="M834 414q78-67 179-23-16 78-105 98l-61-16Z"/>
    <path fill="#604130" d="M1013 391l-59-22-45 4-67 30 44 8 61-27Z"/>
    <path fill="#523526" d="M1007 402l-133 49 47 17 48-1Z"/>
    </g>
    <path fill="#412b20" d="m604 412 32-43 88-11 102 26 24 39 10 91-13 40-40 37-81 19-78-10-48-42-12-47Z"/>
    <path fill="url(#lamb-face)" d="m612 425 37-34 74-18 95 22 22 32 10 80-15 44-46 28-63 9-66-9-43-27-14-43Z"/>
    <g fill="#261a15">
     <g class="lamb-gaze"><g class="eye"><rect x="642" y="438" width="25" height="56" rx="12"/><circle cx="655" cy="460" r="6" fill="#ffe0b2"/></g></g>
     <g class="lamb-gaze"><g class="eye"><rect x="782" y="438" width="25" height="56" rx="12"/><circle cx="795" cy="460" r="6" fill="#ffe0b2"/></g></g>
    </g>
    <path fill="#ad5d43" d="m606 507 12-9h17l12 10-9 9h-21Zm195 0 12-9h17l12 10-9 9h-21Z"/>
    <path class="lamb-nose" fill="#38251b" d="M708 499h35q6 0 1 6l-18 18-20-18q-5-6 2-6Z"/>
    <path class="lamb-mouth" d="M725 518v25m-28-6q13 16 28 6 15 10 29-6" fill="none" stroke="#38251b" stroke-width="4" stroke-linecap="round"/>
    <path fill="#f9cc9c" d="m533 374 18-54 46-14 23-36 29-16 77-16 50 28 46-2 40 35 1 13 39 18 11 42-13 28-53 22-23-32-59-22-65 25-63-13-37 42-41-17Z"/>
    ${facets([
     ['#fff1d2','533,374 551,320 597,306 570,360'],
     ['#ffdfa8','570,360 597,306 659,272 669,334 637,380 601,371'],
     ['#ffefd0','597,306 620,270 649,254 676,250 659,272'],
     ['#ffe6ba','659,272 676,250 726,238 776,266 735,282'],
     ['#f7c18c','659,272 735,282 738,327 669,334'],
     ['#e9a96f','669,334 738,327 765,368 700,393 637,380'],
     ['#f2b47d','533,374 570,360 601,371 600,422 559,405'],
     ['#f8c696','735,282 776,266 819,323 765,368 738,327'],
     ['#ffe2b9','776,266 822,264 862,299 819,323'],
     ['#edb07e','765,368 819,323 857,362 824,390'],
     ['#f4bd8d','857,362 863,312 902,330 913,372 900,400 847,422 824,390']
    ])}
   </g>
  </g>
 </svg>`;
}
export function artifact(){return `<div class="artifact"><svg viewBox="0 0 200 200" role="img" aria-label="An illustrated brass Liahona"><defs><radialGradient id="brass" cx="35%" cy="25%"><stop stop-color="#f0d58d"/><stop offset=".5" stop-color="#c9a052"/><stop offset="1" stop-color="#82612d"/></radialGradient></defs><circle cx="100" cy="105" r="64" fill="url(#brass)" stroke="#a7823e" stroke-width="2"/><ellipse cx="100" cy="105" rx="63" ry="21" fill="none" stroke="#f1d998" stroke-width="3" transform="rotate(-23 100 105)"/><ellipse cx="100" cy="105" rx="25" ry="63" fill="none" stroke="#f1d998" stroke-width="3" transform="rotate(-23 100 105)"/><circle cx="100" cy="105" r="39" fill="#ad8946" stroke="#e1bf73" stroke-width="4"/><circle cx="100" cy="105" r="33" fill="#4d6150" stroke="#806333" stroke-width="2"/><path d="m100 77 8 27-8 30-8-30Z" fill="#f1d387" transform="rotate(32 100 105)"/><circle cx="100" cy="105" r="5" fill="#fff0bd"/><path d="M92 42v-8q8-9 16 0v8" fill="none" stroke="#ae8a43" stroke-width="5"/><g fill="#e8ca87"><circle cx="100" cy="70" r="2"/><circle cx="135" cy="105" r="2"/><circle cx="100" cy="140" r="2"/><circle cx="65" cy="105" r="2"/></g></svg></div>`}
export function icon(name) {
 const paths={home:'M3 11 12 3l9 8M6 10v11h12V10M10 21v-7h4v7',bag:'M7 8V6a5 5 0 0 1 10 0v2M5 8h14l2 13H3L5 8Zm4 4v3m6-3v3',book:'M12 5C8 2 4 3 2 4v16c3-1 7-1 10 2 3-3 7-3 10-2V4c-2-1-6-2-10 1Zm0 0v17',map:'m3 5 6-3 6 3 6-3v17l-6 3-6-3-6 3V5Zm6-3v17m6-14v17',spark:'m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z',close:'m6 6 12 12M6 18 18 6',back:'m14 5-7 7 7 7M7 12h14',settings:'M12 8v8m-4-4h8M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',heart:'M12 21S2 15 2 8c0-6 8-7 10-1 2-6 10-5 10 1 0 7-10 13-10 13Z',check:'m5 12 5 5L20 7',download:'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5'};
 return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${paths[name]?`<path d="${paths[name]}"/>`:''}</svg>`;
}
export function bagArt(){return `<svg viewBox="0 0 120 120" aria-hidden="true"><ellipse cx="61" cy="104" rx="41" ry="10" fill="#5a503422"/><path d="M43 33v-8q17-23 34 0v9" fill="none" stroke="#76573e" stroke-width="7"/><path d="M26 43Q27 29 43 29h34q16 0 17 14l8 52q1 12-15 13H33q-17-1-15-14Z" fill="#956848"/><path d="M27 38q33-19 66 0v31q-33 25-66 0Z" fill="#bc8a5d" stroke="#ce9e6c" stroke-width="2"/><path d="M35 77h51v22H35Z" fill="#ad7c51"/><path d="M55 51h13v32H55Z" fill="#73523b"/><rect x="55" y="65" width="13" height="11" rx="2" fill="none" stroke="#ddbd78" stroke-width="3"/><path d="M25 48 19 91m75-43 8 43" fill="none" stroke="#6d513a" stroke-width="5"/></svg>`}
export function bookArt(){return `<svg viewBox="0 0 140 110" aria-hidden="true"><ellipse cx="70" cy="88" rx="56" ry="13" fill="#5a503433"/><path d="m12 62 52-26 66 23-53 30Z" fill="#53634d"/><path d="m14 57 49-24 65 22v8L77 85 14 65Z" fill="#e6d6ae"/><path d="m13 43 49-25 15 7 49 17-51 29Z" fill="#f8e9c4"/><path d="m13 43 50-25 12 10v43L13 51Z" fill="#f0dfb8"/><path d="m75 28 51 14v9L75 71Z" fill="#fff1cf"/><path d="m75 28-1 42" stroke="#a18d60" stroke-width="2"/><path d="m27 40 29-14m-22 21 28-13m25 4 21 6m-23 3 16 5" stroke="#c1ae82" stroke-width="2"/><path d="m86 59 7 4v20l-5-1-4 5V65" fill="#af7255"/></svg>`}
