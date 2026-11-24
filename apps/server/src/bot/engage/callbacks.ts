/**
 * Нажатие «🔕 Не присылать такие сообщения» / «🔔 Присылать снова» под карточкой бота (`eg:off` / `eg:on`): выключатель карточек
 * по Telegram ID (вопрос дня и напоминания — своими выключателями). Кнопка в сообщении меняется на противоположную.
 */
import type { UiLang } from '@polski-go/shared';
import { db } from '../../db';
import { engagePeople } from '../../db/schema';
import { botApi } from '../../lib/telegram';
import type { CallbackQuery, InlineKeyboard } from '../quiz/engine';
import { ENGAGE_COPY } from './copy';
import { cardToggle } from './views';

/** Обрабатывает `eg:off` / `eg:on`; остальные нажатия — не наши (null). */
export async function handleEngageCallback(cb: CallbackQuery, lang: UiLang, now = new Date()): Promise<'engage_off' | 'engage_on' | null> {
  const m = /^eg:(off|on)$/.exec(cb.data ?? '');
  if (!m) return null;
  const enabled = m[1] === 'on';
  const optedOutAt = enabled ? null : now;
  await db
    .insert(engagePeople)
    .values({ telegramId: cb.from.id, optedOutAt })
    .onConflictDoUpdate({ target: engagePeople.telegramId, set: { optedOutAt, updatedAt: now } });
  await botApi('answerCallbackQuery', { callback_query_id: cb.id, text: enabled ? ENGAGE_COPY[lang].onDone : ENGAGE_COPY[lang].offDone }).catch(() => {});
  const msg = cb.message as { message_id: number; chat: { id: number }; reply_markup?: InlineKeyboard } | undefined;
  const rows = msg?.reply_markup?.inline_keyboard ?? [];
  if (msg && rows.length) {
    const updated = rows.map((r) => r.map((b) => ('callback_data' in b && b.callback_data.startsWith('eg:') ? cardToggle(lang, enabled) : b)));
    await botApi('editMessageReplyMarkup', { chat_id: msg.chat.id, message_id: msg.message_id, reply_markup: { inline_keyboard: updated } }).catch(() => {});
  }
  return enabled ? 'engage_on' : 'engage_off';
}
