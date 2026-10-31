/** QA-only sprite URL resolver; no production garments are replaced by this experiment. */
const assets = import.meta.glob('./bobek-v3/idle/*.webp', { eager: true, import: 'default' }) as Record<string,string>;
const required = ['torso','head','top-hoodie-red','top-jacket-denim','backpack','cap-red','glasses-round'];
export const hasBobekV3Art = required.every((name) => !!assets[`./bobek-v3/idle/${name}.webp`]);

export function bobekV3AssetUrl(key:string,width:number):string|null {
  if (!key.startsWith('bobek-v3/idle/') || key.includes('..')) return null;
  const basename = key.slice('bobek-v3/idle/'.length);
  if (!required.includes(basename)) return null;
  const pathname = `./bobek-v3/idle/${basename}`;
  if (width<=256 && assets[`${pathname}@256.webp`]) return assets[`${pathname}@256.webp`];
  if (width<=512 && assets[`${pathname}@512.webp`]) return assets[`${pathname}@512.webp`];
  return assets[`${pathname}.webp`] ?? null;
}
