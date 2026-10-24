import { afterAll, describe, expect, it } from 'vitest';
import { and, count, eq } from 'drizzle-orm';
import { db } from '../src/db';
import { cities, gameConfig, playerProgress, reviewSchedule, userAchievements, achievements } from '../src/db/schema';
import { validateInitData, signInitData } from '../src/lib/telegram';
import { correctAnswers, disposeEnv, lessonId, login, playSession, request, sessionItems } from './helpers';

afterAll(disposeEnv);

const progress = async (userId: string) => (await db.query.playerProgress.findFirst({ where: eq(playerProgress.userId, userId) }))!;
const reviews = async (userId: string, itemType: string) =>
  (await db.select({ n: count() }).from(reviewSchedule).where(and(eq(reviewSchedule.userId, userId), eq(reviewSchedule.itemType, itemType))))[0].n;

describe('Telegram авторизація', () => {
  const token = '123456:TEST_TOKEN';
  const fields = () => ({ auth_date: String(Math.floor(Date.now() / 1000)), user: JSON.stringify({ id: 42, first_name: 'Ola' }) });

  it('приймає правильно підписані initData', () => {
    const d = validateInitData(signInitData(fields(), token), token, 3600);
    expect(d.user.id).toBe(42);
  });

  it('відхиляє підроблені та прострочені дані', () => {
    const tampered = signInitData(fields(), token).replace('Ola', 'Eve');
    expect(() => validateInitData(tampered, token, 3600)).toThrow('bad_signature');
    expect(() => validateInitData(signInitData(fields(), 'other:token'), token, 3600)).toThrow('bad_signature');
    const old = signInitData({ ...fields(), auth_date: String(Math.floor(Date.now() / 1000) - 7200) }, token);
    expect(() => validateInitData(old, token, 3600)).toThrow('expired');
  });

  it('API вимагає токен; dev-вхід вимкнений', async () => {
    expect((await request('GET', '/api/me')).status).toBe(401);
    expect((await request('POST', '/api/auth/dev', {})).status).toBe(404);
  });

  it('новий користувач отримує стартові дані', async () => {
    const { call } = await login();
    const me = await call('GET', '/api/me');
    expect(me.status).toBe(200);
    expect(me.body.progress).toMatchObject({ xpTotal: 0, level: 1, languageLevel: 'A0' });
    expect(me.body.outfit.wear.BACKPACK).toBe('backpack-travel');
    expect(me.body.outfit.wear.JACKET).toBeUndefined();
    expect(me.body.onboarded).toBe(false);
  });
});

describe('Уроки та нагороди', () => {
  it('урок не розкриває відповідей клієнту', async () => {
    const { call } = await login();
    const res = await call('POST', '/api/sessions', { lessonId: await lessonId('waw-1-czesc') });
    expect(res.status).toBe(200);
    const raw = JSON.stringify(res.body.items);
    expect(raw).not.toContain('"answer"');
    expect(raw).not.toContain('"accepted"');
    expect(res.body.items.length).toBeGreaterThanOrEqual(8);
    expect(res.body.words.length).toBe(6);
  });

  it('заблокований урок і бос недоступні', async () => {
    const { call } = await login();
    expect((await call('POST', '/api/sessions', { lessonId: await lessonId('waw-2-uprzejmosc') })).status).toBe(403);
    expect((await call('POST', '/api/sessions', { lessonId: await lessonId('waw-boss') })).status).toBe(403);
    expect((await call('POST', '/api/sessions', { lessonId: await lessonId('krk-1-rodzina') })).status).toBe(403);
  });

  it('незавершений урок продовжується з того самого завдання з тим самим порядком варіантів', async () => {
    const { call } = await login();
    const j = await call('GET', '/api/journey');
    const first = j.body.cities[0].routes[0].lessons[0];
    const s1 = await call('POST', '/api/sessions', { lessonId: first.id });
    const items = await sessionItems(s1.body.sessionId);
    for (const it of items.slice(0, 2)) for (const a of correctAnswers(it)) await call('POST', `/api/sessions/${s1.body.sessionId}/answer`, { key: it.key, answer: a });
    const s2 = await call('POST', '/api/sessions', { lessonId: first.id });
    expect(s2.body.sessionId).toBe(s1.body.sessionId);
    expect(s2.body.resume.done).toEqual(items.slice(0, 2).map((i) => i.key));
    expect(JSON.stringify(s2.body.items)).toBe(JSON.stringify(s1.body.items));
    // Без жодної відповіді урок починається заново.
    const other = j.body.cities[0].routes[0].lessons[0];
    const { call: call2 } = await login();
    const a = await call2('POST', '/api/sessions', { lessonId: other.id });
    const b = await call2('POST', '/api/sessions', { lessonId: other.id });
    expect(b.body.sessionId).not.toBe(a.body.sessionId);
    expect(b.body.resume).toBeNull();
  });

  it('повний урок: XP і Złotki на сервері, слова, наступний урок відкрито', async () => {
    const { call, user } = await login();
    const lid = await lessonId('waw-1-czesc');
    const start = await call('POST', '/api/sessions', { lessonId: lid });
    const total = start.body.items.length;
    const fin = await playSession(call, start.body.sessionId);
    expect(fin.status).toBe(200);
    expect(fin.body).toMatchObject({ passed: true, perfect: true, correct: total, total });
    expect(fin.body.xp).toBe(total * 5 + 20 + 10);
    // 5 за урок + 5 за ідеальний; досягнення «Перші кроки» і «Ідеально!» дають ще Złotki окремо.
    expect(fin.body.zlotki).toBe(10);
    expect(fin.body.newWords).toHaveLength(6);
    expect(fin.body.achievements.map((a: { slug: string }) => a.slug)).toEqual(expect.arrayContaining(['first-lesson', 'perfect-1']));

    const p = await progress(user.id);
    expect(p).toMatchObject({ xpTotal: fin.body.xp, lessonsCompleted: 1, wordsLearned: 6, streakCurrent: 1 });
    expect(await reviews(user.id, 'WORD')).toBe(6);

    const j = await call('GET', '/api/journey');
    const waw = j.body.cities[0];
    const states = waw.routes.flatMap((r: { lessons: { slug: string; state: string }[] }) => r.lessons).map((l: { slug: string; state: string }) => [l.slug, l.state]);
    expect(states[0]).toEqual(['waw-1-czesc', 'completed']);
    expect(states[1]).toEqual(['waw-2-uprzejmosc', 'available']);
    expect(j.body.nextLesson.slug).toBe('waw-2-uprzejmosc');
  });

  it('повторне проходження не дає нескінченних нагород', async () => {
    const { call, user } = await login();
    const lid = await lessonId('waw-1-czesc');
    const xps: number[] = [];
    for (let i = 0; i < 4; i++) {
      const s = await call('POST', '/api/sessions', { lessonId: lid });
      xps.push((await playSession(call, s.body.sessionId)).body.xp);
    }
    const first = xps[0];
    expect(xps).toEqual([first, Math.round(first * 0.25), Math.round(first * 0.25), 0]);
    const p = await progress(user.id);
    expect(p.lessonsCompleted).toBe(1);
  });

  it('сесію не можна завершити двічі, з недовиконаними вправами чи надто швидко', async () => {
    const { call } = await login();
    const lid = await lessonId('waw-1-czesc');
    const s = await call('POST', '/api/sessions', { lessonId: lid });
    expect((await call('POST', `/api/sessions/${s.body.sessionId}/finish`)).body.error).toBe('not_finished');
    const fin = await playSession(call, s.body.sessionId);
    expect(fin.status).toBe(200);
    expect((await call('POST', `/api/sessions/${s.body.sessionId}/finish`)).body.error).toBe('session_closed');

    // Надто швидке проходження (бот) — відхиляється.
    const s2 = await call('POST', '/api/sessions', { lessonId: lid });
    const items = await sessionItems(s2.body.sessionId);
    const { correctAnswers } = await import('./helpers');
    for (const it of items) for (const a of correctAnswers(it as never)) await call('POST', `/api/sessions/${s2.body.sessionId}/answer`, { key: it.key, answer: a });
    expect((await call('POST', `/api/sessions/${s2.body.sessionId}/finish`)).body.error).toBe('too_fast');
  });

  it('чужу сесію використати не можна', async () => {
    const a = await login();
    const b = await login();
    const s = await a.call('POST', '/api/sessions', { lessonId: await lessonId('waw-1-czesc') });
    expect((await b.call('POST', `/api/sessions/${s.body.sessionId}/answer`, { key: 'x', answer: { optionId: 'o0' } })).status).toBe(404);
  });

  it('непройдений урок (менше 50%) не дає XP, а помилки йдуть у «Мої помилки»', async () => {
    const { call, user } = await login();
    const s = await call('POST', '/api/sessions', { lessonId: await lessonId('waw-1-czesc') });
    const fin = await playSession(call, s.body.sessionId, { wrong: 7 });
    expect(fin.body.passed).toBe(false);
    expect(fin.body.xp).toBe(0);
    expect(await reviews(user.id, 'EXERCISE')).toBe(7);
    const mistakes = await call('POST', '/api/sessions', { mode: 'MISTAKES' });
    expect(mistakes.status).toBe(200);
    expect(mistakes.body.items.length).toBe(7);
  });

  it('бос міста відкриває наступне місто, видає сувеніри та переносить бобра', async () => {
    const { call, user } = await login();
    const j0 = await call('GET', '/api/journey');
    const lessons = j0.body.cities[0].routes.flatMap((r: { lessons: { id: string; kind: string }[] }) => r.lessons);
    for (const l of lessons.filter((x: { kind: string }) => x.kind === 'LESSON')) {
      const s = await call('POST', '/api/sessions', { lessonId: l.id });
      expect(s.status).toBe(200);
      expect((await playSession(call, s.body.sessionId)).body.passed).toBe(true);
    }
    const boss = lessons.find((x: { kind: string }) => x.kind === 'BOSS');
    const s = await call('POST', '/api/sessions', { lessonId: boss.id });
    expect(s.status).toBe(200);
    const fin = await playSession(call, s.body.sessionId);
    expect(fin.body.cityCompleted.nextCity.slug).toBe('lodz');
    expect(fin.body.cityCompleted.rewards.map((r: { slug: string }) => r.slug)).toEqual(expect.arrayContaining(['souvenir-syrenka']));
    const p = await progress(user.id);
    expect((await db.query.cities.findFirst({ where: eq(cities.id, p.currentCityId!) }))?.slug).toBe('lodz');
    expect((await call('POST', '/api/sessions', { lessonId: await lessonId('lodz-1-alfabet') })).status).toBe(200);
    // Наступне місто після Лодзі ще закрите.
    expect((await call('POST', '/api/sessions', { lessonId: await lessonId('krk-1-rodzina') })).status).toBe(403);
    const ach = await db.select({ slug: achievements.slug }).from(userAchievements).innerJoin(achievements, eq(achievements.id, userAchievements.achievementId)).where(eq(userAchievements.userId, user.id));
    expect(ach.map((a) => a.slug)).toContain('city-1');
    // Паспорт: штамп Варшави з листівкою й нотаткою; наступні міста — без них.
    const pass = await call('GET', '/api/passport');
    expect(pass.body.stamps).toBe(1);
    const [waw, next] = pass.body.cities;
    expect(waw).toMatchObject({ slug: 'warszawa', stop: 1 });
    expect(waw.stampedAt).toBeTruthy();
    expect(waw.postcard.pl).toContain('Warszawie');
    expect(waw.note.uk).toContain('ЮНЕСКО');
    expect(next.stampedAt).toBeNull();
    expect(next.note).toBeNull();
  });

  it('вхідний тест відкриває міста як рекомендацію, але не підтверджує рівень', async () => {
    const { call, user } = await login();
    const s = await call('POST', '/api/sessions', { lessonId: await lessonId('placement-test') });
    const fin = await playSession(call, s.body.sessionId);
    expect(fin.body.placement).toMatchObject({ level: 'A1', unlocked: ['warszawa', 'lodz', 'krakow'] });
    const p = await progress(user.id);
    expect(p.languageLevel).toBe('A0');
    // Уроки міста, відкритого тестом, доступні не по черзі.
    expect((await call('POST', '/api/sessions', { lessonId: await lessonId('krk-4-tydzien') })).status).toBe(200);
  });

  it('іспит A1 підтверджує рівень польської', async () => {
    const { call, user } = await login();
    const s = await call('POST', '/api/sessions', { lessonId: await lessonId('exam-a1') });
    const fin = await playSession(call, s.body.sessionId);
    expect(fin.body).toMatchObject({ passed: true, levelConfirmed: 'A1' });
    expect((await progress(user.id)).languageLevel).toBe('A1');
  });

  it('тренування мають денний ліміт XP', async () => {
    const { call, user } = await login();
    await db.update(gameConfig).set({ value: { practiceXpDailyCap: 30 } }).where(eq(gameConfig.key, 'rewards'));
    (await import('../src/services/gameConfig')).invalidateRewards();
    try {
      const s1 = await call('POST', '/api/sessions', { mode: 'FIVE_MIN' });
      expect(s1.status).toBe(200);
      const f1 = await playSession(call, s1.body.sessionId);
      expect(f1.body.xp).toBe(30);
      const s2 = await call('POST', '/api/sessions', { mode: 'FIVE_MIN' });
      expect((await playSession(call, s2.body.sessionId)).body.xp).toBe(0);
      expect((await progress(user.id)).xpTotal).toBe(30);
    } finally {
      await db.update(gameConfig).set({ value: {} }).where(eq(gameConfig.key, 'rewards'));
      (await import('../src/services/gameConfig')).invalidateRewards();
    }
  });
});
