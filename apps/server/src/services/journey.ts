/**
 * Подорож по карті: стан міст і уроків для користувача.
 * Правила відкриття:
 *  • перше місто відкрите з початку; наступне — після складання іспиту (боса) попереднього;
 *  • уроки в місті відкриваються послідовно (крім міст, відкритих вхідним тестом);
 *  • бос доступний після проходження `ticketLessons` звичайних уроків міста
 *    (або всіх уроків міста до розширення курсу — LEGACY_CITY_LESSONS).
 */
import type { Cefr } from '@polski-go/shared';
import { and, asc, eq, isNotNull } from 'drizzle-orm';
import { db } from '../db';
import { LEGACY_CITY_LESSONS } from '../content/legacy';
import { cities, cityRoutes, lessons, playerProgress, userCities, userLessonProgress } from '../db/schema';

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
  routes: { id: string; slug: string; title: unknown; description: unknown; icon: string; lessons: JourneyLesson[] }[];
};

export async function getJourney(userId: string) {
  // Кількість вправ — колонка lessons.exercise_count (тригери, міграція 0005), без GROUP BY по exercises.
  const [cityRows, routeRows, lessonRows, userCityRows, lessonProgress, progress] = await db.batch([
    db.select().from(cities).where(eq(cities.status, 'PUBLISHED')).orderBy(asc(cities.order)),
    db.select().from(cityRoutes).where(eq(cityRoutes.status, 'PUBLISHED')).orderBy(asc(cityRoutes.order)),
    db.select().from(lessons).where(and(eq(lessons.status, 'PUBLISHED'), isNotNull(lessons.routeId))).orderBy(asc(lessons.order)),
    db.select().from(userCities).where(eq(userCities.userId, userId)),
    db.select().from(userLessonProgress).where(eq(userLessonProgress.userId, userId)),
    db.select().from(playerProgress).where(eq(playerProgress.userId, userId)),
  ]);
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
    // Хто пройшов усі уроки міста до розширення курсу, не втрачає доступ до іспиту.
    const legacy = LEGACY_CITY_LESSONS[city.slug];
    const legacyDone = !!legacy && legacy.every((slug) => { const l = all.find((x) => x.slug === slug); return !!l && !!lp.get(l.id)?.firstCompletedAt; });
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

  const current = result.find((c) => c.id === progress[0]?.currentCityId) ?? result.find((c) => c.unlocked) ?? result[0];
  const next = current ? findNextLesson(current) : null;
  return { cities: result, currentCityId: current?.id ?? null, nextLesson: next };
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
  const j = await getJourney(userId);
  for (const c of j.cities) for (const r of c.routes) for (const l of r.lessons) if (l.id === lessonId) return l.state;
  return 'not_found';
}
