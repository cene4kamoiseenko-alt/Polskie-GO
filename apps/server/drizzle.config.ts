import { defineConfig } from 'drizzle-kit';

// Міграції D1 генеруються з src/db/schema.ts: `npm run db:generate -w @polski-go/server`.
export default defineConfig({
  dialect: 'sqlite',
  schema: './src/db/schema.ts',
  out: './migrations',
});
