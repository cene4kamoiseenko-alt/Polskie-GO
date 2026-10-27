const KEY = 'pg_admin_token';

function getToken() {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}
export function setToken(t: string | null) {
  try {
    if (t) sessionStorage.setItem(KEY, t);
    else sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
export const hasToken = () => !!getToken();

export async function api<T = any>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(`/api/admin${path}`, {
    method: opts.method ?? (opts.body !== undefined ? 'POST' : 'GET'),
    headers: { ...(getToken() ? { authorization: `Bearer ${getToken()}` } : {}), ...(opts.body !== undefined ? { 'content-type': 'application/json' } : {}) },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  const body = await res.json().catch(() => null);
  if (res.status === 401 && path !== '/login') {
    setToken(null);
    location.reload();
  }
  if (!res.ok) throw new Error(body?.issues ? body.issues.map((i: any) => `${i.path?.join('.')}: ${i.message}`).join('; ') : body?.message ?? body?.error ?? res.statusText);
  return body as T;
}

export async function upload(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/admin/upload', { method: 'POST', headers: { authorization: `Bearer ${getToken()}` }, body: fd });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message ?? body.error);
  return body.url;
}

/** POST, відповідь — файл (зразок озвучки). Помилка — як в api(): повідомлення сервера. */
export async function apiBlob(path: string, body: unknown): Promise<Blob> {
  const res = await fetch(`/api/admin${path}`, {
    method: 'POST',
    headers: { ...(getToken() ? { authorization: `Bearer ${getToken()}` } : {}), 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const j = await res.json().catch(() => null);
    throw new Error(j?.message ?? j?.error ?? res.statusText);
  }
  return res.blob();
}
