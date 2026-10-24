import { tg, startParam } from './telegram';

let token: string | null = null;
let authPromise: Promise<void> | null = null;

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message?: string,
  ) {
    super(message ?? code);
  }
}

async function authenticate() {
  const res = tg
    ? await fetch('/api/auth/telegram', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ initData: tg.initData }) })
    : // Поза Telegram — режим розробки (на сервері вмикається DEV_AUTH=true).
      await fetch('/api/auth/dev', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: Number(new URLSearchParams(location.search).get('devUser') ?? 100001), firstName: 'Podróżnik', startParam: startParam() }),
      });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, body.error ?? 'auth_failed', body.message);
  token = body.token;
}

export function ensureAuth() {
  authPromise ??= authenticate().catch((e) => {
    authPromise = null;
    throw e;
  });
  return authPromise;
}

export async function api<T = unknown>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  await ensureAuth();
  const doFetch = () =>
    fetch(`/api${path}`, {
      method: opts.method ?? (opts.body !== undefined ? 'POST' : 'GET'),
      headers: { authorization: `Bearer ${token}`, ...(opts.body !== undefined ? { 'content-type': 'application/json' } : {}) },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
  let res = await doFetch();
  if (res.status === 401) {
    // Токен прострочено — повторна авторизація через initData.
    authPromise = null;
    await ensureAuth();
    res = await doFetch();
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, body?.error ?? 'error', body?.message);
  return body as T;
}

export async function downloadExport() {
  await ensureAuth();
  const res = await fetch('/api/me/export', { headers: { authorization: `Bearer ${token}` } });
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'polski-go-data.json';
  a.click();
}
