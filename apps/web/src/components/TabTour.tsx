/**
 * Тур по вкладкам (docs/superpowers/specs/2026-11-24-engagement-design.md, раздел 6; владелец: «подсказки по вкладкам, где миссии,
 * где магазин скинов»): после первого пройденного урока — 5 подсказок у нижней панели. Один раз на аккаунт (отметка на сервере);
 * повторить — «Как здесь всё устроено» в профиле. Esc и «Пропустить» закрывают.
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useT, type TKey } from '../i18n';
import { motion, useReducedMotion } from '../lib/motion';

const STEPS: { tab: string; title: TKey; text: TKey }[] = [
  { tab: 'home', title: 'nav_home', text: 'tour_home_text' },
  { tab: 'study', title: 'nav_study', text: 'tour_study_text' },
  { tab: 'life', title: 'nav_life', text: 'tour_life_text' },
  { tab: 'quests', title: 'nav_quests', text: 'tour_quests_text' },
  { tab: 'profile', title: 'nav_profile', text: 'tour_profile_text' },
];
const W = 300;

export function TabTour({ onClose }: { onClose: (finished: boolean) => void }) {
  const { t } = useT();
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [pos, setPos] = useState<{ bottom: number; left: number; arrow: number } | null>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const step = STEPS[i];

  useLayoutEffect(() => {
    const place = () => {
      const el = document.querySelector<HTMLElement>(`[data-tab="${step.tab}"]`);
      if (!el) return setPos(null);
      const r = el.getBoundingClientRect();
      const vw = window.innerWidth;
      const width = Math.min(W, vw - 24);
      const center = r.left + r.width / 2;
      const left = Math.max(12, Math.min(vw - width - 12, center - width / 2));
      setPos({ bottom: window.innerHeight - r.top + 12, left, arrow: center - left });
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [step.tab]);

  useEffect(() => {
    nextRef.current?.focus();
  }, [i]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const last = i === STEPS.length - 1;
  const width = typeof window === 'undefined' ? W : Math.min(W, window.innerWidth - 24);
  return (
    <div className="fixed inset-0 z-50" aria-hidden={false}>
      <div className="absolute inset-0 bg-black/35" onClick={() => onClose(false)} />
      {pos && (
        <motion.div
          key={step.tab}
          role="dialog"
          aria-modal="true"
          aria-labelledby="tour-title"
          data-tour={step.tab}
          className="card absolute p-4 shadow-[var(--shadow-card)]"
          style={{ bottom: pos.bottom, left: pos.left, width }}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
        >
          <span className="absolute -bottom-2 h-4 w-4 rotate-45 bg-[var(--bg-elev)]" style={{ left: pos.arrow - 8 }} aria-hidden />
          <h2 id="tour-title" className="text-base font-black">
            🦫 {t(step.title)}
          </h2>
          <p className="muted mt-1 text-sm font-semibold leading-snug">{t(step.text)}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="muted text-xs font-bold" aria-live="polite">
              {t('tour_step', { n: i + 1, total: STEPS.length })}
            </span>
            <button type="button" className="muted ml-auto px-2 py-2 text-sm font-bold" data-tour-skip onClick={() => onClose(false)}>
              {t('tour_skip')}
            </button>
            <button type="button" ref={nextRef} className="btn btn-primary !min-h-[40px] !px-4 text-sm" data-tour-next onClick={() => (last ? onClose(true) : setI(i + 1))}>
              {last ? t('tour_done') : t('tour_next')}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
