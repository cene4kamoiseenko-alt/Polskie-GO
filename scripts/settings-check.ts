/**
 * Настройки — вариант В с выбором из Б (владелец 2026-11-24): шапка с Бобеком игрока, 4 плитки (Язык, Тема, Цель, Уровень) →
 * шторки выбора; группы «Уведомления и звук», «Приватность», «Аккаунт». Всё прежнее на месте.
 *  · шапка: Бобек в образе игрока, имя игрока, «Бобек: <имя>», карандаш → шторка профиля, сохранение имени Бобека;
 *  · плитки показывают текущие значения; выбор в шторке сохраняется на сервере и сразу виден на плитке;
 *  · тема картинками (3 варианта), цель — 4 варианта с подписями, уровень — 4 варианта и «Пройти тест уровня»;
 *  · переключатели — role="switch", звук сохраняется; есть «Проверить звук», подсказка произношения, ссылка на политику;
 *  · 320 / 390 px без горизонтальной прокрутки; светлая и тёмная тема; axe — страница и открытая шторка без нарушений.
 *
 * Запуск: node --import tsx scripts/settings-check.ts   → test-results/settings/*.png
 */
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Page } from 'playwright';
import { chromiumPath, startStand } from './lib/stand';

const root = process.cwd();
const require = createRequire(root + '/package.json');
const AXE = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const OUT = resolve(root, 'test-results/settings');
const failures: string[] = [];
const check = (ok: unknown, what: string) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) failures.push(what);
};

async function axe(p: Page, what: string, scope = 'body') {
  if (!(await p.evaluate(() => 'axe' in window))) await p.addScriptTag({ content: AXE });
  const v = await p.evaluate(
    async (scope) =>
      (await (window as unknown as { axe: { run: (c: unknown, o: unknown) => Promise<{ violations: { id: string; impact: string }[] }> } }).axe.run(scope, { resultTypes: ['violations'] })).violations
        .filter((x) => x.impact === 'serious' || x.impact === 'critical')
        .map((x) => `${x.id} [${(x as unknown as { nodes: { target: string[]; any: { message: string }[] }[] }).nodes.slice(0, 4).map((n) => `${n.target.join(' ')}: ${n.any[0]?.message ?? ''}`).join(' ; ')}]`),
    scope,
  );
  check(v.length === 0, `${what}: доступность (axe) ${v.join(', ')}`);
}

async function main() {
  const { chromium } = require('playwright') as typeof import('playwright');
  mkdirSync(OUT, { recursive: true });
  const stand = await startStand({ ui: 'dev' });
  const browser = await chromium.launch({ headless: true, executablePath: chromiumPath(chromium), args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  let devUser = 994400;
  try {
    for (const [width, height, theme] of [[390, 844, 'light'], [390, 844, 'dark'], [320, 568, 'light']] as const) {
      const tag = `${width}px ${theme}`;
      const u = await stand.login();
      await u.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A0', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: null });
      await u.call('PATCH', '/api/me/settings', { theme });
      await u.call('PATCH', '/api/me/profile', { beaverName: 'Bobek', displayName: 'Ania' });
      await u.call('POST', '/api/flags/tour', {});
      const id = String(++devUser);
      const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, locale: 'ru-RU', colorScheme: theme, isMobile: true, hasTouch: true });
      const p = await ctx.newPage();
      await p.addInitScript(({ token, id }) => localStorage.setItem('pg_auth', JSON.stringify({ token, owner: `dev:${id}`, exp: Date.now() + 86_400_000 })), { token: u.token, id });
      await p.goto(`${stand.base}/settings?devUser=${id}`);
      await p.locator('[data-settings-hero]').waitFor({ timeout: 20_000 }).catch(() => {});
      await p.waitForTimeout(800);
      const me = async () => (await u.call('GET', '/api/me')).body;
      const sheet = p.locator('[data-sheet]');
      const closeSheet = async () => {
        await p.locator('[data-sheet-close]').click();
        await sheet.waitFor({ state: 'detached', timeout: 5000 }).catch(() => {});
        await p.waitForTimeout(150);
      };

      // Шапка
      const hero = p.locator('[data-settings-hero]');
      check((await hero.count()) === 1 && (await hero.locator('[data-look]').count()) > 0, `${tag}: шапка с Бобеком в образе игрока`);
      const heroText = (await hero.innerText().catch(() => '')).replace(/\s+/g, ' ');
      check(/Ania/.test(heroText) && /Bobek/.test(heroText), `${tag}: в шапке имя игрока и имя Бобека (${heroText.slice(0, 60)})`);
      // Владелец 2026-11-25: «много свободного места» — в шапке три показателя игрока: серия, злотки, опыт; без пустой правой половины.
      const stats = await p.evaluate(() => {
        const hero = document.querySelector('[data-settings-hero]')?.getBoundingClientRect();
        const cells = [...document.querySelectorAll('[data-hero-stat]')].map((el) => ({ k: (el as HTMLElement).dataset.heroStat, text: (el as HTMLElement).innerText.replace(/\s+/g, ' '), r: el.getBoundingClientRect() }));
        const right = cells.length ? Math.max(...cells.map((c) => c.r.right)) : 0;
        return { keys: cells.map((c) => c.k).join(','), texts: cells.map((c) => c.text).join(' | '), filled: !!hero && right >= hero.right - 24 };
      });
      check(stats.keys === 'streak,zlotki,xp' && stats.filled, `${tag}: в шапке серия, злотки и опыт во всю ширину (${stats.keys}; ${stats.texts})`);

      // Плитки
      const tile = (k: string) => p.locator(`[data-setting-tile="${k}"]`);
      const tileText = async (k: string) => ((await tile(k).innerText().catch(() => '')) || '').replace(/\s+/g, ' ');
      check((await tile('lang').count()) && /Русский/.test(await tileText('lang')), `${tag}: плитка «Язык» — Русский`);
      check((await tile('theme').count()) && new RegExp(theme === 'dark' ? 'Тёмная' : 'Светлая').test(await tileText('theme')), `${tag}: плитка «Тема» — текущая тема`);
      check((await tile('goal').count()) && /10 мин/.test(await tileText('goal')), `${tag}: плитка «Цель» — 10 мин`);
      check((await tile('level').count()) && /По городу/.test(await tileText('level')), `${tag}: плитка «Уровень» — по городу`);
      const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      check(overflow <= 0, `${tag}: нет горизонтальной прокрутки (${overflow})`);
      await p.screenshot({ path: `${OUT}/settings-${width}-${theme}.png` });
      if (width === 390) await p.screenshot({ path: `${OUT}/settings-${width}-${theme}-full.png`, fullPage: true });
      await axe(p, `${tag}: страница`);

      if (width === 390 && theme === 'light') {
        // Тема: три картинки, выбор сохраняется и виден на плитке.
        await tile('theme').click();
        await sheet.waitFor({ timeout: 5000 });
        await p.waitForTimeout(450);
        check((await p.locator('[data-theme-option]').count()) === 3, `${tag}: шторка темы — 3 варианта картинками`);
        await p.screenshot({ path: `${OUT}/sheet-theme.png` });
        await axe(p, `${tag}: шторка темы`, '[data-sheet]');
        await p.locator('[data-theme-option="dark"]').click();
        await p.waitForTimeout(900);
        check((await me()).settings.theme === 'dark', `${tag}: тема «Тёмная» сохранена`);
        check(await p.evaluate(() => document.documentElement.classList.contains('dark')), `${tag}: тема сразу применилась`);
        check((await p.locator('[data-theme-option="dark"]').getAttribute('aria-checked')) === 'true', `${tag}: выбранная тема отмечена`);
        await p.locator('[data-theme-option="light"]').click();
        await p.waitForTimeout(900);
        await closeSheet();
        check(/Светлая/.test(await tileText('theme')), `${tag}: плитка темы обновилась`);

        // Цель: 4 варианта с подписями.
        await tile('goal').click();
        await sheet.waitFor({ timeout: 5000 });
        await p.waitForTimeout(450);
        const goals = await p.locator('[data-goal-option]').allInnerTexts();
        check(goals.length === 4 && /Легко/.test(goals[0]) && /Интенсив/.test(goals[3]), `${tag}: шторка цели — 4 варианта с подписями (${goals.map((g) => g.replace(/\s+/g, ' ')).join(' | ')})`);
        await p.screenshot({ path: `${OUT}/sheet-goal.png` });
        await p.locator('[data-goal-option="15"]').click();
        await p.waitForTimeout(700);
        check((await me()).settings.dailyGoalMinutes === 15, `${tag}: цель 15 мин сохранена`);
        await closeSheet();
        check(/15 мин/.test(await tileText('goal')), `${tag}: плитка цели — 15 мин`);

        // Уровень: 4 варианта и тест уровня.
        await tile('level').click();
        await sheet.waitFor({ timeout: 5000 });
        await p.waitForTimeout(450);
        check((await p.locator('[data-level-option]').count()) === 4 && (await p.locator('[data-open-level-test]').count()) === 1, `${tag}: шторка уровня — 4 варианта и «Пройти тест уровня»`);
        await p.screenshot({ path: `${OUT}/sheet-level.png` });
        await p.locator('[data-level-option="B1"]').click();
        await p.locator('[data-study-level="B1"]').waitFor({ timeout: 10_000 }).catch(() => {});
        check((await me()).progress.studyLevel === 'B1', `${tag}: уровень B1 сохранён`);
        await closeSheet();
        check(/B1/.test(await tileText('level')), `${tag}: плитка уровня — B1`);

        // Язык: English и обратно.
        await tile('lang').click();
        await sheet.waitFor({ timeout: 5000 });
        await p.waitForTimeout(450);
        check((await p.locator('[data-lang-option]').count()) === 3, `${tag}: шторка языка — 3 языка`);
        await p.locator('[data-lang-option="en"]').click();
        await p.waitForTimeout(1200);
        check((await me()).settings.uiLanguage === 'en', `${tag}: язык English сохранён`);
        await p.locator('[data-lang-option="ru"]').click();
        await p.waitForTimeout(1200);
        await closeSheet();

        // Профиль: карандаш → шторка → новое имя Бобека.
        await p.locator('[data-edit-profile]').click();
        await sheet.waitFor({ timeout: 5000 });
        await p.locator('[data-beaver-name-input]').fill('Bobuś');
        await p.locator('[data-profile-save]').click();
        await sheet.waitFor({ state: 'detached', timeout: 5000 }).catch(() => {});
        await p.waitForTimeout(400);
        check((await me()).profile.beaverName === 'Bobuś' && /Bobuś/.test(await hero.innerText()), `${tag}: имя Бобека сохранено и видно в шапке`);

        // Группы и переключатели.
        for (const g of ['notify', 'privacy', 'account']) check((await p.locator(`[data-settings-group="${g}"]`).count()) === 1, `${tag}: группа ${g}`);
        const sound = p.locator('[data-switch="sound"]');
        check((await sound.getAttribute('role')) === 'switch', `${tag}: «Звуки» — переключатель role=switch`);
        await sound.click();
        await p.waitForTimeout(700);
        check((await me()).settings.soundEnabled === false, `${tag}: звук выключен и сохранён`);
        check((await p.getByRole('button', { name: 'Проверить звук' }).count()) === 1 && (await p.locator('[data-setting="pron"]').count()) === 1, `${tag}: «Проверить звук» и подсказка произношения на месте`);
        check((await p.locator('[data-privacy-link]').count()) === 1 && (await p.locator('button', { hasText: 'Удалить аккаунт' }).count()) === 1, `${tag}: политика и «Удалить аккаунт» на месте`);
      }
      await ctx.close();
    }
  } finally {
    await browser.close();
    await stand.stop();
  }
  console.log(failures.length ? `\n${failures.length} FAIL` : '\nвсё ok');
  process.exit(failures.length ? 1 : 0);
}
void main();
