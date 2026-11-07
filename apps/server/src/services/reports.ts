/**
 * Жалобы игроков друг на друга. Другим игрокам видны имя (рейтинг, друзья) и фото, поэтому Google Play требует жалобу прямо в приложении
 * и работу с ней. Игрок жалуется на игрока один раз (повтор после разбора открывает жалобу снова), в сутки — не больше MAX_PER_DAY новых жалоб.
 * Разбирает админка: имя сбрасывается на нейтральное, игрок блокируется или жалоба закрывается без последствий.
 */
import { and, desc, eq, gt, sql } from 'drizzle-orm';
import { db } from '../db';
import { playerReports, REPORT_REASONS, userProfiles, users } from '../db/schema';
import { HttpError } from '../lib/errors';

export type ReportReason = (typeof REPORT_REASONS)[number];
export type ReportAction = 'dismiss' | 'reset_name' | 'ban';
export const REPORT_ACTIONS: readonly ReportAction[] = ['dismiss', 'reset_name', 'ban'];

export const MAX_REPORTS_PER_DAY = 10;
/** Имя, которым заменяется неподходящее: то же, что рейтинг показывает игроку без имени. */
export const NEUTRAL_NAME = 'Bóbr';

export async function reportPlayer(reporterId: string, reportedId: string, reason: ReportReason): Promise<{ ok: true }> {
  if (reporterId === reportedId) throw new HttpError(400, 'cannot_report_self', 'You cannot report yourself');
  const target = (await db.select({ id: users.id }).from(users).where(eq(users.id, reportedId)))[0];
  if (!target) throw new HttpError(404, 'player_not_found', 'Player not found');
  const since = new Date(Date.now() - 86_400_000);
  const recent = (await db.select({ n: sql<number>`count(*)` }).from(playerReports).where(and(eq(playerReports.reporterId, reporterId), gt(playerReports.createdAt, since))))[0];
  if ((recent?.n ?? 0) >= MAX_REPORTS_PER_DAY) throw new HttpError(429, 'too_many_reports', 'Too many reports today');
  const now = new Date();
  await db
    .insert(playerReports)
    .values({ reporterId, reportedId, reason, createdAt: now })
    .onConflictDoUpdate({ target: [playerReports.reporterId, playerReports.reportedId], set: { reason, status: 'OPEN', createdAt: now, resolvedAt: null } });
  return { ok: true };
}

/** Жалобы по игрокам: сколько на каждого, причины, текущее имя и блокировка. Больше жалоб — выше. */
export async function listReports(status: 'OPEN' | 'DONE') {
  const rows = await db
    .select({
      userId: playerReports.reportedId,
      count: sql<number>`count(*)`,
      reasons: sql<string>`group_concat(distinct ${playerReports.reason})`,
      last: sql<number>`max(${playerReports.createdAt})`,
      displayName: userProfiles.displayName,
      firstName: users.firstName,
      username: users.username,
      banned: users.isBanned,
      telegramId: users.telegramId,
    })
    .from(playerReports)
    .innerJoin(users, eq(users.id, playerReports.reportedId))
    .leftJoin(userProfiles, eq(userProfiles.userId, playerReports.reportedId))
    .where(eq(playerReports.status, status))
    .groupBy(playerReports.reportedId)
    .orderBy(desc(sql`count(*)`), desc(sql`max(${playerReports.createdAt})`))
    .limit(100);
  return rows.map((r) => ({
    userId: r.userId,
    count: Number(r.count),
    reasons: (r.reasons ?? '').split(',').filter(Boolean),
    lastAt: new Date(Number(r.last)).toISOString(),
    name: r.displayName || r.firstName || r.username || NEUTRAL_NAME,
    username: r.username,
    guest: r.telegramId < 0,
    banned: !!r.banned,
  }));
}

/**
 * Разбор жалоб на игрока: закрывает все открытые жалобы и применяет действие. Блокировку выполняет вызывающий (кэш входа сбрасывается в маршруте),
 * здесь — имя и закрытие. Возвращает, сколько жалоб закрыто.
 */
export async function resolveReports(userId: string, action: ReportAction): Promise<number> {
  const open = await db.select({ id: playerReports.id }).from(playerReports).where(and(eq(playerReports.reportedId, userId), eq(playerReports.status, 'OPEN')));
  if (!open.length) throw new HttpError(404, 'no_open_reports', 'No open reports for this player');
  if (action === 'reset_name') {
    await db.update(userProfiles).set({ displayName: NEUTRAL_NAME, bio: null }).where(eq(userProfiles.userId, userId));
  } else if (action === 'ban') {
    await db.update(users).set({ isBanned: true, banReason: 'player report' }).where(eq(users.id, userId));
  }
  await db.update(playerReports).set({ status: 'DONE', resolvedAt: new Date() }).where(and(eq(playerReports.reportedId, userId), eq(playerReports.status, 'OPEN')));
  return open.length;
}
