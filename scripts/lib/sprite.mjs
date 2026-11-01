/**
 * Общие помощники конвейеров растровых слоёв (scripts/build-splash-art.mjs, scripts/build-pass-art.mjs): чтение RGBA, границы по альфе, обрезка,
 * чистка вырезки (нормализация альфы, крошки, дырочки, цвет кромки), расширение маски, кодирование в WebP.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
export const sharp = require('sharp');

export async function readRGBA(file) {
  const { data, info } = await sharp(readFileSync(file)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data: new Uint8Array(data), w: info.width, h: info.height };
}

/** Границы по альфе > thr: [x0, y0, x1, y1] включительно. */
export function bounds({ data, w, h }, thr) {
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (data[(y * w + x) * 4 + 3] > thr) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return [x0, y0, x1, y1];
}

export function crop({ data, w }, [x0, y0, x1, y1]) {
  const cw = x1 - x0 + 1, ch = y1 - y0 + 1, out = new Uint8Array(cw * ch * 4);
  for (let y = 0; y < ch; y++) out.set(data.subarray(((y0 + y) * w + x0) * 4, ((y0 + y) * w + x0 + cw) * 4), y * cw * 4);
  return { data: out, w: cw, h: ch };
}

/**
 * Чистка альфы вырезки (мастера владельца 2026-11-01): «непрозрачное» (≥ 240; в мастерах 253 из 255, слой на 1 % прозрачный) → 255; крошки < 8 → 0;
 * изолированные кусочки меньше minArea пикселей (8 соседей) убираются; полупрозрачные пиксели внутри силуэта (≥ 36 плотных из 49 в окне 7×7) становятся плотными —
 * это шум мастера, а не край. При `defringe` цвет кромки (альфа < 250) берётся у ближайшего плотного пикселя не дальше 6 px (в мастерах кромка подкрашена красным:
 * на небе она даёт красную линию). Картинка правится на месте; возвращает счётчики.
 */
export function cleanSprite(img, { minArea, defringe }) {
  const { data, w, h } = img;
  const n = w * h;
  let solid = 0;
  for (let i = 0; i < n; i++) {
    const a = data[i * 4 + 3];
    if (a < 8) data[i * 4 + 3] = 0;
    else if (a >= 240) { data[i * 4 + 3] = 255; solid++; }
  }
  // Изолированные кусочки.
  const lab = new Int32Array(n).fill(-1);
  let removed = 0;
  for (let s = 0; s < n; s++) {
    if (lab[s] !== -1 || data[s * 4 + 3] < 24) continue;
    const q = [s];
    lab[s] = s;
    for (let k = 0; k < q.length; k++) {
      const p = q[k], x = p % w, y = (p / w) | 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const j = ny * w + nx;
        if (lab[j] === -1 && data[j * 4 + 3] >= 24) { lab[j] = s; q.push(j); }
      }
    }
    if (q.length < minArea) for (const p of q) { data[p * 4 + 3] = 0; removed++; }
  }
  // Дырочки внутри силуэта.
  let holes = 0;
  const dense = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : data[(y * w + x) * 4 + 3] >= 250 ? 1 : 0);
  const fix = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const a = data[(y * w + x) * 4 + 3];
    if (a < 8 || a >= 250) continue;
    let c = 0;
    for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) c += dense(x + dx, y + dy);
    if (c >= 36) fix.push(y * w + x);
  }
  for (const i of fix) { data[i * 4 + 3] = 255; holes++; }
  let fringe = 0;
  if (defringe) {
    const src = new Int32Array(n).fill(-1);
    let front = [];
    for (let i = 0; i < n; i++) if (data[i * 4 + 3] >= 250) { src[i] = i; front.push(i); }
    for (let step = 0; step < 6 && front.length; step++) {
      const next = [];
      for (const p of front) {
        const x = p % w, y = (p / w) | 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const j = ny * w + nx;
          if (src[j] !== -1 || data[j * 4 + 3] === 0) continue;
          src[j] = src[p];
          next.push(j);
        }
      }
      front = next;
    }
    for (let i = 0; i < n; i++) {
      if (data[i * 4 + 3] >= 250 || data[i * 4 + 3] === 0 || src[i] === -1) continue;
      const s = src[i] * 4;
      if (Math.abs(data[i * 4] - data[s]) + Math.abs(data[i * 4 + 1] - data[s + 1]) + Math.abs(data[i * 4 + 2] - data[s + 2]) > 60) fringe++;
      data[i * 4] = data[s]; data[i * 4 + 1] = data[s + 1]; data[i * 4 + 2] = data[s + 2];
    }
  }
  return { solid, removed, fringe, holes };
}

/** Расширение маски на r пикселей (квадратное окно), через префиксные суммы. Маска w×h. */
export function dilate(mask, w, h, r) {
  const tmp = new Uint8Array(w * h), out = new Uint8Array(w * h), cs = new Int32Array(Math.max(w, h) + 1);
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

/** RGBA → WebP заданного размера (Lanczos, альфа без потерь). */
export async function webp(img, width, height, opts) {
  return sharp(Buffer.from(img.data), { raw: { width: img.w, height: img.h, channels: 4 } })
    .resize(width, height, { kernel: 'lanczos3' })
    .webp({ alphaQuality: 100, effort: 6, ...opts })
    .toBuffer();
}
