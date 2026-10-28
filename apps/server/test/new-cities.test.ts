/**
 * Города маршрута после Вроцлава, у которых раньше не было уроков: содержание и прохождение (city-suite.ts),
 * плюс ученики, которые сдали Вроцлав, пока дальше уроков не было: они не застревают на пройденном городе.
 */
import { afterAll, describe, expect, it } from 'vitest';
import { and, eq } from 'drizzle-orm';
import { db } from '../src/db';
import { cities, playerProgress, userCities } from '../src/db/schema';
import { STRANDED_CURRENT_CITY_SQL } from '../src/content/seed';
import { POZNAN } from '../src/content/poznan';
import { POZNAN_VOCAB } from '../src/content/vocab-poznan';
import { citySuite } from './city-suite';
import { disposeEnv, getEnv, login } from './helpers';

afterAll(disposeEnv);

citySuite({
  label: 'Poznań',
  content: POZNAN,
  vocab: POZNAN_VOCAB,
  routes: ['pzn-miasto', 'pzn-kalendarz', 'pzn-praca', 'pzn-dzien', 'pzn-egzamin'],
  lessons: ['pzn-1-skad-dokad', 'pzn-2-koziolki', 'pzn-3-miesiace', 'pzn-4-daty', 'pzn-5-zajmuje-sie', 'pzn-6-targi', 'pzn-7-musze-moge', 'pzn-8-weekend'],
  boss: 'pzn-boss',
  levels: ['A1', 'A2'],
});

describe('ученик сдал Вроцлав, когда в Познани ещё не было уроков', () => {
  const cityId = async (slug: string) => (await db.query.cities.findFirst({ where: eq(cities.slug, slug) }))!.id;
  /** Состояние до новых уроков: Вроцлав сдан и остался текущим, Познань открыта как «скоро». */
  async function stranded() {
    const u = await login();
    const [wro, pzn] = [await cityId('wroclaw'), await cityId('poznan')];
    const now = new Date(Date.now() - 86_400_000);
    await db.insert(userCities).values([{ userId: u.user.id, cityId: wro, bossPassedAt: now, completedAt: now }, { userId: u.user.id, cityId: pzn, unlockedAt: now }]);
    await db.update(playerProgress).set({ currentCityId: wro }).where(eq(playerProgress.userId, u.user.id));
    return { ...u, wro, pzn };
  }

  it('подорож ведёт в Познань: текущий город и следующий урок оттуда', async () => {
    const u = await stranded();
    const j = (await u.call('GET', '/api/journey')).body;
    expect(j.currentCityId).toBe(u.pzn);
    expect(j.nextLesson.slug).toBe('pzn-1-skad-dokad');
  });

  it('seed переносит текущий город в базе (профиль тоже показывает Познань); повторный запуск ничего не меняет', async () => {
    const u = await stranded();
    // Ученик в середине Вроцлава (экзамен не сдан) и ученик, у которого Познань не открыта, не трогаются.
    const mid = await login();
    const midWro = await cityId('wroclaw');
    await db.insert(userCities).values({ userId: mid.user.id, cityId: midWro });
    await db.update(playerProgress).set({ currentCityId: midWro }).where(eq(playerProgress.userId, mid.user.id));
    const { env } = await getEnv();
    await env.DB.prepare(STRANDED_CURRENT_CITY_SQL).run();
    await env.DB.prepare(STRANDED_CURRENT_CITY_SQL).run();
    const current = async (userId: string) => (await db.select().from(playerProgress).where(eq(playerProgress.userId, userId)))[0].currentCityId;
    expect(await current(u.user.id)).toBe(u.pzn);
    expect(await current(mid.user.id)).toBe(midWro);
    expect((await u.call('GET', '/api/me')).body.progress.currentCity.slug).toBe('poznan');
    expect(await db.select().from(userCities).where(and(eq(userCities.userId, u.user.id), eq(userCities.cityId, u.pzn)))).toHaveLength(1);
  });
});
