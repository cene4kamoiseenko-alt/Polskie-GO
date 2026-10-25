/**
 * Ілюстрований банер поточного міста (головна, профіль). Для Кракова — художня сцена з
 * заставки (Вавель, Маріацький костел, кам'яниці, Żabka); для інших міст — вулиця старого
 * міста з великою пам'яткою цього міста. Дорожній вказівник з назвою міста.
 */
import { memo, type ReactNode } from 'react';
import { CityLayers } from './CityScenes';
import { cityAsset } from '../lib/assets';
import { FarCityArt, MidCityArt, PlazaArt } from './SplashWorld';

function Signpost({ name }: { name: string }) {
  const w = Math.max(70, name.length * 11 + 26);
  return (
    <g transform="translate(14 22)">
      <rect x="10" y="10" width="7" height="120" fill="#8A5A36" stroke="#2A1B10" strokeWidth="2" />
      <path d={`M0 0 H${w} L${w + 14} 15 L${w} 30 H0 Z`} fill="#B8834F" stroke="#2A1B10" strokeWidth="2.4" strokeLinejoin="round" />
      <path d={`M4 6 H${w - 2}`} stroke="#D9A86E" strokeWidth="2" />
      <text x={w / 2 + 2} y="21" textAnchor="middle" fontSize="15" fontWeight="900" fill="#3A220F" fontFamily="Nunito, system-ui, sans-serif" letterSpacing="0.5">{name.toUpperCase()}</text>
    </g>
  );
}

export const CityHero = memo(function CityHero({ slug, color, name, height = 236, className = '', children, evening, sign = true }: { slug: string; color: string; name: string; height?: number; className?: string; children?: ReactNode; evening?: boolean; sign?: boolean }) {
  const krakow = slug === 'krakow';
  const photo = cityAsset(slug);
  if (photo) {
    return (
      <div className={`relative overflow-hidden ${className}`} style={{ height }}>
        <img src={photo} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
        {children}
      </div>
    );
  }
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ height }}>
      <svg viewBox="0 0 390 240" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="ch-sky" x1="0" y1="0" x2="0" y2="1">
            {evening ? (
              <><stop offset="0" stopColor="#24366E" /><stop offset="0.55" stopColor="#8C5E9E" /><stop offset="1" stopColor="#F7B27A" /></>
            ) : (
              <><stop offset="0" stopColor="#2C92EA" /><stop offset="0.6" stopColor="#8FD0FA" /><stop offset="1" stopColor="#F2E6CF" /></>
            )}
          </linearGradient>
        </defs>
        <rect width="390" height="240" fill="url(#ch-sky)" />
        <circle cx="350" cy="30" r="40" fill="#FFF6D0" opacity={evening ? 0.25 : 0.45} />
        {krakow ? (
          <>
            <g transform="translate(-34 -118) scale(0.6)">
              <FarCityArt />
            </g>
            <g transform="translate(-8 -424) scale(0.84)">
              <PlazaArt />
              <MidCityArt />
            </g>
          </>
        ) : (
          <CityLayers slug={slug} color={color} />
        )}
        {sign && name && <Signpost name={name} />}
      </svg>
      {children}
    </div>
  );
});
