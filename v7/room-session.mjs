import { createBehavior } from './behavior.mjs';
import { createLamb, go, step } from './navigation.mjs';

export function createRoomSession({debug=false,random=Math.random,onActivity}={}) {
  const lamb=createLamb();
  const behavior=createBehavior(lamb,random,{observe:onActivity});
  let time=0;

  return {
    lamb,
    get time(){ return time; },
    get focus(){ return behavior.focus; },
    advance(dt) {
      time+=dt;
      if (debug) step(lamb,dt);
      else behavior.update(dt);
    },
    pet(stroking=false) {
      if (!debug) return {line:behavior.pet(stroking),time};
      return null;
    },
    invite(id) {
      return behavior.invite(id);
    },
    suggestion() {
      return debug ? null : behavior.suggestion();
    },
    moveTo(point) {
      if (debug) go(lamb,point);
    },
    observation() {
      return {
        time,mode:behavior.mode,
        lamb:{x:lamb.x,y:lamb.y,pose:lamb.pose,face:lamb.face}
      };
    }
  };
}
