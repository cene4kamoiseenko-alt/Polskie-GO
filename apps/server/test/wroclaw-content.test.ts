import { describe, expect, it } from 'vitest';
import { WROCLAW } from '../src/content/wroclaw';
import { CITY_CONTENT } from '../src/content/seed';
import { expansionRules } from './content-rules';

/** Уроки Вроцлава 5–16 подключены к CITY_CONTENT. План маршрутов и общие правила расширения (content-rules.ts). */
const NEW_ROUTES = ['wro-ubrania', 'wro-targ', 'wro-wieczor', 'wro-prezenty', 'wro-powtorka'];
const routes = WROCLAW.routes.filter((r) => NEW_ROUTES.includes(r.slug));
const lessons = routes.flatMap((r) => r.lessons.map((l) => ({ route: r.slug, lesson: l })));

describe('уроки Вроцлава 5–16', () => {
  it('маршруты и уроки идут по плану: пять маршрутов, двенадцать уроков 5–16, перед экзаменом', () => {
    expect(routes.map((r) => r.slug)).toEqual(NEW_ROUTES);
    // Порядок маршрутов города: старые три, пять новых, экзамен последним (бос открывается после всех обычных уроков).
    expect(WROCLAW.routes.map((r) => r.slug)).toEqual(['wro-kawiarnia', 'wro-sklep', 'wro-restauracja', ...NEW_ROUTES, 'wro-egzamin']);
    expect(CITY_CONTENT.find((c) => c.city === 'wroclaw')).toBe(WROCLAW);
    expect(lessons.map((x) => x.lesson.slug)).toEqual([
      'wro-5-ubrania', 'wro-6-przymierzalnia', 'wro-7-zwrot', 'wro-8-targ', 'wro-9-lista', 'wro-10-tysiac',
      'wro-11-rezerwacja', 'wro-12-smaki', 'wro-13-krasnale', 'wro-14-prezent', 'wro-15-porownanie', 'wro-16-powtorka',
    ]);
    expect(lessons.filter((x) => x.route === 'wro-ubrania').map((x) => x.lesson.slug)).toEqual(['wro-5-ubrania', 'wro-6-przymierzalnia', 'wro-7-zwrot']);
    expect(lessons.filter((x) => x.route === 'wro-targ').map((x) => x.lesson.slug)).toEqual(['wro-8-targ', 'wro-9-lista', 'wro-10-tysiac']);
    expect(lessons.filter((x) => x.route === 'wro-wieczor').map((x) => x.lesson.slug)).toEqual(['wro-11-rezerwacja', 'wro-12-smaki', 'wro-13-krasnale']);
    expect(lessons.filter((x) => x.route === 'wro-prezenty').map((x) => x.lesson.slug)).toEqual(['wro-14-prezent', 'wro-15-porownanie']);
    expect(lessons.filter((x) => x.route === 'wro-powtorka').map((x) => x.lesson.slug)).toEqual(['wro-16-powtorka']);
  });

  it('урок повторения новых слов не вводит', () => {
    expect(lessons.at(-1)!.lesson.words).toEqual([]);
  });

  expansionRules('Вроцлав 5–16', lessons.map((x) => x.lesson));
});
