/**
 * Вопрос дня в админке и в настройках приложения: план публикаций до запуска (30 дней, «как увидит игрок»), замена вопроса и картинки,
 * пропуск дня, запуск и остановка (журнал действий), отчёт по дню (кому дошло, кто ответил, верно ли), банк вопросов с выключателем,
 * блок в карточке игрока, «Прислать себе», роли. Выключатель «Вопрос дня» в настройках приложения.
 */
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '../src/db';
import { adminAuditLogs, botContacts, botQuizPlayers, botQuizRounds, dailyQuizSends } from '../src/db/schema';
import { QUESTION_BY_ID, QUIZ_QUESTIONS } from '../src/bot/quiz/questions';
import { runDailyQuizTick } from '../src/bot/daily/send';
import { addDays, warsawDay, writeDailyRun, writeDailyState } from '../src/bot/daily/state';
import { disposeEnv, getEnv, login, request } from './helpers';
import { fakeTelegram, tgError } from './tg-fake';

const ORIGIN = 'https://polski.example';
afterAll(disposeEnv);
afterEach(() => vi.unstubAllGlobals());

let seq = 0;
let rootToken = '';
const signIn = async (email: string, password: string) => (await request('POST', '/api/admin/login', { email, password })).body;
type Call = (method: 'GET' | 'POST' | 'PATCH' | 'DELETE', path: string, body?: unknown) => ReturnType<typeof request>;
const as = (token: string): Call => (method, path, body) => request(method, `/api/admin${path}`, body, { authorization: `Bearer ${token}` });
async function makeAdmin(role: 'SUPERADMIN' | 'EDITOR' | 'SUPPORT') {
  const email = `${role.toLowerCase()}-daily-${++seq}@test.dev`;
  const r = await as(rootToken)('POST', '/admins', { email, name: `${role} ${seq}`, role, password: 'role-password-123' });
  expect(r.status).toBe(200);
  return as((await signIn(email, 'role-password-123')).token);
}
let root: Call;
beforeAll(async () => {
  const { env } = await getEnv();
  env.WEB_APP_URL = `${ORIGIN}/app/`;
  rootToken = (await signIn('admin@test.dev', 'admin-password-123')).token;
  root = as(rootToken);
});

const today = () => warsawDay(new Date());
const lastAudit = async (action: string) => (await db.select().from(adminAuditLogs).where(eq(adminAuditLogs.action, action)).orderBy(desc(adminAuditLogs.createdAt)).limit(1))[0];

describe('права', () => {
  it('редактор — 403; поддержка видит страницу и шлёт себе, но не меняет план и не запускает', async () => {
    const editor = await makeAdmin('EDITOR');
    expect((await editor('GET', '/daily-quiz')).status).toBe(403);
    const support = await makeAdmin('SUPPORT');
    expect((await support('GET', '/daily-quiz')).status).toBe(200);
    expect((await support('GET', '/daily-quiz/questions')).status).toBe(200);
    expect((await support('PATCH', '/daily-quiz/state', { enabled: true })).status).toBe(403);
    expect((await support('PATCH', `/daily-quiz/plan/${addDays(today(), 3)}/A1`, { image: 'pkp' })).status).toBe(403);
    expect((await support('PATCH', `/daily-quiz/plan/${addDays(today(), 3)}`, { skipped: true })).status).toBe(403);
    expect((await support('PATCH', `/daily-quiz/questions/${QUIZ_QUESTIONS[0].id}`, { disabled: true })).status).toBe(403);
    const me = await login();
    fakeTelegram();
    const sent = await support('POST', '/daily-quiz/test', { who: String(me.telegramId), day: today(), level: 'A1' });
    expect(sent.status).toBe(200);
    expect(sent.body.sentTo).toBe(me.telegramId);
  });
});

describe('план публикаций до запуска', () => {
  it('30 дней по 3 уровня: вопрос, картинка, «как увидит игрок»; охват и скорость отправки; рассылка выключена', async () => {
    const r = await root('GET', '/daily-quiz?lang=ru');
    expect(r.status).toBe(200);
    expect(r.body.state).toEqual({ enabled: false, sendAt: '18:00', startDay: null });
    expect(r.body.rate).toEqual({ perRun: 40, perHour: 2400 });
    expect(r.body.scenes).toHaveLength(16);
    expect(r.body.plan).toHaveLength(30);
    expect(r.body.plan[0].day).toBe(today());
    for (const d of r.body.plan) {
      expect(d.items.map((i: { level: string }) => i.level)).toEqual(['A1', 'A2', 'B1']);
      for (const i of d.items) {
        expect(QUESTION_BY_ID.get(i.questionId)!.cefr).toBe(i.level);
        expect(i.imageUrl).toMatch(/\/bot\/quiz\/[a-z-]+\.jpg/);
        expect(i.preview.text).toContain('Pytanie dnia');
        expect(i.preview.text).not.toMatch(/<b>/);
        expect(i.preview.buttons.length).toBeGreaterThanOrEqual(1);
      }
    }
    expect(typeof r.body.audience.total).toBe('number');
    expect(r.body.history).toBeInstanceOf(Array);
  });

  it('замена вопроса и картинки сохраняется и пишется в журнал; другой уровень и прошедший день — ошибка', async () => {
    const day = addDays(today(), 4);
    const plan = (await root('GET', '/daily-quiz?lang=ru')).body.plan.find((d: { day: string }) => d.day === day);
    const current = plan.items[0].questionId;
    const other = QUIZ_QUESTIONS.find((q) => q.cefr === 'A1' && q.id !== current)!;
    expect((await root('PATCH', `/daily-quiz/plan/${day}/A1`, { questionId: other.id })).status).toBe(200);
    expect((await root('PATCH', `/daily-quiz/plan/${day}/A1`, { image: 'pierniki' })).status).toBe(200);
    const after = (await root('GET', '/daily-quiz?lang=ru')).body.plan.find((d: { day: string }) => d.day === day).items[0];
    expect(after).toMatchObject({ questionId: other.id, image: 'pierniki', edited: true });
    expect((await lastAudit('daily_quiz_plan'))!.details).toMatchObject({ day, level: 'A1' });
    const b1 = QUIZ_QUESTIONS.find((q) => q.cefr === 'B1')!;
    const wrong = await root('PATCH', `/daily-quiz/plan/${day}/A1`, { questionId: b1.id });
    expect(wrong.status).toBe(400);
    expect(wrong.body.error).toBe('wrong_level');
    const past = await root('PATCH', `/daily-quiz/plan/${addDays(today(), -1)}/A1`, { image: 'pkp' });
    expect(past.status).toBe(400);
    expect(past.body.error).toBe('day_locked');
  });

  it('пропуск дня; сегодняшний день после начала отправки не меняется', async () => {
    const day = addDays(today(), 6);
    expect((await root('PATCH', `/daily-quiz/plan/${day}`, { skipped: true })).status).toBe(200);
    expect((await root('GET', '/daily-quiz')).body.plan.find((d: { day: string }) => d.day === day).skipped).toBe(true);
    expect((await lastAudit('daily_quiz_skip'))!.entityId).toBe(day);
    await writeDailyRun({ day: today(), cursor: 1, done: false, startedAt: Date.now() });
    const locked = await root('PATCH', `/daily-quiz/plan/${today()}/A1`, { image: 'pkp' });
    expect(locked.body.error).toBe('day_locked');
    expect((await root('GET', '/daily-quiz')).body.plan[0].editable).toBe(false);
    await writeDailyRun({ day: '2000-01-01', cursor: 0, done: true, startedAt: 0 });
  });

  it('запуск, время и остановка — в журнале; время только с шагом 15 минут', async () => {
    const start = await root('PATCH', '/daily-quiz/state', { enabled: true, startDay: addDays(today(), 1) });
    expect(start.status).toBe(200);
    expect(start.body.state).toMatchObject({ enabled: true, startDay: addDays(today(), 1) });
    expect(await lastAudit('daily_quiz_start')).toBeTruthy();
    expect((await root('PATCH', '/daily-quiz/state', { sendAt: '19:30' })).body.state.sendAt).toBe('19:30');
    expect(await lastAudit('daily_quiz_settings')).toBeTruthy();
    expect((await root('PATCH', '/daily-quiz/state', { sendAt: '19:10' })).status).toBe(400);
    expect((await root('PATCH', '/daily-quiz/state', { enabled: false })).body.state.enabled).toBe(false);
    expect(await lastAudit('daily_quiz_stop')).toBeTruthy();
    await writeDailyState({ sendAt: '18:00', startDay: null });
  });
});

describe('банк вопросов', () => {
  it('весь банк со статистикой; выключенный вопрос уходит из будущего плана; в журнал', async () => {
    const r = await root('GET', '/daily-quiz/questions?lang=ru');
    expect(r.body).toHaveLength(QUIZ_QUESTIONS.length);
    expect(r.body[0]).toMatchObject({ id: expect.any(String), level: expect.any(String), category: expect.any(String), prompt: expect.any(String), disabled: false });
    expect(r.body[0].options).toHaveLength(4);
    const plan = (await root('GET', '/daily-quiz')).body.plan;
    const victim = plan[10].items[1].questionId;
    expect((await root('PATCH', `/daily-quiz/questions/${victim}`, { disabled: true })).status).toBe(200);
    const after = (await root('GET', '/daily-quiz')).body.plan.slice(1);
    expect(after.flatMap((d: { items: { questionId: string }[] }) => d.items.map((i) => i.questionId))).not.toContain(victim);
    expect((await root('GET', '/daily-quiz/questions')).body.find((q: { id: string }) => q.id === victim).disabled).toBe(true);
    expect((await lastAudit('daily_quiz_question'))!.entityId).toBe(victim);
    await root('PATCH', `/daily-quiz/questions/${victim}`, { disabled: false });
  });
});

describe('отчёт по дню и карточка игрока', () => {
  it('по уровням: отправлено, дошло, заблокировал бота, ответили, верно; таблица с отбором и страницами', async () => {
    const day = '2027-03-01';
    const ids: number[] = [];
    for (let i = 0; i < 3; i++) {
      const telegramId = 9_500_000 + i;
      await db.insert(botContacts).values({ telegramId, firstName: `Rep${i}`, languageCode: 'ru', firstSeenAt: new Date('2026-10-01'), lastSeenAt: new Date('2026-10-01') });
      ids.push(telegramId);
    }
    const app = await login();
    await writeDailyState({ enabled: true, sendAt: '18:00', startDay: day });
    fakeTelegram((c) => (c.params.chat_id === ids[2] ? tgError(403, 'Forbidden: bot was blocked by the user') : undefined));
    for (let i = 0; i < 5; i++) await runDailyQuizTick(new Date(`${day}T17:0${i}:00Z`));
    await writeDailyState({ enabled: false });
    // Первый ответил верно (через настоящий webhook).
    const send = (await db.select().from(dailyQuizSends).where(and(eq(dailyQuizSends.day, day), eq(dailyQuizSends.telegramId, ids[0]))))[0];
    const round = (await db.select().from(botQuizRounds).where(eq(botQuizRounds.id, send.roundId!)))[0];
    const q = QUESTION_BY_ID.get(round.questionId)!;
    fakeTelegram();
    await request('POST', '/telegram/webhook', { update_id: 880_001, callback_query: { id: 'cb880001', from: { id: ids[0], first_name: 'Rep0' }, message: { message_id: 1, chat: { id: ids[0], type: 'private' } }, data: `qa:${round.id}:${round.optionOrder.indexOf(q.answer)}` } }, { 'x-telegram-bot-api-secret-token': 'hook-secret' });

    const r = await root('GET', `/daily-quiz/day/${day}?lang=ru`);
    expect(r.status).toBe(200);
    const a1 = r.body.levels.find((l: { level: string }) => l.level === 'A1');
    expect(a1).toMatchObject({ prompt: expect.any(String) });
    expect(a1.sent).toBeGreaterThanOrEqual(3);
    expect(a1.delivered).toBeGreaterThanOrEqual(2);
    expect(a1.blocked).toBeGreaterThanOrEqual(1);
    expect(a1.answered).toBeGreaterThanOrEqual(1);
    expect(a1.correct).toBeGreaterThanOrEqual(1);
    const answered = (await root('GET', `/daily-quiz/day/${day}?filter=answered&lang=ru`)).body.rows;
    expect(answered.find((x: { telegramId: number }) => x.telegramId === ids[0])).toMatchObject({ status: 'SENT', correct: true, chosenText: expect.any(String), name: 'Rep0' });
    const failed = (await root('GET', `/daily-quiz/day/${day}?filter=failed`)).body.rows;
    expect(failed.map((x: { telegramId: number }) => x.telegramId)).toContain(ids[2]);
    const notAnswered = (await root('GET', `/daily-quiz/day/${day}?filter=not_answered`)).body.rows.map((x: { telegramId: number }) => x.telegramId);
    expect(notAnswered).toContain(ids[1]);
    expect(notAnswered).not.toContain(ids[0]);
    expect((await root('GET', `/daily-quiz/day/${day}?filter=wrong`)).body.rows.map((x: { telegramId: number }) => x.telegramId)).not.toContain(ids[0]);
    const page = await root('GET', `/daily-quiz/day/${day}?after=${ids[0]}`);
    expect(page.body.rows.every((x: { telegramId: number }) => x.telegramId > ids[0])).toBe(true);
    // Карточка игрока приложения: блок «Вопросы дня».
    const card = (await root('GET', `/users/${app.user.id}`)).body;
    expect(card.dailyQuiz).toEqual([expect.objectContaining({ day, status: 'SENT', questionId: expect.any(String), prompt: expect.any(String) })]);
  });
});

describe('настройки приложения', () => {
  it('выключатель «Вопрос дня»: игрок Telegram выключает и включает; у гостя — ошибка', async () => {
    const u = await login();
    expect((await u.call('GET', '/api/me')).body.dailyQuiz).toBe(true);
    const off = await u.call('PATCH', '/api/me/settings', { dailyQuiz: false });
    expect(off.status).toBe(200);
    expect(off.body.dailyQuiz).toBe(false);
    expect((await db.select().from(botQuizPlayers).where(eq(botQuizPlayers.telegramId, u.telegramId)))[0].pushEnabled).toBe(false);
    expect((await u.call('PATCH', '/api/me/settings', { dailyQuiz: true })).body.dailyQuiz).toBe(true);
    const g = (await request('POST', '/api/auth/guest', { platform: 'twa', language: 'ru' }, { 'cf-connecting-ip': '10.9.9.9' })).body as { token: string };
    const gm = await request('GET', '/api/me', undefined, { authorization: `Bearer ${g.token}` });
    expect(gm.body.dailyQuiz).toBeNull();
    const bad = await request('PATCH', '/api/me/settings', { dailyQuiz: false }, { authorization: `Bearer ${g.token}` });
    expect(bad.status).toBe(400);
    expect(bad.body.error).toBe('no_telegram');
  });
});
