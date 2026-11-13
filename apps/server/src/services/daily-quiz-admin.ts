/**
 * Вопрос дня в админке: план публикаций на 30 дней (с «как увидит игрок»), прошедшие 7 дней, охват и скорость отправки,
 * банк вопросов со статистикой, отчёт по дню (кому дошло, кто ответил, что выбрал, верно ли) и блок в карточке игрока.
 */
import { and, desc, eq, gte, inArray, isNotNull, lt, lte, ne, sql, type SQL } from 'drizzle-orm';
import type { UiLang } from '@polski-go/shared';
import { db } from '../db';
import { botContacts, botQuizRounds, dailyQuizPlan, dailyQuizQuestions, dailyQuizSends, users } from '../db/schema';
import { botImageUrl } from '../bot/catalog';
import { dailyAudience } from '../bot/daily/audience';
import { ensurePlan, planRange } from '../bot/daily/plan';
import { DAILY_PER_RUN } from '../bot/daily/send';
import { addDays, DAILY_LEVELS, isDayEditable, PLAN_DAYS, readDailyRun, readDailyState, warsawDay, type DailyLevel } from '../bot/daily/state';
import { dailyQuestionView, plainText } from '../bot/daily/views';
import { CATEGORY_NAMES, optionsOf, QUESTION_BY_ID, QUIZ_QUESTIONS, type QuizQuestion } from '../bot/quiz/questions';
import { isQuizScene, QUIZ_SCENES, quizSceneFile, SCENE_LABELS, type QuizScene } from '../bot/quiz/scenes';

const HISTORY_DAYS = 7;
const PAGE = 100;

const sceneOf = (image: string, q?: QuizQuestion): QuizScene => (isQuizScene(image) ? image : (q?.image ?? 'mieszkanie'));
export const imageUrlOf = (scene: QuizScene) => botImageUrl(quizSceneFile(scene));

/** Вопрос для админки на одном языке. */
export function questionCard(q: QuizQuestion, lang: UiLang) {
  return {
    id: q.id,
    level: q.cefr,
    category: q.category,
    categoryName: CATEGORY_NAMES[q.category][lang],
    kind: q.kind,
    image: q.image,
    prompt: q.prompt[lang],
    options: optionsOf(q, lang),
    answer: q.answer,
    explain: q.explain[lang],
  };
}

/** «Как увидит игрок»: подпись без разметки и подписи кнопок (как у игрока без серии). */
function preview(q: QuizQuestion, lang: UiLang) {
  const view = dailyQuestionView(q, [0, 1, 2, 3], lang, '0'.repeat(32), { streak: null, returning: false, hasUser: true });
  return { text: plainText(view.text), buttons: view.keyboard.inline_keyboard.flat().map((b) => b.text) };
}

/** Счётчики отправок по дню и уровню. */
async function sendStats(where: SQL) {
  return db
    .select({
      day: dailyQuizSends.day,
      level: dailyQuizSends.level,
      sent: sql<number>`count(*)`,
      delivered: sql<number>`sum(CASE WHEN ${dailyQuizSends.status} = 'SENT' THEN 1 ELSE 0 END)`,
      blocked: sql<number>`sum(CASE WHEN ${dailyQuizSends.status} = 'BLOCKED' THEN 1 ELSE 0 END)`,
      noChat: sql<number>`sum(CASE WHEN ${dailyQuizSends.status} = 'NO_CHAT' THEN 1 ELSE 0 END)`,
      failed: sql<number>`sum(CASE WHEN ${dailyQuizSends.status} IN ('FAILED', 'UNKNOWN') THEN 1 ELSE 0 END)`,
      answered: sql<number>`sum(CASE WHEN ${dailyQuizSends.answeredAt} IS NOT NULL THEN 1 ELSE 0 END)`,
      correct: sql<number>`sum(CASE WHEN ${dailyQuizSends.correct} = 1 THEN 1 ELSE 0 END)`,
    })
    .from(dailyQuizSends)
    .where(where)
    .groupBy(dailyQuizSends.day, dailyQuizSends.level);
}
const num = (v: unknown) => Number(v ?? 0);

export async function dailyOverview(lang: UiLang, now = new Date()) {
  const today = warsawDay(now);
  await ensurePlan(today);
  const from = addDays(today, -HISTORY_DAYS);
  const [state, run, audience, rows, stats] = await Promise.all([
    readDailyState(),
    readDailyRun(),
    dailyAudience(),
    planRange(from, HISTORY_DAYS + PLAN_DAYS),
    sendStats(and(gte(dailyQuizSends.day, from), lt(dailyQuizSends.day, today))!),
  ]);
  const byDay = new Map<string, typeof rows>();
  for (const r of rows) byDay.set(r.day, [...(byDay.get(r.day) ?? []), r]);
  const item = (r: (typeof rows)[number]) => {
    const q = QUESTION_BY_ID.get(r.questionId);
    const scene = sceneOf(r.image, q);
    return {
      level: r.level,
      questionId: r.questionId,
      image: scene,
      imageUrl: imageUrlOf(scene),
      edited: !!r.editedBy,
      question: q ? questionCard(q, lang) : null,
      preview: q ? preview(q, lang) : null,
    };
  };
  const plan = Array.from({ length: PLAN_DAYS }, (_, i) => {
    const day = addDays(today, i);
    const items = (byDay.get(day) ?? []).sort((a, b) => a.level.localeCompare(b.level));
    return { day, sendAt: state.sendAt, skipped: items.some((r) => r.skipped), editable: isDayEditable(day, today, run), items: items.map(item) };
  });
  const history = Array.from({ length: HISTORY_DAYS }, (_, i) => addDays(today, -1 - i)).map((day) => {
    const items = (byDay.get(day) ?? []).sort((a, b) => a.level.localeCompare(b.level));
    return {
      day,
      skipped: items.some((r) => r.skipped),
      levels: items.map((r) => {
        const s = stats.find((x) => x.day === day && x.level === r.level);
        return { ...item(r), sent: num(s?.sent), delivered: num(s?.delivered), answered: num(s?.answered), correct: num(s?.correct) };
      }),
    };
  });
  const scenes = QUIZ_SCENES.map((id) => ({ id, label: SCENE_LABELS[id][lang], imageUrl: imageUrlOf(id) }));
  return { state, run, today, rate: { perRun: DAILY_PER_RUN, perHour: DAILY_PER_RUN * 60 }, audience, scenes, plan, history };
}

/** Банк вопросов со статистикой: сколько раз был вопросом дня, сколько ответов (вопрос дня + /quiz за 30 дней) и % верных. */
export async function dailyQuestions(lang: UiLang, now = new Date()) {
  const today = warsawDay(now);
  const [disabled, usage, daily, quiz] = await Promise.all([
    db.select().from(dailyQuizQuestions),
    db
      .select({ id: dailyQuizPlan.questionId, times: sql<number>`count(DISTINCT ${dailyQuizPlan.day})`, last: sql<string>`max(${dailyQuizPlan.day})` })
      .from(dailyQuizPlan)
      .where(and(lte(dailyQuizPlan.day, today), eq(dailyQuizPlan.skipped, false)))
      .groupBy(dailyQuizPlan.questionId),
    db
      .select({ id: dailyQuizSends.questionId, n: sql<number>`count(*)`, right: sql<number>`sum(CASE WHEN ${dailyQuizSends.correct} = 1 THEN 1 ELSE 0 END)` })
      .from(dailyQuizSends)
      .where(isNotNull(dailyQuizSends.answeredAt))
      .groupBy(dailyQuizSends.questionId),
    db
      .select({ id: botQuizRounds.questionId, n: sql<number>`count(*)`, right: sql<number>`sum(CASE WHEN ${botQuizRounds.correct} = 1 THEN 1 ELSE 0 END)` })
      .from(botQuizRounds)
      .where(and(eq(botQuizRounds.status, 'ANSWERED'), inArray(botQuizRounds.source, ['command', 'push', 'next'])))
      .groupBy(botQuizRounds.questionId),
  ]);
  const off = new Set(disabled.filter((d) => d.disabled).map((d) => d.questionId));
  const use = new Map(usage.map((u) => [u.id, u]));
  const answers = new Map<string, { n: number; right: number }>();
  for (const r of [...daily, ...quiz]) {
    const prev = answers.get(r.id) ?? { n: 0, right: 0 };
    answers.set(r.id, { n: prev.n + num(r.n), right: prev.right + num(r.right) });
  }
  return QUIZ_QUESTIONS.map((q) => {
    const a = answers.get(q.id);
    return {
      ...questionCard(q, lang),
      disabled: off.has(q.id),
      timesDaily: num(use.get(q.id)?.times),
      lastDaily: use.get(q.id)?.last ?? null,
      answered: a?.n ?? 0,
      correctPct: a && a.n ? Math.round((a.right * 100) / a.n) : null,
    };
  });
}

export const DAY_FILTERS = ['all', 'answered', 'not_answered', 'wrong', 'failed'] as const;
export type DayFilter = (typeof DAY_FILTERS)[number];

/** Отчёт по дню: карточки уровней и получатели (100 на страницу, по telegram_id). */
export async function dayReport(day: string, lang: UiLang, filter: DayFilter, after: number | null) {
  const [plan, stats] = await Promise.all([planRange(day, 1), sendStats(eq(dailyQuizSends.day, day))]);
  const levels = DAILY_LEVELS.map((level: DailyLevel) => {
    const r = plan.find((p) => p.level === level);
    const q = r ? QUESTION_BY_ID.get(r.questionId) : undefined;
    const s = stats.find((x) => x.level === level);
    return {
      level,
      questionId: r?.questionId ?? null,
      prompt: q?.prompt[lang] ?? null,
      imageUrl: r ? imageUrlOf(sceneOf(r.image, q)) : null,
      skipped: r?.skipped ?? false,
      sent: num(s?.sent),
      delivered: num(s?.delivered),
      blocked: num(s?.blocked),
      noChat: num(s?.noChat),
      failed: num(s?.failed),
      answered: num(s?.answered),
      correct: num(s?.correct),
    };
  });
  const cond: SQL[] = [eq(dailyQuizSends.day, day)];
  if (after !== null) cond.push(sql`${dailyQuizSends.telegramId} > ${after}`);
  if (filter === 'answered') cond.push(isNotNull(dailyQuizSends.answeredAt));
  if (filter === 'not_answered') cond.push(eq(dailyQuizSends.status, 'SENT'), sql`${dailyQuizSends.answeredAt} IS NULL`);
  if (filter === 'wrong') cond.push(eq(dailyQuizSends.correct, false));
  if (filter === 'failed') cond.push(ne(dailyQuizSends.status, 'SENT'), ne(dailyQuizSends.status, 'PENDING'));
  const rows = await db
    .select({
      s: dailyQuizSends,
      appName: users.firstName,
      appUsername: users.username,
      botName: botContacts.firstName,
      botUsername: botContacts.username,
    })
    .from(dailyQuizSends)
    .leftJoin(users, eq(users.telegramId, dailyQuizSends.telegramId))
    .leftJoin(botContacts, eq(botContacts.telegramId, dailyQuizSends.telegramId))
    .where(and(...cond))
    .orderBy(dailyQuizSends.telegramId)
    .limit(PAGE);
  return {
    day,
    levels,
    rows: rows.map(({ s, appName, appUsername, botName, botUsername }) => {
      const q = QUESTION_BY_ID.get(s.questionId);
      return {
        telegramId: s.telegramId,
        userId: s.userId,
        name: appName || botName || '',
        username: appUsername || botUsername || null,
        level: s.level,
        lang: s.lang,
        status: s.status,
        error: s.error,
        sentAt: s.sentAt?.getTime() ?? null,
        answeredAt: s.answeredAt?.getTime() ?? null,
        chosenText: q && s.chosen !== null ? (optionsOf(q, lang)[s.chosen] ?? null) : null,
        correct: s.correct,
      };
    }),
    more: rows.length === PAGE ? rows[rows.length - 1].s.telegramId : null,
  };
}

/** Карточка игрока: вопросы дня за последние 14 дней. */
export async function userDailyQuiz(telegramId: number, lang: UiLang, now = new Date()) {
  const rows = await db
    .select()
    .from(dailyQuizSends)
    .where(and(eq(dailyQuizSends.telegramId, telegramId), gte(dailyQuizSends.day, addDays(warsawDay(now), -13))))
    .orderBy(desc(dailyQuizSends.day));
  return rows.map((s) => ({
    day: s.day,
    questionId: s.questionId,
    prompt: QUESTION_BY_ID.get(s.questionId)?.prompt[lang] ?? s.questionId,
    status: s.status,
    answeredAt: s.answeredAt?.getTime() ?? null,
    correct: s.correct,
  }));
}
