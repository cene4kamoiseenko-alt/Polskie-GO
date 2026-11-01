/** QA-only coherent character references with no garment layering. */
const files=import.meta.glob('./bobek-coherent/*.webp',{eager:true,import:'default'}) as Record<string,string>;
const variants=['front-red','front-blue-hoodie-proof','wave-red','wave-blue-hoodie-proof'] as const;
export const coherentPreviewReady=variants.every(v=>Boolean(files[`./bobek-coherent/${v}.webp`]));
export function coherentPreviewUrl(variant:typeof variants[number]):string|undefined {
  return files[`./bobek-coherent/${variant}.webp`];
}
