/**
 * «Żywy polski»: розмовник живої польської. Кожен вираз — з реєстром (з ким можна),
 * ситуацією, діалогом і нейтральною альтернативою; тренажер «нейтрально ↔ розмовно».
 */
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import type { I18n } from '@polski-go/shared';
import { useT, type TKey } from '../i18n';
import { api } from '../lib/api';
import { haptic } from '../lib/telegram';
import { sfx } from '../lib/audio';
import { ErrorState, ScreenHeader, ScreenSkeleton, SpeakButton, cx } from '../components/ui';
import { Beaver } from '../components/Beaver';
import { Icon } from '../components/Icon';

type Register = 'casual' | 'slang' | 'rude';
type Item = {
  id: string; pl: string; group: string; register: Register; meaning: I18n; tone: I18n; when: I18n;
  dialogue: { a: string; b: string; tr: I18n }; neutral: { pl: string; tr: I18n };
};
type Data = { groups: Record<string, I18n>; items: Item[] };

const REG: Record<Register, { key: TKey; bg: string; fg: string }> = {
  casual: { key: 'slang_reg_casual', bg: '#DDF6EA', fg: '#178A5C' },
  slang: { key: 'slang_reg_slang', bg: '#FFF1C9', fg: '#B07A08' },
  rude: { key: 'slang_reg_rude', bg: '#FFE1E1', fg: '#D23540' },
};

function RegBadge({ r }: { r: Register }) {
  const { t } = useT();
  return <span className="rounded-full px-2 py-0.5 text-[11px] font-black" style={{ background: REG[r].bg, color: REG[r].fg }}>{t(REG[r].key)}</span>;
}

function Card({ it }: { it: Item }) {
  const { t, tr } = useT();
  const [open, setOpen] = useState(false);
  return (
    <motion.div layout className="card overflow-hidden">
      <button className="flex w-full items-start gap-3 p-3.5 text-left" onClick={() => { haptic.tap(); setOpen((o) => !o); }} aria-expanded={open}>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-lg font-black">{it.pl}</span>
            <RegBadge r={it.register} />
          </div>
          <div className="muted text-sm font-bold">{tr(it.meaning)}</div>
        </div>
        <span onClick={(e) => e.stopPropagation()}><SpeakButton text={it.pl} size="sm" /></span>
        <Icon name="chevron-right" size={18} className={cx('mt-2 shrink-0 muted transition-transform', open && 'rotate-90')} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-3 px-3.5 pb-3.5">
            <div className="rounded-2xl p-3 text-sm font-semibold" style={{ background: REG[it.register].bg }}>
              <div className="font-black" style={{ color: REG[it.register].fg }}>{t('slang_tone')}</div>
              {tr(it.tone)}
              <div className="mt-1.5 font-black" style={{ color: REG[it.register].fg }}>{t('slang_when')}</div>
              {tr(it.when)}
            </div>
            <div className="space-y-1.5">
              <div className="muted text-xs font-black uppercase tracking-wide">{t('slang_dialogue')}</div>
              {[it.dialogue.a, it.dialogue.b].map((line, i) => (
                <div key={i} className={cx('flex items-center gap-2', i === 1 && 'flex-row-reverse')}>
                  <span className={cx('rounded-2xl px-3 py-2 text-[15px] font-bold', i === 0 ? 'rounded-bl-sm bg-muted' : 'rounded-br-sm bg-sky/25')}>{line}</span>
                  <SpeakButton text={line} size="sm" />
                </div>
              ))}
              <div className="muted text-xs font-semibold">{tr(it.dialogue.tr)}</div>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border-2 border-dashed border-[var(--border)] p-3">
              <div className="min-w-0 flex-1">
                <div className="muted text-xs font-black uppercase tracking-wide">{t('slang_neutral')}</div>
                <div className="font-black">{it.neutral.pl}</div>
                <div className="muted text-xs font-semibold">{tr(it.neutral.tr)}</div>
              </div>
              <SpeakButton text={it.neutral.pl.split(' / ')[0]} size="sm" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/** Тренажер: показуємо нейтральну фразу — обери розмовну (або навпаки). Без XP: це вільна практика. */
function Trainer({ items }: { items: Item[] }) {
  const { t, tr } = useT();
  const [n, setN] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState({ ok: 0, all: 0 });
  const q = useMemo(() => {
    const seed = (n * 7919 + 13) % items.length;
    const target = items[seed];
    const toCasual = n % 2 === 0;
    const others = items.filter((x) => x.id !== target.id && x.group === target.group).concat(items.filter((x) => x.group !== target.group));
    const opts = [target, others[n % others.length], others[(n * 3 + 1) % others.length]].filter((x, i, a) => a.findIndex((y) => y.id === x.id) === i);
    const shuffled = opts.map((o, i) => ({ o, k: (i * 37 + n * 11) % 7 })).sort((a, b) => a.k - b.k).map((x) => x.o);
    return { target, toCasual, opts: shuffled };
  }, [n, items]);
  const answer = (id: string) => {
    if (picked) return;
    setPicked(id);
    const ok = id === q.target.id;
    ok ? (haptic.success(), sfx.correct()) : (haptic.error(), sfx.wrong());
    setScore((s) => ({ ok: s.ok + (ok ? 1 : 0), all: s.all + 1 }));
  };
  return (
    <div className="space-y-3 px-4">
      <div className="flex items-end gap-2">
        <Beaver mood={picked ? (picked === q.target.id ? 'cheer' : 'sad') : 'explain'} size={84} />
        <div className="card relative mb-6 flex-1 rounded-bl-md p-3.5">
          <div className="muted text-xs font-black">{t(q.toCasual ? 'slang_tr_to_casual' : 'slang_tr_to_neutral')}</div>
          <div className="text-xl font-black">{q.toCasual ? q.target.neutral.pl : q.target.pl}</div>
          <div className="muted text-xs font-semibold">{tr(q.toCasual ? q.target.neutral.tr : q.target.meaning)}</div>
        </div>
      </div>
      <div className="grid gap-2.5">
        {q.opts.map((o) => {
          const state = !picked ? undefined : o.id === q.target.id ? 'correct' : o.id === picked ? 'wrong' : undefined;
          return (
            <motion.button key={o.id} className="option" data-state={state} animate={state === 'wrong' ? { x: [0, -8, 8, -4, 4, 0] } : { x: 0 }} onClick={() => answer(o.id)}>
              {q.toCasual ? o.pl : o.neutral.pl}
            </motion.button>
          );
        })}
      </div>
      {picked && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-muted p-3 text-sm font-semibold">
          <div className="mb-1 flex items-center gap-2"><RegBadge r={q.target.register} /> <b>{q.target.pl}</b></div>
          {tr(q.target.tone)}
        </motion.div>
      )}
      <div className="flex items-center justify-between">
        <span className="muted text-sm font-black">{t('slang_score', { n: score.ok, total: score.all })}</span>
        <button className="btn btn-primary min-h-0 px-5 py-2.5" disabled={!picked} onClick={() => { setPicked(null); setN((x) => x + 1); }}>{t('next')}</button>
      </div>
      <p className="muted text-center text-xs font-semibold">{t('slang_trainer_note')}</p>
    </div>
  );
}

export default function SlangScreen() {
  const { t, tr } = useT();
  const q = useQuery({ queryKey: ['slang'], queryFn: () => api<Data>('/slang'), staleTime: Infinity });
  const [tab, setTab] = useState<'list' | 'train'>('list');
  const [group, setGroup] = useState('all');
  if (q.isLoading) return <ScreenSkeleton />;
  if (q.error) return <ErrorState error={q.error} onRetry={() => q.refetch()} />;
  const { groups, items } = q.data!;
  const list = items.filter((x) => group === 'all' || x.group === group);
  return (
    <div className="pb-8">
      <ScreenHeader title="Żywy polski" subtitle={t('slang_subtitle', { n: items.length })} />
      <div className="mx-4 flex items-center gap-3 overflow-hidden rounded-3xl p-3" style={{ background: 'linear-gradient(135deg, #DFF5FF, #FFF1C9)' }}>
        <Beaver mood="explain" size={76} />
        <p className="text-sm font-bold text-ink">{t('slang_intro')}</p>
      </div>
      <div className="mx-4 mt-3 flex flex-wrap gap-2">
        {(Object.keys(REG) as Register[]).map((r) => <RegBadge key={r} r={r} />)}
      </div>
      <div className="mx-4 mt-3 grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1" role="tablist">
        {(['list', 'train'] as const).map((k) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => { haptic.select(); setTab(k); }} className={cx('rounded-xl py-2 text-sm font-black transition-colors', tab === k ? 'bg-elev shadow' : 'muted')}>
            {t(k === 'list' ? 'slang_tab_list' : 'slang_tab_train')}
          </button>
        ))}
      </div>
      {tab === 'list' ? (
        <>
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
            {[['all', t('all')] as [string, string], ...Object.entries(groups).map(([k, v]) => [k, tr(v)] as [string, string])].map(([k, label]) => (
              <button key={k} onClick={() => { haptic.select(); setGroup(k); }} className={cx('chip shrink-0 !py-1.5', group === k && '!bg-pl-red text-white')}>{label}</button>
            ))}
          </div>
          <div className="mt-3 grid gap-2.5 px-4">
            {list.map((it) => <Card key={it.id} it={it} />)}
          </div>
        </>
      ) : (
        <div className="mt-4"><Trainer items={items} /></div>
      )}
    </div>
  );
}
