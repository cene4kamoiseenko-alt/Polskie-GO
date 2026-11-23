/**
 * «Сообщить об ошибке в задании» (2026-11-14, решение владельца): жалоба игрока на задание урока, повторения, экзамена или миссии.
 * Устройство — services/exercise-reports.ts, routes/learn.ts (POST /api/exercise-reports), routes/admin.ts (GET /api/admin/exercise-reports, POST …/resolve).
 * Клиент шлёт только ссылку на задание, причину и комментарий; снимок задания и последний ответ сервер берёт сам.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import type { ExerciseItem } from '@polski-go/shared';
import { db } from '../src/db';
import { exerciseReports } from '../src/db/schema';
import { MISSIONS } from '../src/content/missions';
import { EXERCISE_REPORT_COMMENT_MAX, MAX_EXERCISE_REPORTS_PER_DAY, snapshotOfItem } from '../src/services/exercise-reports';
import { disposeEnv, getEnv, lessonId, login, request, sessionItems, wrongAnswer } from './helpers';

afterAll(disposeEnv);

type Call = (method: 'GET' | 'POST' | 'PATCH' | 'DELETE', path: string, body?: unknown) => ReturnType<typeof request>;
const as = (token: string): Call => (method, path, body) => request(method, `/api/admin${path}`, body, { authorization: `Bearer ${token}` });
let root: Call;
let rootToken = '';
let seq = 0;
beforeAll(async () => {
  await getEnv();
  const s = (await request('POST', '/api/admin/login', { email: 'admin@test.dev', password: 'admin-password-123' })).body;
  rootToken = s.token;
  root = as(rootToken);
});
/** Администратор с ролью (вход ограничен: главный входит один раз). */
async function makeAdmin(role: 'EDITOR' | 'SUPPORT') {
  const email = `${role.toLowerCase()}-xr-${++seq}@test.dev`;
  expect((await root('POST', '/admins', { email, name: `${role} ${seq}`, role, password: 'role-password-123' })).status).toBe(200);
  const s = (await request('POST', '/api/admin/login', { email, password: 'role-password-123' })).body;
  return as(s.token);
}

type Player = Awaited<ReturnType<typeof login>>;
const rowsOf = (userId: string) => db.select().from(exerciseReports).where(eq(exerciseReports.userId, userId));

/**
 * Урок Варшавы: сессия и n-е задание с вариантами ответа (верный и неверные). Жалобы разных игроков на одно задание складываются
 * в одну группу, поэтому каждый тест берёт своё задание (n): иначе строки соседних тестов попадают в подсчёт.
 */
async function lesson(p: Player, n = 0) {
  const s = await p.call('POST', '/api/sessions', { lessonId: await lessonId('waw-1-czesc') });
  expect(s.status).toBe(200);
  const sessionId = s.body.sessionId as string;
  const items = await sessionItems(sessionId);
  const choices = items.filter((i: ExerciseItem) => i.type !== 'DIALOGUE' && i.type !== 'SITUATION' && Array.isArray((i.data as { options?: unknown[] }).options) && (i.data as { answer?: string }).answer);
  expect(choices.length, 'в первом уроке достаточно заданий с вариантами').toBeGreaterThan(n);
  return { sessionId, item: choices[n] as ExerciseItem, choices: choices as ExerciseItem[] };
}

describe('жалоба на задание урока', () => {
  it('сервер сам берёт снимок задания и последний ответ игрока; клиент шлёт только ссылку, причину и комментарий', async () => {
    const u = await login();
    const { sessionId, item } = await lesson(u);
    // Игрок ответил неверно — этот ответ попадёт в жалобу.
    expect((await u.call('POST', `/api/sessions/${sessionId}/answer`, { key: item.key, answer: wrongAnswer(item) })).status).toBe(200);
    const res = await u.call('POST', '/api/exercise-reports', { sessionId, key: item.key, reason: 'answer_rejected', comment: '  Мой ответ верный  ' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, updated: false });
    const rows = await rowsOf(u.user.id);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      target: `exercise:${item.exerciseId}`, source: 'lesson', exerciseId: item.exerciseId, lessonSlug: 'waw-1-czesc', itemType: item.type,
      reason: 'answer_rejected', comment: 'Мой ответ верный', status: 'NEW', uiLang: expect.any(String),
    });
    const snap = rows[0].snapshot as { type: string; where: string; texts: string[]; options: { text: string; correct?: boolean }[] };
    expect(snap).toMatchObject({ type: item.type, where: 'урок' });
    expect(snap.texts.length).toBeGreaterThan(0);
    // Верный вариант отмечен ровно один раз — админ видит, что считалось правильным.
    expect(snap.options.filter((o) => o.correct)).toHaveLength(1);
    expect(snap.options.length).toBeGreaterThanOrEqual(2);
    expect(rows[0].answer).toMatchObject({ correct: false });
  });

  it('повтор по тому же заданию обновляет жалобу и открывает её снова, второй строки нет; жалобы разных игроков складываются в одну группу админки', async () => {
    const a = await login();
    const b = await login();
    const la = await lesson(a, 1);
    const lb = await lesson(b, 1);
    expect(lb.item.exerciseId).toBe(la.item.exerciseId);
    const ref = { sessionId: la.sessionId, key: la.item.key };
    expect((await a.call('POST', '/api/exercise-reports', { ...ref, reason: 'too_easy' })).body).toEqual({ ok: true, updated: false });
    expect((await b.call('POST', '/api/exercise-reports', { sessionId: lb.sessionId, key: lb.item.key, reason: 'polish_error', comment: 'Опечатка' })).status).toBe(200);

    const target = `exercise:${la.item.exerciseId}`;
    const list = (await root('GET', '/exercise-reports?status=NEW')).body.items as { target: string; count: number; reasons: Record<string, number>; status: string; comments: { comment: string }[] }[];
    const group = list.find((g) => g.target === target)!;
    expect(group).toMatchObject({ count: 2, status: 'NEW', reasons: { too_easy: 1, polish_error: 1 } });
    expect(group.comments.some((c) => c.comment === 'Опечатка')).toBe(true);
    // Админка не получает ни id игрока, ни Telegram id.
    expect(JSON.stringify(list)).not.toContain(a.user.id);
    expect(JSON.stringify(list)).not.toContain(String(a.telegramId));

    // Разбор: «Исправлено» с заметкой → из новых уходит; игрок пишет снова — жалоба открывается заново.
    const fixed = await root('POST', '/exercise-reports/resolve', { target, status: 'FIXED', note: 'Поправили вариант' });
    expect(fixed.body).toEqual({ ok: true, changed: 2 });
    expect(((await root('GET', '/exercise-reports?status=NEW')).body.items as { target: string }[]).some((g) => g.target === target)).toBe(false);
    const done = ((await root('GET', '/exercise-reports?status=FIXED')).body.items as { target: string; note: string | null }[]).find((g) => g.target === target)!;
    expect(done.note).toBe('Поправили вариант');
    expect((await a.call('POST', '/api/exercise-reports', { ...ref, reason: 'unclear', comment: 'Всё ещё непонятно' })).body).toEqual({ ok: true, updated: true });
    const mine = await rowsOf(a.user.id);
    expect(mine).toHaveLength(1);
    expect(mine[0]).toMatchObject({ reason: 'unclear', comment: 'Всё ещё непонятно', status: 'NEW', resolvedAt: null });
    // У второго игрока жалоба осталась исправленной — повтор открыл только жалобу первого.
    expect((await rowsOf(b.user.id))[0].status).toBe('FIXED');
  });

  it('чужую сессию, несуществующий ключ, неизвестную причину и «Другое» без текста сервер отклоняет; без входа — 401', async () => {
    const a = await login();
    const b = await login();
    const { sessionId, item } = await lesson(a, 2);
    const ok = { sessionId, key: item.key, reason: 'unclear' };
    expect((await b.call('POST', '/api/exercise-reports', ok)).status).toBe(404);
    expect((await a.call('POST', '/api/exercise-reports', { ...ok, key: 'no-such-item' })).status).toBe(404);
    expect((await a.call('POST', '/api/exercise-reports', { ...ok, sessionId: 'no-such-session' })).status).toBe(404);
    expect((await a.call('POST', '/api/exercise-reports', { ...ok, reason: 'spam' })).status).toBe(400);
    expect((await a.call('POST', '/api/exercise-reports', { sessionId, reason: 'unclear' })).status).toBe(400);
    expect((await a.call('POST', '/api/exercise-reports', { ...ok, reason: 'other' })).status).toBe(400);
    expect((await a.call('POST', '/api/exercise-reports', { ...ok, reason: 'other', comment: '  ' })).status).toBe(400);
    expect((await a.call('POST', '/api/exercise-reports', { ...ok, comment: 'x'.repeat(EXERCISE_REPORT_COMMENT_MAX + 1) })).status).toBe(400);
    expect((await request('POST', '/api/exercise-reports', ok)).status).toBe(401);
    expect(await rowsOf(a.user.id)).toHaveLength(0);
    expect(await rowsOf(b.user.id)).toHaveLength(0);
    // «Другое» с текстом принимается.
    expect((await a.call('POST', '/api/exercise-reports', { ...ok, reason: 'other', comment: 'Не работает кнопка' })).status).toBe(200);
  });

  it(`не больше ${MAX_EXERCISE_REPORTS_PER_DAY} новых жалоб в сутки; повтор по уже названному заданию предел не обходит и не считается новым`, async () => {
    const u = await login();
    const { sessionId, item, choices } = await lesson(u, 3);
    const ref = { sessionId, key: item.key };
    expect((await u.call('POST', '/api/exercise-reports', { ...ref, reason: 'unclear' })).status).toBe(200);
    // До предела дописываем жалобы напрямую (ограничитель частоты запросов здесь не проверяется, только суточный).
    // По одной строке: D1 принимает не больше 100 параметров на запрос.
    for (let i = 0; i < MAX_EXERCISE_REPORTS_PER_DAY - 1; i++) {
      await db.insert(exerciseReports).values({ userId: u.user.id, target: `exercise:direct-${i}`, source: 'lesson', reason: 'unclear' });
    }
    // Другое задание того же урока — это уже новая жалоба сверх предела.
    const over = await u.call('POST', '/api/exercise-reports', { sessionId, key: choices.find((c) => c.key !== item.key)!.key, reason: 'unclear' });
    expect(over.status).toBe(429);
    expect(JSON.stringify(over.body)).toContain('too_many_reports');
    expect((await u.call('POST', '/api/exercise-reports', { ...ref, reason: 'audio' })).body).toEqual({ ok: true, updated: true });
    expect(await rowsOf(u.user.id)).toHaveLength(MAX_EXERCISE_REPORTS_PER_DAY);
  });
});

describe('жалоба на шаг миссии', () => {
  it('шаг находится по slug и id; снимок хранит текст шага и варианты с отметкой верных; неизвестный шаг — 404', async () => {
    const u = await login();
    const mission = MISSIONS.find((m) => m.steps.some((s) => s.options?.length))!;
    const step = mission.steps.find((s) => s.options?.length)!;
    const res = await u.call('POST', '/api/exercise-reports', { mission: mission.slug, step: step.id, reason: 'translation_error', comment: 'Перевод реплики' });
    expect(res.status).toBe(200);
    const row = (await rowsOf(u.user.id))[0];
    expect(row).toMatchObject({ target: `mission:${step.id}`, source: 'mission', lessonSlug: mission.slug, exerciseId: null, reason: 'translation_error' });
    const snap = row.snapshot as { where: string; options: { text: string; correct?: boolean }[] };
    expect(snap.where).toBe('миссия');
    expect(snap.options.filter((o) => o.correct).length).toBe(step.options!.filter((o) => o.ok).length);
    expect((await u.call('POST', '/api/exercise-reports', { mission: mission.slug, step: 'no-such-step', reason: 'unclear' })).status).toBe(404);
    expect((await u.call('POST', '/api/exercise-reports', { mission: 'no-such-mission', step: step.id, reason: 'unclear' })).status).toBe(404);
  });
});

describe('разбор в админке', () => {
  it('права: главный админ и редактор разбирают, поддержка — нет; без входа 401; значок меню считает задания с новыми жалобами', async () => {
    const u = await login();
    const { sessionId, item } = await lesson(u, 4);
    await u.call('POST', '/api/exercise-reports', { sessionId, key: item.key, reason: 'answer_accepted' });
    const target = `exercise:${item.exerciseId}`;
    const editor = await makeAdmin('EDITOR');
    const support = await makeAdmin('SUPPORT');
    expect((await support('GET', '/exercise-reports')).status).toBe(403);
    expect((await support('POST', '/exercise-reports/resolve', { target, status: 'REVIEW' })).status).toBe(403);
    expect((await request('GET', '/api/admin/exercise-reports')).status).toBe(401);
    expect((await editor('GET', '/exercise-reports')).status).toBe(200);
    expect((await root('GET', '/attention')).body.exerciseReports).toBeGreaterThanOrEqual(1);

    // Статусы: в работе → отклонено (с заметкой); неизвестный статус и пустая цель — 400; жалоб на цель нет — 404.
    expect((await editor('POST', '/exercise-reports/resolve', { target, status: 'REVIEW' })).body).toEqual({ ok: true, changed: 1 });
    const review = ((await root('GET', '/exercise-reports?status=REVIEW')).body.items as { target: string; status: string }[]).find((g) => g.target === target);
    expect(review?.status).toBe('REVIEW');
    expect((await editor('POST', '/exercise-reports/resolve', { target, status: 'REJECTED', note: 'Верный вариант один' })).status).toBe(200);
    expect((await root('POST', '/exercise-reports/resolve', { target, status: 'DONE' })).status).toBe(400);
    expect((await root('POST', '/exercise-reports/resolve', { target: '', status: 'FIXED' })).status).toBe(400);
    expect((await root('POST', '/exercise-reports/resolve', { target: 'exercise:none', status: 'FIXED' })).status).toBe(404);
    expect((await root('GET', '/exercise-reports?status=SOON')).status).toBe(400);
    // Действие попало в журнал действий.
    const audit = (await root('GET', '/audit?action=exercise_report_rejected')).body;
    expect(JSON.stringify(audit)).toContain(target);
  });
});

describe('снимок задания показывает, о чём жалоба (жалоба владельцу 2026-11-23: «ошибка в переводе», а в админке пусто)', () => {
  it('«Соедини пары» — все пары «польское — перевод»; перевод предложения — исходный текст и верный ответ; грамматика — базовая форма', () => {
    const pairs = snapshotOfItem({ key: 'k', type: 'MATCH_PAIRS', skill: 'vocab.jobs', data: { pairs: [
      { l: 'a', r: 'b', pl: 'lekarz', tr: { uk: 'лікар', ru: 'врач', en: 'doctor' } },
      { l: 'c', r: 'd', pl: 'kucharz', tr: { uk: 'кухар', ru: 'повар', en: 'cook' } },
    ] } } as unknown as ExerciseItem, 'урок');
    expect(pairs.options?.map((o) => o.text)).toEqual(['lekarz — врач', 'kucharz — повар']);
    const tr = snapshotOfItem({ key: 'k', type: 'SENTENCE_TRANSLATION', skill: 's', data: { source: { uk: 'Я лікар.', ru: 'Я врач.', en: 'I am a doctor.' }, accepted: ['Jestem lekarzem.', 'Jestem lekarzem'] } } as unknown as ExerciseItem, 'урок');
    expect(tr.texts).toContain('Я врач.');
    expect(tr.texts.join(' ')).toContain('Jestem lekarzem.');
    const gr = snapshotOfItem({ key: 'k', type: 'GRAMMAR', skill: 's', data: { pl: 'On ___ lekarzem.', base: 'być', accepted: ['jest'] } } as unknown as ExerciseItem, 'урок');
    expect(gr.texts.join(' ')).toContain('być');
  });

  it('старая жалоба с пустым снимком: админка собирает его из задания (пары видны)', async () => {
    const u = await login();
    const ex = await db.query.exercises.findFirst({ where: (t, { eq: e }) => e(t.type, 'MATCH_PAIRS') });
    expect(ex, 'в курсе есть задание «Соедини пары»').toBeTruthy();
    const target = `exercise:${ex!.id}`;
    await db.insert(exerciseReports).values({ userId: u.user.id, target, source: 'lesson', exerciseId: ex!.id, lessonSlug: 'x', itemType: 'MATCH_PAIRS', reason: 'translation_error', snapshot: { type: 'MATCH_PAIRS', where: 'урок', texts: [] }, uiLang: 'ru' });
    const g = ((await root('GET', '/exercise-reports')).body.items as { target: string; snapshot: { options?: { text: string }[] } }[]).find((x) => x.target === target)!;
    const first = (ex!.data as { pairs: { pl: string }[] }).pairs[0].pl;
    expect(g.snapshot.options?.some((o) => o.text.startsWith(`${first} — `))).toBe(true);
  });
});

describe('данные игрока', () => {
  it('сообщения об ошибках входят в экспорт данных и удаляются вместе с аккаунтом', async () => {
    const u = await login();
    const mission = MISSIONS[0];
    const step = mission.steps[0];
    expect((await u.call('POST', '/api/exercise-reports', { mission: mission.slug, step: step.id, reason: 'unclear', comment: 'Моё замечание' })).status).toBe(200);
    const exp = await u.call('GET', '/api/me/export');
    expect(exp.status).toBe(200);
    expect(exp.body.exerciseReports).toEqual([expect.objectContaining({ target: `mission:${step.id}`, source: 'mission', reason: 'unclear', comment: 'Моё замечание', status: 'NEW' })]);
    expect((await u.call('DELETE', '/api/me', { confirm: 'DELETE' })).status).toBe(200);
    expect(await rowsOf(u.user.id)).toHaveLength(0);
  });
});
