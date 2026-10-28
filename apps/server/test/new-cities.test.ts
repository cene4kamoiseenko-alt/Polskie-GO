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
import { ZIELONA_GORA } from '../src/content/zielona-gora';
import { ZIELONA_GORA_VOCAB } from '../src/content/vocab-zielona-gora';
import { GORZOW } from '../src/content/gorzow';
import { GORZOW_VOCAB } from '../src/content/vocab-gorzow';
import { SZCZECIN } from '../src/content/szczecin';
import { SZCZECIN_VOCAB } from '../src/content/vocab-szczecin';
import { GDANSK } from '../src/content/gdansk';
import { GDANSK_VOCAB } from '../src/content/vocab-gdansk';
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

citySuite({
  label: 'Zielona Góra',
  content: ZIELONA_GORA,
  vocab: ZIELONA_GORA_VOCAB,
  routes: ['zg-zyczenia', 'zg-zima', 'zg-wiosna', 'zg-miasto', 'zg-egzamin'],
  lessons: ['zg-1-zyczenia', 'zg-2-imieniny', 'zg-3-wigilia', 'zg-4-sylwester', 'zg-5-wielkanoc', 'zg-6-dni-wolne', 'zg-7-winobranie', 'zg-8-kartka'],
  boss: 'zg-boss',
  levels: ['A2'],
});

citySuite({
  label: 'Gorzów Wielkopolski',
  content: GORZOW,
  vocab: GORZOW_VOCAB,
  routes: ['gorz-pogoda', 'gorz-prognoza', 'gorz-przyroda', 'gorz-wycieczka', 'gorz-egzamin'],
  lessons: ['gorz-1-pogoda', 'gorz-2-pory-roku', 'gorz-3-prognoza', 'gorz-4-ubierz-sie', 'gorz-5-przyroda', 'gorz-6-cieplej', 'gorz-7-wycieczka', 'gorz-8-segregacja'],
  boss: 'gorz-boss',
  levels: ['A2'],
});

citySuite({
  label: 'Szczecin',
  content: SZCZECIN,
  vocab: SZCZECIN_VOCAB,
  routes: ['szc-szukam-pracy', 'szc-umowa', 'szc-port', 'szc-w-pracy', 'szc-egzamin'],
  lessons: ['szc-1-ogloszenie', 'szc-2-cv', 'szc-3-rozmowa', 'szc-4-umowa', 'szc-5-port', 'szc-6-moglbys', 'szc-7-spoznienie', 'szc-8-podwyzka'],
  boss: 'szc-boss',
  levels: ['A2'],
});

citySuite({
  label: 'Gdańsk',
  content: GDANSK,
  vocab: GDANSK_VOCAB,
  routes: ['gda-podroz', 'gda-miasto', 'gda-w-drodze', 'gda-trojmiasto', 'gda-egzamin'],
  lessons: ['gda-1-pociag', 'gda-2-nocleg', 'gda-3-warto', 'gda-4-plaza', 'gda-5-zgubilem', 'gda-6-lotnisko', 'gda-7-historia', 'gda-8-trojmiasto'],
  boss: 'gda-boss',
  levels: ['A2'],
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
