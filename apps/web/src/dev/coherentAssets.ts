/**
 * Immutable canonical Bobek artwork and one optional PIXEL-REGISTERED blue
 * hoodie colorway. Red and blue use exactly the same canvas/pose/silhouette.
 * These are WHOLE-LOOK previews, not independently swappable clothes or 2.5D bones.
 */
const files=import.meta.glob('./bobek-coherent/*.webp',{eager:true,import:'default'}) as Record<string,string>;
const masters=['front-approved','wave-approved'] as const;
type Master = typeof masters[number];
export type CoherentArtKey = Master | 'front-blue-colorway';
export const coherentPreviewReady=masters.every(v=>Boolean(files[`./bobek-coherent/${v}.webp`]));
export const coherentColorwayReady=Boolean(files['./bobek-coherent/front-blue-colorway.webp']);
export function coherentPreviewUrl(variant:CoherentArtKey):string|undefined {
  return files[`./bobek-coherent/${variant}.webp`];
}
