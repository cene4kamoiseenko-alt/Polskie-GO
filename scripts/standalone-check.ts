/**
 * Вход вне Telegram в настоящем браузере (Chromium; не Android и не Telegram): экран приветствия, гость, вход по коду из Telegram, код в настройках, Premium без Stars,
 * манифест и значки, страницы /privacy и /delete-account, service worker с офлайн-страницей.
 *
 *   node --import tsx scripts/standalone-check.ts           → test-results/standalone/*.png
 *   (service worker проверяется на сборке apps/web/dist: сначала `npm run build:web`; нет сборки — эта часть пропускается и это печатается)
 *
 * `?standalone=1` на localhost включает тот же вход, что в Android-приложении: без него localhost работает через /api/auth/dev (тесты и разработка).
 */
import { createRequire } from 'node:module';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromiumPath, startStand } from './lib/stand';

const root = process.cwd();
const require = createRequire(root + '/package.json');
const OUT = resolve(root, 'test-results/standalone');
const failures: string[] = [];
const check = (ok: unknown, what: string) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) failures.push(what);
};

async function main() {
  const { chromium } = require('playwright') as typeof import('playwright');
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: chromiumPath(chromium), args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const pageErrors: string[] = [];
  const newPage = async (locale = 'ru-RU') => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale });
    const page = await context.newPage();
    page.on('pageerror', (e) => pageErrors.push(e.message));
    return { context, page };
  };

  // ── Часть 1: Vite dev ──
  const stand = await startStand({ ui: 'dev' });
  try {
    const base = stand.base;
    const url = (path: string) => `${base}${path}${path.includes('?') ? '&' : '?'}standalone=1`;

    // 1. Первый запуск: приветствие.
    const a = await newPage();
    await a.page.goto(url('/'));
    await a.page.locator('[data-welcome]').waitFor({ timeout: 30_000 });
    check(await a.page.locator('h1').innerText().then((t) => /POLSKI GO/.test(t)), '1. первый запуск вне Telegram: экран приветствия, заголовок «POLSKI GO»');
    check((await a.page.locator('[data-welcome-guest]').count()) === 1 && (await a.page.locator('[data-welcome-have-code]').count()) === 1, '1. две кнопки: «Начать» и «Я уже играю в Telegram»');
    check(await a.page.locator('a[href^="/privacy"]').count(), '1. ссылка на политику конфиденциальности');
    check((await a.page.evaluate(() => document.documentElement.scrollWidth)) <= 390, '1. нет горизонтальной прокрутки на 390 px');
    await a.page.screenshot({ path: `${OUT}/welcome.png` });

    // 2. Гость.
    await a.page.locator('[data-welcome-guest]').click();
    await a.page.locator('[data-welcome]').waitFor({ state: 'detached', timeout: 30_000 });
    const stored = await a.page.evaluate(() => ({ key: localStorage.getItem('pg_device'), auth: JSON.parse(localStorage.getItem('pg_auth') ?? 'null') as { owner: string; token: string } | null }));
    check(stored.key?.startsWith('pgd_'), '2. «Начать»: ключ устройства сохранён (pgd_…)');
    check(stored.auth?.owner === 'device' && !!stored.auth?.token, '2. токен сохранён с владельцем «device»');
    const me = await a.page.evaluate(async (t) => (await fetch('/api/me', { headers: { authorization: `Bearer ${t}` } })).json(), stored.auth!.token);
    check(me?.id || me?.user?.id, '2. профиль гостя открывается');
    await a.page.screenshot({ path: `${OUT}/guest-first-screen.png` });

    // 3. Повторный запуск: приветствия нет.
    await a.page.reload();
    await a.page.waitForTimeout(1500);
    check((await a.page.locator('[data-welcome]').count()) === 0, '3. после перезапуска приветствия нет: вход по сохранённому ключу');
    // Токен истёк: сервер отвечает 401 — вход обновляется по ключу устройства.
    await a.page.evaluate(() => localStorage.setItem('pg_auth', JSON.stringify({ token: 'bad.token', owner: 'device', exp: Date.now() + 86_400_000 })));
    await a.page.reload();
    await a.page.waitForTimeout(2000);
    check((await a.page.locator('[data-welcome]').count()) === 0, '3. просроченный токен: вход заново по ключу, без приветствия');

    // 4. Вход по коду из Telegram.
    const tgUser = await stand.login();
    const made = await tgUser.call('POST', '/api/me/link-code');
    check(made.status === 200 && /^[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(made.body.code), `4. игрок Telegram получил код (${made.status})`);
    const b = await newPage();
    await b.page.goto(url('/'));
    await b.page.locator('[data-welcome-have-code]').click();
    await b.page.locator('[data-welcome-code]').fill('AAAA-BBBB');
    await b.page.locator('[data-welcome-submit]').click();
    await b.page.locator('[data-welcome-error]').waitFor({ timeout: 15_000 });
    check(true, '4. неверный код: показано сообщение, приложение не упало');
    await b.page.locator('[data-welcome-code]').fill(made.body.code);
    await b.page.locator('[data-welcome-submit]').click();
    await b.page.locator('[data-welcome]').waitFor({ state: 'detached', timeout: 30_000 });
    const linked = await b.page.evaluate(() => JSON.parse(localStorage.getItem('pg_auth') ?? 'null') as { token: string } | null);
    const meLinked = await b.page.evaluate(async (t) => (await fetch('/api/me', { headers: { authorization: `Bearer ${t}` } })).json(), linked!.token);
    check((meLinked?.id ?? meLinked?.user?.id) === tgUser.user.id, '4. код принят: устройство вошло в аккаунт игрока Telegram');
    const again = await b.page.evaluate(async (code) => (await fetch('/api/auth/link', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ code }) })).status, made.body.code);
    check(again === 400, '4. тот же код второй раз не работает (400)');

    // 5. Настройки и Premium у вошедшего игрока.
    await tgUser.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A0', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: null });
    await b.page.goto(url('/settings'));
    await b.page.locator('[data-link-get]').waitFor({ timeout: 30_000 });
    await b.page.locator('[data-link-get]').click();
    await b.page.locator('[data-link-code]').waitFor({ timeout: 15_000 });
    check(/^[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(await b.page.locator('[data-link-code]').innerText()), '5. настройки: «Получить код» показывает код переноса');
    check((await b.page.locator('[data-privacy-link]').getAttribute('href'))?.startsWith('/privacy?lang='), '5. настройки: ссылка на политику конфиденциальности');
    await b.page.screenshot({ path: `${OUT}/settings-link.png`, fullPage: true });
    await b.page.goto(url('/premium'));
    await b.page.locator('[data-premium-store-note]').waitFor({ timeout: 30_000 });
    check((await b.page.locator('.btn-xp').count()) === 0, '5. Premium вне Telegram: кнопки покупки Stars нет, есть пояснение');
    check(!/Stars/i.test(await b.page.locator('main').innerText()), '5. Premium вне Telegram: слова «Stars» на экране нет');
    await b.page.screenshot({ path: `${OUT}/premium-standalone.png`, fullPage: true });

    // 6. Статические файлы приложения и страницы.
    const get = async (path: string) => b.page.evaluate(async (p) => { const r = await fetch(p); return { status: r.status, type: r.headers.get('content-type') ?? '', text: await r.text() }; }, path);
    const man = JSON.parse((await get('/manifest.webmanifest')).text) as { name: string; start_url: string; display: string; icons: { src: string; sizes: string; purpose: string }[] };
    check(man.name === 'POLSKI GO' && man.display === 'standalone' && man.start_url.includes('source='), '6. манифест: имя, standalone, адрес запуска');
    check(man.icons.some((i) => i.sizes === '512x512' && i.purpose === 'maskable') && man.icons.some((i) => i.sizes === '192x192'), '6. манифест: значки 192 и 512 maskable');
    for (const icon of man.icons) {
      const r = await b.page.evaluate(async (src) => { const x = await fetch(src); return { s: x.status, t: x.headers.get('content-type') }; }, icon.src);
      check(r.s === 200 && /image\/png/.test(r.t ?? ''), `6. значок ${icon.src} отдаётся как PNG`);
    }
    const off = await get('/offline.html');
    check(off.status === 200 && /Немає інтернету/.test(off.text), '6. /offline.html есть');
    check((await get('/sw.js')).status === 200, '6. /sw.js есть');
    const priv = await get('/privacy?lang=ru');
    check(priv.status === 200 && priv.type.includes('text/html') && /Политика конфиденциальности/.test(priv.text), '6. /privacy отдаётся Worker-ом (не оболочкой приложения)');
    const del = await get('/delete-account?lang=en');
    check(del.status === 200 && /Delete account/.test(del.text), '6. /delete-account отдаётся');
    const links = await get('/.well-known/assetlinks.json');
    check(links.status === 200 && Array.isArray(JSON.parse(links.text)), '6. /.well-known/assetlinks.json — JSON-список');

    // 7. Удаление аккаунта забывает устройство: приветствие снова.
    await b.page.goto(url('/settings'));
    await b.page.locator('button', { hasText: /Удалить аккаунт/ }).first().click();
    await b.page.locator('.btn-red').click();
    await b.page.waitForTimeout(2500);
    await b.page.waitForLoadState();
    check((await b.page.evaluate(() => localStorage.getItem('pg_device'))) === null, '7. после удаления аккаунта ключ устройства забыт');
    await a.context.close();
    await b.context.close();
  } finally {
    await stand.stop();
  }

  // ── Часть 2: сборка (service worker) ──
  if (!existsSync(resolve(root, 'apps/web/dist/sw.js'))) {
    console.log('SKIP service worker: нет apps/web/dist/sw.js (запустите `npm run build:web`)');
  } else {
    const dist = await startStand({ ui: 'dist' });
    try {
      const c = await newPage('uk-UA');
      await c.page.goto(`${dist.base}/?standalone=1`);
      await c.page.locator('[data-welcome]').waitFor({ timeout: 30_000 });
      const reg = await c.page.evaluate(async () => {
        const r = await navigator.serviceWorker.ready;
        return { scope: r.scope, state: r.active?.state };
      });
      check(!!reg.scope && reg.state === 'activated', `7. service worker зарегистрирован и активен (${reg.scope})`);
      await c.context.setOffline(true);
      await c.page.goto(`${dist.base}/?standalone=1`).catch(() => undefined);
      check(/Немає інтернету/.test(await c.page.locator('body').innerText()), '7. без сети вместо пустого экрана — страница «Немає інтернету»');
      await c.page.screenshot({ path: `${OUT}/offline.png` });
      await c.context.setOffline(false);
      await c.page.goto(`${dist.base}/?standalone=1`);
      await c.page.locator('[data-welcome]').waitFor({ timeout: 30_000 });
      check(true, '7. сеть вернулась: приложение открывается как обычно');
      await c.context.close();
    } finally {
      await dist.stop();
    }
  }

  check(pageErrors.length === 0, `нет ошибок страницы (${pageErrors.slice(0, 3).join(' | ')})`);
  await browser.close();
  console.log(failures.length ? `\nПРОВАЛЕНО: ${failures.length}` : '\nВсе проверки пройдены');
  process.exit(failures.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
