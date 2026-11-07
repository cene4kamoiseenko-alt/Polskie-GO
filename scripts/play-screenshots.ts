/**
 * Скриншоты для карточки Google Play: настоящие экраны приложения в Chromium (эмуляция телефона 390×760, масштаб 3 → 1170×2280, отношение сторон < 2:1, как требует Play).
 *
 *   node --import tsx scripts/play-screenshots.ts   → docs/play/screenshots/NN-<экран>.jpg
 *
 * Игрок проходит знакомство, делает урок и миссию, получает Premium (чтобы кадры были «живыми»); тёмная тема, русский интерфейс.
 * Это Chromium, а не Android: на телефоне вид может отличаться шрифтами и системными панелями.
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromiumPath, startStand } from './lib/stand';

const root = process.cwd();
const require = createRequire(root + '/package.json');
const OUT = resolve(root, 'docs/play/screenshots');

async function main() {
  const { chromium } = require('playwright') as typeof import('playwright');
  const stand = await startStand({ ui: 'dev' });
  const { db } = await import(root + '/apps/server/src/db/index.ts');
  const { subscriptions } = await import(root + '/apps/server/src/db/schema.ts');
  mkdirSync(OUT, { recursive: true });
  const u = await stand.login();
  await u.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A0', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: null });
  await u.call('PATCH', '/api/me/settings', { theme: 'dark', reducedMotion: false });
  await db.insert(subscriptions).values({ userId: u.user.id, planCode: 'MONTH_1', status: 'ACTIVE', startsAt: new Date(), expiresAt: new Date(Date.now() + 30 * 86_400_000), grantedByAdminId: 'play-screenshots' });
  // Миссия начата и пройдена наполовину: на экране миссий есть «Продолжить».
  await u.call('POST', '/api/missions/marcin-rogal/start', {});

  const browser = await chromium.launch({ headless: true, executablePath: chromiumPath(chromium), args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const id = '997001';
  const context = await browser.newContext({ viewport: { width: 390, height: 760 }, deviceScaleFactor: 3, locale: 'ru-RU', colorScheme: 'dark' });
  const page = await context.newPage();
  await page.addInitScript(({ token, id }) => localStorage.setItem('pg_auth', JSON.stringify({ token, owner: `dev:${id}`, exp: Date.now() + 86_400_000 })), { token: u.token, id });
  const lessonId = (await u.call('GET', '/api/journey')).body.nextLesson.id as string;

  const shots: [string, string, string][] = [
    ['01-home', '/', 'main'],
    ['02-map', '/map', 'main'],
    ['03-pass', '/pass', '[data-pass-mission], [data-pass-featured]'],
    ['04-lesson', `/lesson/${lessonId}`, 'main'],
    ['05-wardrobe', '/shop', 'main'],
    ['06-life', '/life', 'main'],
  ];
  for (const [name, path, wait] of shots) {
    await page.goto(`${stand.base}${path}${path.includes('?') ? '&' : '?'}devUser=${id}`);
    await page.locator(wait).first().waitFor({ timeout: 30_000 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1800);
    await page.screenshot({ path: `${OUT}/${name}.jpg`, type: 'jpeg', quality: 88 });
    console.log('ok  ', name);
  }
  await browser.close();
  await stand.stop();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
