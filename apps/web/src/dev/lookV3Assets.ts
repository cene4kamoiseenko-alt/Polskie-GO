/** Bobek V3.1 QA resolver. Generated WebP paths are isolated under dev/. */
const assets = import.meta.glob('./bobek-v3/**/*.webp',{eager:true,import:'default'}) as Record<string,string>;
const idle = ['torso','head','top-hoodie-red','top-jacket-denim','backpack','cap-red','glasses-round'];
const wave = ['torso','top-hoodie-red','arm-hoodie-red'];
const allowed = new Set([
  ...idle.map(name=>`idle/${name}`),
  ...wave.map(name=>`wave/${name}`),
]);
export const hasBobekV3Art = [...allowed].every(key=>!!assets[`./bobek-v3/${key}.webp`]);

export function bobekV3AssetUrl(key:string,width:number):string|null {
  if (!key.startsWith('bobek-v3/')) return null;
  const name = key.slice('bobek-v3/'.length);
  if (!allowed.has(name)) return null;
  const path = `./bobek-v3/${name}`;
  if(width<=256&&assets[`${path}@256.webp`])return assets[`${path}@256.webp`];
  if(width<=512&&assets[`${path}@512.webp`])return assets[`${path}@512.webp`];
  return assets[`${path}.webp`]??null;
}
