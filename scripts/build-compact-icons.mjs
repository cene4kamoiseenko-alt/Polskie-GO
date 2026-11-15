/** Delivery encoding for the six approved generated masters. No vector artwork or masks. */
import { sharp } from './lib/sprite.mjs';

for (const name of ['review', 'mistakes', 'timer', 'speed', 'settings', 'friends']) {
  const input = new URL(`../docs/design/compact-home/${name}-approved.png`, import.meta.url);
  const output = new URL(`../apps/web/src/assets/icons/${name}.webp`, import.meta.url);
  await sharp(input.pathname)
    .resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 90, alphaQuality: 100, effort: 6 })
    .toFile(output.pathname);
  console.log(name);
}
