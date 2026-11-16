import { world } from '../navigation.mjs';
import { burgundy as red, gold, ink, wood as w, light, pixels, shape } from './palette.mjs';

const rect = (g, color, x, y, width, height) => pixels(g, color, [[x,y,width,height]]);
const noise = (a,b) => {
  const n = Math.imul(a + 117, 1597334677) ^ Math.imul(b + 63, 3812015801);
  return ((n ^ n >>> 16) >>> 0) / 4294967296;
};

function planks(g, x, y, width, height) {
  rect(g, w[1], x,y,width,height);
  const pitch = 17;
  for (let row = 0; row < Math.ceil(height / pitch); row++) {
    const top = y + row * pitch;
    const h = Math.min(pitch,height - row*pitch);
    const offset = row * 29 % 71;
    for (let col = -1; col <= width / 71; col++) {
      const left = Math.max(x, x + col * 71 + offset);
      const right = Math.min(x + width, x + (col+1)*71 + offset);
      const span = right-left;
      if (span <= 3) continue;
      const tone = 3 + Math.floor(noise(col,row)*3);
      rect(g, w[tone], left,top,span-1,h-1);
      rect(g, w[tone+1], left+1,top,span-2,1);
      rect(g, w[tone-1], left+1,top+h-3,span-2,2);
      for (let grain = 0; grain < 6; grain++) {
        const gx = Math.floor(noise(col*8+grain,row)*Math.max(1,span-10));
        const gy = Math.floor(noise(row,col*9+grain)*Math.max(1,h-5));
        const length = Math.min(span-gx-2, 4+Math.floor(noise(grain,col+row)*22));
        if (length > 0) rect(g,w[tone+(grain%3 === 0 ? 1 : -1)],left+gx,top+gy+2,length,1);
      }
      if (span > 24) pixels(g,w[tone-2],[[left+3,top+4,1,1],[right-5,top+h-5,1,1]]);
    }
  }
}

function beam(g, x, y, width, height) {
  rect(g, ink,x,y,width,height);
  rect(g,w[3],x+1,y+1,width-3,height-3);
  if (width > height) {
    pixels(g,w[4],[[x+1,y+1,width-3,2],[x+5,y+4,Math.floor(width*.6),1]]);
    rect(g,w[2],x+2,y+height-4,width-4,2);
  } else {
    pixels(g,w[4],[[x+2,y+2,2,height-5],[x+5,y+8,1,Math.floor(height*.7)]]);
    rect(g,w[2],x+width-5,y+2,2,height-5);
  }
}

function window(g) {
  const x = 163, y = 30;
  shape(g, ink, [[x,y+63],[x,y+16],[x+10,y+6],[x+26,y],[x+71,y],[x+88,y+7],[x+98,y+18],[x+98,y+63]]);
  shape(g, w[5], [[x+3,y+61],[x+3,y+18],[x+13,y+8],[x+27,y+3],[x+70,y+3],[x+86,y+10],[x+95,y+19],[x+95,y+61]]);
  shape(g, '#719487', [[x+8,y+58],[x+8,y+19],[x+17,y+11],[x+28,y+8],[x+70,y+8],[x+84,y+13],[x+90,y+21],[x+90,y+58]]);
  shape(g, '#bcb98c', [[x+8,y+38],[x+21,y+37],[x+33,y+31],[x+55,y+34],[x+68,y+30],[x+90,y+35],[x+90,y+58],[x+8,y+58]]);
  shape(g, '#f0cf91', [[x+57,y+14],[x+67,y+13],[x+73,y+17],[x+75,y+23],[x+72,y+28],[x+59,y+29],[x+55,y+24],[x+55,y+18]]);
  shape(g, '#7b9571', [[x+8,y+43],[x+22,y+37],[x+37,y+40],[x+52,y+47],[x+73,y+37],[x+90,y+39],[x+90,y+58],[x+8,y+58]]);
  shape(g, '#526e61', [[x+8,y+51],[x+24,y+45],[x+44,y+47],[x+57,y+52],[x+76,y+46],[x+90,y+49],[x+90,y+59],[x+8,y+59]]);
  pixels(g,'#89a575',[[x+14,y+51,10,2],[x+27,y+47,8,1],[x+66,y+52,12,1],[x+80,y+49,5,2]]);
  pixels(g,w[2],[[x+46,y+7,5,54],[x+7,y+35,84,4]]);
  pixels(g,w[6],[[x+46,y+8,1,51],[x+8,y+35,82,1]]);
  beam(g,x-6,y+60,110,10);
  rect(g,w[6],x-4,y+61,105,1);
}
function wall(g) {
  rect(g, '#563d42',16,8,416,111);
  for (let col = 0; col < 26; col++) {
    const x = 16+col*16;
    const colors = ['#553e45','#61464a','#674a4a','#6c4b4c'];
    rect(g, colors[Math.floor(noise(col,0)*colors.length)],x,13,15,101);
    rect(g, w[2],x,11,1,103);
    for (let n=0;n<5;n++) {
      const y=21+Math.floor(noise(col,n+12)*81);
      rect(g,'#73514e',x+2+Math.floor(noise(n,col)*11),y,1,5+Math.floor(noise(col,n)*9));
    }
  }
  beam(g,16,9,416,11);
  beam(g,16,105,416,13);
  beam(g,16,15,12,109);
  beam(g,119,16,12,92);
  beam(g,291,16,12,94);
  beam(g,420,16,12,108);
  window(g);
  const hanging = [[117,28],[117,37],[117,74]];
  for (const [x,y] of hanging) rect(g,w[6],x+6,y,2,2);
  pixels(g,w[3],[[331,43,46,43],[333,41,42,2],[333,86,42,2]]);
  pixels(g,gold[0],[[335,46,38,36],[337,48,34,32]]);
  rect(g,'#805c57',339,50,30,28);
  shape(g,'#a98368',[[339,67],[348,56],[359,66],[368,61],[369,78],[339,78]]);
  shape(g,'#556956',[[339,74],[349,67],[358,73],[369,68],[369,78],[339,78]]);
  pixels(g,'#edc984',[[358,55,5,3],[359,54,3,6]]);
}

function rug(g) {
  const outline = [[122,218],[244,218],[279,280],[269,291],[103,291],[95,281]];
  shape(g, '#4b333c', outline.map(([x,y])=>[x+2,y+3]));
  shape(g, red[0], outline);
  shape(g, gold[1], [[124,221],[242,221],[274,280],[265,287],[108,287],[100,280]]);
  shape(g, red[2], [[127,224],[239,224],[270,279],[263,284],[111,284],[104,279]]);
  shape(g, red[1], [[130,230],[236,230],[261,278],[114,278]]);
  for (let y = 233; y < 277; y+=3) {
    for (let x = 125; x < 248; x+=4) {
      if (noise(x,y) > .74) rect(g, red[2],x+(y%2)*2,y,2,1);
    }
  }
  for (const x of [143,187,231]) {
    shape(g,gold[0],[[x,233],[x+14,253],[x,274],[x-14,253]]);
    shape(g,red[2],[[x,237],[x+11,253],[x,270],[x-11,253]]);
    shape(g,gold[2],[[x,245],[x+5,253],[x,261],[x-5,253]]);
    rect(g,red[1],x-1,251,3,4);
  }
  for (let x=111;x<267;x+=5) rect(g,gold[x%3],x,288,2,4+x%3);
}
function shadow(g, x, y, width, h) {
  g.save();
  g.globalAlpha = .49;
  pixels(g,'#30252c',[[x+3,y,width-6,h],[x,y+3,width,h-6]]);
  g.restore();
}

function shelf(g) {
  const x=35, y=52;
  shadow(g,x-4,132,90,16);
  shape(g,w[1],[[x+73,y+3],[x+81,y+10],[x+81,y+85],[x+73,y+90]]);
  rect(g,ink,x,y,75,85);
  rect(g,w[4],x+3,y+4,69,76);
  rect(g,w[1],x+8,y+9,59,63);
  pixels(g,w[6],[[x+3,y+2,67,2],[x+4,y+7,3,69]]);
  for (let row=0;row<3;row++) {
    const base=y+30+row*22;
    const book=['#8f5b59','#657a70','#9b704f','#a58660','#615066'];
    for(let i=0;i<10;i++) {
      const h=7+Math.floor(noise(i,row)*10);
      const bx=x+10+i*5;
      if (noise(i+10,row) > .20) {
        rect(g,book[(i+row*3)%book.length],bx,base-h,4,h);
        pixels(g,gold[1],[[bx+1,base-h+2,2,1],[bx+1,base-3,2,1]]);
        rect(g,w[1],bx,base-1,4,1);
      }
    }
    beam(g,x+6,base,64,4);
  }
  beam(g,x+1,y,75,7);
  pixels(g,w[2],[[x+4,y+83,8,8],[x+60,y+83,8,8]]);
}

function bench(g) {
  shadow(g,177,129,70,13);
  beam(g,181,116,6,22);
  beam(g,235,116,6,22);
  shape(g,w[5],[[178,110],[231,110],[245,117],[189,118]]);
  beam(g,178,117,67,7);
  pixels(g,red[1],[[187,111,25,4],[189,109,19,2]]);
  pixels(g,red[3],[[191,109,16,1],[189,113,21,1]]);
}
function bed(g) {
  shadow(g,306,218,99,15);
  beam(g,312,97,8,63);
  beam(g,387,98,9,61);
  shape(g,ink,[[319,142],[319,105],[325,99],[338,93],[369,93],[386,101],[389,105],[389,144]]);
  shape(g,w[3],[[320,141],[320,107],[327,101],[340,96],[367,96],[385,103],[386,141]]);
  pixels(g,w[4],[[324,109,3,26],[330,104,2,27],[338,100,2,27],[380,108,3,27],[371,102,2,29]]);
  shape(g, gold[1], [[340,115],[347,114],[352,109],[356,111],[363,105],[369,104],[365,109],[356,114],[361,118],[352,116],[346,120]]);
  shape(g,w[2],[[318,139],[393,137],[401,197],[390,225],[305,222],[305,188]]);
  shape(g,'#b6a18b',[[319,128],[383,125],[395,159],[395,199],[387,207],[306,202],[304,182]]);
  shape(g,'#e0c9a6',[[322,128],[383,125],[390,150],[319,153],[308,175],[308,155]]);
  shape(g,'#f4dfb9',[[329,129],[366,128],[374,134],[375,143],[329,146],[323,141]]);
  shape(g,'#fff0cf',[[330,130],[365,129],[371,133],[371,137],[328,139],[326,136]]);
  shape(g,red[0],[[317,153],[394,149],[403,184],[400,206],[393,214],[383,213],[378,215],[306,209],[300,204],[301,183]]);
  shape(g,red[2],[[318,154],[391,151],[400,184],[393,192],[304,188],[304,182]]);
  shape(g,red[3],[[317,156],[388,154],[391,159],[318,162],[309,184],[305,186]]);
  shape(g,red[1],[[305,190],[394,194],[399,188],[397,203],[391,211],[309,207],[302,203]]);
  shape(g,gold[1],[[302,194],[395,200],[399,195],[398,198],[395,203],[302,197]]);
  shape(g,gold[2],[[302,200],[392,206],[398,200],[397,203],[392,209],[302,203]]);
  for (let x=306;x<390;x+=4) rect(g,gold[0],x,206+Math.floor((x-305)/19),1,3+Math.floor(noise(x,3)*3));
  pixels(g,'#eccaa1',[[341,170,20,8],[344,168,14,2],[358,167,7,5],[345,177,2,4],[356,177,2,4],[337,172,5,3]]);
  rect(g,ink,362,169,1,1);
  beam(g,306,212,8,14);
  beam(g,386,215,8,13);
}

function lantern(g, time) {
  shadow(g,265,146,32,12);
  beam(g,269,132,6,23);
  beam(g,287,132,6,23);
  shape(g,w[5],[[272,126],[288,126],[297,133],[264,133]]);
  beam(g,264,133,33,7);
  pixels(g,ink,[[274,109,14,20],[276,105,10,4],[279,101,4,5]]);
  pixels(g,gold[0],[[275,109,12,2],[275,125,12,3],[276,112,1,12],[285,112,1,12]]);
  rect(g,'#744838',278,111,7,13);
  const sway = Math.floor(time*8)%4;
  pixels(g,gold[2],[[279,116,5,7],[280+(sway%3)-1,113+(sway%2),3,5]]);
  pixels(g,'#fff1b0',[[280,119,3,3],[281,116,1,5]]);
}

function leaf(g, x, y, dx, dy, n) {
  const end=[x+dx,y+dy];
  shape(g,'#39453a',[[x-2,y+1],[x+1,y+3],end,[end[0]+3,end[1]-2],[x+4,y-4]]);
  shape(g,n%2?'#6f885c':'#577750',[[x,y],[x+2,y+1],end,[end[0]+2,end[1]-1],[x+3,y-3]]);
  rect(g,'#95a56a',end[0]+1,end[1],3,1);
}
function plant(g, time) {
  const t=Math.round(Math.sin(time*1.5));
  shadow(g,136,174,29,14);
  pixels(g,'#667150',[[149,146,2,23],[146,151,2,15],[152,148,2,16]]);
  leaf(g,149,159,-13+t,-6,1);
  leaf(g,150,155,10+t,-12,0);
  leaf(g,151,161,14+t,-5,1);
  leaf(g,149,153,-8+t,-13,0);
  leaf(g,151,154,1+t,-16,1);
  shape(g,w[1],[[138,166],[163,166],[159,183],[143,183]]);
  shape(g,'#ad6b54',[[141,167],[161,167],[157,181],[145,181]]);
  pixels(g,w[5],[[141,167,20,3],[144,172,3,6]]);
  rect(g,w[2],138,164,25,4);
  rect(g,w[5],140,164,20,1);
}

function chest(g) {
  shadow(g,59,256,61,15);
  shape(g,w[2],[[64,229],[110,225],[116,236],[115,258],[108,265],[60,264],[59,239]]);
  shape(g,w[5],[[63,230],[108,226],[113,233],[110,240],[61,240]]);
  pixels(g,w[3],[[62,242,47,19],[63,244,44,2],[66,252,32,1],[69,257,36,1]]);
  pixels(g,gold[0],[[66,230,3,34],[100,228,3,35],[82,238,9,11]]);
  pixels(g,gold[2],[[67,231,1,30],[101,230,1,29],[83,239,7,2]]);
  rect(g,ink,85,242,3,4);
}

const sprites = { shelf, bench, bed, plant, lantern, chest };
export function drawScenery(g, id, time) {
  sprites[id](g,time);
}

export function bakeRoom(canvas) {
  canvas.width = world.width;
  canvas.height = world.height;
  const g = canvas.getContext('2d');
  rect(g,'#2b202a',0,0,world.width,world.height);
  planks(g,16,110,416,199);
  wall(g);
  pixels(g,w[1],[[16,118,8,191],[424,118,8,191],[16,305,416,4]]);
  pixels(g,w[5],[[23,119,1,184],[423,119,1,184],[19,304,409,1]]);
  rug(g);
  return canvas;
}
export function drawLights(g, time) {
  light(g,212,105,119,101,.26,'#ffd490');
  light(g,223,182,99,74,.14,'#f8ba79');
  light(g,280,121,67,57,.29+Math.sin(time*4)*.018,'#ffad5f');
}
