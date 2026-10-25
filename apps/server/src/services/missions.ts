/**
 * Місії «Польська в житті».
 * Клієнт отримує кроки без правильних відповідей; кожну відповідь перевіряє сервер.
 * Помилка — пояснення й нова спроба того самого кроку (історія не починається заново).
 * Перше проходження дає повну нагороду, повторні — невеликий XP раз на день.
 */
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { normalize, seededRandom, shuffle, type I18n } from '@polski-go/shared';
import { atomic, chunks, db, type Stmt } from '../db';
import { cosmeticItems, missionRuns, newId, reviewSchedule, userMissionSteps, userMissions, userVocabulary, vocabularyEntries, xpEvents } from '../db/schema';
import { MISSIONS, MISSIONS_SOON, missionBySlug, type Mission, type MissionStep } from '../content/missions';
import { badRequest, notFound, HttpError } from '../lib/errors';
import { evaluateAchievements } from './achievements';
import { grantItem, grantXp, grantZlotki, loadCtx, touchActivity } from './rewards';

const REPEAT_XP = 10;
type Run = typeof missionRuns.$inferSelect;

const hashSeed = (s: string) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7);

/** Слова фрази для збирання (без розділових знаків; багатослівні «пастки» лишаються одним блоком). */
export const tokensOf = (answer: string) => answer.replace(/[.,!?;:„”"]/g, ' ').split(/\s+/).filter(Boolean);
const cleanPhrase = (s: string) => normalize(s.replace(/[.,!?;:„”"]/g, ' '));

/** Крок для клієнта: без позначок правильності; порядок варіантів і слів стабільний для проходження. */
function publicStep(m: Mission, step: MissionStep, seed: string) {
  const rnd = seededRandom(hashSeed(`${seed}:${step.id}`));
  const base = { id: step.id, kind: step.kind, line: step.line ?? null, task: step.task };
  if (step.kind === 'build') {
    return { ...base, tokens: shuffle([...tokensOf(step.answer!), ...(step.extra ?? [])], rnd) };
  }
  const order = shuffle(step.options!.map((_, i) => i), rnd);
  return { ...base, options: order.map((i) => ({ id: i, pl: step.options![i].pl ?? null, text: step.options![i].text ?? null })) };
}

function summaryOf(m: Mission) {
  return {
    slug: m.slug, category: m.category, tags: m.tags, city: m.city, scene: m.scene, title: m.title, goal: m.goal,
    minutes: m.minutes, xp: m.xp, zlotki: m.zlotki, steps: m.steps.length, rewardItem: m.rewardItem ?? null,
  };
}

export async function listMissions(userId: string) {
  const [mine, active] = await Promise.all([
    db.select().from(userMissions).where(eq(userMissions.userId, userId)),
    db.select({ slug: missionRuns.missionSlug, step: missionRuns.step }).from(missionRuns).where(and(eq(missionRuns.userId, userId), eq(missionRuns.status, 'ACTIVE'))),
  ]);
  return {
    missions: MISSIONS.map((m) => {
      const u = mine.find((x) => x.missionSlug === m.slug);
      const a = active.find((x) => x.slug === m.slug);
      return { ...summaryOf(m), completions: u?.completions ?? 0, flawless: (u?.flawless ?? 0) > 0, inProgress: a ? a.step : null };
    }),
    soon: MISSIONS_SOON,
  };
}

async function activeRun(userId: string, slug: string): Promise<Run | undefined> {
  const [run] = await db
    .select()
    .from(missionRuns)
    .where(and(eq(missionRuns.userId, userId), eq(missionRuns.missionSlug, slug), eq(missionRuns.status, 'ACTIVE')))
    .orderBy(desc(missionRuns.startedAt))
    .limit(1);
  return run;
}

function runView(m: Mission, run: Run) {
  return {
    runId: run.id, step: run.step, mistakes: run.mistakes, hints: run.hints,
    mission: { ...summaryOf(m), intro: m.intro, note: m.note ?? null, npc: m.npc, steps: m.steps.map((s) => publicStep(m, s, run.id)) },
  };
}

/** Почати місію або продовжити незавершене проходження. */
export async function startMission(userId: string, slug: string) {
  const m = missionBySlug(slug);
  if (!m) throw notFound('mission_not_found');
  const existing = await activeRun(userId, slug);
  if (existing) return runView(m, existing);
  const run: Run = { id: newId(), userId, missionSlug: slug, step: 0, mistakes: 0, hints: 0, stepFailed: false, status: 'ACTIVE', version: 0, startedAt: new Date(), finishedAt: null };
  await db.insert(missionRuns).values(run);
  return runView(m, run);
}

async function loadRun(userId: string, runId: string) {
  const [run] = await db.select().from(missionRuns).where(and(eq(missionRuns.id, runId), eq(missionRuns.userId, userId)));
  if (!run) throw notFound('run_not_found');
  if (run.status !== 'ACTIVE') throw badRequest('run_finished');
  const m = missionBySlug(run.missionSlug);
  if (!m) throw notFound('mission_not_found');
  return { run, m };
}

const bump = (run: Run, set: Partial<Run>) =>
  db.update(missionRuns).set({ ...set, version: run.version + 1 }).where(eq(missionRuns.id, run.id));

/** Підказка до поточного кроку: позначає крок як «не з першої спроби». */
export async function missionHint(userId: string, runId: string, stepIdx: number) {
  const { run, m } = await loadRun(userId, runId);
  if (stepIdx !== run.step) throw new HttpError(409, 'conflict', 'Крок уже змінився');
  const step = m.steps[run.step];
  await atomic([bump(run, { hints: run.hints + 1, stepFailed: true })]);
  return { hint: step.hint };
}

function isCorrect(step: MissionStep, answer: { option?: number; text?: string }) {
  if (step.kind === 'build') {
    const given = cleanPhrase(answer.text ?? '');
    return [step.answer!, ...(step.accept ?? [])].some((a) => cleanPhrase(a) === given);
  }
  const opt = step.options![answer.option ?? -1];
  if (!opt) throw badRequest('bad_option');
  return opt.ok;
}

/** Відповідь на крок. Правильна — перехід далі (на останньому кроці — завершення й нагороди). */
export async function answerMission(userId: string, runId: string, stepIdx: number, answer: { option?: number; text?: string }) {
  const { run, m } = await loadRun(userId, runId);
  if (stepIdx !== run.step) throw new HttpError(409, 'conflict', 'Крок уже змінився');
  const step = m.steps[run.step];
  const correct = isCorrect(step, answer);
  const reveal = { line: step.line ?? null, explain: step.explain };

  if (!correct) {
    await atomic([bump(run, { mistakes: run.mistakes + 1, stepFailed: true })]);
    const why: I18n | undefined = step.kind === 'build' ? undefined : step.options![answer.option!].why;
    return { correct: false, why: why ?? step.explain, mistakes: run.mistakes + 1 };
  }

  const firstTry = !run.stepFailed;
  const stepKey = `${m.slug}:${step.id}`;
  const stepStmt = db
    .insert(userMissionSteps)
    .values({ userId, stepKey, firstTry })
    .onConflictDoUpdate({ target: [userMissionSteps.userId, userMissionSteps.stepKey], set: { firstTry: sql`max(${userMissionSteps.firstTry}, ${firstTry ? 1 : 0})` } });
  const last = run.step === m.steps.length - 1;
  if (!last) {
    await atomic([bump(run, { step: run.step + 1, stepFailed: false }), stepStmt]);
    return { correct: true, firstTry, ...reveal, next: run.step + 1 };
  }
  const finished = await finishMission(userId, run, m, firstTry, stepStmt);
  return { correct: true, firstTry, ...reveal, next: null, finished };
}

async function finishMission(userId: string, run: Run, m: Mission, lastFirstTry: boolean, stepStmt: Stmt) {
  const ctx = await loadCtx(userId);
  const now = ctx.now;
  const flawless = run.mistakes === 0 && run.hints === 0 && lastFirstTry;
  const [prevRow, vocab, rewardRow] = await Promise.all([
    db.select().from(userMissions).where(and(eq(userMissions.userId, userId), eq(userMissions.missionSlug, m.slug))),
    db.select({ id: vocabularyEntries.id, pl: vocabularyEntries.pl, translations: vocabularyEntries.translations }).from(vocabularyEntries)
      .where(inArray(vocabularyEntries.pl, [...new Set(m.steps.flatMap((s) => s.words ?? []))].concat('-'))),
    m.rewardItem
      ? db.select({ id: cosmeticItems.id, slug: cosmeticItems.slug, name: cosmeticItems.name, slot: cosmeticItems.slot }).from(cosmeticItems).where(and(eq(cosmeticItems.slug, m.rewardItem), eq(cosmeticItems.isActive, true)))
      : Promise.resolve([]),
  ]);
  const prev = prevRow[0];
  const first = !prev;
  // Перше проходження — повна нагорода; повторне — невеликий XP раз на день за місію.
  const xpKey = first ? `mission:${userId}:${m.slug}` : `mission:${userId}:${m.slug}:${ctx.day}`;
  const already = await db.query.xpEvents.findFirst({ where: eq(xpEvents.idempotencyKey, xpKey), columns: { id: true } });
  const xp = grantXp(ctx, already ? 0 : first ? m.xp : REPEAT_XP, 'mission', xpKey);
  const zl = grantZlotki(userId, first ? m.zlotki : 0, 'mission', `mission:${userId}:${m.slug}`, now);
  const elapsed = Math.min(Math.round((now.getTime() - run.startedAt.getTime()) / 1000), 1800);
  const activity = touchActivity(ctx, { exercises: m.steps.length + run.mistakes, correct: m.steps.length, seconds: elapsed });

  const known = new Set(
    vocab.length
      ? (await db.select({ id: userVocabulary.entryId }).from(userVocabulary).where(and(eq(userVocabulary.userId, userId), inArray(userVocabulary.entryId, vocab.map((v) => v.id))))).map((r) => r.id)
      : [],
  );
  const fresh = vocab.filter((v) => !known.has(v.id));

  const stmts: Stmt[] = [
    // Першим — закриття проходження з перевіркою версії: паралельне завершення відкотить пакет.
    bump(run, { step: m.steps.length, status: 'FINISHED', finishedAt: now }),
    stepStmt,
    db
      .insert(userMissions)
      .values({ userId, missionSlug: m.slug, completions: 1, flawless: flawless ? 1 : 0, bestMistakes: run.mistakes, firstCompletedAt: now, lastCompletedAt: now })
      .onConflictDoUpdate({
        target: [userMissions.userId, userMissions.missionSlug],
        set: {
          completions: sql`${userMissions.completions} + 1`,
          flawless: sql`${userMissions.flawless} + ${flawless ? 1 : 0}`,
          bestMistakes: sql`min(${userMissions.bestMistakes}, ${run.mistakes})`,
          lastCompletedAt: now,
        },
      }),
    ...xp.stmts,
    ...zl.stmts,
    ...activity.stmts,
  ];
  // Костюм за місію — лише за перше проходження (повторна видача ігнорується первинним ключем).
  const reward = first ? (rewardRow[0] ?? null) : null;
  if (reward) stmts.push(grantItem(userId, reward.id, `mission:${m.slug}`));
  // Вирази місії → словник і розклад повторень (перше повторення — завтра).
  if (fresh.length) {
    for (const part of chunks(fresh)) {
      stmts.push(
        db.insert(userVocabulary).values(part.map((v) => ({ userId, entryId: v.id, status: 'LEARNING' as const, timesSeen: 1 }))).onConflictDoNothing(),
        db
          .insert(reviewSchedule)
          .values(part.map((v) => ({ userId, itemType: 'WORD', itemId: v.id, intervalDays: 1, repetitions: 1, dueAt: new Date(now.getTime() + 86_400_000) })))
          .onConflictDoNothing(),
      );
    }
  }
  await atomic(stmts);

  // Досягнення — після запису, щоб метрики місій уже враховували це проходження.
  const ach = await evaluateAchievements(userId, null, { TODAY_XP: xp.granted });
  if (ach.stmts.length) await atomic(ach.stmts);

  return {
    first, flawless, mistakes: run.mistakes, hints: run.hints, xp: xp.granted, zlotki: zl.granted,
    levelUp: xp.levelAfter > xp.levelBefore ? xp.levelAfter : null, streak: activity.streak, streakIncreased: activity.streakChanged,
    phrases: m.phrases, newWords: fresh.map((v) => ({ id: v.id, pl: v.pl, translations: v.translations })), achievements: ach.unlocked,
    reward: reward ? { slug: reward.slug, name: reward.name, slot: reward.slot } : null,
  };
}
