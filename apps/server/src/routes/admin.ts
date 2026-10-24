/**
 * API адмін-панелі. Ролі: SUPERADMIN (усе), EDITOR (контент), SUPPORT (користувачі, платежі — перегляд).
 * Кожна зміна записується в admin_audit_logs.
 */
import { randomBytes } from 'node:crypto';
import { createWriteStream } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { pipeline } from 'node:stream/promises';
import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import type { Prisma } from '@prisma/client';
import { z, type ZodTypeAny } from 'zod';
import { CEFR_LEVELS, EXERCISE_TYPES, DEFAULT_REWARDS } from '@polski-go/shared';
import { config } from '../config';
import { prisma } from '../db';
import { requireAdmin } from '../auth';
import { HttpError, badRequest, notFound } from '../lib/errors';
import { hashPassword, verifyPassword } from '../lib/password';
import { signToken } from '../lib/token';
import { botApi } from '../lib/telegram';
import { invalidateRewards } from '../services/gameConfig';

const i18n = z.object({ uk: z.string().min(1), ru: z.string().optional(), en: z.string().optional(), pl: z.string().optional() });
const status = z.enum(['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED']);
const json = z.any();

async function audit(req: FastifyRequest, action: string, entity: string, entityId?: string | null, details?: unknown) {
  await prisma.adminAuditLog.create({ data: { adminId: req.admin?.id, action, entity, entityId: entityId ?? null, details: (details ?? undefined) as Prisma.InputJsonValue } });
}

type Resource = {
  model: string;
  schema: z.ZodObject<Record<string, ZodTypeAny>>;
  orderBy: Record<string, 'asc' | 'desc'>[];
  search?: string[];
  filters?: string[];
  include?: Record<string, unknown>;
  roles: ('EDITOR' | 'SUPPORT')[];
  idField?: string;
};

/** Ресурси з універсальним CRUD. Поля поза схемою ігноруються. */
const RESOURCES: Record<string, Resource> = {
  cities: {
    model: 'city', roles: ['EDITOR'], orderBy: [{ order: 'asc' }], search: ['slug', 'namePl'],
    schema: z.object({ slug: z.string().regex(/^[a-z0-9-]+$/), order: z.number().int(), namePl: z.string(), name: i18n, theme: i18n, description: i18n, cefr: z.enum(CEFR_LEVELS), mapX: z.number(), mapY: z.number(), emoji: z.string(), color: z.string(), ticketLessons: z.number().int().min(0), status }),
  },
  routes: {
    model: 'cityRoute', roles: ['EDITOR'], orderBy: [{ cityId: 'asc' }, { order: 'asc' }], search: ['slug'], filters: ['cityId'],
    include: { city: { select: { namePl: true } }, _count: { select: { lessons: true } } },
    schema: z.object({ cityId: z.string(), slug: z.string().regex(/^[a-z0-9-]+$/), order: z.number().int(), title: i18n, description: i18n, icon: z.string(), status }),
  },
  lessons: {
    model: 'lesson', roles: ['EDITOR'], orderBy: [{ routeId: 'asc' }, { order: 'asc' }], search: ['slug'], filters: ['routeId', 'kind', 'status'],
    include: { route: { select: { slug: true } }, _count: { select: { exercises: true } } },
    schema: z.object({ routeId: z.string().nullable(), slug: z.string().regex(/^[a-z0-9-]+$/), order: z.number().int(), kind: z.enum(['LESSON', 'BOSS', 'EXAM', 'PLACEMENT']), title: i18n, topic: i18n, cefr: z.enum(CEFR_LEVELS), difficulty: z.number().int().min(1).max(5), explanation: i18n, examples: json, isPremium: z.boolean(), status }),
  },
  exercises: {
    model: 'exercise', roles: ['EDITOR'], orderBy: [{ lessonId: 'asc' }, { order: 'asc' }], filters: ['lessonId', 'type'],
    schema: z.object({ lessonId: z.string(), order: z.number().int(), type: z.enum(EXERCISE_TYPES), skill: z.string().min(1), data: z.record(z.any()), explanation: i18n.nullable(), audioUrl: z.string().nullable(), imageUrl: z.string().nullable() }),
  },
  vocabulary: {
    model: 'vocabularyEntry', roles: ['EDITOR'], orderBy: [{ pl: 'asc' }], search: ['pl'], filters: ['cefr', 'status'],
    schema: z.object({ pl: z.string().min(1), pos: z.string(), translations: i18n, pronunciation: z.string().nullable(), forms: json, examples: json, cefr: z.enum(CEFR_LEVELS), topics: z.array(z.string()), emoji: z.string().nullable(), audioUrl: z.string().nullable(), imageUrl: z.string().nullable(), status }),
  },
  quests: {
    model: 'quest', roles: ['EDITOR'], orderBy: [{ kind: 'asc' }, { order: 'asc' }], search: ['slug'], filters: ['kind'],
    include: { _count: { select: { steps: true } } },
    schema: z.object({ slug: z.string(), kind: z.enum(['DAILY', 'WEEKLY', 'STORY', 'EVENT']), title: i18n, description: i18n, metric: z.enum(['LESSONS', 'XP', 'NEW_WORDS', 'REVIEWS', 'PERFECT_STREAK', 'DIALOGUES', 'LISTENING', 'CITY_COMPLETED', 'STORY']), target: z.number().int().min(1), xpReward: z.number().int().min(0), zlotkiReward: z.number().int().min(0), rewardItemId: z.string().nullable(), cityId: z.string().nullable(), icon: z.string(), isPremium: z.boolean(), status, order: z.number().int() }),
  },
  questSteps: {
    model: 'questStep', roles: ['EDITOR'], orderBy: [{ questId: 'asc' }, { order: 'asc' }], filters: ['questId'],
    schema: z.object({ questId: z.string(), order: z.number().int(), data: z.object({ title: i18n, start: z.string(), nodes: z.record(z.any()) }) }),
  },
  achievements: {
    model: 'achievement', roles: ['EDITOR'], orderBy: [{ order: 'asc' }], search: ['slug'],
    schema: z.object({ slug: z.string(), title: i18n, description: i18n, icon: z.string(), metric: z.enum(['LESSONS', 'STREAK', 'WORDS', 'XP', 'PERFECT_LESSONS', 'CITIES', 'PURCHASES', 'FRIENDS', 'STORY_QUESTS']), threshold: z.number().int().min(1), zlotkiReward: z.number().int().min(0), rewardItemId: z.string().nullable(), order: z.number().int(), isActive: z.boolean() }),
  },
  items: {
    model: 'cosmeticItem', roles: ['EDITOR'], orderBy: [{ slot: 'asc' }, { order: 'asc' }], search: ['slug'], filters: ['slot'],
    schema: z.object({ slug: z.string(), slot: z.enum(['HAT', 'GLASSES', 'SCARF', 'JACKET', 'BACKPACK', 'SHOES', 'ACCESSORY', 'COSTUME', 'FURNITURE', 'DECOR', 'SOUVENIR', 'FRAME']), name: i18n, assetKey: z.string(), price: z.number().int().min(0), rarity: z.enum(['common', 'rare', 'epic', 'legendary']), isPremium: z.boolean(), rewardOnly: z.boolean(), cityId: z.string().nullable(), isActive: z.boolean(), order: z.number().int() }),
  },
  plans: {
    model: 'subscriptionPlan', roles: [], orderBy: [{ order: 'asc' }], idField: 'code',
    schema: z.object({ code: z.string().regex(/^[A-Z0-9_]+$/), months: z.number().int().min(1), priceStars: z.number().int().min(1).max(100000), recurring: z.boolean(), title: i18n, isActive: z.boolean(), order: z.number().int() }),
  },
  campaigns: {
    model: 'notificationCampaign', roles: [], orderBy: [{ createdAt: 'desc' }],
    schema: z.object({ kind: z.enum(['reminder', 'new_lessons', 'new_city', 'event', 'challenge']), title: z.string().min(1).max(100), message: i18n }),
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const delegate = (model: string) => (prisma as any)[model];

export const adminRoutes: FastifyPluginAsync = async (app) => {
  app.post('/login', { config: { rateLimit: { max: 10, timeWindow: '5 minutes' } } }, async (req) => {
    const { email, password } = z.object({ email: z.string().email(), password: z.string().min(1) }).parse(req.body);
    const admin = await prisma.adminUser.findUnique({ where: { email } });
    if (!admin || !admin.isActive || !(await verifyPassword(password, admin.passwordHash))) throw new HttpError(401, 'invalid_credentials');
    await prisma.adminUser.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });
    await prisma.adminAuditLog.create({ data: { adminId: admin.id, action: 'login', entity: 'admin', entityId: admin.id } });
    return { token: signToken({ aid: admin.id, typ: 'admin' }, 12 * 3600), admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role } };
  });

  app.register(async (r) => {
    r.addHook('preHandler', requireAdmin());

    r.get('/me', async (req) => prisma.adminUser.findUniqueOrThrow({ where: { id: req.admin!.id }, select: { id: true, email: true, name: true, role: true } }));

    // ── Dashboard ──
    r.get('/dashboard', async () => {
      const now = Date.now();
      const d1 = new Date(now - 86_400_000);
      const d7 = new Date(now - 7 * 86_400_000);
      const d30 = new Date(now - 30 * 86_400_000);
      const [users, active1, active7, new7, lessonsTotal, lessons7, avg, premium, revenue30, revenueAll, signups, topLessons, errors, retention] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { lastSeenAt: { gte: d1 } } }),
        prisma.user.count({ where: { lastSeenAt: { gte: d7 } } }),
        prisma.user.count({ where: { createdAt: { gte: d7 } } }),
        prisma.learningSession.count({ where: { mode: 'LESSON', status: 'FINISHED' } }),
        prisma.learningSession.count({ where: { mode: 'LESSON', status: 'FINISHED', finishedAt: { gte: d7 } } }),
        prisma.playerProgress.aggregate({ _avg: { xpTotal: true, lessonsCompleted: true, wordsLearned: true } }),
        prisma.subscription.groupBy({ by: ['userId'], where: { status: { in: ['ACTIVE', 'CANCELLED'] }, expiresAt: { gt: new Date() } } }).then((r) => r.length),
        prisma.paymentEvent.aggregate({ where: { type: 'SUCCESSFUL_PAYMENT', error: null, createdAt: { gte: d30 } }, _sum: { amount: true }, _count: true }),
        prisma.paymentEvent.aggregate({ where: { type: 'SUCCESSFUL_PAYMENT', error: null }, _sum: { amount: true } }),
        prisma.$queryRaw<{ day: string; count: bigint }[]>`SELECT to_char(created_at, 'YYYY-MM-DD') AS day, COUNT(*) AS count FROM users WHERE created_at >= ${d30} GROUP BY 1 ORDER BY 1`,
        prisma.$queryRaw<{ slug: string; title: unknown; count: bigint }[]>`
          SELECT l.slug, l.title, COUNT(*) AS count FROM user_lesson_progress p JOIN lessons l ON l.id = p.lesson_id
          WHERE p.first_completed_at IS NOT NULL GROUP BY l.slug, l.title ORDER BY count DESC LIMIT 8`,
        prisma.$queryRaw<{ exercise_id: string; lesson: string; type: string; wrong: bigint; total: bigint }[]>`
          SELECT a.exercise_id, l.slug AS lesson, a.type, SUM(CASE WHEN a.is_correct THEN 0 ELSE 1 END) AS wrong, COUNT(*) AS total
          FROM exercise_attempts a JOIN exercises e ON e.id = a.exercise_id JOIN lessons l ON l.id = e.lesson_id
          GROUP BY a.exercise_id, l.slug, a.type HAVING COUNT(*) >= 3 ORDER BY (SUM(CASE WHEN a.is_correct THEN 0 ELSE 1 END)::float / COUNT(*)) DESC LIMIT 10`,
        // Retention D1/D7: частка користувачів, активних наступного / через 7 днів після реєстрації.
        prisma.$queryRaw<{ d1: number | null; d7: number | null }[]>`
          SELECT
            AVG(CASE WHEN EXISTS (SELECT 1 FROM daily_activity a WHERE a.user_id = u.id AND a.day = to_char(u.created_at + interval '1 day', 'YYYY-MM-DD')) THEN 1.0 ELSE 0 END) FILTER (WHERE u.created_at < now() - interval '2 days') AS d1,
            AVG(CASE WHEN EXISTS (SELECT 1 FROM daily_activity a WHERE a.user_id = u.id AND a.day >= to_char(u.created_at + interval '7 days', 'YYYY-MM-DD')) THEN 1.0 ELSE 0 END) FILTER (WHERE u.created_at < now() - interval '8 days') AS d7
          FROM users u WHERE u.created_at >= now() - interval '90 days'`,
      ]);
      return {
        users, active1, active7, new7, lessonsTotal, lessons7,
        avgXp: Math.round(avg._avg.xpTotal ?? 0), avgLessons: Math.round((avg._avg.lessonsCompleted ?? 0) * 10) / 10, avgWords: Math.round(avg._avg.wordsLearned ?? 0),
        premium, revenue30Stars: revenue30._sum.amount ?? 0, payments30: revenue30._count, revenueAllStars: revenueAll._sum.amount ?? 0,
        signups: signups.map((s) => ({ day: s.day, count: Number(s.count) })),
        topLessons: topLessons.map((t) => ({ slug: t.slug, title: t.title, count: Number(t.count) })),
        errors: errors.map((e) => ({ exerciseId: e.exercise_id, lesson: e.lesson, type: e.type, wrong: Number(e.wrong), total: Number(e.total), rate: Math.round((Number(e.wrong) / Number(e.total)) * 100) })),
        retention: { d1: retention[0]?.d1 != null ? Math.round(Number(retention[0].d1) * 100) : null, d7: retention[0]?.d7 != null ? Math.round(Number(retention[0].d7) * 100) : null },
      };
    });

    // ── Універсальний CRUD ──
    const resourceGuard = (name: string, write: boolean) => async (req: FastifyRequest) => {
      const res = RESOURCES[name];
      if (!res) throw notFound();
      const role = req.admin!.role;
      if (role === 'SUPERADMIN') return res;
      if (!res.roles.includes(role as 'EDITOR' | 'SUPPORT')) throw new HttpError(403, 'forbidden');
      if (write && role === 'SUPPORT') throw new HttpError(403, 'forbidden');
      return res;
    };

    r.get('/resources/:name', async (req) => {
      const { name } = z.object({ name: z.string() }).parse(req.params);
      const res = await resourceGuard(name, false)(req);
      const q = req.query as Record<string, string>;
      const where: Record<string, unknown> = {};
      for (const f of res.filters ?? []) if (q[f]) where[f] = q[f] === 'null' ? null : q[f];
      if (q.search && res.search?.length) where.OR = res.search.map((f) => ({ [f]: { contains: q.search, mode: 'insensitive' } }));
      const take = Math.min(Number(q.take ?? 100), 500);
      const skip = Number(q.skip ?? 0);
      const [items, total] = await Promise.all([
        delegate(res.model).findMany({ where, orderBy: res.orderBy, take, skip, ...(res.include ? { include: res.include } : {}) }),
        delegate(res.model).count({ where }),
      ]);
      return { items, total };
    });

    r.get('/resources/:name/:id', async (req) => {
      const { name, id } = z.object({ name: z.string(), id: z.string() }).parse(req.params);
      const res = await resourceGuard(name, false)(req);
      const item = await delegate(res.model).findUnique({ where: { [res.idField ?? 'id']: id }, ...(res.include ? { include: res.include } : {}) });
      if (!item) throw notFound();
      return item;
    });

    r.post('/resources/:name', async (req) => {
      const { name } = z.object({ name: z.string() }).parse(req.params);
      const res = await resourceGuard(name, true)(req);
      const data = res.schema.parse(req.body);
      const item = await delegate(res.model).create({ data });
      await audit(req, 'create', name, item[res.idField ?? 'id'], data);
      if (name === 'plans') invalidateRewards();
      return item;
    });

    r.patch('/resources/:name/:id', async (req) => {
      const { name, id } = z.object({ name: z.string(), id: z.string() }).parse(req.params);
      const res = await resourceGuard(name, true)(req);
      const data = res.schema.partial().parse(req.body);
      const item = await delegate(res.model).update({ where: { [res.idField ?? 'id']: id }, data });
      await audit(req, 'update', name, id, data);
      return item;
    });

    r.delete('/resources/:name/:id', async (req) => {
      const { name, id } = z.object({ name: z.string(), id: z.string() }).parse(req.params);
      const res = await resourceGuard(name, true)(req);
      await delegate(res.model).delete({ where: { [res.idField ?? 'id']: id } });
      await audit(req, 'delete', name, id);
      return { ok: true };
    });

    // ── Налаштування нагород ──
    r.get('/config/rewards', async () => {
      const row = await prisma.gameConfig.findUnique({ where: { key: 'rewards' } });
      return { ...DEFAULT_REWARDS, ...((row?.value as object) ?? {}) };
    });
    r.put('/config/rewards', async (req) => {
      if (req.admin!.role !== 'SUPERADMIN') throw new HttpError(403, 'forbidden');
      const shape = Object.fromEntries(Object.keys(DEFAULT_REWARDS).map((k) => [k, z.number().min(0).max(100000)]));
      const value = z.object(shape).partial().parse(req.body);
      const row = await prisma.gameConfig.findUnique({ where: { key: 'rewards' } });
      const merged = { ...DEFAULT_REWARDS, ...((row?.value as object) ?? {}), ...value };
      await prisma.gameConfig.upsert({ where: { key: 'rewards' }, create: { key: 'rewards', value: merged }, update: { value: merged } });
      invalidateRewards();
      await audit(req, 'update', 'config.rewards', 'rewards', value);
      return merged;
    });

    // ── Користувачі ──
    r.get('/users', async (req) => {
      if (req.admin!.role === 'EDITOR') throw new HttpError(403, 'forbidden');
      const q = z.object({ search: z.string().optional(), skip: z.coerce.number().default(0) }).parse(req.query);
      const where: Prisma.UserWhereInput = q.search
        ? { OR: [{ username: { contains: q.search, mode: 'insensitive' } }, { firstName: { contains: q.search, mode: 'insensitive' } }, ...(/^\d+$/.test(q.search) ? [{ telegramId: BigInt(q.search) }] : [])] }
        : {};
      const [items, total] = await Promise.all([
        prisma.user.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50, skip: q.skip, include: { progress: true, subscriptions: { where: { expiresAt: { gt: new Date() }, status: { in: ['ACTIVE', 'CANCELLED'] } } } } }),
        prisma.user.count({ where }),
      ]);
      return { items, total };
    });

    r.get('/users/:id', async (req) => {
      if (req.admin!.role === 'EDITOR') throw new HttpError(403, 'forbidden');
      const { id } = z.object({ id: z.string() }).parse(req.params);
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          settings: true, profile: true, progress: true, wallet: true, cities: { include: { city: { select: { namePl: true } } } },
          subscriptions: { orderBy: { createdAt: 'desc' } }, payments: { orderBy: { createdAt: 'desc' }, take: 50 },
          sessions: { orderBy: { startedAt: 'desc' }, take: 30, select: { id: true, mode: true, status: true, correct: true, total: true, xpAwarded: true, startedAt: true, finishedAt: true, lesson: { select: { slug: true } } } },
          xpEvents: { orderBy: { createdAt: 'desc' }, take: 30 },
          transactions: { orderBy: { createdAt: 'desc' }, take: 30 },
          achievements: { include: { achievement: { select: { slug: true } } } },
        },
      });
      if (!user) throw notFound();
      return user;
    });

    r.post('/users/:id/ban', async (req) => {
      if (req.admin!.role === 'EDITOR') throw new HttpError(403, 'forbidden');
      const { id } = z.object({ id: z.string() }).parse(req.params);
      const { banned, reason } = z.object({ banned: z.boolean(), reason: z.string().max(200).optional() }).parse(req.body);
      await prisma.user.update({ where: { id }, data: { isBanned: banned, banReason: banned ? reason ?? null : null } });
      await audit(req, banned ? 'ban' : 'unban', 'user', id, { reason });
      return { ok: true };
    });

    r.post('/users/:id/premium', async (req) => {
      if (req.admin!.role !== 'SUPERADMIN') throw new HttpError(403, 'forbidden');
      const { id } = z.object({ id: z.string() }).parse(req.params);
      const { days, revoke } = z.object({ days: z.number().int().min(1).max(3650).optional(), revoke: z.boolean().optional() }).parse(req.body);
      if (revoke) {
        await prisma.subscription.updateMany({ where: { userId: id, status: { in: ['ACTIVE', 'CANCELLED'] }, expiresAt: { gt: new Date() } }, data: { status: 'EXPIRED', expiresAt: new Date() } });
        await audit(req, 'premium_revoke', 'user', id);
        return { ok: true };
      }
      if (!days) throw badRequest('days_required');
      const now = new Date();
      await prisma.subscription.create({ data: { userId: id, planCode: 'ADMIN_GRANT', status: 'ACTIVE', startsAt: now, expiresAt: new Date(now.getTime() + days * 86_400_000), grantedByAdminId: req.admin!.id } });
      await audit(req, 'premium_grant', 'user', id, { days });
      return { ok: true };
    });

    // ── Монетизація ──
    r.get('/payments', async (req) => {
      if (req.admin!.role === 'EDITOR') throw new HttpError(403, 'forbidden');
      const q = z.object({ type: z.string().optional(), skip: z.coerce.number().default(0) }).parse(req.query);
      const [items, total, subs] = await Promise.all([
        prisma.paymentEvent.findMany({ where: q.type ? { type: q.type } : {}, orderBy: { createdAt: 'desc' }, take: 100, skip: q.skip, include: { user: { select: { id: true, firstName: true, username: true } } } }),
        prisma.paymentEvent.count({ where: q.type ? { type: q.type } : {} }),
        prisma.subscription.groupBy({ by: ['status', 'planCode'], _count: true }),
      ]);
      return { items, total, subscriptions: subs.map((s) => ({ status: s.status, planCode: s.planCode, count: s._count })) };
    });

    // ── Журнал дій ──
    r.get('/audit', async (req) => {
      if (req.admin!.role !== 'SUPERADMIN') throw new HttpError(403, 'forbidden');
      return prisma.adminAuditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 200, include: { admin: { select: { email: true } } } });
    });

    // ── Адміністратори ──
    r.get('/admins', async (req) => {
      if (req.admin!.role !== 'SUPERADMIN') throw new HttpError(403, 'forbidden');
      return prisma.adminUser.findMany({ select: { id: true, email: true, name: true, role: true, isActive: true, lastLoginAt: true } });
    });
    r.post('/admins', async (req) => {
      if (req.admin!.role !== 'SUPERADMIN') throw new HttpError(403, 'forbidden');
      const body = z.object({ email: z.string().email(), name: z.string().min(1), role: z.enum(['SUPERADMIN', 'EDITOR', 'SUPPORT']), password: z.string().min(10) }).parse(req.body);
      const a = await prisma.adminUser.create({ data: { email: body.email, name: body.name, role: body.role, passwordHash: await hashPassword(body.password) } });
      await audit(req, 'create', 'admin', a.id, { email: a.email, role: a.role });
      return { id: a.id };
    });

    // ── Завантаження ассетів ──
    r.post('/upload', async (req) => {
      if (req.admin!.role === 'SUPPORT') throw new HttpError(403, 'forbidden');
      const file = await req.file();
      if (!file) throw badRequest('no_file');
      const allowed: Record<string, string> = {
        'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp', 'image/gif': '.gif',
        'audio/mpeg': '.mp3', 'audio/ogg': '.ogg', 'audio/wav': '.wav', 'audio/webm': '.webm',
        'application/json': '.json', // Lottie-анімації
      };
      const ext = allowed[file.mimetype];
      if (!ext) throw badRequest('unsupported_type', `Unsupported type ${file.mimetype}`);
      await mkdir(config.uploadsDir, { recursive: true });
      const name = `${Date.now().toString(36)}-${randomBytes(6).toString('hex')}${ext || extname(file.filename)}`;
      await pipeline(file.file, createWriteStream(join(config.uploadsDir, name)));
      if (file.file.truncated) throw badRequest('file_too_large');
      await audit(req, 'upload', 'asset', name, { original: file.filename, type: file.mimetype });
      return { url: `/uploads/${name}` };
    });

    // ── Розсилки ──
    r.post('/campaigns/:id/send', async (req) => {
      if (req.admin!.role !== 'SUPERADMIN') throw new HttpError(403, 'forbidden');
      const { id } = z.object({ id: z.string() }).parse(req.params);
      const c = await prisma.notificationCampaign.findUnique({ where: { id } });
      if (!c) throw notFound();
      if (c.status !== 'DRAFT') throw badRequest('already_sent');
      if (!config.botToken) throw badRequest('bot_not_configured');
      await prisma.notificationCampaign.update({ where: { id }, data: { status: 'SENDING' } });
      await audit(req, 'send', 'campaign', id);
      // Лише користувачам, що погодилися на сповіщення. ~25 повідомлень/с — у межах лімітів Bot API.
      void (async () => {
        const users = await prisma.user.findMany({ where: { isBanned: false, settings: { notificationsEnabled: true } }, include: { settings: true } });
        let sent = 0;
        for (const u of users) {
          const msg = c.message as Record<string, string>;
          const text = msg[u.settings?.uiLanguage ?? 'uk'] ?? msg.uk;
          try {
            await botApi('sendMessage', { chat_id: Number(u.telegramId), text, reply_markup: { inline_keyboard: [[{ text: '🚀 POLSKI GO', web_app: { url: config.webAppUrl } }]] } });
            sent++;
          } catch {
            /* користувач міг заблокувати бота */
          }
          await new Promise((res) => setTimeout(res, 40));
        }
        await prisma.notificationCampaign.update({ where: { id }, data: { status: 'SENT', sentAt: new Date(), sentCount: sent } });
      })();
      return { ok: true };
    });
  });
};
