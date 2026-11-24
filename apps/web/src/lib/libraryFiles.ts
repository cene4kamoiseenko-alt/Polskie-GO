/**
 * Адреса картинок библиотеки Бобека (src/assets/library) — отдельно от общей карты картинок (assetFiles.ts): нужны только экранам
 * миссии и урока, поэтому не входят в стартовый код (бюджет JS — scripts/perf.ts). В dev подменяется на libraryFiles.dev.ts (vite.config.ts).
 */
export const libraryFiles = import.meta.glob('../assets/library/*.webp', { eager: true, import: 'default' }) as Record<string, string>;
