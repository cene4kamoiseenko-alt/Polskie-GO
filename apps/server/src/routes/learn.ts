/** Карта, уроки, навчальні сесії, словник, граматика, іспити. */
import { Hono } from 'hono';
import { readSpeechBody, sttStatus, transcribeSpeech } from '../services/stt';
import { and, asc, count, desc, eq, exists, inArray, lte, or, sql, type SQL } from 'drizzle-orm';
import { z } from 'zod';
import { dayKey } from '@polski-go/shared';
import { db } from '../db';
import { exercises, languageSkills, learningSessions, lessons, reviewSchedule, userLessonProgress, userVocabulary, vocabularyEntries } from '../db/schema';
import { body, query, rateLimit, type AppEnv } from '../hono';
import { notFound } from '../lib/errors';
import { getJourney } from '../services/journey';
import { answerItem, assertSpeechItem, finishSession, startSession } from '../services/sessions';
import { issueSpeechAttempt } from '../services/speech-attempts';
import { consumeQuota } from '../services/quota';
import { synthesize, ttsStatus } from '../services/tts';
import { TOPICS } from '../content/vocab';
import { GRAMMAR } from '../content/grammar';

export const learnRoutes = new Hono<AppEnv>();
const r = learnRoutes;

r.get('/journey', async (c) => c.json(await getJourney(c.get('userId'))));

r.post('/sessions', rateLimit(60, 60_000, 'sessions'), async (c) => {
  const b = z
    .object({ lessonId: z.string().optional(), mode: z.enum(['REVIEW', 'MISTAKES', 'FIVE_MIN', 'SPEED', 'GRAMMAR']).optional(), topic: z.string().max(40).optional() })
    .refine((x) => x.lessonId || x.mode, 'lessonId or mode required')
    .parse(await body(c));
  return c.json(await startSession(c.get('userId'), b));
});

r.post('/sessions/:id/answer', async (c) => {
  const id = c.req.param('id');
  const b = z
    .object({
      key: z.string().max(100),
      answer: z.union([
        z.object({ step: z.number().int().min(0).max(50), optionId: z.string().max(40) }),
        z.object({ optionId: z.string().max(40) }),
        z.object({ text: z.string().max(500) }),
        z.object({ tokens: z.array(z.string().max(60)).max(40) }),
        z.object({ pairs: z.array(z.tuple([z.string().max(40), z.string().max(40)])).max(12) }),
        // Підписана спроба має йти перед транскриптом: zod відкидає зайві ключі, і {attempt} збігся б із {}.
        z.object({ attempt: z.string().min(20).max(2000) }),
        z.object({ transcript: z.string().max(300).optional(), skipped: z.boolean().optional() }),
      ]),
    })
    .parse(await body(c));
  return c.json(await answerItem(c.get('userId'), id, b.key, b.answer));
});

r.post('/sessions/:id/finish', async (c) => c.json(await finishSession(c.get('userId'), c.req.param('id'))));

// ── Озвучка (серверний синтез pl-PL, кеш у D1) ──
r.get('/tts/status', (c) => c.json(ttsStatus()));
r.get('/speech/status', (c) => c.json(sttStatus()));
r.post('/speech/transcribe', rateLimit(6, 60_000, 'speech'), async (c) => {
  // Для уроку запис прив'язується до сесії й завдання: у відповідь — підписана спроба для /answer.
  const bind = z.object({ session: z.string().max(64), item: z.string().max(100) }).partial().parse(query(c));
  const userId = c.get('userId');
  if (bind.session && bind.item) await assertSpeechItem(userId, bind.session, bind.item);
  const result = await transcribeSpeech(await readSpeechBody(c.req.raw), { meter: () => consumeQuota(userId, 'stt') });
  if (!bind.session || !bind.item) return c.json(result);
  return c.json({ ...result, attempt: issueSpeechAttempt({ userId, sessionId: bind.session, key: bind.item, transcript: result.transcript }) });
});
r.get('/tts', rateLimit(120, 60_000, 'tts'), async (c) => {
  const q = z.object({ text: z.string().min(1).max(300), rate: z.enum(['normal', 'slow']).default('normal') }).parse(query(c));
  const audio = await synthesize(q.text, q.rate, { meter: () => consumeQuota(c.get('userId'), 'tts') });
  return c.body(new Uint8Array(audio.data), 200, { 'content-type': audio.mime, 'cache-control': 'private, max-age=31536000, immutable', 'x-tts-cache': audio.cached ? 'hit' : 'miss' });
});

// ── Словник ──
r.get('/vocab/topics', async (c) => c.json(Object.entries(TOPICS).map(([key, name]) => ({ key, name }))));

const PAGE = 50;

r.get('/vocab', async (c) => {
  const userId = c.get('userId');
  const q = z
    .object({
      search: z.string().max(60).optional(),
      topic: z.string().max(30).optional(),
      cefr: z.enum(['A0', 'A1', 'A2', 'B1', 'B2']).optional(),
      filter: z.enum(['all', 'mine', 'learned', 'favorites', 'due']).default('all'),
      cursor: z.string().regex(/^\d+$/).optional(),
    })
    .parse(query(c));
  const conds: (SQL | undefined)[] = [eq(vocabularyEntries.status, 'PUBLISHED')];
  if (q.topic) conds.push(sql`EXISTS (SELECT 1 FROM json_each(${vocabularyEntries.topics}) WHERE value = ${q.topic})`);
  if (q.cefr) conds.push(eq(vocabularyEntries.cefr, q.cefr));
  if (q.search) {
    // Пошук за польським словом або перекладом будь-якою мовою.
    const s = `%${q.search.trim().toLowerCase()}%`;
    conds.push(or(sql`lower(${vocabularyEntries.pl}) LIKE ${s}`, sql`lower(${vocabularyEntries.translations}) LIKE ${s}`));
  }
  const mine = (extra?: SQL) =>
    exists(db.select({ x: sql`1` }).from(userVocabulary).where(and(eq(userVocabulary.entryId, vocabularyEntries.id), eq(userVocabulary.userId, userId), extra)));
  if (q.filter === 'mine') conds.push(mine());
  if (q.filter === 'learned') conds.push(mine(eq(userVocabulary.status, 'LEARNED')));
  if (q.filter === 'favorites') conds.push(mine(eq(userVocabulary.favorite, true)));
  if (q.filter === 'due') {
    const due = db
      .select({ id: reviewSchedule.itemId })
      .from(reviewSchedule)
      .where(and(eq(reviewSchedule.userId, userId), eq(reviewSchedule.itemType, 'WORD'), lte(reviewSchedule.dueAt, new Date())));
    conds.push(inArray(vocabularyEntries.id, due));
  }
  const offset = Number(q.cursor ?? 0);
  const rows = await db
    .select({ e: vocabularyEntries, u: userVocabulary })
    .from(vocabularyEntries)
    .leftJoin(userVocabulary, and(eq(userVocabulary.entryId, vocabularyEntries.id), eq(userVocabulary.userId, userId)))
    .where(and(...conds))
    .orderBy(asc(vocabularyEntries.cefr), asc(vocabularyEntries.pl))
    .limit(PAGE)
    .offset(offset);
  return c.json({
    items: rows.map(({ e, u }) => ({ ...e, mine: u ? { status: u.status, favorite: u.favorite, timesCorrect: u.timesCorrect, timesWrong: u.timesWrong } : null })),
    nextCursor: rows.length === PAGE ? String(offset + PAGE) : null,
  });
});

r.post('/vocab/:id/favorite', async (c) => {
  const id = c.req.param('id');
  const { favorite } = z.object({ favorite: z.boolean() }).parse(await body(c));
  const entry = await db.query.vocabularyEntries.findFirst({ where: eq(vocabularyEntries.id, id), columns: { id: true } });
  if (!entry) throw notFound();
  await db
    .insert(userVocabulary)
    .values({ userId: c.get('userId'), entryId: id, favorite })
    .onConflictDoUpdate({ target: [userVocabulary.userId, userVocabulary.entryId], set: { favorite } });
  return c.json({ favorite });
});

/** Слово дня — однакове для всіх користувачів у цей день. */
r.get('/vocab/word-of-day', async (c) => {
  const day = dayKey(new Date());
  const withExamples = and(eq(vocabularyEntries.status, 'PUBLISHED'), sql`json_array_length(${vocabularyEntries.examples}) > 0`);
  const [{ n }] = await db.select({ n: count() }).from(vocabularyEntries).where(withExamples);
  if (!n) return c.json(null);
  let h = 0;
  for (const ch of day) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const [entry] = await db.select().from(vocabularyEntries).where(withExamples).orderBy(asc(vocabularyEntries.id)).limit(1).offset(h % n);
  return c.json(entry ?? null);
});

// ── Граматика ──
/** Теми з прогресом: освоєння = середня майстерність навичок теми; кількість вправ — з опублікованих уроків. */
r.get('/grammar', async (c) => {
  const allSkills = GRAMMAR.flatMap((g) => g.skills);
  const [skills, counts] = await Promise.all([
    db.select().from(languageSkills).where(and(eq(languageSkills.userId, c.get('userId')), inArray(languageSkills.skill, allSkills))),
    db
      .select({ skill: exercises.skill, n: count() })
      .from(exercises)
      .innerJoin(lessons, eq(lessons.id, exercises.lessonId))
      .where(and(inArray(exercises.skill, allSkills), eq(lessons.status, 'PUBLISHED')))
      .groupBy(exercises.skill),
  ]);
  return c.json(
    GRAMMAR.map((g) => {
      const mine = skills.filter((s) => g.skills.includes(s.skill));
      const attempts = mine.reduce((n, s) => n + s.attempts, 0);
      const mastery = mine.length ? Math.round(mine.reduce((n, s) => n + s.mastery, 0) / g.skills.length) : 0;
      const exerciseCount = counts.filter((x) => g.skills.includes(x.skill)).reduce((n, x) => n + x.n, 0);
      return {
        slug: g.slug, title: g.title, subtitle: g.subtitle, cefr: g.cefr, difficulty: g.difficulty, color: g.color, glyph: g.glyph,
        rule: g.rule, examples: g.examples, exercises: exerciseCount, attempts, mastery,
        state: attempts === 0 ? 'new' : mastery >= 80 ? 'mastered' : 'started',
      };
    }),
  );
});

// ── Іспити ──
r.get('/exams', async (c) => {
  const userId = c.get('userId');
  const exams = await db
    .select({ l: lessons, n: count(exercises.id) })
    .from(lessons)
    .leftJoin(exercises, eq(exercises.lessonId, lessons.id))
    .where(and(inArray(lessons.kind, ['EXAM', 'PLACEMENT']), eq(lessons.status, 'PUBLISHED')))
    .groupBy(lessons.id)
    .orderBy(asc(lessons.cefr), asc(lessons.slug));
  const ids = exams.map((e) => e.l.id);
  const [progress, history] = await db.batch([
    db.select().from(userLessonProgress).where(and(eq(userLessonProgress.userId, userId), inArray(userLessonProgress.lessonId, ids.length ? ids : ['-']))),
    db
      .select({ id: learningSessions.id, lessonId: learningSessions.lessonId, correct: learningSessions.correct, total: learningSessions.total, finishedAt: learningSessions.finishedAt })
      .from(learningSessions)
      .where(and(eq(learningSessions.userId, userId), eq(learningSessions.status, 'FINISHED'), inArray(learningSessions.mode, ['EXAM', 'PLACEMENT'])))
      .orderBy(desc(learningSessions.finishedAt))
      .limit(20),
  ]);
  return c.json({
    exams: exams.map(({ l: e, n }) => {
      const p = progress.find((x) => x.lessonId === e.id);
      return { id: e.id, slug: e.slug, kind: e.kind, title: e.title, topic: e.topic, cefr: e.cefr, isPremium: e.isPremium, exerciseCount: n, bestScore: p?.bestScore ?? null, passed: !!p?.firstCompletedAt };
    }),
    history,
  });
});
