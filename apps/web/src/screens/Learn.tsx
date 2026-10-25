import { motion } from 'framer-motion';
import { isMissionSlug } from '@polski-go/shared';
import { Art } from '../components/GameArt';
import { Scene } from '../components/Illustrations';
import { sceneForRoute } from '../components/LessonStage';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useT } from '../i18n';
import { useJourney, useMe } from '../lib/queries';
import type { JourneyLesson } from '../lib/types';
import { Beaver, type BeaverOutfit } from '../components/Beaver';
import { GameIcon, type IconName } from '../components/GameIcon';
import { CityHero } from '../components/CityHero';
import { EmptyState, ErrorState, Progress, ScreenSkeleton, Sheet, cx } from '../components/ui';
import { TopStats } from './Home';
import { haptic } from '../lib/telegram';

/** Позиція вузла на «звивистій стежці» уроків. */
const OFFSETS = [0, 52, 76, 52, 0, -52, -76, -52];
const ROUTE_ICONS: IconName[] = ['lessons', 'dictionary', 'grammar', 'ai', 'review', 'story'];

/** З'єднання між вузлами стежки: пройдена ділянка — суцільна, майбутня — пунктир. */
function Connector({ from, to, done }: { from: number; to: number; done: boolean }) {
  const x1 = 110 + OFFSETS[from % OFFSETS.length];
  const x2 = 110 + OFFSETS[to % OFFSETS.length];
  return (
    <svg width="220" height="36" viewBox="0 0 220 36" className="-my-1 block" aria-hidden>
      <path d={`M${x1} 0 C${x1} 22 ${x2} 14 ${x2} 36`} fill="none" stroke={done ? 'var(--color-brand)' : 'var(--track)'} strokeWidth="7" strokeLinecap="round" strokeDasharray={done ? undefined : '2 12'} />
    </svg>
  );
}

function LessonNode({ lesson, index, onClick, isNext, outfit }: { lesson: JourneyLesson; index: number; onClick: () => void; isNext: boolean; outfit?: BeaverOutfit }) {
  const { t, tr } = useT();
  const boss = lesson.kind === 'BOSS';
  const locked = lesson.state === 'locked';
  const done = lesson.state === 'completed';
  const size = boss ? 96 : 78;
  const color = done ? '#FFBD42' : boss ? '#F45159' : '#35C88A';
  const off = OFFSETS[index % OFFSETS.length];
  return (
    <motion.div
      className="relative flex flex-col items-center"
      style={{ x: off }}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
    >
      {isNext && (
        <>
          <motion.div className="absolute -top-10 z-10 whitespace-nowrap rounded-xl bg-elev px-3 py-1 text-xs font-black uppercase text-brand-dark shadow" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 1.4 }}>
            {t('learn_start_here')}
          </motion.div>
          {/* Бобек стоїть поруч із наступним уроком — з протилежного від вигину боку. */}
          <div className="pointer-events-none absolute top-0" style={off >= 0 ? { right: '100%', marginRight: 6 } : { left: '100%', marginLeft: 6 }}>
            <Beaver mood="wave" size={64} outfit={outfit} />
          </div>
        </>
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
    </motion.div>
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
      <TopStats compact />
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
      <div className="hero-card relative mx-4">
        <CityHero slug={city.slug} color={city.color} name={city.namePl} sign={false} height={176}>
          <div className="glass-card absolute left-3 top-3 px-3 py-1.5">
            <div className="flex items-baseline gap-2">
              <span className="text-[22px] font-black text-white">{city.namePl}</span>
              <span className="rounded-lg px-1.5 py-0.5 text-[11px] font-black text-white" style={{ background: city.color }}>{city.cefr}</span>
            </div>
            <div className="line-clamp-2 max-w-[240px] text-xs font-bold leading-tight text-[#cfe0f2]">{tr(city.theme)}</div>
          </div>
          <div className="glass-card absolute inset-x-3 bottom-3 flex items-center gap-2 px-3 py-2">
            <Progress value={city.progress} height={9} color="linear-gradient(90deg,#FFC857,#FFE38A)" />
            <span className="whitespace-nowrap text-xs font-black text-white">{t('learn_city_progress', { n: doneCount, total: allLessons.length })}</span>
          </div>
        </CityHero>
      </div>

      {/* Маршрути та уроки */}
      {city.routes.map((r, ri) => (
        <section key={r.id} className="space-y-6 pb-4">
          <div className="location-card mx-4 flex items-center gap-3 overflow-hidden p-2 pr-3">
            <span className="relative h-[64px] w-[92px] shrink-0 overflow-hidden rounded-xl">
              {sceneForRoute(r.slug) ? <Scene name={sceneForRoute(r.slug)!} className="absolute inset-0 h-full w-full" /> : <span className="grid h-full place-items-center bg-[#07182c]"><GameIcon name={ROUTE_ICONS[ri % ROUTE_ICONS.length]} size={40} /></span>}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-black uppercase tracking-wide text-sky">{t('learn_location_n', { n: ri + 1 })}</div>
              <div className="line-clamp-2 text-[17px] font-black leading-tight">{tr(r.title)}</div>
              <div className="muted line-clamp-2 text-xs font-bold leading-tight">{tr(r.description)}</div>
              <div className="mt-1 flex items-center gap-2">
                <Progress value={r.lessons.filter((x) => x.state === 'completed').length} max={Math.max(1, r.lessons.length)} height={6} color="linear-gradient(90deg,#25D79B,#7CF0C3)" />
                <span className="shrink-0 text-[11px] font-black">{r.lessons.filter((x) => x.state === 'completed').length}/{r.lessons.length}</span>
              </div>
            </div>
            {r.lessons.some((x) => isMissionSlug(x.slug)) && <Art name="trophy" size={30} />}
          </div>
          <div className={cx('flex flex-col items-center', r.lessons[0]?.id === nextId && 'pt-8')}>
            {r.lessons.map((l, li) => {
              const i = idx++;
              return (
                <div key={l.id} ref={l.id === nextId ? nextRef : undefined} className="flex flex-col items-center">
                  {li > 0 && <Connector from={i - 1} to={i} done={r.lessons[li - 1].state === 'completed'} />}
                  <LessonNode lesson={l} index={i} isNext={l.id === nextId} outfit={me?.outfit.wear} onClick={() => { haptic.tap(); setPicked(l); }} />
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
            <div className="flex justify-center">{isMissionSlug(picked.slug) ? <Art name="trophy" size={72} /> : <GameIcon name={picked.kind === 'BOSS' ? 'exam' : 'lessons'} size={72} />}</div>
            <div>
              <h2 className="text-2xl font-black">{tr(picked.title)}</h2>
              <p className="muted font-bold">{tr(picked.topic)}</p>
            </div>
            <div className="flex justify-center gap-2">
              <span className="chip">{picked.cefr}</span>
              <span className="chip">{t('learn_exercises', { n: picked.exerciseCount })}</span>
              <span className="chip" aria-label={`${picked.difficulty}/5`}>
                {[1, 2, 3, 4, 5].map((n) => <span key={n} className={cx('h-2 w-2 rounded-full', n <= picked.difficulty ? 'bg-pl-red' : 'bg-[var(--track)]')} />)}
              </span>
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
