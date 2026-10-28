/**
 * Піктограма замість емодзі. Контент у БД зберігає картинку варіанта як емодзі — це стабільний
 * ключ (exact-match оновлення не потрібні), але в інтерфейсі емодзі не показується ніколи:
 *  - людина → портрет NpcAvatar;
 *  - цифра-клавіша → плитка з цифрою;
 *  - відоме поняття → контурна піктограма (Lucide або власна) на кольоровій плитці;
 *  - невідоме → нейтральна плитка-зображення (без емодзі).
 * Тон плитки задає групу: їжа, напої, транспорт, місця, дім, природа, напрямки.
 */
import { memo } from 'react';
import { CUSTOM } from './custom';
import { LUCIDE } from './lucide';
import { NpcAvatar, isPersonEmoji } from './NpcAvatar';

export type Tone = 'food' | 'drink' | 'transport' | 'place' | 'home' | 'nature' | 'way' | 'thing' | 'symbol';
type Spec = [icon: string, tone: Tone];

/** Емодзі-ключ контенту → [іконка, тон]. Варіанти одного завдання мають різні іконки. */
const PICTO: Record<string, Spec> = {
  // Час доби, привітання
  '🌙': ['moon', 'nature'], '☀️': ['sun', 'nature'], '🌆': ['sunset', 'nature'], '👋': ['hand', 'symbol'], '🙏': ['please', 'symbol'],
  // Транспорт
  '🚇': ['train-front-tunnel', 'transport'], '🚋': ['tram-front', 'transport'], '🚌': ['bus-front', 'transport'], '🚆': ['train-front', 'transport'],
  '✈️': ['plane', 'transport'], '🚕': ['car-taxi-front', 'transport'], '🚲': ['bike', 'transport'], '🚗': ['car-front', 'transport'], '🚉': ['train-track', 'transport'],
  // Овочі, фрукти, їжа
  '🥒': ['cucumber', 'nature'], '🍅': ['tomato', 'food'], '🥔': ['potato', 'food'], '🍎': ['apple', 'food'], '🍌': ['banana', 'food'],
  '🥐': ['croissant', 'food'], '🍞': ['bread', 'food'], '🍩': ['donut', 'food'], '🥨': ['pretzel', 'food'], '🥧': ['pie', 'food'], '🍰': ['cake-slice', 'food'],
  '🍪': ['cookie', 'food'], '🍫': ['chocolate', 'food'], '🧁': ['cupcake', 'food'], '🧀': ['cheese', 'food'], '🥚': ['egg', 'food'], '🌭': ['hotdog', 'food'],
  '🍕': ['pizza', 'food'], '🍔': ['burger', 'food'], '🥪': ['sandwich', 'food'], '🍲': ['soup', 'food'], '🥗': ['salad', 'nature'], '🍦': ['ice-cream-cone', 'food'],
  '🥟': ['pierogi', 'food'], '🥫': ['cylinder', 'thing'],
  // Напої
  '☕': ['coffee', 'drink'], '🍵': ['tea', 'drink'], '🧃': ['cup-soda', 'drink'], '💧': ['droplet', 'drink'], '🥛': ['milk', 'drink'], '🍾': ['wine', 'drink'],
  // Місця й будівлі
  '🏰': ['castle', 'place'], '⛪': ['church', 'place'], '🌉': ['bridge', 'place'], '⛲': ['fountain', 'place'], '🗽': ['monument', 'place'], '🏛️': ['landmark', 'place'],
  '🏦': ['banknote', 'place'], '🏭': ['factory', 'place'], '🏫': ['school', 'place'], '🏪': ['store', 'place'], '🏥': ['hospital', 'place'], '🏨': ['hotel', 'place'], '📚': ['library', 'place'],
  '🏟️': ['stadium', 'place'], '🍽️': ['utensils', 'place'], '🏠': ['house', 'home'], '🗺️': ['map', 'place'],
  // Напрямки
  '➡️': ['arrow-right', 'way'], '⬅️': ['arrow-left', 'way'], '⬆️': ['arrow-up', 'way'], '↩️': ['undo-2', 'way'],
  // Символи
  '🧜‍♀️': ['mermaid', 'symbol'], '🐉': ['dragon', 'nature'], '🦅': ['bird', 'symbol'], '🐻': ['bear', 'nature'],
  // Дім і речі
  '📫': ['mailbox', 'home'], '🗑️': ['trash-2', 'home'], '🚪': ['door-closed', 'home'], '🔑': ['key', 'thing'], '📰': ['newspaper', 'thing'],
  '🛋️': ['sofa', 'home'], '🛏️': ['bed-double', 'home'], '🛗': ['elevator', 'home'], '🪜': ['ladder', 'home'], '🪟': ['window', 'home'],
  '🐶': ['dog', 'nature'], '🐱': ['cat', 'nature'], '🧳': ['luggage', 'thing'], '🎒': ['backpack', 'thing'], '👜': ['handbag', 'thing'], '📦': ['package', 'thing'],
  '🎫': ['ticket', 'thing'], '💳': ['credit-card', 'thing'], '🧾': ['receipt', 'thing'], '📱': ['smartphone', 'thing'], '📖': ['book-open', 'thing'],
  '📝': ['notebook-pen', 'thing'], '💻': ['laptop', 'thing'], '🚻': ['toilet', 'place'],
  // Одяг, покупки, ринок (Вроцлав, уроки 5–16)
  '👕': ['shirt', 'thing'], '👓': ['glasses', 'thing'], '🎁': ['gift', 'thing'], '🛍️': ['shopping-bag', 'thing'], '🏷️': ['tag', 'thing'], '⚖️': ['scale', 'thing'],
  // Музика, свято, конкурс
  '🎵': ['music', 'symbol'], '🎤': ['mic', 'symbol'], '🏆': ['trophy', 'symbol'], '🎂': ['cake', 'food'], '🎉': ['party-popper', 'symbol'], '🗳️': ['vote', 'symbol'],
  '📷': ['camera', 'thing'], '🪙': ['coins', 'thing'], '👛': ['wallet', 'thing'], '💯': ['percent', 'symbol'], '🍒': ['cherry', 'food'], '🥕': ['carrot', 'nature'],
  // Запасні піктограми для предметів, які в завданнях малюються як ілюстрації (ITEM_ART у Illustrations.tsx): ключ тут потрібен, якщо малюнка не знайдено.
  '🧥': ['shirt', 'thing'], '👗': ['shirt', 'thing'], '👟': ['footprints', 'way'], '🍓': ['cherry', 'food'],
  // Свята (Zielona Góra) і погода, природа (Gorzów)
  '🕯️': ['flame', 'symbol'], '🪔': ['flame', 'symbol'], '🔥': ['flame', 'symbol'], '💐': ['flower', 'nature'], '🌸': ['flower', 'nature'], '🌷': ['flower-2', 'nature'],
  '🌻': ['flower-2', 'nature'], '🎄': ['tree-pine', 'nature'], '🌳': ['tree-deciduous', 'nature'], '🌿': ['leaf', 'nature'], '🍂': ['leaf', 'nature'], '🌰': ['nut', 'food'],
  '🌟': ['star', 'symbol'], '🔔': ['bell', 'symbol'], '🎆': ['sparkles', 'symbol'], '🧺': ['shopping-basket', 'thing'], '🍇': ['grape', 'food'], '🍷': ['wine', 'drink'],
  '☁️': ['cloud', 'nature'], '🌧️': ['cloud-rain', 'nature'], '❄️': ['snowflake', 'nature'], '🌫️': ['cloud-fog', 'nature'], '⛈️': ['cloud-lightning', 'nature'],
  '🌈': ['rainbow', 'nature'], '🌪️': ['tornado', 'nature'], '☂️': ['umbrella', 'thing'], '⛺': ['tent', 'place'], '🐦': ['bird', 'nature'],
  // Дії
  '🚶': ['footprints', 'way'], '🏊': ['waves', 'drink'], '🛒': ['shopping-cart', 'thing'], '😴': ['bed-single', 'home'],
};

/** Предмети домика й сувеніри (asset_key) → піктограма. */
export const ITEM_PICTO: Record<string, Spec> = {
  'bed-basic': ['bed-single', 'home'], 'bed-cozy': ['bed-double', 'home'], desk: ['lamp-desk', 'home'], bookshelf: ['library', 'home'], sofa: ['sofa', 'home'],
  lamp: ['lamp-floor', 'home'], plant: ['sprout', 'nature'], 'rug-red': ['rug', 'food'], 'poster-poland': ['image', 'place'], 'map-wall': ['map', 'place'],
  'souvenir-syrenka': ['mermaid', 'symbol'], 'souvenir-dragon': ['dragon', 'nature'], 'souvenir-krasnal': ['gnome', 'food'],
};

/** Міста → піктограма-символ (замість емодзі міста). */
export const CITY_PICTO: Record<string, Spec> = {
  warszawa: ['mermaid', 'symbol'], krakow: ['dragon', 'nature'], wroclaw: ['gnome', 'food'], lodz: ['factory', 'place'], katowice: ['pickaxe', 'thing'],
  opole: ['mic-vocal', 'symbol'], gdansk: ['ship', 'transport'], gdynia: ['anchor', 'transport'], szczecin: ['anchor', 'transport'], poznan: ['goat', 'food'],
  torun: ['cookie', 'food'], lublin: ['castle', 'place'], bialystok: ['bear', 'nature'], zakopane: ['mountain', 'nature'], rzeszow: ['plane', 'transport'],
};

/** Чи вміємо показати цей ключ (інакше — нейтральна плитка). */
export const hasPictogram = (e: string | null | undefined) => !!e && (isPersonEmoji(e) || !!PICTO[e] || /^\d️?⃣$/.test(e));

function Glyph({ name }: { name: string }) {
  const custom = CUSTOM[name];
  if (custom) return <>{custom}</>;
  const raw = LUCIDE[name] ?? LUCIDE.image;
  // Статичний SVG із пакета Lucide (див. lucide.ts), без даних користувача.
  return <g dangerouslySetInnerHTML={{ __html: raw }} />;
}

export const PictoTile = memo(function PictoTile({ spec, size = 56, className }: { spec: Spec | null; size?: number; className?: string }) {
  const [icon, tone] = spec ?? ['image', 'thing'];
  return (
    <span className={`picto tone-${tone} ${className ?? ''}`} style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 24 24" width={size * 0.58} height={size * 0.58} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Glyph name={icon} />
      </svg>
    </span>
  );
});

/** Картинка з контенту: портрет, цифра або піктограма. Емодзі не виводиться ніколи. */
export const Pictogram = memo(function Pictogram({ emoji, size = 56, seed, className }: { emoji: string | null | undefined; size?: number; seed?: string; className?: string }) {
  if (emoji && isPersonEmoji(emoji)) return <span className={className} style={{ display: 'inline-block', width: size, height: size }}><NpcAvatar emoji={emoji} seed={seed} size={size} ring={false} /></span>;
  const digit = emoji?.match(/^(\d)️?⃣$/)?.[1];
  if (digit) {
    return (
      <span className={`picto tone-way ${className ?? ''}`} style={{ width: size, height: size, fontSize: size * 0.56 }} aria-hidden>
        <b className="font-black leading-none">{digit}</b>
      </span>
    );
  }
  return <PictoTile spec={emoji ? (PICTO[emoji] ?? null) : null} size={size} className={className} />;
});

/** Співрозмовник у діалозі: портрет людини (з обідком) або піктограма (наприклад, квитковий автомат). */
export const NpcFace = memo(function NpcFace({ emoji, name, size = 48 }: { emoji: string; name?: string; size?: number }) {
  if (isPersonEmoji(emoji)) return <NpcAvatar emoji={emoji} seed={name} size={size} />;
  return <PictoTile spec={PICTO[emoji] ?? null} size={size} className="!rounded-full" />;
});
