import { describe, expect, it } from 'vitest';
import {
  spreadByType,
  checkAnswer,
  toPublicItem,
  matchText,
  nextReview,
  SRS_INITIAL,
  levelFromXp,
  xpForLevel,
  updateStreak,
  effectiveStreak,
  weekKey,
  dayKey,
  lessonReward,
  DEFAULT_REWARDS,
  similarity,
  type ExerciseItem,
} from '../src';

const choice: ExerciseItem = {
  key: 'e1',
  type: 'WORD_TRANSLATION',
  skill: 'vocab.greetings',
  data: { pl: 'Cześć', options: [{ id: 'a', text: { uk: 'Привіт' } }, { id: 'b', text: { uk: 'Дякую' } }], answer: 'a' },
};

describe('перевірка відповідей', () => {
  it('вибір варіанту', () => {
    expect(checkAnswer(choice, { optionId: 'a' }).correct).toBe(true);
    expect(checkAnswer(choice, { optionId: 'b' }).correct).toBe(false);
  });

  it('аудіювання й диктант без звуку: пропуск без зарахування', () => {
    const listening: ExerciseItem = { key: 'l', type: 'LISTENING', skill: 's', data: { audioText: 'Dobranoc', options: [{ id: 'o0', text: 'Dobranoc' }, { id: 'o1', text: 'Dzień dobry' }], answer: 'o0' } };
    expect(checkAnswer(listening, { skipped: true } as never)).toMatchObject({ correct: false, skipped: true, done: true, correctAnswer: 'o0' });
    const dictation: ExerciseItem = { key: 'd', type: 'DICTATION', skill: 's', data: { audioText: 'Dzień dobry', accepted: ['Dzień dobry'] } };
    expect(checkAnswer(dictation, { skipped: true } as never)).toMatchObject({ correct: false, skipped: true, correctAnswer: 'Dzień dobry' });
    // Порожня відповідь не зараховується.
    expect(checkAnswer(dictation, { text: '   ' }).correct).toBe(false);
  });

  it('публічна версія не містить відповіді', () => {
    const pub = toPublicItem(choice);
    expect(JSON.stringify(pub)).not.toContain('"answer"');
    const text: ExerciseItem = { key: 't', type: 'SENTENCE_TRANSLATION', skill: 's', data: { source: { uk: 'Добрий день' }, accepted: ['Dzień dobry'] } };
    expect(JSON.stringify(toPublicItem(text))).not.toContain('Dzień dobry');
  });

  it('текст: регістр, пунктуація, діакритика, одруківки', () => {
    expect(matchText('dzień dobry!', ['Dzień dobry']).match).toBe('exact');
    expect(matchText('dzien dobry', ['Dzień dobry']).match).toBe('diacritics');
    expect(matchText('Mam na imie Ola', ['Mam na imię Ola']).match).toBe('diacritics');
    expect(matchText('Przeprasam', ['Przepraszam']).match).toBe('typo');
    expect(matchText('tak', ['nie']).match).toBe('wrong');
    // Коротке слово з одруківкою — не зараховується
    expect(matchText('kot', ['kod']).match).toBe('wrong');
  });

  it('does not forgive changed numbers, endings or short words as a typo', () => {
    expect(matchText('Mam 21 lat', ['Mam 20 lat']).match).toBe('wrong');
    expect(matchText('Nie lubię herbatę', ['Nie lubię herbaty']).match).toBe('wrong');
    expect(matchText('Mam na imię Olu', ['Mam na imię Ola']).match).toBe('wrong');
    expect(matchText('Przeprasam', ['Przepraszam'], { allowTypos: false }).match).toBe('wrong');
    expect(matchText('dzień'.normalize('NFD'), ['dzień']).match).toBe('exact');
    // Пропущені знаки — «майже»; інший знак робить інше слово (część — «частина») — помилка.
    expect(matchText('czesc', ['Cześć']).match).toBe('diacritics');
    expect(matchText('część', ['Cześć']).match).toBe('wrong');
    expect(matchText('zle', ['źle']).match).toBe('diacritics');
    expect(matchText('żle', ['źle']).match).toBe('wrong');
    const item: ExerciseItem = { key: 'negative', type: 'PRONUNCIATION', skill: 's', data: { text: 'Nie lubię herbaty z mlekiem', translation: { uk: '...' } } };
    expect(checkAnswer(item, { transcript: 'Lubię herbaty z mlekiem' }).correct).toBe(false);
  });

  it('складання речення з альтернативами', () => {
    const item: ExerciseItem = {
      key: 'o', type: 'BUILD_SENTENCE', skill: 's',
      data: { tokens: ['Mam', 'na', 'imię', 'Anna', 'jest'], answer: ['Mam', 'na', 'imię', 'Anna'], alternatives: [['Anna', 'mam', 'na', 'imię']] },
    };
    expect(checkAnswer(item, { tokens: ['Mam', 'na', 'imię', 'Anna'] }).correct).toBe(true);
    expect(checkAnswer(item, { tokens: ['Anna', 'mam', 'na', 'imię'] }).correct).toBe(true);
    expect(checkAnswer(item, { tokens: ['na', 'Mam', 'imię', 'Anna'] }).correct).toBe(false);
  });

  it('з’єднання пар', () => {
    const item: ExerciseItem = {
      key: 'm', type: 'MATCH_PAIRS', skill: 's',
      data: { pairs: [{ l: 'l1', r: 'x9', pl: 'kot', tr: { uk: 'кіт' } }, { l: 'l2', r: 'q3', pl: 'pies', tr: { uk: 'пес' } }] },
    };
    expect(checkAnswer(item, { pairs: [['l1', 'x9'], ['l2', 'q3']] }).correct).toBe(true);
    expect(checkAnswer(item, { pairs: [['l1', 'q3'], ['l2', 'x9']] }).correct).toBe(false);
    expect(checkAnswer(item, { pairs: [['l1', 'x9'], ['l1', 'x9']] }).correct).toBe(false);
  });

  it('діалог перевіряється покроково', () => {
    const item: ExerciseItem = {
      key: 'd', type: 'DIALOGUE', skill: 's',
      data: {
        npc: { name: 'Ania', emoji: '👩' },
        steps: [
          { npc: 'Cześć!', npcTr: { uk: 'Привіт!' }, options: [{ id: '1', text: 'Cześć!', tr: { uk: 'Привіт!' } }, { id: '2', text: 'Dobranoc', tr: { uk: 'На добраніч' } }], answer: '1' },
          { npc: 'Jak masz na imię?', npcTr: { uk: 'Як тебе звати?' }, options: [{ id: '3', text: 'Mam na imię Olek.', tr: { uk: 'Мене звати Олек.' } }, { id: '4', text: 'Dziękuję.', tr: { uk: 'Дякую.' } }], answer: '3' },
          { npc: 'Miło mi!', npcTr: { uk: 'Приємно!' } },
        ],
      },
    };
    expect(checkAnswer(item, { step: 0, optionId: '2' })).toMatchObject({ correct: false, done: false });
    expect(checkAnswer(item, { step: 0, optionId: '1' })).toMatchObject({ correct: true, done: false });
    expect(checkAnswer(item, { step: 1, optionId: '3' })).toMatchObject({ correct: true, done: true });
  });

  it('вимова — схожість розпізнаного тексту', () => {
    expect(similarity('dzien dobry', 'Dzień dobry')).toBe(1);
    const item: ExerciseItem = { key: 'p', type: 'PRONUNCIATION', skill: 's', data: { text: 'Dziękuję', translation: { uk: 'Дякую' } } };
    expect(checkAnswer(item, { transcript: 'dziękuję' }).correct).toBe(true);
    expect(checkAnswer(item, { transcript: 'proszę' }).correct).toBe(false);
    expect(checkAnswer(item, { skipped: true })).toMatchObject({ skipped: true });
  });
});

describe('інтервальне повторення', () => {
  it('інтервали ростуть, помилка скидає', () => {
    const now = new Date('2026-01-01T10:00:00Z');
    const a = nextReview(SRS_INITIAL, 5, now);
    expect(a.intervalDays).toBe(1);
    const b = nextReview(a, 5, now);
    expect(b.intervalDays).toBe(3);
    const c = nextReview(b, 5, now);
    expect(c.intervalDays).toBeGreaterThan(6);
    const d = nextReview(c, 1, now);
    expect(d.repetitions).toBe(0);
    expect(d.lapses).toBe(1);
    expect(d.dueAt.getTime() - now.getTime()).toBe(10 * 60_000);
  });
});

describe('прогресія', () => {
  it('рівні гравця', () => {
    expect(levelFromXp(0).level).toBe(1);
    expect(levelFromXp(99).level).toBe(1);
    expect(levelFromXp(100).level).toBe(2);
    expect(levelFromXp(xpForLevel(50)).level).toBe(50);
    expect(levelFromXp(xpForLevel(120) + 5).level).toBe(120);
  });

  it('серія днів', () => {
    let s = updateStreak({ current: 0, best: 0, lastDay: null }, '2026-03-01');
    expect(s.current).toBe(1);
    s = updateStreak(s, '2026-03-01');
    expect(s.current).toBe(1);
    s = updateStreak(s, '2026-03-02');
    expect(s.current).toBe(2);
    s = updateStreak(s, '2026-03-05');
    expect(s).toMatchObject({ current: 1, best: 2 });
    expect(effectiveStreak(5, '2026-03-01', '2026-03-03')).toBe(0);
    expect(effectiveStreak(5, '2026-03-02', '2026-03-03')).toBe(5);
  });

  it('щит серії Premium: один пропущений день на тиждень серію не скидає', () => {
    // Без Premium пропуск дня скидає серію.
    expect(updateStreak({ current: 5, best: 5, lastDay: '2026-03-05' }, '2026-03-07')).toMatchObject({ current: 1, shieldUsed: null });
    // З Premium: пропущено 6.03 — серія 5 → 6, день щита запам'ятовано.
    const s = updateStreak({ current: 5, best: 5, lastDay: '2026-03-05', shieldDay: null }, '2026-03-07', { shield: true });
    expect(s).toMatchObject({ current: 6, best: 6, lastDay: '2026-03-07', changed: true, shieldUsed: '2026-03-06' });
    // Щит раз на тиждень: ще один пропуск через три дні — серія скидається.
    expect(updateStreak({ current: 8, best: 8, lastDay: '2026-03-08', shieldDay: '2026-03-06' }, '2026-03-10', { shield: true })).toMatchObject({ current: 1, shieldUsed: null });
    // Через шість днів ще ні, через сім — знову можна.
    expect(updateStreak({ current: 9, best: 9, lastDay: '2026-03-11', shieldDay: '2026-03-06' }, '2026-03-13', { shield: true })).toMatchObject({ current: 1, shieldUsed: null });
    expect(updateStreak({ current: 9, best: 9, lastDay: '2026-03-12', shieldDay: '2026-03-06' }, '2026-03-14', { shield: true })).toMatchObject({ current: 10, shieldUsed: '2026-03-13' });
    // Два пропущені дні щит не рятує; нульова серія щита не витрачає.
    expect(updateStreak({ current: 9, best: 9, lastDay: '2026-03-11' }, '2026-03-14', { shield: true })).toMatchObject({ current: 1, shieldUsed: null });
    expect(updateStreak({ current: 0, best: 3, lastDay: '2026-03-11' }, '2026-03-13', { shield: true })).toMatchObject({ current: 1, shieldUsed: null });
    // Що бачить учень: після одного пропуску серія Premium жива до кінця дня (позайматися — і щит її збереже).
    expect(effectiveStreak(5, '2026-03-05', '2026-03-07', { premium: true, shieldDay: null })).toBe(5);
    expect(effectiveStreak(5, '2026-03-05', '2026-03-07', { premium: false, shieldDay: null })).toBe(0);
    expect(effectiveStreak(5, '2026-03-05', '2026-03-07', { premium: true, shieldDay: '2026-03-02' })).toBe(0);
    expect(effectiveStreak(5, '2026-03-05', '2026-03-08', { premium: true, shieldDay: null })).toBe(0);
  });

  it('тижні та дні', () => {
    expect(weekKey('2026-01-01')).toBe('2026-W01');
    expect(weekKey('2024-12-30')).toBe('2025-W01');
    expect(dayKey(new Date('2026-03-01T23:30:00Z'), 'Europe/Warsaw')).toBe('2026-03-02');
  });

  it('нагорода за урок: повтори обмежені', () => {
    const cfg = DEFAULT_REWARDS;
    const first = lessonReward({ cfg, correct: 10, total: 10, firstCompletion: true, replaysToday: 0, passed: true });
    expect(first).toEqual({ xp: 10 * 5 + 20 + 10, zlotki: 10, perfect: true });
    const replay = lessonReward({ cfg, correct: 10, total: 10, firstCompletion: false, replaysToday: 0, passed: true });
    expect(replay.xp).toBe(Math.round(80 * 0.25));
    expect(replay.zlotki).toBe(0);
    const capped = lessonReward({ cfg, correct: 10, total: 10, firstCompletion: false, replaysToday: 2, passed: true });
    expect(capped.xp).toBe(0);
    expect(lessonReward({ cfg, correct: 2, total: 10, firstCompletion: true, replaysToday: 0, passed: false }).xp).toBe(0);
  });
});

import { isLoneLetter, pickPolishVoice, speechText } from '../src/speech';

describe('Польська озвучка', () => {
  it('зберігає діакритику (NFC) і прибирає пропуски', () => {
    const decomposed = 'dziękuję'; // ę як e + огонек
    expect(speechText(decomposed)).toBe('dziękuję');
    expect(speechText('To  jest ___ kot')).toBe('To jest … kot');
    for (const w of ['siedem', 'dziękuję', 'moja', 'są', 'byłem', 'cześć', 'dzień dobry', 'przepraszam', 'proszę', 'dziewięć', 'dziesięć', 'Wrocław']) {
      expect(speechText(w)).toBe(w);
    }
  });

  it('прибирає емодзі (сервер їх не синтезує, пристрій читав би назву символу); текст без емодзі не змінюється', () => {
    expect(speechText('(Iść prosto i skręcić w lewo ⬆️⬅️)')).toBe('(Iść prosto i skręcić w lewo)');
    expect(speechText('(Skręcić w prawo ➡️)')).toBe('(Skręcić w prawo)');
    expect(speechText('🇵🇱 Polska 👍🏽, super! 1️⃣')).toBe('Polska, super! 1');
    expect(speechText('👨‍👩‍👧')).toBe('');
    for (const w of ['Bilet kosztuje 4,60 zł.', '„Wyjście” — napis', 'Tak , dobrze', '( spacja )', 'M2 w kierunku Bródna']) expect(speechText(w)).toBe(w);
  });

  it('обирає лише польський голос, кращий — pl-PL нейронний', () => {
    const voices = [
      { lang: 'en-US', name: 'Google US English', default: true },
      { lang: 'ru-RU', name: 'Milena' },
      { lang: 'pl-PL', name: 'Zosia' },
      { lang: 'pl-PL', name: 'Microsoft Zofia Online (Natural) - Polish' },
    ];
    expect(pickPolishVoice(voices)?.name).toBe('Microsoft Zofia Online (Natural) - Polish');
    expect(pickPolishVoice([{ lang: 'pl_PL', name: 'x' }])?.name).toBe('x');
  });

  it('без польського голосу — null, а не англійський/російський голос', () => {
    expect(pickPolishVoice([{ lang: 'en-US', name: 'Alex', default: true }, { lang: 'ru-RU', name: 'Yuri' }])).toBeNull();
    expect(pickPolishVoice([{ lang: 'pt-BR', name: 'Luciana' }])).toBeNull();
    expect(pickPolishVoice([])).toBeNull();
  });
});

describe('spreadByType', () => {
  it('не більше трьох однакових механік поспіль, усі завдання на місці', () => {
    const items = ['A', 'A', 'A', 'A', 'A', 'B', 'C', 'C', 'C', 'C', 'D'].map((type, i) => ({ type, i }));
    const out = spreadByType(items);
    expect(out.map((x) => x.i).sort((a, b) => a - b)).toEqual(items.map((x) => x.i));
    let run = 1;
    for (let k = 1; k < out.length; k++) {
      run = out[k].type === out[k - 1].type ? run + 1 : 1;
      expect(run).toBeLessThanOrEqual(3);
    }
  });
});

import { alignSpeechWords } from '../src/text';

describe('alignSpeechWords: розмітка розпізнаних слів', () => {
  const marks = (t: string, h: string) => alignSpeechWords(t, h).words.map((x) => `${x.w}:${x.st}`).join(' ');
  it('усі слова на місці — усі зелені, пунктуація й регістр не заважають', () => {
    expect(marks('Dzień dobry!', 'dzień dobry')).toBe('Dzień:ok dobry!:ok');
  });
  it('переставлені слова не позначаються всі зеленими', () => {
    const r = alignSpeechWords('dzień dobry', 'dobry dzień');
    expect(r.words.filter((x) => x.st === 'ok')).toHaveLength(1);
    expect(r.words.filter((x) => x.st === 'miss')).toHaveLength(1);
    expect(r.extra).toHaveLength(1);
  });
  it('повтор у фразі зараховується лише стільки разів, скільки почуто', () => {
    expect(marks('tak tak', 'tak')).toBe('tak:ok tak:miss');
    const r = alignSpeechWords('tak', 'tak tak');
    expect(r.words.map((x) => x.st)).toEqual(['ok']);
    expect(r.extra).toEqual(['tak']);
  });
  it('без польських знаків — «near», інше слово — «miss»', () => {
    expect(marks('Cześć, Ania', 'czesc ania')).toBe('Cześć,:near Ania:ok');
    expect(marks('Poproszę kawę', 'poproszę herbatę')).toBe('Poproszę:ok kawę:miss');
  });
  it('пропущене слово в середині не зсуває решту', () => {
    expect(marks('Mam na imię Ola', 'mam imię ola')).toBe('Mam:ok na:miss imię:ok Ola:ok');
  });
  it('порожнє розпізнавання — усі слова не розпізнані', () => {
    expect(marks('Do widzenia', '')).toBe('Do:miss widzenia:miss');
  });
});

describe('isLoneLetter: однолітерні прийменники не озвучуються окремо', () => {
  it('окрема літера, зокрема велика й з розділовим знаком', () => {
    for (const x of ['w', 'W', 'z', 'i', 'a', 'o', 'u', 'ó', ' W ', 'w,']) expect(isLoneLetter(x)).toBe(true);
  });
  it('слова й фрази — не окремі літери', () => {
    for (const x of ['we', 'ze', 'w domu', 'Wrocław', 'ul.', '', '…']) expect(isLoneLetter(x)).toBe(false);
  });
});

import { polishCyrillic, polishIpa } from '../src/pron';

describe('Польська вимова: IPA за правилами написання', () => {
  const cases: [string, string][] = [
    ['Dzień dobry', 'd͡ʑɛɲ ˈdɔbrɨ'],
    ['Cześć', 't͡ʂɛɕt͡ɕ'],
    ['Dziękuję', 'd͡ʑɛŋˈkujɛ'],
    ['Przepraszam', 'pʂɛˈpraʂam'],
    ['Warszawa', 'varˈʂava'],
    ['Kraków', 'ˈkrakuf'],
    ['Wrocław', 'ˈvrɔt͡swaf'],
    ['Łódź', 'wut͡ɕ'],
    ['Szczecin', 'ˈʂt͡ʂɛt͡ɕin'],
    ['Katowice', 'katɔˈvit͡sɛ'],
    ['Opole', 'ɔˈpɔlɛ'],
    ['chleb', 'xlɛp'],
    ['w domu', 'ˈvdɔmu'],
    ['w Polsce', 'ˈfpɔlst͡sɛ'],
    ['z kawą', 'ˈskavɔ̃'],
    ['kiedy', 'ˈkʲɛdɨ'],
    ['pies', 'pjɛs'],
    ['miasto', 'ˈmjastɔ'],
    ['się', 'ɕɛ'],
    ['mieszkanie', 'mjɛʂˈkaɲɛ'],
    ['rzeka', 'ˈʐɛka'],
    ['trzy', 'tʂɨ'],
    ['wtorek', 'ˈftɔrɛk'],
    ['ząb', 'zɔmp'],
    ['proszę', 'ˈprɔʂɛ'],
    ['jabłko', 'ˈjapkɔ'],
    ['mógł', 'muk'],
    ['pomysł', 'ˈpɔmɨsw'],
    ['dziewczyna', 'd͡ʑɛfˈt͡ʂɨna'],
    ['książka', 'ˈkɕɔ̃ʂka'],
    ['piątek', 'ˈpjɔntɛk'],
    ['Europa', 'ɛwˈrɔpa'],
    ['auto', 'ˈawtɔ'],
    ['nauka', 'naˈuka'],
    ['chrząszcz', 'xʂɔ̃ʂt͡ʂ'],
    ['bank', 'baŋk'],
    ['kwiat', 'kfjat'],
    ['dworzec', 'ˈdvɔʐɛt͡s'],
    ['Gdzie jest dworzec?', 'ɡd͡ʑɛ jɛst ˈdvɔʐɛt͡s'],
    ['wziął', 'vʑɔw'],
    ['herbata', 'xɛrˈbata'],
    ['miło mi', 'ˈmiwɔ mi'],
    ['oni', 'ˈɔɲi'],
    ['pani', 'ˈpaɲi'],
    ['drogi', 'ˈdrɔɡʲi'],
    ['trzydzieści', 'tʂɨˈd͡ʑɛɕt͡ɕi'],
    ['wegetariański', 'vɛɡɛtaˈrjaɲskʲi'],
    ['bez mięsa', 'bɛs ˈmjɛ̃sa'],
    ['rozkład jazdy', 'ˈrɔskwat ˈjazdɨ'],
    ['zaświadczenie', 'zaɕfjatˈt͡ʂɛɲɛ'],
    ['z ketchupem', 'skɛˈt͡ʂupɛm'],
  ];
  for (const [pl, ipa] of cases) it(pl, () => expect(polishIpa(pl)).toBe(ipa));
});

describe('Польська вимова: приблизне прочитання кирилицею', () => {
  const ru: [string, string][] = [
    ['Dzień dobry', 'дзень до́бры'],
    ['Cześć', 'чэсьчь'],
    ['Dziękuję', 'дзенку́е'],
    ['Przepraszam', 'пшэпра́шам'],
    ['się', 'се'],
    ['pies', 'пьес'],
    ['mieszkanie', 'мьешка́не'],
    ['w Polsce', 'ф по́льсцэ'],
    ['z kawą', 'с ка́вон'],
    ['Łódź', 'вучь'],
    ['jabłko', 'я́пко'],
    ['książka', 'ксёншка'],
  ];
  const uk: [string, string][] = [
    ['Dzień dobry', 'дзєнь до́бри'],
    ['Cześć', 'чесьць'],
    ['Dziękuję', 'дзєнку́є'],
    ['Przepraszam', 'пшепра́шам'],
    ['się', 'сє'],
    ['pies', 'п’єс'],
    ['miasto', 'м’я́сто'],
    ['Łódź', 'вуць'],
    ['książka', 'ксьо́ншка'],
    ['dziewczyna', 'дзєфчи́на'],
  ];
  for (const [pl, c] of ru) it(`ru: ${pl}`, () => expect(polishCyrillic(pl, 'ru')).toBe(c));
  for (const [pl, c] of uk) it(`uk: ${pl}`, () => expect(polishCyrillic(pl, 'uk')).toBe(c));
});

import { addDays, effectiveStreak as effective, lastDays, nextDayStart, shiftLastDayForZone, zonedDayStart } from '../src/index';

describe('дни, серия и переходы часов', () => {
  it('новый день начинается в местную полночь, в том числе в ночь перехода на зимнее и летнее время', () => {
    // Варшава, 25.10.2026: в 03:00 CEST часы переводят на 02:00 CET. В 00:30 CEST следующая полночь — 26.10 00:00 CET = 25.10 23:00Z.
    expect(nextDayStart(new Date('2026-10-24T22:30:00Z'), 'Europe/Warsaw').toISOString()).toBe('2026-10-25T23:00:00.000Z');
    expect(nextDayStart(new Date('2026-10-25T12:00:00Z'), 'Europe/Warsaw').toISOString()).toBe('2026-10-25T23:00:00.000Z');
    // 29.03.2026: в 02:00 CET — на 03:00 CEST. В 00:30 CET следующая полночь — 30.03 00:00 CEST = 29.03 22:00Z.
    expect(nextDayStart(new Date('2026-03-28T23:30:00Z'), 'Europe/Warsaw').toISOString()).toBe('2026-03-29T22:00:00.000Z');
    expect(nextDayStart(new Date('2026-07-01T10:00:00Z'), 'America/New_York').toISOString()).toBe('2026-07-02T04:00:00.000Z');
    expect(nextDayStart(new Date('2026-07-01T10:00:00Z'), 'Asia/Kolkata').toISOString()).toBe('2026-07-01T18:30:00.000Z');
    expect(nextDayStart(new Date('2026-07-01T10:00:00Z'), 'Not/AZone').toISOString()).toBe('2026-07-02T00:00:00.000Z');
    expect(zonedDayStart('2026-10-25', 'Europe/Warsaw').toISOString()).toBe('2026-10-24T22:00:00.000Z');
  });

  it('последние дни — календарные: без повторов и пропусков через переход часов', () => {
    const keys = lastDays(new Date('2026-10-25T22:30:00Z'), 7, 'Europe/Warsaw');
    expect(keys).toEqual(['2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23', '2026-10-24', '2026-10-25']);
    expect(new Set(lastDays(new Date('2026-03-29T22:30:00Z'), 30, 'Europe/Warsaw')).size).toBe(30);
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('смена пояса не сжигает серию: «сегодня» стало вчерашним днём — серия не сбрасывается', () => {
    const s = updateStreak({ current: 12, best: 20, lastDay: '2026-10-27' }, '2026-10-26');
    expect(s).toMatchObject({ current: 12, best: 20, lastDay: '2026-10-27', changed: false });
  });

  it('при смене пояса последний день активности сдвигается вместе с «сегодня»', () => {
    // 27.10 23:30 в Варшаве = 27.10 18:30 в Нью-Йорке = 28.10 07:30 в Токио.
    const now = new Date('2026-10-27T22:30:00Z');
    expect(shiftLastDayForZone('2026-10-27', now, 'Europe/Warsaw', 'Asia/Tokyo')).toBe('2026-10-28');
    expect(shiftLastDayForZone('2026-10-26', now, 'Europe/Warsaw', 'Asia/Tokyo')).toBe('2026-10-27');
    expect(shiftLastDayForZone('2026-10-27', now, 'Europe/Warsaw', 'America/New_York')).toBe('2026-10-27');
    expect(shiftLastDayForZone(null, now, 'Europe/Warsaw', 'Asia/Tokyo')).toBeNull();
    // Занимался «вчера» по Варшаве, улетел в Токио, где уже послезавтра: серия жива и продлится уроком в Токио.
    const shifted = shiftLastDayForZone('2026-10-26', now, 'Europe/Warsaw', 'Asia/Tokyo')!;
    expect(effective(5, shifted, '2026-10-28')).toBe(5);
    expect(updateStreak({ current: 5, best: 5, lastDay: shifted }, '2026-10-28')).toMatchObject({ current: 6, changed: true });
  });
});
