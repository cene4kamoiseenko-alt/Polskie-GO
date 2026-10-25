/**
 * framer-motion застосунку: легкі компоненти `m` під LazyMotion (App.tsx). Можливості анімацій
 * (анімації, жести, layout/layoutId) — окремий чанк motion-features, що вантажиться одразу після старту,
 * тож код проєкцій і жестів не входить у головний чанк. Імпортуйте motion лише звідси.
 */
export { m as motion, AnimatePresence, LayoutGroup, LazyMotion, MotionConfig, animate, useInView, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';

export const loadMotionFeatures = () => import('./motion-features').then((r) => r.default);
