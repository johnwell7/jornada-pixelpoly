const fs=require('node:fs'),{spawn}=require('node:child_process');
const path=require('node:path');
const [neutral='dist/assets/bitpoly/frames/frame-000.webp', output='dist/assets/bitpoly/motion', registration]=process.argv.slice(2);
const dir=path.resolve(output);fs.mkdirSync(dir,{recursive:true});
const ears=registration?JSON.parse(fs.readFileSync(registration,'utf8')).ears:[[31,91],[222,91]];
const browser=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--no-sandbox','--disable-gpu','--remote-debugging-port=9337','--user-data-dir='+path.join(process.cwd(),'render-profile'),'about:blank'],{windowsHide:true,stdio:'ignore'});
async function main(){
 let tabs;for(let n=0;n<50;n++){try{tabs=await(await fetch('http://127.0.0.1:9337/json')).json();break;}catch{await new Promise(r=>setTimeout(r,100));}}
 const ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);let serial=0;const pending=new Map();ws.onmessage=e=>{let d=JSON.parse(e.data);if(d.id){pending.get(d.id)(d);pending.delete(d.id);}};
 const call=(method,params)=>new Promise(resolve=>{const id=++serial;pending.set(id,resolve);ws.send(JSON.stringify({id,method,params}));});
 const source='data:image/webp;base64,'+fs.readFileSync(neutral).toString('base64');
 const expression=`(async()=>{
 const image=new Image();image.src=${JSON.stringify(source)};await image.decode();
 const c=document.createElement('canvas');c.width=256;c.height=286;const ctx=c.getContext('2d');ctx.drawImage(image,0,0);const src=ctx.getImageData(0,0,256,286).data;
 const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
 const out=[];let changedGround=0,maxGroundDelta=0;
 for(const [kind,count] of [['breath',32],['listenLeft',12],['listenRight',12],['perk',12]])for(let n=0;n<count;n++){
  const a=(1-Math.cos(n/(count-1)*Math.PI))/2, frame=ctx.createImageData(256,286);
  for(let y=0;y<286;y++)for(let x=0;x<256;x++){
   const support=1-smooth((y-177)/43);let dx=0,dy=0;
   if(kind==='breath'){
    const torso=Math.exp(-(((y-175)/48)**2))*support;
    dx=(x-128)*.022*a*torso;dy=-3.4*a*support;
   }else if(kind==='perk'){dy=-2.8*a*(1-smooth((y-135)/80));}
   else{
    const left=kind==='listenLeft',[cx,cy]=${JSON.stringify(ears)}[left?0:1];
    const weight=Math.exp(-(((x-cx)/30)**2)-((y-cy)/19)**2)*support;
    dx=(left?-1:1)*1.4*a*weight;dy=-5*a*weight;
   }
   const sx=x-dx,sy=y-dy,x0=Math.floor(sx),y0=Math.floor(sy),fx=sx-x0,fy=sy-y0;
   let alpha=0,colors=[0,0,0];
   for(let j=0;j<2;j++)for(let i=0;i<2;i++){
    const xx=x0+i,yy=y0+j;if(xx<0||xx>=256||yy<0||yy>=286)continue;
    const k=(yy*256+xx)*4,w=(i?fx:1-fx)*(j?fy:1-fy),aw=src[k+3]*w;alpha+=aw;for(let q=0;q<3;q++)colors[q]+=src[k+q]*aw;
   }
   const k=(y*256+x)*4;for(let q=0;q<3;q++)frame.data[k+q]=alpha?colors[q]/alpha:0;frame.data[k+3]=alpha;
  }
  for(let k=220*256*4;k<src.length;k++)if((k%4===3||src[k-k%4+3]>0)&&frame.data[k]!==src[k]){changedGround++;maxGroundDelta=Math.max(maxGroundDelta,Math.abs(frame.data[k]-src[k]));}
  ctx.putImageData(frame,0,0);out.push({kind,n,data:c.toDataURL('image/png').split(',')[1]});
 }
 const sheet=document.createElement('canvas');sheet.width=1024;sheet.height=572;const sc=sheet.getContext('2d');sc.fillStyle='#342a25';sc.fillRect(0,0,1024,572);
 let column=0;for(const kind of ['breath','listenLeft','listenRight','perk']){sc.drawImage(image,column*256,0);const peak=new Image();peak.src='data:image/png;base64,'+out.filter(f=>f.kind===kind).at(-1).data;await peak.decode();sc.drawImage(peak,column*256,286);column++;}
 return {frames:out,qa:{frames:out.length,changed_ground_channels:changedGround,max_ground_delta:maxGroundDelta},sheet:sheet.toDataURL('image/png').split(',')[1]};
 })()`;
 const response=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});
 if(response.result.exceptionDetails)throw Error(JSON.stringify(response.result.exceptionDetails));
 const result=response.result.result.value,frames=result.frames;for(const f of frames)fs.writeFileSync(path.join(dir,f.kind+'-'+String(f.n).padStart(2,'0')+'.png'),Buffer.from(f.data,'base64'));
 const qa=registration?dir:'qa';
 fs.mkdirSync(qa,{recursive:true});fs.writeFileSync(path.join(qa,'motion-ground.json'),JSON.stringify(result.qa,null,2));fs.writeFileSync(path.join(qa,'motion-contact.png'),Buffer.from(result.sheet,'base64'));console.log(result.qa);
 console.log('Generated',frames.length,'complete frames');ws.close();browser.kill();
}
main().catch(e=>{console.error(e);browser.kill();process.exitCode=1;});



