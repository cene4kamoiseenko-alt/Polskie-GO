/**
 * «Сообщить об ошибке в задании»: флажок в шапке урока или миссии и один диалог на экран (Modal фиксирован по окну).
 * Сервер — POST /api/exercise-reports (services/exercise-reports.ts): тексты задания и последний ответ игрока он берёт сам,
 * клиент шлёт ссылку на задание, причину и необязательный комментарий. Разбирает админка («Ошибки в заданиях»).
 */
import { useState } from 'react';
import { ApiError, api } from '../lib/api';
import { haptic } from '../lib/telegram';
import { EXERCISE_REPORT_REASONS, useExerciseReportCopy, type ExerciseReportReason } from '../lib/exerciseReportCopy';
import { Icon } from './Icon';
import { Modal, cx, useToast } from './ui';

/** Урок, повторение, экзамен — сессия и ключ задания; миссия — slug и id шага. */
export type ExerciseReportRef = { sessionId: string; key: string } | { mission: string; step: string };

export function ReportExercise({ target, className }: { target: ExerciseReportRef | null; className?: string }) {
  const c = useExerciseReportCopy();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ExerciseReportReason | null>(null);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const close = () => {
    setOpen(false);
    setReason(null);
    setComment('');
  };
  const needComment = reason === 'other' && comment.trim().length < 3;
  const send = async () => {
    if (!target || !reason || busy || needComment) return;
    setBusy(true);
    try {
      await api('/exercise-reports', { body: { ...target, reason, comment: comment.trim() || undefined } });
      haptic.success();
      toast(c('xr_sent'), '✅');
      close();
    } catch (e) {
      toast(c(e instanceof ApiError && e.status === 429 ? 'xr_limit' : 'xr_fail'), '⚠️');
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <button
        type="button"
        disabled={!target}
        onClick={() => {
          haptic.tap();
          setOpen(true);
        }}
        className={cx('grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--border)] bg-elev text-[var(--text-muted)] disabled:opacity-40', className)}
        aria-label={c('xr_btn')}
        data-xr-open
      >
        <Icon name="flag" size={18} />
      </button>
      <Modal open={open} onClose={close}>
        <div role="group" aria-label={c('xr_title')} data-xr-dialog className="max-h-[calc(100dvh-6rem)] overflow-y-auto text-left">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-coral/15 text-coral">
            <Icon name="flag" size={24} />
          </div>
          <h2 className="mt-2 text-center text-lg font-black">{c('xr_title')}</h2>
          <p className="muted mt-1 text-center text-sm font-semibold leading-snug">{c('xr_text')}</p>
          <div className="mt-3 space-y-2" role="radiogroup" aria-label={c('xr_title')}>
            {EXERCISE_REPORT_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                role="radio"
                aria-checked={reason === r}
                className={cx('btn btn-ghost w-full !justify-start !px-3.5 !py-2.5 text-left text-[15px] leading-snug', reason === r && '!border-sky !bg-sky/10')}
                disabled={busy}
                onClick={() => {
                  haptic.select();
                  setReason(r);
                }}
                data-xr-reason={r}
              >
                {c(`xr_${r}`)}
              </button>
            ))}
          </div>
          {reason && (
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              rows={3}
              className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-elev p-3 text-[15px] font-semibold"
              placeholder={c(reason === 'other' ? 'xr_comment_other' : 'xr_comment')}
              aria-label={c(reason === 'other' ? 'xr_comment_other' : 'xr_comment')}
              data-xr-comment
            />
          )}
          <div className="mt-3 space-y-1">
            <button type="button" className="btn btn-primary w-full" disabled={!reason || needComment || busy} aria-busy={busy} onClick={send} data-xr-send>
              {c('xr_send')}
            </button>
            <button type="button" className="w-full py-2 text-sm font-black" onClick={close}>
              {c('xr_cancel')}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
