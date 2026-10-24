/**
 * Досягнення: перевіряються після подій, що змінюють метрики.
 * Метрика — рядок з таблиці `achievements.metric`. Прості метрики беруться з прогресу,
 * решта рахується запитами (лише для ще не отриманих досягнень).
 * Видача ідемпотентна: INSERT OR IGNORE + ключ ідемпотентності нагороди.
 */
import { and, asc, count, eq, gte, inArray, isNotNull, or, sql } from 'drizzle-orm';
import { dayDiff, dayKey } from '@polski-go/shared';
import { db, type Stmt } from '../db';
import {
  achievements, cityRoutes, dailyActivity, exerciseAttempts, friendships, learningSessions, lessons, playerProgress, reviewSchedule, userAchievements,
  userCities, userInventory, userLessonProgress, userMissionSteps, userMissions, userQuests, userSettings, userVocabulary, vocabularyEntries,
} from '../db/schema';
import { MISSIONS } from '../content/missions';
import { DISHES, PIEROGI_PHRASES } from '../content/vocab-life';
import { grantItem, grantZlotki, type Progress } from './rewards';
import { goalXpFor } from './goal';

export type Metric = string;

const missionsWithTag = (tag: string) => MISSIONS.filter((m) => m.tags.includes(tag)).map((m) => m.slug);
const stepKeysWithTag = (tag: string) => MISSIONS.flatMap((m) => m.steps.filter((s) => s.tags?.includes(tag)).map((s) => `${m.slug}:${s.id}`));
const n = (rows: { n: number }[]) => Number(rows[0]?.n ?? 0);

/** Скільки днів поспіль (до сьогодні включно або до вчора) виконано денну мету. */
async function goalDays(userId: string, extraToday: number): Promise<number> {
  const s = await db.query.userSettings.findFirst({ where: eq(userSettings.userId, userId), columns: { timezone: true, dailyGoalMinutes: true } });
  const tz = s?.timezone ?? 'Europe/Warsaw';
  const goal = goalXpFor(s?.dailyGoalMinutes ?? 10);
  const today = dayKey(new Date(), tz);
  const since = dayKey(new Date(Date.now() - 60 * 86_400_000), tz);
  const rows = await db.select({ day: dailyActivity.day, xp: dailyActivity.xp }).from(dailyActivity).where(and(eq(dailyActivity.userId, userId), gte(dailyActivity.day, since)));
  const met = new Set(rows.filter((r) => r.xp + (r.day === today ? extraToday : 0) >= goal).map((r) => r.day));
  if (extraToday >= goal) met.add(today);
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of [...met].sort()) {
    run = prev && dayDiff(prev, d) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
}

/** Міста, де пройдено всі звичайні уроки першого розділу (маршруту). */
async function firstSections(userId: string): Promise<number> {
  const [routeLessons, done] = await Promise.all([
    db
      .select({ cityId: cityRoutes.cityId, lessonId: lessons.id })
      .from(lessons)
      .innerJoin(cityRoutes, eq(cityRoutes.id, lessons.routeId))
      .where(and(eq(cityRoutes.order, 1), eq(lessons.status, 'PUBLISHED'), eq(lessons.kind, 'LESSON'))),
    db.select({ lessonId: userLessonProgress.lessonId }).from(userLessonProgress).where(and(eq(userLessonProgress.userId, userId), isNotNull(userLessonProgress.firstCompletedAt))),
  ]);
  const finished = new Set(done.map((d) => d.lessonId));
  const byCity = new Map<string, boolean>();
  for (const r of routeLessons) byCity.set(r.cityId, (byCity.get(r.cityId) ?? true) && finished.has(r.lessonId));
  return [...byCity.values()].filter(Boolean).length;
}

/** Значення однієї метрики. `adjust` — зміни поточного запиту, ще не записані в БД. */
async function resolveMetric(metric: Metric, userId: string, p: Progress, adjust: Record<string, number>): Promise<number> {
  const [name, arg = ''] = metric.split(':');
  switch (name) {
    case 'LESSONS': return p.lessonsCompleted;
    case 'STREAK': return p.streakBest;
    case 'WORDS': return p.wordsLearned;
    case 'XP': return p.xpTotal;
    case 'PERFECT_LESSONS': return p.perfectLessons;
    case 'CITIES':
      return n(await db.select({ n: count() }).from(userCities).where(and(eq(userCities.userId, userId), isNotNull(userCities.bossPassedAt))));
    case 'PURCHASES':
      return n(await db.select({ n: count() }).from(userInventory).where(and(eq(userInventory.userId, userId), eq(userInventory.source, 'shop'))));
    case 'FRIENDS':
      return n(
        await db
          .select({ n: count() })
          .from(friendships)
          .where(and(eq(friendships.status, 'ACCEPTED'), or(eq(friendships.requesterId, userId), eq(friendships.addresseeId, userId)))),
      );
    case 'STORY_QUESTS':
      return n(await db.select({ n: count() }).from(userQuests).where(and(eq(userQuests.userId, userId), eq(userQuests.periodKey, 'story'), inArray(userQuests.status, ['COMPLETED', 'CLAIMED']))));
    // Конкретна місія пройдена.
    case 'MISSION':
      return n(await db.select({ n: count() }).from(userMissions).where(and(eq(userMissions.userId, userId), eq(userMissions.missionSlug, arg)))) > 0 ? 1 : 0;
    // Різні пройдені місії з тегом.
    case 'MISSIONS_TAG': {
      const slugs = missionsWithTag(arg);
      if (!slugs.length) return 0;
      return n(await db.select({ n: count() }).from(userMissions).where(and(eq(userMissions.userId, userId), inArray(userMissions.missionSlug, slugs))));
    }
    // Місії з тегом, пройдені без жодної помилки й підказки.
    case 'FLAWLESS_TAG': {
      const slugs = missionsWithTag(arg);
      if (!slugs.length) return 0;
      return n(await db.select({ n: count() }).from(userMissions).where(and(eq(userMissions.userId, userId), inArray(userMissions.missionSlug, slugs), gte(userMissions.flawless, 1))));
    }
    // Різні ситуації (кроки місій) з тегом, розв'язані з першої спроби.
    case 'STEPS_TAG': {
      const keys = stepKeysWithTag(arg);
      if (!keys.length) return 0;
      return n(await db.select({ n: count() }).from(userMissionSteps).where(and(eq(userMissionSteps.userId, userId), inArray(userMissionSteps.stepKey, keys), eq(userMissionSteps.firstTry, true))));
    }
    // Багатокрокові діалоги: місії + сюжетні квести.
    case 'DIALOGS': {
      const [m, s] = await Promise.all([
        db.select({ n: count() }).from(userMissions).where(eq(userMissions.userId, userId)),
        resolveMetric('STORY_QUESTS', userId, p, adjust),
      ]);
      return n(m) + s;
    }
    // Різні польські страви, з якими розв'язано завдання в місіях.
    case 'DISHES': {
      const solved = await db.select({ key: userMissionSteps.stepKey }).from(userMissionSteps).where(eq(userMissionSteps.userId, userId));
      const keys = new Set(solved.map((r) => r.key));
      return DISHES.filter((d) => stepKeysWithTag(`dish:${d}`).some((k) => keys.has(k))).length;
    }
    // 10 виразів теми pierogi, правильно згаданих у повторенні, + фінальна місія (разом 11).
    case 'PIEROGI': {
      const [words, mission] = await Promise.all([
        db
          .select({ n: count() })
          .from(userVocabulary)
          .innerJoin(vocabularyEntries, eq(vocabularyEntries.id, userVocabulary.entryId))
          .where(and(eq(userVocabulary.userId, userId), inArray(vocabularyEntries.pl, PIEROGI_PHRASES), gte(userVocabulary.timesCorrect, 1))),
        resolveMetric('MISSION:krakow-pierogi', userId, p, adjust),
      ]);
      return Math.min(10, n(words)) + mission;
    }
    // Різні аудіозавдання, виконані правильно.
    case 'AUDIO':
      return n(
        await db
          .select({ n: sql<number>`count(distinct ${exerciseAttempts.itemKey})` })
          .from(exerciseAttempts)
          .where(and(eq(exerciseAttempts.userId, userId), eq(exerciseAttempts.skill, 'LISTENING'), eq(exerciseAttempts.isCorrect, true))),
      );
    // Завдання з «Моїх помилок», виправлені під час повторення.
    case 'MISTAKES_FIXED':
      return n(
        await db
          .select({ n: sql<number>`count(distinct ${exerciseAttempts.itemKey})` })
          .from(exerciseAttempts)
          .innerJoin(learningSessions, eq(learningSessions.id, exerciseAttempts.sessionId))
          .where(and(eq(exerciseAttempts.userId, userId), eq(learningSessions.mode, 'MISTAKES'), eq(exerciseAttempts.isCorrect, true))),
      );
    // Слова, правильно згадані після призначеного інтервалу (щонайменше друге успішне повторення).
    case 'LONG_RECALL':
      return n(await db.select({ n: count() }).from(reviewSchedule).where(and(eq(reviewSchedule.userId, userId), eq(reviewSchedule.itemType, 'WORD'), gte(reviewSchedule.repetitions, 2))));
    // Усі вказані уроки пройдено (кількість пройдених із переліку).
    case 'LESSONS_DONE': {
      const slugs = arg.split(',');
      return n(
        await db
          .select({ n: count() })
          .from(userLessonProgress)
          .innerJoin(lessons, eq(lessons.id, userLessonProgress.lessonId))
          .where(and(eq(userLessonProgress.userId, userId), inArray(lessons.slug, slugs), isNotNull(userLessonProgress.firstCompletedAt))),
      );
    }
    // Різні завдання з навичкою (префікс skill), виконані правильно.
    case 'SKILL_OK':
      return n(
        await db
          .select({ n: sql<number>`count(distinct ${exerciseAttempts.itemKey})` })
          .from(exerciseAttempts)
          .where(and(eq(exerciseAttempts.userId, userId), sql`${exerciseAttempts.skill} like ${arg + '%'}`, eq(exerciseAttempts.isCorrect, true))),
      );
    // Різні завдання певного типу, виконані правильно.
    case 'TYPE_OK':
      return n(
        await db
          .select({ n: sql<number>`count(distinct ${exerciseAttempts.itemKey})` })
          .from(exerciseAttempts)
          .where(and(eq(exerciseAttempts.userId, userId), eq(exerciseAttempts.type, arg), eq(exerciseAttempts.isCorrect, true))),
      );
    // Слова зі статусом «вивчене» (після трьох успішних повторень поспіль).
    case 'WORDS_LEARNED':
      return n(await db.select({ n: count() }).from(userVocabulary).where(and(eq(userVocabulary.userId, userId), eq(userVocabulary.status, 'LEARNED'))));
    case 'GOAL_DAYS':
      return goalDays(userId, adjust.TODAY_XP ?? 0);
    case 'SECTIONS':
      return firstSections(userId);
    // Подія поточного запиту (урок після перерви від 7 днів) — лише через adjust.
    case 'RETURN':
      return 0;
    default:
      return 0;
  }
}

async function resolveMetrics(metrics: Metric[], userId: string, p: Progress, adjust: Record<string, number>) {
  const unique = [...new Set(metrics)];
  const values = await Promise.all(unique.map((m) => resolveMetric(m, userId, p, adjust)));
  const out: Record<string, number> = {};
  unique.forEach((m, i) => (out[m] = values[i] + (adjust[m] ?? 0)));
  return out;
}

/** Значення метрик для галереї (лише для ще не отриманих досягнень). */
export async function achievementMetrics(userId: string, p: Progress, metrics: Metric[]) {
  return resolveMetrics(metrics, userId, p, {});
}

export type UnlockedAchievement = { slug: string; title: unknown; description: unknown; icon: string; zlotki: number };

/**
 * Нові досягнення та нагороди за них.
 * `p` — прогрес з урахуванням змін поточного запиту (null — прочитати з БД);
 * `adjust` — зміни лічильників, ще не записані в БД.
 */
export async function evaluateAchievements(userId: string, p: Progress | null, adjust: Record<string, number> = {}) {
  const [all, owned, progressRow] = await db.batch([
    db.select().from(achievements).where(eq(achievements.isActive, true)).orderBy(asc(achievements.order)),
    db.select({ achievementId: userAchievements.achievementId }).from(userAchievements).where(eq(userAchievements.userId, userId)),
    db.select().from(playerProgress).where(eq(playerProgress.userId, userId)),
  ]);
  const progress = p ?? progressRow[0];
  const have = new Set(owned.map((o) => o.achievementId));
  const pending = all.filter((a) => !have.has(a.id));
  const stmts: Stmt[] = [];
  const unlocked: UnlockedAchievement[] = [];
  if (!pending.length || !progress) return { unlocked, stmts };
  const metrics = await resolveMetrics(pending.map((a) => a.metric), userId, progress, adjust);
  for (const a of pending) {
    if ((metrics[a.metric] ?? 0) < a.threshold) continue;
    stmts.push(db.insert(userAchievements).values({ userId, achievementId: a.id }).onConflictDoNothing());
    stmts.push(...grantZlotki(userId, a.zlotkiReward, `achievement:${a.slug}`, `achievement:${userId}:${a.id}`).stmts);
    if (a.rewardItemId) stmts.push(grantItem(userId, a.rewardItemId, 'achievement'));
    unlocked.push({ slug: a.slug, title: a.title, description: a.description, icon: a.icon, zlotki: a.zlotkiReward });
  }
  return { unlocked, stmts };
}
