/**
 * Похвала за серию верных ответов (владелец 2026-11-24, вариант Б): панель ответа становится золотой, вместо галочки — огонёк,
 * в заголовке польское слово и счётчик ×N. Движение (design-motion-principles: событие редкое — 3/5/10/15 подряд, — поэтому
 * выразительное, но короткое, ≤ 0,7 с и один раз): огонёк «вспыхивает» пружиной, из него взлетают искры, счётчик перекатывается
 * с прошлого числа на новое (сдвиг + размытие), по панели один раз проходит блик (.combo-sheen в index.css).
 * «Меньше анимаций» — тот же золотой вид без движения.
 */
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from '../lib/motion';
import { Art } from './GameArt';

const EMBERS = [
  { x: -16, y: -34, d: 0 },
  { x: 14, y: -40, d: 0.04 },
  { x: -4, y: -46, d: 0.08 },
  { x: 20, y: -26, d: 0.12 },
  { x: -22, y: -22, d: 0.06 },
  { x: 6, y: -30, d: 0.16 },
];

/** Золотой кружок с огоньком на месте галочки. */
export function ComboBadge() {
  const reduce = useReducedMotion();
  return (
    <span className="relative grid h-12 w-12 shrink-0 place-items-center" data-combo-flame>
      <motion.span
        className="combo-badge grid h-12 w-12 place-items-center rounded-full"
        initial={reduce ? false : { scale: 0.7, rotate: -14, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 520, damping: 14 }}
      >
        <Art name="flame" size={30} />
      </motion.span>
      {!reduce &&
        EMBERS.map((e, i) => (
          <motion.span
            key={i}
            aria-hidden
            className="combo-ember pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full"
            initial={{ x: -3, y: -3, opacity: 0, scale: 1 }}
            animate={{ x: e.x - 3, y: e.y - 3, opacity: [0, 1, 0], scale: [1, 1, 0.4] }}
            transition={{ duration: 0.7, delay: 0.12 + e.d, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
    </span>
  );
}

/** «Świetnie! ×5»: счётчик перекатывается с ×4 на ×5 (новое число въезжает снизу и проявляется, старое уходит вверх). */
export function ComboTitle({ word, n }: { word: string; n: number }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? n : n - 1);
  useEffect(() => {
    if (reduce) return setShown(n);
    const tm = setTimeout(() => setShown(n), 240);
    return () => clearTimeout(tm);
  }, [n, reduce]);
  return (
    <span className="combo-title">
      <span lang="pl">{word}</span>{' '}
      <span className="whitespace-nowrap tabular-nums">
        ×<span className="relative inline-block overflow-hidden align-bottom">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={shown}
              className="inline-block"
              initial={{ y: '70%', opacity: 0, filter: 'blur(3px)' }}
              animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
              exit={{ y: '-70%', opacity: 0, filter: 'blur(3px)' }}
              transition={{ type: 'spring', duration: 0.38, bounce: 0.2 }}
            >
              {shown}
            </motion.span>
          </AnimatePresence>
        </span>
      </span>
    </span>
  );
}
