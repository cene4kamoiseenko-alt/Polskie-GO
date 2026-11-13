/**
 * Сообщения вопроса дня: вопрос (фото сцены + подпись + 4 кнопки) и итог в том же сообщении после ответа.
 * Времени на ответ нет (в отличие от /quiz). Строка серии и кнопка урока до ответа — если серия ≥ 2 и сегодня ещё не занимался.
 */
import type { UiLang } from '@polski-go/shared';
import type { botQuizRounds } from '../../db/schema';
import { escapeHtml as h } from '../html';
import { QUIZ_COPY } from '../quiz/copy';
import { BUTTON_TEXT_MAX, LETTERS } from '../quiz/layout';
import { CATEGORY_NAMES, optionsOf, type QuizQuestion } from '../quiz/questions';
import { screenUrl } from '../send';
import { DAILY_COPY } from './copy';

type Button = { text: string; callback_data: string } | { text: string; web_app: { url: string } };
export type DailyKeyboard = { inline_keyboard: Button[][] };
type Round = typeof botQuizRounds.$inferSelect;

export type DailyExtra = { streak: number | null; returning: boolean; hasUser: boolean; test?: boolean };
export type DailyResult = { hasUser: boolean; xp: number; percent: number | null; dailyStreak: number; pushEnabled: boolean };

export const STREAK_LINE_MIN = 2;

export function dailyQuestionView(q: QuizQuestion, order: number[], lang: UiLang, roundId: string, extra: DailyExtra): { text: string; keyboard: DailyKeyboard } {
  const copy = DAILY_COPY[lang];
  const options = optionsOf(q, lang);
  const shown = order.map((i) => options[i]);
  const short = shown.every((o) => o.length <= BUTTON_TEXT_MAX);
  const streak = extra.hasUser && extra.streak !== null && extra.streak >= STREAK_LINE_MIN;
  const text = [
    ...(extra.test ? [h(copy.testNote), ''] : []),
    h(copy.header(CATEGORY_NAMES[q.category][lang], q.cefr)),
    ...(streak ? [h(copy.streakLine(extra.streak!))] : extra.returning ? [h(copy.returnLine)] : []),
    '',
    `<b>${h(q.prompt[lang])}</b>`,
    ...(short ? [] : ['', ...shown.map((o, i) => `<b>${LETTERS[i]}</b> — ${h(o)}`)]),
    '',
    h(copy.choose),
  ].join('\n');
  const button = (i: number): Button => ({ text: short ? `${LETTERS[i]} · ${shown[i]}` : LETTERS[i], callback_data: `qa:${roundId}:${i}` });
  const rows: Button[][] = short ? shown.map((_, i) => [button(i)]) : [shown.map((_, i) => button(i))];
  if (streak) rows.push([{ text: copy.lesson, web_app: { url: screenUrl('learn') } }]);
  return { text, keyboard: { inline_keyboard: rows } };
}

export function dailyResultView(round: Round, q: QuizQuestion, r: DailyResult): { text: string; keyboard: DailyKeyboard } {
  const lang = round.lang as UiLang;
  const copy = DAILY_COPY[lang];
  const quiz = QUIZ_COPY[lang];
  const options = optionsOf(q, lang);
  const letterOf = (i: number) => LETTERS[round.optionOrder.indexOf(i)] ?? '?';
  const text = [
    h(copy.header(CATEGORY_NAMES[q.category][lang], q.cefr)),
    `<b>${h(q.prompt[lang])}</b>`,
    '',
    `<b>${h(round.correct ? quiz.correct : quiz.wrong)}</b>`,
    ...(!round.correct && round.chosen !== null ? [h(quiz.yourAnswer(letterOf(round.chosen), options[round.chosen] ?? ''))] : []),
    h(quiz.rightAnswer(letterOf(q.answer), options[q.answer])),
    '',
    h(quiz.explainTitle),
    h(q.explain[lang]),
    '',
    ...(r.percent !== null ? [h(copy.percentLine(r.percent, q.cefr))] : []),
    ...(r.xp > 0 ? [h(copy.xp(r.xp))] : !r.hasUser ? [h(copy.noAccount)] : []),
    ...(r.dailyStreak >= 2 ? [h(copy.dailyStreak(r.dailyStreak))] : []),
  ].join('\n');
  const keyboard: DailyKeyboard = {
    inline_keyboard: [
      [r.hasUser ? { text: copy.lesson, web_app: { url: screenUrl('learn') } } : { text: copy.startApp, web_app: { url: screenUrl('home') } }],
      [{ text: copy.more, callback_data: 'qz:next' }],
      [dailyToggle(lang, r.pushEnabled)],
    ],
  };
  return { text, keyboard };
}

/** Кнопка «не присылать / присылать вопрос дня» (меняется на противоположную после нажатия). */
export function dailyToggle(lang: UiLang, enabled: boolean): Button {
  const copy = DAILY_COPY[lang];
  return enabled ? { text: copy.off, callback_data: 'qz:daily:0' } : { text: copy.on, callback_data: 'qz:daily:1' };
}

/** Текст сообщения без HTML-разметки — для «как увидит игрок» в админке. */
export const plainText = (html: string) => html.replace(/<\/?b>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
