/**
 * Bobek V3: premium 2.5D cutout QA proof, FRONT IDLE ONLY.
 * Do not market this as five finished poses or a complete skeletal rig.
 * This manifest is intentionally independent from production LOOK_MANIFEST.
 */
import { LOOK_CANVAS, LOOK_FRONT_ANCHORS, LOOK_MANIFEST, type LookItem, type LookLayer, type LookManifest, type LookPose } from '@polski-go/shared';

const VERSION = 'bobek-v3-2.5d-draft@1';
const FULL = { x: 0, y: 0, w: 1024, h: 1024 };
const compat = { baseVersion: VERSION, views: ['front'] as const };
const layer = (id: string, part: string, slot: LookLayer['slot'], band: LookLayer['band'], asset: string, z = 0): LookLayer => ({
  id, part, slot, band, z, asset: `bobek-v3/idle/${asset}`,
  view: 'front', poses: ['front-idle'], rect: FULL, placement: 'registered',
});
const POSE: LookPose = { id: 'front-idle', view: 'front', arms: { l: 'rest', r: 'rest' }, expression: 'smile' };

const top = (id: 'hoodie-red' | 'jacket-denim'): LookItem => ({
  id, catalogSlot: 'JACKET', domain: 'beaver', occupies: ['top'], rarity: 'common',
  status: 'ready', fallback: 'hide', compatibility: compat,
  layers: [layer(`v3:${id}`, 'torso', 'top', 'torso', `top-${id}`, 8)],
  note: 'V3 QA cutout: separate graphic clothing. Hand and shoulder seams still require manual painting.',
});
const accessory = (
  id: 'backpack-travel' | 'cap-red' | 'glasses-round',
  catalogSlot: LookItem['catalogSlot'], slot: LookLayer['slot'], band: LookLayer['band'],
  asset: string, part: string,
): LookItem => ({
  id, catalogSlot, domain: 'beaver', occupies: [slot as 'backpack' | 'headwear' | 'glasses'],
  rarity: 'common', status: 'ready', fallback: 'hide', compatibility: compat,
  layers: [layer(`v3:${id}`,part,slot,band,asset)],
  note: 'V3 QA cutout: independent registered 2.5D transparent artwork.',
});

export const LOOK_V3_DRAFT_MANIFEST: LookManifest = {
  version: 1, canvas: LOOK_CANVAS, anchors: { front: LOOK_FRONT_ANCHORS },
  base: {
    id: 'bobek-v3', version: VERSION, status: 'ready', views: ['front'],
    poses: [POSE], moods: { happy: 'front-idle' }, defaultPose: { front: 'front-idle' },
    layers: [
      layer('v3-base:torso','torso','base','torso','torso',0),
      layer('v3-base:head','head','base','head','head',0),
    ],
  },
  // In QA this only supplies unsupported-view fallbacks; production always uses LOOK_MANIFEST.
  legacyBase: LOOK_MANIFEST.legacyBase,
  items: [
    top('hoodie-red'),
    top('jacket-denim'),
    accessory('backpack-travel','BACKPACK','backpack','backpack-straps','backpack','pack'),
    accessory('glasses-round','GLASSES','glasses','glasses','glasses-round','glasses'),
    accessory('cap-red','HAT','headwear','headwear','cap-red','hat'),
  ],
  signatureDefaults: { top:'hoodie-red', backpack:'backpack-travel' },
};
