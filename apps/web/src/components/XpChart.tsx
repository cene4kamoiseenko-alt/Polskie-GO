/** Стовпчикова діаграма XP за днями (одна серія, без легенди; підказка при дотику). */
import { useState } from 'react';

type Day = { day: string; xp: number; minutes: number };

export function XpChart({ days, unit }: { days: Day[]; unit: string }) {
  const [active, setActive] = useState<number | null>(null);
  const W = 320;
  const H = 120;
  const max = Math.max(10, ...days.map((d) => d.xp));
  const n = days.length;
  const gap = n > 40 ? 1 : 2;
  const bw = Math.max(2, (W - gap * (n - 1)) / n);
  const a = active !== null ? days[active] : null;
  return (
    <div className="relative">
      <div className="mb-1 h-5 text-center text-xs font-black">
        {a ? `${new Date(a.day).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}: ${a.xp} ${unit} · ${a.minutes} min` : ''}
      </div>
      <svg viewBox={`0 0 ${W} ${H + 2}`} className="w-full" role="img" aria-label={`XP: ${days.map((d) => d.xp).join(', ')}`}>
        {[0.5, 1].map((f) => (
          <line key={f} x1="0" x2={W} y1={H - H * f} y2={H - H * f} stroke="var(--border)" strokeWidth="1" strokeDasharray="3 4" />
        ))}
        <line x1="0" x2={W} y1={H} y2={H} stroke="var(--border)" strokeWidth="1.5" />
        {days.map((d, i) => {
          const h = d.xp ? Math.max(4, (d.xp / max) * (H - 6)) : 0;
          const x = i * (bw + gap);
          const r = Math.min(4, bw / 2);
          return (
            <g key={d.day} onPointerEnter={() => setActive(i)} onClick={() => setActive(i)}>
              {/* Ціль дотику ширша й вища за стовпчик */}
              <rect x={x - gap / 2} y={0} width={bw + gap} height={H} fill="transparent" />
              {h > 0 && (
                <path
                  d={`M${x},${H} L${x},${H - h + r} Q${x},${H - h} ${x + r},${H - h} L${x + bw - r},${H - h} Q${x + bw},${H - h} ${x + bw},${H - h + r} L${x + bw},${H} Z`}
                  fill={active === i ? 'var(--color-brand-dark)' : 'var(--color-brand)'}
                />
              )}
            </g>
          );
        })}
      </svg>
      <div className="muted mt-1 flex justify-between text-[10px] font-bold">
        <span>{new Date(days[0]?.day ?? Date.now()).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
        <span>max {max} {unit}</span>
        <span>{new Date(days[n - 1]?.day ?? Date.now()).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
      </div>
    </div>
  );
}
