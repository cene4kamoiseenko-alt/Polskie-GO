/**
 * Keep Bobek's two ALREADY APPROVED whole-look poses as visual identity masters.
 *
 * IMPORTANT: Production uses two native resolutions: front=512 and wave=1024.
 * Never crop/resize unrelated garment layers independently; do not recolor
 * cheeks/paws/tail to invent a "denim jacket". We deliberately supply NO
 * new swappable item until new art is registered on one character geometry.
 *
 * npm run bobek:coherent:generate
 */
import {existsSync, mkdirSync,copyFileSync} from 'node:fs';
import {join} from 'node:path';
import sharp from 'sharp';

const root=process.cwd(),input=join(root,'apps/web/src/assets/beaver');
const out=join(root,'apps/web/src/dev/bobek-coherent');
mkdirSync(out,{recursive:true});
for(const [pose,expected] of [['front',512],['wave',1024]]){
  const file=join(input,pose+'.webp'),dest=join(out,pose+'-approved.webp');
  if(!existsSync(file))throw Error('Missing approved character art: '+file);
  const m=await sharp(file).metadata();
  if(m.width!==expected||m.height!==expected||!m.hasAlpha)
    throw Error(`${pose}: unexpected original canvas ${m.width}x${m.height}`);
  copyFileSync(file,dest); // exact source bytes, preserving identity
  await sharp(file).resize(256,256).webp({quality:93,effort:4})
    .toFile(join(out,pose+'-approved@256.webp'));
  console.log(`${pose}: exact unmodified approved Bobek (${expected}x${expected})`);
}
console.log('No new garment/color synthesized. Unapproved cutout clothing remains disabled.');
