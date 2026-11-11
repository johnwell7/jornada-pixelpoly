"""Build and render the Lar's standard lamb. Run with Blender 4.3 in background."""
import math
import os
from pathlib import Path

import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('JORNADA_RENDER_DIR', ROOT / 'qa/frames/volumetric'))
OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

def material(name, color):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = tuple(
        channel / 12.92 if channel <= .04045 else ((channel + .055) / 1.055)**2.4
        for channel in (value / 255 for value in bytes.fromhex(color))
    ) + (1,)
    return mat

wool = [material(f'Wool {i}', c) for i, c in enumerate(['ffba83','ffd39d','f8b794','ffce9d','ffc28d'])]
skin = material('Cocoa fleece-free skin', '884b36')
ear_in = material('Warm inner ear', 'c26650')
hoof = material('Dark hoof', '573329')
pad = material('Hoof pad', 'b9634b')
dark = material('Muzzle and eyelid', '331c17')
iris = material('Iris', '432820')
glint = material('Eye catchlight', 'fff0ce')
blush = material('Cheek', 'f18b65')
tongue = material('Tongue', 'b85b52')

def point(x, y, depth):
    return ((x - 128) / 50, (143 - y) / 50, depth / 50)

def ball(name, x, y, z, rx, ry, rz, mat, tilt=0, power=1):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, location=point(x,y,z))
    obj = bpy.context.object
    obj.name = name
    for v in obj.data.vertices:
        for axis, radius in enumerate((rx,ry,rz)):
            value = v.co[axis]
            v.co[axis] = math.copysign(abs(value)**power, value) * radius / 50
    obj.rotation_euler.z = math.radians(tilt)
    obj.data.materials.append(mat)
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    return obj

def stroke(name, length, radius, mat):
    curve = bpy.data.curves.new(name, 'CURVE')
    curve.dimensions = '3D'
    curve.bevel_depth = radius / 50
    curve.bevel_resolution = 2
    curve.use_fill_caps = True
    curve.splines.new('POLY').points.add(length - 1)
    obj = bpy.data.objects.new(name, curve)
    scene.collection.objects.link(obj)
    curve.materials.append(mat)
    return obj

def set_stroke(obj, coords):
    for node, (x,y,z) in zip(obj.data.splines[0].points, coords):
        node.co = (*point(x,y,z), 1)

ball('Body',128,185,-9,87,80,42,wool[0],power=.82)
body_curls=[]
for i,(x,y,z,rx,ry) in enumerate([
    (64,143,3,25,24),(89,146,11,27,23),(119,148,18,25,24),(151,145,14,29,23),(183,144,5,29,27),
    (53,169,9,26,25),(76,177,17,26,23),(103,176,22,27,23),(132,179,24,28,24),(162,173,20,29,26),(196,168,7,24,24),
    (42,201,4,25,25),(64,201,10,24,27),(92,192,21,25,23),(120,198,26,28,22),(148,195,24,25,23),(177,192,18,26,25),(203,204,7,32,29),
    (44,225,3,23,24),(77,224,9,23,23),(174,224,10,25,24),(209,230,4,24,23)
]):
    obj=ball(f'Body curl {i}',x,y,z,rx,ry,21,wool[i%len(wool)],(-1)**i*18,1.03)
    body_curls.append((obj,obj.location.y,y))
    if 65<x<190:
        obj=ball(f'Body curl tip {i}',x+(-1)**i*9,y-6,z+10,rx*.58,ry*.61,16,wool[i%len(wool)],(-1)**i*24)
        body_curls.append((obj,obj.location.y,y-6))
front_legs=[]
for side in (-1,1):
    x=128+side*19
    leg=ball('Front leg',x,234,20,15,36,14,skin,side*-5,.7)
    tip=ball('Front hoof',x+side*2,257,22,13.5,16,14,hoof,side*-5,.68)
    front_legs.append((side,leg,tip,leg.location.y,tip.location.y))
    x=128+side*73
    ball('Rear hoof',x,246,20,28,28,18,hoof,side*27,.75)
    ball('Large paw pad',x+side*3,251,37,11,11,2,pad)
    for dx,dy,dz in [(-10,-7,38),(0,-13,38),(10,-10,36)]:
        ball('Small paw pad',x+side*dx,246+dy,dz,4.4,5.2,2,pad)
    ball('Ear',128+side*76,91,3,41,21,17,skin,side*15,.85)
    ball('Inner ear',128+side*81,94,16,31,12,5,ear_in,side*17,.91)

ball('Head',130,105,22,53,45,32,skin,power=.78)
for i,(x,y,z,rx,ry) in enumerate([
    (73,61,22,22,24),(87,48,17,25,24),(104,37,17,26,24),(132,33,18,26,23),
    (155,40,18,25,24),(177,53,16,26,22),(188,65,21,17,20),
    (93,62,29,23,22),(120,58,33,29,26),(146,57,29,22,22),(169,65,28,22,21)
]):
    mat=wool[(i+1)%len(wool)]
    ball(f'Crown curl {i}',x,y,z,rx,ry,21,mat,(-1)**i*18)
    if i>=7:
        ball(f'Crown curl tip {i}',x-8,y+3,z+14,rx*.62,ry*.67,15,mat,(-1)**i*20)

def face_depth(x,y):
    # Frontal contour of the same superellipsoid used by the head.
    surface = 1 - abs((x-130)/53)**(2/.78) - abs((y-105)/45)**(2/.78)
    return 22 + 32 * max(0,surface)**(.78/2)

eyes = []
for x in (102,157):
    eye = ball('Eye',x,103,face_depth(x,103),6.6,11,3.1,iris)
    catchlight = ball('Eye glint',x-1.4,99,face_depth(x,103)+3,2.1,2.6,.9,glint)
    lid = stroke('Upper eyelid',13,1.12,dark)
    brow = stroke('Brow',13,1.05,dark)
    eyes.append((x,eye,catchlight,lid,brow))
    cheek = x + (-10 if x<130 else 10)
    ball('Cheek',cheek,118,face_depth(cheek,118),8,4.5,1.7,blush)

nose = ball('Nose',130,114,55,7.1,3.6,3.3,dark)
for v in nose.data.vertices:
    if v.co.y<0:
        v.co.x *= .35 + .65 * (1 + v.co.y * 50 / 3.6)
mouth = [stroke('Mouth corner',13,.83,dark) for _ in range(2)]
philtrum = stroke('Philtrum',2,.81,dark)
cavity = ball('Open mouth',130,127,54,5,5,1.1,dark)
inner = ball('Mouth interior',130,129,55,3.3,1.6,.7,tongue)

def smooth(t):
    t=max(0,min(1,t))
    return t*t*(3-2*t)

def expression(kind,t):
    e = smooth(t/.28)*smooth((1-t)/.26)
    q = {'doze':smooth(t),'sleeping':1,'wake':1-smooth(t)}.get(kind,0)
    return {
        'anger': e if kind=='annoyed' else 0,
        'smile': e if kind in ('content','nuzzle','playful') else 0,
        'sleep': q,
        'open': e if kind=='yawn' else (.24*e*(.5+.5*math.sin(t*math.tau*3)) if kind=='talking' else 0),
        'curious': e if kind=='curious' else 0,
        'settle': e if kind=='settle' else 0,
    }

def pose(kind,t):
    p=expression(kind,t)
    anger,smile,sleep,jaw,curious,settle=(p[k] for k in ('anger','smile','sleep','open','curious','settle'))
    closure=min(1,max(smile, sleep, .9*jaw, .2*anger, .45*settle))
    for obj,base_y,y in body_curls:
        obj.location.y=base_y-(1.9*settle+.9*sleep)*max(0,(220-y)/80)/50
    for side,leg,tip,leg_y,tip_y in front_legs:
        lift=2.3*settle*max(0,side*math.sin(t*math.tau*2))
        leg.location.y=leg_y+lift/100
        tip.location.y=tip_y+lift/50
    for x,eye,glint_obj,lid,brow in eyes:
        sign=1 if x<130 else -1
        cy=103+3*sleep+2*closure-1.4*curious
        depth=face_depth(x,cy)
        h=1-.96*closure
        eye.location=point(x,cy,depth)
        eye.scale.y=h
        eye.rotation_euler.z=-sign*.24*anger
        eye.hide_render=closure>.985
        glint_obj.location=point(x-1.4+1.4*curious,cy-3.8*h,depth+3)
        highlight=max(.002,1-smooth((closure-.58)/.38))
        glint_obj.scale=(highlight,highlight*h**.5,highlight)
        glint_obj.hide_render=closure>.985
        coords=[]
        brow_coords=[]
        for i in range(13):
            u=i/6-1
            px=x+7.7*u
            py=cy-(8*h+3.5*smile)*(1-u*u)+sign*3*u*anger
            coords.append((px,py,face_depth(px,py)+2.3+1.1*(1-u*u)))
            by=cy-15+sign*3.1*u*anger+1.8*u*u
            brow_coords.append((px,by,face_depth(px,by)+.6))
        set_stroke(lid,coords)
        set_stroke(brow,brow_coords)
        brow.hide_render=anger+sleep+curious<.06
    center=122.2+1.7*anger
    set_stroke(philtrum,[(130,116,56),(130,center,face_depth(130,center)+1.4)])
    for sign,corner in zip((-1,1),mouth):
        coords=[]
        for i in range(13):
            u=i/12
            x=130+sign*(8.4+1.4*smile-2*anger)*u
            y=center+(2.5+2*smile)*math.sin(math.pi*u)-(.5+1.4*smile)*u+anger*(8*u*u-2*math.sin(math.pi*u))
            coords.append((x,y,face_depth(x,y)+1.2))
        set_stroke(corner,coords)
        corner.hide_render=jaw>.15
    cavity.hide_render=inner.hide_render=jaw<=.15
    cavity.scale=(.54+.85*jaw,.25+1.45*jaw,1)
    cavity.location=point(130,124+4*jaw,face_depth(130,127)+1.2)
    inner.scale=(.55+.55*jaw,.7+.6*jaw,1)
    inner.hide_render=jaw<.4
    inner.location=point(130,126+7*jaw,face_depth(130,127)+2.2)

bpy.ops.object.camera_add(location=(0,0,20))
scene.camera=bpy.context.object
scene.camera.data.type='ORTHO'
scene.camera.data.ortho_scale=286/50
scene.render.engine='BLENDER_WORKBENCH'
shade=scene.display.shading
shade.light='STUDIO'
shade.studiolight_rotate_z=.4
shade.studio_light='paint.sl'
shade.color_type='MATERIAL'
shade.show_shadows=True
shade.show_cavity=True
shade.cavity_type='BOTH'
shade.cavity_ridge_factor=.70
shade.cavity_valley_factor=.75
shade.curvature_ridge_factor=1.2
shade.curvature_valley_factor=1
shade.show_specular_highlight=False
scene.display.render_aa='8'
scene.view_settings.view_transform='Standard'
scene.render.resolution_x=256
scene.render.resolution_y=286
scene.render.resolution_percentage=100
scene.render.film_transparent=True
scene.render.image_settings.file_format='PNG'
scene.render.image_settings.color_mode='RGBA'

CLIPS={'neutral':(1,2400),'curious':(20,2100),'playful':(16,1800),'annoyed':(18,1650),
       'yawn':(32,3400),'settle':(36,4100),'doze':(42,5200),'sleeping':(1,3800),'wake':(16,1700),
       'talking':(22,1800),'content':(24,2600),'nuzzle':(20,2100)}

def render(name):
    scene.render.filepath=str(OUT / f'{name}.png')
    bpy.ops.render.render(write_still=True)

def save_animated_scene():
    # Keep all facial geometry and timelines editable in the delivered .blend.
    transforms = [obj for _, eye, highlight, _, _ in eyes for obj in (eye, highlight)]
    transforms += [cavity, inner]
    transforms += [obj for obj, _, _ in body_curls]
    transforms += [obj for _, leg, tip, _, _ in front_legs for obj in (leg, tip)]
    strokes = [obj for _, _, _, lid, brow in eyes for obj in (lid, brow)] + [philtrum, *mouth]
    frame = 1
    scene.render.fps = 24
    for clip, (count, duration) in CLIPS.items():
        scene.timeline_markers.new(clip, frame=frame)
        span = round(duration * scene.render.fps / 1000)
        for i in range(count):
            t = i / max(1, count-1)
            pose(clip,t)
            at = frame + round(t * (span-1))
            for obj in transforms:
                for prop in ('location','scale','rotation_euler','hide_render'):
                    obj.keyframe_insert(data_path=prop,frame=at)
            for obj in strokes:
                obj.keyframe_insert(data_path='hide_render',frame=at)
                for node in obj.data.splines[0].points:
                    node.keyframe_insert(data_path='co',frame=at)
        frame += span
    scene.frame_end = frame-1
    for action in bpy.data.actions:
        for curve in action.fcurves:
            for key in curve.keyframe_points:
                key.interpolation = 'CONSTANT' if curve.data_path=='hide_render' else 'LINEAR'
    scene.frame_set(1)
    bpy.ops.wm.save_as_mainfile(filepath=str(ROOT / 'production/lamb-volumetric.blend'),compress=True)

if os.environ.get('JORNADA_BAKE_ONLY'):
    save_animated_scene()
elif os.environ.get('JORNADA_PREVIEW'):
    for clip in ('neutral','annoyed','content','doze','yawn'):
        pose(clip,.67 if clip=='doze' else .5)
        render(clip)
else:
    import json
    for clip,(count,duration) in CLIPS.items():
        for i in range(count):
            pose(clip,i/max(1,count-1))
            render(f'{clip}-{i:03}')
    (OUT/'clips.json').write_text(json.dumps(CLIPS))
    save_animated_scene()
