import { Beaver, type BeaverOutfit } from './Beaver';
import { ITEM_PICTO, PictoTile } from './pictograms/Pictogram';

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
  return <PictoTile spec={ITEM_PICTO[assetKey] ?? null} size={size} />;
}
