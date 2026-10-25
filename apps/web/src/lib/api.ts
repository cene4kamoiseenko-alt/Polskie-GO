import { tg, startParam } from './telegram';
import { bootMark } from './boot';

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

/**
 * fetch з тайм-аутом: при поганому зв'язку запит не «висить» вічно, а завершується
 * зрозумілою помилкою network_timeout / network_error (екран показує «Спробувати ще»).
 */
async function timedFetch(url: string, init: RequestInit = {}, ms = 15_000): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  const abort = () => ctrl.abort();
  init.signal?.addEventListener('abort', abort, { once: true });
  if (init.signal?.aborted) ctrl.abort();
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw new ApiError(0, 'network_timeout');
    throw new ApiError(0, 'network_error');
  } finally {
    clearTimeout(timer);
    init.signal?.removeEventListener('abort', abort);
  }
}

/** Токен зберігається між запусками (7 днів) і прив'язаний до користувача Telegram — повторний вхід без зайвого запиту. */
const AUTH_KEY = 'pg_auth';
const authOwner = () => String(tg?.initDataUnsafe.user?.id ?? `dev:${new URLSearchParams(location.search).get('devUser') ?? 100001}`);
function savedToken(): string | null {
  try {
    const s = JSON.parse(localStorage.getItem(AUTH_KEY) ?? 'null') as { token: string; owner: string; exp: number } | null;
    if (s && s.owner === authOwner() && s.exp > Date.now() + 3600_000) return s.token;
  } catch {
    /* сховище недоступне */
  }
  return null;
}
function saveToken(t: string) {
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ token: t, owner: authOwner(), exp: Date.now() + 6.5 * 86_400_000 }));
  } catch {
    /* сховище недоступне */
  }
}
token = typeof window !== 'undefined' ? savedToken() : null;
if (token) {
  authPromise = Promise.resolve();
  bootMark('auth');
}

/**
 * Профіль, запитаний із index.html ще до завантаження JS (той самий збережений токен).
 * Віддається один раз; будь-яка невдача (мережа, 401) — null, і застосунок іде звичайним шляхом.
 */
export function takeEarlyMe<T>(): Promise<T | null> | null {
  const w = window as Window & { __pgEarlyMe?: { token: string; data: Promise<T | null> } };
  const early = w.__pgEarlyMe;
  delete w.__pgEarlyMe;
  return early && early.token === token ? early.data : null;
}

async function authenticate() {
  const res = tg
    ? await timedFetch(`${API_BASE}/api/auth/telegram`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ initData: tg.initData }) })
    : // Поза Telegram — режим розробки (на сервері вмикається DEV_AUTH=true).
      await timedFetch(`${API_BASE}/api/auth/dev`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: Number(new URLSearchParams(location.search).get('devUser') ?? 100001), firstName: new URLSearchParams(location.search).get('devName') ?? 'Podróżnik', startParam: startParam() }),
      });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, body.error ?? 'auth_failed', body.message);
  token = body.token;
  saveToken(body.token);
  bootMark('auth');
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
    timedFetch(`${API_BASE}/api${path}`, {
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
  let res = await timedFetch(`${API_BASE}/api${path}`, { headers: { authorization: `Bearer ${token}` } }, 30_000);
  if (res.status === 401) {
    authPromise = null;
    await ensureAuth();
    res = await timedFetch(`${API_BASE}/api${path}`, { headers: { authorization: `Bearer ${token}` } }, 30_000);
  }
  if (!res.ok) throw new ApiError(res.status, 'blob_failed');
  return res.blob();
}

export async function downloadExport() {
  await ensureAuth();
  const res = await timedFetch(`${API_BASE}/api/me/export`, { headers: { authorization: `Bearer ${token}` } }, 45_000);
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'polski-go-data.json';
  a.click();
}

/** Полный адрес файла, загруженного в админке (/uploads/...), — он хранится на API-сервере. */
export const assetUrl = (u: string) => (u.startsWith('/uploads/') ? `${API_BASE}${u}` : u);

/** Розпізнаний сервером текст; attempt — підписана спроба для зарахування в уроці (лише з прив'язкою). */
export type Transcription = { transcript: string; attempt?: string };

/**
 * Authenticated short microphone clip. No automatic retry or duplicate paid request.
 * bind прив'язує запис до завдання на вимову в сесії: тоді сервер повертає підписану спробу.
 */
export async function transcribeAudio(bytes: Uint8Array, signal: AbortSignal, bind?: { session: string; item: string }): Promise<Transcription> {
  await ensureAuth();
  const qs = bind ? `?${new URLSearchParams(bind)}` : '';
  const res = await timedFetch(`${API_BASE}/api/speech/transcribe${qs}`, {
    method: 'POST', signal,
    headers: { authorization: `Bearer ${token}`, 'content-type': 'audio/wav' },
    body: new Blob([new Uint8Array(bytes)]),
  }, 18_000);
  const result = await res.json().catch(() => ({})) as { transcript?: string; attempt?: string; error?: string };
  if (!res.ok) throw new ApiError(res.status, result.error ?? 'stt_unavailable');
  if (!result.transcript?.trim()) throw new Error('no-speech');
  return { transcript: result.transcript, attempt: result.attempt };
}
