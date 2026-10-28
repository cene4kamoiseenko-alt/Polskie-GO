import { describe, expect, it } from 'vitest';
import { KATOWICE } from '../src/content/katowice';
import { CITY_CONTENT } from '../src/content/seed';
import { KATOWICE_VOCAB } from '../src/content/vocab-katowice';
import { VOCAB } from '../src/content/vocab';
import { expansionRules } from './content-rules';

/** Уроки Катовице 5–13 подключены к CITY_CONTENT. План маршрутов, словарь 54 слов и общие правила расширения (content-rules.ts). */
const NEW_ROUTES = ['kat-podroze', 'kat-poczta', 'kat-mieszkanie', 'kat-rozmowa'];
const routes = KATOWICE.routes.filter((r) => NEW_ROUTES.includes(r.slug));
const lessons = routes.flatMap((r) => r.lessons.map((l) => ({ route: r.slug, lesson: l })));

describe('уроки Катовице 5–13', () => {
  it('маршруты и уроки идут по плану, после старых и перед экзаменом', () => {
    expect(KATOWICE.routes.map((r) => r.slug)).toEqual(['kat-ruch', 'kat-pary', ...NEW_ROUTES, 'kat-egzamin']);
    // У CITY_CONTENT місто за стандартом (city-standard.ts): 8 уроків цього файлу та іспит, решта — в архіві.
    const published = CITY_CONTENT.find((c) => c.city === 'katowice')!.routes.flatMap((r) => r.lessons);
    expect(published.map((l) => l.slug)).toEqual(['kat-1-transport', 'kat-2-isc-jechac', 'kat-3-wiedziec-znac', 'kat-4-te-ta', 'kat-5-przyjechac', 'kat-7-taksowka', 'kat-9-wynajem', 'kat-10-awaria', 'kat-boss']);
    const source = new Map(KATOWICE.routes.flatMap((r) => r.lessons).map((l) => [l.slug, l]));
    for (const l of published) expect(source.has(l.slug), l.slug).toBe(true);
    expect(lessons.map((x) => x.lesson.slug)).toEqual([
      'kat-5-przyjechac', 'kat-6-hulajnoga', 'kat-7-taksowka', 'kat-8-poczta', 'kat-9-wynajem', 'kat-10-awaria', 'kat-11-telefon', 'kat-12-prosby', 'kat-13-zgubione',
    ]);
    expect(KATOWICE.routes.slice(0, 2).flatMap((r) => r.lessons.map((l) => l.slug))).toEqual(['kat-1-transport', 'kat-2-isc-jechac', 'kat-3-wiedziec-znac', 'kat-4-te-ta']);
  });

  it('все слова словаря Катовице зарегистрированы и введены хотя бы в одном уроке', () => {
    expect(KATOWICE_VOCAB.length).toBeGreaterThanOrEqual(50);
    const known = new Set(VOCAB.map((v) => v.pl));
    const used = new Set(KATOWICE.routes.flatMap((r) => r.lessons.flatMap((l) => l.words)));
    for (const w of KATOWICE_VOCAB) {
      expect(known.has(w.pl), `${w.pl} не в VOCAB`).toBe(true);
      expect(used.has(w.pl), `${w.pl} не введено ни в одном уроке`).toBe(true);
    }
  });

  it('названия уроков и маршрутов переведены (не польские во всех языках сразу)', () => {
    for (const r of KATOWICE.routes) {
      expect(r.title.uk === r.title.ru && r.title.ru === r.title.en && /[ąćęłńóśźż]/i.test(r.title.uk), `маршрут ${r.slug}`).toBe(false);
      for (const l of r.lessons) {
        // Допустимо, когда название — сама польская фраза с переводом на одном из языков (kat-3, kat-4).
        const same = l.title.uk === l.title.ru && l.title.ru === l.title.en;
        expect(same, `урок ${l.slug} «${l.title.uk}»`).toBe(false);
      }
    }
  });

  expansionRules('Катовице 5–13', lessons.map((x) => x.lesson));
});
