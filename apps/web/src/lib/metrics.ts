/**
 * Замеры скорости у игрока (1.0, этап 1.2; сервер — POST /api/metrics → services/perf.ts → админка «Скорость»).
 *  • start — от начала загрузки страницы до первого экрана без заставки (cold — файлы приложения с сети, warm — из кеша);
 *  • lesson — от открытия урока до первого задания на экране.
 * По одному замеру на запуск и на урок; ошибки отправки молча пропускаются — замер не должен мешать игре. Персональных данных нет.
 */
import { api } from './api';

const LIMIT_MS = 120_000;
const clamp = (ms: number) => Math.max(0, Math.min(LIMIT_MS, Math.round(ms)));

/** Основной файл приложения пришёл из кеша браузера (повторный запуск) или с сети (первый, после выкладки). */
function fromCache(): boolean | undefined {
  try {
    const main = performance.getEntriesByType('resource').find((e) => /\/assets\/index-[\w-]+\.js$/.test(e.name)) as PerformanceResourceTiming | undefined;
    return main ? main.transferSize === 0 : undefined;
  } catch {
    return undefined;
  }
}

function send(body: { kind: 'start' | 'lesson'; ms: number; warm?: boolean }) {
  void api('/metrics', { body }).catch(() => undefined);
}

let startSent = false;
/** Первый экран показан (заставка снята). Один раз за загрузку страницы. */
export function reportStart() {
  if (startSent) return;
  startSent = true;
  send({ kind: 'start', ms: clamp(performance.now()), warm: fromCache() });
}

/** Урок открыт: ms — от монтирования экрана урока до первого задания. */
export function reportLessonOpen(ms: number) {
  send({ kind: 'lesson', ms: clamp(ms) });
}
