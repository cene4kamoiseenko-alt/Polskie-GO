/**
 * Жалоба на игрока: кнопка-флажок в строке рейтинга или друга и один диалог на экран (Modal фиксирован по окну, поэтому живёт вне анимированных строк).
 * Сервер — POST /api/players/:id/report (services/reports.ts); разбирает админка. Нужно Google Play: игроки видят чужие имена и фото.
 */
import { useState } from 'react';
import { ApiError, api } from '../lib/api';
import { haptic } from '../lib/telegram';
import { useReportCopy } from '../lib/reportCopy';
import { Icon } from './Icon';
import { Modal, useToast } from './ui';

export type ReportTarget = { id: string; name: string };
type Reason = 'name' | 'photo' | 'other';

export function ReportButton({ target, onOpen }: { target: ReportTarget; onOpen: (t: ReportTarget) => void }) {
  const c = useReportCopy();
  return (
    <button
      type="button"
      className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full text-mist/70 active:bg-white/10"
      aria-label={`${c('report_btn')}: ${target.name}`}
      onClick={() => { haptic.tap(); onOpen(target); }}
      data-report-open={target.id}
    >
      <Icon name="flag" size={17} />
    </button>
  );
}

export function ReportDialog({ target, onClose }: { target: ReportTarget | null; onClose: () => void }) {
  const c = useReportCopy();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const send = async (reason: Reason) => {
    if (!target) return;
    setBusy(true);
    try {
      await api(`/players/${target.id}/report`, { body: { reason } });
      haptic.success();
      toast(c('report_sent'), '✅');
      onClose();
    } catch (e) {
      toast(e instanceof ApiError && e.status === 429 ? c('report_limit') : c('report_fail'), '⚠️');
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal open={!!target} onClose={onClose}>
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-coral/15 text-coral"><Icon name="flag" size={28} /></div>
      <h2 className="mt-2 text-lg font-black">{c('report_title')}</h2>
      <p className="mt-1 break-words text-sm font-black">{target?.name}</p>
      <p className="muted mt-1 text-sm font-semibold leading-snug">{c('report_text')}</p>
      <div className="mt-4 space-y-2">
        {(['name', 'photo', 'other'] as const).map((r) => (
          <button key={r} type="button" className="btn btn-ghost w-full" disabled={busy} onClick={() => send(r)} data-report-reason={r}>
            {c(`report_${r}`)}
          </button>
        ))}
        <button type="button" className="w-full py-2 text-sm font-black" onClick={onClose}>{c('report_cancel')}</button>
      </div>
    </Modal>
  );
}
