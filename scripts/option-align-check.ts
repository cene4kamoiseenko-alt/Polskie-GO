/**
 * Слово в плашке ответа стоит по центру (владелец 2026-11-07: «слова в плашке ровно по центру, а не как „są“ — влево»), в настоящем браузере.
 *
 *   node --import tsx scripts/option-align-check.ts   → test-results/option-align/*.png
 *
 * Проходит тренировки (пять минут, скорость, грамматика «być») на 320 / 360 / 390 px. У каждой плашки-ответа без вложенных блоков центр текста
 * отличается от центра плашки не больше чем на 2 px; буква варианта (A, B, C) и значок наушников не заезжают на слово; нет горизонтальной прокрутки.
 * Chromium, а не Telegram на iPhone / Android.
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromiumPath, startStand } from './lib/stand';

const root = process.cwd();
const require = createRequire(root + '/package.json');
const OUT = resolve(root, 'test-results/option-align');
const failures: string[] = [];
const check = (ok: unknown, what: string) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) failures.push(what);
};

type Tile = { text: string; offset: number; overlap: boolean; align: string; w: number };

/** Строка-выражение, не функция: tsx добавляет в функции `__name`, а в странице его нет. */
const PROBE = `(() => {
  const out = [];
  for (const b of document.querySelectorAll('button.option, [data-grammar-choice] button[data-form]')) {
    if (b.querySelector('div, img, svg:only-child')) continue; // карточки с картинкой и реплики диалога — другая раскладка
    const spans = Array.from(b.children).filter((c) => c.tagName === 'SPAN');
    const word = spans.length ? spans[spans.length - 1] : b;
    const badge = spans.length > 1 ? spans[0] : null;
    const range = document.createRange();
    range.selectNodeContents(word);
    const t = range.getBoundingClientRect();
    const r = b.getBoundingClientRect();
    const k = badge ? badge.getBoundingClientRect() : null;
    out.push({
      text: (word.textContent || '').trim().slice(0, 28),
      offset: Math.round(((t.left + t.right) / 2 - (r.left + r.right) / 2) * 10) / 10,
      overlap: !!k && k.right > t.left - 2 && k.left < t.right,
      align: getComputedStyle(b).textAlign,
      w: Math.round(r.width),
    });
  }
  return out;
})()`;

const SCENARIOS = ['FIVE_MIN', 'SPEED', 'GRAMMAR?topic=byc'];

async function main() {
  const { chromium } = require('playwright') as typeof import('playwright');
  mkdirSync(OUT, { recursive: true });
  const stand = await startStand({ ui: 'dev' });
  const browser = await chromium.launch({ headless: true, executablePath: chromiumPath(chromium), args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const pageErrors: string[] = [];
  const seen = new Set<string>();
  let tiles = 0;
  try {
    let n = 0;
    for (const width of [320, 360, 390]) {
      for (const scenario of SCENARIOS) {
        n++;
        const u = await stand.login();
        await u.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A0', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: null });
        await u.call('PATCH', '/api/me/settings', { theme: 'dark', reducedMotion: true });
        const id = String(991000 + n);
        const context = await browser.newContext({ viewport: { width, height: 760 }, deviceScaleFactor: 2, locale: 'ru-RU' });
        const page = await context.newPage();
        page.on('pageerror', (e) => pageErrors.push(e.message));
        await page.addInitScript(({ token, id }) => localStorage.setItem('pg_auth', JSON.stringify({ token, owner: `dev:${id}`, exp: Date.now() + 86_400_000 })), { token: u.token, id });
        let sessionId = '';
        page.on('response', async (r) => {
          if (r.url().endsWith('/api/sessions') && r.request().method() === 'POST') sessionId = (await r.json().catch(() => ({}))).sessionId ?? sessionId;
        });
        const sep = scenario.includes('?') ? '&' : '?';
        await page.goto(`${stand.base}/practice/${scenario}${sep}devUser=${id}`);
        await page.locator('[data-action="start"], [data-grammar-choice], button.option, textarea, [data-token]').first().waitFor({ timeout: 30_000 });
        const start = page.locator('[data-action="start"]');
        if (await start.count()) await start.click();
        await page.waitForFunction(() => document.querySelector('[data-grammar-choice], textarea, button.option, [data-token], [data-pair]'), null, { timeout: 30_000 });
        const items = await stand.sessionItems(sessionId);
        const label = `${width}px ${scenario.split('?')[0]}`;
        check(items.length > 0, `${label}: сессия создана (${items.length} заданий)`);

        let idx = 0; // номер задания: кнопка «Далее» его не двигает, только ответ
        for (let guard = 0; guard < items.length * 3 + 4; guard++) {
          if (await page.locator('[data-lesson-result]').count()) break;
          const next = page.locator('[data-action="next"]:not([disabled])');
          if (await next.count()) { await next.click(); await page.waitForTimeout(250); continue; }
          await page.waitForTimeout(1100); // сервер отклоняет слишком быстрые ответы
          const i = idx++;
          const item = items[Math.min(i, items.length - 1)];
          const rows = (await page.evaluate(PROBE)) as Tile[];
          if (rows.length) {
            tiles += rows.length;
            seen.add(item.type);
            const worst = rows.reduce((a, b) => (Math.abs(b.offset) > Math.abs(a.offset) ? b : a));
            check(rows.every((r) => Math.abs(r.offset) <= 2), `${label} ${item.type}: слова по центру плашек (${rows.map((r) => `${r.text} ${r.offset}`).join(' · ')}; худшее ${worst.offset} px)`);
            check(rows.every((r) => !r.overlap), `${label} ${item.type}: буква варианта не заезжает на слово`);
            check((await page.evaluate('document.documentElement.scrollWidth')) <= width, `${label} ${item.type}: нет горизонтальной прокрутки`);
            if (width === 390) await page.screenshot({ path: `${OUT}/${item.type}-${scenario.split('?')[0]}-${i}.png` });
          }
          const checkBtn = page.locator('[data-action="check"]');
          const answered = () => page.locator('[data-action="next"]').waitFor({ timeout: 15_000 });
          if (await page.locator('[data-action="skip"]').count()) { await page.locator('[data-action="skip"]').click(); await answered(); continue; }
          if (await page.locator('textarea').count()) { await page.fill('textarea', 'zzz'); await checkBtn.click(); await answered(); continue; }
          if (await page.locator('[data-token]').count()) {
            while (await page.locator('[data-token]').count()) await page.locator('[data-token]').first().click();
            await checkBtn.click(); await answered(); continue;
          }
          if (await page.locator('[data-pair="left"]').count()) {
            const k = await page.locator('[data-pair="left"]').count();
            for (let j = 0; j < k; j++) { await page.locator('[data-pair="left"]').nth(j).click(); await page.locator('[data-pair="right"]').nth(j).click(); }
            if (await checkBtn.count()) await checkBtn.click();
            await answered(); continue;
          }
          const opts = page.locator('button.option:not([disabled]), [data-grammar-choice] button[data-form]:not([disabled])');
          if (await opts.count()) { await opts.first().click(); if (await checkBtn.count()) await checkBtn.click(); await answered().catch(() => undefined); continue; }
        }
        await context.close();
      }
    }
  } finally {
    await browser.close();
    await stand.stop();
  }
  check(tiles >= 20, `проверено плашек: ${tiles}; типы заданий: ${[...seen].join(', ')}`);
  check(seen.has('GRAMMAR') || seen.has('FILL_GAP') || seen.has('WORD_TRANSLATION'), 'встретились задания с выбором слова');
  check(pageErrors.length === 0, `без ошибок страницы${pageErrors.length ? ': ' + pageErrors.slice(0, 3).join(' | ') : ''}`);
  console.log(failures.length ? `\nПровалено: ${failures.length}` : '\nВсе проверки пройдены');
  process.exit(failures.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
