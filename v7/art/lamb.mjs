import { ink, pixels, shape } from './palette.mjs';

const fleece = ['#8e7472','#b89b8a','#d8bda3','#f4ddbb','#fff0cf'];
const skin = '#bb8b80';
const hoof = '#4c3740';
const poses = ['idle','blink','stepA','stepB','stepC','stepD','settle','sit','lookA','lookB','breathe','yawn','yawnDeep','lie','sleep','sleepB','wake','pet','snuggle','ruffled','perk','stir','sitBlink'];
const size = 42;

function leg(g, x, y, kick, shade) {
  pixels(g, ink, [[x,y,5,7],[x+kick,y+5,5,4]]);
  pixels(g, shade, [[x+1,y,3,5],[x+kick+1,y+4,3,3]]);
  pixels(g, hoof, [[x+kick+1,y+7,3,1]]);
}
function wool(g, x, y, w, h) {
  shape(g, ink, [[x+4,y],[x+w-5,y],[x+w,y+5],[x+w,y+h-5],[x+w-5,y+h],[x+4,y+h],[x,y+h-4],[x,y+5]]);
  pixels(g, fleece[0], [[x+2,y+5,w-4,h-9],[x+5,y+2,w-10,h-4]]);
  pixels(g, fleece[1], [[x+2,y+5,w-4,h-11],[x+5,y+3,w-10,h-8],[x+5,y+h-6,w-10,3]]);
  pixels(g, fleece[2], [[x+3,y+5,w-7,h-12],[x+6,y+2,w-12,h-7],[x+5,y+7,4,5]]);
  pixels(g, fleece[3], [[x+5,y+4,w-12,3],[x+3,y+6,5,3],[x+w-12,y+7,4,3],[x+7,y+11,7,2]]);
  pixels(g, fleece[4], [[x+6,y+4,5,2],[x+w-10,y+4,4,2]]);
}
function ear(g, x, y, right) {
  const tip = right ? 7 : 0;
  shape(g, ink, [[x,y+1],[x+7,y],[x+9,y+3],[x+tip+1,y+7],[x+2,y+6]]);
  pixels(g, fleece[1], [[x+2,y+2,5,3]]);
  pixels(g, skin, [[x+3,y+3,3,2]]);
}

function drawPose(g, facing, pose) {
  const side = facing === 'east';
  const back = facing === 'north';
  const gait = poses.indexOf(pose) - 2;
  const moving = gait >= 0 && gait < 4;
  const resting = ['lie','sleep','sleepB','stir'].includes(pose);
  const seated = ['sit','wake','pet','snuggle','ruffled','sitBlink'].includes(pose) || resting;
  const shut = ['blink','sleep','sleepB','pet','snuggle','yawnDeep','sitBlink'].includes(pose);
  const lift = moving ? [0,1,0,-1][gait] : 0;
  const legs = moving ? [[0,-2],[-2,1],[1,0],[2,-1]][gait] : [0,0];
  const breathe = ['breathe','sleepB','perk'].includes(pose) ? -1 : 0;
  const y = (resting ? 21 : seated ? 16 : 12) + lift + breathe;
  const tilt = ['lookB','snuggle','perk'].includes(pose) ? 2 : 0;
  const faceX = side ? 22 : 12 + tilt;
  const faceY = y - (back ? 7 : 5) +
    (resting ? 3 : pose === 'snuggle' ? 2 : pose === 'yawnDeep' ? -2 : 0);
  const earLift = ['ruffled','perk','stir'].includes(pose) ? -2 : 0;

  if (side && !resting) {
    leg(g, 10, 24 + legs[1], 0, fleece[0]);
    leg(g, 24, 24 + legs[0], 0, fleece[0]);
    pixels(g, ink, [[3,y+7,7,7]]);
    pixels(g, fleece[2], [[4,y+8,5,4],[6,y+7,3,4]]);
  }
  if (!resting) {
    leg(g, side ? 14 : 11, seated ? 26 : 26 + legs[0], moving ? legs[0] : 0, fleece[1]);
    leg(g, side ? 26 : 24, seated ? 25 : 26 + legs[1], moving ? legs[1] : 0, fleece[1]);
  }
  wool(g, side ? 5 : 9, y+1, side ? 25 : 23, resting ? 14 : 17);
  pixels(g,fleece[2],[[side ? 12 : 14,y+6,7,3],[side ? 17 : 19,y+10,5,2]]);
  pixels(g,fleece[3],[[side ? 10 : 12,y+5,4,2],[side ? 16 : 18,y+8,5,2]]);
  if (resting) pixels(g,hoof,[[11,34,5,2],[20,34,4,2]]);

  if (back) {
    ear(g, 6+tilt, faceY+4+earLift, false);
    ear(g, 24+tilt, faceY+4+earLift, true);
    wool(g, faceX, faceY, 16, 12);
    pixels(g, fleece[0], [[17,y+14,6,5]]);
    pixels(g, fleece[3], [[17,y+13,5,4],[19,y+12,3,3]]);
    return;
  }
  ear(g, faceX - 5, faceY+4+earLift, false);
  if (!side) ear(g, faceX+14, faceY+4+earLift, true);
  shape(g, ink, [[faceX+3,faceY],[faceX+14,faceY],[faceX+17,faceY+4],[faceX+16,faceY+13],[faceX+12,faceY+16],[faceX+4,faceY+15],[faceX,faceY+11],[faceX,faceY+4]]);
  pixels(g, fleece[1], [[faceX+1,faceY+5,14,6],[faceX+3,faceY+10,11,4]]);
  pixels(g, fleece[2], [[faceX+2,faceY+5,12,6],[faceX+5,faceY+11,9,2]]);
  pixels(g, fleece[3], [[faceX+2,faceY+2,12,4],[faceX+4,faceY+1,8,3],[faceX+6,faceY+4,4,3]]);
  const nearEye = pose === 'ruffled' ? 1 : shut ? 1 : 3;
  pixels(g,ink,[[faceX+11,faceY+7,shut?3:2,nearEye]]);
  if (!side) pixels(g,ink,[[faceX+4,faceY+7,shut?3:2,nearEye]]);
  if (!shut && pose !== 'ruffled') pixels(g,fleece[4],[[faceX+11,faceY+7,1,1]]);
  pixels(g,skin,[[faceX+(side?13:8),faceY+11,2,1]]);
  if (pose === 'yawn' || pose === 'yawnDeep') {
    pixels(g,ink,[[faceX+11,faceY+11,4,pose==='yawnDeep'?3:2]]);
  }
  if (side) ear(g, faceX-4, faceY+5+earLift, false);
}

export function createSheet(canvas) {
  canvas.width = size * poses.length;
  canvas.height = size * 3;
  const g = canvas.getContext('2d');
  ['south','east','north'].forEach((face, row) => poses.forEach((pose, column) => {
    g.save();
    g.translate(size * column, size * row);
    drawPose(g, face, pose);
    g.restore();
  }));
  return canvas;
}

export function lambShadow(g, lamb) {
  const x = Math.round(lamb.x), y = Math.round(lamb.y);
  g.save();
  g.globalAlpha = 0.60;
  pixels(g, '#33252e', [[x-12,y-2,24,5],[x-8,y-4,16,9]]);
  g.restore();
}

export function drawLamb(g, sheet, lamb) {
  const facing = lamb.face === 'west' ? 'east' : lamb.face;
  const row = ['south','east','north'].indexOf(facing);
  let column = 0;
  if (lamb.pose === 'walk') column = 2 + Math.floor(lamb.distance / 4.8) % 4;
  if (lamb.pose === 'idle' && lamb.elapsed % 4.3 > 4.13) column = 1;
  if (lamb.pose === 'settle') column = 6;
  if (lamb.pose === 'sit') column = 7;
  if (lamb.pose === 'look') column = lamb.elapsed % 3.7 > 2.2 ? 9 : 8;
  if (lamb.pose === 'idle' && column === 0 && lamb.elapsed % 2.4 > 1.2) column = 10;
  if (lamb.pose === 'sit' && lamb.elapsed % 4.4 > 4) column = 22;
  if (lamb.pose === 'yawn') column = lamb.elapsed > .25 && lamb.elapsed < 1.16 ? 12 : 11;
  if (lamb.pose === 'lie') column = lamb.elapsed < .22 ? 7 : 13;
  if (lamb.pose === 'sleep') column = lamb.elapsed % 3.4 < 1.6 ? 14 : 15;
  if (lamb.pose === 'wake') column = lamb.elapsed < .23 ? 21 : lamb.elapsed < .48 ? 16 : 7;
  if (lamb.pose === 'pet') column = lamb.elapsed < .24 ? 17 : 18;
  if (lamb.pose === 'ruffled') column = 19;
  if (lamb.pose === 'perk') column = 20;
  if (lamb.pose === 'stir') column = lamb.elapsed < .58 ? 21 : 14;
  g.save();
  g.translate(Math.round(lamb.x), Math.round(lamb.y));
  if (lamb.face === 'west') g.scale(-1, 1);
  g.drawImage(sheet, column*size, row*size, size, size, -21, -35, size, size);
  g.restore();
}
