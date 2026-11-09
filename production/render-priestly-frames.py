"""Build a registered outfit with the default sheep's two-stage renderer.

Run from anywhere: python production/render-priestly-frames.py --blender /path/to/blender
Requires Pillow, NumPy, Node and Chrome, as used by the shared renderers.
"""
from argparse import ArgumentParser
from hashlib import sha256
import json
import os
from pathlib import Path
import subprocess
from tempfile import TemporaryDirectory

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
WIDTH, HEIGHT = 256, 286
GROUND_ROW = 225
OUTFITS = {
    'priestly': ('priestlyFrames', (336, 530), 638, (121, 742), 592),
    'tunic': ('tunicFrames', (334, 528), 615, (120, 742), 575),
}


def prepare(source_path, staging, standard_neutral, outfit):
    original = Image.open(source_path).convert('RGB')
    if original.size != (864, 1536):
        raise ValueError('This registration expects the supplied 864 × 1536 artwork.')
    pixels = np.asarray(original)
    brightness = pixels.max(axis=2)
    boundary = Image.fromarray(np.where(brightness > 20, 255, 0).astype(np.uint8)).copy()
    ImageDraw.floodfill(boundary, (0, 0), 128)
    silhouette = boundary.point(lambda value: 0 if value == 128 else 255)
    bounds = silhouette.getbbox()
    if not bounds or bounds[0] == 0 or bounds[1] == 0 or bounds[2] == original.width or bounds[3] == original.height:
        raise ValueError('The source silhouette must be isolated from the black canvas.')
    # Preserve source RGB and soften alpha only on the one-pixel outer edge.
    interior = np.asarray(silhouette.filter(ImageFilter.MinFilter(3))) > 0
    edge = np.asarray(silhouette.filter(ImageFilter.MaxFilter(3))) > 0
    alpha = np.where(interior, 255, np.where(edge, np.clip((brightness.astype(float)-7)/27, 0, 1)*255, 0))
    texture = original.convert('RGBA')
    texture.putalpha(Image.fromarray(np.rint(alpha).astype(np.uint8)))
    texture_path = staging / 'texture.png'
    texture.save(texture_path)

    original_alpha = Image.open(standard_neutral).convert('RGBA').getchannel('A')
    left, top, right, bottom = original_alpha.point(lambda value: 255 if value > 127 else 0).getbbox()
    x0, y0, x1, y1 = bounds
    scale = (bottom - top) / (y1 - y0)
    offset_x = (left + right - (x0 + x1) * scale) / 2
    offset_y = bottom - y1 * scale
    # Camera coordinates come from render_sprites.py and remain shared with the default skin.
    placement = [110 + offset_x*1085/WIDTH, offset_y*1210/HEIGHT, scale*1085/WIDTH, scale*1210/HEIGHT]
    _, eye_x, eye_y, ear_x, ear_y = OUTFITS[outfit]
    eyes = [[x, eye_y, 29, 46, bytes(pixels[eye_y, x+34]).hex()] for x in eye_x]
    ears = [[offset_x + x*scale, offset_y + ear_y*scale] for x in ear_x]
    registration = staging / 'registration.json'
    registration.write_text(json.dumps({
        'size': original.size, 'texture': str(texture_path), 'output': str(staging / 'blender'),
        'placement': placement, 'eyes': eyes, 'ears': ears,
    }))
    return registration, texture.crop(texture.getbbox())


def build(blender, source_path, outfit):
    standard = (ROOT / 'dist/lamb-frames-data.js').read_text(encoding='utf-8')
    manifest = json.loads(standard[standard.index('{'):standard.rindex('}')+1])
    neutral_path = ROOT / 'dist' / manifest['pages'][0]['src']
    output = ROOT / 'dist/assets/bitpoly' / outfit
    with TemporaryDirectory(prefix=f'jornada-{outfit}-') as directory:
        staging = Path(directory)
        registration, portrait = prepare(source_path, staging, neutral_path, outfit)
        subprocess.run([blender, '-b', '--factory-startup', '--python-exit-code', '1',
                        '--python', 'production/render_sprites.py'], cwd=ROOT, check=True,
                       env={**os.environ, 'JORNADA_SPRITE_CONFIG': str(registration)})
        base = staging / 'blender'
        neutral = base / 'neutral.webp'
        Image.open(base / '000.png').save(neutral, lossless=True)
        motion = staging / 'motion'
        subprocess.run(['node', 'production/render-motion.cjs', str(neutral), str(motion), str(registration)],
                       cwd=ROOT, check=True)

        output.mkdir(parents=True, exist_ok=True)
        ground = np.asarray(Image.open(base / '000.png').convert('RGBA'))[GROUND_ROW:]
        opaque = ground[:, :, 3] == 255
        examples = []
        for clip, indices in manifest['clips'].items():
            for pose, index in enumerate(indices):
                path = base / f'{index:03}.png'
                if clip in ('breath', 'listenLeft', 'listenRight', 'perk'):
                    path = motion / f'{clip}-{pose:02}.png'
                with Image.open(path) as source:
                    frame = source.convert('RGBA')
                pixels = np.array(frame)
                if frame.size != (WIDTH, HEIGHT) or not np.array_equal(pixels[GROUND_ROW:, :, 3], ground[:, :, 3]):
                    raise ValueError(f'Frame {index} changed the support geometry.')
                if not np.array_equal(pixels[GROUND_ROW:][opaque], ground[opaque]):
                    raise ValueError(f'Frame {index} changed the support pixels.')
                # Canvas round trips premultiply edge RGB. Preserve the exact Blender pixels in the pinned area.
                pixels[GROUND_ROW:] = ground
                frame = Image.fromarray(pixels)
                frame.save(output / f'frame-{index:03}.webp', lossless=True, method=4)
                if index == 0 or pose == len(indices)-1:
                    examples.append((clip if index else 'neutral', frame))

        portrait.save(output / 'portrait.webp', lossless=True, method=4)
        write_manifest(manifest, sha256(source_path.read_bytes()).hexdigest()[:12], outfit)
        sheet = Image.new('RGB', (WIDTH*5, (HEIGHT+22)*2), '#3b302a')
        labels = ImageDraw.Draw(sheet)
        for i, (label, frame) in enumerate(examples):
            x, y = i % 5 * WIDTH, i // 5 * (HEIGHT+22)
            sheet.paste(frame, (x, y), frame)
            labels.text((x+9, y+HEIGHT+4), label, fill='white')
        sheet.save(ROOT / 'qa' / f'{outfit}-contact.png')
        print(f'{len(manifest["frames"])} complete frames; supporting pixels verified.')


def write_manifest(manifest, version, outfit):
    (ROOT / 'dist' / f'{outfit}-frames-data.js').write_text(
        '// Generated by production/render-priestly-frames.py.\n'
        f'const count = {len(manifest["frames"])};\n'
        f'const artVersion = "{version}";\n'
        f'export const {OUTFITS[outfit][0]} = {{\n'
        '  pages: Array.from({length: count}, (_, i) => ({\n'
        f'    src: `assets/bitpoly/{outfit}/frame-${{String(i).padStart(3, "0")}}.webp?v=${{artVersion}}`, width: 256, height: 286\n'
        '  })),\n'
        '  frames: Array.from({length: count}, (_, page) => ({page, x: 0, y: 0})),\n'
        f'  clips: {json.dumps(manifest["clips"], separators=(",", ":"))}\n'
        '};\n', encoding='utf-8', newline='\n')


if __name__ == '__main__':
    parser = ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path, nargs='?')
    parser.add_argument('--outfit', choices=OUTFITS, default='priestly')
    parser.add_argument('--blender', default='blender')
    options = parser.parse_args()
    source = options.source or ROOT / 'reference' / f'{options.outfit}-original.jpg'
    build(options.blender, source, options.outfit)
