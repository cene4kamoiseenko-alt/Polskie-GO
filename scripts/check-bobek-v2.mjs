/**
 * Pure manifest test (requires no V2 images; the importer validates their actual bytes).
 * Node: node --import tsx scripts/check-bobek-v2.mjs
 */
import assert from 'node:assert/strict';
import { LOOK_MANIFEST, equip, resolveLook } from '@polski-go/shared';
import { LOOK_V2_DRAFT_MANIFEST as M } from '../apps/web/src/dev/lookV2Manifest.ts';

const poses = [
  ['happy', 'idle'],
  ['wave', 'wave'],
  ['think', 'think'],
  ['cheer', 'happy'],
  ['celebrate', 'celebrate'],
];
const baseline = ['hoodie-red', 'backpack-travel'];
const changed = equip(baseline, 'jacket-denim', M).equipment;
assert(changed.includes('jacket-denim') && !changed.includes('hoodie-red'));
const withAccessories = equip(equip(changed, 'cap-red', M).equipment, 'glasses-round', M).equipment;
for (const [mood, expectedPose] of poses) {
  const look = resolveLook(null, withAccessories, { manifest: M, mood });
  assert.equal(look.mode, 'layered', mood);
  assert.equal(look.pose, expectedPose, mood);
  assert(look.drawn.includes('backpack-travel'));
  assert(look.drawn.includes('jacket-denim'));
  assert(look.drawn.includes('glasses-round'));
  assert(look.drawn.includes('cap-red'));
  assert(look.layers.length > 4);
  assert(look.layers.every((layer) => layer.asset.startsWith('bobek-v2/')), 'cross-model sprite contamination');
  assert(!look.layers.some((layer) => /arm-(body|top-)/.test(layer.asset)), 'no obsolete arm masks');
  for (const item of ['cap-red', 'glasses-round']) {
    const part = look.layers.find((layer) => layer.owner === item);
    assert(part);
    assert.equal(part.fit, 'canvas', 'accessories are fully registered on V2 canvas');
    assert.deepEqual(part.rect, { x: 0, y: 0, w: 1024, h: 1024 });
  }
}
assert.equal(LOOK_MANIFEST.base.status, 'pending', 'real users must keep the approved legacy');
console.log('Bobek V2: 5 poses, distinct tops, cap, glasses, pack and production isolation passed');
