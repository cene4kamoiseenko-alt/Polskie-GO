import { useQuery } from '@tanstack/react-query';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../i18n';
import { useInView } from '../lib/motion';
import { HOMES, houseQuery, houseRoom, isNight, num, stateScene } from '../lib/house';
import { useMe } from '../lib/queries';
import { haptic } from '../lib/telegram';
import { Art } from './GameArt';
import { Icon } from './Icon';
import { Progress } from './ui';

/**
 * Домик на главной (2026-11-03: «домик бессмысленный, кнопку тяжело найти»): фото квартиры, где Бобек показывает день игрока
 * (ждёт урок / отдыхает после цели дня / спит), значок домашнего бонуса, когда его можно забрать, и прогресс накопления на следующую квартиру.
 */
export function HouseCard() {
  const { t } = useT();
  const nav = useNavigate();
  const me = useMe().data!;
  const st = useQuery(houseQuery).data;
  const slug = st?.home ?? me.outfit.home ?? 'housing-opole';
  const art = houseRoom(slug, stateScene(slug, st));
  // Фото — узкий вариант (@640) и только когда карточка на экране: на главной она ниже первого экрана и не должна грузиться со стартом (бюджет картинок, scripts/perf.ts).
  const small = art?.srcSet?.split(' ')[0] ?? art?.src;
  const box = useRef<HTMLSpanElement>(null);
  const seen = useInView(box, { once: true });
  const left = Math.max(0, (st?.goalXp ?? me.today.goalXp) - (st?.xp ?? me.today.xp));
  const status = isNight() ? t('house_state_night') : st?.goalDone ? t('house_state_done') : t('house_state_wait', { n: left });
  const bonusReady = !!st && st.goalDone && !st.claimed;
  return (
    <button type="button" onClick={() => { haptic.tap(); nav('/house'); }} className="card mx-4 block w-[calc(100%-2rem)] overflow-hidden text-left" data-home-house>
      <span ref={box} className="relative block aspect-[2/1] bg-muted">
        {small && seen && <img src={small} alt="" decoding="async" draggable={false} className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: '50% 40%' }} />}
        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-night/75 px-2.5 py-1 text-[12px] font-black text-white backdrop-blur-sm">
          <Icon name="home" size={14} /> {t('house_title')}
        </span>
        {bonusReady && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-xp px-2.5 py-1 text-[13px] font-black text-xp-ink shadow-lg" data-home-house-bonus>
            <Art name="coin" size={16} /> +{st.bonus}
          </span>
        )}
      </span>
      <span className="flex items-center gap-2 p-3.5">
        <span className="min-w-0 flex-1">
          <span className="block text-[16px] font-black leading-tight" lang="pl">{HOMES[slug]?.pl ?? t('house_title')}</span>
          <span className="muted block text-[13px] font-bold leading-snug" data-home-house-status>{bonusReady ? t('house_bonus_ready_d', { n: st.bonus }) : status}</span>
          {st?.next && HOMES[st.next.slug] && (
            <span className="mt-2 block">
              <span className="muted mb-1 block text-[11.5px] font-black">{t('house_next', { name: HOMES[st.next.slug].pl, have: num(Math.min(me.zlotki, st.next.price)), price: num(st.next.price) })}</span>
              <Progress value={Math.min(me.zlotki, st.next.price)} max={st.next.price} height={6} color="linear-gradient(90deg,#FFC857,#FFE29A)" />
            </span>
          )}
        </span>
        <Icon name="chevron-right" size={20} className="shrink-0 opacity-60" />
      </span>
    </button>
  );
}
