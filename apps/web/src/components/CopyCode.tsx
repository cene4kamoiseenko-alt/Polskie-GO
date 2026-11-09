/** Код, который копируется нажатием на него (код входа на другом устройстве в настройках). Отдельный файл: нужен только ленивым экранам. */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { copyText } from '../lib/clipboard';
import { haptic } from '../lib/telegram';
import { cx, useToast } from './ui';

type Props = {
  value: string;
  /** Подпись под кодом до нажатия («Нажми, чтобы скопировать»). */
  hint: string;
  /** Подпись и тост после копирования («Скопировано»). */
  done: string;
  /** Тост, если буфер обмена недоступен («Не удалось скопировать — выдели код вручную»). */
  fail: string;
  className?: string;
  children?: ReactNode;
  'data-copy-code'?: string;
};

export function CopyCode({ value, hint, done, fail, className, children, ...rest }: Props) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  // Новый код — снова «не скопирован»; таймер не должен пережить экран.
  useEffect(() => {
    setCopied(false);
    return () => clearTimeout(timer.current);
  }, [value]);
  const onCopy = async () => {
    const ok = await copyText(value);
    clearTimeout(timer.current);
    if (ok) {
      haptic.success();
      setCopied(true);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } else {
      haptic.error();
    }
    toast(ok ? done : fail, ok ? '📋' : '⚠️');
  };
  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={`${value}. ${copied ? done : hint}`}
      data-copied={copied ? 'true' : 'false'}
      className={cx('block w-full select-text rounded-2xl bg-night/60 px-3 py-3 text-center transition-colors active:bg-night/80', copied && 'ring-2 ring-xp', className)}
      {...rest}
    >
      <span className="block text-2xl font-black tracking-widest text-white" data-link-code>{value}</span>
      <span className={cx('mt-1 block text-xs font-bold', copied ? 'text-xp' : 'text-mist')} aria-live="polite">{copied ? `✓ ${done}` : hint}</span>
      {children}
    </button>
  );
}
