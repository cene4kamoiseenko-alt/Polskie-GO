/**
 * Кнопка «Поддержка по оплате» на экране Premium (владелец 2026-11-14: «нажимается, но не реагирует и никуда не перенаправляет»).
 * С Bot API 7.0 Mini App не закрывается после openTelegramLink, а старая кнопка открывала ссылку на чат с тем же ботом без действия:
 * чат оставался под приложением, а поддержка в боте (/paysupport) не запускалась. Теперь кнопка просит сервер открыть обращение и
 * написать подсказку в чат, затем открывает чат и закрывает Mini App; если сервер написать не смог — ссылка со стартом paysupport.
 *
 *   node --import tsx scripts/support-check.ts   → test-results/support/*.png
 *
 *   A. Сервер написал в чат бота: подсказка ушла игроку на его языке, обращение ждёт текст, открыта ссылка на чат и Mini App закрыт.
 *   B. Telegram не принял сообщение (бота не запускали, 403): ссылка со стартовым параметром paysupport и Mini App закрыт.
 *   C. Сервер не достучался до Telegram (сеть): та же ссылка со стартом, Mini App закрыт.
 *   D. Пока идёт запрос, кнопка занята («Открываю чат…») и второй тап не шлёт второй запрос; потом кнопка снова доступна.
 *   E. Вне Telegram (браузер): обычная ссылка на чат бота в новой вкладке.
 *
 * Chromium с подменённым window.Telegram.WebApp и Bot API (в этом же процессе), а не Telegram на iPhone / Android.
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Browser } from 'playwright';
import { signInitData } from '../apps/server/src/lib/telegram';
import { chromiumPath, startStand } from './lib/stand';

const root = process.cwd();
const require = createRequire(root + '/package.json');
const OUT = resolve(root, 'test-results/support');
const failures: string[] = [];
let passed = 0;
const check = (ok: unknown, what: string) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (ok) passed++;
  else failures.push(what);
};

type BotCall = { method: string; body: Record<string, unknown> };
type BotMode = 'ok' | 'forbidden' | 'down' | 'slow';

async function main() {
  // Bot API подменён в этом же процессе: остальной fetch (Vite, API) настоящий.
  const botCalls: BotCall[] = [];
  let botMode: BotMode = 'ok';
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    const href = String(url instanceof Request ? url.url : url);
    if (!href.startsWith('https://api.telegram.org/')) return realFetch(url, init);
    botCalls.push({ method: href.split('/').pop()!, body: JSON.parse(String(init?.body ?? '{}')) });
    if (botMode === 'forbidden') return new Response(JSON.stringify({ ok: false, error_code: 403, description: "Forbidden: bot can't initiate conversation with a user" }), { status: 403 });
    if (botMode === 'down') throw new TypeError('fetch failed');
    if (botMode === 'slow') await new Promise((r) => setTimeout(r, 1500));
    return new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }), { headers: { 'content-type': 'application/json' } });
  }) as typeof fetch;

  const { chromium } = require('playwright') as typeof import('playwright');
  mkdirSync(OUT, { recursive: true });
  const stand = await startStand({ ui: 'dev' });
  const { BOT_TOKEN } = await import(root + '/apps/server/test/helpers.ts');
  const { resetRateLimits } = await import(root + '/apps/server/src/hono.ts');
  const { db } = await import(root + '/apps/server/src/db/index.ts');
  const { supportRequests } = await import(root + '/apps/server/src/db/schema.ts');
  const { eq } = await import('drizzle-orm');
  const browser: Browser = await chromium.launch({ headless: true, executablePath: chromiumPath(chromium), args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const pageErrors: string[] = [];

  const u = await stand.login();
  await u.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A1', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: null });
  await u.call('PATCH', '/api/me/settings', { theme: 'dark', reducedMotion: true });
  const bot = (await u.call('GET', '/api/premium')).body.bot as string;
  check(!!bot, `экран Premium получает имя бота от сервера (${bot})`);

  /** Страница Premium: в Telegram (подмена WebApp со шпионами) или в обычном браузере. */
  async function premiumPage(inTelegram: boolean) {
    resetRateLimits();
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'ru-RU', isMobile: true, hasTouch: true });
    await context.route('https://telegram.org/**', (r) => r.abort());
    const page = await context.newPage();
    page.on('pageerror', (e) => pageErrors.push(e.message));
    const requests: string[] = [];
    page.on('request', (r) => {
      if (r.method() === 'POST' && r.url().endsWith('/api/support/open')) requests.push(r.url());
    });
    if (inTelegram) {
      const initData = signInitData({ auth_date: String(Math.floor(Date.now() / 1000)), query_id: 'AAH', user: JSON.stringify({ id: u.telegramId, first_name: 'Ola', language_code: 'ru' }) }, BOT_TOKEN);
      await page.addInitScript(`(() => {
        const noop = () => {};
        window.__tg = { links: [], closed: 0 };
        window.Telegram = { WebApp: {
          initData: ${JSON.stringify(initData)},
          initDataUnsafe: { user: { id: ${u.telegramId}, first_name: 'Ola', language_code: 'ru' } },
          version: '8.0', platform: 'ios', colorScheme: 'dark', themeParams: {}, isVersionAtLeast: () => true,
          ready: noop, expand: noop, close: () => { window.__tg.closed++; }, onEvent: noop, offEvent: noop, openInvoice: noop,
          openTelegramLink: (url) => { window.__tg.links.push(url); }, openLink: noop, showConfirm: noop,
          disableVerticalSwipes: noop, setHeaderColor: noop, setBackgroundColor: noop, setBottomBarColor: noop,
          BackButton: { show: noop, hide: noop, onClick: noop, offClick: noop },
          HapticFeedback: { impactOccurred: noop, notificationOccurred: noop, selectionChanged: noop },
        } };
      })()`);
      await page.goto(`${stand.base}/premium`, { waitUntil: 'domcontentloaded' });
    } else {
      await page.addInitScript(({ token }) => {
        localStorage.setItem('pg_auth', JSON.stringify({ token, owner: 'dev:998100', exp: Date.now() + 86_400_000 }));
        (window as unknown as { __opened: string[] }).__opened = [];
        window.open = ((url: string) => {
          (window as unknown as { __opened: string[] }).__opened.push(String(url));
          return null;
        }) as typeof window.open;
      }, { token: u.token });
      await page.goto(`${stand.base}/premium?devUser=998100`, { waitUntil: 'domcontentloaded' });
    }
    const button = page.locator('[data-premium-support]');
    await button.waitFor({ timeout: 30_000 });
    await button.scrollIntoViewIfNeeded();
    return { context, page, button, requests };
  }
  const tgState = (page: import('playwright').Page) => page.evaluate(() => (window as unknown as { __tg: { links: string[]; closed: number } }).__tg);

  // A. Сервер написал в чат бота.
  {
    botMode = 'ok';
    botCalls.length = 0;
    await db.delete(supportRequests).where(eq(supportRequests.telegramId, u.telegramId));
    const { context, page, button } = await premiumPage(true);
    check((await button.innerText()).includes('Поддержка по оплате'), 'A. кнопка «Поддержка по оплате» видна на экране Premium');
    await page.screenshot({ path: `${OUT}/support-card-390.png` });
    await button.click();
    await page.waitForFunction(() => (window as unknown as { __tg: { closed: number } }).__tg.closed >= 1, undefined, { timeout: 15_000 });
    const st = await tgState(page);
    check(st.links.length === 1 && st.links[0] === `https://t.me/${bot}`, `A. открыт чат бота без лишних параметров (${st.links.join(', ')})`);
    check(st.closed === 1, 'A. Mini App закрыт после открытия чата (с Bot API 7.0 сам он не закрывается)');
    const msg = botCalls.find((c) => c.method === 'sendMessage');
    check(msg && msg.body.chat_id === u.telegramId && String(msg.body.text).includes('Поддержка по оплате'), 'A. в чат игрока ушла подсказка поддержки на его языке');
    const [req] = await db.select().from(supportRequests).where(eq(supportRequests.telegramId, u.telegramId));
    check(req?.status === 'AWAITING' && req.userId === u.user.id, 'A. обращение открыто и ждёт текст, привязано к игроку');
    await context.close();
  }

  // B. Telegram не принял сообщение: ссылка со стартом.
  {
    botMode = 'forbidden';
    const { context, page, button } = await premiumPage(true);
    await button.click();
    await page.waitForFunction(() => (window as unknown as { __tg: { closed: number } }).__tg.closed >= 1, undefined, { timeout: 15_000 });
    const st = await tgState(page);
    check(st.links.length === 1 && st.links[0] === `https://t.me/${bot}?start=paysupport`, `B. 403 от Telegram: ссылка со стартовым параметром (${st.links.join(', ')})`);
    check(st.closed === 1, 'B. Mini App закрыт');
    await context.close();
  }

  // C. Сервер не достучался до Telegram.
  {
    botMode = 'down';
    const { context, page, button } = await premiumPage(true);
    await button.click();
    await page.waitForFunction(() => (window as unknown as { __tg: { closed: number } }).__tg.closed >= 1, undefined, { timeout: 15_000 });
    const st = await tgState(page);
    check(st.links.length === 1 && st.links[0] === `https://t.me/${bot}?start=paysupport`, `C. сбой сети к Telegram: та же ссылка со стартом (${st.links.join(', ')})`);
    check(st.closed === 1, 'C. Mini App закрыт');
    await context.close();
  }

  // D. Кнопка занята, пока идёт запрос.
  {
    botMode = 'slow';
    const { context, page, button, requests } = await premiumPage(true);
    await button.click();
    await page.waitForFunction(() => document.querySelector('[data-premium-support]')?.hasAttribute('disabled'), undefined, { timeout: 5_000 });
    check((await button.innerText()).includes('Открываю чат'), 'D. пока идёт запрос, на кнопке «Открываю чат…» — тап не «молчит»');
    await page.screenshot({ path: `${OUT}/support-busy-390.png` });
    await button.click({ force: true, timeout: 2_000 }).catch(() => {});
    await page.waitForFunction(() => (window as unknown as { __tg: { closed: number } }).__tg.closed >= 1, undefined, { timeout: 15_000 });
    await page.waitForFunction(() => !document.querySelector('[data-premium-support]')?.hasAttribute('disabled'), undefined, { timeout: 5_000 });
    const st = await tgState(page);
    check(requests.length === 1 && st.links.length === 1 && st.closed === 1, `D. второй тап не отправил второй запрос (запросов ${requests.length}, ссылок ${st.links.length})`);
    check((await button.innerText()).includes('Поддержка по оплате'), 'D. после ответа кнопка снова доступна');
    await context.close();
  }

  // E. Вне Telegram.
  {
    botMode = 'ok';
    const { context, page, button } = await premiumPage(false);
    await button.click();
    await page.waitForFunction(() => (window as unknown as { __opened: string[] }).__opened.length >= 1, undefined, { timeout: 15_000 });
    const opened = await page.evaluate(() => (window as unknown as { __opened: string[] }).__opened);
    check(opened.length === 1 && opened[0] === `https://t.me/${bot}`, `E. вне Telegram открывается ссылка на чат бота в новой вкладке (${opened.join(', ')})`);
    await context.close();
  }

  check(pageErrors.length === 0, `ошибок страницы нет${pageErrors.length ? ': ' + pageErrors.slice(0, 2).join(' | ') : ''}`);
  await browser.close();
  await stand.stop();
  globalThis.fetch = realFetch;
  console.log(failures.length ? `\nОШИБОК: ${failures.length} из ${passed + failures.length}\n- ${failures.join('\n- ')}` : `\nвсе ${passed} проверок пройдены`);
  process.exit(failures.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
