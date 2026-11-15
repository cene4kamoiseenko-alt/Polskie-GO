/**
 * «Тишина» после отказа Telegram (403). Telegram отвечает 403 в двух случаях: игрок заблокировал бота и бот ещё не может начать
 * разговор (человек открыл Mini App по ссылке и не нажимал Start). Раньше после отказа молчание держалось ровно 30 дней при любых
 * обстоятельствах: игрок мог сразу нажать Start или заново выбрать время напоминания — и всё равно ничего не получал целый месяц.
 *
 * Теперь игроку не пишем, пока у него нет повода ждать сообщения:
 *  • с отказа (запись BLOCKED в notification_log — и у напоминаний, и у приглашений к быстрым вопросам) прошло меньше 30 дней,
 *  • и после отказа игрок не писал боту (bot_contacts.last_seen_at),
 *  • и не давал боту разрешение писать (bot_write_access: Telegram сообщает allows_write_to_pm при каждом входе — окно из приложения),
 *  • и не сохранял настройки (user_settings.updated_at: тот же жест, что выбор времени напоминания, а при выборе времени приложение
 *    заново просит у Telegram разрешение писать — `requestBotWriteAccess`, apps/web/src/lib/telegram.ts);
 * а также пока бот помечен заблокированным (bot_contacts.blocked_at: событие my_chat_member; снимается, когда игрок пишет снова).
 * Новый отказ — новая тишина: лишняя попытка стоит один вызов Bot API, а не месяц без напоминаний.
 */
import { and, gt, isNotNull, not, notExists, eq, sql } from 'drizzle-orm';
import { db } from '../db';
import { botContacts, botWriteAccess, notificationLog, userSettings, users } from '../db/schema';

export const MUTE_MS = 30 * 86_400_000;

/** Момент отказа: BLOCKED пишется с updated_at; у старых строк его может не быть. */
const failedAt = sql<number>`coalesce(${notificationLog.updatedAt}, ${notificationLog.createdAt})`;

/**
 * Условие для запроса, где есть `users` и `user_settings`: «этому игроку сейчас можно писать».
 * Подзапросы коррелированы с внешними users / user_settings; параметров столько же, сколько было у прежней проверки (статус и граница дат).
 */
export function notMuted(now: Date) {
  const since = now.getTime() - MUTE_MS;
  return and(
    notExists(
      db
        .select({ x: sql`1` })
        .from(notificationLog)
        .where(
          and(
            eq(notificationLog.userId, users.id),
            eq(notificationLog.status, 'BLOCKED'),
            sql`${failedAt} > ${since}`,
            // не снята: настройки не сохранялись после отказа …
            not(gt(userSettings.updatedAt, failedAt)),
            // … и Telegram не сообщал при входе, что бот может писать (игрок согласился в окне разрешения) …
            sql`coalesce((SELECT ${botWriteAccess.allowedAt} FROM ${botWriteAccess} WHERE ${botWriteAccess.telegramId} = ${users.telegramId}), 0) <= ${failedAt}`,
            // … и игрок не писал боту после отказа
            notExists(db.select({ x: sql`1` }).from(botContacts).where(and(eq(botContacts.telegramId, users.telegramId), gt(botContacts.lastSeenAt, failedAt)))),
          ),
        ),
    ),
    // Бот помечен заблокированным (my_chat_member): пробовать нечего.
    notExists(db.select({ x: sql`1` }).from(botContacts).where(and(eq(botContacts.telegramId, users.telegramId), isNotNull(botContacts.blockedAt)))),
  );
}
