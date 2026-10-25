/**
 * Реальні знімки екранів A–F (і головної) у світлій і темній темі на 360 і 390 px з безпечними зонами iPhone
 * (змінні Telegram --tg-safe-area-inset-*: 47 px зверху, 34 px знизу) та в режимі «менше анімацій».
 * Локальна D1 і Vite dev на вільних портах. Це Chromium, а не Telegram на iPhone.
 *
 * Запуск: node --import tsx scripts/screens.ts [фільтр]   → test-results/screens-ui/<екран>-<тема>-<ширина>.png
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromiumPath, startStand } from './lib/stand';

const root = process.cwd();
const require = createRequire(root + '/package.json');
const OUT = resolve(root, 'test-results/screens-ui');
const filter = process.argv[2] ?? '';

async function main() {
  const { chromium } = require('playwright') as typeof import('playwright');
  const stand = await startStand({ ui: 'dev' });
  const { base, env, login, sessionItems, correctAnswers } = stand;
  mkdirSync(OUT, { recursive: true });
  // Серверне розпізнавання «увімкнено», щоб на екрані голосу була кнопка запису (провайдер не викликається).
  Object.assign(env, { AZURE_STT_ENABLED: 'true', AZURE_SPEECH_KEY: 'screens-fake', AZURE_SPEECH_REGION: 'e2e' });
  const executablePath = chromiumPath(chromium);
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}), args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  let devUser = 990000;
  const shots: string[] = [];

  async function page(theme: 'light' | 'dark', width: number, opts: { onboarded?: boolean; reduced?: boolean } = {}) {
    const u = await login();
    if (opts.onboarded !== false) {
      await u.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A0', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: null });
      await u.call('PATCH', '/api/me/settings', { theme, reducedMotion: !!opts.reduced });
    }
    const id = String(++devUser);
    const context = await browser.newContext({ viewport: { width, height: width === 360 ? 780 : 844 }, deviceScaleFactor: 2, colorScheme: theme, locale: 'ru-RU', reducedMotion: opts.reduced ? 'reduce' : 'no-preference' });
    const p = await context.newPage();
    await p.addInitScript(({ token, id }) => {
      localStorage.setItem('pg_auth', JSON.stringify({ token, owner: `dev:${id}`, exp: Date.now() + 86_400_000 }));
      document.addEventListener('DOMContentLoaded', () => {
        const s = document.createElement('style');
        s.textContent = ':root{--tg-safe-area-inset-top:47px;--tg-safe-area-inset-bottom:34px}';
        document.head.appendChild(s);
      });
    }, { token: u.token, id });
    return { ...u, p, context, url: (path: string) => `${base}${path}?devUser=${id}` };
  }
  const settle = async (p: import('playwright').Page) => {
    await p.waitForFunction(() => !document.querySelector('[data-skeleton]'), undefined, { timeout: 20_000 }).catch(() => {});
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(900);
  };
  const shot = async (p: import('playwright').Page, name: string, full = false) => {
    const file = `${OUT}/${name}.png`;
    await p.screenshot({ path: file, fullPage: full });
    shots.push(file);
  };

  try {
    for (const theme of ['light', 'dark'] as const) {
      for (const width of [360, 390]) {
        const tag = `${theme}-${width}`;
        console.log(tag);
        // A — завантаження (профіль затримано, щоб застати заставку з прогресом).
        if ('A-loading'.includes(filter) || !filter) {
          const a = await page(theme, width);
          await a.p.route('**/api/me', async (r) => { await new Promise((ok) => setTimeout(ok, 6000)); await r.continue().catch(() => {}); });
          await a.p.goto(a.url('/'));
          await a.p.locator('.splash-card').waitFor();
          await a.p.waitForTimeout(1800);
          await shot(a.p, `A-loading-${tag}`);
          await a.context.close();
        }
        // B — немає зв'язку.
        if ('B-offline'.includes(filter) || !filter) {
          const b = await page(theme, width);
          await b.p.route('**/api/**', (r) => r.abort('internetdisconnected'));
          await b.p.goto(b.url('/'));
          await b.p.locator('[data-boot-error]').waitFor({ timeout: 20_000 });
          await b.context.setOffline(true);
          await b.p.locator('[data-boot-error="offline"]').waitFor();
          await b.p.waitForTimeout(600);
          await shot(b.p, `B-offline-${tag}`);
          await b.context.close();
        }
        // C — знайомство (перший крок онбордингу).
        if ('C-intro'.includes(filter) || !filter) {
          const c = await page(theme, width, { onboarded: false });
          await c.p.goto(c.url('/'));
          await c.p.locator('button.btn-red').waitFor({ timeout: 20_000 });
          await c.p.waitForTimeout(1500);
          await shot(c.p, `C-intro-${tag}`);
          await c.context.close();
        }
        // D — голосове завдання.
        if ('D-voice'.includes(filter) || !filter) {
          const d = await page(theme, width);
          const lessonId = (await d.call('GET', '/api/journey')).body.nextLesson.id as string;
          const started = (await d.call('POST', '/api/sessions', { lessonId })).body;
          const items = await sessionItems(started.sessionId);
          for (const item of items) {
            if (item.type === 'PRONUNCIATION') break;
            for (const a of correctAnswers(item)) await d.call('POST', `/api/sessions/${started.sessionId}/answer`, { key: item.key, answer: a });
          }
          await d.p.goto(d.url('/lesson/' + lessonId));
          await d.p.locator('[data-mic]').waitFor({ timeout: 20_000 });
          await settle(d.p);
          await shot(d.p, `D-voice-${tag}`, true);
          await d.context.close();
        }
        // E — карта, F — гардероб і досягнення, плюс головна.
        for (const [name, path] of [['E-map', '/map'], ['F-wardrobe', '/shop'], ['F-achievements', '/achievements'], ['home', '/']] as const) {
          if (filter && !name.includes(filter)) continue;
          const e = await page(theme, width);
          await e.p.goto(e.url(path));
          await e.p.locator('nav a[href="/"]').waitFor({ timeout: 20_000 }).catch(() => {});
          await settle(e.p);
          await shot(e.p, `${name}-${tag}`, true);
          await e.context.close();
        }
      }
    }
    // Режим «менше анімацій»: заставка й голосове завдання.
    if (!filter || 'reduced'.includes(filter)) {
      const r = await page('dark', 390, { reduced: true });
      await r.p.goto(r.url('/'));
      await r.p.locator('nav a[href="/"]').waitFor({ timeout: 20_000 });
      await settle(r.p);
      await shot(r.p, 'home-reduced-dark-390');
      await r.context.close();
    }
  } finally {
    await browser.close();
    await stand.stop();
  }
  console.log(`${shots.length} знімків у ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
