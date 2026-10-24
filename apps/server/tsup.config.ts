import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node20',
  outDir: 'dist',
  clean: true,
  splitting: false,
  external: ['@prisma/client'],
  // Спільний пакет постачається як TypeScript — вбудовуємо його в бандл.
  noExternal: ['@polski-go/shared'],
});
