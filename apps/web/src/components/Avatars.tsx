/**
 * Аватари гравців: фото з Telegram або (якщо фото немає) мила тваринка, стабільна для користувача.
 */
import { memo, type ReactNode } from 'react';

const INK = '#0E2240';

const ANIMALS: { bg: string; face: ReactNode }[] = [
  // лисиця
  {
    bg: '#FFE3C7',
    face: (
      <g stroke={INK} strokeWidth="2" strokeLinejoin="round">
        <path d="M14 22 L18 6 L28 18 Z M50 22 L46 6 L36 18 Z" fill="#F2843A" />
        <path d="M10 30 C 10 16, 54 16, 54 30 C 54 44, 42 54, 32 56 C 22 54, 10 44, 10 30 Z" fill="#F2843A" />
        <path d="M14 34 C 20 46, 28 50, 32 52 C 36 50, 44 46, 50 34 C 44 38, 38 40, 32 46 C 26 40, 20 38, 14 34 Z" fill="#FFF6EC" />
        <circle cx="24" cy="31" r="3" fill={INK} stroke="none" /><circle cx="40" cy="31" r="3" fill={INK} stroke="none" />
        <ellipse cx="32" cy="44" rx="3.4" ry="2.4" fill={INK} stroke="none" />
      </g>
    ),
  },
  // панда
  {
    bg: '#E2F1E6',
    face: (
      <g stroke={INK} strokeWidth="2">
        <circle cx="16" cy="16" r="7" fill="#2A3140" /><circle cx="48" cy="16" r="7" fill="#2A3140" />
        <circle cx="32" cy="34" r="22" fill="#FFFFFF" />
        <ellipse cx="23" cy="32" rx="6" ry="7.5" fill="#2A3140" transform="rotate(-18 23 32)" />
        <ellipse cx="41" cy="32" rx="6" ry="7.5" fill="#2A3140" transform="rotate(18 41 32)" />
        <circle cx="24" cy="31" r="2.2" fill="#fff" stroke="none" /><circle cx="40" cy="31" r="2.2" fill="#fff" stroke="none" />
        <ellipse cx="32" cy="42" rx="3.6" ry="2.6" fill="#2A3140" stroke="none" />
        <path d="M28 47 Q32 50 36 47" fill="none" />
      </g>
    ),
  },
  // кіт
  {
    bg: '#FFE6F0',
    face: (
      <g stroke={INK} strokeWidth="2" strokeLinejoin="round">
        <path d="M12 26 L14 8 L28 18 Z M52 26 L50 8 L36 18 Z" fill="#FFFFFF" />
        <path d="M16 22 L16 12 L24 18 Z M48 22 L48 12 L40 18 Z" fill="#FFB3C7" stroke="none" />
        <circle cx="32" cy="34" r="21" fill="#FFFFFF" />
        <circle cx="24" cy="32" r="3.2" fill={INK} stroke="none" /><circle cx="40" cy="32" r="3.2" fill={INK} stroke="none" />
        <path d="M30 40 L34 40 L32 42.5 Z" fill="#FF8FA8" />
        <path d="M32 42.5 Q29 46 26 44 M32 42.5 Q35 46 38 44 M10 38 L20 39 M10 43 L20 41 M54 38 L44 39 M54 43 L44 41" fill="none" strokeWidth="1.6" />
        <path d="M40 10 q4 -4 8 0 q-4 4 -8 0" fill="#FF5A8A" />
      </g>
    ),
  },
  // жаба
  {
    bg: '#DDF6D8',
    face: (
      <g stroke={INK} strokeWidth="2">
        <circle cx="20" cy="18" r="9" fill="#5CCB52" /><circle cx="44" cy="18" r="9" fill="#5CCB52" />
        <ellipse cx="32" cy="38" rx="24" ry="18" fill="#5CCB52" />
        <circle cx="20" cy="18" r="5" fill="#fff" /><circle cx="44" cy="18" r="5" fill="#fff" />
        <circle cx="21" cy="18" r="2.6" fill={INK} stroke="none" /><circle cx="45" cy="18" r="2.6" fill={INK} stroke="none" />
        <path d="M18 40 Q32 52 46 40" fill="none" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="14" cy="38" r="3" fill="#FF9E9E" stroke="none" opacity="0.7" /><circle cx="50" cy="38" r="3" fill="#FF9E9E" stroke="none" opacity="0.7" />
      </g>
    ),
  },
  // їжачок
  {
    bg: '#FFF1D2',
    face: (
      <g stroke={INK} strokeWidth="2" strokeLinejoin="round">
        <path d="M8 34 L4 24 L12 24 L10 14 L18 18 L20 8 L26 14 L32 6 L38 14 L44 8 L46 18 L54 14 L52 24 L60 24 L56 34 Z" fill="#8A6247" />
        <path d="M14 34 C 14 22, 50 22, 50 34 C 50 46, 42 54, 32 54 C 22 54, 14 46, 14 34 Z" fill="#F6D2A8" />
        <circle cx="25" cy="34" r="3" fill={INK} stroke="none" /><circle cx="39" cy="34" r="3" fill={INK} stroke="none" />
        <circle cx="32" cy="42" r="3.2" fill={INK} stroke="none" />
        <circle cx="20" cy="42" r="3" fill="#FF9E9E" stroke="none" opacity="0.6" /><circle cx="44" cy="42" r="3" fill="#FF9E9E" stroke="none" opacity="0.6" />
      </g>
    ),
  },
  // сова
  {
    bg: '#E6E2FF',
    face: (
      <g stroke={INK} strokeWidth="2" strokeLinejoin="round">
        <path d="M12 14 L20 20 L32 16 L44 20 L52 14 L52 40 C 52 50, 42 56, 32 56 C 22 56, 12 50, 12 40 Z" fill="#9D7BE0" />
        <circle cx="24" cy="32" r="9" fill="#fff" /><circle cx="40" cy="32" r="9" fill="#fff" />
        <circle cx="24" cy="32" r="4" fill={INK} stroke="none" /><circle cx="40" cy="32" r="4" fill={INK} stroke="none" />
        <path d="M29 40 L32 46 L35 40 Z" fill="#FFC857" />
      </g>
    ),
  },
];

const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

export function AnimalFace({ seed, size = 44 }: { seed: string; size?: number }) {
  const a = ANIMALS[hash(seed) % ANIMALS.length];
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden>
      <circle cx="32" cy="32" r="32" fill={a.bg} />
      {a.face}
    </svg>
  );
}

export const UserAvatar = memo(function UserAvatar({ url, seed, size = 44, ring = '#36B9FF' }: { url: string | null; seed: string; size?: number; ring?: string }) {
  return (
    <span className="inline-grid shrink-0 place-items-center overflow-hidden rounded-full" style={{ width: size, height: size, boxShadow: `0 0 0 3px ${ring}, 0 4px 10px -4px rgb(0 0 0 / 0.6)` }}>
      {url ? <img src={url} alt="" className="h-full w-full object-cover" /> : <AnimalFace seed={seed} size={size} />}
    </span>
  );
});
