/**
 * Экран пропуска месяца в реальном браузере (Chromium, не Telegram на iPhone / Android): новый визуал по референсу владельца 2026-11-01 (docs/design/v19/pass).
 *
 *   node --import tsx scripts/pass-screens.ts   → test-results/pass-screens/*.png
 *
 * 1. Premium и миссия «Рогалики» начата (настоящий ACTIVE-прогон, шаг 1 из 6) на 320 / 360 / 390 / 430: сверху карточка «Продолжить» с вырезкой рогаликов и подписью
 *    «шаг 1 из 6», ниже две карточки с артами «Старый рынок» и «Андрейки», значки времени и XP, красные кнопки; блок «Как работает пропуск»; нет горизонтальной
 *    прокрутки, всё в кадре, кнопки ≥ 44 px, подписи не вылезают из карточек, картинки загружены (нижние — лениво).
 * 2. Нажатия ведут туда, куда вели раньше: «Продолжить» и «Рогалики» — /life/marcin-rogal, «11 ноября» — /life/listopad-swieto.
 * 2а. Начата «11 ноября» (listopad-swieto): в «Продолжить» вырезка Бобека-бариста (мастер владельца), целая и в кадре; обложка сезона — кадр Stary Rynek 16:9, загружен.
 * 3. Без Premium и без прогресса: «Бесплатно» только у первой, у остальных замок и «Premium», нажатие ведёт на /premium; карточки «Продолжить» нет.
 * 4. Светлая тема и «Меньше анимации» (prefers-reduced-motion): панели остаются тёмными и читаемыми, анимаций нет.
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromiumPath, startStand } from './lib/stand';

const root = process.cwd();
const require = createRequire(root + '/package.json');
const OUT = resolve(root, 'test-results/pass-screens');
const SIZES: [number, number][] = [[320, 640], [360, 740], [390, 844], [430, 932]];

const failures: string[] = [];
const check = (ok: unknown, what: string) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) failures.push(what);
};

async function main() {
  const { chromium } = require('playwright') as typeof import('playwright');
  const stand = await startStand({ ui: 'dev' });
  const { db } = await import(root + '/apps/server/src/db/index.ts');
  const { subscriptions } = await import(root + '/apps/server/src/db/schema.ts');
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: chromiumPath(chromium), args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const pageErrors: string[] = [];
  let devUser = 996100;

  async function userPage(size: [number, number], opts: { premium?: boolean; started?: boolean | string; theme?: 'light' | 'dark'; reduced?: boolean } = {}) {
    const u = await stand.login();
    await u.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A0', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: null });
    await u.call('PATCH', '/api/me/settings', { theme: opts.theme ?? 'dark', reducedMotion: !!opts.reduced });
    if (opts.premium) await db.insert(subscriptions).values({ userId: u.user.id, planCode: 'MONTH_1', status: 'ACTIVE', startsAt: new Date(), expiresAt: new Date(Date.now() + 86_400_000), grantedByAdminId: 'qa-pass-screens' });
    if (opts.started) {
      const r = await u.call('POST', `/api/missions/${typeof opts.started === 'string' ? opts.started : 'marcin-rogal'}/start`, {});
      if (r.status !== 200) throw new Error(`не удалось начать миссию: ${r.status}`);
    }
    const id = String(++devUser);
    const context = await browser.newContext({ viewport: { width: size[0], height: size[1] }, deviceScaleFactor: 2, locale: 'ru-RU' });
    const page = await context.newPage();
    page.on('pageerror', (e) => pageErrors.push(e.message));
    await page.addInitScript(({ token, id }) => localStorage.setItem('pg_auth', JSON.stringify({ token, owner: `dev:${id}`, exp: Date.now() + 86_400_000 })), { token: u.token, id });
    const open = async () => {
      await page.goto(`${stand.base}/pass?devUser=${id}`);
      await page.locator('[data-pass-mission], [data-pass-featured]').first().waitFor({ timeout: 30_000 });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(900);
    };
    return { ...u, page, context, open, id };
  }
  const box = (p: import('playwright').Page, sel: string, nth = 0) =>
    p.locator(sel).nth(nth).evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height, r: r.right, b: r.bottom };
    });

  try {
    // ── 1. Premium + начатая миссия, четыре размера ──
    for (const [w, h] of SIZES) {
      const u = await userPage([w, h], { premium: true, started: true });
      await u.open();
      const tag = `${w}px`;
      check((await u.page.locator('[data-pass-featured="marcin-rogal"]').count()) === 1, `${tag}: сверху карточка «Продолжить» для начатой миссии`);
      const resume = (await u.page.locator('[data-pass-featured] .pg-resume').textContent()) ?? '';
      check(/Продолжить.*шаг\s1\sиз\s6/.test(resume), `${tag}: «${resume.trim()}» — шаг из реального прогона`);
      const listed = await u.page.locator('[data-pass-mission]').evaluateAll((els) => els.map((e) => e.getAttribute('data-pass-mission')));
      check(listed.join() === 'listopad-swieto,andrzejki-wosk', `${tag}: ниже две остальные миссии, «Рогалики» не дублируются (${listed.join(', ')})`);
      check((await u.page.locator('[data-pass-mission="marcin-rogal"]').count()) === 0, `${tag}: начатая миссия только в «Продолжить»`);
      check(await u.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${tag}: нет горизонтальной прокрутки`);

      // арты: загружены (нижние — лениво: прокручиваем к ним)
      for (const slug of ['listopad-swieto', 'andrzejki-wosk']) {
        const card = u.page.locator(`[data-pass-mission="${slug}"]`);
        await card.scrollIntoViewIfNeeded();
        await u.page.waitForTimeout(500);
        const art = await card.locator('img[data-pass-art]').evaluate((el: HTMLImageElement) => ({ ok: el.complete && el.naturalWidth > 0, w: el.naturalWidth, src: el.currentSrc.split('/').pop() }));
        check(art.ok, `${tag}: арт «${slug}» загружен (${art.src}, ${art.w} px)`);
      }
      const cutout = await u.page.locator('.pg-feature-art').evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0);
      check(cutout, `${tag}: вырезка рогаликов загружена`);
      const cover = await u.page.locator('img[data-season-cover="listopad-poznan"]').first().evaluate((el: HTMLImageElement) => ({ ok: el.complete && el.naturalWidth > 0, src: el.currentSrc.split('/').pop(), r: el.getBoundingClientRect().right, x: el.getBoundingClientRect().x }));
      check(cover.ok && cover.x >= 0 && cover.r <= w, `${tag}: обложка сезона — кадр Stary Rynek загружен и в кадре (${cover.src})`);
      await u.page.evaluate(() => window.scrollTo(0, 0));

      // раскладка
      const feat = await box(u.page, '.pg-feature');
      check(feat.x >= 0 && feat.r <= w, `${tag}: «Продолжить» в кадре (${Math.round(feat.x)}…${Math.round(feat.r)} из ${w})`);
      const body = await box(u.page, '.pg-feature-body');
      const play = await box(u.page, '.pg-feature .pg-play');
      check(body.r <= play.x + 2, `${tag}: текст «Продолжить» не заходит на кнопку (${Math.round(body.r)} ≤ ${Math.round(play.x)})`);
      check(play.w >= 44 && play.h >= 44, `${tag}: кнопка «Продолжить» ≥ 44 px (${Math.round(play.w)})`);
      const resumeBox = await box(u.page, '[data-pass-featured] .pg-resume');
      const artBox = await box(u.page, '.pg-feature-art');
      // Текст самой подписи (не блока): ширина строки по Range, потому что .pg-resume — блочный элемент на всю ширину тела.
      const resumeTextR = await u.page.locator('[data-pass-featured] .pg-resume').evaluate((el) => {
        const r = document.createRange();
        r.selectNodeContents(el);
        return r.getBoundingClientRect().right;
      });
      check(resumeTextR <= artBox.x + 4 || resumeBox.b <= artBox.y + 2, `${tag}: подпись «шаг N из M» не заходит на рогалики (${Math.round(resumeTextR)} ≤ ${Math.round(artBox.x)})`);
      const cards = await u.page.locator('.pg-mission').evaluateAll((els) =>
        els.map((e) => {
          const r = e.getBoundingClientRect();
          const title = e.querySelector('.pg-title') as HTMLElement;
          const goal = e.querySelector('.pg-goal') as HTMLElement;
          const playBtn = e.querySelector('.pg-play') as HTMLElement;
          const pr = playBtn.getBoundingClientRect();
          const tr = title.getBoundingClientRect();
          const gr = goal.getBoundingClientRect();
          return { x: r.x, r: r.right, w: pr.width, h: pr.height, textR: Math.max(tr.right, gr.right), playX: pr.x, clip: title.scrollWidth > title.clientWidth + 1 || goal.scrollWidth > goal.clientWidth + 1 };
        }),
      );
      check(cards.length === 2 && cards.every((c) => c.x >= 0 && c.r <= w), `${tag}: карточки миссий в кадре`);
      check(cards.every((c) => c.textR <= c.playX + 2), `${tag}: название и описание не заходят на кнопку`);
      check(cards.every((c) => c.w >= 44 && c.h >= 44), `${tag}: кнопки запуска ≥ 44 px`);
      check(cards.every((c) => !c.clip), `${tag}: название и описание не обрезаны`);
      const badges = await u.page.locator('.pg-badge').evaluateAll((els) => els.map((e) => (e.textContent ?? '').replace(/\s+/g, ' ').trim()));
      check(badges.includes('~4 мин') && badges.includes('+45 XP'), `${tag}: значки времени и XP из данных миссии (${badges.slice(0, 4).join(' | ')})`);
      const how = await box(u.page, '[data-pass-how]');
      check(how.x >= 0 && how.r <= w, `${tag}: «Как работает пропуск» в кадре`);
      await u.page.screenshot({ path: `${OUT}/pass-${w}.png`, fullPage: true });

      if (w === 390) {
        // ── 2. Нажатия ──
        await u.page.locator('[data-pass-featured]').click();
        await u.page.waitForURL(/\/life\/marcin-rogal$/, { timeout: 15_000 });
        check(true, '390px: «Продолжить» открывает миссию «Рогалики» (продолжает прогон)');
        await u.page.goBack();
        await u.page.locator('[data-pass-mission="listopad-swieto"]').waitFor({ timeout: 20_000 });
        await u.page.locator('[data-pass-mission="listopad-swieto"] .pg-mission').click();
        await u.page.waitForURL(/\/life\/listopad-swieto$/, { timeout: 15_000 });
        check(true, '390px: «11 ноября» с Premium открывает миссию');
      }
      await u.context.close();
    }

    // ── 2а. Начата «11 ноября»: в «Продолжить» Бобек-бариста ──
    for (const [w, h] of [[320, 640], [390, 844]] as [number, number][]) {
      const u = await userPage([w, h], { premium: true, started: 'listopad-swieto' });
      await u.open();
      const tag = `${w}px`;
      check((await u.page.locator('[data-pass-featured="listopad-swieto"]').count()) === 1, `${tag}: «11 ноября» начата — карточка «Продолжить»`);
      const listed = await u.page.locator('[data-pass-mission]').evaluateAll((els) => els.map((e) => e.getAttribute('data-pass-mission')));
      check(listed.join() === 'marcin-rogal,andrzejki-wosk', `${tag}: ниже остальные миссии (${listed.join(', ')})`);
      const cut = await u.page.locator('.pg-feature-art').evaluate((el: HTMLImageElement) => ({ ok: el.complete && el.naturalWidth > 0, nw: el.naturalWidth, nh: el.naturalHeight, src: el.currentSrc.split('/').pop() }));
      check(cut.ok && /barista/.test(cut.src ?? '') && cut.nw === 275 && cut.nh === 340, `${tag}: вырезка Бобека-бариста загружена (${cut.src}, ${cut.nw}×${cut.nh})`);
      const feat = await box(u.page, '.pg-feature');
      const cutBox = await box(u.page, '.pg-feature-art');
      const play = await box(u.page, '.pg-feature .pg-play');
      check(cutBox.y >= feat.y - 1 && cutBox.b <= feat.b + 1 && cutBox.x >= feat.x && cutBox.r <= feat.r, `${tag}: Бобек-бариста целиком внутри карточки (${Math.round(cutBox.w)}×${Math.round(cutBox.h)})`);
      check(cutBox.r <= play.x + 6, `${tag}: Бобек не заходит на кнопку (${Math.round(cutBox.r)} ≤ ${Math.round(play.x)})`);
      const resumeTextR = await u.page.locator('[data-pass-featured] .pg-resume').evaluate((el) => {
        const r = document.createRange();
        r.selectNodeContents(el);
        return r.getBoundingClientRect().right;
      });
      const titleR = await u.page.locator('[data-pass-featured] .pg-feature-title').evaluate((el) => {
        const r = document.createRange();
        r.selectNodeContents(el);
        return r.getBoundingClientRect().right;
      });
      check(resumeTextR <= cutBox.x + 4, `${tag}: подпись «шаг N из M» не заходит на Бобека (${Math.round(resumeTextR)} ≤ ${Math.round(cutBox.x)})`);
      check(titleR <= cutBox.x + 4 || (await box(u.page, '.pg-feature-title')).b <= cutBox.y + 2, `${tag}: название не заходит на Бобека (${Math.round(titleR)} ≤ ${Math.round(cutBox.x)})`);
      const goalR = await u.page.locator('[data-pass-featured] .pg-feature-goal').evaluate((el) => {
        const r = document.createRange();
        r.selectNodeContents(el);
        return r.getBoundingClientRect().right;
      });
      check(goalR <= cutBox.x, `${tag}: описание миссии не заходит на Бобека (${Math.round(goalR)} ≤ ${Math.round(cutBox.x)})`);
      const featClip = await u.page.locator('.pg-feature-goal').evaluate((el) => el.scrollWidth > el.clientWidth + 1);
      check(!featClip, `${tag}: описание в «Продолжить» не обрезано`);
      await u.page.screenshot({ path: `${OUT}/pass-barista-${w}.png`, fullPage: true });
      await u.context.close();
    }

    // ── 3. Без Premium и без прогресса ──
    {
      const u = await userPage([390, 844], {});
      await u.open();
      check((await u.page.locator('[data-pass-featured]').count()) === 0, 'без прогресса: карточки «Продолжить» нет (она только для настоящего незавершённого прохождения)');
      const cards = await u.page.locator('[data-pass-mission]').evaluateAll((els) => els.map((e) => ({ slug: e.getAttribute('data-pass-mission'), open: e.getAttribute('data-open'), free: !!e.querySelector('.pg-tag--free'), gold: !!e.querySelector('.pg-tag--gold'), lock: !!e.querySelector('.pg-play--locked') })));
      check(cards.length === 3, `без Premium: три миссии сезона (${cards.length})`);
      check(cards[0].open === '1' && cards[0].free && !cards[0].lock, 'без Premium: первая миссия бесплатная и открыта («Бесплатно»)');
      check(cards.slice(1).every((c) => c.open === '0' && !c.free && c.gold && c.lock), 'без Premium: остальные закрыты — замок и «Premium»');
      await u.page.screenshot({ path: `${OUT}/pass-free-390.png`, fullPage: true });
      await u.page.locator('[data-pass-mission="andrzejki-wosk"] .pg-mission').click();
      await u.page.waitForURL(/\/premium$/, { timeout: 15_000 });
      check(true, 'без Premium: закрытая миссия ведёт на экран Premium');
      await u.context.close();
    }

    // ── 4. Светлая тема и «Меньше анимации» ──
    {
      const u = await userPage([390, 844], { premium: true, started: true, theme: 'light', reduced: true });
      await u.open();
      // Без именованных функций внутри evaluate: tsx оборачивает их в __name, которого нет на странице.
      const colors = await u.page.evaluate(() => ({
        feature: getComputedStyle(document.querySelector('.pg-feature')!).backgroundImage,
        featureText: getComputedStyle(document.querySelector('.pg-feature-title')!).color,
        mission: getComputedStyle(document.querySelector('.pg-mission')!).backgroundImage,
        title: getComputedStyle(document.querySelector('.pg-title')!).color,
        info: getComputedStyle(document.querySelector('.pg-info')!).backgroundImage,
      }));
      const light = (c: string) => /rgb\((2[0-9]{2}|1[89][0-9]),\s*(2[0-9]{2}|1[89][0-9])/.test(c);
      check(!light(colors.feature) && !light(colors.mission) && !light(colors.info), 'светлая тема: панели пропуска остаются тёмно-синими');
      check(light(colors.featureText) && light(colors.title), `светлая тема: текст на панелях светлый (${colors.title})`);
      const anim = await u.page.evaluate(() => {
        const names = Array.from(document.querySelectorAll('.pg-pass *')).map((e) => getComputedStyle(e).animationName).filter((n) => n !== 'none');
        return names;
      });
      check(anim.length === 0, `«Меньше анимации»: на экране пропуска нет анимаций (${anim.join(',') || 'нет'})`);
      await u.page.screenshot({ path: `${OUT}/pass-light-390.png`, fullPage: true });
      await u.context.close();
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
