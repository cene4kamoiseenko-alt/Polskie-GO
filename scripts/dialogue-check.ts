/**
 * Диалог в уроке: повторное нажатие и потерянный ответ (владелец 2026-11-12, журнал ошибок Mini App: «wrong_step», /lesson/l_krk-2-mam).
 * Сервер принимает шаги диалога строго по порядку (services/sessions.ts → answerItem). Клиент после верного ответа ждёт 700 мс до следующей реплики,
 * и всё это время кнопки были нажимаемы: второй тап посылал уже принятый шаг → 400 wrong_step → необработанная ошибка в журнале.
 *
 *   node --import tsx scripts/dialogue-check.ts   → test-results/dialogue/*.png
 *
 *   A. Двойной тап по верному ответу: второго запроса нет, ошибок нет, диалог проходится до конца.
 *   B. Ответ сервера потерялся по дороге (сервер шаг принял, телефон ответа не получил): повторный тап не застревает на этом шаге, диалог идёт дальше.
 *
 * Урок lodz-3-zawody: диалог — первое задание, Лодзь открыта результатом входного теста. Chromium, а не Telegram на iPhone / Android.
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Page } from 'playwright';
import { chromiumPath, startStand } from './lib/stand';

const root = process.cwd();
const require = createRequire(root + '/package.json');
const OUT = resolve(root, 'test-results/dialogue');
const failures: string[] = [];
const check = (ok: unknown, what: string) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) failures.push(what);
};

type Step = { npc: string; options?: { id: string; text: string }[]; answer?: string };

async function main() {
  const { chromium } = require('playwright') as typeof import('playwright');
  mkdirSync(OUT, { recursive: true });
  const stand = await startStand({ ui: 'dev' });
  const { playSession } = await import(root + '/apps/server/test/helpers.ts');
  const { resetRateLimits } = await import(root + '/apps/server/src/hono.ts');
  const browser = await chromium.launch({ headless: true, executablePath: chromiumPath(chromium), args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const pageErrors: string[] = [];
  let seq = 0;

  /** Игрок с открытой Лодзью (результат входного теста 70 %) и страница с его уроком; считаются ответы 400 и отчёты об ошибках клиента. */
  async function setup() {
    resetRateLimits();
    const u = await stand.login();
    await u.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A1', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: null });
    await u.call('PATCH', '/api/me/settings', { theme: 'dark', reducedMotion: true });
    const exams = (await u.call('GET', '/api/exams')).body.exams as { id: string; kind: string }[];
    const created = await u.call('POST', '/api/sessions', { lessonId: exams.find((e) => e.kind === 'PLACEMENT')!.id });
    await playSession(u.call, created.body.sessionId, { wrong: 3 });
    const journey = (await u.call('GET', '/api/journey')).body as { cities: { slug: string; routes: { lessons: { id: string; slug: string }[] }[] }[] };
    const lesson = journey.cities.find((c) => c.slug === 'lodz')!.routes.flatMap((r) => r.lessons).find((l) => l.slug === 'lodz-3-zawody')!;
    const id = String(998000 + ++seq);
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'ru-RU' });
    const page = await context.newPage();
    page.on('pageerror', (e) => pageErrors.push(e.message));
    await page.addInitScript(({ token, id }) => localStorage.setItem('pg_auth', JSON.stringify({ token, owner: `dev:${id}`, exp: Date.now() + 86_400_000 })), { token: u.token, id });
    const wrongSteps: number[] = [];
    const reports: string[] = [];
    let sessionId = '';
    page.on('response', async (r) => {
      if (!/\/api\/sessions\/[^/]+\/answer$/.test(r.url())) return;
      if (r.status() === 400) wrongSteps.push(r.status());
    });
    page.on('request', (r) => {
      if (r.method() === 'POST' && r.url().endsWith('/api/client-errors')) reports.push(r.postData() ?? '');
    });
    page.on('response', async (r) => {
      if (r.url().endsWith('/api/sessions') && r.request().method() === 'POST') sessionId = (await r.json().catch(() => ({}))).sessionId ?? sessionId;
    });
    await page.goto(`${stand.base}/lesson/${lesson.id}?devUser=${id}`);
    await page.locator('[data-action="start"], button.option').first().waitFor({ timeout: 30_000 });
    const start = page.locator('[data-action="start"]');
    if (await start.count()) await start.click();
    await page.locator('button.option').first().waitFor({ timeout: 30_000 });
    const items = await stand.sessionItems(sessionId);
    const steps = (items[0].data as { steps: Step[] }).steps;
    const choices = steps.map((s, i) => ({ s, i })).filter(({ s }) => s.options?.length);
    return { context, page, steps, choices, wrongSteps, reports };
  }

  /** Центр кнопки варианта с этим польским текстом (первая строка кнопки). */
  const centerOf = async (page: Page, text: string) =>
    (await page.evaluate(`(() => { const b = [...document.querySelectorAll('button.option')].find((x) => x.innerText.split('\\n')[0].trim() === ${JSON.stringify(text)}); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`)) as { x: number; y: number } | null;
  const optionText = (st: Step, id?: string) => st.options!.find((o) => o.id === (id ?? st.answer))!.text;

  try {
    // ── A. Двойной тап ────────────────────────────────────────────────────────────────────────────────────────────────────────────
    {
      const { context, page, steps, choices, wrongSteps, reports } = await setup();
      let n = 0;
      for (const { s } of choices) {
        await page.waitForTimeout(1200); // сервер отклоняет слишком быстрые ответы; заодно ждём очередную реплику
        const right = optionText(s);
        const at = await centerOf(page, right);
        if (!at) throw new Error(`нет кнопки «${right}»`);
        await page.mouse.click(at.x, at.y);
        await page.waitForTimeout(150); // ответ сервера уже пришёл, а следующая реплика ещё не открылась (700 мс)
        await page.mouse.click(at.x, at.y); // второй тап
        n++;
        if (n === 1) await page.screenshot({ path: `${OUT}/after-double-tap.png` });
      }
      await page.waitForTimeout(1500);
      check(wrongSteps.length === 0, `A: повторный тап не даёт 400 wrong_step (ответов 400: ${wrongSteps.length})`);
      check(reports.length === 0, `A: ошибок Mini App в журнал не ушло (${reports.length})`);
      await page.locator('[data-action="next"]:not([disabled])').waitFor({ timeout: 8_000 }).then(
        () => check(true, `A: диалог пройден до конца (${n} шагов с выбором из ${steps.length}), «Далее» доступно`),
        () => check(false, 'A: диалог пройден до конца, «Далее» доступно'),
      );
      await context.close();
    }

    // ── B. Ответ сервера потерялся ───────────────────────────────────────────────────────────────────────────────────────────────
    {
      const { context, page, steps, choices, wrongSteps } = await setup();
      let calls = 0;
      await page.route('**/api/sessions/*/answer', async (route) => {
        calls++;
        if (calls === 1) {
          await route.fetch(); // сервер шаг принял…
          await route.abort('failed'); // …а телефон ответа не получил
        } else await route.continue();
      });
      const first = choices[0];
      const second = choices[1];
      await page.waitForTimeout(1200);
      const right = optionText(first.s);
      const at = await centerOf(page, right);
      await page.mouse.click(at!.x, at!.y);
      await page.waitForTimeout(800);
      check((await page.locator('[data-toast]').count()) > 0, 'B: при обрыве связи игрок видит сообщение, что ответ не дошёл');
      await page.waitForTimeout(700);
      // игрок видит, что ничего не произошло, и нажимает ещё раз
      await page.mouse.click(at!.x, at!.y);
      await page.waitForTimeout(2500);
      const nextText = optionText(second.s);
      const moved = await centerOf(page, nextText);
      await page.screenshot({ path: `${OUT}/after-lost-response.png` });
      check(!!moved, `B: после потерянного ответа и повторного тапа диалог идёт дальше (виден вариант следующего шага «${nextText}»; шагов ${steps.length})`);
      check(wrongSteps.length <= 1, `B: сервер ответил 400 не больше одного раза (${wrongSteps.length})`);
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
