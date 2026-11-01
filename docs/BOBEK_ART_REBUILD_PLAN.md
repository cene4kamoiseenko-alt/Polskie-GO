# STOP-SHIP: Bobek V3.2 visual misalignment (1 November 2026)

## Confirmed defect, not a user preference

Both the red hoodie **and** blue jacket visibly float off the Beaver torso.
The V3.2 generator separately crops and independently resizes the naked body,
hoodie, jacket, backpack and sleeves. Moving garments ~60 pixels up only
disguised the defect. Compositing alpha overlap and TypeScript pass while the
outfit still looks wrong. A visually correct rig **cannot** be recovered by
blindly moving these cutouts up/down or recoloring a red sleeve blue.

## Immediate engineering action

- Explicitly **disable V3/V3.2** QA selection by default and fail closed for
  users who previously saved `art:"v3"` in localStorage.
- When a stored V3 outfit is selected, the real production Beaver (original
  approved whole-look artwork) must render instead, not another cutout demo.
- Disable both broken arm-wave variants; do not call them finished.
- The production inventory, purchases, and Bobek legacy artwork are untouched.

## Required **new** artwork master (not a patch of V3.2)

The existing painted 512px Bobek used by production is the **identity master**
for face and color. A new authoring master must be drawn at 2048px or above
with body, head, stationary paws, front/back arm bones, neck, tail and feet
in one fixed reference coordinate system (final art: 1024x1024 transparent).

Garments should be designed **over that unchanged exact body** in the art
editor (hoodie and denim coat individually) and separated into front/back
panels and physically independent sleeves with the same torso and shoulder
anchors. Do not redraw the Beaver's face for different outfits.

For each garment, first accept 4 still composites on common body:
1. front idle, 2. front elbow halfway, 3. front wave start, 4. front wave
end. Include an onion-skin registration check and close-up of shoulder
seam and neckline. Then build the 2.5D animation.

## Release blockers

- Both idle garments must pass human visual review against canonical
  character identity, not merely PNG/alpha validators.
- Distinct hood, cuffs, fabric folds and sleeve attachment for each garment.
- No asset from the previous displaced V3.2 proof may be relabeled as
  production-ready. Keep it available for diagnosis but unreachable in app.
- Test on 320/390 CSS pixels, Android/iOS Telegram WebView, reduced-motion.
- No merge/deploy based on green CI alone.

The QA flag lives at `apps/web/src/dev/bobekArtGate.ts` and is deliberately
`false`. Switching it requires an approved master and review; a successful
code build is not a reason to turn it on.
