/**
 * Ілюстрований світ заставки POLSKI GO — Краків, оригінальна векторна графіка.
 * Кожен шар — окремий <svg> з однаковою системою координат 390×844 (обрізання по низу),
 * тож шари рухаються незалежно (паралакс, трамвай, хмари) і браузер компонує їх на GPU
 * без перемальовування всієї сцени. Безперервні рухи — CSS-анімації (див. index.css, .sw-*),
 * вимикаються при «зменшити рух».
 */
import { memo, type ReactNode } from 'react';

const INK = '#1B3550';
const SW = 2.2;
const VB = '0 0 390 844';
/** Місто підняте над панеллю завантаження: «земля» площі на ~77% висоти екрана. */
const LIFT = 66;

function Layer({ children, className = '', style, lift = LIFT }: { children: ReactNode; className?: string; style?: React.CSSProperties; lift?: number }) {
  return (
    <div className={`sw-layer absolute inset-0 ${className}`} style={style} aria-hidden>
      <svg viewBox={VB} preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
        <g transform={lift ? `translate(0 ${-lift})` : undefined}>{children}</g>
      </svg>
    </div>
  );
}

// ───────────── Небо, сонце, хмари, птахи ─────────────

export function Sky() {
  return (
    <div className="absolute inset-0" aria-hidden style={{ background: 'linear-gradient(180deg, #1672D8 0%, #2C92EA 22%, #5DB6F4 46%, #A9DDFB 66%, #DDF2FF 80%, #F4E7CF 100%)' }}>
      <div className="absolute -right-20 -top-16 h-80 w-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,251,225,0.95) 0%, rgba(255,236,170,0.45) 32%, transparent 68%)' }} />
      <div className="absolute inset-x-0 top-[42%] h-40" style={{ background: 'radial-gradient(60% 100% at 50% 50%, rgba(255,255,255,0.55), transparent 70%)' }} />
    </div>
  );
}

function CloudShape({ w = 160 }: { w?: number }) {
  return (
    <svg viewBox="0 0 160 70" width={w} height={(w * 70) / 160} aria-hidden>
      <path d="M22 58 C 4 58, 2 36, 20 34 C 18 18, 40 10, 52 22 C 58 6, 90 2, 98 22 C 108 12, 132 16, 132 34 C 152 32, 158 58, 136 58 Z" fill="#FFFFFF" />
      <path d="M22 58 C 10 58, 6 48, 12 42 C 30 50, 110 52, 150 44 C 154 54, 146 58, 136 58 Z" fill="#D7ECFB" />
      <ellipse cx="62" cy="26" rx="16" ry="6" fill="#FFFFFF" opacity="0.9" />
    </svg>
  );
}

export function Clouds() {
  const clouds: { top: string; w: number; dur: number; delay: number; op: number }[] = [
    { top: '7%', w: 150, dur: 70, delay: -12, op: 0.95 },
    { top: '15%', w: 110, dur: 55, delay: -40, op: 0.85 },
    { top: '31%', w: 190, dur: 90, delay: -60, op: 0.9 },
    { top: '42%', w: 120, dur: 64, delay: -25, op: 0.75 },
    { top: '3%', w: 90, dur: 48, delay: -5, op: 0.7 },
  ];
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      {clouds.map((c, i) => (
        <div key={i} className="sw-cloud absolute left-0" style={{ top: c.top, opacity: c.op, animationDuration: `${c.dur}s`, animationDelay: `${c.delay}s` }}>
          <CloudShape w={c.w} />
        </div>
      ))}
    </div>
  );
}

export function Birds() {
  return (
    <div className="sw-birds absolute left-[8%] top-[24%]" aria-hidden>
      {[
        [0, 0, 1],
        [34, -14, 0.8],
        [64, 6, 0.9],
      ].map(([x, y, s], i) => (
        <svg key={i} viewBox="0 0 30 12" width={30 * s} height={12 * s} className="sw-bird absolute" style={{ left: x, top: y, animationDelay: `${i * 0.25}s` }}>
          <path d="M1 8 Q8 0 15 8 Q22 0 29 8" fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M1 8 Q8 0 15 8 Q22 0 29 8" fill="none" stroke="#6E8DAA" strokeWidth="0.8" strokeLinecap="round" opacity="0.7" />
        </svg>
      ))}
    </div>
  );
}

// ───────────── Дальній план: Вавель, панорама, Маріацький костел ─────────────

function Windows({ x, y, cols, rows, w = 7, h = 9, gx = 13, gy = 15, fill = '#8EC8EA' }: { x: number; y: number; cols: number; rows: number; w?: number; h?: number; gx?: number; gy?: number; fill?: string }) {
  return (
    <g>
      {Array.from({ length: rows }).flatMap((_, r) =>
        Array.from({ length: cols }).map((__, c) => (
          <g key={`${r}-${c}`}>
            <rect x={x + c * gx} y={y + r * gy} width={w} height={h} rx="1.6" fill={fill} stroke={INK} strokeWidth="1.2" />
            <rect x={x + c * gx + 1} y={y + r * gy + 1} width={w / 2 - 1} height={h / 2} fill="#fff" opacity="0.35" />
          </g>
        )),
      )}
    </g>
  );
}

function GothicWindow({ x, y, w = 10, h = 30 }: { x: number; y: number; w?: number; h?: number }) {
  return (
    <g>
      <path d={`M${x} ${y + h} V${y + w / 2} Q${x + w / 2} ${y - w / 3} ${x + w} ${y + w / 2} V${y + h} Z`} fill="#2A3F5E" stroke={INK} strokeWidth="1.4" />
      <path d={`M${x + w / 2} ${y + 2} V${y + h}`} stroke="#5D7FA6" strokeWidth="1" />
    </g>
  );
}

export const FarCity = memo(function FarCity() {
  return (
    <Layer className="sw-far">
      <defs>
        <linearGradient id="sw-hill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6CCB62" /><stop offset="1" stopColor="#2F8C4A" /></linearGradient>
        <linearGradient id="sw-brick" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#C8653F" /><stop offset="0.7" stopColor="#B4523A" /><stop offset="1" stopColor="#8E3E2B" /></linearGradient>
        <linearGradient id="sw-slate" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#465A7E" /><stop offset="1" stopColor="#25324D" /></linearGradient>
        <linearGradient id="sw-copper" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#6FCBA8" /><stop offset="1" stopColor="#3A9476" /></linearGradient>
      </defs>
      {/* далека панорама в серпанку */}
      <path d="M120 560 V520 h14 v-10 h10 v10 h18 v-26 l8 -12 l8 12 v26 h20 v-18 h16 v18 h24 v-30 l6 -18 l6 18 v30 h18 v40 Z" fill="#9CC7EC" opacity="0.75" />
      <path d="M150 560 V536 h20 v-8 h14 v8 h26 v-14 h12 v14 h30 V560 Z" fill="#B7D8F3" opacity="0.8" />

      {/* Вавель — вище над кам'яницями, як на референсі */}
      <g transform="translate(-8 -104) scale(1.04)">
      <path d="M-20 760 V610 C 10 528, 70 494, 140 498 C 192 501, 228 528, 262 572 V760 Z" fill="url(#sw-hill)" stroke={INK} strokeWidth={SW} />
      {[[18, 548, 16], [44, 532, 14], [196, 520, 15], [222, 540, 16], [244, 562, 13]].map(([x, y, r], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={r} fill="#3FA75A" stroke={INK} strokeWidth="1.8" />
          <circle cx={x - r / 3} cy={y - r / 3} r={r / 3} fill="#8BDA7C" opacity="0.6" />
        </g>
      ))}
      {/* мури */}
      <path d="M6 552 L190 520 L192 536 L8 568 Z" fill="#D9A066" stroke={INK} strokeWidth="1.8" />
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x={10 + i * 15} y={548 - i * 2.6 - 6} width="7" height="6" fill="#D9A066" stroke={INK} strokeWidth="1.2" />
      ))}
      {/* замок */}
      <rect x="24" y="456" width="152" height="60" rx="3" fill="#F4E4C1" stroke={INK} strokeWidth={SW} />
      <Windows x={32} y={466} cols={11} rows={3} w={6} h={8} gx={13} gy={15} />
      <path d="M18 456 L32 436 L168 436 L182 456 Z" fill="#C9513A" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M36 440 H164" stroke="#E98A6E" strokeWidth="2" />
      {/* вежа 1 */}
      <rect x="30" y="404" width="28" height="70" fill="#EFD8AE" stroke={INK} strokeWidth={SW} />
      <path d="M26 406 L44 364 L62 406 Z" fill="#C9513A" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <Windows x={36} y={414} cols={2} rows={2} w={5} h={8} gx={10} gy={16} />
      {/* собор: зелений купол */}
      <rect x="92" y="398" width="26" height="58" fill="#E9D3A6" stroke={INK} strokeWidth={SW} />
      <path d="M86 400 C 86 372, 124 372, 124 400 Z" fill="url(#sw-copper)" stroke={INK} strokeWidth={SW} />
      <rect x="101" y="360" width="8" height="14" fill="url(#sw-copper)" stroke={INK} strokeWidth="1.6" />
      <circle cx="105" cy="355" r="4" fill="#F5C24A" stroke={INK} strokeWidth="1.4" />
      <GothicWindow x={99} y={410} w={12} h={26} />
      {/* золотий купол каплиці */}
      <rect x="126" y="424" width="22" height="32" fill="#EFD8AE" stroke={INK} strokeWidth="1.8" />
      <path d="M122 426 C 122 404, 152 404, 152 426 Z" fill="#F2B53A" stroke={INK} strokeWidth="1.8" />
      <path d="M128 418 C 132 410, 140 408, 146 414" stroke="#FFE7A0" strokeWidth="2" fill="none" />
      {/* вежа 3 */}
      <rect x="152" y="414" width="30" height="60" fill="#EFD8AE" stroke={INK} strokeWidth={SW} />
      <path d="M148 416 L167 380 L186 416 Z" fill="#B9472F" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <Windows x={158} y={426} cols={2} rows={2} w={6} h={8} gx={11} gy={16} />
      <path d="M167 380 V368" stroke={INK} strokeWidth="1.6" />
      <path d="M167 368 l10 3 l-10 3 Z" fill="#E5383B" stroke={INK} strokeWidth="1" />
      </g>

      <g transform="translate(0 40)">
      {/* Planty: дерева біля підніжжя пагорба */}
      {[[8, 586, 26], [52, 596, 22], [150, 590, 24], [196, 600, 20], [238, 596, 22], [100, 606, 18]].map(([x, y, r], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={r} fill={i % 2 ? '#2F9A55' : '#3DB565'} stroke={INK} strokeWidth="1.8" />
          <circle cx={x - r / 3} cy={y - r / 3} r={r / 3} fill="#8EE08A" opacity="0.5" />
        </g>
      ))}
      {/* Маріацький костел — ліва (Гейналова) вежа */}
      <rect x="262" y="330" width="50" height="380" fill="url(#sw-brick)" stroke={INK} strokeWidth={SW} />
      {Array.from({ length: 18 }).map((_, i) => <path key={i} d={`M263 ${352 + i * 20} H311`} stroke="#8E3E2B" strokeWidth="0.8" opacity="0.45" />)}
      <rect x="258" y="318" width="58" height="14" fill="#7A3524" stroke={INK} strokeWidth="1.8" />
      {[364, 430, 500, 570].map((y) => (
        <g key={y}>
          <GothicWindow x={270} y={y} w={10} h={34} />
          <GothicWindow x={294} y={y} w={10} h={34} />
        </g>
      ))}
      <path d="M262 320 L287 196 L312 320 Z" fill="url(#sw-slate)" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M287 200 L287 318 M276 270 L287 216 M298 270 L287 216" stroke="#6E85AE" strokeWidth="1" opacity="0.6" />
      {[[258, 322, 36], [316, 322, 36], [272, 318, 24], [302, 318, 24]].map(([x, y, h], i) => (
        <g key={i}>
          <path d={`M${x - 5} ${y} L${x} ${y - h} L${x + 5} ${y} Z`} fill="#33425F" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx={x} cy={y - h - 2} r="1.8" fill="#F5C24A" />
        </g>
      ))}
      <path d="M276 262 Q287 256 298 262 L297 268 Q287 263 277 268 Z" fill="#F5C24A" stroke={INK} strokeWidth="1.2" />
      <circle cx="287" cy="192" r="4.5" fill="#F5C24A" stroke={INK} strokeWidth="1.4" />
      <path d="M287 187 V176 M283 180 H291" stroke="#F5C24A" strokeWidth="2" strokeLinecap="round" />
      {/* права вежа з ренесансним шоломом */}
      <rect x="326" y="384" width="46" height="326" fill="url(#sw-brick)" stroke={INK} strokeWidth={SW} />
      {Array.from({ length: 15 }).map((_, i) => <path key={i} d={`M327 ${404 + i * 20} H371`} stroke="#8E3E2B" strokeWidth="0.8" opacity="0.45" />)}
      {[412, 480, 548].map((y) => <GothicWindow key={y} x={343} y={y} w={12} h={36} />)}
      <path d="M322 386 C 322 354, 376 354, 376 386 Z" fill="url(#sw-slate)" stroke={INK} strokeWidth={SW} />
      <rect x="343" y="334" width="12" height="24" fill="#33425F" stroke={INK} strokeWidth="1.6" />
      <path d="M340 336 C 340 322, 358 322, 358 336 Z" fill="#33425F" stroke={INK} strokeWidth="1.6" />
      <path d="M349 322 V308" stroke={INK} strokeWidth="1.8" />
      <circle cx="349" cy="306" r="3" fill="#F5C24A" stroke={INK} strokeWidth="1.2" />
      {/* дах нави */}
      <path d="M312 470 L326 440 L326 520 L312 520 Z" fill="#9C4630" stroke={INK} strokeWidth="1.8" />
      <path d="M372 452 L400 418 L400 520 L372 520 Z" fill="url(#sw-slate)" stroke={INK} strokeWidth="1.8" />
      </g>
    </Layer>
  );
});

// ───────────── Середній план: кам'яниці, пам'ятник, Żabka, дерева ─────────────

function Tenement({ x, top, w, color, roof, attic = 'step', cols = 3, bottom = 770 }: { x: number; top: number; w: number; color: string; roof: string; attic?: 'step' | 'pediment' | 'flat'; cols?: number; bottom?: number }) {
  const rows = Math.floor((bottom - top - 50) / 30);
  const gx = (w - 12) / cols;
  return (
    <g>
      {attic === 'step' && (
        <path d={`M${x} ${top} V${top - 10} H${x + w * 0.2} V${top - 20} H${x + w * 0.4} V${top - 30} H${x + w * 0.6} V${top - 20} H${x + w * 0.8} V${top - 10} H${x + w} V${top} Z`} fill={color} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      )}
      {attic === 'pediment' && <path d={`M${x - 3} ${top} L${x + w / 2} ${top - 24} L${x + w + 3} ${top} Z`} fill={roof} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />}
      {attic === 'flat' && (
        <g>
          <rect x={x - 2} y={top - 8} width={w + 4} height="8" fill={roof} stroke={INK} strokeWidth="1.8" />
          {Array.from({ length: Math.floor(w / 8) }).map((_, i) => <rect key={i} x={x + 2 + i * 8} y={top - 16} width="3" height="8" fill={color} stroke={INK} strokeWidth="1" />)}
        </g>
      )}
      <rect x={x} y={top} width={w} height={bottom - top} fill={color} stroke={INK} strokeWidth={SW} />
      <rect x={x} y={top} width={w} height="6" fill="#fff" opacity="0.25" />
      <rect x={x + w - 6} y={top} width="6" height={bottom - top} fill="#000" opacity="0.08" />
      {Array.from({ length: rows }).flatMap((_, r) =>
        Array.from({ length: cols }).map((__, c) => (
          <g key={`${r}-${c}`}>
            <rect x={x + 8 + c * gx} y={top + 14 + r * 30} width={gx - 8} height="17" rx="2" fill="#D9F0FD" stroke={INK} strokeWidth="1.3" />
            <path d={`M${x + 8 + c * gx + (gx - 8) / 2} ${top + 14 + r * 30} v17`} stroke={INK} strokeWidth="0.9" />
            <rect x={x + 6 + c * gx} y={top + 31 + r * 30} width={gx - 4} height="2.6" fill="#fff" stroke={INK} strokeWidth="0.8" />
          </g>
        )),
      )}
    </g>
  );
}

function Person({ x, y, shirt, hair = '#4A3324', s = 1 }: { x: number; y: number; shirt: string; hair?: string; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-5 0 L-4 -16 Q0 -20 4 -16 L5 0 Z" fill={shirt} stroke={INK} strokeWidth="1.2" />
      <circle cx="0" cy="-22" r="4.5" fill="#F6C9A6" stroke={INK} strokeWidth="1.2" />
      <path d="M-4.5 -23 Q0 -30 4.5 -23 Q2 -26 -4.5 -23 Z" fill={hair} />
      <path d="M-3 0 V8 M3 0 V8" stroke="#2C3E57" strokeWidth="2.4" strokeLinecap="round" />
    </g>
  );
}

function TreeRound({ x, y, r = 30 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <path d={`M${x - 4} ${y + r * 0.6} L${x - 3} ${y + r * 2.2} H${x + 3} L${x + 4} ${y + r * 0.6} Z`} fill="#7A5236" stroke={INK} strokeWidth="1.6" />
      <circle cx={x - r * 0.55} cy={y + r * 0.2} r={r * 0.7} fill="#2F9A55" stroke={INK} strokeWidth={SW} />
      <circle cx={x + r * 0.55} cy={y + r * 0.25} r={r * 0.68} fill="#2F9A55" stroke={INK} strokeWidth={SW} />
      <circle cx={x} cy={y - r * 0.25} r={r * 0.85} fill="#3DB565" stroke={INK} strokeWidth={SW} />
      <circle cx={x - r * 0.3} cy={y - r * 0.5} r={r * 0.32} fill="#8EE08A" opacity="0.55" />
      <circle cx={x + r * 0.45} cy={y + r * 0.1} r={r * 0.18} fill="#8EE08A" opacity="0.45" />
    </g>
  );
}

export const MidCity = memo(function MidCity() {
  return (
    <Layer className="sw-mid">
      <defs>
        <linearGradient id="sw-zabka" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2DB463" /><stop offset="1" stopColor="#168043" /></linearGradient>
        <linearGradient id="sw-shop-light" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFF4CC" /><stop offset="1" stopColor="#FFD98A" /></linearGradient>
        <linearGradient id="sw-bronze" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#5C6E77" /><stop offset="1" stopColor="#36444C" /></linearGradient>
      </defs>
      {/* ліві кам'яниці */}
      <Tenement x={-12} top={556} w={60} color="#F6C445" roof="#B9472F" attic="step" cols={3} />
      <Tenement x={48} top={580} w={54} color="#EE7A52" roof="#B9472F" attic="pediment" cols={3} />
      <Tenement x={102} top={606} w={50} color="#F3E2C2" roof="#C9513A" attic="flat" cols={2} />
      {/* кавові парасолі й перехожі */}
      {[22, 66].map((x) => (
        <g key={x}>
          <path d={`M${x} 742 V760`} stroke="#6D5847" strokeWidth="2" />
          <path d={`M${x - 20} 744 Q${x} 726 ${x + 20} 744 Z`} fill="#FFFFFF" stroke={INK} strokeWidth="1.6" />
          <path d={`M${x - 20} 744 Q${x - 10} 740 ${x} 744 Q${x + 10} 740 ${x + 20} 744`} fill="none" stroke="#E5383B" strokeWidth="2" />
          <rect x={x - 9} y="756" width="18" height="4" rx="1" fill="#6D5847" />
        </g>
      ))}
      <Person x={42} y={762} shirt="#3A7BD5" />
      <Person x={88} y={764} shirt="#E5383B" hair="#E2B04A" s={0.95} />
      <Person x={8} y={766} shirt="#45C486" s={0.9} />

      {/* пам'ятник Міцкевичу (силует) */}
      <rect x="92" y="738" width="70" height="16" fill="#7C8A93" stroke={INK} strokeWidth="1.8" />
      <rect x="102" y="694" width="50" height="44" fill="url(#sw-bronze)" stroke={INK} strokeWidth="1.8" />
      <rect x="98" y="690" width="58" height="7" fill="#8C9AA3" stroke={INK} strokeWidth="1.4" />
      <rect x="111" y="662" width="32" height="28" fill="#6B7A84" stroke={INK} strokeWidth="1.6" />
      <path d="M118 662 L120 628 Q127 618 134 628 L137 662 Z" fill="url(#sw-bronze)" stroke={INK} strokeWidth="1.6" />
      <path d="M120 636 Q112 646 116 662 M134 632 Q141 640 139 652" stroke="#2C3940" strokeWidth="2.2" fill="none" />
      <circle cx="127" cy="620" r="6.5" fill="url(#sw-bronze)" stroke={INK} strokeWidth="1.6" />

      {/* праві кам'яниці за Żabką */}
      <Tenement x={236} top={566} w={58} color="#F2B3A8" roof="#B9472F" attic="pediment" cols={3} bottom={700} />
      <Tenement x={294} top={552} w={100} color="#F5E3BF" roof="#C9513A" attic="step" cols={5} bottom={700} />

      {/* дерево */}
      <TreeRound x={222} y={612} r={34} />

      {/* Żabka */}
      <rect x="240" y="616" width="160" height="110" fill="#E9F2EC" stroke={INK} strokeWidth={SW} />
      <rect x="240" y="616" width="160" height="36" fill="url(#sw-zabka)" stroke={INK} strokeWidth={SW} />
      <g transform="translate(262 634)">
        <ellipse cx="0" cy="2" rx="13" ry="10" fill="#7DCB4E" stroke="#0E5A2E" strokeWidth="1.6" />
        <circle cx="-6" cy="-6" r="5" fill="#7DCB4E" stroke="#0E5A2E" strokeWidth="1.4" />
        <circle cx="6" cy="-6" r="5" fill="#7DCB4E" stroke="#0E5A2E" strokeWidth="1.4" />
        <circle cx="-6" cy="-6.5" r="2.6" fill="#fff" /><circle cx="6" cy="-6.5" r="2.6" fill="#fff" />
        <circle cx="-5.4" cy="-6" r="1.3" fill="#10233B" /><circle cx="6.6" cy="-6" r="1.3" fill="#10233B" />
        <path d="M-6 4 Q0 9 6 4" stroke="#0E5A2E" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </g>
      <text x="282" y="643" fontSize="25" fontWeight="900" fontStyle="italic" fill="#FFFFFF" fontFamily="Nunito, system-ui, sans-serif" letterSpacing="-0.5">żabka</text>
      <path d="M284 647 Q312 652 344 646" stroke="#FFE14D" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      {/* вітрина з полицями */}
      <rect x="248" y="660" width="94" height="60" rx="3" fill="url(#sw-shop-light)" stroke={INK} strokeWidth="1.8" />
      {[676, 692, 708].map((y) => <path key={y} d={`M250 ${y} H340`} stroke="#C99A4A" strokeWidth="1.6" />)}
      {[0, 1, 2].flatMap((r) => [0, 1, 2, 3, 4, 5, 6].map((c) => (
        <rect key={`${r}-${c}`} x={254 + c * 12} y={665 + r * 16} width="7" height="10" rx="1.5" fill={['#E5383B', '#3A7BD5', '#FFC857', '#45C486', '#9D69FF', '#FF8A3D', '#36B9FF'][(r * 3 + c) % 7]} stroke={INK} strokeWidth="0.8" />
      )))}
      <path d="M252 664 L272 664 L258 716 L250 716 Z" fill="#FFFFFF" opacity="0.35" />
      {/* двері */}
      <rect x="350" y="664" width="44" height="62" rx="2" fill="#BFE3F2" stroke={INK} strokeWidth="1.8" />
      <path d="M372 664 V726" stroke={INK} strokeWidth="1.6" />
      <path d="M354 668 L366 668 L356 720 L352 720 Z" fill="#FFFFFF" opacity="0.5" />

      {/* ліхтар */}
      <path d="M372 772 V640" stroke="#24313D" strokeWidth="4" />
      <path d="M362 640 H382 L378 618 H366 Z" fill="#FFE7A0" stroke="#24313D" strokeWidth="2" />
      <path d="M364 618 Q372 608 380 618" fill="#24313D" />
      <circle cx="372" cy="630" r="16" fill="#FFE7A0" opacity="0.25" />
    </Layer>
  );
});

// ───────────── Трамвай (окремий шар, проїжджає вулицею) ─────────────

export function Tram() {
  return (
    <div className="sw-tram absolute inset-0" aria-hidden>
      <svg viewBox={VB} preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
        <g transform={`translate(0 ${-LIFT})`}>
          {/* пантограф */}
          <path d="M-118 652 L-104 632 L-90 652 M-112 632 H-96" stroke="#2C3E57" strokeWidth="2" fill="none" strokeLinejoin="round" />
          <rect x="-236" y="650" width="226" height="56" rx="14" fill="#F4F7FA" stroke={INK} strokeWidth={SW} />
          <path d="M-236 682 H-10 V694 Q-10 706 -24 706 H-222 Q-236 706 -236 694 Z" fill="#1D4F9C" stroke={INK} strokeWidth={SW} />
          <path d="M-236 678 H-10" stroke="#FFC857" strokeWidth="3" />
          <rect x="-226" y="656" width="200" height="20" rx="5" fill="#22405F" stroke={INK} strokeWidth="1.6" />
          {[-196, -164, -132, -100, -68].map((x) => <path key={x} d={`M${x} 656 V676`} stroke="#F4F7FA" strokeWidth="2.4" />)}
          {[-218, -186, -154, -122, -90, -58].map((x) => <path key={x} d={`M${x} 674 L${x + 10} 658`} stroke="#FFFFFF" strokeWidth="3" opacity="0.28" />)}
          {/* ніс */}
          <path d="M-26 656 Q-6 660 -6 686 L-10 696" stroke={INK} strokeWidth={SW} fill="none" />
          <circle cx="-17" cy="692" r="3.4" fill="#FFE38A" stroke={INK} strokeWidth="1.2" />
          <rect x="-60" y="644" width="36" height="9" rx="2" fill="#10233B" stroke={INK} strokeWidth="1.2" />
          <text x="-42" y="651.5" textAnchor="middle" fontSize="7.5" fontWeight="900" fill="#FFC857" fontFamily="Nunito, system-ui, sans-serif">52 RYNEK</text>
          {/* візки */}
          {[-206, -70].map((x) => (
            <g key={x}>
              <rect x={x} y="704" width="44" height="8" rx="3" fill="#2C3E57" />
              <circle cx={x + 10} cy="712" r="5" fill="#3A4A60" stroke={INK} strokeWidth="1.2" />
              <circle cx={x + 34} cy="712" r="5" fill="#3A4A60" stroke={INK} strokeWidth="1.2" />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

// ───────────── Площа, колії, голуби ─────────────

export const Plaza = memo(function Plaza() {
  return (
    <Layer className="sw-plaza">
      <defs>
        <linearGradient id="sw-cobble-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E6D2AE" /><stop offset="1" stopColor="#C7A97F" /></linearGradient>
        <pattern id="sw-cobble" width="22" height="12" patternUnits="userSpaceOnUse">
          <path d="M0 12 Q5.5 4 11 12 Q16.5 4 22 12" fill="none" stroke="#B4966C" strokeWidth="1.2" opacity="0.7" />
          <path d="M-11 6 Q-5.5 -2 0 6 Q5.5 -2 11 6 Q16.5 -2 22 6 Q27.5 -2 33 6" fill="none" stroke="#C9AE86" strokeWidth="1" opacity="0.6" />
        </pattern>
      </defs>
      <rect x="0" y="714" width="390" height="200" fill="url(#sw-cobble-bg)" />
      <rect x="0" y="714" width="390" height="200" fill="url(#sw-cobble)" />
      {/* колії */}
      <rect x="0" y="708" width="390" height="10" fill="#B89D78" />
      <path d="M0 710 H390 M0 716 H390" stroke="#7D6A52" strokeWidth="1.6" />
      <path d="M0 718 H390" stroke="#9E8463" strokeWidth="1" opacity="0.6" />
      {/* перспективні лінії плитки */}
      {[-200, -90, 20, 130, 240, 350, 460, 570].map((x) => <path key={x} d={`M195 716 L${(x - 195) * 1.5 + 195} 910`} stroke="#B4966C" strokeWidth="1" opacity="0.35" />)}
      {/* голуби */}
      {[[46, 760, 1], [76, 768, -1], [300, 772, 1]].map(([x, y, d], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${d} 1)`}>
          <ellipse cx="0" cy="0" rx="9" ry="6" fill="#9AA6B4" stroke={INK} strokeWidth="1.3" />
          <circle cx="8" cy="-5" r="4" fill="#8794A3" stroke={INK} strokeWidth="1.2" />
          <path d="M11 -5 l4 1 l-4 1 Z" fill="#E8A33A" />
          <path d="M-2 -2 Q-8 -4 -12 2" stroke="#6E7B8B" strokeWidth="1.6" fill="none" />
          <path d="M-2 6 V9 M2 6 V9" stroke="#E8A33A" strokeWidth="1.4" />
        </g>
      ))}
    </Layer>
  );
});

// ───────────── Кіоск з хот-догами + пара ─────────────

export const HotDogCart = memo(function HotDogCart() {
  return (
    <Layer className="sw-near">
      <defs>
        <clipPath id="sw-awning"><path d="M294 690 L398 690 L392 708 L300 708 Z" /></clipPath>
      </defs>
      <path d="M306 690 V730 M388 690 V730" stroke="#9AA3AD" strokeWidth="3" />
      <g clipPath="url(#sw-awning)">
        <rect x="290" y="688" width="112" height="22" fill="#FFFFFF" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => <rect key={i} x={292 + i * 16} y="688" width="8" height="22" fill="#E5383B" />)}
      </g>
      <path d="M294 690 L398 690 L392 708 L300 708 Z" fill="none" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${300 + i * 15.3} 708 a7.6 5 0 0 0 15.3 0`} fill={i % 2 ? '#FFFFFF' : '#E5383B'} stroke={INK} strokeWidth="1.4" />)}
      <rect x="298" y="726" width="98" height="6" rx="2" fill="#C9CED6" stroke={INK} strokeWidth="1.6" />
      <rect x="302" y="732" width="90" height="46" rx="6" fill="#FFFFFF" stroke={INK} strokeWidth={SW} />
      <rect x="307" y="737" width="80" height="18" rx="4" fill="#E5383B" stroke={INK} strokeWidth="1.4" />
      <text x="347" y="750.5" textAnchor="middle" fontSize="11.5" fontWeight="900" fill="#FFFFFF" fontFamily="Nunito, system-ui, sans-serif" letterSpacing="0.5">HOT-DOGI</text>
      <g transform="translate(347 767)">
        <path d="M-18 0 Q-18 -6 -10 -6 H10 Q18 -6 18 0 Q18 6 10 6 H-10 Q-18 6 -18 0 Z" fill="#F2B866" stroke={INK} strokeWidth="1.3" />
        <path d="M-21 -1 Q-21 -4 -16 -4 H16 Q21 -4 21 -1 Q21 2 16 2 H-16 Q-21 2 -21 -1 Z" fill="#C9472F" stroke={INK} strokeWidth="1.2" />
        <path d="M-14 -1 l3 -2 l3 2 l3 -2 l3 2 l3 -2 l3 2 l3 -2 l3 2" stroke="#FFD43B" strokeWidth="1.4" fill="none" />
      </g>
      {[318, 378].map((x) => (
        <g key={x}>
          <circle cx={x} cy="784" r="9" fill="#2A2F3A" stroke={INK} strokeWidth="1.6" />
          <circle cx={x} cy="784" r="3" fill="#9AA3AD" />
        </g>
      ))}
    </Layer>
  );
});

export function Steam() {
  return (
    <div className="absolute inset-0" aria-hidden>
      <svg viewBox={VB} preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
        <g transform={`translate(0 ${-LIFT})`}>
          {[312, 324, 336].map((x, i) => (
            <path key={x} className="sw-steam" style={{ animationDelay: `${i * 0.7}s` }} d={`M${x} 700 q-5 -8 0 -16 q5 -8 0 -16`} fill="none" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" />
          ))}
        </g>
      </svg>
    </div>
  );
}

// ───────────── Передній план: розмиті кущі ─────────────

export const Foreground = memo(function Foreground() {
  return (
    <Layer className="sw-front" lift={0}>
      <defs>
        <filter id="sw-blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3.2" /></filter>
      </defs>
      <g filter="url(#sw-blur)" opacity="0.96">
        <circle cx="-6" cy="824" r="52" fill="#2A7A45" />
        <circle cx="40" cy="846" r="40" fill="#35914F" />
        <circle cx="12" cy="790" r="26" fill="#3FA75A" />
        <circle cx="398" cy="826" r="50" fill="#2A7A45" />
        <circle cx="352" cy="848" r="38" fill="#35914F" />
        <circle cx="380" cy="796" r="24" fill="#3FA75A" />
        <circle cx="30" cy="812" r="5" fill="#FF8FA3" />
        <circle cx="362" cy="818" r="5" fill="#FFD43B" />
      </g>
    </Layer>
  );
});
