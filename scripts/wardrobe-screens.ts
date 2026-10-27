/**
 * Реальные снимки гардероба на 320 / 360 / 390 / 430 px и проверка контракта экрана перед единым рендерером Бобека (ADR-005):
 * категории (вкладки слотов), карточки вещей, выбор (примерка), «куплено / надето / закрыто / визуал готовится», сохранение надетого на сервере
 * и после перезагрузки, отсутствие горизонтальной прокрутки, размер зон касания.
 * Бобек рисует только BeaverLook (data-look-*): экран не рисует его сам. Chromium, а не Telegram на iPhone / Android.
 *
 * Запуск: node --import tsx scripts/wardrobe-screens.ts   → test-results/wardrobe-screens/<экран>-<ширина>.png
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromiumPath, startStand } from './lib/stand';

const root = process.cwd();
const require = createRequire(root + '/package.json');
const OUT = resolve(root, 'test-results/wardrobe-screens');
const WIDTHS = [320, 360, 390, 430];
const HEIGHT: Record<number, number> = { 320: 700, 360: 780, 390: 844, 430: 932 };
const MIN_TAP = 40;

const failures: string[] = [];
const check = (ok: unknown, what: string) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) failures.push(what);
};

type ShopRow = { id: string; slot: string; assetKey: string; name: { ru: string }; price: number; rewardOnly: boolean; owned: boolean; equipped: boolean; isPremium: boolean; visualStatus?: string };

async function main() {
  const { chromium } = require('playwright') as typeof import('playwright');
  const stand = await startStand({ ui: 'dev' });
  const { base, login, env } = stand;
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: chromiumPath(chromium), args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  let devUser = 997000;
  try {
    for (const width of WIDTHS) {
      const u = await login();
      await u.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A0', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: null });
      const id = String(++devUser);
      // Куплена и не надета джинсовая куртка, надет костюм повара, 500 Złotki.
      for (const [slug, on] of [['costume-chef', 1], ['jacket-denim', 0]] as const) {
        await env.DB.prepare("INSERT INTO user_inventory (user_id, item_id, equipped, source) SELECT ?, id, ?, 'wardrobe-check' FROM cosmetic_items WHERE slug = ?").bind(u.user.id, on, slug).run();
      }
      await env.DB.prepare('UPDATE game_wallets SET balance = 500 WHERE user_id = ?').bind(u.user.id).run();
      const shop0 = (await u.call('GET', '/api/shop')).body as { items: ShopRow[] };
      const jacket = shop0.items.find((i) => i.assetKey === 'jacket-denim')!;
      const pending = shop0.items.find((i) => i.slot === 'JACKET' && i.visualStatus === 'pending' && !i.rewardOnly && !i.owned);
      const rewardNotOwned = shop0.items.find((i) => i.slot === 'COSTUME' && i.rewardOnly && !i.owned);

      const context = await browser.newContext({ viewport: { width, height: HEIGHT[width] }, deviceScaleFactor: 2, locale: 'ru-RU' });
      const p = await context.newPage();
      await p.addInitScript(({ token, id }) => {
        localStorage.setItem('pg_auth', JSON.stringify({ token, owner: `dev:${id}`, exp: Date.now() + 86_400_000 }));
      }, { token: u.token, id });
      const settle = async () => {
        await p.waitForFunction(() => !document.querySelector('[data-skeleton]'), undefined, { timeout: 20_000 }).catch(() => {});
        await p.evaluate(() => document.fonts.ready);
        await p.waitForTimeout(700);
      };
      const noHScroll = async (what: string) =>
        check(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${width}px ${what}: нет горизонтальной прокрутки`);
      /** Все видимые кнопки и вкладки имеют зону касания не меньше MIN_TAP по меньшей стороне. */
      const taps = async (what: string) => {
        const small = await p.evaluate((min) =>
          Array.from(document.querySelectorAll('button, [role="tab"], a[href]'))
            .map((el) => ({ el, r: el.getBoundingClientRect() }))
            .filter(({ r }) => r.width > 0 && r.height > 0 && Math.min(r.width, r.height) < min)
            .map(({ el, r }) => `${(el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 24)} ${Math.round(r.width)}×${Math.round(r.height)}`), MIN_TAP);
        check(small.length === 0, `${width}px ${what}: зоны касания ≥ ${MIN_TAP} px${small.length ? ` (мелкие: ${small.join('; ')})` : ''}`);
      };

      /** Названия вещей не обрезаны по ширине карточки (длинное слово не помещается и прячется за краем). */
      const titles = async (what: string) => {
        const clipped = await p.evaluate(() =>
          Array.from(document.querySelectorAll('article.costume-card h3, button.item-card > span.line-clamp-2'))
            .filter((el) => el.scrollWidth > el.clientWidth + 1)
            .map((el) => (el.textContent ?? '').trim()));
        check(clipped.length === 0, `${width}px ${what}: названия не обрезаны${clipped.length ? ` (${clipped.join('; ')})` : ''}`);
      };

      // ── Магазин: категории ──
      await p.goto(`${base}/shop?tab=shop&devUser=${id}`);
      await p.locator('[role="tablist"]').waitFor({ timeout: 20_000 });
      await settle();
      const chips = p.locator('.chip-tab');
      const chipCount = await chips.count();
      check(chipCount === 9, `${width}px категории: ${chipCount} вкладок слотов`);
      await p.screenshot({ path: `${OUT}/shop-${width}.png` });
      await noHScroll('магазин');
      await titles('магазин, одежда');
      await taps('магазин');
      check(await p.locator('.wardrobe-stage [data-look]').count() >= 1, `${width}px примерочная рисует Бобека через data-look (BeaverLook), не своей графикой`);

      // Каждая категория переключается, показывает карточки и не вылезает за экран.
      let overflow = 0;
      for (let i = 0; i < chipCount; i++) {
        await chips.nth(i).scrollIntoViewIfNeeded();
        await chips.nth(i).click();
        await p.waitForTimeout(250);
        check((await chips.nth(i).getAttribute('aria-pressed')) === 'true', `${width}px категория ${i + 1}: выбрана (aria-pressed)`);
        const cards = p.locator('button.item-card, article.costume-card');
        if ((await cards.count()) > 0) {
          const bad = await cards.evaluateAll((els, w) => els.filter((el) => { const r = el.getBoundingClientRect(); return r.left < -1 || r.right > w + 1; }).length, width);
          overflow += bad;
        }
      }
      check(overflow === 0, `${width}px карточки всех категорий внутри экрана`);

      // ── Выбор вещи: куплена, не надета ──
      await chips.filter({ hasText: 'Одежда' }).first().click();
      const card = p.locator('button.item-card', { hasText: jacket.name.ru });
      await card.waitFor({ timeout: 10_000 });
      check(await card.getAttribute('aria-pressed') === 'false', `${width}px карточка «${jacket.name.ru}»: не выбрана`);
      await card.click();
      const sheet = p.locator('.action-sheet');
      await sheet.waitFor({ timeout: 5_000 });
      await p.waitForTimeout(500);
      check(await card.getAttribute('aria-pressed') === 'true' && (await card.getAttribute('class'))!.includes('is-selected'), `${width}px карточка выбрана: aria-pressed и is-selected`);
      check(await p.locator('.wardrobe-stage [data-look]').first().getAttribute('data-look-preview') === 'true', `${width}px примерка помечена data-look-preview`);
      const sheetBox = await sheet.boundingBox();
      check(!!sheetBox && sheetBox.x >= 0 && sheetBox.x + sheetBox.width <= width + 1, `${width}px панель действия внутри экрана`);
      await p.screenshot({ path: `${OUT}/shop-picked-${width}.png` });
      await taps('панель действия');
      await noHScroll('панель действия');

      // ── Надеть → сервер хранит → после перезагрузки карточка «надета» ──
      await sheet.getByRole('button', { name: 'Надеть' }).click();
      await sheet.waitFor({ state: 'detached', timeout: 10_000 });
      const wear = (await u.call('GET', '/api/me')).body.outfit.wear as Record<string, string>;
      check(Object.values(wear).includes('jacket-denim'), `${width}px «Надеть»: на сервере надета джинсовая куртка (${Object.values(wear).sort().join(' ')})`);
      check(!Object.values(wear).includes('costume-chef'), `${width}px «Надеть»: костюм повара снят по правилу слотов`);
      await p.reload();
      await p.locator('[role="tablist"]').waitFor({ timeout: 20_000 });
      await settle();
      await p.locator('.chip-tab', { hasText: 'Одежда' }).first().click();
      const reloaded = p.locator('button.item-card', { hasText: jacket.name.ru });
      await reloaded.waitFor({ timeout: 10_000 });
      check((await reloaded.getAttribute('class'))!.includes('is-equipped'), `${width}px после перезагрузки куртка надета (is-equipped)`);
      await p.screenshot({ path: `${OUT}/shop-equipped-${width}.png` });
      await p.screenshot({ path: `${OUT}/shop-full-${width}.png`, fullPage: true });

      // ── Закрытые вещи: без цены и без покупки ──
      if (pending) {
        const pcard = p.locator('button.item-card', { hasText: pending.name.ru });
        await pcard.waitFor({ timeout: 10_000 });
        check((await pcard.locator('[data-visual-status="pending"]').count()) === 1 && (await pcard.locator('.item-price').count()) === 0, `${width}px «${pending.name.ru}»: «визуал готовится», без цены`);
      }
      await p.locator('[role="tab"]').first().click();
      await p.waitForTimeout(400);
      await settle();
      await p.screenshot({ path: `${OUT}/rewards-${width}.png` });
      await noHScroll('награды');
      await taps('награды');
      await titles('награды');
      // Картинки костюмов ленивые: каждая прокручивается в экран, затем проверяется, что файл найден и декодирован.
      const arts = p.locator('.costume-card-art img');
      const artCount = await arts.count();
      for (let i = 0; i < artCount; i++) await arts.nth(i).scrollIntoViewIfNeeded();
      await p.waitForTimeout(600);
      const broken = await arts.evaluateAll((els) => (els as HTMLImageElement[]).filter((e) => !(e.complete && e.naturalWidth > 0)).length);
      check(artCount >= 5 && broken === 0, `${width}px награды: картинок костюмов ${artCount}, не загружено ${broken}`);
      await p.evaluate(() => window.scrollTo(0, 0));
      await p.screenshot({ path: `${OUT}/rewards-full-${width}.png`, fullPage: true });
      if (rewardNotOwned) {
        const rcard = p.locator('article.costume-card', { hasText: rewardNotOwned.name.ru });
        await rcard.waitFor({ timeout: 10_000 });
        check((await rcard.locator('.costume-card-cond').count()) >= 1, `${width}px закрытый костюм «${rewardNotOwned.name.ru}»: условие получения показано`);
        await rcard.getByRole('button', { name: 'Примерить' }).click();
        await p.locator('.action-sheet').waitFor({ timeout: 5_000 });
        check((await p.locator('.action-sheet button.btn-primary').count()) === 0, `${width}px закрытый костюм: кнопки покупки нет`);
        await p.locator('.action-sheet').getByRole('button', { name: 'Отменить примерку' }).click();
      }
      await context.close();
    }
  } finally {
    await browser.close();
    await stand.stop();
  }
  console.log(failures.length ? `\nОШИБОК: ${failures.length}\n- ${failures.join('\n- ')}` : '\nвсе проверки пройдены');
  process.exit(failures.length ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
