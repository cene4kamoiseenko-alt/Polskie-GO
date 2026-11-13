/**
 * «Поддержка» и «Жалобы» (обновление 2026-11-13): переписка выглядит как чат, платежи человека — рядом с обращением,
 * опасные действия (возврат, блокировка) — через окно подтверждения, итог — всплывающим сообщением.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from './api';
import { useFeedback } from './feedback';
import { EVENT, RefundButton, payError } from './Money';
import { Badge, Card, Empty, LoadError, PageHeader, Segmented, Skeleton, Time, cx, fmt, useLoad } from './ui';

type SupportItem = {
  id: string;
  telegramId: string;
  status: 'OPEN' | 'DONE';
  text: string | null;
  reply: string | null;
  createdAt: string;
  updatedAt: string;
  user: { id: string; firstName: string | null; username: string | null } | null;
  payments: { type: string; planCode: string | null; amount: number | null; chargeId: string | null; error: string | null; createdAt: string }[];
};

export function Support({ superadmin, onChange }: { superadmin: boolean; onChange?: () => void }) {
  const [status, setStatus] = useState<'OPEN' | 'DONE' | 'all'>('OPEN');
  const { data, error, reload } = useLoad<{ items: SupportItem[] }>(() => api(`/support?status=${status}`), [status]);
  const changed = () => {
    reload();
    onChange?.();
  };
  return (
    <div className="space-y-5">
      <PageHeader
        title="Поддержка по оплате"
        subtitle="Игрок пишет боту /paysupport, его следующее сообщение становится обращением. Ответ уходит игроку в бот и закрывает обращение."
        actions={<Segmented label="Обращения" value={status} onChange={setStatus} options={[['OPEN', 'Открытые'], ['DONE', 'Закрытые'], ['all', 'Все']]} />}
      />
      {error && <LoadError error={error} retry={reload} />}
      {!data ? (
        <Skeleton className="h-40" />
      ) : !data.items.length ? (
        <Empty>{status === 'OPEN' ? 'Открытых обращений нет — все ответы отправлены.' : 'Обращений нет.'}</Empty>
      ) : (
        <div className="space-y-4">
          {data.items.map((r) => (
            <SupportCard key={r.id} r={r} superadmin={superadmin} onDone={changed} />
          ))}
        </div>
      )}
    </div>
  );
}

function SupportCard({ r, superadmin, onDone }: { r: SupportItem; superadmin: boolean; onDone: () => void }) {
  const { run, confirm } = useFeedback();
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const who = r.user?.firstName || 'Без приложения';
  const refunded = new Set(r.payments.filter((p) => p.type === 'REFUND').map((p) => p.chargeId));
  const act = async (fn: () => Promise<unknown>, ok: string) => {
    setBusy(true);
    if (await run(fn, ok)) onDone();
    setBusy(false);
  };
  return (
    <Card
      data-support={r.status}
      title={
        <span className="flex flex-wrap items-center gap-2">
          {r.user ? (
            <Link className="link" to={`/users/${r.user.id}`}>
              {who}
            </Link>
          ) : (
            who
          )}
          {r.user?.username && <span className="text-sm font-normal text-slate-500">@{r.user.username}</span>}
          <Badge tone={r.status === 'OPEN' ? 'gold' : 'green'}>{r.status === 'OPEN' ? 'ждёт ответа' : 'закрыто'}</Badge>
        </span>
      }
      subtitle={
        <>
          Telegram ID <span className="font-mono">{r.telegramId}</span> · <Time v={r.createdAt} />
        </>
      }
    >
      <div className="space-y-3">
        <p className="max-w-2xl whitespace-pre-wrap rounded-2xl rounded-tl-md bg-slate-100 px-4 py-3 text-sm text-slate-800">{r.text}</p>
        {r.reply && (
          <div className="ml-auto max-w-2xl rounded-2xl rounded-tr-md bg-brand-soft px-4 py-3 text-sm text-slate-800">
            <div className="mb-1 text-xs font-semibold text-[#13784f]">Ответ поддержки · <Time v={r.updatedAt} /></div>
            <p className="whitespace-pre-wrap">{r.reply}</p>
          </div>
        )}
        {r.payments.length > 0 && (
          <details className="rounded-xl border border-line" open={r.status === 'OPEN'}>
            <summary className="cursor-pointer px-3 py-2 text-sm font-semibold text-slate-700">Платежи игрока ({r.payments.length})</summary>
            <ul className="divide-y divide-line border-t border-line text-sm">
              {r.payments.map((p, i) => (
                <li key={i} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2">
                  <Time v={p.createdAt} />
                  <Badge tone={EVENT[p.type]?.[1] ?? 'gray'}>{EVENT[p.type]?.[0] ?? p.type}</Badge>
                  <span>{p.planCode ?? '—'}</span>
                  <b className="tabular-nums">{p.amount != null ? `${fmt(p.amount)} ⭐` : ''}</b>
                  {payError(p.error) && <span className="text-xs text-[#b42336]">{payError(p.error)}</span>}
                  {p.type === 'SUCCESSFUL_PAYMENT' && refunded.has(p.chargeId) && <Badge tone="red">возвращено</Badge>}
                  {superadmin && p.type === 'SUCCESSFUL_PAYMENT' && !p.error && p.chargeId && !refunded.has(p.chargeId) && (
                    <span className="ml-auto">
                      <RefundButton chargeId={p.chargeId} amount={p.amount} who={who} onDone={onDone} />
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </details>
        )}
        {r.status === 'OPEN' && (
          <form
            className="space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (reply.trim()) void act(() => api(`/support/${r.id}/reply`, { body: { text: reply } }), 'Ответ отправлен в бот');
            }}
          >
            <label className="block text-sm font-semibold text-slate-700" htmlFor={`reply-${r.id}`}>
              Ответ игроку <span className="font-normal text-slate-500">— придёт от бота</span>
            </label>
            <textarea id={`reply-${r.id}`} className="inp min-h-[90px]" value={reply} maxLength={3500} onChange={(e) => setReply(e.target.value)} />
            <div className="flex flex-wrap items-center gap-2">
              <button className="btn-p" disabled={busy || !reply.trim()}>
                Ответить в бот
              </button>
              <button
                type="button"
                className="btn-s"
                disabled={busy}
                onClick={async () => {
                  if (await confirm({ title: 'Закрыть без ответа?', body: 'Игрок не получит сообщения. Закрывайте так, если вопрос уже решён в другом месте.', confirm: 'Закрыть' }))
                    void act(() => api(`/support/${r.id}/close`, { body: {} }), 'Обращение закрыто');
                }}
              >
                Закрыть без ответа
              </button>
              <span className={cx('ml-auto text-xs', reply.length > 3300 ? 'text-[#b42336]' : 'text-slate-500')}>{reply.length} / 3500</span>
            </div>
          </form>
        )}
      </div>
    </Card>
  );
}

type ReportItem = { userId: string; name: string; username: string | null; guest: boolean; banned: boolean; count: number; reasons: string[]; lastAt: string };
const REASON_RU: Record<string, string> = { name: 'имя', photo: 'фото', other: 'другое' };

/** Жалобы игроков на имена и фото (требование Google Play): по игрокам, больше жалоб — выше. */
export function Reports({ onChange }: { onChange?: () => void }) {
  const [status, setStatus] = useState<'OPEN' | 'DONE'>('OPEN');
  const { data, error, reload } = useLoad<{ items: ReportItem[] }>(() => api(`/reports?status=${status}`), [status]);
  const { run, confirm } = useFeedback();
  const resolve = async (r: ReportItem, action: 'dismiss' | 'reset_name' | 'ban') => {
    if (
      action === 'ban' &&
      !(await confirm({ title: `Заблокировать «${r.name}»?`, body: 'Игрок больше не сможет войти в приложение. Разблокировать можно в его профиле.', confirm: 'Заблокировать', danger: true }))
    )
      return;
    const ok = await run(() => api(`/reports/${r.userId}/resolve`, { body: { action } }), action === 'ban' ? 'Игрок заблокирован' : action === 'reset_name' ? 'Имя сброшено на «Bóbr»' : 'Жалобы закрыты');
    if (ok) {
      reload();
      onChange?.();
    }
  };
  return (
    <div className="space-y-5">
      <PageHeader
        title="Жалобы на игроков"
        subtitle="Игроки жалуются на имя или фото в рейтинге и у друзей. Разбирайте открытые жалобы не реже раза в сутки: этого ждёт Google Play."
        actions={<Segmented label="Жалобы" value={status} onChange={setStatus} options={[['OPEN', 'Открытые'], ['DONE', 'Разобранные']]} />}
      />
      <Card>
        <dl className="grid gap-3 text-sm md:grid-cols-3">
          <div>
            <dt className="font-semibold text-night">Сбросить имя</dt>
            <dd className="text-slate-600">имя станет «Bóbr», описание профиля очистится</dd>
          </div>
          <div>
            <dt className="font-semibold text-night">Заблокировать</dt>
            <dd className="text-slate-600">вход в приложение закрывается</dd>
          </div>
          <div>
            <dt className="font-semibold text-night">Оставить как есть</dt>
            <dd className="text-slate-600">жалобы закрываются без изменений</dd>
          </div>
        </dl>
      </Card>
      {error && <LoadError error={error} retry={reload} />}
      {!data ? (
        <Skeleton className="h-32" />
      ) : !data.items.length ? (
        <Empty>{status === 'OPEN' ? 'Открытых жалоб нет.' : 'Разобранных жалоб пока нет.'}</Empty>
      ) : (
        <div className="space-y-3">
          {data.items.map((r) => (
            <div key={r.userId} className="panel flex flex-wrap items-center gap-3 p-4" data-report>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-coral-soft text-lg font-black text-[#b42336]" aria-hidden>
                {r.count}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link className="link break-words" to={`/users/${r.userId}`}>
                    {r.name}
                  </Link>
                  {r.username && <span className="text-sm text-slate-500">@{r.username}</span>}
                  {r.guest && <Badge tone="sky">гость</Badge>}
                  {r.banned && <Badge tone="red">заблокирован</Badge>}
                </div>
                <div className="text-sm text-slate-600">
                  {r.count} {r.count === 1 ? 'жалоба' : r.count < 5 ? 'жалобы' : 'жалоб'} · на {r.reasons.map((x) => REASON_RU[x] ?? x).join(', ')} · последняя <Time v={r.lastAt} />
                </div>
              </div>
              {status === 'OPEN' && (
                <div className="flex flex-wrap gap-2">
                  <button className="btn-p" onClick={() => resolve(r, 'reset_name')}>
                    Сбросить имя
                  </button>
                  <button className="btn-d" onClick={() => resolve(r, 'ban')}>
                    Заблокировать
                  </button>
                  <button className="btn-s" onClick={() => resolve(r, 'dismiss')}>
                    Оставить как есть
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
