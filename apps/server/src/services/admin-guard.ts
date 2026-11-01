/**
 * Защита входа в админку от подбора пароля. rateLimit в hono.ts живёт в памяти одного изолята Worker, а Cloudflare запускает
 * их много, поэтому счётчик неточный. Здесь неудачные входы пишутся в D1 (admin_audit_logs, общая для всех изолятов):
 *  • на один email — не больше LOGIN_EMAIL_MAX неудач за LOGIN_WINDOW_MS (учётную запись нельзя подбирать с разных адресов);
 *  • на один IP — не больше LOGIN_IP_MAX (один адрес не перебирает чужие почты).
 * Пока лимит исчерпан, новые строки не пишутся: журнал не растёт от атаки. Старые строки убирает cron (pruneLoginFailures).
 */
import { and, count, eq, gte, lt, sql } from 'drizzle-orm';
import { db } from '../db';
import { adminAuditLogs } from '../db/schema';
import { HttpError } from '../lib/errors';

export const LOGIN_WINDOW_MS = 15 * 60_000;
export const LOGIN_EMAIL_MAX = 8;
export const LOGIN_IP_MAX = 30;
const ENTITY = 'admin_login';

const failed = (since: Date) => and(eq(adminAuditLogs.entity, ENTITY), eq(adminAuditLogs.action, 'failed'), gte(adminAuditLogs.createdAt, since));

/** Бросает 429, если по этому email или IP за окно уже слишком много неудач. */
export async function assertLoginAllowed(email: string, ip: string, now = new Date()) {
  const since = new Date(now.getTime() - LOGIN_WINDOW_MS);
  const [byEmail, byIp] = await db.batch([
    db.select({ n: count() }).from(adminAuditLogs).where(and(failed(since), eq(adminAuditLogs.entityId, email))),
    db.select({ n: count() }).from(adminAuditLogs).where(and(failed(since), sql`json_extract(${adminAuditLogs.details}, '$.ip') = ${ip}`)),
  ]);
  if ((byEmail[0]?.n ?? 0) >= LOGIN_EMAIL_MAX || (byIp[0]?.n ?? 0) >= LOGIN_IP_MAX) {
    throw new HttpError(429, 'too_many_attempts', 'Too many failed sign-in attempts. Try again in 15 minutes.');
  }
}

export async function recordLoginFailure(email: string, ip: string) {
  await db.insert(adminAuditLogs).values({ adminId: null, action: 'failed', entity: ENTITY, entityId: email, details: { ip } });
}

/** Cron: неудачные входы старше недели не нужны. */
export async function pruneLoginFailures(now = new Date()) {
  await db.delete(adminAuditLogs).where(and(eq(adminAuditLogs.entity, ENTITY), lt(adminAuditLogs.createdAt, new Date(now.getTime() - 7 * 86_400_000))));
}
