/**
 * Нарахування XP, Złotki та предметів.
 * Функції не пишуть у БД самі, а повертають запити для атомарного пакета (`atomic`).
 * Кожна нагорода має ключ ідемпотентності: якщо подію з таким ключем уже записано,
 * запити пакета нічого не змінюють.
 */
import { eq, sql } from 'drizzle-orm';
import { dayKey, levelFromXp, updateStreak, weekKey } from '@polski-go/shared';
import { db, type Stmt } from '../db';
import { dailyActivity, gameWallets, playerProgress, userInventory, userSettings } from '../db/schema';

export function leagueFor(xpTotal: number): string {
  if (xpTotal >= 5000) return 'diamond';
  if (xpTotal >= 2000) return 'gold';
  if (xpTotal >= 500) return 'silver';
  return 'bronze';
}

export type Progress = typeof playerProgress.$inferSelect;

/** Контекст користувача для одного запиту: часовий пояс, день, прогрес. */
export type UserCtx = { userId: string; now: Date; tz: string; day: string; week: string; progress: Progress };

/** Запити контексту — щоб додати їх у спільний пакет читань запиту (`db.batch([...ctxReads(id), ...])`). */
export const ctxReads = (userId: string) =>
  [
    db.select({ timezone: userSettings.timezone }).from(userSettings).where(eq(userSettings.userId, userId)),
    db.select().from(playerProgress).where(eq(playerProgress.userId, userId)),
  ] as const;

/** Контекст із рядків `ctxReads`. */
export function ctxFrom(userId: string, now: Date, settings: { timezone: string }[], progress: Progress[]): UserCtx {
  if (!progress[0]) throw new Error(`progress missing for ${userId}`);
  const tz = settings[0]?.timezone ?? 'Europe/Warsaw';
  const day = dayKey(now, tz);
  return { userId, now, tz, day, week: weekKey(day), progress: { ...progress[0] } };
}

export async function loadCtx(userId: string, now = new Date()): Promise<UserCtx> {
  const [settings, progress] = await db.batch(ctxReads(userId));
  return ctxFrom(userId, now, settings, progress);
}

/**
 * Ключі днів і тижнів, якими може бути «сьогодні» в будь-якому часовому поясі (UTC−12…UTC+14).
 * Рядки за цими ключами можна прочитати ще до того, як відомий пояс користувача, — в одному пакеті з `ctxReads` —
 * і потім відібрати потрібні за `ctx.day` і `ctx.week`.
 */
export function dayCandidates(now: Date): string[] {
  return [...new Set([-12, 0, 14].map((h) => dayKey(new Date(now.getTime() + h * 3600_000), 'UTC')))];
}
export function periodCandidates(now: Date): string[] {
  const days = dayCandidates(now);
  return [...days, ...new Set(days.map(weekKey))];
}

export async function userTimezone(userId: string): Promise<string> {
  const s = await db.query.userSettings.findFirst({ where: eq(userSettings.userId, userId), columns: { timezone: true } });
  return s?.timezone ?? 'Europe/Warsaw';
}

const notGranted = (table: 'xp_events' | 'wallet_transactions', key: string) =>
  sql`NOT EXISTS (SELECT 1 FROM ${sql.identifier(table)} WHERE idempotency_key = ${key})`;

export type XpGrant = { granted: number; levelBefore: number; levelAfter: number; stmts: Stmt[] };

/** XP: прогрес, денна активність, тижнева ліга і журнал подій. Оновлює ctx.progress. */
export function grantXp(ctx: UserCtx, amount: number, reason: string, key: string): XpGrant {
  const levelBefore = ctx.progress.playerLevel;
  if (amount <= 0) return { granted: 0, levelBefore, levelAfter: levelBefore, stmts: [] };
  const xpTotal = ctx.progress.xpTotal + amount;
  const levelAfter = levelFromXp(xpTotal).level;
  const league = leagueFor(xpTotal);
  const { userId, day, week } = ctx;
  const nowMs = ctx.now.getTime();
  const stmts: Stmt[] = [
    db.run(sql`UPDATE player_progress SET xp_total = xp_total + ${amount}, player_level = ${levelAfter}, updated_at = ${nowMs}
      WHERE user_id = ${userId} AND ${notGranted('xp_events', key)}`),
    db.run(sql`INSERT INTO daily_activity (user_id, day, xp) SELECT ${userId}, ${day}, ${amount} WHERE ${notGranted('xp_events', key)}
      ON CONFLICT (user_id, day) DO UPDATE SET xp = xp + excluded.xp`),
    db.run(sql`INSERT INTO leaderboards (user_id, period_key, league, xp, updated_at) SELECT ${userId}, ${week}, ${league}, ${amount}, ${nowMs}
      WHERE ${notGranted('xp_events', key)}
      ON CONFLICT (user_id, period_key) DO UPDATE SET xp = xp + excluded.xp, league = excluded.league, updated_at = excluded.updated_at`),
    db.run(sql`INSERT OR IGNORE INTO xp_events (id, user_id, amount, reason, idempotency_key, day, week, created_at)
      VALUES (${crypto.randomUUID().replace(/-/g, '')}, ${userId}, ${amount}, ${reason}, ${key}, ${day}, ${week}, ${nowMs})`),
  ];
  ctx.progress.xpTotal = xpTotal;
  ctx.progress.playerLevel = levelAfter;
  return { granted: amount, levelBefore, levelAfter, stmts };
}

/** Złotki: поповнення гаманця і журнал. Від'ємні суми — лише через покупки (CHECK у БД). */
export function grantZlotki(userId: string, amount: number, reason: string, key: string, now = new Date()): { granted: number; stmts: Stmt[] } {
  if (amount === 0) return { granted: 0, stmts: [] };
  const nowMs = now.getTime();
  return {
    granted: amount,
    stmts: [
      db.run(sql`UPDATE game_wallets SET balance = balance + ${amount}, updated_at = ${nowMs} WHERE user_id = ${userId} AND ${notGranted('wallet_transactions', key)}`),
      db.run(sql`INSERT OR IGNORE INTO wallet_transactions (id, user_id, amount, reason, idempotency_key, created_at)
        VALUES (${crypto.randomUUID().replace(/-/g, '')}, ${userId}, ${amount}, ${reason}, ${key}, ${nowMs})`),
    ],
  };
}

/** Видати предмет (якщо ще немає — повторна видача ігнорується). */
export function grantItem(userId: string, itemId: string, source: string): Stmt {
  return db.insert(userInventory).values({ userId, itemId, source }).onConflictDoNothing();
}

export type ActivityInc = Partial<{ lessons: number; exercises: number; correct: number; newWords: number; reviews: number; seconds: number; practiceXp: number }>;

/** Активність дня: агрегати та серія днів. Оновлює ctx.progress. */
export function touchActivity(ctx: UserCtx, inc: ActivityInc) {
  const vals = { lessons: 0, exercises: 0, correct: 0, newWords: 0, reviews: 0, seconds: 0, practiceXp: 0, ...inc };
  const stmts: Stmt[] = [
    db
      .insert(dailyActivity)
      .values({ userId: ctx.userId, day: ctx.day, ...vals })
      .onConflictDoUpdate({
        target: [dailyActivity.userId, dailyActivity.day],
        set: {
          lessons: sql`${dailyActivity.lessons} + ${vals.lessons}`,
          exercises: sql`${dailyActivity.exercises} + ${vals.exercises}`,
          correct: sql`${dailyActivity.correct} + ${vals.correct}`,
          newWords: sql`${dailyActivity.newWords} + ${vals.newWords}`,
          reviews: sql`${dailyActivity.reviews} + ${vals.reviews}`,
          seconds: sql`${dailyActivity.seconds} + ${vals.seconds}`,
          practiceXp: sql`${dailyActivity.practiceXp} + ${vals.practiceXp}`,
        },
      }),
  ];
  const p = ctx.progress;
  const s = updateStreak({ current: p.streakCurrent, best: p.streakBest, lastDay: p.lastActiveDay }, ctx.day);
  if (s.changed) {
    stmts.push(db.update(playerProgress).set({ streakCurrent: s.current, streakBest: s.best, lastActiveDay: ctx.day }).where(eq(playerProgress.userId, ctx.userId)));
    p.streakCurrent = s.current;
    p.streakBest = s.best;
    p.lastActiveDay = ctx.day;
  }
  return { day: ctx.day, streak: s.current, streakChanged: s.changed, stmts };
}

/** Списати Złotki (покупка). CHECK balance >= 0 відкотить пакет, якщо грошей не вистачає. */
export function spendZlotki(userId: string, amount: number, reason: string, key: string): Stmt[] {
  return [
    db.update(gameWallets).set({ balance: sql`${gameWallets.balance} - ${amount}` }).where(eq(gameWallets.userId, userId)),
    db.run(sql`INSERT INTO wallet_transactions (id, user_id, amount, reason, idempotency_key, created_at)
      VALUES (${crypto.randomUUID().replace(/-/g, '')}, ${userId}, ${-amount}, ${reason}, ${key}, ${Date.now()})`),
  ];
}
