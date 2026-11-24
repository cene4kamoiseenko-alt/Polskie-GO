/**
 * Вовлечённость в настоящем браузере (docs/superpowers/specs/2026-11-24-engagement-design.md), экран 390×844:
 *   A. Короткий первый урок: новичку — до 8 простых заданий; брошенный урок — «Продолжить · осталось N» на главной; кнопка карточки бота
 *      (?bot_screen=continue&src=card_newcomer) открывает урок и один раз отмечает «открыл карточку»; закончил — «Первая победа!»;
 *      кнопка вопроса дня (?bot_screen=warmup) открывает разминку на 5 заданий.
 *   B. «С возвращением»: после 8 дней без занятий — шторка с подарком 50 злотков, «Забрать» начисляет и предлагает повторение;
 *      после перезапуска шторки нет.
 *   C. Тур по вкладкам: после первого урока — 5 подсказок у вкладок, «Дальше» до конца, после — не показывается; новичку до урока — нет;
 *      «Как здесь всё устроено» в профиле показывает тур снова; Esc закрывает.
 *
 *   node --import tsx scripts/engagement-check.ts   → test-results/engagement/*.png
 *
 * Chromium, а не Telegram на iPhone / Android.
 */
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Browser, Page } from 'playwright';
import { chromiumPath, startStand } from './lib/stand';

const root = process.cwd();
const require = createRequire(root + '/package.json');
const OUT = resolve(root, 'test-results/engagement');
const AXE = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const PART = (process.argv[2] ?? 'ABC').toUpperCase();
const failures: string[] = [];
const check = (ok: unknown, what: string) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) failures.push(what);
};

type Stand = Awaited<ReturnType<typeof startStand>>;
type User = Awaited<ReturnType<Stand['login']>>;

async function main() {
  const { chromium } = require('playwright') as typeof import('playwright');
  mkdirSync(OUT, { recursive: true });
  const stand: Stand = await startStand({ ui: 'dev' });
  const browser: Browser = await chromium.launch({ headless: true, executablePath: chromiumPath(chromium), args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const pageErrors: string[] = [];
  let seq = 0;

  async function player(onboard = true) {
    const u = await stand.login();
    if (onboard) await u.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A0', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: null });
    await u.call('PATCH', '/api/me/settings', { theme: 'dark', reducedMotion: true });
    return u;
  }
  /** Страница игрока; `posts` — тела POST-запросов к API по адресу. */
  async function open(u: User, path: string) {
    const id = String(996000 + ++seq);
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, locale: 'ru-RU', isMobile: true, hasTouch: true });
    const page = await context.newPage();
    page.on('pageerror', (e) => pageErrors.push(e.message));
    await page.addInitScript(({ token, id }) => localStorage.setItem('pg_auth', JSON.stringify({ token, owner: `dev:${id}`, exp: Date.now() + 86_400_000 })), { token: u.token, id });
    const posts: { url: string; body: unknown }[] = [];
    page.on('request', (r) => {
      if (r.method() === 'POST' && /\/api\//.test(r.url())) posts.push({ url: new URL(r.url()).pathname, body: r.postDataJSON?.() ?? null });
    });
    const go = (p: string) => page.goto(`${stand.base}${p}${p.includes('?') ? '&' : '?'}devUser=${id}`);
    await go(path);
    return { page, context, posts, go };
  }
  const settle = async (page: Page, ms = 800) => {
    await page.waitForLoadState('networkidle').catch(() => undefined);
    await page.waitForTimeout(ms);
  };
  // Проверяется сам новый элемент (шторка, подсказка): метатег viewport Mini App и полосы прогресса главной — вне этой работы.
  const axe = async (page: Page, what: string, scope: string) => {
    await page.addScriptTag({ content: AXE });
    const r = (await page.evaluate(`axe.run(${JSON.stringify(scope)}, { runOnly: ['wcag2a', 'wcag2aa'] })`)) as { violations: { id: string; impact: string | null }[] };
    const bad = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    check(bad.length === 0, `${what}: доступность — серьёзных нарушений нет${bad.length ? ` (${bad.map((v) => v.id).join(', ')})` : ''}`);
  };
  async function answerViaApi(u: User, sessionId: string, from: number, to: number) {
    const items = await stand.sessionItems(sessionId);
    for (const it of items.slice(from, to)) for (const a of stand.correctAnswers(it)) await u.call('POST', `/api/sessions/${sessionId}/answer`, { key: it.key, answer: a });
    return items.length;
  }
  /** Доиграть урок в интерфейсе до итога (как scripts/browser-check.ts). */
  async function playToResult(page: Page) {
    for (let guard = 0; guard < 80; guard++) {
      if (await page.locator('[data-lesson-result]').count()) return true;
      const next = page.locator('[data-action="next"]:not([disabled])');
      if (await next.count()) { await next.click(); await page.waitForTimeout(250); continue; }
      const start = page.locator('[data-action="start"]');
      if (await start.count()) { await start.click(); await page.waitForTimeout(300); continue; }
      await page.waitForTimeout(1100);
      const checkBtn = page.locator('[data-action="check"]');
      const answered = () => page.locator('[data-action="next"]').waitFor({ timeout: 15_000 }).catch(() => undefined);
      if (await page.locator('[data-pair="left"]').count()) {
        const n = await page.locator('[data-pair="left"]').count();
        for (let k = 0; k < n; k++) { await page.locator('[data-pair="left"]').nth(k).click(); await page.locator('[data-pair="right"]').nth(k).click(); }
        if (await checkBtn.count()) await checkBtn.click();
        await answered();
        continue;
      }
      if (await page.locator('[data-token]').count()) {
        while (await page.locator('[data-token]').count()) await page.locator('[data-token]').first().click();
        await checkBtn.click();
        await answered();
        continue;
      }
      const opts = page.locator('button.option:not([disabled])');
      if ((await checkBtn.count()) && (await opts.count())) { await opts.first().click(); await checkBtn.click(); await answered(); continue; }
    }
    return (await page.locator('[data-lesson-result]').count()) > 0;
  }

  try {
    if (PART.includes('A')) {
      console.log('A. Первый урок');
      const u = await player();
      const j = await u.call('GET', '/api/journey');
      const lessonId = j.body.nextLesson.id as string;
      const s = await u.call('POST', '/api/sessions', { lessonId });
      const total = s.body.items.length as number;
      check(total >= 5 && total <= 8, `A1 новичку — короткий урок (${total} заданий)`);
      await answerViaApi(u, s.body.sessionId, 0, 3);
      const home = await open(u, '/');
      await home.page.locator('.home-continue').waitFor({ timeout: 20_000 });
      await settle(home.page);
      const label = await home.page.locator('.home-continue').innerText();
      check(label.includes(`осталось ${total - 3}`), `A2 на главной — «Продолжить · осталось ${total - 3}» (${label.replace(/\s+/g, ' ')})`);
      await home.page.screenshot({ path: `${OUT}/home-continue-left.png` });
      await home.context.close();

      const card = await open(u, '/?bot_screen=continue&src=card_newcomer');
      await card.page.waitForURL(/\/lesson\//, { timeout: 20_000 });
      await settle(card.page, 1500);
      check(card.page.url().includes(`/lesson/${lessonId}`), 'A3 кнопка карточки новичка открыла начатый урок');
      check(card.posts.filter((p) => p.url === '/api/engage/opened').length === 1, `A3 «открыл карточку» отмечено один раз (${card.posts.filter((p) => p.url === '/api/engage/opened').length})`);
      check(JSON.stringify(card.posts.find((p) => p.url === '/api/engage/opened')?.body) === JSON.stringify({ src: 'card_newcomer' }), 'A3 с меткой card_newcomer');
      // Остальное — через API, кроме последнего задания; ждём, чтобы сервер не счёл урок «слишком быстрым».
      await answerViaApi(u, s.body.sessionId, 3, total - 1);
      await card.page.waitForTimeout(total * 1000 + 500);
      await card.go(`/lesson/${lessonId}`);
      const done = await playToResult(card.page);
      check(done, 'A4 урок доигран в интерфейсе до итога');
      const result = await card.page.locator('[data-lesson-result]').innerText().catch(() => '');
      check(/Первая победа/.test(result), 'A4 итог первого урока — «Первая победа!»');
      await card.page.screenshot({ path: `${OUT}/first-win.png` });
      await card.context.close();

      const warm = await open(u, '/?bot_screen=warmup&src=quiz_warmup');
      await warm.page.waitForURL(/\/practice\/WARMUP/, { timeout: 20_000 });
      await settle(warm.page, 1500);
      const started = warm.posts.find((p) => p.url === '/api/sessions');
      check(JSON.stringify(started?.body ?? null).includes('WARMUP'), 'A5 кнопка вопроса дня открыла разминку (режим WARMUP)');
      check(warm.posts.filter((p) => p.url === '/api/engage/opened').length === 0, 'A5 метка вопроса дня не отмечает карточки');
      await warm.page.screenshot({ path: `${OUT}/warmup.png` });
      await warm.context.close();
    }

    if (PART.includes('B')) {
      console.log('B. С возвращением');
      const u = await player();
      const s = await u.call('POST', '/api/sessions', { lessonId: (await u.call('GET', '/api/journey')).body.nextLesson.id });
      await answerViaApi(u, s.body.sessionId, 0, 99);
      await new Promise((r) => setTimeout(r, s.body.items.length * 1000 + 500));
      await u.call('POST', `/api/sessions/${s.body.sessionId}/finish`);
      await stand.env.DB.prepare(`UPDATE player_progress SET last_active_day = date('now', '-8 day') WHERE user_id = ?`).bind(u.user.id).run();
      const before = (await u.call('GET', '/api/me')).body.zlotki as number;
      const p = await open(u, '/');
      const sheet = p.page.locator('[data-comeback]');
      await sheet.waitFor({ timeout: 20_000 });
      check(/С возвращением/.test(await sheet.innerText()) && /50/.test(await sheet.innerText()), 'B1 после 8 дней без занятий — шторка «С возвращением» с подарком 50');
      await axe(p.page, 'B1 шторка «С возвращением»', '[role=dialog]');
      await p.page.screenshot({ path: `${OUT}/comeback.png` });
      await p.page.locator('[data-comeback-claim]').click();
      await p.page.locator('[data-comeback-next]').waitFor({ timeout: 10_000 });
      const after = (await u.call('GET', '/api/me')).body.zlotki as number;
      check(after === before + 50, `B2 «Забрать» начислил 50 злотков (${before} → ${after})`);
      check(/повторени|разминк/i.test(await sheet.innerText()), 'B2 после подарка — предложение короткого повторения');
      check((await p.page.locator('[data-tour]').count()) === 0, 'B2 тур по вкладкам не всплывает поверх шторки «С возвращением»');
      await p.page.screenshot({ path: `${OUT}/comeback-claimed.png` });
      await p.go('/');
      await settle(p.page, 1500);
      check((await p.page.locator('[data-comeback]').count()) === 0, 'B3 после перезапуска шторки нет');
      await p.context.close();
    }

    if (PART.includes('C')) {
      console.log('C. Тур по вкладкам');
      const fresh = await player();
      const f = await open(fresh, '/');
      await f.page.locator('.home-continue').waitFor({ timeout: 20_000 });
      await settle(f.page, 1500);
      check((await f.page.locator('[data-tour]').count()) === 0, 'C1 новичку до первого урока тур не показывается');
      await f.context.close();

      const u = await player();
      const s = await u.call('POST', '/api/sessions', { lessonId: (await u.call('GET', '/api/journey')).body.nextLesson.id });
      await answerViaApi(u, s.body.sessionId, 0, 99);
      await new Promise((r) => setTimeout(r, s.body.items.length * 1000 + 500));
      await u.call('POST', `/api/sessions/${s.body.sessionId}/finish`);
      const p = await open(u, '/');
      const tip = p.page.locator('[data-tour]');
      await tip.waitFor({ timeout: 20_000 });
      check(/1 из 5/.test(await tip.innerText()) && (await tip.getAttribute('data-tour')) === 'home', 'C2 после первого урока — подсказка «1 из 5» у вкладки «Сегодня»');
      await axe(p.page, 'C2 подсказка тура', '[data-tour]');
      await p.page.screenshot({ path: `${OUT}/tour-1.png` });
      const steps: string[] = [];
      for (let i = 0; i < 4; i++) {
        await p.page.locator('[data-tour-next]').click();
        await p.page.waitForTimeout(250);
        steps.push((await tip.getAttribute('data-tour')) ?? '');
        if (i === 1) await p.page.screenshot({ path: `${OUT}/tour-life.png` });
      }
      check(JSON.stringify(steps) === JSON.stringify(['study', 'life', 'quests', 'profile']), `C3 «Дальше» ведёт по вкладкам (${steps.join(' → ')})`);
      check(/гардероб/i.test(await tip.innerText()), 'C3 подсказка профиля называет гардероб');
      await p.page.locator('[data-tour-next]').click();
      await p.page.waitForTimeout(400);
      check((await tip.count()) === 0, 'C4 после последнего шага тур закрыт');
      check((await u.call('GET', '/api/me')).body.tourDone === true, 'C4 отметка «тур пройден» на сервере');
      await p.go('/');
      await settle(p.page, 1500);
      check((await p.page.locator('[data-tour]').count()) === 0, 'C5 после перезапуска тур не показывается');
      await p.go('/profile');
      await p.page.locator('[data-tour-replay]').click({ timeout: 20_000 });
      await tip.waitFor({ timeout: 10_000 });
      check((await tip.getAttribute('data-tour')) === 'home', 'C6 «Как здесь всё устроено» в профиле показывает тур снова');
      await p.page.keyboard.press('Escape');
      await p.page.waitForTimeout(300);
      check((await tip.count()) === 0, 'C6 Esc закрывает тур');
      await p.context.close();
    }
    check(pageErrors.length === 0, `ошибок на страницах нет${pageErrors.length ? `: ${pageErrors.slice(0, 3).join(' | ')}` : ''}`);
  } finally {
    await browser.close();
    await stand.stop();
  }
  console.log(failures.length ? `\nНЕ ПРОЙДЕНО: ${failures.length}\n- ${failures.join('\n- ')}` : '\nвсе проверки пройдены');
  process.exit(failures.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
