/**
 * «Живые» миссии и уроки (docs/superpowers/specs/2026-11-24-living-missions-design.md, вариант А) в браузере: настоящий сервер стенда,
 * Chromium на 320 / 390 / 430 px, светлая и тёмная тема.
 *  · Вступление миссии: картинка места всегда растровая (своя сцена, кадр пропуска, обложка сезона, библиотека), поверх нет второго Бобека.
 *
 * Запуск: node --import tsx scripts/living-check.ts   → test-results/living/<экран>-<ширина>.png
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromiumPath, startStand } from './lib/stand';

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
