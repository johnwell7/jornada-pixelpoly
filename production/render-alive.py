"""V5.1 offline full-frame authoring, separately registered for each outfit.

The stationary artwork is the identity source, never an old animation clip.
New facial drawings, eye direction, jaw poses and connected support-aware body
fields are rendered together into RGBA frames. No body cutouts or clothes overlays
ship to the browser. Run with Python, Pillow, NumPy and opencv-python-headless.
"""
from pathlib import Path
from argparse import ArgumentParser
import json, math, hashlib
import cv2
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'dist/assets/bitpoly/alive-v5'
QA = ROOT / 'qa/frames/alive-v5'
PROFILES = {
 'base': dict(source='motion/breath-00.png', eyes=[(102,102),(157,102)], mouth=(130,127), nose=(130,116), ears=[(37,94),(218,93)], paws=[(105,247),(148,247)], crown=126),
 'priestly': dict(source='priestly/frame-000.webp', eyes=[(103,108),(157,108)], mouth=(130,132), nose=(130,121), ears=[(37,105),(217,105)], paws=[(107,247),(150,247)], crown=129),
 'tunic': dict(source='tunic/frame-000.webp', eyes=[(104,98),(154,98)], mouth=(130,122), nose=(130,112), ears=[(42,91),(214,91)], paws=[(111,247),(151,247)], crown=129),
 'david': dict(source='david/frame-000.webp', eyes=[(104,104),(148,104)], mouth=(127,128), nose=(127,117), ears=[(45,101),(215,100)], paws=[(107,248),(149,248)], crown=127),
}
# Complete one-way timelines, not an old forward/reverse clip under a new name.
CLIPS = dict(neutral=(24,2.4), curious=(28,2.1), playful=(24,1.8), annoyed=(26,1.65),
 yawn=(48,3.4), settle=(56,4.1), doze=(72,5.2), sleeping=(40,3.8), wake=(24,1.7),
 talking=(24,1.8), content=(34,2.6), nuzzle=(30,2.1))

def smooth(t):
 t=np.clip(t,0,1);return t*t*(3-2*t)

def envelope(t):return float(smooth(t/.23)*smooth((1-t)/.23))

def pose(kind,t):
 e=envelope(t)
 p=dict(angle=0,dip=0,close=0,open=0,look=0,ear=0,paw=0,press=0,grimace=0,puff=0,smile=0)
 if kind=='neutral':p.update(dip=-.6*math.sin(t*math.pi)**2,press=.45*math.sin(t*math.pi)**2)
 if kind=='curious':p.update(angle=3.8*e,look=-.5*e,ear=3*e)
 if kind=='playful':p.update(angle=-3*e,grimace=e,close=.15*e,ear=-2*e)
 if kind=='annoyed':p.update(angle=2.7*e+1.4*math.sin(t*math.pi*6)*e,close=.45*e,grimace=-e,ear=-4*e,press=1.5*e)
 if kind=='yawn':
  opening=float(smooth((t-.15)/.28)*smooth((.88-t)/.22))
  p.update(angle=-1.5*e,dip=-4*opening,close=.95*opening,open=opening,ear=-2*opening)
 if kind=='settle':p.update(dip=12*e,close=.18*e,look=e,paw=e*math.sin(t*math.pi*6),press=2.5*e,angle=-2*e)
 if kind=='doze':
  q=float(smooth(t));p.update(angle=1.5*q+math.sin(t*math.pi*5)*(3+5*t)*(1-.75*float(smooth((t-.75)/.25))),dip=5*q,close=q,ear=-2*q,press=2*q)
 if kind=='sleeping':p.update(angle=1.5,dip=5+.6*math.sin(t*math.pi*2),close=1,ear=-2,press=2,puff=max(0,math.sin(t*math.pi*2))**1.5)
 if kind=='wake':
  q=1-float(smooth(t));p.update(angle=1.5*q,dip=5*q,close=q,ear=-2*q,press=2*q)
 if kind=='talking':p.update(angle=1.2*e,dip=-e,open=.12*e*(.5+.5*math.sin(t*math.pi*8)),ear=e)
 if kind=='content':p.update(angle=-2.5*e,dip=2*e,close=.9*e,ear=2*e)
 if kind=='nuzzle':p.update(angle=4.5*e,dip=3*e+math.sin(t*math.pi*4)*e,close=.48*e,ear=-2.4*e,press=e,smile=e)
 return p

def clean_regions(src,profile):
 mask=np.zeros(src.shape[:2],np.uint8)
 cx,cy=profile['mouth'];cv2.ellipse(mask,(cx,cy),(15,7),0,0,360,255,-1)
 clean=cv2.inpaint(src[:,:,:3],mask,4,cv2.INPAINT_TELEA)
 mouth=np.dstack([clean,src[:,:,3]])
 eye_mask=np.zeros_like(mask)
 for x,y in profile['eyes']:cv2.ellipse(eye_mask,(x,y),(8,13),0,0,360,255,-1)
 rgb=cv2.inpaint(mouth[:,:,:3],eye_mask,5,cv2.INPAINT_TELEA)
 return mouth,np.dstack([rgb,src[:,:,3]])

def face(src,clean,eyeless,p,profile):
 # The neutral mouth is redrawn for each registration. Cheeks and nose stay painted.
 im=Image.fromarray(clean).resize((768,858),Image.Resampling.NEAREST)
 d=ImageDraw.Draw(im);scale=3
 def line(points,fill='#391c17',width=1.1):d.line([(int(x*3),int(y*3)) for x,y in points],fill=fill,width=round(width*3),joint='curve')
 def oval(box,fill,outline=None,width=1):d.ellipse(tuple(round(v*3) for v in box),fill=fill,outline=outline,width=round(width*3))
 cx,cy=profile['mouth'];g=p['grimace']
 if p['open']>.025:
  rx=2.2+6.2*p['open'];ry=1.5+9*p['open'];oval((cx-rx,cy-ry*.45,cx+rx,cy+ry),'#32181c','#5e2e27')
  if p['open']>.25:oval((cx-rx*.62,cy+ry*.4,cx+rx*.62,cy+ry*.85),'#bb665b')
 else:
  # relaxed mouth, a small sideways smirk or short pout; never a fixed smile
  line([(cx-5,cy+g*1.3-p['smile']*2),(cx,cy+.6),(cx+5,cy-g*2.3-p['smile']*2)])
  if g>.2:oval((cx+1,cy-.4,cx+1+g*5,cy+g*4),'#b96155','#592922',.6)
 if p['close']>.03 or abs(p['look'])>.05 or abs(g)>.05:
  a=np.array(im.resize((256,286),Image.Resampling.LANCZOS));mask=np.zeros(a.shape[:2],np.uint8)
  for x,y in profile['eyes']:cv2.ellipse(mask,(x,y),(8,13),0,0,360,255,-1)
  a[mask>0]=eyeless[mask>0];im=Image.fromarray(a).resize((768,858),Image.Resampling.NEAREST);d=ImageDraw.Draw(im)
  for j,(x,y) in enumerate(profile['eyes']):
   opening=max(.03,1-p['close']-(.87*max(0,g) if j==0 else 0));h=9*opening
   if opening>.16:
    oval((x-5,y-h,x+5,y+h),'#321b15','#733d2b',.7)
    if h>2+p['look']*3:oval((x-3,y+2+p['look']*3,x+3,y+h),'#4d251c')
    if opening>.45:oval((x-2,y-h+2+p['look']*2,x+1,y-h+6+p['look']*2),'#fff0c8')
   else:line([(x-5,y+2),(x,y+3),(x+5,y+2)],width=1.3)
   if g<-.05:
    sign=1 if j==0 else -1
    line([(x-6,y-9-sign*2*abs(g)),(x+6,y-9+sign*2*abs(g))],width=1.4)
 if p['puff']>.02:
  nx,ny=profile['nose'];r=1+6*p['puff']
  oval((nx+2,ny-r*1.6,nx+2+r*1.6,ny),'#d6c59988','#f6deaccc',.8)
 rgba=np.array(im.resize((256,286),Image.Resampling.LANCZOS))
 # Keep every pixel outside the authored face patch, including all cloth and edges.
 x0=min(x for x,y in profile['eyes'])-11;x1=max(x for x,y in profile['eyes'])+12
 y0=min(y for x,y in profile['eyes'])-16;y1=cy+16
 result=src.copy();result[y0:y1,x0:x1]=rgba[y0:y1,x0:x1];return result

Y,X=np.mgrid[0:286,0:256].astype(np.float32)

def deform(src,p,profile):
 # Connected head/neck and torso fields: no detached layers; rear support stays fixed.
 support=1-smooth((Y-175)/48)
 head=1-smooth((Y-135)/65)
 angle=p['angle']*math.pi/180*head
 cx=profile['crown']
 sx=cx+(X-cx)*np.cos(angle)+(Y-150)*np.sin(angle)
 sy=150-(X-cx)*np.sin(angle)+(Y-150)*np.cos(angle)-p['dip']*head-p['press']*support
 for j,(ex,ey) in enumerate(profile['ears']):
  w=np.exp(-((X-ex)/24)**2-((Y-ey)/15)**2)*support
  sy+=p['ear']*w*(1 if j==0 else -.6)
 # Front hoof and the attached lower leg move together; hem edges are softly weighted.
 for j,(px,py) in enumerate(profile['paws']):
  w=np.exp(-((X-px)/14)**4-((Y-py)/29)**4)
  lift=max(0,p['paw']*(1 if j==0 else -1))*10
  sy+=lift*w;sx+=(1 if j==0 else -1)*lift*.15*w
 frame=cv2.remap(src,sx.astype(np.float32),sy.astype(np.float32),cv2.INTER_LINEAR,borderMode=cv2.BORDER_CONSTANT)
 # All motions keep rear soles, body support and scene shadow in place.
 rear=((X<88)|(X>174))&(Y>=255)
 frame[rear]=src[rear]
 return Image.fromarray(frame)

def main():
 args=ArgumentParser();args.add_argument('--clip',choices=CLIPS);clip=args.parse_args().clip
 OUT.mkdir(parents=True,exist_ok=True);QA.mkdir(parents=True,exist_ok=True)
 path=ROOT/'dist/sheep-alive-data.js'
 manifests=json.loads(path.read_text().split('export const aliveFrames = ',1)[1].rstrip(';\n')) if clip else {}
 selected={clip:CLIPS[clip]} if clip else CLIPS
 report={};contact=Image.new('RGBA',(256*len(selected),286*4),'#38271f')
 for row,(skin,profile) in enumerate(PROFILES.items()):
  src=np.array(Image.open(ROOT/'dist/assets/bitpoly'/profile['source']).convert('RGBA'))
  clean,eyeless=clean_regions(src,profile);clips=manifests.get(skin,{});hashes=[]
  for col,(kind,(count,seconds)) in enumerate(selected.items()):
   columns=8;sheet=Image.new('RGBA',(columns*256,math.ceil(count/columns)*286))
   frames=[]
   for i in range(count):
    t=i/(count-1);p=pose(kind,t)
    image=deform(face(src,clean,eyeless,p,profile),p,profile)
    sheet.alpha_composite(image,((i%columns)*256,(i//columns)*286));frames.append(image)
   name=f'{skin}-{kind}.webp';sheet.save(OUT/name,quality=91,method=4,alpha_quality=100)
   digest=hashlib.sha256((OUT/name).read_bytes()).hexdigest();hashes.append(digest)
   clips[kind]=dict(src='assets/bitpoly/alive-v5/'+name,width=sheet.width,height=sheet.height,count=count,columns=columns,duration=round(seconds*1000))
   peak={'yawn':.48,'annoyed':.5,'playful':.5,'settle':.42,'doze':.5,'sleeping':.25}.get(kind,.5)
   contact.alpha_composite(frames[round(peak*(count-1))],(col*256,row*286))
   if kind in ['yawn','settle','doze','annoyed']:
    frames[0].save(QA/f'{skin}-{kind}.png',save_all=True,append_images=frames[1:],duration=round(seconds*1000/count),loop=0,disposal=2)
  manifests[skin]=clips;report[skin]=dict(frames=sum(x[0] for x in selected.values()),uniqueClipHashes=hashes)
  print('rendered',skin,flush=True)
 path.write_text('// Generated by production/render-alive.py. Full RGBA poses, registered per skin.\nexport const aliveFrames = '+json.dumps(manifests,separators=(',',':'))+';\n')
 contact.convert('RGB').save(QA/'all-new-poses.jpg',quality=95)
 (QA/'render-report.json').write_text(json.dumps(report,indent=2))

if __name__=='__main__':main()
