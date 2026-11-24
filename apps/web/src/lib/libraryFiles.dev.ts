/** Dev-замена libraryFiles.ts (как assetFiles.dev.ts): только список путей, адрес файла строим сами — без модуля на каждую картинку. */
export const libraryFiles: Record<string, string> = Object.fromEntries(
  Object.keys(import.meta.glob('../assets/library/*.webp')).map((k) => [k, new URL(k, import.meta.url).href]),
);
