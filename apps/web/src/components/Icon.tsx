/**
 * Єдиний набір лінійних іконок інтерфейсу (24×24, контур 2 px, заокруглені кінці).
 * Кольорові ігрові плитки — GameIcon; ці іконки — для навігації, кнопок і підписів.
 */
import { memo, type ReactNode } from 'react';

export type LineIconName =
  | 'home' | 'map' | 'book' | 'target' | 'user' | 'flame' | 'coin' | 'star' | 'check' | 'lock' | 'play' | 'arrow-right'
  | 'refresh' | 'alert' | 'clock' | 'bolt' | 'headphones' | 'chevron-right' | 'pin' | 'gift' | 'settings' | 'crown' | 'chat'
  | 'trophy' | 'layers' | 'x';

const P: Record<LineIconName, ReactNode> = {
  home: <><path d="M4 11l8-7 8 7" /><path d="M6 10v9h4.5v-5h3v5H18v-9" /></>,
  map: <><path d="M9 4L3.5 6v14L9 18l6 2 5.5-2V4L15 6 9 4z" /><path d="M9 4v14M15 6v14" /></>,
  book: <><path d="M4 5.5C6.5 4 9.5 4 12 6c2.5-2 5.5-2 8-.5V19c-2.5-1.5-5.5-1.5-8 .5-2.5-2-5.5-2-8-.5z" /><path d="M12 6v13.5" /></>,
  target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><path d="M12 12l7-7M16 5h3v3" /></>,
  user: <><circle cx="12" cy="8.5" r="3.8" /><path d="M4.5 20c1.2-3.8 4-5.5 7.5-5.5s6.3 1.7 7.5 5.5" /></>,
  flame: <path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 01-10 0c0-2 1-3.5 2-4.5.3 1.5 1 2.5 2 3 0-3-1-5.5 1-8.5z" />,
  coin: <><circle cx="12" cy="12" r="8" /><path d="M12 7.5v9M9.5 9.5c0-1 1-1.8 2.5-1.8s2.5.8 2.5 1.8-1 1.5-2.5 1.8-2.5.8-2.5 1.9 1 1.8 2.5 1.8 2.5-.8 2.5-1.8" /></>,
  star: <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  lock: <><rect x="5" y="10.5" width="14" height="9.5" rx="2.5" /><path d="M8 10.5V8a4 4 0 018 0v2.5" /></>,
  play: <path d="M8 5.5v13l10-6.5z" />,
  'arrow-right': <><path d="M4.5 12h14" /><path d="M13 6.5l5.5 5.5-5.5 5.5" /></>,
  refresh: <><path d="M19 12a7 7 0 11-2.1-5" /><path d="M19 4.5V9h-4.5" /></>,
  alert: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5v5.5M12 16.5v.5" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.5 2" /></>,
  bolt: <path d="M13 3L5.5 13.5H12L11 21l7.5-10.5H12z" />,
  headphones: <><path d="M4.5 15v-3a7.5 7.5 0 0115 0v3" /><rect x="3.5" y="14" width="4" height="6" rx="1.5" /><rect x="16.5" y="14" width="4" height="6" rx="1.5" /></>,
  'chevron-right': <path d="M9.5 5.5L16 12l-6.5 6.5" />,
  pin: <><path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0113 0c0 5-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.4" /></>,
  gift: <><rect x="4" y="9" width="16" height="11" rx="2" /><path d="M3 9h18M12 9v11M12 9c-1-3-5-4-5-1.5S10.5 9 12 9zm0 0c1-3 5-4 5-1.5S13.5 9 12 9z" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8" /></>,
  crown: <path d="M4 17.5L3 7.5l5 4 4-6 4 6 5-4-1 10z" />,
  chat: <path d="M5 5.5h14a1.5 1.5 0 011.5 1.5v8.5A1.5 1.5 0 0119 17H10l-4.5 3.5V17H5a1.5 1.5 0 01-1.5-1.5V7A1.5 1.5 0 015 5.5z" />,
  trophy: <><path d="M7.5 4.5h9v4a4.5 4.5 0 01-9 0z" /><path d="M7.5 6.5H4.5a3 3 0 003 3.5M16.5 6.5h3a3 3 0 01-3 3.5M12 13v3.5M8.5 20h7M9.5 16.5h5V20h-5z" /></>,
  layers: <><path d="M12 4l8.5 4.5L12 13 3.5 8.5z" /><path d="M3.5 12.5L12 17l8.5-4.5M3.5 16L12 20.5l8.5-4.5" /></>,
  x: <path d="M6 6l12 12M18 6L6 18" />,
};

const FILLED = new Set<LineIconName>(['play', 'star', 'flame', 'bolt']);

export const Icon = memo(function Icon({ name, size = 22, className, filled, strokeWidth = 2 }: { name: LineIconName; size?: number; className?: string; filled?: boolean; strokeWidth?: number }) {
  const fill = filled ?? FILLED.has(name);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {P[name]}
    </svg>
  );
});
