export function bindRoomControls(canvas,{debug,clock,project,lamb,scale,pet,move}) {
  let stroke;
  const hit=point=>{
    const padding=Math.max(15,22/scale());
    const low=['sleep','lie','stir'].includes(lamb.pose);
    return Math.abs(point.x-lamb.x)<=padding && point.y>=lamb.y-(low?21:34) && point.y<=lamb.y+6;
  };

  canvas.addEventListener('pointerdown',event=>{
    if (!event.isPrimary || event.button!==0) return;
    const point=project(event);
    if (debug) {
      move(point);
    } else if (hit(point)) {
      stroke={id:event.pointerId,x:event.clientX,y:event.clientY,time:clock()};
      canvas.setPointerCapture(event.pointerId);
      pet();
    }
  });
  canvas.addEventListener('pointermove',event=>{
    const time=clock();
    if (stroke?.id!==event.pointerId || time-stroke.time<.28 ||
      Math.hypot(event.clientX-stroke.x,event.clientY-stroke.y)<8 || !hit(project(event))) return;
    stroke={id:event.pointerId,x:event.clientX,y:event.clientY,time};
    pet(true);
  });
  for (const name of ['pointerup','pointercancel','lostpointercapture']) {
    canvas.addEventListener(name,event=>{ if (stroke?.id===event.pointerId) stroke=null; });
  }
}
