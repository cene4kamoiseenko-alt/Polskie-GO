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
import { hasBobekV2Art, bobekV2AssetUrl } from './lookV2Assets';
import { LOOK_V2_DRAFT_MANIFEST } from './lookV2Manifest';

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
  // The user's production outfit is never read or written by this isolated QA preview.
  // Selecting V2 before importing the art pack falls back to the fully populated old demo.
  let newArt = false;
  try {
    newArt = hasBobekV2Art && JSON.parse(localStorage.getItem('pg_look_prototype_v1') ?? '{}')?.art === 'v2';
  } catch { /* unavailable storage / malformed saved QA state: use existing demo */ }
  const manifest = newArt ? LOOK_V2_DRAFT_MANIFEST : LOOK_PROTOTYPE_MANIFEST;
  const look = resolveLook(null, equipment, { manifest, mood });
  return (
    <BeaverLook
      look={look}
      resolveAsset={newArt ? bobekV2AssetUrl : protoAssetUrl}
      size={size}
      className={className}
      animate={animate}
    />
  );
});
export default PreviewBobek;
