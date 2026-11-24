/**
 * Видео тура «Бобек-гид» для владельца: после первого урока на главной, 390×844, светлая и тёмная тема;
 * шаги по вкладкам с паузой, финал. Кадры → test-results/tour-video/*.png, видео → tour-<тема>.webm.
 * Запуск: node --import tsx scripts/tour-video.ts
 */
import { createRequire } from 'node:module';
import { mkdirSync, renameSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromiumPath, startStand } from './lib/stand';

const root = process.cwd();
const require = createRequire(root + '/package.json');
const OUT = resolve(root, 'test-results/tour-video');

async function main() {
  const { chromium } = require('playwright') as typeof import('playwright');
  mkdirSync(OUT, { recursive: true });
  const stand = await startStand({ ui: 'dev' });
  const browser = await chromium.launch({ headless: true, executablePath: chromiumPath(chromium), args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  let seq = 995500;
  try {
    for (const theme of ['light', 'dark'] as const) {
      const u = await stand.login();
      await u.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A0', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: null });
      await u.call('PATCH', '/api/me/settings', { theme });
      const s = await u.call('POST', '/api/sessions', { lessonId: (await u.call('GET', '/api/journey')).body.nextLesson.id });
      const items = await stand.sessionItems(s.body.sessionId);
      for (const it of items) for (const a of stand.correctAnswers(it)) await u.call('POST', `/api/sessions/${s.body.sessionId}/answer`, { key: it.key, answer: a });
      await new Promise((r) => setTimeout(r, items.length * 1000 + 500));
      await u.call('POST', `/api/sessions/${s.body.sessionId}/finish`);
      const id = String(++seq);
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'ru-RU', colorScheme: theme, recordVideo: { dir: OUT + '/vid', size: { width: 390, height: 844 } } });
      const p = await ctx.newPage();
      await p.addInitScript(({ token, id }) => localStorage.setItem('pg_auth', JSON.stringify({ token, owner: `dev:${id}`, exp: Date.now() + 86_400_000 })), { token: u.token, id });
      await p.goto(`${stand.base}/?devUser=${id}`);
      await p.locator('[data-tour]').waitFor({ timeout: 30_000 });
      await p.waitForTimeout(1800);
      await p.screenshot({ path: `${OUT}/${theme}-1.png` });
      for (let i = 1; i < 5; i++) {
        await p.locator('[data-tour-next]').click();
        await p.waitForTimeout(1900);
        if (i === 2) await p.screenshot({ path: `${OUT}/${theme}-3.png` });
      }
      await p.locator('[data-tour-next]').click();
      await p.waitForTimeout(500);
      await p.screenshot({ path: `${OUT}/${theme}-finish.png` });
      await p.waitForTimeout(1500);
      const v = p.video();
      await ctx.close();
      if (v) renameSync(await v.path(), `${OUT}/tour-${theme}.webm`);
    }
  } finally {
    await browser.close();
    await stand.stop();
  }
  process.exit(0);
}
void main();
