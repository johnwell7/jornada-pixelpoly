# Sheep Alive V5.1

Restore point: [`restore/pre-v5-sheep-100800b`](https://github.com/johnwell7/jornada-pixelpoly/tree/restore/pre-v5-sheep-100800b).

The previous Lar used complete outfit frames for a few short poses. Sleep held the final blink frame, the original nose puff was absent from the full-frame player, and tapping opened a conversation with buttons. The V5 player is scoped to the Lar. Scripture panels retain their established artwork and player.

## Standard lamb in the Lar

The standard lamb uses the original illustrated character and the established
2.5D Blender frames. The volumetric experiment remains available in
`production/lamb-volumetric.blend` for reference. The Lar uses the original
full-frame player for the standard lamb and the V5 player for the equipped
outfits.

## Original V5.1 artwork

There are 12 authored sequences for each of the four available skins: standard, priestly garments, Joseph's tunic and David's shepherd outfit. The 48 atlases contain 1,720 full 256 × 286 frames. Each profile uses its own stationary appearance as the identity reference and registers its own eyes, muzzle, ears, forehooves and head. Facial features are drawn into the artwork, then rendered with the head, wool, garment and accessories together. The new sequences do not play earlier clips or layer clothes over the standard frames.

| Sequence | Visible movement |
| --- | --- |
| Neutral / curious / playful | Relaxed mouth and breathing; side glance; wink and small grimace |
| Annoyed | Brow furrow, smaller eyes, ear movement and a short head shake |
| Yawn | Eyelids lower, mouth opens and closes, head and ears follow |
| Settle | Head and gaze lower to the front hooves as they lift alternately |
| Doze / sleeping / wake | Increasing lateral sway, eyelids close, sleeping breath and a soft rise back up |
| Talking | Small mouth and head movements just before a line |
| Content / nuzzle | Relaxation with eyes closed, or a sideways lean and smile |

Rear support stays anchored; the original floor shadow remains in scene coordinates. The nose bubble in `reference/bitpoly-art.js` supplied the color and scale reference. It is now drawn at each skin's nostril and moves with the face as part of the sleeping frames.

`production/render-alive.py` now rebuilds only the three legacy outfit atlases with Pillow, NumPy and OpenCV. `--clip nuzzle` rebuilds that behavior for those outfits. The static references and all earlier animation files remain in the repository.

## Interaction

A rolling two-second window detects three distinct pointer taps. A seven-second cooldown and an active-clip lock prevent repeating the complaint. Stroking clears the tap burst and alternates the two affection clips. Keyboard activation remains available and does not count as repeated pointer taps.

One player selects weighted spontaneous behaviors with variable gaps and avoids consecutive duplicates. It gives touch priority, returns through the current poses on interruption, reverses the appropriate part of a drowse when interrupted, and pauses its clock while hidden or while a panel makes the Lar inert. Movement reduction uses a neutral frame and keeps dialogue and interaction available. Atlases load as needed for the equipped outfit; the next sleep stages decode before the pendulum starts.

The quote bubble opens in 190 ms, closes in 160 ms and times its display to the line length. Tap the quote or press Escape to dismiss. Ordinary lines have no navigation choices; a shelf invitation offers one real action. Touch complaints and conversational replies are cued from the sprite timeline. Independent wind tracks have stronger, staggered gusts; the pots and background art remain fixed.

## Validation and limits

- `npm run build`: 44 tests passed, including the 48 unique atlas files, four animation players, cooldown, sleeping and waking, and motion reduction.
- Chromium with a 390 × 844 touch viewport: all four skins showed the triple-tap complaint, spontaneous yawn, settling, dozing, sleeping and waking. Both continuous affection gestures were exercised separately on all four skins.
- Chromium at 320 × 568: motion reduction selected the neutral frame; the shelf and satchel remained accessible. Desktop layout checked at 1280 × 800.
- The demonstration video samples the shipped frames at their actual clip durations. Browser tests use emulation, so performance and motion on physical iOS/Android devices still need checking. The first use of a clip can wait for its atlas to decode on a slow connection.
