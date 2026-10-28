/**
 * Реестр растровых сцен миссий (SCENE_ART, docs/SCENE_ART_INVENTORY.md): 5 магазинов из коллажа и 8 кадров владельца 2026-10-28.
 * Сходится с миссиями, файлами и кадром Telegram:
 * стабильные scene_id, файлы заявленного размера и веса, временный статус не выдаётся за финальный, картинка привязана к миссии
 * по slug (Lidl не получает Biedronka), вопрос, где кадр выдаёт ответ, картинку не получает.
 */
import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { MISSION_BACKGROUND_BRIEF, MISSION_SCENE_ART, QUESTION_SCENE_IMAGES, SCENE_ART, SCENE_ART_SMALL } from '@polski-go/shared';
import { MISSIONS, MISSIONS_SOON } from '../src/content/missions';
import { quizImage } from '../src/bot/quiz/engine';
import { QUESTION_BY_ID } from '../src/bot/quiz/questions';
import { pngSize, webpSize } from './image-size';

const scenes = new URL('../../web/src/assets/scenes/', import.meta.url);
const botPublic = new URL('../../web/public/bot/', import.meta.url);
const repo = new URL('../../../', import.meta.url);
const sources = new URL('docs/design/a11/stores/native/', repo);
const doc = readFileSync(new URL('../../../docs/SCENE_ART_INVENTORY.md', import.meta.url), 'utf8');

const STORES = ['fuel-orlen', 'parcel-inpost', 'store-biedronka', 'store-rossmann', 'store-zabka'];
const OWNER_PACK = ['bakery-pierniki', 'clinic-registration', 'flat-keys', 'milk-bar', 'office-first-day', 'station-pkp', 'street-zapiekanki', 'tram-stop'];
const IDS = [...STORES, ...OWNER_PACK].sort();

describe('Сцены миссий (магазины, InPost, ORLEN и пакет владельца)', () => {
  it('scene_id стабильны, по одному на бренд, без повторов файлов', () => {
    expect(Object.keys(SCENE_ART).sort()).toEqual(IDS);
    for (const [key, art] of Object.entries(SCENE_ART)) expect(art.id, key).toBe(key);
    expect(new Set(Object.values(SCENE_ART).map((a) => a.file)).size).toBe(IDS.length);
  });

  it('основной файл 1440×720 и @640 640×320, вес в бюджете, исходник хранится отдельно', () => {
    for (const art of Object.values(SCENE_ART)) {
      const main = readFileSync(new URL(`${art.file}.webp`, scenes));
      expect(webpSize(main), art.id).toEqual({ width: art.width, height: art.height });
      expect(main.length, `${art.file}.webp`).toBeLessThanOrEqual(220 * 1024);
      const small = readFileSync(new URL(`${art.file}@${SCENE_ART_SMALL}.webp`, scenes));
      expect(webpSize(small), `${art.file}@${SCENE_ART_SMALL}`).toEqual({ width: SCENE_ART_SMALL, height: SCENE_ART_SMALL / 2 });
      expect(small.length, `${art.file}@${SCENE_ART_SMALL}.webp`).toBeLessThanOrEqual(70 * 1024);
      // Кадр 2:1: cover не растягивает его, а обрезает.
      expect(art.width / art.height).toBe(2);
      if (art.source) {
        // Оригинал целиком, вырезка 2:1 — от art.source.top до top + native[1].
        const original = webpSize(readFileSync(new URL(art.source.file, repo)));
        expect(original.width, `${art.id} оригинал`).toBe(art.native[0]);
        expect(art.native[0], art.id).toBe(art.native[1] * 2);
        expect(art.source.top + art.native[1], `${art.id}: вырезка внутри оригинала`).toBeLessThanOrEqual(original.height);
      } else {
        const source = readFileSync(new URL(`${art.file}_source_native_2x1.png`, sources));
        expect(pngSize(source), `${art.id} источник`).toEqual({ width: art.native[0], height: art.native[1] });
      }
    }
  });

  it('временный статус честный: кадр с Бобеком внутри или увеличенный из малой вырезки не final', () => {
    for (const art of Object.values(SCENE_ART)) {
      if (art.bakedBobek || art.native[0] < art.width) expect(art.status, art.id).toBe('interim');
      expect(art.focus, art.id).toMatch(/^\d{1,3}% \d{1,3}%$/);
    }
    // Сегодня все — временные: мастера без Бобека ещё не нарисованы.
    expect(Object.values(SCENE_ART).every((a) => a.bakedBobek && a.status === 'interim')).toBe(true);
    // Магазины увеличены из маленьких вырезок коллажа; кадры владельца только уменьшены.
    for (const id of STORES) expect(SCENE_ART[id].native[0], id).toBeLessThan(SCENE_ART[id].width);
    for (const id of OWNER_PACK) expect(SCENE_ART[id].native[0], id).toBeGreaterThanOrEqual(SCENE_ART[id].width);
  });

  it('картинка привязана к существующей миссии по slug и совпадает с её SVG-сценой', () => {
    const pairs = Object.values(SCENE_ART).flatMap((a) => a.missions.map((m) => [a, m] as const));
    expect(pairs.map(([, m]) => m).sort()).toEqual([
      'bar-mleczny', 'biedronka-breakfast', 'doctor-appointment', 'first-tram', 'first-workday', 'kazimierz-zapiekanka', 'landlord',
      'orlen-pump', 'paczkomat', 'rossmann-basics', 'torun-bakery', 'train-wroclaw', 'zabka-first-order',
    ]);
    for (const [art, slug] of pairs) {
      const mission = MISSIONS.find((m) => m.slug === slug);
      expect(mission, `${art.id}: миссии ${slug} нет`).toBeDefined();
      expect(mission!.scene, `${slug}: SVG-сцена`).toBe(art.fallbackScene);
      expect(MISSION_SCENE_ART[slug]).toBe(art.id);
    }
    // Кофе на ORLEN — другая дія (стойка Stop Cafe), кадр с колонкой к ней не подходит: остаётся SVG-сцена.
    expect(MISSION_SCENE_ART['orlen-coffee']).toBeUndefined();
    // Lidl идёт в той же SVG-сцене, что и Biedronka, но картинки магазина с другим брендом не получает.
    expect(MISSIONS.find((m) => m.slug === 'lidl-list')!.scene).toBe('supermarket');
    expect(MISSION_SCENE_ART['lidl-list']).toBeUndefined();
    // Офис с рукопожатием — первый рабочий день, не окошко urzędu: PESEL остаётся со своей SVG-сценой.
    expect(MISSION_SCENE_ART['urzad-pesel']).toBeUndefined();
    // На кадре flat-keys ключи передаёт женщина — в миссии хозяйка, а не хозяин.
    expect(MISSIONS.find((m) => m.slug === 'landlord')!.npc.name).toBe('Pani Marta');
  });

  it('кадров магазинов в Telegram нет: временные вырезки увеличены и отклоняются проверкой файлов; русский сохраняет доску категории', () => {
    expect(Object.values(SCENE_ART).filter((a) => a.telegram)).toEqual([]);
    expect(QUESTION_SCENE_IMAGES).toEqual({});
    expect(existsSync(new URL('scenes/stores/', botPublic)), 'scenes/stores/ снята с публикации').toBe(false);
    const loyalty = QUESTION_BY_ID.get('shop-loyalty')!;
    expect(quizImage(loyalty, 'ru')).toBe('scenes/ru/shopping.jpg');
    for (const lang of ['uk', 'en'] as const) expect(quizImage(loyalty, lang), lang).toBeNull();
    // Кадр InPost выдал бы ответ «в постамате».
    for (const lang of ['ru', 'uk', 'en'] as const) expect(quizImage(QUESTION_BY_ID.get('home-paczkomat')!, lang)).toBeNull();
  });

  it('для каждой из 17 миссий (14 + 3 сцены Premium) описан фон без Бобека и действие игрока', () => {
    const slugs = [...MISSIONS.map((m) => m.slug), ...MISSIONS_SOON.map((m) => m.slug)].sort();
    expect(slugs).toHaveLength(17);
    expect(Object.keys(MISSION_BACKGROUND_BRIEF).sort()).toEqual(slugs);
    for (const [slug, b] of Object.entries(MISSION_BACKGROUND_BRIEF)) {
      expect(b.action.length, slug).toBeGreaterThan(10);
      expect(b.background.length, slug).toBeGreaterThan(40);
      expect(b.background, `${slug}: Бобек не рисуется в фоне`).not.toMatch(/Бобек|бобр/i);
    }
    expect(MISSION_BACKGROUND_BRIEF['urzad-pesel'].background).toMatch(/окошко/);
  });

  it('документ инвентаря описывает каждую сцену со статусом interim и перечисляет дефекты', () => {
    for (const art of Object.values(SCENE_ART)) {
      expect(doc, art.id).toMatch(new RegExp(`\\| \`${art.id}\` \\|[^\\n]*\\| ${art.status} \\|`));
      for (const m of art.missions) expect(doc, `${art.id}: ${m}`).toContain(`\`${m}\``);
    }
    expect(doc).toContain('Rossmann');
    expect(doc).toContain('HIGIEŃYIE');
    expect(doc).toContain('без Бобека');
  });
});
