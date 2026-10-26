/**
 * Маніфест образу ↔ каталог сервера. Каталог лише читається (масив ITEMS у гейміфікації):
 * новий одяг без запису в маніфесті або розбіжність слота/рідкості — падіння тесту.
 */
import { describe, expect, it } from 'vitest';
import { ITEMS } from '../src/content/gamification';
import { LOOK_CATALOG_HOUSE_SLOTS, LOOK_CATALOG_WEAR_SLOTS, LOOK_MANIFEST, canPurchase, findLookItem } from '@polski-go/shared';

const wearables = ITEMS.filter((i) => (LOOK_CATALOG_WEAR_SLOTS as readonly string[]).includes(i.slot));

describe('образ ↔ каталог', () => {
  it('кожен предмет одягу каталогу є в маніфесті з тим самим слотом і рідкістю', () => {
    for (const i of wearables) {
      const it = findLookItem(i.slug);
      expect(it, i.slug).not.toBeNull();
      expect(it!.catalogSlot, i.slug).toBe(i.slot);
      expect(it!.rarity, i.slug).toBe(i.rarity ?? 'common');
    }
  });

  it('у маніфесті немає предметів, яких немає в каталозі', () => {
    const slugs = new Set(ITEMS.map((i) => i.slug));
    expect(LOOK_MANIFEST.items.filter((i) => !slugs.has(i.id)).map((i) => i.id)).toEqual([]);
  });

  it('предмети домика не потрапляють у маніфест образу', () => {
    for (const i of ITEMS.filter((x) => (LOOK_CATALOG_HOUSE_SLOTS as readonly string[]).includes(x.slot))) expect(findLookItem(i.slug), i.slug).toBeNull();
  });

  it('що з одягу зараз можна купити за Złotki, а що чекає живописного шару', () => {
    const forSale = wearables.filter((i) => i.price > 0 && !i.rewardOnly && !i.starter);
    const verdicts = Object.fromEntries(forSale.map((i) => [i.slug, canPurchase({ id: `i_${i.slug}`, slot: i.slot }).ok]));
    // Купити можна лише те, що має живописне зображення (цілісний костюм або рамку).
    expect(Object.entries(verdicts).filter(([, ok]) => ok).map(([s]) => s).sort()).toEqual(['costume-artist', 'costume-dragon', 'costume-winter', 'frame-gold', 'frame-green']);
  });
});
