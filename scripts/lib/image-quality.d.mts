export const BAND_MAX_PX: number;
export const DETAIL_MIN: number;
export interface ImageQuality {
  width: number;
  height: number;
  /** Ширина мыльной полосы у левого края, px. */
  bandLeft: number;
  bandRight: number;
  /** Резкость крайних 6 % ширины, % от середины кадра. */
  edgeLeft: number;
  edgeRight: number;
  /** Доля мелких деталей: меньше DETAIL_MIN — кадр увеличен из маленького. */
  detail: number;
}
export function analyseImage(bytes: Uint8Array): Promise<ImageQuality>;
export function qualityProblems(q: ImageQuality, options?: { softAllowed?: boolean }): string[];
