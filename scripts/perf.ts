/**
 * Замір швидкодії Mini App на продакшн-збірці (apps/web/dist) з локальною D1 і API в цьому ж процесі.
 * Умови: RTT 80 мс, 9 Мбіт/с вниз / 1,5 Мбіт/с вгору, CPU ×4 (CDP), вікно 390×844, вільні порти.
 * Це headless Chromium на сервері, а не телефон і не Telegram: цифри — для порівняння «до/після», не для обіцянок.
 *
 * Запуск: npm run perf            (спершу збирає інтерфейс; --no-build — узяти наявний dist)
 * Результат: test-results/perf/perf.json, водоспад холодного старту waterfall.json, cold.har.
 */
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromiumPath, startStand } from './lib/stand';

const root = process.cwd();
const require = createRequire(root + '/package.json');
const OUT = resolve(root, 'test-results/perf');
const RTT = Number(process.env.RTT ?? 80);
const CPU = Number(process.env.CPU ?? 4);

type Page = import('playwright').Page;

/** Екран готовий: немає заставки й жодного скелетона (.skeleton), є нижня навігація (або вказаний селектор). */
async function ready(page: Page, extra?: string) {
  await page.waitForFunction(
    (sel) => !document.querySelector('.splash') && !document.querySelector('.skeleton') && !!document.querySelector(sel ?? 'nav a[href="/"]'),
    extra,
    { timeout: 60_000, polling: 16 },
  );
}

/** Кадри протягом ms: найдовша пауза між кадрами та кількість пауз > 50 мс (видимі ривки). */
const FRAMES = `(ms) => new Promise((res) => { const ts = []; const t0 = performance.now();
  const f = (t) => { ts.push(t); if (t - t0 < ms) requestAnimationFrame(f); else { let max = 0, long = 0;
    for (let i = 1; i < ts.length; i++) { const d = ts[i] - ts[i - 1]; max = Math.max(max, d); if (d > 50) long++; }
    res({ frames: ts.length, maxGapMs: Math.round(max), gapsOver50: long }); } };
  requestAnimationFrame(f); })`;

/**
 * Межі продуктивності (див. кінець main). Змінювати свідомо: з поясненням у PROJECT_PROGRESS.md.
 * Шум одного прогону headless Chromium на сервері — ±250 мс (замір 2026-10-31: та сама збірка 2429–2909 мс),
 * тому межі часу — над найгіршим із 7 прогонів; обсяги (JS, картинки) стабільні й ловлять справжнє зростання.
 */
const BUDGET = { coldReadyMs: 3000, coldLcpMs: 2500, coldJsKb: 760, coldImagesKb: 800, warmReadyMs: 1500 };

async function main() {
  if (!process.argv.includes('--no-build') && !process.env.PERF_DIST) {
    const { build } = await import(root + '/node_modules/vite/dist/node/index.js');
    await build({ root: root + '/apps/web', configFile: root + '/apps/web/vite.config.ts', logLevel: 'warn' });
  }
  mkdirSync(OUT, { recursive: true });
  const { chromium } = require('playwright') as typeof import('playwright');
  // PERF_DIST — інша збірка для порівняння «до/після» (наприклад, зібрана зі старого коміту).
  const stand = await startStand({ ui: 'dist', dist: process.env.PERF_DIST });
  const executablePath = chromiumPath(chromium);
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}), args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const out: Record<string, unknown> = { conditions: { rttMs: RTT, downMbps: 9, upMbps: 1.5, cpuSlowdown: CPU, viewport: '390x844', build: 'apps/web/dist (vite build)' } };

  try {
    const u = await stand.login();
    await u.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A0', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: null });
    const lessonId = (await u.call('GET', '/api/journey')).body.nextLesson.id as string;
    const devUser = '770001';
    const url = (path: string) => `${stand.base}${path}?devUser=${devUser}`;

    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, recordHar: { path: resolve(OUT, 'cold.har'), content: 'omit' } });
    await context.addInitScript(({ token, devUser }) => {
      localStorage.setItem('pg_auth', JSON.stringify({ token, owner: `dev:${devUser}`, exp: Date.now() + 86_400_000 }));
      // Довгі задачі й LCP збираємо від самого початку завантаження.
      const w = window as unknown as { __tbt: number; __long: number; __lcp: number };
      w.__tbt = 0; w.__long = 0; w.__lcp = 0;
      try {
        new PerformanceObserver((l) => { for (const e of l.getEntries()) { w.__long++; w.__tbt += Math.max(0, e.duration - 50); } }).observe({ type: 'longtask', buffered: true });
        new PerformanceObserver((l) => { for (const e of l.getEntries()) w.__lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
      } catch { /* немає підтримки */ }
    }, { token: u.token, devUser });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: RTT, downloadThroughput: (9_000_000 / 8), uploadThroughput: (1_500_000 / 8) });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU });

    // Рядком, а не функцією: tsx обгортає іменовані функції в __name, якого немає на сторінці.
    const vitals = () => page.evaluate(`(() => {
      const w = window;
      const res = performance.getEntriesByType('resource');
      const fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? null;
      const kb = (f) => Math.round(res.filter(f).reduce((n, r) => n + r.transferSize, 0) / 1024);
      return {
        fcpMs: fcp && Math.round(fcp), lcpMs: Math.round(w.__lcp), longTasks: w.__long, totalBlockingMs: Math.round(w.__tbt),
        requests: res.length, apiRequests: res.filter((r) => r.name.includes('/api/')).length,
        transferKb: { js: kb((r) => r.name.endsWith('.js')), css: kb((r) => r.name.endsWith('.css')), images: kb((r) => /\\.(webp|png|svg)$/.test(r.name)), fonts: kb((r) => r.name.endsWith('.woff2')), api: kb((r) => r.name.includes('/api/')) },
      };
    })()`) as Promise<Record<string, unknown>>;

    // Холодний старт: порожній кеш браузера, збережений токен (як повторний вхід із Telegram).
    let t = Date.now();
    await page.goto(url('/'));
    await ready(page);
    out.cold_start = { readyMs: Date.now() - t, ...(await vitals()) };
    const waterfall = await page.evaluate(() => (performance.getEntriesByType('resource') as PerformanceResourceTiming[]).map((r) => ({
      url: r.name.replace(location.origin, ''), type: r.initiatorType, startMs: Math.round(r.startTime), durationMs: Math.round(r.duration), kb: Math.round(r.transferSize / 1024),
    })));
    writeFileSync(resolve(OUT, 'waterfall.json'), JSON.stringify(waterfall, null, 1));

    // Повторне відкриття: кеш браузера є, статика перевіряється (ETag) або береться з кешу (_headers).
    t = Date.now();
    await page.reload();
    await ready(page);
    out.warm_reopen = { readyMs: Date.now() - t, ...(await vitals()) };

    // Перемикання вкладок: від натискання до готового екрана + плавність першої секунди.
    const tabs: Record<string, unknown>[] = [];
    // Пауза, як у людини після відкриття: фонова передзавантажка екранів встигає відпрацювати.
    await page.waitForTimeout(2000);
    let calls: string[] = [];
    page.on('request', (r) => { if (r.url().includes('/api/')) calls.push(r.url().replace(/^.*\/api/, '').split('?')[0]); });
    for (const path of ['/map', '/learn', '/quests', '/profile', '/', '/map', '/']) {
      calls = [];
      t = Date.now();
      const frames = page.evaluate(`(${FRAMES})(1000)`);
      await page.click(`nav a[href="${path}"]`);
      await page.waitForURL((u) => new URL(u).pathname === path);
      await ready(page);
      const readyMs = Date.now() - t;
      tabs.push({ path, readyMs, ...((await frames) as object), api: [...calls] });
    }
    out.tabs = tabs;

    // Урок: перехід, вступ, перше завдання; відповіді на завдання з варіантами.
    t = Date.now();
    await page.goto(url('/lesson/' + lessonId));
    await page.waitForSelector('button.btn-primary', { timeout: 60_000 });
    const lessonIntroMs = Date.now() - t;
    t = Date.now();
    await page.click('button.btn-primary');
    await page.waitForSelector('main h2', { timeout: 60_000 });
    out.lesson = { openToIntroMs: lessonIntroMs, introToFirstTaskMs: Date.now() - t };
    const answers: unknown[] = [];
    for (let i = 0; i < 6 && answers.length < 3; i++) {
      const opt = page.locator('button.option:not([disabled])').first();
      const checkBtn = page.getByRole('button', { name: 'Проверить' });
      if ((await opt.count()) && (await checkBtn.count())) {
        const selectMs = await page.evaluate(() => new Promise<number>((res) => {
          const el = document.querySelector('button.option:not([disabled])') as HTMLElement;
          const t0 = performance.now();
          const mo = new MutationObserver(() => { mo.disconnect(); requestAnimationFrame(() => res(Math.round(performance.now() - t0))); });
          mo.observe(document.body, { attributes: true, subtree: true, childList: true });
          el.click();
          setTimeout(() => res(-1), 3000);
        }));
        t = Date.now();
        await checkBtn.click();
        await page.waitForSelector('.feedback-panel', { timeout: 30_000 });
        answers.push({ selectMs, checkToFeedbackMs: Date.now() - t });
      } else {
        // Інший тип завдання — пропускаємо, якщо можна, інакше зупиняємось.
        const skip = page.getByRole('button', { name: /Не могу сейчас|Не можу|Продолжить без/ });
        if (!(await skip.count())) break;
        await skip.first().click();
        await page.waitForSelector('.feedback-panel', { timeout: 30_000 });
      }
      await page.getByRole('button', { name: 'Далее' }).click();
      await page.waitForTimeout(400);
    }
    (out.lesson as Record<string, unknown>).answers = answers;
    await context.close();
  } finally {
    await browser.close();
    await stand.stop();
  }
  writeFileSync(resolve(OUT, 'perf.json'), JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2));

  // Бюджет: регресія валить прогін (код 1). PERF_BUDGET=off — лише виміряти (наприклад, для PERF_DIST зі старою збіркою).
  if (process.env.PERF_BUDGET !== 'off') {
    const cold = out.cold_start as { readyMs: number; lcpMs: number; transferKb: { js: number; images: number } };
    const warm = out.warm_reopen as { readyMs: number };
    const over = (
      [
        ['холодний старт, мс', cold.readyMs, BUDGET.coldReadyMs],
        ['LCP холодного старту, мс', cold.lcpMs, BUDGET.coldLcpMs],
        ['JS холодного старту, КБ', cold.transferKb.js, BUDGET.coldJsKb],
        ['картинки холодного старту, КБ', cold.transferKb.images, BUDGET.coldImagesKb],
        ['повторне відкриття, мс', warm.readyMs, BUDGET.warmReadyMs],
      ] as [string, number, number][]
    ).filter(([, v, max]) => v > max);
    for (const [name, v, max] of over) console.error(`ПЕРЕВИЩЕНО: ${name} ${v} > ${max}`);
    if (over.length) process.exit(1);
    console.log('Бюджет продуктивності: у межах');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
