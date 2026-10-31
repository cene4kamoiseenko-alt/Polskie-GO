/**
 * Ядро зовнішнього вигляду Бобека (docs/ADR-005-PAINTERLY-BEAVER.md).
 * Лише типи й чисті дані: без DOM, без import.meta, без мережі. Однаково працює у вебі,
 * на сервері (Workers) і в скриптах пайплайна ассетів.
 */

/** Слоти каталогу (`cosmetic_items.slot`), що стосуються образу. FRAME — рамка профілю, не одяг. */
export const LOOK_CATALOG_WEAR_SLOTS = ['HAT', 'GLASSES', 'SCARF', 'JACKET', 'BACKPACK', 'SHOES', 'ACCESSORY', 'COSTUME', 'FRAME'] as const;
export type LookCatalogWearSlot = (typeof LOOK_CATALOG_WEAR_SLOTS)[number];
/** Слоти домика: не одяг, на образ не впливають. */
export const LOOK_CATALOG_HOUSE_SLOTS = ['FURNITURE', 'DECOR', 'SOUVENIR'] as const;
export type LookCatalogHouseSlot = (typeof LOOK_CATALOG_HOUSE_SLOTS)[number];

/**
 * Слоти образу. `base` займає лише базова модель (хутро, голова, морда, хвіст) — предмет її не займає.
 * `body` — одяг на все тіло (комбінезон), `head` — те, що обгортає голову (капюшон-маска),
 * `headwear` — головні убори поверх голови, `neck` — шарфи.
 */
export const LOOK_SLOTS = ['base', 'body', 'head', 'top', 'bottom', 'headwear', 'neck', 'shoes', 'backpack', 'glasses', 'accessory'] as const;
export type LookSlot = (typeof LOOK_SLOTS)[number];
export type LookWearSlot = Exclude<LookSlot, 'base'>;
export const LOOK_WEAR_SLOTS: readonly LookWearSlot[] = LOOK_SLOTS.filter((s): s is LookWearSlot => s !== 'base');

/**
 * Візуальний стан предмета:
 * - `ready` — є живописні шари на спільному полотні базової моделі;
 * - `legacy-whole-look` — є лише цілісна живописна картинка (Бобек уже вдягнений), шари на неї не накладаються;
 * - `pending` — живописного зображення немає: предмет не малюється, володіння зберігається, у гардеробі «скоро».
 */
export const LOOK_VISUAL_STATUSES = ['ready', 'legacy-whole-look', 'pending'] as const;
export type VisualStatus = (typeof LOOK_VISUAL_STATUSES)[number];

export const LOOK_VIEWS = ['front', 'three-quarter', 'side', 'back'] as const;
export type LookView = (typeof LOOK_VIEWS)[number];

/** Стани Бобека в інтерфейсі (збігаються з `BeaverMood` у вебі). */
export const LOOK_MOODS = [
  'happy', 'wave', 'sad', 'think', 'celebrate', 'sleep', 'travel', 'gift', 'cheer',
  'surprised', 'read', 'learn', 'royal', 'wait', 'explain', 'music', 'mic', 'map',
  // Пози власника 2026-10-31: кава, оплата карткою, посилка, втома, ноутбук.
  'coffee', 'pay', 'parcel', 'tired', 'laptop',
] as const;
export type LookMood = (typeof LOOK_MOODS)[number];

/**
 * Z-смуги від заднього плану до переднього. Порядок усередині смуги — поле `z` шару.
 * Смуги `head` і `face` належать лише базовій моделі: предмет не може змінити морду.
 */
export const LOOK_Z_BANDS = [
  'shadow',
  'backpack-back',
  'tail',
  'legs',
  'shoes',
  'torso',
  'neck',
  'backpack-straps',
  'head-back',
  'head',
  'face',
  'head-cover',
  'glasses',
  'headwear',
  'arm-front',
  'held-prop',
  'fx',
] as const;
export type LookZBand = (typeof LOOK_Z_BANDS)[number];

export type LookRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'event';

export type LookPoint = { x: number; y: number };
/** Прямокутник у логічних одиницях полотна (див. LOOK_CANVAS). */
export type LookRect = { x: number; y: number; w: number; h: number };

/** Якорі. Суфікси `-l`/`-r` — лівий/правий бік екрана (не персонажа). */
export const LOOK_ANCHOR_IDS = [
  'ground', 'foot-l', 'foot-r', 'pelvis', 'tail-root', 'back', 'shoulder-l', 'shoulder-r',
  'neck', 'muzzle', 'eyes', 'head-center', 'head-top', 'ear-l', 'ear-r', 'paw-l', 'paw-r',
] as const;
export type LookAnchorId = (typeof LOOK_ANCHOR_IDS)[number];

/** Частини базової моделі, які предмет може замінити (`replaces`) або сховати (`hides`). */
export const LOOK_BASE_PARTS = ['shadow', 'tail', 'legs', 'torso', 'head', 'ears', 'tuft', 'face'] as const;
export type LookBasePart = (typeof LOOK_BASE_PARTS)[number];

export type LookArmPose = 'rest' | 'wave' | 'up' | 'chin' | 'heart' | 'hold' | 'point' | 'salute' | 'map';

/** Поза шарової моделі: ракурс + положення лап + вираз. Одяг залежить від ракурсу й лап, не від виразу. */
export type LookPose = {
  id: string;
  view: LookView;
  arms: { l: LookArmPose; r: LookArmPose };
  expression: string;
  /** Якорі, що відрізняються від якорів ракурсу (лапи, стопи). */
  anchors?: Partial<Record<LookAnchorId, LookPoint>>;
  /** Поворот предмета, прикріпленого до якоря, у градусах (наприклад, реквізит у лапі). */
  rotations?: Partial<Record<LookAnchorId, number>>;
};

/**
 * Рух шару: `blink` — повіки, видно лише мить кожні кілька секунд; `wave` — лапа, що махає навколо `motionOrigin`.
 * Анімує рендерер (CSS) лише в «живого» Бобека: видимий, від 96 px, без «Менше анімацій» / prefers-reduced-motion.
 */
export const LOOK_MOTIONS = ['blink', 'wave'] as const;
export type LookMotion = (typeof LOOK_MOTIONS)[number];

/**
 * Шар живописного зображення на спільному полотні.
 * `registered` — намальований прямо на полотні бази (rect — де він лежить);
 * `anchored` — жорсткий предмет, що ставиться точкою `pivot` на якір пози (реквізит, окуляри).
 */
export type LookLayer = {
  id: string;
  /** Частина: для бази — LookBasePart, для предмета — назва з шаблону слота (torso, hat, prop…). */
  part: string;
  slot: LookSlot;
  view: LookView;
  /** Пози, для яких шар чинний: '*' — усі пози ракурсу. */
  poses: '*' | readonly string[];
  band: LookZBand;
  z?: number;
  /** Логічний ключ ассета, напр. 'look/front/hoodie-red/torso-front-idle'. URL визначає застосунок. */
  asset: string;
  rect: LookRect;
  placement?: 'registered' | 'anchored';
  anchor?: LookAnchorId;
  /** Точка шару (відносно rect), що збігається з якорем; для `anchored`. */
  pivot?: LookPoint;
  opacity?: number;
  motion?: LookMotion;
  /** Точка повороту руху `wave` у координатах полотна (плече). */
  motionOrigin?: LookPoint;
};

export type LookCompatibility = {
  /** Версія базової моделі, на полотні якої намальовані шари. Інша версія — шари не накладаються. */
  baseVersion: string;
  views: readonly LookView[];
};

/** Цілісна картинка костюма (перехідний період). Не на спільному полотні, нічого не накладається. */
export type LookLegacyCostumeArt = {
  asset: string;
  /** Сцена для картки гардероба. */
  scene?: string;
  size: { w: number; h: number };
  view: LookView;
  /**
   * Що ще намальовано на картинці, окрім самого костюма: id предмета каталогу або 'prop:<опис>'
   * для речей без предмета. Якщо надіта річ збігається — вона «видна»; інакше — схована картинкою.
   */
  shows: Partial<Record<LookWearSlot, string>>;
};

/** Що малювати, коли живописних шарів немає. */
export type LookFallback = 'hide' | 'legacy-base' | 'legacy-whole-look';

export type LookItem = {
  /** Slug предмета каталогу (= `cosmetic_items.slug`, = asset_key). id у БД — `i_<slug>`. */
  id: string;
  assetKey?: string;
  catalogSlot: LookCatalogWearSlot;
  /** `beaver` — на персонажі; `profile-frame` — рамка аватара, на Бобека не впливає. */
  domain: 'beaver' | 'profile-frame';
  /** Слоти, які предмет займає ексклюзивно (конфлікти — див. LOOK_SLOT_RULES). */
  occupies: readonly LookWearSlot[];
  rarity: LookRarity;
  status: VisualStatus;
  fallback: LookFallback;
  compatibility: LookCompatibility | null;
  layers: readonly LookLayer[];
  legacy?: LookLegacyCostumeArt;
  /** Частини бази, які предмет заміняє власними шарами (одяг на тулуб замінює `torso`). */
  replaces?: readonly LookBasePart[];
  /** Частини бази, які предмет просто ховає (шапка ховає чубчик). */
  hides?: readonly LookBasePart[];
  note?: string;
};

export type LookBase = {
  id: string;
  version: string;
  status: VisualStatus;
  views: readonly LookView[];
  poses: readonly LookPose[];
  /** Стан → поза шарової моделі. */
  moods: Partial<Record<LookMood, string>>;
  /** Поза за замовчуванням для кожного ракурсу. */
  defaultPose: Partial<Record<LookView, string>>;
  layers: readonly LookLayer[];
};

/** Цілісний базовий образ перехідного періоду: червоне худі й рюкзак уже намальовані. */
export type LookLegacyImage = { asset: string; size: { w: number; h: number }; view: LookView };
export type LookLegacyBase = {
  id: 'legacy-base';
  /** Предмети, впечатані в кожну позу. */
  includes: Partial<Record<LookWearSlot, string>>;
  poses: Readonly<Record<string, LookLegacyImage>>;
  moods: Partial<Record<LookMood, string>>;
  /** Ракурс → поза (для сцен руху: 3/4, профіль, спина). */
  views: Partial<Record<LookView, string>>;
  fallbackPose: string;
};

export type LookCanvas = {
  /** Логічне полотно доставки. Майстер-файли малюються в `masterScale` рази більшими. */
  width: number;
  height: number;
  masterScale: number;
  /** Розміри доставки WebP (ширина в px); вибір за розміром на екрані × DPR. */
  deliveryWidths: readonly number[];
};

export type LookManifest = {
  version: 1;
  canvas: LookCanvas;
  /** Якорі ракурсів (для поз без власних якорів). */
  anchors: Partial<Record<LookView, Partial<Record<LookAnchorId, LookPoint>>>>;
  base: LookBase;
  legacyBase: LookLegacyBase;
  items: readonly LookItem[];
  /**
   * Фірмовий образ: якщо слот вільний і предмет у власності, він показується (позначка `default`).
   * Зберігає теперішню поведінку: стартове худі в БД не вдягнене, але Бобек у ньому.
   */
  signatureDefaults: Partial<Record<LookWearSlot, string>>;
};

/** Надіті предмети: slug, asset_key або id з БД (`i_<slug>`). */
export type LookEquipment = readonly string[];
/** Старий формат сервера: `me.outfit.wear` = { HAT: 'cap-red', ... }. */
export type LookLegacyWear = Readonly<Partial<Record<string, string | null | undefined>>>;
/** Предмети у власності. `null` — невідомо (чужий профіль): перевірка володіння пропускається. */
export type LookInventory = readonly string[] | null;

export type LookMode = 'layered' | 'legacy-base' | 'legacy-costume' | 'empty';

/** Готовий до малювання шар (упорядковано від заднього до переднього). */
export type LookRenderLayer = {
  id: string;
  asset: string;
  /** 'base', 'legacy-base' або id предмета. */
  owner: string;
  slot: LookSlot;
  z: number;
  /** `canvas` — rect у координатах полотна; `contain` — цілісна картинка на весь блок. */
  fit: 'canvas' | 'contain';
  rect: LookRect | null;
  rotate?: number;
  origin?: LookPoint;
  opacity?: number;
  motion?: LookMotion;
  /** Точка повороту руху у координатах полотна. */
  motionOrigin?: LookPoint;
};

export type LookItemReason =
  | 'drawn'
  | 'default'
  | 'visual-pending'
  | 'covered-by-whole-look'
  | 'slot-conflict'
  | 'not-owned'
  | 'view-unsupported';

export type LookItemOutcome = {
  id: string;
  status: VisualStatus;
  drawn: boolean;
  reason: LookItemReason;
  /** Хто спричинив: костюм/картинка, що закрила, або предмет, що виграв конфлікт. */
  by?: string;
};

export type LookSlotOutcome = 'empty' | 'drawn' | 'default' | 'pending' | 'hidden' | 'extraneous';
export type LookSlotState = { wanted: string | null; shown: string | null; outcome: LookSlotOutcome };

export type ResolvedLook = {
  /** Детермінований ключ намальованого: однаковий вхід → однаковий ключ (кеш, data-look, e2e). */
  key: string;
  mode: LookMode;
  /** Версія бази, 'legacy-base' або 'legacy:<костюм>'. */
  baseRef: string;
  view: LookView;
  mood: string;
  pose: string;
  /** Потрібної пози немає — показано найближчу. */
  poseFallback: boolean;
  layers: LookRenderLayer[];
  slots: Record<LookWearSlot, LookSlotState>;
  /** Надіті й прийняті (після конфліктів і перевірки володіння), відсортовані. */
  equipped: string[];
  /** Що реально видно на картинці (надіте або фірмове), відсортовано. */
  drawn: string[];
  /** Надіте без живописного зображення: не малюється, у гардеробі «скоро». */
  pending: string[];
  /** Надіте, але не намальоване з іншої причини (закрите цілісною картинкою, конфлікт, не у власності). */
  hidden: LookItemOutcome[];
  /** Намальоване, але не надіте (впечатане в цілісну картинку). */
  extraneous: { slot: LookWearSlot; id: string }[];
  defaults: string[];
  unknown: string[];
  items: LookItemOutcome[];
  frame: string | null;
  legacy: boolean;
  preview: boolean;
};
