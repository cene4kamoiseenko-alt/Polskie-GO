/**
 * Бобек — оригінальний маскот POLSKI GO (векторний SVG).
 * Шари: хвіст → тіло → одяг → голова → обличчя → головний убір → аксесуари.
 * Щоб замінити на Lottie/Rive, достатньо реалізувати той самий інтерфейс <Beaver mood outfit size />.
 */
import { motion, useReducedMotion } from 'framer-motion';
import { memo } from 'react';

export type BeaverMood = 'happy' | 'wave' | 'sad' | 'think' | 'celebrate' | 'sleep' | 'travel' | 'gift' | 'cheer' | 'surprised';
export type BeaverOutfit = Partial<Record<'HAT' | 'GLASSES' | 'SCARF' | 'JACKET' | 'BACKPACK' | 'SHOES' | 'ACCESSORY' | 'COSTUME' | 'FRAME', string>>;

const C = {
  fur: '#A86B3C',
  furDark: '#8A552D',
  belly: '#EECBA0',
  muzzle: '#F3D9B5',
  nose: '#3B2416',
  tail: '#6B4226',
  tailLine: '#5A361E',
  ear: '#E9A88A',
  pupil: '#2B1A10',
};

function Tail({ mermaid }: { mermaid?: boolean }) {
  if (mermaid) {
    return (
      <g>
        <path d="M128 176 C 160 170, 178 186, 172 204 C 186 196, 196 206, 192 214 C 178 214, 168 212, 160 206 C 150 204, 136 196, 128 176 Z" fill="#2EC4B6" />
        <path d="M140 186 q8 4 14 12 M150 184 q8 6 12 14" stroke="#1E9E92" strokeWidth="2" fill="none" />
      </g>
    );
  }
  return (
    <g transform="rotate(-28 150 188)">
      <ellipse cx="160" cy="190" rx="34" ry="17" fill={C.tail} />
      <path d="M134 184 L184 184 M132 192 L186 192 M138 199 L180 199 M146 178 L148 204 M160 175 L160 206 M174 178 L172 204" stroke={C.tailLine} strokeWidth="1.6" opacity="0.7" />
    </g>
  );
}

function Jacket({ kind }: { kind?: string }) {
  if (!kind) return null;
  const base = 'M60 138 C 60 118, 78 112, 100 112 C 122 112, 140 118, 140 138 L 146 186 C 146 198, 126 206, 100 206 C 74 206, 54 198, 54 186 Z';
  if (kind === 'hoodie-red') {
    return (
      <g>
        <path d={base} fill="#E5484D" />
        <path d="M70 186 Q100 196 130 186 L130 196 Q100 206 70 196 Z" fill="#C93A40" />
        <path d="M86 116 Q100 132 114 116" stroke="#C93A40" strokeWidth="4" fill="none" strokeLinecap="round" />
        <text x="100" y="160" textAnchor="middle" fontSize="20" fontWeight="900" fill="#fff" fontFamily="Nunito, sans-serif">PL</text>
        <line x1="92" y1="122" x2="90" y2="136" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        <line x1="108" y1="122" x2="110" y2="136" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
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

function Scarf({ kind }: { kind?: string }) {
  if (!kind) return null;
  const colors: Record<string, [string, string]> = {
    'scarf-pl': ['#FFFFFF', '#E5484D'],
    'scarf-ua': ['#3A7BD5', '#FFD43B'],
    'scarf-green': ['#45C486', '#2FA56C'],
  };
  const [a, b] = colors[kind] ?? ['#45C486', '#2FA56C'];
  return (
    <g>
      <path d="M62 120 Q100 138 138 120 L140 132 Q100 150 60 132 Z" fill={a} stroke="#00000014" />
      <path d="M61 126 Q100 144 139 126 L140 132 Q100 150 60 132 Z" fill={b} />
      <path d="M118 132 L124 170 L110 170 L108 136 Z" fill={a} stroke="#00000014" />
      <path d="M109 152 L123 152 L124 162 L110 162 Z" fill={b} />
    </g>
  );
}

function Backpack({ kind, front }: { kind?: string; front?: boolean }) {
  if (!kind) return null;
  const color = kind === 'backpack-map' ? '#F2994A' : '#45C486';
  const dark = kind === 'backpack-map' ? '#C8742E' : '#2FA56C';
  if (front) {
    return (
      <g stroke={dark} strokeWidth="6" strokeLinecap="round" fill="none">
        <path d="M72 120 Q66 150 70 182" />
        <path d="M128 120 Q134 150 130 182" />
      </g>
    );
  }
  return (
    <g>
      <rect x="40" y="122" width="120" height="70" rx="22" fill={color} />
      <rect x="44" y="150" width="20" height="30" rx="8" fill={dark} />
      <rect x="136" y="150" width="20" height="30" rx="8" fill={dark} />
      {kind === 'backpack-map' && (
        <g>
          <rect x="140" y="98" width="14" height="40" rx="5" fill="#FFF2C8" stroke="#E0A42F" strokeWidth="2" transform="rotate(14 147 118)" />
        </g>
      )}
    </g>
  );
}

function Shoes({ kind }: { kind?: string }) {
  if (kind === 'sneakers-white') {
    return (
      <g>
        <path d="M58 202 Q58 192 74 192 L92 196 Q96 206 88 210 L62 210 Q56 210 58 202 Z" fill="#fff" stroke="#D5D9DE" strokeWidth="2" />
        <path d="M142 202 Q142 192 126 192 L108 196 Q104 206 112 210 L138 210 Q144 210 142 202 Z" fill="#fff" stroke="#D5D9DE" strokeWidth="2" />
        <path d="M64 204 L88 204 M136 204 L112 204" stroke="#45C486" strokeWidth="3" />
      </g>
    );
  }
  if (kind === 'boots-mountain') {
    return (
      <g>
        <path d="M60 186 L84 186 L90 200 Q94 210 84 212 L60 212 Q54 210 56 200 Z" fill="#7A4A2A" />
        <path d="M140 186 L116 186 L110 200 Q106 210 116 212 L140 212 Q146 210 144 200 Z" fill="#7A4A2A" />
        <path d="M58 208 L90 208 M142 208 L110 208" stroke="#3B2416" strokeWidth="4" />
      </g>
    );
  }
  return (
    <g>
      <ellipse cx="76" cy="204" rx="17" ry="9" fill={C.tail} />
      <ellipse cx="124" cy="204" rx="17" ry="9" fill={C.tail} />
    </g>
  );
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

function Face({ mood }: { mood: BeaverMood }) {
  const closed = mood === 'sleep';
  const happyEyes = mood === 'celebrate' || mood === 'cheer';
  return (
    <g>
      {/* очі */}
      {closed ? (
        <g stroke={C.pupil} strokeWidth="3.5" strokeLinecap="round" fill="none">
          <path d="M70 76 Q80 82 90 76" />
          <path d="M110 76 Q120 82 130 76" />
        </g>
      ) : happyEyes ? (
        <g stroke={C.pupil} strokeWidth="4" strokeLinecap="round" fill="none">
          <path d="M70 78 Q80 66 90 78" />
          <path d="M110 78 Q120 66 130 78" />
        </g>
      ) : (
        <g className="beaver-eyes">
          <ellipse cx="80" cy="74" rx="11" ry={mood === 'surprised' ? 14 : 13} fill="#fff" />
          <ellipse cx="120" cy="74" rx="11" ry={mood === 'surprised' ? 14 : 13} fill="#fff" />
          <circle cx={mood === 'think' ? 84 : 81} cy={mood === 'think' ? 70 : 76} r="7" fill={C.pupil} />
          <circle cx={mood === 'think' ? 124 : 121} cy={mood === 'think' ? 70 : 76} r="7" fill={C.pupil} />
          <circle cx={mood === 'think' ? 86 : 83} cy={mood === 'think' ? 67 : 73} r="2.4" fill="#fff" />
          <circle cx={mood === 'think' ? 126 : 123} cy={mood === 'think' ? 67 : 73} r="2.4" fill="#fff" />
        </g>
      )}
      {/* брови */}
      {mood === 'sad' && (
        <g stroke={C.furDark} strokeWidth="3.5" strokeLinecap="round">
          <path d="M70 58 L88 54" />
          <path d="M130 58 L112 54" />
        </g>
      )}
      {mood === 'think' && (
        <g stroke={C.furDark} strokeWidth="3.5" strokeLinecap="round" fill="none">
          <path d="M70 56 Q80 50 90 56" />
          <path d="M110 52 Q120 48 130 54" />
        </g>
      )}
      {/* щічки */}
      <ellipse cx="64" cy="98" rx="9" ry="6" fill="#FF8FA3" opacity={mood === 'sad' ? 0.25 : 0.5} />
      <ellipse cx="136" cy="98" rx="9" ry="6" fill="#FF8FA3" opacity={mood === 'sad' ? 0.25 : 0.5} />
      {/* мордочка */}
      <ellipse cx="100" cy="104" rx="30" ry="22" fill={C.muzzle} />
      <ellipse cx="100" cy="92" rx="11" ry="7.5" fill={C.nose} />
      <ellipse cx="96" cy="89.5" rx="3.5" ry="2" fill="#fff" opacity="0.6" />
      {/* рот і зуби */}
      {mood === 'sad' ? (
        <g>
          <path d="M88 114 Q100 106 112 114" stroke={C.nose} strokeWidth="3" fill="none" strokeLinecap="round" />
          <rect x="94" y="110" width="12" height="9" rx="2.5" fill="#fff" stroke="#E6DED2" />
        </g>
      ) : mood === 'surprised' ? (
        <g>
          <ellipse cx="100" cy="114" rx="7" ry="8" fill="#7A2E2E" />
          <rect x="94" y="104" width="12" height="8" rx="2" fill="#fff" />
        </g>
      ) : mood === 'sleep' ? (
        <path d="M92 108 Q100 112 108 108" stroke={C.nose} strokeWidth="3" fill="none" strokeLinecap="round" />
      ) : (
        <g>
          <path d="M80 102 Q100 122 120 102" stroke={C.nose} strokeWidth="3" fill={mood === 'celebrate' || mood === 'cheer' ? '#7A2E2E' : 'none'} strokeLinecap="round" />
          <rect x="92" y="102" width="16" height="13" rx="3" fill="#fff" stroke="#E6DED2" />
          <path d="M100 102 L100 115" stroke="#E6DED2" strokeWidth="1.5" />
        </g>
      )}
    </g>
  );
}

function Effects({ mood }: { mood: BeaverMood }) {
  if (mood === 'sleep') {
    return (
      <g fill="#69C7F4" fontWeight="900" fontFamily="Nunito, sans-serif">
        <text x="146" y="44" fontSize="18">z</text>
        <text x="158" y="28" fontSize="24">Z</text>
      </g>
    );
  }
  if (mood === 'sad') return <path d="M146 60 Q152 70 146 76 Q140 70 146 60 Z" fill="#69C7F4" />;
  if (mood === 'celebrate' || mood === 'cheer') {
    return (
      <g>
        {[
          [30, 40, '#FFC857'],
          [170, 36, '#45C486'],
          [24, 110, '#E5484D'],
          [178, 96, '#69C7F4'],
        ].map(([x, y, c]) => (
          <path key={`${x}`} d={`M${x} ${Number(y) - 8} L${Number(x) + 2.5} ${Number(y) - 2.5} L${Number(x) + 8} ${y} L${Number(x) + 2.5} ${Number(y) + 2.5} L${x} ${Number(y) + 8} L${Number(x) - 2.5} ${Number(y) + 2.5} L${Number(x) - 8} ${y} L${Number(x) - 2.5} ${Number(y) - 2.5} Z`} fill={String(c)} />
        ))}
      </g>
    );
  }
  if (mood === 'think') {
    return (
      <g>
        <circle cx="160" cy="40" r="5" fill="#fff" stroke="#D5D9DE" strokeWidth="2" />
        <circle cx="172" cy="24" r="8" fill="#fff" stroke="#D5D9DE" strokeWidth="2" />
        <text x="166" y="29" fontSize="11" fontWeight="900" fill="#243746">?</text>
      </g>
    );
  }
  if (mood === 'gift') {
    return (
      <g transform="translate(120 150)">
        <rect x="0" y="0" width="40" height="32" rx="4" fill="#E5484D" />
        <rect x="16" y="0" width="8" height="32" fill="#FFC857" />
        <rect x="-3" y="-8" width="46" height="10" rx="3" fill="#C93A40" />
        <path d="M20 -8 Q8 -22 4 -10 M20 -8 Q32 -22 36 -10" stroke="#FFC857" strokeWidth="4" fill="none" />
      </g>
    );
  }
  return null;
}

type Props = { mood?: BeaverMood; outfit?: BeaverOutfit; size?: number; className?: string; animate?: boolean };

export const Beaver = memo(function Beaver({ mood = 'happy', outfit = {}, size = 160, className, animate = true }: Props) {
  const reduce = useReducedMotion();
  const anim = animate && !reduce;
  const costume = outfit.COSTUME;
  const jacket = costume ? undefined : outfit.JACKET;
  const waving = mood === 'wave' || mood === 'cheer';
  const armsUp = mood === 'celebrate';

  const body = (
    <svg viewBox="-10 -40 220 260" width={size} height={size * (260 / 220)} className={className} aria-hidden>
      <Backpack kind={outfit.BACKPACK} />
      <Tail mermaid={costume === 'costume-syrenka'} />
      {/* тіло */}
      <ellipse cx="100" cy="160" rx="48" ry="50" fill={C.fur} />
      <ellipse cx="100" cy="168" rx="31" ry="35" fill={C.belly} />
      <Shoes kind={outfit.SHOES} />
      <Jacket kind={jacket} />
      <Costume kind={costume} />
      <Backpack kind={outfit.BACKPACK} front />
      <Scarf kind={outfit.SCARF} />
      {/* ліва лапа */}
      <motion.g
        style={{ originX: '62px', originY: '130px' }}
        animate={anim && armsUp ? { rotate: [0, -18, 0] } : { rotate: 0 }}
        transition={{ repeat: Infinity, duration: 0.8 }}
      >
        <ellipse cx={armsUp ? 50 : 54} cy={armsUp ? 124 : 158} rx="11" ry="21" fill={jacket === 'hoodie-red' ? '#E5484D' : costume === 'costume-dragon' ? '#3DBE6A' : C.fur} transform={armsUp ? 'rotate(38 50 124)' : 'rotate(18 54 158)'} />
        <circle cx={armsUp ? 38 : 50} cy={armsUp ? 106 : 176} r="8.5" fill={C.furDark} />
      </motion.g>
      {/* права лапа (махає) */}
      <motion.g
        style={{ originX: '138px', originY: '132px' }}
        animate={anim && (waving || armsUp) ? { rotate: [0, 16, -6, 16, 0] } : { rotate: 0 }}
        transition={{ repeat: Infinity, duration: 1.4, repeatDelay: 0.4 }}
      >
        <ellipse cx={waving || armsUp ? 150 : 146} cy={waving || armsUp ? 124 : 158} rx="11" ry="21" fill={jacket === 'hoodie-red' ? '#E5484D' : costume === 'costume-dragon' ? '#3DBE6A' : C.fur} transform={waving || armsUp ? 'rotate(-38 150 124)' : 'rotate(-18 146 158)'} />
        <circle cx={waving || armsUp ? 162 : 150} cy={waving || armsUp ? 106 : 176} r="8.5" fill={C.furDark} />
      </motion.g>
      <HandItem kind={outfit.ACCESSORY} />
      {/* голова */}
      <circle cx="58" cy="42" r="14" fill={C.fur} />
      <circle cx="142" cy="42" r="14" fill={C.fur} />
      <circle cx="58" cy="42" r="7.5" fill={C.ear} />
      <circle cx="142" cy="42" r="7.5" fill={C.ear} />
      <circle cx="100" cy="80" r="50" fill={C.fur} />
      <path d="M62 60 Q100 36 138 60" stroke={C.furDark} strokeWidth="3" fill="none" opacity="0.25" />
      <motion.g
        animate={anim && mood !== 'sleep' ? { scaleY: [1, 1, 0.1, 1] } : undefined}
        transition={{ repeat: Infinity, duration: 4, times: [0, 0.92, 0.96, 1] }}
        style={{ originY: '74px' }}
      >
        <Face mood={mood} />
      </motion.g>
      <CostumeHead kind={costume} />
      <Glasses kind={outfit.GLASSES} />
      {!costume && <Hat kind={outfit.HAT} />}
      <Effects mood={mood} />
    </svg>
  );

  if (!anim) return body;
  const idle =
    mood === 'celebrate' || mood === 'cheer'
      ? { y: [0, -14, 0], transition: { repeat: Infinity, duration: 0.7 } }
      : mood === 'sleep'
        ? { scale: [1, 1.02, 1], transition: { repeat: Infinity, duration: 3 } }
        : mood === 'sad'
          ? { rotate: [0, -2, 0], transition: { repeat: Infinity, duration: 2.4 } }
          : { y: [0, -4, 0], transition: { repeat: Infinity, duration: 2.6, ease: 'easeInOut' as const } };
  return (
    <motion.div className="inline-block" animate={idle} style={{ lineHeight: 0 }}>
      {body}
    </motion.div>
  );
});

/** Іконки предметів (тимчасові ассети — замінюються зображеннями з адмінки). */
export const ITEM_ICONS: Record<string, string> = {
  'hoodie-red': '🧥', 'jacket-denim': '🧥', 'jacket-rain': '🧥', 'vest-krakowiak': '🦺',
  'cap-green': '🧢', 'cap-red': '🧢', 'beanie-blue': '🧶', 'hat-chef': '👨‍🍳', 'hat-krasnal': '🎅', 'crown-gold': '👑',
  'glasses-round': '👓', 'glasses-sun': '🕶️', 'glasses-star': '🤩',
  'scarf-pl': '🧣', 'scarf-ua': '🧣', 'scarf-green': '🧣',
  'backpack-travel': '🎒', 'backpack-map': '🗺️',
  'sneakers-white': '👟', 'boots-mountain': '🥾',
  'flag-pl': '🇵🇱', camera: '📷', 'map-paper': '🗺️', obwarzanek: '🥯',
  'costume-dragon': '🐉', 'costume-syrenka': '🧜‍♀️',
  'bed-basic': '🛏️', 'bed-cozy': '🛌', desk: '🪑', bookshelf: '📚', sofa: '🛋️', lamp: '💡',
  plant: '🪴', 'rug-red': '🟥', 'poster-poland': '🖼️', 'map-wall': '🗺️',
  'souvenir-syrenka': '🧜‍♀️', 'souvenir-dragon': '🐲', 'souvenir-krasnal': '🧙‍♂️',
  'frame-green': '🟩', 'frame-gold': '🟨',
};
