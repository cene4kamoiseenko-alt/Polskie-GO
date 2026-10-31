/**
 * Pixel QA for POLSKI GO beaver parts; never treats the painted prototype as production art.
 * Usage: node scripts/validate-bobek-art.mjs [--production] [--json]
 * Uses sharp already required by scripts/validate-assets.mjs.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const sharp = require('sharp');
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const production = process.argv.includes('--production');
const json = process.argv.includes('--json');
const dir = join(ROOT, production ? 'apps/web/src/assets/look' : 'apps/web/src/dev/look-proto');
const errors = [], warnings = [], images = [];
const problem = (list, code, detail) => list.push({ code, detail });
const walk = (folder) => readdirSync(folder).flatMap((name) => {
  const path = join(folder, name);
  return statSync(path).isDirectory() ? walk(path) : [path];
});

if (!existsSync(dir)) {
  problem(errors, 'missing-directory', `${relative(ROOT, dir)}: нет каталога многослойных файлов`);
} else {
  const files = walk(dir).filter((file) => file.endsWith('.webp')).sort();
  if (!files.length) problem(errors, 'missing-art', `${relative(ROOT, dir)}: нет WebP-слоёв`);
  for (const file of files) {
    const name = relative(dir, file).split('\\').join('/');
    const expected = /@(256|512|1024)\.webp$/.exec(name);
    const size = expected ? Number(expected[1]) : name.includes('/') ? 1024 : null;
    try {
      const meta = await sharp(file).metadata();
      if (meta.format !== 'webp') problem(errors, 'format', `${name}: нужен WebP`);
      if (!meta.hasAlpha) problem(errors, 'alpha', `${name}: отсутствует прозрачный канал`);
      if (size && (meta.width !== size || meta.height !== size)) {
        problem(errors, 'canvas', `${name}: ${meta.width}×${meta.height}; требуется ${size}×${size}`);
      }
      const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      let visible = 0, boundary = 0;
      let minX = info.width, minY = info.height, maxX = -1, maxY = -1;
      for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
        const a = data[(y * info.width + x) * info.channels + 3];
        if (a < 8) continue;
        visible++;
        if (x === 0 || y === 0 || x === info.width - 1 || y === info.height - 1) boundary++;
        minX = Math.min(x, minX); minY = Math.min(y, minY);
        maxX = Math.max(x, maxX); maxY = Math.max(y, maxY);
      }
      if (!visible) problem(errors, 'empty', `${name}: слой полностью прозрачный`);
      if (boundary) problem(warnings, 'edge', `${name}: ${boundary} непрозрачных граничных пикселей (возможная обрезка)`);
      if (visible && visible / (info.width * info.height) > .94) problem(warnings, 'background', `${name}: почти весь холст непрозрачен`);
      images.push({ name, width: info.width, height: info.height, visible, bounds: visible ? [minX, minY, maxX + 1, maxY + 1] : null });
    } catch (err) {
      problem(errors, 'decode', `${name}: ${String(err)}`);
    }
  }
  if (!production) {
    const poses = ['idle', 'wave', 'think', 'happy', 'celebrate'];
    const assets = ['body', 'blink', 'top-hoodie-red', 'top-jacket-denim', 'backpack'];
    const present = new Set(images.map((x) => x.name));
    for (const pose of poses) for (const asset of assets) for (const suffix of ['', '@512']) {
      const key = `${pose}/${asset}${suffix}.webp`;
      if (!present.has(key)) problem(errors, 'missing-prototype', key);
    }
    for (const asset of ['arm-body', 'arm-top-hoodie-red', 'arm-top-jacket-denim']) for (const suffix of ['', '@512']) {
      const key = `wave/${asset}${suffix}.webp`;
      if (!present.has(key)) problem(errors, 'missing-prototype', key);
    }
    for (const name of ['cap-red.webp', 'glasses-round.webp']) if (!present.has(name)) problem(errors, 'missing-prototype', name);
    // This warns about painted-shape reuse, but isn't a pixel-quality failure in the prototype.
    for (const pose of poses) {
      const a = join(dir, pose, 'top-hoodie-red.webp');
      const b = join(dir, pose, 'top-jacket-denim.webp');
      if (!existsSync(a) || !existsSync(b)) continue;
      const alpha = async (file) => sharp(file).extractChannel(3).raw().toBuffer();
      if ((await alpha(a)).equals(await alpha(b))) {
        problem(warnings, 'repainted-outfit', `${pose}: hoodie-red и jacket-denim имеют идентичную альфа-маску`);
      }
    }
    const metaFile = join(dir, 'meta.json');
    if (!existsSync(metaFile)) problem(errors, 'missing-anchors', 'нет meta.json с якорями');
    else try {
      const meta = JSON.parse(readFileSync(metaFile, 'utf8'));
      if (meta.canvas !== 1024) problem(errors, 'meta-canvas', 'meta.json: canvas должен быть 1024');
      for (const pose of poses) {
        const p = meta.poses?.[pose];
        if (!p?.anchors?.eyes || !p?.anchors?.['head-top']) problem(errors, 'missing-anchors', `${pose}: нужны якоря глаз и макушки`);
      }
    } catch (err) { problem(errors, 'meta-parse', String(err)); }
  } else {
    problem(warnings, 'art-review', 'Автоматическая проверка не гарантирует совпадение лица и отделение одежды: обязателен визуальный QA.');
  }
}
const result = { target: production ? 'production' : 'prototype', files: images.length, errors, warnings, images };
if (json) console.log(JSON.stringify(result, null, 2));
else {
  console.log(`Bobek ${result.target}: ${images.length} WebP, ${errors.length} ошибок, ${warnings.length} предупреждений`);
  for (const x of errors) console.error(`ERROR ${x.code}: ${x.detail}`);
  for (const x of warnings) console.warn(`WARN  ${x.code}: ${x.detail}`);
}
process.exitCode = errors.length ? 1 : production && warnings.length ? 1 : 0;
