/**
 * Точка входу Cloudflare Worker.
 * Статичні файли Mini App віддає Workers Static Assets; сюди потрапляють /api, /telegram, /uploads і /admin.
 * Cron кожні 15 хвилин — нагадування, розсилки, самоперевірка бота, прибирання (jobs.ts);
 * cron щохвилини (DAILY_CRON) — вопрос дня частинами (bot/daily/send.ts), окремий виклик зі своїм лімітом підзапитів.
 */
import { buildApp } from './app';
import { bindDb } from './db';
import { setEnv, type Bindings } from './env';
import { runScheduled } from './jobs';
import { DAILY_CRON, runDailyQuizTick } from './bot/daily/send';

const app = buildApp();

export default {
  fetch: app.fetch,
  async scheduled(controller: ScheduledController, env: Bindings, ctx: ExecutionContext) {
    setEnv(env);
    bindDb(env.DB);
    const at = new Date(controller.scheduledTime);
    ctx.waitUntil(controller.cron === DAILY_CRON ? runDailyQuizTick(at).then(() => undefined) : runScheduled(at));
  },
} satisfies ExportedHandler<Bindings>;
