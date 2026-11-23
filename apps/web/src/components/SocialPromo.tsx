/**
 * Реклама наших соцсетей (2026-11-23, docs/superpowers/specs/2026-11-23-channel-mission-design.md):
 * - ChannelHomeCard — карточка на главной «Секретная миссия в нашем канале», пока подписка не подтверждена; можно скрыть
 *   (на этом устройстве). Гостю вне Telegram не показываем: проверить подписку он не сможет.
 * - SocialLinks — блок «Мы в соцсетях» в профиле: Telegram-канал (пока миссия закрыта — ведёт в панель подписки) и Instagram.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SOCIAL_LINKS } from '@polski-go/shared';
import { useT } from '../i18n';
import { useMe } from '../lib/queries';
import { haptic, openLink } from '../lib/telegram';
import { Icon } from './Icon';
import { Section } from './ui';

const HIDDEN_KEY = 'pg.channelCard.closed';
const CHANNEL_SHEET = '/life?channel=1';

export function ChannelHomeCard() {
  const { t } = useT();
  const nav = useNavigate();
  const me = useMe().data;
  const [hidden, setHidden] = useState(() => {
    try {
      return localStorage.getItem(HIDDEN_KEY) === '1';
    } catch {
      return false;
    }
  });
  if (!me || hidden || me.channelJoined || me.guest) return null;
  const hide = () => {
    setHidden(true);
    try {
      localStorage.setItem(HIDDEN_KEY, '1');
    } catch {
      /* без хранилища карточка вернётся при следующем входе */
    }
  };
  return (
    <div className="card mx-4 flex items-start gap-3 p-3.5" data-channel-home-card>
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-sky-dark text-white" aria-hidden>
        <Icon name="send" size={24} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[16px] font-black leading-tight">{t('channel_home_title')}</div>
        <div className="muted mt-0.5 text-[13px] font-bold leading-snug">{t('channel_home_text')}</div>
        <div className="mt-2.5 flex flex-wrap gap-2">
          <button className="btn btn-primary min-h-0 px-3.5 py-2 text-[14px]" onClick={() => { haptic.tap(); nav(CHANNEL_SHEET); }} data-channel-home-open>
            {t('channel_home_open')}
          </button>
          <button className="btn btn-ghost min-h-0 px-3.5 py-2 text-[14px]" onClick={hide}>
            {t('channel_home_hide')}
          </button>
        </div>
      </div>
    </div>
  );
}

export function SocialLinks() {
  const { t } = useT();
  const nav = useNavigate();
  const me = useMe().data;
  // Миссия ещё закрыта (и проверить её можно) — строка канала ведёт в панель подписки, где есть и ссылка, и проверка.
  const missionLocked = !!me && !me.channelJoined && !me.guest;
  const rows = [
    {
      key: 'telegram', icon: 'send' as const, bg: 'bg-sky-dark', title: t('social_telegram'), note: t('social_telegram_note'),
      badge: missionLocked ? t('social_mission_badge') : null,
      open: () => (missionLocked ? nav(CHANNEL_SHEET) : openLink(SOCIAL_LINKS.telegram)),
    },
    {
      key: 'instagram', icon: 'camera' as const, bg: 'bg-[linear-gradient(135deg,#F58529,#DD2A7B_55%,#8134AF)]', title: t('social_instagram'), note: t('social_instagram_note'),
      badge: null, open: () => openLink(SOCIAL_LINKS.instagram),
    },
  ];
  return (
    <Section title={t('social_title')}>
      <div className="grid gap-2" data-social-links>
        {rows.map((r) => (
          <button key={r.key} className="card flex w-full items-center gap-3 p-3 text-left" onClick={() => { haptic.tap(); r.open(); }} data-social={r.key}>
            <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-white ${r.bg}`} aria-hidden>
              <Icon name={r.icon} size={22} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15.5px] font-black leading-tight">{r.title}</span>
              <span className="muted block text-[12.5px] font-bold leading-snug">{r.note}</span>
            </span>
            {r.badge && <span className="shrink-0 rounded-full bg-brand px-2 py-0.5 text-[12px] font-black text-white">{r.badge}</span>}
            <Icon name="chevron-right" size={16} className="shrink-0 text-[var(--text-muted)]" />
          </button>
        ))}
      </div>
    </Section>
  );
}
