/**
 * Мост «вопрос дня → игра» (docs/superpowers/specs/2026-11-24-engagement-design.md, раздел 2): после ответа первая кнопка — разминка
 * на 5 заданий в приложении (обычное занятие: серия и XP по существующим правилам); неверный ответ — +3 XP «за попытку».
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { and, eq } from 'drizzle-orm';
import { dayKey } from '@polski-go/shared';
import { db } from '../src/db';
import { botQuizRounds, dailyActivity, dailyQuizSends, newId } from '../src/db/schema';
import { DAILY_TRY_XP, recordDailyAnswer } from '../src/bot/daily/answer';
import { dailyResultView } from '../src/bot/daily/views';
import { QUIZ_QUESTIONS } from '../src/bot/quiz/questions';
import type { BotUser } from '../src/bot/data';
import { WARMUP_SIZE } from '../src/services/sessions';
import { disposeEnv, getEnv, lessonId, login, playSession, sessionItems } from './helpers';

beforeAll(async () => {
  const { env } = await getEnv();
  env.WEB_APP_URL = 'https://polski.example/app/';
  env.TELEGRAM_BOT_USERNAME = 'Polski_Go_Bot';
});
afterAll(disposeEnv);

describe('разминка после вопроса дня', () => {
  it('разминка — 5 заданий из пройденного; законченная продлевает серию', async () => {
    const u = await login();
    const start = await u.call('POST', '/api/sessions', { lessonId: await lessonId('waw-1-czesc') });
    expect(start.status).toBe(200);
    expect((await playSession(u.call, start.body.sessionId)).status).toBe(200);
    const w = await u.call('POST', '/api/sessions', { mode: 'WARMUP' });
    expect(w.status, JSON.stringify(w.body)).toBe(200);
    expect(w.body.mode).toBe('WARMUP');
    expect(w.body.items).toHaveLength(WARMUP_SIZE);
    expect(await sessionItems(w.body.sessionId)).toHaveLength(5);
    const fin = await playSession(u.call, w.body.sessionId);
    expect(fin.status, JSON.stringify(fin.body)).toBe(200);
    expect(fin.body.streak).toBeGreaterThanOrEqual(1);
  });

  it('у новичка без пройденных уроков разминка берёт доступный урок', async () => {
    const u = await login();
    const w = await u.call('POST', '/api/sessions', { mode: 'WARMUP' });
    expect(w.status, JSON.stringify(w.body)).toBe(200);
    expect(w.body.items.length).toBeGreaterThanOrEqual(1);
    expect(w.body.items.length).toBeLessThanOrEqual(5);
  });
});

describe('ответ на вопрос дня', () => {
  async function dailyRound(telegramId: number, userId: string) {
    const q = QUIZ_QUESTIONS[0];
    const id = newId();
    const now = new Date();
    await db.insert(botQuizRounds).values({ id, telegramId, chatId: telegramId, questionId: q.id, optionOrder: [0, 1, 2, 3], lang: 'ru', source: 'daily', status: 'OPEN', sentAt: now });
    await db.insert(dailyQuizSends).values({ day: dayKey(now, 'Europe/Warsaw'), telegramId, userId, level: 'A1', lang: 'ru', questionId: q.id, status: 'SENT', roundId: id, sentAt: now });
    return (await db.select().from(botQuizRounds).where(eq(botQuizRounds.id, id)).get())!;
  }
  const botUser = (id: string): BotUser => ({ id, timezone: 'Europe/Warsaw' }) as unknown as BotUser;

  it('неверный ответ — +3 XP за попытку и активный день; верный — +10', async () => {
    const a = await login();
    const ra = await dailyRound(a.telegramId, a.user.id);
    const wrong = (QUIZ_QUESTIONS[0].answer + 1) % 4;
    expect(DAILY_TRY_XP).toBe(3);
    expect(await recordDailyAnswer(ra, wrong, false, botUser(a.user.id), new Date())).toBe(3);
    const today = dayKey(new Date(), 'Europe/Warsaw');
    expect(await db.select().from(dailyActivity).where(and(eq(dailyActivity.userId, a.user.id), eq(dailyActivity.day, today))).get()).toBeDefined();

    const b = await login();
    const rb = await dailyRound(b.telegramId, b.user.id);
    expect(await recordDailyAnswer(rb, QUIZ_QUESTIONS[0].answer, true, botUser(b.user.id), new Date())).toBe(10);
  });

  it('первая кнопка итога — разминка; без аккаунта — первый урок', async () => {
    const q = QUIZ_QUESTIONS[0];
    const round = { id: 'r1', telegramId: 1, chatId: 1, questionId: q.id, optionOrder: [0, 1, 2, 3], lang: 'ru', source: 'daily', status: 'ANSWERED', chosen: q.answer, correct: true } as unknown as typeof botQuizRounds.$inferSelect;
    const first = (hasUser: boolean, xp = 10) => {
      const btn = dailyResultView(round, q, { hasUser, xp, percent: null, dailyStreak: 0, pushEnabled: true }).keyboard.inline_keyboard[0][0] as { text: string; web_app: { url: string } };
      return { text: btn.text, url: new URL(btn.web_app.url) };
    };
    const withUser = first(true);
    expect(withUser.url.searchParams.get('bot_screen')).toBe('warmup');
    expect(withUser.url.searchParams.get('src')).toBe('quiz_warmup');
    expect(withUser.text).toContain('2');
    const guest = first(false, 0);
    expect(guest.url.searchParams.get('bot_screen')).toBe('continue');
    expect(guest.text).toMatch(/3/);
    // Неверный ответ с аккаунтом: строка «+3 XP за попытку».
    const wrongRound = { ...round, correct: false, chosen: (q.answer + 1) % 4 } as typeof round;
    const text = dailyResultView(wrongRound, q, { hasUser: true, xp: 3, percent: null, dailyStreak: 0, pushEnabled: true }).text;
    expect(text).toMatch(/\+3 XP/);
    expect(text).toMatch(/попытк/);
  });
});
