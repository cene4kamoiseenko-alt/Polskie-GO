import { afterAll, describe, expect, it } from 'vitest';
import { and, eq } from 'drizzle-orm';
import { db } from '../src/db';
import { achievements, cosmeticItems, dailyActivity, gameWallets, missionRuns, playerProgress, quests, reviewSchedule, userAchievements, userInventory, userMissionSteps, userMissions, userQuests, userSettings, userVocabulary } from '../src/db/schema';
import { addDays, dayKey } from '@polski-go/shared';
import { goalXpFor } from '../src/services/goal';
import { buildSeedSql } from '../src/content/seed';
import { MISSIONS, type Mission, type MissionStep } from '../src/content/missions';
import { VOCAB } from '../src/content/vocab';
import { DISHES, PIEROGI_PHRASES } from '../src/content/vocab-life';
import { tokensOf } from '../src/services/missions';
import { disposeEnv, getEnv, login } from './helpers';

afterAll(disposeEnv);

type Call = Awaited<ReturnType<typeof login>>['call'];
const okOption = (s: MissionStep) => s.options!.findIndex((o) => o.ok);
const badOption = (s: MissionStep) => s.options!.findIndex((o) => !o.ok);
const rightAnswer = (s: MissionStep) => (s.kind === 'build' ? { text: s.answer } : { option: okOption(s) });
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function playMission(call: Call, m: Mission, opts: { mistakeAt?: number; hintAt?: number } = {}) {
  const start = await call('POST', `/api/missions/${m.slug}/start`);
  expect(start.status).toBe(200);
  const runId = start.body.runId as string;
  let last;
  for (const [i, s] of m.steps.entries()) {
    if (opts.hintAt === i) expect((await call('POST', `/api/missions/runs/${runId}/hint`, { step: i })).body.hint.uk).toBeTruthy();
    if (opts.mistakeAt === i) {
      const wrong = s.kind === 'build' ? { text: 'zzz' } : { option: badOption(s) };
      const r = await call('POST', `/api/missions/runs/${runId}/answer`, { step: i, ...wrong });
      expect(r.body.correct).toBe(false);
      expect(r.body.why.uk).toBeTruthy();
    }
    last = await call('POST', `/api/missions/runs/${runId}/answer`, { step: i, ...rightAnswer(s) });
    expect(last.status, `${m.slug}:${s.id} ${JSON.stringify(last.body)}`).toBe(200);
    expect(last.body.correct, `${m.slug}:${s.id}`).toBe(true);
  }
  return { runId, finished: last!.body.finished };
}

const mine = async (userId: string) =>
  (await db.select({ slug: achievements.slug }).from(userAchievements).innerJoin(achievements, eq(achievements.id, userAchievements.achievementId)).where(eq(userAchievements.userId, userId))).map((a) => a.slug);

describe('Місії: контент', () => {
  const words = new Set(VOCAB.map((v) => v.pl));

  it('кожна місія коректна: варіанти з правильною відповіддю, слова у словнику, пояснення трьома мовами', () => {
    expect(MISSIONS.length).toBeGreaterThanOrEqual(10);
    expect(new Set(MISSIONS.map((m) => m.slug)).size).toBe(MISSIONS.length);
    for (const m of MISSIONS) {
      expect(m.steps.length, m.slug).toBeGreaterThanOrEqual(5);
      expect(new Set(m.steps.map((s) => s.id)).size, m.slug).toBe(m.steps.length);
      for (const s of m.steps) {
        const key = `${m.slug}:${s.id}`;
        for (const l of [s.task, s.hint, s.explain]) expect(l.uk && l.ru && l.en, key).toBeTruthy();
        for (const w of s.words ?? []) expect(words.has(w), `${key}: слово «${w}» відсутнє у словнику`).toBe(true);
        if (s.kind === 'build') {
          expect(tokensOf(s.answer!).length, key).toBeGreaterThanOrEqual(2);
          for (const e of s.extra ?? []) expect(tokensOf(s.answer!).includes(e), `${key}: «пастка» ${e} збігається зі словом відповіді`).toBe(false);
        } else {
          expect(s.options!.length, key).toBeGreaterThanOrEqual(2);
          expect(s.options!.some((o) => o.ok), key).toBe(true);
          expect(s.options!.some((o) => !o.ok), key).toBe(true);
          for (const o of s.options!) expect(!!(o.pl || o.text), key).toBe(true);
        }
        if (s.kind === 'listen') expect(s.line?.hidden, key).toBe(true);
      }
    }
  });

  it('досягнення мають досяжні умови в наявному контенті', () => {
    const tagged = (tag: string) => MISSIONS.flatMap((m) => m.steps.filter((s) => s.tags?.includes(tag)));
    expect(MISSIONS.filter((m) => m.tags.includes('store')).length).toBeGreaterThanOrEqual(5);
    expect(tagged('city-transport').length).toBeGreaterThanOrEqual(5);
    for (const d of DISHES) expect(tagged(`dish:${d}`).length, d).toBeGreaterThan(0);
    const pierogiWords = new Set(MISSIONS.find((m) => m.slug === 'krakow-pierogi')!.steps.flatMap((s) => s.words ?? []));
    expect(PIEROGI_PHRASES.filter((w) => pierogiWords.has(w)).length).toBeGreaterThanOrEqual(10);
  });
});

describe('Місії: проходження', () => {
  const zabka = MISSIONS.find((m) => m.slug === 'zabka-first-order')!;

  it('клієнт не бачить правильних відповідей; помилка пояснюється, крок повторюється без рестарту', async () => {
    const { call } = await login();
    const start = await call('POST', `/api/missions/${zabka.slug}/start`);
    const json = JSON.stringify(start.body);
    expect(json).not.toContain('"ok"');
    expect(json).not.toContain('"why"');
    expect(json).not.toContain('"answer"');
    const runId = start.body.runId;
    // Помилка: пояснення, крок той самий.
    const wrong = await call('POST', `/api/missions/runs/${runId}/answer`, { step: 0, option: badOption(zabka.steps[0]) });
    expect(wrong.body).toMatchObject({ correct: false, mistakes: 1 });
    expect(wrong.body.why.uk).toBeTruthy();
    // Відповідь на інший крок відхиляється.
    expect((await call('POST', `/api/missions/runs/${runId}/answer`, { step: 1, text: zabka.steps[1].answer })).status).toBe(409);
    const right = await call('POST', `/api/missions/runs/${runId}/answer`, { step: 0, option: okOption(zabka.steps[0]) });
    expect(right.body).toMatchObject({ correct: true, firstTry: false, next: 1 });
    expect(right.body.line.pl).toContain('W czym mogę pomóc');
    // Повторний старт продовжує те саме проходження.
    const again = await call('POST', `/api/missions/${zabka.slug}/start`);
    expect(again.body).toMatchObject({ runId, step: 1, mistakes: 1 });
  });

  it('фразу можна скласти зі слів; регістр і розділові знаки не важливі', async () => {
    const { call } = await login();
    const start = await call('POST', `/api/missions/${zabka.slug}/start`);
    const runId = start.body.runId;
    await call('POST', `/api/missions/runs/${runId}/answer`, { step: 0, option: okOption(zabka.steps[0]) });
    const tokens: string[] = start.body.mission.steps[1].tokens;
    expect(tokens).toEqual(expect.arrayContaining(['Poproszę', 'hot', 'doga', 'i', 'wodę', 'woda', 'hot dog']));
    const r = await call('POST', `/api/missions/runs/${runId}/answer`, { step: 1, text: 'poproszę hot doga i wodę' });
    expect(r.body.correct).toBe(true);
  });

  it('перше проходження: нагорода, вирази в повторенні, досягнення; повтор — лише невеликий XP, без дублювання', async () => {
    const { call, user } = await login();
    const w0 = (await db.query.gameWallets.findFirst({ where: eq(gameWallets.userId, user.id) }))!.balance;
    const { finished } = await playMission(call, zabka, { mistakeAt: 2 });
    expect(finished).toMatchObject({ first: true, flawless: false, mistakes: 1, xp: zabka.xp, zlotki: zabka.zlotki });
    expect(finished.phrases.length).toBeGreaterThan(3);
    expect(finished.newWords.map((w: { pl: string }) => w.pl)).toEqual(expect.arrayContaining(['hot dog', 'sos', 'gazowana']));
    expect(finished.achievements.map((a: { slug: string }) => a.slug)).toEqual(expect.arrayContaining(['pierwsza-zabka', 'pierwsza-rozmowa']));
    expect(finished.achievements.map((a: { slug: string }) => a.slug)).not.toContain('bez-zaminki');
    const sos = VOCAB.find((v) => v.pl === 'sos')!;
    const vocabRows = await db.select().from(userVocabulary).where(eq(userVocabulary.userId, user.id));
    expect(vocabRows.length).toBeGreaterThan(5);
    const reviews = await db.select().from(reviewSchedule).where(and(eq(reviewSchedule.userId, user.id), eq(reviewSchedule.itemType, 'WORD')));
    expect(reviews.length).toBe(vocabRows.length);
    expect(sos).toBeTruthy();
    const w1 = (await db.query.gameWallets.findFirst({ where: eq(gameWallets.userId, user.id) }))!.balance;
    expect(w1 - w0).toBeGreaterThanOrEqual(zabka.zlotki);

    // Повтор без помилок: XP 10 (раз на день), без Złotki; тепер — «Без заминки біля каси».
    await wait(5);
    const again = await playMission(call, zabka);
    expect(again.finished).toMatchObject({ first: false, flawless: true, xp: 10, zlotki: 0 });
    expect(again.finished.achievements.map((a: { slug: string }) => a.slug)).toEqual(['bez-zaminki']);
    // Третє проходження того ж дня — XP уже не нараховується.
    const third = await playMission(call, zabka);
    expect(third.finished.xp).toBe(0);
    const slugs = await mine(user.id);
    expect(slugs.filter((s) => s === 'pierwsza-zabka')).toHaveLength(1);
    const p = await db.query.playerProgress.findFirst({ where: eq(playerProgress.userId, user.id) });
    expect(p!.xpTotal).toBeGreaterThanOrEqual(zabka.xp + 10);
  });

  it('підказка позбавляє «першої спроби»; завершене проходження не приймає відповідей', async () => {
    const { call, user } = await login();
    const { runId, finished } = await playMission(call, zabka, { hintAt: 3 });
    expect(finished).toMatchObject({ flawless: false, hints: 1, mistakes: 0 });
    const step = await db.query.userMissionSteps.findFirst({ where: and(eq(userMissionSteps.userId, user.id), eq(userMissionSteps.stepKey, `${zabka.slug}:water`)) });
    expect(step!.firstTry).toBe(false);
    expect((await call('POST', `/api/missions/runs/${runId}/answer`, { step: 0, option: 0 })).status).toBe(400);
    const run = await db.query.missionRuns.findFirst({ where: eq(missionRuns.id, runId) });
    expect(run!.status).toBe('FINISHED');
  });

  it('паралельні відповіді на той самий крок не дублюють нагороду', async () => {
    const { call, user } = await login();
    const m = MISSIONS.find((x) => x.slug === 'orlen-pump')!;
    const start = await call('POST', `/api/missions/${m.slug}/start`);
    const runId = start.body.runId;
    for (const [i, s] of m.steps.slice(0, -1).entries()) await call('POST', `/api/missions/runs/${runId}/answer`, { step: i, ...rightAnswer(s) });
    const lastIdx = m.steps.length - 1;
    const res = await Promise.all([1, 2, 3].map(() => call('POST', `/api/missions/runs/${runId}/answer`, { step: lastIdx, ...rightAnswer(m.steps[lastIdx]) })));
    expect(res.filter((r) => r.status === 200 && r.body.finished).length).toBe(1);
    const um = await db.query.userMissions.findFirst({ where: (t, { and: a, eq: e }) => a(e(t.userId, user.id), e(t.missionSlug, m.slug)) });
    expect(um!.completions).toBe(1);
    expect((await mine(user.id)).filter((s) => s === 'kolumna-trzy')).toHaveLength(1);
  });

  it('галерея: точні умови, прогрес і дата; список місій показує стан і сцени Premium', async () => {
    const { call } = await login();
    await playMission(call, MISSIONS.find((x) => x.slug === 'first-tram')!);
    const gallery = await call('GET', '/api/achievements');
    const tram = gallery.body.find((a: { slug: string }) => a.slug === 'swoj-w-tramwaju');
    expect(tram.unlockedAt).toBeTruthy();
    const shop = gallery.body.find((a: { slug: string }) => a.slug === 'lowca-zakupow');
    expect(shop).toMatchObject({ progress: 0, threshold: 5, unlockedAt: null });
    const list = await call('GET', '/api/missions');
    expect(list.body.missions.find((m: { slug: string }) => m.slug === 'first-tram').completions).toBe(1);
    // Колишні «скоро» стали сценами Premium: без Premium вони в списку із замком.
    expect(list.body.soon).toEqual([]);
    expect(list.body.missions.filter((m: { locked: boolean }) => m.locked).map((m: { slug: string }) => m.slug)).toEqual(['landlord', 'first-workday', 'doctor-appointment', 'lotnisko-lot', 'zakopane-ferie', 'warszawa-dzien']);
  });
  it('костюм за місію: лише за перше проходження, магазин показує умову, seed видає тим, хто пройшов раніше', async () => {
    const { call, user } = await login();
    const m = MISSIONS.find((x) => x.slug === 'orlen-coffee')!;
    expect(m.rewardItem).toBe('costume-barista');
    const shop0 = await call('GET', '/api/shop');
    const barista = shop0.body.items.find((i: { slug: string }) => i.slug === 'costume-barista');
    expect(barista).toMatchObject({ rewardOnly: true, owned: false, unlock: { kind: 'mission', slug: 'orlen-coffee' } });
    expect(barista.unlock.title.uk).toBe(m.title.uk);
    // Купити нагороду не можна.
    expect((await call('POST', '/api/shop/buy', { itemId: barista.id })).status).toBe(400);

    const first = await playMission(call, m);
    expect(first.finished.reward).toMatchObject({ slug: 'costume-barista', slot: 'COSTUME' });
    await wait(5);
    const again = await playMission(call, m);
    expect(again.finished.reward).toBeNull();
    const inv = await db.select().from(userInventory).innerJoin(cosmeticItems, eq(cosmeticItems.id, userInventory.itemId)).where(and(eq(userInventory.userId, user.id), eq(cosmeticItems.slug, 'costume-barista')));
    expect(inv).toHaveLength(1);
    expect(inv[0].user_inventory.source).toBe('mission:orlen-coffee');

    // Пройшов місію до появи костюма: seed видає його один раз і не чіпає інші предмети.
    const old = await login();
    await db.insert(userMissions).values({ userId: old.user.id, missionSlug: 'train-wroclaw', completions: 2, flawless: 0, bestMistakes: 1, firstCompletedAt: new Date(), lastCompletedAt: new Date() });
    const { env } = await getEnv();
    const late = buildSeedSql().filter((q) => q.startsWith('INSERT INTO user_inventory'));
    expect(late.length).toBeGreaterThanOrEqual(4);
    for (let k = 0; k < 2; k++) for (const q of late) await env.DB.prepare(q).run();
    const got = await db.select({ slug: cosmeticItems.slug }).from(userInventory).innerJoin(cosmeticItems, eq(cosmeticItems.id, userInventory.itemId)).where(eq(userInventory.userId, old.user.id));
    expect(got.map((g) => g.slug).filter((x) => x.startsWith('costume-'))).toEqual(['costume-conductor']);
  });

  it('перший візит до urzędu відкриває досягнення «Перший візит до urzędu»', async () => {
    const { call } = await login();
    const urzad = MISSIONS.find((m) => m.slug === 'urzad-pesel')!;
    const { finished } = await playMission(call, urzad);
    expect(finished.achievements.map((a: { slug: string }) => a.slug)).toContain('pierwszy-urzad');
    expect(finished.newWords.map((w: { pl: string }) => w.pl)).toEqual(expect.arrayContaining(['numerek', 'stanowisko', 'potwierdzenie']));
  });
});

describe('Місії: XP у завданнях і денна мета', () => {
  const zabka = MISSIONS.find((m) => m.slug === 'zabka-first-order')!;

  it('XP місії зараховується в завдання «Отримай 100 XP»; денна мета не «виконується» подвійним підрахунком XP', async () => {
    const { call, user } = await login();
    await db.update(userSettings).set({ dailyGoalMinutes: 10, timezone: 'Europe/Warsaw' }).where(eq(userSettings.userId, user.id));
    const goal = goalXpFor(10);
    const today = dayKey(new Date(), 'Europe/Warsaw');
    // Шість попередніх днів мету виконано; сьогодні до місії бракує рівно zabka.xp + 1.
    for (let i = 1; i <= 6; i++) await db.insert(dailyActivity).values({ userId: user.id, day: addDays(today, -i), xp: goal });
    const before = goal - zabka.xp - 1;
    expect(before).toBeGreaterThan(0);
    await db.insert(dailyActivity).values({ userId: user.id, day: today, xp: before });
    const xpQuest = (await db.select().from(quests).where(eq(quests.slug, 'd-xp-100')))[0];
    await db.insert(userQuests).values({ userId: user.id, questId: xpQuest.id, periodKey: today, progress: 0, status: 'ACTIVE', state: {} }).onConflictDoNothing();

    const { finished } = await playMission(call, zabka);
    expect(finished.xp).toBe(zabka.xp);
    const quest = (await db.select().from(userQuests).where(and(eq(userQuests.userId, user.id), eq(userQuests.questId, xpQuest.id), eq(userQuests.periodKey, today))))[0];
    expect(quest.progress).toBe(zabka.xp);
    // Сьогодні goal − 1 XP: сьомого дня мети ще немає — досягнення «7 днів» не відкривається.
    const day = (await db.select().from(dailyActivity).where(and(eq(dailyActivity.userId, user.id), eq(dailyActivity.day, today))))[0];
    expect(day.xp).toBe(goal - 1);
    expect(await mine(user.id)).not.toContain('siedem-dni');
  });
});
