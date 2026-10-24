/**
 * Бобек — оригінальний маскот POLSKI GO (векторний SVG).
 * Шари: хвіст → тіло → одяг → голова → обличчя → головний убір → аксесуари.
 * Щоб замінити на Lottie/Rive, достатньо реалізувати той самий інтерфейс <Beaver mood outfit size />.
 */
import { motion, useReducedMotion } from 'framer-motion';
import { memo } from 'react';
import { beaverAsset } from '../lib/assets';

/**
 * 14 станів: привітання (wave), радість (happy/cheer), перемога (celebrate), підтримка після помилки (sad),
 * здивування (surprised), читання (read), подорож з картою (travel), сон (sleep), навчання (learn),
 * нагорода (gift), королівський Premium (royal), очікування уроку (wait), роздуми (think).
 */
export type BeaverMood = 'happy' | 'wave' | 'sad' | 'think' | 'celebrate' | 'sleep' | 'travel' | 'gift' | 'cheer' | 'surprised' | 'read' | 'learn' | 'royal' | 'wait';
export type BeaverOutfit = Partial<Record<'HAT' | 'GLASSES' | 'SCARF' | 'JACKET' | 'BACKPACK' | 'SHOES' | 'ACCESSORY' | 'COSTUME' | 'FRAME', string>>;

const C = {
  fur: 'url(#bv-fur)',
  furFlat: '#A9683A',
  furDark: '#7E4A26',
  belly: 'url(#bv-belly)',
  muzzle: 'url(#bv-muzzle)',
  nose: '#2E1A0E',
  tail: 'url(#bv-tail)',
  tailLine: '#4A2C17',
  ear: '#F0A98F',
  pupil: '#1F120A',
  /** Мультяшний контур, як у 3D-ілюстраціях: темно-коричневий, не чорний. */
  line: '#4A2A14',
};
const LW = 3;

/** Градієнти «об'ємного» стилю. Ідентифікатори однакові в усіх екземплярах — вміст ідентичний. */
function Defs() {
  return (
    <defs>
      <radialGradient id="bv-fur" cx="40%" cy="30%" r="75%">
        <stop offset="0" stopColor="#D49563" />
        <stop offset="0.55" stopColor="#A9683A" />
        <stop offset="1" stopColor="#7E4A26" />
      </radialGradient>
      <radialGradient id="bv-belly" cx="45%" cy="30%" r="80%">
        <stop offset="0" stopColor="#FFF1DC" />
        <stop offset="1" stopColor="#E7BE8E" />
      </radialGradient>
      <radialGradient id="bv-muzzle" cx="50%" cy="25%" r="80%">
        <stop offset="0" stopColor="#FFF4E3" />
        <stop offset="1" stopColor="#EBC79B" />
      </radialGradient>
      <linearGradient id="bv-tail" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#8A5530" />
        <stop offset="1" stopColor="#4F2E17" />
      </linearGradient>
      <linearGradient id="bv-hoodie" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FF5F66" />
        <stop offset="1" stopColor="#C42A36" />
      </linearGradient>
      <radialGradient id="bv-iris" cx="45%" cy="40%" r="60%">
        <stop offset="0" stopColor="#8C5A2E" />
        <stop offset="1" stopColor="#3A2210" />
      </radialGradient>
      <radialGradient id="bv-shadow" cx="50%" cy="50%" r="50%">
        <stop offset="0" stopColor="#000" stopOpacity="0.28" />
        <stop offset="1" stopColor="#000" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

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
      <ellipse cx="160" cy="190" rx="36" ry="18" fill={C.tail} stroke={C.line} strokeWidth={LW} />
      <path d="M132 184 L186 184 M130 192 L188 192 M136 199 L182 199 M146 176 L148 205 M160 173 L160 207 M174 176 L172 205" stroke={C.tailLine} strokeWidth="1.8" opacity="0.6" />
      <ellipse cx="150" cy="182" rx="14" ry="4" fill="#fff" opacity="0.18" />
    </g>
  );
}

function Jacket({ kind }: { kind?: string }) {
  if (!kind) return null;
  const base = 'M60 138 C 60 118, 78 112, 100 112 C 122 112, 140 118, 140 138 L 146 186 C 146 198, 126 206, 100 206 C 74 206, 54 198, 54 186 Z';
  if (kind === 'hoodie-red') {
    return (
      <g>
        <path d={base} fill="url(#bv-hoodie)" stroke={C.line} strokeWidth={LW} strokeLinejoin="round" />
        {/* капюшон-комір */}
        <path d="M66 126 Q100 146 134 126 Q130 112 100 110 Q70 112 66 126 Z" fill="#E03E48" stroke={C.line} strokeWidth={LW} strokeLinejoin="round" />
        {/* кишеня */}
        <path d="M74 176 Q100 168 126 176 L128 196 Q100 202 72 196 Z" fill="#C93441" opacity="0.9" />
        {/* шнурки */}
        <path d="M91 132 L88 152 M109 132 L112 152" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        <circle cx="88" cy="154" r="2.6" fill="#fff" />
        <circle cx="112" cy="154" r="2.6" fill="#fff" />
        {/* білий орел-емблема */}
        <g transform="translate(100 160) scale(0.9)" fill="#fff">
          <path d="M0 -14 l3 3 l3 -4 l1 5 l-3 3 l2 3 l9 -6 l7 -1 l-3 4 l5 0 l-4 4 l4 1 l-6 3 l-6 0 l-3 4 l3 6 l-4 -1 l-3 3 l-2 -4 l-2 4 l-3 -3 l-4 1 l3 -6 l-3 -4 l-6 0 l-6 -3 l4 -1 l-4 -4 l5 0 l-3 -4 l7 1 l9 6 l2 -3 l-3 -3 l1 -5 l3 4 z" />
        </g>
        <path d="M64 140 Q70 132 78 130" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.35" fill="none" />
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
    <g stroke={C.line} strokeWidth={LW}>
      <ellipse cx="76" cy="204" rx="18" ry="10" fill="#6E3F20" />
      <ellipse cx="124" cy="204" rx="18" ry="10" fill="#6E3F20" />
      <path d="M66 204 l0 5 M74 205 l0 5 M126 205 l0 5 M134 204 l0 5" strokeWidth="2" />
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

function Eye({ cx, look, mood }: { cx: number; look: [number, number]; mood: BeaverMood }) {
  const ry = mood === 'surprised' ? 18 : 16;
  return (
    <g>
      <ellipse cx={cx} cy="72" rx="14" ry={ry} fill="#fff" stroke={C.line} strokeWidth={LW} />
      <circle cx={cx + look[0]} cy={74 + look[1]} r="9.5" fill="url(#bv-iris)" />
      <circle cx={cx + look[0]} cy={74 + look[1]} r="5.5" fill={C.pupil} />
      <circle cx={cx + look[0] + 3.5} cy={70 + look[1]} r="3.4" fill="#fff" />
      <circle cx={cx + look[0] - 3} cy={78 + look[1]} r="1.6" fill="#fff" opacity="0.8" />
    </g>
  );
}

function Face({ mood, blink }: { mood: BeaverMood; blink: boolean }) {
  const closed = mood === 'sleep';
  const happyEyes = mood === 'celebrate' || mood === 'cheer';
  const look: [number, number] = mood === 'think' || mood === 'wait' ? [3, -4] : mood === 'sad' || mood === 'read' ? [0, 4] : [1, 0];
  const brows: Record<string, [string, string]> = {
    sad: ['M66 52 Q76 50 90 56', 'M134 52 Q124 50 110 56'],
    think: ['M66 50 Q78 44 90 50', 'M110 46 Q122 40 134 46'],
    surprised: ['M66 46 Q78 38 90 46', 'M110 46 Q122 38 134 46'],
    default: ['M66 52 Q78 44 90 50', 'M110 50 Q122 44 134 52'],
  };
  const [bl, br] = brows[mood] ?? brows.default;
  return (
    <g>
      {/* очі */}
      {closed ? (
        <g stroke={C.line} strokeWidth="4" strokeLinecap="round" fill="none">
          <path d="M68 76 Q79 84 90 76" />
          <path d="M110 76 Q121 84 132 76" />
        </g>
      ) : happyEyes ? (
        <g stroke={C.line} strokeWidth="4.5" strokeLinecap="round" fill="none">
          <path d="M67 78 Q79 62 91 78" />
          <path d="M109 78 Q121 62 133 78" />
        </g>
      ) : (
        <motion.g
          className="beaver-eyes"
          animate={blink ? { scaleY: [1, 1, 0.1, 1] } : undefined}
          transition={{ repeat: Infinity, duration: 4, times: [0, 0.92, 0.96, 1] }}
          style={{ originY: '72px' }}
        >
          <Eye cx={79} look={look} mood={mood} />
          <Eye cx={121} look={look} mood={mood} />
        </motion.g>
      )}
      {/* брови */}
      {!closed && (
        <g stroke={C.furDark} strokeWidth="5" strokeLinecap="round" fill="none">
          <path d={bl} />
          <path d={br} />
        </g>
      )}
      {/* щічки */}
      <ellipse cx="60" cy="100" rx="10" ry="6.5" fill="#FF7E94" opacity={mood === 'sad' ? 0.25 : 0.55} />
      <ellipse cx="140" cy="100" rx="10" ry="6.5" fill="#FF7E94" opacity={mood === 'sad' ? 0.25 : 0.55} />
      {/* мордочка */}
      <ellipse cx="100" cy="104" rx="32" ry="23" fill={C.muzzle} stroke={C.line} strokeWidth={LW} />
      <path d="M78 102 l-10 -2 M78 107 l-10 1 M122 102 l10 -2 M122 107 l10 1" stroke={C.line} strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
      {/* ніс */}
      <path d="M88 90 Q100 82 112 90 Q110 99 100 101 Q90 99 88 90 Z" fill={C.nose} />
      <ellipse cx="95" cy="88.5" rx="4" ry="2.2" fill="#fff" opacity="0.65" />
      {/* рот і зуби */}
      {mood === 'sad' ? (
        <g>
          <path d="M86 117 Q100 107 114 117" stroke={C.line} strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <rect x="93" y="110" width="14" height="10" rx="3" fill="#fff" stroke={C.line} strokeWidth="2" />
        </g>
      ) : mood === 'surprised' ? (
        <g>
          <ellipse cx="100" cy="116" rx="8" ry="9" fill="#7A2430" stroke={C.line} strokeWidth="2.5" />
          <rect x="93" y="103" width="14" height="9" rx="2.5" fill="#fff" stroke={C.line} strokeWidth="2" />
        </g>
      ) : mood === 'sleep' ? (
        <path d="M92 110 Q100 115 108 110" stroke={C.line} strokeWidth="3" fill="none" strokeLinecap="round" />
      ) : (
        <g>
          {/* відкрита усмішка з язиком */}
          <path d="M76 101 Q100 136 124 101 Q100 110 76 101 Z" fill="#7A2430" stroke={C.line} strokeWidth="3" strokeLinejoin="round" />
          <path d="M88 118 Q100 128 112 118 Q100 112 88 118 Z" fill="#FF7E94" />
          <path d="M90 102 L90 117 Q90 120 93 120 L99 120 L99 103 Z M101 103 L101 120 L107 120 Q110 120 110 117 L110 102 Z" fill="#fff" stroke={C.line} strokeWidth="2" strokeLinejoin="round" />
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
  if (mood === 'read') {
    return (
      <g transform="translate(100 162)">
        <path d="M0 -4 Q-16 -12 -34 -8 L-34 16 Q-16 12 0 20 Z" fill="#fff" stroke="#4A2A14" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M0 -4 Q16 -12 34 -8 L34 16 Q16 12 0 20 Z" fill="#F8F3E6" stroke="#4A2A14" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M-28 -2 L-8 0 M-28 4 L-8 6 M8 0 L28 -2 M8 6 L28 4" stroke="#55BDF4" strokeWidth="2" strokeLinecap="round" />
        <rect x="-36" y="-10" width="72" height="4" rx="2" fill="#F45159" opacity="0.0" />
      </g>
    );
  }
  if (mood === 'learn') {
    return (
      <g>
        <g transform="translate(150 -6)">
          <rect x="0" y="0" width="52" height="34" rx="6" fill="#2F5D50" stroke="#4A2A14" strokeWidth="2.5" />
          <text x="26" y="23" textAnchor="middle" fontSize="16" fontWeight="900" fill="#fff" fontFamily="Nunito, sans-serif">a→ą</text>
        </g>
      </g>
    );
  }
  if (mood === 'wait') {
    return (
      <g transform="translate(160 30)">
        <circle r="17" fill="#fff" stroke="#4A2A14" strokeWidth="2.5" />
        <path d="M0 0 L0 -10 M0 0 L7 4" stroke="#F45159" strokeWidth="3" strokeLinecap="round" />
        <circle r="2" fill="#4A2A14" />
      </g>
    );
  }
  if (mood === 'royal') {
    return (
      <g>
        {[[34, 40], [170, 46], [26, 120], [176, 112]].map(([x, y]) => (
          <path key={`${x}`} d={`M${x} ${y - 9} L${x + 3} ${y - 3} L${x + 9} ${y} L${x + 3} ${y + 3} L${x} ${y + 9} L${x - 3} ${y + 3} L${x - 9} ${y} L${x - 3} ${y - 3} Z`} fill="#FFBD42" />
        ))}
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

type Props = {
  mood?: BeaverMood;
  outfit?: BeaverOutfit;
  size?: number;
  className?: string;
  animate?: boolean;
  /** Не використовувати растровий ассет (наприклад, у гардеробі, де видно одяг). */
  vectorOnly?: boolean;
};

export const Beaver = memo(function Beaver({ mood = 'happy', outfit = {}, size = 160, className, animate = true, vectorOnly }: Props) {
  const reduce = useReducedMotion();
  const anim = animate && !reduce;
  const raster = vectorOnly ? null : beaverAsset(mood);
  if (raster) {
    const img = <img src={raster} alt="" width={size} height={size * (260 / 220)} className={className} style={{ objectFit: 'contain' }} draggable={false} />;
    return anim ? (
      <motion.div className="inline-block" style={{ lineHeight: 0 }} animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 2.6 }}>
        {img}
      </motion.div>
    ) : (
      img
    );
  }
  const costume = outfit.COSTUME;
  const jacket = costume ? undefined : outfit.JACKET;
  const waving = mood === 'wave' || mood === 'cheer' || mood === 'learn';
  const armsUp = mood === 'celebrate';

  const body = (
    <svg viewBox="-10 -40 220 260" width={size} height={size * (260 / 220)} className={className} aria-hidden>
      <Defs />
      <ellipse cx="100" cy="214" rx="62" ry="9" fill="url(#bv-shadow)" />
      {mood === 'royal' && (
        <g>
          <path d="M44 118 Q100 96 156 118 L170 206 Q100 220 30 206 Z" fill="#C42A36" stroke="#4A2A14" strokeWidth={LW} strokeLinejoin="round" />
          <path d="M40 200 Q100 214 160 200 L162 212 Q100 226 38 212 Z" fill="#fff" stroke="#4A2A14" strokeWidth="2" />
          {[52, 72, 92, 112, 132, 150].map((x) => <circle key={x} cx={x} cy={207 + (x % 3)} r="2" fill="#22364A" />)}
        </g>
      )}
      <Backpack kind={mood === 'royal' ? undefined : outfit.BACKPACK} />
      <Tail mermaid={costume === 'costume-syrenka'} />
      {/* тіло */}
      <path d="M52 160 C 50 122, 74 108, 100 108 C 126 108, 150 122, 148 160 C 147 196, 128 210, 100 210 C 72 210, 53 196, 52 160 Z" fill={C.fur} stroke={C.line} strokeWidth={LW} />
      <ellipse cx="100" cy="170" rx="31" ry="34" fill={C.belly} />
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
        <ellipse cx={armsUp ? 51 : 54} cy={armsUp ? 114 : 158} rx="12" ry="22" fill={jacket === 'hoodie-red' ? 'url(#bv-hoodie)' : costume === 'costume-dragon' ? '#3DBE6A' : C.fur} stroke={C.line} strokeWidth={LW} transform={armsUp ? 'rotate(-34 51 114)' : 'rotate(18 54 158)'} />
        <circle cx={armsUp ? 40 : 50} cy={armsUp ? 96 : 177} r="9.5" fill="#8A5530" stroke={C.line} strokeWidth={LW} />
      </motion.g>
      {/* права лапа (махає) */}
      <motion.g
        style={{ originX: '138px', originY: '132px' }}
        animate={anim && (waving || armsUp) ? { rotate: [0, 16, -6, 16, 0] } : { rotate: 0 }}
        transition={{ repeat: Infinity, duration: 1.4, repeatDelay: 0.4 }}
      >
        <ellipse cx={waving || armsUp ? 149 : 146} cy={waving || armsUp ? 114 : 158} rx="12" ry="22" fill={jacket === 'hoodie-red' ? 'url(#bv-hoodie)' : costume === 'costume-dragon' ? '#3DBE6A' : C.fur} stroke={C.line} strokeWidth={LW} transform={waving || armsUp ? 'rotate(34 149 114)' : 'rotate(-18 146 158)'} />
        <circle cx={waving || armsUp ? 160 : 150} cy={waving || armsUp ? 96 : 177} r="9.5" fill="#8A5530" stroke={C.line} strokeWidth={LW} />
      </motion.g>
      <HandItem kind={mood === 'travel' && !outfit.ACCESSORY ? 'map-paper' : mood === 'read' || mood === 'royal' ? undefined : outfit.ACCESSORY} />
      {/* голова */}
      <circle cx="56" cy="40" r="15" fill={C.fur} stroke={C.line} strokeWidth={LW} />
      <circle cx="144" cy="40" r="15" fill={C.fur} stroke={C.line} strokeWidth={LW} />
      <circle cx="56" cy="41" r="8" fill={C.ear} />
      <circle cx="144" cy="41" r="8" fill={C.ear} />
      {/* голова з пухнастими щоками */}
      <path d="M100 26 C 132 26, 154 46, 154 76 C 156 84, 162 88, 156 94 C 160 100, 154 104, 150 104 C 142 122, 122 132, 100 132 C 78 132, 58 122, 50 104 C 46 104, 40 100, 44 94 C 38 88, 44 84, 46 76 C 46 46, 68 26, 100 26 Z" fill={C.fur} stroke={C.line} strokeWidth={LW} strokeLinejoin="round" />
      <path d="M92 28 l4 -8 l4 7 l4 -6 l2 8" fill={C.furFlat} stroke={C.line} strokeWidth="2.5" strokeLinejoin="round" />
      <ellipse cx="78" cy="44" rx="18" ry="8" fill="#fff" opacity="0.14" transform="rotate(-20 78 44)" />
      <Face mood={mood} blink={anim && mood !== 'sleep'} />
      <CostumeHead kind={costume} />
      <Glasses kind={outfit.GLASSES} />
      {!costume && <Hat kind={mood === 'royal' ? 'crown-gold' : outfit.HAT} />}
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
