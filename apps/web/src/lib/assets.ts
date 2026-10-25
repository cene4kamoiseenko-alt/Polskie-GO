/**
 * Растрові ассети (PNG/WebP з прозорим фоном). Якщо файл існує — він замінює векторну графіку,
 * інакше використовується вбудована SVG-ілюстрація. Достатньо покласти файл і перезібрати застосунок:
 *   src/assets/beaver/<поза>.webp      — wave, greet, think, doubt, correct, support, celebrate, victory, read,
 *                                        travel, front, three-quarter, side, back (лист «Бобер і емоції»)
 *   src/assets/costumes/<костюм>.webp   — бобер у костюмі (вирізаний), <костюм>-scene.webp — сцена для картки
 *   src/assets/cities/<slug>.webp       — панорама міста (наприклад warszawa.webp), бажано 1200×600
 *   src/assets/icons/<name>.webp        — ігрові іконки (lessons, quests, map, profile, leaderboard, streak, zlotki, level, …)
 *   src/assets/brand/<name>.webp        — логотип (logo) і портрет Бобека для аватара (avatar)
 */
const files = import.meta.glob('../assets/**/*.{webp,png}', { eager: true, import: 'default' }) as Record<string, string>;

function pick(dir: string, name: string): string | null {
  return files[`../assets/${dir}/${name}.webp`] ?? files[`../assets/${dir}/${name}.png`] ?? null;
}

/**
 * Стан бобра → поза з листа. У кожного стану свій образ; стани з власним реквізитом
 * (sleep, royal, music) лишаються векторними, бо на растрі цього реквізиту немає.
 */
export const BEAVER_POSES: Record<string, string> = {
  wave: 'wave', // привітання
  happy: 'greet', // спокійний настрій: крокує з картою й махає
  travel: 'travel', // нове місто: іде з картою
  map: 'front', // тримає карту
  explain: 'three-quarter', // пояснення правила
  think: 'think', // роздуми над завданням
  wait: 'doubt', // чекає / сумнівається
  surprised: 'doubt',
  mic: 'wave', // заохочує сказати вголос
  cheer: 'correct', // правильна відповідь: підморгує й показує «клас»
  sad: 'support', // підтримка після помилки: серце
  celebrate: 'victory', // урок пройдено: зірка
  gift: 'celebrate', // нагорода: обидві лапи вгору
  read: 'read',
  learn: 'read',
};
export const beaverAsset = (mood: string) => {
  const pose = BEAVER_POSES[mood];
  return pose ? pick('beaver', pose) : null;
};
/** Вид персонажа (спереду, три чверті, збоку, ззаду) — для сцен руху. */
export const beaverView = (view: 'front' | 'three-quarter' | 'side' | 'back') => pick('beaver', view);

/** Composed art contains this exact outfit. Never hide another equipped item. */
export function supportsBeaverArt(outfit: Record<string, string | undefined>): boolean {
  if (outfit.BACKPACK !== 'backpack-travel') return false;
  return Object.entries(outfit).every(([slot, value]) => !value || value === 'none'
    ? slot !== 'JACKET' && slot !== 'BACKPACK'
    : slot === 'FRAME' || (slot === 'JACKET' && value === 'hoodie-red') || (slot === 'BACKPACK' && value === 'backpack-travel'));
}

/** Костюм (asset_key предмета 'costume-<name>') → назва файлу. */
const costumeName = (key: string) => key.replace(/^costume-/, '');
export const costumeAsset = (key: string) => pick('costumes', costumeName(key));
export const costumeScene = (key: string) => pick('costumes', `${costumeName(key)}-scene`);
/** Образ «Мандрівник» — стартовий одяг; для нього є лише сцена картки. */
export const travellerScene = () => pick('costumes', 'traveller-scene');

/**
 * Растровий костюм показується, лише якщо на бобрі немає нічого, чого немає на малюнку:
 * капелюх і куртка під костюмом не видні й у векторі; окуляри, шарф, взуття, аксесуар
 * та інший рюкзак — видні, тож із ними лишається векторний бобер.
 */
export function costumeArt(outfit: Record<string, string | undefined>): string | null {
  const key = outfit.COSTUME;
  if (!key || key === 'none') return null;
  const art = costumeAsset(key);
  if (!art) return null;
  for (const slot of ['GLASSES', 'SCARF', 'SHOES', 'ACCESSORY']) {
    const v = outfit[slot];
    if (v && v !== 'none') return null;
  }
  const pack = outfit.BACKPACK;
  if (pack && pack !== 'none' && pack !== 'backpack-travel') return null;
  return art;
}

export const cityAsset = (slug: string) => pick('cities', slug);
export const iconAsset = (name: string) => pick('icons', name);
export const brandAsset = (name: string) => pick('brand', name);
