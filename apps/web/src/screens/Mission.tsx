/**
 * Проходження місії: вступ → кроки (послухати / відповісти / скласти фразу) → підсумок.
 * Вибір підсвічується одразу, мережева перевірка має окремий стан завантаження.
 * Помилка — пояснення й нова спроба того самого кроку.
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from '../lib/motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import type { I18n } from '@polski-go/shared';
import { useT } from '../i18n';
import { ApiError, api } from '../lib/api';
import { haptic } from '../lib/telegram';
import { useSwipe } from '../lib/swipe';
import { prefetchSpeech, sfx } from '../lib/audio';
import type { MissionAnswer, MissionFinish, MissionLine, MissionRun, MissionStepPublic } from '../lib/types';
import { Confetti, ErrorState, ScreenSkeleton, SpeakButton, cx, useBackButton } from '../components/ui';
import { Beaver, type BeaverMood } from '../components/Beaver';
import { Icon } from '../components/Icon';
import { ReportExercise, type ExerciseReportRef } from '../components/ReportExercise';
import { MissionScene, hasBakedBobek } from '../components/MissionScene';
import { MissionStage, type StageReaction } from '../components/MissionStage';
import { AchievementQueue, CountUp, Pulse, XpBurst } from '../components/fx';

/** Похвала над картинкой после верного ответа — по-польски (учит заодно); XP за миссию начисляется в конце, число здесь не показывается. */
const PRAISE = ['Dobrze!', 'Świetnie!', 'Brawo!', 'Super!'];

type Feedback = { ok: true; explain: I18n; line: MissionLine | null; finished?: MissionFinish } | { ok: false; why: I18n };

export default function MissionScreen() {
  const { slug = '' } = useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['mission-run', slug], queryFn: () => api<MissionRun>(`/missions/${slug}/start`, { method: 'POST' }), staleTime: Infinity, gcTime: 0 });
  const [phase, setPhase] = useState<'intro' | 'play' | 'done'>('intro');
  const [result, setResult] = useState<MissionFinish | null>(null);
  // Місія сезонного пропуску повертає до пропуску, решта — до списку місій.
  const season = !!q.data?.mission.season;
  const exit = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['missions'] });
    nav(season ? '/pass' : '/life', { replace: true });
  }, [nav, qc, season]);
  useBackButton(exit);

  if (q.isLoading) return <ScreenSkeleton />;
  // Сцена Premium без Premium (пряме посилання): ведемо на екран Premium, а не показуємо помилку.
  if (q.error instanceof ApiError && q.error.code === 'premium_required') return <Navigate to="/premium" replace />;
  // Миссия канала без подтверждённой подписки (прямая ссылка) — панель подписки на экране миссий.
  if (q.error instanceof ApiError && q.error.code === 'channel_required') return <Navigate to="/life?channel=1" replace />;
  // Сезон пропуску ще не почався (пряме посилання): показуємо календар пропуску.
  if (q.error instanceof ApiError && q.error.code === 'season_not_started') return <Navigate to="/pass" replace />;
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

function TopBar({ onClose, value, max, report }: { onClose: () => void; value: number; max: number; report?: ExerciseReportRef }) {
  const { t } = useT();
  return (
    <div className="flex items-center gap-3 px-4 pb-2 pt-3">
      <button onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-elev shadow" aria-label="close" data-mission-close>
        <Icon name="x" size={20} />
      </button>
      <div className="flex flex-1 gap-1" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={t('pass_progress', { n: value, total: max })}>
        {Array.from({ length: max }).map((_, i) => (
          <div key={i} className="h-3 flex-1 overflow-hidden rounded-full" style={{ background: 'var(--track)' }}>
            <motion.div className="h-full rounded-full bg-brand" initial={false} animate={{ width: i < value ? '100%' : '0%' }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
          </div>
        ))}
      </div>
      {report && <ReportExercise target={report} />}
    </div>
  );
}

/** Поза Бобека на вступі місії — за сюжетом: кава, посилка, оплата на касі; решта — вітається. */
const PAY_MISSIONS = new Set(['zabka-first-order', 'biedronka-breakfast', 'lidl-list', 'rossmann-basics', 'orlen-pump', 'torun-bakery', 'bar-mleczny', 'krakow-pierogi', 'kazimierz-zapiekanka', 'marcin-rogal', 'jarmark-oscypek', 'park-bilety', 'first-tram', 'train-wroclaw']);
function introMood(slug: string): BeaverMood {
  if (slug === 'orlen-coffee') return 'coffee';
  if (slug === 'paczkomat') return 'parcel';
  return PAY_MISSIONS.has(slug) ? 'pay' : 'wave';
}

function Intro({ run, onStart, onClose }: { run: MissionRun; onStart: () => void; onClose: () => void }) {
  const { t, tr } = useT();
  const m = run.mission;
  const resume = run.step > 0;
  const baked = hasBakedBobek(m.slug, m.season ?? null, m.category);
  return (
    <div className="flex min-h-screen flex-col pb-32">
      <div className="relative">
        <MissionScene slug={m.slug} scene={m.scene} season={m.season ?? null} category={m.category} lazy={false} className="block h-52 w-full" />
        <button onClick={onClose} className="absolute left-4 top-3 grid h-10 w-10 place-items-center rounded-full bg-elev shadow" aria-label="close">
          <Icon name="x" size={20} />
        </button>
        {/* Тимчасові кадри вже мають Бобека в картинці: другого поверх не малюємо. */}
        {!baked && (
          <motion.div className="absolute -bottom-6 right-3" data-intro-beaver initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}>
            <Beaver mood={introMood(m.slug)} size={104} />
          </motion.div>
        )}
      </div>
      <div className="px-4 pt-4">
        <div className="text-xs font-black uppercase tracking-widest text-pl-red">{t('life_title')}</div>
        <h1 className={cx('mt-1 text-[26px] font-black leading-tight', !baked && 'pr-24')}>{tr(m.title)}</h1>
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
        <button className="btn-start mb-2" data-mission-start onClick={() => { haptic.tap(); onStart(); }}>
          <Icon name="play" size={22} />
          <span>{resume ? t('life_continue', { n: run.step + 1, total: m.steps.length }) : t('life_start')}</span>
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
            {hidden ? <HiddenText /> : <div className="text-[19px] font-black leading-snug" lang="pl"><TypeText text={line.pl} /></div>}
            {revealed && <div className="muted mt-1 text-sm font-semibold">{tr(line.tr)}</div>}
          </div>
          <SpeakButton text={line.pl} size={hidden ? 'lg' : 'md'} />
        </div>
      </div>
    );
  }
  const isBeaver = line.who === 'beaver';
  const speaker = line.name ?? npcName;
  return (
    <div className="flex items-end gap-2.5">
      <div className={cx('grid h-12 w-12 shrink-0 place-items-center rounded-full text-lg font-black text-white shadow', isBeaver ? 'bg-brown' : 'bg-sky-dark')} style={isBeaver ? { background: '#B87747' } : undefined} aria-hidden>
        {isBeaver ? 'B' : speaker[0]}
      </div>
      <div className="card relative min-w-0 flex-1 rounded-bl-md p-3.5">
        <div className="muted mb-0.5 text-xs font-black">{isBeaver ? 'Bobek' : speaker}</div>
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            {hidden ? (
              <>
                <HiddenText />
                <div className="muted mt-1 text-xs font-bold">{t('life_hidden')}</div>
              </>
            ) : (
              <div className="text-[18px] font-extrabold leading-snug" lang="pl"><TypeText text={line.pl} /></div>
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

/**
 * Реплика печатается по буквам (≈ 50 мс на шаг, не дольше 1,2 с); недопечатанный хвост невидим, но занимает место — облачко не прыгает.
 * Экранный диктор сразу получает весь текст. «Меньше анимаций» — сразу весь текст.
 */
function TypeText({ text }: { text: string }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? text.length : 0);
  useEffect(() => {
    if (reduce) return setN(text.length);
    setN(0);
    const step = Math.max(1, Math.ceil(text.length / 24));
    const iv = setInterval(() => setN((k) => {
      const v = Math.min(text.length, k + step);
      if (v >= text.length) clearInterval(iv);
      return v;
    }), 50);
    return () => clearInterval(iv);
  }, [text, reduce]);
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {text.slice(0, n)}
        <span className="invisible">{text.slice(n)}</span>
      </span>
    </>
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
  const [reaction, setReaction] = useState<StageReaction>(null);
  const reduce = useReducedMotion();
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
        setReaction((r) => ({ kind: 'correct', n: (r?.n ?? 0) + 1 }));
        setFeedback({ ok: true, explain: r.explain, line: r.line, finished: r.finished });
      } else {
        haptic.error();
        sfx.wrong();
        setReaction((r) => ({ kind: 'wrong', n: (r?.n ?? 0) + 1 }));
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

  // Свайп влево после верного ответа = «Далее» (как в уроке); при ошибке жест ничего не делает — исправлять нужно осознанно.
  const swipeNext = useSwipe({ onLeft: feedback?.ok ? () => { haptic.tap(); next(); } : undefined });

  const retry = () => {
    setFeedback(null);
    setWrongId(null);
    setSelected(null);
  };

  const askHint = async () => {
    if (hint) return;
    haptic.tap();
    const r = await api<{ hint: I18n }>(`/missions/runs/${run.runId}/hint`, { body: { step: idx } }).catch(() => null);
    if (r) setHint(r.hint);
  };

  const revealed = !!feedback?.ok;
  return (
    <div ref={swipeNext} className="flex min-h-screen flex-col pb-40" data-swipe-next={revealed ? 'ready' : undefined}>
      {/* Вариант А: картинка места — над всеми шагами (не перезагружается), реплика — облачко на её нижнем крае. */}
      <MissionStage
        slug={run.mission.slug}
        scene={run.mission.scene}
        season={run.mission.season ?? null}
        category={run.mission.category}
        reaction={reaction}
        praise={feedback?.ok ? PRAISE[(reaction?.n ?? 0) % PRAISE.length] : null}
        top={<TopBar onClose={onClose} value={idx + (feedback?.ok ? 1 : 0)} max={steps.length} report={{ mission: run.mission.slug, step: step.id }} />}
      />
      {feedback?.ok && !reduce && (
        <div data-confetti>
          <Confetti run />
        </div>
      )}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div key={step.id} className="flex flex-1 flex-col gap-3 px-4" initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }} transition={{ duration: 0.2 }}>
          {step.line ? (
            <motion.div
              data-line-bubble
              className="relative z-10 -mt-12"
              initial={reduce ? false : { opacity: 0, y: 18, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 420, damping: 24 }}
            >
              <LineCard line={feedback?.ok ? (feedback.line ?? step.line) : step.line} npcName={run.mission.npc.name} revealed={revealed} />
            </motion.div>
          ) : (
            <div className="h-1" />
          )}
          <h2 className="text-[19px] font-black leading-snug">{tr(step.task)}</h2>
          <div data-mission-answers>
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
          </div>
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
              style={{ position: 'relative' }}
            >
              {/* Бобек реагирует в панели ответа (на картинке он нарисован — второго поверх нет). */}
              <motion.div
                data-feedback-beaver
                className="pointer-events-none absolute -top-14 right-2"
                initial={reduce ? false : { y: 36, scale: 0.6, opacity: 0 }}
                animate={{ y: 0, scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 380, damping: 16, delay: 0.1 }}
                aria-hidden
              >
                <Beaver mood={feedback.ok ? 'cheer' : 'think'} size={88} />
              </motion.div>
              <div className={cx('flex items-center gap-2 pr-24 text-lg font-black', feedback.ok ? 'text-brand-dark' : 'text-coral-dark')}>
                <Icon name={feedback.ok ? 'check' : 'refresh'} size={22} strokeWidth={3} /> {t(feedback.ok ? 'life_correct' : 'life_wrong')}
              </div>
              <p className="mt-1 pr-24 text-[15px] font-semibold leading-snug">{tr(feedback.ok ? feedback.explain : feedback.why)}</p>
            </motion.div>
          )}
        </AnimatePresence>
        <div className={cx('px-4 pb-2 pt-3', feedback ? (feedback.ok ? 'bg-[color-mix(in_srgb,var(--color-brand)_20%,var(--bg-elev))]' : 'bg-[color-mix(in_srgb,var(--color-coral)_16%,var(--bg-elev))]') : 'bg-gradient-to-t from-[var(--bg)] via-[var(--bg)] to-transparent')}>
          {!feedback && (
            <button className="btn btn-primary w-full text-lg" disabled={!canCheck || busy} aria-busy={busy} onClick={check} data-mission-check>
              {busy ? <span className="h-5 w-5 animate-spin rounded-full border-[3px] border-white/40 border-t-white" /> : t('life_check')}
            </button>
          )}
          {feedback?.ok && (
            <button className="btn btn-primary w-full text-lg" onClick={next} data-mission-next>
              {feedback.finished ? t('life_finish') : t('life_next')}
            </button>
          )}
          {feedback && !feedback.ok && (
            <button className="btn btn-red w-full text-lg" onClick={retry} data-mission-retry>
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
