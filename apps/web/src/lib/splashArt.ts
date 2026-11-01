/**
 * Слои экрана загрузки (мастера владельца 2026-11-01, docs/design/v19/loading; сборка — scripts/build-splash-art.mjs).
 * Кадр 941×1672: фон, логотип и Бобек — отдельные картинки, положение — в пикселях кадра (из loading.js архива владельца), прогресс-карточка — живой HTML.
 *
 * Рабочая тема одна — `royal` (синее небо, Варшава). `sunset` и `adventure` лежат вне src/assets (src/dev/splash-themes) и подключаются только
 * в разработке: `?splash=sunset` (в сборку они не попадают). Тема «soft» («Мягкий») не берётся: у неё Бобек заметно размытее остальных.
 */
import type { CSSProperties } from 'react';
import royalBg640 from '../assets/splash/royal/bg@640.webp';
import royalBg from '../assets/splash/royal/bg.webp';
import royalBobek from '../assets/splash/royal/bobek.webp';
import royalLogo from '../assets/splash/royal/logo.webp';

export type SplashTheme = 'royal' | 'sunset' | 'adventure';
export const SPLASH_THEMES: readonly SplashTheme[] = ['royal', 'sunset', 'adventure'];

/** Размер кадра мастера, px. */
export const SPLASH_W = 941;
export const SPLASH_H = 1672;

type Box = readonly [x: number, y: number, w: number, h: number];
const GEOMETRY: Record<SplashTheme, { bobek: Box; logo: Box }> = {
  royal: { bobek: [168, 640, 528, 560], logo: [133, 151, 696, 179] },
  sunset: { bobek: [200, 624, 509, 567], logo: [112, 135, 728, 197] },
  adventure: { bobek: [167, 577, 552, 603], logo: [95, 117, 749, 204] },
};

export type SplashArt = { theme: SplashTheme; bg: string; bg640: string; bobek: string; logo: string };

export const ROYAL_ART: SplashArt = { theme: 'royal', bg: royalBg, bg640: royalBg640, bobek: royalBobek, logo: royalLogo };

/**
 * Слой Бобека выше мастера на 46 px вниз: вырезка архива обрезала лапы, и конвейер (scripts/build-splash-art.mjs, PAD_BOTTOM) достраивает их из оригинала.
 * Верх и бока слоя прежние, поэтому положение остальных слоёв не меняется.
 */
const SPRITE_PAD_BOTTOM = 46;

const pct = (v: number, total: number) => `${((v / total) * 100).toFixed(3)}%`;

/** CSS-переменные положения слоёв: проценты кадра (слои лежат в сцене того же размера), нижний край логотипа — в пикселях кадра. */
export function splashGeometry(theme: SplashTheme): CSSProperties {
  const g = GEOMETRY[theme];
  return {
    '--logo-l': pct(g.logo[0], SPLASH_W),
    '--logo-t': pct(g.logo[1], SPLASH_H),
    '--logo-w': pct(g.logo[2], SPLASH_W),
    '--logo-h': pct(g.logo[3], SPLASH_H),
    '--bob-l': pct(g.bobek[0], SPLASH_W),
    '--bob-t': pct(g.bobek[1], SPLASH_H),
    '--bob-w': pct(g.bobek[2], SPLASH_W),
    '--bob-h': pct(g.bobek[3] + SPRITE_PAD_BOTTOM, SPLASH_H),
    // Низ логотипа: под ним слоган и шаги знакомства (проценты кадра) и верх логотипа в пикселях кадра (лифт знакомства не должен его обрезать).
    '--logo-b': pct(g.logo[1] + g.logo[3], SPLASH_H),
    '--logo-top-art': g.logo[1],
  } as CSSProperties;
}

/** Тема из адресной строки (`?splash=sunset`) — только в разработке; в сборке всегда рабочая. */
export function requestedSplashTheme(): SplashTheme {
  if (!import.meta.env.DEV || typeof location === 'undefined') return 'royal';
  const t = new URLSearchParams(location.search).get('splash');
  return SPLASH_THEMES.includes(t as SplashTheme) ? (t as SplashTheme) : 'royal';
}

/** Картинки темы. Рабочая — сразу; остальные — отдельным чанком, который существует только в разработке (в сборке ветка вырезается). */
export function loadSplashArt(theme: SplashTheme): Promise<SplashArt> {
  if (theme === 'royal' || !import.meta.env.DEV) return Promise.resolve(ROYAL_ART);
  return import('../dev/splashThemes').then((m) => m.devSplashArt(theme));
}
