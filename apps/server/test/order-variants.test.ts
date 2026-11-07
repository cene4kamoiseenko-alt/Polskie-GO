/**
 * Сборка предложений в миссиях и уроках (владелец 2026-11-07, скриншот: «Poproszę wodę i hot doga» отклонено, хотя верно, а в объяснении сказано
 * про винительный падеж, хотя падеж использован правильно). Проверяется на всём содержании: миссии (107 шагов «build») и уроки (BUILD_SENTENCE,
 * WORD_ORDER из базы).
 */
import { afterAll, describe, expect, it } from 'vitest';
import { checkAnswer, normalize, orderSpecAnswers, orderTokens, orderVariants, type ExerciseItem, type OrderData } from '@polski-go/shared';
import { MISSIONS, type MissionStep } from '../src/content/missions';
import { acceptedPhrases, bankTokens, buildWhy, tokensOf } from '../src/services/missions';
import { resetRateLimits } from '../src/hono';
import { disposeEnv, getEnv, login, playSession, sessionItems } from './helpers';

afterAll(disposeEnv);

const builds = MISSIONS.flatMap((m) => m.steps.filter((s) => s.kind === 'build').map((s) => ({ key: `${m.slug}:${s.id}`, step: s })));
const bag = (words: string[]) => normalize(words.join(' ')).split(' ').sort();
/** Слова фразы помещаются в банк плашек (с учётом повторов) — иначе такую фразу не собрать. */
const fits = (phrase: string, bank: string[]) => {
  const pool = [...normalize(bank.join(' ')).split(' ')];
  return normalize(orderTokens(phrase).join(' ')).split(' ').every((w) => {
    const at = pool.indexOf(w);
    if (at < 0) return false;
    pool.splice(at, 1);
    return true;
  });
};

type Row = { id: string; type: ExerciseItem['type']; skill: string; data: string; explanation: string | null; slug: string };
async function lessonOrderItems(): Promise<(ExerciseItem & { explanation: unknown; slug: string })[]> {
  const { env } = await getEnv();
  const rows = (await env.DB.prepare("select e.id, e.type, e.skill, e.data, e.explanation, l.slug from exercises e join lessons l on l.id = e.lesson_id where e.type in ('BUILD_SENTENCE','WORD_ORDER')").all()).results as Row[];
  return rows.map((r) => ({ key: r.id, exerciseId: r.id, type: r.type, skill: r.skill, data: JSON.parse(r.data), explanation: r.explanation ? JSON.parse(r.explanation) : null, slug: r.slug }));
}

describe('миссии: шаги «build»', () => {
  it('в миссиях 107 шагов со сборкой; у большинства есть допустимые порядки или формулировки', () => {
    expect(builds.length).toBe(107);
    const withMore = builds.filter(({ step }) => acceptedPhrases(step).length > 1);
    expect(withMore.length).toBeGreaterThan(75);
  });

  it('любая верная фраза собирается из плашек шага: эталон, accept и все допустимые порядки', () => {
    for (const { key, step } of builds) {
      const bank = bankTokens(step);
      for (const phrase of acceptedPhrases(step)) expect(fits(phrase, bank), `${key}: «${phrase}» не собрать из ${bank.join(' · ')}`).toBe(true);
      // «пастки» остаются только формами, которых нет ни в одной верной фразе
      const used = new Set(acceptedPhrases(step).flatMap((p) => bag(tokensOf(p))));
      for (const e of step.extra ?? []) expect(used.has(normalize(e)), `${key}: пастка «${e}» стала словом верного варианта`).toBe(false);
    }
  });

  it('объяснение падежа показывается только при неверной форме; верные формы в другом порядке и нехватка слов получают свои сообщения', () => {
    let checked = 0;
    for (const { key, step } of builds) {
      const answer = tokensOf(step.answer!);
      const reversed = answer.slice().reverse();
      const accepted = acceptedPhrases(step).map((p) => normalize(tokensOf(p).join(' ')));
      if (!accepted.includes(normalize(reversed.join(' ')))) {
        const why = buildWhy(step, reversed.join(' '));
        expect(why, `${key}: обратный порядок объяснён как ошибка формы`).not.toBe(step.explain);
        expect(why.ru, key).toMatch(/порядок/);
        checked++;
      }
      if (answer.length >= 3) {
        const missing = buildWhy(step, answer.slice(0, -1).join(' '));
        expect(missing, `${key}: нехватка слова объяснена как ошибка формы`).not.toBe(step.explain);
      }
      for (const trap of step.extra ?? []) expect(buildWhy(step, [...answer.slice(0, -1), trap].join(' ')), `${key}: пастка «${trap}»`).toBe(step.explain);
    }
    expect(checked).toBeGreaterThan(90);
  });

  it('пример владельца: «Poproszę wodę i hot doga» засчитывается, «Poproszę woda i hot dog» — нет, и тогда объясняется падеж', async () => {
    const m = MISSIONS.find((x) => x.slug === 'zabka-first-order')!;
    const idx = m.steps.findIndex((s) => s.kind === 'build' && s.answer === 'Poproszę hot doga i wodę.');
    expect(idx).toBeGreaterThan(-1);
    const { call } = await login();
    const start = await call('POST', `/api/missions/${m.slug}/start`);
    const runId = start.body.runId as string;
    for (let i = 0; i < idx; i++) {
      const s = m.steps[i];
      const answer = s.kind === 'build' ? { text: s.answer } : { option: s.options!.findIndex((o) => o.ok) };
      expect((await call('POST', `/api/missions/runs/${runId}/answer`, { step: i, ...answer })).body.correct).toBe(true);
    }
    const ask = (text: string) => call('POST', `/api/missions/runs/${runId}/answer`, { step: idx, text });

    // верные слова, пропущено слово: про падеж ни слова
    const missing = await ask('Poproszę hot doga');
    expect(missing.body.correct).toBe(false);
    expect(missing.body.why.ru).not.toMatch(/падеж/);
    // верные формы, порядок сломан
    const order = await ask('i Poproszę hot doga wodę');
    expect(order.body.correct).toBe(false);
    expect(order.body.why.ru).toMatch(/порядок/);
    expect(order.body.why.ru).not.toMatch(/падеж/);
    // неверная форма: объяснение падежа к месту
    const trap = await ask('Poproszę hot doga i woda');
    expect(trap.body.correct).toBe(false);
    expect(trap.body.why.ru).toMatch(/падеж/);
    // пример владельца
    const ok = await ask('Poproszę wodę i hot doga');
    expect(ok.body.correct).toBe(true);
  });

  it('плашки для клиента содержат слова допустимых вариантов («tutaj» для «tu»), но не раскрывают, какие верные', async () => {
    const m = MISSIONS.find((x) => x.slug === 'warszawa-dzien')!;
    const step = m.steps.find((s) => s.kind === 'build' && s.answer === 'Czy mogę tu naładować telefon?')!;
    expect(bankTokens(step)).toEqual(expect.arrayContaining(['Czy', 'mogę', 'tu', 'tutaj', 'naładować', 'telefon', 'naładuję', 'telefonu']));
    const { call } = await login();
    const start = await call('POST', `/api/missions/${m.slug}/start`);
    const json = JSON.stringify(start.body);
    expect(json).not.toContain('"accept"');
    expect(json).not.toContain('"extra"');
  });
});

describe('уроки: BUILD_SENTENCE и WORD_ORDER', () => {
  it('запись допустимых порядков есть почти у каждого подходящего задания; ни один ключ таблицы не повис без задания', async () => {
    const items = await lessonOrderItems();
    expect(items.length).toBe(106);
    const answers = new Set([...items.map((i) => normalize((i.data as OrderData).answer.join(' '))), ...builds.map(({ step }) => normalize(tokensOf(step.answer!).join(' ')))]);
    const orphan = orderSpecAnswers().filter((k) => !answers.has(k));
    expect(orphan, `Записи без задания:\n${orphan.join('\n')}`).toEqual([]);
    const lessonKeys = new Set(items.map((i) => normalize((i.data as OrderData).answer.join(' '))));
    expect(orderSpecAnswers().filter((k) => lessonKeys.has(k)).length).toBeGreaterThan(55);
  });

  it('все допустимые порядки собираются из плашек задания и засчитываются; неверная перестановка — нет', async () => {
    const items = await lessonOrderItems();
    let built = 0;
    let rejected = 0;
    for (const item of items) {
      const d = item.data as OrderData;
      for (const phrase of orderVariants(d.answer)) {
        expect(fits(phrase, d.tokens), `${d.answer.join(' ')}: «${phrase}» не собрать из плашек ${d.tokens.join(' · ')}`).toBe(true);
        expect(checkAnswer(item, { tokens: orderTokens(phrase) }).correct, phrase).toBe(true);
        built++;
      }
      const reversed = d.answer.slice().reverse();
      const known = [d.answer, ...(d.alternatives ?? []), ...orderVariants(d.answer).map((v) => [v])].map((a) => normalize(a.join(' ')));
      if (!known.includes(normalize(reversed.join(' ')))) {
        const r = checkAnswer(item, { tokens: reversed });
        expect(r.correct, reversed.join(' ')).toBe(false);
        expect(r.diagnosis, reversed.join(' ')).toBe('order');
        rejected++;
      }
    }
    expect(built).toBeGreaterThan(80);
    expect(rejected).toBeGreaterThan(80);
  });

  it('в уроке пояснение «почему так» не выдаётся за ошибку, которой нет: верные слова в неверном порядке — без пояснения, неверная форма — с ним', async () => {
    // «Mam na imię Anna» (waw-3-imie): у задания есть пояснение «Конструкция: Mam na imię + имя». Урок открывается после двух предыдущих.
    const target = (await lessonOrderItems()).find((i) => i.slug === 'waw-3-imie' && i.explanation && (i.data as OrderData).answer.length >= 4)!;
    expect(target).toBeTruthy();
    const { call } = await login();
    const journey = (await call('GET', '/api/journey')).body.cities as { slug: string; routes: { lessons: { id: string; slug: string; kind: string }[] }[] }[];
    const lessons = journey.find((c) => c.slug === 'warszawa')!.routes.flatMap((r) => r.lessons).filter((l) => l.kind === 'LESSON');
    for (const l of lessons) {
      resetRateLimits();
      const created = await call('POST', '/api/sessions', { lessonId: l.id });
      expect(created.status, l.slug).toBe(200);
      if (l.slug === 'waw-3-imie') {
        const served = await sessionItems(created.body.sessionId);
        const mine = served.find((x) => x.exerciseId === target.exerciseId)!;
        const d = mine.data as OrderData;
        const post = (tokens: string[]) => call('POST', `/api/sessions/${created.body.sessionId}/answer`, { key: mine.key, answer: { tokens } });
        const order = await post(d.answer.slice().reverse());
        expect(order.body.correct).toBe(false);
        expect(order.body.explanation, 'пояснение при верных словах').toBeNull();
        expect(order.body).not.toHaveProperty('diagnosis');
        const trapWord = d.tokens.find((t) => !d.answer.includes(t))!;
        const trap = await post([...d.answer.slice(0, -1), trapWord]);
        expect(trap.body.correct).toBe(false);
        expect(trap.body.explanation, 'пояснение при неверной форме').toBeTruthy();
        return;
      }
      expect((await playSession(call, created.body.sessionId)).status, l.slug).toBe(200);
    }
    throw new Error('урок waw-3-imie не найден в Варшаве');
  });
});
