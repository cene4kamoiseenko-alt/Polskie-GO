/**
 * Готовые образы Бобека в реальном браузере (Chromium, не Telegram на iPhone / Android): ADR-008.
 *
 *   node --import tsx scripts/variants-screens.ts   → test-results/variants-screens/*.png
 *
 * 1. QA-галерея /__gallery?look: 21 образ (16 сетки и 5 с куртками), у каждого картинка декодируется, режим variant (стартовый набор — legacy-base),
 *    нет горизонтальной прокрутки; снимок на тёмном фоне (видна прозрачность вырезки).
 * 2. Магазин на 320 / 390 / 430: примерка кепки показывает образ «худи + кепка + рюкзак» (data-look-mode=variant, картинка
 *    загружена), «Надеть» сохраняется на сервере и переживает перезагрузку, полный набор (кепка + очки + шарф + рюкзак) рисуется
 *    одним образом, а главная показывает тот же набор (один образ на всех экранах), рюкзак можно снять — образ без рюкзака.
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromiumPath, startStand } from './lib/stand';

const root = process.cwd();
const require = createRequire(root + '/package.json');
const OUT = resolve(root, 'test-results/variants-screens');
const WIDTHS = [320, 390, 430];
const HEIGHT: Record<number, number> = { 320: 700, 390: 844, 430: 932 };

const failures: string[] = [];
const check = (ok: unknown, what: string) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) failures.push(what);
};

type ShopRow = { id: string; assetKey: string; name: { ru: string } };

async function main() {
  const { chromium } = require('playwright') as typeof import('playwright');
  const stand = await startStand({ ui: 'dev' });
  const { base, login, env } = stand;
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: chromiumPath(chromium), args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  try {
    // ── 1. Галерея ──
    {
      const ctx = await browser.newContext({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 1 });
      const p = await ctx.newPage();
      await p.goto(`${base}/__gallery?look&dark`);
      await p.locator('[data-gallery="look"]').waitFor({ timeout: 20_000 });
      await p.waitForFunction(() => Array.from(document.images).every((i) => i.complete), undefined, { timeout: 20_000 }).catch(() => {});
      await p.waitForTimeout(500);
      const tiles = await p.locator('[data-gallery-look^="hoodie"]').evaluateAll((els) =>
        els.map((el) => ({
          id: el.getAttribute('data-gallery-look')!,
          mode: el.querySelector('[data-look]')?.getAttribute('data-look-mode'),
          loaded: Array.from(el.querySelectorAll('img')).length > 0 && Array.from(el.querySelectorAll('img')).every((i) => i.naturalWidth > 0),
        })),
      );
      check(tiles.length === 21, `галерея: 21 готовый образ — 16 сетки и 5 с куртками (${tiles.length})`);
      const broken = tiles.filter((t) => !t.loaded).map((t) => t.id);
      check(broken.length === 0, `галерея: у каждого образа картинка загружена${broken.length ? ` (нет: ${broken.join(', ')})` : ''}`);
      const wrongMode = tiles.filter((t) => t.mode !== (t.id === 'hoodie-pack' ? 'legacy-base' : 'variant')).map((t) => `${t.id}:${t.mode}`);
      check(wrongMode.length === 0, `галерея: режим variant у 20 образов, стартовый набор — legacy-base${wrongMode.length ? ` (${wrongMode.join(', ')})` : ''}`);
      check(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'галерея: нет горизонтальной прокрутки');
      await p.screenshot({ path: `${OUT}/gallery-dark.png`, fullPage: true });
      await ctx.close();
    }

    // ── 2. Магазин ──
    let devUser = 998000;
    for (const width of WIDTHS) {
      const u = await login();
      await u.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A0', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: null });
      const id = String(++devUser);
      for (const slug of ['cap-red', 'glasses-round', 'scarf-pl', 'jacket-denim', 'jacket-rain']) {
        await env.DB.prepare("INSERT INTO user_inventory (user_id, item_id, equipped, source) SELECT ?, id, 0, 'variants-check' FROM cosmetic_items WHERE slug = ?").bind(u.user.id, slug).run();
      }
      const shop = (await u.call('GET', '/api/shop')).body as { items: ShopRow[] };
      const itemId = (key: string) => shop.items.find((i) => i.assetKey === key)!.id;
      const cap = shop.items.find((i) => i.assetKey === 'cap-red')!;

      const ctx = await browser.newContext({ viewport: { width, height: HEIGHT[width] }, deviceScaleFactor: 2, locale: 'ru-RU' });
      const p = await ctx.newPage();
      await p.addInitScript(({ token, id }) => {
        localStorage.setItem('pg_auth', JSON.stringify({ token, owner: `dev:${id}`, exp: Date.now() + 86_400_000 }));
      }, { token: u.token, id });
      const settle = async () => {
        await p.waitForFunction(() => !document.querySelector('[data-skeleton]'), undefined, { timeout: 20_000 }).catch(() => {});
        await p.evaluate(() => document.fonts.ready);
        await p.waitForTimeout(700);
      };
      const stage = () => p.locator('.wardrobe-stage [data-look]').first();
      const layerOk = async (what: string, asset: RegExp) => {
        const info = await stage().evaluate((el) => {
          const img = el.querySelector('img[data-look-layer]') as HTMLImageElement | null;
          return { src: img?.currentSrc ?? '', ok: !!img && img.naturalWidth > 0 };
        });
        check(info.ok && asset.test(info.src), `${width}px ${what}: картинка образа загружена (${info.src.split('/').pop()?.slice(0, 40)})`);
      };

      await p.goto(`${base}/shop?tab=shop&devUser=${id}`);
      await p.locator('[role="tablist"]').waitFor({ timeout: 20_000 });
      await settle();
      check((await stage().getAttribute('data-look-mode')) === 'legacy-base', `${width}px старт: цельный образ с 14 позами (legacy-base)`);

      // Примерка кепки.
      await p.locator('.chip-tab', { hasText: 'Шапки' }).first().click();
      const card = p.locator('button.item-card', { hasText: cap.name.ru });
      await card.waitFor({ timeout: 10_000 });
      await card.click();
      const sheet = p.locator('.action-sheet');
      await sheet.waitFor({ timeout: 5_000 });
      await p.waitForTimeout(700);
      check((await stage().getAttribute('data-look-preview')) === 'true', `${width}px примерка помечена data-look-preview`);
      check((await stage().getAttribute('data-look-mode')) === 'variant', `${width}px примерка кепки: режим variant`);
      check(((await stage().getAttribute('data-look-items')) ?? '').split(' ').includes('cap-red'), `${width}px примерка: кепка среди нарисованных (${await stage().getAttribute('data-look-items')})`);
      check(((await stage().getAttribute('data-look-pending')) ?? '') === '', `${width}px примерка: нет «визуал готовится» у кепки`);
      await layerOk('примерка', /hoodie-cap-pack_(wave|open)/);
      check((await sheet.locator('[data-visual-status="pending"]').count()) === 0, `${width}px панель действия: нет пометки «визуал готовится»`);
      await p.screenshot({ path: `${OUT}/try-cap-${width}.png` });

      // Надеть → сервер → перезагрузка.
      await sheet.getByRole('button', { name: 'Надеть' }).click();
      await sheet.waitFor({ state: 'detached', timeout: 10_000 });
      const wear = (await u.call('GET', '/api/me')).body.outfit.wear as Record<string, string>;
      check(wear.HAT === 'cap-red', `${width}px «Надеть»: на сервере надета кепка (${Object.values(wear).sort().join(' ')})`);
      await p.reload();
      await p.locator('[role="tablist"]').waitFor({ timeout: 20_000 });
      await settle();
      check((await stage().getAttribute('data-look-mode')) === 'variant', `${width}px после перезагрузки: режим variant`);
      check(((await stage().getAttribute('data-look-equipped')) ?? '').includes('cap-red'), `${width}px после перезагрузки кепка надета`);
      await layerOk('после перезагрузки', /hoodie-cap-pack_wave/);

      // Полный набор.
      for (const key of ['glasses-round', 'scarf-pl']) await u.call('POST', '/api/inventory/equip', { itemId: itemId(key), equipped: true });
      await p.reload();
      await p.locator('[role="tablist"]').waitFor({ timeout: 20_000 });
      await settle();
      check(((await stage().getAttribute('data-look-items')) ?? '').split(' ').sort().join(' ') === 'backpack-travel cap-red glasses-round hoodie-red scarf-pl', `${width}px полный набор нарисован одним образом (${await stage().getAttribute('data-look-items')})`);
      await layerOk('полный набор', /hoodie-cap-glasses-scarf-pack_wave/);
      await p.screenshot({ path: `${OUT}/full-set-${width}.png` });

      // Главная показывает тот же набор.
      await p.goto(`${base}/?devUser=${id}`);
      await settle();
      const homeItems = await p.locator('[data-look]:not([data-look-preview="true"])').first().getAttribute('data-look-items');
      check(homeItems?.split(' ').sort().join(' ') === 'backpack-travel cap-red glasses-round hoodie-red scarf-pl', `${width}px главная: тот же набор, что в магазине (${homeItems})`);
      await p.screenshot({ path: `${OUT}/home-${width}.png` });

      // Снять рюкзак: образ без рюкзака (раньше он был впечатан навсегда).
      await u.call('POST', '/api/inventory/equip', { itemId: itemId('backpack-travel'), equipped: false });
      await p.goto(`${base}/?devUser=${id}`);
      await settle();
      const noPack = await p.locator('[data-look]:not([data-look-preview="true"])').first().getAttribute('data-look-items');
      check(noPack?.split(' ').sort().join(' ') === 'cap-red glasses-round hoodie-red scarf-pl', `${width}px без рюкзака: рюкзака на образе нет (${noPack})`);
      check(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${width}px главная: нет горизонтальной прокрутки`);

      // Куртка (вторая партия, частичная сетка): джинсовая + кепка + очки + рюкзак — готовый образ; шарфа в нём нет (такого образа не нарисовано).
      await u.call('POST', '/api/inventory/equip', { itemId: itemId('backpack-travel'), equipped: true });
      await u.call('POST', '/api/inventory/equip', { itemId: itemId('jacket-denim'), equipped: true });
      await u.call('POST', '/api/inventory/equip', { itemId: itemId('scarf-pl'), equipped: false });
      await p.goto(`${base}/shop?tab=shop&devUser=${id}`);
      await p.locator('[role="tablist"]').waitFor({ timeout: 20_000 });
      await settle();
      check((await stage().getAttribute('data-look-mode')) === 'variant', `${width}px куртка: режим variant`);
      check(((await stage().getAttribute('data-look-items')) ?? '').split(' ').sort().join(' ') === 'backpack-travel cap-red glasses-round jacket-denim', `${width}px куртка: нарисованы куртка, кепка, очки, рюкзак; худи — подкладка картинки, в списке вещей его нет (${await stage().getAttribute('data-look-items')})`);
      await layerOk('куртка', /hoodie-denim-cap-glasses-pack_wave/);
      await p.screenshot({ path: `${OUT}/denim-${width}.png` });
      // Примерка шарфа: образа «куртка + кепка + очки + шарф + рюкзак» нет — честная пометка, а не чужая картинка.
      const scarf = shop.items.find((i) => i.assetKey === 'scarf-pl')!;
      await p.locator('.chip-tab', { hasText: 'Шарфы' }).first().click();
      const scarfCard = p.locator('button.item-card', { hasText: scarf.name.ru });
      await scarfCard.waitFor({ timeout: 10_000 });
      await scarfCard.click();
      await p.locator('.action-sheet').waitFor({ timeout: 5_000 });
      await p.waitForTimeout(600);
      const note = p.locator('[data-try-note="hidden"]');
      check((await note.count()) === 1 && /нет картинки/.test((await note.textContent()) ?? ''), `${width}px примерка шарфа поверх куртки: «Для этого сочетания нет картинки» (${(await note.textContent().catch(() => '')) ?? ''})`);
      check(!((await stage().getAttribute('data-look-items')) ?? '').split(' ').includes('scarf-pl'), `${width}px примерка шарфа: шарфа на Бобеке нет`);
      await p.screenshot({ path: `${OUT}/denim-try-scarf-${width}.png` });
      await ctx.close();
    }
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
