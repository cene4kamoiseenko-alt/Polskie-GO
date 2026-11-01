/**
 * Арты экранов «Пропуск месяца» и «Квесты» (мастера владельца 2026-11-01). Отдельный файл: эти экраны грузятся лениво, и таблицы с функциями не попадают в стартовую загрузку
 * (бюджет JS в scripts/perf.ts почти исчерпан). Обложки сезонов нужны и на главной, они остались в `lib/assets.ts`.
 *
 * Пропуск (src/assets/pass, docs/design/v19/pass; сборка — scripts/build-pass-art.mjs):
 *  · карточки миссий: «11 ноября» — Stary Rynek 2:1 (1400 px и @640), «Анджейки» — вырезка референса 866 px (кадра пока нет);
 *  · вырезка героя карточки «Продолжить»: рогалики (приближённая маска референса) и Бобек-бариста.
 * Ключ — slug миссии; нет записи — карточка берёт сцену миссии. Арты ТОЛЬКО для пропуска: фон самой миссии — из реестра сцен (SCENE_ART, кадры 2:1 без пустых полей).
 *
 * Квесты (src/assets/quests, docs/design/v19/quests; сборка — scripts/build-quests-art.mjs): баннер, миниатюра «Польский в жизни» и картинки сюжетных квестов по slug
 * (`pos` — какая часть кадра остаётся в окне карточки 2,5 : 1). Нет файла или квеста в таблице — экран рисует прежнюю SVG-сцену.
 */
import { artImage, pick } from './assets';

const PASS_ART: Record<string, { file: string; width: number }> = {
  'listopad-swieto': { file: 'stary-rynek', width: 1400 },
  'andrzejki-wosk': { file: 'andrzejki', width: 866 },
};
/** Размеры вырезок — файла, не экрана (атрибуты width/height держат место, пока картинка грузится). */
const PASS_CUTOUT: Record<string, { file: string; w: number; h: number }> = {
  'marcin-rogal': { file: 'rogaliki', w: 245, h: 147 },
  'listopad-swieto': { file: 'barista', w: 275, h: 340 },
};
const QUEST_STORY_ART: Record<string, { file: string; pos: string }> = {
  's-warszawa-dworzec': { file: 'story-warszawa', pos: '50% 22%' },
  's-krakow-mieszkanie': { file: 'story-krakow', pos: '50% 30%' },
  's-wroclaw-zgubiony': { file: 'story-wroclaw', pos: '50% 26%' },
};

/** Картинка карточки миссии в пропуске (src + srcset) или null. */
export const passArt = (slug: string) => artImage('pass', PASS_ART[slug]);

/** Вырезка героя карточки «Продолжить» (прозрачный WebP) с размерами файла или null. */
export function passCutout(slug: string): { src: string; w: number; h: number } | null {
  const c = PASS_CUTOUT[slug];
  const src = c ? pick('pass', c.file) : null;
  return c && src ? { src, w: c.w, h: c.h } : null;
}

export const questHero = () => artImage('quests', { file: 'hero', width: 1200 });
export const questLifeThumb = () => pick('quests', 'life');
export function questStoryArt(slug: string): { src: string; srcSet: string | undefined; pos: string } | null {
  const e = QUEST_STORY_ART[slug];
  const img = e ? artImage('quests', { file: e.file, width: 1200 }) : null;
  return e && img ? { ...img, pos: e.pos } : null;
}
