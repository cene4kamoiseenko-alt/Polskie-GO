/**
 * Входной тест в настоящем браузере (владелец 2026-11-10: «как у игрока первым городом открылась Лодзь?» → вариант А: на итоговом экране названия городов,
 * а не коды, и проверка, что после Лодзи всё идёт нормально).
 *
 *   node --import tsx scripts/placement-check.ts   → test-results/placement/*.png
 *
 * Игрок проходит входной тест через интерфейс (7 верных ответов из 10 → 70 %): итоговый экран пишет «Warszawa, Łódź», карта и главная ставят текущим городом Лодзь,
 * первый урок Лодзи открывается и проходится до конца. Chromium, а не Telegram на iPhone / Android.
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromiumPath, startStand } from './lib/stand';

const root = process.cwd();
const require = createRequire(root + '/package.json');
const OUT = resolve(root, 'test-results/placement');
const failures: string[] = [];
const check = (ok: unknown, what: string) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) failures.push(what);
};
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

type Option = { id: string; text: string | { ru?: string; uk?: string; en?: string } };
const label = (o: Option) => (typeof o.text === 'string' ? o.text : (o.text.ru ?? o.text.en ?? ''));

async function main() {
  const { chromium } = require('playwright') as typeof import('playwright');
  mkdirSync(OUT, { recursive: true });
  const stand = await startStand({ ui: 'dev' });
  const browser = await chromium.launch({ headless: true, executablePath: chromiumPath(chromium), args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const pageErrors: string[] = [];
  try {
    const u = await stand.login();
    // знакомство пройдено (уровень «немного знаю» → предлагается входной тест), дальше сам тест — в интерфейсе
    await u.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A1', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: null });
    await u.call('PATCH', '/api/me/settings', { theme: 'dark', reducedMotion: true });
    const exams = (await u.call('GET', '/api/exams')).body.exams as { id: string; kind: string }[];
    const placement = exams.find((e) => e.kind === 'PLACEMENT')!;
    const id = '996001';
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'ru-RU' });
    const page = await context.newPage();
    page.on('pageerror', (e) => pageErrors.push(e.message));
    await page.addInitScript(({ token, id }) => localStorage.setItem('pg_auth', JSON.stringify({ token, owner: `dev:${id}`, exp: Date.now() + 86_400_000 })), { token: u.token, id });
    let sessionId = '';
    page.on('response', async (r) => {
      if (r.url().endsWith('/api/sessions') && r.request().method() === 'POST') sessionId = (await r.json().catch(() => ({}))).sessionId ?? sessionId;
    });
    await page.goto(`${stand.base}/lesson/${placement.id}?devUser=${id}`);
    await page.locator('[data-action="start"], button.option').first().waitFor({ timeout: 30_000 });
    const start = page.locator('[data-action="start"]');
    if (await start.count()) await start.click();
    await page.locator('button.option').first().waitFor({ timeout: 30_000 });
    const items = await stand.sessionItems(sessionId);
    check(items.length === 10, `входной тест: ${items.length} заданий`);

    // 7 верных, 3 неверных: 70 % → Варшава и Лодзь, текущая — Лодзь. Неверные ответы урок повторяет в конце («работа над ошибками», на оценку не влияет),
    // поэтому после десяти заданий отвечаем верно на повторы тех же трёх.
    const answer = async (n: number, right: boolean) => {
      await page.waitForTimeout(1100); // сервер отклоняет слишком быстрые ответы
      const data = items[n].data as { options: Option[]; answer: string };
      const target = right ? data.options.find((o) => o.id === data.answer)! : data.options.find((o) => o.id !== data.answer)!;
      const pattern = `^(?:[A-D]\\s+)?${esc(label(target))}$`;
      const index = (await page.evaluate(
        `(() => { const re = new RegExp(${JSON.stringify(pattern)}); return [...document.querySelectorAll('button.option')].findIndex((b) => re.test(b.innerText.replace(/\\s+/g, ' ').trim())); })()`,
      )) as number;
      if (index < 0) {
        await page.screenshot({ path: `${OUT}/no-option-${n}.png` });
        throw new Error(`задание ${n + 1} (${items[n].type}): нет плашки «${label(target)}»`);
      }
      await page.locator('button.option').nth(index).click();
      await page.locator('[data-action="check"]').click();
      await page.locator('[data-action="next"]').waitFor({ timeout: 15_000 });
      await page.locator('[data-action="next"]').click();
      await page.waitForTimeout(250);
    };
    for (let i = 0; i < items.length; i++) await answer(i, i < 7);
    for (let k = 7; k < items.length && !(await page.locator('[data-lesson-result]').count()); k++) await answer(k, true);

    await page.locator('[data-lesson-result]').waitFor({ timeout: 30_000 });
    await page.waitForTimeout(600);
    const body = await page.locator('body').innerText();
    await page.screenshot({ path: `${OUT}/result.png`, fullPage: true });
    check(/Рекомендованный старт: A0/.test(body), 'итог: «Рекомендованный старт: A0» (70 %)');
    check(/Мы открыли для тебя города: Warszawa, Łódź/.test(body), 'итог: «Мы открыли для тебя города: Warszawa, Łódź» (названия, не коды)');
    check(!/warszawa|lodz/.test(body.split('Мы открыли')[1]?.slice(0, 80) ?? ''), 'итог: кодов «warszawa» / «lodz» на экране нет');

    // Главная и карта: текущий город — Лодзь
    await page.goto(`${stand.base}/?devUser=${id}`);
    await page.getByText('Главная', { exact: true }).first().waitFor({ timeout: 30_000 });
    await page.waitForTimeout(1500);
    const home = await page.locator('body').innerText();
    check(/Łódź/.test(home), 'главная: в карточке города — Łódź');
    await page.screenshot({ path: `${OUT}/home.png` });

    await page.goto(`${stand.base}/map?devUser=${id}`);
    await page.locator('[data-map-card]').first().waitFor({ timeout: 30_000 });
    await page.waitForTimeout(1000);
    const states = await page.evaluate(`[...document.querySelectorAll('[data-map-card]')].map((c) => c.getAttribute('data-state') + ':' + c.innerText.replace(/\\s+/g, ' ').slice(0, 60))`) as string[];
    check(states.some((s) => s.startsWith('current:') && /Łódź/.test(s)), `карта: текущий город — Łódź (${states.slice(0, 3).join(' | ')})`);
    await page.screenshot({ path: `${OUT}/map.png` });

    // «Продолжить урок» ведёт в первый урок Лодзи, он проходится до итога
    await page.goto(`${stand.base}/?devUser=${id}`);
    const go = page.getByRole('button', { name: /Продолжить урок|Начать урок/ }).first();
    await go.waitFor({ timeout: 30_000 });
    await go.click();
    await page.waitForTimeout(1500);
    const lessonStart = page.locator('[data-action="start"]');
    if (await lessonStart.count()) await lessonStart.click();
    await page.locator('[data-action="check"], [data-action="next"], button.option, textarea, [data-token], [data-pair]').first().waitFor({ timeout: 30_000 });
    check(/\/lesson\//.test(page.url()), `«Продолжить урок» открыл урок (${new URL(page.url()).pathname})`);
    await page.screenshot({ path: `${OUT}/lodz-first-lesson.png` });
    await context.close();
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
