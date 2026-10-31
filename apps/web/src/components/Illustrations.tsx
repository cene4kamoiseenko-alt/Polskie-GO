/**
 * Ілюстрації POLSKI GO в єдиному стилі: м'які заливки, світлий контур, теплі кольори.
 * Сцени місій (вітрини з загальними польськими вивісками — без логотипів мереж),
 * страви та побутові предмети, значки досягнень і штампи паспорта.
 */
import { memo, type ReactNode } from 'react';
import { iconAsset } from '../lib/assets';
import { Art, type ArtName } from './GameArt';
import { Pictogram, hasPictogram } from './pictograms/Pictogram';

const INK = '#3B4A5A';
const SW = 2.2;
const P = {
  cream: '#FFF6E8', sand: '#F3E3C8', coral: '#F45159', coralD: '#D23540', green: '#35C88A', greenD: '#22A06B', sky: '#8FD3F5', skyD: '#55BDF4',
  yellow: '#FFBD42', yellowD: '#E39A14', navy: '#22364A', grape: '#9568F5', brown: '#B87747', brownD: '#8A532C', white: '#FFFFFF', grey: '#C9D3DC', greyD: '#94A3B2',
};

// ───────────────────────── Предмети та страви (64×64) ─────────────────────────

export type ItemName =
  | 'zurek' | 'pierogi' | 'parowki' | 'bigos' | 'placki' | 'zapiekanka' | 'paczki' | 'sernik'
  | 'hotdog' | 'water' | 'coffee' | 'receipt' | 'card' | 'parcel' | 'ticket' | 'tram' | 'train' | 'pump' | 'basket' | 'bag'
  | 'shampoo' | 'bread' | 'locker' | 'headphones' | 'bridge' | 'book-clock' | 'speech' | 'paws' | 'backpack' | 'map' | 'beaver-map' | 'dishes'
  | 'shirt' | 'jacket' | 'shoes' | 'dress' | 'gift' | 'scale' | 'strawberries';

const g = (children: ReactNode) => <g stroke={INK} strokeWidth={SW} strokeLinejoin="round" strokeLinecap="round">{children}</g>;

const ITEMS: Record<ItemName, ReactNode> = {
  zurek: g(<>
    <path d="M8 30h48c0 14-10 24-24 24S8 44 8 30z" fill={P.cream} />
    <ellipse cx="32" cy="30" rx="24" ry="7" fill="#F1DDB8" />
    <ellipse cx="24" cy="29" rx="6" ry="4" fill={P.white} /><circle cx="24" cy="29" r="2.2" fill={P.yellow} strokeWidth={1.4} />
    <circle cx="38" cy="28" r="3.5" fill="#E8B4A0" strokeWidth={1.6} /><circle cx="44" cy="31" r="3" fill="#E8B4A0" strokeWidth={1.6} />
    <path d="M22 18c2-3-1-5 1-8M32 17c2-3-1-5 1-8M42 18c2-3-1-5 1-8" fill="none" stroke={P.greyD} strokeWidth={1.8} />
  </>),
  pierogi: g(<>
    <ellipse cx="32" cy="40" rx="27" ry="12" fill={P.white} /><ellipse cx="32" cy="38" rx="20" ry="7" fill={P.cream} strokeWidth={1.4} />
    {[[18, 34], [32, 30], [46, 34]].map(([x, y]) => (
      <g key={x}><path d={`M${x - 10} ${y + 4}c0-8 20-8 20 0z`} fill="#F7E3B5" /><path d={`M${x - 7} ${y}l2 2m3-3l1 2.6m4-2.4l-1 2.4m5-1.2l-2 2`} fill="none" strokeWidth={1.4} /></g>
    ))}
    <circle cx="26" cy="36" r="1.6" fill={P.yellowD} stroke="none" /><circle cx="40" cy="37" r="1.6" fill={P.yellowD} stroke="none" />
  </>),
  parowki: g(<>
    <rect x="8" y="22" width="48" height="28" rx="6" fill={P.sky} />
    {[0, 1, 2].map((i) => <rect key={i} x="12" y={26 + i * 7.5} width="40" height="6" rx="3" fill="#F2A890" strokeWidth={1.6} />)}
    <path d="M8 30h48" stroke="none" />
    <rect x="22" y="16" width="20" height="8" rx="2" fill={P.white} strokeWidth={1.6} />
  </>),
  bigos: g(<>
    <path d="M10 28h44v14c0 7-6 12-13 12H23c-7 0-13-5-13-12z" fill={P.greyD} />
    <ellipse cx="32" cy="28" rx="22" ry="6" fill="#B98A4A" />
    <path d="M18 27c3-2 6 1 9-1s6 1 9-1 6 1 9-1" fill="none" stroke="#E8D28A" strokeWidth={2} />
    <circle cx="26" cy="29" r="2" fill="#8A3A2A" strokeWidth={1.2} /><circle cx="38" cy="28" r="2" fill="#8A3A2A" strokeWidth={1.2} />
    <path d="M6 30h4M54 30h4" strokeWidth={3} />
  </>),
  placki: g(<>
    <ellipse cx="32" cy="46" rx="26" ry="9" fill={P.white} />
    {[0, 1, 2].map((i) => <ellipse key={i} cx="32" cy={42 - i * 6} rx="19" ry="6" fill={i % 2 ? '#E9B65C' : '#D99A3E'} />)}
    <path d="M24 28c0-5 16-5 16 0 0 3-16 3-16 0z" fill={P.white} />
    <path d="M18 40l3-1m6 2l3-1m8 1l3-1" fill="none" stroke={P.brownD} strokeWidth={1.4} />
  </>),
  zapiekanka: g(<>
    <path d="M6 40c0-6 6-10 14-10h30c6 0 8 4 8 8s-3 8-9 8H14c-5 0-8-2-8-6z" fill="#E9B65C" />
    <path d="M12 34c4-4 34-5 42-1-4 3-32 5-42 1z" fill={P.yellow} />
    {[18, 28, 38, 47].map((x) => <path key={x} d={`M${x} 33a3 3 0 0 1 6 0z`} fill="#C9A88A" strokeWidth={1.4} />)}
    <path d="M14 33c8 2 30 1 40-1" fill="none" stroke={P.coral} strokeWidth={2.4} />
  </>),
  paczki: g(<>
    <ellipse cx="32" cy="38" rx="22" ry="16" fill="#D99A3E" />
    <ellipse cx="32" cy="33" rx="18" ry="9" fill="#E9B65C" stroke="none" />
    <circle cx="44" cy="40" r="4" fill={P.coral} strokeWidth={1.6} />
    {[[24, 30], [30, 27], [38, 29], [27, 35], [35, 34], [42, 32]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="1.3" fill={P.white} stroke="none" />)}
  </>),
  sernik: g(<>
    <path d="M10 30l40-12 4 8v18l-44 6z" fill="#FFE29A" />
    <path d="M10 30l44-4v-8L10 30z" fill="#F7D27A" />
    <path d="M10 44l44-6v6l-44 6z" fill="#C98A4A" />
    <path d="M10 30l40-12 4 8" fill="none" />
  </>),
  hotdog: g(<>
    <path d="M8 36c0-6 6-8 12-8h24c6 0 12 2 12 8s-6 10-12 10H20C14 46 8 42 8 36z" fill="#E9B65C" />
    <rect x="10" y="30" width="44" height="8" rx="4" fill="#E2785E" />
    <path d="M14 33c4-3 6 3 10 0s6 3 10 0 6 3 10 0 6 3 8 1" fill="none" stroke={P.yellow} strokeWidth={2.4} />
  </>),
  water: g(<>
    <rect x="22" y="8" width="20" height="6" rx="2" fill={P.skyD} />
    <path d="M24 14h16v6l4 6v26a4 4 0 0 1-4 4H24a4 4 0 0 1-4-4V26l4-6z" fill="#DDF3FD" />
    <rect x="20" y="32" width="24" height="12" fill={P.sky} />
  </>),
  coffee: g(<>
    <path d="M16 18h32l-4 36H20z" fill={P.white} />
    <rect x="14" y="12" width="36" height="7" rx="3" fill={P.navy} />
    <rect x="18" y="28" width="28" height="12" fill={P.brown} />
    <path d="M28 6c2 2-2 3 0 5M36 6c2 2-2 3 0 5" fill="none" stroke={P.greyD} strokeWidth={1.8} />
  </>),
  receipt: g(<>
    <path d="M16 8h32v48l-4-3-4 3-4-3-4 3-4-3-4 3-4-3-4 3z" fill={P.white} />
    <path d="M22 18h20M22 25h14M22 32h18" fill="none" stroke={P.greyD} />
    <circle cx="40" cy="42" r="9" fill={P.green} /><path d="M35.5 42l3 3 6-6" fill="none" stroke={P.white} strokeWidth={2.6} />
  </>),
  card: g(<>
    <rect x="6" y="16" width="52" height="34" rx="6" fill={P.grape} />
    <rect x="6" y="23" width="52" height="7" fill={P.navy} stroke="none" />
    <rect x="12" y="36" width="12" height="8" rx="2" fill={P.yellow} strokeWidth={1.6} />
    <path d="M44 38c2 2 2 4 0 6M48 36c3 3 3 7 0 10" fill="none" stroke={P.white} strokeWidth={1.8} />
  </>),
  parcel: g(<>
    <path d="M10 22l22-10 22 10v22L32 56 10 44z" fill="#D8A76A" />
    <path d="M10 22l22 10 22-10M32 32v24" fill="none" />
    <path d="M21 17l22 10v8" fill="none" stroke={P.cream} strokeWidth={3} />
  </>),
  ticket: g(<>
    <path d="M6 20h52v8a4 4 0 0 0 0 8v8H6v-8a4 4 0 0 0 0-8z" fill={P.yellow} />
    <path d="M40 20v24" fill="none" strokeDasharray="3 3" />
    <path d="M14 28h18M14 35h12" fill="none" />
  </>),
  tram: g(<>
    <path d="M30 6h4M26 10l6-4 6 4" fill="none" />
    <rect x="12" y="12" width="40" height="38" rx="8" fill={P.coral} />
    <rect x="17" y="18" width="13" height="12" rx="2" fill={P.sky} /><rect x="34" y="18" width="13" height="12" rx="2" fill={P.sky} />
    <rect x="12" y="36" width="40" height="4" fill={P.cream} stroke="none" />
    <circle cx="21" cy="44" r="2.4" fill={P.yellow} /><circle cx="43" cy="44" r="2.4" fill={P.yellow} />
    <path d="M18 50l-4 6M46 50l4 6M10 57h44" fill="none" />
  </>),
  train: g(<>
    <path d="M14 46V20c0-6 6-10 18-10s18 4 18 10v26z" fill={P.skyD} />
    <rect x="20" y="18" width="24" height="12" rx="3" fill={P.cream} />
    <rect x="14" y="36" width="36" height="4" fill={P.white} stroke="none" />
    <circle cx="22" cy="42" r="2.2" fill={P.yellow} /><circle cx="42" cy="42" r="2.2" fill={P.yellow} />
    <path d="M20 46l-6 10M44 46l6 10M10 56h44M14 51h36" fill="none" />
  </>),
  pump: g(<>
    <rect x="12" y="10" width="26" height="44" rx="4" fill={P.coral} />
    <rect x="17" y="16" width="16" height="10" rx="2" fill={P.cream} />
    <text x="25" y="44" textAnchor="middle" fontSize="13" fontWeight="900" fill={P.white} stroke="none">3</text>
    <path d="M38 22h6a4 4 0 0 1 4 4v18a3 3 0 0 0 6 0V24l-5-6" fill="none" />
    <rect x="8" y="54" width="34" height="4" rx="1" fill={P.greyD} />
  </>),
  basket: g(<>
    <path d="M8 26h48l-6 26H14z" fill={P.green} />
    <path d="M20 26l8-14M44 26l-8-14" fill="none" />
    <circle cx="22" cy="22" r="5" fill={P.coral} strokeWidth={1.6} /><rect x="30" y="14" width="8" height="12" rx="2" fill={P.sky} strokeWidth={1.6} />
    <path d="M42 24c0-6 8-6 8 0" fill={P.yellow} strokeWidth={1.6} />
    <path d="M18 34v12M26 34v12M34 34v12M42 34v12" fill="none" stroke={P.greenD} />
  </>),
  bag: g(<>
    <path d="M12 22h40l-4 34H16z" fill={P.green} />
    <path d="M24 22v-4a8 8 0 0 1 16 0v4" fill="none" />
    <path d="M26 34c2-4 10-4 12 0" fill="none" stroke={P.white} strokeWidth={2.4} />
    <rect x="20" y="14" width="8" height="10" rx="2" fill={P.yellow} strokeWidth={1.6} transform="rotate(-12 24 19)" />
  </>),
  shampoo: g(<>
    <rect x="26" y="6" width="12" height="8" rx="2" fill={P.grape} />
    <path d="M20 18c0-3 3-4 6-4h12c3 0 6 1 6 4v34a4 4 0 0 1-4 4H24a4 4 0 0 1-4-4z" fill="#E7DCFD" />
    <rect x="24" y="28" width="16" height="14" rx="3" fill={P.white} />
    <path d="M28 33h8M28 37h5" fill="none" stroke={P.grape} strokeWidth={1.6} />
  </>),
  bread: g(<>
    <path d="M8 38c0-12 12-20 24-20s24 8 24 20c0 6-4 10-10 10H18C12 48 8 44 8 38z" fill="#D99A3E" />
    <path d="M22 28l-4 10M32 24v12M42 28l4 10" fill="none" stroke="#F7E3B5" strokeWidth={2.4} />
  </>),
  locker: g(<>
    <rect x="8" y="8" width="48" height="48" rx="4" fill={P.yellow} />
    {[0, 1, 2].map((r) => [0, 1].map((c) => <rect key={`${r}${c}`} x={13 + c * 20} y={13 + r * 13} width="17" height="10" rx="1.5" fill={P.cream} strokeWidth={1.6} />))}
    <rect x="33" y="26" width="17" height="10" rx="1.5" fill={P.navy} strokeWidth={1.6} />
    <path d="M50 26l6-3v16l-6-3" fill={P.cream} strokeWidth={1.6} />
  </>),
  headphones: g(<>
    <path d="M12 38V32a20 20 0 0 1 40 0v6" fill="none" strokeWidth={3} />
    <rect x="8" y="34" width="12" height="18" rx="5" fill={P.coral} /><rect x="44" y="34" width="12" height="18" rx="5" fill={P.coral} />
    <path d="M28 44c2-3 6-3 8 0M26 40c4-5 8-5 12 0" fill="none" stroke={P.skyD} strokeWidth={1.8} />
  </>),
  bridge: g(<>
    <path d="M4 44h56" fill="none" strokeWidth={3} />
    <path d="M8 44c8-16 40-16 48 0" fill="none" stroke={P.brown} strokeWidth={4} />
    <path d="M18 44v-8M32 44v-12M46 44v-8" fill="none" />
    <rect x="28" y="20" width="8" height="8" rx="1.5" fill={P.green} transform="rotate(12 32 24)" />
    <path d="M4 52c6-3 10 3 16 0s10 3 16 0 10 3 16 0 8 2 8 2" fill="none" stroke={P.skyD} strokeWidth={2} />
  </>),
  'book-clock': g(<>
    <path d="M6 16c8-4 18-4 26 2 8-6 18-6 26-2v34c-8-4-18-4-26 2-8-6-18-6-26-2z" fill={P.sky} />
    <path d="M32 18v34" fill="none" />
    <circle cx="44" cy="20" r="11" fill={P.white} /><path d="M44 14v6l4 3" fill="none" />
  </>),
  speech: g(<>
    <path d="M6 12h30a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H18l-8 6v-6H6a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4z" fill={P.green} />
    <path d="M28 28h30a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4h-4v6l-8-6H28a4 4 0 0 1-4-4V32a4 4 0 0 1 4-4z" fill={P.yellow} />
    <path d="M10 21h20M34 37h20" fill="none" stroke={P.white} strokeWidth={2.4} />
  </>),
  paws: g(<>
    {[[10, 48], [18, 36], [28, 46], [36, 32], [44, 42], [50, 26], [56, 36]].map(([x, y], i) => (
      <g key={i} transform={`translate(${x} ${y}) scale(0.38)`}><ellipse cx="0" cy="4" rx="7" ry="6" fill={P.brown} /><circle cx="-7" cy="-6" r="3" fill={P.brown} /><circle cx="0" cy="-9" r="3" fill={P.brown} /><circle cx="7" cy="-6" r="3" fill={P.brown} /></g>
    ))}
  </>),
  backpack: g(<>
    <path d="M16 20c0-8 7-12 16-12s16 4 16 12v30a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4z" fill="#2BB3A3" />
    <rect x="20" y="32" width="24" height="16" rx="4" fill="#5FD0C2" />
    <circle cx="24" cy="24" r="4" fill={P.coral} strokeWidth={1.6} /><rect x="36" y="20" width="8" height="8" rx="1" fill={P.yellow} strokeWidth={1.6} transform="rotate(10 40 24)" />
    <path d="M26 40h12" fill="none" />
  </>),
  map: g(<>
    <path d="M6 14l16-6 20 6 16-6v42l-16 6-20-6-16 6z" fill={P.cream} />
    <path d="M22 8v42M42 14v42" fill="none" stroke={P.sand} />
    <path d="M12 40c6-8 14-2 20-10s12-4 18-12" fill="none" stroke={P.coral} strokeDasharray="3 3" />
    {[[12, 40], [32, 30], [50, 18]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="3.4" fill={P.green} strokeWidth={1.6} />)}
  </>),
  'beaver-map': g(<>
    <path d="M10 22l14-5 16 5 14-5v32l-14 5-16-5-14 5z" fill={P.cream} />
    <path d="M16 40c6-6 12 0 18-8s10-4 14-10" fill="none" stroke={P.coral} strokeDasharray="3 3" />
    <circle cx="48" cy="22" r="3.4" fill={P.green} strokeWidth={1.6} />
    <circle cx="20" cy="16" r="9" fill={P.brown} /><circle cx="17" cy="15" r="1.3" fill={INK} stroke="none" /><circle cx="23" cy="15" r="1.3" fill={INK} stroke="none" />
    <ellipse cx="20" cy="19" rx="4" ry="2.6" fill={P.cream} strokeWidth={1.4} />
  </>),
  dishes: g(<>
    <ellipse cx="32" cy="44" rx="27" ry="12" fill={P.white} />
    <path d="M14 38c0-5 9-5 9 0z" fill="#F7E3B5" strokeWidth={1.6} /><path d="M22 34c0-5 9-5 9 0z" fill="#F7E3B5" strokeWidth={1.6} />
    <circle cx="42" cy="38" r="7" fill="#D99A3E" strokeWidth={1.6} /><circle cx="45" cy="40" r="2" fill={P.coral} strokeWidth={1.2} />
    <path d="M24 46l12-3v5l-12 3z" fill="#FFE29A" strokeWidth={1.6} />
    <path d="M16 20c1-2-1-3 0-5M48 22c1-2-1-3 0-5" fill="none" stroke={P.greyD} strokeWidth={1.6} />
  </>),
  // Одяг, подарунок, вага і ягоди (Вроцлав, уроки 5–16): ті самі контури й заливки, що й у решти предметів.
  shirt: g(<>
    <path d="M20 10 8 18l6 10 6-4v30h24V24l6 4 6-10-12-8c-2 5-6 7-12 7s-10-2-12-7z" fill={P.coral} />
    <path d="M32 16v38" fill="none" stroke={P.coralD} strokeWidth={2} />
    <path d="M22 9l10 11L42 9l6 3-10 12-6-4-6 4L16 12z" fill={P.white} strokeWidth={2} />
    <circle cx="32" cy="30" r="1.5" fill={P.white} stroke="none" /><circle cx="32" cy="38" r="1.5" fill={P.white} stroke="none" /><circle cx="32" cy="46" r="1.5" fill={P.white} stroke="none" />
  </>),
  jacket: g(<>
    <path d="M22 8h20l10 8 6 30-8 2-2-14v22H20V34l-2 14-8-2 6-30z" fill={P.skyD} />
    <path d="M32 20v36" fill="none" />
    <path d="M22 8l10 12 10-12" fill={P.white} />
    <rect x="23" y="40" width="8" height="8" rx="2" fill={P.sky} strokeWidth={1.6} />
    <circle cx="36" cy="28" r="1.5" fill={P.navy} stroke="none" /><circle cx="36" cy="36" r="1.5" fill={P.navy} stroke="none" />
  </>),
  shoes: g(<>
    <path d="M8 46V26c0-3 2-4 4-4h6c2 6 8 8 14 8 8 0 14 4 22 10v6z" fill={P.green} />
    <rect x="6" y="44" width="52" height="9" rx="4.5" fill={P.white} />
    <path d="M22 28l5 3m1-7 5 3" fill="none" stroke={P.white} strokeWidth={2.2} />
    <path d="M10 36h8" fill="none" stroke={P.greenD} strokeWidth={2.4} />
  </>),
  dress: g(<>
    <path d="M24 8h16l2 14-4 6 12 28H14l12-28-4-6z" fill={P.grape} />
    <path d="M26 28h12" fill="none" stroke={P.yellow} strokeWidth={3.2} />
    <path d="M28 8c1 5 7 5 8 0" fill="none" stroke={P.white} strokeWidth={2} />
  </>),
  gift: g(<>
    <rect x="10" y="26" width="44" height="28" rx="3" fill={P.coral} />
    <rect x="8" y="18" width="48" height="10" rx="3" fill={P.coralD} />
    <rect x="28" y="18" width="8" height="36" fill={P.yellow} strokeWidth={1.8} />
    <path d="M32 18c-8-12-18-6-12 0M32 18c8-12 18-6 12 0" fill="none" />
  </>),
  scale: g(<>
    <path d="M32 10v38" fill="none" strokeWidth={3} />
    <path d="M12 16h40" fill="none" strokeWidth={3} />
    <path d="M14 16 6 36M14 16l8 20M50 16l-8 20M50 16l8 20" fill="none" strokeWidth={1.6} />
    <path d="M6 36h16c0 6-4 9-8 9s-8-3-8-9zM42 36h16c0 6-4 9-8 9s-8-3-8-9z" fill={P.yellow} />
    <path d="M20 54h24" fill="none" strokeWidth={4} />
    <circle cx="32" cy="10" r="3" fill={P.coral} />
  </>),
  strawberries: g(<>
    <path d="M32 20c-12-4-20 4-16 16 3 10 10 18 16 18s13-8 16-18c4-12-4-20-16-16z" fill={P.coral} />
    <path d="M22 18l6 4 4-9 4 9 6-4-4 9H26z" fill={P.green} />
    {[[24, 34], [34, 36], [30, 44], [39, 30], [26, 42], [37, 44]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="1.5" fill={P.yellow} stroke="none" />)}
  </>),
};

export const Item = memo(function Item({ name, size = 48, className }: { name: ItemName; size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} aria-hidden>
      {ITEMS[name]}
    </svg>
  );
});

// ───────────────────────── Сцени місій (360×170) ─────────────────────────

export type SceneName =
  | 'shop-corner' | 'cafe-pierogi' | 'supermarket' | 'petrol-station' | 'parcel-locker' | 'tram-stop' | 'train-station'
  | 'milk-bar' | 'bakery' | 'street-food' | 'drugstore' | 'flat' | 'work' | 'clinic'
  | 'hotel' | 'university' | 'market-square' | 'restaurant' | 'castle' | 'office'
  | 'clothes-shop' | 'market-hall' | 'gift-shop'
  // Сезонні пропуски (content/seasons.ts на сервері)
  | 'pastry-shop' | 'old-market' | 'christmas-market' | 'amusement-park';

type Shop = { sign: string; wall: string; awning: string; accent: string; items: ItemName[] };
const SHOPS: Record<SceneName, Shop> = {
  'shop-corner': { sign: 'SKLEP 24h', wall: '#E8F6EF', awning: P.green, accent: P.greenD, items: ['hotdog', 'water', 'coffee'] },
  'cafe-pierogi': { sign: 'PIEROGARNIA', wall: '#FFF1E0', awning: P.coral, accent: P.coralD, items: ['pierogi', 'zurek', 'sernik'] },
  supermarket: { sign: 'SUPERMARKET', wall: '#FFF7E0', awning: P.yellow, accent: P.yellowD, items: ['parowki', 'bread', 'basket'] },
  'petrol-station': { sign: 'STACJA PALIW', wall: '#FDECEC', awning: P.coral, accent: P.coralD, items: ['pump', 'coffee', 'receipt'] },
  'parcel-locker': { sign: 'PACZKOMAT', wall: '#FFF7E0', awning: P.yellow, accent: P.yellowD, items: ['locker', 'parcel', 'card'] },
  'tram-stop': { sign: 'PRZYSTANEK', wall: '#E6F5FD', awning: P.skyD, accent: P.navy, items: ['tram', 'ticket', 'map'] },
  'train-station': { sign: 'DWORZEC', wall: '#EAF2F8', awning: P.navy, accent: P.skyD, items: ['train', 'ticket', 'coffee'] },
  'milk-bar': { sign: 'BAR MLECZNY', wall: '#EEF6FF', awning: P.sky, accent: P.skyD, items: ['placki', 'bigos', 'pierogi'] },
  bakery: { sign: 'PIEKARNIA', wall: '#FFF1E0', awning: P.brown, accent: P.brownD, items: ['paczki', 'sernik', 'bread'] },
  'street-food': { sign: 'ZAPIEKANKI', wall: '#FFF3D6', awning: P.grape, accent: '#6E45D8', items: ['zapiekanka', 'coffee', 'water'] },
  drugstore: { sign: 'DROGERIA', wall: '#F4EEFF', awning: P.grape, accent: '#6E45D8', items: ['shampoo', 'bag', 'card'] },
  flat: { sign: 'MIESZKANIE', wall: '#F3EFE7', awning: P.greyD, accent: P.navy, items: ['map', 'parcel', 'speech'] },
  work: { sign: 'BIURO', wall: '#EEF2F6', awning: P.navy, accent: P.skyD, items: ['speech', 'coffee', 'book-clock'] },
  clinic: { sign: 'PRZYCHODNIA', wall: '#EAF8F2', awning: P.green, accent: P.greenD, items: ['speech', 'book-clock', 'card'] },
  hotel: { sign: 'HOTEL ★★★', wall: '#F4ECFF', awning: P.grape, accent: '#6E45D8', items: ['card', 'backpack', 'coffee'] },
  university: { sign: 'UNIWERSYTET', wall: '#EEF2F6', awning: P.navy, accent: P.skyD, items: ['book-clock', 'speech', 'map'] },
  'market-square': { sign: 'RYNEK GŁÓWNY', wall: '#FFF3D6', awning: P.coral, accent: P.coralD, items: ['map', 'paczki', 'coffee'] },
  restaurant: { sign: 'RESTAURACJA', wall: '#FFF1E0', awning: P.brown, accent: P.brownD, items: ['zurek', 'pierogi', 'dishes'] },
  castle: { sign: 'WAWEL', wall: '#F7E7D2', awning: P.yellow, accent: P.yellowD, items: ['map', 'beaver-map', 'ticket'] },
  office: { sign: 'URZĄD', wall: '#EEF2F6', awning: P.navy, accent: P.skyD, items: ['card', 'receipt', 'book-clock'] },
  'clothes-shop': { sign: 'ODZIEŻ', wall: '#FBEFF6', awning: '#E86FA8', accent: '#B84A82', items: ['shirt', 'jacket', 'shoes'] },
  'market-hall': { sign: 'HALA TARGOWA', wall: '#F1F6E8', awning: P.greenD, accent: '#177A52', items: ['strawberries', 'scale', 'basket'] },
  'gift-shop': { sign: 'PREZENTY', wall: '#FFF3E6', awning: '#F28B30', accent: '#C4691C', items: ['gift', 'bag', 'dress'] },
  'pastry-shop': { sign: 'CUKIERNIA', wall: '#FFF1E6', awning: '#E86FA8', accent: '#B84A82', items: ['bread', 'paczki', 'coffee'] },
  'old-market': { sign: 'STARY RYNEK', wall: '#FFF3D6', awning: P.coral, accent: P.coralD, items: ['map', 'bread', 'coffee'] },
  'christmas-market': { sign: 'JARMARK', wall: '#F3F7EF', awning: '#C8102E', accent: '#1F7A4D', items: ['gift', 'coffee', 'paczki'] },
  'amusement-park': { sign: 'PARK ROZRYWKI', wall: '#EEF0FF', awning: '#9D69FF', accent: '#6B45D8', items: ['ticket', 'map', 'backpack'] },
};

/** Предмети у вітрині сцени — щоб кожне завдання уроку мало свою «картинку», а не однаковий фон. */
export const SCENE_ITEM_POOLS: Record<SceneName, ItemName[]> = Object.fromEntries(
  (Object.keys(SHOPS) as SceneName[]).map((k) => [k, SHOPS[k].items]),
) as Record<SceneName, ItemName[]>;

/** Ілюстрована вітрина місії: небо, будинок з навісом і вивіскою, товари у вітрині. */
export const Scene = memo(function Scene({ name, className, dim, items, evening }: { name: SceneName | string; className?: string; dim?: boolean; items?: ItemName[]; evening?: boolean }) {
  const s = SHOPS[name as SceneName] ?? SHOPS['shop-corner'];
  const shown = items?.length ? items.slice(0, 3) : s.items;
  const id = `sc-${name}${evening ? '-e' : ''}`;
  return (
    <svg viewBox="0 0 360 170" className={className} preserveAspectRatio="xMidYMid slice" aria-hidden style={dim ? { filter: 'grayscale(0.8) opacity(0.7)' } : undefined}>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">{evening ? <><stop offset="0" stopColor="#1B2E5C" /><stop offset="0.6" stopColor="#5B4B8A" /><stop offset="1" stopColor="#F6A97A" /></> : <><stop offset="0" stopColor="#BFE7FB" /><stop offset="1" stopColor="#EAF7FD" /></>}</linearGradient>
      </defs>
      <rect width="360" height="170" fill={`url(#${id}-sky)`} />
      <circle cx="312" cy="34" r="16" fill={evening ? '#FFF1C9' : '#FFE08A'} />
      <path d="M30 38c6-8 20-8 26 0 8-2 14 4 12 10H22c-4-6 2-12 8-10z" fill={P.white} opacity="0.9" />
      <path d="M220 26c5-6 16-6 20 0 6-1 10 3 9 8h-33c-3-4 0-9 4-8z" fill={P.white} opacity="0.8" />
      {/* сусідні будинки */}
      <rect x="0" y="62" width="60" height="98" fill="#F7E7D2" stroke={INK} strokeWidth={SW} />
      <rect x="300" y="54" width="60" height="106" fill="#E9EEF2" stroke={INK} strokeWidth={SW} />
      {[0, 1].map((r) => <rect key={r} x="14" y={76 + r * 30} width="16" height="18" rx="2" fill={P.sky} stroke={INK} strokeWidth={1.6} />)}
      {[0, 1].map((r) => <rect key={r} x="322" y={70 + r * 32} width="18" height="20" rx="2" fill={P.sky} stroke={INK} strokeWidth={1.6} />)}
      {/* головний фасад */}
      <rect x="60" y="40" width="240" height="120" rx="6" fill={s.wall} stroke={INK} strokeWidth={SW} />
      <rect x="92" y="48" width="176" height="26" rx="8" fill={s.accent} stroke={INK} strokeWidth={SW} />
      <text x="180" y="66.5" textAnchor="middle" fontSize="15" fontWeight="900" letterSpacing="1.5" fill={P.white} fontFamily="Nunito, system-ui, sans-serif">{s.sign}</text>
      {/* навіс у смужку */}
      <path d="M64 80h232l-10 20H74z" fill={s.awning} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${82 + i * 38} 80l-5 20h19l5-20z`} fill={P.white} opacity="0.55" />)}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => <path key={i} d={`M${74 + i * 35.4} 100a17.7 8 0 0 0 35.4 0`} fill={s.awning} stroke={INK} strokeWidth={1.8} />)}
      {/* вітрина з товарами */}
      <rect x="76" y="112" width="140" height="44" rx="4" fill="#DDF3FD" stroke={INK} strokeWidth={SW} />
      {shown.map((it, i) => (
        <g key={`${it}-${i}`} transform={`translate(${84 + i * 44} 114) scale(0.62)`}>{ITEMS[it]}</g>
      ))}
      {/* двері */}
      <rect x="230" y="108" width="54" height="52" rx="4" fill={s.accent} stroke={INK} strokeWidth={SW} />
      <rect x="238" y="116" width="38" height="24" rx="3" fill="#DDF3FD" stroke={INK} strokeWidth={1.6} />
      <circle cx="274" cy="146" r="2.4" fill={P.yellow} stroke={INK} strokeWidth={1.4} />
      <rect x="0" y="158" width="360" height="12" fill="#E7D9C3" stroke={INK} strokeWidth={SW} />
    </svg>
  );
});

// ───────────────────────── Значки досягнень ─────────────────────────

const BADGE_ART: Record<string, { item: ItemName; color: string }> = {
  'snack-bag': { item: 'bag', color: P.green },
  'receipt-check': { item: 'receipt', color: P.green },
  basket: { item: 'basket', color: P.yellow },
  'pierogi-plate': { item: 'pierogi', color: P.coral },
  dishes: { item: 'dishes', color: P.coral },
  'soup-bowl': { item: 'zurek', color: P.yellow },
  'coffee-cup': { item: 'coffee', color: P.brown },
  'fuel-pump': { item: 'pump', color: P.coral },
  'parcel-locker': { item: 'locker', color: P.yellow },
  tram: { item: 'tram', color: P.skyD },
  'train-ticket': { item: 'train', color: P.skyD },
  'backpack-patches': { item: 'backpack', color: '#2BB3A3' },
  'map-pins': { item: 'map', color: P.green },
  headphones: { item: 'headphones', color: P.grape },
  bridge: { item: 'bridge', color: P.skyD },
  'book-clock': { item: 'book-clock', color: P.grape },
  speech: { item: 'speech', color: P.green },
  paws: { item: 'paws', color: P.yellow },
  'beaver-map': { item: 'beaver-map', color: P.coral },
  office: { item: 'card', color: P.navy },
  'season-rogal': { item: 'bread', color: '#C8502E' },
  'season-gift': { item: 'gift', color: '#1F8A5B' },
  'season-ticket': { item: 'ticket', color: '#6B45D8' },
};

export type Tier = 'bronze' | 'silver' | 'gold' | 'legendary';
/** Рівень досягнення за винагородою: бронза < 20, срібло < 50, золото < 100, легенда ≥ 100 Złotki. */
export const achTier = (zlotki: number): Tier => (zlotki >= 100 ? 'legendary' : zlotki >= 50 ? 'gold' : zlotki >= 20 ? 'silver' : 'bronze');
const TIER_COLORS: Record<Tier, [string, string, string]> = {
  bronze: ['#F6C29A', '#C06A33', '#7A3A12'],
  silver: ['#F4F8FC', '#A9B8CA', '#55657A'],
  gold: ['#FFE38A', '#EE9F1E', '#8A5200'],
  legendary: ['#C9A6FF', '#7A4CF0', '#3A1F86'],
};

/** Значок досягнення: медальйон з унікальною ілюстрацією; рамка за рівнем; незароблений — сірий із замком. */
/**
 * Растрові символи досягнень (src/assets/icons). Старі досягнення мають емодзі в БД —
 * їм теж підбираємо власний символ, щоб жоден значок не був заглушкою.
 */
const BADGE_RASTER: Record<string, string> = {
  'snack-bag': 'shopping', basket: 'shopping', 'pierogi-plate': 'food', 'coffee-cup': 'cafe', 'backpack-patches': 'profile',
  'map-pins': 'map', headphones: 'listening', 'book-clock': 'dictionary', speech: 'dialog', dragon: 'dragon', gnome: 'gnome',
  explore: 'explore', mic: 'pronunciation', writing: 'writing', gift: 'gift', trophy: 'leaderboard', passport: 'passport', house: 'house',
  '📘': 'lessons', '🔥': 'streak', '💪': 'achievements', '📖': 'writing', '📚': 'dictionary', '🎫': 'passport', '🗺️': 'map',
  '🛍️': 'shopping', '🤝': 'dialog', '📜': 'quests', '🎁': 'gift', '🏆': 'leaderboard',
};
const BADGE_VECTOR: Record<string, ArtName> = { '🐾': 'sprout', '🎓': 'grad', '⭐': 'star', '💯': 'star', '🧠': 'crown' };

export const Badge = memo(function Badge({ icon, unlocked, size = 72, tier }: { icon: string; unlocked: boolean; size?: number; tier?: Tier }) {
  const raster = BADGE_RASTER[icon] ? iconAsset(BADGE_RASTER[icon]) : null;
  const art = raster ? undefined : BADGE_ART[icon];
  // Невідомий значок — векторна зірка (емодзі в інтерфейсі не показуємо).
  const vector = raster || art ? undefined : (BADGE_VECTOR[icon] ?? 'star');
  const color = art?.color ?? P.yellow;
  const tc = tier ? TIER_COLORS[tier] : null;
  const gid = `bdg-${tier ?? 'none'}`;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size, filter: unlocked && tier === 'legendary' ? 'drop-shadow(0 0 8px rgba(157,105,255,0.75))' : unlocked && tier === 'gold' ? 'drop-shadow(0 0 7px rgba(255,200,87,0.6))' : undefined }}>
      <div className="relative" style={unlocked ? undefined : { filter: 'grayscale(1)', opacity: 0.55 }}>
      <svg viewBox="0 0 80 80" width={size} height={size} aria-hidden className="block">
        {tc && (
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stopColor={tc[0]} /><stop offset="1" stopColor={tc[1]} /></linearGradient>
          </defs>
        )}
        <path d="M40 4l9 6 11-1 4 10 10 5-1 11 6 9-6 9 1 11-10 5-4 10-11-1-9 6-9-6-11 1-4-10-10-5 1-11-6-9 6-9-1-11 10-5 4-10 11 1z" fill={tc ? `url(#${gid})` : color} stroke={tc ? tc[2] : INK} strokeWidth={2.2} strokeLinejoin="round" />
        {tc && <path d="M22 16 Q40 6 58 16" stroke="#fff" strokeWidth="2.4" fill="none" opacity="0.55" strokeLinecap="round" />}
        <circle cx="40" cy="40" r="27" fill={P.cream} stroke={tc ? tc[2] : INK} strokeWidth={2} />
        <circle cx="40" cy="40" r="23" fill="none" stroke={tc ? tc[1] : color} strokeWidth={1.6} strokeDasharray="2 3" />
        {art ? <g transform="translate(19 19) scale(0.66)">{ITEMS[art.item]}</g> : null}
      </svg>
      {raster && <img src={raster} alt="" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: size * 0.6, height: size * 0.6, objectFit: 'contain' }} draggable={false} />}
      {vector && <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 leading-[0]"><Art name={vector} size={size * 0.52} /></span>}
      </div>
      {!unlocked && (
        <span className="absolute -bottom-0.5 -right-0.5 grid h-6 w-6 place-items-center rounded-full bg-elev shadow" aria-hidden>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><rect x="5" y="10.5" width="14" height="9.5" rx="2.5" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></svg>
        </span>
      )}
    </div>
  );
});

// ───────────────────────── Штампи паспорта ─────────────────────────

/** Силует пам'ятки міста для штампа (простий контур 40×40). */
const LANDMARK: Record<string, ReactNode> = {
  warszawa: <path d="M20 6c3 3 3 7 0 9 4 1 6 5 5 9l5-2-2 6-6 1c-2 5-6 7-10 7l4-6c-3-2-4-6-2-9-3-3-2-8 1-10 1-3 3-4 5-5z" />,
  krakow: <path d="M12 34V14l3-6 3 6v20M22 34V18l3-8 3 8v16M10 34h22M15 18h0M25 22h0" />,
  wroclaw: <path d="M20 8a5 5 0 0 1 5 5l-1 2h-8l-1-2a5 5 0 0 1 5-5zM15 15l-3 9h16l-3-9M14 24v9M26 24v9M12 33h16M17 18h0M23 18h0" />,
  poznan: <path d="M8 30c2-6 6-8 10-8l2-4 2 4c4 0 8 2 10 8M14 22l-2-6M26 22l2-6M10 30v4M30 30v4" />,
  gdansk: <path d="M20 6v28M14 12l6-6 6 6M12 18h16M16 34h8M20 6l-4 4M20 6l4 4" />,
  torun: <path d="M20 34c-8-5-13-10-13-16a6.5 6.5 0 0 1 13-2 6.5 6.5 0 0 1 13 2c0 6-5 11-13 16zM14 18h0M26 18h0M17 24c2 2 4 2 6 0" />,
  katowice: <path d="M6 22c4-6 24-6 28 0-4 4-24 4-28 0zM10 24l-2 8M30 24l2 8M20 26v8" />,
  opole: <path d="M16 6h8v12a4 4 0 0 1-8 0zM20 22v8M14 34h12M13 14h14" />,
  lodz: <path d="M16 34V12h8v22M14 12h12M20 6v6M12 34h16M18 18h4M18 24h4" />,
  'zielona-gora': <path d="M20 8v6M14 16a3 3 0 1 0 0 .1M20 16a3 3 0 1 0 0 .1M26 16a3 3 0 1 0 0 .1M17 22a3 3 0 1 0 0 .1M23 22a3 3 0 1 0 0 .1M20 28a3 3 0 1 0 0 .1" />,
  gorzow: <path d="M6 18c4-3 8 3 12 0s8 3 12 0 6 2 6 2M6 26c4-3 8 3 12 0s8 3 12 0 6 2 6 2" />,
  szczecin: <path d="M8 32h24M10 32v-6h20v6M14 26v-6h12v6M17 20v-6h6v6" />,
  gdynia: <path d="M6 26h28l-4 6H10zM12 26V14l10 8H12M20 26V10" />,
  bydgoszcz: <path d="M14 34l4-14 6-4M18 20l-6-4M24 16a10 10 0 0 1 4 12M24 16l4-6" />,
  olsztyn: <path d="M10 34V16l4-4 4 4v18M18 20h12v14M22 26h4M8 34h24" />,
  bialystok: <path d="M6 34V20h28v14M12 20v-6h16v6M20 14V8M6 34h28M12 26h4M24 26h4" />,
  lublin: <path d="M12 8h16v24H12zM16 14h8M16 19h8M16 24h5M24 30l4 4" />,
  rzeszow: <path d="M8 34V20a12 12 0 0 1 24 0v14M14 34V24a6 6 0 0 1 12 0v10M8 34h24" />,
  kielce: <path d="M4 32l10-14 6 8 6-10 10 16zM12 26h6" />,
  zakopane: <path d="M4 32L16 10l6 10 4-6 10 18zM13 18l3 3 3-3" />,
};

export const Stamp = memo(function Stamp({ slug, name, date, stamped, size = 104 }: { slug: string; name: string; date?: string | null; stamped: boolean; size?: number }) {
  const color = stamped ? (slug.length % 2 ? P.coral : P.skyD) : P.grey;
  const rot = stamped ? ((slug.charCodeAt(0) % 9) - 4) * 1.5 : 0;
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden style={{ transform: `rotate(${rot}deg)` }}>
      <circle cx="60" cy="60" r="54" fill="none" stroke={color} strokeWidth="4" strokeDasharray={stamped ? undefined : '6 6'} />
      <circle cx="60" cy="60" r="46" fill="none" stroke={color} strokeWidth="1.6" />
      <defs><path id={`arc-${slug}`} d="M22 60a38 38 0 0 1 76 0" /></defs>
      <text fontSize="13" fontWeight="900" letterSpacing="1.5" fill={color} fontFamily="Nunito, system-ui, sans-serif">
        <textPath href={`#arc-${slug}`} startOffset="50%" textAnchor="middle">{name.toUpperCase()}</textPath>
      </text>
      <g transform="translate(40 46)" fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">{LANDMARK[slug] ?? <circle cx="20" cy="20" r="10" />}</g>
      {date && <text x="60" y="98" textAnchor="middle" fontSize="11" fontWeight="800" fill={color} fontFamily="Nunito, system-ui, sans-serif">{date}</text>}
    </svg>
  );
});

/**
 * Картинки завдань (емодзі-ключ у контенті) → намальований предмет гри. Ключі без малюнка лишаються піктограмою (Lucide/власна).
 * Тут тільки те, що вже намальовано в стилі сцен; нові предмети додаються разом з ITEMS.
 */
export const ITEM_ART: Record<string, ItemName> = {
  '👕': 'shirt', '🧥': 'jacket', '👟': 'shoes', '👗': 'dress', '🎁': 'gift', '⚖️': 'scale', '🍓': 'strawberries', '🛍️': 'bag',
  '🥟': 'pierogi', '🧾': 'receipt', '💳': 'card', '🎫': 'ticket', '🚋': 'tram', '🚆': 'train', '🍞': 'bread', '☕': 'coffee', '💧': 'water', '🌭': 'hotdog',
};

/** Картинка варіанта або слова в завданні: намальований предмет, якщо він є, інакше піктограма. */
export const ArtPicture = memo(function ArtPicture({ emoji, size = 56, seed, className }: { emoji: string | null | undefined; size?: number; seed?: string; className?: string }) {
  const item = emoji ? ITEM_ART[emoji] : undefined;
  if (item) return <span className={`grid shrink-0 place-items-center rounded-2xl bg-muted ${className ?? ''}`} style={{ width: size, height: size }} data-art={item}><Item name={item} size={size * 0.86} /></span>;
  return <Pictogram emoji={emoji} size={size} seed={seed} className={className} />;
});

// ───────────────────────── Плитка слова словника ─────────────────────────

const WORD_ITEM: Record<string, ItemName> = {
  'żurek': 'zurek', pierogi: 'pierogi', 'parówki': 'parowki', bigos: 'bigos', 'placki ziemniaczane': 'placki', zapiekanka: 'zapiekanka', 'pączek': 'paczki', sernik: 'sernik',
  'hot dog': 'hotdog', woda: 'water', kawa: 'coffee', paragon: 'receipt', karta: 'card', paczka: 'parcel', paczkomat: 'locker', bilet: 'ticket', tramwaj: 'tram',
  'pociąg': 'train', dystrybutor: 'pump', torba: 'bag', szampon: 'shampoo', chleb: 'bread', 'bułka': 'bread', rachunek: 'receipt', 'kod odbioru': 'locker', skrytka: 'locker',
};
const TILE_COLORS = ['#35C88A', '#55BDF4', '#FFBD42', '#F45159', '#9568F5', '#2BB3A3'];

/** Ілюстрація слова (якщо є) або однакова для всіх слів плитка з першою літерою. */
export const WordTile = memo(function WordTile({ pl, size = 48, picture }: { pl: string; size?: number; picture?: string | null }) {
  const item = WORD_ITEM[pl];
  if (item) {
    return <span className="grid shrink-0 place-items-center rounded-2xl bg-muted" style={{ width: size, height: size }}><Item name={item} size={size * 0.82} /></span>;
  }
  // Ключ картинки слова зі словника (історично емодзі) → піктограма; невідомий ключ — буквена плитка.
  if (hasPictogram(picture)) return <Pictogram emoji={picture} size={size} seed={pl} />;
  const color = TILE_COLORS[[...pl].reduce((h, c) => h + c.charCodeAt(0), 0) % TILE_COLORS.length];
  return (
    <span className="grid shrink-0 place-items-center rounded-2xl font-black text-white" style={{ width: size, height: size, background: color, fontSize: size * 0.42, boxShadow: 'inset 0 -3px 0 rgb(0 0 0 / 0.12)' }} aria-hidden>
      {pl.charAt(0).toUpperCase()}
    </span>
  );
});
