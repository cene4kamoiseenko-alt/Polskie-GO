/**
 * Служебные разделы в новом виде (обновление 2026-11-13):
 *  • «Награды» — по группам, рядом значение по умолчанию, изменённые отмечены, «Сохранить» активна только при изменениях;
 *  • «Бот» — состояние понятными словами, шаги настройки списком вместо JSON;
 *  • «Журнал действий» — кто что сделал обычными словами, отбор по администратору, действию и объекту, «показать ещё»;
 *  • «Администраторы» — роль и доступ меняются прямо в списке, новый пароль, добавление с подписями полей.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DEFAULT_REWARDS } from '@polski-go/shared';
import { api } from './api';
import { useFeedback } from './feedback';
import { Badge, Card, DataTable, Field, Kpi, LoadError, PageHeader, Skeleton, Time, cx, useLoad, type Col } from './ui';

export type Role = 'SUPERADMIN' | 'EDITOR' | 'SUPPORT';
export const ROLE_RU: Record<Role, string> = { SUPERADMIN: 'главный администратор', EDITOR: 'редактор контента', SUPPORT: 'поддержка' };
const ROLE_HINT: Record<Role, string> = {
  SUPERADMIN: 'всё, включая деньги, рассылки и администраторов',
  EDITOR: 'только контент: города, уроки, слова, квесты, озвучка',
  SUPPORT: 'игроки, поддержка, жалобы, платежи (без возвратов)',
};

// ───────────── Награды ─────────────

const REWARD_LABEL: Record<string, string> = {
  exerciseXp: 'XP за правильное упражнение',
  lessonXp: 'XP за урок',
  perfectBonusXp: 'Бонус XP за урок без ошибок',
  lessonZlotki: 'Złotki за урок',
  perfectZlotki: 'Złotki за урок без ошибок',
  cityExamXp: 'XP за экзамен города',
  cityExamZlotki: 'Złotki за экзамен города',
  routeChestXp: 'Сундук темы: XP',
  routeChestZlotki: 'Сундук темы: Złotki',
  replayFactor: 'Доля XP за повтор урока (от 0 до 1)',
  maxRewardedReplaysPerDay: 'Повторов урока с наградой в сутки',
  practiceXpDailyCap: 'Лимит XP за тренировки в день',
  premiumGiftZlotki: 'Подарок месяца',
  premiumWelcomeZlotki: 'Приветственный бонус (первая оплата)',
  premiumLoyalty3Zlotki: 'Бонус на 3-й месяц',
  premiumLoyalty6Zlotki: 'Бонус на 6-й месяц',
  premiumLoyalty12Zlotki: 'Бонус на 12-й месяц',
  premiumPlan3Zlotki: 'Бонус за тариф на 3 месяца',
  premiumPlan12Zlotki: 'Бонус за тариф на 12 месяцев',
  dailyQuestXp: 'Ежедневный квест: XP',
  dailyQuestZlotki: 'Ежедневный квест: Złotki',
  weeklyQuestXp: 'Недельный квест: XP',
  storyQuestXp: 'Сюжетный квест: XP',
  storyQuestZlotki: 'Сюжетный квест: Złotki',
};
const REWARD_GROUPS: [string, string | null, string[]][] = [
  ['Уроки и упражнения', null, ['exerciseXp', 'lessonXp', 'perfectBonusXp', 'lessonZlotki', 'perfectZlotki']],
  ['Экзамены и темы', null, ['cityExamXp', 'cityExamZlotki', 'routeChestXp', 'routeChestZlotki']],
  ['Повторы и лимиты', 'защита от накрутки', ['replayFactor', 'maxRewardedReplaysPerDay', 'practiceXpDailyCap']],
  ['Premium, Złotki', null, ['premiumGiftZlotki', 'premiumWelcomeZlotki', 'premiumLoyalty3Zlotki', 'premiumLoyalty6Zlotki', 'premiumLoyalty12Zlotki', 'premiumPlan3Zlotki', 'premiumPlan12Zlotki']],
  ['Квесты — справочно', 'награду квеста задают в самом квесте; эти числа — подсказка для новых', ['dailyQuestXp', 'dailyQuestZlotki', 'weeklyQuestXp', 'storyQuestXp', 'storyQuestZlotki']],
];
const DEFAULTS = DEFAULT_REWARDS as unknown as Record<string, number>;

export function Rewards() {
  const { data, error, reload } = useLoad<Record<string, number>>(() => api('/config/rewards'), []);
  const [form, setForm] = useState<Record<string, number> | null>(null);
  const [saved, setSaved] = useState<Record<string, number> | null>(null);
  const { run } = useFeedback();
  useEffect(() => {
    setForm(data);
    setSaved(data);
  }, [data]);
  const groups = useMemo(() => {
    if (!form) return [];
    const known = new Set(REWARD_GROUPS.flatMap((g) => g[2]));
    const rest = Object.keys(form).filter((k) => !known.has(k));
    return [...REWARD_GROUPS, ...(rest.length ? ([['Прочее', null, rest]] as typeof REWARD_GROUPS) : [])];
  }, [form]);
  if (error) return <LoadError error={error} retry={reload} />;
  if (!form || !saved) return <Skeleton className="h-96" />;
  const dirty = Object.keys(form).filter((k) => form[k] !== saved[k]);
  const save = async () => {
    const body = Object.fromEntries(dirty.map((k) => [k, form[k]]));
    await run(async () => setSaved(await api('/config/rewards', { method: 'PUT', body })), 'Награды сохранены — игроки увидят их в течение 30 секунд');
  };
  return (
    <div className="space-y-5 pb-20">
      <PageHeader title="Награды и лимиты" subtitle="Изменения применяются в течение 30 секунд, выкладка не нужна. Под названием каждого поля — значение по умолчанию." />
      <div className="grid gap-4 xl:grid-cols-2">
        {groups.map(([title, sub, keys]) => (
          <Card key={title} title={title} subtitle={sub ?? undefined}>
            <div className="space-y-3">
              {keys
                .filter((k) => k in form)
                .map((k) => {
                  const changed = form[k] !== (DEFAULTS[k] ?? form[k]);
                  return (
                    <div key={k} className="grid grid-cols-[minmax(0,1fr)_110px] items-center gap-3 text-sm" data-reward={k}>
                      <label htmlFor={`rw-${k}`} className="min-w-0">
                        <span className="font-medium text-slate-700">{REWARD_LABEL[k] ?? k}</span>
                        <span className="block text-xs text-slate-500">
                          по умолчанию {DEFAULTS[k] ?? '—'}
                          {changed && (
                            <>
                              {' · '}
                              <button type="button" className="link" onClick={() => setForm({ ...form, [k]: DEFAULTS[k] })}>
                                вернуть
                              </button>
                            </>
                          )}
                        </span>
                      </label>
                      <input
                        id={`rw-${k}`}
                        className={cx('inp text-right tabular-nums', changed && 'border-gold bg-gold-soft/40', form[k] !== saved[k] && 'ring-2 ring-sky/30')}
                        type="number"
                        min={0}
                        step={k === 'replayFactor' ? 0.05 : 1}
                        value={form[k]}
                        onChange={(e) => setForm({ ...form, [k]: Number(e.target.value) })}
                      />
                    </div>
                  );
                })}
            </div>
          </Card>
        ))}
      </div>
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-white/95 px-4 py-3 shadow-[0_-8px_24px_-12px_rgb(16_24_40/0.2)] backdrop-blur md:left-60">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-3">
          <button className="btn-p" disabled={!dirty.length} onClick={save}>
            Сохранить{dirty.length ? ` (${dirty.length})` : ''}
          </button>
          <button className="btn-s" disabled={!dirty.length} onClick={() => setForm(saved)}>
            Отменить изменения
          </button>
          <span className="text-sm text-slate-500" aria-live="polite">
            {dirty.length ? `Не сохранено: ${dirty.map((k) => REWARD_LABEL[k] ?? k).join(', ')}` : 'Все изменения сохранены'}
          </span>
        </div>
      </div>
    </div>
  );
}

// ───────────── Бот ─────────────

type Step = { step: string; ok: boolean; code?: number; error?: string };
type BotReport = {
  ok: boolean;
  bot?: { username: string } | null;
  webhook?: { url: string; pending: number; allowedUpdates: string[]; lastError?: string; lastErrorAt?: string } | null;
  secretGeneration?: number;
  secretConfirmed?: boolean;
  steps: Step[];
  hints: string[];
};
const STEP_RU: Record<string, string> = {
  token: 'Токен бота',
  getMe: 'Проверка токена в Telegram',
  setWebhook: 'Адрес для сообщений (webhook)',
  getWebhookInfo: 'Состояние webhook',
  setMyCommands: 'Команды меню',
  setChatMenuButton: 'Кнопка «Открыть приложение»',
  setMyDescription: 'Описание бота',
  setMyShortDescription: 'Короткое описание',
};
const stepName = (s: string) => {
  const [m, lang] = s.split(':');
  return `${STEP_RU[m] ?? m}${lang ? ` (${lang})` : ''}`;
};

function Steps({ steps }: { steps: Step[] }) {
  return (
    <ul className="space-y-1.5 text-sm" data-bot-steps>
      {steps.map((s, i) => (
        <li key={i} className="flex flex-wrap items-baseline gap-2">
          <span aria-hidden>{s.ok ? '✅' : '❌'}</span>
          <span className={s.ok ? 'text-slate-700' : 'font-semibold text-[#b42336]'}>{stepName(s.step)}</span>
          <span className="sr-only">{s.ok ? 'выполнено' : 'ошибка'}</span>
          {s.error && <span className="text-xs text-slate-500">{s.error}</span>}
        </li>
      ))}
    </ul>
  );
}

export function Bot() {
  const { data, error, loading, reload } = useLoad<{ report: BotReport; maintenance: { checkedAt: string; webhook: string; error?: string } | null }>(() => api('/bot'), []);
  const [busy, setBusy] = useState('');
  const [result, setResult] = useState<BotReport | null>(null);
  const { confirm, toast } = useFeedback();
  const runSetup = async (mode: 'setup' | 'rotate') => {
    if (
      mode === 'rotate' &&
      !(await confirm({ title: 'Сменить секрет webhook?', body: 'Старый секрет перестанет действовать через 10 минут после того, как Telegram подтвердит новый. Делайте это, если секрет мог утечь.', confirm: 'Сменить секрет' }))
    )
      return;
    setBusy(mode);
    try {
      const r = await api<BotReport>('/bot/setup', { body: { mode } });
      setResult(r);
      toast(r.ok ? (mode === 'rotate' ? 'Секрет сменён' : 'Бот настроен') : 'Готово с ошибками — смотрите шаги ниже', r.ok ? 'ok' : 'error');
      reload();
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setBusy('');
    }
  };
  const report = data?.report;
  const wh = report?.webhook;
  const withButtons = wh?.url && (wh.allowedUpdates.length === 0 || wh.allowedUpdates.includes('callback_query'));
  return (
    <div className="max-w-4xl space-y-5">
      <PageHeader
        title="Telegram-бот"
        subtitle="Проверка и настройка без секретов в браузере: секрет webhook знают только сервер и Telegram."
        actions={
          <>
            <button className="btn-s" disabled={!!busy || loading} onClick={reload}>
              {loading ? 'Проверка…' : 'Проверить'}
            </button>
            <button className="btn-p" disabled={!!busy} onClick={() => runSetup('setup')}>
              {busy === 'setup' ? 'Настройка…' : 'Настроить бота'}
            </button>
          </>
        }
      />
      {error && <LoadError error={error} retry={reload} />}
      {!report ? (
        <div className="grid gap-3 md:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-28" />)}</div>
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-3" data-bot-status={report.ok ? 'ok' : 'bad'}>
            <Kpi compact label="Бот" value={report.bot?.username ? `@${report.bot.username}` : '—'} hint={report.ok ? <Badge tone="green">Telegram отвечает</Badge> : <Badge tone="red">есть ошибки</Badge>} />
            <Kpi
              compact
              label="Сообщения в бот"
              value={wh?.url ? (withButtons ? 'приходят' : 'без кнопок') : 'не настроены'}
              hint={wh ? `в очереди: ${wh.pending}` : 'нажмите «Настроить бота»'}
            />
            <Kpi
              compact
              label="Секрет webhook"
              value={report.secretGeneration ? `№ ${report.secretGeneration}` : 'из Cloudflare'}
              hint={report.secretGeneration ? (report.secretConfirmed ? 'подтверждён Telegram' : 'ждёт подтверждения') : 'станет серверным при настройке'}
            />
          </div>
          {wh?.lastError && (
            <p role="alert" className="panel border-gold/40 bg-gold-soft/50 p-3 text-sm text-[#7a4d00]">
              Последняя ошибка доставки: {wh.lastError} <span className="text-xs">({wh.lastErrorAt})</span>
            </p>
          )}
          {report.hints.length > 0 && (
            <Card title="Что сделать">
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {report.hints.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </Card>
          )}
          {report.steps.length > 0 && (
            <Card title="Проверка">
              <Steps steps={report.steps} />
            </Card>
          )}
        </>
      )}
      {result && (
        <Card title={result.ok ? 'Настройка прошла успешно' : 'Настройка: есть ошибки'} subtitle="шаги последнего запуска">
          <Steps steps={result.steps} />
        </Card>
      )}
      <Card title="Безопасность">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
          <span>Секрет webhook подтверждает, что сообщения приходят от Telegram. Меняйте, если он мог попасть к посторонним.</span>
          <button className="btn-s" disabled={!!busy} onClick={() => runSetup('rotate')}>
            {busy === 'rotate' ? 'Смена…' : 'Сменить секрет'}
          </button>
        </div>
      </Card>
      {data?.maintenance && (
        <p className="text-xs text-slate-500">
          Автопроверка по расписанию: <Time v={data.maintenance.checkedAt} /> · {data.maintenance.webhook}
          {data.maintenance.error ? ` · ${data.maintenance.error}` : ''}
        </p>
      )}
    </div>
  );
}

// ───────────── Журнал действий ─────────────

type AuditItem = { id: string; action: string; entity: string; entityId: string | null; details: unknown; createdAt: number; admin: { email: string; name: string } | null };
type AuditPage = { items: AuditItem[]; more: string | null; admins: { id: string; email: string; name: string }[]; actions: string[]; entities: string[] };

const ACTION_RU: Record<string, string> = {
  create: 'создал',
  update: 'изменил',
  delete: 'удалил',
  send: 'запустил',
  test: 'проверил на себе',
  cancel: 'остановил',
  payment_refund: 'вернул звёзды за',
  support_reply: 'ответил на',
  support_close: 'закрыл без ответа',
  report_dismiss: 'оставил без изменений жалобы на',
  report_reset_name: 'сбросил имя по жалобе у',
  report_ban: 'заблокировал по жалобе',
  premium_grant: 'подарил Premium',
  premium_revoke: 'отменил Premium у',
  ban: 'заблокировал',
  unban: 'разблокировал',
  message: 'написал',
  password_reset: 'сменил пароль',
  bot_setup: 'настроил',
  bot_rotate_secret: 'сменил секрет webhook',
  generate: 'создал',
  upload: 'загрузил',
};
const ENTITY_RU: Record<string, string> = {
  cities: 'город',
  routes: 'маршрут',
  lessons: 'урок',
  exercises: 'упражнение',
  vocabulary: 'слово',
  quests: 'квест',
  questSteps: 'этап сюжета',
  achievements: 'достижение',
  items: 'вещь',
  plans: 'тариф',
  campaigns: 'рассылку',
  campaign: 'рассылку',
  user: 'игрока',
  admin: 'администратора',
  payment: 'платёж',
  support: 'обращение',
  bot: 'бота',
  'config.rewards': 'награды',
  audio: 'озвучку',
  asset: 'файл',
};
/** Где объект стоит в другом падеже: «написал игроку», «подарил Premium игроку», «сменил пароль администратору». */
const OBJECT_CASE: Record<string, string> = {
  'message:user': 'игроку',
  'premium_grant:user': 'игроку',
  'password_reset:admin': 'администратору',
};
const RESOURCE_NAMES = new Set(['cities', 'routes', 'lessons', 'exercises', 'vocabulary', 'quests', 'questSteps', 'achievements', 'items', 'plans']);

function auditLink(x: AuditItem): string | null {
  if (!x.entityId) return null;
  if (x.entity === 'user') return `/users/${x.entityId}`;
  if (x.entity === 'campaign' || x.entity === 'campaigns') return '/campaigns';
  if (x.entity === 'payment') return '/payments';
  if (x.entity === 'support') return '/support';
  if (x.entity === 'admin') return '/admins';
  if (RESOURCE_NAMES.has(x.entity) && x.action !== 'delete') return `/r/${x.entity}/${x.entityId}`;
  return null;
}

/** Подробности коротко: «role: SUPPORT · isActive: нет»; длинное и вложенное — под «ещё». */
function Details({ v }: { v: unknown }) {
  if (v == null || (typeof v === 'object' && !Object.keys(v as object).length)) return <span className="text-slate-500">—</span>;
  if (typeof v !== 'object') return <span>{String(v)}</span>;
  const entries = Object.entries(v as Record<string, unknown>);
  const simple = (x: unknown) => x == null || ['string', 'number', 'boolean'].includes(typeof x);
  const short = entries.filter(([, x]) => simple(x) && String(x).length <= 40).slice(0, 4);
  const rest = entries.length - short.length;
  const val = (x: unknown) => (x === true ? 'да' : x === false ? 'нет' : x == null ? '—' : String(x));
  return (
    <span className="flex flex-wrap items-center gap-1">
      {short.map(([k, x]) => (
        <span key={k} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
          {k}: <b className="font-semibold text-slate-800">{val(x)}</b>
        </span>
      ))}
      {rest > 0 && (
        <details className="w-full text-xs">
          <summary className="cursor-pointer font-semibold text-slate-500">ещё {rest}</summary>
          <pre className="mt-1 max-h-60 max-w-[36rem] overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-2 text-[11px]">{JSON.stringify(v, null, 2)}</pre>
        </details>
      )}
    </span>
  );
}

export function Audit() {
  const [f, setF] = useState({ admin: '', action: '', entity: '' });
  const [pages, setPages] = useState<string[]>([]); // курсоры загруженных «ещё»
  const qs = (before?: string) => `/audit?${new URLSearchParams({ ...f, ...(before ? { before } : {}) })}`;
  const { data, error, loading, reload } = useLoad<AuditPage>(async () => {
    const first = await api<AuditPage>(qs());
    const more = await Promise.all(pages.map((p) => api<AuditPage>(qs(p))));
    return { ...first, items: [first, ...more].flatMap((x) => x.items), more: (more.at(-1) ?? first).more };
  }, [f.admin, f.action, f.entity, pages.join()]);
  const set = (k: keyof typeof f, v: string) => {
    setF({ ...f, [k]: v });
    setPages([]);
  };
  const cols: Col<AuditItem>[] = [
    { key: 'at', label: 'Когда', render: (x) => <Time v={x.createdAt} /> },
    { key: 'who', label: 'Кто', render: (x) => (x.admin ? <span title={x.admin.email}>{x.admin.name || x.admin.email}</span> : <span className="text-slate-500">удалённый админ</span>) },
    {
      key: 'what',
      label: 'Что сделал',
      render: (x) => {
        const link = auditLink(x);
        const obj = OBJECT_CASE[`${x.action}:${x.entity}`] ?? ENTITY_RU[x.entity] ?? x.entity;
        return (
          <span>
            {ACTION_RU[x.action] ?? x.action}{' '}
            {link ? (
              <Link className="link" to={link}>
                {obj}
              </Link>
            ) : (
              <b className="font-semibold">{obj}</b>
            )}
          </span>
        );
      },
    },
    { key: 'details', label: 'Подробности', render: (x) => <Details v={x.details} /> },
  ];
  const sel = (k: keyof typeof f, label: string, options: [string, string][]) => (
    <label className="text-xs font-semibold text-slate-600">
      {label}
      <select className="inp mt-1 min-w-44" value={f[k]} onChange={(e) => set(k, e.target.value)}>
        <option value="">все</option>
        {options.map(([v, t]) => (
          <option key={v} value={v}>
            {t}
          </option>
        ))}
      </select>
    </label>
  );
  return (
    <div className="space-y-5">
      <PageHeader title="Журнал действий" subtitle="Каждое изменение в админке: кто, когда и что сделал. Новые сверху." />
      <Card bodyClass="p-0" data-audit>
        <div className="flex flex-wrap items-end gap-3 border-b border-line p-4">
          {sel('admin', 'Администратор', (data?.admins ?? []).map((a) => [a.id, a.name || a.email]))}
          {sel('action', 'Действие', (data?.actions ?? []).map((a) => [a, ACTION_RU[a] ?? a]))}
          {sel('entity', 'Объект', (data?.entities ?? []).map((e) => [e, ENTITY_RU[e] ?? e]))}
          {(f.admin || f.action || f.entity) && (
            <button className="btn-s" onClick={() => (setF({ admin: '', action: '', entity: '' }), setPages([]))}>
              Сбросить
            </button>
          )}
        </div>
        {error && (
          <div className="p-4">
            <LoadError error={error} retry={reload} />
          </div>
        )}
        <DataTable cols={cols} rows={data?.items} loading={loading} rowKey={(x) => x.id} empty="Записей нет" caption="Журнал действий администраторов" />
        {data?.more && (
          <div className="border-t border-line p-3 text-center">
            <button className="btn-s" disabled={loading} onClick={() => setPages((p) => [...p, data.more!])}>
              Показать ещё
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}

// ───────────── Администраторы ─────────────

type AdminRow = { id: string; email: string; name: string; role: Role; isActive: boolean; lastLoginAt: string | null; createdAt: string };

export function Admins({ me }: { me: string }) {
  const { data, error, reload } = useLoad<AdminRow[]>(() => api('/admins'), []);
  const { run, ask, confirm } = useFeedback();
  const [f, setF] = useState({ email: '', name: '', role: 'EDITOR' as Role, password: '' });
  const patch = async (a: AdminRow, body: Partial<Pick<AdminRow, 'role' | 'isActive'>>, ok: string) => {
    if (await run(() => api(`/admins/${a.id}`, { method: 'PATCH', body }), ok)) reload();
  };
  const cols: Col<AdminRow>[] = [
    {
      key: 'who',
      label: 'Администратор',
      render: (a) => (
        <span className={cx(!a.isActive && 'opacity-60')}>
          <b className="text-night">{a.name}</b> {a.id === me && <Badge tone="sky">это вы</Badge>} {!a.isActive && <Badge tone="gray">отключён</Badge>}
          <span className="block text-xs text-slate-500">{a.email}</span>
        </span>
      ),
    },
    {
      key: 'role',
      label: 'Роль',
      render: (a) => (
        <select
          className="inp max-w-56 !py-1.5"
          aria-label={`Роль: ${a.name}`}
          value={a.role}
          disabled={a.id === me}
          title={a.id === me ? 'Свою роль поменять нельзя' : ROLE_HINT[a.role]}
          onChange={(e) => void patch(a, { role: e.target.value as Role }, `Роль изменена: ${ROLE_RU[e.target.value as Role]}`)}
        >
          {(Object.keys(ROLE_RU) as Role[]).map((r) => (
            <option key={r} value={r}>
              {ROLE_RU[r]}
            </option>
          ))}
        </select>
      ),
    },
    { key: 'login', label: 'Последний вход', render: (a) => (a.lastLoginAt ? <Time v={a.lastLoginAt} /> : <span className="text-slate-500">ещё не входил</span>) },
    {
      key: 'actions',
      label: <span className="sr-only">Действия</span>,
      render: (a) => (
        <span className="flex flex-wrap justify-end gap-2">
          <button
            className="btn-s !py-1.5 text-xs"
            onClick={async () => {
              const password = await ask({ title: `Новый пароль: ${a.name}`, body: 'Сообщите пароль лично, не пересылайте его в открытом чате.', label: 'Пароль', type: 'password', minLength: 10, confirm: 'Сохранить пароль' });
              if (password) await run(() => api(`/admins/${a.id}/password`, { body: { password } }), 'Пароль изменён');
            }}
          >
            Сменить пароль
          </button>
          {a.id !== me &&
            (a.isActive ? (
              <button
                className="btn-s !py-1.5 text-xs text-[#b42336]"
                onClick={async () => {
                  if (await confirm({ title: `Отключить «${a.name}»?`, body: 'Вход перестанет работать сразу, даже если админка у него открыта. Включить обратно можно здесь же.', confirm: 'Отключить', danger: true }))
                    await patch(a, { isActive: false }, 'Доступ отключён');
                }}
              >
                Отключить
              </button>
            ) : (
              <button className="btn-s !py-1.5 text-xs" onClick={() => void patch(a, { isActive: true }, 'Доступ включён')}>
                Включить
              </button>
            ))}
        </span>
      ),
    },
  ];
  return (
    <div className="space-y-5">
      <PageHeader title="Администраторы" subtitle="Кто может входить в админку и что ему доступно. Свою роль и доступ поменять нельзя — это защищает от случайной потери входа." />
      {error && <LoadError error={error} retry={reload} />}
      <Card bodyClass="p-0" data-admins>
        <DataTable cols={cols} rows={data} loading={!data} rowKey={(a) => a.id} caption="Администраторы" />
      </Card>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Card title="Добавить администратора">
          <form
            className="grid gap-3 md:grid-cols-2"
            onSubmit={async (e) => {
              e.preventDefault();
              if (await run(() => api('/admins', { body: f }), `Администратор ${f.email} добавлен`)) {
                setF({ email: '', name: '', role: 'EDITOR', password: '' });
                reload();
              }
            }}
          >
            <Field label="Email">
              <input className="inp" type="email" required autoComplete="off" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
            </Field>
            <Field label="Имя">
              <input className="inp" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
            </Field>
            <Field label="Роль" hint={ROLE_HINT[f.role]}>
              <select className="inp" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value as Role })}>
                {(Object.keys(ROLE_RU) as Role[]).map((r) => (
                  <option key={r} value={r}>
                    {ROLE_RU[r]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Пароль" hint="не короче 10 символов">
              <input className="inp" type="password" required minLength={10} autoComplete="new-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
            </Field>
            <div className="md:col-span-2">
              <button className="btn-p">Добавить</button>
            </div>
          </form>
        </Card>
        <Card title="Что видит каждая роль">
          <dl className="space-y-3 text-sm">
            {(Object.keys(ROLE_RU) as Role[]).map((r) => (
              <div key={r}>
                <dt className="font-semibold text-night">{ROLE_RU[r]}</dt>
                <dd className="text-slate-600">{ROLE_HINT[r]}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>
    </div>
  );
}

