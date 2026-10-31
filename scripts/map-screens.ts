/**
 * Иллюстрированная карта (ADR-012) на 360 / 390 / 430 px: реальные снимки и проверки поведения в Chromium (не Telegram на телефоне).
 *
 *  1. Кнопки городов совпадают с нарисованными табличками: положение каждой кнопки относительно картинки равно рамке из MAP_SPOTS —
 *     сразу, после перетаскивания, кнопок + / −, колеса и щипка двумя пальцами (CDP touch). В центре видимой кнопки нажимается она сама.
 *  2. «Ты здесь» — на текущем городе и в видимом окне; карточка не залезает под нижнюю навигацию; нет горизонтальной прокрутки.
 *  3. Закрытый город: карточка «закрыт», без кнопки перехода; сервер отказывает в уроке закрытого города (403 lesson_locked).
 *  4. «Продолжить» открывает настоящий следующий урок (journey.nextLesson). Перетаскивание, начатое на городе, город не выбирает.
 *  5. Клавиатура: стрелки двигают карту, + увеличивает, Tab ведёт по городам в порядке маршрута, Enter выбирает.
 *  6. Sopot (нет этапа) объясняет почему и ведёт к Gdańsk; Закопане (нет на картинке) — свой маркер и кнопка.
 *  7. Путешествие /map?travel=from,to с prefers-reduced-motion: маркер сразу в конечном городе.
 *  8. Медленная сеть: пока грузится картинка, видна размытая копия, карточка не сдвигается; без сети карта двигается и выбирает города.
 *  9. Длинное название (Gorzów Wielkopolski) не ломает карточку; тёмная тема и альбомная ориентация — снимки и проверка переполнения.
 *
 * Запуск: node --import tsx scripts/map-screens.ts   → test-results/map-screens/<снимок>-<ширина>.png
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { MAP_ART, MAP_SPOTS, mapHitRect, mapStarPoint } from '../packages/shared/src/mapArt';
import { chromiumPath, startStand } from './lib/stand';

const root = process.cwd();
const require = createRequire(root + '/package.json');
const OUT = resolve(root, 'test-results/map-screens');
const WIDTHS = [360, 390, 430];
const HEIGHT: Record<number, number> = { 360: 780, 390: 844, 430: 932 };

const failures: string[] = [];
const check = (ok: unknown, what: string) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) failures.push(what);
};

type Page = import('playwright').Page;

/** Рамки кнопок относительно картинки (в пикселях картинки) и что лежит в центре каждой видимой кнопки. */
async function alignment(p: Page) {
  return p.evaluate(({ W, H }) => {
    const img = document.querySelector('.map-art') as HTMLImageElement;
    const ir = img.getBoundingClientRect();
    const k = W / ir.width;
    const card = document.querySelector('[data-map-card]')?.getBoundingClientRect();
    const hud = document.querySelector('.map-hud')?.getBoundingClientRect();
    const ctrl = document.querySelector('[data-map-ctrl]')?.getBoundingClientRect();
    const spots = [...document.querySelectorAll<HTMLElement>('[data-spot]')].map((b) => {
      const r = b.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      // Видимость: центр в окне между шапкой и карточкой и не под кнопками масштаба.
      const vp = document.querySelector('[data-illustrated-map]')!.getBoundingClientRect();
      const inWindow = cx > vp.left + 4 && cx < vp.right - 4 && cy > (hud?.bottom ?? 0) + 4 && cy < (card?.top ?? innerHeight) - 4
        && !(ctrl && cx > ctrl.left - 4 && cy > ctrl.top - 4 && cy < ctrl.bottom + 4);
      const hit = inWindow ? document.elementFromPoint(cx, cy)?.closest('[data-spot]')?.getAttribute('data-spot') ?? null : null;
      return {
        key: b.dataset.spot!,
        rect: [(r.left - ir.left) * k, (r.top - ir.top) * (H / ir.height), (r.right - ir.left) * k, (r.bottom - ir.top) * (H / ir.height)],
        inWindow,
        hit,
        label: b.getAttribute('aria-label') ?? '',
      };
    });
    const st = document.querySelector('.map-stage') as HTMLElement;
    return { spots, scale: new DOMMatrix(getComputedStyle(st).transform).a, transform: getComputedStyle(st).transform };
  }, { W: MAP_ART.width, H: MAP_ART.height });
}

function checkAligned(tag: string, a: Awaited<ReturnType<typeof alignment>>) {
  const off: string[] = [];
  for (const s of a.spots) {
    const want = mapHitRect(MAP_SPOTS[s.key]);
    if (s.rect.some((v, i) => Math.abs(v - want[i]) > 1.5)) off.push(`${s.key} ${s.rect.map(Math.round).join(',')} ≠ ${want.join(',')}`);
  }
  check(a.spots.length === Object.keys(MAP_SPOTS).length && off.length === 0, `${tag}: ${a.spots.length} кнопок совпадают с табличками на картинке (масштаб ${a.scale.toFixed(2)})${off.length ? ' — ' + off.join('; ') : ''}`);
  const visible = a.spots.filter((s) => s.inWindow);
  const covered = visible.filter((s) => s.hit !== s.key).map((s) => `${s.key}→${s.hit}`);
  check(visible.length > 0 && covered.length === 0, `${tag}: в центре ${visible.length} видимых кнопок нажимается сама кнопка${covered.length ? ' — перекрыты: ' + covered.join(', ') : ''}`);
}

async function main() {
  const { chromium } = require('playwright') as typeof import('playwright');
  const stand = await startStand({ ui: 'dev' });
  const { base, login } = stand;
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: chromiumPath(chromium), args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  let devUser = 994400;
  const open = async (width: number, height = HEIGHT[width], opts: { dark?: boolean; reduced?: boolean } = {}) => {
    const u = await login();
    await u.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A0', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: null });
    const id = String(++devUser);
    const context = await browser.newContext({
      viewport: { width, height }, deviceScaleFactor: 2, locale: 'ru-RU', hasTouch: true,
      colorScheme: opts.dark ? 'dark' : 'light', reducedMotion: opts.reduced ? 'reduce' : 'no-preference',
    });
    const p = await context.newPage();
    await p.addInitScript(({ token, id }) => {
      localStorage.setItem('pg_auth', JSON.stringify({ token, owner: `dev:${id}`, exp: Date.now() + 86_400_000 }));
    }, { token: u.token, id });
    return { u, id, context, p, url: (path: string) => `${base}${path}${path.includes('?') ? '&' : '?'}devUser=${id}` };
  };
  const ready = async (p: Page) => {
    await p.locator('[data-illustrated-map]').waitFor({ timeout: 30_000 });
    await p.waitForFunction(() => (document.querySelector('.map-art') as HTMLImageElement | null)?.complete, undefined, { timeout: 20_000 });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(500);
  };
  const cardState = (p: Page) => p.locator('[data-map-card]').evaluate((el) => ({ key: el.getAttribute('data-map-card'), state: el.getAttribute('data-state'), text: (el as HTMLElement).innerText }));
  const noHScroll = (p: Page) => p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
  const choose = async (p: Page, key: string) => {
    await p.locator(`[data-spot="${key}"]`).focus();
    await p.keyboard.press('Enter');
    await p.waitForTimeout(450);
  };

  try {
    for (const width of WIDTHS) {
      const { u, context, p, url } = await open(width);
      const journey = (await u.call('GET', '/api/journey')).body as { currentCityId: string; nextLesson: { id: string } | null; cities: { id: string; slug: string; order: number; unlocked: boolean; routes: { lessons: { id: string }[] }[] }[] };
      const current = journey.cities.find((c) => c.id === journey.currentCityId)!;
      await p.goto(url('/map'));
      await ready(p);
      const tag = `${width}px`;

      // 1–2. Первый кадр
      const a0 = await alignment(p);
      checkAligned(`${tag} первый кадр`, a0);
      const all = a0.spots.every((s) => s.label.length > 3);
      check(all, `${tag}: у каждой кнопки города есть aria-label (${a0.spots.slice(0, 3).map((s) => s.label).join(' | ')} …)`);
      const here = await p.locator('[data-map-here]').evaluate((el) => {
        const r = el.getBoundingClientRect();
        const card = document.querySelector('[data-map-card]')!.getBoundingClientRect();
        const hud = document.querySelector('.map-hud')!.getBoundingClientRect();
        return { key: el.getAttribute('data-map-here'), inWindow: r.top > hud.bottom - 20 && r.bottom < card.top };
      });
      check(MAP_SPOTS[here.key ?? '']?.city === current.slug && here.inWindow, `${tag}: «ты здесь» на текущем городе ${current.slug} и в видимом окне`);
      const layout = await p.evaluate(() => {
        const card = document.querySelector('[data-map-card]')!.getBoundingClientRect();
        const nav = document.querySelector('nav')!.getBoundingClientRect();
        const screen = document.querySelector('[data-map-screen]')!.getBoundingClientRect();
        return { cardBottom: card.bottom, navTop: nav.top, screenBottom: screen.bottom, cardH: card.height, vh: innerHeight };
      });
      check(layout.cardBottom <= layout.navTop + 1 && layout.cardH < layout.vh * 0.25, `${tag}: карточка над навигацией (низ ${Math.round(layout.cardBottom)} ≤ ${Math.round(layout.navTop)}) и не на полэкрана (${Math.round(layout.cardH)} px)`);
      check(await noHScroll(p), `${tag}: нет горизонтальной прокрутки`);
      const c0 = await cardState(p);
      check(c0.state === 'current' && /Продолжить|Повторить/.test(c0.text), `${tag}: карточка текущего города с кнопкой «Продолжить» (${c0.key})`);
      await p.screenshot({ path: `${OUT}/map-${width}.png` });

      // Перетаскивание мышью
      const box = (await p.locator('[data-illustrated-map]').boundingBox())!;
      const cx = box.x + box.width / 2;
      const cy = box.y + box.height / 2;
      await p.mouse.move(cx, cy);
      await p.mouse.down();
      for (let i = 1; i <= 10; i++) await p.mouse.move(cx - i * 9, cy - i * 14);
      await p.mouse.up();
      await p.waitForTimeout(700);
      const a1 = await alignment(p);
      check(a1.transform !== a0.transform, `${tag}: перетаскивание двигает карту`);
      checkAligned(`${tag} после перетаскивания`, a1);

      // Кнопки масштаба
      await p.getByRole('button', { name: 'Масштаб +' }).click();
      await p.waitForTimeout(500);
      const a2 = await alignment(p);
      check(a2.scale > a1.scale * 1.2, `${tag}: «+» увеличивает (${a1.scale.toFixed(2)} → ${a2.scale.toFixed(2)})`);
      checkAligned(`${tag} после «+»`, a2);
      for (let i = 0; i < 6; i++) await p.getByRole('button', { name: 'Масштаб −' }).click({ force: true }).catch(() => {});
      await p.waitForTimeout(500);
      check(await p.getByRole('button', { name: 'Масштаб −' }).isDisabled(), `${tag}: «−» упирается в минимум (карта всегда закрывает экран)`);
      const a3 = await alignment(p);
      checkAligned(`${tag} на минимальном масштабе`, a3);

      // Колесо мыши
      await p.mouse.move(cx, cy);
      await p.mouse.wheel(0, -400);
      await p.waitForTimeout(300);
      const a4 = await alignment(p);
      check(a4.scale > a3.scale, `${tag}: колесо увеличивает вокруг курсора (${a3.scale.toFixed(2)} → ${a4.scale.toFixed(2)})`);
      checkAligned(`${tag} после колеса`, a4);

      // Щипок двумя пальцами (настоящие touch-события через CDP)
      const cdp = await context.newCDPSession(p);
      const pts = (d: number) => [{ x: cx - d, y: cy, id: 1 }, { x: cx + d, y: cy, id: 2 }];
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pts(30) });
      for (let i = 1; i <= 12; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pts(30 + i * 6) });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await p.waitForTimeout(400);
      const a5 = await alignment(p);
      check(a5.scale > a4.scale * 1.3, `${tag}: щипок двумя пальцами увеличивает (${a4.scale.toFixed(2)} → ${a5.scale.toFixed(2)})`);
      checkAligned(`${tag} после щипка`, a5);
      // Перетаскивание пальцем
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx, y: cy, id: 3 }] });
      for (let i = 1; i <= 8; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: cx + i * 12, y: cy + i * 10, id: 3 }] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await p.waitForTimeout(700);
      const a6 = await alignment(p);
      check(a6.transform !== a5.transform, `${tag}: палец двигает карту`);
      checkAligned(`${tag} после пальца`, a6);
      check(await noHScroll(p), `${tag}: после жестов нет горизонтальной прокрутки и страница не уехала`);
      await p.screenshot({ path: `${OUT}/map-zoomed-${width}.png` });

      // 4. Перетаскивание, начатое на городе, город не выбирает
      await p.getByRole('button', { name: 'К моему городу' }).click();
      await p.waitForTimeout(600);
      const other = journey.cities.sort((x, y) => x.order - y.order)[1];
      const otherKey = Object.keys(MAP_SPOTS).find((k) => MAP_SPOTS[k].city === other.slug)!;
      const ob = (await p.locator(`[data-spot="${otherKey}"]`).boundingBox())!;
      await p.mouse.move(ob.x + ob.width / 2, ob.y + ob.height / 2);
      await p.mouse.down();
      for (let i = 1; i <= 6; i++) await p.mouse.move(ob.x + ob.width / 2 + i * 10, ob.y + ob.height / 2 + i * 6);
      await p.mouse.up();
      await p.waitForTimeout(300);
      check((await cardState(p)).key !== otherKey, `${tag}: перетаскивание с ${otherKey} не выбирает город`);

      // 3. Закрытый город: нажатие пальцем показывает требование, перехода нет; сервер не даёт начать урок
      for (let i = 0; i < 6; i++) await p.getByRole('button', { name: 'Масштаб −' }).click({ force: true }).catch(() => {});
      await p.getByRole('button', { name: 'К моему городу' }).click();
      await p.waitForTimeout(600);
      const tb = (await p.locator(`[data-spot="${otherKey}"]`).boundingBox())!;
      await p.touchscreen.tap(tb.x + tb.width / 2, tb.y + tb.height / 2);
      await p.waitForTimeout(400);
      const lc = await cardState(p);
      check(lc.key === otherKey && lc.state === (other.unlocked ? 'open' : 'locked'), `${tag}: нажатие на ${other.slug} выбирает его (${lc.state})`);
      if (!other.unlocked) {
        check(await p.locator('[data-map-card] [data-map-go]').count() === 0 && /Откроется после/.test(lc.text), `${tag}: у закрытого ${other.slug} нет кнопки урока, есть требование («${lc.text.split('\n').slice(-2).join(' ')}»)`);
        const lockedLesson = other.routes[0]?.lessons[0]?.id;
        if (lockedLesson) {
          const r = await u.call('POST', '/api/sessions', { lessonId: lockedLesson });
          check(r.status === 403 && r.body.error === 'lesson_locked', `${tag}: сервер отказывает в уроке закрытого города (${r.status} ${r.body.error})`);
        }
        await p.locator('[data-map-card] [data-map-details]').click();
        await p.locator('[role="dialog"]').waitFor({ timeout: 10_000 });
        check(await p.locator('[role="dialog"] [data-city-go]').count() === 0, `${tag}: в шторке закрытого города нет кнопки «К урокам»`);
        await p.keyboard.press('Escape');
        await p.waitForTimeout(400);
      }

      // 6. Sopot и Закопане
      await choose(p, 'sopot');
      const sp = await cardState(p);
      check(sp.key === 'sopot' && sp.state === 'none' && /не этап маршрута/i.test(sp.text), `${tag}: Sopot честно объясняет, что этапа нет`);
      await p.locator('[data-map-card] button', { hasText: 'Gdańsk' }).click();
      await p.waitForTimeout(500);
      check((await cardState(p)).key === 'gdansk', `${tag}: из Sopot — переход к Gdańsk`);
      await choose(p, 'zakopane');
      const zk = await cardState(p);
      check(zk.key === 'zakopane' && /Zakopane/.test(zk.text) && await p.locator('.map-pill').count() === 1, `${tag}: Закопане — свой маркер на карте и карточка (${zk.state})`);
      await p.screenshot({ path: `${OUT}/map-zakopane-${width}.png` });

      // 9. Длинное название
      await choose(p, 'gorzow');
      const fits = await p.locator('[data-map-card]').evaluate((el) => el.scrollWidth <= el.clientWidth + 1 && el.getBoundingClientRect().right <= innerWidth);
      check(fits, `${tag}: «Gorzów Wielkopolski» не ломает карточку`);
      await p.screenshot({ path: `${OUT}/map-gorzow-${width}.png` });

      // 5. Клавиатура
      await p.locator('[data-illustrated-map]').focus();
      const t0 = (await alignment(p)).transform;
      // От Gorzów (левый край карты) — вглубь: вправо и вниз.
      await p.keyboard.press('ArrowRight');
      await p.keyboard.press('ArrowDown');
      await p.waitForTimeout(450);
      check((await alignment(p)).transform !== t0, `${tag}: стрелки двигают карту`);
      const s0 = (await alignment(p)).scale;
      await p.keyboard.press('+');
      await p.waitForTimeout(450);
      check((await alignment(p)).scale > s0, `${tag}: клавиша + увеличивает`);
      await p.keyboard.press('0');
      await p.waitForTimeout(450);
      await p.keyboard.press('Tab');
      const first = await p.evaluate(() => (document.activeElement as HTMLElement | null)?.dataset.spot);
      check(MAP_SPOTS[first ?? '']?.city === journey.cities.sort((x, y) => x.order - y.order)[0].slug, `${tag}: Tab ведёт к первому городу маршрута (${first})`);
      await p.keyboard.press('Tab');
      const second = await p.evaluate(() => (document.activeElement as HTMLElement | null)?.dataset.spot);
      await p.keyboard.press('Enter');
      await p.waitForTimeout(400);
      check((await cardState(p)).key === second, `${tag}: Enter на кнопке города выбирает его (${second})`);
      checkAligned(`${tag} после клавиатуры`, await alignment(p));

      // 4. «Продолжить» — настоящий урок
      await p.getByRole('button', { name: 'К моему городу' }).click();
      await p.waitForTimeout(500);
      await p.locator('[data-map-card] [data-map-go]').click();
      await p.waitForURL(/\/lesson\//, { timeout: 15_000 });
      const lessonId = new URL(p.url()).pathname.split('/').pop();
      check(lessonId === journey.nextLesson?.id, `${tag}: «Продолжить» открывает следующий урок с сервера (${lessonId})`);
      await context.close();
    }

    // 7. Путешествие с reduced-motion
    {
      const { u, context, p, url } = await open(390, 844, { reduced: true });
      const j = (await u.call('GET', '/api/journey')).body as { cities: { id: string; slug: string; order: number }[] };
      const [a, b] = [...j.cities].sort((x, y) => x.order - y.order);
      await p.goto(url(`/map?travel=${a.id},${b.id}`));
      await p.locator('[data-map-traveler][data-arrived]').waitFor({ timeout: 20_000 });
      const at = await p.locator('[data-map-traveler]').getAttribute('data-at');
      const key = Object.keys(MAP_SPOTS).find((k) => MAP_SPOTS[k].city === b.slug)!;
      const want = mapStarPoint(MAP_SPOTS[key]).map(Math.round).join(',');
      check(at === want, `путешествие ${a.slug} → ${b.slug} (reduced-motion): маркер сразу в конечном городе (${at} = ${want})`);
      check((await cardState(p)).key === key, `путешествие: карточка показывает город прибытия`);
      await p.screenshot({ path: `${OUT}/map-travel-390.png` });
      await context.close();
    }

    // 8. Медленная сеть и без сети
    {
      const { context, p, url } = await open(390);
      await p.route(/poland-map.*\.webp/, async (route) => { await new Promise((r) => setTimeout(r, 2500)); await route.continue(); });
      await p.goto(url('/map'));
      await p.locator('[data-map-card]').waitFor({ timeout: 30_000 });
      const before = await p.locator('[data-map-card]').boundingBox();
      const lqip = await p.locator('.map-stage').evaluate((el) => getComputedStyle(el).backgroundImage.startsWith('url("data:image/webp'));
      const loading = await p.locator('.map-art').evaluate((el) => !(el as HTMLImageElement).complete || (el as HTMLImageElement).naturalWidth === 0);
      await p.screenshot({ path: `${OUT}/map-slow-390.png` });
      await ready(p);
      const after = await p.locator('[data-map-card]').boundingBox();
      check(lqip && loading, `медленная сеть: пока картинка грузится, видна размытая копия (загрузка ${loading ? 'идёт' : 'уже завершилась'})`);
      check(before && after && Math.abs(before.y - after.y) < 1 && Math.abs(before.height - after.height) < 1, `медленная сеть: после загрузки картинки карточка не сдвинулась (${before?.y} → ${after?.y})`);
      await context.setOffline(true);
      await p.getByRole('button', { name: 'Масштаб +' }).click();
      await choose(p, 'krakow');
      check((await cardState(p)).key === 'krakow', 'без сети: карта масштабируется и города выбираются (данные уже загружены)');
      await p.screenshot({ path: `${OUT}/map-offline-390.png` });
      await context.close();
    }

    // 9. Тёмная тема и альбомная ориентация
    {
      const { context, p, url } = await open(390, 844, { dark: true });
      await p.goto(url('/map'));
      await ready(p);
      checkAligned('тёмная тема 390', await alignment(p));
      await p.screenshot({ path: `${OUT}/map-dark-390.png` });
      await context.close();
      const land = await open(844, 390);
      await land.p.goto(land.url('/map'));
      await ready(land.p);
      checkAligned('альбомная 844×390', await alignment(land.p));
      check(await noHScroll(land.p), 'альбомная 844×390: нет горизонтальной прокрутки');
      const win = await land.p.evaluate(() => document.querySelector('[data-map-card]')!.getBoundingClientRect().top - document.querySelector('.map-hud')!.getBoundingClientRect().bottom);
      check(win > 40, `альбомная 844×390: между шапкой и карточкой остаётся окно карты (${Math.round(win)} px)`);
      await land.p.screenshot({ path: `${OUT}/map-landscape-844.png` });
      await land.context.close();
    }
  } finally {
    await browser.close();
    await stand.stop();
  }
  console.log(failures.length ? `\nОШИБОК: ${failures.length}\n${failures.map((f) => `- ${f}`).join('\n')}` : '\nкарта: всё ок');
  process.exit(failures.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
