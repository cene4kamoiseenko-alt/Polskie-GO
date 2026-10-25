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

import { hasVoiceActivity } from '../src/wav';

describe('hasVoiceActivity: тиша не йде в розпізнавання', () => {
  const tone = (seconds: number, amp: number, rate = 48000) => {
    const a = new Float32Array(Math.round(seconds * rate));
    for (let i = 0; i < a.length; i++) a[i] = amp * Math.sin((2 * Math.PI * 220 * i) / rate);
    return a;
  };
  it('цифрова тиша і тихий фон — без голосу', () => {
    expect(hasVoiceActivity([new Float32Array(48000)], 48000)).toBe(false);
    expect(hasVoiceActivity([tone(1, 0.003)], 48000)).toBe(false);
  });
  it('одиночне клацання не вважається мовленням', () => {
    const a = new Float32Array(48000);
    a.fill(0.9, 1000, 1200);
    expect(hasVoiceActivity([a], 48000)).toBe(false);
  });
  it('звичайна гучність голосу розпізнається, зокрема розбита на блоки по 128 семплів', () => {
    const t = tone(0.5, 0.1);
    const blocks: Float32Array[] = [];
    for (let i = 0; i < t.length; i += 128) blocks.push(t.slice(i, i + 128));
    expect(hasVoiceActivity(blocks, 48000)).toBe(true);
  });
});
