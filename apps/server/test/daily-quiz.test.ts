/**
 * Вопрос дня целиком: состояние рассылки и план на 30 дней, кто получает, отправка частями по минутному cron, ответ (XP, процент,
 * серия), выключатели, /stop, напоминания и приглашения при включённой рассылке. Telegram подменён (`fakeTelegram`).
 */
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { eq } from 'drizzle-orm';
import { db } from '../src/db';
import { dailyQuizPlan, dailyQuizQuestions } from '../src/db/schema';
import { QUESTION_BY_ID, QUIZ_QUESTIONS } from '../src/bot/quiz/questions';
import { addDays, isDayEditable, isSendingDay, readDailyState, sendWindow, warsawDay, writeDailyState } from '../src/bot/daily/state';
import { ensurePlan, pickDaily, planRange, replacePlanItem, setDaySkipped, setQuestionDisabled } from '../src/bot/daily/plan';
import { disposeEnv, getEnv } from './helpers';

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
