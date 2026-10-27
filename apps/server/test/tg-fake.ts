/** Підміна Telegram Bot API для тестів (окремий файл: helpers.ts підключає й браузерна перевірка поза vitest). */
import { vi } from 'vitest';

export type TgCall = { method: string; params: Record<string, any> };

/**
 * Підміна fetch для Telegram Bot API: записує виклики, за замовчуванням відповідає ok.
 * script повертає Response (наприклад tgError(...)), Error (обрив мережі) або undefined (ok).
 */
export function fakeTelegram(script?: (call: TgCall, n: number) => Response | Error | undefined) {
  const calls: TgCall[] = [];
  vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
    const call = { method: String(url).split('/').pop()!, params: JSON.parse(String(init.body)) };
    calls.push(call);
    const scripted = script?.(call, calls.length - 1);
    if (scripted instanceof Error) throw scripted;
    return scripted ?? new Response(JSON.stringify({ ok: true, result: { message_id: 1000 + calls.length } }), { headers: { 'content-type': 'application/json' } });
  });
  return calls;
}

/** Відмова Bot API з кодом (400 / 403 / 429 / 502). */
export function tgError(code: number, description: string, retryAfter?: number) {
  return new Response(JSON.stringify({ ok: false, error_code: code, description, ...(retryAfter ? { parameters: { retry_after: retryAfter } } : {}) }), {
    status: code,
    headers: { 'content-type': 'application/json' },
  });
}
