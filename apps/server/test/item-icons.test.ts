/**
 * Мальовані значки речей гардероба (листи владельца 2026-10-29): у кожної речі, яку Бобек носить, є значок
 * apps/web/src/assets/items/<slug>.webp, і немає зайвих файлів без речі в каталозі.
 */
import { readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ITEMS } from '../src/content/gamification';

const WEAR = ['HAT', 'GLASSES', 'SCARF', 'JACKET', 'BACKPACK', 'SHOES', 'ACCESSORY'];

describe('значки речей гардероба', () => {
  it('кожна річ одягу й аксесуар має мальований значок; файлів без речі немає', () => {
    const files = readdirSync(new URL('../../web/src/assets/items/', import.meta.url)).filter((f) => f.endsWith('.webp')).map((f) => f.replace(/\.webp$/, '')).sort();
    const wear = ITEMS.filter((i) => WEAR.includes(i.slot)).map((i) => i.slug).sort();
    expect(files).toEqual(wear);
  });
});
