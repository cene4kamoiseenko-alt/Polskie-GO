/**
 * Снимки семи основных экранов для редизайна (главная, карта, уроки, миссии, квесты, магазин, профиль): тёмная и светлая тема, 390 px,
 * безопасные зоны iPhone. Локальная D1 и Vite dev. Это Chromium, а не Telegram на телефоне.
 *
 *   node --import tsx scripts/redesign-screens.ts [папка] [фильтр]   → test-results/redesign/<папка>/<экран>-<тема>.png
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromiumPath, startStand } from './lib/stand';

const root = process.cwd();
const require = createRequire(root + '/package.json');
const OUT = resolve(root, 'test-results/redesign', process.argv[2] ?? 'after');
const filter = process.argv[3] ?? '';
const SCREENS = [['home', '/'], ['map', '/map'], ['learn', '/learn'], ['life', '/life'], ['quests', '/quests'], ['shop', '/shop'], ['profile', '/profile'], ['premium', '/premium']] as const;

async function main() {
  const { chromium } = require('playwright') as typeof import('playwright');
  const stand = await startStand({ ui: 'dev' });
  const { base, login } = stand;
  mkdirSync(OUT, { recursive: true });
  const executablePath = chromiumPath(chromium);
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}), args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  let devUser = 980000;
  try {
    for (const theme of (process.env.THEMES ?? 'dark,light').split(',') as ('dark' | 'light')[]) {
      const u = await login();
      await u.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A0', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: null });
      await u.call('PATCH', '/api/me/settings', { theme });
      const id = String(++devUser);
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, colorScheme: theme, locale: 'ru-RU' });
      const p = await context.newPage();
      await p.addInitScript(({ token, id }) => {
        localStorage.setItem('pg_auth', JSON.stringify({ token, owner: `dev:${id}`, exp: Date.now() + 86_400_000 }));
        document.addEventListener('DOMContentLoaded', () => {
          const s = document.createElement('style');
          s.textContent = ':root{--tg-safe-area-inset-top:47px;--tg-safe-area-inset-bottom:34px}';
          document.head.appendChild(s);
        });
      }, { token: u.token, id });
      for (const [name, path] of SCREENS) {
        if (filter && !name.includes(filter)) continue;
        await p.goto(`${base}${path}?devUser=${id}`);
        await p.locator('nav a[href="/"]').waitFor({ timeout: 20_000 }).catch(() => {});
        await p.waitForFunction(() => !document.querySelector('[data-skeleton]'), undefined, { timeout: 20_000 }).catch(() => {});
        await p.evaluate(() => document.fonts.ready);
        await p.waitForTimeout(1200);
        // Сначала прокрутка шагами до низа: карточки с ленивыми картинками успевают загрузиться до полного снимка.
        await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 180)); } window.scrollTo(0, 0); });
        await p.waitForTimeout(500);
        await p.screenshot({ path: `${OUT}/${name}-${theme}.png` });
        if (name !== 'map') await p.screenshot({ path: `${OUT}/${name}-${theme}-full.png`, fullPage: true });
      }
      await context.close();
    }
  } finally {
    await browser.close();
    await stand.stop();
  }
  console.log(`снимки в ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
