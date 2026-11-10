// Збирає статичні файли для Cloudflare Workers: Mini App у корені, адмінка — у /admin.
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

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

// CSP в режиме Report-Only (2026-11-04, эксплуатация): ничего не блокирует, только присылает нарушения в /api/csp-report → журнал ошибок
// (админка «Ошибки за 24 часа», вид CSP). Встроенные <script> из index.html разрешены по хешу — он считается здесь, на собранном файле,
// поэтому правка скрипта заставки не даёт ложных отчётов. Когда отчётов нет на реальных iPhone и Android, заголовок можно сделать
// блокирующим (Content-Security-Policy). Аватары Telegram — https://t.me; скрипт Mini App — https://telegram.org.
const html = readFileSync(new URL('index.html', out), 'utf8');
const hashes = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => `'sha256-${createHash('sha256').update(m[1]).digest('base64')}'`);
const csp = [
  "default-src 'self'",
  `script-src 'self' https://telegram.org ${hashes.join(' ')}`.trim(),
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://t.me https://*.telegram.org",
  "font-src 'self' data:",
  // data: — тихий WAV, которым lib/audio.ts «разблокирует» звук первым касанием (iOS, Telegram); без него отчёт `media-src data`, а в блокирующем режиме — нет озвучки.
  "media-src 'self' blob: data:",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  'report-uri /api/csp-report',
].join('; ');
const headersFile = new URL('_headers', out);
const headers = readFileSync(headersFile, 'utf8');
if (!headers.includes('/*\n')) throw new Error('_headers: нет блока /*');
writeFileSync(headersFile, headers.replace('/*\n', `/*\n  Content-Security-Policy-Report-Only: ${csp}\n`));
console.log(`CSP Report-Only: встроенных скриптов по хешу — ${hashes.length}`);

console.log('dist-cf готово', commit.slice(0, 7));
