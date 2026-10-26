/**
 * Специфікація полотна, якорів, z-порядку, правил слотів і шаблонів частин (ADR-005).
 * Цифри якорів — цільові для базового листа `bobek-base@1`; після затвердження базового
 * малюнка вони фіксуються, а перевірка ассетів порівнює з ними з допуском LOOK_ANCHOR_TOLERANCE.
 */
import type { LookAnchorId, LookBasePart, LookCatalogWearSlot, LookCanvas, LookSlot, LookPoint, LookWearSlot, LookZBand } from './types';
import { LOOK_Z_BANDS } from './types';

export const LOOK_CANVAS: LookCanvas = { width: 1024, height: 1024, masterScale: 2, deliveryWidths: [256, 512, 1024] };

/** Допуск вирівнювання шару відносно якоря, у логічних px полотна 1024. */
export const LOOK_ANCHOR_TOLERANCE = 4;

const p = (x: number, y: number): LookPoint => ({ x, y });

/**
 * Фронтальний ракурс, полотно 1024×1024. Велика кругла голова ≈ половина зросту:
 * маківка 92, підборіддя ≈ 540, підошви 968. Центр по x = 512.
 */
export const LOOK_FRONT_ANCHORS: Readonly<Record<LookAnchorId, LookPoint>> = {
  ground: p(512, 968),
  'foot-l': p(432, 948),
  'foot-r': p(592, 948),
  pelvis: p(512, 800),
  'tail-root': p(400, 820),
  back: p(512, 640),
  'shoulder-l': p(376, 600),
  'shoulder-r': p(648, 600),
  neck: p(512, 548),
  muzzle: p(512, 420),
  eyes: p(512, 330),
  'head-center': p(512, 316),
  'head-top': p(512, 92),
  'ear-l': p(312, 150),
  'ear-r': p(712, 150),
  'paw-l': p(340, 760),
  'paw-r': p(684, 760),
};

/** Числовий порядок смуг: індекс у LOOK_Z_BANDS × 100 + z шару. */
export const LOOK_Z_ORDER: Readonly<Record<LookZBand, number>> = Object.fromEntries(LOOK_Z_BANDS.map((b, i) => [b, i * 100])) as Record<LookZBand, number>;
export const lookZ = (band: LookZBand, z = 0) => LOOK_Z_ORDER[band] + z;

/** Дозволені смуги для слота. `head`/`face` — лише база: предмет не перемальовує морду. */
export const LOOK_ALLOWED_BANDS: Readonly<Record<LookSlot, readonly LookZBand[]>> = {
  base: ['shadow', 'tail', 'legs', 'torso', 'head', 'face', 'arm-front', 'fx'],
  // Крила/плащ комбінезона — позаду тулуба, у смузі рюкзака.
  body: ['backpack-back', 'legs', 'torso', 'arm-front'],
  head: ['head-back', 'head-cover'],
  top: ['torso', 'arm-front'],
  bottom: ['legs'],
  headwear: ['head-back', 'headwear'],
  neck: ['neck'],
  shoes: ['shoes'],
  backpack: ['backpack-back', 'backpack-straps'],
  glasses: ['glasses'],
  accessory: ['held-prop'],
};

/**
 * Явні правила конфліктів між слотами: предмет, що займає `slot`, блокує також `blocks`.
 * Плюс загальне правило: два предмети з одного слота каталогу — конфлікт (як на сервері).
 */
export type LookSlotRule = { slot: LookWearSlot; blocks: readonly LookWearSlot[]; why: string };
export const LOOK_SLOT_RULES: readonly LookSlotRule[] = [
  { slot: 'body', blocks: ['top', 'bottom'], why: 'Комбінезон на все тіло закриває верх і низ.' },
  { slot: 'head', blocks: ['headwear'], why: 'Капюшон-маска на голові несумісний з головним убором.' },
];

/** Слот каталогу → слот образу для звичайних (не багатослотових) предметів. */
export const LOOK_FROM_CATALOG: Readonly<Record<Exclude<LookCatalogWearSlot, 'COSTUME' | 'FRAME'>, LookWearSlot>> = {
  HAT: 'headwear',
  GLASSES: 'glasses',
  SCARF: 'neck',
  JACKET: 'top',
  BACKPACK: 'backpack',
  SHOES: 'shoes',
  ACCESSORY: 'accessory',
};

/** Порядок пріоритету при розборі конфліктів у старих даних: ширший предмет перемагає. */
export const LOOK_CATALOG_PRIORITY: readonly LookCatalogWearSlot[] = ['COSTUME', 'JACKET', 'HAT', 'BACKPACK', 'SHOES', 'GLASSES', 'SCARF', 'ACCESSORY', 'FRAME'];

/**
 * Шаблони частин: що треба намалювати для слота. `perPose` — окремий малюнок на кожну позу
 * (залежить від лап/ніг), інакше один малюнок на ракурс — «один предмет виглядає однаково».
 */
export type LookPartTemplate = {
  part: string;
  band: LookZBand;
  perPose: boolean;
  anchor?: LookAnchorId;
  /** Як вирівнювати при імпорті: `registered` — за якорями тулуба; `anchored` — жорсткий предмет на якорі. */
  placement: 'registered' | 'anchored';
  optional?: boolean;
  replaces?: readonly LookBasePart[];
};

export const LOOK_BASE_TEMPLATE: readonly (LookPartTemplate & { part: LookBasePart })[] = [
  { part: 'shadow', band: 'shadow', perPose: false, anchor: 'ground', placement: 'registered' },
  { part: 'tail', band: 'tail', perPose: false, anchor: 'tail-root', placement: 'registered' },
  { part: 'legs', band: 'legs', perPose: true, anchor: 'pelvis', placement: 'registered' },
  { part: 'torso', band: 'torso', perPose: true, anchor: 'neck', placement: 'registered' },
  { part: 'ears', band: 'head', perPose: false, anchor: 'head-top', placement: 'registered' },
  { part: 'head', band: 'head', perPose: false, anchor: 'head-center', placement: 'registered' },
  { part: 'tuft', band: 'head', perPose: false, anchor: 'head-top', placement: 'registered' },
  { part: 'face', band: 'face', perPose: true, anchor: 'eyes', placement: 'registered' },
];

export const LOOK_SLOT_TEMPLATES: Readonly<Record<LookWearSlot, readonly LookPartTemplate[]>> = {
  body: [
    { part: 'suit-torso', band: 'torso', perPose: true, anchor: 'neck', placement: 'registered', replaces: ['torso'] },
    { part: 'suit-legs', band: 'legs', perPose: true, anchor: 'pelvis', placement: 'registered', replaces: ['legs'] },
  ],
  head: [
    { part: 'cover', band: 'head-cover', perPose: false, anchor: 'head-center', placement: 'registered' },
    { part: 'cover-back', band: 'head-back', perPose: false, anchor: 'head-center', placement: 'registered', optional: true },
  ],
  top: [{ part: 'torso', band: 'torso', perPose: true, anchor: 'neck', placement: 'registered', replaces: ['torso'] }],
  bottom: [{ part: 'legs', band: 'legs', perPose: true, anchor: 'pelvis', placement: 'registered', replaces: ['legs'] }],
  headwear: [{ part: 'hat', band: 'headwear', perPose: false, anchor: 'head-top', placement: 'anchored' }],
  neck: [{ part: 'scarf', band: 'neck', perPose: false, anchor: 'neck', placement: 'anchored' }],
  shoes: [
    { part: 'shoe-l', band: 'shoes', perPose: false, anchor: 'foot-l', placement: 'anchored' },
    { part: 'shoe-r', band: 'shoes', perPose: false, anchor: 'foot-r', placement: 'anchored' },
  ],
  backpack: [
    { part: 'pack', band: 'backpack-back', perPose: false, anchor: 'back', placement: 'anchored' },
    { part: 'straps', band: 'backpack-straps', perPose: false, anchor: 'neck', placement: 'anchored', optional: true },
  ],
  glasses: [{ part: 'glasses', band: 'glasses', perPose: false, anchor: 'eyes', placement: 'anchored' }],
  accessory: [{ part: 'prop', band: 'held-prop', perPose: false, anchor: 'paw-r', placement: 'anchored' }],
};
