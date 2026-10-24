/**
 * Ілюстровані декорації в стилі гри: небо, хмари, панорама польського старого міста,
 * пагорби та дерева. Векторні — легко замінюються растровими фонами з адмінки.
 */
import { memo } from 'react';
import { cityAsset } from '../lib/assets';

type House = { x: number; w: number; h: number; color: string; roof: 'gable' | 'step' | 'flat' };

const HOUSES: House[] = [
  { x: 0, w: 34, h: 54, color: '#F6C344', roof: 'gable' },
  { x: 34, w: 30, h: 66, color: '#EF7D57', roof: 'step' },
  { x: 64, w: 36, h: 58, color: '#7FC8F8', roof: 'gable' },
  { x: 100, w: 28, h: 70, color: '#F4A3B5', roof: 'step' },
  { x: 236, w: 32, h: 62, color: '#9BD18B', roof: 'gable' },
  { x: 268, w: 30, h: 72, color: '#F6C344', roof: 'step' },
  { x: 298, w: 36, h: 56, color: '#B79CF2', roof: 'gable' },
  { x: 334, w: 30, h: 68, color: '#EF7D57', roof: 'gable' },
  { x: 364, w: 36, h: 60, color: '#7FC8F8', roof: 'step' },
];

function HouseShape({ h, base }: { h: House; base: number }) {
  const top = base - h.h;
  const roofH = 18;
  const roof =
    h.roof === 'gable'
      ? `M${h.x - 2} ${top} L${h.x + h.w / 2} ${top - roofH} L${h.x + h.w + 2} ${top} Z`
      : h.roof === 'step'
        ? `M${h.x} ${top} L${h.x} ${top - 6} L${h.x + 6} ${top - 6} L${h.x + 6} ${top - 12} L${h.x + 12} ${top - 12} L${h.x + 12} ${top - 18} L${h.x + h.w - 12} ${top - 18} L${h.x + h.w - 12} ${top - 12} L${h.x + h.w - 6} ${top - 12} L${h.x + h.w - 6} ${top - 6} L${h.x + h.w} ${top - 6} L${h.x + h.w} ${top} Z`
        : '';
  const cols = Math.max(2, Math.floor(h.w / 12));
  const rows = Math.floor((h.h - 14) / 16);
  return (
    <g>
      <rect x={h.x} y={top} width={h.w} height={h.h} fill={h.color} stroke="#7A4A2A" strokeWidth="1.5" />
      {roof && <path d={roof} fill={h.roof === 'gable' ? '#C0533A' : h.color} stroke="#7A4A2A" strokeWidth="1.5" strokeLinejoin="round" />}
      {Array.from({ length: rows }).flatMap((_, r) =>
        Array.from({ length: cols }).map((__, c) => (
          <rect key={`${r}-${c}`} x={h.x + 5 + c * ((h.w - 10) / cols)} y={top + 6 + r * 16} width={(h.w - 10) / cols - 4} height="9" rx="2" fill="#FFF7E0" stroke="#7A4A2A" strokeWidth="0.8" />
        )),
      )}
      <rect x={h.x + h.w / 2 - 4} y={base - 12} width="8" height="12" rx="3" fill="#7A4A2A" />
    </g>
  );
}

function Tree({ x, y, s = 1, c = '#45C486' }: { x: number; y: number; s?: number; c?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-2.5" y="-4" width="5" height="12" fill="#7A4A2A" />
      <circle cx="0" cy="-14" r="13" fill={c} stroke="#2E8A57" strokeWidth="1.5" />
      <circle cx="-8" cy="-8" r="9" fill={c} stroke="#2E8A57" strokeWidth="1.5" />
      <circle cx="8" cy="-8" r="9" fill={c} stroke="#2E8A57" strokeWidth="1.5" />
      <circle cx="-4" cy="-18" r="4" fill="#fff" opacity="0.25" />
    </g>
  );
}

export function Cloud({ x, y, s = 1, opacity = 0.95 }: { x: number; y: number; s?: number; opacity?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="#fff" opacity={opacity}>
      <ellipse cx="0" cy="0" rx="22" ry="11" />
      <ellipse cx="-16" cy="4" rx="14" ry="9" />
      <ellipse cx="18" cy="4" rx="16" ry="9" />
      <ellipse cx="4" cy="-7" rx="13" ry="10" />
    </g>
  );
}

/** Панорама старого міста (Kraków/Warszawa) — для шапок екранів. */
export const Skyline = memo(function Skyline({ className, sky = true, height = 170 }: { className?: string; sky?: boolean; height?: number }) {
  const base = 150;
  return (
    <svg viewBox="0 0 400 170" preserveAspectRatio="xMidYMax slice" className={className} style={{ height }} aria-hidden>
      <defs>
        <linearGradient id="sc-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7CC8F5" />
          <stop offset="1" stopColor="#D9F1FF" />
        </linearGradient>
        <linearGradient id="sc-hill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8ED37A" />
          <stop offset="1" stopColor="#5DB86A" />
        </linearGradient>
      </defs>
      {sky && <rect width="400" height="170" fill="url(#sc-sky)" />}
      <circle cx="350" cy="30" r="16" fill="#FFE07A" opacity="0.9" />
      <Cloud x={60} y={30} s={1.1} />
      <Cloud x={250} y={22} s={0.8} />
      <Cloud x={330} y={60} s={0.6} opacity={0.8} />
      {/* далекі пагорби */}
      <path d="M0 120 Q60 92 130 112 T260 106 T400 100 L400 170 L0 170 Z" fill="#B7E3A6" />
      {/* замок / Вавель */}
      <g transform="translate(150 0)">
        <rect x="0" y="80" width="46" height="70" fill="#E9D9B8" stroke="#7A4A2A" strokeWidth="1.5" />
        <path d="M-4 80 L23 58 L50 80 Z" fill="#3F8F6B" stroke="#7A4A2A" strokeWidth="1.5" strokeLinejoin="round" />
        <rect x="8" y="94" width="8" height="12" rx="4" fill="#7A4A2A" />
        <rect x="30" y="94" width="8" height="12" rx="4" fill="#7A4A2A" />
      </g>
      {/* Маріацький костел — дві вежі */}
      <g transform="translate(196 0)">
        <rect x="0" y="62" width="40" height="88" fill="#C9614A" stroke="#7A4A2A" strokeWidth="1.5" />
        <rect x="2" y="40" width="14" height="24" fill="#C9614A" stroke="#7A4A2A" strokeWidth="1.5" />
        <path d="M0 40 L9 8 L18 40 Z" fill="#3F8F6B" stroke="#7A4A2A" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="9" cy="6" r="2.5" fill="#FFC857" />
        <rect x="24" y="48" width="14" height="16" fill="#C9614A" stroke="#7A4A2A" strokeWidth="1.5" />
        <path d="M23 48 L31 30 L39 48 Z" fill="#3F8F6B" stroke="#7A4A2A" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M12 150 L12 112 Q20 98 28 112 L28 150 Z" fill="#7A4A2A" />
        <circle cx="20" cy="82" r="7" fill="#FFF7E0" stroke="#7A4A2A" strokeWidth="1.2" />
      </g>
      {HOUSES.map((h) => (
        <HouseShape key={h.x} h={h} base={base} />
      ))}
      {/* передній план */}
      <path d="M0 150 Q100 140 200 150 T400 148 L400 170 L0 170 Z" fill="url(#sc-hill)" />
      <Tree x={22} y={160} s={0.9} />
      <Tree x={128} y={158} s={0.75} c="#5DB86A" />
      <Tree x={240} y={160} s={0.8} />
      <Tree x={384} y={160} s={1} c="#5DB86A" />
      {/* польський прапорець на вежі */}
      <g transform="translate(205 6)">
        <rect x="0" y="0" width="1.6" height="16" fill="#7A4A2A" />
        <rect x="1.6" y="0" width="12" height="4" fill="#fff" />
        <rect x="1.6" y="4" width="12" height="4" fill="#E5484D" />
      </g>
    </svg>
  );
});

/** Ігровий логотип з білим контуром і тінню. */
export function Logo({ size = 44, slogan }: { size?: number; slogan?: string }) {
  const style = (fill: string) => ({
    color: fill,
    WebkitTextStroke: `${Math.round(size / 7)}px #fff`,
    paintOrder: 'stroke fill' as const,
    textShadow: `0 ${size / 10}px 0 rgba(36,55,70,0.35)`,
  });
  return (
    <div className="flex flex-col items-center leading-none">
      <div className="flex items-end font-black italic tracking-tight" style={{ fontSize: size }}>
        <span style={style('#E5484D')}>POLSKI</span>
        <span className="ml-2" style={style('#FFB627')}>GO</span>
        <svg viewBox="0 0 30 20" style={{ width: size * 0.7, marginLeft: 4, marginBottom: size * 0.45 }} aria-hidden>
          <path d="M2 2 Q15 -2 28 4 L28 18 Q15 12 2 16 Z" fill="#E5484D" stroke="#fff" strokeWidth="2" />
          <path d="M2 2 Q15 -2 28 4 L28 10 Q15 6 2 9 Z" fill="#fff" />
        </svg>
      </div>
      {slogan && (
        <div className="mt-2 rounded-full bg-white/85 px-3 py-1 text-[13px] font-black text-ink shadow" style={{ fontStyle: 'normal' }}>
          {slogan}
        </div>
      )}
    </div>
  );
}

// ───────── Пам'ятки міст для карти ─────────
export type LandmarkKind = 'palace' | 'castle' | 'townhall' | 'crane' | 'factory' | 'ship' | 'saucer' | 'church' | 'mountains' | 'grapes' | 'bridge' | 'granary' | 'tower' | 'lakecastle';

/** Відповідність міста і впізнаваної пам'ятки. */
export const CITY_LANDMARKS: Record<string, LandmarkKind> = {
  warszawa: 'palace', krakow: 'castle', wroclaw: 'townhall', gdansk: 'crane', poznan: 'townhall', lodz: 'factory',
  katowice: 'saucer', lublin: 'castle', szczecin: 'ship', torun: 'church', bydgoszcz: 'granary', rzeszow: 'tower',
  bialystok: 'palace', olsztyn: 'lakecastle', opole: 'tower', kielce: 'mountains', zakopane: 'mountains',
  'zielona-gora': 'grapes', gdynia: 'ship', gorzow: 'bridge',
};

const L = '#5A3A22';

/** Пам'ятка в мультяшному 2.5D-стилі. Початок координат — низ по центру, висота ≈ 70. */
export function Landmark({ kind, color, muted }: { kind: LandmarkKind; color: string; muted?: boolean }) {
  const wall = '#F4E7CF';
  const roof = color;
  const g = (children: React.ReactNode) => (
    <g stroke={L} strokeWidth="2.2" strokeLinejoin="round" style={muted ? { filter: 'saturate(0.35) brightness(1.05)' } : undefined}>
      <ellipse cx="0" cy="2" rx="34" ry="7" fill="#000" opacity="0.15" stroke="none" />
      {children}
    </g>
  );
  switch (kind) {
    case 'palace':
      return g(
        <>
          <rect x="-26" y="-22" width="52" height="22" fill={wall} />
          <rect x="-14" y="-44" width="28" height="22" fill={wall} />
          <rect x="-7" y="-62" width="14" height="18" fill={wall} />
          <path d="M-4 -62 L0 -78 L4 -62 Z" fill={roof} />
          {[-20, -10, 10, 20].map((x) => <rect key={x} x={x - 2.5} y="-16" width="5" height="9" rx="1.5" fill="#7FC8F8" strokeWidth="1.2" />)}
          {[-8, 2].map((x) => <rect key={x} x={x} y="-38" width="5" height="9" rx="1.5" fill="#7FC8F8" strokeWidth="1.2" />)}
        </>,
      );
    case 'castle':
    case 'lakecastle':
      return g(
        <>
          {kind === 'lakecastle' && <ellipse cx="0" cy="0" rx="36" ry="8" fill="#7FC8F8" />}
          <rect x="-28" y="-30" width="56" height="30" fill={wall} />
          <rect x="-34" y="-46" width="16" height="46" fill={wall} />
          <path d="M-36 -46 L-26 -64 L-16 -46 Z" fill={roof} />
          <rect x="18" y="-40" width="14" height="40" fill={wall} />
          <path d="M16 -40 L25 -56 L34 -40 Z" fill={roof} />
          <path d="M-18 -30 L0 -44 L18 -30 Z" fill={roof} />
          <path d="M-6 0 L-6 -12 Q0 -18 6 -12 L6 0 Z" fill={L} />
        </>,
      );
    case 'townhall':
      return g(
        <>
          <rect x="-26" y="-26" width="52" height="26" fill={wall} />
          <path d="M-28 -26 L-14 -42 L0 -26 L14 -42 L28 -26 Z" fill={roof} />
          <rect x="-6" y="-58" width="12" height="32" fill={wall} />
          <path d="M-8 -58 L0 -76 L8 -58 Z" fill={roof} />
          <circle cx="0" cy="-48" r="3.5" fill="#fff" strokeWidth="1.2" />
          {[-18, -8, 8, 18].map((x) => <rect key={x} x={x - 2.5} y="-18" width="5" height="9" rx="2" fill="#7FC8F8" strokeWidth="1.2" />)}
        </>,
      );
    case 'crane':
      return g(
        <>
          <rect x="-28" y="-30" width="22" height="30" fill={wall} />
          <rect x="6" y="-30" width="22" height="30" fill={wall} />
          <path d="M-30 -30 L-17 -40 L-4 -30 Z" fill={roof} />
          <path d="M4 -30 L17 -40 L30 -30 Z" fill={roof} />
          <rect x="-8" y="-62" width="16" height="62" fill="#8A5A36" />
          <path d="M-10 -62 L0 -72 L10 -62 Z" fill={roof} />
          <path d="M-8 -50 L8 -50 M-8 -38 L8 -38" strokeWidth="1.5" />
        </>,
      );
    case 'factory':
      return g(
        <>
          <rect x="-30" y="-24" width="60" height="24" fill="#C9614A" />
          <path d="M-30 -24 L-20 -34 L-10 -24 L0 -34 L10 -24 L20 -34 L30 -24" fill="#C9614A" />
          <rect x="14" y="-66" width="10" height="44" fill="#B04E3A" />
          <circle cx="24" cy="-72" r="6" fill="#fff" opacity="0.85" stroke="none" />
          <circle cx="32" cy="-78" r="4.5" fill="#fff" opacity="0.7" stroke="none" />
          {[-22, -10, 2].map((x) => <rect key={x} x={x} y="-16" width="7" height="8" fill="#FFE07A" strokeWidth="1.2" />)}
        </>,
      );
    case 'ship':
      return g(
        <>
          <path d="M-32 -12 L32 -12 L24 2 L-24 2 Z" fill={roof} />
          <rect x="-2" y="-62" width="4" height="50" fill="#8A5A36" />
          <path d="M2 -60 L26 -20 L2 -20 Z" fill="#fff" />
          <path d="M-2 -54 L-22 -20 L-2 -20 Z" fill="#fff" />
          <path d="M2 -62 L14 -58 L2 -54 Z" fill="#F45159" />
          <path d="M-40 4 Q-30 0 -20 4 T0 4 T20 4 T40 4" fill="none" stroke="#55BDF4" strokeWidth="2.5" />
        </>,
      );
    case 'saucer':
      return g(
        <>
          <path d="M-12 0 L-6 -18 L6 -18 L12 0 Z" fill={wall} />
          <ellipse cx="0" cy="-22" rx="34" ry="10" fill={roof} />
          <ellipse cx="0" cy="-26" rx="22" ry="6" fill="#fff" opacity="0.5" />
          <path d="M-30 -20 L-36 -6 M30 -20 L36 -6" strokeWidth="2" />
        </>,
      );
    case 'church':
      return g(
        <>
          <rect x="-24" y="-28" width="48" height="28" fill="#C9614A" />
          <path d="M-26 -28 L0 -44 L26 -28 Z" fill={roof} />
          <rect x="-8" y="-60" width="16" height="32" fill="#C9614A" />
          <path d="M-10 -60 L0 -80 L10 -60 Z" fill={roof} />
          <circle cx="0" cy="-50" r="4" fill="#fff" strokeWidth="1.2" />
          <path d="M-5 0 L-5 -12 Q0 -18 5 -12 L5 0 Z" fill={L} />
        </>,
      );
    case 'granary':
      return g(
        <>
          {[-26, -8, 10].map((x, i) => (
            <g key={x}>
              <rect x={x} y={-30 - i * 4} width="16" height={30 + i * 4} fill={['#F6C344', '#EF7D57', wall][i]} />
              <path d={`M${x - 2} ${-30 - i * 4} L${x + 8} ${-44 - i * 4} L${x + 18} ${-30 - i * 4} Z`} fill={roof} />
            </g>
          ))}
          <path d="M-36 2 Q-18 -2 0 2 T36 2" fill="none" stroke="#55BDF4" strokeWidth="3" />
        </>,
      );
    case 'tower':
      return g(
        <>
          <rect x="-12" y="-54" width="24" height="54" fill={wall} />
          <path d="M-16 -54 L-16 -62 L-8 -62 L-8 -56 L-2 -56 L-2 -62 L2 -62 L2 -56 L8 -56 L8 -62 L16 -62 L16 -54 Z" fill={wall} />
          <path d="M-14 -62 L0 -80 L14 -62 Z" fill={roof} />
          {[-40, -26, -12].map((y) => <rect key={y} x="-3" y={y} width="6" height="8" rx="3" fill="#7FC8F8" strokeWidth="1.2" />)}
        </>,
      );
    case 'mountains':
      return g(
        <>
          <path d="M-36 0 L-12 -50 L4 -22 L16 -40 L36 0 Z" fill={muted ? '#C4CDD5' : '#9AA9B6'} />
          <path d="M-12 -50 L-20 -34 L-14 -36 L-10 -30 L-4 -38 Z" fill="#fff" strokeWidth="1.5" />
          <path d="M16 -40 L10 -30 L16 -32 L22 -28 Z" fill="#fff" strokeWidth="1.5" />
          <rect x="-6" y="-12" width="16" height="12" fill="#B07A4A" />
          <path d="M-9 -12 L2 -22 L13 -12 Z" fill={roof} />
        </>,
      );
    case 'grapes':
      return g(
        <>
          <path d="M0 -60 Q8 -70 16 -64" fill="none" strokeWidth="3" />
          <path d="M2 -60 Q16 -66 22 -56 Q10 -52 2 -60 Z" fill="#35C88A" />
          {[[0, -50], [-9, -42], [9, -42], [-14, -32], [0, -32], [14, -32], [-8, -22], [8, -22], [0, -12]].map(([x, y]) => (
            <circle key={`${x}${y}`} cx={x} cy={y} r="7" fill={roof} />
          ))}
          <circle cx="-3" cy="-53" r="2" fill="#fff" opacity="0.7" stroke="none" />
        </>,
      );
    case 'bridge':
      return g(
        <>
          <path d="M-38 -8 L38 -8 L38 -2 L-38 -2 Z" fill={wall} />
          <path d="M-30 -8 Q-15 -34 0 -8 M0 -8 Q15 -34 30 -8" fill="none" stroke={roof} strokeWidth="5" />
          <path d="M-40 4 Q-30 0 -20 4 T0 4 T20 4 T40 4" fill="none" stroke="#55BDF4" strokeWidth="2.5" />
          <rect x="-4" y="-40" width="8" height="32" fill={wall} />
          <path d="M-6 -40 L0 -50 L6 -40 Z" fill={roof} />
        </>,
      );
  }
}

/**
 * Банер міста: растрова панорама (src/assets/cities/<slug>.webp), якщо є,
 * інакше — ілюстрована сцена з небом, старим містом і пам'яткою в кольорі міста.
 */
export function CityBanner({ slug, color, height = 150, className, children }: { slug: string; color: string; height?: number; className?: string; children?: React.ReactNode }) {
  const img = cityAsset(slug);
  return (
    <div className={`relative overflow-hidden ${className ?? ''}`} style={{ height }}>
      {img ? (
        <img src={img} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      ) : (
        <>
          <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #8ED3F7 0%, #D8F0FF 55%, ${color}55 100%)` }} />
          <Skyline className="absolute inset-x-0 bottom-0 w-full" height={height * 0.82} sky={false} />
          <svg viewBox="-50 -90 100 100" className="absolute bottom-1 right-3" style={{ height: height * 0.62 }} aria-hidden>
            <Landmark kind={CITY_LANDMARKS[slug] ?? 'townhall'} color={color} />
          </svg>
        </>
      )}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 45%, rgba(20,35,50,0.45) 100%)' }} />
      {children}
    </div>
  );
}
