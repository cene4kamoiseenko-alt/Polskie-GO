/**
 * Render and verify the ACTUAL composited Bobek V3.1 at the extremes of his wave.
 *
 * Unlike sprite-presence tests this catches a floating/detached shoulder and
 * writes four screenshots for visual review of clothing alignment.
 * Run: node --import tsx scripts/bobek-v3-frame-qa.mjs
 * First run: npm run bobek:v3:generate
 */
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { resolveLook } from '@polski-go/shared';
import { v3ManifestForEquipment } from '../apps/web/src/dev/lookV3Manifest.ts';

const N = 1024;
const root = process.cwd();
const artRoot = join(root, 'apps/web/src/dev');
const output = join(root, 'docs/qa/bobek-v3-frames');
mkdirSync(output, { recursive: true });

const read = async (key) => sharp(join(artRoot, key + '.webp')).ensureAlpha().png().toBuffer();
const waveSvg = (png, degrees, center) => Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${N}" height="${N}" viewBox="0 0 ${N} ${N}">
    <g transform="rotate(${degrees} ${center.x} ${center.y})">
      <image href="data:image/png;base64,${png.toString('base64')}" width="${N}" height="${N}"/>
    </g></svg>`,
);
const rotate = async (png, deg, center) => sharp(waveSvg(png, deg, center)).png().toBuffer();
const overlapCount = async (first, second) => {
  const a = await sharp(first).extractChannel(3).raw().toBuffer();
  const b = await sharp(second).extractChannel(3).raw().toBuffer();
  assert.equal(a.length, N * N);
  assert.equal(a.length, b.length);
  let overlap = 0;
  for (let i = 0; i < a.length; i++) if (a[i] > 50 && b[i] > 50) overlap++;
  return overlap;
};
const transparent = async () => sharp({ create: {
  width:N, height:N, channels:4, background: {r:0,g:0,b:0,alpha:0},
}}).png().toBuffer();
const compose = async (back, front) => sharp(back).composite([{input:front}]).png().toBuffer();

const report = {
  version: 'bobek-v31-2.5d-draft@1',
  red_hoodie_wave: [],
  denim_wave_fallback: false,
  notes: 'Automatic mask continuity is not a substitute for hand-retouched shoulder seams.',
};

const waveOutfit = ['hoodie-red', 'backpack-travel'];
const look = resolveLook(null, waveOutfit, { manifest:v3ManifestForEquipment(waveOutfit), mood:'wave' });
assert.equal(look.mode, 'layered');
assert.equal(look.pose, 'front-wave');
const arm = look.layers.find(l => l.id === 'v31:hoodie:wave-arm');
assert(arm && arm.motion === 'wave' && arm.motionOrigin, 'Missing separately animated sleeve');

const armImage = await read(arm.asset);
const weldBodyLayers = look.layers.filter(l => ['v3-base:torso-wave', 'v31:hoodie:wave'].includes(l.id));
assert.equal(weldBodyLayers.length, 2);
let shoulderBody = await transparent();
for (const layer of weldBodyLayers) shoulderBody = await compose(shoulderBody, await read(layer.asset));

for (const angle of [-6, -1, 4, 9]) {
  // These are the actual look-wave CSS rotation extremes and intermediate angles.
  const turnedArm = await rotate(armImage, angle, arm.motionOrigin);
  const overlap = await overlapCount(shoulderBody, turnedArm);
  assert(overlap >= 4000,
    `Wave shoulder disconnected at ${angle}° (${overlap} contacting pixels)`);
  let character = await transparent();
  for (const layer of look.layers) {
    const input = layer.id === arm.id ? turnedArm : await read(layer.asset);
    character = await compose(character, input);
  }
  const neutral = await sharp({create:{
    width:N,height:N,channels:4,background:{r:239,g:244,b:251,alpha:1},
  }}).png().toBuffer();
  const frame = await compose(neutral,character);
  const file = `wave-${angle < 0 ? 'm' : 'p'}${String(Math.abs(angle)).padStart(2,'0')}.png`;
  await sharp(frame).resize(512,512).png().toFile(join(output,file));
  report.red_hoodie_wave.push({angle, contactPixels:overlap, file});
}

// The jacket remains still; no red hoodie arm is ever rendered above blue fabric.
const denimOutfit = ['jacket-denim','backpack-travel'];
const denim = resolveLook(null,denimOutfit,{manifest:v3ManifestForEquipment(denimOutfit),mood:'wave'});
assert.equal(denim.pose, 'front-idle');
assert.equal(denim.poseFallback, true);
assert(!denim.layers.some(l => l.motion === 'wave'));
report.denim_wave_fallback = true;
let denimLayered = await transparent();
for(const layer of denim.layers) denimLayered=await compose(denimLayered,await read(layer.asset));
const bg=await sharp({create:{
  width:N,height:N,channels:4,background:{r:239,g:244,b:251,alpha:1},
}}).png().toBuffer();
await sharp(await compose(bg,denimLayered)).resize(512,512).png().toFile(join(output,'denim-idle.png'));
writeFileSync(join(output,'qa-report.json'),JSON.stringify(report,null,2)+'\n');
console.log('V3.1 composited-frame QA PASS: '+report.red_hoodie_wave.map(r => `${r.angle}°=${r.contactPixels}px`).join(', '));
console.log('Five review files and qa-report.json generated in docs/qa/bobek-v3-frames');
