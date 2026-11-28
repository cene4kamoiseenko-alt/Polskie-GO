/**
 * Готовность контента (1.0, этап 2; docs/ROADMAP_1_0.md): по каждому городу — сколько трудных версий уроков нужно, сколько есть,
 * каких не хватает, сколько в версиях заданий и есть ли замечания детектора качества (quality.ts).
 *
 * Считается из того же CITY_CONTENT, что идёт в игру, поэтому отчёт не расходится с тем, что получают игроки. Версия нужна на каждом
 * уровне выше уровня урока (A2, B1, B2): уроку A1 — три, уроку A2 — две, уроку B1 — одна, уроку B2 — ни одной (так же выбирает
 * версию сервер, variantLevel). Показывается в админке (GET /api/admin/content-readiness) и скриптом `npm run content:readiness`.
 */
import { CEFR_LEVELS } from '@polski-go/shared';
import { CITIES } from './cities';
import { analyseCities } from './quality';
import type { CityContent } from './types';

const VERSION_LEVELS = ['A2', 'B1', 'B2'] as const;
export type VersionLevel = (typeof VERSION_LEVELS)[number];

/** Уровни версий, которые нужны уроку этого уровня. */
export function neededLevels(cefr: string): VersionLevel[] {
  const at = CEFR_LEVELS.indexOf(cefr as never);
  return VERSION_LEVELS.filter((lv) => CEFR_LEVELS.indexOf(lv) > at);
}

export type CityReadiness = {
  city: string;
  name: string;
  /** Уровень города на карте. */
  cefr: string | null;
  lessons: number;
  need: number;
  have: number;
  missing: { slug: string; cefr: string; level: VersionLevel }[];
  /** Заданий во всех версиях города. */
  tasks: number;
  /** Замечаний детектора «угадываемости» во всех вариантах уроков города (обычных и трудных). */
  findings: number;
  ready: boolean;
};

export type ContentReadiness = {
  cities: CityReadiness[];
  totals: { cities: number; ready: number; need: number; have: number; missing: number; tasks: number; findings: number };
};

export function contentReadiness(cities: readonly CityContent[]): ContentReadiness {
  const meta = new Map(CITIES.map((c, i) => [c.slug, { name: c.namePl, cefr: c.cefr, order: i }]));
  const findings = analyseCities(cities).findings;
  const rows = cities.map((c): CityReadiness => {
    const lessons = c.routes.flatMap((r) => r.lessons);
    let need = 0;
    let tasks = 0;
    const missing: CityReadiness['missing'] = [];
    for (const l of lessons) {
      for (const level of neededLevels(l.cefr)) {
        need++;
        const v = l.levels?.[level];
        if (v) tasks += v.exercises.length;
        else missing.push({ slug: l.slug, cefr: l.cefr, level });
      }
    }
    const m = meta.get(c.city);
    return {
      city: c.city,
      name: m?.name ?? c.city,
      cefr: m?.cefr ?? null,
      lessons: lessons.length,
      need,
      have: need - missing.length,
      missing,
      tasks,
      findings: findings.filter((f) => f.city === c.city).length,
      ready: missing.length === 0,
    };
  });
  rows.sort((a, b) => (meta.get(a.city)?.order ?? 1e9) - (meta.get(b.city)?.order ?? 1e9));
  const sum = (k: 'need' | 'have' | 'tasks' | 'findings') => rows.reduce((s, r) => s + r[k], 0);
  return {
    cities: rows,
    totals: {
      cities: rows.length,
      ready: rows.filter((r) => r.ready).length,
      need: sum('need'),
      have: sum('have'),
      missing: rows.reduce((s, r) => s + r.missing.length, 0),
      tasks: sum('tasks'),
      findings: sum('findings'),
    },
  };
}
