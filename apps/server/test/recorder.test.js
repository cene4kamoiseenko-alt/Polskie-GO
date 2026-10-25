import { afterEach, describe, expect, it, vi } from 'vitest';
vi.mock('../../web/src/lib/api', () => ({ transcribeAudio: vi.fn(async () => ({ transcript: 'Dzień dobry', attempt: 'signed-attempt' })) }));
vi.mock('../../web/src/lib/recorder.worklet.js?url', () => ({ default: '/capture.js' }));
import { transcribeAudio } from '../../web/src/lib/api';
import { recognizeRecordedPolish } from '../../web/src/lib/recorder';
let track;
class Context {
  state = 'running'; sampleRate = 48000; destination = {};
  resume = vi.fn(async () => {});
  close = vi.fn(async () => { this.state = 'closed'; });
  audioWorklet = { addModule: vi.fn(async () => {}) };
  createMediaStreamSource = () => ({ connect() {}, disconnect() {} });
}
class Worklet {
  static last;
  port = { onmessage: null };
  constructor() { Worklet.last = this; }
  connect() {} disconnect() {}
}
function setup(getUserMedia) {
  track = { stop: vi.fn() };
  vi.stubGlobal('navigator', { mediaDevices: { getUserMedia: getUserMedia ?? vi.fn(async () => ({ getTracks: () => [track] })) } });
  vi.stubGlobal('AudioContext', Context); vi.stubGlobal('AudioWorkletNode', Worklet);
  Worklet.last = undefined;
}
afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });
describe('Microphone capture lifecycle (simulated hardware)', () => {
  it('releases microphone before upload and sends actual recorded PCM as WAV, bound to the lesson item', async () => {
    setup(); const onProcessing = vi.fn(); const onStart = vi.fn(); const onLevel = vi.fn();
    const bind = { session: 's1', item: 'k1' };
    const run = recognizeRecordedPolish({ onProcessing, onStart, onLevel, bind });
    await vi.waitFor(() => expect(Worklet.last).toBeDefined());
    expect(onStart).toHaveBeenCalledOnce();
    Worklet.last.port.onmessage({ data: new Float32Array(16000).fill(0.2) });
    expect(onLevel).toHaveBeenCalled(); expect(onLevel.mock.calls[0][0]).toBeGreaterThan(0.5);
    run.stop(); await expect(run.promise).resolves.toEqual({ transcript: 'Dzień dobry', attempt: 'signed-attempt' });
    expect(track.stop).toHaveBeenCalled(); expect(onProcessing).toHaveBeenCalledOnce();
    expect(transcribeAudio.mock.calls[0][0].length).toBeGreaterThan(3200);
    expect(transcribeAudio.mock.calls[0][2]).toEqual(bind);
  });
  it('does not upload an empty clip', async () => {
    setup(); const run = recognizeRecordedPolish();
    await vi.waitFor(() => expect(Worklet.last).toBeDefined());
    const check = expect(run.promise).rejects.toThrow('silence'); run.stop(); await check;
    expect(transcribeAudio).not.toHaveBeenCalled(); expect(track.stop).toHaveBeenCalled();
  });
  it('does not upload a long but silent clip (background hiss only)', async () => {
    setup(); const run = recognizeRecordedPolish();
    await vi.waitFor(() => expect(Worklet.last).toBeDefined());
    for (let i = 0; i < 20; i++) Worklet.last.port.onmessage({ data: new Float32Array(4800).fill(0.002) });
    const check = expect(run.promise).rejects.toThrow('silence'); run.stop(); await check;
    expect(transcribeAudio).not.toHaveBeenCalled();
  });
  it('releases a stream whose permission resolves after cancellation', async () => {
    let grant;
    setup(vi.fn(() => new Promise(resolve => { grant = resolve; })));
    const run = recognizeRecordedPolish();
    await vi.waitFor(() => expect(grant).toBeDefined());
    const check = expect(run.promise).rejects.toThrow('aborted'); run.cancel(); await check;
    grant({ getTracks: () => [track] });
    await vi.waitFor(() => expect(track.stop).toHaveBeenCalled());
    expect(transcribeAudio).not.toHaveBeenCalled();
  });
  it('maps permission denial to a retryable user-facing code', async () => {
    setup(vi.fn(async () => { const e = new Error('permission'); e.name = 'NotAllowedError'; throw e; }));
    await expect(recognizeRecordedPolish().promise).rejects.toThrow('not-allowed');
  });
});
