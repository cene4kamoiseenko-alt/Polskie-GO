/**
 * «Бобек дома» (фото владельца 2026-11-02) вместо векторной сцены MIESZKANIE — в реальном браузере (Chromium, не Telegram на iPhone / Android).
 *
 *   node --import tsx scripts/home-art-screens.ts   → test-results/home-art/*.png
 *
 * 1. «Egzaminy»: шапка карточки уровня — крупное фото Бобра за учёбой (загружено, не ниже 150 px на 390), уровень виден; нет горизонтальной прокрутки; 320 / 390 / 430.
 * 2. Пробный экзамен и входной тест: сцена над заданием — фото (а не SVG MIESZKANIE), второго Бобра поверх нет, подсказка Бобра видна.
 * 3. Вступление к уроку маршрута «квартира» (Варшава, «Powitania»): фото вместо SVG, Бобра поверх нет.
 * 4. Список уроков Варшавы: миниатюра маршрута «квартира» — фото с ключами.
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromiumPath, startStand } from './lib/stand';

const root = process.cwd();
const require = createRequire(root + '/package.json');
const OUT = resolve(root, 'test-results/home-art');
const SIZES: [number, number][] = [[320, 640], [390, 844], [430, 932]];

const failures: string[] = [];
const check = (ok: unknown, what: string) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) failures.push(what);
};

type Exam = { id: string; kind: string; cefr: string };
type Journey = { cities: { slug: string; routes: { slug: string; lessons: { id: string }[] }[] }[] };

async function main() {
  const { chromium } = require('playwright') as typeof import('playwright');
  const stand = await startStand({ ui: 'dev' });
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: chromiumPath(chromium), args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const pageErrors: string[] = [];
  let devUser = 997800;

  async function userPage(size: [number, number]) {
    const u = await stand.login();
    await u.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A0', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: null });
    await u.call('PATCH', '/api/me/settings', { theme: 'dark', reducedMotion: true });
    const id = String(++devUser);
    const context = await browser.newContext({ viewport: { width: size[0], height: size[1] }, deviceScaleFactor: 2, locale: 'ru-RU' });
    const page = await context.newPage();
    page.on('pageerror', (e) => pageErrors.push(e.message));
    await page.addInitScript(({ token, id }) => localStorage.setItem('pg_auth', JSON.stringify({ token, owner: `dev:${id}`, exp: Date.now() + 86_400_000 })), { token: u.token, id });
    const go = async (path: string, sel: string) => {
      await page.goto(`${stand.base}${path}${path.includes('?') ? '&' : '?'}devUser=${id}`);
      await page.locator(sel).first().waitFor({ timeout: 30_000 });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(800);
    };
    return { ...u, page, context, go };
  }
  const imgOk = (p: import('playwright').Page, sel: string) =>
    p.locator(sel).first().evaluate((el: HTMLImageElement) => ({ ok: el.complete && el.naturalWidth > 0, src: el.currentSrc.split('/').pop() || '', h: el.getBoundingClientRect().height }));
  const noScroll = (p: import('playwright').Page) => p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);

  try {
    for (const [w, h] of SIZES) {
      const tag = `${w}px`;
      const u = await userPage([w, h]);

      // ── 1. Egzaminy ──
      await u.go('/exams', '[data-exams-hero] img');
      const hero = await imgOk(u.page, '[data-exams-hero] img');
      check(hero.ok && /home-study/.test(hero.src), `${tag} /exams: фото Бобра за учёбой загружено (${hero.src})`);
      check(hero.h >= (w >= 390 ? 150 : 125), `${tag} /exams: Бобёр крупный — кадр ${Math.round(hero.h)} px в высоту (было 94)`);
      const heroText = (await u.page.locator('[data-exams-hero]').innerText()).replace(/\s+/g, ' ');
      check(/Уровень польского:?\s*A[0-2]/i.test(heroText) || /A[0-2]/.test(heroText), `${tag} /exams: уровень виден (${heroText.slice(0, 40)})`);
      check(await noScroll(u.page), `${tag} /exams: нет горизонтальной прокрутки`);
      await u.page.screenshot({ path: `${OUT}/exams-${w}.png`, fullPage: true });

      // ── 2. Экзамен и входной тест ──
      const exams = ((await u.call('GET', '/api/exams')).body as { exams: Exam[] }).exams;
      for (const kind of ['EXAM', 'PLACEMENT']) {
        const e = exams.find((x) => x.kind === kind && x.cefr === 'A1') ?? exams.find((x) => x.kind === kind);
        if (!e) { check(false, `${tag}: есть ${kind}`); continue; }
        await u.go(`/lesson/${e.id}`, '.lesson-stage');
        const stage = u.page.locator('.lesson-stage').first();
        const kindAttr = await stage.getAttribute('data-stage-photo');
        const ph = await imgOk(u.page, '.lesson-stage img');
        check(!!kindAttr && ph.ok && /home-/.test(ph.src), `${tag} ${kind}: сцена — фото «Бобек дома» (${kindAttr}, ${ph.src})`);
        check((await stage.locator('svg[viewBox="0 0 360 170"], [data-look-pose]').count()) === 0, `${tag} ${kind}: ни SVG MIESZKANIE, ни второго Бобра поверх фото`);
        const bubble = await stage.locator('.stage-bubble').first().evaluate((el) => { const r = el.getBoundingClientRect(); const p = (el.closest('.lesson-stage') as HTMLElement).getBoundingClientRect(); return { inside: r.x >= p.x && r.right <= p.right + 1 && r.bottom <= p.bottom + 1, w: r.width, txt: el.textContent ?? '' }; });
        check(bubble.inside && bubble.w > 100 && bubble.txt.length > 4, `${tag} ${kind}: подсказка Бобра в кадре («${bubble.txt}»)`);
        check(await noScroll(u.page), `${tag} ${kind}: нет горизонтальной прокрутки`);
        await u.page.screenshot({ path: `${OUT}/${kind.toLowerCase()}-${w}.png` });
      }

      // ── 3–4. Варшава: вступление к уроку «квартира» и миниатюра маршрута ──
      const journey = (await u.call('GET', '/api/journey')).body as Journey;
      const waw = journey.cities.find((c) => c.slug === 'warszawa');
      const route = waw?.routes.find((r) => r.slug === 'waw-powitania');
      if (!route) check(false, `${tag}: маршрут waw-powitania найден`);
      else {
        await u.go(`/lesson/${route.lessons[0].id}`, '[data-intro-photo]');
        const intro = await imgOk(u.page, '[data-intro-photo]');
        check(intro.ok && /home-study/.test(intro.src), `${tag} вступление: фото вместо SVG MIESZKANIE (${intro.src})`);
        check((await u.page.locator('.lesson-stage [data-look-pose]').count()) === 0, `${tag} вступление: второго Бобра поверх фото нет`);
        if (w === 390) await u.page.screenshot({ path: `${OUT}/intro-${w}.png` });
        await u.go(`/learn?city=${encodeURIComponent((journey.cities.find((c) => c.slug === 'warszawa') as unknown as { id: string }).id)}`, '.location-card');
        const thumbs = await u.page.locator('.location-card img[src*="home-keys"]').evaluateAll((els) => els.map((e) => (e as HTMLImageElement).complete && (e as HTMLImageElement).naturalWidth > 0));
        check(thumbs.length >= 1 && thumbs.every(Boolean), `${tag} /learn: миниатюра маршрута «квартира» — фото с ключами (${thumbs.length})`);
        if (w === 390) await u.page.screenshot({ path: `${OUT}/learn-${w}.png` });
      }
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
