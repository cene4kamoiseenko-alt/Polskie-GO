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
        await vi.advanceTimersByTimeAsync(15_000);
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
        expect(apiBlob).toHaveBeenCalledOnce();
        complete(new Blob(['audio'], { type: 'audio/mpeg' }));
        await vi.waitFor(() => expect(FakeAudio.latest.src).toMatch(/^blob:/));
        audio.stopSpeech(); await task;
    });

});
