/**
 * Картинки сезонов пропуска (присланы 2026-11-07): каждый сезон — один мастер 1536×1024 (docs/design/v21/seasons), из него обложка 16:9 и кадр миссии 2:1
 * (scripts/build-season-art.mjs). Файл на JS, а не TS: тест читает код веба (import.meta.glob), который серверный tsc не проверяет, как и asset-selection.test.js. Кадр привязан к миссиям сезона, которым подходит по смыслу (apps/web/src/lib/screenArt.ts, SEASON_FRAMES), и служит им
 * фоном: Бобек на кадре уже нарисован, второй поверх не показывается.
 */
import { readFileSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SEASONS } from '../src/content/seasons';
import { missionBySlug } from '../src/content/missions';
import { passArt, passMissionScene } from '../../web/src/lib/screenArt';
import { passSeasonCover } from '../../web/src/lib/assets';
import { webpSize } from './image-size';

const repo = new URL('../../../', import.meta.url);
const asset = (name) => new URL(`apps/web/src/assets/pass/${name}.webp`, repo);
const kb = (name) => statSync(asset(name)).size / 1024;

/** Сезон → миссии, которым картинка подходит по смыслу. Остальные миссии сезона кадра не имеют. */
const BOUND = {
  swieta: ['jarmark-oscypek', 'wigilia-kolacja', 'sylwester-impreza'],
  karnawal: ['paczki-zamowienie', 'trzech-kroli'],
  walentynki: ['walentynki-kwiaty', 'walentynki-kolacja', 'most-tumski'],
  wielkanoc: ['palma-pisanki', 'swieconka', 'smigus-dyngus'],
  wiosna: ['rower-miejski'],
  majowka: ['majowka-domek', 'grill-jezioro'],
  wianki: ['wianki-wisla'],
};
/** Миссии новых сезонов, которым присланные картинки не подходят: у них остаётся прежняя сцена, пока не нарисуют отдельные кадры. */
const WITHOUT_FRAME = ['dzien-babci', 'prima-aprilis', 'dzialka', 'trzeci-maja', 'dzien-ojca', 'wakacje-pociag'];

describe('картинки сезонов: файлы', () => {
  for (const slug of Object.keys(BOUND)) {
    it(`«${slug}»: мастер 1536×1024, кадр 2:1 (1400×700 и @640) в бюджете веса`, () => {
      const master = new URL(`docs/design/v21/seasons/${slug}.webp`, repo);
      expect(webpSize(readFileSync(master))).toEqual({ width: 1536, height: 1024 });
      expect(webpSize(readFileSync(asset(`scene-${slug}`)))).toEqual({ width: 1400, height: 700 });
      expect(webpSize(readFileSync(asset(`scene-${slug}@640`)))).toEqual({ width: 640, height: 320 });
      expect(kb(`scene-${slug}`)).toBeLessThan(300);
      expect(kb(`scene-${slug}@640`)).toBeLessThan(100);
    });
  }

  for (const slug of ['karnawal', 'walentynki', 'wielkanoc', 'wiosna', 'majowka', 'wianki']) {
    it(`«${slug}»: обложка 16:9 (1200×675 и @640 640×360)`, () => {
      expect(webpSize(readFileSync(asset(`season-${slug}`)))).toEqual({ width: 1200, height: 675 });
      expect(webpSize(readFileSync(asset(`season-${slug}@640`)))).toEqual({ width: 640, height: 360 });
      expect(kb(`season-${slug}`)).toBeLessThan(300);
      expect(kb(`season-${slug}@640`)).toBeLessThan(100);
    });
  }
});

describe('картинки сезонов: привязка к миссиям', () => {
  it('у каждого сезона пропуска есть обложка (картинка) — прежние три и шесть новых', () => {
    for (const s of SEASONS) {
      const cover = passSeasonCover(s.slug);
      expect(cover, s.slug).not.toBeNull();
      expect(cover.src, s.slug).toBeTruthy();
    }
  });

  it('кадр привязан только к настоящим миссиям своего сезона; он же фон миссии (Бобек уже на кадре)', () => {
    for (const [season, missions] of Object.entries(BOUND)) {
      const own = SEASONS.find((s) => s.slug === season);
      for (const slug of missions) {
        expect(missionBySlug(slug), slug).toBeTruthy();
        expect(own.missions, `${slug} не в сезоне ${season}`).toContain(slug);
        expect(passArt(slug), slug).not.toBeNull();
        expect(passArt(slug).src, slug).toContain(`scene-${season}`);
        expect(passMissionScene(slug), slug).not.toBeNull();
      }
    }
  });

  it('миссии без подходящего кадра остаются со своей сценой; вместе с привязанными это все 21 миссия сезонов декабрь–июнь', () => {
    for (const slug of WITHOUT_FRAME) {
      expect(missionBySlug(slug), slug).toBeTruthy();
      expect(passArt(slug), slug).toBeNull();
      expect(passMissionScene(slug), slug).toBeNull();
    }
    const newSeasons = SEASONS.filter((s) => s.slug in BOUND);
    const all = newSeasons.flatMap((s) => s.missions);
    expect(all).toHaveLength(21);
    expect([...Object.values(BOUND).flat(), ...WITHOUT_FRAME].sort()).toEqual([...all].sort());
  });
});
