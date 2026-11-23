/**
 * Источники трафика (2026-11-23): откуда человек пришёл — TikTok, Instagram, Telegram, реклама, YouTube, приглашение друга,
 * сайт/Android или без метки. Админка «Источники» (apps/admin/src/Traffic.tsx).
 *
 * Как устроено:
 *  • Владелец создаёт ссылку с меткой (traffic_links): канал, название, код. Ссылка ведёт в бота (t.me/<бот>?start=<код>) или
 *    сразу в Mini App (t.me/<бот>/<приложение>?startapp=<код>); вне Telegram — сайт с ?startapp=<код>.
 *  • Первое касание человека (user_sources) пишется при /start в боте, входе в Mini App и создании гостя. Метка — первая непустая.
 *  • Канал считается по метке: ссылка владельца → её канал; приглашение (ref_…) → «приглашение»; известные начала кода
 *    (tt_, ig_, tg_, ad_, yt_) → свой канал, даже если ссылку не заводили в админке; гость без метки → «сайт / Android»;
 *    без метки → «без метки (нашли сами)».
 *  • Отчёт: по каналам и ссылкам — сколько пришло, дошли до бота и приложения, прошли знакомство, закончили урок, вернулись
 *    в другой день, оплатили Premium (и сколько Stars), заблокировали бота; по дням — новые люди по каналам; последние пришедшие.
 */
import { and, desc, eq, gt, isNull, sql } from 'drizzle-orm';
import { db } from '../db';
import { TRAFFIC_CHANNELS, trafficLinks, userSources } from '../db/schema';
import { config } from '../env';
import { badRequest, notFound } from '../lib/errors';
import { tzOffsetMs } from './admin-insights';

export type TrafficChannel = (typeof TRAFFIC_CHANNELS)[number];
export { TRAFFIC_CHANNELS };

const DAY_MS = 86_400_000;
type Num = number | string | null;
const num = (v: Num | undefined) => Number(v ?? 0) || 0;

/** Метки, которые ставит само приложение и бот (кнопки, экраны, вопрос дня): человек пришёл изнутри Telegram. */
const TELEGRAM_INTERNAL = /^(screen_|quiz$|lesson_|story_|premium$|daily|channel)/i;
/** Начала кодов для каналов — работают и без ссылки в админке (например, владелец сам написал ?start=tt_video5). */
const PREFIXES: [RegExp, TrafficChannel][] = [
  [/^(ads?|promo|tgads)([_-]|$)/i, 'ads'],
  [/^(tt|tiktok)([_-]|$)/i, 'tiktok'],
  [/^(ig|insta|instagram)([_-]|$)/i, 'instagram'],
  [/^(yt|youtube)([_-]|$)/i, 'youtube'],
  [/^(tg|telegram)([_-]|$)/i, 'telegram'],
  [/^(web|site|android|play)([_-]|$)/i, 'web'],
];

/** Код новой ссылки: латиница, цифры, _ и -; не совпадает с метками самого приложения и приглашений. */
export const LINK_CODE = /^[a-z0-9][a-z0-9_-]{1,39}$/;
const RESERVED = /^(ref_|screen_|lesson_|story_|quiz$|premium$|paysupport$|daily)/;

export type LinkInfo = { channel: TrafficChannel };

/** Канал по метке первого касания. Одно правило для отчёта, карточки игрока и «Обзора». */
export function channelOf(param: string | null | undefined, opts: { referred?: boolean; guest?: boolean }, links: Map<string, LinkInfo>): TrafficChannel {
  if (opts.referred || param?.startsWith('ref_')) return 'invite';
  if (param) {
    const link = links.get(param.toLowerCase());
    if (link) return link.channel;
    for (const [re, ch] of PREFIXES) if (re.test(param)) return ch;
    if (TELEGRAM_INTERNAL.test(param)) return 'telegram';
    return 'other';
  }
  return opts.guest ? 'web' : 'direct';
}

export async function linkMap(): Promise<Map<string, LinkInfo>> {
  const rows = await db.select({ code: trafficLinks.code, channel: trafficLinks.channel }).from(trafficLinks).catch(() => []);
  return new Map(rows.map((r) => [r.code, { channel: r.channel }]));
}

/**
 * Записать касание. Новый человек — строка с меткой (или без); известный без метки — метка дописывается, если пришла в первые сутки
 * (человек нашёл бота сам, а через минуту открыл ссылку); метка уже есть — не меняется. Ошибка записи (нет таблицы в старой копии базы, сбой D1) не ломает ни вход, ни бота.
 */
export async function recordTouch(telegramId: number, param: string | null | undefined, via: 'bot' | 'app' | 'web', now = new Date()) {
  const p = param && /^[A-Za-z0-9_-]{1,64}$/.test(param) && param !== 'paysupport' ? param : null;
  try {
    await db
      .insert(userSources)
      .values({ telegramId, param: p, via, firstSeenAt: now, paramAt: p ? now : null })
      .onConflictDoUpdate({
        target: userSources.telegramId,
        set: { param: p, paramAt: now },
        // Метка дописывается только в первые сутки: позже это уже кнопка внутри приложения или бота, а не то, откуда человек пришёл.
        setWhere: p ? and(isNull(userSources.param), gt(userSources.firstSeenAt, new Date(now.getTime() - DAY_MS))) : sql`0`,
      });
  } catch (e) {
    console.warn('traffic: touch not recorded', (e as Error).message);
  }
}

// ───────────── Ссылки ─────────────

export function linkUrls(code: string) {
  const bot = config.botUsername;
  return {
    bot: `https://t.me/${bot}?start=${code}`,
    app: `https://t.me/${bot}/${config.appShortName}?startapp=${code}`,
    web: `${config.webAppUrl.replace(/\/$/, '')}/?startapp=${code}`,
  };
}

export async function createLink(input: { code: string; channel: TrafficChannel; title: string; note?: string | null; cost?: number | null; createdBy?: string | null }) {
  const code = input.code.trim().toLowerCase();
  if (!LINK_CODE.test(code)) throw badRequest('bad_link_code');
  if (RESERVED.test(code)) throw badRequest('reserved_link_code');
  if (await db.query.trafficLinks.findFirst({ where: eq(trafficLinks.code, code), columns: { id: true } })) throw badRequest('link_code_taken');
  const [row] = await db
    .insert(trafficLinks)
    .values({ code, channel: input.channel, title: input.title.trim(), note: input.note?.trim() || null, cost: input.cost ?? null, createdBy: input.createdBy ?? null })
    .returning();
  return row;
}

export async function updateLink(id: string, patch: { title?: string; channel?: TrafficChannel; note?: string | null; cost?: number | null; archived?: boolean }) {
  const row = await db.query.trafficLinks.findFirst({ where: eq(trafficLinks.id, id) });
  if (!row) throw notFound('link_not_found');
  const set: Partial<typeof trafficLinks.$inferInsert> = {};
  if (patch.title != null) set.title = patch.title.trim();
  if (patch.channel) set.channel = patch.channel;
  if (patch.note !== undefined) set.note = patch.note?.trim() || null;
  if (patch.cost !== undefined) set.cost = patch.cost;
  if (patch.archived !== undefined) set.archivedAt = patch.archived ? new Date() : null;
  if (Object.keys(set).length) await db.update(trafficLinks).set(set).where(eq(trafficLinks.id, id));
}

// ───────────── Отчёт ─────────────

export type Funnel = { people: number; bot: number; app: number; onboarded: number; lesson: number; returnable: number; returned: number; paid: number; stars: number; blocked: number };
const emptyFunnel = (): Funnel => ({ people: 0, bot: 0, app: 0, onboarded: 0, lesson: 0, returnable: 0, returned: 0, paid: 0, stars: 0, blocked: 0 });
const addTo = (f: Funnel, r: Funnel) => {
  for (const k of Object.keys(f) as (keyof Funnel)[]) f[k] += r[k];
};

type CohortRow = { param: string | null; ref: Num; guest: Num } & Record<keyof Funnel, Num>;

/** Воронка по меткам для тех, чьё первое касание в [from, to). «Вернулся» — занимался в другой день после дня регистрации. */
async function cohort(from: number | null, todayStart: number, offSec: number) {
  return db.all<CohortRow>(sql`
    SELECT s.param AS param,
      CASE WHEN u.referred_by_id IS NOT NULL THEN 1 ELSE 0 END AS ref,
      CASE WHEN s.telegram_id < 0 THEN 1 ELSE 0 END AS guest,
      COUNT(*) AS people,
      SUM(CASE WHEN b.telegram_id IS NOT NULL THEN 1 ELSE 0 END) AS bot,
      SUM(CASE WHEN u.id IS NOT NULL THEN 1 ELSE 0 END) AS app,
      SUM(CASE WHEN u.onboarded_at IS NOT NULL THEN 1 ELSE 0 END) AS onboarded,
      SUM(CASE WHEN u.id IS NOT NULL AND EXISTS (SELECT 1 FROM learning_sessions ls WHERE ls.user_id = u.id AND ls.mode = 'LESSON' AND ls.status = 'FINISHED') THEN 1 ELSE 0 END) AS lesson,
      SUM(CASE WHEN u.id IS NOT NULL AND u.created_at < ${todayStart} THEN 1 ELSE 0 END) AS returnable,
      SUM(CASE WHEN u.id IS NOT NULL AND u.created_at < ${todayStart} AND EXISTS (
        SELECT 1 FROM daily_activity a WHERE a.user_id = u.id AND a.day > strftime('%Y-%m-%d', u.created_at / 1000 + ${offSec}, 'unixepoch')
      ) THEN 1 ELSE 0 END) AS returned,
      SUM(CASE WHEN EXISTS (SELECT 1 FROM payment_events p WHERE p.user_id = u.id AND p.type = 'SUCCESSFUL_PAYMENT' AND p.error IS NULL) THEN 1 ELSE 0 END) AS paid,
      COALESCE(SUM((SELECT SUM(p.amount) FROM payment_events p WHERE p.user_id = u.id AND p.type = 'SUCCESSFUL_PAYMENT' AND p.error IS NULL)), 0) AS stars,
      SUM(CASE WHEN b.blocked_at IS NOT NULL THEN 1 ELSE 0 END) AS blocked
    FROM user_sources s
      LEFT JOIN users u ON u.telegram_id = s.telegram_id
      LEFT JOIN bot_contacts b ON b.telegram_id = s.telegram_id
    WHERE ${from == null ? sql`1` : sql`s.first_seen_at >= ${from}`}
    GROUP BY 1, 2, 3 LIMIT 5000`);
}

const toFunnel = (r: CohortRow): Funnel => ({
  people: num(r.people), bot: num(r.bot), app: num(r.app), onboarded: num(r.onboarded), lesson: num(r.lesson),
  returnable: num(r.returnable), returned: num(r.returned), paid: num(r.paid), stars: num(r.stars), blocked: num(r.blocked),
});

export async function trafficReport(now: Date, days: number) {
  const off = tzOffsetMs(now);
  const offSec = Math.round(off / 1000);
  const dayKey = (ms: number) => new Date(ms + off).toISOString().slice(0, 10);
  const keys = Array.from({ length: days }, (_, i) => dayKey(now.getTime() - (days - 1 - i) * DAY_MS));
  const since = Date.parse(`${keys[0]}T00:00:00Z`) - off;
  const todayStart = Date.parse(`${keys[days - 1]}T00:00:00Z`) - off;
  const prevSince = since - days * DAY_MS;

  const [links, period, allTime, daily, recent, prev] = await Promise.all([
    db.select().from(trafficLinks).orderBy(desc(trafficLinks.createdAt)),
    cohort(since, todayStart, offSec),
    cohort(null, todayStart, offSec),
    db.all<{ d: string; param: string | null; ref: Num; guest: Num; n: Num }>(sql`
      SELECT strftime('%Y-%m-%d', s.first_seen_at / 1000 + ${offSec}, 'unixepoch') AS d, s.param AS param,
        CASE WHEN u.referred_by_id IS NOT NULL THEN 1 ELSE 0 END AS ref, CASE WHEN s.telegram_id < 0 THEN 1 ELSE 0 END AS guest, COUNT(*) AS n
      FROM user_sources s LEFT JOIN users u ON u.telegram_id = s.telegram_id
      WHERE s.first_seen_at >= ${since} GROUP BY 1, 2, 3, 4 LIMIT 20000`),
    db.all<{ telegramId: Num; param: string | null; via: string; at: Num; uid: string | null; name: string | null; username: string | null; ref: Num; onboarded: Num; blocked: Num }>(sql`
      SELECT s.telegram_id AS telegramId, s.param AS param, s.via AS via, s.first_seen_at AS at, u.id AS uid,
        COALESCE(NULLIF(u.first_name, ''), b.first_name) AS name, COALESCE(u.username, b.username) AS username,
        CASE WHEN u.referred_by_id IS NOT NULL THEN 1 ELSE 0 END AS ref, CASE WHEN u.onboarded_at IS NOT NULL THEN 1 ELSE 0 END AS onboarded,
        CASE WHEN b.blocked_at IS NOT NULL THEN 1 ELSE 0 END AS blocked
      FROM user_sources s LEFT JOIN users u ON u.telegram_id = s.telegram_id LEFT JOIN bot_contacts b ON b.telegram_id = s.telegram_id
      ORDER BY s.first_seen_at DESC LIMIT 30`),
    db.all<{ param: string | null; ref: Num; guest: Num; n: Num }>(sql`
      SELECT s.param AS param, CASE WHEN u.referred_by_id IS NOT NULL THEN 1 ELSE 0 END AS ref, CASE WHEN s.telegram_id < 0 THEN 1 ELSE 0 END AS guest, COUNT(*) AS n
      FROM user_sources s LEFT JOIN users u ON u.telegram_id = s.telegram_id
      WHERE s.first_seen_at >= ${prevSince} AND s.first_seen_at < ${since} GROUP BY 1, 2, 3 LIMIT 5000`),
  ]);
  const map = new Map(links.map((l) => [l.code, { channel: l.channel }]));
  const ch = (r: { param: string | null; ref: Num; guest: Num }) => channelOf(r.param, { referred: num(r.ref) > 0, guest: num(r.guest) > 0 }, map);

  const channels = new Map<TrafficChannel, Funnel & { prev: number }>(TRAFFIC_CHANNELS.map((c) => [c, { ...emptyFunnel(), prev: 0 }]));
  const total = emptyFunnel();
  for (const r of period) {
    const f = toFunnel(r);
    addTo(channels.get(ch(r))!, f);
    addTo(total, f);
  }
  for (const r of prev) channels.get(ch(r))!.prev += num(r.n);

  // Ссылки: за период и за всё время (по точному коду метки).
  const byCode = (rows: CohortRow[]) => {
    const m = new Map<string, Funnel>();
    for (const r of rows) {
      if (!r.param) continue;
      const k = r.param.toLowerCase();
      if (!map.has(k)) continue;
      const f = m.get(k) ?? emptyFunnel();
      addTo(f, toFunnel(r));
      m.set(k, f);
    }
    return m;
  };
  const linkPeriod = byCode(period);
  const linkAll = byCode(allTime);

  // Метки, которых нет среди ссылок (владелец написал вручную или старые): видно, что они есть и куда отнесены.
  const loose = new Map<string, { param: string; channel: TrafficChannel; people: number }>();
  for (const r of period) {
    if (!r.param || map.has(r.param.toLowerCase()) || num(r.ref) > 0 || r.param.startsWith('ref_')) continue;
    const e = loose.get(r.param) ?? { param: r.param, channel: ch(r), people: 0 };
    e.people += num(r.people);
    loose.set(r.param, e);
  }

  const dailyBy = new Map(keys.map((k) => [k, Object.fromEntries(TRAFFIC_CHANNELS.map((c) => [c, 0])) as Record<TrafficChannel, number>]));
  for (const r of daily) {
    const row = dailyBy.get(r.d);
    if (row) row[ch(r)] += num(r.n);
  }

  return {
    period: { days, from: keys[0], to: keys[days - 1] },
    total,
    channels: TRAFFIC_CHANNELS.map((key) => ({ key, ...channels.get(key)! })),
    days: keys,
    daily: TRAFFIC_CHANNELS.map((key) => ({ key, values: keys.map((k) => dailyBy.get(k)![key]) })),
    links: links.map((l) => ({
      ...l,
      urls: linkUrls(l.code),
      period: linkPeriod.get(l.code) ?? emptyFunnel(),
      allTime: linkAll.get(l.code) ?? emptyFunnel(),
    })),
    loose: [...loose.values()].sort((a, b) => b.people - a.people).slice(0, 20),
    recent: recent.map((r) => ({
      telegramId: num(r.telegramId), userId: r.uid, name: r.name, username: r.username, param: r.param, via: r.via, at: new Date(num(r.at)).toISOString(),
      channel: channelOf(r.param, { referred: num(r.ref) > 0, guest: num(r.telegramId) < 0 }, map), onboarded: num(r.onboarded) > 0, blocked: num(r.blocked) > 0,
    })),
    hints: { bot: config.botUsername, app: config.appShortName },
  };
}

/** Канал одного человека (карточка игрока). */
export async function sourceOf(telegramId: number, referred: boolean) {
  const row = await db.query.userSources.findFirst({ where: eq(userSources.telegramId, telegramId) }).catch(() => undefined);
  const map = await linkMap();
  const link = row?.param ? await db.query.trafficLinks.findFirst({ where: and(eq(trafficLinks.code, row.param.toLowerCase())) }).catch(() => undefined) : undefined;
  return {
    channel: channelOf(row?.param, { referred, guest: telegramId < 0 }, map),
    param: row?.param ?? null,
    via: row?.via ?? null,
    firstSeenAt: row?.firstSeenAt ?? null,
    link: link ? { id: link.id, title: link.title } : null,
  };
}

/** «Обзор»: новички периода (зарегистрировались в приложении) по каналам — то же правило, что в отчёте «Источники». */
export async function newPlayerChannels(now: Date, days: number): Promise<{ key: TrafficChannel; count: number }[]> {
  const off = tzOffsetMs(now);
  const first = new Date(now.getTime() - (days - 1) * DAY_MS + off).toISOString().slice(0, 10);
  const since = Date.parse(`${first}T00:00:00Z`) - off;
  const rows = await db
    .all<{ param: string | null; ref: Num; guest: Num; n: Num }>(sql`
      SELECT COALESCE(s.param, NULLIF(b.start_param, '')) AS param, CASE WHEN u.referred_by_id IS NOT NULL THEN 1 ELSE 0 END AS ref,
        CASE WHEN u.telegram_id < 0 THEN 1 ELSE 0 END AS guest, COUNT(*) AS n
      FROM users u LEFT JOIN user_sources s ON s.telegram_id = u.telegram_id LEFT JOIN bot_contacts b ON b.telegram_id = u.telegram_id
      WHERE u.created_at >= ${since} GROUP BY 1, 2, 3 LIMIT 5000`)
    .catch(() => []);
  const map = await linkMap();
  const out = new Map<TrafficChannel, number>();
  for (const r of rows) {
    const k = channelOf(r.param, { referred: num(r.ref) > 0, guest: num(r.guest) > 0 }, map);
    out.set(k, (out.get(k) ?? 0) + num(r.n));
  }
  return [...out].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count);
}
