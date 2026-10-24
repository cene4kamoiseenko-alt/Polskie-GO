import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { I18n } from '@polski-go/shared';
import { useT } from '../i18n';
import { api } from '../lib/api';
import { useMe, useRefreshAll } from '../lib/queries';
import { sfx, speak } from '../lib/audio';
import { haptic } from '../lib/telegram';
import { Beaver } from '../components/Beaver';
import { Confetti, ErrorState, Progress, RichText, ScreenHeader, ScreenSkeleton, cx } from '../components/ui';

type Node = { speaker: 'npc' | 'beaver' | 'narrator'; name?: string; emoji?: string; pl: string; tr: I18n; choices?: { pl: string; tr: I18n }[]; end: boolean };
type State = { id: string; slug: string; title: I18n; status: string; stage: number; stages: number; stageTitle?: I18n; mistakes: number; node: Node | null; result?: { ok: boolean; feedback?: I18n } | null };

export default function StoryScreen() {
  const { slug } = useParams();
  const { t, tr } = useT();
  const nav = useNavigate();
  const me = useMe().data;
  const refresh = useRefreshAll();
  const [st, setSt] = useState<State | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [feedback, setFeedback] = useState<I18n | null>(null);
  const [wrong, setWrong] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    api<State>(`/story/${slug}/start`, { body: {} }).then(setSt).catch(setError);
  }, [slug]);

  useEffect(() => {
    if (st?.node) speak(st.node.pl);
  }, [st?.node?.pl]);

  const advance = async (choice?: number) => {
    if (busy) return;
    setBusy(true);
    setFeedback(null);
    try {
      const r = await api<State>(`/story/${slug}/advance`, { body: choice === undefined ? {} : { choice } });
      if (r.result && !r.result.ok) {
        sfx.wrong();
        haptic.error();
        setWrong(choice ?? null);
        setFeedback(r.result.feedback ?? null);
        setTimeout(() => setWrong(null), 500);
      } else {
        if (choice !== undefined) sfx.correct();
        haptic.tap();
      }
      setSt(r);
      if (r.status === 'COMPLETED') {
        sfx.win();
        await refresh();
      }
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };

  if (error) return <ErrorState error={error} onRetry={() => window.location.reload()} />;
  if (!st) return <ScreenSkeleton />;
  const node = st.node;
  const done = st.status === 'COMPLETED' || st.status === 'CLAIMED';

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <ScreenHeader title={tr(st.title)} subtitle={st.stageTitle ? `${t('quests_stage', { n: st.stage + 1, total: st.stages })} · ${tr(st.stageTitle)}` : undefined} />
      <div className="px-4">
        <Progress value={done ? st.stages : st.stage} max={st.stages} />
      </div>
      <div className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-4">
        {!done && (
          <div className="relative grid h-44 place-items-center overflow-hidden rounded-[28px]" style={{ background: 'linear-gradient(180deg,#BFE8F8 0%,#DFF6E8 70%,#A6DC8C 70%)' }}>
            <div className="absolute left-4 top-3 text-4xl">☁️</div>
            <div className="absolute right-6 top-6 text-3xl">☁️</div>
            <div className="absolute bottom-3 left-5 text-6xl">{node?.speaker === 'npc' ? node.emoji : '🏙️'}</div>
            <div className="absolute bottom-0 right-6">
              <Beaver size={110} outfit={me?.outfit.wear} mood={st.result && !st.result.ok ? 'sad' : 'travel'} />
            </div>
          </div>
        )}
        <Confetti run={done} />
        {done ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <Beaver mood="celebrate" size={170} outfit={me?.outfit.wear} />
            <h2 className="text-3xl font-black text-brand-dark">{t('story_complete')}</h2>
            <p className="muted font-bold">{t('story_mistakes', { n: st.mistakes })}</p>
            <button className="btn btn-xp w-full" onClick={() => nav('/quests', { replace: true })}>
              🎁 {t('quests_claim')}
            </button>
          </div>
        ) : node ? (
          <AnimatePresence mode="wait">
            <motion.div key={node.pl} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="flex items-end gap-3">
                {node.speaker === 'beaver' ? <Beaver mood="happy" size={110} outfit={me?.outfit.wear} /> : node.speaker === 'npc' ? <div className="text-7xl">{node.emoji}</div> : <div className="text-6xl">📖</div>}
                <button onClick={() => speak(node.pl)} className={cx('card flex-1 p-4 text-left', node.speaker === 'narrator' && 'italic')}>
                  {node.name && <div className="text-xs font-black uppercase text-pl-red">{node.name}</div>}
                  <div className="text-xl font-black">{node.pl}</div>
                  <div className="muted mt-1 font-semibold">{tr(node.tr)}</div>
                </button>
              </div>
              {feedback && (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-start gap-2 rounded-2xl bg-xp/25 p-3 font-bold">
                  🦫 <RichText text={tr(feedback)} />
                </motion.div>
              )}
              {node.choices ? (
                <div className="space-y-2">
                  {node.choices.map((c, i) => (
                    <motion.button key={i} animate={wrong === i ? { x: [0, -10, 10, -6, 6, 0] } : undefined} whileTap={{ scale: 0.97 }} disabled={busy} onClick={() => advance(i)} className="option">
                      <div>{c.pl}</div>
                      <div className="muted text-xs font-semibold">{tr(c.tr)}</div>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <button className="btn btn-primary w-full" disabled={busy} onClick={() => advance()}>
                  {t('story_next')} →
                </button>
              )}
            </motion.div>
          </AnimatePresence>
        ) : null}
      </div>
    </div>
  );
}
