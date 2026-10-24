import { PrismaClient } from '@prisma/client';
import { seedAdmin, seedContent } from '../src/content/seed';

const prisma = new PrismaClient();
const force = process.argv.includes('--force');

seedContent(prisma, { force, log: (m) => console.log('•', m) })
  .then(() => seedAdmin(prisma, process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD))
  .then(() => console.log(force ? 'Контент оновлено (--force).' : 'Seed завершено.'))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
