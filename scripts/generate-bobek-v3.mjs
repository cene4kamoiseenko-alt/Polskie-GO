/** Generate seven aligned 2.5D front-idle cutout layers from source-controlled art. QA only. */
import { readFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { gunzipSync } from 'node:zlib';
import sharp from 'sharp';

const root = process.cwd();
const inputFile = join(root, 'assets/bobek-v3-sources.json.gz.b64');
const destination = join(root, 'apps/web/src/dev/bobek-v3/idle');
const raw = JSON.parse(gunzipSync(Buffer.from(readFileSync(inputFile, 'utf8').trim(), 'base64')).toString('utf8'));
const parts = ['body', 'hoodie', 'jacket', 'pack', 'cap', 'glasses'];
if (Object.keys(raw).sort().join('|') !== [...parts].sort().join('|')) throw Error('Unexpected Bobek V3 source keys');
const placement = {
  body: [250, 76, 535, 810],
  hoodie: [265, 540, 505, 315],
  jacket: [269, 532, 510, 319],
  pack: [229, 511, 220, 326],
  cap: [351, 62, 315, 185],
  glasses: [348, 335, 326, 128],
};
const size = 1024;
const layers = {};
for (const name of parts) {
  const input = Buffer.from(raw[name], 'base64');
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let left = info.width, top = info.height, right = -1, bottom = -1;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    const alpha = data[(y * info.width + x) * info.channels + 3];
    if (alpha) {
      left = Math.min(left, x); top = Math.min(top, y);
      right = Math.max(right, x); bottom = Math.max(bottom, y);
    }
  }
  if (right < left) throw Error('Empty artwork layer: ' + name);
  const [x, y, width, height] = placement[name];
  const cropped = await sharp(input)
    .extract({left, top, width: right-left+1, height: bottom-top+1})
    .resize(width, height, {fit:'fill',kernel:'lanczos3'}).png().toBuffer();
  layers[name] = await sharp({create:{width:size,height:size,channels:4,background:{r:0,g:0,b:0,alpha:0}}})
    .composite([{ input: cropped, left:x, top:y }]).png().toBuffer();
}
// A single scanned painted body: split into stationary head and torso on common canvas.
// This is a cutout seam, not a production-quality independent head/neck rig.
const {data: body, info} = await sharp(layers.body).ensureAlpha().raw().toBuffer({resolveWithObject:true});
const torso = Buffer.from(body), head = Buffer.from(body);
for (let y=0;y<size;y++) {
  const headWeight = y < 550 ? 1 : Math.max(0,Math.min(1,(590-y)/40));
  const torsoWeight = Math.max(0,Math.min(1,(y-510)/20));
  for (let x=0;x<size;x++) {
    const index=(y*size+x)*info.channels+3;
    torso[index]=Math.round(body[index]*torsoWeight);
    head[index]=Math.round(body[index]*headWeight);
  }
}
const toPNG = (pixels) => sharp(pixels,{raw:{width:size,height:size,channels:info.channels}}).png().toBuffer();
const generated = {
  torso:await toPNG(torso), head:await toPNG(head),
  'top-hoodie-red':layers.hoodie, 'top-jacket-denim':layers.jacket,
  backpack:layers.pack, 'cap-red':layers.cap, 'glasses-round':layers.glasses,
};
mkdirSync(destination,{recursive:true});
for (const [name,png] of Object.entries(generated)) {
  for (const width of [1024,512,256]) {
    const path=join(destination,name+(width===1024?'':'@'+width)+'.webp');
    await sharp(png).resize(width,width).webp({quality:90,effort:3}).toFile(path);
    const metadata=await sharp(path).metadata();
    if (metadata.width!==width||metadata.height!==width||!metadata.hasAlpha) throw Error('Invalid WebP: '+path);
  }
}
console.log('Bobek V3: 7 independent painted cutout layers / 21 transparent WebP. Front idle only, QA draft.');
