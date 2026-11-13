/**
 * Аналитика для «Обзора» админки (владелец 2026-11-12: «админку приятнее и больше функций»). Только чтение, только агрегаты — без имён и id игроков.
 *  • по дням: регистрации, активные игроки (daily_activity), пройденные уроки, доход Stars;
 *  • итоги периода и того же периода раньше — для стрелок «больше / меньше»;
 *  • воронка новичков периода: зарегистрировался → прошёл знакомство → закончил урок → вернулся на следующий день → заплатил;
 *  • откуда пришли новички: первый параметр /start из бота (bot_contacts.start_param), приглашение друга, гость вне Telegram;
 *  • входной тест: кто проходил и где оказался (Варшава / Лодзь / Краков), заявленный уровень, язык интерфейса;
 *  • напоминания бота: отправлено / не доставлено / бот заблокирован — по дням.
 * Дни — по Варшаве (REPORT_TZ): день активности игрока (daily_activity.day) тоже местный, а аудитория — Польша и Украина (±1 ч).
 * По UTC около полуночи «сегодняшняя» активность попадала в завтрашний день и выпадала из графика. Смещение берётся на текущий момент:
 * при переходе на летнее/зимнее время запись в пределах часа у полуночи может уйти в соседний день — для обзора это несущественно.
 */
import { sql } from 'drizzle-orm';
import { db } from '../db';

export const INSIGHT_DAYS = [7, 30, 90] as const;

const DAY_MS = 86_400_000;
export const REPORT_TZ = 'Europe/Warsaw';

/** Смещение пояса от UTC в миллисекундах на момент `at`. */
export function tzOffsetMs(at: Date, timeZone = REPORT_TZ): number {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', { timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
      .formatToParts(at)
      .map((p) => [p.type, p.value]),
  );
  const asUtc = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute), Number(parts.second));
  return asUtc - Math.floor(at.getTime() / 1000) * 1000;
}

type Num = number | string | null;
const num = (v: Num | undefined) => Number(v ?? 0) || 0;

/**
 * Классы источника: «ref» — приглашение друга, «guest» — вход вне Telegram, «none» — без метки, иначе — сам параметр /start;
 * в сводке ещё «other» — все метки за пределами первых 12. Правило одно для сводки (SQL ниже) и карточки игрока (sourceKey).
 */
export type Source = { key: string; count: number };

/** Источник одного игрока — то же правило, что CASE в запросе источников. */
export function sourceKey(u: { referredById: string | null; telegramId: number }, startParam: string | null | undefined): string {
  if (u.referredById) return 'ref';
  if (u.telegramId < 0) return 'guest';
  return startParam || 'none';
}

const SOURCES_SHOWN = 12;

export async function adminInsights(now: Date, days: number) {
  const end = now.getTime();
  const off = tzOffsetMs(now);
  const offSec = Math.round(off / 1000);
  const dayKey = (ms: number) => new Date(ms + off).toISOString().slice(0, 10);
  // Последние `days` дней по Варшаве, включая сегодняшний: по ним строятся графики (пустой день — 0, а не пропуск).
  const keys = Array.from({ length: days }, (_, i) => dayKey(end - (days - 1 - i) * DAY_MS));
  const firstDay = keys[0];
  const todayStart = Date.parse(`${keys[days - 1]}T00:00:00Z`) - off;
  const since = Date.parse(`${firstDay}T00:00:00Z`) - off;
  const prevSince = since - days * DAY_MS;
  const prevFirstDay = dayKey(prevSince);
  /** День записи по Варшаве: тот же сдвиг, что у ключей графика. */
  const localDay = (col: string) => sql.raw(`strftime('%Y-%m-%d', ${col} / 1000 + ${offSec}, 'unixepoch')`);

  const [signups, active, lessons, revenue, totals, funnel, sources, placement, selfLevels, languages, reminders, enabled, quiz] = await Promise.all([
    db.all<{ d: string; n: Num }>(sql`SELECT ${localDay('created_at')} AS d, COUNT(*) AS n FROM users WHERE created_at >= ${since} GROUP BY 1`),
    db.all<{ d: string; n: Num }>(sql`SELECT day AS d, COUNT(DISTINCT user_id) AS n FROM daily_activity WHERE day >= ${firstDay} GROUP BY 1`),
    db.all<{ d: string; n: Num }>(sql`SELECT day AS d, SUM(lessons) AS n FROM daily_activity WHERE day >= ${firstDay} GROUP BY 1`),
    db.all<{ d: string; n: Num }>(sql`
      SELECT ${localDay('created_at')} AS d, SUM(amount) AS n FROM payment_events
      WHERE type = 'SUCCESSFUL_PAYMENT' AND error IS NULL AND created_at >= ${since} GROUP BY 1`),
    db.all<{ signups: Num; signupsPrev: Num; active: Num; activePrev: Num; lessons: Num; lessonsPrev: Num; stars: Num; starsPrev: Num }>(sql`
      SELECT
        (SELECT COUNT(*) FROM users WHERE created_at >= ${since}) AS signups,
        (SELECT COUNT(*) FROM users WHERE created_at >= ${prevSince} AND created_at < ${since}) AS signupsPrev,
        (SELECT COUNT(DISTINCT user_id) FROM daily_activity WHERE day >= ${firstDay}) AS active,
        (SELECT COUNT(DISTINCT user_id) FROM daily_activity WHERE day >= ${prevFirstDay} AND day < ${firstDay}) AS activePrev,
        (SELECT COALESCE(SUM(lessons), 0) FROM daily_activity WHERE day >= ${firstDay}) AS lessons,
        (SELECT COALESCE(SUM(lessons), 0) FROM daily_activity WHERE day >= ${prevFirstDay} AND day < ${firstDay}) AS lessonsPrev,
        (SELECT COALESCE(SUM(amount), 0) FROM payment_events WHERE type = 'SUCCESSFUL_PAYMENT' AND error IS NULL AND created_at >= ${since}) AS stars,
        (SELECT COALESCE(SUM(amount), 0) FROM payment_events WHERE type = 'SUCCESSFUL_PAYMENT' AND error IS NULL AND created_at >= ${prevSince} AND created_at < ${since}) AS starsPrev`),
    // Воронка новичков периода. «Вернулся» — активность на следующий день после регистрации; для зарегистрированных сегодня он ещё не наступил — их не считаем.
    db.all<{ total: Num; onboarded: Num; lesson: Num; returnable: Num; returned: Num; paid: Num }>(sql`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN u.onboarded_at IS NOT NULL THEN 1 ELSE 0 END) AS onboarded,
        SUM(CASE WHEN EXISTS (SELECT 1 FROM learning_sessions s WHERE s.user_id = u.id AND s.mode = 'LESSON' AND s.status = 'FINISHED') THEN 1 ELSE 0 END) AS lesson,
        SUM(CASE WHEN u.created_at < ${todayStart} THEN 1 ELSE 0 END) AS returnable,
        SUM(CASE WHEN u.created_at < ${todayStart} AND EXISTS (
          SELECT 1 FROM daily_activity a WHERE a.user_id = u.id AND a.day = strftime('%Y-%m-%d', u.created_at / 1000 + ${offSec} + 86400, 'unixepoch')
        ) THEN 1 ELSE 0 END) AS returned,
        SUM(CASE WHEN EXISTS (SELECT 1 FROM payment_events p WHERE p.user_id = u.id AND p.type = 'SUCCESSFUL_PAYMENT' AND p.error IS NULL) THEN 1 ELSE 0 END) AS paid
      FROM users u WHERE u.created_at >= ${since}`),
    db.all<{ k: string; n: Num }>(sql`
      SELECT CASE
          WHEN u.referred_by_id IS NOT NULL THEN 'ref'
          WHEN u.telegram_id < 0 THEN 'guest'
          WHEN b.start_param IS NULL OR b.start_param = '' THEN 'none'
          ELSE b.start_param END AS k,
        COUNT(*) AS n
      FROM users u LEFT JOIN bot_contacts b ON b.telegram_id = u.telegram_id
      WHERE u.created_at >= ${since} GROUP BY 1 ORDER BY 2 DESC LIMIT ${SOURCES_SHOWN}`),
    // Город после входного теста: города, открытые тестом (source = 'placement'), кроме первого: 0 — Варшава, 1 — Лодзь, 2 — Краков.
    db.all<{ took: Num; opened: Num; n: Num }>(sql`
      SELECT CASE WHEN p.placement_level IS NULL THEN 0 ELSE 1 END AS took,
        (SELECT COUNT(*) FROM user_cities c WHERE c.user_id = u.id AND c.source = 'placement') AS opened,
        COUNT(*) AS n
      FROM users u LEFT JOIN user_profiles p ON p.user_id = u.id
      WHERE u.created_at >= ${since} GROUP BY 1, 2`),
    db.all<{ k: string | null; n: Num }>(sql`
      SELECT p.self_level AS k, COUNT(*) AS n FROM users u LEFT JOIN user_profiles p ON p.user_id = u.id WHERE u.created_at >= ${since} GROUP BY 1`),
    db.all<{ k: string | null; n: Num }>(sql`
      SELECT s.ui_language AS k, COUNT(*) AS n FROM users u LEFT JOIN user_settings s ON s.user_id = u.id WHERE u.created_at >= ${since} GROUP BY 1`),
    db.all<{ d: string; status: string; n: Num }>(sql`
      SELECT day AS d, status, COUNT(*) AS n FROM notification_log WHERE kind = 'daily_reminder' AND day >= ${firstDay} GROUP BY 1, 2`),
    db.all<{ n: Num; telegram: Num }>(sql`
      SELECT SUM(CASE WHEN s.notifications_enabled THEN 1 ELSE 0 END) AS n, COUNT(*) AS telegram
      FROM user_settings s JOIN users u ON u.id = s.user_id WHERE u.telegram_id > 0`),
    db.all<{ n: Num }>(sql`SELECT COUNT(*) AS n FROM notification_log WHERE kind = 'quiz_invite' AND status = 'SENT' AND day >= ${firstDay}`),
  ]);

  const series = (rows: { d: string; n: Num }[]) => {
    const m = new Map(rows.map((r) => [r.d, num(r.n)]));
    return keys.map((k) => m.get(k) ?? 0);
  };

  const placed = { noTest: 0, warszawa: 0, lodz: 0, krakow: 0 };
  for (const r of placement) {
    const n = num(r.n);
    if (!num(r.took)) placed.noTest += n;
    else if (num(r.opened) >= 2) placed.krakow += n;
    else if (num(r.opened) === 1) placed.lodz += n;
    else placed.warszawa += n;
  }

  const reminderDays = keys.map((k) => ({ day: k, sent: 0, failed: 0, blocked: 0, skipped: 0 }));
  const byDay = new Map(reminderDays.map((r) => [r.day, r]));
  for (const r of reminders) {
    const row = byDay.get(r.d);
    if (!row) continue;
    const n = num(r.n);
    if (r.status === 'SENT') row.sent += n;
    else if (r.status === 'BLOCKED') row.blocked += n;
    else if (r.status === 'SKIPPED') row.skipped += n;
    else row.failed += n; // FAILED, UNKNOWN, PENDING (зависшие) — «не доставлено»
  }

  const tot = totals[0] ?? ({} as (typeof totals)[number]);
  const f = funnel[0] ?? ({} as (typeof funnel)[number]);
  // Меток больше 12 — остальные одной строкой «прочие», чтобы сумма сходилась с числом новичков.
  const shownSources: Source[] = sources.map((s) => ({ key: s.k, count: num(s.n) }));
  const otherSources = num(f.total) - shownSources.reduce((a, s) => a + s.count, 0);
  if (otherSources > 0) shownSources.push({ key: 'other', count: otherSources });
  const dist = (rows: { k: string | null; n: Num }[]) => rows.map((r) => ({ key: r.k ?? 'none', count: num(r.n) })).sort((a, b) => b.count - a.count);

  return {
    days,
    tz: REPORT_TZ,
    from: firstDay,
    to: keys[keys.length - 1],
    daily: { days: keys, signups: series(signups), active: series(active), lessons: series(lessons), stars: series(revenue) },
    totals: {
      signups: { now: num(tot.signups), prev: num(tot.signupsPrev) },
      active: { now: num(tot.active), prev: num(tot.activePrev) },
      lessons: { now: num(tot.lessons), prev: num(tot.lessonsPrev) },
      stars: { now: num(tot.stars), prev: num(tot.starsPrev) },
    },
    funnel: {
      total: num(f.total),
      onboarded: num(f.onboarded),
      lesson: num(f.lesson),
      returnable: num(f.returnable),
      returned: num(f.returned),
      paid: num(f.paid),
    },
    sources: shownSources,
    placement: placed,
    selfLevels: dist(selfLevels),
    languages: dist(languages),
    reminders: { days: reminderDays, enabled: num(enabled[0]?.n), telegramUsers: num(enabled[0]?.telegram), quizInvites: num(quiz[0]?.n) },
  };
}
