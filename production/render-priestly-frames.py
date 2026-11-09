"""Render Aaron's full sprites from the supplied transparent PNG.

Run: python production/render-priestly-frames.py path/to/original.png
Requires Pillow and NumPy. All deformation happens here, outside the game.
"""
from pathlib import Path
import json
import math
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'dist/assets/bitpoly/priestly'
WIDTH, HEIGHT, SUPERSAMPLE = 256, 286, 2
GROUND_ROW = 222


def smooth(value):
    t = np.clip(value, 0, 1)
    return t * t * (3 - 2 * t)


def premultiplied(pixels):
    rgba = np.asarray(pixels, dtype=np.float32) / 255
    rgba[..., :3] *= rgba[..., 3:4]
    return rgba


def rgba_image(pixels):
    alpha = pixels[..., 3:4]
    rgb = np.divide(pixels[..., :3], alpha, out=np.zeros_like(pixels[..., :3]), where=alpha > 0)
    rgba = np.concatenate((rgb, alpha), axis=-1)
    return Image.fromarray(np.rint(np.clip(rgba, 0, 1) * 255).astype(np.uint8))


def sample(texture, x, y):
    height, width = texture.shape[:2]
    x = np.clip(x, 0, width - 1)
    y = np.clip(y, 0, height - 1)
    x0, y0 = np.floor(x).astype(int), np.floor(y).astype(int)
    x1, y1 = np.minimum(x0 + 1, width - 1), np.minimum(y0 + 1, height - 1)
    u, v = (x - x0)[..., None], (y - y0)[..., None]
    return ((1 - u) * texture[y0, x0] + u * texture[y0, x1]) * (1 - v) + ((1 - u) * texture[y1, x0] + u * texture[y1, x1]) * v


def prepare_source(path):
    source = Image.open(path).convert('RGBA')
    if source.size != (1254, 1254):
        raise ValueError('This rig is registered to the supplied 1254 × 1254 Aaron artwork.')
    alpha = source.getchannel('A')
    solid = alpha.point(lambda a: 255 if a > 48 else 0)
    ImageDraw.floodfill(solid, (620, 500), 128)
    silhouette = solid.point(lambda a: 255 if a == 128 else 0).filter(ImageFilter.MaxFilter(5))
    source.putalpha(Image.fromarray(np.where(np.asarray(silhouette) > 0, np.asarray(alpha), 0).astype(np.uint8)))
    left, top, right, bottom = source.getbbox()
    scale = 259 / (bottom - top)
    offset_x = 128 - (left + right) * scale / 2
    offset_y = 274 - bottom * scale
    canvas = Image.new('RGBA', (WIDTH * SUPERSAMPLE, HEIGHT * SUPERSAMPLE))
    crop = source.crop((left, top, right, bottom))
    resized = crop.resize((round(crop.width * scale * SUPERSAMPLE), round(crop.height * scale * SUPERSAMPLE)), Image.Resampling.LANCZOS)
    origin = (round((left * scale + offset_x) * SUPERSAMPLE), round((top * scale + offset_y) * SUPERSAMPLE))
    canvas.paste(resized, origin)
    eyes = [(origin[0] / SUPERSAMPLE + (eye - left) * resized.width / crop.width / SUPERSAMPLE,
             origin[1] / SUPERSAMPLE + (497 - top) * resized.height / crop.height / SUPERSAMPLE) for eye in (526, 726)]
    return premultiplied(canvas), eyes


Y, X = np.mgrid[:HEIGHT * SUPERSAMPLE, :WIDTH * SUPERSAMPLE].astype(np.float32) / SUPERSAMPLE


def eyelids(neutral, eyes, closure):
    if not closure:
        return neutral
    texture = neutral.copy()
    for cx, cy in eyes:
        dx, dy = X - cx, Y - cy
        x_weight = 1 - smooth((np.abs(dx) - 5.2) / 2.7)
        y_weight = 1 - smooth((np.abs(dy) - 9.2) / 2.5)
        edge = -11.5 + 24 * closure
        cover = (x_weight * y_weight * smooth((edge - dy) / 2.4))[..., None]
        left = sample(neutral, np.full_like(Y, (cx - 7.8) * SUPERSAMPLE), Y * SUPERSAMPLE)
        right = sample(neutral, np.full_like(Y, (cx + 7.8) * SUPERSAMPLE), Y * SUPERSAMPLE)
        blend = np.clip((dx + 7.8) / 15.6, 0, 1)[..., None]
        face = left * (1 - blend) + right * blend
        texture = texture * (1 - cover) + face * cover
        # The closed lid is painted into the same texture and follows the head.
        arc = 2.2 - 0.095 * dx ** 2
        line = ((1 - smooth((np.abs(dy - arc) - .52) / .55)) *
                (1 - smooth((np.abs(dx) - 3.9) / .95)) * smooth((closure - .77) / .23))[..., None]
        texture = texture * (1 - line) + np.array([.19, .071, .037, 1], dtype=np.float32) * line
    return texture


def render(neutral, eyes, clip, amount):
    dx = np.zeros_like(X)
    dy = np.zeros_like(Y)
    closure = 0
    support = 1 - smooth((Y - 210) / 9)
    head_weight = 1 - smooth((Y - 132) / 41)
    if clip == 'breath':
        # Expand the cloth at its flanks while the breastplate lifts as a unit.
        flank = smooth((np.abs(X - 128) - 32) / 33)
        torso = np.exp(-((Y - 169) / 48) ** 2)
        dx += (X - 128) * .026 * amount * torso * flank
        dy -= 3.1 * amount * (1 - smooth((Y - 200) / 21))
    elif clip in ('left', 'right', 'pet'):
        direction = 1 if clip == 'right' else -1
        angle = math.radians(direction * (2.0 if clip == 'pet' else 2.6) * amount)
        px, py = X - 128, Y - 133
        dx += ((math.cos(angle) - 1) * px - math.sin(angle) * py) * head_weight
        dy += (math.sin(angle) * px + (math.cos(angle) - 1) * py) * head_weight
        if clip == 'pet':
            dy += 2.2 * amount * head_weight
            closure = amount
    elif clip in ('listenLeft', 'listenRight'):
        side = -1 if clip == 'listenLeft' else 1
        ear = np.exp(-((X - (128 + side * 78)) / 25) ** 2 - ((Y - 107) / 17) ** 2)
        dx += side * 1.8 * amount * ear
        dy -= 6.2 * amount * ear
    elif clip == 'perk':
        dy -= 3.8 * amount * head_weight
    elif clip == 'blink':
        closure = amount
    texture = eyelids(neutral, eyes, closure)
    warped = sample(texture, (X - dx * support) * SUPERSAMPLE, (Y - dy * support) * SUPERSAMPLE)
    return rgba_image(warped).resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)


def main(source_path):
    neutral, eyes = prepare_source(source_path)
    text = (ROOT / 'dist/lamb-frames-data.js').read_text(encoding='utf-8')
    manifest = json.loads(text[text.index('{'):text.rindex('}') + 1])
    OUTPUT.mkdir(parents=True, exist_ok=True)
    ground = None
    examples = []
    for clip, indices in manifest['clips'].items():
        for pose, index in enumerate(indices):
            if clip in ('breath', 'listenLeft', 'listenRight', 'perk'):
                progress = pose / (len(indices) - 1)
            else:
                progress = (pose + 1) / len(indices)
            amount = (1 - math.cos(math.pi * progress)) / 2
            frame = render(neutral, eyes, clip, amount)
            pixels = np.asarray(frame)
            if index == 0:
                ground = pixels[GROUND_ROW:].copy()
                examples.append(('neutra', frame))
            assert np.array_equal(np.asarray(frame)[GROUND_ROW:], ground)
            frame.save(OUTPUT / f'frame-{index:03}.webp', lossless=True, method=4)
            if pose == len(indices) - 1:
                examples.append((clip, frame))
    count = len(manifest['frames'])
    (ROOT / 'dist/priestly-frames-data.js').write_text(
        '// Generated by production/render-priestly-frames.py.\n'
        f'const count = {count};\n'
        'export const priestlyFrames = {\n'
        '  pages: Array.from({length: count}, (_, i) => ({\n'
        '    src: `assets/bitpoly/priestly/frame-${String(i).padStart(3, "0")}.webp`, width: 256, height: 286\n'
        '  })),\n'
        '  frames: Array.from({length: count}, (_, page) => ({page, x: 0, y: 0})),\n'
        f'  clips: {json.dumps(manifest["clips"], separators=(",", ":"))}\n'
        '};\n', encoding='utf-8', newline='\n')
    qa = ROOT / 'qa'
    qa.mkdir(exist_ok=True)
    sheet = Image.new('RGB', (WIDTH * 5, (HEIGHT + 23) * 2), '#332923')
    labels = ImageDraw.Draw(sheet)
    for i, (name, frame) in enumerate(examples):
        x, y = (i % 5) * WIDTH, (i // 5) * (HEIGHT + 23)
        sheet.paste(frame, (x, y), frame)
        labels.text((x + 10, y + HEIGHT + 2), name, fill='#ffffff')
    sheet.save(qa / 'priestly-contact.png')
    print(f'{len(manifest["frames"])} full frames. Fixed ground from row {GROUND_ROW}.')


if __name__ == '__main__':
    main(Path(sys.argv[1]))
