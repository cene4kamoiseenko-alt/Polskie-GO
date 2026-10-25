/** Базові компоненти дизайн-системи. */
import { AnimatePresence, motion } from 'framer-motion';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useT, type TKey } from '../i18n';
import { tg, haptic } from '../lib/telegram';
import { speak, useSpeechState } from '../lib/audio';
import { Beaver } from './Beaver';
import { GameIcon, type IconName } from './GameIcon';
import { Icon, type LineIconName } from './Icon';

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(' ');
}

export function Card({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  if (onClick) {
    return (
      // div з role=button: усередині картки можуть бути інші кнопки (озвучення тощо).
      <motion.div
        role="button"
        tabIndex={0}
        whileTap={{ scale: 0.98 }}
        onClick={() => { haptic.tap(); onClick(); }}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
        className={cx('card block w-full cursor-pointer text-left', className)}
      >
        {children}
      </motion.div>
    );
  }
  return <div className={cx('card', className)}>{children}</div>;
}

export function Progress({ value, max = 100, color = 'var(--color-brand)', height = 12, className }: { value: number; max?: number; color?: string; height?: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, max ? (value / max) * 100 : 0));
  return (
    <div className={cx('w-full overflow-hidden rounded-full', className)} style={{ height, background: 'var(--track)', boxShadow: 'inset 0 1px 3px rgb(0 0 0 / 0.35), 0 0 0 1px var(--border)' }} role="progressbar" aria-valuenow={value} aria-valuemax={max}>
      <motion.div className="relative h-full rounded-full" style={{ background: color }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ type: 'spring', stiffness: 80, damping: 18 }}>
        <div className="absolute inset-x-2 top-[3px] h-[3px] rounded-full bg-white/40" />
      </motion.div>
    </div>
  );
}

export function Ring({ value, max, size = 64, stroke = 8, color = 'var(--color-brand)', children }: { value: number; max: number; size?: number; stroke?: number; color?: string; children?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, max ? value / max : 0));
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--track)" strokeWidth={stroke} fill="none" />
        <motion.circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - pct) }} transition={{ duration: 0.8 }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx('skeleton', className)} />;
}

export function ScreenSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-40" />
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
    </div>
  );
}

export function EmptyState({ text, action }: { text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      <Beaver mood="think" size={110} />
      <p className="muted font-bold">{text}</p>
      {action}
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const { t } = useT();
  const offline = typeof navigator !== 'undefined' && !navigator.onLine;
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <Beaver mood="sad" size={120} />
      <h2 className="text-xl font-black">{t('error_title')}</h2>
      <p className="muted text-sm font-semibold">{offline ? t('error_offline') : (error as Error)?.message}</p>
      {onRetry && (
        <button className="btn btn-primary mt-2" onClick={onRetry}>
          {t('error_retry')}
        </button>
      )}
    </div>
  );
}

/** Заголовок вкладеного екрана з кнопкою «Назад» (у Telegram — системна BackButton). */
export function ScreenHeader({ title, subtitle, right, onBack }: { title: string; subtitle?: string; right?: ReactNode; onBack?: () => void }) {
  const nav = useNavigate();
  const back = useCallback(() => (onBack ? onBack() : nav(-1)), [nav, onBack]);
  useBackButton(back);
  return (
    <div className="flex items-center gap-3 px-4 pb-2 pt-3">
      {!tg && (
        <button onClick={back} className="grid h-10 w-10 place-items-center rounded-full bg-elev text-xl font-black shadow" aria-label="back">
          ←
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-2xl font-black leading-tight">{title}</h1>
        {subtitle && <p className="muted truncate text-sm font-semibold">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

/** Стек обробників системної кнопки «Назад»: спрацьовує лише верхній (шторка поверх екрана). */
const backStack: { fn: () => void }[] = [];
const dispatchBack = () => backStack[backStack.length - 1]?.fn();
let backBound = false;

export function useBackButton(onBack: (() => void) | null) {
  useEffect(() => {
    if (!tg || !onBack) return;
    const entry = { fn: onBack };
    backStack.push(entry);
    if (!backBound) {
      tg.BackButton.onClick(dispatchBack);
      backBound = true;
    }
    tg.BackButton.show();
    return () => {
      const i = backStack.indexOf(entry);
      if (i >= 0) backStack.splice(i, 1);
      if (!backStack.length) tg?.BackButton.hide();
    };
  }, [onBack]);
}

/** Нижня шторка. */
export function Sheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  useBackButton(open ? onClose : null);
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div className="absolute inset-0 bg-black/45" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className="safe-bottom absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-[28px] px-5 pt-3"
            style={{ background: 'var(--bg)' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => info.offset.y > 120 && onClose()}
          >
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full" style={{ background: 'var(--border)' }} />
            {children}
            <div className="h-3" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function Modal({ open, onClose, children }: { open: boolean; onClose?: () => void; children: ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] grid place-items-center p-6">
          <motion.div className="absolute inset-0 bg-black/55" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div className="card relative w-full max-w-sm p-6 text-center" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: 'spring', damping: 18 }}>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ───────── Тости ─────────
type Toast = { id: number; text: string; icon?: string };
const ToastCtx = createContext<(text: string, icon?: string) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((text: string, icon?: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, icon }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="safe-top pointer-events-none fixed inset-x-0 top-2 z-[80] flex flex-col items-center gap-2 px-4">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div key={t.id} initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="card flex items-center gap-2 px-4 py-3 font-bold">
              {t.icon && <ToastIcon icon={t.icon} />}
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

const TOAST_ICONS: Record<string, [LineIconName, string]> = {
  '⚠️': ['alert', '#F45159'], '✅': ['check', '#35C88A'], 'ℹ️': ['alert', '#55BDF4'], '✨': ['star', '#FFBD42'],
  '👋': ['user', '#9568F5'], '🔇': ['headphones', '#F45159'], '🤝': ['user', '#35C88A'],
};
function ToastIcon({ icon }: { icon: string }) {
  const m = TOAST_ICONS[icon];
  if (!m) return <span className="text-xl">{icon}</span>;
  return <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-white" style={{ background: m[1] }}><Icon name={m[0]} size={16} strokeWidth={2.6} /></span>;
}

// ───────── Верхня панель статистики ─────────
export function StatPill({ icon, value, color, onClick, label }: { icon: string; value: ReactNode; color?: string; onClick?: () => void; label: string }) {
  return (
    <button onClick={onClick} aria-label={label} className="flex items-center gap-1 rounded-full bg-elev px-3 py-1.5 text-[15px] font-black shadow-sm" style={{ color }}>
      <span className="text-base leading-none">{icon}</span>
      {value}
    </button>
  );
}

// ───────── Нижня навігація ─────────
const TABS: { to: string; icon: LineIconName; key: TKey }[] = [
  { to: '/', icon: 'home', key: 'nav_home' },
  { to: '/map', icon: 'map', key: 'nav_map' },
  { to: '/learn', icon: 'book', key: 'nav_learn' },
  { to: '/quests', icon: 'target', key: 'nav_quests' },
  { to: '/profile', icon: 'user', key: 'nav_profile' },
];

export function BottomNav({ badge }: { badge?: Partial<Record<string, number>> }) {
  const { t } = useT();
  const loc = useLocation();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-soft" style={{ paddingBottom: "var(--safe-b)", background: "linear-gradient(180deg, var(--bg-elev-2), var(--bg-elev))", boxShadow: "0 -8px 20px -12px rgb(0 0 0 / 0.6)" }}>
      <div className="mx-auto flex max-w-xl justify-around px-1" style={{ height: 'var(--nav-h)' }}>
        {TABS.map((tab) => {
          const active = tab.to === '/' ? loc.pathname === '/' : loc.pathname.startsWith(tab.to);
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              onClick={() => haptic.select()}
              className={cx('relative flex min-w-[62px] flex-1 flex-col items-center justify-center gap-1 transition-colors active:scale-95', active ? 'text-pl-red' : 'text-[#8A97A6]')}
              aria-current={active ? 'page' : undefined}
            >
              <span className="relative grid h-9 w-12 place-items-center">
                {active && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-2xl bg-[color-mix(in_srgb,var(--color-pl-red)_12%,transparent)]" transition={{ type: 'spring', stiffness: 500, damping: 36 }} />}
                <motion.span className="relative" animate={{ scale: active ? 1.08 : 1, y: active ? -1 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 24 }}>
                  <Icon name={tab.icon} size={24} strokeWidth={active ? 2.4 : 2} />
                </motion.span>
              </span>
              <span className="text-[11px] font-extrabold leading-none">{t(tab.key)}</span>
              {!!badge?.[tab.to] && <span className="absolute right-[22%] top-2 h-2.5 w-2.5 rounded-full bg-pl-red ring-2 ring-[var(--bg-elev)]" />}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

export function Section({ title, action, children, className }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cx('px-4', className)}>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-black">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Toggle({ checked, onChange, label, description, icon }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string; icon?: LineIconName }) {
  return (
    <button className="flex w-full items-center gap-3 py-3 text-left" onClick={() => { haptic.select(); onChange(!checked); }} role="switch" aria-checked={checked}>
      <div className="flex-1">
        <div className="flex items-center gap-2 font-bold">{icon && <Icon name={icon} size={20} className="text-sky-dark" />}{label}</div>
        {description && <div className="muted text-sm font-semibold">{description}</div>}
      </div>
      <div className={cx('relative h-8 w-14 rounded-full transition-colors')} style={{ background: checked ? 'var(--color-brand)' : 'var(--track)' }}>
        <motion.div className="absolute top-1 h-6 w-6 rounded-full bg-white shadow" animate={{ left: checked ? 28 : 4 }} />
      </div>
    </button>
  );
}

/** Простий текст з **жирним** і переносами рядків (пояснення граматики). */
export function RichText({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cx('space-y-1.5', className)}>
      {text.split('\n').map((line, i) => (
        <p key={i}>
          {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
            part.startsWith('**') ? (
              <b key={j} className="text-brand-dark dark:text-brand">
                {part.slice(2, -2)}
              </b>
            ) : (
              <span key={j}>{part}</span>
            ),
          )}
        </p>
      ))}
    </div>
  );
}

/** Кнопка польської озвучки: стан завантаження, відтворення та помилки; slow — сповільнено. */
export function SpeakButton({ text, url, size = 'md', slow = false }: { text: string; url?: string | null; size?: 'sm' | 'md' | 'lg'; slow?: boolean }) {
  const { t } = useT();
  const toast = useToast();
  const { status, issue } = useSpeechState(text, slow);
  const lastIssue = useRef<string | null>(null);
  useEffect(() => {
    if (status !== 'error' || !issue || lastIssue.current === issue) return;
    lastIssue.current = issue;
    toast(t(issue === 'no_polish_voice' ? 'audio_no_voice' : issue === 'blocked' ? 'audio_blocked' : 'audio_error'), '🔇');
  }, [status, issue, toast, t]);
  const dims = size === 'lg' ? 'h-16 w-16' : size === 'sm' ? 'h-9 w-9' : 'h-11 w-11';
  const icon = size === 'lg' ? 30 : size === 'sm' ? 16 : 22;
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        haptic.tap();
        void speak(text, { url: url ?? undefined, slow });
      }}
      className={cx(
        'relative grid shrink-0 place-items-center rounded-2xl text-white transition-transform active:scale-90',
        status === 'error' ? 'bg-[#B9C1CB] shadow-[0_3px_0_#8D97A3]' : slow ? 'bg-elev text-sky-dark shadow-[0_3px_0_var(--border)]' : 'bg-sky shadow-[0_3px_0_var(--color-sky-dark)]',
        dims,
      )}
      aria-label={slow ? t('ex_slow') : t('audio_listen')}
      aria-busy={status === 'loading'}
    >
      {status === 'loading' ? (
        <span className="h-1/2 w-1/2 animate-spin rounded-full border-[3px] border-current border-t-transparent" />
      ) : slow ? (
        <SlowIcon size={icon} />
      ) : (
        <SpeakerIcon size={icon} playing={status === 'playing'} muted={status === 'error'} />
      )}
    </button>
  );
}

function SpeakerIcon({ size, playing, muted }: { size: number; playing: boolean; muted: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" />
      {muted ? (
        <path d="M16 9.5l5 5m0-5l-5 5" />
      ) : (
        <>
          <path d="M15.5 9a4 4 0 010 6" className={playing ? 'animate-pulse' : ''} />
          <path d="M18.5 6.5a7.5 7.5 0 010 11" className={playing ? 'animate-pulse' : ''} />
        </>
      )}
    </svg>
  );
}

function SlowIcon({ size }: { size: number }) {
  // Черепаха — сповільнене відтворення.
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4 15c0-4 3.2-7 7.5-7S19 11 19 15H4z" />
      <path d="M19 13.5c1.6 0 3-.6 3-2s-1.2-2-2.2-2c-1 0-1.3 1-1.3 1.6" />
      <rect x="5.5" y="15" width="2.6" height="3" rx="1" />
      <rect x="14.5" y="15" width="2.6" height="3" rx="1" />
      <path d="M9 10.5l2.5 2 2.5-2" stroke="#fff" strokeWidth="1.3" fill="none" opacity=".6" />
    </svg>
  );
}

export function Confetti({ run }: { run: boolean }) {
  const pieces = Array.from({ length: 36 });
  const colors = ['#45C486', '#FFC857', '#E5484D', '#69C7F4', '#9B6BFF'];
  if (!run) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[70] overflow-hidden">
      {pieces.map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-3 w-2 rounded-sm"
          style={{ background: colors[i % colors.length], left: `${(i * 37) % 100}%`, top: -20 }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{ y: '110vh', rotate: 360 * (i % 2 ? 1 : -1) * 2, x: ((i % 7) - 3) * 30, opacity: [1, 1, 0.6] }}
          transition={{ duration: 2.2 + (i % 5) * 0.3, ease: 'easeIn', delay: (i % 6) * 0.08 }}
        />
      ))}
    </div>
  );
}
