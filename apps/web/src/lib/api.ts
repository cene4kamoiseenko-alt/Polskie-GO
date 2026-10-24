import { tg, startParam } from './telegram';

/** Адрес API. Пусто — тот же домен (один сервер). Для Cloudflare Pages задайте VITE_API_URL=https://api.ваш-домен */
export const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

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
    ? await fetch(`${API_BASE}/api/auth/telegram`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ initData: tg.initData }) })
    : // Поза Telegram — режим розробки (на сервері вмикається DEV_AUTH=true).
      await fetch(`${API_BASE}/api/auth/dev`, {
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
    fetch(`${API_BASE}/api${path}`, {
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

/** Бінарна відповідь API (аудіо) з авторизацією. */
export async function apiBlob(path: string): Promise<Blob> {
  await ensureAuth();
  let res = await fetch(`${API_BASE}/api${path}`, { headers: { authorization: `Bearer ${token}` } });
  if (res.status === 401) {
    authPromise = null;
    await ensureAuth();
    res = await fetch(`${API_BASE}/api${path}`, { headers: { authorization: `Bearer ${token}` } });
  }
  if (!res.ok) throw new ApiError(res.status, 'blob_failed');
  return res.blob();
}

export async function downloadExport() {
  await ensureAuth();
  const res = await fetch(`${API_BASE}/api/me/export`, { headers: { authorization: `Bearer ${token}` } });
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'polski-go-data.json';
  a.click();
}

/** Полный адрес файла, загруженного в админке (/uploads/...), — он хранится на API-сервере. */
export const assetUrl = (u: string) => (u.startsWith('/uploads/') ? `${API_BASE}${u}` : u);
