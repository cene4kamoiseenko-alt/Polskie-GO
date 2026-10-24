/** Ілюстровані співрозмовники для рольових сцен AI-практики (векторні портрети). */
import { memo, useId } from 'react';

export type SceneKey = 'cafe' | 'shop' | 'interview' | 'doctor' | 'airport' | 'landlord' | 'meeting' | 'work' | 'urzad' | 'train';

type Look = { bg: string; skin: string; hair: string; shirt: string; style: 'short' | 'long' | 'bun' | 'curly'; extra: 'apron' | 'coat' | 'tie' | 'cap' | 'glasses' | 'scarf' | 'badge' | 'vest' };

export const SCENE_LOOKS: Record<SceneKey, Look> = {
  cafe: { bg: '#FFBD42', skin: '#F2C9A0', hair: '#5B3A23', shirt: '#35C88A', style: 'bun', extra: 'apron' },
  shop: { bg: '#35C88A', skin: '#E8B88E', hair: '#2E2A28', shirt: '#F45159', style: 'short', extra: 'vest' },
  interview: { bg: '#55BDF4', skin: '#F5D0B0', hair: '#A0522D', shirt: '#22364A', style: 'long', extra: 'glasses' },
  doctor: { bg: '#7FD1C3', skin: '#D9A47E', hair: '#1F1F24', shirt: '#FFFFFF', style: 'short', extra: 'coat' },
  airport: { bg: '#9568F5', skin: '#F2C9A0', hair: '#E8B547', shirt: '#2F5D9E', style: 'bun', extra: 'cap' },
  landlord: { bg: '#F58A5B', skin: '#F0C4A2', hair: '#C9C9C9', shirt: '#9568F5', style: 'curly', extra: 'scarf' },
  meeting: { bg: '#F45159', skin: '#EBC09A', hair: '#3B2416', style: 'curly', shirt: '#FFBD42', extra: 'badge' },
  work: { bg: '#22364A', skin: '#F5D0B0', hair: '#6B4226', shirt: '#55BDF4', style: 'short', extra: 'tie' },
  urzad: { bg: '#B08BFF', skin: '#E8B88E', hair: '#4A3A30', shirt: '#E9E2D6', style: 'long', extra: 'glasses' },
  train: { bg: '#4EB3E8', skin: '#F2C9A0', hair: '#2E2A28', shirt: '#C0392B', style: 'short', extra: 'cap' },
};

const LINE = '#2A2420';

export const SceneAvatar = memo(function SceneAvatar({ scene, size = 64 }: { scene: SceneKey; size?: number }) {
  const l = SCENE_LOOKS[scene];
  const id = useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden className="shrink-0">
      <defs>
        <radialGradient id={`bg${id}`} cx="0.35" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="0.55" stopColor={l.bg} stopOpacity="1" />
          <stop offset="1" stopColor={l.bg} />
        </radialGradient>
        <clipPath id={`c${id}`}>
          <circle cx="32" cy="32" r="30" />
        </clipPath>
      </defs>
      <circle cx="32" cy="32" r="31" fill={`url(#bg${id})`} />
      <g clipPath={`url(#c${id})`} stroke={LINE} strokeWidth="1.6" strokeLinejoin="round">
        {/* волосся ззаду */}
        {l.style === 'long' && <path d="M17 30 Q16 52 22 58 L42 58 Q48 52 47 30 Z" fill={l.hair} />}
        {/* тулуб */}
        <path d="M10 66 Q12 46 32 45 Q52 46 54 66 Z" fill={l.shirt} />
        {l.extra === 'coat' && <path d="M10 66 Q12 46 26 45 L32 58 L38 45 Q52 46 54 66 Z" fill="#fff" />}
        {l.extra === 'coat' && <path d="M24 50 Q22 58 27 60 M27 60 a2 2 0 1 0 0.1 0" fill="none" stroke="#3A6EA5" />}
        {l.extra === 'apron' && <path d="M22 50 L42 50 L44 66 L20 66 Z" fill="#FFF3DA" />}
        {l.extra === 'vest' && <path d="M14 66 Q15 50 25 46 L28 66 Z M50 66 Q49 50 39 46 L36 66 Z" fill="#FFBD42" />}
        {l.extra === 'tie' && <path d="M30 46 L34 46 L35 52 L32 60 L29 52 Z" fill="#F45159" />}
        {l.extra === 'scarf' && <path d="M22 44 Q32 50 42 44 L42 49 Q32 55 22 49 Z" fill="#F45159" />}
        {l.extra === 'badge' && <rect x="37" y="52" width="9" height="6" rx="1.5" fill="#fff" />}
        {/* шия і голова */}
        <path d="M28 40 L28 46 Q32 48 36 46 L36 40 Z" fill={l.skin} />
        <ellipse cx="32" cy="30" rx="12" ry="13" fill={l.skin} />
        <ellipse cx="20.5" cy="31" rx="2.4" ry="3.2" fill={l.skin} />
        <ellipse cx="43.5" cy="31" rx="2.4" ry="3.2" fill={l.skin} />
        {/* зачіска */}
        {l.style === 'short' && <path d="M20 28 Q19 15 32 15 Q45 15 44 28 Q40 21 32 21 Q24 21 20 28 Z" fill={l.hair} />}
        {l.style === 'long' && <path d="M19 32 Q17 15 32 15 Q47 15 45 32 Q42 20 32 20 Q22 20 19 32 Z" fill={l.hair} />}
        {l.style === 'bun' && (
          <>
            <circle cx="32" cy="13" r="5" fill={l.hair} />
            <path d="M20 28 Q19 16 32 16 Q45 16 44 28 Q39 20 32 20 Q25 20 20 28 Z" fill={l.hair} />
          </>
        )}
        {l.style === 'curly' && <path d="M19 29 Q15 22 20 18 Q21 12 28 13 Q32 9 37 13 Q44 12 45 19 Q49 23 45 29 Q42 22 32 22 Q22 22 19 29 Z" fill={l.hair} />}
        {l.extra === 'cap' && (
          <>
            <path d="M19 22 Q20 12 32 12 Q44 12 45 22 Z" fill={l.shirt} />
            <path d="M18 22 L46 22 L48 25 L16 25 Z" fill="#22364A" />
            <circle cx="32" cy="17" r="2" fill="#FFBD42" />
          </>
        )}
      </g>
      {/* обличчя */}
      <g stroke="none">
        <ellipse cx="27.5" cy="31" rx="1.7" ry="2.1" fill={LINE} />
        <ellipse cx="36.5" cy="31" rx="1.7" ry="2.1" fill={LINE} />
        <circle cx="28" cy="30.3" r="0.6" fill="#fff" />
        <circle cx="37" cy="30.3" r="0.6" fill="#fff" />
        <ellipse cx="24.5" cy="35" rx="2.2" ry="1.3" fill="#F45159" opacity="0.3" />
        <ellipse cx="39.5" cy="35" rx="2.2" ry="1.3" fill="#F45159" opacity="0.3" />
      </g>
      <path d="M28.5 36.5 Q32 39.5 35.5 36.5" fill="none" stroke={LINE} strokeWidth="1.6" strokeLinecap="round" />
      {l.extra === 'glasses' && (
        <g fill="none" stroke={LINE} strokeWidth="1.4">
          <circle cx="27.5" cy="31" r="3.6" />
          <circle cx="36.5" cy="31" r="3.6" />
          <path d="M31.1 31 L32.9 31" />
        </g>
      )}
      <circle cx="32" cy="32" r="31" fill="none" stroke="#fff" strokeWidth="2" />
    </svg>
  );
});
