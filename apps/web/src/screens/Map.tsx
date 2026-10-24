import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useT } from '../i18n';
import { useJourney } from '../lib/queries';
import type { JourneyCity } from '../lib/types';
import { PolandMap } from '../components/PolandMap';
import { Card, ErrorState, Progress, ScreenSkeleton, Sheet, cx } from '../components/ui';
import { TopStats } from './Home';
import { haptic } from '../lib/telegram';
import { sfx } from '../lib/audio';

export default function MapScreen() {
  const { t, tr } = useT();
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const journey = useJourney();
  const [selected, setSelected] = useState<JourneyCity | null>(null);
  const [zoom, setZoom] = useState(false);
  const [travel, setTravel] = useState<{ from: JourneyCity; to: JourneyCity } | null>(null);

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

  if (journey.isLoading) return <ScreenSkeleton />;
  if (journey.error) return <ErrorState error={journey.error} onRetry={() => journey.refetch()} />;
  const j = journey.data!;
  const unlocked = j.cities.filter((c) => c.unlocked).length;

  return (
    <div className="space-y-3">
      <TopStats />
      <div className="flex items-end justify-between px-4">
        <div>
          <h1 className="text-2xl font-black">{t('map_title')}</h1>
          <p className="muted text-sm font-bold">{t('map_subtitle')}</p>
        </div>
        <button className="chip" onClick={() => setZoom((z) => !z)} aria-label={t('map_zoom')}>
          {zoom ? '➖' : '➕'} {t('map_zoom')}
        </button>
      </div>

      {travel && (
        <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mx-4 rounded-2xl bg-pl-red px-4 py-2 text-center font-black text-white">
          🚆 {t('map_travel', { city: travel.to.namePl })}
        </motion.div>
      )}

      <div className={cx('no-scrollbar mx-2 overflow-auto rounded-[28px]', zoom && 'h-[70vh]')}>
        <div style={{ width: zoom ? '180%' : '100%' }}>
          <PolandMap cities={j.cities} currentCityId={j.currentCityId} travel={travel} hereLabel={t('map_you_are_here')} onCityClick={(c) => { haptic.tap(); setSelected(c); }} />
        </div>
      </div>

      <div className="flex justify-center gap-4 px-4 text-sm font-bold">
        <span className="chip">🗺️ {unlocked}/{j.cities.length}</span>
        <span className="chip">✅ {j.cities.filter((c) => c.completed).length}</span>
      </div>

      <Sheet open={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="grid h-20 w-20 place-items-center rounded-3xl text-5xl" style={{ background: `${selected.color}33` }}>
                {selected.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-2xl font-black">{selected.namePl}</h2>
                  <span className="chip text-xs">{selected.cefr}</span>
                </div>
                <div className="font-bold text-brand-dark">{tr(selected.theme)}</div>
                {selected.id === j.currentCityId && <div className="text-sm font-black text-pl-red">📍 {t('map_you_are_here')}</div>}
              </div>
            </div>
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
                {selected.routes.map((r) => (
                  <Card key={r.id} className="flex items-center gap-3 px-3 py-2">
                    <span className="text-2xl">{r.icon}</span>
                    <span className="flex-1 font-bold">{tr(r.title)}</span>
                    <span className="muted text-sm font-black">
                      {r.lessons.filter((l) => l.state === 'completed').length}/{r.lessons.length}
                    </span>
                  </Card>
                ))}
              </div>
            )}
            {!selected.unlocked ? (
              <div className="rounded-2xl bg-muted p-3 text-center font-bold">🔒 {t('map_locked_hint')}</div>
            ) : !selected.hasContent ? (
              <div className="rounded-2xl bg-muted p-3 text-center font-bold">{t('map_soon_hint')}</div>
            ) : (
              <button className="btn btn-primary w-full" onClick={() => nav(`/learn?city=${selected.id}`)}>
                {selected.completed ? `✅ ${t('map_completed')} · ` : ''}
                {t('map_go_learn')} →
              </button>
            )}
          </div>
        )}
      </Sheet>
    </div>
  );
}
