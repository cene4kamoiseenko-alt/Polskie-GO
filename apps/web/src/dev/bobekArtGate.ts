/**
 * Bobek artwork acceptance gate — FAIL CLOSED.
 *
 * V3/V3.2 was assembled from unrelated image cutouts and both upper garments
 * visually float off the torso. Sprite and alpha tests cannot prove fit.
 * Do not let a passed build or a persisted localStorage QA choice enable it.
 *
 * Release only AFTER:
 *  - a NEW common-geometry art master (body and clothing in the same pose),
 *  - a hand-reviewed idle/wave montage for each garment,
 *  - independent sleeve illustrations and a mobile screenshot check,
 *  - a dedicated review PR switching this flag after art approval.
 */
export const V3_ART_APPROVED = false as boolean;
/** Never mount ANY experimental layered art onto normal app screens until visual QA. */
export const LAYERED_APP_PREVIEW_APPROVED = false as boolean;
export const V3_ART_BLOCK_REASON =
  'Bobek V3.2 вимкнено: худі й куртка зміщуються відносно тіла. Нова база та рукави потребують художньої перебудови.';
