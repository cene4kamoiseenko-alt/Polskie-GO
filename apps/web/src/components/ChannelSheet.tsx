/**
 * Панель «Секретная миссия для подписчиков» (2026-11-23, docs/superpowers/specs/2026-11-23-channel-mission-design.md):
 * шаг 1 — открыть канал @polskigoo (внутри Telegram, приложение не закрывается), шаг 2 — «Я подписался — проверить»:
 * сервер спрашивает Telegram (POST /channel/verify). Успех — миссия открыта навсегда, сразу входим в неё.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { SOCIAL_LINKS } from '@polski-go/shared';
import { useT } from '../i18n';
import { api, ApiError } from '../lib/api';
import { useMe } from '../lib/queries';
import { haptic, openLink } from '../lib/telegram';
import waveBobek from '../assets/beaver/wave.webp';
import { Icon } from './Icon';
import { Sheet, cx, useToast } from './ui';

export const CHANNEL_MISSION_SLUG = 'escape-twardowski';

type Verify = { ok: true } | { ok: false; reason: 'not_member' | 'no_telegram' | 'unavailable' };
type Problem = 'not_member' | 'no_telegram' | 'unavailable' | 'rate_limited';

const PROBLEM_KEY = {
  not_member: 'channel_not_member',
  no_telegram: 'channel_no_telegram',
  unavailable: 'channel_unavailable',
  rate_limited: 'channel_rate_limited',
} as const;

export function ChannelSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useT();
  const nav = useNavigate();
  const qc = useQueryClient();
  const toast = useToast();
  const guest = !!useMe().data?.guest;
  const [checking, setChecking] = useState(false);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [opened, setOpened] = useState(false);

  const subscribe = () => {
    haptic.tap();
    setOpened(true);
    setProblem(null);
    openLink(SOCIAL_LINKS.telegram);
  };

  const check = async () => {
    if (checking) return;
    haptic.tap();
    setChecking(true);
    setProblem(null);
    try {
      const r = await api<Verify>('/channel/verify', { body: {} });
      if (r.ok) {
        haptic.success();
        await Promise.all([qc.invalidateQueries({ queryKey: ['missions'] }), qc.invalidateQueries({ queryKey: ['me'] })]);
        toast(t('channel_unlocked'), '🗝️');
        onClose();
        nav(`/life/${CHANNEL_MISSION_SLUG}`);
      } else {
        haptic.error();
        setProblem(r.reason);
      }
    } catch (e) {
      haptic.error();
      setProblem(e instanceof ApiError && e.status === 429 ? 'rate_limited' : 'unavailable');
    } finally {
      setChecking(false);
    }
  };

  const shown: Problem | null = problem ?? (guest ? 'no_telegram' : null);
  return (
    <Sheet open={open} onClose={onClose} label={t('channel_sheet_title')}>
      <div className="flex flex-col items-center pb-2 text-center" data-channel-sheet>
        {/* Крупный классический Бобек (красное худи PL, машет) — владелец 2026-11-23: «другую модель побольше»; не зависит от наряда игрока. */}
        <div className="relative -mt-2 grid h-[150px] w-[150px] place-items-center" aria-hidden>
          <span className="absolute inset-4 rounded-full bg-[radial-gradient(circle,rgb(255_196_80/0.35)_0%,transparent_70%)] blur-md" />
          <img src={waveBobek} alt="" width={150} height={150} className="relative h-[150px] w-[150px] object-contain drop-shadow-[0_8px_16px_rgb(0_0_0/0.35)]" draggable={false} data-channel-bobek />
        </div>
        <h2 className="mt-1 text-[21px] font-black leading-tight">{t('channel_sheet_title')}</h2>
        <p className="muted mt-1.5 text-[14.5px] font-bold leading-snug">{t('channel_sheet_text')}</p>
      </div>
      <ol className="mt-3 grid gap-2.5">
        <li>
          <button type="button" className="btn btn-primary w-full gap-2" onClick={subscribe} data-channel-subscribe>
            <span className="grid h-6 w-6 place-items-center rounded-full bg-white/25 text-[13px] font-black" aria-hidden>1</span>
            <Icon name="send" size={18} /> {t('channel_step_subscribe')}
          </button>
        </li>
        <li>
          <button
            type="button"
            className={cx('btn w-full gap-2', opened ? 'btn-red' : 'btn-ghost')}
            onClick={() => void check()}
            disabled={checking}
            aria-busy={checking}
            data-channel-check
          >
            <span className="grid h-6 w-6 place-items-center rounded-full bg-black/10 text-[13px] font-black" aria-hidden>2</span>
            {checking ? t('channel_checking') : t('channel_step_check')}
          </button>
        </li>
      </ol>
      <p role="status" aria-live="polite" className={cx('mt-3 min-h-[1.25rem] text-center text-[13.5px] font-bold leading-snug', shown ? 'text-pl-red' : 'muted')} data-channel-problem={shown ?? undefined}>
        {shown ? t(PROBLEM_KEY[shown]) : ''}
      </p>
    </Sheet>
  );
}
