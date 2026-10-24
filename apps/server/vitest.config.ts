import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Кожен файл тестів отримує власну локальну D1 (Miniflare).
    pool: 'forks',
    testTimeout: 60_000,
    hookTimeout: 120_000,
  },
});
