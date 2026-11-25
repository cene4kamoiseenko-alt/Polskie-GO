/**
 * Правило «одно сообщение бота в день» (docs/superpowers/specs/2026-11-24-engagement-design.md, раздел 1): по старшинству
 * возвращение → новичок → миссия недели → вопрос дня; карточки не идут тем, кто сегодня был в приложении, кто их выключил,
 * и пока владелец не включил их в админке.
 */
import { describe, expect, it } from 'vitest';
import { kindPaused, needsMissionFacts, pickDailyMessage, pickFreeMission, type CardHistory, type MissionFacts, type PickInput } from '../src/bot/engage/pick';

const free = { slug: 'zabka-first-order', title: 'Первый заказ в Żabce', minutes: 10, category: 'shop' };
const mission = (over: Partial<MissionFacts> = {}): MissionFacts => ({ daysSinceMissionStart: null, freeMission: free, ...over });

// 2026-12-05 — суббота (weekday 6).
const base: PickInput = {
  today: '2026-12-05',
  weekday: 6,
  enabled: true,
  hasUser: true,
  optedOut: false,
  seenToday: false,
  registeredDay: '2026-10-01',
  contactDay: '2026-10-01',
  lessonsCompleted: 5,
  lastActiveDay: '2026-12-04',
  history: [],
  mission: null,
};
const pick = (over: Partial<PickInput>) => pickDailyMessage({ ...base, ...over });

describe('одно сообщение бота в день', () => {
  it('выключено / выключил карточки / сегодня был в игре → вопрос', () => {
    const away = { lastActiveDay: '2026-11-28' };
    expect(pick({ ...away })).toEqual({ kind: 'comeback' });
    expect(pick({ ...away, enabled: false })).toEqual({ kind: 'quiz' });
    // Без аккаунта — своя карточка «Старт» (ниже); без даты «Старта» — вопрос.
    expect(pick({ ...away, hasUser: false, contactDay: null })).toEqual({ kind: 'quiz' });
    expect(pick({ ...away, optedOut: true })).toEqual({ kind: 'quiz' });
    expect(pick({ ...away, seenToday: true })).toEqual({ kind: 'quiz' });
  });

  it('возвращение на 7-й и 14-й день без занятий', () => {
    expect(pick({ lastActiveDay: '2026-11-28' })).toEqual({ kind: 'comeback' });
    expect(pick({ lastActiveDay: '2026-11-21' })).toEqual({ kind: 'comeback' });
    expect(pick({ lastActiveDay: '2026-11-27' })).toEqual({ kind: 'quiz' });
    expect(pick({ lastActiveDay: '2026-11-29' })).toEqual({ kind: 'quiz' });
  });

  // Владелец 2026-11-25: «нужно, чтобы люди, которые не заходят в игру, зашли» — новичку 1-й, 3-й, 7-й день, дальше раз в неделю, всего 3.
  it('новичок (урок не пройден): 1-й, 3-й, 7-й день, потом раз в неделю; не больше трёх карточек', () => {
    const fresh = { lessonsCompleted: 0, lastActiveDay: null };
    expect(pick({ ...fresh, registeredDay: '2026-12-04' })).toEqual({ kind: 'newcomer' });
    expect(pick({ ...fresh, registeredDay: '2026-12-02' })).toEqual({ kind: 'newcomer' });
    expect(pick({ ...fresh, registeredDay: '2026-11-28' })).toEqual({ kind: 'newcomer' });
    expect(pick({ ...fresh, registeredDay: '2026-12-03' })).toEqual({ kind: 'quiz' });
    expect(pick({ ...fresh, registeredDay: '2026-12-05' })).toEqual({ kind: 'quiz' });
    // Зарегистрировался давно и карточек не было — карточка; последняя была 3 дня назад — нет; 7 дней назад — да.
    expect(pick({ ...fresh, registeredDay: '2026-11-01' })).toEqual({ kind: 'newcomer' });
    expect(pick({ ...fresh, registeredDay: '2026-11-01', history: [{ kind: 'newcomer', day: '2026-12-02', opened: true }] })).toEqual({ kind: 'quiz' });
    expect(pick({ ...fresh, registeredDay: '2026-11-01', history: [{ kind: 'newcomer', day: '2026-11-28', opened: true }] })).toEqual({ kind: 'newcomer' });
    const three: CardHistory[] = [
      { kind: 'newcomer', day: '2026-11-21', opened: true },
      { kind: 'newcomer', day: '2026-11-14', opened: true },
      { kind: 'newcomer', day: '2026-11-07', opened: true },
    ];
    expect(pick({ ...fresh, registeredDay: '2026-11-01', history: three })).toEqual({ kind: 'quiz' });
  });

  it('нажал «Старт» в боте, в игру не заходил: 1-й, 3-й, 7-й день после «Старта», потом раз в неделю; не больше трёх', () => {
    const botOnly = { hasUser: false, lessonsCompleted: 0, lastActiveDay: null, registeredDay: null };
    expect(pick({ ...botOnly, contactDay: '2026-12-04' })).toEqual({ kind: 'start' });
    expect(pick({ ...botOnly, contactDay: '2026-12-02' })).toEqual({ kind: 'start' });
    expect(pick({ ...botOnly, contactDay: '2026-11-28' })).toEqual({ kind: 'start' });
    expect(pick({ ...botOnly, contactDay: '2026-12-03' })).toEqual({ kind: 'quiz' });
    expect(pick({ ...botOnly, contactDay: '2026-12-05' })).toEqual({ kind: 'quiz' });
    // Нажал давно: карточка раз в неделю, всего три.
    expect(pick({ ...botOnly, contactDay: '2026-10-01' })).toEqual({ kind: 'start' });
    expect(pick({ ...botOnly, contactDay: '2026-10-01', history: [{ kind: 'start', day: '2026-12-01', opened: false }] })).toEqual({ kind: 'quiz' });
    expect(pick({ ...botOnly, contactDay: '2026-10-01', history: [{ kind: 'start', day: '2026-11-28', opened: false }] })).toEqual({ kind: 'start' });
    const three: CardHistory[] = [
      { kind: 'start', day: '2026-11-28', opened: true },
      { kind: 'start', day: '2026-11-21', opened: true },
      { kind: 'start', day: '2026-11-14', opened: true },
    ];
    expect(pick({ ...botOnly, contactDay: '2026-10-01', history: three })).toEqual({ kind: 'quiz' });
    // Выключил карточки или всё выключено — вопрос дня, как раньше; без даты «Старта» — тоже вопрос.
    expect(pick({ ...botOnly, contactDay: '2026-12-04', optedOut: true })).toEqual({ kind: 'quiz' });
    expect(pick({ ...botOnly, contactDay: '2026-12-04', enabled: false })).toEqual({ kind: 'quiz' });
    expect(pick({ ...botOnly, contactDay: null })).toEqual({ kind: 'quiz' });
  });

  it('пропал после уроков: 3-й, 7-й, 14-й, 30-й день, дальше раз в месяц', () => {
    for (const d of ['2026-12-02', '2026-11-28', '2026-11-21', '2026-11-05']) expect(pick({ lastActiveDay: d }), d).toEqual({ kind: 'comeback' });
    for (const d of ['2026-12-03', '2026-11-30', '2026-11-20']) expect(pick({ lastActiveDay: d }), d).toEqual({ kind: 'quiz' });
    // Пропал давно: раз в месяц (последняя карточка возвращения — 31 день назад — да, 10 дней назад — нет).
    expect(pick({ lastActiveDay: '2026-09-01', history: [{ kind: 'comeback', day: '2026-11-04', opened: false }] })).toEqual({ kind: 'comeback' });
    expect(pick({ lastActiveDay: '2026-09-01', history: [{ kind: 'comeback', day: '2026-11-25', opened: false }] })).toEqual({ kind: 'quiz' });
  });

  it('старшинство: возвращение раньше новичка и миссии', () => {
    expect(pick({ lessonsCompleted: 0, registeredDay: '2026-12-04', lastActiveDay: '2026-11-28', mission: mission() })).toEqual({ kind: 'comeback' });
  });

  it('миссия недели — только в субботу и только активным', () => {
    const active = { lastActiveDay: '2026-12-03', lessonsCompleted: 3 };
    expect(pick({ ...active, mission: mission() })).toEqual({ kind: 'mission', mission: free });
    expect(pick({ ...active, today: '2026-12-04', weekday: 5, mission: mission() })).toEqual({ kind: 'quiz' });
    expect(pick({ ...active, mission: mission({ daysSinceMissionStart: 10 }) })).toEqual({ kind: 'quiz' });
    expect(pick({ ...active, mission: mission({ daysSinceMissionStart: 15 }) })).toEqual({ kind: 'mission', mission: free });
    expect(pick({ ...active, mission: mission({ freeMission: null }) })).toEqual({ kind: 'quiz' });
    expect(pick({ ...active, mission: null })).toEqual({ kind: 'quiz' });
    // Не занимался неделю — миссия не приходит (у него своя карточка или вопрос).
    expect(pick({ lastActiveDay: '2026-11-27', lessonsCompleted: 3, mission: mission() })).toEqual({ kind: 'quiz' });
  });

  it('карточки «вернуть в игру» (старт, новичок, возвращение) молчат 30 дней после трёх неоткрытых подряд, а не двух', () => {
    const two: CardHistory[] = [
      { kind: 'comeback', day: '2026-11-28', opened: false },
      { kind: 'comeback', day: '2026-11-21', opened: false },
    ];
    expect(kindPaused(two, 'comeback', '2026-12-05')).toBe(false);
    expect(kindPaused([...two, { kind: 'comeback', day: '2026-11-05', opened: false }], 'comeback', '2026-12-05')).toBe(true);
    expect(kindPaused([...two, { kind: 'comeback', day: '2026-11-05', opened: true }], 'comeback', '2026-12-05')).toBe(false);
  });

  it('две неоткрытые карточки миссии подряд → миссия молчит 30 дней', () => {
    const ignored: CardHistory[] = [
      { kind: 'mission', day: '2026-11-28', opened: false },
      { kind: 'mission', day: '2026-11-21', opened: false },
    ];
    expect(kindPaused(ignored, 'mission', '2026-12-05')).toBe(true);
    expect(kindPaused([ignored[0], { ...ignored[1], opened: true }], 'mission', '2026-12-05')).toBe(false);
    expect(kindPaused([{ ...ignored[0], day: '2026-10-31' }, { ...ignored[1], day: '2026-10-24' }], 'mission', '2026-12-05')).toBe(false);
    expect(kindPaused([ignored[0]], 'mission', '2026-12-05')).toBe(false);
    // Карточки другого вида не считаются.
    expect(kindPaused(ignored, 'comeback', '2026-12-05')).toBe(false);
    expect(pick({ lastActiveDay: '2026-12-03', lessonsCompleted: 3, mission: mission(), history: ignored })).toEqual({ kind: 'quiz' });
  });

  it('факты о миссиях нужны только в субботу активному игроку', () => {
    const { history: _h, mission: _m, ...rest } = base;
    expect(needsMissionFacts({ ...rest, lastActiveDay: '2026-11-30' })).toBe(true);
    expect(needsMissionFacts({ ...rest, lastActiveDay: '2026-11-28' })).toBe(false);
    expect(needsMissionFacts({ ...rest, weekday: 5, today: '2026-12-04' })).toBe(false);
    expect(needsMissionFacts({ ...rest, hasUser: false })).toBe(false);
    expect(needsMissionFacts({ ...rest, seenToday: true })).toBe(false);
    expect(needsMissionFacts({ ...rest, lessonsCompleted: 0 })).toBe(false);
    expect(needsMissionFacts({ ...rest, enabled: false })).toBe(false);
  });
});

describe('какую миссию предложить в «Миссии недели» (владелец 2026-11-24: «постоянно только за миссию в Жабке»)', () => {
  const m = (slug: string) => ({ slug, title: slug, minutes: 10, category: 'shop' });
  const list = [m('zabka'), m('biedronka'), m('lidl')];
  const sent = (slug: string, day: string): CardHistory => ({ kind: 'mission', day, opened: false, variant: slug });
  it('первая — первая непройденная по списку', () => {
    expect(pickFreeMission(list, [])?.slug).toBe('zabka');
  });
  it('уже присылали — следующая, которую ещё не присылали', () => {
    expect(pickFreeMission(list, [sent('zabka', '2026-12-05')])?.slug).toBe('biedronka');
    expect(pickFreeMission(list, [sent('zabka', '2026-12-05'), sent('biedronka', '2026-12-12')])?.slug).toBe('lidl');
  });
  it('все уже присылали — та, что приходила давнее всех; другие виды карточек не мешают', () => {
    const h = [sent('lidl', '2026-12-05'), sent('zabka', '2026-12-12'), sent('biedronka', '2026-12-19'), { kind: 'comeback' as const, day: '2026-12-20', opened: false, variant: 'gift' }];
    expect(pickFreeMission(list, h)?.slug).toBe('lidl');
  });
  it('нет непройденных — нет миссии', () => {
    expect(pickFreeMission([], [])).toBeNull();
  });
});
