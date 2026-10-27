/**
 * Проверка картинок бота (apps/web/public/bot/**) по самим файлам: размер, формат, дубли, мыльные боковые полосы,
 * увеличение маленького кадра (scripts/lib/image-quality.mjs), версии адресов для Telegram.
 *
 *   node scripts/validate-assets.mjs                    # проверка, выход 1 при ошибке
 *   node scripts/validate-assets.mjs --write-versions   # пересобрать apps/server/src/bot/image-versions.json
 *
 * Мыльная полоса или увеличенный кадр — ошибка. Исключение по увеличению — только кадры из `soft_fallback`
 * в assets/telegram/asset-manifest.json (мягкий, но без полос запасной кадр, пока нет исходника).
 * Дубли — по пикселям уменьшенной копии. Известные дубли нейтральных кадров `commands/*` (legacy_neutral) — предупреждение.
 * Версии: Telegram кэширует картинку по адресу, поэтому бот шлёт `/bot/<файл>?v=<хэш содержимого>` (catalog.ts, botImageUrl).
 * Если файл поменялся, а версия нет — ошибка: Telegram мог бы показать старый кадр.
 */
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, relative } from 'node:path';
import { analyseImage, qualityProblems } from './lib/image-quality.mjs';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const ROOT = new URL('../apps/web/public/bot/', import.meta.url).pathname;
const VERSIONS = new URL('../apps/server/src/bot/image-versions.json', import.meta.url);
const MAX_BYTES = 10 * 1024 * 1024; // лимит sendPhoto

const walk = (dir) => readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]));
export const contentVersion = (bytes) => createHash('sha256').update(bytes).digest('hex').slice(0, 10);

const manifest = JSON.parse(readFileSync(new URL('../assets/telegram/asset-manifest.json', import.meta.url), 'utf8'));
const legacy = new Set(manifest.legacy_neutral ?? []);
const soft = new Set((manifest.soft_fallback ?? []).map((s) => s.file));
const errors = [];
const warnings = [];
const files = walk(ROOT).filter((f) => f.endsWith('.jpg')).sort();
const hashes = new Map();
const versions = {};

for (const file of files) {
  const rel = relative(ROOT, file);
  const bytes = readFileSync(file);
  const meta = await sharp(bytes).metadata();
  const isSmall = rel.endsWith('@640.jpg');
  const [w, h] = isSmall ? [640, 360] : [1280, 720];
  if (meta.format !== 'jpeg') errors.push(`${rel}: не JPEG`);
  if (meta.width !== w || meta.height !== h) errors.push(`${rel}: ${meta.width}×${meta.height}, нужно ${w}×${h}`);
  if (meta.hasAlpha) errors.push(`${rel}: есть альфа-канал`);
  if (bytes.length > MAX_BYTES) errors.push(`${rel}: больше 10 МБ`);
  if (!isSmall) versions[rel] = contentVersion(bytes);

  // Дубли ищем по пикселям, не по байтам: один кадр, пересохранённый заново, всё равно дубль.
  const tiny = await sharp(bytes).resize(32, 18, { fit: 'fill' }).greyscale().raw().toBuffer();
  const key = createHash('md5').update(tiny).digest('hex');
  if (!isSmall) {
    if (hashes.has(key)) {
      const twin = hashes.get(key);
      (legacy.has(rel) && legacy.has(twin) ? warnings : errors).push(`${rel}: тот же кадр, что и ${twin}`);
    } else hashes.set(key, rel);
  }

  const q = await analyseImage(bytes);
  for (const p of qualityProblems(q, { softAllowed: soft.has(rel) })) errors.push(`${rel}: ${p}`);
  if (soft.has(rel)) warnings.push(`${rel}: мягкий запасной кадр (детали ${q.detail}), нужен исходник — см. soft_fallback`);
  console.log(
    `${rel.padEnd(30)} ${meta.width}×${meta.height} ${(bytes.length / 1024).toFixed(0).padStart(4)} KB  полосы ${q.bandLeft}/${q.bandRight} px  края ${q.edgeLeft}%/${q.edgeRight}%  детали ${q.detail.toFixed(2)}`,
  );
}

for (const s of manifest.soft_fallback ?? []) if (!versions[s.file]) errors.push(`soft_fallback: ${s.file} нет в public/bot`);

const wanted = `${JSON.stringify(versions, null, 2)}\n`;
if (process.argv.includes('--write-versions')) {
  writeFileSync(VERSIONS, wanted);
  console.log(`\nзаписано: apps/server/src/bot/image-versions.json (${Object.keys(versions).length})`);
} else {
  let current = '';
  try {
    current = readFileSync(VERSIONS, 'utf8');
  } catch {}
  if (current !== wanted) errors.push('apps/server/src/bot/image-versions.json устарел: node scripts/validate-assets.mjs --write-versions');
}

console.log(`\nпроверено: ${files.length} файлов`);
if (warnings.length) console.warn(`\nПРЕДУПРЕЖДЕНИЯ (${warnings.length}):\n- ${warnings.join('\n- ')}`);
if (errors.length) {
  console.error(`\nОШИБКИ (${errors.length}):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log('ошибок нет');
