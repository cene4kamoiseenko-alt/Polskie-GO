# STOP-SHIP — 1 November 2026

**V3.2 is disabled in the app. The user observed BOTH outfits visually detached from the body despite green numeric tests.** This document is historical technical evidence only, not approval or instructions to enable. See [BOBEK_ART_REBUILD_PLAN.md](BOBEK_ART_REBUILD_PLAN.md) and the fail-closed switch `apps/web/src/dev/bobekArtGate.ts`.

# POLSKI GO · Bobek V3.2 — two dressed waving arms (QA)

**Status:** visual prototype only. The classic production Bobek and all server-side cosmetics remain unchanged.

## Changes

- `scripts/generate-bobek-v3.mjs` now makes **36 transparent WebP layers** (7 idle / 5 wave, each 1024, 512, 256 pixels). It builds two separate wave arm images: red hoodie and blue denim jacket.
- The denim arm comes from a **selective recolor of the red-sleeve reference**; the furry hand is intentionally preserved. It is **not yet a separate hand-painted denim sleeve**. The red and blue shoulders each have a shaded fabric underlay behind the moving arm.
- `lookV3Manifest.ts` now registers a `front-wave` pose for both `hoodie-red` and `jacket-denim`; neither item can borrow the other's sleeve.
- `bobek-v3-frame-qa.mjs` renders four *fully composited character* frames per outfit at −6°, −1°, 4°, and 9°. Screenshots and a JSON report are attached as `bobek-v32-visual-qa` to GitHub Actions.
- `check-bobek-v3.mjs` validates alpha, sizes, different garment silhouettes, neck position, feet visibility, pose routing and production isolation.

## First verified V3.2 CI

GitHub Actions [run 41262432900](https://github.com/cene4kamoiseenko-alt/Polskie-GO/actions/runs/41262432900) passed all jobs including TypeScript, production web bundle and 8 composited keyframe screenshots.

| Wave arm angle | Red sleeve contact pixels | Blue sleeve contact pixels |
|---|---:|---:|
| −6° | 4,236 | 4,626 |
| −1° | 4,549 | 4,952 |
| +4° | 4,870 | 5,284 |
| +9° | 5,192 | 5,618 |

These measurements only confirm **overlapping alpha at the shoulder**, not anatomical correctness, perspective or consistent studio-grade lighting. Art review is essential.

## Remaining defects before acceptance

1. The raised paw is originally from a cropped drawing; the tip needs hand retouch.
2. Denim cuff/folds must be separately painted, not just recolored, especially at extreme rotation angles.
3. Shadow and highlight blending around both shoulder seams remains approximate. Compare the eight generated frames on 360px and 390px mobile viewports.
4. The head, face and lower torso are still concept-derived cutouts; independent facial animation, walking and multi-view 2.5D skeletal rig are not implemented.
5. Remaining wardrobe items, side/three-quarter/back views, baked characters in scenes and map are not migrated.

Do **not** mark production `LOOK_MANIFEST.base.status=ready` or merge the draft PR solely because CI is green. Do not interpret this as a Cloudflare deployment.

## Run locally

```sh
npm ci
npm run bobek:v2:generate
npm run bobek:v3:generate
npm run bobek:v3:check
npm run bobek:v3:frames
npm run build:web
```

Then inspect the local `/__look-prototype` in V3.2 QA mode. User outfitting and purchases remain independent of QA.
