/**
 * Єдиний прототипний Бобек для будь-якого екрану (тільки opt-in QA).
 * Ті ж resolveLook/BeaverLook, що й production. Не торкається server outfit.
 * Намальовані шари — тимчасові: готовою арт-базою їх називати не можна.
 */
import { memo } from 'react';
import { resolveLook } from '@polski-go/shared';
import { BeaverLook, type BeaverMood } from '../components/Beaver';
import { LOOK_PROTOTYPE_MANIFEST } from './lookPrototypeManifest';
import { protoAssetUrl } from './protoAssets';

type Props = {
  equipment: readonly string[];
  mood?: BeaverMood;
  size?: number;
  className?: string;
  animate?: boolean;
};

const PreviewBobek = memo(function PreviewBobek({
  equipment,
  mood = 'happy',
  size,
  className,
  animate,
}: Props) {
  const look = resolveLook(null, equipment, { manifest: LOOK_PROTOTYPE_MANIFEST, mood });
  return <BeaverLook look={look} resolveAsset={protoAssetUrl} size={size} className={className} animate={animate} />;
});
export default PreviewBobek;
