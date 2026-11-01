/**
 * Слои экрана загрузки (мастера владельца 2026-11-01, docs/design/v19/loading; сборка — scripts/build-splash-art.mjs).
 * Сцена 941×1672: фон и Бобек лежат в ней по процентам кадра (сцена накрывает экран как `cover`), а логотип с украшением над ним — отдельная группа,
 * которая масштабируется по ширине экрана и стоит под шапкой Telegram (на высоких телефонах сцена шире экрана, и логотип в ней был крупнее экрана).
 *
 * Тема одна — royal (синее небо, Варшава). sunset, adventure и soft не берутся: soft — Бобек размыт (по решению владельца), остальные — вне задания;
 * их мастера лежат в docs/design/v19/loading.
 */
import royalBg640 from '../assets/splash/royal/bg@640.webp';
import royalBg from '../assets/splash/royal/bg.webp';
import royalBobek from '../assets/splash/royal/bobek.webp';
import royalLogo from '../assets/splash/royal/logo.webp';
import royalOrn from '../assets/splash/royal/orn.webp';
import type { CSSProperties } from 'react';

/** Размер кадра мастера, px. */
export const SPLASH_W = 941;
export const SPLASH_H = 1672;

type Box = readonly [x: number, y: number, w: number, h: number];
/** Положение слоёв в кадре (loading.js архива; украшение — рамка, найденная конвейером: `scripts/build-splash-art.mjs` печатает её при сборке). */
const BOBEK: Box = [168, 640, 528, 560];
const LOGO: Box = [133, 151, 696, 179];
const ORN: Box = [268, 20, 424, 134];

/**
 * Слой Бобека выше мастера на 46 px вниз: вырезка архива обрезала лапы, и конвейер (scripts/build-splash-art.mjs, PAD_BOTTOM) достраивает их из оригинала.
 * Верх и бока слоя прежние, поэтому положение остальных слоёв не меняется.
 */
const SPRITE_PAD_BOTTOM = 46;

/** Группа «логотип + украшение»: объединение их рамок в пикселях кадра. */
const BRAND = (() => {
  const x = Math.min(LOGO[0], ORN[0]), y = Math.min(LOGO[1], ORN[1]);
  const r = Math.max(LOGO[0] + LOGO[2], ORN[0] + ORN[2]), b = Math.max(LOGO[1] + LOGO[3], ORN[1] + ORN[3]);
  return { x, y, w: r - x, h: b - y };
})();

export type SplashArt = { bg: string; bg640: string; bobek: string; logo: string; orn: string };
export const SPLASH_ART: SplashArt = { bg: royalBg, bg640: royalBg640, bobek: royalBobek, logo: royalLogo, orn: royalOrn };

const pct = (v: number, total: number) => `${((v / total) * 100).toFixed(3)}%`;

/**
 * CSS-переменные: Бобек — проценты кадра (сцена того же размера); логотип и украшение — проценты группы, размер группы в пикселях кадра
 * (`--brand-w`, `--brand-h`: CSS умножает их на масштаб по ширине экрана).
 */
export function splashGeometry(): CSSProperties {
  return {
    '--bob-l': pct(BOBEK[0], SPLASH_W),
    '--bob-t': pct(BOBEK[1], SPLASH_H),
    '--bob-w': pct(BOBEK[2], SPLASH_W),
    '--bob-h': pct(BOBEK[3] + SPRITE_PAD_BOTTOM, SPLASH_H),
    '--brand-w': BRAND.w,
    '--brand-h': BRAND.h,
    '--orn-l': pct(ORN[0] - BRAND.x, BRAND.w),
    '--orn-t': pct(ORN[1] - BRAND.y, BRAND.h),
    '--orn-w': pct(ORN[2], BRAND.w),
    '--orn-h': pct(ORN[3], BRAND.h),
    '--logo-l': pct(LOGO[0] - BRAND.x, BRAND.w),
    '--logo-t': pct(LOGO[1] - BRAND.y, BRAND.h),
    '--logo-w': pct(LOGO[2], BRAND.w),
    '--logo-h': pct(LOGO[3], BRAND.h),
  } as CSSProperties;
}
