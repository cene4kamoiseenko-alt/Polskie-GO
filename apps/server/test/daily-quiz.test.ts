/**
 * Вопрос дня целиком: состояние рассылки и план на 30 дней, кто получает, отправка частями по минутному cron, ответ (XP, процент,
 * серия), выключатели, /stop, напоминания и приглашения при включённой рассылке. Telegram подменён (`fakeTelegram`).
 */
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { and, eq, inArray } from 'drizzle-orm';
import { db } from '../src/db';
import { botContacts, botQuizPlayers, dailyQuizPeople, dailyQuizPlan, dailyQuizQuestions, dailyQuizSends, playerProgress, userProfiles, userSettings, users } from '../src/db/schema';
import { allPeople, dailyAudience, dailyEligibility, quizLevel, type DailyPerson } from '../src/bot/daily/audience';
import { DAILY_CRON, runDailyQuizTick } from '../src/bot/daily/send';
import worker from '../src/worker';
import { readDailyRun } from '../src/bot/daily/state';
import { QUESTION_BY_ID, QUIZ_QUESTIONS } from '../src/bot/quiz/questions';
import { addDays, isDayEditable, isSendingDay, readDailyState, sendWindow, warsawDay, writeDailyState } from '../src/bot/daily/state';
import { ensurePlan, pickDaily, planRange, replacePlanItem, setDaySkipped, setQuestionDisabled } from '../src/bot/daily/plan';
import { disposeEnv, getEnv, login, request } from './helpers';
import { botQuizRounds, notificationLog } from '../src/db/schema';
import { pickQuestion } from '../src/bot/quiz/engine';
import { runScheduled, sendReminders } from '../src/jobs';
import { fakeTelegram, tgError, type TgCall } from './tg-fake';

const ORIGIN = 'https://polski.example';

beforeAll(async () => {
  const { env } = await getEnv();
  env.WEB_APP_URL = `${ORIGIN}/app/`;
  env.TELEGRAM_BOT_USERNAME = 'Polski_Go_Bot';
});
afterAll(disposeEnv);
afterEach(() => vi.unstubAllGlobals());

const levelOf = (id: string) => QUESTION_BY_ID.get(id)!.cefr;

describe('состояние рассылки', () => {
  it('по умолчанию выключена, 18:00, без даты старта; запись частичная', async () => {
    expect(await readDailyState()).toEqual({ enabled: false, sendAt: '18:00', startDay: null });
    expect(await writeDailyState({ sendAt: '19:15' })).toEqual({ enabled: false, sendAt: '19:15', startDay: null });
    await writeDailyState({ sendAt: '18:00' });
  });

  it('день по Варшаве и окно отправки 4 часа: летом 18:00 = 16:00 UTC, зимой = 17:00 UTC', () => {
    expect(warsawDay(new Date('2026-12-01T23:30:00Z'))).toBe('2026-12-02');
    const st = { enabled: true, sendAt: '18:00', startDay: '2026-01-01' };
    expect(sendWindow(st, '2026-07-01')).toEqual({ from: new Date('2026-07-01T16:00:00Z'), to: new Date('2026-07-01T20:00:00Z') });
    expect(sendWindow(st, '2026-12-01')).toEqual({ from: new Date('2026-12-01T17:00:00Z'), to: new Date('2026-12-01T21:00:00Z') });
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(isSendingDay(st, '2026-12-01')).toBe(true);
    expect(isSendingDay({ ...st, startDay: '2026-12-02' }, '2026-12-01')).toBe(false);
    expect(isSendingDay({ ...st, enabled: false }, '2026-12-01')).toBe(false);
  });

  it('день можно менять: будущий — да; сегодня — пока отправка не началась; прошлый — нет', () => {
    expect(isDayEditable('2026-12-02', '2026-12-01', null)).toBe(true);
    expect(isDayEditable('2026-12-01', '2026-12-01', null)).toBe(true);
    expect(isDayEditable('2026-12-01', '2026-12-01', { day: '2026-12-01', cursor: 5, done: false, startedAt: 1 })).toBe(false);
    expect(isDayEditable('2026-11-30', '2026-12-01', null)).toBe(false);
  });
});

describe('план на 30 дней', () => {
  it('ensurePlan создаёт 30 дней × 3 уровня, повторный вызов ничего не меняет', async () => {
    await ensurePlan('2026-12-01');
    const rows = await planRange('2026-12-01', 30);
    expect(rows).toHaveLength(90);
    for (const r of rows) expect(levelOf(r.questionId), `${r.day} ${r.level}`).toBe(r.level);
    await ensurePlan('2026-12-01');
    expect(await planRange('2026-12-01', 30)).toEqual(rows);
  });

  it('у каждого уровня: вопрос не повторяется, картинка не та же, что вчера, тема по возможности другая', async () => {
    const rows = await planRange('2026-12-01', 30);
    for (const level of ['A1', 'A2', 'B1'] as const) {
      const days = rows.filter((r) => r.level === level).sort((a, b) => a.day.localeCompare(b.day));
      const pool = QUIZ_QUESTIONS.filter((q) => q.cefr === level).length;
      if (pool >= 30) expect(new Set(days.map((d) => d.questionId)).size, level).toBe(30);
      for (let i = 1; i < days.length; i++) expect(days[i].image, `${level} ${days[i].day}`).not.toBe(days[i - 1].image);
    }
  });

  it('pickDaily детерминирован и не берёт выключенные и недавние вопросы', () => {
    const disabled = new Set(QUIZ_QUESTIONS.filter((q) => q.cefr === 'A1').slice(0, 3).map((q) => q.id));
    const a = pickDaily('A1', '2027-02-01', [], disabled);
    expect(pickDaily('A1', '2027-02-01', [], disabled).id).toBe(a.id);
    expect(disabled.has(a.id)).toBe(false);
    const b = pickDaily('A1', '2027-02-02', [{ day: '2027-02-01', questionId: a.id, image: a.image }], disabled);
    expect(b.id).not.toBe(a.id);
    expect(b.image).not.toBe(a.image);
  });

  it('выключенный вопрос уходит из будущих дней и больше не попадает в план', async () => {
    const rows = await planRange('2026-12-01', 30);
    const victim = rows.find((r) => r.day === '2026-12-05')!;
    await setQuestionDisabled(victim.questionId, true, null, '2026-12-01');
    const after = await planRange('2026-12-01', 30);
    expect(after.map((r) => r.questionId)).not.toContain(victim.questionId);
    expect(after).toHaveLength(90);
    expect((await db.select().from(dailyQuizQuestions).where(eq(dailyQuizQuestions.questionId, victim.questionId)))[0].disabled).toBe(true);
    await setQuestionDisabled(victim.questionId, false, null, '2026-12-01');
  });

  it('замена вопроса и картинки: только вопрос того же уровня и картинка из 16 сцен; пропуск дня отмечает все уровни', async () => {
    const other = QUIZ_QUESTIONS.find((q) => q.cefr === 'B1')!;
    await expect(replacePlanItem('2026-12-10', 'A1', { questionId: other.id }, null)).rejects.toThrow('wrong_level');
    await expect(replacePlanItem('2026-12-10', 'A1', { image: 'zabka' as never }, null)).rejects.toThrow('bad_image');
    await expect(replacePlanItem('2026-12-10', 'A1', { questionId: 'nope' }, null)).rejects.toThrow('unknown_question');
    const a1 = QUIZ_QUESTIONS.filter((q) => q.cefr === 'A1')[5];
    await replacePlanItem('2026-12-10', 'A1', { questionId: a1.id }, null);
    await replacePlanItem('2026-12-10', 'A1', { image: 'pierniki' }, null);
    const row = (await planRange('2026-12-10', 1)).find((r) => r.level === 'A1')!;
    expect(row).toMatchObject({ questionId: a1.id, image: 'pierniki' });
    await setDaySkipped('2026-12-11', true, null);
    expect((await db.select().from(dailyQuizPlan).where(eq(dailyQuizPlan.day, '2026-12-11'))).map((r) => r.skipped)).toEqual([true, true, true]);
  });
});

// ───────────── Кто получает вопрос дня ─────────────

let tgSeq = 9_100_000;
const longAgo = new Date('2026-10-01T10:00:00Z');
/** Человек, который писал боту, но не открывал приложение. */
async function botOnly(lang = 'uk', extra: Partial<typeof botContacts.$inferInsert> = {}) {
  const telegramId = ++tgSeq;
  await db.insert(botContacts).values({ telegramId, firstName: `Bot${telegramId}`, languageCode: lang, firstSeenAt: longAgo, lastSeenAt: longAgo, ...extra });
  return telegramId;
}
/** Игрок приложения (вход через Telegram); по умолчанию напоминания выключены — вопрос дня всё равно приходит. */
async function appPlayer(placement: 'A1' | 'A2' | 'B1' | null = null) {
  const u = await login();
  await db.update(users).set({ lastSeenAt: longAgo }).where(eq(users.id, u.user.id));
  if (placement) await db.update(userProfiles).set({ placementLevel: placement }).where(eq(userProfiles.userId, u.user.id));
  return u;
}

const person = (p: Partial<DailyPerson>): DailyPerson => ({
  telegramId: 1, userId: null, banned: false, uiLanguage: null, contactLang: 'uk', blockedAt: null, contactSeenAt: longAgo, appSeenAt: null,
  pushEnabled: null, ignored: 0, lastSentAt: null, noChatAt: null, languageLevel: null, placementLevel: null, selfLevel: null,
  streakCurrent: null, lastActiveDay: null, timezone: null, firstName: '', username: null, ...p,
});

describe('кто получает', () => {
  it('правило: заблокирован админом, выключил, заблокировал бота, нет чата, пауза после 3 без ответа', () => {
    expect(dailyEligibility(person({}))).toBe('ok');
    expect(dailyEligibility(person({ banned: true }))).toBe('banned');
    expect(dailyEligibility(person({ pushEnabled: false }))).toBe('opted_out');
    expect(dailyEligibility(person({ blockedAt: new Date() }))).toBe('blocked');
    const t = new Date('2027-01-01T17:00:00Z');
    expect(dailyEligibility(person({ noChatAt: t }))).toBe('no_chat');
    expect(dailyEligibility(person({ noChatAt: t, contactSeenAt: new Date(t.getTime() + 1) }))).toBe('ok');
    expect(dailyEligibility(person({ ignored: 3, lastSentAt: t }))).toBe('paused');
    expect(dailyEligibility(person({ ignored: 2, lastSentAt: t }))).toBe('ok');
    expect(dailyEligibility(person({ ignored: 3, lastSentAt: t, appSeenAt: new Date(t.getTime() + 1) }))).toBe('ok');
    expect(dailyEligibility(person({ ignored: 3, lastSentAt: t, contactSeenAt: new Date(t.getTime() + 1) }))).toBe('ok');
  });

  it('уровень: подтверждённый экзаменом, иначе тест или самооценка; без уровня — A1; B2 и выше — B1', () => {
    expect(quizLevel(null, null, null)).toBe('A1');
    expect(quizLevel('A0', 'A2', null)).toBe('A2');
    expect(quizLevel('B1', 'A1', null)).toBe('B1');
    expect(quizLevel('A0', null, 'B2')).toBe('B1');
  });

  it('из базы: только писал боту, игрок с выключенными напоминаниями — получают; гость, бан, блок, «не присылать», «нет чата» — нет', async () => {
    const bot = await botOnly('en');
    const app = await appPlayer('A2');
    await db.update(userSettings).set({ notificationsEnabled: false }).where(eq(userSettings.userId, app.user.id));
    await db.insert(users).values({ telegramId: -777_001, firstName: 'Guest', referralCode: 'GUEST777' });
    const banned = await appPlayer();
    await db.update(users).set({ isBanned: true }).where(eq(users.id, banned.user.id));
    const blocked = await botOnly('ru', { blockedAt: longAgo });
    const optedOut = await botOnly();
    await db.insert(botQuizPlayers).values({ telegramId: optedOut, pushEnabled: false });
    const noChat = await botOnly();
    await db.insert(dailyQuizPeople).values({ telegramId: noChat, noChatAt: new Date('2026-12-01T00:00:00Z') });

    const people = await allPeople();
    const of = (tg: number) => people.find((p) => p.telegramId === tg)!;
    expect(people.find((p) => p.telegramId === -777_001)).toBeUndefined();
    expect(dailyEligibility(of(bot))).toBe('ok');
    expect(of(bot).userId).toBeNull();
    expect(dailyEligibility(of(app.telegramId))).toBe('ok');
    expect(of(app.telegramId).placementLevel).toBe('A2');
    expect(dailyEligibility(of(banned.telegramId))).toBe('banned');
    expect(dailyEligibility(of(blocked))).toBe('blocked');
    expect(dailyEligibility(of(optedOut))).toBe('opted_out');
    expect(dailyEligibility(of(noChat))).toBe('no_chat');
    const audience = await dailyAudience();
    expect(audience.total).toBe(people.filter((p) => dailyEligibility(p) === 'ok').length);
    expect(audience.excluded.blocked).toBeGreaterThanOrEqual(1);
    expect(audience.byLevel.A2).toBeGreaterThanOrEqual(1);
  });
});

// ───────────── Отправка ─────────────

/** 18:00 по Варшаве зимой = 17:00 UTC. */
const at = (day: string, utc = '17:01') => new Date(`${day}T${utc}:00Z`);
const toChats = (calls: TgCall[], ids: number[]) => calls.filter((c) => ids.includes(c.params.chat_id));
async function launch(startDay: string) {
  await writeDailyState({ enabled: true, sendAt: '18:00', startDay });
}
/** Прогнать минутные запуски одного дня до конца отправки. */
async function runDay(day: string, budget = 40) {
  let calls = 0;
  for (let i = 0; i < 20; i++) {
    const r = await runDailyQuizTick(new Date(at(day).getTime() + i * 60_000), budget);
    calls += r.calls;
    if ((await readDailyRun())?.done) break;
  }
  return calls;
}

describe('отправка', () => {
  it('до запуска, до 18:00, после окна в 4 часа и в пропущенный день — ничего не уходит', async () => {
    const tg = await botOnly();
    const calls = fakeTelegram();
    await writeDailyState({ enabled: false, startDay: '2027-01-04' });
    expect((await runDailyQuizTick(at('2027-01-04'))).calls).toBe(0);
    await launch('2027-01-04');
    expect((await runDailyQuizTick(at('2027-01-04', '16:59'))).calls).toBe(0);
    expect((await runDailyQuizTick(at('2027-01-04', '21:01'))).calls).toBe(0);
    await ensurePlan('2027-01-05', 1);
    await setDaySkipped('2027-01-05', true, null);
    expect((await runDailyQuizTick(at('2027-01-05'))).calls).toBe(0);
    expect(toChats(calls, [tg])).toEqual([]);
    await writeDailyState({ enabled: false });
  });

  it('в 18:00 — фото сцены, «Pytanie dnia», 4 кнопки; один человек в боте и в приложении — одно сообщение; повторный запуск не шлёт', async () => {
    const both = await appPlayer('B1');
    await db.insert(botContacts).values({ telegramId: both.telegramId, firstName: 'Both', languageCode: 'ru', firstSeenAt: longAgo, lastSeenAt: longAgo });
    await db.update(playerProgress).set({ streakCurrent: 4, lastActiveDay: '2027-01-05' }).where(eq(playerProgress.userId, both.user.id));
    const bot = await botOnly('ru');
    await launch('2027-01-06');
    const calls = fakeTelegram();
    await runDay('2027-01-06');
    const mine = toChats(calls, [both.telegramId, bot]);
    expect(mine.map((c) => c.params.chat_id).sort()).toEqual([both.telegramId, bot].sort());
    for (const c of mine) {
      expect(c.method).toBe('sendPhoto');
      expect(c.params.photo).toMatch(/\/bot\/quiz\/[a-z-]+\.jpg\?v=/);
      expect(c.params.caption).toContain('Pytanie dnia');
      const answers = (c.params.reply_markup.inline_keyboard as { callback_data?: string }[][]).flat().filter((b) => b.callback_data?.startsWith('qa:'));
      expect(answers).toHaveLength(4);
    }
    // Серия 4 дня, сегодня не занимался — строка серии и кнопка урока до ответа.
    expect(mine.find((c) => c.params.chat_id === both.telegramId)!.params.caption).toMatch(/🔥/);
    const sends = await db.select().from(dailyQuizSends).where(and(eq(dailyQuizSends.day, '2027-01-06'), inArray(dailyQuizSends.telegramId, [both.telegramId, bot])));
    expect(sends.map((r) => r.status)).toEqual(['SENT', 'SENT']);
    expect(sends.find((r) => r.telegramId === both.telegramId)).toMatchObject({ level: 'B1', userId: both.user.id });
    expect(sends.find((r) => r.telegramId === bot)).toMatchObject({ level: 'A1', userId: null, lang: 'ru' });
    const again = fakeTelegram();
    await runDailyQuizTick(at('2027-01-06', '17:30'));
    expect(toChats(again, [both.telegramId, bot])).toEqual([]);
  });

  it('бюджет за запуск соблюдается, следующий запуск продолжает с того же места', async () => {
    for (let i = 0; i < 5; i++) await botOnly();
    await launch('2027-01-07');
    const calls = fakeTelegram();
    expect((await runDailyQuizTick(at('2027-01-07'), 2)).calls).toBe(2);
    expect(calls).toHaveLength(2);
    expect((await runDailyQuizTick(at('2027-01-07', '17:02'), 2)).calls).toBe(2);
    expect(new Set(calls.map((c) => c.params.chat_id)).size).toBe(4);
    await runDay('2027-01-07');
    const sent = await db.select().from(dailyQuizSends).where(eq(dailyQuizSends.day, '2027-01-07'));
    expect(new Set(sent.map((r) => r.telegramId)).size).toBe(sent.length);
  });

  it('два запуска одновременно с одним курсором — каждому человеку ровно одно сообщение', async () => {
    const ids = [await botOnly(), await botOnly(), await botOnly()];
    await launch('2027-01-16');
    const calls = fakeTelegram();
    await Promise.all([runDailyQuizTick(at('2027-01-16')), runDailyQuizTick(at('2027-01-16'))]);
    const mine = toChats(calls, ids);
    expect(mine).toHaveLength(3);
    expect(new Set(mine.map((c) => c.params.chat_id)).size).toBe(3);
  });

  it('ошибка базы посреди запуска: запуск не падает, прогресс до неё сохранён, следующий запуск продолжает с того же человека', async () => {
    const { env } = await getEnv();
    const ids = [await botOnly(), await botOnly(), await botOnly(), await botOnly()];
    const bad = ids[2];
    await launch('2027-01-18');
    await env.DB.prepare(`CREATE TRIGGER daily_fail_claim BEFORE INSERT ON daily_quiz_sends WHEN NEW.telegram_id = ${bad} BEGIN SELECT RAISE(ABORT, 'boom'); END`).run();
    try {
      const calls = fakeTelegram();
      const run = await runDailyQuizTick(at('2027-01-18'));
      expect(run.sent).toBeGreaterThanOrEqual(2);
      expect(toChats(calls, [bad, ids[3]])).toHaveLength(0);
      expect((await readDailyRun())?.cursor).toBe(ids[1]);
    } finally {
      await env.DB.prepare('DROP TRIGGER daily_fail_claim').run();
    }
    const calls = fakeTelegram();
    await runDailyQuizTick(at('2027-01-18', '17:02'));
    expect(toChats(calls, ids).map((c) => c.params.chat_id)).toEqual(expect.arrayContaining([bad, ids[3]]));
    expect(toChats(calls, [ids[0], ids[1]])).toHaveLength(0);
    const rows = await db.select().from(dailyQuizSends).where(and(eq(dailyQuizSends.day, '2027-01-18'), inArray(dailyQuizSends.telegramId, ids)));
    expect(rows.map((r) => r.status)).toEqual(Array(4).fill('SENT'));
  });

  it('курсор сохраняется по ходу запуска, а не только в конце: оборванный запуск не заставит начинать заново', async () => {
    const { env } = await getEnv();
    for (let i = 0; i < 20; i++) await botOnly();
    await launch('2027-01-19');
    await env.DB.prepare('CREATE TABLE daily_cursor_log (id INTEGER PRIMARY KEY AUTOINCREMENT, v TEXT)').run();
    for (const [name, when] of [['ins', 'INSERT'], ['upd', 'UPDATE']] as const)
      await env.DB.prepare(`CREATE TRIGGER daily_cursor_${name} AFTER ${when} ON app_state WHEN NEW.key = 'daily_quiz_run' BEGIN INSERT INTO daily_cursor_log (v) VALUES (NEW.value); END`).run();
    try {
      fakeTelegram();
      await runDailyQuizTick(at('2027-01-19'));
      const writes = (await env.DB.prepare('SELECT v FROM daily_cursor_log ORDER BY id').all<{ v: string }>()).results.map((r) => (JSON.parse(r.v) as { cursor: number }).cursor);
      expect(writes.length).toBeGreaterThanOrEqual(3);
      expect([...writes].sort((a, b) => a - b)).toEqual(writes);
      expect(writes.at(-1)).toBeGreaterThan(writes[0]);
    } finally {
      await env.DB.prepare('DROP TRIGGER daily_cursor_ins').run();
      await env.DB.prepare('DROP TRIGGER daily_cursor_upd').run();
      await env.DB.prepare('DROP TABLE daily_cursor_log').run();
    }
  });

  it('заблокировал бота → BLOCKED и больше не шлём; «нет чата с ботом» → NO_CHAT, пока снова не напишет', async () => {
    const blocker = await botOnly();
    const stranger = await botOnly();
    await launch('2027-01-08');
    fakeTelegram((c) =>
      c.params.chat_id === blocker ? tgError(403, 'Forbidden: bot was blocked by the user') : c.params.chat_id === stranger ? tgError(403, "Forbidden: bot can't initiate conversation with a user") : undefined,
    );
    await runDay('2027-01-08');
    const rows = await db.select().from(dailyQuizSends).where(and(eq(dailyQuizSends.day, '2027-01-08'), inArray(dailyQuizSends.telegramId, [blocker, stranger])));
    expect(Object.fromEntries(rows.map((r) => [r.telegramId, r.status]))).toEqual({ [blocker]: 'BLOCKED', [stranger]: 'NO_CHAT' });
    expect((await db.select().from(botContacts).where(eq(botContacts.telegramId, blocker)))[0].blockedAt).toBeTruthy();
    const calls = fakeTelegram();
    await launch('2027-01-09');
    await runDay('2027-01-09');
    expect(toChats(calls, [blocker, stranger])).toEqual([]);
    // Человек снова написал боту — вопрос приходит.
    await db.update(botContacts).set({ lastSeenAt: at('2027-01-09', '20:00') }).where(eq(botContacts.telegramId, stranger));
    await launch('2027-01-10');
    await runDay('2027-01-10');
    expect(toChats(calls, [stranger])).toHaveLength(1);
  });

  it('cron раз в минуту запускает вопрос дня, прежний cron раз в 15 минут — нет', async () => {
    const tg = await botOnly();
    await launch('2027-01-17');
    const { env } = await getEnv();
    const fire = async (cron: string, t: Date) => {
      const jobs: Promise<unknown>[] = [];
      await worker.scheduled!({ cron, scheduledTime: t.getTime(), noRetry() {} } as ScheduledController, env, { waitUntil: (p: Promise<unknown>) => jobs.push(p), passThroughOnException() {} } as unknown as ExecutionContext);
      await Promise.all(jobs);
    };
    const calls = fakeTelegram();
    await fire('*/15 * * * *', at('2027-01-17', '17:15'));
    expect(toChats(calls, [tg])).toEqual([]);
    await fire(DAILY_CRON, at('2027-01-17', '17:16'));
    expect(toChats(calls, [tg])).toHaveLength(1);
    expect(DAILY_CRON).toBe('* * * * *');
    const wrangler = (await import('node:fs')).readFileSync(new URL('../../../wrangler.jsonc', import.meta.url), 'utf8');
    expect(wrangler).toMatch(/"crons":\s*\["\*\/15 \* \* \* \*", "\* \* \* \* \*"\]/);
  });

  it('три вопроса подряд без ответа — пауза; после сообщения боту вопрос снова приходит', async () => {
    const silent = await botOnly();
    const calls = fakeTelegram();
    for (const day of ['2027-01-11', '2027-01-12', '2027-01-13', '2027-01-14']) {
      await launch(day);
      await runDay(day);
    }
    expect(toChats(calls, [silent])).toHaveLength(3);
    await db.update(botContacts).set({ lastSeenAt: at('2027-01-14', '20:00') }).where(eq(botContacts.telegramId, silent));
    await launch('2027-01-15');
    await runDay('2027-01-15');
    expect(toChats(calls, [silent])).toHaveLength(4);
    await writeDailyState({ enabled: false });
  });
});

// ───────────── Ответ, выключатель, /stop ─────────────

let upd = 70_000;
const hook = (body: unknown) => request('POST', '/telegram/webhook', body, { 'x-telegram-bot-api-secret-token': 'hook-secret' });
const press = (tg: number, data: string, messageId = 1) =>
  hook({ update_id: ++upd, callback_query: { id: `cb${upd}`, from: { id: tg, first_name: 'Ola', language_code: 'ru' }, message: { message_id: messageId, chat: { id: tg, type: 'private' } }, data } });
const say = (tg: number, text: string) => hook({ update_id: ++upd, message: { message_id: upd, chat: { id: tg, type: 'private' }, from: { id: tg, first_name: 'Ola', language_code: 'ru' }, text } });
/** Раунд вопроса дня человека за день и позиция верного (или неверного) варианта. */
async function dailyRound(tg: number, day: string) {
  const send = (await db.select().from(dailyQuizSends).where(and(eq(dailyQuizSends.day, day), eq(dailyQuizSends.telegramId, tg))))[0];
  const round = (await db.select().from(botQuizRounds).where(eq(botQuizRounds.id, send.roundId!)))[0];
  const q = QUESTION_BY_ID.get(round.questionId)!;
  return { send, round, pos: (correct: boolean) => round.optionOrder.findIndex((i) => (i === q.answer) === correct) };
}
const xpOf = async (userId: string) => (await db.select().from(playerProgress).where(eq(playerProgress.userId, userId)))[0].xpTotal;

describe('ответ на вопрос дня', () => {
  it('верный ответ с аккаунтом: итог в том же сообщении, +10 XP без лимита /quiz; повторное нажатие — без второго XP', async () => {
    const u = await appPlayer();
    await db.update(userSettings).set({ uiLanguage: 'ru' }).where(eq(userSettings.userId, u.user.id));
    await launch('2027-01-20');
    fakeTelegram();
    await runDay('2027-01-20');
    const { round, pos } = await dailyRound(u.telegramId, '2027-01-20');
    const before = await xpOf(u.user.id);
    const calls = fakeTelegram();
    expect((await press(u.telegramId, `qa:${round.id}:${pos(true)}`)).status).toBe(200);
    const edit = calls.find((c) => c.method === 'editMessageCaption')!;
    expect(edit.params.caption).toContain(QUESTION_BY_ID.get(round.questionId)!.explain.ru);
    expect(edit.params.caption).toContain('+10 XP');
    expect(JSON.stringify(edit.params.reply_markup)).toContain('qz:daily:0');
    expect(await xpOf(u.user.id)).toBe(before + 10);
    const player = (await db.select().from(botQuizPlayers).where(eq(botQuizPlayers.telegramId, u.telegramId)))[0];
    expect(player?.rewardCount ?? 0).toBe(0);
    const send = (await dailyRound(u.telegramId, '2027-01-20')).send;
    expect(send).toMatchObject({ correct: true, chosen: QUESTION_BY_ID.get(round.questionId)!.answer });
    expect(send.answeredAt).toBeTruthy();
    await press(u.telegramId, `qa:${round.id}:${pos(true)}`);
    expect(await xpOf(u.user.id)).toBe(before + 10);
  });

  it('без аккаунта: XP нет, подсказка про вход и кнопка в приложение вместо урока', async () => {
    const tg = await botOnly('ru');
    await launch('2027-01-21');
    fakeTelegram();
    await runDay('2027-01-21');
    const { round, pos } = await dailyRound(tg, '2027-01-21');
    const calls = fakeTelegram();
    await press(tg, `qa:${round.id}:${pos(true)}`);
    const edit = calls.find((c) => c.method === 'editMessageCaption')!;
    expect(edit.params.caption).toContain('POLSKI GO');
    expect(edit.params.caption).not.toContain('XP</');
    expect(JSON.stringify(edit.params.reply_markup.inline_keyboard[0])).not.toContain('bot_screen=learn');
  });

  it('процент верных по уровню — с пятого ответившего; серия вопросов дня растёт день за днём', async () => {
    const five = [await botOnly('ru'), await botOnly('ru'), await botOnly('ru'), await botOnly('ru'), await botOnly('ru')];
    await launch('2027-01-22');
    fakeTelegram();
    await runDay('2027-01-22');
    const answered = (await db.select().from(dailyQuizSends).where(and(eq(dailyQuizSends.day, '2027-01-22'), eq(dailyQuizSends.level, 'A1')))).filter((r) => r.answeredAt).length;
    expect(answered).toBe(0);
    let last: TgCall[] = [];
    for (const [i, tg] of five.entries()) {
      const { round, pos } = await dailyRound(tg, '2027-01-22');
      last = fakeTelegram();
      await press(tg, `qa:${round.id}:${pos(i < 4)}`);
      const caption = last.find((c) => c.method === 'editMessageCaption')!.params.caption as string;
      if (i < 4) expect(caption, `answer ${i + 1}`).not.toMatch(/📊/);
      else expect(caption).toMatch(/📊 Сегодня верно ответили 80 %/);
    }
    await launch('2027-01-23');
    fakeTelegram();
    await runDay('2027-01-23');
    const { round, pos } = await dailyRound(five[0], '2027-01-23');
    last = fakeTelegram();
    await press(five[0], `qa:${round.id}:${pos(false)}`);
    expect(last.find((c) => c.method === 'editMessageCaption')!.params.caption).toContain('2 дня подряд');
  });

  it('«Не присылать вопрос дня» выключает рассылку человеку, кнопка меняется на «Присылать»; /stop без аккаунта — тоже', async () => {
    const tg = await botOnly('ru');
    let calls = fakeTelegram();
    await press(tg, 'qz:daily:0', 55);
    expect((await db.select().from(botQuizPlayers).where(eq(botQuizPlayers.telegramId, tg)))[0].pushEnabled).toBe(false);
    expect(calls.find((c) => c.method === 'answerCallbackQuery')!.params.text).toMatch(/больше не пришлю/);
    await press(tg, 'qz:daily:1', 55);
    expect((await db.select().from(botQuizPlayers).where(eq(botQuizPlayers.telegramId, tg)))[0].pushEnabled).toBe(true);
    const other = await botOnly('ru');
    calls = fakeTelegram();
    await say(other, '/stop');
    expect((await db.select().from(botQuizPlayers).where(eq(botQuizPlayers.telegramId, other)))[0].pushEnabled).toBe(false);
    const people = await allPeople();
    expect(dailyEligibility(people.find((p) => p.telegramId === other)!)).toBe('opted_out');
  });

  it('/quiz не задаёт выключенные вопросы', () => {
    const off = new Set(QUIZ_QUESTIONS.slice(0, QUIZ_QUESTIONS.length - 5).map((q) => q.id));
    for (let i = 0; i < 200; i++) expect(off.has(pickQuestion([], 'A1', Math.random, off).id)).toBe(false);
  });
});

// ───────────── Напоминания и приглашения при включённой рассылке ─────────────

describe('одно сообщение в день', () => {
  async function reminderPlayer() {
    const u = await login();
    await db.update(userSettings).set({ notificationsEnabled: true, reminderHour: 19, timezone: 'Europe/Warsaw' }).where(eq(userSettings.userId, u.user.id));
    return u;
  }
  const at19 = (day: string) => new Date(`${day}T18:05:00Z`);
  const reminderLog = async (userId: string, day: string) => (await db.select().from(notificationLog).where(and(eq(notificationLog.userId, userId), eq(notificationLog.day, day))))[0];

  it('получатель вопроса дня напоминание не получает (SKIPPED daily_quiz); выключивший вопрос дня — получает', async () => {
    const gets = await reminderPlayer();
    const optedOut = await reminderPlayer();
    await db.insert(botQuizPlayers).values({ telegramId: optedOut.telegramId, pushEnabled: false });
    await launch('2027-02-01');
    const calls = fakeTelegram();
    await sendReminders(at19('2027-02-01'));
    expect(toChats(calls, [gets.telegramId])).toEqual([]);
    expect(toChats(calls, [optedOut.telegramId])).toHaveLength(1);
    expect(await reminderLog(gets.user.id, '2027-02-01')).toMatchObject({ status: 'SKIPPED', error: 'daily_quiz' });
  });

  it('в пропущенный день и при выключенной рассылке напоминания идут всем', async () => {
    const a = await reminderPlayer();
    await launch('2027-02-02');
    await ensurePlan('2027-02-02', 1);
    await setDaySkipped('2027-02-02', true, null);
    let calls = fakeTelegram();
    await sendReminders(at19('2027-02-02'));
    expect(toChats(calls, [a.telegramId])).toHaveLength(1);
    await writeDailyState({ enabled: false });
    calls = fakeTelegram();
    await sendReminders(at19('2027-02-03'));
    expect(toChats(calls, [a.telegramId])).toHaveLength(1);
  });

  it('пока рассылка включена, приглашения к /quiz не отправляются', async () => {
    const u = await login();
    await db.update(userSettings).set({ notificationsEnabled: true, reminderHour: 8, timezone: 'Europe/Warsaw' }).where(eq(userSettings.userId, u.user.id));
    await db.insert(botQuizPlayers).values({ telegramId: u.telegramId, answered: 1, lastQuestionAt: new Date(0) });
    await launch('2027-02-04');
    let calls = fakeTelegram();
    await runScheduled(new Date('2027-02-04T12:00:00Z'));
    expect(toChats(calls, [u.telegramId])).toEqual([]);
    await writeDailyState({ enabled: false });
    calls = fakeTelegram();
    await runScheduled(new Date('2027-02-05T12:00:00Z'));
    expect(toChats(calls, [u.telegramId])).toHaveLength(1);
  });
});
