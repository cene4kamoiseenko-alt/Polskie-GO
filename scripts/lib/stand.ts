/**
 * Одноразовий локальний стенд для браузерних перевірок: D1 у Miniflare (міграції + seed), API в цьому ж процесі,
 * інтерфейс — Vite dev (e2e) або продакшн-збірка apps/web/dist (perf). Порти вільні: не заважає `npm run dev`.
 * Статика роздається як у Cloudflare Workers Static Assets: ETag + must-revalidate, правила з dist/_headers,
 * невідомий шлях — index.html (single-page-application).
 */
import { createServer as httpServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { createServer as netServer, type AddressInfo } from 'node:net';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';

const root = process.cwd();

export function freePort(): Promise<number> {
  return new Promise((ok, fail) => {
    const srv = netServer();
    srv.once('error', fail);
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address() as AddressInfo;
      srv.close(() => ok(port));
    });
  });
}

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2', '.json': 'application/json', '.mp3': 'audio/mpeg',
};

/** Найпростіший розбір _headers: «/шлях/*» і рядки «  Заголовок: значення». */
function headerRules(dist: string): { prefix: string; headers: Record<string, string> }[] {
  const file = join(dist, '_headers');
  if (!existsSync(file)) return [];
  const rules: { prefix: string; headers: Record<string, string> }[] = [];
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (!/^\s/.test(line)) rules.push({ prefix: line.trim().replace(/\*$/, ''), headers: {} });
    else if (rules.length) {
      const [k, ...v] = line.trim().split(':');
      rules[rules.length - 1].headers[k.trim().toLowerCase()] = v.join(':').trim();
    }
  }
  return rules;
}

export type Stand = Awaited<ReturnType<typeof startStand>>;

export async function startStand(opts: { ui: 'dev' | 'dist'; dist?: string }) {
  const { getEnv, login, sessionItems, correctAnswers, disposeEnv } = await import(root + '/apps/server/test/helpers.ts');
  const { app, env } = await getEnv();
  const apiRequest = async (req: IncomingMessage, res: ServerResponse) => {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    const body = ['GET', 'HEAD'].includes(req.method!) ? {} : { body: Buffer.concat(chunks) };
    const r = await app.request('http://localhost' + req.url, { method: req.method, headers: req.headers as never, ...body }, env);
    res.writeHead(r.status, Object.fromEntries(r.headers));
    res.end(Buffer.from(await r.arrayBuffer()));
  };

  let base: string;
  let close: () => Promise<void>;
  if (opts.ui === 'dev') {
    const bridge = httpServer((req, res) => apiRequest(req, res).catch(() => { res.writeHead(500); res.end('QA bridge error'); }));
    await new Promise<void>((ok) => bridge.listen(0, '127.0.0.1', ok));
    const api = `http://127.0.0.1:${(bridge.address() as AddressInfo).port}`;
    const { createServer } = await import(root + '/node_modules/vite/dist/node/index.js');
    const vite = await createServer({
      root: root + '/apps/web',
      configFile: root + '/apps/web/vite.config.ts',
      server: { host: '127.0.0.1', port: await freePort(), strictPort: true, proxy: { '/api': api, '/uploads': api } },
      logLevel: 'error',
    });
    await vite.listen();
    base = (vite.resolvedUrls?.local[0] ?? '').replace(/\/$/, '');
    close = async () => { await vite.close(); bridge.close(); };
  } else {
    const dist = resolve(root, opts.dist ?? 'apps/web/dist');
    if (!existsSync(join(dist, 'index.html'))) throw new Error('apps/web/dist порожній: спершу зберіть інтерфейс');
    const rules = headerRules(dist);
    const server = httpServer((req, res) => {
      const path = decodeURIComponent((req.url ?? '/').split('?')[0]);
      if (path.startsWith('/api/') || path.startsWith('/uploads/')) {
        apiRequest(req, res).catch(() => { res.writeHead(500); res.end('QA bridge error'); });
        return;
      }
      let file = normalize(join(dist, path));
      if (!file.startsWith(dist) || !existsSync(file) || statSync(file).isDirectory()) file = join(dist, 'index.html');
      const data = readFileSync(file);
      const etag = `"${createHash('sha1').update(data).digest('hex').slice(0, 16)}"`;
      const headers: Record<string, string> = { 'content-type': MIME[extname(file)] ?? 'application/octet-stream', etag, 'cache-control': 'public, max-age=0, must-revalidate' };
      for (const r of rules) if (path.startsWith(r.prefix)) Object.assign(headers, r.headers);
      if (req.headers['if-none-match'] === etag) { res.writeHead(304, headers); res.end(); return; }
      res.writeHead(200, headers);
      res.end(data);
    });
    await new Promise<void>((ok) => server.listen(0, '127.0.0.1', ok));
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    close = async () => { server.close(); };
  }

  return {
    base, env, login, sessionItems, correctAnswers,
    async stop() {
      await close();
      await disposeEnv();
    },
  };
}

/** Chromium пакета playwright, а якщо його не завантажено — системний (PLAYWRIGHT_CHROMIUM_EXECUTABLE або /opt/pw-browsers). */
export function chromiumPath(chromium: { executablePath(): string }): string | undefined {
  if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE) return process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
  if (existsSync(chromium.executablePath())) return undefined;
  return ['/opt/pw-browsers/chromium'].find((x) => existsSync(x));
}
