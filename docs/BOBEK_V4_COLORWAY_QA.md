# Bobek V4 — pixel-registered, shared-canvas outfit proof (QA)

## What is **actually** delivered

We rejected the V3.2 cutouts because the red hoodie **and** blue jacket visibly detached from the body. Moving separate fragments up/down and counting overlapping pixels was an invalid quality proxy.

V4's first verified fit uses the **unchanged, canonical** `apps/web/src/assets/beaver/front.webp` (512×512, 2.5D painterly look) as one complete character. `scripts/generate-bobek-v4-colorway.mjs` selectively recolors the red **fabric** within the same pixel grid, preserving the exact original silhouette, face, eyes, paws, tail, backpack, mapped pose, PL logo and lighting. It produces:

- `apps/web/src/dev/bobek-coherent/front-blue-colorway.webp` (lossless, same 512×512 canvas)
- `front-blue-colorway@256.webp` (display resolution)
- `front-blue-overlay.webp` (only recolored pixels, transparent elsewhere)
- `front-blue-mask-report.json` (coverage, source, status)

**This is a blue hoodie colorway, not a denim jacket.** Neither a nude body nor rotating limb bones are produced. The painted red scarf stays red by design. There is no fabricated blue wave pose.

`/__look-prototype` now has a red/blue control in an isolated `data-bobek-v4-colorway` area. It never equips the player's actual outfit, touches Stars, or flips the QA gate for V2/V3.2. The original whole-look art stays on all normal app screens.

## Why this cannot drift

Both looks originate from the **same 512×512 alpha image**. No resize, crop, transform, center-of-mass relocation, pose interpolation or alternate head is involved in the 512px generated blue file.

`scripts/check-bobek-v4-colorway.mjs` verifies:
- Pixel-exact alpha at every visible coordinate.
- Original red master remains byte-for-byte unchanged.
- Only the garment region has RGB differences; **all visible face, paw and logo pixels stay identical**.
- The blue region is actually blue (not a malformed recolor).
- There is no fake blue `wave` sprite.
- Proper 256px delivery art.

The browser test `scripts/look-prototype-screens.ts` selects red / blue / red on a real 390px Chromium viewport, validates asset loading, confirms the broken layered wardrobe is still blocked, and captures screenshots at 390px and 320px.

## Build

```sh
npm ci
npm run bobek:coherent:generate
npm run bobek:v4:colorway
npm run bobek:v4:check
npm run build:web
node --import tsx scripts/look-prototype-screens.ts
```

## Remaining art production (not complete)

1. Repaint the genuinely nude base and both independent garment patterns on **one** fixed authoring master (front and back arm splits, proper sleeves, neck and shoulder anchors) rather than extracting pieces from unrelated full-look images.
2. Review four reference composites per outfit (idle, half-wave, wave-start/end) with a pixel overlay before authorizing any animated garment.
3. Add side/3⁄4/back views using the **same** fixed body proportions and accepted character identity.
4. Connect the 32-item server wardrobe only after genuine `LOOK_MANIFEST` assets pass the art acceptance gate.
5. Test Telegram iOS and Android separately.

**Do not claim V4 is a production-ready 2.5D skeletal model.** It is a verified alignment/color system and a stable foundation for art creation. Keep `V3_ART_APPROVED=false` and `LAYERED_APP_PREVIEW_APPROVED=false` until approval.
