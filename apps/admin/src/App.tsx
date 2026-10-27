import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, NavLink, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api, hasToken, setToken, upload } from './api';
import { EXERCISE_TEMPLATES, RESOURCES, type Field, type ResourceDef } from './resources';

type Admin = { id: string; email: string; name: string; role: 'SUPERADMIN' | 'EDITOR' | 'SUPPORT' };

const get = (o: any, path: string) => path.split('.').reduce((a, k) => a?.[k], o);
const show = (v: unknown, i18n?: boolean): string => {
  if (v == null) return '—';
  if (i18n && typeof v === 'object') return (v as any).uk ?? '';
  if (typeof v === 'boolean') return v ? '✓' : '—';
  if (Array.isArray(v)) return v.join(', ');
  if (typeof v === 'object') return JSON.stringify(v).slice(0, 80);
  return String(v);
};

function useLoad<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(() => {
    setLoading(true);
    fn()
      .then((d) => {
        setData(d);
        setError(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(reload, [reload]);
  return { data, error, loading, reload };
}

function Login({ onLogin }: { onLogin: (a: Admin) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-emerald-50 to-rose-50">
      <form
        className="panel w-full max-w-sm space-y-4 p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            const r = await api<{ token: string; admin: Admin }>('/login', { body: { email, password } });
            setToken(r.token);
            onLogin(r.admin);
          } catch (err) {
            setError((err as Error).message);
          }
        }}
      >
        <h1 className="text-2xl font-black">
          <span className="text-rose-600">POLSKI</span> <span className="text-amber-500">GO</span> <span className="text-slate-400">· адмін</span>
        </h1>
        <input className="inp" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
        <input className="inp" type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button className="btn-p w-full">Увійти</button>
      </form>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: string }) {
  return (
    <div className="panel p-4">
      <div className="text-xs font-semibold uppercase text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-black">{value}</div>
      {sub && <div className="text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

const TTS_WARNINGS: Record<string, string> = {
  voice_not_in_official_list: 'голосу немає в офіційному списку провайдера',
  voice_not_polish: 'голос не польський',
  premade_english_voice: 'англійський готовий голос — польська звучатиме з акцентом',
  model_without_polish: 'модель не підтримує польську',
};
const TTS_FALLBACK: Record<string, string> = {
  invalid_tts_provider: 'TTS_PROVIDER має невідоме значення — працює auto',
  requested_provider_not_configured: 'для TTS_PROVIDER немає ключа — працює auto',
  no_provider_configured: 'ключів немає — клієнт говорить польським голосом пристрою',
  disabled: 'TTS_PROVIDER=off — серверну озвучку вимкнено',
};

/** Попередній синтез польської озвучки для всього контенту (частинами). Спершу показує, який голос і скільки це коштує. */
function WarmAudio() {
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const { data: st, reload } = useLoad<any>(() => api('/tts/status'), []);
  const run = async () => {
    const w = st?.warm;
    const cost = w?.usd ? `≈ $${w.usd.freeTierLeft} у межах безкоштовного обсягу, ≈ $${w.usd.freeTierUsed}, якщо він уже витрачений` : 'ціна невідома';
    const ask = w
      ? `Голос: ${st.provider} · ${st.voiceId} (${st.model}).\nДо синтезу: до ${w.left.toLocaleString('uk')} символів (${w.phrases} фраз × 2 швидкості, без уже закешованого).\nОрієнтовно ${cost}.\n\nЦе платні запити до провайдера. Продовжити?`
      : 'Це платні запити до провайдера. Продовжити?';
    if (!window.confirm(ask)) return;
    setBusy(true);
    let offset = 0;
    let made = 0;
    try {
      for (;;) {
        const r: any = await api('/tts/warm', { body: { offset } });
        made += r.synthesized;
        setMsg(`Озвучено ${r.next} з ${r.total} фраз (нових записів: ${made})${r.failed.length ? `, помилки: ${r.failed.length}` : ''}`);
        if (r.done) break;
        offset = r.next;
      }
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy(false);
      reload();
    }
  };
  const migrate = async () => {
    setBusy(true);
    let cursor: string | null = null;
    let moved = 0;
    try {
      for (;;) {
        const r: any = await api('/tts/migrate-cache', { body: { cursor } });
        moved += r.migrated;
        setMsg(`Перенесено записів кешу: ${moved}`);
        if (r.done) break;
        cursor = r.next;
      }
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy(false);
      reload();
    }
  };
  return (
    <div className="panel space-y-3 p-4" data-tts-status={st?.provider ?? 'none'}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1">
          <div className="font-bold">Польська озвучка контенту</div>
          <div className="text-sm text-slate-500">{msg || 'Синтезує й кешує всі слова та фрази (звичайна і сповільнена швидкість). Перед запуском покаже голос і оцінку вартості.'}</div>
        </div>
        <button className="btn-p" disabled={busy || !st?.configured} onClick={run}>{busy ? 'Зачекайте…' : 'Озвучити весь контент'}</button>
      </div>
      {st && (
        <div className="grid gap-1 text-sm md:grid-cols-2">
          <div>
            Зараз грає: <b>{st.configured ? `${st.provider} · ${st.voiceId} · ${st.model}` : 'голос пристрою (серверного синтезу немає)'}</b>
            {' '}<span className="text-slate-500">({st.selection === 'explicit' ? `TTS_PROVIDER=${st.requested}` : st.selection})</span>
          </div>
          <div>
            Кеш: {st.cache.rows} записів, {(st.cache.bytes / 1048576).toFixed(1)} МБ
            {st.cache.legacyRows > 0 && <> · старих ключів: {st.cache.legacyRows} <button className="underline" disabled={busy} onClick={migrate}>перенести</button></>}
          </div>
          {st.fallbackReason && <div className="text-amber-700">{TTS_FALLBACK[st.fallbackReason] ?? st.fallbackReason}</div>}
          {st.warnings.map((w: string) => <div key={w} className="text-rose-600">Увага: {TTS_WARNINGS[w] ?? w}</div>)}
          {st.lastError && <div className="text-rose-600">Остання помилка провайдера: {st.lastError.reason} ({new Date(st.lastError.at).toLocaleString('uk')})</div>}
          {st.warm && <div className="text-slate-500">Прогрів: {st.warm.phrases} фраз, до синтезу до {st.warm.left.toLocaleString('uk')} символів</div>}
        </div>
      )}
    </div>
  );
}

function Dashboard() {
  const { data, error } = useLoad(() => api('/dashboard'), []);
  if (error) return <p className="text-rose-600">{error}</p>;
  if (!data) return <p>Завантаження…</p>;
  const maxS = Math.max(1, ...data.signups.map((s: any) => s.count));
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Огляд</h1>
      <WarmAudio />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Користувачів" value={data.users} sub={`+${data.new7} за 7 днів`} />
        <Stat label="Активні (24 год / 7 дн)" value={`${data.active1} / ${data.active7}`} />
        <Stat label="Пройдено уроків" value={data.lessonsTotal} sub={`${data.lessons7} за 7 днів`} />
        <Stat label="Retention D1 / D7" value={`${data.retention.d1 ?? '—'}% / ${data.retention.d7 ?? '—'}%`} />
        <Stat label="Premium-підписників" value={data.premium} />
        <Stat label="Дохід 30 днів" value={`⭐ ${data.revenue30Stars}`} sub={`${data.payments30} платежів · усього ⭐ ${data.revenueAllStars}`} />
        <Stat label="Середній прогрес" value={`${data.avgXp} XP`} sub={`${data.avgLessons} уроків · ${data.avgWords} слів`} />
      </div>
      <div className="panel p-4">
        <h2 className="mb-3 font-bold">Реєстрації за 30 днів</h2>
        <div className="flex h-32 items-end gap-1" role="img" aria-label="Реєстрації за днями">
          {data.signups.map((s: any) => (
            <div key={s.day} title={`${s.day}: ${s.count}`} className="flex-1 rounded-t bg-emerald-500" style={{ height: `${(s.count / maxS) * 100}%`, minHeight: 2 }} />
          ))}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="panel">
          <h2 className="border-b p-3 font-bold">Популярні уроки</h2>
          <table className="w-full">
            <tbody>
              {data.topLessons.map((l: any) => (
                <tr key={l.slug} className="border-b last:border-0">
                  <td className="td">{l.title?.uk}</td>
                  <td className="td text-right font-bold">{l.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="panel">
          <h2 className="border-b p-3 font-bold">Найчастіші помилки</h2>
          <table className="w-full">
            <thead>
              <tr>
                <th className="th">Урок</th>
                <th className="th">Тип</th>
                <th className="th text-right">Помилок</th>
              </tr>
            </thead>
            <tbody>
              {data.errors.map((e: any) => (
                <tr key={e.exerciseId} className="border-t">
                  <td className="td">
                    <Link className="text-emerald-700 underline" to={`/r/exercises/${e.exerciseId}`}>
                      {e.lesson}
                    </Link>
                  </td>
                  <td className="td">{e.type}</td>
                  <td className="td text-right font-bold">
                    {e.rate}% ({e.wrong}/{e.total})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function I18nInput({ value, onChange, multiline }: { value: any; onChange: (v: any) => void; multiline?: boolean }) {
  const v = value ?? {};
  return (
    <div className="grid gap-2 md:grid-cols-3">
      {(['uk', 'ru', 'en'] as const).map((l) => (
        <label key={l} className="text-xs font-semibold text-slate-500">
          {l.toUpperCase()}
          {multiline ? (
            <textarea className="inp mt-1 min-h-24" value={v[l] ?? ''} onChange={(e) => onChange({ ...v, [l]: e.target.value })} />
          ) : (
            <input className="inp mt-1" value={v[l] ?? ''} onChange={(e) => onChange({ ...v, [l]: e.target.value })} />
          )}
        </label>
      ))}
    </div>
  );
}

function RefSelect({ field, value, onChange }: { field: Extract<Field, { type: 'ref' }>; value: any; onChange: (v: any) => void }) {
  const { data } = useLoad(() => api(`/resources/${field.resource}?take=500`), [field.resource]);
  return (
    <select className="inp" value={value ?? ''} onChange={(e) => onChange(e.target.value || null)}>
      {field.nullable !== false && <option value="">—</option>}
      {data?.items.map((r: any) => (
        <option key={r.id} value={r.id}>
          {get(r, field.display)}
        </option>
      ))}
    </select>
  );
}

function FieldInput({ field, value, onChange }: { field: Field; value: any; onChange: (v: any) => void }) {
  const [jsonText, setJsonText] = useState(() => JSON.stringify(value ?? null, null, 2));
  const [jsonErr, setJsonErr] = useState('');
  switch (field.type) {
    case 'text':
      return <input className="inp" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
    case 'textarea':
      return <textarea className="inp min-h-24" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
    case 'number':
      return <input className="inp" type="number" value={value ?? 0} onChange={(e) => onChange(Number(e.target.value))} />;
    case 'bool':
      return <input type="checkbox" className="h-5 w-5" checked={!!value} onChange={(e) => onChange(e.target.checked)} />;
    case 'select':
      return (
        <select className="inp" value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
          {field.options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      );
    case 'i18n':
      return <I18nInput value={value} onChange={onChange} multiline={field.name === 'explanation' || field.name === 'description'} />;
    case 'tags':
      return <input className="inp" value={(value ?? []).join(', ')} onChange={(e) => onChange(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} />;
    case 'ref':
      return <RefSelect field={field} value={value} onChange={onChange} />;
    case 'asset':
      return (
        <div className="flex items-center gap-2">
          <input className="inp" value={value ?? ''} onChange={(e) => onChange(e.target.value || null)} placeholder="/uploads/…" />
          <label className="btn-s cursor-pointer whitespace-nowrap">
            ⬆ Файл
            <input type="file" accept="image/*,audio/*,application/json" className="hidden" onChange={async (e) => e.target.files?.[0] && onChange(await upload(e.target.files[0]))} />
          </label>
          {value && String(value).match(/\.(png|jpe?g|webp|gif)$/) && <img src={value} className="h-10 w-10 rounded object-cover" alt="" />}
          {value && String(value).match(/\.(mp3|ogg|wav|webm)$/) && <audio src={value} controls className="h-8" />}
        </div>
      );
    case 'json':
      return (
        <div>
          <textarea
            className={`inp min-h-40 font-mono text-xs ${jsonErr ? 'border-rose-500' : ''}`}
            value={jsonText}
            onChange={(e) => {
              setJsonText(e.target.value);
              try {
                onChange(JSON.parse(e.target.value));
                setJsonErr('');
              } catch (err) {
                setJsonErr((err as Error).message);
              }
            }}
          />
          {jsonErr && <p className="text-xs text-rose-600">{jsonErr}</p>}
        </div>
      );
  }
}

function ResourceList({ def }: { def: ResourceDef }) {
  const [params, setParams] = useSearchParams();
  const qs = params.toString();
  const { data, error, loading } = useLoad(() => api(`/resources/${def.name}?${qs}`), [def.name, qs]);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">{def.title}</h1>
        <Link className="btn-p" to={`/r/${def.name}/new${qs ? `?${qs}` : ''}`}>
          + Додати
        </Link>
      </div>
      <input className="inp max-w-sm" placeholder="Пошук…" defaultValue={params.get('search') ?? ''} onKeyDown={(e) => e.key === 'Enter' && setParams({ ...Object.fromEntries(params), search: (e.target as HTMLInputElement).value })} />
      {[...params.entries()].filter(([k]) => k !== 'search').length > 0 && (
        <button className="btn-s" onClick={() => setParams({})}>
          ✕ Скинути фільтри
        </button>
      )}
      {error && <p className="text-rose-600">{error}</p>}
      <div className="panel overflow-x-auto">
        <table className="w-full">
          <thead className="border-b bg-slate-50">
            <tr>
              {def.columns.map((c) => (
                <th key={c.key} className="th">
                  {c.label}
                </th>
              ))}
              <th className="th" />
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="td">Завантаження…</td>
              </tr>
            )}
            {data?.items.map((r: any) => (
              <tr key={r[def.idField ?? 'id']} className="border-b hover:bg-slate-50">
                {def.columns.map((c) => (
                  <td key={c.key} className="td max-w-xs truncate">
                    {show(get(r, c.key), c.i18n)}
                  </td>
                ))}
                <td className="td whitespace-nowrap text-right">
                  {def.name === 'lessons' && (
                    <Link className="mr-3 text-emerald-700 underline" to={`/r/exercises?lessonId=${r.id}`}>
                      вправи
                    </Link>
                  )}
                  {def.name === 'routes' && (
                    <Link className="mr-3 text-emerald-700 underline" to={`/r/lessons?routeId=${r.id}`}>
                      уроки
                    </Link>
                  )}
                  {def.name === 'cities' && (
                    <Link className="mr-3 text-emerald-700 underline" to={`/r/routes?cityId=${r.id}`}>
                      маршрути
                    </Link>
                  )}
                  {def.name === 'quests' && r.kind === 'STORY' && (
                    <Link className="mr-3 text-emerald-700 underline" to={`/r/questSteps?questId=${r.id}`}>
                      етапи
                    </Link>
                  )}
                  {def.name === 'campaigns' && r.status === 'DRAFT' && <SendCampaign id={r.id} />}
                  <Link className="text-sky-700 underline" to={`/r/${def.name}/${r[def.idField ?? 'id']}`}>
                    редагувати
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-slate-500">Усього: {data?.total ?? 0}</p>
    </div>
  );
}

function SendCampaign({ id }: { id: string }) {
  const [sent, setSent] = useState(false);
  return (
    <button
      className="mr-3 text-rose-700 underline"
      disabled={sent}
      onClick={async () => {
        if (!confirm('Надіслати розсилку всім користувачам, які погодилися на сповіщення?')) return;
        try {
          await api(`/campaigns/${id}/send`, { body: {} });
          setSent(true);
        } catch (e) {
          alert((e as Error).message);
        }
      }}
    >
      {sent ? 'надсилається…' : 'надіслати'}
    </button>
  );
}

function ResourceEdit({ def }: { def: ResourceDef }) {
  const { id } = useParams();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const isNew = id === 'new';
  const [form, setForm] = useState<Record<string, any> | null>(null);
  const [msg, setMsg] = useState('');
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (isNew) {
      const pre = Object.fromEntries([...params.entries()].filter(([k]) => def.filters?.includes(k)));
      setForm({ ...def.defaults, ...pre });
    } else api(`/resources/${def.name}/${id}`).then(setForm).catch((e) => setMsg(e.message));
  }, [id, def]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!form) return <p>{msg || 'Завантаження…'}</p>;
  const set = (name: string, v: any) => setForm((f) => ({ ...f!, [name]: v }));
  const payload = () => {
    const out: Record<string, any> = {};
    for (const f of def.fields) {
      let v = form[f.name];
      if (f.type === 'i18n' && v && !v.uk) v = f.name === 'explanation' && def.name === 'exercises' ? null : v;
      out[f.name] = v ?? (f.type === 'i18n' ? null : v);
    }
    return out;
  };
  const save = async () => {
    setMsg('');
    try {
      const r = isNew ? await api(`/resources/${def.name}`, { body: payload() }) : await api(`/resources/${def.name}/${id}`, { method: 'PATCH', body: payload() });
      setMsg('✅ Збережено');
      if (isNew) nav(`/r/${def.name}/${r[def.idField ?? 'id']}`, { replace: true });
    } catch (e) {
      setMsg(`❌ ${(e as Error).message}`);
    }
  };
  const remove = async () => {
    if (!confirm('Видалити запис? Це незворотно.')) return;
    try {
      await api(`/resources/${def.name}/${id}`, { method: 'DELETE' });
      nav(-1);
    } catch (e) {
      setMsg(`❌ ${(e as Error).message}`);
    }
  };

  return (
    <div className="max-w-4xl space-y-4">
      <div className="flex items-center gap-3">
        <button className="btn-s" onClick={() => nav(-1)}>
          ←
        </button>
        <h1 className="text-2xl font-black">
          {def.title}: {isNew ? 'новий запис' : show(form.slug ?? form.pl ?? form.code ?? form.title, true)}
        </h1>
      </div>
      {def.name === 'exercises' && (
        <div className="panel flex flex-wrap items-center gap-2 p-3 text-sm">
          <span className="font-semibold">Шаблон даних для типу {form.type}:</span>
          <button
            className="btn-s"
            onClick={() => {
              set('data', EXERCISE_TEMPLATES[form.type] ?? {});
              setKey((k) => k + 1);
            }}
          >
            Вставити шаблон
          </button>
          <span className="text-slate-500">Правильна відповідь зберігається в даних і ніколи не надсилається гравцю до перевірки.</span>
        </div>
      )}
      <div className="panel space-y-4 p-5" key={key}>
        {def.fields.map((f) => (
          <div key={f.name} className="grid gap-1 md:grid-cols-[200px_1fr] md:items-start">
            <label className="pt-2 text-sm font-semibold text-slate-600">{f.label}</label>
            <FieldInput field={f} value={form[f.name]} onChange={(v) => set(f.name, v)} />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button className="btn-p" onClick={save}>
          Зберегти
        </button>
        {!isNew && (
          <button className="btn-d" onClick={remove}>
            Видалити
          </button>
        )}
        <span className="text-sm">{msg}</span>
      </div>
      {def.name === 'lessons' && !isNew && (
        <Link className="btn-s" to={`/r/exercises?lessonId=${id}`}>
          Вправи уроку →
        </Link>
      )}
    </div>
  );
}

function Users() {
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const { data, error } = useLoad(() => api(`/users?search=${encodeURIComponent(q)}`), [q]);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">Користувачі</h1>
      <form onSubmit={(e) => { e.preventDefault(); setQ(search); }} className="flex max-w-md gap-2">
        <input className="inp" placeholder="Ім'я, @username або Telegram ID" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className="btn-p">Шукати</button>
      </form>
      {error && <p className="text-rose-600">{error}</p>}
      <div className="panel overflow-x-auto">
        <table className="w-full">
          <thead className="border-b bg-slate-50">
            <tr>
              {['Користувач', 'Telegram ID', 'Рівень', 'XP', 'Польська', 'Premium', 'Створено', ''].map((h) => (
                <th key={h} className="th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data?.items.map((u: any) => (
              <tr key={u.id} className="border-b">
                <td className="td">{u.firstName} {u.username && <span className="text-slate-400">@{u.username}</span>} {u.isBanned && <span className="rounded bg-rose-100 px-1 text-rose-700">blocked</span>}</td>
                <td className="td font-mono">{u.telegramId}</td>
                <td className="td">{u.progress?.playerLevel}</td>
                <td className="td">{u.progress?.xpTotal}</td>
                <td className="td">{u.progress?.languageLevel}</td>
                <td className="td">{u.subscriptions.length ? '👑' : '—'}</td>
                <td className="td">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="td"><Link className="text-sky-700 underline" to={`/users/${u.id}`}>деталі</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UserDetail({ admin }: { admin: Admin }) {
  const { id } = useParams();
  const { data: u, error, reload } = useLoad(() => api(`/users/${id}`), [id]);
  const [days, setDays] = useState(30);
  if (error) return <p className="text-rose-600">{error}</p>;
  if (!u) return <p>Завантаження…</p>;
  const act = async (path: string, body: any) => {
    try {
      await api(path, { body });
      reload();
    } catch (e) {
      alert((e as Error).message);
    }
  };
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">
        {u.firstName} {u.username && <span className="text-slate-400">@{u.username}</span>}
      </h1>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label="Рівень" value={u.progress?.playerLevel} />
        <Stat label="XP" value={u.progress?.xpTotal} />
        <Stat label="Польська" value={u.progress?.languageLevel} />
        <Stat label="Серія" value={`${u.progress?.streakCurrent} (рекорд ${u.progress?.streakBest})`} />
        <Stat label="Złotki" value={u.wallet?.balance} />
      </div>
      <div className="panel flex flex-wrap items-center gap-3 p-4">
        <button className="btn-d" onClick={() => { const reason = u.isBanned ? undefined : prompt('Причина блокування') ?? undefined; void act(`/users/${id}/ban`, { banned: !u.isBanned, reason }); }}>
          {u.isBanned ? 'Розблокувати' : 'Заблокувати'}
        </button>
        {admin.role === 'SUPERADMIN' && (
          <>
            <input className="inp w-24" type="number" value={days} onChange={(e) => setDays(Number(e.target.value))} />
            <button className="btn-p" onClick={() => act(`/users/${id}/premium`, { days })}>Видати Premium (днів)</button>
            <button className="btn-s" onClick={() => act(`/users/${id}/premium`, { revoke: true })}>Скасувати Premium</button>
          </>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Table title="Міста" rows={u.cities} cols={[['city.namePl', 'Місто'], ['unlockedAt', 'Відкрито'], ['bossPassedAt', 'Іспит']]} />
        <Table title="Підписки" rows={u.subscriptions} cols={[['planCode', 'План'], ['status', 'Статус'], ['expiresAt', 'До']]} />
        <Table title="Сесії навчання" rows={u.sessions} cols={[['mode', 'Режим'], ['lesson.slug', 'Урок'], ['correct', '✓'], ['total', 'Σ'], ['xpAwarded', 'XP'], ['startedAt', 'Початок']]} />
        <Table title="Нарахування XP" rows={u.xpEvents} cols={[['reason', 'Причина'], ['amount', 'XP'], ['createdAt', 'Коли']]} />
        <Table title="Гаманець" rows={u.transactions} cols={[['reason', 'Причина'], ['amount', 'Сума'], ['createdAt', 'Коли']]} />
        <Table title="Платежі" rows={u.payments} cols={[['type', 'Подія'], ['planCode', 'План'], ['amount', '⭐'], ['error', 'Помилка'], ['createdAt', 'Коли']]} />
      </div>
    </div>
  );
}

function Table({ title, rows, cols }: { title: string; rows: any[]; cols: [string, string][] }) {
  const fmt = (v: any) => (typeof v === 'string' && /^\d{4}-\d\d-\d\dT/.test(v) ? new Date(v).toLocaleString() : show(v));
  return (
    <div className="panel overflow-x-auto">
      <h2 className="border-b p-3 font-bold">{title}</h2>
      <table className="w-full">
        <thead>
          <tr>{cols.map(([, l]) => <th key={l} className="th">{l}</th>)}</tr>
        </thead>
        <tbody>
          {rows?.length ? rows.map((r, i) => (
            <tr key={i} className="border-t">{cols.map(([k]) => <td key={k} className="td">{fmt(get(r, k))}</td>)}</tr>
          )) : <tr><td className="td text-slate-400">—</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function Payments() {
  const { data, error } = useLoad(() => api('/payments'), []);
  if (error) return <p className="text-rose-600">{error}</p>;
  if (!data) return <p>Завантаження…</p>;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">Платежі та підписки</h1>
      <div className="flex flex-wrap gap-2">
        {data.subscriptions.map((s: any) => (
          <span key={`${s.status}${s.planCode}`} className="rounded-full bg-white px-3 py-1 text-sm shadow-sm">
            {s.planCode} · {s.status}: <b>{s.count}</b>
          </span>
        ))}
      </div>
      <Table title={`Журнал платіжних подій (${data.total})`} rows={data.items} cols={[['createdAt', 'Коли'], ['type', 'Подія'], ['user.firstName', 'Користувач'], ['planCode', 'План'], ['amount', '⭐'], ['chargeId', 'Charge ID'], ['error', 'Помилка']]} />
    </div>
  );
}

function Rewards() {
  const { data, error } = useLoad(() => api('/config/rewards'), []);
  const [form, setForm] = useState<Record<string, number> | null>(null);
  const [msg, setMsg] = useState('');
  useEffect(() => setForm(data), [data]);
  if (error) return <p className="text-rose-600">{error}</p>;
  if (!form) return <p>Завантаження…</p>;
  const labels: Record<string, string> = {
    exerciseXp: 'XP за правильну вправу', lessonXp: 'XP за урок', perfectBonusXp: 'Бонус за ідеальний урок', dailyQuestXp: 'XP щоденного квесту (довідково)',
    weeklyQuestXp: 'XP тижневого квесту (довідково)', storyQuestXp: 'XP сюжетного квесту (довідково)', cityExamXp: 'XP за іспит міста', lessonZlotki: 'Złotki за урок',
    perfectZlotki: 'Złotki за ідеальний урок', dailyQuestZlotki: 'Złotki щоденного квесту (довідково)', storyQuestZlotki: 'Złotki сюжету (довідково)', cityExamZlotki: 'Złotki за іспит міста',
    replayFactor: 'Частка XP за повтор уроку (0–1)', maxRewardedReplaysPerDay: 'Нагороджуваних повторів уроку на добу', practiceXpDailyCap: 'Ліміт XP тренувань на день',
    freeAiMessagesPerDay: 'AI-повідомлень на день (Free)', premiumAiMessagesPerDay: 'AI-повідомлень на день (Premium)',
  };
  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-black">Нагороди та ліміти</h1>
      <p className="text-sm text-slate-500">Нагороди квестів задаються в кожному квесті окремо. Зміни застосовуються протягом 30 секунд.</p>
      <div className="panel space-y-3 p-5">
        {Object.entries(form).map(([k, v]) => (
          <label key={k} className="grid grid-cols-[1fr_140px] items-center gap-3 text-sm">
            <span>{labels[k] ?? k}</span>
            <input className="inp" type="number" step="any" value={v} onChange={(e) => setForm({ ...form, [k]: Number(e.target.value) })} />
          </label>
        ))}
      </div>
      <button
        className="btn-p"
        onClick={async () => {
          try {
            await api('/config/rewards', { method: 'PUT', body: form });
            setMsg('✅ Збережено');
          } catch (e) {
            setMsg(`❌ ${(e as Error).message}`);
          }
        }}
      >
        Зберегти
      </button>
      <span className="ml-3 text-sm">{msg}</span>
    </div>
  );
}

/** Бот: перевірка й налаштування без секретів у браузері (секрет webhook знає лише сервер і Telegram). */
function Bot() {
  const { data, error, loading, reload } = useLoad(() => api('/bot'), []);
  const [busy, setBusy] = useState('');
  const [result, setResult] = useState<any>(null);
  const run = async (mode: 'setup' | 'rotate') => {
    if (mode === 'rotate' && !confirm('Згенерувати новий секрет webhook? Старий перестане діяти через 10 хвилин після підтвердження Telegram.')) return;
    setBusy(mode);
    try {
      setResult(await api('/bot/setup', { body: { mode } }));
      reload();
    } catch (e) {
      setResult({ error: (e as Error).message });
    } finally {
      setBusy('');
    }
  };
  const report = data?.report;
  const wh = report?.webhook;
  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-2xl font-black">Telegram-бот</h1>
      {error && <p className="text-rose-600">{error}</p>}
      {loading && <p>Перевірка…</p>}
      {report && (
        <div className="grid gap-3 md:grid-cols-3">
          <Stat label="Бот" value={report.bot ? `@${report.bot.username}` : '—'} sub={report.ok ? 'Telegram відповідає' : 'є помилки'} />
          <Stat label="Webhook" value={wh?.url ? (wh.allowedUpdates.length === 0 || wh.allowedUpdates.includes('callback_query') ? '✅ з кнопками' : '⚠️ без callback_query') : '❌ не встановлено'} sub={wh ? `черга: ${wh.pending}` : undefined} />
          <Stat label="Секрет webhook" value={report.secretGeneration ? `поколення ${report.secretGeneration}` : 'зі змінної Cloudflare'} sub={report.secretGeneration ? (report.secretConfirmed ? 'підтверджено Telegram' : 'чекає підтвердження') : 'перейде на серверний при налаштуванні'} />
        </div>
      )}
      {wh?.lastError && <p className="text-sm text-amber-700">Остання помилка доставки: {wh.lastError} ({wh.lastErrorAt})</p>}
      {report?.hints?.length > 0 && (
        <ul className="list-disc pl-5 text-sm">
          {report.hints.map((h: string) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap gap-2">
        <button className="btn-s" disabled={!!busy} onClick={reload}>Перевірити</button>
        <button className="btn-p" disabled={!!busy} onClick={() => run('setup')}>{busy === 'setup' ? 'Налаштування…' : 'Налаштувати бота'}</button>
        <button className="btn-s" disabled={!!busy} onClick={() => run('rotate')}>{busy === 'rotate' ? 'Зміна…' : 'Змінити секрет webhook'}</button>
      </div>
      {data?.maintenance && <p className="text-xs text-slate-500">Автоперевірка cron: {new Date(data.maintenance.checkedAt).toLocaleString()} · {data.maintenance.webhook} {data.maintenance.error ? `· ${data.maintenance.error}` : ''}</p>}
      {result && <pre className="panel overflow-auto p-3 text-xs">{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}

function Audit() {
  const { data, error } = useLoad(() => api('/audit'), []);
  if (error) return <p className="text-rose-600">{error}</p>;
  return <Table title="Журнал дій адміністраторів" rows={data ?? []} cols={[['createdAt', 'Коли'], ['admin.email', 'Адмін'], ['action', 'Дія'], ['entity', "Об'єкт"], ['entityId', 'ID'], ['details', 'Деталі']]} />;
}

function Admins() {
  const { data, reload } = useLoad(() => api('/admins'), []);
  const [f, setF] = useState({ email: '', name: '', role: 'EDITOR', password: '' });
  return (
    <div className="space-y-4">
      <Table title="Адміністратори" rows={data ?? []} cols={[['email', 'Email'], ['name', "Ім'я"], ['role', 'Роль'], ['isActive', 'Активний'], ['lastLoginAt', 'Вхід']]} />
      <div className="panel grid max-w-2xl gap-2 p-4 md:grid-cols-2">
        <input className="inp" placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <input className="inp" placeholder="Ім'я" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <select className="inp" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}>
          <option>EDITOR</option>
          <option>SUPPORT</option>
          <option>SUPERADMIN</option>
        </select>
        <input className="inp" type="password" placeholder="Пароль (мін. 10 символів)" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        <button className="btn-p" onClick={async () => { try { await api('/admins', { body: f }); reload(); } catch (e) { alert((e as Error).message); } }}>
          Додати адміністратора
        </button>
      </div>
    </div>
  );
}

export function App() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [checked, setChecked] = useState(!hasToken());
  useEffect(() => {
    if (hasToken()) api<Admin>('/me').then(setAdmin).catch(() => setToken(null)).finally(() => setChecked(true));
  }, []);
  const nav = useMemo(() => {
    if (!admin) return [];
    const r = admin.role;
    const items: [string, string][] = [['/', '📊 Огляд']];
    if (r !== 'SUPPORT') for (const d of RESOURCES.filter((x) => x.name !== 'plans' && x.name !== 'campaigns')) items.push([`/r/${d.name}`, d.title]);
    if (r !== 'EDITOR') items.push(['/users', '👥 Користувачі'], ['/payments', '⭐ Платежі']);
    if (r === 'SUPERADMIN') items.push(['/r/plans', '👑 Тарифи'], ['/r/campaigns', '📣 Розсилки'], ['/rewards', '🎁 Нагороди'], ['/bot', '🤖 Бот'], ['/audit', '📜 Журнал дій'], ['/admins', '🔐 Адміністратори']);
    return items;
  }, [admin]);

  if (!checked) return null;
  if (!admin) return <Login onLogin={setAdmin} />;
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r bg-white p-3">
        <div className="mb-4 px-2 text-lg font-black">
          <span className="text-rose-600">POLSKI</span> <span className="text-amber-500">GO</span>
        </div>
        <nav className="space-y-0.5">
          {nav.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `block rounded-lg px-3 py-1.5 text-sm ${isActive ? 'bg-emerald-50 font-bold text-emerald-700' : 'hover:bg-slate-100'}`}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-6 border-t px-2 pt-3 text-xs text-slate-500">
          {admin.email}
          <br />
          {admin.role}
          <button className="mt-2 block text-rose-600 underline" onClick={() => { setToken(null); location.reload(); }}>
            Вийти
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          {RESOURCES.map((d) => (
            <Route key={d.name} path={`/r/${d.name}`} element={<ResourceList def={d} />} />
          ))}
          {RESOURCES.map((d) => (
            <Route key={`${d.name}-e`} path={`/r/${d.name}/:id`} element={<ResourceEdit def={d} />} />
          ))}
          <Route path="/users" element={<Users />} />
          <Route path="/users/:id" element={<UserDetail admin={admin} />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/bot" element={<Bot />} />
          <Route path="/audit" element={<Audit />} />
          <Route path="/admins" element={<Admins />} />
        </Routes>
      </main>
    </div>
  );
}
