/**
 * Реальные снимки сцен миссий на 320 / 360 / 390 / 430 px: список «Польский в жизни» (/life) и экран входа в каждую миссию
 * с растровой сценой (SCENE_ART). Premium-миссии открываются только с подпиской: пользователь стенда получает её записью
 * в локальную тестовую базу (Miniflare), не через оплату. Проверяет: картинка декодирована, ленивая в карточке и сразу в герое миссии, srcset с 640w,
 * object-fit: cover (не растянута), кадр 2:1, на экране нет горизонтальной прокрутки, а у миссии с Бобеком в кадре нет
 * накладного второго Бобека; у миссии без картинки (Lidl) остаётся SVG-сцена и свой Бобек.
 * Chromium, а не Telegram на iPhone / Android.
 *
 * Запуск: node --import tsx scripts/mission-screens.ts   → test-results/mission-screens/<экран>-<ширина>.png
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { MISSION_SCENE_ART, SCENE_ART } from '../packages/shared/src/sceneArt';
import { chromiumPath, startStand } from './lib/stand';

const root = process.cwd();
const require = createRequire(root + '/package.json');
const OUT = resolve(root, 'test-results/mission-screens');
const WIDTHS = [320, 360, 390, 430];
const HEIGHT: Record<number, number> = { 320: 700, 360: 780, 390: 844, 430: 932 };
const WITH_ART = Object.keys(MISSION_SCENE_ART);

const failures: string[] = [];
const check = (ok: unknown, what: string) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) failures.push(what);
};

async function main() {
  const { chromium } = require('playwright') as typeof import('playwright');
  const stand = await startStand({ ui: 'dev' });
  const { base, login } = stand;
  const { db } = await import(root + '/apps/server/src/db/index.ts');
  const { subscriptions } = await import(root + '/apps/server/src/db/schema.ts');
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: chromiumPath(chromium), args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  let devUser = 996000;
  try {
    for (const width of WIDTHS) {
      const u = await login();
      await u.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A0', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: null });
      await db.insert(subscriptions).values({ userId: u.user.id, planCode: 'MONTH_1', status: 'ACTIVE', startsAt: new Date(), expiresAt: new Date(Date.now() + 86_400_000), grantedByAdminId: 'qa-mission-screens' });
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

      // Список: каждая картинка прокручивается в экран (ленивая загрузка), затем проверяется.
      await p.goto(`${base}/life?devUser=${id}`);
      await p.locator('[data-scene-art]').first().waitFor({ timeout: 20_000 });
      await settle();
      const cards = p.locator('[data-scene-art]');
      const count = await cards.count();
      check(count === WITH_ART.length, `${width}px /life: картинок сцен ${count} из ${WITH_ART.length}`);
      for (let i = 0; i < count; i++) {
        await cards.nth(i).scrollIntoViewIfNeeded();
        await p.waitForTimeout(250);
      }
      await p.waitForTimeout(600);
      const info = await cards.evaluateAll((els) =>
        (els as HTMLImageElement[]).map((el) => ({
          id: el.dataset.sceneArt!, ok: el.complete && el.naturalWidth > 0, ratio: el.naturalWidth / el.naturalHeight,
          lazy: el.loading === 'lazy', srcset: el.srcset.includes('640w'), fit: getComputedStyle(el).objectFit, src: el.currentSrc.split('/').pop(),
        })));
      for (const c of info) {
        check(c.ok && Math.abs(c.ratio - 2) < 0.01, `${width}px /life ${c.id}: декодирован ${c.src}, ${c.ratio.toFixed(2)}:1`);
        check(c.lazy && c.srcset && c.fit === 'cover', `${width}px /life ${c.id}: lazy, srcset с 640w, object-fit: cover`);
      }
      await p.evaluate(() => window.scrollTo(0, 0));
      await p.waitForTimeout(300);
      await p.screenshot({ path: `${OUT}/life-${width}.png` });
      await p.screenshot({ path: `${OUT}/life-full-${width}.png`, fullPage: true });
      await noHScroll('/life');

      // Экран входа в каждую миссию с картинкой и в три миссии без картинки (свой Бобек в позе по сюжету: кофе, оплата, привет).
      for (const slug of [...WITH_ART, 'orlen-coffee', 'krakow-pierogi', 'urzad-pesel']) {
        await p.goto(`${base}/life/${slug}?devUser=${id}`);
        await p.locator('h1').first().waitFor({ timeout: 20_000 });
        await settle();
        const hero = p.locator('img[data-scene-art]');
        const baked = WITH_ART.includes(slug);
        const art = SCENE_ART[MISSION_SCENE_ART[slug] ?? ''];
        if (baked) {
          await hero.first().waitFor({ timeout: 10_000 });
          const h = await hero.first().evaluate((el: HTMLImageElement) => ({
            id: el.dataset.sceneArt, ok: el.complete && el.naturalWidth > 0, ratio: el.naturalWidth / el.naturalHeight, eager: el.loading === 'eager', fit: getComputedStyle(el).objectFit,
            box: [el.clientWidth, el.clientHeight], src: el.currentSrc.split('/').pop(),
          }));
          check(h.id === art.id && h.ok && Math.abs(h.ratio - 2) < 0.01, `${width}px ${slug}: герой ${h.id}, ${h.src} декодирован`);
          check(h.eager && h.fit === 'cover', `${width}px ${slug}: герой без lazy, object-fit: cover, ${h.box[0]}×${h.box[1]}`);
        } else {
          check((await hero.count()) === 0, `${width}px ${slug}: у миссии без картинки остаётся SVG-сцена`);
        }
        // Кнопка «закрыть» лежит на фото: фон не прозрачный (раньше `bg-elev/90` не давал правила и кнопка пропадала на светлых кадрах).
        const closeBg = await p.getByRole('button', { name: 'close' }).first().evaluate((el) => getComputedStyle(el).backgroundColor);
        check(!/rgba\(0, 0, 0, 0\)|transparent/.test(closeBg), `${width}px ${slug}: у кнопки закрытия есть фон (${closeBg})`);
        // Второго Бобека поверх кадра с Бобеком нет; без картинки свой Бобек на месте.
        check((await p.locator('.beaver-look').count()) === (baked ? 0 : 1), `${width}px ${slug}: накладных Бобеков ${baked ? 0 : 1}`);
        await p.screenshot({ path: `${OUT}/mission-${slug}-${width}.png` });
        await noHScroll(`миссия ${slug}`);
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
