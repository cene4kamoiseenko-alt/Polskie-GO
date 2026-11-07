/**
 * Строки жалобы на игрока (рейтинг и друзья). Отдельный файл, а не словарь i18n: словари грузятся при старте (бюджет JS в scripts/perf.ts),
 * а эти строки нужны только на экране рейтинга.
 */
import { useT } from '../i18n';

const uk = {
  report_btn: 'Поскаржитися на гравця',
  report_title: 'Поскаржитися на гравця',
  report_text: 'Ми перевіримо скаргу. Гравець не дізнається, хто поскаржився.',
  report_name: 'Недоречне ім’я',
  report_photo: 'Недоречне фото',
  report_other: 'Інше',
  report_cancel: 'Скасувати',
  report_sent: 'Скаргу надіслано. Дякуємо!',
  report_fail: 'Не вдалося надіслати скаргу',
  report_limit: 'Сьогодні скарг уже досить. Спробуй завтра.',
};

type Copy = Record<keyof typeof uk, string>;

const ru: Copy = {
  report_btn: 'Пожаловаться на игрока',
  report_title: 'Пожаловаться на игрока',
  report_text: 'Мы проверим жалобу. Игрок не узнает, кто пожаловался.',
  report_name: 'Неподходящее имя',
  report_photo: 'Неподходящее фото',
  report_other: 'Другое',
  report_cancel: 'Отмена',
  report_sent: 'Жалоба отправлена. Спасибо!',
  report_fail: 'Не удалось отправить жалобу',
  report_limit: 'Сегодня жалоб уже достаточно. Попробуй завтра.',
};

const en: Copy = {
  report_btn: 'Report player',
  report_title: 'Report this player',
  report_text: 'We will review the report. The player will not know who reported them.',
  report_name: 'Inappropriate name',
  report_photo: 'Inappropriate photo',
  report_other: 'Something else',
  report_cancel: 'Cancel',
  report_sent: 'Report sent. Thank you!',
  report_fail: 'Could not send the report',
  report_limit: 'That is enough reports for today. Try again tomorrow.',
};

const COPY: Record<'uk' | 'ru' | 'en', Copy> = { uk, ru, en };

export type ReportKey = keyof typeof uk;

export function useReportCopy() {
  const { lang } = useT();
  const dict = COPY[lang] ?? uk;
  return (key: ReportKey) => dict[key];
}
