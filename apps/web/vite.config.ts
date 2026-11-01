import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/** Адреса API для раннього запиту профілю в index.html (там немає import.meta.env). */
function apiBaseInHtml(base: string): Plugin {
  return { name: 'pg-api-base', transformIndexHtml: (html) => html.replace('__PG_API_BASE__', JSON.stringify(base.replace(/\/$/, ''))) };
}

/**
 * Dev-темы заставки (`?splash=sunset|adventure`, src/dev/splashThemes.ts) в сборку не входят: без этой подмены Rollup всё равно загружает модуль
 * за `import.meta.env.DEV`, и картинки тем (~0,8 МБ) попадают в dist, хотя ни одна страница на них не ссылается.
 */
function devSplashThemesOutOfBuild(): Plugin {
  const empty = '\0pg-dev-splash-themes-empty';
  return {
    name: 'pg-dev-splash-themes-out-of-build',
    apply: 'build',
    enforce: 'pre', // раньше встроенного разрешения путей: иначе реальный модуль найдётся первым
    resolveId: (id) => (/(^|\/)dev\/splashThemes$/.test(id) ? empty : undefined),
    load: (id) => (id === empty ? 'export const devSplashArt = () => { throw new Error("dev-темы заставки доступны только в разработке"); };' : undefined),
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), devSplashThemesOutOfBuild(), apiBaseInHtml(loadEnv(mode, process.cwd(), 'VITE_').VITE_API_URL ?? '')],
  server: {
    port: 5173,
    host: true,
    proxy: { '/api': 'http://localhost:8787', '/uploads': 'http://localhost:8787' },
  },
  build: {
    target: 'es2020',
    // Стандартний поріг попередження (500 kB) не приховуємо. Бібліотеки, що рідко змінюються, — окремими
    // чанками: кешуються між деплоями. framer-motion не чіпаємо: його можливості вже вантажаться ліниво (lib/motion).
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (/[\\/](react|react-dom|scheduler|react-router|react-router-dom|@remix-run)[\\/]/.test(id)) return 'react';
          if (id.includes('@tanstack')) return 'query';
          return undefined;
        },
      },
    },
  },
}));
