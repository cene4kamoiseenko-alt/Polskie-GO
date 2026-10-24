/**
 * Ілюстрована карта Польщі (SVG). Контур, річки й міста — за реальними координатами
 * (та сама проєкція, що й на сервері: 1000×950).
 */
import { motion, useReducedMotion } from 'framer-motion';
import { memo, useMemo } from 'react';
import type { JourneyCity } from '../lib/types';

const W = 1000;
const H = 950;
const P = (lon: number, lat: number): [number, number] => [((lon - 13.9) / 10.5) * W, ((55.05 - lat) / 6.15) * H];

const OUTLINE: [number, number][] = [
  [14.22, 53.93], [14.8, 54.05], [15.58, 54.18], [16.4, 54.43], [16.85, 54.59], [17.55, 54.76], [18.33, 54.83],
  [18.8, 54.62], [18.55, 54.5], [18.62, 54.42], [18.95, 54.36], [19.65, 54.45], [20.4, 54.38], [21.3, 54.33],
  [22.3, 54.35], [22.79, 54.36], [23.33, 54.24], [23.5, 54.04], [23.85, 53.67], [23.92, 53.2], [23.6, 52.75],
  [23.2, 52.35], [23.65, 52.08], [23.55, 51.7], [23.65, 51.3], [24.11, 50.86], [23.98, 50.42], [23.25, 50.1],
  [22.68, 49.57], [22.88, 49.05], [22.0, 49.22], [21.4, 49.42], [20.9, 49.33], [20.35, 49.4], [19.95, 49.2],
  [19.47, 49.6], [18.95, 49.5], [18.6, 49.92], [18.0, 50.0], [17.65, 50.27], [17.2, 50.4], [16.9, 50.22],
  [16.7, 50.12], [16.3, 50.66], [15.8, 50.75], [15.3, 50.8], [14.82, 50.87], [15.0, 51.25], [14.73, 51.55],
  [14.6, 51.85], [14.75, 52.1], [14.53, 52.4], [14.15, 52.85], [14.45, 53.25], [14.25, 53.7],
];
const VISTULA: [number, number][] = [[18.9, 49.65], [19.4, 50.0], [19.94, 50.06], [20.8, 50.25], [21.7, 50.68], [21.95, 51.4], [21.4, 51.95], [21.03, 52.23], [20.3, 52.4], [19.7, 52.55], [18.6, 53.01], [18.45, 53.4], [18.75, 53.48], [18.78, 54.09], [18.9, 54.35]];
const ODRA: [number, number][] = [[18.2, 49.95], [17.93, 50.67], [17.04, 51.11], [16.1, 51.66], [15.5, 51.95], [14.9, 52.1], [14.55, 52.35], [14.62, 52.58], [14.4, 52.95], [14.55, 53.43], [14.3, 53.75]];
const LAKES: [number, number, number][] = [[21.5, 53.8, 14], [21.75, 53.95, 10], [21.2, 53.62, 9], [22.0, 53.75, 8]];
const TREES: [number, number][] = [[23.7, 52.75], [23.4, 53.0], [16.0, 53.3], [15.4, 53.0], [17.6, 53.6], [16.4, 52.2], [22.6, 50.6], [20.2, 51.2], [15.6, 51.2], [21.0, 53.2], [22.6, 53.4], [17.3, 52.9], [19.0, 51.0]];
const MOUNTAINS: [number, number, number][] = [[19.85, 49.45, 1.3], [20.15, 49.42, 1], [19.55, 49.6, 0.8], [22.5, 49.2, 0.9], [22.2, 49.3, 0.7], [16.6, 50.55, 0.8], [15.8, 50.85, 0.9], [21.1, 49.55, 0.7]];

const path = (pts: [number, number][], close = false) => {
  const xy = pts.map(([lon, lat]) => P(lon, lat));
  // Згладжування: квадратичні криві через середини відрізків.
  let d = `M${xy[0][0]},${xy[0][1]}`;
  for (let i = 1; i < xy.length - 1; i++) {
    const [x, y] = xy[i];
    const [nx, ny] = xy[i + 1];
    d += ` Q${x},${y} ${(x + nx) / 2},${(y + ny) / 2}`;
  }
  const last = xy[xy.length - 1];
  d += ` L${last[0]},${last[1]}`;
  return close ? d + ' Z' : d;
};

type Props = {
  cities: JourneyCity[];
  currentCityId: string | null;
  onCityClick?: (c: JourneyCity) => void;
  compact?: boolean;
  travel?: { from: JourneyCity; to: JourneyCity } | null;
  /** Підпис під поточним містом («Ти тут»). */
  hereLabel?: string;
};

export const PolandMap = memo(function PolandMap({ cities, currentCityId, onCityClick, compact, travel, hereLabel }: Props) {
  const reduce = useReducedMotion();
  const outline = useMemo(() => path(OUTLINE, true), []);
  const sorted = useMemo(() => [...cities].sort((a, b) => a.order - b.order), [cities]);
  const current = cities.find((c) => c.id === currentCityId);

  return (
    <svg viewBox={`-20 -60 ${W + 40} ${H + 90}`} className="block h-auto w-full" role="img" aria-label="Mapa Polski">
      <defs>
        <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--map-sea)" />
          <stop offset="1" stopColor="var(--map-sea)" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id="land" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--map-land)" />
          <stop offset="1" stopColor="var(--map-land-2)" />
        </linearGradient>
        <filter id="soft" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#1d4b2c" floodOpacity="0.25" />
        </filter>
      </defs>
      {/* Балтійське море */}
      <rect x="-20" y="-60" width={W + 40} height="210" fill="url(#sea)" rx="30" />
      {!compact && (
        <g fill="#fff" opacity="0.7" fontSize="22" fontWeight="900" fontFamily="Nunito">
          <text x="120" y="20">Morze Bałtyckie</text>
          <text x="620" y="-10" fontSize="34">⛵</text>
          <path d="M80 60 q15 -10 30 0 t30 0 M480 40 q15 -10 30 0 t30 0 M760 70 q15 -10 30 0 t30 0" stroke="#fff" strokeWidth="4" fill="none" />
        </g>
      )}
      {/* Суша */}
      <path d={outline} fill="url(#land)" stroke="#fff" strokeWidth="10" strokeLinejoin="round" filter="url(#soft)" />
      <path d={outline} fill="none" stroke="#2FA56C" strokeWidth="3" strokeLinejoin="round" opacity="0.5" />
      {/* Річки та озера */}
      <path d={path(VISTULA)} fill="none" stroke="#69C7F4" strokeWidth="7" strokeLinecap="round" opacity="0.9" />
      <path d={path(ODRA)} fill="none" stroke="#69C7F4" strokeWidth="6" strokeLinecap="round" opacity="0.9" />
      {LAKES.map(([lon, lat, r]) => {
        const [x, y] = P(lon, lat);
        return <ellipse key={`${lon}${lat}`} cx={x} cy={y} rx={r * 1.6} ry={r} fill="#69C7F4" opacity="0.9" />;
      })}
      {/* Гори */}
      {MOUNTAINS.map(([lon, lat, s]) => {
        const [x, y] = P(lon, lat);
        return (
          <g key={`${lon}${lat}`} transform={`translate(${x} ${y}) scale(${s})`}>
            <path d="M-30 18 L0 -26 L30 18 Z" fill="#8A9BA8" />
            <path d="M-10 -11 L0 -26 L10 -11 L4 -7 L0 -12 L-4 -7 Z" fill="#fff" />
          </g>
        );
      })}
      {/* Ліси */}
      {!compact &&
        TREES.map(([lon, lat]) => {
          const [x, y] = P(lon, lat);
          return (
            <g key={`${lon}${lat}`} transform={`translate(${x} ${y})`} opacity="0.85">
              <path d="M0 -22 L14 4 L-14 4 Z" fill="#2FA56C" />
              <path d="M0 -12 L16 14 L-16 14 Z" fill="#279058" />
              <rect x="-3" y="14" width="6" height="8" fill="#8A552D" />
            </g>
          );
        })}

      {/* Маршрут подорожі */}
      {sorted.slice(1).map((c, i) => {
        const a = sorted[i];
        const done = a.completed;
        // Показуємо лише пройдений шлях і наступний відрізок — без «павутини» по всій країні.
        if (!a.unlocked) return null;
        return (
          <line
            key={c.id}
            x1={a.mapX}
            y1={a.mapY}
            x2={c.mapX}
            y2={c.mapY}
            stroke={done ? '#E5484D' : '#ffffff'}
            strokeWidth={done ? 7 : 5}
            strokeDasharray={done ? undefined : '2 14'}
            strokeLinecap="round"
            opacity={done ? 0.9 : 0.85}
          />
        );
      })}

      {/* Міста */}
      {sorted.map((c) => {
        const isCurrent = c.id === currentCityId && !travel;
        const r = compact ? 30 : 36;
        return (
          <g
            key={c.id}
            transform={`translate(${c.mapX} ${c.mapY})`}
            onClick={() => onCityClick?.(c)}
            style={{ cursor: onCityClick ? 'pointer' : 'default' }}
            role={onCityClick ? 'button' : undefined}
            aria-label={c.namePl}
          >
            {isCurrent && !reduce && (
              <motion.circle r={r} fill="none" stroke="#E5484D" strokeWidth="5" style={{ transformBox: 'fill-box', transformOrigin: 'center' }} animate={{ scale: [1, 1.6], opacity: [0.8, 0] }} transition={{ repeat: Infinity, duration: 1.6 }} />
            )}
            <circle r={r + 4} fill="#fff" />
            <circle r={r} fill={c.unlocked ? c.color : '#C9D3DA'} />
            <text textAnchor="middle" dominantBaseline="central" fontSize={compact ? 32 : 38} style={{ filter: c.unlocked ? undefined : 'grayscale(1)', opacity: c.unlocked ? 1 : 0.6 }}>
              {c.emoji}
            </text>
            {c.completed && (
              <g transform={`translate(${r - 4} ${-r + 4})`}>
                <circle r="13" fill="#45C486" stroke="#fff" strokeWidth="3" />
                <path d="M-6 0 L-1 5 L7 -5" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              </g>
            )}
            {!compact && (() => {
              // Підпис міста — «таблетка»; у закритих міст — замок, у поточного — червона з другим рядком.
              const label = c.unlocked ? c.namePl : `🔒 ${c.namePl}`;
              const w = label.length * 19 + 28;
              const h = isCurrent && hereLabel ? 64 : 40;
              return (
                <g transform={`translate(0 ${r + 28})`}>
                  <rect x={-w / 2} y="-20" width={w} height={h} rx="20" fill={isCurrent ? '#E5484D' : 'var(--bg-elev)'} stroke={isCurrent ? '#fff' : 'var(--border)'} strokeWidth="3" />
                  <text textAnchor="middle" dominantBaseline="central" fontSize="28" fontWeight="900" fontFamily="Nunito" fill={isCurrent ? '#fff' : c.unlocked ? 'var(--text)' : 'var(--text-muted)'}>
                    {label}
                  </text>
                  {isCurrent && hereLabel && (
                    <text y="26" textAnchor="middle" dominantBaseline="central" fontSize="20" fontWeight="800" fontFamily="Nunito" fill="#FFE3E3">
                      {hereLabel}
                    </text>
                  )}
                </g>
              );
            })()}
            {c.unlocked && !c.completed && !compact && c.hasContent && (
              <g transform={`translate(${-r + 2} ${-r + 2})`}>
                <circle r="14" fill="#FFC857" stroke="#fff" strokeWidth="3" />
                <text textAnchor="middle" dominantBaseline="central" fontSize="11" fontWeight="900" fill="#5a3d00">
                  {c.progress}%
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* Бобер на карті */}
      {current && !travel && <BeaverPin x={current.mapX} y={current.mapY - (compact ? 60 : 70)} />}
      {travel && (
        <motion.g
          initial={{ x: travel.from.mapX, y: travel.from.mapY - 70 }}
          animate={{ x: travel.to.mapX, y: travel.to.mapY - 70 }}
          transition={{ duration: reduce ? 0 : 2.6, ease: 'easeInOut' }}
        >
          <BeaverPin x={0} y={0} vehicle />
        </motion.g>
      )}
    </svg>
  );
});

function BeaverPin({ x, y, vehicle }: { x: number; y: number; vehicle?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <g transform={`translate(${x} ${y})`}>
    <motion.g animate={reduce ? undefined : { y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 1.2 }}>
      <path d="M0 40 L-12 18 L12 18 Z" fill="#E5484D" />
      <circle r="30" fill="#fff" stroke="#E5484D" strokeWidth="5" />
      <circle cx="-17" cy="-17" r="8" fill="#A86B3C" />
      <circle cx="17" cy="-17" r="8" fill="#A86B3C" />
      <circle r="22" fill="#A86B3C" />
      <ellipse cy="8" rx="13" ry="9" fill="#F3D9B5" />
      <circle cx="-8" cy="-4" r="4" fill="#2B1A10" />
      <circle cx="8" cy="-4" r="4" fill="#2B1A10" />
      <ellipse cy="3" rx="5" ry="3.5" fill="#3B2416" />
      <rect x="-3.5" y="9" width="7" height="6" rx="1.5" fill="#fff" />
      {vehicle && <text x="26" y="34" fontSize="34">🚆</text>}
    </motion.g>
    </g>
  );
}
