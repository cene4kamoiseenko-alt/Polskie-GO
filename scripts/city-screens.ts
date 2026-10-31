/**
 * Реальные снимки фонов городов на 320 / 360 / 390 / 430 px: главная (герой текущего города, без проверки банера: у героя своя разметка), карта и шторка двух городов —
 * с финальным кадром (Gdańsk) и без него (Katowice: временный кадр не показывается, вместо него рисованная сцена). Проверяет, что картинка
 * декодирована, имеет ленивую загрузку и srcset с 640w, не вытянута (натуральное отношение сторон шире 1.4:1) и что на экране нет горизонтальной прокрутки.
 * Chromium, а не Telegram на iPhone / Android.
 *
 * Запуск: node --import tsx scripts/city-screens.ts   → test-results/city-screens/<экран>-<ширина>.png
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromiumPath, startStand } from './lib/stand';

const root = process.cwd();
const require = createRequire(root + '/package.json');
const OUT = resolve(root, 'test-results/city-screens');
const WIDTHS = [320, 360, 390, 430];
const HEIGHT: Record<number, number> = { 320: 700, 360: 780, 390: 844, 430: 932 };

const failures: string[] = [];
const check = (ok: unknown, what: string) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) failures.push(what);
};

async function main() {
  const { chromium } = require('playwright') as typeof import('playwright');
  const stand = await startStand({ ui: 'dev' });
  const { base, login } = stand;
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: chromiumPath(chromium), args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  let devUser = 995000;
  try {
    for (const width of WIDTHS) {
      const u = await login();
      await u.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A0', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: null });
      const id = String(++devUser);
      const context = await browser.newContext({ viewport: { width, height: HEIGHT[width] }, deviceScaleFactor: 2, locale: 'ru-RU' });
      const p = await context.newPage();
      await p.addInitScript(({ token, id }) => {
        localStorage.setItem('pg_auth', JSON.stringify({ token, owner: `dev:${id}`, exp: Date.now() + 86_400_000 }));
      }, { token: u.token, id });
      const settle = async () => {
        await p.waitForFunction(() => !document.querySelector('[data-skeleton]'), undefined, { timeout: 20_000 }).catch(() => {});
        await p.evaluate(() => document.fonts.ready);
        await p.waitForTimeout(900);
      };
      const noHScroll = async (what: string) =>
        check(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${width}px ${what}: нет горизонтальной прокрутки`);
      /** Все банеры города на экране декодированы, имеют 2:1 и srcset с 640w. */
      const banners = async (what: string, min = 1) => {
        const info = await p.locator('[data-city-art] img').evaluateAll((els) =>
          (els as HTMLImageElement[]).map((el) => ({ ok: el.complete && el.naturalWidth > 0, ratio: el.naturalWidth / el.naturalHeight, srcset: el.srcset.includes('640w'), src: el.currentSrc.split('/').pop() })));
        check(info.length >= min, `${width}px ${what}: банеров на экране ${info.length}`);
        for (const b of info) check(b.ok && b.ratio > 1.4, `${width}px ${what}: ${b.src} декодирован, ${b.ratio.toFixed(2)}:1`);
      };

      await p.goto(`${base}/?devUser=${id}`);
      await p.locator('nav a[href="/"]').waitFor({ timeout: 20_000 }).catch(() => {});
      await settle();
      await p.screenshot({ path: `${OUT}/home-${width}.png` });
      await noHScroll('главная');

      await p.goto(`${base}/map?devUser=${id}`);
      await p.locator('[data-current-city]').waitFor({ timeout: 20_000 });
      await settle();
      await p.screenshot({ path: `${OUT}/map-${width}.png` });
      await noHScroll('карта');

      for (const [name, slug, art] of [['Gdańsk', 'gdansk', 'final'], ['Katowice', 'katowice', 'final'], ['Zakopane', 'zakopane', 'interim'], ['Rzeszów', 'rzeszow', 'interim']] as const) {
        const dialog = p.locator('[role="dialog"]');
        if (await dialog.count()) { await p.keyboard.press('Escape'); await p.waitForTimeout(500); }
        // Иллюстрированная карта (ADR-012): выбрать город (Enter после фокуса подводит камеру) и открыть «Подробнее».
        await p.locator(`[data-spot="${slug}"]`).focus();
        await p.keyboard.press('Enter');
        await p.locator('[data-map-card] [data-map-details]').click();
        await dialog.waitFor({ state: 'visible', timeout: 10_000 });
        await settle();
        await p.screenshot({ path: `${OUT}/map-${slug}-${width}.png` });
        if (art === 'interim') {
          // Zakopane и Rzeszów: временный кадр, показ разрешён владельцем 2026-10-31 (CITY_ART.shown).
          const img = dialog.locator('[data-city-art="interim"] img');
          check(await img.count() === 1 && await img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0 && el.srcset.includes('640w')), `${width}px шторка ${name}: фото города (временный кадр с разрешения владельца), srcset с 640w`);
          await noHScroll(`шторка ${name}`);
          continue;
        }
        check(await dialog.locator(`[data-city-art="${art}"] img`).count() === 1, `${width}px шторка ${name}: баннер ${art}`);
        const lazy = await dialog.locator(`[data-city-art="${art}"] img`).evaluate((el: HTMLImageElement) => el.loading === 'lazy' && el.srcset.includes('640w'));
        check(lazy, `${width}px шторка ${name}: lazy и srcset с 640w`);
        await banners(`шторка ${name}`);
        await noHScroll(`шторка ${name}`);
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
