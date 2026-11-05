/**
 * Bobek V3.2: painted 2.5D cutout QA — front idle + two provisional garment wave variants.
 * Denim wave has a provisional recolored sleeve proof-of-fit, NOT approved final art.
 * This does not modify production LOOK_MANIFEST.
 */
import { LOOK_CANVAS, LOOK_FRONT_ANCHORS, LOOK_MANIFEST, type LookItem, type LookLayer, type LookManifest, type LookPose } from '@polski-go/shared';

const VERSION = 'bobek-v32-2.5d-draft@1';
const FULL = { x: 0, y: 0, w: 1024, h: 1024 };
const compat = { baseVersion: VERSION, views: ['front'] as const };
const layer = (
  id: string, part: string, slot: LookLayer['slot'], band: LookLayer['band'],
  asset: string, poses: LookLayer['poses'] = '*', extra: Partial<LookLayer> = {},
): LookLayer => ({
  id, part, slot, band, asset: `bobek-v3/${asset}`,
  view: 'front', poses, rect: FULL, placement: 'registered', ...extra,
});
const POSES: LookPose[] = [
  { id: 'front-idle', view: 'front', arms: {l:'rest',r:'rest'}, expression: 'smile' },
  { id: 'front-wave', view: 'front', arms: {l:'rest',r:'wave'}, expression: 'smile' },
];
const hoodie: LookItem = {
  id:'hoodie-red',catalogSlot:'JACKET',domain:'beaver',occupies:['top'],rarity:'common',
  status:'ready',fallback:'hide',compatibility:compat,
  layers:[
    layer('v31:hoodie:idle','torso','top','torso','idle/top-hoodie-red',['front-idle'],{z:8}),
    layer('v31:hoodie:wave','torso','top','torso','wave/top-hoodie-red',['front-wave'],{z:8}),
    layer('v31:hoodie:wave-arm','sleeve','top','arm-front','wave/arm-hoodie-red',['front-wave'],{
      motion:'wave',motionOrigin:{x:704,y:537},z:1,
    }),
  ],
  note:'Red hoodie: real separate raised sleeve for wave, with retouchable cutout seam.',
};
const jacket: LookItem = {
  id:'jacket-denim',catalogSlot:'JACKET',domain:'beaver',occupies:['top'],rarity:'common',
  status:'ready',fallback:'hide',compatibility:compat,
  layers:[
    layer('v32:jacket:idle','torso','top','torso','idle/top-jacket-denim',['front-idle'],{z:8}),
    layer('v32:jacket:wave','torso','top','torso','wave/top-jacket-denim',['front-wave'],{z:8}),
    layer('v32:jacket:wave-arm','sleeve','top','arm-front','wave/arm-jacket-denim',['front-wave'],{
      motion:'wave',motionOrigin:{x:704,y:537},z:1,
    }),
  ],
  note:'V3.2 QA only: blue sleeve is color-adapted from red wave, not independent painterly art.',
};
const accessory = (
  id:'backpack-travel'|'cap-red'|'glasses-round',
  catalogSlot:LookItem['catalogSlot'], slot:'backpack'|'headwear'|'glasses',
  band:LookLayer['band'], asset:string, part:string,
):LookItem => ({
  id,catalogSlot,domain:'beaver',occupies:[slot],rarity:'common',status:'ready',
  fallback:'hide',compatibility:compat,
  layers:[layer(`v31:${id}`,part,slot,band,`idle/${asset}`)],
  note:'Registered painted V3.1 asset; artwork still subject to visual QA.',
});

export const LOOK_V3_DRAFT_MANIFEST: LookManifest = {
  version:1,canvas:LOOK_CANVAS,anchors:{front:LOOK_FRONT_ANCHORS},
  base:{
    id:'bobek-v3',version:VERSION,status:'ready',views:['front'],poses:POSES,
    moods:{happy:'front-idle',wave:'front-wave'},
    defaultPose:{front:'front-idle'},
    layers:[
      layer('v3-base:torso','torso','base','torso','idle/torso',['front-idle']),
      layer('v3-base:torso-wave','torso','base','torso','wave/torso',['front-wave']),
      layer('v3-base:head','head','base','head','idle/head'),
    ],
  },
  legacyBase:LOOK_MANIFEST.legacyBase,
  items:[
    hoodie,jacket,
    accessory('backpack-travel','BACKPACK','backpack','backpack-back','backpack','pack'),
    accessory('glasses-round','GLASSES','glasses','glasses','glasses-round','glasses'),
    accessory('cap-red','HAT','headwear','headwear','cap-red','hat'),
  ],
  signatureDefaults:{top:'hoodie-red',backpack:'backpack-travel'},
};

// Both jacket variants have their own pose-specific overlays for QA.
// Still not a final skeletal rig; production remains unchanged.
export function v3ManifestForEquipment(_equipment:readonly string[]):LookManifest {
  return LOOK_V3_DRAFT_MANIFEST;
}
