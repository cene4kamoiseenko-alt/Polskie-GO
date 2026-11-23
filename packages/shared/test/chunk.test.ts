/**
 * Файл экрана не загрузился после выкладки (2026-11-23, журнал ошибок владельца: «'text/html' is not a valid JavaScript MIME type
 * for module script …/assets/Lesson-CVbNNzwW.js» на /lesson/:id). У игрока был открыт старый index.html, а старых файлов после
 * выкладки уже нет — Cloudflare отдаёт вместо них страницу (text/html). Это не ошибка кода: приложение один раз перезагружается само.
 */
import { describe, expect, it } from 'vitest';
import { CHUNK_RELOAD_WINDOW_MS, isChunkLoadError, shouldAutoReload } from '../src/chunk';

describe('ошибка загрузки файла экрана после выкладки', () => {
  it('узнаёт сообщения всех браузеров: Safari (MIME text/html), Chrome, Firefox, Vite', () => {
    for (const m of [
      "TypeError: 'text/html' is not a valid JavaScript MIME type for module script 'https://x.dev/assets/Lesson-CVbNNzwW.js'.",
      "'text/html' is not a valid JavaScript MIME type.",
      'TypeError: Failed to fetch dynamically imported module: https://x.dev/assets/Map-1.js',
      'TypeError: Importing a module script failed.',
      'TypeError: error loading dynamically imported module: https://x.dev/assets/A.js',
      'ChunkLoadError: Loading chunk 12 failed.',
      'Unable to preload CSS for /assets/Lesson-1.css',
      "Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of \"text/html\".",
    ]) expect(isChunkLoadError(new Error(m)), m).toBe(true);
    expect(isChunkLoadError("'text/html' is not a valid JavaScript MIME type")).toBe(true);
  });

  it('обычные ошибки кода — не «файл не загрузился»', () => {
    for (const m of ["TypeError: Cannot read properties of undefined (reading 'find')", 'ReferenceError: x is not defined', 'network_timeout']) expect(isChunkLoadError(new Error(m)), m).toBe(false);
    expect(isChunkLoadError(null)).toBe(false);
  });

  it('сама перезагружается не чаще раза в минуту — без бесконечного цикла', () => {
    const now = 1_000_000;
    expect(shouldAutoReload(null, now)).toBe(true);
    expect(shouldAutoReload(now - 5_000, now)).toBe(false);
    expect(shouldAutoReload(now - CHUNK_RELOAD_WINDOW_MS - 1, now)).toBe(true);
  });
});
