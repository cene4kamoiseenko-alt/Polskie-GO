# STOP-SHIP — 1 November 2026

These alpha overlap tests did **not** detect visible garment/body misregistration. The cutout preview has been disabled, and the project displays original whole-look art instead. See `BOBEK_ART_REBUILD_PLAN.md` for the actual art rebuild requirements.

# Bobek V3.1: composite-frame visual acceptance gate

## Current verification

GitHub Actions **[Bobek visual QA, run 41261307607](https://github.com/cene4kamoiseenko-alt/Polskie-GO/actions/runs/41261307607)** passed: 2026-11-01. The same run includes TypeScript, 30 generated V3.1 transparent WebPs, independent-garment and pose checks, production web build and compatibility checks.

The new command `npm run bobek:v3:frames` composites the actual resolved `<BeaverLook>` layer order for four angles and asserts continuity between the separately-moving red sleeve and the torso/hoodie:

| Arm rotation | Overlapping alpha pixels | Min acceptable |
|---|---:|---:|
| −6° | 4,236 | 4,000 |
| −1° | 4,549 | 4,000 |
| +4° | 4,870 | 4,000 |
| +9° | 5,192 | 4,000 |

**These are automated sprite-contact measurements, NOT an aesthetic quality score.** This test ensures the waving arm does not become a floating separate piece, but cannot detect every unnatural fold, shadow, seam, or perspective error.

Screenshots are attached to every relevant GitHub Actions run as artifact `bobek-v31-visual-qa` (four red-hoodie keyframes plus the blue-jacket idle fallback, and JSON report). The asset is retained 30 days. To reproduce:

```sh
npm ci
npm run bobek:v3:generate
npm run bobek:v3:check
npm run bobek:v3:frames
```

## Remaining art corrections

1. **Manual shoulder seam retouch:** smooth the red sleeve connection at extremes, preserve garment outline and shade consistency.
2. **Real joint separation:** head and torso were cut from a painted concept illustration, not reconstructed from a multi-layer drawing. The current process does not provide full bone-based head, neck, hands, or eye animation.
3. **Blue jacket arm:** requires its own correctly aligned painted waving arm; until then `wave` falls back to `front-idle` for blue jacket.
4. **Character consistency:** review eye highlights, tail, backpack, cap and proportions against the approved classic Bobek master, on 320px and 390px mobile screens.
5. **Additional poses and locations:** side/back/three-quarter, 32 wardrobe items, real expressions and baked-Bobek images remain out of scope.

## Release safety

- Current implementation stays in `/__look-prototype` and opt-in QA mode.
- Real server inventory, purchases and production `LOOK_MANIFEST.base.status` are unchanged.
- **This is not approved final artwork.** Do not mark `base.status=ready`, merge PR or deploy on the strength of these automated tests alone.
