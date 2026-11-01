# POLSKI GO — Bobek V5: common-body art fitting proof

**Status: QA-only, not a release-ready 2.5D character or user wardrobe.**

## What is new

- A **single 1024×1024 nude-body source** is used for both front-idle outfits.
- Two truly distinct drawn garment designs are supplied: red PL hoodie (pullover and drawstrings) and denim jacket (open collar, placket, button/pocket details).
- Each outfit is painted as FOUR separate transparent layers on the **exact same canvas**: left sleeve, right sleeve, front panel, collar. No layer is cropped/recentered individually.
- Source SVG artwork is stored in `apps/web/src/dev/bobek-v5/` after running `npm run bobek:v5:generate`. PNG/WebP 1024,512,256 variants and two full-body composites are generated deterministically.
- `apps/web/src/dev/V5ArtPreview.tsx` provides isolated body/red/denim review in `/__look-prototype` without connecting the paid inventory or enabling the broken prior V3 overlays.
- `npm run bobek:v5:check` tests identical shared-body pixels outside the clothing masks, canvas size, alpha, two distinct garments and head/feet exclusion.
- Chromium switches all three V5 views at mobile viewport sizes as part of the PR QA workflow.

## What this **does not** prove

The nude base is sourced from earlier experimental V3 concept art, not from a verified de-costumed recreation of the production beaver. **The expression/head may differ from canonical Bobek**, and the outfit shape/cloth shading is not yet at the plush, cinematic painterly fidelity required for launch. This package is a **coherent technical and visual fitting prototype**, not a finished 2.5D rig.

There is **no actual arm-wave** for these new outfits. The two sleeves are drawn independently in a single front-idle pose; there are no moving shoulders, no separate animations, no 3/4, side, or back views, and no 32-item production wardrobe.

## Acceptance before any production activation

1. Approve consistent face and body identity side-by-side with `apps/web/src/assets/beaver/front.webp`.
2. Hand-paint the torso, both clothing patterns, cuff joints, outline and plush fabric highlights in one master source; do not independently stretch PNGs to fit.
3. Approve both *static* outfits at 1024/512/256 and 320/390 CSS viewport with full-body and close-up screenshots.
4. Extend the single master into a true pivoted waving-arm and denim-sleeve rig with verified arm seam and 4+ frames; take actual screenshot comparisons.
5. Only after artwork QA, connect `LOOK_MANIFEST` with an explicit approved revision, without changing Stars/inventory checks.

**Flags remain false:** `V3_ART_APPROVED` and `LAYERED_APP_PREVIEW_APPROVED`. No existing user should see the experimental character.

## Local verification

```bash
npm ci
npm run bobek:v5:generate
npm run bobek:v5:check
npm run build:web
node --import tsx scripts/look-prototype-screens.ts
```

Find the V5 standalone comparison on `/__look-prototype`. The V4 color comparison and original legacy Bobek are still shown separately for identity review.

An additional offline ZIP `BOBEK_V5_REGISTERED_ART_QA.zip` with rendered PNG, layered SVG and a visual comparison was created in this chat. The GitHub generator is the source of truth for repeatable rendering.
