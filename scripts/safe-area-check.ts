/**
 * Верхний отступ в полноэкранном режиме Telegram на iPhone (владелец 2026-11-11, скриншоты: «вверху пустой экран» на главной и в гардеробе).
 * Обёртка приложения (App.tsx, .safe-top) уже отступает от шапки Telegram на --safe-t; шапка экрана не должна добавлять тот же отступ второй раз.
 *
 *   node --import tsx scripts/safe-area-check.ts   → test-results/safe-area/*.png
 *
 * Эмуляция: переменные Telegram --tg-safe-area-inset-top (54 px, статус-бар) и --tg-content-safe-area-inset-top (42 px, кнопки «Закрыть» и «⋯»), экран 393×852.
 * На каждом экране первый видимый элемент содержимого должен начинаться сразу под шапкой Telegram: не выше неё и не ниже чем на 40 px.
 * Chromium, а не Telegram на iPhone.
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromiumPath, startStand } from './lib/stand';

const root = process.cwd();
const require = createRequire(root + '/package.json');
const OUT = resolve(root, 'test-results/safe-area');
const failures: string[] = [];
const check = (ok: unknown, what: string) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) failures.push(what);
};

const INSET = { status: 54, content: 42, bottom: 34 };
const SAFE_T = INSET.status + INSET.content;
const MAX_GAP = 40;
const SCREENS = ['/', '/learn', '/map', '/quests', '/profile', '/shop', '/social', '/social?tab=friends', '/life', '/dictionary', '/achievements', '/exams', '/grammar', '/pass', '/premium', '/settings', '/passport', '/diary', '/slang', '/house'];

/** Верх первого видимого элемента содержимого (текст, картинка или кнопка) — в координатах страницы. */
const FIRST_TOP = `(() => {
  // Карта — картинка больше окна и обрезана рамкой: меряем её панель (.map-hud), а не саму картинку.
  const hud = document.querySelector('.map-hud');
  if (hud) return { top: Math.round(hud.getBoundingClientRect().top + window.scrollY), what: 'панель карты' };
  const host = document.querySelector('main') || document.body;
  const own = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
  for (const el of host.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || cs.position === 'fixed' || Number(cs.opacity) === 0) continue;
    if (el.closest('[aria-hidden="true"], nav')) continue;
    if (['IMG', 'BUTTON', 'H1', 'H2', 'A', 'INPUT'].includes(el.tagName) || own(el)) return { top: Math.round(r.top + window.scrollY), what: el.tagName.toLowerCase() + ' ' + (el.innerText || el.getAttribute('aria-label') || '').replace(/\\s+/g, ' ').slice(0, 30) };
  }
  return null;
})()`;

async function main() {
  const { chromium } = require('playwright') as typeof import('playwright');
  mkdirSync(OUT, { recursive: true });
  const stand = await startStand({ ui: 'dev' });
  const browser = await chromium.launch({ headless: true, executablePath: chromiumPath(chromium), args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const pageErrors: string[] = [];
  try {
    const u = await stand.login();
    await u.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A0', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: null });
    await u.call('PATCH', '/api/me/settings', { theme: 'dark', reducedMotion: true });
    const id = '997001';
    const context = await browser.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, locale: 'ru-RU' });
    const page = await context.newPage();
    page.on('pageerror', (e) => pageErrors.push(e.message));
    // Строкой, а не функцией: tsx дописывает в функции служебный вызов, которого в браузере нет.
    // Telegram ставит эти переменные прямо на <html>; в момент запуска скрипта корня ещё может не быть — ждём его появления.
    await page.addInitScript(`
      localStorage.setItem('pg_auth', JSON.stringify({ token: ${JSON.stringify(u.token)}, owner: 'dev:${id}', exp: Date.now() + 86400000 }));
      (function () {
        function apply() {
          var html = document.documentElement;
          if (!html) return false;
          html.style.setProperty('--tg-safe-area-inset-top', '${INSET.status}px');
          html.style.setProperty('--tg-content-safe-area-inset-top', '${INSET.content}px');
          html.style.setProperty('--tg-safe-area-inset-bottom', '${INSET.bottom}px');
          return true;
        }
        if (!apply()) new MutationObserver(function (_, o) { if (apply()) o.disconnect(); }).observe(document, { childList: true });
      })();
    `);

    for (const path of SCREENS) {
      await page.goto(`${stand.base}${path}${path.includes('?') ? '&' : '?'}devUser=${id}`);
      await page.waitForLoadState('networkidle').catch(() => undefined);
      await page.waitForTimeout(1200);
      const first = (await page.evaluate(FIRST_TOP)) as { top: number; what: string } | null;
      const gap = first ? first.top - SAFE_T : NaN;
      check(first && gap >= 0 && gap <= MAX_GAP, `${path}: содержимое начинается сразу под шапкой Telegram (отступ ${gap} px при шапке ${SAFE_T} px; первый элемент — ${first?.what ?? 'нет'})`);
      if (['/', '/shop', '/social'].includes(path)) await page.screenshot({ path: `${OUT}/${path === '/' ? 'home' : path.slice(1)}.png` });
    }
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
