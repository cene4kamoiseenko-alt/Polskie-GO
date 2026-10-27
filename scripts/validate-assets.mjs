/**
 * Проверка картинок бота (apps/web/public/bot/**): размер, формат, отсутствие дублей, резкость краёв.
 *
 *   node scripts/validate-assets.mjs
 *
 * «Мыльные» боковые полосы — это растянутый и размытый кадр по краям (так выглядели старые ru/*.jpg, удалены).
 * Для них резкость (дисперсия лапласиана) на краях в десятки раз ниже, чем в центре. Сравниваем полосы по 6 % с каждого
 * края с серединой кадра. Измерено: старые кадры — 1–2 % от центра, нормальные полнокадровые — от 10 % (гладкое небо
 * у края даёт низкие значения, но не такие), новые доски — от 40 %. Порог 5 % отделяет одно от другого.
 * Дубли — по пикселям уменьшенной копии. Известные дубли нейтральных кадров `commands/*` (assets/telegram/asset-manifest.json,
 * legacy_neutral) выводятся как предупреждение: заменить их нечем, пока нет новых кадров.
 * Выход 1, если нашлась ошибка.
 */
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, relative } from 'node:path';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const ROOT = new URL('../apps/web/public/bot/', import.meta.url).pathname;
const EDGE_SHARPNESS_MIN = 0.05; // резкость полосы у края / резкость середины
const MAX_BYTES = 10 * 1024 * 1024; // лимит sendPhoto

const walk = (dir) => readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]));

/** Дисперсия лапласиана серого кадра в прямоугольнике. */
async function sharpness(input, { left, top, width, height }) {
  const { data, info } = await sharp(input).extract({ left, top, width, height }).greyscale().raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  let sum = 0;
  let sumSq = 0;
  let n = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const lap = 4 * data[i] - data[i - 1] - data[i + 1] - data[i - w] - data[i + w];
      sum += lap;
      sumSq += lap * lap;
      n++;
    }
  }
  const mean = sum / n;
  return sumSq / n - mean * mean;
}

const manifest = JSON.parse(readFileSync(new URL('../assets/telegram/asset-manifest.json', import.meta.url), 'utf8'));
const legacy = new Set(manifest.legacy_neutral ?? []);
const errors = [];
const warnings = [];
const files = walk(ROOT).filter((f) => f.endsWith('.jpg')).sort();
const hashes = new Map();

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

  // Дубли ищем по пикселям, не по байтам: один кадр, пересохранённый заново, всё равно дубль.
  const tiny = await sharp(bytes).resize(32, 18, { fit: 'fill' }).greyscale().raw().toBuffer();
  const key = createHash('md5').update(tiny).digest('hex');
  if (!isSmall) {
    if (hashes.has(key)) {
      const twin = hashes.get(key);
      (legacy.has(rel) && legacy.has(twin) ? warnings : errors).push(`${rel}: тот же кадр, что и ${twin}`);
    } else hashes.set(key, rel);
  }

  const strip = Math.round(meta.width * 0.06);
  const mid = await sharpness(bytes, { left: Math.round(meta.width * 0.3), top: 0, width: Math.round(meta.width * 0.4), height: meta.height });
  const sides = [
    ['левая', await sharpness(bytes, { left: 0, top: 0, width: strip, height: meta.height })],
    ['правая', await sharpness(bytes, { left: meta.width - strip, top: 0, width: strip, height: meta.height })],
  ];
  for (const [side, value] of sides) {
    const ratio = value / mid;
    if (ratio < EDGE_SHARPNESS_MIN) errors.push(`${rel}: ${side} полоса мыльная (резкость ${(ratio * 100).toFixed(0)} % от центра)`);
  }
  console.log(`${rel.padEnd(34)} ${meta.width}×${meta.height}  ${(bytes.length / 1024).toFixed(0).padStart(4)} KB  края ${sides.map(([, v]) => ((v / mid) * 100).toFixed(0) + '%').join('/')}`);
}

console.log(`\nпроверено: ${files.length} файлов`);
if (warnings.length) console.warn(`\nПРЕДУПРЕЖДЕНИЯ (${warnings.length}, известные дубли — нужны новые кадры):\n- ${warnings.join('\n- ')}`);
if (errors.length) {
  console.error(`\nОШИБКИ (${errors.length}):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log('ошибок нет');
