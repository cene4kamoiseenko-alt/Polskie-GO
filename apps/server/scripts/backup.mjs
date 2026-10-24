// Резервна копія БД: pg_dump у ./backups/polskigo-<дата>.sql.gz, зберігаються останні 14 копій.
import { execSync } from 'node:child_process';
import { mkdirSync, readdirSync, unlinkSync } from 'node:fs';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is required');
const dir = process.env.BACKUP_DIR ?? 'backups';
mkdirSync(dir, { recursive: true });
const file = `${dir}/polskigo-${new Date().toISOString().replace(/[:.]/g, '-')}.sql.gz`;
execSync(`pg_dump --no-owner --format=plain "${url.replace(/\?.*$/, '')}" | gzip > "${file}"`, { stdio: 'inherit', shell: '/bin/bash' });
console.log('Backup:', file);
const old = readdirSync(dir).filter((f) => f.startsWith('polskigo-')).sort().reverse().slice(14);
for (const f of old) unlinkSync(`${dir}/${f}`);
