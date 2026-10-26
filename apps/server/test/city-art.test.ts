/**
 * Інвентар фонів міст (CITY_ART, docs/CITY_ART_INVENTORY.md) збігається з містами seed і з файлами:
 * кожне з 20 міст описане, у final/interim є основний файл потрібного розміру і варіант 640 px,
 * у missing файлу немає (клієнт не видає загальну сцену за готовий малюнок), вага в межах бюджету.
 */
import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CITY_ART, CITY_ART_SMALL } from '@polski-go/shared';
import { CITIES, REMOVED_CITIES } from '../src/content/cities';

const dir = new URL('../../web/src/assets/cities/', import.meta.url);
const file = (name: string) => new URL(name, dir);
const doc = readFileSync(new URL('../../../docs/CITY_ART_INVENTORY.md', import.meta.url), 'utf8');

/** Розмір WebP із заголовка RIFF: VP8 (з втратами), VP8L (без втрат), VP8X (розширений). */
function webpSize(buf: Buffer): { width: number; height: number } {
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

describe('Фони міст', () => {
  it('інвентар описує рівно 20 міст маршруту, без прибраних', () => {
    expect(Object.keys(CITY_ART).sort()).toEqual(CITIES.map((c) => c.slug).sort());
    expect(CITIES).toHaveLength(20);
    for (const slug of REMOVED_CITIES) expect(CITY_ART[slug]).toBeUndefined();
  });

  it('final і interim: основний файл заявленого розміру, варіант 640 px, вага в бюджеті', () => {
    for (const [slug, art] of Object.entries(CITY_ART)) {
      if (art.status === 'missing') continue;
      const main = readFileSync(file(`${slug}.webp`));
      expect(webpSize(main), slug).toEqual({ width: art.width, height: art.height });
      expect(main.length, `${slug}.webp`).toBeLessThanOrEqual(220 * 1024);
      const small = readFileSync(file(`${slug}@${CITY_ART_SMALL}.webp`));
      expect(webpSize(small).width, `${slug}@${CITY_ART_SMALL}`).toBe(CITY_ART_SMALL);
      expect(small.length, `${slug}@${CITY_ART_SMALL}.webp`).toBeLessThanOrEqual(60 * 1024);
      // Висота не менша за ~1.9× найвищого банера (256 px на головній), інакше кадр розтягується.
      expect(art.height!, slug).toBeGreaterThanOrEqual(440);
    }
  });

  it('missing: файлу немає, а в документі є вимоги і промпт для цього міста', () => {
    for (const [slug, art] of Object.entries(CITY_ART)) {
      if (art.status !== 'missing') continue;
      expect(existsSync(file(`${slug}.webp`)), slug).toBe(false);
      expect(doc, slug).toContain(`### ${slug}`);
    }
  });

  it('документ інвентаря згадує кожне місто і його статус', () => {
    for (const [slug, art] of Object.entries(CITY_ART)) expect(doc, slug).toMatch(new RegExp(`\\| \`${slug}\` \\|[^\\n]*\\| ${art.status} \\|`));
  });
});
