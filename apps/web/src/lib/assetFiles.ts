/**
 * Адреса всех картинок src/assets (ключ — путь от src/lib, значение — URL файла).
 * В сборке — eager-glob: адреса вшиты в бандл, запросов при старте нет.
 * В dev этот файл подменяется на assetFiles.dev.ts (плагин pg-dev-asset-urls в vite.config.ts): в dev eager-glob делает каждую
 * картинку отдельным модулем (~500 запросов на загрузку), и после пары перезагрузок вкладки Chromium отвечает
 * ERR_INSUFFICIENT_RESOURCES — часть модулей не грузится, экран не появляется (browser-check, 2026-11-15).
 */
// Библиотека Бобека (assets/library) — отдельно, в lib/libraryFiles.ts: её адреса нужны только экранам миссии и урока.
export const files = import.meta.glob(['../assets/**/*.{webp,png}', '!../assets/library/**'], { eager: true, import: 'default' }) as Record<string, string>;
