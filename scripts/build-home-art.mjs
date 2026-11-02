/**
 * «Бобек дома» (фото владельца 2026-11-02, docs/design/v19/home) → apps/web/src/assets/home: замена векторной сцены MIESZKANIE там, где она стояла фоном.
 *
 *   node scripts/build-home-art.mjs               — собрать
 *   node scripts/build-home-art.mjs --out <папка>  — собрать в другую папку (проверка глазами)
 *
 *  home-<кадр>.webp (1536×1024, 3 : 2, Бобёр нарисован в картинке) → home-<кадр>.webp (1200×800) и home-<кадр>@640.webp (640×427)
 *  Кадры: cook (готовит на кухне) · relax (в наушниках на диване) · study (в очках пишет в тетради) · keys (в прихожей с ключами).
 *  Где стоят — apps/web/src/lib/homeArt.ts.
 */
import { mkdirSync } from 'node:fs';
import { sharp } from './lib/sprite.mjs';

const SRC = new URL('../docs/design/v19/home/', import.meta.url);
const args = process.argv.slice(2);
const out = args.includes('--out') ? new URL(`file://${args[args.indexOf('--out') + 1].replace(/\/?$/, '/')}`) : new URL('../apps/web/src/assets/home/', import.meta.url);
mkdirSync(out, { recursive: true });

const sizes = [];
for (const kind of ['cook', 'relax', 'study', 'keys']) {
  const master = new URL(`home-${kind}.webp`, SRC).pathname;
  for (const [name, w, q] of [[`home-${kind}.webp`, 1200, 80], [`home-${kind}@640.webp`, 640, 78]]) {
    const buf = await sharp(master).resize(w, Math.round((w * 2) / 3), { kernel: 'lanczos3' }).webp({ quality: q, effort: 6 }).toBuffer();
    await sharp(buf).toFile(new URL(name, out).pathname);
    sizes.push(`${name} ${Math.round(buf.length / 1024)} КБ`);
  }
}
console.log(sizes.join(' · '));
