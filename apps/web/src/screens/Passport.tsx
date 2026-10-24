/** Паспорт мандрівника: штампи міст, листівки Бобека й культурні нотатки. */
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useState } from 'react';
import type { I18n } from '@polski-go/shared';
import { useT } from '../i18n';
import { api } from '../lib/api';
import { haptic } from '../lib/telegram';
import { ErrorState, ScreenHeader, ScreenSkeleton, Sheet, SpeakButton, cx } from '../components/ui';
import { Stamp } from '../components/Illustrations';
import { CityBanner } from '../components/Scenery';
import { Icon } from '../components/Icon';

type City = { slug: string; name: I18n; namePl: string; stop: number; stampedAt: string | null; postcard: { pl: string; tr: I18n } | null; note: I18n | null };
type Data = { stamps: number; total: number; cities: City[] };

export default function PassportScreen() {
  const { t, tr, date } = useT();
  const q = useQuery({ queryKey: ['passport'], queryFn: () => api<Data>('/passport') });
  const [open, setOpen] = useState<City | null>(null);
  if (q.isLoading) return <ScreenSkeleton />;
  if (q.error) return <ErrorState error={q.error} onRetry={() => q.refetch()} />;
  const d = q.data!;
  return (
    <div className="pb-8">
      <ScreenHeader title={t('passport_title')} subtitle={t('passport_stamps', { n: d.stamps, total: d.total })} />
      {d.stamps === 0 && <p className="muted mx-4 rounded-2xl bg-muted p-3 text-sm font-semibold">{t('passport_empty_hint')}</p>}
      <div className="mx-4 mt-3 rounded-[26px] border-2 border-[#C9B48A] bg-[#FBF3E1] p-3 shadow-[inset_0_0_0_6px_#F4E7C9] dark:bg-[#2A2A22]">
        <div className="grid grid-cols-3 gap-1">
          {d.cities.map((c, i) => (
            <motion.button
              key={c.slug}
              className={cx('flex flex-col items-center rounded-2xl p-1 text-center', c.stampedAt ? 'active:scale-95' : 'opacity-80')}
              initial={c.stampedAt ? { scale: 1.6, opacity: 0 } : false}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 16, delay: Math.min(i, 8) * 0.05 }}
              onClick={() => { haptic.tap(); setOpen(c); }}
              aria-label={tr(c.name)}
            >
              <Stamp slug={c.slug} name={c.namePl} stamped={!!c.stampedAt} date={c.stampedAt ? date(c.stampedAt) : null} size={96} />
              <span className="text-[11px] font-black leading-tight text-[#7A6440]">{t('passport_stop', { n: c.stop })}</span>
            </motion.button>
          ))}
        </div>
      </div>
      <Sheet open={!!open} onClose={() => setOpen(null)}>
        {open && (
          <div className="pb-4">
            <h2 className="text-2xl font-black">{tr(open.name)}</h2>
            <p className="muted text-sm font-bold">{open.namePl} · {t('passport_stop', { n: open.stop })}</p>
            {open.stampedAt ? (
              <>
                <div className="mt-3 overflow-hidden rounded-2xl border-4 border-white shadow-lg" style={{ transform: 'rotate(-1.2deg)' }}>
                  <CityBanner slug={open.slug} color="#F45159" height={140} shade={false} />
                  <div className="bg-[#FFFDF6] p-3.5 dark:bg-elev">
                    <div className="mb-1 text-xs font-black uppercase tracking-widest text-pl-red">{t('passport_postcard')}</div>
                    <div className="flex items-start gap-2">
                      <p className="flex-1 font-extrabold italic leading-snug">{open.postcard?.pl}</p>
                      {open.postcard && <SpeakButton text={open.postcard.pl} size="sm" />}
                    </div>
                    {open.postcard && <p className="muted mt-1 text-sm font-semibold">{tr(open.postcard.tr)}</p>}
                  </div>
                </div>
                {open.note && (
                  <div className="card mt-4 p-4">
                    <div className="mb-1 flex items-center gap-1.5 font-black"><Icon name="book" size={18} className="text-sky-dark" /> {t('passport_note')}</div>
                    <p className="text-[15px] font-semibold leading-snug">{tr(open.note)}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="mt-4 flex items-center gap-3 rounded-2xl bg-muted p-4">
                <Icon name="lock" size={22} className="shrink-0 opacity-60" />
                <p className="text-sm font-bold">{t('passport_locked')}</p>
              </div>
            )}
          </div>
        )}
      </Sheet>
    </div>
  );
}
