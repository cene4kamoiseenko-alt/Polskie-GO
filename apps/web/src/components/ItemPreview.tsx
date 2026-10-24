import { Beaver, ITEM_ICONS, type BeaverOutfit } from './Beaver';

export const WEAR_SLOTS = ['HAT', 'GLASSES', 'SCARF', 'JACKET', 'BACKPACK', 'SHOES', 'ACCESSORY', 'COSTUME', 'FRAME'];

/** Превʼю предмета: одяг — на маленькому бобрі (вектор), меблі й сувеніри — значок. */
export function ItemPreview({ slot, assetKey, size = 64 }: { slot: string; assetKey: string; size?: number }) {
  if (WEAR_SLOTS.includes(slot)) {
    return (
      <span className="grid place-items-center overflow-hidden rounded-2xl bg-muted" style={{ width: size, height: size }}>
        <Beaver mood="happy" size={size * 0.95} animate={false} vectorOnly outfit={{ [slot]: assetKey } as BeaverOutfit} />
      </span>
    );
  }
  return <span className="grid place-items-center rounded-2xl bg-muted" style={{ width: size, height: size, fontSize: size * 0.55 }}>{ITEM_ICONS[assetKey] ?? '🎁'}</span>;
}
