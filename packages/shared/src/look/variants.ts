/**
 * Готові образи Бобека (рішення власника 2026-11-01: замість єдиної шарової моделі — готові картинки під кожну
 * зміну одягу; docs/BOBEK_VARIANTS.md). Файли готує `scripts/build-bobek-variants.mjs` з мастерів
 * `docs/design/v18/bobek31/`; ключі ассетів логічні, URL визначає застосунок (apps/web/src/assets/variants/).
 *
 * Що вміщує таблиця зараз: чотири речі-осі (кепка, круглі окуляри, польський шарф, рюкзак) у всіх 16 сполученнях, худі —
 * на кожній картинці. Поза `wave` (махає, карта в руці) є в усіх 16, поза `open` (руки розведені) — у 8 з них.
 * Наступна частина образів = нові файли в assets/variants + рядки тут (нова вісь або нові сполучення).
 */
import type { LookMood, LookVariant, LookVariantPose, LookVariants } from './types';

/** Речі-осі, що різнять образи (худі в наборі немає: воно намальоване на кожній картинці). */
export const LOOK_VARIANT_AXES = ['cap-red', 'glasses-round', 'scarf-pl', 'backpack-travel'] as const;

/** Скорочення для імен файлів: худі + речі набору в порядку осей → `hoodie-cap-glasses`. */
const SHORT: Readonly<Record<(typeof LOOK_VARIANT_AXES)[number], string>> = {
  'cap-red': 'cap',
  'glasses-round': 'glasses',
  'scarf-pl': 'scarf',
  'backpack-travel': 'pack',
};

/** Сполучення, для яких є поза `open` (серія 24–31). Ключ — речі набору в порядку осей, без худі. */
const HAS_OPEN: ReadonlySet<string> = new Set(['', 'cap', 'glasses', 'scarf', 'pack', 'cap-glasses', 'glasses-scarf', 'cap-glasses-scarf-pack']);

function buildList(): LookVariant[] {
  const out: LookVariant[] = [];
  for (let mask = 0; mask < 1 << LOOK_VARIANT_AXES.length; mask++) {
    const picked = LOOK_VARIANT_AXES.filter((_, i) => mask & (1 << i));
    const short = picked.map((id) => SHORT[id]).join('-');
    const name = short ? `hoodie-${short}` : 'hoodie';
    const images: Partial<Record<LookVariantPose, string>> = { wave: `variants/${name}_wave` };
    if (HAS_OPEN.has(short)) images.open = `variants/${name}_open`;
    out.push({ id: name, items: [...picked].sort(), images });
  }
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
  moods: MOODS,
  list: buildList(),
};
