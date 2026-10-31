/**
 * Only matches imported artwork under dev/bobek-v2.
 * An absent pack must not cause invisible Bobek; UI hides the opt-in until imported.
 * Vite emits content-hashed URLs; no runtime path assembly, network, or secrets.
 */
const files = import.meta.glob('./bobek-v2/**/*.webp', { eager: true, import: 'default' }) as Record<string, string>;

export const hasBobekV2Art =
  ['idle/body.webp', 'idle/top-hoodie-red.webp', 'wave/body.webp', 'wave/top-hoodie-red.webp']
    .every((path) => Boolean(files[`./bobek-v2/${path}`]));

export function bobekV2AssetUrl(key: string, width: number): string | null {
  if (!key.startsWith('bobek-v2/') || key.includes('..')) return null;
  const suffix = key.slice('bobek-v2/'.length);
  const asset = `./bobek-v2/${suffix}`;
  if (width <= 256 && files[`${asset}@256.webp`]) return files[`${asset}@256.webp`];
  if (width <= 512 && files[`${asset}@512.webp`]) return files[`${asset}@512.webp`];
  return files[`${asset}.webp`] ?? files[`${asset}@512.webp`] ?? null;
}
