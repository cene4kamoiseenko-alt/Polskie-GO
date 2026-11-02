/**
 * «Домик Бобека» с жильём (2026-11-02, пакет владельца: Opole / Łódź / Kraków / Warszawa) в реальном браузере (Chromium, не Telegram на iPhone / Android).
 *
 *   node --import tsx scripts/house-screens.ts   → test-results/house-screens/*.png
 *
 * 1. Новый игрок: выбрана бесплатная комната в Ополе, фон загружен и закрывает кадр 2 : 1, Бобёр в кадре, четыре карточки, остальные закрыты
 *    («Не хватает N»), нет горизонтальной прокрутки; 320 / 390 / 430.
 * 2. Игрок с деньгами: «Купить» открывает подтверждение с ценой и остатком, «Отмена» ничего не меняет, подтверждение списывает ровно цену и переселяет Бобра
 *    (фон меняется, карточка «Выбрано»), после перезагрузки выбор сохраняется; вернуться в бесплатную комнату и обратно можно без повторной покупки.
 * 3. Вещи из магазина (мебель, сувениры) показываются полосой под комнатой, а не стикерами поверх фона; пустой список — подсказка.
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
      check(im.ok && /housing-opole/.test(im.src), `${tag}: фон комнаты загружен (${im.src})`);
      const room = await box(u.page, '[data-house-room]');
      const bg = await box(u.page, '[data-house-room] > img');
      check(Math.abs(bg.w - room.w) < 9 && Math.abs(bg.h - room.h) < 9 && Math.abs(room.w / room.h - 2) < 0.08, `${tag}: фон закрывает кадр 2 : 1 (${Math.round(room.w)}×${Math.round(room.h)})`);
      const bob = await u.page.locator('[data-house-bobek]').evaluate((e) => { const r = e.getBoundingClientRect(); const p = (e.parentElement as HTMLElement).getBoundingClientRect(); return { inside: r.x >= p.x && r.right <= p.right && r.y >= p.y - 1 && r.bottom <= p.bottom + 1, h: r.height }; });
      check(bob.inside && bob.h > 60, `${tag}: Бобёр целиком в кадре комнаты (высота ${Math.round(bob.h)})`);
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
      check(im.ok && /housing-lodz/.test(im.src), `${tag}: Бобёр переехал, фон сменился (${im.src})`);
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
      const over = await u.page.locator('[data-house-room] .-translate-y-full').count();
      check(over === 1, '390px: поверх фона только Бобёр, стикеров мебели нет');
      await u.page.screenshot({ path: `${OUT}/house-things-390.png`, fullPage: true });
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
