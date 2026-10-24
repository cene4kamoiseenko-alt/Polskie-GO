/**
 * Генерує SQL з навчальним контентом для D1.
 *   npx tsx scripts/build-seed.ts            → seed.sql (лише відсутні записи)
 *   npx tsx scripts/build-seed.ts --force    → seed.sql (оновити контент з репозиторію)
 */
import { writeFileSync } from 'node:fs';
import { buildSeedSql } from '../src/content/seed';

const force = process.argv.includes('--force');
const sql = buildSeedSql({ force });
writeFileSync(new URL('../seed.sql', import.meta.url), sql.join('\n') + '\n');
console.log(`seed.sql: ${sql.length} statements${force ? ' (force)' : ''}`);
