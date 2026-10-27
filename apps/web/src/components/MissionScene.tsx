/**
 * Сцена місії: растрова картинка з src/assets/scenes (реєстр SCENE_ART), якщо вона є для цієї місії, інакше SVG-сцена.
 * Тимчасові кадри мають Бобека в самій картинці — екрани, що малюють власного Бобека поверх сцени, питають `hasBakedBobek`.
 */
import { memo } from 'react';
import { missionSceneArt } from '../lib/assets';
import { Scene } from './Illustrations';

export const hasBakedBobek = (missionSlug: string) => !!missionSceneArt(missionSlug)?.art.bakedBobek;

type Props = { slug: string; scene: string; className?: string; /** Картка під екраном: ліниве завантаження. Герой місії вантажиться одразу. */ lazy?: boolean };

export const MissionScene = memo(function MissionScene({ slug, scene, className, lazy = true }: Props) {
  const img = missionSceneArt(slug);
  if (!img) return <Scene name={scene} className={className} />;
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
