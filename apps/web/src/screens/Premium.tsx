import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { I18n } from '@polski-go/shared';
import { Icon, type LineIconName } from '../components/Icon';
import { useState } from 'react';
import { useT, type TKey } from '../i18n';
import { api } from '../lib/api';
import { haptic, openBotChat, tg } from '../lib/telegram';
import { isStandalone } from '../lib/platform';
import { useStandaloneCopy } from '../lib/standaloneCopy';
import { useMe } from '../lib/queries';
import { Beaver } from '../components/Beaver';
import { Card, Confetti, ScreenHeader, ScreenSkeleton, cx, useToast } from '../components/ui';
import { Art } from '../components/GameArt';
import { artImage } from '../lib/assets';
import { missionsQuery } from '../components/MissionCard';
import { useNavigate } from 'react-router-dom';

type Plan = { code: string; months: number; priceStars: number; recurring: boolean; title: never };
type Loyalty = { claimed: number; steps: { at: number; zlotki: number; done: boolean }[] };
type Gift = { month: string; ready: boolean; claimed: boolean; zlotki: number; item: { id: string; slug: string; slot: string; name: I18n } | null; loyalty: Loyalty };
type Bonuses = { welcome: { zlotki: number; received: boolean }; plan: Record<string, number> };
type PremiumData = {
  plans: Plan[];
  subscription: null | { expiresAt: string; recurring: boolean; cancelled: boolean };
  canBuy: boolean;
  bonuses: Bonuses;
  paymentsConfigured: boolean;
  gift: Gift;
  bot: string | null;
};

/** Що дає Premium — лише те, що справді працює (ШІ — коли його підключено на сервері). Пропуск місяця — окремою карткою вгорі. */
const FEATURES: [LineIconName, TKey, TKey][] = [
  ['crown', 'prem_pass', 'prem_pass_feat_d'],
  ['chat', 'prem_scenes', 'prem_scenes_d'],
  ['flame', 'prem_shield', 'prem_shield_d'],
  ['bolt', 'prem_xp2', 'prem_xp2_d'],
  ['gift', 'prem_gift', 'prem_gift_d'],
  ['crown', 'prem_items', 'prem_items_d'],
];

/** Баннери власника (2026-11-02, scripts/build-premium-art.mjs): змінюються раз на день за місцевою датою. Немає файлу — намальована шапка, як раніше. */
const BANNERS = [
  { file: 'premium-oldtown', width: 1200 },
  { file: 'premium-mountains', width: 756 },
];
export function todayBanner(now = new Date()): { file: string; src: string; srcSet: string | undefined } | null {
  const list = BANNERS.flatMap((b) => {
    const art = artImage('premium', b);
    return art ? [{ file: b.file, ...art }] : [];
  });
  if (!list.length) return null;
  const day = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86_400_000);
  return list[day % list.length];
}

/** Перший день наступного місяця (місяць подарунка — «YYYY-MM»). */
const nextMonthStart = (month: string) => {
  const [y, m] = month.split('-').map(Number);
  return new Date(Date.UTC(m === 12 ? y + 1 : y, m === 12 ? 0 : m, 1));
};

export default function PremiumScreen() {
  const { t, tr, date } = useT();
  const copy = useStandaloneCopy();
  const qc = useQueryClient();
  const toast = useToast();
  const me = useMe().data!;
  const nav = useNavigate();
  const q = useQuery({ queryKey: ['premium'], queryFn: () => api<PremiumData>('/premium') });
  const missions = useQuery(missionsQuery);
  const pass = missions.data?.pass;
  const [plan, setPlan] = useState('MONTH_3');
  const [status, setStatus] = useState<'idle' | 'waiting' | 'paid' | 'slow'>('idle');
  const [gotGift, setGotGift] = useState<{ zlotki: number; loyaltyBonus: number; item: Gift['item'] } | null>(null);

  // Premium активує сервер після підтвердження платежу від Telegram — тут лише чекаємо його.
  // Не дочекалися — це не «оплата не пройшла»: платіж може підтвердитися пізніше, Premium увімкнеться сам.
  const waitForActivation = async () => {
    setStatus('waiting');
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 1500));
      const fresh = await qc.fetchQuery({ queryKey: ['me'], queryFn: () => api<typeof me>('/me'), staleTime: 0 });
      if (fresh.premium.active) {
        setStatus('paid');
        qc.invalidateQueries({ queryKey: ['premium'] });
        qc.invalidateQueries({ queryKey: ['missions'] });
        return;
      }
    }
    setStatus('slow');
  };

  const buy = async () => {
    if (!tg) return toast(t('prem_not_tg'), 'ℹ️');
    try {
      const { link } = await api<{ link: string }>('/premium/invoice', { body: { plan } });
      tg.openInvoice(link, (s) => {
        // «failed» і «cancelled» — платежу не було, нічого не вмикаємо й не лякаємо помилкою.
        if (s === 'paid' || s === 'pending') void waitForActivation();
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

  const claimGift = async () => {
    try {
      const r = await api<{ zlotki: number; loyaltyBonus: number; item: Gift['item'] }>('/premium/gift', { body: {} });
      setGotGift(r);
      haptic.success();
      qc.invalidateQueries({ queryKey: ['me'] });
      qc.invalidateQueries({ queryKey: ['premium'] });
      qc.invalidateQueries({ queryKey: ['shop'] });
    } catch (e) {
      toast(t('toast_error', { msg: (e as Error).message }), '⚠️');
    }
  };

  // Поддержка по оплате: сервер открывает обращение и сам присылает в чат бота подсказку «опишите одним сообщением»; затем открываем чат
  // и закрываем Mini App (иначе чат остался бы под ним). Если сервер не смог написать первым (бота не запускали, сбой) — ссылка со
  // стартовым параметром, она запускает ту же поддержку в боте.
  const [supportBusy, setSupportBusy] = useState(false);
  const openSupport = async () => {
    const bot = q.data?.bot;
    if (!bot || supportBusy) return;
    haptic.tap();
    setSupportBusy(true);
    try {
      const r = await api<{ sent: boolean }>('/support/open', { body: {} }).catch(() => ({ sent: false }));
      openBotChat(bot, r.sent ? undefined : 'paysupport');
    } finally {
      setSupportBusy(false);
    }
  };

  if (q.isLoading) return <ScreenSkeleton />;
  const data = q.data!;
  const sub = data.subscription;
  const gift = data.gift;
  const shield = me.premium.shield;
  const monthly = (p: Plan) => Math.round(p.priceStars / p.months);
  const base = data.plans.find((p) => p.months === 1);
  const banner = todayBanner();
  const features: [LineIconName, string, string][] = [
    ...FEATURES.map(([icon, title, desc]) => [icon, t(title), t(desc, { n: gift.zlotki })] as [LineIconName, string, string]),
  ];

  return (
    <div className="space-y-5 pb-8">
      <Confetti run={status === 'paid' || !!gotGift} />
      <ScreenHeader title={t('prem_title')} subtitle={t('prem_subtitle')} />
      {banner ? (
        // Баннер владельца (2026-11-02) вместо нарисованной шапки; надписи на кадре — по-русски. Для чтения с экрана — заголовок текстом.
        <div className="mx-4 overflow-hidden rounded-[28px] border-2 border-[#F5C451]/60 shadow-[var(--shadow-card)]" data-premium-banner={banner.file}>
          <h2 className="sr-only">POLSKI GO Premium — {t('prem_hero_d')}</h2>
          <img src={banner.src} srcSet={banner.srcSet} sizes="(min-width: 576px) 544px, calc(100vw - 32px)" alt="" className="block aspect-[3/2] w-full object-cover" decoding="async" draggable={false} />
        </div>
      ) : (
        <div className="premium-hero mx-4 rounded-[28px] p-5 text-center">
          <div className="premium-hero-crown flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-[0.15em]"><Icon name="crown" size={18} filled /> POLSKI GO</div>
          <Beaver size={150} mood="pay" />
          <div className="premium-hero-title text-[28px] font-black leading-tight">PREMIUM</div>
          <div className="premium-hero-subtitle mt-1 text-[13px] font-bold">{t('prem_hero_d')}</div>
        </div>
      )}

      {status === 'waiting' && <div className="mx-4 rounded-2xl bg-sky/20 p-3 text-center font-black"><span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-sky-dark/30 border-t-sky-dark align-middle" />{t('prem_waiting')}</div>}
      {status === 'paid' && <div className="mx-4 rounded-2xl bg-brand/20 p-3 text-center font-black">{t('prem_paid')}</div>}
      {status === 'slow' && <div className="mx-4 rounded-2xl bg-xp/25 p-3 text-center text-sm font-bold">{t('prem_slow')}</div>}

      {sub && (
        <Card className="mx-4 space-y-3 p-4">
          <div className="flex items-center gap-2 text-lg font-black"><Icon name="crown" size={22} className="text-xp-dark" filled /> {sub.cancelled ? t('prem_cancelled', { date: date(sub.expiresAt) }) : t('prem_active', { date: date(sub.expiresAt) })}</div>
          {shield && (
            <div className="flex items-start gap-2 text-sm font-bold">
              <Icon name="flame" size={18} className="mt-0.5 shrink-0 text-coral" />
              {shield.ready ? t('prem_shield_ready') : t('prem_shield_used', { date: date(shield.usedOn!), ready: date(shield.readyOn!) })}
            </div>
          )}
          {sub.recurring && !sub.cancelled && (
            <>
              <p className="muted text-xs font-bold">{t('prem_recurring_note')}</p>
              <button className="w-full py-1 font-black text-coral" onClick={cancel}>
                {t('prem_cancel')}
              </button>
            </>
          )}
        </Card>
      )}

      {/* Пропуск місяця — головне, що дає Premium: сезонна локація з власними місіями. */}
      <div className="premium-pass-feature card mx-4 space-y-3 p-4" data-premium-pass>
        <div className="flex items-start gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-xp/25"><Art name="crown" size={30} /></span>
          <div className="min-w-0 flex-1">
            <div className="text-lg font-black leading-tight">{t('prem_pass')}</div>
            <div className="muted text-sm font-semibold leading-snug">{t('prem_pass_d')}</div>
            {pass?.current && <div className="mt-1 text-sm font-black text-xp-dark">{t('prem_pass_now', { title: tr(pass.current.title) })}</div>}
            {!pass?.current && pass?.upcoming[0] && <div className="mt-1 text-sm font-black text-xp-dark">{t('prem_pass_next', { title: tr(pass.upcoming[0].title) })}</div>}
          </div>
        </div>
        <button className="btn btn-sky w-full !py-2 text-sm" onClick={() => nav('/pass')}>{t('prem_see_pass')}</button>
      </div>

      {/* Подарунок місяця: з Premium — забрати; без — показуємо, що він дає. */}
      <Card className={cx('mx-4 flex items-center gap-3 p-4', gift.ready && 'ring-4 ring-xp')}>
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-xp/30 text-xp-dark"><Icon name="gift" size={26} /></span>
        <div className="min-w-0 flex-1">
          <div className="font-black">{t('prem_gift_title')}</div>
          <div className="muted text-sm font-bold">
            {gotGift
              ? t('prem_gift_got', { n: gotGift.zlotki, item: gotGift.item ? ` · ${tr(gotGift.item.name)}` : '' }) + (gotGift.loyaltyBonus ? t('prem_gift_loyalty', { n: gotGift.loyaltyBonus }) : '')
              : gift.claimed
                ? t('prem_gift_claimed', { date: date(nextMonthStart(gift.month)) })
                : sub
                  ? t('prem_gift_d', { n: gift.zlotki })
                  : t('prem_gift_locked', { n: gift.zlotki })}
          </div>
        </div>
        {gift.ready && !gotGift && (
          <button className="btn btn-xp shrink-0 !px-3 !py-2 text-sm" onClick={claimGift}>{t('prem_gift_claim')}</button>
        )}
      </Card>

      {/* Бонусы Premium: приветственный, лояльность (3-й, 6-й, 12-й месяц), бонус предоплаченных тарифов. Суммы — с сервера (настройки нагрод). */}
      <div className="card mx-4 space-y-3 p-4" data-premium-bonuses>
        <div className="font-black">{t('prem_bonus_title')}</div>
        <div className="flex items-start gap-2 text-sm font-bold" data-premium-welcome={data.bonuses.welcome.received ? 'received' : 'pending'}>
          <Icon name="gift" size={18} className="mt-0.5 shrink-0 text-xp-dark" />
          {data.bonuses.welcome.received ? t('prem_welcome_got', { n: data.bonuses.welcome.zlotki }) : t('prem_welcome', { n: data.bonuses.welcome.zlotki })}
        </div>
        <div>
          <div className="text-sm font-black">{t('prem_loyalty_title', { n: gift.loyalty.claimed })}</div>
          <div className="mt-2 grid grid-cols-3 gap-2" data-premium-loyalty>
            {gift.loyalty.steps.map((st) => (
              <div key={st.at} data-loyalty-step={st.at} data-done={st.done} className={cx('rounded-xl border-2 px-1 py-2 text-center text-xs font-black', st.done ? 'border-brand bg-brand/15 text-brand-dark' : 'border-soft')}>
                {st.done && '✓ '}
                {t('prem_loyalty_step', { at: st.at, n: st.zlotki })}
              </div>
            ))}
          </div>
          <p className="muted mt-2 text-xs font-bold">{t('prem_loyalty_d')}</p>
        </div>
        <p className="muted text-xs font-bold">{t('prem_plan_bonus_note')}</p>
      </div>

      <Card className="mx-4 space-y-3 p-4">
        {features.map(([icon, title, desc]) => (
          <div key={title} className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand/15 text-brand-dark"><Icon name={icon} size={20} /></span>
            <div className="min-w-0">
              <div className="font-black leading-tight">{title}</div>
              <div className="muted text-sm font-semibold leading-snug">{desc}</div>
            </div>
          </div>
        ))}
        <p className="muted pt-1 text-xs font-bold">{t('prem_free_note')}</p>
      </Card>

      {/* Android-приложение и веб без Telegram: Stars там не платятся, оплата в Android-версии — через Google Play (docs/ANDROID_RU.md). */}
      {data.canBuy && isStandalone && (
        <Card className="mx-4 p-4 text-sm font-semibold leading-snug" ><p data-premium-store-note>{copy('prem_store_only')}</p></Card>
      )}
      {data.canBuy && !isStandalone && (
        <>
          {sub && (
            <div className="px-4" data-premium-extend>
              <div className="font-black">{t('prem_extend_title')}</div>
              <p className="muted text-xs font-bold">{t('prem_extend_d')}</p>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2 px-4">
            {data.plans.map((p) => {
              const save = base && p.months > 1 ? Math.round((1 - p.priceStars / (base.priceStars * p.months)) * 100) : 0;
              return (
                <button key={p.code} onClick={() => setPlan(p.code)} className={cx('card relative flex flex-col items-center gap-1 px-1 pb-4 pt-6', plan === p.code && 'ring-4 ring-xp')}>
                  <span className={cx('absolute left-2 top-2 grid h-5 w-5 place-items-center rounded-full border-2 text-[11px] font-black', plan === p.code ? 'border-brand bg-brand text-white' : 'border-soft')}>
                    {plan === p.code ? '✓' : ''}
                  </span>
                  {save > 0 && <span className="absolute -top-2 rounded-full bg-pl-red px-2 text-[11px] font-black text-white">-{save}%</span>}
                  <span className="text-sm font-black">{tr(p.title)}</span>
                  <span className="flex items-center gap-1 text-xl font-black"><Icon name="star" size={18} className="text-xp-dark" /> {p.priceStars}</span>
                  <span className="muted text-[11px] font-bold">≈ {monthly(p)} Stars{t('prem_month')}</span>
                  <span className="muted text-center text-[10px] font-bold leading-tight">{p.recurring ? t('prem_recurring') : t('prem_once')}</span>
                  {(data.bonuses.plan[p.code] ?? 0) > 0 && <span className="text-[11px] font-black text-xp-dark" data-plan-bonus={p.code}>+{data.bonuses.plan[p.code]} Złotki</span>}
                </button>
              );
            })}
          </div>
          <div className="px-4">
            <button className="btn btn-xp w-full text-lg" disabled={!data.paymentsConfigured || status === 'waiting'} onClick={buy}>
              <Icon name="crown" size={20} filled />{' '}
              {data.paymentsConfigured ? t('prem_buy', { n: data.plans.find((p) => p.code === plan)?.priceStars ?? '' }) : t('prem_not_configured')}
            </button>
            <p className="mt-2 text-center text-sm font-black text-xp-dark" data-premium-includes-pass><Icon name="crown" size={16} filled className="mr-1 inline-block align-[-3px]" />{t('prem_pass_included')}</p>
            <p className="muted mt-1 text-center text-xs font-bold">{t('prem_stars_note')}</p>
          </div>
        </>
      )}

      {/* Умови й підтримка з оплат (вимоги Telegram до оплат у Stars: /terms і /paysupport у боті). */}
      {!isStandalone && (
      <Card className="mx-4 space-y-2 p-4 text-sm font-semibold leading-snug">
        <div className="font-black">{t('prem_terms_title')}</div>
        <p>{t('prem_terms_1')}</p>
        <p>{t('prem_terms_2')}</p>
        <p>{t('prem_terms_3')}</p>
        {data.bot && (
          <button className="btn btn-sky mt-1 w-full !py-2 text-sm" onClick={openSupport} disabled={supportBusy} data-premium-support><Icon name="chat" size={18} /> {t(supportBusy ? 'prem_support_opening' : 'prem_support')}</button>
        )}
      </Card>
      )}
    </div>
  );
}
