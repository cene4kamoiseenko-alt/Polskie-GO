/**
 * Все задания приложения целиком (владельцем 2026-11-07: «всё ли работает чётко на все задания»), в настоящем браузере.
 *
 *   node --import tsx scripts/all-exercises-check.ts            → test-results/all-exercises/report.json
 *
 * Берёт ВСЕ задания из базы (уроки всех городов, экзамены, входной тест, практика: ~1750) в том виде, в каком их получает клиент
 * (`toPublicItem`), и рисует теми же компонентами, что экран урока, в dev-галерее (/__gallery?ex&inject) на 360 и 390 px. Для каждого задания:
 *   · нет поля ввода и ряда кнопок с польскими буквами (одиночная буква в паре или плашке — содержимое урока, не ввод);
 *   · задания SENTENCE_TRANSLATION и DICTATION — слова-плашки, GRAMMAR — выбор формы;
 *   · слово в плашке-ответе стоит по центру (допуск 2 px), буква варианта не заезжает на слово;
 *   · нет горизонтальной прокрутки и кнопок за краем экрана.
 * Реплики диалогов (плашка с переводом под текстом) и карточки с картинкой устроены иначе и в проверке центровки не участвуют.
 * Chromium, а не Telegram на iPhone / Android.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { chromiumPath, startStand } from './lib/stand';

const root = process.cwd();
const require = createRequire(root + '/package.json');
const OUT = resolve(root, 'test-results/all-exercises');
const CHUNK = 90;

const failures: string[] = [];
const check = (ok: unknown, what: string) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) failures.push(what);
};

type Card = { id: string; type: string; fields: number; letters: number; tiles: boolean; choice: boolean; options: { text: string; offset: number; overlap: boolean }[]; offscreen: string[] };

/** Строка-выражение, не функция: tsx добавляет в функции `__name`, а в странице его нет. */
const PROBE = `(() => {
  const vw = window.innerWidth;
  const cards = [];
  for (const card of document.querySelectorAll('[data-check-item]')) {
    const id = card.getAttribute('data-check-item');
    const options = [];
    for (const b of card.querySelectorAll('button.option')) {
      if (b.querySelector('div, img')) continue; // реплики диалога и карточки с картинкой
      const spans = Array.from(b.children).filter((c) => c.tagName === 'SPAN');
      const word = spans.length ? spans[spans.length - 1] : b;
      const badge = spans.length > 1 ? spans[0] : null;
      const range = document.createRange();
      range.selectNodeContents(word);
      const t = range.getBoundingClientRect();
      const r = b.getBoundingClientRect();
      const k = badge ? badge.getBoundingClientRect() : null;
      options.push({
        text: (word.textContent || '').trim().slice(0, 30),
        offset: Math.round(((t.left + t.right) / 2 - (r.left + r.right) / 2) * 10) / 10,
        // Карточка с картинкой (flex-col): картинка над словом, а не рядом, на слово она не заезжает.
        overlap: !b.classList.contains('flex-col') && !!k && k.right > t.left - 2 && k.left < t.right,
      });
    }
    const offscreen = [];
    for (const b of card.querySelectorAll('button')) {
      const r = b.getBoundingClientRect();
      if (r.width && (r.left < -1 || r.right > vw + 1)) offscreen.push((b.textContent || '').trim().slice(0, 24));
    }
    cards.push({
      id,
      type: id.slice(id.lastIndexOf(':') + 1),
      fields: card.querySelectorAll('textarea, input:not([type=hidden])').length,
      // Ряд букв ввода — обычные кнопки; одиночная буква в плашке-ответе или в паре («ł» ↔ «как w») — содержимое урока.
      letters: Array.from(card.querySelectorAll('button')).filter((b) => !b.classList.contains('option') && !b.hasAttribute('data-pair') && /^[ąćęłńóśźż]$/i.test((b.textContent || '').trim())).length,
      tiles: !!card.querySelector('[data-sentence-tiles]'),
      choice: !!card.querySelector('[data-grammar-choice]'),
      options,
      offscreen,
    });
  }
  return { cards, scrollW: document.documentElement.scrollWidth };
})()`;

async function main() {
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });
  const stand = await startStand({ ui: 'dev' });
  const { getEnv } = await import(root + '/apps/server/test/helpers.ts');
  const { toPublicItem, seededRandom } = await import(root + '/packages/shared/src/index.ts');
  const { env } = await getEnv();
  const rows = (await env.DB.prepare('select id, type, skill, data from exercises order by id').all()).results as { id: string; type: string; skill: string; data: string }[];
  const items = rows.map((r) => toPublicItem({ key: r.id, exerciseId: r.id, type: r.type, skill: r.skill, data: JSON.parse(r.data) }, seededRandom(7)));
  const byType: Record<string, number> = {};
  for (const i of items) byType[i.type] = (byType[i.type] ?? 0) + 1;
  console.log(`заданий в базе: ${items.length}`, JSON.stringify(byType));
  const groups: { lesson: string; city: string; items: unknown[] }[] = [];
  for (let i = 0; i < items.length; i += CHUNK) groups.push({ lesson: `c${i / CHUNK}`, city: 'warszawa', items: items.slice(i, i + CHUNK) });

  const { chromium } = require('playwright') as typeof import('playwright');
  const browser = await chromium.launch({ headless: true, executablePath: chromiumPath(chromium), args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const pageErrors: string[] = [];
  const problems: string[] = [];
  const typeSeen: Record<string, number> = {};
  let tilesTotal = 0;
  let centred = 0;
  try {
    for (const width of [360, 390]) {
      const context = await browser.newContext({ viewport: { width, height: 800 }, deviceScaleFactor: 1, locale: 'ru-RU' });
      const page = await context.newPage();
      page.on('pageerror', (e) => pageErrors.push(e.message));
      for (const g of groups) {
        await page.addInitScript((data) => { (window as unknown as { __PG_ITEMS__: unknown }).__PG_ITEMS__ = data; }, [g]);
        await page.goto(`${stand.base}/__gallery?ex&inject&lang=ru`);
        await page.locator('[data-check-item]').first().waitFor({ timeout: 60_000 });
        await page.evaluate('document.fonts.ready');
        await page.waitForTimeout(1200);
        const res = (await page.evaluate(PROBE)) as { cards: Card[]; scrollW: number };
        if (res.cards.length !== g.items.length) problems.push(`${width}px ${g.lesson}: нарисовано ${res.cards.length} из ${g.items.length}`);
        if (res.scrollW > width + 1) problems.push(`${width}px ${g.lesson}: горизонтальная прокрутка ${res.scrollW} > ${width}`);
        for (const c of res.cards) {
          typeSeen[c.type] = (typeSeen[c.type] ?? 0) + (width === 360 ? 1 : 0);
          if (c.fields) problems.push(`${width}px ${c.id}: есть поле ввода`);
          if (c.letters) problems.push(`${width}px ${c.id}: есть ряд польских букв`);
          if ((c.type === 'SENTENCE_TRANSLATION' || c.type === 'DICTATION') && !c.tiles) problems.push(`${width}px ${c.id}: нет слов-плашек`);
          if (c.type === 'GRAMMAR' && !c.choice) problems.push(`${width}px ${c.id}: нет выбора формы`);
          for (const o of c.options) {
            tilesTotal++;
            if (Math.abs(o.offset) <= 2) centred++;
            else problems.push(`${width}px ${c.id}: «${o.text}» смещено на ${o.offset} px от центра плашки`);
            if (o.overlap) problems.push(`${width}px ${c.id}: буква варианта заезжает на «${o.text}»`);
          }
          for (const b of c.offscreen) problems.push(`${width}px ${c.id}: кнопка за краем экрана «${b}»`);
        }
      }
      await context.close();
    }
  } finally {
    await browser.close();
    await stand.stop();
  }
  writeFileSync(`${OUT}/report.json`, JSON.stringify({ total: items.length, byType, problems }, null, 1));
  check(items.length > 1500, `заданий проверено: ${items.length}`);
  for (const t of Object.keys(byType)) check(typeSeen[t] === byType[t], `${t}: нарисовано ${typeSeen[t] ?? 0} из ${byType[t]}`);
  check(tilesTotal > 1000 && centred === tilesTotal, `плашек-ответов по центру: ${centred} из ${tilesTotal}`);
  const shown = problems.slice(0, 30);
  check(problems.length === 0, `замечаний: ${problems.length}${shown.length ? '\n  ' + shown.join('\n  ') : ''}`);
  check(pageErrors.length === 0, `без ошибок страницы${pageErrors.length ? ': ' + pageErrors.slice(0, 3).join(' | ') : ''}`);
  console.log(failures.length ? `\nПровалено: ${failures.length}` : '\nВсе проверки пройдены');
  process.exit(failures.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
