/**
 * Переводы предложений и диктанты собираются из слов-плашек (владелец 2026-11-07: поднимается клавиатура, польские буквы не видно; просьба проверить
 * все тесты приложения). Проверяется на всём содержании базы: у каждого текстового задания клиент получает плашки, а не поле ввода; верный ответ
 * собирается из плашек и принимается сервером; принятые формы клиенту не уходят.
 */
import { afterAll, describe, expect, it } from 'vitest';
import { checkAnswer, normalize, seededRandom, sentenceTiles, tileWords, toPublicItem, TEXT_TYPES, type ExerciseItem, type TextData } from '@polski-go/shared';
import { getEnv, disposeEnv } from './helpers';

afterAll(disposeEnv);

type Row = { id: string; type: ExerciseItem['type']; skill: string; data: string };
async function rows(): Promise<ExerciseItem[]> {
  const { env } = await getEnv();
  const all = (await env.DB.prepare('select id, type, skill, data from exercises').all()).results as Row[];
  return all.map((r) => ({ key: r.id, exerciseId: r.id, type: r.type, skill: r.skill, data: JSON.parse(r.data) }));
}

describe('сборка предложения из плашек в заданиях SENTENCE_TRANSLATION и DICTATION', () => {
  it('у каждого текстового задания курса есть плашки или формы: поля ввода и ряда польских букв не будет нигде', async () => {
    const items = (await rows()).filter((i) => TEXT_TYPES.includes(i.type));
    expect(items.length).toBeGreaterThan(200);
    const typed: string[] = [];
    for (const item of items) {
      const data = toPublicItem(item, seededRandom(3)).data as { tokens?: string[]; options?: string[] };
      const hasChoice = item.type === 'GRAMMAR' ? Array.isArray(data.options) && data.options.length === 4 : Array.isArray(data.tokens) && data.tokens.length >= 4;
      if (!hasChoice) typed.push(`${item.type}: ${JSON.stringify(item.data).slice(0, 90)}`);
    }
    expect(typed, `Остались задания с вводом:\n${typed.join('\n')}`).toEqual([]);
  });

  it('верный ответ собирается из плашек в порядке фразы, и сервер его принимает', async () => {
    const items = (await rows()).filter((i) => i.type === 'SENTENCE_TRANSLATION' || i.type === 'DICTATION');
    expect(items.length).toBe(135);
    for (const item of items) {
      const d = item.data as TextData;
      const tiles = sentenceTiles(d);
      const words = tileWords(d.accepted[0]);
      // слова ответа есть среди плашек (с учётом повторов)
      const pool = [...tiles];
      for (const w of words) {
        const at = pool.indexOf(w);
        expect(at, `${d.accepted[0]}: нет плашки «${w}»`).toBeGreaterThanOrEqual(0);
        pool.splice(at, 1);
      }
      const answer = checkAnswer(item, { text: words.join(' ') });
      expect(answer.correct, d.accepted[0]).toBe(true);
      expect(answer.almost, d.accepted[0]).toBeFalsy();
    }
  });

  it('любой другой принятый вариант, слова которого есть среди плашек, тоже собирается и засчитывается', async () => {
    const items = (await rows()).filter((i) => i.type === 'SENTENCE_TRANSLATION' || i.type === 'DICTATION');
    let buildable = 0;
    for (const item of items) {
      const d = item.data as TextData;
      const tiles = sentenceTiles(d);
      for (const variant of d.accepted.slice(1)) {
        const pool = [...tiles];
        const ok = tileWords(variant).every((w) => {
          const at = pool.indexOf(w);
          if (at < 0) return false;
          pool.splice(at, 1);
          return true;
        });
        if (!ok) continue;
        buildable++;
        expect(checkAnswer(item, { text: tileWords(variant).join(' ') }).correct, variant).toBe(true);
      }
    }
    expect(buildable).toBeGreaterThan(50);
  });

  it('лишние плашки не делают фразу верной: приманка в конце или перестановка слов — неверно', async () => {
    const items = (await rows()).filter((i) => i.type === 'SENTENCE_TRANSLATION' || i.type === 'DICTATION');
    let swapped = 0;
    for (const item of items) {
      const d = item.data as TextData;
      const words = tileWords(d.accepted[0]);
      const extra = sentenceTiles(d).slice(words.length);
      expect(extra.length, d.accepted[0]).toBeGreaterThanOrEqual(1);
      expect(extra.length, d.accepted[0]).toBeLessThanOrEqual(3);
      // Слово из другого принятого варианта («… Maltańskie») делает верной именно эту фразу; любая другая приманка — нет.
      const withExtra = [...words, extra[extra.length - 1]].join(' ');
      const isVariant = d.accepted.some((a) => normalize(a) === normalize(withExtra));
      expect(checkAnswer(item, { text: withExtra }).correct, `${d.accepted[0]} + приманка`).toBe(isVariant);
      if (words.length >= 2 && words[0].toLowerCase() !== words[1].toLowerCase()) {
        const reversed = words.slice().reverse();
        if (!d.accepted.some((a) => tileWords(a).join(' ').toLowerCase() === reversed.join(' ').toLowerCase())) {
          swapped++;
          expect(checkAnswer(item, { text: reversed.join(' ') }).correct, `${d.accepted[0]} наоборот`).toBe(false);
        }
      }
    }
    expect(swapped).toBeGreaterThan(80);
  });

  it('клиент получает перемешанные плашки без принятых ответов; состав не зависит от генератора', async () => {
    const item = (await rows()).find((i) => i.type === 'SENTENCE_TRANSLATION' && (i.data as TextData).accepted.length > 1)!;
    const a = toPublicItem(item, seededRandom(1)).data as { tokens: string[] };
    const b = toPublicItem(item, seededRandom(9)).data as { tokens: string[] };
    expect(a.tokens.slice().sort()).toEqual(b.tokens.slice().sort());
    expect(a.tokens.slice().sort()).toEqual(sentenceTiles(item.data as TextData).slice().sort());
    expect(toPublicItem(item, seededRandom(1)).data).not.toHaveProperty('accepted');
  });

  it('знаки препинания по краям слова отрезаются, внутри слова остаются', () => {
    expect(tileWords('Cześć, do zobaczenia!')).toEqual(['Cześć', 'do', 'zobaczenia']);
    expect(tileWords('Jest 10:00 rano.')).toEqual(['Jest', '10:00', 'rano']);
    expect(tileWords('Mówię po polsku – trochę')).toEqual(['Mówię', 'po', 'polsku', 'trochę']);
  });
});
