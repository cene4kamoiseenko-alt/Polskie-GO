/**
 * Скины владельца 2026-11-04 (docs/design/v20/skins) — в реальном браузере (Chromium, не Telegram на iPhone / Android).
 *
 *   node --import tsx scripts/skins-screens.ts   → test-results/skins/*.png
 *
 * 1. «Награды»: у игрока, получившего награды, карточки повара, пилота (`costume-conductor`), гнома, Сирены, колпака гнома, краковского жилета
 *    и обважанка показывают новые картинки (загружены), старых сцен карточек нет; описание не пустое и не ключ перевода. 320 / 390 / 430.
 * 2. «Магазин»: «Костюм художника» и «Зимний образ» — новые картинки, без старой сцены.
 * 3. Надеть каждый новый скин → главная рисует Бобра этим костюмом (`data-look-owner`), картинка загружена; нет горизонтальной прокрутки.
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromiumPath, startStand } from './lib/stand';

const root = process.cwd();
const require = createRequire(root + '/package.json');
const OUT = resolve(root, 'test-results/skins');
const SIZES: [number, number][] = [[320, 640], [390, 844], [430, 932]];

const REWARDS = ['costume-chef', 'costume-conductor', 'costume-krasnal', 'costume-syrenka', 'hat-krasnal', 'vest-krakowiak', 'obwarzanek'];
const FOR_SALE = ['costume-artist', 'costume-winter'];
const file = (slug: string) => slug.replace(/^costume-/, '');

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
  let devUser = 997900;
  const d1 = stand.env.DB as D1Database;

  try {
    for (const [w, h] of SIZES) {
      const u = await stand.login();
      await u.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A0', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: null });
      await u.call('PATCH', '/api/me/settings', { theme: 'dark', reducedMotion: true });
      for (const slug of [...REWARDS, ...FOR_SALE]) await d1.prepare('INSERT INTO user_inventory (user_id, item_id, source) VALUES (?, ?, ?) ON CONFLICT DO NOTHING').bind(u.user.id, `i_${slug}`, 'qa').run();
      const id = String(++devUser);
      const context = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, locale: 'ru-RU' });
      const page = await context.newPage();
      page.on('pageerror', (e) => pageErrors.push(e.message));
      await page.addInitScript(({ token, id }) => localStorage.setItem('pg_auth', JSON.stringify({ token, owner: `dev:${id}`, exp: Date.now() + 30 * 86_400_000 })), { token: u.token, id });
      const go = async (path: string, sel: string) => {
        await page.goto(`${stand.base}${path}${path.includes('?') ? '&' : '?'}devUser=${id}`);
        await page.locator(sel).first().waitFor({ timeout: 30_000 });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(600);
      };
      const cardImages = async (slugs: string[]) => {
        const out: Record<string, { ok: boolean; desc: string }> = {};
        for (const slug of slugs) {
          const img = page.locator(`.costume-card img[src*="costumes/${file(slug)}"]`).first();
          if (!(await img.count())) { out[slug] = { ok: false, desc: '' }; continue; }
          await img.scrollIntoViewIfNeeded();
          await page.waitForFunction((el) => (el as HTMLImageElement).complete, await img.elementHandle(), { timeout: 10_000 }).catch(() => undefined);
          const ok = await img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0 && !/-scene/.test(el.currentSrc));
          const desc = (await img.locator('xpath=ancestor::article[1]').locator('p').first().innerText()).trim();
          out[slug] = { ok, desc };
        }
        return out;
      };
      const noScroll = () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);

      // ── 1. Награды ──
      await go('/shop', '.costume-card');
      const rewards = await cardImages(REWARDS);
      for (const slug of REWARDS) {
        const r = rewards[slug];
        check(r.ok, `${w}px «Награды»: ${slug} — новая картинка загружена`);
        check(r.desc.length > 10 && !r.desc.startsWith('costume_desc'), `${w}px «Награды»: ${slug} — описание («${r.desc.slice(0, 40)}»)`);
      }
      check((await page.locator('.costume-card img[src*="-scene"]').evaluateAll((els) => els.map((e) => (e as HTMLImageElement).src).filter((s) => /(artist|winter|krasnal|chef|conductor)-scene/.test(s)))).length === 0, `${w}px «Награды»: старых сцен карточек нет`);
      check(await noScroll(), `${w}px «Награды»: нет горизонтальной прокрутки`);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: `${OUT}/rewards-${w}.png`, fullPage: true });

      // ── 2. Магазин ──
      await go('/shop?tab=shop', '.costume-card');
      const sale = await cardImages(FOR_SALE);
      for (const slug of FOR_SALE) check(sale[slug].ok, `${w}px «Магазин»: ${slug} — новая картинка загружена`);

      // ── 3. Главная в каждом новом скине ──
      for (const slug of w === 390 ? [...REWARDS, ...FOR_SALE] : ['hat-krasnal', 'costume-conductor']) {
        const eq = await u.call('POST', '/api/inventory/equip', { itemId: `i_${slug}`, equipped: true });
        check(eq.status === 200 && (eq.body as { wear: Record<string, string> }).wear.COSTUME === slug, `${w}px надеть ${slug}: COSTUME = ${slug}`);
        await go('/', `[data-look-owner="${slug}"]`);
        const img = page.locator(`[data-look-owner="${slug}"]`).first();
        const shown = await img.evaluate((el) => {
          const im = (el.tagName === 'IMG' ? el : el.querySelector('img')) as HTMLImageElement | null;
          return im ? { ok: im.complete && im.naturalWidth > 0, src: im.currentSrc.split('/').pop() ?? '' } : { ok: false, src: '' };
        });
        check(shown.ok && shown.src.startsWith(file(slug)), `${w}px главная: Бобёр в ${slug} (${shown.src})`);
        if (w === 390) await page.screenshot({ path: `${OUT}/home-${file(slug)}-${w}.png` });
      }
      check(await noScroll(), `${w}px главная: нет горизонтальной прокрутки`);
      await context.close();
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
