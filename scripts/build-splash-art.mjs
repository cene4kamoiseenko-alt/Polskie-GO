/**
 * Слои экрана загрузки (чистые мастера владельца 2026-11-01, docs/design/v19/loading/clean) → ассеты приложения.
 *
 *   node scripts/build-splash-art.mjs                 — собрать слои
 *   node scripts/build-splash-art.mjs --sheet out.png — + контрольный лист (сцена в сборе)
 *
 * Мастера (всё прислал владелец, чистое, без призраков):
 *   clean/royal_scene.webp   — «Замковая площадь», Варшава, закат, 1536×1024 без логотипа, Бобека и карточки;
 *   clean/royal_bobek.webp   — Бобек в красном худи PL с рюкзаком, 1122×1402, RGBA без потерь;
 *   clean/royal_logo.webp    — логотип POLSKI GO с синей обводкой, 2172×724, RGBA без потерь.
 * Первая версия заставки собиралась из архива с «чистыми» фонами, на которых оставались призраки логотипа, Бобека и карточки; конвейер их перерисовывал
 * (обрезанные лапы, мазки у тела, смазанная плита карточки). С чистыми мастерами всё это не нужно: удалено.
 *
 * Что делает конвейер:
 *  1. Фон. Кадр приложения портретный 941×1672, мастер — альбомный 3:2. Сцена масштабируется (SCENE_SCALE: столько же, сколько в концепте — колонна, дома и
 *     Бобек в тех же пропорциях), ставится так, чтобы колонна Сигизмунда стояла слева за Бобеком, и достраивается:
 *       · небо сверху (под логотипом) — цвет верхних строк мастера с лёгким сгущением к зениту и облаками, отражёнными от верхнего края (колонну не отражаем);
 *       · брусчатка снизу (под карточкой) — зеркальное продолжение чистой полосы площади, ниже она темнее и мягче.
 *     Размер файла — KBG × кадр (1,0; 1,2 и слои по 1,4 давали LCP холодного старта за бюджетом: картинки 636 КБ).
 *  2. Бобек. Альфа вырезки нормализуется (в мастере «непрозрачное» — 253 из 255: слой 1 % прозрачный), крошки с альфой < 8 убираются, цвет кромки
 *     (прозрачность < 250) берётся у ближайшего плотного пикселя (в мастере кромка по контуру подкрашена красным), слой обрезается по содержимому и
 *     масштабируется так, чтобы видимая высота Бобека была BOBEK_VISIBLE_H, а ноги стояли на линии BOBEK_FEET.
 *  3. Логотип. Крошки убираются, слой обрезается по содержимому; видимая ширина — LOGO_VISIBLE_W, верх букв — на LOGO_LETTERS_TOP.
 *  4. Украшение над логотипом (замок, лавр, дуги) — отдельным слоем `orn.webp`, вынутым из цельного концепта (originals/04_royal_original.webp) по белизне
 *     (min(R,G,B) на синем небе; блики жёлтой листвы исключены). Логотип из мастера — без этих деталей, поэтому они остаются отдельным слоем; приложение собирает
 *     логотип и украшение в одну группу, которая стоит под шапкой Telegram.
 * Результат: apps/web/src/assets/splash/royal/{bg,bg@640,bobek,logo,orn}.webp. Положение слоёв в кадре 941×1672 (`BOBEK`, `LOGO`, `ORN` в apps/web/src/lib/splashArt.ts)
 * скрипт печатает в конце — оттуда же числа для мгновенной заставки в apps/web/index.html.
 */
import { mkdirSync, readFileSync } from 'node:fs';
import { bounds, cleanSprite, crop, dilate, readRGBA, sharp, webp } from './lib/sprite.mjs';

const SRC = new URL('../docs/design/v19/loading/', import.meta.url);
const CLEAN = new URL('clean/', SRC);
const OUT = new URL('../apps/web/src/assets/splash/royal/', import.meta.url);
/** Кадр приложения, px. */
const W = 941;
const H = 1672;

// ── Настройки сборки (кадр 941×1672) ─────────────────────────────────────────────────────────────────────────────

/** Мастер сцены: размер и сколько пикселей кадра приходится на пиксель мастера (в концепте дома и колонна стояли в таких же пропорциях). */
const SCENE = { w: 1536, h: 1024, scale: 0.84, x: -170, y: 390 };
/** Колонна Сигизмунда в мастере (x от … до): небо над ней не отражаем — перевёрнутая статуя. Мостовая начинается ниже ступеней и оснований домов (y). */
const STATUE_X = [300, 520];
const PAVEMENT_FROM = 892;
/** Файл фона в долях кадра. Больше — резче на телефонах с DPR 3, но тяжелее: см. бюджет картинок в scripts/perf.ts. */
const KBG = 1.0;
/** Слои Бобека и логотипа — в долях кадра (Бобек на экране крупный: на DPR 3 желательно больше, но 1,4 не уложилось в бюджет LCP). */
const KSP = 1.25;

/** Бобек: видимая высота (по альфе > 128), линия ног и центр по горизонтали в кадре. Как в концепте владельца. */
const BOBEK_VISIBLE_H = 620;
const BOBEK_FEET = 1216;
const BOBEK_CENTER_X = 431;
/** Логотип: видимая ширина (по альфе > 128), верх букв и центр по горизонтали. */
const LOGO_VISIBLE_W = 694;
const LOGO_LETTERS_TOP = 172;
const LOGO_CENTER_X = 481;
/** Сила контактной тени под Бобеком (0…1). */
const SHADOW = 0.5;

const args = process.argv.slice(2);
const sheetPath = args.includes('--sheet') ? args[args.indexOf('--sheet') + 1] : null;

// ── Фон ──────────────────────────────────────────────────────────────────────────────────────────────────────────

/** Скользящее среднее по строке (три прохода ≈ гаусс). */
function smooth1d(src, radius) {
  let a = Float32Array.from(src);
  for (let pass = 0; pass < 3; pass++) {
    const b = new Float32Array(a.length), cs = new Float64Array(a.length + 1);
    for (let i = 0; i < a.length; i++) cs[i + 1] = cs[i] + a[i];
    for (let i = 0; i < a.length; i++) { const lo = Math.max(0, i - radius), hi = Math.min(a.length, i + radius + 1); b[i] = (cs[hi] - cs[lo]) / (hi - lo); }
    a = b;
  }
  return a;
}

/** Фон кадра: сцена мастера + достроенные небо сверху и брусчатка снизу (размер файла KBG × кадр). */
async function buildBackground() {
  const K = KBG, s = SCENE.scale * K;
  const Wc = Math.round(W * K), Hc = Math.round(H * K);
  const sw = Math.round(SCENE.w * s), sh = Math.round(SCENE.h * s);
  const xo = Math.round(SCENE.x * K), yo = Math.round(SCENE.y * K);
  const { data: scene } = await sharp(readFileSync(new URL('royal_scene.webp', CLEAN)))
    .removeAlpha().resize(sw, sh, { kernel: 'lanczos3' }).raw().toBuffer({ resolveWithObject: true });
  const px = new Float32Array(Wc * Hc * 3);
  const sceneAt = (x, y, k) => scene[(y * sw + (x - xo)) * 3 + k];
  const inScene = (x) => x - xo >= 0 && x - xo < sw;
  if (!inScene(0) || !inScene(Wc - 1)) throw new Error('сцена не закрывает кадр по ширине: поправь SCENE.x / SCENE.scale');
  for (let y = 0; y < sh && yo + y < Hc; y++) for (let x = 0; x < Wc; x++) for (let k = 0; k < 3; k++) px[((yo + y) * Wc + x) * 3 + k] = sceneAt(x, y, k);

  // Небо над сценой: цвет верхних строк (среднее по полосе, сглаженное по горизонтали), к зениту чуть гуще; облака — отражение верха мастера.
  const bandRows = Math.max(8, Math.round(24 * K));
  const skyColor = [0, 1, 2].map((k) => {
    const row = new Float32Array(sw);
    for (let x = 0; x < sw; x++) { let sum = 0; for (let y = 0; y < bandRows; y++) sum += scene[(y * sw + x) * 3 + k]; row[x] = sum / bandRows; }
    return smooth1d(row, Math.round(40 * K));
  });
  const reflRows = Math.min(yo, Math.round(160 * K));
  const [sx0, sx1] = STATUE_X.map((v) => v * s + xo);
  for (let y = 0; y < yo; y++) {
    const t = (yo - y) / yo, deepen = 1 - 0.1 * t;
    const i = yo - 1 - y; // строка мастера, от которой отражаем
    let f = i < reflRows ? 1 - i / reflRows : 0;
    f = f * f * (3 - 2 * f);
    for (let x = 0; x < Wc; x++) {
      const sx = x - xo;
      const col = [skyColor[0][sx] * deepen * 0.98, skyColor[1][sx] * deepen * 0.99, skyColor[2][sx] * Math.min(1, deepen + 0.03)];
      const keep = Math.max(0, Math.min(1, Math.min((x - sx0) / (30 * K), (sx1 - x) / (30 * K))));
      const a = f * (1 - keep);
      for (let k = 0; k < 3; k++) px[(y * Wc + x) * 3 + k] = a > 0 ? col[k] * (1 - a) + scene[(i * sw + sx) * 3 + k] * a : col[k];
    }
  }

  // Брусчатка под сценой: чистая полоса мастера (без ступеней и оснований домов), зеркально; чем дальше, тем темнее.
  const yb = yo + sh, p0 = Math.round(PAVEMENT_FROM * s), ph = sh - p0;
  for (let y = yb; y < Hc; y++) {
    const d = y - yb, m = d % (2 * ph), r = m < ph ? m : 2 * ph - 1 - m, sy = sh - 1 - r;
    const dark = 1 - 0.18 * Math.min(1, d / (450 * K));
    for (let x = 0; x < Wc; x++) for (let k = 0; k < 3; k++) px[(y * Wc + x) * 3 + k] = sceneAt(x, sy, k) * dark;
  }
  // Контактная тень под ногами Бобека (в мастере он стоит без тени: слой студийный): мягкий эллипс, затемняет и чуть холодит брусчатку.
  const [cx, cy, rx, ry] = [BOBEK_CENTER_X * K, (BOBEK_FEET - 6) * K, 215 * K, 26 * K];
  for (let y = Math.max(0, Math.floor(cy - ry * 3)); y < Math.min(Hc, Math.ceil(cy + ry * 3)); y++) {
    for (let x = Math.max(0, Math.floor(cx - rx * 3)); x < Math.min(Wc, Math.ceil(cx + rx * 3)); x++) {
      const d2 = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2, a = SHADOW * Math.exp(-d2 * 1.6);
      if (a < 0.004) continue;
      const i = (y * Wc + x) * 3;
      px[i] *= 1 - a * 0.95; px[i + 1] *= 1 - a * 0.95; px[i + 2] *= 1 - a * 0.8;
    }
  }
  const u8 = new Uint8Array(Wc * Hc * 3);
  for (let i = 0; i < u8.length; i++) u8[i] = Math.max(0, Math.min(255, Math.round(px[i])));
  // Достроенная брусчатка мягче: размытие только ниже шва (зеркальные края на шве не видны).
  const ctx = 8, tail = Hc - (yb - ctx);
  const blurred = await sharp(u8.subarray((yb - ctx) * Wc * 3), { raw: { width: Wc, height: tail, channels: 3 } }).blur(2.5 * K).raw().toBuffer();
  u8.set(blurred.subarray(ctx * Wc * 3), yb * Wc * 3);
  const base = sharp(u8, { raw: { width: Wc, height: Hc, channels: 3 } });
  return {
    bg: await base.clone().webp({ quality: 78, effort: 6 }).toBuffer(),
    bg640: await base.clone().resize(640, Math.round((640 * H) / W), { kernel: 'lanczos3' }).webp({ quality: 80, effort: 6 }).toBuffer(),
    size: [Wc, Hc],
    sky: yo, ground: yb,
  };
}

// ── Бобек и логотип ──────────────────────────────────────────────────────────────────────────────────────────────

/** Бобек: чистка, обрезка по содержимому, масштаб по видимой высоте, ноги на линии BOBEK_FEET. Возвращает файл и рамку слоя в кадре (дробные px). */
async function buildBobek() {
  const img = await readRGBA(new URL('royal_bobek.webp', CLEAN));
  const stats = cleanSprite(img, { minArea: 400, defringe: true });
  const vis = bounds(img, 128), all = bounds(img, 0);
  const sc = BOBEK_VISIBLE_H / (vis[3] - vis[1] + 1);
  const cropped = crop(img, all);
  const w = cropped.w * sc, h = cropped.h * sc;
  const left = BOBEK_CENTER_X - ((vis[0] + vis[2] + 1) / 2 - all[0]) * sc;
  const top = BOBEK_FEET - (vis[3] + 1 - all[1]) * sc;
  const buf = await webp(cropped, Math.round(w * KSP), Math.round(h * KSP), { quality: 86 });
  const feet = ((vis[3] + 1 - all[1]) * sc) / h; // линия ног в долях высоты слоя: точка вращения покачивания
  return { buf, box: [left, top, w, h], feet, stats, visible: [vis[2] - vis[0] + 1, vis[3] - vis[1] + 1] };
}

async function buildLogo() {
  const img = await readRGBA(new URL('royal_logo.webp', CLEAN));
  const stats = cleanSprite(img, { minArea: 400, defringe: false });
  const vis = bounds(img, 128), all = bounds(img, 0);
  const sc = LOGO_VISIBLE_W / (vis[2] - vis[0] + 1);
  const cropped = crop(img, all);
  const w = cropped.w * sc, h = cropped.h * sc;
  const left = LOGO_CENTER_X - ((vis[0] + vis[2] + 1) / 2 - all[0]) * sc;
  const top = LOGO_LETTERS_TOP - (vis[1] - all[1]) * sc;
  const buf = await webp(cropped, Math.round(w * KSP), Math.round(h * KSP), { quality: 88 });
  return { buf, box: [left, top, w, h], stats };
}

// ── Украшение над логотипом ──────────────────────────────────────────────────────────────────────────────────────

/** Область поиска украшения (кадр 941×1672) и порог белизны: небо у́же 90 по min(R,G,B), белое украшение — выше 230. */
const ORN = { x0: 262, y0: 20, x1: 850, y1: 215, lo: 90, hi: 230 };
/** Логотип концепта (старый мастер архива): его пиксели из украшения исключаются. */
const OLD_LOGO_BOX = [133, 151, 696, 179];

async function readFrameRGB(file) {
  const { data, info } = await sharp(readFileSync(file)).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  if (info.width !== W || info.height !== H) throw new Error(`${file}: ожидаю ${W}×${H}, получил ${info.width}×${info.height}`);
  return data;
}

async function buildOrnament() {
  const orig = await readFrameRGB(new URL('originals/04_royal_original.webp', SRC));
  const oldLogo = await readRGBA(new URL('royal_logo.webp', SRC));
  const [lx, ly, lw, lh] = OLD_LOGO_BOX;
  if (oldLogo.w !== lw || oldLogo.h !== lh) throw new Error('мастер логотипа архива не 696×179');
  const logoMask = new Uint8Array(W * H);
  for (let j = 0; j < lh; j++) for (let i = 0; i < lw; i++) if (oldLogo.data[(j * lw + i) * 4 + 3] > 8) logoMask[(ly + j) * W + lx + i] = 1;
  const logoDil = dilate(logoMask, W, H, 2);
  const alpha = new Float32Array(W * H);
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = ORN.y0; y < ORN.y1; y++) {
    for (let x = ORN.x0; x < ORN.x1; x++) {
      const i = y * W + x;
      if (logoDil[i]) continue;
      if (x < 330 && y < 110) continue; // блики листвы левой ветки: украшения там нет
      const white = Math.min(orig[i * 3], orig[i * 3 + 1], orig[i * 3 + 2]);
      let a = Math.max(0, Math.min(1, (white - ORN.lo) / (ORN.hi - ORN.lo)));
      if (a < 0.06) a = 0;
      alpha[i] = a;
      if (a > 0) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    }
  }
  const bw = x1 - x0 + 1, bh = y1 - y0 + 1, rgba = new Uint8Array(bw * bh * 4);
  for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
    const p = (y * bw + x) * 4;
    rgba[p] = rgba[p + 1] = rgba[p + 2] = 255;
    rgba[p + 3] = Math.round(alpha[(y0 + y) * W + x0 + x] * 255);
  }
  const buf = await sharp(Buffer.from(rgba), { raw: { width: bw, height: bh, channels: 4 } }).webp({ quality: 95, alphaQuality: 100, effort: 6 }).toBuffer();
  return { buf, box: [x0, y0, bw, bh] };
}

// ── Сборка ───────────────────────────────────────────────────────────────────────────────────────────────────────

mkdirSync(OUT, { recursive: true });
const bg = await buildBackground();
const bobek = await buildBobek();
const logo = await buildLogo();
const orn = await buildOrnament();

const files = { 'bg.webp': bg.bg, 'bg@640.webp': bg.bg640, 'bobek.webp': bobek.buf, 'logo.webp': logo.buf, 'orn.webp': orn.buf };
const sizes = [];
for (const [file, buf] of Object.entries(files)) {
  await sharp(buf).toFile(new URL(file, OUT).pathname);
  sizes.push(`${file} ${Math.round(buf.length / 1024)} КБ`);
}
const r1 = (v) => Math.round(v * 10) / 10;
const box = (b) => `[${b.map(r1).join(', ')}]`;
console.log(`фон ${bg.size.join('×')}: небо достроено на ${Math.round(bg.sky / KBG)} px кадра, брусчатка с y ${Math.round(bg.ground / KBG)} · ${sizes.join(' · ')}`);
console.log(`Бобек: плотных ${bobek.stats.solid} px, крошек убрано ${bobek.stats.removed}, цвет кромки заменён у ${bobek.stats.fringe} px, дырочек внутри закрыто ${bobek.stats.holes}; видимый размер в мастере ${bobek.visible.join('×')}`);
console.log(`логотип: плотных ${logo.stats.solid} px, крошек убрано ${logo.stats.removed}`);

// Группа «логотип + украшение»: объединение рамок; числа для apps/web/index.html (мгновенная заставка) считаются здесь же.
const L = logo.box, O = orn.box;
const bx = Math.min(L[0], O[0]), by = Math.min(L[1], O[1]);
const brand = { x: bx, y: by, w: Math.max(L[0] + L[2], O[0] + O[2]) - bx, h: Math.max(L[1] + L[3], O[1] + O[3]) - by };
const p = (v, total) => `${((v / total) * 100).toFixed(3)}%`;
console.log('\n── apps/web/src/lib/splashArt.ts ──');
console.log(`const BOBEK: Box = ${box(bobek.box)};   // слой в кадре; ноги на y=${BOBEK_FEET}, точка вращения ${(bobek.feet * 100).toFixed(1)} % высоты слоя`);
console.log(`const LOGO: Box = ${box(logo.box)};`);
console.log(`const ORN: Box = ${box(O)};`);
console.log('\n── apps/web/index.html (.pre-lockup / .pre-orn / .pre-logo) и Splash.tsx (width/height слоёв) ──');
console.log(`.pre-lockup: width calc(var(--ug) * ${Math.round(brand.w)}); height calc(var(--ug) * ${Math.round(brand.h)})   (группа ${box([brand.x, brand.y, brand.w, brand.h])})`);
console.log(`.pre-orn:  left ${p(O[0] - brand.x, brand.w)}; top ${p(O[1] - brand.y, brand.h)}; width ${p(O[2], brand.w)}; height ${p(O[3], brand.h)}`);
console.log(`.pre-logo: left ${p(L[0] - brand.x, brand.w)}; top ${p(L[1] - brand.y, brand.h)}; width ${p(L[2], brand.w)}; height ${p(L[3], brand.h)}`);
console.log(`<img width/height>: logo ${Math.round(L[2] * KSP)}×${Math.round(L[3] * KSP)}, bobek ${Math.round(bobek.box[2] * KSP)}×${Math.round(bobek.box[3] * KSP)}, orn ${O[2]}×${O[3]}`);

if (sheetPath) {
  // Контрольный лист: сцена в сборе (фон, украшение, логотип, Бобек в покое), кадр 470 px шириной.
  const cell = 470, ch = Math.round((cell * H) / W), scale = cell / W;
  const layer = async (input, b) => ({ input: await sharp(input).resize(Math.round(b[2] * scale), Math.round(b[3] * scale)).png().toBuffer(), left: Math.round(b[0] * scale), top: Math.round(b[1] * scale) });
  const base = await sharp(bg.bg).resize(cell, ch).png().toBuffer();
  const img = await sharp(base).composite([await layer(orn.buf, O), await layer(logo.buf, L), await layer(bobek.buf, bobek.box)]).png().toBuffer();
  await sharp(img).toFile(sheetPath);
  console.log(`Лист: ${sheetPath}`);
}
