/**
 * Рендерери вправ. Відповіді перевіряє сервер; компоненти лише збирають відповідь користувача
 * і показують результат перевірки.
 */
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from '../lib/motion';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { alignSpeechWords, isLoneLetter, type I18n } from '@polski-go/shared';
import { useT, type TKey } from '../i18n';
import type { AnswerResult, PublicItem } from '../lib/types';
import { assetUrl } from '../lib/api';
import { recognizePolish, sfx, speak, speechRecognitionAvailable, stopSpeech, useSpeechState } from '../lib/audio';
import { haptic } from '../lib/telegram';
import { Icon, type LineIconName } from '../components/Icon';
import { useMe } from '../lib/queries';
import { microphoneRecordingAvailable, recognizeRecordedPolish } from '../lib/recorder';
import type { RecognitionRun } from '../lib/recognition';
import type { Transcription } from '../lib/api';
import { ApiError } from '../lib/api';
import { SpeakButton, SpeakPill, Waveform, cx } from '../components/ui';
import { PronHint } from '../components/PronHint';
import { NpcFace, Pictogram } from '../components/pictograms/Pictogram';
import { brandAsset } from '../lib/assets';

const beaverFace = brandAsset('avatar');

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
  /** Сесія уроку: серверний запис вимови прив'язується до неї й до завдання. */
  sessionId?: string;
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

/**
 * Польська фраза для прослуховування після відповіді: речення з правильним словом у пропуску,
 * польське слово завдання або правильна польська відповідь. null — якщо польського тексту немає.
 */
export function polishForFeedback(item: PublicItem, caText: string | null): string | null {
  const data = d<{ pl?: string; audioText?: string; options?: Opt[]; source?: unknown }>(item);
  switch (item.type) {
    case 'FILL_GAP':
      return data.pl && caText ? data.pl.replace('___', caText) : null;
    case 'LISTENING':
    case 'DICTATION':
      return data.audioText ?? null;
    case 'WORD_TRANSLATION':
      return data.pl ?? caText;
    case 'BUILD_SENTENCE':
    case 'WORD_ORDER':
    case 'SENTENCE_TRANSLATION':
    case 'GRAMMAR':
      return caText;
    default:
      return data.audioText ?? null;
  }
}

function Highlight({ text, fill, state }: { text: string; fill?: string; state?: string }) {
  const parts = text.split('___');
  return (
    <>
      {parts.map((p, i) => (
        <span key={i}>
          {p}
          {i < parts.length - 1 &&
            (fill ? (
              <motion.span
                key={fill}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={cx('gap-fill mx-1 inline-block rounded-lg px-2 align-baseline', state === 'correct' ? 'is-correct' : state === 'wrong' ? 'is-wrong' : '')}
              >
                {fill}
              </motion.span>
            ) : (
              <span className="mx-1 inline-block min-w-[56px] border-b-4 border-dashed border-sky align-baseline" />
            ))}
        </span>
      ))}
    </>
  );
}

/** Анімований еквалайзер аудіокартки (без руху при reduced motion). */
// ───────── Вибір варіанту ─────────
/** Відгук варіанта: вибір — легке збільшення, помилка — похитування, правильна — «пульс». */
function optionMotion(st: string | undefined) {
  if (st === 'wrong') return { x: [0, -8, 8, -5, 5, 0], scale: 1 };
  if (st === 'correct') return { scale: [1, 1.04, 1], x: 0 };
  if (st === 'selected') return { scale: 1.02, x: 0 };
  return { scale: 1, x: 0 };
}

/** Бобек «каже» завдання: репліка-бульбашка поруч із маскотом, настрій реагує на відповідь. */
/** Картка-підказка завдання (бобер-супутник реагує у сцені над завданням). */
function PromptCard({ children }: { children: ReactNode }) {
  return <div className="card prompt-card flex min-w-0 flex-wrap items-center justify-center gap-3 p-4">{children}</div>;
}

/**
 * Аудіювання без звуку не можна чесно пройти: на пристрої немає польського голосу або озвучка не завантажилась.
 * Тоді завдання можна пропустити — без XP і без помилки (сервер приймає { skipped: true } лише для звукових типів).
 */
function CantListen({ text, onSkip, place }: { text: string; onSkip: () => void; place: 'controls' | 'bottom' }) {
  const { t } = useT();
  const { status, issue } = useSpeechState(text);
  const slowState = useSpeechState(text, true);
  const failed = status === 'error' || slowState.status === 'error';
  const why = status === 'error' ? issue : slowState.issue;
  const skip = () => { stopSpeech(); onSkip(); };
  // Біля кнопок — лише чесне повідомлення про недоступну озвучку; внизу — тиха вторинна дія.
  if (place === 'controls') {
    if (!failed) return null;
    return (
      <div className="rounded-2xl bg-muted p-3 text-center">
        <p className="mb-2 text-sm font-bold">{t(why === 'no_polish_voice' ? 'ex_audio_missing' : why === 'blocked' ? 'audio_blocked' : 'audio_error')}</p>
        <button type="button" className="link-secondary" onClick={skip}>{t('ex_audio_skip')}</button>
      </div>
    );
  }
  if (failed) return null;
  return (
    <div className="pt-1 text-center">
      <button type="button" className="link-secondary" onClick={skip}>{t('ex_cant_listen')}</button>
    </div>
  );
}

function ChoiceExercise({ item, result, onChange, onSubmit }: ExProps) {
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
    if (typeof text === 'string' && item.type !== 'FIND_ERROR' && item.type !== 'READING') {
      // Однолітерний варіант (w, z, i) звучить у фразі: окремо голос назвав би літеру («duże wu»).
      speak(isLoneLetter(text) && data.pl?.includes('___') ? data.pl.replace(/_{2,}/, text) : text);
    }
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
                {st === 'correct' && <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-brand text-white"><Icon name="check" size={14} strokeWidth={3} /></span>}
                {o.image!.startsWith('/') || o.image!.startsWith('http') ? (
                  <img src={assetUrl(o.image!)} alt="" className="h-20 w-20 rounded-2xl object-cover" />
                ) : (
                  <Pictogram emoji={o.image} size={76} seed={o.id} />
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
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="card grid h-40 w-40 place-items-center">
              <Pictogram emoji={data.image} size={112} />
            </motion.div>
          )}
        </div>
      )}
      {/* Аудіювання (макет 02): дві кнопки з підписами — звичайна й повільна швидкість */}
      {item.type === 'LISTENING' && data.audioText && (
        <div className="grid grid-cols-2 gap-3">
          <SpeakPill text={data.audioText} url={data.audioUrl} />
          <SpeakPill text={data.audioText} url={data.audioUrl} slow />
        </div>
      )}
      {item.type === 'LISTENING' && data.audioText && !result && <CantListen place="controls" text={data.audioText} onSkip={() => onSubmit({ skipped: true })} />}
      {/* Читання: текст як справжня записка, оголошення чи меню */}
      {item.type === 'READING' && data.passage && (
        <div className="reading-paper relative p-4 pt-5 text-[16.5px] font-semibold leading-relaxed">
          <span className="reading-pin" aria-hidden />
          <div className="absolute right-2 top-2">
            <SpeakButton text={data.passage} size="sm" />
          </div>
          <div className="pr-8">{data.passage}</div>
        </div>
      )}
      {data.question && <p className="text-center text-lg font-black">{tr(data.question)}</p>}
      {/* Переклад слова: флешкартка з польським словом */}
      {data.pl && item.type === 'WORD_TRANSLATION' && (
        <div className="flash-card relative flex items-center justify-center gap-3 px-4 pb-5 pt-6">
          <span className="flash-tag">PL</span>
          <SpeakButton text={data.audioText ?? data.pl} url={data.audioUrl} />
          <span className="text-[28px] font-black leading-tight">{data.pl}</span>
        </div>
      )}
      {!data.pl && item.type === 'WORD_TRANSLATION' && data.translation && (
        <div className="flash-card relative flex items-center justify-center px-4 pb-5 pt-6">
          <span className="flash-tag is-target">→ PL</span>
          <span className="text-[26px] font-black leading-tight">{tr(data.translation)}</span>
        </div>
      )}
      {/* Пропуск: обране слово одразу стає в речення */}
      {item.type === 'FILL_GAP' && data.pl && (
        <div className="card prompt-card p-4 text-center">
          <p className="text-[23px] font-black leading-snug">
            <Highlight text={data.pl} fill={sel ? tr(data.options.find((o) => o.id === sel)?.text ?? '') : undefined} state={sel ? state(sel) : undefined} />
          </p>
          {data.translation && <p className="muted mt-2 font-bold">{tr(data.translation)}</p>}
        </div>
      )}
      <div className={cx(item.type === 'FILL_GAP' ? 'flex flex-wrap justify-center gap-2.5 pt-1' : grid ? 'grid grid-cols-2 gap-3' : 'space-y-3')}>
        {data.options.map((o, i) => (
          <motion.button
            key={o.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, ...optionMotion(state(o.id)) }}
            transition={{ delay: result || sel ? 0 : i * 0.04, duration: state(o.id) === 'wrong' ? 0.35 : 0.2 }}
            whileTap={{ scale: 0.97 }}
            data-state={state(o.id)}
            onClick={() => pick(o.id, o.text)}
            className={cx(
              'option flex items-center gap-3',
              item.type === 'FILL_GAP' && 'option-chip !w-auto justify-center',
              grid && 'justify-center text-center',
            )}
          >
            {item.type === 'LISTENING' ? (
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-sky/15 text-sky"><Icon name="headphones" size={16} /></span>
            ) : (
              !grid && item.type !== 'FILL_GAP' && <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border-2 border-soft text-sm font-black">{String.fromCharCode(65 + i)}</span>
            )}
            <span>{tr(o.text)}</span>
          </motion.button>
        ))}
      </div>
      {item.type === 'LISTENING' && data.audioText && <Waveform text={data.audioText} />}
      {item.type === 'LISTENING' && data.audioText && !result && <CantListen place="bottom" text={data.audioText} onSkip={() => onSubmit({ skipped: true })} />}
    </div>
  );
}

// ───────── Введення тексту ─────────
const POLISH = ['ą', 'ć', 'ę', 'ł', 'ń', 'ó', 'ś', 'ź', 'ż'];

function TextExercise({ item, result, onChange, onSubmit }: ExProps) {
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
        <div className="card prompt-card p-4 text-center text-xl font-black">{tr(data.source)}</div>
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
        <div className="grid grid-cols-2 gap-3">
          <SpeakPill text={data.audioText} url={data.audioUrl} />
          <SpeakPill text={data.audioText} url={data.audioUrl} slow />
        </div>
      )}
      {item.type === 'DICTATION' && data.audioText && !result && <CantListen place="controls" text={data.audioText} onSkip={() => onSubmit({ skipped: true })} />}
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
      {item.type === 'DICTATION' && data.audioText && !result && <CantListen place="bottom" text={data.audioText} onSkip={() => onSubmit({ skipped: true })} />}
    </div>
  );
}

// ───────── Складання речення ─────────
function OrderExercise({ item, result, onChange }: ExProps) {
  const { t, tr } = useT();
  const data = d<{ tokens: string[]; translation?: I18n }>(item);
  const [picked, setPicked] = useState<number[]>([]);
  const reduced = useReducedMotion();
  // Однолітерний прийменник чи сполучник чекає на наступне слово й звучить разом із ним («w» + «domu»).
  const carry = useRef<string | null>(null);
  const say = (tok: string) => {
    const text = carry.current ? `${carry.current} ${tok}` : tok;
    if (isLoneLetter(tok)) carry.current = text;
    else {
      carry.current = null;
      speak(text);
    }
  };
  const update = (next: number[]) => {
    if (next.length < picked.length) carry.current = null;
    setPicked(next);
    onChange(next.length ? { tokens: next.map((i) => data.tokens[i]) } : null);
  };
  return (
    <div className="space-y-5">
      {data.translation && (
        <div className="card prompt-card p-4 text-center text-xl font-black">{tr(data.translation)}</div>
      )}
      {/* Спільний layoutId: слово плавно переїжджає з банку в речення і назад. */}
      <LayoutGroup id={item.key}>
        <div className={cx('flex min-h-[112px] flex-wrap content-start gap-2 rounded-2xl border-2 border-dashed p-3', result ? (result.correct ? 'border-brand' : 'border-coral') : 'border-soft')}>
          {!picked.length && <span className="muted m-auto text-sm font-bold">{t('ex_tap_words')}</span>}
          {picked.map((ti, pos) => (
            <motion.button
              layoutId={reduced ? undefined : `w-${item.key}-${ti}`}
              key={`${ti}`}
              onClick={() => !result && update(picked.filter((_, i) => i !== pos))}
              className="rounded-xl border-2 border-soft bg-elev px-3 py-2 text-lg font-bold shadow-[0_3px_0_var(--border)]"
            >
              {data.tokens[ti]}
            </motion.button>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {data.tokens.map((tok, i) =>
            picked.includes(i) ? (
              <span key={i} className="rounded-xl border-2 border-transparent bg-muted px-3 py-2 text-lg font-bold text-transparent" aria-hidden>
                {tok}
              </span>
            ) : (
              <motion.button
                key={i}
                layoutId={reduced ? undefined : `w-${item.key}-${i}`}
                whileTap={{ scale: 0.92 }}
                disabled={!!result}
                onClick={() => {
                  haptic.select();
                  sfx.tap();
                  say(tok);
                  update([...picked, i]);
                }}
                data-token
                className="rounded-xl border-2 border-soft bg-elev px-3 py-2 text-lg font-bold shadow-[0_3px_0_var(--border)]"
              >
                {tok}
              </motion.button>
            ),
          )}
        </div>
      </LayoutGroup>
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
            <button key={o.id} data-pair="left" data-state={leftState(o.id)} onClick={() => tapLeft(o.id)} className="option text-center" style={!result && colorOf(o.id) ? { borderColor: colorOf(o.id)!, boxShadow: `0 3px 0 ${colorOf(o.id)}` } : undefined}>
              {tr(o.text)}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {data.right.map((o) => (
            <button key={o.id} data-pair="right" data-state={rightState(o.id)} onClick={() => tapRight(o.id)} className="option text-center" style={!result && colorOf(o.id) ? { borderColor: colorOf(o.id)!, boxShadow: `0 3px 0 ${colorOf(o.id)}` } : undefined}>
              {tr(o.text)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ───────── Вимова ─────────
type MicStatus = 'ready' | 'starting' | 'recording' | 'processing' | 'permission' | 'silence' | 'short' | 'offline' | 'not_configured' | 'unavailable' | 'blocked' | 'busy' | 'quota' | 'network' | 'timeout' | 'failed';

/** Що бачить людина в кожному стані запису: заголовок, пояснення й піктограма. */
const MIC_STATUS: Record<MicStatus, { title: TKey; text?: TKey; icon: LineIconName; warn?: boolean }> = {
  ready: { title: 'mic_st_ready', icon: 'mic' },
  starting: { title: 'mic_st_starting', icon: 'clock' },
  recording: { title: 'mic_st_recording', icon: 'mic' },
  processing: { title: 'ex_mic_processing', icon: 'clock' },
  permission: { title: 'mic_st_permission', text: 'ex_mic_permission', icon: 'lock', warn: true },
  silence: { title: 'mic_st_silence', text: 'mic_st_silence_text', icon: 'alert', warn: true },
  short: { title: 'mic_st_short', text: 'mic_st_short_text', icon: 'clock', warn: true },
  offline: { title: 'mic_st_offline', text: 'mic_st_offline_text', icon: 'wifi-off', warn: true },
  not_configured: { title: 'mic_st_not_configured', text: 'ex_mic_not_configured', icon: 'alert', warn: true },
  unavailable: { title: 'mic_st_unavailable', text: 'mic_st_unavailable_text', icon: 'alert', warn: true },
  blocked: { title: 'mic_st_blocked', text: 'mic_st_blocked_text', icon: 'lock', warn: true },
  busy: { title: 'mic_st_busy', text: 'mic_st_busy_text', icon: 'clock', warn: true },
  quota: { title: 'mic_st_quota', text: 'mic_st_quota_text', icon: 'clock', warn: true },
  network: { title: 'mic_st_network', text: 'ex_mic_network', icon: 'wifi-off', warn: true },
  timeout: { title: 'mic_st_timeout', text: 'ex_mic_timeout', icon: 'clock', warn: true },
  failed: { title: 'mic_st_failed', text: 'ex_mic_failed', icon: 'alert', warn: true },
};

/** Код помилки запису/розпізнавання (браузер, рекордер або API) → стан для людини. */
export function micStatusFromError(code: string, online: boolean): MicStatus {
  if (code === 'not-allowed') return 'permission';
  // WKWebView (Telegram на iPhone) може мати SpeechRecognition, але система забороняє його в цьому вікні.
  if (code === 'service-not-allowed') return 'blocked';
  if (code === 'silence' || code === 'no-speech' || code === 'stt_no_speech') return 'silence';
  if (code === 'too-short') return 'short';
  if (code === 'unsupported' || code === 'audio-capture' || code === 'start-failed') return 'unavailable';
  if (code === 'stt_not_configured') return 'not_configured';
  if (code === 'rate_limited') return 'busy';
  if (code === 'quota_exceeded') return 'quota';
  if (['network', 'network_error', 'stt_unavailable'].includes(code)) return online ? 'network' : 'offline';
  if (code === 'timeout' || code === 'network_timeout') return 'timeout';
  return 'failed';
}

function useOnline() {
  const [online, setOnline] = useState(() => typeof navigator === 'undefined' || navigator.onLine !== false);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine !== false);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);
  return online;
}

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

function PronunciationExercise({ item, result, onSubmit, sessionId }: ExProps) {
  const { t, tr } = useT();
  const data = d<{ text: string; translation: I18n; audioUrl?: string }>(item);
  const [status, setStatus] = useState<MicStatus>('ready');
  const [heard, setHeard] = useState<string | null>(null);
  const [level, setLevel] = useState(0);
  const [secs, setSecs] = useState(0);
  const online = useOnline();
  const serverRecognition = !!useMe().data?.audio?.recognition?.server;
  // Сервер відповів «не підключено» — далі лише тренування розпізнаванням пристрою (якщо воно є).
  const [serverOff, setServerOff] = useState(false);
  const mode = useMemo<'server' | 'device' | 'none'>(
    () => (serverRecognition && !serverOff && microphoneRecordingAvailable() ? 'server' : speechRecognitionAvailable() ? 'device' : 'none'),
    [serverRecognition, serverOff],
  );
  const run = useRef<RecognitionRun<Transcription> | null>(null);
  const attempt = useRef(0);
  const reduced = useReducedMotion();
  const live = status === 'starting' || status === 'recording';
  const cancel = () => {
    attempt.current++;
    run.current?.cancel();
    run.current = null;
  };
  useEffect(() => () => { cancel(); stopSpeech(); }, [item.key]);
  // Застосунок згорнули під час запису: мікрофон вимикається одразу, недописана спроба не надсилається.
  useEffect(() => {
    if (!live) return;
    const onHide = () => {
      if (document.visibilityState !== 'hidden') return;
      cancel();
      setStatus('ready');
      setLevel(0);
    };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, [live]);
  // Мережа повернулась — стан «немає мережі» знімається сам.
  useEffect(() => {
    if (online) setStatus((st) => (st === 'offline' || st === 'network' ? 'ready' : st));
  }, [online]);
  useEffect(() => {
    if (status !== 'recording') return;
    setSecs(0);
    const id = setInterval(() => setSecs((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, [status]);
  const record = async (practice: boolean) => {
    if (run.current || mode === 'none') return;
    if (mode === 'server' && !online) { setStatus('offline'); return; }
    const id = ++attempt.current;
    const mine = () => id === attempt.current;
    setStatus(mode === 'server' ? 'starting' : 'recording');
    setLevel(0);
    stopSpeech();
    haptic.tap();
    try {
      // Зараховується лише серверний запис, прив'язаний до цього завдання (підписана спроба).
      // Браузерне розпізнавання і повтори після відповіді — тренування без XP.
      const bind = !practice && sessionId ? { session: sessionId, item: item.key } : undefined;
      let current: RecognitionRun<Transcription>;
      if (mode === 'server') {
        current = recognizeRecordedPolish({
          bind,
          onStart: () => { if (mine()) setStatus('recording'); },
          onLevel: (l) => { if (mine()) setLevel(l); },
          onProcessing: () => { if (mine()) setStatus('processing'); },
        });
      } else {
        const device = recognizePolish();
        current = { ...device, promise: device.promise.then((transcript) => ({ transcript })) };
      }
      run.current = current;
      const heardNow = await current.promise;
      if (!mine()) return;
      setStatus('ready');
      setHeard(heardNow.transcript);
      if (!practice) onSubmit(heardNow.attempt ? { attempt: heardNow.attempt } : { transcript: heardNow.transcript });
    } catch (e) {
      if (!mine()) return;
      const code = e instanceof ApiError ? e.code : (e as Error).message;
      if (code === 'aborted') { setStatus('ready'); return; }
      if (code === 'stt_not_configured') setServerOff(true);
      setStatus(micStatusFromError(code, typeof navigator === 'undefined' || navigator.onLine !== false));
    } finally {
      if (mine()) { run.current = null; setLevel(0); }
    }
  };
  const diff = heard !== null ? alignSpeechWords(data.text, heard) : null;
  // Без мережі серверний запис не почнеться — показуємо це ще до натискання.
  const shown: MicStatus = mode === 'none' ? 'unavailable' : status === 'ready' && mode === 'server' && !online ? 'offline' : status;
  const info = MIC_STATUS[shown];
  const showPanel = shown !== 'ready' || !result;
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="flex w-full items-end gap-1">
        <div className="card prompt-card relative min-w-0 flex-1 p-4 text-left">
          <div lang="pl" className="text-2xl font-black leading-tight">{data.text}</div>
          <PronHint text={data.text} className="mt-0.5 text-[15px] font-bold text-sky-dark" />
          <div className="muted font-bold">{tr(data.translation)}</div>
          {/* Дві швидкості з підписами, як в аудіюванні: зразок перед записом. */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <SpeakPill text={data.text} url={data.audioUrl} />
            <SpeakPill text={data.text} url={data.audioUrl} slow />
          </div>
        </div>
      </div>
      {showPanel && (
        <div role="status" aria-live="polite" data-mic={shown} className={cx('flex w-full items-start gap-2.5 rounded-2xl p-3 text-left', info.warn ? 'bg-coral/10' : 'bg-muted')}>
          <span className={cx('grid h-8 w-8 shrink-0 place-items-center rounded-full', info.warn ? 'bg-coral/15 text-coral-dark' : live ? 'bg-pl-red text-white' : 'bg-sky/15 text-sky-dark')}>
            <Icon name={info.icon} size={17} />
          </span>
          <div className="min-w-0">
            <div className="font-black leading-tight">{t(info.title, { s: clock(secs) })}</div>
            {info.text && <div className="mt-0.5 text-sm font-semibold">{t(info.text)}</div>}
          </div>
        </div>
      )}
      {mode !== 'none' && (
        <div className="relative grid place-items-center">
          {status === 'recording' && mode === 'device' && !reduced && [0, 1, 2].map((i) => (
            <motion.span key={i} className="absolute h-28 w-28 rounded-full bg-coral/30" initial={{ scale: 1, opacity: 0.6 }} animate={{ scale: 1.9, opacity: 0 }} transition={{ repeat: Infinity, duration: 1.6, delay: i * 0.5 }} />
          ))}
          {/* Рівень сигналу: коло росте з голосом — видно, що мікрофон тебе чує. */}
          {status === 'recording' && mode === 'server' && (
            <span aria-hidden className="absolute h-28 w-28 rounded-full bg-coral/30" style={{ transform: `scale(${1 + level * 0.55})`, transition: reduced ? undefined : 'transform 100ms linear' }} />
          )}
          <motion.button
            whileTap={{ scale: 0.92 }}
            disabled={status === 'processing'}
            onClick={() => (live ? run.current?.stop() : void record(!!result))}
            aria-label={t(status === 'processing' ? 'ex_mic_processing' : live ? 'ex_mic_stop' : 'ex_mic_start')}
            className={cx('relative grid h-28 w-28 place-items-center rounded-full text-white', live ? 'bg-coral' : 'bg-pl-red')}
            style={{ boxShadow: `0 6px 0 var(--color-coral-dark)` }}
          >
            {status === 'processing'
              ? <span className="block h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent motion-reduce:animate-none" />
              : <svg viewBox="0 0 24 24" width="46" height="46" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" /><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7" /></svg>}
          </motion.button>
        </div>
      )}
      {mode !== 'none' && (
        <div className="font-black">
          {status === 'processing' ? t('ex_mic_processing') : live ? t('ex_mic_stop') : info.warn ? t('error_retry') : t(result ? 'ex_mic_again' : 'ex_mic_start')}
        </div>
      )}
      {diff && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full rounded-2xl bg-muted p-3 text-left">
          <div className="muted text-xs font-black uppercase tracking-wide">{t('ex_mic_heard')}</div>
          <div className="mb-2 font-bold">„{heard || '…'}”</div>
          <div className="flex flex-wrap gap-1.5">
            {diff.words.map((x, i) => (
              <span key={i} className={cx('rounded-lg px-2 py-0.5 font-black', x.st === 'ok' ? 'bg-brand/20 text-brand-dark' : x.st === 'near' ? 'bg-xp/30 text-xp-dark' : 'bg-coral/15 text-coral-dark line-through decoration-2')}>{x.w}</span>
            ))}
            {diff.extra.map((w, i) => (
              <span key={`x${i}`} className="muted rounded-lg border border-dashed border-current px-2 py-0.5 font-bold">+{w}</span>
            ))}
          </div>
          <div className="muted mt-2 text-[11px] font-bold">{t('ex_mic_legend')}</div>
        </motion.div>
      )}
      {result && !result.skipped && result.similarity !== undefined && (
        <div className="font-bold">{t('ex_similarity', { n: Math.round(result.similarity * 100) })}</div>
      )}
      <p className="muted text-xs font-semibold">{t('ex_speech_note')}</p>
      {mode === 'server' ? <p className="muted text-xs">{t('ex_mic_server_note')}</p> : mode === 'device' && <p className="muted text-xs">{t('ex_mic_device_note')}</p>}
      {!result && (
        <button className="text-sm font-black text-sky-dark underline" data-action="skip" onClick={() => { cancel(); setStatus('ready'); onSubmit({ skipped: true }); }}>
          {t(mode !== 'none' ? 'lesson_skip_mic' : 'ex_mic_continue')}
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
      {data.scene && <div className="rounded-2xl bg-muted px-4 py-2 text-center text-sm font-bold">{tr(data.scene)}</div>}
      <div className="flex items-center gap-2">
        <NpcFace emoji={data.npc.emoji} name={data.npc.name} size={48} />
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
                <img src={beaverFace ?? undefined} alt="" width={24} height={24} className="mt-px h-6 w-6 shrink-0 rounded-full" hidden={!beaverFace} />
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
      {finished && <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center font-black text-brand-dark">{t('ex_dialog_done')}</motion.div>}
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
