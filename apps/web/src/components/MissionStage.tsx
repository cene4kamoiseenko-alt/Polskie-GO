/**
 * Сцена шага миссии (вариант А «сцена над диалогом», docs/superpowers/specs/2026-11-24-living-missions-design.md): картинка места сверху на
 * всех шагах (не перезагружается между шагами) — медленно приближается; крестик, прогресс и «сообщить об ошибке» поверх картинки;
 * реакция на ответ — вспышка (верно) или вздрагивание (ошибка) всего кадра. Бобек нарисован в кадре: второго поверх нет.
 * «Меньше анимаций» — без приближения и без реакции кадра.
 */
import { useEffect, type ReactNode } from 'react';
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from '../lib/motion';
import { MissionScene } from './MissionScene';

export type StageReaction = { kind: 'correct' | 'wrong'; n: number } | null;

type Props = {
  slug: string;
  scene: string;
  season?: string | null;
  category: string;
  /** Верхняя панель (крестик, прогресс, флажок) — поверх картинки. */
  top: ReactNode;
  /** Последняя реакция на ответ; `n` растёт с каждым ответом, чтобы одинаковые реакции подряд тоже проигрывались. */
  reaction: StageReaction;
  /** Похвала по-польски над картинкой после верного ответа (взлетает и тает). */
  praise?: string | null;
};

export function MissionStage({ slug, scene, season, category, top, reaction, praise }: Props) {
  const reduce = useReducedMotion();
  // Реакция кадра — командой, без перемонтирования: картинка и её медленное приближение не начинаются заново после ответа.
  const controls = useAnimationControls();
  useEffect(() => {
    if (!reaction || reduce) return;
    if (reaction.kind === 'correct') void controls.start({ filter: ['brightness(1)', 'brightness(1.25) saturate(1.15)', 'brightness(1)'], transition: { duration: 0.7 } });
    else void controls.start({ x: [0, -6, 6, -3, 0], transition: { duration: 0.3 } });
  }, [reaction?.n]);
  return (
    <div className="mission-stage relative overflow-hidden rounded-b-[30px]" data-mission-stage>
      <motion.div className="absolute inset-0" animate={controls}>
        <div className={reduce ? 'absolute inset-0' : 'stage-drift absolute inset-0'}>
          <MissionScene slug={slug} scene={scene} season={season} category={category} lazy={false} className="block h-full w-full" />
        </div>
      </motion.div>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(7_24_44/0.5)_0%,rgb(7_24_44/0)_26%,rgb(7_24_44/0)_72%,rgb(7_24_44/0.3)_100%)]" />
      <div className="relative z-10">{top}</div>
      <AnimatePresence>
        {praise && !reduce && (
          <motion.div
            key={reaction?.n ?? 0}
            className="pointer-events-none absolute inset-x-0 top-[38%] z-10 text-center text-[30px] font-black text-white [text-shadow:0_3px_0_rgb(7_24_44/0.55),0_0_18px_rgb(0_0_0/0.45)]"
            lang="pl"
            initial={{ opacity: 0, y: 14, scale: 0.8 }}
            animate={{ opacity: [0, 1, 1, 0], y: [14, -8, -22, -44], scale: [0.8, 1.15, 1, 1] }}
            transition={{ duration: 1.4, times: [0, 0.25, 0.6, 1] }}
            aria-hidden
          >
            {praise}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
