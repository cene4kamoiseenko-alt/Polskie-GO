/**
 * Сборка фразы в миссии в настоящем браузере (владелец 2026-11-07, скриншот «Составь заказ: хот-дог и воду»): «Poproszę wodę i hot doga»
 * засчитывается, как и «Poproszę hot doga i wodę»; неверная форма («woda») объясняется падежом, а верные слова в неверном порядке — нет.
 *
 *   node --import tsx scripts/order-build-check.ts   → test-results/order-build/*.png
 *
 * Миссия «Первый заказ» (zabka-first-order): первый шаг проходится через API, дальше — экран на 360 и 390 px. Chromium, а не Telegram на iPhone / Android.
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromiumPath, startStand } from './lib/stand';

const root = process.cwd();
const require = createRequire(root + '/package.json');
const OUT = resolve(root, 'test-results/order-build');
const failures: string[] = [];
const check = (ok: unknown, what: string) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) failures.push(what);
};

async function main() {
  const { chromium } = require('playwright') as typeof import('playwright');
  mkdirSync(OUT, { recursive: true });
  const stand = await startStand({ ui: 'dev' });
  const { MISSIONS } = await import(root + '/apps/server/src/content/missions.ts');
  const m = MISSIONS.find((x: { slug: string }) => x.slug === 'zabka-first-order');
  const idx = m.steps.findIndex((s: { kind: string; answer?: string }) => s.kind === 'build' && s.answer === 'Poproszę hot doga i wodę.');
  const browser = await chromium.launch({ headless: true, executablePath: chromiumPath(chromium), args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const pageErrors: string[] = [];
  try {
    for (const width of [360, 390]) {
      const u = await stand.login();
      await u.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A0', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: null });
      await u.call('PATCH', '/api/me/settings', { theme: 'dark', reducedMotion: true });
      const start = await u.call('POST', `/api/missions/${m.slug}/start`);
      const runId = start.body.runId as string;
      for (let i = 0; i < idx; i++) {
        const s = m.steps[i];
        const answer = s.kind === 'build' ? { text: s.answer } : { option: s.options.findIndex((o: { ok: boolean }) => o.ok) };
        await u.call('POST', `/api/missions/runs/${runId}/answer`, { step: i, ...answer });
      }
      const id = String(993000 + width);
      const context = await browser.newContext({ viewport: { width, height: 760 }, deviceScaleFactor: 2, locale: 'ru-RU' });
      const page = await context.newPage();
      page.on('pageerror', (e) => pageErrors.push(e.message));
      await page.addInitScript(({ token, id }) => localStorage.setItem('pg_auth', JSON.stringify({ token, owner: `dev:${id}`, exp: Date.now() + 86_400_000 })), { token: u.token, id });
      const answers: { correct: boolean; why?: { ru: string } }[] = [];
      page.on('response', async (r) => {
        if (/\/api\/missions\/runs\/[^/]+\/answer$/.test(r.url())) answers.push(await r.json().catch(() => ({})));
      });
      await page.goto(`${stand.base}/life/${m.slug}?devUser=${id}`);
      // экран миссии: вступление → «Начать / Продолжить», затем шаг со сборкой
      for (let tries = 0; tries < 6 && !(await page.locator('div.justify-center.gap-2 button.chip').count()); tries++) {
        await page.waitForTimeout(700);
        const go = page.getByRole('button', { name: /Продолжить|Начать/ }).first();
        if (await go.count()) await go.click().catch(() => undefined);
      }
      await page.locator('div.justify-center.gap-2 button.chip').first().waitFor({ timeout: 20_000 }).catch(async (e) => {
        await page.screenshot({ path: `${OUT}/no-tiles-${width}.png` });
        console.log('на экране:', (await page.locator('body').innerText()).replace(/\s+/g, ' ').slice(0, 400), '| кнопки:', (await page.locator('button').allInnerTexts()).join(' / ').slice(0, 300));
        throw e;
      });
      const bank = await page.locator('div.justify-center.gap-2 button.chip').allTextContents();
      check(['Poproszę', 'hot', 'doga', 'i', 'wodę'].every((w) => bank.includes(w)), `${width}px: на экране слова ответа (${bank.join(' · ')})`);

      const tap = async (words: string[]) => {
        for (const w of words) await page.locator('div.justify-center.gap-2 button.chip', { hasText: new RegExp(`^${w}$`) }).first().click();
      };
      const checkNow = async () => {
        await page.waitForTimeout(1100); // сервер отклоняет слишком быстрые ответы
        await page.getByRole('button', { name: /Проверить/ }).click();
        await page.waitForTimeout(700);
        return answers[answers.length - 1];
      };
      const retry = async () => { await page.getByRole('button', { name: /Попробовать ещё/ }).click(); await page.waitForTimeout(400); };
      const clearAnswer = async () => {
        while (await page.locator('div.border-dashed button.chip').count()) await page.locator('div.border-dashed button.chip').first().click();
      };

      // 1) неверная форма → объяснение падежа
      await tap(['Poproszę', 'hot', 'doga', 'i', 'woda']);
      let a = await checkNow();
      check(a?.correct === false && /падеж/.test(a.why?.ru ?? ''), `${width}px: «woda» вместо «wodę» — объяснён падеж`);
      check(/винительный падеж/.test(await page.locator('body').innerText()), `${width}px: объяснение падежа видно на экране`);
      if (width === 390) await page.screenshot({ path: `${OUT}/trap-form.png` });
      await retry(); await clearAnswer();

      // 2) верные формы, сломанный порядок → про порядок, без падежа
      await tap(['i', 'Poproszę', 'hot', 'doga', 'wodę']);
      a = await checkNow();
      const body = await page.locator('body').innerText();
      check(a?.correct === false && /порядок/.test(a.why?.ru ?? '') && !/падеж/.test(a.why?.ru ?? ''), `${width}px: верные формы в неверном порядке — сказано про порядок, падеж не упомянут`);
      check(/порядок не подходит/.test(body) && !/винительный падеж/.test(body), `${width}px: на экране про порядок, а не про падеж`);
      if (width === 390) await page.screenshot({ path: `${OUT}/wrong-order.png` });
      await retry(); await clearAnswer();

      // 3) пример владельца
      await tap(['Poproszę', 'wodę', 'i', 'hot', 'doga']);
      if (width === 390) await page.screenshot({ path: `${OUT}/owner-example-built.png` });
      a = await checkNow();
      check(a?.correct === true, `${width}px: «Poproszę wodę i hot doga» засчитано`);
      if (width === 390) await page.screenshot({ path: `${OUT}/owner-example-correct.png` });
      await context.close();
    }
  } finally {
    await browser.close();
    await stand.stop();
  }
  check(pageErrors.length === 0, `без ошибок страницы${pageErrors.length ? ': ' + pageErrors.slice(0, 3).join(' | ') : ''}`);
  console.log(failures.length ? `\nПровалено: ${failures.length}` : '\nВсе проверки пройдены');
  process.exit(failures.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
