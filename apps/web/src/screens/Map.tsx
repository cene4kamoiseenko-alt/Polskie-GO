import { motion } from '../lib/motion';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useT } from '../i18n';
import { useJourney, useRefreshAll } from '../lib/queries';
import type { JourneyCity } from '../lib/types';
import { PolandMap } from '../components/PolandMap';
import { CityBanner } from '../components/Scenery';
import { Icon } from '../components/Icon';
import { ErrorState, Progress, ScreenSkeleton, Sheet, cx, useToast } from '../components/ui';
import { api, ApiError } from '../lib/api';
import { iconAsset } from '../lib/assets';
import { TopStats } from './Home';
import { haptic } from '../lib/telegram';
import { sfx } from '../lib/audio';

const ZOOMS = [1, 1.7, 2.6];
const LEVELS = ['A1', 'A2', 'B1', 'B2'];
/** Ширина полотна карти в SVG-одиницях (viewBox з відступами). */
const VB_W = 1040;
const VB_H = 1040;

export default function MapScreen() {
  const { t, tr } = useT();
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const journey = useJourney();
  const [selected, setSelected] = useState<JourneyCity | null>(null);
  const [zoom, setZoom] = useState(1);
  const [level, setLevel] = useState<string | null>(null);
  const [travel, setTravel] = useState<{ from: JourneyCity; to: JourneyCity } | null>(null);
  const box = useRef<HTMLDivElement>(null);
  // Масштаб двома пальцями: розведення — ближче, зведення — далі (кроками, панорамування — нативний скрол).
  const pinch = useRef<number | null>(null);
  const dist = (e: React.TouchEvent) => Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
  const pinchStart = (e: React.TouchEvent) => { pinch.current = e.touches.length === 2 ? dist(e) : null; };
  const pinchMove = (e: React.TouchEvent) => {
    if (e.touches.length !== 2 || !pinch.current) return;
    const ratio = dist(e) / pinch.current;
    if (ratio > 1.25 || ratio < 0.8) {
      setZoom((z) => Math.max(0, Math.min(ZOOMS.length - 1, z + (ratio > 1 ? 1 : -1))));
      pinch.current = dist(e);
      haptic.select();
    }
  };

  // Анімація подорожі після складеного іспиту міста: /map?travel=<fromId>,<toId>
  useEffect(() => {
    const tv = params.get('travel');
    if (!tv || !journey.data) return;
    const [a, b] = tv.split(',');
    const from = journey.data.cities.find((c) => c.id === a);
    const to = journey.data.cities.find((c) => c.id === b);
    if (from && to) {
      setTravel({ from, to });
      sfx.win();
      haptic.success();
      const tm = setTimeout(() => finishTravel(to), 4200);
      return () => clearTimeout(tm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, journey.data, setParams]);

  const finishTravel = (to: JourneyCity) => {
    setTravel(null);
    setParams({}, { replace: true });
    setSelected(to);
  };
  const skipTravel = () => travel && finishTravel(travel.to);
  // Стабільний обробник: Sheet перевішує системну BackButton лише при зміні функції.
  const closeSheet = useCallback(() => setSelected(null), []);

  // Центруємо видиму область на поточному місті (нативний скрол — швидко навіть на слабких телефонах).
  const current = journey.data?.cities.find((c) => c.id === journey.data?.currentCityId);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el || !current) return;
    const w = el.clientWidth * ZOOMS[zoom];
    const h = w * (VB_H / VB_W);
    const id = requestAnimationFrame(() =>
      el.scrollTo({ left: ((current.mapX + 20) / VB_W) * w - el.clientWidth / 2, top: ((current.mapY + 60) / VB_H) * h - el.clientHeight / 2 }),
    );
    return () => cancelAnimationFrame(id);
  }, [zoom, current?.id, journey.isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  if (journey.isLoading) return <ScreenSkeleton />;
  if (journey.error) return <ErrorState error={journey.error} onRetry={() => journey.refetch()} />;
  const j = journey.data!;
  // Відкрита картка міста — завжди зі свіжих даних (після скрині чи уроку стан змінюється).
  const sel = selected ? j.cities.find((c) => c.id === selected.id) ?? selected : null;
  const completedCount = j.cities.filter((c) => c.completed).length;
  const sorted = [...j.cities].sort((a, b) => a.order - b.order);
  const prevOf = (c: JourneyCity) => sorted[sorted.findIndex((x) => x.id === c.id) - 1];

  return (
    <div className="space-y-3">
      <TopStats compact />
      <div className="px-4">
        <h1 className="text-[26px] font-black leading-tight">{t('map_journey')}</h1>
        <p className="text-sm font-bold muted">{t('map_journey_d', { done: completedCount, total: j.cities.length })}</p>
      </div>

      {/* Фільтр рівнів: показує, які рівні вже мають уроки, а які ще готуються */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4">
        {[null, ...LEVELS].map((lv) => {
          const ready = lv ? j.cities.filter((c) => c.cefr === lv && c.hasContent).length : null;
          return (
            <button
              key={lv ?? 'all'}
              onClick={() => { haptic.select(); setLevel(lv); }}
              className={cx('flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-black transition', level === lv ? 'bg-pl-red text-white shadow-[0_3px_0_var(--fill-coral)]' : 'bg-elev shadow-[var(--shadow-card)]')}
            >
              {lv ?? t('map_all')}
              {lv && ready === 0 && <span className={cx('text-[10px] font-extrabold', level === lv ? 'text-white/80' : 'muted')}>{t('map_soon')}</span>}
            </button>
          );
        })}
      </div>
      {level && (
        <p className="px-5 text-xs font-bold muted">
          {j.cities.some((c) => c.cefr === level && c.hasContent) ? t('map_level_ready', { n: j.cities.filter((c) => c.cefr === level && c.hasContent).length }) : t('map_level_soon', { level })}
        </p>
      )}

      {travel && (
        <motion.button
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mx-4 flex w-[calc(100%-2rem)] items-center justify-between gap-2 rounded-2xl bg-pl-red px-4 py-2 font-black text-white"
          onClick={skipTravel}
        >
          <span>{t('map_travel', { city: travel.to.namePl })}</span>
          <span className="text-sm opacity-80">{t('map_skip')}</span>
        </motion.button>
      )}

      <div className="relative mx-3">
        <div
          ref={box}
          className="no-scrollbar max-h-[64vh] touch-pan-x touch-pan-y overflow-auto rounded-[28px] border-[3px] border-white/15 shadow-[var(--shadow-card)]"
          style={{ background: '#1F6FB0', height: zoom === 0 ? 'auto' : '64vh' }}
          onTouchStart={pinchStart}
          onTouchMove={pinchMove}
          onWheel={(e) => { if (e.ctrlKey) { e.preventDefault(); setZoom((z) => Math.max(0, Math.min(ZOOMS.length - 1, z + (e.deltaY < 0 ? 1 : -1)))); } }}
        >
          <div style={{ width: `${ZOOMS[zoom] * 100}%` }}>
            <PolandMap cities={j.cities} currentCityId={j.currentCityId} travel={travel} hereLabel={t('map_you_are_here')} soonLabel={t('map_soon')} level={level} onCityClick={(c) => { haptic.tap(); setSelected(c); }} />
          </div>
        </div>
        {/* Масштаб */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-2">
          {[
            ['+', () => setZoom((z) => Math.min(ZOOMS.length - 1, z + 1)), zoom === ZOOMS.length - 1],
            ['−', () => setZoom((z) => Math.max(0, z - 1)), zoom === 0],
          ].map(([label, fn, disabled]) => (
            <button key={label as string} onClick={fn as () => void} disabled={disabled as boolean} aria-label={`${t('map_zoom')} ${label}`} className="grid h-11 w-11 place-items-center rounded-2xl bg-night/90 text-2xl font-black text-white shadow-md ring-1 ring-white/15 active:scale-95 disabled:opacity-40">
              {label as string}
            </button>
          ))}
        </div>
      </div>

      {/* Прогрес подорожі Польщею */}
      <div className="card mx-4 flex items-center gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-black">{t('map_poland_progress', { n: j.cities.filter((c) => c.completed).length, total: j.cities.length })}</div>
          <Progress value={j.cities.filter((c) => c.completed).length} max={j.cities.length} height={8} color="var(--color-pl-red)" className="mt-1.5" />
        </div>
        <span className="text-lg font-black text-pl-red">{Math.round((j.cities.filter((c) => c.completed).length / Math.max(1, j.cities.length)) * 100)}%</span>
      </div>

      {current && (
        <button data-current-city onClick={() => setSelected(current)} className="mx-4 flex w-[calc(100%-2rem)] items-center gap-3 rounded-3xl bg-elev p-3 text-left shadow-[var(--shadow-card)]">
          <CityBanner slug={current.slug} color={current.color} height={56} className="w-20 shrink-0 rounded-2xl" />
          <div className="min-w-0 flex-1">
            <div className="font-black">{current.namePl}</div>
            <div className="muted mb-1 text-xs font-bold">{t('map_lessons', { done: current.lessonsDone, total: current.lessonsTotal })}</div>
            <Progress value={current.progress} height={8} />
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-full bg-pl-red text-white"><Icon name="arrow-right" size={20} strokeWidth={2.6} /></span>
        </button>
      )}

      <Sheet
        open={!!selected}
        onClose={closeSheet}
        label={sel?.namePl}
        footer={
          sel && sel.unlocked && sel.hasContent ? (
            <button data-city-go className="btn btn-red w-full text-lg" onClick={() => nav(`/learn?city=${sel.id}`)}>
              {sel.completed ? `${t('map_completed')} · ` : ''}
              {t('map_go_learn')}
              <Icon name="arrow-right" size={22} strokeWidth={2.6} />
            </button>
          ) : undefined
        }
      >
        {sel && (
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
                {sel.id === j.currentCityId && (
                  <span className="flex items-center gap-1 rounded-full bg-pl-red/10 px-2 py-0.5 text-xs font-black text-pl-red">
                    <Icon name="pin" size={13} /> {t('map_you_are_here')}
                  </span>
                )}
              </div>
              <div className="font-black muted">{tr(sel.theme)}</div>
              <p className="mt-1 text-sm font-semibold muted">{tr(sel.description)}</p>
            </div>
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
                {prevOf(sel) ? t('map_unlock_after', { city: prevOf(sel)!.namePl }) : t('map_locked_hint')}
              </div>
            ) : !sel.hasContent ? (
              <div className="rounded-2xl bg-[var(--bg)] p-3 text-center text-sm font-bold">{t('map_soon_full')}</div>
            ) : null}
            {!sel.hasContent && !sel.unlocked && <p className="muted text-center text-xs font-bold">{t('map_soon_full')}</p>}
          </div>
        )}
      </Sheet>
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
