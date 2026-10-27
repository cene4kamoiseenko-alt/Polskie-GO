/**
 * docs/UNFINISHED_ASSETS.md — точный перечень незавершённых ассетов — совпадает с кодом и манифестами:
 * 10 временных фонов городов, 11 недостающих сцен бота, 5 кадров магазинов с Бобеком, слои Бобека этапов etalon-1 и etalon-2.
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

  it('10 фонов городов, 11 сцен бота, 5 кадров магазинов, 18 + 8 слоёв Бобека', () => {
    expect(data.cities.map((c) => c.slug)).toEqual(['katowice', 'zielona-gora', 'szczecin', 'bydgoszcz', 'torun', 'olsztyn', 'lublin', 'rzeszow', 'kielce', 'zakopane']);
    expect(data.botScenes.map((b) => b.scene)).toEqual(['map', 'quests', 'profile', 'help', 'reminder_lesson', 'streak', 'correct_answer', 'quick_question', 'travel_passport', 'lesson_complete', 'neutral_for_uk_pl_en']);
    expect(data.storeScenes.map((s) => s.id).sort()).toEqual(['fuel-orlen', 'parcel-inpost', 'store-biedronka', 'store-rossmann', 'store-zabka']);
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
