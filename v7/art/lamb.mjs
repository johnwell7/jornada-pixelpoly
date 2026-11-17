import { lambSource } from './assets.mjs';
import { artDensity, loadArtImage } from './room.mjs';

const bitmapWidth=159, bitmapHeight=102, unit=448/1448;
const gait=[0,1,0,-1];
const onGrid=value=>Math.round(value*artDensity)/artDensity;
const lowPose=pose=>['lie','sleep','stir'].includes(pose);

export function createSheet() {
  return loadArtImage(lambSource);
}

export function lambBounds(lamb) {
  const resting=lowPose(lamb.pose);
  return { halfWidth:25, head:resting?24:34, foot:6 };
}

export function lambShadow(g,lamb) {
  const x=Math.round(lamb.x),y=Math.round(lamb.y);
  g.save();
  g.globalAlpha=.33;
  g.fillStyle='#1a100b';
  g.fillRect(x-17,y-3,34,5);
  g.fillRect(x-12,y-5,24,8);
  g.restore();
}

export function drawLamb(g,sheet,lamb) {
  const {face,pose,elapsed}=lamb;
  const walking=pose==='walk';
  const phase=Math.floor(lamb.distance/4)%4;
  const step=walking?gait[phase]:0;
  const resting=lowPose(pose);
  const rising=pose==='wake'||pose==='lie';
  const height=resting ? (pose==='lie'?Math.max(.70,1-elapsed*.50):.70) :
    rising ? Math.min(1,.70+elapsed*.55) : pose==='pet'||pose==='snuggle' ? .93 : 1;
  const breadth=(face==='north'||face==='south') ? .89 : 1;
  const bob=walking ? -Math.abs(step) : resting && Math.sin(elapsed*2.1)>.65 ? -.33 : 0;
  const facing=face==='west'||face==='north'?-1:1;
  const blink=pose==='pet'||pose==='sleep'||pose==='snuggle'||
    (!walking&&!resting&&elapsed%5.1>4.91);
  const x=onGrid(lamb.x),y=onGrid(lamb.y+bob);
  const dx=(sx)=>onGrid((sx-bitmapWidth/2)*unit*breadth);
  const dy=(sy)=>onGrid((sy-bitmapHeight)*unit*height);
  function crop(sx,sy,sw,sh,shift=0) {
    g.drawImage(sheet,sx,sy,sw,sh,dx(sx+shift),dy(sy),dx(sx+sw)-dx(sx),dy(sy+sh)-dy(sy));
  }
  g.save();
  g.translate(x,y);
  if(facing<0)g.scale(-1,1);
  if(walking) {
    crop(0,0,bitmapWidth,85);
    crop(0,85,72,17,step*4);
    crop(72,85,bitmapWidth-72,17,-step*4);
  } else {
    crop(0,0,bitmapWidth,bitmapHeight);
  }
  if (blink || pose==='yawn') {
    g.fillStyle='#6b4226';
    if (blink) {
      g.fillStyle='#d99e60';
      g.fillRect(dx(124),dy(29),3.5,3);
      g.fillStyle='#684229';
      g.fillRect(dx(124),dy(34),3,1);
    }
    if (pose==='yawn'&&elapsed>.30&&elapsed<1.24)g.fillRect(dx(142),dy(51),2.1,2);
  }
  g.restore();
}

