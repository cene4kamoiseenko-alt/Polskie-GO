/**
 * Generates Bobek V2 draft sprites from editable, source-controlled SVG artwork.
 *
 * Usage: node scripts/generate-bobek-v2.mjs
 * Input: assets/bobek-v2-sources.json.gz.b64 (gzip JSON of 35 authored SVG files).
 * Output: apps/web/src/dev/bobek-v2/{pose}/{part}.svg/.webp/@512.webp/@256.webp
 *
 * No external image generation, credentials or network calls; repeatable CI build.
 * QA ONLY. Never overwrite the production look, server outfit or premium catalog.
 */
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';
import sharp from 'sharp';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const sourceFile = join(root, 'assets/bobek-v2-sources.json.gz.b64');
const target = join(root, 'apps/web/src/dev/bobek-v2');
const poses = ['idle', 'wave', 'think', 'happy', 'celebrate'];
const parts = ['body', 'top-hoodie-red', 'top-jacket-denim', 'backpack', 'cap-red', 'glasses-round', 'blink'];

if (!existsSync(sourceFile)) throw Error('Missing Bobek V2 editable sources: ' + sourceFile);
const packed = readFileSync(sourceFile, 'utf8').trim();
const source = JSON.parse(gunzipSync(Buffer.from(packed, 'base64')).toString('utf8'));
const expected = new Set(poses.flatMap((pose) => parts.map((part) => `${pose}/${part}.svg`)));
const actual = Object.keys(source);
if (actual.length !== expected.size || actual.some((key) => !expected.has(key))) {
  throw Error(`Bobek V2 art source mismatch: expected ${expected.size}, got ${actual.length}. Refusing to generate.`);
}
let outputs = 0;
for (const key of [...expected].sort()) {
  const svg = source[key];
  if (typeof svg !== 'string' || !svg.startsWith('<svg') || !svg.includes('viewBox="0 0 1024 1024"')) {
    throw Error('Invalid SVG source: ' + key);
  }
  const folder = dirname(join(target, key));
  mkdirSync(folder, { recursive: true });
  writeFileSync(join(target, key), svg, 'utf8');
  const stem = key.slice(0, -4);
  const raw = Buffer.from(svg);
  for (const width of [1024, 512, 256]) {
    const to = join(target, `${stem}${width === 1024 ? '' : '@' + width}.webp`);
    const rendered = sharp(raw, { density: 96 }).resize(width, width)
      .webp({ quality: width === 256 ? 88 : 91, effort: 3 });
    await rendered.toFile(to);
    const metadata = await sharp(to).metadata();
    if (metadata.width !== width || metadata.height !== width || !metadata.hasAlpha) {
      throw Error('Invalid generated transparent sprite: ' + to);
    }
    outputs++;
  }
}
console.log(`Bobek V2 (QA): generated ${outputs} transparent WebP sprites from ${actual.length} editable SVG files under ${target}`);
