/**
 * Уровень игрока на общей дороге (2026-11-16): какая версия урока выдаётся, итог входного теста по блокам и автоподстройка.
 */
import { describe, expect, it } from 'vitest';
import { adaptLevel, placementProgress, studyLevelFor, variantLevel } from '../src/levels';

describe('variantLevel — версия урока под уровень игрока', () => {
  it('без уровня игрока или уровень не выше уровня урока — обычная версия', () => {
    expect(variantLevel('A1', null, ['A2', 'B1'])).toBeNull();
    expect(variantLevel('B1', 'B1', ['B2'])).toBeNull();
    expect(variantLevel('B1', 'A2', ['B2'])).toBeNull();
  });
  it('наибольшая версия не выше уровня игрока', () => {
    expect(variantLevel('A1', 'B2', ['A2', 'B1', 'B2'])).toBe('B2');
    expect(variantLevel('A1', 'B1', ['A2', 'B1', 'B2'])).toBe('B1');
    expect(variantLevel('A1', 'B2', ['A2'])).toBe('A2');
  });
  it('версий нет или все выше уровня игрока — обычная', () => {
    expect(variantLevel('A1', 'B1', [])).toBeNull();
    expect(variantLevel('A1', 'A2', ['B1', 'B2'])).toBeNull();
  });
  it('версия не ниже и не равна уровню урока', () => {
    expect(variantLevel('A2', 'B2', ['A2', 'B1'])).toBe('B1');
  });
});

describe('placementProgress — тест блоками по 3 вопроса', () => {
  const block = (level: 'A0' | 'A1' | 'A2' | 'B1' | 'B2', ...ok: (boolean | null)[]) => ok.map((correct) => ({ level, correct }));
  it('блок сдан при 2 из 3, тест идёт дальше', () => {
    expect(placementProgress([...block('A0', true, false, true)])).toEqual({ stop: false, level: 'A0' });
    expect(placementProgress([...block('A0', true, true, true), ...block('A1', true, true, false)])).toEqual({ stop: false, level: 'A1' });
  });
  it('блок не сдан — остановка; уровень — последний сданный блок', () => {
    expect(placementProgress([...block('A0', true, true, true), ...block('A1', true, true, true), ...block('A2', false, true, null)])).toEqual({ stop: true, level: 'A1' });
    expect(placementProgress([...block('A0', false, null, true)])).toEqual({ stop: true, level: 'A0' });
  });
  it('незаконченный блок — ещё не итог', () => {
    expect(placementProgress([...block('A0', true, true, true), ...block('A1', false, false)])).toEqual({ stop: false, level: 'A0' });
  });
  it('все пять блоков сданы — B2 и конец теста', () => {
    const all = (['A0', 'A1', 'A2', 'B1', 'B2'] as const).flatMap((l) => block(l, true, true, false));
    expect(placementProgress(all)).toEqual({ stop: true, level: 'B2' });
  });
  it('уровень заданий — только A2 и выше', () => {
    expect(studyLevelFor('A0')).toBeNull();
    expect(studyLevelFor('A1')).toBeNull();
    expect(studyLevelFor('A2')).toBe('A2');
    expect(studyLevelFor('B2')).toBe('B2');
  });
});

describe('adaptLevel — автоподстройка', () => {
  const st = (level: 'A2' | 'B1' | 'B2' | null, up = 0, down = 0) => ({ level, up, down });
  it('без уровня или урок не своего уровня — ничего не меняется', () => {
    expect(adaptLevel(st(null), 1, null)).toEqual({ ...st(null), changed: null });
    expect(adaptLevel(st('B1', 2), 1, null)).toEqual({ ...st('B1', 2), changed: null });
  });
  it('три лёгких урока подряд — уровень выше', () => {
    let s = adaptLevel(st('A2'), 0.95, 'A2');
    expect(s).toEqual({ level: 'A2', up: 1, down: 0, changed: null });
    s = adaptLevel(s, 1, 'A2');
    s = adaptLevel(s, 0.9, 'A2');
    expect(s).toEqual({ level: 'B1', up: 0, down: 0, changed: 'up' });
  });
  it('средний результат обнуляет серии', () => {
    expect(adaptLevel(st('B1', 2, 1), 0.7, 'B1')).toEqual({ level: 'B1', up: 0, down: 0, changed: null });
  });
  it('два трудных урока подряд — уровень ниже; с A2 — обычные версии', () => {
    const s = adaptLevel(adaptLevel(st('B1'), 0.4, 'B1'), 0.3, 'B1');
    expect(s).toEqual({ level: 'A2', up: 0, down: 0, changed: 'down' });
    expect(adaptLevel(st('A2', 0, 1), 0.2, 'A2')).toEqual({ level: null, up: 0, down: 0, changed: 'down' });
  });
  it('на B2 выше некуда', () => {
    expect(adaptLevel(st('B2', 2), 1, 'B2')).toEqual({ level: 'B2', up: 0, down: 0, changed: null });
  });
});
