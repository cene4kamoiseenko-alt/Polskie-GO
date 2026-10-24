import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useT } from '../i18n';
import { useJourney, useMe } from '../lib/queries';
import type { JourneyLesson } from '../lib/types';
import { Beaver } from '../components/Beaver';
import { EmptyState, ErrorState, Progress, ScreenSkeleton, Sheet, cx } from '../components/ui';
import { TopStats } from './Home';
import { haptic } from '../lib/telegram';

/** Позиція вузла на «звивистій стежці» уроків. */
const OFFSETS = [0, 52, 76, 52, 0, -52, -76, -52];

function LessonNode({ lesson, index, onClick, isNext, icon }: { lesson: JourneyLesson; index: number; onClick: () => void; isNext: boolean; icon: string }) {
  const { tr } = useT();
  const boss = lesson.kind === 'BOSS';
  const locked = lesson.state === 'locked';
  const done = lesson.state === 'completed';
  const size = boss ? 92 : 74;
  const bg = locked ? 'var(--track)' : done ? '#FFC857' : boss ? '#E5484D' : '#45C486';
  const shadow = locked ? 'var(--border)' : done ? '#E8A82A' : boss ? '#B8323A' : '#2FA56C';
  return (
    <div className="relative flex flex-col items-center" style={{ transform: `translateX(${OFFSETS[index % OFFSETS.length]}px)` }}>
      {isNext && (
        <motion.div className="absolute -top-11 z-10 rounded-xl bg-elev px-3 py-1 text-xs font-black text-brand-dark shadow" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 1.4 }}>
          START
        </motion.div>
      )}
      <motion.button
        whileTap={{ scale: 0.92, y: 4 }}
        onClick={onClick}
        className="relative grid place-items-center rounded-full text-3xl"
        style={{ width: size, height: size, background: bg, boxShadow: `0 7px 0 ${shadow}` }}
        aria-label={lesson.slug}
      >
        {isNext && <motion.span className="absolute inset-[-8px] rounded-full border-4 border-brand" animate={{ opacity: [1, 0.2, 1] }} transition={{ repeat: Infinity, duration: 1.6 }} />}
        <span style={{ filter: locked ? 'grayscale(1)' : undefined, opacity: locked ? 0.5 : 1 }}>{boss ? '🏆' : locked ? '🔒' : icon}</span>
        {lesson.isPremium && <span className="absolute -right-1 -top-1 text-lg">👑</span>}
      </motion.button>
      <div className={cx('mt-2 max-w-[150px] rounded-xl px-2.5 py-1 text-center text-xs font-black leading-tight', locked ? 'muted' : 'bg-elev shadow-sm')}>
        {tr(lesson.title)}
        {done && (
          <div className="mt-0.5 flex justify-center gap-0.5 text-[11px]">
            {[1, 2, 3].map((s) => (
              <span key={s} style={{ opacity: s <= lesson.stars ? 1 : 0.25 }}>⭐</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LearnScreen() {
  const { t, tr } = useT();
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const journey = useJourney();
  const me = useMe().data;
  const [picked, setPicked] = useState<JourneyLesson | null>(null);
  const nextRef = useRef<HTMLDivElement>(null);

  const cities = journey.data?.cities.filter((c) => c.unlocked && c.hasContent) ?? [];
  const cityId = params.get('city') ?? journey.data?.currentCityId ?? cities[0]?.id;
  const city = journey.data?.cities.find((c) => c.id === cityId) ?? cities[0];
  const nextId = useMemo(() => city?.routes.flatMap((r) => r.lessons).find((l) => l.state === 'available')?.id, [city]);

  useEffect(() => {
    nextRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [nextId]);

  if (journey.isLoading) return <ScreenSkeleton />;
  if (journey.error) return <ErrorState error={journey.error} onRetry={() => journey.refetch()} />;
  if (!city) return <EmptyState text={t('learn_no_content')} />;

  let idx = 0;
  return (
    <div className="space-y-4">
      <TopStats />
      <div className="px-4">
        <h1 className="text-2xl font-black">{t('learn_title')}</h1>
        <p className="muted text-sm font-bold">{t('learn_subtitle')}</p>
      </div>

      {/* Перемикач міст */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4">
        {cities.map((c) => (
          <button key={c.id} onClick={() => { haptic.select(); setParams({ city: c.id }); }} className={cx('chip shrink-0 px-4 py-2', c.id === city.id && 'bg-pl-red text-white')}>
            {c.emoji} {c.namePl}
          </button>
        ))}
      </div>

      {/* Картка міста */}
      <div className="mx-4 flex items-center gap-3 rounded-3xl p-4 text-white" style={{ background: `linear-gradient(135deg, ${city.color}, ${city.color}cc)` }}>
        <span className="text-5xl">{city.emoji}</span>
        <div className="min-w-0 flex-1">
          <div className="text-xl font-black">{city.namePl} · {city.cefr}</div>
          <div className="truncate text-sm font-bold opacity-90">{tr(city.theme)}</div>
          <div className="mt-2 flex items-center gap-2">
            <Progress value={city.progress} height={8} color="#fff" />
            <span className="text-xs font-black">{city.progress}%</span>
          </div>
        </div>
      </div>

      {/* Маршрути та уроки */}
      {city.routes.map((r) => (
        <section key={r.id} className="space-y-6 pb-4">
          <div className="mx-4 flex items-center gap-3 rounded-2xl border-2 border-soft bg-elev px-4 py-3">
            <span className="text-3xl">{r.icon}</span>
            <div className="min-w-0">
              <div className="font-black">{tr(r.title)}</div>
              <div className="muted truncate text-xs font-bold">{tr(r.description)}</div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-8">
            {r.lessons.map((l) => {
              const i = idx++;
              return (
                <div key={l.id} ref={l.id === nextId ? nextRef : undefined}>
                  <LessonNode lesson={l} index={i} icon={r.icon} isNext={l.id === nextId} onClick={() => { haptic.tap(); setPicked(l); }} />
                </div>
              );
            })}
          </div>
        </section>
      ))}
      <div className="flex justify-center pb-6">
        <Beaver mood={city.completed ? 'celebrate' : 'travel'} outfit={me?.outfit.wear} size={110} />
      </div>

      <Sheet open={!!picked} onClose={() => setPicked(null)}>
        {picked && (
          <div className="space-y-4 text-center">
            <div className="text-5xl">{picked.kind === 'BOSS' ? '🏆' : '📘'}</div>
            <div>
              <h2 className="text-2xl font-black">{tr(picked.title)}</h2>
              <p className="muted font-bold">{tr(picked.topic)}</p>
            </div>
            <div className="flex justify-center gap-2">
              <span className="chip">{picked.cefr}</span>
              <span className="chip">{t('learn_exercises', { n: picked.exerciseCount })}</span>
              <span className="chip">{'●'.repeat(picked.difficulty)}{'○'.repeat(Math.max(0, 5 - picked.difficulty))}</span>
            </div>
            {picked.state === 'locked' ? (
              <div className="rounded-2xl bg-muted p-3 font-bold">🔒 {picked.kind === 'BOSS' ? t('learn_boss_locked') : t('learn_lesson_locked')}</div>
            ) : picked.isPremium && !me?.premium.active ? (
              <button className="btn btn-xp w-full" onClick={() => nav('/premium')}>👑 {t('learn_premium_lesson')}</button>
            ) : (
              <button className="btn btn-primary w-full text-lg" onClick={() => nav(`/lesson/${picked.id}`)}>
                {picked.state === 'completed' ? `🔁 ${t('learn_replay')}` : `${t('learn_start_lesson')} →`}
              </button>
            )}
          </div>
        )}
      </Sheet>
    </div>
  );
}
