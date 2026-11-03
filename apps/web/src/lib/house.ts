/**
 * Домик Бобека — общее для экрана домика и карточки на главной (2026-11-03, docs/HOUSING.md).
 * Сцена отражает день игрока: ночью Бобек спит, цель дня выполнена — пьёт чай, иначе ждёт урок за работой (если сцены «работает» нет — читает).
 */
import type { TKey } from '../i18n';
import { api } from './api';
import { artImage } from './assets';

export type HouseScene = 'read' | 'sleep' | 'work' | 'tea';

export const HOMES: Record<string, { pl: string; desc: TKey }> = {
  'housing-opole': { pl: 'Pokój w Opolu', desc: 'housing_opole_d' },
  'housing-lodz': { pl: 'Kawalerka w Łodzi', desc: 'housing_lodz_d' },
  'housing-krakow': { pl: 'Mieszkanie w Krakowie', desc: 'housing_krakow_d' },
  'housing-warszawa': { pl: 'Apartament w Warszawie', desc: 'housing_warszawa_d' },
};

/** Состояние дня с сервера (GET /api/house, services/house.ts). */
export type HouseState = {
  home: string;
  bonus: number;
  goalDone: boolean;
  claimed: boolean;
  xp: number;
  goalXp: number;
  next: { slug: string; price: number; bonus: number } | null;
  bonuses: Record<string, number>;
};
export const houseQuery = { queryKey: ['house'], queryFn: () => api<HouseState>('/house'), staleTime: 30_000 };

/** Картинка сцены квартиры или null, если файла нет (`housing-opole` + `read` → `housing-opole-read`). */
export const houseRoom = (slug: string, scene: HouseScene) => artImage('housing', HOMES[slug] ? { file: `${slug}-${scene}`, width: 1200 } : undefined);

export const isNight = (hour = new Date().getHours()) => hour >= 22 || hour < 6;

/** Сцена по состоянию дня; если у квартиры такой сцены нет — читает. */
export function stateScene(slug: string, st: Pick<HouseState, 'goalDone'> | undefined, hour = new Date().getHours()): HouseScene {
  const order: HouseScene[] = isNight(hour) ? ['sleep', 'read'] : st?.goalDone ? ['tea', 'read'] : ['work', 'read'];
  return order.find((s) => houseRoom(slug, s)) ?? 'read';
}

/** 2500 → «2 500» (пробел как разделитель разрядов в любом языке интерфейса). */
export const num = (n: number) => n.toLocaleString('en-US').replace(/,/g, ' ');
