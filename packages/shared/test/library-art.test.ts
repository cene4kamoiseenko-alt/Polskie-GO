/**
 * Библиотека картинок (docs/superpowers/specs/2026-11-24-living-missions-design.md, «Какие картинки где»): у каждой записи реестра есть
 * файл канала; темы маршрутов и миссий — по таблице спеки; урок «города» (прогулка, экзамен) — панорама города (null); соседние уроки
 * маршрута — разные картинки; выбор стабилен. «Экзаменационные» egzamin-* (Бобек волнуется) не используются; rozmowa — только «работа».
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LIBRARY_ART, MISSION_CATEGORY_THEME, ROUTE_ICON_THEME, lessonLibraryArt, libraryPool, missionLibraryArt } from '../src/libraryArt';

const CHANNEL = resolve(__dirname, '../../../apps/web/public/channel');

describe('библиотека картинок', () => {
  it('у каждой записи реестра есть картинка канала', () => {
    expect(Object.keys(LIBRARY_ART).length).toBeGreaterThan(40);
    for (const file of Object.keys(LIBRARY_ART)) expect(existsSync(resolve(CHANNEL, `${file}.jpg`)), file).toBe(true);
  });

  it('egzamin-* не используются, rozmowa — только тема «работа»', () => {
    for (const [file, a] of Object.entries(LIBRARY_ART)) {
      expect(file.startsWith('egzamin'), file).toBe(false);
      if (file.startsWith('rozmowa')) expect(a.themes, file).toEqual(['work']);
    }
  });

  it('в каждой теме маршрутов и миссий не меньше двух картинок', () => {
    for (const theme of new Set([...Object.values(ROUTE_ICON_THEME), ...Object.values(MISSION_CATEGORY_THEME), 'general' as const]))
      expect(libraryPool(theme).length, theme).toBeGreaterThanOrEqual(2);
  });

  it('темы маршрутов — по таблице спеки', () => {
    expect(ROUTE_ICON_THEME).toMatchObject({
      shopping: 'shop', basket: 'shop', 'receipt-check': 'shop', office: 'work', transport: 'transport', 'train-ticket': 'transport', tram: 'transport',
      house: 'home', cafe: 'food', food: 'food', dishes: 'food', dialog: 'talk', speech: 'talk', headphones: 'listen', pronunciation: 'speak',
      writing: 'study', 'book-clock': 'study', lessons: 'study', gift: 'celebrate',
    });
    expect(libraryPool('shop')).toContain('sklep');
    expect(libraryPool('transport')).toEqual(expect.arrayContaining(['tramwaj-1', 'tramwaj-2', 'dworzec-1']));
    expect(libraryPool('food')).toEqual(expect.arrayContaining(['kawiarnia', 'pierogi', 'restauracja']));
  });

  it('прогулка по городу, экзамен и неизвестная тема — панорама города', () => {
    for (const icon of ['explore', 'map-pins', 'map', 'achievements', 'unknown-icon', undefined, null]) expect(lessonLibraryArt(icon, 'waw-x', 1), String(icon)).toBeNull();
  });

  it('соседние уроки маршрута — разные картинки своей темы; выбор стабилен', () => {
    const picks = [1, 2, 3, 4, 5, 6].map((i) => lessonLibraryArt('shopping', 'waw-liczby', i)!);
    for (const p of picks) expect(libraryPool('shop')).toContain(p);
    for (let i = 1; i < picks.length; i++) expect(picks[i], `урок ${i + 1}`).not.toBe(picks[i - 1]);
    expect(lessonLibraryArt('shopping', 'waw-liczby', 3)).toBe(picks[2]);
    const firsts = new Set(['waw-liczby', 'wro-sklep', 'krk-zabka', 'gda-sklep', 'kat-targ', 'opo-zakupy'].map((r) => lessonLibraryArt('shopping', r, 1)));
    expect(firsts.size).toBeGreaterThanOrEqual(2);
  });

  it('миссия — картинка темы своей категории; сезонная и неизвестная — общий набор', () => {
    const theme = { shop: 'shop', food: 'food', road: 'transport', transport: 'transport', home: 'home', work: 'work' } as const;
    for (const [category, t] of Object.entries(theme)) expect(libraryPool(t), category).toContain(missionLibraryArt(category, 's'));
    for (const category of ['season', 'xyz']) expect(libraryPool('general'), category).toContain(missionLibraryArt(category, 's'));
  });
});

describe('WebP-копии библиотеки для приложения (scripts/build-library-art.ts)', () => {
  const LIB = resolve(__dirname, '../../../apps/web/src/assets/library');
  it('у каждой записи есть <файл>.webp (≤ 1080 px, ≤ 200 КБ) и <файл>@640.webp', async () => {
    const sharp = (await import('sharp')).default;
    const { statSync } = await import('node:fs');
    for (const file of Object.keys(LIBRARY_ART)) {
      const main = resolve(LIB, `${file}.webp`);
      const small = resolve(LIB, `${file}@640.webp`);
      expect(existsSync(main), main).toBe(true);
      expect(existsSync(small), small).toBe(true);
      expect((await sharp(main).metadata()).width, file).toBeLessThanOrEqual(1080);
      expect((await sharp(small).metadata()).width, file).toBe(640);
      expect(statSync(main).size, file).toBeLessThanOrEqual(200 * 1024);
    }
  });
});
