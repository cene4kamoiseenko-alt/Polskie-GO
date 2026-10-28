import { readFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/** Каталог аудіобібліотеки (assets/audio/AUDIO_MANIFEST.json) для сторінки «Аудиобиблиотека»: у збірці — файл, у dev — той самий шлях. */
const manifest = new URL('../../assets/audio/AUDIO_MANIFEST.json', import.meta.url);
const audioManifest = (): Plugin => ({
  name: 'audio-manifest',
  configureServer(server) {
    server.middlewares.use('/admin/audio-manifest.json', (_req, res) => {
      res.setHeader('content-type', 'application/json');
      res.end(readFileSync(manifest));
    });
  },
  generateBundle() {
    this.emitFile({ type: 'asset', fileName: 'audio-manifest.json', source: readFileSync(manifest, 'utf8') });
  },
});

export default defineConfig({
  base: '/admin/',
  plugins: [react(), tailwindcss(), audioManifest()],
  server: { port: 5174, proxy: { '/api': 'http://localhost:8787', '/uploads': 'http://localhost:8787' } },
});
