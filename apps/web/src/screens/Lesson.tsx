import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useT } from '../i18n';
import { api, ApiError } from '../lib/api';
import { useJourney, useMe, useRefreshAll } from '../lib/queries';
import type { AnswerResult, FinishResult, SessionStart } from '../lib/types';
import { sfx } from '../lib/audio';
import { haptic } from '../lib/telegram';
import { Beaver } from '../components/Beaver';
import { Confetti, EmptyState, ErrorState, Modal, Progress, RichText, ScreenSkeleton, SpeakButton, cx, useBackButton } from '../components/ui';
import { ExerciseView, correctAnswerText, instructionKey, type Payload } from '../exercises/Exercises';

type Phase = 'loading' | 'intro' | 'play' | 'finishing' | 'result' | 'error';
const NO_RETRY = new Set(['DIALOGUE', 'SITUATION', 'PRONUNCIATION']);

export default function LessonScreen() {
  const { lessonId, mode } = useParams();
  const { t, tr } = useT();
  const nav = useNavigate();
  const me = useMe().data;
  const refresh = useRefreshAll();
  const [phase, setPhase] = useState<Phase>('loading');
  const [session, setSession] = useState<SessionStart | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [queue, setQueue] = useState<string[]>([]);
  const [retried, setRetried] = useState<Set<string>>(new Set());
  const [pos, setPos] = useState(0);
  const [payload, setPayload] = useState<Payload | null>(null);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [dialogueDone, setDialogueDone] = useState(false);
  const [firstDone, setFirstDone] = useState(0);
  const [quit, setQuit] = useState(false);
  const [finish, setFinish] = useState<FinishResult | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    api<SessionStart>('/sessions', { body: lessonId ? { lessonId } : { mode } })
      .then((s) => {
        setSession(s);
        setQueue(s.items.map((i) => i.key));
        setPhase(s.lesson && (s.lesson.kind === 'LESSON' || s.lesson.kind === 'BOSS') ? 'intro' : 'play');
        if (s.timeLimitSec) setTimeLeft(s.timeLimitSec);
      })
      .catch((e) => {
        setError(e);
        setPhase('error');
      });
  }, [lessonId, mode]);

  const items = useMemo(() => new Map(session?.items.map((i) => [i.key, i]) ?? []), [session]);
  const key = queue[pos];
  const item = key ? items.get(key) : undefined;
  const isRetry = item ? pos >= (session?.items.length ?? 0) : false;
  const speed = session?.mode === 'SPEED';

  const doFinish = useCallback(async () => {
    if (!session) return;
    setPhase('finishing');
    try {
      const r = await api<FinishResult>(`/sessions/${session.sessionId}/finish`, { body: {} });
      setFinish(r);
      setPhase('result');
      if (r.passed) sfx.win();
      await refresh();
    } catch (e) {
      setError(e);
      setPhase('error');
    }
  }, [session, refresh]);

  // Таймер швидкого раунду
  useEffect(() => {
    if (timeLeft === null || phase !== 'play') return;
    if (timeLeft <= 0) {
      void doFinish();
      return;
    }
    const tm = setTimeout(() => setTimeLeft((x) => (x ?? 1) - 1), 1000);
    return () => clearTimeout(tm);
  }, [timeLeft, phase, doFinish]);

  const send = useCallback(
    (p: Payload) => api<AnswerResult>(`/sessions/${session!.sessionId}/answer`, { body: { key, answer: p } }),
    [session, key],
  );

  const check = async (p: Payload | null = payload) => {
    if (!p || !item || checking) return;
    setChecking(true);
    try {
      const r = await send(p);
      setResult(r);
      if (r.correct) {
        sfx.correct();
        haptic.success();
      } else if (!r.skipped) {
        sfx.wrong();
        haptic.error();
        // Помилку повторимо в кінці уроку (без впливу на оцінку).
        if (!r.retry && !NO_RETRY.has(item.type) && !speed && !retried.has(item.key)) {
          setQueue((q) => [...q, item.key]);
          setRetried((s) => new Set(s).add(item.key));
        }
      }
      if (!r.retry) setFirstDone((n) => n + 1);
      if (speed) setTimeout(() => next(), r.correct ? 450 : 900);
    } catch (e) {
      setError(e);
    } finally {
      setChecking(false);
    }
  };

  const next = () => {
    setResult(null);
    setPayload(null);
    setDialogueDone(false);
    if (pos + 1 >= queue.length) void doFinish();
    else setPos((p) => p + 1);
  };

  const onQuit = useCallback(() => setQuit(true), []);
  useBackButton(phase === 'play' || phase === 'intro' ? onQuit : null);

  if (phase === 'loading') return <ScreenSkeleton />;
  if (phase === 'error') {
    const code = error instanceof ApiError ? error.code : '';
    if (code === 'nothing_due' || code === 'no_mistakes' || code === 'nothing_to_practice')
      return (
        <div className="pt-16">
          <EmptyState text={code === 'no_mistakes' ? t('no_mistakes') : t('nothing_due')} action={<button className="btn btn-primary" onClick={() => nav('/', { replace: true })}>{t('continue')}</button>} />
        </div>
      );
    if (code === 'premium_required') {
      nav('/premium', { replace: true });
      return null;
    }
    return <ErrorState error={error} onRetry={() => window.location.reload()} />;
  }
  if (!session) return null;

  if (phase === 'intro' && session.lesson) {
    const l = session.lesson;
    return (
      <div className="flex min-h-[100dvh] flex-col px-4 pb-6 pt-3">
        <TopClose onClose={onQuit} />
        <div className="flex-1 space-y-4 overflow-y-auto">
          <div className="flex items-center gap-3">
            <Beaver mood="think" size={96} outfit={{ ...me?.outfit.wear, GLASSES: 'glasses-round' }} />
            <div>
              <div className="chip mb-1 text-xs">{l.cefr} · {l.kind === 'BOSS' ? '🏆' : '📘'}</div>
              <h1 className="text-2xl font-black leading-tight">{tr(l.title)}</h1>
              <p className="muted font-bold">{tr(l.topic)}</p>
            </div>
          </div>
          <div className="card p-4 text-[16px] font-semibold leading-relaxed">
            <RichText text={tr(l.explanation)} />
          </div>
          {session.words.length > 0 && (
            <div>
              <h2 className="mb-2 font-black">{t('lesson_new_words')}</h2>
              <div className="grid grid-cols-1 gap-2">
                {session.words.map((w) => (
                  <div key={w.id} className="card flex items-center gap-3 px-3 py-2">
                    <span className="text-2xl">{w.emoji ?? '📝'}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-black">{w.pl}</div>
                      <div className="muted truncate text-sm font-bold">
                        {w.pronunciation && `[${w.pronunciation}] · `}
                        {tr(w.translations)}
                      </div>
                    </div>
                    <SpeakButton text={w.pl} url={w.audioUrl} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}
          {l.examples.length > 0 && (
            <div>
              <h2 className="mb-2 font-black">{t('lesson_examples')}</h2>
              {l.examples.map((e) => (
                <div key={e.pl} className="card mb-2 flex items-center gap-3 px-3 py-2">
                  <div className="flex-1">
                    <div className="font-black">{e.pl}</div>
                    <div className="muted text-sm font-bold">{tr(e.tr)}</div>
                  </div>
                  <SpeakButton text={e.pl} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="h-24" />
        <div className="safe-bottom fixed inset-x-0 bottom-0 z-30 mx-auto max-w-xl bg-gradient-to-t from-[var(--bg)] via-[var(--bg)] to-transparent px-4 pt-6">
          <button className="btn btn-primary mb-2 w-full text-lg" onClick={() => { haptic.tap(); setPhase('play'); }}>
            {t('start')} →
          </button>
        </div>
        <QuitModal open={quit} onStay={() => setQuit(false)} onQuit={() => nav(-1)} />
      </div>
    );
  }

  if (phase === 'finishing') {
    return (
      <div className="grid min-h-[100dvh] place-items-center">
        <div className="flex flex-col items-center gap-3">
          <Beaver mood="think" size={140} outfit={me?.outfit.wear} />
          <div className="font-black">{t('lesson_finishing')}</div>
        </div>
      </div>
    );
  }

  if (phase === 'result' && finish) return <ResultView r={finish} session={session} />;

  if (!item) return null;
  const isDialogue = item.type === 'DIALOGUE' || item.type === 'SITUATION';
  const praise = t('lesson_correct_alt').split('|');
  const caText = result ? correctAnswerText(item, result, tr) : null;

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <div className="flex items-center gap-3 px-4 pt-3">
        <button onClick={onQuit} className="text-2xl font-black muted" aria-label={t('close')}>
          ✕
        </button>
        <Progress value={firstDone} max={session.items.length} height={14} />
        {timeLeft !== null ? <span className="chip font-black">⏱ {timeLeft}</span> : <span className="text-sm font-black muted">{Math.min(firstDone + 1, session.items.length)}/{session.items.length}</span>}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-48 pt-4">
        {isRetry && <div className="mb-2 text-center text-sm font-black text-coral">🔁 {t('lesson_retry_round')}</div>}
        <AnimatePresence mode="wait">
          <motion.div key={`${item.key}-${pos}`} initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }} transition={{ duration: 0.2 }}>
            <h2 className="mb-4 text-xl font-black">{t(instructionKey(item))}</h2>
            <ExerciseView
              item={item}
              result={result}
              onChange={setPayload}
              onSubmit={(p) => check(p)}
              submitStep={async (p) => {
                const r = await send(p);
                if (r.done && !r.retry) setFirstDone((n) => n + 1);
                return r;
              }}
              onDialogueDone={() => setDialogueDone(true)}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Нижня панель: перевірка / зворотний зв'язок */}
      <div className="safe-bottom fixed inset-x-0 bottom-0 z-30 mx-auto max-w-xl">
        <AnimatePresence>
          {result && !speed && (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              className={cx('rounded-t-3xl px-5 pb-2 pt-4', result.correct ? 'bg-[#d7f5e3] dark:bg-[#1c4430]' : result.skipped ? 'bg-muted' : 'bg-[#ffe1e1] dark:bg-[#4a2424]')}
            >
              <div className="flex items-start gap-3">
                <Beaver mood={result.correct ? 'cheer' : result.skipped ? 'think' : 'sad'} size={64} outfit={me?.outfit.wear} animate={false} />
                <div className="min-w-0 flex-1">
                  <div className={cx('text-xl font-black', result.correct ? 'text-brand-dark' : 'text-coral-dark')}>
                    {result.correct ? (result.almost ? t('lesson_almost') : praise[firstDone % praise.length]) : result.skipped ? '🙂' : t('lesson_wrong')}
                    {result.correct && !result.retry && session.lesson && me?.rewards && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-2 inline-block rounded-full bg-xp px-2 py-0.5 align-middle text-sm text-[#5a3d00]">
                        +{me.rewards.exerciseXp} XP
                      </motion.span>
                    )}
                  </div>
                  {caText && (
                    <div className="font-bold">
                      <span className="muted">{t('lesson_correct_answer')}</span> {caText}
                    </div>
                  )}
                  {result.explanation && (
                    <div className="mt-1 text-sm font-semibold">
                      <RichText text={tr(result.explanation)} />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className={cx('px-4 pb-3 pt-3', result && !speed ? (result.correct ? 'bg-[#d7f5e3] dark:bg-[#1c4430]' : result.skipped ? 'bg-muted' : 'bg-[#ffe1e1] dark:bg-[#4a2424]') : 'bg-[var(--bg)]')}>
          {isDialogue ? (
            <button className="btn btn-primary w-full text-lg" disabled={!dialogueDone} onClick={next}>
              {t('next')}
            </button>
          ) : result ? (
            !speed && (
              <button className={cx('btn w-full text-lg', result.correct ? 'btn-primary' : 'btn-red')} onClick={next}>
                {t('next')}
              </button>
            )
          ) : item.type === 'PRONUNCIATION' ? null : (
            <button className="btn btn-primary w-full text-lg" disabled={!payload || checking} onClick={() => check()}>
              {t('lesson_check')}
            </button>
          )}
        </div>
      </div>
      <QuitModal open={quit} onStay={() => setQuit(false)} onQuit={() => nav(-1)} />
    </div>
  );
}

function TopClose({ onClose }: { onClose: () => void }) {
  return (
    <div className="mb-2 flex">
      <button onClick={onClose} className="muted text-2xl font-black" aria-label="close">
        ✕
      </button>
    </div>
  );
}

function QuitModal({ open, onStay, onQuit }: { open: boolean; onStay: () => void; onQuit: () => void }) {
  const { t } = useT();
  return (
    <Modal open={open} onClose={onStay}>
      <Beaver mood="sad" size={110} />
      <h2 className="mt-2 text-xl font-black">{t('lesson_quit')}</h2>
      <p className="muted mt-1 font-semibold">{t('lesson_quit_text')}</p>
      <div className="mt-5 space-y-3">
        <button className="btn btn-primary w-full" onClick={onStay}>
          {t('lesson_quit_no')}
        </button>
        <button className="w-full py-2 font-black text-coral" onClick={onQuit}>
          {t('lesson_quit_yes')}
        </button>
      </div>
    </Modal>
  );
}

function Stat({ icon, label, value, color }: { icon: string; label: string; value: string | number; color: string }) {
  return (
    <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="overflow-hidden rounded-2xl border-2 text-center" style={{ borderColor: color }}>
      <div className="py-1 text-xs font-black text-white" style={{ background: color }}>
        {label}
      </div>
      <div className="py-2 text-xl font-black">
        {icon} {value}
      </div>
    </motion.div>
  );
}

function ResultView({ r, session }: { r: FinishResult; session: SessionStart }) {
  const { t, tr } = useT();
  const nav = useNavigate();
  const me = useMe().data;
  const journey = useJourney();
  const [levelModal, setLevelModal] = useState(!!r.levelUp);
  const boss = session.lesson?.kind === 'BOSS';
  const passRatio = boss || r.mode === 'EXAM' ? 70 : 50;
  const title = !r.passed ? t('res_title_fail') : r.perfect ? t('res_title_perfect') : t('res_title_pass');
  const mins = Math.floor(r.durationSec / 60);
  const secs = String(r.durationSec % 60).padStart(2, '0');
  const nextLesson = journey.data?.nextLesson;
  const cityFrom = r.cityCompleted?.cityId;
  const cityTo = r.cityCompleted?.nextCity;

  return (
    <div className="flex min-h-[100dvh] flex-col px-5 pb-6 pt-6">
      <Confetti run={r.passed} />
      <div className="flex flex-1 flex-col items-center gap-4 text-center">
        <Beaver mood={r.passed ? 'celebrate' : 'sad'} size={170} outfit={me?.outfit.wear} />
        <h1 className={cx('text-3xl font-black', r.passed ? 'text-brand-dark' : 'text-coral-dark')}>{title}</h1>
        {!r.passed && <p className="muted font-semibold">{t('res_fail_text', { n: passRatio })}</p>}

        <div className="grid w-full grid-cols-3 gap-2">
          <Stat icon="⭐" label={t('res_xp')} value={`+${r.xp}`} color="#E8A82A" />
          <Stat icon="🎯" label={t('res_accuracy')} value={`${r.accuracy}%`} color="#45C486" />
          <Stat icon="⏱" label={t('res_time')} value={`${mins}:${secs}`} color="#69C7F4" />
        </div>
        {r.zlotki > 0 && <div className="chip text-base">🪙 +{r.zlotki} Złotki</div>}
        {r.streakIncreased && <div className="chip text-base">{t('res_streak', { n: r.streak })}</div>}

        {r.cityCompleted && (
          <div className="card w-full p-4">
            <div className="text-xl font-black">🏆 {t('res_city_done')}</div>
            {cityTo && <div className="mt-1 font-black text-pl-red">{cityTo.hasLessons ? t('res_ticket', { city: cityTo.namePl }) : t('res_ticket_soon', { city: cityTo.namePl })}</div>}
            {r.cityCompleted.rewards.length > 0 && (
              <div className="mt-2 text-sm font-bold">
                {t('res_rewards')}: {r.cityCompleted.rewards.map((x) => tr(x.name)).join(', ')}
              </div>
            )}
          </div>
        )}
        {r.levelConfirmed && <div className="card w-full p-4 text-lg font-black">{t('res_level_confirmed', { level: r.levelConfirmed })}</div>}
        {r.placement && (
          <div className="card w-full p-4 text-left">
            <div className="text-lg font-black">{t('res_placement', { level: r.placement.level })}</div>
            <div className="muted text-sm font-semibold">{t('res_placement_text', { cities: r.placement.unlocked.join(', ') })}</div>
          </div>
        )}

        {r.newWords.length > 0 && (
          <div className="w-full text-left">
            <h3 className="mb-1 font-black">{t('res_new_words')} (+{r.newWords.length})</h3>
            <div className="flex flex-wrap gap-2">
              {r.newWords.map((w) => (
                <span key={w.id} className="chip">
                  {w.pl} — {tr(w.translations)}
                </span>
              ))}
            </div>
          </div>
        )}
        {[...r.questsCompleted.map((q) => ({ icon: q.icon, text: `${t('res_quests_done')}: ${tr(q.title)}` })), ...r.achievements.map((a) => ({ icon: a.icon, text: `${t('res_achievement')} ${tr(a.title)}` }))].map((x, i) => (
          <motion.div key={i} initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 + i * 0.15 }} className="card flex w-full items-center gap-3 p-3 text-left font-bold">
            <span className="text-3xl">{x.icon}</span>
            {x.text}
          </motion.div>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {cityFrom && cityTo ? (
          <button className="btn btn-red w-full text-lg" onClick={() => nav(`/map?travel=${cityFrom},${cityTo.id}`, { replace: true })}>
            🚆 {t('res_to_map')}
          </button>
        ) : r.passed && nextLesson && session.lesson ? (
          <button className="btn btn-primary w-full text-lg" onClick={() => nav(`/lesson/${nextLesson.id}`, { replace: true })}>
            {t('home_next_lesson')}: {tr(nextLesson.title)} →
          </button>
        ) : !r.passed && session.lesson ? (
          <button className="btn btn-primary w-full text-lg" onClick={() => window.location.reload()}>
            🔁 {t('res_again')}
          </button>
        ) : null}
        <button className="btn btn-ghost w-full" onClick={() => nav('/', { replace: true })}>
          {t('res_continue')}
        </button>
      </div>

      <Modal open={levelModal} onClose={() => setLevelModal(false)}>
        <Beaver mood="celebrate" size={130} outfit={{ ...me?.outfit.wear, HAT: 'crown-gold' }} />
        <h2 className="mt-2 text-2xl font-black">{t('res_level_up', { n: r.levelUp ?? '' })}</h2>
        <button className="btn btn-xp mt-4 w-full" onClick={() => setLevelModal(false)}>
          {t('continue')}
        </button>
      </Modal>
    </div>
  );
}
