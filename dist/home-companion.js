const lines = {
  first: ['Come sit with me.'],
  returned: ['Good to see you.', 'There’s room on the rug.'],
  study: ['What stayed with you?', 'A good moment to think.'],
  artifact: [name => `You found ${name}!`],
  outfit: ['Ready for a little exploring.', 'A new look, the same rug.'],
  pet: ['That was nice.', 'Right behind the ears.'],
  lantern: ['Such a little light.'],
  quiet: ['This rug is just right.', 'Did a page just turn?'],
  annoyed: ['Hey, easy!', 'Hmph!', 'Again?!'],
  talk: ['I like it here with you.', 'That rug is warmer than it looks.', 'Shall we open a book?', 'The light is lovely today.']
};
const memoryKey = 'jornada-home-dialogue-v1';
const pause = 22000;

export function homeCompanion(world) {
  let memory = {};
  try { memory = JSON.parse(localStorage.getItem(memoryKey)) || {}; } catch {}
  const shown = new Map(Object.entries(memory));
  let pending, active, automatic, hideTimer, idleTimer, animation, lastLine = -Infinity;
  const bubble = () => world.querySelector('#home-dialogue');
  const lamb = () => world.querySelector('.lamb');
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  function close({restoreFocus=false, instant=false}={}) {
    clearTimeout(hideTimer);
    animation?.cancel();
    const box = bubble();
    if (!box || box.hidden) {active=null;return;}
    const moveFocus = restoreFocus && box.contains(document.activeElement);
    active=null;
    lamb()?.setAttribute('aria-expanded', 'false');
    if (moveFocus) lamb()?.focus({preventScroll:true});
    const finish=()=>{box.hidden=true;box.querySelector('[data-home-line]').textContent='';};
    if(instant||reduced()||!box.animate){finish();return;}
    animation=box.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(4px)'}],{duration:160,easing:'ease-in',fill:'forwards'});
    animation.onfinish=finish;
  }

  function speak(kind, name, requested = false) {
    if (world.inert || document.hidden || (active&&kind!=='annoyed') || (!requested && performance.now()-lastLine<pause)) return false;
    if (['sleeping','drowsy'].includes(lamb()?.dataset.bpState) && kind!=='annoyed') return false;
    const options=lines[kind];if(!options)return false;
    const recent=shown.get(kind);
    const index=Number.isInteger(recent)&&recent>=0?(recent+1)%options.length:0;
    const line=typeof options[index]==='function'?options[index](name):options[index];
    const box=bubble();if(!box)return false;
    const choice=box.querySelector('[data-home-choice]');
    clearTimeout(hideTimer);animation?.cancel();
    active={kind};box.hidden=false;
    choice.hidden=kind!=='talk'||index!==2;
    if(choice.hidden)delete choice.dataset.view;else choice.dataset.view='library';
    lamb()?.setAttribute('aria-expanded','true');
    box.querySelector('[data-home-line]').textContent=line;
    if(!reduced()&&box.animate)animation=box.animate([{opacity:0,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:190,easing:'ease-out'});
    shown.set(kind,index);
    try { localStorage.setItem(memoryKey,JSON.stringify(Object.fromEntries(shown))); } catch {}
    lastLine=performance.now();
    hideTimer=setTimeout(()=>close({restoreFocus:true}),choice.hidden?Math.max(2200,1150+line.length*48):6100);
    return true;
  }

  function startIdle() {
    clearTimeout(idleTimer);
    idleTimer=setTimeout(()=>{speak('quiet');startIdle();},65000);
  }
  return {
    note(kind,name){pending={kind,name};},
    enter(){
      clearTimeout(automatic);startIdle();
      const context=pending||{kind:shown.has('first')?'returned':'first'};
      automatic=setTimeout(()=>{
        if(speak(context.kind,context.name)&&pending===context)pending=null;
      },pending?Math.max(850,pause-(performance.now()-lastLine)):850);
    },
    leave(){clearTimeout(automatic);clearTimeout(idleTimer);close({instant:true});},
    react(kind){
      clearTimeout(automatic);startIdle();
      if(kind==='talk'&&pending){if(speak(pending.kind,pending.name,true))pending=null;}
      else speak(kind,null,kind!=='pet');
    },
    lantern(){startIdle();speak('lantern');},
    dismiss(){if(!active)return false;close({restoreFocus:true});startIdle();return true;}
  };
}
