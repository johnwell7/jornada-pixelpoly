export function createRoomInterface(root,{pet,invite,suggestion}) {
  const hint=root.querySelector('#hint');
  const bubble=root.querySelector('#bubble');
  const inviteButton=root.querySelector('#invite');
  const petButton=root.querySelector('#pet');
  let bubbleUntil=0,invitationId=null;

  petButton.addEventListener('click',()=>pet());
  inviteButton.addEventListener('click',()=>{
    if (invite(invitationId)) {
      hint.hidden=true;
      inviteButton.hidden=true;
    }
  });

  return {
    affection({line,time}) {
      hint.hidden=true;
      if (line) {
        bubble.textContent=line;
        bubble.toggleAttribute('data-visible',true);
        bubbleUntil=time+2.2;
      }
    },
    update({time,x,y,scale,width}) {
      petButton.style.left=x+'px';
      petButton.style.top=y-14*scale+'px';
      if (bubbleUntil) {
        bubble.style.left=Math.max(60,Math.min(width-60,x))+'px';
        bubble.style.top=Math.max(66,y-36*scale)+'px';
        if (time>=bubbleUntil) {
          bubble.toggleAttribute('data-visible',false);
          bubbleUntil=0;
        }
      }
      if (time>11) hint.hidden=true;
      const offer=hint.hidden ? suggestion() : null;
      if (offer?.id!==invitationId || offer===null && !inviteButton.hidden) {
        invitationId=offer?.id??null;
        inviteButton.hidden=!offer;
        if (offer) inviteButton.textContent=offer.label;
      }
    }
  };
}
