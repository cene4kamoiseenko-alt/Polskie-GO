/**
 * Карточки бота в рассылке вопроса дня (docs/superpowers/specs/2026-11-24-engagement-design.md, раздел 1): одно сообщение в день,
 * карточка — вместо вопроса; выключено в админке — всё как раньше; сегодня был в приложении (по своему поясу) — вопрос; два запуска
 * не присылают два сообщения; 403 записывается и не повторяется.
 */
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { and, eq } from 'drizzle-orm';
import { db } from '../src/db';
import { botContacts, dailyQuizSends, engageSends, learningSessions, playerProgress, userSettings, users, walletTransactions } from '../src/db/schema';
import { claimQuiz, runDailyQuizTick } from '../src/bot/daily/send';
import { claimCard } from '../src/bot/engage/send';
import { cardSeed, cardView } from '../src/bot/engage/views';
import { writeDailyState } from '../src/bot/daily/state';
import { writeEngageState } from '../src/bot/engage/state';
import * as missions from '../src/services/missions';
import { disposeEnv, getEnv, login } from './helpers';
import { fakeTelegram, tgError, type TgCall } from './tg-fake';

beforeAll(async () => {
  const { env } = await getEnv();
  env.WEB_APP_URL = 'https://polski.example/app/';
  env.TELEGRAM_BOT_USERNAME = 'Polski_Go_Bot';
});
afterAll(disposeEnv);
afterEach(() => vi.unstubAllGlobals());

const longAgo = new Date('2026-09-01T10:00:00Z');
/** 12:00 по Варшаве зимой = 11:00 UTC. */
const at = (day: string, utc = '11:01') => new Date(`${day}T${utc}:00Z`);
const toChat = (calls: TgCall[], id: number) => calls.filter((c) => c.params.chat_id === id);

async function launch(day: string, cards = true) {
  await writeDailyState({ enabled: true, sendAt: '12:00', startDay: day });
  await writeEngageState({ enabled: cards });
}

/** Игрок приложения: давно зарегистрирован, давно не открывал приложение, урок пройден, последнее занятие — lastActiveDay. */
async function player(lastActiveDay: string | null, extra: { created?: Date; lessons?: number; seen?: Date; tz?: string } = {}) {
  const u = await login();
  await db.update(users).set({ lastSeenAt: extra.seen ?? longAgo, createdAt: extra.created ?? longAgo }).where(eq(users.id, u.user.id));
  await db.update(playerProgress).set({ lastActiveDay, lessonsCompleted: extra.lessons ?? 3, streakBest: 6 }).where(eq(playerProgress.userId, u.user.id));
  if (extra.tz) await db.update(userSettings).set({ timezone: extra.tz }).where(eq(userSettings.userId, u.user.id));
  return u;
}

const sendRow = (day: string, tg: number) => db.select().from(engageSends).where(and(eq(engageSends.day, day), eq(engageSends.telegramId, tg))).get();
const quizRow = (day: string, tg: number) => db.select().from(dailyQuizSends).where(and(eq(dailyQuizSends.day, day), eq(dailyQuizSends.telegramId, tg))).get();

describe('карточки в рассылке вопроса дня', () => {
  it('карточки выключены — вернувшемуся приходит вопрос, как раньше', async () => {
    const u = await player('2026-11-25');
    await launch('2026-12-02', false);
    const calls = fakeTelegram();
    await runDailyQuizTick(at('2026-12-02'));
    const mine = toChat(calls, u.telegramId);
    expect(mine).toHaveLength(1);
    expect(mine[0].params.caption).toContain('Pytanie dnia');
    expect(await sendRow('2026-12-02', u.telegramId)).toBeUndefined();
  });

  it('включено: вернувшемуся на 7-й день — карточка вместо вопроса', async () => {
    const u = await player('2026-11-26');
    await launch('2026-12-03');
    const calls = fakeTelegram();
    await runDailyQuizTick(at('2026-12-03'));
    const mine = toChat(calls, u.telegramId);
    expect(mine).toHaveLength(1);
    expect(mine[0].method).toBe('sendPhoto');
    // Картинка — из запаса канала, вариант по человеку и дню (у соседа в тот же день — другая).
    const img = cardView({ kind: 'comeback', streakBest: 0, words: 0, city: null, gift: null }, 'ru', cardSeed(u.telegramId, '2026-12-03')).image;
    expect(mine[0].params.photo).toMatch(/\/channel\/[a-z0-9-]+\.jpg\?v=/);
    expect(new URL(mine[0].params.photo as string).pathname).toBe(`/${img}`);
    expect(mine[0].params.caption).toMatch(/Давно не|Бобек скучал|Бобек на связи|Long time|Bobek missed|Bobek here|Бобек сумував|Бобек на зв/);
    expect(await sendRow('2026-12-03', u.telegramId)).toMatchObject({ kind: 'comeback', status: 'SENT', userId: u.user.id });
    expect(await quizRow('2026-12-03', u.telegramId)).toBeUndefined();
    // Повторный запуск в тот же день ничего не шлёт.
    const again = fakeTelegram();
    await runDailyQuizTick(at('2026-12-03', '11:30'));
    expect(toChat(again, u.telegramId)).toEqual([]);
  });

  it('подарок уже брал в последние 30 дней — карточка возвращения без обещания подарка (находка проверки)', async () => {
    const u = await player('2026-12-04');
    await db.insert(walletTransactions).values({ id: `cb-${u.user.id}`, userId: u.user.id, amount: 50, reason: 'comeback', idempotencyKey: `comeback:${u.user.id}:x`, createdAt: new Date('2026-12-01T10:00:00Z') });
    await launch('2026-12-11');
    const calls = fakeTelegram();
    await runDailyQuizTick(at('2026-12-11'));
    const caption = toChat(calls, u.telegramId)[0].params.caption as string;
    expect(caption).toMatch(/Давно не|Бобек скучал|Бобек на связи|Long time|Bobek missed|Bobek here|Бобек сумував|Бобек на зв/);
    expect(caption).not.toMatch(/50/);
    expect(await sendRow('2026-12-11', u.telegramId)).toMatchObject({ kind: 'comeback', variant: 'no_gift' });
  });

  it('новичку на 1-й день — карточка с остатком урока', async () => {
    const u = await player(null, { created: new Date('2026-12-03T15:00:00Z'), lessons: 0 });
    const items = Array.from({ length: 8 }, (_, i) => ({ key: `k${i}`, type: 'WORD_TRANSLATION' }));
    const answers = Object.fromEntries(['k0', 'k1', 'k2'].map((k) => [k, { done: true }]));
    await db.insert(learningSessions).values({
      userId: u.user.id, lessonId: 'l_waw-1-czesc', mode: 'LESSON', status: 'ACTIVE', items, state: { answers, run: 0, variant: null }, total: 8,
      startedAt: new Date('2026-12-03T20:00:00Z'),
    });
    await launch('2026-12-04');
    const calls = fakeTelegram();
    await runDailyQuizTick(at('2026-12-04'));
    const mine = toChat(calls, u.telegramId);
    expect(mine).toHaveLength(1);
    expect(new URL(mine[0].params.photo as string).pathname).toBe(`/${cardView({ kind: 'newcomer', left: 5 }, 'ru', cardSeed(u.telegramId, '2026-12-04')).image}`);
    expect(mine[0].params.caption).toMatch(/5/);
    expect(await sendRow('2026-12-04', u.telegramId)).toMatchObject({ kind: 'newcomer', variant: 'left' });
  });

  it('сегодня был в приложении — вопрос, а не карточка', async () => {
    const u = await player('2026-11-29', { seen: new Date('2026-12-06T07:00:00Z') });
    await launch('2026-12-06');
    const calls = fakeTelegram();
    await runDailyQuizTick(at('2026-12-06'));
    expect(toChat(calls, u.telegramId)[0].params.caption).toContain('Pytanie dnia');
    expect(await sendRow('2026-12-06', u.telegramId)).toBeUndefined();
  });

  it('занимался сегодня, но давно не входил заново (старый токен) — вопрос, а не карточка (находка проверки)', async () => {
    // Суббота: активный игрок уже занимался сегодня утром, last_seen_at — неделю назад (приложение держит токен до 6,5 дня).
    const u = await player('2026-12-19', { seen: new Date('2026-12-12T07:00:00Z') });
    await launch('2026-12-19');
    const calls = fakeTelegram();
    await runDailyQuizTick(at('2026-12-19'));
    expect(toChat(calls, u.telegramId)[0].params.caption).toContain('Pytanie dnia');
    expect(await sendRow('2026-12-19', u.telegramId)).toBeUndefined();
  });

  it('/api/me обновляет «последний вход» (не чаще раза в час)', async () => {
    const u = await login();
    await db.update(users).set({ lastSeenAt: longAgo }).where(eq(users.id, u.user.id));
    await u.call('GET', '/api/me');
    const seen = (await db.select({ at: users.lastSeenAt }).from(users).where(eq(users.id, u.user.id)).get())!.at!;
    expect(Date.now() - seen.getTime()).toBeLessThan(60_000);
  });

  it('«сегодня» — по поясу игрока: в Нью-Йорке ещё вчера, карточка уходит', async () => {
    const u = await player('2026-11-30', { seen: new Date('2026-12-07T03:00:00Z'), tz: 'America/New_York' });
    await launch('2026-12-07');
    const calls = fakeTelegram();
    await runDailyQuizTick(at('2026-12-07'));
    expect(toChat(calls, u.telegramId)).toHaveLength(1);
    expect(await sendRow('2026-12-07', u.telegramId)).toMatchObject({ kind: 'comeback' });
  });

  it('пересёкшиеся запуски: уже есть вопрос — карточки нет; уже есть карточка — вопроса нет', async () => {
    const a = await player('2026-12-01');
    const b = await player('2026-12-01');
    await launch('2026-12-08');
    await db.insert(dailyQuizSends).values({ day: '2026-12-08', telegramId: a.telegramId, userId: a.user.id, level: 'A1', lang: 'ru', questionId: 'x', status: 'SENT' });
    await db.insert(engageSends).values({ day: '2026-12-08', telegramId: b.telegramId, userId: b.user.id, kind: 'comeback', lang: 'ru', status: 'SENT' });
    // a — «вернувшийся» (7 дней без занятий): без строки вопроса ему ушла бы карточка. b — обычный игрок: без строки карточки ему ушёл бы вопрос.
    await db.update(playerProgress).set({ lastActiveDay: '2026-12-06' }).where(eq(playerProgress.userId, b.user.id));
    const calls = fakeTelegram();
    await runDailyQuizTick(at('2026-12-08'));
    expect(toChat(calls, a.telegramId)).toEqual([]);
    expect(toChat(calls, b.telegramId)).toEqual([]);
  });

  it('захват атомарен с другой таблицей: карточку не захватить, если вопрос уже захвачен, и наоборот (находка проверки)', async () => {
    const day = '2026-12-10';
    const now = new Date('2026-12-10T11:00:00Z');
    await db.insert(dailyQuizSends).values({ day, telegramId: 9_300_001, level: 'A1', lang: 'ru', questionId: 'x', status: 'PENDING' });
    expect(await claimCard(day, { telegramId: 9_300_001, userId: null }, 'comeback', null, 'ru', now)).toBe(false);
    await db.insert(engageSends).values({ day, telegramId: 9_300_002, kind: 'mission', lang: 'ru', status: 'PENDING' });
    expect(await claimQuiz(day, { telegramId: 9_300_002, userId: null }, 'A1', 'ru', 'x', now)).toBe(false);
    expect(await claimCard(day, { telegramId: 9_300_003, userId: null }, 'comeback', null, 'ru', now)).toBe(true);
    expect(await claimQuiz(day, { telegramId: 9_300_003, userId: null }, 'A1', 'ru', 'x', now)).toBe(false);
    expect(await claimQuiz(day, { telegramId: 9_300_004, userId: null }, 'A1', 'ru', 'x', now)).toBe(true);
    expect(await claimCard(day, { telegramId: 9_300_004, userId: null }, 'comeback', null, 'ru', now)).toBe(false);
  });

  it('403 на карточку: BLOCKED, отметка в контактах, вопрос в тот же день не уходит', async () => {
    const u = await player('2026-12-02');
    await db.insert(botContacts).values({ telegramId: u.telegramId, firstName: 'B', languageCode: 'ru', firstSeenAt: longAgo, lastSeenAt: longAgo }).onConflictDoNothing();
    await launch('2026-12-09');
    fakeTelegram((c) => (c.params.chat_id === u.telegramId ? tgError(403, 'Forbidden: bot was blocked by the user') : undefined));
    await runDailyQuizTick(at('2026-12-09'));
    expect(await sendRow('2026-12-09', u.telegramId)).toMatchObject({ status: 'BLOCKED' });
    expect((await db.select().from(botContacts).where(eq(botContacts.telegramId, u.telegramId)).get())!.blockedAt).toBeInstanceOf(Date);
    const again = fakeTelegram();
    await runDailyQuizTick(at('2026-12-09', '11:40'));
    expect(toChat(again, u.telegramId)).toEqual([]);
    expect(await quizRow('2026-12-09', u.telegramId)).toBeUndefined();
  });

  it('сбой выбора карточки — человеку уходит вопрос, рассылка идёт дальше (находка проверки)', async () => {
    // 2026-12-26 — суббота: для активных игроков правило читает миссии, и это чтение падает.
    const a = await player('2026-12-24');
    const b = await player('2026-12-24');
    await launch('2026-12-26');
    const spy = vi.spyOn(missions, 'listMissions').mockRejectedValue(new Error('broken mission content'));
    const calls = fakeTelegram();
    try {
      await runDailyQuizTick(at('2026-12-26'));
    } finally {
      spy.mockRestore();
    }
    expect(toChat(calls, a.telegramId)[0]?.params.caption).toContain('Pytanie dnia');
    expect(toChat(calls, b.telegramId)[0]?.params.caption).toContain('Pytanie dnia');
  });

  it('суббота: активному игроку без миссий — «Миссия недели»', async () => {
    // 2026-12-12 — суббота.
    const u = await player('2026-12-10');
    await launch('2026-12-12');
    const calls = fakeTelegram();
    await runDailyQuizTick(at('2026-12-12'));
    const mine = toChat(calls, u.telegramId);
    expect(mine).toHaveLength(1);
    expect(mine[0].params.caption).toMatch(/Миссия недели|Місія тижня|Mission of the week/);
    expect(mine[0].params.photo).toMatch(/\/channel\/[a-z0-9-]+\.jpg\?v=/);
    expect(await sendRow('2026-12-12', u.telegramId)).toMatchObject({ kind: 'mission' });
  });

  it('«Миссия недели» в следующую субботу — другая миссия, а не та же Żabka (владелец 2026-11-24)', async () => {
    // 2027-01-09 и 2027-01-16 — субботы; игрок занимается, миссий не открывает.
    const u = await player('2027-01-07');
    await launch('2027-01-09');
    fakeTelegram();
    await runDailyQuizTick(at('2027-01-09'));
    const first = await sendRow('2027-01-09', u.telegramId);
    expect(first).toMatchObject({ kind: 'mission' });
    await db.update(playerProgress).set({ lastActiveDay: '2027-01-14' }).where(eq(playerProgress.userId, u.user.id));
    await launch('2027-01-16');
    const calls = fakeTelegram();
    await runDailyQuizTick(at('2027-01-16'));
    const second = await sendRow('2027-01-16', u.telegramId);
    expect(second).toMatchObject({ kind: 'mission' });
    expect(second!.variant).not.toBe(first!.variant);
    expect(toChat(calls, u.telegramId)[0].params.caption).toMatch(/Миссия недели|Місія тижня|Mission of the week/);
  });
});
