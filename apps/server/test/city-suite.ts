import { describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { db } from '../src/db';
import { cities, userCities } from '../src/db/schema';
import { CITIES } from '../src/content/cities';
import { CITY_CONTENT } from '../src/content/seed';
import { VOCAB, type VocabSeed } from '../src/content/vocab';
import type { CityContent } from '../src/content/types';
import { resetRateLimits } from '../src/hono';
import { expansionRules } from './content-rules';
import { login, playSession } from './helpers';

type Lesson = { id: string; slug: string; kind: string; state: string };
type City = { id: string; slug: string; unlocked: boolean; completed: boolean; bossAvailable: boolean; routes: { slug: string; lessons: Lesson[] }[] };

export type CityConfig = {
  label: string;
  content: CityContent;
  vocab: VocabSeed[];
  /** Маршруты по порядку, экзамен последним. */
  routes: string[];
  /** Обычные уроки по порядку прохождения. */
  lessons: string[];
  boss: string;
  levels: string[];
};

/**
 * Город маршрута после Вроцлава, у которого раньше не было уроков (Poznań … Zakopane): содержание и прохождение.
 * Содержание — маршруты и уроки по плану, экзамен последним, каждое слово словаря города введено в уроке, названия переведены,
 * общие правила заданий (content-rules.ts). Прохождение через API — уроки по очереди, экзамен только после последнего,
 * сданный экзамен завершает город и открывает следующий по маршруту.
 */
export function citySuite(cfg: CityConfig) {
  const all = cfg.content.routes.flatMap((r) => r.lessons);
  const regular = all.filter((l) => (l.kind ?? 'LESSON') === 'LESSON');

  describe(`${cfg.label}: содержание`, () => {
    it('маршруты и уроки по плану, экзамен — последним; город подключён к seed и стоит на своём месте маршрута', () => {
      expect(cfg.content.routes.map((r) => r.slug)).toEqual(cfg.routes);
      expect(regular.map((l) => l.slug)).toEqual(cfg.lessons);
      expect(cfg.content.routes.at(-1)!.lessons.map((l) => [l.slug, l.kind])).toEqual([[cfg.boss, 'BOSS']]);
      expect(CITY_CONTENT).toContain(cfg.content);
      expect(CITIES.some((c) => c.slug === cfg.content.city)).toBe(true);
    });

    it('словарь города зарегистрирован, без дублей, каждое слово введено хотя бы в одном уроке', () => {
      const known = VOCAB.filter((v) => cfg.vocab.some((w) => w.pl === v.pl));
      expect(known).toHaveLength(cfg.vocab.length);
      const used = new Set(all.flatMap((l) => l.words));
      for (const w of cfg.vocab) {
        expect(used.has(w.pl), `${w.pl} не введено ни в одном уроке`).toBe(true);
        expect(w.examples?.length, `${w.pl}: нет примера`).toBeGreaterThan(0);
      }
    });

    it('названия маршрутов и уроков переведены (не польские во всех языках сразу)', () => {
      for (const r of cfg.content.routes) {
        expect(r.title.uk === r.title.ru && r.title.ru === r.title.en, `маршрут ${r.slug}`).toBe(false);
        for (const l of r.lessons) expect(l.title.uk === l.title.ru && l.title.ru === l.title.en, `урок ${l.slug}`).toBe(false);
      }
    });

    expansionRules(cfg.label, all, cfg.levels);
  });

  describe(`${cfg.label}: прохождение через API`, () => {
    it('уроки открываются по очереди; экзамен — только после последнего; сданный экзамен завершает город и открывает следующий', async () => {
      const { call, user } = await login();
      const city = (await db.query.cities.findFirst({ where: eq(cities.slug, cfg.content.city) }))!;
      await db.insert(userCities).values({ userId: user.id, cityId: city.id, source: 'journey' });
      const get = async () => ((await call('GET', '/api/journey')).body.cities as City[]).find((c) => c.slug === cfg.content.city)!;
      const flat = (c: City) => c.routes.flatMap((r) => r.lessons);

      const order = flat(await get()).filter((l) => l.kind === 'LESSON');
      expect(order.map((l) => l.slug)).toEqual(cfg.lessons);
      for (const [i, l] of order.entries()) {
        expect(flat(await get()).find((x) => x.id === l.id)!.state, l.slug).toBe('available');
        if (i + 1 < order.length) expect((await call('POST', '/api/sessions', { lessonId: order[i + 1].id })).status, order[i + 1].slug).toBe(403);
        expect((await get()).bossAvailable, l.slug).toBe(false);
        resetRateLimits();
        const s = await call('POST', '/api/sessions', { lessonId: l.id });
        expect(s.status, l.slug).toBe(200);
        const fin = await playSession(call, s.body.sessionId);
        expect(fin.status, l.slug).toBe(200);
        expect(fin.body.passed, l.slug).toBe(true);
      }

      const before = await get();
      expect(before.bossAvailable).toBe(true);
      const boss = flat(before).find((l) => l.kind === 'BOSS')!;
      expect(boss.slug).toBe(cfg.boss);
      resetRateLimits();
      const exam = await playSession(call, (await call('POST', '/api/sessions', { lessonId: boss.id })).body.sessionId);
      expect(exam.status).toBe(200);
      expect(exam.body.passed).toBe(true);
      expect(exam.body.cityCompleted).toBeTruthy();
      // Следующая остановка — ближайший город с уроками; если впереди уроков нет, открывается ближайший («скоро»).
      const ahead = CITIES.slice(CITIES.findIndex((c) => c.slug === cfg.content.city) + 1);
      const next = ahead.find((c) => CITY_CONTENT.some((x) => x.city === c.slug)) ?? ahead[0];
      if (next) {
        expect(exam.body.cityCompleted.nextCity.slug).toBe(next.slug);
        const journey = (await call('GET', '/api/journey')).body as { cities: City[] };
        expect(journey.cities.find((c) => c.slug === next.slug)!.unlocked).toBe(true);
        expect(journey.cities.find((c) => c.slug === cfg.content.city)!.completed).toBe(true);
      }
    }, 300_000);
  });
}
