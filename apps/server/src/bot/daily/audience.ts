/**
 * Кто получает вопрос дня — одно правило для отправки, подсчёта охвата в админке и подавления напоминаний.
 *
 * Люди — все, кто писал боту (bot_contacts), и игроки приложения из Telegram (users, telegram_id > 0), одним списком по telegram_id
 * (человек и в боте, и в приложении — одна строка). Не получают:
 *  • banned — заблокирован админом;
 *  • opted_out — «🔕 Не присылать вопрос дня», /stop или выключатель в приложении (bot_quiz_players.push_enabled = 0);
 *  • blocked — заблокировал бота (bot_contacts.blocked_at; снимается, когда снова пишет боту);
 *  • no_chat — Telegram отказал «нет чата с ботом», и с тех пор человек боту не писал;
 *  • paused — 3 вопроса подряд без ответа, и с последней отправки человек не писал боту и не открывал приложение.
 * Напоминания в приложении («уведомления») на вопрос дня не влияют: владелец решил «всем».
 */
import { sql } from 'drizzle-orm';
import type { UiLang } from '@polski-go/shared';
import { db } from '../../db';
import { pickLang } from '../data';
import type { DailyLevel } from './state';

export const DAILY_IGNORED_MAX = 3;

export type DailyPerson = {
  telegramId: number;
  userId: string | null;
  banned: boolean;
  uiLanguage: string | null;
  contactLang: string | null;
  blockedAt: Date | null;
  contactSeenAt: Date | null;
  appSeenAt: Date | null;
  pushEnabled: boolean | null;
  ignored: number;
  lastSentAt: Date | null;
  noChatAt: Date | null;
  languageLevel: string | null;
  placementLevel: string | null;
  selfLevel: string | null;
  streakCurrent: number | null;
  lastActiveDay: string | null;
  timezone: string | null;
  firstName: string;
  username: string | null;
};

export type Eligibility = 'ok' | 'banned' | 'opted_out' | 'blocked' | 'paused' | 'no_chat';
export const EXCLUSIONS = ['banned', 'opted_out', 'blocked', 'no_chat', 'paused'] as const;

const ms = (d: Date | null) => d?.getTime() ?? 0;

export function dailyEligibility(p: DailyPerson): Eligibility {
  if (p.banned) return 'banned';
  if (p.pushEnabled === false) return 'opted_out';
  if (p.blockedAt) return 'blocked';
  if (p.noChatAt && ms(p.contactSeenAt) <= ms(p.noChatAt)) return 'no_chat';
  if (p.ignored >= DAILY_IGNORED_MAX && p.lastSentAt && Math.max(ms(p.contactSeenAt), ms(p.appSeenAt)) <= ms(p.lastSentAt)) return 'paused';
  return 'ok';
}

/** Уровень вопроса: подтверждённый экзаменом (кроме A0), иначе вступительный тест или самооценка; без уровня — A1. */
export function quizLevel(languageLevel: string | null, placement: string | null, self: string | null): DailyLevel {
  const level = languageLevel && languageLevel !== 'A0' ? languageLevel : (placement ?? self);
  if (level === 'A2') return 'A2';
  if (level && ['B1', 'B2', 'C1', 'C2'].includes(level)) return 'B1';
  return 'A1';
}

export const personLevel = (p: DailyPerson) => quizLevel(p.languageLevel, p.placementLevel, p.selfLevel);
export const personLang = (p: DailyPerson): UiLang => pickLang(p.uiLanguage, p.contactLang);

type Raw = Record<string, number | string | null>;
const date = (v: unknown) => (v === null || v === undefined ? null : new Date(Number(v)));
const toPerson = (r: Raw): DailyPerson => ({
  telegramId: Number(r.telegram_id),
  userId: (r.user_id as string | null) ?? null,
  banned: Number(r.banned ?? 0) === 1,
  uiLanguage: (r.ui_language as string | null) ?? null,
  contactLang: (r.contact_lang as string | null) ?? null,
  blockedAt: date(r.blocked_at),
  contactSeenAt: date(r.contact_seen_at),
  appSeenAt: date(r.app_seen_at),
  pushEnabled: r.push_enabled === null || r.push_enabled === undefined ? null : Number(r.push_enabled) === 1,
  ignored: Number(r.ignored ?? 0),
  lastSentAt: date(r.last_sent_at),
  noChatAt: date(r.no_chat_at),
  languageLevel: (r.language_level as string | null) ?? null,
  placementLevel: (r.placement_level as string | null) ?? null,
  selfLevel: (r.self_level as string | null) ?? null,
  streakCurrent: r.streak_current === null || r.streak_current === undefined ? null : Number(r.streak_current),
  lastActiveDay: (r.last_active_day as string | null) ?? null,
  timezone: (r.timezone as string | null) ?? null,
  firstName: String(r.u_first || r.c_first || ''),
  username: ((r.u_username || r.c_username) as string | null) ?? null,
});

/**
 * Люди с telegram_id > after, по порядку, не больше limit (-1 — все). Каждая таблица отдаёт свои первые `limit` id, общий список
 * обрезается до `limit`: так ни один id не пропускается, а запрос читает несколько сотен строк, а не всю базу.
 */
function selectPeople(after: number, limit: number) {
  return sql`
    WITH ids AS (
      SELECT telegram_id FROM (SELECT telegram_id FROM bot_contacts WHERE telegram_id > ${after} ORDER BY telegram_id LIMIT ${limit})
      UNION
      SELECT telegram_id FROM (SELECT telegram_id FROM users WHERE telegram_id > ${after} ORDER BY telegram_id LIMIT ${limit})
      ORDER BY telegram_id LIMIT ${limit}
    )
    SELECT ids.telegram_id AS telegram_id, u.id AS user_id, u.is_banned AS banned, u.last_seen_at AS app_seen_at, u.first_name AS u_first, u.username AS u_username,
      s.ui_language AS ui_language, s.timezone AS timezone,
      c.language_code AS contact_lang, c.blocked_at AS blocked_at, c.last_seen_at AS contact_seen_at, c.first_name AS c_first, c.username AS c_username,
      q.push_enabled AS push_enabled, d.ignored AS ignored, d.last_sent_at AS last_sent_at, d.no_chat_at AS no_chat_at,
      p.language_level AS language_level, p.streak_current AS streak_current, p.last_active_day AS last_active_day,
      pr.placement_level AS placement_level, pr.self_level AS self_level
    FROM ids
    LEFT JOIN users u ON u.telegram_id = ids.telegram_id
    LEFT JOIN user_settings s ON s.user_id = u.id
    LEFT JOIN bot_contacts c ON c.telegram_id = ids.telegram_id
    LEFT JOIN bot_quiz_players q ON q.telegram_id = ids.telegram_id
    LEFT JOIN daily_quiz_people d ON d.telegram_id = ids.telegram_id
    LEFT JOIN player_progress p ON p.user_id = u.id
    LEFT JOIN user_profiles pr ON pr.user_id = u.id
    ORDER BY ids.telegram_id`;
}

export async function scanPeople(after: number, limit: number): Promise<DailyPerson[]> {
  return (await db.all<Raw>(selectPeople(Math.max(0, after), limit))).map(toPerson);
}

export async function allPeople(): Promise<DailyPerson[]> {
  return scanPeople(0, -1);
}

export async function personByTelegramId(telegramId: number): Promise<DailyPerson | null> {
  const rows = await scanPeople(telegramId - 1, 1);
  return rows[0]?.telegramId === telegramId ? rows[0] : null;
}

/** Охват рассылки для админки: сколько получат (по уровням и языкам) и сколько исключено и почему. */
export async function dailyAudience() {
  const people = await allPeople();
  const byLevel: Record<DailyLevel, number> = { A1: 0, A2: 0, B1: 0 };
  const byLang: Record<string, number> = {};
  const excluded = Object.fromEntries(EXCLUSIONS.map((e) => [e, 0])) as Record<(typeof EXCLUSIONS)[number], number>;
  let total = 0;
  for (const p of people) {
    const e = dailyEligibility(p);
    if (e !== 'ok') {
      excluded[e]++;
      continue;
    }
    total++;
    byLevel[personLevel(p)]++;
    const lang = personLang(p);
    byLang[lang] = (byLang[lang] ?? 0) + 1;
  }
  return { total, byLevel, byLang, excluded };
}
