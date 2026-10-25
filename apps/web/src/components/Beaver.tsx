/**
 * Бобек — маскот POLSKI GO (векторний SVG, 2.5D-стиль).
 * Фірмові деталі: кораловий шарф і бірюзово-зелений рюкзак мандрівника.
 * Усі стани мають однакові пропорції: змінюються лише вираз обличчя, лапи та ефекти.
 * Шари: рюкзак → хвіст → тіло → одяг → шарф → лапи → голова → обличчя → головний убір.
 * Растровий ассет (src/assets/beaver/<mood>.webp), якщо є, замінює лише фірмовий образ без іншого одягу.
 */
import { motion, useReducedMotion } from 'framer-motion';
import { memo, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { beaverAsset, costumeArt, supportsBeaverArt } from '../lib/assets';

/**
 * Стани: привітання (wave), правильна відповідь (cheer), підтримка після помилки (sad),
 * роздуми (think), урок пройдено (celebrate), нове місто (travel) та додаткові:
 * happy, surprised, read, learn, gift, royal, wait, sleep.
 */
export type BeaverMood = 'happy' | 'wave' | 'sad' | 'think' | 'celebrate' | 'sleep' | 'travel' | 'gift' | 'cheer' | 'surprised' | 'read' | 'learn' | 'royal' | 'wait' | 'explain' | 'music' | 'mic' | 'map';
export type BeaverOutfit = Partial<Record<'HAT' | 'GLASSES' | 'SCARF' | 'JACKET' | 'BACKPACK' | 'SHOES' | 'ACCESSORY' | 'COSTUME' | 'FRAME', string>>;

const C = {
  fur: 'url(#bv-fur)',
  furFlat: '#B57444',
  furDark: '#8A532C',
  belly: 'url(#bv-belly)',
  muzzle: 'url(#bv-muzzle)',
  nose: '#3A2214',
  tail: 'url(#bv-tail)',
  tailLine: '#3E2414',
  ear: '#F2A38C',
  paw: '#9A5D33',
  /** М'який контур темно-коричневого кольору (не чорний). */
  line: '#5A321A',
};
const LW = 2.6;

/** Градієнти. Ідентифікатори однакові в усіх екземплярах — вміст ідентичний. */
function Defs() {
  return (
    <defs>
      <radialGradient id="bv-fur" cx="38%" cy="28%" r="80%">
        <stop offset="0" stopColor="#DDA26F" />
        <stop offset="0.5" stopColor="#B87747" />
        <stop offset="1" stopColor="#8A532C" />
      </radialGradient>
      <radialGradient id="bv-belly" cx="45%" cy="30%" r="80%">
        <stop offset="0" stopColor="#FFF4E2" />
        <stop offset="1" stopColor="#EBC596" />
      </radialGradient>
      <radialGradient id="bv-muzzle" cx="50%" cy="25%" r="85%">
        <stop offset="0" stopColor="#FFF7EA" />
        <stop offset="1" stopColor="#EECBA0" />
      </radialGradient>
      <linearGradient id="bv-tail" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#7A4726" />
        <stop offset="1" stopColor="#4A2A15" />
      </linearGradient>
      <linearGradient id="bv-hoodie" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FF6B70" />
        <stop offset="1" stopColor="#D83A44" />
      </linearGradient>
      <linearGradient id="bv-scarf" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FF7468" />
        <stop offset="1" stopColor="#E2433F" />
      </linearGradient>
      <linearGradient id="bv-cap" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FF6B74" />
        <stop offset="1" stopColor="#E23A48" />
      </linearGradient>
      <linearGradient id="bv-pack" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#3FC79A" />
        <stop offset="1" stopColor="#1F8F6E" />
      </linearGradient>
      <radialGradient id="bv-iris" cx="50%" cy="62%" r="62%">
        <stop offset="0" stopColor="#1C0E06" />
        <stop offset="0.55" stopColor="#2E180B" />
        <stop offset="0.85" stopColor="#6B3D20" />
        <stop offset="1" stopColor="#8E5530" />
      </radialGradient>
      {/* Об'єм: м'яка тінь знизу-праворуч поверх хутра й одягу (світло зверху-ліворуч). */}
      <radialGradient id="bv-shade" cx="34%" cy="22%" r="88%">
        <stop offset="0" stopColor="#3B1A08" stopOpacity="0" />
        <stop offset="0.58" stopColor="#3B1A08" stopOpacity="0" />
        <stop offset="1" stopColor="#3B1A08" stopOpacity="0.42" />
      </radialGradient>
      <radialGradient id="bv-glow" cx="30%" cy="18%" r="45%">
        <stop offset="0" stopColor="#FFF3DD" stopOpacity="0.38" />
        <stop offset="1" stopColor="#FFF3DD" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="bv-earin" cx="50%" cy="40%" r="60%">
        <stop offset="0" stopColor="#FFC2B0" />
        <stop offset="1" stopColor="#E98A73" />
      </radialGradient>
      <clipPath id="bv-head-clip"><path d="M100 24 C 135 24, 158 46, 158 78 C 158 90, 162 94, 156 100 C 150 120, 128 134, 100 134 C 72 134, 50 120, 44 100 C 38 94, 42 90, 42 78 C 42 46, 65 24, 100 24 Z" /></clipPath>
      <clipPath id="bv-body-clip"><path d="M58 152 C 56 120, 78 106, 100 106 C 122 106, 144 120, 142 152 C 144 190, 126 212, 100 212 C 74 212, 56 190, 58 152 Z" /><path d="M60 138 C 60 118, 78 112, 100 112 C 122 112, 140 118, 140 138 L 146 186 C 146 198, 126 206, 100 206 C 74 206, 54 198, 54 186 Z" /></clipPath>
      <radialGradient id="bv-shadow" cx="50%" cy="50%" r="50%">
        <stop offset="0" stopColor="#5A321A" stopOpacity="0.25" />
        <stop offset="1" stopColor="#5A321A" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

/** Пласкій хвіст-весло з лусочками — позаду ліворуч. */
function Tail({ mermaid }: { mermaid?: boolean }) {
  if (mermaid) {
    return (
      <g>
        <path d="M70 186 C 40 178, 18 190, 22 208 C 8 202, -2 210, 2 218 C 18 218, 30 214, 40 208 C 52 206, 64 200, 70 186 Z" fill="#2EC4B6" stroke={C.line} strokeWidth={LW} />
      </g>
    );
  }
  return (
    <g transform="rotate(24 34 188)">
      <ellipse cx="34" cy="188" rx="32" ry="17" fill={C.tail} stroke={C.line} strokeWidth={LW} />
      <g stroke={C.tailLine} strokeWidth="1.6" opacity="0.55" fill="none">
        <path d="M8 182 L60 182 M5 190 L63 190 M10 198 L58 198" />
        <path d="M20 173 L20 204 M34 171 L34 205 M48 173 L48 204" />
      </g>
      <ellipse cx="26" cy="180" rx="12" ry="3.5" fill="#fff" opacity="0.2" />
    </g>
  );
}

/** Рюкзак мандрівника (фірмовий бірюзовий або з гардероба): корпус позаду, лямки спереду. */
function Backpack({ kind, front }: { kind?: string; front?: boolean }) {
  if (kind === 'none') return null;
  const map = kind === 'backpack-map';
  const fill = map ? '#F2994A' : 'url(#bv-pack)';
  const dark = map ? '#C8742E' : '#1C7F62';
  if (front) {
    return (
      <g>
        <path d="M70 122 Q62 150 68 184" stroke={dark} strokeWidth="7" strokeLinecap="round" fill="none" />
        <path d="M130 122 Q138 150 132 184" stroke={dark} strokeWidth="7" strokeLinecap="round" fill="none" />
        <rect x="63" y="150" width="11" height="8" rx="2.5" fill="#FFD27A" stroke={C.line} strokeWidth="1.5" />
        <rect x="126" y="150" width="11" height="8" rx="2.5" fill="#FFD27A" stroke={C.line} strokeWidth="1.5" />
      </g>
    );
  }
  return (
    <g>
      <rect x="112" y="112" width="58" height="80" rx="20" fill={fill} stroke={C.line} strokeWidth={LW} />
      <rect x="146" y="140" width="22" height="34" rx="9" fill={dark} opacity="0.55" />
      <path d="M118 124 Q141 112 164 124 L164 136 Q141 128 118 136 Z" fill={dark} opacity="0.5" />
      {map && <rect x="150" y="90" width="13" height="36" rx="5" fill="#FFF2C8" stroke="#E0A42F" strokeWidth="2" transform="rotate(14 156 108)" />}
    </g>
  );
}

/** Шарф: фірмовий кораловий за замовчуванням або предмет з гардероба. Кінець звисає праворуч. */
/** Кінчик шарфа, що легенько майорить на вітрі (заставка, «живий» режим). */
function Flutter({ on, children }: { on?: boolean; children: ReactNode }) {
  if (!on) return <g>{children}</g>;
  return (
    <motion.g style={{ transformBox: 'fill-box', transformOrigin: '30% 0%' }} animate={{ rotate: [0, -7, 2, -5, 0], skewY: [0, 3, -2, 2, 0] }} transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}>
      {children}
    </motion.g>
  );
}

function Scarf({ kind, flutter, label }: { kind?: string; flutter?: boolean; label?: boolean }) {
  const colors: Record<string, [string, string]> = {
    'scarf-pl': ['#FFFFFF', '#E5484D'],
    'scarf-ua': ['#3A7BD5', '#FFD43B'],
    'scarf-green': ['#45C486', '#2FA56C'],
  };
  if (!kind) {
    return (
      <g>
        <Flutter on={flutter}>
          <path d="M112 132 Q124 140 126 170 L112 172 Q108 150 104 138 Z" fill="url(#bv-scarf)" stroke={C.line} strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M112 166 L113 176 M117 165 L118 176 M122 165 L123 175" stroke="#E2433F" strokeWidth="2.6" strokeLinecap="round" />
          {label && <text x="116.5" y="160" textAnchor="middle" fontSize="8.5" fontWeight="900" fill="#fff" fontFamily="Nunito, system-ui, sans-serif" transform="rotate(-10 116.5 158)">PL</text>}
        </Flutter>
        <path d="M58 118 Q100 142 142 118 L145 132 Q100 158 55 132 Z" fill="url(#bv-scarf)" stroke={C.line} strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M60 126 Q100 148 140 126" stroke="#FFFFFF" strokeOpacity="0.35" strokeWidth="2.5" fill="none" />
        <ellipse cx="112" cy="138" rx="10" ry="8" fill="url(#bv-scarf)" stroke={C.line} strokeWidth="2" />
      </g>
    );
  }
  const [a, b] = colors[kind] ?? ['#45C486', '#2FA56C'];
  return (
    <g>
      <Flutter on={flutter}>
        <path d="M112 132 Q122 140 124 170 L110 172 Q106 150 102 138 Z" fill={a} stroke={C.line} strokeWidth="2" />
        <path d="M106 154 L122 154 L123 162 L108 163 Z" fill={b} />
      </Flutter>
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
  return (
    <g stroke={C.line} strokeWidth={LW}>
      <ellipse cx="80" cy="206" rx="16" ry="9" fill={C.paw} />
      <ellipse cx="120" cy="206" rx="16" ry="9" fill={C.paw} />
      <path d="M72 208 l0 4 M80 209 l0 4 M120 209 l0 4 M128 208 l0 4" strokeWidth="1.8" />
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
    // Фірмова червона кепка Бобека з білою емблемою (стилізований птах, не державний герб).
    case 'cap-signature':
      return (
        <g stroke={C.line} strokeWidth="2.4" strokeLinejoin="round">
          <path d="M58 44 C58 18 80 8 100 8 C120 8 142 18 142 44 Z" fill="url(#bv-cap)" />
          <path d="M70 40 C72 24 84 14 98 12" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="3" strokeLinecap="round" />
          <path d="M48 40 Q100 54 152 40 Q157 48 146 52 Q100 61 54 52 Q43 48 48 40 Z" fill="#D7303F" />
          <ellipse cx="100" cy="28" rx="11" ry="10" fill="#fff" strokeWidth="1.8" />
          <path d="M91 27 Q95 22 100 26 Q105 22 109 27 Q105 28 103 32 L100 35 L97 32 Q95 28 91 27 Z" fill="#E5484D" stroke="none" />
          <circle cx="100" cy="8.5" r="3.5" fill="#D7303F" strokeWidth="1.6" />
        </g>
      );
    case 'headphones':
      return (
        <g stroke={C.line} strokeWidth="2.4">
          <path d="M44 74 C44 26 156 26 156 74" fill="none" stroke="#2A62C9" strokeWidth="9" strokeLinecap="round" />
          <rect x="30" y="62" width="22" height="34" rx="10" fill="#FF4E5B" />
          <rect x="148" y="62" width="22" height="34" rx="10" fill="#FF4E5B" />
        </g>
      );
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

function Eye({ cx, look, mood }: { cx: number; look: [number, number]; mood: BeaverMood }) {
  const ry = mood === 'surprised' ? 17 : 15.8;
  return (
    <g>
      <ellipse cx={cx} cy="74" rx="13.2" ry={ry} fill="url(#bv-iris)" stroke="#2A140A" strokeWidth="2.2" />
      <path d={`M${cx - 8.5} ${80} Q${cx} ${88.5} ${cx + 8.5} ${80}`} stroke="#B87A4E" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.55" />
      <ellipse cx={cx + 3.6 + look[0]} cy={67.5 + look[1]} rx="5.4" ry="5" fill="#fff" />
      <circle cx={cx - 4 + look[0]} cy={80 + look[1]} r="2.2" fill="#fff" opacity="0.9" />
      <circle cx={cx - 5 + look[0]} cy={66 + look[1]} r="1.2" fill="#fff" opacity="0.75" />
    </g>
  );
}

function Face({ mood, blink }: { mood: BeaverMood; blink: boolean }) {
  const closed = mood === 'sleep';
  const happyEyes = mood === 'celebrate' || mood === 'cheer' || mood === 'music';
  const look: [number, number] = mood === 'think' || mood === 'wait' ? [1, -3] : mood === 'sad' || mood === 'read' ? [-1, 2] : mood === 'travel' ? [4, -3] : [0, 0];
  const brows: Partial<Record<BeaverMood, [string, string]>> = {
    sad: ['M66 54 Q76 50 88 55', 'M134 54 Q124 50 112 55'],
    think: ['M66 52 Q77 46 88 52', 'M112 48 Q123 42 134 48'],
    surprised: ['M66 48 Q77 41 88 48', 'M112 48 Q123 41 134 48'],
  };
  const brow = brows[mood];
  const open = mood === 'cheer' || mood === 'celebrate' || mood === 'wave' || mood === 'gift' || mood === 'explain' || mood === 'mic';
  return (
    <g>
      {closed ? (
        <g stroke={C.line} strokeWidth="3.6" strokeLinecap="round" fill="none">
          <path d="M67 77 Q78 84 89 77" />
          <path d="M111 77 Q122 84 133 77" />
        </g>
      ) : happyEyes ? (
        <g stroke={C.line} strokeWidth="4.2" strokeLinecap="round" fill="none">
          <path d="M66 79 Q78 63 90 79" />
          <path d="M110 79 Q122 63 134 79" />
        </g>
      ) : (
        <motion.g
          animate={blink ? { scaleY: [1, 1, 0.1, 1] } : undefined}
          transition={{ repeat: Infinity, duration: 4.2, times: [0, 0.93, 0.96, 1] }}
          style={{ originY: '74px' }}
        >
          <Eye cx={78} look={look} mood={mood} />
          <Eye cx={122} look={look} mood={mood} />
        </motion.g>
      )}
      {brow && (
        <g stroke={C.furDark} strokeWidth="3.6" strokeLinecap="round" fill="none">
          <path d={brow[0]} />
          <path d={brow[1]} />
        </g>
      )}
      {/* щічки */}
      <ellipse cx="60" cy="98" rx="9.5" ry="6" fill="#FF8C8C" opacity={mood === 'sad' ? 0.3 : 0.5} />
      <ellipse cx="140" cy="98" rx="9.5" ry="6" fill="#FF8C8C" opacity={mood === 'sad' ? 0.3 : 0.5} />
      {/* мордочка */}
      <ellipse cx="100" cy="104" rx="29" ry="21" fill={C.muzzle} stroke={C.line} strokeWidth={LW} />
      {/* ніс */}
      <path d="M90 92 Q100 85 110 92 Q109 100 100 102 Q91 100 90 92 Z" fill={C.nose} />
      <ellipse cx="96" cy="90.5" rx="3.6" ry="2" fill="#fff" opacity="0.6" />
      <path d="M100 102 L100 106" stroke={C.line} strokeWidth="2.2" strokeLinecap="round" />
      {/* рот і два характерні зуби */}
      {mood === 'surprised' ? (
        <g>
          <ellipse cx="100" cy="116" rx="7" ry="7.5" fill="#7A2C2C" stroke={C.line} strokeWidth="2" />
          <path d="M94 106 h12 v6 q0 2.5 -2.5 2.5 h-7 q-2.5 0 -2.5 -2.5z" fill="#fff" stroke={C.line} strokeWidth="1.8" />
        </g>
      ) : open ? (
        <g>
          <path d="M84 106 Q100 130 116 106 Q100 112 84 106 Z" fill="#7A2C2C" stroke={C.line} strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M92 119 Q100 125 108 119 Q100 115 92 119 Z" fill="#FF8A8A" />
          <path d="M93 107 h6.4 v9 q0 2 -2 2 h-2.4 q-2 0 -2 -2z M100.6 107 h6.4 v9 q0 2 -2 2 h-2.4 q-2 0 -2 -2z" fill="#fff" stroke={C.line} strokeWidth="1.6" strokeLinejoin="round" />
        </g>
      ) : (
        <g>
          <path d={mood === 'sad' ? 'M86 112 Q93 108 100 106 Q107 108 114 112' : 'M84 105 Q92 112 100 106 Q108 112 116 105'} stroke={C.line} strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path d="M93.5 106.5 h6 v8.5 q0 2 -2 2 h-2 q-2 0 -2 -2z M100.5 106.5 h6 v8.5 q0 2 -2 2 h-2 q-2 0 -2 -2z" fill="#fff" stroke={C.line} strokeWidth="1.6" strokeLinejoin="round" />
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
  if (mood === 'sad') {
    // Підтримка після помилки: сердечко, а не сльоза.
    return <path d="M160 52 c-6 -9 -20 -4 -14 7 l14 13 l14 -13 c6 -11 -8 -16 -14 -7z" fill="#F45159" stroke="#fff" strokeWidth="2.5" />;
  }
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
  if (mood === 'music') {
    return (
      <g fill="#80D4FF">
        <path d="M166 30 v18 a5 4 0 1 1 -3 -3.5 v-11 l10 -2 v14 a5 4 0 1 1 -3 -3.5 v-9z" />
        <path d="M24 58 v14 a4.5 3.5 0 1 1 -2.5 -3 v-11 l3 -1z" fill="#FFC44D" />
      </g>
    );
  }
  if (mood === 'mic') {
    return (
      <g>
        <g transform="translate(110 112) rotate(-20)">
          <rect x="-3.5" y="6" width="7" height="22" rx="3" fill="#3B4A5A" stroke={C.line} strokeWidth="2" />
          <circle cx="0" cy="0" r="9" fill="#A9B7C4" stroke={C.line} strokeWidth="2.2" />
          <path d="M-5 -3 h10 M-6 1 h12" stroke="#5B6B7A" strokeWidth="1.4" />
        </g>
        <path d="M140 92 q8 8 0 16 M148 86 q13 14 0 28" stroke="#80D4FF" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
    );
  }
  if (mood === 'explain') {
    return (
      <g stroke="#FFC44D" strokeWidth="3.5" strokeLinecap="round">
        <path d="M168 60 l10 -6 M172 74 h12 M166 46 l6 -9" />
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

/** Розгорнута карта маршруту з відміченим етапом (урок пройдено). */
function HeldMap() {
  return (
    <g>
      <path d="M58 146 L80 140 L100 146 L120 140 L142 146 L142 188 L120 182 L100 188 L80 182 L58 188 Z" fill="#FFF6E3" stroke={C.line} strokeWidth={LW} strokeLinejoin="round" />
      <path d="M80 140 V182 M100 146 V188 M120 140 V182" stroke="#E8D6B5" strokeWidth="1.6" />
      <path d="M66 176 Q78 160 92 168 T120 158 T136 152" stroke="#F45159" strokeWidth="2.6" strokeDasharray="4 4" fill="none" strokeLinecap="round" />
      <circle cx="66" cy="176" r="4" fill="#35C88A" stroke={C.line} strokeWidth="1.6" />
      <circle cx="104" cy="164" r="9" fill="#35C88A" stroke={C.line} strokeWidth="2" />
      <path d="M99.5 164.5 l3 3 l6 -6.5" stroke="#fff" strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="136" cy="152" r="4" fill="#fff" stroke={C.line} strokeWidth="1.6" />
    </g>
  );
}

/** Пам'ятка нового міста позаду праворуч і «слід» кроку вперед. */
function NewCityScene() {
  return (
    <g>
      <g transform="translate(152 52) scale(1.2)" stroke={C.line} strokeWidth="2" strokeLinejoin="round">
        <path d="M14 110 V40 L22 20 L30 40 V110 Z" fill="#F7C6A3" />
        <path d="M22 4 L22 20" />
        <path d="M17 52 h10 M17 70 h10 M17 88 h10" stroke="#B0764A" />
        <path d="M2 110 V70 L10 60 L18 70" fill="#FFDCC0" />
      </g>
      <path d="M182 44 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z" fill="#FFBD42" />
      <path d="M8 150 h22 M2 166 h20 M10 182 h18" stroke="#C9D3DC" strokeWidth="3.5" strokeLinecap="round" />
    </g>
  );
}

type Props = {
  mood?: BeaverMood;
  outfit?: BeaverOutfit;
  size?: number;
  className?: string;
  animate?: boolean;
  /** Не використовувати растровий ассет (наприклад, у гардеробі, де видно одяг). */
  vectorOnly?: boolean;
  /** «Живий» режим (заставка): хвіст помахує, шарф майорить, на шарфі напис PL. */
  lively?: boolean;
};

/** Колір рукавів костюма у векторному бобрі. */
const COSTUME_SLEEVE: Record<string, string> = {
  'costume-dragon': '#3DBE6A', 'costume-barista': '#F6F3EC', 'costume-chef': '#FBF8F1', 'costume-conductor': '#22356B',
  'costume-krasnal': '#F6F3EC', 'costume-artist': '#F3EAD7', 'costume-winter': '#1F8F8A',
};

type ArmPose = 'rest' | 'wave' | 'up' | 'chin' | 'heart' | 'hold' | 'salute' | 'map' | 'point';
const RAISED = new Set<ArmPose>(['wave', 'up', 'salute', 'point']);

function armPose(mood: BeaverMood): [ArmPose, ArmPose] {
  switch (mood) {
    case 'wave':
    case 'learn':
      return ['rest', 'wave'];
    // Правильна відповідь — коротка радість однією лапою.
    case 'cheer':
      return ['rest', 'up'];
    // Урок пройдено — тримає розгорнуту карту з відміченим етапом.
    case 'celebrate':
    case 'map':
      return ['map', 'map'];
    case 'think':
    case 'wait':
    case 'mic':
      return ['rest', 'chin'];
    // Пояснює: лапа піднята вбік, як вказівка.
    case 'explain':
      return ['rest', 'point'];
    case 'music':
      return ['rest', 'rest'];
    case 'sad':
      return ['heart', 'rest'];
    // Нове місто — крок уперед, лапа «козирком» над очима, погляд на пам'ятку.
    case 'travel':
      return ['rest', 'salute'];
    case 'gift':
    case 'read':
      return ['rest', 'hold'];
    default:
      return ['rest', 'rest'];
  }
}

/** Лапа: side −1 ліва, +1 права. Плече (66|134, 132). */
function Arm({ side, pose, sleeve, anim }: { side: -1 | 1; pose: ArmPose; sleeve: string; anim: boolean }) {
  const sx = 100 + side * 34;
  const geo: Record<ArmPose, { cx: number; cy: number; rot: number; px: number; py: number }> = {
    rest: { cx: sx + side * 6, cy: 156, rot: -side * 14, px: sx + side * 8, py: 174 },
    wave: { cx: sx + side * 24, cy: 112, rot: side * 30, px: sx + side * 34, py: 92 },
    up: { cx: sx + side * 24, cy: 108, rot: side * 22, px: sx + side * 31, py: 86 },
    chin: { cx: sx - side * 6, cy: 136, rot: side * 52, px: sx - side * 20, py: 124 },
    heart: { cx: sx - side * 4, cy: 150, rot: side * 48, px: sx - side * 16, py: 150 },
    hold: { cx: sx + side * 8, cy: 148, rot: -side * 34, px: sx + side * 16, py: 162 },
    salute: { cx: sx + side * 16, cy: 92, rot: -side * 18, px: sx + side * 8, py: 50 },
    map: { cx: sx - side * 4, cy: 150, rot: -side * 8, px: sx - side * 2, py: 168 },
    point: { cx: sx + side * 22, cy: 116, rot: side * 58, px: sx + side * 38, py: 104 },
  };
  const g = geo[pose];
  const moving = anim && (pose === 'wave' || pose === 'up');
  return (
    <motion.g
      style={{ originX: `${sx}px`, originY: '132px' }}
      animate={moving ? { rotate: pose === 'wave' ? [0, side * 14, -side * 4, side * 14, 0] : [0, side * 10, 0] } : { rotate: 0 }}
      transition={{ repeat: pose === 'wave' ? Infinity : 1, duration: pose === 'wave' ? 1.4 : 0.5, repeatDelay: pose === 'wave' ? 0.5 : 0 }}
    >
      <ellipse cx={g.cx} cy={g.cy} rx="11" ry="20" fill={sleeve} stroke={C.line} strokeWidth={LW} transform={`rotate(${g.rot} ${g.cx} ${g.cy})`} />
      <circle cx={g.px} cy={g.py} r="9" fill={C.paw} stroke={C.line} strokeWidth={LW} />
      <path d={`M${g.px - 3} ${g.py - 6} l0 4 M${g.px + 3} ${g.py - 6} l0 4`} stroke={C.line} strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
    </motion.g>
  );
}

export const Beaver = memo(function Beaver({ mood = 'happy', outfit = {}, size = 160, className, animate = true, vectorOnly, lively }: Props) {
  const reduce = useReducedMotion();
  const anim = animate && !reduce;
  // Растр — лише коли на малюнку є все вдягнене: фірмовий образ (поза за станом) або костюм цілком.
  const raster = vectorOnly ? null : (costumeArt(outfit) ?? (supportsBeaverArt(outfit) ? beaverAsset(mood) : null));
  if (raster) {
    // Зміна пози — коротке «перевтілення» (opacity + scale), без зміни розміру блока.
    const img = (
      <motion.img
        key={raster}
        src={raster}
        alt=""
        width={size}
        height={size * (260 / 220)}
        className={className}
        decoding="async"
        style={{ objectFit: 'contain' }}
        draggable={false}
        initial={anim ? { opacity: 0.35, scale: 0.94 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
      />
    );
    return anim ? (
      <motion.div className="inline-block" style={{ lineHeight: 0 }} animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 2.6 }}>
        {img}
      </motion.div>
    ) : (
      img
    );
  }
  const costume = outfit.COSTUME;
  // Фірмовий образ Бобека — червона худі «PL» (якщо інший одяг не вибрано).
  const jacket = costume || outfit.JACKET === 'none' ? undefined : (outfit.JACKET ?? 'hoodie-red');
  const sleeve = jacket === 'hoodie-red' ? 'url(#bv-hoodie)' : (costume && COSTUME_SLEEVE[costume]) || C.fur;
  const [leftPose, rightPose] = armPose(mood);
  const backpack = mood === 'royal' ? 'none' : outfit.BACKPACK;
  const handItem = mood === 'read' || mood === 'royal' || mood === 'travel' || mood === 'celebrate' || mood === 'map' ? undefined : outfit.ACCESSORY;

  const body = (
    <svg viewBox="-10 -40 220 260" width={size} height={size * (260 / 220)} className={className} aria-hidden>
      <Defs />
      <ellipse cx="100" cy="214" rx="64" ry="8" fill="url(#bv-shadow)" />
      {mood === 'royal' && (
        <g>
          <path d="M44 118 Q100 96 156 118 L170 206 Q100 220 30 206 Z" fill="#C42A36" stroke={C.line} strokeWidth={LW} strokeLinejoin="round" />
          <path d="M40 200 Q100 214 160 200 L162 212 Q100 226 38 212 Z" fill="#fff" stroke={C.line} strokeWidth="2" />
          {[52, 72, 92, 112, 132, 150].map((x) => <circle key={x} cx={x} cy={207 + (x % 3)} r="2" fill="#22364A" />)}
        </g>
      )}
      {mood === 'travel' && <NewCityScene />}
      <g transform={mood === 'travel' ? 'rotate(5 100 212) translate(-6 0)' : undefined}>
      <Backpack kind={backpack} />
      {lively && anim ? (
        <motion.g style={{ transformBox: 'fill-box', transformOrigin: '92% 30%' }} animate={{ rotate: [0, -9, 0, 6, 0] }} transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}>
          <Tail mermaid={costume === 'costume-syrenka'} />
        </motion.g>
      ) : (
        <Tail mermaid={costume === 'costume-syrenka'} />
      )}
      {/* тіло-«груша» */}
      <path d="M58 152 C 56 120, 78 106, 100 106 C 122 106, 144 120, 142 152 C 144 190, 126 212, 100 212 C 74 212, 56 190, 58 152 Z" fill={C.fur} stroke={C.line} strokeWidth={LW} />
      <ellipse cx="100" cy="170" rx="28" ry="32" fill={C.belly} />
      <Shoes kind={outfit.SHOES} />
      <Jacket kind={jacket} />
      <Costume kind={costume} />
      <Backpack kind={backpack} front />
      {mood !== 'royal' && (outfit.SCARF || (!costume && jacket !== 'hoodie-red')) && <Scarf kind={outfit.SCARF} flutter={lively && anim} label={lively && !outfit.SCARF} />}
      {(mood === 'celebrate' || mood === 'map') && <HeldMap />}
      {/* Опущені лапи — під головою, підняті — поверх (інакше їх ховає голова). */}
      {!RAISED.has(leftPose) && <Arm side={-1} pose={leftPose} sleeve={sleeve} anim={anim} />}
      {!RAISED.has(rightPose) && <Arm side={1} pose={rightPose} sleeve={sleeve} anim={anim} />}
      <HandItem kind={handItem} />
      {/* об'єм тулуба й тінь від голови */}
      <g clipPath="url(#bv-body-clip)" style={{ pointerEvents: 'none' }}>
        <rect x="50" y="104" width="100" height="112" fill="url(#bv-shade)" />
        <ellipse cx="100" cy="130" rx="46" ry="11" fill="#2A1206" opacity="0.2" />
      </g>
      {/* вушка */}
      <circle cx="54" cy="40" r="14" fill={C.fur} stroke={C.line} strokeWidth={LW} />
      <circle cx="146" cy="40" r="14" fill={C.fur} stroke={C.line} strokeWidth={LW} />
      <circle cx="55" cy="41" r="7.5" fill="url(#bv-earin)" />
      <circle cx="145" cy="41" r="7.5" fill="url(#bv-earin)" />
      {/* кругла голова з пухнастими щоками */}
      <path d="M100 24 C 135 24, 158 46, 158 78 C 158 90, 162 94, 156 100 C 150 120, 128 134, 100 134 C 72 134, 50 120, 44 100 C 38 94, 42 90, 42 78 C 42 46, 65 24, 100 24 Z" fill={C.fur} stroke={C.line} strokeWidth={LW} strokeLinejoin="round" />
      <path d="M93 26 q3 -9 7 -2 q4 -8 7 2" fill={C.furFlat} stroke={C.line} strokeWidth="2.2" strokeLinejoin="round" />
      <g clipPath="url(#bv-head-clip)">
        <rect x="36" y="20" width="128" height="118" fill="url(#bv-shade)" />
        <rect x="36" y="20" width="128" height="118" fill="url(#bv-glow)" />
        <path d="M152 56 C 160 72 160 92 152 106" stroke="#FFE3C2" strokeWidth="3.4" fill="none" strokeLinecap="round" opacity="0.5" />
      </g>
      {/* пухнасті щічки */}
      <path d="M45 96 l-6 3 5 2 -4 4 6 0" fill="none" stroke={C.line} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M155 96 l6 3 -5 2 4 4 -6 0" fill="none" stroke={C.line} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <ellipse cx="76" cy="44" rx="17" ry="7" fill="#fff" opacity="0.16" transform="rotate(-22 76 44)" />
      <Face mood={mood} blink={anim && mood !== 'sleep'} />
      {RAISED.has(leftPose) && <Arm side={-1} pose={leftPose} sleeve={sleeve} anim={anim} />}
      {RAISED.has(rightPose) && <Arm side={1} pose={rightPose} sleeve={sleeve} anim={anim} />}
      <CostumeHead kind={costume} />
      <Glasses kind={outfit.GLASSES} />
      {!costume && <Hat kind={mood === 'royal' ? 'crown-gold' : mood === 'music' ? 'headphones' : outfit.HAT} />}
      </g>
      <Effects mood={mood} />
    </svg>
  );

  if (!anim) return body;
  const idle =
    mood === 'cheer'
      ? { y: [0, -12, 0], transition: { duration: 0.5, ease: 'easeOut' as const } }
      : mood === 'celebrate'
        ? { y: [0, -10, 0, -5, 0], transition: { duration: 1.1 } }
        : mood === 'travel'
          ? { x: [-10, 0], transition: { duration: 0.6, ease: 'easeOut' as const } }
          : mood === 'sleep'
        ? { scale: [1, 1.02, 1], transition: { repeat: Infinity, duration: 3 } }
        : mood === 'sad'
          ? { rotate: [0, -1.5, 0], transition: { repeat: Infinity, duration: 2.6 } }
          : { y: [0, -3, 0], transition: { repeat: Infinity, duration: 2.8, ease: 'easeInOut' as const } };
  return (
    <motion.div className="inline-block" animate={idle} style={{ lineHeight: 0 }}>
      {body}
    </motion.div>
  );
});

/**
 * Предмет гардероба окремо від бобра — намальований тими самими деталями, що й на бобрі,
 * тож картка в гардеробі точно відповідає тому, що з'явиться на персонажі.
 * viewBox підбирається за реальними межами малюнка.
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
