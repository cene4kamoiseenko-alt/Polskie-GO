/**
 * Приглашения к быстрому вопросу от бота (cron). Бережно, чтобы не превратиться в спам:
 *  • только тем, кто сам уже отвечал на вопрос (`bot_quiz_players.answered > 0`), не выключил вопросы кнопкой
 *    и не выключил уведомления в настройках, не заблокировал бота;
 *  • не больше одного в местный день (ключ (user, 'quiz_invite', day) в `notification_log`), в 13:00 местного времени
 *    (или в 17:00, если ежедневное напоминание стоит рядом с полуднем);
 *  • не раньше чем через 3 часа после последнего вопроса и только пока сегодня ещё есть XP за ответы;
 *  • после двух приглашений подряд без ответа — пауза, пока ученик не ответит сам (`ignored_pushes`).
 * Само приглашение — текст и кнопка «Начать», вопрос приходит по нажатию (`qz:go`), без картинки.
 */
import { and, eq, gt, inArray, lt, notExists, sql } from 'drizzle-orm';
import { dayKey, type UiLang } from '@polski-go/shared';
import { db } from '../../db';
import { botQuizPlayers, notificationLog, userSettings, users } from '../../db/schema';
import { botApi, TelegramError } from '../../lib/telegram';
import { pickLang } from '../data';
import { QUIZ_COPY } from './copy';
import { inviteAllowed } from './engine';

export const INVITE_HOURS = { main: 13, alt: 17 } as const;
const IGNORED_MAX = 2;
const BLOCKED_QUIET_MS = 30 * 86_400_000;

/** Час приглашения: 13:00, а если ежедневное напоминание стоит на 12–14 часов — 17:00. */
export function inviteHour(reminderHour: number | null): number {
  return reminderHour !== null && reminderHour >= 12 && reminderHour <= 14 ? INVITE_HOURS.alt : INVITE_HOURS.main;
}

function localHour(now: Date, timeZone: string): number | null {
  try {
    return Number(new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', hourCycle: 'h23' }).format(now));
  } catch {
    return null;
  }
}

export function inviteView(lang: UiLang) {
  const copy = QUIZ_COPY[lang];
  return {
    text: `${copy.intro}\n\n${copy.stopHint}`,
    reply_markup: { inline_keyboard: [[{ text: copy.start, callback_data: 'qz:go' }], [{ text: copy.pushOff, callback_data: 'qz:push:0' }]] },
  };
}

/** Разослать приглашения тем, у кого сейчас час приглашения. Возвращает число вызовов Bot API. */
export async function sendQuizInvites(now: Date, budget: number): Promise<number> {
  if (budget <= 0) return 0;
  const zones = await db
    .selectDistinct({ tz: userSettings.timezone })
    .from(userSettings)
    .innerJoin(users, eq(users.id, userSettings.userId))
    .innerJoin(botQuizPlayers, eq(botQuizPlayers.telegramId, users.telegramId))
    .where(and(eq(userSettings.notificationsEnabled, true), eq(botQuizPlayers.pushEnabled, true)));
  const due = zones.map((z) => z.tz).filter((tz) => {
    const h = localHour(now, tz);
    return h === INVITE_HOURS.main || h === INVITE_HOURS.alt;
  });
  if (!due.length) return 0;

  const blockedSince = new Date(now.getTime() - BLOCKED_QUIET_MS);
  const rows = await db
    .select({ id: users.id, telegramId: users.telegramId, tz: userSettings.timezone, lang: userSettings.uiLanguage, reminderHour: userSettings.reminderHour, player: botQuizPlayers })
    .from(users)
    .innerJoin(userSettings, eq(userSettings.userId, users.id))
    .innerJoin(botQuizPlayers, eq(botQuizPlayers.telegramId, users.telegramId))
    .where(
      and(
        eq(users.isBanned, false),
        eq(userSettings.notificationsEnabled, true),
        inArray(userSettings.timezone, due.slice(0, 90)),
        eq(botQuizPlayers.pushEnabled, true),
        gt(botQuizPlayers.answered, 0),
        lt(botQuizPlayers.ignoredPushes, IGNORED_MAX),
        notExists(
          db
            .select({ x: sql`1` })
            .from(notificationLog)
            .where(and(eq(notificationLog.userId, users.id), eq(notificationLog.status, 'BLOCKED'), gt(notificationLog.createdAt, blockedSince))),
        ),
      ),
    )
    .limit(budget * 3);

  let calls = 0;
  for (const r of rows) {
    if (calls >= budget) break;
    if (localHour(now, r.tz) !== inviteHour(r.reminderHour)) continue;
    const day = dayKey(now, r.tz);
    if (!inviteAllowed(r.player, day, now)) continue;
    // Захват дня: из двух параллельных запусков пишет только один.
    const claimed = await db
      .insert(notificationLog)
      .values({ userId: r.id, kind: 'quiz_invite', day, status: 'PENDING', template: 'quiz', lang: r.lang, attempts: 1, createdAt: now, updatedAt: now })
      .onConflictDoNothing()
      .returning({ id: notificationLog.id });
    if (!claimed.length) continue;
    calls++;
    try {
      const view = inviteView(pickLang(r.lang, null));
      const msg = await botApi<{ message_id: number }>('sendMessage', { chat_id: r.telegramId, ...view });
      await db.batch([
        db.update(notificationLog).set({ status: 'SENT', method: 'sendMessage', sentAt: now, telegramMessageId: msg?.message_id ?? null, updatedAt: now }).where(eq(notificationLog.id, claimed[0].id)),
        db.update(botQuizPlayers).set({ ignoredPushes: sql`${botQuizPlayers.ignoredPushes} + 1`, updatedAt: now }).where(eq(botQuizPlayers.telegramId, r.telegramId)),
      ]);
    } catch (e) {
      const status = e instanceof TelegramError && e.code === 403 ? 'BLOCKED' : e instanceof TelegramError && e.ambiguous ? 'UNKNOWN' : 'FAILED';
      console.warn('quiz invite failed', status, (e as Error).message);
      await db
        .update(notificationLog)
        .set({ status, error: String((e as Error).message ?? e).slice(0, 200), updatedAt: now })
        .where(eq(notificationLog.id, claimed[0].id))
        .catch(() => {});
    }
  }
  return calls;
}
