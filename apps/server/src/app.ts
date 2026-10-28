/** HTTP-застосунок (Hono): API, webhook бота, завантажені файли. */
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { ZodError } from 'zod';
import { eq } from 'drizzle-orm';
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
import { libraryEnabled, libraryVoice } from './services/audio-library';

export function buildApp() {
  const app = new Hono<AppEnv>();

  app.use(async (c, next) => {
    setEnv(c.env);
    bindDb(c.env.DB);
    await next();
  });

  app.use('/api/*', cors({ origin: (origin) => (!config.isProdLike || config.corsOrigins.includes(origin) ? origin : null), credentials: false }));

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
    // Один запит до D1 заодно показує, де працює Worker і де база (для перевірки Smart Placement) і скільки триває обмін.
    const t0 = Date.now();
    const last = await c.env.DB.prepare('SELECT name FROM d1_migrations ORDER BY id DESC LIMIT 1')
      .all<{ name: string }>()
      .catch(() => null);
    const d1Ms = Date.now() - t0;
    const meta = (last?.meta ?? {}) as { served_by_region?: string; served_by_primary?: boolean };
    const migration = last?.results[0]?.name ?? null;
    const bot = await readBotConfig();
    // Аудіобібліотека: скільки файлів голосу бібліотеки готово — щоб перевірити хід озвучки без входу в адмінку. Без id голосу.
    const voice = libraryVoice();
    const audioRows = voice
      ? await c.env.DB.prepare('SELECT status, count(*) AS n FROM audio_assets WHERE voice_id = ? GROUP BY status').bind(voice).all<{ status: string; n: number }>().catch(() => null)
      : null;
    const audioBy = Object.fromEntries((audioRows?.results ?? []).map((r) => [r.status, r.n]));
    return c.json(
      {
        ok: true,
        environment: config.environment,
        version: version ? { commit: version.commit, builtAt: version.builtAt } : null,
        migration,
        edge: { colo: (c.req.raw.cf as { colo?: string } | undefined)?.colo ?? null, d1: { ms: d1Ms, region: meta.served_by_region ?? null, primary: meta.served_by_primary ?? null } },
        audio: { r2: !!c.env.AUDIO, voice: !!voice, players: libraryEnabled() ? 'library' : 'on-demand', ready: audioBy.ready ?? 0, failed: audioBy.failed ?? 0, inProgress: (audioBy.generating ?? 0) + (audioBy.pending ?? 0) },
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

  // Адмінка — окремий SPA під /admin/ у тих самих статичних файлах. Файли збірки (/admin/assets/…, audio-manifest.json)
  // віддаються як є; будь-який маршрут адмінки (/admin/users, /admin/audio) — її index.html. Не чекаємо 404: статичні файли
  // працюють у режимі SPA застосунку й на невідомий шлях віддають 200 з index.html Mini App.
  app.get('/admin/*', async (c) => {
    if (!c.env.ASSETS) return c.notFound();
    if (/\.[a-z0-9]+$/i.test(new URL(c.req.url).pathname)) return c.env.ASSETS.fetch(c.req.raw);
    return c.env.ASSETS.fetch(new Request(new URL('/admin/', c.req.url)));
  });

  return app;
}
