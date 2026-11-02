/**
 * Сцена місії: растрова картинка з src/assets/scenes (реєстр SCENE_ART), якщо вона є для цієї місії, інакше SVG-сцена.
 * Тимчасові кадри мають Бобека в самій картинці — екрани, що малюють власного Бобека поверх сцени, питають `hasBakedBobek`.
 */
import { memo } from 'react';
import { missionSceneArt, passSeasonCover } from '../lib/assets';
import { passMissionScene } from '../lib/screenArt';
import { Scene } from './Illustrations';

export const hasBakedBobek = (missionSlug: string) => !!missionSceneArt(missionSlug)?.art.bakedBobek || !!passMissionScene(missionSlug);

type Props = { slug: string; scene: string; className?: string; /** Картка під екраном: ліниве завантаження. Герой місії вантажиться одразу. */ lazy?: boolean };

export const MissionScene = memo(function MissionScene({ slug, scene, className, lazy = true }: Props) {
  const img = missionSceneArt(slug);
  if (!img) {
    // Миссия пропуска со своим кадром владельца (Stary Rynek для «11 ноября»): тот же файл, что на карточке пропуска.
    const own = passMissionScene(slug);
    if (!own) return <Scene name={scene} className={className} />;
    return (
      <img
        src={own.src}
        srcSet={own.srcSet}
        sizes="(min-width: 576px) 576px, 100vw"
        alt=""
        className={`${className ?? ''} object-cover`}
        style={{ objectPosition: '50% 40%' }}
        loading={lazy ? 'lazy' : 'eager'}
        decoding="async"
        draggable={false}
        data-scene-art={`pass-${slug}`}
      />
    );
  }
  return (
    <img
      src={img.src}
      srcSet={img.srcSet}
      // Екран не ширший за max-w-xl (576 px): ширше основний файл не потрібен.
      sizes="(min-width: 576px) 576px, 100vw"
      alt=""
      className={`${className ?? ''} object-cover`}
      style={{ objectPosition: img.art.focus }}
      loading={lazy ? 'lazy' : 'eager'}
      decoding="async"
      draggable={false}
      data-scene-art={img.art.id}
      data-scene-status={img.art.status}
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
