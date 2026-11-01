/**
 * Готові образи Бобека (рішення власника 2026-11-01: замість єдиної шарової моделі — готові картинки під кожну
 * зміну одягу; docs/BOBEK_VARIANTS.md). Файли готує `scripts/build-bobek-variants.mjs` з мастерів
 * `docs/design/v18/bobek31/` і `bobek-part2/`; ключі ассетів логічні, URL визначає застосунок (apps/web/src/assets/variants/).
 *
 * Що вміщує таблиця зараз:
 * - повна сітка з чотирьох речей-осей (кепка, круглі окуляри, польський шарф, рюкзак) у всіх 16 сполученнях; худі — на кожній
 *   картинці. Поза `wave` (махає, карта в руці) є в усіх 16, поза `open` (руки розведені) — у 8 з них;
 * - куртки (друга, третя й четверта партії): джинсова куртка й жовтий дощовик — часткова сітка (16 сполучень). Куртка й худі ділять слот `top`,
 *   тому нові образи четвертої партії намальовані БЕЗ худі; образи з худі під курткою (`lining`) лишилися там, де образу без худі ще немає.
 *   Для решти сполучень `resolveLook` малює найбільший образ, що вміщується, а вдягнене понад нього позначає `no-variant`.
 * - червона в'язана шапка `beanie-red` (четверта партія): лише з куртками, на одному слоті з кепкою.
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
const PRIORITY = ['jacket-denim', 'jacket-rain', 'cap-red', 'beanie-red', 'glasses-round', 'scarf-pl', 'backpack-travel'] as const;

const SHORT: Readonly<Record<(typeof PRIORITY)[number], string>> = {
  'jacket-denim': 'denim',
  'jacket-rain': 'rain',
  'cap-red': 'cap',
  'beanie-red': 'beanie',
  'glasses-round': 'glasses',
  'scarf-pl': 'scarf',
  'backpack-travel': 'pack',
};

/** Сполучення, для яких є поза `open` (серія 24–31). Ключ — id образу. */
const HAS_OPEN: ReadonlySet<string> = new Set([
  'hoodie', 'hoodie-cap', 'hoodie-glasses', 'hoodie-scarf', 'hoodie-pack', 'hoodie-cap-glasses', 'hoodie-glasses-scarf', 'hoodie-cap-glasses-scarf-pack',
]);

/**
 * Сполучення з куртками, які є в мастерах (docs/design/v18/bobek-part2…part4). Поза лише `wave`.
 * `lining` — на картинці під курткою видно червоне худі (друга й третя партії). Куртка займає той самий слот `top`, що й худі, тому
 * сучасні образи (четверта партія) намальовані без худі, а ім'я файлу не починається з `hoodie-`.
 */
type JacketSet = { items: readonly string[]; lining?: true };
const JACKET_SETS: readonly JacketSet[] = [
  // Худі під курткою: сполучення, для яких образу без худі ще немає.
  { lining: true, items: ['jacket-denim', 'cap-red', 'glasses-round', 'backpack-travel'] },
  { lining: true, items: ['jacket-denim', 'cap-red', 'glasses-round'] },
  { lining: true, items: ['jacket-rain', 'glasses-round', 'backpack-travel'] },
  { lining: true, items: ['jacket-rain', 'cap-red', 'glasses-round', 'backpack-travel'] },
  // Без худі (четверта партія): джинсова куртка…
  { items: ['jacket-denim'] },
  { items: ['jacket-denim', 'glasses-round'] },
  { items: ['jacket-denim', 'beanie-red'] },
  { items: ['jacket-denim', 'cap-red'] },
  { items: ['jacket-denim', 'backpack-travel'] },
  { items: ['jacket-denim', 'beanie-red', 'glasses-round', 'backpack-travel'] },
  // …і дощовик
  { items: ['jacket-rain'] },
  { items: ['jacket-rain', 'glasses-round'] },
  { items: ['jacket-rain', 'beanie-red'] },
  { items: ['jacket-rain', 'cap-red'] },
  { items: ['jacket-rain', 'backpack-travel'] },
  { items: ['jacket-rain', 'beanie-red', 'glasses-round', 'backpack-travel'] },
];

/** Ім'я файлу й id образу: `hoodie-…` — худі видно на картинці, інакше лише речі (`denim-pack`). Порядок речей — PRIORITY. */
const nameOf = (items: readonly string[], hoodie: boolean) =>
  [...(hoodie ? ['hoodie'] : []), ...PRIORITY.filter((id) => items.includes(id)).map((id) => SHORT[id])].join('-');

function variant(items: readonly string[], hoodie = true): LookVariant {
  const id = nameOf(items, hoodie);
  const images: Partial<Record<LookVariantPose, string>> = { wave: `variants/${id}_wave` };
  if (HAS_OPEN.has(id)) images.open = `variants/${id}_open`;
  return { id, items: [...items].sort(), images };
}

function buildList(): LookVariant[] {
  const out: LookVariant[] = [];
  for (let mask = 0; mask < 1 << LOOK_VARIANT_AXES.length; mask++) out.push(variant(LOOK_VARIANT_AXES.filter((_, i) => mask & (1 << i))));
  for (const set of JACKET_SETS) out.push(variant(set.items, set.lining === true));
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
