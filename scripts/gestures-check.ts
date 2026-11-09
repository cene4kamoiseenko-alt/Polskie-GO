/**
 * Жесты и копирование в настоящем браузере (владелец 2026-11-09: «скопировать код нажатием на него… свайпы, копирования подобные, потрясающий функционал»).
 * Сенсорные жесты — через CDP (Input.dispatchTouchEvent), экран 390×844.
 *
 *   node --import tsx scripts/gestures-check.ts   → test-results/gestures/*.png
 *
 *   A. Код входа в настройках: тап копирует (navigator.clipboard), подтверждение на плашке и тост; запасной путь без navigator.clipboard
 *      (execCommand) и честная ошибка, если копирование не удалось.
 *   B. «Потянуть вниз — обновить»: короткое протягивание, горизонтальное движение, прокрученная страница и закрытая для жеста страница ничего не делают;
 *      длинное протягивание обновляет данные; повтор сразу после обновления кружок показывает, но запросов не шлёт.
 *   C. Свайп вкладок: Лига ↔ Друзья, категории миссий, фильтры словаря; шторка поверх экрана вкладки не листает.
 *   D. Свайп влево как «Далее» после ответа в уроке и в миссии (до ответа и после ошибки в миссии жест ничего не делает).
 *
 * Chromium, а не Telegram на iPhone / Android.
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import type { BrowserContext, CDPSession, Page } from 'playwright';
import { chromiumPath, startStand } from './lib/stand';

const root = process.cwd();
const require = createRequire(root + '/package.json');
const OUT = resolve(root, 'test-results/gestures');
const failures: string[] = [];
const check = (ok: unknown, what: string) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) failures.push(what);
};

type Stand = Awaited<ReturnType<typeof startStand>>;
type Opened = { page: Page; context: BrowserContext; cdp: CDPSession; apiGets: () => number; swipe: (x0: number, y0: number, x1: number, y1: number, hold?: () => Promise<void>) => Promise<void> };

async function main() {
  const { chromium } = require('playwright') as typeof import('playwright');
  mkdirSync(OUT, { recursive: true });
  const stand: Stand = await startStand({ ui: 'dev' });
  const browser = await chromium.launch({ headless: true, executablePath: chromiumPath(chromium), args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const pageErrors: string[] = [];
  let seq = 0;

  /** Игрок с пройденным знакомством, страница с сенсорным вводом и счётчиком GET-запросов к API. */
  async function open(path: string, init?: string, perms: string[] = []): Promise<Opened> {
    const u = await stand.login();
    await u.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A0', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: null });
    await u.call('PATCH', '/api/me/settings', { theme: 'dark', reducedMotion: true });
    const id = String(995000 + ++seq);
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'ru-RU', isMobile: true, hasTouch: true });
    if (perms.length) await context.grantPermissions(perms);
    const page = await context.newPage();
    page.on('pageerror', (e) => pageErrors.push(e.message));
    await page.addInitScript(({ token, id }) => localStorage.setItem('pg_auth', JSON.stringify({ token, owner: `dev:${id}`, exp: Date.now() + 86_400_000 })), { token: u.token, id });
    if (init) await page.addInitScript(init);
    let gets = 0;
    page.on('request', (r) => {
      if (r.method() === 'GET' && /\/api\//.test(r.url())) gets++;
    });
    await page.goto(`${stand.base}${path}${path.includes('?') ? '&' : '?'}devUser=${id}`);
    const cdp = await context.newCDPSession(page);
    const swipe = async (x0: number, y0: number, x1: number, y1: number, hold?: () => Promise<void>) => {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0 }] });
      for (let i = 1; i <= 12; i++) {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + ((x1 - x0) * i) / 12, y: y0 + ((y1 - y0) * i) / 12 }] });
        await page.waitForTimeout(16);
      }
      if (hold) await hold();
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await page.waitForTimeout(450);
    };
    return { page, context, cdp, apiGets: () => gets, swipe };
  }

  const text = (page: Page) => page.locator('body').innerText();
  const settle = async (page: Page, ms = 1200) => {
    await page.waitForLoadState('networkidle').catch(() => undefined);
    await page.waitForTimeout(ms);
  };

  try {
    // ── A. Копирование кода в настройках ──────────────────────────────────────────────────────────────────────────────────────────────
    {
      const { page, context } = await open('/settings', undefined, ['clipboard-read', 'clipboard-write']);
      await page.locator('[data-link-get]').waitFor({ timeout: 30_000 });
      await page.locator('[data-link-get]').tap();
      const box = page.locator('[data-copy-code="link"]');
      await box.waitFor({ timeout: 10_000 });
      const code = (await page.locator('[data-link-code]').innerText()).trim();
      check(/^[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(code), `A1 код выдан (${code})`);
      check((await box.getAttribute('data-copied')) === 'false' && /Нажми на код/.test(await box.innerText()), 'A1 до нажатия подсказка «Нажми на код, чтобы скопировать»');
      await box.tap();
      await page.waitForTimeout(250);
      check((await box.getAttribute('data-copied')) === 'true' && /Скопировано/.test(await box.innerText()), 'A2 после тапа плашка пишет «Скопировано»');
      check(await page.locator('[data-toast]', { hasText: 'Скопировано' }).count() > 0, 'A2 всплыл тост «Скопировано»');
      check((await page.evaluate('navigator.clipboard.readText()')) === code, 'A2 в буфере обмена ровно этот код');
      await page.screenshot({ path: `${OUT}/copy-code-copied.png` });
      await page.waitForTimeout(2300);
      check((await box.getAttribute('data-copied')) === 'false', 'A3 через пару секунд плашка снова предлагает скопировать');
      await context.close();
    }
    {
      // запасной путь: navigator.clipboard нет (часть WebView), копирование через скрытое поле и execCommand
      const init = `Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
        document.addEventListener('copy', () => { const a = document.activeElement; window.__copied = a && 'value' in a ? a.value.slice(a.selectionStart, a.selectionEnd) : String(getSelection()); }, true);`;
      const { page, context } = await open('/settings', init);
      await page.locator('[data-link-get]').waitFor({ timeout: 30_000 });
      await page.locator('[data-link-get]').tap();
      const box = page.locator('[data-copy-code="link"]');
      await box.waitFor({ timeout: 10_000 });
      const code = (await page.locator('[data-link-code]').innerText()).trim();
      await box.tap();
      await page.waitForTimeout(250);
      check((await page.evaluate('window.__copied')) === code, 'A4 без navigator.clipboard: запасной путь скопировал код');
      check((await box.getAttribute('data-copied')) === 'true', 'A4 и плашка подтвердила копирование');
      check((await page.evaluate("document.querySelectorAll('textarea[readonly][aria-hidden]').length")) === 0, 'A4 скрытое поле убрано со страницы');
      await context.close();
    }
    {
      const init = `Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true }); document.execCommand = () => false;`;
      const { page, context } = await open('/settings', init);
      await page.locator('[data-link-get]').waitFor({ timeout: 30_000 });
      await page.locator('[data-link-get]').tap();
      const box = page.locator('[data-copy-code="link"]');
      await box.waitFor({ timeout: 10_000 });
      await box.tap();
      await page.waitForTimeout(250);
      check((await box.getAttribute('data-copied')) === 'false' && (await page.locator('[data-toast]', { hasText: 'Не удалось скопировать' }).count()) > 0, 'A5 если копирование невозможно, приложение честно об этом говорит');
      await context.close();
    }

    // ── B. Потянуть вниз — обновить ───────────────────────────────────────────────────────────────────────────────────────────────
    {
      const { page, context, swipe, apiGets } = await open('/');
      await page.locator('.ptr').waitFor({ state: 'attached', timeout: 30_000 });
      await settle(page, 600);
      const state = () => page.locator('.ptr').getAttribute('data-ptr');
      const base = apiGets();

      await swipe(200, 160, 200, 250); // 90 px: до порога далеко
      check(apiGets() === base && (await state()) === 'idle', 'B1 короткое протягивание ничего не обновляет');
      await swipe(60, 300, 330, 330); // вбок — это свайп вкладок, не обновление
      check(apiGets() === base && (await state()) === 'idle', 'B2 горизонтальное движение не считается обновлением');
      await swipe(8, 160, 60, 600); // от левого края — «Назад»
      check(apiGets() === base, 'B3 жест от левого края не запускает обновление');

      await page.evaluate('window.scrollTo(0, 400)');
      await page.waitForTimeout(150);
      const scrolled = (await page.evaluate('window.scrollY')) as number;
      await swipe(200, 160, 200, 560);
      check(scrolled > 0 && apiGets() === base, `B4 прокрученная страница (scrollY ${scrolled}) не обновляется`);
      await page.evaluate('window.scrollTo(0, 0)');
      await page.waitForTimeout(150);

      let midState = '';
      await swipe(200, 160, 200, 520, async () => {
        midState = (await state()) ?? '';
        await page.screenshot({ path: `${OUT}/pull-armed.png` });
      });
      check(midState === 'armed', `B5 длинное протягивание окрашивает кружок (${midState})`);
      await page.waitForTimeout(200);
      check(apiGets() > base, `B5 после отпускания данные запрошены заново (+${apiGets() - base} запросов)`);
      check((await state()) === 'busy', 'B5 кружок крутится, пока идёт обновление');
      await page.waitForTimeout(1100);
      check((await state()) === 'idle', 'B5 по окончании кружок убирается');

      const after = apiGets();
      await swipe(200, 160, 200, 520);
      await page.waitForTimeout(200);
      check(apiGets() === after && (await state()) === 'busy', 'B6 повтор сразу после обновления: кружок есть, лишних запросов нет');
      await page.waitForTimeout(900);
      await context.close();
    }
    {
      const { page, context, swipe, apiGets } = await open('/settings');
      await page.locator('[data-link-get], h1').first().waitFor({ timeout: 30_000 });
      await settle(page, 2500);
      const base = apiGets();
      await swipe(200, 160, 200, 560);
      check(apiGets() === base, 'B7 на экранах, где жест не нужен (настройки, урок, миссия), он выключен');
      await context.close();
    }

    // ── C. Свайп вкладок ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
    {
      const { page, context, swipe } = await open('/social');
      await page.locator('[data-tab-swipe="social"]').waitFor({ timeout: 30_000 });
      await settle(page, 600);
      const tab = () => page.evaluate("new URL(location.href).searchParams.get('tab') ?? 'league'");
      check((await tab()) === 'league', 'C1 «Друзья/Лига»: открыта «Лига»');
      await swipe(320, 520, 80, 526);
      check((await tab()) === 'friends', 'C1 свайп влево открывает «Друзья»');
      await page.screenshot({ path: `${OUT}/social-friends.png` });
      await swipe(80, 520, 320, 526);
      check((await tab()) === 'league', 'C1 свайп вправо возвращает «Лигу»');
      await swipe(320, 520, 80, 526);
      await swipe(320, 520, 80, 526);
      check((await tab()) === 'friends', 'C1 за последней вкладкой свайп ничего не делает');
      await context.close();
    }
    {
      const { page, context, swipe } = await open('/life');
      await page.locator('[data-tab-swipe="life"]').waitFor({ timeout: 30_000 });
      await settle(page, 600);
      const pressed = () => page.evaluate("[...document.querySelectorAll('[data-tab-swipe=life] button[aria-pressed]')].findIndex((b) => b.getAttribute('aria-pressed') === 'true')");
      check((await pressed()) === 0, 'C2 «Польский в жизни»: выбрана категория «Все»');
      await swipe(320, 640, 80, 646);
      check((await pressed()) === 1, 'C2 свайп влево по списку — следующая категория');
      await swipe(80, 640, 320, 646);
      check((await pressed()) === 0, 'C2 свайп вправо — предыдущая');
      // по самому ряду чипов горизонтальная прокрутка принадлежит чипам: категория не меняется
      const chips = await page.locator('[data-tab-swipe="life"] button[aria-pressed]').first().boundingBox();
      if (chips) {
        await swipe(chips.x + 300, chips.y + chips.height / 2, chips.x + 40, chips.y + chips.height / 2);
        check((await pressed()) === 0, 'C2 свайп по ряду чипов прокручивает чипы, а не меняет категорию');
      }
      await context.close();
    }
    {
      const { page, context, swipe } = await open('/dictionary');
      await page.locator('[data-tab-swipe="dictionary"]').waitFor({ timeout: 30_000 });
      await settle(page, 800);
      const active = () =>
        page.evaluate(`(() => { const row = document.querySelector('[data-tab-swipe=dictionary] .no-scrollbar'); return row ? [...row.querySelectorAll('button.chip')].findIndex((b) => b.className.includes('bg-pl-red')) : -1; })()`);
      check((await active()) === 0, 'C3 словарь: выбран фильтр «Все»');
      await swipe(320, 700, 80, 706);
      check((await active()) === 1, 'C3 свайп влево по списку — следующий фильтр');
      await swipe(80, 700, 320, 706);
      check((await active()) === 0, 'C3 свайп вправо — предыдущий');
      // шторка со словом поверх списка: свайп по ней не листает фильтры позади
      await page.locator('[data-tab-swipe="dictionary"] .card, [data-tab-swipe="dictionary"] [class*="card"]').first().tap().catch(() => undefined);
      if (await page.locator('[data-sheet]').count()) {
        await page.waitForTimeout(500);
        await swipe(320, 500, 80, 506);
        check((await active()) === 0 && (await page.locator('[data-sheet]').count()) > 0, 'C4 свайп по открытой шторке не листает фильтры позади');
      } else {
        console.log('skip C4 (в словаре нет слов для шторки)');
      }
      await context.close();
    }

    // ── D. Свайп влево как «Далее» ───────────────────────────────────────────────────────────────────────────────────────────────────
    {
      const { page, context, swipe } = await open('/practice/FIVE_MIN');
      await page.locator('[data-action="start"]:visible, [data-grammar-choice]:visible, button.option:visible, [data-token]:visible, [data-pair]:visible, textarea:visible').first().waitFor({ timeout: 30_000 }).catch(async (e) => {
        await page.screenshot({ path: `${OUT}/no-exercise.png` });
        console.log('на экране:', (await text(page)).replace(/\s+/g, ' ').slice(0, 300), '| путь:', new URL(page.url()).pathname);
        throw e;
      });
      const start = page.locator('[data-action="start"]:visible');
      if (await start.count()) await start.click();
      await page.waitForFunction(() => document.querySelector('[data-grammar-choice], textarea, button.option, [data-token], [data-pair]'), null, { timeout: 30_000 });
      let done = false;
      for (let tries = 0; tries < 8 && !done; tries++) {
        await page.waitForTimeout(1100);
        const checkBtn = page.locator('[data-action="check"]');
        const heading = await page.locator('h2').first().innerText().catch(() => '');
        const opts = page.locator('button.option:not([data-pair]):not([disabled]), [data-grammar-choice] button[data-form]:not([disabled])');
        if (await opts.count()) {
          // до ответа жест ничего не делает
          await swipe(320, 400, 80, 406);
          check((await page.locator('[data-swipe-next]').count()) === 0 && (await checkBtn.count()) === 1, 'D1 урок: до ответа свайп влево ничего не пропускает');
          await opts.first().click();
          await checkBtn.click();
          await page.locator('[data-action="next"]').waitFor({ timeout: 15_000 });
          check((await page.locator('[data-swipe-next="ready"]').count()) === 1, 'D1 урок: после ответа жест «Далее» включён');
          await swipe(320, 400, 80, 406);
          await page.waitForTimeout(500);
          check((await page.locator('[data-action="next"]').count()) === 0 && (await page.locator('[data-swipe-next]').count()) === 0, 'D1 урок: свайп влево открыл следующее задание');
          await page.screenshot({ path: `${OUT}/lesson-after-swipe.png` });
          done = true;
          void heading;
          break;
        }
        // другое задание: отвечаем как получится и идём дальше кнопкой
        if (await page.locator('[data-action="skip"]').count()) await page.locator('[data-action="skip"]').click();
        else if (await page.locator('textarea').count()) { await page.fill('textarea', 'zzz'); await checkBtn.click(); }
        else if (await page.locator('[data-token]').count()) { while (await page.locator('[data-token]').count()) await page.locator('[data-token]').first().click(); await checkBtn.click(); }
        else if (await page.locator('[data-pair="left"]').count()) {
          const k = await page.locator('[data-pair="left"]').count();
          for (let j = 0; j < k; j++) { await page.locator('[data-pair="left"]').nth(j).click(); await page.locator('[data-pair="right"]').nth(j).click(); }
          if (await checkBtn.count()) await checkBtn.click();
        }
        await page.locator('[data-action="next"]').waitFor({ timeout: 15_000 }).catch(() => undefined);
        if (await page.locator('[data-action="next"]:not([disabled])').count()) await page.locator('[data-action="next"]:not([disabled])').click();
        await page.waitForTimeout(300);
      }
      check(done, 'D1 в практике нашлось задание с выбором для проверки жеста');
      await context.close();
    }
    {
      const { MISSIONS } = await import(root + '/apps/server/src/content/missions.ts');
      const m = MISSIONS.find((x: { steps: { kind: string; options?: unknown[] }[] }) => x.steps[0].kind !== 'build' && (x.steps[0].options?.length ?? 0) >= 2);
      const first = m.steps[0] as { options: { ok: boolean }[] };
      const good = first.options.findIndex((o) => o.ok);
      const bad = first.options.findIndex((o) => !o.ok);
      const { page, context, swipe } = await open(`/life/${m.slug}`);
      for (let tries = 0; tries < 6 && !(await page.locator('button.option').count()); tries++) {
        await page.waitForTimeout(700);
        const go = page.getByRole('button', { name: /Продолжить|Начать/ }).first();
        if (await go.count()) await go.click().catch(() => undefined);
      }
      await page.locator('button.option').first().waitFor({ timeout: 20_000 });
      const heading = () => page.locator('h2').first().innerText();
      const h0 = await heading();
      await page.waitForTimeout(1100);
      // ошибка: «Далее» жестом недоступно
      await page.locator('button.option').nth(bad).click();
      await page.getByRole('button', { name: /Проверить/ }).click();
      await page.waitForTimeout(700);
      await swipe(320, 400, 80, 406);
      check((await page.locator('[data-swipe-next]').count()) === 0 && (await heading()) === h0, 'D2 миссия: после ошибки свайп влево шаг не пропускает');
      await page.getByRole('button', { name: /Попробовать ещё/ }).click();
      await page.waitForTimeout(1100);
      await page.locator('button.option').nth(good).click();
      await page.getByRole('button', { name: /Проверить/ }).click();
      await page.locator('[data-swipe-next="ready"]').waitFor({ timeout: 10_000 });
      check(true, 'D2 миссия: после верного ответа жест «Далее» включён');
      await swipe(320, 400, 80, 406);
      await page.waitForTimeout(500);
      check((await page.locator('[data-swipe-next]').count()) === 0 && (await heading()) !== h0, 'D2 миссия: свайп влево открыл следующий шаг');
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
