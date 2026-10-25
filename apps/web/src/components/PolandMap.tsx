/**
 * Ілюстрована карта Польщі (SVG). Контур, річки й міста — за реальними координатами
 * (та сама проєкція, що й на сервері: 1000×950).
 */
import { animate, motion, useReducedMotion } from '../lib/motion';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import type { JourneyCity } from '../lib/types';
import { CITY_LANDMARKS, Cloud, Landmark } from './Scenery';
import { Beaver } from './Beaver';
import { Stamp } from './Illustrations';

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
/** Детермінований «випадковий» генератор для декору (однаковий при кожному рендері). */
const rand = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
/** Ліси реальних регіонів: Біловезька пуща, Бори Тухольські, Кампінос, Помор'я, Нижня Сілезія, Розточчя, Мазури, Свєнтокшиські. */
const FOREST_AREAS: [number, number, number][] = [[23.75, 52.7, 12], [17.9, 53.65, 12], [20.45, 52.32, 7], [16.4, 53.9, 9], [15.5, 51.55, 10], [23.0, 50.55, 8], [21.6, 53.55, 9], [20.9, 50.95, 8], [18.6, 51.3, 6], [22.6, 51.9, 6], [16.1, 52.6, 7], [19.4, 53.3, 6]];
const TREES: [number, number, number][] = FOREST_AREAS.flatMap(([lon, lat, n], k) => {
  const r = rand(k * 97 + 13);
  return Array.from({ length: n }, () => [lon + (r() - 0.5) * 0.9, lat + (r() - 0.5) * 0.45, r() > 0.45 ? 1 : 0] as [number, number, number]);
}).sort((a, b) => b[1] - a[1]);
/** Гірські пасма вздовж південного кордону: Судети, Бескиди, Татри, Бещади. */
const RANGES: [number, number, number, number, number][] = [
  [15.4, 50.85, 17.0, 50.4, 6], [18.9, 49.65, 19.6, 49.55, 4], [19.7, 49.3, 20.3, 49.25, 5], [20.5, 49.45, 21.6, 49.45, 5], [21.9, 49.35, 22.8, 49.1, 5],
];
const MOUNTAINS: [number, number, number][] = RANGES.flatMap(([lon1, lat1, lon2, lat2, n], k) =>
  Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const big = k === 2 ? 1.35 : 0.85 + ((i * 37) % 5) * 0.08; // Татри — найвищі
    return [lon1 + (lon2 - lon1) * t, lat1 + (lat2 - lat1) * t, big] as [number, number, number];
  }),
);

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
          <stop offset="0" stopColor="#1F6FB0" />
          <stop offset="1" stopColor="#3F9FD8" />
        </linearGradient>
        <linearGradient id="land" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--map-land)" />
          <stop offset="1" stopColor="var(--map-land-2)" />
        </linearGradient>
        <clipPath id="poland">
          <path d={outline} />
        </clipPath>
        <filter id="soft" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#1d4b2c" floodOpacity="0.25" />
        </filter>
      </defs>
      {/* Балтійське море: хвилі й вітрильник */}
      <rect x="-20" y="-60" width={W + 40} height="240" fill="url(#sea)" rx="30" />
      {!compact && (
        <g>
          <text x="110" y="24" fill="#fff" opacity="0.8" fontSize="24" fontWeight="900" fontFamily="Nunito" letterSpacing="1">Morze Bałtyckie</text>
          <g stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.55">
            {[[70, 70], [300, 40], [480, 70], [760, 60], [880, 20], [200, 120]].map(([x, y]) => <path key={x} d={`M${x} ${y} q15 -10 30 0 t30 0`} />)}
          </g>
          <g transform="translate(640 6)" stroke="#5A3A22" strokeWidth="2.5" strokeLinejoin="round">
            <path d="M-34 22 L34 22 L24 38 L-24 38 Z" fill="#C9614A" />
            <path d="M0 -40 L0 22" />
            <path d="M3 -36 L30 14 L3 14 Z" fill="#fff" />
            <path d="M-3 -26 L-26 14 L-3 14 Z" fill="#F6E7C8" />
            <path d="M0 -40 L14 -34 L0 -30" fill="#FF4E5B" />
          </g>
          <g transform="translate(880 330)">
            <path d="M0 -40 C 22 -40, 28 -14, 10 4 L4 14 L-4 14 L-10 4 C -28 -14, -22 -40, 0 -40 Z" fill="#F45159" stroke="#5A3A22" strokeWidth="2.5" />
            <path d="M0 -40 C 8 -30, 8 -6, 4 14 M0 -40 C -8 -30, -8 -6, -4 14" stroke="#FFBD42" strokeWidth="5" fill="none" />
            <rect x="-6" y="20" width="12" height="9" rx="2" fill="#B07A4A" stroke="#5A3A22" strokeWidth="2" />
          </g>
          <Cloud x={820} y={120} s={1.6} opacity={0.8} />
          <Cloud x={120} y={880} s={1.4} opacity={0.75} />
        </g>
      )}
      {/* Суша */}
      <path d={outline} fill="#F3DFA6" stroke="#F3DFA6" strokeWidth="22" strokeLinejoin="round" filter="url(#soft)" />
      <path d={outline} fill="url(#land)" stroke="#fff" strokeWidth="5" strokeLinejoin="round" />
      {/* Рельєф: мʼякі пагорби (світлі) і низини (темні), обрізані контуром країни */}
      <g clipPath="url(#poland)" opacity="0.55">
        {[[260, 300, 170, '#B5E58F'], [620, 520, 210, '#B5E58F'], [420, 700, 150, '#5FAE48'], [760, 300, 160, '#5FAE48'], [200, 620, 140, '#B5E58F'], [560, 820, 170, '#7FC35E']].map(([x, y, r, c]) => (
          <ellipse key={`${x}${y}`} cx={x} cy={y} rx={Number(r) * 1.3} ry={r} fill={String(c)} />
        ))}
      </g>
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
          <g key={`${lon}${lat}`} transform={`translate(${x} ${y}) scale(${s})`} stroke="#5A6B78" strokeWidth="2" strokeLinejoin="round">
            <path d="M-34 18 L0 -30 L34 18 Z" fill="#9AABB8" />
            <path d="M0 -30 L34 18 L6 18 Z" fill="#7D8F9D" stroke="none" />
            <path d="M-12 -13 L0 -30 L12 -13 L5 -9 L0 -15 L-5 -9 Z" fill="#fff" />
          </g>
        );
      })}
      {/* Ліси */}
      {!compact &&
        TREES.map(([lon, lat, kind]) => {
          const [x, y] = P(lon, lat);
          return kind ? (
            <g key={`${lon}${lat}`} transform={`translate(${x} ${y})`}>
              <ellipse cx="0" cy="16" rx="12" ry="4" fill="#000" opacity="0.15" />
              <rect x="-2.5" y="4" width="5" height="12" fill="#8A552D" />
              <circle cx="0" cy="-4" r="13" fill="#3DAA5C" stroke="#25804A" strokeWidth="2" />
              <circle cx="-4" cy="-8" r="5" fill="#6FCB7E" />
            </g>
          ) : (
            <g key={`${lon}${lat}`} transform={`translate(${x} ${y})`}>
              <ellipse cx="0" cy="16" rx="12" ry="4" fill="#000" opacity="0.15" />
              <path d="M0 -24 L13 0 L-13 0 Z M0 -14 L16 12 L-16 12 Z" fill="#23864E" stroke="#1B6A3D" strokeWidth="2" strokeLinejoin="round" />
              <rect x="-2.5" y="12" width="5" height="5" fill="#8A552D" />
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
              // Підписи на плашках — WCAG AA: білий лише на темнішому червоному, на м'ятній — темно-синій.
              const fill = isCurrent ? '#D42D43' : c.completed ? '#35C88A' : '#fff';
              const ink = isCurrent ? '#fff' : c.completed ? '#07182C' : locked ? '#536170' : '#22364A';
              return (
                <g transform="translate(0 28)">
                  <rect x={-w / 2} y="-18" width={w} height={h} rx="18" fill={fill} stroke={isCurrent || c.completed ? '#fff' : '#E6DCCB'} strokeWidth="3" />
                  {/* номер етапу маршруту */}
                  <circle cx={-w / 2 + 20} cy="0" r="12" fill={isCurrent || c.completed ? '#fff' : locked ? '#E9E1D3' : '#22364A'} />
                  <text x={-w / 2 + 20} y="1" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="900" fontFamily="Nunito" fill={isCurrent ? '#D42D43' : c.completed ? '#0D7F57' : locked ? '#536170' : '#fff'}>
                    {c.order}
                  </text>
                  {locked && (
                    <g transform={`translate(${-w / 2 + 44} 0)`}>
                      <rect x="-7" y="-2" width="14" height="11" rx="2.5" fill="#536170" />
                      <path d="M-4 -2 L-4 -6 Q0 -11 4 -6 L4 -2" stroke="#536170" strokeWidth="2.5" fill="none" />
                    </g>
                  )}
                  <text x={(locked ? 22 : 12) + 2} textAnchor="middle" dominantBaseline="central" fontSize="21" fontWeight="900" fontFamily="Nunito" fill={ink}>
                    {label}
                  </text>
                  {sub && (
                    <text x="12" y="21" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="800" fontFamily="Nunito" fill={isCurrent ? '#fff' : c.completed ? '#07182C' : '#536170'}>
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
      {travel && <TravelPin route={sorted} from={travel.from} to={travel.to} />}
    </svg>
  );
});

/** Подорож: бобер іде ділянкою маршруту (через усі проміжні міста), у кінці з'являється штамп міста. */
function TravelPin({ route, from, to }: { route: JourneyCity[]; from: JourneyCity; to: JourneyCity }) {
  const reduce = useReducedMotion();
  const pathRef = useRef<SVGPathElement>(null);
  const [pt, setPt] = useState({ x: from.mapX, y: from.mapY });
  const [arrived, setArrived] = useState(false);
  const a = route.findIndex((c) => c.id === from.id);
  const b = route.findIndex((c) => c.id === to.id);
  const d = a >= 0 && b > a ? Array.from({ length: b - a }, (_, k) => segment(route, a + k)).join(' ') : `M${from.mapX},${from.mapY} L${to.mapX},${to.mapY}`;
  useEffect(() => {
    const el = pathRef.current;
    if (!el) return;
    const len = el.getTotalLength();
    if (reduce) {
      setPt({ x: to.mapX, y: to.mapY });
      setArrived(true);
      return;
    }
    const c = animate(0, 1, {
      duration: Math.min(2.6, 1.2 + (b - a) * 0.5),
      ease: 'easeInOut',
      onUpdate: (v) => {
        const p = el.getPointAtLength(v * len);
        setPt({ x: p.x, y: p.y });
      },
      onComplete: () => setArrived(true),
    });
    return () => c.stop();
  }, [d, reduce, to, a, b]);
  return (
    <g>
      <path ref={pathRef} d={d} fill="none" stroke="#F45159" strokeWidth="7" strokeLinecap="round" opacity="0.9" />
      {arrived && (
        <motion.g initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }} style={{ originX: `${to.mapX}px`, originY: `${to.mapY - 150}px` }}>
          <g transform={`translate(${to.mapX - 45} ${to.mapY - 200})`}>
            <circle cx="45" cy="45" r="44" fill="#FFF9F0" stroke="#fff" strokeWidth="4" />
            <Stamp slug={to.slug} name={to.namePl} stamped size={90} />
          </g>
        </motion.g>
      )}
      <g transform={`translate(${pt.x - 46} ${pt.y - 112})`}>
        <BeaverPin x={0} y={0} vehicle />
      </g>
    </g>
  );
}

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
