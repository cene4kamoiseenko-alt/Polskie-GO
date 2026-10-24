/** HTTP-застосунок (Hono): API, webhook бота, завантажені файли. */
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { ZodError } from 'zod';
import { bindDb, mapDbError } from './db';
import { config, setEnv } from './env';
import { requireUser } from './auth';
import { rateLimit, type AppEnv } from './hono';
import { HttpError } from './lib/errors';
import { authRoutes, meRoutes } from './routes/public';
import { learnRoutes } from './routes/learn';
import { gameRoutes } from './routes/game';
import { telegramRoutes } from './routes/telegram';
import { adminRoutes } from './routes/admin';

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

  app.get('/api/health', (c) => c.json({ ok: true }));

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

  // Завантажені адміністратором ассети (Cloudflare KV).
  app.get('/uploads/:name', async (c) => {
    const kv = c.env.UPLOADS;
    if (!kv) return c.notFound();
    const { value, metadata } = await kv.getWithMetadata<{ type?: string }>(c.req.param('name'), 'arrayBuffer');
    if (!value) return c.notFound();
    return c.body(value, 200, { 'content-type': metadata?.type ?? 'application/octet-stream', 'cache-control': 'public, max-age=31536000, immutable' });
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
