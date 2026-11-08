// Hand-drawn frame sequence. Artwork geometry remains fixed at the wick.
export const flameTimeline=Object.freeze([
  [0,90],[4,90],[1,85],[6,90],[1,85],[4,95],[7,90],[5,100],
  [2,105],[3,95],[2,100],[5,90],[7,90],[4,85],[0,90],[7,95]
]);
const cycle=flameTimeline.reduce((sum,[,ms])=>sum+ms,0);
export function sampleLantern(t,reduced=false){
  if(reduced)return {frame:0,dx:0,dy:0,angle:0,sx:1,sy:1,opacity:1,halo:.14};
  let phase=((t%cycle)+cycle)%cycle,index=0;
  for(const [frame,duration] of flameTimeline){index=frame;if(phase<duration)break;phase-=duration;}
  return {frame:index,dx:0,dy:0,angle:0,sx:1,sy:1,opacity:1,halo:.14+Math.sin(t/2300)*.012};
}
export function animateBitpolyLantern(stage){
  const flame=stage.querySelector('[data-lantern-flame]'),halo=stage.querySelector('.bp-lantern-halo');
  const images=flame?[...flame.querySelectorAll('[data-flame-frame]')]:[];
  const media=matchMedia('(prefers-reduced-motion: reduce)');let frame=0,disposed=false,shown=0,epoch;
  const ready=images.map(()=>typeof Image==='undefined');
  // Decode all eight sources in advance. Keep the current frame if the next has
  // not loaded yet, so a slow connection never reveals an empty lantern.
  const loaders=images.map((node,i)=>{
    if(typeof Image==='undefined')return null;
    const loader=new Image();loader.onload=()=>{ready[i]=true;};
    loader.src=node.getAttribute('href');
    if(loader.complete&&loader.naturalWidth>0)ready[i]=true;
    return loader;
  });
  if(flame){flame.removeAttribute('transform');flame.setAttribute('opacity','1');}
  function draw(t){
    if(!flame)return;const p=sampleLantern(t,media.matches);
    if((ready[p.frame]||media.matches)&&shown!==p.frame){
      images.forEach((node,i)=>{node.setAttribute('visibility',i===p.frame?'visible':'hidden');node.setAttribute('opacity',i===p.frame?'1':'0');});shown=p.frame;
    }
    if(halo)halo.style.opacity=p.halo.toFixed(3);
  }
  function tick(t){if(disposed)return;epoch??=t;if(!stage.closest('[inert]'))draw(t-epoch);frame=requestAnimationFrame(tick);}
  function resume(){cancelAnimationFrame(frame);epoch=undefined;draw(0);if(!disposed&&flame&&!media.matches&&!document.hidden)frame=requestAnimationFrame(tick);}
  document.addEventListener('visibilitychange',resume);media.addEventListener('change',resume);resume();
  return {dispose(){disposed=true;cancelAnimationFrame(frame);loaders.forEach(loader=>{if(loader)loader.onload=null;});document.removeEventListener('visibilitychange',resume);media.removeEventListener('change',resume);}};
}
