/**
 * Готові образи Бобека (рішення власника 2026-11-01: замість єдиної шарової моделі — готові картинки під кожну
 * зміну одягу; docs/BOBEK_VARIANTS.md). Файли готує `scripts/build-bobek-variants.mjs` з мастерів
 * `docs/design/v18/bobek31/` і `bobek-part2/`; ключі ассетів логічні, URL визначає застосунок (apps/web/src/assets/variants/).
 *
 * Що вміщує таблиця зараз:
 * - повна сітка з чотирьох речей-осей (кепка, круглі окуляри, польський шарф, рюкзак) у всіх 16 сполученнях; худі — на кожній
 *   картинці. Поза `wave` (махає, карта в руці) є в усіх 16, поза `open` (руки розведені) — у 8 з них;
 * - куртки поверх худі (друга й третя партії): джинсова куртка й жовтий дощовик, лише 5 сполучень — часткова сітка. Для решти сполучень
 *   `resolveLook` малює найбільший образ, що вміщується, а вдягнене понад нього позначає `no-variant`.
 * Наступна частина образів = нові файли в assets/variants + рядки тут (нова вісь або нові сполучення).
 */
import type { LookMood, LookVariant, LookVariantPose, LookVariants } from './types';

/** Речі повної сітки 2⁴: кепка, окуляри, шарф і рюкзак у будь-яких сполученнях. */
export const LOOK_VARIANT_AXES = ['cap-red', 'glasses-round', 'scarf-pl', 'backpack-travel'] as const;
/** Куртки другої партії: носяться поверх худі, образи лише для частини сполучень. */
export const LOOK_VARIANT_JACKETS = ['jacket-denim', 'jacket-rain'] as const;

/**
 * Порядок речей в імені файлу й пріоритет показу (від важливішої): куртки, голова, шия, рюкзак.
 * Збігається з ORDER у scripts/build-bobek-variants.mjs.
 */
const PRIORITY = ['jacket-denim', 'jacket-rain', 'cap-red', 'glasses-round', 'scarf-pl', 'backpack-travel'] as const;

const SHORT: Readonly<Record<(typeof PRIORITY)[number], string>> = {
  'jacket-denim': 'denim',
  'jacket-rain': 'rain',
  'cap-red': 'cap',
  'glasses-round': 'glasses',
  'scarf-pl': 'scarf',
  'backpack-travel': 'pack',
};

/** Сполучення, для яких є поза `open` (серія 24–31). Ключ — id образу. */
const HAS_OPEN: ReadonlySet<string> = new Set([
  'hoodie', 'hoodie-cap', 'hoodie-glasses', 'hoodie-scarf', 'hoodie-pack', 'hoodie-cap-glasses', 'hoodie-glasses-scarf', 'hoodie-cap-glasses-scarf-pack',
]);

/** Друга й третя партії: сполучення з куртками, які є в мастерах (docs/design/v18/bobek-part2, bobek-part3). Поза лише `wave`. */
const JACKET_SETS: readonly (readonly string[])[] = [
  ['jacket-denim', 'backpack-travel'],
  ['jacket-denim', 'cap-red', 'glasses-round', 'backpack-travel'],
  ['jacket-rain', 'backpack-travel'],
  ['jacket-rain', 'glasses-round', 'backpack-travel'],
  ['jacket-rain', 'cap-red', 'glasses-round', 'backpack-travel'],
];

const nameOf = (items: readonly string[]) => ['hoodie', ...PRIORITY.filter((id) => items.includes(id)).map((id) => SHORT[id])].join('-');

function variant(items: readonly string[]): LookVariant {
  const id = nameOf(items);
  const images: Partial<Record<LookVariantPose, string>> = { wave: `variants/${id}_wave` };
  if (HAS_OPEN.has(id)) images.open = `variants/${id}_open`;
  return { id, items: [...items].sort(), images };
}

function buildList(): LookVariant[] {
  const out: LookVariant[] = [];
  for (let mask = 0; mask < 1 << LOOK_VARIANT_AXES.length; mask++) out.push(variant(LOOK_VARIANT_AXES.filter((_, i) => mask & (1 << i))));
  for (const set of JACKET_SETS) out.push(variant(set));
  return out.sort((a, b) => a.items.length - b.items.length || (a.id < b.id ? -1 : 1));
}

/** Стани, для яких є окрема поза. Усі інші показують `defaultPose` із `poseFallback`. */
const MOODS: Partial<Record<LookMood, LookVariantPose>> = {
  happy: 'wave', wave: 'wave', mic: 'wave', learn: 'wave', map: 'wave', travel: 'wave',
  cheer: 'open', celebrate: 'open', gift: 'open', sad: 'open',
};

export const LOOK_VARIANTS: LookVariants = {
  id: 'variants',
  includes: { top: 'hoodie-red' },
  defaultPose: 'wave',
  priority: PRIORITY,
  moods: MOODS,
  list: buildList(),
};
