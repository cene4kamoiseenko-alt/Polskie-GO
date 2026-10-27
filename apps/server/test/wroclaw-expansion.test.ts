import { afterAll, describe, expect, it } from 'vitest';
import { and, eq, inArray } from 'drizzle-orm';
import { db } from '../src/db';
import { cities, cosmeticItems, lessons, userCities, userInventory } from '../src/db/schema';
import { resetRateLimits } from '../src/hono';
import { disposeEnv, login, playSession } from './helpers';

afterAll(disposeEnv);

type Lesson = { id: string; slug: string; kind: string; state: string };
type City = { slug: string; bossAvailable: boolean; routes: { slug: string; lessons: Lesson[] }[] };

const OLD = ['wro-1-kawa', 'wro-2-zabka', 'wro-3-ceny', 'wro-4-restauracja'];
const NEW_ROUTES = ['wro-ubrania', 'wro-targ', 'wro-wieczor', 'wro-prezenty', 'wro-powtorka'];

async function openWroclaw(userId: string) {
  const wroclaw = (await db.query.cities.findFirst({ where: eq(cities.slug, 'wroclaw') }))!;
  await db.insert(userCities).values({ userId, cityId: wroclaw.id, source: 'journey' });
}

describe('Wrocław після розширення (одяг, ринок, вечір, подарунки, повторення)', () => {
  it('маршрути й порядок: старі три, п’ять нових, іспит останнім; старі уроки на місці', async () => {
    const { call, user } = await login();
    await openWroclaw(user.id);
    const wro = ((await call('GET', '/api/journey')).body.cities as City[]).find((c) => c.slug === 'wroclaw')!;
    expect(wro.routes.map((r) => r.slug)).toEqual(['wro-kawiarnia', 'wro-sklep', 'wro-restauracja', ...NEW_ROUTES, 'wro-egzamin']);
    const regular = wro.routes.flatMap((r) => r.lessons).filter((l) => l.kind === 'LESSON');
    expect(regular).toHaveLength(16);
    expect(regular.slice(0, 4).map((l) => l.slug)).toEqual(OLD);
    expect(wro.routes.at(-1)!.lessons.map((l) => l.slug)).toEqual(['wro-boss']);
  });

  it('уроки 1–16 відкриваються по черзі й проходяться через API; іспит — лише після шістнадцятого', async () => {
    const { call, user } = await login();
    await openWroclaw(user.id);
    const wro = async () => ((await call('GET', '/api/journey')).body.cities as City[]).find((c) => c.slug === 'wroclaw')!;

    const regular = (await wro()).routes.flatMap((r) => r.lessons).filter((l) => l.kind === 'LESSON');
    for (const [i, l] of regular.entries()) {
      const now = (await wro()).routes.flatMap((r) => r.lessons).find((x) => x.id === l.id)!;
      expect(now.state, l.slug).toBe('available');
      // Наступний урок ще закритий, іспит закритий до кінця.
      if (i + 1 < regular.length) expect((await call('POST', '/api/sessions', { lessonId: regular[i + 1].id })).status, regular[i + 1].slug).toBe(403);
      expect((await wro()).bossAvailable, l.slug).toBe(false);

      resetRateLimits();
      const s = await call('POST', '/api/sessions', { lessonId: l.id });
      expect(s.status, l.slug).toBe(200);
      const fin = await playSession(call, s.body.sessionId);
      expect(fin.status, l.slug).toBe(200);
      expect(fin.body.passed, l.slug).toBe(true);
    }

    const city = await wro();
    expect(city.bossAvailable).toBe(true);
    const boss = city.routes.flatMap((r) => r.lessons).find((l) => l.kind === 'BOSS')!;
    expect(boss.state).toBe('available');
    // 16 уроків через API по черзі — довший сценарій за типовий тайм-аут.
  }, 300_000);

  it('старі чотири уроки відкривають іспит лише тим, хто пройшов їх до розширення; нові уроки лишаються відкритими', async () => {
    const { call, user } = await login();
    await openWroclaw(user.id);
    const wro = async () => ((await call('GET', '/api/journey')).body.cities as City[]).find((c) => c.slug === 'wroclaw')!;
    for (const slug of OLD) {
      const l = (await wro()).routes.flatMap((r) => r.lessons).find((x) => x.slug === slug)!;
      resetRateLimits();
      const s = await call('POST', '/api/sessions', { lessonId: l.id });
      expect((await playSession(call, s.body.sessionId)).status, slug).toBe(200);
    }
    // Нові уроки засіяні раніше, ніж користувач пройшов старі, — він новий учень і проходить усе місто.
    expect((await wro()).bossAvailable).toBe(false);

    // Розширення виходить після того, як учень пройшов старі уроки: іспит лишається відкритим.
    const added = (await wro()).routes.flatMap((r) => r.lessons).filter((l) => l.kind === 'LESSON' && !OLD.includes(l.slug)).map((l) => l.slug);
    expect(added).toHaveLength(12);
    const seeded = (await db.select({ createdAt: lessons.createdAt }).from(lessons).where(eq(lessons.slug, added[0])))[0].createdAt;
    await db.update(lessons).set({ createdAt: new Date(Date.now() + 60_000) }).where(inArray(lessons.slug, added));
    try {
      const city = await wro();
      expect(city.bossAvailable).toBe(true);
      const all = city.routes.flatMap((r) => r.lessons);
      expect(all.find((l) => l.slug === 'wro-5-ubrania')!.state).toBe('available');
      expect(all.find((l) => l.slug === 'wro-6-przymierzalnia')!.state).toBe('locked');
      expect(all.find((l) => l.slug === 'wro-boss')!.state).toBe('available');
    } finally {
      await db.update(lessons).set({ createdAt: seeded }).where(inArray(lessons.slug, added));
    }
  });

  it('іспит, складений до розширення, лишається складеним: нагороди й місто не нараховуються вдруге, нові уроки відкриті', async () => {
    const { call, user } = await login();
    await openWroclaw(user.id);
    const wro = async () => ((await call('GET', '/api/journey')).body.cities as City[]).find((c) => c.slug === 'wroclaw')!;
    const reward = async () => {
      const rows = await db
        .select({ slug: cosmeticItems.slug })
        .from(userInventory)
        .innerJoin(cosmeticItems, eq(cosmeticItems.id, userInventory.itemId))
        .where(and(eq(userInventory.userId, user.id), inArray(cosmeticItems.slug, ['souvenir-krasnal', 'costume-krasnal'])));
      return rows.map((r) => r.slug).sort();
    };
    for (const slug of OLD) {
      const l = (await wro()).routes.flatMap((r) => r.lessons).find((x) => x.slug === slug)!;
      resetRateLimits();
      const s = await call('POST', '/api/sessions', { lessonId: l.id });
      expect((await playSession(call, s.body.sessionId)).status, slug).toBe(200);
    }
    const added = (await wro()).routes.flatMap((r) => r.lessons).filter((l) => l.kind === 'LESSON' && !OLD.includes(l.slug)).map((l) => l.slug);
    const seeded = (await db.select({ createdAt: lessons.createdAt }).from(lessons).where(eq(lessons.slug, added[0])))[0].createdAt;
    await db.update(lessons).set({ createdAt: new Date(Date.now() + 60_000) }).where(inArray(lessons.slug, added));
    try {
      const boss = (await wro()).routes.flatMap((r) => r.lessons).find((l) => l.kind === 'BOSS')!;
      resetRateLimits();
      const first = await playSession(call, (await call('POST', '/api/sessions', { lessonId: boss.id })).body.sessionId);
      expect(first.status).toBe(200);
      expect(first.body.passed).toBe(true);
      expect(first.body.cityCompleted).toBeTruthy();
      expect(await reward()).toEqual(['costume-krasnal', 'souvenir-krasnal']);

      // Повторне проходження іспиту: місто вдруге не завершується, предмети не дублюються.
      resetRateLimits();
      const again = await playSession(call, (await call('POST', '/api/sessions', { lessonId: boss.id })).body.sessionId);
      expect(again.status).toBe(200);
      expect(again.body.cityCompleted).toBeFalsy();
      expect(await reward()).toEqual(['costume-krasnal', 'souvenir-krasnal']);

      const all = (await wro()).routes.flatMap((r) => r.lessons);
      expect(all.find((l) => l.slug === 'wro-boss')!.state).toBe('completed');
      // Нові уроки не закриті іспитом, що вже складено: вони йдуть по черзі після четвертого.
      expect(all.find((l) => l.slug === 'wro-5-ubrania')!.state).toBe('available');
      expect(all.find((l) => l.slug === 'wro-6-przymierzalnia')!.state).toBe('locked');
    } finally {
      await db.update(lessons).set({ createdAt: seeded }).where(inArray(lessons.slug, added));
    }
  }, 120_000);
});
