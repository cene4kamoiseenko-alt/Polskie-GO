/**
 * E2E-перевірка основного сценарію в браузері (Playwright):
 * онбординг → перший урок (усі типи вправ) → результати → головна, карта, квести, профіль.
 * Потрібні запущені сервер (DEV_AUTH=true) і Mini App: npm run dev
 * Запуск: npm run e2e   (BASE_URL=http://localhost:5173 за замовчуванням)
 */
const { chromium } = require('playwright');

const BASE = process.env.BASE_URL ?? 'http://localhost:5173';
const user = String(900000 + Math.floor(Math.random() * 99999));

function assert(cond, msg) {
  if (!cond) throw new Error(`E2E FAILED: ${msg}`);
  console.log(`  ✓ ${msg}`);
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const click = async (sel, t = 5000) => {
    await page.click(sel, { timeout: t });
    await page.waitForTimeout(350);
  };

  console.log(`E2E user ${user} → ${BASE}`);
  await page.goto(`${BASE}/?devUser=${user}`, { waitUntil: 'networkidle' });
  assert(await page.isVisible('text=POLSKI'), 'онбординг відкрився');
  await click('text=Почати');
  for (let i = 0; i < 5; i++) await click('button.btn-primary');
  await click('button.btn-red');
  await page.waitForTimeout(1200);
  assert(await page.isVisible('text=Нові слова'), 'відкрилось пояснення першого уроку');
  await click('text=Почати →');

  // Проходимо всі вправи (відповіді можуть бути неправильними — перевіряємо сам сценарій).
  for (let guard = 0; guard < 60; guard++) {
    if (await page.isVisible('text=/Урок пройдено|Майже вийшло|Ідеально/')) break;
    const next = page.locator('button:has-text("Далі")');
    if ((await next.count()) && (await next.first().isEnabled())) {
      await click('button:has-text("Далі")');
      continue;
    }
    if (await page.isVisible('text=Не можу зараз говорити')) {
      await click('text=Не можу зараз говорити');
      continue;
    }
    if (await page.isVisible('textarea')) {
      await page.fill('textarea', 'Dziękuję');
      await click('text=Перевірити');
      continue;
    }
    if (await page.isVisible('text=Натискай на слова')) {
      const tokens = page.locator('div.flex.flex-wrap.justify-center button:not([disabled])');
      while ((await tokens.count()) > 0) await tokens.first().click();
      await click('text=Перевірити');
      continue;
    }
    if (await page.isVisible('text=Обери слово ліворуч')) {
      const left = page.locator('.grid.grid-cols-2 > div:first-child button');
      const right = page.locator('.grid.grid-cols-2 > div:last-child button');
      const n = await left.count();
      for (let k = 0; k < n; k++) {
        await left.nth(k).click();
        await right.nth(k).click();
      }
      await click('text=Перевірити');
      continue;
    }
    const opts = page.locator('button.option:not([disabled])');
    if (await page.isVisible('text=Перевірити')) {
      await opts.first().click();
      await click('text=Перевірити');
      continue;
    }
    // Діалог: пробуємо варіанти, поки сервер не прийме правильний.
    const n = await opts.count();
    for (let k = 0; k < n; k++) {
      await opts.nth(k).click().catch(() => {});
      await page.waitForTimeout(1000);
      if ((await opts.count()) !== n) break;
    }
    await page.waitForTimeout(1200);
  }
  await page.waitForTimeout(1500);
  assert(await page.isVisible('text=/Урок пройдено|Майже вийшло|Ідеально/'), 'показано результати уроку');
  await click('button:has-text("Продовжити")');
  await page.waitForTimeout(1200);
  assert(await page.isVisible('text=Мета дня'), 'головний екран після уроку');
  for (const [path, text] of [
    ['/map', 'Подорож Польщею'],
    ['/quests', 'Щоденні'],
    ['/profile', 'Рівень польської'],
    ['/dictionary', 'Польсько-український словник'],
    ['/shop', 'Гардероб'],
  ]) {
    await page.goto(`${BASE}${path}?devUser=${user}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    assert(await page.isVisible(`text=${text}`), `екран ${path}`);
  }
  assert(errors.length === 0, `без JS-помилок${errors.length ? ': ' + errors.join('; ') : ''}`);
  await browser.close();
  console.log('E2E OK');
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
