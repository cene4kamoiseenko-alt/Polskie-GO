import { describe, expect, it } from 'vitest';
import { encodeSpeechWav, validSpeechWav, MAX_SPEECH_BYTES } from '../src/wav';
describe('Short speech WAV', () => {
  it('produces canonical 16 kHz mono PCM16 and preserves clip duration', () => {
    const bytes = encodeSpeechWav([new Float32Array(4800).fill(0.25), new Float32Array(4800).fill(-0.25)], 48000);
    expect(bytes.length).toBe(44 + 3200 * 2);
    expect(validSpeechWav(bytes)).toBe(true);
    const v = new DataView(bytes.buffer);
    expect(v.getInt16(44, true)).toBeGreaterThan(0);
    expect(v.getInt16(44 + 1600 * 2, true)).toBeLessThan(0);
  });
  it('clips PCM amplitude and rejects invalid rates or excessive recordings', () => {
    const bytes = encodeSpeechWav([new Float32Array(1600).fill(9)], 16000);
    expect(new DataView(bytes.buffer).getInt16(44, true)).toBe(32767);
    expect(() => encodeSpeechWav([], 0)).toThrow('bad_sample_rate');
    expect(() => encodeSpeechWav([new Float32Array(16000 * 31)], 16000)).toThrow('recording_too_long');
  });
  it('rejects missing/malformed format, length, duration or data fields', () => {
    const good = encodeSpeechWav([new Float32Array(1600)], 16000);
    for (const pos of [0, 8, 12, 20, 22, 24, 28, 32, 34, 36, 40]) {
      const bad = good.slice(); bad[pos] ^= 1; expect(validSpeechWav(bad), String(pos)).toBe(false);
    }
    expect(validSpeechWav(good.slice(0, 100))).toBe(false);
    expect(validSpeechWav(new Uint8Array(MAX_SPEECH_BYTES + 2))).toBe(false);
  });
});
