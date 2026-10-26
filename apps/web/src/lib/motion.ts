/**
 * framer-motion застосунку: легкі компоненти `m` під LazyMotion (App.tsx). Можливості анімацій
 * (анімації, жести, layout/layoutId) — окремий чанк motion-features, що вантажиться одразу після старту,
 * тож код проєкцій і жестів не входить у головний чанк. Імпортуйте motion лише звідси.
 */
import { useContext } from 'react';
import { MotionConfigContext, useReducedMotion as useSystemReducedMotion } from 'framer-motion';

export { m as motion, AnimatePresence, LayoutGroup, LazyMotion, MotionConfig, animate, useDragControls, useInView, useMotionValue, useTransform } from 'framer-motion';

/**
 * Менше руху: налаштування профілю «Менше анімацій» (MotionConfig reducedMotion="always", App.tsx) або системне
 * prefers-reduced-motion. Хук framer-motion бачить лише системне — і тоді імперативні animate() та безкінечні цикли
 * ігнорують вибір користувача. useReducedMotionConfig не підходить: поза MotionConfig (заставка) він завжди false.
 */
export function useReducedMotion(): boolean {
  const system = useSystemReducedMotion();
  return useContext(MotionConfigContext).reducedMotion === 'always' || !!system;
}

export const loadMotionFeatures = () => import('./motion-features').then((r) => r.default);
