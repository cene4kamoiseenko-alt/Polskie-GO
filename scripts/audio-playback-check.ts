/**
 * Браузерна перевірка PRE-GENERATED AUDIO ONLY (docs/PROMPT_AUDIO_PREGENERATED.md) на локальному стенді:
 *  • динамік грає готовий MP3 з /api/audio/<відбиток>/<audio_id>.mp3 (справжній MP3 з ffmpeg у R2 Miniflare);
 *  • 20 повторних натискань — жодного нового мережевого запиту файлу; повторне відкриття застосунку — файл із Cache Storage;
 *  • файлу немає — «Озвучка скоро появится», кнопка приглушена (aria-disabled), повторне натискання без запиту;
 *  • speechSynthesis не викликається, /api/tts не запитується, сервер жодного разу не звертається до ElevenLabs.
 * Chromium з емуляцією телефонів (Pixel 7 і розміри iPhone 14) — не справжні iOS Safari / Android / Telegram.
 *
 * Запуск: node --import tsx scripts/audio-playback-check.ts   → test-results/audio-check/*.png
 */
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { chromiumPath, startStand } from './lib/stand';

const root = process.cwd();
const require = createRequire(root + '/package.json');
const OUT = resolve(root, 'test-results/audio-check');
const VOICE = 'KamilVoiceQa000000001';

const failures: string[] = [];
const check = (ok: unknown, what: string) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) failures.push(what);
};

/** Справжній короткий MP3 (синус 0,6 с), щоб браузер його декодував і відтворив. */
function realMp3(): Uint8Array {
  const dir = mkdtempSync(join(tmpdir(), 'pg-audio-'));
  const file = join(dir, 'tone.mp3');
  execFileSync('ffmpeg', ['-loglevel', 'error', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=0.6', '-ac', '1', '-ar', '22050', '-b:a', '32k', file]);
  return new Uint8Array(readFileSync(file));
}

async function main() {
  const { chromium, devices } = require('playwright') as typeof import('playwright');
  // Будь-який запит сервера стенду до ElevenLabs (чи іншого провайдера озвучки) — рахується й блокується.
  const providerCalls: string[] = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (url: RequestInfo | URL, init?: RequestInit) => {
    const u = String(url instanceof Request ? url.url : url);
    if (/elevenlabs\.io|texttospeech\.googleapis|tts\.speech\.microsoft/.test(u)) {
      providerCalls.push(u);
      return new Response('blocked in QA', { status: 500 });
    }
    return realFetch(url, init);
  }) as typeof fetch;

  const stand = await startStand({ ui: 'dev' });
  const { base, login, env } = stand;
  Object.assign(env, { ELEVENLABS_VOICE_ID: VOICE, ELEVENLABS_API_KEY: 'qa-key-not-used', TTS_PROVIDER: 'elevenlabs' });
  const { audioId, audioObjectKey } = await import(root + '/apps/server/src/services/audio-catalog.ts');
  const { libraryFingerprint } = await import(root + '/apps/server/src/services/audio-library.ts');
  const { audioNorm } = await import(root + '/packages/shared/src/audioTexts.ts');
  const mp3 = realMp3();
  const bucket = (env as unknown as { AUDIO: R2Bucket }).AUDIO;
  const putReady = (text: string) => bucket.put(audioObjectKey(audioId(audioNorm(text)), VOICE), mp3, { httpMetadata: { contentType: 'audio/mpeg' } });
  const fileUrl = (text: string) => `/api/audio/${libraryFingerprint(VOICE)}/${audioId(audioNorm(text))}.mp3`;

  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: chromiumPath(chromium), args: ['--no-sandbox', '--disable-dev-shm-usage', '--autoplay-policy=user-gesture-required'] });
  let devUser = 997000;
  try {
    for (const [label, device] of [['android-pixel7', devices['Pixel 7']], ['iphone14-size', { ...devices['iPhone 14'], defaultBrowserType: 'chromium' }]] as const) {
      const u = await login();
      await u.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A0', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: null });
      const vocab = (await u.call('GET', '/api/vocab')).body.items as { pl: string; audioUrl?: string | null }[];
      const plain = vocab.filter((w) => !w.audioUrl);
      const readyWord = plain[0].pl;
      const missingWord = plain[1].pl;
      await putReady(readyWord);
      await putReady('Dzień dobry! Dziękuję, do widzenia.');
      const id = String(++devUser);
      const { defaultBrowserType: _ignored, ...ctxOpts } = device as typeof device & { defaultBrowserType?: string };
      const context = await browser.newContext({ ...ctxOpts, locale: 'ru-RU' });
      await context.addInitScript(({ token, id }) => {
        localStorage.setItem('pg_auth', JSON.stringify({ token, owner: `dev:${id}`, exp: Date.now() + 86_400_000 }));
        const w = window as Window & { __speakCalls?: number };
        w.__speakCalls = 0;
        if ('speechSynthesis' in window) window.speechSynthesis.speak = () => { w.__speakCalls! += 1; };
      }, { token: u.token, id });
      const requests: string[] = [];
      context.on('request', (r) => requests.push(new URL(r.url()).pathname + (r.method() === 'POST' ? ' POST' : '')));
      const filesFetched = (text: string) => requests.filter((p) => p === fileUrl(text)).length;

      // 1. Налаштування → «Проверить звук»: фраза з бібліотеки, джерело — запис Kamil.
      const p = await context.newPage();
      await p.goto(`${base}/settings?devUser=${id}`);
      const checkBtn = p.getByRole('button', { name: 'Проверить звук' });
      await checkBtn.waitFor({ timeout: 20_000 });
      await checkBtn.click();
      const status = p.getByRole('status');
      await status.waitFor({ timeout: 15_000 });
      const statusText = (await status.textContent()) ?? '';
      check(/запись голоса Kamil/.test(statusText), `${label}: проверка звука играет готовую запись Kamil («${statusText.slice(0, 60)}»)`);
      check(filesFetched('Dzień dobry! Dziękuję, do widzenia.') === 1, `${label}: файл фразы запрошен один раз по audio_id`);
      await p.screenshot({ path: `${OUT}/${label}-settings.png` });

      // 2. Словарь: готовое слово — 20 нажатий, один сетевой запрос файла.
      await p.goto(`${base}/dictionary?devUser=${id}`);
      const readyBtn = p.locator('li, [class*="card"]', { hasText: readyWord }).first().getByRole('button', { name: 'Слушать по-польски' });
      await readyBtn.waitFor({ timeout: 20_000 });
      for (let i = 0; i < 20; i++) {
        await readyBtn.click();
        await p.waitForTimeout(i === 0 ? 1200 : 150);
      }
      check(filesFetched(readyWord) === 1, `${label}: 20 нажатий на «${readyWord}» — файл скачан 1 раз (было ${filesFetched(readyWord)})`);
      check(!(await readyBtn.getAttribute('aria-disabled')), `${label}: кнопка готового слова активна`);

      // 3. Слово без файла: «Озвучка скоро появится», кнопка приглушена (часто ещё до нажатия — после предзагрузки),
      //    повтор — без запроса файла. force: человек может нажать приглушённую кнопку, Playwright по aria-disabled — нет.
      const missingRow = p.locator('li, [class*="card"]', { hasText: missingWord }).first();
      const missingBtn = missingRow.getByRole('button').first();
      await missingBtn.click({ force: true });
      const toast = p.getByText('Озвучка скоро появится').first();
      check(await toast.waitFor({ timeout: 8000 }).then(() => true, () => false), `${label}: слово без файла — «Озвучка скоро появится»`);
      await p.screenshot({ path: `${OUT}/${label}-dictionary-missing.png` });
      const before = filesFetched(missingWord);
      await missingBtn.click({ force: true });
      await p.waitForTimeout(500);
      check((await missingBtn.getAttribute('aria-disabled')) === 'true', `${label}: кнопка слова без файла приглушена (aria-disabled)`);
      check(filesFetched(missingWord) === before && before <= 1, `${label}: повторное нажатие без нового запроса файла`);
      check(requests.filter((r) => r === '/api/audio/miss POST').length <= 1, `${label}: нажатие без файла — один отчёт в «Просили, но файла нет»`);

      // 4. Повторное открытие приложения: новая страница того же устройства — файл из Cache Storage, без сети.
      await p.close();
      const p2 = await context.newPage();
      await p2.goto(`${base}/dictionary?devUser=${id}`);
      const again = p2.locator('li, [class*="card"]', { hasText: readyWord }).first().getByRole('button', { name: 'Слушать по-польски' });
      await again.waitFor({ timeout: 20_000 });
      await again.click();
      await p2.waitForTimeout(1200);
      check(filesFetched(readyWord) === 1, `${label}: после повторного открытия файл не скачивается заново`);

      const speakCalls = await p2.evaluate(() => (window as Window & { __speakCalls?: number }).__speakCalls ?? 0);
      check(speakCalls === 0, `${label}: speechSynthesis не вызывался`);
      check(!requests.some((r) => r.startsWith('/api/tts')), `${label}: /api/tts не запрашивался`);
      check(await p2.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${label}: нет горизонтальной прокрутки`);
      await context.close();
    }
    check(providerCalls.length === 0, `сервер ни разу не обратился к ElevenLabs / провайдерам озвучки (${providerCalls.length})`);
  } finally {
    await browser.close();
    await stand.stop();
    globalThis.fetch = realFetch;
  }
  console.log(failures.length ? `\nПровалено: ${failures.length}` : '\nВсё прошло');
  process.exit(failures.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
