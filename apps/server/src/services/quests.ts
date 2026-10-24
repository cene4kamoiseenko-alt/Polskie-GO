/**
 * Квести: щоденні, щотижневі, сюжетні.
 * Прогрес оновлюється лише реальними навчальними подіями на сервері.
 */
import { dayKey, seededRandom, shuffle, weekKey, type I18n } from '@polski-go/shared';
import type { Prisma } from '@prisma/client';
import type { Tx } from '../db';
import { prisma } from '../db';
import { badRequest, notFound } from '../lib/errors';
import { evaluateAchievements } from './achievements';
import { grantItem, grantXp, grantZlotki, userTimezone } from './rewards';

export type QuestEvents = Partial<Record<'LESSONS' | 'XP' | 'NEW_WORDS' | 'REVIEWS' | 'DIALOGUES' | 'LISTENING' | 'CITY_COMPLETED', number>> & {
  /** Поточна серія правильних відповідей поспіль. */
  PERFECT_STREAK?: number;
};

const DAILY_COUNT = 3;

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Призначити квести на сьогодні та цей тиждень (ідемпотентно). */
export async function ensureQuests(tx: Tx, userId: string, now = new Date()) {
  const tz = await userTimezone(tx, userId);
  const day = dayKey(now, tz);
  const week = weekKey(day);
  const existingDaily = await tx.userQuest.count({ where: { userId, periodKey: day } });
  if (existingDaily === 0) {
    const pool = await tx.quest.findMany({ where: { kind: 'DAILY', status: 'PUBLISHED' }, orderBy: { order: 'asc' } });
    // Завжди один квест на уроки + два випадкові інші (детерміновано для користувача і дня).
    const rnd = seededRandom(hashStr(userId + day));
    const lessonQuests = pool.filter((q) => q.metric === 'LESSONS');
    const others = pool.filter((q) => q.metric !== 'LESSONS');
    const picked = [
      ...(lessonQuests.length ? [shuffle(lessonQuests, rnd)[0]] : []),
      ...shuffle(others, rnd).slice(0, DAILY_COUNT - (lessonQuests.length ? 1 : 0)),
    ];
    await tx.userQuest.createMany({ data: picked.map((q) => ({ userId, questId: q.id, periodKey: day })), skipDuplicates: true });
  }
  const weekly = await tx.quest.findMany({ where: { kind: 'WEEKLY', status: 'PUBLISHED' } });
  if (weekly.length) {
    await tx.userQuest.createMany({ data: weekly.map((q) => ({ userId, questId: q.id, periodKey: week })), skipDuplicates: true });
  }
  return { day, week };
}

/** Оновити прогрес активних квестів подіями. Повертає щойно виконані квести. */
export async function applyQuestEvents(tx: Tx, userId: string, events: QuestEvents, now = new Date()) {
  const metrics = Object.entries(events).filter(([, v]) => (v ?? 0) > 0).map(([k]) => k);
  if (!metrics.length) return [];
  const { day, week } = await ensureQuests(tx, userId, now);
  const active = await tx.userQuest.findMany({
    where: { userId, status: 'ACTIVE', periodKey: { in: [day, week] }, quest: { metric: { in: metrics } } },
    include: { quest: true },
  });
  const completed: { id: string; title: unknown; icon: string }[] = [];
  for (const uq of active) {
    const value = events[uq.quest.metric as keyof QuestEvents] ?? 0;
    const next =
      uq.quest.metric === 'PERFECT_STREAK'
        ? Math.min(uq.quest.target, Math.max(uq.progress, value))
        : Math.min(uq.quest.target, uq.progress + value);
    if (next === uq.progress) continue;
    const done = next >= uq.quest.target;
    await tx.userQuest.update({
      where: { id: uq.id },
      data: { progress: next, status: done ? 'COMPLETED' : 'ACTIVE', completedAt: done ? now : null },
    });
    if (done) completed.push({ id: uq.id, title: uq.quest.title, icon: uq.quest.icon });
  }
  return completed;
}

export async function listQuests(userId: string) {
  return prisma.$transaction(async (tx) => {
    const { day, week } = await ensureQuests(tx, userId);
    const rows = await tx.userQuest.findMany({
      where: { userId, periodKey: { in: [day, week, 'story'] } },
      include: { quest: true },
      orderBy: { createdAt: 'asc' },
    });
    const map = (uq: (typeof rows)[number]) => ({
      id: uq.id,
      slug: uq.quest.slug,
      kind: uq.quest.kind,
      title: uq.quest.title,
      description: uq.quest.description,
      icon: uq.quest.icon,
      progress: uq.progress,
      target: uq.quest.target,
      status: uq.status,
      xp: uq.quest.xpReward,
      zlotki: uq.quest.zlotkiReward,
    });
    const tomorrow = new Date();
    tomorrow.setUTCHours(24, 0, 0, 0);
    return {
      daily: rows.filter((r) => r.quest.kind === 'DAILY').map(map),
      weekly: rows.filter((r) => r.quest.kind === 'WEEKLY').map(map),
      story: await listStory(userId, tx),
      resetsAt: tomorrow.toISOString(),
    };
  });
}

/** Отримати нагороду за виконаний квест (рівно один раз). */
export async function claimQuest(userId: string, userQuestId: string) {
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM user_quests WHERE id = ${userQuestId} FOR UPDATE`;
    const uq = await tx.userQuest.findUnique({ where: { id: userQuestId }, include: { quest: true } });
    if (!uq || uq.userId !== userId) throw notFound('quest_not_found');
    if (uq.status === 'CLAIMED') throw badRequest('already_claimed');
    if (uq.status !== 'COMPLETED') throw badRequest('not_completed');
    const key = `quest:${uq.id}`;
    const xp = await grantXp(tx, userId, uq.quest.xpReward, `quest:${uq.quest.slug}`, key);
    const zl = await grantZlotki(tx, userId, uq.quest.zlotkiReward, `quest:${uq.quest.slug}`, key);
    let item = null;
    if (uq.quest.rewardItemId && (await grantItem(tx, userId, uq.quest.rewardItemId, 'quest'))) {
      item = await tx.cosmeticItem.findUnique({ where: { id: uq.quest.rewardItemId } });
    }
    await tx.userQuest.update({ where: { id: uq.id }, data: { status: 'CLAIMED', claimedAt: new Date() } });
    const achievements = await evaluateAchievements(tx, userId);
    return { xp: xp.granted, zlotki: zl, levelUp: xp.levelAfter > xp.levelBefore ? xp.levelAfter : null, item, achievements };
  });
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

async function listStory(userId: string, tx: Tx) {
  const [quests, mine, cities] = await Promise.all([
    tx.quest.findMany({ where: { kind: 'STORY', status: 'PUBLISHED' }, orderBy: { order: 'asc' }, include: { steps: true } }),
    tx.userQuest.findMany({ where: { userId, periodKey: 'story' } }),
    tx.userCity.findMany({ where: { userId } }),
  ]);
  const unlockedCities = new Set(cities.map((c) => c.cityId));
  const byQuest = new Map(mine.map((m) => [m.questId, m]));
  return quests.map((q) => {
    const uq = byQuest.get(q.id);
    const state = (uq?.state ?? {}) as Partial<StoryState>;
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
      stages: q.steps.length,
      progress: uq?.progress ?? 0,
      target: q.steps.length,
      xp: q.xpReward,
      zlotki: q.zlotkiReward,
    };
  });
}

async function loadStory(tx: Tx, userId: string, slug: string) {
  const quest = await tx.quest.findUnique({ where: { slug }, include: { steps: { orderBy: { order: 'asc' } } } });
  if (!quest || quest.kind !== 'STORY' || quest.status !== 'PUBLISHED') throw notFound('quest_not_found');
  if (quest.cityId) {
    const visit = await tx.userCity.findUnique({ where: { userId_cityId: { userId, cityId: quest.cityId } } });
    if (!visit) throw badRequest('city_locked');
  }
  const stages = quest.steps.map((s) => s.data as unknown as StoryStage);
  return { quest, stages };
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
  return prisma.$transaction(async (tx) => {
    const { quest, stages } = await loadStory(tx, userId, slug);
    if (!stages.length) throw badRequest('quest_empty');
    const initial: StoryState = { stage: 0, node: stages[0].start, mistakes: 0 };
    await tx.userQuest.createMany({
      data: [{ userId, questId: quest.id, periodKey: 'story', state: initial as unknown as Prisma.InputJsonValue }],
      skipDuplicates: true,
    });
    const uq = await tx.userQuest.findUniqueOrThrow({ where: { userId_questId_periodKey: { userId, questId: quest.id, periodKey: 'story' } } });
    return storyView(quest, stages, uq);
  });
}

/** Крок сюжету: вибір відповіді або перехід далі. Перевіряється на сервері. */
export async function advanceStory(userId: string, slug: string, choice?: number) {
  return prisma.$transaction(async (tx) => {
    const { quest, stages } = await loadStory(tx, userId, slug);
    const uq0 = await tx.userQuest.findUnique({ where: { userId_questId_periodKey: { userId, questId: quest.id, periodKey: 'story' } } });
    if (!uq0) throw badRequest('not_started');
    await tx.$queryRaw`SELECT id FROM user_quests WHERE id = ${uq0.id} FOR UPDATE`;
    const uq = await tx.userQuest.findUniqueOrThrow({ where: { id: uq0.id } });
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

    const updated = await tx.userQuest.update({
      where: { id: uq.id },
      data: { state: st as unknown as Prisma.InputJsonValue, status, progress, completedAt: status === 'COMPLETED' ? new Date() : undefined },
    });
    if (status === 'COMPLETED') await applyQuestEvents(tx, userId, { DIALOGUES: 1 });
    return { ...storyView(quest, stages, updated), result };
  });
}

export async function storyState(userId: string, slug: string) {
  return prisma.$transaction(async (tx) => {
    const { quest, stages } = await loadStory(tx, userId, slug);
    const uq = await tx.userQuest.findUnique({ where: { userId_questId_periodKey: { userId, questId: quest.id, periodKey: 'story' } } });
    if (!uq) return { slug, title: quest.title, status: 'NEW', stage: 0, stages: stages.length, node: null };
    return storyView(quest, stages, uq);
  });
}
