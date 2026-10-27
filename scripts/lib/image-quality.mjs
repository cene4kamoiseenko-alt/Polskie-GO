/**
 * Проверка качества растровых кадров по самому файлу (а не по коду, который их отправляет).
 *
 * 1. «Мыльные» боковые полосы. Старые `bot/ru/*.jpg` (production до 2026-10-27) — маленький кадр, растянутый на 1280×720,
 *    а по бокам размытая растянутая копия: в файле слева и справа по 86–94 px почти без деталей. Ищем их по профилю
 *    резкости столбцов: средний |лапласиан| каждого столбца (сглажен окном w/160) сравнивается с медианой середины кадра
 *    (30–70 % ширины). Полоса — подряд идущие от края столбцы, где резкость ниже 25 % медианы.
 *    Измерено: старые ru/* — 86–94 px с каждой стороны, «широкие» кадры пакета V4 — 78 px слева; полнокадровые доски
 *    владельца и нейтральные commands/* — 0 px.
 * 2. Увеличение маленькой картинки. В середине кадра (30–70 % ширины) сравниваем мелкие детали в полном разрешении
 *    и в половинном (усреднение 2×2): detail = средний |лапласиан| полного / средний |лапласиан| половинного.
 *    У настоящего 1280×720, уменьшенного из большего мастера, пиксельных деталей много: 0,47–0,58.
 *    У увеличенного из маленького их нет: старые ru/* — 0,34–0,35, «широкие» V4 — 0,37–0,39, вырезка Biedronka ×2,3 — 0,36,
 *    мягкий commands/help.jpg — 0,40. Порог 0,44.
 */
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

/** Ширина полосы (px), начиная с которой это не случайный гладкий край, а заливка. Реальные полосы — от 78 px. */
export const BAND_MAX_PX = 16;
/** Доля мелких деталей, ниже которой кадр считается увеличенным из маленького. */
export const DETAIL_MIN = 0.44;

/** Резкость столбцов: средний |лапласиан| по высоте для каждого x. */
function columnSharpness(data, w, h) {
  const col = new Float64Array(w);
  for (let y = 1; y < h - 1; y++) {
    const row = y * w;
    for (let x = 1; x < w - 1; x++) {
      const i = row + x;
      col[x] += Math.abs(4 * data[i] - data[i - 1] - data[i + 1] - data[i - w] - data[i + w]);
    }
  }
  for (let x = 0; x < w; x++) col[x] /= h - 2;
  col[0] = col[1];
  col[w - 1] = col[w - 2];
  return col;
}

function smooth(values, k) {
  const out = new Float64Array(values.length);
  const half = Math.floor(k / 2);
  for (let x = 0; x < values.length; x++) {
    let sum = 0;
    let n = 0;
    for (let j = Math.max(0, x - half); j <= Math.min(values.length - 1, x + half); j++) {
      sum += values[j];
      n++;
    }
    out[x] = sum / n;
  }
  return out;
}

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
};

/** Средний |лапласиан| середины кадра в полном разрешении / в половинном (усреднение 2×2). */
function detailRatio(data, w, h) {
  const x0 = Math.floor(w * 0.3);
  const cw = Math.floor((Math.floor(w * 0.7) - x0) / 2) * 2;
  const ch = Math.floor(h / 2) * 2;
  const full = new Float64Array(cw * ch);
  for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) full[y * cw + x] = data[y * w + x0 + x];
  const hw = cw / 2;
  const hh = ch / 2;
  const half = new Float64Array(hw * hh);
  for (let y = 0; y < hh; y++) {
    for (let x = 0; x < hw; x++) {
      const i = 2 * y * cw + 2 * x;
      half[y * hw + x] = (full[i] + full[i + 1] + full[i + cw] + full[i + cw + 1]) / 4;
    }
  }
  const meanLap = (a, aw, ah) => {
    let sum = 0;
    for (let y = 1; y < ah - 1; y++) {
      for (let x = 1; x < aw - 1; x++) {
        const i = y * aw + x;
        sum += Math.abs(4 * a[i] - a[i - 1] - a[i + 1] - a[i - aw] - a[i + aw]);
      }
    }
    return sum / ((aw - 2) * (ah - 2));
  };
  return meanLap(full, cw, ch) / meanLap(half, hw, hh);
}

/** Ширина полосы низкой резкости от края (последовательность столбцов от края внутрь). */
function bandWidth(seq, threshold, skip) {
  if (seq[skip] >= threshold) return 0;
  let n = skip;
  while (n < seq.length && seq[n] < threshold) n++;
  return n;
}

/**
 * @param {Buffer} bytes JPEG / PNG / WebP
 * @returns {Promise<{ width: number, height: number, bandLeft: number, bandRight: number, edgeLeft: number, edgeRight: number, detail: number }>}
 *   bandLeft/bandRight — ширина мыльной полосы, px; edgeLeft/edgeRight — резкость крайних 6 % ширины в процентах от середины;
 *   detail — доля мелких деталей (см. п. 2 вверху), меньше DETAIL_MIN — увеличенный кадр.
 */
export async function analyseImage(bytes) {
  const { data, info } = await sharp(bytes).removeAlpha().greyscale().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const col = columnSharpness(data, w, h);
  const k = Math.max(3, Math.floor(w / 160));
  const s = smooth(col, k);
  const mid = median(Array.from(s.subarray(Math.floor(w * 0.3), Math.floor(w * 0.7))));
  const threshold = 0.25 * mid;
  const bandLeft = bandWidth(s, threshold, k);
  const bandRight = bandWidth(Array.from(s).reverse(), threshold, k);

  const strip = Math.round(w * 0.06);
  const mean = (from, to) => {
    let sum = 0;
    for (let x = from; x < to; x++) sum += col[x];
    return sum / (to - from);
  };
  const centre = mean(Math.floor(w * 0.3), Math.floor(w * 0.7));
  const edgeLeft = Math.round((mean(0, strip) / centre) * 100);
  const edgeRight = Math.round((mean(w - strip, w) / centre) * 100);

  const detail = Math.round(detailRatio(data, w, h) * 1000) / 1000;

  return { width: w, height: h, bandLeft, bandRight, edgeLeft, edgeRight, detail };
}

/** Проблемы кадра по результатам analyseImage. `softAllowed` — кадр явно записан в манифест как мягкий запасной. */
export function qualityProblems(q, { softAllowed = false } = {}) {
  const problems = [];
  if (q.bandLeft >= BAND_MAX_PX) problems.push(`слева мыльная полоса ${q.bandLeft} px`);
  if (q.bandRight >= BAND_MAX_PX) problems.push(`справа мыльная полоса ${q.bandRight} px`);
  if (q.detail < DETAIL_MIN && !softAllowed) problems.push(`увеличен из маленького кадра (детали ${q.detail} < ${DETAIL_MIN})`);
  return problems;
}
