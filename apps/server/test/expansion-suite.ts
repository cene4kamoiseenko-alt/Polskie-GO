import { describe, expect, it } from 'vitest';
import { and, eq, inArray } from 'drizzle-orm';
import { db } from '../src/db';
import { cities, cosmeticItems, lessons, userCities, userInventory } from '../src/db/schema';
import { resetRateLimits } from '../src/hono';
import { login, playSession } from './helpers';

type Lesson = { id: string; slug: string; kind: string; state: string };
type City = { slug: string; bossAvailable: boolean; routes: { slug: string; lessons: Lesson[] }[] };

export type ExpansionConfig = {
  label: string;
  city: string;
  /** Обычные уроки до расширения, в порядке прохождения. */
  old: string[];
  /** Все маршруты города после расширения, экзамен последним. */
  routes: string[];
  /** Сколько обычных уроков в городе после расширения. */
  total: number;
  boss: string;
  /** Первый и второй новые уроки: после четвёртого старого первый открыт, второй закрыт. */
  nextNew: [string, string];
  /** Предметы за экзамен города (CITY_REWARDS); пусто, если у города наград нет. */
  rewards?: string[];
  /** Тайм-аут сценария «все уроки подряд». */
  fullPassMs?: number;
};

/**
 * Проверки расширения города (по образцу Лодзи): порядок маршрутов, прохождение всех уроков через API по очереди, экзамен только после
 * последнего, доступ к экзамену у тех, кто прошёл старые уроки до расширения, и повторный экзамен без второй награды.
 */
export function expansionSuite(cfg: ExpansionConfig) {
  const rewards = [...(cfg.rewards ?? [])].sort();

  async function openCity(userId: string) {
    const city = (await db.query.cities.findFirst({ where: eq(cities.slug, cfg.city) }))!;
    await db.insert(userCities).values({ userId, cityId: city.id, source: 'journey' });
  }
  const journey = (call: Awaited<ReturnType<typeof login>>['call']) => async () =>
    ((await call('GET', '/api/journey')).body.cities as City[]).find((c) => c.slug === cfg.city)!;
  const flat = (c: City) => c.routes.flatMap((r) => r.lessons);

  /** Пройти по очереди указанные уроки. */
  async function pass(call: Awaited<ReturnType<typeof login>>['call'], get: () => Promise<City>, slugs: string[]) {
    for (const slug of slugs) {
      const l = flat(await get()).find((x) => x.slug === slug)!;
      resetRateLimits();
      const s = await call('POST', '/api/sessions', { lessonId: l.id });
      expect((await playSession(call, s.body.sessionId)).status, slug).toBe(200);
    }
  }

  /** Расширение вышло после того, как учёник прошёл старые уроки: сдвигаем created_at новых уроков в будущее. */
  async function expandedAfterProgress(added: string[], run: () => Promise<void>) {
    const seeded = (await db.select({ createdAt: lessons.createdAt }).from(lessons).where(eq(lessons.slug, added[0])))[0].createdAt;
    await db.update(lessons).set({ createdAt: new Date(Date.now() + 60_000) }).where(inArray(lessons.slug, added));
    try {
      await run();
    } finally {
      await db.update(lessons).set({ createdAt: seeded }).where(inArray(lessons.slug, added));
    }
  }

  describe(`${cfg.label}: расширение курса`, () => {
    it('маршруты и порядок: старые, новые, экзамен последним; старые уроки на месте', async () => {
      const { call, user } = await login();
      await openCity(user.id);
      const city = await journey(call)();
      expect(city.routes.map((r) => r.slug)).toEqual(cfg.routes);
      const regular = flat(city).filter((l) => l.kind === 'LESSON');
      expect(regular).toHaveLength(cfg.total);
      expect(regular.slice(0, cfg.old.length).map((l) => l.slug)).toEqual(cfg.old);
      expect(city.routes.at(-1)!.lessons.map((l) => l.slug)).toEqual([cfg.boss]);
    });

    it('уроки открываются по очереди и проходятся через API; экзамен — только после последнего', async () => {
      const { call, user } = await login();
      await openCity(user.id);
      const get = journey(call);
      const regular = flat(await get()).filter((l) => l.kind === 'LESSON');
      for (const [i, l] of regular.entries()) {
        expect(flat(await get()).find((x) => x.id === l.id)!.state, l.slug).toBe('available');
        // Следующий урок ещё закрыт, экзамен закрыт до конца.
        if (i + 1 < regular.length) expect((await call('POST', '/api/sessions', { lessonId: regular[i + 1].id })).status, regular[i + 1].slug).toBe(403);
        expect((await get()).bossAvailable, l.slug).toBe(false);
        resetRateLimits();
        const s = await call('POST', '/api/sessions', { lessonId: l.id });
        expect(s.status, l.slug).toBe(200);
        const fin = await playSession(call, s.body.sessionId);
        expect(fin.status, l.slug).toBe(200);
        expect(fin.body.passed, l.slug).toBe(true);
      }
      const city = await get();
      expect(city.bossAvailable).toBe(true);
      expect(flat(city).find((l) => l.kind === 'BOSS')!.state).toBe('available');
    }, cfg.fullPassMs ?? 300_000);

    it('старые уроки открывают экзамен тем, кто прошёл их до расширения; новые уроки остаются открытыми', async () => {
      const { call, user } = await login();
      await openCity(user.id);
      const get = journey(call);
      await pass(call, get, cfg.old);
      // Новые уроки засеяны раньше, чем пользователь прошёл старые, — он новый ученик и проходит весь город.
      expect((await get()).bossAvailable).toBe(false);
      const added = flat(await get()).filter((l) => l.kind === 'LESSON' && !cfg.old.includes(l.slug)).map((l) => l.slug);
      expect(added).toHaveLength(cfg.total - cfg.old.length);
      await expandedAfterProgress(added, async () => {
        const city = await get();
        expect(city.bossAvailable).toBe(true);
        const all = flat(city);
        expect(all.find((l) => l.slug === cfg.nextNew[0])!.state).toBe('available');
        expect(all.find((l) => l.slug === cfg.nextNew[1])!.state).toBe('locked');
        expect(all.find((l) => l.slug === cfg.boss)!.state).toBe('available');
      });
    });

    it('экзамен, сданный до расширения, остаётся сданным: награды и город не начисляются второй раз, новые уроки открыты', async () => {
      const { call, user } = await login();
      await openCity(user.id);
      const get = journey(call);
      const owned = async () => {
        if (!rewards.length) return [];
        const rows = await db
          .select({ slug: cosmeticItems.slug })
          .from(userInventory)
          .innerJoin(cosmeticItems, eq(cosmeticItems.id, userInventory.itemId))
          .where(and(eq(userInventory.userId, user.id), inArray(cosmeticItems.slug, rewards)));
        return rows.map((r) => r.slug).sort();
      };
      await pass(call, get, cfg.old);
      const added = flat(await get()).filter((l) => l.kind === 'LESSON' && !cfg.old.includes(l.slug)).map((l) => l.slug);
      await expandedAfterProgress(added, async () => {
        const boss = flat(await get()).find((l) => l.kind === 'BOSS')!;
        resetRateLimits();
        const first = await playSession(call, (await call('POST', '/api/sessions', { lessonId: boss.id })).body.sessionId);
        expect(first.status).toBe(200);
        expect(first.body.passed).toBe(true);
        expect(first.body.cityCompleted).toBeTruthy();
        expect(await owned()).toEqual(rewards);

        // Повторное прохождение экзамена: город второй раз не завершается, предметы не дублируются.
        resetRateLimits();
        const again = await playSession(call, (await call('POST', '/api/sessions', { lessonId: boss.id })).body.sessionId);
        expect(again.status).toBe(200);
        expect(again.body.cityCompleted).toBeFalsy();
        expect(await owned()).toEqual(rewards);

        const all = flat(await get());
        expect(all.find((l) => l.slug === cfg.boss)!.state).toBe('completed');
        // Новые уроки не закрыты уже сданным экзаменом: они идут по очереди после старых.
        expect(all.find((l) => l.slug === cfg.nextNew[0])!.state).toBe('available');
        expect(all.find((l) => l.slug === cfg.nextNew[1])!.state).toBe('locked');
      });
    }, 120_000);
  });
}
