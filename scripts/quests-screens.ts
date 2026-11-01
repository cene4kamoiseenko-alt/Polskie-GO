/**
 * Экран «Квесты» с картинками владельца (2026-11-01, docs/design/v19/quests) в реальном браузере (Chromium, не Telegram на iPhone / Android).
 *
 *   node --import tsx scripts/quests-screens.ts   → test-results/quests-screens/*.png
 *
 * 1. Баннер: кадр «Бобек-бариста в Кракове» загружен и закрывает баннер, заголовок и две плашки («Обновление через…», «Выполнено N из M») внутри баннера;
 *    миниатюра «Польский в жизни» (Sklep 24h) загружена, нажатие ведёт на /life. 320 / 390 / 430, нет горизонтальной прокрутки.
 * 2. Вкладка «Особые»: три сюжетных квеста с картинками (Варшава, квартира, Вроцлав), картинки загружены (ленивые — прокручиваем к ним), закрытый квест затемнён с замком,
 *    тег «Особые» и текст не вылезают из карточки.
 * 3. Обложки сезонов «Рождество» и «Energylandia» на /pass (календарь сезонов) — кадры владельца, загружены.
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromiumPath, startStand } from './lib/stand';

const root = process.cwd();
const require = createRequire(root + '/package.json');
const OUT = resolve(root, 'test-results/quests-screens');
const SIZES: [number, number][] = [[320, 640], [390, 844], [430, 932]];

const failures: string[] = [];
const check = (ok: unknown, what: string) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) failures.push(what);
};

async function main() {
  const { chromium } = require('playwright') as typeof import('playwright');
  const stand = await startStand({ ui: 'dev' });
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: chromiumPath(chromium), args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const pageErrors: string[] = [];
  let devUser = 997100;

  async function userPage(size: [number, number], path: string, ready: string) {
    const u = await stand.login();
    await u.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A0', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: null });
    await u.call('PATCH', '/api/me/settings', { theme: 'dark', reducedMotion: false });
    const id = String(++devUser);
    const context = await browser.newContext({ viewport: { width: size[0], height: size[1] }, deviceScaleFactor: 2, locale: 'ru-RU' });
    const page = await context.newPage();
    page.on('pageerror', (e) => pageErrors.push(e.message));
    await page.addInitScript(({ token, id }) => localStorage.setItem('pg_auth', JSON.stringify({ token, owner: `dev:${id}`, exp: Date.now() + 86_400_000 })), { token: u.token, id });
    await page.goto(`${stand.base}${path}?devUser=${id}`);
    await page.locator(ready).first().waitFor({ timeout: 30_000 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(900);
    return { ...u, page, context, id };
  }
  const box = (p: import('playwright').Page, sel: string, nth = 0) =>
    p.locator(sel).nth(nth).evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height, r: r.right, b: r.bottom };
    });
  const loaded = (p: import('playwright').Page, sel: string, nth = 0) =>
    p.locator(sel).nth(nth).evaluate((el: HTMLImageElement) => ({ ok: el.complete && el.naturalWidth > 0, w: el.naturalWidth, src: el.currentSrc.split('/').pop() }));

  try {
    for (const [w, h] of SIZES) {
      const tag = `${w}px`;
      const u = await userPage([w, h], '/quests', '[data-quest-art="hero"]');
      // ── 1. Баннер и «Польский в жизни» ──
      const hero = await loaded(u.page, '[data-quest-art="hero"]');
      check(hero.ok, `${tag}: баннер — кадр Бобека-бариста загружен (${hero.src}, ${hero.w} px)`);
      const heroBox = await box(u.page, '[data-quest-art="hero"]');
      const card = await u.page.locator('[data-quest-art="hero"]').evaluate((el) => {
        const r = (el.parentElement as HTMLElement).getBoundingClientRect();
        return { x: r.x, y: r.y, r: r.right, b: r.bottom, w: r.width, h: r.height };
      });
      check(Math.abs(heroBox.w - card.w) < 1.5 && Math.abs(heroBox.h - card.h) < 1.5, `${tag}: кадр закрывает баннер целиком (${Math.round(heroBox.w)}×${Math.round(heroBox.h)} из ${Math.round(card.w)}×${Math.round(card.h)})`);
      // Без именованных функций внутри evaluate: tsx оборачивает их в __name, которого нет на странице.
      const parts = await u.page.locator('[data-quest-art="hero"]').evaluate((el) => {
        const root = el.parentElement as HTMLElement, rr = root.getBoundingClientRect();
        const rects = [root.querySelector('h1'), ...Array.from(root.querySelectorAll('.rounded-full'))].map((e) => (e ? e.getBoundingClientRect() : null));
        const inside = rects.map((r) => !!r && r.x >= rr.x - 0.5 && r.right <= rr.right + 0.5 && r.y >= rr.y - 0.5 && r.bottom <= rr.bottom + 0.5);
        return { title: inside[0], chips: inside.slice(1) };
      });
      check(parts.title && parts.chips.length >= 2 && parts.chips.every(Boolean), `${tag}: заголовок и плашки внутри баннера (${parts.chips.length} плашки)`);
      check(await u.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${tag}: нет горизонтальной прокрутки`);

      await u.page.locator('[data-quest-art="life"]').scrollIntoViewIfNeeded();
      await u.page.waitForTimeout(500);
      const life = await loaded(u.page, '[data-quest-art="life"]');
      check(life.ok, `${tag}: миниатюра «Польский в жизни» — Sklep 24h загружена (${life.src})`);
      await u.page.screenshot({ path: `${OUT}/quests-${w}.png` });

      // ── 2. Вкладка «Особые» ──
      await u.page.getByRole('tab', { name: 'Особые' }).click();
      await u.page.locator('[data-quest-art^="s-"]').first().waitFor({ timeout: 15_000 });
      const stories = await u.page.locator('[data-quest-art^="s-"]').evaluateAll((els) => els.map((e) => e.getAttribute('data-quest-art')));
      check(stories.join() === 's-warszawa-dworzec,s-krakow-mieszkanie,s-wroclaw-zgubiony', `${tag}: три сюжетных квеста с картинками (${stories.join(', ')})`);
      for (let i = 0; i < stories.length; i++) {
        const sel = `[data-quest-art="${stories[i]}"]`;
        await u.page.locator(sel).scrollIntoViewIfNeeded();
        await u.page.waitForTimeout(450);
        const im = await loaded(u.page, sel);
        const b = await box(u.page, sel);
        const parent = await u.page.locator(sel).evaluate((el) => {
          const r = (el.parentElement as HTMLElement).getBoundingClientRect();
          const tagEl = (el.parentElement as HTMLElement).querySelector('.rounded-full');
          const t = tagEl ? tagEl.getBoundingClientRect() : null;
          return { w: r.width, h: r.height, x: r.x, tagInside: !!t && t.x >= r.x && t.right <= r.right && t.y >= r.y && t.bottom <= r.bottom };
        });
        check(im.ok && Math.abs(b.w - parent.w) < 1.5 && Math.abs(b.h - parent.h) < 1.5, `${tag}: «${stories[i]}» — картинка загружена и закрывает карточку (${im.src}, ${im.w} px)`);
        check(parent.tagInside, `${tag}: «${stories[i]}» — тег «Особые» внутри картинки`);
      }
      const locked = await u.page.locator('[data-quest-art="s-wroclaw-zgubiony"]').evaluate((el) => !!(el.parentElement as HTMLElement).querySelector('.bg-ink\\/35'));
      check(locked, `${tag}: закрытый квест (Вроцлав) затемнён, на нём замок`);
      check(await u.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${tag}: «Особые» — нет горизонтальной прокрутки`);
      await u.page.screenshot({ path: `${OUT}/quests-special-${w}.png`, fullPage: true });

      if (w === 390) {
        // нажатие на «Польский в жизни»
        await u.page.getByRole('tab', { name: 'Ежедневные' }).click();
        await u.page.locator('[data-quest-art="life"]').click();
        await u.page.waitForURL(/\/life$/, { timeout: 15_000 });
        check(true, '390px: «Польский в жизни» открывает /life');
      }
      await u.context.close();
    }

    // ── 3. Обложки сезонов на /pass ──
    {
      const u = await userPage([390, 844], '/pass', '[data-season]');
      for (const slug of ['swieta', 'energylandia']) {
        const sel = `img[data-season-cover="${slug}"]`;
        await u.page.locator(sel).scrollIntoViewIfNeeded();
        await u.page.waitForTimeout(600);
        const im = await loaded(u.page, sel);
        check(im.ok, `/pass: обложка сезона «${slug}» — кадр владельца загружен (${im.src}, ${im.w} px)`);
      }
      await u.page.screenshot({ path: `${OUT}/pass-seasons-390.png`, fullPage: true });
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
