/**
 * Растровые детали недельной лиги и поздравления бота (владелец, 2026-11-15) из исходников docs/design/league:
 *
 *   node scripts/build-league-art.mjs
 *
 *  • bot/<язык>-place-<место>.webp → apps/web/public/bot/league/<язык>/place-<место>.jpg — постер бота призёру 1–3 места
 *    (ru и uk: на постере надписи на языке интерфейса). Ширина 1080, JPEG.
 *  • ui/*.png (короны, медали 1–3, щит, кубок, лавр, иконки приглашения) → apps/web/src/assets/league/*.webp.
 *    Детали вырезаны с общего листа, у многих по краю остались куски соседних деталей: оставляем только сам предмет
 *    (самую крупную связную область непрозрачных пикселей; у лавра — две ветви), обрезаем пустые края.
 *  • ui/podium-trophy-sheet.webp — лист с тремя пьедесталами без цифр, большим кубком и Бобеком: пьедесталы и кубок —
 *    отдельными файлами (pedestal-1 — золото, 2 — серебро, 3 — бронза).
 *  • ui/bobek_*.webp — Бобек с кубком (призы недели) и с телефоном (приглашение друзей), уменьшенные копии.
 */
import { mkdirSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const sharp = require('sharp');

const SRC = new URL('../docs/design/league/', import.meta.url).pathname;
const OUT_UI = new URL('../apps/web/src/assets/league/', import.meta.url).pathname;
const OUT_BOT = new URL('../apps/web/public/bot/league/', import.meta.url).pathname;
mkdirSync(OUT_UI, { recursive: true });

/** RGBA-буфер и размеры. */
async function rgba(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}

/** Связные области непрозрачных пикселей (альфа > 40): метки и площади. */
function components({ data, w, h }) {
  const label = new Int32Array(w * h);
  const areas = [0];
  const boxes = [null];
  const stack = new Int32Array(w * h);
  let n = 0;
  for (let i = 0; i < w * h; i++) {
    if (label[i] || data[i * 4 + 3] <= 40) continue;
    n++;
    let top = 0, area = 0, x0 = w, y0 = h, x1 = 0, y1 = 0;
    stack[top++] = i;
    label[i] = n;
    while (top) {
      const p = stack[--top];
      area++;
      const x = p % w, y = (p / w) | 0;
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      for (const q of [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, y > 0 ? p - w : -1, y < h - 1 ? p + w : -1]) {
        if (q >= 0 && !label[q] && data[q * 4 + 3] > 40) { label[q] = n; stack[top++] = q; }
      }
    }
    areas.push(area);
    boxes.push({ x0, y0, x1, y1 });
  }
  return { label, areas, boxes, n };
}

/** Оставить только выбранные области (с каймой 2 px для сглаженного края), остальное — прозрачно. */
function keepOnly(img, comp, keep) {
  const { data, w, h } = img;
  const mask = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) if (keep.has(comp.label[i])) mask[i] = 1;
  const grown = new Uint8Array(mask);
  for (let pass = 0; pass < 2; pass++) {
    const src = new Uint8Array(grown);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (src[i]) continue;
      if ((x > 0 && src[i - 1]) || (x < w - 1 && src[i + 1]) || (y > 0 && src[i - w]) || (y < h - 1 && src[i + w])) grown[i] = 1;
    }
  }
  const out = Buffer.from(data);
  for (let i = 0; i < w * h; i++) if (!grown[i]) out[i * 4 + 3] = 0;
  return out;
}

/** Деталь: главная область (или `parts` крупнейших), без пустых краёв, WebP. */
async function sprite(file, name, { parts = 1, width } = {}) {
  const img = await rgba(SRC + 'ui/' + file);
  const comp = components(img);
  const order = [...Array(comp.n).keys()].map((i) => i + 1).sort((a, b) => comp.areas[b] - comp.areas[a]);
  const keep = new Set(order.slice(0, parts));
  const clean = keepOnly(img, comp, keep);
  let pipe = sharp(clean, { raw: { width: img.w, height: img.h, channels: 4 } }).trim({ threshold: 1 });
  const trimmed = await pipe.png().toBuffer();
  pipe = sharp(trimmed).extend({ top: 2, bottom: 2, left: 2, right: 2, background: { r: 0, g: 0, b: 0, alpha: 0 } });
  if (width) pipe = pipe.resize({ width, withoutEnlargement: true, kernel: 'lanczos3' });
  const info = await pipe.webp({ quality: 92, alphaQuality: 100, effort: 6 }).toFile(OUT_UI + name + '.webp');
  console.log(`${name.padEnd(18)} ${info.width}×${info.height} ${(info.size / 1024).toFixed(1)} KB  (${file})`);
}

// ── Детали интерфейса лиги
await sprite('crown_gold.png', 'crown-1');
await sprite('crown_silver.png', 'crown-2');
await sprite('crown_bronze.png', 'crown-3');
await sprite('medal_gold.png', 'medal-1');
await sprite('medal_silver.png', 'medal-2');
await sprite('medal_bronze.png', 'medal-3');
await sprite('trophy_small.png', 'trophy-small');
await sprite('badge_blue_shield.png', 'shield');
await sprite('laurel_leaves.png', 'laurel', { parts: 2 });
await sprite('xp_label_gold.png', 'xp');
await sprite('icon_book.png', 'icon-book');
await sprite('icon_location.png', 'icon-location');
await sprite('icon_home.png', 'icon-home');
await sprite('icon_check.png', 'icon-check');
await sprite('bobek_rating_large_trophy.webp', 'bobek-trophy', { width: 300 });
await sprite('bobek_invitation_exact_with_phone.webp', 'bobek-phone', { width: 440 });

// ── Лист: три пьедестала (нижний ряд, слева направо — серебро, золото, бронза) и большой кубок
{
  const img = await rgba(SRC + 'ui/podium-trophy-sheet.webp');
  const comp = components(img);
  const big = [...Array(comp.n).keys()].map((i) => i + 1).filter((k) => comp.areas[k] > 20_000);
  const bottom = big.filter((k) => comp.boxes[k].y0 > img.h * 0.6).sort((a, b) => comp.boxes[a].x0 - comp.boxes[b].x0);
  if (bottom.length !== 3) throw new Error(`пьедесталов на листе: ${bottom.length}, ожидалось 3`);
  const trophy = big
    .filter((k) => !bottom.includes(k))
    .sort((a, b) => Math.abs((comp.boxes[a].x0 + comp.boxes[a].x1) / 2 - img.w * 0.56) - Math.abs((comp.boxes[b].x0 + comp.boxes[b].x1) / 2 - img.w * 0.56))[0];
  const cut = async (k, name, width) => {
    const b = comp.boxes[k];
    const clean = keepOnly(img, comp, new Set([k]));
    const info = await sharp(clean, { raw: { width: img.w, height: img.h, channels: 4 } })
      .extract({ left: Math.max(0, b.x0 - 3), top: Math.max(0, b.y0 - 3), width: Math.min(img.w, b.x1 + 4) - Math.max(0, b.x0 - 3), height: Math.min(img.h, b.y1 + 4) - Math.max(0, b.y0 - 3) })
      .resize({ width, withoutEnlargement: true, kernel: 'lanczos3' })
      .webp({ quality: 92, alphaQuality: 100, effort: 6 })
      .toFile(OUT_UI + name + '.webp');
    console.log(`${name.padEnd(18)} ${info.width}×${info.height} ${(info.size / 1024).toFixed(1)} KB  (лист)`);
  };
  await cut(bottom[1], 'pedestal-1', 380);
  await cut(bottom[0], 'pedestal-2', 340);
  await cut(bottom[2], 'pedestal-3', 340);
  await cut(trophy, 'trophy', 320);
}

// ── Постеры бота призёрам 1–3 места: русский и украинский (надписи на постере на языке интерфейса)
for (const f of readdirSync(SRC + 'bot').filter((x) => /^(ru|uk)-place-[123]\.webp$/.test(x)).sort()) {
  const [, lang, place] = /^(ru|uk)-place-([123])\.webp$/.exec(f);
  mkdirSync(OUT_BOT + lang, { recursive: true });
  const info = await sharp(SRC + 'bot/' + f)
    .flatten({ background: '#ffffff' })
    .resize({ width: 1080, kernel: 'lanczos3' })
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(`${OUT_BOT}${lang}/place-${place}.jpg`);
  console.log(`bot/league/${lang}/place-${place}.jpg ${info.width}×${info.height} ${(info.size / 1024).toFixed(0)} KB`);
}
