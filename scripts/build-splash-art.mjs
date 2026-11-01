/**
 * Слои экрана загрузки (мастера владельца 2026-11-01: docs/design/v19/loading/) → ассеты приложения.
 *
 *   node scripts/build-splash-art.mjs                 — собрать все темы (royal, sunset, adventure)
 *   node scripts/build-splash-art.mjs --only royal    — одну тему
 *   node scripts/build-splash-art.mjs --sheet out.png — + контрольный лист (покой / Бобек сдвинут / логотип в начале появления)
 *
 * Тема «soft» («Мягкий», Бобек заметно размытее остальных) по решению владельца не берётся: ни мастеров, ни сборки.
 * Мастера «чистые фоны» из архива не чистые (владелец это знает, README архива: «фон восстановлен ориентировочно»): на месте логотипа, Бобека
 * и карточки прогресса остались призраки — полупрозрачный силуэт логотипа, размытые «следы» Бобека (контур, лапы), смазанная плита карточки с
 * контуром стекла. Пока слои стоят на месте, их не видно, но у Бобека есть покачивание, а у логотипа появление — призраки вылезают из-под слоёв.
 * Конвейер перерисовывает три зоны (оригиналы не меняются, всё воспроизводимо):
 *  1. логотип: небо под ним (и вокруг на 14 px) заполняется гладкой интерполяцией по окружению (push-pull);
 *  2. Бобек: вокруг силуэта настоящая сцена берётся из оригинального композита (у «чистого» фона там шов от нейро-заливки), а полоса
 *     «9 px снаружи … 14 px внутрь силуэта» (столько Бобек может сдвинуться при покачивании) заполняется продолжением цветов снаружи внутрь
 *     с тангенциальным сглаживанием — без шва и без бледного ореола, а покачивание не обнажает ни контур, ни лапы;
 *  3. карточка: полоса y 1226…1582 на всю ширину — интерполяция + настоящая брусчатка из чистой нижней полосы кадра, зеркально (чем ближе к
 *     низу, тем больше): сверху вплотную к лапам остаются тень и мягкий свет.
 * Результат: bg.webp (941 px, как исходник), bg@640.webp, bobek.webp, logo.webp (RGBA) в apps/web/src/assets/splash/royal/ и
 * apps/web/src/dev/splash-themes/<тема>/; положение слоёв (кадр 941×1672) — в apps/web/src/lib/splashArt.ts.
 */
import { mkdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const SRC = new URL('../docs/design/v19/loading/', import.meta.url);
/** royal — рабочая тема (в сборку); остальные — только для разработки и QA (`?splash=<тема>`): вне src/assets, иначе lib/assets.ts (glob) втянул бы их в production. */
const OUT_APP = new URL('../apps/web/src/assets/splash/', import.meta.url);
const OUT_DEV = new URL('../apps/web/src/dev/splash-themes/', import.meta.url);
const W = 941;
const H = 1672;

/** Положение слоёв в кадре 941×1672: [x, y, ширина, высота] — из loading.js архива. */
const THEMES = {
  sunset: { bobek: [200, 624, 509, 567], logo: [112, 135, 728, 197] },
  adventure: { bobek: [167, 577, 552, 603], logo: [95, 117, 749, 204] },
  royal: { bobek: [168, 640, 528, 560], logo: [133, 151, 696, 179] },
};
const R_LOGO = 14;
/** Запас покачивания Бобека: на столько пикселей он выходит за свой силуэт (CSS: ≤ 8 px вверх + масштаб 1.012). */
const R_OUT = 9;
const R_IN = 14;
/** Область, где вместо «чистого» фона берётся оригинальный композит (там нет шва от заливки). */
const R_REAL = 40;
const CARD = { y0: 1226, y1: 1582 };

const args = process.argv.slice(2);
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
const sheetPath = args.includes('--sheet') ? args[args.indexOf('--sheet') + 1] : null;

// ── Пиксели ──────────────────────────────────────────────────────────────────────────────────────────────────────

async function loadRGB(file) {
  const { data, info } = await sharp(readFileSync(file)).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  if (info.width !== W || info.height !== H) throw new Error(`${file}: ожидаю ${W}×${H}, получил ${info.width}×${info.height}`);
  const px = new Float32Array(W * H * 3);
  for (let i = 0; i < px.length; i++) px[i] = data[i];
  return px;
}

/** Маска «спрайт занимает пиксель кадра»: альфа > 8 слоя, положенного в точку (x, y). */
async function alphaMask(file, [x, y, w, h]) {
  const { data, info } = await sharp(readFileSync(file)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  if (info.width !== w || info.height !== h) throw new Error(`${file}: ${info.width}×${info.height}, в геометрии ${w}×${h}`);
  const m = new Uint8Array(W * H);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (data[(j * w + i) * 4 + 3] > 8 && y + j >= 0 && y + j < H && x + i >= 0 && x + i < W) m[(y + j) * W + x + i] = 1;
  return m;
}

/** Расширение маски на r пикселей (квадратное окно), через префиксные суммы. */
function dilate(mask, r) {
  const tmp = new Uint8Array(W * H);
  const out = new Uint8Array(W * H);
  const cs = new Int32Array(Math.max(W, H) + 1);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) cs[x + 1] = cs[x] + mask[y * W + x];
    for (let x = 0; x < W; x++) tmp[y * W + x] = cs[Math.min(W, x + r + 1)] - cs[Math.max(0, x - r)] > 0 ? 1 : 0;
  }
  for (let x = 0; x < W; x++) {
    for (let y = 0; y < H; y++) cs[y + 1] = cs[y] + tmp[y * W + x];
    for (let y = 0; y < H; y++) out[y * W + x] = cs[Math.min(H, y + r + 1)] - cs[Math.max(0, y - r)] > 0 ? 1 : 0;
  }
  return out;
}

const erode = (mask, r) => {
  const inv = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) inv[i] = mask[i] ? 0 : 1;
  const d = dilate(inv, r);
  for (let i = 0; i < W * H; i++) inv[i] = d[i] ? 0 : 1;
  return inv;
};

/**
 * Заполнение полосы продолжением цветов снаружи: сначала цвет ближайшего известного пикселя (волна от границы), затем сглаживание
 * (Якоби по восьми соседям) только внутри полосы: граница с известным не двигается, поэтому шва нет, а вдоль границы цвета перемешиваются.
 * Пиксели вне полосы и вне известных (глубоко под спрайтом) в расчёте не участвуют.
 */
function bandFill(px, known, zone, iterations = 40) {
  const q = new Int32Array(W * H);
  let head = 0, tail = 0;
  const done = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) if (known[i]) done[i] = 1;
  // Начальная волна: известные пиксели, соседствующие с полосой.
  const near = (i, f) => {
    const x = i % W, y = (i / W) | 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx, ny = y + dy;
      if ((dx || dy) && nx >= 0 && nx < W && ny >= 0 && ny < H) f(ny * W + nx);
    }
  };
  for (let i = 0; i < W * H; i++) if (zone[i] && !known[i]) near(i, (j) => { if (known[j] && done[j] === 1) { done[j] = 2; q[tail++] = j; } });
  while (head < tail) {
    const j = q[head++];
    near(j, (n) => {
      if (zone[n] && !known[n] && done[n] === 0) {
        done[n] = 1;
        for (let k = 0; k < 3; k++) px[n * 3 + k] = px[j * 3 + k];
        q[tail++] = n;
      }
    });
  }
  const idx = [];
  for (let i = 0; i < W * H; i++) if (zone[i] && !known[i]) idx.push(i);
  const next = new Float32Array(idx.length * 3);
  for (let it = 0; it < iterations; it++) {
    for (let n = 0; n < idx.length; n++) {
      const i = idx[n], x = i % W, y = (i / W) | 0;
      let s0 = 0, s1 = 0, s2 = 0, c = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
        const j = ny * W + nx;
        if (!known[j] && !zone[j]) continue;
        s0 += px[j * 3]; s1 += px[j * 3 + 1]; s2 += px[j * 3 + 2]; c++;
      }
      next[n * 3] = s0 / c; next[n * 3 + 1] = s1 / c; next[n * 3 + 2] = s2 / c;
    }
    for (let n = 0; n < idx.length; n++) { px[idx[n] * 3] = next[n * 3]; px[idx[n] * 3 + 1] = next[n * 3 + 1]; px[idx[n] * 3 + 2] = next[n * 3 + 2]; }
  }
}

/** Push-pull: гладко заполняет неизвестные пиксели по известным (пирамида из усреднений, затем подъём с билинейной подмешкой). */
function pushPull(px, known) {
  const levels = [{ w: W, h: H, c: new Float32Array(W * H * 3), a: Float32Array.from(known) }];
  for (let i = 0; i < W * H; i++) if (known[i]) for (let k = 0; k < 3; k++) levels[0].c[i * 3 + k] = px[i * 3 + k];
  while (levels[levels.length - 1].w > 1 || levels[levels.length - 1].h > 1) {
    const p = levels[levels.length - 1];
    const nw = (p.w + 1) >> 1, nh = (p.h + 1) >> 1;
    const c = new Float32Array(nw * nh * 3), a = new Float32Array(nw * nh);
    for (let y = 0; y < nh; y++) {
      for (let x = 0; x < nw; x++) {
        let sa = 0, s0 = 0, s1 = 0, s2 = 0;
        for (let dy = 0; dy < 2; dy++) {
          for (let dx = 0; dx < 2; dx++) {
            const sx = Math.min(p.w - 1, 2 * x + dx), sy = Math.min(p.h - 1, 2 * y + dy);
            const j = sy * p.w + sx;
            sa += p.a[j]; s0 += p.c[j * 3]; s1 += p.c[j * 3 + 1]; s2 += p.c[j * 3 + 2];
          }
        }
        const o = y * nw + x;
        a[o] = sa / 4; c[o * 3] = s0 / 4; c[o * 3 + 1] = s1 / 4; c[o * 3 + 2] = s2 / 4;
      }
    }
    levels.push({ w: nw, h: nh, c, a });
  }
  const top = levels[levels.length - 1];
  if (!(top.a[0] > 0)) throw new Error('push-pull: нет известных пикселей');
  let est = new Float32Array(3);
  for (let k = 0; k < 3; k++) est[k] = top.c[k] / top.a[0];
  let ew = 1, eh = 1;
  for (let l = levels.length - 2; l >= 0; l--) {
    const lev = levels[l];
    const out = new Float32Array(lev.w * lev.h * 3);
    for (let y = 0; y < lev.h; y++) {
      const fy = Math.min(eh - 1, Math.max(0, (y + 0.5) / 2 - 0.5));
      const y0 = Math.floor(fy), y1 = Math.min(eh - 1, y0 + 1), ty = fy - y0;
      for (let x = 0; x < lev.w; x++) {
        const fx = Math.min(ew - 1, Math.max(0, (x + 0.5) / 2 - 0.5));
        const x0 = Math.floor(fx), x1 = Math.min(ew - 1, x0 + 1), tx = fx - x0;
        const o = y * lev.w + x;
        const wgt = Math.min(1, lev.a[o]);
        for (let k = 0; k < 3; k++) {
          const up =
            (est[(y0 * ew + x0) * 3 + k] * (1 - tx) + est[(y0 * ew + x1) * 3 + k] * tx) * (1 - ty) +
            (est[(y1 * ew + x0) * 3 + k] * (1 - tx) + est[(y1 * ew + x1) * 3 + k] * tx) * ty;
          const own = lev.a[o] > 0 ? lev.c[o * 3 + k] / lev.a[o] : up;
          out[o * 3 + k] = wgt * own + (1 - wgt) * up;
        }
      }
    }
    est = out; ew = lev.w; eh = lev.h;
  }
  return est;
}

/** Размытие RGB (для выделения мелкой фактуры): через sharp, 8 бит достаточно. */
async function blurRGB(px, sigma) {
  const u8 = Uint8Array.from(px, (v) => Math.max(0, Math.min(255, Math.round(v))));
  const { data } = await sharp(u8, { raw: { width: W, height: H, channels: 3 } }).blur(sigma).raw().toBuffer({ resolveWithObject: true });
  return Float32Array.from(data);
}

const reflect = (i, period) => {
  const m = ((i % (2 * period)) + 2 * period) % (2 * period);
  return m < period ? m : 2 * period - 1 - m;
};

// ── Сборка темы ─────────────────────────────────────────────────────────────────────────────────────────────────

const ORIGINAL = { sunset: '01_sunset_original', adventure: '03_adventure_original', royal: '04_royal_original' };

async function buildTheme(name) {
  const g = THEMES[name];
  const px = await loadRGB(new URL(`${name}_background_clean.jpg`, SRC));
  const orig = await loadRGB(new URL(`originals/${ORIGINAL[name]}.webp`, SRC));
  const logoMask = await alphaMask(new URL(`${name}_logo.webp`, SRC), g.logo);
  const bobekMask = await alphaMask(new URL(`${name}_bobek.webp`, SRC), g.bobek);

  // 2. Бобек: вокруг силуэта настоящая сцена из оригинала; полоса покачивания — продолжением цветов снаружи.
  const real = dilate(bobekMask, R_REAL);
  for (let i = 0; i < W * H; i++) if (real[i]) for (let k = 0; k < 3; k++) px[i * 3 + k] = orig[i * 3 + k];
  const outer = dilate(bobekMask, R_OUT);
  const inner = erode(bobekMask, R_IN);
  const zoneB = new Uint8Array(W * H), knownB = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) {
    if (outer[i] && !inner[i]) zoneB[i] = 1;
    else if (!outer[i]) knownB[i] = 1;
  }
  bandFill(px, knownB, zoneB);

  // 1. Логотип: небо вокруг и под ним — интерполяция по окружению.
  const holeA = dilate(logoMask, R_LOGO);
  const knownA = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) knownA[i] = holeA[i] ? 0 : 1;
  const fillA = pushPull(px, knownA);
  for (let i = 0; i < W * H; i++) if (holeA[i]) for (let k = 0; k < 3; k++) px[i * 3 + k] = fillA[i * 3 + k];

  // 3. Карточка: интерполяция плюс настоящая брусчатка из чистой нижней полосы (зеркально, влево-вправо тоже: цветы справа внизу не берём).
  const knownC = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) if (y < CARD.y0 || y >= CARD.y1) for (let x = 0; x < W; x++) knownC[y * W + x] = 1;
  const fillC = pushPull(px, knownC);
  const strip0 = CARD.y1 + 2, S = H - strip0, SX = 560;
  for (let y = CARD.y0; y < CARD.y1; y++) {
    const sy = strip0 + reflect(CARD.y1 - 1 - y, S);
    const t = (y - CARD.y0) / (CARD.y1 - CARD.y0);
    const m = 0.2 + 0.8 * t;
    for (let x = 0; x < W; x++) {
      const sx = reflect(x, SX);
      for (let k = 0; k < 3; k++) px[(y * W + x) * 3 + k] = fillC[(y * W + x) * 3 + k] * (1 - m) + px[(sy * W + sx) * 3 + k] * m;
    }
  }

  const bu8 = new Uint8Array(W * H * 3);
  for (let i = 0; i < W * H * 3; i++) bu8[i] = Math.max(0, Math.min(255, Math.round(px[i])));
  const dir = new URL(`${name}/`, name === 'royal' ? OUT_APP : OUT_DEV);
  mkdirSync(dir, { recursive: true });
  const base = sharp(bu8, { raw: { width: W, height: H, channels: 3 } });
  const bg = await base.clone().webp({ quality: 82, effort: 6 }).toBuffer();
  const bg640 = await base.clone().resize(640, Math.round((640 * H) / W), { kernel: 'lanczos3' }).webp({ quality: 80, effort: 6 }).toBuffer();
  const bobek = await sharp(readFileSync(new URL(`${name}_bobek.webp`, SRC))).webp({ quality: 92, alphaQuality: 100, effort: 6 }).toBuffer();
  const logo = await sharp(readFileSync(new URL(`${name}_logo.webp`, SRC))).webp({ quality: 92, alphaQuality: 100, effort: 6 }).toBuffer();
  const files = { 'bg.webp': bg, 'bg@640.webp': bg640, 'bobek.webp': bobek, 'logo.webp': logo };
  const sizes = [];
  for (const [file, buf] of Object.entries(files)) {
    await sharp(buf).toFile(new URL(file, dir).pathname);
    sizes.push(`${file} ${Math.round(buf.length / 1024)} КБ`);
  }
  console.log(`${name.padEnd(10)} логотип ${holeA.reduce((n, v) => n + v, 0)} px, полоса Бобека ${zoneB.reduce((n, v) => n + v, 0)} px · ${sizes.join(' · ')}`);
  return { name, bg, g };
}

const names = Object.keys(THEMES).filter((n) => !only || n === only);
const built = [];
for (const n of names) built.push(await buildTheme(n));
console.log(`Тем: ${built.length}. Геометрия слоёв (проценты кадра ${W}×${H}) живёт в apps/web/src/lib/splashArt.ts`);

if (sheetPath) {
  // Контрольный лист: для каждой темы — покой, Бобек на 10 px выше и логотип на 15 px выше (начало появления); кадры по 470 px шириной.
  const cell = 470, ch = Math.round((cell * H) / W);
  const tiles = [];
  for (const [i, { name, bg, g }] of built.entries()) {
    const scale = cell / W;
    const layer = async (file, box, dx, dy) => {
      const w = Math.round(box[2] * scale), h = Math.round(box[3] * scale);
      const input = await sharp(readFileSync(new URL(file, SRC))).resize(w, h).png().toBuffer();
      return { input, left: Math.round(box[0] * scale + dx), top: Math.round(box[1] * scale + dy) };
    };
    const base = await sharp(bg).resize(cell, ch).png().toBuffer();
    for (const [j, v] of [{ bx: 0, by: 0, ly: 0 }, { bx: 0, by: -10, ly: -15 }].entries()) {
      const bobek = await layer(`${name}_bobek.webp`, g.bobek, v.bx * scale, v.by * scale);
      const logo = await layer(`${name}_logo.webp`, g.logo, 0, v.ly * scale);
      const img = await sharp(base).composite([logo, bobek]).png().toBuffer();
      tiles.push({ input: img, left: (i * 2 + j) * cell, top: 0 });
    }
  }
  await sharp({ create: { width: cell * built.length * 2, height: ch, channels: 3, background: { r: 20, g: 24, b: 40 } } }).composite(tiles).png().toFile(sheetPath);
  console.log(`Лист: ${sheetPath}`);
}
