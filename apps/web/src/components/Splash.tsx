/**
 * Заставка POLSKI GO: вечірнє небо над Краковом, обʼємний логотип, Бобек з картою.
 * Використовується під час завантаження і на першому кроці онбордингу.
 */
import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Beaver } from './Beaver';
import { Logo, Skyline } from './Scenery';

export function SplashScene({ slogan, loading, children }: { slogan?: string; loading?: boolean; children?: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center overflow-hidden" style={{ background: 'linear-gradient(180deg, #16406B 0%, #2F78B8 30%, #86C9EE 58%, #FFD9A0 78%, #FFB97A 100%)' }}>
      {/* сонце й світіння */}
      <div className="absolute left-1/2 top-[52%] h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,236,170,0.95) 0%, rgba(255,200,120,0.4) 40%, transparent 70%)' }} />
      {/* птахи */}
      <svg className="absolute right-8 top-24 w-24 opacity-70" viewBox="0 0 100 40" aria-hidden>
        {[[10, 20], [40, 10], [70, 24]].map(([x, y]) => <path key={x} d={`M${x} ${y} q6 -6 12 0 q6 -6 12 0`} fill="none" stroke="#1E3346" strokeWidth="2.4" strokeLinecap="round" />)}
      </svg>
      <motion.div className="relative z-10 mt-14" initial={reduce ? false : { y: -30, opacity: 0, scale: 0.8 }} animate={{ y: 0, opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 16 }}>
        <Logo size={58} slogan={slogan} />
      </motion.div>
      <Skyline className="absolute inset-x-0 bottom-0 w-full" height={330} sky={false} />
      <div className="absolute inset-x-0 bottom-0 h-40" style={{ background: 'linear-gradient(180deg, transparent, rgba(12,27,41,0.85))' }} />
      <motion.div className="absolute bottom-[11%] left-[2%] z-10" initial={reduce ? false : { y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 180, damping: 15 }}>
        <Beaver mood="map" size={200} outfit={{}} />
      </motion.div>
      {loading && (
        <div className="absolute bottom-10 z-10 flex gap-2" role="status" aria-label="loading">
          {[0, 1, 2].map((i) => (
            <motion.span key={i} className="h-3 w-3 rounded-full bg-white" animate={reduce ? undefined : { opacity: [0.3, 1, 0.3], y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.15 }} />
          ))}
        </div>
      )}
      {children}
    </div>
  );
}
