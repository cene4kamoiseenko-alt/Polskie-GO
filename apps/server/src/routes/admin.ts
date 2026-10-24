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
import { requireAdmin } from '../auth';
import { body, query, rateLimit, type AppEnv } from '../hono';
import { HttpError, badRequest, notFound } from '../lib/errors';
import { hashPassword, verifyPassword } from '../lib/password';
import { signToken } from '../lib/token';
import { invalidateRewards } from '../services/gameConfig';

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
