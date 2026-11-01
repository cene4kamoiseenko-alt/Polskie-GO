/**
 * Экран загрузки в реальном браузере (Chromium, не Telegram на iPhone / Android): слои владельца 2026-11-01, docs/design/v19/loading.
 *
 *   node --import tsx scripts/splash-screens.ts   → test-results/splash-screens/*.png
 *
 * 1. Загрузка на 320 / 360 / 390 / 430: сцена накрывает экран (cover), логотип, Бобек и карточка целиком в кадре, карточка не закрывает Бобека,
 *    нет горизонтальной прокрутки, шаг и процент — настоящие (профиль задержан, значит «шаг 2 из 3»), «Меньше анимации» гасит все движения.
 * 2. Все 15 фраз × 3 языка на 320 и 360: не длиннее двух строк (строки не обрезаются).
 * 3. Ошибка сервера, нет сети (значок wi-fi, «Повторить» в кадре), медленный профиль (честное «связь медленная» и одна кнопка).
 * 4. Мгновенная заставка index.html (без JS) и заставка React: логотип на одном и том же месте с точностью до пикселя — без прыжка.
 * 5. Знакомство: сцена приподнята, логотип цел, слоган и шаги под ним, реплика и кнопки в кадре.
 * 6. Dev-темы ?splash=sunset | adventure (в сборку не попадают); тема soft не берётся.
 * 0. Слой Бобека (файл): вырезка архива обрезала лапы и оставляла по их краю просвечивающие серые полосы (владелец увидел на телефоне 2026-11-01) —
 *    внутри силуэта нет полупрозрачных пикселей, лапы достроены ниже обреза мастера.
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromiumPath, startStand } from './lib/stand';
import { en } from '../apps/web/src/i18n/en';
import { ru } from '../apps/web/src/i18n/ru';
import { uk } from '../apps/web/src/i18n/uk';

const root = process.cwd();
const require = createRequire(root + '/package.json');
const OUT = resolve(root, 'test-results/splash-screens');
const SIZES: [number, number][] = [[320, 568], [360, 740], [390, 844], [430, 932]];

const failures: string[] = [];
const check = (ok: unknown, what: string) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) failures.push(what);
};

type Box = { x: number; y: number; w: number; h: number; r: number; b: number };
/** Слой Бобека выше мастера на 46 px прозрачного запаса вниз (достроенные лапы): видимая часть — до 575 из 606 px слоя (низ лап ≈ 1215 из кадра 1672). */
const VISIBLE = 575 / 606;

/** Слой Бобека как файл: нет просвечивающих мест внутри силуэта, лапы достроены (см. scripts/build-splash-art.mjs, repairBobek). */
async function checkBobekLayer(theme: string, expected: { w: number; h: number }, pawsRebuilt = true) {
  const sharp = require('sharp');
  const { data, info } = await sharp(resolve(root, `apps/web/src/${theme === 'royal' ? 'assets/splash' : 'dev/splash-themes'}/${theme}/bobek.webp`)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  check(w === expected.w && h === expected.h, `слой Бобека ${theme}: ${w}×${h} (мастер + 46 px запаса вниз = ${expected.w}×${expected.h})`);
  const a = (x: number, y: number) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : data[(y * w + x) * 4 + 3]);
  let interior = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v = a(x, y);
      if (v <= 8 || v === 255) continue;
      let edge = false;
      for (let dy = -4; dy <= 4 && !edge; dy++) for (let dx = -4; dx <= 4; dx++) if (a(x + dx, y + dy) <= 8) { edge = true; break; }
      if (!edge) interior++;
    }
  }
  check(interior === 0, `слой Бобека ${theme}: внутри силуэта нет просвечивающих пикселей (${interior})`);
  // У adventure вырезка лап не обрезала (они целиком в мастере): достраивать нечего, запас вниз пустой.
  if (!pawsRebuilt) return;
  let low = 0;
  for (let y = h - 36; y < h; y++) for (let x = 0; x < w; x++) if (a(x, y) >= 200) low++;
  check(low >= 300, `слой Бобека ${theme}: лапы достроены ниже обреза мастера (${low} плотных пикселей в нижних 36 строках)`);
}

async function main() {
  await checkBobekLayer('royal', { w: 528, h: 606 });
  await checkBobekLayer('sunset', { w: 509, h: 613 });
  await checkBobekLayer('adventure', { w: 552, h: 649 }, false);
  const { chromium } = require('playwright') as typeof import('playwright');
  const stand = await startStand({ ui: 'dev' });
  const { base, login } = stand;
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: chromiumPath(chromium), args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const pageErrors: string[] = [];

  /** Пользователь с профилем (по умолчанию — прошедший знакомство); страница с токеном в localStorage. */
  async function userPage(devUser: string, size: [number, number], opts: { onboarded?: boolean; locale?: string; reduced?: 'reduce' | 'no-preference' } = {}) {
    const u = await login();
    if (opts.onboarded !== false) await u.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A0', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: null });
    const context = await browser.newContext({ viewport: { width: size[0], height: size[1] }, deviceScaleFactor: 2, locale: opts.locale ?? 'ru-RU', reducedMotion: opts.reduced ?? 'no-preference' });
    const page = await context.newPage();
    page.on('pageerror', (e) => pageErrors.push(e.message));
    await page.addInitScript(({ token, devUser }) => {
      localStorage.setItem('pg_auth', JSON.stringify({ token, owner: `dev:${devUser}`, exp: Date.now() + 86_400_000 }));
    }, { token: u.token, devUser });
    return { ...u, page, context, url: (path = '/') => `${base}${path}${path.includes('?') ? '&' : '?'}devUser=${devUser}` };
  }
  const box = (p: import('playwright').Page, sel: string) =>
    p.locator(sel).first().evaluate((el): Box => {
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height, r: r.right, b: r.bottom };
    });
  const holdMe = (p: import('playwright').Page, ms: number) =>
    p.route('**/api/me', async (r) => {
      await new Promise((ok) => setTimeout(ok, ms));
      await r.continue().catch(() => {});
    });

  try {
    // ── 1. Загрузка на четырёх размерах ──
    let n = 880100;
    for (const [w, h] of SIZES) {
      const u = await userPage(String(++n), [w, h]);
      await holdMe(u.page, 12_000);
      await u.page.goto(u.url('/'));
      await u.page.locator('.splash-card').waitFor({ timeout: 20_000 });
      await u.page.waitForTimeout(1400);
      const tag = `${w}px`;
      const stage = await box(u.page, '.splash-stage');
      check(Math.abs(stage.w / stage.h - 941 / 1672) < 0.004, `${tag}: сцена держит пропорции кадра 941×1672 (${(stage.w / stage.h).toFixed(4)})`);
      check(stage.x <= 1 && stage.y <= 1 && stage.r >= w - 1 && stage.b >= h - 1, `${tag}: сцена накрывает экран (cover): ${Math.round(stage.x)},${Math.round(stage.y)} … ${Math.round(stage.r)},${Math.round(stage.b)}`);
      const logo = await box(u.page, '.splash-logo');
      check(logo.x >= 0 && logo.r <= w && logo.y >= 0, `${tag}: логотип целиком в кадре (${Math.round(logo.x)}…${Math.round(logo.r)} из ${w})`);
      const beaver = await box(u.page, '.splash-beaver');
      check(beaver.x >= 0 && beaver.r <= w && beaver.b <= h, `${tag}: Бобек целиком в кадре`);
      const card = await box(u.page, '.splash-card');
      check(card.x >= 0 && card.r <= w && card.b <= h, `${tag}: карточка в кадре (${Math.round(card.x)}…${Math.round(card.r)} из ${w}, низ ${Math.round(card.b)} из ${h})`);
      const feet = beaver.y + beaver.h * VISIBLE;
      const overlap = feet - card.y;
      check(overlap <= beaver.h * VISIBLE * 0.06, `${tag}: карточка почти не заходит на Бобека (перекрытие ${Math.round(overlap)} px из ${Math.round(beaver.h * VISIBLE)})`);
      check(card.y >= logo.b, `${tag}: карточка ниже логотипа`);
      check(await u.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${tag}: нет горизонтальной прокрутки`);
      const imgs = await u.page.locator('.splash img.splash-bg, .splash img.splash-logo, .splash img.splash-beaver').evaluateAll((els) => els.map((e) => (e as HTMLImageElement).complete && (e as HTMLImageElement).naturalWidth > 0));
      check(imgs.length === 3 && imgs.every(Boolean), `${tag}: фон, логотип и Бобек загружены`);
      // Процент и полоса читаются одним запросом: прогресс обновляется ~15 раз в секунду, два запроса подряд могли бы попасть на разные кадры.
      const { doing, pct, bar } = await u.page.evaluate(() => ({
        doing: document.querySelector('[data-boot]')?.getAttribute('data-boot') ?? null,
        pct: Number(document.querySelector('.splash-pct')?.textContent?.replace('%', '')),
        bar: Number(document.querySelector('.splash-bar')?.getAttribute('aria-valuenow')),
      }));
      check(doing === 'profile' && pct > 10 && pct < 82, `${tag}: этап настоящий — профиль ещё грузится, ${pct}% (между входом 45 % и профилем 82 %)`);
      const cut = await u.page.locator('[data-boot]').first().evaluate((el) => el.scrollWidth > el.clientWidth + 1);
      check(!cut, `${tag}: подпись этапа не обрезана`);
      check(bar === pct, `${tag}: полоса и процент совпадают (${bar} / ${pct})`);
      await u.page.screenshot({ path: `${OUT}/loading-${w}.png` });
      await u.context.close();
    }

    // «Меньше анимации»: никаких движений.
    {
      const u = await userPage(String(++n), [390, 844], { reduced: 'reduce' });
      await holdMe(u.page, 6_000);
      await u.page.goto(u.url('/'));
      await u.page.locator('.splash-card').waitFor({ timeout: 20_000 });
      const names = await u.page.evaluate(() => {
        const sel = ['.splash-hero', '.splash-bar-fill', '.splash-ui', '.splash-stage'];
        const out: string[] = [];
        for (const s of sel) out.push(`${s}:${getComputedStyle(document.querySelector(s)!).animationName}`);
        out.push(`::after:${getComputedStyle(document.querySelector('.splash-bar-fill')!, '::after').animationName}`);
        return out;
      });
      check(names.every((x) => x.endsWith(':none')), `prefers-reduced-motion: все анимации выключены (${names.join(' ')})`);
      await u.context.close();
    }
    {
      // Настройка профиля «Меньше анимации» (html.reduced-motion) — то же самое.
      const u = await userPage(String(++n), [390, 844]);
      await u.call('PATCH', '/api/me/settings', { reducedMotion: true });
      await u.page.goto(u.url('/'));
      await u.page.waitForFunction(() => document.documentElement.classList.contains('reduced-motion') || !document.querySelector('.splash'), undefined, { timeout: 20_000 });
      const css = await u.page.evaluate(() => {
        const d = document.createElement('div');
        d.className = 'splash';
        d.innerHTML = '<div class="splash-hero"></div>';
        document.body.appendChild(d);
        const v = getComputedStyle(d.firstElementChild!).animationName;
        d.remove();
        return v;
      });
      check(css === 'none', `настройка «Меньше анимаций» (html.reduced-motion): анимация бобра выключена (${css})`);
      await u.context.close();
    }

    // ── 2. Фразы: не длиннее двух строк на узких экранах ──
    {
      const u = await userPage(String(++n), [320, 568]);
      await holdMe(u.page, 15_000);
      await u.page.goto(u.url('/'));
      await u.page.locator('.splash-card').waitFor({ timeout: 20_000 });
      for (const [lang, dict] of [['ru', ru], ['uk', uk], ['en', en]] as const) {
        for (const width of [320, 360]) {
          await u.page.setViewportSize({ width, height: width === 320 ? 568 : 740 });
          const bad = await u.page.evaluate((phrases) => {
            const el = document.querySelector('.splash-title') as HTMLElement;
            const probe = el.cloneNode() as HTMLElement;
            probe.style.cssText = 'display:block;-webkit-line-clamp:unset;overflow:visible;position:absolute;visibility:hidden;height:auto;white-space:normal';
            probe.style.width = `${el.getBoundingClientRect().width}px`;
            el.parentElement!.appendChild(probe);
            const lh = parseFloat(getComputedStyle(el).lineHeight);
            const res: string[] = [];
            for (const p of phrases) {
              probe.textContent = p;
              const lines = Math.round(probe.getBoundingClientRect().height / lh);
              if (lines > 2) res.push(`${p} (${lines} стр.)`);
            }
            probe.remove();
            return res;
          }, Array.from({ length: 15 }, (_, i) => (dict as Record<string, string>)[`splash_msg_${i + 1}`]));
          check(bad.length === 0, `${lang} ${width}px: все 15 фраз укладываются в две строки${bad.length ? ': ' + bad.join('; ') : ''}`);
        }
      }
      await u.context.close();
    }

    // ── 3. Ошибка, нет сети, медленный профиль ──
    for (const [w, h] of [[320, 568], [390, 844]] as const) {
      const u = await userPage(String(++n), [w, h]);
      await u.page.route('**/api/**', (r) => r.abort('internetdisconnected'));
      await u.page.goto(u.url('/'));
      await u.page.locator('[data-boot-error="server"]').waitFor({ timeout: 20_000 });
      await u.page.waitForTimeout(700);
      const card = await box(u.page, '.splash-card');
      const retry = await box(u.page, '.splash-card button');
      check(card.x >= 0 && card.r <= w && card.b <= h && retry.b <= h, `${w}px ошибка: карточка и «Повторить» в кадре`);
      await u.page.screenshot({ path: `${OUT}/error-${w}.png` });
      await u.context.setOffline(true);
      await u.page.locator('[data-boot-error="offline"]').waitFor({ timeout: 10_000 });
      await u.page.waitForTimeout(500);
      const badge = await box(u.page, '.splash-badge');
      const hero = await box(u.page, '.splash-beaver');
      check(badge.x >= 0 && badge.r <= w && badge.y >= 0 && badge.y < hero.y + hero.h * 0.4, `${w}px нет сети: значок wi-fi у головы Бобека и в кадре`);
      await u.page.screenshot({ path: `${OUT}/offline-${w}.png` });
      await u.context.close();
    }
    for (const [w, h] of [[320, 568], [390, 844]] as const) {
      const u = await userPage(String(++n), [w, h]);
      await holdMe(u.page, 12_000);
      await u.page.goto(u.url('/'));
      await u.page.locator('[data-boot="slow"]').waitFor({ timeout: 15_000 });
      check((await u.page.locator('.splash-card button').count()) === 1, `${w}px медленный профиль: честное «связь медленная» и одна кнопка «Повторить»`);
      const retry = await box(u.page, '.splash-card button');
      const label = await box(u.page, '[data-boot="slow"]');
      const overlaps = label.x < retry.r && label.r > retry.x && label.y < retry.b && label.b > retry.y;
      check(retry.r <= w && retry.b <= h && !overlaps, `${w}px медленный профиль: подпись и кнопка в кадре и не наезжают друг на друга`);
      check(!(await u.page.locator('[data-boot="slow"]').evaluate((el) => el.scrollWidth > el.clientWidth + 1)), `${w}px медленный профиль: подпись «связь медленная» показана целиком`);
      await u.page.screenshot({ path: `${OUT}/slow-${w}.png` });
      // Сеть пропала посреди загрузки: «Нет сети — подключись, продолжим сами» тоже целиком.
      await u.context.setOffline(true);
      await u.page.locator('[data-boot="offline"]').waitFor({ timeout: 10_000 });
      check(!(await u.page.locator('[data-boot="offline"]').evaluate((el) => el.scrollWidth > el.clientWidth + 1)), `${w}px нет сети во время загрузки: подпись показана целиком`);
      await u.page.screenshot({ path: `${OUT}/loading-offline-${w}.png` });
      await u.context.close();
    }

    // ── 4. Мгновенная заставка и заставка React: один и тот же логотип на одном месте ──
    for (const [w, h] of [[320, 568], [390, 844], [430, 932]] as const) {
      const u = await userPage(String(++n), [w, h]);
      const ctxNoJs = await browser.newContext({ viewport: { width: w, height: h }, javaScriptEnabled: false });
      const pre = await ctxNoJs.newPage();
      await pre.goto(`${base}/`);
      await pre.locator('.pre-logo').waitFor({ timeout: 10_000 });
      await pre.waitForTimeout(1200);
      const a = await box(pre, '.pre-logo');
      const preBg = await box(pre, '.pre-bg');
      await pre.screenshot({ path: `${OUT}/pre-${w}.png` });
      await ctxNoJs.close();
      await holdMe(u.page, 6_000);
      await u.page.goto(u.url('/'));
      await u.page.locator('.splash-logo').waitFor({ timeout: 20_000 });
      const b = await box(u.page, '.splash-logo');
      const bgB = await box(u.page, '.splash-bg');
      const d = Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y), Math.abs(a.w - b.w), Math.abs(a.h - b.h), Math.abs(preBg.w - bgB.w), Math.abs(preBg.y - bgB.y));
      check(d <= 1, `${w}px: логотип и фон в index.html и в React совпадают до пикселя (разница ${d.toFixed(2)} px)`);
      await u.context.close();
    }

    // ── 5. Знакомство ──
    for (const [w, h] of [[320, 568], [360, 740], [390, 844], [430, 932]] as const) {
      const u = await userPage(String(++n), [w, h], { onboarded: false });
      await u.page.goto(u.url('/'));
      await u.page.locator('.splash-steps').waitFor({ timeout: 20_000 });
      await u.page.waitForTimeout(1500);
      const logo = await box(u.page, '.splash-logo');
      check(logo.y >= 7 && logo.x >= 0 && logo.r <= w, `${w}px знакомство: логотип цел (верх ${Math.round(logo.y)} px)`);
      const slogan = await box(u.page, '.splash-slogan');
      const steps = await box(u.page, '.splash-steps');
      check(slogan.y >= logo.b - 2 && steps.y >= slogan.b && slogan.x >= 0 && slogan.r <= w, `${w}px знакомство: слоган и шаги под логотипом, в кадре`);
      const beaver = await box(u.page, '.splash-beaver');
      check(steps.b <= beaver.y + beaver.h * 0.3, `${w}px знакомство: слоган и шаги не закрывают лицо Бобека (низ шагов ${Math.round(steps.b)}, голова с ${Math.round(beaver.y)})`);
      const bubble = await box(u.page, 'div.bg-white.rounded-3xl');
      const buttons = u.page.locator('button.btn-red, button.btn-ghost');
      const lastBtn = await buttons.last().evaluate((el) => el.getBoundingClientRect().bottom);
      check(lastBtn <= h && bubble.x >= 0 && bubble.r <= w, `${w}px знакомство: реплика и кнопки в кадре`);
      const cover = beaver.y + beaver.h * VISIBLE - bubble.y;
      const limit = h >= 700 ? 0.4 : 0.55;
      check(cover <= beaver.h * VISIBLE * limit, `${w}px знакомство: реплика закрывает не больше ${limit * 100} % Бобека снизу — лицо и грудь видны (${Math.round(cover)} из ${Math.round(beaver.h * VISIBLE)} px)`);
      await u.page.screenshot({ path: `${OUT}/hello-${w}.png` });
      await u.context.close();
    }

    // ── 6. Dev-темы ──
    for (const theme of ['sunset', 'adventure', 'soft']) {
      const u = await userPage(String(++n), [390, 844]);
      await holdMe(u.page, 8_000);
      await u.page.goto(u.url(`/?splash=${theme}`));
      await u.page.locator('.splash-card').waitFor({ timeout: 20_000 });
      await u.page.waitForTimeout(1200);
      const t = await u.page.locator('.splash').getAttribute('data-splash-theme');
      if (theme === 'soft') {
        check(t === 'royal', 'тема soft («Мягкий», размытый Бобек) не берётся: остаётся рабочая royal');
      } else {
        check(t === theme, `dev-тема ${theme} включается через ?splash=`);
        await u.page.screenshot({ path: `${OUT}/theme-${theme}.png` });
      }
      await u.context.close();
    }
    check(pageErrors.length === 0, `без ошибок страницы${pageErrors.length ? ': ' + pageErrors.slice(0, 3).join(' | ') : ''}`);
  } finally {
    await browser.close();
    await stand.stop();
  }
  console.log(failures.length ? `\nПровалено: ${failures.length}` : '\nВсе проверки пройдены');
  process.exit(failures.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
