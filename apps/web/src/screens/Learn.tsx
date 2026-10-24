import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useT } from '../i18n';
import { useJourney, useMe } from '../lib/queries';
import type { JourneyLesson } from '../lib/types';
import { Beaver } from '../components/Beaver';
import { GameIcon, type IconName } from '../components/GameIcon';
import { CityBanner } from '../components/Scenery';
import { EmptyState, ErrorState, Progress, ScreenSkeleton, Sheet, cx } from '../components/ui';
import { TopStats } from './Home';
import { haptic } from '../lib/telegram';

/** Позиція вузла на «звивистій стежці» уроків. */
const OFFSETS = [0, 52, 76, 52, 0, -52, -76, -52];
const ROUTE_ICONS: IconName[] = ['lessons', 'dictionary', 'grammar', 'ai', 'review', 'story'];

function LessonNode({ lesson, index, onClick, isNext }: { lesson: JourneyLesson; index: number; onClick: () => void; isNext: boolean }) {
  const { tr } = useT();
  const boss = lesson.kind === 'BOSS';
  const locked = lesson.state === 'locked';
  const done = lesson.state === 'completed';
  const size = boss ? 96 : 78;
  const color = done ? '#FFBD42' : boss ? '#F45159' : '#35C88A';
  return (
    <div className="relative flex flex-col items-center" style={{ transform: `translateX(${OFFSETS[index % OFFSETS.length]}px)` }}>
      {isNext && (
        <motion.div className="absolute -top-10 z-10 rounded-xl bg-elev px-3 py-1 text-xs font-black text-brand-dark shadow" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 1.4 }}>
          START
        </motion.div>
      )}
      <motion.button whileTap={{ scale: 0.92, y: 4 }} onClick={onClick} className="relative" aria-label={lesson.slug}>
        {isNext && <motion.span className="absolute inset-[-7px] rounded-[30px] border-4 border-brand" animate={{ opacity: [1, 0.2, 1] }} transition={{ repeat: Infinity, duration: 1.6 }} />}
        <GameIcon name={boss ? 'exam' : done ? 'star' : 'lessons'} size={size} color={color} inactive={locked} />
        {locked && <span className="absolute -bottom-1 -right-1"><GameIcon name="lock" size={30} /></span>}
        {lesson.isPremium && <span className="absolute -right-2 -top-2"><GameIcon name="premium" size={30} /></span>}
      </motion.button>
      <div className={cx('mt-1.5 max-w-[150px] rounded-xl px-2.5 py-1 text-center text-xs font-black leading-tight', locked ? 'muted' : 'bg-elev shadow-sm')}>
        {tr(lesson.title)}
        {done && (
          <div className="mt-0.5 flex justify-center gap-0.5">
            {[1, 2, 3].map((s) => (
              <span key={s} style={{ opacity: s <= lesson.stars ? 1 : 0.25 }}><GameIcon name="star" size={14} /></span>
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

  const allLessons = city.routes.flatMap((r) => r.lessons);
  const doneCount = allLessons.filter((l) => l.state === 'completed').length;
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
            {c.namePl}
          </button>
        ))}
      </div>

      {/* Герой міста */}
      <CityBanner slug={city.slug} color={city.color} height={170} className="mx-4 rounded-[28px] shadow-[var(--shadow-card)]">
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black drop-shadow">{city.namePl}</span>
            <span className="rounded-lg bg-white/90 px-2 py-0.5 text-xs font-black" style={{ color: city.color }}>{city.cefr}</span>
          </div>
          <div className="truncate text-sm font-bold opacity-95 drop-shadow">{tr(city.theme)}</div>
          <div className="mt-2 flex items-center gap-2">
            <Progress value={city.progress} height={9} color="var(--color-xp)" />
            <span className="whitespace-nowrap text-xs font-black">{t('learn_city_progress', { n: doneCount, total: allLessons.length })}</span>
          </div>
        </div>
      </CityBanner>

      {/* Маршрути та уроки */}
      {city.routes.map((r, ri) => (
        <section key={r.id} className="space-y-6 pb-4">
          <div className="mx-4 flex items-center gap-3 rounded-2xl border-2 border-soft bg-elev px-4 py-3">
            <GameIcon name={ROUTE_ICONS[ri % ROUTE_ICONS.length]} size={44} />
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
                  <LessonNode lesson={l} index={i} isNext={l.id === nextId} onClick={() => { haptic.tap(); setPicked(l); }} />
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
            <div className="flex justify-center"><GameIcon name={picked.kind === 'BOSS' ? 'exam' : 'lessons'} size={72} /></div>
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
              <div className="flex items-center justify-center gap-2 rounded-2xl bg-muted p-3 font-bold"><GameIcon name="lock" size={24} /> {picked.kind === 'BOSS' ? t('learn_boss_locked') : t('learn_lesson_locked')}</div>
            ) : picked.isPremium && !me?.premium.active ? (
              <button className="btn btn-xp w-full" onClick={() => nav('/premium')}>{t('learn_premium_lesson')}</button>
            ) : (
              <button className="btn btn-primary w-full text-lg" onClick={() => nav(`/lesson/${picked.id}`)}>
                {picked.state === 'completed' ? t('learn_replay') : `${t('learn_start_lesson')} →`}
              </button>
            )}
          </div>
        )}
      </Sheet>
    </div>
  );
}
