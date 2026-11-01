/**
 * Stable visual baseline for the Bobek art rebuild (QA only).
 *
 * Source images come from the already-approved WHOLE-LOOK beaver asset.
 * One silhouette per pose => no detached clothing or wrong shoulder anchors.
 * Blue is ONLY a recolored hoodie reference, **NOT** a denim jacket or
 * production wardrobe item. It must never be sold as a finished garment.
 *
 * npm run bobek:coherent:generate
 */
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const root=process.cwd();
const source=join(root,'apps/web/src/assets/beaver');
const target=join(root,'apps/web/src/dev/bobek-coherent');
mkdirSync(target,{recursive:true});

for(const pose of ['front','wave']){
  const file=join(source,pose+'.webp');
  if(!existsSync(file))throw Error('Missing approved original: '+file);
  const {data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  if(info.width!==512||info.height!==512||info.channels!==4)throw Error('Expected exact approved 512px RGBA Bobek source '+pose);
  const blue=Buffer.from(data);
  let changed=0;
  for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
    // Preserve the canonical face, eyes, cheeks, paws, teeth and hat.
    // Only pixels in the bottom garment region may change.
    if(y<250)continue;
    const i=(y*info.width+x)*info.channels;
    const r=data[i],g=data[i+1],b=data[i+2],a=data[i+3];
    if(a<12||r<70||r<g*1.3||r<b*1.3)continue;
    const max=Math.max(r,g,b),min=Math.min(r,g,b);
    if(max===min||((max-min)/max)<0.30)continue;
    const v=max/255,s=(max-min)/max,hue=0.585;
    const h=hue*6,k=Math.floor(h),f=h-k;
    const p=v*(1-s),q=v*(1-f*s),t=v*(1-(1-f)*s);
    const values=[[v,t,p],[q,v,p],[p,v,t],[p,q,v],[t,p,v],[v,p,q]][k%6];
    blue[i]=Math.round(values[0]*255*.96);
    blue[i+1]=Math.round(values[1]*255*.96);
    blue[i+2]=Math.round(values[2]*255*.96);
    changed++;
  }
  if(changed<3000)throw Error(`${pose}: expected >=3000 red garment pixels, got ${changed}`);
  for(const [label,rgba] of [['red',data],['blue-hoodie-proof',blue]]){
    const raw=sharp(rgba,{raw:{width:512,height:512,channels:4}});
    await raw.webp({quality:93,effort:5}).toFile(join(target,`${pose}-${label}.webp`));
    await sharp(rgba,{raw:{width:512,height:512,channels:4}}).resize(256,256)
      .webp({quality:90,effort:4}).toFile(join(target,`${pose}-${label}@256.webp`));
  }
  console.log(`Coherent Bobek ${pose}: original silhouette, ${changed} blue hoodie fabric pixels, no other pixel moved.`);
}
console.log('Generated static red master + BLUE HOODIE COLOR STUDY, not a denim jacket or layered rig.');
