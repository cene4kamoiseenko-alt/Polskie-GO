/**
 * Миссия за подписку на канал @polskigoo (docs/superpowers/specs/2026-11-23-channel-mission-design.md):
 * квест-комната «Тайна Твардовского» в Кракове, ~20 минут. Держит форму длинной истории (как Premium-сцены),
 * учит слова górny/dolny/środkowy и «oraz», которых раньше в курсе не было, и кладёт их в словарь.
 */
import { describe, expect, it } from 'vitest';
import { MISSIONS } from '../src/content/missions';
import { CHANNEL_MISSIONS } from '../src/content/mission-channel';
import { VOCAB } from '../src/content/vocab';

const vocab = new Set(VOCAB.map((v) => v.pl));
const tokens = (s: string) => s.replace(/[.,!?„”«»:;]/g, '').split(/\s+/).filter(Boolean);

describe('Миссия канала «Тайна Твардовского»', () => {
  const m = CHANNEL_MISSIONS[0];

  it('одна миссия, только для подписчиков канала, в общем списке', () => {
    expect(CHANNEL_MISSIONS.map((x) => x.slug)).toEqual(['escape-twardowski']);
    expect(m.channel).toBe(true);
    expect(m.premium).toBeUndefined();
    expect(m.season).toBeUndefined();
    expect(MISSIONS.filter((x) => x.channel).map((x) => x.slug)).toEqual(['escape-twardowski']);
  });

  it('длинная: 20 минут, не меньше 26 шагов, id шагов уникальны; награда как у длинных Premium-сцен', () => {
    expect(m.minutes).toBe(20);
    expect(m.steps.length).toBeGreaterThanOrEqual(26);
    expect(new Set(m.steps.map((s) => s.id)).size).toBe(m.steps.length);
    expect([m.xp, m.zlotki]).toEqual([60, 30]);
    expect([m.city, m.scene, m.category]).toEqual(['krakow', 'castle', 'road']);
  });

  it('без «послушай»; ровно один верный вариант, у неверных есть объяснение', () => {
    for (const s of m.steps) {
      expect(s.kind, s.id).not.toBe('listen');
      if (!s.options) continue;
      expect(s.options.filter((o) => o.ok).length, s.id).toBe(1);
      for (const o of s.options) if (!o.ok) expect(o.why, `${s.id}: объяснение неверного варианта`).toBeDefined();
    }
  });

  it('слова повторения есть в словаре; ловушки сборки не входят в ответ', () => {
    for (const s of m.steps) {
      for (const w of s.words ?? []) expect(vocab.has(w), `${s.id} «${w}»`).toBe(true);
      if (s.kind === 'build') for (const x of s.extra ?? []) expect(tokens(s.answer!), `${s.id}: ловушка «${x}»`).not.toContain(x);
    }
  });

  it('учит górna/dolna/środkowa (полки) и «oraz»', () => {
    const polish = m.steps.flatMap((s) => [s.line?.pl ?? '', s.answer ?? '', ...(s.options ?? []).map((o) => o.pl ?? '')]).join(' ');
    // Граница слова с учётом польских букв: \b в JS не считает «ś» буквой.
    const word = (w: string) => new RegExp(`(?<!\\p{L})${w}(?!\\p{L})`, 'u');
    for (const w of ['górn(ej|a)', 'doln(ej|a)', 'środkow(ej|a)', 'oraz']) expect(polish, w).toMatch(word(w));
  });

  it('новые слова — в словаре: górny, dolny, środkowy, oraz, Górny Śląsk, Dolny Śląsk', () => {
    for (const w of ['górny', 'dolny', 'środkowy', 'oraz', 'Górny Śląsk', 'Dolny Śląsk']) expect(vocab.has(w), w).toBe(true);
  });
});
