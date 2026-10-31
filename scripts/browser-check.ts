/**
 * Браузерна перевірка на одноразовій локальній D1 і справжньому UI (Vite dev + API в одному процесі).
 * Порти вільні (0 → ОС обирає), тож перевірка не конфліктує з запущеним `npm run dev` чи стендом.
 *
 * Голос:
 *  - розпізнавання пристрою (SpeechRecognition підмінено подіями): тиша → стан «Тишина» без відповіді;
 *    фраза → відповідь іде як тренування (без XP і без помилки);
 *  - серверний запис: справжній getUserMedia + AudioWorklet на фейковому мікрофоні Chromium (WAV із тоном),
 *    Azure STT підмінено в цьому процесі. Немає мережі → стан «Нет сети» без запиту; відмова в дозволі →
 *    «Нужно разрешение»; тиша → «Тишина» без запиту до STT; запис → підписана спроба → зараховано з XP.
 * Це не перевірка реального мікрофона, iPhone чи Telegram.
 *
 * Інтерфейс:
 *  - A2 головна, блок «Сегодня»: стани error (з повтором), empty, done, offline, active; скелетонів поза loading немає;
 *  - A3 шторка міста на /map (360/390/430): остання тема й CTA у viewport, прокрутка не закриває, ✕ / Escape / drag за ручку
 *    закривають; знімки — test-results/screens/sheet-{ширина}.png.
 *    A3.8 (390): три окремі стани міста в шторці — оформлення (CITY_ART), уроки, доступ; Kielce (малюнок готовий, уроків ще немає; Gorzów і Toruń отримали уроки),
 *    без кнопки «Учить»; Łódź — тимчасовий малюнок lazy зі srcset 640w. Знімки — sheet-status-{kielce,lodz}-390.png.
 *  - A4 ілюстрована карта /map (ADR-012; 360/390/430): 21 прозора кнопка міста збігається з намальованою табличкою (рамки MAP_SPOTS
 *    відносно картинки), кільце «ти тут» — на поточному місті у видимому вікні, подорож /map?travel=from,to з prefers-reduced-motion —
 *    маркер одразу в кінцевому місті. Детальні жести (pinch, колесо, клавіатура, офлайн) — scripts/map-screens.ts.
 *    Знімки — test-results/screens/map-{ширина}.png і map-travel-{ширина}.png.
 *  - L1 «один образ на всіх екранах» (ADR-005 §10; 360/390/430): у користувача костюм кухаря, ковпак і окуляри без живописного
 *    шару (pending). На головній, у профілі, гардеробі й в уроці (на ілюстрованій карті Бобек намальований, ADR-012) кожен корінь [data-look] без data-look-preview="true"
 *    має ті самі data-look-equipped і data-look-items, що й resolveLook ядра для його me.outfit.wear; Бобек ненульового розміру,
 *    кожен шар (<img> або SVG-<image>) справді декодується. Те саме — для стартового образу (390).
 *    Знімки — test-results/screens/look-{екран}-390.png і look-default-{екран}-390.png.
 *  - L2 гардероб, річ без живописного шару (visualStatus pending): на картці мітка «Визуал готовится» замість ціни, у панелі
 *    дії немає кнопок покупки й Premium; POST /shop/buy → 409 visual_pending, баланс не змінився. Знімок — look-wardrobe-pending-390.png.
 *  - B1 переходы из Telegram-бота: ?bot_screen=<экран> (девять экранов) открывает свой маршрут на iPhone 390×844 и Android 360×800 (эмуляция
 *    Chromium, не реальные устройства), параметр убирается из адреса; неизвестное значение и адрес-обманка остаются на главной;
 *    startapp=screen_<экран>, ref_ и premium не конфликтуют. Telegram подменён: window.Telegram.WebApp с подписанными initData
 *    (сервер проверяет подпись), новичок сначала проходит знакомство и затем попадает на экран из start_param; повторный запуск — сразу на экран.
 *  - G «Назад» и свайпы (сенсорные события через CDP, 390×844): «Назад» на экране, открытом кнопкой бота, ведёт на главную;
 *    свайп от левого края закрывает шторку и возвращает назад, вертикальный и короткий жест — нет; вкладки заданий и гардероба
 *    листаются свайпом, ряд категорий — нет; примерочная листает вещи; тост смахивается вверх.
 *
 * Запуск: npm run e2e   (знімки — test-results/screens, підсумок — test-results/browser-results.json)
 */
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromiumPath, startStand } from './lib/stand';
import { MAP_ART, MAP_SPOTS, mapHitRect, mapStarPoint } from '../packages/shared/src/mapArt';
import { equipmentFromWear, lookDataAttributes, resolveLook, toLookItemId, tryOn } from '../packages/shared/src/look/index';
import { signInitData } from '../apps/server/src/lib/telegram';

const root = process.cwd();
const require = createRequire(root + '/package.json');
const OUT = resolve(root, 'test-results');
const SCREENS = resolve(OUT, 'screens');

/** Моно PCM16 WAV: тиша, потім тон (як голос), потім тиша — для фейкового мікрофона Chromium. */
function toneWav(path: string, seconds = 6, rate = 48000) {
  const n = seconds * rate;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVE', 8); buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22); buf.writeUInt32LE(rate, 24);
  buf.writeUInt32LE(rate * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const amp = 0.25 * (0.6 + 0.4 * Math.sin((2 * Math.PI * 3 * i) / rate));
    buf.writeInt16LE(Math.round(amp * Math.sin((2 * Math.PI * 220 * i) / rate) * 32767), 44 + i * 2);
  }
  writeFileSync(path, buf);
}

function check(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`E2E: ${msg}`);
  console.log(`  ✓ ${msg}`);
}

/** Сценарии A2/A3: падение (check или таймаут Playwright) не обрывает остальные, а копится и поднимается в конце прогона. */
const softFailures: string[] = [];
const softSkipped: string[] = [];
async function soft(name: string, fn: () => Promise<void>): Promise<boolean> {
  try {
    await fn();
    return true;
  } catch (e) {
    const msg = (e as Error).message.split('\n')[0];
    softFailures.push(`${name}: ${msg}`);
    console.log(`  ✗ ${name}: ${msg}`);
    return false;
  }
}

async function main() {
  const { chromium } = require('playwright') as typeof import('playwright');
  const stand = await startStand({ ui: 'dev' });
  const { base, env, login, sessionItems, correctAnswers } = stand;
  mkdirSync(SCREENS, { recursive: true });

  // Azure STT підмінено лише в цьому процесі: повертає фразу поточного завдання, лічить виклики.
  let sttPhrase = '';
  let sttCalls = 0;
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (url.includes('.stt.speech.microsoft.com')) {
      sttCalls++;
      return new Response(JSON.stringify({ RecognitionStatus: 'Success', DisplayText: sttPhrase }), { headers: { 'content-type': 'application/json' } });
    }
    return realFetch(input, init);
  }) as typeof fetch;

  console.log(`UI ${base}`);

  const wav = resolve(OUT, 'fake-mic.wav');
  toneWav(wav);
  const executablePath = chromiumPath(chromium);
  const browser = await chromium.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {}),
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-audio-capture=${wav}`],
  });
  const results: Record<string, unknown>[] = [];
  const errors: string[] = [];

  /** Новий користувач (за замовчуванням — з пройденим онбордингом) і сторінка з його токеном. */
  async function userPage(devUser: string, init?: () => void, opts: { onboarded?: boolean; touch?: boolean } = {}) {
    const u = await login();
    if (opts.onboarded !== false) {
      await u.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A0', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: null });
      await u.call('PATCH', '/api/me/settings', { theme: 'dark', reducedMotion: true });
    }
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, ...(opts.touch ? { isMobile: true, hasTouch: true } : {}) });
    const page = await context.newPage();
    page.on('pageerror', (e) => errors.push(e.message));
    await page.addInitScript(({ token, devUser }) => {
      localStorage.setItem('pg_auth', JSON.stringify({ token, owner: `dev:${devUser}`, exp: Date.now() + 86_400_000 }));
    }, { token: u.token, devUser });
    if (init) await page.addInitScript(init);
    return { ...u, page, context, url: (path: string) => `${base}${path}?devUser=${devUser}` };
  }

  /** Відкрити урок на першому завданні на вимову (попередні завдання зараховано через API). */
  async function openPronunciation(u: Awaited<ReturnType<typeof userPage>>) {
    const lessonId = (await u.call('GET', '/api/journey')).body.nextLesson.id as string;
    const started = (await u.call('POST', '/api/sessions', { lessonId })).body;
    const items = await sessionItems(started.sessionId);
    const target = items.find((i: { type: string }) => i.type === 'PRONUNCIATION');
    if (!target) throw new Error('у першому уроці немає завдання на вимову');
    for (const item of items) {
      if (item === target) break;
      for (const a of correctAnswers(item)) await u.call('POST', `/api/sessions/${started.sessionId}/answer`, { key: item.key, answer: a });
    }
    await u.page.goto(u.url('/lesson/' + lessonId), { waitUntil: 'networkidle' });
    await u.page.getByRole('button', { name: 'Нажми и говори', exact: true }).waitFor({ timeout: 20_000 });
    // Підпис кнопки змінюється під час запису («Остановить запись»), тому шукаємо за будь-яким із них.
    const mic = u.page.getByRole('button', { name: /^(Нажми и говори|Остановить запись)$/ });
    return { mic, phrase: (target.data as { text: string }).text };
  }
  const micState = (page: import('playwright').Page) => page.locator('[data-mic]').getAttribute('data-mic');

  try {
    // ── Головна й основні екрани на трьох ширинах: знімки й горизонтальне переповнення.
    const home = await userPage('880001');
    for (const width of [360, 390, 430]) {
      await home.page.setViewportSize({ width, height: 844 });
      await home.page.goto(home.url('/'), { waitUntil: 'networkidle' });
      await home.page.getByText('Учиться дальше', { exact: true }).waitFor({ timeout: 20_000 });
      await home.page.evaluate(() => document.fonts.ready);
      await home.page.screenshot({ path: `${SCREENS}/home-${width}.png`, fullPage: true });
      results.push({ route: '/', width, overflow: await home.page.evaluate(() => document.documentElement.scrollWidth > innerWidth) });
    }
    for (const route of ['/profile', '/shop', '/learn']) {
      await home.page.goto(home.url(route), { waitUntil: 'networkidle' });
      await home.page.screenshot({ path: `${SCREENS}${route}.png`, fullPage: true });
      results.push({ route, width: 430, overflow: await home.page.evaluate(() => document.documentElement.scrollWidth > innerWidth) });
    }
    check(!results.some((r) => r.overflow), 'немає горизонтального переповнення на 360/390/430');
    await home.context.close();

    // ── Новий користувач: онбординг у UI → перший урок повністю через UI → підсумок → головна → екрани.
    // Відповіді не обов'язково правильні: перевіряється, що жоден тип завдання не блокує проходження.
    console.log('Новий користувач');
    const fresh = await userPage('880006', undefined, { onboarded: false });
    const fp = fresh.page;
    await fp.goto(fresh.url('/'));
    await fp.locator('button.btn-red').click();
    for (let i = 0; i < 5; i++) {
      await fp.locator('button.btn-primary').last().click();
      await fp.waitForTimeout(250);
    }
    await fp.locator('button.btn-red').click();
    await fp.locator('[data-action="start"]').click({ timeout: 20_000 });
    check(true, 'онбординг пройдено, відкрився вступ першого уроку');
    const types = new Set<string>();
    for (let guard = 0; guard < 150; guard++) {
      if (await fp.locator('[data-lesson-result]').count()) break;
      const next = fp.locator('[data-action="next"]:not([disabled])');
      if (await next.count()) { await next.click(); await fp.waitForTimeout(250); continue; }
      // Сервер відхиляє занадто швидке проходження (≥ 1 с на завдання) — відповідаємо в людському темпі.
      await fp.waitForTimeout(1100);
      const checkBtn = fp.locator('[data-action="check"]');
      // Після відповіді чекаємо на панель результату з «Далі» (запит перевірки ще може йти).
      const answered = () => fp.locator('[data-action="next"]').waitFor({ timeout: 15_000 });
      if (await fp.locator('[data-action="skip"]').count()) { types.add('pronunciation'); await fp.locator('[data-action="skip"]').click(); await answered(); continue; }
      if (await fp.locator('textarea').count()) { types.add('text'); await fp.fill('textarea', 'Dziękuję'); await checkBtn.click(); await answered(); continue; }
      if (await fp.locator('[data-token]').count()) {
        types.add('order');
        while (await fp.locator('[data-token]').count()) await fp.locator('[data-token]').first().click();
        await checkBtn.click();
        await answered();
        continue;
      }
      if (await fp.locator('[data-pair="left"]').count()) {
        types.add('match');
        const n = await fp.locator('[data-pair="left"]').count();
        for (let k = 0; k < n; k++) { await fp.locator('[data-pair="left"]').nth(k).click(); await fp.locator('[data-pair="right"]').nth(k).click(); }
        // Пари перевіряються самі після останньої пари; кнопка «Перевірити» лише якщо вона є.
        if (await checkBtn.count()) await checkBtn.click();
        await answered();
        continue;
      }
      const opts = fp.locator('button.option:not([disabled])');
      if ((await checkBtn.count()) && (await opts.count())) { types.add('choice'); await opts.first().click(); await checkBtn.click(); await answered(); continue; }
      if (await opts.count()) {
        // Діалог: пробуємо варіанти, поки сервер не прийме правильний.
        types.add('dialogue');
        const n = await opts.count();
        for (let k = 0; k < n; k++) {
          await opts.nth(k).click().catch(() => {});
          await fp.waitForTimeout(900);
          if ((await fp.locator('button.option:not([disabled])').count()) !== n) break;
        }
      }
    }
    check(await fp.locator('[data-lesson-result]').count() === 1, `перший урок пройдено через UI до підсумку (типи: ${[...types].join(', ')})`);
    await fp.screenshot({ path: `${SCREENS}/first-lesson-result.png` });
    await fp.locator('[data-action="home"]').click();
    await fp.locator('nav a[href="/"]').waitFor();
    const broken: string[] = [];
    for (const path of ['/map', '/learn', '/quests', '/profile', '/dictionary', '/shop', '/life', '/pass', '/achievements', '/passport', '/grammar', '/settings', '/life/zabka-first-order']) {
      await fp.goto(fresh.url(path));
      await fp.waitForFunction(() => !document.querySelector('.splash') && !document.querySelector('[data-skeleton]'), undefined, { timeout: 20_000 }).catch(() => broken.push(`${path}: завантаження`));
      if (await fp.locator('[data-screen-error], [role="alert"]').count()) broken.push(`${path}: помилка`);
    }
    check(broken.length === 0, `основні екрани відкриваються без помилок${broken.length ? ': ' + broken.join('; ') : ''}`);
    await fresh.context.close();

    // ── Запуск: недоступний сервер, відсутність мережі, повільний профіль, недовантажений екран.
    console.log('Запуск');
    const boot = await userPage('880004');
    await boot.page.route('**/api/**', (r) => r.abort('internetdisconnected'));
    await boot.page.goto(boot.url('/'));
    await boot.page.locator('[data-boot-error="server"]').waitFor({ timeout: 20_000 });
    check(true, 'сервер недоступний — заставка з помилкою й «Повторить», не порожній екран');
    await boot.context.setOffline(true);
    await boot.page.locator('[data-boot-error="offline"]').waitFor();
    check(!(await boot.page.getByText(/офлайн/i).count()), 'немає мережі — екран «Нет подключения» без обіцянки офлайн-уроків');
    await boot.page.screenshot({ path: `${SCREENS}/boot-offline.png` });
    await boot.page.unroute('**/api/**');
    await boot.context.setOffline(false);
    await boot.page.getByText('Учиться дальше', { exact: true }).waitFor({ timeout: 20_000 });
    check(true, 'мережа повернулась — профіль довантажився сам, без перезапуску');

    await boot.page.route('**/api/me', async (r) => {
      await new Promise((ok) => setTimeout(ok, 9500));
      await r.continue().catch(() => {});
    });
    await boot.page.reload();
    // До завантаження профілю мова ще не відома (поза Telegram — українська), тож перевіряємо за станом.
    await boot.page.locator('[data-boot="profile"]').waitFor({ timeout: 5_000 });
    await boot.page.locator('[data-boot="slow"]').waitFor({ timeout: 15_000 });
    check(await boot.page.locator('.splash-card button').count() === 1, 'повільний етап — спершу «профіль», після 8 с чесне «повільно» і кнопка повтору');
    await boot.page.screenshot({ path: `${SCREENS}/boot-slow.png` });
    await boot.page.unroute('**/api/me');
    await boot.page.getByText('Учиться дальше', { exact: true }).waitFor({ timeout: 20_000 });

    await boot.page.route('**/src/screens/Shop.tsx*', (r) => r.abort('failed'));
    await boot.page.goto(boot.url('/shop'));
    await boot.page.locator('[data-screen-error="chunk"]').waitFor({ timeout: 20_000 });
    check(await boot.page.getByRole('button', { name: 'Перезагрузить' }).count() === 1, 'недовантажений екран — межа помилок з «Перезагрузить», а не порожня сторінка');
    await boot.context.close();

    // ── A2: головна, блок «Сегодня». Кожен стан має свій data-today (loading | error | offline | empty | active | done);
    // скелетони допустимі лише в loading. Сценарии A2/A3 идут через soft(): падение одного не обрывает остальные,
    // но в конце прогона все падения собираются в одну ошибку (код выхода ≠ 0).
    console.log('A2: главная, «Сегодня»');
    type QuestsBody = { daily: { status: string }[]; [k: string]: unknown };
    const today = await userPage('880007');
    const tp = today.page;
    await tp.setViewportSize({ width: 390, height: 844 });
    const todaySection = tp.locator('section').filter({ has: tp.locator('[data-today]') });
    const todayState = (s: string) => tp.locator(`[data-today="${s}"]`);
    const noSkeleton = async () => (await todaySection.locator('.skeleton').count()) === 0;
    /** Реальный ответ /api/quests, пропущенный через mutate (без `response:` — иначе content-length исходника не совпадёт с телом). */
    const mockQuests = (mutate: (body: QuestsBody) => QuestsBody) =>
      tp.route('**/api/quests', async (route) => {
        const res = await route.fetch();
        const body = (await res.json()) as QuestsBody;
        await route.fulfill({ status: res.status(), contentType: 'application/json', body: JSON.stringify(mutate(body)) });
      });
    const clearQuestsRoute = () => tp.unroute('**/api/quests').catch(() => {});

    await soft('A2.1 ошибка и повтор', async () => {
      try {
        await tp.route('**/api/quests', (r) => r.abort('failed'));
        await tp.goto(today.url('/'));
        await todayState('error').waitFor({ timeout: 20_000 });
        check(true, 'A2.1 запрос заданий упал — «Сегодня» в состоянии error, а не вечный скелетон');
        const retry = todayState('error').getByRole('button', { name: 'Попробовать ещё', exact: true });
        check(await retry.count() === 1, 'A2.1 в состоянии error есть кнопка «Попробовать ещё»');
        check(await noSkeleton(), 'A2.5 error: в секции «Сегодня» нет скелетонов');
        await tp.unroute('**/api/quests');
        await retry.click();
        await todayState('active').waitFor({ timeout: 20_000 });
        const n = await todayState('active').locator('.task-card').count();
        check(n > 0, `A2.1 после повтора появились задания (${n} шт.), состояние active`);
        check(await noSkeleton(), 'A2.5 active: в секции «Сегодня» нет скелетонов');
      } finally {
        await clearQuestsRoute();
      }
    });

    await soft('A2.2 пустой день', async () => {
      try {
        await mockQuests((b) => ({ ...b, daily: [] }));
        await tp.goto(today.url('/'));
        await todayState('empty').waitFor({ timeout: 20_000 });
        check(await todayState('empty').getByText('На сегодня заданий нет').count() === 1, 'A2.2 daily: [] — состояние empty с текстом «На сегодня заданий нет…»');
        check(await noSkeleton(), 'A2.5 empty: в секции «Сегодня» нет скелетонов');
      } finally {
        await clearQuestsRoute();
      }
    });

    await soft('A2.3 всё выполнено', async () => {
      try {
        await mockQuests((b) => ({ ...b, daily: b.daily.map((q) => ({ ...q, status: 'COMPLETED' })) }));
        await tp.goto(today.url('/'));
        await todayState('done').waitFor({ timeout: 20_000 });
        check(await todaySection.getByText('Все задания на сегодня выполнены!').isVisible(), 'A2.3 все daily COMPLETED — состояние done и видна строка «Все задания на сегодня выполнены!»');
        check(await noSkeleton(), 'A2.5 done: в секции «Сегодня» нет скелетонов');
      } finally {
        await clearQuestsRoute();
      }
    });

    // Офлайн: документ главной без сети не загрузить, поэтому страница открыта заранее (/map — без запроса заданий),
    // сеть выключается и в приложение «Главная» переходим по нижней навигации; Home не lazy, чанк не нужен.
    await soft('A2.4 офлайн', async () => {
      await tp.goto(today.url('/map'), { waitUntil: 'networkidle' });
      await tp.locator('[data-current-city]').waitFor({ timeout: 20_000 });
      await today.context.setOffline(true);
      try {
        await tp.locator('nav a[href="/"]').click();
        await todayState('offline').waitFor({ timeout: 15_000 });
        check(await todayState('offline').getByText('Нет связи').count() === 1, 'A2.4 без сети — состояние offline с текстом «Нет связи…»');
        check(await noSkeleton(), 'A2.5 offline: в секции «Сегодня» нет скелетонов');
      } finally {
        await today.context.setOffline(false);
      }
      await todayState('active').waitFor({ timeout: 20_000 });
      check(true, 'A2.4 сеть вернулась — «Сегодня» само загрузило задания (active)');
    });
    // ── O1: знакомство в полноэкранном режиме Telegram. Обёртка добавляет сверху отступ под шапку Telegram;
    // раньше экран был 100dvh + отступ, и «Продолжить» уезжал за нижний край (на шаге языка «дальше не пускает»).
    await soft('O1 знакомство: кнопка видна на каждом шаге при отступе Telegram 100 px (320×568)', async () => {
      const fresh = await userPage('880050', undefined, { onboarded: false });
      const op = fresh.page;
      await op.setViewportSize({ width: 320, height: 568 });
      await op.addInitScript(`document.addEventListener('DOMContentLoaded', () => document.documentElement.style.setProperty('--tg-content-safe-area-inset-top', '100px'))`);
      await op.goto(fresh.url('/'));
      await op.locator('button.btn-red').first().click({ timeout: 20_000 });
      const hidden: string[] = [];
      for (let i = 0; i < 8; i++) {
        const btn = op.locator('[data-onboarding-action] button');
        await btn.waitFor({ timeout: 10_000 });
        const pos = await btn.evaluate((b) => { const r = b.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, h: window.innerHeight }; });
        const title = (await op.locator('h2').first().innerText().catch(() => '?')).slice(0, 30);
        if (pos.top < 0 || pos.bottom > pos.h) hidden.push(`${title}: ${Math.round(pos.top)}–${Math.round(pos.bottom)} из ${pos.h}`);
        if (/урок|тест/i.test(await btn.innerText())) break;
        await btn.click();
        await op.waitForTimeout(400);
      }
      check(hidden.length === 0, `O1 «Продолжить» в пределах экрана на всех шагах знакомства${hidden.length ? ': ' + hidden.join('; ') : ''}`);
      await fresh.context.close();
    });

    // ── G: «Назад» и свайпы (2026-10-31). Экран, открытый кнопкой бота, — первый в истории: «Назад» раньше уводил
    // «до приложения» и в Telegram не делал ничего. Свайпы — сенсорные (CDP touch), на 390×844.
    await soft('G «Назад» без истории и свайпы: край, вкладки, примерочная, тост', async () => {
      const g = await userPage('880060', undefined, { touch: true });
      const gp = g.page;
      const cdp = await g.context.newCDPSession(gp);
      const swipe = async (x0: number, y0: number, x1: number, y1: number) => {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0 }] });
        for (let i = 1; i <= 10; i++) {
          await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + ((x1 - x0) * i) / 10, y: y0 + ((y1 - y0) * i) / 10 }] });
          await gp.waitForTimeout(16);
        }
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await gp.waitForTimeout(450);
      };
      const path = () => gp.evaluate(() => location.pathname);
      const tab = () => gp.evaluate(() => [...document.querySelectorAll('[role=tab]')].findIndex((t) => t.getAttribute('aria-selected') === 'true'));
      const settled = () => gp.waitForFunction(() => !document.querySelector('.splash') && !document.querySelector('[data-skeleton]'), undefined, { timeout: 20_000 });

      await gp.goto(`${base}/?devUser=880060&bot_screen=settings`);
      await gp.waitForFunction(() => location.pathname === '/settings', undefined, { timeout: 20_000 });
      await settled();
      await gp.getByRole('button', { name: 'back' }).click();
      await gp.waitForTimeout(500);
      check((await path()) === '/', `G1 «Назад» в настройках, открытых кнопкой бота, ведёт на главную (было: уход из приложения): ${await path()}`);

      await gp.goto(g.url('/'));
      await gp.getByRole('button', { name: /Все разделы/ }).click({ timeout: 20_000 });
      await gp.locator('[data-home-sheet="sections"]').waitFor({ timeout: 10_000 });
      await swipe(6, 420, 170, 425);
      check((await gp.locator('[data-home-sheet="sections"]').count()) === 0 && (await path()) === '/', 'G2 свайп от левого края закрывает шторку, экран тот же');
      await gp.getByRole('button', { name: /Все разделы/ }).click();
      await gp.locator('[data-home-sheet="sections"] button', { hasText: 'Настройки' }).click();
      await gp.waitForURL(/\/settings$/, { timeout: 10_000 });
      await settled();
      await swipe(6, 300, 16, 560);
      await swipe(6, 300, 50, 304);
      check((await path()) === '/settings', 'G2 вертикальный жест у края и короткий свайп — не «Назад»');
      await gp.getByRole('button', { name: 'Сохранить', exact: true }).click();
      const toast = gp.locator('[data-toast]');
      await toast.waitFor({ timeout: 10_000 });
      const tb = (await toast.boundingBox())!;
      await swipe(tb.x + tb.width / 2, tb.y + tb.height / 2, tb.x + tb.width / 2, tb.y - 40);
      check((await toast.count()) === 0, 'G5 тост «Сохранено» смахивается вверх (он перекрывал заголовок)');
      await swipe(6, 400, 170, 405);
      check((await path()) === '/', `G2 свайп от края из настроек → главная: ${await path()}`);

      await gp.goto(g.url('/quests'));
      await settled();
      await gp.locator('[role=tab]').first().waitFor({ timeout: 20_000 });
      await swipe(330, 600, 110, 606);
      const t1 = await tab();
      await swipe(110, 600, 330, 606);
      const t0 = await tab();
      await swipe(200, 640, 210, 380);
      check(t1 === 1 && t0 === 0 && (await tab()) === 0 && (await path()) === '/quests', `G3 задания: свайп влево/вправо листает вкладки, вертикальная прокрутка — нет (${t1}, ${t0}, ${await tab()})`);

      await gp.goto(g.url('/shop'));
      await settled();
      const stage = gp.locator('[data-stage-swipe]');
      await stage.waitFor({ timeout: 20_000 });
      const sb = (await stage.boundingBox())!;
      const item = () => gp.evaluate(() => document.querySelector('.action-sheet .line-clamp-2')?.textContent ?? null);
      const mid = sb.y + sb.height / 2;
      await swipe(sb.x + sb.width * 0.8, mid, sb.x + sb.width * 0.2, mid);
      const a = await item();
      await swipe(sb.x + sb.width * 0.8, mid, sb.x + sb.width * 0.2, mid);
      const b = await item();
      await swipe(sb.x + sb.width * 0.2, mid, sb.x + sb.width * 0.8, mid);
      check(!!a && !!b && a !== b && (await item()) === a && (await tab()) === 0, `G4 примерочная: свайп листает вещи, вкладка не меняется (${a} → ${b} → ${await item()})`);
      await gp.locator('.action-sheet button[aria-label]').first().click();
      await gp.evaluate(() => window.scrollTo(0, 380));
      await gp.waitForTimeout(300);
      await swipe(330, 420, 100, 426);
      const shopTab = await tab();
      const chip = gp.locator('.chip-tab').first();
      await chip.waitFor({ timeout: 5_000 });
      const cb = (await chip.boundingBox())!;
      await swipe(320, cb.y + cb.height / 2, 80, cb.y + cb.height / 2);
      check(shopTab === 1 && (await tab()) === 1 && /tab=shop/.test(gp.url()), `G4 гардероб: свайп по экрану → «Магазин», ряд категорий листается сам (${shopTab}, ${await tab()})`);
      await g.context.close();
    });

    // ── H: главная по варианту A — без дублей нижней панели; остальные разделы в шторках; пропуск месяца.
    await soft('H главная A: шторки разделов и тренировки, пропуск', async () => {
      await tp.goto(today.url('/'), { waitUntil: 'networkidle' });
      await tp.getByText('Учиться дальше', { exact: true }).waitFor({ timeout: 20_000 });
      check(await tp.getByText('Быстрый старт', { exact: true }).count() === 0, 'H главная без «Быстрого старта» (дублировал нижнюю панель)');
      check(await tp.locator('[data-pass]').count() === 1, 'H на главной одна карточка пропуска месяца');
      await tp.getByRole('button', { name: /Все разделы/ }).click();
      const sections = tp.locator('[data-home-sheet="sections"] button');
      await sections.first().waitFor({ timeout: 10_000 });
      check(await sections.count() >= 8, `H шторка «Все разделы»: ${await sections.count()} разделов (Żywy polski, экзамены, гардероб, паспорт…)`);
      await tp.keyboard.press('Escape');
      await tp.locator('[data-home-sheet="sections"]').waitFor({ state: 'detached', timeout: 10_000 });
      await tp.locator('section').filter({ hasText: 'Учиться дальше' }).getByRole('button', { name: /Тренировка/ }).click();
      check(await tp.locator('[data-home-sheet="practice"] button').count() === 4, 'H шторка «Тренировка»: 4 режима');
      await tp.keyboard.press('Escape');
      await tp.locator('[data-pass]').click();
      await tp.waitForURL(/\/pass$/, { timeout: 10_000 });
      await tp.locator('[data-season-state]').first().waitFor({ timeout: 20_000 });
      check(true, 'H карточка пропуска ведёт на экран пропуска с сезонами');
      await tp.screenshot({ path: `${SCREENS}/pass-390.png`, fullPage: true });
    });
    await today.context.close();

    // ── A3: шторка города на карте. Прокрутка содержимого и жест закрытия разделены: тянуть можно только за ручку.
    console.log('A3: шторка города');
    const SHEETS = SCREENS;
    mkdirSync(SHEETS, { recursive: true });
    const sheetUser = await userPage('880008');
    const sp = sheetUser.page;
    const dialog = sp.locator('[role="dialog"]').filter({ has: sp.locator('[data-sheet]') });
    /** Ждём, пока пружина шторки остановится (положение верха не меняется). */
    const settle = async () => {
      let prev = Number.NaN;
      for (let i = 0; i < 40; i++) {
        const top = await sp.locator('[data-sheet]').evaluate((el) => el.getBoundingClientRect().top).catch(() => Number.NaN);
        if (Math.abs(top - prev) < 0.5) return;
        prev = top;
        await sp.waitForTimeout(100);
      }
    };
    const openSheet = async () => {
      await sp.locator('[data-current-city]').click();
      await dialog.waitFor({ state: 'visible', timeout: 10_000 });
      await settle();
    };
    const ensureOpen = async () => { if (!(await dialog.count())) await openSheet(); };
    const closed = async () => {
      await dialog.waitFor({ state: 'detached', timeout: 4_000 }).catch(() => {});
      return (await dialog.count()) === 0;
    };

    for (const width of [360, 390, 430]) {
      const tag = `A3 ${width}`;
      const vp = { width, height: 844 };
      await sp.setViewportSize(vp);
      const opened = await soft(`${tag}.1 открытие`, async () => {
        await sp.goto(sheetUser.url('/map'), { waitUntil: 'networkidle' });
        await sp.locator('[data-current-city]').waitFor({ timeout: 20_000 });
        await openSheet();
        check(await dialog.count() === 1 && await dialog.locator('[data-sheet-scroll]').isVisible(), `${tag}.1 клик по [data-current-city] открывает шторку (role=dialog)`);
      });
      if (!opened) {
        softSkipped.push(`${tag}.2–7: не запускались (шторка не открылась)`);
        continue;
      }
      const scroll = dialog.locator('[data-sheet-scroll]');

      await soft(`${tag}.2 прокрутка до последней темы`, async () => {
        await scroll.evaluate((el) => { el.scrollTop = el.scrollHeight; });
        await sp.waitForTimeout(250);
        const m = await scroll.evaluate((el) => ({ top: el.scrollTop, max: el.scrollHeight - el.clientHeight }));
        check(m.top >= m.max - 1, `${tag}.2 содержимое прокручено до конца (${Math.round(m.top)} из ${Math.round(m.max)} px)`);
        const routes = dialog.locator('[data-route]');
        const n = await routes.count();
        check(n > 0, `${tag}.2 в шторке есть строки тем [data-route] (${n} шт.)`);
        const last = await routes.nth(n - 1).boundingBox();
        const area = await scroll.boundingBox();
        check(last && area, `${tag}.2 у последней темы и области прокрутки есть размеры`);
        check(last.y >= area.y - 1 && last.y + last.height <= area.y + area.height + 1, `${tag}.2 последняя тема целиком в видимой области шторки`);
        check(last.x >= 0 && last.y >= 0 && last.x + last.width <= vp.width && last.y + last.height <= vp.height, `${tag}.2 последняя тема целиком внутри viewport ${vp.width}×${vp.height}`);
      });

      await soft(`${tag}.3 CTA не перекрыт`, async () => {
        const go = dialog.locator('[data-city-go]');
        check(await go.isVisible(), `${tag}.3 кнопка [data-city-go] видна в футере шторки`);
        const b = await go.boundingBox();
        check(b, `${tag}.3 у [data-city-go] есть размеры`);
        check(b.x >= 0 && b.y >= 0 && b.x + b.width <= vp.width && b.y + b.height <= vp.height, `${tag}.3 [data-city-go] целиком внутри viewport (y ${Math.round(b.y)}–${Math.round(b.y + b.height)} из ${vp.height})`);
        const top = await go.evaluate((el) => {
          const r = el.getBoundingClientRect();
          const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
          return !!hit && el.contains(hit);
        });
        check(top, `${tag}.3 в центре [data-city-go] нажимается сама кнопка — её ничто не перекрывает`);
      });

      await soft(`${tag}.4 прокрутка не закрывает`, async () => {
        await sp.waitForTimeout(400);
        check(await dialog.count() === 1, `${tag}.4 после прокрутки содержимого шторка осталась открытой`);
        // Дополнительно: жест вниз по содержимому (не за ручку) тоже не должен закрывать шторку.
        const area = await scroll.boundingBox();
        check(area, `${tag}.4 у области прокрутки есть размеры`);
        const x = area.x + 10;
        const y = area.y + 20;
        await sp.mouse.move(x, y);
        await sp.mouse.down();
        for (let i = 1; i <= 16; i++) { await sp.mouse.move(x, y + i * 10); await sp.waitForTimeout(16); }
        await sp.mouse.up();
        await sp.waitForTimeout(600);
        check(await dialog.count() === 1, `${tag}.4 жест вниз на 160 px по содержимому (не за ручку) не закрывает шторку`);
      });

      await soft(`${tag}.7 скриншот`, async () => {
        await ensureOpen();
        await settle();
        await sp.screenshot({ path: `${SHEETS}/sheet-${width}.png` });
        check(true, `${tag}.7 скриншот шторки: test-results/screens/sheet-${width}.png`);
      });

      await soft(`${tag}.5a закрытие ✕`, async () => {
        await ensureOpen();
        await dialog.locator('[data-sheet-close]').click();
        check(await closed(), `${tag}.5 клик по [data-sheet-close] закрывает шторку`);
      });

      await soft(`${tag}.5b закрытие Escape`, async () => {
        await ensureOpen();
        await sp.keyboard.press('Escape');
        check(await closed(), `${tag}.5 клавиша Escape закрывает повторно открытую шторку`);
      });

      await soft(`${tag}.6 drag за ручку`, async () => {
        await ensureOpen();
        const gb = await dialog.locator('[data-sheet-grip]').boundingBox();
        check(gb, `${tag}.6 у ручки [data-sheet-grip] есть размеры`);
        const x = gb.x + gb.width / 2;
        const y = gb.y + gb.height / 2;
        await sp.mouse.move(x, y);
        await sp.mouse.down();
        for (let i = 1; i <= 16; i++) { await sp.mouse.move(x, y + i * 10); await sp.waitForTimeout(16); }
        await sp.mouse.up();
        check(await closed(), `${tag}.6 перетаскивание ручки вниз на 160 px закрывает шторку`);
      });
    }

    // A3.8: у шторці три окремі стани міста (V9 §7): оформлення (CITY_ART), уроки, доступ. Порожній маршрут не відкривається.
    await soft('A3.8 статусы города', async () => {
      await sp.setViewportSize({ width: 390, height: 844 });
      await sp.goto(sheetUser.url('/map'), { waitUntil: 'networkidle' });
      await sp.locator('[data-current-city]').waitFor({ timeout: 20_000 });
      const state = () => dialog.locator('[data-status]').evaluateAll((els) => Object.fromEntries(els.map((e) => [e.getAttribute('data-status'), e.getAttribute('data-ok')])));
      const openCity = async (name: string) => {
        if (await dialog.count()) { await sp.keyboard.press('Escape'); await closed(); }
        // Иллюстрированная карта: кнопка города выбирает его в карточку (Enter после фокуса подводит камеру), «Подробнее» открывает шторку.
        await sp.locator(`[data-spot][aria-label^="${name}:"]`).focus();
        await sp.keyboard.press('Enter');
        await sp.locator(`[data-map-card] [data-map-details]`).click();
        await dialog.waitFor({ state: 'visible', timeout: 10_000 });
        await settle();
      };
      await openSheet();
      const cur = await state();
      check(cur.art === 'true' && cur.lessons === 'true' && cur.access === 'true', `A3.8 текущий город: оформление, уроки и доступ готовы ${JSON.stringify(cur)}`);
      await openCity('Kielce');
      const gw = await state();
      check(gw.art === 'true' && gw.lessons === 'false' && gw.access === 'false', `A3.8 Kielce: рисунок готов (final), уроков нет, город закрыт ${JSON.stringify(gw)}`);
      check(await dialog.locator('[data-city-art="final"] img').count() === 1, 'A3.8 Kielce: баннер — настоящий рисунок, а не общая сцена');
      check(await dialog.locator('[data-city-go]').count() === 0, 'A3.8 Kielce: кнопки «Учить» нет — пустой маршрут не открывается');
      await sp.screenshot({ path: `${SHEETS}/sheet-status-kielce-390.png` });
      // Katowice — город с уроками и панорамой владельца 2026-10-28 (final).
      await openCity('Katowice');
      const kt = await state();
      check(kt.art === 'true' && kt.lessons === 'true', `A3.8 Katowice: оформление готово, уроки есть ${JSON.stringify(kt)}`);
      check(await dialog.locator('[data-city-art="final"] img').count() === 1, 'A3.8 Katowice: баннер — панорама владельца');
      check((kt.access === 'true') === (await dialog.locator('[data-city-go]').count() === 1), `A3.8 Katowice: кнопка «Учить» есть только при открытом доступе (доступ ${kt.access})`);
      await sp.screenshot({ path: `${SHEETS}/sheet-status-katowice-390.png` });
      // Zakopane — без финальной панорамы. Владелец 2026-10-31 попросил фото: временный кадр (shown) показывается,
      // но «оформление» по-прежнему «скоро» (не выдаётся за финальное).
      await openCity('Zakopane');
      const zk = await state();
      const banner = dialog.locator('[data-city-art="interim"]');
      check(zk.art === 'false' && await banner.count() === 1, `A3.8 Zakopane: оформление не выдаётся за готовое ${JSON.stringify(zk)}`);
      check(await banner.locator('img').count() === 1, 'A3.8 Zakopane: в шторке фото города (временный кадр с разрешения владельца)');
      await sp.screenshot({ path: `${SHEETS}/sheet-status-zakopane-390.png` });
      // Rzeszów — так же (решение владельца 2026-10-31): временный кадр виден, оформление «скоро».
      await openCity('Rzeszów');
      const rz = await state();
      const rzBanner = dialog.locator('[data-city-art="interim"]');
      check(rz.art === 'false' && await rzBanner.count() === 1, `A3.8 Rzeszów: оформление не выдаётся за готовое ${JSON.stringify(rz)}`);
      check(await rzBanner.locator('img').count() === 1, 'A3.8 Rzeszów: в шторке фото города (временный кадр с разрешения владельца)');
      await sp.screenshot({ path: `${SHEETS}/sheet-status-rzeszow-390.png` });
    });
    await sheetUser.context.close();

    // ── A4: иллюстрированная карта (ADR-012). Подписи впечены в картинку, поверх — прозрачные кнопки; их рамки относительно
    // картинки должны совпадать с MAP_SPOTS, иначе нажатие «мимо» таблички. Подробные жесты — scripts/map-screens.ts.
    console.log('A4: иллюстрированная карта');
    const pinUser = await userPage('880009');
    const pn = pinUser.page;
    type PinCity = { id: string; slug: string; order: number; namePl: string };
    const pinJourney = (await pinUser.call('GET', '/api/journey')).body as { cities: PinCity[]; currentCityId: string };
    const orderedCities = [...pinJourney.cities].sort((a, b) => a.order - b.order);
    const pinHome = pinJourney.cities.find((c) => c.id === pinJourney.currentCityId);
    check(pinHome && orderedCities.length >= 2, `A4 есть текущий город (${pinHome?.namePl}) и минимум два города для проверки поездки (${orderedCities.length} шт.)`);
    const spotOf = (slug: string) => Object.keys(MAP_SPOTS).find((k) => MAP_SPOTS[k].city === slug)!;
    for (const width of [360, 390, 430]) {
      const tag = `A4 ${width}`;
      await pn.setViewportSize({ width, height: 844 });
      await soft(`${tag} карта`, async () => {
        await pn.goto(pinUser.url('/map'), { waitUntil: 'networkidle' });
        await pn.locator('[data-current-city]').waitFor({ timeout: 20_000 });
        await pn.waitForFunction(() => (document.querySelector('.map-art') as HTMLImageElement | null)?.complete, undefined, { timeout: 20_000 });
        await pn.waitForTimeout(400);
        const geo = await pn.evaluate(({ W }) => {
          const ir = document.querySelector('.map-art')!.getBoundingClientRect();
          const k = W / ir.width;
          const spots = [...document.querySelectorAll<HTMLElement>('[data-spot]')].map((b) => {
            const r = b.getBoundingClientRect();
            return { key: b.dataset.spot!, rect: [(r.left - ir.left) * k, (r.top - ir.top) * k, (r.right - ir.left) * k, (r.bottom - ir.top) * k], label: b.getAttribute('aria-label') ?? '' };
          });
          const here = document.querySelector('[data-map-here]')!;
          const hr = here.getBoundingClientRect();
          const card = document.querySelector('[data-map-card]')!.getBoundingClientRect();
          const hud = document.querySelector('.map-hud')!.getBoundingClientRect();
          return { spots, here: here.getAttribute('data-map-here'), hereVisible: hr.top > hud.bottom - 20 && hr.bottom < card.top, overflow: document.documentElement.scrollWidth > innerWidth + 1 };
        }, { W: MAP_ART.width });
        const off = geo.spots.filter((x) => x.rect.some((v, i) => Math.abs(v - mapHitRect(MAP_SPOTS[x.key])[i]) > 1.5)).map((x) => x.key);
        check(geo.spots.length === Object.keys(MAP_SPOTS).length && off.length === 0, `${tag}.1 ${geo.spots.length} кнопок городов совпадают с табличками картинки${off.length ? ' — мимо: ' + off.join(', ') : ''}`);
        check(geo.spots.every((x) => x.label.length > 3), `${tag}.1 у каждой кнопки есть aria-label`);
        check(geo.here === spotOf(pinHome!.slug) && geo.hereVisible, `${tag}.2 «ты здесь» на ${pinHome!.namePl} и в видимом окне`);
        check(!geo.overflow, `${tag}.2 нет горизонтального переполнения страницы`);
        await pn.screenshot({ path: `${SCREENS}/map-${width}.png` });
      });
      const to = orderedCities[1];
      await soft(`${tag}.travel поездка`, async () => {
        await pn.emulateMedia({ reducedMotion: 'reduce' });
        try {
          await pn.goto(pinUser.url('/map') + `&travel=${orderedCities[0].id},${to.id}`, { waitUntil: 'domcontentloaded' });
          await pn.locator('[data-map-traveler][data-arrived]').waitFor({ timeout: 20_000 });
          const at = await pn.locator('[data-map-traveler]').getAttribute('data-at');
          const want = mapStarPoint(MAP_SPOTS[spotOf(to.slug)]).map(Math.round).join(',');
          check(at === want, `${tag}.3 маркер поездки сразу в ${to.namePl} (${at} = ${want})`);
          check(await pn.locator(`[data-map-card="${spotOf(to.slug)}"]`).count() === 1, `${tag}.3 карточка показывает город прибытия ${to.namePl}`);
          await pn.screenshot({ path: `${SCREENS}/map-travel-${width}.png` });
        } finally {
          await pn.emulateMedia({ reducedMotion: null });
        }
      });
    }
    await pinUser.context.close();

    // ── L1: один образ на всех экранах (ADR-005 §10). Ожидаемые атрибуты считает то же ядро (resolveLook) по me.outfit.wear,
    // а экраны сравниваются и с ним, и между собой. Примерка (data-look-preview="true") в сравнение не входит.
    console.log('L1: один образ на всех экранах');
    type LookRoot = { tag: string; equipped: string | null; items: string | null; pending: string | null; mode: string | null; w: number; h: number; layers: { src: string; ok: boolean; w: number }[] };
    async function lookScreens(devUser: string, grant: string[], shotPrefix: string, widths: number[]) {
      const u = await userPage(devUser);
      const page = u.page;
      await page.addInitScript(() => { (window as unknown as { __name: (f: unknown) => unknown }).__name = (f) => f; });
      for (const slug of grant) {
        await env.DB.prepare("INSERT INTO user_inventory (user_id, item_id, equipped, source) SELECT ?, id, 1, 'e2e' FROM cosmetic_items WHERE slug = ?").bind(u.user.id, slug).run();
      }
      const wear = (await u.call('GET', '/api/me')).body.outfit.wear as Record<string, string>;
      const want = lookDataAttributes(resolveLook(null, wear));
      const tag0 = `L1 ${shotPrefix}`;
      check(grant.every((g) => Object.values(wear).includes(g)), `${tag0} надето на сервере: ${Object.values(wear).sort().join(' ')}`);
      const lessonId = (await u.call('GET', '/api/journey')).body.nextLesson.id as string;
      const screens: [string, string, string][] = [
        ['home', '/', '[data-today]'],
        ['profile', '/profile', '[data-look]'],
        ['wardrobe', '/shop', '[role="tablist"]'],
        ['lesson', `/lesson/${lessonId}`, '[data-action="start"]'],
      ];
      const seen: { screen: string; equipped: string | null; items: string | null }[] = [];
      for (const width of widths) {
        await page.setViewportSize({ width, height: 844 });
        for (const [name, path, ready] of screens) {
          const tag = `${tag0} ${width} ${name}`;
          await soft(tag, async () => {
            await page.goto(u.url(path), { waitUntil: 'networkidle' });
            await page.locator(ready).first().waitFor({ timeout: 20_000 });
            await page.locator('[data-look]:not([data-look-preview="true"])').first().waitFor({ state: 'attached', timeout: 20_000 });
            await page.waitForTimeout(300);
            const roots: LookRoot[] = await page.evaluate(async () => {
              const out: LookRoot[] = [];
              for (const el of Array.from(document.querySelectorAll('[data-look]'))) {
                if (el.getAttribute('data-look-preview') === 'true') continue;
                const r = el.getBoundingClientRect();
                const layers = await Promise.all(Array.from(el.querySelectorAll('[data-look-layer]')).map(async (l) => {
                  const src = l instanceof HTMLImageElement ? l.currentSrc || l.src : (l as SVGImageElement).href.baseVal;
                  const img = l instanceof HTMLImageElement ? l : Object.assign(new Image(), { src });
                  try {
                    await img.decode();
                  } catch {
                    return { src, ok: false, w: 0 };
                  }
                  return { src, ok: img.naturalWidth > 0 && img.naturalHeight > 0, w: img.naturalWidth };
                }));
                out.push({ tag: el.tagName.toLowerCase(), equipped: el.getAttribute('data-look-equipped'), items: el.getAttribute('data-look-items'), pending: el.getAttribute('data-look-pending'), mode: el.getAttribute('data-look-mode'), w: r.width, h: r.height, layers });
              }
              return out;
            });
            check(roots.length > 0, `${tag}: на экране есть Бобек с data-look (${roots.length} шт., ${roots.map((x) => `${x.tag}:${x.mode}`).join(', ')})`);
            for (const [i, x] of roots.entries()) {
              check(x.equipped === want['data-look-equipped'], `${tag} #${i}: data-look-equipped «${x.equipped}» = ядро «${want['data-look-equipped']}»`);
              check(x.items === want['data-look-items'], `${tag} #${i}: data-look-items «${x.items}» = ядро «${want['data-look-items']}»`);
              check(x.pending === want['data-look-pending'], `${tag} #${i}: data-look-pending «${x.pending}» = ядро «${want['data-look-pending']}»`);
              check(x.w > 0 && x.h > 0, `${tag} #${i}: Бобек ненулевого размера (${Math.round(x.w)}×${Math.round(x.h)})`);
              check(x.layers.length > 0 && x.layers.every((l) => l.ok), `${tag} #${i}: растр декодирован (${x.layers.map((l) => `${l.src.split('/').pop()} ${l.w}px ${l.ok ? 'ok' : 'НЕТ'}`).join(', ')})`);
              seen.push({ screen: `${name}@${width}`, equipped: x.equipped, items: x.items });
            }
            if (width === 390) {
              await page.evaluate(() => Promise.all(Array.from(document.images).map((i) => i.decode().catch(() => {}))));
              await page.screenshot({ path: `${SCREENS}/${shotPrefix}-${name}-390.png`, fullPage: name === 'profile' });
            }
          });
        }
      }
      const keys = new Set(seen.map((x) => `${x.equipped}|${x.items}`));
      check(keys.size === 1 && new Set(seen.map((x) => x.screen.split('@')[0])).size === screens.length, `${tag0}: один и тот же образ на ${screens.map((x) => x[0]).join(', ')} (${seen.length} корней, ${widths.join('/')} px)`);
      await u.context.close();
    }
    await soft('L1 костюм', () => lookScreens('880010', ['costume-chef', 'hat-chef', 'glasses-round'], 'look', [360, 390, 430]));
    await soft('L1 стартовый образ', () => lookScreens('880011', [], 'look-default', [390]));

    await soft('L2 гардероб: вещь без визуала', async () => {
      type ShopRow = { id: string; slot: string; assetKey: string; name: { ru: string }; price: number; rewardOnly: boolean; owned: boolean; isPremium: boolean; visualStatus?: string };
      const u = await userPage('880012');
      const page = u.page;
      const shopBody = (await u.call('GET', '/api/shop')).body as { balance: number; items: ShopRow[] };
      check(shopBody.items.every((i) => typeof i.visualStatus === 'string'), 'L2 /shop отдаёт visualStatus у каждой вещи');
      const target = shopBody.items.find((i) => i.slot === 'JACKET' && i.visualStatus === 'pending' && !i.rewardOnly && !i.owned);
      check(target, `L2 есть куртка без живописного слоя в продаже (${target?.id})`);
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(u.url('/shop') + '&tab=shop', { waitUntil: 'networkidle' });
      const card = page.locator('button.item-card', { hasText: target.name.ru });
      await card.waitFor({ timeout: 20_000 });
      check(await card.locator('[data-visual-status="pending"]').count() === 1 && await card.locator('.item-price').count() === 0, `L2 карточка «${target.name.ru}»: метка «Визуал готовится» вместо цены`);
      await card.click();
      const sheet = page.locator('.action-sheet');
      await sheet.waitFor({ timeout: 5_000 });
      check(await sheet.locator('[data-visual-status="pending"]').count() === 1, 'L2 в панели действия метка «Визуал готовится»');
      check(await sheet.locator('button.btn-primary, button.btn-xp').count() === 0, 'L2 в панели действия нет кнопок покупки и Premium');
      const preview = await page.locator('[data-look][data-look-preview="true"]').first().getAttribute('data-look-pending');
      check(preview === toLookItemId(target.assetKey), `L2 примерка помечена data-look-preview, вещь в data-look-pending (${preview}), на Бобеке не рисуется`);
      await page.waitForTimeout(400);
      await page.screenshot({ path: `${SCREENS}/look-wardrobe-pending-390.png` });
      const bought = await u.call('POST', '/api/shop/buy', { itemId: target.id });
      const after = (await u.call('GET', '/api/shop')).body as { balance: number };
      check(bought.status === 409 && bought.body.error === 'visual_pending' && after.balance === shopBody.balance, `L2 покупка вещи без визуала: ${bought.status} ${bought.body.error}, баланс ${shopBody.balance} → ${after.balance}`);
      await u.context.close();
    });

    // ── M2: примерка не сохраняет, отмена возвращает образ, «Снимет: …» = правило equip() сервера, двойной тап по «Купить» — одна покупка.
    console.log('M2: примерка, подтверждение и покупка');
    await soft('M2 примерка и покупка', async () => {
      type ShopRow = { id: string; slot: string; assetKey: string; name: { ru: string }; price: number; owned: boolean; equipped: boolean; visualStatus?: string };
      const u = await userPage('880013');
      const page = u.page;
      for (const [slug, on] of [['costume-chef', 1], ['jacket-denim', 0]] as const) {
        await env.DB.prepare("INSERT INTO user_inventory (user_id, item_id, equipped, source) SELECT ?, id, ?, 'e2e' FROM cosmetic_items WHERE slug = ?").bind(u.user.id, on, slug).run();
      }
      await env.DB.prepare('UPDATE game_wallets SET balance = 500 WHERE user_id = ?').bind(u.user.id).run();
      const wear0 = (await u.call('GET', '/api/me')).body.outfit.wear as Record<string, string>;
      const shop0 = (await u.call('GET', '/api/shop')).body as { balance: number; items: ShopRow[] };
      const by = (key: string) => shop0.items.find((i) => i.assetKey === key)!;
      const jacket = by('jacket-denim');
      const chef = by('costume-chef');
      const winter = by('costume-winter');
      check(jacket?.owned && !jacket.equipped && chef?.equipped && shop0.balance === 500, 'M2 исходно: костюм повара надет, джинсовая куртка куплена и не надета, 500 Złotki');
      const buys: string[] = [];
      page.on('request', (r) => { if (r.method() === 'POST' && r.url().includes('/api/shop/buy')) buys.push(r.url()); });
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(u.url('/shop') + '&tab=shop', { waitUntil: 'networkidle' });
      const stage = page.locator('.wardrobe-stage [data-look]').first();
      const sheet = page.locator('.action-sheet');
      const card = page.locator('button.item-card', { hasText: jacket.name.ru });
      await card.waitFor({ timeout: 20_000 });

      // Примерка и отмена
      await card.click();
      await sheet.waitFor({ timeout: 5_000 });
      const expected = tryOn(wear0, jacket.assetKey);
      check(await stage.getAttribute('data-look-preview') === 'true', 'M2 примерка помечена data-look-preview="true"');
      const removeText = (await sheet.locator('[data-will-remove]').textContent()) ?? '';
      check(expected.removed.includes(toLookItemId(chef.assetKey)) && removeText.includes(chef.name.ru), `M2 «Снимет: …» по правилу equip(): «${removeText}», ядро: ${expected.removed.join(', ')}`);
      await page.waitForTimeout(300);
      await page.screenshot({ path: `${SCREENS}/wardrobe-try-390.png` });
      await sheet.getByRole('button', { name: 'Отменить примерку' }).click();
      await sheet.waitFor({ state: 'detached', timeout: 5_000 });
      const wear1 = (await u.call('GET', '/api/me')).body.outfit.wear;
      check(JSON.stringify(wear1) === JSON.stringify(wear0) && (await stage.getAttribute('data-look-preview')) !== 'true', 'M2 отмена: на сервере образ не изменился, примерка снята со сцены');

      // Надеть: сервер снимает то же, что показала примерка
      await card.click();
      await sheet.waitFor({ timeout: 5_000 });
      await sheet.getByRole('button', { name: 'Надеть' }).click();
      await sheet.waitFor({ state: 'detached', timeout: 10_000 });
      const wear2 = (await u.call('GET', '/api/me')).body.outfit.wear as Record<string, string>;
      check(JSON.stringify(equipmentFromWear(wear2)) === JSON.stringify(expected.equipment), `M2 «Надеть»: на сервере ${equipmentFromWear(wear2).join(', ')} = примерка ${expected.equipment.join(', ')}`);
      await page.waitForTimeout(300);
      check(await stage.getAttribute('data-look-equipped') === lookDataAttributes(resolveLook(null, wear2))['data-look-equipped'], 'M2 после «Надеть» сцена показывает сохранённый образ');

      // Покупка двойным тапом: один запрос, одно списание, панель остаётся с кнопкой «Надеть»
      check(['ready', 'legacy-whole-look'].includes(winter?.visualStatus ?? ''), `M2 зимний образ продаётся (visualStatus ${winter?.visualStatus})`);
      await page.locator('.chip-tab', { hasText: 'Костюмы' }).click();
      const wcard = page.locator('article.costume-card', { hasText: winter.name.ru });
      await wcard.waitFor({ timeout: 10_000 });
      await wcard.getByRole('button', { name: 'Примерить' }).click();
      await sheet.waitFor({ timeout: 5_000 });
      // Два клика в одном такте: React ещё не перерисовал кнопку disabled — как быстрый двойной тап на телефоне.
      await sheet.locator('button.btn-primary').evaluate((b: HTMLButtonElement) => { b.click(); b.click(); });
      await sheet.getByRole('button', { name: 'Надеть' }).waitFor({ timeout: 10_000 });
      const shop3 = (await u.call('GET', '/api/shop')).body as { balance: number; items: ShopRow[] };
      // Баланс может вырасти на награду достижения «первая покупка», поэтому сверяется само списание.
      const tx = await env.DB.prepare("SELECT amount FROM wallet_transactions WHERE user_id = ? AND amount < 0").bind(u.user.id).all<{ amount: number }>();
      const debits = tx.results.map((r) => r.amount);
      check(buys.length === 1 && debits.length === 1 && debits[0] === -winter.price, `M2 двойной тап «Купить»: запросов ${buys.length}, списаний ${debits.length} (${debits.join(', ')}), баланс 500 → ${shop3.balance}`);
      await page.screenshot({ path: `${SCREENS}/wardrobe-bought-390.png` });
      await u.context.close();
    });
    // ── B1: переходы из Telegram-бота. Кнопки бота открывают Mini App с ?bot_screen=<экран>; клиент берёт маршрут из белого списка один раз.
    console.log('B1: переходы из бота');
    const BOT_ROUTES: Record<string, string> = {
      learn: '/learn', map: '/map', dictionary: '/dictionary', slang: '/slang', quests: '/quests', profile: '/profile', achievements: '/achievements', settings: '/settings', grammar: '/grammar',
    };
    const PHONES = [
      { name: 'iPhone 390×844', width: 390, height: 844, platform: 'ios', ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Telegram-iOS' },
      { name: 'Android 360×800', width: 360, height: 800, platform: 'android', ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36 Telegram-Android' },
    ] as const;
    const settled = (page: import('playwright').Page) =>
      page.waitForFunction(() => !document.querySelector('.splash') && !document.querySelector('[data-skeleton]'), undefined, { timeout: 20_000 });
    const where = (page: import('playwright').Page) => page.evaluate(() => ({ path: location.pathname, search: location.search, overflow: document.documentElement.scrollWidth > innerWidth }));
    const { BOT_TOKEN } = await import(root + '/apps/server/test/helpers.ts');

    await soft('B1.1 bot_screen открывает свой экран (iPhone и Android)', async () => {
      const u = await userPage('880020');
      for (const phone of PHONES) {
        const bad: string[] = [];
        await u.page.setViewportSize({ width: phone.width, height: phone.height });
        for (const [name, route] of Object.entries(BOT_ROUTES)) {
          await u.page.goto(`${base}/?devUser=880020&bot_screen=${name}`, { waitUntil: 'domcontentloaded' });
          await u.page.waitForFunction((p) => location.pathname === p, route, { timeout: 20_000 }).catch(() => bad.push(`${name}: путь`));
          await settled(u.page).catch(() => bad.push(`${name}: загрузка`));
          const w = await where(u.page);
          if (w.path !== route) bad.push(`${name}: ${w.path}`);
          if (w.search.includes('bot_screen')) bad.push(`${name}: параметр остался`);
          if (w.overflow) bad.push(`${name}: горизонтальное переполнение`);
          if (await u.page.locator('[data-screen-error], [role="alert"]').count()) bad.push(`${name}: ошибка экрана`);
        }
        check(bad.length === 0, `B1.1 ${phone.name}: девять экранов открываются по bot_screen, параметр убран, без переполнения${bad.length ? ': ' + bad.join('; ') : ''}`);
      }
      await u.page.goto(`${base}/?devUser=880020&bot_screen=quests`, { waitUntil: 'domcontentloaded' });
      await u.page.waitForFunction(() => location.pathname === '/quests', undefined, { timeout: 20_000 });
      await settled(u.page);
      await u.page.screenshot({ path: `${SCREENS}/bot-screen-quests-390.png` });
      // Маршрут из бота применяется один раз: обычная навигация по приложению его не возвращает.
      await u.page.locator('nav a[href="/map"]').click();
      await u.page.waitForFunction(() => location.pathname === '/map', undefined, { timeout: 10_000 });
      await u.page.waitForTimeout(500);
      check((await where(u.page)).path === '/map', 'B1.1 после перехода из бота обычная навигация (на карту) не перебивается повторным bot_screen');
      // Повторное открытие без bot_screen (devUser нужен только стенду: в Telegram вход идёт через initData): второго перехода нет.
      await u.page.goto(`${base}/quests?devUser=880020`, { waitUntil: 'domcontentloaded' });
      await settled(u.page);
      check((await where(u.page)).path === '/quests', 'B1.1 повторное открытие без параметра остаётся на том же экране');
      await u.context.close();
    });

    await soft('B1.2 неизвестные значения не ведут никуда, startapp и premium работают как раньше', async () => {
      const u = await userPage('880021');
      for (const bad of ['evil', '%2Fadmin', 'https%3A%2F%2Fevil.example', '..%2Fmap', 'MAP', '']) {
        await u.page.goto(`${base}/?devUser=880021&bot_screen=${bad}`, { waitUntil: 'domcontentloaded' });
        await u.page.locator('nav a[href="/map"]').waitFor({ timeout: 20_000 });
        check((await where(u.page)).path === '/', `B1.2 bot_screen=${bad || '(пусто)'} — остаёмся на главной`);
      }
      await u.page.goto(`${base}/?devUser=880021&startapp=screen_quests`, { waitUntil: 'domcontentloaded' });
      await u.page.waitForFunction(() => location.pathname === '/quests', undefined, { timeout: 20_000 });
      check(true, 'B1.2 startapp=screen_quests (чат без web_app-кнопок) открывает /quests');
      await u.page.goto(`${base}/?devUser=880021&startapp=ref_abc123&bot_screen=profile`, { waitUntil: 'domcontentloaded' });
      await u.page.waitForFunction(() => location.pathname === '/profile', undefined, { timeout: 20_000 });
      check(true, 'B1.2 startapp=ref_… вместе с bot_screen=profile: реферальный параметр не мешает переходу');
      await u.page.goto(`${base}/?devUser=880021&startapp=premium`, { waitUntil: 'domcontentloaded' });
      await u.page.waitForFunction(() => location.pathname === '/premium', undefined, { timeout: 20_000 });
      check(true, 'B1.2 startapp=premium по-прежнему открывает /premium');
      await u.context.close();
    });

    // Telegram подменён: подписанные initData (сервер проверяет подпись токеном стенда) и start_param.
    async function telegramPage(tgId: number, start: string, phone: (typeof PHONES)[number]) {
      const initData = signInitData({ auth_date: String(Math.floor(Date.now() / 1000)), query_id: 'AAH', user: JSON.stringify({ id: tgId, first_name: 'Ola', language_code: 'ru' }), start_param: start }, BOT_TOKEN);
      const context = await browser.newContext({ viewport: { width: phone.width, height: phone.height }, userAgent: phone.ua, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
      await context.route('https://telegram.org/**', (r) => r.abort());
      const page = await context.newPage();
      page.on('pageerror', (e) => errors.push(e.message));
      await page.addInitScript(`(() => {
        const noop = () => {};
        window.Telegram = { WebApp: {
          initData: ${JSON.stringify(initData)},
          initDataUnsafe: { user: { id: ${tgId}, first_name: 'Ola', language_code: 'ru' }, start_param: ${JSON.stringify(start)} },
          version: '8.0', platform: ${JSON.stringify(phone.platform)}, colorScheme: 'dark', themeParams: {}, isVersionAtLeast: () => true,
          ready: noop, expand: noop, close: noop, onEvent: noop, offEvent: noop, openInvoice: noop, openTelegramLink: noop, openLink: noop, showConfirm: noop,
          disableVerticalSwipes: noop, setHeaderColor: noop, setBackgroundColor: noop, setBottomBarColor: noop,
          BackButton: { show: noop, hide: noop, onClick: noop, offClick: noop },
          HapticFeedback: { impactOccurred: noop, notificationOccurred: noop, selectionChanged: noop },
        } };
      })()`);
      return { context, page };
    }

    for (const [i, phone] of PHONES.entries()) {
      await soft(`B1.3 Telegram-мок ${phone.name}: новичок и повторный запуск`, async () => {
        const tgId = 7_700_000 + i;
        const t = await telegramPage(tgId, 'screen_map', phone);
        await t.page.goto(`${base}/`, { waitUntil: 'domcontentloaded' });
        // Новичок: сначала знакомство, а не экран из start_param.
        await t.page.locator('button.btn-red').first().waitFor({ timeout: 20_000 });
        check((await where(t.page)).path === '/', `B1.3 ${phone.name}: новичок видит знакомство, а не карту`);
        await t.page.locator('button.btn-red').click();
        for (let k = 0; k < 5; k++) {
          await t.page.locator('button.btn-primary').last().click();
          await t.page.waitForTimeout(250);
        }
        await t.page.locator('button.btn-red').click();
        await t.page.waitForFunction(() => location.pathname === '/map', undefined, { timeout: 20_000 });
        await settled(t.page);
        const w = await where(t.page);
        check(w.path === '/map' && !w.overflow, `B1.3 ${phone.name}: после знакомства открыта карта из start_param=screen_map`);
        await t.page.screenshot({ path: `${SCREENS}/bot-newcomer-map-${phone.width}.png` });
        await t.context.close();

        // Повторный запуск: игрок уже прошёл знакомство — сразу нужный экран.
        const again = await telegramPage(tgId, 'screen_quests', phone);
        await again.page.goto(`${base}/`, { waitUntil: 'domcontentloaded' });
        await again.page.waitForFunction(() => location.pathname === '/quests', undefined, { timeout: 20_000 });
        await settled(again.page);
        check(!(await where(again.page)).overflow, `B1.3 ${phone.name}: повторный запуск ведёт сразу на /quests`);
        await again.context.close();
      });
    }

    results.push({ stage: 'A2/A3/A4/L1/M2', softFailures, softSkipped });

    // ── Розпізнавання пристрою (сервер STT вимкнено): лише тренування.
    console.log('Розпізнавання пристрою');
    const device = await userPage('880002', () => {
      (window as unknown as { SpeechRecognition: unknown }).SpeechRecognition = class {
        lang = ''; onend: (() => void) | null = null; onerror: unknown = null; onresult: unknown = null;
        start() { (window as unknown as { __rec: unknown }).__rec = this; }
        stop() { this.onend?.(); }
        abort() {}
      };
    });
    const answersA: string[] = [];
    device.page.on('request', (r) => { if (r.url().endsWith('/answer')) answersA.push(r.url()); });
    const a = await openPronunciation(device);
    check(await micState(device.page) === 'ready', 'стан «Готово» до запису');
    await a.mic.click();
    await device.page.waitForFunction(() => !!(window as unknown as { __rec?: unknown }).__rec);
    await device.page.evaluate(() => (window as unknown as { __rec: { onend: () => void } }).__rec.onend());
    await device.page.locator('[data-mic="silence"]').waitFor();
    check(answersA.length === 0, 'тиша не надсилається як відповідь');
    await a.mic.click();
    const practiceRes = device.page.waitForResponse((r) => r.url().endsWith('/answer'));
    await device.page.evaluate((text) => (window as unknown as { __rec: { onresult: (e: unknown) => void } }).__rec.onresult({ results: [[{ transcript: text }]] }), a.phrase);
    const practice = await (await practiceRes).json();
    check(!practice.correct && practice.practice && practice.matched, 'транскрипт від пристрою — тренування без зарахування, збіг показано');
    await device.page.getByText('Фраза распознана — это тренировка без XP').waitFor();
    check(!(await device.page.getByText(/\+\d+ XP/).count()), 'за тренування XP не показано');
    await device.page.waitForTimeout(700);
    await device.page.screenshot({ path: `${SCREENS}/lesson-practice.png`, fullPage: true });
    await device.context.close();

    // ── Серверне розпізнавання: справжній запис фейкового мікрофона → підписана спроба.
    console.log('Серверне розпізнавання');
    Object.assign(env, { AZURE_STT_ENABLED: 'true', AZURE_SPEECH_KEY: 'e2e-fake-key', AZURE_SPEECH_REGION: 'e2e' });
    const server = await userPage('880003');
    const transcribes: string[] = [];
    server.page.on('request', (r) => { if (r.url().includes('/api/speech/transcribe')) transcribes.push(r.url()); });
    const b = await openPronunciation(server);
    sttPhrase = b.phrase;

    await server.context.setOffline(true);
    await server.page.locator('[data-mic="offline"]').waitFor();
    await b.mic.click();
    check(transcribes.length === 0 && await micState(server.page) === 'offline', 'без мережі — стан «Нет сети», запис не починається');
    await server.context.setOffline(false);
    await server.page.locator('[data-mic="ready"]').waitFor();

    await server.page.evaluate(() => {
      const md = navigator.mediaDevices as MediaDevices & { __real?: MediaDevices['getUserMedia'] };
      md.__real = md.getUserMedia.bind(md);
      md.getUserMedia = () => Promise.reject(new DOMException('denied', 'NotAllowedError'));
    });
    await b.mic.click();
    await server.page.locator('[data-mic="permission"]').waitFor();
    check(transcribes.length === 0, 'відмова в дозволі — стан «Нужно разрешение», без запиту');

    // Тиша: потік із нульовим сигналом (генератор із нульовим підсиленням).
    await server.page.evaluate(() => {
      const md = navigator.mediaDevices as MediaDevices & { __real?: MediaDevices['getUserMedia'] };
      md.getUserMedia = async () => {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.value = 0;
        const dest = ctx.createMediaStreamDestination();
        osc.connect(gain).connect(dest);
        osc.start();
        return dest.stream;
      };
    });
    await b.mic.click();
    await server.page.locator('[data-mic="recording"]').waitFor();
    await server.page.waitForTimeout(1200);
    await b.mic.click();
    await server.page.locator('[data-mic="silence"]').waitFor();
    check(transcribes.length === 0 && sttCalls === 0, 'тиша — стан «Тишина», запис не надіслано до STT');

    // Застосунок згорнули під час запису: доріжки мікрофона зупинені одразу, запис не надіслано.
    await server.page.evaluate(() => {
      const md = navigator.mediaDevices as MediaDevices & { __real?: MediaDevices['getUserMedia']; __last?: MediaStream };
      md.getUserMedia = async (c) => (md.__last = await md.__real!(c));
    });
    await b.mic.click();
    await server.page.locator('[data-mic="recording"]').waitFor();
    // Рядком: tsx обгортає геттер у __name, якого на сторінці немає.
    const hiddenTracks: string[] = await server.page.evaluate(`(() => {
      Object.defineProperty(document, 'visibilityState', { configurable: true, get() { return 'hidden'; } });
      document.dispatchEvent(new Event('visibilitychange'));
      const states = navigator.mediaDevices.__last.getTracks().map((t) => t.readyState);
      delete document.visibilityState;
      document.dispatchEvent(new Event('visibilitychange'));
      return states;
    })()`);
    await server.page.locator('[data-mic="ready"]').waitFor();
    check(hiddenTracks.length > 0 && hiddenTracks.every((s) => s === 'ended') && transcribes.length === 0, `згорнули під час запису — мікрофон вимкнено (${hiddenTracks.join(',')}), запис не надіслано`);

    // Випадкове коротке натискання: «Занадто коротко», не «Тиша», без запиту до STT.
    await b.mic.click();
    await server.page.locator('[data-mic="recording"]').waitFor();
    await b.mic.click();
    await server.page.locator('[data-mic="short"]').waitFor();
    check(transcribes.length === 0 && sttCalls === 0, 'запис коротший за 0,5 с — стан «Слишком коротко», запис не надіслано');

    await server.page.evaluate(() => {
      const md = navigator.mediaDevices as MediaDevices & { __real?: MediaDevices['getUserMedia'] };
      md.getUserMedia = md.__real!;
    });
    const answerRes = server.page.waitForResponse((r) => r.url().endsWith('/answer'));
    await b.mic.click();
    await server.page.locator('[data-mic="recording"]').waitFor();
    await server.page.waitForTimeout(1500);
    await b.mic.click();
    const verified = await (await answerRes).json();
    check(transcribes.length === 1 && /[?&]session=.+&item=/.test(transcribes[0]) && sttCalls === 1, 'запис прив’язано до сесії й завдання, STT викликано один раз');
    check(verified.correct && verified.verified, 'підписана серверна спроба зарахована');
    await server.page.getByText(/\+\d+ XP/).waitFor();
    check(true, 'XP показано лише за підтверджену спробу');
    await server.page.waitForTimeout(700);
    await server.page.screenshot({ path: `${SCREENS}/lesson-verified.png`, fullPage: true });
    results.push({ microphone: 'device recognition simulated by events; server path recorded from Chromium fake microphone (WAV tone), Azure STT stubbed', sttCalls });
    await server.context.close();

    // Намірно зламаний чанк Shop.tsx: React у dev-режимі дублює помилку, перехоплену межею, у pageerror.
    const unexpected = errors.filter((e) => !e.includes('/src/screens/Shop.tsx'));
    check(unexpected.length === 0, `без несподіваних помилок сторінки${unexpected.length ? ': ' + unexpected.join(' | ') : ''}`);
    writeFileSync(resolve(OUT, 'browser-results.json'), JSON.stringify({ results, errors }, null, 2));
    check(
      softFailures.length === 0 && softSkipped.length === 0,
      softFailures.length || softSkipped.length
        ? `A2/A3/A4/L1/M2/B1: упало сценариев ${softFailures.length}, не запускалось ${softSkipped.length}\n  - ${[...softFailures, ...softSkipped].join('\n  - ')}`
        : 'A2/A3/A4/L1/M2/B1: все сценарии пройдены',
    );
  } finally {
    globalThis.fetch = realFetch;
    await browser.close();
    await stand.stop();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
