/** Профіль, статистика, графіки прогресу, щоденник подорожей. */
import { dayKey, effectiveStreak, levelFromXp, type Cefr } from '@polski-go/shared';
import { and, count, desc, eq, gt, inArray, isNotNull, lte, or } from 'drizzle-orm';
import { db } from '../db';
import {
  aiUsage, cities, cityRoutes, cosmeticItems, dailyActivity, gameWallets, languageSkills, learningSessions, lessons, playerProgress,
  quests, reviewSchedule, userAchievements, userCities, userInventory, userLessonProgress, userProfiles, userQuests, userSettings, userVocabulary, users,
} from '../db/schema';
import { getRewards } from './gameConfig';
import { ttsConfigured, ttsStatus } from './tts';
import { activeSubscription } from './premium';
import { outfit } from './shop';

export { goalXpFor as goalXp } from './goal';
import { goalXpFor as goalXp } from './goal';

export async function getMe(userId: string) {
  // Незалежні дані — паралельно; залежне від часового поясу (сьогоднішній день) — другим кроком.
  const [userRow, settingsRow, profileRow, progressRow, walletRow, sub, look, cfg] = await Promise.all([
    db.select().from(users).where(eq(users.id, userId)),
    db.select().from(userSettings).where(eq(userSettings.userId, userId)),
    db.select().from(userProfiles).where(eq(userProfiles.userId, userId)),
    db.select({ p: playerProgress, city: cities }).from(playerProgress).leftJoin(cities, eq(cities.id, playerProgress.currentCityId)).where(eq(playerProgress.userId, userId)),
    db.select().from(gameWallets).where(eq(gameWallets.userId, userId)),
    activeSubscription(userId),
    outfit(userId),
    getRewards(),
  ]);
  const user = { ...userRow[0], settings: settingsRow[0] ?? null, profile: profileRow[0] ?? null, wallet: walletRow[0] ?? null, progress: { ...progressRow[0].p, currentCity: progressRow[0].city } };
  const tz = user.settings?.timezone ?? 'Europe/Warsaw';
  const now = new Date();
  const today = dayKey(now, tz);
  const [todayRow, dueRow, mistakesRow, unseenRow, usageRow] = await db.batch([
    db.select().from(dailyActivity).where(and(eq(dailyActivity.userId, userId), eq(dailyActivity.day, today))),
    db.select({ n: count() }).from(reviewSchedule).where(and(eq(reviewSchedule.userId, userId), eq(reviewSchedule.itemType, 'WORD'), lte(reviewSchedule.dueAt, now))),
    db
      .select({ n: count() })
      .from(reviewSchedule)
      .where(and(eq(reviewSchedule.userId, userId), or(eq(reviewSchedule.itemType, 'EXERCISE'), and(eq(reviewSchedule.itemType, 'WORD'), gt(reviewSchedule.lapses, 0))))),
    db.select({ n: count() }).from(userAchievements).where(and(eq(userAchievements.userId, userId), eq(userAchievements.seen, false))),
    db.select().from(aiUsage).where(and(eq(aiUsage.userId, userId), eq(aiUsage.day, today))),
  ]);
  const todayAct = todayRow[0];
  const usage = usageRow[0];
  const dueReviews = dueRow[0]?.n ?? 0;
  const mistakes = mistakesRow[0]?.n ?? 0;
  const unseenAch = unseenRow[0]?.n ?? 0;
  const p = user.progress!;
  const lvl = levelFromXp(p.xpTotal);
  const premium = !!sub;
  return {
    id: user.id,
    telegramId: user.telegramId.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    photoUrl: user.photoUrl,
    referralCode: user.referralCode,
    onboarded: !!user.onboardedAt,
    createdAt: user.createdAt,
    settings: user.settings,
    profile: user.profile,
    progress: {
      xpTotal: p.xpTotal,
      level: lvl.level,
      levelXp: lvl.current,
      levelXpNeeded: lvl.needed,
      languageLevel: p.languageLevel as Cefr,
      streak: effectiveStreak(p.streakCurrent, p.lastActiveDay, today),
      streakBest: p.streakBest,
      activeToday: p.lastActiveDay === today,
      lessonsCompleted: p.lessonsCompleted,
      perfectLessons: p.perfectLessons,
      wordsLearned: p.wordsLearned,
      currentCity: p.currentCity ? { id: p.currentCity.id, slug: p.currentCity.slug, namePl: p.currentCity.namePl, name: p.currentCity.name, emoji: p.currentCity.emoji } : null,
    },
    today: {
      xp: todayAct?.xp ?? 0,
      goalXp: goalXp(user.settings?.dailyGoalMinutes ?? 10),
      lessons: todayAct?.lessons ?? 0,
      seconds: todayAct?.seconds ?? 0,
    },
    zlotki: user.wallet?.balance ?? 0,
    premium: premium ? { active: true, expiresAt: sub!.expiresAt, planCode: sub!.planCode, recurring: sub!.isRecurring, cancelled: sub!.status === 'CANCELLED' } : { active: false },
    outfit: look,
    counters: { dueReviews, mistakes, unseenAchievements: unseenAch },
    ai: { used: usage?.requests ?? 0, limit: premium ? cfg.premiumAiMessagesPerDay : cfg.freeAiMessagesPerDay },
    rewards: { exerciseXp: cfg.exerciseXp },
    /** Чи доступна серверна польська озвучка (інакше — лише польський голос пристрою). */
    audio: { server: ttsConfigured(), ...ttsStatus() },
  };
}

export async function getStats(userId: string, days: number) {
  const settings = await db.query.userSettings.findFirst({ where: eq(userSettings.userId, userId) });
  const tz = settings?.timezone ?? 'Europe/Warsaw';
  const keys: string[] = [];
  const now = Date.now();
  for (let i = days - 1; i >= 0; i--) keys.push(dayKey(new Date(now - i * 86_400_000), tz));
  const [rows, skills, vocab, sessions] = await Promise.all([
    db.select().from(dailyActivity).where(and(eq(dailyActivity.userId, userId), inArray(dailyActivity.day, keys))),
    db.select().from(languageSkills).where(eq(languageSkills.userId, userId)).orderBy(desc(languageSkills.mastery)),
    db.select({ status: userVocabulary.status, _count: count() }).from(userVocabulary).where(eq(userVocabulary.userId, userId)).groupBy(userVocabulary.status),
    db
      .select({ s: learningSessions, title: lessons.title, kind: lessons.kind })
      .from(learningSessions)
      .leftJoin(lessons, eq(lessons.id, learningSessions.lessonId))
      .where(and(eq(learningSessions.userId, userId), eq(learningSessions.status, 'FINISHED')))
      .orderBy(desc(learningSessions.finishedAt))
      .limit(20),
  ]);
  const byDay = new Map(rows.map((r) => [r.day, r]));
  return {
    days: keys.map((d) => ({ day: d, xp: byDay.get(d)?.xp ?? 0, lessons: byDay.get(d)?.lessons ?? 0, minutes: Math.round((byDay.get(d)?.seconds ?? 0) / 60), correct: byDay.get(d)?.correct ?? 0, exercises: byDay.get(d)?.exercises ?? 0 })),
    totals: {
      xp: rows.reduce((s, r) => s + r.xp, 0),
      lessons: rows.reduce((s, r) => s + r.lessons, 0),
      minutes: Math.round(rows.reduce((s, r) => s + r.seconds, 0) / 60),
      accuracy: (() => {
        const ex = rows.reduce((s, r) => s + r.exercises, 0);
        return ex ? Math.round((rows.reduce((s, r) => s + r.correct, 0) / ex) * 100) : 0;
      })(),
    },
    skills: skills.map((s) => ({ skill: s.skill, mastery: s.mastery, attempts: s.attempts, accuracy: s.attempts ? Math.round((s.correct / s.attempts) * 100) : 0 })),
    vocabulary: Object.fromEntries(vocab.map((v) => [v.status, v._count])),
    history: sessions.map(({ s, title, kind }) => ({ id: s.id, mode: s.mode, lesson: title ? { title, kind } : null, correct: s.correct, total: s.total, xp: s.xpAwarded, finishedAt: s.finishedAt })),
  };
}

export async function getDiary(userId: string) {
  const [visits, lp, questRows, items, totals] = await Promise.all([
    db.select({ v: userCities, city: cities }).from(userCities).innerJoin(cities, eq(cities.id, userCities.cityId)).where(eq(userCities.userId, userId)).orderBy(userCities.unlockedAt),
    db
      .select({ topic: lessons.topic, cityId: cityRoutes.cityId })
      .from(userLessonProgress)
      .innerJoin(lessons, eq(lessons.id, userLessonProgress.lessonId))
      .leftJoin(cityRoutes, eq(cityRoutes.id, lessons.routeId))
      .where(and(eq(userLessonProgress.userId, userId), isNotNull(userLessonProgress.firstCompletedAt))),
    db
      .select({ slug: quests.slug, title: quests.title, icon: quests.icon, cityId: quests.cityId })
      .from(userQuests)
      .innerJoin(quests, eq(quests.id, userQuests.questId))
      .where(and(eq(userQuests.userId, userId), eq(userQuests.periodKey, 'story'), inArray(userQuests.status, ['COMPLETED', 'CLAIMED']))),
    db
      .select({ slug: cosmeticItems.slug, name: cosmeticItems.name, slot: cosmeticItems.slot, cityId: cosmeticItems.cityId })
      .from(userInventory)
      .innerJoin(cosmeticItems, eq(cosmeticItems.id, userInventory.itemId))
      .where(and(eq(userInventory.userId, userId), isNotNull(cosmeticItems.cityId))),
    db
      .select({ cityId: cityRoutes.cityId, n: count() })
      .from(lessons)
      .innerJoin(cityRoutes, eq(cityRoutes.id, lessons.routeId))
      .where(and(eq(lessons.status, 'PUBLISHED'), eq(cityRoutes.status, 'PUBLISHED')))
      .groupBy(cityRoutes.cityId),
  ]);
  return visits.map(({ v, city }) => {
    const total = totals.find((t) => t.cityId === v.cityId)?.n ?? 0;
    const done = lp.filter((l) => l.cityId === v.cityId);
    return {
      city: { id: city.id, slug: city.slug, namePl: city.namePl, name: city.name, emoji: city.emoji, color: city.color, theme: city.theme },
      unlockedAt: v.unlockedAt,
      completedAt: v.bossPassedAt,
      progress: total ? Math.round((done.length / total) * 100) : 0,
      topics: [...new Set(done.map((d) => JSON.stringify(d.topic)))].map((x) => JSON.parse(x)),
      quests: questRows.filter((q) => q.cityId === v.cityId).map((q) => ({ slug: q.slug, title: q.title, icon: q.icon })),
      souvenirs: items.filter((i) => i.cityId === v.cityId).map((i) => ({ slug: i.slug, name: i.name, slot: i.slot })),
    };
  });
}
