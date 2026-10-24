/**
 * Точка входу Cloudflare Worker.
 * Статичні файли Mini App віддає Workers Static Assets; сюди потрапляють /api, /telegram, /uploads і /admin.
 */
import { buildApp } from './app';
import { bindDb } from './db';
import { setEnv, type Bindings } from './env';
import { runScheduled } from './jobs';

const app = buildApp();

export default {
  fetch: app.fetch,
  async scheduled(controller: ScheduledController, env: Bindings, ctx: ExecutionContext) {
    setEnv(env);
    bindDb(env.DB);
    ctx.waitUntil(runScheduled(new Date(controller.scheduledTime)));
  },
} satisfies ExportedHandler<Bindings>;
