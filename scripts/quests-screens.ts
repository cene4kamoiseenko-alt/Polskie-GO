/**
 * Экран «Квесты» с картинками владельца (2026-11-01, docs/design/v19/quests) в реальном браузере (Chromium, не Telegram на iPhone / Android).
 *
 *   node --import tsx scripts/quests-screens.ts   → test-results/quests-screens/*.png
 *
 * 1. Баннер: кадр «Бобек-бариста в Кракове» загружен и закрывает баннер, заголовок и две плашки («Обновление через…», «Выполнено N из M») внутри баннера;
 *    миниатюра «Польский в жизни» (Sklep 24h) загружена, нажатие ведёт на /life. 320 / 390 / 430, нет горизонтальной прокрутки.
 * 2. Вкладка «Особые»: три сюжетных квеста с картинками (Варшава, квартира, Вроцлав), картинки загружены (ленивые — прокручиваем к ним), закрытый квест затемнён с замком,
 *    тег «Особые» и текст не вылезают из карточки.
 * 3. Обложки сезонов «Рождество» и «Energylandia» на /pass (календарь сезонов) — кадры владельца, загружены.
 * 4. Картинка внутри диалога сюжетного квеста (/story/<slug>, 2026-11-02): Dworzec и Mieszkanie — кадры 2 : 1 владельца с Бобеком на кадре (второй Бобек не рисуется), Вроцлав — кадр карточки.
 * 5. Вступление миссии «11 ноября» (/life/listopad-swieto): Stary Rynek вместо SVG-сцены, второго Бобека поверх нет.
 * 5а. Вступление «Анджейек» (кадр владельца 2026-11-02): вместо SVG MIESZKANIE — вечерний кадр с Бобром-баристой, второго Бобра нет; кнопка «Начать миссию» — картинка владельца без текста + живой текст и значок.
 * 6. Главная: строки «Сегодня» — значки владельца (книга, звезда, мишень) без серой плашки, остальные на плашке того же цвета; все картинки загружены.
 * 7. Длинный сюжетный квест (2026-11-02): «Варшава» проходится в интерфейсе от первой реплики до экрана награды — пять глав, на каждой подпись «Этап N из 5 · название»,
 *    верные ответы выбираются по тексту (порядок вариантов перемешан), неверный даёт подсказку и не двигает разговор; на 320 / 390 / 430 нет горизонтальной прокрутки и кнопка видна.
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromiumPath, startStand } from './lib/stand';

const root = process.cwd();
const require = createRequire(root + '/package.json');
const OUT = resolve(root, 'test-results/quests-screens');
const SIZES: [number, number][] = [[320, 640], [390, 844], [430, 932]];

const failures: string[] = [];
const check = (ok: unknown, what: string) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) failures.push(what);
};

async function main() {
  const { chromium } = require('playwright') as typeof import('playwright');
  const { db } = await import(root + '/apps/server/src/db/index.ts');
  const { cities, subscriptions, userCities } = await import(root + '/apps/server/src/db/schema.ts');
  const { eq, inArray } = await import('drizzle-orm');
  const stand = await startStand({ ui: 'dev' });
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: chromiumPath(chromium), args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const pageErrors: string[] = [];
  let devUser = 997100;

  /** `premium` — подписка (миссии пропуска ноября открыты); `cityStories` — Краков и Вроцлав посещены (иначе их сюжетные квесты закрыты: city_locked). */
  async function userPage(size: [number, number], path: string, ready: string, opts: { premium?: boolean; cityStories?: boolean } = {}) {
    const u = await stand.login();
    await u.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A0', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: null });
    await u.call('PATCH', '/api/me/settings', { theme: 'dark', reducedMotion: false });
    if (opts.premium) await db.insert(subscriptions).values({ userId: u.user.id, planCode: 'MONTH_1', status: 'ACTIVE', startsAt: new Date(), expiresAt: new Date(Date.now() + 86_400_000), grantedByAdminId: 'qa-quests-screens' });
    if (opts.cityStories) {
      const rows = await db.select({ id: cities.id }).from(cities).where(inArray(cities.slug, ['krakow', 'wroclaw']));
      for (const r of rows) await db.insert(userCities).values({ userId: u.user.id, cityId: r.id, source: 'journey' }).onConflictDoNothing();
    }
    const id = String(++devUser);
    const context = await browser.newContext({ viewport: { width: size[0], height: size[1] }, deviceScaleFactor: 2, locale: 'ru-RU' });
    const page = await context.newPage();
    page.on('pageerror', (e) => pageErrors.push(e.message));
    await page.addInitScript(({ token, id }) => localStorage.setItem('pg_auth', JSON.stringify({ token, owner: `dev:${id}`, exp: Date.now() + 86_400_000 })), { token: u.token, id });
    await page.goto(`${stand.base}${path}?devUser=${id}`);
    await page.locator(ready).first().waitFor({ timeout: 30_000 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(900);
    return { ...u, page, context, id };
  }
  const box = (p: import('playwright').Page, sel: string, nth = 0) =>
    p.locator(sel).nth(nth).evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height, r: r.right, b: r.bottom };
    });
  const loaded = (p: import('playwright').Page, sel: string, nth = 0) =>
    p.locator(sel).nth(nth).evaluate((el: HTMLImageElement) => ({ ok: el.complete && el.naturalWidth > 0, w: el.naturalWidth, src: el.currentSrc.split('/').pop() }));

  try {
    for (const [w, h] of SIZES) {
      const tag = `${w}px`;
      const u = await userPage([w, h], '/quests', '[data-quest-art="hero"]');
      // ── 1. Баннер и «Польский в жизни» ──
      const hero = await loaded(u.page, '[data-quest-art="hero"]');
      check(hero.ok, `${tag}: баннер — кадр Бобека-бариста загружен (${hero.src}, ${hero.w} px)`);
      const heroBox = await box(u.page, '[data-quest-art="hero"]');
      const card = await u.page.locator('[data-quest-art="hero"]').evaluate((el) => {
        const r = (el.parentElement as HTMLElement).getBoundingClientRect();
        return { x: r.x, y: r.y, r: r.right, b: r.bottom, w: r.width, h: r.height };
      });
      check(Math.abs(heroBox.w - card.w) < 1.5 && Math.abs(heroBox.h - card.h) < 1.5, `${tag}: кадр закрывает баннер целиком (${Math.round(heroBox.w)}×${Math.round(heroBox.h)} из ${Math.round(card.w)}×${Math.round(card.h)})`);
      // Без именованных функций внутри evaluate: tsx оборачивает их в __name, которого нет на странице.
      const parts = await u.page.locator('[data-quest-art="hero"]').evaluate((el) => {
        const root = el.parentElement as HTMLElement, rr = root.getBoundingClientRect();
        const rects = [root.querySelector('h1'), ...Array.from(root.querySelectorAll('.rounded-full'))].map((e) => (e ? e.getBoundingClientRect() : null));
        const inside = rects.map((r) => !!r && r.x >= rr.x - 0.5 && r.right <= rr.right + 0.5 && r.y >= rr.y - 0.5 && r.bottom <= rr.bottom + 0.5);
        return { title: inside[0], chips: inside.slice(1) };
      });
      check(parts.title && parts.chips.length >= 2 && parts.chips.every(Boolean), `${tag}: заголовок и плашки внутри баннера (${parts.chips.length} плашки)`);
      check(await u.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${tag}: нет горизонтальной прокрутки`);

      await u.page.locator('[data-quest-art="life"]').scrollIntoViewIfNeeded();
      await u.page.waitForTimeout(500);
      const life = await loaded(u.page, '[data-quest-art="life"]');
      check(life.ok, `${tag}: миниатюра «Польский в жизни» — Sklep 24h загружена (${life.src})`);
      // Вкладки «Ежедневные / Недельные / Особые»: значки владельца (мишень, звезда, карта) 30 px над подписью, загружены, подписи целиком в своей вкладке.
      const tabImgs = await u.page.locator('[role=tab] img').evaluateAll((els) => els.map((e) => ({ ok: (e as HTMLImageElement).complete && (e as HTMLImageElement).naturalWidth > 0, w: Math.round(e.getBoundingClientRect().width), src: (e as HTMLImageElement).currentSrc.split('/').pop() })));
      check(tabImgs.length === 3 && tabImgs.every((i) => i.ok && i.w === 30), `${tag}: значки вкладок — плитки владельца 30 px (${tabImgs.map((i) => i.src).join(', ')})`);
      const tabFit = await u.page.locator('[role=tab]').evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); const t = e.querySelector('span:not([class*="absolute"])'); const tr = t ? t.getBoundingClientRect() : null; return !!tr && tr.x >= r.x - 0.5 && tr.right <= r.right + 0.5 && (t as HTMLElement).scrollWidth <= (t as HTMLElement).clientWidth + 1; }));
      check(tabFit.length === 3 && tabFit.every(Boolean), `${tag}: подписи вкладок целиком внутри своей вкладки (${tabFit.join(', ')})`);
      await u.page.screenshot({ path: `${OUT}/quests-${w}.png` });

      // ── 2. Вкладка «Особые» ──
      await u.page.getByRole('tab', { name: 'Особые' }).click();
      await u.page.locator('[data-quest-art^="s-"]').first().waitFor({ timeout: 15_000 });
      const stories = await u.page.locator('[data-quest-art^="s-"]').evaluateAll((els) => els.map((e) => e.getAttribute('data-quest-art')));
      check(stories.join() === 's-warszawa-dworzec,s-krakow-mieszkanie,s-wroclaw-zgubiony', `${tag}: три сюжетных квеста с картинками (${stories.join(', ')})`);
      for (let i = 0; i < stories.length; i++) {
        const sel = `[data-quest-art="${stories[i]}"]`;
        await u.page.locator(sel).scrollIntoViewIfNeeded();
        await u.page.waitForTimeout(450);
        const im = await loaded(u.page, sel);
        const b = await box(u.page, sel);
        const parent = await u.page.locator(sel).evaluate((el) => {
          const r = (el.parentElement as HTMLElement).getBoundingClientRect();
          const tagEl = (el.parentElement as HTMLElement).querySelector('.rounded-full');
          const t = tagEl ? tagEl.getBoundingClientRect() : null;
          return { w: r.width, h: r.height, x: r.x, tagInside: !!t && t.x >= r.x && t.right <= r.right && t.y >= r.y && t.bottom <= r.bottom };
        });
        check(im.ok && Math.abs(b.w - parent.w) < 1.5 && Math.abs(b.h - parent.h) < 1.5, `${tag}: «${stories[i]}» — картинка загружена и закрывает карточку (${im.src}, ${im.w} px)`);
        check(parent.tagInside, `${tag}: «${stories[i]}» — тег «Особые» внутри картинки`);
      }
      const locked = await u.page.locator('[data-quest-art="s-wroclaw-zgubiony"]').evaluate((el) => !!(el.parentElement as HTMLElement).querySelector('.bg-ink\\/35'));
      check(locked, `${tag}: закрытый квест (Вроцлав) затемнён, на нём замок`);
      check(await u.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${tag}: «Особые» — нет горизонтальной прокрутки`);
      await u.page.screenshot({ path: `${OUT}/quests-special-${w}.png`, fullPage: true });

      if (w === 390) {
        // нажатие на «Польский в жизни»
        await u.page.getByRole('tab', { name: 'Ежедневные' }).click();
        await u.page.locator('[data-quest-art="life"]').click();
        await u.page.waitForURL(/\/life$/, { timeout: 15_000 });
        check(true, '390px: «Польский в жизни» открывает /life');
      }
      await u.context.close();
    }

    // ── 3. Обложки сезонов на /pass ──
    {
      const u = await userPage([390, 844], '/pass', '[data-season]');
      for (const slug of ['swieta', 'energylandia']) {
        const sel = `img[data-season-cover="${slug}"]`;
        await u.page.locator(sel).scrollIntoViewIfNeeded();
        await u.page.waitForTimeout(600);
        const im = await loaded(u.page, sel);
        check(im.ok, `/pass: обложка сезона «${slug}» — кадр владельца загружен (${im.src}, ${im.w} px)`);
      }
      await u.page.screenshot({ path: `${OUT}/pass-seasons-390.png`, fullPage: true });
      await u.context.close();
    }
    // ── 4. Картинка в диалоге сюжетного квеста ──
    for (const [w, h] of SIZES) {
      for (const [slug, baked] of [['s-warszawa-dworzec', true], ['s-krakow-mieszkanie', true], ['s-wroclaw-zgubiony', false]] as const) {
        const tag = `${w}px /story/${slug}`;
        let u;
        try {
          u = await userPage([w, h], `/story/${slug}`, '[data-story-scene]', { cityStories: true });
        } catch (e) {
          check(false, `${tag}: экран открылся (${(e as Error).message.split('\n')[0]})`);
          continue;
        }
        const im = await loaded(u.page, '[data-story-scene] img');
        check(im.ok, `${tag}: картинка диалога загружена (${im.src}, ${im.w} px)`);
        const b = await box(u.page, '[data-story-scene] img');
        const p = await box(u.page, '[data-story-scene]');
        check(Math.abs(b.w - p.w) < 1.5 && Math.abs(b.h - p.h) < 1.5, `${tag}: картинка закрывает окно целиком (${Math.round(b.w)}×${Math.round(b.h)} из ${Math.round(p.w)}×${Math.round(p.h)})`);
        const pics = await u.page.locator('[data-story-scene] img').count();
        const hasSvg = await u.page.locator('[data-story-scene] svg').count();
        check(baked ? pics === 1 && hasSvg === 0 : pics >= 2, `${tag}: ${baked ? 'второго Бобека поверх кадра нет' : 'Бобек поверх кадра карточки на месте'} (картинок ${pics})`);
        const act = await u.page.locator('.btn-primary, .option').first().evaluate((el) => { const r = el.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, vh: window.innerHeight }; });
        // На 320×640 первый вариант ответа может уходить за нижний край (экран прокручивается, как и до замены картинки): важно, что его верх виден.
        check(act.top > 0 && act.top < act.vh - 24, `${tag}: кнопка «Далее» / варианты ответа начинаются в видимой части экрана (верх ${Math.round(act.top)} из ${act.vh})`);
        check(await u.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${tag}: нет горизонтальной прокрутки`);
        await u.page.screenshot({ path: `${OUT}/story-${slug}-${w}.png` });
        await u.context.close();
      }
    }

    // ── 5. Вступление миссии «11 ноября» ──
    {
      const u = await userPage([390, 844], '/life/listopad-swieto', 'img[data-scene-art="pass-listopad-swieto"]', { premium: true });
      const im = await loaded(u.page, 'img[data-scene-art="pass-listopad-swieto"]');
      check(im.ok, `/life/listopad-swieto: кадр Stary Rynek загружен (${im.src}, ${im.w} px)`);
      const b = await box(u.page, 'img[data-scene-art="pass-listopad-swieto"]');
      check(Math.abs(b.w - 390) < 1.5 && b.h > 190, `/life/listopad-swieto: кадр на всю ширину экрана (${Math.round(b.w)}×${Math.round(b.h)})`);
      const over = await u.page.locator('img[data-scene-art="pass-listopad-swieto"]').evaluate((el) => !!(el.parentElement as HTMLElement).querySelector('.-bottom-6'));
      check(!over, '/life/listopad-swieto: второго Бобека поверх кадра нет (он нарисован на кадре)');
      await u.page.screenshot({ path: `${OUT}/mission-listopad-390.png` });
      await u.context.close();
    }

    // ── 5а. Вступление «Анджейек» (кадр владельца 2026-11-02) и кнопка «Начать миссию» ──
    for (const [w, h] of SIZES) {
      const tag = `${w}px /life/andrzejki-wosk`;
      const sel = 'img[data-scene-art="pass-andrzejki-wosk"]';
      const u = await userPage([w, h], '/life/andrzejki-wosk', sel, { premium: true });
      const im = await loaded(u.page, sel);
      check(im.ok && /andrzejki/.test(im.src), `${tag}: кадр владельца загружен (${im.src}, ${im.w} px)`);
      const over = await u.page.locator(sel).evaluate((el) => !!(el.parentElement as HTMLElement).querySelector('.-bottom-6'));
      check(!over, `${tag}: второго Бобра поверх нет (бариста с кофе уже на кадре)`);
      const btn = await box(u.page, '[data-mission-start]');
      const info = await u.page.locator('[data-mission-start]').evaluate((el) => ({ text: (el.textContent || '').trim(), img: getComputedStyle(el).borderImageSource, svg: !!el.querySelector('svg'), h: el.getBoundingClientRect().height }));
      check(/Начать миссию/.test(info.text) && info.svg, `${tag}: на кнопке живой текст и значок «play» («${info.text}»)`);
      check(/btn-start/.test(info.img), `${tag}: корпус кнопки — картинка владельца (${info.img.slice(0, 40)}…)`);
      check(btn.h >= 44 && btn.w >= w - 40 && btn.b <= h, `${tag}: кнопка крупная и на экране (${Math.round(btn.w)}×${Math.round(btn.h)}, низ ${Math.round(btn.b)} из ${h})`);
      check(await u.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${tag}: нет горизонтальной прокрутки`);
      if (w !== 430) await u.page.screenshot({ path: `${OUT}/mission-andrzejki-${w}.png` });
      await u.context.close();
    }

    // ── 6. Строки «Сегодня» на главной ──
    for (const [w, h] of SIZES) {
      const u = await userPage([w, h], '/', '[data-today]');
      await u.page.locator('[data-today]').scrollIntoViewIfNeeded();
      await u.page.waitForTimeout(600);
      const imgs = await u.page.locator('[data-today] img').evaluateAll((els) => els.map((e) => ({ ok: (e as HTMLImageElement).complete && (e as HTMLImageElement).naturalWidth > 0, w: (e as HTMLImageElement).naturalWidth, src: (e as HTMLImageElement).currentSrc.split('/').pop() })));
      check(imgs.length >= 3 && imgs.every((i) => i.ok), `${w}px: строки «Сегодня» — все значки загружены (${imgs.map((i) => i.src).join(', ')})`);
      const tiles = await u.page.locator('[data-today] .task-card').evaluateAll((els) => els.map((e) => ({ plate: !!e.querySelector('.icon-plate'), tile: !!e.querySelector('img') && !e.querySelector('.icon-plate') })));
      check(tiles.every((t) => t.plate !== t.tile), `${w}px: у каждой строки либо значок-плитка, либо плашка (${tiles.map((t) => (t.plate ? 'плашка' : 'плитка')).join(', ')})`);
      check(await u.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${w}px: главная без горизонтальной прокрутки`);
      await u.page.screenshot({ path: `${OUT}/home-today-${w}.png` });
      await u.context.close();
    }
    // ── 7. Длинный сюжетный квест в интерфейсе ──
    {
      const { STORY_QUESTS } = await import(root + '/apps/server/src/content/gamification.ts');
      const quest = STORY_QUESTS.find((q: { slug: string }) => q.slug === 's-warszawa-dworzec');
      for (const [w, h] of SIZES) {
        const tag = `${w}px /story/s-warszawa-dworzec`;
        const u = await userPage([w, h], '/story/s-warszawa-dworzec', '[data-story-scene]');
        let steps = 0;
        let wrongTried = false;
        const seenStages = new Set<number>();
        for (let si = 0; si < quest.stages.length; si++) {
          const st = quest.stages[si];
          let id: string = st.start;
          for (let guard = 0; guard < 40; guard++) {
            const node = st.nodes[id];
            // реплика текущего узла на экране
            await u.page.getByText(node.pl, { exact: true }).first().waitFor({ timeout: 15_000 });
            if (guard === 0) {
              const sub = await u.page.locator('header, [class*="ScreenHeader"], h1').first().evaluate((el) => (el.closest('div') as HTMLElement).innerText);
              check(new RegExp(`${si + 1}\\s*из\\s*${quest.stages.length}`).test(sub), `${tag}: подпись «Этап ${si + 1} из ${quest.stages.length}» (${sub.replace(/\s+/g, ' ').slice(0, 70)})`);
              seenStages.add(si);
            }
            if (node.choices) {
              // сначала один раз неверный ответ: разговор не двигается, видна подсказка
              const wrong = node.choices.find((c: { ok: boolean }) => !c.ok);
              if (!wrongTried && wrong && si === 2) {
                wrongTried = true;
                await u.page.locator('.option', { hasText: wrong.pl }).first().click();
                await u.page.waitForTimeout(700);
                check(await u.page.getByText(node.pl, { exact: true }).first().isVisible(), `${tag}: неверный ответ не двигает разговор (глава 3)`);
              }
              const good = node.choices.find((c: { ok: boolean }) => c.ok);
              await u.page.locator('.option', { hasText: good.pl }).first().click();
              id = good.next;
            } else if (node.next) {
              await u.page.locator('.btn-primary').first().click();
              id = node.next;
            } else {
              await u.page.locator('.btn-primary').first().click();
              break;
            }
            steps++;
            await u.page.waitForTimeout(250);
          }
        }
        await u.page.getByText('Забрать', { exact: false }).first().waitFor({ timeout: 15_000 });
        check(seenStages.size === 5 && steps >= 24, `${tag}: пройдены все 5 глав, шагов с выбором и «Далее» — ${steps}`);
        check(await u.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${tag}: нет горизонтальной прокрутки`);
        if (w === 390) await u.page.screenshot({ path: `${OUT}/story-done-${w}.png` });
        await u.context.close();
      }
    }
    check(pageErrors.length === 0, `без ошибок страницы${pageErrors.length ? ': ' + pageErrors.slice(0, 3).join(' | ') : ''}`);
  } finally {
    await browser.close();
    await stand.stop();
  }
  console.log(failures.length ? `\nПровалено: ${failures.length}` : '\nВсе проверки пройдены');
  process.exit(failures.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
