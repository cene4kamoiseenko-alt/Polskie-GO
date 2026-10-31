/**
 * Маніфест образу на поточний стан репозиторію (ADR-005).
 *
 * Що є насправді:
 * - Шарової живописної бази ще немає (`base.status = 'pending'`): поки малюється цілісний
 *   базовий образ `legacyBase` — 14 поз `apps/web/src/assets/beaver/*.webp`, у кожну впечатані
 *   червоне худі PL і зелений рюкзак. Полотна різні (512, 768 і 1024 — wave, read, celebrate: майстри власника 2026-10-31), масштаб і положення голови
 *   між позами відрізняються — шари на них не накладаються.
 * - 7 цілісних костюмів `apps/web/src/assets/costumes/*.webp` (512×512, альфа) — `legacy-whole-look`.
 * - Решта одягу каталогу живописних шарів не має — `pending`: не малюється, у гардеробі «скоро».
 *
 * Ключі ассетів логічні ('beaver/wave', 'costumes/chef'); URL визначає застосунок.
 */
import { LOOK_FROM_CATALOG, LOOK_FRONT_ANCHORS, LOOK_CANVAS } from './spec';
import type { LookCatalogWearSlot, LookLegacyCostumeArt, LookItem, LookManifest, LookPose, LookRarity, LookWearSlot } from './types';

export const LOOK_BASE_VERSION = 'bobek-base@1';

/** Пози еталона шарової бази (ще не намальовані). */
const BASE_POSES: readonly LookPose[] = [
  { id: 'front-idle', view: 'front', arms: { l: 'rest', r: 'rest' }, expression: 'smile' },
  {
    id: 'front-wave',
    view: 'front',
    arms: { l: 'rest', r: 'wave' },
    expression: 'smile',
    anchors: { 'paw-r': { x: 770, y: 380 } },
    rotations: { 'paw-r': -20 },
  },
];

type ItemExtra = Partial<Pick<LookItem, 'occupies' | 'note' | 'hides' | 'replaces'>>;

/** Звичайний предмет без живописного шару: не малюється, «скоро». */
function pending(id: string, catalogSlot: Exclude<LookCatalogWearSlot, 'FRAME'>, rarity: LookRarity = 'common', extra: ItemExtra = {}): LookItem {
  const occupies: readonly LookWearSlot[] = extra.occupies ?? (catalogSlot === 'COSTUME' ? [] : [LOOK_FROM_CATALOG[catalogSlot]]);
  return { id, catalogSlot, domain: 'beaver', occupies, rarity, status: 'pending', fallback: 'hide', compatibility: null, layers: [], ...extra };
}

/** Предмет, що існує лише впечатаним у цілісний базовий образ. */
function inLegacyBase(id: string, catalogSlot: 'JACKET' | 'BACKPACK', note: string): LookItem {
  return {
    id, catalogSlot, domain: 'beaver', occupies: [LOOK_FROM_CATALOG[catalogSlot]], rarity: 'common',
    status: 'legacy-whole-look', fallback: 'legacy-base', compatibility: null, layers: [], note,
  };
}

/**
 * Цілісний костюм. Правило зайнятих слотів:
 * - костюм займає свій одяг (головний убір, шарф, верх, низ, взуття, комбінезон) і рольовий реквізит у лапі;
 * - речі з власним предметом каталогу (поварський ковпак, рюкзак мандрівника) — не частина костюма, а `shows`;
 * - рюкзаки й сумки ніколи не входять у костюм: слот `backpack` лишається за гравцем, а намальована
 *   на картинці сумка — `shows` з 'prop:…'. Так надягання костюма не знімає рюкзак у даних.
 */
function legacyCostume(id: string, rarity: LookRarity, occupies: readonly LookWearSlot[], shows: LookLegacyCostumeArt['shows'], note: string): LookItem {
  const name = id.replace(/^costume-/, '');
  return {
    id, catalogSlot: 'COSTUME', domain: 'beaver', occupies, rarity,
    status: 'legacy-whole-look', fallback: 'legacy-whole-look', compatibility: null, layers: [],
    legacy: { asset: `costumes/${name}`, scene: `costumes/${name}-scene`, size: { w: 512, h: 512 }, view: 'front', shows },
    note,
  };
}

function frame(id: string, rarity: LookRarity): LookItem {
  return {
    id, catalogSlot: 'FRAME', domain: 'profile-frame', occupies: [], rarity,
    status: 'ready', fallback: 'hide', compatibility: null, layers: [],
    note: 'Рамка аватара малюється інтерфейсом профілю; на Бобека не впливає.',
  };
}

export const LOOK_ITEMS: readonly LookItem[] = [
  // Стартові: існують лише всередині цілісного базового образу.
  inLegacyBase('hoodie-red', 'JACKET', 'Впечатане в усі 14 поз legacy-base. Шар — у еталоні etalon-1.'),
  inLegacyBase('backpack-travel', 'BACKPACK', 'Впечатаний в усі 14 поз legacy-base. Шар — у еталоні etalon-1.'),
  // Головні убори
  pending('cap-green', 'HAT'),
  pending('cap-red', 'HAT'),
  pending('beanie-blue', 'HAT', 'common', { hides: ['tuft'] }),
  pending('hat-chef', 'HAT', 'rare'),
  pending('hat-krasnal', 'HAT', 'epic', { hides: ['tuft'] }),
  pending('crown-gold', 'HAT', 'legendary'),
  // Окуляри
  pending('glasses-round', 'GLASSES'),
  pending('glasses-sun', 'GLASSES', 'rare'),
  pending('glasses-star', 'GLASSES', 'epic'),
  // Шарфи
  pending('scarf-pl', 'SCARF', 'rare'),
  pending('scarf-ua', 'SCARF', 'rare'),
  pending('scarf-green', 'SCARF'),
  // Верх
  pending('jacket-denim', 'JACKET', 'common', { replaces: ['torso'] }),
  pending('jacket-rain', 'JACKET', 'common', { replaces: ['torso'] }),
  pending('vest-krakowiak', 'JACKET', 'epic', { replaces: ['torso'] }),
  // Рюкзаки
  pending('backpack-map', 'BACKPACK', 'rare'),
  // Взуття
  pending('sneakers-white', 'SHOES'),
  pending('boots-mountain', 'SHOES'),
  // Аксесуари (реквізит у лапі)
  pending('flag-pl', 'ACCESSORY'),
  pending('camera', 'ACCESSORY'),
  pending('map-paper', 'ACCESSORY'),
  pending('obwarzanek', 'ACCESSORY'),
  // Костюми: цілісні картинки перехідного періоду
  legacyCostume('costume-barista', 'rare', ['top', 'accessory'], { backpack: 'backpack-travel' },
    'Сорочка, фартух, краватка, чашка. На картинці зелений рюкзак мандрівника; ноги обрізані.'),
  legacyCostume('costume-chef', 'rare', ['top', 'neck', 'accessory'], { headwear: 'hat-chef' },
    'Кухарський кітель, хустка, ложка. Ковпак — окремий предмет hat-chef, на картинці він є.'),
  legacyCostume('costume-conductor', 'epic', ['headwear', 'top', 'accessory'], { backpack: 'prop:messenger-bag' },
    'Кашкет, форма, квиток — власних предметів у каталозі немає. Сумка через плече — лише на картинці.'),
  legacyCostume('costume-krasnal', 'legendary', ['top', 'accessory'], { headwear: 'hat-krasnal', backpack: 'prop:crossbody-bag' },
    'Камізелька, сорочка, ліхтар. Ковпак вважаємо hat-krasnal — потребує підтвердження власника.'),
  legacyCostume('costume-artist', 'epic', ['headwear', 'neck', 'top', 'accessory'], {},
    'Берет, шарф, блуза, палітра й пензель — власних предметів немає.'),
  legacyCostume('costume-winter', 'rare', ['headwear', 'neck', 'top', 'shoes'], { backpack: 'prop:brown-backpack' },
    'Шапка, шарф, пуховик з рукавицями, черевики — власних предметів немає. Коричневий рюкзак — лише на картинці.'),
  legacyCostume('costume-dragon', 'legendary', ['body', 'head'], { backpack: 'prop:brown-strap' },
    'Комбінезон з крилами й капюшон. Коричневий ремінь сумки на плечі — лише на картинці.'),
  pending('costume-syrenka', 'COSTUME', 'epic', { occupies: ['body'], note: 'Живописної картинки немає ні цілісної, ні шарової.' }),
  // Рамки профілю
  frame('frame-green', 'common'),
  frame('frame-gold', 'legendary'),
];

export const LOOK_MANIFEST: LookManifest = {
  version: 1,
  canvas: LOOK_CANVAS,
  anchors: { front: LOOK_FRONT_ANCHORS },
  base: {
    id: 'bobek',
    version: LOOK_BASE_VERSION,
    status: 'pending',
    views: ['front'],
    poses: BASE_POSES,
    moods: { happy: 'front-idle', wave: 'front-wave', mic: 'front-wave', learn: 'front-wave' },
    defaultPose: { front: 'front-idle' },
    layers: [],
  },
  legacyBase: {
    id: 'legacy-base',
    includes: { top: 'hoodie-red', backpack: 'backpack-travel' },
    poses: {
      wave: { asset: 'beaver/wave', size: { w: 1024, h: 1024 }, view: 'front' },
      greet: { asset: 'beaver/greet', size: { w: 512, h: 512 }, view: 'front' },
      think: { asset: 'beaver/think', size: { w: 768, h: 768 }, view: 'front' },
      doubt: { asset: 'beaver/doubt', size: { w: 512, h: 512 }, view: 'front' },
      correct: { asset: 'beaver/correct', size: { w: 512, h: 512 }, view: 'front' },
      support: { asset: 'beaver/support', size: { w: 512, h: 512 }, view: 'front' },
      victory: { asset: 'beaver/victory', size: { w: 512, h: 512 }, view: 'front' },
      celebrate: { asset: 'beaver/celebrate', size: { w: 1024, h: 1024 }, view: 'front' },
      read: { asset: 'beaver/read', size: { w: 1024, h: 1024 }, view: 'front' },
      travel: { asset: 'beaver/travel', size: { w: 512, h: 512 }, view: 'front' },
      front: { asset: 'beaver/front', size: { w: 512, h: 512 }, view: 'front' },
      'three-quarter': { asset: 'beaver/three-quarter', size: { w: 512, h: 512 }, view: 'three-quarter' },
      side: { asset: 'beaver/side', size: { w: 512, h: 512 }, view: 'side' },
      back: { asset: 'beaver/back', size: { w: 512, h: 512 }, view: 'back' },
      // Пози власника 2026-10-31 (оригінали — docs/design/v16/bobek/): той самий масштаб і лінія ніг, що в wave.
      coffee: { asset: 'beaver/coffee', size: { w: 1024, h: 1024 }, view: 'front' },
      pay: { asset: 'beaver/pay', size: { w: 1024, h: 1024 }, view: 'front' },
      parcel: { asset: 'beaver/parcel', size: { w: 1024, h: 1024 }, view: 'front' },
      idea: { asset: 'beaver/idea', size: { w: 1024, h: 1024 }, view: 'front' },
      surprised: { asset: 'beaver/surprised', size: { w: 1024, h: 1024 }, view: 'front' },
      tired: { asset: 'beaver/tired', size: { w: 1024, h: 1024 }, view: 'front' },
      laptop: { asset: 'beaver/laptop', size: { w: 1024, h: 1024 }, view: 'front' },
      sleep: { asset: 'beaver/sleep', size: { w: 1024, h: 1024 }, view: 'front' },
    },
    // royal, music — пози немає (запасна поза).
    moods: {
      wave: 'wave', happy: 'greet', travel: 'travel', map: 'front', explain: 'idea',
      think: 'think', wait: 'doubt', surprised: 'surprised', mic: 'wave', cheer: 'correct',
      sad: 'support', celebrate: 'victory', gift: 'celebrate', read: 'read', learn: 'read',
      sleep: 'sleep', coffee: 'coffee', pay: 'pay', parcel: 'parcel', tired: 'tired', laptop: 'laptop',
    },
    views: { 'three-quarter': 'three-quarter', side: 'side', back: 'back' },
    fallbackPose: 'greet',
  },
  items: LOOK_ITEMS,
  signatureDefaults: { top: 'hoodie-red' },
};

/** Етапи перенесення: каталог не переносимо, доки еталон не прийнятий. */
export type LookMilestone = { id: string; title: string; base: boolean; views: readonly string[]; poses: readonly string[]; items: readonly string[] };
export const LOOK_MILESTONES: readonly LookMilestone[] = [
  {
    id: 'etalon-1',
    title: 'База + червоне худі PL + кепка + рюкзак + взуття',
    base: true,
    views: ['front'],
    poses: ['front-idle', 'front-wave'],
    items: ['hoodie-red', 'cap-red', 'backpack-travel', 'sneakers-white'],
  },
  {
    id: 'etalon-2',
    title: 'Костюми баристи й кухаря (шарами) + поварський ковпак',
    base: false,
    views: ['front'],
    poses: ['front-idle', 'front-wave'],
    items: ['costume-barista', 'costume-chef', 'hat-chef'],
  },
];
