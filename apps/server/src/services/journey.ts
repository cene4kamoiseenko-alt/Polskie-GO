/**
 * Подорож по карті: стан міст і уроків для користувача.
 * Правила відкриття:
 *  • перше місто відкрите з початку; наступне — після складання іспиту (боса) попереднього;
 *  • уроки в місті відкриваються послідовно (крім міст, відкритих вхідним тестом);
 *  • бос доступний після проходження `ticketLessons` звичайних уроків міста.
 */
import type { Cefr } from '@polski-go/shared';
import type { Tx } from '../db';
import { prisma } from '../db';

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
  unlockedAt: Date | null;
  bossAvailable: boolean;
  lessonsTotal: number;
  lessonsDone: number;
  progress: number;
  routes: { id: string; slug: string; title: unknown; description: unknown; icon: string; lessons: JourneyLesson[] }[];
};

export async function getJourney(userId: string, db: Tx = prisma) {
  const [cities, userCities, lessonProgress, progress] = await Promise.all([
    db.city.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { order: 'asc' },
      include: {
        routes: {
          where: { status: 'PUBLISHED' },
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              where: { status: 'PUBLISHED' },
              orderBy: { order: 'asc' },
              include: { _count: { select: { exercises: true } } },
            },
          },
        },
      },
    }),
    db.userCity.findMany({ where: { userId } }),
    db.userLessonProgress.findMany({ where: { userId } }),
    db.playerProgress.findUnique({ where: { userId } }),
  ]);

  const uc = new Map(userCities.map((c) => [c.cityId, c]));
  const lp = new Map(lessonProgress.map((l) => [l.lessonId, l]));

  const result: JourneyCity[] = cities.map((city) => {
    const visit = uc.get(city.id);
    const unlocked = !!visit;
    const openAll = visit?.source === 'placement';
    const all = city.routes.flatMap((r) => r.lessons.map((l) => ({ ...l, routeId: r.id })));
    const regular = all.filter((l) => l.kind === 'LESSON');
    const regularDone = regular.filter((l) => lp.get(l.id)?.firstCompletedAt).length;
    const ticket = city.ticketLessons > 0 ? Math.min(city.ticketLessons, regular.length) : regular.length;
    const bossAvailable = unlocked && regularDone >= ticket;

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
          exerciseCount: l._count.exercises,
          state: states.get(l.id)!,
          stars: lp.get(l.id)?.stars ?? 0,
          bestScore: lp.get(l.id)?.bestScore ?? 0,
        })),
      })),
    };
  });

  const current = result.find((c) => c.id === progress?.currentCityId) ?? result.find((c) => c.unlocked) ?? result[0];
  const next = current ? findNextLesson(current) : null;
  return { cities: result, currentCityId: current?.id ?? null, nextLesson: next };
}

export function findNextLesson(city: JourneyCity): JourneyLesson | null {
  for (const r of city.routes) for (const l of r.lessons) if (l.state === 'available') return l;
  return null;
}

/** Чи може користувач почати урок (доступний або вже пройдений — для повторення). */
export async function lessonAccess(userId: string, lessonId: string, db: Tx = prisma): Promise<LessonState | 'exam' | 'not_found'> {
  const lesson = await db.lesson.findUnique({ where: { id: lessonId }, select: { kind: true, status: true } });
  if (!lesson || lesson.status !== 'PUBLISHED') return 'not_found';
  if (lesson.kind === 'EXAM' || lesson.kind === 'PLACEMENT') return 'exam';
  const j = await getJourney(userId, db);
  for (const c of j.cities) for (const r of c.routes) for (const l of r.lessons) if (l.id === lessonId) return l.state;
  return 'not_found';
}
