/**
 * Файл экрана не загрузился после выкладки (2026-11-23): у игрока открыт старый index.html, а старых файлов /assets/*.js после
 * выкладки уже нет — Cloudflare отдаёт вместо них страницу (text/html), и браузер не может её выполнить. Это не ошибка кода:
 * приложение один раз перезагружается само (apps/web/src/lib/chunkReload.ts) и открывает тот же экран уже новой версии.
 * Safari пишет об этом иначе, чем Chrome («'text/html' is not a valid JavaScript MIME type») — раньше такой случай не узнавался.
 */
const CHUNK_ERROR = [
  /Failed to fetch dynamically imported module/i,
  /Importing a module script failed/i,
  /error loading dynamically imported module/i,
  /ChunkLoadError/i,
  /Loading (CSS )?chunk [\w-]+ failed/i,
  /Unable to preload CSS/i,
  /is not a valid JavaScript MIME type/i,
  /Expected a JavaScript module script but the server responded with a MIME type/i,
];

export function isChunkLoadError(e: unknown): boolean {
  if (e == null) return false;
  const msg = e instanceof Error ? `${e.name} ${e.message}` : typeof e === 'object' && 'message' in e ? String((e as { message: unknown }).message) : String(e);
  return CHUNK_ERROR.some((r) => r.test(msg));
}

/** Не чаще одной автоматической перезагрузки в минуту: если и новая версия не грузится, игрок видит кнопку, а не бесконечный цикл. */
export const CHUNK_RELOAD_WINDOW_MS = 60_000;

export function shouldAutoReload(lastReloadAt: number | null, now: number, windowMs = CHUNK_RELOAD_WINDOW_MS): boolean {
  return lastReloadAt == null || now - lastReloadAt > windowMs;
}
