/**
 * Ни в одном задании нет поля ввода и ряда польских букв (владелец 2026-11-07: «проверь все тесты, чтобы не было этих букв»), в настоящем браузере.
 *
 *   node --import tsx scripts/no-typing-check.ts   → test-results/no-typing/*.png
 *
 * Проходит тренировки («5 минут», «скорость», грамматика «być»), уроки с диктантом и переводом предложений, экзамен и входной тест на 360 и 390 px.
 * На каждом экране: нет <textarea> и <input>, нет кнопок с одной польской буквой, нет горизонтальной прокрутки. У перевода предложения и диктанта —
 * слова-плашки, верная сборка засчитывается сервером, перестановка слов — нет. Chromium, а не Telegram на iPhone / Android.
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromiumPath, startStand } from './lib/stand';

const root = process.cwd();
const require = createRequire(root + '/package.json');
const OUT = resolve(root, 'test-results/no-typing');
const failures: string[] = [];
const check = (ok: unknown, what: string) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) failures.push(what);
};

const EDGE = /^[.,!?;:"„”“«»…()\-–—]+|[.,!?;:"„”“«»…()\-–—]+$/g;
const words = (s: string) => s.trim().split(/\s+/).map((w) => w.replace(EDGE, '')).filter(Boolean);

/** Слова ответа целиком есть среди плашек на экране (с учётом повторов). */
const wordsFit = (want: string[], tokens: string[]) => {
  const pool = [...tokens];
  return want.every((w) => { const at = pool.indexOf(w); if (at < 0) return false; pool.splice(at, 1); return true; });
};

/** Строка-выражение, не функция: tsx добавляет в функции `__name`, а в странице его нет. */
const PROBE = `(() => ({
  fields: document.querySelectorAll('textarea, input:not([type=hidden])').length,
  letters: Array.from(document.querySelectorAll('button')).filter((b) => /^[ąćęłńóśźż]$/i.test((b.textContent || '').trim())).length,
  tokens: Array.from(document.querySelectorAll('[data-token]')).map((b) => (b.textContent || '').trim()),
  tilesBlock: !!document.querySelector('[data-sentence-tiles]'),
  scrollW: document.documentElement.scrollWidth,
}))()`;

type Probe = { fields: number; letters: number; tokens: string[]; tilesBlock: boolean; scrollW: number };

async function main() {
  const { chromium } = require('playwright') as typeof import('playwright');
  mkdirSync(OUT, { recursive: true });
  const stand = await startStand({ ui: 'dev' });
  const { getEnv } = await import(root + '/apps/server/test/helpers.ts');
  const { env } = await getEnv();
  // Уроки города закрыты для нового игрока, пока не открыт город: берём только те, что сервер открывает (200), а не 403 lesson_locked.
  const probe = await stand.login();
  await probe.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A0', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: null });
  const openable = async (ids: string[], n: number) => {
    const open: string[] = [];
    for (const id of ids) {
      if (open.length >= n) break;
      if ((await probe.call('POST', '/api/sessions', { lessonId: id })).status === 200) open.push(id);
    }
    return open;
  };
  const candidates = async (type: string) =>
    ((await env.DB.prepare("select distinct l.id from lessons l join exercises e on e.lesson_id = l.id where e.type = ? and l.is_premium = 0 and l.status = 'PUBLISHED' order by l.slug limit 60").bind(type).all()).results as { id: string }[]).map((r) => r.id);
  const examList = ((await probe.call('GET', '/api/exams')).body as { exams?: { id: string; kind: string; isPremium: boolean }[] }).exams ?? [];
  const scenarios: { label: string; path: string }[] = [
    { label: 'пять минут', path: '/practice/FIVE_MIN' },
    { label: 'скорость', path: '/practice/SPEED' },
    { label: 'грамматика být', path: '/practice/GRAMMAR?topic=byc' },
  ];
  for (const id of await openable(await candidates('DICTATION'), 2)) scenarios.push({ label: `урок с диктантом ${id.slice(0, 8)}`, path: `/lesson/${id}` });
  for (const id of await openable(await candidates('SENTENCE_TRANSLATION'), 2)) scenarios.push({ label: `урок с переводом ${id.slice(0, 8)}`, path: `/lesson/${id}` });
  for (const e of await openable(examList.filter((x) => !x.isPremium).map((x) => x.id), 2)) {
    const kind = examList.find((x) => x.id === e)?.kind ?? 'EXAM';
    scenarios.push({ label: `${kind === 'PLACEMENT' ? 'входной тест' : 'экзамен'} ${e.slice(0, 8)}`, path: `/lesson/${e}` });
  }
  check(scenarios.length >= 5, `сценариев: ${scenarios.length} (${scenarios.map((s) => s.label).join(', ')})`);

  const browser = await chromium.launch({ headless: true, executablePath: chromiumPath(chromium), args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const pageErrors: string[] = [];
  const seen = new Set<string>();
  let screens = 0;
  let builtRight = 0;
  let builtWrong = 0;
  try {
    let n = 0;
    for (const width of [360, 390]) {
      for (const sc of scenarios) {
        n++;
        const u = await stand.login();
        await u.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A0', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: null });
        await u.call('PATCH', '/api/me/settings', { theme: 'dark', reducedMotion: true });
        const id = String(992000 + n);
        const context = await browser.newContext({ viewport: { width, height: 760 }, deviceScaleFactor: 2, locale: 'ru-RU' });
        const page = await context.newPage();
        page.on('pageerror', (e) => pageErrors.push(e.message));
        await page.addInitScript(({ token, id }) => localStorage.setItem('pg_auth', JSON.stringify({ token, owner: `dev:${id}`, exp: Date.now() + 86_400_000 })), { token: u.token, id });
        let sessionId = '';
        const answers: { correct: boolean }[] = [];
        page.on('response', async (r) => {
          const url = r.url();
          if (url.endsWith('/api/sessions') && r.request().method() === 'POST') sessionId = (await r.json().catch(() => ({}))).sessionId ?? sessionId;
          if (/\/api\/sessions\/[^/]+\/answer$/.test(url)) answers.push(await r.json().catch(() => ({})));
        });
        const sep = sc.path.includes('?') ? '&' : '?';
        await page.goto(`${stand.base}${sc.path}${sep}devUser=${id}`);
        await page.locator('[data-action="start"], [data-grammar-choice], button.option, textarea, [data-token]').first().waitFor({ timeout: 30_000 });
        const start = page.locator('[data-action="start"]');
        if (await start.count()) await start.click();
        await page.waitForFunction(() => document.querySelector('[data-grammar-choice], textarea, button.option, [data-token], [data-pair]'), null, { timeout: 30_000 });
        const items = await stand.sessionItems(sessionId);
        const label = `${width}px ${sc.label}`;
        check(items.length > 0, `${label}: сессия создана (${items.length} заданий)`);

        let rightHere = false;
        for (let guard = 0; guard < items.length * 4 + 6; guard++) {
          if (await page.locator('[data-lesson-result]').count()) break;
          const next = page.locator('[data-action="next"]:not([disabled])');
          if (await next.count()) { await next.click(); await page.waitForTimeout(250); continue; }
          await page.waitForTimeout(1100); // сервер отклоняет слишком быстрые ответы
          const probe = (await page.evaluate(PROBE)) as Probe;
          // Тип экрана берём со страницы, а не по номеру: диалог и ситуация занимают несколько шагов, номер задания в сессии уезжает.
          const grammarChoice = (await page.locator('[data-grammar-choice]').count()) > 0;
          const known = probe.tilesBlock
            ? items.find((it: { type: string; data: unknown }) => (it.type === 'SENTENCE_TRANSLATION' || it.type === 'DICTATION') && wordsFit(words((it.data as { accepted: string[] }).accepted[0]), probe.tokens))
            : undefined;
          const kind = probe.tilesBlock ? (known?.type ?? 'TILES') : grammarChoice ? 'GRAMMAR' : 'другое';
          seen.add(kind);
          screens++;
          check(probe.fields === 0, `${width}px ${sc.label} ${kind}: поля ввода нет`);
          check(probe.letters === 0, `${width}px ${sc.label} ${kind}: ряда польских букв нет`);
          check(probe.scrollW <= width, `${width}px ${sc.label} ${kind}: нет горизонтальной прокрутки`);
          const label = `${width}px ${sc.label}`;
          const checkBtn = page.locator('[data-action="check"]');
          const answered = () => page.locator('[data-action="next"]').waitFor({ timeout: 15_000 });
          const before = answers.length;

          if (probe.tilesBlock) {
            check(!!known && probe.tokens.length >= 4, `${label} ${kind}: слова-плашки (${probe.tokens.join(' · ')})`);
            if (!known) { check(false, `${label}: не нашли задание по плашкам (${probe.tokens.join(' · ')})`); break; }
            const accepted = (known.data as { accepted: string[] }).accepted;
            const want = words(accepted[0]);
            if (width === 390 && !seen.has(`shot-${kind}`)) { seen.add(`shot-${kind}`); await page.screenshot({ path: `${OUT}/${kind}-before.png` }); }
            // первое задание со сборкой в сценарии собираем верно, следующее — в обратном порядке (если это не тот же ответ)
            const reversed = want.slice().reverse();
            const sameAsAnswer = accepted.some((a) => words(a).join(' ').toLowerCase() === reversed.join(' ').toLowerCase());
            const order = !rightHere || sameAsAnswer || want.length < 2 ? want : reversed;
            const expectCorrect = order === want;
            for (const w of order) await page.locator('[data-token]', { hasText: new RegExp(`^${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }).first().click();
            if (width === 390 && !seen.has(`shot2-${kind}`)) { seen.add(`shot2-${kind}`); await page.screenshot({ path: `${OUT}/${kind}-built.png` }); }
            await checkBtn.click();
            await answered();
            const got = answers[answers.length - 1];
            check(!!got && answers.length === before + 1, `${label} ${kind}: ответ отправлен`);
            check(got?.correct === expectCorrect, `${label} ${kind}: ${expectCorrect ? 'верная сборка засчитана' : 'перестановка слов не засчитана'}`);
            if (expectCorrect) { rightHere = true; builtRight++; } else builtWrong++;
            continue;
          }

          if (await page.locator('[data-action="skip"]').count()) { await page.locator('[data-action="skip"]').click(); await answered(); continue; }
          if (await page.locator('[data-token]').count()) {
            while (await page.locator('[data-token]').count()) await page.locator('[data-token]').first().click();
            await checkBtn.click(); await answered(); continue;
          }
          if (await page.locator('[data-pair="left"]').count()) {
            const k = await page.locator('[data-pair="left"]').count();
            for (let j = 0; j < k; j++) { await page.locator('[data-pair="left"]').nth(j).click(); await page.locator('[data-pair="right"]').nth(j).click(); }
            if (await checkBtn.count()) await checkBtn.click();
            await answered(); continue;
          }
          const opts = page.locator('button.option:not([disabled]), [data-grammar-choice] button[data-form]:not([disabled])');
          if (await opts.count()) { await opts.first().click(); if (await checkBtn.count()) await checkBtn.click(); await answered().catch(() => undefined); continue; }
        }
        await context.close();
      }
    }
  } finally {
    await browser.close();
    await stand.stop();
  }
  const types = [...seen].filter((x) => !x.startsWith('shot'));
  check(types.includes('SENTENCE_TRANSLATION'), `встретился перевод предложения; типы заданий: ${types.join(', ')}`);
  check(types.includes('DICTATION'), 'встретился диктант');
  check(types.includes('GRAMMAR'), 'встретилось задание на форму слова');
  check(builtRight >= 4 && builtWrong >= 2, `собрано верно: ${builtRight}, переставлено: ${builtWrong}`);
  check(screens >= 60, `проверено экранов заданий: ${screens}`);
  check(pageErrors.length === 0, `без ошибок страницы${pageErrors.length ? ': ' + pageErrors.slice(0, 3).join(' | ') : ''}`);
  console.log(failures.length ? `\nПровалено: ${failures.length}` : '\nВсе проверки пройдены');
  process.exit(failures.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
