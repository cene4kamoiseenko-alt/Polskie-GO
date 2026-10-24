import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useT, type TKey } from '../i18n';
import { api } from '../lib/api';
import type { VocabEntry } from '../lib/types';
import { haptic } from '../lib/telegram';
import { Card, EmptyState, ScreenHeader, Sheet, Skeleton, SpeakButton, cx } from '../components/ui';

const FILTERS = ['all', 'mine', 'learned', 'favorites', 'due'] as const;

export default function DictionaryScreen() {
  const { t, tr } = useT();
  const qc = useQueryClient();
  const [params] = useSearchParams();
  const [search, setSearch] = useState(params.get('q') ?? '');
  const [debounced, setDebounced] = useState(search);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('all');
  const [topic, setTopic] = useState<string | null>(null);
  const [open, setOpen] = useState<VocabEntry | null>(null);

  useEffect(() => {
    const tm = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(tm);
  }, [search]);

  const topics = useQuery({ queryKey: ['topics'], queryFn: () => api<{ key: string; name: never }[]>('/vocab/topics'), staleTime: Infinity });
  const list = useInfiniteQuery({
    queryKey: ['vocab', debounced, filter, topic],
    initialPageParam: '' as string,
    queryFn: ({ pageParam }) => {
      const q = new URLSearchParams({ filter });
      if (debounced) q.set('search', debounced);
      if (topic) q.set('topic', topic);
      if (pageParam) q.set('cursor', pageParam);
      return api<{ items: VocabEntry[]; nextCursor: string | null }>(`/vocab?${q}`);
    },
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
  const items = list.data?.pages.flatMap((p) => p.items) ?? [];

  const toggleFav = async (w: VocabEntry) => {
    haptic.tap();
    const favorite = !w.mine?.favorite;
    await api(`/vocab/${w.id}/favorite`, { body: { favorite } });
    setOpen((o) => (o && o.id === w.id ? { ...o, mine: { ...(o.mine ?? { status: 'NEW', timesCorrect: 0, timesWrong: 0 }), favorite } } : o));
    qc.invalidateQueries({ queryKey: ['vocab'] });
  };

  return (
    <div className="pb-6">
      <ScreenHeader title={t('dict_title')} subtitle={t('dict_subtitle')} />
      <div className="space-y-3 px-4">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`🔍 ${t('dict_search')}`} className="w-full rounded-2xl border-2 border-soft bg-elev px-4 py-3 font-bold outline-none focus:border-sky" />
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={cx('chip shrink-0', filter === f && 'bg-pl-red text-white')}>
              {t(`dict_filter_${f}` as TKey)}
            </button>
          ))}
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {topics.data?.map((tp) => (
            <button key={tp.key} onClick={() => setTopic(topic === tp.key ? null : tp.key)} className={cx('chip shrink-0 text-xs', topic === tp.key && 'bg-sky text-white')}>
              {tr(tp.name)}
            </button>
          ))}
        </div>
        {list.isLoading && <Skeleton className="h-64" />}
        {!list.isLoading && !items.length && <EmptyState text={t('dict_empty')} />}
        <div className="space-y-2">
          {items.map((w) => (
            <Card key={w.id} className="flex items-center gap-3 px-3 py-2.5" onClick={() => setOpen(w)}>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-muted text-2xl">{w.emoji ?? '📝'}</span>
              <div className="min-w-0 flex-1">
                <div className="font-black">
                  {w.pl} {w.mine?.status === 'LEARNED' && <span className="text-brand">✓</span>}
                </div>
                <div className="muted text-[11px] font-bold">{t(`pos_${w.pos}` as TKey)} · {w.cefr}</div>
                <div className="truncate text-sm font-bold">{tr(w.translations)}</div>
              </div>
              <SpeakButton text={w.pl} url={w.audioUrl} size="sm" />
              <button
                onClick={(e) => { e.stopPropagation(); void toggleFav(w); }}
                className="grid h-9 w-9 place-items-center text-2xl"
                aria-label={t('dict_filter_favorites')}
                style={{ color: w.mine?.favorite ? '#FFC857' : 'var(--border)' }}
              >
                ★
              </button>
            </Card>
          ))}
        </div>
        {list.hasNextPage && (
          <button className="btn btn-ghost w-full" onClick={() => list.fetchNextPage()} disabled={list.isFetchingNextPage}>
            {t('loading')}
          </button>
        )}
      </div>

      <Sheet open={!!open} onClose={() => setOpen(null)}>
        {open && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-5xl">{open.emoji ?? '📝'}</span>
              <div className="flex-1">
                <h2 className="text-3xl font-black">{open.pl}</h2>
                <div className="muted font-bold">
                  [{open.pronunciation}] · {t(`pos_${open.pos}` as TKey)} · {open.cefr}
                </div>
              </div>
              <SpeakButton text={open.pl} url={open.audioUrl} size="lg" />
            </div>
            <div className="text-xl font-black text-brand-dark">{tr(open.translations)}</div>
            {open.mine && <span className="chip">{t(`dict_status_${open.mine.status}` as TKey)} · ✓{open.mine.timesCorrect} ✗{open.mine.timesWrong}</span>}
            {Object.keys(open.forms).length > 0 && (
              <div>
                <h3 className="mb-1 font-black">{t('dict_forms')}</h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {Object.entries(open.forms).map(([k, v]) => (
                    <div key={k} className="rounded-xl bg-muted px-3 py-1.5 text-sm">
                      <span className="muted font-bold">{k}: </span>
                      <b>{v}</b>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {open.examples.length > 0 && (
              <div>
                <h3 className="mb-1 font-black">{t('dict_examples')}</h3>
                {open.examples.map((e) => (
                  <div key={e.pl} className="mb-2 flex items-center gap-2 rounded-xl bg-muted p-3">
                    <div className="flex-1">
                      <div className="font-black">{e.pl}</div>
                      <div className="muted text-sm font-bold">{tr(e.tr)}</div>
                    </div>
                    <SpeakButton text={e.pl} size="sm" />
                  </div>
                ))}
              </div>
            )}
            <button className="btn btn-ghost w-full" onClick={() => toggleFav(open)}>
              {open.mine?.favorite ? '★' : '☆'} {t('dict_filter_favorites')}
            </button>
          </div>
        )}
      </Sheet>
    </div>
  );
}
