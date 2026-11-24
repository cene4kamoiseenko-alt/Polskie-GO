/**
 * Карточки бота в рассылке вопроса дня (docs/superpowers/specs/2026-11-24-engagement-design.md, раздел 1): одно сообщение в день,
 * карточка — вместо вопроса; выключено в админке — всё как раньше; сегодня был в приложении (по своему поясу) — вопрос; два запуска
 * не присылают два сообщения; 403 записывается и не повторяется.
 */
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { and, eq } from 'drizzle-orm';
import { db } from '../src/db';
import { botContacts, dailyQuizSends, engageSends, learningSessions, playerProgress, userSettings, users } from '../src/db/schema';
import { runDailyQuizTick } from '../src/bot/daily/send';
import { writeDailyState } from '../src/bot/daily/state';
import { writeEngageState } from '../src/bot/engage/state';
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
    expect(mine[0].params.photo).toMatch(/\/bot\/cards\/comeback-[12]\.jpg\?v=/);
    expect(mine[0].params.caption).toMatch(/Давно не|Long time|Давно не бачилися/);
    expect(await sendRow('2026-12-03', u.telegramId)).toMatchObject({ kind: 'comeback', status: 'SENT', userId: u.user.id });
    expect(await quizRow('2026-12-03', u.telegramId)).toBeUndefined();
    // Повторный запуск в тот же день ничего не шлёт.
    const again = fakeTelegram();
    await runDailyQuizTick(at('2026-12-03', '11:30'));
    expect(toChat(again, u.telegramId)).toEqual([]);
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
    expect(mine[0].params.photo).toMatch(/\/bot\/cards\/newcomer-[12]\.jpg/);
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

  it('суббота: активному игроку без миссий — «Миссия недели»', async () => {
    // 2026-12-12 — суббота.
    const u = await player('2026-12-10');
    await launch('2026-12-12');
    const calls = fakeTelegram();
    await runDailyQuizTick(at('2026-12-12'));
    const mine = toChat(calls, u.telegramId);
    expect(mine).toHaveLength(1);
    expect(mine[0].params.caption).toMatch(/Миссия недели|Місія тижня|Mission of the week/);
    expect(mine[0].params.photo).toMatch(/\/bot\/cards\/mission/);
    expect(await sendRow('2026-12-12', u.telegramId)).toMatchObject({ kind: 'mission' });
  });
});
