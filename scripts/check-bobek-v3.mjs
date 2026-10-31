/**
 * Bobek V3 QA acceptance checks for one real front-idle cutout only.
 * Run after: npm run bobek:v3:generate
 * This must NOT mark the primary production art as approved.
 */
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import {join} from 'node:path';
import sharp from 'sharp';
import {resolveLook, equip, LOOK_MANIFEST} from '@polski-go/shared';
import {LOOK_V3_DRAFT_MANIFEST as M} from '../apps/web/src/dev/lookV3Manifest.ts';

const folder=join(process.cwd(),'apps/web/src/dev/bobek-v3/idle');
const names=['torso','head','top-hoodie-red','top-jacket-denim','backpack','cap-red','glasses-round'];
let checked=0;
for (const name of names) for (const width of [1024,512,256]) {
  const path=join(folder,`${name}${width===1024?'':'@'+width}.webp`);
  assert(existsSync(path),`Missing V3 cutout: ${path}`);
  const metadata=await sharp(path).metadata();
  assert.equal(metadata.format,'webp',name);
  assert.equal(metadata.width,width,name);
  assert.equal(metadata.height,width,name);
  assert(metadata.hasAlpha,name);
  checked++;
}
assert.equal(checked,21);
const alpha=async(name)=>sharp(join(folder,name+'.webp')).extractChannel(3).raw().toBuffer();
assert.notDeepEqual(await alpha('top-hoodie-red'),await alpha('top-jacket-denim'), 'V3 must not recolor an identical top mask');

const start=['hoodie-red','backpack-travel'];
const jacket=equip(start,'jacket-denim',M);
assert(jacket.equipment.includes('jacket-denim'));
assert(!jacket.equipment.includes('hoodie-red'));
for (const outfit of [start,jacket.equipment]) {
  const look=resolveLook(null,outfit,{manifest:M,mood:'happy'});
  assert.equal(look.mode,'layered');
  assert.equal(look.pose,'front-idle');
  assert.equal(look.poseFallback,false);
  assert.equal(look.drawn.includes('backpack-travel'),true);
  assert.equal(look.drawn.includes(outfit.includes('hoodie-red')?'hoodie-red':'jacket-denim'),true);
  assert(look.layers.every((layer)=>layer.asset.startsWith('bobek-v3/idle/')));
  assert(look.layers.some((layer)=>layer.part==='head'));
  assert(look.layers.some((layer)=>layer.part==='torso'));
  // Other moods are intentionally NOT represented by fabricated 2.5D art.
  const wave=resolveLook(null,outfit,{manifest:M,mood:'wave'});
  assert.equal(wave.pose,'front-idle');
  assert.equal(wave.poseFallback,true);
}
// Nobody's real wardrobe is changed by the QA-only manifest.
assert.equal(LOOK_MANIFEST.base.status,'pending');
assert.equal(M.base.poses.length,1);
console.log(`Bobek V3 QA PASS: ${checked} real alpha assets, 2 distinct tops, only 1 honest front-idle pose; production unchanged`);
