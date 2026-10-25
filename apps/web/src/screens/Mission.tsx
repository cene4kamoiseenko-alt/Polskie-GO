/**
 * Проходження місії: вступ → кроки (послухати / відповісти / скласти фразу) → підсумок.
 * Вибір підсвічується одразу, мережева перевірка має окремий стан завантаження.
 * Помилка — пояснення й нова спроба того самого кроку.
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { I18n } from '@polski-go/shared';
import { useT } from '../i18n';
import { api } from '../lib/api';
import { haptic } from '../lib/telegram';
import { prefetchSpeech, sfx } from '../lib/audio';
import type { MissionAnswer, MissionFinish, MissionLine, MissionRun, MissionStepPublic } from '../lib/types';
import { Confetti, ErrorState, ScreenSkeleton, SpeakButton, cx, useBackButton } from '../components/ui';
import { Beaver, type BeaverMood } from '../components/Beaver';
import { Icon } from '../components/Icon';
import { Scene } from '../components/Illustrations';
import { AchievementQueue, CountUp, Pulse, XpBurst } from '../components/fx';

type Feedback = { ok: true; explain: I18n; line: MissionLine | null; finished?: MissionFinish } | { ok: false; why: I18n };

export default function MissionScreen() {
  const { slug = '' } = useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['mission-run', slug], queryFn: () => api<MissionRun>(`/missions/${slug}/start`, { method: 'POST' }), staleTime: Infinity, gcTime: 0 });
  const [phase, setPhase] = useState<'intro' | 'play' | 'done'>('intro');
  const [result, setResult] = useState<MissionFinish | null>(null);
  const exit = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['missions'] });
    nav('/life', { replace: true });
  }, [nav, qc]);
  useBackButton(exit);

  if (q.isLoading) return <ScreenSkeleton />;
  if (q.error) return <ErrorState error={q.error} onRetry={() => q.refetch()} />;
  const run = q.data!;
  if (phase === 'intro') return <Intro run={run} onStart={() => setPhase('play')} onClose={exit} />;
  if (phase === 'play')
    return (
      <Player
        run={run}
        onClose={exit}
        onFinish={(f) => {
          setResult(f);
          setPhase('done');
          qc.invalidateQueries({ queryKey: ['me'] });
          qc.invalidateQueries({ queryKey: ['missions'] });
        }}
      />
    );
  return (
    <Summary
      run={run}
      result={result!}
      onBack={exit}
      onAgain={() => {
        setResult(null);
        setPhase('intro');
        q.refetch();
      }}
    />
  );
}

function TopBar({ onClose, value, max }: { onClose: () => void; value: number; max: number }) {
  return (
    <div className="flex items-center gap-3 px-4 pb-2 pt-3">
      <button onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-elev shadow" aria-label="close">
        <Icon name="x" size={20} />
      </button>
      <div className="flex flex-1 gap-1" role="progressbar" aria-valuenow={value} aria-valuemax={max}>
        {Array.from({ length: max }).map((_, i) => (
          <div key={i} className="h-3 flex-1 overflow-hidden rounded-full" style={{ background: 'var(--track)' }}>
            <motion.div className="h-full rounded-full bg-brand" initial={false} animate={{ width: i < value ? '100%' : '0%' }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Intro({ run, onStart, onClose }: { run: MissionRun; onStart: () => void; onClose: () => void }) {
  const { t, tr } = useT();
  const m = run.mission;
  const resume = run.step > 0;
  return (
    <div className="flex min-h-screen flex-col pb-32">
      <div className="relative">
        <Scene name={m.scene} className="block h-52 w-full" />
        <button onClick={onClose} className="absolute left-4 top-3 grid h-10 w-10 place-items-center rounded-full bg-elev/90 shadow" aria-label="close">
          <Icon name="x" size={20} />
        </button>
        <motion.div className="absolute -bottom-6 right-3" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}>
          <Beaver mood="wave" size={104} />
        </motion.div>
      </div>
      <div className="px-4 pt-4">
        <div className="text-xs font-black uppercase tracking-widest text-pl-red">{t('life_title')}</div>
        <h1 className="mt-1 pr-24 text-[26px] font-black leading-tight">{tr(m.title)}</h1>
        <p className="muted mt-2 font-semibold">{tr(m.intro)}</p>
        <div className="card mt-4 flex gap-3 p-4">
          <span className="icon-tile !h-11 !w-11 bg-brand text-white"><Icon name="target" size={22} /></span>
          <div>
            <div className="text-sm font-black uppercase tracking-wide text-brand-dark">{t('life_goal')}</div>
            <div className="font-bold leading-snug">{tr(m.goal)}</div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="chip"><Icon name="clock" size={16} /> {t('life_minutes', { n: m.minutes })}</span>
          <span className="chip"><Icon name="layers" size={16} /> {t('life_steps', { n: m.steps.length })}</span>
          <span className="chip text-xp-dark"><Icon name="star" size={16} /> +{m.xp} XP</span>
          <span className="chip"><Icon name="chat" size={16} /> {m.npc.name} · {tr(m.npc.role)}</span>
        </div>
        {m.note && (
          <div className="mt-4 rounded-2xl bg-muted p-3.5 text-sm font-semibold leading-snug">
            <div className="mb-1 flex items-center gap-1.5 font-black"><Icon name="book" size={16} /> {t('life_context')}</div>
            {tr(m.note)}
          </div>
        )}
      </div>
      <div className="safe-bottom fixed inset-x-0 bottom-0 z-30 mx-auto max-w-xl bg-gradient-to-t from-[var(--bg)] via-[var(--bg)] to-transparent px-4 pt-6">
        <button className="btn btn-red mb-2 w-full text-lg" onClick={() => { haptic.tap(); onStart(); }}>
          {resume ? t('life_continue', { n: run.step + 1, total: m.steps.length }) : t('life_start')}
        </button>
      </div>
    </div>
  );
}

/** Репліка: співрозмовник (бульбашка), вивіска/екран (оповідач) або Бобек. Прихована — лише аудіо до відповіді. */
function LineCard({ line, npcName, revealed }: { line: MissionLine; npcName: string; revealed: boolean }) {
  const { t, tr } = useT();
  const hidden = !!line.hidden && !revealed;
  if (line.who === 'narrator') {
    return (
      <div className="card border-2 !border-[var(--color-navy)] bg-paper p-4 dark:bg-elev">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            {hidden ? <HiddenText /> : <div className="text-[19px] font-black leading-snug">{line.pl}</div>}
            {revealed && <div className="muted mt-1 text-sm font-semibold">{tr(line.tr)}</div>}
          </div>
          <SpeakButton text={line.pl} size={hidden ? 'lg' : 'md'} />
        </div>
      </div>
    );
  }
  const isBeaver = line.who === 'beaver';
  return (
    <div className="flex items-end gap-2.5">
      <div className={cx('grid h-12 w-12 shrink-0 place-items-center rounded-full text-lg font-black text-white shadow', isBeaver ? 'bg-brown' : 'bg-sky-dark')} style={isBeaver ? { background: '#B87747' } : undefined} aria-hidden>
        {isBeaver ? 'B' : npcName[0]}
      </div>
      <div className="card relative min-w-0 flex-1 rounded-bl-md p-3.5">
        <div className="muted mb-0.5 text-xs font-black">{isBeaver ? 'Bobek' : npcName}</div>
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            {hidden ? (
              <>
                <HiddenText />
                <div className="muted mt-1 text-xs font-bold">{t('life_hidden')}</div>
              </>
            ) : (
              <div className="text-[18px] font-extrabold leading-snug">{line.pl}</div>
            )}
            {revealed && <div className="muted mt-1 text-sm font-semibold">{tr(line.tr)}</div>}
          </div>
          <div className="flex shrink-0 flex-col gap-1.5">
            <SpeakButton text={line.pl} size={hidden ? 'lg' : 'md'} />
            {hidden && <SpeakButton text={line.pl} size="sm" slow />}
          </div>
        </div>
      </div>
    </div>
  );
}

function HiddenText() {
  return (
    <div className="flex flex-wrap gap-1.5 py-1" aria-hidden>
      {[46, 28, 60, 36, 52].map((w, i) => <span key={i} className="h-3.5 rounded-full" style={{ width: w, background: 'var(--track)' }} />)}
    </div>
  );
}

function Player({ run, onClose, onFinish }: { run: MissionRun; onClose: () => void; onFinish: (f: MissionFinish) => void }) {
  const { t, tr } = useT();
  const steps = run.mission.steps;
  const [idx, setIdx] = useState(Math.min(run.step, steps.length - 1));
  const [selected, setSelected] = useState<number | null>(null);
  const [chosen, setChosen] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [wrongId, setWrongId] = useState<number | null>(null);
  const [hint, setHint] = useState<I18n | null>(null);
  const [mood, setMood] = useState<BeaverMood>('think');
  const step = steps[idx];

  // Аудіо поточної і наступної репліки — заздалегідь (відтворення лише за дотиком: вимога iOS).
  useEffect(() => {
    prefetchSpeech([step.line?.pl, steps[idx + 1]?.line?.pl]);
  }, [idx, step, steps]);

  const reset = () => {
    setSelected(null);
    setChosen([]);
    setFeedback(null);
    setWrongId(null);
    setHint(null);
    setMood('think');
  };

  const canCheck = step.kind === 'build' ? chosen.length > 0 : selected !== null;

  const check = async () => {
    if (!canCheck || busy) return;
    setBusy(true);
    try {
      const body = step.kind === 'build' ? { step: idx, text: chosen.map((i) => step.tokens![i]).join(' ') } : { step: idx, option: selected };
      const r = await api<MissionAnswer>(`/missions/runs/${run.runId}/answer`, { body });
      if (r.correct) {
        haptic.success();
        sfx.correct();
        setMood('cheer');
        setFeedback({ ok: true, explain: r.explain, line: r.line, finished: r.finished });
      } else {
        haptic.error();
        sfx.wrong();
        setMood('sad');
        setWrongId(selected);
        setFeedback({ ok: false, why: r.why });
      }
    } catch (e) {
      // Крок уже змінився (повторний запит) — оновлюємо стан з сервера.
      setFeedback({ ok: false, why: { uk: (e as Error).message, ru: (e as Error).message, en: (e as Error).message } });
    } finally {
      setBusy(false);
    }
  };

  const next = () => {
    if (!feedback?.ok) return;
    if (feedback.finished) return onFinish(feedback.finished);
    reset();
    setIdx((i) => i + 1);
  };

  const retry = () => {
    setFeedback(null);
    setWrongId(null);
    setSelected(null);
    setMood('think');
  };

  const askHint = async () => {
    if (hint) return;
    haptic.tap();
    const r = await api<{ hint: I18n }>(`/missions/runs/${run.runId}/hint`, { body: { step: idx } }).catch(() => null);
    if (r) setHint(r.hint);
  };

  const revealed = !!feedback?.ok;
  return (
    <div className="flex min-h-screen flex-col pb-56">
      <TopBar onClose={onClose} value={idx + (feedback?.ok ? 1 : 0)} max={steps.length} />
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div key={step.id} className="flex flex-1 flex-col gap-4 px-4 pt-2" initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }} transition={{ duration: 0.2 }}>
          <div className="flex items-start gap-2">
            <h2 className="flex-1 text-[20px] font-black leading-snug">{tr(step.task)}</h2>
            <motion.div key={mood} initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="-mt-2 shrink-0">
              <Beaver mood={mood} size={72} />
            </motion.div>
          </div>
          {step.line && <LineCard line={feedback?.ok ? (feedback.line ?? step.line) : step.line} npcName={run.mission.npc.name} revealed={revealed} />}
          {step.kind === 'build' ? (
            <BuildArea step={step} chosen={chosen} setChosen={setChosen} locked={!!feedback} state={feedback ? (feedback.ok ? 'correct' : 'wrong') : null} />
          ) : (
            <div className="grid gap-2.5">
              {step.options!.map((o) => {
                const state = feedback?.ok && selected === o.id ? 'correct' : wrongId === o.id ? 'wrong' : selected === o.id ? 'selected' : undefined;
                return (
                  <motion.button
                    key={o.id}
                    className="option"
                    data-state={state}
                    disabled={!!feedback?.ok || busy}
                    animate={state === 'wrong' ? { x: [0, -8, 8, -5, 5, 0] } : state === 'selected' ? { scale: 1.02 } : { scale: 1, x: 0 }}
                    transition={{ duration: state === 'wrong' ? 0.35 : 0.15 }}
                    onClick={() => {
                      haptic.select();
                      setSelected(o.id);
                      if (wrongId !== null) setWrongId(null);
                      if (feedback && !feedback.ok) setFeedback(null);
                    }}
                  >
                    {o.pl ?? tr(o.text!)}
                  </motion.button>
                );
              })}
            </div>
          )}
          {!feedback && (
            <div>
              {hint ? (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-[color-mix(in_srgb,var(--color-xp)_18%,var(--bg-elev))] p-3 text-sm font-bold">
                  <Icon name="bolt" size={16} className="mr-1 inline text-xp-dark" /> {tr(hint)}
                </motion.div>
              ) : (
                <button onClick={askHint} className="inline-flex items-center gap-1.5 text-sm font-black text-sky-dark">
                  <Icon name="bolt" size={16} /> {t('life_hint')}
                </button>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="safe-bottom fixed inset-x-0 bottom-0 z-30 mx-auto max-w-xl">
        <AnimatePresence initial={false}>
          {feedback && (
            <motion.div
              key={feedback.ok ? 'ok' : 'bad'}
              className={cx('rounded-t-[28px] px-4 pb-2 pt-4', feedback.ok ? 'bg-[color-mix(in_srgb,var(--color-brand)_20%,var(--bg-elev))]' : 'bg-[color-mix(in_srgb,var(--color-coral)_16%,var(--bg-elev))]')}
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              role="status"
            >
              <div className={cx('flex items-center gap-2 text-lg font-black', feedback.ok ? 'text-brand-dark' : 'text-coral-dark')}>
                <Icon name={feedback.ok ? 'check' : 'refresh'} size={22} strokeWidth={3} /> {t(feedback.ok ? 'life_correct' : 'life_wrong')}
              </div>
              <p className="mt-1 text-[15px] font-semibold leading-snug">{tr(feedback.ok ? feedback.explain : feedback.why)}</p>
            </motion.div>
          )}
        </AnimatePresence>
        <div className={cx('px-4 pb-2 pt-3', feedback ? (feedback.ok ? 'bg-[color-mix(in_srgb,var(--color-brand)_20%,var(--bg-elev))]' : 'bg-[color-mix(in_srgb,var(--color-coral)_16%,var(--bg-elev))]') : 'bg-gradient-to-t from-[var(--bg)] via-[var(--bg)] to-transparent')}>
          {!feedback && (
            <button className="btn btn-primary w-full text-lg" disabled={!canCheck || busy} aria-busy={busy} onClick={check}>
              {busy ? <span className="h-5 w-5 animate-spin rounded-full border-[3px] border-white/40 border-t-white" /> : t('life_check')}
            </button>
          )}
          {feedback?.ok && (
            <button className="btn btn-primary w-full text-lg" onClick={next}>
              {feedback.finished ? t('life_finish') : t('life_next')}
            </button>
          )}
          {feedback && !feedback.ok && (
            <button className="btn btn-red w-full text-lg" onClick={retry}>
              {t('life_retry')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Збирання фрази: слово плавно переїжджає з банку в речення й назад (спільний layoutId). */
function BuildArea({ step, chosen, setChosen, locked, state }: { step: MissionStepPublic; chosen: number[]; setChosen: (v: number[]) => void; locked: boolean; state: 'correct' | 'wrong' | null }) {
  const { t } = useT();
  const tokens = step.tokens!;
  const reduced = useReducedMotion();
  const layout = reduced ? undefined : 'position';
  return (
    <LayoutGroup id={step.id}>
      <div
        className={cx(
          'flex min-h-[112px] flex-wrap content-start gap-2 rounded-2xl border-2 border-dashed p-3 transition-colors',
          state === 'correct' ? 'border-brand bg-[color-mix(in_srgb,var(--color-brand)_10%,transparent)]' : state === 'wrong' ? 'border-coral bg-[color-mix(in_srgb,var(--color-coral)_8%,transparent)]' : 'border-[var(--border)]',
        )}
        aria-label={t('life_tap_words')}
      >
        {chosen.length === 0 && <span className="muted self-center text-sm font-bold">{t('life_tap_words')}</span>}
        {chosen.map((i) => (
          <motion.button key={i} layoutId={reduced ? undefined : `tok-${step.id}-${i}`} layout={layout} className="chip !rounded-xl !px-3.5 !py-2 text-[17px] !font-extrabold" disabled={locked} onClick={() => { haptic.select(); setChosen(chosen.filter((x) => x !== i)); }}>
            {tokens[i]}
          </motion.button>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-2 pt-1">
        {tokens.map((tok, i) =>
          chosen.includes(i) ? (
            <span key={i} className="rounded-xl px-3.5 py-2 text-[17px] font-extrabold opacity-0" aria-hidden style={{ background: 'var(--track)' }}>
              {tok}
            </span>
          ) : (
            <motion.button key={i} layoutId={reduced ? undefined : `tok-${step.id}-${i}`} layout={layout} className="chip !rounded-xl !px-3.5 !py-2 text-[17px] !font-extrabold" disabled={locked} onClick={() => { haptic.select(); setChosen([...chosen, i]); }}>
              {tok}
            </motion.button>
          ),
        )}
      </div>
    </LayoutGroup>
  );
}

function Summary({ run, result, onBack, onAgain }: { run: MissionRun; result: MissionFinish; onBack: () => void; onAgain: () => void }) {
  const { t, tr } = useT();
  const beaverRef = useRef<HTMLDivElement>(null);
  const xpRef = useRef<HTMLDivElement>(null);
  const [burst, setBurst] = useState(false);
  const [pulse, setPulse] = useState(0);
  const [showAch, setShowAch] = useState(false);
  useEffect(() => {
    haptic.success();
    sfx.win();
    const a = setTimeout(() => setBurst(true), 450);
    const b = setTimeout(() => setShowAch(true), 1500);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);
  const stats = useMemo(
    () => [
      { label: t('life_mistakes'), value: result.mistakes, icon: 'alert' as const, color: 'text-coral-dark' },
      { label: t('life_hints'), value: result.hints, icon: 'bolt' as const, color: 'text-xp-dark' },
    ],
    [result, t],
  );
  return (
    <div className="flex min-h-screen flex-col px-4 pb-40 pt-6">
      <Confetti run />
      <XpBurst from={beaverRef} target={xpRef} run={burst && result.xp > 0} onArrive={() => setPulse((p) => p + 1)} />
      <div className="text-center">
        <motion.div ref={beaverRef} className="mx-auto w-fit" initial={{ scale: 0.6, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }}>
          <Beaver mood="celebrate" size={150} />
        </motion.div>
        <h1 className="mt-2 text-[28px] font-black leading-tight">{t('life_done_title')}</h1>
        <p className="muted font-bold">{tr(run.mission.title)}</p>
        {result.flawless && <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-xp px-3 py-1 text-sm font-black text-xp-ink"><Icon name="star" size={16} /> {t('life_done_flawless')}</div>}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div ref={xpRef} className="card flex flex-col items-center p-3">
          <Pulse pulse={pulse} className="text-3xl font-black text-xp-dark">+<CountUp to={result.xp} delay={0.5} /></Pulse>
          <div className="muted text-xs font-black">XP</div>
        </div>
        <div className="card flex flex-col items-center p-3">
          <div className="text-3xl font-black text-xp">+<CountUp to={result.zlotki} delay={0.7} /></div>
          <div className="muted text-xs font-black">Złotki</div>
        </div>
        {stats.map((s) => (
          <div key={s.label} className="card flex items-center gap-2 p-3">
            <Icon name={s.icon} size={20} className={s.color} />
            <div className="muted flex-1 text-sm font-bold">{s.label}</div>
            <div className="text-lg font-black">{s.value}</div>
          </div>
        ))}
      </div>
      {!result.first && <p className="muted mt-2 text-center text-xs font-bold">{t('life_repeat_note')}</p>}
      <section className="mt-5">
        <h2 className="mb-2 text-lg font-black">{t('life_phrases')}</h2>
        <div className="card divide-y divide-[var(--border)]">
          {result.phrases.map((p) => (
            <div key={p.pl} className="flex items-center gap-3 px-3.5 py-2.5">
              <div className="min-w-0 flex-1">
                <div className="font-extrabold">{p.pl}</div>
                <div className="muted text-sm font-semibold">{tr(p.tr)}</div>
              </div>
              <SpeakButton text={p.pl} size="sm" />
            </div>
          ))}
        </div>
        {result.newWords.length > 0 && <p className="mt-2 text-sm font-bold text-brand-dark">{t('life_new_words', { n: result.newWords.length })}</p>}
      </section>
      <div className="safe-bottom fixed inset-x-0 bottom-0 z-30 mx-auto grid max-w-xl grid-cols-2 gap-3 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)] to-transparent px-4 pt-6">
        <button className="btn btn-ghost mb-2" onClick={onAgain}>{t('life_again')}</button>
        <button className="btn btn-primary mb-2" onClick={onBack}>{t('life_back')}</button>
      </div>
      {showAch && <AchievementQueue items={result.achievements} />}
    </div>
  );
}
