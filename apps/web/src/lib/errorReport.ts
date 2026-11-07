/**
 * Ошибки Mini App у игроков → сервер (POST /api/client-errors → журнал ошибок, админка «Ошибки за 24 часа»). 2026-11-04, эксплуатация.
 * Без персональных данных: только сообщение, место в коде и путь экрана. Не больше 10 отчётов за сеанс и без повторов;
 * сбой отправки молча игнорируется — отчёт не должен мешать игроку.
 */
import { API_BASE } from './api';

const sent = new Set<string>();
let left = 10;

/** Шум WebView и расширений, который не говорит об ошибке приложения. */
const NOISE = [/ResizeObserver loop/i, /^Script error\.?$/i, /Non-Error promise rejection captured/i];

export function reportError(message: string, detail?: string) {
  const msg = (message || 'error').slice(0, 1000);
  if (left <= 0 || NOISE.some((r) => r.test(msg))) return;
  const key = `${msg}|${(detail ?? '').slice(0, 120)}`;
  if (sent.has(key)) return;
  sent.add(key);
  left--;
  const payload = JSON.stringify({ message: msg, detail: detail?.slice(0, 4000), path: location.pathname.slice(0, 300) });
  try {
    const url = `${API_BASE}/api/client-errors`;
    const queued = typeof navigator.sendBeacon === 'function' && navigator.sendBeacon(url, new Blob([payload], { type: 'application/json' }));
    if (!queued) void fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: payload, keepalive: true }).catch(() => undefined);
  } catch {
    /* отчёт не обязателен */
  }
}

export function installErrorReporting() {
  window.addEventListener('error', (e) => {
    const where = e.filename ? `${e.filename}:${e.lineno}:${e.colno}` : '';
    reportError(e.message, [where, (e.error as Error | undefined)?.stack ?? ''].filter(Boolean).join('\n'));
  });
  window.addEventListener('unhandledrejection', (e) => {
    const r = e.reason as { message?: string; stack?: string } | string | undefined;
    reportError(typeof r === 'string' ? r : (r?.message ?? String(r)), typeof r === 'object' ? r?.stack : undefined);
  });
}
