import { describe, expect, it } from 'vitest';
import { OPOLE } from '../src/content/opole';
import { CITY_CONTENT } from '../src/content/seed';
import { OPOLE_VOCAB } from '../src/content/vocab-opole';
import { VOCAB } from '../src/content/vocab';
import { expansionRules } from './content-rules';

/** Уроки Ополя 5–10 подключены к CITY_CONTENT. План маршрутов, словарь 35 слов и общие правила расширения (content-rules.ts). */
const NEW_ROUTES = ['opo-rozmowy', 'opo-festiwal'];
const routes = OPOLE.routes.filter((r) => NEW_ROUTES.includes(r.slug));
const lessons = routes.flatMap((r) => r.lessons.map((l) => ({ route: r.slug, lesson: l })));

describe('уроки Ополя 5–10', () => {
  it('маршруты и уроки идут по плану, после старых и перед экзаменом', () => {
    expect(OPOLE.routes.map((r) => r.slug)).toEqual(['opo-zywy', ...NEW_ROUTES, 'opo-egzamin']);
    // У CITY_CONTENT місто за стандартом (city-standard.ts): 8 уроків цього файлу та іспит, решта — в архіві.
    const published = CITY_CONTENT.find((c) => c.city === 'opole')!.routes.flatMap((r) => r.lessons);
    expect(published.map((l) => l.slug)).toEqual(['opo-1-siema', 'opo-2-reakcje', 'opo-3-ogarniac', 'opo-4-nic-nikt', 'opo-5-weekend', 'opo-6-zaproszenie', 'opo-8-koncert', 'opo-10-nagroda', 'opo-boss']);
    const source = new Map(OPOLE.routes.flatMap((r) => r.lessons).map((l) => [l.slug, l]));
    for (const l of published) expect(source.has(l.slug), l.slug).toBe(true);
    expect(lessons.map((x) => x.lesson.slug)).toEqual(['opo-5-weekend', 'opo-6-zaproszenie', 'opo-7-zdanie', 'opo-8-koncert', 'opo-9-piosenka', 'opo-10-nagroda']);
    expect(OPOLE.routes[0].lessons.map((l) => l.slug)).toEqual(['opo-1-siema', 'opo-2-reakcje', 'opo-3-ogarniac', 'opo-4-nic-nikt']);
    expect(OPOLE.routes.at(-1)!.lessons.map((l) => l.slug)).toEqual(['opo-boss']);
  });

  it('все слова словаря Ополя зарегистрированы и введены хотя бы в одном уроке; тема «music» есть', () => {
    expect(OPOLE_VOCAB).toHaveLength(35);
    const known = new Set(VOCAB.map((v) => v.pl));
    const used = new Set(OPOLE.routes.flatMap((r) => r.lessons.flatMap((l) => l.words)));
    for (const w of OPOLE_VOCAB) {
      expect(known.has(w.pl), `${w.pl} не в VOCAB`).toBe(true);
      expect(used.has(w.pl), `${w.pl} не введено ни в одном уроке`).toBe(true);
      expect(w.examples?.length, `${w.pl}: нет примера`).toBeGreaterThan(0);
    }
    expect(new Set(VOCAB.map((v) => `${v.pl}|${v.pos}`)).size, 'в словаре нет повторов слово+часть речи').toBe(VOCAB.length);
  });

  it('названия новых уроков и маршрутов переведены (не польские во всех языках сразу)', () => {
    for (const r of routes) {
      expect(r.title.uk === r.title.ru && r.title.ru === r.title.en && /[ąćęłńóśźż]/i.test(r.title.uk), `маршрут ${r.slug}`).toBe(false);
      expect(r.description.uk === r.description.ru && r.description.ru === r.description.en, `описание ${r.slug}`).toBe(false);
      for (const l of r.lessons) expect(l.title.uk === l.title.ru && l.title.ru === l.title.en, `урок ${l.slug} «${l.title.uk}»`).toBe(false);
    }
  });

  it('нейтральный регистр: новые уроки не вводят сленг (siema, elo, nara, sztos) — он остался в уроках 1–4', () => {
    const slang = /\b(siema|elo|nara|sztos|zarąbiście|ziomek|masakra)\b/i;
    for (const { lesson } of lessons) {
      const text = JSON.stringify(lesson.exercises.map((e) => e.data));
      expect(slang.test(text), lesson.slug).toBe(false);
    }
  });

  expansionRules('Ополе 5–10', lessons.map((x) => x.lesson));
});
