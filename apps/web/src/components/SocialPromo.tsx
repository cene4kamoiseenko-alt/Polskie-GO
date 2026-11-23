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
import plaque from '../assets/social/plaque.webp';
import megaphone from '../assets/social/megaphone.webp';
import pinnedPhotos from '../assets/social/pinned-photos.webp';
import flag from '../assets/social/flag.webp';
import map from '../assets/social/map.webp';
import camera from '../assets/social/camera.webp';
import photos from '../assets/social/photos.webp';
import arrow from '../assets/social/arrow.webp';

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
 * «Мы в соцсетях» — вариант владельца 2026-11-23 «золотая плашка с флагом» (лист — docs/design/socials-2026-11-23/socials-v2-sheet.png):
 * заголовок на золотой плашке с листьями, рупором, фото и флагом; тёмные карточки с квадратными иконками, декором (карта /
 * фотоаппарат с фото) и стрелкой. Растр вырезан с листа (apps/web/src/assets/social); надписи и бейдж «+ миссия» — вёрсткой
 * (переводы uk/ru/en). Бейдж справа вверху — от 390 px; на 360 px он под описанием, чтобы не наезжать на заголовок.
 */
export function SocialLinks() {
  const { t } = useT();
  const nav = useNavigate();
  const me = useMe().data;
  // Миссия ещё закрыта (и проверить её можно) — карточка канала ведёт в панель подписки, где есть и ссылка, и проверка.
  const missionLocked = !!me && !me.channelJoined && !me.guest;
  const badge = missionLocked ? t('social_mission_badge') : null;
  const pill = 'rounded-full border border-[#8af5ad] bg-[linear-gradient(180deg,#3fdc6d,#12a04a)] px-3 py-[3px] text-[12px] font-black text-white shadow-[0_2px_10px_rgb(18_160_74/0.45)]';
  return (
    <section className="px-4" data-social-links>
      {/* Заголовок: позиции в % от ширины — композиция держится на 360–430 px */}
      <div className="relative mb-2 aspect-[328/96] w-full">
        <img src={plaque} alt="" className="absolute left-[3%] top-[6%] w-[79%]" draggable={false} />
        <img src={megaphone} alt="" className="absolute left-0 top-0 w-[21%] -rotate-6" draggable={false} />
        <h2 className="absolute left-[20.5%] top-[37%] whitespace-nowrap text-[clamp(17px,5.2vw,23px)] font-black leading-none text-[#fff4dc] [text-shadow:0_2px_0_#16233f,0_0_8px_rgb(0_0_0/0.45)]">
          {t('social_title')}
        </h2>
        <img src={pinnedPhotos} alt="" className="absolute right-[1%] top-0 w-[22%] rotate-[5deg]" draggable={false} />
        <img src={flag} alt="" className="absolute bottom-0 right-0 w-[22%]" draggable={false} />
      </div>
      <div className="grid gap-3">
        <button
          type="button"
          onClick={() => { haptic.tap(); if (missionLocked) nav(CHANNEL_SHEET); else openLink(SOCIAL_LINKS.telegram); }}
          data-social="telegram"
          className={cardClass}
          style={{ backgroundImage: `url(${tgCard})`, backgroundSize: '100% 100%' }}
        >
          <img src={tgIcon} alt="" width={56} height={56} className="h-14 w-14 shrink-0 drop-shadow-[0_4px_8px_rgb(0_0_0/0.35)]" draggable={false} />
          <span className="relative z-[2] min-w-0 flex-1 pr-[64px] min-[390px]:pr-[92px]">
            <span className="block text-[15.5px] font-black leading-[1.2] min-[390px]:text-[16.5px]">{t('social_telegram')}</span>
            <span className="mt-1 block text-[12.5px] font-semibold leading-snug text-[#c7d4e4]">{t('social_telegram_note')}</span>
            {badge && <span className={`${pill} mt-2 inline-block min-[390px]:hidden`} data-social-badge>{badge}</span>}
          </span>
          {badge && <span className={`${pill} absolute right-11 top-3.5 z-[3] hidden min-[390px]:inline-block`} data-social-badge-wide>{badge}</span>}
          <img src={map} alt="" className="pointer-events-none absolute bottom-2 right-9 z-[1] w-[92px] min-[390px]:w-[112px]" draggable={false} />
          <img src={arrow} alt="" aria-hidden className="absolute right-2.5 top-1/2 z-[3] h-8 w-8 -translate-y-1/2" draggable={false} />
        </button>
        <button
          type="button"
          onClick={() => { haptic.tap(); openLink(SOCIAL_LINKS.instagram); }}
          data-social="instagram"
          className={cardClass}
          style={{ backgroundImage: `url(${igCard})`, backgroundSize: '100% 100%' }}
        >
          <img src={igIcon} alt="" width={56} height={56} className="h-14 w-14 shrink-0 drop-shadow-[0_4px_8px_rgb(0_0_0/0.35)]" draggable={false} />
          <span className="relative z-[2] min-w-0 flex-1 pr-[72px] min-[390px]:pr-[100px]">
            <span className="block text-[15.5px] font-black leading-[1.2] min-[390px]:text-[16.5px]">{t('social_instagram')}</span>
            <span className="mt-1 block text-[12.5px] font-semibold leading-snug text-[#c7d4e4]">{t('social_instagram_note')}</span>
          </span>
          <span aria-hidden className="pointer-events-none absolute bottom-1.5 right-9 z-[1] h-[62px] w-[84px] min-[390px]:h-[74px] min-[390px]:w-[100px]">
            <img src={photos} alt="" className="absolute right-0 top-0 w-[62%]" draggable={false} />
            <img src={camera} alt="" className="absolute bottom-0 left-0 w-[66%]" draggable={false} />
          </span>
          <img src={arrow} alt="" aria-hidden className="absolute right-2.5 top-1/2 z-[3] h-8 w-8 -translate-y-1/2" draggable={false} />
        </button>
      </div>
    </section>
  );
}

const cardClass = 'relative isolate flex min-h-[118px] w-full items-center gap-3 overflow-hidden rounded-[22px] py-3.5 pl-3.5 pr-11 text-left text-white shadow-[0_10px_24px_-10px_rgb(1_12_29/0.7)] active:scale-[0.99]';
