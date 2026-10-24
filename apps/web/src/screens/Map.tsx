import { motion } from 'framer-motion';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useT } from '../i18n';
import { useJourney } from '../lib/queries';
import type { JourneyCity } from '../lib/types';
import { PolandMap } from '../components/PolandMap';
import { CityBanner } from '../components/Scenery';
import { GameIcon } from '../components/GameIcon';
import { ErrorState, Progress, ScreenSkeleton, Sheet, cx } from '../components/ui';
import { TopStats } from './Home';
import { haptic } from '../lib/telegram';
import { sfx } from '../lib/audio';

const ZOOMS = [1, 1.7, 2.6];
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
  const [travel, setTravel] = useState<{ from: JourneyCity; to: JourneyCity } | null>(null);
  const box = useRef<HTMLDivElement>(null);

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
      const tm = setTimeout(() => {
        setTravel(null);
        setParams({}, { replace: true });
        setSelected(to);
      }, 3000);
      return () => clearTimeout(tm);
    }
  }, [params, journey.data, setParams]);

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
  const unlocked = j.cities.filter((c) => c.unlocked).length;

  return (
    <div className="space-y-3">
      <TopStats />
      <div className="mx-4 flex items-center gap-3 rounded-3xl bg-elev p-3 shadow-[var(--shadow-card)]">
        <GameIcon name="map" size={44} />
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-black leading-tight">{t('map_title')}</h1>
          <p className="muted text-xs font-bold">
            {t('map_subtitle')} · {unlocked}/{j.cities.length}
          </p>
        </div>
      </div>

      {travel && (
        <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mx-4 rounded-2xl bg-pl-red px-4 py-2 text-center font-black text-white">
          🚆 {t('map_travel', { city: travel.to.namePl })}
        </motion.div>
      )}

      <div className="relative mx-3">
        <div ref={box} className="no-scrollbar h-[64vh] overflow-auto rounded-[28px] border-4 border-white shadow-[var(--shadow-card)]" style={{ background: 'var(--map-sea)' }}>
          <div style={{ width: `${ZOOMS[zoom] * 100}%` }}>
            <PolandMap cities={j.cities} currentCityId={j.currentCityId} travel={travel} hereLabel={t('map_you_are_here')} onCityClick={(c) => { haptic.tap(); setSelected(c); }} />
          </div>
        </div>
        {/* Масштаб */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-2">
          {[
            ['+', () => setZoom((z) => Math.min(ZOOMS.length - 1, z + 1)), zoom === ZOOMS.length - 1],
            ['−', () => setZoom((z) => Math.max(0, z - 1)), zoom === 0],
          ].map(([label, fn, disabled]) => (
            <button key={label as string} onClick={fn as () => void} disabled={disabled as boolean} aria-label={`${t('map_zoom')} ${label}`} className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-2xl font-black text-ink shadow-md disabled:opacity-40">
              {label as string}
            </button>
          ))}
        </div>
      </div>

      {current && (
        <button onClick={() => setSelected(current)} className="mx-4 flex w-[calc(100%-2rem)] items-center gap-3 rounded-3xl bg-elev p-3 text-left shadow-[var(--shadow-card)]">
          <CityBanner slug={current.slug} color={current.color} height={56} className="w-20 shrink-0 rounded-2xl" />
          <div className="min-w-0 flex-1">
            <div className="font-black">{current.namePl}</div>
            <div className="muted mb-1 text-xs font-bold">{t('map_lessons', { done: current.lessonsDone, total: current.lessonsTotal })}</div>
            <Progress value={current.progress} height={8} />
          </div>
          <span className="btn btn-primary min-h-0 px-3 py-2 text-sm">{t('map_go_learn')}</span>
        </button>
      )}

      <Sheet open={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <div className="space-y-4">
            <CityBanner slug={selected.slug} color={selected.color} height={150} className="-mx-1 rounded-3xl">
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <div className="flex items-center gap-2">
                  <span className="rounded-lg px-2 py-0.5 text-xs font-black" style={{ background: selected.color }}>{selected.cefr}</span>
                  {selected.id === j.currentCityId && <span className="rounded-lg bg-pl-red px-2 py-0.5 text-xs font-black">📍 {t('map_you_are_here')}</span>}
                </div>
                <h2 className="text-3xl font-black drop-shadow">{selected.namePl}</h2>
                <div className="text-sm font-bold drop-shadow">{tr(selected.theme)}</div>
              </div>
            </CityBanner>
            <p className="muted font-semibold">{tr(selected.description)}</p>
            {selected.hasContent && (
              <div>
                <div className="mb-1 flex justify-between text-sm font-black">
                  <span>{t('map_lessons', { done: selected.lessonsDone, total: selected.lessonsTotal })}</span>
                  <span>{selected.progress}%</span>
                </div>
                <Progress value={selected.progress} />
              </div>
            )}
            {selected.hasContent && (
              <div className="space-y-2">
                {selected.routes.map((r) => {
                  const done = r.lessons.filter((l) => l.state === 'completed').length;
                  return (
                    <div key={r.id} className={cx('card flex items-center gap-3 px-3 py-2', !selected.unlocked && 'opacity-60')}>
                      <span className="icon-tile text-2xl" style={{ background: `${selected.color}22` }}>{r.icon}</span>
                      <span className="flex-1 font-bold">{tr(r.title)}</span>
                      <span className="muted text-sm font-black">{done}/{r.lessons.length}</span>
                    </div>
                  );
                })}
              </div>
            )}
            {!selected.unlocked ? (
              <div className="flex items-center gap-3 rounded-2xl bg-muted p-3 font-bold">
                <GameIcon name="lock" size={36} />
                {t('map_locked_hint')}
              </div>
            ) : !selected.hasContent ? (
              <div className="rounded-2xl bg-muted p-3 text-center font-bold">{t('map_soon_hint')}</div>
            ) : (
              <button className="btn btn-primary w-full text-lg" onClick={() => nav(`/learn?city=${selected.id}`)}>
                {selected.completed ? `✓ ${t('map_completed')} · ` : ''}
                {t('map_go_learn')} →
              </button>
            )}
          </div>
        )}
      </Sheet>
    </div>
  );
}
