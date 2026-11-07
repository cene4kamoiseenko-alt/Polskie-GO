/**
 * Иконки приложения и графика для Google Play из существующих картинок Бобека (apps/web/src/assets/beaver, brand).
 *
 *   node scripts/build-app-icons.mjs
 *
 *   apps/web/public/icons/icon-192.png, icon-512.png    — значки PWA / Android (во весь квадрат, как просит manifest «any»)
 *   apps/web/public/icons/icon-maskable-512.png         — «maskable»: Бобек в центральных 66 % (безопасная зона), Android сам обрезает по маске
 *   docs/play/graphics/icon-512.png                     — значок для Play Console (512×512, PNG)
 *   docs/play/graphics/feature-1024x500.png             — главная графика карточки в Play (1024×500, без текста поверх, кроме логотипа)
 * Фон — тёмно-синий цвет приложения (theme-color #07182C) с мягким свечением; Бобек — поза «wave» (1024×1024).
 */
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';

const sharp = createRequire(import.meta.url)('sharp');
const root = new URL('../', import.meta.url);
const asset = (p) => new URL(`apps/web/src/assets/${p}`, root).pathname;
const out = (p) => new URL(p, root).pathname;
mkdirSync(out('apps/web/public/icons'), { recursive: true });
mkdirSync(out('docs/play/graphics'), { recursive: true });

const NAVY = '#07182C';
const background = (w, h) =>
  sharp(
    Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><defs><radialGradient id="g" cx="50%" cy="42%" r="70%"><stop offset="0" stop-color="#1f4d7a"/><stop offset="0.55" stop-color="#0d2b4a"/><stop offset="1" stop-color="${NAVY}"/></radialGradient></defs><rect width="${w}" height="${h}" fill="url(#g)"/></svg>`,
    ),
  ).png();

/** Бобек (обрезан по содержимому) вписан в квадрат `box`. */
async function bobek(box) {
  const trimmed = await sharp(asset('beaver/wave.webp')).trim({ threshold: 8 }).toBuffer();
  return sharp(trimmed).resize({ width: box, height: box, fit: 'inside' }).png().toBuffer();
}

async function icon(size, fill, file) {
  const art = await bobek(Math.round(size * fill));
  const meta = await sharp(art).metadata();
  const left = Math.round((size - meta.width) / 2);
  const top = Math.round((size - meta.height) / 2 + size * 0.015);
  const buf = await (await background(size, size)).composite([{ input: art, left, top }]).png({ compressionLevel: 9 }).toBuffer();
  await sharp(buf).toFile(out(file));
  return buf;
}

await icon(192, 0.84, 'apps/web/public/icons/icon-192.png');
const big = await icon(512, 0.84, 'apps/web/public/icons/icon-512.png');
await icon(512, 0.62, 'apps/web/public/icons/icon-maskable-512.png');
await sharp(big).toFile(out('docs/play/graphics/icon-512.png'));

// Главная графика 1024×500: логотип слева, Бобек справа.
const W = 1024, H = 500;
const art = await bobek(430);
const artMeta = await sharp(art).metadata();
const logo = await sharp(asset('brand/logo.webp')).resize({ width: 520 }).png().toBuffer();
const logoMeta = await sharp(logo).metadata();
const feature = await (await background(W, H))
  .composite([
    { input: logo, left: 70, top: Math.round((H - logoMeta.height) / 2) },
    { input: art, left: W - artMeta.width - 60, top: Math.round((H - artMeta.height) / 2) },
  ])
  .png({ compressionLevel: 9 })
  .toBuffer();
await sharp(feature).toFile(out('docs/play/graphics/feature-1024x500.png'));
console.log('иконки и графика Google Play собраны');
