/** HTTP-застосунок (Hono): API, webhook бота, завантажені файли. */
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { ZodError } from 'zod';
import { eq } from 'drizzle-orm';
import { bindDb, db, mapDbError } from './db';
import { uploads } from './db/schema';
import { config, setEnv } from './env';
import { requireUser } from './auth';
import { body, edgeRateLimit, rateLimit, type AppEnv } from './hono';
import { recordError } from './services/error-log';
import { z } from 'zod';
import { HttpError } from './lib/errors';
import { authRoutes, meRoutes } from './routes/public';
import { learnRoutes } from './routes/learn';
import { gameRoutes } from './routes/game';
import { telegramRoutes } from './routes/telegram';
import { adminRoutes } from './routes/admin';
import { readBotConfig } from './bot/maintain';
import { libraryEnabled, libraryVoice, serveLibraryFile } from './services/audio-library';
import { audioGenerationMode } from './services/audio-policy';
import { siteRoutes } from './site';

export function buildApp() {
  const app = new Hono<AppEnv>();

  app.use(async (c, next) => {
    setEnv(c.env);
    bindDb(c.env.DB);
    await next();
  });

  app.use('/api/*', cors({ origin: (origin) => (!config.isProdLike || config.corsOrigins.includes(origin) ? origin : null), credentials: false }));

  // Заголовки безопасности для всего, что отдаёт Worker: браузер не угадывает тип содержимого и не сообщает адрес страницы.
  // Статические файлы Mini App получают те же заголовки из apps/web/public/_headers.
  app.use('*', async (c, next) => {
    await next();
    const set = (res: Response) => {
      res.headers.set('x-content-type-options', 'nosniff');
      res.headers.set('referrer-policy', 'strict-origin-when-cross-origin');
    };
    try {
      set(c.res);
    } catch {
      // Ответ из fetch() неизменяем: копируем и ставим заголовки на копию.
      c.res = new Response(c.res.body, c.res);
      set(c.res);
    }
  });

  app.onError((err, c) => {
    const e = mapDbError(err);
    if (e instanceof HttpError) return c.json({ error: e.code, message: e.message }, e.status as never);
    if (e instanceof ZodError) return c.json({ error: 'validation_error', issues: e.issues.slice(0, 5) }, 400);
    console.error(err);
    // Журнал ошибок (services/error-log.ts): фоном, ответ не ждёт. В тестах ExecutionContext нет — запись просто идёт без waitUntil.
    const er = err instanceof Error ? err : new Error(String(err));
    const write = recordError({ kind: 'server', message: `${er.name}: ${er.message}`, detail: er.stack ?? null, path: c.req.path });
    try {
      c.executionCtx.waitUntil(write);
    } catch {
      /* без ExecutionContext */
    }
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
    // Вход вне Telegram (STANDALONE_AUTH): включён ли и есть ли таблицы миграции 0016 — без них «Получить код» в настройках падает с ошибкой 500.
    const standaloneTables = await c.env.DB.prepare('SELECT (SELECT count(*) FROM link_codes) + (SELECT count(*) FROM device_credentials) AS n').first().then(() => true).catch(() => false);
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
        standalone: { enabled: config.standaloneAuth, tables: standaloneTables },
        edge: { colo: (c.req.raw.cf as { colo?: string } | undefined)?.colo ?? null, d1: { ms: d1Ms, region: meta.served_by_region ?? null, primary: meta.served_by_primary ?? null } },
        audio: {
          r2: !!c.env.AUDIO,
          voiceId: voice,
          // Гравці: лише готові MP3 (library) або озвучки ще немає взагалі (none) — синтезу на запит не буває.
          players: libraryEnabled() ? 'library' : 'none',
          generation: audioGenerationMode(),
          ready: audioBy.ready ?? 0,
          failed: audioBy.failed ?? 0,
          inProgress: (audioBy.generating ?? 0) + (audioBy.pending ?? 0),
        },
        bot: bot ? { webhook: bot.webhook, callbackQuery: bot.callbackQuery, serverSecret: bot.secretGeneration > 0, confirmed: bot.secretConfirmed, checkedAt: new Date(bot.checkedAt).toISOString() } : null,
      },
      200,
      { 'cache-control': 'no-store' },
    );
  });

  // Готовий MP3 аудіобібліотеки з R2 (services/audio-library.ts → serveLibraryFile): без входу, щоб працювали кеш
  // браузера й Range-запити <audio>. Лише вже озвучене; ElevenLabs звідси не викликається ніколи.
  app.get('/api/audio/:fp/:file', rateLimit(600, 60_000, 'audio'), (c) => serveLibraryFile(c.req.raw, c.req.param('fp'), c.req.param('file')));

  // Ошибки Mini App у игроков и отчёты CSP (Report-Only, apps/web/public/_headers): без входа — ошибка бывает и до входа.
  // Два ограничителя (Cloudflare по IP и счётчик в памяти), тело ≤ 1 МБ (body), поля обрезаются; ответ 204 без тела.
  const clientError = z.object({
    message: z.string().min(1).max(1000),
    detail: z.string().max(4000).optional(),
    path: z.string().max(300).optional(),
    release: z.string().max(60).optional(),
  });
  app.post('/api/client-errors', edgeRateLimit('RL_REPORT'), rateLimit(30, 60_000, 'report'), async (c) => {
    const b = clientError.parse(await body(c));
    await recordError({ kind: 'client', message: b.message, detail: b.detail ?? null, path: b.path ?? null, release: b.release ?? null });
    return c.body(null, 204);
  });
  app.post('/api/csp-report', edgeRateLimit('RL_REPORT'), rateLimit(30, 60_000, 'report'), async (c) => {
    // Старый формат report-uri: { "csp-report": {...} }; Reporting API: [{ type: "csp-violation", body: {...} }].
    const raw = (await body(c)) as Record<string, unknown> | Record<string, unknown>[];
    const reports = (Array.isArray(raw) ? raw.map((r) => (r as { body?: unknown }).body) : [(raw as Record<string, unknown>)['csp-report']]).slice(0, 5);
    for (const r of reports) {
      if (!r || typeof r !== 'object') continue;
      const v = r as Record<string, unknown>;
      const directive = String(v['effective-directive'] ?? v['violated-directive'] ?? v.effectiveDirective ?? 'unknown').slice(0, 80);
      const blocked = String(v['blocked-uri'] ?? v.blockedURL ?? '').slice(0, 300);
      let host = blocked;
      try {
        host = blocked.startsWith('http') ? new URL(blocked).origin : blocked;
      } catch {
        /* inline, eval, data: */
      }
      const page = String(v['document-uri'] ?? v.documentURL ?? '');
      let path = '';
      try {
        path = page ? new URL(page).pathname : '';
      } catch {
        /* нет адреса */
      }
      await recordError({ kind: 'csp', message: `${directive} ${host}`.trim(), detail: String(v['source-file'] ?? v.sourceFile ?? '').slice(0, 300) || null, path });
    }
    return c.body(null, 204);
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

  // Страницы для Google Play (/privacy, /terms, /delete-account) и Digital Asset Links приложения Android (/.well-known/assetlinks.json).
  app.route('/', siteRoutes);

  // Завантажені адміністратором ассети (зберігаються в D1).
  app.get('/uploads/:name', async (c) => {
    const row = await db.query.uploads.findFirst({ where: eq(uploads.name, c.req.param('name')) });
    if (!row) return c.notFound();
    // Файл лежит на одном адресе с приложением, где хранится токен входа: sandbox и default-src 'none' не дают загруженному
    // содержимому (даже поддельному) выполнить скрипт на этом адресе.
    return c.body(new Uint8Array(row.data), 200, {
      'content-type': row.type,
      'cache-control': 'public, max-age=31536000, immutable',
      'content-security-policy': "default-src 'none'; sandbox",
      'x-content-type-options': 'nosniff',
    });
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
