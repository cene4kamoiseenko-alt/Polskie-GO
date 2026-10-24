/** Профіль, статистика, графіки прогресу, щоденник подорожей. */
import { dayKey, effectiveStreak, levelFromXp, type Cefr } from '@polski-go/shared';
import { prisma } from '../db';
import { getRewards } from './gameConfig';
import { activeSubscription } from './premium';
import { outfit } from './shop';

const GOAL_XP: Record<number, number> = { 5: 30, 10: 50, 15: 80, 20: 120 };
export const goalXp = (minutes: number) => GOAL_XP[minutes] ?? Math.max(20, minutes * 5);

export async function getMe(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: { settings: true, profile: true, progress: { include: { currentCity: true } }, wallet: true },
  });
  const tz = user.settings?.timezone ?? 'Europe/Warsaw';
  const today = dayKey(new Date(), tz);
  const [todayAct, sub, look, dueReviews, mistakes, unseenAch, cfg, usage] = await Promise.all([
    prisma.dailyActivity.findUnique({ where: { userId_day: { userId, day: today } } }),
    activeSubscription(userId),
    outfit(userId),
    prisma.reviewSchedule.count({ where: { userId, itemType: 'WORD', dueAt: { lte: new Date() } } }),
    prisma.reviewSchedule.count({ where: { userId, OR: [{ itemType: 'EXERCISE' }, { itemType: 'WORD', lapses: { gt: 0 } }] } }),
    prisma.userAchievement.count({ where: { userId, seen: false } }),
    getRewards(),
    prisma.aiUsage.findUnique({ where: { userId_day: { userId, day: today } } }),
  ]);
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
  };
}

export async function getStats(userId: string, days: number) {
  const settings = await prisma.userSettings.findUnique({ where: { userId } });
  const tz = settings?.timezone ?? 'Europe/Warsaw';
  const keys: string[] = [];
  const now = Date.now();
  for (let i = days - 1; i >= 0; i--) keys.push(dayKey(new Date(now - i * 86_400_000), tz));
  const [rows, skills, vocab, sessions] = await Promise.all([
    prisma.dailyActivity.findMany({ where: { userId, day: { in: keys } } }),
    prisma.languageSkill.findMany({ where: { userId }, orderBy: { mastery: 'desc' } }),
    prisma.userVocabulary.groupBy({ by: ['status'], where: { userId }, _count: true }),
    prisma.learningSession.findMany({ where: { userId, status: 'FINISHED' }, orderBy: { finishedAt: 'desc' }, take: 20, include: { lesson: { select: { title: true, kind: true } } } }),
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
    history: sessions.map((s) => ({ id: s.id, mode: s.mode, lesson: s.lesson, correct: s.correct, total: s.total, xp: s.xpAwarded, finishedAt: s.finishedAt })),
  };
}

export async function getDiary(userId: string) {
  const visits = await prisma.userCity.findMany({ where: { userId }, include: { city: true }, orderBy: { unlockedAt: 'asc' } });
  const [lp, quests, items] = await Promise.all([
    prisma.userLessonProgress.findMany({ where: { userId, firstCompletedAt: { not: null } }, include: { lesson: { include: { route: true } } } }),
    prisma.userQuest.findMany({ where: { userId, periodKey: 'story', status: { in: ['COMPLETED', 'CLAIMED'] } }, include: { quest: true } }),
    prisma.userInventory.findMany({ where: { userId, item: { cityId: { not: null } } }, include: { item: true } }),
  ]);
  const totals = await prisma.lesson.groupBy({ by: ['routeId'], where: { status: 'PUBLISHED', routeId: { not: null } }, _count: true });
  const routes = await prisma.cityRoute.findMany({ where: { status: 'PUBLISHED' } });
  return visits.map((v) => {
    const cityRoutes = routes.filter((r) => r.cityId === v.cityId);
    const total = totals.filter((t) => cityRoutes.some((r) => r.id === t.routeId)).reduce((s, t) => s + t._count, 0);
    const done = lp.filter((l) => l.lesson.route?.cityId === v.cityId);
    return {
      city: { id: v.city.id, slug: v.city.slug, namePl: v.city.namePl, name: v.city.name, emoji: v.city.emoji, color: v.city.color, theme: v.city.theme },
      unlockedAt: v.unlockedAt,
      completedAt: v.bossPassedAt,
      progress: total ? Math.round((done.length / total) * 100) : 0,
      topics: [...new Set(done.map((d) => JSON.stringify(d.lesson.topic)))].map((s) => JSON.parse(s)),
      quests: quests.filter((q) => q.quest.cityId === v.cityId).map((q) => ({ slug: q.quest.slug, title: q.quest.title, icon: q.quest.icon })),
      souvenirs: items.filter((i) => i.item.cityId === v.cityId).map((i) => ({ slug: i.item.slug, name: i.item.name, slot: i.item.slot })),
    };
  });
}
