/**
 * Качество заданий во ВСЕХ городах, миссиях и экзаменах (решение владельца 2026-11-14: «тесты не должны быть лёгкими — ответ нельзя
 * угадать логикой или методом исключения; если в прошлых городах такие есть, исправить»). Раньше это правило проверялось только у новых
 * городов (`richDialogues` в content-rules.ts), а у старых его нарушали все шаги диалогов с двумя вариантами.
 * Признаки — apps/server/src/content/quality.ts (тот же код считает отчёт scripts/exercise-quality.ts), правила для авторов — docs/EXERCISE_QUALITY.md.
 */
import { describe, expect, it } from 'vitest';
import { CITY_CONTENT } from '../src/content/seed';
import { EXAM_A1, PLACEMENT } from '../src/content/exams';
import { MISSIONS, type MissionOption } from '../src/content/missions';
import { PREMIUM_MISSIONS } from '../src/content/missions-premium';
import { SEASON_MISSIONS } from '../src/content/seasons';
import { analyseCities, dialogueStats } from '../src/content/quality';

/** Верный вариант может быть самым длинным не чаще, чем в половине шагов (случайно — треть): иначе его находят по длине, не читая. */
const LONGEST_MAX = 0.5;

describe('качество заданий: все города', () => {
  it('нет замечаний детектора: двух вариантов в диалогах, «самого длинного», далёких вариантов в «Послушай», одинакового начала в «Вставь слово»', () => {
    const { findings } = analyseCities(CITY_CONTENT);
    expect(findings.map((f) => `${f.city}/${f.lesson}#${f.index} ${f.kind}: ${f.detail}`)).toEqual([]);
  });

  it.each(CITY_CONTENT.map((c) => [c.city, c] as const))('%s: в шагах диалога не меньше трёх вариантов, у неверного есть объяснение, верный не всегда самый длинный', (_name, city) => {
    const s = dialogueStats(city);
    expect(s.steps).toBeGreaterThan(0);
    expect(s.fewOptions, 'шаги диалога с двумя вариантами').toEqual([]);
    expect(s.noExplanation, 'неверный вариант без объяснения').toEqual([]);
    expect(s.longest / s.steps, `верный вариант самый длинный в ${s.longest} из ${s.steps} шагов`).toBeLessThanOrEqual(LONGEST_MAX);
  });

  it('входной тест и экзамен A1: у каждого задания с выбором не меньше трёх вариантов', () => {
    for (const l of [PLACEMENT, EXAM_A1]) {
      l.exercises.forEach((ex, i) => {
        const options = (ex.data as { options?: unknown[] }).options;
        if (!options || ex.type === 'FIND_ERROR' || ex.type === 'ODD_ONE_OUT') return;
        expect(options.length, `${l.slug}#${i} ${ex.type}`).toBeGreaterThanOrEqual(3);
      });
    }
  });
});

describe('качество заданий: миссии (обычные, Premium, сезонные)', () => {
  const all = [...new Map([...MISSIONS, ...PREMIUM_MISSIONS, ...SEASON_MISSIONS].map((m) => [m.slug, m])).values()];
  const steps = all.flatMap((m) => m.steps.filter((s) => s.options).map((s) => ({ m, s })));
  const txt = (o: MissionOption) => o.pl ?? o.text?.ru ?? '';

  // Исключение — два шага, где сама реплика продавца предлагает ровно два варианта («normalny czy ulgowy?», «jednorazowy czy dobowy?»):
  // третий вариант, которого в реплике нет, отсеивался бы чтением реплики, а не знанием слов.
  const TWO_BY_DESIGN = new Set(['first-tram/fare', 'first-tram/type']);

  it('в шагах выбора не меньше трёх вариантов (кроме двух шагов, где продавец сам называет два)', () => {
    const few = steps.filter(({ s }) => s.options!.length < 3).map(({ m, s }) => `${m.slug}/${s.id}`);
    expect(new Set(few)).toEqual(TWO_BY_DESIGN);
  });

  it('есть верный и неверный варианты (в 32 шагах верных два — mission-two-answers.test.ts), тексты вариантов не повторяются', () => {
    for (const { m, s } of steps) {
      expect(s.options!.filter((o) => o.ok).length, `${m.slug}/${s.id}: верных вариантов`).toBeGreaterThanOrEqual(1);
      expect(s.options!.filter((o) => !o.ok).length, `${m.slug}/${s.id}: неверных вариантов`).toBeGreaterThanOrEqual(1);
      const texts = s.options!.map((o) => txt(o).trim().toLowerCase());
      expect(new Set(texts).size, `${m.slug}/${s.id}: одинаковые варианты`).toBe(texts.length);
    }
  });

  it(`верный вариант самый длинный не чаще, чем в ${LONGEST_MAX * 100} % шагов`, () => {
    const longest = steps.filter(({ s }) => {
      const ok = s.options!.find((o) => o.ok)!;
      return s.options!.filter((o) => !o.ok).every((o) => txt(ok).length > txt(o).length);
    }).length;
    expect(longest / steps.length, `самый длинный в ${longest} из ${steps.length} шагов`).toBeLessThanOrEqual(LONGEST_MAX);
  });
});
