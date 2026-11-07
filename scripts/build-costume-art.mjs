/**
 * Скины Бобека — цельные картинки костюмов (пакеты владельца 2026-11-04 — docs/design/v20/skins/<имя>.webp и 2026-11-07 — docs/design/v21/skins/<имя>.webp, 1254×1254 с прозрачностью).
 *
 *   node scripts/build-costume-art.mjs                — собрать apps/web/src/assets/costumes/<имя>.webp (512) и @256, @512, @1024
 *   node scripts/build-costume-art.mjs --sheet out.png — + контрольный лист на тёмном фоне рядом с позой wave (не в репозиторий)
 *
 * Что делает (оригиналы не меняются, всё воспроизводимо):
 *  1. Стирает полупрозрачные разводы дальше 8 px от плотного силуэта (у пилота над фуражкой — светлое облако на 46 000 px).
 *  2. Ставит Бобра на холст так же, как стартовую позу `beaver/wave` и скины партии 2: линия ног — на линии wave, расстояние «глаза — ноги» —
 *     как у wave (Бобёр одного роста во всех образах). Мастера кадрированы каждый по-своему, поэтому преобразование своё у каждой картинки,
 *     а линия глаз задана таблицей ниже (замер: строка с наибольшим числом тёмно-карих пикселей радужки в верхней половине кадра).
 *     Где высокий головной убор (колпак гнома, поварской колпак) при таком росте ушёл бы за верх холста, Бобёр уменьшается ровно настолько,
 *     чтобы убор поместился с отступом; так же — по ширине (палитра, сабля).
 *  3. Пишет WebP: <имя>.webp (512) и @512 (копия), @256, @1024 — как у скинов партии 2 (вариант `@w` выбирает lookAssetUrl).
 *
 * Какие предметы каталога — в docs/design/v20/skins/README.md; в маннифесте образа это `legacyCostume(...)` со статусом legacy-whole-look.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

/** Мастера лежат по пакетам владельца: v20 (2026-11-04) и v21 (2026-11-07: бариста и дракон); имя файла — имя костюма. */
const MASTER_DIRS = [new URL('../docs/design/v20/skins/', import.meta.url), new URL('../docs/design/v21/skins/', import.meta.url)];
const masterOf = (name) => {
  const url = MASTER_DIRS.map((d) => new URL(`${name}.webp`, d)).find((u) => existsSync(u));
  if (!url) throw new Error(`build-costume-art: мастера ${name}.webp нет ни в одном пакете (${MASTER_DIRS.map((d) => d.pathname).join(', ')})`);
  return url;
};
const OUT = new URL('../apps/web/src/assets/costumes/', import.meta.url);
const WAVE = new URL('../apps/web/src/assets/beaver/wave.webp', import.meta.url);

/** Имя файла (= asset_key без `costume-`) → линия глаз в пикселях мастера 1254. */
const EYE = {
  artist: 357,
  winter: 404,
  krasnal: 408,
  conductor: 382,
  chef: 486,
  syrenka: 377,
  'hat-krasnal': 540,
  'vest-krakowiak': 376,
  obwarzanek: 376,
  // Пакет 2026-11-07 (docs/design/v21/skins): новые картинки баристы и дракона заменяют прежние. Мой замер строки глаз даёт на 5–11 px ниже таблицы выше
  // (artist 362 против 357, krasnal 415 против 408), поэтому из замера вычтено 7 px.
  barista: 366,
  dragon: 407,
};
/** Линия глаз позы wave (1024): тот же замер. */
const WAVE_EYE = 289;
const MARGIN = 0.02; // доля холста: минимальный отступ сверху и по бокам

const args = process.argv.slice(2);
const sheetPath = args.includes('--sheet') ? args[args.indexOf('--sheet') + 1] : null;

async function load(source) {
  const { data, info } = await sharp(readFileSync(source)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { px: data, w: info.width, h: info.height };
}

function bbox({ px, w, h }, thr = 40) {
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (px[(y * w + x) * 4 + 3] > thr) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
  return { x0, y0, x1, y1 };
}

function dilate(mask, w, h, r) {
  const tmp = new Uint8Array(w * h);
  const out = new Uint8Array(w * h);
  const cs = new Int32Array(Math.max(w, h) + 1);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) cs[x + 1] = cs[x] + mask[y * w + x];
    for (let x = 0; x < w; x++) tmp[y * w + x] = cs[Math.min(w, x + r + 1)] - cs[Math.max(0, x - r)] > 0 ? 1 : 0;
  }
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) cs[y + 1] = cs[y] + tmp[y * w + x];
    for (let y = 0; y < h; y++) out[y * w + x] = cs[Math.min(h, y + r + 1)] - cs[Math.max(0, y - r)] > 0 ? 1 : 0;
  }
  return out;
}

/** Стереть полупрозрачное дальше `r` px от плотного силуэта (альфа ≥ 235). Возвращает число стёртых пикселей. */
function dropGhosts(img, r = 8) {
  const { px, w, h } = img;
  const core = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) core[i] = px[i * 4 + 3] >= 235 ? 1 : 0;
  const keep = dilate(core, w, h, r);
  let removed = 0;
  for (let i = 0; i < w * h; i++)
    if (!keep[i] && px[i * 4 + 3] > 0) {
      px[i * 4 + 3] = 0;
      removed++;
    }
  return removed;
}

const wave = await load(WAVE);
const wb = bbox(wave);
const target = { feet: wb.y1 / wave.w, eyeToFeet: (wb.y1 - WAVE_EYE) / wave.w };

const items = [];
for (const [name, eye] of Object.entries(EYE)) {
  const img = await load(masterOf(name));
  const cleaned = dropGhosts(img);
  const b = bbox(img);
  // Доли холста на пиксель мастера: рост как у wave, но не больше, чем позволяют верх и бока.
  const kHeight = target.eyeToFeet / (b.y1 - eye);
  const kTop = (target.feet - MARGIN) / (b.y1 - b.y0);
  const kWidth = (1 - 2 * MARGIN) / (b.x1 - b.x0);
  const k = Math.min(kHeight, kTop, kWidth);
  const t = { k, ox: 0.5 - (k * (b.x0 + b.x1)) / 2, oy: target.feet - k * b.y1 };
  items.push({ name, img, t, cleaned, limit: k === kHeight ? 'рост' : k === kTop ? 'верх' : 'ширина', scale: k / kHeight });
}

async function render(m, C) {
  const { k, ox, oy } = m.t;
  const rw = Math.round(m.img.w * k * C);
  const rh = Math.round(m.img.h * k * C);
  const left = Math.round(ox * C);
  const top = Math.round(oy * C);
  const sx = Math.max(0, -left), sy = Math.max(0, -top);
  const dx = Math.max(0, left), dy = Math.max(0, top);
  const cw = Math.min(rw - sx, C - dx), ch = Math.min(rh - sy, C - dy);
  const piece = await sharp(m.img.px, { raw: { width: m.img.w, height: m.img.h, channels: 4 } })
    .resize(rw, rh, { kernel: 'lanczos3' })
    .extract({ left: sx, top: sy, width: cw, height: ch })
    .raw()
    .toBuffer();
  return sharp({ create: { width: C, height: C, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite([
    { input: piece, raw: { width: cw, height: ch, channels: 4 }, left: dx, top: dy },
  ]);
}

mkdirSync(OUT, { recursive: true });
const rows = [];
let total = 0;
for (const m of items) {
  const sizes = [];
  const cache = new Map();
  for (const { C, file, q } of [
    { C: 512, file: `${m.name}.webp`, q: 90 },
    { C: 512, file: `${m.name}@512.webp`, q: 90 },
    { C: 256, file: `${m.name}@256.webp`, q: 86 },
    { C: 1024, file: `${m.name}@1024.webp`, q: 90 },
  ]) {
    if (!cache.has(C)) cache.set(C, await (await render(m, C)).webp({ quality: q, alphaQuality: 100, effort: 6 }).toBuffer());
    const buf = cache.get(C);
    writeFileSync(new URL(file, OUT), buf);
    total += buf.length;
    sizes.push(`${file.includes('@') ? file.split('@')[1].replace('.webp', '') : 'main'}: ${Math.round(buf.length / 1024)} КБ`);
  }
  rows.push(`${m.name.padEnd(16)} стёрто ${String(m.cleaned).padStart(6)} px  масштаб ${(m.scale * 100).toFixed(0)} % (${m.limit})  ${sizes.join(' · ')}`);
}
console.log(`Скинов: ${items.length}; WebP всего ${(total / 1048576).toFixed(2)} МБ\n${rows.join('\n')}`);

if (sheetPath) {
  const cell = 256;
  const tiles = [{ input: await sharp(readFileSync(WAVE)).resize(cell, cell).png().toBuffer(), left: 0, top: 0 }];
  for (const [i, m] of items.entries()) tiles.push({ input: await (await render(m, cell)).png().toBuffer(), left: ((i + 1) % 5) * cell, top: Math.floor((i + 1) / 5) * cell });
  const lines = [Math.round(target.feet * cell), Math.round((target.feet - target.eyeToFeet) * cell)];
  const guide = Buffer.from(
    `<svg width="${5 * cell}" height="${2 * cell}" xmlns="http://www.w3.org/2000/svg">${[0, 1].flatMap((r) => lines.map((y) => `<line x1="0" x2="${5 * cell}" y1="${r * cell + y}" y2="${r * cell + y}" stroke="#36d" stroke-width="1"/>`)).join('')}</svg>`,
  );
  await sharp({ create: { width: 5 * cell, height: 2 * cell, channels: 4, background: { r: 70, g: 72, b: 92, alpha: 1 } } })
    .composite([...tiles, { input: guide, left: 0, top: 0 }])
    .png()
    .toFile(sheetPath);
  console.log(`Лист: ${sheetPath}`);
}
