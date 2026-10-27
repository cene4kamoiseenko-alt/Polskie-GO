// Настройка бота в Telegram. Запуск: npm run bot:setup -w @polski-go/server [-- флаги]
//
// По умолчанию скрипт меняет ТОЛЬКО:
//   • команды бота (setMyCommands): девять команд, по умолчанию русские описания + локализации uk / pl / en;
//   • кнопку меню, которая открывает Mini App (setChatMenuButton).
// Ничего больше он не трогает: описание (Description), About, Description Picture, токен и webhook остаются как настроены в BotFather.
// Описание бота и картинка описания в Bot API: картинку через API не изменить, текст описания — только с флагом --description.
//
// Флаги:
//   --webhook      установить webhook (первый запуск или смена адреса): нужны PUBLIC_URL и TELEGRAM_WEBHOOK_SECRET.
//                  Обновления: message (команды, платежи Stars, возвраты) и pre_checkout_query; ожидающие обновления не сбрасываются.
//   --description  перезаписать описание бота текстом по умолчанию (иначе описание, настроенное вручную, не меняется).
//   --dry-run      показать вызовы без обращения к Telegram (токен не нужен).
//
// Переменные: TELEGRAM_BOT_TOKEN, WEB_APP_URL (адрес Mini App для кнопки меню); для --webhook ещё PUBLIC_URL и TELEGRAM_WEBHOOK_SECRET.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const catalog = JSON.parse(readFileSync(new URL('../src/bot/commands.json', import.meta.url), 'utf8'));
/** Локализации списка команд помимо языка по умолчанию (русский). */
export const LOCALIZED = ['uk', 'pl', 'en'];
export const DESCRIPTION = 'POLSKI GO — вивчай польську, подорожуючи Польщею разом з бобром Бобеком! 🦫🇵🇱';

/** Список вызовов Bot API для заданных переменных окружения и флагов (без обращения к сети). */
export function buildCalls(env, flags = {}) {
  const calls = [];
  const list = (lang) => catalog.commands.map((c) => ({ command: c.command, description: c.description[lang] }));
  calls.push({ method: 'setMyCommands', params: { commands: list('ru') } });
  for (const lang of LOCALIZED) calls.push({ method: 'setMyCommands', params: { commands: list(lang), language_code: lang } });
  if (env.WEB_APP_URL) calls.push({ method: 'setChatMenuButton', params: { menu_button: { type: 'web_app', text: 'POLSKI GO', web_app: { url: env.WEB_APP_URL } } } });
  if (flags.webhook) {
    calls.push({
      method: 'setWebhook',
      params: {
        url: `${env.PUBLIC_URL.replace(/\/$/, '')}/telegram/webhook`,
        secret_token: env.TELEGRAM_WEBHOOK_SECRET,
        allowed_updates: ['message', 'pre_checkout_query'],
        drop_pending_updates: false,
      },
    });
  }
  if (flags.description) calls.push({ method: 'setMyDescription', params: { description: DESCRIPTION } });
  return calls;
}

/** Секреты в вывод не попадают. */
const redact = (params) => JSON.parse(JSON.stringify(params, (k, v) => (k === 'secret_token' ? '***' : v)));

async function main() {
  const flags = { webhook: process.argv.includes('--webhook'), description: process.argv.includes('--description'), dryRun: process.argv.includes('--dry-run') };
  const env = process.env;
  const token = env.TELEGRAM_BOT_TOKEN;
  if (!flags.dryRun && !token) throw new Error('Set TELEGRAM_BOT_TOKEN');
  if (!env.WEB_APP_URL) throw new Error('Set WEB_APP_URL (Mini App address for the menu button)');
  if (flags.webhook && (!env.PUBLIC_URL || !env.TELEGRAM_WEBHOOK_SECRET)) throw new Error('--webhook needs PUBLIC_URL and TELEGRAM_WEBHOOK_SECRET');

  const api = async (method, params = {}) => {
    const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(params) });
    return r.json();
  };
  for (const { method, params } of buildCalls(env, flags)) {
    if (flags.dryRun) {
      console.log('[dry-run]', method, JSON.stringify(redact(params)));
      continue;
    }
    const b = await api(method, params);
    console.log(method, params.language_code ?? '', b.ok ? 'ok' : b.description);
    if (!b.ok) process.exitCode = 1;
  }
  if (flags.dryRun) return;
  // Только чтение: что сейчас стоит на стороне Telegram.
  const info = await api('getWebhookInfo');
  if (info.ok) {
    const w = info.result;
    console.log(`webhook: ${w.url ? new URL(w.url).origin + new URL(w.url).pathname : '(не задан)'}, ожидают: ${w.pending_update_count}${w.last_error_message ? `, последняя ошибка: ${w.last_error_message}` : ''}`);
    if (!w.url) console.log('webhook не задан: запустите с флагом --webhook');
  }
  const cmds = await api('getMyCommands');
  if (cmds.ok) console.log(`команды (язык по умолчанию): ${cmds.result.map((c) => '/' + c.command).join(' ')}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
}
