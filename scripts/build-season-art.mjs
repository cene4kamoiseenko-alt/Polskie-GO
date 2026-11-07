/**
 * Картинки сезонов пропуска (присланы 2026-11-07, мастера — docs/design/v21/seasons/*.webp, 1536×1024) → apps/web/src/assets/pass.
 *
 *   node scripts/build-season-art.mjs               — собрать
 *   node scripts/build-season-art.mjs --out <папка>  — собрать в другую папку (посмотреть глазами)
 *
 * Из каждого мастера получается:
 *   season-<сезон>{,@640}.webp  — обложка сезона 16:9 (1200×675 и 640×360): экран пропуска, главная, «Польский в жизни». Для «Święta» остаётся прежняя
 *                                  обложка с названием на кадре (season-swieta), новая картинка идёт только в миссии.
 *   scene-<сезон>{,@640}.webp   — кадр миссии 2:1 (1400×700 и 640×320): карточка в пропуске и фон вступления миссии. Бобек на кадре нарисован,
 *                                  поэтому второй поверх не показывается (PASS_MISSION_SCENE в lib/screenArt.ts).
 * Из 3:2 вырезается полоса: `top` — доля свободной высоты, отрезаемая сверху (0 — кадр прижат вверх, 1 — вниз); подобрана так, чтобы голова и руки Бобека
 * и главный предмет остались в кадре.
 */
import { readFileSync, mkdirSync } from 'node:fs';
import { sharp } from './lib/sprite.mjs';

const SRC = new URL('../docs/design/v21/seasons/', import.meta.url);
const args = process.argv.slice(2);
const out = args.includes('--out') ? new URL(`file://${args[args.indexOf('--out') + 1].replace(/\/?$/, '/')}`) : new URL('../apps/web/src/assets/pass/', import.meta.url);
mkdirSync(out, { recursive: true });

/** `cover` — делать ли обложку сезона; `coverTop` / `sceneTop` — см. выше. */
const SEASONS = [
  { slug: 'swieta', cover: false, coverTop: 0.4, sceneTop: 0.5 },
  { slug: 'karnawal', cover: true, coverTop: 0.4, sceneTop: 0.5 },
  { slug: 'walentynki', cover: true, coverTop: 0.4, sceneTop: 0.45 },
  { slug: 'wielkanoc', cover: true, coverTop: 0.4, sceneTop: 0.45 },
  { slug: 'wiosna', cover: true, coverTop: 0.25, sceneTop: 0.3 },
  { slug: 'majowka', cover: true, coverTop: 0.3, sceneTop: 0.3 },
  { slug: 'wianki', cover: true, coverTop: 0.4, sceneTop: 0.5 },
];

const sizes = [];
async function frame(master, name, width, ratio, top) {
  const base = sharp(readFileSync(new URL(`${master}.webp`, SRC)));
  const meta = await base.metadata();
  const cropH = Math.round(meta.width / ratio);
  const y = Math.round((meta.height - cropH) * top);
  const fit = base.clone().extract({ left: 0, top: y, width: meta.width, height: cropH });
  for (const [suffix, w, q] of [['', width, 82], ['@640', 640, 80]]) {
    const file = `${name}${suffix}.webp`;
    const buf = await fit.clone().resize(w, Math.round(w / ratio), { kernel: 'lanczos3' }).webp({ quality: q, effort: 6 }).toBuffer();
    await sharp(buf).toFile(new URL(file, out).pathname);
    sizes.push(`${file} ${Math.round(buf.length / 1024)} КБ`);
  }
}

for (const s of SEASONS) {
  if (s.cover) await frame(s.slug, `season-${s.slug}`, 1200, 16 / 9, s.coverTop);
  await frame(s.slug, `scene-${s.slug}`, 1400, 2, s.sceneTop);
}
console.log(sizes.join(' · '));
