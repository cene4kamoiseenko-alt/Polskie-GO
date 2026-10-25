/**
 * Гардероб (макет «Цільовий візуал», екран 03): угорі — сцена образу (костюм у своєму місті
 * або примірочна з живим бобром для окремих речей), вкладки «Нагороди» / «Магазин»,
 * картки костюмів зі сценою, описом, умовою отримання і кнопкою «Приміряти».
 * Купівля й одягання — лише через сервер. У режимі «Домик» (?house=1) — меблі, декор і сувеніри.
 */
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useT, type TKey } from '../i18n';
import { api } from '../lib/api';
import { useMe, useRefreshAll, useShop } from '../lib/queries';
import type { ShopItem } from '../lib/types';
import { sfx } from '../lib/audio';
import { haptic } from '../lib/telegram';
import { Beaver, BeaverPart } from '../components/Beaver';
import { ITEM_PICTO, PictoTile } from '../components/pictograms/Pictogram';
import { WEAR_SLOTS } from '../components/ItemPreview';
import { Icon } from '../components/Icon';
import { Art } from '../components/GameArt';
import { ErrorState, ScreenSkeleton, cx, useBackButton, useToast } from '../components/ui';
import { costumeAsset, costumeScene, supportsBeaverArt, travellerScene } from '../lib/assets';

const WARDROBE_SLOTS = ['JACKET', 'BACKPACK', 'SHOES', 'ACCESSORY', 'HAT', 'GLASSES', 'SCARF', 'COSTUME', 'FRAME'];
const HOUSE_SLOTS = ['FURNITURE', 'DECOR', 'SOUVENIR'];

/** Лінійні іконки категорій. */
const SLOT_GLYPH: Record<string, ReactNode> = {
  JACKET: <path d="M8 4l4 2 4-2 4 3-2 4h-2v9H8v-9H6L4 7z" />,
  BACKPACK: <><path d="M7 9a5 5 0 0 1 10 0v10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z" /><path d="M10 4h4M9 14h6" /></>,
  SHOES: <path d="M3 15c0-3 1-6 3-6l3 3 5 2 5 1c1 0 2 1 2 2v1H3z" />,
  ACCESSORY: <><circle cx="7" cy="12" r="3.2" /><circle cx="17" cy="12" r="3.2" /><path d="M10.2 12h3.6M3 11l1-2M21 11l-1-2" /></>,
  HAT: <><path d="M5 15c0-5 3-9 7-9s7 4 7 9" /><path d="M3 15h18v2H3z" /></>,
  GLASSES: <><circle cx="7" cy="13" r="3.2" /><circle cx="17" cy="13" r="3.2" /><path d="M10.2 13h3.6M3.8 12L3 9M20.2 12l.8-3" /></>,
  SCARF: <path d="M5 7c4 3 10 3 14 0v3c-4 3-10 3-14 0zM14 11v9l3-1v-8" />,
  COSTUME: <path d="M12 3l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.3 6.8 19l1-5.8L3.6 9.1l5.8-.8z" />,
  FRAME: <><rect x="4" y="4" width="16" height="16" rx="3" /><rect x="8" y="8" width="8" height="8" rx="1" /></>,
  FURNITURE: <path d="M4 18v-6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6M4 15h16M6 18v2M18 18v2M7 10V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3" />,
  DECOR: <path d="M12 20v-7M12 13c-4 0-6-3-6-7 4 0 6 3 6 7zm0 0c4 0 6-3 6-7-4 0-6 3-6 7zM8 20h8" />,
  SOUVENIR: <><rect x="4" y="9" width="16" height="11" rx="2" /><path d="M12 9v11M4 13h16M12 9c-2-4-6-4-6-1s6 1 6 1 6 2 6-1-4-3-6 1" /></>,
};

function SlotIcon({ slot }: { slot: string }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {SLOT_GLYPH[slot]}
    </svg>
  );
}

/** Примірочна: арка з теплим світлом, рослини, вішак з одягом, капелюх, дзеркало, подіум. */
function DressingRoom() {
  return (
    <svg viewBox="0 0 390 300" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <radialGradient id="dr-glow" cx="0.5" cy="0.45" r="0.55"><stop offset="0" stopColor="#3D6FB8" /><stop offset="0.6" stopColor="#173661" /><stop offset="1" stopColor="#0A1C36" /></radialGradient>
        <linearGradient id="dr-arch" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5C8FD6" stopOpacity="0.9" /><stop offset="1" stopColor="#1E3F70" stopOpacity="0.2" /></linearGradient>
        <radialGradient id="dr-ped" cx="0.5" cy="0.3" r="0.7"><stop offset="0" stopColor="#3B5C86" /><stop offset="1" stopColor="#13253F" /></radialGradient>
        <linearGradient id="dr-spot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFF4D6" stopOpacity="0.35" /><stop offset="1" stopColor="#FFF4D6" stopOpacity="0" /></linearGradient>
      </defs>
      <rect width="390" height="300" fill="url(#dr-glow)" />
      {/* арка */}
      <path d="M118 236 V108 a77 77 0 0 1 154 0 V236 Z" fill="url(#dr-arch)" stroke="#6E9AD8" strokeOpacity="0.5" strokeWidth="3" />
      <path d="M136 236 V112 a59 59 0 0 1 118 0 V236" fill="none" stroke="#9CC4FF" strokeOpacity="0.25" strokeWidth="2" />
      {/* дзеркало зліва */}
      <rect x="18" y="72" width="54" height="120" rx="27" fill="#20406B" stroke="#C9A24A" strokeWidth="5" />
      <path d="M30 98 L46 84 M30 120 L58 94" stroke="#9CC4FF" strokeOpacity="0.35" strokeWidth="3" strokeLinecap="round" />
      {/* рослина */}
      <path d="M86 232 h28 l-4 -26 h-20 z" fill="#C9A24A" stroke="#7A5A22" strokeWidth="2" />
      {[[-14, -36], [0, -48], [14, -36], [-8, -58], [8, -60]].map(([dx, dy], i) => (
        <ellipse key={i} cx={100 + dx} cy={206 + dy / 1.4} rx="8" ry="16" fill={i % 2 ? '#2F9A55' : '#3DB565'} transform={`rotate(${dx * 2} ${100 + dx} ${206 + dy / 1.4})`} />
      ))}
      {/* вішак з одягом справа */}
      <path d="M300 64 H376 M306 64 V232 M370 64 V232" stroke="#C9A24A" strokeWidth="4" />
      {[['#E5383B', 316], ['#F4F7FA', 334], ['#3A7BD5', 352]].map(([c, x]) => (
        <g key={x as number}>
          <path d={`M${x} 64 v8`} stroke="#9AA3AD" strokeWidth="2" />
          <path d={`M${(x as number) - 10} 74 l10 -2 l10 2 l2 64 h-24 z`} fill={c as string} stroke="#0E2240" strokeWidth="1.6" />
        </g>
      ))}
      {/* капелюх на гачку */}
      <path d="M300 44 q18 -18 36 0 z" fill="#8A5A36" stroke="#0E2240" strokeWidth="1.6" />
      <rect x="294" y="42" width="48" height="5" rx="2.5" fill="#6E4428" />
      {/* світло й подіум */}
      <path d="M150 0 L240 0 L292 250 L98 250 Z" fill="url(#dr-spot)" />
      <ellipse cx="195" cy="256" rx="118" ry="26" fill="#0A1C36" opacity="0.7" />
      <ellipse cx="195" cy="246" rx="112" ry="22" fill="url(#dr-ped)" stroke="#6FB8FF" strokeWidth="3" style={{ filter: 'drop-shadow(0 0 10px rgba(54,185,255,0.75))' }} />
      <ellipse cx="195" cy="242" rx="96" ry="15" fill="#2C4A72" opacity="0.8" />
      <rect x="0" y="262" width="390" height="38" fill="#0A1A30" />
    </svg>
  );
}

function ItemArt({ item, size }: { item: ShopItem; size: number }) {
  // Костюм без бобра розпадається на частини — показуємо бобра в костюмі (растр, якщо є).
  if (item.slot === 'COSTUME') {
    const art = costumeAsset(item.assetKey);
    if (art) return <img src={art} alt="" width={size} height={size} style={{ width: size, height: size, objectFit: 'contain' }} draggable={false} />;
    return <Beaver size={size * 0.92} outfit={{ COSTUME: item.assetKey }} animate={false} vectorOnly />;
  }
  if (WEAR_SLOTS.includes(item.slot)) return <BeaverPart slot={item.slot} kind={item.assetKey} size={size} />;
  return <PictoTile spec={ITEM_PICTO[item.assetKey] ?? null} size={size * 0.8} />;
}

/** Стартовий образ «Мандрівник»: не предмет магазину, а «без костюма». */
const TRAVELLER_ID = '__traveller';
const travellerItem = (name: string, equipped: boolean): ShopItem => ({
  id: TRAVELLER_ID, slug: 'traveller', slot: 'COSTUME', name: { uk: name, ru: name, en: name }, assetKey: 'costume-traveller', price: 0,
  rarity: 'common', isPremium: false, rewardOnly: false, city: null, unlock: null, owned: true, equipped,
});
const costumeKey = (i: ShopItem) => (i.id === TRAVELLER_ID ? 'traveller' : i.assetKey.replace(/^costume-/, ''));

type Tab = 'rewards' | 'shop';

export default function ShopScreen() {
  const { t, tr } = useT();
  const [params, setParams] = useSearchParams();
  const houseMode = params.get('house') === '1';
  const nav = useNavigate();
  const shop = useShop();
  const me = useMe().data;
  const refresh = useRefreshAll();
  const toast = useToast();
  const tab: Tab = houseMode || params.get('tab') === 'shop' ? 'shop' : 'rewards';
  const slots = houseMode ? HOUSE_SLOTS : WARDROBE_SLOTS;
  const [slot, setSlot] = useState(slots[0]);
  const [picked, setPicked] = useState<ShopItem | null>(null);
  const [busy, setBusy] = useState(false);
  useBackButton(useCallback(() => nav(-1), [nav]));

  const all = shop.data?.items ?? [];
  const equippedCostume = all.find((i) => i.slot === 'COSTUME' && i.equipped) ?? null;
  const traveller = useMemo(() => travellerItem(t('wardrobe_traveller'), !equippedCostume), [t, equippedCostume]);
  // «Нагороди»: стартовий образ і костюми-нагороди великими картками, решта нагород — звичайними.
  const rewardCostumes = useMemo(() => [traveller, ...all.filter((i) => i.slot === 'COSTUME' && i.rewardOnly)], [all, traveller]);
  const otherRewards = useMemo(() => all.filter((i) => i.rewardOnly && i.slot !== 'COSTUME' && WARDROBE_SLOTS.includes(i.slot)), [all]);
  const items = useMemo(() => all.filter((i) => i.slot === slot && (houseMode || !i.rewardOnly)), [all, slot, houseMode]);
  // Примірка: бобер одразу показує вибраний предмет — ще до покупки.
  const preview = useMemo(() => {
    const wear: Record<string, string | undefined> = { ...(me?.outfit.wear ?? {}) };
    if (picked?.id === TRAVELLER_ID) delete wear.COSTUME;
    else if (picked && WEAR_SLOTS.includes(picked.slot)) wear[picked.slot] = picked.assetKey;
    return wear;
  }, [me, picked]);
  // Сцена образу: костюм — у своєму місті; фірмовий образ без інших речей — «Мандрівник».
  const scene = preview.COSTUME ? costumeScene(preview.COSTUME) : supportsBeaverArt(preview) ? travellerScene() : null;

  const pick = (i: ShopItem | null) => {
    haptic.select();
    if (i) sfx.tap();
    setPicked(i);
  };
  const stepList = tab === 'rewards' ? [...rewardCostumes, ...otherRewards] : items;
  const step = (d: number) => {
    if (!stepList.length) return;
    const idx = picked ? stepList.findIndex((i) => i.id === picked.id) : -1;
    pick(stepList[(idx + d + stepList.length) % stepList.length]);
  };
  const setTab = (next: Tab) => {
    haptic.select();
    setPicked(null);
    setParams(next === 'shop' ? { tab: 'shop' } : {}, { replace: true });
  };

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

  const unlockText = (i: ShopItem) =>
    i.unlock ? t(`unlock_${i.unlock.kind}` as TKey, { title: tr(i.unlock.title) }) : i.isPremium ? t('unlock_premium') : t('shop_reward_only');

  if (shop.isLoading) return <ScreenSkeleton />;
  if (shop.error) return <ErrorState error={shop.error} onRetry={() => shop.refetch()} />;
  const balance = shop.data!.balance;
  const wearable = picked ? WEAR_SLOTS.includes(picked.slot) : true;

  const costumeCard = (i: ShopItem, n: number) => {
    const key = costumeKey(i);
    const art = i.id === TRAVELLER_ID ? travellerScene() : costumeScene(i.assetKey);
    const selected = picked?.id === i.id;
    const status = i.id === TRAVELLER_ID ? t('unlock_starter') : i.owned ? t('wardrobe_owned') : i.rewardOnly || (i.isPremium && !shop.data!.premium) ? unlockText(i) : null;
    return (
      <motion.article
        key={i.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(n, 6) * 0.04, duration: 0.25 }}
        className={cx('costume-card flex flex-col', selected && 'is-selected', i.equipped && 'is-equipped')}
      >
        <div className="costume-card-art">
          {art ? <img src={art} alt="" loading="lazy" decoding="async" draggable={false} /> : <span className="grid h-full place-items-center"><ItemArt item={i} size={110} /></span>}
          {i.equipped && <span className="costume-card-badge"><Icon name="check" size={14} strokeWidth={3.4} /> {t('shop_wearing')}</span>}
        </div>
        <div className="flex flex-1 flex-col gap-1.5 p-3 pt-2.5">
          <h3 className="text-[15px] font-black leading-tight">{tr(i.name)}</h3>
          <p className="muted line-clamp-2 text-[12px] font-bold leading-snug">{t(`costume_desc_${key}` as TKey)}</p>
          <div className="mt-auto flex min-h-[30px] items-center gap-1.5 pt-1">
            {status ? (
              <span className={cx('costume-card-cond', i.owned && 'is-owned')}>
                {i.owned ? <Icon name="check" size={13} strokeWidth={3.2} /> : <Art name={i.unlock?.kind === 'mission' ? 'scroll' : i.unlock?.kind === 'city' ? 'passport' : i.isPremium ? 'crown' : 'medal-gold'} size={18} />}
                <span className="line-clamp-3">{status}</span>
              </span>
            ) : (
              <span className="costume-card-cond"><Art name="coin" size={18} /> {i.price}</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => pick(selected ? null : i)}
            aria-pressed={selected}
            className={cx('btn mt-1 !min-h-[40px] w-full !rounded-xl !px-2 text-[14px]', selected ? 'btn-primary' : 'btn-outline')}
          >
            {t('wardrobe_try')}
          </button>
        </div>
      </motion.article>
    );
  };

  const itemCard = (i: ShopItem, n: number) => {
    const color = i.equipped ? 'var(--color-brand)' : `var(--rarity-${i.rarity}, var(--rarity-common))`;
    const selected = picked?.id === i.id;
    return (
      <motion.button
        key={i.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(n, 6) * 0.04, duration: 0.25 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => pick(selected ? null : i)}
        aria-pressed={selected}
        className={cx('item-card relative flex flex-col items-center gap-1.5 px-2 pb-3 pt-3', `is-${i.rarity}`, i.equipped && 'is-equipped', selected && 'is-selected')}
        style={{ ['--item-color' as string]: color }}
      >
        {i.isPremium && <span className="absolute right-2 top-2"><Art name="crown" size={24} /></span>}
        {i.rewardOnly && !i.owned && <span className="absolute right-2 top-2"><Art name="medal-gold" size={26} /></span>}
        <span className="item-rarity absolute left-2 top-2 rounded-full px-1.5 py-px text-[10.5px] font-black uppercase tracking-wide">{t(`rarity_${i.rarity}` as TKey)}</span>
        <span className="mt-3 grid h-[112px] w-full place-items-center">
          <span className="drop-shadow-[0_8px_8px_rgba(0,0,0,0.45)]">
            <ItemArt item={i} size={104} />
          </span>
        </span>
        <span className="line-clamp-2 min-h-[38px] text-center text-[15px] font-black leading-tight">{tr(i.name)}</span>
        {i.owned ? (
          <span className={cx('grid h-8 min-w-[40px] place-items-center rounded-lg px-2', i.equipped ? 'item-equipped' : 'border border-brand/60 text-brand')}>
            {i.equipped ? <Icon name="check" size={20} strokeWidth={3.2} /> : <span className="text-[12px] font-black">{t('shop_owned')}</span>}
          </span>
        ) : i.rewardOnly ? (
          <span className="line-clamp-2 px-1 text-center text-[11.5px] font-black leading-tight text-grape">{unlockText(i)}</span>
        ) : (
          <span className="item-price flex items-center gap-1.5 rounded-full px-4 py-1 text-[17px] font-black"><Art name="coin" size={22} /> {i.price}</span>
        )}
      </motion.button>
    );
  };

  const isTraveller = picked?.id === TRAVELLER_ID;
  return (
    <div className="pb-36">
      {/* Заголовок */}
      <div className="safe-top relative z-10 flex items-center gap-3 px-4 pt-3">
        <h1 className="flex-1 text-[34px] font-black leading-none">{houseMode ? t('house_edit') : t('shop_title')}</h1>
        <span className="hud-pill !h-11 !px-4 !text-[18px]"><Art name="coin" size={26} /> {balance}</span>
      </div>

      {/* Сцена образу або примірочна */}
      {!houseMode && (
        <div className="wardrobe-stage relative mx-4 mt-3 overflow-hidden">
          <AnimatePresence initial={false}>
            <motion.div
              key={scene ?? 'room'}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {scene ? (
                <img src={scene} alt="" className="h-full w-full object-cover" draggable={false} />
              ) : (
                <>
                  <DressingRoom />
                  <div className="absolute inset-x-0 bottom-[30px] flex justify-center">
                    <Beaver size={176} outfit={preview} mood={picked ? 'cheer' : 'happy'} />
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
          <div className="wardrobe-stage-shade" />
          {stepList.length > 1 && (
            <>
              <button onClick={() => step(-1)} aria-label={t('shop_prev')} className="glass-card absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center !rounded-full text-white active:scale-90"><Icon name="chevron-right" size={22} className="rotate-180" /></button>
              <button onClick={() => step(1)} aria-label={t('shop_next')} className="glass-card absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center !rounded-full text-white active:scale-90"><Icon name="chevron-right" size={22} /></button>
            </>
          )}
          {picked && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="glass-card absolute bottom-3 left-1/2 max-w-[80%] -translate-x-1/2 truncate px-3 py-1 text-[12px] font-black text-white">
              {t('shop_trying')}: {tr(picked.name)}
            </motion.div>
          )}
        </div>
      )}

      {/* Вкладки «Нагороди» / «Магазин» */}
      {!houseMode && (
        <div role="tablist" className="segmented mx-4 mt-4">
          {(['rewards', 'shop'] as Tab[]).map((k) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => tab !== k && setTab(k)} className={cx('segmented-item', tab === k && 'is-active')}>
              {t(k === 'rewards' ? 'wardrobe_tab_rewards' : 'wardrobe_tab_shop')}
            </button>
          ))}
        </div>
      )}

      {tab === 'rewards' ? (
        <>
          <h2 className="mx-4 mt-5 text-[20px] font-black">{t('wardrobe_costumes')}</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 px-4">{rewardCostumes.map(costumeCard)}</div>
          {otherRewards.length > 0 && (
            <>
              <h2 className="mx-4 mt-6 text-[20px] font-black">{t('wardrobe_other_rewards')}</h2>
              <div className="mt-3 grid grid-cols-2 gap-3 px-4">{otherRewards.map(itemCard)}</div>
            </>
          )}
        </>
      ) : (
        <>
          {/* Категорії */}
          <div className="no-scrollbar relative z-10 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 pt-1">
            {slots.map((s) => (
              <button
                key={s}
                onClick={() => { haptic.select(); setSlot(s); setPicked(null); }}
                aria-pressed={s === slot}
                className={cx('chip-tab', s === slot && 'is-active')}
              >
                <SlotIcon slot={s} /> {t(`slot_${s}` as TKey)}
              </button>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 px-4">{items.map((i, n) => (i.slot === 'COSTUME' ? costumeCard(i, n) : itemCard(i, n)))}</div>
        </>
      )}
      <div className="mx-4 mt-5 flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-elev p-3.5">
        <span className="info-dot grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 text-lg font-black">i</span>
        <span className="muted text-[13px] font-bold leading-snug">{t('shop_earn_hint')}</span>
      </div>

      {/* Панель дії для вибраного предмета */}
      <AnimatePresence>
        {picked && (
          <motion.div initial={{ y: 120 }} animate={{ y: 0 }} exit={{ y: 120 }} transition={{ type: 'spring', stiffness: 300, damping: 28 }} className="safe-bottom fixed inset-x-0 bottom-0 z-40 mx-auto max-w-xl px-3">
            <div className="action-sheet flex items-center gap-3 rounded-[22px] p-3">
              <span className="action-sheet-art grid h-14 w-14 shrink-0 place-items-center rounded-2xl">
                {isTraveller ? <Beaver size={50} mood="happy" outfit={{ JACKET: 'hoodie-red', BACKPACK: 'backpack-travel' }} animate={false} /> : <ItemArt item={picked} size={50} />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="line-clamp-2 text-[15px] font-black leading-tight">{tr(picked.name)}</div>
                <div className="line-clamp-2 text-[11px] font-black" style={{ color: `var(--rarity-${picked.rarity}, var(--rarity-common))` }}>
                  {!picked.owned && (picked.rewardOnly || picked.isPremium) ? unlockText(picked) : `${t(`rarity_${picked.rarity}` as TKey)}${picked.city ? ` · ${tr(picked.city.name)}` : ''}`}
                </div>
              </div>
              {isTraveller ? (
                <button
                  className="btn btn-green min-h-[46px] px-4"
                  disabled={busy || !equippedCostume}
                  onClick={() => equippedCostume && act(() => api('/inventory/equip', { body: { itemId: equippedCostume.id, equipped: false } }), t('toast_saved'))}
                >
                  {equippedCostume ? t('wardrobe_take_off') : t('shop_wearing')}
                </button>
              ) : picked.owned ? (
                <button className="btn btn-green min-h-[46px] px-4" disabled={busy} onClick={() => act(() => api('/inventory/equip', { body: { itemId: picked.id, equipped: !picked.equipped } }), t('toast_saved'))}>
                  {picked.equipped ? (wearable ? t('shop_unequip') : t('shop_remove')) : wearable ? t('shop_equip') : t('shop_place')}
                </button>
              ) : picked.rewardOnly ? (
                picked.unlock?.kind === 'mission' && picked.unlock.slug ? (
                  <button className="btn btn-sky min-h-[46px] px-4" onClick={() => nav(`/life/${picked.unlock!.slug}`)}>{t('wardrobe_go_mission')}</button>
                ) : null
              ) : picked.isPremium && !shop.data!.premium ? (
                <button className="btn btn-xp min-h-[46px] px-4" onClick={() => nav('/premium')}>{t('shop_premium_only')}</button>
              ) : (
                <button className="btn btn-primary min-h-[46px] px-4" disabled={busy || balance < picked.price} onClick={() => act(() => api('/shop/buy', { body: { itemId: picked.id } }), t('shop_bought'))}>
                  {balance < picked.price ? t('shop_no_money') : <><Art name="coin" size={20} /> {picked.price}</>}
                </button>
              )}
              <button onClick={() => pick(null)} aria-label={t('shop_cancel_try')} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[var(--text-muted)]"><Icon name="x" size={18} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
