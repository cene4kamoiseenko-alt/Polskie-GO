/**
 * Міські сцени для банерів (viewBox 390×240, земля на y=210): у кожного міста курсу — свої впізнавані місця.
 *  Warszawa — Палац культури і науки, кам'яниці Старого Міста, сучасні вежі, пам'ятник Сирені.
 *  Wrocław — готична ратуша, кам'яниці зі ступінчастими фронтонами, Одра з мостом, бронзовий гномик.
 *  Łódź — вулиця Пйотрковська та червона цегла фабрики з високим комином.
 *  Katowice — «Spodek», нікішовецька цегла з червоними рамами, шахтний копер.
 *  Opole — П'ястівська вежа, ратуша з вежею, кольорові будинки над Млинівкою («Опольська Венеція»).
 * Решта міст — загальна вулиця з кам'яницями та їхньою пам'яткою.
 */
import { memo, type ReactNode } from 'react';
import { CITY_LANDMARKS, Landmark } from './Scenery';

const INK = '#1F2D47';
const GROUND = 210;

type Roof = 'flat' | 'attic' | 'gable' | 'stepped' | 'mansard';

/** Кам'яниця: фасад із вікнами (частина світиться), дах певного типу, легке світло зверху й тінь збоку. */
function Tenement({ x, w, h, color, roof = 'flat', trim = '#F4EAD8', lit = 0, cols, arch }: { x: number; w: number; h: number; color: string; roof?: Roof; trim?: string; lit?: number; cols?: number; arch?: boolean }) {
  const top = GROUND - h;
  const n = cols ?? Math.max(2, Math.round(w / 17));
  const rows = Math.max(2, Math.floor((h - 26) / 21));
  const gap = w / n;
  const roofEl: ReactNode = (() => {
    switch (roof) {
      case 'gable':
        return <path d={`M${x - 2} ${top} L${x + w / 2} ${top - w * 0.42} L${x + w + 2} ${top} Z`} fill="#B5533C" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />;
      case 'stepped': {
        const s = w / 6;
        const st = 9;
        return (
          <path
            d={`M${x} ${top} V${top - st} H${x + s} V${top - 2 * st} H${x + 2 * s} V${top - 3 * st} H${x + 4 * s} V${top - 2 * st} H${x + 5 * s} V${top - st} H${x + w} V${top} Z`}
            fill={color}
            stroke={INK}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        );
      }
      case 'attic':
        return (
          <g stroke={INK} strokeWidth="1.4" strokeLinejoin="round">
            <rect x={x - 1} y={top - 9} width={w + 2} height="9" fill={trim} />
            {Array.from({ length: Math.max(2, Math.round(w / 14)) }, (_, i) => {
              const cx = x + 6 + (i * (w - 12)) / Math.max(1, Math.round(w / 14) - 1);
              return <path key={i} d={`M${cx - 3} ${top - 9} L${cx} ${top - 16} L${cx + 3} ${top - 9} Z`} fill={trim} />;
            })}
          </g>
        );
      case 'mansard':
        return <path d={`M${x - 2} ${top} L${x + 6} ${top - 14} H${x + w - 6} L${x + w + 2} ${top} Z`} fill="#4A5A72" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />;
      default:
        return <rect x={x - 2} y={top - 5} width={w + 4} height="6" rx="1" fill={trim} stroke={INK} strokeWidth="1.4" />;
    }
  })();
  return (
    <g>
      {roof !== 'stepped' && roofEl}
      <rect x={x} y={top} width={w} height={h} fill={color} stroke={INK} strokeWidth="1.5" />
      {roof === 'stepped' && roofEl}
      <rect x={x} y={top} width={w} height={h} fill="url(#cs-facade)" />
      <rect x={x + w * 0.78} y={top} width={w * 0.22} height={h} fill="#0B1830" opacity="0.12" />
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: n }, (_, c) => {
          const wx = x + gap * c + gap / 2 - 4;
          const wy = top + 10 + r * 21;
          const on = (r * 3 + c * 5 + Math.round(x)) % 7 < lit;
          return arch ? (
            <path key={`${r}-${c}`} d={`M${wx} ${wy + 13} V${wy + 4} Q${wx + 4} ${wy - 1} ${wx + 8} ${wy + 4} V${wy + 13} Z`} fill={on ? '#FFD983' : '#CFE6F5'} stroke={INK} strokeWidth="1.1" />
          ) : (
            <rect key={`${r}-${c}`} x={wx} y={wy} width="8" height="12" rx="1" fill={on ? '#FFD983' : '#CFE6F5'} stroke={INK} strokeWidth="1.1" />
          );
        }),
      )}
      <rect x={x + w / 2 - 5} y={GROUND - 16} width="10" height="16" rx="5" fill="#6B4630" stroke={INK} strokeWidth="1.2" />
    </g>
  );
}

function Lamp({ x }: { x: number }) {
  return (
    <g stroke={INK} strokeWidth="1.4">
      <rect x={x - 1.5} y={GROUND - 46} width="3" height="46" fill="#2E3D57" />
      <path d={`M${x - 6} ${GROUND - 46} h12 l-2 -9 h-8 z`} fill="#FFE29A" />
      <circle cx={x} cy={GROUND - 50} r="14" fill="#FFE29A" opacity="0.18" stroke="none" />
    </g>
  );
}

function Tree({ x, s = 1 }: { x: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${GROUND}) scale(${s})`} stroke={INK} strokeWidth="1.4">
      <rect x="-2.5" y="-22" width="5" height="22" fill="#7A5232" />
      <circle cx="0" cy="-34" r="16" fill="#46B76E" />
      <circle cx="-9" cy="-28" r="10" fill="#3DA862" />
      <circle cx="6" cy="-42" r="7" fill="#7DD38F" stroke="none" opacity="0.6" />
    </g>
  );
}

function Cobbles({ color = '#CDB894' }: { color?: string }) {
  return (
    <g>
      <rect x="0" y={GROUND} width="390" height="40" fill={color} />
      <path d={`M0 ${GROUND} H390`} stroke={INK} strokeWidth="1.6" />
      {Array.from({ length: 26 }, (_, i) => (
        <ellipse key={i} cx={(i * 31) % 390 + 8} cy={GROUND + 9 + (i % 3) * 9} rx="9" ry="3" fill="#000" opacity="0.07" />
      ))}
    </g>
  );
}

function Water({ y = GROUND + 4, x = 0, w = 390 }: { y?: number; x?: number; w?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={240 - y} fill="url(#cs-water)" />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${x + 10 + i * 24} ${y + 8 + i * 7} h${w * 0.18} M${x + w * 0.45 + i * 30} ${y + 12 + i * 6} h${w * 0.14}`} stroke="#fff" strokeWidth="1.6" opacity="0.45" strokeLinecap="round" />
      ))}
    </g>
  );
}

function SceneDefs() {
  return (
    <defs>
      <linearGradient id="cs-facade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
        <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
        <stop offset="1" stopColor="#0B1830" stopOpacity="0.14" />
      </linearGradient>
      <linearGradient id="cs-glass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#BFE0FA" />
        <stop offset="1" stopColor="#5C8CC4" />
      </linearGradient>
      <linearGradient id="cs-water" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#5DB6E8" />
        <stop offset="1" stopColor="#2E7DB8" />
      </linearGradient>
      <linearGradient id="cs-brick" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#C2553B" />
        <stop offset="1" stopColor="#8E3624" />
      </linearGradient>
      <linearGradient id="cs-bronze" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#D9A75A" />
        <stop offset="1" stopColor="#7E5426" />
      </linearGradient>
      <linearGradient id="cs-haze" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFE9C8" stopOpacity="0" />
        <stop offset="1" stopColor="#FFE9C8" stopOpacity="0.16" />
      </linearGradient>
      <linearGradient id="cs-far" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#A9C7E4" />
        <stop offset="1" stopColor="#D7E4EF" />
      </linearGradient>
    </defs>
  );
}

/** Далекий силует (світло-сірий, створює глибину). */
function FarSkyline({ d }: { d: string }) {
  return <path d={d} fill="url(#cs-far)" opacity="0.85" />;
}

// ───────────────────────── Warszawa ─────────────────────────
function Warszawa() {
  return (
    <g>
      {/* сучасні вежі в центрі */}
      <g opacity="0.92" stroke={INK} strokeWidth="1.3">
        <path d="M318 210 V96 L330 84 L342 96 V210 Z" fill="url(#cs-glass)" />
        <path d="M330 84 V40" strokeWidth="1.6" />
        <rect x="346" y="110" width="26" height="100" fill="url(#cs-glass)" />
        <path d="M290 210 V124 Q300 112 312 124 V210 Z" fill="url(#cs-glass)" />
        {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M322 ${110 + i * 16} H338 M350 ${122 + i * 14} H368`} stroke="#fff" strokeOpacity="0.45" />)}
      </g>
      {/* Палац культури і науки */}
      <g stroke={INK} strokeWidth="1.5" strokeLinejoin="round">
        <rect x="196" y="140" width="96" height="70" fill="#E6D7B9" />
        <rect x="210" y="112" width="68" height="30" fill="#E9DCC0" />
        <rect x="222" y="80" width="44" height="34" fill="#ECE0C6" />
        <rect x="231" y="56" width="26" height="26" fill="#EFE4CC" />
        <path d="M236 56 L244 30 L252 56 Z" fill="#EFE4CC" />
        <path d="M244 30 V6" strokeWidth="1.8" />
        <circle cx="244" cy="68" r="5" fill="#FFF5DA" />
        <path d="M244 64 v4 l3 2" strokeWidth="1.1" />
        {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${204 + i * 16} 146 V206`} stroke="#B9A47E" strokeWidth="1.2" />)}
        {[0, 1, 2, 3].map((i) => <path key={i} d={`M${218 + i * 17} 118 V138`} stroke="#B9A47E" strokeWidth="1.1" />)}
        {[0, 1, 2].map((i) => <path key={i} d={`M${230 + i * 14} 86 V110`} stroke="#B9A47E" strokeWidth="1.1" />)}
      </g>
      {/* кам'яниці Старого Міста з аттиками */}
      <Tenement x={-6} w={44} h={92} color="#E9A93A" roof="attic" lit={2} />
      <Tenement x={38} w={38} h={104} color="#D65A4A" roof="attic" lit={2} />
      <Tenement x={76} w={42} h={88} color="#7DB57C" roof="attic" lit={1} />
      <Tenement x={118} w={36} h={98} color="#F1D06A" roof="attic" lit={2} />
      <Tenement x={154} w={40} h={84} color="#6FA8DC" roof="attic" lit={1} />
      <Cobbles />
      <Lamp x={182} />
      {/* пам'ятник Сирені: щит і шабля */}
      <g transform="translate(352 210)" stroke={INK} strokeWidth="1.5" strokeLinejoin="round">
        <rect x="-18" y="-24" width="36" height="24" rx="2" fill="#9AA6B2" />
        <rect x="-22" y="-28" width="44" height="6" rx="2" fill="#B7C1CB" />
        <path d="M-10 -28 C -14 -38 -4 -46 6 -42 C 14 -40 16 -32 10 -28 Z" fill="#3F5966" />
        <path d="M-2 -42 C -6 -54 -4 -64 0 -70 C 6 -64 8 -54 4 -42 Z" fill="#4C6A78" />
        <circle cx="1" cy="-75" r="5.5" fill="#4C6A78" />
        <path d="M4 -64 L18 -86" strokeWidth="2.6" stroke="#2F4550" />
        <path d="M17 -88 L22 -96" strokeWidth="1.6" stroke="#CFD8DF" />
        <ellipse cx="-9" cy="-56" rx="8" ry="10" fill="#5E7E8C" />
      </g>
      <Tree x={292} s={0.9} />
    </g>
  );
}

// ───────────────────────── Wrocław ─────────────────────────
function Wroclaw() {
  return (
    <g>
      {/* Острів Тумський: вежі собору вдалині */}
      <FarSkyline d="M300 210 V110 L306 70 L312 110 V120 H326 V110 L332 70 L338 110 V210 Z M250 210 V150 H290 V210 Z" />
      {/* готична ратуша */}
      <g stroke={INK} strokeWidth="1.5" strokeLinejoin="round">
        <path d="M150 210 V138 H258 V210 Z" fill="#D9C7A3" />
        <path d="M146 138 L204 104 L262 138 Z" fill="#5C6E86" />
        <path d="M180 138 V118 H192 V108 H204 V96 H216 V108 H228 V118 H240 V138 Z" fill="#E4D3AF" />
        <path d="M204 96 V82" />
        {[0, 1, 2].map((i) => <path key={i} d={`M${186 + i * 18} 124 v10`} stroke="#9C8763" />)}
        <rect x="160" y="104" width="18" height="34" fill="#D2BE97" />
        <path d="M158 104 L169 66 L180 104 Z" fill="#4E6078" />
        <path d="M169 66 V54" strokeWidth="1.8" />
        <circle cx="169" cy="114" r="5" fill="#F7EBCB" />
        {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${158 + i * 22} 158 v-10 q5 -6 10 0 v10 z`} fill="#CFE6F5" />)}
        {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${158 + i * 22} 186 v-10 q5 -6 10 0 v10 z`} fill={i % 2 ? '#FFD983' : '#CFE6F5'} />)}
      </g>
      {/* кам'яниці Ринку зі ступінчастими фронтонами */}
      <Tenement x={-4} w={42} h={96} color="#F0C24B" roof="stepped" lit={2} />
      <Tenement x={38} w={38} h={86} color="#8CC1E8" roof="stepped" lit={1} />
      <Tenement x={76} w={40} h={100} color="#E77B6E" roof="stepped" lit={2} />
      <Tenement x={116} w={34} h={80} color="#9ED18A" roof="gable" lit={1} />
      <Tenement x={262} w={38} h={84} color="#C99BD8" roof="stepped" lit={1} />
      <Cobbles color="#C9B28C" />
      {/* Одра з мостом Тумським */}
      <Water y={222} x={250} w={140} />
      <path d="M246 222 Q300 196 354 222" fill="none" stroke="#3E9C6B" strokeWidth="5" />
      <path d="M246 222 Q300 196 354 222" fill="none" stroke={INK} strokeWidth="1.2" />
      {[262, 280, 300, 320, 338].map((x) => <path key={x} d={`M${x} 222 V${215 - Math.abs(300 - x) * -0.05 - 6}`} stroke="#3E9C6B" strokeWidth="2" />)}
      {/* бронзовий гномик */}
      <g transform="translate(118 210)" stroke={INK} strokeWidth="1.3" strokeLinejoin="round">
        <ellipse cx="0" cy="-1" rx="12" ry="3" fill="#000" opacity="0.15" stroke="none" />
        <path d="M-8 0 V-12 Q-8 -20 0 -20 Q8 -20 8 -12 V0 Z" fill="url(#cs-bronze)" />
        <path d="M-7 -20 Q0 -10 7 -20 Q4 -12 0 -9 Q-4 -12 -7 -20 Z" fill="#E7C98E" />
        <circle cx="0" cy="-24" r="5" fill="url(#cs-bronze)" />
        <path d="M-6 -27 L1 -42 L6 -26 Z" fill="url(#cs-bronze)" />
        <path d="M8 -14 l6 -6" strokeWidth="2.2" stroke="#7E5426" />
      </g>
      <Lamp x={140} />
    </g>
  );
}

// ───────────────────────── Łódź ─────────────────────────
function Lodz() {
  return (
    <g>
      {/* фабрика з червоної цегли та комин */}
      <g stroke={INK} strokeWidth="1.5" strokeLinejoin="round">
        <path d="M332 210 V42 H346 V210 Z" fill="url(#cs-brick)" />
        {[60, 90, 120, 150].map((y) => <path key={y} d={`M332 ${y} H346`} stroke="#6E2A1A" strokeWidth="1.2" />)}
        <rect x="236" y="120" width="154" height="90" fill="url(#cs-brick)" />
        <path d="M236 120 h154" strokeWidth="2.6" stroke="#6E2A1A" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <g key={i}>
            <path d={`M${246 + i * 24} 166 v-22 q7 -9 14 0 v22 z`} fill={i % 2 ? '#FFD983' : '#CFE6F5'} />
            <path d={`M${246 + i * 24} 200 v-22 q7 -9 14 0 v22 z`} fill="#CFE6F5" />
          </g>
        ))}
        <path d="M236 120 L250 104 H304 L318 120" fill="#7A3122" />
      </g>
      {/* Пйотрковська: еклектичні кам'яниці */}
      <Tenement x={-4} w={46} h={112} color="#E8DCC6" roof="mansard" lit={2} arch />
      <Tenement x={42} w={44} h={100} color="#C8D6E2" roof="flat" lit={1} />
      <Tenement x={86} w={48} h={116} color="#F1C9A5" roof="mansard" lit={2} arch />
      <Tenement x={134} w={42} h={96} color="#B9D7B4" roof="flat" lit={1} />
      <Tenement x={176} w={56} h={106} color="#F3E2B3" roof="attic" lit={2} />
      <Cobbles color="#BFAF97" />
      {/* вивіска-неон на кам'яниці */}
      <g transform="translate(152 128)">
        <rect x="-16" y="-8" width="32" height="14" rx="4" fill="#24133E" stroke={INK} strokeWidth="1.2" />
        <path d="M-10 0 h6 M-1 -3 v6 M3 0 h7" stroke="#FF5AC8" strokeWidth="2" strokeLinecap="round" />
      </g>
      <Lamp x={64} />
      <Lamp x={214} />
      <Tree x={226} s={0.8} />
    </g>
  );
}

// ───────────────────────── Katowice ─────────────────────────
function Katowice() {
  return (
    <g>
      {/* шахтний копер */}
      <g stroke="#5E6E84" strokeWidth="2" fill="none" opacity="0.9">
        <path d="M28 210 L44 80 L60 210 M34 160 H54 M38 124 H50 M44 80 L74 150" />
        <circle cx="44" cy="80" r="9" />
        <circle cx="44" cy="80" r="3" fill="#5E6E84" />
      </g>
      {/* «Spodek» */}
      <g stroke={INK} strokeWidth="1.6" strokeLinejoin="round">
        <path d="M190 210 L214 166 M286 210 L262 166 M238 210 V170" stroke="#5B6A80" strokeWidth="4" />
        <ellipse cx="238" cy="160" rx="84" ry="14" fill="#9AA8B8" />
        <path d="M154 160 Q238 120 322 160 Q238 150 154 160 Z" fill="#C3CEDA" />
        <path d="M156 160 Q238 176 320 160 L322 160 Q238 186 154 160 Z" fill="#6E7E94" />
        <path d="M170 156 Q238 132 306 156" stroke="#fff" strokeOpacity="0.6" strokeWidth="2" fill="none" />
        <path d="M166 163 Q238 174 310 163" stroke="#FFD983" strokeWidth="2.4" fill="none" />
      </g>
      {/* Нікішовець: цегла з червоними рамами вікон */}
      {[[-4, 50, 96], [46, 46, 88], [92, 48, 100]].map(([x, w, h], i) => (
        <g key={i} stroke={INK} strokeWidth="1.5">
          <rect x={x} y={GROUND - h} width={w} height={h} fill="url(#cs-brick)" />
          <path d={`M${x - 2} ${GROUND - h} L${x + w / 2} ${GROUND - h - 16} L${x + w + 2} ${GROUND - h} Z`} fill="#6E2A1A" />
          {Array.from({ length: 3 }, (_, r) => Array.from({ length: 3 }, (_, c) => (
            <rect key={`${r}${c}`} x={x + 7 + c * ((w - 14) / 3)} y={GROUND - h + 12 + r * 24} width="8" height="13" fill={(r + c + i) % 3 === 0 ? '#FFD983' : '#CFE6F5'} stroke="#D7262E" strokeWidth="1.8" />
          )))}
        </g>
      ))}
      <Tenement x={330} w={64} h={120} color="#2B3446" roof="flat" lit={3} />
      <Cobbles color="#B8B0A2" />
      <Tree x={150} s={0.85} />
      <Lamp x={318} />
    </g>
  );
}

// ───────────────────────── Opole ─────────────────────────
function Opole() {
  return (
    <g>
      {/* ратуша з вежею */}
      <g stroke={INK} strokeWidth="1.5" strokeLinejoin="round">
        <rect x="258" y="140" width="92" height="70" fill="#EADCC0" />
        <rect x="290" y="64" width="28" height="78" fill="#E3D2B0" />
        <path d="M288 64 h32 v-8 h-6 v4 h-5 v-4 h-6 v4 h-5 v-4 h-6 v4 h-4 z" fill="#E3D2B0" />
        <circle cx="304" cy="84" r="6" fill="#F7EBCB" />
        {[0, 1, 2, 3].map((i) => <path key={i} d={`M${266 + i * 22} 170 v-14 q5 -6 10 0 v14 z`} fill={i % 2 ? '#FFD983' : '#CFE6F5'} />)}
      </g>
      {/* П'ястівська вежа */}
      <g stroke={INK} strokeWidth="1.5" strokeLinejoin="round">
        <rect x="150" y="70" width="34" height="140" fill="#B8A588" />
        <rect x="150" y="70" width="34" height="140" fill="url(#cs-facade)" />
        <path d="M146 70 L167 22 L188 70 Z" fill="#7C5136" />
        {[96, 128, 160].map((y) => <rect key={y} x="163" y={y} width="8" height="12" rx="4" fill="#3A2F2A" />)}
        {[80, 110, 140, 170, 196].map((y) => <path key={y} d={`M150 ${y} H184`} stroke="#9A8668" strokeWidth="1" />)}
      </g>
      {/* «Опольська Венеція»: будинки над водою */}
      <Tenement x={-4} w={40} h={86} color="#F2B84B" roof="gable" lit={2} />
      <Tenement x={36} w={36} h={96} color="#E87C7C" roof="gable" lit={1} />
      <Tenement x={72} w={40} h={82} color="#8CC8E8" roof="gable" lit={2} />
      <Tenement x={112} w={34} h={90} color="#B6DD8E" roof="gable" lit={1} />
      <Cobbles color="#C9B794" />
      <Water y={214} x={0} w={150} />
      {[[-4, 40, '#F2B84B'], [36, 36, '#E87C7C'], [72, 40, '#8CC8E8'], [112, 34, '#B6DD8E']].map(([x, w, c]) => (
        <rect key={String(x)} x={Number(x)} y="216" width={Number(w)} height="18" fill={String(c)} opacity="0.28" />
      ))}
      <Tree x={226} s={0.9} />
      <Lamp x={250} />
    </g>
  );
}

// ───────────────────────── Інші міста ─────────────────────────
function Generic({ slug, color }: { slug: string; color: string }) {
  return (
    <g>
      <g transform="translate(250 196) scale(1.6)">
        <Landmark kind={CITY_LANDMARKS[slug] ?? 'townhall'} color={color} />
      </g>
      <Tenement x={-4} w={44} h={88} color="#F0C24B" roof="attic" lit={2} />
      <Tenement x={40} w={38} h={98} color="#E77B6E" roof="gable" lit={1} />
      <Tenement x={78} w={42} h={84} color="#8CC1E8" roof="attic" lit={2} />
      <Tenement x={120} w={36} h={92} color="#9ED18A" roof="flat" lit={1} />
      <Cobbles />
      <Tree x={176} s={0.9} />
      <Lamp x={198} />
    </g>
  );
}

const SCENES: Record<string, () => ReactNode> = { warszawa: Warszawa, wroclaw: Wroclaw, lodz: Lodz, katowice: Katowice, opole: Opole };

/** Шари міста поверх неба (без неба та вказівника). */
export const CityLayers = memo(function CityLayers({ slug, color }: { slug: string; color: string }) {
  const Scene = SCENES[slug];
  return (
    <g>
      <SceneDefs />
      {/* дальній план міста — глибина сцени */}
      <FarSkyline d="M0 210 V150 H22 V132 H40 V146 H58 V120 L66 108 L74 120 V140 H96 V128 H118 V150 H140 V136 H160 V210 Z M160 210 V160 H200 V142 H226 V156 H260 V134 H284 V150 H312 V128 L320 116 L328 128 V146 H356 V138 H390 V210 Z" />
      {Scene ? <Scene /> : <Generic slug={slug} color={color} />}
      <rect x="0" y="150" width="390" height="62" fill="url(#cs-haze)" pointerEvents="none" />
    </g>
  );
});

export const hasCityScene = (slug: string) => slug in SCENES;
