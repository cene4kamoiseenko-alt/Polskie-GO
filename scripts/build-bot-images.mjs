/**
 * Готовит картинки Telegram-бота из полнокадровых досок владельца (docs/design/a10/telegram/*.webp).
 *
 *   node scripts/build-bot-images.mjs
 *
 * Доска 16:9 → 1280×720 (то, что шлёт sendPhoto) и 640×360 (запасной вариант). Только уменьшение Lanczos:
 * без размытия, без заливки боковых полос, без повышения разрешения. Мастер доски (1672×941) остаётся в docs/design,
 * в приложение попадают только оптимизированные JPEG.
 */
import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const SOURCE = new URL('../docs/design/a10/telegram/', import.meta.url);
const OUT = new URL('../apps/web/public/bot/scenes/ru/', import.meta.url);

/** сцена → файл доски. Русский заголовок на доске: кадры идут только в русский интерфейс. */
export const SCENES = {
  start: 'tg-welcome.webp',
  lesson: 'tg-lessons.webp',
  words: 'tg-words.webp',
  settings: 'tg-settings.webp',
  shopping: 'tg-shopping.webp',
  food: 'tg-food.webp',
  transport: 'tg-transport.webp',
  return: 'tg-return.webp',
};

const SIZES = [
  { suffix: '', width: 1280, height: 720 },
  { suffix: '@640', width: 640, height: 360 },
];

mkdirSync(OUT, { recursive: true });
for (const [scene, file] of Object.entries(SCENES)) {
  const input = readFileSync(new URL(file, SOURCE));
  const meta = await sharp(input).metadata();
  // 16:9 с допуском на округление доски 1672×941.
  if (Math.abs(meta.width / meta.height - 16 / 9) > 0.005) throw new Error(`${file}: ${meta.width}×${meta.height} не 16:9`);
  if (meta.width < 1920) console.warn(`  ${file}: мастер ${meta.width}×${meta.height} меньше 1920×1080 — не растягиваем`);
  for (const { suffix, width, height } of SIZES) {
    const target = new URL(`${scene}${suffix}.jpg`, OUT);
    const jpeg = await sharp(input)
      .resize(width, height, { fit: 'fill', kernel: 'lanczos3' })
      .jpeg({ quality: 90, chromaSubsampling: '4:4:4', mozjpeg: true })
      .toBuffer();
    writeFileSync(target, jpeg);
    console.log(`${scene}${suffix}.jpg  ${width}×${height}  ${(statSync(target).size / 1024).toFixed(0)} KB  ← ${file}`);
  }
}
