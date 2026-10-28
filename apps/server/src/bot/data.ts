/**
 * Данные пользователя для карточек бота. Только чтение реальных значений из базы:
 * нет записи — нет и строки в тексте (ни «0 XP», ни выдуманных наград, ни несуществующих заданий).
 */
import { and, asc, eq } from 'drizzle-orm';
import { dayKey, effectiveStreak, isUiLang, levelFromXp, tr, uiLangFor, type UiLang } from '@polski-go/shared';
import { db } from '../db';
import { playerProgress, quests, userQuests, userSettings, users } from '../db/schema';
import { getJourney } from '../services/journey';
import type { LessonRef, ProfileRef, QuestRef } from './copy';

export type BotUser = {
  id: string;
  firstName: string;
  onboarded: boolean;
  banned: boolean;
  /** Язык интерфейса из настроек (null — настроек нет). */
  lang: UiLang | null;
  timezone: string;
};

/** Язык ответа: сохранённая настройка, иначе по языку Telegram (uiLangFor: польский и неизвестные → украинский, белорусский → русский). */
export function pickLang(saved: string | null | undefined, telegramCode: string | null | undefined): UiLang {
  return isUiLang(saved) ? saved : uiLangFor(telegramCode);
}

export async function findBotUser(telegramId: number): Promise<BotUser | null> {
  const row = await db
    .select({ id: users.id, firstName: users.firstName, onboardedAt: users.onboardedAt, banned: users.isBanned, lang: userSettings.uiLanguage, tz: userSettings.timezone })
    .from(users)
    .leftJoin(userSettings, eq(userSettings.userId, users.id))
    .where(eq(users.telegramId, telegramId))
    .get();
  if (!row) return null;
  return { id: row.id, firstName: row.firstName, onboarded: !!row.onboardedAt, banned: !!row.banned, lang: isUiLang(row.lang) ? row.lang : null, timezone: row.tz ?? 'Europe/Warsaw' };
}

/** Следующий доступный урок пользователя: название и город из маршрута (как на главной экране «Уроки»). */
export async function nextLessonOf(userId: string, lang: UiLang): Promise<LessonRef | null> {
  const journey = await getJourney(userId);
  const lesson = journey.nextLesson;
  if (!lesson) return null;
  const city = journey.cities.find((c) => c.routes.some((r) => r.lessons.some((l) => l.id === lesson.id)));
  const title = tr(lesson.title as never, lang).trim();
  const cityName = city ? tr(city.name as never, lang).trim() : '';
  return title && cityName ? { title, city: cityName } : null;
}

/** Прогресс; null, если записи нет или уроков и XP ещё нет (тогда «0» за прогресс не выдаём). */
export async function profileOf(userId: string, timezone: string, now = new Date()): Promise<ProfileRef | null> {
  const p = await db.select().from(playerProgress).where(eq(playerProgress.userId, userId)).get();
  if (!p || (p.lessonsCompleted <= 0 && p.xpTotal <= 0)) return null;
  return {
    level: levelFromXp(p.xpTotal).level,
    xp: p.xpTotal,
    streak: effectiveStreak(p.streakCurrent, p.lastActiveDay, dayKey(now, timezone)),
    lessons: p.lessonsCompleted,
  };
}

/** Активные ежедневные задания, уже назначенные на сегодня. Ничего не создаёт: новые задания назначает приложение. */
export async function activeQuestsOf(userId: string, timezone: string, lang: UiLang, now = new Date(), limit = 3): Promise<QuestRef[]> {
  const rows = await db
    .select({ uq: userQuests, quest: quests })
    .from(userQuests)
    .innerJoin(quests, eq(quests.id, userQuests.questId))
    .where(and(eq(userQuests.userId, userId), eq(userQuests.periodKey, dayKey(now, timezone)), eq(quests.kind, 'DAILY'), eq(userQuests.status, 'ACTIVE')))
    .orderBy(asc(userQuests.createdAt), asc(quests.order))
    .limit(limit);
  return rows.map(({ uq, quest }) => ({ title: tr(quest.title, lang).trim(), progress: uq.progress, target: quest.target, xp: quest.xpReward })).filter((q) => q.title);
}

/** /stop: выключает только учебные напоминания существующего пользователя. Прогресс и платежи не затрагиваются. */
export async function disableReminders(userId: string): Promise<void> {
  await db.update(userSettings).set({ notificationsEnabled: false }).where(eq(userSettings.userId, userId));
}
