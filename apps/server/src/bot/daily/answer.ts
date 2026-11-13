/**
 * Ответ на вопрос дня: XP (+10, только с аккаунтом, вне дневного лимита наград /quiz), запись ответа для отчёта в админке,
 * счётчики человека (пропуски обнуляются, серия дней с ответом растёт) и данные для итога (процент верных по уровню за день).
 */
import { and, count, eq, isNotNull, sql } from 'drizzle-orm';
import { db } from '../../db';
import { botQuizPlayers, dailyQuizPeople, dailyQuizSends, type botQuizRounds } from '../../db/schema';
import type { BotUser } from '../data';
import { awardXp } from '../quiz/engine';
import { addDays, warsawDay } from './state';
import type { DailyResult } from './views';

type Round = typeof botQuizRounds.$inferSelect;

/** Процент верных показываем, когда на уровне за день ответили хотя бы столько человек. */
export const PERCENT_MIN_ANSWERS = 5;

/** «Присылать / не присылать» вопрос дня (и приглашения бота) по Telegram ID — работает и без аккаунта. */
export async function setQuizPush(telegramId: number, enabled: boolean, now = new Date()) {
  await db
    .insert(botQuizPlayers)
    .values({ telegramId, pushEnabled: enabled })
    .onConflictDoUpdate({ target: botQuizPlayers.telegramId, set: { pushEnabled: enabled, ignoredPushes: 0, updatedAt: now } });
}

/** Записать ответ на вопрос дня. Возвращает начисленные XP (0 без аккаунта, при неверном ответе или если XP уже были). */
export async function recordDailyAnswer(round: Round, chosen: number, correct: boolean, user: BotUser | null, now: Date): Promise<number> {
  const send = await db.select({ day: dailyQuizSends.day }).from(dailyQuizSends).where(eq(dailyQuizSends.roundId, round.id)).get();
  let xp = 0;
  if (correct && user) {
    try {
      xp = await awardXp(user.id, round.id, now);
    } catch (e) {
      console.warn('daily quiz: xp not granted', (e as Error).message);
    }
  }
  const day = send?.day ?? warsawDay(now);
  const prev = await db.select().from(dailyQuizPeople).where(eq(dailyQuizPeople.telegramId, round.telegramId)).get();
  const streak = prev?.streakDay === day ? prev.streak : prev?.streakDay === addDays(day, -1) ? prev.streak + 1 : 1;
  await db.batch([
    db
      .insert(dailyQuizPeople)
      .values({ telegramId: round.telegramId, ignored: 0, streak, streakDay: day })
      .onConflictDoUpdate({ target: dailyQuizPeople.telegramId, set: { ignored: 0, streak, streakDay: day, updatedAt: now } }),
    db.update(dailyQuizSends).set({ answeredAt: now, chosen, correct }).where(eq(dailyQuizSends.roundId, round.id)),
  ]);
  return xp;
}

/** Данные итога: процент верных по уровню за день (с пятого ответившего), серия, включена ли рассылка человеку. */
export async function dailyResultFor(round: Round, user: BotUser | null): Promise<DailyResult> {
  const [send, people, player] = await Promise.all([
    db.select({ day: dailyQuizSends.day, level: dailyQuizSends.level }).from(dailyQuizSends).where(eq(dailyQuizSends.roundId, round.id)).get(),
    db.select().from(dailyQuizPeople).where(eq(dailyQuizPeople.telegramId, round.telegramId)).get(),
    db.select({ pushEnabled: botQuizPlayers.pushEnabled }).from(botQuizPlayers).where(eq(botQuizPlayers.telegramId, round.telegramId)).get(),
  ]);
  let percent: number | null = null;
  if (send) {
    const [stat] = await db
      .select({ n: count(), right: sql<number>`coalesce(sum(${dailyQuizSends.correct}), 0)` })
      .from(dailyQuizSends)
      .where(and(eq(dailyQuizSends.day, send.day), eq(dailyQuizSends.level, send.level), isNotNull(dailyQuizSends.answeredAt)));
    if (Number(stat.n) >= PERCENT_MIN_ANSWERS) percent = Math.round((Number(stat.right) * 100) / Number(stat.n));
  }
  return {
    hasUser: !!user,
    xp: round.xp,
    percent,
    dailyStreak: send && people?.streakDay === send.day ? people.streak : 0,
    pushEnabled: player?.pushEnabled ?? true,
  };
}
