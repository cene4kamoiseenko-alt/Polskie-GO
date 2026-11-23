/**
 * Строки «Сообщить об ошибке в задании». Отдельный файл, а не словарь i18n: словари грузятся при старте (бюджет JS в scripts/perf.ts),
 * а эти строки нужны только в уроке и миссии — как и строки жалобы на игрока (reportCopy.ts).
 */
import { useT } from '../i18n';

const uk = {
  xr_btn: 'Повідомити про помилку в завданні',
  xr_title: 'Помилка в завданні',
  xr_text: 'Що не так? Ми побачимо завдання, твою відповідь і коментар, перевіримо й виправимо.',
  xr_answer_rejected: 'Моя відповідь правильна, але її не зарахували',
  xr_answer_accepted: 'Зарахували відповідь, яка неправильна',
  xr_polish_error: 'Помилка в польському тексті',
  xr_translation_error: 'Помилка в перекладі',
  xr_unclear: 'Завдання незрозуміле або має два сенси',
  xr_too_easy: 'Надто просто: відповідь вгадується без польської',
  xr_audio: 'Озвучення неправильне або не відтворюється',
  xr_other: 'Інше',
  xr_comment: 'Що саме не так? Наприклад, яке слово чи переклад (необов’язково)',
  xr_comment_other: 'Опиши, що не так',
  xr_send: 'Надіслати',
  xr_cancel: 'Скасувати',
  xr_sent: 'Дякуємо! Ми перевіримо завдання.',
  xr_fail: 'Не вдалося надіслати. Спробуй ще раз.',
  xr_limit: 'Сьогодні повідомлень уже досить. Спробуй завтра.',
};

type Copy = Record<keyof typeof uk, string>;

const ru: Copy = {
  xr_btn: 'Сообщить об ошибке в задании',
  xr_title: 'Ошибка в задании',
  xr_text: 'Что не так? Мы увидим задание, твой ответ и комментарий, проверим и исправим.',
  xr_answer_rejected: 'Мой ответ верный, но его не засчитали',
  xr_answer_accepted: 'Засчитали ответ, который неверный',
  xr_polish_error: 'Ошибка в польском тексте',
  xr_translation_error: 'Ошибка в переводе',
  xr_unclear: 'Задание непонятное или имеет два смысла',
  xr_too_easy: 'Слишком просто: ответ угадывается без польского',
  xr_audio: 'Озвучка неверная или не воспроизводится',
  xr_other: 'Другое',
  xr_comment: 'Что именно не так? Например, какое слово или перевод (необязательно)',
  xr_comment_other: 'Опиши, что не так',
  xr_send: 'Отправить',
  xr_cancel: 'Отмена',
  xr_sent: 'Спасибо! Мы проверим задание.',
  xr_fail: 'Не удалось отправить. Попробуй ещё раз.',
  xr_limit: 'Сегодня сообщений уже достаточно. Попробуй завтра.',
};

const en: Copy = {
  xr_btn: 'Report a mistake in this exercise',
  xr_title: 'Mistake in the exercise',
  xr_text: 'What is wrong? We will see the exercise, your answer and your comment, then check and fix it.',
  xr_answer_rejected: 'My answer is correct but was marked wrong',
  xr_answer_accepted: 'A wrong answer was accepted',
  xr_polish_error: 'Mistake in the Polish text',
  xr_translation_error: 'Mistake in the translation',
  xr_unclear: 'The exercise is unclear or has two meanings',
  xr_too_easy: 'Too easy: the answer can be guessed without Polish',
  xr_audio: 'The audio is wrong or does not play',
  xr_other: 'Something else',
  xr_comment: 'What exactly is wrong? For example, which word or translation (optional)',
  xr_comment_other: 'Describe what is wrong',
  xr_send: 'Send',
  xr_cancel: 'Cancel',
  xr_sent: 'Thank you! We will check the exercise.',
  xr_fail: 'Could not send. Please try again.',
  xr_limit: 'That is enough reports for today. Try again tomorrow.',
};

const COPY: Record<'uk' | 'ru' | 'en', Copy> = { uk, ru, en };

export type ExerciseReportKey = keyof typeof uk;

export const EXERCISE_REPORT_REASONS = ['answer_rejected', 'answer_accepted', 'polish_error', 'translation_error', 'unclear', 'too_easy', 'audio', 'other'] as const;
export type ExerciseReportReason = (typeof EXERCISE_REPORT_REASONS)[number];

export function useExerciseReportCopy() {
  const { lang } = useT();
  const dict = COPY[lang] ?? uk;
  return (key: ExerciseReportKey) => dict[key];
}
