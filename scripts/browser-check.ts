/**
 * Браузерна перевірка на одноразовій локальній D1 і справжньому UI (Vite dev + API в одному процесі).
 * Порти вільні (0 → ОС обирає), тож перевірка не конфліктує з запущеним `npm run dev` чи стендом.
 *
 * Голос:
 *  - розпізнавання пристрою (SpeechRecognition підмінено подіями): тиша → стан «Тишина» без відповіді;
 *    фраза → відповідь іде як тренування (без XP і без помилки);
 *  - серверний запис: справжній getUserMedia + AudioWorklet на фейковому мікрофоні Chromium (WAV із тоном),
 *    Azure STT підмінено в цьому процесі. Немає мережі → стан «Нет сети» без запиту; відмова в дозволі →
 *    «Нужно разрешение»; тиша → «Тишина» без запиту до STT; запис → підписана спроба → зараховано з XP.
 * Це не перевірка реального мікрофона, iPhone чи Telegram.
 *
 * Запуск: npm run e2e   (знімки — test-results/screens, підсумок — test-results/browser-results.json)
 */
import { createServer as httpServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { createServer as netServer, type AddressInfo } from 'node:net';
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const require = createRequire(root + '/package.json');
const OUT = resolve(root, 'test-results');
const SCREENS = resolve(OUT, 'screens');

/** Моно PCM16 WAV: тиша, потім тон (як голос), потім тиша — для фейкового мікрофона Chromium. */
function toneWav(path: string, seconds = 6, rate = 48000) {
  const n = seconds * rate;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVE', 8); buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22); buf.writeUInt32LE(rate, 24);
  buf.writeUInt32LE(rate * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const amp = 0.25 * (0.6 + 0.4 * Math.sin((2 * Math.PI * 3 * i) / rate));
    buf.writeInt16LE(Math.round(amp * Math.sin((2 * Math.PI * 220 * i) / rate) * 32767), 44 + i * 2);
  }
  writeFileSync(path, buf);
}

/** Вільний TCP-порт від ОС (для Vite, якому потрібен конкретний номер). */
function freePort(): Promise<number> {
  return new Promise((ok, fail) => {
    const srv = netServer();
    srv.once('error', fail);
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address() as AddressInfo;
      srv.close(() => ok(port));
    });
  });
}

function check(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`E2E: ${msg}`);
  console.log(`  ✓ ${msg}`);
}

async function main() {
  const { createServer } = await import(root + '/node_modules/vite/dist/node/index.js');
  const { getEnv, login, sessionItems, correctAnswers, disposeEnv } = await import(root + '/apps/server/test/helpers.ts');
  const { chromium } = require('playwright') as typeof import('playwright');
  const { app, env } = await getEnv();
  mkdirSync(SCREENS, { recursive: true });

  // Azure STT підмінено лише в цьому процесі: повертає фразу поточного завдання, лічить виклики.
  let sttPhrase = '';
  let sttCalls = 0;
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (url.includes('.stt.speech.microsoft.com')) {
      sttCalls++;
      return new Response(JSON.stringify({ RecognitionStatus: 'Success', DisplayText: sttPhrase }), { headers: { 'content-type': 'application/json' } });
    }
    return realFetch(input, init);
  }) as typeof fetch;

  const bridge = httpServer(async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const chunks: Buffer[] = [];
      for await (const chunk of req) chunks.push(chunk as Buffer);
      const body = ['GET', 'HEAD'].includes(req.method!) ? {} : { body: Buffer.concat(chunks) };
      const r = await app.request('http://localhost' + req.url, { method: req.method, headers: req.headers as never, ...body }, env);
      res.writeHead(r.status, Object.fromEntries(r.headers));
      res.end(Buffer.from(await r.arrayBuffer()));
    } catch {
      res.writeHead(500);
      res.end('QA bridge error');
    }
  });
  await new Promise<void>((ok) => bridge.listen(0, '127.0.0.1', ok));
  const api = `http://127.0.0.1:${(bridge.address() as AddressInfo).port}`;
  const vite = await createServer({
    root: root + '/apps/web',
    configFile: root + '/apps/web/vite.config.ts',
    server: { host: '127.0.0.1', port: await freePort(), strictPort: true, proxy: { '/api': api, '/uploads': api } },
    logLevel: 'error',
  });
  await vite.listen();
  const base = (vite.resolvedUrls?.local[0] ?? '').replace(/\/$/, '');
  console.log(`API ${api}, UI ${base}`);

  const wav = resolve(OUT, 'fake-mic.wav');
  toneWav(wav);
  // Браузер пакета playwright, а якщо його не завантажено — системний Chromium (PLAYWRIGHT_CHROMIUM_EXECUTABLE або /opt/pw-browsers).
  const bundled = existsSync(chromium.executablePath());
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? (bundled ? undefined : ['/opt/pw-browsers/chromium'].find((x) => existsSync(x)));
  const browser = await chromium.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {}),
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-audio-capture=${wav}`],
  });
  const results: Record<string, unknown>[] = [];
  const errors: string[] = [];

  /** Новий користувач із пройденим онбордингом і сторінка з його токеном. */
  async function userPage(devUser: string, init?: () => void) {
    const u = await login();
    await u.call('POST', '/api/me/onboarding', { uiLanguage: 'ru', selfLevel: 'A0', learningGoal: 'life', dailyGoalMinutes: 10, reminderHour: null });
    await u.call('PATCH', '/api/me/settings', { theme: 'dark', reducedMotion: true });
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    page.on('pageerror', (e) => errors.push(e.message));
    await page.addInitScript(({ token, devUser }) => {
      localStorage.setItem('pg_auth', JSON.stringify({ token, owner: `dev:${devUser}`, exp: Date.now() + 86_400_000 }));
    }, { token: u.token, devUser });
    if (init) await page.addInitScript(init);
    return { ...u, page, context, url: (path: string) => `${base}${path}?devUser=${devUser}` };
  }

  /** Відкрити урок на першому завданні на вимову (попередні завдання зараховано через API). */
  async function openPronunciation(u: Awaited<ReturnType<typeof userPage>>) {
    const lessonId = (await u.call('GET', '/api/journey')).body.nextLesson.id as string;
    const started = (await u.call('POST', '/api/sessions', { lessonId })).body;
    const items = await sessionItems(started.sessionId);
    const target = items.find((i: { type: string }) => i.type === 'PRONUNCIATION');
    if (!target) throw new Error('у першому уроці немає завдання на вимову');
    for (const item of items) {
      if (item === target) break;
      for (const a of correctAnswers(item)) await u.call('POST', `/api/sessions/${started.sessionId}/answer`, { key: item.key, answer: a });
    }
    await u.page.goto(u.url('/lesson/' + lessonId), { waitUntil: 'networkidle' });
    await u.page.getByRole('button', { name: 'Нажми и говори', exact: true }).waitFor({ timeout: 20_000 });
    // Підпис кнопки змінюється під час запису («Остановить запись»), тому шукаємо за будь-яким із них.
    const mic = u.page.getByRole('button', { name: /^(Нажми и говори|Остановить запись)$/ });
    return { mic, phrase: (target.data as { text: string }).text };
  }
  const micState = (page: import('playwright').Page) => page.locator('[data-mic]').getAttribute('data-mic');

  try {
    // ── Головна й основні екрани на трьох ширинах: знімки й горизонтальне переповнення.
    const home = await userPage('880001');
    for (const width of [360, 390, 430]) {
      await home.page.setViewportSize({ width, height: 844 });
      await home.page.goto(home.url('/'), { waitUntil: 'networkidle' });
      await home.page.getByText('Быстрый старт', { exact: true }).waitFor({ timeout: 20_000 });
      await home.page.evaluate(() => document.fonts.ready);
      await home.page.screenshot({ path: `${SCREENS}/home-${width}.png`, fullPage: true });
      results.push({ route: '/', width, overflow: await home.page.evaluate(() => document.documentElement.scrollWidth > innerWidth) });
    }
    for (const route of ['/profile', '/shop', '/learn']) {
      await home.page.goto(home.url(route), { waitUntil: 'networkidle' });
      await home.page.screenshot({ path: `${SCREENS}${route}.png`, fullPage: true });
      results.push({ route, width: 430, overflow: await home.page.evaluate(() => document.documentElement.scrollWidth > innerWidth) });
    }
    check(!results.some((r) => r.overflow), 'немає горизонтального переповнення на 360/390/430');
    await home.context.close();

    // ── Розпізнавання пристрою (сервер STT вимкнено): лише тренування.
    console.log('Розпізнавання пристрою');
    const device = await userPage('880002', () => {
      (window as unknown as { SpeechRecognition: unknown }).SpeechRecognition = class {
        lang = ''; onend: (() => void) | null = null; onerror: unknown = null; onresult: unknown = null;
        start() { (window as unknown as { __rec: unknown }).__rec = this; }
        stop() { this.onend?.(); }
        abort() {}
      };
    });
    const answersA: string[] = [];
    device.page.on('request', (r) => { if (r.url().endsWith('/answer')) answersA.push(r.url()); });
    const a = await openPronunciation(device);
    check(await micState(device.page) === 'ready', 'стан «Готово» до запису');
    await a.mic.click();
    await device.page.waitForFunction(() => !!(window as unknown as { __rec?: unknown }).__rec);
    await device.page.evaluate(() => (window as unknown as { __rec: { onend: () => void } }).__rec.onend());
    await device.page.locator('[data-mic="silence"]').waitFor();
    check(answersA.length === 0, 'тиша не надсилається як відповідь');
    await a.mic.click();
    const practiceRes = device.page.waitForResponse((r) => r.url().endsWith('/answer'));
    await device.page.evaluate((text) => (window as unknown as { __rec: { onresult: (e: unknown) => void } }).__rec.onresult({ results: [[{ transcript: text }]] }), a.phrase);
    const practice = await (await practiceRes).json();
    check(!practice.correct && practice.practice && practice.matched, 'транскрипт від пристрою — тренування без зарахування, збіг показано');
    await device.page.getByText('Фраза распознана — это тренировка без XP').waitFor();
    check(!(await device.page.getByText(/\+\d+ XP/).count()), 'за тренування XP не показано');
    await device.page.waitForTimeout(700);
    await device.page.screenshot({ path: `${SCREENS}/lesson-practice.png`, fullPage: true });
    await device.context.close();

    // ── Серверне розпізнавання: справжній запис фейкового мікрофона → підписана спроба.
    console.log('Серверне розпізнавання');
    Object.assign(env, { AZURE_STT_ENABLED: 'true', AZURE_SPEECH_KEY: 'e2e-fake-key', AZURE_SPEECH_REGION: 'e2e' });
    const server = await userPage('880003');
    const transcribes: string[] = [];
    server.page.on('request', (r) => { if (r.url().includes('/api/speech/transcribe')) transcribes.push(r.url()); });
    const b = await openPronunciation(server);
    sttPhrase = b.phrase;

    await server.context.setOffline(true);
    await server.page.locator('[data-mic="offline"]').waitFor();
    await b.mic.click();
    check(transcribes.length === 0 && await micState(server.page) === 'offline', 'без мережі — стан «Нет сети», запис не починається');
    await server.context.setOffline(false);
    await server.page.locator('[data-mic="ready"]').waitFor();

    await server.page.evaluate(() => {
      const md = navigator.mediaDevices as MediaDevices & { __real?: MediaDevices['getUserMedia'] };
      md.__real = md.getUserMedia.bind(md);
      md.getUserMedia = () => Promise.reject(new DOMException('denied', 'NotAllowedError'));
    });
    await b.mic.click();
    await server.page.locator('[data-mic="permission"]').waitFor();
    check(transcribes.length === 0, 'відмова в дозволі — стан «Нужно разрешение», без запиту');

    // Тиша: потік із нульовим сигналом (генератор із нульовим підсиленням).
    await server.page.evaluate(() => {
      const md = navigator.mediaDevices as MediaDevices & { __real?: MediaDevices['getUserMedia'] };
      md.getUserMedia = async () => {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.value = 0;
        const dest = ctx.createMediaStreamDestination();
        osc.connect(gain).connect(dest);
        osc.start();
        return dest.stream;
      };
    });
    await b.mic.click();
    await server.page.locator('[data-mic="recording"]').waitFor();
    await server.page.waitForTimeout(1200);
    await b.mic.click();
    await server.page.locator('[data-mic="silence"]').waitFor();
    check(transcribes.length === 0 && sttCalls === 0, 'тиша — стан «Тишина», запис не надіслано до STT');

    await server.page.evaluate(() => {
      const md = navigator.mediaDevices as MediaDevices & { __real?: MediaDevices['getUserMedia'] };
      md.getUserMedia = md.__real!;
    });
    const answerRes = server.page.waitForResponse((r) => r.url().endsWith('/answer'));
    await b.mic.click();
    await server.page.locator('[data-mic="recording"]').waitFor();
    await server.page.waitForTimeout(1500);
    await b.mic.click();
    const verified = await (await answerRes).json();
    check(transcribes.length === 1 && /[?&]session=.+&item=/.test(transcribes[0]) && sttCalls === 1, 'запис прив’язано до сесії й завдання, STT викликано один раз');
    check(verified.correct && verified.verified, 'підписана серверна спроба зарахована');
    await server.page.getByText(/\+\d+ XP/).waitFor();
    check(true, 'XP показано лише за підтверджену спробу');
    await server.page.waitForTimeout(700);
    await server.page.screenshot({ path: `${SCREENS}/lesson-verified.png`, fullPage: true });
    results.push({ microphone: 'device recognition simulated by events; server path recorded from Chromium fake microphone (WAV tone), Azure STT stubbed', sttCalls });
    await server.context.close();

    check(errors.length === 0, `без помилок сторінки${errors.length ? ': ' + errors.join(' | ') : ''}`);
    writeFileSync(resolve(OUT, 'browser-results.json'), JSON.stringify({ results, errors }, null, 2));
  } finally {
    globalThis.fetch = realFetch;
    await browser.close();
    await vite.close();
    bridge.close();
    await disposeEnv();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
