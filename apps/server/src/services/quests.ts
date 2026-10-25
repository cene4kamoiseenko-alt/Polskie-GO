/**
 * Квести: щоденні, щотижневі, сюжетні.
 * Прогрес оновлюється лише реальними навчальними подіями на сервері.
 */
import { and, asc, eq, inArray } from 'drizzle-orm';
import { seededRandom, shuffle, type I18n } from '@polski-go/shared';
import { atomic, db, type Stmt } from '../db';
import { cosmeticItems, newId, questSteps, quests, userCities, userInventory, userQuests, xpEvents } from '../db/schema';
import { badRequest, notFound } from '../lib/errors';
import { evaluateAchievements } from './achievements';
import { grantItem, grantXp, grantZlotki, loadCtx, type UserCtx } from './rewards';

export type QuestEvents = Partial<Record<'LESSONS' | 'XP' | 'NEW_WORDS' | 'REVIEWS' | 'DIALOGUES' | 'LISTENING' | 'CITY_COMPLETED', number>> & {
  /** Поточна серія правильних відповідей поспіль. */
  PERFECT_STREAK?: number;
};

type QuestRow = typeof quests.$inferSelect;
type UserQuestRow = typeof userQuests.$inferSelect;

const DAILY_COUNT = 3;

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/**
 * Квести на сьогодні та цей тиждень: наявні + ті, що треба призначити.
 * Повертає рядки (з урахуванням ще не записаних) і запити на створення.
 */
export async function questState(ctx: UserCtx) {
  const { userId, day, week } = ctx;
  const [mine, pool] = await Promise.all([
    db
      .select({ uq: userQuests, quest: quests })
      .from(userQuests)
      .innerJoin(quests, eq(quests.id, userQuests.questId))
      .where(and(eq(userQuests.userId, userId), inArray(userQuests.periodKey, [day, week]))),
    db
      .select()
      .from(quests)
      .where(and(inArray(quests.kind, ['DAILY', 'WEEKLY']), eq(quests.status, 'PUBLISHED')))
      .orderBy(asc(quests.order)),
  ]);
  const rows: { uq: UserQuestRow; quest: QuestRow }[] = [...mine];
  const toCreate: { quest: QuestRow; periodKey: string }[] = [];
  if (!mine.some((r) => r.uq.periodKey === day)) {
    const daily = pool.filter((q) => q.kind === 'DAILY');
    // Завжди один квест на уроки + два випадкові інші (детерміновано для користувача і дня).
    const rnd = seededRandom(hashStr(userId + day));
    const lessonQuests = daily.filter((q) => q.metric === 'LESSONS');
    const others = daily.filter((q) => q.metric !== 'LESSONS');
    const picked = [...(lessonQuests.length ? [shuffle(lessonQuests, rnd)[0]] : []), ...shuffle(others, rnd).slice(0, DAILY_COUNT - (lessonQuests.length ? 1 : 0))];
    for (const q of picked) toCreate.push({ quest: q, periodKey: day });
  }
  for (const q of pool.filter((x) => x.kind === 'WEEKLY')) {
    if (!mine.some((r) => r.uq.questId === q.id && r.uq.periodKey === week)) toCreate.push({ quest: q, periodKey: week });
  }
  const stmts: Stmt[] = [];
  for (const c of toCreate) {
    const uq: UserQuestRow = { id: newId(), userId, questId: c.quest.id, periodKey: c.periodKey, progress: 0, status: 'ACTIVE', state: {}, completedAt: null, claimedAt: null, createdAt: ctx.now };
    rows.push({ uq, quest: c.quest });
    stmts.push(db.insert(userQuests).values(uq).onConflictDoNothing());
  }
  return { rows, stmts };
}

/** Оновити прогрес активних квестів подіями. Повертає щойно виконані квести і запити. */
export async function applyQuestEvents(ctx: UserCtx, events: QuestEvents) {
  const metrics = Object.entries(events).filter(([, v]) => (v ?? 0) > 0).map(([k]) => k);
  const completed: { id: string; title: unknown; icon: string }[] = [];
  if (!metrics.length) return { completed, stmts: [] as Stmt[] };
  const { rows, stmts } = await questState(ctx);
  for (const { uq, quest } of rows) {
    if (uq.status !== 'ACTIVE' || !metrics.includes(quest.metric)) continue;
    const value = events[quest.metric as keyof QuestEvents] ?? 0;
    const next = quest.metric === 'PERFECT_STREAK' ? Math.min(quest.target, Math.max(uq.progress, value)) : Math.min(quest.target, uq.progress + value);
    if (next === uq.progress) continue;
    const done = next >= quest.target;
    stmts.push(
      db
        .update(userQuests)
        .set({ progress: next, status: done ? 'COMPLETED' : 'ACTIVE', completedAt: done ? ctx.now : null })
        .where(and(eq(userQuests.userId, ctx.userId), eq(userQuests.questId, quest.id), eq(userQuests.periodKey, uq.periodKey), eq(userQuests.status, 'ACTIVE'))),
    );
    if (done) completed.push({ id: uq.id, title: quest.title, icon: quest.icon });
  }
  return { completed, stmts };
}

export async function listQuests(userId: string) {
  const ctx = await loadCtx(userId);
  const { stmts } = await questState(ctx);
  await atomic(stmts);
  const rows = await db
    .select({ uq: userQuests, quest: quests })
    .from(userQuests)
    .innerJoin(quests, eq(quests.id, userQuests.questId))
    .where(and(eq(userQuests.userId, userId), inArray(userQuests.periodKey, [ctx.day, ctx.week])))
    .orderBy(asc(userQuests.createdAt), asc(quests.order));
  const map = ({ uq, quest }: (typeof rows)[number]) => ({
    id: uq.id,
    slug: quest.slug,
    kind: quest.kind,
    title: quest.title,
    description: quest.description,
    icon: quest.icon,
    progress: uq.progress,
    target: quest.target,
    status: uq.status,
    xp: quest.xpReward,
    zlotki: quest.zlotkiReward,
  });
  const tomorrow = new Date();
  tomorrow.setUTCHours(24, 0, 0, 0);
  const daily = rows.filter((r) => r.quest.kind === 'DAILY');
  return {
    chest: await dailyChestState(userId, ctx.day, daily.map((r) => r.uq.status)),
    daily: daily.map(map),
    weekly: rows.filter((r) => r.quest.kind === 'WEEKLY').map(map),
    story: await listStory(userId),
    resetsAt: tomorrow.toISOString(),
  };
}

// ───────────────────────── Велика нагорода дня ─────────────────────────

/** Скриня дня: відкривається, коли виконано всі щоденні завдання; видається один раз на день. */
export const DAILY_CHEST = { xp: 50, zlotki: 25 };
const chestKey = (userId: string, day: string) => `daily-chest:${userId}:${day}`;

async function dailyChestState(userId: string, day: string, statuses: string[]) {
  const claimed = !!(await db.select({ id: xpEvents.id }).from(xpEvents).where(eq(xpEvents.idempotencyKey, chestKey(userId, day))).get());
  const done = statuses.filter((s) => s === 'COMPLETED' || s === 'CLAIMED').length;
  return { ...DAILY_CHEST, done, total: statuses.length, ready: statuses.length > 0 && done === statuses.length, claimed };
}

export async function claimDailyChest(userId: string) {
  const ctx = await loadCtx(userId);
  const { stmts: init } = await questState(ctx);
  await atomic(init);
  const rows = await db
    .select({ status: userQuests.status })
    .from(userQuests)
    .innerJoin(quests, eq(quests.id, userQuests.questId))
    .where(and(eq(userQuests.userId, userId), eq(userQuests.periodKey, ctx.day), eq(quests.kind, 'DAILY')));
  const st = await dailyChestState(userId, ctx.day, rows.map((r) => r.status));
  if (st.claimed) throw badRequest('already_claimed');
  if (!st.ready) throw badRequest('not_completed');
  const key = chestKey(userId, ctx.day);
  // Ключ ідемпотентності охороняє від подвійного нарахування при паралельних запитах.
  const xp = grantXp(ctx, DAILY_CHEST.xp, 'daily-chest', key);
  const zl = grantZlotki(userId, DAILY_CHEST.zlotki, 'daily-chest', key, ctx.now);
  await atomic([...xp.stmts, ...zl.stmts]);
  return { xp: xp.granted, zlotki: zl.granted, levelUp: xp.levelAfter > xp.levelBefore ? xp.levelAfter : null };
}

/** Отримати нагороду за виконаний квест (рівно один раз — охороняє тригер у БД). */
export async function claimQuest(userId: string, userQuestId: string) {
  const row = await db.select({ uq: userQuests, quest: quests }).from(userQuests).innerJoin(quests, eq(quests.id, userQuests.questId)).where(eq(userQuests.id, userQuestId)).get();
  if (!row || row.uq.userId !== userId) throw notFound('quest_not_found');
  const { uq, quest } = row;
  if (uq.status === 'CLAIMED') throw badRequest('already_claimed');
  if (uq.status !== 'COMPLETED') throw badRequest('not_completed');
  const ctx = await loadCtx(userId);
  const key = `quest:${uq.id}`;
  const xp = grantXp(ctx, quest.xpReward, `quest:${quest.slug}`, key);
  const zl = grantZlotki(userId, quest.zlotkiReward, `quest:${quest.slug}`, key, ctx.now);
  let item = null;
  const stmts: Stmt[] = [db.update(userQuests).set({ status: 'CLAIMED', claimedAt: ctx.now }).where(eq(userQuests.id, uq.id)), ...xp.stmts, ...zl.stmts];
  if (quest.rewardItemId) {
    const [owned, it] = await db.batch([
      db.select().from(userInventory).where(and(eq(userInventory.userId, userId), eq(userInventory.itemId, quest.rewardItemId))),
      db.select().from(cosmeticItems).where(eq(cosmeticItems.id, quest.rewardItemId)),
    ]);
    if (!owned.length && it[0]) {
      stmts.push(grantItem(userId, it[0].id, 'quest'));
      item = it[0];
    }
  }
  const ach = await evaluateAchievements(userId, ctx.progress);
  await atomic([...stmts, ...ach.stmts]);
  return { xp: xp.granted, zlotki: zl.granted, levelUp: xp.levelAfter > xp.levelBefore ? xp.levelAfter : null, item, achievements: ach.unlocked };
}

// ───────────────────────── Сюжетні квести ─────────────────────────

type StoryNode = {
  speaker: string;
  name?: string;
  emoji?: string;
  pl: string;
  tr: I18n;
  choices?: { pl: string; tr: I18n; ok: boolean; next?: string; feedback?: I18n }[];
  next?: string;
  end?: boolean;
};
type StoryStage = { title: I18n; start: string; nodes: Record<string, StoryNode> };
type StoryState = { stage: number; node: string; mistakes: number; history?: string[] };

function publicNode(node: StoryNode) {
  return {
    speaker: node.speaker,
    name: node.name,
    emoji: node.emoji,
    pl: node.pl,
    tr: node.tr,
    // Не розкриваємо, який варіант правильний.
    choices: node.choices?.map((c) => ({ pl: c.pl, tr: c.tr })),
    end: !!node.end,
  };
}

async function listStory(userId: string) {
  const [qs, steps, mine, cities] = await db.batch([
    db.select().from(quests).where(and(eq(quests.kind, 'STORY'), eq(quests.status, 'PUBLISHED'))).orderBy(asc(quests.order)),
    db.select({ questId: questSteps.questId }).from(questSteps),
    db.select().from(userQuests).where(and(eq(userQuests.userId, userId), eq(userQuests.periodKey, 'story'))),
    db.select({ cityId: userCities.cityId }).from(userCities).where(eq(userCities.userId, userId)),
  ]);
  const unlockedCities = new Set(cities.map((c) => c.cityId));
  const byQuest = new Map(mine.map((m) => [m.questId, m]));
  return qs.map((q) => {
    const uq = byQuest.get(q.id);
    const state = (uq?.state ?? {}) as Partial<StoryState>;
    const stages = steps.filter((s) => s.questId === q.id).length;
    return {
      id: uq?.id ?? null,
      slug: q.slug,
      kind: q.kind,
      title: q.title,
      description: q.description,
      icon: q.icon,
      cityId: q.cityId,
      available: !q.cityId || unlockedCities.has(q.cityId),
      status: uq?.status ?? 'NEW',
      stage: state.stage ?? 0,
      stages,
      progress: uq?.progress ?? 0,
      target: stages,
      xp: q.xpReward,
      zlotki: q.zlotkiReward,
    };
  });
}

async function loadStory(userId: string, slug: string) {
  const quest = await db.query.quests.findFirst({ where: eq(quests.slug, slug), with: { steps: { orderBy: asc(questSteps.order) } } });
  if (!quest || quest.kind !== 'STORY' || quest.status !== 'PUBLISHED') throw notFound('quest_not_found');
  const [visit, uq] = await db.batch([
    db.select().from(userCities).where(and(eq(userCities.userId, userId), eq(userCities.cityId, quest.cityId ?? ''))),
    db.select().from(userQuests).where(and(eq(userQuests.userId, userId), eq(userQuests.questId, quest.id), eq(userQuests.periodKey, 'story'))),
  ]);
  if (quest.cityId && !visit.length) throw badRequest('city_locked');
  const stages = quest.steps.map((s) => s.data as unknown as StoryStage);
  return { quest, stages, uq: uq[0] ?? null };
}

function storyView(quest: { slug: string; title: unknown }, stages: StoryStage[], uq: { id: string; status: string; state: unknown }) {
  const st = uq.state as StoryState;
  const stage = stages[Math.min(st.stage, stages.length - 1)];
  const node = stage?.nodes[st.node];
  return {
    id: uq.id,
    slug: quest.slug,
    title: quest.title,
    status: uq.status,
    stage: st.stage,
    stages: stages.length,
    stageTitle: stage?.title,
    mistakes: st.mistakes,
    node: uq.status === 'ACTIVE' && node ? publicNode(node) : null,
  };
}

export async function startStory(userId: string, slug: string) {
  const { quest, stages, uq } = await loadStory(userId, slug);
  if (!stages.length) throw badRequest('quest_empty');
  if (uq) return storyView(quest, stages, uq);
  const initial: StoryState = { stage: 0, node: stages[0].start, mistakes: 0 };
  await db.insert(userQuests).values({ userId, questId: quest.id, periodKey: 'story', state: initial }).onConflictDoNothing();
  const created = await db.query.userQuests.findFirst({ where: and(eq(userQuests.userId, userId), eq(userQuests.questId, quest.id), eq(userQuests.periodKey, 'story')) });
  return storyView(quest, stages, created!);
}

/** Крок сюжету: вибір відповіді або перехід далі. Перевіряється на сервері. */
export async function advanceStory(userId: string, slug: string, choice?: number) {
  const { quest, stages, uq } = await loadStory(userId, slug);
  if (!uq) throw badRequest('not_started');
  if (uq.status !== 'ACTIVE') return { ...storyView(quest, stages, uq), result: null };

  const st = { ...(uq.state as StoryState) };
  const stage = stages[st.stage];
  const node = stage.nodes[st.node];
  if (!node) throw badRequest('bad_state');
  let result: { ok: boolean; feedback?: I18n } | null = null;
  let status: 'ACTIVE' | 'COMPLETED' = 'ACTIVE';
  let progress = uq.progress;

  if (node.choices?.length) {
    const c = typeof choice === 'number' ? node.choices[choice] : undefined;
    if (!c) throw badRequest('choice_required');
    if (!c.ok) {
      st.mistakes += 1;
      result = { ok: false, feedback: c.feedback };
    } else {
      result = { ok: true };
      if (c.next && stage.nodes[c.next]) st.node = c.next;
    }
  } else if (node.next && stage.nodes[node.next]) {
    st.node = node.next;
  } else if (node.end) {
    progress = st.stage + 1;
    if (st.stage + 1 >= stages.length) {
      status = 'COMPLETED';
    } else {
      st.stage += 1;
      st.node = stages[st.stage].start;
    }
  }

  const now = new Date();
  // Оновлюємо, лише якщо стан не змінився паралельним запитом (порівняння з прочитаним).
  const stmts: Stmt[] = [
    db
      .update(userQuests)
      .set({ state: st, status, progress, ...(status === 'COMPLETED' ? { completedAt: now } : {}) })
      .where(and(eq(userQuests.id, uq.id), eq(userQuests.status, 'ACTIVE'))),
  ];
  if (status === 'COMPLETED') {
    const ctx = await loadCtx(userId, now);
    stmts.push(...(await applyQuestEvents(ctx, { DIALOGUES: 1 })).stmts);
  }
  await atomic(stmts);
  return { ...storyView(quest, stages, { id: uq.id, status, state: st }), result };
}

export async function storyState(userId: string, slug: string) {
  const { quest, stages, uq } = await loadStory(userId, slug);
  if (!uq) return { slug, title: quest.title, status: 'NEW', stage: 0, stages: stages.length, node: null };
  return storyView(quest, stages, uq);
}
