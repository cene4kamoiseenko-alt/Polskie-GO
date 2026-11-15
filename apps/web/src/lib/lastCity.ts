/**
 * Последний город игрока: запоминается на устройстве, чтобы главная не рисовала «Варшаву» и не меняла кадр, пока приходит маршрут,
 * и чтобы картинка города грузилась ещё во время заставки (preloadLastCity в main.tsx).
 */
import { cityArtImage } from './assets';
import { store } from './storage';

const KEY = 'pg:last-city';

export type LastCity = { slug: string; color: string; namePl: string };

export function readLastCity(): LastCity | null {
  try {
    const v = JSON.parse(store.get(KEY) ?? 'null') as Partial<LastCity> | null;
    return v && typeof v.slug === 'string' && typeof v.color === 'string' && typeof v.namePl === 'string' ? { slug: v.slug, color: v.color, namePl: v.namePl } : null;
  } catch {
    return null;
  }
}

export function rememberCity(city: LastCity) {
  const prev = readLastCity();
  if (prev && prev.slug === city.slug && prev.color === city.color && prev.namePl === city.namePl) return;
  store.set(KEY, JSON.stringify({ slug: city.slug, color: city.color, namePl: city.namePl }));
}

/** Тот же набор `srcset` и `sizes`, что у баннера на главной: браузер выберет ту же картинку и возьмёт её из кеша. */
export function preloadCityArt(slug: string, sizes = '100vw') {
  const photo = cityArtImage(slug);
  if (!photo || typeof Image === 'undefined') return;
  const img = new Image();
  if (photo.srcSet) {
    img.sizes = sizes;
    img.srcset = photo.srcSet;
  }
  img.decoding = 'async';
  img.src = photo.src;
}

export function preloadLastCity() {
  const city = readLastCity();
  if (city) preloadCityArt(city.slug);
}
