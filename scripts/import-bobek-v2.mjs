/**
 * Import the supplied BOBEK_V2_layered_art_draft.zip after extracting it.
 *
 * Usage:
 *   node scripts/import-bobek-v2.mjs /path/to/bobek_v2_assets
 *
 * Never overrides existing production assets, server outfits, or paid inventory.
 * SVG source files are kept beside the generated WebP for further artistic edits.
 */
import { existsSync, mkdirSync, copyFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const source = process.argv[2] ? resolve(process.argv[2]) : '';
const dest = join(root, 'apps/web/src/dev/bobek-v2');
if (!source || !existsSync(source)) {
  console.error('Usage: node scripts/import-bobek-v2.mjs /path/to/extracted/bobek_v2_assets');
  process.exit(1);
}
const poses = ['idle', 'wave', 'think', 'happy', 'celebrate'];
const parts = ['body', 'top-hoodie-red', 'top-jacket-denim', 'backpack', 'cap-red', 'glasses-round', 'blink'];
const widths = [1024, 512, 256];
let verified = 0;
const expected = [];
for (const pose of poses) for (const part of parts) for (const width of widths) {
  const file = width === 1024 ? `${part}.webp` : `${part}@${width}.webp`;
  const from = join(source, pose, file);
  if (!existsSync(from)) throw Error(`Missing: ${from}`);
  const meta = await sharp(from).metadata();
  if (meta.format !== 'webp' || !meta.hasAlpha || meta.width !== width || meta.height !== width) {
    throw Error(`Invalid canvas/alpha: ${from} (expected transparent ${width}×${width} WebP)`);
  }
  expected.push([from, join(dest, pose, file)]);
  verified++;
}
for (const pose of poses) {
  const fromDir = join(source, pose);
  for (const file of readdirSync(fromDir).filter((x) => x.endsWith('.svg'))) {
    expected.push([join(fromDir, file), join(dest, pose, file)]);
  }
}
for (const [from, to] of expected) {
  mkdirSync(resolve(to, '..'), { recursive: true });
  copyFileSync(from, to);
}
console.log(`Bobek V2: imported ${verified} verified WebP sprites plus SVG sources to ${dest}`);
console.log('Draft model is still isolated to the opt-in QA preview. Restart Vite and enable V2 on /__look-prototype.');
