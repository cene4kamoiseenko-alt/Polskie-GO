/**
 * Карточка бота: фото Бобека + подпись + кнопка в приложение (с меткой `src` — для отчёта «открыли») + «🔕 Не присылать такие
 * сообщения». Картинки — `public/bot/cards/*.jpg` (копии картинок канала, 1024 px).
 */
import type { UiLang } from '@polski-go/shared';
import { escapeHtml as h } from '../html';
import { screenUrlWith } from '../send';
import type { InlineKeyboard } from '../quiz/engine';
import { ENGAGE_COPY } from './copy';

export type CardData =
  | { kind: 'newcomer'; left: number | null }
  | { kind: 'comeback'; streakBest: number; words: number; city: string | null }
  | { kind: 'mission'; slug: string; title: string; minutes: number; category: string };

const NEWCOMER_IMAGES = ['cards/newcomer-1.jpg', 'cards/newcomer-2.jpg'];
const COMEBACK_IMAGES = ['cards/comeback-1.jpg', 'cards/comeback-2.jpg'];
const MISSION_IMAGES: Record<string, string> = {
  shop: 'cards/mission-shop.jpg',
  road: 'cards/mission-road.jpg',
  transport: 'cards/mission-road.jpg',
  home: 'cards/mission-home.jpg',
  work: 'cards/mission-work.jpg',
};
export const CARD_IMAGES = [...NEWCOMER_IMAGES, ...COMEBACK_IMAGES, ...new Set(Object.values(MISSION_IMAGES)), 'cards/mission.jpg'];

const of = (list: string[], pick: number) => list[Math.abs(Math.trunc(pick)) % list.length];

export function cardToggle(lang: UiLang, enabled: boolean): { text: string; callback_data: 'eg:off' | 'eg:on' } {
  const copy = ENGAGE_COPY[lang];
  return enabled ? { text: copy.off, callback_data: 'eg:off' } : { text: copy.on, callback_data: 'eg:on' };
}

/** `pick` — какой из вариантов картинки (отправка передаёт номер дня, чтобы картинки чередовались). */
export function cardView(d: CardData, lang: UiLang, pick = 0): { text: string; keyboard: InlineKeyboard; image: string } {
  const copy = ENGAGE_COPY[lang];
  if (d.kind === 'newcomer') {
    return {
      text: h(d.left ? copy.newcomerLeft(d.left) : copy.newcomerStart),
      image: of(NEWCOMER_IMAGES, pick),
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
      text: h(copy.comeback(d)),
      image: of(COMEBACK_IMAGES, pick),
      keyboard: {
        inline_keyboard: [[{ text: copy.comebackBtn, web_app: { url: screenUrlWith('home', { src: 'card_comeback' }) } }], [cardToggle(lang, true)]],
      },
    };
  }
  return {
    text: h(copy.mission(d.title, d.minutes)),
    image: MISSION_IMAGES[d.category] ?? 'cards/mission.jpg',
    keyboard: {
      inline_keyboard: [[{ text: copy.missionBtn, web_app: { url: screenUrlWith('life', { src: 'card_mission' }) } }], [cardToggle(lang, true)]],
    },
  };
}
