import { go, setPose, step } from './navigation.mjs';
import { activities } from './activities.mjs';

const range = (rng,min,max)=>min+rng()*(max-min);
const gap = (a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const indoors = ['calm','curious','playful','waking'];
const restingModes = ['lying','sleeping'];
const positionOf = ({x,y})=>({x,y});

export function createBehavior(lamb, random = Math.random, {catalog = activities, observe} = {}) {
  let mode = 'calm', remaining = range(random,3,6), clock = 0, sinceSpoke = -Infinity;
  let sleepiness = range(random,.12,.26), temperament = range(random,.77,1.18);
  let active = null, phases = [], stop = null, invitation = null, interaction = null;
  let recentlyTouched = [], suggestionFor = null, latestContext = -Infinity;
  const recent = [], visits = new Map();
  setPose(lamb,'sit');

  function enter(next, pose, duration) {
    mode = next;
    remaining = duration;
    setPose(lamb,pose);
    observe?.({type:'phase',time:clock,id:active?.id,mode,duration});
  }

  function advance() {
    const phase = phases.shift();
    if (!phase) {
      if (active) observe?.({type:'finish',time:clock,id:active.id});
      active = null;
      choose();
      return;
    }
    if (!phase.travel) {
      if (phase.face) lamb.face = phase.face;
      enter(phase.mode,phase.pose,range(random,...phase.duration));
      return;
    }

    if (!go(lamb,active.approach,active.id,random)) {
      phases = [];
      enter('calm','sit',range(random,3,7));
      return;
    }
    const route = lamb.path.map(positionOf), from = positionOf(lamb);
    stop = gap(lamb,active.approach)>83 && sleepiness<.86 && random()<.22 ? clock+range(random,1.05,1.68) : null;
    observe?.({type:'travel',time:clock,id:active.id,from,route});
    mode = 'walking';
  }

  function context(activity) {
    return {
      sleepiness,
      distance:activity.approach ? gap(lamb,activity.approach) : 0,
      visits:visits.get(activity.id)??0
    };
  }
  function cadenceWeight(id) {
    const previous = recent.at(-1);
    const lastUse = recent.findLastIndex(entry=>entry.id===id);
    const age = lastUse<0 ? Infinity : clock-recent[lastUse].at;
    const recency = age < 12 ? .13 : age < 32 ? .39 : age < 60 ? .73 : 1;

    let repeatedLinks = 0, repeatedPhrase = false;
    for (let i=1;i<recent.length;i++) {
      if (recent[i-1].id!==previous?.id || recent[i].id!==id) continue;
      repeatedLinks++;
      if (i>1 && recent[i-2].id===recent.at(-2)?.id) repeatedPhrase = true;
    }
    return recency / (1+repeatedLinks*.46) * (repeatedPhrase ? .50 : 1);
  }
  function choose() {
    const choices = catalog.flatMap(activity=>{
      const current = context(activity);
      if (activity.available && !activity.available(current)) return [];
      const bias = activity.interaction==='inspect' || activity.interaction==='observe' ? temperament : 1;
      const boost = invitation?.id===activity.id && clock<=invitation.until ? 5.4 : 0;
      const restNeed = activity.interaction==='sleep' && sleepiness>.86 ? 3 : 1;
      const value = (activity.weight(current)*bias*cadenceWeight(activity.id)+boost)*restNeed;
      return [[activity,value]];
    });
    invitation = null;
    let roll = random()*choices.reduce((sum,[,weight])=>sum+weight,0);
    active = choices.find(([,weight])=>(roll-=weight)<0)?.[0] ?? choices.at(-1)?.[0];
    if (!active) {
      enter('calm','sit',range(random,5,10));
      return;
    }
    recent.push({id:active.id,at:clock});
    if (recent.length>10) recent.shift();
    visits.set(active.id,(visits.get(active.id)??0)+1);
    observe?.({type:'start',time:clock,id:active.id});
    phases = [...(active.before??[]),...(active.approach ? [{travel:true}] : []),...active.after];
    advance();
  }

  function update(dt) {
    clock+=dt;
    if (interaction) {
      interaction.remaining-=dt;
      lamb.elapsed+=dt;
      if (interaction.remaining<=0) {
        Object.assign(lamb,interaction.resume);
        interaction=null;
      }
      return;
    }
    const fatigue = mode==='sleeping' ? -.040 : mode==='walking' ? .028 : mode==='calm' ? .008 : .015;
    sleepiness=Math.max(0,Math.min(1,sleepiness+dt*fatigue*temperament));

    if (mode==='pauseWalk') {
      lamb.elapsed+=dt;
      remaining-=dt;
      if (remaining<=0) mode='walking';
      return;
    }
    const arrived=step(lamb,dt);
    if (mode==='walking') {
      if (arrived) {
        observe?.({type:'arrive',time:clock,id:arrived,at:positionOf(lamb)});
        stop=null;
        advance();
      } else if (stop!==null && clock>=stop && gap(lamb,active.approach)>28) {
        stop=null;
        lamb.speed=0;
        enter('pauseWalk','look',range(random,.6,2.0));
      }
      return;
    }
    remaining-=dt;
    if (remaining<=0) advance();
  }

  function pet(stroking = false) {
    recentlyTouched=recentlyTouched.filter(at=>clock-at<1.4);
    if (!stroking) recentlyTouched.push(clock);
    const bothered=recentlyTouched.length>=4;
    if (!interaction) {
      interaction={resume:{pose:lamb.pose,face:lamb.face,elapsed:lamb.elapsed},remaining:0};
      lamb.speed=0;
      observe?.({type:'pet',time:clock,id:active?.id,mode});
    }
    const resting=restingModes.includes(mode);
    if (!resting) lamb.face='south';
    setPose(lamb,resting ? 'stir' : bothered ? 'ruffled' : 'pet');
    interaction.remaining=bothered ? .8 : 1.05;
    if (stroking || clock-sinceSpoke<18 || !bothered && random()>.22) return '';
    sinceSpoke=clock;
    return bothered && !resting ? 'Ei… devagarinho.' : 'Mmé.';
  }

  function suggestion() {
    if (interaction || invitation || !indoors.includes(mode)) return null;
    if (clock-latestContext>.4) {
      latestContext=clock;
      const available=catalog.filter(activity=>activity.invitation && active?.id!==activity.id &&
        context(activity).distance<129 && activity.available(context(activity)));
      const choice=available.find(activity=>activity.interaction==='sleep')??available[0];
      suggestionFor=choice ? {id:choice.id,label:choice.invitation} : null;
    }
    return suggestionFor;
  }

  function invite(id) {
    if (!id || suggestion()?.id!==id) return false;
    invitation={id,until:clock+25};
    remaining=Math.min(remaining,range(random,1.8,3.6));
    return true;
  }

  return {update,pet,suggestion,invite,
    get mode(){return interaction ? 'interacting' : mode;},
    get focus(){return !interaction && (mode==='curious' || restingModes.includes(mode)) ? active?.location : null;}
  };
}
