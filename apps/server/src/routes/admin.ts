/**
 * API адмін-панелі. Ролі: SUPERADMIN (усе), EDITOR (контент), SUPPORT (користувачі, платежі — перегляд).
 * Кожна зміна записується в admin_audit_logs.
 */
import { timingSafeEqual } from 'node:crypto';
import { Hono, type Context } from 'hono';
import { and, asc, count, desc, eq, getTableColumns, gt, gte, inArray, isNull, or, sql, type SQL } from 'drizzle-orm';
import type { SQLiteColumn, SQLiteTable } from 'drizzle-orm/sqlite-core';
import { z, type ZodTypeAny } from 'zod';
import { CEFR_LEVELS, EXERCISE_TYPES, DEFAULT_REWARDS } from '@polski-go/shared';
import { getBindings } from '../env';
import { atomic, db, isUniqueViolation } from '../db';
import * as t from '../db/schema';
import { forgetUser, requireAdmin } from '../auth';
import { body, query, rateLimit, type AppEnv } from '../hono';
import { HttpError, badRequest, notFound } from '../lib/errors';
import { hashPassword, verifyPassword } from '../lib/password';
import { signToken } from '../lib/token';
import { invalidateRewards } from '../services/gameConfig';
import {
  TTS_PROVIDER_IDS, buildProvider, cacheLabel, configuredProviders, contentPhrases, envVoice, listPolishVoices, migrateLegacyCacheKeys, synthesize, ttsCacheStats, ttsConfigured, ttsInputText, ttsProvider,
  ttsRuntime, ttsStatus,
} from '../services/tts';
import { AZURE_PL_VOICES, BENCHMARK_PHRASES, ELEVENLABS_PL_MODELS, GOOGLE_PL_VOICES, estimateUsd, priceFor } from '../services/tts-catalog';
import { pronunciationRisks } from '../services/tts-pronunciation';
import { ttsSpendSummary } from '../services/quota';
import { AUDIENCE_FILTERS, audience } from '../services/bot-audience';
import { refundPayment } from '../services/payments';
import { closeSupport, listSupport, replySupport } from '../services/support';
import { benchmarkPlan } from '../services/tts-benchmark';
import { readBotConfig } from '../bot/maintain';
import { runSetup } from '../bot/setup';

const i18n = z.object({ uk: z.string().min(1), ru: z.string().optional(), en: z.string().optional(), pl: z.string().optional() });
const status = z.enum(['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED']);
const json = z.any();

type Role = 'SUPERADMIN' | 'EDITOR' | 'SUPPORT';

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

async function audit(c: Context<AppEnv>, action: string, entity: string, entityId?: string | null, details?: unknown) {
  await db.insert(t.adminAuditLogs).values({ adminId: c.get('admin')?.id ?? null, action, entity, entityId: entityId ?? null, details: details ?? null });
}

type Row = Record<string, unknown> & { id?: string };

type Resource = {
  table: SQLiteTable;
  schema: z.ZodObject<Record<string, ZodTypeAny>>;
  orderBy: string[];
  search?: string[];
  filters?: string[];
  /** Додаткові пов'язані дані для списку (як include у старому API). */
  enrich?: (rows: Row[]) => Promise<Row[]>;
  roles: ('EDITOR' | 'SUPPORT')[];
  idField?: string;
};

async function countBy(table: SQLiteTable, col: SQLiteColumn, ids: string[]) {
  if (!ids.length) return new Map<string, number>();
  const rows = await db.select({ k: col, n: count() }).from(table).where(inArray(col, ids)).groupBy(col);
  return new Map(rows.map((r) => [r.k as string, r.n]));
}

/** Ресурси з універсальним CRUD. Поля поза схемою ігноруються. */
const RESOURCES: Record<string, Resource> = {
  cities: {
    table: t.cities, roles: ['EDITOR'], orderBy: ['order'], search: ['slug', 'namePl'],
    schema: z.object({ slug: z.string().regex(/^[a-z0-9-]+$/), order: z.number().int(), namePl: z.string(), name: i18n, theme: i18n, description: i18n, cefr: z.enum(CEFR_LEVELS), mapX: z.number(), mapY: z.number(), emoji: z.string(), color: z.string(), ticketLessons: z.number().int().min(0), status }),
  },
  routes: {
    table: t.cityRoutes, roles: ['EDITOR'], orderBy: ['cityId', 'order'], search: ['slug'], filters: ['cityId'],
    enrich: async (rows) => {
      const cityIds = [...new Set(rows.map((r) => r.cityId as string))];
      const cs = cityIds.length ? await db.select({ id: t.cities.id, namePl: t.cities.namePl }).from(t.cities).where(inArray(t.cities.id, cityIds)) : [];
      const n = await countBy(t.lessons, t.lessons.routeId, rows.map((r) => r.id!));
      return rows.map((r) => ({ ...r, city: cs.find((c) => c.id === r.cityId) ?? null, _count: { lessons: n.get(r.id!) ?? 0 } }));
    },
    schema: z.object({ cityId: z.string(), slug: z.string().regex(/^[a-z0-9-]+$/), order: z.number().int(), title: i18n, description: i18n, icon: z.string(), status }),
  },
  lessons: {
    table: t.lessons, roles: ['EDITOR'], orderBy: ['routeId', 'order'], search: ['slug'], filters: ['routeId', 'kind', 'status'],
    enrich: async (rows) => {
      const routeIds = [...new Set(rows.map((r) => r.routeId as string).filter(Boolean))];
      const rs = routeIds.length ? await db.select({ id: t.cityRoutes.id, slug: t.cityRoutes.slug }).from(t.cityRoutes).where(inArray(t.cityRoutes.id, routeIds)) : [];
      const n = await countBy(t.exercises, t.exercises.lessonId, rows.map((r) => r.id!));
      return rows.map((r) => ({ ...r, route: rs.find((x) => x.id === r.routeId) ?? null, _count: { exercises: n.get(r.id!) ?? 0 } }));
    },
    schema: z.object({ routeId: z.string().nullable(), slug: z.string().regex(/^[a-z0-9-]+$/), order: z.number().int(), kind: z.enum(['LESSON', 'BOSS', 'EXAM', 'PLACEMENT']), title: i18n, topic: i18n, cefr: z.enum(CEFR_LEVELS), difficulty: z.number().int().min(1).max(5), explanation: i18n, examples: json, isPremium: z.boolean(), status }),
  },
  exercises: {
    table: t.exercises, roles: ['EDITOR'], orderBy: ['lessonId', 'order'], filters: ['lessonId', 'type'],
    schema: z.object({ lessonId: z.string(), order: z.number().int(), type: z.enum(EXERCISE_TYPES), skill: z.string().min(1), data: z.record(z.any()), explanation: i18n.nullable(), audioUrl: z.string().nullable(), imageUrl: z.string().nullable() }),
  },
  vocabulary: {
    table: t.vocabularyEntries, roles: ['EDITOR'], orderBy: ['pl'], search: ['pl'], filters: ['cefr', 'status'],
    schema: z.object({ pl: z.string().min(1), pos: z.string(), translations: i18n, pronunciation: z.string().nullable(), forms: json, examples: json, cefr: z.enum(CEFR_LEVELS), topics: z.array(z.string()), emoji: z.string().nullable(), audioUrl: z.string().nullable(), imageUrl: z.string().nullable(), status }),
  },
  quests: {
    table: t.quests, roles: ['EDITOR'], orderBy: ['kind', 'order'], search: ['slug'], filters: ['kind'],
    enrich: async (rows) => {
      const n = await countBy(t.questSteps, t.questSteps.questId, rows.map((r) => r.id!));
      return rows.map((r) => ({ ...r, _count: { steps: n.get(r.id!) ?? 0 } }));
    },
    schema: z.object({ slug: z.string(), kind: z.enum(['DAILY', 'WEEKLY', 'STORY', 'EVENT']), title: i18n, description: i18n, metric: z.enum(['LESSONS', 'XP', 'NEW_WORDS', 'REVIEWS', 'PERFECT_STREAK', 'DIALOGUES', 'LISTENING', 'CITY_COMPLETED', 'STORY']), target: z.number().int().min(1), xpReward: z.number().int().min(0), zlotkiReward: z.number().int().min(0), rewardItemId: z.string().nullable(), cityId: z.string().nullable(), icon: z.string(), isPremium: z.boolean(), status, order: z.number().int() }),
  },
  questSteps: {
    table: t.questSteps, roles: ['EDITOR'], orderBy: ['questId', 'order'], filters: ['questId'],
    schema: z.object({ questId: z.string(), order: z.number().int(), data: z.object({ title: i18n, start: z.string(), nodes: z.record(z.any()) }) }),
  },
  achievements: {
    table: t.achievements, roles: ['EDITOR'], orderBy: ['order'], search: ['slug'],
    schema: z.object({ slug: z.string(), title: i18n, description: i18n, icon: z.string(), metric: z.enum(['LESSONS', 'STREAK', 'WORDS', 'XP', 'PERFECT_LESSONS', 'CITIES', 'PURCHASES', 'FRIENDS', 'STORY_QUESTS']), threshold: z.number().int().min(1), zlotkiReward: z.number().int().min(0), rewardItemId: z.string().nullable(), order: z.number().int(), isActive: z.boolean() }),
  },
  items: {
    table: t.cosmeticItems, roles: ['EDITOR'], orderBy: ['slot', 'order'], search: ['slug'], filters: ['slot'],
    schema: z.object({ slug: z.string(), slot: z.enum(['HAT', 'GLASSES', 'SCARF', 'JACKET', 'BACKPACK', 'SHOES', 'ACCESSORY', 'COSTUME', 'FURNITURE', 'DECOR', 'SOUVENIR', 'FRAME']), name: i18n, assetKey: z.string(), price: z.number().int().min(0), rarity: z.enum(['common', 'rare', 'epic', 'legendary']), isPremium: z.boolean(), rewardOnly: z.boolean(), cityId: z.string().nullable(), isActive: z.boolean(), order: z.number().int() }),
  },
  plans: {
    table: t.subscriptionPlans, roles: [], orderBy: ['order'], idField: 'code',
    schema: z.object({ code: z.string().regex(/^[A-Z0-9_]+$/), months: z.number().int().min(1), priceStars: z.number().int().min(1).max(100000), recurring: z.boolean(), title: i18n, isActive: z.boolean(), order: z.number().int() }),
  },
  campaigns: {
    table: t.notificationCampaigns, roles: [], orderBy: ['-createdAt'],
    schema: z.object({ kind: z.enum(['reminder', 'new_lessons', 'new_city', 'event', 'challenge']), title: z.string().min(1).max(100), message: i18n }),
  },
};

const columnsOf = (r: Resource) => getTableColumns(r.table) as Record<string, SQLiteColumn>;
const idCol = (r: Resource) => columnsOf(r)[r.idField ?? 'id'];

function guard(c: Context<AppEnv>, name: string, write: boolean): Resource {
  const res = RESOURCES[name];
  if (!res) throw notFound();
  const role = c.get('admin')!.role;
  if (role === 'SUPERADMIN') return res;
  if (!res.roles.includes(role as 'EDITOR' | 'SUPPORT')) throw new HttpError(403, 'forbidden');
  if (write && role === 'SUPPORT') throw new HttpError(403, 'forbidden');
  return res;
}

function needRole(c: Context<AppEnv>, ...roles: Role[]) {
  if (!roles.includes(c.get('admin')!.role)) throw new HttpError(403, 'forbidden');
}

export const adminRoutes = new Hono<AppEnv>();

adminRoutes.post('/login', rateLimit(10, 5 * 60_000, 'admin-login'), async (c) => {
  const { email, password } = z.object({ email: z.string().email(), password: z.string().min(1) }).parse(await body(c));
  let admin = await db.query.adminUsers.findFirst({ where: eq(t.adminUsers.email, email) });
  // Перший вхід: суперадмін створюється з секретів ADMIN_EMAIL / ADMIN_PASSWORD Worker.
  const env = getBindings();
  if (!admin && env.ADMIN_EMAIL && env.ADMIN_PASSWORD && email === env.ADMIN_EMAIL && safeEqual(password, env.ADMIN_PASSWORD)) {
    [admin] = await db
      .insert(t.adminUsers)
      .values({ email, name: 'Super Admin', role: 'SUPERADMIN', passwordHash: await hashPassword(password) })
      .onConflictDoNothing()
      .returning();
    admin ??= await db.query.adminUsers.findFirst({ where: eq(t.adminUsers.email, email) });
  }
  if (!admin || !admin.isActive || !(await verifyPassword(password, admin.passwordHash))) throw new HttpError(401, 'invalid_credentials');
  await atomic([
    db.update(t.adminUsers).set({ lastLoginAt: new Date() }).where(eq(t.adminUsers.id, admin.id)),
    db.insert(t.adminAuditLogs).values({ adminId: admin.id, action: 'login', entity: 'admin', entityId: admin.id }),
  ]);
  return c.json({ token: signToken({ aid: admin.id, typ: 'admin' }, 12 * 3600), admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role } });
});

const a = new Hono<AppEnv>();
a.use(requireAdmin());

a.get('/me', async (c) => {
  const me = await db.query.adminUsers.findFirst({ where: eq(t.adminUsers.id, c.get('admin')!.id), columns: { id: true, email: true, name: true, role: true } });
  return c.json(me);
});

// ── Dashboard ──
a.get('/dashboard', async (c) => {
  const now = Date.now();
  const d1 = new Date(now - 86_400_000);
  const d7 = new Date(now - 7 * 86_400_000);
  const d30 = new Date(now - 30 * 86_400_000);
  const nowD = new Date();
  const [users, active1, active7, new7, lessonsTotal, lessons7, avg, premium, revenue30, revenueAll] = await db.batch([
    db.select({ n: count() }).from(t.users),
    db.select({ n: count() }).from(t.users).where(gte(t.users.lastSeenAt, d1)),
    db.select({ n: count() }).from(t.users).where(gte(t.users.lastSeenAt, d7)),
    db.select({ n: count() }).from(t.users).where(gte(t.users.createdAt, d7)),
    db.select({ n: count() }).from(t.learningSessions).where(and(eq(t.learningSessions.mode, 'LESSON'), eq(t.learningSessions.status, 'FINISHED'))),
    db.select({ n: count() }).from(t.learningSessions).where(and(eq(t.learningSessions.mode, 'LESSON'), eq(t.learningSessions.status, 'FINISHED'), gte(t.learningSessions.finishedAt, d7))),
    db
      .select({ xp: sql<number>`avg(${t.playerProgress.xpTotal})`, lessons: sql<number>`avg(${t.playerProgress.lessonsCompleted})`, words: sql<number>`avg(${t.playerProgress.wordsLearned})` })
      .from(t.playerProgress),
    db
      .select({ n: sql<number>`count(DISTINCT ${t.subscriptions.userId})` })
      .from(t.subscriptions)
      .where(and(inArray(t.subscriptions.status, ['ACTIVE', 'CANCELLED']), gt(t.subscriptions.expiresAt, nowD))),
    db
      .select({ sum: sql<number>`coalesce(sum(${t.paymentEvents.amount}), 0)`, n: count() })
      .from(t.paymentEvents)
      .where(and(eq(t.paymentEvents.type, 'SUCCESSFUL_PAYMENT'), isNull(t.paymentEvents.error), gte(t.paymentEvents.createdAt, d30))),
    db.select({ sum: sql<number>`coalesce(sum(${t.paymentEvents.amount}), 0)` }).from(t.paymentEvents).where(and(eq(t.paymentEvents.type, 'SUCCESSFUL_PAYMENT'), isNull(t.paymentEvents.error))),
  ]);
  const day = (col: string) => sql.raw(`strftime('%Y-%m-%d', ${col} / 1000, 'unixepoch')`);
  const [signups, topLessons, errors, retention] = await Promise.all([
    db.all<{ day: string; count: number }>(sql`SELECT ${day('created_at')} AS day, COUNT(*) AS count FROM users WHERE created_at >= ${d30.getTime()} GROUP BY 1 ORDER BY 1`),
    db.all<{ slug: string; title: string; count: number }>(sql`
      SELECT l.slug, l.title, COUNT(*) AS count FROM user_lesson_progress p JOIN lessons l ON l.id = p.lesson_id
      WHERE p.first_completed_at IS NOT NULL GROUP BY l.slug, l.title ORDER BY count DESC LIMIT 8`),
    db.all<{ exercise_id: string; lesson: string; type: string; wrong: number; total: number }>(sql`
      SELECT a.exercise_id, l.slug AS lesson, a.type, SUM(CASE WHEN a.is_correct THEN 0 ELSE 1 END) AS wrong, COUNT(*) AS total
      FROM exercise_attempts a JOIN exercises e ON e.id = a.exercise_id JOIN lessons l ON l.id = e.lesson_id
      GROUP BY a.exercise_id, l.slug, a.type HAVING COUNT(*) >= 3 ORDER BY (SUM(CASE WHEN a.is_correct THEN 0 ELSE 1 END) * 1.0 / COUNT(*)) DESC LIMIT 10`),
    // Retention D1/D7: частка користувачів, активних наступного / через 7 днів після реєстрації.
    db.all<{ d1: number | null; d7: number | null }>(sql`
      SELECT
        AVG(CASE WHEN EXISTS (SELECT 1 FROM daily_activity a WHERE a.user_id = u.id AND a.day = strftime('%Y-%m-%d', u.created_at / 1000 + 86400, 'unixepoch')) THEN 1.0 ELSE 0 END)
          FILTER (WHERE u.created_at < ${now - 2 * 86_400_000}) AS d1,
        AVG(CASE WHEN EXISTS (SELECT 1 FROM daily_activity a WHERE a.user_id = u.id AND a.day >= strftime('%Y-%m-%d', u.created_at / 1000 + 7 * 86400, 'unixepoch')) THEN 1.0 ELSE 0 END)
          FILTER (WHERE u.created_at < ${now - 8 * 86_400_000}) AS d7
      FROM users u WHERE u.created_at >= ${now - 90 * 86_400_000}`),
  ]);
  const n = (r: { n: number }[]) => r[0]?.n ?? 0;
  return c.json({
    users: n(users), active1: n(active1), active7: n(active7), new7: n(new7), lessonsTotal: n(lessonsTotal), lessons7: n(lessons7),
    avgXp: Math.round(avg[0]?.xp ?? 0), avgLessons: Math.round((avg[0]?.lessons ?? 0) * 10) / 10, avgWords: Math.round(avg[0]?.words ?? 0),
    premium: n(premium), revenue30Stars: revenue30[0]?.sum ?? 0, payments30: revenue30[0]?.n ?? 0, revenueAllStars: revenueAll[0]?.sum ?? 0,
    signups: signups.map((s) => ({ day: s.day, count: Number(s.count) })),
    topLessons: topLessons.map((x) => ({ slug: x.slug, title: JSON.parse(x.title), count: Number(x.count) })),
    errors: errors.map((e) => ({ exerciseId: e.exercise_id, lesson: e.lesson, type: e.type, wrong: Number(e.wrong), total: Number(e.total), rate: Math.round((Number(e.wrong) / Number(e.total)) * 100) })),
    retention: { d1: retention[0]?.d1 != null ? Math.round(Number(retention[0].d1) * 100) : null, d7: retention[0]?.d7 != null ? Math.round(Number(retention[0].d7) * 100) : null },
  });
});

// ── Універсальний CRUD ──
a.get('/resources/:name', async (c) => {
  const res = guard(c, c.req.param('name'), false);
  const q = query(c);
  const cols = columnsOf(res);
  const conds: (SQL | undefined)[] = [];
  for (const f of res.filters ?? []) if (q[f]) conds.push(q[f] === 'null' ? isNull(cols[f]) : eq(cols[f], q[f]));
  if (q.search && res.search?.length) {
    const s = `%${q.search.toLowerCase()}%`;
    conds.push(or(...res.search.map((f) => sql`lower(${cols[f]}) LIKE ${s}`)));
  }
  const where = and(...conds);
  const take = Math.min(Number(q.take ?? 100), 500);
  const skip = Number(q.skip ?? 0);
  const order = res.orderBy.map((o) => (o.startsWith('-') ? desc(cols[o.slice(1)]) : asc(cols[o])));
  const [rows, total] = await db.batch([
    db.select().from(res.table).where(where).orderBy(...order).limit(take).offset(skip),
    db.select({ n: count() }).from(res.table).where(where),
  ]);
  const items = res.enrich ? await res.enrich(rows as Row[]) : rows;
  return c.json({ items, total: total[0]?.n ?? 0 });
});

a.get('/resources/:name/:id', async (c) => {
  const res = guard(c, c.req.param('name'), false);
  const [item] = await db.select().from(res.table).where(eq(idCol(res), c.req.param('id')));
  if (!item) throw notFound();
  return c.json(res.enrich ? (await res.enrich([item as Row]))[0] : item);
});

a.post('/resources/:name', async (c) => {
  const name = c.req.param('name');
  const res = guard(c, name, true);
  const data = res.schema.parse(await body(c));
  let item: Row;
  try {
    [item] = (await db.insert(res.table).values(data as never).returning()) as Row[];
  } catch (e) {
    if (isUniqueViolation(e)) throw badRequest('duplicate', 'Запис із таким ключем уже існує');
    throw e;
  }
  await audit(c, 'create', name, item[res.idField ?? 'id'] as string, data);
  if (name === 'plans') invalidateRewards();
  return c.json(item);
});

a.patch('/resources/:name/:id', async (c) => {
  const name = c.req.param('name');
  const res = guard(c, name, true);
  const id = c.req.param('id');
  const data = res.schema.partial().parse(await body(c));
  const [item] = Object.keys(data).length
    ? await db.update(res.table).set(data as never).where(eq(idCol(res), id)).returning()
    : await db.select().from(res.table).where(eq(idCol(res), id));
  if (!item) throw notFound();
  await audit(c, 'update', name, id, data);
  return c.json(item);
});

a.delete('/resources/:name/:id', async (c) => {
  const name = c.req.param('name');
  const res = guard(c, name, true);
  const id = c.req.param('id');
  await db.delete(res.table).where(eq(idCol(res), id));
  await audit(c, 'delete', name, id);
  return c.json({ ok: true });
});

// ── Налаштування нагород ──
a.get('/config/rewards', async (c) => {
  const row = await db.query.gameConfig.findFirst({ where: eq(t.gameConfig.key, 'rewards') });
  return c.json({ ...DEFAULT_REWARDS, ...(row?.value ?? {}) });
});
a.put('/config/rewards', async (c) => {
  needRole(c, 'SUPERADMIN');
  const shape = Object.fromEntries(Object.keys(DEFAULT_REWARDS).map((k) => [k, z.number().min(0).max(100000)]));
  const value = z.object(shape).partial().parse(await body(c));
  const row = await db.query.gameConfig.findFirst({ where: eq(t.gameConfig.key, 'rewards') });
  const merged = { ...DEFAULT_REWARDS, ...(row?.value ?? {}), ...value };
  await db.insert(t.gameConfig).values({ key: 'rewards', value: merged }).onConflictDoUpdate({ target: t.gameConfig.key, set: { value: merged, updatedAt: new Date() } });
  invalidateRewards();
  await audit(c, 'update', 'config.rewards', 'rewards', value);
  return c.json(merged);
});

// ── Користувачі ──
a.get('/users', async (c) => {
  needRole(c, 'SUPERADMIN', 'SUPPORT');
  const q = z.object({ search: z.string().optional(), skip: z.coerce.number().default(0) }).parse(query(c));
  const s = q.search ? `%${q.search.toLowerCase()}%` : null;
  const where = s
    ? or(sql`lower(${t.users.username}) LIKE ${s}`, sql`lower(${t.users.firstName}) LIKE ${s}`, /^\d+$/.test(q.search!) ? eq(t.users.telegramId, Number(q.search)) : undefined)
    : undefined;
  const [rows, total] = await Promise.all([
    db.select({ u: t.users, progress: t.playerProgress }).from(t.users).leftJoin(t.playerProgress, eq(t.playerProgress.userId, t.users.id)).where(where).orderBy(desc(t.users.createdAt)).limit(50).offset(q.skip),
    db.select({ n: count() }).from(t.users).where(where),
  ]);
  const ids = rows.map((r) => r.u.id);
  const subs = ids.length
    ? await db.select().from(t.subscriptions).where(and(inArray(t.subscriptions.userId, ids), inArray(t.subscriptions.status, ['ACTIVE', 'CANCELLED']), gt(t.subscriptions.expiresAt, new Date())))
    : [];
  return c.json({ items: rows.map((r) => ({ ...r.u, progress: r.progress, subscriptions: subs.filter((x) => x.userId === r.u.id) })), total: total[0]?.n ?? 0 });
});

// Аудитория бота: кто писал боту и кто открывал приложение, одним списком; счётчики за день, 7 и 30 дней.
a.get('/audience', async (c) => {
  needRole(c, 'SUPERADMIN', 'SUPPORT');
  const q = z
    .object({
      filter: z.enum(AUDIENCE_FILTERS).default('all'),
      days: z.coerce.number().int().refine((d) => [0, 1, 7, 30].includes(d)).default(0),
      search: z.string().trim().max(64).optional(),
      skip: z.coerce.number().int().min(0).default(0),
    })
    .parse(query(c));
  return c.json(await audience({ filter: q.filter, days: q.days || null, search: q.search || null, skip: q.skip, limit: 50 }));
});

a.get('/users/:id', async (c) => {
  needRole(c, 'SUPERADMIN', 'SUPPORT');
  const id = c.req.param('id');
  const [user, settings, profile, progress, wallet, cities, subs, payments, sessions, xpEvents, transactions, achievements] = await Promise.all([
    db.select().from(t.users).where(eq(t.users.id, id)),
    db.select().from(t.userSettings).where(eq(t.userSettings.userId, id)),
    db.select().from(t.userProfiles).where(eq(t.userProfiles.userId, id)),
    db.select().from(t.playerProgress).where(eq(t.playerProgress.userId, id)),
    db.select().from(t.gameWallets).where(eq(t.gameWallets.userId, id)),
    db.select({ uc: t.userCities, namePl: t.cities.namePl }).from(t.userCities).innerJoin(t.cities, eq(t.cities.id, t.userCities.cityId)).where(eq(t.userCities.userId, id)),
    db.select().from(t.subscriptions).where(eq(t.subscriptions.userId, id)).orderBy(desc(t.subscriptions.createdAt)),
    db.select().from(t.paymentEvents).where(eq(t.paymentEvents.userId, id)).orderBy(desc(t.paymentEvents.createdAt)).limit(50),
    db
      .select({ s: t.learningSessions, slug: t.lessons.slug })
      .from(t.learningSessions)
      .leftJoin(t.lessons, eq(t.lessons.id, t.learningSessions.lessonId))
      .where(eq(t.learningSessions.userId, id))
      .orderBy(desc(t.learningSessions.startedAt))
      .limit(30),
    db.select().from(t.xpEvents).where(eq(t.xpEvents.userId, id)).orderBy(desc(t.xpEvents.createdAt)).limit(30),
    db.select().from(t.walletTransactions).where(eq(t.walletTransactions.userId, id)).orderBy(desc(t.walletTransactions.createdAt)).limit(30),
    db.select({ ua: t.userAchievements, slug: t.achievements.slug }).from(t.userAchievements).innerJoin(t.achievements, eq(t.achievements.id, t.userAchievements.achievementId)).where(eq(t.userAchievements.userId, id)),
  ]);
  if (!user[0]) throw notFound();
  return c.json({
    ...user[0],
    settings: settings[0] ?? null,
    profile: profile[0] ?? null,
    progress: progress[0] ?? null,
    wallet: wallet[0] ?? null,
    cities: cities.map((x) => ({ ...x.uc, city: { namePl: x.namePl } })),
    subscriptions: subs,
    payments,
    sessions: sessions.map(({ s, slug }) => ({
      id: s.id, mode: s.mode, status: s.status, correct: s.correct, total: s.total, xpAwarded: s.xpAwarded, startedAt: s.startedAt, finishedAt: s.finishedAt, lesson: slug ? { slug } : null,
    })),
    xpEvents,
    transactions,
    achievements: achievements.map((x) => ({ ...x.ua, achievement: { slug: x.slug } })),
  });
});

a.post('/users/:id/ban', async (c) => {
  needRole(c, 'SUPERADMIN', 'SUPPORT');
  const id = c.req.param('id');
  const { banned, reason } = z.object({ banned: z.boolean(), reason: z.string().max(200).optional() }).parse(await body(c));
  await db.update(t.users).set({ isBanned: banned, banReason: banned ? (reason ?? null) : null }).where(eq(t.users.id, id));
  forgetUser(id);
  await audit(c, banned ? 'ban' : 'unban', 'user', id, { reason });
  return c.json({ ok: true });
});

a.post('/users/:id/premium', async (c) => {
  needRole(c, 'SUPERADMIN');
  const id = c.req.param('id');
  const { days, revoke } = z.object({ days: z.number().int().min(1).max(3650).optional(), revoke: z.boolean().optional() }).parse(await body(c));
  const now = new Date();
  if (revoke) {
    await db
      .update(t.subscriptions)
      .set({ status: 'EXPIRED', expiresAt: now })
      .where(and(eq(t.subscriptions.userId, id), inArray(t.subscriptions.status, ['ACTIVE', 'CANCELLED']), gt(t.subscriptions.expiresAt, now)));
    await audit(c, 'premium_revoke', 'user', id);
    return c.json({ ok: true });
  }
  if (!days) throw badRequest('days_required');
  await db.insert(t.subscriptions).values({ userId: id, planCode: 'ADMIN_GRANT', status: 'ACTIVE', startsAt: now, expiresAt: new Date(now.getTime() + days * 86_400_000), grantedByAdminId: c.get('admin')!.id });
  await audit(c, 'premium_grant', 'user', id, { days });
  return c.json({ ok: true });
});

// ── Монетизація ──
a.get('/payments', async (c) => {
  needRole(c, 'SUPERADMIN', 'SUPPORT');
  const q = z.object({ type: z.string().optional(), skip: z.coerce.number().default(0) }).parse(query(c));
  const where = q.type ? eq(t.paymentEvents.type, q.type) : undefined;
  const [items, total, subs] = await Promise.all([
    db
      .select({ ev: t.paymentEvents, user: { id: t.users.id, firstName: t.users.firstName, username: t.users.username } })
      .from(t.paymentEvents)
      .leftJoin(t.users, eq(t.users.id, t.paymentEvents.userId))
      .where(where)
      .orderBy(desc(t.paymentEvents.createdAt))
      .limit(100)
      .offset(q.skip),
    db.select({ n: count() }).from(t.paymentEvents).where(where),
    db.select({ status: t.subscriptions.status, planCode: t.subscriptions.planCode, count: count() }).from(t.subscriptions).groupBy(t.subscriptions.status, t.subscriptions.planCode),
  ]);
  return c.json({ items: items.map((x) => ({ ...x.ev, user: x.user?.id ? x.user : null })), total: total[0]?.n ?? 0, subscriptions: subs });
});

// Повернення зірок за платіж (Telegram refundStarPayment): Premium за цим платежем знімається одразу.
a.post('/payments/refund', rateLimit(20, 10 * 60_000, 'admin-refund'), async (c) => {
  needRole(c, 'SUPERADMIN');
  const { chargeId } = z.object({ chargeId: z.string().min(1).max(256) }).parse(await body(c));
  const res = await refundPayment(chargeId);
  await audit(c, 'payment_refund', 'payment', chargeId, { revoked: res.revoked });
  return c.json(res);
});

// ── Підтримка з оплат (/paysupport у боті) ──
a.get('/support', async (c) => {
  needRole(c, 'SUPERADMIN', 'SUPPORT');
  const { status } = z.object({ status: z.enum(['OPEN', 'DONE', 'all']).default('OPEN') }).parse(query(c));
  return c.json({ items: await listSupport(status) });
});
a.post('/support/:id/reply', async (c) => {
  needRole(c, 'SUPERADMIN', 'SUPPORT');
  const { text } = z.object({ text: z.string().min(1).max(3500) }).parse(await body(c));
  const res = await replySupport(c.req.param('id'), text);
  await audit(c, 'support_reply', 'support', c.req.param('id'));
  return c.json(res);
});
a.post('/support/:id/close', async (c) => {
  needRole(c, 'SUPERADMIN', 'SUPPORT');
  const res = await closeSupport(c.req.param('id'));
  await audit(c, 'support_close', 'support', c.req.param('id'));
  return c.json(res);
});

// ── Бот: перевірка та налаштування (команди, меню, webhook із callback_query, серверний секрет) ──
a.get('/bot', async (c) => {
  needRole(c, 'SUPERADMIN');
  return c.json({ report: await runSetup('check'), maintenance: await readBotConfig() });
});
a.post('/bot/setup', rateLimit(10, 10 * 60_000, 'admin-bot'), async (c) => {
  needRole(c, 'SUPERADMIN');
  const { mode } = z.object({ mode: z.enum(['setup', 'rotate']) }).parse(await body(c));
  const report = await runSetup(mode);
  // У журнал — лише підсумок кроків: секретів у звіті немає.
  await audit(c, mode === 'rotate' ? 'bot_rotate_secret' : 'bot_setup', 'bot', report.bot?.username ?? null, { ok: report.ok, steps: report.steps, secretGeneration: report.secretGeneration });
  return c.json(report);
});

// ── Журнал дій ──
a.get('/audit', async (c) => {
  needRole(c, 'SUPERADMIN');
  const rows = await db
    .select({ log: t.adminAuditLogs, email: t.adminUsers.email })
    .from(t.adminAuditLogs)
    .leftJoin(t.adminUsers, eq(t.adminUsers.id, t.adminAuditLogs.adminId))
    .orderBy(desc(t.adminAuditLogs.createdAt))
    .limit(200);
  return c.json(rows.map((r) => ({ ...r.log, admin: r.email ? { email: r.email } : null })));
});

// ── Адміністратори ──
a.get('/admins', async (c) => {
  needRole(c, 'SUPERADMIN');
  return c.json(
    await db.select({ id: t.adminUsers.id, email: t.adminUsers.email, name: t.adminUsers.name, role: t.adminUsers.role, isActive: t.adminUsers.isActive, lastLoginAt: t.adminUsers.lastLoginAt }).from(t.adminUsers),
  );
});
a.post('/admins', async (c) => {
  needRole(c, 'SUPERADMIN');
  const b = z.object({ email: z.string().email(), name: z.string().min(1), role: z.enum(['SUPERADMIN', 'EDITOR', 'SUPPORT']), password: z.string().min(10) }).parse(await body(c));
  const [created] = await db.insert(t.adminUsers).values({ email: b.email, name: b.name, role: b.role, passwordHash: await hashPassword(b.password) }).returning();
  await audit(c, 'create', 'admin', created.id, { email: created.email, role: created.role });
  return c.json({ id: created.id });
});

// ── Завантаження ассетів (зберігаються в D1) ──
const ALLOWED: Record<string, string> = {
  'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp', 'image/gif': '.gif',
  'audio/mpeg': '.mp3', 'audio/ogg': '.ogg', 'audio/wav': '.wav', 'audio/webm': '.webm',
  'application/json': '.json', // Lottie-анімації
};
/** Обмеження рядка D1 — 2 МБ. */
const MAX_UPLOAD = 1900 * 1024;

a.post('/upload', async (c) => {
  needRole(c, 'SUPERADMIN', 'EDITOR');
  const form = await c.req.parseBody();
  const file = form.file;
  if (!(file instanceof File)) throw badRequest('no_file');
  const ext = ALLOWED[file.type];
  if (!ext) throw badRequest('unsupported_type', `Unsupported type ${file.type}`);
  if (file.size > MAX_UPLOAD) throw badRequest('file_too_large', 'Файл більший за 1,9 МБ');
  const name = `${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 12)}${ext}`;
  await db.insert(t.uploads).values({ name, type: file.type, data: Buffer.from(await file.arrayBuffer()) });
  await audit(c, 'upload', 'asset', name, { original: file.name, type: file.type });
  return c.json({ url: `/uploads/${name}` });
});

// ── Попередній синтез озвучки всього контенту (частинами — ліміт підзапитів Worker) ──
a.post('/tts/warm', async (c) => {
  needRole(c, 'SUPERADMIN', 'EDITOR');
  if (!ttsConfigured()) throw badRequest('tts_not_configured', 'Додайте GOOGLE_TTS_API_KEY або AZURE_SPEECH_KEY + AZURE_SPEECH_REGION');
  const { offset } = z.object({ offset: z.number().int().min(0).default(0) }).parse(await body(c));
  const phrases = await contentPhrases();
  const chunk = phrases.slice(offset, offset + 12);
  let synthesized = 0;
  const failed: string[] = [];
  for (const text of chunk) {
    for (const rate of ['normal', 'slow'] as const) {
      try {
        if (!(await synthesize(text, rate, { payer: 'admin' })).cached) synthesized++;
      } catch {
        failed.push(text);
      }
    }
  }
  const next = offset + chunk.length;
  return c.json({ total: phrases.length, next, done: next >= phrases.length, synthesized, failed });
});

// ── Діагностика озвучки: що реально грає, кеш, оцінка прогріву. Без синтезу і без ключів у відповіді ──
a.get('/tts/status', async (c) => {
  needRole(c, 'SUPERADMIN', 'EDITOR');
  const p = ttsProvider();
  const [cache, phrases, spend] = await Promise.all([ttsCacheStats(), contentPhrases(), ttsSpendSummary()]);
  // Прогрів синтезує кожну фразу на двох швидкостях; уже закешоване поточним голосом не оплачується.
  const chars = phrases.reduce((n, text) => n + [...ttsInputText(text)].length, 0) * 2;
  const label = p ? cacheLabel(p) : null;
  const cachedChars = cache.groups.filter((g) => g.label === label).reduce((n, g) => n + g.chars, 0);
  const price = p ? priceFor(p.provider, p.model) : null;
  const left = Math.max(0, chars - cachedChars);
  return c.json({
    ...ttsStatus(),
    runtime: ttsRuntime(),
    cache,
    /** Платний синтез за добу й 30 днів: user — у межах TTS_GLOBAL_DAILY_CHARS, admin — прогрів і порівняння голосів. */
    spend,
    warm: { phrases: phrases.length, chars, cachedChars, left, price, usd: price ? { freeTierLeft: estimateUsd(left, price), freeTierUsed: estimateUsd(left, price, price.freeCharsPerMonth) } : null },
  });
});

/** План сліпого тесту голосів (dry-run): кандидати, попередження, ціни, приклад запиту без ключа. */
a.get('/tts/benchmark', (c) => {
  needRole(c, 'SUPERADMIN', 'EDITOR');
  return c.json(benchmarkPlan({ region: getBindings().AZURE_SPEECH_REGION || undefined }));
});

/** Польські голоси, які реально віддає провайдер (список, не синтез). */
a.get('/tts/voices', rateLimit(10, 60_000, 'tts-voices'), async (c) => {
  needRole(c, 'SUPERADMIN', 'EDITOR');
  const { provider } = z.object({ provider: z.enum(TTS_PROVIDER_IDS) }).parse(query(c));
  return c.json({ provider, voices: await listPolishVoices(provider) });
});

// ── Порівняння голосів на слух (адмінка → «Порівняння голосів»): власник слухає з телефона, без CLI і ключів у браузері ──
/** Голоси, які можна прослухати (лише провайдери з ключем), фрази бенчмарку і ризиковані фрази контенту. Без синтезу. */
a.get('/tts/compare', async (c) => {
  needRole(c, 'SUPERADMIN', 'EDITOR');
  const configured = configuredProviders();
  const current = ttsProvider();
  const voices: { provider: string; voice: string; model: string; gender: string | null; price: ReturnType<typeof priceFor>; current: boolean }[] = [];
  const push = (provider: (typeof TTS_PROVIDER_IDS)[number], voice: string, model: string, gender: string | null) =>
    voices.push({ provider, voice, model, gender, price: priceFor(provider, model), current: current?.provider === provider && current.voice === voice && current.model === model });
  if (configured.includes('google')) for (const v of GOOGLE_PL_VOICES) push('google', v.name, v.model, v.gender);
  if (configured.includes('azure')) for (const v of AZURE_PL_VOICES) push('azure', v.name, v.model, v.gender);
  if (configured.includes('elevenlabs')) {
    const ev = envVoice('elevenlabs');
    push('elevenlabs', ev.voice, ev.model, null);
  }
  // Поточний голос, якого немає в офіційному списку (pl-PL-Wavenet-A): теж можна прослухати — чи синтезується він узагалі.
  if (current && !voices.some((v) => v.current)) push(current.provider, current.voice, current.model, null);
  return c.json({
    configured,
    voices,
    phrases: BENCHMARK_PHRASES.map((p) => ({ id: p.id, text: p.text, focus: p.focus, required: !!p.required, rates: p.rates ?? ['normal', 'slow'] })),
    risks: pronunciationRisks(await contentPhrases()),
    spend: await ttsSpendSummary(),
  });
});

/**
 * Один зразок голосу (MP3). Текст — лише з набору бенчмарку або з контенту (ключ не синтезує довільний текст),
 * голос — з офіційного списку або поточний. Зразок кешується під своїм голосом: повторне прослуховування безкоштовне.
 * Платні символи йдуть в облік admin (tts_spend), квоти гравців не чіпають.
 */
a.post('/tts/sample', rateLimit(40, 60_000, 'tts-sample'), async (c) => {
  needRole(c, 'SUPERADMIN', 'EDITOR');
  const q = z
    .object({ provider: z.enum(TTS_PROVIDER_IDS), voice: z.string().min(1).max(80), model: z.string().max(60).optional(), text: z.string().min(1).max(300), rate: z.enum(['normal', 'slow']).default('normal') })
    .parse(await body(c));
  if (!configuredProviders().includes(q.provider)) throw badRequest('provider_not_configured');
  const current = ttsProvider();
  const isCurrent = current?.provider === q.provider && current.voice === q.voice && (!q.model || current.model === q.model);
  const listed =
    q.provider === 'google' ? GOOGLE_PL_VOICES.some((v) => v.name === q.voice)
    : q.provider === 'azure' ? AZURE_PL_VOICES.some((v) => v.name === q.voice)
    : /^[A-Za-z0-9]{10,40}$/.test(q.voice) && (!q.model || (ELEVENLABS_PL_MODELS as readonly string[]).includes(q.model));
  if (!listed && !isCurrent) throw badRequest('voice_not_allowed', 'Голосу немає в офіційному польському списку');
  const known = BENCHMARK_PHRASES.some((p) => p.text === q.text) || (await contentPhrases()).includes(q.text);
  if (!known) throw badRequest('text_not_allowed', 'Лише фрази бенчмарку або контенту');
  const provider = buildProvider({ provider: q.provider, voice: q.voice, model: q.model });
  const audio = await synthesize(q.text, q.rate, { payer: 'admin', provider });
  return c.body(new Uint8Array(audio.data), 200, { 'content-type': audio.mime, 'cache-control': 'no-store', 'x-tts-cache': audio.cached ? 'hit' : 'miss' });
});

/** Перенос старих ключів кешу (до моделі й версії в ключі) без синтезу, частинами. */
a.post('/tts/migrate-cache', async (c) => {
  needRole(c, 'SUPERADMIN');
  const { cursor } = z.object({ cursor: z.string().max(80).nullish() }).parse(await body(c));
  return c.json(await migrateLegacyCacheKeys({ cursor, limit: 200 }));
});

// ── Розсилки: надсилаються частинами за розкладом (cron) ──
a.post('/campaigns/:id/send', async (c) => {
  needRole(c, 'SUPERADMIN');
  const id = c.req.param('id');
  const camp = await db.query.notificationCampaigns.findFirst({ where: eq(t.notificationCampaigns.id, id) });
  if (!camp) throw notFound();
  if (camp.status !== 'DRAFT') throw badRequest('already_sent');
  if (!getBindings().TELEGRAM_BOT_TOKEN) throw badRequest('bot_not_configured');
  await db.update(t.notificationCampaigns).set({ status: 'SENDING', cursor: null }).where(eq(t.notificationCampaigns.id, id));
  await audit(c, 'send', 'campaign', id);
  return c.json({ ok: true });
});

adminRoutes.route('/', a);
