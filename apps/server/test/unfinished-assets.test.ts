/**
 * docs/UNFINISHED_ASSETS.md — точный перечень незавершённых ассетов — совпадает с кодом и манифестами:
 * 2 временных фона городов, 5 недостающих сцен бота, 21 кадр миссий с Бобеком внутри, слои Бобека этапов etalon-1 и etalon-2.
 * Когда мастер появится и статус в CITY_ART / SCENE_ART / манифесте изменится, документ нужно пересобрать:
 *   node --import tsx scripts/unfinished-assets.ts
 */
import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildUnfinishedAssets, unfinishedAssets } from '../../../scripts/lib/unfinished-assets';

const root = new URL('../../../', import.meta.url).pathname.replace(/\/$/, '');
const botPublic = `${root}/apps/web/public/bot`;

describe('перечень незавершённых ассетов', () => {
  const data = unfinishedAssets(root);

  it('2 фона городов, 5 сцен бота, 21 кадр миссий с Бобеком, 18 + 8 слоёв Бобека', () => {
    expect(data.cities.map((c) => c.slug)).toEqual(['rzeszow', 'zakopane']);
    expect(data.botScenes.map((b) => b.scene)).toEqual(['map', 'correct_answer', 'quick_question', 'travel_passport', 'lesson_complete']);
    // 14 + 6 сцен Premium + 9 миссий пропуска месяца (ADR-011).
    expect(data.missions.map((m) => m.slug)).toHaveLength(29);
    expect(data.storeScenes.map((s) => s.id).sort()).toEqual([
      'bakery-pierniki', 'clinic-registration', 'cukiernia-rogale', 'flat-keys', 'fuel-orlen', 'lotnisko-lot', 'milk-bar', 'office-first-day', 'parcel-inpost',
      'pierogarnia', 'recepcja-narty', 'station-pkp', 'stop-cafe', 'store-biedronka', 'store-lidl', 'store-rossmann', 'store-zabka', 'street-zapiekanki', 'tram-stop', 'urzad-okienko', 'warszawa-starowka',
    ]);
    expect(data.layers.map((l) => l.missing.length)).toEqual([18, 8]);
  });

  it('у каждого временного фона есть описание, что рисовать, и путь мастера; у каждой сцены бота — описание и файлы', () => {
    for (const c of data.cities) {
      expect(c.scene.length, c.slug).toBeGreaterThan(30);
      expect(c.master, c.slug).toMatch(/^docs\/design\/a10\/cities\/city-.+\.webp$/);
    }
    for (const b of data.botScenes) {
      expect(b.needed_files.length, b.scene).toBeGreaterThan(0);
      expect(b.description.length, b.scene).toBeGreaterThan(30);
    }
  });

  it('недостающие файлы сцен бота действительно отсутствуют в публичной папке (появился файл — обновить манифест и документ)', () => {
    for (const b of data.botScenes) for (const f of b.needed_files) expect(existsSync(`${botPublic}/${f}`), `${f} уже есть: уберите сцену из blocked_scenes`).toBe(false);
  });

  it('документ совпадает с кодом и манифестами', () => {
    const doc = readFileSync(`${root}/docs/UNFINISHED_ASSETS.md`, 'utf8');
    expect(doc, 'docs/UNFINISHED_ASSETS.md устарел: node --import tsx scripts/unfinished-assets.ts').toBe(buildUnfinishedAssets(root) + '\n');
  });
});
