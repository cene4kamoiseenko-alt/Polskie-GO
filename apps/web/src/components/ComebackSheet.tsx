/**
 * «С возвращением» (docs/superpowers/specs/2026-11-24-engagement-design.md, раздел 4): первый вход после 7+ дней без занятий — шторка
 * с подарком (50 злотков, сервер решает, положен ли он: `me.comeback`) и сразу короткое повторение, чтобы вернуться без порога.
 * Закрыл — до следующего запуска приложения.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useT } from '../i18n';
import { useMe } from '../lib/queries';
import type { Me } from '../lib/types';
import { Sheet, useToast } from './ui';

const KEY = 'pg.comebackClosed';
const wasClosed = () => {
  try {
    return sessionStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
};
const rememberClosed = () => {
  try {
    sessionStorage.setItem(KEY, '1');
  } catch {
    /* приватное окно */
  }
};

export function ComebackSheet() {
  const { t } = useT();
  const nav = useNavigate();
  const qc = useQueryClient();
  const toast = useToast();
  const me = useMe().data;
  const [closed, setClosed] = useState(wasClosed);
  const [granted, setGranted] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const offer = me?.comeback ?? null;
  const open = !closed && (granted !== null || !!offer);
  const close = () => {
    rememberClosed();
    setClosed(true);
  };
  const claim = async () => {
    setBusy(true);
    try {
      const r = await api<{ granted: number }>('/comeback/claim', { body: {} });
      setGranted(r.granted);
      qc.setQueryData<Me>(['me'], (m) => (m ? { ...m, comeback: null } : m));
      void qc.invalidateQueries({ queryKey: ['me'] });
    } catch {
      toast(t('error_generic'));
    } finally {
      setBusy(false);
    }
  };
  const practice = () => {
    close();
    nav((me?.counters.dueReviews ?? 0) > 0 ? '/practice/REVIEW' : '/practice/WARMUP');
  };
  return (
    <Sheet open={open} onClose={close} label={t('comeback_title')}>
      <div data-comeback className="space-y-3 pb-2 text-center">
        <img src="/channel/brawo-2.jpg" alt="" className="mx-auto aspect-square w-44 rounded-3xl object-cover shadow-[var(--shadow-card)]" decoding="async" />
        <h2 className="text-2xl font-black">{t('comeback_title')}</h2>
        {granted === null ? (
          <>
            <p className="muted font-semibold">{t('comeback_text', { n: offer?.gift ?? 50 })}</p>
            <button className="btn btn-red w-full text-lg" data-comeback-claim disabled={busy} aria-busy={busy} onClick={() => void claim()}>
              {t('comeback_claim')}
            </button>
          </>
        ) : (
          <>
            <p className="muted font-semibold">{t('comeback_done', { n: granted })}</p>
            <button className="btn btn-primary w-full text-lg" data-comeback-next onClick={practice}>
              {t('comeback_practice')}
            </button>
          </>
        )}
      </div>
    </Sheet>
  );
}
