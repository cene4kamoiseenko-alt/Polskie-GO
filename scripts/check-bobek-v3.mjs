/**
 * V3.1 QA: actual single-arm gesture only for a red hoodie; no fake jacket waving.
 * Run after npm run bobek:v3:generate. Production user art remains unchanged.
 */
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {join} from 'node:path';
import sharp from 'sharp';
import {resolveLook,equip,LOOK_MANIFEST} from '@polski-go/shared';
import {LOOK_V3_DRAFT_MANIFEST as M,v3ManifestForEquipment} from '../apps/web/src/dev/lookV3Manifest.ts';

const folder=join(process.cwd(),'apps/web/src/dev/bobek-v3');
const spriteSets={
  idle:['torso','head','top-hoodie-red','top-jacket-denim','backpack','cap-red','glasses-round'],
  wave:['torso','top-hoodie-red','arm-hoodie-red'],
};
let checked=0;
for(const [pose,names] of Object.entries(spriteSets)) for(const name of names) for(const width of [1024,512,256]){
  const path=join(folder,pose,`${name}${width===1024?'':'@'+width}.webp`);
  assert(existsSync(path),`Missing V3.1 cutout: ${path}`);
  const meta=await sharp(path).metadata();
  assert.equal(meta.format,'webp',path);
  assert.equal(meta.width,width,path);
  assert.equal(meta.height,width,path);
  assert(meta.hasAlpha,path);
  checked++;
}
assert.equal(checked,30);
const alpha=async(pose,name)=>sharp(join(folder,pose,name+'.webp')).extractChannel(3).raw().toBuffer();
assert.notDeepEqual(await alpha('idle','top-hoodie-red'),await alpha('idle','top-jacket-denim'),'Independent clothing silhouettes required');
assert.notDeepEqual(await alpha('idle','torso'),await alpha('wave','torso'),'Idle right arm must be removed for wave');
assert.notDeepEqual(await alpha('idle','top-hoodie-red'),await alpha('wave','top-hoodie-red'),'Hoodie standing sleeve must be removed for wave');

const start=['hoodie-red','backpack-travel'];
const red=resolveLook(null,start,{manifest:v3ManifestForEquipment(start),mood:'wave'});
assert.equal(red.mode,'layered');
assert.equal(red.pose,'front-wave');
assert.equal(red.poseFallback,false);
assert(red.drawn.includes('hoodie-red') && red.drawn.includes('backpack-travel'));
assert(red.layers.some(l=>l.id==='v3-base:torso-wave'));
assert(red.layers.some(l=>l.asset==='bobek-v3/wave/torso'));
const arm=red.layers.find(l=>l.id==='v31:hoodie:wave-arm');
assert(arm && arm.motion==='wave','Arm must wave separately, not replace the whole character');
assert.equal(arm.asset,'bobek-v3/wave/arm-hoodie-red');
assert(arm.z>red.layers.find(l=>l.id==='v3-base:head').z,'Wave hand painted in foreground');

const jacket=equip(start,'jacket-denim',M);
assert(jacket.equipment.includes('jacket-denim')&&!jacket.equipment.includes('hoodie-red'));
const denimWave=resolveLook(null,jacket.equipment,{manifest:v3ManifestForEquipment(jacket.equipment),mood:'wave'});
assert.equal(denimWave.mode,'layered');
assert.equal(denimWave.pose,'front-idle');
assert.equal(denimWave.poseFallback,true);
assert(denimWave.drawn.includes('jacket-denim'));
assert(!denimWave.layers.some(l=>l.motion==='wave'), 'Do not draw a RED arm over the BLUE jacket');
const idle=resolveLook(null,start,{manifest:v3ManifestForEquipment(start),mood:'happy'});
assert.equal(idle.pose,'front-idle');
assert.equal(idle.poseFallback,false);
assert(idle.layers.every(l=>l.asset.startsWith('bobek-v3/idle/')));
const thought=resolveLook(null,start,{manifest:v3ManifestForEquipment(start),mood:'think'});
assert.equal(thought.pose,'front-idle');
assert.equal(thought.poseFallback,true);

assert.equal(LOOK_MANIFEST.base.status,'pending');
assert.equal(M.base.poses.length,2);
console.log(`Bobek V3.1 QA PASS: ${checked} alpha WebPs, separated waving arm with hoodie, denim idle fallback, production untouched`);
