import { BeaverPart } from './BeaverPart';
import { ITEM_PICTO, PictoTile } from './pictograms/Pictogram';

export const WEAR_SLOTS = ['HAT', 'GLASSES', 'SCARF', 'JACKET', 'BACKPACK', 'SHOES', 'ACCESSORY', 'COSTUME', 'FRAME'];

/**
 * Превʼю предмета: одяг — значок самого предмета (без бобра: на Бобеку річ видно лише через resolveLook),
 * меблі й сувеніри — піктограма. Етап M2 ADR-005 замінить значки одягу сценою костюма або карткою «скоро».
 */
export function ItemPreview({ slot, assetKey, size = 64 }: { slot: string; assetKey: string; size?: number }) {
  if (WEAR_SLOTS.includes(slot)) {
    return (
      <span className="grid place-items-center overflow-hidden rounded-2xl bg-muted" style={{ width: size, height: size }}>
        <BeaverPart slot={slot} kind={assetKey} size={size * 0.8} />
      </span>
    );
  }
  return <PictoTile spec={ITEM_PICTO[assetKey] ?? null} size={size} />;
}
