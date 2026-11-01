/**
 * Bobek V4 pixel-registered apparel proof — blue fabric on the EXACT canonical
 * front character; no independent transforms, resizes, missing joints or skeletal claim.
 * This deliberately creates a blue hoodie COLORWAY, not a distinct denim jacket.
 * Red canonical artwork and actual player inventory remain unchanged.
 *
 * npm run bobek:v4:colorway
 */
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import sharp from 'sharp';

const root=process.cwd();
const file=join(root,'apps/web/src/assets/beaver/front.webp');
const out=join(root,'apps/web/src/dev/bobek-coherent');
mkdirSync(out,{recursive:true});
const {data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});
if(info.width!==512||info.height!==512||info.channels!==4)throw Error('Unexpected canonical Bobek sprite');
const recolored=Buffer.from(data);
const overlay=Buffer.alloc(data.length);
let changed=0;
const region=(x,y)=>
  (x>128&&x<450&&y>=302&&y<=447)||
  (x>143&&x<212&&y>=292&&y<=333)||
  (x>407&&x<455&&y>=275&&y<=335);

for(let y=0;y<512;y++)for(let x=0;x<512;x++){
  const i=(y*512+x)*4;
  const r=data[i],g=data[i+1],b=data[i+2],a=data[i+3];
  // Warm brown fur and eyes have significantly less blue than green, whereas
  // the existing red garment contains magenta/red pigment. Never recolor
  // arbitrary pixels by rectangular crop: preserve original face and paws.
  const redCloth=r>80&&r>g*1.45&&r>b*1.42&&b>g*.60;
  if(!region(x,y)||!redCloth||a<15)continue;
  const v=Math.max(r,g,b)/255;
  const mn=Math.min(r,g,b)/255;
  const sat=Math.max(.50,Math.min(.86,(v-mn)/Math.max(.01,v)));
  // Hue 215°, matching the existing premium 2.5D painted lighting.
  const c=v*sat, cross=c*(1-Math.abs(((215/60)%2)-1)),m=v-c;
  const rgb=[m,cross+m,c+m].map(t=>Math.round(Math.max(0,Math.min(1,t))*255));
  recolored[i]=rgb[0];recolored[i+1]=rgb[1];recolored[i+2]=rgb[2];
  overlay[i]=rgb[0];overlay[i+1]=rgb[1];overlay[i+2]=rgb[2];overlay[i+3]=a;
  changed++;
}
if(changed<10000||changed>30000)throw Error('Unacceptable garment color mask; colorway refused: '+changed);
const render=(buffer)=>sharp(buffer,{raw:{width:512,height:512,channels:4}});
await render(recolored).webp({quality:96,effort:4}).toFile(join(out,'front-blue-colorway.webp'));
await render(recolored).resize(256,256).webp({quality:92,effort:4}).toFile(join(out,'front-blue-colorway@256.webp'));
await render(overlay).webp({lossless:true,effort:4}).toFile(join(out,'front-blue-overlay.webp'));
writeFileSync(join(out,'front-blue-mask-report.json'),JSON.stringify({
  master:'apps/web/src/assets/beaver/front.webp',
  status:'QA ONLY — original geometry, not new skeletal body or denim garment',
  changedPixels:changed,sourceSize:[512,512],destinationSize:[512,512],
  composition:'same original pixel coordinates — no transformation, rotation or offset',
},null,2)+'\n');
console.log('Bobek V4 safe blue colorway: '+changed+' cloth pixels; identity/geometry unchanged.');
