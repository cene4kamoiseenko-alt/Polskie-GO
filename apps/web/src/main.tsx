import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from './App';
import { initTelegram, tg } from './lib/telegram';
import { guessLang, preloadLang } from './i18n';
import './index.css';

initTelegram();
// Словник мови користувача вантажиться одразу, паралельно з авторизацією.
void preloadLang(guessLang(tg?.initDataUnsafe.user?.language_code));

const queryClient = new QueryClient({
  // Дані кешуються на хвилину; після навчальних подій потрібні ключі інвалідовуються явно.
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 60_000 } },
});

// Службові сторінки: галерея станів маскота — лише в розробці; прототип єдиного Бобека (/__look-prototype) — і в збірці,
// щоб його можна було відкрити на staging. Окремий lazy-чанк: ні код, ні шари прототипу не потрапляють у застосунок.
const Gallery =
  location.pathname === '/__look-prototype'
    ? React.lazy(() => import('./dev/LookPrototype'))
    : import.meta.env.DEV && location.pathname === '/__gallery'
      ? React.lazy(() => import('./dev/Gallery'))
      : null;

ReactDOM.createRoot(document.getElementById('root')!).render(
  Gallery ? (
    <React.Suspense fallback={null}>
      <Gallery />
    </React.Suspense>
  ) : (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
  ),
);
