/**
 * V3.2 QA: validates real alpha assets and two distinct cutout wave outfits.
 * Denim sleeve is a recolored proof-of-fit, not final independent illustration.
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
  wave:['torso','top-hoodie-red','arm-hoodie-red','top-jacket-denim','arm-jacket-denim'],
};
const widths=[1024,512,256];
let checked=0;
for(const [pose,names] of Object.entries(spriteSets)) for(const name of names) for(const width of widths){
  const path=join(folder,pose,`${name}${width===1024?'':'@'+width}.webp`);
  assert(existsSync(path),`Missing V3.2 sprite: ${path}`);
  const meta=await sharp(path).metadata();
  assert.equal(meta.format,'webp',path);
  assert.equal(meta.width,width,path);
  assert.equal(meta.height,width,path);
  assert(meta.hasAlpha,path);
  checked++;
}
assert.equal(checked,36);
const alpha=async(pose,name)=>sharp(join(folder,pose,name+'.webp')).extractChannel(3).raw().toBuffer();
assert.notDeepEqual(await alpha('idle','top-hoodie-red'),await alpha('idle','top-jacket-denim'),'Different tops require independent silhouettes');
assert.notDeepEqual(await alpha('idle','torso'),await alpha('wave','torso'),'Remove old idle arm in wave');
for(const top of ['top-hoodie-red','top-jacket-denim'])
  assert.notDeepEqual(await alpha('idle',top),await alpha('wave',top),`Static sleeve remains on wave: ${top}`);

const bounds=async(pose,name)=>{
  const {data,info}=await sharp(join(folder,pose,name+'.webp')).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let left=info.width,top=info.height,right=-1,bottom=-1;
  for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
    if(data[(y*info.width+x)*info.channels+3]<16)continue;
    left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);
  }
  return {left,top,right,bottom};
};
for(const pose of ['idle','wave'])for(const top of ['top-hoodie-red','top-jacket-denim']){
  const b=await bounds(pose,top);
  assert(b.top>=450&&b.top<=510,`${pose}/${top}: collar detached at ${b.top}`);
  assert(b.bottom<=820,`${pose}/${top}: garment hem covers paws at ${b.bottom}`);
}

const redEquipment=['hoodie-red','backpack-travel'];
const blueEquipment=equip(redEquipment,'jacket-denim',M).equipment;
assert(blueEquipment.includes('jacket-denim')&&!blueEquipment.includes('hoodie-red'));
for(const [equipment,item,armId] of [
  [redEquipment,'hoodie-red','v31:hoodie:wave-arm'],
  [blueEquipment,'jacket-denim','v32:jacket:wave-arm'],
]){
  const look=resolveLook(null,equipment,{manifest:v3ManifestForEquipment(equipment),mood:'wave'});
  assert.equal(look.mode,'layered');
  assert.equal(look.pose,'front-wave');
  assert.equal(look.poseFallback,false);
  assert(look.drawn.includes(item)&&look.drawn.includes('backpack-travel'));
  const arm=look.layers.find(l=>l.id===armId);
  assert(arm?.motion==='wave'&&arm.motionOrigin, `${item}: expected independent waving arm`);
  assert.equal(arm.asset,`bobek-v3/wave/arm-${item}`);
  assert(!look.layers.some(l=>l.asset===`bobek-v3/wave/arm-${item==='hoodie-red'?'jacket-denim':'hoodie-red'}`),'wrong garment sleeve displayed');
  const pack=look.layers.find(l=>l.owner==='backpack-travel');
  assert(pack&&pack.z<arm.z,'backpack must remain behind arm');
}
assert.equal(resolveLook(null,redEquipment,{manifest:M,mood:'think'}).pose,'front-idle');
assert.equal(LOOK_MANIFEST.base.status,'pending','Never mark production artwork ready');
assert.equal(M.base.poses.length,2);
console.log(`Bobek V3.2 QA PASS: ${checked} transparent WebP, 2 independent upper garment sprite sets, production unchanged`);
