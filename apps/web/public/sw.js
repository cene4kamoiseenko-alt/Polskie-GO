/**
 * Service worker POLSKI GO (Android-приложение из Google Play и браузер; внутри Telegram не регистрируется).
 * Задача одна: не показывать пустой экран браузера без сети и не скачивать заново файлы сборки. Данные игрока не кешируются.
 *  · страницы — сначала сеть; нет сети — /offline.html;
 *  · файлы сборки /assets/* (в имени хеш содержимого) — из кеша, иначе из сети и в кеш;
 *  · /api, /telegram, /uploads, /admin и юридические страницы — не трогаем.
 */
const VERSION = 'pg-v1';
const SHELL = ['/offline.html', '/favicon.svg', '/icons/icon-192.png'];
const MAX_ENTRIES = 300;
const SKIP = /^\/(api|telegram|uploads|admin|privacy|terms|delete-account|\.well-known)(\/|$)/;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

/** Кеш не растёт без границ: старые файлы прошлых сборок вытесняются (порядок ключей — порядок добавления). */
async function trim(cache) {
  const keys = await cache.keys();
  for (const key of keys.slice(0, Math.max(0, keys.length - MAX_ENTRIES))) await cache.delete(key);
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || SKIP.test(url.pathname)) return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('/offline.html')));
    return;
  }

  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.open(VERSION).then(async (cache) => {
        const hit = await cache.match(request);
        if (hit) return hit;
        const response = await fetch(request);
        if (response.ok && response.type === 'basic' && !request.headers.has('range')) {
          await cache.put(request, response.clone());
          await trim(cache);
        }
        return response;
      }),
    );
  }
});
