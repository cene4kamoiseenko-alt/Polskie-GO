/**
 * Bobek V4: verify red and blue are THE SAME canonical full-character geometry.
 * Checks exact alpha, untouched face/paws/PL logo, and localized garment recolor.
 * This is a one-pose colorway QA, not an independently swappable jacket or a rig.
 */
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
import sharp from 'sharp';

const root=process.cwd();
const originalFile=join(root,'apps/web/src/assets/beaver/front.webp');
const sourceCopy=join(root,'apps/web/src/dev/bobek-coherent/front-approved.webp');
const blueFile=join(root,'apps/web/src/dev/bobek-coherent/front-blue-colorway.webp');
const maskFile=join(root,'apps/web/src/dev/bobek-coherent/front-blue-overlay.webp');
const reportFile=join(root,'apps/web/src/dev/bobek-coherent/front-blue-mask-report.json');
assert(existsSync(blueFile),'Generate Bobek V4 colorway before checking it');
assert.deepEqual(readFileSync(originalFile),readFileSync(sourceCopy),'Approved red master may never change');
const decode=async(file)=>sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});
const red=await decode(originalFile),blue=await decode(blueFile),overlay=await decode(maskFile);
for(const pic of [red,blue,overlay]) {
  assert.equal(pic.info.width,512);
  assert.equal(pic.info.height,512);
  assert.equal(pic.info.channels,4);
}
const region=(x,y)=>
  (x>128&&x<450&&y>=302&&y<=447)||
  (x>143&&x<212&&y>=292&&y<=333)||
  (x>407&&x<455&&y>=275&&y<=335);
let changed=0,incorrect=0,mismatchAlpha=0,mask=0;
for(let y=0;y<512;y++)for(let x=0;x<512;x++){
  const i=(y*512+x)*4;
  if(red.data[i+3]!==blue.data[i+3])mismatchAlpha++;
  const diff=red.data[i]!==blue.data[i]||
    red.data[i+1]!==blue.data[i+1]||red.data[i+2]!==blue.data[i+2];
  if(diff) {
    changed++;
    if(!region(x,y))incorrect++;
  }
  if(overlay.data[i+3])mask++;
}
assert.equal(mismatchAlpha,0,'Body silhouette / alpha changed — colorway must be pixel-registered');
assert.equal(incorrect,0,'Recolor leaked onto character outside original garment region');
assert(changed>10000 && changed<30000,`Unexpected garment recolor coverage: ${changed}`);
assert.equal(changed,mask,'Overlay mask must represent precisely the changed pixels');
// Original bright logo remains white; important non-cloth parts unchanged.
for(const [x,y] of [[352,348],[230,350],[154,317],[390,439]]){
  const i=(y*512+x)*4;
  assert.deepEqual(blue.data.subarray(i,i+4),red.data.subarray(i,i+4),
    `Canonical face, paws, or PL logo altered at ${x},${y}`);
}
const sample=(x,y)=>[blue.data[(y*512+x)*4],blue.data[(y*512+x)*4+1],blue.data[(y*512+x)*4+2]];
const [r,g,b]=sample(300,360);
assert(b>r*1.25&&b>g*1.05,'Blue hoodie color not visibly blue');
const small=await sharp(join(root,'apps/web/src/dev/bobek-coherent/front-blue-colorway@256.webp')).metadata();
assert.equal(small.width,256);assert.equal(small.height,256);assert(small.hasAlpha);
const report=JSON.parse(readFileSync(reportFile,'utf8'));
assert.equal(report.changedPixels,changed);
assert(!existsSync(join(root,'apps/web/src/dev/bobek-coherent/wave-blue-colorway.webp')),
  'No false blue wave should be generated from unrelated original pose');
console.log(`Bobek V4 QA PASS: ${changed} recolored cloth pixels, exact alpha and unchanged face/paws/logo; no drifting parts.`);
