/**
 * Формат вопроса бота (вопрос дня и /quiz). Правила автора — docs/superpowers/specs/2026-11-13-daily-quiz-design.md, «База вопросов»:
 *  • ровно 4 варианта одной формы и одной темы (четыре фразы одного шаблона, четыре формы слова, четыре предлога в одной фразе);
 *  • неверные варианты — типичные ошибки носителей украинского и русского (падеж, вид, предлог, ложный друг, похожее слово);
 *  • длины вариантов близки (самый длинный ≤ 1,6 × самый короткий; иначе `lengthNote` с причиной);
 *  • пояснение объясняет, почему верный верен и чем плохи остальные; картинка по смыслу и не подсказывает ответ;
 *  • польские фразы от 3 слов не повторяют тексты уроков приложения.
 * Верный вариант пишется первым (`answer: 0`) — порядок на экране перемешивается при отправке.
 * Идентификаторы постоянные: на них ссылаются отправленные вопросы (`bot_quiz_rounds`, `daily_quiz_sends`, план дней).
 */
import type { UiLang } from '@polski-go/shared';
import type { QuizScene } from '../scenes';

export type L4 = Record<UiLang, string>;
export type QuizCategory = 'shopping' | 'food' | 'transport' | 'city' | 'work' | 'health' | 'everyday' | 'grammar' | 'talk';
export type QuizKind = 'situation' | 'meaning' | 'complete' | 'preposition' | 'verb' | 'reply' | 'listen' | 'translate';
export type QuizLevel = 'A1' | 'A2' | 'B1';

export type QuizQuestion = {
  id: string;
  category: QuizCategory;
  cefr: QuizLevel;
  kind: QuizKind;
  /** Картинка по смыслу — одна из 16 сцен (scenes.ts). */
  image: QuizScene;
  prompt: L4;
  /** Польские варианты (одинаковые для всех языков) или переводы по языкам. */
  options: string[] | Record<UiLang, string[]>;
  answer: number;
  explain: L4;
  /** Почему длины вариантов сильно различаются (исключение из правила 1,6). */
  lengthNote?: string;
};

export const q = (x: QuizQuestion) => x;
