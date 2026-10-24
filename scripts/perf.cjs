// Запуск: npm run build && npm run dev -w @polski-go/server, потім node scripts/perf.cjs
// Замір швидкодії Mini App (production-збірка через wrangler dev, +80 мс мережевої затримки на кожен API-запит).
const { chromium } = require('playwright');
const BASE = process.env.BASE_URL ?? 'http://localhost:8787';
const LAT = Number(process.env.LAT ?? 80);
const user = String(700000 + Math.floor(Math.random() * 99999));

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.route('**/api/**', async (r) => { await new Promise((s) => setTimeout(s, LAT)); await r.continue(); });
  let reqs = [];
  p.on('request', (r) => { if (r.url().includes('/api/')) reqs.push(r.method() + ' ' + r.url().replace(/^.*\/api/, '').split('?')[0]); });
  const out = {};
  const time = async (label, fn) => { reqs = []; const t = Date.now(); await fn(); out[label] = { ms: Date.now() - t, api: reqs.length, calls: [...reqs] }; };

  await time('cold_start_new_user', async () => {
    await p.goto(`${BASE}/?devUser=${user}`);
    await p.waitForSelector('text=Почати', { timeout: 20000 });
  });
  // онбординг
  await p.click('text=Почати');
  for (let i = 0; i < 5; i++) { await p.click('button.btn-primary'); await p.waitForTimeout(250); }
  await p.click('button.btn-red');
  await p.waitForSelector('text=Нові слова', { timeout: 15000 });
  await p.goto(`${BASE}/?devUser=${user}`);
  await p.waitForSelector('text=Мета дня', { timeout: 15000 });

  await time('reopen_to_home', async () => {
    await p.goto(`${BASE}/?devUser=${user}`);
    await p.waitForSelector('text=Мета дня', { timeout: 15000 });
  });
  const tab = (name, sel) => time(`tab_${name}`, async () => {
    await p.click(`nav >> text=${name}`);
    await p.waitForSelector(sel, { timeout: 15000 });
  });
  await tab('Карта', 'svg >> nth=3');
  await tab('Навчання', 'text=START');
  await tab('Квести', 'text=Квести >> nth=0');
  await tab('Профіль', 'text=/Рівень|Level/');
  await tab('Головна', 'text=Мета дня');
  await tab('Карта', 'svg >> nth=3');
  await tab('Головна', 'text=Мета дня');

  // Урок
  await time('lesson_open', async () => {
    await p.click('button.btn-red');
    await p.waitForSelector('text=Нові слова', { timeout: 15000 });
    await p.click('text=Почати →');
    await p.waitForSelector('button.option', { timeout: 15000 });
  });
  const answers = [];
  for (let i = 0; i < 4; i++) {
    const opt = p.locator('button.option:not([disabled])').first();
    if (!(await opt.count())) break;
    // Реакція на натискання всередині сторінки: від click() до наступного кадру після зміни DOM.
    const tPress = await p.evaluate(() => new Promise((res) => {
      const el = document.querySelector('button.option:not([disabled])');
      const t = performance.now();
      const mo = new MutationObserver(() => { mo.disconnect(); requestAnimationFrame(() => res(Math.round(performance.now() - t))); });
      mo.observe(document.body, { attributes: true, subtree: true, childList: true });
      el.click();
      setTimeout(() => res(-1), 2000);
    }));
    if (!(await p.isVisible('text=Перевірити'))) break;
    reqs = [];
    const t2 = Date.now();
    await p.click('text=Перевірити');
    await p.waitForSelector('button:has-text("Далі")', { timeout: 15000 });
    answers.push({ select_ms: tPress, check_ms: Date.now() - t2, api: reqs.length });
    await p.click('button:has-text("Далі")');
    await p.waitForTimeout(300);
  }
  out.lesson_answers = answers;
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})();
