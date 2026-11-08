import ast,json,math
from pathlib import Path
import numpy as np
from PIL import Image
from scipy.ndimage import label
root=Path(__file__).resolve().parents[1]
tree=ast.parse((root/'production/render_sprites.py').read_text())
ns={'math':math};exec(compile(ast.Module(body=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name in ['sm','pose']],type_ignores=[]),'<production geometry>','exec'),ns)
pose=ns['pose'];spec=json.loads((root/'qa/frames/frames.json').read_text());lo=10;hi=-10;bad=0;max_islands=0
for f in spec:
 for y in range(50,1160,20):
  for x in range(170,1140,20):
   args=[f.get('breath',0),f.get('angle',0),f.get('dip',0)]
   p=np.array(pose(x,y,*args));dx=(np.array(pose(x+.1,y,*args))-p)/.1;dy=(np.array(pose(x,y+.1,*args))-p)/.1;det=dx[0]*dy[1]-dx[1]*dy[0];lo=min(lo,det);hi=max(hi,det);bad+=int(det<=0)
 im=np.array(Image.open(root/'qa/frames'/f"{f['index']:03}.png"));lab,n=label(im[:,:,3]>128);sizes=np.bincount(lab.ravel())[1:];max_islands=max(max_islands,int(sum(sizes>5)))
report={'minimum_area_ratio':lo,'maximum_area_ratio':hi,'folded_samples':bad,'max_significant_alpha_components':max_islands,'poses':len(spec)}
assert bad==0 and lo>.9 and hi<1.1
assert max_islands==1
(root/'qa/geometry-check.json').write_text(json.dumps(report,indent=2));print(report)
