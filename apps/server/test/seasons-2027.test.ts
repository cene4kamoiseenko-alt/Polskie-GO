/**
 * Пропуск месяца: «Święta» по ~20 минут и сезоны январь–июнь 2027 (владелец 2026-11-04). Содержание — mission-scenes-swieta.ts,
 * seasons-2027-a.ts (январь–март), seasons-2027-b.ts (апрель–июнь). Каждая миссия проходится через API до конца, сезон даёт своё достижение.
 */
import { afterAll, describe, expect, it } from 'vitest';
import { db } from '../src/db';
import { subscriptions } from '../src/db/schema';
import { MISSIONS, missionBySlug } from '../src/content/missions';
import { SEASONS, seasonState } from '../src/content/seasons';
import { SWIETA_MINUTES } from '../src/content/mission-scenes-swieta';
import { SEASON_MISSION_MINUTES } from '../src/content/seasons-2027-a';
import { ACHIEVEMENTS } from '../src/content/gamification';
import { startMission } from '../src/services/missions';
import { disposeEnv, login } from './helpers';

afterAll(disposeEnv);

const at = (day: string) => new Date(`${day}T10:00:00Z`);
/** Сезон → день в его середине. */
const NEW = ['swieta', 'karnawal', 'walentynki', 'wielkanoc', 'wiosna', 'majowka', 'wianki'] as const;
const MIDDLE: Record<(typeof NEW)[number], string> = {
  swieta: '2026-12-15', karnawal: '2027-01-15', walentynki: '2027-02-14', wielkanoc: '2027-03-20', wiosna: '2027-04-10', majowka: '2027-05-10', wianki: '2027-06-15',
};
const seasonOf = (slug: string) => SEASONS.find((s) => s.slug === slug)!;

describe('сезоны 2026-12 … 2027-06: контент', () => {
  it('сезоны идут подряд без пропусков: ноябрь → июнь, затем июль; у каждого по 3 миссии и своё достижение', () => {
    const sorted = [...SEASONS].sort((a, b) => a.start.localeCompare(b.start));
    expect(sorted.map((s) => s.slug)).toEqual(['listopad-poznan', 'swieta', 'karnawal', 'walentynki', 'wielkanoc', 'wiosna', 'majowka', 'wianki', 'energylandia']);
    // Между сезоном и следующим нет пустых месяцев: конец + 1 день = начало следующего (до июля 2027 включительно).
    for (let i = 1; i < sorted.length - 1; i++) {
      const next = new Date(`${sorted[i - 1].end}T00:00:00Z`);
      next.setUTCDate(next.getUTCDate() + 1);
      expect(next.toISOString().slice(0, 10), `${sorted[i - 1].slug} → ${sorted[i].slug}`).toBe(sorted[i].start);
    }
    expect(sorted.at(-2)!.end).toBe('2027-06-30');
    for (const slug of NEW) {
      const s = seasonOf(slug);
      expect(s.missions, slug).toHaveLength(3);
      expect(ACHIEVEMENTS.find((a) => a.slug === s.achievement)!, slug).toBeTruthy();
    }
  });

  it('«Święta»: по ~20 минут (24–25 шагов), 2 сцены дописаны в конец; новые сезоны — по ~10 минут, не меньше 12 шагов', () => {
    for (const slug of seasonOf('swieta').missions) {
      const m = missionBySlug(slug)!;
      expect(m.minutes, slug).toBe(SWIETA_MINUTES);
      expect(m.steps.length, slug).toBeGreaterThanOrEqual(24);
      expect(m.xp, slug).toBe(100);
      expect(m.zlotki, slug).toBe(50);
      // Старые шаги остались в начале (начатые прохождения не сбиваются).
      expect(m.steps[0].id, slug).not.toMatch(/^x[23]-/);
      expect(m.steps.some((s) => s.id.startsWith('x2-')) && m.steps.some((s) => s.id.startsWith('x3-')), slug).toBe(true);
    }
    for (const slug of NEW.filter((x) => x !== 'swieta')) {
      for (const ms of seasonOf(slug).missions) {
        const m = missionBySlug(ms)!;
        expect(m.minutes, ms).toBe(SEASON_MISSION_MINUTES);
        expect(m.steps.length, ms).toBeGreaterThanOrEqual(12);
        expect(m.phrases.length, ms).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('все шаги: без «послушай» (нет озвучки), у каждого неверного варианта объяснение на трёх языках, пробелов в польских ответах нет', () => {
    for (const slug of NEW) {
      for (const ms of seasonOf(slug).missions) {
        const m = missionBySlug(ms)!;
        for (const s of m.steps) {
          const key = `${ms}:${s.id}`;
          expect(s.kind, key).not.toBe('listen');
          if (s.kind === 'choice') {
            expect(s.options!.filter((o) => o.ok).length, key).toBeGreaterThanOrEqual(1);
            for (const o of s.options!.filter((x) => !x.ok)) expect(o.why?.uk && o.why.ru && o.why.en, `${key} (${o.pl ?? o.text?.ru})`).toBeTruthy();
            for (const o of s.options!) if (o.pl) expect(o.pl, key).toBe(o.pl.trim());
          } else {
            expect(s.answer, key).toBe(s.answer!.trim());
          }
          for (const l of [s.task, s.hint, s.explain]) expect(l.uk && l.ru && l.en, key).toBeTruthy();
        }
        expect(`${m.intro.uk}${m.intro.ru}${m.intro.en}${m.goal.uk}${m.goal.ru}${m.goal.en}`.length, ms).toBeGreaterThan(80);
      }
    }
  });

  it('даты праздников 2027 сверены: Tłusty Czwartek 4 февраля, Вербное воскресенье 21 марта, Пасха 28 марта, 1 мая — суббота', () => {
    const day = (d: string) => new Date(`${d}T00:00:00Z`).getUTCDay();
    expect(day('2027-02-04')).toBe(4);
    expect(day('2027-03-21')).toBe(0);
    expect(day('2027-03-28')).toBe(0);
    expect(day('2027-05-01')).toBe(6);
    expect(day('2027-05-03')).toBe(1);
    const text = (slug: string) => JSON.stringify(missionBySlug(slug)!);
    expect(text('paczki-zamowienie')).toContain('czwartego lutego');
    expect(text('palma-pisanki')).toContain('21 березня');
    expect(text('majowka-domek')).toContain('Od pierwszego do trzeciego maja');
  });
});

describe('сезоны 2026-12 … 2027-06: прохождение и награды', () => {
  for (const slug of NEW) {
    it(`«${slug}»: все миссии проходятся до конца, первая — без Premium, сезон даёт достижение`, async () => {
      const s = seasonOf(slug);
      const day = at(MIDDLE[slug]);
      expect(seasonState(s, MIDDLE[slug])).toBe('active');
      const { user, call } = await login();
      await db.insert(subscriptions).values({ userId: user.id, planCode: 'MONTH_12', startsAt: at('2026-01-01'), expiresAt: at('2028-01-01') });
      let unlocked: string[] = [];
      for (const ms of s.missions) {
        const m = missionBySlug(ms)!;
        const run = await startMission(user.id, ms, day);
        let last;
        for (const [i, st] of m.steps.entries()) {
          const answer = st.kind === 'build' ? { text: st.answer } : { option: st.options!.findIndex((o) => o.ok) };
          last = await call('POST', `/api/missions/runs/${run.runId}/answer`, { step: i, ...answer });
          expect(last.body.correct, `${ms}:${st.id}`).toBe(true);
        }
        unlocked = unlocked.concat(last!.body.finished.achievements.map((a: { slug: string }) => a.slug));
      }
      expect(unlocked).toContain(s.achievement);
    });
  }

  it('«Święta», январь и июнь дают костюм-награду за весь сезон; остальные — Złotki и значок', () => {
    const rewardOf = (slug: string) => ACHIEVEMENTS.find((a) => a.slug === seasonOf(slug).achievement)!.rewardItem;
    expect(rewardOf('swieta')).toBe('costume-winter');
    expect(rewardOf('karnawal')).toBe('costume-duffle');
    expect(rewardOf('wianki')).toBe('costume-street');
    for (const slug of ['walentynki', 'wielkanoc', 'wiosna', 'majowka']) expect(rewardOf(slug), slug).toBeUndefined();
  });

  it('первая миссия каждого нового сезона открыта без Premium, вторая и третья — нет', async () => {
    const { user } = await login();
    for (const slug of NEW) {
      const [first, second] = seasonOf(slug).missions;
      expect((await startMission(user.id, first, at(MIDDLE[slug]))).runId, `${slug}:${first}`).toBeTruthy();
      await expect(startMission(user.id, second, at(MIDDLE[slug])), `${slug}:${second}`).rejects.toMatchObject({ code: 'premium_required' });
    }
  });

  it('всего миссий в сезонах: 3 × 9 = 27; ни одна не потерялась и не продублирована', () => {
    const inSeasons = SEASONS.flatMap((s) => s.missions);
    expect(inSeasons).toHaveLength(27);
    expect(new Set(inSeasons).size).toBe(27);
    expect(MISSIONS.filter((m) => m.season)).toHaveLength(27);
  });
});
