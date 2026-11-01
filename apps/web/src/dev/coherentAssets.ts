/** Exact, unchanged, original whole-look Bobek art for identity review. */
const files=import.meta.glob('./bobek-coherent/*.webp',{eager:true,import:'default'}) as Record<string,string>;
const variants=['front-approved','wave-approved'] as const;
export const coherentPreviewReady=variants.every(v=>Boolean(files[`./bobek-coherent/${v}.webp`]));
export function coherentPreviewUrl(variant:typeof variants[number]):string|undefined {
  return files[`./bobek-coherent/${variant}.webp`];
}
