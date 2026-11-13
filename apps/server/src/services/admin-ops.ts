/**
 * Рабочие сводки админки (обновление 2026-11-13): деньги за период, что ждёт ответа (обращения, жалобы, ошибки), журнал действий с отбором.
 * Только чтение. Дни — по Варшаве, как на «Обзоре» (services/admin-insights.ts).
 */
import { and, count, desc, eq, lt, or, sql, type SQL } from 'drizzle-orm';
import { db } from '../db';
import { adminAuditLogs, adminUsers, playerReports, supportRequests } from '../db/schema';
import { REPORT_TZ, tzOffsetMs } from './admin-insights';
import { recentErrors } from './error-log';

const DAY_MS = 86_400_000;
type Num = number | string | null;
const num = (v: Num | undefined) => Number(v ?? 0) || 0;
/** Название тарифа по-русски (запасной — украинский) из JSON-поля subscription_plans.title. */
function titleOf(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const t = JSON.parse(raw) as Record<string, string>;
    return t.ru || t.uk || null;
  } catch {
    return null;
  }
}

/**
 * Деньги за `days` дней (по Варшаве, сегодня последним) и тот же период раньше.
 * Выручка — успешные платежи без ошибки; ручные возвраты вычитаются в «чистой» сумме. Автовозвраты (платёж с ошибкой) в выручку и не входили.
 */
export async function paymentsSummary(now: Date, days: number) {
  const end = now.getTime();
  const off = tzOffsetMs(now);
  const offSec = Math.round(off / 1000);
  const dayKey = (ms: number) => new Date(ms + off).toISOString().slice(0, 10);
  const keys = Array.from({ length: days }, (_, i) => dayKey(end - (days - 1 - i) * DAY_MS));
  const since = Date.parse(`${keys[0]}T00:00:00Z`) - off;
  const prevSince = since - days * DAY_MS;
  const localDay = sql.raw(`strftime('%Y-%m-%d', created_at / 1000 + ${offSec}, 'unixepoch')`);
  const PAID = sql.raw(`type = 'SUCCESSFUL_PAYMENT' AND error IS NULL`);
  const REFUND = sql.raw(`type = 'REFUND' AND error IS NULL`);

  const [paid, refunds, totals, plans, subs] = await Promise.all([
    db.all<{ d: string; n: Num; c: Num }>(sql`SELECT ${localDay} AS d, SUM(amount) AS n, COUNT(*) AS c FROM payment_events WHERE ${PAID} AND created_at >= ${since} GROUP BY 1`),
    db.all<{ d: string; n: Num }>(sql`SELECT ${localDay} AS d, SUM(COALESCE(amount, 0)) AS n FROM payment_events WHERE ${REFUND} AND created_at >= ${since} GROUP BY 1`),
    db.all<Record<string, Num>>(sql`
      SELECT
        (SELECT COALESCE(SUM(amount), 0) FROM payment_events WHERE ${PAID} AND created_at >= ${since}) AS stars,
        (SELECT COALESCE(SUM(amount), 0) FROM payment_events WHERE ${PAID} AND created_at >= ${prevSince} AND created_at < ${since}) AS starsPrev,
        (SELECT COUNT(*) FROM payment_events WHERE ${PAID} AND created_at >= ${since}) AS payments,
        (SELECT COUNT(*) FROM payment_events WHERE ${PAID} AND created_at >= ${prevSince} AND created_at < ${since}) AS paymentsPrev,
        (SELECT COUNT(DISTINCT user_id) FROM payment_events WHERE ${PAID} AND created_at >= ${since}) AS payers,
        (SELECT COUNT(*) FROM payment_events WHERE ${REFUND} AND created_at >= ${since}) AS refunds,
        (SELECT COALESCE(SUM(amount), 0) FROM payment_events WHERE ${REFUND} AND created_at >= ${since}) AS refundStars,
        (SELECT COUNT(*) FROM payment_events WHERE type IN ('PRE_CHECKOUT', 'SUCCESSFUL_PAYMENT') AND error IS NOT NULL AND created_at >= ${since}) AS failed,
        (SELECT COUNT(*) FROM payment_events WHERE type = 'INVOICE_CREATED' AND created_at >= ${since}) AS invoices,
        (SELECT COUNT(*) FROM payment_events WHERE type = 'CANCEL' AND created_at >= ${since}) AS cancels`),
    db.all<{ plan: string | null; title: string | null; n: Num; stars: Num }>(sql`
      SELECT e.plan_code AS plan, MAX(p.title) AS title, COUNT(*) AS n, SUM(e.amount) AS stars
      FROM payment_events e LEFT JOIN subscription_plans p ON p.code = e.plan_code
      WHERE e.type = 'SUCCESSFUL_PAYMENT' AND e.error IS NULL AND e.created_at >= ${since} GROUP BY e.plan_code ORDER BY stars DESC`),
    // Premium сейчас: ACTIVE — продлится или действует до конца срока, CANCELLED — автопродление отменено, доживает срок.
    db.all<{ plan: string; status: string; recurring: Num; n: Num; soon: Num }>(sql`
      SELECT plan_code AS plan, status, MAX(is_recurring) AS recurring, COUNT(DISTINCT user_id) AS n,
        SUM(CASE WHEN expires_at < ${end + 7 * DAY_MS} AND (status = 'CANCELLED' OR is_recurring = 0) THEN 1 ELSE 0 END) AS soon
      FROM subscriptions WHERE status IN ('ACTIVE', 'CANCELLED') AND expires_at > ${end} GROUP BY plan_code, status`),
  ]);
  const series = (rows: { d: string; n: Num }[]) => {
    const m = new Map(rows.map((r) => [r.d, num(r.n)]));
    return keys.map((k) => m.get(k) ?? 0);
  };
  const t = totals[0] ?? {};
  return {
    days,
    tz: REPORT_TZ,
    daily: { days: keys, stars: series(paid), payments: series(paid.map((r) => ({ d: r.d, n: r.c }))), refunds: series(refunds) },
    totals: {
      stars: { now: num(t.stars), prev: num(t.starsPrev) },
      payments: { now: num(t.payments), prev: num(t.paymentsPrev) },
      payers: num(t.payers),
      refunds: num(t.refunds),
      refundStars: num(t.refundStars),
      net: num(t.stars) - num(t.refundStars),
      failed: num(t.failed),
      invoices: num(t.invoices),
      cancels: num(t.cancels),
    },
    plans: plans.map((p) => ({ plan: p.plan ?? '—', title: titleOf(p.title), count: num(p.n), stars: num(p.stars) })),
    premium: {
      total: subs.reduce((a, s) => a + num(s.n), 0),
      renewing: subs.filter((s) => s.status === 'ACTIVE' && num(s.recurring) > 0).reduce((a, s) => a + num(s.n), 0),
      cancelled: subs.filter((s) => s.status === 'CANCELLED').reduce((a, s) => a + num(s.n), 0),
      granted: subs.filter((s) => s.plan === 'ADMIN_GRANT').reduce((a, s) => a + num(s.n), 0),
      endingSoon: subs.reduce((a, s) => a + num(s.soon), 0),
      byPlan: Object.entries(
        subs.reduce<Record<string, number>>((m, s) => ((m[s.plan] = (m[s.plan] ?? 0) + num(s.n)), m), {}),
      ).map(([plan, n]) => ({ plan, count: n })),
    },
  };
}

/**
 * Что ждёт человека: открытые обращения в поддержку, игроки с неразобранными жалобами, ошибки за сутки.
 * Показывается числом на пунктах меню. Журнала ошибок может не быть до миграции 0015 — тогда 0.
 */
export async function attention(now = new Date()) {
  const [support, reports, errors] = await Promise.all([
    db.select({ n: count() }).from(supportRequests).where(eq(supportRequests.status, 'OPEN')),
    db.select({ n: sql<number>`count(DISTINCT ${playerReports.reportedId})` }).from(playerReports).where(eq(playerReports.status, 'OPEN')),
    recentErrors(now).catch(() => null),
  ]);
  const e = errors?.total;
  return { support: num(support[0]?.n), reports: num(reports[0]?.n), errors: e ? (e.server ?? 0) + (e.client ?? 0) + (e.csp ?? 0) : 0 };
}

export const AUDIT_PAGE = 100;

/**
 * Журнал действий: новые сверху, отбор по администратору, по действию и по объекту. «Ещё» — с места последней записи (время + id):
 * записи с одинаковым временем на стыке страниц не теряются и не повторяются.
 */
export async function auditLog(opts: { adminId?: string; action?: string; entity?: string; before?: { at: number; id: string } }) {
  const conds: (SQL | undefined)[] = [
    opts.adminId ? eq(adminAuditLogs.adminId, opts.adminId) : undefined,
    opts.action ? eq(adminAuditLogs.action, opts.action) : undefined,
    opts.entity ? eq(adminAuditLogs.entity, opts.entity) : undefined,
    opts.before
      ? or(lt(adminAuditLogs.createdAt, new Date(opts.before.at)), and(eq(adminAuditLogs.createdAt, new Date(opts.before.at)), lt(adminAuditLogs.id, opts.before.id)))
      : undefined,
  ];
  const [rows, admins, actions] = await Promise.all([
    db
      .select({ log: adminAuditLogs, email: adminUsers.email, name: adminUsers.name })
      .from(adminAuditLogs)
      .leftJoin(adminUsers, eq(adminUsers.id, adminAuditLogs.adminId))
      .where(and(...conds))
      .orderBy(desc(adminAuditLogs.createdAt), desc(adminAuditLogs.id))
      .limit(AUDIT_PAGE + 1),
    db.select({ id: adminUsers.id, email: adminUsers.email, name: adminUsers.name }).from(adminUsers),
    db.selectDistinct({ action: adminAuditLogs.action, entity: adminAuditLogs.entity }).from(adminAuditLogs),
  ]);
  const page = rows.slice(0, AUDIT_PAGE);
  return {
    items: page.map((r) => ({ ...r.log, createdAt: r.log.createdAt.getTime(), admin: r.email ? { email: r.email, name: r.name } : null })),
    more: rows.length > AUDIT_PAGE ? `${page.at(-1)!.log.createdAt.getTime()}_${page.at(-1)!.log.id}` : null,
    admins,
    actions: [...new Set(actions.map((a) => a.action))].sort(),
    entities: [...new Set(actions.map((a) => a.entity))].sort(),
  };
}
