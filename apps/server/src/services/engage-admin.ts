/**
 * Админка «Карточки бота» (docs/superpowers/specs/2026-11-24-engagement-design.md, разделы 7–8): по видам карточек — отправлено, дошло,
 * открыли, занимались в тот же день и сторож «отпугиваем?» (выключили карточки и заблокировали бота за 48 часов); мост «вопрос дня →
 * разминка»; воронка первого урока новичков — на каком задании бросают. Плюс «прислать себе» без записи в статистику.
 */
import { and, count, eq, gte, inArray, isNotNull, sql } from 'drizzle-orm';
import { addDays, type UiLang } from '@polski-go/shared';
import { db } from '../db';
import { botContacts, dailyActivity, dailyQuizSends, engagePeople, engageSends, ENGAGE_KINDS, learningSessions, type EngageKind } from '../db/schema';
import { MISSIONS } from '../content/missions';
import { TelegramError } from '../lib/telegram';
import { badRequest } from '../lib/errors';
import { DAILY_COPY } from '../bot/daily/copy';
import { warsawDay } from '../bot/daily/state';
import { readEngageState } from '../bot/engage/state';
import { cardView, type CardData } from '../bot/engage/views';
import { sendWithPhoto } from '../bot/quiz/engine';
import { botImageUrl } from '../bot/catalog';
import { doneCount } from './active-lesson';
import { COMEBACK_GIFT } from './comeback';

export type KindStats = { sent: number; delivered: number; opened: number; studiedSameDay: number; optedOut48h: number; blocked48h: number };
export type FirstLessonRow = { status: 'ACTIVE' | 'FINISHED' | 'ABANDONED'; total: number; answered: number; lastType: string | null };

const H48 = 48 * 3600_000;
const IN_CHUNK = 90;

/** Воронка первого урока: открыли → ответили на 1-е задание → дошли до 4-го → закончили; где уходят (номер задания, вид). */
export function firstLessonFunnel(rows: FirstLessonRow[]) {
  const finished = rows.filter((r) => r.status === 'FINISHED').length;
  const drops = new Map<string, { index: number; type: string; n: number }>();
  for (const r of rows) {
    if (r.status === 'FINISHED' || r.answered === 0 || !r.lastType) continue;
    const key = `${r.answered}|${r.lastType}`;
    const d = drops.get(key) ?? { index: r.answered, type: r.lastType, n: 0 };
    d.n++;
    drops.set(key, d);
  }
  return {
    opened: rows.length,
    answered1: rows.filter((r) => r.answered >= 1).length,
    reached4: rows.filter((r) => r.answered >= 4).length,
    finished,
    dropAt: [...drops.values()].sort((a, b) => b.n - a.n || a.index - b.index).slice(0, 5),
  };
}

async function chunked<T, R>(ids: T[], fn: (chunk: T[]) => Promise<R[]>): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < ids.length; i += IN_CHUNK) out.push(...(await fn(ids.slice(i, i + IN_CHUNK))));
  return out;
}

async function kindStats(since: string): Promise<Record<EngageKind, KindStats>> {
  const rows = await db.select().from(engageSends).where(gte(engageSends.day, since));
  const tgs = [...new Set(rows.map((r) => r.telegramId))];
  const users = [...new Set(rows.map((r) => r.userId).filter((u): u is string => !!u))];
  const [people, contacts, activity] = await Promise.all([
    chunked(tgs, (c) => db.select({ tg: engagePeople.telegramId, at: engagePeople.optedOutAt }).from(engagePeople).where(inArray(engagePeople.telegramId, c))),
    chunked(tgs, (c) => db.select({ tg: botContacts.telegramId, at: botContacts.blockedAt }).from(botContacts).where(inArray(botContacts.telegramId, c))),
    chunked(users, (c) => db.select({ u: dailyActivity.userId, day: dailyActivity.day }).from(dailyActivity).where(and(inArray(dailyActivity.userId, c), gte(dailyActivity.day, since)))),
  ]);
  const optedAt = new Map(people.map((p) => [p.tg, p.at]));
  const blockedAt = new Map(contacts.map((p) => [p.tg, p.at]));
  const studied = new Set(activity.map((a) => `${a.u}|${a.day}`));
  const within = (at: Date | null | undefined, from: Date | null) => !!at && !!from && at.getTime() >= from.getTime() && at.getTime() - from.getTime() <= H48;
  const out = Object.fromEntries(ENGAGE_KINDS.map((k) => [k, { sent: 0, delivered: 0, opened: 0, studiedSameDay: 0, optedOut48h: 0, blocked48h: 0 }])) as Record<EngageKind, KindStats>;
  for (const r of rows) {
    const s = out[r.kind];
    s.sent++;
    if (r.status !== 'SENT') continue;
    s.delivered++;
    if (r.openedAt) s.opened++;
    if (r.userId && studied.has(`${r.userId}|${r.day}`)) s.studiedSameDay++;
    if (within(optedAt.get(r.telegramId), r.sentAt)) s.optedOut48h++;
    if (within(blockedAt.get(r.telegramId), r.sentAt)) s.blocked48h++;
  }
  return out;
}

async function bridgeStats(since: string, sinceAt: Date) {
  const [answered, started, finished] = await Promise.all([
    db.select({ n: count() }).from(dailyQuizSends).where(and(gte(dailyQuizSends.day, since), isNotNull(dailyQuizSends.answeredAt))).get(),
    db.select({ n: count() }).from(learningSessions).where(and(eq(learningSessions.mode, 'WARMUP'), gte(learningSessions.startedAt, sinceAt))).get(),
    db.select({ n: count() }).from(learningSessions).where(and(eq(learningSessions.mode, 'WARMUP'), eq(learningSessions.status, 'FINISHED'), gte(learningSessions.startedAt, sinceAt))).get(),
  ]);
  return { answered: answered?.n ?? 0, warmupStarted: started?.n ?? 0, warmupFinished: finished?.n ?? 0 };
}

/** Первый урок новичков периода: первый сеанс урока каждого зарегистрированного за период. */
async function firstLessonRows(sinceAt: Date): Promise<FirstLessonRow[]> {
  const rows = await db.all<{ user_id: string; status: FirstLessonRow['status']; items: string; state: string }>(sql`
    SELECT s.user_id AS user_id, s.status AS status, s.items AS items, s.state AS state
    FROM learning_sessions s JOIN users u ON u.id = s.user_id
    WHERE u.created_at >= ${sinceAt.getTime()} AND s.mode = 'LESSON'
    ORDER BY s.started_at`);
  const seen = new Set<string>();
  const out: FirstLessonRow[] = [];
  for (const r of rows) {
    if (seen.has(r.user_id)) continue;
    seen.add(r.user_id);
    const items = JSON.parse(r.items || '[]') as { key: string; type: string }[];
    const state = JSON.parse(r.state || '{}');
    const answered = doneCount(items, state);
    out.push({ status: r.status, total: items.length, answered, lastType: items[answered]?.type ?? null });
  }
  return out;
}

export async function engageOverview(days: number, now = new Date()) {
  const since = addDays(warsawDay(now), -days);
  const sinceAt = new Date(now.getTime() - days * 86_400_000);
  const [state, kinds, bridge, first] = await Promise.all([readEngageState(), kindStats(since), bridgeStats(since, sinceAt), firstLessonRows(sinceAt)]);
  return { state, days, kinds, bridge, firstLesson: firstLessonFunnel(first), previews: previews() };
}

const LANGS: UiLang[] = ['ru', 'uk', 'en'];
/** «Как увидит игрок»: образец каждой карточки на каждом языке (текст без разметки, подписи кнопок, адрес картинки). */
function previews() {
  const plain = (html: string) => html.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
  return Object.fromEntries(
    LANGS.map((lang) => [
      lang,
      Object.fromEntries(
        ENGAGE_KINDS.map((kind) => {
          const v = cardView(sampleCard(kind, lang), lang);
          return [kind, { text: plain(v.text), buttons: v.keyboard.inline_keyboard.flat().map((b) => b.text), imageUrl: botImageUrl(v.image) }];
        }),
      ),
    ]),
  ) as Record<UiLang, Record<EngageKind, { text: string; buttons: string[]; imageUrl: string }>>;
}

/** Образец карточки для «как увидит игрок» и «прислать себе». */
export function sampleCard(kind: EngageKind, lang: UiLang): CardData {
  if (kind === 'newcomer') return { kind, left: null };
  if (kind === 'comeback') return { kind, streakBest: 12, words: 48, city: 'Kraków', gift: COMEBACK_GIFT };
  const m = MISSIONS.find((x) => !x.premium && !x.season && !x.channel) ?? MISSIONS[0];
  return { kind, slug: m.slug, title: m.title[lang] || m.title.ru || m.slug, minutes: m.minutes, category: m.category };
}

/** «Прислать себе»: карточка с пометкой пробной отправки, без записи в engage_sends. */
export async function sendEngageTest(telegramId: number, kind: EngageKind, lang: UiLang): Promise<void> {
  const view = cardView(sampleCard(kind, lang), lang);
  try {
    await sendWithPhoto(telegramId, `${DAILY_COPY[lang].testNote}\n\n${view.text}`, view.keyboard, view.image);
  } catch (e) {
    if (e instanceof TelegramError && (e.code === 403 || (e.code === 400 && /chat not found/i.test(e.description)))) throw badRequest('bot_blocked');
    throw e;
  }
}
