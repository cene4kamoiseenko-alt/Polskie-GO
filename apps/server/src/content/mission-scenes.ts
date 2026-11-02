/**
 * Миссии на ~10 минут (владелец 2026-11-02: «все обычные миссии хотя бы по 10 минут с интересными диалогами; Анджейки и 11 ноября тоже увеличить»).
 * Каждой обычной миссии и трём миссиям пропуска «Ноябрь в Познани» дописывается вторая сцена (mission-scenes-a.ts, mission-scenes-b.ts):
 * шаги В КОНЕЦ (начатые прохождения не сбиваются), новая цель, 10 минут и чуть большая награда. Миссии хранятся в коде, сид их не трогает.
 */
import type { Mission } from './missions';
import { SCENES_A } from './mission-scenes-a';
import { SCENES_B } from './mission-scenes-b';

export const MISSION_SCENES = { ...SCENES_A, ...SCENES_B };
/** Длительность миссии со второй сценой. */
export const LONG_MISSION_MINUTES = 10;

/** Дописать вторые сцены: шаги в конец, цель, 10 минут, +25 XP и +10 Złotki за удвоенную длину. */
export function withSecondScenes(list: Mission[]): Mission[] {
  return list.map((m) => {
    const sc = MISSION_SCENES[m.slug as keyof typeof MISSION_SCENES];
    if (!sc) return m;
    return { ...m, goal: sc.goal, steps: [...m.steps, ...sc.steps], minutes: LONG_MISSION_MINUTES, xp: m.xp + 25, zlotki: m.zlotki + 10 };
  });
}
