/** Общие элементы админки (обновление вида 2026-11-12): заголовок страницы, карточка, показатель с динамикой, переключатель, загрузка данных. */
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(' ');

/**
 * Загрузка данных для экрана. Ответ применяется, только если это последний запрос: при быстром переключении периода
 * медленный старый ответ не перезапишет новый, а после ухода со страницы ничего не обновится.
 */
export function useLoad<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const seq = useRef(0);
  const reload = useCallback(() => {
    const id = ++seq.current;
    setLoading(true);
    fn()
      .then((d) => {
        if (id !== seq.current) return;
        setData(d);
        setError(null);
      })
      .catch((e) => {
        if (id === seq.current) setError(e.message);
      })
      .finally(() => {
        if (id === seq.current) setLoading(false);
      });
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    reload();
    return () => {
      seq.current++;
    };
  }, [reload]);
  return { data, error, loading, reload };
}

export function PageHeader({ title, subtitle, actions }: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-[26px] font-black leading-tight tracking-tight text-night">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, subtitle, actions, children, className, bodyClass, ...rest }: { title?: ReactNode; subtitle?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string; bodyClass?: string; [k: `data-${string}`]: string | undefined }) {
  return (
    <section className={cx('panel overflow-hidden', className)} {...rest}>
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-2 border-b border-line px-4 py-3">
          <div className="min-w-0">
            {title && <h2 className="text-[15px] font-bold text-night">{title}</h2>}
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className={bodyClass ?? 'p-4'}>{children}</div>
    </section>
  );
}

/** Рост относительно прошлого периода: «▲ 12 %», «▼ 5 %», «новое» (раньше было 0), «—» (оба 0). */
export function Delta({ now, prev, invert }: { now: number; prev: number; invert?: boolean }) {
  if (!now && !prev) return <span className="text-xs font-semibold text-slate-500">— как и раньше</span>;
  if (!prev) return <span className="badge badge-green">новое</span>;
  const pct = Math.round(((now - prev) / prev) * 100);
  if (pct === 0) return <span className="text-xs font-semibold text-slate-500">без изменений</span>;
  const good = invert ? pct < 0 : pct > 0;
  return <span className={cx('badge', good ? 'badge-green' : 'badge-red')}>{pct > 0 ? '▲' : '▼'} {Math.abs(pct)} %</span>;
}

const TONES = {
  brand: 'from-brand/15 text-[#13784f]',
  sky: 'from-sky/15 text-[#0f6aa6]',
  gold: 'from-gold/20 text-[#9a6200]',
  coral: 'from-coral/15 text-[#b42336]',
  night: 'from-night/10 text-night',
} as const;

export function Kpi({ label, value, icon, tone = 'brand', now, prev, hint, invert, compact }: { label: string; value: ReactNode; icon?: ReactNode; tone?: keyof typeof TONES; now?: number; prev?: number; hint?: ReactNode; invert?: boolean; compact?: boolean }) {
  // Второстепенный показатель — спокойнее главного: без цветной подложки и с числом поменьше (визуальная иерархия).
  if (compact)
    return (
      <div className="panel p-3.5">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</div>
        <div className="mt-1 text-xl font-black tracking-tight text-night">{value}</div>
        {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
      </div>
    );
  return (
    <div className="panel relative overflow-hidden p-4">
      <div className={cx('pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b to-transparent', TONES[tone].split(' ')[0])} />
      <div className="relative flex items-start justify-between gap-2">
        <div className="text-[12px] font-semibold uppercase tracking-wider text-slate-500">{label}</div>
        {icon && <span className={cx('grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white text-base shadow-sm', TONES[tone].split(' ')[1])} aria-hidden>{icon}</span>}
      </div>
      <div className="relative mt-1 text-[28px] font-black leading-none tracking-tight text-night">{value}</div>
      <div className="relative mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        {now !== undefined && prev !== undefined && <Delta now={now} prev={prev} invert={invert} />}
        {hint}
      </div>
    </div>
  );
}

export function Segmented<T extends string | number>({ value, options, onChange, label }: { value: T; options: [T, string][]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-xl border border-line bg-white p-0.5 shadow-sm">
      {options.map(([v, text]) => (
        <button key={String(v)} type="button" aria-pressed={v === value} onClick={() => onChange(v)} className={cx('min-h-10 rounded-[10px] px-3 py-1.5 text-sm font-semibold transition md:min-h-0', v === value ? 'bg-night text-white shadow' : 'text-slate-600 hover:bg-slate-100')}>
          {text}
        </button>
      ))}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-dashed border-line bg-slate-50/60 px-4 py-6 text-center text-sm text-slate-500">{children}</div>;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx('animate-pulse rounded-2xl bg-slate-200/70', className)} />;
}

/** «12.11» из «2026-11-12». */
export const shortDay = (d: string) => `${d.slice(8, 10)}.${d.slice(5, 7)}`;
export const fmt = (n: number) => n.toLocaleString('ru-RU');
