/**
 * «Вопрос дня» (2026-11-13). Владелец видит все запланированные публикации до запуска и запускает рассылку сам.
 *  • Шапка: включена ли рассылка, время, сколько человек получат и сколько займёт отправка; «Запустить с …» и «Остановить».
 *  • «План»: 30 дней вперёд, по каждому уровню — картинка, вопрос, варианты (верный отмечен), пояснение, «как увидит игрок»;
 *    заменить вопрос или картинку, пропустить день, прислать себе. Прошедшие 7 дней — только смотреть.
 *  • «День»: как прошла рассылка — по уровням и по каждому человеку (дошло, ответил, что выбрал, верно ли); кто не получил и почему,
 *    что пришло вместо вопроса; «Почему не пришло?» — разбор по одному человеку (2026-11-15).
 *  • «Вопросы»: весь банк, сколько раз был вопросом дня, % верных, выключатель.
 * Менять план, запускать и выключать вопросы может только суперадмин (сервер проверяет сам).
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from './api';
import { useFeedback } from './feedback';
import { Badge, Card, DataTable, Empty, Field, LoadError, PageHeader, Segmented, Skeleton, Time, cx, fmt, shortDay, useLoad, type Col, type Tone } from './ui';

type Lang = 'ru' | 'uk' | 'en';
type Level = 'A1' | 'A2' | 'B1';
type QCard = { id: string; level: Level; category: string; categoryName: string; kind: string; image: string; prompt: string; options: string[]; answer: number; explain: string };
type Item = { level: Level; questionId: string; image: string; imageUrl: string; edited: boolean; question: QCard | null; preview: { text: string; buttons: string[] } | null };
type PlanDay = { day: string; sendAt: string; skipped: boolean; editable: boolean; items: Item[] };
type HistDay = { day: string; skipped: boolean; levels: (Item & { sent: number; delivered: number; answered: number; correct: number })[] };
type Exclusion = 'banned' | 'opted_out' | 'blocked' | 'no_chat' | 'paused';
type Overview = {
  state: { enabled: boolean; sendAt: string; startDay: string | null };
  run: { day: string; cursor: number; done: boolean } | null;
  today: string;
  diag: { tickAt: number | null; window: { from: number; to: number; phase: 'before' | 'open' | 'closed' }; nextSendAt: number | null; missedToday: boolean };
  rate: { perRun: number; perHour: number };
  audience: { total: number; byLevel: Record<Level, number>; byLang: Record<string, number>; excluded: Record<Exclusion, number> };
  scenes: { id: string; label: string; imageUrl: string }[];
  plan: PlanDay[];
  history: HistDay[];
};
type BankQ = QCard & { disabled: boolean; timesDaily: number; lastDaily: string | null; answered: number; correctPct: number | null };
type NotSentReason = Exclusion | 'off' | 'waiting';
type Instead = { kind: 'reminder' | 'quiz_invite'; status: string; template: string | null; at: number | null; replacedByDaily: boolean };
type DayRow = { telegramId: number; userId: string | null; name: string; username: string | null; level: Level; lang: string; status: string; reason: NotSentReason | null; error: string | null; sentAt: number | null; answeredAt: number | null; chosenText: string | null; correct: boolean | null; instead: Instead[] };
type DayLevel = { level: Level; questionId: string | null; prompt: string | null; imageUrl: string | null; skipped: boolean; sent: number; delivered: number; blocked: number; noChat: number; failed: number; answered: number; correct: number };
type DaySummary = { people: number; sent: number; notSent: number; notSentBy: Record<NotSentReason, number>; sending: boolean; enabled: boolean; startDay: string | null };
type DayReport = { day: string; levels: DayLevel[]; summary: DaySummary; rows: DayRow[]; more: number | null };
type Explained = { telegramId: number; userId: string | null; name: string; username: string | null; level: Level; lang: string; verdict: string; tone: Tone; steps: string[] };

const LANGS: [Lang, string][] = [
  ['ru', 'Русский'],
  ['uk', 'Українська'],
  ['en', 'English'],
];
const LEVELS: Level[] = ['A1', 'A2', 'B1'];
const EXCLUDED: Record<Exclusion, string> = { blocked: 'заблокировали бота', opted_out: 'выключили вопрос дня', paused: 'пауза (3 без ответа)', no_chat: 'нет чата с ботом', banned: 'заблокированы админом' };
/** Почему вопрос в этот день не отправлялся (вкладка «Не получили»). */
const NOT_SENT: Record<NotSentReason, [string, Tone]> = {
  off: ['рассылка не шла', 'gray'],
  waiting: ['очередь не дошла', 'sky'],
  opted_out: ['выключил вопрос дня', 'gold'],
  blocked: ['заблокировал бота', 'red'],
  no_chat: ['нет чата с ботом', 'gold'],
  paused: ['пауза: 3 без ответа', 'gold'],
  banned: ['заблокирован админом', 'red'],
};
const TEMPLATE: Record<string, string> = { lesson: '«пора на урок»', streak: '«не потеряй серию»', return: '«давно не виделись»', quiz: 'быстрый вопрос' };
function InsteadCell({ list }: { list: Instead[] }) {
  if (!list.length) return <span className="text-slate-500">—</span>;
  return (
    <span className="flex flex-col gap-1">
      {list.map((m, i) => (
        <span key={i} className="text-xs">
          {m.kind === 'quiz_invite' ? (
            <Badge tone={m.status === 'SENT' ? 'sky' : 'gray'}>приглашение к быстрому вопросу{m.status === 'SENT' && m.at ? ` · ${warsawClock(m.at)}` : m.status === 'SENT' ? '' : ' · не дошло'}</Badge>
          ) : m.replacedByDaily ? (
            <Badge tone="gray">напоминание заменено вопросом</Badge>
          ) : (
            <Badge tone={m.status === 'SENT' ? 'gold' : 'gray'}>
              напоминание {m.template ? (TEMPLATE[m.template] ?? m.template) : ''}
              {m.status === 'SENT' && m.at ? ` · ${warsawClock(m.at)}` : m.status === 'SENT' ? '' : ' · не дошло'}
            </Badge>
          )}
        </span>
      ))}
    </span>
  );
}

/** «Почему не пришло?» — разбор по одному человеку за выбранный день (имя, @ник или telegram id). */
function PersonCheck({ day }: { day: string }) {
  const [who, setWho] = useState('');
  const [res, setRes] = useState<Explained[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const check = async () => {
    if (!who.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      setRes((await api<{ people: Explained[] }>(`/daily-quiz/person?who=${encodeURIComponent(who.trim())}&day=${day}`)).people);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Card title="Почему не пришло?" subtitle={`Имя, @ник или Telegram ID — покажем, что этому человеку пришло ${dayTitle(day)} и почему`} data-daily-person>
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void check();
        }}
      >
        <label className="sr-only" htmlFor="daily-who">
          Кого проверить
        </label>
        <input id="daily-who" className="inp min-w-0 flex-1" placeholder="например, @senya или 123456789" value={who} onChange={(e) => setWho(e.target.value)} />
        <button className="btn-p" disabled={busy || !who.trim()}>
          {busy ? 'Проверяю…' : 'Проверить'}
        </button>
      </form>
      {err && <p className="mt-2 text-sm font-semibold text-[#ff9aa8]">{err}</p>}
      {res && res.length === 0 && <p className="mt-3 text-sm text-slate-600">Никого не нашли — проверьте написание или вставьте Telegram ID.</p>}
      {res && res.length > 0 && (
        <ul className="mt-3 space-y-2" data-daily-person-results>
          {res.map((p) => (
            <li key={p.telegramId} className={cx('verdict-card', `verdict-${p.tone}`)}>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {p.userId ? (
                  <Link className="link" to={`/users/${p.userId}`}>
                    {p.name || p.telegramId}
                  </Link>
                ) : (
                  <b>{p.name || p.telegramId}</b>
                )}
                <span className="text-xs text-slate-500">
                  {p.username ? `@${p.username} · ` : ''}
                  {p.telegramId} · {p.level} · {p.userId ? 'приложение' : 'только бот'}
                </span>
              </div>
              <p className="mt-1 text-[15px] font-bold text-night" data-daily-verdict>
                {p.verdict}
              </p>
              {p.steps.length > 0 && (
                <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-slate-600">
                  {p.steps.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

const DELIVERY: Record<string, [string, Tone]> = {
  SENT: ['дошло', 'green'],
  PENDING: ['отправляется', 'sky'],
  BLOCKED: ['заблокировал бота', 'red'],
  NO_CHAT: ['нет чата с ботом', 'gold'],
  FAILED: ['ошибка доставки', 'red'],
  UNKNOWN: ['неизвестно', 'gray'],
};
const TIMES = Array.from({ length: 15 * 4 }, (_, i) => {
  const m = 7 * 60 + i * 15;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
});
const WEEKDAY = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString('ru', { weekday: 'short', timeZone: 'UTC' });
const dayTitle = (d: string) => `${WEEKDAY(d)}, ${shortDay(d)}`;
const pct = (a: number, b: number) => (b ? `${Math.round((a * 100) / b)} %` : '—');
const TEST_KEY = 'pg_admin_test_recipient';
const readTest = () => {
  try {
    return localStorage.getItem(TEST_KEY) ?? '';
  } catch {
    return '';
  }
};
const saveTest = (v: string) => {
  try {
    localStorage.setItem(TEST_KEY, v);
  } catch {
    /* приватное окно */
  }
};
function duration(total: number, perHour: number) {
  const min = Math.ceil((total / Math.max(1, perHour)) * 60);
  return min < 60 ? `≈ ${Math.max(1, min)} мин` : `≈ ${Math.floor(min / 60)} ч ${min % 60} мин`;
}

/** Сообщение как в Telegram: фото, подпись, кнопки. */
function Bubble({ imageUrl, text, buttons }: { imageUrl: string; text: string; buttons: string[] }) {
  return (
    <div className="rounded-2xl bg-[#d7e6f2] p-3" data-daily-preview>
      <div className="max-w-sm overflow-hidden rounded-2xl rounded-bl-md bg-white shadow-sm">
        <img src={imageUrl} alt="" className="aspect-video w-full object-cover" loading="lazy" />
        <div className="whitespace-pre-wrap break-words px-3.5 py-2.5 text-[13px] leading-snug text-[#111827]">{text}</div>
      </div>
      <div className="mt-1 grid max-w-sm gap-1">
        {buttons.map((b, i) => (
          <div key={i} className="rounded-xl bg-white/70 px-2 py-1.5 text-center text-[12.5px] font-semibold text-[#1f5f9e] shadow-sm">
            {b}
          </div>
        ))}
      </div>
    </div>
  );
}

const warsawStamp = (ms: number) => new Date(ms).toLocaleString('ru-RU', { timeZone: 'Europe/Warsaw', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
const warsawClock = (ms: number) => new Date(ms).toLocaleTimeString('ru-RU', { timeZone: 'Europe/Warsaw', hour: '2-digit', minute: '2-digit' });

/** Почему вопрос мог не прийти: расписание живо? когда ближайшая отправка? не закрыто ли окно сегодня? */
function Diag({ o }: { o: Overview }) {
  const d = o.diag;
  const age = d.tickAt === null ? null : Math.round((Date.now() - d.tickAt) / 60_000);
  const cronDead = d.tickAt === null || (age ?? 0) > 15;
  return (
    <div className="space-y-1" data-daily-diag>
      {o.state.enabled && d.nextSendAt !== null && (
        <p className="text-xs text-slate-600">
          {d.window.phase === 'open' && d.nextSendAt <= Date.now() ? <>Окно отправки открыто до {warsawClock(d.window.to)} (Варшава).</> : <>Ближайшая отправка: <b>{warsawStamp(d.nextSendAt)}</b> по Варшаве.</>}
        </p>
      )}
      {d.missedToday && (
        <p className="text-xs font-semibold text-[#ffd27a]" data-daily-missed>
          Сегодня вопрос не уйдёт: окно отправки ({warsawClock(d.window.from)}–{warsawClock(d.window.to)}) уже закрылось, а отправка не начиналась. Следующая — завтра в {warsawClock(d.window.from)}.
        </p>
      )}
      {o.state.enabled && cronDead ? (
        <p className="text-xs font-semibold text-[#ffb08a]" data-daily-cron="dead">
          {d.tickAt === null ? 'Расписание (cron раз в минуту) ещё не срабатывало: проверьте «Triggers → Cron» у Worker в Cloudflare.' : `Расписание молчит ${age} мин: последний запуск ${warsawStamp(d.tickAt)} по Варшаве. Проверьте Cron-триггеры Worker.`}
        </p>
      ) : (
        d.tickAt !== null && <p className="text-xs text-slate-500" data-daily-cron="ok">Расписание работает: последний запуск {age} мин назад.</p>
      )}
    </div>
  );
}

function Header({ o, bank, superadmin, reload }: { o: Overview; bank: BankQ[] | null; superadmin: boolean; reload: () => void }) {
  const { confirm, run } = useFeedback();
  const tomorrow = o.plan[1]?.day ?? o.today;
  const [start, setStart] = useState(o.state.startDay && o.state.startDay > o.today ? o.state.startDay : tomorrow);
  const a = o.audience;
  const est = duration(a.total, o.rate.perHour);
  const tooLong = a.total / Math.max(1, o.rate.perHour) > 4;
  const excluded = (Object.keys(EXCLUDED) as Exclusion[]).filter((k) => a.excluded[k] > 0);
  const off = bank?.filter((q) => q.disabled).length ?? 0;
  const setState = (body: Record<string, unknown>, ok: string) => run(() => api('/daily-quiz/state', { method: 'PATCH', body }), ok).then((done) => done && reload());
  return (
    <Card data-daily-status>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-slate-700">Рассылка вопроса дня:</span>
            {o.state.enabled ? (
              <Badge tone="green" data-daily-state="on">
                включена{o.state.startDay ? ` с ${shortDay(o.state.startDay)}` : ''}
              </Badge>
            ) : (
              <Badge tone="gray" data-daily-state="off">
                выключена
              </Badge>
            )}
            <span className="text-sm text-slate-600">каждый день в {o.state.sendAt} по Варшаве</span>
          </div>
          <p className="text-sm text-slate-700">
            Получат <b className="text-night">{fmt(a.total)}</b> чел. (A1 {fmt(a.byLevel.A1)} · A2 {fmt(a.byLevel.A2)} · B1 {fmt(a.byLevel.B1)}), отправка {est}.
            {excluded.length > 0 && <span className="text-slate-500"> Не получат: {excluded.map((k) => `${EXCLUDED[k]} — ${fmt(a.excluded[k])}`).join(', ')}.</span>}
          </p>
          <Diag o={o} />
          {tooLong && <p className="text-xs font-semibold text-[#ffd27a]">Отправка дольше 4 часов: после окна в 4 часа вопрос в этот день остальным не уйдёт.</p>}
          {off > 0 && <p className="text-xs text-slate-500">Выключено вопросов: {off}.</p>}
        </div>
        {superadmin && (
          <div className="flex flex-wrap items-end gap-2">
            <Field label="Время">
              <select className="inp w-28" value={o.state.sendAt} onChange={(e) => void setState({ sendAt: e.target.value }, `Время рассылки: ${e.target.value}`)}>
                {TIMES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            {o.state.enabled ? (
              <button
                className="btn-d"
                data-daily-stop
                onClick={async () => {
                  const ok = await confirm({ title: 'Остановить рассылку вопроса дня?', body: 'Со следующей минуты вопросы перестанут уходить. Уже отправленные сегодня останутся у людей; вернутся обычные напоминания.', confirm: 'Остановить', danger: true });
                  if (ok) void setState({ enabled: false }, 'Рассылка остановлена');
                }}
              >
                Остановить
              </button>
            ) : (
              <>
                <Field label="Начать с">
                  <input className="inp w-40" type="date" min={o.today} value={start} onChange={(e) => setStart(e.target.value)} />
                </Field>
                <button
                  className="btn-p"
                  data-daily-start
                  disabled={!start}
                  onClick={async () => {
                    const ok = await confirm({
                      title: `Запустить с ${shortDay(start)}?`,
                      body: (
                        <span>
                          Каждый день в {o.state.sendAt} по Варшаве бот пришлёт вопрос дня <b>{fmt(a.total)}</b> людям. Отправка займёт {est}. В эти дни вопрос заменит обычное напоминание тем, кто его получает. Остановить можно здесь же в любой момент.
                        </span>
                      ),
                      confirm: 'Запустить',
                    });
                    if (ok) void setState({ enabled: true, startDay: start }, `Рассылка запущена с ${shortDay(start)}`);
                  }}
                >
                  Запустить с {shortDay(start)}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

function ItemRow({ it, day, o, bank, lang, editable, reload }: { it: Item; day: PlanDay; o: Overview; bank: BankQ[] | null; lang: Lang; editable: boolean; reload: () => void }) {
  const { run, ask, toast } = useFeedback();
  const q = it.question;
  const same = useMemo(() => (bank ?? []).filter((b) => b.level === it.level && !b.disabled), [bank, it.level]);
  const patch = (body: Record<string, unknown>, ok: string) => run(() => api(`/daily-quiz/plan/${day.day}/${it.level}`, { method: 'PATCH', body }), ok).then((done) => done && reload());
  const sendMe = async () => {
    let who = readTest();
    if (!who) {
      const v = await ask({ title: 'Прислать себе', label: 'Ваш Telegram ID или @username', confirm: 'Отправить', placeholder: '@username' });
      if (!v) return;
      who = v;
    }
    try {
      await api('/daily-quiz/test', { body: { who, day: day.day, level: it.level } });
      saveTest(who);
      toast(`Вопрос ${it.level} на ${shortDay(day.day)} отправлен: ${who}`);
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };
  return (
    <div className="grid gap-3 border-t border-line py-3 first:border-t-0 sm:grid-cols-[120px_minmax(0,1fr)]" data-daily-item={`${day.day}-${it.level}`}>
      <img src={it.imageUrl} alt={o.scenes.find((s) => s.id === it.image)?.label ?? ''} className="aspect-video w-full rounded-lg object-cover sm:w-[120px]" loading="lazy" />
      <div className="min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <Badge tone="sky">{it.level}</Badge>
          {q && <span className="text-slate-500">{q.categoryName}</span>}
          {it.edited && <Badge tone="gold">изменён</Badge>}
        </div>
        <p className="text-sm font-semibold text-night">{q?.prompt ?? it.questionId}</p>
        {q && (
          <ol className="grid gap-0.5 text-[13px] sm:grid-cols-2">
            {q.options.map((opt, i) => (
              <li key={i} className={cx('rounded-lg px-2 py-0.5', i === q.answer ? 'bg-brand-soft font-semibold text-[#5eeab0]' : 'text-slate-700')}>
                {i === q.answer ? '✓ ' : ''}
                {opt}
                {i === q.answer && <span className="sr-only"> (верный)</span>}
              </li>
            ))}
          </ol>
        )}
        {q && it.preview && (
          <details className="text-[13px]">
            <summary className="cursor-pointer font-semibold text-[#8fd3ff]">Пояснение и как увидит игрок</summary>
            <div className="mt-2 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,300px)]">
              <p className="text-slate-700">{q.explain}</p>
              <Bubble imageUrl={it.imageUrl} text={it.preview.text} buttons={it.preview.buttons} />
            </div>
          </details>
        )}
        <div className="flex flex-wrap items-end gap-2 pt-1">
          {editable && (
            <>
              <label className="text-xs">
                <span className="sr-only">
                  Заменить вопрос {it.level} на {shortDay(day.day)}
                </span>
                <select className="inp h-9 w-56 py-1 text-xs" value={it.questionId} onChange={(e) => void patch({ questionId: e.target.value }, 'Вопрос заменён')} data-daily-replace>
                  {!same.some((b) => b.id === it.questionId) && <option value={it.questionId}>{q?.prompt ?? it.questionId}</option>}
                  {same.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.categoryName} · {b.prompt.slice(0, 60)}
                      {b.lastDaily ? ` · был ${shortDay(b.lastDaily)}` : ''}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs">
                <span className="sr-only">
                  Картинка вопроса {it.level} на {shortDay(day.day)}
                </span>
                <select className="inp h-9 w-44 py-1 text-xs" value={it.image} onChange={(e) => void patch({ image: e.target.value }, 'Картинка заменена')} data-daily-image>
                  {o.scenes.map((s) => (
                    <option key={s.id} value={s.id}>
                      🖼 {s.label}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}
          <button type="button" className="btn-s h-9 py-1 text-xs" onClick={() => void sendMe()} data-daily-test>
            Прислать себе
          </button>
          {lang !== 'ru' && <span className="text-xs text-slate-500">текст на языке: {lang}</span>}
        </div>
      </div>
    </div>
  );
}

function PlanTab({ o, bank, lang, superadmin, reload }: { o: Overview; bank: BankQ[] | null; lang: Lang; superadmin: boolean; reload: () => void }) {
  const { run } = useFeedback();
  return (
    <div className="space-y-4">
      {o.plan.map((d) => {
        const editable = superadmin && d.editable;
        const isToday = d.day === o.today;
        return (
          <Card
            key={d.day}
            data-daily-day={d.day}
            title={
              <span className="flex flex-wrap items-center gap-2">
                {dayTitle(d.day)} · {d.sendAt}
                {isToday && <Badge tone="sky">сегодня</Badge>}
                {d.skipped && <Badge tone="gold">пропущен — рассылки нет</Badge>}
                {!d.editable && isToday && <Badge tone="gray">отправка идёт — изменить нельзя</Badge>}
              </span>
            }
            actions={
              editable && (
                <button
                  className="btn-s text-xs"
                  onClick={() => void run(() => api(`/daily-quiz/plan/${d.day}`, { method: 'PATCH', body: { skipped: !d.skipped } }), d.skipped ? 'День вернули в рассылку' : 'День пропущен: в этот день придёт обычное напоминание').then((ok) => ok && reload())}
                  data-daily-skip
                >
                  {d.skipped ? 'Вернуть день' : 'Пропустить день'}
                </button>
              )
            }
          >
            <div className={cx(d.skipped && 'opacity-60')}>
              {d.items.map((it) => (
                <ItemRow key={it.level} it={it} day={d} o={o} bank={bank} lang={lang} editable={editable} reload={reload} />
              ))}
            </div>
          </Card>
        );
      })}
      {o.history.some((h) => h.levels.length) && (
        <Card title="Прошедшие дни" subtitle="Только просмотр. Подробно по каждому человеку — во вкладке «День».">
          <DataTable
            caption="Прошедшие дни"
            rows={o.history.flatMap((h) => h.levels.map((l) => ({ ...l, day: h.day, skipped: h.skipped })))}
            rowKey={(r) => `${r.day}-${r.level}`}
            cols={[
              { key: 'day', label: 'День', render: (r) => dayTitle(r.day) },
              { key: 'level', label: 'Уровень', render: (r) => r.level },
              { key: 'q', label: 'Вопрос', render: (r) => <span className="line-clamp-2">{r.skipped ? 'пропущен' : (r.question?.prompt ?? r.questionId)}</span> },
              { key: 'sent', label: 'Дошло', align: 'right', render: (r) => fmt(r.delivered) },
              { key: 'ans', label: 'Ответили', align: 'right', render: (r) => `${fmt(r.answered)} (${pct(r.answered, r.delivered)})` },
              { key: 'ok', label: 'Верно', align: 'right', render: (r) => pct(r.correct, r.answered) },
            ]}
          />
        </Card>
      )}
    </div>
  );
}

function DayTab({ o, lang }: { o: Overview; lang: Lang }) {
  const [day, setDay] = useState(o.today);
  const [filter, setFilter] = useState<'all' | 'answered' | 'not_answered' | 'wrong' | 'failed' | 'not_sent'>('all');
  const [extra, setExtra] = useState<DayRow[]>([]);
  const [more, setMore] = useState<number | null>(null);
  const { data, error, loading, reload } = useLoad(async () => {
    const r = await api<DayReport>(`/daily-quiz/day/${day}?filter=${filter}&lang=${lang}`);
    setExtra([]);
    setMore(r.more);
    return r;
  }, [day, filter, lang]);
  const shift = (n: number) => {
    const d = new Date(`${day}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + n);
    setDay(d.toISOString().slice(0, 10));
  };
  const loadMore = async () => {
    if (more === null) return;
    const r = await api<DayReport>(`/daily-quiz/day/${day}?filter=${filter}&lang=${lang}&after=${more}`);
    setExtra((x) => [...x, ...r.rows]);
    setMore(r.more);
  };
  const cols: Col<DayRow>[] = [
    {
      key: 'who',
      label: 'Игрок',
      render: (r) => (
        <span>
          {r.userId ? (
            <Link className="font-semibold text-[#8fd3ff] hover:underline" to={`/users/${r.userId}`}>
              {r.name || r.telegramId}
            </Link>
          ) : (
            <span className="font-semibold">{r.name || r.telegramId}</span>
          )}
          <span className="block text-xs text-slate-500">
            {r.username ? `@${r.username} · ` : ''}
            {r.userId ? 'приложение' : 'только бот'}
          </span>
        </span>
      ),
    },
    { key: 'lvl', label: 'Уровень', render: (r) => `${r.level} · ${r.lang}` },
    { key: 'sent', label: 'Отправлено', render: (r) => <Time v={r.sentAt} /> },
    {
      key: 'st',
      label: 'Доставка',
      render: (r) => {
        if (r.reason) {
          const [t, tone] = NOT_SENT[r.reason];
          return (
            <Badge tone={tone} data-daily-status-cell="NOT_SENT">
              не отправлялся: {t}
            </Badge>
          );
        }
        const [t, tone] = DELIVERY[r.status] ?? [r.status, 'gray' as Tone];
        return (
          <Badge tone={tone} data-daily-status-cell={r.status}>
            {t}
          </Badge>
        );
      },
    },
    { key: 'ans', label: 'Ответил', render: (r) => (r.answeredAt ? <Time v={r.answeredAt} /> : <span className="text-slate-500">нет</span>) },
    { key: 'ch', label: 'Выбрал', render: (r) => r.chosenText ?? '—' },
    { key: 'ok', label: 'Верно', render: (r) => (r.correct === null ? '—' : r.correct ? <span className="font-bold text-[#5eeab0]">✓ верно</span> : <span className="font-bold text-[#ff9aa8]">✗ неверно</span>) },
    { key: 'inst', label: 'Что ещё пришло', render: (r) => <InsteadCell list={r.instead ?? []} /> },
  ];
  const sum = data?.summary;
  const reasons = sum ? (Object.keys(NOT_SENT) as NotSentReason[]).filter((k) => sum.notSentBy[k] > 0) : [];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button className="btn-s" onClick={() => shift(-1)} aria-label="Предыдущий день">
          ← Вчера
        </button>
        <span className="min-w-36 text-center font-semibold text-night">{dayTitle(day)}</span>
        <button className="btn-s" onClick={() => shift(1)} disabled={day >= o.today} aria-label="Следующий день">
          Завтра →
        </button>
      </div>
      {error && <LoadError error={error} retry={reload} />}
      {sum && (
        <div className={cx('day-summary', !sum.sending && 'is-off')} data-daily-summary>
          {!sum.sending && (
            <p className="mb-2 text-sm font-bold text-night" data-daily-day-off>
              {!sum.enabled
                ? 'В этот день рассылка вопроса дня была выключена — вопрос не уходил никому. Вместо него бот слал обычные напоминания о занятии и приглашения к быстрому вопросу (колонка «Что ещё пришло»).'
                : sum.startDay && day < sum.startDay
                  ? `Рассылка начинается с ${shortDay(sum.startDay)} — в этот день вопрос ещё не отправлялся.`
                  : 'Этот день пропущен в плане — вопрос не отправлялся.'}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
            <span>
              Людей в боте и приложении: <b className="text-night">{fmt(sum.people)}</b>
            </span>
            <span>
              Отправлено: <b className="text-night">{fmt(sum.sent)}</b>
            </span>
            <span>
              Не получили: <b className="text-night">{fmt(sum.notSent)}</b>
            </span>
            {reasons.map((k) => (
              <Badge key={k} tone={NOT_SENT[k][1]}>
                {NOT_SENT[k][0]} — {fmt(sum.notSentBy[k])}
              </Badge>
            ))}
          </div>
        </div>
      )}
      <PersonCheck day={day} />
      <div className="grid gap-3 lg:grid-cols-3">
        {(data?.levels ?? []).map((l) => (
          <Card key={l.level} data-daily-level={l.level}>
            <div className="flex gap-3">
              {l.imageUrl && <img src={l.imageUrl} alt="" className="h-14 w-24 shrink-0 rounded-lg object-cover" />}
              <div className="min-w-0">
                <Badge tone="sky">{l.level}</Badge>
                <p className="mt-1 line-clamp-3 text-sm font-semibold text-night">{l.skipped ? 'День пропущен' : (l.prompt ?? 'Нет плана')}</p>
              </div>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
              <dt className="text-slate-500">Отправлено</dt>
              <dd className="text-right tabular-nums">{fmt(l.sent)}</dd>
              <dt className="text-slate-500">Дошло</dt>
              <dd className="text-right tabular-nums">{fmt(l.delivered)}</dd>
              <dt className="text-slate-500">Не дошло</dt>
              <dd className="text-right tabular-nums">
                {fmt(l.blocked + l.noChat + l.failed)}
                {l.blocked + l.noChat + l.failed > 0 && <span className="block text-xs text-slate-500">блок {l.blocked} · нет чата {l.noChat} · ошибка {l.failed}</span>}
              </dd>
              <dt className="text-slate-500">Ответили</dt>
              <dd className="text-right tabular-nums">
                {fmt(l.answered)} ({pct(l.answered, l.delivered)})
              </dd>
              <dt className="text-slate-500">Верно</dt>
              <dd className="text-right tabular-nums">
                {fmt(l.correct)} ({pct(l.correct, l.answered)})
              </dd>
            </dl>
          </Card>
        ))}
        {loading && !data && LEVELS.map((l) => <Skeleton key={l} className="h-44" />)}
      </div>
      <Card
        title="Кому как отправился"
        actions={
          <Segmented
            label="Отбор получателей"
            value={filter}
            onChange={setFilter}
            options={[
              ['all', 'Все'],
              ['answered', 'Ответили'],
              ['not_answered', 'Не ответили'],
              ['wrong', 'Ошиблись'],
              ['failed', 'Не дошло'],
              ['not_sent', 'Не получили'],
            ]}
          />
        }
      >
        <p className="mb-3 text-xs text-slate-500">
          «Не получили» — люди, которым в этот день вопрос не отправлялся, и почему (для прошлых дней причина — нынешняя). «Что ещё пришло» — напоминание о занятии или приглашение к быстрому вопросу в тот же день.
        </p>
        <DataTable caption="Получатели вопроса дня" cols={cols} rows={data ? [...data.rows, ...extra] : null} loading={loading} rowKey={(r) => String(r.telegramId)} empty={filter === 'not_sent' ? 'Вопрос получили все' : 'В этот день вопрос дня никому не отправлялся'} />
        {more !== null && (
          <div className="mt-3 text-center">
            <button className="btn-s" onClick={() => void loadMore()}>
              Показать ещё
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}

function QuestionsTab({ bank, superadmin, reload }: { bank: BankQ[] | null; superadmin: boolean; reload: () => void }) {
  const { run } = useFeedback();
  const [level, setLevel] = useState<'all' | Level>('all');
  const [sort, setSort] = useState<'pct' | 'times'>('pct');
  const [q, setQ] = useState('');
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (bank ?? [])
      .filter((b) => (level === 'all' || b.level === level) && (!s || `${b.prompt} ${b.options.join(' ')} ${b.id}`.toLowerCase().includes(s)))
      .sort((a, b) => (sort === 'times' ? b.timesDaily - a.timesDaily : (a.correctPct ?? 50) - (b.correctPct ?? 50)));
  }, [bank, level, sort, q]);
  const cols: Col<BankQ>[] = [
    { key: 'lvl', label: 'Уровень', render: (r) => <Badge tone="sky">{r.level}</Badge> },
    { key: 'cat', label: 'Тема', render: (r) => r.categoryName },
    {
      key: 'q',
      label: 'Вопрос',
      render: (r) => (
        <span className={cx(r.disabled && 'text-slate-500 line-through')}>
          {r.prompt}
          <span className="block text-xs text-slate-500">✓ {r.options[r.answer]}</span>
        </span>
      ),
    },
    { key: 'times', label: 'Вопросом дня', align: 'right', render: (r) => (r.timesDaily ? `${r.timesDaily} · ${shortDay(r.lastDaily!)}` : '—') },
    { key: 'ans', label: 'Ответов', align: 'right', render: (r) => fmt(r.answered) },
    {
      key: 'pct',
      label: '% верно',
      align: 'right',
      render: (r) =>
        r.correctPct === null ? (
          '—'
        ) : r.answered >= 10 && r.correctPct >= 90 ? (
          <Badge tone="gold">{r.correctPct} % · лёгкий</Badge>
        ) : r.answered >= 10 && r.correctPct <= 15 ? (
          <Badge tone="red">{r.correctPct} % · проверить</Badge>
        ) : (
          `${r.correctPct} %`
        ),
    },
    {
      key: 'on',
      label: 'Включён',
      render: (r) =>
        superadmin ? (
          <button
            type="button"
            role="switch"
            aria-checked={!r.disabled}
            aria-label={`${r.disabled ? 'Включить' : 'Выключить'} вопрос: ${r.prompt}`}
            className={cx('btn-s h-8 px-2.5 py-0.5 text-xs', !r.disabled && 'border-brand text-[#5eeab0]')}
            onClick={() => void run(() => api(`/daily-quiz/questions/${r.id}`, { method: 'PATCH', body: { disabled: !r.disabled } }), r.disabled ? 'Вопрос включён' : 'Вопрос выключен и убран из плана').then((ok) => ok && reload())}
            data-daily-toggle={r.id}
          >
            {r.disabled ? 'выключен' : 'включён'}
          </button>
        ) : r.disabled ? (
          'выключен'
        ) : (
          'включён'
        ),
    },
  ];
  return (
    <Card
      title={`Вопросы (${fmt(bank?.length ?? 0)})`}
      subtitle="Сверху — подозрительные: почти никто не отвечает верно (возможна ошибка в вопросе) и слишком лёгкие. Выключенный вопрос сразу уходит из будущих дней плана и из /quiz."
    >
      <div className="mb-3 flex flex-wrap items-end gap-2">
        <Segmented label="Уровень" value={level} onChange={setLevel} options={[['all', 'Все'], ...LEVELS.map((l): [Level, string] => [l, l])]} />
        <Segmented
          label="Сортировка"
          value={sort}
          onChange={setSort}
          options={[
            ['pct', 'по % верно'],
            ['times', 'по числу показов'],
          ]}
        />
        <label className="min-w-48 flex-1">
          <span className="sr-only">Поиск по вопросам</span>
          <input className="inp" placeholder="Поиск по тексту вопроса или варианта" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
      </div>
      <DataTable caption="Банк вопросов" cols={cols} rows={rows} rowKey={(r) => r.id} loading={!bank} empty="Нет вопросов по отбору" />
    </Card>
  );
}

export function DailyQuiz({ superadmin }: { superadmin: boolean }) {
  const [lang, setLang] = useState<Lang>('ru');
  const [tab, setTab] = useState<'plan' | 'day' | 'questions'>('plan');
  const overview = useLoad(() => api<Overview>(`/daily-quiz?lang=${lang}`), [lang]);
  const bank = useLoad(() => api<BankQ[]>(`/daily-quiz/questions?lang=${lang}`), [lang]);
  const reload = () => {
    overview.reload();
    bank.reload();
  };
  const o = overview.data;
  return (
    <div className="space-y-5">
      <PageHeader
        title="Вопрос дня"
        subtitle="Один вопрос в день всем, кто писал боту, и игрокам приложения. До запуска здесь видны все запланированные публикации."
        actions={<Segmented label="Язык текстов" value={lang} onChange={setLang} options={LANGS} />}
      />
      {overview.error && <LoadError error={overview.error} retry={overview.reload} />}
      {!o && !overview.error && <Skeleton className="h-32" />}
      {o && <Header o={o} bank={bank.data} superadmin={superadmin} reload={reload} />}
      <Segmented
        label="Раздел"
        value={tab}
        onChange={setTab}
        options={[
          ['plan', 'План'],
          ['day', 'День'],
          ['questions', 'Вопросы'],
        ]}
      />
      {o && tab === 'plan' && <PlanTab o={o} bank={bank.data} lang={lang} superadmin={superadmin} reload={reload} />}
      {o && tab === 'day' && <DayTab o={o} lang={lang} />}
      {tab === 'questions' && (bank.error ? <LoadError error={bank.error} retry={bank.reload} /> : <QuestionsTab bank={bank.data} superadmin={superadmin} reload={reload} />)}
      {o && !o.plan.length && <Empty>План пуст</Empty>}
    </div>
  );
}
