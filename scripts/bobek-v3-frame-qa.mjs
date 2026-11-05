/**
 * Render both separately dressed V3.2 cutout arms at the CSS wave extremes.
 * Tests connected shoulder alpha; uploads ACTUAL composite keyframes for review.
 * This does NOT certify artistic anatomy, cloth folds, or a finished skeletal rig.
 */
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import sharp from 'sharp';
import {resolveLook} from '@polski-go/shared';
import {v3ManifestForEquipment} from '../apps/web/src/dev/lookV3Manifest.ts';

const N=1024;
const root=process.cwd();
const artRoot=join(root,'apps/web/src/dev');
const output=join(root,'docs/qa/bobek-v3-frames');
mkdirSync(output,{recursive:true});
const read=async(key)=>sharp(join(artRoot,key+'.webp')).ensureAlpha().png().toBuffer();
const rotate=async(png,degrees,center)=>sharp(Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${N}" height="${N}">
   <g transform="rotate(${degrees} ${center.x} ${center.y})">
    <image href="data:image/png;base64,${png.toString('base64')}" width="${N}" height="${N}"/>
   </g></svg>`
)).png().toBuffer();
const overlapCount=async(a,b)=>{
  const alphaA=await sharp(a).extractChannel(3).raw().toBuffer();
  const alphaB=await sharp(b).extractChannel(3).raw().toBuffer();
  assert.equal(alphaA.length,N*N);
  assert.equal(alphaA.length,alphaB.length);
  let overlap=0;
  for(let i=0;i<alphaA.length;i++)if(alphaA[i]>50&&alphaB[i]>50)overlap++;
  return overlap;
};
const transparent=()=>sharp({create:{
  width:N,height:N,channels:4,background:{r:0,g:0,b:0,alpha:0},
}}).png().toBuffer();
const compose=(back,front)=>sharp(back).composite([{input:front}]).png().toBuffer();
const neutral=await sharp({create:{
  width:N,height:N,channels:4,background:{r:239,g:244,b:251,alpha:1},
}}).png().toBuffer();
const report={
  version:'bobek-v32-2.5d-draft@1',
  status:'art-QA-only',
  note:'Alpha overlap alone cannot validate artist-quality joins. Denim sleeve is recolored proof-of-fit.',
  outfits:[],
};
for(const {id,items,armId,bodyIds,minimum} of [
  {id:'red',items:['hoodie-red','backpack-travel'],armId:'v31:hoodie:wave-arm',bodyIds:['v3-base:torso-wave','v31:hoodie:wave'],minimum:4000},
  {id:'denim',items:['jacket-denim','backpack-travel'],armId:'v32:jacket:wave-arm',bodyIds:['v3-base:torso-wave','v32:jacket:wave'],minimum:1500},
]){
  const look=resolveLook(null,items,{manifest:v3ManifestForEquipment(items),mood:'wave'});
  assert.equal(look.mode,'layered',id);
  assert.equal(look.pose,'front-wave',id);
  assert.equal(look.poseFallback,false,id);
  const arm=look.layers.find(l=>l.id===armId);
  assert(arm && arm.motion==='wave' && arm.motionOrigin,`${id}: no separately moving arm`);
  const armImage=await read(arm.asset);
  const mainLayers=look.layers.filter(l=>bodyIds.includes(l.id));
  assert.equal(mainLayers.length,2,id);
  let shoulder=await transparent();
  for(const layer of mainLayers)shoulder=await compose(shoulder,await read(layer.asset));
  const entry={id,frames:[]};
  for(const angle of [-6,-1,4,9]){
    const turnedArm=await rotate(armImage,angle,arm.motionOrigin);
    const overlap=await overlapCount(shoulder,turnedArm);
    assert(overlap>=minimum,`${id}: shoulder disconnected at ${angle}°, only ${overlap} contact pixels`);
    let character=await transparent();
    for(const layer of look.layers)
      character=await compose(character,layer.id===arm.id?turnedArm:await read(layer.asset));
    const file=`${id}-wave-${angle<0?'m':'p'}${String(Math.abs(angle)).padStart(2,'0')}.png`;
    await sharp(await compose(neutral,character)).resize(512,512).png().toFile(join(output,file));
    entry.frames.push({angle,contactPixels:overlap,file});
  }
  report.outfits.push(entry);
}
writeFileSync(join(output,'qa-report.json'),JSON.stringify(report,null,2)+'\n');
console.log('Bobek V3.2 frame QA PASS: '+report.outfits.map(o=>o.id+' '+o.frames.map(f=>`${f.angle}°=${f.contactPixels}`).join(', ')).join(' / '));
console.log('Eight composite frames and JSON in docs/qa/bobek-v3-frames; manual artistic review required');
