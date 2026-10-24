/**
 * Рендерери вправ. Відповіді перевіряє сервер; компоненти лише збирають відповідь користувача
 * і показують результат перевірки.
 */
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { I18n } from '@polski-go/shared';
import { useT, type TKey } from '../i18n';
import type { AnswerResult, PublicItem } from '../lib/types';
import { assetUrl } from '../lib/api';
import { recognizePolish, sfx, speak, speechRecognitionAvailable } from '../lib/audio';
import { haptic } from '../lib/telegram';
import { Beaver } from '../components/Beaver';
import { SpeakButton, cx } from '../components/ui';

export type Payload = Record<string, unknown>;
export type ExProps = {
  item: PublicItem;
  result: AnswerResult | null;
  onChange: (p: Payload | null) => void;
  /** Негайна відправка (вимова). */
  onSubmit: (p: Payload) => void;
  /** Покрокова перевірка діалогу. */
  submitStep: (p: Payload) => Promise<AnswerResult>;
  onDialogueDone: () => void;
};

type Opt = { id: string; text: string | I18n; image?: string };
const d = <T,>(item: PublicItem) => item.data as unknown as T;

export function instructionKey(item: PublicItem): TKey {
  if (item.type === 'WORD_TRANSLATION' && !d<{ pl?: string }>(item).pl) return 'ex_WORD_TRANSLATION_rev';
  return `ex_${item.type}` as TKey;
}

/** Текст правильної відповіді для панелі зворотного зв'язку. */
export function correctAnswerText(item: PublicItem, result: AnswerResult, tr: (v: I18n | string) => string): string | null {
  if (result.correct && !result.almost) return null;
  const ca = result.correctAnswer;
  if (typeof ca === 'string') {
    const opts = d<{ options?: Opt[] }>(item).options;
    const o = opts?.find((x) => x.id === ca);
    return o ? tr(o.text) : ca;
  }
  if (Array.isArray(ca)) return ca.join(' ');
  return null;
}

function Highlight({ text }: { text: string }) {
  const parts = text.split('___');
  return (
    <>
      {parts.map((p, i) => (
        <span key={i}>
          {p}
          {i < parts.length - 1 && <span className="mx-1 inline-block min-w-[56px] border-b-4 border-dashed border-sky align-baseline" />}
        </span>
      ))}
    </>
  );
}

// ───────── Вибір варіанту ─────────
function ChoiceExercise({ item, result, onChange }: ExProps) {
  const { tr } = useT();
  const data = d<{ pl?: string; translation?: I18n; passage?: string; question?: I18n; audioText?: string; audioUrl?: string; image?: string; options: Opt[] }>(item);
  const [sel, setSel] = useState<string | null>(null);
  useEffect(() => {
    if (item.type === 'LISTENING' && data.audioText) speak(data.audioText, { url: data.audioUrl });
  }, [item.key]); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = (id: string, text: string | I18n) => {
    if (result) return;
    haptic.select();
    sfx.tap();
    setSel(id);
    onChange({ optionId: id });
    if (typeof text === 'string' && item.type !== 'FIND_ERROR' && item.type !== 'READING') speak(text);
  };
  const state = (id: string) => {
    if (!result) return sel === id ? 'selected' : undefined;
    if (id === result.correctAnswer) return 'correct';
    if (id === sel) return 'wrong';
    return undefined;
  };

  if (item.type === 'FIND_ERROR') {
    return (
      <div className="space-y-4">
        {data.translation && <p className="muted text-center font-bold">„{tr(data.translation)}”</p>}
        <div className="flex flex-wrap justify-center gap-2">
          {data.options.map((o) => (
            <motion.button key={o.id} whileTap={{ scale: 0.94 }} data-state={state(o.id)} onClick={() => pick(o.id, o.text)} className="option w-auto px-4 text-xl">
              {tr(o.text)}
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  // Варіанти-картки з ілюстраціями (сітка 2×2).
  if (data.options.some((o) => o.image)) {
    return (
      <div className="space-y-5">
        {data.pl && (
          <div className="flex items-center justify-center gap-3">
            <span className="text-4xl font-black">{data.pl}</span>
            <SpeakButton text={data.audioText ?? data.pl} url={data.audioUrl} />
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          {data.options.map((o, i) => {
            const st = state(o.id);
            return (
              <motion.button
                key={o.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileTap={{ scale: 0.96 }}
                data-state={st}
                onClick={() => pick(o.id, o.text)}
                className="option relative flex flex-col items-center gap-1 px-2 py-4"
              >
                {st === 'correct' && <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-brand text-xs text-white">✓</span>}
                {o.image!.startsWith('/') || o.image!.startsWith('http') ? (
                  <img src={assetUrl(o.image!)} alt="" className="h-20 w-20 rounded-2xl object-cover" />
                ) : (
                  <span className="text-[64px] leading-none">{o.image}</span>
                )}
                <span className="text-center text-base">{tr(o.text)}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  const grid = item.type === 'ODD_ONE_OUT' || item.type === 'PICTURE_WORD';
  return (
    <div className="space-y-4">
      {item.type === 'PICTURE_WORD' && data.image && (
        <div className="grid place-items-center">
          {data.image.startsWith('/') || data.image.startsWith('http') ? (
            <img src={assetUrl(data.image)} alt="" className="h-40 w-40 rounded-3xl object-cover" />
          ) : (
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="card grid h-40 w-40 place-items-center text-[96px]">
              {data.image}
            </motion.div>
          )}
        </div>
      )}
      {item.type === 'LISTENING' && data.audioText && (
        <div className="flex justify-center gap-3">
          <SpeakButton text={data.audioText} url={data.audioUrl} size="lg" />
          <button className="grid h-16 w-16 place-items-center rounded-2xl bg-elev text-2xl shadow" onClick={() => speak(data.audioText!, { slow: true })} aria-label="slow">
            🐢
          </button>
        </div>
      )}
      {item.type === 'READING' && data.passage && (
        <div className="card p-4 text-[17px] font-semibold leading-relaxed">
          <div className="mb-1 flex justify-end">
            <SpeakButton text={data.passage} size="sm" />
          </div>
          {data.passage}
        </div>
      )}
      {data.question && <p className="text-center text-lg font-black">{tr(data.question)}</p>}
      {data.pl && item.type === 'WORD_TRANSLATION' && (
        <div className="flex items-center justify-center gap-3">
          <SpeakButton text={data.audioText ?? data.pl} url={data.audioUrl} />
          <span className="text-3xl font-black">{data.pl}</span>
        </div>
      )}
      {!data.pl && item.type === 'WORD_TRANSLATION' && data.translation && <p className="text-center text-3xl font-black">{tr(data.translation)}</p>}
      {item.type === 'FILL_GAP' && data.pl && (
        <div className="card p-4 text-center">
          <p className="text-2xl font-black leading-snug">
            <Highlight text={data.pl} />
          </p>
          {data.translation && <p className="muted mt-2 font-bold">{tr(data.translation)}</p>}
        </div>
      )}
      <div className={cx(grid ? 'grid grid-cols-2 gap-3' : 'space-y-3')}>
        {data.options.map((o, i) => (
          <motion.button
            key={o.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileTap={{ scale: 0.97 }}
            data-state={state(o.id)}
            onClick={() => pick(o.id, o.text)}
            className={cx('option flex items-center gap-3', grid && 'justify-center text-center')}
          >
            {!grid && <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border-2 border-soft text-sm font-black">{String.fromCharCode(65 + i)}</span>}
            <span>{tr(o.text)}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ───────── Введення тексту ─────────
const POLISH = ['ą', 'ć', 'ę', 'ł', 'ń', 'ó', 'ś', 'ź', 'ż'];

function TextExercise({ item, result, onChange }: ExProps) {
  const { t, tr } = useT();
  const data = d<{ source?: I18n; pl?: string; base?: string; audioText?: string; audioUrl?: string; translation?: I18n }>(item);
  const [value, setValue] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (item.type === 'DICTATION' && data.audioText) speak(data.audioText, { url: data.audioUrl });
  }, [item.key]); // eslint-disable-line react-hooks/exhaustive-deps
  const set = (v: string) => {
    setValue(v);
    onChange(v.trim() ? { text: v } : null);
  };
  const insert = (ch: string) => {
    const el = ref.current;
    if (!el) return set(value + ch);
    const s = el.selectionStart ?? value.length;
    const e = el.selectionEnd ?? value.length;
    set(value.slice(0, s) + ch + value.slice(e));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + 1, s + 1);
    });
  };
  return (
    <div className="space-y-4">
      {item.type === 'SENTENCE_TRANSLATION' && data.source && (
        <div className="flex items-start gap-3">
          <Beaver mood="think" size={72} animate={false} />
          <div className="card flex-1 p-4 text-xl font-black">{tr(data.source)}</div>
        </div>
      )}
      {item.type === 'GRAMMAR' && data.pl && (
        <div className="card p-4 text-center">
          <p className="text-2xl font-black">
            <Highlight text={data.pl} />
          </p>
          {data.base && <p className="mt-2 font-black text-sky-dark">({data.base})</p>}
          {data.translation && <p className="muted mt-1 font-bold">{tr(data.translation)}</p>}
        </div>
      )}
      {item.type === 'DICTATION' && data.audioText && (
        <div className="flex justify-center gap-3">
          <SpeakButton text={data.audioText} url={data.audioUrl} size="lg" />
          <button className="grid h-16 w-16 place-items-center rounded-2xl bg-elev text-2xl shadow" onClick={() => speak(data.audioText!, { slow: true })} aria-label={t('ex_slow')}>
            🐢
          </button>
        </div>
      )}
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => set(e.target.value)}
        disabled={!!result}
        rows={item.type === 'GRAMMAR' ? 1 : 3}
        placeholder={t('ex_type_here')}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        lang="pl"
        className={cx(
          'w-full resize-none rounded-2xl border-2 bg-elev px-4 py-3 text-xl font-bold outline-none focus:border-sky',
          result ? (result.correct ? 'border-brand' : 'border-coral') : 'border-soft',
        )}
      />
      {!result && (
        <div className="flex flex-wrap justify-center gap-1.5">
          {POLISH.map((ch) => (
            <button key={ch} onClick={() => insert(ch)} className="h-10 w-10 rounded-xl border-2 border-soft bg-elev text-lg font-black shadow-[0_2px_0_var(--border)]">
              {ch}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ───────── Складання речення ─────────
function OrderExercise({ item, result, onChange }: ExProps) {
  const { t, tr } = useT();
  const data = d<{ tokens: string[]; translation?: I18n }>(item);
  const [picked, setPicked] = useState<number[]>([]);
  const update = (next: number[]) => {
    setPicked(next);
    onChange(next.length ? { tokens: next.map((i) => data.tokens[i]) } : null);
  };
  return (
    <div className="space-y-5">
      {data.translation && (
        <div className="flex items-center gap-3">
          <Beaver mood="happy" size={72} animate={false} />
          <div className="card flex-1 p-4 text-xl font-black">{tr(data.translation)}</div>
        </div>
      )}
      <div className={cx('flex min-h-[112px] flex-wrap content-start gap-2 rounded-2xl border-2 border-dashed p-3', result ? (result.correct ? 'border-brand' : 'border-coral') : 'border-soft')}>
        {!picked.length && <span className="muted m-auto text-sm font-bold">{t('ex_tap_words')}</span>}
        <AnimatePresence>
          {picked.map((ti, pos) => (
            <motion.button
              layout
              key={`${ti}`}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              onClick={() => !result && update(picked.filter((_, i) => i !== pos))}
              className="rounded-xl border-2 border-soft bg-elev px-3 py-2 text-lg font-bold shadow-[0_3px_0_var(--border)]"
            >
              {data.tokens[ti]}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {data.tokens.map((tok, i) => {
          const used = picked.includes(i);
          return (
            <motion.button
              key={i}
              whileTap={{ scale: 0.92 }}
              disabled={used || !!result}
              onClick={() => {
                haptic.select();
                sfx.tap();
                speak(tok);
                update([...picked, i]);
              }}
              className={cx('rounded-xl border-2 px-3 py-2 text-lg font-bold', used ? 'border-transparent bg-muted text-transparent' : 'border-soft bg-elev shadow-[0_3px_0_var(--border)]')}
            >
              {tok}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ───────── З'єднай пари ─────────
const PAIR_COLORS = ['#69C7F4', '#FFC857', '#9B6BFF', '#FF8FA3', '#45C486', '#F2994A'];

function MatchExercise({ item, result, onChange }: ExProps) {
  const { t, tr } = useT();
  const data = d<{ left: Opt[]; right: Opt[] }>(item);
  const [pairs, setPairs] = useState<[string, string][]>([]);
  const [left, setLeft] = useState<string | null>(null);
  const colorOf = (id: string) => {
    const i = pairs.findIndex((p) => p[0] === id || p[1] === id);
    return i >= 0 ? PAIR_COLORS[i % PAIR_COLORS.length] : null;
  };
  const expected = (result?.correctAnswer ?? null) as Record<string, string> | null;
  const update = (next: [string, string][]) => {
    setPairs(next);
    onChange(next.length === data.left.length ? { pairs: next } : null);
  };
  const tapLeft = (id: string) => {
    if (result) return;
    haptic.select();
    const opt = data.left.find((o) => o.id === id);
    if (opt && typeof opt.text === 'string') speak(opt.text);
    if (pairs.some((p) => p[0] === id)) return update(pairs.filter((p) => p[0] !== id));
    setLeft(id);
  };
  const tapRight = (id: string) => {
    if (result) return;
    haptic.select();
    if (pairs.some((p) => p[1] === id)) return update(pairs.filter((p) => p[1] !== id));
    if (!left) return;
    update([...pairs.filter((p) => p[0] !== left), [left, id]]);
    setLeft(null);
  };
  const rightState = (id: string) => {
    if (!expected) return undefined;
    const p = pairs.find((x) => x[1] === id);
    return p && expected[p[0]] === id ? 'correct' : 'wrong';
  };
  const leftState = (id: string) => {
    if (!expected) return left === id ? 'selected' : undefined;
    const p = pairs.find((x) => x[0] === id);
    return p && expected[id] === p[1] ? 'correct' : 'wrong';
  };
  return (
    <div className="space-y-3">
      <p className="muted text-center text-sm font-bold">{t('ex_match_hint')}</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-3">
          {data.left.map((o) => (
            <button key={o.id} data-state={leftState(o.id)} onClick={() => tapLeft(o.id)} className="option text-center" style={!result && colorOf(o.id) ? { borderColor: colorOf(o.id)!, boxShadow: `0 3px 0 ${colorOf(o.id)}` } : undefined}>
              {tr(o.text)}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {data.right.map((o) => (
            <button key={o.id} data-state={rightState(o.id)} onClick={() => tapRight(o.id)} className="option text-center" style={!result && colorOf(o.id) ? { borderColor: colorOf(o.id)!, boxShadow: `0 3px 0 ${colorOf(o.id)}` } : undefined}>
              {tr(o.text)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ───────── Вимова ─────────
function PronunciationExercise({ item, result, onSubmit }: ExProps) {
  const { t, tr } = useT();
  const data = d<{ text: string; translation: I18n; audioUrl?: string }>(item);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const available = useMemo(() => speechRecognitionAvailable(), []);
  const start = async () => {
    setError(null);
    setListening(true);
    haptic.tap();
    try {
      const { promise } = recognizePolish();
      const transcript = await promise;
      onSubmit({ transcript });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setListening(false);
    }
  };
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="card flex items-center gap-3 px-5 py-4">
        <SpeakButton text={data.text} url={data.audioUrl} />
        <div className="text-left">
          <div className="text-2xl font-black">{data.text}</div>
          <div className="muted font-bold">{tr(data.translation)}</div>
        </div>
      </div>
      {available ? (
        <motion.button
          whileTap={{ scale: 0.92 }}
          disabled={listening || !!result}
          onClick={start}
          className={cx('grid h-28 w-28 place-items-center rounded-full text-5xl text-white', listening ? 'bg-coral' : 'bg-brand')}
          style={{ boxShadow: `0 6px 0 ${listening ? 'var(--color-coral-dark)' : 'var(--color-brand-dark)'}` }}
          animate={listening ? { scale: [1, 1.08, 1] } : undefined}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          🎤
        </motion.button>
      ) : (
        <p className="rounded-2xl bg-muted p-3 font-bold">{t('ex_mic_unavailable')}</p>
      )}
      <div className="font-black">{listening ? t('ex_mic_listening') : available ? t('ex_mic_start') : ''}</div>
      {result && !result.skipped && result.similarity !== undefined && (
        <div className="font-bold">{t('ex_similarity', { n: Math.round(result.similarity * 100) })}</div>
      )}
      {error && <p className="text-sm font-bold text-coral">{error}</p>}
      <p className="muted text-xs font-semibold">{t('ex_speech_note')}</p>
      {!result && (
        <button className="text-sm font-black text-sky-dark underline" onClick={() => onSubmit({ skipped: true })}>
          {t('lesson_skip_mic')}
        </button>
      )}
    </div>
  );
}

// ───────── Діалог / ситуаційна гра ─────────
type Step = { npc: string; npcTr: I18n; options?: { id: string; text: string; tr: I18n }[] };
type Bubble = { who: 'npc' | 'me' | 'coach'; text: string; sub?: string };

function DialogueExercise({ item, submitStep, onDialogueDone }: ExProps) {
  const { t, tr } = useT();
  const data = d<{ npc: { name: string; emoji: string; role?: I18n }; scene?: I18n; steps: Step[] }>(item);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [shake, setShake] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const shown = useRef(-1);
  // Показуємо репліку співрозмовника для поточного кроку (один раз, навіть у StrictMode).
  useEffect(() => {
    const s = data.steps[step];
    if (!s) {
      setFinished(true);
      return;
    }
    if (shown.current !== step) {
      shown.current = step;
      setBubbles((b) => [...b, { who: 'npc', text: s.npc, sub: tr(s.npcTr) }]);
      speak(s.npc);
    }
    if (!s.options?.length) {
      const tm = setTimeout(() => setStep((x) => x + 1), 1400);
      return () => clearTimeout(tm);
    }
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [bubbles, finished]);
  useEffect(() => {
    if (finished) onDialogueDone();
  }, [finished]); // eslint-disable-line react-hooks/exhaustive-deps

  const choose = async (o: { id: string; text: string; tr: I18n }) => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await submitStep({ step, optionId: o.id });
      if (res.correct) {
        sfx.correct();
        haptic.success();
        setBubbles((b) => [...b, { who: 'me', text: o.text, sub: tr(o.tr) }]);
        speak(o.text);
        setTimeout(() => setStep((x) => x + 1), 700);
      } else {
        sfx.wrong();
        haptic.error();
        setShake(o.id);
        setTimeout(() => setShake(null), 500);
        if (res.feedback) setBubbles((b) => [...b, { who: 'coach', text: tr(res.feedback!) }]);
      }
    } finally {
      setBusy(false);
    }
  };

  const current = data.steps[step];
  return (
    <div className="space-y-3">
      {data.scene && <div className="rounded-2xl bg-muted px-4 py-2 text-center text-sm font-bold">🎬 {tr(data.scene)}</div>}
      <div className="flex items-center gap-2">
        <span className="text-4xl">{data.npc.emoji}</span>
        <div>
          <div className="font-black">{data.npc.name}</div>
          {data.npc.role && <div className="muted text-xs font-bold">{tr(data.npc.role)}</div>}
        </div>
      </div>
      <div className="space-y-2">
        {bubbles.map((b, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className={cx('flex', b.who === 'me' ? 'justify-end' : 'justify-start')}>
            {b.who === 'coach' ? (
              <div className="flex max-w-[90%] items-start gap-2 rounded-2xl bg-xp/25 px-3 py-2 text-sm font-bold">
                <span>🦫</span>
                <span>{b.text.replace(/\*\*/g, '')}</span>
              </div>
            ) : (
              <button
                onClick={() => speak(b.text)}
                className={cx('max-w-[85%] rounded-2xl px-4 py-2 text-left', b.who === 'me' ? 'rounded-br-md bg-brand text-white' : 'card rounded-bl-md')}
              >
                <div className="text-[17px] font-black">{b.text}</div>
                {b.sub && <div className={cx('text-xs font-semibold', b.who === 'me' ? 'text-white/85' : 'muted')}>{b.sub}</div>}
              </button>
            )}
          </motion.div>
        ))}
      </div>
      {!finished && current?.options && (
        <div className="space-y-2 pt-2">
          {current.options.map((o) => (
            <motion.button
              key={o.id}
              animate={shake === o.id ? { x: [0, -10, 10, -6, 6, 0] } : undefined}
              whileTap={{ scale: 0.97 }}
              onClick={() => choose(o)}
              disabled={busy}
              className="option"
            >
              <div>{o.text}</div>
              <div className="muted text-xs font-semibold">{tr(o.tr)}</div>
            </motion.button>
          ))}
        </div>
      )}
      {finished && <div className="text-center font-black text-brand-dark">🎉 {t('ex_dialog_done')}</div>}
      <div ref={endRef} />
    </div>
  );
}

export function ExerciseView(props: ExProps) {
  switch (props.item.type) {
    case 'SENTENCE_TRANSLATION':
    case 'DICTATION':
    case 'GRAMMAR':
      return <TextExercise key={props.item.key} {...props} />;
    case 'BUILD_SENTENCE':
    case 'WORD_ORDER':
      return <OrderExercise key={props.item.key} {...props} />;
    case 'MATCH_PAIRS':
      return <MatchExercise key={props.item.key} {...props} />;
    case 'PRONUNCIATION':
      return <PronunciationExercise key={props.item.key} {...props} />;
    case 'DIALOGUE':
    case 'SITUATION':
      return <DialogueExercise key={props.item.key} {...props} />;
    default:
      return <ChoiceExercise key={props.item.key} {...props} />;
  }
}
