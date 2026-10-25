/** Portable canonical mono PCM16 WAV for short speech clips (no browser/Node dependencies). */
export const SPEECH_SAMPLE_RATE = 16_000;
export const MAX_SPEECH_SECONDS = 30;
export const MAX_SPEECH_BYTES = 44 + SPEECH_SAMPLE_RATE * MAX_SPEECH_SECONDS * 2;
export function encodeSpeechWav(chunks: readonly Float32Array[], sampleRate: number): Uint8Array {
  if (!Number.isFinite(sampleRate) || sampleRate < 8000 || sampleRate > 192000) throw new Error('bad_sample_rate');
  const length = chunks.reduce((n, c) => n + c.length, 0);
  if (length > sampleRate * MAX_SPEECH_SECONDS + 128) throw new Error('recording_too_long');
  const input = new Float32Array(length);
  let at = 0;
  for (const chunk of chunks) { input.set(chunk, at); at += chunk.length; }
  const n = Math.min(SPEECH_SAMPLE_RATE * MAX_SPEECH_SECONDS, Math.floor(length * SPEECH_SAMPLE_RATE / sampleRate));
  const out = new Uint8Array(44 + n * 2); const v = new DataView(out.buffer);
  const text = (offset: number, s: string) => { for (let i = 0; i < s.length; i++) out[offset + i] = s.charCodeAt(i); };
  text(0, 'RIFF'); v.setUint32(4, out.length - 8, true); text(8, 'WAVE'); text(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, SPEECH_SAMPLE_RATE, true); v.setUint32(28, SPEECH_SAMPLE_RATE * 2, true);
  v.setUint16(32, 2, true); v.setUint16(34, 16, true); text(36, 'data'); v.setUint32(40, n * 2, true);
  // Average input samples when downsampling, avoiding sample-dropping aliasing.
  for (let i = 0; i < n; i++) {
    const from = Math.floor(i * sampleRate / SPEECH_SAMPLE_RATE);
    const to = Math.min(length, Math.max(from + 1, Math.floor((i + 1) * sampleRate / SPEECH_SAMPLE_RATE)));
    let sum = 0; for (let j = from; j < to; j++) sum += Number.isFinite(input[j]) ? input[j] : 0;
    const sample = Math.max(-1, Math.min(1, sum / (to - from)));
    v.setInt16(44 + i * 2, Math.round(sample * (sample < 0 ? 32768 : 32767)), true);
  }
  return out;
}
/** Only the canonical format produced by our recorder is accepted. */
export function validSpeechWav(bytes: Uint8Array): boolean {
  if (bytes.length < 44 + 3200 || bytes.length > MAX_SPEECH_BYTES || bytes.length % 2) return false;
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const text = (offset: number, s: string) => [...s].every((c, i) => bytes[offset + i] === c.charCodeAt(0));
  return text(0, 'RIFF') && text(8, 'WAVE') && text(12, 'fmt ') && text(36, 'data')
    && v.getUint32(4, true) === bytes.length - 8 && v.getUint32(16, true) === 16
    && v.getUint16(20, true) === 1 && v.getUint16(22, true) === 1
    && v.getUint32(24, true) === SPEECH_SAMPLE_RATE && v.getUint32(28, true) === SPEECH_SAMPLE_RATE * 2
    && v.getUint16(32, true) === 2 && v.getUint16(34, true) === 16 && v.getUint32(40, true) === bytes.length - 44;
}

/** Поріг RMS кадру (≈ −44 dBFS): тихіше — фон або клацання, а не мовлення. Не перевірено на реальному мікрофоні iPhone. */
export const VOICE_RMS_THRESHOLD = 0.006;

/**
 * Чи є в записі голос: щонайменше три 20-мілісекундні кадри з RMS вище порога.
 * Тишу клієнт не надсилає платному розпізнаванню, а показує стан «тиша».
 */
export function hasVoiceActivity(chunks: readonly Float32Array[], sampleRate: number, threshold = VOICE_RMS_THRESHOLD): boolean {
  const frame = Math.max(1, Math.round(sampleRate * 0.02));
  let sum = 0, n = 0, loud = 0;
  for (const chunk of chunks) {
    for (let i = 0; i < chunk.length; i++) {
      const x = Number.isFinite(chunk[i]) ? chunk[i] : 0;
      sum += x * x;
      if (++n < frame) continue;
      if (Math.sqrt(sum / n) >= threshold && ++loud >= 3) return true;
      sum = 0; n = 0;
    }
  }
  return false;
}

/** Рівень сигналу блоку 0..1 для індикатора запису (RMS, підсилений для наочності). */
export function blockLevel(block: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < block.length; i++) sum += block[i] * block[i];
  return Math.min(1, Math.sqrt(sum / Math.max(1, block.length)) * 8);
}
