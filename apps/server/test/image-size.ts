import { expect } from 'vitest';

/** Розмір WebP із заголовка RIFF: VP8 (з втратами), VP8L (без втрат), VP8X (розширений). */
export function webpSize(buf: Buffer): { width: number; height: number } {
  expect(buf.toString('ascii', 0, 4)).toBe('RIFF');
  expect(buf.toString('ascii', 8, 12)).toBe('WEBP');
  const chunk = buf.toString('ascii', 12, 16);
  if (chunk === 'VP8 ') return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
  if (chunk === 'VP8L') {
    const b = buf.readUInt32LE(21);
    return { width: (b & 0x3fff) + 1, height: ((b >> 14) & 0x3fff) + 1 };
  }
  if (chunk === 'VP8X') return { width: buf.readUIntLE(24, 3) + 1, height: buf.readUIntLE(27, 3) + 1 };
  throw new Error(`невідомий блок WebP: ${chunk}`);
}

/** Розмір JPEG із першого блоку SOF. */
export function jpegSize(b: Buffer): { width: number; height: number } {
  expect([b[0], b[1]], 'JPEG').toEqual([0xff, 0xd8]);
  let i = 2;
  while (i < b.length) {
    if (b[i] !== 0xff) throw new Error('bad jpeg');
    const marker = b[i + 1];
    const len = b.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) };
    i += 2 + len;
  }
  throw new Error('no SOF');
}

/** Розмір PNG із заголовка IHDR. */
export function pngSize(b: Buffer): { width: number; height: number } {
  expect(b.toString('ascii', 1, 4), 'PNG').toBe('PNG');
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
}
