/**
 * CSP Report-Only на собранном приложении (dist-cf, как на Cloudflare) — в реальном браузере (Chromium, не Telegram на iPhone / Android).
 *
 *   npm run build && node --import tsx scripts/csp-check.ts
 *
 * Стенд отдаёт dist-cf с заголовками из dist-cf/_headers (там Content-Security-Policy-Report-Only со встроенными скриптами по хешу).
 * Игрок проходит основные экраны и урок; браузер шлёт нарушения на /api/csp-report → журнал ошибок. Проверка: нарушений CSP нет,
 * ошибок приложения нет, заголовок на месте. Так видно, что политику можно делать блокирующей после проверки на телефонах.
 */
import { createRequire } from 'node:module';
import { chromiumPath, startStand } from './lib/stand';

const root = process.cwd();
const require = createRequire(root + '/package.json');

const failures: string[] = [];
const check = (ok: unknown, what: string) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) failures.push(what);
};

async function main() {
  const { chromium } = require('playwright') as typeof import('playwright');
  const stand = await startStand({ ui: 'dist', dist: 'dist-cf' });
  const browser = await chromium.launch({ headless: true, executablePath: chromiumPath(chromium), args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const d1 = stand.env.DB as D1Database;
  try {
    const u = await stand.login();
    await u.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A0', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: null });
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'ru-RU' });
    const page = await context.newPage();
    const pageErrors: string[] = [];
    page.on('pageerror', (e) => pageErrors.push(e.message));
    await page.addInitScript(({ token }) => localStorage.setItem('pg_auth', JSON.stringify({ token, owner: 'tg:test', exp: Date.now() + 30 * 86_400_000 })), { token: u.token });
    const first = await page.goto(`${stand.base}/`);
    const csp = first?.headers()['content-security-policy-report-only'] ?? '';
    check(/script-src 'self' https:\/\/telegram\.org 'sha256-/.test(csp) && /report-uri \/api\/csp-report/.test(csp), `заголовок CSP Report-Only на месте (${csp.length} симв.)`);
    check(/media-src [^;]*\bdata:/.test(csp), 'media-src разрешает data: (тихий WAV для разблокировки звука)');
    // Первое касание «разблокирует» звук для iOS и Telegram: lib/audio.ts подставляет в <audio> тихий WAV как data:-адрес (media-src должен его разрешать).
    // Без касания этот путь не выполнялся, и отчёт `media-src data` (журнал владельца, 2026-11-10) проверка не видела.
    await page.mouse.click(2, 2);
    await page.waitForTimeout(600);
    const screens = ['/', '/learn', '/map', '/shop', '/shop?tab=shop', '/house', '/pass', '/premium', '/profile', '/achievements', '/missions', '/quests', '/dictionary', '/exams', '/social'];
    for (const path of screens) {
      await page.goto(`${stand.base}${path}`);
      await page.waitForLoadState('networkidle').catch(() => undefined);
      await page.waitForTimeout(900);
    }
    // Урок: задания, картинки, звук (если есть) — всё, что грузится в уроке.
    const journey = (await u.call('GET', '/api/journey')).body as { cities: { routes: { lessons: { id: string }[] }[] }[] };
    const lessonId = journey.cities[0]?.routes[0]?.lessons[0]?.id;
    if (lessonId) {
      await page.goto(`${stand.base}/lesson/${lessonId}`);
      await page.waitForTimeout(1500);
      const start = page.locator('[data-action="start"]').first();
      if (await start.count()) {
        await start.click();
        await page.waitForTimeout(1500);
      }
    }
    await page.waitForTimeout(2500);
    const rows = (await d1.prepare("SELECT kind, message, path, count FROM error_log WHERE kind IN ('csp', 'client') ORDER BY kind").all<{ kind: string; message: string; path: string; count: number }>()).results;
    for (const r of rows) console.log(`     ${r.kind} ×${r.count} ${r.message} ${r.path ?? ''}`);
    check(rows.filter((r) => r.kind === 'csp').length === 0, `нарушений CSP нет на ${screens.length} экранах и в уроке`);
    check(rows.filter((r) => r.kind === 'client').length === 0, 'ошибок приложения в журнале нет');
    // Отчёт действительно доходит: нарушение, сделанное нарочно, попадает в журнал (иначе «нет нарушений» ничего бы не значило).
    await page.evaluate(() => {
      const s = document.createElement('img');
      s.src = 'https://example.invalid/csp-probe.png';
      document.body.appendChild(s);
    });
    await page.waitForTimeout(2500);
    const probe = (await d1.prepare("SELECT message FROM error_log WHERE kind = 'csp'").all<{ message: string }>()).results;
    check(probe.some((r) => r.message.includes('example.invalid')), `пробное нарушение дошло до журнала (${probe.map((r) => r.message).join('; ') || 'нет'})`);
    check(pageErrors.length === 0, `без ошибок страницы${pageErrors.length ? ': ' + pageErrors.slice(0, 3).join(' | ') : ''}`);
    await context.close();
  } finally {
    await browser.close();
    await stand.stop();
  }
  console.log(failures.length ? `\nПровалено: ${failures.length}` : '\nВсе проверки пройдены');
  process.exit(failures.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
