/** Карта, уроки, навчальні сесії, словник, іспити. */
import type { FastifyPluginAsync } from 'fastify';
import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import { dayKey, type I18n } from '@polski-go/shared';
import { prisma } from '../db';
import { requireUser } from '../auth';
import { notFound } from '../lib/errors';
import { getJourney } from '../services/journey';
import { answerItem, finishSession, startSession } from '../services/sessions';
import { TOPICS } from '../content/vocab';
import { GRAMMAR } from '../content/grammar';

export const learnRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', requireUser);

  app.get('/journey', async (req) => getJourney(req.userId));

  app.post('/sessions', { config: { rateLimit: { max: 60, timeWindow: '1 minute' } } }, async (req) => {
    const body = z
      .object({ lessonId: z.string().optional(), mode: z.enum(['REVIEW', 'MISTAKES', 'FIVE_MIN', 'SPEED', 'GRAMMAR']).optional(), topic: z.string().max(40).optional() })
      .refine((b) => b.lessonId || b.mode, 'lessonId or mode required')
      .parse(req.body);
    return startSession(req.userId, body);
  });

  app.post('/sessions/:id/answer', async (req) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const body = z
      .object({
        key: z.string().max(100),
        answer: z.union([
          z.object({ step: z.number().int().min(0).max(50), optionId: z.string().max(40) }),
          z.object({ optionId: z.string().max(40) }),
          z.object({ text: z.string().max(500) }),
          z.object({ tokens: z.array(z.string().max(60)).max(40) }),
          z.object({ pairs: z.array(z.tuple([z.string().max(40), z.string().max(40)])).max(12) }),
          z.object({ transcript: z.string().max(300).optional(), skipped: z.boolean().optional() }),
        ]),
      })
      .parse(req.body);
    return answerItem(req.userId, id, body.key, body.answer);
  });

  app.post('/sessions/:id/finish', async (req) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    return finishSession(req.userId, id);
  });

  // ── Словник ──
  app.get('/vocab/topics', async () => Object.entries(TOPICS).map(([key, name]) => ({ key, name })));

  app.get('/vocab', async (req) => {
    const q = z
      .object({
        search: z.string().max(60).optional(),
        topic: z.string().max(30).optional(),
        cefr: z.enum(['A0', 'A1', 'A2', 'B1', 'B2']).optional(),
        filter: z.enum(['all', 'mine', 'learned', 'favorites', 'due']).default('all'),
        cursor: z.string().optional(),
      })
      .parse(req.query);
    const where: Prisma.VocabularyEntryWhereInput = { status: 'PUBLISHED' };
    if (q.topic) where.topics = { has: q.topic };
    if (q.cefr) where.cefr = q.cefr;
    if (q.search) {
      const s = q.search.trim();
      // Пошук за польським словом або перекладом будь-якою мовою.
      const tr = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM vocabulary_entries
        WHERE pl ILIKE ${'%' + s + '%'} OR translations::text ILIKE ${'%' + s + '%'}
        LIMIT 200`;
      where.id = { in: tr.map((t) => t.id) };
    }
    if (q.filter === 'mine') where.users = { some: { userId: req.userId } };
    if (q.filter === 'learned') where.users = { some: { userId: req.userId, status: 'LEARNED' } };
    if (q.filter === 'favorites') where.users = { some: { userId: req.userId, favorite: true } };
    if (q.filter === 'due') {
      const due = await prisma.reviewSchedule.findMany({ where: { userId: req.userId, itemType: 'WORD', dueAt: { lte: new Date() } }, select: { itemId: true } });
      where.id = { in: due.map((d) => d.itemId) };
    }
    const rows = await prisma.vocabularyEntry.findMany({
      where,
      orderBy: [{ cefr: 'asc' }, { pl: 'asc' }],
      take: 50,
      ...(q.cursor ? { skip: 1, cursor: { id: q.cursor } } : {}),
      include: { users: { where: { userId: req.userId } } },
    });
    return {
      items: rows.map(({ users, ...e }) => ({ ...e, mine: users[0] ? { status: users[0].status, favorite: users[0].favorite, timesCorrect: users[0].timesCorrect, timesWrong: users[0].timesWrong } : null })),
      nextCursor: rows.length === 50 ? rows[rows.length - 1].id : null,
    };
  });

  app.post('/vocab/:id/favorite', async (req) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const { favorite } = z.object({ favorite: z.boolean() }).parse(req.body);
    const entry = await prisma.vocabularyEntry.findUnique({ where: { id } });
    if (!entry) throw notFound();
    await prisma.userVocabulary.upsert({
      where: { userId_entryId: { userId: req.userId, entryId: id } },
      create: { userId: req.userId, entryId: id, favorite },
      update: { favorite },
    });
    return { favorite };
  });

  /** Слово дня — однакове для всіх користувачів у цей день. */
  app.get('/vocab/word-of-day', async () => {
    const day = dayKey(new Date());
    const count = await prisma.vocabularyEntry.count({ where: { status: 'PUBLISHED', examples: { not: [] } } });
    if (!count) return null;
    let h = 0;
    for (const c of day) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    const [entry] = await prisma.vocabularyEntry.findMany({ where: { status: 'PUBLISHED', examples: { not: [] } }, orderBy: { id: 'asc' }, skip: h % count, take: 1 });
    return entry;
  });

  // ── Граматика ──
  /** Теми з прогресом: освоєння = середня майстерність навичок теми; кількість вправ — з опублікованих уроків. */
  app.get('/grammar', async (req) => {
    const allSkills = GRAMMAR.flatMap((g) => g.skills);
    const [skills, counts] = await Promise.all([
      prisma.languageSkill.findMany({ where: { userId: req.userId, skill: { in: allSkills } } }),
      prisma.exercise.groupBy({ by: ['skill'], where: { skill: { in: allSkills }, lesson: { status: 'PUBLISHED' } }, _count: true }),
    ]);
    return GRAMMAR.map((g) => {
      const mine = skills.filter((s) => g.skills.includes(s.skill));
      const attempts = mine.reduce((n, s) => n + s.attempts, 0);
      const mastery = mine.length ? Math.round(mine.reduce((n, s) => n + s.mastery, 0) / g.skills.length) : 0;
      const exercises = counts.filter((c) => g.skills.includes(c.skill)).reduce((n, c) => n + c._count, 0);
      return {
        slug: g.slug, title: g.title, subtitle: g.subtitle, cefr: g.cefr, difficulty: g.difficulty, color: g.color, glyph: g.glyph,
        rule: g.rule, examples: g.examples, exercises, attempts, mastery,
        state: attempts === 0 ? 'new' : mastery >= 80 ? 'mastered' : 'started',
      };
    });
  });

  // ── Іспити ──
  app.get('/exams', async (req) => {
    const exams = await prisma.lesson.findMany({ where: { kind: { in: ['EXAM', 'PLACEMENT'] }, status: 'PUBLISHED' }, orderBy: [{ cefr: 'asc' }, { slug: 'asc' }], include: { _count: { select: { exercises: true } } } });
    const progress = await prisma.userLessonProgress.findMany({ where: { userId: req.userId, lessonId: { in: exams.map((e) => e.id) } } });
    const history = await prisma.learningSession.findMany({
      where: { userId: req.userId, status: 'FINISHED', mode: { in: ['EXAM', 'PLACEMENT'] } },
      orderBy: { finishedAt: 'desc' },
      take: 20,
      select: { id: true, lessonId: true, correct: true, total: true, finishedAt: true },
    });
    return {
      exams: exams.map((e) => ({
        id: e.id, slug: e.slug, kind: e.kind, title: e.title, topic: e.topic as I18n, cefr: e.cefr, isPremium: e.isPremium,
        exerciseCount: e._count.exercises, bestScore: progress.find((p) => p.lessonId === e.id)?.bestScore ?? null,
        passed: !!progress.find((p) => p.lessonId === e.id)?.firstCompletedAt,
      })),
      history,
    };
  });
};
