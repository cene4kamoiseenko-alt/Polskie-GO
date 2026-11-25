/**
 * Тур по вкладкам (docs/superpowers/specs/2026-11-24-engagement-design.md, раздел 6) — Бобек-гид (владелец 2026-11-24: «Бобек гид
 * подходит, но должно выглядеть круто»). После первого пройденного урока, один раз на аккаунт; повторить — «Как здесь всё устроено»
 * в профиле. Esc и «Пропустить» закрывают, ← → и свайп по облачку — назад/дальше.
 *
 * Постановка шага (design-motion-principles + motion-design/choreography: одно главное движение, остальные — тише):
 *  1. световое окно плавно переезжает на вкладку (пружина без отскока, только transform);
 *  2. Бобек игрока в его образе перепрыгивает к вкладке по дуге: присел → вытянулся в прыжке → приземлился с «приплюснутостью»;
 *     тень под ним сжимается в полёте (контрдвижение);
 *  3. вкладка один раз подпрыгивает, когда Бобек приземлился;
 *  4. текст облачка проявляется из размытия, хвостик облачка едет за Бобеком.
 * Финал — Бобек празднует, конфетти, тур закрывается. Никаких бесконечных пульсаций и стрелок.
 * «Меньше анимаций» — без прыжков, размытия, конфетти: всё сразу на месте.
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useT, type TKey } from '../i18n';
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from '../lib/motion';
import { haptic } from '../lib/telegram';
import { Beaver } from './Beaver';
import { Confetti, cx } from './ui';

const STEPS: { tab: string; title: TKey; text: TKey }[] = [
  { tab: 'home', title: 'nav_home', text: 'tour_home_text' },
  { tab: 'study', title: 'nav_study', text: 'tour_study_text' },
  { tab: 'life', title: 'nav_life', text: 'tour_life_text' },
  { tab: 'quests', title: 'nav_quests', text: 'tour_quests_text' },
  { tab: 'profile', title: 'nav_profile', text: 'tour_profile_text' },
];
/** Ширина Бобека-гида (высота блока — ×260/220, см. Beaver). */
const GUIDE = 96;
const GUIDE_H = Math.round((GUIDE * 260) / 220);
const SPRING = { type: 'spring', duration: 0.5, bounce: 0 } as const;
const HOP_S = 0.56;

type Geo = { vw: number; vh: number; dockTop: number; tabs: Record<string, { left: number; top: number; width: number; height: number; art: string }> };

function measure(): Geo | null {
  const dock = document.querySelector('.app-nav-dock')?.getBoundingClientRect();
  if (!dock) return null;
  const tabs: Geo['tabs'] = {};
  for (const s of STEPS) {
    const el = document.querySelector<HTMLElement>(`[data-tab="${s.tab}"]`);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    tabs[s.tab] = { left: r.left, top: r.top, width: r.width, height: r.height, art: el.querySelector('img')?.getAttribute('src') ?? '' };
  }
  return { vw: window.innerWidth, vh: window.innerHeight, dockTop: dock.top, tabs };
}

export function TabTour({ onClose }: { onClose: (finished: boolean) => void }) {
  const { t } = useT();
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [geo, setGeo] = useState<Geo | null>(null);
  const [phase, setPhase] = useState<'enter' | 'step' | 'finish' | 'leave'>('enter');
  const nextRef = useRef<HTMLButtonElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  // Таймеры финала и ухода: снимаются, если тур закрыли раньше (переход на другой экран).
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach((id) => window.clearTimeout(id)), []);
  const step = STEPS[i];
  const last = i === STEPS.length - 1;

  // Положение вкладок и панели: при открытии и при повороте/изменении окна.
  useLayoutEffect(() => {
    const place = () => setGeo(measure());
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, []);

  const tab = geo?.tabs[step.tab];
  const tabCenter = tab ? tab.left + tab.width / 2 : 0;
  // Бобек над вкладкой, но целиком на экране (крайние вкладки у края).
  const guideX = geo ? Math.max(6, Math.min(geo.vw - GUIDE - 6, tabCenter - GUIDE / 2)) : 0;
  const guideMv = useMotionValue(guideX);
  const spotMv = useMotionValue(tab ? tab.left - 4 : 0);

  // Переход к шагу: окно переезжает, Бобек перепрыгивает, вкладка подпрыгивает при приземлении.
  useEffect(() => {
    if (!geo || !tab) return;
    const spotTo = tab.left - 4;
    if (first.current || reduce) {
      first.current = false;
      guideMv.set(guideX);
      spotMv.set(spotTo);
      return;
    }
    const a = animate(spotMv, spotTo, SPRING);
    const b = animate(guideMv, guideX, { duration: HOP_S, ease: [0.45, 0, 0.25, 1] });
    const body = bodyRef.current;
    const shadow = shadowRef.current;
    const c = body
      ? animate(body, { y: [0, 5, -44, 0, 0], scaleX: [1, 1.08, 0.95, 1.08, 1], scaleY: [1, 0.9, 1.06, 0.9, 1] }, { duration: HOP_S, times: [0, 0.14, 0.5, 0.86, 1], ease: 'easeInOut' })
      : null;
    const d = shadow ? animate(shadow, { scale: [1, 1.08, 0.55, 1.1, 1], opacity: [0.32, 0.36, 0.12, 0.36, 0.32] }, { duration: HOP_S, times: [0, 0.14, 0.5, 0.86, 1] }) : null;
    const pop = window.setTimeout(() => {
      const icon = document.querySelector<HTMLElement>(`[data-tab="${step.tab}"] span.relative`);
      icon?.animate(
        [{ transform: 'translateY(0) scale(1)' }, { transform: 'translateY(-5px) scale(1.16)' }, { transform: 'translateY(0) scale(1)' }],
        { duration: 420, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
      );
    }, HOP_S * 1000 * 0.86);
    return () => {
      a.stop();
      b.stop();
      c?.stop();
      d?.stop();
      window.clearTimeout(pop);
    };
    // guideX/tab выводятся из geo и шага
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, geo, reduce]);

  useEffect(() => {
    if (phase !== 'finish') nextRef.current?.focus();
  }, [i, phase]);

  const leave = useCallback(
    (finished: boolean) => {
      if (reduce) return onClose(finished);
      setPhase('leave');
      later(() => onClose(finished), 200);
    },
    [onClose, reduce],
  );

  const go = useCallback(
    (to: number) => {
      if (phase === 'finish' || phase === 'leave') return;
      if (to < 0) return;
      if (to >= STEPS.length) {
        haptic.success();
        if (reduce) return onClose(true);
        setPhase('finish');
        const body = bodyRef.current;
        if (body) void animate(body, { y: [0, 6, -38, 0], scaleX: [1, 1.1, 0.94, 1], scaleY: [1, 0.88, 1.08, 1] }, { duration: 0.6, times: [0, 0.18, 0.55, 1] });
        later(() => leave(true), 1300);
        return;
      }
      haptic.select();
      setPhase('step');
      setI(to);
    },
    [phase, reduce, onClose, leave],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') leave(false);
      else if (e.key === 'ArrowRight') go(i + 1);
      else if (e.key === 'ArrowLeft') go(i - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, leave, i]);

  if (!geo || !tab) return null;
  const mood = phase === 'finish' ? 'celebrate' : i === 0 ? 'wave' : 'explain';
  const guideBottom = geo.vh - geo.dockTop - 4;
  const bubbleBottom = guideBottom + GUIDE_H - 2;
  const bubbleLeft = 12;
  const tailX = Math.max(24, Math.min(geo.vw - 24 - bubbleLeft * 2, guideX + GUIDE / 2 - bubbleLeft));
  const enter = !reduce;

  return (
    <motion.div
      className={cx('fixed inset-0 z-50', reduce && 'tour-static')}
      data-tour-root
      initial={{ opacity: 0 }}
      animate={{ opacity: phase === 'leave' ? 0 : 1 }}
      transition={{ duration: reduce ? 0 : phase === 'leave' ? 0.18 : 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Нажатие мимо облачка закрывает тур. */}
      <div className="absolute inset-0" onClick={() => leave(false)} />
      {/* Световое окно: всё затемнено, кроме вкладки. Двигается только transform. */}
      <motion.div
        className="tour-spot"
        style={{ x: spotMv, top: tab.top - 4, left: 0, width: tab.width + 8, height: tab.height + 8 }}
        animate={{ opacity: phase === 'finish' ? 0 : 1 }}
        data-tour-spot
        aria-hidden
      />

      {/* Бобек-гид: стоит на панели вкладок над нужной вкладкой. */}
      <motion.div className="pointer-events-none absolute left-0 z-[2]" style={{ x: guideMv, bottom: guideBottom, width: GUIDE }} data-tour-guide aria-hidden>
        <div ref={shadowRef} className="tour-guide-shadow" style={{ opacity: 0.32 }} />
        <motion.div
          initial={enter ? { y: 70, opacity: 0, filter: 'blur(6px)' } : false}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          transition={{ type: 'spring', duration: 0.6, bounce: 0.28 }}
        >
          <div ref={bodyRef} style={{ transformOrigin: '50% 100%' }}>
            <Beaver mood={mood} size={GUIDE} />
          </div>
        </motion.div>
      </motion.div>

      {phase === 'finish' && !reduce && <Confetti run />}

      {/* Облачко Бобека: над ним, хвостик смотрит на Бобека; свайп влево — дальше, вправо — назад. */}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        data-tour={step.tab}
        className="tour-bubble card absolute z-[3] p-4"
        style={{ left: bubbleLeft, right: bubbleLeft, bottom: bubbleBottom }}
        initial={enter ? { opacity: 0, y: 10, scale: 0.97, filter: 'blur(4px)' } : false}
        animate={phase === 'finish' ? { opacity: 0, y: -6, filter: 'blur(4px)' } : { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
        transition={{ type: 'spring', duration: 0.45, bounce: 0, delay: phase === 'enter' && enter ? 0.18 : 0 }}
        drag={reduce ? false : 'x'}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.22}
        dragSnapToOrigin
        onDragEnd={(_, info) => {
          if (info.offset.x < -48 || info.velocity.x < -420) go(i + 1);
          else if (info.offset.x > 48 || info.velocity.x > 420) go(i - 1);
        }}
      >
        <motion.span className="tour-tail-track" aria-hidden animate={{ x: tailX }} initial={false} transition={reduce ? { duration: 0 } : SPRING}>
          <span className="tour-tail" data-tour-tail />
        </motion.span>
        <div className="relative min-h-[92px]">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={step.tab}
              initial={reduce ? false : { opacity: 0, y: 8, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -4, filter: 'blur(3px)', transition: { duration: 0.14 } }}
              transition={{ type: 'spring', duration: 0.42, bounce: 0, delay: reduce ? 0 : HOP_S * 0.55 }}
            >
              <h2 id="tour-title" className="flex items-center gap-2 text-[17px] font-black">
                {tab.art && <img src={tab.art} alt="" width={26} height={26} className="h-[26px] w-[26px] object-contain" draggable={false} />}
                {t(step.title)}
              </h2>
              <p className="muted mt-1 text-[14.5px] font-semibold leading-snug">{t(step.text)}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="mt-3 flex gap-1.5" aria-hidden>
          {STEPS.map((s, k) => (
            <span key={s.tab} className="tour-seg">
              <motion.span
                className="tour-seg-fill"
                initial={false}
                animate={{ scaleX: k <= i ? 1 : 0 }}
                transition={reduce ? { duration: 0 } : { type: 'spring', duration: 0.5, bounce: 0, delay: k === i ? HOP_S * 0.6 : 0 }}
              />
            </span>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="muted text-xs font-bold" aria-live="polite">
            {t('tour_step', { n: i + 1, total: STEPS.length })}
          </span>
          <button type="button" className="muted ml-auto px-2 py-2 text-sm font-bold" data-tour-skip onClick={() => leave(false)}>
            {t('tour_skip')}
          </button>
          <button type="button" ref={nextRef} className="btn btn-primary tour-next !min-h-[42px] !px-5 text-[15px]" data-tour-next onClick={() => go(i + 1)}>
            {last ? t('tour_done') : t('tour_next')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
