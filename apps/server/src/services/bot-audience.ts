/**
 * Аудитория бота: кто писал боту (bot_contacts) и кто открывал Mini App (users), одним списком по telegram_id.
 * Запись контакта — из webhook (личный чат: команда, текст, кнопка; my_chat_member — блокировка и разблокировка).
 * Сбой записи не мешает боту ответить: вызывающий код ловит ошибку.
 */
import { sql, type SQL } from 'drizzle-orm';
import { db } from '../db';
import { botContacts } from '../db/schema';

export type TgFrom = { id: number; first_name?: string; last_name?: string; username?: string; language_code?: string; is_bot?: boolean };

/** Человек написал боту: обновить имя и время, запомнить первый параметр /start; блокировки уже нет. */
export async function recordBotContact(from: TgFrom, info: { command?: string | null; startParam?: string | null }, now = new Date()) {
  if (from.is_bot || !Number.isSafeInteger(from.id)) return;
  await db
    .insert(botContacts)
    .values({
      telegramId: from.id, firstName: (from.first_name ?? '').slice(0, 128), lastName: from.last_name?.slice(0, 128) ?? null, username: from.username?.slice(0, 64) ?? null,
      languageCode: from.language_code?.slice(0, 16) ?? null, startParam: info.startParam ?? null, lastCommand: info.command ?? null, firstSeenAt: now, lastSeenAt: now,
    })
    .onConflictDoUpdate({
      target: botContacts.telegramId,
      set: {
        firstName: sql`excluded.first_name`,
        lastName: sql`excluded.last_name`,
        username: sql`excluded.username`,
        languageCode: sql`coalesce(excluded.language_code, ${botContacts.languageCode})`,
        startParam: sql`coalesce(${botContacts.startParam}, excluded.start_param)`,
        lastCommand: sql`coalesce(excluded.last_command, ${botContacts.lastCommand})`,
        lastSeenAt: sql`excluded.last_seen_at`,
        blockedAt: null,
      },
    });
}

/** my_chat_member в личном чате: kicked — бот заблокирован, member — снова доступен. */
export async function recordBotBlocked(from: TgFrom, blocked: boolean, now = new Date()) {
  if (from.is_bot || !Number.isSafeInteger(from.id)) return;
  await db
    .insert(botContacts)
    .values({
      telegramId: from.id, firstName: (from.first_name ?? '').slice(0, 128), lastName: from.last_name?.slice(0, 128) ?? null, username: from.username?.slice(0, 64) ?? null,
      languageCode: from.language_code?.slice(0, 16) ?? null, firstSeenAt: now, lastSeenAt: now, blockedAt: blocked ? now : null,
    })
    .onConflictDoUpdate({
      target: botContacts.telegramId,
      set: { blockedAt: blocked ? now : null, ...(blocked ? {} : { lastSeenAt: now }) },
    });
}

export const AUDIENCE_FILTERS = ['all', 'bot', 'app', 'bot_only', 'blocked'] as const;
export type AudienceFilter = (typeof AUDIENCE_FILTERS)[number];

export type AudienceRow = {
  telegramId: string;
  userId: string | null;
  firstName: string;
  lastName: string | null;
  username: string | null;
  language: string | null;
  inBot: boolean;
  /** Открывал Mini App (у аккаунта по приглашению из бота — только после признаков приложения). */
  appOpened: boolean;
  botSince: number | null;
  botLast: number | null;
  blockedAt: number | null;
  startParam: string | null;
  lastCommand: string | null;
  appSince: number | null;
  appLast: number | null;
  banned: boolean;
  firstAt: number;
  lastAt: number;
  lessons: number;
  xp: number;
  city: string | null;
};

const DAY = 86_400_000;

/**
 * Все известные люди: объединение bot_contacts и users по telegram_id. Время первого и последнего контакта — самое раннее
 * и самое позднее из бота и приложения. Язык — из настроек приложения, иначе язык Telegram.
 * app_opened — человек открывал Mini App. Аккаунт есть не только у них: `/start ref_…` в боте создаёт его сразу (чтобы засчитать
 * приглашение). Такой аккаунт считается неоткрытым, пока нет признаков приложения: знакомство пройдено, есть сессия обучения
 * или новый вход (last_seen_at позже создания больше чем на минуту).
 */
const PEOPLE = sql`WITH people AS (SELECT telegram_id FROM bot_contacts UNION SELECT telegram_id FROM users),
p AS (
  SELECT pe.telegram_id AS tg, u.id AS user_id,
    coalesce(nullif(u.first_name, ''), bc.first_name, '') AS first_name,
    coalesce(u.last_name, bc.last_name) AS last_name,
    coalesce(u.username, bc.username) AS username,
    coalesce(s.ui_language, bc.language_code, u.language_code) AS language,
    bc.telegram_id IS NOT NULL AS in_bot, bc.first_seen_at AS bot_since, bc.last_seen_at AS bot_last, bc.blocked_at, bc.start_param, bc.last_command,
    u.created_at AS app_since, u.last_seen_at AS app_last, coalesce(u.is_banned, 0) AS banned,
    u.id IS NOT NULL AND NOT (
      coalesce(bc.start_param, '') LIKE 'ref!_%' ESCAPE '!' AND u.onboarded_at IS NULL
      AND abs(u.created_at - bc.first_seen_at) < 60000 AND u.last_seen_at - u.created_at < 60000
      AND NOT EXISTS (SELECT 1 FROM learning_sessions ls WHERE ls.user_id = u.id)
    ) AS app_opened,
    min(coalesce(bc.first_seen_at, u.created_at), coalesce(u.created_at, bc.first_seen_at)) AS first_at,
    max(coalesce(bc.last_seen_at, u.last_seen_at), coalesce(u.last_seen_at, bc.last_seen_at)) AS last_at,
    coalesce(pp.lessons_completed, 0) AS lessons, coalesce(pp.xp_total, 0) AS xp, c.name_pl AS city
  FROM people pe
  LEFT JOIN bot_contacts bc ON bc.telegram_id = pe.telegram_id
  LEFT JOIN users u ON u.telegram_id = pe.telegram_id
  LEFT JOIN user_settings s ON s.user_id = u.id
  LEFT JOIN player_progress pp ON pp.user_id = u.id
  LEFT JOIN cities c ON c.id = pp.current_city_id
)`;

function where(filter: AudienceFilter, days: number | null, search: string | null, now: number): SQL {
  const conds: SQL[] = [sql`1 = 1`];
  if (filter === 'bot') conds.push(sql`in_bot`);
  if (filter === 'app') conds.push(sql`app_opened`);
  if (filter === 'bot_only') conds.push(sql`in_bot AND NOT app_opened`);
  if (filter === 'blocked') conds.push(sql`blocked_at IS NOT NULL`);
  if (days) conds.push(sql`first_at >= ${now - days * DAY}`);
  if (search) {
    const s = `%${search.toLowerCase().replace(/^@/, '')}%`;
    conds.push(/^\d+$/.test(search) ? sql`(tg = ${Number(search)} OR lower(first_name) LIKE ${s})` : sql`(lower(first_name) LIKE ${s} OR lower(coalesce(last_name, '')) LIKE ${s} OR lower(coalesce(username, '')) LIKE ${s})`);
  }
  return sql.join(conds, sql` AND `);
}

export async function audience(q: { filter: AudienceFilter; days: number | null; search: string | null; skip: number; limit: number }, now = Date.now()) {
  const cond = where(q.filter, q.days, q.search, now);
  const [rows, total, summary] = await Promise.all([
    db.all<Record<string, unknown>>(sql`${PEOPLE} SELECT * FROM p WHERE ${cond} ORDER BY first_at DESC, tg DESC LIMIT ${q.limit} OFFSET ${q.skip}`),
    db.all<{ n: number }>(sql`${PEOPLE} SELECT count(*) AS n FROM p WHERE ${cond}`),
    db.all<Record<string, number | null>>(sql`${PEOPLE} SELECT
      count(*) AS total,
      sum(CASE WHEN in_bot THEN 1 ELSE 0 END) AS bot,
      sum(CASE WHEN app_opened THEN 1 ELSE 0 END) AS app,
      sum(CASE WHEN in_bot AND NOT app_opened THEN 1 ELSE 0 END) AS bot_only,
      sum(CASE WHEN blocked_at IS NOT NULL THEN 1 ELSE 0 END) AS blocked,
      sum(CASE WHEN first_at >= ${now - DAY} THEN 1 ELSE 0 END) AS new1,
      sum(CASE WHEN first_at >= ${now - 7 * DAY} THEN 1 ELSE 0 END) AS new7,
      sum(CASE WHEN first_at >= ${now - 30 * DAY} THEN 1 ELSE 0 END) AS new30,
      sum(CASE WHEN last_at >= ${now - 7 * DAY} THEN 1 ELSE 0 END) AS active7
      FROM p`),
  ]);
  const num = (v: unknown) => (v == null ? null : Number(v));
  const items: AudienceRow[] = rows.map((r) => ({
    telegramId: String(r.tg),
    userId: (r.user_id as string | null) ?? null,
    firstName: String(r.first_name ?? ''),
    lastName: (r.last_name as string | null) ?? null,
    username: (r.username as string | null) ?? null,
    language: (r.language as string | null) ?? null,
    inBot: !!Number(r.in_bot),
    appOpened: !!Number(r.app_opened),
    botSince: num(r.bot_since),
    botLast: num(r.bot_last),
    blockedAt: num(r.blocked_at),
    startParam: (r.start_param as string | null) ?? null,
    lastCommand: (r.last_command as string | null) ?? null,
    appSince: num(r.app_since),
    appLast: num(r.app_last),
    banned: !!Number(r.banned),
    firstAt: Number(r.first_at),
    lastAt: Number(r.last_at),
    lessons: Number(r.lessons ?? 0),
    xp: Number(r.xp ?? 0),
    city: (r.city as string | null) ?? null,
  }));
  const s = summary[0] ?? {};
  return {
    summary: {
      total: Number(s.total ?? 0), bot: Number(s.bot ?? 0), app: Number(s.app ?? 0), botOnly: Number(s.bot_only ?? 0), blocked: Number(s.blocked ?? 0),
      new1: Number(s.new1 ?? 0), new7: Number(s.new7 ?? 0), new30: Number(s.new30 ?? 0), active7: Number(s.active7 ?? 0),
    },
    total: Number(total[0]?.n ?? 0),
    items,
  };
}
