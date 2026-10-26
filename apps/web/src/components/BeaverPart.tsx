/**
 * Векторні значки предметів гардероба (картки магазину). ТИМЧАСОВО: етап M2 ADR-005 замінює їх сценою костюма
 * або карткою «скоро». На Бобеку ці деталі не малюються: персонаж — лише живописний образ (Beaver.tsx, resolveLook).
 * Векторного тіла Бобека тут немає і бути не повинно.
 */
import { memo, useLayoutEffect, useRef, useState } from 'react';

const C = {
  /** М'який контур темно-коричневого кольору (не чорний). */
  line: '#5A321A',
};
const LW = 2.6;

/** Градієнти предметів. Ідентифікатори однакові в усіх екземплярах — вміст ідентичний. */
function Defs() {
  return (
    <defs>
      <linearGradient id="bv-hoodie" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FF6B70" />
        <stop offset="1" stopColor="#D83A44" />
      </linearGradient>
      <linearGradient id="bv-pack" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#3FC79A" />
        <stop offset="1" stopColor="#1F8F6E" />
      </linearGradient>
    </defs>
  );
}

/** Рюкзак (корпус). */
function Backpack({ kind }: { kind?: string }) {
  if (kind === 'none') return null;
  const map = kind === 'backpack-map';
  const fill = map ? '#F2994A' : 'url(#bv-pack)';
  const dark = map ? '#C8742E' : '#1C7F62';
  return (
    <g>
      <rect x="112" y="112" width="58" height="80" rx="20" fill={fill} stroke={C.line} strokeWidth={LW} />
      <rect x="146" y="140" width="22" height="34" rx="9" fill={dark} opacity="0.55" />
      <path d="M118 124 Q141 112 164 124 L164 136 Q141 128 118 136 Z" fill={dark} opacity="0.5" />
      {map && <rect x="150" y="90" width="13" height="36" rx="5" fill="#FFF2C8" stroke="#E0A42F" strokeWidth="2" transform="rotate(14 156 108)" />}
    </g>
  );
}

function Scarf({ kind }: { kind?: string }) {
  const colors: Record<string, [string, string]> = {
    'scarf-pl': ['#FFFFFF', '#E5484D'],
    'scarf-ua': ['#3A7BD5', '#FFD43B'],
    'scarf-green': ['#45C486', '#2FA56C'],
  };
  const [a, b] = colors[kind ?? ''] ?? ['#45C486', '#2FA56C'];
  return (
    <g>
      <path d="M112 132 Q122 140 124 170 L110 172 Q106 150 102 138 Z" fill={a} stroke={C.line} strokeWidth="2" />
      <path d="M106 154 L122 154 L123 162 L108 163 Z" fill={b} />
      <path d="M58 118 Q100 142 142 118 L145 132 Q100 158 55 132 Z" fill={a} stroke={C.line} strokeWidth="2" />
      <path d="M57 125 Q100 150 143 125 L145 132 Q100 158 55 132 Z" fill={b} />
    </g>
  );
}

function Shoes({ kind }: { kind?: string }) {
  if (kind === 'sneakers-white') {
    return (
      <g>
        <path d="M62 204 Q62 194 78 194 L94 198 Q98 208 90 212 L66 212 Q60 212 62 204 Z" fill="#fff" stroke="#C9D0D8" strokeWidth="2" />
        <path d="M138 204 Q138 194 122 194 L106 198 Q102 208 110 212 L134 212 Q140 212 138 204 Z" fill="#fff" stroke="#C9D0D8" strokeWidth="2" />
        <path d="M68 205 L90 205 M132 205 L110 205" stroke="#35C88A" strokeWidth="3" />
      </g>
    );
  }
  if (kind === 'boots-mountain') {
    return (
      <g>
        <path d="M64 190 L86 190 L92 202 Q96 212 86 213 L64 213 Q58 211 60 202 Z" fill="#7A4A2A" />
        <path d="M136 190 L114 190 L108 202 Q104 212 114 213 L136 213 Q142 211 140 202 Z" fill="#7A4A2A" />
        <path d="M62 209 L92 209 M138 209 L108 209" stroke="#3B2416" strokeWidth="4" />
      </g>
    );
  }
  return null;
}

function Jacket({ kind }: { kind?: string }) {
  if (!kind) return null;
  const base = 'M60 138 C 60 118, 78 112, 100 112 C 122 112, 140 118, 140 138 L 146 186 C 146 198, 126 206, 100 206 C 74 206, 54 198, 54 186 Z';
  if (kind === 'hoodie-red') {
    return (
      <g>
        <path d={base} fill="url(#bv-hoodie)" stroke={C.line} strokeWidth={LW} strokeLinejoin="round" />
        {/* складки тканини */}
        <path d="M70 150 Q74 170 70 188 M132 148 Q128 168 133 188" stroke="#B82A36" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.55" />
        {/* кишеня-кенгуру */}
        <path d="M74 178 Q100 170 126 178 L128 194 Q100 200 72 194 Z" fill="#C93441" stroke="#A3222F" strokeWidth="1.6" strokeLinejoin="round" />
        {/* резинка внизу */}
        <path d="M55 188 Q100 206 145 188 L146 194 Q100 212 54 194 Z" fill="#C42F3C" stroke={C.line} strokeWidth="2" strokeLinejoin="round" />
        <path d="M66 196 l0 4 M78 199 l0 4 M90 201 l0 4 M110 201 l0 4 M122 199 l0 4 M134 196 l0 4" stroke="#9E1F2C" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
        {/* капюшон, складений позаду шиї */}
        <path d="M60 128 Q100 152 140 128 Q142 110 100 104 Q58 110 60 128 Z" fill="#E03E48" stroke={C.line} strokeWidth={LW} strokeLinejoin="round" />
        <path d="M74 124 Q100 140 126 124 Q118 114 100 112 Q82 114 74 124 Z" fill="#A82634" />
        <path d="M66 126 Q100 146 134 126" stroke="#FF8A8F" strokeWidth="2" fill="none" opacity="0.6" />
        {/* шнурки */}
        <path d="M92 138 Q90 148 89 158 M108 138 Q110 148 111 158" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" />
        <rect x="86.6" y="157" width="4.8" height="6" rx="1.6" fill="#F0F3F6" stroke="#C9D3DC" strokeWidth="1" />
        <rect x="108.6" y="157" width="4.8" height="6" rx="1.6" fill="#F0F3F6" stroke="#C9D3DC" strokeWidth="1" />
        {/* напис PL — як на фірмовому худі */}
        <text x="100" y="178" textAnchor="middle" fontSize="23" fontWeight="900" fontFamily="Nunito, sans-serif" fill="#fff" stroke="#B3202C" strokeWidth="1" paintOrder="stroke">PL</text>
        <path d="M64 142 Q70 134 78 132" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.35" fill="none" />
      </g>
    );
  }
  if (kind === 'jacket-denim') {
    return (
      <g>
        <path d={base} fill="#4A78B5" />
        <path d="M100 116 L100 204" stroke="#36598A" strokeWidth="2.5" />
        <path d="M66 150 L88 150 M112 150 L134 150" stroke="#36598A" strokeWidth="2" />
        <circle cx="96" cy="160" r="2" fill="#E8C66A" />
        <circle cx="96" cy="176" r="2" fill="#E8C66A" />
        <path d="M84 114 L100 132 L116 114" fill="#5B8BC9" stroke="#36598A" strokeWidth="2" />
      </g>
    );
  }
  if (kind === 'jacket-rain') {
    return (
      <g>
        <path d={base} fill="#FFC857" />
        <path d="M100 116 L100 204" stroke="#E0A42F" strokeWidth="2.5" />
        <circle cx="94" cy="148" r="2.5" fill="#E0A42F" />
        <circle cx="94" cy="166" r="2.5" fill="#E0A42F" />
        <circle cx="94" cy="184" r="2.5" fill="#E0A42F" />
      </g>
    );
  }
  if (kind === 'vest-krakowiak') {
    return (
      <g>
        <path d={base} fill="#F4F1EA" />
        <path d="M60 138 C 60 120, 76 113, 90 112 L 94 204 C 76 204, 54 198, 54 186 Z" fill="#1F3A68" />
        <path d="M140 138 C 140 120, 124 113, 110 112 L 106 204 C 124 204, 146 198, 146 186 Z" fill="#1F3A68" />
        {[150, 166, 182].map((y) => (
          <g key={y}>
            <circle cx="76" cy={y} r="3.5" fill="#E5484D" />
            <circle cx="124" cy={y} r="3.5" fill="#E5484D" />
            <circle cx="76" cy={y} r="1.4" fill="#FFC857" />
            <circle cx="124" cy={y} r="1.4" fill="#FFC857" />
          </g>
        ))}
        <path d="M90 112 L94 204 M110 112 L106 204" stroke="#E5484D" strokeWidth="2" />
      </g>
    );
  }
  return null;
}

function Costume({ kind }: { kind?: string }) {
  if (kind === 'costume-dragon') {
    return (
      <g>
        <path d="M58 138 C 58 116, 78 110, 100 110 C 122 110, 142 116, 142 138 L 148 188 C 148 200, 126 208, 100 208 C 74 208, 52 200, 52 188 Z" fill="#3DBE6A" />
        <ellipse cx="100" cy="168" rx="26" ry="30" fill="#BDEB9A" />
        {[150, 162, 174, 186].map((y) => (
          <path key={y} d={`M84 ${y} Q100 ${y + 4} 116 ${y}`} stroke="#8CCB6A" strokeWidth="2" fill="none" />
        ))}
      </g>
    );
  }
  const base = 'M60 138 C 60 118, 78 112, 100 112 C 122 112, 140 118, 140 138 L 146 186 C 146 198, 126 206, 100 206 C 74 206, 54 198, 54 186 Z';
  if (kind === 'costume-barista') {
    // Біла сорочка, зелений фартух з кавовим зерном, кишеня з олівцем.
    return (
      <g stroke={C.line} strokeLinejoin="round">
        <path d={base} fill="#F6F3EC" strokeWidth={LW} />
        <path d="M90 116 L100 128 L110 116" fill="none" strokeWidth="2" />
        <path d="M98 128 l2 10 l2 -10 z" fill="#D9762B" strokeWidth="1.4" />
        <path d="M68 146 Q100 138 132 146 L138 196 Q100 208 62 196 Z" fill="#2F7D4F" strokeWidth={LW} />
        <path d="M74 140 L70 120 M126 140 L130 120" stroke="#245F3C" strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="100" cy="166" rx="9" ry="11" fill="#E2C38F" strokeWidth="1.8" />
        <path d="M100 156 Q96 166 100 176" fill="none" stroke="#7A4E2A" strokeWidth="1.8" />
        <rect x="76" y="176" width="16" height="14" rx="3" fill="#245F3C" strokeWidth="1.6" />
        <path d="M80 176 l2 -10" stroke="#FFC857" strokeWidth="3" strokeLinecap="round" />
      </g>
    );
  }
  if (kind === 'costume-chef') {
    // Двобортний кітель кухаря з червоними ґудзиками і червона хустка.
    return (
      <g stroke={C.line} strokeLinejoin="round">
        <path d={base} fill="#FBF8F1" strokeWidth={LW} />
        <path d="M100 116 C 112 140, 112 170, 104 204" fill="none" stroke="#D9D2C3" strokeWidth="2" />
        {[146, 164, 182].map((y) => (
          <g key={y}>
            <circle cx="88" cy={y} r="3" fill="#E5484D" strokeWidth="1.2" />
            <circle cx="114" cy={y} r="3" fill="#E5484D" strokeWidth="1.2" />
          </g>
        ))}
        <path d="M80 118 Q100 134 120 118 L112 140 Q100 132 88 140 Z" fill="#E5484D" strokeWidth="2" />
      </g>
    );
  }
  if (kind === 'costume-conductor') {
    // Темно-синя форма провідника: золоті ґудзики, краватка, сумка через плече.
    return (
      <g stroke={C.line} strokeLinejoin="round">
        <path d={base} fill="#22356B" strokeWidth={LW} />
        <path d="M88 114 L100 134 L112 114 Z" fill="#F4F1EA" strokeWidth="1.6" />
        <path d="M100 126 l-4 8 l4 20 l4 -20 z" fill="#B8323A" strokeWidth="1.4" />
        {[150, 166, 182].map((y) => <circle key={y} cx="112" cy={y} r="3" fill="#FFC857" strokeWidth="1.2" />)}
        <path d="M60 140 L138 196" stroke="#7A4E2A" strokeWidth="6" strokeLinecap="round" />
        <rect x="118" y="182" width="26" height="20" rx="4" fill="#9A6236" strokeWidth="2" />
        <path d="M58 150 h14 M128 150 h14" stroke="#FFC857" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    );
  }
  if (kind === 'costume-krasnal') {
    // Вроцлавський гном: вишита червона камізелька, біла сорочка, пасок з пряжкою.
    return (
      <g stroke={C.line} strokeLinejoin="round">
        <path d={base} fill="#F6F3EC" strokeWidth={LW} />
        <path d="M60 138 C 60 120, 76 113, 90 112 L 94 204 C 76 204, 54 198, 54 186 Z" fill="#9C2430" strokeWidth="2" />
        <path d="M140 138 C 140 120, 124 113, 110 112 L 106 204 C 124 204, 146 198, 146 186 Z" fill="#9C2430" strokeWidth="2" />
        {[[72, 146], [80, 168], [126, 150], [120, 172]].map(([x, y]) => (
          <g key={`${x}${y}`} stroke="none">
            <circle cx={x} cy={y} r="3.4" fill="#FFC857" />
            <circle cx={x - 5} cy={y + 4} r="2" fill="#3DB565" />
            <circle cx={x + 5} cy={y + 4} r="2" fill="#69C7F4" />
          </g>
        ))}
        <path d="M56 184 Q100 196 144 184 L145 194 Q100 206 55 194 Z" fill="#5A3A22" strokeWidth="2" />
        <rect x="92" y="186" width="16" height="12" rx="2" fill="#FFC857" strokeWidth="1.6" />
      </g>
    );
  }
  if (kind === 'costume-artist') {
    // Блуза художника з плямами фарби і червоний шарф.
    return (
      <g stroke={C.line} strokeLinejoin="round">
        <path d={base} fill="#F3EAD7" strokeWidth={LW} />
        {[[74, 156, '#E5484D'], [124, 170, '#3A7BD5'], [88, 186, '#FFC857'], [116, 146, '#3DB565'], [132, 188, '#9D69FF']].map(([x, y, c]) => (
          <ellipse key={`${x}${y}`} cx={x as number} cy={y as number} rx="5" ry="3.6" fill={c as string} stroke="none" />
        ))}
        <path d="M70 120 Q100 138 130 120 L132 132 Q100 150 68 132 Z" fill="#D7303F" strokeWidth="2" />
        <path d="M112 136 l8 40 l-10 2 l-6 -38 z" fill="#C42A36" strokeWidth="2" />
      </g>
    );
  }
  if (kind === 'costume-winter') {
    // Бірюзовий пуховик з хутряним коміром і червоний шарф.
    return (
      <g stroke={C.line} strokeLinejoin="round">
        <path d={base} fill="#1F8F8A" strokeWidth={LW} />
        {[150, 168, 186].map((y) => <path key={y} d={`M58 ${y} Q100 ${y + 8} 142 ${y}`} fill="none" stroke="#16716D" strokeWidth="2" />)}
        <path d="M100 118 L100 204" stroke="#16716D" strokeWidth="2.5" />
        <path d="M62 128 Q80 108 100 118 Q120 108 138 128 Q120 136 100 128 Q80 136 62 128 Z" fill="#F4E6CC" strokeWidth="2" />
        <path d="M76 124 Q100 138 124 124 L124 134 Q100 148 76 134 Z" fill="#E5384B" strokeWidth="2" />
        <path d="M112 134 l6 32 l-9 2 l-5 -30 z" fill="#C42A36" strokeWidth="2" />
      </g>
    );
  }
  if (kind === 'costume-syrenka') {
    return (
      <g>
        <path d="M60 138 C 60 118, 78 112, 100 112 C 122 112, 140 118, 140 138 L 146 186 C 146 198, 126 206, 100 206 C 74 206, 54 198, 54 186 Z" fill="#2EC4B6" />
        {[130, 146, 162, 178, 194].map((y) =>
          [74, 88, 102, 116, 130].map((x) => <path key={`${x}${y}`} d={`M${x - 6} ${y} q6 6 12 0`} stroke="#1E9E92" strokeWidth="1.6" fill="none" />),
        )}
      </g>
    );
  }
  return null;
}

function CostumeHead({ kind }: { kind?: string }) {
  if (kind === 'costume-dragon') {
    return (
      <g>
        <path d="M44 74 C 44 30, 74 14, 100 14 C 126 14, 156 30, 156 74 L 150 70 C 148 40, 126 26, 100 26 C 74 26, 52 40, 50 70 Z" fill="#3DBE6A" />
        {[60, 80, 100, 120, 140].map((x, i) => (
          <path key={x} d={`M${x - 8} ${i === 2 ? 18 : 24} L${x} ${i === 2 ? 0 : 8} L${x + 8} ${i === 2 ? 18 : 24} Z`} fill="#FFC857" />
        ))}
        <circle cx="64" cy="34" r="5" fill="#fff" />
        <circle cx="136" cy="34" r="5" fill="#fff" />
        <circle cx="64" cy="34" r="2.5" fill="#243746" />
        <circle cx="136" cy="34" r="2.5" fill="#243746" />
      </g>
    );
  }
  if (kind === 'costume-chef') return <Hat kind="hat-chef" />;
  if (kind === 'costume-krasnal') return <Hat kind="hat-krasnal" />;
  if (kind === 'costume-conductor') {
    return (
      <g stroke={C.line} strokeLinejoin="round">
        <path d="M54 46 C 54 22, 78 12, 100 12 C 122 12, 146 22, 146 46 Z" fill="#22356B" strokeWidth="2.4" />
        <path d="M50 44 Q100 56 150 44 L150 52 Q100 64 50 52 Z" fill="#141F40" strokeWidth="2" />
        <path d="M62 52 Q100 66 138 52 Q132 62 100 66 Q68 62 62 52 Z" fill="#0E1730" strokeWidth="2" />
        <path d="M88 28 l12 -6 l12 6 l-12 6 z" fill="#FFC857" strokeWidth="1.6" />
        <path d="M78 28 h8 M114 28 h8" stroke="#FFC857" strokeWidth="2.4" strokeLinecap="round" />
      </g>
    );
  }
  if (kind === 'costume-artist') {
    return (
      <g stroke={C.line} strokeLinejoin="round">
        <ellipse cx="94" cy="30" rx="50" ry="18" fill="#D7303F" strokeWidth="2.4" transform="rotate(-10 94 30)" />
        <path d="M100 12 l2 -8" stroke={C.line} strokeWidth="3" strokeLinecap="round" />
        <path d="M60 30 Q90 40 128 22" fill="none" stroke="#FF7480" strokeWidth="2.4" opacity="0.6" />
      </g>
    );
  }
  if (kind === 'costume-winter') {
    return (
      <g stroke={C.line} strokeLinejoin="round">
        <path d="M54 52 C 54 18, 80 8, 100 8 C 120 8, 146 18, 146 52 Z" fill="#1F8F8A" strokeWidth="2.4" />
        <path d="M66 30 h68 M60 42 h80" stroke="#F4E6CC" strokeWidth="3" strokeDasharray="5 5" />
        <rect x="50" y="44" width="100" height="14" rx="7" fill="#16716D" strokeWidth="2" />
        <circle cx="100" cy="4" r="10" fill="#E5384B" strokeWidth="2" />
      </g>
    );
  }
  if (kind === 'costume-syrenka') {
    return (
      <g>
        <path d="M60 40 Q100 8 140 40" stroke="#FFC857" strokeWidth="6" fill="none" strokeLinecap="round" />
        <circle cx="100" cy="22" r="6" fill="#FFB4C6" />
        <circle cx="80" cy="28" r="4" fill="#fff" />
        <circle cx="120" cy="28" r="4" fill="#fff" />
      </g>
    );
  }
  return null;
}

function Hat({ kind }: { kind?: string }) {
  switch (kind) {
    case 'cap-green':
    case 'cap-red': {
      const c = kind === 'cap-green' ? '#45C486' : '#E5484D';
      const d = kind === 'cap-green' ? '#2FA56C' : '#B8323A';
      return (
        <g>
          <path d="M56 50 C 56 20, 80 10, 100 10 C 120 10, 144 20, 144 50 Z" fill={c} />
          <path d="M100 50 L 160 50 C 166 50, 166 58, 158 58 L 100 58 Z" fill={d} />
          <circle cx="100" cy="12" r="4" fill={d} />
          <path d="M100 12 L100 50" stroke={d} strokeWidth="1.5" opacity="0.5" />
        </g>
      );
    }
    case 'beanie-blue':
      return (
        <g>
          <path d="M54 52 C 54 18, 80 8, 100 8 C 120 8, 146 18, 146 52 Z" fill="#3A7BD5" />
          <rect x="50" y="44" width="100" height="14" rx="7" fill="#2C62B0" />
          <circle cx="100" cy="6" r="9" fill="#F4F1EA" />
        </g>
      );
    case 'hat-chef':
      return (
        <g>
          <rect x="66" y="30" width="68" height="22" rx="4" fill="#fff" stroke="#E2E2E2" strokeWidth="2" />
          <circle cx="76" cy="20" r="14" fill="#fff" />
          <circle cx="100" cy="12" r="17" fill="#fff" />
          <circle cx="124" cy="20" r="14" fill="#fff" />
        </g>
      );
    case 'hat-krasnal':
      return (
        <g>
          <path d="M56 50 L 112 -30 L 146 50 Z" fill="#E5484D" />
          <circle cx="112" cy="-30" r="7" fill="#FFC857" />
          <rect x="52" y="44" width="98" height="12" rx="6" fill="#B8323A" />
        </g>
      );
    case 'crown-gold':
      return (
        <g>
          <path d="M64 50 L 64 18 L 80 32 L 100 8 L 120 32 L 136 18 L 136 50 Z" fill="#FFC857" stroke="#E0A42F" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="100" cy="36" r="5" fill="#E5484D" />
          <circle cx="78" cy="42" r="3.5" fill="#69C7F4" />
          <circle cx="122" cy="42" r="3.5" fill="#69C7F4" />
        </g>
      );
    default:
      return null;
  }
}

function Glasses({ kind }: { kind?: string }) {
  if (kind === 'glasses-round') {
    return (
      <g fill="none" stroke="#243746" strokeWidth="3.5">
        <circle cx="80" cy="74" r="15" />
        <circle cx="120" cy="74" r="15" />
        <path d="M95 74 Q100 69 105 74" />
      </g>
    );
  }
  if (kind === 'glasses-sun') {
    return (
      <g>
        <path d="M62 66 L98 66 L94 86 Q80 92 66 86 Z" fill="#243746" />
        <path d="M102 66 L138 66 L134 86 Q120 92 106 86 Z" fill="#243746" />
        <path d="M98 68 L102 68" stroke="#243746" strokeWidth="4" />
        <path d="M70 70 L80 70" stroke="#fff" strokeWidth="2" opacity="0.6" />
        <path d="M110 70 L120 70" stroke="#fff" strokeWidth="2" opacity="0.6" />
      </g>
    );
  }
  if (kind === 'glasses-star') {
    const star = (cx: number) =>
      `M${cx} ${56} L${cx + 5} ${68} L${cx + 18} ${68} L${cx + 8} ${76} L${cx + 12} ${89} L${cx} ${81} L${cx - 12} ${89} L${cx - 8} ${76} L${cx - 18} ${68} L${cx - 5} ${68} Z`;
    return (
      <g>
        <path d={star(80)} fill="#FFC857" stroke="#E0A42F" strokeWidth="2" opacity="0.92" />
        <path d={star(120)} fill="#FFC857" stroke="#E0A42F" strokeWidth="2" opacity="0.92" />
      </g>
    );
  }
  return null;
}

function HandItem({ kind }: { kind?: string }) {
  switch (kind) {
    case 'flag-pl':
      return (
        <g transform="translate(160 96)">
          <rect x="-2" y="0" width="4" height="64" rx="2" fill="#8A552D" />
          <rect x="2" y="2" width="36" height="12" fill="#fff" stroke="#E2E2E2" />
          <rect x="2" y="14" width="36" height="12" fill="#E5484D" />
        </g>
      );
    case 'camera':
      return (
        <g transform="translate(150 140)">
          <rect x="0" y="0" width="34" height="24" rx="6" fill="#243746" />
          <circle cx="17" cy="12" r="8" fill="#69C7F4" stroke="#fff" strokeWidth="2" />
          <rect x="24" y="-4" width="8" height="5" rx="2" fill="#243746" />
        </g>
      );
    case 'map-paper':
      return (
        <g transform="translate(146 128) rotate(-10)">
          <path d="M0 0 L14 4 L28 0 L42 4 L42 34 L28 30 L14 34 L0 30 Z" fill="#FFF2C8" stroke="#E0A42F" strokeWidth="2" />
          <path d="M6 20 Q16 8 24 18 T38 12" stroke="#E5484D" strokeWidth="2" strokeDasharray="3 3" fill="none" />
        </g>
      );
    case 'obwarzanek':
      return (
        <g transform="translate(166 152)">
          <circle r="14" fill="none" stroke="#C8742E" strokeWidth="9" />
          <circle r="14" fill="none" stroke="#E8A65A" strokeWidth="3" strokeDasharray="4 4" />
        </g>
      );
    default:
      return null;
  }
}

/**
 * Значок предмета для картки гардероба (без бобра). Це не те, що з'явиться на персонажі: на Бобеку річ видно,
 * лише якщо в маніфесті образу є її живописний шар або цілісна картинка (resolveLook). viewBox — за межами малюнка.
 */
export const BeaverPart = memo(function BeaverPart({ slot, kind, size = 96 }: { slot: string; kind: string; size?: number }) {
  const ref = useRef<SVGGElement>(null);
  const [vb, setVb] = useState('-10 -40 220 260');
  useLayoutEffect(() => {
    const g = ref.current;
    if (!g) return;
    try {
      const b = g.getBBox();
      if (b.width > 0 && b.height > 0) {
        const side = Math.max(b.width, b.height) * 1.18;
        setVb(`${b.x + b.width / 2 - side / 2} ${b.y + b.height / 2 - side / 2} ${side} ${side}`);
      }
    } catch {
      /* getBBox недоступний (наприклад, у тестовому оточенні) — лишаємо загальний кадр */
    }
  }, [slot, kind]);
  const part =
    slot === 'HAT' ? <Hat kind={kind} />
    : slot === 'GLASSES' ? <Glasses kind={kind} />
    : slot === 'SCARF' ? <Scarf kind={kind} />
    : slot === 'JACKET' ? <Jacket kind={kind} />
    : slot === 'BACKPACK' ? <Backpack kind={kind} />
    : slot === 'SHOES' ? <Shoes kind={kind} />
    : slot === 'ACCESSORY' ? <HandItem kind={kind} />
    : slot === 'COSTUME' ? <><Costume kind={kind} /><CostumeHead kind={kind} /></>
    : slot === 'FRAME' ? <circle cx="100" cy="100" r="60" fill="none" stroke={kind === 'frame-gold' ? '#FFC857' : '#25D79B'} strokeWidth="14" />
    : null;
  return (
    <svg viewBox={vb} width={size} height={size} aria-hidden style={{ overflow: 'visible' }}>
      <Defs />
      <g ref={ref}>{part}</g>
    </svg>
  );
});
