import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useT, type TKey } from '../i18n';
import { api } from '../lib/api';
import { useMe, useRefreshAll, useShop } from '../lib/queries';
import type { ShopItem } from '../lib/types';
import { sfx } from '../lib/audio';
import { haptic } from '../lib/telegram';
import { Beaver, ITEM_ICONS } from '../components/Beaver';
import { ErrorState, ScreenHeader, ScreenSkeleton, Sheet, cx, useToast } from '../components/ui';

const WEAR_SLOTS = ['HAT', 'GLASSES', 'SCARF', 'JACKET', 'BACKPACK', 'SHOES', 'ACCESSORY', 'COSTUME', 'FRAME'];
const ALL_SLOTS = [...WEAR_SLOTS, 'FURNITURE', 'DECOR', 'SOUVENIR'];
const RARITY: Record<string, string> = { common: '#B9C3CB', rare: '#69C7F4', epic: '#9B6BFF', legendary: '#FFC857' };

export default function ShopScreen() {
  const { t, tr } = useT();
  const [params] = useSearchParams();
  const houseMode = params.get('house') === '1';
  const nav = useNavigate();
  const shop = useShop();
  const me = useMe().data;
  const refresh = useRefreshAll();
  const toast = useToast();
  const slots = houseMode ? ['FURNITURE', 'DECOR', 'SOUVENIR'] : ALL_SLOTS;
  const [slot, setSlot] = useState(slots[0]);
  const [picked, setPicked] = useState<ShopItem | null>(null);
  const [busy, setBusy] = useState(false);

  const items = useMemo(() => shop.data?.items.filter((i) => i.slot === slot) ?? [], [shop.data, slot]);
  // Примірка: показуємо бобра у вибраному предметі ще до покупки.
  const preview = useMemo(() => {
    const wear = { ...(me?.outfit.wear ?? {}) };
    if (picked && WEAR_SLOTS.includes(picked.slot)) wear[picked.slot] = picked.assetKey;
    return wear;
  }, [me, picked]);

  const act = async (fn: () => Promise<unknown>, okText: string) => {
    setBusy(true);
    try {
      await fn();
      sfx.coin();
      haptic.success();
      toast(okText, '✨');
      await refresh();
      setPicked(null);
    } catch (e) {
      toast(t('toast_error', { msg: (e as Error).message }), '⚠️');
    } finally {
      setBusy(false);
    }
  };

  if (shop.isLoading) return <ScreenSkeleton />;
  if (shop.error) return <ErrorState error={shop.error} onRetry={() => shop.refetch()} />;
  const balance = shop.data!.balance;
  const wearable = picked ? WEAR_SLOTS.includes(picked.slot) : true;

  return (
    <div className="pb-6">
      <ScreenHeader title={houseMode ? t('house_edit') : t('shop_title')} right={<span className="chip text-base">🪙 {balance}</span>} />
      {!houseMode && (
        <div className="mx-4 grid place-items-center rounded-[28px] py-3" style={{ background: 'radial-gradient(circle at 50% 40%, #DFF6E8, transparent 70%)' }}>
          <Beaver size={170} outfit={preview} mood={picked ? 'cheer' : 'happy'} />
        </div>
      )}
      <div className="no-scrollbar my-3 flex gap-2 overflow-x-auto px-4">
        {slots.map((s) => (
          <button key={s} onClick={() => { haptic.select(); setSlot(s); }} className={cx('chip shrink-0 px-4 py-2', s === slot && 'bg-pl-red text-white')}>
            {t(`slot_${s}` as TKey)}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3 px-4">
        {items.map((i) => (
          <motion.button
            key={i.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => { haptic.tap(); setPicked(i); }}
            className={cx('card relative flex flex-col items-center gap-1 p-3', i.equipped && 'ring-4 ring-brand')}
            style={{ borderTop: `4px solid ${RARITY[i.rarity] ?? RARITY.common}` }}
          >
            <span className="text-4xl">{ITEM_ICONS[i.assetKey] ?? '🎁'}</span>
            <span className="line-clamp-2 text-center text-xs font-black leading-tight">{tr(i.name)}</span>
            <span className="text-xs font-black">
              {i.owned ? (i.equipped ? '✅' : `✓ ${t('shop_owned')}`) : i.rewardOnly ? '🏅' : `🪙 ${i.price}`}
            </span>
            {i.isPremium && <span className="absolute right-1 top-1 text-sm">👑</span>}
          </motion.button>
        ))}
      </div>
      <p className="muted mx-6 mt-5 text-center text-xs font-bold">{t('shop_earn_hint')}</p>

      <Sheet open={!!picked} onClose={() => setPicked(null)}>
        {picked && (
          <div className="space-y-4 text-center">
            <div className="text-6xl">{ITEM_ICONS[picked.assetKey] ?? '🎁'}</div>
            <h2 className="text-2xl font-black">{tr(picked.name)}</h2>
            <div className="flex justify-center gap-2">
              <span className="chip capitalize" style={{ color: RARITY[picked.rarity] }}>● {picked.rarity}</span>
              {picked.city && <span className="chip">📍 {tr(picked.city.name)}</span>}
            </div>
            {picked.owned ? (
              <button className="btn btn-primary w-full" disabled={busy} onClick={() => act(() => api('/inventory/equip', { body: { itemId: picked.id, equipped: !picked.equipped } }), t('toast_saved'))}>
                {picked.equipped ? (wearable ? t('shop_unequip') : t('shop_remove')) : wearable ? t('shop_equip') : t('shop_place')}
              </button>
            ) : picked.rewardOnly ? (
              <div className="rounded-2xl bg-muted p-3 font-bold">🏅 {t('shop_reward_only')}</div>
            ) : picked.isPremium && !shop.data!.premium ? (
              <button className="btn btn-xp w-full" onClick={() => nav('/premium')}>👑 {t('shop_premium_only')}</button>
            ) : (
              <button className="btn btn-primary w-full" disabled={busy || balance < picked.price} onClick={() => act(() => api('/shop/buy', { body: { itemId: picked.id } }), t('shop_bought'))}>
                {balance < picked.price ? t('shop_no_money') : `${t('shop_buy')} · 🪙 ${picked.price}`}
              </button>
            )}
          </div>
        )}
      </Sheet>
    </div>
  );
}
