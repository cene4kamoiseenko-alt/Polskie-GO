/** Real local API + D1, responsive raster/streak smoke check. No external writes. */
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';
import { eq } from 'drizzle-orm';
import { dayKey } from '@polski-go/shared';
import { startStand, chromiumPath } from './lib/stand';

async function main() {
const stand = await startStand({ ui: 'dev' });
const { db } = await import('../apps/server/src/db');
const { playerProgress, dailyActivity } = await import('../apps/server/src/db/schema');
const browser = await chromium.launch({ executablePath: chromiumPath(chromium), args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const errors: string[] = [];
let checks = 0;
const check = (ok: unknown, message: string) => { if (!ok) throw new Error(message); checks++; };
mkdirSync('test-results/visual-style', { recursive: true });
try {
  const user = await stand.login();
  await user.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A0', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: null });
  await user.call('PATCH', '/api/me/settings', { theme: 'dark', reducedMotion: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await context.addInitScript(({ token }) => localStorage.setItem('pg_auth', JSON.stringify({ token, owner: 'dev:998812', exp: Date.now() + 86400000 })), { token: user.token });
  const page = await context.newPage();
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', response => { if (response.status() >= 400 && response.url().includes('/api/')) console.error(response.status(), response.url()); });
  for (const state of [0, 7, 30, 100]) {
    const today = dayKey(new Date(), 'Europe/Warsaw');
    await db.update(playerProgress).set({ streakCurrent: state, streakBest: Math.max(30, state), lastActiveDay: state ? today : null }).where(eq(playerProgress.userId, user.user.id));
    await db.insert(dailyActivity).values({ userId: user.user.id, day: today, xp: state ? 50 : 0, exercises: state ? 10 : 0 }).onConflictDoUpdate({ target: [dailyActivity.userId, dailyActivity.day], set: { xp: state ? 50 : 0, exercises: state ? 10 : 0 } });
    await page.goto(`${stand.base}/?devUser=998812`);
    const card = page.locator('[data-streak-card]');
    await card.locator('.streak-week li').last().waitFor({ timeout: 30_000 }).catch(async error => {
      await page.screenshot({ path: 'test-results/visual-style/failure.png', fullPage: true });
      console.error(await page.locator('body').innerText());
      throw error;
    });
    for (const width of [320, 390, 430]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => document.fonts.ready);
      check(await card.locator('.streak-count strong').innerText() === String(state), `${width}/${state}: server streak`);
      check(await card.locator('.streak-week li').count() === 7, 'Seven actual calendar days');
      check(await card.locator('.streak-week li').last().getAttribute('data-active') === String(state > 0), 'Today follows server activity');
      check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}/${state}: page overflow`);
      check(await card.evaluate(el => el.scrollWidth <= el.clientWidth), `${width}/${state}: card overflow`);
      check(await card.locator('.streak-flame img').evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0), 'Original flame loaded');
      check(await page.locator('[data-premium-pill] img').count() === 1, 'Premium crown is raster');
      check(await page.locator('nav .nav-raster').count() === 5, 'Five original raster navigation icons');
      check(await card.locator('.streak-flame').evaluate(el => getComputedStyle(el).animationName) === 'none', 'Reduced motion respected');
      if (width === 390) {
        await page.locator('[data-home-house]').scrollIntoViewIfNeeded();
        await page.locator('[data-home-house] img').waitFor();
        await page.locator('[data-home-house] img').evaluate((img: HTMLImageElement) => img.decode());
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({ path: `test-results/visual-style/home-streak-${state}.png`, fullPage: true });
      }
    }
  }
  await user.call('PATCH', '/api/me/settings', { theme: 'light', uiLanguage: 'en' });
  await page.goto(`${stand.base}/profile?devUser=998812`);
  await page.locator('[data-streak-card] .streak-week li').last().waitFor();
  await page.waitForFunction(() => document.querySelector('[data-streak-card] .streak-eyebrow')?.textContent === 'Your daily rhythm');
  check(await page.locator('[data-streak-card] .streak-eyebrow').textContent() === 'Your daily rhythm', 'English profile');
  check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Light profile overflow');
  await page.screenshot({ path: 'test-results/visual-style/profile-light-en.png', fullPage: true });
  check(errors.length === 0, `Browser errors: ${errors.join(', ')}`);
  console.log(`PASS ${checks} checks; screenshots in test-results/visual-style`);
} finally {
  await browser.close();
  await stand.stop();
}

}
main().catch(error => { console.error(error); process.exitCode = 1; });
