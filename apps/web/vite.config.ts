import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
});
