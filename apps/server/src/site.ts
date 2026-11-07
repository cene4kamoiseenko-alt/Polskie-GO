/**
 * Публичные страницы, которых требует Google Play, и файл связи сайта с Android-приложением:
 *  · /privacy — политика конфиденциальности (uk / ru / en, выбор — `?lang=`);
 *  · /terms — условия использования: правила для имён и фото, жалобы и модерация (требование Google Play к данным игроков);
 *  · /delete-account — как удалить аккаунт и данные (обязательная ссылка в форме Data safety);
 *  · /.well-known/assetlinks.json — Digital Asset Links: подтверждает, что приложение с этим именем пакета и ключом подписи вправе открывать сайт как TWA
 *    (без него Android показывает адресную строку браузера). Имя пакета и отпечатки — переменные ANDROID_PACKAGE_NAME и ANDROID_SHA256_FINGERPRINTS.
 * Тексты описывают то, что приложение делает на самом деле (см. docs/ANDROID_RU.md, раздел «Данные»); при изменении сбора данных меняются вместе с кодом.
 */
import { Hono } from 'hono';
import { config } from './env';
import type { AppEnv } from './hono';

type Lang = 'uk' | 'ru' | 'en';
const LANGS: readonly Lang[] = ['uk', 'ru', 'en'];
const LANG_NAME: Record<Lang, string> = { uk: 'Українська', ru: 'Русский', en: 'English' };

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Как с нами связаться: адрес из настроек, иначе бот (команды /paysupport и /terms там уже есть). */
function contact(lang: Lang): string {
  const c = config.supportContact;
  if (c) return /^https?:\/\//.test(c) ? `<a href="${escapeHtml(c)}">${escapeHtml(c)}</a>` : c.includes('@') ? `<a href="mailto:${escapeHtml(c)}">${escapeHtml(c)}</a>` : escapeHtml(c);
  const bot = config.botUsername;
  const link = `<a href="https://t.me/${escapeHtml(bot)}">@${escapeHtml(bot)}</a>`;
  return { uk: `у Telegram-боті ${link} (команда /paysupport)`, ru: `в Telegram-боте ${link} (команда /paysupport)`, en: `in the Telegram bot ${link} (command /paysupport)` }[lang];
}

/** Метка места контакта в тексте: абзацы экранируются целиком, а готовый HTML контакта подставляется после (иначе он экранировался бы дважды). */
const CONTACT_MARK = '\u0000contact\u0000';

type Doc = { title: string; updated: string; sections: { h: string; p: string[] }[] };

const PRIVACY: Record<Lang, (c: string) => Doc> = {
  uk: (c) => ({
    title: 'Політика конфіденційності — POLSKI GO',
    updated: 'Оновлено 7 листопада 2026',
    sections: [
      { h: 'Хто ми і про що цей документ', p: ['POLSKI GO — застосунок для вивчення польської мови: працює як Telegram Mini App і як застосунок для Android (Google Play). Цей документ пояснює, які дані ми збираємо, навіщо і як ними розпоряджатися.'] },
      { h: 'Які дані ми збираємо', p: [
        'Акаунт у Telegram: числовий ідентифікатор Telegram, ім’я, прізвище, ім’я користувача, адреса фото профілю і мова інтерфейсу — їх передає Telegram під час входу в Mini App.',
        'Акаунт «гість» (Android, веб): випадковий внутрішній номер і ключ пристрою. Ім’я, e-mail чи номер телефону не потрібні.',
        'Навчальні дані: прогрес, відповіді на завдання, словник, досягнення, віртуальна валюта й речі, серія днів, налаштування (мова, мета, час нагадування, часовий пояс). За вашим вибором: публічний профіль і рейтинг, друзі.',
        'Скарги: якщо ви скаржитеся на гравця, ми зберігаємо, хто, на кого, з якої причини й коли поскаржився. Гравець, на якого скаржаться, не дізнається, хто це зробив. Скарги видаляються разом з акаунтом.',
        'Платежі: Premium у Telegram оплачується Telegram Stars; ми зберігаємо запис про платіж (сума, статус, ідентифікатор платежу), але не дані карток. Покупки в Android-версії проходитимуть через Google Play, який обробляє платіж.',
        'Голос: під час вправ на вимову запис із мікрофона надсилається на наш сервер лише для перевірки й передається постачальнику розпізнавання мовлення (Microsoft Azure або Google, якщо увімкнено). Ми не зберігаємо аудіозаписи.',
        'Технічні дані: звіти про помилки (текст помилки, адреса екрана, версія застосунку — без імені й ідентифікаторів гравця), IP-адреса обробляється Cloudflare для захисту від зловживань і обмеження кількості запитів.',
      ] },
      { h: 'Навіщо ми це використовуємо', p: ['Щоб показувати ваш прогрес на всіх пристроях, нараховувати нагороди, надсилати нагадування в Telegram (лише якщо ви їх увімкнули), перевіряти платежі, захищати сервіс від зловживань і виправляти помилки. Ми не продаємо дані й не показуємо рекламу.'] },
      { h: 'Хто ще обробляє дані', p: ['Cloudflare (хостинг, база даних, сховище звукових файлів), Telegram (вхід, платежі Stars, повідомлення), постачальники розпізнавання мовлення (див. вище) і Google Play (оплата в Android-версії).'] },
      { h: 'Скільки ми зберігаємо', p: ['Дані акаунта зберігаються, поки існує акаунт. Журнал помилок — 30 днів. Одноразові коди входу — 10 хвилин. Записи про платежі після видалення акаунта знеособлюються й зберігаються лише в обсязі, потрібному за законом.'] },
      { h: 'Ваші права', p: ['Ви можете завантажити всі свої дані (Профіль → Налаштування → Експорт даних) і видалити акаунт разом з усіма даними (Профіль → Налаштування → Видалити акаунт). Інструкція — на сторінці /delete-account. Також можна просто написати нам.'] },
      { h: 'Діти', p: ['Застосунок не призначений для дітей до 13 років, і ми свідомо не збираємо їхні дані.'] },
      { h: 'Зв’язок', p: [`З питань даних і підтримки звертайтеся ${c}.`] },
    ],
  }),
  ru: (c) => ({
    title: 'Политика конфиденциальности — POLSKI GO',
    updated: 'Обновлено 7 ноября 2026',
    sections: [
      { h: 'Кто мы и о чём этот документ', p: ['POLSKI GO — приложение для изучения польского языка: работает как Telegram Mini App и как приложение для Android (Google Play). Здесь описано, какие данные мы собираем, зачем и как ими управлять.'] },
      { h: 'Какие данные мы собираем', p: [
        'Аккаунт Telegram: числовой идентификатор Telegram, имя, фамилия, имя пользователя, адрес фото профиля и язык интерфейса — их передаёт Telegram при входе в Mini App.',
        'Аккаунт «гость» (Android, веб): случайный внутренний номер и ключ устройства. Имя, e-mail и номер телефона не нужны.',
        'Учебные данные: прогресс, ответы на задания, словарь, достижения, виртуальная валюта и вещи, серия дней, настройки (язык, цель, время напоминания, часовой пояс). По вашему выбору: публичный профиль и рейтинг, друзья.',
        'Жалобы: если вы жалуетесь на игрока, мы храним, кто, на кого, по какой причине и когда пожаловался. Игрок, на которого жалуются, не узнает, кто это сделал. Жалобы удаляются вместе с аккаунтом.',
        'Платежи: Premium в Telegram оплачивается Telegram Stars; мы храним запись о платеже (сумма, статус, идентификатор платежа), но не данные карт. Покупки в Android-версии будут проходить через Google Play, который обрабатывает платёж.',
        'Голос: в упражнениях на произношение запись с микрофона отправляется на наш сервер только для проверки и передаётся поставщику распознавания речи (Microsoft Azure или Google, если включено). Аудиозаписи мы не сохраняем.',
        'Технические данные: отчёты об ошибках (текст ошибки, адрес экрана, версия приложения — без имени и идентификаторов игрока); IP-адрес обрабатывает Cloudflare для защиты от злоупотреблений и ограничения частоты запросов.',
      ] },
      { h: 'Зачем мы это используем', p: ['Чтобы показывать прогресс на всех устройствах, начислять награды, присылать напоминания в Telegram (только если вы их включили), проверять платежи, защищать сервис от злоупотреблений и исправлять ошибки. Мы не продаём данные и не показываем рекламу.'] },
      { h: 'Кто ещё обрабатывает данные', p: ['Cloudflare (хостинг, база данных, хранилище звуковых файлов), Telegram (вход, платежи Stars, сообщения), поставщики распознавания речи (см. выше) и Google Play (оплата в Android-версии).'] },
      { h: 'Сколько мы храним', p: ['Данные аккаунта — пока существует аккаунт. Журнал ошибок — 30 дней. Одноразовые коды входа — 10 минут. Записи о платежах после удаления аккаунта обезличиваются и хранятся только в объёме, нужном по закону.'] },
      { h: 'Ваши права', p: ['Вы можете скачать все свои данные (Профиль → Настройки → Экспорт данных) и удалить аккаунт со всеми данными (Профиль → Настройки → Удалить аккаунт). Инструкция — на странице /delete-account. Можно и просто написать нам.'] },
      { h: 'Дети', p: ['Приложение не предназначено для детей младше 13 лет, мы сознательно не собираем их данные.'] },
      { h: 'Связь', p: [`По вопросам данных и поддержки пишите ${c}.`] },
    ],
  }),
  en: (c) => ({
    title: 'Privacy Policy — POLSKI GO',
    updated: 'Updated 7 November 2026',
    sections: [
      { h: 'Who we are and what this covers', p: ['POLSKI GO is a Polish-language learning app that runs as a Telegram Mini App and as an Android app (Google Play). This page explains what data we collect, why, and how you can control it.'] },
      { h: 'What we collect', p: [
        'Telegram account: your numeric Telegram ID, first and last name, username, profile photo URL and interface language, provided by Telegram when you open the Mini App.',
        'Guest account (Android, web): a random internal ID and a device key. No name, e-mail address or phone number is required.',
        'Learning data: progress, exercise answers, vocabulary, achievements, virtual currency and items, daily streak, settings (language, goal, reminder time, time zone). Optionally: public profile, leaderboard, friends.',
        'Reports: if you report a player, we store who reported whom, the reason and the date. The reported player is not told who reported them. Reports are deleted together with the account.',
        'Payments: Premium in Telegram is paid with Telegram Stars; we keep a payment record (amount, status, payment ID) but never card data. Purchases in the Android version go through Google Play, which processes the payment.',
        'Voice: in pronunciation exercises the microphone recording is sent to our server only to be checked and is passed to a speech-recognition provider (Microsoft Azure or Google, when enabled). We do not store audio recordings.',
        'Technical data: error reports (error text, screen address, app version — no name or player identifiers); your IP address is processed by Cloudflare for abuse protection and rate limiting.',
      ] },
      { h: 'Why we use it', p: ['To show your progress on all your devices, grant rewards, send Telegram reminders (only if you turn them on), verify payments, protect the service from abuse and fix bugs. We do not sell data and we show no ads.'] },
      { h: 'Who else processes it', p: ['Cloudflare (hosting, database, audio file storage), Telegram (sign-in, Stars payments, messages), speech-recognition providers (see above) and Google Play (payments in the Android version).'] },
      { h: 'How long we keep it', p: ['Account data is kept while the account exists. The error log is kept for 30 days. One-time sign-in codes live for 10 minutes. Payment records are anonymised after the account is deleted and kept only as long as the law requires.'] },
      { h: 'Your rights', p: ['You can download all your data (Profile → Settings → Export data) and delete your account together with all its data (Profile → Settings → Delete account). Instructions are on /delete-account. You can also simply write to us.'] },
      { h: 'Children', p: ['The app is not directed to children under 13 and we do not knowingly collect their data.'] },
      { h: 'Contact', p: [`For data and support questions, contact us ${c}.`] },
    ],
  }),
};

const DELETE: Record<Lang, (c: string) => Doc> = {
  uk: (c) => ({
    title: 'Видалення акаунта — POLSKI GO',
    updated: 'Оновлено 7 листопада 2026',
    sections: [
      { h: 'У застосунку', p: ['Відкрийте POLSKI GO (Telegram або Android) → Профіль → Налаштування → «Видалити акаунт» і підтвердіть. Акаунт і всі пов’язані дані видаляються одразу й безповоротно: прогрес, словник, досягнення, речі, друзі, налаштування, ключі пристроїв.'] },
      { h: 'Не можете зайти в застосунок?', p: [`Напишіть нам ${c} із того ж акаунта Telegram — ми видалимо акаунт вручну.`] },
      { h: 'Що буде збережено', p: ['Записи про платежі Premium (сума, дата, ідентифікатор платежу) знеособлюються й зберігаються лише в обсязі, потрібному за законом про облік. Звіти про помилки не містять особистих даних і видаляються за 30 днів.'] },
      { h: 'Перед видаленням', p: ['Якщо хочете зберегти копію даних, спочатку скористайтеся «Експорт даних» у тому ж розділі. Premium після видалення не відновлюється.'] },
    ],
  }),
  ru: (c) => ({
    title: 'Удаление аккаунта — POLSKI GO',
    updated: 'Обновлено 7 ноября 2026',
    sections: [
      { h: 'В приложении', p: ['Откройте POLSKI GO (Telegram или Android) → Профиль → Настройки → «Удалить аккаунт» и подтвердите. Аккаунт и все связанные данные удаляются сразу и безвозвратно: прогресс, словарь, достижения, вещи, друзья, настройки, ключи устройств.'] },
      { h: 'Не можете войти в приложение?', p: [`Напишите нам ${c} из того же аккаунта Telegram — мы удалим аккаунт вручную.`] },
      { h: 'Что сохраняется', p: ['Записи о платежах Premium (сумма, дата, идентификатор платежа) обезличиваются и хранятся только в объёме, нужном по закону об учёте. Отчёты об ошибках не содержат личных данных и удаляются через 30 дней.'] },
      { h: 'Перед удалением', p: ['Если нужна копия данных, сначала воспользуйтесь «Экспорт данных» в том же разделе. Premium после удаления не восстанавливается.'] },
    ],
  }),
  en: (c) => ({
    title: 'Delete your account — POLSKI GO',
    updated: 'Updated 7 November 2026',
    sections: [
      { h: 'In the app', p: ['Open POLSKI GO (Telegram or Android) → Profile → Settings → “Delete account” and confirm. The account and all linked data are deleted immediately and permanently: progress, vocabulary, achievements, items, friends, settings and device keys.'] },
      { h: 'Can’t open the app?', p: [`Write to us ${c} from the same Telegram account and we will delete the account manually.`] },
      { h: 'What is kept', p: ['Premium payment records (amount, date, payment ID) are anonymised and kept only as long as accounting law requires. Error reports contain no personal data and are deleted after 30 days.'] },
      { h: 'Before you delete', p: ['If you want a copy of your data, use “Export data” in the same section first. Premium is not restored after deletion.'] },
    ],
  }),
};

/** Условия использования: правила для имён и фото, которые видят другие игроки, жалобы и последствия (UGC-политика Google Play), платежи, возраст. */
const TERMS: Record<Lang, (c: string) => Doc> = {
  uk: (c) => ({
    title: 'Умови використання — POLSKI GO',
    updated: 'Оновлено 7 листопада 2026',
    sections: [
      { h: 'Про застосунок', p: ['POLSKI GO — навчальний застосунок для вивчення польської мови. Користуватися ним можна від 13 років. Користуючись застосунком, ви погоджуєтеся з цими умовами та з політикою конфіденційності (/privacy).'] },
      { h: 'Імена та фото', p: ['Ім’я гравця й фото профілю бачать інші гравці в рейтингу та у списку друзів. Не використовуйте образливі, ненависницькі, непристойні імена чи фото, не видавайте себе за іншу людину, не рекламуйте сторонні сервіси.'] },
      { h: 'Скарги та модерація', p: ['На будь-якого гравця можна поскаржитися кнопкою-прапорцем у рейтингу чи списку друзів. Ми розглядаємо скарги: можемо замінити ім’я на нейтральне, обмежити або заблокувати акаунт. За повторні порушення акаунт блокується.'] },
      { h: 'Premium і платежі', p: ['Premium у Telegram оплачується Telegram Stars; питання щодо оплати та повернення коштів — через /paysupport у боті. У версії для Android Premium наразі не продається. Віртуальна валюта (злотки) та речі не мають грошової вартості й не обмінюються на гроші.'] },
      { h: 'Зміни та зв’язок', p: [`Ми можемо змінювати ці умови; чинна версія завжди за цією адресою. З будь-яких питань пишіть ${c}.`] },
    ],
  }),
  ru: (c) => ({
    title: 'Условия использования — POLSKI GO',
    updated: 'Обновлено 7 ноября 2026',
    sections: [
      { h: 'О приложении', p: ['POLSKI GO — учебное приложение для изучения польского языка. Пользоваться им можно с 13 лет. Пользуясь приложением, вы соглашаетесь с этими условиями и с политикой конфиденциальности (/privacy).'] },
      { h: 'Имена и фото', p: ['Имя игрока и фото профиля видят другие игроки в рейтинге и в списке друзей. Не используйте оскорбительные, ненавистнические, непристойные имена и фото, не выдавайте себя за другого человека, не рекламируйте сторонние сервисы.'] },
      { h: 'Жалобы и модерация', p: ['На любого игрока можно пожаловаться кнопкой-флажком в рейтинге или списке друзей. Мы рассматриваем жалобы: можем заменить имя на нейтральное, ограничить или заблокировать аккаунт. За повторные нарушения аккаунт блокируется.'] },
      { h: 'Premium и платежи', p: ['Premium в Telegram оплачивается Telegram Stars; вопросы об оплате и возвратах — через /paysupport в боте. В версии для Android Premium пока не продаётся. Виртуальная валюта (злотки) и вещи не имеют денежной стоимости и не обмениваются на деньги.'] },
      { h: 'Изменения и связь', p: [`Мы можем менять эти условия; действующая версия всегда по этому адресу. По любым вопросам пишите ${c}.`] },
    ],
  }),
  en: (c) => ({
    title: 'Terms of Use — POLSKI GO',
    updated: 'Updated 7 November 2026',
    sections: [
      { h: 'About the app', p: ['POLSKI GO is an educational app for learning Polish. You must be at least 13 to use it. By using the app you agree to these terms and to the privacy policy (/privacy).'] },
      { h: 'Names and photos', p: ['Your player name and profile photo are visible to other players in the leaderboard and the friends list. Do not use offensive, hateful or obscene names or photos, do not impersonate anyone, and do not advertise other services.'] },
      { h: 'Reports and moderation', p: ['You can report any player with the flag button in the leaderboard or the friends list. We review reports: we may replace a name with a neutral one, restrict or block an account. Accounts that break these rules repeatedly are blocked.'] },
      { h: 'Premium and payments', p: ['Premium in Telegram is paid with Telegram Stars; for payment questions and refunds use /paysupport in the bot. Premium is not sold in the Android version yet. Virtual currency (złotki) and items have no cash value and cannot be exchanged for money.'] },
      { h: 'Changes and contact', p: [`We may change these terms; the current version is always at this address. For any questions contact us ${c}.`] },
    ],
  }),
};

function page(lang: Lang, path: string, doc: Doc, contactHtml: string): string {
  const nav = LANGS.map((l) => (l === lang ? `<b>${LANG_NAME[l]}</b>` : `<a href="${path}?lang=${l}">${LANG_NAME[l]}</a>`)).join(' · ');
  const body = doc.sections.map((s) => `<h2>${escapeHtml(s.h)}</h2>${s.p.map((p) => `<p>${escapeHtml(p).replace(CONTACT_MARK, contactHtml)}</p>`).join('')}`).join('');
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="index,follow">
<title>${escapeHtml(doc.title)}</title>
<style>:root{color-scheme:light dark}body{margin:0;font:16px/1.55 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#fff;color:#1b2430}
main{max-width:720px;margin:0 auto;padding:24px 16px 48px}h1{font-size:1.6rem;margin:0 0 4px}h2{font-size:1.1rem;margin:1.6em 0 .4em}p{margin:.5em 0}a{color:#0a58ca}.meta{color:#5b6572;font-size:.9rem}nav{margin:12px 0 8px;font-size:.95rem}
@media (prefers-color-scheme:dark){body{background:#0f1722;color:#e6ebf2}a{color:#7db4ff}.meta{color:#9aa7b8}}</style></head>
<body><main><h1>${escapeHtml(doc.title)}</h1><div class="meta">${escapeHtml(doc.updated)}</div><nav>${nav}</nav>${body}</main></body></html>`;
}

const pickLang = (c: { req: { query: (k: string) => string | undefined; header: (k: string) => string | undefined } }): Lang => {
  const q = c.req.query('lang');
  if (q && (LANGS as readonly string[]).includes(q)) return q as Lang;
  const accept = (c.req.header('accept-language') ?? '').toLowerCase();
  if (accept.startsWith('ru')) return 'ru';
  if (accept.startsWith('en')) return 'en';
  return 'uk';
};

export const siteRoutes = new Hono<AppEnv>();

const html = (body: string) => new Response(body, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=600', vary: 'accept-language' } });

siteRoutes.get('/privacy', (c) => {
  const lang = pickLang(c);
  return html(page(lang, '/privacy', PRIVACY[lang](CONTACT_MARK), contact(lang)));
});

siteRoutes.get('/terms', (c) => {
  const lang = pickLang(c);
  return html(page(lang, '/terms', TERMS[lang](CONTACT_MARK), contact(lang)));
});

siteRoutes.get('/delete-account', (c) => {
  const lang = pickLang(c);
  return html(page(lang, '/delete-account', DELETE[lang](CONTACT_MARK), contact(lang)));
});

/** Digital Asset Links. Без отпечатков (приложение ещё не подписано) отдаёт пустой список — это валидный ответ. */
siteRoutes.get('/.well-known/assetlinks.json', (c) => {
  const prints = config.androidFingerprints;
  const body = prints.length
    ? [{ relation: ['delegate_permission/common.handle_all_urls'], target: { namespace: 'android_app', package_name: config.androidPackage, sha256_cert_fingerprints: prints } }]
    : [];
  return c.json(body, 200, { 'cache-control': 'public, max-age=3600' });
});
