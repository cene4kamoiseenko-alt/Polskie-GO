/**
 * Видео новых настроек для владельца (390×844): плитки → шторки выбора, смена темы круговым раскрытием, цель, уровень,
 * напоминания с выбором времени. → test-results/settings-video/settings.webm
 * Запуск: node --import tsx scripts/settings-video.ts
 */
import { createRequire } from 'node:module';
import { mkdirSync, renameSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromiumPath, startStand } from './lib/stand';

const root = process.cwd();
const require = createRequire(root + '/package.json');
const OUT = resolve(root, 'test-results/settings-video');

async function main() {
  const { chromium } = require('playwright') as typeof import('playwright');
  mkdirSync(OUT, { recursive: true });
  const stand = await startStand({ ui: 'dev' });
  const browser = await chromium.launch({ headless: true, executablePath: chromiumPath(chromium), args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  try {
    const u = await stand.login();
    await u.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A0', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: null });
    await u.call('PATCH', '/api/me/settings', { theme: 'light' });
    await u.call('PATCH', '/api/me/profile', { beaverName: 'Bobek', displayName: 'Ania' });
    await u.call('POST', '/api/flags/tour', {});
    const id = '993301';
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'ru-RU', colorScheme: 'light', recordVideo: { dir: OUT + '/vid', size: { width: 390, height: 844 } } });
    const p = await ctx.newPage();
    await p.addInitScript(({ token, id }) => localStorage.setItem('pg_auth', JSON.stringify({ token, owner: `dev:${id}`, exp: Date.now() + 86_400_000 })), { token: u.token, id });
    await p.goto(`${stand.base}/settings?devUser=${id}`);
    await p.locator('[data-settings-hero]').waitFor({ timeout: 30_000 });
    await p.waitForTimeout(1500);
    const close = async () => {
      await p.locator('[data-sheet-close]').click();
      await p.waitForTimeout(700);
    };
    await p.locator('[data-setting-tile="theme"]').click();
    await p.waitForTimeout(1000);
    await p.locator('[data-theme-option="dark"]').click();
    await p.waitForTimeout(1600);
    await p.locator('[data-theme-option="light"]').click();
    await p.waitForTimeout(1600);
    await close();
    await p.locator('[data-setting-tile="goal"]').click();
    await p.waitForTimeout(1000);
    await p.locator('[data-goal-option="15"]').click();
    await p.waitForTimeout(900);
    await p.locator('[data-goal-option="20"]').click();
    await p.waitForTimeout(1000);
    await close();
    await p.locator('[data-setting-tile="level"]').click();
    await p.waitForTimeout(1000);
    await p.locator('[data-level-option="B1"]').click();
    await p.waitForTimeout(1300);
    await close();
    await p.mouse.wheel(0, 380);
    await p.waitForTimeout(800);
    await p.locator('[data-switch="notifications"]').click();
    await p.waitForTimeout(1200);
    await p.locator('[data-setting="pron"]').scrollIntoViewIfNeeded();
    await p.waitForTimeout(600);
    await p.locator('[data-switch="sound"]').click();
    await p.waitForTimeout(1200);
    const v = p.video();
    await ctx.close();
    if (v) renameSync(await v.path(), `${OUT}/settings.webm`);
  } finally {
    await browser.close();
    await stand.stop();
  }
  process.exit(0);
}
void main();
