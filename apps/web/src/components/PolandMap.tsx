/**
 * Ілюстрована карта Польщі (SVG). Контур, річки й міста — за реальними координатами
 * (та сама проєкція, що й на сервері: 1000×950).
 */
import { motion, useReducedMotion } from 'framer-motion';
import { memo, useMemo } from 'react';
import type { JourneyCity } from '../lib/types';
import { CITY_LANDMARKS, Cloud, Landmark } from './Scenery';
import { Beaver } from './Beaver';

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

/** Плавний перегін між етапами i → i+1 (Catmull-Rom через сусідні міста). */
function segment(list: JourneyCity[], i: number) {
  const p0 = list[Math.max(0, i - 1)];
  const p1 = list[i];
  const p2 = list[i + 1];
  const p3 = list[Math.min(list.length - 1, i + 2)];
  const k = 6;
  const c1x = p1.mapX + (p2.mapX - p0.mapX) / k;
  const c1y = p1.mapY + (p2.mapY - p0.mapY) / k;
  const c2x = p2.mapX - (p3.mapX - p1.mapX) / k;
  const c2y = p2.mapY - (p3.mapY - p1.mapY) / k;
  return `M${p1.mapX},${p1.mapY} C${c1x},${c1y} ${c2x},${c2y} ${p2.mapX},${p2.mapY}`;
}

type Props = {
  cities: JourneyCity[];
  currentCityId: string | null;
  onCityClick?: (c: JourneyCity) => void;
  compact?: boolean;
  travel?: { from: JourneyCity; to: JourneyCity } | null;
  /** Підпис під поточним містом («Ти тут»). */
  hereLabel?: string;
  /** Підпис для міст без уроків. */
  soonLabel?: string;
  /** Підсвітити міста одного рівня (інші приглушені). */
  level?: string | null;
};

export const PolandMap = memo(function PolandMap({ cities, currentCityId, onCityClick, compact, travel, hereLabel, soonLabel, level }: Props) {
  const reduce = useReducedMotion();
  const outline = useMemo(() => path(OUTLINE, true), []);
  const sorted = useMemo(() => [...cities].sort((a, b) => a.order - b.order), [cities]);
  const current = cities.find((c) => c.id === currentCityId);
  const dim = (c: JourneyCity) => !!level && c.cefr !== level;

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
      {!compact && (
        <g>
          <Cloud x={820} y={120} s={1.6} opacity={0.8} />
          <Cloud x={120} y={880} s={1.4} opacity={0.75} />
          <g transform="translate(880 330)">
            <path d="M0 -40 C 22 -40, 28 -14, 10 4 L4 14 L-4 14 L-10 4 C -28 -14, -22 -40, 0 -40 Z" fill="#F45159" stroke="#5A3A22" strokeWidth="2.5" />
            <path d="M0 -40 C 8 -30, 8 -6, 4 14 M0 -40 C -8 -30, -8 -6, -4 14" stroke="#FFBD42" strokeWidth="5" fill="none" />
            <rect x="-6" y="20" width="12" height="9" rx="2" fill="#B07A4A" stroke="#5A3A22" strokeWidth="2" />
            <path d="M-4 14 L-5 20 M4 14 L5 20" stroke="#5A3A22" strokeWidth="1.5" />
          </g>
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

      {/* Маршрут через усі етапи: пройдене — суцільна коралова, поточний перегін — коралова пунктирна, далі — світла пунктирна */}
      {sorted.slice(1).map((c, i) => {
        const a = sorted[i];
        const d = segment(sorted, i);
        const done = a.completed;
        const next = a.unlocked && !a.completed;
        return (
          <g key={c.id}>
            <path d={d} fill="none" stroke="#F6E7C8" strokeWidth="18" strokeLinecap="round" opacity={dim(a) && dim(c) ? 0.35 : 0.95} />
            <path
              d={d}
              fill="none"
              stroke={done ? '#F45159' : next ? '#F45159' : '#FFFFFF'}
              strokeWidth={done ? 7 : 6}
              strokeDasharray={done ? undefined : next ? '2 13' : '1 14'}
              strokeLinecap="round"
              opacity={dim(a) && dim(c) ? 0.35 : 1}
            />
          </g>
        );
      })}

      {/* Міста з пам'ятками */}
      {sorted.map((c) => {
        const isCurrent = c.id === currentCityId && !travel;
        const state = !c.unlocked ? 'locked' : c.perfect ? 'perfect' : c.completed ? 'completed' : c.lessonsDone > 0 ? 'progress' : 'available';
        const s = compact ? 0.8 : 1;
        return (
          <g
            key={c.id}
            opacity={dim(c) ? 0.35 : 1}
            transform={`translate(${c.mapX} ${c.mapY}) scale(${s})`}
            onClick={() => onCityClick?.(c)}
            style={{ cursor: onCityClick ? 'pointer' : 'default' }}
            role={onCityClick ? 'button' : undefined}
            aria-label={c.namePl}
          >
            {isCurrent && !reduce && (
              <motion.ellipse rx="44" ry="14" cy="2" fill="none" stroke="#F45159" strokeWidth="4" style={{ transformBox: 'fill-box', transformOrigin: 'center' }} animate={{ scale: [1, 1.5], opacity: [0.9, 0] }} transition={{ repeat: Infinity, duration: 1.6 }} />
            )}
            <g transform="scale(1.15)">
              <Landmark kind={CITY_LANDMARKS[c.slug] ?? 'townhall'} color={c.color} muted={state === 'locked'} />
            </g>
            {/* кільце прогресу для міста в процесі */}
            {state === 'progress' && (
              <g transform="translate(40 -70)">
                <circle r="17" fill="#fff" stroke="#F0E7D8" strokeWidth="4" />
                <circle r="17" fill="none" stroke="#35C88A" strokeWidth="4" strokeDasharray={`${(c.progress / 100) * 107} 107`} transform="rotate(-90)" strokeLinecap="round" />
                <text textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="900" fontFamily="Nunito" fill="#22364A">{c.progress}%</text>
              </g>
            )}
            {(state === 'completed' || state === 'perfect') && (
              <g transform="translate(40 -70)">
                <circle r="17" fill={state === 'perfect' ? '#FFBD42' : '#35C88A'} stroke="#fff" strokeWidth="4" />
                {state === 'perfect' ? (
                  <path d="M0 -9 L2.6 -3 L9 -2.6 L4 1.6 L5.6 8 L0 4.6 L-5.6 8 L-4 1.6 L-9 -2.6 L-2.6 -3 Z" fill="#fff" />
                ) : (
                  <path d="M-7 0 L-2 5 L8 -6" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" />
                )}
              </g>
            )}
            {!compact && (() => {
              // Довгі назви скорочуємо на карті (повна назва — у картці міста).
              const label = c.namePl.length > 13 ? c.namePl.split(' ')[0] : c.namePl;
              const locked = state === 'locked';
              const w = label.length * 14 + 50 + (locked ? 22 : 0);
              const sub = isCurrent && hereLabel ? hereLabel : !c.hasContent && soonLabel ? soonLabel : null;
              const h = sub ? 54 : 36;
              const fill = isCurrent ? '#F45159' : c.completed ? '#35C88A' : '#fff';
              const ink = isCurrent || c.completed ? '#fff' : locked ? '#7A8B99' : '#22364A';
              return (
                <g transform="translate(0 28)">
                  <rect x={-w / 2} y="-18" width={w} height={h} rx="18" fill={fill} stroke={isCurrent || c.completed ? '#fff' : '#E6DCCB'} strokeWidth="3" />
                  {/* номер етапу маршруту */}
                  <circle cx={-w / 2 + 20} cy="0" r="12" fill={isCurrent || c.completed ? '#fff' : locked ? '#E9E1D3' : '#22364A'} />
                  <text x={-w / 2 + 20} y="1" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="900" fontFamily="Nunito" fill={isCurrent ? '#F45159' : c.completed ? '#1F9A67' : locked ? '#8D98A5' : '#fff'}>
                    {c.order}
                  </text>
                  {locked && (
                    <g transform={`translate(${-w / 2 + 44} 0)`}>
                      <rect x="-7" y="-2" width="14" height="11" rx="2.5" fill="#8D98A5" />
                      <path d="M-4 -2 L-4 -6 Q0 -11 4 -6 L4 -2" stroke="#8D98A5" strokeWidth="2.5" fill="none" />
                    </g>
                  )}
                  <text x={(locked ? 22 : 12) + 2} textAnchor="middle" dominantBaseline="central" fontSize="21" fontWeight="900" fontFamily="Nunito" fill={ink}>
                    {label}
                  </text>
                  {sub && (
                    <text x="12" y="21" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="800" fontFamily="Nunito" fill={isCurrent ? '#FFE3E3' : '#9AA6B2'}>
                      {sub}
                    </text>
                  )}
                </g>
              );
            })()}
          </g>
        );
      })}

      {/* Бобер на карті */}
      {current && !travel && <BeaverPin x={current.mapX - 46} y={current.mapY - (compact ? 90 : 112)} />}
      {travel && (
        <motion.g
          initial={{ x: travel.from.mapX - 46, y: travel.from.mapY - 112 }}
          animate={{ x: travel.to.mapX - 46, y: travel.to.mapY - 112 }}
          transition={{ duration: reduce ? 0 : 2.6, ease: 'easeInOut' }}
        >
          <BeaverPin x={0} y={0} vehicle />
        </motion.g>
      )}
    </svg>
  );
});

/** Бобер на поточному етапі: стоїть на кораловій «платформі» над містом. */
function BeaverPin({ x, y, vehicle }: { x: number; y: number; vehicle?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <g transform={`translate(${x - 4} ${y - 18})`} style={{ pointerEvents: 'none' }}>
      <motion.g animate={reduce ? undefined : { y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}>
        <ellipse cx="50" cy="118" rx="38" ry="11" fill="#F45159" stroke="#fff" strokeWidth="4" />
        <ellipse cx="50" cy="114" rx="26" ry="6" fill="#FF7B80" />
        <g transform="translate(6 0)">
          <Beaver mood={vehicle ? 'travel' : 'wave'} size={88} animate={false} vectorOnly />
        </g>
      </motion.g>
    </g>
  );
}
