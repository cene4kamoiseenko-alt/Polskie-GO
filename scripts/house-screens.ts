/**
 * «Домик Бобека» с жильём (2026-11-02, пакет владельца: Opole / Łódź / Kraków / Warszawa) в реальном браузере (Chromium, не Telegram на iPhone / Android).
 *
 *   node --import tsx scripts/house-screens.ts   → test-results/house-screens/*.png
 *
 * 1. Новый игрок: выбрана бесплатная комната в Ополе, сцена загружена и закрывает кадр 3 : 2 (Бобёр нарисован в картинке, поверх ничего не рисуется), четыре карточки
 *    с обложками, остальные закрыты («Не хватает N»), нет горизонтальной прокрутки; 320 / 390 / 430.
 * 2. Игрок с деньгами: «Купить» открывает подтверждение с ценой и остатком, «Отмена» ничего не меняет, подтверждение списывает ровно цену и переселяет Бобра
 *    (фон меняется, карточка «Выбрано»), после перезагрузки выбор сохраняется; вернуться в бесплатную комнату и обратно можно без повторной покупки.
 * 3. Вещи из магазина (мебель, сувениры) показываются полосой под комнатой, а не стикерами поверх фона; пустой список — подсказка.
 * 5. Интерьер прямо в домике: мебель и декор с ценами, «Купить» → подтверждение → вещь в комнате (полоса «В комнате»), «Убрать» и «Поставить» без повторной покупки,
 *    без денег — «Не хватает N», сувениры — условие награды вместо цены; кнопка «Обустроить» ведёт к разделу, а не в магазин.
 * 4. Сцены (читает / спит / работает / чай): у Ополя три (сцены «работает» нет), у остальных четыре; нажатие меняет картинку, выбор переживает перезагрузку
 *    и переносится в другую квартиру (если там есть такая сцена; иначе — сцена по времени суток); все 15 картинок открываются.
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
  const { cosmeticItems, gameWallets, userInventory } = await import(root + '/apps/server/src/db/schema.ts');
  const { eq, inArray } = await import('drizzle-orm');
  const stand = await startStand({ ui: 'dev' });
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: chromiumPath(chromium), args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const pageErrors: string[] = [];
  let devUser = 997600;

  async function userPage(size: [number, number], opts: { balance?: number; things?: boolean } = {}) {
    const u = await stand.login();
    await u.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A0', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: null });
    await u.call('PATCH', '/api/me/settings', { theme: 'dark', reducedMotion: false });
    if (opts.balance !== undefined) await db.update(gameWallets).set({ balance: opts.balance }).where(eq(gameWallets.userId, u.user.id));
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
      const want = hr >= 22 || hr < 6 ? 'sleep' : 'read';
      check((await u.page.locator('[data-house-room]').getAttribute('data-house-scene')) === want, `${tag}: сцена по времени суток — ${want}`);
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
      const note = await u.page.locator('[data-house-things]').innerText();
      check(/Покупай мебель/.test(note), `${tag}: пустая полоса вещей — подсказка (${note.replace(/\s+/g, ' ').slice(0, 50)})`);
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

    // ── 3. Вещи полосой, не стикерами ──
    {
      const u = await userPage([390, 844], { things: true });
      const tiles = await u.page.locator('[data-house-things] .card').count();
      check(tiles === 5, `390px: пять вещей (стартовая кровать и четыре добавленные) в полосе под комнатой (${tiles})`);
      const over = await u.page.locator('[data-house-room] > *:not(img)').count();
      check(over === 0, '390px: поверх сцены ничего нет — ни Бобра, ни стикеров мебели');
      await u.page.screenshot({ path: `${OUT}/house-things-390.png`, fullPage: true });
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

        // подпись у выбранной кнопки видна на русском; запоминание и перенос в другую квартиру
        await u.call('POST', '/api/inventory/equip', { itemId: idOf('housing-krakow'), equipped: true });
        await u.open();
        await u.page.locator('[data-house-scenes] [data-scene="work"]').click();
        await waitScene(u.page, 'housing-krakow', 'work');
        check(/Работает/.test(await u.page.locator('[data-house-scenes] [data-scene="work"]').innerText()), `${tag}: подпись «${LABEL.work}» видна`);
        await u.open();
        check((await sceneOf(u.page)) === 'work', `${tag}: после перезагрузки сцена та же`);
        await u.page.locator('[data-housing="housing-lodz"]').getByRole('button', { name: 'Выбрать' }).click();
        await u.page.waitForFunction(() => document.querySelector('[data-house-room]')?.getAttribute('data-house-room') === 'housing-lodz', null, { timeout: 15_000 });
        await waitScene(u.page, 'housing-lodz', 'work');
        check((await imgSrc(u.page)).includes('housing-lodz-work'), `${tag}: выбор «работает» перешёл в другую квартиру`);
        // в Ополе «работает» нет — берётся сцена по времени суток, кнопки «работает» тоже нет
        await u.page.locator('[data-housing="housing-opole"]').getByRole('button', { name: 'Выбрать' }).click();
        await u.page.waitForFunction(() => document.querySelector('[data-house-room]')?.getAttribute('data-house-room') === 'housing-opole', null, { timeout: 15_000 });
        const hr = new Date().getHours();
        const fallback = hr >= 22 || hr < 6 ? 'sleep' : 'read';
        await waitScene(u.page, 'housing-opole', fallback);
        check((await sceneOf(u.page)) === fallback && (await u.page.locator('[data-house-scenes] [data-scene="work"]').count()) === 0, `${tag}: в Ополе без сцены «работает» показана «${fallback}»`);
        await u.context.close();
      }
    }

    // ── 5. Интерьер в домике ──
    for (const [w, h] of SIZES) {
      const tag = `${w}px интерьер`;
      const u = await userPage([w, h], { balance: 150 });
      await u.page.getByRole('button', { name: 'Обустроить' }).click();
      await u.page.waitForTimeout(900);
      const top = await u.page.locator('[data-house-interior]').evaluate((e) => e.getBoundingClientRect().top);
      check(top >= -2 && top < h * 0.5 && u.page.url().includes('/house'), `${tag}: «Обустроить» прокручивает к интерьеру на том же экране (${Math.round(top)} px)`);
      const states = await u.page.locator('[data-interior]').evaluateAll((els) => Object.fromEntries(els.map((e) => [e.getAttribute('data-interior'), e.getAttribute('data-state')])));
      check(states['bed-basic'] === 'placed' && states['desk'] === 'buyable' && states['sofa'] === 'buyable' && states['bed-cozy'] === 'buyable', `${tag}: стартовая кровать в комнате, стол и диван можно купить (${states['bed-basic']}, ${states['desk']}, ${states['sofa']})`);
      check(['souvenir-syrenka', 'souvenir-dragon', 'souvenir-krasnal'].every((k) => states[k] === 'reward'), `${tag}: сувениры — награды (условие вместо цены)`);
      const rewardText = await u.page.locator('[data-interior="souvenir-syrenka"]').innerText();
      check(/экзамен/i.test(rewardText), `${tag}: у сувенира условие «Сдай экзамен города…» (${rewardText.replace(/\s+/g, ' ').slice(0, 50)})`);
      const desk = u.page.locator('[data-interior="desk"]');
      await desk.scrollIntoViewIfNeeded();
      await desk.getByRole('button').click();
      const sheet = u.page.locator('[data-sheet]');
      await sheet.waitFor({ timeout: 10_000 });
      check(/Купить в домик/.test(await sheet.innerText()), `${tag}: подтверждение покупки для домика`);
      await u.page.locator('[data-housing-confirm]').click();
      await u.page.waitForFunction(() => document.querySelector('[data-interior="desk"]')?.getAttribute('data-state') === 'placed', null, { timeout: 15_000 });
      const left = (await db.select().from(gameWallets).where(eq(gameWallets.userId, u.user.id)))[0].balance;
      check(left >= 50 && left <= 110, `${tag}: стол куплен за 100 и сразу в комнате (осталось ${left}; до +50 за достижение)`);
      check((await u.page.locator('[data-house-things] .card').count()) === 2, `${tag}: в полосе «В комнате» кровать и стол`);
      // без денег теперь диван (150) — «Не хватает»
      const sofaState = await u.page.locator('[data-interior="sofa"]').getAttribute('data-state');
      check(sofaState === 'locked' && /Не хватает/.test(await u.page.locator('[data-interior="sofa"]').innerText()), `${tag}: на диван не хватает — подпись «Не хватает» (${sofaState})`);
      // убрать и поставить — без повторной покупки
      await desk.getByRole('button', { name: 'Убрать' }).click();
      await u.page.waitForFunction(() => document.querySelector('[data-interior="desk"]')?.getAttribute('data-state') === 'owned', null, { timeout: 15_000 });
      check((await u.page.locator('[data-house-things] .card').count()) === 1, `${tag}: «Убрать» — стол ушёл из комнаты, покупка осталась`);
      await desk.getByRole('button', { name: 'Поставить' }).click();
      await u.page.waitForFunction(() => document.querySelector('[data-interior="desk"]')?.getAttribute('data-state') === 'placed', null, { timeout: 15_000 });
      const left2 = (await db.select().from(gameWallets).where(eq(gameWallets.userId, u.user.id)))[0].balance;
      check(left2 === left, `${tag}: «Поставить» денег не тратит (${left} → ${left2})`);
      check(await u.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${tag}: нет горизонтальной прокрутки`);
      if (w === 390) await u.page.screenshot({ path: `${OUT}/interior-${w}.png`, fullPage: true });
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
