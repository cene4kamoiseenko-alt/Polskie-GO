/**
 * «Живые» миссии и уроки (docs/superpowers/specs/2026-11-24-living-missions-design.md, вариант А) в браузере: настоящий сервер стенда,
 * Chromium на 320 / 390 / 430 px, светлая и тёмная тема.
 *  · Вступление миссии: картинка места всегда растровая (своя сцена, кадр пропуска, обложка сезона, библиотека), поверх нет второго Бобека.
 *  · Шаг миссии: картинка места сверху на каждом шаге (та же), облачко реплики на её нижнем крае, скрытая реплика не видна до ответа,
 *    Бобек — в панели ответа (верно и ошибка), на 320×568 варианты и «Проверить» без прокрутки, «меньше анимаций» — без приближения
 *    картинки и конфетти, картинка не загрузилась — шаг проходим, доступность (axe) без нарушений.
 *  · Урок города: картинка по теме маршрута из библиотеки (первый урок Варшавы — «разговор»), без накладного Бобека, одна на весь урок,
 *    высота clamp(176px, 28vh, 240px), медленно приближается, реагирует на ответ, «меньше анимаций» — без приближения, axe без нарушений.
 *
 * Запуск: node --import tsx scripts/living-check.ts   → test-results/living/<экран>-<ширина>.png
 */
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromiumPath, startStand } from './lib/stand';
import { MISSIONS } from '../apps/server/src/content/missions';

const AXE = readFileSync(createRequire(process.cwd() + '/package.json').resolve('axe-core/axe.min.js'), 'utf8');
const ZABKA = MISSIONS.find((m) => m.slug === 'zabka-first-order')!;
type Opt = { pl?: string; text?: { ru: string }; ok?: boolean };
const optText = (o: Opt) => o.pl ?? o.text!.ru;
const okOpt = (i: number) => optText((ZABKA.steps[i].options as Opt[]).find((o) => o.ok)!);
const badOpt = (i: number) => optText((ZABKA.steps[i].options as Opt[]).find((o) => !o.ok)!);

const root = process.cwd();
const require = createRequire(root + '/package.json');
const OUT = resolve(root, 'test-results/living');
const SIZES: [number, number][] = [[320, 568], [390, 844], [430, 932]];

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
  let devUser = 997500;
  try {
    for (const [width, height] of SIZES)
      for (const theme of ['light', 'dark'] as const) {
        const u = await stand.login();
        await u.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A0', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: null });
        await u.call('PATCH', '/api/me/settings', { theme });
        await u.call('POST', '/api/flags/tour', {});
        // Миссии сезонного пропуска — с Premium (запись в тестовую базу стенда, не оплата).
        await db.insert(subscriptions).values({ userId: u.user.id, planCode: 'MONTH_1', status: 'ACTIVE', startsAt: new Date(), expiresAt: new Date(Date.now() + 86_400_000), grantedByAdminId: 'qa-living' });
        const id = String(++devUser);
        const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, locale: 'ru-RU', colorScheme: theme });
        const p = await ctx.newPage();
        await p.addInitScript(({ token, id }) => localStorage.setItem('pg_auth', JSON.stringify({ token, owner: `dev:${id}`, exp: Date.now() + 86_400_000 })), { token: u.token, id });
        const tag = `${width}px ${theme}`;
        const settle = async () => {
          await p.waitForFunction(() => !document.querySelector('[data-skeleton]'), undefined, { timeout: 20_000 }).catch(() => {});
          await p.evaluate(() => document.fonts.ready);
          await p.waitForTimeout(700);
        };

        // Вступление: своя сцена (Żabka) и кадр пропуска (сезонная миссия ноября).
        for (const [slug, source] of [['zabka-first-order', 'own'], ['listopad-swieto', 'pass']] as const) {
          await p.goto(`${stand.base}/life/${slug}?devUser=${id}`);
          await p.locator('[data-mission-start]').waitFor({ timeout: 20_000 }).catch(() => {});
          if (!p.url().includes(`/life/${slug}`)) {
            check(false, `${tag} ${slug}: вступление не открылось (${p.url()})`);
            continue;
          }
          await settle();
          const hero = await p.evaluate(() => {
            const img = document.querySelector('img[data-scene-source]') as HTMLImageElement | null;
            return img ? { source: img.dataset.sceneSource, ok: img.complete && img.naturalWidth > 0, beaver: !!document.querySelector('[data-intro-beaver]') } : null;
          });
          check(hero?.ok && hero.source === source && !hero.beaver, `${tag} ${slug}: вступление — растровая картинка (${hero?.source ?? 'нет'}), без второго Бобека`);
          if (width === 390) await p.screenshot({ path: `${OUT}/intro-${slug}-${theme}.png` });
        }

        // ---------- Урок: картинка по теме маршрута ----------
        const lessonId = (await u.call('GET', '/api/journey')).body.nextLesson.id as string;
        const stageInfo = (sel: string) =>
          p.evaluate((sel) => {
            const el = document.querySelector(sel) as HTMLElement | null;
            const img = el?.querySelector('img') as HTMLImageElement | null;
            return {
              art: el?.dataset.stageArt ?? null,
              src: img?.getAttribute('src') ?? '',
              ok: !!img && img.complete && img.naturalWidth > 0,
              beaver: !!el?.querySelector('[data-stage-beaver]'),
              h: el?.getBoundingClientRect().height ?? 0,
              drift: document.getAnimations().some((a) => (a as CSSAnimation).animationName === 'stage-drift'),
              mood: el?.dataset.stageMood ?? null,
            };
          }, sel);
        await p.goto(`${stand.base}/lesson/${lessonId}?devUser=${id}`);
        await p.locator('[data-intro-stage]').waitFor({ timeout: 20_000 });
        await settle();
        const li = await stageInfo('[data-intro-stage]');
        check(li.art === 'library' && li.ok && li.src.includes('/library/') && !li.beaver, `${tag} урок, вступление: картинка библиотеки по теме маршрута (${li.art}), без накладного Бобека`);
        const ip = await p.evaluate(() => (document.querySelector('[data-intro-player]') as HTMLElement | null)?.getBoundingClientRect().width ?? 0);
        check(ip >= 110, `${tag} урок, вступление: Бобек игрока крупно рядом с картинкой (${Math.round(ip)} px)`);
        await p.getByRole('button', { name: /^Начать/ }).first().click();
        await p.locator('[data-stage-mood]').waitFor({ timeout: 15_000 });
        await settle();
        const ex = await stageInfo('[data-stage-mood]');
        const wantL = Math.min(240, Math.max(176, height * 0.28));
        check(ex.art === 'library' && ex.ok && ex.src === li.src && !ex.beaver, `${tag} урок, задание: та же картинка, без накладного Бобека`);
        check(Math.abs(ex.h - wantL) <= 1.5, `${tag} урок, задание: высота сцены ${Math.round(ex.h)} px (нужно ${Math.round(wantL)})`);
        // Вариант 2 владельца (2026-11-24): Бобек игрока в его образе — крупно (≥ 110 px), под картинкой, не поверх неё.
        const pl = await p.evaluate(() => {
          const el = document.querySelector('[data-stage-player]') as HTMLElement | null;
          const st = (document.querySelector('[data-stage-mood]') as HTMLElement).getBoundingClientRect();
          const r = el?.getBoundingClientRect();
          return { look: !!el?.querySelector('[data-look]'), w: r?.width ?? 0, below: !!r && r.top >= st.bottom - 1 };
        });
        check(pl.look && pl.w >= 110 && pl.below, `${tag} урок, задание: Бобек игрока в его образе крупно под картинкой (${Math.round(pl.w)} px)`);
        check(ex.drift, `${tag} урок, задание: картинка медленно приближается`);
        // Похвала за серию — золотая панель ответа внизу (scripts/combo-check.ts), поверх картинки ничего не всплывает.
        if (width === 390) await p.screenshot({ path: `${OUT}/lesson-${theme}.png` });
        // Картинка задания не пересоздаётся, пока меняется настроение сцены (выбрал вариант, проверил): иначе приближение начинается заново.
        await p.evaluate(() => ((document.querySelector('[data-stage-mood] img') as unknown as { __pgKeep?: number }).__pgKeep = 1));
        await p.locator('button.option').first().click();
        await p.waitForTimeout(300);
        const keptOnSelect = await p.evaluate(() => (document.querySelector('[data-stage-mood] img') as unknown as { __pgKeep?: number } | null)?.__pgKeep === 1);
        await p.getByRole('button', { name: /^Проверить/ }).first().click();
        await p.waitForTimeout(500);
        const keptOnCheck = await p.evaluate(() => (document.querySelector('[data-stage-mood] img') as unknown as { __pgKeep?: number } | null)?.__pgKeep === 1);
        check(keptOnSelect && keptOnCheck, `${tag} урок, задание: картинка та же при выборе и проверке ответа (не пересоздаётся)`);
        const after = await stageInfo('[data-stage-mood]');
        check(after.mood === 'correct' || after.mood === 'wrong', `${tag} урок, задание: сцена реагирует на ответ (${after.mood})`);
        await p.addScriptTag({ content: AXE });
        const lax = (await p.evaluate(async () => {
          const r = await (window as unknown as { axe: { run: (c: unknown, o: unknown) => Promise<{ violations: { id: string; nodes: unknown[] }[] }> } }).axe.run(
            { include: [['[data-stage-mood]']] },
            { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } },
          );
          return r.violations.map((v) => `${v.id}×${v.nodes.length}`);
        })) as string[];
        check(lax.length === 0, `${tag} урок: доступность сцены без нарушений${lax.length ? ` — ${lax.join(', ')}` : ''}`);

        // ---------- Шаг миссии (вариант А) ----------
        const stageSrc = () => p.evaluate(() => (document.querySelector('[data-mission-stage] img') as HTMLImageElement | null)?.getAttribute('src') ?? null);
        const option = (text: string) => p.locator('button.option', { hasText: text }).first();
        const startMission = async () => {
          await p.goto(`${stand.base}/life/zabka-first-order?devUser=${id}`);
          await p.locator('[data-mission-start]').click({ timeout: 20_000 });
          await p.locator('[data-mission-stage]').waitFor({ timeout: 15_000 });
          await settle();
        };
        await startMission();
        const st = await p.evaluate(() => {
          const stage = document.querySelector('[data-mission-stage]') as HTMLElement | null;
          const img = stage?.querySelector('img') as HTMLImageElement | null;
          const bubble = document.querySelector('[data-line-bubble]') as HTMLElement | null;
          const s = stage?.getBoundingClientRect();
          const b = bubble?.getBoundingClientRect();
          const drift = document.getAnimations().some((a) => (a as CSSAnimation).animationName === 'stage-drift');
          return {
            img: !!img && img.complete && img.naturalWidth > 0,
            h: s?.height ?? 0,
            overlap: !!s && !!b && b.top < s.bottom && b.bottom > s.bottom,
            stepBeaver: !!document.querySelector('[data-step-beaver]'),
            hiddenShown: document.body.innerText.includes('W czym mogę pomóc'),
            drift,
          };
        });
        // Высота картинки: clamp(190px, 34vh, 300px); на низком экране (≤ 700 px) — clamp(140px, 25vh, 180px).
        const wantH = height <= 700 ? Math.min(180, Math.max(140, height * 0.25)) : Math.min(300, Math.max(190, height * 0.34));
        check(st.img && Math.abs(st.h - wantH) <= 1.5, `${tag} шаг 1: картинка места над шагом (${Math.round(st.h)} px, нужно ${Math.round(wantH)})`);
        check(st.overlap, `${tag} шаг 1: облачко реплики на нижнем крае картинки`);
        check(!st.stepBeaver, `${tag} шаг 1: нет второго Бобека в заголовке шага`);
        check(!st.hiddenShown, `${tag} шаг 1: скрытая реплика не показана до ответа`);
        check(st.drift, `${tag} шаг 1: картинка медленно приближается`);
        const src1 = await stageSrc();
        if (width === 390) await p.screenshot({ path: `${OUT}/step1-${theme}.png` });
        // Ошибка → Бобек в панели, «попробовать ещё»; верно → Бобек в панели, реплика открыта.
        await option(badOpt(0)).click();
        await p.locator('[data-mission-check]').click();
        await p.locator('[data-feedback-beaver]').waitFor({ timeout: 10_000 });
        check(await p.locator('[data-feedback-beaver]').isVisible(), `${tag} шаг 1: ошибка — Бобек в панели ответа`);
        if (width === 390) await p.screenshot({ path: `${OUT}/step1-wrong-${theme}.png` });
        await p.locator('[data-mission-retry]').click();
        await option(okOpt(0)).click();
        await p.locator('[data-mission-check]').click();
        await p.locator('[data-mission-next]').waitFor({ timeout: 10_000 });
        await p.waitForTimeout(1300);
        check(await p.locator('[data-feedback-beaver]').isVisible(), `${tag} шаг 1: верно — Бобек в панели ответа`);
        check(await p.evaluate(() => document.body.innerText.includes('W czym mogę pomóc')), `${tag} шаг 1: после ответа реплика открыта`);
        if (width === 390) await p.screenshot({ path: `${OUT}/step1-correct-${theme}.png` });
        await p.locator('[data-mission-next]').click();
        await p.waitForTimeout(600);
        check((await stageSrc()) === src1, `${tag} шаг 2: та же картинка места`);
        // Шаг 2 (собери фразу) — ответ через API, затем продолжение с шага 3: 4 длинных варианта.
        const run = (await u.call('POST', '/api/missions/zabka-first-order/start', {})).body as { runId: string };
        await u.call('POST', `/api/missions/runs/${run.runId}/answer`, { step: 1, text: ZABKA.steps[1].answer });
        await startMission();
        const fit = await p.evaluate(() => {
          // Кнопка «Проверить» прибита к низу экрана: варианты должны кончаться выше её панели, а она сама — целиком в окне.
          const opts = [...document.querySelectorAll('button.option')] as HTMLElement[];
          const btn = document.querySelector('[data-mission-check]') as HTMLElement | null;
          const panelTop = btn ? btn.getBoundingClientRect().top : 0;
          const ok = !!btn && window.scrollY === 0 && btn.getBoundingClientRect().bottom <= window.innerHeight + 0.5 && opts.every((e) => e.getBoundingClientRect().bottom <= panelTop + 0.5);
          return { n: opts.length + 1, ok, last: Math.round(opts.at(-1)?.getBoundingClientRect().bottom ?? 0), panelTop: Math.round(panelTop) };
        });
        check(fit.n >= 4 && fit.ok, `${tag} шаг 3: ${fit.n - 1} варианта и «Проверить» видны без прокрутки (низ вариантов ${fit.last}, кнопка с ${fit.panelTop})`);
        check((await stageSrc()) === src1, `${tag} шаг 3: та же картинка места`);
        if (width === 390) await p.screenshot({ path: `${OUT}/step3-${theme}.png` });
        await p.addScriptTag({ content: AXE });
        const ax = (await p.evaluate(async () => {
          const r = await (window as unknown as { axe: { run: (c: unknown, o: unknown) => Promise<{ violations: { id: string; nodes: unknown[] }[] }> } }).axe.run(
            { include: [['[data-mission-stage]'], ['[data-mission-answers]']] },
            { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } },
          );
          return r.violations.map((v) => `${v.id}×${v.nodes.length}`);
        })) as string[];
        check(ax.length === 0, `${tag} шаг 3: доступность без нарушений${ax.length ? ` — ${ax.join(', ')}` : ''}`);

        if (width === 390) {
          // Картинка не загрузилась: сцена остаётся, «битой» картинки нет, ответить можно.
          await p.route('**/assets/{library,scenes}/**', (r) => r.abort());
          await startMission();
          const broken = await p.evaluate(() => {
            const img = document.querySelector('[data-mission-stage] img') as HTMLImageElement | null;
            const visibleBroken = !!img && img.naturalWidth === 0 && getComputedStyle(img).display !== 'none' && getComputedStyle(img).visibility !== 'hidden';
            return { stage: !!document.querySelector('[data-mission-stage]'), visibleBroken, options: document.querySelectorAll('button.option:not([disabled])').length };
          });
          check(broken.stage && !broken.visibleBroken && broken.options > 0, `${tag} картинка не загрузилась: сцена без «битой» картинки, шаг проходим`);
          await p.unroute('**/assets/{library,scenes}/**');
          // «Меньше анимаций»: без приближения картинки и без конфетти.
          await u.call('PATCH', '/api/me/settings', { reducedMotion: true });
          await startMission();
          await p.waitForTimeout(1500);
          check(!(await p.evaluate(() => document.getAnimations().some((a) => (a as CSSAnimation).animationName === 'stage-drift'))), `${tag} меньше анимаций: картинка не приближается`);
          await option(okOpt(2)).click();
          await p.locator('[data-mission-check]').click();
          await p.locator('[data-mission-next]').waitFor({ timeout: 10_000 });
          check((await p.locator('[data-confetti]').count()) === 0, `${tag} меньше анимаций: без конфетти`);
          // Урок уже начат выше: на вступлении «Продолжить» (или задания сразу, если вступления нет).
          await p.goto(`${stand.base}/lesson/${lessonId}?devUser=${id}`);
          await p.locator('[data-stage-mood], [data-intro-stage]').first().waitFor({ timeout: 20_000 });
          const go = p.getByRole('button', { name: /^(Начать|Продолжить)/ }).first();
          if (await go.count()) await go.click();
          await p.locator('[data-stage-mood]').waitFor({ timeout: 15_000 });
          await p.waitForTimeout(1500);
          check(!(await stageInfo('[data-stage-mood]')).drift, `${tag} меньше анимаций: картинка урока не приближается`);
        }
        await ctx.close();
      }
  } finally {
    await browser.close();
    await stand.stop();
  }
  console.log(failures.length ? `\nПРОВАЛОВ: ${failures.length}` : '\nвсе проверки пройдены');
  process.exit(failures.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
