/** Авторизація, профіль, налаштування, онбординг, приватність. */
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { UI_LANGS, CEFR_LEVELS } from '@polski-go/shared';
import { config } from '../config';
import { prisma } from '../db';
import { requireUser } from '../auth';
import { HttpError, badRequest } from '../lib/errors';
import { validateInitData } from '../lib/telegram';
import { signToken } from '../lib/token';
import { upsertTelegramUser } from '../services/users';
import { getDiary, getMe, getStats } from '../services/profile';

const TOKEN_TTL = 7 * 24 * 3600;

export const publicRoutes: FastifyPluginAsync = async (app) => {
  /** Вхід через підписані Telegram initData. */
  app.post('/auth/telegram', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, async (req) => {
    const { initData } = z.object({ initData: z.string().min(10).max(8192) }).parse(req.body);
    let data;
    try {
      data = validateInitData(initData, config.botToken, config.initDataMaxAgeSec);
    } catch (e) {
      throw new HttpError(401, 'invalid_init_data', (e as Error).message);
    }
    const user = await upsertTelegramUser(data.user, data.startParam);
    if (user.isBanned) throw new HttpError(403, 'banned');
    return { token: signToken({ uid: user.id, typ: 'user' }, TOKEN_TTL), startParam: data.startParam ?? null };
  });

  /** Вхід без Telegram для локальної розробки (вимкнено в production). */
  app.post('/auth/dev', async (req) => {
    if (!config.devAuth) throw new HttpError(404, 'not_found');
    const body = z.object({ id: z.number().int().positive().default(100001), firstName: z.string().default('Dev'), username: z.string().optional(), startParam: z.string().optional() }).parse(req.body ?? {});
    const user = await upsertTelegramUser({ id: body.id, first_name: body.firstName, username: body.username, language_code: 'uk' }, body.startParam);
    return { token: signToken({ uid: user.id, typ: 'user' }, TOKEN_TTL), dev: true };
  });

  app.register(async (r) => {
    r.addHook('preHandler', requireUser);

    r.get('/me', async (req) => getMe(req.userId));

    r.patch('/me/settings', async (req) => {
      const body = z
        .object({
          uiLanguage: z.enum(UI_LANGS).optional(),
          theme: z.enum(['auto', 'light', 'dark']).optional(),
          timezone: z.string().max(64).optional(),
          learningGoal: z.enum(['life', 'work', 'study', 'exam', 'travel', 'fun']).optional(),
          dailyGoalMinutes: z.union([z.literal(5), z.literal(10), z.literal(15), z.literal(20)]).optional(),
          reminderHour: z.number().int().min(0).max(23).nullable().optional(),
          notificationsEnabled: z.boolean().optional(),
          soundEnabled: z.boolean().optional(),
          reducedMotion: z.boolean().optional(),
          publicProfile: z.boolean().optional(),
          showInLeaderboard: z.boolean().optional(),
        })
        .parse(req.body);
      if (body.timezone) {
        try {
          new Intl.DateTimeFormat('en', { timeZone: body.timezone });
        } catch {
          throw badRequest('bad_timezone');
        }
      }
      await prisma.userSettings.update({ where: { userId: req.userId }, data: body });
      return getMe(req.userId);
    });

    r.patch('/me/profile', async (req) => {
      const body = z.object({ displayName: z.string().trim().min(1).max(32).nullable().optional(), beaverName: z.string().trim().min(1).max(20).optional(), bio: z.string().max(140).nullable().optional() }).parse(req.body);
      await prisma.userProfile.update({ where: { userId: req.userId }, data: body });
      return getMe(req.userId);
    });

    /** Завершення онбордингу: мова, самооцінка рівня, мета, час занять. */
    r.post('/me/onboarding', async (req) => {
      const body = z
        .object({
          uiLanguage: z.enum(UI_LANGS),
          selfLevel: z.enum(CEFR_LEVELS),
          learningGoal: z.enum(['life', 'work', 'study', 'exam', 'travel', 'fun']),
          dailyGoalMinutes: z.union([z.literal(5), z.literal(10), z.literal(15), z.literal(20)]),
          reminderHour: z.number().int().min(0).max(23).nullable(),
          timezone: z.string().max(64).optional(),
        })
        .parse(req.body);
      await prisma.$transaction([
        prisma.userSettings.update({
          where: { userId: req.userId },
          data: {
            uiLanguage: body.uiLanguage, learningGoal: body.learningGoal, dailyGoalMinutes: body.dailyGoalMinutes,
            reminderHour: body.reminderHour, notificationsEnabled: body.reminderHour !== null, ...(body.timezone ? { timezone: body.timezone } : {}),
          },
        }),
        prisma.userProfile.update({ where: { userId: req.userId }, data: { selfLevel: body.selfLevel } }),
        prisma.user.update({ where: { id: req.userId }, data: { onboardedAt: new Date() } }),
      ]);
      return getMe(req.userId);
    });

    r.get('/me/stats', async (req) => {
      const { days } = z.object({ days: z.coerce.number().refine((d) => [7, 30, 90].includes(d)).default(7) }).parse(req.query);
      return getStats(req.userId, days);
    });

    r.get('/me/diary', async (req) => getDiary(req.userId));

    /** Експорт усіх персональних даних (JSON). */
    r.get('/me/export', async (req, reply) => {
      const data = await prisma.user.findUniqueOrThrow({
        where: { id: req.userId },
        include: {
          settings: true, profile: true, progress: true, wallet: true, skills: true, vocabulary: true, achievements: true,
          inventory: true, quests: true, transactions: true, subscriptions: true, payments: true, aiConversations: true,
          dailyActivity: true, lessonProgress: true, cities: true,
          sessions: { select: { id: true, mode: true, lessonId: true, correct: true, total: true, xpAwarded: true, startedAt: true, finishedAt: true } },
        },
      });
      reply.header('content-disposition', 'attachment; filename="polski-go-data.json"');
      return data;
    });

    /** Видалення акаунта та всіх пов'язаних даних (каскадно). */
    r.delete('/me', async (req) => {
      const { confirm } = z.object({ confirm: z.literal('DELETE') }).parse(req.body);
      void confirm;
      await prisma.paymentEvent.updateMany({ where: { userId: req.userId }, data: { userId: null } });
      await prisma.aiUsage.deleteMany({ where: { userId: req.userId } });
      await prisma.notificationLog.deleteMany({ where: { userId: req.userId } });
      await prisma.user.delete({ where: { id: req.userId } });
      return { deleted: true };
    });
  });
};
