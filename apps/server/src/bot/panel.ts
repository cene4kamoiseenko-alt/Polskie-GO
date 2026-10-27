/**
 * Постоянная панель быстрых кнопок под полем ввода (ReplyKeyboard): Урок, Карта, Слова, Задания, Профиль, Настройки
 * и третьей строкой — быстрый вопрос (/quiz).
 * Кнопка отправляет обычный текст с подписью, бот узнаёт её по любому из четырёх языков и отвечает как на команду:
 * карточкой с картинкой и inline-кнопками. Панель ставится отдельным коротким сообщением после /start и /help
 * (у сообщения не может быть двух клавиатур) и остаётся в чате, пока её не уберут. Только в личных чатах.
 */
import type { UiLang } from '@polski-go/shared';
import { botApi } from '../lib/telegram';
import type { MenuCommand } from './catalog';

type Item = { command: MenuCommand; label: string };

const items = (labels: [string, string, string, string, string, string, string]): Item[] => [
  { command: 'lesson', label: labels[0] },
  { command: 'map', label: labels[1] },
  { command: 'words', label: labels[2] },
  { command: 'quests', label: labels[3] },
  { command: 'profile', label: labels[4] },
  { command: 'settings', label: labels[5] },
  { command: 'quiz', label: labels[6] },
];

export const PANEL: Record<UiLang, { text: string; items: Item[] }> = {
  ru: { text: '⌨️ Быстрое меню внизу — нажимайте кнопки 👇', items: items(['📚 Урок', '🗺 Карта', '📖 Слова', '🎯 Задания', '🏆 Профиль', '⚙️ Настройки', '🧠 Быстрый вопрос']) },
  uk: { text: '⌨️ Швидке меню внизу — натискайте кнопки 👇', items: items(['📚 Урок', '🗺 Карта', '📖 Слова', '🎯 Завдання', '🏆 Профіль', '⚙️ Налаштування', '🧠 Швидке питання']) },
  pl: { text: '⌨️ Szybkie menu na dole — wybierz przycisk 👇', items: items(['📚 Lekcja', '🗺 Mapa', '📖 Słowa', '🎯 Zadania', '🏆 Profil', '⚙️ Ustawienia', '🧠 Szybkie pytanie']) },
  en: { text: '⌨️ Quick menu below — tap a button 👇', items: items(['📚 Lesson', '🗺 Map', '📖 Words', '🎯 Tasks', '🏆 Profile', '⚙️ Settings', '🧠 Quick question']) },
};

/** Подпись кнопки → команда, для всех языков сразу: язык пользователя мог смениться после установки панели. */
const BY_LABEL = new Map<string, MenuCommand>(Object.values(PANEL).flatMap((p) => p.items.map((i) => [i.label, i.command] as const)));

export function commandForLabel(text: string | undefined): MenuCommand | null {
  return BY_LABEL.get((text ?? '').trim()) ?? null;
}

/** Две строки по три кнопки и быстрый вопрос во всю ширину. */
export function panelKeyboard(lang: UiLang) {
  const labels = PANEL[lang].items.map((i) => ({ text: i.label }));
  return { keyboard: [labels.slice(0, 3), labels.slice(3, 6), labels.slice(6)], resize_keyboard: true, is_persistent: true };
}

/** Ставит панель; ответ на команду уже ушёл, поэтому сбой панели не должен ломать его повтором. */
export async function sendPanel(chatId: number, lang: UiLang): Promise<boolean> {
  try {
    await botApi('sendMessage', { chat_id: chatId, text: PANEL[lang].text, reply_markup: panelKeyboard(lang) });
    return true;
  } catch (e) {
    console.warn('bot: quick menu not sent', (e as Error).message);
    return false;
  }
}
