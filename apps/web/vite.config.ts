import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/** Адреса API для раннього запиту профілю в index.html (там немає import.meta.env). */
function apiBaseInHtml(base: string): Plugin {
  return { name: 'pg-api-base', transformIndexHtml: (html) => html.replace('__PG_API_BASE__', JSON.stringify(base.replace(/\/$/, ''))) };
}

/**
 * В dev подменяет src/lib/assetFiles.ts на assetFiles.dev.ts: адреса картинок без eager-glob, иначе каждая картинка — отдельный
 * модуль и Chromium после пары перезагрузок отвечает ERR_INSUFFICIENT_RESOURCES. Сборка не меняется.
 */
function devAssetUrls(): Plugin {
  return {
    name: 'pg-dev-asset-urls',
    apply: 'serve',
    enforce: 'pre',
    resolveId(source, importer) {
      const from = importer?.replace(/\\/g, '/') ?? '';
      // Общая карта картинок (lib/assets.ts) и библиотека Бобека (lib/libraryArt.ts) — в dev только список путей.
      if (source === './assetFiles' && from.endsWith('/src/lib/assets.ts')) return this.resolve('./assetFiles.dev', importer, { skipSelf: true });
      if (source === './libraryFiles' && from.endsWith('/src/lib/libraryArt.ts')) return this.resolve('./libraryFiles.dev', importer, { skipSelf: true });
      return null;
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [devAssetUrls(), react(), tailwindcss(), apiBaseInHtml(loadEnv(mode, process.cwd(), 'VITE_').VITE_API_URL ?? '')],
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
