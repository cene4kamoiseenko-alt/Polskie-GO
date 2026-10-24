import { existsSync } from 'node:fs';
import Fastify, { type FastifyError } from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { ZodError } from 'zod';
import { config } from './config';
import { HttpError } from './lib/errors';
import { publicRoutes } from './routes/public';
import { learnRoutes } from './routes/learn';
import { gameRoutes } from './routes/game';
import { telegramRoutes } from './routes/telegram';
import { adminRoutes } from './routes/admin';

export async function buildApp() {
  const app = Fastify({
    logger: config.isTest ? false : { level: config.isProd ? 'info' : 'debug', redact: ['req.headers.authorization', 'req.headers["x-telegram-bot-api-secret-token"]'] },
    trustProxy: true,
    bodyLimit: 1_000_000,
  });

  // BigInt (telegram_id) у JSON → рядок.
  app.setReplySerializer((payload) => JSON.stringify(payload, (_k, v) => (typeof v === 'bigint' ? v.toString() : v)));

  await app.register(cors, { origin: config.isProd ? config.corsOrigins : true, credentials: false });
  await app.register(rateLimit, {
    global: true,
    max: 240,
    timeWindow: '1 minute',
    keyGenerator: (req) => (req.headers.authorization ?? req.ip).slice(-48),
  });
  await app.register(multipart, { limits: { fileSize: 8 * 1024 * 1024, files: 1 } });

  app.setErrorHandler((err: FastifyError | HttpError | ZodError, req, reply) => {
    if (err instanceof HttpError) return reply.status(err.status).send({ error: err.code, message: err.message });
    if (err instanceof ZodError) return reply.status(400).send({ error: 'validation_error', issues: err.issues.slice(0, 5) });
    const status = (err as FastifyError).statusCode ?? 500;
    if (status >= 500) req.log.error(err);
    return reply.status(status).send({ error: status === 429 ? 'rate_limited' : status >= 500 ? 'internal_error' : 'bad_request', message: status >= 500 ? 'Internal error' : err.message });
  });

  app.get('/api/health', async () => ({ ok: true }));
  await app.register(publicRoutes, { prefix: '/api' });
  await app.register(learnRoutes, { prefix: '/api' });
  await app.register(gameRoutes, { prefix: '/api' });
  await app.register(telegramRoutes, { prefix: '/telegram' });
  await app.register(adminRoutes, { prefix: '/api/admin' });

  // Завантажені адміністратором ассети (зображення, аудіо).
  await app.register(fastifyStatic, { root: config.uploadsDir, prefix: '/uploads/', decorateReply: false });

  // У production той самий сервер віддає зібрані Mini App та адмінку.
  if (existsSync(config.adminDist)) {
    await app.register(fastifyStatic, { root: config.adminDist, prefix: '/admin/', decorateReply: false });
  }
  if (existsSync(config.webDist)) {
    await app.register(fastifyStatic, { root: config.webDist, prefix: '/', wildcard: false });
    app.setNotFoundHandler((req, reply) => {
      if (req.url.startsWith('/api') || req.url.startsWith('/telegram')) return reply.status(404).send({ error: 'not_found' });
      if (req.url.startsWith('/admin')) return reply.sendFile('index.html', config.adminDist);
      return reply.sendFile('index.html');
    });
  }
  return app;
}
