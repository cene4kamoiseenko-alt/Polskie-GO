/**
 * Verify exact immutable whole-look assets and the fail-closed art gate.
 * No claims about independent jackets or skeleton animation.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import sharp from 'sharp';
const root=process.cwd();
for(const [pose,width] of [['front',512],['wave',1024]]){
  const original=join(root,'apps/web/src/assets/beaver',pose+'.webp');
  const copied=join(root,'apps/web/src/dev/bobek-coherent',pose+'-approved.webp');
  assert.deepEqual(readFileSync(copied),readFileSync(original),
    `${pose}: stable master must exactly match original production sprite`);
  const small=await sharp(join(root,'apps/web/src/dev/bobek-coherent',pose+'-approved@256.webp')).metadata();
  assert.equal(small.width,256);assert.equal(small.height,256);assert(small.hasAlpha);
  const meta=await sharp(copied).metadata();
  assert.equal(meta.width,width);assert.equal(meta.height,width);
}
const {V3_ART_APPROVED,LAYERED_APP_PREVIEW_APPROVED}=
  await import('../apps/web/src/dev/bobekArtGate.ts');
assert.equal(V3_ART_APPROVED,false,'Displaced V3 art must remain inaccessible');
assert.equal(LAYERED_APP_PREVIEW_APPROVED,false,'Unapproved overlays cannot reach regular app screens');
const appSource=readFileSync(join(root,'apps/web/src/components/Beaver.tsx'),'utf8');
assert(appSource.includes('if (!LAYERED_APP_PREVIEW_APPROVED || previewEquipment === null'),
  'Main Beaver must refuse old persisted cutout-preview flags');
console.log('Bobek QA PASS: exact approved front/wave, native dimensions 512/1024 and disabled unstable outfits.');
