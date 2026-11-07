/**
 * Вырезает белый фон у мастера скина: PNG/JPG на белом → WebP с прозрачностью (как мастера в docs/design/v20/skins).
 *
 *   node scripts/cutout-white-background.mjs <вход.png> <выход.webp> [--sheet превью.png]
 *
 * Что делает:
 *  1. Находит почти белые пиксели (все каналы ≥ 244) и склеивает их в области (4 соседа).
 *  2. Фоном считает область, которая касается края кадра, и любую большую «карман»-область (≥ 2500 px: просвет между крылом и телом), а мелкие светлые
 *     пятна — блики в глазах, зубы, кружка — оставляет: их размер намного меньше.
 *  3. Съедает 2 px по контуру (там белая кайма от сглаживания) и смягчает край (размытие альфа-канала 0,8 px), цвета не трогает.
 * Оригинал не меняется; результат дальше ставит на холст `scripts/build-costume-art.mjs`.
 */
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const [input, output] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const sheetPath = process.argv.includes('--sheet') ? process.argv[process.argv.indexOf('--sheet') + 1] : null;
if (!input || !output) {
  console.error('Использование: node scripts/cutout-white-background.mjs <вход> <выход.webp> [--sheet превью.png]');
  process.exit(2);
}

const WHITE = 244; // порог «почти белого»
const POCKET = 2500; // минимальный размер замкнутой белой области, которая считается фоном
const ERODE = 2; // px съедаются по контуру

const { data, info } = await sharp(readFileSync(input)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: w, height: h } = info;
const n = w * h;

const white = new Uint8Array(n);
for (let i = 0; i < n; i++) white[i] = data[i * 4] >= WHITE && data[i * 4 + 1] >= WHITE && data[i * 4 + 2] >= WHITE ? 1 : 0;

// Области белого (4 соседа), стек без рекурсии.
const label = new Int32Array(n).fill(-1);
const sizes = [];
const touchesEdge = [];
const stack = new Int32Array(n);
for (let start = 0; start < n; start++) {
  if (!white[start] || label[start] !== -1) continue;
  const id = sizes.length;
  let sp = 0;
  let size = 0;
  let edge = false;
  stack[sp++] = start;
  label[start] = id;
  while (sp) {
    const p = stack[--sp];
    size++;
    const x = p % w;
    const y = (p - x) / w;
    if (x === 0 || y === 0 || x === w - 1 || y === h - 1) edge = true;
    if (x > 0 && white[p - 1] && label[p - 1] === -1) { label[p - 1] = id; stack[sp++] = p - 1; }
    if (x < w - 1 && white[p + 1] && label[p + 1] === -1) { label[p + 1] = id; stack[sp++] = p + 1; }
    if (y > 0 && white[p - w] && label[p - w] === -1) { label[p - w] = id; stack[sp++] = p - w; }
    if (y < h - 1 && white[p + w] && label[p + w] === -1) { label[p + w] = id; stack[sp++] = p + w; }
  }
  sizes.push(size);
  touchesEdge.push(edge);
}
const isBackground = (id) => id >= 0 && (touchesEdge[id] || sizes[id] >= POCKET);
const bg = new Uint8Array(n);
let bgPixels = 0;
for (let i = 0; i < n; i++) if (isBackground(label[i])) { bg[i] = 1; bgPixels++; }
const pockets = sizes.filter((s, id) => !touchesEdge[id] && s >= POCKET).length;

// Контур: фон расширяется на ERODE px (отдельные проходы по строкам и столбцам).
function dilate(mask, r) {
  const tmp = new Uint8Array(n);
  const out = new Uint8Array(n);
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
const eroded = dilate(bg, ERODE);
const alpha = Buffer.alloc(n);
for (let i = 0; i < n; i++) alpha[i] = eroded[i] ? 0 : 255;
const blurred = await sharp(alpha, { raw: { width: w, height: h, channels: 1 } }).blur(0.8).raw().toBuffer({ resolveWithObject: true });
const soft = { at: (i) => blurred.data[i * blurred.info.channels] }; // sharp может вернуть несколько каналов: берём первый

const rgba = Buffer.alloc(n * 4);
for (let i = 0; i < n; i++) {
  rgba[i * 4] = data[i * 4];
  rgba[i * 4 + 1] = data[i * 4 + 1];
  rgba[i * 4 + 2] = data[i * 4 + 2];
  rgba[i * 4 + 3] = eroded[i] ? 0 : soft.at(i);
}
const webp = await sharp(rgba, { raw: { width: w, height: h, channels: 4 } }).webp({ quality: 97, alphaQuality: 100, effort: 6 }).toBuffer();
writeFileSync(output, webp);
console.log(`${input}: ${w}×${h}, фон ${(bgPixels / n * 100).toFixed(1)} % (замкнутых карманов: ${pockets}); ${output}: ${Math.round(webp.length / 1024)} КБ`);

if (sheetPath) {
  // Контрольный лист: тёмный, светлый и клетчатый фон рядом — кайма и дыры видны сразу.
  const cell = 640;
  const piece = await sharp(rgba, { raw: { width: w, height: h, channels: 4 } }).resize(cell, cell).png().toBuffer();
  const bgs = [{ r: 20, g: 36, b: 64 }, { r: 235, g: 120, b: 60 }, { r: 90, g: 200, b: 120 }];
  const tiles = [];
  for (const [i, c] of bgs.entries()) {
    tiles.push({ input: await sharp({ create: { width: cell, height: cell, channels: 3, background: c } }).png().toBuffer(), left: i * cell, top: 0 });
    tiles.push({ input: piece, left: i * cell, top: 0 });
  }
  await sharp({ create: { width: 3 * cell, height: cell, channels: 3, background: { r: 0, g: 0, b: 0 } } }).composite(tiles).png().toFile(sheetPath);
  console.log(`Лист: ${sheetPath}`);
}
