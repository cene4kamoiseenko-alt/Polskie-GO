/**
 * Вопросы бота (вопрос дня и /quiz) — банк по темам в ./bank/*.ts, правила автора — ./bank/types.ts.
 * Темы — магазин, кафе, транспорт, город и urząd, работа, здоровье, быт, грамматика в контексте, общение.
 * Механики — ситуация («что скажешь»), значение слова, вставка формы или предлога, ответ на реплику, понимание объявления.
 * Качество (4 варианта одной формы, длины, «не из приложения», картинка, длина подписи) проверяет apps/server/test/quiz-bank.test.ts.
 */
import type { UiLang } from '@polski-go/shared';
import { A1_NEW } from './bank/a1';
import { A1_NEW_B } from './bank/a1b';
import { A2_NEW } from './bank/a2';
import { CITY } from './bank/city';
import { EVERYDAY } from './bank/everyday';
import { FOOD } from './bank/food';
import { GRAMMAR_Q } from './bank/grammar';
import { HEALTH } from './bank/health';
import { SHOPPING } from './bank/shopping';
import { TALK } from './bank/talk';
import { TRANSPORT } from './bank/transport';
import type { L4, QuizCategory, QuizQuestion } from './bank/types';
import { WORK } from './bank/work';

export type { L4, QuizCategory, QuizKind, QuizLevel, QuizQuestion } from './bank/types';

export const CATEGORY_NAMES: Record<QuizCategory, L4> = {
  shopping: { ru: 'Покупки', uk: 'Покупки', en: 'Shopping' },
  food: { ru: 'Еда и кафе', uk: 'Їжа і кафе', en: 'Food and cafés' },
  transport: { ru: 'Транспорт', uk: 'Транспорт', en: 'Transport' },
  city: { ru: 'Город и urząd', uk: 'Місто й urząd', en: 'City and offices' },
  work: { ru: 'Работа', uk: 'Робота', en: 'Work' },
  health: { ru: 'Здоровье', uk: "Здоров'я", en: 'Health' },
  everyday: { ru: 'Быт', uk: 'Побут', en: 'Everyday life' },
  grammar: { ru: 'Грамматика', uk: 'Граматика', en: 'Grammar' },
  talk: { ru: 'Общение', uk: 'Спілкування', en: 'Small talk' },
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [...SHOPPING, ...FOOD, ...TRANSPORT, ...CITY, ...WORK, ...HEALTH, ...EVERYDAY, ...GRAMMAR_Q, ...TALK, ...A1_NEW, ...A1_NEW_B, ...A2_NEW];

/** Вопрос по идентификатору (для ответа на отправленный раньше вопрос). */
export const QUESTION_BY_ID = new Map(QUIZ_QUESTIONS.map((x) => [x.id, x]));

export function optionsOf(question: QuizQuestion, lang: UiLang): string[] {
  return Array.isArray(question.options) ? question.options : question.options[lang];
}

/**
 * Польские фразы вопроса — для проверки «не из приложения»: варианты (если они польские), польские цитаты «…» из текста вопроса
 * и, для вопросов с пропуском `___`, фраза с подставленным верным вариантом.
 */
export function polishPhrases(question: QuizQuestion): string[] {
  const polish = Array.isArray(question.options) ? question.options : null;
  const out = polish ? [...polish] : [];
  for (const m of question.prompt.en.matchAll(/«([^»]+)»/g)) {
    const fragment = m[1];
    if (!/[a-ząćęłńóśźż]/i.test(fragment)) continue;
    if (fragment.includes('___')) {
      if (polish) out.push(fragment.replace('___', polish[question.answer]));
    } else out.push(fragment);
  }
  return out;
}
