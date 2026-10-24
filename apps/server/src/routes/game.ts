/** Квести, магазин, досягнення, соціальне, Premium, AI. */
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import type { UiLang } from '@polski-go/shared';
import { config } from '../config';
import { prisma } from '../db';
import { requireUser } from '../auth';
import { advanceStory, claimQuest, listQuests, startStory, storyState } from '../services/quests';
import { buyItem, equipItem, listShop, outfit } from '../services/shop';
import { addFriendByCode, leaderboard, listFriends, respondFriend } from '../services/social';
import { cancelSubscription, createInvoice, listPlans } from '../services/payments';
import { activeSubscription } from '../services/premium';
import { achievementMetrics } from '../services/achievements';
import { AI_MODES, ROLEPLAYS, listConversations, sendMessage, type AiMode } from '../services/ai';

export const gameRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', requireUser);

  // ── Квести ──
  app.get('/quests', async (req) => listQuests(req.userId));
  app.post('/quests/:id/claim', async (req) => claimQuest(req.userId, z.object({ id: z.string() }).parse(req.params).id));
  app.get('/story/:slug', async (req) => storyState(req.userId, z.object({ slug: z.string() }).parse(req.params).slug));
  app.post('/story/:slug/start', async (req) => startStory(req.userId, z.object({ slug: z.string() }).parse(req.params).slug));
  app.post('/story/:slug/advance', async (req) => {
    const { slug } = z.object({ slug: z.string() }).parse(req.params);
    const { choice } = z.object({ choice: z.number().int().min(0).max(10).optional() }).parse(req.body ?? {});
    return advanceStory(req.userId, slug, choice);
  });

  // ── Досягнення ──
  app.get('/achievements', async (req) => {
    const [all, mine] = await Promise.all([
      prisma.achievement.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
      prisma.userAchievement.findMany({ where: { userId: req.userId } }),
    ]);
    const metrics = await prisma.$transaction((tx) => achievementMetrics(tx, req.userId));
    await prisma.userAchievement.updateMany({ where: { userId: req.userId, seen: false }, data: { seen: true } });
    return all.map((a) => {
      const m = mine.find((x) => x.achievementId === a.id);
      return { slug: a.slug, title: a.title, description: a.description, icon: a.icon, threshold: a.threshold, progress: Math.min(metrics[a.metric] ?? 0, a.threshold), unlockedAt: m?.unlockedAt ?? null, isNew: m ? !m.seen : false, zlotki: a.zlotkiReward };
    });
  });

  // ── Магазин і гардероб ──
  app.get('/shop', async (req) => listShop(req.userId));
  app.post('/shop/buy', async (req) => buyItem(req.userId, z.object({ itemId: z.string() }).parse(req.body).itemId));
  app.post('/inventory/equip', async (req) => {
    const { itemId, equipped } = z.object({ itemId: z.string(), equipped: z.boolean() }).parse(req.body);
    return equipItem(req.userId, itemId, equipped);
  });
  app.get('/outfit', async (req) => outfit(req.userId));
  app.get('/wallet/transactions', async (req) => prisma.walletTransaction.findMany({ where: { userId: req.userId }, orderBy: { createdAt: 'desc' }, take: 50 }));

  // ── Соціальне ──
  app.get('/leaderboard', async (req) => {
    const { scope } = z.object({ scope: z.enum(['league', 'friends', 'all']).default('league') }).parse(req.query);
    return leaderboard(req.userId, scope);
  });
  app.get('/friends', async (req) => {
    const me = await prisma.user.findUniqueOrThrow({ where: { id: req.userId } });
    return {
      friends: await listFriends(req.userId),
      referralCode: me.referralCode,
      inviteLink: `https://t.me/${config.botUsername}/${config.appShortName}?startapp=ref_${me.referralCode}`,
    };
  });
  app.post('/friends', async (req) => addFriendByCode(req.userId, z.object({ code: z.string().min(4).max(16) }).parse(req.body).code));
  app.post('/friends/:id/respond', async (req) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const { accept } = z.object({ accept: z.boolean() }).parse(req.body);
    return respondFriend(req.userId, id, accept);
  });

  // ── Premium ──
  app.get('/premium', async (req) => {
    const [plans, sub] = await Promise.all([listPlans(), activeSubscription(req.userId)]);
    return {
      plans: plans.map((p) => ({ code: p.code, months: p.months, priceStars: p.priceStars, recurring: p.recurring, title: p.title })),
      subscription: sub ? { planCode: sub.planCode, expiresAt: sub.expiresAt, recurring: sub.isRecurring, cancelled: sub.status === 'CANCELLED' } : null,
      paymentsConfigured: !!config.botToken,
    };
  });
  app.post('/premium/invoice', { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, async (req) => {
    const { plan } = z.object({ plan: z.string() }).parse(req.body);
    const settings = await prisma.userSettings.findUnique({ where: { userId: req.userId } });
    return createInvoice(req.userId, plan, (settings?.uiLanguage ?? 'uk') as UiLang);
  });
  app.post('/premium/cancel', async (req) => cancelSubscription(req.userId));

  // ── AI ──
  app.get('/ai/conversations', async (req) => ({ conversations: await listConversations(req.userId), modes: AI_MODES, roleplays: ROLEPLAYS, configured: !!config.anthropicKey }));
  app.post('/ai/message', { config: { rateLimit: { max: 20, timeWindow: '1 minute' } } }, async (req) => {
    const body = z
      .object({
        conversationId: z.string().optional(),
        mode: z.enum(Object.keys(AI_MODES) as [AiMode, ...AiMode[]]).default('chat'),
        scene: z.enum(ROLEPLAYS).optional(),
        text: z.string().min(1).max(1000),
      })
      .parse(req.body);
    return sendMessage(req.userId, body);
  });
};
