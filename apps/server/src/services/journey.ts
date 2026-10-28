/**
 * Подорож по карті: стан міст і уроків для користувача.
 * Правила відкриття:
 *  • перше місто відкрите з початку; наступне — після складання іспиту (боса) попереднього;
 *  • уроки в місті відкриваються послідовно (крім міст, відкритих вхідним тестом);
 *  • бос доступний після проходження `ticketLessons` звичайних уроків міста
 *    (або всіх уроків міста до розширення курсу — LEGACY_CITY_LESSONS).
 */
import type { Cefr } from '@polski-go/shared';
import { and, asc, eq, gte, isNotNull, lt } from 'drizzle-orm';
import { atomic, db } from '../db';
import { badRequest, notFound } from '../lib/errors';
import { getRewards } from './gameConfig';
import { grantXp, grantZlotki, loadCtx } from './rewards';
import { LEGACY_BEFORE_EXPANSION, LEGACY_CITY_LESSONS } from '../content/legacy';
import { cities, cityRoutes, lessons, playerProgress, userCities, userLessonProgress, xpEvents } from '../db/schema';

export type LessonState = 'locked' | 'available' | 'completed';

export type JourneyLesson = {
  id: string;
  slug: string;
  kind: string;
  title: unknown;
  topic: unknown;
  cefr: Cefr;
  difficulty: number;
  isPremium: boolean;
  order: number;
  routeId: string;
  exerciseCount: number;
  state: LessonState;
  stars: number;
  bestScore: number;
};

export type JourneyCity = {
  id: string;
  slug: string;
  order: number;
  namePl: string;
  name: unknown;
  theme: unknown;
  description: unknown;
  cefr: Cefr;
  mapX: number;
  mapY: number;
  emoji: string;
  color: string;
  hasContent: boolean;
  unlocked: boolean;
  completed: boolean;
  /** Іспит складено і всі уроки пройдено на 3 зірки. */
  perfect: boolean;
  unlockedAt: Date | null;
  bossAvailable: boolean;
  lessonsTotal: number;
  lessonsDone: number;
  progress: number;
  routes: { id: string; slug: string; title: unknown; description: unknown; icon: string; lessons: JourneyLesson[]; chest?: RouteChest | null }[];
};

export type RouteChest = { state: 'locked' | 'ready' | 'opened'; xp: number; zlotki: number };
const routeChestKey = (userId: string, routeId: string) => `route-chest:${userId}:${routeId}`;

/**
 * Відкрити скриню теми: лише коли пройдено всі уроки теми, рівно один раз (ключ ідемпотентності XP і Złotki —
 * паралельні запити нараховують одноразово).
 */
export async function openRouteChest(userId: string, routeId: string) {
  const journey = await getJourney(userId);
  const route = journey.cities.flatMap((c) => c.routes).find((r) => r.id === routeId);
  if (!route?.chest) throw notFound('route_not_found');
  if (route.chest.state === 'opened') throw badRequest('already_claimed');
  if (route.chest.state !== 'ready') throw badRequest('not_completed');
  const ctx = await loadCtx(userId);
  const key = routeChestKey(userId, routeId);
  const xp = grantXp(ctx, route.chest.xp, 'route-chest', key);
  const zl = grantZlotki(userId, route.chest.zlotki, 'route-chest', key, ctx.now);
  await atomic([...xp.stmts, ...zl.stmts]);
  return { xp: xp.granted, zlotki: zl.granted, levelUp: xp.levelAfter > xp.levelBefore ? xp.levelAfter : null };
}

/**
 * Запити карти — щоб додати їх у спільний пакет читань запиту (як у startSession).
 * Кількість вправ — колонка lessons.exercise_count (тригери, міграція 0005), без GROUP BY по exercises.
 */
export const journeyReads = (userId: string) =>
  [
    db.select().from(cities).where(eq(cities.status, 'PUBLISHED')).orderBy(asc(cities.order)),
    db.select().from(cityRoutes).where(eq(cityRoutes.status, 'PUBLISHED')).orderBy(asc(cityRoutes.order)),
    db.select().from(lessons).where(and(eq(lessons.status, 'PUBLISHED'), isNotNull(lessons.routeId))).orderBy(asc(lessons.order)),
    db.select().from(userCities).where(eq(userCities.userId, userId)),
    db.select().from(userLessonProgress).where(eq(userLessonProgress.userId, userId)),
    db.select().from(playerProgress).where(eq(playerProgress.userId, userId)),
  ] as const;
export type JourneyRows = readonly [
  (typeof cities.$inferSelect)[],
  (typeof cityRoutes.$inferSelect)[],
  (typeof lessons.$inferSelect)[],
  (typeof userCities.$inferSelect)[],
  (typeof userLessonProgress.$inferSelect)[],
  (typeof playerProgress.$inferSelect)[],
];

export async function getJourney(userId: string) {
  // Один пакет: карта і вже відкриті скрині тем (ключі `route-chest:<user>:…` — діапазоном по унікальному індексу ключа).
  const prefix = routeChestKey(userId, '');
  const [[chests, ...rows], cfg] = await Promise.all([
    db.batch([
      db.select({ key: xpEvents.idempotencyKey }).from(xpEvents).where(and(gte(xpEvents.idempotencyKey, prefix), lt(xpEvents.idempotencyKey, `${prefix}\uffff`))),
      ...journeyReads(userId),
    ]),
    getRewards(),
  ]);
  const { result, progress } = journeyFrom(rows);

  // Скрині тем: готова, коли пройдено всі звичайні уроки теми; відкрита — є подія XP з її ключем.
  const completedRoutes = result.flatMap((c) => c.routes).filter((r) => {
    const regular = r.lessons.filter((l) => l.kind === 'LESSON');
    return regular.length > 0 && regular.every((l) => l.state === 'completed');
  });
  const opened = new Set(chests.map((e) => e.key));
  const ready = new Set(completedRoutes.map((r) => r.id));
  for (const city of result) {
    for (const r of city.routes) {
      const hasLessons = r.lessons.some((l) => l.kind === 'LESSON');
      r.chest = hasLessons
        ? { state: !ready.has(r.id) ? 'locked' : opened.has(routeChestKey(userId, r.id)) ? 'opened' : 'ready', xp: cfg.routeChestXp, zlotki: cfg.routeChestZlotki }
        : null;
    }
  }

  let current = result.find((c) => c.id === progress[0]?.currentCityId) ?? result.find((c) => c.unlocked) ?? result[0];
  // Іспит міста складено, коли далі ще не було міст з уроками: наступне місто відкрилося як «скоро», а поточним лишилося
  // пройдене. Щойно в ньому з'являються уроки (новий контент або адмінка), ведемо учня туди — як зробив би сам іспит
  // (completeCity), навіть якщо в пройденому місті лишилися уроки для повторення. Seed переносить і сам рядок.
  if (current?.completed) {
    const from = current;
    current = result.find((c) => c.order > from.order && c.unlocked && c.hasContent && !c.completed) ?? from;
  }
  const next = current ? findNextLesson(current) : null;
  return { cities: result, currentCityId: current?.id ?? null, nextLesson: next };
}

/** Стан міст і уроків із рядків `journeyReads` (без скринь тем — для них потрібен ще один запит). */
export function journeyFrom([cityRows, routeRows, lessonRows, userCityRows, lessonProgress, progress]: JourneyRows) {
  const cityList = cityRows.map((city) => ({
    ...city,
    routes: routeRows
      .filter((r) => r.cityId === city.id)
      .map((r) => ({ ...r, lessons: lessonRows.filter((l) => l.routeId === r.id) })),
  }));
  const userCitiesList = userCityRows;

  const uc = new Map(userCitiesList.map((c) => [c.cityId, c]));
  const lp = new Map(lessonProgress.map((l) => [l.lessonId, l]));

  const result: JourneyCity[] = cityList.map((city) => {
    const visit = uc.get(city.id);
    const unlocked = !!visit;
    const openAll = visit?.source === 'placement';
    const all = city.routes.flatMap((r) => r.lessons.map((l) => ({ ...l, routeId: r.id })));
    const regular = all.filter((l) => l.kind === 'LESSON');
    const regularDone = regular.filter((l) => lp.get(l.id)?.firstCompletedAt).length;
    const ticket = city.ticketLessons > 0 ? Math.min(city.ticketLessons, regular.length) : regular.length;
    // Хто пройшов усі уроки міста до розширення курсу (будь-якого зі знімків), не втрачає доступ до іспиту.
    // Для LEGACY_BEFORE_EXPANSION «до розширення» — раніше, ніж з'явився перший урок поза знімком (created_at);
    // хто проходить старі уроки після розширення, проходить і нові. Решта міст — старі уроки в будь-який час (правило 3.x).
    const before = LEGACY_BEFORE_EXPANSION.has(city.slug);
    // Уроки знімка, що пішли в архів за стандартом міста (city-standard.ts), не рахуються: учень проходив їх, але на карті
    // їх більше немає. Порожній знімок нічого не відкриває.
    const legacyDone = (LEGACY_CITY_LESSONS[city.slug] ?? []).map((s) => s.filter((slug) => all.some((l) => l.slug === slug))).some((snapshot) => {
      if (!snapshot.length) return false;
      const added = before ? regular.filter((l) => !snapshot.includes(l.slug)).map((l) => l.createdAt.getTime()) : [];
      const expandedAt = added.length ? Math.min(...added) : Infinity;
      return snapshot.every((slug) => {
        const l = all.find((x) => x.slug === slug);
        const at = l && lp.get(l.id)?.firstCompletedAt;
        return !!at && at.getTime() <= expandedAt;
      });
    });
    const bossAvailable = unlocked && (regularDone >= ticket || legacyDone);

    let prevDone = true;
    const states = new Map<string, LessonState>();
    for (const l of all) {
      const done = !!lp.get(l.id)?.firstCompletedAt;
      let state: LessonState;
      if (done) state = 'completed';
      else if (!unlocked) state = 'locked';
      else if (l.kind === 'BOSS') state = bossAvailable ? 'available' : 'locked';
      else state = prevDone || openAll ? 'available' : 'locked';
      states.set(l.id, state);
      if (l.kind === 'LESSON') prevDone = done;
    }

    const done = all.filter((l) => states.get(l.id) === 'completed').length;
    return {
      id: city.id,
      slug: city.slug,
      order: city.order,
      namePl: city.namePl,
      name: city.name,
      theme: city.theme,
      description: city.description,
      cefr: city.cefr,
      mapX: city.mapX,
      mapY: city.mapY,
      emoji: city.emoji,
      color: city.color,
      hasContent: all.length > 0,
      unlocked,
      completed: !!visit?.bossPassedAt,
      perfect: !!visit?.bossPassedAt && all.length > 0 && all.every((l) => (lp.get(l.id)?.stars ?? 0) >= 3),
      unlockedAt: visit?.unlockedAt ?? null,
      bossAvailable,
      lessonsTotal: all.length,
      lessonsDone: done,
      progress: all.length ? Math.round((done / all.length) * 100) : 0,
      routes: city.routes.map((r) => ({
        id: r.id,
        slug: r.slug,
        title: r.title,
        description: r.description,
        icon: r.icon,
        lessons: r.lessons.map((l) => ({
          id: l.id,
          slug: l.slug,
          kind: l.kind,
          title: l.title,
          topic: l.topic,
          cefr: l.cefr,
          difficulty: l.difficulty,
          isPremium: l.isPremium,
          order: l.order,
          routeId: r.id,
          exerciseCount: l.exerciseCount,
          state: states.get(l.id)!,
          stars: lp.get(l.id)?.stars ?? 0,
          bestScore: lp.get(l.id)?.bestScore ?? 0,
        })),
      })),
    };
  });

  return { result, progress };
}

export function findNextLesson(city: JourneyCity): JourneyLesson | null {
  for (const r of city.routes) for (const l of r.lessons) if (l.state === 'available') return l;
  return null;
}

/** Чи може користувач почати урок (доступний або вже пройдений — для повторення). */
export async function lessonAccess(userId: string, lessonId: string): Promise<LessonState | 'exam' | 'not_found'> {
  const lesson = await db.query.lessons.findFirst({ where: eq(lessons.id, lessonId), columns: { kind: true, status: true } });
  if (!lesson || lesson.status !== 'PUBLISHED') return 'not_found';
  if (lesson.kind === 'EXAM' || lesson.kind === 'PLACEMENT') return 'exam';
  return lessonStateIn(journeyFrom(await db.batch(journeyReads(userId))).result, lessonId);
}

/** Стан уроку на карті (`journeyFrom`); урока немає на карті — 'not_found'. */
export function lessonStateIn(result: JourneyCity[], lessonId: string): LessonState | 'not_found' {
  for (const c of result) for (const r of c.routes) for (const l of r.lessons) if (l.id === lessonId) return l.state;
  return 'not_found';
}
