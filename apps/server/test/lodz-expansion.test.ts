import { afterAll, describe, expect, it } from 'vitest';
import { eq, inArray } from 'drizzle-orm';
import { db } from '../src/db';
import { cities, lessons, userCities } from '../src/db/schema';
import { resetRateLimits } from '../src/hono';
import { disposeEnv, login, playSession } from './helpers';

afterAll(disposeEnv);

type Lesson = { id: string; slug: string; kind: string; state: string };
type City = { slug: string; bossAvailable: boolean; routes: { slug: string; lessons: Lesson[] }[] };

async function openLodz(userId: string) {
  const lodz = (await db.query.cities.findFirst({ where: eq(cities.slug, 'lodz') }))!;
  await db.insert(userCities).values({ userId, cityId: lodz.id, source: 'journey' });
}

describe('Łódź після розширень (теми «Praca w Łodzi», «День і графік», «Здоров\'я», повторення)', () => {
  it('уроки 1–16 відкриваються по черзі й проходяться через API; іспит — лише після шістнадцятого', async () => {
    const { call, user } = await login();
    await openLodz(user.id);
    const lodz = async () => ((await call('GET', '/api/journey')).body.cities as City[]).find((c) => c.slug === 'lodz')!;

    const praca = (await lodz()).routes.find((r) => r.slug === 'lodz-praca')!;
    expect(praca.lessons.map((l) => l.slug)).toEqual(['lodz-5-gdzie-pracujesz', 'lodz-6-szukam-pracy', 'lodz-7-rozmowa', 'lodz-8-pierwszy-dzien']);
    expect((await lodz()).routes.map((r) => r.slug)).toEqual(['lodz-dzwieki', 'lodz-ludzie', 'lodz-praca', 'lodz-dzien', 'lodz-zdrowie', 'lodz-powtorka', 'lodz-egzamin']);

    const regular = (await lodz()).routes.flatMap((r) => r.lessons).filter((l) => l.kind === 'LESSON');
    expect(regular).toHaveLength(16);
    for (const [i, l] of regular.entries()) {
      const now = (await lodz()).routes.flatMap((r) => r.lessons).find((x) => x.id === l.id)!;
      expect(now.state, l.slug).toBe('available');
      // Наступний урок ще закритий, іспит закритий до кінця.
      if (i + 1 < regular.length) expect((await call('POST', '/api/sessions', { lessonId: regular[i + 1].id })).status, regular[i + 1].slug).toBe(403);
      expect((await lodz()).bossAvailable, l.slug).toBe(false);

      resetRateLimits();
      const s = await call('POST', '/api/sessions', { lessonId: l.id });
      expect(s.status, l.slug).toBe(200);
      const fin = await playSession(call, s.body.sessionId);
      expect(fin.status, l.slug).toBe(200);
      expect(fin.body.passed, l.slug).toBe(true);
    }

    const city = await lodz();
    expect(city.bossAvailable).toBe(true);
    const boss = city.routes.flatMap((r) => r.lessons).find((l) => l.kind === 'BOSS')!;
    expect(boss.state).toBe('available');
    // 16 уроків через API по черзі — довший сценарій за типовий тайм-аут.
  }, 240_000);

  it('старі чотири уроки відкривають іспит лише тим, хто пройшов їх до розширення; нові уроки лишаються відкритими', async () => {
    const { call, user } = await login();
    await openLodz(user.id);
    const lodz = async () => ((await call('GET', '/api/journey')).body.cities as City[]).find((c) => c.slug === 'lodz')!;
    const old = ['lodz-1-alfabet', 'lodz-2-dwuznaki', 'lodz-3-zawody', 'lodz-4-oni-one'];
    for (const slug of old) {
      const l = (await lodz()).routes.flatMap((r) => r.lessons).find((x) => x.slug === slug)!;
      resetRateLimits();
      const s = await call('POST', '/api/sessions', { lessonId: l.id });
      expect((await playSession(call, s.body.sessionId)).status, slug).toBe(200);
    }
    // Нові уроки засіяні раніше, ніж користувач пройшов старі, — він новий учень і проходить усе місто.
    expect((await lodz()).bossAvailable).toBe(false);

    // Обидва розширення після того, як учень пройшов старі уроки: іспит лишається відкритим.
    const added = (await lodz()).routes.flatMap((r) => r.lessons).filter((l) => l.kind === 'LESSON' && !old.includes(l.slug)).map((l) => l.slug);
    expect(added).toHaveLength(12);
    const seeded = (await db.select({ createdAt: lessons.createdAt }).from(lessons).where(eq(lessons.slug, added[0])))[0].createdAt;
    await db.update(lessons).set({ createdAt: new Date(Date.now() + 60_000) }).where(inArray(lessons.slug, added));
    try {
      const city = await lodz();
      expect(city.bossAvailable).toBe(true);
      const all = city.routes.flatMap((r) => r.lessons);
      expect(all.find((l) => l.slug === 'lodz-5-gdzie-pracujesz')!.state).toBe('available');
      expect(all.find((l) => l.slug === 'lodz-6-szukam-pracy')!.state).toBe('locked');
    } finally {
      await db.update(lessons).set({ createdAt: seeded }).where(inArray(lessons.slug, added));
    }
  });
});
