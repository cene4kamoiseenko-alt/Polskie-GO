import { CEFR_LEVELS, type Cefr } from './types';
import { addDays, dayDiff, dayKey } from './dates';

/** Стартовий баланс нагород. Значення можна змінити в адмін-панелі (game_config). */
export const DEFAULT_REWARDS = {
  exerciseXp: 5,
  lessonXp: 20,
  perfectBonusXp: 10,
  dailyQuestXp: 30,
  weeklyQuestXp: 100,
  storyQuestXp: 50,
  cityExamXp: 100,
  lessonZlotki: 5,
  perfectZlotki: 5,
  dailyQuestZlotki: 10,
  storyQuestZlotki: 30,
  cityExamZlotki: 50,
  /** Скриня теми міста: відкривається один раз, коли пройдено всі уроки теми. */
  routeChestXp: 30,
  routeChestZlotki: 15,
  /** Частка XP за повторне проходження вже пройденого уроку. */
  replayFactor: 0.25,
  /** Скільки повторних проходжень одного уроку на день дають XP. */
  maxRewardedReplaysPerDay: 2,
  /** Ліміт XP за повторення/тренування на день (захист від накрутки). */
  practiceXpDailyCap: 300,
  freeAiMessagesPerDay: 10,
  premiumAiMessagesPerDay: 150,
};
export type RewardConfig = typeof DEFAULT_REWARDS;

/** XP, потрібний для переходу з рівня `level` на наступний. */
export function xpToNext(level: number): number {
  return 100 + (level - 1) * 25;
}

/** Загальний XP, потрібний для досягнення рівня `level`. */
export function xpForLevel(level: number): number {
  let total = 0;
  for (let l = 1; l < level; l++) total += xpToNext(l);
  return total;
}

export function levelFromXp(xp: number): { level: number; current: number; needed: number } {
  let level = 1;
  let rest = Math.max(0, Math.floor(xp));
  while (rest >= xpToNext(level)) {
    rest -= xpToNext(level);
    level++;
  }
  return { level, current: rest, needed: xpToNext(level) };
}

/** Оновлення серії днів навчання. */
/**
 * Щит серії (Premium): один пропущений день не скидає серію, якщо щит не використовувався останні
 * `STREAK_SHIELD_DAYS` днів. Пропущений день не додається до серії — серія рахує дні, коли учень займався.
 */
export const STREAK_SHIELD_DAYS = 7;

/** Щит можна використати для пропущеного дня `missedDay`: раніше не використовувався або минув тиждень. */
export function shieldReady(shieldDay: string | null | undefined, missedDay: string): boolean {
  return !shieldDay || dayDiff(shieldDay, missedDay) >= STREAK_SHIELD_DAYS;
}

export function updateStreak(
  prev: { current: number; best: number; lastDay: string | null; shieldDay?: string | null },
  today: string,
  opts: { shield?: boolean } = {},
): { current: number; best: number; lastDay: string; changed: boolean; shieldUsed: string | null } {
  if (prev.lastDay === today) return { current: prev.current, best: prev.best, lastDay: today, changed: false, shieldUsed: null };
  const diff = prev.lastDay ? dayDiff(prev.lastDay, today) : Infinity;
  // «Сьогодні» раніше за останній день активності: користувач змінив пояс на захід (Токіо → Нью-Йорк). Серію не скидаємо.
  if (diff < 0) return { current: prev.current, best: prev.best, lastDay: prev.lastDay!, changed: false, shieldUsed: null };
  // Пропущено рівно один день (учора), серія була, і є щит Premium — серія триває, день щита запам'ятовуємо.
  const missed = addDays(today, -1);
  const shielded = diff === 2 && !!opts.shield && prev.current > 0 && shieldReady(prev.shieldDay, missed);
  const current = diff === 1 || shielded ? prev.current + 1 : 1;
  return { current, best: Math.max(prev.best, current), lastDay: today, changed: true, shieldUsed: shielded ? missed : null };
}

/**
 * Останній день активності після зміни часового пояса. «Сьогодні» в новому поясі може бути на день раніше чи пізніше,
 * ніж у старому (переліт Варшава → Нью-Йорк чи Токіо): зсуваємо останній день на ту саму різницю,
 * щоб «займався сьогодні / вчора» залишилося правдою і серія не згоріла через саму зміну пояса.
 */
export function shiftLastDayForZone(lastDay: string | null, now: Date, fromTz: string, toTz: string): string | null {
  if (!lastDay || fromTz === toTz) return lastDay;
  const delta = dayDiff(dayKey(now, fromTz), dayKey(now, toTz));
  return delta ? addDays(lastDay, delta) : lastDay;
}

/** Фактична серія на сьогодні (якщо вчора не займався — серія згоріла). */
/**
 * Серія, яку бачить учень сьогодні: заняття сьогодні або вчора — серія жива. З щитом Premium (`shield`) вона жива й після
 * одного пропущеного дня — до кінця сьогоднішнього: позайматися сьогодні, і щит її збереже (updateStreak).
 */
export function effectiveStreak(current: number, lastDay: string | null, today: string, shield?: { premium: boolean; shieldDay: string | null }): number {
  if (!lastDay) return 0;
  const diff = dayDiff(lastDay, today);
  if (diff <= 1) return current;
  return diff === 2 && shield?.premium && shieldReady(shield.shieldDay, addDays(today, -1)) ? current : 0;
}

export function cefrIndex(c: Cefr): number {
  return CEFR_LEVELS.indexOf(c);
}

export function maxCefr(a: Cefr, b: Cefr): Cefr {
  return cefrIndex(a) >= cefrIndex(b) ? a : b;
}

/** Мінімальний результат іспиту для підтвердження рівня. */
export const EXAM_PASS_RATIO = 0.7;
/** Мінімальна частка правильних відповідей, щоб урок вважався пройденим. */
export const LESSON_PASS_RATIO = 0.5;
/** Мінімальний результат фінального іспиту міста (бос). */
export const BOSS_PASS_RATIO = 0.7;
/** Фінальна місія локації міста (slug закінчується на `-misja`): поріг як у боса, нагорода як за урок. */
export const isMissionSlug = (slug: string | null | undefined) => !!slug && slug.endsWith('-misja');

/** Розрахунок нагороди за завершення уроку. Чиста функція — легко тестувати. */
export function lessonReward(input: {
  cfg: RewardConfig;
  correct: number;
  total: number;
  firstCompletion: boolean;
  replaysToday: number;
  isBoss?: boolean;
  passed: boolean;
}): { xp: number; zlotki: number; perfect: boolean } {
  const { cfg, correct, total, firstCompletion, replaysToday, isBoss, passed } = input;
  const perfect = total > 0 && correct === total;
  // Непройдений урок не дає нагород (інакше можна фармити XP), але помилки йдуть у повторення.
  if (!passed) return { xp: 0, zlotki: 0, perfect: false };
  let xp = correct * cfg.exerciseXp + (isBoss ? cfg.cityExamXp : cfg.lessonXp) + (perfect ? cfg.perfectBonusXp : 0);
  let zlotki = (isBoss ? cfg.cityExamZlotki : cfg.lessonZlotki) + (perfect ? cfg.perfectZlotki : 0);
  if (!firstCompletion) {
    if (replaysToday >= cfg.maxRewardedReplaysPerDay) return { xp: 0, zlotki: 0, perfect };
    xp = Math.round(xp * cfg.replayFactor);
    zlotki = 0;
  }
  return { xp, zlotki, perfect };
}
