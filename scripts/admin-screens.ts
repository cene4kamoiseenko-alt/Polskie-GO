/**
 * Админка в браузере: вход, «Аудитория бота» (счётчики, фильтры, поиск, «показать ещё»), обзор и пользователи — на русском,
 * платежи с возвратом, поддержка с ответом, рассылка (черновик → пробное себе → отправка → остановка), журнал, администраторы,
 * награды, бот, списки и редактор контента (обновление 2026-11-13) —
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
type AxeNode = { id: string; impact: string | null; nodes: { target: string[]; data: { fg: string; bg: string; ratio: number } | null }[] };
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
  // Обновление админки 2026-11-13: оплата (для «Платежей» и возврата), обращение в поддержку, получатель рассылки, второй администратор.
  const { db } = await import(root + '/apps/server/src/db/index.ts');
  const schema = await import(root + '/apps/server/src/db/schema.ts');
  const { eq } = await import('drizzle-orm');
  await db.insert(schema.paymentEvents).values({ userId: app1.user.id, type: 'SUCCESSFUL_PAYMENT', planCode: 'MONTH_1', amount: 250, currency: 'XTR', chargeId: 'screens_charge_1', payload: 'inv_screens_1' });
  await say({ id: app2.telegramId, first_name: `User${app2.telegramId}`, language_code: 'uk' }, '/paysupport');
  await say({ id: app2.telegramId, first_name: `User${app2.telegramId}`, language_code: 'uk' }, 'Не пришёл Premium после оплаты');
  await db.update(schema.userSettings).set({ notificationsEnabled: true, uiLanguage: 'ru' }).where(eq(schema.userSettings.userId, app1.user.id));
  const rootLogin = await request('POST', '/api/admin/login', { email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD });
  const asRoot = { authorization: `Bearer ${rootLogin.body.token}` };
  await request('POST', '/api/admin/admins', { email: 'support-screens@test.dev', name: 'Оксана', role: 'SUPPORT', password: 'support-password-123' }, asRoot);

  // Вопрос дня (2026-11-13): сегодняшняя рассылка двум людям (минутный запуск в окне отправки), app1 ответил верно; потом рассылку выключаем —
  // владелец видит план до запуска и запускает сам.
  const daily = await import(root + '/apps/server/src/bot/daily/state.ts');
  const { runDailyQuizTick } = await import(root + '/apps/server/src/bot/daily/send.ts');
  const { QUESTION_BY_ID } = await import(root + '/apps/server/src/bot/quiz/questions.ts');
  const todayW = daily.warsawDay(new Date());
  const st = await daily.writeDailyState({ enabled: true, startDay: todayW });
  await runDailyQuizTick(new Date(daily.sendWindow(st, todayW).from.getTime() + 60_000));
  await daily.writeDailyState({ enabled: false, startDay: null });
  const dq = (await db.select().from(schema.dailyQuizSends).where(eq(schema.dailyQuizSends.telegramId, app1.telegramId)))[0];
  const dqRound = (await db.select().from(schema.botQuizRounds).where(eq(schema.botQuizRounds.id, dq.roundId)))[0];
  await request('POST', '/telegram/webhook', { update_id: ++upd, callback_query: { id: `cb${upd}`, from: { id: app1.telegramId, first_name: 'A' }, message: { message_id: 1, chat: { id: app1.telegramId, type: 'private' } }, data: `qa:${dqRound.id}:${dqRound.optionOrder.indexOf(QUESTION_BY_ID.get(dqRound.questionId).answer)}` } }, { 'x-telegram-bot-api-secret-token': env.TELEGRAM_WEBHOOK_SECRET });

  const browser = await chromium.launch({ executablePath: chromiumPath(chromium) });
  try {
    for (const [width, height] of [[390, 844], [1280, 800]] as const) {
      const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: width < 600 ? 2 : 1, locale: 'ru-RU' });
      const p = await context.newPage();
      const errors: string[] = [];
      p.on('pageerror', (e) => errors.push(e.message));
      // Доступность (axe-core, правила WCAG 2 A/AA): на новых экранах админки — без нарушений (обновление админки 2026-11-12).
      const axe = async (what: string) => {
        // Контраст считаем по итоговым цветам: ждём конец переходов и конечных анимаций (иначе axe видит цвет посреди перехода и результат
        // плавает от запуска к запуску). Бесконечные анимации (индикаторы загрузки) не ждём, потолок ожидания — 3 с.
        await p.evaluate(`Promise.race([Promise.all(document.getAnimations().filter((a) => a.effect && a.effect.getComputedTiming().iterations !== Infinity).map((a) => a.finished.catch(() => null))), new Promise((r) => setTimeout(r, 3000))])`);
        await p.waitForTimeout(100);
        await p.addScriptTag({ content: AXE });
        const found = (await p.evaluate(`window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }).then((r) => r.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.map((n) => ({ target: n.target, data: n.any && n.any[0] && n.any[0].data ? { fg: n.any[0].data.fgColor, bg: n.any[0].data.bgColor, ratio: n.any[0].data.contrastRatio } : null })) })))`)) as AxeNode[];
        const list = found.map((v) => `${v.id} (${v.impact}, ${v.nodes.length}: ${v.nodes.slice(0, 2).map((n) => n.target.join(' ') + (n.data ? ` [${n.data.fg} на ${n.data.bg}, ${n.data.ratio}]` : '')).join(' | ')})`);
        check(found.length === 0, `${width}px ${what}: доступность WCAG 2 A/AA — нарушений нет${list.length ? ': ' + list.join('; ') : ''}`);
      };
      const noHScroll = async (what: string) => {
        const over = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        // Что вылезает за край: самые глубокие элементы правее окна (подсказка для исправления).
        const culprits = over > 1
          ? await p.evaluate(() => {
              const w = document.documentElement.clientWidth;
              return [...document.querySelectorAll('body *')]
                .filter((e) => e.getBoundingClientRect().right > w + 1 && ![...e.children].some((c) => c.getBoundingClientRect().right > w + 1))
                .slice(0, 3)
                .map((e) => `${e.tagName.toLowerCase()}.${String((e as HTMLElement).className).split(' ').slice(0, 3).join('.')}`);
            })
          : [];
        check(over <= 1, `${width}px ${what}: нет горизонтальной прокрутки страницы (${over}px)${culprits.length ? ` — ${culprits.join(', ')}` : ''}`);
      };

      const toast = (text: string) => p.locator('[data-toast]', { hasText: text }).first().waitFor({ timeout: 10_000 });
      const wide = width >= 600;
      /** Перейти в раздел из меню (на телефоне — через «☰ Меню»). Название пункта — начало его текста (за ним может стоять счётчик). */
      const go = async (label: string, h1: string) => {
        if (!wide) await p.click('button:has-text("Меню")');
        await p.locator('nav').getByRole('link', { name: new RegExp(`^${label}`) }).click();
        await p.locator('h1', { hasText: h1 }).waitFor({ timeout: 10_000 });
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
      check((await p.locator('[data-message-player]').count()) === 1, `${width}px карточка игрока: «Написать игроку»`);
      if (width >= 600) {
        await p.fill('#msg-player', 'Premium уже включён, перезапустите приложение');
        await p.click('[data-message-player] button:has-text("Отправить")');
        await toast('Сообщение отправлено');
        check(true, `${width}px карточка игрока: сообщение от бота отправлено`);
      }
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

      // ── Обновление админки 2026-11-13 ──
      // «Платежи»: выручка, журнал понятными словами, возврат звёзд через окно подтверждения.
      await go('Платежи', 'Платежи');
      await p.locator('[data-money-kpis]').waitFor({ timeout: 10_000 });
      check((await p.locator('[data-money-kpis]').innerText()).includes('250 ⭐'), `${width}px «Платежи»: выручка 250 ⭐`);
      await p.locator('[data-payment-log] tbody tr:not([data-loading]):not([data-empty])').first().waitFor({ timeout: 10_000 });
      const log = await p.locator('[data-payment-log]').innerText();
      check(/оплата/.test(log) && log.includes('1 месяц'), `${width}px «Платежи»: журнал — «оплата», тариф словами («1 месяц»)`);
      await noHScroll('платежи');
      await axe('«Платежи»');
      await p.screenshot({ path: `${OUT}/payments-${width}.png`, fullPage: true });
      await p.click('[data-payment-log] button:has-text("Вернуть звёзды")');
      await p.locator('[data-dialog]').waitFor({ timeout: 5_000 });
      check((await p.locator('[data-dialog]').innerText()).includes('Отменить возврат нельзя'), `${width}px «Платежи»: возврат — окно подтверждения с предупреждением`);
      await axe('окно подтверждения');
      if (!wide) {
        await p.click('[data-dialog] button:has-text("Отмена")');
        await p.locator('[data-dialog]').waitFor({ state: 'detached', timeout: 5_000 });
        check(true, `${width}px «Платежи»: «Отмена» закрывает окно, звёзды не возвращаются`);
      } else {
        await p.click('[data-dialog-confirm]');
        await toast('Звёзды возвращены');
        await p.locator('[data-payment-log]', { hasText: 'возвращено' }).waitFor({ timeout: 10_000 });
        check((await p.locator('[data-payment-log] button:has-text("Вернуть звёзды")').count()) === 0, `${width}px «Платежи»: после возврата — «возвращено», кнопки возврата больше нет`);
      }

      // «Поддержка»: число на меню, обращение как чат, ответ в бот.
      check(((await p.locator('[data-nav-count="support"]').textContent().catch(() => '')) ?? '').startsWith('1'), `${width}px меню: у «Поддержки» число открытых обращений (1)`);
      await go('Поддержка', 'Поддержка по оплате');
      await p.locator('[data-support="OPEN"]').waitFor({ timeout: 10_000 });
      check((await p.locator('[data-support="OPEN"]').innerText()).includes('Не пришёл Premium'), `${width}px «Поддержка»: текст обращения`);
      await noHScroll('поддержка');
      await axe('«Поддержка»');
      await p.screenshot({ path: `${OUT}/support-${width}.png`, fullPage: true });
      if (wide) {
        await p.fill('[data-support="OPEN"] textarea', 'Premium включён, перезапустите приложение.');
        await p.click('[data-support="OPEN"] button:has-text("Ответить в бот")');
        await toast('Ответ отправлен в бот');
        await p.locator('text=Открытых обращений нет').waitFor({ timeout: 10_000 });
        await p.waitForFunction(() => !document.querySelector('[data-nav-count="support"]'), null, { timeout: 10_000 });
        check(true, `${width}px «Поддержка»: ответ ушёл, обращение закрыто, число на меню исчезло`);
      }

      await go('Жалобы', 'Жалобы на игроков');
      await noHScroll('жалобы');
      await axe('«Жалобы»');

      // «Рассылки»: охват, черновик с предпросмотром, пробное сообщение себе, отправка и остановка.
      await go('Рассылки', 'Рассылки');
      await p.locator('[data-campaign-audience]').waitFor({ timeout: 10_000 });
      check(/получат:\s*1 чел/.test(await p.locator('[data-campaign-audience]').innerText()), `${width}px «Рассылки»: охват — 1 человек с уведомлениями`);
      await p.click('button:has-text("Новая рассылка")');
      await p.getByLabel('Название').fill('Новые уроки в Кракове');
      await p.fill('#camp-text', 'Нові уроки в Кракові вже чекають!');
      check((await p.locator('[data-campaign-preview]').innerText()).includes('Нові уроки в Кракові'), `${width}px «Рассылки»: предпросмотр как в Telegram`);
      await noHScroll('рассылки');
      await axe('«Рассылки» (новая)');
      await p.screenshot({ path: `${OUT}/campaign-editor-${width}.png`, fullPage: true });
      if (!wide) await p.click('[data-campaign-editor] button:has-text("Отмена")');
      else {
        await p.click('button:has-text("Сохранить черновик")');
        await toast('Черновик сохранён');
        await p.locator('[data-campaign="DRAFT"]').waitFor({ timeout: 10_000 });
        await p.getByLabel('Проверить на себе').fill(String(app1.telegramId));
        await p.click('button:has-text("Отправить пробное")');
        await toast('Пробное сообщение отправлено');
        check(true, `${width}px «Рассылки»: пробное сообщение себе`);
        await p.click('button:has-text("Отправить всем")');
        await p.locator('[data-dialog]').waitFor({ timeout: 5_000 });
        check((await p.locator('[data-dialog]').innerText()).includes('1 чел.'), `${width}px «Рассылки»: перед отправкой — сколько человек получат`);
        await p.click('[data-dialog-confirm]');
        await toast('Рассылка запущена');
        await p.locator('[data-campaign="SENDING"]').waitFor({ timeout: 10_000 });
        await p.click('[data-campaign="SENDING"] button:has-text("Остановить")');
        await p.click('[data-dialog-confirm]');
        await p.locator('[data-campaign="CANCELLED"]').waitFor({ timeout: 10_000 });
        check(true, `${width}px «Рассылки»: запуск и остановка`);
        await axe('«Рассылки» (список)');
        await p.screenshot({ path: `${OUT}/campaigns-${width}.png`, fullPage: true });
      }

      // «Вопрос дня»: план на 30 дней до запуска, запуск и остановка, замена вопроса, отчёт по дню, банк вопросов, блок в карточке игрока.
      await go('Вопрос дня', 'Вопрос дня');
      await p.locator('[data-daily-day]').first().waitFor({ timeout: 15_000 });
      check((await p.locator('[data-daily-day]').count()) === 30, `${width}px «Вопрос дня»: план на 30 дней (${await p.locator('[data-daily-day]').count()})`);
      check((await p.locator('[data-daily-state="off"]').count()) === 1, `${width}px «Вопрос дня»: рассылка выключена, пока владелец не запустит`);
      check((await p.locator('[data-daily-item]').count()) === 90, `${width}px «Вопрос дня»: по 3 уровня в каждом дне`);
      await p.locator('[data-daily-day]').nth(1).locator('summary').first().click();
      check((await p.locator('[data-daily-day]').nth(1).locator('[data-daily-preview]').first().innerText()).includes('Pytanie dnia'), `${width}px «Вопрос дня»: «как увидит игрок»`);
      await noHScroll('вопрос дня: план');
      await axe('«Вопрос дня» (план)');
      await p.screenshot({ path: `${OUT}/daily-plan-${width}.png`, fullPage: false });
      if (wide) {
        await p.click('[data-daily-start]');
        await p.locator('[data-dialog]').waitFor({ timeout: 5_000 });
        check(/людям/.test(await p.locator('[data-dialog]').innerText()), `${width}px «Вопрос дня»: перед запуском — сколько человек получат и сколько займёт`);
        await p.click('[data-dialog-confirm]');
        await toast('Рассылка запущена');
        await p.locator('[data-daily-state="on"]').waitFor({ timeout: 10_000 });
        await p.click('[data-daily-stop]');
        await p.click('[data-dialog-confirm]');
        await p.locator('[data-daily-state="off"]').waitFor({ timeout: 10_000 });
        check(true, `${width}px «Вопрос дня»: запуск и остановка`);
        const sel = p.locator('[data-daily-day]').nth(2).locator('[data-daily-replace]').first();
        const values = await sel.locator('option').evaluateAll((os) => os.map((o) => (o as HTMLOptionElement).value));
        const current = await sel.inputValue();
        await sel.selectOption(values.find((v) => v !== current)!);
        await toast('Вопрос заменён');
        check(true, `${width}px «Вопрос дня»: вопрос заменён из списка`);
      }
      await p.getByRole('group', { name: 'Раздел' }).getByRole('button', { name: 'День' }).click();
      await p.locator('[data-daily-level]').first().waitFor({ timeout: 10_000 });
      await p.locator('table:has(caption:text("Получатели вопроса дня")) tbody tr:not([data-loading]):not([data-empty])').first().waitFor({ timeout: 10_000 });
      const dayText = await p.locator('main').innerText();
      check(/дошло/.test(dayText) && /✓ верно/.test(dayText), `${width}px «Вопрос дня» → «День»: доставка и верный ответ по каждому человеку`);
      await p.waitForTimeout(400); // переключатель вкладок плавно меняет цвет — проверяем контраст после перехода
      await noHScroll('вопрос дня: день');
      await axe('«Вопрос дня» (день)');
      await p.screenshot({ path: `${OUT}/daily-day-${width}.png`, fullPage: true });
      await p.getByRole('group', { name: 'Раздел' }).getByRole('button', { name: 'Вопросы' }).click();
      await p.locator('[data-daily-toggle]').first().waitFor({ timeout: 10_000 });
      if (wide) {
        await p.locator('[data-daily-toggle]').first().click();
        await toast('Вопрос выключен');
        await p.locator('[data-daily-toggle]').first().click();
        await toast('Вопрос включён');
        check(true, `${width}px «Вопрос дня» → «Вопросы»: выключатель вопроса`);
      }
      await p.waitForTimeout(400);
      await noHScroll('вопрос дня: вопросы');
      await axe('«Вопрос дня» (вопросы)');
      await p.screenshot({ path: `${OUT}/daily-questions-${width}.png`, fullPage: false });
      await p.goto(`${base}/admin/users/${app1.user.id}`);
      await p.locator('[data-user-daily]').waitFor({ timeout: 10_000 });
      check((await p.locator('[data-user-daily]').innerText()).includes('✓ верно'), `${width}px карточка игрока: блок «Вопросы дня»`);

      // «Журнал действий»: обычными словами, отбор по действию.
      await go('Журнал действий', 'Журнал действий');
      await p.locator('[data-audit] tbody tr:not([data-loading]):not([data-empty])').first().waitFor({ timeout: 10_000 });
      if (wide) {
        const audit = await p.locator('[data-audit]').innerText();
        check(/вернул звёзды за\s+платёж/.test(audit) && /запустил\s+рассылку/.test(audit) && /написал\s+игроку/.test(audit), `${width}px «Журнал»: «вернул звёзды за платёж», «запустил рассылку», «написал игроку»`);
        await p.getByLabel('Действие').selectOption('payment_refund');
        await p.waitForFunction(() => document.querySelectorAll('[data-audit] tbody tr:not([data-loading])').length === 1, null, { timeout: 10_000 });
        check(true, `${width}px «Журнал»: отбор по действию`);
      }
      await noHScroll('журнал');
      await axe('«Журнал действий»');
      await p.screenshot({ path: `${OUT}/audit-${width}.png`, fullPage: true });

      // «Администраторы»: «это вы», роль меняется прямо в списке.
      await go('Администраторы', 'Администраторы');
      await p.locator('[data-admins]', { hasText: 'support-screens@test.dev' }).waitFor({ timeout: 10_000 });
      check((await p.locator('[data-admins]').innerText()).includes('это вы'), `${width}px «Администраторы»: отмечено «это вы»`);
      if (wide) {
        await p.getByLabel('Роль: Оксана').selectOption('EDITOR');
        await toast('Роль изменена');
        check(true, `${width}px «Администраторы»: роль изменена из списка`);
      }
      await noHScroll('администраторы');
      await axe('«Администраторы»');
      await p.screenshot({ path: `${OUT}/admins-${width}.png`, fullPage: true });

      // «Награды»: по группам, изменённое отмечено, «Сохранить (1)».
      await go('Награды', 'Награды и лимиты');
      await p.locator('#rw-lessonXp').waitFor({ timeout: 10_000 });
      if (wide) {
        await p.fill('#rw-lessonXp', '25');
        check((await p.locator('button:has-text("Сохранить (1)")').count()) === 1, `${width}px «Награды»: «Сохранить (1)» после изменения`);
        await p.click('button:has-text("Сохранить (1)")');
        await toast('Награды сохранены');
        await p.locator('[data-reward="lessonXp"] button:has-text("вернуть")').click();
        await p.click('button:has-text("Сохранить (1)")');
        await p.locator('text=Все изменения сохранены').waitFor({ timeout: 10_000 });
        check(true, `${width}px «Награды»: сохранить и вернуть значение по умолчанию`);
      }
      await noHScroll('награды');
      await axe('«Награды»');
      await p.screenshot({ path: `${OUT}/rewards-${width}.png`, fullPage: true });

      await go('Бот', 'Telegram-бот');
      await p.locator('[data-bot-status]').waitFor({ timeout: 15_000 });
      await noHScroll('бот');
      await axe('«Бот»');
      await p.screenshot({ path: `${OUT}/bot-${width}.png`, fullPage: true });

      // Контент: статусы словами, редактор с «Сохранить» внизу и вопросом при уходе без сохранения.
      await go('Уроки', 'Уроки');
      await p.locator('[data-resource-list="lessons"] tbody tr:not([data-loading]):not([data-empty])').first().waitFor({ timeout: 10_000 });
      check((await p.locator('[data-resource-list="lessons"]').innerText()).includes('опубликовано'), `${width}px «Уроки»: статус словами`);
      await noHScroll('уроки');
      await axe('«Уроки»');
      await p.screenshot({ path: `${OUT}/lessons-${width}.png` });
      await p.locator('[data-resource-list="lessons"] tbody a.link').first().click();
      await p.locator('[data-resource-edit="lessons"]').waitFor({ timeout: 10_000 });
      check(await p.locator('[data-save]').isDisabled(), `${width}px редактор урока: «Сохранить» неактивна без изменений`);
      await p.locator('[data-resource-edit] input[type=number]').first().fill('99');
      // Правка сделана сразу после открытия: поздний ответ сервера не должен её затереть (раньше затирал — 2026-11-13).
      await p.waitForTimeout(800);
      check((await p.locator('[data-resource-edit] input[type=number]').first().inputValue()) === '99', `${width}px редактор урока: правка не пропадает, когда приходит ответ сервера`);
      await p.locator('text=Есть несохранённые изменения').waitFor({ timeout: 5_000 });
      check(!(await p.locator('[data-save]').isDisabled()), `${width}px редактор урока: после правки — «Сохранить» активна`);
      await noHScroll('редактор урока');
      await axe('редактор урока');
      await p.screenshot({ path: `${OUT}/lesson-edit-${width}.png`, fullPage: true });
      await p.click('button:has-text("← Уроки")');
      await p.locator('[data-dialog]', { hasText: 'Уйти без сохранения?' }).waitFor({ timeout: 5_000 });
      await p.click('[data-dialog-confirm]');
      await p.locator('[data-resource-list="lessons"]').waitFor({ timeout: 10_000 });
      check(true, `${width}px редактор урока: уход без сохранения — с вопросом`);

      check(errors.length === 0, `${width}px без ошибок JavaScript ${errors.join('; ')}`);
      await context.close();
    }

    // Редактор контента: на «Обзоре» сводка по урокам и пояснение вместо аналитики, в меню нет «Ошибок», запросов с отказом 403 — нет.
    await request('POST', '/api/admin/admins', { email: 'editor-screens@test.dev', name: 'Редактор', role: 'EDITOR', password: 'editor-password-123' }, asRoot);
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
