import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT, type TKey } from '../i18n';
import { ApiError, api } from '../lib/api';
import { artImage } from '../lib/assets';
import { sfx } from '../lib/audio';
import { haptic } from '../lib/telegram';
import { useMe, useRefreshAll, useShop } from '../lib/queries';
import type { ShopItem } from '../lib/types';
import { Art } from '../components/GameArt';
import { Icon } from '../components/Icon';
import { ITEM_PICTO, PictoTile } from '../components/pictograms/Pictogram';
import { ScreenHeader, ScreenSkeleton, Sheet, cx, useToast } from '../components/ui';

/**
 * Домик Бобека (2026-11-02): жильё — комнаты из пакета владельца (Opole / Łódź / Kraków / Warszawa). Бесплатна первая, остальные покупаются за Złotki и переключаются.
 * Выбор и покупку проверяет сервер (`/shop/buy`, `/inventory/equip`, слот HOUSING); экран показывает его состояние и переживает перезагрузку.
 * В каждой квартире несколько сцен (читает / спит / работает / чай): это готовые картинки с Бобром внутри, поэтому поверх Бобёр не рисуется. Какие сцены есть,
 * определяют файлы `assets/housing/housing-<город>-<сцена>.webp` (scripts/build-housing-art.mjs); выбор сцены — личная настройка устройства (localStorage), не серверная.
 * Вещи из магазина (мебель, декор, сувениры) — полосой под комнатой: комнаты уже обставлены, стикеры мебели поверх не нужны.
 */
const HOMES: Record<string, { pl: string; desc: TKey }> = {
  'housing-opole': { pl: 'Pokój w Opolu', desc: 'housing_opole_d' },
  'housing-lodz': { pl: 'Kawalerka w Łodzi', desc: 'housing_lodz_d' },
  'housing-krakow': { pl: 'Mieszkanie w Krakowie', desc: 'housing_krakow_d' },
  'housing-warszawa': { pl: 'Apartament w Warszawie', desc: 'housing_warszawa_d' },
};

type Scene = 'read' | 'sleep' | 'work' | 'tea';
const SCENES: { key: Scene; label: TKey; icon: string }[] = [
  { key: 'read', label: 'house_scene_read', icon: '📖' },
  { key: 'sleep', label: 'house_scene_sleep', icon: '🌙' },
  { key: 'work', label: 'house_scene_work', icon: '💻' },
  { key: 'tea', label: 'house_scene_tea', icon: '☕' },
];
const SCENE_STORAGE = 'pg_house_scene';
const readScene = (): Scene | null => {
  try {
    const v = localStorage.getItem(SCENE_STORAGE);
    return SCENES.some((s) => s.key === v) ? (v as Scene) : null;
  } catch {
    return null;
  }
};
const saveScene = (v: Scene) => {
  try {
    localStorage.setItem(SCENE_STORAGE, v);
  } catch {
    /* хранилище недоступно (приватный режим) — сцена просто не запомнится */
  }
};

/** Картинка сцены квартиры или null, если файла нет (`housing-opole` + `read` → `housing-opole-read`). */
const room = (slug: string, scene: Scene) => artImage('housing', HOMES[slug] ? { file: `${slug}-${scene}`, width: 1200 } : undefined);

/** Обложка квартиры в списке: читающий Бобёр, а если такой сцены нет — первая из имеющихся. */
const cover = (slug: string) => {
  for (const s of ['read', ...SCENES.map((x) => x.key)] as Scene[]) {
    const art = room(slug, s);
    if (art) return art;
  }
  return null;
};

/** Меняет картинку только после её загрузки и декодирования: при переключении сцены кадр не мигает пустым. */
function SceneImage({ art, alt, sizes }: { art: { src: string; srcSet?: string }; alt: string; sizes: string }) {
  const [shown, setShown] = useState(art);
  useEffect(() => {
    if (art.src === shown.src) return;
    let alive = true;
    const im = new Image();
    if (art.srcSet) im.srcset = art.srcSet;
    im.sizes = sizes;
    im.src = art.src;
    void im.decode().then(() => undefined, () => undefined).then(() => alive && setShown(art));
    return () => {
      alive = false;
    };
  }, [art.src, art.srcSet, shown.src, sizes]); // art собирается заново на каждом рендере — в зависимостях только его адреса
  return <img src={shown.src} srcSet={shown.srcSet} sizes={sizes} alt={alt} className="absolute inset-0 h-full w-full object-cover" decoding="async" draggable={false} />;
}

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
  const [chosen, setChosen] = useState<Scene | null>(readScene);
  if (!me || shop.isLoading) return <ScreenSkeleton />;

  const balance = shop.data?.balance ?? 0;
  const homes = (shop.data?.items ?? []).filter((i) => i.slot === 'HOUSING');
  const current = homes.find((h) => h.equipped) ?? homes.find((h) => h.slug === me.outfit.home) ?? homes[0];
  const currentHome = current ? HOMES[current.slug] : undefined;
  const placed = me.outfit.house;
  const hour = new Date().getHours();
  const night = hour >= 22 || hour < 6;
  /** Сцены, для которых есть картинка у выбранной квартиры. Пока игрок ничего не выбрал сам: ночью Бобёр спит, днём читает. */
  const available = current ? SCENES.filter((x) => room(current.slug, x.key)) : [];
  const auto: Scene = night ? 'sleep' : 'read';
  const scene: Scene | null = (chosen && available.some((x) => x.key === chosen) ? chosen : available.some((x) => x.key === auto) ? auto : available[0]?.key) ?? null;
  const pickScene = (v: Scene) => {
    setChosen(v);
    saveScene(v);
    sfx.tap();
    haptic.select();
  };

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

  const hero = current && scene ? room(current.slug, scene) : null;
  const sceneLabel = scene ? t(SCENES.find((x) => x.key === scene)!.label) : '';

  return (
    <div className="pb-6">
      <ScreenHeader title={t('house_title')} subtitle={me.profile.beaverName} right={<button className="chip" onClick={() => nav('/shop?house=1')}>{t('house_edit')}</button>} />

      <div className="relative mx-4 aspect-[3/2] overflow-hidden rounded-[28px] border-4 border-xp-dark bg-muted shadow-[var(--shadow-card)]" data-house-room={current?.slug} data-house-scene={scene ?? undefined}>
        {hero && <SceneImage art={hero} alt={currentHome ? `${currentHome.pl} — ${sceneLabel}` : sceneLabel} sizes="(min-width: 576px) 544px, calc(100vw - 32px)" />}
      </div>
      {available.length > 1 && (
        <div className="mx-4 mt-3 grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(130px,1fr))]" role="group" aria-label={t('house_scene_t')} data-house-scenes>
          {available.map((x) => (
            <button key={x.key} type="button" className={cx('chip-tab justify-center', scene === x.key && 'is-active')} aria-pressed={scene === x.key} data-scene={x.key} onClick={() => pickScene(x.key)}>
              <span aria-hidden="true">{x.icon}</span> {t(x.label)}
            </button>
          ))}
        </div>
      )}
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
            const art = cover(h.slug);
            const selected = h.equipped;
            const enough = balance >= h.price;
            return (
              <div key={h.id} role="listitem" data-housing={h.slug} data-state={selected ? 'selected' : h.owned ? 'owned' : enough ? 'buyable' : 'locked'} className={cx('card flex min-w-0 gap-3 overflow-hidden p-2.5', selected && 'ring-2 ring-brand')}>
                <div className="relative aspect-[3/2] w-[96px] shrink-0 self-start overflow-hidden rounded-xl min-[360px]:w-[116px]">
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
