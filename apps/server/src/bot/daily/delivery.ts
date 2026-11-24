/**
 * Итог неудачной доставки сообщения рассылки (вопрос дня и карточки бота — одни правила): 429 — повторить в следующую минуту,
 * 403 «blocked» — BLOCKED (и bot_contacts.blocked_at), 403 «can't initiate» / 400 «chat not found» — NO_CHAT
 * (daily_quiz_people.no_chat_at: пока человек не напишет боту, ему не пишем), неизвестный результат сети — UNKNOWN (не повторяем),
 * прочее — FAILED.
 */
import { db } from '../../db';
import { dailyQuizPeople } from '../../db/schema';
import { TelegramError } from '../../lib/telegram';
import { recordBotBlocked } from '../../services/bot-audience';

export type FailStatus = 'NO_CHAT' | 'BLOCKED' | 'UNKNOWN' | 'FAILED';

export function failStatus(e: unknown): FailStatus | 'RATE_LIMITED' {
  const tg = e instanceof TelegramError ? e : null;
  if (tg?.code === 429) return 'RATE_LIMITED';
  const desc = tg?.description ?? '';
  if (tg && tg.code === 403 && /initiate/i.test(desc)) return 'NO_CHAT';
  if (tg && tg.code === 400 && /chat not found/i.test(desc)) return 'NO_CHAT';
  if (tg?.code === 403) return 'BLOCKED';
  return tg?.ambiguous ? 'UNKNOWN' : 'FAILED';
}

/** Запомнить «заблокировал бота» / «нет чата» по человеку (сбой записи ничего не ломает). */
export async function noteDeliveryFailure(p: { telegramId: number; firstName: string }, status: FailStatus, now: Date): Promise<void> {
  if (status === 'BLOCKED') await recordBotBlocked({ id: p.telegramId, first_name: p.firstName }, true, now).catch(() => {});
  if (status === 'NO_CHAT')
    await db
      .insert(dailyQuizPeople)
      .values({ telegramId: p.telegramId, noChatAt: now })
      .onConflictDoUpdate({ target: dailyQuizPeople.telegramId, set: { noChatAt: now, updatedAt: now } })
      .catch(() => {});
}
