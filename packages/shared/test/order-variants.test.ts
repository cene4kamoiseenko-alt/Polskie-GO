/**
 * Сборка предложения: допустимые порядки слов и разбор ошибки (владелец 2026-11-07: «Poproszę wodę i hot doga» — верно так же, как
 * «Poproszę hot doga i wodę»; падеж не объяснять, если он верный).
 */
import { describe, expect, it } from 'vitest';
import {
  MAX_ORDER_VARIANTS,
  orderSpecAnswers,
  orderSpecs,
  checkAnswer,
  diagnoseOrder,
  expandOrderSpec,
  normalize,
  orderTokens,
  orderVariants,
  type ExerciseItem,
} from '../src';

const norm = (xs: string[]) => xs.map((x) => normalize(x));
const bag = (s: string) => normalize(orderTokens(s).join(' ')).split(' ').sort();

describe('запись допустимых порядков', () => {
  it('части одного набора меняются местами, слово между ними остаётся: «hot doga i wodę» ↔ «wodę i hot doga»', () => {
    expect(norm(expandOrderSpec('Poproszę [hot doga] i [wodę]'))).toEqual(['poproszę hot doga i wodę', 'poproszę wodę i hot doga']);
  });

  it('два независимых набора перемножаются; части не разрываются', () => {
    const out = norm(expandOrderSpec('{Wezmę} {jeszcze} [chleb] i [masło]'));
    expect(out).toHaveLength(4);
    expect(out).toContain('jeszcze wezmę masło i chleb');
    expect(out).not.toContain('wezmę chleb jeszcze i masło');
  });

  it('необязательное слово: и с ним, и без него; полная фраза первой', () => {
    expect(norm(expandOrderSpec('(Czy) grasz na gitarze'))).toEqual(['czy grasz na gitarze', 'grasz na gitarze']);
  });

  it('знаки препинания в записи не мешают, повторы отбрасываются, число вариантов ограничено', () => {
    expect(norm(expandOrderSpec('[Przepraszam], [wysiadam]'))).toEqual(['przepraszam wysiadam', 'wysiadam przepraszam']);
    expect(expandOrderSpec('[a] [a]')).toEqual(['a a']);
    expect(() => expandOrderSpec('[a] [b] [c] [d] [e]')).toThrow(/слишком много/);
    expect(() => expandOrderSpec('Poproszę [hot doga')).toThrow(/нет «\]»/);
    expect(MAX_ORDER_VARIANTS).toBeGreaterThanOrEqual(24);
  });
});

describe('таблица ORDER_SPECS', () => {
  it('ключи не повторяются', () => {
    expect(new Set(orderSpecAnswers()).size).toBe(orderSpecAnswers().length);
    expect(orderSpecAnswers().length).toBeGreaterThan(100);
  });

  it('каждая запись раскрывается в перестановки слов ответа: ни одно слово не потеряно, не добавлено и не изменено (без необязательных)', () => {
    for (const [key, specs] of orderSpecs()) {
      for (const spec of specs) {
        const required = spec.replace(/\([^)]*\)/g, ' ');
        for (const phrase of expandOrderSpec(required)) expect(bag(phrase), `«${key}»: ${spec} → ${phrase}`).toEqual(bag(key));
        // необязательное слово — только то, что записано в скобках
        for (const phrase of expandOrderSpec(spec)) {
          const extra = bag(phrase).filter((w) => !bag(key).includes(w));
          const optional = [...spec.matchAll(/\(([^)]*)\)/g)].flatMap((m) => bag(m[1]));
          for (const w of extra) expect(optional, `«${key}»: ${spec} → «${w}» не из скобок`).toContain(w);
        }
      }
    }
  });

  it('варианты ответа не содержат сам ответ и не повторяются', () => {
    for (const key of orderSpecAnswers()) {
      const out = orderVariants(key).map((v) => normalize(v));
      expect(out, key).not.toContain(key);
      expect(new Set(out).size, key).toBe(out.length);
    }
  });

  it('пример владельца: у «Poproszę hot doga i wodę» есть и обратный порядок, и подача в начале', () => {
    const v = norm(orderVariants('Poproszę hot doga i wodę.'));
    expect(v).toContain('poproszę wodę i hot doga');
    expect(v).toContain('hot doga i wodę poproszę');
  });

  it('предложения, где перестановка меняет смысл, записи не имеют', () => {
    expect(orderVariants('Wczoraj było zimniej niż dzisiaj')).toEqual([]);
    expect(orderVariants('Proszę iść prosto i skręcić w lewo')).toEqual([]);
  });
});

describe('сборка предложений в уроках (checkAnswer)', () => {
  const item = (answer: string[], extra: Partial<{ alternatives: string[][] }> = {}): ExerciseItem => ({
    key: 'k',
    type: 'BUILD_SENTENCE',
    skill: 's',
    data: { tokens: [...answer, 'woda'], answer, ...extra },
  });

  it('обратный порядок сочинённых частей засчитывается, перестановка со сломанной частью — нет', () => {
    const it1 = item(['Mam', 'brata', 'i', 'siostrę']);
    expect(checkAnswer(it1, { tokens: ['Mam', 'brata', 'i', 'siostrę'] }).correct).toBe(true);
    expect(checkAnswer(it1, { tokens: ['Mam', 'siostrę', 'i', 'brata'] }).correct).toBe(true);
    expect(checkAnswer(it1, { tokens: ['Mam', 'i', 'brata', 'siostrę'] }).correct).toBe(false);
    expect(checkAnswer(it1, { tokens: ['Mam', 'brata', 'siostrę'] }).correct).toBe(false);
  });

  it('альтернативы автора работают по-прежнему, а запись их дополняет', () => {
    const it2 = item(['Jadę', 'samochodem', 'do', 'pracy'], { alternatives: [['Samochodem', 'jadę', 'do', 'pracy']] });
    for (const t of [['Jadę', 'samochodem', 'do', 'pracy'], ['Samochodem', 'jadę', 'do', 'pracy'], ['Jadę', 'do', 'pracy', 'samochodem'], ['Do', 'pracy', 'jadę', 'samochodem']]) {
      expect(checkAnswer(it2, { tokens: t }).correct, t.join(' ')).toBe(true);
    }
    expect(checkAnswer(it2, { tokens: ['Jadę', 'pracy', 'do', 'samochodem'] }).correct).toBe(false);
  });
});

describe('что не так с неверным ответом', () => {
  const accepted = [['Poproszę hot doga i wodę'], ['Poproszę wodę i hot doga']];

  it('верные формы в неверном порядке — «order», падеж ни при чём', () => {
    expect(diagnoseOrder(accepted, ['wodę', 'Poproszę', 'hot', 'doga', 'i'])).toBe('order');
  });

  it('неверная форма (woda вместо wodę) — «trap»: объяснение падежа к месту', () => {
    expect(diagnoseOrder(accepted, ['Poproszę', 'hot', 'doga', 'i', 'woda'])).toBe('trap');
    expect(diagnoseOrder(accepted, ['Poproszę', 'hot', 'dog', 'i', 'wodę'])).toBe('trap');
  });

  it('верные слова, но не все — «missing»', () => {
    expect(diagnoseOrder(accepted, ['Poproszę', 'hot', 'doga'])).toBe('missing');
  });

  it('слова из разных вариантов вперемешку — «mixed»', () => {
    expect(diagnoseOrder([['Czy mogę tu naładować telefon'], ['Czy mogę tutaj naładować telefon']], ['Czy', 'mogę', 'tu', 'tutaj', 'naładować', 'telefon'])).toBe('mixed');
  });

  it('регистр и знаки препинания не влияют', () => {
    expect(diagnoseOrder(accepted, ['wodę,', 'POPROSZĘ', 'hot', 'doga', 'i.'])).toBe('order');
  });
});
