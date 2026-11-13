/**
 * Аналитика «Обзора» админки (services/admin-insights.ts, GET /api/admin/insights), журнал ошибок за период (GET /api/admin/errors)
 * и отбор игроков (GET /api/admin/users?filter=). Владелец 2026-11-12: «админку приятнее и больше функций».
 * Данные настоящие: вход из Telegram с меткой рекламы в боте, входной тест (Лодзь), приглашённый друг, гость вне Telegram, пройденный урок.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { db } from '../src/db';
import { users } from '../src/db/schema';
import { recordError } from '../src/services/error-log';
import { resetRateLimits } from '../src/hono';
import { disposeEnv, getEnv, login, playSession, request } from './helpers';

afterAll(disposeEnv);

type Insights = Awaited<ReturnType<typeof import('../src/services/admin-insights').adminInsights>>;

let roleSeq = 0;
let rootToken = '';
// Вход в админку ограничен 10 попытками за 5 минут — токен главного администратора берём один раз.
async function adminCall(role: 'SUPERADMIN' | 'EDITOR' | 'SUPPORT' = 'SUPERADMIN') {
  const signIn = async (email: string, password: string) => (await request('POST', '/api/admin/login', { email, password })).body.token as string;
  rootToken ||= await signIn('admin@test.dev', 'admin-password-123');
  let token = rootToken;
  if (role !== 'SUPERADMIN') {
    const email = `${role.toLowerCase()}-insights-${++roleSeq}@test.dev`;
    await request('POST', '/api/admin/admins', { email, name: role, role, password: 'role-password-123' }, { authorization: `Bearer ${token}` });
    token = await signIn(email, 'role-password-123');
  }
  return (path: string) => request('GET', `/api/admin${path}`, undefined, { authorization: `Bearer ${token}` });
}

let before: Insights;
const tag = `ad_${Date.now().toString(36)}`;
const ids = { ad: '', invited: '' };

beforeAll(async () => {
  await getEnv();
  const admin = await adminCall();
  before = (await admin('/insights?days=7')).body;

  // 1) пришёл по рекламе: /start с меткой в боте, затем открыл приложение, прошёл знакомство и первый урок
  const ad = await login();
  ids.ad = ad.user.id;
  await request('POST', '/telegram/webhook', {
    update_id: Math.floor(Math.random() * 1e9),
    message: { message_id: 1, chat: { id: ad.telegramId, type: 'private' }, from: { id: ad.telegramId, first_name: 'Ad' }, text: `/start ${tag}` },
  }, { 'x-telegram-bot-api-secret-token': 'hook-secret' });
  await ad.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A0', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: 19 });
  const journey = (await ad.call('GET', '/api/journey')).body;
  resetRateLimits();
  const s = await ad.call('POST', '/api/sessions', { lessonId: journey.nextLesson.id });
  expect((await playSession(ad.call, s.body.sessionId)).status).toBe(200);

  // 2) входной тест на 70 % → Варшава и Лодзь
  const placed = await login();
  await placed.call('POST', '/api/me/onboarding', { uiLanguage: 'uk', selfLevel: 'A1', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: null });
  const exams = (await placed.call('GET', '/api/exams')).body.exams as { id: string; kind: string }[];
  resetRateLimits();
  const p = await placed.call('POST', '/api/sessions', { lessonId: exams.find((e) => e.kind === 'PLACEMENT')!.id });
  expect((await playSession(placed.call, p.body.sessionId, { wrong: 3 })).status).toBe(200);

  // 3) приглашённый друг (без знакомства)
  ids.invited = (await login({ start_param: `ref_${ad.user.referralCode}` })).user.id;

  // 4) гость вне Telegram
  const g = await request('POST', '/api/auth/guest', { platform: 'twa', language: 'en' }, { 'cf-connecting-ip': '10.9.9.9' });
  expect(g.status).toBe(200);
});

describe('аналитика «Обзора»', () => {
  it('ряды по дням: по одному значению на каждый день периода, сегодня последним', async () => {
    const admin = await adminCall();
    for (const days of [7, 30, 90]) {
      const r = (await admin(`/insights?days=${days}`)).body as Insights;
      expect(r.daily.days).toHaveLength(days);
      for (const k of ['signups', 'active', 'lessons', 'stars'] as const) expect(r.daily[k]).toHaveLength(days);
      expect(r.daily.days[days - 1]).toBe(new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw' }).format(new Date()));
    }
    expect((await admin('/insights?days=5')).status).toBe(400);
  });

  it('четыре новых игрока: регистрации, воронка, источники, входной тест, язык', async () => {
    const r = (await (await adminCall())('/insights?days=7')).body as Insights;
    expect(r.totals.signups.now - before.totals.signups.now).toBe(4);
    expect(r.daily.signups.at(-1)! - before.daily.signups.at(-1)!).toBe(4);
    // воронка: все 4 зарегистрированы, знакомство — у двоих, урок закончил один; сегодняшние ещё не могли «вернуться назавтра»
    expect(r.funnel.total - before.funnel.total).toBe(4);
    expect(r.funnel.onboarded - before.funnel.onboarded).toBe(2);
    expect(r.funnel.lesson - before.funnel.lesson).toBeGreaterThanOrEqual(1);
    expect(r.funnel.returnable - before.funnel.returnable).toBe(0);
    // откуда: метка рекламы из бота, приглашение, гость
    expect(r.sources.find((s) => s.key === tag)?.count).toBe(1);
    expect((r.sources.find((s) => s.key === 'ref')?.count ?? 0) - (before.sources.find((s) => s.key === 'ref')?.count ?? 0)).toBe(1);
    expect((r.sources.find((s) => s.key === 'guest')?.count ?? 0) - (before.sources.find((s) => s.key === 'guest')?.count ?? 0)).toBe(1);
    // входной тест: один игрок оказался в Лодзи
    expect(r.placement.lodz - before.placement.lodz).toBe(1);
    expect(r.placement.krakow - before.placement.krakow).toBe(0);
    // уровень и язык
    expect(r.selfLevels.find((x) => x.key === 'A1')!.count).toBeGreaterThanOrEqual(1);
    expect(r.languages.find((x) => x.key === 'ru')!.count).toBeGreaterThanOrEqual(1);
    // активность и уроки сегодня
    expect(r.daily.active.at(-1)!).toBeGreaterThanOrEqual(1);
    expect(r.totals.lessons.now - before.totals.lessons.now).toBeGreaterThanOrEqual(1);
    // напоминания: включены у игрока, выбравшего 19:00
    expect(r.reminders.enabled - before.reminders.enabled).toBe(1);
    expect(r.reminders.days).toHaveLength(7);
  });

  it('в ответе нет имён и id игроков — только числа и метки', async () => {
    const r = (await (await adminCall())('/insights?days=30')).body;
    const text = JSON.stringify(r);
    const anyUser = await db.query.users.findFirst();
    expect(text).not.toContain(anyUser!.id);
    expect(text).not.toContain(anyUser!.firstName);
  });

  it('источники в сумме дают всех новичков: метки за пределами первых 12 — строкой «other»', async () => {
    const r = (await (await adminCall())('/insights?days=90')).body as Insights;
    expect(r.sources.reduce((a, s) => a + s.count, 0)).toBe(r.funnel.total);
    expect(r.sources.filter((s) => s.key !== 'other').length).toBeLessThanOrEqual(12);
  });

  it('карточка игрока называет источник по тому же правилу, что и сводка', async () => {
    const admin = await adminCall();
    expect((await admin(`/users/${ids.ad}`)).body.source).toBe(tag);
    expect((await admin(`/users/${ids.invited}`)).body.source).toBe('ref');
  });

  it('без входа в админку — 401; редактору контента аналитика и журнал ошибок закрыты', async () => {
    expect((await request('GET', '/api/admin/insights')).status).toBe(401);
    const editor = await adminCall('EDITOR');
    expect((await editor('/insights?days=7')).status).toBe(403);
    expect((await editor('/errors?hours=24')).status).toBe(403);
    const dash = await editor('/dashboard');
    expect(dash.status).toBe(200);
    expect(dash.body.appErrors).toBeNull();
    const support = await adminCall('SUPPORT');
    expect((await support('/insights?days=7')).status).toBe(200);
    expect((await support('/errors?hours=24')).status).toBe(200);
  });
});

describe('журнал ошибок за период', () => {
  it('сутки / неделя / месяц и отбор по виду', async () => {
    await recordError({ kind: 'client', message: `wrong_step ${tag}`, detail: null, path: '/lesson/l_x', release: null });
    await recordError({ kind: 'csp', message: `img-src https://t.me ${tag}`, detail: null, path: '/profile', release: null });
    const admin = await adminCall();
    const all = (await admin('/errors?hours=168')).body;
    expect(all.hours).toBe(168);
    expect(all.items.some((e: { message: string }) => e.message.includes(tag))).toBe(true);
    const client = (await admin('/errors?hours=24&kind=client')).body;
    expect(client.items.length).toBeGreaterThan(0);
    expect(client.items.every((e: { kind: string }) => e.kind === 'client')).toBe(true);
    expect((await admin('/errors?hours=5')).status).toBe(400);
  });

  it('одна ошибка в разные дни — одна строка; итоги по видам не зависят от отбора', async () => {
    const msg = `chunk ${tag}`;
    const err = { kind: 'client' as const, message: msg, detail: null, path: '/home', release: null };
    await recordError(err, new Date(Date.now() - 3 * 86_400_000));
    await recordError(err, new Date(Date.now() - 2 * 86_400_000));
    await recordError(err);
    const admin = await adminCall();
    const week = (await admin('/errors?hours=168&kind=client')).body;
    const rows = week.items.filter((e: { message: string }) => e.message === msg);
    expect(rows).toHaveLength(1);
    expect(rows[0].count).toBe(3);
    const day = (await admin('/errors?hours=24&kind=client')).body;
    expect(day.items.find((e: { message: string }) => e.message === msg).count).toBe(1);
    // итоги одинаковы при любом отборе по виду
    const csp = (await admin('/errors?hours=168&kind=csp')).body;
    expect(csp.total).toEqual(week.total);
    expect(csp.items.every((e: { kind: string }) => e.kind === 'csp')).toBe(true);
    expect(week.total.client).toBeGreaterThanOrEqual(3);
  });
});

describe('отбор игроков', () => {
  it('новые за сутки, гости, заблокированные', async () => {
    const admin = await adminCall();
    const fresh = (await admin('/users?filter=new')).body;
    expect(fresh.total).toBeGreaterThanOrEqual(4);
    const guests = (await admin('/users?filter=guests')).body;
    expect(guests.items.length).toBeGreaterThan(0);
    expect(guests.items.every((u: { telegramId: number }) => u.telegramId < 0)).toBe(true);
    const someone = await login();
    await db.update(users).set({ isBanned: true }).where(eq(users.id, someone.user.id));
    const banned = (await admin('/users?filter=banned')).body;
    expect(banned.items.map((u: { id: string }) => u.id)).toContain(someone.user.id);
    const premium = (await admin('/users?filter=premium')).body;
    expect(premium.items.every((u: { subscriptions: unknown[] }) => u.subscriptions.length > 0)).toBe(true);
    expect((await admin('/users?filter=nonsense')).status).toBe(400);
  });
});
