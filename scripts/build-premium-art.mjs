/**
 * Баннеры экрана Premium (картинки владельца 2026-11-02, docs/design/v19/premium) → apps/web/src/assets/premium. Сменяются раз в день (apps/web/src/screens/Premium.tsx).
 *
 *   node scripts/build-premium-art.mjs               — собрать
 *   node scripts/build-premium-art.mjs --out <папка>  — собрать в другую папку
 *
 *  banner-oldtown.webp (1536×1024: Бобек в бейсболке, Старый город, сундук) → premium-oldtown.webp (1200×800) и @640
 *  banner-mountains.webp (756×500: Бобек в шапке с картой, горы, канатка) → premium-mountains.webp (756×500, без увеличения) и @640
 * Надписи на кадрах (Premium, «Больше практики — быстрее прогресс», плашки преимуществ) нарисованы по-русски и не переводятся.
 */
import { mkdirSync } from 'node:fs';
import { sharp } from './lib/sprite.mjs';

const SRC = new URL('../docs/design/v19/premium/', import.meta.url);
const args = process.argv.slice(2);
const out = args.includes('--out') ? new URL(`file://${args[args.indexOf('--out') + 1].replace(/\/?$/, '/')}`) : new URL('../apps/web/src/assets/premium/', import.meta.url);
mkdirSync(out, { recursive: true });

const sizes = [];
for (const [master, name, big] of [['banner-oldtown.webp', 'premium-oldtown', 1200], ['banner-mountains.webp', 'premium-mountains', 756]]) {
  const src = new URL(master, SRC).pathname;
  const meta = await sharp(src).metadata();
  for (const [file, w, q] of [[`${name}.webp`, big, 82], [`${name}@640.webp`, 640, 80]]) {
    const width = Math.min(w, meta.width);
    const buf = await sharp(src).resize(width, Math.round((width * meta.height) / meta.width), { kernel: 'lanczos3' }).webp({ quality: q, effort: 6 }).toBuffer();
    await sharp(buf).toFile(new URL(file, out).pathname);
    sizes.push(`${file} ${width}px ${Math.round(buf.length / 1024)} КБ`);
  }
}
console.log(sizes.join(' · '));
