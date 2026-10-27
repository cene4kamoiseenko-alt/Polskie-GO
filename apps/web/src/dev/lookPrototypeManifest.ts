/**
 * Маніфест прототипу єдиного Бобека (ADR-005, варіант B) — ті самі типи, resolveLook і BeaverLook, що й у застосунку.
 * Шари — з scripts/look-prototype.mjs: розкладені за кольором ІСНУЮЧІ живописні пози (худі й рюкзак у них намальовані),
 * вирівняні на полотні 1024 за очима. Синя «куртка» — та сама маска одягу, перефарбована; кепка й окуляри намальовані
 * скриптом. Це прототип механіки (зміна верху, кріплення на якорі голови й очей, пози, моргання, змах лапою, збереження),
 * а не фінальна модель: LOOK_MANIFEST застосунку не змінюється, база там лишається `pending`.
 * Чистий модуль (без import.meta): його перевіряє apps/server/test/look-prototype.test.ts через validateManifest.
 */
import { LOOK_CANVAS, LOOK_FRONT_ANCHORS, LOOK_MANIFEST, type LookItem, type LookLayer, type LookManifest, type LookPose } from '@polski-go/shared';
import meta from './look-proto/meta.json';

export const PROTO_BASE_VERSION = 'bobek-proto@1';
/** Пози прототипу (з якої пози legacy-base вирізано): idle ← front, wave ← wave, think ← think, happy ← correct, celebrate ← celebrate. */
export const PROTO_POSES = ['idle', 'wave', 'think', 'happy', 'celebrate'] as const;
export type ProtoPose = (typeof PROTO_POSES)[number];
/** Речі прототипу — справжні id каталогу. */
export const PROTO_ITEMS = ['hoodie-red', 'jacket-denim', 'backpack-travel', 'cap-red', 'glasses-round'] as const;

type PoseMeta = { angle: number; anchors: { eyes: { x: number; y: number }; 'head-top': { x: number; y: number } }; arm?: { pivot: { x: number; y: number }; top: boolean } };
const poses = meta.poses as Record<ProtoPose, PoseMeta>;
const FULL = { x: 0, y: 0, w: LOOK_CANVAS.width, h: LOOK_CANVAS.height };
const compatibility = { baseVersion: PROTO_BASE_VERSION, views: ['front'] as const };

const registered = (id: string, part: string, slot: LookLayer['slot'], band: LookLayer['band'], pose: ProtoPose, asset: string, extra: Partial<LookLayer> = {}): LookLayer => ({
  id, part, slot, view: 'front', poses: [pose], band, asset: `proto/${asset}`, rect: FULL, placement: 'registered', ...extra,
});

const ARMS: Record<ProtoPose, LookPose['arms']> = {
  idle: { l: 'map', r: 'wave' },
  wave: { l: 'hold', r: 'wave' },
  think: { l: 'hold', r: 'chin' },
  happy: { l: 'map', r: 'up' },
  celebrate: { l: 'up', r: 'up' },
};
const EXPRESSION: Record<ProtoPose, string> = { idle: 'smile', wave: 'smile', think: 'thinking', happy: 'wink', celebrate: 'joy' };

const POSES: LookPose[] = PROTO_POSES.map((id) => ({
  id,
  view: 'front',
  arms: ARMS[id],
  expression: EXPRESSION[id],
  anchors: { eyes: poses[id].anchors.eyes, 'head-top': poses[id].anchors['head-top'] },
  // Кепка й окуляри повертаються разом із нахилом голови в позі.
  rotations: { eyes: poses[id].angle, 'head-top': poses[id].angle },
}));

const BASE_LAYERS: LookLayer[] = PROTO_POSES.flatMap((pose) => {
  const layers = [
    registered(`proto-base:${pose}:body`, 'body', 'base', 'torso', pose, `${pose}/body`),
    registered(`proto-base:${pose}:blink`, 'face', 'base', 'face', pose, `${pose}/blink`, { motion: 'blink' }),
  ];
  const arm = poses[pose].arm;
  if (arm) layers.push(registered(`proto-base:${pose}:arm`, 'arm', 'base', 'arm-front', pose, `${pose}/arm-body`, { motion: 'wave', motionOrigin: arm.pivot }));
  return layers;
});

/** Верх: один шар одягу на позу; у позі зі змахом рукав рухається разом із лапою. */
function top(id: 'hoodie-red' | 'jacket-denim', note: string): LookItem {
  const layers = PROTO_POSES.flatMap((pose) => {
    const out = [registered(`${id}:${pose}:torso`, 'torso', 'top', 'torso', pose, `${pose}/top-${id}`, { z: 5 })];
    const arm = poses[pose].arm;
    if (arm?.top) out.push(registered(`${id}:${pose}:sleeve`, 'sleeve', 'top', 'arm-front', pose, `${pose}/arm-top-${id}`, { z: 1, motion: 'wave', motionOrigin: arm.pivot }));
    return out;
  });
  return { id, catalogSlot: 'JACKET', domain: 'beaver', occupies: ['top'], rarity: 'common', status: 'ready', fallback: 'hide', compatibility, layers, note };
}

const anchored = (id: string, part: string, slot: LookLayer['slot'], band: LookLayer['band'], anchor: LookLayer['anchor'], asset: string, size: { w: number; h: number; pivot: { x: number; y: number } }): LookLayer => ({
  id, part, slot, view: 'front', poses: '*', band, asset: `proto/${asset}`, rect: { x: 0, y: 0, w: size.w, h: size.h }, placement: 'anchored', anchor, pivot: size.pivot,
});

const ITEMS: LookItem[] = [
  top('hoodie-red', 'Прототип: худі, вирізане з живописних поз за кольором.'),
  top('jacket-denim', 'Прототип: та сама маска одягу, перефарбована в синій. Не намальована джинсова куртка.'),
  {
    id: 'backpack-travel', catalogSlot: 'BACKPACK', domain: 'beaver', occupies: ['backpack'], rarity: 'common', status: 'ready', fallback: 'hide', compatibility,
    layers: PROTO_POSES.map((pose) => registered(`backpack-travel:${pose}:pack`, 'pack', 'backpack', 'backpack-straps', pose, `${pose}/backpack`)),
    note: 'Прототип: рюкзак, вирізаний з живописних поз за кольором.',
  },
  {
    id: 'cap-red', catalogSlot: 'HAT', domain: 'beaver', occupies: ['headwear'], rarity: 'common', status: 'ready', fallback: 'hide', compatibility,
    layers: [anchored('cap-red:hat', 'hat', 'headwear', 'headwear', 'head-top', 'cap-red', meta.cap)],
    note: 'Прототип: кепка намальована скриптом (не живописна), сидить на якорі head-top з нахилом голови пози.',
  },
  {
    id: 'glasses-round', catalogSlot: 'GLASSES', domain: 'beaver', occupies: ['glasses'], rarity: 'common', status: 'ready', fallback: 'hide', compatibility,
    layers: [anchored('glasses-round:glasses', 'glasses', 'glasses', 'glasses', 'eyes', 'glasses-round', meta.glasses)],
    note: 'Прототип: окуляри намальовані скриптом, центри лінз — на центрах очей.',
  },
];

export const LOOK_PROTOTYPE_MANIFEST: LookManifest = {
  version: 1,
  canvas: LOOK_CANVAS,
  anchors: { front: LOOK_FRONT_ANCHORS },
  base: {
    id: 'bobek-proto',
    version: PROTO_BASE_VERSION,
    status: 'ready',
    views: ['front'],
    poses: POSES,
    moods: { happy: 'idle', wave: 'wave', mic: 'wave', think: 'think', explain: 'think', cheer: 'happy', celebrate: 'celebrate', gift: 'celebrate' },
    defaultPose: { front: 'idle' },
    layers: BASE_LAYERS,
  },
  legacyBase: LOOK_MANIFEST.legacyBase,
  items: ITEMS,
  signatureDefaults: { top: 'hoodie-red', backpack: 'backpack-travel' },
};

/** Стан → настрій для resolveLook (п’ять анімаційних станів першої версії + моргання поверх кожного). */
export const PROTO_STATES = [
  { id: 'idle', mood: 'happy', label: 'idle' },
  { id: 'wave', mood: 'wave', label: 'wave' },
  { id: 'happy', mood: 'cheer', label: 'happy' },
  { id: 'think', mood: 'think', label: 'thinking' },
  { id: 'celebrate', mood: 'celebrate', label: 'celebrate' },
] as const;
