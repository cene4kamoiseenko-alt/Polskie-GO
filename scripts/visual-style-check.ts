/** Real local API + D1, responsive raster/streak smoke check. No external writes. */
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';
import { eq } from 'drizzle-orm';
import { dayKey } from '@polski-go/shared';
import { startStand, chromiumPath } from './lib/stand';

async function main() {
const stand = await startStand({ ui: 'dist' });
const { db } = await import('../apps/server/src/db');
const { playerProgress, dailyActivity, userVocabulary, vocabularyEntries, reviewSchedule } = await import('../apps/server/src/db/schema');
const browser = await chromium.launch({ executablePath: chromiumPath(chromium), args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const errors: string[] = [];
const pending = new Set<string>();
let checks = 0;
const check = (ok: unknown, message: string) => { if (!ok) throw new Error(message); checks++; };
mkdirSync('test-results/visual-style', { recursive: true });
let debugPage: import('playwright').Page | undefined;
try {
  const user = await stand.login();
  await user.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A0', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: null });
  await user.call('PATCH', '/api/me/settings', { theme: 'dark', reducedMotion: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  // Local web flows do not use Telegram initData; avoid a third-party blocking SDK request.
  await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
  await context.addInitScript(({ token }) => localStorage.setItem('pg_auth', JSON.stringify({ token, owner: 'dev:998812', exp: Date.now() + 86400000 })), { token: user.token });
  const page = await context.newPage();
  debugPage = page;
  page.on('pageerror', e => errors.push(e.message));
  page.on('request', request => pending.add(new URL(request.url()).pathname));
  page.on('requestfinished', request => pending.delete(new URL(request.url()).pathname));
  page.on('requestfailed', request => pending.delete(new URL(request.url()).pathname));
  page.on('response', response => { if (response.status() >= 400 && response.url().includes('/api/')) console.error(response.status(), response.url()); });
  for (const state of [0, 7, 30, 100]) {
    const today = dayKey(new Date(), 'Europe/Warsaw');
    await db.update(playerProgress).set({ streakCurrent: state, streakBest: Math.max(30, state), lastActiveDay: state ? today : null }).where(eq(playerProgress.userId, user.user.id));
    await db.insert(dailyActivity).values({ userId: user.user.id, day: today, xp: state ? 50 : 0, exercises: state ? 10 : 0 }).onConflictDoUpdate({ target: [dailyActivity.userId, dailyActivity.day], set: { xp: state ? 50 : 0, exercises: state ? 10 : 0 } });
    await page.goto(`${stand.base}/?devUser=998812`);
    await page.locator('[data-open-streak]').click();
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
        await page.locator('[data-sheet-close]').click();
        await page.locator('[data-sheet]').waitFor({ state: 'hidden' });
        await page.locator('[data-compact-home] img').evaluateAll((images: HTMLImageElement[]) => Promise.all(images.map(img => img.decode().catch(() => undefined))));
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({ path: `test-results/visual-style/home-streak-${state}.png`, fullPage: true });
        await page.locator('[data-open-streak]').click();
        await card.locator('.streak-week li').last().waitFor();
      }
    }
  }
  await page.locator('[data-sheet-close]').click();
  await page.locator('[data-sheet]').waitFor({ state: 'hidden' });
  check(await page.locator('[data-home-event]').count() === 1, 'Exactly one home invitation');
  check(await page.locator('[data-streak-card]').count() === 0, 'Full streak removed from home until opened');
  check(await page.locator('[data-open-streak]').evaluate(button => button.getBoundingClientRect().height <= 44), 'Streak is a compact header indicator');
  check(await page.locator('[data-open-today]').evaluate(button => button.getBoundingClientRect().height <= 58), 'Daily tasks remain compact');
  check(await page.locator('[data-compact-home] svg').count() === 0, 'Home uses raster art, no inline SVG');

  // A failed request must not create a receipt or change the wallet.
  const walletBefore = (await user.call('GET', '/api/me')).body.zlotki;
  const houseBefore = (await user.call('GET', '/api/house')).body;
  await page.route('**/api/house/bonus', route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'test_unavailable', message: 'Temporarily unavailable' }) }));
  await page.locator('[data-home-claim="bonus"]').click();
  await page.waitForFunction(() => !(document.querySelector('[data-home-claim="bonus"]') as HTMLButtonElement)?.disabled);
  check(await page.locator('[data-reward-modal]').count() === 0, 'Failed claim does not show a reward');
  check((await user.call('GET', '/api/me')).body.zlotki === walletBefore, 'Failed claim leaves wallet unchanged');
  await page.unroute('**/api/house/bonus');
  let claims = 0;
  const countClaim = (request: import('playwright').Request) => { if (request.method() === 'POST' && request.url().endsWith('/api/house/bonus')) claims++; };
  page.on('request', countClaim);
  await page.locator('[data-home-claim="bonus"]').evaluate((button: HTMLButtonElement) => { button.click(); button.click(); });
  await page.locator('[data-reward-modal]').waitFor();
  check(claims === 1, 'Double tap submits one reward request');
  check((await page.locator('[data-reward-zlotki]').innerText()).replace(/\s/g, '') === `+${houseBefore.bonus}`, 'Receipt shows actual server reward immediately with reduced motion');
  check(await page.locator('[data-reward-xp]').count() === 0, 'No artificial zero-XP badge');
  check(await page.locator('[data-reward-modal] svg').count() === 0, 'Reward uses raster artwork without SVG rays');
  check((await user.call('GET', '/api/me')).body.zlotki === walletBefore + houseBefore.bonus, 'Wallet credited exactly once');
  check((await user.call('GET', '/api/house')).body.claimed === true, 'Server records the house claim');
  await page.screenshot({ path: 'test-results/visual-style/home-reward.png', fullPage: false });
  await page.keyboard.press('Tab');
  check(await page.locator('[data-reward-modal]').evaluate(dialog => dialog.contains(document.activeElement)), 'Reward keeps keyboard focus');
  await page.keyboard.press('Escape');
  await page.locator('[data-reward-modal]').waitFor({ state: 'hidden' });
  check(await page.evaluate(() => document.body.style.overflow !== 'hidden'), 'Closing reward restores scrolling');
  page.off('request', countClaim);

  await page.route('**/api/journey', route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'test_unavailable' }) }));
  await page.goto(`${stand.base}/?devUser=998812`);
  await page.waitForFunction(() => document.querySelector('[data-home-continue]')?.textContent?.includes('Попробовать ещё'));
  await page.unroute('**/api/journey');
  await page.locator('[data-home-continue]').evaluate((button: HTMLButtonElement) => {
    // A focus-triggered background refresh can recover between the two browser commands.
    if (button.textContent?.includes('Попробовать ещё')) button.click();
  });
  await page.waitForFunction(() => document.querySelector('[data-home-continue]')?.textContent?.includes('Продолжить урок'));
  check(true, 'Home recovers a failed journey request without navigating away');
  const words = await db.select({ id: vocabularyEntries.id }).from(vocabularyEntries).limit(4);
  await db.insert(userVocabulary).values(words.map(word => ({ userId: user.user.id, entryId: word.id, status: 'LEARNING' as const }))).onConflictDoNothing();
  await db.insert(reviewSchedule).values(words.map((word, index) => ({ userId: user.user.id, itemType: 'WORD', itemId: word.id, lapses: index < 2 ? 1 : 0, dueAt: new Date(Date.now() - 86400000) }))).onConflictDoNothing();
  for (const [index, mode] of ['REVIEW', 'MISTAKES'].entries()) {
    await page.goto(`${stand.base}/?devUser=998812`);
    await page.locator('[data-home-practice]').waitFor();
    const actual = (await user.call('GET', '/api/me')).body;
    check((await page.locator('[data-home-practice] button').nth(index).innerText()).includes(String(index === 0 ? actual.counters.dueReviews : actual.counters.mistakes)), `${mode}: actual pending count shown`);
    const started = page.waitForResponse(response => response.url().endsWith('/api/sessions') && response.request().method() === 'POST');
    await page.locator('[data-home-practice] button').nth(index).click();
    await page.waitForURL(`**/practice/${mode}`);
    const response = await started;
    check(response.status() === 200 && (await response.json()).items.length > 0, `${mode}: shortcut starts a real practice session`);
  }
  await page.goto(`${stand.base}/?devUser=998812`);
  await page.locator('[data-open-directory]').waitFor();
  await page.locator('[data-open-directory]').click();
  await page.locator('[data-section-directory]').waitFor();
  for (const name of ['review', 'mistakes', 'timer', 'speed', 'settings', 'friends']) {
    check(await page.locator(`[data-section-directory] img[src*="/${name}"]`).count() === 1, `Generated ${name} raster used`);
  }
  await page.screenshot({ path: 'test-results/visual-style/section-directory.png', fullPage: true });
  check(await page.locator('[data-destination]').count() === 22, 'All 22 sections accessible');
  await page.locator('.directory-search input').fill('словар');
  check(await page.locator('[data-destination]').count() === 1, 'Localized section search');
  await page.locator('[data-destination="/dictionary"]').click();
  await page.waitForURL('**/dictionary');
  check(true, 'Directory opens dictionary');
  await page.goto(`${stand.base}/world?devUser=998812`);
  await page.locator('[data-world-screen]').waitFor();
  await page.screenshot({ path: 'test-results/visual-style/world.png', fullPage: true });
  check(await page.locator('nav a[href="/world"]').getAttribute('aria-current') === 'page', 'World navigation active');
  await page.locator('[data-world-map]').click();
  await page.waitForURL('**/map');
  check(await page.locator('nav a[href="/world"]').getAttribute('aria-current') === 'page', 'Map keeps World selected');
  await page.goto(`${stand.base}/learn?devUser=998812`);
  await page.locator('[data-learning-shortcuts]').waitFor();
  await page.locator('[data-learning-shortcuts] button').first().click();
  await page.locator('[data-destination="/practice/FIVE_MIN"]').waitFor();
  check(await page.locator('[data-destination="/practice/FIVE_MIN"]').count() === 1, 'Five-minute practice reachable');
  for (const width of [320, 390, 430]) {
    await page.setViewportSize({ width, height: 900 });
    check(await page.locator('.is-practice [data-destination] img').evaluateAll(images => images.every(image => image.getBoundingClientRect().width >= 72)), `${width}: practice illustrations are large`);
    check(await page.locator('.is-practice .directory-grid').evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length === 2), `${width}: practice has two browsable columns`);
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}: large practice tiles fit`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.is-practice img').evaluateAll((images: HTMLImageElement[]) => Promise.all(images.map(image => image.decode())));
  await page.screenshot({ path: 'test-results/visual-style/learning-tools.png', fullPage: false });
  await page.locator('[data-sheet-close]').click();
  await page.locator('[data-sheet]').waitFor({ state: 'hidden' });
  check(await page.locator('[data-learning-shortcuts] img').evaluateAll(images => images.every(image => image.getBoundingClientRect().width >= 72)), 'Primary learning shortcuts have large illustrations');
  await user.call('PATCH', '/api/me/settings', { theme: 'light', uiLanguage: 'en' });
  await page.goto(`${stand.base}/?devUser=998812`);
  await page.locator('.compact-journey-photo').waitFor({ timeout: 60_000 });
  await page.locator('.compact-journey-photo').evaluate((image: HTMLImageElement) => image.decode());
  check(await page.locator('.compact-journey-photo').evaluate((image: HTMLImageElement) => Math.abs(image.getBoundingClientRect().width / image.getBoundingClientRect().height - image.naturalWidth / image.naturalHeight) < .01), 'Panorama keeps its native aspect ratio');
  check(await page.locator('.compact-journey-photo').evaluate(image => getComputedStyle(image).filter === 'none'), 'Panorama has no blur or filters');
  check(await page.locator('.compact-journey-shade, .compact-journey-bobek').count() === 0, 'No overlays obscure the panorama');
  check(await page.locator('[data-home-continue]').evaluate(button => {
    const photo = document.querySelector('.compact-journey-photo')!;
    return button.getBoundingClientRect().top >= photo.getBoundingClientRect().bottom;
  }), 'Lesson action sits outside artwork');
  await page.screenshot({ path: 'test-results/visual-style/home-light-en.png', fullPage: true });
  await page.goto(`${stand.base}/profile?devUser=998812`);
  await page.locator('[data-open-streak]').waitFor();
  check(await page.locator('[data-streak-card]').count() === 0, 'Profile no longer has a large streak panel');
  await page.locator('[data-open-streak]').click();
  await page.locator('[data-streak-card] .streak-week li').last().waitFor();
  await page.waitForFunction(() => document.querySelector('[data-streak-card] .streak-eyebrow')?.textContent === 'Your daily rhythm');
  check(await page.locator('[data-streak-card] .streak-eyebrow').textContent() === 'Your daily rhythm', 'English profile');
  check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Light profile overflow');
  await page.locator('[data-sheet-close]').click();
  await page.locator('[data-sheet]').waitFor({ state: 'hidden' });
  await page.screenshot({ path: 'test-results/visual-style/profile-light-en.png', fullPage: true });
  check(errors.length === 0, `Browser errors: ${errors.join(', ')}`);
  console.log(`PASS ${checks} checks; screenshots in test-results/visual-style`);
} catch (error) {
  if (debugPage) {
    console.error('Failure page:', debugPage.url(), await debugPage.locator('body').innerText(), 'Browser errors:', errors, 'Pending:', [...pending]);
    await debugPage.screenshot({ path: 'test-results/visual-style/failure.png', fullPage: true });
  }
  throw error;
} finally {
  await browser.close();
  await stand.stop();
}

}
main().catch(error => { console.error(error); process.exitCode = 1; });
