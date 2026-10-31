/**
 * Иллюстрированная карта (ADR-012, packages/shared/src/mapArt.ts): кнопки-зоны поверх живописной картинки 941×1068.
 * Сходится с картинкой, с разметкой пакета владельца (docs/design/map-v17/cities.json) и с настоящим маршрутом (CITIES):
 * каждая зона внутри картинки, зоны не перекрываются, точка художника попадает в свою зону, каждый город приложения есть на карте
 * ровно один раз, точка без этапа (Sopot — убран из маршрута) не выдаётся за город, файл карты в бюджете веса.
 */
import { readFileSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { MAP_ART, MAP_PACK_ALIASES, MAP_SPOTS, mapHitRect, mapSpotForCity, mapStarPoint, type MapRect } from '@polski-go/shared';
import { CITIES, REMOVED_CITIES } from '../src/content/cities';
import { webpSize } from './image-size';

const repo = new URL('../../../', import.meta.url);
const pack = JSON.parse(readFileSync(new URL('docs/design/map-v17/cities.json', repo), 'utf8')) as {
  image_width: number; image_height: number; cities: { id: string; label: string; image_x: number; image_y: number }[];
};
const spots = Object.entries(MAP_SPOTS);
const inside = ([x0, y0, x1, y1]: MapRect, x: number, y: number) => x >= x0 && x <= x1 && y >= y0 && y <= y1;
const overlap = (a: MapRect, b: MapRect) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];

describe('иллюстрированная карта: зоны городов', () => {
  it('картинка пакета той же величины; файл в приложении — WebP 941×1068 не больше 220 КБ', () => {
    expect([pack.image_width, pack.image_height]).toEqual([MAP_ART.width, MAP_ART.height]);
    const file = new URL('apps/web/src/assets/map/poland-map.webp', repo);
    expect(webpSize(readFileSync(file))).toEqual({ width: MAP_ART.width, height: MAP_ART.height });
    expect(statSync(file).size).toBeLessThanOrEqual(220 * 1024);
    expect(statSync(new URL(MAP_ART.source, repo)).size).toBeGreaterThan(0);
  });

  it('каждая зона и табличка внутри картинки, табличка внутри своей зоны, зона не меньше 44 px на стартовом масштабе 360 px (560 px картинки на экран)', () => {
    for (const [key, s] of spots) {
      const hit = mapHitRect(s);
      expect(hit[0], key).toBeGreaterThanOrEqual(0);
      expect(hit[1], key).toBeGreaterThanOrEqual(0);
      expect(hit[2], key).toBeLessThanOrEqual(MAP_ART.width);
      expect(hit[3], key).toBeLessThanOrEqual(MAP_ART.height);
      expect(inside(hit, s.pill[0], s.pill[1]) && inside(hit, s.pill[2], s.pill[3]), key).toBe(true);
      expect(inside(hit, ...mapStarPoint(s)), `${key}: звезда в зоне`).toBe(true);
      expect(Math.min(hit[2] - hit[0], hit[3] - hit[1]) * (360 / 560), key).toBeGreaterThanOrEqual(44);
    }
  });

  it('зоны городов не перекрываются: нажатие не может попасть в соседний город', () => {
    for (let i = 0; i < spots.length; i++) {
      for (let j = i + 1; j < spots.length; j++) {
        expect(overlap(mapHitRect(spots[i][1]), mapHitRect(spots[j][1])), `${spots[i][0]} × ${spots[j][0]}`).toBe(false);
      }
    }
  });

  it('20 точек пакета: каждая попадает в свою зону (разметка художника и рамки таблички согласны), алиасы id объявлены', () => {
    expect(pack.cities).toHaveLength(20);
    for (const p of pack.cities) {
      const key = MAP_PACK_ALIASES[p.id] ?? p.id;
      const s = MAP_SPOTS[key];
      expect(s, p.id).toBeDefined();
      expect(s.pack, p.id).toEqual({ id: p.id, x: p.image_x, y: p.image_y });
      expect(s.label, p.id).toBe(p.label);
      expect(s.baked).toBe(true);
      expect(inside(mapHitRect(s), p.image_x, p.image_y), `${p.id}: точка пакета в зоне`).toBe(true);
    }
    expect(spots.filter(([, s]) => s.baked)).toHaveLength(20);
  });

  it('каждый город маршрута есть на карте ровно один раз; лишних городов нет', () => {
    for (const c of CITIES) {
      expect(spots.filter(([, s]) => s.city === c.slug), c.slug).toHaveLength(1);
      expect(mapSpotForCity(c.slug)?.label, c.slug).toBe(c.namePl);
    }
    const slugs = new Set(CITIES.map((c) => c.slug));
    for (const [key, s] of spots) if (s.city) expect(slugs.has(s.city), key).toBe(true);
  });

  it('Sopot нарисован, но этапа нет (убран из маршрута): city null и пометка, а не фальшивый город', () => {
    expect(REMOVED_CITIES).toContain('sopot');
    expect(MAP_SPOTS.sopot.city).toBeNull();
    expect(MAP_SPOTS.sopot.note).toBe('not_in_route');
    expect(spots.filter(([, s]) => !s.city).map(([k]) => k)).toEqual(['sopot']);
  });

  it('Закопане (нет на картинке) — свой маркер вне нарисованных табличек и вне впечённого Бобека', () => {
    const z = MAP_SPOTS.zakopane;
    expect(z.baked).toBe(false);
    for (const [key, s] of spots) if (key !== 'zakopane') expect(overlap(z.pill, s.pill), key).toBe(false);
    expect(overlap(mapHitRect(z), MAP_ART.bakedBobek)).toBe(false);
  });
});
