"""Pack complete Blender renders without modifying their artwork."""
from PIL import Image
from pathlib import Path
import json,hashlib
import numpy as np
ROOT=Path(__file__).resolve().parents[1];src=ROOT/'qa/frames';out=ROOT/'dist/assets/bitpoly/frames';out.mkdir(exist_ok=True)
frames=[Image.open(p).convert('RGBA') for p in sorted(src.glob('[0-9][0-9][0-9].png'))]
pages=[];records=[]
# Each frame has identical image geometry. No translated/rescaled atlas texture.
for i,im in enumerate(frames):
 name=f'frame-{i:03}.webp';im.save(out/name,lossless=True,method=6)
 records.append(dict(page=i,x=0,y=0))
 pages.append(dict(src=f'assets/bitpoly/frames/{name}',width=im.width,height=im.height))
data=dict(width=256,height=286,pages=pages,frames=records,clips=dict(breath=list(range(32)),blink=list(range(32,37)),left=list(range(37,51)),right=list(range(51,65)),pet=list(range(65,81))))
(ROOT/'dist/lamb-frames-data.js').write_text('export const lambFrames = '+json.dumps(data,separators=(',',':'))+';\n')
# All supporting paw pixels below source y=945 must be identical, not just similar.
a=np.array(frames[0]);ground_row=225
changes=[int(np.count_nonzero(np.array(f)[ground_row:]!=a[ground_row:])) for f in frames]
report=dict(frames=len(frames),resolution=[256,286],ground_test_rows=[ground_row,286],max_changed_ground_channels=max(changes),worst_ground_frame=int(np.argmax(changes)),decoded_bytes=sum(p['width']*p['height']*4 for p in pages),compressed_bytes=sum((out/Path(p['src']).name).stat().st_size for p in pages))
(ROOT/'qa/pixel-check.json').write_text(json.dumps(report,indent=2));print(report)
# Contact sheet for independent examination, no changes to source frames.
ids=[0,8,16,24,31,32,34,36,37,42,46,50,51,56,60,64,65,70,75,80]
contact=Image.new('RGB',(256*5,286*4),'#685548')
for n,i in enumerate(ids):contact.paste(frames[i],(n%5*256,n//5*286),frames[i])
contact.save(ROOT/'qa/contact.png')
