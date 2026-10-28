import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, NavLink, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api, apiBlob, hasToken, setToken, upload } from './api';
import { EXERCISE_TEMPLATES, RESOURCES, type Field, type ResourceDef } from './resources';

type Admin = { id: string; email: string; name: string; role: 'SUPERADMIN' | 'EDITOR' | 'SUPPORT' };

const get = (o: any, path: string) => path.split('.').reduce((a, k) => a?.[k], o);
const show = (v: unknown, i18n?: boolean): string => {
  if (v == null) return '—';
  if (i18n && typeof v === 'object') return (v as any).ru || (v as any).uk || '';
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
          <span className="text-rose-600">POLSKI</span> <span className="text-amber-500">GO</span> <span className="text-slate-400">· админка</span>
        </h1>
        <input className="inp" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
        <input className="inp" type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button className="btn-p w-full">Войти</button>
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
  voice_not_in_official_list: 'голоса нет в официальном списке провайдера',
  voice_not_polish: 'голос не польский',
  premade_english_voice: 'готовый английский голос — польский будет звучать с акцентом',
  model_without_polish: 'модель не поддерживает польский',
};
const TTS_FALLBACK: Record<string, string> = {
  invalid_tts_provider: 'у TTS_PROVIDER неизвестное значение — работает auto',
  requested_provider_not_configured: 'для TTS_PROVIDER нет ключа — работает auto',
  no_provider_configured: 'ключей нет — приложение говорит польским голосом устройства',
  disabled: 'TTS_PROVIDER=off — серверная озвучка выключена',
};

/** Попередній синтез польської озвучки для всього контенту (частинами). Спершу показує, який голос і скільки це коштує. */
function WarmAudio() {
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const { data: st, reload } = useLoad<any>(() => api('/tts/status'), []);
  const run = async () => {
    const w = st?.warm;
    const cost = w?.usd ? `≈ $${w.usd.freeTierLeft} в пределах бесплатного объёма, ≈ $${w.usd.freeTierUsed}, если он уже израсходован` : 'цена неизвестна';
    const ask = w
      ? `Голос: ${st.provider} · ${st.voiceId} (${st.model}).\nК синтезу: до ${w.left.toLocaleString('ru')} символов (${w.phrases} фраз × 2 скорости, без уже закэшированного).\nОриентировочно ${cost}.\n\nЭто платные запросы к провайдеру. Продолжить?`
      : 'Это платные запросы к провайдеру. Продолжить?';
    if (!window.confirm(ask)) return;
    setBusy(true);
    let offset = 0;
    let made = 0;
    try {
      for (;;) {
        const r: any = await api('/tts/warm', { body: { offset } });
        made += r.synthesized;
        setMsg(`Озвучено ${r.next} из ${r.total} фраз (новых записей: ${made})${r.failed.length ? `, ошибки: ${r.failed.length}` : ''}`);
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
        setMsg(`Перенесено записей кэша: ${moved}`);
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
          <div className="font-bold">Польская озвучка контента</div>
          <div className="text-sm text-slate-500">{msg || 'Синтезирует и кэширует все слова и фразы (обычная и замедленная скорость). Перед запуском покажет голос и оценку стоимости.'}</div>
        </div>
        <button className="btn-p" disabled={busy || !st?.configured} onClick={run}>{busy ? 'Подождите…' : 'Озвучить весь контент'}</button>
      </div>
      {st && (
        <div className="grid gap-1 text-sm md:grid-cols-2">
          <div>
            Сейчас звучит: <b>{st.configured ? `${st.provider} · ${st.voiceId} · ${st.model}` : 'голос устройства (серверного синтеза нет)'}</b>
            {' '}<span className="text-slate-500">({st.selection === 'explicit' ? `TTS_PROVIDER=${st.requested}` : st.selection})</span>
          </div>
          <div>
            Кэш: {st.cache.rows} записей, {(st.cache.bytes / 1048576).toFixed(1)} МБ
            {st.cache.legacyRows > 0 && <> · старых ключей: {st.cache.legacyRows} <button className="underline" disabled={busy} onClick={migrate}>перенести</button></>}
          </div>
          {st.fallbackReason && <div className="text-amber-700">{TTS_FALLBACK[st.fallbackReason] ?? st.fallbackReason}</div>}
          {st.warnings.map((w: string) => <div key={w} className="text-rose-600">Внимание: {TTS_WARNINGS[w] ?? w}</div>)}
          {st.lastError && <div className="text-rose-600">Последняя ошибка провайдера: {st.lastError.reason} ({new Date(st.lastError.at).toLocaleString('ru')})</div>}
          {st.warm && <div className="text-slate-500">Прогрев: {st.warm.phrases} фраз, к синтезу до {st.warm.left.toLocaleString('ru')} символов</div>}
          {st.spend && (
            <div className="text-slate-500" data-tts-spend>
              Платный синтез сегодня: игроки {st.spend.today.user.chars.toLocaleString('ru')} из {st.spend.limit.toLocaleString('ru')} символов
              {' '}(TTS_GLOBAL_DAILY_CHARS), админка {st.spend.today.admin.chars.toLocaleString('ru')} · за 30 дней {(st.spend.last30.user.chars + st.spend.last30.admin.chars).toLocaleString('ru')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const BLIND = 'ABCDEFGH';

/**
 * Порівняння польських голосів на слух: до 4 голосів, фрази бенчмарку і ризиковані фрази контенту (час, ціни, лінії…).
 * Слепой режим — голоси під літерами у випадковому порядку, назви відкриваються кнопкою. Кожен новий зразок — платний
 * запит на символи фрази (облік admin), повтор — з кешу. Протокол оцінки — docs/POLISH_TTS_BENCHMARK.md, кроки — docs/GOOGLE_TTS_SETUP_RU.md.
 */
function CompareVoices() {
  const [open, setOpen] = useState(false);
  const { data, error, reload } = useLoad<any>(() => (open ? api('/tts/compare') : Promise.resolve(null)), [open]);
  const [picked, setPicked] = useState<string[]>([]);
  const [blind, setBlind] = useState(true);
  const [reveal, setReveal] = useState(false);
  const [order, setOrder] = useState<string[]>([]);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const key = (v: any) => `${v.provider}|${v.voice}|${v.model}`;
  useEffect(() => {
    if (!data || picked.length) return;
    const pref = ['pl-PL-Chirp3-HD-Kore', 'pl-PL-Chirp3-HD-Charon', 'pl-PL-Wavenet-F', 'pl-PL-Wavenet-G'];
    const start = data.voices.filter((v: any) => pref.includes(v.voice) || v.current).slice(0, 4).map(key);
    setPicked(start.length ? start : data.voices.slice(0, 4).map(key));
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    setOrder([...picked].sort(() => Math.random() - 0.5));
    setReveal(false);
  }, [picked, blind]);
  const voices: any[] = order.map((k) => data?.voices.find((v: any) => key(v) === k)).filter(Boolean);
  const name = (v: any, i: number) => (blind && !reveal ? `Голос ${BLIND[i]}` : `${v.voice.replace(/^pl-PL-/, '')} · ${v.model}`);
  const play = async (v: any, i: number, text: string, rate: 'normal' | 'slow') => {
    const id = `${key(v)}|${rate}|${text}`;
    setBusy(id);
    try {
      const blob = await apiBlob('/tts/sample', { provider: v.provider, voice: v.voice, model: v.model, text, rate });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => URL.revokeObjectURL(url);
      await audio.play();
      setMsg(`Звучит: ${name(v, i)}${rate === 'slow' ? ' (медленно)' : ''}`);
    } catch (e) {
      setMsg(`${name(v, i)}: ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  };
  const row = (text: string, hint: string, rates: ('normal' | 'slow')[] = ['normal', 'slow']) => (
    <div key={text} className="border-b py-2 last:border-0">
      <div className="font-medium" lang="pl">{text}</div>
      {hint && <div className="text-xs text-slate-500">{hint}</div>}
      <div className="mt-1 flex flex-wrap gap-1">
        {voices.map((v, i) =>
          rates.map((r) => (
            <button key={`${key(v)}${r}`} className="rounded border px-2 py-1 text-xs disabled:opacity-50" disabled={!!busy} onClick={() => play(v, i, text, r)}>
              {busy === `${key(v)}|${r}|${text}` ? '…' : '▶'} {blind && !reveal ? BLIND[i] : v.voice.replace(/^pl-PL-(Chirp3-HD-)?/, '')}{r === 'slow' ? ' 🐢' : ''}
            </button>
          )),
        )}
      </div>
    </div>
  );
  return (
    <div className="panel p-4" data-tts-compare>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1">
          <div className="font-bold">Сравнение голосов (на слух)</div>
          <div className="text-sm text-slate-500">До 4 польских голосов на фразах теста и рискованных фразах контента. Новый образец — платный запрос на символы фразы; повтор — из кэша.</div>
        </div>
        <button className="btn-p" onClick={() => (open ? reload() : setOpen(true))}>{open ? 'Обновить' : 'Открыть'}</button>
      </div>
      {error && <p className="mt-2 text-rose-600">{error}</p>}
      {open && data && !data.voices.length && <p className="mt-2 text-amber-700">Ключа провайдера нет: сравнивать нечего. Шаги подключения — docs/GOOGLE_TTS_SETUP_RU.md.</p>}
      {open && data && data.voices.length > 0 && (
        <div className="mt-3 space-y-3">
          <details>
            <summary className="cursor-pointer text-sm font-semibold">Голоса для сравнения: {picked.length} из 4</summary>
            <div className="mt-2 grid max-h-64 gap-1 overflow-auto text-sm md:grid-cols-3">
              {data.voices.map((v: any) => {
                const k = key(v);
                const on = picked.includes(k);
                return (
                  <label key={k} className="flex items-center gap-2">
                    <input type="checkbox" checked={on} disabled={!on && picked.length >= 4} onChange={() => setPicked((p) => (on ? p.filter((x) => x !== k) : [...p, k]))} />
                    {v.voice.replace(/^pl-PL-/, '')} <span className="text-slate-500">{v.gender ?? ''} · {v.price ? `$${v.price.usdPerMillion}/1M` : '?'}{v.current ? ' · сейчас звучит' : ''}</span>
                  </label>
                );
              })}
            </div>
          </details>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={blind} onChange={(e) => setBlind(e.target.checked)} /> Слепой режим</label>
            {blind && <button className="underline" onClick={() => setReveal((r) => !r)}>{reveal ? 'Скрыть названия' : 'Показать, кто есть кто'}</button>}
            {blind && reveal && <span className="text-slate-500">{voices.map((v, i) => `${BLIND[i]} = ${v.voice.replace(/^pl-PL-/, '')}`).join(', ')}</span>}
            <span className="text-slate-500">Сегодня админка: {data.spend.today.admin.chars.toLocaleString('ru')} символов</span>
          </div>
          {msg && <div className="text-sm">{msg}</div>}
          <details open>
            <summary className="cursor-pointer font-semibold">Фразы теста ({data.phrases.length})</summary>
            {data.phrases.map((p: any) => row(p.text, `${p.required ? '★ ' : ''}${p.focus}`, p.rates))}
          </details>
          {data.risks.map((g: any) => (
            <details key={g.id}>
              <summary className="cursor-pointer font-semibold">Из контента: {g.label} ({g.count}, показано {g.items.length})</summary>
              <div className="text-xs text-slate-500">Слушать: {g.listen}</div>
              {g.items.map((t: string) => row(t, ''))}
            </details>
          ))}
        </div>
      )}
    </div>
  );
}

/** Короткая сводка аудитории бота на «Обзоре» (SUPERADMIN и SUPPORT; редактору раздел недоступен — карточки нет). */
function AudienceCard() {
  const { data } = useLoad<any>(() => api('/audience').catch(() => null), []);
  const s = data?.summary;
  if (!s) return null;
  return (
    <Link to="/audience" className="panel block p-4 hover:bg-slate-50" data-audience-card>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="font-bold">🤝 Аудитория бота</div>
        <span className="text-sm text-sky-700 underline">открыть список →</span>
      </div>
      <div className="mt-1 text-sm">
        Всего <b>{s.total}</b> · новые за сутки <b>{s.new1}</b>, за 7 дней <b>{s.new7}</b> · открыли приложение <b>{s.app}</b> · только бот <b>{s.botOnly}</b>
        {s.blocked > 0 && <> · заблокировали бота <b>{s.blocked}</b></>}
      </div>
    </Link>
  );
}

function Dashboard() {
  const { data, error } = useLoad(() => api('/dashboard'), []);
  if (error) return <p className="text-rose-600">{error}</p>;
  if (!data) return <p>Загрузка…</p>;
  const maxS = Math.max(1, ...data.signups.map((s: any) => s.count));
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Обзор</h1>
      <AudienceCard />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Аккаунтов в приложении" value={data.users} sub={`+${data.new7} за 7 дней`} />
        <Stat label="Активные (24 ч / 7 дн.)" value={`${data.active1} / ${data.active7}`} />
        <Stat label="Пройдено уроков" value={data.lessonsTotal} sub={`${data.lessons7} за 7 дней`} />
        <Stat label="Retention D1 / D7" value={`${data.retention.d1 ?? '—'}% / ${data.retention.d7 ?? '—'}%`} />
        <Stat label="Premium-подписчиков" value={data.premium} />
        <Stat label="Доход за 30 дней" value={`⭐ ${data.revenue30Stars}`} sub={`${data.payments30} платежей · всего ⭐ ${data.revenueAllStars}`} />
        <Stat label="Средний прогресс" value={`${data.avgXp} XP`} sub={`${data.avgLessons} уроков · ${data.avgWords} слов`} />
      </div>
      <div className="panel p-4">
        <h2 className="mb-3 font-bold">Регистрации в приложении за 30 дней</h2>
        <div className="flex h-32 items-end gap-1" role="img" aria-label="Регистрации по дням">
          {data.signups.map((s: any) => (
            <div key={s.day} title={`${s.day}: ${s.count}`} className="flex-1 rounded-t bg-emerald-500" style={{ height: `${(s.count / maxS) * 100}%`, minHeight: 2 }} />
          ))}
        </div>
      </div>
      <WarmAudio />
      <CompareVoices />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="panel">
          <h2 className="border-b p-3 font-bold">Популярные уроки</h2>
          <table className="w-full">
            <tbody>
              {data.topLessons.map((l: any) => (
                <tr key={l.slug} className="border-b last:border-0">
                  <td className="td">{l.title?.ru || l.title?.uk}</td>
                  <td className="td text-right font-bold">{l.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="panel">
          <h2 className="border-b p-3 font-bold">Частые ошибки</h2>
          <table className="w-full">
            <thead>
              <tr>
                <th className="th">Урок</th>
                <th className="th">Тип</th>
                <th className="th text-right">Ошибок</th>
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
          + Добавить
        </Link>
      </div>
      <input className="inp max-w-sm" placeholder="Поиск…" defaultValue={params.get('search') ?? ''} onKeyDown={(e) => e.key === 'Enter' && setParams({ ...Object.fromEntries(params), search: (e.target as HTMLInputElement).value })} />
      {[...params.entries()].filter(([k]) => k !== 'search').length > 0 && (
        <button className="btn-s" onClick={() => setParams({})}>
          ✕ Сбросить фильтры
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
                <td className="td">Загрузка…</td>
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
                      упражнения
                    </Link>
                  )}
                  {def.name === 'routes' && (
                    <Link className="mr-3 text-emerald-700 underline" to={`/r/lessons?routeId=${r.id}`}>
                      уроки
                    </Link>
                  )}
                  {def.name === 'cities' && (
                    <Link className="mr-3 text-emerald-700 underline" to={`/r/routes?cityId=${r.id}`}>
                      маршруты
                    </Link>
                  )}
                  {def.name === 'quests' && r.kind === 'STORY' && (
                    <Link className="mr-3 text-emerald-700 underline" to={`/r/questSteps?questId=${r.id}`}>
                      этапы
                    </Link>
                  )}
                  {def.name === 'campaigns' && r.status === 'DRAFT' && <SendCampaign id={r.id} />}
                  <Link className="text-sky-700 underline" to={`/r/${def.name}/${r[def.idField ?? 'id']}`}>
                    изменить
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-slate-500">Всего: {data?.total ?? 0}</p>
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
        if (!confirm('Отправить рассылку всем пользователям, которые согласились на уведомления?')) return;
        try {
          await api(`/campaigns/${id}/send`, { body: {} });
          setSent(true);
        } catch (e) {
          alert((e as Error).message);
        }
      }}
    >
      {sent ? 'отправляется…' : 'отправить'}
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

  if (!form) return <p>{msg || 'Загрузка…'}</p>;
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
      setMsg('✅ Сохранено');
      if (isNew) nav(`/r/${def.name}/${r[def.idField ?? 'id']}`, { replace: true });
    } catch (e) {
      setMsg(`❌ ${(e as Error).message}`);
    }
  };
  const remove = async () => {
    if (!confirm('Удалить запись? Это необратимо.')) return;
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
          {def.title}: {isNew ? 'новая запись' : show(form.slug ?? form.pl ?? form.code ?? form.title, true)}
        </h1>
      </div>
      {def.name === 'exercises' && (
        <div className="panel flex flex-wrap items-center gap-2 p-3 text-sm">
          <span className="font-semibold">Шаблон данных для типа {form.type}:</span>
          <button
            className="btn-s"
            onClick={() => {
              set('data', EXERCISE_TEMPLATES[form.type] ?? {});
              setKey((k) => k + 1);
            }}
          >
            Вставить шаблон
          </button>
          <span className="text-slate-500">Правильный ответ хранится в данных и никогда не отправляется игроку до проверки.</span>
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
          Сохранить
        </button>
        {!isNew && (
          <button className="btn-d" onClick={remove}>
            Удалить
          </button>
        )}
        <span className="text-sm">{msg}</span>
      </div>
      {def.name === 'lessons' && !isNew && (
        <Link className="btn-s" to={`/r/exercises?lessonId=${id}`}>
          Упражнения урока →
        </Link>
      )}
    </div>
  );
}

const AUDIENCE_FILTERS: [string, string][] = [
  ['all', 'Все'],
  ['bot_only', 'Только бот'],
  ['app', 'Открыли приложение'],
  ['bot', 'Писали боту'],
  ['blocked', 'Заблокировали бота'],
];
const AUDIENCE_PERIODS: [number, string][] = [[0, 'за всё время'], [1, 'за сутки'], [7, 'за 7 дней'], [30, 'за 30 дней']];
const COMMANDS: Record<string, string> = { start: '/start', text: 'сообщение', button: 'кнопка', payment: 'оплата' };

/** Откуда пришёл человек — по первому параметру /start. */
function source(p: string | null) {
  if (!p) return '—';
  if (p.startsWith('ref_')) return 'по приглашению';
  if (p === 'quiz') return 'ссылка на /quiz';
  if (p.startsWith('screen_')) return `ссылка на экран «${p.slice(7)}»`;
  return p;
}

/** «5 мин назад», «вчера», дата — для последней активности. */
function ago(ms: number) {
  const min = Math.round((Date.now() - ms) / 60_000);
  if (min < 1) return 'только что';
  if (min < 60) return `${min} мин назад`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} ч назад`;
  const d = Math.round(h / 24);
  if (d === 1) return 'вчера';
  if (d < 7) return `${d} дн. назад`;
  return new Date(ms).toLocaleDateString('ru');
}

type Person = {
  telegramId: string; userId: string | null; firstName: string; lastName: string | null; username: string | null; language: string | null;
  inBot: boolean; appOpened: boolean; blockedAt: number | null; banned: boolean; startParam: string | null; lastCommand: string | null;
  firstAt: number; lastAt: number; lessons: number; xp: number; city: string | null;
};

/** Узкий экран (телефон): списки показываются карточками, а не широкой таблицей. */
function useNarrow() {
  const query = '(max-width: 767px)';
  const [narrow, setNarrow] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const m = window.matchMedia(query);
    const on = () => setNarrow(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return narrow;
}

const personName = (p: Person) => [p.firstName, p.lastName].filter(Boolean).join(' ') || 'без имени';
const personStatus = (p: Person) =>
  p.blockedAt ? <span className="text-rose-700">заблокировал бота</span> : p.banned ? <span className="text-rose-700">заблокирован админом</span> : p.inBot ? '✓ в боте' : '—';
const personApp = (p: Person) =>
  p.appOpened ? (
    <>
      ✓ открыл{p.userId && <> · <Link className="text-sky-700 underline" to={`/users/${p.userId}`}>профиль</Link></>}
      <div className="text-xs text-slate-500">уроков: {p.lessons} · {p.xp} XP{p.city ? ` · ${p.city}` : ''}</div>
    </>
  ) : (
    <span className="text-slate-500">не открывал</span>
  );
const personContact = (p: Person) => (
  <>
    {p.username ? <a className="text-sky-700 underline" href={`https://t.me/${p.username}`} target="_blank" rel="noreferrer">@{p.username}</a> : 'без @username'}
    {' · '}<span className="font-mono">{p.telegramId}</span>
  </>
);
const cameAt = (p: Person) => new Date(p.firstAt).toLocaleString('ru', { dateStyle: 'short', timeStyle: 'short' });
const lastSeen = (p: Person) => `${ago(p.lastAt)}${p.lastCommand ? ` · ${COMMANDS[p.lastCommand] ?? `/${p.lastCommand}`}` : ''}`;

/** Аудитория бота: все, кто писал боту или открывал приложение, — счётчики, фильтры, поиск, «показать ещё». */
function Audience() {
  const narrow = useNarrow();
  const [filter, setFilter] = useState('all');
  const [days, setDays] = useState(0);
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [data, setData] = useState<{ summary: Record<string, number>; total: number; items: Person[] } | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(
    async (skip: number) => {
      setBusy(true);
      try {
        const r = await api(`/audience?filter=${filter}&days=${days}&search=${encodeURIComponent(q)}&skip=${skip}`);
        setData((prev) => ({ ...r, items: skip && prev ? [...prev.items, ...r.items] : r.items }));
        setError('');
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setBusy(false);
      }
    },
    [filter, days, q],
  );
  useEffect(() => void load(0), [load]);
  const s = data?.summary;
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black">Аудитория бота</h1>
        <p className="text-sm text-slate-500">
          Все, кто писал боту или открывал приложение. Сообщения боту учитываются с выкладки этой версии; раньше сохранялись только пользователи приложения и
          игроки /quiz — они здесь тоже есть.
        </p>
      </div>
      {s && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4" data-audience-summary>
          <Stat label="Всего людей" value={s.total} sub={`активны за 7 дней: ${s.active7}`} />
          <Stat label="Новые" value={`${s.new1} / ${s.new7} / ${s.new30}`} sub="за сутки / 7 дней / 30 дней" />
          <Stat label="Открыли приложение" value={s.app} sub={s.total ? `${Math.round((s.app / s.total) * 100)}% от всех` : undefined} />
          <Stat label="Только бот" value={s.botOnly} sub={`заблокировали бота: ${s.blocked}`} />
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {AUDIENCE_FILTERS.map(([id, label]) => (
          <button key={id} className={filter === id ? 'btn-p' : 'btn-s'} onClick={() => setFilter(id)}>
            {label}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <select className="inp md:w-auto" value={days} onChange={(e) => setDays(Number(e.target.value))} aria-label="Период">
          {AUDIENCE_PERIODS.map(([d, label]) => (
            <option key={d} value={d}>
              Пришли {label}
            </option>
          ))}
        </select>
        <form onSubmit={(e) => { e.preventDefault(); setQ(search.trim()); }} className="flex min-w-0 gap-2 md:max-w-md md:flex-1">
          <input className="inp" placeholder="Имя, @username или Telegram ID" value={search} onChange={(e) => setSearch(e.target.value)} />
          <button className="btn-p">Найти</button>
        </form>
      </div>
      {error && <p className="text-rose-600">{error}</p>}
      {narrow ? (
        <div className="space-y-2">
          {data?.items.map((p) => (
            <div key={p.telegramId} className="panel space-y-1 p-3 text-sm" data-audience-row={p.telegramId}>
              <div className="flex items-start justify-between gap-2">
                <div className="font-semibold">{personName(p)}</div>
                <div className="shrink-0 text-xs">{personStatus(p)}</div>
              </div>
              <div className="text-xs text-slate-500">{personContact(p)}</div>
              <div className="text-xs text-slate-500">Пришёл {cameAt(p)} · {lastSeen(p)}</div>
              {p.startParam && <div className="text-xs">Откуда: {source(p.startParam)}</div>}
              <div className="flex items-start justify-between gap-2">
                <div>{personApp(p)}</div>
                <div className="text-xs text-slate-500">{p.language?.toUpperCase() ?? ''}</div>
              </div>
            </div>
          ))}
          {data && !data.items.length && <p className="text-slate-400">Никого не нашлось</p>}
        </div>
      ) : (
        <div className="panel overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-slate-50">
              <tr>
                {['Человек', 'Пришёл', 'Активность', 'Откуда', 'Приложение', 'Язык', 'Статус'].map((h) => (
                  <th key={h} className="th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.items.map((p) => (
                <tr key={p.telegramId} className="border-b align-top" data-audience-row={p.telegramId}>
                  <td className="td">
                    <div className="font-semibold">{personName(p)}</div>
                    <div className="text-xs text-slate-500">{personContact(p)}</div>
                  </td>
                  <td className="td whitespace-nowrap">{cameAt(p)}</td>
                  <td className="td whitespace-nowrap">
                    {ago(p.lastAt)}
                    {p.lastCommand && <div className="text-xs text-slate-500">{COMMANDS[p.lastCommand] ?? `/${p.lastCommand}`}</div>}
                  </td>
                  <td className="td">{source(p.startParam)}</td>
                  <td className="td">{personApp(p)}</td>
                  <td className="td">{p.language?.toUpperCase() ?? '—'}</td>
                  <td className="td whitespace-nowrap">{personStatus(p)}</td>
                </tr>
              ))}
              {data && !data.items.length && (
                <tr>
                  <td className="td text-slate-400" colSpan={7}>Никого не нашлось</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-500">Показано {data?.items.length ?? 0} из {data?.total ?? 0}</span>
        {data && data.items.length < data.total && (
          <button className="btn-s" disabled={busy} onClick={() => void load(data.items.length)}>
            {busy ? 'Загрузка…' : 'Показать ещё'}
          </button>
        )}
        {busy && !data && <span className="text-sm">Загрузка…</span>}
      </div>
    </div>
  );
}

function Users() {
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const { data, error } = useLoad(() => api(`/users?search=${encodeURIComponent(q)}`), [q]);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">Пользователи приложения</h1>
      <p className="text-sm text-slate-500">Те, у кого есть аккаунт в Mini App. Всех, кто писал боту, — в разделе <Link className="text-sky-700 underline" to="/audience">«Аудитория бота»</Link>.</p>
      <form onSubmit={(e) => { e.preventDefault(); setQ(search); }} className="flex max-w-md gap-2">
        <input className="inp" placeholder="Имя, @username или Telegram ID" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className="btn-p">Найти</button>
      </form>
      {error && <p className="text-rose-600">{error}</p>}
      <div className="panel overflow-x-auto">
        <table className="w-full">
          <thead className="border-b bg-slate-50">
            <tr>
              {['Пользователь', 'Telegram ID', 'Уровень', 'XP', 'Польский', 'Premium', 'Создан', ''].map((h) => (
                <th key={h} className="th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data?.items.map((u: any) => (
              <tr key={u.id} className="border-b">
                <td className="td">{u.firstName} {u.username && <span className="text-slate-400">@{u.username}</span>} {u.isBanned && <span className="rounded bg-rose-100 px-1 text-rose-700">заблокирован</span>}</td>
                <td className="td font-mono">{u.telegramId}</td>
                <td className="td">{u.progress?.playerLevel}</td>
                <td className="td">{u.progress?.xpTotal}</td>
                <td className="td">{u.progress?.languageLevel}</td>
                <td className="td">{u.subscriptions.length ? '👑' : '—'}</td>
                <td className="td">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="td"><Link className="text-sky-700 underline" to={`/users/${u.id}`}>подробнее</Link></td>
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
  if (!u) return <p>Загрузка…</p>;
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
        <Stat label="Уровень" value={u.progress?.playerLevel} />
        <Stat label="XP" value={u.progress?.xpTotal} />
        <Stat label="Польский" value={u.progress?.languageLevel} />
        <Stat label="Серия" value={`${u.progress?.streakCurrent} (рекорд ${u.progress?.streakBest})`} />
        <Stat label="Złotki" value={u.wallet?.balance} />
      </div>
      <div className="panel flex flex-wrap items-center gap-3 p-4">
        <button className="btn-d" onClick={() => { const reason = u.isBanned ? undefined : prompt('Причина блокировки') ?? undefined; void act(`/users/${id}/ban`, { banned: !u.isBanned, reason }); }}>
          {u.isBanned ? 'Разблокировать' : 'Заблокировать'}
        </button>
        {admin.role === 'SUPERADMIN' && (
          <>
            <input className="inp w-24" type="number" value={days} onChange={(e) => setDays(Number(e.target.value))} />
            <button className="btn-p" onClick={() => act(`/users/${id}/premium`, { days })}>Выдать Premium (дней)</button>
            <button className="btn-s" onClick={() => act(`/users/${id}/premium`, { revoke: true })}>Отменить Premium</button>
          </>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Table title="Города" rows={u.cities} cols={[['city.namePl', 'Город'], ['unlockedAt', 'Открыт'], ['bossPassedAt', 'Экзамен']]} />
        <Table title="Подписки" rows={u.subscriptions} cols={[['planCode', 'План'], ['status', 'Статус'], ['expiresAt', 'До']]} />
        <Table title="Сессии обучения" rows={u.sessions} cols={[['mode', 'Режим'], ['lesson.slug', 'Урок'], ['correct', '✓'], ['total', 'Σ'], ['xpAwarded', 'XP'], ['startedAt', 'Начало']]} />
        <Table title="Начисления XP" rows={u.xpEvents} cols={[['reason', 'Причина'], ['amount', 'XP'], ['createdAt', 'Когда']]} />
        <Table title="Кошелёк" rows={u.transactions} cols={[['reason', 'Причина'], ['amount', 'Сумма'], ['createdAt', 'Когда']]} />
        <Table title="Платежи" rows={u.payments} cols={[['type', 'Событие'], ['planCode', 'План'], ['amount', '⭐'], ['error', 'Ошибка'], ['createdAt', 'Когда']]} />
      </div>
    </div>
  );
}

function Table({ title, rows, cols }: { title: string; rows: any[]; cols: [string, string][] }) {
  const fmt = (v: any) => (typeof v === 'string' && /^\d{4}-\d\d-\d\dT/.test(v) ? new Date(v).toLocaleString('ru') : show(v));
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
  if (!data) return <p>Загрузка…</p>;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">Платежи и подписки</h1>
      <div className="flex flex-wrap gap-2">
        {data.subscriptions.map((s: any) => (
          <span key={`${s.status}${s.planCode}`} className="rounded-full bg-white px-3 py-1 text-sm shadow-sm">
            {s.planCode} · {s.status}: <b>{s.count}</b>
          </span>
        ))}
      </div>
      <Table title={`Журнал платёжных событий (${data.total})`} rows={data.items} cols={[['createdAt', 'Когда'], ['type', 'Событие'], ['user.firstName', 'Пользователь'], ['planCode', 'План'], ['amount', '⭐'], ['chargeId', 'Charge ID'], ['error', 'Ошибка']]} />
    </div>
  );
}

function Rewards() {
  const { data, error } = useLoad(() => api('/config/rewards'), []);
  const [form, setForm] = useState<Record<string, number> | null>(null);
  const [msg, setMsg] = useState('');
  useEffect(() => setForm(data), [data]);
  if (error) return <p className="text-rose-600">{error}</p>;
  if (!form) return <p>Загрузка…</p>;
  const labels: Record<string, string> = {
    exerciseXp: 'XP за правильное упражнение', lessonXp: 'XP за урок', perfectBonusXp: 'Бонус за идеальный урок', dailyQuestXp: 'XP ежедневного квеста (справочно)',
    weeklyQuestXp: 'XP недельного квеста (справочно)', storyQuestXp: 'XP сюжетного квеста (справочно)', cityExamXp: 'XP за экзамен города', lessonZlotki: 'Złotki за урок',
    perfectZlotki: 'Złotki за идеальный урок', dailyQuestZlotki: 'Złotki ежедневного квеста (справочно)', storyQuestZlotki: 'Złotki сюжета (справочно)', cityExamZlotki: 'Złotki за экзамен города',
    replayFactor: 'Доля XP за повтор урока (0–1)', maxRewardedReplaysPerDay: 'Повторов урока с наградой в сутки', practiceXpDailyCap: 'Лимит XP тренировок в день',
    freeAiMessagesPerDay: 'AI-сообщений в день (Free)', premiumAiMessagesPerDay: 'AI-сообщений в день (Premium)',
  };
  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-black">Награды и лимиты</h1>
      <p className="text-sm text-slate-500">Награды квестов задаются в каждом квесте отдельно. Изменения применяются в течение 30 секунд.</p>
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
            setMsg('✅ Сохранено');
          } catch (e) {
            setMsg(`❌ ${(e as Error).message}`);
          }
        }}
      >
        Сохранить
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
    if (mode === 'rotate' && !confirm('Сгенерировать новый секрет webhook? Старый перестанет действовать через 10 минут после подтверждения Telegram.')) return;
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
      {loading && <p>Проверка…</p>}
      {report && (
        <div className="grid gap-3 md:grid-cols-3">
          <Stat label="Бот" value={report.bot ? `@${report.bot.username}` : '—'} sub={report.ok ? 'Telegram отвечает' : 'есть ошибки'} />
          <Stat label="Webhook" value={wh?.url ? (wh.allowedUpdates.length === 0 || wh.allowedUpdates.includes('callback_query') ? '✅ с кнопками' : '⚠️ без callback_query') : '❌ не установлен'} sub={wh ? `очередь: ${wh.pending}` : undefined} />
          <Stat label="Секрет webhook" value={report.secretGeneration ? `поколение ${report.secretGeneration}` : 'из переменной Cloudflare'} sub={report.secretGeneration ? (report.secretConfirmed ? 'подтверждён Telegram' : 'ждёт подтверждения') : 'перейдёт на серверный при настройке'} />
        </div>
      )}
      {wh?.lastError && <p className="text-sm text-amber-700">Последняя ошибка доставки: {wh.lastError} ({wh.lastErrorAt})</p>}
      {report?.hints?.length > 0 && (
        <ul className="list-disc pl-5 text-sm">
          {report.hints.map((h: string) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap gap-2">
        <button className="btn-s" disabled={!!busy} onClick={reload}>Проверить</button>
        <button className="btn-p" disabled={!!busy} onClick={() => run('setup')}>{busy === 'setup' ? 'Настройка…' : 'Настроить бота'}</button>
        <button className="btn-s" disabled={!!busy} onClick={() => run('rotate')}>{busy === 'rotate' ? 'Смена…' : 'Сменить секрет webhook'}</button>
      </div>
      {data?.maintenance && <p className="text-xs text-slate-500">Автопроверка cron: {new Date(data.maintenance.checkedAt).toLocaleString('ru')} · {data.maintenance.webhook} {data.maintenance.error ? `· ${data.maintenance.error}` : ''}</p>}
      {result && <pre className="panel overflow-auto p-3 text-xs">{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}

function Audit() {
  const { data, error } = useLoad(() => api('/audit'), []);
  if (error) return <p className="text-rose-600">{error}</p>;
  return <Table title="Журнал действий администраторов" rows={data ?? []} cols={[['createdAt', 'Когда'], ['admin.email', 'Админ'], ['action', 'Действие'], ['entity', 'Объект'], ['entityId', 'ID'], ['details', 'Детали']]} />;
}

function Admins() {
  const { data, reload } = useLoad(() => api('/admins'), []);
  const [f, setF] = useState({ email: '', name: '', role: 'EDITOR', password: '' });
  return (
    <div className="space-y-4">
      <Table title="Администраторы" rows={data ?? []} cols={[['email', 'Email'], ['name', 'Имя'], ['role', 'Роль'], ['isActive', 'Активен'], ['lastLoginAt', 'Вход']]} />
      <div className="panel grid max-w-2xl gap-2 p-4 md:grid-cols-2">
        <input className="inp" placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <input className="inp" placeholder="Имя" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <select className="inp" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}>
          <option>EDITOR</option>
          <option>SUPPORT</option>
          <option>SUPERADMIN</option>
        </select>
        <input className="inp" type="password" placeholder="Пароль (мин. 10 символов)" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        <button className="btn-p" onClick={async () => { try { await api('/admins', { body: f }); reload(); } catch (e) { alert((e as Error).message); } }}>
          Добавить администратора
        </button>
      </div>
    </div>
  );
}

export function App() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [checked, setChecked] = useState(!hasToken());
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    if (hasToken()) api<Admin>('/me').then(setAdmin).catch(() => setToken(null)).finally(() => setChecked(true));
  }, []);
  const nav = useMemo(() => {
    if (!admin) return [];
    const r = admin.role;
    const items: [string, string][] = [['/', '📊 Обзор']];
    if (r !== 'SUPPORT') for (const d of RESOURCES.filter((x) => x.name !== 'plans' && x.name !== 'campaigns')) items.push([`/r/${d.name}`, d.title]);
    if (r !== 'EDITOR') items.push(['/audience', '🤝 Аудитория бота'], ['/users', '👥 Пользователи'], ['/payments', '⭐ Платежи']);
    if (r === 'SUPERADMIN') items.push(['/r/plans', '👑 Тарифы'], ['/r/campaigns', '📣 Рассылки'], ['/rewards', '🎁 Награды'], ['/bot', '🤖 Бот'], ['/audit', '📜 Журнал действий'], ['/admins', '🔐 Администраторы']);
    return items;
  }, [admin]);

  if (!checked) return null;
  if (!admin) return <Login onLogin={setAdmin} />;
  return (
    <div className="min-h-screen md:flex">
      {/* На телефоне меню прячется за кнопкой, на широком экране — колонка слева. */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-4 py-2 md:hidden">
        <span className="text-lg font-black">
          <span className="text-rose-600">POLSKI</span> <span className="text-amber-500">GO</span>
        </span>
        <button className="btn-s" aria-expanded={menu} onClick={() => setMenu((m) => !m)}>
          {menu ? '✕ Закрыть' : '☰ Меню'}
        </button>
      </header>
      <aside className={`${menu ? 'block' : 'hidden'} shrink-0 border-b bg-white p-3 md:block md:w-56 md:border-b-0 md:border-r`}>
        <div className="mb-4 hidden px-2 text-lg font-black md:block">
          <span className="text-rose-600">POLSKI</span> <span className="text-amber-500">GO</span>
        </div>
        <nav className="space-y-0.5">
          {nav.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={() => setMenu(false)} className={({ isActive }) => `block rounded-lg px-3 py-1.5 text-sm ${isActive ? 'bg-emerald-50 font-bold text-emerald-700' : 'hover:bg-slate-100'}`}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-6 border-t px-2 pt-3 text-xs text-slate-500">
          {admin.email}
          <br />
          {admin.role}
          <button className="mt-2 block text-rose-600 underline" onClick={() => { setToken(null); location.reload(); }}>
            Выйти
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          {RESOURCES.map((d) => (
            <Route key={d.name} path={`/r/${d.name}`} element={<ResourceList def={d} />} />
          ))}
          {RESOURCES.map((d) => (
            <Route key={`${d.name}-e`} path={`/r/${d.name}/:id`} element={<ResourceEdit def={d} />} />
          ))}
          <Route path="/audience" element={<Audience />} />
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
