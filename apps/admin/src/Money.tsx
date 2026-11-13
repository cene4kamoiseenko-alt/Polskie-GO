/**
 * «Платежи» (обновление 2026-11-13): выручка за период с динамикой, график по дням, тарифы, кто сейчас с Premium,
 * журнал платёжных событий понятными словами с отбором и возвратом звёзд прямо в строке. Данные — /payments/summary и /payments.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from './api';
import { Bars, DayBars } from './charts';
import { useFeedback } from './feedback';
import { Badge, Card, DataTable, Kpi, LoadError, PageHeader, Segmented, Skeleton, Time, fmt, useLoad, type Col, type Tone } from './ui';

type Pair = { now: number; prev: number };
type Summary = {
  days: number;
  daily: { days: string[]; stars: number[]; payments: number[]; refunds: number[] };
  totals: { stars: Pair; payments: Pair; payers: number; refunds: number; refundStars: number; net: number; failed: number; invoices: number; cancels: number };
  plans: { plan: string; title: string | null; count: number; stars: number }[];
  premium: { total: number; renewing: number; cancelled: number; granted: number; endingSoon: number; byPlan: { plan: string; count: number }[] };
};
export type PayEvent = {
  id: string; type: string; planCode: string | null; amount: number | null; chargeId: string | null; payload: string | null; error: string | null; createdAt: string;
  refunded?: boolean; planTitle?: string | null; user: { id: string; firstName: string | null; username: string | null } | null;
};

export const EVENT: Record<string, [string, Tone]> = {
  INVOICE_CREATED: ['открыл оплату', 'gray'],
  PRE_CHECKOUT: ['проверка перед оплатой', 'gray'],
  SUCCESSFUL_PAYMENT: ['оплата', 'green'],
  REFUND: ['возврат звёзд', 'red'],
  CANCEL: ['отменил автопродление', 'gold'],
};
const PAY_ERROR: Record<string, string> = {
  plan_not_found: 'тариф не найден',
  user_mismatch: 'платил другой аккаунт Telegram',
  invoice_not_found: 'счёт не найден или устарел',
  currency_mismatch: 'не та валюта',
  amount_mismatch: 'сумма не совпала со счётом',
  'Invoice not found': 'счёт не найден',
  'Invoice belongs to another user': 'счёт другого игрока',
  'Unsupported currency': 'не та валюта',
  'Price changed, please try again': 'цена изменилась — Telegram предложил оплатить заново',
  'Account is blocked': 'игрок заблокирован',
};
/** Ошибка платежа по-русски; «auto:…» — Telegram вернул звёзды сам, потому что платёж не прошёл проверку. */
export function payError(e: string | null) {
  if (!e) return null;
  if (e.startsWith('auto:')) return `звёзды возвращены автоматически: ${PAY_ERROR[e.slice(5)] ?? e.slice(5)}`;
  return PAY_ERROR[e] ?? e;
}

const PLAN_RU: Record<string, string> = { ADMIN_GRANT: 'подарок от админа' };
const planName = (code: string | null, title?: string | null) => (code ? (title ?? PLAN_RU[code] ?? code) : '—');

const FILTERS: [string, string][] = [
  ['', 'Все'],
  ['SUCCESSFUL_PAYMENT', 'Оплаты'],
  ['REFUND', 'Возвраты'],
  ['CANCEL', 'Отмены'],
  ['INVOICE_CREATED', 'Открыли оплату'],
  ['PRE_CHECKOUT', 'Проверки'],
];

/** Вернуть звёзды за платёж. Только главный администратор; Premium по этому платежу отключается сразу. */
export function RefundButton({ chargeId, who, amount, onDone }: { chargeId: string; who: string; amount: number | null; onDone: () => void }) {
  const { confirm, run } = useFeedback();
  const [busy, setBusy] = useState(false);
  return (
    <button
      className="btn-s !px-2.5 !py-1 text-xs text-[#b42336]"
      disabled={busy}
      onClick={async () => {
        const ok = await confirm({
          title: `Вернуть ${amount ?? ''} ⭐ игроку ${who}?`,
          body: (
            <>
              <p>Telegram вернёт звёзды, Premium по этому платежу отключится сразу, игрок получит сообщение в боте.</p>
              <p className="font-semibold text-night">Отменить возврат нельзя.</p>
            </>
          ),
          confirm: 'Вернуть звёзды',
          danger: true,
        });
        if (!ok) return;
        setBusy(true);
        if (await run(() => api('/payments/refund', { body: { chargeId } }), 'Звёзды возвращены')) onDone();
        setBusy(false);
      }}
    >
      ↩ Вернуть звёзды
    </button>
  );
}

export default function Money({ superadmin }: { superadmin: boolean }) {
  const [days, setDays] = useState(30);
  const sum = useLoad<Summary>(() => api(`/payments/summary?days=${days}`), [days]);
  const s = sum.data;
  return (
    <div className="space-y-5">
      <PageHeader title="Платежи" subtitle="Звёзды Telegram за выбранный период и сравнение с таким же периодом раньше" actions={<Segmented label="Период" value={days} onChange={setDays} options={[[7, '7 дней'], [30, '30 дней'], [90, '90 дней']]} />} />
      {sum.error && <LoadError error={sum.error} retry={sum.reload} />}
      {!s ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}</div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" data-money-kpis>
            <Kpi label="Выручка" tone="gold" icon="⭐" value={`${fmt(s.totals.stars.now)} ⭐`} now={s.totals.stars.now} prev={s.totals.stars.prev} />
            <Kpi label="Оплат" tone="brand" icon="🧾" value={fmt(s.totals.payments.now)} now={s.totals.payments.now} prev={s.totals.payments.prev} hint={`платили ${fmt(s.totals.payers)} чел.`} />
            <Kpi
              label="После возвратов"
              tone="sky"
              icon="💰"
              value={`${fmt(s.totals.net)} ⭐`}
              hint={s.totals.refunds ? `возвратов ${s.totals.refunds} на ${fmt(s.totals.refundStars)} ⭐` : 'возвратов не было'}
            />
            <Kpi
              label="С Premium сейчас"
              tone="night"
              icon="👑"
              value={fmt(s.premium.total)}
              hint={
                <span>
                  продлится сам {s.premium.renewing} · отменили {s.premium.cancelled}
                  {s.premium.granted > 0 && ` · подарено ${s.premium.granted}`}
                </span>
              }
            />
          </div>
          <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <Card title="Выручка по дням" subtitle="успешные оплаты; автовозвраты сюда не входят">
              <DayBars label="Выручка, звёзды" unit="⭐" days={s.daily.days} series={[{ label: 'Звёзды', color: '#e39a14', values: s.daily.stars }]} />
            </Card>
            <div className="space-y-4">
              <Card title="По тарифам" subtitle="оплаты за период">
                <Bars color="#e39a14" empty="Оплат за период не было" items={s.plans.map((p) => ({ key: p.plan, label: `${planName(p.plan, p.title)} · ${p.count} опл.`, value: p.stars }))} />
              </Card>
              <Card title="На что обратить внимание">
                <ul className="space-y-2 text-sm" data-money-watch>
                  <li className="flex justify-between gap-2">
                    <span>Открыли оплату → оплатили</span>
                    <b className="text-night">
                      {fmt(s.totals.invoices)} → {fmt(s.totals.payments.now)}
                      {s.totals.invoices > 0 && <span className="ml-1 text-xs font-semibold text-slate-500">{Math.round((s.totals.payments.now / s.totals.invoices) * 100)} %</span>}
                    </b>
                  </li>
                  <li className="flex justify-between gap-2">
                    <span>Платёж не прошёл проверку</span>
                    <b className={s.totals.failed ? 'text-[#b42336]' : 'text-night'}>{fmt(s.totals.failed)}</b>
                  </li>
                  <li className="flex justify-between gap-2">
                    <span>Отменили автопродление</span>
                    <b className="text-night">{fmt(s.totals.cancels)}</b>
                  </li>
                  <li className="flex justify-between gap-2">
                    <span>Premium закончится за 7 дней</span>
                    <b className="text-night">{fmt(s.premium.endingSoon)}</b>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </>
      )}
      <PaymentLog superadmin={superadmin} onRefund={sum.reload} />
    </div>
  );
}

/** Журнал платёжных событий: отбор по виду, «показать ещё», возврат звёзд в строке оплаты. */
export function PaymentLog({ superadmin, onRefund, user }: { superadmin: boolean; onRefund?: () => void; user?: string }) {
  const [type, setType] = useState('');
  const [pages, setPages] = useState(1);
  const qs = (skip: number) => `/payments?skip=${skip}${type ? `&type=${type}` : ''}${user ? `&user=${user}` : ''}`;
  const { data, error, loading, reload } = useLoad<{ items: PayEvent[]; total: number }>(async () => {
    const parts = await Promise.all(Array.from({ length: pages }, (_, i) => api<{ items: PayEvent[]; total: number }>(qs(i * 100))));
    return { items: parts.flatMap((p) => p.items), total: parts[0]?.total ?? 0 };
  }, [type, pages, user]);
  const done = () => {
    reload();
    onRefund?.();
  };
  const cols: Col<PayEvent>[] = [
    { key: 'at', label: 'Когда', render: (e) => <Time v={e.createdAt} /> },
    ...(!user
      ? [
          {
            key: 'who',
            label: 'Игрок',
            render: (e: PayEvent) =>
              e.user ? (
                <Link className="link" to={`/users/${e.user.id}`}>
                  {e.user.firstName || 'без имени'}
                  {e.user.username && <span className="ml-1 font-normal text-slate-500">@{e.user.username}</span>}
                </Link>
              ) : (
                <span className="text-slate-500">—</span>
              ),
          },
        ]
      : []),
    {
      key: 'ev',
      label: 'Событие',
      render: (e) => {
        const [text, tone] = EVENT[e.type] ?? [e.type, 'gray' as Tone];
        return (
          <span className="flex flex-wrap items-center gap-1">
            <Badge tone={e.error && e.type !== 'REFUND' ? 'red' : tone}>{text}</Badge>
            {e.refunded && <Badge tone="red">возвращено</Badge>}
          </span>
        );
      },
    },
    { key: 'plan', label: 'Тариф', render: (e) => planName(e.planCode, e.planTitle) },
    { key: 'amount', label: 'Звёзды', align: 'right', render: (e) => (e.amount != null ? `${fmt(e.amount)} ⭐` : '—') },
    {
      key: 'note',
      label: 'Подробности',
      render: (e) => (
        <span className="flex flex-wrap items-center gap-2">
          {payError(e.error) && <span className="text-xs text-[#b42336]">{payError(e.error)}</span>}
          {superadmin && e.type === 'SUCCESSFUL_PAYMENT' && !e.error && !e.refunded && e.chargeId && (
            <RefundButton chargeId={e.chargeId} amount={e.amount} who={e.user?.firstName || 'без имени'} onDone={done} />
          )}
          {e.chargeId && (
            <span className="max-w-[12rem] truncate font-mono text-[11px] text-slate-500" title={`Номер платежа в Telegram: ${e.chargeId}`}>
              {e.chargeId}
            </span>
          )}
        </span>
      ),
    },
  ];
  return (
    <Card
      title="Журнал платежей"
      subtitle={data ? `${fmt(data.total)} событий${type ? ' этого вида' : ''}` : undefined}
      bodyClass="p-0"
      actions={
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Вид события">
          {FILTERS.map(([v, label]) => (
            <button
              key={v}
              className={v === type ? 'chip chip-on' : 'chip'}
              aria-pressed={v === type}
              onClick={() => {
                setType(v);
                setPages(1);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      }
      data-payment-log
    >
      {error && (
        <div className="p-4">
          <LoadError error={error} retry={reload} />
        </div>
      )}
      <DataTable cols={cols} rows={data?.items} loading={loading} rowKey={(e) => e.id} empty="Платёжных событий нет" caption="Журнал платёжных событий" />
      {data && data.items.length < data.total && (
        <div className="border-t border-line p-3 text-center">
          <button className="btn-s" disabled={loading} onClick={() => setPages((p) => p + 1)}>
            Показать ещё ({fmt(data.total - data.items.length)})
          </button>
        </div>
      )}
    </Card>
  );
}
