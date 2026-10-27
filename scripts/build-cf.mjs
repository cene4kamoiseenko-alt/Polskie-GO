// Збирає статичні файли для Cloudflare Workers: Mini App у корені, адмінка — у /admin.
import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';

const out = new URL('../dist-cf/', import.meta.url);
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(new URL('../apps/web/dist/', import.meta.url), out, { recursive: true });
// _redirects потрібен лише для Cloudflare Pages; у Worker SPA-маршрути обробляє not_found_handling.
rmSync(new URL('_redirects', out), { force: true });
const admin = new URL('../apps/admin/dist/', import.meta.url);
if (existsSync(admin)) cpSync(admin, new URL('admin/', out), { recursive: true });
// Отметка сборки: /version.json и /api/health показывают, какой коммит сейчас работает (проверка выкладки с телефона).
const commit = process.env.WORKERS_CI_COMMIT_SHA || (() => {
  try {
    return execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return 'unknown';
  }
})();
const branch = process.env.WORKERS_CI_BRANCH || '';
writeFileSync(new URL('version.json', out), JSON.stringify({ commit, branch, builtAt: new Date().toISOString() }) + '\n');
console.log('dist-cf готово', commit.slice(0, 7));
