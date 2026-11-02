/**
 * Кнопка «Начать миссию» владельца (2026-11-02, docs/design/v19/ui/start_button_original.webp, 2172×724, RGBA) → apps/web/src/assets/ui/btn-start.webp.
 *
 *   node scripts/build-ui-art.mjs               — собрать
 *   node scripts/build-ui-art.mjs --out <папка>  — собрать в другую папку (проверка глазами)
 *
 * На картинке нарисованы русский текст и значок «play»: приложение многоязычное, текст должен быть живым (перевод, скринридер), поэтому текст и значок убираются:
 *  1. пилюля вырезается по альфе (> 8; полупрозрачный мусор вокруг обнуляется);
 *  2. белые пиксели внутри пилюли дают рамку текста и значка;
 *  3. рамка (плюс запас на тень и сглаживание) закрашивается вертикальной интерполяцией между строками выше и ниже неё: корпус кнопки — плавный вертикальный градиент,
 *     опорные строки предварительно сглажены по горизонтали, чтобы не осталось швов;
 *  4. экспорт 1000 px по ширине (пропорция 5,37 : 1 сохраняется).
 * Кнопка в CSS (`.btn-start`, index.css) растягивает середину и держит скруглённые края без искажения (border-image, срез по радиусу = половина высоты), текст — обычный DOM.
 */
import { mkdirSync } from 'node:fs';
import { sharp } from './lib/sprite.mjs';

const SRC = new URL('../docs/design/v19/ui/start_button_original.webp', import.meta.url).pathname;
const args = process.argv.slice(2);
const out = args.includes('--out') ? new URL(`file://${args[args.indexOf('--out') + 1].replace(/\/?$/, '/')}`) : new URL('../apps/web/src/assets/ui/', import.meta.url);
mkdirSync(out, { recursive: true });

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: SW, height: SH } = info;
const px = (x, y, c) => data[(y * SW + x) * 4 + c];

// 1. границы пилюли по альфе
let X0 = SW, X1 = -1, Y0 = SH, Y1 = -1;
for (let y = 0; y < SH; y++) for (let x = 0; x < SW; x++) if (px(x, y, 3) > 8) { if (x < X0) X0 = x; if (x > X1) X1 = x; if (y < Y0) Y0 = y; if (y > Y1) Y1 = y; }
const W = X1 - X0 + 1, H = Y1 - Y0 + 1;
const f = new Float32Array(W * H * 4);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) for (let c = 0; c < 4; c++) f[(y * W + x) * 4 + c] = px(X0 + x, Y0 + y, c);
const at = (x, y, c) => f[(y * W + x) * 4 + c];

// 2. рамка белых пикселей (текст и значок) во внутренней части пилюли
let tx0 = W, tx1 = -1, ty0 = H, ty1 = -1;
for (let y = Math.floor(H * 0.2); y < Math.floor(H * 0.8); y++) {
  for (let x = Math.floor(W * 0.05); x < Math.floor(W * 0.95); x++) {
    if (at(x, y, 3) > 200 && Math.min(at(x, y, 0), at(x, y, 1), at(x, y, 2)) > 195) { if (x < tx0) tx0 = x; if (x > tx1) tx1 = x; if (y < ty0) ty0 = y; if (y > ty1) ty1 = y; }
  }
}
if (tx1 < 0) throw new Error('на кнопке не найден белый текст: возможно, она уже без текста');

// 3. вертикальная интерполяция между опорными строками, сглаженными по горизонтали
const PX = 20, PY = 22, R = 24, SIGMA = 24;
const x0 = Math.max(0, tx0 - PX), x1 = Math.min(W - 1, tx1 + PX), y0 = ty0 - PY, y1 = ty1 + PY;
const gauss = (() => { const k = SIGMA * 3; const g = []; let s = 0; for (let i = -k; i <= k; i++) { const v = Math.exp(-(i * i) / (2 * SIGMA * SIGMA)); g.push(v); s += v; } return { k, g: g.map((v) => v / s) }; })();
const refRow = (yc) => {
  const row = new Float32Array(W * 3);
  for (let x = 0; x < W; x++) for (let c = 0; c < 3; c++) row[x * 3 + c] = (at(x, yc - 3, c) + at(x, yc - 2, c) + at(x, yc - 1, c) + at(x, yc, c) + at(x, yc + 1, c) + at(x, yc + 2, c)) / 6;
  const sm = new Float32Array(W * 3);
  for (let x = 0; x < W; x++) for (let c = 0; c < 3; c++) {
    let acc = 0;
    for (let i = -gauss.k; i <= gauss.k; i++) acc += gauss.g[i + gauss.k] * row[Math.min(W - 1, Math.max(0, x + i)) * 3 + c];
    sm[x * 3 + c] = acc;
  }
  return sm;
};
const top = refRow(y0 - R), bot = refRow(y1 + R);
for (let y = y0; y <= y1; y++) {
  const t = (y - (y0 - R)) / ((y1 + R) - (y0 - R));
  for (let x = x0; x <= x1; x++) for (let c = 0; c < 3; c++) f[(y * W + x) * 4 + c] = top[x * 3 + c] * (1 - t) + bot[x * 3 + c] * t;
}
// полупрозрачный мусор вокруг — в ноль
for (let i = 0; i < W * H; i++) if (f[i * 4 + 3] < 8) { f[i * 4] = f[i * 4 + 1] = f[i * 4 + 2] = f[i * 4 + 3] = 0; }

const raw = Buffer.alloc(W * H * 4);
for (let i = 0; i < raw.length; i++) raw[i] = Math.max(0, Math.min(255, Math.round(f[i])));
const buf = await sharp(raw, { raw: { width: W, height: H, channels: 4 } }).resize(1000, Math.round((1000 * H) / W), { kernel: 'lanczos3' }).webp({ quality: 88, alphaQuality: 100, effort: 6 }).toBuffer();
await sharp(buf).toFile(new URL('btn-start.webp', out).pathname);
const meta = await sharp(buf).metadata();
console.log(`btn-start.webp ${meta.width}×${meta.height}, ${Math.round(buf.length / 1024)} КБ; рамка текста ${tx0}–${tx1} × ${ty0}–${ty1} из ${W}×${H} (закрашено)`);
