/**
 * Жильё домика Бобека (пакет владельца «POLSKI_GO_OPOLE_LODZ_KRAKOW_WARSAW_ROOMS», 2026-11-02, docs/design/v19/housing) → apps/web/src/assets/housing.
 *
 *   node scripts/build-housing-art.mjs               — собрать
 *   node scripts/build-housing-art.mjs --out <папка>  — собрать в другую папку (проверка глазами)
 *
 *  <город>_room_2x1.webp (1536×768, комната без Бобра, интерфейса и текста) → housing-<город>.webp (1200×600) и housing-<город>@640.webp (640×320)
 *  Города: opole (Pokój, бесплатно) · lodz (Kawalerka) · krakow (Mieszkanie) · warszawa (Apartament).
 * Имя файла = slug предмета каталога (`housing-opole`…). Карточки каталога с Бобром и подписью (`*_catalog_card_3x2.webp`) в приложение не идут: текст на них нарисован
 * и не переводится, а Бобра экран рисует сам (в его образе). Мастера — удвоенный размер исходной генерации (≈ 764 px на панель): детализация на DPR 3 ограничена.
 */
import { mkdirSync } from 'node:fs';
import { sharp } from './lib/sprite.mjs';

const SRC = new URL('../docs/design/v19/housing/', import.meta.url);
const args = process.argv.slice(2);
const out = args.includes('--out') ? new URL(`file://${args[args.indexOf('--out') + 1].replace(/\/?$/, '/')}`) : new URL('../apps/web/src/assets/housing/', import.meta.url);
mkdirSync(out, { recursive: true });

const sizes = [];
for (const city of ['opole', 'lodz', 'krakow', 'warszawa']) {
  const master = new URL(`${city}_room_2x1.webp`, SRC).pathname;
  for (const [name, w, q] of [[`housing-${city}.webp`, 1200, 80], [`housing-${city}@640.webp`, 640, 78]]) {
    const buf = await sharp(master).resize(w, w / 2, { kernel: 'lanczos3' }).webp({ quality: q, effort: 6 }).toBuffer();
    await sharp(buf).toFile(new URL(name, out).pathname);
    sizes.push(`${name} ${Math.round(buf.length / 1024)} КБ`);
  }
}
console.log(sizes.join(' · '));
