/**
 * Пропуск місяця (ADR-011): сезонні місії, доступ за датами й Premium, нагорода сезону, контент.
 * Дата «сьогодні» передається у сервіси явно (`now`): тест не залежить від того, коли його запущено.
 */
import { afterAll, describe, expect, it } from 'vitest';
import { db } from '../src/db';
import { subscriptions } from '../src/db/schema';
import { MISSIONS, missionBySlug } from '../src/content/missions';
import { SEASONS, seasonState, isFreeSeasonMission } from '../src/content/seasons';
import { ACHIEVEMENTS } from '../src/content/gamification';
import { VOCAB } from '../src/content/vocab';
import { listMissions, startMission } from '../src/services/missions';
import { disposeEnv, login } from './helpers';

afterAll(disposeEnv);

const at = (day: string) => new Date(`${day}T10:00:00Z`);
const NOV = at('2026-11-11');
const DEC = at('2026-12-05');

async function premiumUser() {
  const u = await login();
  await db.insert(subscriptions).values({ userId: u.user.id, planCode: 'MONTH_12', startsAt: at('2026-01-01'), expiresAt: at('2028-01-01') });
  return u;
}

const errorOf = async (p: Promise<unknown>) => {
  try {
    await p;
    return null;
  } catch (e) {
    return (e as { code?: string; message?: string }).code ?? (e as Error).message;
  }
};

describe('пропуск місяця: контент', () => {
  it('сезони не перетинаються, у кожного — місії з тегом сезону й досягнення на всі місії', () => {
    const sorted = [...SEASONS].sort((a, b) => a.start.localeCompare(b.start));
    for (const [i, s] of sorted.entries()) {
      expect(s.start <= s.end, s.slug).toBe(true);
      if (i) expect(sorted[i - 1].end < s.start, `${sorted[i - 1].slug} / ${s.slug}`).toBe(true);
      expect(s.missions.length, s.slug).toBeGreaterThanOrEqual(3);
      const ach = ACHIEVEMENTS.find((a) => a.slug === s.achievement)!;
      expect(ach, s.slug).toBeTruthy();
      expect(ach.metric).toBe(`MISSIONS_TAG:season-${s.slug}`);
      expect(ach.threshold).toBe(s.missions.length);
      for (const slug of s.missions) {
        const m = missionBySlug(slug)!;
        expect(m, slug).toBeTruthy();
        expect(m).toMatchObject({ season: s.slug, category: 'season' });
        expect(m.tags).toContain(`season-${s.slug}`);
        expect(m.premium, slug).toBeFalsy();
      }
    }
    // Місія сезону належить лише одному сезону, і жодна звичайна місія не позначена сезоном.
    const inSeasons = SEASONS.flatMap((s) => s.missions);
    expect(new Set(inSeasons).size).toBe(inSeasons.length);
    expect(MISSIONS.filter((m) => m.season).map((m) => m.slug).sort()).toEqual([...inSeasons].sort());
  });

  it('у місіях сезонів немає кроків «послухай» (без аудіо їх не пройти), слова — у словнику', () => {
    const words = new Set(VOCAB.map((v) => v.pl));
    for (const m of MISSIONS.filter((x) => x.season)) {
      expect(m.steps.some((s) => s.kind === 'listen'), m.slug).toBe(false);
      for (const s of m.steps) for (const w of s.words ?? []) expect(words.has(w), `${m.slug}:${s.id} «${w}»`).toBe(true);
      expect(m.phrases.length, m.slug).toBeGreaterThanOrEqual(3);
    }
  });

  it('стан сезону за днем учня: межі включно', () => {
    const nov = SEASONS.find((s) => s.slug === 'listopad-poznan')!;
    expect(seasonState(nov, '2026-10-31')).toBe('upcoming');
    expect(seasonState(nov, '2026-11-01')).toBe('active');
    expect(seasonState(nov, '2026-11-30')).toBe('active');
    expect(seasonState(nov, '2026-12-01')).toBe('archive');
    expect(isFreeSeasonMission(nov, 'marcin-rogal')).toBe(true);
    expect(isFreeSeasonMission(nov, 'andrzejki-wosk')).toBe(false);
  });
});

describe('пропуск місяця: доступ', () => {
  it('без Premium у сезоні: перша місія відкрита, решта — замок; майбутній сезон закритий; загальний список без сезонних місій', async () => {
    const { user } = await login();
    const list = await listMissions(user.id, NOV);
    expect(list.missions.some((m) => m.season)).toBe(false);
    expect(list.missions.filter((m) => m.locked).map((m) => m.slug)).toEqual(['landlord', 'first-workday', 'doctor-appointment']);

    const cur = list.pass.current!;
    expect(cur).toMatchObject({ slug: 'listopad-poznan', state: 'active', daysLeft: 20, done: 0, total: 3 });
    expect(cur.missions.map((m) => [m.slug, m.open, m.locked, m.free])).toEqual([
      ['marcin-rogal', true, false, true],
      ['listopad-swieto', false, true, false],
      ['andrzejki-wosk', false, true, false],
    ]);
    expect(list.pass.upcoming.map((s) => s.slug)).toEqual(['swieta', 'energylandia']);
    expect(list.pass.upcoming[0]).toMatchObject({ state: 'upcoming', startsIn: 20 });
    expect(list.pass.archive).toEqual([]);

    expect((await startMission(user.id, 'marcin-rogal', NOV)).runId).toBeTruthy();
    expect(await errorOf(startMission(user.id, 'listopad-swieto', NOV))).toBe('premium_required');
    expect(await errorOf(startMission(user.id, 'jarmark-oscypek', NOV))).toBe('season_not_started');
  });

  it('після кінця сезону: без Premium закрита навіть перша місія; з Premium — архів відкритий', async () => {
    const free = await login();
    const freeList = await listMissions(free.user.id, DEC);
    expect(freeList.pass.current!.slug).toBe('swieta');
    expect(freeList.pass.archive.map((s) => s.slug)).toEqual(['listopad-poznan']);
    expect(freeList.pass.archive[0].missions.every((m) => m.locked && !m.open)).toBe(true);
    expect(await errorOf(startMission(free.user.id, 'marcin-rogal', DEC))).toBe('premium_required');

    const prem = await premiumUser();
    const list = await listMissions(prem.user.id, DEC);
    expect(list.pass.premium).toBe(true);
    expect([...list.pass.current!.missions, ...list.pass.archive[0].missions].every((m) => m.open && !m.locked)).toBe(true);
    expect((await startMission(prem.user.id, 'andrzejki-wosk', DEC)).runId).toBeTruthy();
    // Майбутній сезон закритий навіть із Premium.
    expect(await errorOf(startMission(prem.user.id, 'park-bilety', DEC))).toBe('season_not_started');
  });

  it('пряма HTTP-спроба почати майбутній сезон — 403 season_not_started', async () => {
    const { call } = await login();
    // Сезон парку розваг — улітку 2027-го; на будь-яку дату запуску тестів до того він ще не почався.
    const r = await call('POST', '/api/missions/park-bilety/start');
    expect(r.status).toBe(403);
    expect(r.body.error).toBe('season_not_started');
  });
});

describe('пропуск місяця: нагорода сезону', () => {
  it('усі місії сезону → досягнення сезону з Złotki; прогрес пропуску — 3 з 3', async () => {
    const { user, call } = await premiumUser();
    const nov = SEASONS.find((s) => s.slug === 'listopad-poznan')!;
    let unlocked: string[] = [];
    for (const slug of nov.missions) {
      const m = missionBySlug(slug)!;
      const run = await startMission(user.id, slug, NOV);
      let last;
      for (const [i, s] of m.steps.entries()) {
        const answer = s.kind === 'build' ? { text: s.answer } : { option: s.options!.findIndex((o) => o.ok) };
        last = await call('POST', `/api/missions/runs/${run.runId}/answer`, { step: i, ...answer });
        expect(last.body.correct, `${slug}:${s.id}`).toBe(true);
      }
      unlocked = unlocked.concat(last!.body.finished.achievements.map((a: { slug: string }) => a.slug));
    }
    expect(unlocked).toContain('sezon-listopad');
    const list = await listMissions(user.id, NOV);
    expect(list.pass.current).toMatchObject({ done: 3, total: 3, reward: { achievement: 'sezon-listopad', zlotki: 150, done: true } });
  });
});
