import { describe, expect, it } from 'vitest';
import { checkAnswer, EXERCISE_TYPES, type ExerciseItem, type OrderData, type ChoiceData } from '@polski-go/shared';
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
  });
});

import { KRK_DWORZEC } from '../src/content/krakow-dworzec';
import { KRK_ZABKA } from '../src/content/krakow-zabka';
import { KRK_RYNEK } from '../src/content/krakow-rynek';
import { KRK_RESTAURACJA } from '../src/content/krakow-restauracja';
import { KRK_TRAMWAJ } from '../src/content/krakow-tramwaj';
import { KRK_HOTEL } from '../src/content/krakow-hotel';

describe('Локації міст (3.0)', () => {
  const LOCATIONS = [KRK_DWORZEC, KRK_ZABKA, KRK_RYNEK, KRK_RESTAURACJA, KRK_TRAMWAJ, KRK_HOTEL];
  it('у локації 3–6 уроків, звичайний урок 15–20 завдань, місія 20–30; щонайменше 5 різних механік', () => {
    for (const loc of LOCATIONS) {
      expect(loc.lessons.length, loc.slug).toBeGreaterThanOrEqual(3);
      expect(loc.lessons.length, loc.slug).toBeLessThanOrEqual(6);
      expect(loc.lessons.at(-1)!.slug.endsWith('-misja'), `${loc.slug}: остання — місія`).toBe(true);
      for (const l of loc.lessons) {
        const mission = l.slug.endsWith('-misja');
        expect(l.exercises.length, l.slug).toBeGreaterThanOrEqual(mission ? 20 : 15);
        expect(l.exercises.length, l.slug).toBeLessThanOrEqual(mission ? 30 : 20);
        // «Механіка» = тип вправи; WORD_TRANSLATION з картинками рахуємо окремо.
        const mech = new Set(l.exercises.map((e) => (e.type === 'WORD_TRANSLATION' && (e.data.options as { image?: string }[])[0]?.image ? 'PICTURE_CHOICE' : e.type)));
        expect(mech.size, `${l.slug}: ${[...mech].join(',')}`).toBeGreaterThanOrEqual(mission ? 8 : 5);
      }
    }
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
