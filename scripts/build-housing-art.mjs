/**
 * Жильё домика Бобека: сцены владельца (2026-11-02, docs/design/v19/housing/scenes) → apps/web/src/assets/housing.
 *
 *   node scripts/build-housing-art.mjs               — собрать
 *   node scripts/build-housing-art.mjs --out <папка>  — собрать в другую папку (проверка глазами)
 *
 *  scenes/<город>_<сцена>.webp (1536×1024, 3 : 2, Бобёр нарисован в самой картинке) → housing-<город>-<сцена>.webp (1200×800) и housing-<город>-<сцена>@640.webp (640×427)
 *  Города: opole (Pokój, бесплатно) · lodz (Kawalerka) · krakow (Mieszkanie) · warszawa (Apartament).
 *  Сцены: read (читает) · sleep (спит) · work (работает за компьютером) · tea (пьёт чай). Нет файла — нет и сцены: экран показывает только те, что есть
 *  (у Pokój w Opolu пока нет сцены «работает»; положить `opole_work.webp` в scenes/ и пересобрать — переключатель покажет её сам).
 * Имя файла = `housing-<город>-<сцена>`; экран собирает его из slug предмета каталога (`housing-opole`) и ключа сцены (`read`).
 * Мастера — генерации 1536×1024: Бобёр в них в одном образе (свитер, клетчатые штаны) и не меняется вместе с гардеробом игрока.
 */
import { existsSync, mkdirSync } from 'node:fs';
import { sharp } from './lib/sprite.mjs';

const SRC = new URL('../docs/design/v19/housing/scenes/', import.meta.url);
const args = process.argv.slice(2);
const out = args.includes('--out') ? new URL(`file://${args[args.indexOf('--out') + 1].replace(/\/?$/, '/')}`) : new URL('../apps/web/src/assets/housing/', import.meta.url);
mkdirSync(out, { recursive: true });

const sizes = [];
const missing = [];
for (const city of ['opole', 'lodz', 'krakow', 'warszawa']) {
  for (const scene of ['read', 'sleep', 'work', 'tea']) {
    const master = new URL(`${city}_${scene}.webp`, SRC).pathname;
    if (!existsSync(master)) {
      missing.push(`${city}/${scene}`);
      continue;
    }
    for (const [name, w, q] of [[`housing-${city}-${scene}.webp`, 1200, 80], [`housing-${city}-${scene}@640.webp`, 640, 78]]) {
      const buf = await sharp(master).resize(w, Math.round((w * 2) / 3), { kernel: 'lanczos3' }).webp({ quality: q, effort: 6 }).toBuffer();
      await sharp(buf).toFile(new URL(name, out).pathname);
      sizes.push(`${name} ${Math.round(buf.length / 1024)} КБ`);
    }
  }
}
console.log(sizes.join(' · '));
if (missing.length) console.log(`нет мастера (сцены не будет): ${missing.join(', ')}`);
