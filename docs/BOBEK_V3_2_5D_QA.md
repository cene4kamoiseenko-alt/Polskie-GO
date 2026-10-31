# Bobek V3 — premium 2.5D cutout (QA only, 2026-10-31)

## What is actually ready
- Source-controlled art in `assets/bobek-v3-sources.json.gz.b64`: six alpha-matted source images extracted from the 2.5D reference, not six character poses.
- `npm run bobek:v3:generate` produces **21 transparent WebP sprites** for **7 independently aligned layers** (1024/512/256 px): `torso`, `head`, `top-hoodie-red`, `top-jacket-denim`, `backpack`, `cap-red`, `glasses-round`.
- Separate version `bobek-v3-2.5d-draft@1` in `apps/web/src/dev/lookV3Manifest.ts`: one real `front-idle` pose; the other moods explicitly fall back to idle.
- V3 is selectable in `/__look-prototype` beside legacy and V2 only after its required assets exist. It can be shown as an opt-in QA outfit on pages that call `<Beaver>`.
- Clothing has different silhouettes; the base is no longer a complete character with hoodie painted in. Production `LOOK_MANIFEST.base.status` stays `pending`.

## Build and verify
```bash
npm ci
npm run bobek:v2:generate
npm run bobek:v3:generate
npm run bobek:v3:check
npm run typecheck
npm run build:web
```

Go to `/__look-prototype` and select **2.5D V3**; try red hoodie and blue jacket with cap, glasses and backpack. Turn on the QA preview if needed. Verify on a real phone before approval.

## Art issues that remain
- Cutout comes from a **concept illustration**: the edges and overlaps around arms, shoulders, clothes and backpack still need hand-painting. Head/torso division is an approximate alpha cut, not independent animation bones.
- The sample glasses/cap placement and the two sleeve outlines need manual align/perspective review; checking image dimensions is not enough.
- There is only **one** actual front pose (idle); there is NO true V3 wave/think/happy/celebrate, blinking mouth visemes, walk cycle or side/back/three-quarter art.
- No substitution for the remaining wardrobe catalog. The seven production legacy costumes, baked-Bobek scenes, map background and Splash are unchanged.
- This is a QA improvement, not permission to publish. We have not deployed to Cloudflare or merged it into Claude's default branch.

## Quality gates
The V3 generator fails if any of six sources is missing. `bobek:v3:check` fails for missing alpha channels, wrong size, identical top masks, false pose labels, or accidental changes to production-art readiness. Full artistic validation still requires side-by-side inspection against the approved plush Bobek reference and retouching of joint seams.
