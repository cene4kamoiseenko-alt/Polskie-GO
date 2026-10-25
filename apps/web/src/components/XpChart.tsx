/**
 * Стовпчикова діаграма XP за днями (референс «Статистика»): шкала, підписи дат,
 * найкращий день виділено зеленим з плашкою «max», підказка при дотику. Лише реальні дані.
 */
import { useState } from 'react';

type Day = { day: string; xp: number; minutes: number };

const niceMax = (v: number) => {
  const steps = [20, 40, 60, 100, 120, 200, 300, 400, 600, 1000, 1500, 2000, 3000, 5000];
  return steps.find((s) => s >= v) ?? Math.ceil(v / 1000) * 1000;
};

export function XpChart({ days, unit }: { days: Day[]; unit: string }) {
  const [active, setActive] = useState<number | null>(null);
  const W = 330;
  const H = 128;
  const L = 26; // місце для шкали
  const T = 22; // місце для плашки max
  const n = days.length;
  const peak = Math.max(0, ...days.map((d) => d.xp));
  const top = niceMax(Math.max(20, peak));
  const peakIdx = peak > 0 ? days.findIndex((d) => d.xp === peak) : -1;
  // Кожен день має однаковий слот у межах viewBox — навіть 90 стовпчиків повністю вміщуються.
  const slot = (W - L) / Math.max(1, n);
  const gap = n > 40 ? slot * 0.25 : n > 10 ? Math.min(3, slot * 0.3) : Math.min(12, slot * 0.35);
  const bw = slot - gap;
  const y = (v: number) => T + (H - T) * (1 - v / top);
  const a = active !== null ? days[active] : null;
  const fmt = (d: string) => new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  const labelEvery = n <= 7 ? 1 : n <= 31 ? 5 : 15;
  return (
    <div className="relative">
      <div className="mb-1 h-5 text-center text-xs font-black text-sky">{a ? `${fmt(a.day)}: ${a.xp} ${unit} · ${a.minutes} min` : ''}</div>
      <svg viewBox={`0 0 ${W} ${H + 18}`} className="w-full" role="img" aria-label={`XP: ${days.map((d) => d.xp).join(', ')}`}>
        <defs>
          <linearGradient id="xpc-bar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4FC3FF" /><stop offset="1" stopColor="#1E6FE0" /></linearGradient>
          <linearGradient id="xpc-max" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5BF0B8" /><stop offset="1" stopColor="#13A874" /></linearGradient>
        </defs>
        {[0, 0.5, 1].map((f) => (
          <g key={f}>
            <line x1={L} x2={W} y1={y(top * f)} y2={y(top * f)} stroke="var(--border)" strokeWidth="1" strokeDasharray={f === 0 ? undefined : '3 4'} />
            <text x={L - 5} y={y(top * f) + 3.5} textAnchor="end" fontSize="9.5" fontWeight="800" fill="var(--text-muted)">{Math.round(top * f)}</text>
          </g>
        ))}
        {days.map((d, i) => {
          const h = d.xp ? Math.max(4, H - y(d.xp)) : 0;
          const x = L + i * slot + gap / 2;
          const r = Math.min(4, bw / 2);
          const isMax = i === peakIdx;
          return (
            <g key={d.day} onPointerEnter={() => setActive(i)} onClick={() => setActive(i)}>
              <rect x={x - gap / 2} y={0} width={bw + gap} height={H} fill="transparent" />
              {h > 0 && (
                <path
                  d={`M${x},${H} L${x},${H - h + r} Q${x},${H - h} ${x + r},${H - h} L${x + bw - r},${H - h} Q${x + bw},${H - h} ${x + bw},${H - h + r} L${x + bw},${H} Z`}
                  fill={isMax ? 'url(#xpc-max)' : 'url(#xpc-bar)'}
                  opacity={active === null || active === i ? 1 : 0.6}
                  style={isMax ? { filter: 'drop-shadow(0 0 6px rgba(37,215,155,0.6))' } : undefined}
                />
              )}
              {i % labelEvery === 0 && (
                <text x={Math.min(W - 16, Math.max(L + 14, x + bw / 2))} y={H + 13} textAnchor="middle" fontSize="9" fontWeight="800" fill="var(--text-muted)">{fmt(d.day)}</text>
              )}
            </g>
          );
        })}
        {peakIdx >= 0 && (
          <g transform={`translate(${Math.min(W - 34, Math.max(L + 34, L + peakIdx * slot + slot / 2))} ${Math.max(10, y(peak) - 12)})`}>
            <rect x="-34" y="-10" width="68" height="18" rx="9" fill="#0F3B3A" stroke="#25D79B" strokeWidth="1.4" />
            <text x="0" y="3" textAnchor="middle" fontSize="10" fontWeight="900" fill="#5BF0B8">max {peak} {unit}</text>
          </g>
        )}
      </svg>
    </div>
  );
}
