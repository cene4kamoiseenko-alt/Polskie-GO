// Збирає статичні файли для Cloudflare Workers: Mini App у корені, адмінка — у /admin.
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';

const out = new URL('../dist-cf/', import.meta.url);
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(new URL('../apps/web/dist/', import.meta.url), out, { recursive: true });
const admin = new URL('../apps/admin/dist/', import.meta.url);
if (existsSync(admin)) cpSync(admin, new URL('admin/', out), { recursive: true });
console.log('dist-cf готово');
