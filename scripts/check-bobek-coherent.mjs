/**
 * Assert coherent whole-pose artwork has no physically drifting layers.
 * This certifies a *stable baseline*, not a replaceable-garment 2.5D rig.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import sharp from 'sharp';
const root=process.cwd(),dir=join(root,'apps/web/src/dev/bobek-coherent');
for(const pose of ['front','wave']){
  const filenames=['red','blue-hoodie-proof'];
  const decoded=[];
  for(const color of filenames){
    const p=join(dir,`${pose}-${color}.webp`);
    const meta=await sharp(p).metadata();
    assert.equal(meta.width,512);
    assert.equal(meta.height,512);
    assert.equal(meta.hasAlpha,true);
    decoded.push(await sharp(p).ensureAlpha().raw().toBuffer());
  }
  const [r,b]=decoded;
  assert.equal(r.length,b.length);
  let differentGarment=0,faceColorTotal=0,facePixels=0;
  for(let i=0;i<r.length;i+=4){
    assert.equal(r[i+3],b[i+3], 'The red and blue poses must preserve EXACTLY the same alpha silhouette');
    const y=Math.floor(i/(512*4));
    const delta=Math.abs(r[i]-b[i])+Math.abs(r[i+1]-b[i+1])+Math.abs(r[i+2]-b[i+2]);
    if(y<235 && r[i+3]>40){faceColorTotal+=delta;facePixels++;}
    if(y>=250 && delta>35 && r[i+3]>40)differentGarment++;
  }
  assert(faceColorTotal / Math.max(1,facePixels)<4.5, `${pose}: canonical face color changed`);
  assert(differentGarment>1500,`${pose}: expected visible blue garment proof`);
}
const {V3_ART_APPROVED,LAYERED_APP_PREVIEW_APPROVED}=await import('../apps/web/src/dev/bobekArtGate.ts');
assert.equal(V3_ART_APPROVED,false,'Visually broken V3 must remain blocked');
assert.equal(LAYERED_APP_PREVIEW_APPROVED,false,'Unapproved wardrobe layers cannot be enabled globally');
console.log('Coherent Bobek QA: stable silhouette/face for red and temporary blue hoodie, V3 artwork still blocked.');
