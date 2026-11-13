/**
 * Графики админки на чистом SVG (без библиотек — админка маленькая, лишние килобайты ни к чему).
 * Столбики по дням с подсказкой при наведении, стопки (напоминания), воронка и горизонтальные полосы (источники, город после теста).
 */
import { useState, type KeyboardEvent, type ReactNode } from 'react';
import { cx, fmt, shortDay } from './ui';

const W = 640;
const H = 170;
const PAD = { l: 34, r: 8, t: 10, b: 22 };

function niceMax(v: number) {
  if (v <= 4) return Math.max(1, v);
  const p = 10 ** Math.floor(Math.log10(v));
  return Math.ceil(v / p) * p;
}

type Series = { label: string; color: string; values: number[] };

/** Прямоугольник со скруглёнными верхними углами: «данные» закругляются, основание остаётся прямым (навык dataviz: rounded data-end, square baseline). */
function topRounded(x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.max(0, Math.min(r, w / 2, h));
  return `M${x},${y + h}V${y + rr}Q${x},${y} ${x + rr},${y}H${x + w - rr}Q${x + w},${y} ${x + w},${y + rr}V${y + h}Z`;
}

const AXIS = '#64748b'; // подписи осей — контраст 4.7:1 на белом (slate-400 давал 2.9:1)

/**
 * Столбики по дням; несколько рядов — стопкой (между частями зазор 2 px). Пустые дни — ноль, а не пропуск.
 * Наведение и стрелки ←/→ (график в фокусе) показывают значения дня в строке над графиком; под графиком — таблица по дням.
 */
export function DayBars({ days, series, unit, label }: { days: string[]; series: Series[]; unit?: string; label: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const totals = days.map((_, i) => series.reduce((s, x) => s + (x.values[i] ?? 0), 0));
  const max = niceMax(Math.max(0, ...totals));
  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;
  const step = iw / days.length;
  const bw = Math.max(2, Math.min(28, step * 0.68));
  const y = (v: number) => PAD.t + ih - (v / max) * ih;
  const ticks = [0, max / 2, max];
  const labelAt = new Set([0, Math.floor((days.length - 1) / 2), days.length - 1]);
  const sum = totals.reduce((a, b) => a + b, 0);
  const shown = hover ?? days.length - 1;
  const GAP = 2;
  const onKey = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Home' && e.key !== 'End') return;
    e.preventDefault();
    const cur = hover ?? days.length - 1;
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? days.length - 1 : cur + (e.key === 'ArrowLeft' ? -1 : 1);
    setHover(Math.max(0, Math.min(days.length - 1, next)));
  };
  return (
    <figure className="m-0">
      <div className="mb-2 flex min-h-[20px] flex-wrap items-center justify-between gap-2 text-xs text-slate-500" aria-live="polite">
        <span>
          <b className="text-night">{shortDay(days[shown])}</b>:{' '}
          {series.length > 1 ? series.map((s) => `${s.label} ${fmt(s.values[shown] ?? 0)}`).join(' · ') : `${fmt(totals[shown])}${unit ? ` ${unit}` : ''}`}
        </span>
        <span>
          всего за период <b className="text-night">{fmt(sum)}</b>
        </span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block h-auto w-full rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-sky"
        role="img"
        tabIndex={0}
        aria-label={`${label}: всего ${sum} за ${days.length} дн. Стрелки влево и вправо — значения по дням; ниже есть таблица.`}
        onMouseLeave={() => setHover(null)}
        onKeyDown={onKey}
        onBlur={() => setHover(null)}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} stroke="#e6eaf2" strokeDasharray={t ? '3 4' : undefined} />
            <text x={PAD.l - 6} y={y(t) + 4} textAnchor="end" fontSize="10" fill={AXIS}>
              {Number.isInteger(t) ? fmt(t) : t.toFixed(1)}
            </text>
          </g>
        ))}
        {days.map((d, i) => {
          const x = PAD.l + step * i + (step - bw) / 2;
          let base = PAD.t + ih; // нижний край следующей части стопки
          const parts = series.map((s) => ({ s, v: s.values[i] ?? 0 })).filter((p) => p.v > 0);
          return (
            <g key={d} onMouseEnter={() => setHover(i)} onTouchStart={() => setHover(i)}>
              <rect x={PAD.l + step * i} y={PAD.t} width={step} height={ih} fill={hover === i ? '#f1f5f9' : 'transparent'} />
              {parts.map(({ s, v }, k) => {
                const h = Math.max(1.5, (v / max) * ih);
                const top = base - h;
                const last = k === parts.length - 1;
                const node = last ? (
                  <path key={s.label} d={topRounded(x, top, bw, h, Math.min(4, bw / 3))} fill={s.color} />
                ) : (
                  <rect key={s.label} x={x} y={top + GAP / 2} width={bw} height={Math.max(0.5, h - GAP / 2)} fill={s.color} />
                );
                base = top - (last ? 0 : GAP / 2);
                return node;
              })}
              {labelAt.has(i) && (
                <text x={PAD.l + step * i + step / 2} y={H - 6} textAnchor={i === 0 ? 'start' : i === days.length - 1 ? 'end' : 'middle'} fontSize="10" fill={AXIS}>
                  {shortDay(d)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {series.length > 1 && (
        <figcaption className="mt-2 flex flex-wrap gap-3 text-xs text-slate-600">
          {series.map((s) => (
            <span key={s.label} className="inline-flex items-center gap-1.5">
              <i className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} /> {s.label}
            </span>
          ))}
        </figcaption>
      )}
      <details className="mt-2 text-xs">
        <summary className="cursor-pointer font-semibold text-slate-500 hover:text-night">Таблица по дням</summary>
        <div className="mt-2 max-h-56 overflow-auto rounded-lg border border-line">
          <table className="w-full">
            <thead>
              <tr>
                <th className="th">День</th>
                {series.map((s) => (
                  <th key={s.label} className="th text-right">{s.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((d, i) => (
                <tr key={d} className="border-t border-line">
                  <td className="td !py-1">{shortDay(d)}</td>
                  {series.map((s) => (
                    <td key={s.label} className="td !py-1 text-right tabular-nums">{fmt(s.values[i] ?? 0)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}

/**
 * Воронка. У каждого шага своя база («из скольких»): шаги считаются по разным группам (например, «вернулся завтра» — только у тех,
 * для кого «завтра» уже наступило), поэтому процент к предыдущей строке вводил бы в заблуждение. Ширина полосы — та же доля.
 */
export function Funnel({ steps }: { steps: { label: string; value: number; base?: number; hint?: string }[] }) {
  return (
    <ol className="space-y-2.5" data-funnel>
      {steps.map((s) => {
        const base = s.base ?? s.value;
        const pct = s.base !== undefined && base > 0 ? Math.round((s.value / base) * 100) : null;
        return (
          <li key={s.label}>
            <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
              <span className="font-semibold text-slate-700">
                {s.label}
                {s.hint && <span className="ml-1 text-xs font-normal text-slate-500">{s.hint}</span>}
              </span>
              <span className="whitespace-nowrap">
                <b className="text-night">{fmt(s.value)}</b>
                {pct !== null && (
                  <span className="ml-1.5 text-xs text-slate-500">
                    {pct} % из {fmt(base)}
                  </span>
                )}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-gradient-to-r from-brand to-sky transition-all" style={{ width: `${base > 0 ? Math.max(s.value ? 2 : 0, Math.min(100, (s.value / base) * 100)) : 0}%` }} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Горизонтальные полосы с долей от суммы: источники, город после теста, язык. */
export function Bars({ items, color = '#1d8fd6', empty }: { items: { label: ReactNode; value: number; color?: string; key?: string }[]; color?: string; empty?: ReactNode }) {
  const total = items.reduce((s, x) => s + x.value, 0);
  if (!total) return <p className="text-sm text-slate-500">{empty ?? 'Пока нет данных'}</p>;
  const max = Math.max(...items.map((x) => x.value));
  return (
    <ul className="space-y-2">
      {items.map((x, i) => (
        <li key={x.key ?? i} className={cx('grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 text-sm')}>
          <span className="truncate font-medium text-slate-700">{x.label}</span>
          <span className="whitespace-nowrap text-right">
            <b className="text-night">{fmt(x.value)}</b> <span className="text-xs text-slate-500">{Math.round((x.value / total) * 100)} %</span>
          </span>
          <span className="col-span-2 block h-1.5 overflow-hidden rounded-full bg-slate-100">
            <span className="block h-full rounded-full" style={{ width: `${(x.value / max) * 100}%`, background: x.color ?? color }} />
          </span>
        </li>
      ))}
    </ul>
  );
}
