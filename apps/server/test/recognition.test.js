import { afterEach, describe, expect, it, vi } from 'vitest';
import { recognizePolish, speechRecognitionAvailable } from '../../web/src/lib/recognition';
class FakeRecognition {
    static latest;
    lang = '';
    interimResults = true;
    maxAlternatives = 0;
    onresult = null;
    onerror = null;
    onend = null;
    abort = vi.fn();
    stop = vi.fn();
    start = vi.fn();
    constructor() { FakeRecognition.latest = this; }
}
function setup() { vi.stubGlobal('window', { SpeechRecognition: FakeRecognition }); }
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
describe('Recognition lifecycle (browser API simulated, not a live microphone)', () => {
    it('unsupported service gives an explicit error', async () => {
        vi.stubGlobal('window', {});
        expect(speechRecognitionAvailable()).toBe(false);
        await expect(recognizePolish().promise).rejects.toThrow('unsupported');
    });
    it('returns a non-empty Polish transcript', async () => {
        setup();
        const run = recognizePolish();
        expect(FakeRecognition.latest.lang).toBe('pl-PL');
        FakeRecognition.latest.onresult({ results: [[{ transcript: ' Dzień dobry ' }]] });
        await expect(run.promise).resolves.toBe('Dzień dobry');
        expect(FakeRecognition.latest.onend).toBeNull();
    });
    it('silence is a retryable error rather than an empty submitted answer', async () => {
        setup();
        const run = recognizePolish();
        const check = expect(run.promise).rejects.toThrow('no-speech');
        FakeRecognition.latest.onend();
        await check;
    });
    it('can stop for a final result and can cancel without submitting it', async () => {
        setup();
        const run = recognizePolish();
        run.stop();
        expect(FakeRecognition.latest.stop).toHaveBeenCalledOnce();
        const check = expect(run.promise).rejects.toThrow('aborted');
        run.cancel();
        await check;
        expect(FakeRecognition.latest.abort).toHaveBeenCalledOnce();
        expect(FakeRecognition.latest.onresult).toBeNull();
    });
    it('ends a stalled session after 30 seconds', async () => {
        vi.useFakeTimers();
        setup();
        const run = recognizePolish();
        const check = expect(run.promise).rejects.toThrow('timeout');
        await vi.advanceTimersByTimeAsync(30_000);
        await check;
        expect(FakeRecognition.latest.abort).toHaveBeenCalledOnce();
    });
    it('propagates permission errors and handles synchronous start failures', async () => {
        setup();
        const run = recognizePolish();
        const check = expect(run.promise).rejects.toThrow('not-allowed');
        FakeRecognition.latest.onerror({ error: 'not-allowed' });
        await check;
        vi.stubGlobal('window', { SpeechRecognition: class extends FakeRecognition {
                start = () => { throw Error('denied'); };
            } });
        await expect(recognizePolish().promise).rejects.toThrow('start-failed');
    });
});
