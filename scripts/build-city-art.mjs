/**
 * Готовит фоны городов из полноразмерных панорам владельца (docs/design/a10/cities/city-<slug>.webp, 1774×887, 2:1).
 *
 *   node scripts/build-city-art.mjs
 *
 * Мастер остаётся в docs/design/a10/cities (не попадает в приложение). В приложение идут
 * apps/web/src/assets/cities/<slug>.webp (1440×720) и <slug>@640.webp (640×320). Только уменьшение Lanczos,
 * без размытия и без растягивания; качество WebP подбирается под бюджет теста city-art.test.ts
 * (основной ≤ 220 КБ, @640 ≤ 60 КБ).
 */
import { readFileSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const MASTERS = new URL('../docs/design/a10/cities/', import.meta.url);
const OUT = new URL('../apps/web/src/assets/cities/', import.meta.url);

/** Города, чей кадр владельца проверен по ориентирам (см. assets/cities/CITY_ASSET_MANIFEST.json). */
export const CITIES = ['lodz', 'opole', 'poznan', 'wroclaw', 'gdansk', 'gdynia', 'gorzow', 'bialystok'];

const TARGETS = [
  { suffix: '', width: 1440, height: 720, budget: 216 * 1024 },
  { suffix: '@640', width: 640, height: 320, budget: 59 * 1024 },
];

for (const slug of CITIES) {
  const input = readFileSync(new URL(`city-${slug}.webp`, MASTERS));
  const meta = await sharp(input).metadata();
  if (meta.width !== meta.height * 2) throw new Error(`${slug}: ${meta.width}×${meta.height} не 2:1`);
  for (const { suffix, width, height, budget } of TARGETS) {
    let quality = 82;
    let out;
    do {
      out = await sharp(input).resize(width, height, { fit: 'fill', kernel: 'lanczos3' }).webp({ quality, effort: 6, smartSubsample: true }).toBuffer();
      quality -= 2;
    } while (out.length > budget && quality >= 54);
    if (out.length > budget) throw new Error(`${slug}${suffix}: ${(out.length / 1024).toFixed(0)} КБ при q${quality + 2}, бюджет ${(budget / 1024).toFixed(0)} КБ`);
    const target = new URL(`${slug}${suffix}.webp`, OUT);
    writeFileSync(target, out);
    console.log(`${slug}${suffix}.webp  ${width}×${height}  q${quality + 2}  ${(statSync(target).size / 1024).toFixed(0)} КБ  ← city-${slug}.webp ${meta.width}×${meta.height}`);
  }
}
