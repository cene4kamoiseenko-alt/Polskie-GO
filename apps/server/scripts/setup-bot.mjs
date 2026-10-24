// Налаштування бота: webhook (з секретом), кнопка меню Mini App, команди.
// Запуск: npm run bot:setup -w @polski-go/server  (потрібні TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET, PUBLIC_URL, WEB_APP_URL)
const { TELEGRAM_BOT_TOKEN: token, TELEGRAM_WEBHOOK_SECRET: secret, PUBLIC_URL: publicUrl, WEB_APP_URL: webApp } = process.env;
if (!token || !secret || !publicUrl || !webApp) throw new Error('Set TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET, PUBLIC_URL and WEB_APP_URL');

async function call(method, params) {
  const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(params) });
  const b = await r.json();
  console.log(method, b.ok ? 'ok' : b.description);
  if (!b.ok) process.exitCode = 1;
}

await call('setWebhook', {
  url: `${publicUrl.replace(/\/$/, '')}/telegram/webhook`,
  secret_token: secret,
  allowed_updates: ['message', 'pre_checkout_query'],
  drop_pending_updates: false,
});
await call('setChatMenuButton', { menu_button: { type: 'web_app', text: 'POLSKI GO', web_app: { url: webApp } } });
await call('setMyCommands', { commands: [{ command: 'start', description: 'Відкрити POLSKI GO' }, { command: 'stop', description: 'Вимкнути нагадування' }] });
await call('setMyDescription', { description: 'POLSKI GO — вивчай польську, подорожуючи Польщею разом з бобром Бобеком! 🦫🇵🇱' });
