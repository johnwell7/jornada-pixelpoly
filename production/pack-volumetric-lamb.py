"""Pack Blender's complete rendered frames into the existing Lar player format."""
import json
import math
import os
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
FRAMES = Path(os.environ.get('JORNADA_RENDER_DIR', ROOT / 'qa/frames/volumetric'))
DIST = ROOT / 'dist'
ASSETS = 'assets/bitpoly/alive-v5'
MARKER = 'export const aliveFrames = '
manifest_path = DIST / 'sheep-alive-data.js'
header, data = manifest_path.read_text().split(MARKER, 1)
manifest = json.loads(data.rstrip(';\n'))

for clip, (count, duration) in json.loads((FRAMES / 'clips.json').read_text()).items():
    columns = min(8, count)
    atlas = Image.new('RGBA', (columns * 256, math.ceil(count / columns) * 286))
    for index in range(count):
        with Image.open(FRAMES / f'{clip}-{index:03}.png') as frame:
            if frame.mode != 'RGBA' or frame.size != (256, 286):
                raise ValueError(f'Unexpected Blender frame format for {clip}:{index}')
            atlas.paste(frame, (index % columns * 256, index // columns * 286))
    src = f'{ASSETS}/base-{clip}.webp'
    atlas.save(DIST / src, lossless=True, method=4)
    manifest['base'][clip] = dict(src=src, width=atlas.width, height=atlas.height,
                                 count=count, columns=columns, duration=duration)

manifest_path.write_text(header + MARKER + json.dumps(manifest, separators=(',', ':')) + ';\n')
