/**
 * Банк вопросов бота (вопрос дня и /quiz): картинки сцен, форма вариантов, «не из приложения», длина подписи.
 */
import { existsSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import imageVersions from '../src/bot/image-versions.json';
import { QUIZ_SCENES, quizSceneFile, SCENE_LABELS } from '../src/bot/quiz/scenes';

const PUBLIC_BOT = new URL('../../web/public/bot/', import.meta.url);

describe('картинки вопросов', () => {
  it('16 полноразмерных сцен, у каждой JPG и версия адреса; лишних файлов нет', () => {
    expect(QUIZ_SCENES).toHaveLength(16);
    const versions = imageVersions as Record<string, string>;
    for (const scene of QUIZ_SCENES) {
      const file = quizSceneFile(scene);
      expect(file).toBe(`quiz/${scene}.jpg`);
      expect(existsSync(new URL(file, PUBLIC_BOT)), file).toBe(true);
      expect(versions[file], file).toMatch(/^[0-9a-f]{10}$/);
      for (const lang of ['ru', 'uk', 'en'] as const) expect(SCENE_LABELS[scene][lang].trim().length, `${scene} ${lang}`).toBeGreaterThan(2);
    }
    const files = readdirSync(new URL('quiz/', PUBLIC_BOT)).filter((f) => f.endsWith('.jpg')).sort();
    expect(files).toEqual([...QUIZ_SCENES].map((s) => `${s}.jpg`).sort());
  });

  it('магазины-вырезки (Żabka, Biedronka, Rossmann, InPost, ORLEN) в вопросы не идут', () => {
    for (const cut of ['zabka', 'biedronka', 'rossmann', 'inpost', 'orlen']) expect(QUIZ_SCENES as readonly string[]).not.toContain(cut);
  });
});
