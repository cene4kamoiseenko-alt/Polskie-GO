/**
 * Вовлечённость игроков для админки (владелец 2026-11-15: «нужен анализ игроков, их заинтересованность»).
 *
 * Активный день — строка daily_activity (игрок учился: урок, повторение, миссия, тренировка). Дни — по Варшаве.
 *  • Сегменты (каждый игрок ровно в одном): ядро — 4+ активных дня за последние 7; активные — 1–3 дня за 7;
 *    под угрозой — последний активный день 8–14 дней назад; засыпают — 15–30; ушли — больше 30; не начали — ни одного активного дня.
 *  • Липкость: занимались сегодня / за 7 / за 30 дней и доля «каждый день из месячных» (DAU/MAU).
 *  • Глубина за 7 дней: дней на игрока, минут в активный день, уроков и XP на игрока.
 *  • Интерес к разделам за 7 дней: доля занимавшихся, кто пользовался уроками, повторением, миссиями, вопросом дня,
 *    быстрым вопросом в боте, лигой, магазином, друзьями.
 *  • Когда играют: начатые занятия за 30 дней по часам и дням недели.
 *  • «Лестница» уроков: сколько игроков прошли 1, 3, 5, 10, 25, 50 уроков.
 *  • Самые вовлечённые и «под угрозой» с историей (кому стоит написать).
 *  • Оценка вовлечённости 0–100 (для списка игроков): дни за 14 (60) + серия (20) + разнообразие разделов за 14 дней (20).
 */
import { sql } from 'drizzle-orm';
import { leagueWeek } from '@polski-go/shared';
import { db } from '../db';
import { REPORT_TZ, tzOffsetMs } from './admin-insights';

const DAY_MS = 86_400_000;
type Num = number | string | null;
const n = (v: Num | undefined) => Number(v ?? 0);

export const SEGMENTS = ['core', 'active', 'at_risk', 'sleeping', 'churned', 'never'] as const;
export type Segment = (typeof SEGMENTS)[number];

/** Ключи дней по Варшаве: сегодня и N дней назад. */
function days(now: Date) {
  const off = tzOffsetMs(now);
  const key = (ms: number) => new Date(ms + off).toISOString().slice(0, 10);
  const t = now.getTime();
  return { off, today: key(t), ago: (k: number) => key(t - k * DAY_MS) };
}

/** SQL: сегмент игрока по последнему активному дню `last` и числу активных дней за 7 `a7`. */
function segmentCase(d: ReturnType<typeof days>, last: string, a7: string) {
  return sql.raw(`CASE WHEN ${last} IS NULL THEN 'never'
    WHEN ${a7} >= 4 THEN 'core'
    WHEN ${last} >= '${d.ago(6)}' THEN 'active'
    WHEN ${last} >= '${d.ago(13)}' THEN 'at_risk'
    WHEN ${last} >= '${d.ago(29)}' THEN 'sleeping'
    ELSE 'churned' END`);
}

/** Условие для списка игроков: игрок в сегменте (u — алиас таблицы users в запросе). */
export function segmentWhere(seg: Segment, now = new Date()) {
  const d = days(now);
  return sql`(${segmentCase(
    d,
    '(SELECT max(a.day) FROM daily_activity a WHERE a.user_id = users.id)',
    `(SELECT count(*) FROM daily_activity a WHERE a.user_id = users.id AND a.day >= '${d.ago(6)}')`,
  )}) = ${seg}`;
}

export type Engagement = { score: number; segment: Segment; activeDays14: number; activeDays7: number; lastActiveDay: string | null; features: string[] };

/** Оценка и сегмент для набора игроков (страница списка, карточка). */
export async function engagementFor(userIds: string[], now = new Date()): Promise<Map<string, Engagement>> {
  const out = new Map<string, Engagement>();
  if (!userIds.length) return out;
  const d = days(now);
  const since14 = now.getTime() - 14 * DAY_MS;
  const weeks = [leagueWeek(now), leagueWeek(new Date(now.getTime() - 7 * DAY_MS))];
  for (let i = 0; i < userIds.length; i += 80) {
    const ids = userIds.slice(i, i + 80);
    const rows = await db.all<{ id: string; a14: Num; a7: Num; last: string | null; lessons: Num; missions: Num; daily: Num; league: Num; streak: Num; lad: string | null }>(sql`
      SELECT u.id AS id,
        (SELECT count(*) FROM daily_activity a WHERE a.user_id = u.id AND a.day >= ${d.ago(13)}) AS a14,
        (SELECT count(*) FROM daily_activity a WHERE a.user_id = u.id AND a.day >= ${d.ago(6)}) AS a7,
        (SELECT max(a.day) FROM daily_activity a WHERE a.user_id = u.id) AS last,
        (SELECT coalesce(sum(a.lessons), 0) FROM daily_activity a WHERE a.user_id = u.id AND a.day >= ${d.ago(13)}) AS lessons,
        EXISTS (SELECT 1 FROM mission_runs m WHERE m.user_id = u.id AND m.finished_at >= ${since14}) AS missions,
        EXISTS (SELECT 1 FROM daily_quiz_sends s WHERE s.user_id = u.id AND s.answered_at >= ${since14}) AS daily,
        EXISTS (SELECT 1 FROM leaderboards l WHERE l.user_id = u.id AND l.period_key IN (${weeks[0]}, ${weeks[1]}) AND l.xp >= 20) AS league,
        p.streak_current AS streak, p.last_active_day AS lad
      FROM users u LEFT JOIN player_progress p ON p.user_id = u.id
      WHERE u.id IN (${sql.join(ids.map((x) => sql`${x}`), sql`, `)})`);
    for (const r of rows) {
      const a14 = n(r.a14);
      const a7 = n(r.a7);
      // Серия живая, только если последний день — сегодня или вчера.
      const streak = r.lad && r.lad >= d.ago(1) ? n(r.streak) : 0;
      const features = [n(r.lessons) > 0 && 'lessons', n(r.missions) > 0 && 'missions', n(r.daily) > 0 && 'daily_quiz', n(r.league) > 0 && 'league'].filter(Boolean) as string[];
      const score = Math.min(100, Math.round((a14 / 14) * 60 + (Math.min(streak, 14) / 14) * 20 + (features.length / 4) * 20));
      const last = r.last;
      const segment: Segment = !last ? 'never' : a7 >= 4 ? 'core' : last >= d.ago(6) ? 'active' : last >= d.ago(13) ? 'at_risk' : last >= d.ago(29) ? 'sleeping' : 'churned';
      out.set(r.id, { score, segment, activeDays14: a14, activeDays7: a7, lastActiveDay: last, features });
    }
  }
  return out;
}

const FEATURES = ['lessons', 'reviews', 'missions', 'daily_quiz', 'bot_quiz', 'league', 'shop', 'friends'] as const;
const LADDER = [1, 3, 5, 10, 25, 50];

export async function engagementReport(now = new Date()) {
  const d = days(now);
  const offSec = Math.round(d.off / 1000);
  const t7 = now.getTime() - 7 * DAY_MS;
  const t30 = now.getTime() - 30 * DAY_MS;
  const week = leagueWeek(now);
  const seg = segmentCase(d, 'a.last', 'coalesce(a.a7, 0)');

  const [stick, segments, depth, feats, hours, weekdays, ladder, top, risk] = await Promise.all([
    db.all<{ dau: Num; wau: Num; mau: Num; users: Num }>(sql`
      SELECT
        (SELECT count(DISTINCT user_id) FROM daily_activity WHERE day = ${d.today}) AS dau,
        (SELECT count(DISTINCT user_id) FROM daily_activity WHERE day >= ${d.ago(6)}) AS wau,
        (SELECT count(DISTINCT user_id) FROM daily_activity WHERE day >= ${d.ago(29)}) AS mau,
        (SELECT count(*) FROM users) AS users`),
    db.all<{ seg: Segment; n: Num }>(sql`
      SELECT ${seg} AS seg, count(*) AS n FROM users u
      LEFT JOIN (SELECT user_id, max(day) AS last, sum(CASE WHEN day >= ${d.ago(6)} THEN 1 ELSE 0 END) AS a7 FROM daily_activity GROUP BY user_id) a ON a.user_id = u.id
      GROUP BY 1`),
    db.all<{ users: Num; days: Num; seconds: Num; lessons: Num; xp: Num }>(sql`
      SELECT count(DISTINCT user_id) AS users, count(*) AS days, sum(seconds) AS seconds, sum(lessons) AS lessons, sum(xp) AS xp
      FROM daily_activity WHERE day >= ${d.ago(6)}`),
    db.all<Record<(typeof FEATURES)[number], Num>>(sql`
      SELECT
        (SELECT count(DISTINCT user_id) FROM daily_activity WHERE day >= ${d.ago(6)} AND lessons > 0) AS lessons,
        (SELECT count(DISTINCT user_id) FROM daily_activity WHERE day >= ${d.ago(6)} AND reviews > 0) AS reviews,
        (SELECT count(DISTINCT user_id) FROM mission_runs WHERE finished_at >= ${t7}) AS missions,
        (SELECT count(DISTINCT user_id) FROM daily_quiz_sends WHERE answered_at >= ${t7} AND user_id IS NOT NULL) AS daily_quiz,
        (SELECT count(DISTINCT u.id) FROM bot_quiz_rounds r JOIN users u ON u.telegram_id = r.telegram_id WHERE r.status = 'ANSWERED' AND r.source IN ('command', 'push', 'next') AND r.answered_at >= ${t7}) AS bot_quiz,
        (SELECT count(DISTINCT user_id) FROM leaderboards WHERE period_key = ${week} AND xp >= 20) AS league,
        (SELECT count(DISTINCT user_id) FROM wallet_transactions WHERE reason LIKE 'buy:%' AND created_at >= ${t7}) AS shop,
        (SELECT count(DISTINCT x) FROM (SELECT requester_id AS x FROM friendships WHERE created_at >= ${t7} UNION SELECT addressee_id FROM friendships WHERE created_at >= ${t7} AND status = 'ACCEPTED')) AS friends`),
    db.all<{ h: Num; n: Num }>(sql`
      SELECT CAST(strftime('%H', started_at / 1000 + ${offSec}, 'unixepoch') AS INTEGER) AS h, count(*) AS n
      FROM learning_sessions WHERE started_at >= ${t30} GROUP BY 1`),
    db.all<{ w: Num; n: Num }>(sql`
      SELECT CAST(strftime('%w', started_at / 1000 + ${offSec}, 'unixepoch') AS INTEGER) AS w, count(*) AS n
      FROM learning_sessions WHERE started_at >= ${t30} GROUP BY 1`),
    db.all<Record<string, Num>>(sql.raw(`SELECT count(*) AS base, ${LADDER.map((k) => `sum(CASE WHEN lessons_completed >= ${k} THEN 1 ELSE 0 END) AS l${k}`).join(', ')} FROM player_progress`)),
    db.all<{ id: string; name: string | null; username: string | null; a14: Num; xp14: Num; streak: Num; lad: string | null }>(sql`
      SELECT u.id AS id, u.first_name AS name, u.username AS username, count(*) AS a14, sum(a.xp) AS xp14, p.streak_current AS streak, p.last_active_day AS lad
      FROM daily_activity a JOIN users u ON u.id = a.user_id LEFT JOIN player_progress p ON p.user_id = u.id
      WHERE a.day >= ${d.ago(13)} GROUP BY u.id ORDER BY a14 DESC, xp14 DESC LIMIT 10`),
    db.all<{ id: string; name: string | null; username: string | null; last: string; total: Num; lessons: Num }>(sql`
      SELECT u.id AS id, u.first_name AS name, u.username AS username, a.last AS last, a.total AS total, p.lessons_completed AS lessons
      FROM (SELECT user_id, max(day) AS last, count(*) AS total FROM daily_activity GROUP BY user_id) a
      JOIN users u ON u.id = a.user_id LEFT JOIN player_progress p ON p.user_id = u.id
      WHERE a.last < ${d.ago(6)} AND a.last >= ${d.ago(13)} ORDER BY a.total DESC, a.last DESC LIMIT 10`),
  ]);

  const s = stick[0];
  const dau = n(s?.dau);
  const wau = n(s?.wau);
  const mau = n(s?.mau);
  const bySeg = Object.fromEntries(SEGMENTS.map((k) => [k, 0])) as Record<Segment, number>;
  for (const r of segments) bySeg[r.seg] = n(r.n);
  const dp = depth[0];
  const activeDays = n(dp?.days);
  const f = feats[0] ?? ({} as Record<string, Num>);
  const hourly = Array.from({ length: 24 }, (_, h) => n(hours.find((r) => n(r.h) === h)?.n));
  // Понедельник первым.
  const weekly = [1, 2, 3, 4, 5, 6, 0].map((w) => n(weekdays.find((r) => n(r.w) === w)?.n));
  const lad = ladder[0] ?? {};
  return {
    tz: REPORT_TZ,
    today: d.today,
    stickiness: { dau, wau, mau, users: n(s?.users), dauMau: mau ? Math.round((dau * 100) / mau) : 0, wauMau: mau ? Math.round((wau * 100) / mau) : 0 },
    segments: bySeg,
    depth: {
      activeUsers: n(dp?.users),
      daysPerUser: n(dp?.users) ? Math.round((activeDays / n(dp?.users)) * 10) / 10 : 0,
      minutesPerDay: activeDays ? Math.round(n(dp?.seconds) / 60 / activeDays) : 0,
      lessonsPerUser: n(dp?.users) ? Math.round((n(dp?.lessons) / n(dp?.users)) * 10) / 10 : 0,
      xpPerUser: n(dp?.users) ? Math.round(n(dp?.xp) / n(dp?.users)) : 0,
    },
    features: FEATURES.map((k) => ({ key: k, users: n(f[k]), share: wau ? Math.round((n(f[k]) * 100) / wau) : 0 })),
    hourly,
    weekly,
    ladder: { base: n(lad.base), steps: LADDER.map((k) => ({ lessons: k, users: n(lad[`l${k}`]) })) },
    top: top.map((r) => ({ id: r.id, name: r.name ?? '', username: r.username, activeDays14: n(r.a14), xp14: n(r.xp14), streak: r.lad && r.lad >= d.ago(1) ? n(r.streak) : 0 })),
    atRisk: risk.map((r) => ({ id: r.id, name: r.name ?? '', username: r.username, lastActiveDay: r.last, activeDaysTotal: n(r.total), lessons: n(r.lessons) })),
  };
}
