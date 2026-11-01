/**
 * Готовые образы Бобека (сочетания вещей) из мастеров владельца: docs/design/v18/bobek31/NN_<вещи>.webp.
 *
 *   node scripts/build-bobek-variants.mjs                 — собрать все образы в apps/web/src/assets/variants/
 *   node scripts/build-bobek-variants.mjs --sheet out.png  — + контрольный лист (24 образа на тёмном фоне, не в репозиторий)
 *   node scripts/build-bobek-variants.mjs --only refresh   — только одна серия (wave | open | jackets | refresh), для отладки очистки
 *
 * Три серии мастеров:
 *   01–16 — «wave»: 512×512 с прозрачностью, машет рукой с картой, все 16 сочетаний (худи + кепка/очки/шарф/рюкзак);
 *   24–31 — «open»: 1254×1254 на ровном бежевом фоне, руки разведены, 8 сочетаний;
 *   41–44 — «wave», вторая партия: 1254×1254 с прозрачностью, куртки поверх худи (джинсовая, дождевик), рюкзак на каждой картинке;
 *   61–66 — скины: цельные образы (куртка + головной убор + шарф или наушники), из партии 2; собираются как костюмы в assets/costumes;
 *   51–56 — «wave», третья партия: 1254×1254 на светлом фоне (вырезается), кепка с надписью PL, обновлённые и новые сочетания;
 *     кадр у каждой картинки свой, поэтому она ставится на холст по рамке образа-аналога (`LIKE`), а не по общему для серии преобразованию.
 * Мастера второй и третьей партий лежат в docs/design/v18/bobek-part2/ и bobek-part3/; образы, которые не используются (вещи вне каталога,
 * дубли, заменённые версии), — в подпапках held/ и superseded/ (не собираются, но хранятся).
 *
 * Что делает конвейер (оригиналы не меняются, всё воспроизводимо):
 *  1. Серия 24–31: вырезает фон заливкой от края кадра (белое внутри фигуры — шарф, зубы, буквы PL — остаётся) и убирает
 *     падающую тень: в серии 01–16 и в позах `beaver/*` её нет, образы должны лежать на карточке одинаково.
 *  2. Серия 01–16: убирает «призраков» — полупрозрачные разводы дальше 4 px от силуэта (в 09–16 они до 3800 px).
 *     Разводы внутри силуэта (призрак на щеке в 09) автоматически не лечатся — нужна ретушь, см. docs/BOBEK_VARIANTS.md.
 *  3. Ставит оба набора на общий квадратный холст так же, как у позы `beaver/wave` (стартовый образ): одинаковые масштаб,
 *     линия ног и центр. Преобразование одно на серию, а не на кадр, поэтому при смене вещи Бобек не «прыгает».
 *     Опорный кадр серии — то же сочетание, что у wave: худи + рюкзак (05 и 28).
 *  4. Пишет WebP: 01–16 — 512 и @256; 24–31 — 1024, @512 и @256 (вариант `@w` выбирает lookAssetUrl).
 *
 * Результат: apps/web/src/assets/variants/<вещи>_<поза>.webp. Таблица «набор вещей → файл» — в packages/shared/src/look/variants.ts.
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const MASTER_DIRS = ['bobek31', 'bobek-part2', 'bobek-part3'].map((d) => new URL(`../docs/design/v18/${d}/`, import.meta.url));
const WAVE = new URL('../apps/web/src/assets/beaver/wave.webp', import.meta.url);
const OUT = new URL('../apps/web/src/assets/variants/', import.meta.url);
const COSTUMES_OUT = new URL('../apps/web/src/assets/costumes/', import.meta.url);

/** Вещи в именах мастеров → id предметов каталога. Рюкзак «зелёный» — это backpack-travel. */
const ITEM_OF = {
  'hoodie-red': 'hoodie-red', 'jacket-denim': 'jacket-denim', 'jacket-rain': 'jacket-rain',
  'cap-red': 'cap-red', 'glasses-round': 'glasses-round', 'scarf-pl': 'scarf-pl', 'backpack-green': 'backpack-travel',
};
const SHORT = { 'hoodie-red': 'hoodie', 'jacket-denim': 'denim', 'jacket-rain': 'rain', 'cap-red': 'cap', 'glasses-round': 'glasses', 'scarf-pl': 'scarf', 'backpack-travel': 'pack' };
/** Порядок вещей в имени файла; совпадает с variants.ts (куртки поверх худи, затем голова, шея, рюкзак). */
const ORDER = ['hoodie-red', 'jacket-denim', 'jacket-rain', 'cap-red', 'glasses-round', 'scarf-pl', 'backpack-travel'];

/**
 * Серия по номеру мастера: поза, опорный кадр, размеры доставки. Главный файл — первый размер.
 * `ref` — кадр, который встаёт на рамку wave. Для серии 41–44 (куртки, 1254 px, альфа) опорный — 41: только куртка и рюкзак, без головного
 * убора, поэтому верх рамки — чубчик, как у 05 и 28. `ghostR` — на сколько пикселей от силуэта разводы ещё считаются кромкой.
 */
const SERIES = [
  { id: 'wave', pose: 'wave', from: 1, to: 16, ref: 5, sizes: [512, 256], clean: 'ghosts', ghostR: 4 },
  { id: 'open', pose: 'open', from: 24, to: 31, ref: 28, sizes: [1024, 512, 256], clean: 'matte' },
  { id: 'jackets', pose: 'wave', from: 41, to: 44, ref: 41, sizes: [1024, 512, 256], clean: 'ghosts', ghostR: 8 },
  // Третья партия: 1254×1254 на светлом фоне, кадрирование у каждой картинки своё (в предыдущих партиях было общее), поэтому преобразование
  // у каждой своё — по рамке образа-аналога (`LIKE` ниже), а не одно на серию.
  { id: 'refresh', pose: 'wave', from: 51, to: 56, sizes: [1024, 512, 256], clean: 'matte' },
  // Скины (цельные образы-костюмы, ADR-013): мастера из той же партии, что куртки (общий кадр, опорный кадр 41), но результат — файлы костюмов
  // apps/web/src/assets/costumes/<имя>.webp (512, как у прежних костюмов) и @256, @512, @1024 для BeaverLook.
  { id: 'skins', skin: true, from: 61, to: 66, ref: 41, clean: 'ghosts', ghostR: 8 },
];

const args = process.argv.slice(2);
const sheetPath = args.includes('--sheet') ? args[args.indexOf('--sheet') + 1] : null;

// ── Пиксели ──────────────────────────────────────────────────────────────────────────────────────────────────────

async function load(source) {
  const { data, info } = await sharp(readFileSync(source)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { px: data, w: info.width, h: info.height };
}

/** Рамка видимого (альфа > thr): { x0, y0, x1, y1 } включительно. */
function bbox({ px, w, h }, thr = 40) {
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (px[(y * w + x) * 4 + 3] > thr) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  return { x0, y0, x1, y1 };
}

/** Расширение маски на r пикселей (квадратное окно), через префиксные суммы: O(w·h). */
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

/** Серии 01–16 и 41–44: стереть полупрозрачные пятна дальше `r` px от плотного силуэта. Возвращает число стёртых пикселей. */
function dropGhosts(img, r = 4) {
  const { px, w, h } = img;
  const core = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) core[i] = px[i * 4 + 3] >= 235 ? 1 : 0;
  const keep = dilate(core, w, h, r);
  let removed = 0;
  for (let i = 0; i < w * h; i++) {
    if (!keep[i] && px[i * 4 + 3] > 0) {
      px[i * 4 + 3] = 0;
      removed++;
    }
  }
  return removed;
}

/** Серия 24–31: вырезать фон и падающую тень. Возвращает число прозрачных пикселей. */
function matte(img) {
  const { px, w, h } = img;
  // Цвет фона — медиана по рамке кадра (фон ровный, виньетка в пределах 2–3 единиц).
  const med = (c) => {
    const v = [];
    for (let x = 0; x < w; x += 7) v.push(px[x * 4 + c], px[((h - 1) * w + x) * 4 + c]);
    for (let y = 0; y < h; y += 7) v.push(px[y * w * 4 + c], px[(y * w + w - 1) * 4 + c]);
    return v.sort((a, b) => a - b)[v.length >> 1];
  };
  const bg = [med(0), med(1), med(2)];
  const dist = (p) => Math.max(Math.abs(px[p * 4] - bg[0]), Math.abs(px[p * 4 + 1] - bg[1]), Math.abs(px[p * 4 + 2] - bg[2]));
  const bgLike = (p) => dist(p) <= 14;
  // Тень — розовато-серая (R ≥ G ≈ B), светлее шерсти: у шерсти G и B расходятся. Но бледный контур белых вещей (бахрома
  // шарфа) по цвету похож на тень, и заливка через него съедала бахрому, — поэтому тень ищем только внизу кадра,
  // где она лежит под лапами (у серии 24–31 это нижние ~16 % высоты).
  const shadowTop = Math.floor(h * 0.84);
  const shadowLike = (p) => {
    if (p < shadowTop * w) return false;
    const r = px[p * 4], g = px[p * 4 + 1], b = px[p * 4 + 2];
    return Math.abs(g - b) <= 16 && r - g >= -4 && r - g <= 75 && 0.299 * r + 0.587 * g + 0.114 * b >= 90;
  };
  const gone = new Uint8Array(w * h);
  const queue = new Int32Array(w * h);
  let head = 0, tail = 0;
  const seed = (p) => {
    if (!gone[p] && (bgLike(p) || shadowLike(p))) {
      gone[p] = 1;
      queue[tail++] = p;
    }
  };
  for (let x = 0; x < w; x++) (seed(x), seed((h - 1) * w + x));
  for (let y = 0; y < h; y++) (seed(y * w), seed(y * w + w - 1));
  while (head < tail) {
    const p = queue[head++];
    const x = p % w;
    if (x > 0) seed(p - 1);
    if (x < w - 1) seed(p + 1);
    if (p >= w) seed(p - w);
    if (p < w * (h - 1)) seed(p + w);
  }
  // Кромка: пиксели рядом с вырезанным смешаны с фоном — делаем частично прозрачными и снимаем подмешанный цвет.
  let cleared = 0;
  for (let p = 0; p < w * h; p++) {
    if (gone[p]) {
      px[p * 4 + 3] = 0;
      cleared++;
      continue;
    }
    const x = p % w;
    const touches = (x > 0 && gone[p - 1]) || (x < w - 1 && gone[p + 1]) || (p >= w && gone[p - w]) || (p < w * (h - 1) && gone[p + w]);
    if (!touches) continue;
    const a = Math.min(1, Math.max(0.3, (dist(p) - 10) / 60));
    if (a < 1) {
      for (let c = 0; c < 3; c++) px[p * 4 + c] = Math.max(0, Math.min(255, Math.round((px[p * 4 + c] - (1 - a) * bg[c]) / a)));
      px[p * 4 + 3] = Math.round(a * 255);
    }
  }
  return cleared;
}

// ── Мастера ──────────────────────────────────────────────────────────────────────────────────────────────────────

/** `05_hoodie-red_backpack-green.webp` → { n: 5, items: ['backpack-travel', 'hoodie-red'], name: 'hoodie-pack' }. Прочие файлы (в `held/`, не по формату) пропускаются. */
function parse(file, dir) {
  const skin = /^(\d\d)_skin_([a-z-]+)\.webp$/.exec(file);
  if (skin) {
    const n = Number(skin[1]);
    const series = SERIES.find((x) => x.skin && n >= x.from && n <= x.to);
    if (!series) throw new Error(`${file}: номер ${n} вне серии скинов`);
    return { file, dir, n, series, skin: true, items: [], name: skin[2] };
  }
  const m = /^(\d\d)_(.+)\.webp$/.exec(file);
  if (!m) return null;
  const n = Number(m[1]);
  const series = SERIES.find((s) => !s.skin && n >= s.from && n <= s.to);
  if (!series) return null;
  const items = m[2].split('_').map((k) => {
    if (!ITEM_OF[k]) throw new Error(`${file}: неизвестная вещь «${k}»`);
    return ITEM_OF[k];
  });
  const ordered = ORDER.filter((id) => items.includes(id));
  if (ordered.length !== items.length || !ordered.includes('hoodie-red')) throw new Error(`${file}: ожидаю худи и неповторяющиеся вещи`);
  return { file, dir, n, series, items: [...ordered].sort(), name: ordered.map((id) => SHORT[id]).join('-') };
}

/**
 * Третья партия (51–55) кадрирована у каждой картинки по-своему, поэтому она ставится по рамке уже поставленного образа того же сочетания:
 * общие ориентиры — верх (кепка или чубчик) и низ (ступни). Масштаб — по высоте рамки, сдвиг — по низу и середине рамки.
 *   51 ← 42 джинсовая + кепка + очки + рюкзак, 52 ← 16 кепка + очки + шарф + рюкзак, 54 ← 14 кепка + очки + рюкзак, 55 ← 44 дождевик + очки + рюкзак;
 *   53 (дождевик + кепка + очки + рюкзак) аналога не имеет: ставится по 54 — то же сочетание без дождевика, одна и та же генерация.
 * Мастер, у которого тот же образ выпускает мастер с большим номером, заменён: файлы не пишутся, но он остаётся ориентиром.
 */
const LIKE = { 51: 42, 52: 16, 53: 54, 54: 14, 55: 44 };

const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
const all = MASTER_DIRS.flatMap((dir) => readdirSync(dir).map((file) => parse(file, dir))).filter(Boolean).sort((a, b) => a.n - b.n);
const byN = new Map(all.map((m) => [m.n, m]));
const keyOf = (m) => (m.skin ? `skin:${m.name}` : `${m.name}_${m.series.pose}`);
const winner = new Map();
for (const m of all) winner.set(keyOf(m), m);
const masters = all.filter((m) => winner.get(keyOf(m)) === m && (!only || m.series.id === only));
const superseded = all.filter((m) => winner.get(keyOf(m)) !== m);
const waveRef = await load(WAVE);
const waveBox = bbox(waveRef);
const target = { h: waveBox.y1 - waveBox.y0, bottom: waveBox.y1, cx: (waveBox.x0 + waveBox.x1) / 2, canvas: waveRef.w };

async function prepare(m) {
  if (m.img) return;
  m.img = await load(new URL(m.file, m.dir));
  m.cleaned = m.series.clean === 'matte' ? matte(m.img) : dropGhosts(m.img, m.series.ghostR);
  m.box = bbox(m.img);
}

/** Масштаб и сдвиг (в долях холста): по опорному кадру серии, а для `LIKE` — по рамке образа-аналога на холсте. */
async function transformOf(m) {
  if (m.t) return m.t;
  await prepare(m);
  if (LIKE[m.n]) {
    const like = byN.get(LIKE[m.n]);
    if (!like) throw new Error(`${m.file}: нет мастера-аналога ${LIKE[m.n]}`);
    const t = await transformOf(like);
    const top = t.oy + t.k * like.box.y0;
    const bottom = t.oy + t.k * like.box.y1;
    const cx = t.ox + (t.k * (like.box.x0 + like.box.x1)) / 2;
    const k = (bottom - top) / (m.box.y1 - m.box.y0);
    m.t = { k, ox: cx - (k * (m.box.x0 + m.box.x1)) / 2, oy: bottom - k * m.box.y1 };
  } else {
    const s = m.series;
    if (!s.t) {
      // Одно преобразование на серию: опорный кадр встаёт на рамку wave.
      const ref = byN.get(s.ref);
      if (!ref) throw new Error(`Нет опорного мастера ${s.ref}`);
      await prepare(ref);
      const k = target.h / (ref.box.y1 - ref.box.y0) / target.canvas; // доли холста wave на пиксель мастера
      s.t = { k, ox: target.cx / target.canvas - (k * (ref.box.x0 + ref.box.x1)) / 2, oy: target.bottom / target.canvas - k * ref.box.y1 };
    }
    m.t = s.t;
  }
  return m.t;
}
for (const m of masters) await transformOf(m);

/** Холст C×C: исходник масштабируется до долей холста и кладётся с обрезкой краёв. */
async function render(m, C) {
  const { k, ox, oy } = m.t;
  const rw = Math.max(1, Math.round(m.img.w * k * C));
  const rh = Math.max(1, Math.round(m.img.h * k * C));
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
  return sharp({ create: { width: C, height: C, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: piece, raw: { width: cw, height: ch, channels: 4 }, left: dx, top: dy }]);
}

mkdirSync(OUT, { recursive: true });
mkdirSync(COSTUMES_OUT, { recursive: true });
/** Файлы мастера: образы — главный (первый размер) и @размер; скины — как прежние костюмы: <имя>.webp (512), @256, @512 (копия главного), @1024. */
const outputsOf = (m) =>
  m.skin
    ? [{ C: 512, file: `${m.name}.webp`, q: 90 }, { C: 512, file: `${m.name}@512.webp`, q: 90 }, { C: 256, file: `${m.name}@256.webp`, q: 86 }, { C: 1024, file: `${m.name}@1024.webp`, q: 90 }]
    : m.series.sizes.map((C, i) => ({ C, file: `${m.name}_${m.series.pose}${i === 0 ? '' : `@${C}`}.webp`, q: i === 0 ? 90 : 86 }));
let total = 0;
const rows = [];
for (const m of masters) {
  const sizes = [];
  const cache = new Map();
  for (const { C, file, q } of outputsOf(m)) {
    const key = `${C}:${q}`;
    if (!cache.has(key)) cache.set(key, await (await render(m, C)).webp({ quality: q, alphaQuality: 100, effort: 6 }).toBuffer());
    const buf = cache.get(key);
    writeFileSync(new URL(file, m.skin ? COSTUMES_OUT : OUT), buf);
    total += buf.length;
    sizes.push(`${file.includes('@') ? file.split('@')[1].replace('.webp', '') : 'main'}: ${Math.round(buf.length / 1024)} КБ`);
  }
  rows.push(`${String(m.n).padStart(2, '0')} ${m.name.padEnd(30)} ${(m.skin ? 'skin' : m.series.pose).padEnd(5)} стёрто ${String(m.cleaned).padStart(6)} px   ${sizes.join(' · ')}`);
}
console.log(`Образов: ${masters.length}; WebP всего ${(total / 1048576).toFixed(2)} МБ\n${rows.join('\n')}`);
console.log(`Рамка wave: ${target.canvas} px, высота ${target.h}, низ ${target.bottom}, центр ${target.cx}`);
if (superseded.length) console.log(`Заменены более поздними мастерами (не пишутся, остаются ориентирами): ${superseded.map((m) => `${String(m.n).padStart(2, '0')} ${m.name}`).join(', ')}`);

if (sheetPath) {
  // Контрольный лист: главные файлы серий в 4 ряда по 6 на тёмном фоне, линия ног и рамка wave видны сразу.
  const cell = 256, cols = 6;
  const tiles = [];
  for (const [i, m] of masters.entries()) {
    const buf = await (await render(m, cell)).png().toBuffer();
    tiles.push({ input: buf, left: (i % cols) * cell, top: Math.floor(i / cols) * cell });
  }
  const rowsN = Math.ceil(masters.length / cols);
  await sharp({ create: { width: cols * cell, height: rowsN * cell, channels: 4, background: { r: 70, g: 72, b: 92, alpha: 1 } } }).composite(tiles).png().toFile(sheetPath);
  console.log(`Лист: ${sheetPath}`);
}
