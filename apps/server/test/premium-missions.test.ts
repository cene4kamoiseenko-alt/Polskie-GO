/**
 * Сцены Premium — длинные истории (~15 минут, три действия с поворотом; content/missions-premium.ts).
 * Держит форму: не меньше 19 шагов и 15 минут на карточке, уникальные id шагов, в новых шагах ровно один правильный вариант,
 * новых шагов «послушай» нет (озвучку генерирует только админка), слова повторения есть в словаре, у сборки фраз
 * слова-ловушки не совпадают со словами ответа, награда не менялась (экономику решает владелец).
 */
import { describe, expect, it } from 'vitest';
import { MISSIONS } from '../src/content/missions';
import { PREMIUM_MISSIONS } from '../src/content/missions-premium';
import { VOCAB } from '../src/content/vocab';

const premium = MISSIONS.filter((m) => m.premium);
/** Старые шаги с двумя верными ответами (оба естественны) и старые «послушай» — были до удлинения. */
const TWO_OK = ['landlord:people', 'landlord:price', 'landlord:contract', 'first-workday:repeat', 'first-workday:bye'];
const OLD_LISTEN = ['landlord:welcome', 'landlord:total', 'first-workday:welcome', 'first-workday:hours', 'doctor-appointment:hello', 'doctor-appointment:slot'];
const vocab = new Set(VOCAB.map((v) => v.pl));
const tokens = (s: string) => s.replace(/[.,!?]/g, '').split(/\s+/).filter(Boolean);

describe('Premium-сцены: длинные истории', () => {
  it('шесть сцен из missions-premium.ts, в общем списке по порядку', () => {
    expect(PREMIUM_MISSIONS.map((m) => m.slug)).toEqual(['landlord', 'first-workday', 'doctor-appointment', 'lotnisko-lot', 'zakopane-ferie', 'warszawa-dzien']);
    expect(premium.map((m) => m.slug)).toEqual(PREMIUM_MISSIONS.map((m) => m.slug));
  });

  it('каждая — не меньше 19 шагов и «~15 мин» на карточке; id шагов уникальны', () => {
    for (const m of premium) {
      expect(m.steps.length, m.slug).toBeGreaterThanOrEqual(19);
      expect(m.minutes, m.slug).toBe(15);
      expect(new Set(m.steps.map((s) => s.id)).size, m.slug).toBe(m.steps.length);
    }
  });

  it('в новых шагах ровно один правильный вариант, новых «послушай» нет', () => {
    for (const m of premium) for (const s of m.steps) {
      const key = `${m.slug}:${s.id}`;
      if (s.kind === 'listen') expect(OLD_LISTEN, key).toContain(key);
      if (s.options && !TWO_OK.includes(key)) expect(s.options.filter((o) => o.ok).length, key).toBe(1);
      if (s.options) for (const o of s.options) if (!o.ok) expect(o.why, `${key}: у неверного варианта есть объяснение`).toBeDefined();
    }
  });

  it('слова повторения есть в словаре; у сборки фраз ловушки не входят в ответ', () => {
    for (const m of premium) for (const s of m.steps) {
      for (const w of s.words ?? []) expect(vocab.has(w), `${m.slug}:${s.id} «${w}»`).toBe(true);
      if (s.kind === 'build') {
        const answer = tokens(s.answer!);
        for (const x of s.extra ?? []) expect(answer, `${m.slug}:${s.id}: ловушка «${x}»`).not.toContain(x);
      }
    }
  });

  it('награда прежняя: удлинение не меняет экономику (XP и Złotki решает владелец)', () => {
    const reward = Object.fromEntries(premium.map((m) => [m.slug, [m.xp, m.zlotki]]));
    expect(reward).toEqual({
      landlord: [50, 25], 'first-workday': [50, 25], 'doctor-appointment': [50, 25],
      'lotnisko-lot': [55, 30], 'zakopane-ferie': [55, 30], 'warszawa-dzien': [55, 30],
    });
  });
});
