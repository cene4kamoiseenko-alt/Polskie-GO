/**
 * Bobek V5 artist's QA: every garment part uses exact 1024x1024 coordinates.
 * Test verifies that a separate jacket really overlays the same base without
 * moving the head/feet. Rendering a correct mask is NOT a human art approval.
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const folder=join(process.cwd(),'apps/web/src/dev/bobek-v5');
const pieces=['body'];
for(const outfit of ['red','denim']){
  for(const piece of ['left-sleeve','right-sleeve','front','collar'])pieces.push(`${outfit}-${piece}`);
  pieces.push(`composite-${outfit}`);
}
assert.equal(pieces.length,11);
const raw={};
for(const name of pieces)for(const size of [1024,512,256]){
  const filename=join(folder,`${name}${size===1024?'':'@'+size}.webp`);
  assert(existsSync(filename),`Missing: ${filename}`);
  const meta=await sharp(filename).metadata();
  assert.equal(meta.format,'webp');
  assert.equal(meta.width,size,`${name}: width mismatch`);
  assert.equal(meta.height,size,`${name}: height mismatch`);
  assert(meta.hasAlpha,`${name}: alpha channel missing`);
  if(size===1024)raw[name]=(await sharp(filename).ensureAlpha().raw().toBuffer({resolveWithObject:true})).data;
}
const n=1024;
const at=(buf,x,y)=>buf.subarray((y*n+x)*4,(y*n+x)*4+4);
const changedAlpha=(outfit,x,y)=>['left-sleeve','right-sleeve','front','collar']
  .some(part=>at(raw[`${outfit}-${part}`],x,y)[3]>0);
let nOutside=0,nDistorted=0,garmentPixels=0,paintA=0,paintB=0;
for(let y=0;y<n;y++)for(let x=0;x<n;x++){
  const coveredRed=changedAlpha('red',x,y),coveredBlue=changedAlpha('denim',x,y);
  const orig=at(raw.body,x,y);
  const red=at(raw['composite-red'],x,y);
  const blue=at(raw['composite-denim'],x,y);
  if(coveredRed||coveredBlue)garmentPixels++;
  if(!coveredRed&&!coveredBlue&&orig[3]>0){
    nOutside++;
    if(red.some((v,i)=>v!==orig[i])||blue.some((v,i)=>v!==orig[i]))nDistorted++;
  }
  if(y<490&&(coveredRed||coveredBlue))throw Error(`Garment paints over head at (${x},${y})`);
  if(y>875&&(coveredRed||coveredBlue))throw Error(`Garment paints over legs at (${x},${y})`);
}
assert(nOutside>90000,`Missing visible body outside clothing: ${nOutside}`);
assert.equal(nDistorted,0,`Body pixels changed outside shared garment masks: ${nDistorted}`);
assert(garmentPixels>50000,`Insufficient outfit coverage: ${garmentPixels}`);
const redFront=readFileSync(join(folder,'red-front.svg'),'utf8');
const denimFront=readFileSync(join(folder,'denim-front.svg'),'utf8');
assert(redFront.includes('>PL</text>'),'Red hoodie must contain the signature PL text');
assert(!denimFront.includes('>PL</text>')&&denimFront.includes('L575'),'Denim jacket must have different drawn garment details');
assert.notDeepEqual(raw['red-front'],raw['denim-front'],'Distinct outfits required, not simple recolor');
const m=JSON.parse(readFileSync(join(folder,'manifest.json'),'utf8'));
assert.equal(m.productionReady,false,'QA-only art must not be production ready');
assert.deepEqual(m.anchors.shoulderLeft,[440,564]);
assert.deepEqual(m.anchors.shoulderRight,[705,564]);
console.log(`Bobek V5 PASS: 11 art parts × 3 resolutions, ${nOutside} body pixels preserved, ${garmentPixels} painted garment pixels; idle-only, art review pending`);
