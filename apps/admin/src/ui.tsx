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
  return <div className="rounded-xl border border-dashed border-line bg-slate-50/60 px-4 py-6 text-center text-sm text-slate-600">{children}</div>;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx('animate-pulse rounded-2xl bg-slate-200/70', className)} />;
}

/** «12.11» из «2026-11-12». */
export const shortDay = (d: string) => `${d.slice(8, 10)}.${d.slice(5, 7)}`;
export const fmt = (n: number) => n.toLocaleString('ru-RU');

/** «5 мин назад», «вчера», дата — для последней активности. */
export function ago(ms: number) {
  const min = Math.round((Date.now() - ms) / 60_000);
  if (min < 1) return 'только что';
  if (min < 60) return `${min} мин назад`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} ч назад`;
  const d = Math.round(h / 24);
  if (d === 1) return 'вчера';
  if (d < 7) return `${d} дн. назад`;
  return new Date(ms).toLocaleDateString('ru');
}

/** Дата и время коротко: «13.11.2026, 14:05». Пусто — «—». */
export const when = (v: string | number | Date | null | undefined) => (v == null || v === '' ? '—' : new Date(v).toLocaleString('ru', { dateStyle: 'short', timeStyle: 'short' }));
const asMs = (v: string | number | Date) => new Date(v).getTime();

/** Время: «5 мин назад» на экране, точная дата — во всплывающей подсказке и для экранного диктора. */
export function Time({ v }: { v: string | number | Date | null | undefined }) {
  if (v == null || v === '') return <span className="text-slate-500">—</span>;
  const ms = asMs(v);
  return (
    <time dateTime={new Date(ms).toISOString()} title={when(ms)} className="whitespace-nowrap">
      {Date.now() - ms < 7 * 86_400_000 ? ago(ms) : when(ms)}
    </time>
  );
}

export type Tone = 'green' | 'gold' | 'red' | 'sky' | 'gray';
export function Badge({ tone = 'gray', children, ...rest }: { tone?: Tone; children: ReactNode; [k: `data-${string}`]: string | undefined }) {
  return (
    <span className={cx('badge', `badge-${tone}`)} {...rest}>
      {children}
    </span>
  );
}

/** Подпись поля над полем ввода (или слева на широком экране) и подсказка под ним. */
export function Field({ label, hint, children, wide }: { label: ReactNode; hint?: ReactNode; children: ReactNode; wide?: boolean }) {
  return (
    <label className={cx('block text-sm', wide && 'md:grid md:grid-cols-[200px_1fr] md:items-start md:gap-4')}>
      <span className={cx('mb-1 block font-semibold text-slate-700', wide && 'md:pt-2')}>{label}</span>
      <span className="block">
        {children}
        {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
      </span>
    </label>
  );
}

export type Col<T> = { key: string; label: ReactNode; render: (row: T) => ReactNode; className?: string; align?: 'right' };

/** Широкая таблица прокручивается вбок внутри карточки; тогда до неё можно дойти клавишей Tab и листать стрелками (WCAG 2.1.1). */
function useScrollable<E extends HTMLElement>() {
  const ref = useRef<E>(null);
  const [scrollable, setScrollable] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setScrollable(el.scrollWidth > el.clientWidth + 1);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => ro.disconnect();
  }, []);
  return { ref, scrollable };
}

/** Таблица в карточке: заголовок колонок, «пусто», загрузка. На телефоне прокручивается по горизонтали внутри карточки. */
export function DataTable<T>({ cols, rows, rowKey, empty = 'Пусто', loading, caption }: { cols: Col<T>[]; rows: T[] | null | undefined; rowKey: (r: T, i: number) => string; empty?: ReactNode; loading?: boolean; caption?: string }) {
  const { ref, scrollable } = useScrollable<HTMLDivElement>();
  return (
    // relative: скрытые подписи колонок (sr-only, position: absolute) остаются внутри прокрутки, а не выталкивают страницу вбок.
    <div ref={ref} className="relative overflow-x-auto" {...(scrollable ? { tabIndex: 0, role: 'region', 'aria-label': `${caption ?? 'Таблица'} — листается вбок` } : {})}>
      <table className="w-full">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c.key} scope="col" className={cx('th', c.align === 'right' && 'text-right')}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && !rows?.length ? (
            <tr data-loading="">
              <td className="td text-slate-500" colSpan={cols.length}>
                Загрузка…
              </td>
            </tr>
          ) : rows?.length ? (
            rows.map((r, i) => (
              <tr key={rowKey(r, i)} className="border-t border-line">
                {cols.map((c) => (
                  <td key={c.key} className={cx('td', c.align === 'right' && 'text-right tabular-nums', c.className)}>
                    {c.render(r)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr data-empty="">
              <td className="td py-6 text-center text-slate-500" colSpan={cols.length}>
                {empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/** Ошибка загрузки страницы с кнопкой «Повторить». */
export function LoadError({ error, retry }: { error: string; retry?: () => void }) {
  return (
    <div role="alert" className="panel flex flex-wrap items-center justify-between gap-3 border-coral/30 bg-coral-soft/50 p-4 text-sm text-[#8f1d2f]">
      <span>Не удалось загрузить: {error}</span>
      {retry && (
        <button className="btn-s" onClick={retry}>
          Повторить
        </button>
      )}
    </div>
  );
}
