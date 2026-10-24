/**
 * Навчальні сесії: урок, повторення, «Мої помилки», «5 хвилин», швидкий раунд, іспити.
 * Сервер зберігає знімок вправ із відповідями; клієнт отримує лише публічну версію.
 * Відповідь перевіряється одразу; нагороди рахуються тільки при завершенні.
 */
import {
  BOSS_PASS_RATIO, EXAM_PASS_RATIO, LESSON_PASS_RATIO,
  checkAnswer, dayKey, lessonReward, maxCefr, nextReview, qualityFrom, isLearned,
  seededRandom, shuffle, toPublicItem,
  type AnswerPayload, type Cefr, type CheckResult, type ExerciseItem, type ExerciseType, type I18n,
} from '@polski-go/shared';
import type { Prisma } from '@prisma/client';
import type { Tx } from '../db';
import { prisma } from '../db';
import { HttpError, badRequest, forbidden, notFound } from '../lib/errors';
import { evaluateAchievements } from './achievements';
import { getRewards } from './gameConfig';
import { getJourney, lessonAccess } from './journey';
import { isPremium } from './premium';
import { applyQuestEvents, type QuestEvents } from './quests';
import { grantItem, grantXp, grantZlotki, touchActivity, userTimezone } from './rewards';
import { CITY_REWARDS } from '../content/gamification';

type Mode = 'LESSON' | 'REVIEW' | 'MISTAKES' | 'FIVE_MIN' | 'SPEED' | 'EXAM' | 'PLACEMENT';

type ItemState = { firstCorrect: boolean | null; done: boolean; mistakes: number; skipped?: boolean; fixed?: boolean; steps?: number[] };
type SessionState = { answers: Record<string, ItemState>; run: number };

const SESSION_TTL_MS = 3 * 60 * 60 * 1000;
/** Мінімальний час на одну вправу — захист від автоматичного проходження. */
const MIN_MS_PER_ITEM = 1000;

const json = (v: unknown) => v as Prisma.InputJsonValue;

function lessonToItems(exercises: { id: string; type: string; skill: string; data: unknown; explanation: unknown; audioUrl: string | null; imageUrl: string | null }[]): ExerciseItem[] {
  return exercises.map((e) => {
    const data = { ...(e.data as Record<string, unknown>) };
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

type VocabRow = { id: string; pl: string; pos: string; translations: unknown; emoji: string | null; audioUrl: string | null };

/** Генерує вправу на слово для повторення. */
function wordItem(w: VocabRow, pool: VocabRow[], rnd: () => number, variant: number): ExerciseItem {
  const others = shuffle(pool.filter((p) => p.id !== w.id), rnd);
  const samePos = others.filter((o) => o.pos === w.pos);
  const distract = [...samePos, ...others.filter((o) => o.pos !== w.pos)].slice(0, 2);
  const tr = w.translations as I18n;
  const key = `w:${w.id}:${variant}`;
  const skill = 'review.vocab';
  const kind = variant % 4;
  if (kind === 0 || distract.length < 2) {
    return {
      key, type: 'WORD_TRANSLATION', skill, vocabId: w.id,
      data: { pl: w.pl, audioText: w.pl, options: [{ id: 'c', text: tr }, ...distract.map((d, i) => ({ id: `d${i}`, text: d.translations as I18n }))], answer: 'c' },
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

async function vocabPool(tx: Tx, userId: string): Promise<VocabRow[]> {
  const mine = await tx.userVocabulary.findMany({ where: { userId }, include: { entry: true }, take: 300 });
  const rows = mine.map((m) => m.entry);
  if (rows.length >= 6) return rows;
  const extra = await tx.vocabularyEntry.findMany({ where: { cefr: 'A0', status: 'PUBLISHED' }, take: 30 });
  return [...rows, ...extra.filter((e) => !rows.some((r) => r.id === e.id))];
}

async function buildPracticeItems(tx: Tx, userId: string, mode: Mode, seed: number): Promise<ExerciseItem[]> {
  const rnd = seededRandom(seed);
  const now = new Date();
  const pool = await vocabPool(tx, userId);

  if (mode === 'REVIEW' || mode === 'SPEED') {
    const due = await tx.reviewSchedule.findMany({
      where: { userId, itemType: 'WORD', ...(mode === 'REVIEW' ? { dueAt: { lte: now } } : {}) },
      orderBy: { dueAt: 'asc' },
      take: mode === 'SPEED' ? 15 : 12,
    });
    let words = due.map((d) => pool.find((p) => p.id === d.itemId)).filter(Boolean) as VocabRow[];
    if (mode === 'SPEED' && words.length < 8) words = shuffle(pool, rnd).slice(0, 15);
    if (!words.length) throw badRequest('nothing_due', 'Немає слів для повторення');
    // Швидкий раунд — лише вибір варіанту, без введення тексту.
    return words.map((w, i) => wordItem(w, pool, rnd, mode === 'SPEED' ? (i % 2) : Math.floor(rnd() * 4)));
  }

  if (mode === 'MISTAKES') {
    const dueEx = await tx.reviewSchedule.findMany({ where: { userId, itemType: 'EXERCISE' }, orderBy: [{ lapses: 'desc' }, { dueAt: 'asc' }], take: 8 });
    const exercises = await tx.exercise.findMany({ where: { id: { in: dueEx.map((d) => d.itemId) } } });
    const exItems = lessonToItems(exercises);
    const weakWords = await tx.reviewSchedule.findMany({ where: { userId, itemType: 'WORD', lapses: { gt: 0 } }, orderBy: { lapses: 'desc' }, take: 6 });
    const wordItems = weakWords
      .map((d) => pool.find((p) => p.id === d.itemId))
      .filter(Boolean)
      .map((w, i) => wordItem(w as VocabRow, pool, rnd, i));
    const items = [...exItems, ...wordItems];
    if (!items.length) throw badRequest('no_mistakes', 'Помилок для повторення немає');
    return shuffle(items, rnd).slice(0, 12);
  }

  // FIVE_MIN: до 5 слів на повторення + вправи з уже пройдених (або доступних) уроків.
  const due = await tx.reviewSchedule.findMany({ where: { userId, itemType: 'WORD', dueAt: { lte: now } }, orderBy: { dueAt: 'asc' }, take: 5 });
  const words = due.map((d) => pool.find((p) => p.id === d.itemId)).filter(Boolean) as VocabRow[];
  const done = await tx.userLessonProgress.findMany({ where: { userId, firstCompletedAt: { not: null } }, select: { lessonId: true } });
  let lessonIds = done.map((d) => d.lessonId);
  if (!lessonIds.length) {
    const j = await getJourney(userId, tx);
    lessonIds = j.cities.flatMap((c) => c.routes.flatMap((r) => r.lessons)).filter((l) => l.state === 'available').slice(0, 1).map((l) => l.id);
  }
  const exercises = await tx.exercise.findMany({
    where: { lessonId: { in: lessonIds }, type: { notIn: ['DIALOGUE', 'SITUATION', 'READING'] } },
    take: 80,
  });
  const exItems = shuffle(lessonToItems(exercises), rnd).slice(0, 10 - words.length);
  const items = [...words.map((w, i) => wordItem(w, pool, rnd, i)), ...exItems];
  if (!items.length) throw badRequest('nothing_to_practice');
  return shuffle(items, rnd);
}

export async function startSession(userId: string, input: { lessonId?: string; mode?: Mode }) {
  const mode: Mode = input.lessonId ? 'LESSON' : (input.mode ?? 'REVIEW');
  const seed = Math.floor(Math.random() * 2 ** 31);
  const rnd = seededRandom(seed);

  return prisma.$transaction(async (tx) => {
    let items: ExerciseItem[];
    let lesson: Awaited<ReturnType<typeof tx.lesson.findUnique>> = null;
    let realMode = mode;
    let words: unknown[] = [];

    if (input.lessonId) {
      lesson = await tx.lesson.findUnique({ where: { id: input.lessonId } });
      if (!lesson || lesson.status !== 'PUBLISHED') throw notFound('lesson_not_found');
      if (lesson.isPremium && !(await isPremium(userId, tx))) throw forbidden('premium_required');
      const access = await lessonAccess(userId, lesson.id, tx);
      if (access === 'locked') throw forbidden('lesson_locked');
      if (access === 'not_found') throw notFound('lesson_not_found');
      if (lesson.kind === 'EXAM') realMode = 'EXAM';
      if (lesson.kind === 'PLACEMENT') realMode = 'PLACEMENT';
      const exercises = await tx.exercise.findMany({ where: { lessonId: lesson.id }, orderBy: { order: 'asc' } });
      items = lessonToItems(exercises);
      const lw = await tx.lessonWord.findMany({ where: { lessonId: lesson.id }, include: { entry: true }, orderBy: { order: 'asc' } });
      words = lw.map((x) => ({ id: x.entry.id, pl: x.entry.pl, translations: x.entry.translations, pronunciation: x.entry.pronunciation, emoji: x.entry.emoji, audioUrl: x.entry.audioUrl }));
    } else {
      items = await buildPracticeItems(tx, userId, mode, seed);
    }
    if (!items.length) throw badRequest('empty_session');

    // Не залишаємо «висячих» активних сесій того ж уроку.
    await tx.learningSession.updateMany({
      where: { userId, status: 'ACTIVE', lessonId: lesson?.id ?? null, mode: realMode },
      data: { status: 'ABANDONED' },
    });

    const session = await tx.learningSession.create({
      data: {
        userId,
        lessonId: lesson?.id,
        mode: realMode,
        items: json(items),
        state: json({ answers: {}, run: 0 } satisfies SessionState),
        total: items.length,
      },
    });

    return {
      sessionId: session.id,
      mode: realMode,
      lesson: lesson
        ? { id: lesson.id, slug: lesson.slug, kind: lesson.kind, title: lesson.title, topic: lesson.topic, explanation: lesson.explanation, examples: lesson.examples, cefr: lesson.cefr }
        : null,
      words,
      items: items.map((i) => toPublicItem(i, rnd)),
      timeLimitSec: realMode === 'SPEED' ? 90 : null,
    };
  });
}

async function lockSession(tx: Tx, userId: string, sessionId: string) {
  await tx.$queryRaw`SELECT id FROM learning_sessions WHERE id = ${sessionId} FOR UPDATE`;
  const s = await tx.learningSession.findUnique({ where: { id: sessionId } });
  if (!s || s.userId !== userId) throw notFound('session_not_found');
  if (s.status !== 'ACTIVE') throw badRequest('session_closed');
  if (Date.now() - s.startedAt.getTime() > SESSION_TTL_MS) throw new HttpError(410, 'session_expired');
  return s;
}

async function updateSkill(tx: Tx, userId: string, skill: string, correct: boolean) {
  const existing = await tx.languageSkill.findUnique({ where: { userId_skill: { userId, skill } } });
  const mastery = Math.max(0, Math.min(100, (existing?.mastery ?? 0) + (correct ? 8 : -10)));
  await tx.languageSkill.upsert({
    where: { userId_skill: { userId, skill } },
    create: { userId, skill, mastery, attempts: 1, correct: correct ? 1 : 0 },
    update: { mastery, attempts: { increment: 1 }, correct: { increment: correct ? 1 : 0 } },
  });
}

async function updateReview(tx: Tx, userId: string, itemType: 'WORD' | 'EXERCISE', itemId: string, correct: boolean, almost = false) {
  const existing = await tx.reviewSchedule.findUnique({ where: { userId_itemType_itemId: { userId, itemType, itemId } } });
  if (!existing && correct) return; // вправи без помилок у розклад не додаємо
  const next = nextReview(
    existing ?? { ease: 2.5, intervalDays: 0, repetitions: 0, lapses: 0 },
    qualityFrom(correct, almost),
  );
  const data = { ease: next.ease, intervalDays: next.intervalDays, repetitions: next.repetitions, lapses: next.lapses, dueAt: next.dueAt };
  if (existing && itemType === 'EXERCISE' && correct && next.repetitions >= 2) {
    // Помилку виправлено двічі поспіль — прибираємо з «Моїх помилок».
    await tx.reviewSchedule.delete({ where: { id: existing.id } });
    return;
  }
  await tx.reviewSchedule.upsert({
    where: { userId_itemType_itemId: { userId, itemType, itemId } },
    create: { userId, itemType, itemId, ...data },
    update: data,
  });
  if (itemType === 'WORD') {
    await tx.userVocabulary.upsert({
      where: { userId_entryId: { userId, entryId: itemId } },
      create: { userId, entryId: itemId, status: 'LEARNING', timesSeen: 1, timesCorrect: correct ? 1 : 0, timesWrong: correct ? 0 : 1, lastSeenAt: new Date() },
      update: {
        timesSeen: { increment: 1 },
        timesCorrect: { increment: correct ? 1 : 0 },
        timesWrong: { increment: correct ? 0 : 1 },
        lastSeenAt: new Date(),
        status: isLearned(next) ? 'LEARNED' : 'LEARNING',
      },
    });
  }
}

export async function answerItem(userId: string, sessionId: string, key: string, answer: AnswerPayload) {
  return prisma.$transaction(async (tx) => {
    const s = await lockSession(tx, userId, sessionId);
    const items = s.items as unknown as ExerciseItem[];
    const item = items.find((i) => i.key === key);
    if (!item) throw badRequest('unknown_item');
    const state = s.state as unknown as SessionState;
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
    await tx.learningSession.update({ where: { id: s.id }, data: { state: json(state) } });

    if (firstDone) {
      await tx.exerciseAttempt.create({
        data: {
          userId, sessionId: s.id, exerciseId: item.exerciseId ?? null, itemKey: key, type: item.type, skill: item.skill,
          answer: json(answer), isCorrect: !!st.firstCorrect,
        },
      });
      if (!st.skipped) {
        await updateSkill(tx, userId, item.skill, !!st.firstCorrect);
        if (item.vocabId) await updateReview(tx, userId, 'WORD', item.vocabId, !!st.firstCorrect, result.almost);
        if (item.exerciseId) await updateReview(tx, userId, 'EXERCISE', item.exerciseId, !!st.firstCorrect, result.almost);
      }
      const events: QuestEvents = { PERFECT_STREAK: state.run };
      if ((item.type === 'LISTENING' || item.type === 'DICTATION') && st.firstCorrect) events.LISTENING = 1;
      await applyQuestEvents(tx, userId, events);
    }

    const answeredCount = Object.values(state.answers).filter((a) => a.done).length;
    return { ...result, explanation: item.explanation ?? null, retry, answered: answeredCount, total: items.length };
  });
}

export async function finishSession(userId: string, sessionId: string) {
  const cfg = await getRewards();
  return prisma.$transaction(async (tx) => {
    const s = await lockSession(tx, userId, sessionId);
    const items = s.items as unknown as ExerciseItem[];
    const state = s.state as unknown as SessionState;
    const elapsed = Date.now() - s.startedAt.getTime();
    const isSpeed = s.mode === 'SPEED';

    const answered = items.filter((i) => state.answers[i.key]?.done);
    if (!isSpeed && answered.length < items.length) throw badRequest('not_finished', 'Не всі вправи виконано');
    if (elapsed < answered.length * MIN_MS_PER_ITEM) throw badRequest('too_fast');

    const counted = answered.filter((i) => !state.answers[i.key].skipped);
    const total = isSpeed ? items.length : counted.length;
    const correct = counted.filter((i) => state.answers[i.key].firstCorrect).length;
    const accuracy = total ? correct / total : 0;
    const now = new Date();
    const tz = await userTimezone(tx, userId);
    const today = dayKey(now, tz);
    const key = `session:${s.id}`;

    const events: QuestEvents = {};
    let xp = 0;
    let zlotki = 0;
    let passed = true;
    let perfect = false;
    let newWords: { id: string; pl: string; translations: unknown }[] = [];
    let cityCompleted: null | { cityId: string; nextCity: unknown; rewards: unknown[] } = null;
    let levelConfirmed: Cefr | null = null;
    let placement: null | { level: Cefr; unlocked: string[] } = null;
    const progress = await tx.playerProgress.findUniqueOrThrow({ where: { userId } });

    if (s.mode === 'LESSON' && s.lessonId) {
      const lesson = await tx.lesson.findUniqueOrThrow({ where: { id: s.lessonId }, include: { route: true } });
      const isBoss = lesson.kind === 'BOSS';
      passed = accuracy >= (isBoss ? BOSS_PASS_RATIO : LESSON_PASS_RATIO);
      const ulp = await tx.userLessonProgress.findUnique({ where: { userId_lessonId: { userId, lessonId: lesson.id } } });
      const firstCompletion = !ulp?.firstCompletedAt;
      const replaysToday = firstCompletion
        ? 0
        : await tx.learningSession.count({
            where: {
              userId, lessonId: lesson.id, status: 'FINISHED', xpAwarded: { gt: 0 },
              // Повтори — це нагороджені проходження після першого, за останні 24 години.
              finishedAt: { gte: new Date(now.getTime() - 24 * 3600_000), gt: ulp!.firstCompletedAt! },
            },
          });
      const r = lessonReward({ cfg, correct, total, firstCompletion, replaysToday, isBoss, passed });
      xp = r.xp;
      zlotki = r.zlotki;
      perfect = r.perfect;

      if (passed) {
        const stars = accuracy === 1 ? 3 : accuracy >= 0.8 ? 2 : 1;
        const score = Math.round(accuracy * 100);
        await tx.userLessonProgress.upsert({
          where: { userId_lessonId: { userId, lessonId: lesson.id } },
          create: { userId, lessonId: lesson.id, completions: 1, bestScore: score, stars, firstCompletedAt: now, lastCompletedAt: now },
          update: { completions: { increment: 1 }, bestScore: Math.max(ulp?.bestScore ?? 0, score), stars: Math.max(ulp?.stars ?? 0, stars), firstCompletedAt: ulp?.firstCompletedAt ?? now, lastCompletedAt: now },
        });
        const newPerfect = perfect && (ulp?.stars ?? 0) < 3;
        await tx.playerProgress.update({
          where: { userId },
          data: {
            lessonsCompleted: { increment: firstCompletion ? 1 : 0 },
            perfectLessons: { increment: newPerfect ? 1 : 0 },
            exercisesCorrect: { increment: correct },
          },
        });
        events.LESSONS = 1;

        // Нові слова уроку → словник користувача + розклад повторень.
        const lw = await tx.lessonWord.findMany({ where: { lessonId: lesson.id }, include: { entry: true } });
        const existing = await tx.userVocabulary.findMany({ where: { userId, entryId: { in: lw.map((x) => x.entryId) } }, select: { entryId: true } });
        const have = new Set(existing.map((e) => e.entryId));
        const fresh = lw.filter((x) => !have.has(x.entryId));
        if (fresh.length) {
          await tx.userVocabulary.createMany({ data: fresh.map((x) => ({ userId, entryId: x.entryId, status: 'LEARNING' as const, timesSeen: 1 })), skipDuplicates: true });
          await tx.reviewSchedule.createMany({
            data: fresh.map((x) => ({ userId, itemType: 'WORD', itemId: x.entryId, intervalDays: 1, repetitions: 1, dueAt: new Date(now.getTime() + 86_400_000) })),
            skipDuplicates: true,
          });
          await tx.playerProgress.update({ where: { userId }, data: { wordsLearned: { increment: fresh.length } } });
          newWords = fresh.map((x) => ({ id: x.entry.id, pl: x.entry.pl, translations: x.entry.translations }));
          events.NEW_WORDS = fresh.length;
        }

        if (isBoss && lesson.route) {
          cityCompleted = await completeCity(tx, userId, lesson.route.cityId, now);
          if (cityCompleted) events.CITY_COMPLETED = 1;
        }
      }
    } else if (s.mode === 'EXAM' && s.lessonId) {
      const lesson = await tx.lesson.findUniqueOrThrow({ where: { id: s.lessonId } });
      passed = accuracy >= EXAM_PASS_RATIO;
      if (passed) {
        const next = maxCefr(progress.languageLevel, lesson.cefr);
        if (next !== progress.languageLevel) {
          await tx.playerProgress.update({ where: { userId }, data: { languageLevel: next } });
          levelConfirmed = next;
        }
        // Нагорода за іспит — лише за перше складання.
        const firstPass = !(await tx.userLessonProgress.findUnique({ where: { userId_lessonId: { userId, lessonId: lesson.id } } }))?.firstCompletedAt;
        if (firstPass) {
          xp = cfg.cityExamXp;
          zlotki = cfg.cityExamZlotki;
        }
      }
      const score = Math.round(accuracy * 100);
      const prev = await tx.userLessonProgress.findUnique({ where: { userId_lessonId: { userId, lessonId: lesson.id } } });
      await tx.userLessonProgress.upsert({
        where: { userId_lessonId: { userId, lessonId: lesson.id } },
        create: { userId, lessonId: lesson.id, completions: 1, bestScore: score, stars: passed ? 3 : 0, firstCompletedAt: passed ? now : null, lastCompletedAt: now },
        update: {
          completions: { increment: 1 },
          bestScore: Math.max(prev?.bestScore ?? 0, score),
          stars: passed ? 3 : prev?.stars ?? 0,
          lastCompletedAt: now,
          firstCompletedAt: prev?.firstCompletedAt ?? (passed ? now : null),
        },
      });
    } else if (s.mode === 'PLACEMENT') {
      placement = await applyPlacement(tx, userId, accuracy);
    } else {
      // Тренування: XP за правильні відповіді з денним лімітом.
      const act = await tx.dailyActivity.findUnique({ where: { userId_day: { userId, day: today } } });
      const left = Math.max(0, cfg.practiceXpDailyCap - (act?.practiceXp ?? 0));
      xp = Math.min(left, correct * cfg.exerciseXp + (s.mode === 'FIVE_MIN' && total ? 5 : 0));
      if (s.mode === 'REVIEW' || s.mode === 'MISTAKES' || s.mode === 'FIVE_MIN') events.REVIEWS = counted.filter((i) => i.vocabId || s.mode !== 'FIVE_MIN').length;
    }

    const dialogues = answered.filter((i) => (i.type === 'DIALOGUE' || i.type === 'SITUATION') && state.answers[i.key].done).length;
    if (dialogues) events.DIALOGUES = dialogues;

    const xpRes = await grantXp(tx, userId, xp, s.mode === 'LESSON' ? 'lesson' : s.mode.toLowerCase(), key, now);
    const zl = await grantZlotki(tx, userId, zlotki, s.mode === 'LESSON' ? 'lesson' : s.mode.toLowerCase(), key);
    if (xpRes.granted) events.XP = xpRes.granted;
    const activity = await touchActivity(
      tx,
      userId,
      {
        lessons: s.mode === 'LESSON' && passed ? 1 : 0,
        exercises: answered.length,
        correct,
        newWords: newWords.length,
        reviews: events.REVIEWS ?? 0,
        seconds: Math.min(Math.round(elapsed / 1000), 3600),
        practiceXp: ['REVIEW', 'MISTAKES', 'FIVE_MIN', 'SPEED'].includes(s.mode) ? xpRes.granted : 0,
      },
      now,
    );

    const questsCompleted = await applyQuestEvents(tx, userId, events, now);
    const achievements = await evaluateAchievements(tx, userId);

    await tx.learningSession.update({
      where: { id: s.id },
      data: { status: 'FINISHED', finishedAt: now, correct, total, xpAwarded: xpRes.granted, zlotkiAwarded: zl },
    });

    const mistakes = counted
      .filter((i) => state.answers[i.key].firstCorrect === false)
      .map((i) => ({ key: i.key, type: i.type, skill: i.skill }));

    return {
      mode: s.mode,
      passed,
      perfect,
      correct,
      total,
      accuracy: Math.round(accuracy * 100),
      mistakes,
      xp: xpRes.granted,
      zlotki: zl,
      levelUp: xpRes.levelAfter > xpRes.levelBefore ? xpRes.levelAfter : null,
      streak: activity.streak,
      streakIncreased: activity.streakChanged,
      newWords,
      cityCompleted,
      levelConfirmed,
      placement,
      questsCompleted,
      achievements,
      durationSec: Math.round(elapsed / 1000),
    };
  });
}

/** Іспит міста складено: квиток до наступного міста, сувеніри, подорож. */
async function completeCity(tx: Tx, userId: string, cityId: string, now: Date) {
  const visit = await tx.userCity.findUnique({ where: { userId_cityId: { userId, cityId } } });
  if (visit?.bossPassedAt) return null;
  await tx.userCity.upsert({
    where: { userId_cityId: { userId, cityId } },
    create: { userId, cityId, bossPassedAt: now, completedAt: now },
    update: { bossPassedAt: now, completedAt: now },
  });
  const city = await tx.city.findUniqueOrThrow({ where: { id: cityId } });
  const rewards = [];
  for (const slug of CITY_REWARDS[city.slug] ?? []) {
    const item = await tx.cosmeticItem.findUnique({ where: { slug } });
    if (item && (await grantItem(tx, userId, item.id, `city:${city.slug}`))) rewards.push({ slug: item.slug, name: item.name, slot: item.slot });
  }
  const next = await tx.city.findFirst({ where: { status: 'PUBLISHED', order: { gt: city.order } }, orderBy: { order: 'asc' } });
  let nextCity = null;
  if (next) {
    await tx.userCity.createMany({ data: [{ userId, cityId: next.id, unlockedAt: now }], skipDuplicates: true });
    const hasLessons = await tx.lesson.count({ where: { status: 'PUBLISHED', route: { cityId: next.id } } });
    // Переїжджаємо, лише якщо в наступному місті вже є уроки.
    if (hasLessons) await tx.playerProgress.update({ where: { userId }, data: { currentCityId: next.id } });
    nextCity = { id: next.id, slug: next.slug, name: next.name, namePl: next.namePl, emoji: next.emoji, hasLessons: hasLessons > 0 };
  }
  return { cityId, nextCity, rewards };
}

/** Результат вхідного тесту — рекомендація стартового міста (не підтверджений рівень). */
async function applyPlacement(tx: Tx, userId: string, accuracy: number) {
  const level: Cefr = accuracy >= 0.8 ? 'A1' : 'A0';
  await tx.userProfile.update({ where: { userId }, data: { placementLevel: level } });
  const cities = await tx.city.findMany({ where: { status: 'PUBLISHED' }, orderBy: { order: 'asc' }, take: 3 });
  const openCount = accuracy >= 0.8 ? 3 : accuracy >= 0.5 ? 2 : 1;
  const unlocked: string[] = [];
  for (const [i, c] of cities.slice(0, openCount).entries()) {
    await tx.userCity.upsert({
      where: { userId_cityId: { userId, cityId: c.id } },
      create: { userId, cityId: c.id, source: i === 0 ? 'journey' : 'placement' },
      update: i === 0 ? {} : { source: 'placement' },
    });
    unlocked.push(c.slug);
  }
  // Рекомендоване стартове місто — останнє відкрите.
  const start = cities[openCount - 1];
  if (start) await tx.playerProgress.update({ where: { userId }, data: { currentCityId: start.id } });
  return { level, unlocked };
}
