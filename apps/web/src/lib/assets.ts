/**
 * Растрові ассети (PNG/WebP з прозорим фоном). Якщо файл існує — він замінює векторну графіку,
 * інакше використовується вбудована SVG-ілюстрація. Достатньо покласти файл і перезібрати застосунок:
 *   src/assets/beaver/<стан>.webp   — happy, wave, sad, think, celebrate, sleep, travel, gift, cheer,
 *                                     surprised, read, learn, royal, wait
 *   src/assets/cities/<slug>.webp   — панорама міста (наприклад warszawa.webp), бажано 1200×600
 *   src/assets/icons/<name>.webp    — ігрові іконки (lessons, quests, map, profile, leaderboard, streak, zlotki, …)
 *   src/assets/brand/<name>.webp    — логотип (logo) і портрет Бобека для аватара (avatar)
 */
const files = import.meta.glob('../assets/**/*.{webp,png}', { eager: true, import: 'default' }) as Record<string, string>;

function pick(dir: string, name: string): string | null {
  return files[`../assets/${dir}/${name}.webp`] ?? files[`../assets/${dir}/${name}.png`] ?? null;
}

const BEAVER_POSES: Record<string, string> = {
  happy: 'wave', wave: 'wave', travel: 'wave', wait: 'think', think: 'think',
  celebrate: 'celebrate', cheer: 'celebrate', gift: 'celebrate',
  read: 'read', learn: 'read', explain: 'think', mic: 'think', surprised: 'think', sad: 'think', map: 'read',
};
export const beaverAsset = (mood: string) => pick('beaver', BEAVER_POSES[mood] ?? mood);
/** Composed art contains this exact outfit. Never hide another equipped item. */
export function supportsBeaverArt(outfit: Record<string, string | undefined>): boolean {
  if (outfit.BACKPACK !== 'backpack-travel') return false;
  return Object.entries(outfit).every(([slot, value]) => !value || value === 'none'
    ? slot !== 'JACKET' && slot !== 'BACKPACK'
    : slot === 'FRAME' || (slot === 'JACKET' && value === 'hoodie-red') || (slot === 'BACKPACK' && value === 'backpack-travel'));
}
export const cityAsset = (slug: string) => pick('cities', slug);
export const iconAsset = (name: string) => pick('icons', name);
export const brandAsset = (name: string) => pick('brand', name);
