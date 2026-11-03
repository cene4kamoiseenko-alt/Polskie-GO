/**
 * «Домик Бобека» с жильём (2026-11-02, пакет владельца: Opole / Łódź / Kraków / Warszawa) в реальном браузере (Chromium, не Telegram на iPhone / Android).
 *
 *   node --import tsx scripts/house-screens.ts   → test-results/house-screens/*.png
 *
 * 1. Новый игрок: выбрана бесплатная комната в Ополе, сцена загружена и закрывает кадр 3 : 2 (Бобёр нарисован в картинке, поверх ничего не рисуется), четыре карточки
 *    с обложками, остальные закрыты («Не хватает N»), нет горизонтальной прокрутки; 320 / 390 / 430.
 * 2. Игрок с деньгами: «Купить» открывает подтверждение с ценой и остатком, «Отмена» ничего не меняет, подтверждение списывает ровно цену и переселяет Бобра
 *    (фон меняется, карточка «Выбрано»), после перезагрузки выбор сохраняется; вернуться в бесплатную комнату и обратно можно без повторной покупки.
 * 3. Домашний бонус (2026-11-03): без цели дня — «Бобек ждёт урок», полоска XP и «К уроку»; цель выполнена — сцена «чай», «Забрать +5» → +5 Złotki ровно один раз,
 *    затем «Бонус получен»; у каждой квартиры подпись «+N в день за цель».
 * 4. Сцены (читает / спит / работает / чай): у Ополя три (сцены «работает» нет), у остальных четыре; нажатие меняет картинку; все 15 картинок открываются.
 * 5. Главная: карточка домика — фото квартиры, статус дня, значок бонуса, когда его можно забрать, прогресс накопления на следующую квартиру; нажатие ведёт в домик.
 * Интерьера в домике больше нет (владелец 2026-11-03).
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromiumPath, startStand } from './lib/stand';

const root = process.cwd();
const require = createRequire(root + '/package.json');
const OUT = resolve(root, 'test-results/house-screens');
const SIZES: [number, number][] = [[320, 640], [390, 844], [430, 932]];

const failures: string[] = [];
const check = (ok: unknown, what: string) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) failures.push(what);
};

async function main() {
  const { chromium } = require('playwright') as typeof import('playwright');
  const { db } = await import(root + '/apps/server/src/db/index.ts');
  const { cosmeticItems, dailyActivity, gameWallets, userInventory, userSettings } = await import(root + '/apps/server/src/db/schema.ts');
  const { dayKey } = await import(root + '/packages/shared/src/index.ts');
  const { eq, inArray } = await import('drizzle-orm');
  const stand = await startStand({ ui: 'dev' });
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: chromiumPath(chromium), args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const pageErrors: string[] = [];
  let devUser = 997600;

  async function userPage(size: [number, number], opts: { balance?: number; things?: boolean; goalDone?: boolean } = {}) {
    const u = await stand.login();
    await u.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A0', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: null });
    await u.call('PATCH', '/api/me/settings', { theme: 'dark', reducedMotion: false });
    if (opts.balance !== undefined) await db.update(gameWallets).set({ balance: opts.balance }).where(eq(gameWallets.userId, u.user.id));
    if (opts.goalDone) {
      // Цель дня выполнена: 50 XP за сегодня (цель 10 минут), день — по часовому поясу игрока, как на сервере.
      const tz = (await db.select().from(userSettings).where(eq(userSettings.userId, u.user.id)))[0]?.timezone ?? 'Europe/Warsaw';
      const day = dayKey(new Date(), tz);
      await db.insert(dailyActivity).values({ userId: u.user.id, day, xp: 50 }).onConflictDoUpdate({ target: [dailyActivity.userId, dailyActivity.day], set: { xp: 50 } });
    }
    if (opts.things) {
      const rows = await db.select({ id: cosmeticItems.id }).from(cosmeticItems).where(inArray(cosmeticItems.slug, ['bed-cozy', 'desk', 'plant', 'souvenir-syrenka']));
      for (const r of rows) await db.insert(userInventory).values({ userId: u.user.id, itemId: r.id, equipped: true, source: 'qa' }).onConflictDoNothing();
    }
    const id = String(++devUser);
    const context = await browser.newContext({ viewport: { width: size[0], height: size[1] }, deviceScaleFactor: 2, locale: 'ru-RU' });
    const page = await context.newPage();
    page.on('pageerror', (e) => pageErrors.push(e.message));
    await page.addInitScript(({ token, id }) => localStorage.setItem('pg_auth', JSON.stringify({ token, owner: `dev:${id}`, exp: Date.now() + 86_400_000 })), { token: u.token, id });
    const open = async () => {
      await page.goto(`${stand.base}/house?devUser=${id}`);
      await page.locator('[data-house-room] > img').waitFor({ timeout: 30_000 });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(900);
    };
    await open();
    return { ...u, page, context, open, id };
  }
  const box = (p: import('playwright').Page, sel: string, nth = 0) =>
    p.locator(sel).nth(nth).evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height, r: r.right, b: r.bottom };
    });
  const loaded = (p: import('playwright').Page, sel: string) => p.locator(sel).first().evaluate((el: HTMLImageElement) => ({ ok: el.complete && el.naturalWidth > 0, src: el.currentSrc.split('/').pop() || '' }));
  const home = (p: import('playwright').Page) => p.locator('[data-house-room]').first().getAttribute('data-house-room');
  const states = (p: import('playwright').Page) => p.locator('[data-housing]').evaluateAll((els) => els.map((e) => `${e.getAttribute('data-housing')}:${e.getAttribute('data-state')}`));

  try {
    // ── 1. Новый игрок ──
    for (const [w, h] of SIZES) {
      const tag = `${w}px /house`;
      const u = await userPage([w, h]);
      check((await home(u.page)) === 'housing-opole', `${tag}: выбрана бесплатная комната в Ополе`);
      const im = await loaded(u.page, '[data-house-room] > img');
      check(im.ok && /housing-opole-(read|sleep)/.test(im.src), `${tag}: сцена комнаты загружена (${im.src})`);
      const room = await box(u.page, '[data-house-room]');
      const bg = await box(u.page, '[data-house-room] > img');
      check(Math.abs(bg.w - room.w) < 9 && Math.abs(bg.h - room.h) < 9 && Math.abs(room.w / room.h - 1.5) < 0.06, `${tag}: фон закрывает кадр 3 : 2 (${Math.round(room.w)}×${Math.round(room.h)})`);
      check((await u.page.locator('[data-house-bobek]').count()) === 0, `${tag}: поверх картинки Бобёр не рисуется (он уже в кадре)`);
      const hr = new Date().getHours();
      // Цель дня не выполнена: ночью спит, днём ждёт урок (в Ополе сцены «работает» нет — читает).
      const want = hr >= 22 || hr < 6 ? 'sleep' : 'read';
      check((await u.page.locator('[data-house-room]').getAttribute('data-house-scene')) === want, `${tag}: сцена дня — ${want}`);
      check((await u.page.locator('[data-house-interior], [data-house-things]').count()) === 0, `${tag}: интерьера больше нет`);
      await u.page.locator('[data-housing]').last().scrollIntoViewIfNeeded();
      await u.page.waitForTimeout(700);
      const thumbs = await u.page.locator('[data-housing] img[loading="lazy"]').evaluateAll((els) => els.map((e) => (e as HTMLImageElement).naturalWidth > 0));
      check(thumbs.length === 4 && thumbs.every(Boolean), `${tag}: у четырёх карточек обложки загружены (${thumbs.length})`);
      const st = await states(u.page);
      check(st.join() === 'housing-opole:selected,housing-lodz:locked,housing-krakow:locked,housing-warszawa:locked', `${tag}: четыре карточки, остальные закрыты (${st.join(', ')})`);
      const need = await u.page.locator('[data-housing="housing-lodz"]').innerText();
      check(/Не хватает\s+2\s?500/.test(need.replace(/ /g, ' ')), `${tag}: у закрытой квартиры видно, чего не хватает (${need.replace(/\s+/g, ' ').slice(0, 60)})`);
      const free = await u.page.locator('[data-housing="housing-opole"]').innerText();
      check(/Бесплатно/.test(free) && /Выбрано/.test(free), `${tag}: у бесплатной комнаты «Бесплатно» и «Выбрано»`);
      const bonus = u.page.locator('[data-house-bonus]');
      await bonus.waitFor({ timeout: 10_000 });
      check((await bonus.getAttribute('data-house-bonus')) === 'locked' && /Домашний бонус: \+5/.test(await bonus.innerText()) && (await bonus.getByRole('button', { name: 'К уроку' }).count()) === 1, `${tag}: бонус закрыт до цели дня, есть «К уроку»`);
      const perDay = await u.page.locator('[data-housing-bonus]').allInnerTexts();
      check(perDay.length === 4 && /\+5/.test(perDay[0]) && /\+40/.test(perDay[3]), `${tag}: у квартир подпись бонуса (${perDay.join(' | ')})`);
      check(await u.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${tag}: нет горизонтальной прокрутки`);
      await u.page.screenshot({ path: `${OUT}/house-${w}.png`, fullPage: true });
      await u.context.close();
    }

    // ── 2. Покупка, переезд, сохранение ──
    for (const [w, h] of SIZES) {
      const tag = `${w}px покупка`;
      const u = await userPage([w, h], { balance: 3000 });
      const card = u.page.locator('[data-housing="housing-lodz"]');
      check((await card.getAttribute('data-state')) === 'buyable', `${tag}: на 3000 Złotki kawalerka доступна к покупке`);
      await card.getByRole('button', { name: 'Купить' }).click();
      const sheet = u.page.locator('[data-sheet]');
      await sheet.waitFor({ timeout: 10_000 });
      const txt = (await sheet.innerText()).replace(/ /g, ' ');
      check(/Kawalerka w Łodzi/.test(txt) && /2\s?500/.test(txt) && /500/.test(txt), `${tag}: подтверждение называет квартиру, цену 2 500 и остаток 500 (${txt.replace(/\s+/g, ' ').slice(0, 90)})`);
      if (w === 390) await u.page.screenshot({ path: `${OUT}/house-confirm-${w}.png` });
      await sheet.getByRole('button', { name: 'Отмена' }).click();
      await u.page.waitForTimeout(500);
      check((await home(u.page)) === 'housing-opole' && (await card.getAttribute('data-state')) === 'buyable', `${tag}: «Отмена» ничего не меняет`);
      const walletBefore = (await db.select().from(gameWallets).where(eq(gameWallets.userId, u.user.id)))[0].balance;
      check(walletBefore === 3000, `${tag}: деньги на месте после отмены (${walletBefore})`);

      await card.getByRole('button', { name: 'Купить' }).click();
      await u.page.locator('[data-housing-confirm]').click();
      await u.page.waitForFunction(() => document.querySelector('[data-house-room]')?.getAttribute('data-house-room') === 'housing-lodz', null, { timeout: 15_000 });
      await u.page.waitForTimeout(700);
      const im = await loaded(u.page, '[data-house-room] > img');
      check(im.ok && /housing-lodz-/.test(im.src), `${tag}: Бобёр переехал, сцена сменилась (${im.src})`);
      check((await states(u.page)).join() === 'housing-opole:owned,housing-lodz:selected,housing-krakow:locked,housing-warszawa:locked', `${tag}: состояния после покупки (${(await states(u.page)).join(', ')})`);
      const left = (await db.select().from(gameWallets).where(eq(gameWallets.userId, u.user.id)))[0].balance;
      check(left >= 500 && left <= 560, `${tag}: списано ровно 2 500 (осталось ${left}; до +50 за достижение «Модник»)`);
      if (w === 390) await u.page.screenshot({ path: `${OUT}/house-bought-${w}.png`, fullPage: true });

      // перезагрузка: выбор и покупка на месте
      await u.open();
      check((await home(u.page)) === 'housing-lodz', `${tag}: после перезагрузки комната та же`);
      // назад в бесплатную и снова в купленную — без повторной покупки
      await u.page.locator('[data-housing="housing-opole"]').getByRole('button', { name: 'Выбрать' }).click();
      await u.page.waitForFunction(() => document.querySelector('[data-house-room]')?.getAttribute('data-house-room') === 'housing-opole', null, { timeout: 15_000 });
      await u.page.locator('[data-housing="housing-lodz"]').getByRole('button', { name: 'Выбрать' }).click();
      await u.page.waitForFunction(() => document.querySelector('[data-house-room]')?.getAttribute('data-house-room') === 'housing-lodz', null, { timeout: 15_000 });
      const left2 = (await db.select().from(gameWallets).where(eq(gameWallets.userId, u.user.id)))[0].balance;
      check(left2 === left, `${tag}: переключение туда и обратно денег не тратит (${left} → ${left2})`);
      check(await u.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${tag}: нет горизонтальной прокрутки`);
      await u.context.close();
    }

    // ── 3. Домашний бонус ──
    {
      const tag = '390px бонус';
      const u = await userPage([390, 844], { goalDone: true, balance: 0 });
      const bonus = u.page.locator('[data-house-bonus]');
      await bonus.waitFor({ timeout: 10_000 });
      check((await bonus.getAttribute('data-house-bonus')) === 'ready', `${tag}: цель дня выполнена — бонус можно забрать`);
      const hr = new Date().getHours();
      const want = hr >= 22 || hr < 6 ? 'sleep' : 'tea';
      check((await u.page.locator('[data-house-room]').getAttribute('data-house-scene')) === want, `${tag}: сцена дня — ${want} (Бобек отдыхает)`);
      await u.page.screenshot({ path: `${OUT}/bonus-ready-390.png`, fullPage: true });
      await u.page.locator('[data-house-claim]').evaluate((b: HTMLButtonElement) => { b.click(); b.click(); });
      await u.page.waitForFunction(() => document.querySelector('[data-house-bonus]')?.getAttribute('data-house-bonus') === 'claimed', null, { timeout: 15_000 });
      const wallet = (await db.select().from(gameWallets).where(eq(gameWallets.userId, u.user.id)))[0].balance;
      check(wallet === 5, `${tag}: двойной тап «Забрать» — ровно +5 (баланс ${wallet})`);
      check(/получен/.test(await bonus.innerText()), `${tag}: «Бонус за сегодня получен»`);
      await u.open();
      check((await u.page.locator('[data-house-bonus]').getAttribute('data-house-bonus')) === 'claimed', `${tag}: после перезагрузки — получен`);
      await u.context.close();
    }

    // ── 4. Сцены ──
    {
      const SCENES_OF: Record<string, string[]> = { 'housing-opole': ['read', 'sleep', 'tea'], 'housing-lodz': ['read', 'sleep', 'work', 'tea'], 'housing-krakow': ['read', 'sleep', 'work', 'tea'], 'housing-warszawa': ['read', 'sleep', 'work', 'tea'] };
      const LABEL: Record<string, string> = { read: 'Читает', sleep: 'Спит', work: 'Работает', tea: 'Пьёт чай' };
      for (const [w, h] of SIZES) {
        const tag = `${w}px сцены`;
        const u = await userPage([w, h], { balance: 20_000 });
        const shop = (await u.call('GET', '/api/shop')).body as { items: { id: string; slug: string }[] };
        const idOf = (slug: string) => shop.items.find((i) => i.slug === slug)!.id;
        for (const slug of ['housing-lodz', 'housing-krakow', 'housing-warszawa']) {
          const r = await u.call('POST', '/api/shop/buy', { itemId: idOf(slug) });
          if (r.status !== 200) throw new Error(`покупка ${slug}: ${r.status} ${JSON.stringify(r.body)}`);
        }

        const sceneOf = (p: import('playwright').Page) => p.locator('[data-house-room]').getAttribute('data-house-scene');
        const imgSrc = (p: import('playwright').Page) => p.locator('[data-house-room] > img').evaluate((e: HTMLImageElement) => e.currentSrc.split('/').pop() || '');
        const waitScene = (p: import('playwright').Page, slug: string, scene: string) =>
          p.waitForFunction(({ slug, scene }) => { const i = document.querySelector('[data-house-room] > img') as HTMLImageElement | null; return !!i && i.complete && i.naturalWidth > 0 && i.currentSrc.includes(`${slug}-${scene}`); }, { slug, scene }, { timeout: 15_000 });

        let okAll = true;
        const seen: string[] = [];
        for (const slug of Object.keys(SCENES_OF)) {
          check((await u.call('POST', '/api/inventory/equip', { itemId: idOf(slug), equipped: true })).status === 200, `${tag}: ${slug}: выбор принят сервером`);
          await u.open();
          const chips = await u.page.locator('[data-house-scenes] [data-scene]').evaluateAll((els) => els.map((e) => e.getAttribute('data-scene')));
          check(chips.join() === SCENES_OF[slug].join(), `${tag}: ${slug}: переключатель показывает ${SCENES_OF[slug].join('/')} (${chips.join('/')})`);
          for (const scene of SCENES_OF[slug]) {
            await u.page.locator(`[data-house-scenes] [data-scene="${scene}"]`).click();
            try { await waitScene(u.page, slug, scene); } catch { okAll = false; }
            const pressed = await u.page.locator(`[data-house-scenes] [data-scene="${scene}"]`).getAttribute('aria-pressed');
            if ((await sceneOf(u.page)) !== scene || pressed !== 'true') okAll = false;
            seen.push(`${slug}-${scene}`);
          }
          if (w === 390) await u.page.screenshot({ path: `${OUT}/scenes-${slug}-${w}.png`, fullPage: true });
          check(await u.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${tag}: ${slug}: нет горизонтальной прокрутки`);
        }
        check(okAll && seen.length === 15, `${tag}: все ${seen.length} сцен открываются, кнопка и кадр соответствуют выбору`);

        // подпись у выбранной кнопки видна на русском
        check(/Работает/.test(await u.page.locator('[data-house-scenes] [data-scene="work"]').innerText()), `${tag}: подпись «${LABEL.work}» видна`);
        await u.context.close();
      }
    }

    // ── 5. Карточка домика на главной ──
    for (const [w, h] of SIZES) {
      const tag = `${w}px главная`;
      const u = await userPage([w, h], { goalDone: true, balance: 1200 });
      await u.page.goto(`${stand.base}/?devUser=${u.id}`);
      const card = u.page.locator('[data-home-house]');
      await card.waitFor({ timeout: 30_000 });
      await card.scrollIntoViewIfNeeded();
      await u.page.waitForTimeout(1200);
      const im = await card.locator('img').first().evaluate((el: HTMLImageElement) => ({ ok: el.complete && el.naturalWidth > 0, src: el.currentSrc.split('/').pop() || '' }));
      check(im.ok && /housing-opole-/.test(im.src), `${tag}: в карточке фото квартиры (${im.src})`);
      check((await card.locator('[data-home-house-bonus]').count()) === 1 && /\+5/.test(await card.locator('[data-home-house-bonus]').innerText()), `${tag}: значок «+5» — бонус можно забрать`);
      const txt = (await card.innerText()).replace(/\s+/g, ' ');
      check(/Pokój w Opolu/.test(txt) && /Копим на Kawalerka w Łodzi: 1 200 \/ 2 500/.test(txt.replace(/ /g, ' ')), `${tag}: название квартиры и накопление (${txt.slice(0, 110)})`);
      const b = await card.evaluate((e) => { const r = e.getBoundingClientRect(); return { x: r.x, r: r.right }; });
      check(b.x >= 0 && b.r <= w + 1 && (await u.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)), `${tag}: карточка в кадре, нет горизонтальной прокрутки`);
      if (w === 390) await card.screenshot({ path: `${OUT}/home-card-${w}.png` });
      await card.click();
      await u.page.waitForURL(/\/house/, { timeout: 10_000 });
      check(/\/house/.test(u.page.url()), `${tag}: нажатие ведёт в домик`);
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
