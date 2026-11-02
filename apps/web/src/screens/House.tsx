import { motion } from '../lib/motion';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT, type TKey } from '../i18n';
import { ApiError, api } from '../lib/api';
import { artImage } from '../lib/assets';
import { sfx } from '../lib/audio';
import { haptic } from '../lib/telegram';
import { useMe, useRefreshAll, useShop } from '../lib/queries';
import type { ShopItem } from '../lib/types';
import { Beaver } from '../components/Beaver';
import { Art } from '../components/GameArt';
import { Icon } from '../components/Icon';
import { ITEM_PICTO, PictoTile } from '../components/pictograms/Pictogram';
import { ScreenHeader, ScreenSkeleton, Sheet, cx, useToast } from '../components/ui';

/**
 * Домик Бобека (2026-11-02): жильё — цельные комнаты из пакета владельца (Opole / Łódź / Kraków / Warszawa). Бесплатна первая, остальные покупаются за Złotki и переключаются.
 * Выбор и покупку проверяет сервер (`/shop/buy`, `/inventory/equip`, слот HOUSING); экран показывает его состояние и переживает перезагрузку.
 * Бобёр рисуется поверх фона отдельно (в своём образе), вещи из магазина (мебель, декор, сувениры) — полосой под комнатой: на готовой обставленной комнате стикеры мебели не нужны.
 */
const HOMES: Record<string, { pl: string; city: string; file: string; desc: TKey; bobek: [number, number, number] }> = {
  // bobek: [x % центра, y % низа (от верха кадра), размер px] — где Бобёр стоит на полу каждой комнаты
  'housing-opole': { pl: 'Pokój w Opolu', city: 'Opole', file: 'housing-opole', desc: 'housing_opole_d', bobek: [66, 99, 92] },
  'housing-lodz': { pl: 'Kawalerka w Łodzi', city: 'Łódź', file: 'housing-lodz', desc: 'housing_lodz_d', bobek: [62, 99, 92] },
  'housing-krakow': { pl: 'Mieszkanie w Krakowie', city: 'Kraków', file: 'housing-krakow', desc: 'housing_krakow_d', bobek: [58, 99, 92] },
  'housing-warszawa': { pl: 'Apartament w Warszawie', city: 'Warszawa', file: 'housing-warszawa', desc: 'housing_warszawa_d', bobek: [54, 99, 92] },
};
const room = (slug: string) => {
  const h = HOMES[slug];
  const art = h ? artImage('housing', { file: h.file, width: 1200 }) : null;
  return art ? { src: art.src, srcSet: art.srcSet } : null;
};

/** 2500 → «2 500» (пробел как разделитель разрядов в любом языке интерфейса). */
const num = (n: number) => n.toLocaleString('en-US').replace(/,/g, ' ');

export default function HouseScreen() {
  const { t, tr } = useT();
  const nav = useNavigate();
  const toast = useToast();
  const refresh = useRefreshAll();
  const me = useMe().data;
  const shop = useShop();
  const [confirm, setConfirm] = useState<ShopItem | null>(null);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  if (!me || shop.isLoading) return <ScreenSkeleton />;

  const balance = shop.data?.balance ?? 0;
  const homes = (shop.data?.items ?? []).filter((i) => i.slot === 'HOUSING');
  const current = homes.find((h) => h.equipped) ?? homes.find((h) => h.slug === me.outfit.home) ?? homes[0];
  const currentHome = current ? HOMES[current.slug] : undefined;
  const placed = me.outfit.house;
  const night = new Date().getHours() >= 22 || new Date().getHours() < 6;

  /** Запрос к серверу; после ответа обновляем всё, что могло измениться (профиль, магазин, баланс). */
  const act = async (fn: () => Promise<unknown>, okText: string) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    try {
      await fn();
      sfx.coin();
      haptic.success();
      toast(okText, '🏠');
      await refresh();
      setConfirm(null);
    } catch (e) {
      toast(t('toast_error', { msg: e instanceof ApiError ? e.message : (e as Error).message }), '⚠️');
      void shop.refetch();
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  const choose = (h: ShopItem) => act(() => api('/inventory/equip', { body: { itemId: h.id, equipped: true } }), t('housing_moved'));
  /** Покупка и сразу переезд: два запроса подряд, второй — обычный выбор купленного. */
  const buy = (h: ShopItem) =>
    act(async () => {
      await api('/shop/buy', { body: { itemId: h.id } });
      await api('/inventory/equip', { body: { itemId: h.id, equipped: true } });
    }, t('housing_moved'));

  const hero = current ? room(current.slug) : null;
  const [bx, by, bs] = currentHome?.bobek ?? [60, 99, 92];

  return (
    <div className="pb-6">
      <ScreenHeader title={t('house_title')} subtitle={me.profile.beaverName} right={<button className="chip" onClick={() => nav('/shop?house=1')}>{t('house_edit')}</button>} />

      <div className="relative mx-4 aspect-[2/1] overflow-hidden rounded-[28px] border-4 border-xp-dark shadow-[var(--shadow-card)]" data-house-room={current?.slug}>
        {hero ? (
          <img src={hero.src} srcSet={hero.srcSet} sizes="(min-width: 576px) 544px, calc(100vw - 32px)" alt="" className="absolute inset-0 h-full w-full object-cover" decoding="async" draggable={false} />
        ) : (
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,#FFF2C8 0%,#FFE7A8 62%,#D9A066 62%,#C8742E 100%)' }} />
        )}
        <motion.div key={current?.slug} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute -translate-x-1/2 -translate-y-full" style={{ left: `${bx}%`, top: `${by}%` }} data-house-bobek>
          <Beaver size={bs} mood={night ? 'sleep' : 'happy'} />
        </motion.div>
      </div>
      {currentHome && (
        <div className="mx-4 mt-3">
          <h2 className="text-[22px] font-black leading-tight" lang="pl">{currentHome.pl}</h2>
          <p className="muted text-sm font-bold">{t(currentHome.desc)}</p>
        </div>
      )}

      <div className="mt-5 px-4">
        <h3 className="text-[19px] font-black leading-tight">{t('house_homes_t')}</h3>
        <p className="muted mb-3 text-sm font-semibold">{t('house_homes_d')}</p>
        <div className="grid gap-2.5" role="list">
          {homes.map((h) => {
            const home = HOMES[h.slug];
            const art = room(h.slug);
            const selected = h.equipped;
            const enough = balance >= h.price;
            return (
              <div key={h.id} role="listitem" data-housing={h.slug} data-state={selected ? 'selected' : h.owned ? 'owned' : enough ? 'buyable' : 'locked'} className={cx('card flex min-w-0 gap-3 overflow-hidden p-2.5', selected && 'ring-2 ring-brand')}>
                <div className="relative aspect-[2/1] w-[96px] shrink-0 self-start overflow-hidden rounded-xl min-[360px]:w-[116px]">
                  {art ? <img src={art.src} srcSet={art.srcSet} sizes="(min-width: 360px) 116px, 96px" alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" decoding="async" draggable={false} /> : <div className="absolute inset-0 bg-muted" />}
                  {!h.owned && <span className="absolute inset-0 grid place-items-center bg-ink/40"><Icon name="lock" size={22} /></span>}
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-1">
                  <div className="min-w-0">
                    <div className="truncate text-[15px] font-black leading-tight" lang="pl">{home?.pl ?? tr(h.name)}</div>
                    <div className="muted line-clamp-1 text-[12px] font-bold">{home ? t(home.desc) : tr(h.name)}</div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                    {h.price > 0 ? (
                      <span className="flex items-center gap-1 text-[14px] font-black text-xp-dark"><Art name="coin" size={18} /> {num(h.price)}</span>
                    ) : (
                      <span className="text-[13px] font-black text-brand-dark">{t('housing_free')}</span>
                    )}
                    {selected ? (
                      <span className="flex items-center gap-1 rounded-full bg-brand/15 px-2.5 py-1 text-[12px] font-black text-brand-dark"><Icon name="check" size={14} strokeWidth={3} /> {t('housing_current')}</span>
                    ) : h.owned ? (
                      <button className="btn btn-green min-h-[40px] px-4 text-[13px]" disabled={busy} onClick={() => choose(h)}>{t('housing_choose')}</button>
                    ) : enough ? (
                      <button className="btn btn-primary min-h-[40px] px-4 text-[13px]" disabled={busy} onClick={() => setConfirm(h)}>{t('shop_buy')}</button>
                    ) : (
                      <span className="rounded-full bg-muted px-2.5 py-1 text-[12px] font-black muted">{t('housing_need', { n: num(h.price - balance) })}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 px-4" data-house-things>
        <h3 className="mb-2 text-[17px] font-black leading-tight">{t('house_things')}</h3>
        {placed.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {placed.map((key) => (
              <span key={key} className="card grid h-14 w-14 place-items-center p-1"><PictoTile spec={ITEM_PICTO[key] ?? null} size={44} /></span>
            ))}
          </div>
        )}
        {/* Почти пусто (только стартовая кровать): подсказка, чем наполнить комнату. */}
        {placed.length <= 1 && <p className={cx('muted font-bold leading-snug', placed.length > 0 && 'mt-2')}>{t('house_empty')}</p>}
      </div>

      <Sheet
        open={!!confirm}
        onClose={() => setConfirm(null)}
        label={t('housing_confirm_t')}
        footer={
          <div className="grid grid-cols-2 gap-2">
            <button className="btn btn-ghost min-h-[48px]" disabled={busy} onClick={() => setConfirm(null)}>{t('cancel')}</button>
            <button className="btn btn-primary min-h-[48px]" disabled={busy || !confirm} onClick={() => confirm && buy(confirm)} data-housing-confirm>{t('shop_buy')}</button>
          </div>
        }
      >
        {confirm && (
          <div className="px-4 pb-2 text-center">
            <h3 className="text-xl font-black">{t('housing_confirm_t')}</h3>
            <p className="muted mt-2 font-bold leading-snug">
              {t('housing_confirm_d', { name: HOMES[confirm.slug]?.pl ?? tr(confirm.name), price: num(confirm.price), left: num(balance - confirm.price) })}
            </p>
          </div>
        )}
      </Sheet>
    </div>
  );
}
