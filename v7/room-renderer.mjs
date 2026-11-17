import { bakeRoom, drawLights, drawScenery } from './art/room.mjs';
import { createSheet, drawLamb, lambShadow } from './art/lamb.mjs';
import { orderAt } from './navigation.mjs';

export function createRoomRenderer(canvas) {
  const graphics=canvas.getContext('2d',{alpha:false});
  const room=bakeRoom(document.createElement('canvas'));
  const sheet=createSheet(document.createElement('canvas'));

  return {
    resize({width,height,scale,left,top}) {
      canvas.width=width;
      canvas.height=height;
      canvas.style.width=width*scale+'px';
      canvas.style.height=height*scale+'px';
      canvas.style.left=left+'px';
      canvas.style.top=top+'px';
      graphics.imageSmoothingEnabled=false;
    },
    draw(lamb,camera,visibleTime) {
      graphics.save();
      graphics.translate(-Math.round(camera.x),-Math.round(camera.y));
      graphics.drawImage(room,0,0);
      for (const id of orderAt(lamb.y)) {
        if (id==='lamb') {
          lambShadow(graphics,lamb);
          drawLamb(graphics,sheet,lamb);
        } else drawScenery(graphics,id,visibleTime);
      }
      drawLights(graphics,visibleTime);
      graphics.restore();
    }
  };
}
