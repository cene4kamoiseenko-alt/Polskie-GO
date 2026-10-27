/** HTTP-застосунок (Hono): API, webhook бота, завантажені файли. */
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { ZodError } from 'zod';
import { eq, sql } from 'drizzle-orm';
import { bindDb, db, mapDbError } from './db';
import { uploads } from './db/schema';
import { config, setEnv } from './env';
import { requireUser } from './auth';
import { rateLimit, type AppEnv } from './hono';
import { HttpError } from './lib/errors';
import { authRoutes, meRoutes } from './routes/public';
import { learnRoutes } from './routes/learn';
import { gameRoutes } from './routes/game';
import { telegramRoutes } from './routes/telegram';
import { adminRoutes } from './routes/admin';
import { readBotConfig } from './bot/maintain';

export function buildApp() {
  const app = new Hono<AppEnv>();

  app.use(async (c, next) => {
    setEnv(c.env);
    bindDb(c.env.DB);
    await next();
  });

  app.use('/api/*', cors({ origin: (origin) => (!config.isProd || config.corsOrigins.includes(origin) ? origin : null), credentials: false }));

  app.onError((err, c) => {
    const e = mapDbError(err);
    if (e instanceof HttpError) return c.json({ error: e.code, message: e.message }, e.status as never);
    if (e instanceof ZodError) return c.json({ error: 'validation_error', issues: e.issues.slice(0, 5) }, 400);
    console.error(err);
    return c.json({ error: 'internal_error', message: 'Internal error' }, 500);
  });

  // Проверка выкладки с телефона: какая сборка работает, применены ли миграции, в каком состоянии бот. Без секретов.
  app.get('/api/health', async (c) => {
    const version = await c.env.ASSETS?.fetch(new URL('/version.json', c.req.url))
      .then((r) => (r.ok ? (r.json() as Promise<Record<string, string>>) : null))
      .catch(() => null);
    const migration = await db
      .all<{ name: string }>(sql`SELECT name FROM d1_migrations ORDER BY id DESC LIMIT 1`)
      .then((r) => r[0]?.name ?? null)
      .catch(() => null);
    const bot = await readBotConfig();
    return c.json(
      {
        ok: true,
        version: version ? { commit: version.commit, builtAt: version.builtAt } : null,
        migration,
        bot: bot ? { webhook: bot.webhook, callbackQuery: bot.callbackQuery, serverSecret: bot.secretGeneration > 0, confirmed: bot.secretConfirmed, checkedAt: new Date(bot.checkedAt).toISOString() } : null,
      },
      200,
      { 'cache-control': 'no-store' },
    );
  });

  // Порядок важливий: адмінка й webhook мають власну авторизацію, далі — вхід, потім маршрути користувача.
  app.route('/api/admin', adminRoutes);
  app.route('/telegram', telegramRoutes);
  app.use('/api/*', rateLimit(240, 60_000));
  app.route('/api', authRoutes);
  app.use('/api/*', requireUser);
  app.route('/api', meRoutes);
  app.route('/api', learnRoutes);
  app.route('/api', gameRoutes);
  app.all('/api/*', (c) => c.json({ error: 'not_found' }, 404));

  // Завантажені адміністратором ассети (зберігаються в D1).
  app.get('/uploads/:name', async (c) => {
    const row = await db.query.uploads.findFirst({ where: eq(uploads.name, c.req.param('name')) });
    if (!row) return c.notFound();
    return c.body(new Uint8Array(row.data), 200, { 'content-type': row.type, 'cache-control': 'public, max-age=31536000, immutable' });
  });

  // Адмінка — окремий SPA під /admin/ у тих самих статичних файлах.
  app.get('/admin/*', async (c) => {
    if (!c.env.ASSETS) return c.notFound();
    const res = await c.env.ASSETS.fetch(c.req.raw);
    if (res.status !== 404) return res;
    return c.env.ASSETS.fetch(new Request(new URL('/admin/index.html', c.req.url)));
  });

  return app;
}
