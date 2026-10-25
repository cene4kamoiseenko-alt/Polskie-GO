/// <reference lib="dom" />
import { afterEach, describe, expect, it, vi } from 'vitest';
vi.mock('../../web/src/lib/api', () => ({ apiBlob: vi.fn(), assetUrl: (s) => s }));
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
async function setup(voices = []) {
    vi.resetModules();
    const synth = { getVoices: () => voices, addEventListener: vi.fn(), cancel: vi.fn(), speak: vi.fn(), speaking: false, pending: false };
    vi.stubGlobal('Audio', FakeAudio);
    vi.stubGlobal('window', { speechSynthesis: synth });
    vi.stubGlobal('speechSynthesis', synth);
    vi.stubGlobal('SpeechSynthesisUtterance', class {
        text;
        constructor(text) {
            this.text = text;
        }
    });
    vi.stubGlobal('document', { addEventListener: vi.fn() });
    return { audio: await import('../../web/src/lib/audio'), synth };
}
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
describe('Speech playback lifecycle (simulated browser, no real TTS)', () => {
    it('never selects an unverified device voice when voice list is empty', async () => {
        vi.useFakeTimers();
        const { audio, synth } = await setup();
        const task = audio.speak('Cześć');
        await vi.advanceTimersByTimeAsync(600);
        await task;
        expect(synth.speak).not.toHaveBeenCalled();
    });
    it('cancels a pending device voice before it can play on the next screen', async () => {
        vi.useFakeTimers();
        const { audio, synth } = await setup();
        const task = audio.speak('Dobranoc');
        audio.stopSpeech();
        await vi.advanceTimersByTimeAsync(600);
        await task;
        expect(synth.speak).not.toHaveBeenCalled();
    });
    it('settles a stopped audio promise even if playback has not started', async () => {
        const { audio } = await setup();
        const task = audio.speak('Dzień dobry', { url: '/recording.mp3' });
        audio.stopSpeech();
        await task;
        expect(FakeAudio.latest.pause).toHaveBeenCalled();
        expect(FakeAudio.latest.onplaying).toBeNull();
    });
    it('times out a playback that never starts', async () => {
        vi.useFakeTimers();
        const { audio } = await setup();
        const task = audio.speak('Dzień dobry', { url: '/broken.mp3' });
        // 15 с очікування запису, потім спроба голосу пристрою (600 мс на список голосів).
        await vi.advanceTimersByTimeAsync(16_000);
        await task;
        expect(FakeAudio.latest.pause).toHaveBeenCalled();
    });
    it('shares an in-flight synthesis between prefetch and playback', async () => {
        const { audio } = await setup();
        const { apiBlob } = await import('../../web/src/lib/api');
        let complete;
        apiBlob.mockReset().mockImplementation(() => new Promise(resolve => { complete = resolve; }));
        audio.configureAudio({ server: true });
        audio.prefetchSpeech(['To jest test.']);
        const task = audio.speak('To jest test.');
        // Спершу перевіряється постійний кеш (асинхронно), потім — один спільний запит.
        await vi.waitFor(() => expect(apiBlob).toHaveBeenCalledOnce());
        complete(new Blob(['audio'], { type: 'audio/mpeg' }));
        await vi.waitFor(() => expect(FakeAudio.latest.src).toMatch(/^blob:/));
        expect(apiBlob).toHaveBeenCalledOnce();
        audio.stopSpeech(); await task;
    });
    it('falls back from a broken recording to server synthesis of the same phrase', async () => {
        const { audio } = await setup();
        const { apiBlob } = await import('../../web/src/lib/api');
        apiBlob.mockReset().mockResolvedValue(new Blob(['audio'], { type: 'audio/mpeg' }));
        audio.configureAudio({ server: true });
        const task = audio.speak('Dzień dobry', { url: '/missing.mp3' });
        expect(FakeAudio.latest.src).toBe('/missing.mp3');
        FakeAudio.latest.onerror();
        await vi.waitFor(() => expect(FakeAudio.latest.src).toMatch(/^blob:/));
        expect(apiBlob).toHaveBeenCalledOnce();
        expect(String(apiBlob.mock.calls[0][0])).toContain('rate=normal');
        FakeAudio.latest.onplaying(); FakeAudio.latest.onended();
        await task;
    });
    it('falls back from failed server synthesis to a Polish device voice, never to another language', async () => {
        const { audio, synth } = await setup([{ lang: 'en-US', name: 'Samantha' }, { lang: 'pl-PL', name: 'Zosia' }]);
        const { apiBlob } = await import('../../web/src/lib/api');
        apiBlob.mockReset().mockRejectedValue(new Error('network'));
        audio.configureAudio({ server: true });
        const task = audio.speak('Dziękuję');
        await vi.waitFor(() => expect(synth.speak).toHaveBeenCalledOnce());
        const u = synth.speak.mock.calls[0][0];
        expect(u.voice.name).toBe('Zosia');
        expect(u.lang).toBe('pl-PL');
        u.onstart(); u.onend();
        await task;
    });
    it('keeps prefetch under the /tts rate limit and does not refetch what is already cached', async () => {
        const { audio } = await setup();
        const { apiBlob } = await import('../../web/src/lib/api');
        apiBlob.mockReset().mockImplementation(async () => new Blob(['audio'], { type: 'audio/mpeg' }));
        audio.configureAudio({ server: true });
        for (let i = 0; i < 30; i++) audio.prefetchSpeech([`Zdanie ${i} a`, `Zdanie ${i} b`, `Zdanie ${i} c`]);
        await vi.waitFor(() => expect(apiBlob).toHaveBeenCalledTimes(40));
        await new Promise((r) => setTimeout(r, 20));
        expect(apiBlob).toHaveBeenCalledTimes(40);
        // Уже завантажене повторно не запитується; озвучка на вимогу не обмежена бюджетом наперед.
        audio.prefetchSpeech(['Zdanie 0 a']);
        const task = audio.speak('Zdanie 29 c');
        await vi.waitFor(() => expect(apiBlob).toHaveBeenCalledTimes(41));
        audio.stopSpeech(); await task;
    });
    it('reuses audio saved in Cache Storage after a restart without asking the server', async () => {
        const store = new Map();
        const cache = { match: vi.fn(async (k) => store.get(k)), put: vi.fn(async (k, r) => { store.set(k, new Response(await r.blob())); }), keys: vi.fn(async () => [...store.keys()]), delete: vi.fn() };
        const first = await setup();
        vi.stubGlobal('caches', { open: vi.fn(async () => cache) });
        vi.stubGlobal('location', { origin: 'https://app.test' });
        const api1 = (await import('../../web/src/lib/api')).apiBlob;
        api1.mockReset().mockResolvedValue(new Blob(['audio'], { type: 'audio/mpeg' }));
        first.audio.configureAudio({ server: true });
        first.audio.prefetchSpeech(['Na zdrowie']);
        await vi.waitFor(() => expect(cache.put).toHaveBeenCalledOnce());
        // «Перезапуск»: новий модуль, порожня пам'ять, той самий Cache Storage.
        const second = await setup();
        vi.stubGlobal('caches', { open: vi.fn(async () => cache) });
        vi.stubGlobal('location', { origin: 'https://app.test' });
        const api2 = (await import('../../web/src/lib/api')).apiBlob;
        api2.mockReset();
        second.audio.configureAudio({ server: true });
        const task = second.audio.speak('Na zdrowie');
        await vi.waitFor(() => expect(FakeAudio.latest.src).toMatch(/^blob:/));
        expect(api2).not.toHaveBeenCalled();
        second.audio.stopSpeech(); await task;
    });
    it('soft device-voice policy (prepared, off by default) speaks pl-PL and marks the voice as unverified', async () => {
        vi.useFakeTimers();
        const { audio, synth } = await setup();
        audio.configureAudio({ server: false, deviceVoice: 'soft' });
        const task = audio.speak('Cześć');
        await vi.advanceTimersByTimeAsync(600);
        expect(synth.speak).toHaveBeenCalledOnce();
        const u = synth.speak.mock.calls[0][0];
        expect(u.lang).toBe('pl-PL');
        expect(u.voice).toBeUndefined();
        u.onstart(); u.onend();
        await task;
    });

});
