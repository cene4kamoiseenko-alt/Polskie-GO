/**
 * Контраст тексту (axe-core, правило color-contrast, WCAG 2 AA) на основних екранах і станах у світлій та темній темі.
 * Локальна D1 і Vite dev на вільних портах. Порушення — помилка; «incomplete» (текст на фото чи градієнті)
 * axe перевірити не може — їх кількість лише виводиться.
 *
 * Запуск: npm run a11y   → test-results/a11y.json
 */
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromiumPath, startStand } from './lib/stand';

const root = process.cwd();
const require = createRequire(root + '/package.json');
const AXE = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const ROUTES = ['/', '/learn', '/map', '/quests', '/profile', '/shop', '/achievements', '/dictionary', '/settings', '/life', '/passport'];

type Found = { screen: string; theme: string; target: string; html: string; message: string };

async function main() {
  const { chromium } = require('playwright') as typeof import('playwright');
  const stand = await startStand({ ui: 'dev' });
  Object.assign(stand.env, { AZURE_STT_ENABLED: 'true', AZURE_SPEECH_KEY: 'a11y-fake', AZURE_SPEECH_REGION: 'e2e' });
  const executablePath = chromiumPath(chromium);
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}), args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const violations: Found[] = [];
  const summary: { screen: string; theme: string; violations: number; incomplete: number }[] = [];
  let devUser = 970000;

  async function audit(page: import('playwright').Page, screen: string, theme: string) {
    await page.addScriptTag({ content: AXE });
    const r = await page.evaluate(async () => {
      const res = await (window as unknown as { axe: { run: (...a: unknown[]) => Promise<{ violations: { nodes: { target: string[]; html: string; any: { message: string }[] }[] }[]; incomplete: { nodes: unknown[] }[] }> } }).axe.run(document, {
        runOnly: { type: 'rule', values: ['color-contrast'] },
        resultTypes: ['violations', 'incomplete'],
      });
      return {
        violations: res.violations.flatMap((v) => v.nodes.map((n) => ({ target: n.target.join(' '), html: n.html.slice(0, 100), message: (n.any[0]?.message ?? '').slice(0, 180) }))),
        incomplete: res.incomplete.reduce((n, v) => n + v.nodes.length, 0),
      };
    });
    for (const v of r.violations) violations.push({ screen, theme, ...v });
    summary.push({ screen, theme, violations: r.violations.length, incomplete: r.incomplete });
    console.log(`${theme.padEnd(5)} ${screen.padEnd(16)} violations ${r.violations.length}, incomplete ${r.incomplete}`);
  }

  async function page(theme: 'light' | 'dark', onboarded = true) {
    const u = await stand.login();
    if (onboarded) {
      await u.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A0', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: null });
      await u.call('PATCH', '/api/me/settings', { theme, reducedMotion: true });
    }
    const id = String(++devUser);
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: theme, locale: 'ru-RU', reducedMotion: 'reduce' });
    const p = await context.newPage();
    await p.addInitScript(({ token, id }) => localStorage.setItem('pg_auth', JSON.stringify({ token, owner: `dev:${id}`, exp: Date.now() + 86_400_000 })), { token: u.token, id });
    return { ...u, p, context, url: (path: string) => `${stand.base}${path}?devUser=${id}` };
  }
  const settle = (p: import('playwright').Page) =>
    p.waitForFunction(() => !document.querySelector('.splash') && !document.querySelector('[data-skeleton]'), undefined, { timeout: 20_000 }).then(() => p.waitForTimeout(900));

  try {
    for (const theme of ['light', 'dark'] as const) {
      const u = await page(theme);
      for (const route of ROUTES) {
        await u.p.goto(u.url(route));
        await settle(u.p);
        await audit(u.p, route, theme);
      }
      // Голосове завдання (екран D).
      const lessonId = (await u.call('GET', '/api/journey')).body.nextLesson.id as string;
      const started = (await u.call('POST', '/api/sessions', { lessonId })).body;
      for (const item of await stand.sessionItems(started.sessionId)) {
        if (item.type === 'PRONUNCIATION') break;
        for (const a of stand.correctAnswers(item)) await u.call('POST', `/api/sessions/${started.sessionId}/answer`, { key: item.key, answer: a });
      }
      await u.p.goto(u.url('/lesson/' + lessonId));
      await u.p.locator('[data-mic]').waitFor({ timeout: 20_000 });
      await u.p.waitForTimeout(800);
      await audit(u.p, 'voice-task', theme);
      // Заставка під час завантаження і «Немає зв'язку» (екрани A і B).
      await u.p.route('**/api/me', async (r) => { await new Promise((ok) => setTimeout(ok, 4000)); await r.continue().catch(() => {}); });
      await u.p.goto(u.url('/'));
      await u.p.locator('.splash-card').waitFor();
      await u.p.waitForTimeout(1200);
      await audit(u.p, 'splash', theme);
      await u.p.unroute('**/api/me');
      await u.p.route('**/api/**', (r) => r.abort('internetdisconnected'));
      await u.p.goto(u.url('/'));
      await u.p.locator('[data-boot-error]').waitFor({ timeout: 20_000 });
      await u.context.setOffline(true);
      await u.p.locator('[data-boot-error="offline"]').waitFor();
      await audit(u.p, 'no-connection', theme);
      await u.context.close();
      // Знайомство (екран C).
      const fresh = await page(theme, false);
      await fresh.p.emulateMedia({ colorScheme: theme });
      await fresh.p.goto(fresh.url('/'));
      await fresh.p.locator('button.btn-red').waitFor({ timeout: 20_000 });
      await fresh.p.waitForTimeout(1200);
      await audit(fresh.p, 'intro', theme);
      await fresh.context.close();
    }
  } finally {
    await browser.close();
    await stand.stop();
  }
  mkdirSync(resolve(root, 'test-results'), { recursive: true });
  writeFileSync(resolve(root, 'test-results/a11y.json'), JSON.stringify({ summary, violations }, null, 2));
  if (violations.length) {
    for (const v of violations) console.log(`✗ ${v.theme} ${v.screen}: ${v.target} — ${v.message}`);
    process.exit(1);
  }
  console.log(`Контраст: 0 порушень на ${summary.length} перевірках`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
