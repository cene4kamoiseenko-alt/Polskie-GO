import { motion } from '../lib/motion';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useT } from '../i18n';
import { useJourney, useMe, useRefreshAll } from '../lib/queries';
import type { JourneyCity } from '../lib/types';
import { IllustratedMap, MEDALLIONS, type MapHandle, type SpotState } from '../components/IllustratedMap';
import { CityBanner } from '../components/Scenery';
import { Icon } from '../components/Icon';
import { ErrorState, Progress, ScreenSkeleton, Sheet, cx, useToast } from '../components/ui';
import { api, ApiError } from '../lib/api';
import { iconAsset } from '../lib/assets';
import { CITY_ART, MAP_SPOTS, type MapSpot } from '@polski-go/shared';
import { TopStats } from './Home';
import { haptic } from '../lib/telegram';
import { sfx } from '../lib/audio';

/** Высота элемента (панели поверх карты) с обновлением при изменении. */
function useHeight<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [h, setH] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setH(el.offsetHeight);
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => setH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  });
  return [ref, h] as const;
}

const keyForCity = (slug: string | undefined) => (slug ? Object.keys(MAP_SPOTS).find((k) => MAP_SPOTS[k].city === slug) ?? null : null);

export default function MapScreen() {
  const { t } = useT();
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const journey = useJourney();
  const me = useMe().data;
  const map = useRef<MapHandle>(null);
  /** Выбранная точка карты (ключ MAP_SPOTS); по умолчанию — текущий город. */
  const [spot, setSpot] = useState<string | null>(null);
  const [sheet, setSheet] = useState(false);
  const [travel, setTravel] = useState<{ from: string; to: string } | null>(null);
  const [hud, hudH] = useHeight<HTMLDivElement>();
  const [card, cardH] = useHeight<HTMLDivElement>();

  // Анімація подорожі після складеного іспиту міста: /map?travel=<fromId>,<toId>
  useEffect(() => {
    const tv = params.get('travel');
    if (!tv || !journey.data) return;
    const [a, b] = tv.split(',');
    const from = journey.data.cities.find((c) => c.id === a);
    const to = journey.data.cities.find((c) => c.id === b);
    const fk = keyForCity(from?.slug);
    const tk = keyForCity(to?.slug);
    if (fk && tk) {
      setTravel({ from: fk, to: tk });
      setSpot(tk);
      sfx.win();
      haptic.success();
      const tm = setTimeout(() => finishTravel(), 4200);
      return () => clearTimeout(tm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, journey.data, setParams]);

  const finishTravel = () => {
    setTravel(null);
    setParams({}, { replace: true });
  };
  // Стабільний обробник: Sheet перевішує системну BackButton лише при зміні функції.
  const closeSheet = useCallback(() => setSheet(false), []);

  if (journey.isLoading) return <ScreenSkeleton />;
  if (journey.error) return <ErrorState error={journey.error} onRetry={() => journey.refetch()} />;
  const j = journey.data!;
  const current = j.cities.find((c) => c.id === j.currentCityId);
  const key = spot ?? keyForCity(current?.slug);
  const sel: MapSpot | null = key ? MAP_SPOTS[key] ?? null : null;
  // Картка міста — завжди зі свіжих даних (після скрині чи уроку стан змінюється).
  const city = sel?.city ? j.cities.find((c) => c.slug === sel.city) : undefined;
  const completedCount = j.cities.filter((c) => c.completed).length;
  const sorted = [...j.cities].sort((a, b) => a.order - b.order);
  const prevOf = (c: JourneyCity) => sorted[sorted.findIndex((x) => x.id === c.id) - 1];
  const stateWord: Record<SpotState, string> = { current: t('map_you_are_here'), done: t('map_completed'), open: t('map_st_open'), locked: t('map_st_locked'), none: t('map_not_in_route') };

  const select = (k: string) => {
    haptic.tap();
    setSpot(k);
    map.current?.reveal(k);
  };

  /** Следующий настоящий урок города: первый доступный по серверному состоянию. Карта ничего не открывает сама. */
  const go = (c: JourneyCity) => {
    haptic.tap();
    const next = c.routes.flatMap((r) => r.lessons).find((l) => l.state === 'available');
    if (!next) return nav(`/learn?city=${c.id}`);
    if (next.isPremium && !me?.premium.active) return nav('/premium');
    nav(`/lesson/${next.id}`);
  };

  return (
    <div className="map-screen" data-map-screen>
      <IllustratedMap
        ref={map}
        cities={j.cities}
        currentCityId={j.currentCityId}
        selected={key}
        onSelect={select}
        padTop={hudH}
        padBottom={cardH + 12}
        travel={travel}
        ariaLabel={t('map_aria')}
        ariaHint={t('map_aria_hint')}
        spotLabel={(s, st, c) => `${s.label}: ${stateWord[st]}${c?.hasContent ? `, ${t('map_lessons', { done: c.lessonsDone, total: c.lessonsTotal })}` : ''}`}
        zoomLabels={{ in: `${t('map_zoom')} +`, out: `${t('map_zoom')} −`, home: t('map_to_current') }}
      />

      {/* Шапка поверх карты: настоящие XP / серия / Złotki и прогресс путешествия */}
      {/* Одна строка поверх карты: прогресс путешествия вместо логотипа и настоящие серия / Złotki / Premium — верх карты (Гдыня) не закрыт. */}
      <div ref={hud} className="map-hud pointer-events-none absolute inset-x-0 top-0 z-[3] pb-2">
        <div className="pointer-events-auto">
          <TopStats
            compact
            noSafe
            left={
              <h1 className="map-chip mr-auto min-w-0 shrink" aria-label={t('map_journey_d', { done: completedCount, total: j.cities.length })}>
                <Icon name="map" size={16} className="shrink-0 text-pl-red" />
                <span className="truncate">{t('map_cities_short')}</span> <span className="shrink-0 text-pl-red">{completedCount}/{j.cities.length}</span>
              </h1>
            }
          />
        </div>
      </div>

      {travel && (
        <motion.button
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute inset-x-4 z-[4] flex items-center justify-between gap-2 rounded-2xl bg-pl-red px-4 py-2 font-black text-white shadow-lg"
          style={{ top: hudH + 6 }}
          onClick={finishTravel}
        >
          <span>{t('map_travel', { city: travel ? MAP_SPOTS[travel.to].label : '' })}</span>
          <span className="text-sm opacity-80">{t('map_skip')}</span>
        </motion.button>
      )}

      {/* Компактная карточка выбранного города (не на полэкрана): название, реальный прогресс, переход в урок */}
      <div ref={card} className="absolute inset-x-3 bottom-3 z-[3]">
        {sel && (
          <div className="map-card flex items-center gap-3 p-2.5" data-map-card={key ?? ''} data-state={city ? (city.id === j.currentCityId ? 'current' : city.completed ? 'done' : city.unlocked ? 'open' : 'locked') : 'none'}>
            {city ? (
              <>
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  onClick={() => { haptic.tap(); setSheet(true); }}
                  aria-label={`${city.namePl}: ${t('map_details')}`}
                  data-map-details
                  {...(city.id === j.currentCityId ? { 'data-current-city': '' } : {})}
                >
                  {/* У города без финальной панорамы, но с медальоном на карте (Закопане) — тот же вид Татр, а не общая сценка. */}
                  {sel.medallion && CITY_ART[city.slug]?.status !== 'final' ? (
                    <img src={MEDALLIONS[sel.medallion]} alt="" width={64} height={64} className="h-16 w-16 shrink-0 rounded-2xl object-cover" data-card-medallion />
                  ) : (
                    <CityBanner slug={city.slug} color={city.color} height={64} sizes="72px" shade={false} className="w-16 shrink-0 rounded-2xl" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className={cx('inline-flex max-w-full items-center gap-1 truncate whitespace-nowrap rounded-md px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wide',
                      city.id === j.currentCityId ? 'bg-[#FFE3A3] text-[#7A4A00]' : city.completed ? 'bg-[#D7F5E3] text-[#126B3A]' : city.unlocked ? 'bg-[#D9F0FF] text-[#0B5A8C]' : 'bg-[var(--bg-muted)] muted')}>
                      {!city.unlocked && <Icon name="lock" size={10} strokeWidth={3} />}
                      {city.completed && <Icon name="check" size={10} strokeWidth={3} />}
                      {city.id === j.currentCityId ? t('map_you_are_here') : city.completed ? t('map_completed') : city.unlocked ? t('map_stage', { n: city.order }) : `${t('map_st_locked')} · ${t('map_stage', { n: city.order })}`}
                    </span>
                    <span className="block truncate text-[19px] font-black leading-tight" lang="pl" title={city.namePl}>{city.namePl}</span>
                    {!city.unlocked ? (
                      <span className="line-clamp-2 block text-xs font-bold leading-tight muted">
                        {prevOf(city) ? t('map_unlock_after', { city: prevOf(city)!.namePl }) : t('map_locked_hint')}
                      </span>
                    ) : city.hasContent ? (
                      <>
                        <span className="block text-xs font-bold muted">{t('map_lessons', { done: city.lessonsDone, total: city.lessonsTotal })}</span>
                        <Progress value={city.progress} height={7} className="mt-1" />
                      </>
                    ) : (
                      <span className="line-clamp-2 block text-xs font-bold leading-tight muted">{t('map_soon_hint')}</span>
                    )}
                  </span>
                </button>
                {city.unlocked && city.hasContent ? (
                  <button type="button" data-map-go className="btn btn-red min-h-0 shrink-0 gap-0.5 px-3 py-3 text-[14px]" onClick={() => go(city)}>
                    {city.completed ? t('map_repeat') : t('map_continue')}
                    <Icon name="chevron-right" size={16} strokeWidth={2.8} className="-mr-1" />
                  </button>
                ) : (
                  <button type="button" className="btn min-h-0 shrink-0 gap-1 bg-[var(--bg)] px-3 py-3 text-sm" onClick={() => { haptic.tap(); setSheet(true); }}>
                    {t('map_details')}
                  </button>
                )}
              </>
            ) : (
              // Точка без этапа маршрута (Sopot): честное объяснение и переход к ближайшему городу.
              <>
                <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[var(--bg)] muted"><Icon name="map" size={28} /></span>
                <span className="min-w-0 flex-1">
                  <span className="inline-flex rounded-md bg-[var(--bg-muted)] px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wide muted">{t('map_not_in_route')}</span>
                  <span className="block truncate text-[19px] font-black leading-tight" lang="pl">{sel.label}</span>
                  <span className="line-clamp-2 block text-xs font-bold leading-tight muted">{t('map_sopot_text')}</span>
                </span>
                <button type="button" className="btn min-h-0 shrink-0 bg-[var(--bg)] px-3 py-3 text-sm" onClick={() => select('gdansk')}>
                  Gdańsk <Icon name="chevron-right" size={16} />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <Sheet
        open={sheet && !!city}
        onClose={closeSheet}
        label={city?.namePl}
        footer={
          city && city.unlocked && city.hasContent ? (
            <button data-city-go className="btn btn-red w-full text-lg" onClick={() => nav(`/learn?city=${city.id}`)}>
              {city.completed ? `${t('map_completed')} · ` : ''}
              {t('map_go_learn')}
              <Icon name="arrow-right" size={22} strokeWidth={2.6} />
            </button>
          ) : undefined
        }
      >
        {city && <CitySheet city={city} isCurrent={city.id === j.currentCityId} prev={prevOf(city)} />}
      </Sheet>
    </div>
  );
}

/** Шторка «Подробнее»: панорама, темы города, сундуки тем и требования доступа (как раньше на старой карте). */
function CitySheet({ city: sel, isCurrent, prev }: { city: JourneyCity; isCurrent: boolean; prev?: JourneyCity }) {
  const { t, tr } = useT();
  return (
    <div className="space-y-4">
      <CityBanner slug={sel.slug} color={sel.color} height={140} shade={false} className="-mx-1 rounded-3xl">
        <div className="absolute left-3 top-3 flex gap-1.5">
          <span className="rounded-lg bg-white/95 px-2 py-0.5 text-xs font-black text-navy">{t('map_stage', { n: sel.order })}</span>
          <span className="rounded-lg bg-pl-red px-2 py-0.5 text-xs font-black text-white">{sel.cefr}</span>
        </div>
      </CityBanner>
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-[28px] font-black leading-tight">{sel.namePl}</h2>
          {isCurrent && (
            <span className="flex items-center gap-1 rounded-full bg-pl-red/10 px-2 py-0.5 text-xs font-black text-pl-red">
              <Icon name="pin" size={13} /> {t('map_you_are_here')}
            </span>
          )}
        </div>
        <div className="font-black muted">{tr(sel.theme)}</div>
        <p className="mt-1 text-sm font-semibold muted">{tr(sel.description)}</p>
      </div>
      <CityStatus city={sel} />
      {sel.hasContent && (
        <div>
          <div className="mb-1 flex justify-between text-sm font-black">
            <span>{t('map_lessons', { done: sel.lessonsDone, total: sel.lessonsTotal })}</span>
            <span>{sel.progress}%</span>
          </div>
          <Progress value={sel.progress} />
        </div>
      )}
      {sel.hasContent && (
        <div>
          <h3 className="mb-2 text-sm font-black uppercase tracking-wide muted">{t('map_topics')}</h3>
          <div className="space-y-2">
            {sel.routes.map((r, i) => {
              const done = r.lessons.filter((l) => l.state === 'completed').length;
              const full = done === r.lessons.length;
              return (
                <div key={r.id} data-route={r.slug} className={cx('card flex items-center gap-3 px-3 py-2.5', !sel.unlocked && 'opacity-60')}>
                  <span className={cx('grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-black', full ? 'bg-brand text-white' : 'bg-[var(--bg)] text-navy')}>
                    {full ? <Icon name="check" size={18} strokeWidth={3} /> : i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block line-clamp-2 font-black leading-tight">{tr(r.title)}</span>
                    <span className="block line-clamp-2 text-xs font-bold leading-tight muted">{tr(r.description)}</span>
                  </span>
                  <span className="text-sm font-black muted">{done}/{r.lessons.length}</span>
                  {r.chest && <RouteChest routeId={r.id} chest={r.chest} />}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {!sel.unlocked ? (
        <div className="flex items-center gap-3 rounded-2xl bg-[var(--bg)] p-3 font-bold">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--bg-muted)] muted">
            <Icon name="lock" size={20} />
          </span>
          {prev ? t('map_unlock_after', { city: prev.namePl }) : t('map_locked_hint')}
        </div>
      ) : !sel.hasContent ? (
        <div className="rounded-2xl bg-[var(--bg)] p-3 text-center text-sm font-bold">{t('map_soon_full')}</div>
      ) : null}
      {!sel.hasContent && !sel.unlocked && <p className="muted text-center text-xs font-bold">{t('map_soon_full')}</p>}
    </div>
  );
}

/**
 * Три окремі стани міста, які не змішуються: оформлення (є малюнок, CITY_ART), уроки (є контент),
 * доступ (місто відкрите цьому користувачу). Карта не відкриває порожній маршрут заради малюнка.
 */
function CityStatus({ city }: { city: JourneyCity }) {
  const { t } = useT();
  const art = CITY_ART[city.slug]?.status ?? 'missing';
  const items = [
    // «Готове» тільки у final; без фінальної панорами шторка показує ілюстрацію, а оформлення — «скоро».
    { key: 'art', label: t('map_st_art'), ok: art === 'final', value: art === 'final' ? t('map_st_ready') : t('map_soon'), icon: art === 'final' ? 'check' : 'clock' },
    { key: 'lessons', label: t('map_st_lessons'), ok: city.hasContent, value: city.hasContent ? String(city.lessonsTotal) : t('map_soon'), icon: city.hasContent ? 'book' : 'clock' },
    { key: 'access', label: t('map_st_access'), ok: city.unlocked, value: city.unlocked ? t('map_st_open') : t('map_st_locked'), icon: city.unlocked ? 'check' : 'lock' },
  ] as const;
  return (
    <div data-city-status className="grid grid-cols-3 gap-1.5">
      {items.map((s) => (
        <div key={s.key} data-status={s.key} data-ok={s.ok} className="rounded-2xl bg-[var(--bg)] px-1.5 py-2 text-center">
          <div className="muted text-[11px] font-bold leading-tight">{s.label}</div>
          <div className="mt-0.5 flex items-center justify-center gap-1 text-[13px] font-black leading-tight">
            <Icon name={s.icon} size={13} strokeWidth={2.6} className={s.ok ? 'shrink-0 text-brand' : 'shrink-0 muted'} />
            <span className={cx('min-w-0 truncate', !s.ok && 'muted')}>{s.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Скриня теми: закрита, поки не пройдено всі уроки теми; потім її можна відкрити один раз
 * (нагорода нараховується на сервері, повторне відкриття неможливе).
 */
function RouteChest({ routeId, chest }: { routeId: string; chest: { state: 'locked' | 'ready' | 'opened'; xp: number; zlotki: number } }) {
  const { t } = useT();
  const toast = useToast();
  const refresh = useRefreshAll();
  const [busy, setBusy] = useState(false);
  const icon = iconAsset('gift');
  const reward = `+${chest.xp} XP · +${chest.zlotki} zł`;
  const open = async () => {
    if (busy) return;
    setBusy(true);
    haptic.tap();
    try {
      const r = await api<{ xp: number; zlotki: number }>(`/journey/routes/${routeId}/chest`, { method: 'POST' });
      sfx.coin();
      haptic.success();
      toast(t('map_chest_got', { xp: r.xp, zl: r.zlotki }), '🎁');
      await refresh();
    } catch (e) {
      // Уже відкрита (інша вкладка) — просто оновлюємо стан.
      if (e instanceof ApiError && e.code === 'already_claimed') await refresh();
      else toast(t('answer_failed'), '⚠️');
    } finally {
      setBusy(false);
    }
  };
  const label = chest.state === 'ready' ? t('map_chest_open') : chest.state === 'opened' ? t('map_chest_opened') : t('map_chest_locked');
  return (
    <button
      type="button"
      data-chest={chest.state}
      disabled={chest.state !== 'ready' || busy}
      onClick={() => void open()}
      title={`${label} (${reward})`}
      aria-label={`${label} (${reward})`}
      className={cx('relative grid h-11 w-11 shrink-0 place-items-center rounded-xl', chest.state === 'ready' ? 'chest-ready bg-xp/25' : 'bg-[var(--bg)]')}
    >
      {icon && <img src={icon} alt="" width={34} height={34} className={cx(chest.state === 'locked' && 'opacity-40 grayscale', chest.state === 'opened' && 'opacity-55')} />}
      {chest.state === 'locked' && <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-elev muted shadow"><Icon name="lock" size={12} /></span>}
      {chest.state === 'opened' && <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-brand text-white shadow"><Icon name="check" size={12} strokeWidth={3} /></span>}
    </button>
  );
}
