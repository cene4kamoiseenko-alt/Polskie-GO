/**
 * Входной тест: какие города открываются и какой становится текущим (владелец 2026-11-10: «как у игрока первым городом открылась Лодзь?»).
 * Правило (services/sessions.ts → applyPlacement): от 80 % — Варшава, Лодзь, Краков (текущий — Краков); от 50 % — Варшава и Лодзь (текущая — Лодзь);
 * ниже — только Варшава. На итоговом экране города называются по-человечески («Warszawa, Łódź»), а не кодами («warszawa, lodz»).
 */
import { afterAll, describe, expect, it } from 'vitest';
import { resetRateLimits } from '../src/hono';
import { disposeEnv, login, playSession } from './helpers';

afterAll(disposeEnv);

type City = { id: string; slug: string; unlocked: boolean };
type Journey = { cities: City[]; currentCityId: string | null };

async function takePlacement(wrong: number) {
  resetRateLimits();
  const u = await login();
  await u.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A1', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: null });
  const exams = (await u.call('GET', '/api/exams')).body.exams as { id: string; kind: string }[];
  const placement = exams.find((e) => e.kind === 'PLACEMENT')!;
  const created = await u.call('POST', '/api/sessions', { lessonId: placement.id });
  expect(created.status).toBe(200);
  const finished = await playSession(u.call, created.body.sessionId, { wrong });
  expect(finished.status).toBe(200);
  const journey = (await u.call('GET', '/api/journey')).body as Journey;
  return {
    placement: finished.body.placement as { level: string; unlocked: string[]; cities: string[] },
    current: journey.cities.find((c) => c.id === journey.currentCityId)?.slug,
    open: journey.cities.filter((c) => c.unlocked).map((c) => c.slug),
  };
}

describe('входной тест: города по результату', () => {
  it('новый игрок без теста начинает с Варшавы', async () => {
    const u = await login();
    const j = (await u.call('GET', '/api/journey')).body as Journey;
    expect(j.cities.find((c) => c.id === j.currentCityId)?.slug).toBe('warszawa');
    expect(j.cities.filter((c) => c.unlocked).map((c) => c.slug)).toEqual(['warszawa']);
  });

  it('90 % (1 ошибка): три города, текущий — Краков', async () => {
    const r = await takePlacement(1);
    expect(r.open).toEqual(['warszawa', 'lodz', 'krakow']);
    expect(r.current).toBe('krakow');
    expect(r.placement.level).toBe('A1');
    expect(r.placement.cities).toEqual(['Warszawa', 'Łódź', 'Kraków']);
  });

  it('70 % (3 ошибки): Варшава и Лодзь, текущая — Лодзь; на экране «Warszawa, Łódź», а не коды', async () => {
    const r = await takePlacement(3);
    expect(r.open).toEqual(['warszawa', 'lodz']);
    expect(r.current).toBe('lodz');
    expect(r.placement.unlocked).toEqual(['warszawa', 'lodz']);
    expect(r.placement.cities).toEqual(['Warszawa', 'Łódź']);
    expect(r.placement.cities.join(', ')).not.toMatch(/lodz|warszawa/);
  });

  it('40 % (6 ошибок): только Варшава', async () => {
    const r = await takePlacement(6);
    expect(r.open).toEqual(['warszawa']);
    expect(r.current).toBe('warszawa');
    expect(r.placement.cities).toEqual(['Warszawa']);
  });
});
