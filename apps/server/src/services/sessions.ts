/**
 * Навчальні сесії: урок, повторення, «Мої помилки», «5 хвилин», швидкий раунд, граматика, іспити.
 * Сервер зберігає знімок вправ із відповідями; клієнт отримує лише публічну версію.
 * Відповідь перевіряється одразу; нагороди рахуються тільки при завершенні.
 * Кожна зміна сесії — атомарний пакет із перевіркою версії (оптимістичне блокування).
 */
import { and, asc, count, desc, eq, gt, gte, inArray, isNotNull, isNull, lte, notInArray, or, sql, type AnyColumn } from 'drizzle-orm';
import {
  BOSS_PASS_RATIO, EXAM_PASS_RATIO, LESSON_PASS_RATIO,
  checkAnswer, dayDiff, lessonReward, maxCefr, nextReview, qualityFrom, isLearned,
  seededRandom, shuffle, toPublicItem,
  type AnswerPayload, type Cefr, type CheckResult, type ExerciseItem, type ExerciseType, type I18n,
} from '@polski-go/shared';
import { atomic, chunks, db, type Stmt } from '../db';
import {
  cities, cityRoutes, cosmeticItems, dailyActivity, exerciseAttempts, exercises, languageSkills, learningSessions, lessonWords, lessons,
  newId, playerProgress, reviewSchedule, userCities, userInventory, userLessonProgress, userProfiles, userVocabulary, vocabularyEntries,
} from '../db/schema';
import { HttpError, badRequest, forbidden, notFound } from '../lib/errors';
import { evaluateAchievements } from './achievements';
import { getRewards } from './gameConfig';
import { getJourney, lessonAccess } from './journey';
import { isPremium } from './premium';
import { applyQuestEvents, type QuestEvents } from './quests';
import { grantItem, grantXp, grantZlotki, loadCtx, touchActivity } from './rewards';
import { CITY_REWARDS } from '../content/gamification';
import { GRAMMAR } from '../content/grammar';

type Mode = (typeof learningSessions.$inferSelect)['mode'];
type SessionRow = typeof learningSessions.$inferSelect;

type ItemState = { firstCorrect: boolean | null; done: boolean; mistakes: number; skipped?: boolean; fixed?: boolean; steps?: number[] };
type SessionState = { answers: Record<string, ItemState>; run: number };

/** Детермінований порядок варіантів для сесії (той самий після продовження). */
const sessionSeed = (id: string) => [...id].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 17);

const SESSION_TTL_MS = 3 * 60 * 60 * 1000;
/** Мінімальний час на одну вправу — захист від автоматичного проходження. */
const MIN_MS_PER_ITEM = 1000;

type ExerciseRow = typeof exercises.$inferSelect;

function lessonToItems(rows: ExerciseRow[]): ExerciseItem[] {
  return rows.map((e) => {
    const data = { ...e.data };
    if (e.audioUrl) data.audioUrl = e.audioUrl;
    if (e.imageUrl) data.image = e.imageUrl;
    return {
      key: e.id,
      type: e.type as ExerciseType,
      skill: e.skill,
      data: data as ExerciseItem['data'],
      explanation: (e.explanation ?? undefined) as I18n | undefined,
      exerciseId: e.id,
    };
  });
}

type VocabRow = { id: string; pl: string; pos: string; translations: I18n; emoji: string | null; audioUrl: string | null };

/** Генерує вправу на слово для повторення. */
function wordItem(w: VocabRow, pool: VocabRow[], rnd: () => number, variant: number): ExerciseItem {
  const others = shuffle(pool.filter((p) => p.id !== w.id), rnd);
  const samePos = others.filter((o) => o.pos === w.pos);
  const distract = [...samePos, ...others.filter((o) => o.pos !== w.pos)].slice(0, 2);
  const tr = w.translations;
  const key = `w:${w.id}:${variant}`;
  const skill = 'review.vocab';
  const kind = variant % 4;
  if (kind === 0 || distract.length < 2) {
    return {
      key, type: 'WORD_TRANSLATION', skill, vocabId: w.id,
      data: { pl: w.pl, audioText: w.pl, options: [{ id: 'c', text: tr }, ...distract.map((d, i) => ({ id: `d${i}`, text: d.translations }))], answer: 'c' },
    };
  }
  if (kind === 1) {
    return {
      key, type: 'WORD_TRANSLATION', skill, vocabId: w.id,
      data: { translation: tr, options: [{ id: 'c', text: w.pl }, ...distract.map((d, i) => ({ id: `d${i}`, text: d.pl }))], answer: 'c' },
    };
  }
  if (kind === 2) {
    return {
      key, type: 'LISTENING', skill: 'review.listening', vocabId: w.id,
      data: { audioText: w.pl, audioUrl: w.audioUrl ?? undefined, options: [{ id: 'c', text: w.pl }, ...distract.map((d, i) => ({ id: `d${i}`, text: d.pl }))], answer: 'c' },
    };
  }
  return { key, type: 'DICTATION', skill: 'review.writing', vocabId: w.id, data: { audioText: w.pl, audioUrl: w.audioUrl ?? undefined, translation: tr, accepted: [w.pl] } };
}

const vocabCols = { id: vocabularyEntries.id, pl: vocabularyEntries.pl, pos: vocabularyEntries.pos, translations: vocabularyEntries.translations, emoji: vocabularyEntries.emoji, audioUrl: vocabularyEntries.audioUrl };

async function vocabPool(userId: string): Promise<VocabRow[]> {
  const rows = await db.select(vocabCols).from(userVocabulary).innerJoin(vocabularyEntries, eq(vocabularyEntries.id, userVocabulary.entryId)).where(eq(userVocabulary.userId, userId)).limit(300);
  if (rows.length >= 6) return rows;
  const extra = await db.select(vocabCols).from(vocabularyEntries).where(and(eq(vocabularyEntries.cefr, 'A0'), eq(vocabularyEntries.status, 'PUBLISHED'))).limit(30);
  return [...rows, ...extra.filter((e) => !rows.some((r) => r.id === e.id))];
}

/** Граматичне тренування: вправи теми з уроків у відкритих користувачу містах. */
async function buildGrammarItems(userId: string, topicSlug: string | undefined, rnd: () => number): Promise<ExerciseItem[]> {
  const topic = GRAMMAR.find((g) => g.slug === topicSlug);
  if (!topic) throw notFound('topic_not_found');
  const myCities = db.select({ id: userCities.cityId }).from(userCities).where(eq(userCities.userId, userId));
  const rows = await db
    .select({ e: exercises })
    .from(exercises)
    .innerJoin(lessons, eq(lessons.id, exercises.lessonId))
    .leftJoin(cityRoutes, eq(cityRoutes.id, lessons.routeId))
    .where(
      and(
        inArray(exercises.skill, topic.skills),
        eq(lessons.status, 'PUBLISHED'),
        eq(lessons.isPremium, false),
        or(inArray(cityRoutes.cityId, myCities), eq(lessons.kind, 'EXAM')),
      ),
    )
    .limit(60);
  if (!rows.length) throw badRequest('topic_locked', 'Вправи теми відкриються в наступних містах');
  return shuffle(lessonToItems(rows.map((r) => r.e)), rnd).slice(0, 10);
}

async function buildPracticeItems(userId: string, mode: Mode, seed: number, topic?: string): Promise<ExerciseItem[]> {
  const rnd = seededRandom(seed);
  if (mode === 'GRAMMAR') return buildGrammarItems(userId, topic, rnd);
  const now = new Date();
  const pool = await vocabPool(userId);
  const byId = (id: string) => pool.find((p) => p.id === id);

  if (mode === 'REVIEW' || mode === 'SPEED') {
    const due = await db
      .select({ itemId: reviewSchedule.itemId })
      .from(reviewSchedule)
      .where(and(eq(reviewSchedule.userId, userId), eq(reviewSchedule.itemType, 'WORD'), mode === 'REVIEW' ? lte(reviewSchedule.dueAt, now) : undefined))
      .orderBy(asc(reviewSchedule.dueAt))
      .limit(mode === 'SPEED' ? 15 : 12);
    let words = due.map((d) => byId(d.itemId)).filter(Boolean) as VocabRow[];
    if (mode === 'SPEED' && words.length < 8) words = shuffle(pool, rnd).slice(0, 15);
    if (!words.length) throw badRequest('nothing_due', 'Немає слів для повторення');
    // Швидкий раунд — лише вибір варіанту, без введення тексту.
    return words.map((w, i) => wordItem(w, pool, rnd, mode === 'SPEED' ? i % 2 : Math.floor(rnd() * 4)));
  }

  if (mode === 'MISTAKES') {
    const [dueEx, weakWords] = await db.batch([
      db.select({ itemId: reviewSchedule.itemId }).from(reviewSchedule).where(and(eq(reviewSchedule.userId, userId), eq(reviewSchedule.itemType, 'EXERCISE'))).orderBy(desc(reviewSchedule.lapses), asc(reviewSchedule.dueAt)).limit(8),
      db.select({ itemId: reviewSchedule.itemId }).from(reviewSchedule).where(and(eq(reviewSchedule.userId, userId), eq(reviewSchedule.itemType, 'WORD'), gt(reviewSchedule.lapses, 0))).orderBy(desc(reviewSchedule.lapses)).limit(6),
    ]);
    const exRows = dueEx.length ? await db.select().from(exercises).where(inArray(exercises.id, dueEx.map((d) => d.itemId))) : [];
    const wordItems = weakWords
      .map((d) => byId(d.itemId))
      .filter(Boolean)
      .map((w, i) => wordItem(w as VocabRow, pool, rnd, i));
    const items = [...lessonToItems(exRows), ...wordItems];
    if (!items.length) throw badRequest('no_mistakes', 'Помилок для повторення немає');
    return shuffle(items, rnd).slice(0, 12);
  }

  // FIVE_MIN: до 5 слів на повторення + вправи з уже пройдених (або доступних) уроків.
  const [due, done] = await db.batch([
    db.select({ itemId: reviewSchedule.itemId }).from(reviewSchedule).where(and(eq(reviewSchedule.userId, userId), eq(reviewSchedule.itemType, 'WORD'), lte(reviewSchedule.dueAt, now))).orderBy(asc(reviewSchedule.dueAt)).limit(5),
    db.select({ lessonId: userLessonProgress.lessonId }).from(userLessonProgress).where(and(eq(userLessonProgress.userId, userId), isNotNull(userLessonProgress.firstCompletedAt))),
  ]);
  const words = due.map((d) => byId(d.itemId)).filter(Boolean) as VocabRow[];
  let lessonIds = done.map((d) => d.lessonId);
  if (!lessonIds.length) {
    const j = await getJourney(userId);
    lessonIds = j.cities.flatMap((c) => c.routes.flatMap((r) => r.lessons)).filter((l) => l.state === 'available').slice(0, 1).map((l) => l.id);
  }
  const exRows = lessonIds.length
    ? await db.select().from(exercises).where(and(inArray(exercises.lessonId, lessonIds), notInArray(exercises.type, ['DIALOGUE', 'SITUATION', 'READING']))).limit(80)
    : [];
  const exItems = shuffle(lessonToItems(exRows), rnd).slice(0, 10 - words.length);
  const items = [...words.map((w, i) => wordItem(w, pool, rnd, i)), ...exItems];
  if (!items.length) throw badRequest('nothing_to_practice');
  return shuffle(items, rnd);
}

export async function startSession(userId: string, input: { lessonId?: string; mode?: Mode; topic?: string }) {
  const mode: Mode = input.lessonId ? 'LESSON' : (input.mode ?? 'REVIEW');
  const seed = Math.floor(Math.random() * 2 ** 31);
  const rnd = seededRandom(seed);

  let items: ExerciseItem[];
  let lesson: typeof lessons.$inferSelect | undefined;
  let realMode = mode;
  let words: unknown[] = [];

  if (input.lessonId) {
    lesson = await db.query.lessons.findFirst({ where: eq(lessons.id, input.lessonId) });
    if (!lesson || lesson.status !== 'PUBLISHED') throw notFound('lesson_not_found');
    if (lesson.isPremium && !(await isPremium(userId))) throw forbidden('premium_required');
    const access = await lessonAccess(userId, lesson.id);
    if (access === 'locked') throw forbidden('lesson_locked');
    if (access === 'not_found') throw notFound('lesson_not_found');
    if (lesson.kind === 'EXAM') realMode = 'EXAM';
    if (lesson.kind === 'PLACEMENT') realMode = 'PLACEMENT';
    const [exRows, lw] = await Promise.all([
      db.select().from(exercises).where(eq(exercises.lessonId, lesson.id)).orderBy(asc(exercises.order)),
      db
        .select({ id: vocabularyEntries.id, pl: vocabularyEntries.pl, translations: vocabularyEntries.translations, pronunciation: vocabularyEntries.pronunciation, emoji: vocabularyEntries.emoji, audioUrl: vocabularyEntries.audioUrl })
        .from(lessonWords)
        .innerJoin(vocabularyEntries, eq(vocabularyEntries.id, lessonWords.entryId))
        .where(eq(lessonWords.lessonId, lesson.id))
        .orderBy(asc(lessonWords.order)),
    ]);
    items = lessonToItems(exRows);
    words = lw;

    // Незавершений урок (у межах TTL сесії) продовжується з того самого завдання.
    if (realMode === 'LESSON') {
      const [prev] = await db
        .select()
        .from(learningSessions)
        .where(and(eq(learningSessions.userId, userId), eq(learningSessions.status, 'ACTIVE'), eq(learningSessions.lessonId, lesson.id), eq(learningSessions.mode, 'LESSON')))
        .orderBy(desc(learningSessions.startedAt))
        .limit(1);
      const st = prev?.state as unknown as SessionState | undefined;
      const prevItems = prev?.items as ExerciseItem[] | undefined;
      const done = prevItems?.filter((i) => st?.answers[i.key]?.done).map((i) => i.key) ?? [];
      if (prev && prevItems && Date.now() - prev.startedAt.getTime() < SESSION_TTL_MS && done.length > 0 && done.length < prevItems.length) {
        const prnd = seededRandom(sessionSeed(prev.id));
        return {
          sessionId: prev.id,
          mode: realMode,
          lesson: { id: lesson.id, slug: lesson.slug, kind: lesson.kind, title: lesson.title, topic: lesson.topic, explanation: lesson.explanation, examples: lesson.examples, cefr: lesson.cefr },
          words,
          items: prevItems.map((i) => toPublicItem(i, prnd)),
          timeLimitSec: null,
          resume: { done },
        };
      }
    }
  } else {
    items = await buildPracticeItems(userId, mode, seed, input.topic);
  }
  if (!items.length) throw badRequest('empty_session');

  const id = newId();
  const prnd = seededRandom(sessionSeed(id));
  await atomic([
    // Не залишаємо «висячих» активних сесій того ж уроку.
    db
      .update(learningSessions)
      .set({ status: 'ABANDONED' })
      .where(and(eq(learningSessions.userId, userId), eq(learningSessions.status, 'ACTIVE'), lesson ? eq(learningSessions.lessonId, lesson.id) : isNull(learningSessions.lessonId), eq(learningSessions.mode, realMode))),
    db.insert(learningSessions).values({ id, userId, lessonId: lesson?.id ?? null, mode: realMode, items, state: { answers: {}, run: 0 } satisfies SessionState, total: items.length }),
  ]);

  return {
    sessionId: id,
    mode: realMode,
    lesson: lesson
      ? { id: lesson.id, slug: lesson.slug, kind: lesson.kind, title: lesson.title, topic: lesson.topic, explanation: lesson.explanation, examples: lesson.examples, cefr: lesson.cefr }
      : null,
    words,
    items: items.map((i) => toPublicItem(i, prnd)),
    timeLimitSec: realMode === 'SPEED' ? 90 : null,
    resume: null as null | { done: string[] },
  };
}

async function loadSession(userId: string, sessionId: string): Promise<SessionRow> {
  const s = await db.query.learningSessions.findFirst({ where: eq(learningSessions.id, sessionId) });
  if (!s || s.userId !== userId) throw notFound('session_not_found');
  if (s.status !== 'ACTIVE') throw badRequest('session_closed');
  if (Date.now() - s.startedAt.getTime() > SESSION_TTL_MS) throw new HttpError(410, 'session_expired');
  return s;
}

/** Зберегти стан сесії з перевіркою версії: паралельна зміна відкотить увесь пакет. */
const saveSession = (s: SessionRow, data: Partial<SessionRow>) =>
  db.update(learningSessions).set({ ...data, version: s.version + 1 }).where(eq(learningSessions.id, s.id));

function skillStmt(userId: string, skill: string, existing: { mastery: number } | undefined, correct: boolean): Stmt {
  const mastery = Math.max(0, Math.min(100, (existing?.mastery ?? 0) + (correct ? 8 : -10)));
  return db
    .insert(languageSkills)
    .values({ userId, skill, mastery, attempts: 1, correct: correct ? 1 : 0 })
    .onConflictDoUpdate({
      target: [languageSkills.userId, languageSkills.skill],
      set: { mastery, attempts: sqlInc(languageSkills.attempts, 1), correct: sqlInc(languageSkills.correct, correct ? 1 : 0), updatedAt: new Date() },
    });
}

const sqlInc = (col: AnyColumn, n: number) => sql`${col} + ${n}`;

type ReviewRow = typeof reviewSchedule.$inferSelect;

function reviewStmts(userId: string, itemType: 'WORD' | 'EXERCISE', itemId: string, existing: ReviewRow | undefined, correct: boolean, almost = false): Stmt[] {
  if (!existing && correct && itemType === 'EXERCISE') return []; // вправи без помилок у розклад не додаємо
  if (!existing && correct) return [];
  const next = nextReview(existing ?? { ease: 2.5, intervalDays: 0, repetitions: 0, lapses: 0 }, qualityFrom(correct, almost));
  const data = { ease: next.ease, intervalDays: next.intervalDays, repetitions: next.repetitions, lapses: next.lapses, dueAt: next.dueAt, updatedAt: new Date() };
  if (existing && itemType === 'EXERCISE' && correct && next.repetitions >= 2) {
    // Помилку виправлено двічі поспіль — прибираємо з «Моїх помилок».
    return [db.delete(reviewSchedule).where(eq(reviewSchedule.id, existing.id))];
  }
  const stmts: Stmt[] = [
    db
      .insert(reviewSchedule)
      .values({ userId, itemType, itemId, ...data })
      .onConflictDoUpdate({ target: [reviewSchedule.userId, reviewSchedule.itemType, reviewSchedule.itemId], set: data }),
  ];
  if (itemType === 'WORD') {
    const now = new Date();
    stmts.push(
      db
        .insert(userVocabulary)
        .values({ userId, entryId: itemId, status: 'LEARNING', timesSeen: 1, timesCorrect: correct ? 1 : 0, timesWrong: correct ? 0 : 1, lastSeenAt: now })
        .onConflictDoUpdate({
          target: [userVocabulary.userId, userVocabulary.entryId],
          set: {
            timesSeen: sqlInc(userVocabulary.timesSeen, 1),
            timesCorrect: sqlInc(userVocabulary.timesCorrect, correct ? 1 : 0),
            timesWrong: sqlInc(userVocabulary.timesWrong, correct ? 0 : 1),
            lastSeenAt: now,
            status: isLearned(next) ? 'LEARNED' : 'LEARNING',
          },
        }),
    );
  }
  return stmts;
}

export async function answerItem(userId: string, sessionId: string, key: string, answer: AnswerPayload) {
  // Сесія і контекст користувача читаються паралельно — менше послідовних звернень до D1.
  const [s, ctx] = await Promise.all([loadSession(userId, sessionId), loadCtx(userId)]);
  const items = s.items as ExerciseItem[];
  const item = items.find((i) => i.key === key);
  if (!item) throw badRequest('unknown_item');
  const state = structuredClone(s.state) as unknown as SessionState;
  const st: ItemState = state.answers[key] ?? { firstCorrect: null, done: false, mistakes: 0 };
  const isDialogue = item.type === 'DIALOGUE' || item.type === 'SITUATION';
  const retry = st.done;

  if (isDialogue && !retry) {
    const step = (answer as { step?: number }).step;
    const answered = st.steps ?? [];
    // Кроки діалогу проходяться по порядку.
    const expected = (item.data as { steps: { options?: unknown[] }[] }).steps.findIndex((x, i) => x.options?.length && !answered.includes(i));
    if (step !== expected) throw badRequest('wrong_step');
  }

  const result: CheckResult = checkAnswer(item, answer);

  if (isDialogue) {
    if (!result.correct) st.mistakes += 1;
    else st.steps = [...(st.steps ?? []), (answer as { step: number }).step];
    if (result.done && !retry) {
      st.done = true;
      st.firstCorrect = st.mistakes === 0;
    }
  } else if (!retry) {
    st.done = true;
    st.skipped = result.skipped;
    st.firstCorrect = result.skipped ? null : result.correct;
    if (!result.correct && !result.skipped) st.mistakes += 1;
  } else if (result.correct) {
    st.fixed = true;
  }

  // Серія правильних відповідей поспіль (для квесту «без помилок»).
  if (!result.skipped && (!isDialogue || result.done || !result.correct)) {
    state.run = result.correct ? state.run + 1 : 0;
  }
  state.answers[key] = st;

  const firstDone = !retry && st.done;
  const stmts: Stmt[] = [saveSession(s, { state: state as unknown as Record<string, unknown> })];

  // Пропущена вимова (немає мікрофона) не є помилкою і не потрапляє в статистику.
  if (firstDone && !st.skipped) {
    const ok = !!st.firstCorrect;
    const events: QuestEvents = { PERFECT_STREAK: state.run };
    if ((item.type === 'LISTENING' || item.type === 'DICTATION') && st.firstCorrect) events.LISTENING = 1;
    const [[skillRow, wordRev, exRev], quests] = await Promise.all([db.batch([
      db.select({ mastery: languageSkills.mastery }).from(languageSkills).where(and(eq(languageSkills.userId, userId), eq(languageSkills.skill, item.skill))),
      db.select().from(reviewSchedule).where(and(eq(reviewSchedule.userId, userId), eq(reviewSchedule.itemType, 'WORD'), eq(reviewSchedule.itemId, item.vocabId ?? ''))),
      db.select().from(reviewSchedule).where(and(eq(reviewSchedule.userId, userId), eq(reviewSchedule.itemType, 'EXERCISE'), eq(reviewSchedule.itemId, item.exerciseId ?? ''))),
    ]), applyQuestEvents(ctx, events)]);
    stmts.push(
      db.insert(exerciseAttempts).values({ userId, sessionId: s.id, exerciseId: item.exerciseId ?? null, itemKey: key, type: item.type, skill: item.skill, answer, isCorrect: ok }),
      skillStmt(userId, item.skill, skillRow[0], ok),
    );
    if (item.vocabId) stmts.push(...reviewStmts(userId, 'WORD', item.vocabId, wordRev[0], ok, result.almost));
    if (item.exerciseId) stmts.push(...reviewStmts(userId, 'EXERCISE', item.exerciseId, exRev[0], ok, result.almost));
    stmts.push(...quests.stmts);
  }
  await atomic(stmts);

  const answeredCount = Object.values(state.answers).filter((a) => a.done).length;
  return { ...result, explanation: item.explanation ?? null, retry, answered: answeredCount, total: items.length };
}

export async function finishSession(userId: string, sessionId: string) {
  const [cfg, s, ctx] = await Promise.all([getRewards(), loadSession(userId, sessionId), loadCtx(userId)]);
  const items = s.items as ExerciseItem[];
  const state = s.state as unknown as SessionState;
  const elapsed = Date.now() - s.startedAt.getTime();
  const isSpeed = s.mode === 'SPEED';
  // День останньої активності до цього уроку (для досягнення «Повернення в дорогу»).
  const prevActiveDay = ctx.progress.lastActiveDay;

  const answered = items.filter((i) => state.answers[i.key]?.done);
  if (!isSpeed && answered.length < items.length) throw badRequest('not_finished', 'Не всі вправи виконано');
  if (elapsed < answered.length * MIN_MS_PER_ITEM) throw badRequest('too_fast');

  const counted = answered.filter((i) => !state.answers[i.key].skipped);
  const total = isSpeed ? items.length : counted.length;
  const correct = counted.filter((i) => state.answers[i.key].firstCorrect).length;
  const accuracy = total ? correct / total : 0;
  const { now } = ctx;
  const p = ctx.progress;
  const key = `session:${s.id}`;
  const stmts: Stmt[] = [];

  const events: QuestEvents = {};
  let xp = 0;
  let zlotki = 0;
  let passed = true;
  let perfect = false;
  let newWords: { id: string; pl: string; translations: unknown }[] = [];
  let cityCompleted: null | { cityId: string; nextCity: unknown; rewards: unknown[] } = null;
  let levelConfirmed: Cefr | null = null;
  let placement: null | { level: Cefr; unlocked: string[] } = null;

  if (s.mode === 'LESSON' && s.lessonId) {
    const [lessonRow, ulpRow, lw] = await Promise.all([
      db.select({ lesson: lessons, cityId: cityRoutes.cityId }).from(lessons).leftJoin(cityRoutes, eq(cityRoutes.id, lessons.routeId)).where(eq(lessons.id, s.lessonId)),
      db.select().from(userLessonProgress).where(and(eq(userLessonProgress.userId, userId), eq(userLessonProgress.lessonId, s.lessonId))),
      db
        .select({ entryId: lessonWords.entryId, pl: vocabularyEntries.pl, translations: vocabularyEntries.translations, mine: userVocabulary.entryId })
        .from(lessonWords)
        .innerJoin(vocabularyEntries, eq(vocabularyEntries.id, lessonWords.entryId))
        .leftJoin(userVocabulary, and(eq(userVocabulary.entryId, lessonWords.entryId), eq(userVocabulary.userId, userId)))
        .where(eq(lessonWords.lessonId, s.lessonId)),
    ]);
    const { lesson, cityId } = lessonRow[0];
    const ulp = ulpRow[0];
    const isBoss = lesson.kind === 'BOSS';
    passed = accuracy >= (isBoss ? BOSS_PASS_RATIO : LESSON_PASS_RATIO);
    const firstCompletion = !ulp?.firstCompletedAt;
    const replaysToday = firstCompletion
      ? 0
      : ((
          await db
            .select({ n: count() })
            .from(learningSessions)
            .where(
              and(
                eq(learningSessions.userId, userId),
                eq(learningSessions.lessonId, lesson.id),
                eq(learningSessions.status, 'FINISHED'),
                gt(learningSessions.xpAwarded, 0),
                // Повтори — це нагороджені проходження після першого, за останні 24 години.
                gte(learningSessions.finishedAt, new Date(now.getTime() - 24 * 3600_000)),
                gt(learningSessions.finishedAt, ulp!.firstCompletedAt!),
              ),
            )
        )[0]?.n ?? 0);
    const r = lessonReward({ cfg, correct, total, firstCompletion, replaysToday, isBoss, passed });
    xp = r.xp;
    zlotki = r.zlotki;
    perfect = r.perfect;

    if (passed) {
      const stars = accuracy === 1 ? 3 : accuracy >= 0.8 ? 2 : 1;
      const score = Math.round(accuracy * 100);
      stmts.push(
        db
          .insert(userLessonProgress)
          .values({ userId, lessonId: lesson.id, completions: 1, bestScore: score, stars, firstCompletedAt: now, lastCompletedAt: now })
          .onConflictDoUpdate({
            target: [userLessonProgress.userId, userLessonProgress.lessonId],
            set: {
              completions: sqlInc(userLessonProgress.completions, 1),
              bestScore: Math.max(ulp?.bestScore ?? 0, score),
              stars: Math.max(ulp?.stars ?? 0, stars),
              firstCompletedAt: ulp?.firstCompletedAt ?? now,
              lastCompletedAt: now,
            },
          }),
      );
      const newPerfect = perfect && (ulp?.stars ?? 0) < 3;
      const fresh = lw.filter((x) => !x.mine);
      stmts.push(
        db
          .update(playerProgress)
          .set({
            lessonsCompleted: sqlInc(playerProgress.lessonsCompleted, firstCompletion ? 1 : 0),
            perfectLessons: sqlInc(playerProgress.perfectLessons, newPerfect ? 1 : 0),
            exercisesCorrect: sqlInc(playerProgress.exercisesCorrect, correct),
            wordsLearned: sqlInc(playerProgress.wordsLearned, fresh.length),
          })
          .where(eq(playerProgress.userId, userId)),
      );
      p.lessonsCompleted += firstCompletion ? 1 : 0;
      p.perfectLessons += newPerfect ? 1 : 0;
      p.exercisesCorrect += correct;
      p.wordsLearned += fresh.length;
      events.LESSONS = 1;

      // Нові слова уроку → словник користувача + розклад повторень.
      if (fresh.length) {
        for (const part of chunks(fresh)) {
          stmts.push(
            db.insert(userVocabulary).values(part.map((x) => ({ userId, entryId: x.entryId, status: 'LEARNING' as const, timesSeen: 1 }))).onConflictDoNothing(),
            db
              .insert(reviewSchedule)
              .values(part.map((x) => ({ userId, itemType: 'WORD', itemId: x.entryId, intervalDays: 1, repetitions: 1, dueAt: new Date(now.getTime() + 86_400_000) })))
              .onConflictDoNothing(),
          );
        }
        newWords = fresh.map((x) => ({ id: x.entryId, pl: x.pl, translations: x.translations }));
        events.NEW_WORDS = fresh.length;
      }

      if (isBoss && cityId) {
        const done = await completeCity(userId, cityId, now);
        if (done) {
          cityCompleted = done.result;
          stmts.push(...done.stmts);
          events.CITY_COMPLETED = 1;
          if (done.currentCityId) p.currentCityId = done.currentCityId;
        }
      }
    }
  } else if (s.mode === 'EXAM' && s.lessonId) {
    const [lessonRow, prevRow] = await db.batch([
      db.select().from(lessons).where(eq(lessons.id, s.lessonId)),
      db.select().from(userLessonProgress).where(and(eq(userLessonProgress.userId, userId), eq(userLessonProgress.lessonId, s.lessonId))),
    ]);
    const lesson = lessonRow[0];
    const prev = prevRow[0];
    passed = accuracy >= EXAM_PASS_RATIO;
    if (passed) {
      const next = maxCefr(p.languageLevel, lesson.cefr);
      if (next !== p.languageLevel) {
        stmts.push(db.update(playerProgress).set({ languageLevel: next }).where(eq(playerProgress.userId, userId)));
        levelConfirmed = next;
      }
      // Нагорода за іспит — лише за перше складання.
      if (!prev?.firstCompletedAt) {
        xp = cfg.cityExamXp;
        zlotki = cfg.cityExamZlotki;
      }
    }
    const score = Math.round(accuracy * 100);
    stmts.push(
      db
        .insert(userLessonProgress)
        .values({ userId, lessonId: lesson.id, completions: 1, bestScore: score, stars: passed ? 3 : 0, firstCompletedAt: passed ? now : null, lastCompletedAt: now })
        .onConflictDoUpdate({
          target: [userLessonProgress.userId, userLessonProgress.lessonId],
          set: {
            completions: sqlInc(userLessonProgress.completions, 1),
            bestScore: Math.max(prev?.bestScore ?? 0, score),
            stars: passed ? 3 : (prev?.stars ?? 0),
            lastCompletedAt: now,
            firstCompletedAt: prev?.firstCompletedAt ?? (passed ? now : null),
          },
        }),
    );
  } else if (s.mode === 'PLACEMENT') {
    const res = await applyPlacement(userId, accuracy);
    placement = res.result;
    stmts.push(...res.stmts);
  } else {
    // Тренування: XP за правильні відповіді з денним лімітом.
    const act = await db.query.dailyActivity.findFirst({ where: and(eq(dailyActivity.userId, userId), eq(dailyActivity.day, ctx.day)) });
    const left = Math.max(0, cfg.practiceXpDailyCap - (act?.practiceXp ?? 0));
    xp = Math.min(left, correct * cfg.exerciseXp + (s.mode === 'FIVE_MIN' && total ? 5 : 0));
    if (s.mode === 'REVIEW' || s.mode === 'MISTAKES' || s.mode === 'FIVE_MIN') events.REVIEWS = counted.filter((i) => i.vocabId || s.mode !== 'FIVE_MIN').length;
  }

  const dialogues = answered.filter((i) => (i.type === 'DIALOGUE' || i.type === 'SITUATION') && state.answers[i.key].done).length;
  if (dialogues) events.DIALOGUES = dialogues;

  const reason = s.mode === 'LESSON' ? 'lesson' : s.mode.toLowerCase();
  const xpRes = grantXp(ctx, xp, reason, key);
  const zl = grantZlotki(userId, zlotki, reason, key, now);
  if (xpRes.granted) events.XP = xpRes.granted;
  const activity = touchActivity(ctx, {
    lessons: s.mode === 'LESSON' && passed ? 1 : 0,
    exercises: answered.length,
    correct,
    newWords: newWords.length,
    reviews: events.REVIEWS ?? 0,
    seconds: Math.min(Math.round(elapsed / 1000), 3600),
    practiceXp: ['REVIEW', 'MISTAKES', 'FIVE_MIN', 'SPEED', 'GRAMMAR'].includes(s.mode) ? xpRes.granted : 0,
  });

  const quests = await applyQuestEvents(ctx, events);

  await atomic([
    // Першим — закриття сесії з перевіркою версії: повторне завершення відкотить увесь пакет.
    saveSession(s, { status: 'FINISHED', finishedAt: now, correct, total, xpAwarded: xpRes.granted, zlotkiAwarded: zl.granted }),
    ...stmts,
    ...xpRes.stmts,
    ...zl.stmts,
    ...activity.stmts,
    ...quests.stmts,
  ]);

  // Досягнення — після запису: метрики (уроки, розділи міст, повторення) уже враховують цей урок.
  const returned = s.mode === 'LESSON' && passed && !!prevActiveDay && dayDiff(prevActiveDay, ctx.day) >= 7;
  const ach = await evaluateAchievements(userId, null, returned ? { RETURN: 1 } : {});
  if (ach.stmts.length) await atomic(ach.stmts);

  const mistakes = counted.filter((i) => state.answers[i.key].firstCorrect === false).map((i) => ({ key: i.key, type: i.type, skill: i.skill }));

  return {
    mode: s.mode,
    passed,
    perfect,
    correct,
    total,
    accuracy: Math.round(accuracy * 100),
    mistakes,
    xp: xpRes.granted,
    zlotki: zl.granted,
    levelUp: xpRes.levelAfter > xpRes.levelBefore ? xpRes.levelAfter : null,
    streak: activity.streak,
    streakIncreased: activity.streakChanged,
    newWords,
    cityCompleted,
    levelConfirmed,
    placement,
    questsCompleted: quests.completed,
    achievements: ach.unlocked,
    durationSec: Math.round(elapsed / 1000),
  };
}

/** Іспит міста складено: квиток до наступного міста, сувеніри, подорож. */
async function completeCity(userId: string, cityId: string, now: Date) {
  const [visit, cityRow] = await db.batch([
    db.select().from(userCities).where(and(eq(userCities.userId, userId), eq(userCities.cityId, cityId))),
    db.select().from(cities).where(eq(cities.id, cityId)),
  ]);
  if (visit[0]?.bossPassedAt) return null;
  const city = cityRow[0];
  const rewardSlugs = CITY_REWARDS[city.slug] ?? [];
  const [items, owned, ahead] = await db.batch([
    db.select().from(cosmeticItems).where(inArray(cosmeticItems.slug, rewardSlugs.length ? rewardSlugs : ['-'])),
    db.select({ itemId: userInventory.itemId }).from(userInventory).where(eq(userInventory.userId, userId)),
    db.select().from(cities).where(and(eq(cities.status, 'PUBLISHED'), gt(cities.order, city.order))).orderBy(asc(cities.order)),
  ]);
  const have = new Set(owned.map((o) => o.itemId));
  const stmts: Stmt[] = [
    db
      .insert(userCities)
      .values({ userId, cityId, bossPassedAt: now, completedAt: now })
      .onConflictDoUpdate({ target: [userCities.userId, userCities.cityId], set: { bossPassedAt: now, completedAt: now } }),
  ];
  const rewards = [];
  for (const item of items) {
    if (have.has(item.id)) continue;
    stmts.push(grantItem(userId, item.id, `city:${city.slug}`));
    rewards.push({ slug: item.slug, name: item.name, slot: item.slot });
  }
  let nextCity = null;
  let currentCityId: string | null = null;
  if (ahead.length) {
    const withLessons = new Set(
      (
        await db
          .selectDistinct({ cityId: cityRoutes.cityId })
          .from(lessons)
          .innerJoin(cityRoutes, eq(cityRoutes.id, lessons.routeId))
          .where(and(eq(lessons.status, 'PUBLISHED'), inArray(cityRoutes.cityId, ahead.map((c) => c.id))))
      ).map((r) => r.cityId),
    );
    // Наступна зупинка — найближче місто з уроками; міста без контенту дорогою відкриваються як «скоро»
    // і не блокують маршрут. Якщо уроків попереду немає взагалі — відкриваємо лише найближче.
    const targetIdx = ahead.findIndex((c) => withLessons.has(c.id));
    const opened = targetIdx < 0 ? ahead.slice(0, 1) : ahead.slice(0, targetIdx + 1);
    for (const c of opened) stmts.push(db.insert(userCities).values({ userId, cityId: c.id, unlockedAt: now }).onConflictDoNothing());
    const next = targetIdx < 0 ? ahead[0] : ahead[targetIdx];
    const hasLessons = targetIdx >= 0;
    if (hasLessons) {
      stmts.push(db.update(playerProgress).set({ currentCityId: next.id }).where(eq(playerProgress.userId, userId)));
      currentCityId = next.id;
    }
    nextCity = { id: next.id, slug: next.slug, name: next.name, namePl: next.namePl, emoji: next.emoji, hasLessons };
  }
  return { result: { cityId, nextCity, rewards }, stmts, currentCityId };
}

/** Результат вхідного тесту — рекомендація стартового міста (не підтверджений рівень). */
async function applyPlacement(userId: string, accuracy: number) {
  const level: Cefr = accuracy >= 0.8 ? 'A1' : 'A0';
  // Рекомендуємо лише міста, де вже є уроки (порожні зупинки маршруту не можуть бути стартом).
  const top = await db
    .selectDistinct({ id: cities.id, slug: cities.slug, order: cities.order })
    .from(cities)
    .innerJoin(cityRoutes, eq(cityRoutes.cityId, cities.id))
    .innerJoin(lessons, and(eq(lessons.routeId, cityRoutes.id), eq(lessons.status, 'PUBLISHED')))
    .where(eq(cities.status, 'PUBLISHED'))
    .orderBy(asc(cities.order))
    .limit(3);
  const openCount = accuracy >= 0.8 ? 3 : accuracy >= 0.5 ? 2 : 1;
  const stmts: Stmt[] = [db.update(userProfiles).set({ placementLevel: level }).where(eq(userProfiles.userId, userId))];
  const unlocked: string[] = [];
  for (const [i, c] of top.slice(0, openCount).entries()) {
    const ins = db.insert(userCities).values({ userId, cityId: c.id, source: i === 0 ? 'journey' : 'placement' });
    stmts.push(i === 0 ? ins.onConflictDoNothing() : ins.onConflictDoUpdate({ target: [userCities.userId, userCities.cityId], set: { source: 'placement' } }));
    unlocked.push(c.slug);
  }
  // Рекомендоване стартове місто — останнє відкрите.
  const start = top[openCount - 1];
  if (start) stmts.push(db.update(playerProgress).set({ currentCityId: start.id }).where(eq(playerProgress.userId, userId)));
  return { result: { level, unlocked }, stmts };
}
