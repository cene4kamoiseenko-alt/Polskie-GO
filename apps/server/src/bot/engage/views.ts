/**
 * Карточка бота: фото Бобека + подпись + кнопка в приложение (с меткой `src` — для отчёта «открыли») + «🔕 Не присылать такие
 * сообщения». Картинки — из запаса канала (`public/channel/*.jpg`): у каждой карточки свой набор, у миссии — по теме.
 * Вариант текста и картинки выбирают человек и день (`cardSeed`): в один день у разных людей разные карточки, у одного человека
 * следующая карточка не повторяет прошлую (владелец 2026-11-24: «картинки всегда одинаковые, хотя у нас запас картинок есть»).
 */
import type { UiLang } from '@polski-go/shared';
import { escapeHtml as h } from '../html';
import { screenUrlWith } from '../send';
import type { InlineKeyboard } from '../quiz/engine';
import type { EngageKind } from '../../db/schema';
import { COPY_VARIANTS, ENGAGE_COPY, variantOf } from './copy';

export type CardData =
  | { kind: 'newcomer'; left: number | null }
  | { kind: 'comeback'; streakBest: number; words: number; city: string | null; /** Подарок за возвращение, если положен; null — без обещания подарка. */ gift: number | null }
  | { kind: 'mission'; slug: string; title: string; minutes: number; category: string };

const ch = (...names: string[]) => names.map((n) => `channel/${n}.jpg`);
/** Новичку — Бобек-учитель, весёлый: учёба, правила, слова, слушание. Без «экзаменов» (egzamin-*): там Бобек волнуется, новичка это пугает. */
const NEWCOMER_IMAGES = ch('nauka', 'zasada-1', 'sluchanie', 'slowa-tematy-1', 'zasada-2', 'rodzaj', 'slowa-tematy-2', 'wymowa-1', 'zasada-3');
/** Вернувшемуся — Бобек радуется и живёт польской жизнью: горы, кафе, кино, друзья. */
const COMEBACK_IMAGES = ch('brawo-1', 'narty', 'kawiarnia', 'termy', 'brawo-2', 'gry', 'kemping', 'kino', 'sasiad', 'silownia', 'slang');
/** Миссии — по теме; тема без своего набора — общий набор «жизнь в Польше». */
const MISSION_IMAGES: Record<string, string[]> = {
  shop: ch('sklep', 'targ', 'apteka-1', 'paczka', 'apteka-2'),
  food: ch('kawiarnia', 'kuchnia', 'targ'),
  road: ch('dworzec-1', 'lotnisko', 'dworzec-2'),
  transport: ch('tramwaj', 'dworzec-1', 'dworzec-2', 'lotnisko'),
  home: ch('mieszkanie', 'kuchnia', 'paczka', 'pralnia', 'sasiad'),
  work: ch('praca-biuro-1', 'rozmowa-1', 'budowa-1', 'urzad-1', 'praca-biuro-2', 'rozmowa-2', 'budowa-2', 'urzad-2'),
};
const MISSION_DEFAULT = ch('lotnisko', 'muzeum', 'finanse', 'biblioteka', 'kino', 'fryzjer', 'dentysta', 'likar-1', 'likar-2');

/** Все картинки карточек (проверка, что файлы на месте). */
export const CARD_IMAGES = [...new Set([...NEWCOMER_IMAGES, ...COMEBACK_IMAGES, ...Object.values(MISSION_IMAGES).flat(), ...MISSION_DEFAULT])];

/** Сколько вариантов текста у карточки этого вида. */
export function cardVariants(_kind: EngageKind): number {
  return COPY_VARIANTS;
}

/** Набор картинок карточки (для миссии — по её теме). */
function imagesOf(d: CardData): string[] {
  if (d.kind === 'newcomer') return NEWCOMER_IMAGES;
  if (d.kind === 'comeback') return COMEBACK_IMAGES;
  return MISSION_IMAGES[d.category] ?? MISSION_DEFAULT;
}

/** Сколько разных карточек показать в админке «как увидит игрок»: каждый текст и каждая картинка хотя бы раз. */
export function cardPicks(d: CardData): number {
  return Math.max(COPY_VARIANTS, imagesOf(d).length);
}

/**
 * Номер варианта карточки для человека и дня: соседние дни и соседние люди получают соседние номера, поэтому текст (по модулю 3)
 * и картинка (по модулю размера набора) меняются от карточки к карточке. Детерминирован: повторная отправка того же дня — та же карточка.
 */
export function cardSeed(telegramId: number, day: string): number {
  const days = Date.UTC(+day.slice(0, 4), +day.slice(5, 7) - 1, +day.slice(8, 10)) / 86_400_000;
  return Math.abs(Math.trunc(telegramId)) + days;
}

export function cardToggle(lang: UiLang, enabled: boolean): { text: string; callback_data: 'eg:off' | 'eg:on' } {
  const copy = ENGAGE_COPY[lang];
  return enabled ? { text: copy.off, callback_data: 'eg:off' } : { text: copy.on, callback_data: 'eg:on' };
}

/** `pick` — номер варианта (отправка передаёт `cardSeed`): текст — по модулю числа вариантов, картинка — по модулю набора. */
export function cardView(d: CardData, lang: UiLang, pick = 0): { text: string; keyboard: InlineKeyboard; image: string } {
  const copy = ENGAGE_COPY[lang];
  if (d.kind === 'newcomer') {
    return {
      text: h(d.left ? copy.newcomerLeft(d.left, pick) : copy.newcomerStart(pick)),
      image: variantOf(imagesOf(d), pick),
      keyboard: {
        inline_keyboard: [
          [{ text: d.left ? copy.newcomerLeftBtn : copy.newcomerStartBtn, web_app: { url: screenUrlWith('continue', { src: 'card_newcomer' }) } }],
          [cardToggle(lang, true)],
        ],
      },
    };
  }
  if (d.kind === 'comeback') {
    return {
      text: h(copy.comeback(d, pick)),
      image: variantOf(imagesOf(d), pick),
      keyboard: {
        inline_keyboard: [[{ text: d.gift ? copy.comebackBtn : copy.comebackBtnPlain, web_app: { url: screenUrlWith('home', { src: 'card_comeback' }) } }], [cardToggle(lang, true)]],
      },
    };
  }
  return {
    text: h(copy.mission(d.title, d.minutes, pick)),
    image: variantOf(imagesOf(d), pick),
    keyboard: {
      inline_keyboard: [[{ text: copy.missionBtn, web_app: { url: screenUrlWith('life', { src: 'card_mission' }) } }], [cardToggle(lang, true)]],
    },
  };
}
