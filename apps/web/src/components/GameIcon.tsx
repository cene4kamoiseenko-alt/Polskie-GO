/**
 * Бібліотека ігрових іконок POLSKI GO.
 * Єдиний стиль 2.5D: заокруглена плитка з градієнтом, нижній «бортик» для глибини, відблиск зліва зверху,
 * білий гліф з м'якою тінню. Однакове освітлення та щільність для всіх іконок.
 * Щоб замінити на растрові ассети — покладіть файл src/assets/icons/<name>.webp (див. assets.ts).
 */
import { memo, useId } from 'react';
import { iconAsset } from '../lib/assets';

export type IconName =
  | 'home' | 'map' | 'lessons' | 'dictionary' | 'ai' | 'grammar' | 'quests' | 'exam' | 'profile' | 'premium'
  | 'rewards' | 'settings' | 'wardrobe' | 'review' | 'mistakes' | 'timer' | 'speed' | 'house' | 'diary'
  | 'friends' | 'leaderboard' | 'star' | 'fire' | 'coin' | 'xp' | 'lock' | 'check' | 'mic' | 'story' | 'city';

/** Базовий колір плитки кожної іконки (з фірмової палітри). */
export const ICON_COLORS: Record<IconName, string> = {
  home: '#F45159', map: '#35C88A', lessons: '#55BDF4', dictionary: '#F45159', ai: '#9568F5', grammar: '#FFBD42',
  quests: '#F2884B', exam: '#35C88A', profile: '#55BDF4', premium: '#FFBD42', rewards: '#F45159', settings: '#7D8FA3',
  wardrobe: '#9568F5', review: '#55BDF4', mistakes: '#F45159', timer: '#35C88A', speed: '#FFBD42', house: '#F2884B',
  diary: '#B07A4A', friends: '#55BDF4', leaderboard: '#FFBD42', star: '#FFBD42', fire: '#F2884B', coin: '#FFBD42',
  xp: '#FFBD42', lock: '#9AA7B4', check: '#35C88A', mic: '#55BDF4', story: '#9568F5', city: '#35C88A',
};

const W = '#fff';

/** Гліфи у системі координат 48×48 (білі; акценти — кольором плитки). */
function Glyph({ name, accent }: { name: IconName; accent: string }) {
  switch (name) {
    case 'home':
      return <path d="M11 24 L24 12 L37 24 L33 24 L33 36 L27 36 L27 28.5 L21 28.5 L21 36 L15 36 L15 24 Z" fill={W} strokeLinejoin="round" />;
    case 'house':
      return (
        <g fill={W}>
          <path d="M11 25 L24 13 L37 25 Z" />
          <rect x="14" y="24" width="20" height="13" rx="2" />
          <rect x="30" y="14" width="4" height="8" rx="1" />
          <rect x="21" y="29" width="6" height="8" rx="1.5" fill={accent} />
        </g>
      );
    case 'map':
      return (
        <g>
          <path d="M10 15 L19 12 L29 15 L38 12 L38 33 L29 36 L19 33 L10 36 Z" fill={W} />
          <path d="M19 12 L19 33 M29 15 L29 36" stroke={accent} strokeWidth="1.8" opacity="0.55" />
          <path d="M28 13 C 33 13, 35 17, 33 21 L28 28 L23 21 C 21 17, 23 13, 28 13 Z" fill="#F45159" stroke={W} strokeWidth="1.6" />
          <circle cx="28" cy="18.5" r="2.4" fill={W} />
        </g>
      );
    case 'city':
      return (
        <g fill={W}>
          <rect x="11" y="22" width="9" height="15" rx="1" />
          <path d="M10.5 22 L15.5 15 L20.5 22 Z" />
          <rect x="21" y="16" width="8" height="21" rx="1" />
          <path d="M21 16 L25 8 L29 16 Z" />
          <rect x="30" y="24" width="8" height="13" rx="1" />
          <path d="M29.5 24 L34 18 L38.5 24 Z" />
        </g>
      );
    case 'lessons':
      return (
        <g>
          <path d="M24 16 C 19 12, 13 12, 10 13 L10 34 C 13 33, 19 33, 24 37 Z" fill={W} />
          <path d="M24 16 C 29 12, 35 12, 38 13 L38 34 C 35 33, 29 33, 24 37 Z" fill={W} opacity="0.85" />
          <path d="M14 19 L20 20 M14 24 L20 25 M28 20 L34 19 M28 25 L34 24" stroke={accent} strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
        </g>
      );
    case 'dictionary':
      return (
        <g>
          <rect x="13" y="10" width="22" height="28" rx="3" fill={W} />
          <rect x="13" y="32" width="22" height="6" rx="2" fill={W} opacity="0.7" />
          <text x="24" y="28" textAnchor="middle" fontSize="15" fontWeight="900" fontFamily="Nunito, sans-serif" fill={accent}>
            Ą
          </text>
        </g>
      );
    case 'ai':
      return (
        <g>
          <path d="M11 15 Q11 11 15 11 L33 11 Q37 11 37 15 L37 28 Q37 32 33 32 L21 32 L14 38 L15 32 Q11 32 11 28 Z" fill={W} />
          <circle cx="18" cy="21.5" r="2.6" fill={accent} />
          <circle cx="24" cy="21.5" r="2.6" fill={accent} />
          <circle cx="30" cy="21.5" r="2.6" fill={accent} />
        </g>
      );
    case 'grammar':
      return (
        <path
          d="M13 15 L20 15 Q20 10 24 10 Q28 10 28 15 L35 15 L35 22 Q40 22 40 26 Q40 30 35 30 L35 37 L13 37 L13 30 Q18 30 18 26 Q18 22 13 22 Z"
          fill={W}
        />
      );
    case 'quests':
      return (
        <g>
          <circle cx="24" cy="25" r="13" fill={W} />
          <circle cx="24" cy="25" r="8.5" fill={accent} />
          <circle cx="24" cy="25" r="4.5" fill={W} />
          <path d="M24 25 L36 12" stroke="#22364A" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M34 10 L38 10 L38 14" stroke="#22364A" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
    case 'exam':
      return (
        <g fill={W}>
          <path d="M24 12 L41 20 L24 28 L7 20 Z" />
          <path d="M14 24 L14 31 Q24 37 34 31 L34 24 L24 29 Z" opacity="0.9" />
          <path d="M39 21 L39 31" stroke={W} strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="39" cy="32" r="2.2" />
        </g>
      );
    case 'profile':
      return (
        <g fill={W}>
          <circle cx="24" cy="18" r="7" />
          <path d="M11 37 Q11 26 24 26 Q37 26 37 37 Z" />
        </g>
      );
    case 'friends':
      return (
        <g fill={W}>
          <circle cx="18" cy="19" r="5.5" />
          <path d="M8 35 Q8 26 18 26 Q28 26 28 35 Z" />
          <circle cx="31" cy="18" r="5" opacity="0.85" />
          <path d="M26 26.5 Q28 25 31 25 Q40 25 40 34 L30 34 Q30 29 26 26.5 Z" opacity="0.85" />
        </g>
      );
    case 'premium':
      return (
        <g>
          <path d="M10 33 L8 16 L17 23 L24 12 L31 23 L40 16 L38 33 Z" fill={W} strokeLinejoin="round" />
          <rect x="10" y="33" width="28" height="5" rx="2" fill={W} />
          <circle cx="24" cy="27" r="2.6" fill="#F45159" />
          <circle cx="16" cy="29" r="2" fill="#55BDF4" />
          <circle cx="32" cy="29" r="2" fill="#55BDF4" />
        </g>
      );
    case 'leaderboard':
      return (
        <g fill={W}>
          <path d="M15 11 L33 11 L33 19 Q33 28 24 28 Q15 28 15 19 Z" />
          <path d="M15 14 Q9 14 9 18 Q9 23 16 23 M33 14 Q39 14 39 18 Q39 23 32 23" stroke={W} strokeWidth="2.6" fill="none" />
          <rect x="21.5" y="27" width="5" height="6" />
          <rect x="15" y="33" width="18" height="5" rx="1.5" />
        </g>
      );
    case 'rewards':
      return (
        <g>
          <rect x="10" y="21" width="28" height="17" rx="2.5" fill={W} />
          <rect x="8" y="15" width="32" height="7" rx="2" fill={W} />
          <rect x="21.5" y="15" width="5" height="23" fill="#FFBD42" />
          <path d="M24 15 Q16 4 13 11 Q12 15 24 15 Q36 15 35 11 Q32 4 24 15 Z" fill="#FFBD42" stroke={W} strokeWidth="1.5" />
        </g>
      );
    case 'settings':
      return (
        <g fill={W}>
          <path d="M21.5 8 L26.5 8 L27.5 13 L31.5 15 L36 12.5 L39.5 16 L37 20.5 L38.5 24.5 L43.5 25.5 L43.5 30.5 L38.5 31.5 L37 35.5 L39.5 40 L36 43.5 L31.5 41 L27.5 42.5 L26.5 47.5 L21.5 47.5 L20.5 42.5 L16.5 41 L12 43.5 L8.5 40 L11 35.5 L9.5 31.5 L4.5 30.5 L4.5 25.5 L9.5 24.5 L11 20.5 L8.5 16 L12 12.5 L16.5 15 L20.5 13 Z" transform="translate(24 28) scale(0.72) translate(-24 -28)" />
          <circle cx="24" cy="28" r="5" fill={accent} transform="translate(0 -4)" />
        </g>
      );
    case 'wardrobe':
      return <path d="M17 11 L13 12 L7 18 L11 24 L15 21 L15 38 L33 38 L33 21 L37 24 L41 18 L35 12 L31 11 Q28 16 24 16 Q20 16 17 11 Z" fill={W} strokeLinejoin="round" />;
    case 'review':
      return (
        <g fill="none" stroke={W} strokeWidth="4.2" strokeLinecap="round">
          <path d="M35 20 A12 12 0 0 0 13 18" />
          <path d="M13 28 A12 12 0 0 0 35 30" />
          <path d="M13 11 L13 18 L20 18" strokeLinejoin="round" />
          <path d="M35 37 L35 30 L28 30" strokeLinejoin="round" />
        </g>
      );
    case 'mistakes':
      return (
        <g>
          <rect x="9" y="17" width="30" height="14" rx="7" fill={W} transform="rotate(-35 24 24)" />
          <rect x="19" y="17" width="10" height="14" fill="#FFD9C9" transform="rotate(-35 24 24)" />
          <circle cx="22" cy="23" r="1.2" fill={accent} />
          <circle cx="26" cy="25" r="1.2" fill={accent} />
        </g>
      );
    case 'timer':
      return (
        <g>
          <circle cx="24" cy="27" r="12" fill={W} />
          <rect x="21" y="9" width="6" height="5" rx="1.5" fill={W} />
          <path d="M24 27 L24 20 M24 27 L29 30" stroke={accent} strokeWidth="2.8" strokeLinecap="round" />
        </g>
      );
    case 'speed':
      return <path d="M27 8 L13 27 L22 27 L19 40 L35 20 L26 20 Z" fill={W} strokeLinejoin="round" />;
    case 'diary':
      return (
        <g>
          <rect x="12" y="9" width="24" height="30" rx="3" fill={W} />
          <rect x="12" y="9" width="5" height="30" rx="2" fill={W} opacity="0.7" />
          <path d="M21 17 L31 17 M21 22 L31 22 M21 27 L28 27" stroke={accent} strokeWidth="2" strokeLinecap="round" />
          <path d="M30 9 L30 18 L33 15.5 L36 18 L36 9 Z" fill="#F45159" />
        </g>
      );
    case 'story':
      return (
        <g>
          <path d="M12 12 L36 12 Q38 12 38 14 L38 36 L14 36 Q10 36 10 32 L10 14 Q10 12 12 12 Z" fill={W} />
          <path d="M15 18 L33 18 M15 23 L33 23 M15 28 L27 28" stroke={accent} strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    case 'star':
      return <path d="M24 9 L28.5 19 L39 20 L31 27 L33.5 38 L24 32.5 L14.5 38 L17 27 L9 20 L19.5 19 Z" fill={W} strokeLinejoin="round" />;
    case 'fire':
      return <path d="M24 8 C 26 15, 35 18, 35 28 C 35 35, 30 40, 24 40 C 18 40, 13 35, 13 28 C 13 22, 17 19, 19 15 C 20 19, 22 21, 23 21 C 23 16, 22 12, 24 8 Z" fill={W} />;
    case 'coin':
      return (
        <g>
          <circle cx="24" cy="24" r="13" fill={W} />
          <circle cx="24" cy="24" r="9" fill="none" stroke={accent} strokeWidth="2" />
          <text x="24" y="29" textAnchor="middle" fontSize="13" fontWeight="900" fontFamily="Nunito, sans-serif" fill={accent}>
            zł
          </text>
        </g>
      );
    case 'xp':
      return (
        <text x="24" y="31" textAnchor="middle" fontSize="18" fontWeight="900" fontFamily="Nunito, sans-serif" fill={W}>
          XP
        </text>
      );
    case 'lock':
      return (
        <g fill={W}>
          <path d="M17 22 L17 17 Q17 10 24 10 Q31 10 31 17 L31 22" stroke={W} strokeWidth="4" fill="none" />
          <rect x="12" y="21" width="24" height="17" rx="3.5" />
          <circle cx="24" cy="29" r="2.6" fill={accent} />
        </g>
      );
    case 'check':
      return <path d="M13 25 L21 33 L36 16" stroke={W} strokeWidth="5.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    case 'mic':
      return (
        <g fill={W}>
          <rect x="18" y="8" width="12" height="21" rx="6" />
          <path d="M13 23 Q13 33 24 33 Q35 33 35 23" stroke={W} strokeWidth="3" fill="none" strokeLinecap="round" />
          <rect x="22.5" y="33" width="3" height="5" />
          <rect x="17" y="37" width="14" height="3" rx="1.5" />
        </g>
      );
  }
}

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v + amt * 255)));
  return `rgb(${c((n >> 16) & 255)}, ${c((n >> 8) & 255)}, ${c(n & 255)})`;
}

type Props = { name: IconName; size?: number; color?: string; inactive?: boolean; className?: string };

/** Ігрова іконка-плитка. `inactive` — сірий стан (закрито / неактивна вкладка). */
export const GameIcon = memo(function GameIcon({ name, size = 48, color, inactive, className }: Props) {
  const uid = useId().replace(/:/g, '');
  const raster = iconAsset(name);
  const base = inactive ? '#B9C4CE' : color ?? ICON_COLORS[name];
  if (raster && !inactive) return <img src={raster} alt="" width={size} height={size} className={className} draggable={false} />;
  return (
    <svg viewBox="0 0 48 52" width={size} height={size * (52 / 48)} className={className} aria-hidden>
      <defs>
        <linearGradient id={`gi-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={shade(base, 0.14)} />
          <stop offset="1" stopColor={shade(base, -0.08)} />
        </linearGradient>
      </defs>
      {/* бортик (глибина) */}
      <rect x="1" y="5" width="46" height="46" rx="14" fill={shade(base, -0.24)} />
      <rect x="1" y="1" width="46" height="46" rx="14" fill={`url(#gi-${uid})`} />
      {/* відблиск */}
      <path d="M8 6 Q24 2 40 6 Q38 13 24 13 Q10 13 8 6 Z" fill="#fff" opacity="0.28" />
      <g style={{ filter: `drop-shadow(0 2px 0 ${shade(base, -0.28)})` }}>
        <Glyph name={name} accent={shade(base, -0.05)} />
      </g>
    </svg>
  );
});
