/** Авторизація, профіль, налаштування, онбординг, приватність. */
import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { UI_LANGS, CEFR_LEVELS } from '@polski-go/shared';
import { config } from '../env';
import { atomic, db } from '../db';
import {
  aiConversations, aiUsage, dailyActivity, gameWallets, languageSkills, learningSessions, notificationLog, paymentEvents, playerProgress, subscriptions,
  userAchievements, userCities, userInventory, userLessonProgress, userProfiles, userQuests, userSettings, userVocabulary, users, walletTransactions,
} from '../db/schema';
import { body, query, rateLimit, type AppEnv } from '../hono';
import { forgetUser } from '../auth';
import { HttpError, badRequest } from '../lib/errors';
import { validateInitData } from '../lib/telegram';
import { signToken } from '../lib/token';
import { upsertTelegramUser } from '../services/users';
import { getDiary, getMe, getStats } from '../services/profile';

const TOKEN_TTL = 7 * 24 * 3600;

export const authRoutes = new Hono<AppEnv>();

/** Вхід через підписані Telegram initData. */
authRoutes.post('/auth/telegram', rateLimit(30, 60_000, 'auth'), async (c) => {
  const { initData } = z.object({ initData: z.string().min(10).max(8192) }).parse(await body(c));
  let data;
  try {
    data = validateInitData(initData, config.botToken, config.initDataMaxAgeSec);
  } catch (e) {
    throw new HttpError(401, 'invalid_init_data', (e as Error).message);
  }
  const user = await upsertTelegramUser(data.user, data.startParam);
  if (user.isBanned) throw new HttpError(403, 'banned');
  return c.json({ token: signToken({ uid: user.id, typ: 'user' }, TOKEN_TTL), startParam: data.startParam ?? null });
});

/** Вхід без Telegram для локальної розробки (вимкнено в production). */
authRoutes.post('/auth/dev', async (c) => {
  if (!config.devAuth) throw new HttpError(404, 'not_found');
  const b = z
    .object({ id: z.number().int().positive().default(100001), firstName: z.string().default('Dev'), username: z.string().optional(), startParam: z.string().optional() })
    .parse(await body(c));
  const user = await upsertTelegramUser({ id: b.id, first_name: b.firstName, username: b.username, language_code: 'uk' }, b.startParam);
  return c.json({ token: signToken({ uid: user.id, typ: 'user' }, TOKEN_TTL), dev: true });
});

/** Маршрути користувача (requireUser підключено в app.ts). */
export const meRoutes = new Hono<AppEnv>();
const me = meRoutes;

me.get('/me', async (c) => c.json(await getMe(c.get('userId'))));

me.patch('/me/settings', async (c) => {
  const b = z
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
    .parse(await body(c));
  if (b.timezone) {
    try {
      new Intl.DateTimeFormat('en', { timeZone: b.timezone });
    } catch {
      throw badRequest('bad_timezone');
    }
  }
  if (Object.keys(b).length) await db.update(userSettings).set(b).where(eq(userSettings.userId, c.get('userId')));
  return c.json(await getMe(c.get('userId')));
});

me.patch('/me/profile', async (c) => {
  const b = z
    .object({ displayName: z.string().trim().min(1).max(32).nullable().optional(), beaverName: z.string().trim().min(1).max(20).optional(), bio: z.string().max(140).nullable().optional() })
    .parse(await body(c));
  if (Object.keys(b).length) await db.update(userProfiles).set(b).where(eq(userProfiles.userId, c.get('userId')));
  return c.json(await getMe(c.get('userId')));
});

/** Завершення онбордингу: мова, самооцінка рівня, мета, час занять. */
me.post('/me/onboarding', async (c) => {
  const b = z
    .object({
      uiLanguage: z.enum(UI_LANGS),
      selfLevel: z.enum(CEFR_LEVELS),
      learningGoal: z.enum(['life', 'work', 'study', 'exam', 'travel', 'fun']),
      dailyGoalMinutes: z.union([z.literal(5), z.literal(10), z.literal(15), z.literal(20)]),
      reminderHour: z.number().int().min(0).max(23).nullable(),
      timezone: z.string().max(64).optional(),
    })
    .parse(await body(c));
  const userId = c.get('userId');
  await atomic([
    db
      .update(userSettings)
      .set({
        uiLanguage: b.uiLanguage, learningGoal: b.learningGoal, dailyGoalMinutes: b.dailyGoalMinutes,
        reminderHour: b.reminderHour, notificationsEnabled: b.reminderHour !== null, ...(b.timezone ? { timezone: b.timezone } : {}),
      })
      .where(eq(userSettings.userId, userId)),
    db.update(userProfiles).set({ selfLevel: b.selfLevel }).where(eq(userProfiles.userId, userId)),
    db.update(users).set({ onboardedAt: new Date() }).where(eq(users.id, userId)),
  ]);
  return c.json(await getMe(userId));
});

me.get('/me/stats', async (c) => {
  const { days } = z.object({ days: z.coerce.number().refine((d) => [7, 30, 90].includes(d)).default(7) }).parse(query(c));
  return c.json(await getStats(c.get('userId'), days));
});

me.get('/me/diary', async (c) => c.json(await getDiary(c.get('userId'))));

/** Експорт усіх персональних даних (JSON). */
me.get('/me/export', async (c) => {
  const id = c.get('userId');
  const [user, settings, profile, progress, wallet, skills, vocabulary, achievements, inventory, quests, transactions, subs, payments, ai, activity, lessons, cities, sessions] =
    await db.batch([
      db.select().from(users).where(eq(users.id, id)),
      db.select().from(userSettings).where(eq(userSettings.userId, id)),
      db.select().from(userProfiles).where(eq(userProfiles.userId, id)),
      db.select().from(playerProgress).where(eq(playerProgress.userId, id)),
      db.select().from(gameWallets).where(eq(gameWallets.userId, id)),
      db.select().from(languageSkills).where(eq(languageSkills.userId, id)),
      db.select().from(userVocabulary).where(eq(userVocabulary.userId, id)),
      db.select().from(userAchievements).where(eq(userAchievements.userId, id)),
      db.select().from(userInventory).where(eq(userInventory.userId, id)),
      db.select().from(userQuests).where(eq(userQuests.userId, id)),
      db.select().from(walletTransactions).where(eq(walletTransactions.userId, id)),
      db.select().from(subscriptions).where(eq(subscriptions.userId, id)),
      db.select().from(paymentEvents).where(eq(paymentEvents.userId, id)),
      db.select().from(aiConversations).where(eq(aiConversations.userId, id)),
      db.select().from(dailyActivity).where(eq(dailyActivity.userId, id)),
      db.select().from(userLessonProgress).where(eq(userLessonProgress.userId, id)),
      db.select().from(userCities).where(eq(userCities.userId, id)),
      db
        .select({
          id: learningSessions.id, mode: learningSessions.mode, lessonId: learningSessions.lessonId, correct: learningSessions.correct, total: learningSessions.total,
          xpAwarded: learningSessions.xpAwarded, startedAt: learningSessions.startedAt, finishedAt: learningSessions.finishedAt,
        })
        .from(learningSessions)
        .where(eq(learningSessions.userId, id)),
    ]);
  c.header('content-disposition', 'attachment; filename="polski-go-data.json"');
  return c.json({
    ...user[0], settings: settings[0], profile: profile[0], progress: progress[0], wallet: wallet[0], skills, vocabulary, achievements, inventory, quests,
    transactions, subscriptions: subs, payments, aiConversations: ai, dailyActivity: activity, lessonProgress: lessons, cities, sessions,
  });
});

/** Видалення акаунта та всіх пов'язаних даних (каскадно). */
me.delete('/me', async (c) => {
  z.object({ confirm: z.literal('DELETE') }).parse(await body(c));
  const id = c.get('userId');
  await atomic([
    db.update(paymentEvents).set({ userId: null }).where(eq(paymentEvents.userId, id)),
    db.delete(aiUsage).where(eq(aiUsage.userId, id)),
    db.delete(notificationLog).where(eq(notificationLog.userId, id)),
    db.delete(users).where(eq(users.id, id)),
  ]);
  forgetUser(id);
  return c.json({ deleted: true });
});

