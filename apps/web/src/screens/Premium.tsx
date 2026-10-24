import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useT } from '../i18n';
import { api } from '../lib/api';
import { tg } from '../lib/telegram';
import { useMe } from '../lib/queries';
import { Beaver } from '../components/Beaver';
import { Card, Confetti, ScreenHeader, ScreenSkeleton, cx, useToast } from '../components/ui';

type Plan = { code: string; months: number; priceStars: number; recurring: boolean; title: never };

export default function PremiumScreen() {
  const { t, tr, date } = useT();
  const qc = useQueryClient();
  const toast = useToast();
  const me = useMe().data!;
  const q = useQuery({ queryKey: ['premium'], queryFn: () => api<{ plans: Plan[]; subscription: null | { expiresAt: string; recurring: boolean; cancelled: boolean }; paymentsConfigured: boolean }>('/premium') });
  const [plan, setPlan] = useState('MONTH_3');
  const [status, setStatus] = useState<'idle' | 'waiting' | 'paid' | 'failed'>('idle');

  // Premium активує сервер після підтвердження платежу від Telegram — тут лише чекаємо його.
  const waitForActivation = async () => {
    setStatus('waiting');
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 1500));
      const fresh = await qc.fetchQuery({ queryKey: ['me'], queryFn: () => api<typeof me>('/me'), staleTime: 0 });
      if (fresh.premium.active) {
        setStatus('paid');
        qc.invalidateQueries({ queryKey: ['premium'] });
        return;
      }
    }
    setStatus('failed');
  };

  const buy = async () => {
    if (!tg) return toast(t('prem_not_tg'), 'ℹ️');
    try {
      const { link } = await api<{ link: string }>('/premium/invoice', { body: { plan } });
      tg.openInvoice(link, (s) => {
        if (s === 'paid' || s === 'pending') void waitForActivation();
        else if (s === 'failed') setStatus('failed');
      });
    } catch (e) {
      toast(t('toast_error', { msg: (e as Error).message }), '⚠️');
    }
  };

  const cancel = async () => {
    try {
      await api('/premium/cancel', { body: {} });
      qc.invalidateQueries({ queryKey: ['me'] });
      qc.invalidateQueries({ queryKey: ['premium'] });
    } catch (e) {
      toast(t('toast_error', { msg: (e as Error).message }), '⚠️');
    }
  };

  if (q.isLoading) return <ScreenSkeleton />;
  const data = q.data!;
  const sub = data.subscription;
  const monthly = (p: Plan) => Math.round(p.priceStars / p.months);
  const base = data.plans.find((p) => p.months === 1);

  return (
    <div className="space-y-5 pb-8">
      <Confetti run={status === 'paid'} />
      <ScreenHeader title={t('prem_title')} subtitle={t('prem_subtitle')} />
      <div className="mx-4 flex flex-col items-center rounded-[28px] p-5 text-center" style={{ background: 'linear-gradient(160deg,#FFE3E3,#FFF4D6 60%,#E9DDFF)' }}>
        <Beaver size={150} mood="celebrate" outfit={{ ...me.outfit.wear, HAT: 'crown-gold', COSTUME: undefined }} />
        <div className="text-3xl font-black">
          <span className="text-pl-red">POLSKI GO</span> <span className="text-xp-dark">PREMIUM</span>
        </div>
      </div>

      <Card className="mx-4 space-y-2 p-4">
        {(['prem_f1', 'prem_f2', 'prem_f3', 'prem_f4', 'prem_f5', 'prem_f6'] as const).map((k) => (
          <div key={k} className="flex items-start gap-2 font-bold">
            <span className="text-brand">✔</span>
            {t(k)}
          </div>
        ))}
        <p className="muted pt-2 text-xs font-bold">💚 {t('prem_free_note')}</p>
      </Card>

      {status === 'waiting' && <div className="mx-4 rounded-2xl bg-sky/20 p-3 text-center font-black">⏳ {t('prem_waiting')}</div>}
      {status === 'paid' && <div className="mx-4 rounded-2xl bg-brand/20 p-3 text-center font-black">{t('prem_paid')}</div>}
      {status === 'failed' && <div className="mx-4 rounded-2xl bg-coral/20 p-3 text-center font-black">{t('prem_failed')}</div>}

      {sub ? (
        <Card className="mx-4 space-y-3 p-4 text-center">
          <div className="text-lg font-black">👑 {sub.cancelled ? t('prem_cancelled', { date: date(sub.expiresAt) }) : t('prem_active', { date: date(sub.expiresAt) })}</div>
          {sub.recurring && !sub.cancelled && (
            <button className="w-full py-2 font-black text-coral" onClick={cancel}>
              {t('prem_cancel')}
            </button>
          )}
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 px-4">
            {data.plans.map((p) => {
              const save = base && p.months > 1 ? Math.round((1 - p.priceStars / (base.priceStars * p.months)) * 100) : 0;
              return (
                <button key={p.code} onClick={() => setPlan(p.code)} className={cx('card relative flex flex-col items-center gap-1 px-1 py-4', plan === p.code && 'ring-4 ring-pl-red')}>
                  {save > 0 && <span className="absolute -top-2 rounded-full bg-pl-red px-2 text-[11px] font-black text-white">-{save}%</span>}
                  <span className="text-sm font-black">{tr(p.title)}</span>
                  <span className="text-xl font-black">⭐ {p.priceStars}</span>
                  <span className="muted text-[11px] font-bold">≈ ⭐ {monthly(p)}{t('prem_month')}</span>
                  <span className="muted text-center text-[10px] font-bold leading-tight">{p.recurring ? t('prem_recurring') : t('prem_once')}</span>
                </button>
              );
            })}
          </div>
          <div className="px-4">
            <button className="btn btn-red w-full text-lg" disabled={!data.paymentsConfigured || status === 'waiting'} onClick={buy}>
              {data.paymentsConfigured ? t('prem_buy', { n: data.plans.find((p) => p.code === plan)?.priceStars ?? '' }) : t('prem_not_configured')}
            </button>
            <p className="muted mt-2 text-center text-xs font-bold">{t('prem_stars_note')}</p>
          </div>
        </>
      )}
    </div>
  );
}
