/**
 * Арты пропуска месяца (мастера владельца 2026-11-01, docs/design/v19/pass) → ассеты приложения apps/web/src/assets/pass.
 *
 *   node scripts/build-pass-art.mjs               — собрать
 *   node scripts/build-pass-art.mjs --out <папка>  — собрать в другую папку (проверка глазами)
 *
 *  stary_rynek_cafe_2x1.webp  (1774×887, осень, флаг)     → stary-rynek{,@640}.webp  — арт карточки «11 ноября» (listopad-swieto); раньше — вырезка 866 px из референса
 *  stary_rynek_cafe_16x9.webp (1672×941, Старый рынок)    → season-listopad{,@640}.webp — обложка сезона «Ноябрь в Познани» (экран пропуска, главная)
 *  season_swieta_16x9.webp, season_energylandia_16x9.webp (1672×941, с названием на картинке) → season-swieta{,@640}.webp, season-energylandia{,@640}.webp — обложки сезонов «Польское Рождество» и «Поездка в Energylandię»
 *  bobek_barista_cutout.webp  (1122×1402, RGBA)           → barista.webp — вырезка героя карточки «Продолжить» (Бобек-бариста с флагом-розеткой на фартуке)
 * Вырезка чистится так же, как слои заставки (scripts/lib/sprite.mjs): альфа 253 → 255, дырочки, цвет кромки — по ближайшему плотному пикселю.
 * Размеры вырезки (ширина × высота) печатаются в конце: их нужно держать в `PASS_CUTOUT` (apps/web/src/lib/assets.ts).
 */
import { mkdirSync, readFileSync } from 'node:fs';
import { bounds, cleanSprite, crop, readRGBA, sharp, webp } from './lib/sprite.mjs';

const SRC = new URL('../docs/design/v19/pass/', import.meta.url);
const args = process.argv.slice(2);
const out = args.includes('--out') ? new URL(`file://${args[args.indexOf('--out') + 1].replace(/\/?$/, '/')}`) : new URL('../apps/web/src/assets/pass/', import.meta.url);
mkdirSync(out, { recursive: true });

const sizes = [];
const save = async (name, buf) => {
  await sharp(buf).toFile(new URL(name, out).pathname);
  sizes.push(`${name} ${Math.round(buf.length / 1024)} КБ`);
};

/** Кадр → два файла: полный (width px) и узкий @640 — для телефонов с DPR 1. */
async function frame(master, name, width, ratio) {
  const base = sharp(readFileSync(new URL(master, SRC)));
  const h = Math.round(width / ratio);
  // Мастер может быть чуть выше нужного отношения: берём по центру.
  const meta = await base.clone().metadata();
  const cropH = Math.round(meta.width / ratio);
  const top = Math.max(0, Math.round((meta.height - cropH) / 2));
  const fit = base.clone().extract({ left: 0, top, width: meta.width, height: Math.min(cropH, meta.height) });
  await save(`${name}.webp`, await fit.clone().resize(width, h, { kernel: 'lanczos3' }).webp({ quality: 82, effort: 6 }).toBuffer());
  await save(`${name}@640.webp`, await fit.clone().resize(640, Math.round(640 / ratio), { kernel: 'lanczos3' }).webp({ quality: 80, effort: 6 }).toBuffer());
}

await frame('stary_rynek_cafe_2x1.webp', 'stary-rynek', 1400, 2);
await frame('stary_rynek_cafe_16x9.webp', 'season-listopad', 1200, 16 / 9);
await frame('season_swieta_16x9.webp', 'season-swieta', 1200, 16 / 9);
await frame('season_energylandia_16x9.webp', 'season-energylandia', 1200, 16 / 9);

// Вырезка: чистка, обрезка по содержимому, высота 340 px (на экране до 112 css px, DPR 3).
const img = await readRGBA(new URL('bobek_barista_cutout.webp', SRC));
const stats = cleanSprite(img, { minArea: 400, defringe: true });
const cut = crop(img, bounds(img, 0));
const H = 340, W = Math.round((cut.w * H) / cut.h);
await save('barista.webp', await webp(cut, W, H, { quality: 90 }));
console.log(`вырезка: плотных ${stats.solid} px, дырочек закрыто ${stats.holes}, цвет кромки заменён у ${stats.fringe} px → ${W}×${H}`);
console.log(sizes.join(' · '));
console.log(`PASS_CUTOUT: barista ${W}×${H}`);
