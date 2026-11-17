import { targets } from './navigation.mjs';

const phase = (mode, pose, duration) => ({mode,pose,duration});
export const activities = [
  {
    id:'window', location:{x:212,y:75}, approach:targets.window, interaction:'observe',
    invitation:'Observar a janela?', available:({sleepiness})=>sleepiness<.91,
    weight:({visits})=>visits ? 1.65 : 5.4,
    after:[phase('curious','look',[4,15])]
  },
  {
    id:'plant', location:{x:150,y:157}, approach:targets.plant, interaction:'inspect',
    available:({sleepiness})=>sleepiness<.86, weight:({distance})=>distance<70 ? 2.4 : 1.35,
    after:[phase('curious','look',[2.8,9])]
  },
  {
    id:'rug', location:{x:196,y:245}, approach:targets.rug, interaction:'settle',
    available:({distance,sleepiness})=>distance>17 && sleepiness<.95,
    weight:({sleepiness})=>1.1+sleepiness*.7, after:[phase('calm','sit',[5,18])]
  },
  {
    id:'bed', location:{x:352,y:181}, approach:targets.bed, interaction:'sleep',
    invitation:'Descansar perto da cama?', available:({sleepiness})=>sleepiness>=.46,
    weight:({sleepiness})=>1 + sleepiness**3*9,
    before:[{...phase('drowsy','yawn',[.95,2.5]),face:'east'}],
    after:[phase('settling','sit',[.65,2.2]),phase('lying','lie',[.6,.95]),
      phase('sleeping','sleep',[17,39]),phase('waking','wake',[.75,1.1]),phase('calm','sit',[2,11])]
  },
  {
    id:'pause', interaction:'rest',
    available:()=>true, weight:({sleepiness})=>sleepiness>.9 ? .65 : 2.25,
    after:[phase('calm','sit',[5,21])]
  },
  {
    id:'listen', interaction:'observe',
    available:({sleepiness})=>sleepiness<.93, weight:({sleepiness})=>1.5-sleepiness*.5,
    after:[phase('calm','idle',[3,11]),phase('playful','perk',[.7,2.8])]
  }
];
