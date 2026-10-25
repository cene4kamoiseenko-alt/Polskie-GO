/** Прапорець мови інтерфейсу (SVG, без емодзі). Для російської — нейтральний глобус. */
import { PictoTile } from './Pictogram';

export function LangFlag({ code, size = 28 }: { code: string; size?: number }) {
  const w = size;
  const h = Math.round(size * 0.7);
  const frame = { width: w, height: h, borderRadius: 4, display: 'block', boxShadow: '0 0 0 1px rgb(0 0 0 / 0.15)' } as const;
  if (code === 'uk') return <svg viewBox="0 0 3 2" style={frame} aria-hidden><rect width="3" height="1" fill="#0057B7" /><rect y="1" width="3" height="1" fill="#FFD700" /></svg>;
  if (code === 'pl') return <svg viewBox="0 0 8 5" style={frame} aria-hidden><rect width="8" height="2.5" fill="#fff" /><rect y="2.5" width="8" height="2.5" fill="#DC143C" /></svg>;
  if (code === 'en') {
    return (
      <svg viewBox="0 0 60 30" style={frame} aria-hidden>
        <rect width="60" height="30" fill="#012169" />
        <path d="M0 0 60 30M60 0 0 30" stroke="#fff" strokeWidth="6" />
        <path d="M0 0 60 30M60 0 0 30" stroke="#C8102E" strokeWidth="2.4" />
        <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" />
        <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6" />
      </svg>
    );
  }
  return <PictoTile spec={['globe', 'transport']} size={h} />;
}
