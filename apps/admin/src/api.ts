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

/** Коды ошибок сервера → понятный текст. Неизвестный код показывается как есть. */
const ERRORS: Record<string, string> = {
  invalid_credentials: 'Неверный email или пароль',
  unauthorized: 'Нужно войти заново',
  forbidden: 'Недостаточно прав для этого действия',
  not_found: 'Не найдено',
  validation_error: 'Проверьте заполнение полей',
  duplicate: 'Такая запись уже есть',
  internal_error: 'Ошибка сервера, попробуйте ещё раз',
  rate_limited: 'Слишком много запросов, подождите минуту',
  quota_exceeded: 'Дневной лимит исчерпан',
  tts_not_configured: 'Озвучка не настроена: нет ключа провайдера',
  provider_not_configured: 'У этого провайдера нет ключа',
  bot_not_configured: 'Бот не настроен: нет TELEGRAM_BOT_TOKEN',
  days_required: 'Укажите число дней',
  file_too_large: 'Файл слишком большой',
  unsupported_type: 'Такой тип файла не поддерживается',
  already_sent: 'Уже отправлено',
};
const message = (body: any, status: string) => {
  if (body?.issues) return body.issues.map((i: any) => `${i.path?.join('.')}: ${i.message}`).join('; ');
  const code = body?.error as string | undefined;
  return (code && ERRORS[code]) ?? (body?.message && body.message !== code ? body.message : code) ?? status;
};

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
  if (!res.ok) throw new Error(message(body, res.statusText));
  return body as T;
}

export async function upload(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/admin/upload', { method: 'POST', headers: { authorization: `Bearer ${getToken()}` }, body: fd });
  const body = await res.json();
  if (!res.ok) throw new Error(message(body, res.statusText));
  return body.url;
}

/** POST, ответ — файл (образец озвучки). Ошибка — как в api(): сообщение сервера. */
export async function apiBlob(path: string, body: unknown): Promise<Blob> {
  const res = await fetch(`/api/admin${path}`, {
    method: 'POST',
    headers: { ...(getToken() ? { authorization: `Bearer ${getToken()}` } : {}), 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(message(await res.json().catch(() => null), res.statusText));
  }
  return res.blob();
}
