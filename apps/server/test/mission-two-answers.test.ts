/**
 * Шаги миссий с двумя верными ответами (владелец 2026-11-07: «сделай ответы сложнее чуть, а не чтобы прям так легко»): два верных, два правдоподобных
 * неверных, у каждого неверного — объяснение на трёх языках; подсказки, которые прежде называли верный ответ дословно, говорят о способе.
 */
import { describe, expect, it } from 'vitest';
import { normalize } from '@polski-go/shared';
import { MISSIONS, type MissionOption } from '../src/content/missions';
import { TWO_ANSWER_PATCHES, hardenTwoAnswerSteps } from '../src/content/mission-hardening';

const steps = MISSIONS.flatMap((m) => m.steps.filter((s) => s.kind !== 'build' && s.options!.filter((o) => o.ok).length >= 2).map((s) => ({ key: `${m.slug}/${s.id}`, step: s })));
const text = (o: MissionOption) => o.pl ?? o.text?.ru ?? '';
const words = (s: string) => normalize(s).split(' ').filter((w) => w.length >= 5);

describe('миссии: шаги с двумя верными ответами', () => {
  it('таких шагов 32, и у каждого — четыре варианта: два верных и два неверных', () => {
    expect(steps).toHaveLength(32);
    expect(Object.keys(TWO_ANSWER_PATCHES)).toHaveLength(32);
    for (const { key, step } of steps) {
      expect(step.options!.length, key).toBeGreaterThanOrEqual(4);
      expect(step.options!.filter((o) => o.ok).length, key).toBeGreaterThanOrEqual(2);
      expect(step.options!.filter((o) => !o.ok).length, key).toBeGreaterThanOrEqual(2);
    }
  });

  it('у каждого неверного варианта есть объяснение на трёх языках, а неверный не повторяет верный', () => {
    for (const { key, step } of steps) {
      const right = new Set(step.options!.filter((o) => o.ok).map((o) => normalize(text(o))));
      const seen = new Set<string>();
      for (const o of step.options!) {
        const k = normalize(text(o));
        expect(seen.has(k), `${key}: повтор «${text(o)}»`).toBe(false);
        seen.add(k);
        if (o.ok) continue;
        expect(right.has(k), `${key}: неверный совпал с верным`).toBe(false);
        expect(o.why?.uk && o.why.ru && o.why.en, `${key}: «${text(o)}» без объяснения`).toBeTruthy();
      }
    }
  });

  it('подсказки, называвшие ответ, переписаны: в них нет слов, которые есть только у верных вариантов', () => {
    const rewritten = Object.entries(TWO_ANSWER_PATCHES).filter(([, p]) => p.hint);
    expect(rewritten.length).toBeGreaterThanOrEqual(9);
    for (const [key, patch] of rewritten) {
      const step = steps.find((s) => s.key === key)!.step;
      const onlyRight = new Set(
        step.options!.filter((o) => o.ok).flatMap((o) => words(text(o))).filter((w) => !step.options!.filter((x) => !x.ok).some((x) => words(text(x)).includes(w))),
      );
      for (const lang of ['uk', 'ru', 'en'] as const) {
        const hint = words(patch.hint![lang] ?? '');
        for (const w of onlyRight) expect(hint, `${key} [${lang}]: подсказка называет «${w}»`).not.toContain(w);
      }
    }
  });

  it('правка с неверным ключом — ошибка при загрузке, а не молчаливый пропуск', () => {
    expect(() => hardenTwoAnswerSteps(MISSIONS.map((m) => ({ ...m, steps: m.steps.filter((s) => `${m.slug}/${s.id}` !== 'zabka-first-order/sauce') })))).toThrow(/zabka-first-order\/sauce/);
  });
});
