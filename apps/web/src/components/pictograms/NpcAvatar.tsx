/**
 * Портрет співрозмовника (NPC) замість емодзі. Дані контенту зберігають код персонажа у вигляді
 * емодзі (стабільний ключ у БД); тут він розбирається на параметри: стать і вік, тон шкіри,
 * зачіска, професія (кухар, пілот/провідник, поліцейський, офіс, студент, фермер…).
 * Малюнок плоский, у кольорах застосунку, без тексту.
 */
import { memo, useId } from 'react';

type Base = 'woman' | 'man' | 'person' | 'oldWoman' | 'oldMan' | 'girl' | 'boy' | 'baby';
type Role = 'office' | 'cook' | 'farmer' | 'pilot' | 'student' | 'teacher' | 'tech' | 'mechanic' | 'police' | 'waiter' | 'wizard' | null;
type Hair = 'white' | 'red' | 'curly' | 'bald' | null;

export type NpcLook = { base: Base; skin: string; role: Role; hair: Hair; beard: boolean };

const SKIN: Record<number, string> = { 0x1f3fb: '#F6D2B8', 0x1f3fc: '#E9B993', 0x1f3fd: '#C98E63', 0x1f3fe: '#9A6440', 0x1f3ff: '#6B4329' };
const BASES: Record<number, Base> = {
  0x1f469: 'woman', 0x1f468: 'man', 0x1f9d1: 'person', 0x1f475: 'oldWoman', 0x1f474: 'oldMan', 0x1f467: 'girl', 0x1f466: 'boy',
  0x1f476: 'baby', 0x1f9d4: 'man', 0x1f935: 'man', 0x1f46e: 'man', 0x1f9d9: 'oldMan',
};
const ROLES: Record<number, Role> = {
  0x1f4bc: 'office', 0x1f373: 'cook', 0x1f33e: 'farmer', 0x2708: 'pilot', 0x1f393: 'student', 0x1f3eb: 'teacher', 0x1f4bb: 'tech', 0x1f527: 'mechanic',
};
const HAIRS: Record<number, Hair> = { 0x1f9b3: 'white', 0x1f9b0: 'red', 0x1f9b1: 'curly', 0x1f9b2: 'bald' };

/** Чи це емодзі людини (тоді показуємо портрет). */
export function isPersonEmoji(e: string | null | undefined): boolean {
  const cp = e?.codePointAt(0);
  return cp !== undefined && cp in BASES;
}

export function parseNpc(e: string): NpcLook {
  const cps = Array.from(e).map((c) => c.codePointAt(0)!);
  const first = cps[0];
  let role: Role = null;
  let hair: Hair = null;
  let skin = SKIN[0x1f3fc];
  for (const cp of cps) {
    if (SKIN[cp]) skin = SKIN[cp];
    if (ROLES[cp]) role = ROLES[cp];
    if (HAIRS[cp]) hair = HAIRS[cp];
  }
  if (first === 0x1f46e) role = 'police';
  if (first === 0x1f935) role = 'waiter';
  if (first === 0x1f9d9) role = 'wizard';
  return { base: BASES[first] ?? 'person', skin, role, hair, beard: first === 0x1f9d4 || first === 0x1f9d9 };
}

const CLOTH: Record<string, [string, string]> = {
  office: ['#2E4C86', '#22396A'], cook: ['#FAFAF7', '#DCD7CC'], farmer: ['#4F9A4C', '#3B7A39'], pilot: ['#22356B', '#18264E'],
  student: ['#9568F5', '#7448D8'], teacher: ['#E8A23A', '#C9831F'], tech: ['#3A4A5C', '#2A3746'], mechanic: ['#2F6FB8', '#24578F'],
  police: ['#1F3A68', '#162B4E'], waiter: ['#1B1F2A', '#0F121A'], wizard: ['#C9343F', '#A32631'],
};
const DEFAULT_CLOTH: [string, string][] = [['#36B9FF', '#1F8FD6'], ['#FF6B7A', '#E5384B'], ['#25C98E', '#169A6B'], ['#FFBD42', '#E39A14'], ['#9568F5', '#7448D8']];
const HAIR_COLOR = ['#5A3A22', '#2B1D14', '#C8913E', '#7A4A26'];

function hash(s: string) {
  return [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7) >>> 0;
}

export const NpcAvatar = memo(function NpcAvatar({ emoji, seed = '', size = 56, ring = true }: { emoji: string; seed?: string; size?: number; ring?: boolean }) {
  const id = useId().replace(/:/g, '');
  const look = parseNpc(emoji);
  const h = hash(seed || emoji);
  const old = look.base === 'oldWoman' || look.base === 'oldMan' || look.hair === 'white';
  const female = look.base === 'woman' || look.base === 'oldWoman' || look.base === 'girl';
  const child = look.base === 'girl' || look.base === 'boy' || look.base === 'baby';
  const hairColor = look.hair === 'red' ? '#C8552B' : old ? '#E6E6EA' : HAIR_COLOR[h % HAIR_COLOR.length];
  const [c1, c2] = (look.role && CLOTH[look.role]) || DEFAULT_CLOTH[h % DEFAULT_CLOTH.length];
  const bg = ['#DCEFFF', '#FFE6D6', '#E2F6EA', '#EFE6FF', '#FFF2CC'][h % 5];
  const headR = look.base === 'baby' ? 13 : child ? 12.5 : 13.5;
  const headY = look.base === 'baby' ? 30 : 27;
  const INK = '#0E2240';
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden style={{ display: 'block' }}>
      <defs>
        <clipPath id={`np-${id}`}><circle cx="32" cy="32" r="31" /></clipPath>
        <linearGradient id={`npc-${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c1} /><stop offset="1" stopColor={c2} /></linearGradient>
      </defs>
      <circle cx="32" cy="32" r="31" fill={bg} />
      <g clipPath={`url(#np-${id})`} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
        {/* Довге волосся позаду (жінки) */}
        {female && !old && look.hair !== 'curly' && <path d={`M${32 - headR - 2} ${headY} C ${32 - headR - 3} ${headY + 20}, ${32 + headR + 3} ${headY + 20}, ${32 + headR + 2} ${headY} Z`} fill={hairColor} />}
        {/* Плечі й одяг */}
        <path d="M8 66 C 8 50, 18 44, 32 44 C 46 44, 56 50, 56 66 Z" fill={`url(#npc-${id})`} />
        {look.role === 'office' || look.role === 'pilot' || look.role === 'police' || look.role === 'waiter' ? (
          <>
            <path d="M26 44 L32 54 L38 44 Z" fill="#fff" />
            {look.role === 'waiter' ? <path d="M28 47 l4 2 4 -2 v4 l-4 -2 -4 2 z" fill="#E5384B" /> : <path d="M32 48 l-2 3 2 8 2 -8 z" fill={look.role === 'office' ? '#E5384B' : '#FFC857'} />}
          </>
        ) : look.role === 'cook' ? (
          <path d="M24 45 L32 51 L40 45 L36 48 L32 56 L28 48 Z" fill="#E5384B" />
        ) : null}
        {/* Шия й голова */}
        <path d={`M28 ${headY + headR - 2} v6 h8 v-6`} fill={look.skin} />
        <circle cx="32" cy={headY} r={headR} fill={look.skin} />
        {/* Зачіска */}
        {look.base === 'baby' ? (
          <path d={`M30 ${headY - headR + 1} q2 -3 4 0`} fill="none" />
        ) : look.hair === 'bald' || (look.base === 'oldMan' && !look.beard) ? (
          <path d={`M${32 - headR + 1} ${headY - 1} q-1 -6 3 -8 M${32 + headR - 1} ${headY - 1} q1 -6 -3 -8`} fill={hairColor} />
        ) : look.hair === 'curly' ? (
          <path d={`M${32 - headR - 1} ${headY + 2} c-4 -4 -2 -12 3 -13 c1 -5 9 -7 12 -3 c4 -3 11 -1 11 5 c5 2 5 9 1 11 c-2 -5 -6 -8 -12 -8 c-6 0 -11 3 -15 8 z`} fill={hairColor} />
        ) : female ? (
          <path d={`M${32 - headR} ${headY + 2} C ${32 - headR} ${headY - 14}, ${32 + headR} ${headY - 16}, ${32 + headR} ${headY + 2} C ${32 + headR - 4} ${headY - 6}, ${36} ${headY - 8}, ${30} ${headY - 7} C ${26} ${headY - 6}, ${32 - headR + 3} ${headY - 4}, ${32 - headR} ${headY + 2} Z`} fill={hairColor} />
        ) : (
          <path d={`M${32 - headR} ${headY - 1} C ${32 - headR} ${headY - 15}, ${32 + headR} ${headY - 15}, ${32 + headR} ${headY - 1} C ${32 + headR - 3} ${headY - 7}, ${32 - headR + 3} ${headY - 7}, ${32 - headR} ${headY - 1} Z`} fill={hairColor} />
        )}
        {look.base === 'oldWoman' && <circle cx="32" cy={headY - headR - 1} r="5" fill={hairColor} />}
        {look.base === 'girl' && (
          <>
            <circle cx={32 - headR - 1} cy={headY - 2} r="4" fill={hairColor} />
            <circle cx={32 + headR + 1} cy={headY - 2} r="4" fill={hairColor} />
          </>
        )}
        {look.beard && <path d={`M${32 - headR + 2} ${headY + 2} C ${32 - headR + 3} ${headY + 16}, ${32 + headR - 3} ${headY + 16}, ${32 + headR - 2} ${headY + 2} C ${36} ${headY + 7}, ${28} ${headY + 7}, ${32 - headR + 2} ${headY + 2} Z`} fill={look.role === 'wizard' ? '#E6E6EA' : hairColor} />}
        {/* Обличчя */}
        <g stroke="none" fill={INK}>
          <circle cx="27.5" cy={headY + 1} r="1.6" />
          <circle cx="36.5" cy={headY + 1} r="1.6" />
        </g>
        <circle cx="25" cy={headY + 5} r="2" fill="#FF8A8A" opacity="0.45" stroke="none" />
        <circle cx="39" cy={headY + 5} r="2" fill="#FF8A8A" opacity="0.45" stroke="none" />
        {!look.beard && <path d={`M28.5 ${headY + 6} q3.5 3 7 0`} fill="none" />}
        {(old || look.role === 'teacher' || look.role === 'tech') && look.base !== 'baby' && (
          <g fill="none" strokeWidth="1.4">
            <circle cx="27.5" cy={headY + 1} r="3.4" />
            <circle cx="36.5" cy={headY + 1} r="3.4" />
            <path d={`M30.9 ${headY + 1} h2.2`} />
          </g>
        )}
        {/* Головні убори професій */}
        {look.role === 'cook' && (
          <path d={`M22 ${headY - 9} c-4 -2 -3 -9 2 -9 c1 -5 8 -6 10 -2 c3 -3 9 -1 8 4 c4 1 4 7 -1 7 z`} fill="#fff" />
        )}
        {(look.role === 'pilot' || look.role === 'police') && (
          <>
            <path d={`M19 ${headY - 8} c0 -9 26 -9 26 0 z`} fill={c2} />
            <path d={`M18 ${headY - 8} h28 v3 h-28 z`} fill="#0E1730" />
            <path d={`M29 ${headY - 13} l3 -2 3 2 -3 2 z`} fill="#FFC857" />
          </>
        )}
        {look.role === 'farmer' && <path d={`M14 ${headY - 6} q18 -5 36 0 q-6 -2 -8 -9 q-10 -4 -20 0 q-2 7 -8 9 z`} fill="#F2C766" />}
        {look.role === 'student' && (
          <>
            <path d={`M16 ${headY - 11} l16 -7 16 7 -16 7 z`} fill="#1B1F2A" />
            <path d={`M44 ${headY - 9} v7`} fill="none" />
          </>
        )}
        {look.role === 'wizard' && <path d={`M19 ${headY - 7} L32 ${headY - 34} L45 ${headY - 7} Z`} fill="#C9343F" />}
        {look.role === 'mechanic' && <path d={`M19 ${headY - 6} c0 -10 26 -10 26 0 h4 v3 h-30 z`} fill="#2F6FB8" />}
      </g>
      {ring && <circle cx="32" cy="32" r="31" fill="none" stroke="#fff" strokeWidth="2.5" />}
    </svg>
  );
});
