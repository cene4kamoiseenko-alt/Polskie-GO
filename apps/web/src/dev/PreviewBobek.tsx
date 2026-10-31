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
import { hasBobekV3Art, bobekV3AssetUrl } from './lookV3Assets';
import { LOOK_V3_DRAFT_MANIFEST } from './lookV3Manifest';

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
  let selected: 'legacy' | 'v2' | 'v3' = 'legacy';
  try {
    const art: unknown = JSON.parse(localStorage.getItem('pg_look_prototype_v1') ?? '{}')?.art;
    if (art === 'v3' && hasBobekV3Art) selected = 'v3';
    else if (art === 'v2' && hasBobekV2Art) selected = 'v2';
  } catch { /* private storage unavailable: keep legacy preview */ }
  const manifest = selected === 'v3' ? LOOK_V3_DRAFT_MANIFEST
    : selected === 'v2' ? LOOK_V2_DRAFT_MANIFEST : LOOK_PROTOTYPE_MANIFEST;
  const resolver = selected === 'v3' ? bobekV3AssetUrl
    : selected === 'v2' ? bobekV2AssetUrl : protoAssetUrl;
  const look = resolveLook(null, equipment, { manifest, mood });
  return <BeaverLook look={look} resolveAsset={resolver} size={size} className={className} animate={animate} />;
});
export default PreviewBobek;
