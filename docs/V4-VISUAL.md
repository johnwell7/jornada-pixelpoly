# V4 — Visual harmonization (ceiling repair pending)

Baseline: `ffc64d38a8219c1bfdb1b50b193935a49ca87b13`.
Restore branch: `restore/pre-v4-visual-ffc64d3`.

## Audit and choice

The room is an opaque 941×1671 PNG. The lamb uses complete 256×286 frames; the three plant textures are 1086×1448, and the lantern and eight flame frames are 1254×1254. Plant articulation uses SVG clipping in original coordinates. The room, plants and lantern had different tonal grades, including sepia on plants and a soft-light tint above the room. The home had no active global blur.

Compared at 390×844 CSS pixels, DPR 3:

- A: original plant/lantern resolution, aligned mild tonal grades, native pixel rendering on the lamb.
- B (selected): the same changes, plus individual plant/lantern texture derivatives matched approximately to the projected density of the lamb. Pixel rendering applies only to those independent images, not the entire scene.

B makes foliage and lantern edges closer to the room's existing block texture. This is a restrained refinement, not a reconstruction of the stronger 16-bit reference. The lamb still has the authored softness and detail limits of its existing frames.

## Changes

`dist/bitpoly-art.js` references four new lossless WebP derivatives in `assets/bitpoly/visual-v4/`. SVG dimensions, clipping paths and joint pivots stay unchanged. Original assets remain available.

| Texture | Derivative width |
| --- | ---: |
| Floor plant | 192 |
| Shelf plant | 224 |
| Window vine | 320 |
| Lantern body | 176 |

Each was resized individually from the original with Sharp Lanczos3, preserving aspect ratio and alpha, then encoded losslessly. No image-wide downsampling, sharpening, blur, palette quantization or generated replacement room was shipped.

`dist/style.css`: disable global soft-light tint; room saturation .90 / contrast .97 / brightness 1.02; plants .90 / .97 / .98 (remove separate sepia and dark shelf grade); lantern body .88 / .97 / .96; home lamb saturation .94 / contrast .99. Flame treatment unchanged. Pixel sampling is scoped to home lamb frames, plant SVG images and lantern body.

All lamb frame assets/controllers, room PNG, flame frames, independent floor contact shadow, dimensions and positions remain unchanged. Contact shadow remains in room coordinates beneath the paws. No functional or persistence modules changed.

## Ceiling: NOT corrected

A localized generated ceiling candidate added an upper-left crosspiece, but its alignment did not reliably continue the existing diagonal joist axis. It was rejected. No patch or regenerated background was integrated. The requested missing-beam correction remains unresolved; this release does not claim V4 acceptance is complete. A faithful localized paint edit is still needed before changing the original roof.

## Validation

- All 38 existing tests and JavaScript syntax checks passed.
- Chromium mobile emulation, DPR 3: 320×568, 390×844, 412×690, 844×390, 740×320; desktop 1280×800.
- Stage, lamb, ground shadow, dock and object interaction rectangles exactly matched baseline at all six dimensions; no document overflow.
- Base, David, priestly and Joseph outfits loaded and advanced animation frames with motion enabled; reduced motion used for comparisons.
- Shelf and satchel touch targets opened their existing panels; returning home preserved the David outfit. Lantern and lamb taps remained usable.
- No page script errors or missing local assets during the render sweep.
- Original large images are preserved for restoration. No data migration.

Tests use browser emulation, not a physical phone. Existing letterboxing and landscape composition remain unchanged. No architectural changes to shelves, table, window or floor were justified by this audit.
