/**
 * План публикаций вопроса дня: на каждый день (по Варшаве) и уровень A1 / A2 / B1 — вопрос и картинка, на 30 дней вперёд.
 * Владелец видит план в админке до запуска и может заменить вопрос или картинку, пропустить день; выключенный вопрос уходит из плана.
 *
 * Выбор вопроса (pickDaily) детерминирован:
 *  • вопрос этого уровня, не выключенный и не стоявший на этом уровне за последние min(пул − 1, 60) дней;
 *  • картинка не та же, что вчера на этом уровне, и, если можно, другая тема;
 *  • сначала ни разу не стоявшие, потом давно стоявшие; при равенстве — хэш (день, уровень, id), чтобы порядок не шёл по файлу.
 * Если после правил пусто — правила ослабляются по одному: тема → картинка → давность.
 */
import { and, eq, gte, inArray, lt, lte } from 'drizzle-orm';
import { dayDiff } from '@polski-go/shared';
import { db } from '../../db';
import { dailyQuizPlan, dailyQuizQuestions } from '../../db/schema';
import { badRequest } from '../../lib/errors';
import { QUESTION_BY_ID, QUIZ_QUESTIONS, type QuizQuestion } from '../quiz/questions';
import { isQuizScene, type QuizScene } from '../quiz/scenes';
import { addDays, DAILY_LEVELS, PLAN_DAYS, type DailyLevel } from './state';

export type PlanRow = typeof dailyQuizPlan.$inferSelect;
export type PlanHistory = { day: string; questionId: string; image: string };

/** Сколько прошлых дней смотреть, чтобы не повторять вопрос. */
const HISTORY_DAYS = 60;

function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function pickDaily(level: DailyLevel, day: string, history: PlanHistory[], disabled: Set<string>): QuizQuestion {
  const pool = QUIZ_QUESTIONS.filter((q) => q.cefr === level && !disabled.has(q.id));
  const all = pool.length ? pool : QUIZ_QUESTIONS.filter((q) => q.cefr === level);
  const lastUsed = new Map<string, string>();
  for (const h of history) if (h.day < day && (lastUsed.get(h.questionId) ?? '') < h.day) lastUsed.set(h.questionId, h.day);
  const yesterday = history.find((h) => h.day === addDays(day, -1));
  const yCategory = yesterday ? QUESTION_BY_ID.get(yesterday.questionId)?.category : undefined;
  const window = Math.min(all.length - 1, HISTORY_DAYS);
  const fresh = (q: QuizQuestion) => {
    const last = lastUsed.get(q.id);
    return !last || dayDiff(last, day) > window;
  };
  const rules: ((q: QuizQuestion) => boolean)[] = [fresh, (q) => q.image !== yesterday?.image, (q) => q.category !== yCategory];
  let candidates: QuizQuestion[] = [];
  for (let n = rules.length; n >= 0 && !candidates.length; n--) candidates = all.filter((q) => rules.slice(0, n).every((r) => r(q)));
  if (!candidates.length) candidates = all;
  return candidates
    .map((q) => ({ q, last: lastUsed.get(q.id) ?? '', h: hash(`${day}|${level}|${q.id}`) }))
    .sort((a, b) => (a.last === b.last ? a.h - b.h : a.last < b.last ? -1 : 1))[0].q;
}

export async function disabledQuestionIds(): Promise<Set<string>> {
  const rows = await db.select({ id: dailyQuizQuestions.questionId }).from(dailyQuizQuestions).where(eq(dailyQuizQuestions.disabled, true));
  return new Set(rows.map((r) => r.id));
}

export async function planRange(from: string, n: number): Promise<PlanRow[]> {
  return db
    .select()
    .from(dailyQuizPlan)
    .where(and(gte(dailyQuizPlan.day, from), lt(dailyQuizPlan.day, addDays(from, n))))
    .orderBy(dailyQuizPlan.day, dailyQuizPlan.level);
}

/** Дописать недостающие (день, уровень) с `from` на `days` дней вперёд; существующие строки не трогает. */
export async function ensurePlan(from: string, days = PLAN_DAYS): Promise<void> {
  const rows = await db
    .select({ day: dailyQuizPlan.day, level: dailyQuizPlan.level, questionId: dailyQuizPlan.questionId, image: dailyQuizPlan.image })
    .from(dailyQuizPlan)
    .where(and(gte(dailyQuizPlan.day, addDays(from, -HISTORY_DAYS)), lt(dailyQuizPlan.day, addDays(from, days))));
  const have = new Set(rows.map((r) => `${r.day}|${r.level}`));
  const missing = (day: string) => DAILY_LEVELS.some((l) => !have.has(`${day}|${l}`));
  if (!Array.from({ length: days }, (_, i) => addDays(from, i)).some(missing)) return;
  const disabled = await disabledQuestionIds();
  const history: Record<DailyLevel, PlanHistory[]> = { A1: [], A2: [], B1: [] };
  for (const r of rows) history[r.level].push(r);
  const add: (typeof dailyQuizPlan.$inferInsert)[] = [];
  for (let i = 0; i < days; i++) {
    const day = addDays(from, i);
    for (const level of DAILY_LEVELS) {
      if (have.has(`${day}|${level}`)) continue;
      const q = pickDaily(level, day, history[level], disabled);
      history[level].push({ day, questionId: q.id, image: q.image });
      add.push({ day, level, questionId: q.id, image: q.image });
    }
  }
  // D1: до 100 параметров на запрос, у строки их 4.
  for (let i = 0; i < add.length; i += 20) await db.insert(dailyQuizPlan).values(add.slice(i, i + 20)).onConflictDoNothing();
}

/** Пересобрать строки плана (будущие дни, начиная с `from`) — после выключения вопроса. */
async function replanRows(rows: PlanRow[], disabled: Set<string>) {
  for (const row of rows.sort((a, b) => a.day.localeCompare(b.day))) {
    const prior = await db
      .select({ day: dailyQuizPlan.day, questionId: dailyQuizPlan.questionId, image: dailyQuizPlan.image })
      .from(dailyQuizPlan)
      .where(and(eq(dailyQuizPlan.level, row.level), gte(dailyQuizPlan.day, addDays(row.day, -HISTORY_DAYS)), lte(dailyQuizPlan.day, addDays(row.day, PLAN_DAYS))));
    const q = pickDaily(row.level, row.day, prior.filter((p) => p.day !== row.day), disabled);
    await db.update(dailyQuizPlan).set({ questionId: q.id, image: q.image, editedBy: null }).where(and(eq(dailyQuizPlan.day, row.day), eq(dailyQuizPlan.level, row.level)));
  }
}

/**
 * Выключить или включить вопрос. Выключенный уходит из будущих дней плана (с `fromDay` — первого дня, который ещё можно менять).
 */
export async function setQuestionDisabled(id: string, disabled: boolean, adminId: string | null, fromDay: string): Promise<void> {
  if (!QUESTION_BY_ID.has(id)) throw badRequest('unknown_question');
  await db
    .insert(dailyQuizQuestions)
    .values({ questionId: id, disabled, updatedBy: adminId })
    .onConflictDoUpdate({ target: dailyQuizQuestions.questionId, set: { disabled, updatedBy: adminId, updatedAt: new Date() } });
  if (!disabled) return;
  const rows = await db.select().from(dailyQuizPlan).where(and(eq(dailyQuizPlan.questionId, id), gte(dailyQuizPlan.day, fromDay)));
  if (rows.length) await replanRows(rows, await disabledQuestionIds());
}

export async function replacePlanItem(day: string, level: DailyLevel, patch: { questionId?: string; image?: QuizScene }, adminId: string | null): Promise<void> {
  const set: Partial<typeof dailyQuizPlan.$inferInsert> = { editedBy: adminId };
  if (patch.questionId !== undefined) {
    const q = QUESTION_BY_ID.get(patch.questionId);
    if (!q) throw badRequest('unknown_question');
    if (q.cefr !== level) throw badRequest('wrong_level');
    if ((await disabledQuestionIds()).has(q.id)) throw badRequest('question_disabled');
    set.questionId = q.id;
    // Новый вопрос — со своей картинкой, если картинку не выбрали явно.
    if (patch.image === undefined) set.image = q.image;
  }
  if (patch.image !== undefined) {
    if (!isQuizScene(patch.image)) throw badRequest('bad_image');
    set.image = patch.image;
  }
  const done = await db.update(dailyQuizPlan).set(set).where(and(eq(dailyQuizPlan.day, day), eq(dailyQuizPlan.level, level))).returning({ day: dailyQuizPlan.day });
  if (!done.length) throw badRequest('no_plan_day');
}

export async function setDaySkipped(day: string, skipped: boolean, adminId: string | null): Promise<void> {
  const done = await db.update(dailyQuizPlan).set({ skipped, editedBy: adminId }).where(eq(dailyQuizPlan.day, day)).returning({ level: dailyQuizPlan.level });
  if (!done.length) throw badRequest('no_plan_day');
}

/** Строки плана на один день по уровням (для отправки). */
export async function planDay(day: string): Promise<Partial<Record<DailyLevel, PlanRow>>> {
  const rows = await db.select().from(dailyQuizPlan).where(inArray(dailyQuizPlan.day, [day]));
  return Object.fromEntries(rows.map((r) => [r.level, r]));
}
