/** Generate seven aligned 2.5D front-idle and red-hoodie wave cutout layers from source-controlled art. QA only. */
import { readFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { gunzipSync } from 'node:zlib';
import sharp from 'sharp';

const root = process.cwd();
const inputFile = join(root, 'assets/bobek-v31-sources.json.gz.b64');
const destination = join(root, 'apps/web/src/dev/bobek-v3/idle');
const raw = JSON.parse(gunzipSync(Buffer.from(readFileSync(inputFile, 'utf8').trim(), 'base64')).toString('utf8'));
const parts = ['body', 'hoodie', 'jacket', 'pack', 'cap', 'glasses', 'arm-wave'];
if (Object.keys(raw).sort().join('|') !== [...parts].sort().join('|')) throw Error('Unexpected Bobek V3 source keys');
const placement = {
  body: [250, 76, 535, 810],
  // Both pieces are painted on their own full canvas. Their collars must
  // overlap the lower head/upper torso; the old y=540/532 made the garment
  // appear detached and covered the feet during wave.
  hoodie: [265, 480, 505, 315],
  jacket: [269, 472, 510, 319],
  pack: [229, 511, 220, 326],
  cap: [351, 62, 315, 185],
  // V3 source is already full of optical highlights; glasses must cover eyes, not the muzzle.
  glasses: [416, 255, 326, 128],
  // Distinct artist-supplied raised arm with RED sleeve. Jacket wave is unsupported.
  'arm-wave': [674, 387, 225, 240],
};
const size = 1024;
const layers = {};
for (const name of parts) {
  const input = Buffer.from(raw[name], 'base64');
  // The concept-sheet background removal also removed *enclosed white details*
  // (pupil highlights and two front teeth). Restore only enclosed transparent
  // islands; transparent exterior/background remains unchanged.
  let sourceImage = input;
  if (name === 'body') {
    const { data: pixels, info: px } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const w = px.width, h = px.height, channels = px.channels;
    const transparent = new Uint8Array(w*h);
    for (let i=0; i<transparent.length; i++) transparent[i] = pixels[i*channels+3] <= 10 ? 1 : 0;
    const exterior = new Uint8Array(w*h), queue = new Int32Array(w*h);
    let start=0,end=0;
    const add=(p) => { if (transparent[p] && !exterior[p]) { exterior[p]=1; queue[end++]=p; } };
    for (let x=0;x<w;x++) { add(x); add((h-1)*w+x); }
    for (let y=0;y<h;y++) { add(y*w); add(y*w+w-1); }
    while(start<end) {
      const i=queue[start++], x=i%w, y=Math.floor(i/w);
      if(x>0) add(i-1); if(x+1<w) add(i+1);
      if(y>0) add(i-w); if(y+1<h) add(i+w);
    }
    for(let i=0;i<transparent.length;i++) if(transparent[i] && !exterior[i]) {
      const base=i*channels;
      pixels[base]=255; pixels[base+1]=255; pixels[base+2]=255; pixels[base+3]=255;
    }
    sourceImage = await sharp(pixels, { raw: { width:w, height:h, channels } }).png().toBuffer();
  }
  const { data, info } = await sharp(sourceImage).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
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
  const cropped = await sharp(sourceImage)
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
// The idle arm is baked into the V3 body/hoodie source. Mask that arm only for
// the single supported red-hoodie wave pose, then draw a separate raised paw.
// This is a QA cutout, not a skeletal rig; seams still need manual retouch.
const removeRightArm = async (png, cutoff) => {
  const { data: rgba, info: meta } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject:true });
  for (let y=550;y<785;y++) {
    let edge = cutoff;
    if (y<580) edge=780-(y-550)*(780-cutoff)/30;
    if (y>710) edge=cutoff+(y-710)*1.05;
    for (let x=Math.max(0,Math.floor(edge));x<1024;x++) {
      const i=(y*1024+x)*meta.channels+3;
      const keep=Math.max(0,Math.min(1,(edge+14-x)/14));
      rgba[i]=Math.round(rgba[i]*keep);
    }
  }
  return sharp(rgba,{raw:{width:1024,height:1024,channels:meta.channels}}).png().toBuffer();
};
// Denim proof-of-fit: derive a TEMPORARY matching sleeve from the painterly
// raised-arm source. Blue fabric is repainted via hue/luminance; the warm fur
// remains untouched. This is not an independently illustrated final denim arm.
const denimArm = async (png) => {
  const { data: rgba, info } = await sharp(png).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  for(let i=0;i<rgba.length;i+=info.channels){
    const r=rgba[i],g=rgba[i+1],b=rgba[i+2],a=rgba[i+3];
    if(a<6)continue;
    const min=Math.min(r,g,b);
    const h=60*(g-b)/Math.max(1,r-min); // red centered on 0°, skin orange ~25°
    const chroma=(r-min)/Math.max(1,r);
    if(r>=g&&r>=b&&r>75&&h>-18&&h<14&&chroma>.25){
      rgba[i]=Math.min(255,Math.round(.19*r+.20*g+5));
      rgba[i+1]=Math.min(255,Math.round(.39*r+.38*g+8));
      rgba[i+2]=Math.min(255,Math.round(.64*r+.43*g+11));
    }
  }
  return sharp(rgba,{raw:{width:info.width,height:info.height,channels:info.channels}}).png().toBuffer();
};
const denimBase = await removeRightArm(generated['top-jacket-denim'],688);
// Slightly shaded blue shoulder underlay prevents a gap at the moving sleeve.
// It stays on the static jacket, so it never separates when the arm rotates.
const shoulderPatch = Buffer.from(`<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="denim" cx=".55" cy=".5" r=".7">
  <stop offset="0" stop-color="#4384c2" stop-opacity=".95"/>
  <stop offset=".7" stop-color="#275c9a" stop-opacity=".92"/>
  <stop offset="1" stop-color="#214b83" stop-opacity=".5"/></radialGradient></defs>
  <ellipse cx="695" cy="558" rx="45" ry="40" fill="url(#denim)"/>
  <path d="M669 533Q688 517 720 536" fill="none" stroke="#90b8dd" stroke-opacity=".35" stroke-width="3"/>
</svg>`);
const denimWaveTop = await sharp(denimBase).composite([{input:shoulderPatch}]).png().toBuffer();
const wave = {
  'torso': await removeRightArm(generated.torso,700),
  'top-hoodie-red': await removeRightArm(generated['top-hoodie-red'],688),
  'arm-hoodie-red':layers['arm-wave'],
  'top-jacket-denim':denimWaveTop,
  'arm-jacket-denim':await denimArm(layers['arm-wave']),
};
for (const [pose, spriteMap] of [['idle',generated],['wave',wave]]) {
  const target = pose==='idle' ? destination : join(root,'apps/web/src/dev/bobek-v3/wave');
  mkdirSync(target,{recursive:true});
  for (const [name,png] of Object.entries(spriteMap)) {
    for (const width of [1024,512,256]) {
      const path=join(target,name+(width===1024?'':'@'+width)+'.webp');
      await sharp(png).resize(width,width).webp({quality:90,effort:3}).toFile(path);
      const metadata=await sharp(path).metadata();
      if (metadata.width!==width||metadata.height!==width||!metadata.hasAlpha) throw Error('Invalid WebP: '+path);
    }
  }
}
console.log('Bobek V3.2: 7 idle / 5 wave sprites, 36 alpha WebP, red + provisional denim sleeves. QA draft.');
