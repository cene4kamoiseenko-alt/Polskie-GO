/**
 * Картинки библиотеки Бобека для экранов миссии и урока (реестр и темы — LIBRARY_ART в @polski-go/shared; сборка WebP —
 * scripts/build-library-art.ts): основная ширина 1080 и @640 для srcset, `focus` — точка кадра для object-position.
 */
import { LIBRARY_ART, missionLibraryArt } from '@polski-go/shared';
import { libraryFiles } from './libraryFiles';

export type LibraryImage = { src: string; srcSet: string; focus: string };

export function libraryImage(file: string): LibraryImage | null {
  const art = LIBRARY_ART[file];
  const src = art ? libraryFiles[`../assets/library/${file}.webp`] : null;
  if (!art || !src) return null;
  const small = libraryFiles[`../assets/library/${file}@640.webp`];
  return { src, srcSet: small ? `${small} 640w, ${src} 1080w` : src, focus: art.focus };
}

/** Запасная картинка миссии без своей сцены и обложки сезона — по теме её категории. */
export const missionLibraryImage = (category: string, slug: string) => libraryImage(missionLibraryArt(category, slug));
