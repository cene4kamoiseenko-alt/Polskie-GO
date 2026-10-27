/**
 * Прототип единого Бобека на слоях (ADR-005, вариант B) из СУЩЕСТВУЮЩИХ живописных поз — не новая графика.
 *
 *   node scripts/look-prototype.mjs
 *
 * Зачем: живописных слоёв базы ещё нет (LOOK_MANIFEST.base.status = 'pending'), а механику смены одежды, крепления
 * головного убора и очков, анимаций и сохранения нужно проверить на настоящем рендерере (BeaverLook + resolveLook).
 * Это прототип механики. Финальная модель рисуется по листам эталона (docs/UNFINISHED_ASSETS.md, раздел 4).
 *
 * Что делает:
 *  1. Каждую позу apps/web/src/assets/beaver/<поза>.webp (худи и рюкзак в них впечатаны) делит по цвету на
 *     непересекающиеся слои: мех и морда (body), одежда (красные пиксели худи + то, что они окружают: буквы PL),
 *     рюкзак (зелёные пиксели + пряжки). Сложенные вместе слои дают исходную картинку пиксель в пиксель.
 *  2. Ставит позы на общий холст 1024 по глазам: середина глаз → (512, 330), расстояние между глазами одинаково,
 *     поэтому голова одного размера во всех позах, а кепка и очки садятся на одни и те же якоря.
 *  3. «Синяя куртка» — та же маска одежды, перекрашенная в синий (тон 215°, яркость и тени сохранены).
 *     Это прототип: по форме это худи, а не нарисованная куртка.
 *  4. Кепка и очки отрисованы здесь (SVG → растр): живописных вещей нет, а кепку с доски tg-travel-passport вырезать
 *     нельзя (ракурс 3/4, козырёк сбоку, хохолок поверх). Это заглушки прототипа, не стиль финальных вещей.
 *  5. Для позы wave поднятая лапа — отдельный слой с точкой поворота в плече (анимация «машет»).
 *  6. Для моргания — слой век на каждой позе (цвет меха вокруг глаза + тёмная дуга).
 * Результат: apps/web/src/dev/look-proto/ (WebP 1024 и @512) и meta.json для прототипного манифеста.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const ROOT = new URL('../', import.meta.url);
const OUT = new URL('apps/web/src/dev/look-proto/', ROOT);
const CANVAS = 1024;
const EYES_AT = { x: 512, y: 330 };

/**
 * Позы прототипа. eyes — центры глаз в пикселях исходника, если автоматический поиск не годится (подмигивание).
 * arm — многоугольник поднятой лапы и точка плеча (пиксели исходника) для анимации.
 */
const POSES = {
  idle: { file: 'front', eyes: [[254, 153], [367, 146]] },
  wave: {
    file: 'wave',
    eyes: [[368, 232], [507, 212]],
    arm: { pivot: [574, 428], poly: [[540, 430], [556, 452], [612, 452], [640, 425], [705, 340], [708, 278], [668, 250], [618, 262], [588, 300], [560, 345], [538, 395]] },
  },
  think: { file: 'think', eyes: [[388, 234], [526, 190]] },
  // Подмигивание: правый глаз уже закрыт — моргает только левый.
  happy: { file: 'correct', eyes: [[224, 153], [335, 140]], blink: [0] },
  celebrate: { file: 'celebrate', eyes: [[355, 225], [498, 196]] },
};

// ── пиксели ────────────────────────────────────────────────────────────────────────────────
async function load(file) {
  const { data, info } = await sharp(readFileSync(file)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}

function hsv(r, g, b) {
  const mx = Math.max(r, g, b) / 255;
  const mn = Math.min(r, g, b) / 255;
  const d = mx - mn;
  let h = 0;
  if (d > 1e-6) {
    const R = r / 255, G = g / 255, B = b / 255;
    if (mx === R) h = (((G - B) / d) % 6) * 60;
    else if (mx === G) h = ((B - R) / d + 2) * 60;
    else h = ((R - G) / d + 4) * 60;
    if (h < 0) h += 360;
  }
  return [h, mx > 0 ? d / mx : 0, mx];
}

function hsvToRgb(h, s, v) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

/** Компоненты связности (4-связность) маски; возвращает метки и площади. */
function components(mask, w, h) {
  const label = new Int32Array(w * h).fill(-1);
  const sizes = [];
  const sums = [];
  const stack = [];
  for (let i = 0; i < w * h; i++) {
    if (!mask[i] || label[i] !== -1) continue;
    const id = sizes.length;
    let n = 0, sx = 0, sy = 0;
    stack.push(i);
    label[i] = id;
    while (stack.length) {
      const p = stack.pop();
      n++;
      sx += p % w;
      sy += (p / w) | 0;
      const x = p % w;
      for (const q of [p - 1, p + 1, p - w, p + w]) {
        if (q < 0 || q >= w * h) continue;
        if ((q === p - 1 && x === 0) || (q === p + 1 && x === w - 1)) continue;
        if (mask[q] && label[q] === -1) {
          label[q] = id;
          stack.push(q);
        }
      }
    }
    sizes.push(n);
    sums.push([sx / n, sy / n]);
  }
  return { label, sizes, centroids: sums };
}

/** Заполнить дыры: области вне маски, недостижимые с края изображения через пиксели вне маски. */
function fillHoles(mask, w, h) {
  const outside = new Uint8Array(w * h);
  const stack = [];
  for (let x = 0; x < w; x++) for (const y of [0, h - 1]) if (!mask[y * w + x]) stack.push(y * w + x);
  for (let y = 0; y < h; y++) for (const x of [0, w - 1]) if (!mask[y * w + x]) stack.push(y * w + x);
  for (const p of stack) outside[p] = 1;
  while (stack.length) {
    const p = stack.pop();
    const x = p % w;
    for (const q of [p - 1, p + 1, p - w, p + w]) {
      if (q < 0 || q >= w * h) continue;
      if ((q === p - 1 && x === 0) || (q === p + 1 && x === w - 1)) continue;
      if (!mask[q] && !outside[q]) {
        outside[q] = 1;
        stack.push(q);
      }
    }
  }
  const out = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) out[i] = mask[i] || !outside[i] ? 1 : 0;
  return out;
}

function dilate(mask, w, h, r) {
  let cur = mask;
  for (let k = 0; k < r; k++) {
    const next = new Uint8Array(cur);
    for (let i = 0; i < w * h; i++) {
      if (cur[i]) continue;
      const x = i % w;
      if ((x > 0 && cur[i - 1]) || (x < w - 1 && cur[i + 1]) || (i >= w && cur[i - w]) || (i < w * (h - 1) && cur[i + w])) next[i] = 1;
    }
    cur = next;
  }
  return cur;
}

function inPolygon(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Слой: копия пикселей исходника по маске (остальное прозрачно); recolor — функция пикселя. */
function layer(src, mask, recolor) {
  const out = Buffer.alloc(src.w * src.h * 4);
  for (let i = 0; i < src.w * src.h; i++) {
    if (!mask[i]) continue;
    let r = src.data[i * 4], g = src.data[i * 4 + 1], b = src.data[i * 4 + 2];
    if (recolor) [r, g, b] = recolor(r, g, b);
    out[i * 4] = r;
    out[i * 4 + 1] = g;
    out[i * 4 + 2] = b;
    out[i * 4 + 3] = src.data[i * 4 + 3];
  }
  return out;
}

const isRed = (h, s, v) => (h < 16 || h > 338) && s > 0.42 && v > 0.25;
const isGreen = (h, s, v) => h > 110 && h < 205 && s > 0.2 && v > 0.1;

/** Красное худи → синяя «куртка»: тон 215°, насыщенность чуть ниже, тени и блики сохранены. */
function denim(r, g, b) {
  const [h, s, v] = hsv(r, g, b);
  if (!(h < 22 || h > 330) || s < 0.22) return [r, g, b];
  return hsvToRgb(214, Math.min(1, s * 0.78), Math.min(1, v * 0.82));
}

/** Глаза: две крупнейшие тёмные области в верхней половине фигуры. */
function findEyes(src, alpha) {
  const { w, h } = src;
  let top = h;
  let bottom = 0;
  for (let i = 0; i < w * h; i++) if (alpha[i]) {
    const y = (i / w) | 0;
    if (y < top) top = y;
    if (y > bottom) bottom = y;
  }
  const dark = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    if (!alpha[i]) continue;
    const y = (i / w) | 0;
    if (y > top + (bottom - top) * 0.45) continue;
    const [, , v] = hsv(src.data[i * 4], src.data[i * 4 + 1], src.data[i * 4 + 2]);
    if (v < 0.24) dark[i] = 1;
  }
  const filled = fillHoles(dark, w, h); // блики внутри зрачка
  const { sizes, centroids } = components(filled, w, h);
  const order = sizes.map((n, i) => [n, i]).sort((a, b) => b[0] - a[0]).slice(0, 3);
  // Нос — тёмный, ниже глаз и между ними; глаза — две крупнейшие области примерно на одной высоте.
  const [a, b] = order.slice(0, 2).map(([, i]) => centroids[i]);
  return a[0] < b[0] ? [a, b] : [b, a];
}

/** Края тёмной дуги для век и цвет меха вокруг глаза. */
function furAround(src, cx, cy, r) {
  const samples = [];
  for (let t = 0; t < 32; t++) {
    const ang = (t / 32) * Math.PI * 2;
    const x = Math.round(cx + Math.cos(ang) * r * 1.35);
    const y = Math.round(cy + Math.sin(ang) * r * 1.35);
    if (x < 0 || y < 0 || x >= src.w || y >= src.h) continue;
    const i = (y * src.w + x) * 4;
    const [hh, s, v] = hsv(src.data[i], src.data[i + 1], src.data[i + 2]);
    if (hh >= 15 && hh < 45 && s > 0.3 && v > 0.35 && src.data[i + 3] > 200) samples.push([src.data[i], src.data[i + 1], src.data[i + 2]]);
  }
  samples.sort((p, q) => p[0] + p[1] + p[2] - (q[0] + q[1] + q[2]));
  return samples[Math.floor(samples.length / 2)] ?? [170, 110, 55];
}

/** Радиус глаза: тёмная область вокруг центра. */
function eyeRadius(src, cx, cy) {
  let r = 4;
  for (; r < 120; r++) {
    let dark = 0, n = 0;
    for (let t = 0; t < 24; t++) {
      const ang = (t / 24) * Math.PI * 2;
      const x = Math.round(cx + Math.cos(ang) * r);
      const y = Math.round(cy + Math.sin(ang) * r);
      if (x < 0 || y < 0 || x >= src.w || y >= src.h) continue;
      const i = (y * src.w + x) * 4;
      const [, , v] = hsv(src.data[i], src.data[i + 1], src.data[i + 2]);
      n++;
      if (v < 0.45) dark++;
    }
    if (n && dark / n < 0.35) break;
  }
  return r;
}

// ── холст ──────────────────────────────────────────────────────────────────────────────────
/** Положить слой исходника на холст 1024 по преобразованию (масштаб s, перенос). */
async function toCanvas(raw, src, t) {
  const W = Math.round(src.w * t.s);
  const H = Math.round(src.h * t.s);
  const scaled = await sharp(raw, { raw: { width: src.w, height: src.h, channels: 4 } }).resize(W, H, { kernel: 'lanczos3' }).png().toBuffer();
  return sharp({ create: { width: CANVAS, height: CANVAS, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: scaled, left: Math.round(t.dx), top: Math.round(t.dy) }])
    .png()
    .toBuffer();
}

async function save(png, name) {
  const file = new URL(name, OUT);
  mkdirSync(new URL('.', file), { recursive: true });
  const main = await sharp(png).webp({ quality: 82, alphaQuality: 90, effort: 5 }).toBuffer();
  writeFileSync(file, main);
  const small = await sharp(png).resize(512, 512, { kernel: 'lanczos3' }).webp({ quality: 82, alphaQuality: 90, effort: 5 }).toBuffer();
  writeFileSync(new URL(name.replace(/\.webp$/, '@512.webp'), OUT), small);
  return main.length + small.length;
}

/** Есть ли непрозрачные пиксели в слое. */
const hasPixels = (mask) => mask.some((v) => v);

async function main() {
  mkdirSync(OUT, { recursive: true });
  const prepared = {};
  for (const [pose, cfg] of Object.entries(POSES)) {
    const src = await load(new URL(`apps/web/src/assets/beaver/${cfg.file}.webp`, ROOT));
    const { w, h } = src;
    const alpha = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) alpha[i] = src.data[i * 4 + 3] > 8 ? 1 : 0;
    const eyes = cfg.eyes ?? findEyes(src, alpha);
    let top = h, bottom = 0, left = w, right = 0;
    for (let i = 0; i < w * h; i++) if (alpha[i]) {
      const x = i % w, y = (i / w) | 0;
      top = Math.min(top, y); bottom = Math.max(bottom, y); left = Math.min(left, x); right = Math.max(right, x);
    }
    prepared[pose] = { cfg, src, alpha, eyes, box: { top, bottom, left, right } };
  }

  // Одно расстояние между глазами на всех позах: самая «высокая» поза должна влезть в холст.
  let D = Infinity;
  for (const { eyes, box } of Object.values(prepared)) {
    const d = Math.hypot(eyes[1][0] - eyes[0][0], eyes[1][1] - eyes[0][1]);
    const my = (eyes[0][1] + eyes[1][1]) / 2;
    const mx = (eyes[0][0] + eyes[1][0]) / 2;
    const fit = Math.min((EYES_AT.y - 24) / (my - box.top), (CANVAS - 20 - EYES_AT.y) / (box.bottom - my), (EYES_AT.x - 12) / (mx - box.left), (CANVAS - 12 - EYES_AT.x) / (box.right - mx));
    D = Math.min(D, d * fit);
  }
  D = Math.floor(D);

  const meta = { canvas: CANVAS, eyeDistance: D, eyes: EYES_AT, poses: {}, sizes: {} };
  let bytes = 0;
  for (const [pose, { cfg, src, alpha, eyes }] of Object.entries(prepared)) {
    const { w, h } = src;
    const d = Math.hypot(eyes[1][0] - eyes[0][0], eyes[1][1] - eyes[0][1]);
    const angle = (Math.atan2(eyes[1][1] - eyes[0][1], eyes[1][0] - eyes[0][0]) * 180) / Math.PI;
    const s = D / d;
    const mx = (eyes[0][0] + eyes[1][0]) / 2;
    const my = (eyes[0][1] + eyes[1][1]) / 2;
    const t = { s, dx: EYES_AT.x - mx * s, dy: EYES_AT.y - my * s };
    const P = (x, y) => ({ x: Math.round(x * s + t.dx), y: Math.round(y * s + t.dy) });

    // Маски: одежда и рюкзак — по цвету, крупные области, с заполненными дырами (буквы, пряжки).
    const red = new Uint8Array(w * h);
    const green = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) {
      if (!alpha[i]) continue;
      const [hh, ss, vv] = hsv(src.data[i * 4], src.data[i * 4 + 1], src.data[i * 4 + 2]);
      if (isRed(hh, ss, vv)) red[i] = 1;
      else if (isGreen(hh, ss, vv)) green[i] = 1;
    }
    const big = (mask, share) => {
      const { label, sizes } = components(mask, w, h);
      const max = Math.max(...sizes);
      const keep = new Set(sizes.map((n, i) => [n, i]).filter(([n]) => n >= max * share).map(([, i]) => i));
      const out = new Uint8Array(w * h);
      for (let i = 0; i < w * h; i++) if (label[i] >= 0 && keep.has(label[i])) out[i] = 1;
      return out;
    };
    let top = fillHoles(big(red, 0.08), w, h);
    top = dilate(top, w, h, 1);
    let pack = fillHoles(big(green, 0.05), w, h);
    pack = dilate(pack, w, h, 1);
    for (let i = 0; i < w * h; i++) {
      top[i] = top[i] && alpha[i] && !pack[i] ? 1 : 0;
      pack[i] = pack[i] && alpha[i] ? 1 : 0;
    }
    const body = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) body[i] = alpha[i] && !top[i] && !pack[i] ? 1 : 0;

    const poseMeta = { file: cfg.file, angle: Math.round(angle * 10) / 10, scale: Math.round(s * 1000) / 1000, eyesSrc: eyes.map((e) => e.map(Math.round)) };

    // Поднятая лапа (wave): отдельные слои; около плеча её пиксели остаются и в теле, чтобы при повороте не было дыры.
    if (cfg.arm) {
      const arm = new Uint8Array(w * h);
      const keepNear = new Uint8Array(w * h);
      const [px, py] = cfg.arm.pivot;
      for (let i = 0; i < w * h; i++) {
        if (!alpha[i] || pack[i]) continue;
        const x = i % w, y = (i / w) | 0;
        if (inPolygon(x, y, cfg.arm.poly)) {
          arm[i] = 1;
          if (Math.hypot(x - px, y - py) < 48) keepNear[i] = 1;
        }
      }
      const armBody = new Uint8Array(w * h);
      const armTop = new Uint8Array(w * h);
      for (let i = 0; i < w * h; i++) {
        if (!arm[i]) continue;
        if (top[i]) armTop[i] = 1;
        else armBody[i] = 1;
        if (!keepNear[i]) {
          top[i] = 0;
          body[i] = 0;
        }
      }
      bytes += await save(await toCanvas(layer(src, armBody), src, t), `${pose}/arm-body.webp`);
      if (hasPixels(armTop)) {
        bytes += await save(await toCanvas(layer(src, armTop), src, t), `${pose}/arm-top-hoodie-red.webp`);
        bytes += await save(await toCanvas(layer(src, armTop, denim), src, t), `${pose}/arm-top-jacket-denim.webp`);
      }
      const pv = P(px, py);
      poseMeta.arm = { pivot: pv, top: hasPixels(armTop) };
    }

    bytes += await save(await toCanvas(layer(src, body), src, t), `${pose}/body.webp`);
    bytes += await save(await toCanvas(layer(src, top), src, t), `${pose}/top-hoodie-red.webp`);
    bytes += await save(await toCanvas(layer(src, top, denim), src, t), `${pose}/top-jacket-denim.webp`);
    bytes += await save(await toCanvas(layer(src, pack), src, t), `${pose}/backpack.webp`);

    // Веки для моргания: только для открытых глаз (у подмигивания второй глаз уже закрыт).
    const lids = [];
    for (const [ex, ey] of eyes.filter((_, n) => (cfg.blink ?? [0, 1]).includes(n))) {
      const r = eyeRadius(src, ex, ey);
      const [fr, fg, fb] = furAround(src, ex, ey, r);
      const c = P(ex, ey);
      const R = r * s;
      lids.push({ c, R, color: `rgb(${fr},${fg},${fb})`, dark: `rgb(${Math.round(fr * 0.35)},${Math.round(fg * 0.28)},${Math.round(fb * 0.25)})` });
    }
    const rot = angle;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS}" height="${CANVAS}"><defs><filter id="soft"><feGaussianBlur stdDeviation="1.2"/></filter></defs>${lids
      .map(({ c, R, color, dark }) => `<g transform="rotate(${rot} ${c.x} ${c.y})"><ellipse cx="${c.x}" cy="${c.y}" rx="${R * 1.12}" ry="${R * 1.1}" fill="${color}" filter="url(#soft)"/><path d="M ${c.x - R * 0.9} ${c.y - R * 0.05} Q ${c.x} ${c.y + R * 0.62} ${c.x + R * 0.9} ${c.y - R * 0.05}" fill="none" stroke="${dark}" stroke-width="${Math.max(3, R * 0.16)}" stroke-linecap="round"/></g>`)
      .join('')}</svg>`;
    bytes += await save(await sharp(Buffer.from(svg)).png().toBuffer(), `${pose}/blink.webp`);

    // Якорь головы для кепки (середина ободка): от середины глаз вверх на 0,62 расстояния между глазами, по наклону головы.
    const rad = (angle * Math.PI) / 180;
    const up = D * 0.62;
    poseMeta.anchors = {
      eyes: { ...EYES_AT },
      'head-top': { x: Math.round(EYES_AT.x + Math.sin(rad) * up), y: Math.round(EYES_AT.y - Math.cos(rad) * up) },
    };
    meta.poses[pose] = poseMeta;
  }

  // Кепка: отрисована анфас (вырезка с доски tg-travel-passport не годится: там ракурс 3/4, козырёк сбоку, хохолок поверх).
  // Купол красный, козырёк тёмно-синий, плашка «PL»; pivot — середина ободка, 0,62·D над серединой глаз.
  const cw = Math.round(D * 2.3);
  const ch = Math.round(D * 1.25);
  const bx = cw / 2;
  const by = Math.round(D * 0.86); // ободок
  const capSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${cw}" height="${ch}">
<defs>
<radialGradient id="dome" cx="38%" cy="25%" r="85%"><stop offset="0" stop-color="#ff6b5e"/><stop offset="0.45" stop-color="#e2302a"/><stop offset="1" stop-color="#9e1515"/></radialGradient>
<linearGradient id="brim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3554a8"/><stop offset="0.45" stop-color="#1d3478"/><stop offset="1" stop-color="#0e1d4a"/></linearGradient>
<linearGradient id="band" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b71c1c"/><stop offset="1" stop-color="#7f1010"/></linearGradient>
<filter id="blur"><feGaussianBlur stdDeviation="${D * 0.03}"/></filter>
<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.10 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
</defs>
<ellipse cx="${bx}" cy="${by + D * 0.2}" rx="${D * 1.0}" ry="${D * 0.16}" fill="#3a1d0e" opacity="0.28" filter="url(#blur)"/>
<path id="domePath" d="M ${bx - D * 1.06} ${by} C ${bx - D * 1.08} ${by - D * 0.62}, ${bx - D * 0.55} ${by - D * 0.82}, ${bx} ${by - D * 0.82} C ${bx + D * 0.55} ${by - D * 0.82}, ${bx + D * 1.08} ${by - D * 0.62}, ${bx + D * 1.06} ${by} Q ${bx} ${by + D * 0.07} ${bx - D * 1.06} ${by} Z" fill="url(#dome)"/>
<path d="M ${bx - D * 1.06} ${by} C ${bx - D * 1.08} ${by - D * 0.62}, ${bx - D * 0.55} ${by - D * 0.82}, ${bx} ${by - D * 0.82} C ${bx + D * 0.55} ${by - D * 0.82}, ${bx + D * 1.08} ${by - D * 0.62}, ${bx + D * 1.06} ${by} Q ${bx} ${by + D * 0.07} ${bx - D * 1.06} ${by} Z" fill="#000" filter="url(#grain)"/>
<path d="M ${bx} ${by - D * 0.8} C ${bx - D * 0.35} ${by - D * 0.62}, ${bx - D * 0.55} ${by - D * 0.3}, ${bx - D * 0.6} ${by + D * 0.02}" fill="none" stroke="#8e1212" stroke-opacity="0.55" stroke-width="${D * 0.022}"/>
<path d="M ${bx} ${by - D * 0.8} C ${bx + D * 0.35} ${by - D * 0.62}, ${bx + D * 0.55} ${by - D * 0.3}, ${bx + D * 0.6} ${by + D * 0.02}" fill="none" stroke="#8e1212" stroke-opacity="0.55" stroke-width="${D * 0.022}"/>
<path d="M ${bx - D * 0.62} ${by - D * 0.55} C ${bx - D * 0.45} ${by - D * 0.72}, ${bx - D * 0.2} ${by - D * 0.78}, ${bx + D * 0.05} ${by - D * 0.76}" fill="none" stroke="#ffffff" stroke-opacity="0.35" stroke-width="${D * 0.05}" stroke-linecap="round" filter="url(#blur)"/>
<ellipse cx="${bx}" cy="${by - D * 0.81}" rx="${D * 0.08}" ry="${D * 0.04}" fill="#a31515"/>
<rect x="${bx - D * 0.34}" y="${by - D * 0.5}" width="${D * 0.68}" height="${D * 0.36}" rx="${D * 0.07}" fill="#ffffff"/>
<rect x="${bx - D * 0.3}" y="${by - D * 0.46}" width="${D * 0.6}" height="${D * 0.28}" rx="${D * 0.05}" fill="#d32f2f"/>
<text x="${bx}" y="${by - D * 0.235}" font-family="DejaVu Sans, Arial" font-weight="bold" font-size="${D * 0.25}" fill="#ffffff" text-anchor="middle">PL</text>
<path d="M ${bx - D * 1.06} ${by} Q ${bx} ${by + D * 0.07} ${bx + D * 1.06} ${by} L ${bx + D * 1.04} ${by - D * 0.08} Q ${bx} ${by - D * 0.01} ${bx - D * 1.04} ${by - D * 0.08} Z" fill="url(#band)"/>
<path d="M ${bx - D * 1.02} ${by + D * 0.02} Q ${bx} ${by - D * 0.06} ${bx + D * 1.02} ${by + D * 0.02} Q ${bx + D * 0.9} ${by + D * 0.27} ${bx} ${by + D * 0.3} Q ${bx - D * 0.9} ${by + D * 0.27} ${bx - D * 1.02} ${by + D * 0.02} Z" fill="url(#brim)"/>
<path d="M ${bx - D * 0.95} ${by + D * 0.03} Q ${bx} ${by - D * 0.04} ${bx + D * 0.95} ${by + D * 0.03}" fill="none" stroke="#6f8fd8" stroke-opacity="0.7" stroke-width="${D * 0.025}"/>
<path d="M ${bx - D * 0.8} ${by + D * 0.17} Q ${bx} ${by + D * 0.24} ${bx + D * 0.8} ${by + D * 0.17}" fill="none" stroke="#ffffff" stroke-opacity="0.18" stroke-width="${D * 0.02}" stroke-dasharray="${D * 0.05} ${D * 0.035}"/>
</svg>`;
  bytes += await saveExact(await sharp(Buffer.from(capSvg)).png().toBuffer(), 'cap-red.webp');
  meta.cap = { w: cw, h: ch, pivot: { x: Math.round(bx), y: by }, source: 'отрисована в scripts/look-prototype.mjs (прототип, не живописный слой)' };

  // Очки: круглая тёмная оправа, лёгкий голубой блик на стёклах. Центры линз — на центрах глаз.
  const gw = Math.round(D * 2.05);
  const gh = Math.round(D * 0.9);
  const lr = D * 0.36;
  const gcx = gw / 2;
  const gcy = gh / 2;
  const glassesSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${gw}" height="${gh}">
<defs>
<radialGradient id="lens" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#ffffff" stop-opacity="0.28"/><stop offset="0.55" stop-color="#bfe3ff" stop-opacity="0.12"/><stop offset="1" stop-color="#6aa8d8" stop-opacity="0.18"/></radialGradient>
<linearGradient id="rim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a2c1a"/><stop offset="0.5" stop-color="#24140b"/><stop offset="1" stop-color="#3b2214"/></linearGradient>
</defs>
${[-1, 1].map((side) => {
  const x = gcx + (side * D) / 2;
  return `<circle cx="${x}" cy="${gcy}" r="${lr}" fill="url(#lens)"/>
<circle cx="${x}" cy="${gcy}" r="${lr}" fill="none" stroke="url(#rim)" stroke-width="${D * 0.075}"/>
<circle cx="${x}" cy="${gcy}" r="${lr - D * 0.03}" fill="none" stroke="#7a4a2a" stroke-opacity="0.55" stroke-width="${D * 0.012}"/>
<path d="M ${x - lr * 0.55} ${gcy - lr * 0.35} A ${lr * 0.7} ${lr * 0.7} 0 0 1 ${x - lr * 0.05} ${gcy - lr * 0.68}" fill="none" stroke="#ffffff" stroke-opacity="0.7" stroke-width="${D * 0.03}" stroke-linecap="round"/>
<path d="M ${x + side * lr} ${gcy - lr * 0.15} L ${x + side * (lr + D * 0.2)} ${gcy - lr * 0.3}" stroke="url(#rim)" stroke-width="${D * 0.06}" stroke-linecap="round"/>`;
}).join('\n')}
<path d="M ${gcx - D / 2 + lr * 0.92} ${gcy - lr * 0.25} Q ${gcx} ${gcy - lr * 0.62} ${gcx + D / 2 - lr * 0.92} ${gcy - lr * 0.25}" fill="none" stroke="url(#rim)" stroke-width="${D * 0.06}" stroke-linecap="round"/>
</svg>`;
  bytes += await saveExact(await sharp(Buffer.from(glassesSvg)).png().toBuffer(), 'glasses-round.webp');
  meta.glasses = { w: gw, h: gh, pivot: { x: Math.round(gcx), y: Math.round(gcy) } };

  meta.bytes = bytes;
  writeFileSync(new URL('meta.json', OUT), `${JSON.stringify(meta, null, 2)}\n`);
  console.log(`eyeDistance ${D}, poses ${Object.keys(meta.poses).join(', ')}, ${(bytes / 1024).toFixed(0)} KB`);
  for (const [p, m] of Object.entries(meta.poses)) console.log(`  ${p.padEnd(10)} ${m.file.padEnd(10)} наклон ${m.angle}° масштаб ${m.scale} глаза ${JSON.stringify(m.eyesSrc)}`);
}

/** Жёсткая вещь (кепка, очки): свой размер, без холста. Основной файл и @512 не нужны — вещь маленькая. */
async function saveExact(png, name) {
  const buf = await sharp(png).webp({ quality: 86, alphaQuality: 92, effort: 5 }).toBuffer();
  writeFileSync(new URL(name, OUT), buf);
  return buf.length;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
