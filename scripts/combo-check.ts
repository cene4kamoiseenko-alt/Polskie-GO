/**
 * Похвала за серию верных ответов в уроке (владелец 2026-11-24, вариант Б): не вспышка поверх экрана, а золотая панель ответа.
 *  · 3, 5, 10, 15 верных подряд — панель ответа золотая (is-combo): польское слово и ×N, огонёк, «N верных подряд», +XP;
 *  · обычный верный ответ (4-й) — обычная зелёная панель;
 *  · поверх урока ничего не всплывает (.combo-burst больше нет), картинка с Бобеком открыта;
 *  · «Меньше анимаций» — та же золотая панель, без движения (блик и искры не запускаются);
 *  · светлая и тёмная тема, 320 и 390 px; доступность панели (axe).
 * Ответы сервера подменяются на «верно» (route) — проверяется вид, а не знание польского.
 *
 * Запуск: node --import tsx scripts/combo-check.ts   → test-results/combo/*.png и combo.webm (видео для владельца)
 */
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, renameSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Page } from 'playwright';
import { chromiumPath, startStand } from './lib/stand';

const root = process.cwd();
const require = createRequire(root + '/package.json');
const AXE = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const OUT = resolve(root, 'test-results/combo');
const failures: string[] = [];
const check = (ok: unknown, what: string) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) failures.push(what);
};

/** Ответить на текущее задание чем угодно (сервер ответ подменён на «верно») и дождаться панели. */
async function answerAny(p: Page) {
  await p.waitForTimeout(1100); // сервер не принимает ответы быстрее ~1 с на задание
  const checkBtn = p.locator('[data-action="check"]');
  if (await p.locator('textarea').count()) await p.fill('textarea', 'Dziękuję');
  else if (await p.locator('[data-token]').count()) while (await p.locator('[data-token]').count()) await p.locator('[data-token]').first().click();
  else if (await p.locator('[data-pair="left"]').count()) {
    const n = await p.locator('[data-pair="left"]').count();
    for (let k = 0; k < n; k++) {
      await p.locator('[data-pair="left"]').nth(k).click();
      await p.locator('[data-pair="right"]').nth(k).click();
    }
  } else if (await p.locator('button.option:not([disabled])').count()) await p.locator('button.option:not([disabled])').first().click();
  if (await checkBtn.count()) await checkBtn.click();
  await p.locator('[data-action="next"]').waitFor({ timeout: 15_000 });
  await p.waitForTimeout(900);
}

async function main() {
  const { chromium } = require('playwright') as typeof import('playwright');
  mkdirSync(OUT, { recursive: true });
  const stand = await startStand({ ui: 'dev' });
  const browser = await chromium.launch({ headless: true, executablePath: chromiumPath(chromium), args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  let devUser = 996600;
  try {
    const runs: [number, number, 'light' | 'dark', boolean][] = [[390, 844, 'light', false], [390, 844, 'dark', false], [320, 568, 'light', false], [390, 844, 'light', true]];
    for (const [width, height, theme, reduced] of runs) {
      const tag = `${width}px ${theme}${reduced ? ' «меньше анимаций»' : ''}`;
      const u = await stand.login();
      await u.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A0', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: null });
      await u.call('PATCH', '/api/me/settings', { theme, reducedMotion: reduced });
      await u.call('POST', '/api/flags/tour', {});
      const id = String(++devUser);
      const video = width === 390 && theme === 'light' && !reduced;
      const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, locale: 'ru-RU', colorScheme: theme, ...(video ? { recordVideo: { dir: OUT + '/vid', size: { width, height } } } : {}) });
      const p = await ctx.newPage();
      await p.addInitScript(({ token, id }) => localStorage.setItem('pg_auth', JSON.stringify({ token, owner: `dev:${id}`, exp: Date.now() + 86_400_000 })), { token: u.token, id });
      await p.route('**/api/sessions/*/answer', async (route) => {
        const res = await route.fetch();
        const body = await res.json();
        await route.fulfill({ response: res, json: { ...body, correct: true, retry: false, skipped: false, almost: false } });
      });
      const lessonId = (await u.call('GET', '/api/journey')).body.nextLesson.id as string;
      await p.goto(`${stand.base}/lesson/${lessonId}?devUser=${id}`);
      await p.locator('[data-action="start"]').click({ timeout: 20_000 });
      await p.locator('[data-stage-mood]').waitFor({ timeout: 15_000 });

      const panel = async () =>
        p.evaluate(() => {
          const el = document.querySelector('.feedback-panel.rounded-t-3xl') as HTMLElement | null;
          const stage = document.querySelector('[data-stage-mood]')?.getBoundingClientRect();
          const r = el?.getBoundingClientRect();
          return {
            combo: el?.classList.contains('is-combo') ?? false,
            text: el?.innerText.replace(/\s+/g, ' ') ?? '',
            flame: !!el?.querySelector('[data-combo-flame]'),
            burst: document.querySelectorAll('.combo-burst,[data-combo-burst]').length,
            clearOfStage: !!r && !!stage && r.top >= stage.bottom - 1,
            sheen: document.getAnimations().some((a) => /combo-sheen/.test((a as CSSAnimation).animationName ?? '')),
          };
        });
      for (let n = 1; n <= 5; n++) {
        await answerAny(p);
        const s = await panel();
        if (n === 3 || n === 5) {
          const word = n === 3 ? 'Dobrze!' : 'Świetnie!';
          check(s.combo && s.flame, `${tag}: ${n} верных подряд — золотая панель с огоньком`);
          check(s.text.includes(`${word} ×${n}`) && s.text.includes(`${n} верных подряд`), `${tag}: в панели «${word} ×${n}» и «${n} верных подряд» (${s.text.slice(0, 80)})`);
          check(s.burst === 0, `${tag}: поверх урока ничего не всплывает`);
          check(s.clearOfStage, `${tag}: панель не заходит на картинку`);
          check(reduced ? !s.sheen : s.sheen, `${tag}: блик по панели ${reduced ? 'не запускается' : 'есть'}`);
          if (n === 5) {
            await p.addScriptTag({ content: AXE });
            const v = await p.evaluate(async () => (await (window as unknown as { axe: { run: (c: unknown) => Promise<{ violations: { id: string }[] }> } }).axe.run('.feedback-panel')).violations.map((x) => x.id));
            check(v.length === 0, `${tag}: доступность панели (axe) ${v.join(', ')}`);
            await p.screenshot({ path: `${OUT}/combo5-${width}-${theme}${reduced ? '-reduced' : ''}.png` });
          }
        } else if (n === 4) check(!s.combo && !s.flame, `${tag}: 4-й верный ответ — обычная панель`);
        if (n < 5) await p.locator('[data-action="next"]').click();
      }
      const vid = p.video();
      await ctx.close();
      if (vid) renameSync(await vid.path(), `${OUT}/combo.webm`);
    }
  } finally {
    await browser.close();
    await stand.stop();
  }
  console.log(failures.length ? `\n${failures.length} FAIL` : '\nвсё ok');
  process.exit(failures.length ? 1 : 0);
}
void main();
