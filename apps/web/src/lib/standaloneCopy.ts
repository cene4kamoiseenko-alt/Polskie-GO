/**
 * Строки входа вне Telegram (экран приветствия, код переноса в настройках, ссылки на документы, Premium без Stars). Отдельный файл, а не словарь i18n:
 * словари uk / ru / en грузятся при старте (бюджет JS в scripts/perf.ts), а эти строки нужны только на ленивых экранах Welcome, Settings и Premium вне Telegram.
 */
import { useT } from '../i18n';

const uk = {
  welcome_title: 'Вітаємо в POLSKI GO',
  welcome_text: 'Вивчай польську разом із бобром Бобеком. Почни одразу — акаунт створиться на цьому пристрої.',
  welcome_guest: 'Почати',
  welcome_have_code: 'Я вже граю в Telegram',
  welcome_code_hint: 'Відкрий POLSKI GO у Telegram → Налаштування → «Вхід на іншому пристрої», отримай код і введи його тут.',
  welcome_code_label: 'Код для входу',
  welcome_code_go: 'Увійти',
  welcome_code_bad: 'Код не підійшов або застарів. Отримай новий у Telegram.',
  welcome_net: 'Немає зв’язку. Спробуй ще раз.',
  welcome_slow: 'Забагато спроб. Зачекай хвилину.',
  welcome_busy: 'Сервер зараз перевантажений. Спробуй пізніше.',
  welcome_off: 'Вхід поза Telegram зараз недоступний. Відкрий POLSKI GO в Telegram.',
  welcome_back: 'Назад',
  welcome_privacy_note: 'Продовжуючи, ти погоджуєшся з умовами:',
  welcome_privacy: 'політика конфіденційності',
  set_link_title: 'Вхід на іншому пристрої',
  set_link_text: 'Отримай одноразовий код і введи його в застосунку на Android або в браузері — прогрес і покупки будуть спільними.',
  set_link_get: 'Отримати код',
  set_link_valid: 'Код діє 10 хвилин і спрацьовує лише раз.',
  set_link_guest: 'Це гостьовий акаунт: він зберігається лише на цьому пристрої. Отримай код, щоб не втратити прогрес.',
  set_link_fail: 'Не вдалося отримати код',
  set_link_many: 'Уже видано п’ять кодів. Зачекай кілька хвилин або використай один із них.',
  set_link_off: 'Вхід на іншому пристрої зараз вимкнено на сервері.',
  copy_tap: 'Торкнись коду, щоб скопіювати',
  copy_done: 'Скопійовано',
  copy_fail: 'Не вдалося скопіювати. Виділи код вручну.',
  set_privacy_link: 'Політика конфіденційності',
  set_delete_page: 'Як видалити акаунт',
  prem_store_only: 'Оформлення Premium у цій версії з’явиться пізніше. Усі безкоштовні уроки й місії доступні вже зараз.',
  set_notif_guest: 'Нагадування Бобек надсилає через Telegram, тому в гостьовому акаунті їх немає.',
  welcome_terms: 'умови використання',
  set_terms_link: 'Умови використання',
  theme_system: 'Як у системі',
};

type Copy = Record<keyof typeof uk, string>;

const ru: Copy = {
  welcome_title: 'Добро пожаловать в POLSKI GO',
  welcome_text: 'Учи польский вместе с бобром Бобеком. Начни сразу — аккаунт создастся на этом устройстве.',
  welcome_guest: 'Начать',
  welcome_have_code: 'Я уже играю в Telegram',
  welcome_code_hint: 'Открой POLSKI GO в Telegram → Настройки → «Вход на другом устройстве», получи код и введи его здесь.',
  welcome_code_label: 'Код для входа',
  welcome_code_go: 'Войти',
  welcome_code_bad: 'Код не подошёл или устарел. Получи новый в Telegram.',
  welcome_net: 'Нет связи. Попробуй ещё раз.',
  welcome_slow: 'Слишком много попыток. Подожди минуту.',
  welcome_busy: 'Сервер сейчас перегружен. Попробуй позже.',
  welcome_off: 'Вход вне Telegram сейчас недоступен. Открой POLSKI GO в Telegram.',
  welcome_back: 'Назад',
  welcome_privacy_note: 'Продолжая, ты соглашаешься с условиями:',
  welcome_privacy: 'политика конфиденциальности',
  set_link_title: 'Вход на другом устройстве',
  set_link_text: 'Получи одноразовый код и введи его в приложении на Android или в браузере — прогресс и покупки будут общими.',
  set_link_get: 'Получить код',
  set_link_valid: 'Код действует 10 минут и срабатывает только один раз.',
  set_link_guest: 'Это гостевой аккаунт: он хранится только на этом устройстве. Получи код, чтобы не потерять прогресс.',
  set_link_fail: 'Не удалось получить код',
  set_link_many: 'Уже выдано пять кодов. Подожди несколько минут или используй один из них.',
  set_link_off: 'Вход на другом устройстве сейчас выключен на сервере.',
  copy_tap: 'Нажми на код, чтобы скопировать',
  copy_done: 'Скопировано',
  copy_fail: 'Не удалось скопировать. Выдели код вручную.',
  set_privacy_link: 'Политика конфиденциальности',
  set_delete_page: 'Как удалить аккаунт',
  prem_store_only: 'Оформление Premium в этой версии появится позже. Все бесплатные уроки и миссии доступны уже сейчас.',
  set_notif_guest: 'Напоминания Бобек присылает через Telegram, поэтому в гостевом аккаунте их нет.',
  welcome_terms: 'условия использования',
  set_terms_link: 'Условия использования',
  theme_system: 'Как в системе',
};

const en: Copy = {
  welcome_title: 'Welcome to POLSKI GO',
  welcome_text: 'Learn Polish with Bobek the beaver. Start right away — an account is created on this device.',
  welcome_guest: 'Start',
  welcome_have_code: 'I already play in Telegram',
  welcome_code_hint: 'Open POLSKI GO in Telegram → Settings → “Sign in on another device”, get a code and enter it here.',
  welcome_code_label: 'Sign-in code',
  welcome_code_go: 'Sign in',
  welcome_code_bad: 'The code was not accepted or has expired. Get a new one in Telegram.',
  welcome_net: 'No connection. Please try again.',
  welcome_slow: 'Too many attempts. Wait a minute.',
  welcome_busy: 'The server is busy right now. Please try again later.',
  welcome_off: 'Signing in outside Telegram is not available right now. Open POLSKI GO in Telegram.',
  welcome_back: 'Back',
  welcome_privacy_note: 'By continuing you agree to the',
  welcome_privacy: 'privacy policy',
  set_link_title: 'Sign in on another device',
  set_link_text: 'Get a one-time code and enter it in the Android app or in a browser — progress and purchases are shared.',
  set_link_get: 'Get a code',
  set_link_valid: 'The code is valid for 10 minutes and works once.',
  set_link_guest: 'This is a guest account: it is stored only on this device. Get a code so you do not lose your progress.',
  set_link_fail: 'Could not get a code',
  set_link_many: 'Five codes are already active. Wait a few minutes or use one of them.',
  set_link_off: 'Sign-in on another device is currently switched off on the server.',
  copy_tap: 'Tap the code to copy it',
  copy_done: 'Copied',
  copy_fail: 'Could not copy. Select the code by hand.',
  set_privacy_link: 'Privacy policy',
  set_delete_page: 'How to delete your account',
  prem_store_only: 'Premium purchase in this version will be available later. All free lessons and missions are available now.',
  set_notif_guest: 'Bobek sends reminders through Telegram, so a guest account has none.',
  welcome_terms: 'terms of use',
  set_terms_link: 'Terms of use',
  theme_system: 'Like the system',
};

const COPY: Record<'uk' | 'ru' | 'en', Copy> = { uk, ru, en };

export type StandaloneKey = keyof typeof uk;

/** Строка на языке интерфейса (до загрузки профиля — на языке системы, как и весь интерфейс). */
export function useStandaloneCopy() {
  const { lang } = useT();
  const dict = COPY[lang] ?? uk;
  return (key: StandaloneKey) => dict[key];
}
