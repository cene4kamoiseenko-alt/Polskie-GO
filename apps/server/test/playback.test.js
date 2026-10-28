/// <reference lib="dom" />
/**
 * Відтворення в клієнті (apps/web/src/lib/audio.ts) у змодельованому браузері: лише готові MP3 бібліотеки за audio_id.
 * Синтезу немає ніде: speechSynthesis не викликається ніколи, файлу немає — стан «missing» без голосу пристрою.
 */
import { createHash } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { audioNorm } from '@polski-go/shared';
vi.mock('../../web/src/lib/api', () => ({ API_BASE: '', api: vi.fn(async () => ({ ok: true })), assetUrl: (s) => s }));
class FakeAudio {
    static latest;
    src = '';
    preload = '';
    paused = true;
    playbackRate = 1;
    onended;
    onpause;
    onerror;
    onplaying;
    onloadedmetadata;
    play = vi.fn(async () => { });
    pause = vi.fn(() => { this.paused = true; this.onpause?.(); });
    constructor() { FakeAudio.latest = this; }
}
const BASE = '/api/audio/abc123abc123/';
const fileOf = (text, base = BASE) => `${base}${createHash('sha256').update(audioNorm(text)).digest('hex')}.mp3`;
const mp3 = () => new Response(new Blob(['ID3audio'], { type: 'audio/mpeg' }), { status: 200 });
/** fetch: готові файли — 200, інші — 404; кожен виклик записується. */
function stubFetch(ready = () => true) {
    const fetch = vi.fn(async (url) => (ready(String(url)) ? mp3() : Response.json({ error: 'audio_missing' }, { status: 404 })));
    vi.stubGlobal('fetch', fetch);
    return fetch;
}
async function setup() {
    vi.resetModules();
    const synth = { getVoices: () => [{ lang: 'pl-PL', name: 'Zosia' }], addEventListener: vi.fn(), cancel: vi.fn(), speak: vi.fn(), speaking: false, pending: false };
    vi.stubGlobal('Audio', FakeAudio);
    vi.stubGlobal('window', { speechSynthesis: synth });
    vi.stubGlobal('speechSynthesis', synth);
    vi.stubGlobal('SpeechSynthesisUtterance', class { constructor(text) { this.text = text; } });
    vi.stubGlobal('document', { addEventListener: vi.fn() });
    const audio = await import('../../web/src/lib/audio');
    const { api } = await import('../../web/src/lib/api');
    api.mockClear();
    return { audio, synth, api };
}
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
describe('Відтворення лише готових MP3 (змодельований браузер)', () => {
    it('грає файл бібліотеки за audio_id: {base}{sha256(audioNorm)}.mp3; повільно — той самий файл із 0,75', async () => {
        const { audio, synth } = await setup();
        const fetch = stubFetch();
        audio.configureAudio({ base: BASE });
        const task = audio.speak('Dzień dobry!');
        await vi.waitFor(() => expect(FakeAudio.latest.src).toMatch(/^blob:/));
        expect(fetch).toHaveBeenCalledOnce();
        // Знак оклику лишається частиною вимови («Dzień dobry!» ≠ «Dzień dobry»), крапка й регістр — ні.
        expect(String(fetch.mock.calls[0][0])).toBe(fileOf('dzień dobry!'));
        FakeAudio.latest.onplaying(); FakeAudio.latest.onended();
        expect(await task).toEqual({ played: true, source: 'library', issue: null });
        const slow = audio.speak('Dzień dobry!', { slow: true });
        await vi.waitFor(() => expect(FakeAudio.latest.playbackRate).toBe(0.75));
        expect(fetch).toHaveBeenCalledOnce();
        FakeAudio.latest.onplaying(); FakeAudio.latest.onended();
        await slow;
        expect(synth.speak).not.toHaveBeenCalled();
    });
    it('20 повторних натискань — один запит файлу', async () => {
        const { audio } = await setup();
        const fetch = stubFetch();
        audio.configureAudio({ base: BASE });
        for (let i = 0; i < 20; i++) {
            const task = audio.speak('Poproszę kawę.');
            await vi.waitFor(() => expect(FakeAudio.latest.onplaying).toBeTypeOf('function'));
            FakeAudio.latest.onplaying(); FakeAudio.latest.onended();
            await task;
        }
        expect(fetch).toHaveBeenCalledOnce();
    });
    it('файлу немає — «missing» без голосу пристрою; одне повідомлення адмінці; повтор — без запиту', async () => {
        const { audio, synth, api } = await setup();
        const fetch = stubFetch(() => false);
        audio.configureAudio({ base: BASE });
        expect(await audio.speak('Nie ma nagrania.')).toEqual({ played: false, source: null, issue: 'missing' });
        expect(await audio.speak('Nie ma nagrania.')).toEqual({ played: false, source: null, issue: 'missing' });
        expect(fetch).toHaveBeenCalledOnce();
        expect(api).toHaveBeenCalledOnce();
        expect(api.mock.calls[0]).toEqual(['/audio/miss', { body: { text: 'Nie ma nagrania.' } }]);
        expect(synth.speak).not.toHaveBeenCalled();
    });
    it('без бібліотеки (base null) — «missing» без запитів і без голосу пристрою', async () => {
        const { audio, synth } = await setup();
        const fetch = stubFetch();
        audio.configureAudio({ base: null });
        expect(await audio.speak('Cześć')).toEqual({ played: false, source: null, issue: 'missing' });
        expect(fetch).not.toHaveBeenCalled();
        expect(synth.speak).not.toHaveBeenCalled();
    });
    it('збій мережі — «network», не «missing»: наступне натискання пробує знову; голосу пристрою немає', async () => {
        const { audio, synth } = await setup();
        const fetch = vi.fn(async () => new Response('err', { status: 500 }));
        vi.stubGlobal('fetch', fetch);
        audio.configureAudio({ base: BASE });
        expect((await audio.speak('Dziękuję')).issue).toBe('network');
        expect((await audio.speak('Dziękuję')).issue).toBe('network');
        expect(fetch).toHaveBeenCalledTimes(2);
        expect(synth.speak).not.toHaveBeenCalled();
    });
    it('попереднє завантаження й натискання ділять один запит', async () => {
        const { audio } = await setup();
        let complete;
        const fetch = vi.fn(() => new Promise((resolve) => { complete = resolve; }));
        vi.stubGlobal('fetch', fetch);
        audio.configureAudio({ base: BASE });
        audio.prefetchSpeech(['To jest test.']);
        const task = audio.speak('To jest test.');
        await vi.waitFor(() => expect(fetch).toHaveBeenCalledOnce());
        complete(mp3());
        await vi.waitFor(() => expect(FakeAudio.latest.src).toMatch(/^blob:/));
        expect(fetch).toHaveBeenCalledOnce();
        audio.stopSpeech(); await task;
    });
    it('зламаний запис (url) → готовий файл бібліотеки тієї самої фрази', async () => {
        const { audio } = await setup();
        const fetch = stubFetch();
        audio.configureAudio({ base: BASE });
        const task = audio.speak('Dzień dobry', { url: '/missing.mp3' });
        expect(FakeAudio.latest.src).toBe('/missing.mp3');
        FakeAudio.latest.onerror();
        await vi.waitFor(() => expect(FakeAudio.latest.src).toMatch(/^blob:/));
        expect(String(fetch.mock.calls[0][0])).toBe(fileOf('Dzień dobry'));
        FakeAudio.latest.onplaying(); FakeAudio.latest.onended();
        expect(await task).toEqual({ played: true, source: 'library', issue: null });
    });
    it('попереднє завантаження — не більше 40 запитів на хвилину; уже завантажене не запитується знову', async () => {
        const { audio } = await setup();
        const fetch = stubFetch();
        audio.configureAudio({ base: BASE });
        for (let i = 0; i < 30; i++) audio.prefetchSpeech([`Zdanie ${i} a`, `Zdanie ${i} b`, `Zdanie ${i} c`]);
        await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(40));
        await new Promise((r) => setTimeout(r, 20));
        expect(fetch).toHaveBeenCalledTimes(40);
        audio.prefetchSpeech(['Zdanie 0 a']);
        const task = audio.speak('Zdanie 29 c');
        await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(41));
        audio.stopSpeech(); await task;
    });
    it('після перезапуску файл береться з Cache Storage без запиту до сервера', async () => {
        const store = new Map();
        const cache = { match: vi.fn(async (k) => store.get(k)), put: vi.fn(async (k, r) => { store.set(k, new Response(await r.blob())); }), keys: vi.fn(async () => [...store.keys()]), delete: vi.fn() };
        const first = await setup();
        vi.stubGlobal('caches', { open: vi.fn(async () => cache), delete: vi.fn(async () => true) });
        stubFetch();
        first.audio.configureAudio({ base: BASE });
        first.audio.prefetchSpeech(['Na zdrowie']);
        await vi.waitFor(() => expect(cache.put).toHaveBeenCalledOnce());
        expect(cache.put.mock.calls[0][0]).toBe(fileOf('Na zdrowie'));
        // «Перезапуск»: новий модуль, порожня пам'ять, той самий Cache Storage.
        const second = await setup();
        vi.stubGlobal('caches', { open: vi.fn(async () => cache), delete: vi.fn(async () => true) });
        const fetch2 = stubFetch();
        second.audio.configureAudio({ base: BASE });
        const task = second.audio.speak('Na zdrowie');
        await vi.waitFor(() => expect(FakeAudio.latest.src).toMatch(/^blob:/));
        expect(fetch2).not.toHaveBeenCalled();
        second.audio.stopSpeech(); await task;
    });
    it('інший голос (інший відбиток в адресі) — інший файл; старі кеші синтезу pg-tts-v1/v2 прибираються', async () => {
        const store = new Map();
        const cache = { match: vi.fn(async (k) => store.get(k)), put: vi.fn(async (k, r) => { store.set(k, new Response(await r.blob())); }), keys: vi.fn(async () => [...store.keys()]), delete: vi.fn() };
        const storage = { open: vi.fn(async () => cache), delete: vi.fn(async () => true) };
        const { audio } = await setup();
        vi.stubGlobal('caches', storage);
        const fetch = stubFetch();
        audio.configureAudio({ base: BASE });
        audio.prefetchSpeech(['Smacznego']);
        await vi.waitFor(() => expect(cache.put).toHaveBeenCalledOnce());
        audio.prefetchSpeech(['Smacznego']);
        const other = '/api/audio/def456def456/';
        audio.configureAudio({ base: other });
        audio.prefetchSpeech(['Smacznego']);
        await vi.waitFor(() => expect(cache.put).toHaveBeenCalledTimes(2));
        expect(fetch.mock.calls.map((c) => String(c[0]))).toEqual([fileOf('Smacznego'), fileOf('Smacznego', other)]);
        expect(storage.delete.mock.calls.map((c) => c[0]).sort()).toEqual(['pg-tts-v1', 'pg-tts-v2']);
    });
    it('окрема літера (прийменник w / z) не озвучується: голос прочитав би її назву, «duże wu»', async () => {
        const { audio, synth } = await setup();
        const fetch = stubFetch();
        audio.configureAudio({ base: BASE });
        for (const x of ['W', 'w', 'z', 'I']) expect(await audio.speak(x)).toEqual({ played: false, source: null, issue: null });
        expect(synth.speak).not.toHaveBeenCalled();
        expect(fetch).not.toHaveBeenCalled();
    });
    it('зупинка до початку відтворення завершує обіцянку', async () => {
        const { audio } = await setup();
        const task = audio.speak('Dzień dobry', { url: '/recording.mp3' });
        audio.stopSpeech();
        await task;
        expect(FakeAudio.latest.pause).toHaveBeenCalled();
        expect(FakeAudio.latest.onplaying).toBeNull();
    });
    it('запис, що так і не почав грати, зупиняється за тайм-аутом', async () => {
        vi.useFakeTimers();
        const { audio } = await setup();
        stubFetch(() => false);
        audio.configureAudio({ base: BASE });
        const task = audio.speak('Dzień dobry', { url: '/broken.mp3' });
        await vi.advanceTimersByTimeAsync(16_000);
        await task;
        expect(FakeAudio.latest.pause).toHaveBeenCalled();
    });
    it('джерело — те, що справді почало грати (перевірка відтворенням, а не запитом)', async () => {
        const { audio } = await setup();
        const task = audio.speak('Dzień dobry', { url: '/recording.mp3' });
        await vi.waitFor(() => expect(FakeAudio.latest.onplaying).toBeTypeOf('function'));
        FakeAudio.latest.onplaying();
        FakeAudio.latest.onended();
        expect(await task).toEqual({ played: true, source: 'recording', issue: null });
    });
});
