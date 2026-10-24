/** Квести, магазин, досягнення, соціальне, Premium, AI. */
import { Hono } from 'hono';
import { and, asc, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import type { UiLang } from '@polski-go/shared';
import { config } from '../env';
import { db } from '../db';
import { achievements, playerProgress, userAchievements, userSettings, users, walletTransactions } from '../db/schema';
import { body, query, rateLimit, type AppEnv } from '../hono';
import { advanceStory, claimQuest, listQuests, startStory, storyState } from '../services/quests';
import { buyItem, equipItem, listShop, outfit } from '../services/shop';
import { addFriendByCode, leaderboard, listFriends, respondFriend } from '../services/social';
import { cancelSubscription, createInvoice, listPlans } from '../services/payments';
import { activeSubscription } from '../services/premium';
import { achievementMetrics } from '../services/achievements';
import { answerMission, listMissions, missionHint, startMission } from '../services/missions';
import { passport } from '../services/passport';
import { AI_MODES, ROLEPLAYS, listConversations, sendMessage, type AiMode } from '../services/ai';

export const gameRoutes = new Hono<AppEnv>();
const r = gameRoutes;

// ── Квести ──
r.get('/quests', async (c) => c.json(await listQuests(c.get('userId'))));
r.post('/quests/:id/claim', async (c) => c.json(await claimQuest(c.get('userId'), c.req.param('id'))));
r.get('/story/:slug', async (c) => c.json(await storyState(c.get('userId'), c.req.param('slug'))));
r.post('/story/:slug/start', async (c) => c.json(await startStory(c.get('userId'), c.req.param('slug'))));
r.post('/story/:slug/advance', async (c) => {
  const { choice } = z.object({ choice: z.number().int().min(0).max(10).optional() }).parse(await body(c));
  return c.json(await advanceStory(c.get('userId'), c.req.param('slug'), choice));
});

// ── Місії «Польська в житті» ──
r.get('/missions', async (c) => c.json(await listMissions(c.get('userId'))));
r.post('/missions/:slug/start', async (c) => c.json(await startMission(c.get('userId'), c.req.param('slug'))));
r.post('/missions/runs/:id/answer', rateLimit(90, 60_000, 'mission'), async (c) => {
  const b = z.object({ step: z.number().int().min(0).max(30), option: z.number().int().min(0).max(10).optional(), text: z.string().max(300).optional() }).parse(await body(c));
  return c.json(await answerMission(c.get('userId'), c.req.param('id'), b.step, b));
});
r.post('/missions/runs/:id/hint', rateLimit(60, 60_000, 'mission-hint'), async (c) => {
  const { step } = z.object({ step: z.number().int().min(0).max(30) }).parse(await body(c));
  return c.json(await missionHint(c.get('userId'), c.req.param('id'), step));
});

// ── Паспорт мандрівника ──
r.get('/passport', async (c) => c.json(await passport(c.get('userId'))));

// ── Досягнення ──
r.get('/achievements', async (c) => {
  const userId = c.get('userId');
  const [all, mine, progress] = await db.batch([
    db.select().from(achievements).where(eq(achievements.isActive, true)).orderBy(asc(achievements.order)),
    db.select().from(userAchievements).where(eq(userAchievements.userId, userId)),
    db.select().from(playerProgress).where(eq(playerProgress.userId, userId)),
  ]);
  const owned = new Set(mine.map((m) => m.achievementId));
  const metrics = await achievementMetrics(userId, progress[0], all.filter((a) => !owned.has(a.id)).map((a) => a.metric));
  await db.update(userAchievements).set({ seen: true }).where(and(eq(userAchievements.userId, userId), eq(userAchievements.seen, false)));
  return c.json(
    all.map((a) => {
      const m = mine.find((x) => x.achievementId === a.id);
      return {
        slug: a.slug, title: a.title, description: a.description, icon: a.icon, threshold: a.threshold,
        metric: a.metric, progress: m ? a.threshold : Math.min(metrics[a.metric] ?? 0, a.threshold), unlockedAt: m?.unlockedAt ?? null, isNew: m ? !m.seen : false, zlotki: a.zlotkiReward,
      };
    }),
  );
});

// ── Магазин і гардероб ──
r.get('/shop', async (c) => c.json(await listShop(c.get('userId'))));
r.post('/shop/buy', async (c) => c.json(await buyItem(c.get('userId'), z.object({ itemId: z.string() }).parse(await body(c)).itemId)));
r.post('/inventory/equip', async (c) => {
  const { itemId, equipped } = z.object({ itemId: z.string(), equipped: z.boolean() }).parse(await body(c));
  return c.json(await equipItem(c.get('userId'), itemId, equipped));
});
r.get('/outfit', async (c) => c.json(await outfit(c.get('userId'))));
r.get('/wallet/transactions', async (c) =>
  c.json(await db.select().from(walletTransactions).where(eq(walletTransactions.userId, c.get('userId'))).orderBy(desc(walletTransactions.createdAt)).limit(50)),
);

// ── Соціальне ──
r.get('/leaderboard', async (c) => {
  const { scope } = z.object({ scope: z.enum(['league', 'friends', 'all']).default('league') }).parse(query(c));
  return c.json(await leaderboard(c.get('userId'), scope));
});
r.get('/friends', async (c) => {
  const me = await db.query.users.findFirst({ where: eq(users.id, c.get('userId')) });
  return c.json({
    friends: await listFriends(c.get('userId')),
    referralCode: me!.referralCode,
    inviteLink: `https://t.me/${config.botUsername}/${config.appShortName}?startapp=ref_${me!.referralCode}`,
  });
});
r.post('/friends', async (c) => c.json(await addFriendByCode(c.get('userId'), z.object({ code: z.string().min(4).max(16) }).parse(await body(c)).code)));
r.post('/friends/:id/respond', async (c) => {
  const { accept } = z.object({ accept: z.boolean() }).parse(await body(c));
  return c.json(await respondFriend(c.get('userId'), c.req.param('id'), accept));
});

// ── Premium ──
r.get('/premium', async (c) => {
  const [plans, sub] = await Promise.all([listPlans(), activeSubscription(c.get('userId'))]);
  return c.json({
    plans: plans.map((p) => ({ code: p.code, months: p.months, priceStars: p.priceStars, recurring: p.recurring, title: p.title })),
    subscription: sub ? { planCode: sub.planCode, expiresAt: sub.expiresAt, recurring: sub.isRecurring, cancelled: sub.status === 'CANCELLED' } : null,
    paymentsConfigured: !!config.botToken,
  });
});
r.post('/premium/invoice', rateLimit(10, 60_000, 'invoice'), async (c) => {
  const { plan } = z.object({ plan: z.string() }).parse(await body(c));
  const settings = await db.query.userSettings.findFirst({ where: eq(userSettings.userId, c.get('userId')) });
  return c.json(await createInvoice(c.get('userId'), plan, (settings?.uiLanguage ?? 'uk') as UiLang));
});
r.post('/premium/cancel', async (c) => c.json(await cancelSubscription(c.get('userId'))));

// ── AI ──
r.get('/ai/conversations', async (c) =>
  c.json({ conversations: await listConversations(c.get('userId')), modes: AI_MODES, roleplays: ROLEPLAYS, configured: !!config.anthropicKey }),
);
r.post('/ai/message', rateLimit(20, 60_000, 'ai'), async (c) => {
  const b = z
    .object({
      conversationId: z.string().optional(),
      mode: z.enum(Object.keys(AI_MODES) as [AiMode, ...AiMode[]]).default('chat'),
      scene: z.enum(ROLEPLAYS).optional(),
      text: z.string().min(1).max(1000),
    })
    .parse(await body(c));
  return c.json(await sendMessage(c.get('userId'), b));
});
