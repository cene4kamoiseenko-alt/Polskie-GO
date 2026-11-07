/**
 * Гардероб «готовые образы» (2026-11-02, docs/OUTFITS.md) в реальном браузере (Chromium, не Telegram на iPhone / Android).
 *
 *   node --import tsx scripts/outfits-screens.ts   → test-results/outfits/*.png
 *
 * 1. «Магазин»: три уровня Osiedle / Starówka / Wawel (польские названия), в каждом — образы; стартовый «Podróżnik» первым и надет; отдельных вещей
 *    (кепки, очков…) в продаже нет; картинки карточек загружаются; нет горизонтальной прокрутки; 320 / 390 / 430.
 * 2. Примерка образа меняет Бобека на сцене (data-look-preview), без денег — «Не хватает», с деньгами — одна покупка, затем «Надеть»:
 *    на сервере ровно набор образа, карточка «Надето», после перезагрузки так же.
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromiumPath, startStand } from './lib/stand';

const root = process.cwd();
const require = createRequire(root + '/package.json');
const OUT = resolve(root, 'test-results/outfits');
const SIZES: [number, number][] = [[320, 640], [390, 844], [430, 932]];

const failures: string[] = [];
const check = (ok: unknown, what: string) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) failures.push(what);
};

async function main() {
  const { chromium } = require('playwright') as typeof import('playwright');
  const { db } = await import(root + '/apps/server/src/db/index.ts');
  const { gameWallets } = await import(root + '/apps/server/src/db/schema.ts');
  const { eq } = await import('drizzle-orm');
  const stand = await startStand({ ui: 'dev' });
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: chromiumPath(chromium), args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const pageErrors: string[] = [];
  let devUser = 997900;

  async function userPage(size: [number, number], balance = 0) {
    const u = await stand.login();
    await u.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A0', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: null });
    await u.call('PATCH', '/api/me/settings', { theme: 'dark', reducedMotion: true });
    await db.update(gameWallets).set({ balance }).where(eq(gameWallets.userId, u.user.id));
    const id = String(++devUser);
    const context = await browser.newContext({ viewport: { width: size[0], height: size[1] }, deviceScaleFactor: 2, locale: 'ru-RU' });
    const page = await context.newPage();
    page.on('pageerror', (e) => pageErrors.push(e.message));
    await page.addInitScript(({ token, id }) => localStorage.setItem('pg_auth', JSON.stringify({ token, owner: `dev:${id}`, exp: Date.now() + 86_400_000 })), { token: u.token, id });
    const open = async (tab: 'shop' | 'rewards' = 'shop') => {
      await page.goto(`${stand.base}/shop?${tab === 'shop' ? 'tab=shop&' : ''}devUser=${id}`);
      await page.locator(tab === 'shop' ? '[data-looks] [data-outfit]' : 'article.costume-card').first().waitFor({ timeout: 30_000 });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(700);
    };
    await open();
    return { ...u, page, context, open };
  }

  try {
    // ── 1. Магазин образов ──
    for (const [w, h] of SIZES) {
      const tag = `${w}px`;
      const u = await userPage([w, h]);
      const tiers = await u.page.locator('[data-looks] section[data-tier]').evaluateAll((els) => els.map((e) => ({ t: e.getAttribute('data-tier'), title: (e.querySelector('h2') as HTMLElement).innerText.replace(/\s+/g, ' '), n: e.querySelectorAll('[data-outfit], article.costume-card').length })));
      check(tiers.map((x) => x.t).join() === 'rare,epic,legendary', `${tag}: три уровня по порядку (${tiers.map((x) => x.title).join(' | ')})`);
      check(/Osiedle/.test(tiers[0]?.title ?? '') && /Starówka/.test(tiers[1]?.title ?? '') && /Wawel/.test(tiers[2]?.title ?? ''), `${tag}: польские названия уровней`);
      check(tiers.every((x) => x.n >= 5), `${tag}: в каждом уровне образы (${tiers.map((x) => x.n).join('/')})`);
      const first = u.page.locator('[data-looks] section[data-tier="rare"] [data-outfit]').first();
      check((await first.getAttribute('data-outfit')) === 'outfit-hoodie-pack' && (await first.getAttribute('data-outfit-state')) === 'wearing', `${tag}: «Podróżnik» первым и надет`);
      check((await u.page.locator('[data-looks] .item-card').count()) === (await u.page.locator('[data-frames] .item-card').count()), `${tag}: поштучных вещей в продаже нет (только рамки)`);
      check((await u.page.locator('.chip-tab', { hasText: 'Шапки' }).count()) === 0, `${tag}: категорий вещей нет`);
      // все картинки карточек загружаются (ленивые — после прокрутки)
      await u.page.locator('[data-frames]').scrollIntoViewIfNeeded();
      await u.page.waitForTimeout(900);
      for (const el of await u.page.locator('[data-outfit] img').all()) await el.scrollIntoViewIfNeeded();
      await u.page.waitForTimeout(900);
      const imgs = await u.page.locator('[data-outfit] img').evaluateAll((els) => els.map((e) => (e as HTMLImageElement).complete && (e as HTMLImageElement).naturalWidth > 0));
      check(imgs.length >= 30 && imgs.every(Boolean), `${tag}: картинки образов загружены (${imgs.filter(Boolean).length}/${imgs.length})`);
      const clip = await u.page.locator('[data-outfit] h3').evaluateAll((els) => els.filter((e) => e.scrollWidth > e.clientWidth + 1).length);
      check(clip === 0, `${tag}: названия образов не обрезаны`);
      check(await u.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${tag}: нет горизонтальной прокрутки`);
      await u.page.evaluate(() => window.scrollTo(0, 0));
      await u.page.screenshot({ path: `${OUT}/shop-${w}.png`, fullPage: true });
      await u.context.close();
    }

    // ── 2. Примерка, покупка, «Надеть» ──
    {
      const tag = '390px покупка';
      const u = await userPage([390, 844], 0);
      const slug = 'outfit-denim-beanie';
      const card = u.page.locator(`[data-outfit="${slug}"]`);
      await card.scrollIntoViewIfNeeded();
      const stage = u.page.locator('.wardrobe-stage [data-look]').first();
      const before = await stage.getAttribute('data-look-items');
      await card.getByRole('button', { name: 'Примерить' }).click();
      const sheet = u.page.locator('.action-sheet');
      await sheet.waitFor({ timeout: 5_000 });
      await u.page.waitForTimeout(400);
      check((await stage.getAttribute('data-look-preview')) === 'true' && (await stage.getAttribute('data-look-items')) !== before, `${tag}: примерка меняет Бобека на сцене`);
      check(/Не хватает|Недостаточно/i.test(await sheet.innerText()), `${tag}: без денег — «не хватает» (${(await sheet.innerText()).replace(/\s+/g, ' ').slice(0, 60)})`);
      await u.page.screenshot({ path: `${OUT}/try-390.png` });
      await u.context.close();

      const v = await userPage([390, 844], 1000);
      const card2 = v.page.locator(`[data-outfit="${slug}"]`);
      await card2.scrollIntoViewIfNeeded();
      const buys: string[] = [];
      v.page.on('request', (r) => { if (r.method() === 'POST' && r.url().includes('/api/shop/buy')) buys.push(r.url()); });
      await card2.getByRole('button', { name: 'Примерить' }).click();
      const sheet2 = v.page.locator('.action-sheet');
      await sheet2.waitFor({ timeout: 5_000 });
      await sheet2.locator('button.btn-primary').evaluate((b: HTMLButtonElement) => { b.click(); b.click(); });
      await sheet2.getByRole('button', { name: 'Надеть' }).waitFor({ timeout: 10_000 });
      check(buys.length === 1, `${tag}: двойной тап «Купить» — один запрос (${buys.length})`);
      const wallet = (await db.select().from(gameWallets).where(eq(gameWallets.userId, v.user.id)))[0].balance;
      check(wallet >= 1000 - 480 && wallet <= 1000 - 480 + 60, `${tag}: списана цена образа 480 (осталось ${wallet}; до +50 за достижения)`);
      await sheet2.getByRole('button', { name: 'Надеть' }).click();
      await sheet2.waitFor({ state: 'detached', timeout: 10_000 });
      const wear = (await v.call('GET', '/api/me')).body.outfit.wear as Record<string, string>;
      const sorted = Object.entries(wear).map(([k, x]) => `${k}:${x}`).sort().join();
      check(sorted === 'HAT:beanie-red,JACKET:jacket-denim', `${tag}: на сервере ровно набор образа (${sorted})`);
      await v.page.waitForTimeout(500);
      check((await card2.getAttribute('data-outfit-state')) === 'wearing', `${tag}: карточка «Надето»`);
      check((await v.page.locator('[data-outfit="outfit-hoodie-pack"]').getAttribute('data-outfit-state')) === 'owned', `${tag}: «Podróżnik» больше не надет, но свой`);
      await v.open();
      check((await v.page.locator(`[data-outfit="${slug}"]`).getAttribute('data-outfit-state')) === 'wearing', `${tag}: после перезагрузки образ надет`);
      await v.page.screenshot({ path: `${OUT}/bought-390.png` });
      await v.context.close();
    }
    // ── 3. «Путешественник» во вкладке «Награды» (жалоба владельца 2026-11-07): надет образ с кепкой и очками, а «Путешественник» значился надетым,
    //      примерка показывала Бобека в кепке и очках, «Надеть» не было. «Путешественник» = стартовый образ Podróżnik (худи и рюкзак).
    {
      const tag = '390px путешественник';
      const u = await userPage([390, 844], 1000);
      const luzak = ((await u.call('GET', '/api/shop')).body.items as { id: string; slug: string }[]).find((i) => i.slug === 'outfit-hoodie-cap-glasses')!;
      await u.call('POST', '/api/shop/buy', { itemId: luzak.id });
      await u.call('POST', '/api/inventory/equip', { itemId: luzak.id, equipped: true });
      const wearBefore = Object.keys((await u.call('GET', '/api/me')).body.outfit.wear).sort().join();
      check(wearBefore === 'GLASSES,HAT', `${tag}: надет «Miejski luzak» (${wearBefore})`);
      await u.open('rewards');
      // «Miejski luzak» (худи + кепка + очки): картинка позы wave с «призраком» на лице (мастер 09) заменена чистой open — на сцене именно она
      // (владелец 2026-11-07: «поплыла моделька»).
      const luzakSrc = (await u.page.locator('.wardrobe-stage img').evaluateAll((els) => els.map((e) => (e as HTMLImageElement).currentSrc || (e as HTMLImageElement).src).join(' '))) as string;
      check(/hoodie-cap-glasses_open/.test(luzakSrc) && !/hoodie-cap-glasses_wave/.test(luzakSrc), `${tag}: на сцене «Miejski luzak» — чистая картинка open, а не битая wave (${luzakSrc.split('/').pop()?.slice(0, 60)})`);
      await u.page.screenshot({ path: `${OUT}/luzak-worn-390.png` });
      const traveller = u.page.locator('article.costume-card').first();
      check(!((await traveller.getAttribute('class')) ?? '').includes('is-equipped'), `${tag}: «Путешественник» не помечен надетым, пока надет другой образ`);
      await traveller.getByRole('button', { name: 'Примерить' }).click();
      const sheet = u.page.locator('.action-sheet');
      await sheet.waitFor({ timeout: 5_000 });
      await u.page.waitForTimeout(500);
      const stageItems = (await u.page.locator('.wardrobe-stage [data-look]').first().getAttribute('data-look-items')) ?? '';
      check(!/cap|glasses/.test(stageItems), `${tag}: примерка «Путешественника» без кепки и очков (${stageItems})`);
      check(/Надето/.test(await u.page.locator('[data-try-caption]').innerText()) === false, `${tag}: подпись сцены не говорит «Надето»`);
      await u.page.screenshot({ path: `${OUT}/traveller-try-390.png` });
      const wear = sheet.getByRole('button', { name: 'Надеть' });
      check((await wear.count()) === 1 && (await wear.isEnabled()), `${tag}: в панели есть активная кнопка «Надеть»`);
      await wear.click();
      await sheet.waitFor({ state: 'detached', timeout: 10_000 });
      const wearAfter = Object.entries((await u.call('GET', '/api/me')).body.outfit.wear as Record<string, string>).map(([k, x]) => `${k}:${x}`).sort().join();
      check(wearAfter === 'BACKPACK:backpack-travel', `${tag}: на сервере ровно стартовый образ (${wearAfter})`);
      await u.page.waitForTimeout(500);
      check(((await traveller.getAttribute('class')) ?? '').includes('is-equipped'), `${tag}: «Путешественник» теперь надет`);
      await u.open('rewards');
      check(((await u.page.locator('article.costume-card').first().getAttribute('class')) ?? '').includes('is-equipped'), `${tag}: после перезагрузки «Путешественник» надет`);
      await u.page.screenshot({ path: `${OUT}/traveller-worn-390.png` });
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
