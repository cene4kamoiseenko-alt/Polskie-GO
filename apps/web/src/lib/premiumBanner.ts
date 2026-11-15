import { artImage } from './assets';

/** Баннери власника (2026-11-02, scripts/build-premium-art.mjs): змінюються раз на день за місцевою датою. Немає файлу — намальована шапка, як раніше. */
const BANNERS = [
  { file: 'premium-oldtown', width: 1200 },
  { file: 'premium-mountains', width: 756 },
];
export function todayBanner(now = new Date()): { file: string; src: string; srcSet: string | undefined } | null {
  const list = BANNERS.flatMap((b) => {
    const art = artImage('premium', b);
    return art ? [{ file: b.file, ...art }] : [];
  });
  if (!list.length) return null;
  const day = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86_400_000);
  return list[day % list.length];
}
