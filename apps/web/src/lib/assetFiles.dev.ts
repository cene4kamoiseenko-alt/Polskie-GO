/**
 * Dev-замена assetFiles.ts: ленивый glob модулей не грузит, берём только список путей и строим адрес файла сами —
 * Vite отдаёт /src/assets/... как обычный статический файл. Подключается плагином pg-dev-asset-urls (vite.config.ts).
 */
export const files: Record<string, string> = Object.fromEntries(
  Object.keys(import.meta.glob('../assets/**/*.{webp,png}')).map((k) => [k, new URL(k, import.meta.url).href]),
);
