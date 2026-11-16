import { go, setPose, step, targets } from './navigation.mjs';

const seconds = { window: [5, 10], plant: [3, 6], rug: [4, 9], bed: [13, 25] };
const range = (rng, min, max) => min + rng() * (max-min);
const gap = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
const destinationName = { window: 'Observar a janela?', bed: 'Descansar perto da cama?' };

export function createBehavior(lamb, random = Math.random) {
  let mode = 'calm', remaining = range(random, 3, 6);
  let sleepiness = range(random, .12, .26), destination = null, last = 'rug';
  let invitation = null, interaction = null, recentlyTouched = [];
  let clock = 0, sinceSpoke = -Infinity;
  const visits = { window: 0, plant: 0, rug: 0, bed: 0 };
  setPose(lamb, 'sit');

  function enter(next, pose, time) {
    mode = next;
    remaining = time;
    setPose(lamb, pose);
  }

  function travel(id) {
    destination = id;
    if (go(lamb, targets[id], id)) mode = 'walking';
    else {
      destination = null;
      enter('calm', 'idle', range(random, 2, 4));
    }
  }

  function choose() {
    const weights = {
      window: visits.window ? 2.1 : 8,
      plant: visits.window ? 1.25 : .32,
      rug: gap(lamb,targets.rug) < 22 ? .18 : .9,
      bed: sleepiness >= .56 ? 1 + sleepiness ** 2 * 8 : .02
    };
    if (last) weights[last] *= .10;
    if (sleepiness > .82) weights.bed *= 2.6;
    if (invitation && clock <= invitation.until) weights[invitation.id] += 6;
    const entries = Object.entries(weights);
    let pick = random() * entries.reduce((sum,[,value]) => sum+value,0);
    const selected = entries.find(([,value]) => (pick -= value) < 0)?.[0] ?? 'window';
    invitation = null;
    if (selected === 'bed') {
      destination = 'bed';
      lamb.face = 'east';
      enter('drowsy','yawn',range(random,1.2,1.8));
    } else if (selected === 'rug' && gap(lamb,targets.rug) < 12) {
      enter('playful','perk',range(random,1.1,2.3));
    } else {
      travel(selected);
    }
  }

  function update(dt) {
    clock += dt;
    if (interaction) {
      interaction.remaining -= dt;
      lamb.elapsed += dt;
      if (interaction.remaining <= 0) {
        const { pose, face, elapsed } = interaction.resume;
        Object.assign(lamb,{pose,face,elapsed});
        interaction = null;
      }
      return;
    }
    sleepiness = Math.max(0, Math.min(1, sleepiness + dt * (mode === 'sleeping' ? -.05 : .031)));
    const arrived = step(lamb,dt);
    if (arrived && mode === 'walking') {
      last = arrived;
      visits[arrived]++;
      if (arrived === 'bed') enter('settling','sit',range(random,1.0,1.65));
      else if (arrived === 'rug') enter('calm','sit',range(random,...seconds.rug));
      else enter('curious','look',range(random,...seconds[arrived]));
      return;
    }
    if (mode === 'walking') return;
    remaining -= dt;
    if (remaining > 0) return;
    switch (mode) {
      case 'drowsy':
        travel(destination);
        break;
      case 'settling':
        enter('lying','lie',.65);
        break;
      case 'lying':
        enter('sleeping','sleep',range(random,...seconds.bed));
        break;
      case 'sleeping':
        enter('waking','wake',.9);
        break;
      case 'waking':
        enter('calm','sit',range(random,3,6));
        break;
      default:
        choose();
    }
  }

  function pet(stroking = false) {
    recentlyTouched = recentlyTouched.filter(time => clock-time < 1.4);
    if (!stroking) recentlyTouched.push(clock);
    const bothered = recentlyTouched.length >= 4;
    if (!interaction) {
      interaction = { resume: { pose:lamb.pose, face:lamb.face, elapsed:lamb.elapsed }, remaining:0 };
      lamb.speed = 0;
    }
    const resting = ['lying','sleeping'].includes(mode);
    const pose = resting ? 'stir' : bothered ? 'ruffled' : 'pet';
    if (!resting) lamb.face = 'south';
    setPose(lamb,pose);
    interaction.remaining = bothered ? .8 : 1.05;
    if (stroking || clock-sinceSpoke < 18 || !bothered && random() > .22) return '';
    sinceSpoke = clock;
    return bothered && !resting ? 'Ei… devagarinho.' : 'Mmé.';
  }

  function suggestion() {
    if (interaction || invitation || !['calm','curious','playful','waking'].includes(mode)) return null;
    const id = sleepiness >= .56 ? 'bed' : 'window';
    if (id === last || gap(lamb,targets[id]) > 129) return null;
    return { id, label: destinationName[id] };
  }

  function invite(id) {
    if (suggestion()?.id !== id) return false;
    invitation = { id, until: clock+20 };
    remaining = Math.min(remaining,range(random,1.8,3.6));
    return true;
  }

  return { update, pet, suggestion, invite, get mode(){return interaction ? 'interacting' : mode;} };
}
