# POLSKI GO — SHOPPING / INPOST SCENE PACK V1

## Scene list
- `zabka` — Żabka, convenience store
- `biedronka` — Biedronka, supermarket
- `rossmann` — Rossmann, drugstore
- `inpost` — InPost parcel locker
- `orlen` — ORLEN station

## Sizes and paths
- `01_individual_source_crops_png/*_source_native_2x1.png` — original-detail extracted panels, 2:1
- `01_individual_source_crops_png/*_source_native_16x9.png` — original-detail extracted panels, 16:9
- `02_lesson_backgrounds_1440x720_webp/*.webp` — lesson backdrop, 2:1, upscaled
- `03_telegram_1280x720_jpg/*.jpg` — Telegram 16:9, upscaled
- `04_telegram_640x360_jpg/*.jpg` — Telegram 16:9, mild upscale
- `05_cards_640x320_webp/*.webp` — 2:1 thumbnails

## Important, honest limitation
These individual images were extracted from one AI-generated composite because the generation system repeatedly returned a grid, not independent full-resolution scenes. Their native detail is only approximately 600×300 (2:1) or 535×300 (16:9). The 1440 and 1280 exports are resized, not newly generated true-resolution art. This is a **usable temporary illustrative asset pack**, not final production masters at native 1920×1080/2880×1440. No gaussian blurred sidebars were added.

Every scene has a **static Bobek baked into its background**. Therefore, to show the user's equipped outfit, a future artist/generator should create the same environments **without Bobek**, with exact architecture, and render an independent BobekCharacter component on top. Never substitute the baked-in mascot for the layered wardrobe renderer.

Brand signage is AI-rendered: verify logos, text, placements, store details and rights before publishing. Not affiliated with the depicted brands. Do not replace higher-quality existing scenes automatically.

## Implementation
Read `PROMPT_FOR_CLAUDE_SONNET_RU.md` and `asset-manifest.json`. Use stable IDs. All image text is decorative and must never be used as assessment content, prices, opening hours, or actual store information.
