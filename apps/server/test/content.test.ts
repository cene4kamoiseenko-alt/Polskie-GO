import { describe, expect, it } from 'vitest';
import { checkAnswer, EXERCISE_TYPES, spreadByType, type ExerciseItem, type OrderData, type ChoiceData } from '@polski-go/shared';
import { CITY_CONTENT } from '../src/content/seed';
import { PLACEMENT, EXAM_A1 } from '../src/content/exams';
import { VOCAB } from '../src/content/vocab';
import { STORY_QUESTS } from '../src/content/gamification';
import { correctAnswers } from './helpers';

const lessons = [...CITY_CONTENT.flatMap((c) => c.routes.flatMap((r) => r.lessons)), PLACEMENT, EXAM_A1];

describe('Навчальний контент', () => {
  it('кожен урок має 8–20 вправ (місії й іспити до 30) і пояснення трьома мовами', () => {
    for (const l of lessons) {
      const long = l.slug.endsWith('-misja') || l.kind === 'BOSS' || l.kind === 'EXAM' || l.kind === 'PLACEMENT';
      expect(l.exercises.length, l.slug).toBeGreaterThanOrEqual(8);
      expect(l.exercises.length, l.slug).toBeLessThanOrEqual(long ? 30 : 20);
      expect(l.explanation.uk && l.explanation.ru && l.explanation.en, l.slug).toBeTruthy();
    }
  });

  it('усі слова уроків є у словнику, слова словника унікальні', () => {
    const keys = new Set(VOCAB.map((v) => v.pl));
    for (const l of lessons) for (const w of l.words) expect(keys.has(w), `${l.slug}: ${w}`).toBe(true);
    expect(new Set(VOCAB.map((v) => `${v.pl}|${v.pos}`)).size).toBe(VOCAB.length);
  });

  it('кожна вправа коректна: правильна відповідь проходить перевірку', () => {
    let n = 0;
    for (const l of lessons) {
      for (const [i, ex] of l.exercises.entries()) {
        const item = { key: `${l.slug}#${i}`, ...ex } as ExerciseItem;
        expect(EXERCISE_TYPES).toContain(item.type);
        const answers = correctAnswers(item);
        expect(answers.length, item.key).toBeGreaterThan(0);
        const results = answers.map((a) => checkAnswer(item, a as never));
        expect(results.every((r) => r.correct), `${item.key} ${item.type}`).toBe(true);
        expect(results.at(-1)!.done, item.key).toBe(true);
        if ('options' in item.data && Array.isArray((item.data as ChoiceData).options)) {
          const texts = (item.data as ChoiceData).options.map((o) => JSON.stringify(o.text));
          expect(new Set(texts).size, `${item.key}: дублікати варіантів`).toBe(texts.length);
        }
        if (item.type === 'BUILD_SENTENCE' || item.type === 'WORD_ORDER') {
          const d = item.data as OrderData;
          const pool = [...d.tokens];
          for (const t of d.answer) {
            const idx = pool.indexOf(t);
            expect(idx, `${item.key}: немає плитки ${t}`).toBeGreaterThanOrEqual(0);
            pool.splice(idx, 1);
          }
        }
        n++;
      }
    }
    expect(n).toBeGreaterThan(200);
  });

  it('сюжетні квести: усі переходи ведуть до існуючих вузлів і є правильний вибір', () => {
    for (const q of STORY_QUESTS) {
      for (const st of q.stages!) {
        expect(st.nodes[st.start], q.slug).toBeTruthy();
        for (const [id, node] of Object.entries(st.nodes)) {
          if (node.next) expect(st.nodes[node.next], `${q.slug}:${id}`).toBeTruthy();
          for (const c of node.choices ?? []) if (c.next) expect(st.nodes[c.next], `${q.slug}:${id}`).toBeTruthy();
          if (node.choices) expect(node.choices.some((c) => c.ok), `${q.slug}:${id}`).toBe(true);
          expect(!!(node.choices || node.next || node.end), `${q.slug}:${id} — глухий кут`).toBe(true);
        }
      }
    }
  });
});

import { SLANG } from '../src/content/slang';

describe('Żywy polski', () => {
  it('усі обовʼязкові вирази є, кожен має значення, реєстр, ситуацію, діалог і нейтральну альтернативу трьома мовами', () => {
    const required = ['Siema!', 'Elo!', 'Nara!', 'Ziomek', 'Kumpel', 'Ale sztos!', 'Zarąbiście!', 'Masakra!', 'Ale beka!', 'Ale przypał!', 'Mam wywalone', 'Nie ogarniam', 'Ogarnij się!', 'Daj spokój', 'Nie spinaj się', 'Wyluzuj', 'Co ty gadasz?!', 'Serio?', 'Bez kitu!', 'Nie ma lipy', 'Spoko', 'Luz', 'Co tam?', 'Trzymaj się!', 'Lecę!', 'Ogarniesz to?'];
    const pls = SLANG.map((x) => x.pl);
    for (const r of required) expect(pls, r).toContain(r);
    expect(new Set(SLANG.map((x) => x.id)).size).toBe(SLANG.length);
    for (const x of SLANG) {
      for (const f of [x.meaning, x.tone, x.when, x.dialogue.tr, x.neutral.tr]) expect(f.uk && f.ru && f.en, x.id).toBeTruthy();
      expect(x.dialogue.a && x.dialogue.b && x.neutral.pl, x.id).toBeTruthy();
      expect(['casual', 'slang', 'rude']).toContain(x.register);
    }
    // Грубі вирази позначені саме так.
    expect(SLANG.find((x) => x.id === 'mam-wywalone')!.register).toBe('rude');
    for (const id of ['dzban', 'spadaj']) expect(SLANG.find((x) => x.id === id)!.register, id).toBe('rude');
  });

  it('розмовника вистачає на кожну групу, а нейтральні відповідники не повторюються (тренажер не дає двох однакових варіантів)', () => {
    expect(SLANG.length).toBeGreaterThanOrEqual(50);
    for (const g of new Set(SLANG.map((x) => x.group))) expect(SLANG.filter((x) => x.group === g).length, g).toBeGreaterThanOrEqual(5);
    const neutral = SLANG.map((x) => x.neutral.pl.toLowerCase());
    expect(new Set(neutral).size).toBe(neutral.length);
    const pls = SLANG.map((x) => x.pl.toLowerCase());
    expect(new Set(pls).size).toBe(pls.length);
    // Кирилиця не потрапляє в польський текст.
    for (const x of SLANG) for (const pl of [x.pl, x.dialogue.a, x.dialogue.b, x.neutral.pl]) expect(pl, x.id).not.toMatch(/[а-яіїєґё]/i);
  });
});

// Локації 3.0 (урок 15–20 завдань, місія 20–30, шість локацій Варшави) замінено стандартом міста 2026-10-28:
// 8 уроків та іспит по 12 завдань — city-standard.test.ts.
describe('Міста', () => {
  it('Варшава: знайомство, числа, вокзал і квитки, іспит', () => {
    const WARSZAWA = CITY_CONTENT.find((c) => c.city === 'warszawa')!.routes;
    expect(WARSZAWA.map((r) => r.slug)).toEqual(['waw-powitania', 'waw-liczby', 'waw-przedstawianie', 'waw-egzamin']);
  });

  it('у місті немає однакових завдань', () => {
    for (const c of CITY_CONTENT) {
      const seen = new Map<string, string>();
      for (const l of c.routes.flatMap((r) => r.lessons)) {
        for (const ex of l.exercises) {
          if (ex.type === 'MATCH_PAIRS') continue; // ідентифікатори пар унікальні, порівнюємо лише решту
          const sig = `${ex.type}|${JSON.stringify(ex.data)}`;
          expect(seen.get(sig), `${l.slug} повторює ${seen.get(sig)}: ${sig.slice(0, 120)}`).toBeUndefined();
          seen.set(sig, l.slug);
        }
      }
    }
  });
});

import { buildSeedSql } from '../src/content/seed';
import { TEXT_FIXES } from '../src/content/fixes';

describe('Оновлення засіяного контенту', () => {
  it('квиток з іспиту веде до наступного міста маршруту, а виправлення не чіпає правок з адмінки', () => {
    const sql = buildSeedSql().join('\n');
    for (const f of TEXT_FIXES) {
      const line = sql.split('\n').find((l) => l.startsWith(`UPDATE ${f.table} SET "${f.column}"`) && l.includes(`slug = '${f.slug}'`));
      expect(line, f.slug).toBeTruthy();
      // оновлюємо лише рядок, у якому досі старий текст із коду
      const from = typeof f.from === 'string' ? f.from : JSON.stringify(f.from);
      expect(line).toContain(`AND "${f.column}" = '${from}'`);
    }
    const waw = CITY_CONTENT.find((c) => c.city === 'warszawa')!.routes.find((r) => r.slug === 'waw-egzamin')!;
    expect(waw.description.uk).toContain('Лодзі');
  });
});

describe('Різноманітність механік', () => {
  it('у черзі будь-якого уроку міста не більше трьох однакових механік поспіль', () => {
    for (const l of CITY_CONTENT.flatMap((c) => c.routes.flatMap((r) => r.lessons))) {
      const order = spreadByType(l.exercises);
      let run = 1;
      for (let i = 1; i < order.length; i++) {
        run = order[i].type === order[i - 1].type ? run + 1 : 1;
        expect(run, `${l.slug}: ${order[i].type}`).toBeLessThanOrEqual(3);
      }
    }
  });
});
