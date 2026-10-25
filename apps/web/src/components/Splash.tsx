/**
 * Заставка POLSKI GO: шаровий світ Кракова (небо → хмари → Вавель і Маріацький костел →
 * кам'яниці, Żabka, пам'ятник → трамвай → площа → кіоск з хот-догами → великий бобер →
 * розмиті кущі), об'ємний логотип і реальний прогрес запуску з тематичними фразами.
 * Використовується під час завантаження і на першому кроці онбордингу.
 */
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Beaver } from './Beaver';
import { Item, type ItemName } from './Illustrations';
import { Birds, Clouds, FarCity, Foreground, HotDogCart, MidCity, Plaza, Sky, Steam, Tram } from './SplashWorld';
import { useT, type TKey } from '../i18n';
import { useBootProgress } from '../lib/boot';

/** Ілюстрація до кожної фрази завантаження (15 — фінальна «бобер уже чекає»). */
const MSG_ICONS: ItemName[] = ['book-clock', 'hotdog', 'basket', 'receipt', 'pierogi', 'zurek', 'ticket', 'backpack', 'speech', 'tram', 'headphones', 'map', 'train', 'beaver-map', 'paws'];
const ROTATING = 14;

// Стан між перемонтуваннями (заставка показується і до, і після завантаження профілю).
let introPlayed = false;
let msgIndex = Math.floor(Math.random() * ROTATING);

/** Об'ємний логотип POLSKI GO з прапорцем — векторний, без растрових ассетів. */
export function SplashLogo({ className }: { className?: string }) {
  const font = { fontFamily: 'Nunito, ui-rounded, system-ui, sans-serif', fontWeight: 900 } as const;
  const word = (text: string, x: number, y: number, size: number, face: string, deep: string, inner: string, anchor: 'middle' | 'start' = 'middle') => (
    <g style={font} fontSize={size} textAnchor={anchor} letterSpacing={-size * 0.03}>
      {/* тінь і об'ємна «екструзія» */}
      <text x={x} y={y + 14} fill="#071a3a" opacity="0.35" stroke="#071a3a" strokeWidth={size * 0.2} strokeLinejoin="round">{text}</text>
      {[9, 7, 5, 3].map((d) => (
        <text key={d} x={x} y={y + d} fill={deep} stroke="#0E2758" strokeWidth={size * 0.16} strokeLinejoin="round">{text}</text>
      ))}
      <text x={x} y={y} fill="none" stroke="#0E2758" strokeWidth={size * 0.16} strokeLinejoin="round">{text}</text>
      <text x={x} y={y} fill="none" stroke={inner} strokeWidth={size * 0.07} strokeLinejoin="round">{text}</text>
      <text x={x} y={y} fill={face}>{text}</text>
    </g>
  );
  return (
    <svg viewBox="0 0 360 230" className={className} role="img" aria-label="POLSKI GO">
      <defs>
        <linearGradient id="lg-white" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.55" stopColor="#F2F7FF" /><stop offset="1" stopColor="#C9DDF8" /></linearGradient>
        <linearGradient id="lg-red" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FF8A8F" /><stop offset="0.5" stopColor="#FF4F5E" /><stop offset="1" stopColor="#D92B3C" /></linearGradient>
        <radialGradient id="lg-glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#FFFFFF" stopOpacity="0.55" /><stop offset="1" stopColor="#FFFFFF" stopOpacity="0" /></radialGradient>
      </defs>
      <ellipse cx="180" cy="120" rx="178" ry="110" fill="url(#lg-glow)" />
      <g transform="rotate(-4 180 120)">
        {word('POLSKI', 180, 98, 86, 'url(#lg-white)', '#1C4FB0', '#4D8FEA')}
        {word('GO', 142, 204, 108, 'url(#lg-red)', '#A51D2B', '#FFFFFF')}
        {/* прапорець, що майорить */}
        <g className="sw-flag" style={{ transformBox: 'fill-box', transformOrigin: '0% 50%' }}>
          <path d="M214 144 Q246 126 278 140 Q300 150 318 136 L318 176 Q300 190 278 180 Q246 166 214 184 Z" fill="#E5383B" stroke="#0E2758" strokeWidth="6" strokeLinejoin="round" />
          <path d="M214 144 Q246 126 278 140 Q300 150 318 136 L318 156 Q300 170 278 160 Q246 146 214 164 Z" fill="#FFFFFF" />
          <path d="M214 144 Q246 126 278 140 Q300 150 318 136 L318 176 Q300 190 278 180 Q246 166 214 184 Z" fill="none" stroke="#0E2758" strokeWidth="5" strokeLinejoin="round" />
          <path d="M222 148 Q246 136 270 144" stroke="#FFFFFF" strokeWidth="3" fill="none" opacity="0.8" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}

function useBeaverSize() {
  const calc = () => Math.round(Math.min(window.innerWidth * 0.8, window.innerHeight * 0.38, 360));
  const [size, setSize] = useState(calc);
  useEffect(() => {
    const on = () => setSize(calc());
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return size;
}

/** Паралакс: шари зсуваються за пальцем/курсором або нахилом телефона (Android). */
function useParallax(ref: React.RefObject<HTMLDivElement | null>, enabled: boolean) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    let raf = 0;
    const set = (x: number, y: number) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--px', x.toFixed(3));
        el.style.setProperty('--py', y.toFixed(3));
      });
    };
    const onMove = (e: PointerEvent) => set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      set(Math.max(-1, Math.min(1, e.gamma / 25)), Math.max(-1, Math.min(1, (e.beta - 45) / 25)));
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('deviceorientation', onTilt, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('deviceorientation', onTilt);
    };
  }, [ref, enabled]);
}

function LoadingUi() {
  const { t } = useT();
  const progress = useBootProgress();
  const [msg, setMsg] = useState(msgIndex);
  useEffect(() => {
    const id = setInterval(() => {
      msgIndex = (msgIndex + 1) % ROTATING;
      setMsg(msgIndex);
    }, 1900);
    return () => clearInterval(id);
  }, []);
  // Профіль завантажено — бобер уже чекає (фінальна фраза).
  const n = progress >= 0.82 ? ROTATING : msg;
  const pct = Math.round(progress * 100);
  return (
    <div className="splash-ui absolute inset-x-0 bottom-0 z-30 px-7" role="status" aria-live="polite" aria-label={`${t('splash_loading')} ${pct}%`}>
      <div className="splash-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="splash-bar-fill" style={{ width: `${Math.max(6, pct)}%` }} />
      </div>
      <div className="splash-msg mt-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={n} className="flex min-w-0 items-center gap-3" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} transition={{ duration: 0.22 }}>
            <span className="shrink-0"><Item name={MSG_ICONS[n]} size={34} /></span>
            <span className="line-clamp-2 text-[15px] font-extrabold leading-tight text-white">{t(`splash_msg_${n + 1}` as TKey)}</span>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-4 flex justify-center gap-2.5" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span key={i} className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${n % 3 === i ? 'bg-sky shadow-[0_0_10px_2px_rgba(54,185,255,0.8)]' : 'bg-white/35'}`} />
        ))}
      </div>
    </div>
  );
}

function ErrorUi({ onRetry }: { onRetry?: () => void }) {
  const { t } = useT();
  const offline = typeof navigator !== 'undefined' && !navigator.onLine;
  return (
    <div className="splash-ui absolute inset-x-0 bottom-0 z-30 px-6" role="alert">
      <div className="splash-msg flex-col !items-stretch gap-1 !py-4 text-center">
        <div className="text-lg font-black text-white">{t('splash_error_title')}</div>
        <div className="text-sm font-bold text-[#cfe0f2]">{offline ? t('error_offline') : t('splash_error_text')}</div>
        {onRetry && (
          <button className="btn btn-sky mt-3 w-full" onClick={onRetry}>
            {t('error_retry')}
          </button>
        )}
      </div>
    </div>
  );
}

export function SplashScene({ slogan, loading, error, onRetry, children }: { slogan?: string; loading?: boolean; error?: boolean; onRetry?: () => void; children?: ReactNode }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [intro] = useState(() => !introPlayed && !reduce);
  useEffect(() => {
    introPlayed = true;
  }, []);
  useParallax(ref, !reduce);
  const size = useBeaverSize();
  const hasUi = loading || error;

  return (
    <div ref={ref} className={`splash relative min-h-[100dvh] overflow-hidden ${intro ? 'sw-intro' : ''}`}>
      <Sky />
      <Clouds />
      <Birds />
      <FarCity />
      <Plaza />
      <MidCity />
      <Tram />
      <HotDogCart />
      <Steam />
      {/* бобер-мандрівник: великий, по центру */}
      <div className="sw-beaver absolute left-1/2 z-20 -translate-x-1/2" style={{ bottom: hasUi ? 'calc(118px + 7vh)' : 'calc(var(--safe-b) + 196px)' }}>
        <motion.div
          initial={intro ? { y: 60, scale: 0.7, opacity: 0 } : false}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          transition={{ delay: 0.25, type: 'spring', stiffness: 170, damping: 14 }}
        >
          <motion.div style={{ originY: 1 }} animate={reduce ? undefined : { rotate: [-1.6, 1.6, -1.6] }} transition={{ repeat: Infinity, duration: 3.4, ease: 'easeInOut' }}>
            <Beaver mood="wave" size={size} outfit={{ JACKET: 'none' }} lively vectorOnly />
          </motion.div>
        </motion.div>
      </div>
      <Foreground />
      {/* логотип */}
      <motion.div
        className="safe-top absolute inset-x-0 top-0 z-30 flex flex-col items-center pt-[5vh]"
        initial={intro ? { y: -50, opacity: 0, scale: 0.85 } : false}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        <SplashLogo className="w-[min(84vw,340px)] drop-shadow-[0_10px_18px_rgba(7,26,58,0.35)]" />
        {slogan && <div className="-mt-1 rounded-full bg-white/90 px-3.5 py-1 text-[13px] font-black text-[#1E3346] shadow-lg">{slogan}</div>}
      </motion.div>
      {loading && !error && <LoadingUi />}
      {error && <ErrorUi onRetry={onRetry} />}
      {children}
    </div>
  );
}
