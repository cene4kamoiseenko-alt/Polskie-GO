/**
 * Завантаження навчального контенту в БД.
 * За замовчуванням додає лише відсутні записи (не перезаписує правки з адмінки).
 * З `force: true` оновлює існуючий контент з репозиторію.
 */
import type { Prisma, PrismaClient } from '@prisma/client';
import { DEFAULT_REWARDS } from '@polski-go/shared';
import { hashPassword } from '../lib/password';
import { resetIds } from './builders';
import { CITIES, project } from './cities';
import { VOCAB } from './vocab';
import { WARSZAWA } from './warszawa';
import { KRAKOW } from './krakow';
import { WROCLAW } from './wroclaw';
import { PLACEMENT, EXAM_A1 } from './exams';
import { ACHIEVEMENTS, DAILY_QUESTS, ITEMS, STORY_QUESTS, WEEKLY_QUESTS } from './gamification';
import type { CityContent, LessonSeed } from './types';

export const CITY_CONTENT: CityContent[] = [WARSZAWA, KRAKOW, WROCLAW];

const json = (v: unknown) => v as Prisma.InputJsonValue;

export async function seedContent(prisma: PrismaClient, opts: { force?: boolean; log?: (m: string) => void } = {}) {
  const log = opts.log ?? (() => {});
  const force = !!opts.force;
  resetIds();

  // ── Налаштування гри та тарифи ──
  await prisma.gameConfig.upsert({ where: { key: 'rewards' }, create: { key: 'rewards', value: json(DEFAULT_REWARDS) }, update: {} });
  const plans = [
    { code: 'MONTH_1', months: 1, priceStars: 250, recurring: true, order: 1, title: { uk: '1 місяць', ru: '1 месяц', en: '1 month', pl: '1 miesiąc' } },
    { code: 'MONTH_3', months: 3, priceStars: 600, recurring: false, order: 2, title: { uk: '3 місяці', ru: '3 месяца', en: '3 months', pl: '3 miesiące' } },
    { code: 'MONTH_12', months: 12, priceStars: 1800, recurring: false, order: 3, title: { uk: '12 місяців', ru: '12 месяцев', en: '12 months', pl: '12 miesięcy' } },
  ];
  for (const p of plans) {
    await prisma.subscriptionPlan.upsert({ where: { code: p.code }, create: p, update: force ? p : {} });
  }

  // ── Словник ──
  const vocabIds = new Map<string, string>();
  for (const w of VOCAB) {
    const data = {
      pl: w.pl, pos: w.pos, translations: json(w.tr), pronunciation: w.pron, cefr: w.cefr, topics: w.topics,
      emoji: w.emoji ?? null, forms: json(w.forms ?? {}), examples: json(w.examples ?? []),
    };
    const e = await prisma.vocabularyEntry.upsert({ where: { pl_pos: { pl: w.pl, pos: w.pos } }, create: data, update: force ? data : {} });
    vocabIds.set(w.pl, e.id);
  }
  log(`Словник: ${VOCAB.length} слів`);

  // ── Міста ──
  const cityIds = new Map<string, string>();
  for (const [i, c] of CITIES.entries()) {
    const { x, y } = project(c.lon, c.lat);
    const data = {
      slug: c.slug, order: i + 1, namePl: c.namePl, name: json(c.name), theme: json(c.theme), description: json(c.description),
      cefr: c.cefr, mapX: x + (c.dx ?? 0), mapY: y + (c.dy ?? 0), emoji: c.emoji, color: c.color, status: 'PUBLISHED' as const,
    };
    const city = await prisma.city.upsert({ where: { slug: c.slug }, create: data, update: force ? data : {} });
    cityIds.set(c.slug, city.id);
  }
  log(`Міста: ${CITIES.length}`);

  // ── Уроки ──
  let lessonCount = 0;
  let exerciseCount = 0;
  const upsertLesson = async (l: LessonSeed, order: number, routeId: string | null) => {
    const data = {
      slug: l.slug, order, kind: l.kind ?? 'LESSON', title: json(l.title), topic: json(l.topic), cefr: l.cefr, difficulty: l.difficulty,
      explanation: json(l.explanation), examples: json(l.examples), status: 'PUBLISHED' as const, routeId,
    };
    const existing = await prisma.lesson.findUnique({ where: { slug: l.slug } });
    if (existing && !force) return existing;
    const lesson = await prisma.lesson.upsert({ where: { slug: l.slug }, create: data, update: data });
    for (const [i, ex] of l.exercises.entries()) {
      const exData = { type: ex.type, skill: ex.skill, data: json(ex.data), explanation: ex.explanation ? json(ex.explanation) : undefined };
      await prisma.exercise.upsert({
        where: { lessonId_order: { lessonId: lesson.id, order: i } },
        create: { lessonId: lesson.id, order: i, ...exData },
        update: exData,
      });
    }
    await prisma.exercise.deleteMany({ where: { lessonId: lesson.id, order: { gte: l.exercises.length } } });
    await prisma.lessonWord.deleteMany({ where: { lessonId: lesson.id } });
    for (const [i, w] of l.words.entries()) {
      const entryId = vocabIds.get(w);
      if (!entryId) throw new Error(`Слово "${w}" з уроку ${l.slug} відсутнє у словнику`);
      await prisma.lessonWord.create({ data: { lessonId: lesson.id, entryId, order: i } });
    }
    lessonCount++;
    exerciseCount += l.exercises.length;
    return lesson;
  };

  for (const content of CITY_CONTENT) {
    const cityId = cityIds.get(content.city)!;
    let regular = 0;
    for (const [ri, r] of content.routes.entries()) {
      const rData = { cityId, slug: r.slug, order: ri + 1, title: json(r.title), description: json(r.description), icon: r.icon, status: 'PUBLISHED' as const };
      const route = await prisma.cityRoute.upsert({ where: { slug: r.slug }, create: rData, update: force ? rData : {} });
      for (const [li, l] of r.lessons.entries()) {
        await upsertLesson(l, li + 1, route.id);
        if ((l.kind ?? 'LESSON') === 'LESSON') regular++;
      }
    }
    // Квиток до наступного міста: пройти всі звичайні уроки міста + іспит.
    const city = await prisma.city.findUnique({ where: { id: cityId } });
    if (city && (force || city.ticketLessons === 0)) await prisma.city.update({ where: { id: cityId }, data: { ticketLessons: regular } });
  }
  await upsertLesson(PLACEMENT, 0, null);
  await upsertLesson(EXAM_A1, 0, null);
  log(`Уроки: ${lessonCount} (вправ: ${exerciseCount})`);

  // ── Косметика ──
  const itemIds = new Map<string, string>();
  for (const [i, item] of ITEMS.entries()) {
    const data = {
      slug: item.slug, slot: item.slot, name: json(item.name), assetKey: item.slug, price: item.price, rarity: item.rarity ?? 'common',
      isPremium: !!item.premium, rewardOnly: !!item.rewardOnly, cityId: item.city ? cityIds.get(item.city) : null, order: i,
    };
    const row = await prisma.cosmeticItem.upsert({ where: { slug: item.slug }, create: data, update: force ? data : {} });
    itemIds.set(item.slug, row.id);
  }
  log(`Предмети: ${ITEMS.length}`);

  // ── Квести ──
  for (const [i, q] of [...DAILY_QUESTS, ...WEEKLY_QUESTS, ...STORY_QUESTS].entries()) {
    const data = {
      slug: q.slug, kind: q.kind, title: json(q.title), description: json(q.description), metric: q.metric, target: q.target,
      xpReward: q.xp, zlotkiReward: q.zlotki, icon: q.icon, cityId: q.city ? cityIds.get(q.city) : null,
      rewardItemId: q.rewardItem ? itemIds.get(q.rewardItem) : null, order: q.order ?? i,
    };
    const existing = await prisma.quest.findUnique({ where: { slug: q.slug } });
    if (existing && !force) continue;
    const quest = await prisma.quest.upsert({ where: { slug: q.slug }, create: data, update: data });
    if (q.stages) {
      for (const [si, st] of q.stages.entries()) {
        await prisma.questStep.upsert({
          where: { questId_order: { questId: quest.id, order: si } },
          create: { questId: quest.id, order: si, data: json(st) },
          update: { data: json(st) },
        });
      }
    }
  }

  // ── Досягнення ──
  for (const [i, a] of ACHIEVEMENTS.entries()) {
    const data = {
      slug: a.slug, title: json(a.title), description: json(a.description), icon: a.icon, metric: a.metric, threshold: a.threshold,
      zlotkiReward: a.zlotki, rewardItemId: a.rewardItem ? itemIds.get(a.rewardItem) : null, order: i,
    };
    await prisma.achievement.upsert({ where: { slug: a.slug }, create: data, update: force ? data : {} });
  }
  log('Квести та досягнення готові');
}

export async function seedAdmin(prisma: PrismaClient, email?: string, password?: string) {
  if (!email || !password) return;
  const exists = await prisma.adminUser.findUnique({ where: { email } });
  if (exists) return;
  await prisma.adminUser.create({ data: { email, name: 'Super Admin', role: 'SUPERADMIN', passwordHash: await hashPassword(password) } });
}
