import { afterAll, describe, expect, it } from 'vitest';
import { and, eq, inArray } from 'drizzle-orm';
import { db } from '../src/db';
import { cities, lessons, userCities, userLessonProgress } from '../src/db/schema';
import { resetRateLimits } from '../src/hono';
import { disposeEnv, login, playSession } from './helpers';

afterAll(disposeEnv);

type Lesson = { id: string; slug: string; kind: string; state: string };
type City = { slug: string; bossAvailable: boolean; completed: boolean; routes: { slug: string; lessons: Lesson[] }[] };
type Call = Awaited<ReturnType<typeof login>>['call'];

const WAW = ['waw-1-czesc', 'waw-2-uprzejmosc', 'waw-3-imie', 'waw-4-skad', 'waw-5-liczby', 'waw-6-wiek'];
const KRK = ['krk-1-rodzina', 'krk-2-mam', 'krk-3-dom', 'krk-4-tydzien', 'krk-5-byc'];
const LODZ_OLD = ['lodz-1-alfabet', 'lodz-2-dwuznaki', 'lodz-3-zawody', 'lodz-4-oni-one'];
const LODZ_NEW = ['lodz-5-gdzie-pracujesz', 'lodz-6-szukam-pracy', 'lodz-7-rozmowa', 'lodz-8-pierwszy-dzien'];
const LODZ_9_16 = ['lodz-9-ktora-godzina', 'lodz-10-poranek', 'lodz-11-grafik', 'lodz-12-urlop', 'lodz-13-boli-mnie', 'lodz-14-przychodnia', 'lodz-15-apteka', 'lodz-16-plany'];

async function openCity(userId: string, slug: string) {
  const city = (await db.query.cities.findFirst({ where: eq(cities.slug, slug) }))!;
  await db.insert(userCities).values({ userId, cityId: city.id, source: 'journey' }).onConflictDoNothing();
  return city;
}

/** Прогрес «з минулого»: уроки пройдені в заданий момент (як у користувачів до оновлення). */
async function completedAt(userId: string, slugs: string[], at: Date) {
  const rows = await db.select({ id: lessons.id }).from(lessons).where(inArray(lessons.slug, slugs));
  expect(rows).toHaveLength(slugs.length);
  await db.insert(userLessonProgress).values(rows.map((r) => ({ userId, lessonId: r.id, completions: 1, bestScore: 100, stars: 3, firstCompletedAt: at, lastCompletedAt: at })));
}

async function cityOf(call: Call, slug: string) {
  return ((await call('GET', '/api/journey')).body.cities as City[]).find((c) => c.slug === slug)!;
}

const bossOf = (city: City) => city.routes.flatMap((r) => r.lessons).find((l) => l.kind === 'BOSS')!;

/** Момент розширення міста — created_at першого нового уроку. */
async function expandedAt(slugs: string[]) {
  const rows = await db.select({ createdAt: lessons.createdAt }).from(lessons).where(inArray(lessons.slug, slugs));
  return new Date(Math.min(...rows.map((r) => r.createdAt.getTime())));
}

describe('Доступ до іспиту за старими уроками (legacy)', () => {
  it('Варшава: шість старих уроків, пройдені вже після розширення, відкривають іспит (правило 3.x)', async () => {
    const { call, user } = await login();
    await openCity(user.id, 'warszawa');
    await completedAt(user.id, WAW, new Date());
    const city = await cityOf(call, 'warszawa');
    expect(city.bossAvailable).toBe(true);
    expect(bossOf(city).state).toBe('available');
    resetRateLimits();
    expect((await call('POST', '/api/sessions', { lessonId: bossOf(city).id })).status).toBe(200);
  });

  it('Краків: п’ять старих уроків, пройдені після розширення, відкривають іспит', async () => {
    const { call, user } = await login();
    await openCity(user.id, 'krakow');
    await completedAt(user.id, KRK, new Date());
    const city = await cityOf(call, 'krakow');
    expect(city.bossAvailable).toBe(true);
    expect(bossOf(city).state).toBe('available');
  });

  it('частковий прогрес: п’ять із шести старих уроків Варшави — іспит закритий, наступний урок відкритий', async () => {
    const { call, user } = await login();
    await openCity(user.id, 'warszawa');
    await completedAt(user.id, WAW.slice(0, 5), new Date());
    const city = await cityOf(call, 'warszawa');
    expect(city.bossAvailable).toBe(false);
    expect(bossOf(city).state).toBe('locked');
    const sixth = city.routes.flatMap((r) => r.lessons).find((l) => l.slug === WAW[5])!;
    expect(sixth.state).toBe('available');
    resetRateLimits();
    expect((await call('POST', '/api/sessions', { lessonId: bossOf(city).id })).status).toBe(403);
  });

  it('Лодзь: старі уроки до розширення відкривають іспит, після розширення — ні', async () => {
    const at = await expandedAt(LODZ_NEW);
    const before = await login();
    await openCity(before.user.id, 'lodz');
    await completedAt(before.user.id, LODZ_OLD, new Date(at.getTime() - 86_400_000));
    expect((await cityOf(before.call, 'lodz')).bossAvailable).toBe(true);

    const after = await login();
    await openCity(after.user.id, 'lodz');
    await completedAt(after.user.id, LODZ_OLD, new Date(at.getTime() + 60_000));
    const city = await cityOf(after.call, 'lodz');
    expect(city.bossAvailable).toBe(false);
    expect(city.routes.flatMap((r) => r.lessons).find((l) => l.slug === LODZ_NEW[0])!.state).toBe('available');
  });

  it('Лодзь, друге розширення: уроки 1–8 до появи 9–16 відкривають іспит, після — ні; дев\'ятий урок відкритий', async () => {
    const at = await expandedAt(LODZ_9_16);
    const before = await login();
    await openCity(before.user.id, 'lodz');
    await completedAt(before.user.id, [...LODZ_OLD, ...LODZ_NEW], new Date(at.getTime() - 86_400_000));
    const opened = await cityOf(before.call, 'lodz');
    expect(opened.bossAvailable).toBe(true);
    expect(bossOf(opened).state).toBe('available');
    const lessonsOf = (c: City) => c.routes.flatMap((r) => r.lessons);
    expect(lessonsOf(opened).find((l) => l.slug === LODZ_9_16[0])!.state).toBe('available');
    expect(lessonsOf(opened).find((l) => l.slug === LODZ_9_16[1])!.state).toBe('locked');
    resetRateLimits();
    expect((await before.call('POST', '/api/sessions', { lessonId: bossOf(opened).id })).status).toBe(200);

    const after = await login();
    await openCity(after.user.id, 'lodz');
    await completedAt(after.user.id, [...LODZ_OLD, ...LODZ_NEW], new Date(at.getTime() + 60_000));
    const city = await cityOf(after.call, 'lodz');
    expect(city.bossAvailable).toBe(false);
    expect(lessonsOf(city).find((l) => l.slug === LODZ_9_16[0])!.state).toBe('available');
  });

  it('повторне проходження старого уроку не забирає доступ і не зсуває дату першого проходження', async () => {
    const at = await expandedAt(LODZ_NEW);
    const { call, user } = await login();
    await openCity(user.id, 'lodz');
    const past = new Date(at.getTime() - 86_400_000);
    await completedAt(user.id, LODZ_OLD, past);

    const first = (await cityOf(call, 'lodz')).routes.flatMap((r) => r.lessons).find((l) => l.slug === LODZ_OLD[0])!;
    resetRateLimits();
    const s = await call('POST', '/api/sessions', { lessonId: first.id });
    expect(s.status).toBe(200);
    expect((await playSession(call, s.body.sessionId)).status).toBe(200);

    const row = await db.query.userLessonProgress.findFirst({ where: and(eq(userLessonProgress.userId, user.id), eq(userLessonProgress.lessonId, first.id)) });
    expect(row!.firstCompletedAt!.getTime()).toBe(past.getTime());
    expect(row!.completions).toBe(2);
    expect((await cityOf(call, 'lodz')).bossAvailable).toBe(true);
  });

  it('розпочатий іспит завершується, а складений іспит лишається складеним', async () => {
    const { call, user } = await login();
    await openCity(user.id, 'warszawa');
    await completedAt(user.id, WAW, new Date());
    const boss = bossOf(await cityOf(call, 'warszawa'));
    resetRateLimits();
    const s = await call('POST', '/api/sessions', { lessonId: boss.id });
    expect(s.status).toBe(200);
    const fin = await playSession(call, s.body.sessionId);
    expect(fin.status).toBe(200);
    expect(fin.body.passed).toBe(true);

    const city = await cityOf(call, 'warszawa');
    expect(city.completed).toBe(true);
    expect(bossOf(city).state).toBe('completed');
  });
});
