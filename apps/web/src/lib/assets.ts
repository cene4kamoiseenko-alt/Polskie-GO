/**
 * Растрові ассети (PNG/WebP з прозорим фоном). Якщо файл існує — він замінює векторну графіку,
 * інакше використовується вбудована SVG-ілюстрація. Достатньо покласти файл і перезібрати застосунок:
 *   src/assets/beaver/<стан>.webp   — happy, wave, sad, think, celebrate, sleep, travel, gift, cheer,
 *                                     surprised, read, learn, royal, wait
 *   src/assets/cities/<slug>.webp   — панорама міста (наприклад warszawa.webp), бажано 1200×600
 *   src/assets/icons/<name>.webp    — ігрові іконки (home, map, lessons, dictionary, ai, grammar, …)
 */
const files = import.meta.glob('../assets/**/*.{webp,png}', { eager: true, import: 'default' }) as Record<string, string>;

function pick(dir: string, name: string): string | null {
  return files[`../assets/${dir}/${name}.webp`] ?? files[`../assets/${dir}/${name}.png`] ?? null;
}

export const beaverAsset = (mood: string) => pick('beaver', mood);
export const cityAsset = (slug: string) => pick('cities', slug);
export const iconAsset = (name: string) => pick('icons', name);
