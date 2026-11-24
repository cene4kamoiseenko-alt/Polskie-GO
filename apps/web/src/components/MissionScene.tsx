/**
 * Сцена місії: растрова картинка — своя сцена з src/assets/scenes (реєстр SCENE_ART), кадр пропуску, обкладинка сезону
 * або картинка бібліотеки Бобека за темою місії (LIBRARY_ART, вариант А «живі місії», 2026-11-24). SVG-сцена — лише якщо
 * файлів немає. У растрових кадрах Бобек намальований — екрани, що малюють власного Бобека поверх сцени, питають `hasBakedBobek`.
 */
import { memo } from 'react';
import { missionLibraryArt } from '@polski-go/shared';
import { libraryImage, missionSceneArt, passSeasonCover } from '../lib/assets';
import { passMissionScene } from '../lib/screenArt';
import { Scene } from './Illustrations';

export type MissionArtSource = 'own' | 'pass' | 'season' | 'library';
type Art = { src: string; srcSet: string | undefined; pos: string; source: MissionArtSource; id: string; status?: string; baked: boolean };

/**
 * Картинка місії: своя сцена → кадр пропуску → обкладинка сезону → бібліотека за категорією. `season` і `category` передає екран
 * місії; без них (картки списку) — як раніше: своя сцена або кадр пропуску, інакше SVG.
 */
export function missionArt(slug: string, season?: string | null, category?: string): Art | null {
  const own = missionSceneArt(slug);
  if (own) return { src: own.src, srcSet: own.srcSet, pos: own.art.focus, source: 'own', id: own.art.id, status: own.art.status, baked: !!own.art.bakedBobek };
  const pass = passMissionScene(slug);
  if (pass) return { src: pass.src, srcSet: pass.srcSet, pos: '50% 40%', source: 'pass', id: `pass-${slug}`, baked: true };
  if (category === undefined) return null;
  const cover = season ? passSeasonCover(season) : null;
  if (cover) return { src: cover.src, srcSet: cover.srcSet, pos: '50% 45%', source: 'season', id: `season-${season}`, baked: true };
  const file = missionLibraryArt(category, slug);
  const lib = libraryImage(file);
  return lib ? { src: lib.src, srcSet: lib.srcSet, pos: lib.focus, source: 'library', id: `library-${file}`, baked: true } : null;
}

export const hasBakedBobek = (missionSlug: string, season?: string | null, category?: string) => !!missionArt(missionSlug, season, category)?.baked;

type Props = {
  slug: string;
  scene: string;
  className?: string;
  /** Картка під екраном: ліниве завантаження. Герой місії вантажиться одразу. */
  lazy?: boolean;
  /** Сезон і категорія — для запасної картинки (обкладинка сезону, бібліотека); передає екран місії. */
  season?: string | null;
  category?: string;
};

export const MissionScene = memo(function MissionScene({ slug, scene, className, lazy = true, season, category }: Props) {
  const art = missionArt(slug, season, category);
  if (!art) return <Scene name={scene} className={className} />;
  return (
    <img
      src={art.src}
      srcSet={art.srcSet}
      // Екран не ширший за max-w-xl (576 px): ширше основний файл не потрібен.
      sizes="(min-width: 576px) 576px, 100vw"
      alt=""
      className={`${className ?? ''} object-cover`}
      style={{ objectPosition: art.pos }}
      loading={lazy ? 'lazy' : 'eager'}
      decoding="async"
      draggable={false}
      // data-scene-art — як раніше (лише власні кадри місій і пропуску: на них рахує scripts/mission-screens.ts).
      data-scene-art={art.source === 'own' || art.source === 'pass' ? art.id : undefined}
      data-scene-status={art.status}
      data-scene-source={art.source}
    />
  );
});

/**
 * Обкладинка сезону пропуску: власний кадр сезону (листопад — Stary Rynek у Познані, мастер власника 2026-11-01), інакше картинка першої місії сезону,
 * коли вона намальована, інакше SVG-сцена сезону. Однакова на головній, у «Польська в житті» і на /pass.
 */
export function SeasonCover({ season, className, dim }: { season: { slug: string; scene: string; missions: { slug: string }[] }; className?: string; dim?: boolean }) {
  const cover = passSeasonCover(season.slug);
  if (cover) {
    return (
      <img
        src={cover.src}
        srcSet={cover.srcSet}
        // Обложка стоит под затемнением и текстом, и она на главной (холодный старт): на телефонах с DPR ≤ 2 хватает узкого файла 640 (66 КБ вместо 173).
        sizes="(min-width: 576px) 576px, 70vw"
        alt=""
        className={`${className ?? ''} object-cover${dim ? ' opacity-60' : ''}`}
        style={{ objectPosition: '50% 38%' }}
        loading="lazy"
        decoding="async"
        draggable={false}
        data-season-cover={season.slug}
      />
    );
  }
  const first = season.missions[0]?.slug ?? '';
  if (!missionSceneArt(first)) return <Scene name={season.scene} className={className} evening={season.slug === 'swieta'} dim={dim} />;
  return <MissionScene slug={first} scene={season.scene} className={`${className ?? ''}${dim ? ' opacity-60' : ''}`} />;
}
