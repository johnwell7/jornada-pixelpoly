"""Offline 2.5D authoring: one connected textured surface, complete RGBA frames.
Run: blender -b --factory-startup --python v119/production/render_sprites.py
No Blender, mesh, shaders or deformation ship to the browser.
"""
import bpy, math, json, os, re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
config_path=os.getenv('JORNADA_SPRITE_CONFIG')
config=json.loads(Path(config_path).read_text()) if config_path else None
OUT=Path(config['output']) if config else ROOT/'qa/frames'
OUT.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.samples=32;s.cycles.use_denoising=False
s.cycles.use_adaptive_sampling=False;s.cycles.seed=0
s.render.resolution_x=256;s.render.resolution_y=286;s.render.resolution_percentage=100
s.render.film_transparent=True;s.render.image_settings.file_format='PNG';s.render.image_settings.color_mode='RGBA'
s.render.filter_size=.7;s.view_settings.view_transform='Standard';s.view_settings.look='None';s.view_settings.exposure=0;s.view_settings.gamma=1
s.world.color=(0,0,0)
bpy.ops.object.camera_add(location=(652.5,605,2000));cam=bpy.context.object;cam.rotation_euler=(0,0,0);cam.data.type='ORTHO';cam.data.ortho_scale=1210;cam.data.clip_end=5000;s.camera=cam
# Camera looks along local -Z. XY positions map directly onto the uncut artwork.
# A regular connected grid has no detached head, torso or paw objects.
NX,NY=110,122
base=[(110+1085*i/NX,1210*j/NY) for j in range(NY+1) for i in range(NX+1)]
verts=[(x,1210-y,0) for x,y in base];faces=[]
# The default texture uses its original contour. Registered textures supply clean alpha.
if not config:
 art=(ROOT/'reference/bitpoly-art.js').read_text();path=re.search("lambSilhouette='([^']+)'",art).group(1)
 tokens=re.findall(r'[MLHVZ]|-?\d+(?:\.\d+)?',path);poly=[];x=y=0;i=0
 while i<len(tokens):
  op=tokens[i];i+=1
  if op in ('M','L'):x=float(tokens[i]);y=float(tokens[i+1]);i+=2
  elif op=='H':x=float(tokens[i]);i+=1
  elif op=='V':y=float(tokens[i]);i+=1
  elif op=='Z':continue
  poly.append((x,y))
def inside(x,y):
 hit=False
 for (a,b),(c,d) in zip(poly,poly[1:]+poly[:1]):
  if (b>y)!=(d>y) and x<(c-a)*(y-b)/(d-b)+a:hit=not hit
 return hit
for j in range(NY):
 for i in range(NX):
  k=j*(NX+1)+i
  if config or any(inside(*base[v]) for v in (k,k+1,k+NX+1,k+NX+2)):
   faces.append((k,k+1,k+NX+2,k+NX+1))
mesh=bpy.data.meshes.new('ContinuousSurface');mesh.from_pydata(verts,[],faces);mesh.update()
obj=bpy.data.objects.new('LambContinuousSurface',mesh);bpy.context.collection.objects.link(obj)
uv=mesh.uv_layers.new(name='OriginalArtwork')
texture_width,texture_height=config['size'] if config else (1312,1199)
offset_x,offset_y,scale_x,scale_y=config['placement'] if config else (0,0,1,1)
for p in mesh.polygons:
 for li in p.loop_indices:
  x,y=base[mesh.loops[li].vertex_index]
  uv.data[li].uv=((x-offset_x)/scale_x/texture_width,1-(y-offset_y)/scale_y/texture_height)
mat=bpy.data.materials.new('OriginalArtworkWithEyelids');mat.use_nodes=True;obj.data.materials.append(mat)
nodes=mat.node_tree.nodes;nodes.clear();links=mat.node_tree.links
tex=nodes.new('ShaderNodeTexImage')
tex.image=bpy.data.images.load(config['texture'] if config else str(ROOT/'reference/lamb.png'))
tex.interpolation='Linear'
if config:tex.extension='CLIP'
uvnode=nodes.new('ShaderNodeTexCoord');sep=nodes.new('ShaderNodeSeparateXYZ');links.new(uvnode.outputs['UV'],sep.inputs[0])
def put(sock,v):
 if isinstance(v,(int,float)):sock.default_value=v
 else:links.new(v,sock)
def op(kind,a,b=0):
 n=nodes.new('ShaderNodeMath');n.operation=kind;put(n.inputs[0],a);put(n.inputs[1],b);return n.outputs[0]
def smooth(v,lo,hi):
 t=op('MINIMUM',op('MAXIMUM',op('DIVIDE',op('SUBTRACT',v,lo),hi-lo),0),1)
 return op('MULTIPLY',op('MULTIPLY',t,t),op('SUBTRACT',3,op('MULTIPLY',2,t)))
def linear(c):return c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4
def rgb(hex):return tuple(linear(int(hex[k:k+2],16)/255) for k in (0,2,4))+(1,)
def mix(color,other,factor):
 n=nodes.new('ShaderNodeMixRGB');n.blend_type='MIX';put(n.inputs[0],factor);links.new(color,n.inputs[1]);n.inputs[2].default_value=rgb(other);return n.outputs[0]
x=op('MULTIPLY',sep.outputs['X'],texture_width);y=op('MULTIPLY',op('SUBTRACT',1,sep.outputs['Y']),texture_height)
blink=nodes.new('ShaderNodeValue');blink.name='LidClosure';blink.outputs[0].default_value=0
color=tex.outputs['Color']
eyes=config['eyes'] if config else [(548,438,39,64,'8b4128'),(779,438,39,64,'68362c')]
for cx,cy,rx,ry,skin in eyes:
 dx=op('SUBTRACT',x,cx);dy=op('SUBTRACT',y,cy)
 radius=op('ADD',op('DIVIDE',op('MULTIPLY',dx,dx),rx**2),op('DIVIDE',op('MULTIPLY',dy,dy),ry**2))
 ellipse=op('SUBTRACT',1,smooth(radius,.72,1))
 # Eyelid follows the same UV surface as the entire head: cannot detach.
 start,travel,line_y,line_width=(cy-ry,2*ry+4,cy+4,rx*.63) if config else (380,124,444,24)
 edge=op('ADD',start,op('MULTIPLY',blink.outputs[0],travel))
 cover=op('MULTIPLY',ellipse,op('SUBTRACT',1,smooth(op('SUBTRACT',y,edge),-2,2)))
 cover=op('MULTIPLY',cover,smooth(blink.outputs[0],0,.15))
 color=mix(color,skin,cover)
 curve=op('ADD',line_y,op('MULTIPLY',6,op('SUBTRACT',1,op('DIVIDE',op('MULTIPLY',dx,dx),line_width**2))))
 line=op('MULTIPLY',op('SUBTRACT',1,smooth(op('ABSOLUTE',op('SUBTRACT',y,curve)),2,4)),op('SUBTRACT',1,smooth(op('ABSOLUTE',dx),line_width-3,line_width+1)))
 color=mix(color,'321a13',op('MULTIPLY',line,smooth(blink.outputs[0],.78,1)))
em=nodes.new('ShaderNodeEmission');links.new(color,em.inputs[0]);trans=nodes.new('ShaderNodeBsdfTransparent');mixs=nodes.new('ShaderNodeMixShader');links.new(tex.outputs['Alpha'],mixs.inputs[0]);links.new(trans.outputs[0],mixs.inputs[1]);links.new(em.outputs[0],mixs.inputs[2]);out=nodes.new('ShaderNodeOutputMaterial');links.new(mixs.outputs[0],out.inputs[0])
def sm(t):t=max(0,min(1,t));return t*t*(3-2*t)
def pose(x,y,breath=0,angle=0,dip=0):
 # Exactly pinned ground region. Smooth transition includes ALL neck wool.
 support=1-sm((y-600)/330)
 a=math.radians(angle)*(1-sm((y-530)/340))
 xx=656+(x-656)*math.cos(a)-(y-610)*math.sin(a)
 yy=610+(x-656)*math.sin(a)+(y-610)*math.cos(a)
 torso=math.exp(-((y-730)/190)**2)*(1-sm((y-810)/120))
 xx+=(x-656)*.007*breath*torso
 yy+=(-5*breath+dip)*support
 return xx,yy
spec=[]
for i in range(32):spec.append(dict(name=f'breath-{i:02}',breath=(1-math.cos(i/31*math.pi))/2))
for i in range(5):spec.append(dict(name=f'blink-{i:02}',close=(i+1)/5))
for sign,label in [(-1,'left'),(1,'right')]:
 for i in range(14):spec.append(dict(name=f'{label}-{i:02}',angle=sign*2.5*sm((i+1)/14)))
for i in range(16):
 t=sm((i+1)/16);spec.append(dict(name=f'pet-{i:02}',angle=-1.8*t,dip=4*t,close=t))
metrics=[]
for idx,f in enumerate(spec):
 if config and 0<idx<32:continue  # The shared motion pass produces the final breathing sequence.
 for v,(x,y) in zip(mesh.vertices,base):
  xx,yy=pose(x,y,f.get('breath',0),f.get('angle',0),f.get('dip',0));v.co=(xx,1210-yy,0)
 mesh.update();blink.outputs[0].default_value=f.get('close',0)
 assert all(abs(v.co.x-x)<.0001 and abs(v.co.y-(1210-y))<.0001 for v,(x,y) in zip(mesh.vertices,base) if y>=930)
 s.render.filepath=str(OUT/f'{idx:03}.png');bpy.ops.render.render(write_still=True)
 metrics.append(dict(index=idx,**f))
 print('JORNADA_FRAME',idx,flush=True)
 if os.getenv('JORNADA_RENDER_ONE'):break
(OUT/'frames.json').write_text(json.dumps(metrics,indent=2))
if not config:
 tex.image.pack();bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'production/lamb-authoring.blend'))
