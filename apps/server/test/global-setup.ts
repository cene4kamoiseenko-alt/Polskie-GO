import { execSync } from 'node:child_process';

/**
 * Кожен запуск тестів отримує власну порожню схему PostgreSQL (test_<час>),
 * застосовує до неї міграції та seed, а після тестів видаляє лише цю схему.
 */
export default async function setup() {
  const base = process.env.TEST_DATABASE_URL ?? 'postgresql://polski:polski@localhost:5432/polskigo_test';
  const schema = `test_${Date.now().toString(36)}`;
  const url = `${base}${base.includes('?') ? '&' : '?'}schema=${schema}`;
  execSync('npx prisma migrate deploy', { env: { ...process.env, DATABASE_URL: url }, stdio: 'ignore' });
  process.env.TEST_DATABASE_URL_RUN = url;

  const { PrismaClient } = await import('@prisma/client');
  const { seedContent, seedAdmin } = await import('../src/content/seed');
  const prisma = new PrismaClient({ datasourceUrl: url });
  await seedContent(prisma);
  await seedAdmin(prisma, 'admin@test.dev', 'admin-password-123');
  await prisma.$disconnect();

  return async () => {
    const admin = new PrismaClient({ datasourceUrl: base });
    await admin.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
    await admin.$disconnect();
  };
}
