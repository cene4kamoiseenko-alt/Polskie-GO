/**
 * Арты экрана «Квесты» (мастера владельца 2026-11-01, docs/design/v19/quests) → apps/web/src/assets/quests.
 *
 *   node scripts/build-quests-art.mjs               — собрать
 *   node scripts/build-quests-art.mjs --out <папка>  — в другую папку (проверка глазами)
 *
 *  hero_krakow_barista_2x1.webp      (1774×887)  → hero.webp{,@640}                — баннер экрана «Квесты» (Бобек-бариста на площади в Кракове)
 *  life_sklep24_16x9.webp            (1672×941)  → life.webp                       — миниатюра входа в «Польский в жизни» (Sklep 24h)
 *  story_warszawa_dworzec_16x9.webp  (1672×941)  → story-warszawa.webp{,@640}      — квест s-warszawa-dworzec «Бобр прибывает в Варшаву»
 *  story_krakow_mieszkanie_16x9.webp (1672×941)  → story-krakow.webp{,@640}        — квест s-krakow-mieszkanie «Бобр ищет квартиру»
 *  story_wroclaw_zgubiony_16x9.webp  (1672×941)  → story-wroclaw.webp{,@640}       — квест s-wroclaw-zgubiony «Бобр потерялся во Вроцлаве»
 *  scene_dworzec_2x1.webp            (1774×887)  → scene-warszawa.webp{,@640}      — картинка В ДИАЛОГЕ квеста s-warszawa-dworzec (окно 2 : 1; Бобек уже на кадре)
 *  scene_mieszkanie_2x1.webp         (1774×887)  → scene-krakow.webp{,@640}        — то же для s-krakow-mieszkanie (2026-11-02; во Вроцлаве кадра 2 : 1 нет — берётся story-wroclaw)
 * Соответствие квест → файл — `QUEST_STORY_ART` в apps/web/src/lib/screenArt.ts. Обложки сезонов «Рождество» и «Energylandia» собирает scripts/build-pass-art.mjs.
 */
import { mkdirSync, readFileSync } from 'node:fs';
import { sharp } from './lib/sprite.mjs';

const SRC = new URL('../docs/design/v19/quests/', import.meta.url);
const args = process.argv.slice(2);
const out = args.includes('--out') ? new URL(`file://${args[args.indexOf('--out') + 1].replace(/\/?$/, '/')}`) : new URL('../apps/web/src/assets/quests/', import.meta.url);
mkdirSync(out, { recursive: true });
const sizes = [];
const save = async (name, buf) => {
  await sharp(buf).toFile(new URL(name, out).pathname);
  sizes.push(`${name} ${Math.round(buf.length / 1024)} КБ`);
};

/** Кадр → полный файл (width px) и узкий @640 для телефонов с DPR 1; высота — по отношению сторон мастера. */
async function frame(master, name, width, { small = true } = {}) {
  const base = sharp(readFileSync(new URL(master, SRC)));
  const meta = await base.clone().metadata();
  await save(`${name}.webp`, await base.clone().resize(width, Math.round((width * meta.height) / meta.width), { kernel: 'lanczos3' }).webp({ quality: 80, effort: 6 }).toBuffer());
  if (small) await save(`${name}@640.webp`, await base.clone().resize(640, Math.round((640 * meta.height) / meta.width), { kernel: 'lanczos3' }).webp({ quality: 78, effort: 6 }).toBuffer());
}

await frame('hero_krakow_barista_2x1.webp', 'hero', 1200);
await frame('life_sklep24_16x9.webp', 'life', 640, { small: false });
await frame('story_warszawa_dworzec_16x9.webp', 'story-warszawa', 1200);
await frame('story_krakow_mieszkanie_16x9.webp', 'story-krakow', 1200);
await frame('story_wroclaw_zgubiony_16x9.webp', 'story-wroclaw', 1200);
await frame('scene_dworzec_2x1.webp', 'scene-warszawa', 1200);
await frame('scene_mieszkanie_2x1.webp', 'scene-krakow', 1200);
console.log(sizes.join(' · '));
