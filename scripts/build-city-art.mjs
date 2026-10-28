/**
 * Готовит фоны городов из полноразмерных панорам владельца (docs/design/a10/cities/city-<slug>.webp).
 * Мастера бывают двух форматов: 2:1 (1774×887, пакет 2026-10-27) и 3:2 (1536×1024, пакет 2026-10-28). Из 3:2
 * вырезается полоса 2:1 во всю ширину с отступом сверху `top` (подобран так, чтобы ориентир не резался и стоял
 * в середине: баннеры обрезают кадр по центру).
 *
 *   node scripts/build-city-art.mjs              — все города
 *   node scripts/build-city-art.mjs katowice     — только перечисленные
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

/** Города, чей кадр владельца проверен по ориентирам (см. assets/cities/CITY_ASSET_MANIFEST.json); `top` — для мастеров 3:2. */
export const CITIES = {
  lodz: {}, opole: {}, poznan: {}, wroclaw: {}, gdansk: {}, gdynia: {}, gorzow: {}, bialystok: {}, lublin: {},
  katowice: { top: 96 }, szczecin: { top: 72 }, olsztyn: { top: 72 },
};

const TARGETS = [
  { suffix: '', width: 1440, height: 720, budget: 216 * 1024 },
  { suffix: '@640', width: 640, height: 320, budget: 59 * 1024 },
];

const only = process.argv.slice(2);
for (const slug of only.length ? only : Object.keys(CITIES)) {
  if (!(slug in CITIES)) throw new Error(`${slug}: нет в CITIES`);
  const file = readFileSync(new URL(`city-${slug}.webp`, MASTERS));
  const meta = await sharp(file).metadata();
  let input = file;
  let frame = `${meta.width}×${meta.height}`;
  if (meta.width * 2 === meta.height * 3) {
    const top = CITIES[slug].top;
    const height = meta.width / 2;
    if (top === undefined || top < 0 || top + height > meta.height) throw new Error(`${slug}: мастер 3:2 без допустимого top`);
    input = await sharp(file).extract({ left: 0, top, width: meta.width, height }).png().toBuffer();
    frame += `, кадр 2:1 с y=${top}`;
  } else if (meta.width !== meta.height * 2) throw new Error(`${slug}: ${meta.width}×${meta.height} не 2:1 и не 3:2`);
  if (meta.width < TARGETS[0].width) throw new Error(`${slug}: ширина ${meta.width} меньше ${TARGETS[0].width} — увеличивать нельзя`);
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
    console.log(`${slug}${suffix}.webp  ${width}×${height}  q${quality + 2}  ${(statSync(target).size / 1024).toFixed(0)} КБ  ← city-${slug}.webp ${frame}`);
  }
}
