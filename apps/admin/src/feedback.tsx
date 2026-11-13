/**
 * Обратная связь в админке (обновление 2026-11-13): всплывающие сообщения вместо alert() и окно подтверждения вместо confirm()/prompt().
 *  • toast — короткое сообщение внизу экрана, само исчезает; читается экранным диктором (aria-live), ошибки — сразу (role="alert");
 *  • confirm — окно <dialog> поверх страницы: фокус внутри, Esc — отмена, опасное действие — красная кнопка с понятным названием;
 *  • ask — то же окно с полем ввода (причина блокировки, новый пароль).
 */
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { cx } from './ui';

type Tone = 'ok' | 'error';
type Toast = { id: number; text: string; tone: Tone };
type ConfirmOpts = { title: string; body?: ReactNode; confirm: string; danger?: boolean };
type AskOpts = ConfirmOpts & { label: string; placeholder?: string; type?: 'text' | 'password'; minLength?: number; initial?: string; optional?: boolean };
type Pending = { opts: AskOpts | ConfirmOpts; input: boolean; resolve: (v: string | null) => void };

type Api = {
  toast: (text: string, tone?: Tone) => void;
  confirm: (o: ConfirmOpts) => Promise<boolean>;
  ask: (o: AskOpts) => Promise<string | null>;
  /** Выполнить действие: успех — сообщение, ошибка — сообщение об ошибке. Возвращает true при успехе. */
  run: (fn: () => Promise<unknown>, ok?: string) => Promise<boolean>;
};

const Ctx = createContext<Api | null>(null);

export function useFeedback() {
  const v = useContext(Ctx);
  if (!v) throw new Error('FeedbackProvider is missing');
  return v;
}

let seq = 0;

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [pending, setPending] = useState<Pending | null>(null);

  const toast = useCallback((text: string, tone: Tone = 'ok') => {
    const id = ++seq;
    setToasts((t) => [...t.slice(-2), { id, text, tone }]);
    // Ошибку читают дольше: её нужно понять, а не просто заметить.
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tone === 'error' ? 7000 : 3500);
  }, []);
  const ask = useCallback((opts: AskOpts) => new Promise<string | null>((resolve) => setPending({ opts, input: true, resolve })), []);
  const confirm = useCallback((opts: ConfirmOpts) => new Promise<boolean>((resolve) => setPending({ opts, input: false, resolve: (v) => resolve(v !== null) })), []);
  const run = useCallback(
    async (fn: () => Promise<unknown>, ok?: string) => {
      try {
        await fn();
        if (ok) toast(ok);
        return true;
      } catch (e) {
        toast((e as Error).message, 'error');
        return false;
      }
    },
    [toast],
  );
  const close = (v: string | null) => {
    pending?.resolve(v);
    setPending(null);
  };

  return (
    <Ctx.Provider value={{ toast, confirm, ask, run }}>
      {children}
      {pending && <Dialog pending={pending} onClose={close} />}
      {/* Вверху справа на компьютере, над нижней панелью «Сохранить» на телефоне — сообщение не закрывает кнопки. */}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4 md:bottom-auto md:left-auto md:right-4 md:top-4 md:items-end md:px-0" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.tone === 'error' ? 'alert' : 'status'}
            data-toast={t.tone}
            className={cx(
              'pointer-events-auto max-w-md rounded-2xl px-4 py-2.5 text-sm font-semibold shadow-xl ring-1',
              t.tone === 'error' ? 'bg-[#8f1d2f] text-white ring-black/10' : 'bg-night text-white ring-white/10',
            )}
          >
            {t.tone === 'error' ? '⚠️ ' : '✓ '}
            {t.text}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

function Dialog({ pending, onClose }: { pending: Pending; onClose: (v: string | null) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const o = pending.opts as AskOpts;
  const [value, setValue] = useState(o.initial ?? '');
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);
  const tooShort = pending.input && !o.optional && value.trim().length < (o.minLength ?? 1);
  return (
    <dialog
      ref={ref}
      aria-labelledby="dlg-title"
      className="m-auto w-[min(92vw,440px)] rounded-2xl border border-line bg-white p-0 text-left shadow-2xl backdrop:bg-night/50"
      onCancel={(e) => {
        e.preventDefault();
        onClose(null);
      }}
      data-dialog
    >
      <form
        method="dialog"
        className="space-y-4 p-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (tooShort) return;
          onClose(pending.input ? value.trim() : '');
        }}
      >
        <h2 id="dlg-title" className="text-lg font-black tracking-tight text-night">
          {o.title}
        </h2>
        {o.body && <div className="space-y-2 text-sm text-slate-600">{o.body}</div>}
        {pending.input && (
          <label className="block text-sm font-semibold text-slate-700">
            {o.label}
            <input
              autoFocus
              className="inp mt-1"
              type={o.type ?? 'text'}
              value={value}
              placeholder={o.placeholder}
              minLength={o.minLength}
              autoComplete={o.type === 'password' ? 'new-password' : 'off'}
              onChange={(e) => setValue(e.target.value)}
            />
            {o.minLength && o.minLength > 1 && <span className="mt-1 block text-xs font-normal text-slate-500">не короче {o.minLength} символов</span>}
          </label>
        )}
        <div className="flex flex-wrap justify-end gap-2 pt-1">
          <button type="button" className="btn-s" onClick={() => onClose(null)} autoFocus={!pending.input}>
            Отмена
          </button>
          <button type="submit" className={o.danger ? 'btn-d' : 'btn-p'} disabled={tooShort} data-dialog-confirm>
            {o.confirm}
          </button>
        </div>
      </form>
    </dialog>
  );
}
