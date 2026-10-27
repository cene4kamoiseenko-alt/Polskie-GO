/**
 * Новые уроки Wrocław 5–16, Katowice 5–13, Opole 5–10 на узких экранах (Chromium, не Telegram).
 *
 *   node --import tsx scripts/lesson-render-check.ts
 *
 * 1. Через API (как apps/server/test/expansion-suite.ts) открывает город, проходит старые уроки, затем каждый новый:
 *    берёт его реальные задания из POST /api/sessions и проходит урок правильными ответами — так открывается следующий.
 * 2. Рисует все задания в dev-галерее (/__gallery?ex&inject) теми же компонентами, что экран урока (LessonStage +
 *    ExerciseView), на 320, 360, 390 и 430 px, языки ru и uk.
 * 3. Для каждого задания проверяет: нет горизонтальной прокрутки (и кто её даёт), текст не уходит за край контейнера
 *    с overflow hidden/clip и не обрезан многоточием, кнопки целиком в экране и не меньше 40 px, картинки загрузились.
 * Найдено и исправлено 2026-10-27: кнопка озвучки `sm` 36 px (стала 40), слово «рекомендований» в паре на 320 px
 * вылезало за кнопку и давало прокрутку (`.option` теперь переносит длинные слова).
 * Отчёт — test-results/lesson-render/report.json, снимки проблемных заданий — test-results/lesson-render/*.png.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { chromiumPath, startStand } from './lib/stand';

const root = process.cwd();
const require = createRequire(root + '/package.json');
const OUT = resolve(root, 'test-results/lesson-render');

const CITIES = [
  { city: 'wroclaw', old: ['wro-1-kawa', 'wro-2-zabka', 'wro-3-ceny', 'wro-4-restauracja'] },
  { city: 'katowice', old: ['kat-1-transport', 'kat-2-isc-jechac', 'kat-3-wiedziec-znac', 'kat-4-te-ta'] },
  { city: 'opole', old: ['opo-1-siema', 'opo-2-reakcje', 'opo-3-ogarniac', 'opo-4-nic-nikt'] },
];

type Lesson = { id: string; slug: string; kind: string };
type City = { slug: string; routes: { lessons: Lesson[] }[] };

async function main() {
  const stand = await startStand({ ui: 'dev' });
  const helpers = await import(root + '/apps/server/test/helpers.ts');
  const { db } = await import(root + '/apps/server/src/db/index.ts');
  const schema = await import(root + '/apps/server/src/db/schema.ts');
  const { resetRateLimits } = await import(root + '/apps/server/src/hono.ts');
  const { eq } = await import('drizzle-orm');
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });

  const groups: { lesson: string; city: string; items: unknown[] }[] = [];
  for (const cfg of CITIES) {
    const { call, user } = await stand.login();
    const city = (await db.query.cities.findFirst({ where: eq(schema.cities.slug, cfg.city) }))!;
    await db.insert(schema.userCities).values({ userId: user.id, cityId: city.id, source: 'journey' });
    const journey = async () => ((await call('GET', '/api/journey')).body.cities as City[]).find((c) => c.slug === cfg.city)!;
    const lessons = (await journey()).routes.flatMap((r) => r.lessons).filter((l) => l.kind === 'LESSON');
    for (const l of lessons) {
      resetRateLimits();
      const s = await call('POST', '/api/sessions', { lessonId: l.id });
      if (s.status !== 200) throw new Error(`${l.slug}: ${s.status} ${JSON.stringify(s.body)}`);
      if (!cfg.old.includes(l.slug)) groups.push({ lesson: l.slug, city: cfg.city, items: s.body.items });
      const done = await helpers.playSession(call, s.body.sessionId);
      if (done.status !== 200) throw new Error(`${l.slug}: finish ${done.status}`);
    }
  }
  writeFileSync(`${OUT}/items.json`, JSON.stringify(groups));
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  console.log(`уроков: ${groups.length}, заданий: ${total}`);

  const { chromium } = require('playwright') as typeof import('playwright');
  const browser = await chromium.launch({ headless: true, executablePath: chromiumPath(chromium), args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const problems: { width: number; lang: string; item: string; issue: string }[] = [];
  const checked: Record<string, number> = {};
  try {
    for (const lang of ['ru', 'uk']) {
      for (const width of [320, 360, 390, 430]) {
        const context = await browser.newContext({ viewport: { width, height: 800 }, deviceScaleFactor: 1, locale: `${lang}-RU` });
        const p = await context.newPage();
        await p.addInitScript((data) => {
          (window as unknown as { __PG_ITEMS__: unknown }).__PG_ITEMS__ = data;
        }, groups);
        await p.goto(`${stand.base}/__gallery?ex&inject&lang=${lang}`);
        await p.locator('[data-check-item]').first().waitFor({ timeout: 30_000 });
        await p.evaluate(() => document.fonts.ready);
        await p.waitForTimeout(1500);
        const res = await p.evaluate(() => {
          const out: { item: string; issue: string }[] = [];
          const vw = window.innerWidth;
          const cards = [...document.querySelectorAll<HTMLElement>('[data-check-item]')];
          for (const card of cards) {
            const id = card.dataset.checkItem!;
            for (const img of card.querySelectorAll<HTMLImageElement>('img')) {
              if (img.complete && img.naturalWidth === 0) out.push({ item: id, issue: `картинка не загрузилась: ${img.getAttribute('src')}` });
            }
            for (const el of card.querySelectorAll<HTMLElement>('*')) {
              const cs = getComputedStyle(el);
              if (cs.display === 'none' || cs.visibility === 'hidden') continue;
              const r = el.getBoundingClientRect();
              if (r.width === 0 || r.height === 0) continue;
              const clips = ['hidden', 'clip'].includes(cs.overflowX);
              // Контейнер с overflow hidden/clip: тревога, только если за его край уходит элемент с собственным текстом
              // (декор — значки, облака, Бобек на краю сцены — подрезается намеренно).
              if (clips && el.scrollWidth > el.clientWidth + 2) {
                const box = el.getBoundingClientRect();
                for (const t of el.querySelectorAll<HTMLElement>('*')) {
                  const own = [...t.childNodes].some((n) => n.nodeType === 3 && (n.textContent ?? '').trim());
                  if (!own) continue;
                  const tr = t.getBoundingClientRect();
                  if (tr.width && (tr.right > box.right + 1 || tr.left < box.left - 1)) {
                    out.push({ item: id, issue: `текст обрезан краем: «${(t.textContent ?? '').trim().slice(0, 40)}» в <${el.tagName.toLowerCase()} class="${String(el.className).slice(0, 60)}">` });
                    break;
                  }
                }
              }
              if (cs.textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth + 1) out.push({ item: id, issue: `многоточие: «${(el.innerText ?? '').trim().slice(0, 40)}»` });
              if (el.tagName === 'BUTTON' || el.getAttribute('role') === 'button') {
                if (r.left < -1 || r.right > vw + 1) out.push({ item: id, issue: `кнопка за краем экрана: «${(el.innerText ?? el.getAttribute('aria-label') ?? '').trim().slice(0, 30)}» ${Math.round(r.left)}..${Math.round(r.right)}` });
                if (r.height < 40 && r.width < 40) out.push({ item: id, issue: `кнопка меньше 40 px: «${(el.innerText ?? el.getAttribute('aria-label') ?? '').trim().slice(0, 30)}» ${Math.round(r.width)}×${Math.round(r.height)}` });
              }
            }
          }
          const hscroll = document.documentElement.scrollWidth > vw + 1;
          if (hscroll) {
            // Виновник прокрутки: самые глубокие элементы, выходящие за правый край (в карточке задания или вне её).
            const wide = [...document.body.querySelectorAll<HTMLElement>('*')].filter((el) => el.getBoundingClientRect().right > vw + 1);
            const deepest = wide.filter((el) => !wide.some((o) => o !== el && el.contains(o)));
            for (const el of deepest.slice(0, 6)) {
              const card = el.closest<HTMLElement>('[data-check-item]');
              out.push({ item: card?.dataset.checkItem ?? '*', issue: `шире экрана: <${el.tagName.toLowerCase()} class="${String(el.className).slice(0, 80)}"> «${(el.innerText ?? '').trim().slice(0, 40)}» right=${Math.round(el.getBoundingClientRect().right)}` });
            }
          }
          return { cards: cards.length, out, hscroll };
        });
        checked[`${lang}-${width}`] = res.cards;
        if (res.hscroll) problems.push({ width, lang, item: '*', issue: 'горизонтальная прокрутка страницы' });
        for (const o of res.out) problems.push({ width, lang, ...o });
        // Снимки заданий с проблемами (до 12 на прогон).
        const bad = [...new Set(res.out.map((o) => o.item))].slice(0, 12);
        for (const id of bad) {
          const el = p.locator(`[data-check-item="${id}"]`);
          await el.scrollIntoViewIfNeeded();
          await el.screenshot({ path: `${OUT}/${lang}-${width}-${id.replace(/[^a-z0-9-]+/gi, '_')}.png` });
        }
        console.log(`${lang} ${width}px: заданий ${res.cards}, замечаний ${res.out.length}${res.hscroll ? ', ГОРИЗОНТАЛЬНАЯ ПРОКРУТКА' : ''}`);
        await context.close();
      }
    }
  } finally {
    await browser.close();
    await stand.stop();
  }
  writeFileSync(`${OUT}/report.json`, `${JSON.stringify({ lessons: groups.map((g) => ({ lesson: g.lesson, items: g.items.length })), checked, problems }, null, 2)}\n`);
  const byIssue = new Map<string, number>();
  for (const pr of problems) byIssue.set(pr.issue.replace(/\d+/g, '#'), (byIssue.get(pr.issue.replace(/\d+/g, '#')) ?? 0) + 1);
  console.log(problems.length ? `\nЗАМЕЧАНИЙ: ${problems.length}\n${[...byIssue].slice(0, 30).map(([k, n]) => `- ${n}× ${k}`).join('\n')}` : '\nзамечаний нет');
  process.exit(problems.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
