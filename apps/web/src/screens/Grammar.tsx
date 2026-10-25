import { motion } from 'framer-motion';
import { Icon } from '../components/Icon';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { I18n } from '@polski-go/shared';
import { useT, type TKey } from '../i18n';
import { api } from '../lib/api';
import { haptic } from '../lib/telegram';
import { Beaver } from '../components/Beaver';
import { GameIcon } from '../components/GameIcon';
import { ErrorState, Progress, RichText, ScreenHeader, ScreenSkeleton, Sheet, SpeakButton, cx } from '../components/ui';

type Topic = {
  slug: string;
  title: string;
  subtitle: I18n;
  cefr: string;
  difficulty: number;
  color: string;
  glyph: string;
  rule: I18n;
  examples: { pl: string; tr: I18n }[];
  exercises: number;
  attempts: number;
  mastery: number;
  state: 'new' | 'started' | 'mastered';
};

/** Плитка-ілюстрація теми: кольорова картка з граматичним «гліфом». */
function TopicArt({ topic, size = 56 }: { topic: Topic; size?: number }) {
  return (
    <div
      className="relative grid shrink-0 place-items-center overflow-hidden rounded-2xl font-black text-white"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(160deg, color-mix(in srgb, ${topic.color} 75%, white), ${topic.color})`,
        boxShadow: `inset 0 -4px 0 color-mix(in srgb, ${topic.color} 70%, black), 0 6px 14px -8px ${topic.color}`,
        fontSize: topic.glyph.length > 3 ? size * 0.26 : size * 0.34,
        textShadow: '0 2px 0 rgba(0,0,0,0.18)',
      }}
    >
      <span className="absolute -left-2 -top-3 h-8 w-12 rounded-full bg-white/30" />
      <span className="relative">{topic.glyph}</span>
    </div>
  );
}

export default function GrammarScreen() {
  const { t, tr } = useT();
  const nav = useNavigate();
  const q = useQuery({ queryKey: ['grammar'], queryFn: () => api<Topic[]>('/grammar') });
  const [open, setOpen] = useState<Topic | null>(null);

  if (q.isLoading) return <ScreenSkeleton />;
  if (q.error) return <ErrorState error={q.error} onRetry={() => q.refetch()} />;
  const topics = q.data!;
  const mastered = topics.filter((x) => x.state === 'mastered').length;

  return (
    <div className="space-y-4 pb-8">
      <ScreenHeader title={t('grammar_title')} subtitle={t('grammar_subtitle', { n: topics.length, m: mastered })} right={<GameIcon name="grammar" size={40} />} />
      <div className="mx-4 flex items-center gap-3 rounded-3xl bg-elev p-3 shadow-[var(--shadow-card)]">
        <Beaver mood="learn" size={70} animate={false} />
        <div className="flex-1">
          <Progress value={mastered} max={topics.length} color="var(--color-xp)" />
          <div className="muted mt-1 text-xs font-bold">{t('grammar_subtitle', { n: topics.length, m: mastered })}</div>
        </div>
      </div>
      <div className="space-y-3 px-4">
        {topics.map((topic, i) => (
          <motion.button
            key={topic.slug}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { haptic.tap(); setOpen(topic); }}
            className="card relative flex w-full items-center gap-3 p-3 text-left"
          >
            <TopicArt topic={topic} />
            <div className="min-w-0 flex-1">
              <div className="line-clamp-2 font-black leading-tight">{topic.title}</div>
              <div className="muted line-clamp-2 text-xs font-bold leading-tight">{tr(topic.subtitle)}</div>
              <div className="mt-1.5 flex items-center gap-2">
                <Progress value={topic.mastery} height={7} color={topic.state === 'mastered' ? 'var(--color-xp)' : topic.color} />
                <span className="text-[11px] font-black">{topic.mastery}%</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="rounded-lg px-2 py-0.5 text-[11px] font-black text-white" style={{ background: topic.color }}>{topic.cefr}</span>
              {topic.state === 'new' && <span className="rounded-lg bg-pl-red px-2 py-0.5 text-[10px] font-black text-white">NEW</span>}
              {topic.state === 'mastered' && <GameIcon name="check" size={22} />}
            </div>
          </motion.button>
        ))}
      </div>

      <Sheet open={!!open} onClose={() => setOpen(null)}>
        {open && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <TopicArt topic={open} size={64} />
              <div className="min-w-0 flex-1">
                <h2 className="text-2xl font-black leading-tight">{open.title}</h2>
                <div className="muted font-bold">{tr(open.subtitle)}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-black">
              <span className="chip">{open.cefr}</span>
              <span className="chip">{t('difficulty')}: {'●'.repeat(open.difficulty)}{'○'.repeat(3 - open.difficulty)}</span>
              <span className="chip">{t('grammar_exercises', { n: open.exercises })}</span>
              <span className={cx('chip', open.state === 'mastered' && 'text-brand-dark')}>{t(`grammar_state_${open.state}` as TKey)} · {t('grammar_mastery', { n: open.mastery })}</span>
            </div>
            <div className="card p-4">
              <div className="mb-2 flex items-center gap-1.5 font-black"><Icon name="book" size={18} className="text-sky-dark" /> {t('grammar_rule')}</div>
              <RichText text={tr(open.rule)} className="font-semibold leading-relaxed" />
            </div>
            <div className="space-y-2">
              {open.examples.map((e) => (
                <div key={e.pl} className="card flex items-center gap-3 px-3 py-2">
                  <div className="flex-1">
                    <div className="font-black">{e.pl}</div>
                    <div className="muted text-sm font-bold">{tr(e.tr)}</div>
                  </div>
                  <SpeakButton text={e.pl} size="sm" />
                </div>
              ))}
            </div>
            <button className="btn btn-primary w-full text-lg" onClick={() => nav(`/practice/GRAMMAR?topic=${open.slug}`)}>
              {t('grammar_train')} →
            </button>
          </div>
        )}
      </Sheet>
    </div>
  );
}
