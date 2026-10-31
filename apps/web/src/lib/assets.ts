/**
 * Растрові ассети (WebP/PNG з прозорим фоном), підключені через import.meta.glob: відсутній файл не ламає екран.
 *   src/assets/beaver/<поза>.webp      — цілісні пози Бобека (legacy-base маніфесту образу, ADR-005)
 *   src/assets/costumes/<костюм>.webp   — Бобек у цілісному костюмі (legacy-whole-look), <костюм>-scene.webp — сцена картки
 *   src/assets/look/<ракурс>/<предмет>/<частина>-<поза>.webp — шари на спільному полотні 1024 (з'являться з пайплайна)
 *   src/assets/cities/<slug>.webp       — панорама міста і <slug>@640.webp; статуси й розміри — CITY_ART (@polski-go/shared)
 *   src/assets/scenes/<file>.webp      — растрові сцени місій і <file>@640.webp; статуси й розміри — SCENE_ART (@polski-go/shared)
 *   src/assets/icons/<name>.webp        — ігрові іконки (lessons, quests, map, profile, leaderboard, streak, zlotki, level, …)
 *   src/assets/items/<slug>.webp        — мальовані значки речей гардероба 256×256 (листи владельца 2026-10-29, docs/design/a12/items)
 *   src/assets/brand/<name>.webp        — логотип (logo) і портрет Бобека для аватара (avatar)
 *
 * Варіант ширини доставки — файл `<ключ>@<ширина>.webp` (256, 512, 1024) поруч з основним; якщо його немає,
 * береться основний файл. Який Бобек малювати, вирішує не цей файл, а resolveLook (@polski-go/shared, lib/look.ts).
 */
import { CITY_ART, CITY_ART_SMALL, LOOK_CANVAS, LOOK_MANIFEST, MISSION_SCENE_ART, SCENE_ART, SCENE_ART_SMALL, type SceneArt } from '@polski-go/shared';

const files = import.meta.glob('../assets/**/*.{webp,png}', { eager: true, import: 'default' }) as Record<string, string>;

function pick(dir: string, name: string): string | null {
  return files[`../assets/${dir}/${name}.webp`] ?? files[`../assets/${dir}/${name}.png`] ?? null;
}

/** Логічний ключ ассета з маніфесту образу ('beaver/wave', 'costumes/chef') → URL основного файлу. */
export function assetByKey(key: string): string | null {
  return files[`../assets/${key}.webp`] ?? files[`../assets/${key}.png`] ?? null;
}

/** Ширина доставки: найменша з 256/512/1024, не менша за розмір на екрані × min(DPR, 3). */
export function lookDeliveryWidth(size: number, dpr = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1): number {
  const need = size * Math.min(Math.max(dpr, 1), 3);
  const widths = [...LOOK_CANVAS.deliveryWidths].sort((a, b) => a - b);
  return widths.find((w) => w >= need) ?? widths[widths.length - 1];
}

/** URL шару образу для ширини доставки: варіант `@w`, більший варіант, основний файл, менший варіант — у такому порядку. */
export function lookAssetUrl(key: string, width: number): string | null {
  const widths = [...LOOK_CANVAS.deliveryWidths].sort((a, b) => a - b);
  const variant = (w: number) => files[`../assets/${key}@${w}.webp`] ?? null;
  for (const w of widths) if (w >= width && variant(w)) return variant(w);
  const base = assetByKey(key);
  if (base) return base;
  for (const w of [...widths].reverse()) if (variant(w)) return variant(w);
  return null;
}

/**
 * Поза стану Бобека в цілісному базовому образі (до завантаження профілю: заставка).
 * Таблиця станів — у маніфесті образу (legacyBase.moods), а не тут. Стан без пози → null.
 */
export const beaverAsset = (mood: string) => {
  const lb = LOOK_MANIFEST.legacyBase;
  const pose = Object.prototype.hasOwnProperty.call(lb.moods, mood) ? lb.moods[mood as keyof typeof lb.moods] : undefined;
  return pose && lb.poses[pose] ? assetByKey(lb.poses[pose].asset) : null;
};

/** Костюм (asset_key предмета 'costume-<name>') → назва файлу. Картинки для карток гардероба. */
const costumeName = (key: string) => key.replace(/^costume-/, '');
export const costumeAsset = (key: string) => pick('costumes', costumeName(key));
export const costumeScene = (key: string) => pick('costumes', `${costumeName(key)}-scene`);
/** Мальований значок речі гардероба (asset_key = slug предмета) або null — тоді векторний значок BeaverPart. */
export const itemIcon = (key: string) => pick('items', key);
/** Образ «Мандрівник» — стартовий одяг; для нього є лише сцена картки. */
export const travellerScene = () => pick('costumes', 'traveller-scene');

export const cityAsset = (slug: string) => pick('cities', slug);

/**
 * Панорама міста для <img>: основний файл і варіант `<slug>@640.webp` у srcset (ширини — з інвентаря CITY_ART),
 * щоб мініатюри й вузькі екрани не тягнули файл на 1440 px. Немає файлу → null (клієнт малює загальну сцену).
 * Лише final: тимчасові кадри (interim, збільшені фрагменти дошок) виглядали мутними, тож до майстер-файлу
 * клієнт малює ілюстрацію з позначкою «скоро» (рішення власника 2026-10-27).
 */
export function cityArtImage(slug: string): { src: string; srcSet?: string; small: string } | null {
  const art = CITY_ART[slug];
  // Фінальний кадр — завжди; тимчасовий — лише з дозволу власника (shown), інакше клієнт малює ілюстрацію.
  if (!art || !(art.status === 'final' || (art.status === 'interim' && art.shown))) return null;
  const src = pick('cities', slug);
  if (!src) return null;
  const small = files[`../assets/cities/${slug}@${CITY_ART_SMALL}.webp`];
  const width = CITY_ART[slug]?.width;
  return small && width ? { src, srcSet: `${small} ${CITY_ART_SMALL}w, ${src} ${width}w`, small } : { src, small: src };
}
/**
 * Растрова сцена місії для <img>: основний файл і варіант `@640` у srcset. Місії без картинки (і відсутній файл) → null:
 * клієнт малює SVG-сцену. Тимчасові кадри мають Бобека в самій картинці (art.bakedBobek).
 */
export function missionSceneArt(missionSlug: string): { art: SceneArt; src: string; srcSet: string } | null {
  const art = SCENE_ART[MISSION_SCENE_ART[missionSlug] ?? ''];
  if (!art) return null;
  const src = pick('scenes', art.file);
  const small = files[`../assets/scenes/${art.file}@${SCENE_ART_SMALL}.webp`];
  if (!src) return null;
  return { art, src, srcSet: small ? `${small} ${SCENE_ART_SMALL}w, ${src} ${art.width}w` : src };
}
export const iconAsset = (name: string) => pick('icons', name);
export const brandAsset = (name: string) => pick('brand', name);
