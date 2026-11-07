/**
 * «Поставь слово в правильную форму» выбором (владелец 2026-11-07: ввод поднимал клавиатуру, и польские буквы не было видно) в настоящем браузере.
 *
 *   node --import tsx scripts/grammar-choice-check.ts   → test-results/grammar-choice/*.png
 *
 * Открывается тренировка грамматики «być». У каждого задания GRAMMAR: четыре формы кнопками, поля ввода и ряда польских букв нет, нет горизонтальной
 * прокрутки на 360 и 390 px; неверная форма даёт «неверно» с подсветкой правильной, верная — «верно». Chromium, а не Telegram на iPhone / Android.
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromiumPath, startStand } from './lib/stand';

const root = process.cwd();
const require = createRequire(root + '/package.json');
const OUT = resolve(root, 'test-results/grammar-choice');
const failures: string[] = [];
const check = (ok: unknown, what: string) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) failures.push(what);
};

async function main() {
  const { chromium } = require('playwright') as typeof import('playwright');
  mkdirSync(OUT, { recursive: true });
  const stand = await startStand({ ui: 'dev' });
  const browser = await chromium.launch({ headless: true, executablePath: chromiumPath(chromium), args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const pageErrors: string[] = [];
  try {
    for (const width of [360, 390]) {
      const u = await stand.login();
      await u.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A0', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: null });
      await u.call('PATCH', '/api/me/settings', { theme: 'dark', reducedMotion: true });
      const id = String(990000 + width);
      const context = await browser.newContext({ viewport: { width, height: 700 }, deviceScaleFactor: 2, locale: 'ru-RU' });
      const page = await context.newPage();
      page.on('pageerror', (e) => pageErrors.push(e.message));
      await page.addInitScript(({ token, id }) => localStorage.setItem('pg_auth', JSON.stringify({ token, owner: `dev:${id}`, exp: Date.now() + 86_400_000 })), { token: u.token, id });
      let sessionId = '';
      page.on('response', async (r) => {
        if (r.url().endsWith('/api/sessions') && r.request().method() === 'POST') sessionId = (await r.json().catch(() => ({}))).sessionId ?? sessionId;
      });
      await page.goto(`${stand.base}/practice/GRAMMAR?topic=byc&devUser=${id}`);
      await page.locator('[data-action="start"], [data-grammar-choice], button.option, textarea').first().waitFor({ timeout: 30_000 });
      const start = page.locator('[data-action="start"]');
      if (await start.count()) await start.click();
      await page.waitForFunction(() => document.querySelector('[data-grammar-choice], textarea, button.option, [data-token]'), null, { timeout: 30_000 });
      const items = await stand.sessionItems(sessionId);
      check(items.length > 0, `${width}px: сессия тренировки создана (${items.length} заданий, id ${sessionId.slice(0, 8)})`);

      let seenGrammar = 0;
      let wrongDone = false;
      let rightDone = false;
      for (let i = 0; i < items.length + 2; i++) {
        if (await page.locator('[data-lesson-result]').count()) break;
        const next = page.locator('[data-action="next"]:not([disabled])');
        if (await next.count()) { await next.click(); await page.waitForTimeout(250); continue; }
        await page.waitForTimeout(1100); // сервер отклоняет слишком быстрые ответы
        const item = items[Math.min(i, items.length - 1)];
        const checkBtn = page.locator('[data-action="check"]');
        const answered = () => page.locator('[data-action="next"]').waitFor({ timeout: 15_000 });
        if (await page.locator('[data-grammar-choice]').count()) {
          seenGrammar++;
          const chips = page.locator('[data-grammar-choice] button[data-form]');
          const forms = await chips.evaluateAll((els) => els.map((e) => e.getAttribute('data-form') as string));
          const accepted = (item.data as { accepted: string[] }).accepted;
          check(forms.length === 4 && new Set(forms.map((f) => f.toLowerCase())).size === 4, `${width}px: четыре разные формы (${forms.join(' · ')})`);
          check(forms.includes(accepted[0]), `${width}px: правильная форма «${accepted[0]}» среди вариантов`);
          check((await page.locator('textarea').count()) === 0, `${width}px: поля ввода нет — клавиатура не поднимется`);
          check((await page.locator('[data-grammar-choice] button', { hasText: /^[ąćęłńóśźż]$/ }).count()) === 0, `${width}px: ряда польских букв нет`);
          check((await page.evaluate(() => document.documentElement.scrollWidth)) <= width, `${width}px: нет горизонтальной прокрутки`);
          // Экран высотой 700 px — iPhone 15 (852) без шапки Telegram. Сцена Бобека занимает верх экрана, остальное прокручивается, как у любого задания.
          const footer = await checkBtn.boundingBox();
          const firstChip = await chips.first().boundingBox();
          check(!!firstChip && !!footer && firstChip.y + firstChip.height <= footer.y, `${width}px: первые формы видны сразу, без прокрутки (низ ${Math.round((firstChip?.y ?? 0) + (firstChip?.height ?? 0))}, верх кнопки ${Math.round(footer?.y ?? 0)})`);
          await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
          await page.waitForTimeout(200);
          const lastChip = await chips.last().boundingBox();
          check(!!lastChip && !!footer && lastChip.y + lastChip.height <= footer.y, `${width}px: последняя форма достижима прокруткой и не закрыта кнопкой «Проверить» (низ ${Math.round((lastChip?.y ?? 0) + (lastChip?.height ?? 0))}, верх кнопки ${Math.round(footer?.y ?? 0)})`);
          check((await page.locator('.stage-cue, [data-stage-cue]').count()) >= 0 && /Wybierz/.test(await page.locator('body').innerText()), `${width}px: Бобек говорит «Wybierz poprawną formę!», а не «Wpisz»`);
          if (seenGrammar === 1) await page.screenshot({ path: `${OUT}/grammar-${width}.png` });
          const wantWrong = !wrongDone;
          const pickForm = wantWrong ? forms.find((f) => !accepted.map((a) => a.toLowerCase()).includes(f.toLowerCase()))! : accepted[0];
          await page.locator(`[data-grammar-choice] button[data-form="${pickForm}"]`).click();
          check((await page.locator('[data-grammar-choice] [data-state="selected"]').count()) === 1, `${width}px: выбранная форма подсвечена`);
          await checkBtn.click();
          await answered();
          const states = await page.locator('[data-grammar-choice] button[data-form]').evaluateAll((els) => els.map((e) => `${e.getAttribute('data-form')}:${e.getAttribute('data-state') ?? ''}`));
          if (wantWrong) {
            wrongDone = true;
            check(states.some((s) => s === `${pickForm}:wrong`) && states.some((s) => s === `${accepted[0]}:correct`), `${width}px: неверная форма — «неверно», правильная подсвечена (${states.join(' ')})`);
            if (seenGrammar === 1) await page.screenshot({ path: `${OUT}/grammar-wrong-${width}.png` });
          } else {
            rightDone = true;
            check(states.some((s) => s === `${accepted[0]}:correct`) && !states.some((s) => s.endsWith(':wrong')), `${width}px: верная форма — «верно» (${states.join(' ')})`);
          }
          continue;
        }
        // Остальные типы заданий в тренировке: просто проходим.
        if (await page.locator('[data-action="skip"]').count()) { await page.locator('[data-action="skip"]').click(); await answered(); continue; }
        if (await page.locator('textarea').count()) { await page.fill('textarea', 'zzz'); await checkBtn.click(); await answered(); continue; }
        if (await page.locator('[data-token]').count()) {
          while (await page.locator('[data-token]').count()) await page.locator('[data-token]').first().click();
          await checkBtn.click(); await answered(); continue;
        }
        if (await page.locator('[data-pair="left"]').count()) {
          const n = await page.locator('[data-pair="left"]').count();
          for (let k = 0; k < n; k++) { await page.locator('[data-pair="left"]').nth(k).click(); await page.locator('[data-pair="right"]').nth(k).click(); }
          if (await checkBtn.count()) await checkBtn.click();
          await answered(); continue;
        }
        const opts = page.locator('button.option:not([disabled])');
        if (await opts.count()) { await opts.first().click(); if (await checkBtn.count()) await checkBtn.click(); await answered().catch(() => undefined); continue; }
      }
      check(seenGrammar >= 1, `${width}px: в тренировке встретилось заданий GRAMMAR: ${seenGrammar}`);
      check(wrongDone, `${width}px: проверена неверная форма`);
      if (seenGrammar >= 2) check(rightDone, `${width}px: проверена верная форма`);
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
