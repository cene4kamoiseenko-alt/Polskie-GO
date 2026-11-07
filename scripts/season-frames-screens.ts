/**
 * Картинки сезонов (присланы 2026-11-07) на настоящих экранах: обложка сезона на «Пропуске», карточки миссий и фон вступления миссии в Chromium.
 * Сезоны декабря–июня начинаются в будущем, поэтому время процесса сдвигается на середину каждого сезона (сервер и тест — один процесс).
 *
 *   node --import tsx scripts/season-frames-screens.ts   → test-results/season-frames/<сезон>-{pass,mission}.png
 *
 * Проверяется: обложка сезона и кадр миссии загружены (naturalWidth > 0), у привязанных миссий вступление берёт тот же кадр (`data-scene-art="pass-<slug>"`),
 * у остальных — прежняя сцена; нет горизонтальной прокрутки на 360 и 390 px. Это Chromium, не Telegram и не Android.
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromiumPath, startStand } from './lib/stand';

const root = process.cwd();
const require = createRequire(root + '/package.json');
const OUT = resolve(root, 'test-results/season-frames');

/** Сезон → день в его середине, привязанные и непривязанные миссии (как в season-art.test.js). */
const SEASONS: { slug: string; day: string; bound: string[]; plain: string[] }[] = [
  { slug: 'swieta', day: '2026-12-15', bound: ['jarmark-oscypek', 'wigilia-kolacja', 'sylwester-impreza'], plain: [] },
  { slug: 'karnawal', day: '2027-01-15', bound: ['paczki-zamowienie', 'trzech-kroli'], plain: ['dzien-babci'] },
  { slug: 'walentynki', day: '2027-02-14', bound: ['walentynki-kwiaty', 'walentynki-kolacja', 'most-tumski'], plain: [] },
  { slug: 'wielkanoc', day: '2027-03-20', bound: ['palma-pisanki', 'swieconka', 'smigus-dyngus'], plain: [] },
  { slug: 'wiosna', day: '2027-04-10', bound: ['rower-miejski'], plain: ['prima-aprilis', 'dzialka'] },
  { slug: 'majowka', day: '2027-05-10', bound: ['majowka-domek', 'grill-jezioro'], plain: ['trzeci-maja'] },
  { slug: 'wianki', day: '2027-06-15', bound: ['wianki-wisla'], plain: ['dzien-ojca', 'wakacje-pociag'] },
];

const failures: string[] = [];
const check = (ok: unknown, what: string) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) failures.push(what);
};

/** Сдвиг времени процесса: `new Date()` и `Date.now()` возвращают момент выбранного дня. */
function shiftTimeTo(day: string) {
  const Real = (globalThis as { __RealDate?: DateConstructor }).__RealDate ?? Date;
  (globalThis as { __RealDate?: DateConstructor }).__RealDate = Real;
  const offset = new Real(`${day}T10:00:00Z`).getTime() - Real.now();
  class Shifted extends Real {
    constructor(...args: unknown[]) {
      if (args.length === 0) super(Real.now() + offset);
      else super(...(args as [number]));
    }
    static now() {
      return Real.now() + offset;
    }
  }
  (globalThis as { Date: DateConstructor }).Date = Shifted as unknown as DateConstructor;
}

async function main() {
  const { chromium } = require('playwright') as typeof import('playwright');
  mkdirSync(OUT, { recursive: true });
  const stand = await startStand({ ui: 'dev' });
  const { db } = await import(root + '/apps/server/src/db/index.ts');
  const { subscriptions } = await import(root + '/apps/server/src/db/schema.ts');
  const browser = await chromium.launch({ headless: true, executablePath: chromiumPath(chromium), args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const pageErrors: string[] = [];
  let devUser = 998000;

  try {
    for (const season of SEASONS) {
      shiftTimeTo(season.day);
      const u = await stand.login();
      await u.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A0', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: null });
      await u.call('PATCH', '/api/me/settings', { theme: 'dark' });
      await db.insert(subscriptions).values({ userId: u.user.id, planCode: 'MONTH_1', status: 'ACTIVE', startsAt: new Date(), expiresAt: new Date(Date.now() + 40 * 86_400_000), grantedByAdminId: 'season-frames' });
      const id = String(++devUser);
      for (const width of [360, 390]) {
        const context = await browser.newContext({ viewport: { width, height: 800 }, deviceScaleFactor: 2, locale: 'ru-RU', colorScheme: 'dark' });
        const page = await context.newPage();
        page.on('pageerror', (e) => pageErrors.push(e.message));
        await page.addInitScript(({ token, id }) => localStorage.setItem('pg_auth', JSON.stringify({ token, owner: `dev:${id}`, exp: Date.now() + 86_400_000 })), { token: u.token, id });

        await page.goto(`${stand.base}/pass?devUser=${id}`);
        await page.locator('[data-pass-mission]').first().waitFor({ timeout: 30_000 });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(1200);
        const coverOk = await page.evaluate((slug) => {
          const el = document.querySelector(`img[data-season-cover="${slug}"]`) as HTMLImageElement | null;
          return !!el && el.complete && el.naturalWidth > 0;
        }, season.slug);
        check(coverOk, `${season.slug} ${width}px: обложка сезона загружена`);
        for (const slug of season.bound) {
          // Карточки ниже экрана грузятся лениво: прокручиваем к карточке.
          const card = page.locator(`img[data-pass-art="${slug}"]`);
          await card.scrollIntoViewIfNeeded().catch(() => undefined);
          const ok = await page
            // Начатая миссия (вступление уже открывали) показана как «Продолжить»: тот же кадр, но как миниатюра внутри `data-pass-featured`.
            .waitForFunction((s) => {
              const el = (document.querySelector(`img[data-pass-art="${s}"]`) ?? document.querySelector(`[data-pass-featured="${s}"] img[data-scene-art="pass-${s}"]`)) as HTMLImageElement | null;
              return !!el && el.complete && el.naturalWidth > 0;
            }, slug, { timeout: 10_000 })
            .then(() => true, () => false);
          check(ok, `${season.slug} ${width}px: карточка «${slug}» с кадром сезона`);
        }
        for (const slug of season.plain) {
          check((await page.locator(`img[data-pass-art="${slug}"]`).count()) === 0, `${season.slug} ${width}px: у «${slug}» кадра сезона нет (своя сцена)`);
        }
        check((await page.evaluate(() => document.documentElement.scrollWidth)) <= width, `${season.slug} ${width}px: нет горизонтальной прокрутки на /pass`);
        if (width === 390) await page.screenshot({ path: `${OUT}/${season.slug}-pass.png` });

        // Вступление миссии: фон — тот же кадр.
        const first = season.bound[0];
        await page.goto(`${stand.base}/life/${first}?devUser=${id}`);
        await page.locator(`img[data-scene-art="pass-${first}"]`).waitFor({ timeout: 30_000 }).catch(() => undefined);
        await page.waitForTimeout(900);
        const hero = await page.evaluate((slug) => {
          const el = document.querySelector(`img[data-scene-art="pass-${slug}"]`) as HTMLImageElement | null;
          return !!el && el.complete && el.naturalWidth > 0;
        }, first);
        check(hero, `${season.slug} ${width}px: вступление «${first}» показывает кадр сезона`);
        check((await page.evaluate(() => document.documentElement.scrollWidth)) <= width, `${season.slug} ${width}px: нет горизонтальной прокрутки во вступлении`);
        if (width === 390) await page.screenshot({ path: `${OUT}/${season.slug}-mission.png` });
        await context.close();
      }
    }
  } finally {
    await browser.close();
    await stand.stop();
  }
  check(pageErrors.length === 0, `нет ошибок страницы (${pageErrors.slice(0, 3).join(' | ')})`);
  console.log(failures.length ? `\nПРОВАЛЕНО: ${failures.length}` : '\nВсе проверки пройдены');
  process.exit(failures.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
