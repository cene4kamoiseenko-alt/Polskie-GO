/**
 * Набор значков владельца (лист 2026-11-02, docs/design/v19/icons/icon_set_8.webp, 1448×1086, 8 плиток 2×4) → apps/web/src/assets/icons/*.webp (256×256, прозрачные углы).
 *
 *   node scripts/build-icons-art.mjs               — собрать
 *   node scripts/build-icons-art.mjs --out <папка>  — собрать в другую папку (проверка глазами)
 *
 *  lessons (книга PL) · star · quests (мишень) · gift · xp (медаль) · map · premium (корона) · profile (силуэт)
 *
 * Плитка на листе стоит на белом фоне с мягкой тенью снизу; границы каждой плитки ищутся по отличию от белого (> 30 по сумме каналов) в окнах сетки, затем рамка
 * сжимается до самого ободка (замер: слева +5, сверху +1, справа −4, снизу −11 — там тень), плитка масштабируется до 256×256 (разница сторон 1,5 %), углы — скруглённый
 * прямоугольник r = 0,232 от стороны (замер по контуру: окружность радиуса ≈ 75 из 324 px) с мягким краем; тень и белая кайма за ободком отрезаны.
 * Значки с плиткой: в строках «Сегодня» и карточках квестов — как есть; в мелких местах (корона 16–24 px) остаются прежние векторные.
 */
import { mkdirSync } from 'node:fs';
import { sharp } from './lib/sprite.mjs';

const SRC = new URL('../docs/design/v19/icons/icon_set_8.webp', import.meta.url).pathname;
const args = process.argv.slice(2);
const out = args.includes('--out') ? new URL(`file://${args[args.indexOf('--out') + 1].replace(/\/?$/, '/')}`) : new URL('../apps/web/src/assets/icons/', import.meta.url);
mkdirSync(out, { recursive: true });

const NAMES = [['lessons', 'star', 'quests', 'gift'], ['xp', 'map', 'premium', 'profile']];
const XR = [[25, 375], [380, 725], [725, 1070], [1075, 1425]];
const YR = [[170, 535], [560, 930]];
const SIZE = 256;
const RADIUS = 0.232 * SIZE;
const INSET = 1;

const { data, info } = await sharp(SRC).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const px = (x, y, c) => data[(y * info.width + x) * 3 + c];
const far = (x, y) => 3 * 255 - (px(x, y, 0) + px(x, y, 1) + px(x, y, 2)) > 30;

const mask = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}"><rect x="${INSET}" y="${INSET}" width="${SIZE - 2 * INSET}" height="${SIZE - 2 * INSET}" rx="${RADIUS - INSET}" fill="#fff"/></svg>`,
);

const report = [];
for (let r = 0; r < 2; r++) {
  for (let c = 0; c < 4; c++) {
    const [x0, x1] = XR[c], [y0, y1] = YR[r];
    let l = 1e9, t = 1e9, rt = -1, b = -1;
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (far(x, y)) { if (x < l) l = x; if (x > rt) rt = x; if (y < t) t = y; if (y > b) b = y; }
    const box = { left: l + 5, top: t + 1, width: rt - 4 - (l + 5) + 1, height: b - 11 - (t + 1) + 1 };
    const name = NAMES[r][c];
    const tile = await sharp(SRC).extract(box).resize(SIZE, SIZE, { fit: 'fill', kernel: 'lanczos3' }).ensureAlpha().composite([{ input: mask, blend: 'dest-in' }]).webp({ quality: 92, alphaQuality: 100, effort: 6 }).toBuffer();
    await sharp(tile).toFile(new URL(`${name}.webp`, out).pathname);
    report.push(`${name} ${box.width}×${box.height} → ${Math.round(tile.length / 1024)} КБ`);
  }
}
console.log(report.join(' · '));
