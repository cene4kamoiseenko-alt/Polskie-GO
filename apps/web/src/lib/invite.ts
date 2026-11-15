/**
 * «Пригласить друга» картинкой (2026-11-15). Сервер сохраняет у бота готовое сообщение — картинка владельца на языке игрока,
 * подпись и кнопка «Играть вместе» с реферальной ссылкой (apps/server/src/services/invite.ts) — а Telegram (Bot API 8.0+,
 * WebApp.shareMessage) показывает выбор чата и отправляет его от имени игрока. Отдельный модуль: api.ts импортирует telegram.ts.
 *
 * Запасной путь — прежняя ссылка t.me/share/url (текст без картинки): старый клиент Telegram, вход вне Telegram, ошибка сервера
 * или Telegram отказал. Если человек сам закрыл окно выбора чата (USER_DECLINED) — ничего не делаем.
 */
import { api } from './api';
import { share, tg } from './telegram';

type ShareCapable = { shareMessage?: (id: string, cb?: (sent: boolean) => void) => void };

export async function shareInvite(link: string, text: string): Promise<void> {
  const app = tg as (typeof tg & ShareCapable) | null;
  if (!app?.shareMessage || !app.isVersionAtLeast('8.0')) return share(link, text);
  let id: string;
  try {
    id = (await api<{ id: string }>('/friends/invite/prepare', { body: {} })).id;
  } catch {
    return share(link, text);
  }
  let failure: string | null = null;
  const onFailed = (...a: unknown[]) => {
    failure = (a[0] as { error?: string } | undefined)?.error ?? 'UNKNOWN_ERROR';
  };
  app.onEvent('shareMessageFailed', onFailed);
  app.shareMessage(id, (sent) => {
    // Событие shareMessageFailed приходит вместе с callback; даём ему долю секунды, чтобы узнать причину.
    setTimeout(() => {
      app.offEvent('shareMessageFailed', onFailed);
      if (!sent && failure !== 'USER_DECLINED') share(link, text);
    }, 50);
  });
}
