import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../i18n';
import { ApiError, api } from '../lib/api';
import { sfx } from '../lib/audio';
import { HOMES, houseQuery, houseRoom, isNight, num, stateScene, type HouseScene, type HouseState } from '../lib/house';
import { haptic } from '../lib/telegram';
import { useMe, useRefreshAll, useShop } from '../lib/queries';
import type { ShopItem } from '../lib/types';
import { Art } from '../components/GameArt';
import { Icon } from '../components/Icon';
import { Progress, ScreenHeader, ScreenSkeleton, Sheet, cx, useToast } from '../components/ui';

/**
 * Домик Бобека (2026-11-02, переработан 2026-11-03 — docs/HOUSING.md). Квартиры (Opole бесплатно, Łódź, Kraków, Warszawa) покупаются за Złotki и переключаются
 * (сервер: `/shop/buy`, `/inventory/equip`, слот HOUSING). Сцена — готовая картинка с Бобром — показывает день игрока: ночью спит, цель дня выполнена — пьёт чай,
 * иначе ждёт урок (кнопки сцен — посмотреть другие, выбор живёт до ухода с экрана). Смысл домика — «домашний бонус»: за выполненную цель дня квартира даёт Złotki,
 * чем лучше квартира, тем больше (`/house`, `/house/bonus`, services/house.ts). Интерьер убран (владелец: «он никак не меняется»).
 */
const SCENES: { key: HouseScene; label: 'house_scene_read' | 'house_scene_sleep' | 'house_scene_work' | 'house_scene_tea'; icon: string }[] = [
  { key: 'read', label: 'house_scene_read', icon: '📖' },
  { key: 'sleep', label: 'house_scene_sleep', icon: '🌙' },
  { key: 'work', label: 'house_scene_work', icon: '💻' },
  { key: 'tea', label: 'house_scene_tea', icon: '☕' },
];

/** Обложка квартиры в списке: читающий Бобёр, а если такой сцены нет — первая из имеющихся. */
const cover = (slug: string) => {
  for (const s of ['read', ...SCENES.map((x) => x.key)] as HouseScene[]) {
    const art = houseRoom(slug, s);
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

export default function HouseScreen() {
  const { t, tr } = useT();
  const nav = useNavigate();
  const qc = useQueryClient();
  const toast = useToast();
  const refresh = useRefreshAll();
  const me = useMe().data;
  const shop = useShop();
  const house = useQuery(houseQuery);
  const [confirm, setConfirm] = useState<ShopItem | null>(null);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [chosen, setChosen] = useState<HouseScene | null>(null);
  if (!me || shop.isLoading) return <ScreenSkeleton />;

  const balance = shop.data?.balance ?? 0;
  const st: HouseState | undefined = house.data;
  const homes = (shop.data?.items ?? []).filter((i) => i.slot === 'HOUSING');
  const current = homes.find((h) => h.equipped) ?? homes.find((h) => h.slug === me.outfit.home) ?? homes[0];
  const currentHome = current ? HOMES[current.slug] : undefined;
  /** Сцены, для которых есть картинка у выбранной квартиры. По умолчанию — сцена дня (stateScene); нажатая кнопка показывает другую до ухода с экрана. */
  const available = current ? SCENES.filter((x) => houseRoom(current.slug, x.key)) : [];
  const auto: HouseScene = current ? stateScene(current.slug, st) : 'read';
  const scene: HouseScene | null = (chosen && available.some((x) => x.key === chosen) ? chosen : available.some((x) => x.key === auto) ? auto : available[0]?.key) ?? null;
  const pickScene = (v: HouseScene) => {
    setChosen(v);
    sfx.tap();
    haptic.select();
  };

  /** Запрос к серверу; после ответа обновляем всё, что могло измениться (профиль, магазин, баланс, бонус). */
  const act = async (fn: () => Promise<unknown>, okText: string) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    try {
      await fn();
      sfx.coin();
      haptic.success();
      toast(okText, '🏠');
      await Promise.all([refresh(), qc.invalidateQueries({ queryKey: ['house'] })]);
      setConfirm(null);
    } catch (e) {
      toast(t('toast_error', { msg: e instanceof ApiError ? e.message : (e as Error).message }), '⚠️');
      void shop.refetch();
      void house.refetch();
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
  const claim = () => act(() => api('/house/bonus', { method: 'POST' }), t('house_bonus_got', { n: st?.bonus ?? 0 }));

  const hero = current && scene ? houseRoom(current.slug, scene) : null;
  const sceneLabel = scene ? t(SCENES.find((x) => x.key === scene)!.label) : '';
  const left = Math.max(0, (st?.goalXp ?? me.today.goalXp) - (st?.xp ?? me.today.xp));

  return (
    <div className="pb-6">
      <ScreenHeader title={t('house_title')} subtitle={me.profile.beaverName} />

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

      {/* Домашний бонус: за цель дня, раз в день, размер — от квартиры */}
      {st && (
        <div className={cx('card mx-4 mt-4 p-3.5', st.goalDone && !st.claimed && 'ring-2 ring-xp')} data-house-bonus={st.claimed ? 'claimed' : st.goalDone ? 'ready' : 'locked'}>
          <div className="flex items-center gap-3">
            <Art name="coin" size={40} />
            <div className="min-w-0 flex-1">
              <div className="text-[16px] font-black leading-tight">{t('house_bonus_t')}: +{st.bonus}</div>
              <div className="muted text-[12.5px] font-bold leading-snug">
                {st.claimed ? t('house_bonus_claimed') : st.goalDone ? t('house_bonus_ready_d', { n: st.bonus }) : isNight() ? t('house_state_night') : t('house_state_wait', { n: left })}
              </div>
            </div>
          </div>
          {!st.claimed && !st.goalDone && (
            <div className="mt-2.5">
              <Progress value={Math.min(st.xp, st.goalXp)} max={st.goalXp} height={7} color="linear-gradient(90deg,#25D79B,#7CF0C3)" />
            </div>
          )}
          {st.goalDone && !st.claimed ? (
            <button className="btn btn-xp mt-3 min-h-[46px] w-full" disabled={busy} onClick={claim} data-house-claim>
              <Art name="coin" size={20} /> {t('house_bonus_claim', { n: st.bonus })}
            </button>
          ) : !st.goalDone ? (
            <button className="btn btn-primary mt-3 min-h-[46px] w-full" onClick={() => nav('/')}>{t('house_go_learn')}</button>
          ) : null}
          <p className="muted mt-2.5 text-[11.5px] font-bold leading-snug">{t('house_bonus_d')}</p>
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
                    {st?.bonuses[h.slug] !== undefined && <div className="mt-0.5 flex items-center gap-1 text-[12px] font-black text-xp-dark" data-housing-bonus><Art name="coin" size={14} /> {t('housing_bonus_day', { n: st.bonuses[h.slug] })}</div>}
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
