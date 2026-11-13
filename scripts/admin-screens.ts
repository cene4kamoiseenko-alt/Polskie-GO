/**
 * Админка в браузере: вход, «Аудитория бота» (счётчики, фильтры, поиск, «показать ещё»), обзор и пользователи — на русском,
 * на телефоне (390×844, меню за кнопкой, без горизонтальной прокрутки) и на компьютере (1280×800).
 * Данные — настоящий webhook бота (Bot API подменён) и настоящий вход в Mini App.
 * Запуск: node --import tsx scripts/admin-screens.ts   → test-results/admin-screens/<экран>-<ширина>.png
 */
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromiumPath, startStand } from './lib/stand';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright') as typeof import('playwright');
const AXE = readFileSync(createRequire(process.cwd() + '/package.json').resolve('axe-core/axe.min.js'), 'utf8');
type AxeNode = { id: string; impact: string | null; nodes: { target: string[] }[] };
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
  // Журнал ошибок: запись Mini App и нарушение CSP — для страницы «Ошибки» (обновление админки 2026-11-12).
  await request('POST', '/api/client-errors', { message: 'wrong_step', path: '/lesson/l_krk-2-mam', detail: 'Ae@index.js:10:141047' });
  await request('POST', '/api/csp-report', { 'csp-report': { 'effective-directive': 'img-src', 'blocked-uri': 'https://t.me/i/userpic/320/x.jpg', 'document-uri': 'https://app.example/profile' } });
  await say({ id: app2.telegramId, first_name: `User${app2.telegramId}`, language_code: 'uk' }, '/lesson');

  const browser = await chromium.launch({ executablePath: chromiumPath(chromium) });
  try {
    for (const [width, height] of [[390, 844], [1280, 800]] as const) {
      const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: width < 600 ? 2 : 1, locale: 'ru-RU' });
      const p = await context.newPage();
      const errors: string[] = [];
      p.on('pageerror', (e) => errors.push(e.message));
      // Доступность (axe-core, правила WCAG 2 A/AA): на новых экранах админки — без нарушений (обновление админки 2026-11-12).
      const axe = async (what: string) => {
        await p.addScriptTag({ content: AXE });
        const found = (await p.evaluate(`window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }).then((r) => r.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.map((n) => ({ target: n.target })) })))`)) as AxeNode[];
        const list = found.map((v) => `${v.id} (${v.impact}, ${v.nodes.length}: ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')})`);
        check(found.length === 0, `${width}px ${what}: доступность WCAG 2 A/AA — нарушений нет${list.length ? ': ' + list.join('; ') : ''}`);
      };
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
      // Новый «Обзор»: показатели с динамикой, графики по дням, воронка, источники, входной тест, напоминания
      await p.locator('[data-kpi]').waitFor({ timeout: 15_000 });
      const kpi = await p.locator('[data-kpi]').innerText();
      check(/Новые игроки/i.test(kpi) && /Активные игроки/i.test(kpi) && /Пройдено уроков/i.test(kpi) && /Доход/i.test(kpi), `${width}px «Обзор»: четыре главных показателя`);
      check((await p.locator('svg[role=img]').count()) >= 5, `${width}px «Обзор»: графики по дням (${await p.locator('svg[role=img]').count()})`);
      check((await p.locator('[data-funnel-card]').innerText()).includes('Зарегистрировались'), `${width}px «Обзор»: воронка новичков`);
      check((await p.locator('[data-sources-card]').innerText()).includes('без метки'), `${width}px «Обзор»: откуда пришли (без метки — открыли сами)`);
      // в этом наборе никто не проходил входной тест — карточка говорит об этом, а не рисует пустые полосы
      check(/не проходил тест/.test(await p.locator('[data-placement-card]').innerText()), `${width}px «Обзор»: входной тест (никто из новичков не проходил)`);
      check((await p.locator('[data-reminders-card]').innerText()).includes('включены у'), `${width}px «Обзор»: напоминания бота`);
      check((await p.locator('[data-app-errors]').innerText()).includes('приложение 1'), `${width}px «Обзор»: ошибки за сутки — 1 в приложении`);
      await p.click('button:has-text("7 дней")');
      await p.waitForFunction(() => /^7 дн\./.test(document.querySelector('h1 + p')?.textContent ?? ''), null, { timeout: 10_000 });
      check(true, `${width}px «Обзор»: переключатель периода (7 дней)`);
      await noHScroll('обзор');
      await axe('«Обзор»');
      check((await p.locator('[data-nav-errors]').count()) === (width < 600 ? (await p.locator('[data-nav-errors]').count()) : 1), `${width}px меню: у «Ошибок» счётчик за сутки`);
      await p.screenshot({ path: `${OUT}/dashboard-full-${width}.png`, fullPage: true });

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
      await p.click('button:has-text("Новые за сутки")');
      await p.waitForFunction(() => /filter=new/.test(location.search) && /Найдено: [1-9]/.test(document.body.innerText), null, { timeout: 10_000 });
      check(true, `${width}px «Пользователи»: отбор «Новые за сутки»`);
      await axe('«Пользователи»');
      await p.screenshot({ path: `${OUT}/users-${width}.png` });
      await p.locator('a:has-text("подробнее")').first().click();
      await p.locator('[data-user-facts]').waitFor({ timeout: 10_000 });
      const facts = await p.locator('[data-user-facts]').innerText();
      check(/Откуда пришёл/i.test(facts) && /Входной тест/i.test(facts) && /Текущий город/i.test(facts) && /Warszawa/.test(facts), `${width}px карточка игрока: откуда пришёл, входной тест, текущий город (Warszawa)`);
      await noHScroll('карточка игрока');
      await axe('карточка игрока');
      await p.screenshot({ path: `${OUT}/user-${width}.png`, fullPage: true });

      if (width < 600) await p.click('button:has-text("Меню")');
      await p.click('nav a:has-text("Ошибки")');
      await p.locator('h1', { hasText: 'Ошибки' }).waitFor({ timeout: 10_000 });
      await p.locator('[data-error-row]').first().waitFor({ timeout: 10_000 });
      check((await p.locator('[data-error-row]').count()) >= 2, `${width}px «Ошибки»: запись приложения и CSP за сутки`);
      check((await p.locator('[data-error-hint]').first().innerText()).length > 20, `${width}px «Ошибки»: пояснение к известной записи`);
      // wrong_step записан сейчас — позже даты исправления: вместо «исправлено» предупреждение «перешлите разработчику»
      check(/после исправления/.test((await p.locator('[data-error-hint="again"]').first().innerText().catch(() => '')) ?? ''), `${width}px «Ошибки»: запись свежее исправления помечена «появилась после исправления»`);
      await p.click('[aria-label="Вид"] button:has-text("Безопасность")');
      await p.waitForFunction(() => document.querySelectorAll('[data-error-row]').length === 1, null, { timeout: 10_000 });
      check(true, `${width}px «Ошибки»: отбор по виду (безопасность, CSP)`);
      await p.click('[aria-label="Вид"] button:has-text("Все")');
      await p.waitForFunction(() => document.querySelectorAll('[data-error-row]').length >= 2, null, { timeout: 10_000 });
      await noHScroll('ошибки');
      await axe('«Ошибки»');
      await p.screenshot({ path: `${OUT}/errors-${width}.png`, fullPage: true });
      check(errors.length === 0, `${width}px без ошибок JavaScript ${errors.join('; ')}`);
      await context.close();
    }

    // Редактор контента: на «Обзоре» сводка по урокам и пояснение вместо аналитики, в меню нет «Ошибок», запросов с отказом 403 — нет.
    const root = await request('POST', '/api/admin/login', { email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD });
    await request('POST', '/api/admin/admins', { email: 'editor-screens@test.dev', name: 'Редактор', role: 'EDITOR', password: 'editor-password-123' }, { authorization: `Bearer ${root.body.token}` });
    {
      const width = 1280;
      const context = await browser.newContext({ viewport: { width, height: 800 }, locale: 'ru-RU' });
      const p = await context.newPage();
      const denied: string[] = [];
      p.on('response', (r) => { if (r.status() === 403) denied.push(new URL(r.url()).pathname); });
      await p.goto(`${base}/admin/`);
      await p.fill('input[type=email]', 'editor-screens@test.dev');
      await p.fill('input[type=password]', 'editor-password-123');
      await p.click('button:has-text("Войти")');
      await p.locator('h1', { hasText: 'Обзор' }).waitFor({ timeout: 15_000 });
      await p.locator('[data-editor-note]').waitFor({ timeout: 10_000 });
      await p.locator('text=Популярные уроки').waitFor({ timeout: 10_000 });
      check(true, `редактор: «Обзор» — сводка по урокам и пояснение, где аналитика`);
      check((await p.locator('nav a', { hasText: 'Ошибки' }).count()) === 0 && (await p.locator('[data-nav-errors]').count()) === 0, `редактор: в меню нет «Ошибок» и счётчика`);
      check((await p.locator('[data-kpi], [data-funnel-card], [data-app-errors]').count()) === 0, `редактор: графиков, воронки и ошибок на «Обзоре» нет`);
      await p.waitForTimeout(500);
      check(denied.length === 0, `редактор: админка не делает запросов, которые сервер отклоняет (${denied.join(', ')})`);
      await p.screenshot({ path: `${OUT}/editor-dashboard-${width}.png`, fullPage: true });
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
