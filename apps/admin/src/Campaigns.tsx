/**
 * «Рассылки» (обновление 2026-11-13). Раньше — общая таблица и «отправить» без проверки. Теперь:
 *  • сколько человек получат сообщение и на каком языке — до отправки;
 *  • предпросмотр как в Telegram: тот же текст и та же кнопка «🚀 POLSKI GO»;
 *  • пробное сообщение себе (или любому игроку по Telegram ID / @username) — ровно то, что получат все;
 *  • ход отправки с полосой, остановка идущей рассылки; отправленная рассылка не меняется и не удаляется (сервер это проверяет).
 */
import { useEffect, useState } from 'react';
import { api } from './api';
import { useFeedback } from './feedback';
import { Badge, Card, Empty, Field, LoadError, PageHeader, Segmented, Skeleton, Time, cx, fmt, useLoad, type Tone } from './ui';

type Lang = 'uk' | 'ru' | 'en';
type Campaign = { id: string; kind: string; title: string; message: Partial<Record<Lang, string>>; status: string; sentCount: number; sentAt: string | null; createdAt: string };
type Audience = { total: number; byLang: Record<string, number> };

const KIND: Record<string, string> = { new_lessons: 'новые уроки', new_city: 'новый город', event: 'событие', challenge: 'испытание', reminder: 'напоминание' };
const STATUS: Record<string, [string, Tone]> = { DRAFT: ['черновик', 'gray'], SENDING: ['отправляется', 'sky'], SENT: ['отправлена', 'green'], CANCELLED: ['остановлена', 'gold'] };
const LANGS: [Lang, string][] = [
  ['uk', 'Українська'],
  ['ru', 'Русский'],
  ['en', 'English'],
];
const LANG_SHORT: Record<string, string> = { uk: 'укр.', ru: 'рус.', en: 'англ.' };
const MAX = 4000;
const TEST_KEY = 'pg_admin_test_recipient';

function readTestRecipient() {
  try {
    return localStorage.getItem(TEST_KEY) ?? '';
  } catch {
    return '';
  }
}
function saveTestRecipient(v: string) {
  try {
    localStorage.setItem(TEST_KEY, v);
  } catch {
    /* в приватном окне хранилища может не быть */
  }
}

/** Пузырь сообщения бота: текст как есть (без разметки — бот шлёт обычный текст) и кнопка под ним. */
function Preview({ text }: { text: string }) {
  return (
    <div className="rounded-2xl bg-[#d7e6f2] p-4" data-campaign-preview>
      <div className="max-w-sm">
        <div className="whitespace-pre-wrap break-words rounded-2xl rounded-bl-md bg-white px-3.5 py-2.5 text-[14px] leading-snug text-slate-900 shadow-sm">
          {text || <span className="text-slate-400">Текст сообщения появится здесь</span>}
        </div>
        <div className="mt-1 rounded-xl bg-white/70 py-2 text-center text-[13px] font-semibold text-[#2a6fb0] shadow-sm">🚀 POLSKI GO</div>
      </div>
    </div>
  );
}

function AudienceLine({ a }: { a: Audience }) {
  const parts = Object.entries(a.byLang)
    .sort((x, y) => y[1] - x[1])
    .map(([l, n]) => `${LANG_SHORT[l] ?? l} ${fmt(n)}`);
  return (
    <span>
      <b className="text-night">{fmt(a.total)}</b> чел.{parts.length > 0 && <span className="text-slate-500"> · {parts.join(' · ')}</span>}
    </span>
  );
}

function Editor({ initial, audience, onClose }: { initial: Campaign | null; audience: Audience; onClose: (saved: boolean) => void }) {
  const { run } = useFeedback();
  const [f, setF] = useState({ title: initial?.title ?? '', kind: initial?.kind ?? 'new_lessons', message: { uk: '', ru: '', en: '', ...initial?.message } as Record<Lang, string> });
  const [lang, setLang] = useState<Lang>('uk');
  const [busy, setBusy] = useState(false);
  const missing = LANGS.filter(([l]) => l !== 'uk' && !f.message[l].trim() && (audience.byLang[l] ?? 0) > 0);
  const save = async () => {
    setBusy(true);
    const body = { title: f.title.trim(), kind: f.kind, message: Object.fromEntries(Object.entries(f.message).filter(([, v]) => v.trim())) };
    const ok = await run(() => (initial ? api(`/resources/campaigns/${initial.id}`, { method: 'PATCH', body }) : api('/resources/campaigns', { body })), 'Черновик сохранён');
    setBusy(false);
    if (ok) onClose(true);
  };
  return (
    <Card title={initial ? 'Изменить черновик' : 'Новая рассылка'} subtitle="Сохраните черновик, проверьте сообщение на себе и только потом отправляйте всем." data-campaign-editor>
      <form
        className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]"
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_200px]">
            <Field label="Название" hint="видно только в админке">
              <input className="inp" required maxLength={100} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
            </Field>
            <Field label="Повод">
              <select className="inp" value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}>
                {Object.entries(KIND).map(([k, t]) => (
                  <option key={k} value={k}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold text-slate-700">Текст сообщения</span>
              <Segmented label="Язык текста" value={lang} onChange={setLang} options={LANGS.map(([l, t]) => [l, `${t}${f.message[l].trim() ? '' : l === 'uk' ? ' *' : ''}`])} />
            </div>
            <label className="sr-only" htmlFor="camp-text">
              Текст: {LANGS.find((x) => x[0] === lang)![1]}
            </label>
            <textarea
              id="camp-text"
              className="inp min-h-40"
              required={lang === 'uk'}
              maxLength={MAX}
              value={f.message[lang]}
              placeholder={lang === 'uk' ? 'Обязательный язык: его получат все, у кого нет перевода' : 'Необязательно: без перевода игрок получит украинский текст'}
              onChange={(e) => setF({ ...f, message: { ...f.message, [lang]: e.target.value } })}
            />
            <div className="mt-1 flex flex-wrap justify-between gap-2 text-xs text-slate-500">
              <span>Обычный текст: ссылки и эмодзи можно, разметки нет.</span>
              <span className={cx(f.message[lang].length > MAX - 200 && 'font-semibold text-[#b42336]')}>
                {fmt(f.message[lang].length)} / {fmt(MAX)}
              </span>
            </div>
            {missing.length > 0 && (
              <p className="mt-2 text-xs text-[#7a4d00]">
                Нет перевода: {missing.map(([l, t]) => `${t} (${fmt(audience.byLang[l] ?? 0)} чел.)`).join(', ')} — они получат украинский текст.
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="btn-p" disabled={busy || !f.title.trim() || !f.message.uk.trim()}>
              {busy ? 'Сохранение…' : 'Сохранить черновик'}
            </button>
            <button type="button" className="btn-s" onClick={() => onClose(false)}>
              Отмена
            </button>
          </div>
        </div>
        <div>
          <div className="mb-2 text-sm font-semibold text-slate-700">Так увидит игрок</div>
          <Preview text={f.message[lang] || (lang !== 'uk' ? f.message.uk : '')} />
          <p className="mt-2 text-xs text-slate-500">Кнопка открывает приложение. Получат: <AudienceLine a={audience} /></p>
        </div>
      </form>
    </Card>
  );
}

function TestSend({ c }: { c: Campaign }) {
  const { toast } = useFeedback();
  const [who, setWho] = useState(readTestRecipient);
  const [lang, setLang] = useState<'' | Lang>('');
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          const r = await api<{ to: { firstName: string | null; username: string | null }; lang: string }>(`/campaigns/${c.id}/test`, { body: { who, ...(lang ? { lang } : {}) } });
          saveTestRecipient(who);
          toast(`Пробное сообщение отправлено: ${r.to.firstName ?? ''}${r.to.username ? ` @${r.to.username}` : ''} (${LANG_SHORT[r.lang] ?? r.lang})`);
        } catch (err) {
          toast((err as Error).message, 'error');
        } finally {
          setBusy(false);
        }
      }}
    >
      <Field label="Проверить на себе" hint="ваш Telegram ID или @username — как в разделе «Пользователи»">
        <input className="inp w-56" required value={who} placeholder="@username" onChange={(e) => setWho(e.target.value)} />
      </Field>
      <Field label="Язык">
        <select className="inp w-40" value={lang} onChange={(e) => setLang(e.target.value as '' | Lang)}>
          <option value="">как у игрока</option>
          {LANGS.map(([l, t]) => (
            <option key={l} value={l}>
              {t}
            </option>
          ))}
        </select>
      </Field>
      <button className="btn-s" disabled={busy || !who.trim()}>
        {busy ? 'Отправка…' : 'Отправить пробное'}
      </button>
    </form>
  );
}

function CampaignCard({ c, audience, onEdit, onChange }: { c: Campaign; audience: Audience; onEdit: () => void; onChange: () => void }) {
  const { confirm, run } = useFeedback();
  const [open, setOpen] = useState(false);
  const [status, tone] = STATUS[c.status] ?? [c.status, 'gray' as Tone];
  const total = Math.max(audience.total, c.sentCount);
  const pct = total ? Math.min(100, Math.round((c.sentCount / total) * 100)) : 0;
  const send = async () => {
    const ok = await confirm({
      title: `Отправить «${c.title}» всем?`,
      body: (
        <>
          <p>
            Сообщение получат <AudienceLine a={audience} />. Отправка идёт частями в течение нескольких минут.
          </p>
          <p>Отменить уже доставленные сообщения нельзя. Если ещё не проверили текст на себе — нажмите «Отмена» и отправьте пробное.</p>
        </>
      ),
      confirm: `Отправить ${fmt(audience.total)} чел.`,
      danger: true,
    });
    if (ok && (await run(() => api(`/campaigns/${c.id}/send`, { body: {} }), 'Рассылка запущена'))) onChange();
  };
  return (
    <Card
      data-campaign={c.status}
      title={
        <span className="flex flex-wrap items-center gap-2">
          {c.title} <Badge tone={tone}>{status}</Badge> <Badge tone="gray">{KIND[c.kind] ?? c.kind}</Badge>
        </span>
      }
      subtitle={
        <>
          создана <Time v={c.createdAt} />
          {c.sentAt && (
            <>
              {' · '}отправлена <Time v={c.sentAt} />
            </>
          )}
        </>
      }
      actions={
        c.status === 'DRAFT' ? (
          <div className="flex flex-wrap gap-2">
            <button className="btn-s" onClick={onEdit}>
              Изменить
            </button>
            <button
              className="btn-s text-[#b42336]"
              onClick={async () => {
                if ((await confirm({ title: `Удалить черновик «${c.title}»?`, confirm: 'Удалить', danger: true })) && (await run(() => api(`/resources/campaigns/${c.id}`, { method: 'DELETE' }), 'Черновик удалён')))
                  onChange();
              }}
            >
              Удалить
            </button>
          </div>
        ) : c.status === 'SENDING' ? (
          <button
            className="btn-d"
            onClick={async () => {
              if (
                (await confirm({ title: 'Остановить рассылку?', body: `Уже получили ${fmt(c.sentCount)} чел. — у них сообщение останется. Остальным оно не уйдёт.`, confirm: 'Остановить', danger: true })) &&
                (await run(() => api(`/campaigns/${c.id}/cancel`, { body: {} }), 'Рассылка остановлена'))
              )
                onChange();
            }}
          >
            Остановить
          </button>
        ) : undefined
      }
    >
      <div className="space-y-4">
        {c.status !== 'DRAFT' && (
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span>
                Доставлено <b className="text-night">{fmt(c.sentCount)}</b>
                {c.status === 'SENDING' && <> из ~{fmt(total)}</>}
              </span>
              {c.status === 'SENDING' && <span className="text-slate-500">{pct} %</span>}
            </div>
            {c.status === 'SENDING' && (
              <div className="h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Ход рассылки">
                <div className="h-full rounded-full bg-gradient-to-r from-brand to-sky transition-all" style={{ width: `${pct}%` }} />
              </div>
            )}
          </div>
        )}
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-3">
            <p className={cx('whitespace-pre-wrap break-words text-sm text-slate-700', !open && 'line-clamp-3')}>{c.message.uk}</p>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {LANGS.map(([l, t]) => (
                <Badge key={l} tone={c.message[l]?.trim() ? 'green' : 'gray'}>
                  {t}: {c.message[l]?.trim() ? 'есть' : 'нет'}
                </Badge>
              ))}
              <button className="link ml-1" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
                {open ? 'свернуть' : 'предпросмотр'}
              </button>
            </div>
            {c.status === 'DRAFT' && (
              <>
                <TestSend c={c} />
                <button className="btn-p" onClick={send} disabled={!audience.total}>
                  Отправить всем · {fmt(audience.total)} чел.
                </button>
              </>
            )}
          </div>
          {open && <Preview text={c.message.ru || c.message.uk || ''} />}
        </div>
      </div>
    </Card>
  );
}

export default function Campaigns() {
  const { data, error, reload } = useLoad<{ items: Campaign[]; audience: Audience }>(() => api('/campaigns'), []);
  const [editing, setEditing] = useState<Campaign | 'new' | null>(null);
  const sending = data?.items.some((c) => c.status === 'SENDING');
  // Пока рассылка идёт, ход обновляется сам.
  useEffect(() => {
    if (!sending) return;
    const t = setInterval(reload, 15_000);
    return () => clearInterval(t);
  }, [sending, reload]);
  return (
    <div className="space-y-5">
      <PageHeader
        title="Рассылки"
        subtitle="Сообщение от бота всем, кто сам включил уведомления. Гости вне Telegram и заблокировавшие бота его не получат."
        actions={
          !editing && (
            <button className="btn-p" onClick={() => setEditing('new')}>
              + Новая рассылка
            </button>
          )
        }
      />
      {error && <LoadError error={error} retry={reload} />}
      {!data ? (
        <Skeleton className="h-48" />
      ) : (
        <>
          <div className="panel flex items-center gap-3 p-4 text-sm" data-campaign-audience>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-soft text-lg" aria-hidden>
              📣
            </span>
            <span className="min-w-0">
              Сейчас рассылку получат: <AudienceLine a={data.audience} />
            </span>
          </div>
          {editing && (
            <Editor
              key={editing === 'new' ? 'new' : editing.id}
              initial={editing === 'new' ? null : editing}
              audience={data.audience}
              onClose={(saved) => {
                setEditing(null);
                if (saved) reload();
              }}
            />
          )}
          {!data.items.length && !editing ? (
            <Empty>Рассылок ещё не было. Нажмите «Новая рассылка», чтобы написать первую.</Empty>
          ) : (
            <div className="space-y-4">
              {data.items.map((c) => (
                <CampaignCard key={c.id} c={c} audience={data.audience} onEdit={() => setEditing(c)} onChange={reload} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
