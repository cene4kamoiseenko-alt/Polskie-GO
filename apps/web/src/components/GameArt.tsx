/**
 * Об'ємні ігрові ілюстрації інтерфейсу (стиль референсів GLOBAL REDESIGN): градієнтні заливки,
 * відблиски, темно-синій контур. Якщо для назви є растрова ілюстрація (src/assets/icons), показуємо її.
 * Використання: <Art name="gift" size={64} />.
 */
import { memo, useId, type ReactNode } from 'react';
import { iconAsset } from '../lib/assets';

const INK = '#0E2240';
const SW = 2.4;

export type ArtName =
  | 'gift' | 'book' | 'chat' | 'gamepad' | 'scroll' | 'map-pin' | 'suitcase' | 'flame' | 'coin' | 'crown'
  | 'shield' | 'trophy' | 'medal-gold' | 'medal-silver' | 'medal-bronze' | 'lock' | 'sprout' | 'star' | 'books' | 'clock' | 'target' | 'plane'
  | 'passport' | 'house' | 'diary' | 'grad';

type Grad = (id: string, a: string, b: string, vertical?: boolean) => ReactNode;
const lin: Grad = (id, a, b, vertical = true) => (
  <linearGradient id={id} x1="0" y1="0" x2={vertical ? '0' : '1'} y2={vertical ? '1' : '0'}>
    <stop offset="0" stopColor={a} />
    <stop offset="1" stopColor={b} />
  </linearGradient>
);

function art(name: ArtName, u: (s: string) => string, label?: string): ReactNode {
  const f = (s: string) => `url(#${u(s)})`;
  switch (name) {
    case 'gift':
      return (
        <>
          <defs>{lin(u('box'), '#FFD86B', '#F2A516')}{lin(u('lid'), '#FFE795', '#FFC23A')}{lin(u('rib'), '#FF6B76', '#D92B3C')}</defs>
          <ellipse cx="32" cy="58" rx="22" ry="4" fill="#000" opacity="0.18" />
          <rect x="10" y="28" width="44" height="28" rx="4" fill={f('box')} stroke={INK} strokeWidth={SW} />
          <rect x="7" y="20" width="50" height="11" rx="3" fill={f('lid')} stroke={INK} strokeWidth={SW} />
          <rect x="28" y="20" width="8" height="36" fill={f('rib')} stroke={INK} strokeWidth="1.8" />
          <path d="M32 20 C 22 6, 10 12, 18 20 Z M32 20 C 42 6, 54 12, 46 20 Z" fill={f('rib')} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          <rect x="12" y="31" width="14" height="3" rx="1.5" fill="#fff" opacity="0.5" />
          <path d="M50 8l1.6 3.4L55 13l-3.4 1.6L50 18l-1.6-3.4L45 13l3.4-1.6z" fill="#FFF3B0" />
        </>
      );
    case 'book':
      return (
        <>
          <defs>{lin(u('pg'), '#FFFFFF', '#DCE9F8')}{lin(u('cv'), '#4FB6FF', '#1E6FE0')}</defs>
          <path d="M4 18 C 14 12, 24 12, 32 18 C 40 12, 50 12, 60 18 V52 C 50 46, 40 46, 32 52 C 24 46, 14 46, 4 52 Z" fill={f('cv')} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          <path d="M8 16 C 16 10, 26 10, 32 16 V48 C 26 42, 16 42, 8 46 Z" fill={f('pg')} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <path d="M56 16 C 48 10, 38 10, 32 16 V48 C 38 42, 48 42, 56 46 Z" fill={f('pg')} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <path d="M13 22 Q20 19 27 22 M13 28 Q20 25 27 28 M37 22 Q44 19 51 22 M37 28 Q44 25 51 28" stroke="#9DB4D0" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M50 4l1.4 3L55 8.4 51.4 10 50 13l-1.4-3L45 8.4 48.6 7z" fill="#FFF3B0" />
        </>
      );
    case 'chat':
      return (
        <>
          <defs>{lin(u('a'), '#FFB24D', '#F2731D')}{lin(u('b'), '#D7EEFF', '#8CC8FF')}</defs>
          <path d="M6 14 h30 a8 8 0 0 1 8 8 v10 a8 8 0 0 1 -8 8 H20 l-9 7 v-7 H14 a8 8 0 0 1 -8 -8 V22 a8 8 0 0 1 8 -8 Z" fill={f('a')} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          <path d="M28 30 h22 a8 8 0 0 1 8 8 v8 a8 8 0 0 1 -8 8 h-2 v6 l-8 -6 H28 a8 8 0 0 1 -8 -8 v-8 a8 8 0 0 1 8 -8 Z" fill={f('b')} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          <path d="M12 19 h14" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
          {[32, 39, 46].map((x) => <circle key={x} cx={x} cy="42" r="2.4" fill="#2C6FB8" />)}
        </>
      );
    case 'gamepad':
      return (
        <>
          <defs>{lin(u('g'), '#6FA8FF', '#3651D8')}</defs>
          <path d="M14 20 h36 c8 0 12 6 12 14 l-2 12 c-1 7 -9 9 -14 4 l-5 -5 H23 l-5 5 c-5 5 -13 3 -14 -4 l-2 -12 c0 -8 4 -14 12 -14 Z" fill={f('g')} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          <path d="M18 34 h10 M23 29 v10" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
          <circle cx="42" cy="31" r="3.4" fill="#FF5265" stroke={INK} strokeWidth="1.4" />
          <circle cx="49" cy="37" r="3.4" fill="#25D79B" stroke={INK} strokeWidth="1.4" />
          <path d="M16 24 h12" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" opacity="0.5" />
        </>
      );
    case 'scroll':
      return (
        <>
          <defs>{lin(u('p'), '#FFF1CF', '#EBCB8B')}{lin(u('r'), '#E9B86A', '#B98235', false)}</defs>
          <path d="M10 16 h40 v34 H10 Z" fill={f('p')} stroke={INK} strokeWidth={SW} />
          <rect x="4" y="10" width="12" height="44" rx="6" fill={f('r')} stroke={INK} strokeWidth={SW} />
          <rect x="46" y="10" width="12" height="44" rx="6" fill={f('r')} stroke={INK} strokeWidth={SW} />
          <path d="M20 40 c4 -6 10 -2 14 -8 s6 -6 8 -10" stroke="#C9472F" strokeWidth="2.2" strokeDasharray="3 3" fill="none" />
          <path d="M38 24 l6 6 M44 24 l-6 6" stroke="#E5383B" strokeWidth="3" strokeLinecap="round" />
          <path d="M18 24 q4 -3 6 1 q-2 3 -6 -1z" fill="#45C486" />
        </>
      );
    case 'map-pin':
      return (
        <>
          <defs>{lin(u('m'), '#BFF0B6', '#7FD07A')}{lin(u('pin'), '#FF7A86', '#E0283A')}</defs>
          <path d="M4 34 L20 28 L36 34 L58 26 L60 54 L38 60 L22 54 L6 60 Z" fill={f('m')} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          <path d="M20 28 V54 M36 34 V60" stroke="#5CAE5E" strokeWidth="1.6" />
          <path d="M10 50 q8 -10 16 -4 t18 -6" stroke="#36B9FF" strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <path d="M30 4 c-8 0 -14 6 -14 13 c0 10 14 23 14 23 s14 -13 14 -23 c0 -7 -6 -13 -14 -13 Z" fill={f('pin')} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          <circle cx="30" cy="17" r="5" fill="#fff" stroke={INK} strokeWidth="1.6" />
          <path d="M22 10 q4 -4 9 -4" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.6" />
        </>
      );
    case 'plane':
      return (
        <>
          <path d="M6 34 L58 12 L44 52 L32 40 L22 50 L22 38 Z" fill="#F4F8FF" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          <path d="M22 38 L58 12 L32 40" fill="#C9DDF8" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
        </>
      );
    case 'suitcase':
      return (
        <>
          <defs>{lin(u('s'), '#3EC4A4', '#1A8C78')}</defs>
          <path d="M24 14 v-5 a3 3 0 0 1 3 -3 h10 a3 3 0 0 1 3 3 v5" fill="none" stroke={INK} strokeWidth="3" />
          <rect x="8" y="14" width="48" height="40" rx="7" fill={f('s')} stroke={INK} strokeWidth={SW} />
          <path d="M8 26 h48" stroke={INK} strokeWidth="2" />
          <rect x="14" y="30" width="14" height="10" rx="2" fill="#FFF1DA" stroke={INK} strokeWidth="1.6" transform="rotate(-8 21 35)" />
          <rect x="34" y="34" width="14" height="12" rx="2" fill="#E5383B" stroke={INK} strokeWidth="1.6" transform="rotate(10 41 40)" />
          <path d="M34 39 h14" stroke="#fff" strokeWidth="3" transform="rotate(10 41 40)" />
          <rect x="12" y="17" width="16" height="3" rx="1.5" fill="#fff" opacity="0.45" />
        </>
      );
    case 'flame':
      return (
        <>
          <defs>{lin(u('o'), '#FFB547', '#FF4B2B')}{lin(u('i'), '#FFF4A8', '#FFC23A')}</defs>
          <path d="M32 4 c4 12 18 18 18 34 a18 18 0 0 1 -36 0 c0 -8 4 -13 8 -17 c1 6 4 9 7 10 c-1 -11 -1 -19 3 -27 Z" fill={f('o')} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          <path d="M33 26 c3 7 9 10 9 18 a10 10 0 0 1 -20 0 c0 -6 4 -9 6 -11 c1 3 3 5 4 5 c-1 -5 -1 -8 1 -12 Z" fill={f('i')} />
        </>
      );
    case 'coin':
      return (
        <>
          <defs>{lin(u('c'), '#FFE07A', '#F2A516')}{lin(u('e'), '#E8941A', '#B86E0B')}</defs>
          <ellipse cx="32" cy="35" rx="24" ry="24" fill={f('e')} stroke={INK} strokeWidth={SW} />
          <circle cx="32" cy="31" r="24" fill={f('c')} stroke={INK} strokeWidth={SW} />
          <circle cx="32" cy="31" r="17" fill="none" stroke="#F5B42A" strokeWidth="2.4" />
          <path d="M32 21 l3 6.2 6.8 1 -4.9 4.8 1.2 6.8 -6.1 -3.2 -6.1 3.2 1.2 -6.8 -4.9 -4.8 6.8 -1 Z" fill="#FFF3B0" stroke="#D88A0E" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M16 22 q6 -10 18 -11" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6" />
        </>
      );
    case 'crown':
      return (
        <>
          <defs>{lin(u('k'), '#FFE07A', '#F2A516')}</defs>
          <path d="M6 22 L18 34 L32 12 L46 34 L58 22 L52 50 H12 Z" fill={f('k')} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          <rect x="12" y="46" width="40" height="8" rx="3" fill="#F2A516" stroke={INK} strokeWidth={SW} />
          <circle cx="32" cy="38" r="4" fill="#E5383B" stroke={INK} strokeWidth="1.6" />
          {[[6, 22], [32, 12], [58, 22]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="3.4" fill="#FFF3B0" stroke={INK} strokeWidth="1.6" />)}
          <path d="M16 40 q6 -4 10 -10" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" opacity="0.55" />
        </>
      );
    case 'shield':
      return (
        <>
          <defs>{lin(u('sh'), '#FFD86B', '#E3901A')}{lin(u('in'), '#FFE9A6', '#F5B42A')}</defs>
          <path d="M32 4 L56 12 V30 C56 46 44 56 32 60 C20 56 8 46 8 30 V12 Z" fill={f('sh')} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          <path d="M32 11 L50 17 V30 C50 42 41 50 32 53 C23 50 14 42 14 30 V17 Z" fill={f('in')} stroke="#C97A12" strokeWidth="1.6" />
          {label && <text x="32" y="41" textAnchor="middle" fontSize="22" fontWeight="900" fill="#7A4300" fontFamily="Nunito, system-ui, sans-serif">{label}</text>}
          <path d="M18 16 L30 12" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" opacity="0.6" />
        </>
      );
    case 'trophy':
      return (
        <>
          <defs>{lin(u('t'), '#FFE07A', '#E8941A')}</defs>
          <path d="M14 10 h36 v10 c0 12 -8 20 -18 20 s-18 -8 -18 -20 Z" fill={f('t')} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          <path d="M14 14 h-8 c0 10 6 14 10 14 M50 14 h8 c0 10 -6 14 -10 14" fill="none" stroke={INK} strokeWidth={SW} />
          <rect x="27" y="40" width="10" height="8" fill="#E8941A" stroke={INK} strokeWidth="2" />
          <rect x="18" y="48" width="28" height="8" rx="2" fill="#B86E0B" stroke={INK} strokeWidth={SW} />
          <path d="M32 16 l2.4 5 5.4 .8 -3.9 3.8 .9 5.4 -4.8 -2.6 -4.8 2.6 .9 -5.4 -3.9 -3.8 5.4 -.8 Z" fill="#FFF3B0" />
          <path d="M19 14 q0 10 6 16" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" opacity="0.55" />
        </>
      );
    case 'medal-gold':
    case 'medal-silver':
    case 'medal-bronze': {
      const [a, b, c] = name === 'medal-gold' ? ['#FFE07A', '#E8941A', '#7A4300'] : name === 'medal-silver' ? ['#F1F5FA', '#9DAEC2', '#46566B'] : ['#F6B98A', '#B8642E', '#5C2A0A'];
      return (
        <>
          <defs>{lin(u('md'), a, b)}</defs>
          <path d="M20 4 L28 26 L22 28 L14 6 Z" fill="#36B9FF" stroke={INK} strokeWidth="2" />
          <path d="M44 4 L36 26 L42 28 L50 6 Z" fill="#E5383B" stroke={INK} strokeWidth="2" />
          <circle cx="32" cy="40" r="19" fill={f('md')} stroke={INK} strokeWidth={SW} />
          <circle cx="32" cy="40" r="13" fill="none" stroke={c} strokeWidth="1.6" opacity="0.6" />
          {label ? <text x="32" y="47" textAnchor="middle" fontSize="20" fontWeight="900" fill={c} fontFamily="Nunito, system-ui, sans-serif">{label}</text> : <path d="M32 31 l2.6 5.4 5.9.9 -4.3 4.2 1 5.9 -5.2 -2.8 -5.2 2.8 1 -5.9 -4.3 -4.2 5.9 -.9 Z" fill="#fff" opacity="0.85" />}
          <path d="M20 32 q4 -6 11 -7" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" opacity="0.55" />
        </>
      );
    }
    case 'lock':
      return (
        <>
          <defs>{lin(u('l'), '#C9D3DF', '#7D8DA3')}</defs>
          <path d="M20 28 v-8 a12 12 0 0 1 24 0 v8" fill="none" stroke={INK} strokeWidth="5" />
          <path d="M20 28 v-8 a12 12 0 0 1 24 0 v8" fill="none" stroke="#B6C2D1" strokeWidth="2.4" />
          <rect x="12" y="28" width="40" height="30" rx="7" fill={f('l')} stroke={INK} strokeWidth={SW} />
          <circle cx="32" cy="41" r="4" fill={INK} /><rect x="30.5" y="42" width="3" height="8" rx="1.5" fill={INK} />
        </>
      );
    case 'sprout':
      return (
        <>
          <defs>{lin(u('lf'), '#8BF07E', '#25B05A')}</defs>
          <path d="M32 58 V30" stroke="#1F8A49" strokeWidth="4" strokeLinecap="round" />
          <path d="M32 34 C 18 36, 8 26, 8 12 C 22 12, 32 20, 32 34 Z" fill={f('lf')} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          <path d="M32 30 C 44 32, 56 22, 56 8 C 42 8, 32 16, 32 30 Z" fill={f('lf')} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          <path d="M14 18 q6 4 14 12 M50 14 q-6 4 -14 12" stroke="#E6FFE0" strokeWidth="2" fill="none" opacity="0.7" />
        </>
      );
    case 'star':
      return (
        <>
          <defs>{lin(u('st'), '#FFE07A', '#F2A516')}</defs>
          <path d="M32 4 l8.5 17.2 19 2.8 -13.7 13.4 3.2 18.9 -17 -8.9 -17 8.9 3.2 -18.9 -13.7 -13.4 19 -2.8 Z" fill={f('st')} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          <path d="M22 22 l8 -1" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.65" />
        </>
      );
    case 'books':
      return (
        <>
          <rect x="8" y="40" width="48" height="12" rx="3" fill="#3A7BD5" stroke={INK} strokeWidth={SW} />
          <rect x="12" y="28" width="42" height="12" rx="3" fill="#45C486" stroke={INK} strokeWidth={SW} />
          <rect x="6" y="16" width="44" height="12" rx="3" fill="#E5383B" stroke={INK} strokeWidth={SW} />
          <path d="M44 16 v12 M50 28 v12 M14 40 v12" stroke="#fff" strokeWidth="2.4" opacity="0.7" />
          <text x="26" y="25.5" textAnchor="middle" fontSize="8" fontWeight="900" fill="#fff" fontFamily="Nunito, system-ui, sans-serif">PL</text>
        </>
      );
    case 'clock':
      return (
        <>
          <defs>{lin(u('ck'), '#7CF0C3', '#1FB57E')}</defs>
          <circle cx="32" cy="32" r="26" fill={f('ck')} stroke={INK} strokeWidth={SW} />
          <circle cx="32" cy="32" r="19" fill="#EFFFF8" stroke={INK} strokeWidth="1.8" />
          <path d="M32 19 V32 L41 37" stroke={INK} strokeWidth="3.2" strokeLinecap="round" fill="none" />
        </>
      );
    case 'passport':
      return (
        <>
          <defs>{lin(u('pp'), '#3F8BEA', '#1B4FA8')}</defs>
          <rect x="12" y="6" width="40" height="52" rx="5" fill={f('pp')} stroke={INK} strokeWidth={SW} />
          <rect x="12" y="6" width="7" height="52" rx="3" fill="#163F86" />
          <circle cx="34" cy="28" r="10" fill="none" stroke="#FFD86B" strokeWidth="2.4" />
          <path d="M24 28 h20 M34 18 c-5 5 -5 15 0 20 c5 -5 5 -15 0 -20" stroke="#FFD86B" strokeWidth="1.8" fill="none" />
          <rect x="24" y="44" width="20" height="3" rx="1.5" fill="#FFD86B" />
          <path d="M42 10 h6" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity="0.5" />
        </>
      );
    case 'house':
      return (
        <>
          <defs>{lin(u('hw'), '#FFF1DA', '#F2D3A0')}{lin(u('hr'), '#FF7A5A', '#C9472F')}</defs>
          <rect x="12" y="28" width="40" height="28" rx="2" fill={f('hw')} stroke={INK} strokeWidth={SW} />
          <path d="M6 30 L32 8 L58 30 Z" fill={f('hr')} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          <rect x="26" y="38" width="12" height="18" rx="2" fill="#2BB3A3" stroke={INK} strokeWidth="2" />
          <rect x="15" y="34" width="8" height="8" rx="1.5" fill="#BFE6FF" stroke={INK} strokeWidth="1.6" />
          <rect x="41" y="34" width="8" height="8" rx="1.5" fill="#BFE6FF" stroke={INK} strokeWidth="1.6" />
          <path d="M44 14 v-6 h6 v11" fill="#B9472F" stroke={INK} strokeWidth="2" />
          <ellipse cx="32" cy="58" rx="26" ry="3" fill="#2F9A55" />
        </>
      );
    case 'diary':
      return (
        <>
          <defs>{lin(u('dc'), '#9D69FF', '#5B33C4')}</defs>
          <rect x="12" y="6" width="40" height="52" rx="5" fill={f('dc')} stroke={INK} strokeWidth={SW} />
          <rect x="18" y="12" width="28" height="40" rx="3" fill="#F4EEFF" stroke={INK} strokeWidth="1.6" />
          <path d="M22 20 h20 M22 27 h20 M22 34 h14" stroke="#9D8BCB" strokeWidth="2" strokeLinecap="round" />
          <path d="M40 6 v16 l4 -3 4 3 V6" fill="#E5383B" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M28 42 l4 4 8 -9" stroke="#25D79B" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </>
      );
    case 'grad':
      return (
        <>
          <path d="M4 24 L32 12 L60 24 L32 36 Z" fill="#22364A" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          <path d="M16 30 v12 c0 6 32 6 32 0 V30 L32 36 Z" fill="#33475E" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          <path d="M54 26 v14" stroke="#FFC857" strokeWidth="2.6" />
          <circle cx="54" cy="42" r="3.4" fill="#FFC857" stroke={INK} strokeWidth="1.4" />
        </>
      );
    case 'target':
      return (
        <>
          <circle cx="30" cy="34" r="24" fill="#fff" stroke={INK} strokeWidth={SW} />
          <circle cx="30" cy="34" r="17" fill="#36B9FF" stroke={INK} strokeWidth="1.8" />
          <circle cx="30" cy="34" r="10" fill="#fff" stroke={INK} strokeWidth="1.8" />
          <circle cx="30" cy="34" r="4" fill="#E5383B" />
          <path d="M30 34 L54 10 M48 8 h8 v8" stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" />
        </>
      );
  }
}

/** Растрові ілюстрації (src/assets/icons) для назв, які мають готовий ассет. */
const RASTER: Partial<Record<ArtName, string>> = {
  gift: 'gift', book: 'lessons', chat: 'dialog', scroll: 'quests', 'map-pin': 'map', flame: 'streak', coin: 'zlotki',
  trophy: 'leaderboard', 'medal-gold': 'achievements', passport: 'passport', house: 'house', diary: 'writing', books: 'dictionary', suitcase: 'profile',
};

export const Art = memo(function Art({ name, size = 48, className, label }: { name: ArtName; size?: number; className?: string; label?: string }) {
  const id = useId().replace(/:/g, '');
  const raster = !label && RASTER[name] ? iconAsset(RASTER[name]!) : null;
  if (raster) return <img src={raster} alt="" width={size} height={size} className={className} style={{ width: size, height: size, objectFit: 'contain' }} draggable={false} />;
  const u = (s: string) => `${id}-${s}`;
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} aria-hidden>
      {art(name, u, label)}
    </svg>
  );
});
