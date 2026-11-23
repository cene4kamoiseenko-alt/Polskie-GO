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
import tgCard from '../assets/social/tg-card.webp';
import igCard from '../assets/social/ig-card.webp';
import tgIcon from '../assets/social/tg-icon.webp';
import igIcon from '../assets/social/ig-icon.webp';
import questMap from '../assets/social/quest-map.webp';
import polandPhotos from '../assets/social/poland-photos.webp';
import megaphone from '../assets/social/megaphone.webp';

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

/**
 * «Мы в соцсетях» по макету владельца 2026-11-23 (docs/design/socials-2026-11-23/socials-mockup.png): тёмные карточки
 * с фоном, иконкой, разделителем, бейджем «+ миссия», декором справа и стрелкой. Фоны, иконки и декор — растр владельца
 * (apps/web/src/assets/social), текст, бейдж и стрелка — вёрсткой (переводы uk/ru/en). Карточки тёмные в обеих темах.
 */
export function SocialLinks() {
  const { t } = useT();
  const nav = useNavigate();
  const me = useMe().data;
  // Миссия ещё закрыта (и проверить её можно) — карточка канала ведёт в панель подписки, где есть и ссылка, и проверка.
  const missionLocked = !!me && !me.channelJoined && !me.guest;
  const rows = [
    {
      key: 'telegram', bg: tgCard, icon: tgIcon, art: questMap, title: t('social_telegram'), note: t('social_telegram_note'),
      badge: missionLocked ? t('social_mission_badge') : null,
      open: () => (missionLocked ? nav(CHANNEL_SHEET) : openLink(SOCIAL_LINKS.telegram)),
    },
    {
      key: 'instagram', bg: igCard, icon: igIcon, art: polandPhotos, title: t('social_instagram'), note: t('social_instagram_note'),
      badge: null, open: () => openLink(SOCIAL_LINKS.instagram),
    },
  ];
  return (
    <section className="px-4" data-social-links>
      <div className="mb-3 flex items-center gap-2.5">
        <img src={megaphone} alt="" width={34} height={25} className="shrink-0" draggable={false} />
        <h2 className="section-title shrink-0">{t('social_title')}</h2>
        <span aria-hidden className="h-[2px] min-w-6 flex-1 rounded-full" style={{ background: 'linear-gradient(90deg, #f5b83d, rgb(245 184 61 / 0))' }} />
      </div>
      <div className="grid gap-3">
        {rows.map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={() => { haptic.tap(); r.open(); }}
            data-social={r.key}
            className="relative isolate flex min-h-[112px] w-full items-center gap-3 overflow-hidden rounded-[24px] py-3.5 pl-3.5 pr-12 text-left text-white active:scale-[0.99]"
            style={{ backgroundImage: `url(${r.bg})`, backgroundSize: '100% 100%', boxShadow: '0 10px 24px -10px rgb(1 12 29 / 0.7)' }}
          >
            <img src={r.icon} alt="" width={52} height={52} className="h-[52px] w-[52px] shrink-0 drop-shadow-[0_4px_7px_rgb(0_0_0/0.35)]" draggable={false} />
            <span aria-hidden className="h-14 w-px shrink-0 bg-white/25" />
            <span className="relative z-[2] min-w-0 flex-1 pr-[56px] min-[390px]:pr-[66px]">
              <span className="block text-[15.5px] font-black leading-[1.2] min-[390px]:text-[16.5px]">{r.title}</span>
              <span className="mt-1 block text-[12.5px] font-semibold leading-snug text-[#c7d4e4]">{r.note}</span>
              {/* Бейдж под текстом (как в HTML-образце владельца): справа сверху на 360 px он наезжал на заголовок. */}
              {r.badge && (
                <span className="mt-2 inline-block rounded-full border border-[#35f2a0] bg-[#07a569] px-2.5 py-0.5 text-[11.5px] font-black shadow-[0_1px_14px_rgb(20_213_141/0.35)]" data-social-badge>
                  {r.badge}
                </span>
              )}
            </span>
            <img src={r.art} alt="" width={80} className="pointer-events-none absolute bottom-1.5 right-11 z-[1] w-[78px] min-[390px]:w-[88px]" draggable={false} />
            <span aria-hidden className="absolute right-3 top-1/2 z-[3] grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white/15">
              <Icon name="chevron-right" size={18} strokeWidth={2.6} />
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
