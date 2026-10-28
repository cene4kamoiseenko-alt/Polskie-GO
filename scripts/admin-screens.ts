/**
 * Админка в браузере: вход, «Аудитория бота» (счётчики, фильтры, поиск, «показать ещё»), обзор и пользователи — на русском,
 * на телефоне (390×844, меню за кнопкой, без горизонтальной прокрутки) и на компьютере (1280×800).
 * Данные — настоящий webhook бота (Bot API подменён) и настоящий вход в Mini App.
 * Запуск: node --import tsx scripts/admin-screens.ts   → test-results/admin-screens/<экран>-<ширина>.png
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromiumPath, startStand } from './lib/stand';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright') as typeof import('playwright');
const root = process.cwd();
const OUT = resolve(root, 'test-results/admin-screens');
mkdirSync(OUT, { recursive: true });

const failures: string[] = [];
let passed = 0;
const check = (ok: boolean, what: string) => {
  if (ok) passed++;
  else failures.push(what);
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
};

async function main() {
  // Bot API подменён: ответы бота уходят в никуда, остальной fetch (Vite, API) — настоящий.
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) =>
    String(url).includes('api.telegram.org')
      ? new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }), { headers: { 'content-type': 'application/json' } })
      : realFetch(url, init)) as typeof fetch;

  const stand = await startStand({ ui: 'dev', app: 'admin' });
  const { base, env, login } = stand;
  const { request } = await import(root + '/apps/server/test/helpers.ts');
  let upd = 1;
  const say = (from: Record<string, unknown>, text: string) =>
    request('POST', '/telegram/webhook', { update_id: ++upd, message: { message_id: upd, chat: { id: from.id, type: 'private' }, from, text } }, { 'x-telegram-bot-api-secret-token': env.TELEGRAM_WEBHOOK_SECRET });

  // 55 человек только в боте (чтобы была кнопка «Показать ещё»), один заблокировал бота, один по приглашению, двое в приложении.
  for (let i = 0; i < 55; i++) await say({ id: 8_100_000 + i, first_name: `Гость ${i + 1}`, language_code: i % 2 ? 'uk' : 'ru' }, i % 3 ? '/start' : '/start screen_map');
  await say({ id: 8_200_001, first_name: 'Ирина', username: 'irina_pl', language_code: 'ru' }, '/start');
  await request('POST', '/telegram/webhook', { update_id: ++upd, my_chat_member: { chat: { id: 8_200_001, type: 'private' }, from: { id: 8_200_001, first_name: 'Ирина' }, date: 1, new_chat_member: { status: 'kicked' } } }, { 'x-telegram-bot-api-secret-token': env.TELEGRAM_WEBHOOK_SECRET });
  await say({ id: 8_200_002, first_name: 'Тарас', username: 'taras_go', language_code: 'uk' }, '/start ref_FRIEND1');
  const app1 = await login();
  const app2 = await login();
  await say({ id: app2.telegramId, first_name: `User${app2.telegramId}`, language_code: 'uk' }, '/lesson');

  const browser = await chromium.launch({ executablePath: chromiumPath(chromium) });
  try {
    for (const [width, height] of [[390, 844], [1280, 800]] as const) {
      const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: width < 600 ? 2 : 1, locale: 'ru-RU' });
      const p = await context.newPage();
      const errors: string[] = [];
      p.on('pageerror', (e) => errors.push(e.message));
      const noHScroll = async (what: string) => {
        const over = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        check(over <= 1, `${width}px ${what}: нет горизонтальной прокрутки страницы (${over}px)`);
      };

      await p.goto(`${base}/admin/`);
      check((await p.locator('button', { hasText: 'Войти' }).count()) === 1, `${width}px вход: кнопка «Войти»`);
      await p.fill('input[type=email]', env.ADMIN_EMAIL!);
      await p.fill('input[type=password]', 'wrong-password');
      await p.click('button:has-text("Войти")');
      await p.locator('text=Неверный email или пароль').waitFor({ timeout: 10_000 });
      check(true, `${width}px вход: неверный пароль — понятное сообщение по-русски`);
      await p.fill('input[type=password]', env.ADMIN_PASSWORD!);
      await p.click('button:has-text("Войти")');
      await p.locator('h1', { hasText: 'Обзор' }).waitFor({ timeout: 15_000 });
      check(true, `${width}px обзор открылся по-русски`);
      await p.locator('[data-audience-card]').waitFor({ timeout: 10_000 });
      check((await p.locator('[data-audience-card]').innerText()).includes('Всего 59'), `${width}px на «Обзоре» — сводка аудитории бота`);
      await p.screenshot({ path: `${OUT}/dashboard-${width}.png`, fullPage: false });

      if (width < 600) {
        check(!(await p.locator('nav a', { hasText: 'Аудитория бота' }).isVisible()), `${width}px меню скрыто до нажатия`);
        await p.click('button:has-text("Меню")');
        check(await p.locator('nav a', { hasText: 'Аудитория бота' }).isVisible(), `${width}px «☰ Меню» показывает разделы`);
        await p.screenshot({ path: `${OUT}/menu-${width}.png` });
      }
      await p.click('nav a:has-text("Аудитория бота")');
      await p.locator('h1', { hasText: 'Аудитория бота' }).waitFor({ timeout: 10_000 });
      await p.locator('[data-audience-row]').first().waitFor({ timeout: 10_000 });
      if (width < 600) check(!(await p.locator('nav a', { hasText: 'Обзор' }).isVisible()), `${width}px меню закрывается после перехода`);
      const summary = await p.locator('[data-audience-summary]').innerText();
      check(/Всего людей\s*59/i.test(summary), `${width}px счётчик «Всего людей» = 59 (55 + Ирина + Тарас + 2 из приложения) (${summary.replace(/\s+/g, ' ').slice(0, 80)})`);
      check(/Открыли приложение\s*2\b/i.test(summary), `${width}px «Открыли приложение» = 2`);
      check(/Только бот\s*57/i.test(summary) && /заблокировали бота: 1/i.test(summary), `${width}px «Только бот» = 57, заблокировали бота: 1`);
      check((await p.locator('[data-audience-row]').count()) === 50, `${width}px первая страница — 50 строк`);
      await p.screenshot({ path: `${OUT}/audience-${width}.png`, fullPage: false });
      await noHScroll('аудитория');

      await p.click('button:has-text("Показать ещё")');
      await p.waitForFunction(() => document.querySelectorAll('[data-audience-row]').length === 59, null, { timeout: 10_000 });
      check(true, `${width}px «Показать ещё» догружает остальные 9`);

      await p.click('button:has-text("Заблокировали бота")');
      await p.waitForFunction(() => document.querySelectorAll('[data-audience-row]').length === 1, null, { timeout: 10_000 });
      check((await p.locator('[data-audience-row="8200001"]').innerText()).includes('заблокировал бота'), `${width}px фильтр «Заблокировали бота»: Ирина`);

      await p.click('button:has-text("Открыли приложение")');
      await p.waitForFunction(() => document.querySelectorAll('[data-audience-row]').length === 2, null, { timeout: 10_000 });
      const appRow = await p.locator(`[data-audience-row="${app2.telegramId}"]`).innerText();
      check(appRow.includes('✓ открыл') && appRow.includes('✓ в боте'), `${width}px фильтр «Открыли приложение»: открыл и пишет боту`);
      check((await p.locator(`[data-audience-row="${app1.telegramId}"]`).count()) === 1, `${width}px пользователь приложения без бота в списке`);

      await p.click('button:has-text("Все")');
      await p.fill('input[placeholder^="Имя, @username"]', '@taras');
      await p.click('form button:has-text("Найти")');
      await p.waitForFunction(() => document.querySelectorAll('[data-audience-row]').length === 1, null, { timeout: 10_000 });
      const taras = await p.locator('[data-audience-row="8200002"]').innerText();
      check(taras.includes('по приглашению') && taras.includes('не открывал'), `${width}px поиск @taras: пришёл по приглашению, приложение не открывал`);
      await p.screenshot({ path: `${OUT}/audience-search-${width}.png` });

      if (width < 600) await p.click('button:has-text("Меню")');
      await p.click('nav a:has-text("Пользователи")');
      await p.locator('h1', { hasText: 'Пользователи приложения' }).waitFor({ timeout: 10_000 });
      check(true, `${width}px «Пользователи приложения» открываются`);
      await noHScroll('пользователи');
      check(errors.length === 0, `${width}px без ошибок JavaScript ${errors.join('; ')}`);
      await context.close();
    }
  } finally {
    await browser.close();
    await stand.stop();
    globalThis.fetch = realFetch;
  }
  console.log(failures.length ? `\nОШИБОК: ${failures.length} из ${passed + failures.length}\n- ${failures.join('\n- ')}` : `\nвсе ${passed} проверок пройдены`);
  process.exit(failures.length ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
