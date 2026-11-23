/** «Польська в житті»: список місій-історій з реальних ситуацій у Польщі. */
import { useQuery } from '@tanstack/react-query';
import { motion } from '../lib/motion';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useT, type TKey } from '../i18n';
import { haptic } from '../lib/telegram';
import { useTabSwipe } from '../lib/swipe';
import { ErrorState, ScreenSkeleton, cx } from '../components/ui';
import { Icon } from '../components/Icon';
import { MissionCard, missionHref, missionsQuery } from '../components/MissionCard';
import { ChannelSheet } from '../components/ChannelSheet';
import { Scene } from '../components/Illustrations';
import { PassCard, TopStats } from './Home';
import { questLifeThumb } from '../lib/screenArt';

const CATS: { id: string; key: TKey }[] = [
  { id: 'all', key: 'life_cat_all' },
  { id: 'shop', key: 'life_cat_shop' },
  { id: 'food', key: 'life_cat_food' },
  { id: 'road', key: 'life_cat_road' },
  { id: 'transport', key: 'life_cat_transport' },
  { id: 'home', key: 'life_cat_home' },
  { id: 'work', key: 'life_cat_work' },
];

const CAT_IDS = CATS.map((c) => c.id);

export default function MissionsScreen() {
  const { t, tr } = useT();
  const nav = useNavigate();
  const [cat, setCat] = useState('all');
  // ?channel=1 — панель подписки на канал (карточка миссии канала с замком, карточка на главной, вход в миссию без подписки).
  const [params, setParams] = useSearchParams();
  const channelOpen = params.get('channel') === '1';
  const q = useQuery(missionsQuery);
  // Свайп по экрану листает категории (Все → Магазины → Еда → …), как вкладки в Квестах.
  const swipe = useTabSwipe(CAT_IDS, cat, (k) => { haptic.select(); setCat(k); });
  if (q.isLoading) return <ScreenSkeleton />;
  if (q.error) return <ErrorState error={q.error} onRetry={() => q.refetch()} />;
  const { missions, soon } = q.data!;
  // Миссия канала — первой во «Все»: это и реклама канала, и самая длинная история.
  const list = missions.filter((m) => cat === 'all' || m.category === cat).sort((a, b) => (cat === 'all' ? Number(!!b.channel) - Number(!!a.channel) : 0));
  const done = missions.filter((m) => m.completions > 0).length;
  const lifeArt = questLifeThumb();
  return (
    <div ref={swipe.ref} className="space-y-0 pb-6" data-tab-swipe="life">
      <ChannelSheet open={channelOpen} onClose={() => setParams({}, { replace: true })} />
      {/* Вкладка нижней панели (2026-11-15): без кнопки «Назад», шапка как у остальных вкладок.
          Герой — кадр владельца «Sklep 24h» (раньше миниатюра входа в миссии на экране квестов): Бобек слева, текст — на небе справа. */}
      <TopStats compact />
      <div className="flex items-end justify-between gap-3 px-4 pb-2.5 pt-1">
        <h1 className="screen-title">{t('life_title')}</h1>
        <span className="life-progress-chip shrink-0" aria-label={t('life_progress', { n: done, total: missions.length })}>
          <Icon name="check" size={14} strokeWidth={3} /> {done}/{missions.length}
        </span>
      </div>
      {/* Кадр без текста поверх: на нём своя вывеска «SKLEP 24h», заголовок над ним (раньше ложился на вывеску). */}
      <div className="life-hero relative mx-4 aspect-[16/8] overflow-hidden rounded-[28px]" style={{ background: 'linear-gradient(180deg,#8ED3F7,#DDF2FF)' }}>
        {lifeArt ? (
          <img src={lifeArt} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: '0% 70%' }} decoding="async" draggable={false} data-quest-art="life" />
        ) : (
          <Scene name="shop-corner" className="absolute inset-0 h-full w-full" />
        )}
      </div>
      <p className="muted mx-4 mt-2.5 text-sm font-semibold leading-snug">{t('life_subtitle')}</p>
      {/* Пропуск місяця: сезонні місії — окремо від загального списку */}
      <div className="mt-3"><PassCard /></div>
      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        {CATS.map((c) => (
          <button key={c.id} onClick={() => { haptic.select(); setCat(c.id); }} className={cx('chip shrink-0 !py-1.5 transition-colors', cat === c.id && 'chip-on')} aria-pressed={cat === c.id}>
            {t(c.key)}
          </button>
        ))}
      </div>
      <div key={cat} className={swipe.enter}>
      <div className="mt-3 grid gap-3 px-4">
        {list.map((m) => <MissionCard key={m.slug} m={m} onOpen={() => nav(missionHref(m))} />)}
      </div>
      {cat === 'all' && soon.length > 0 && (
        <section className="mt-6 px-4">
          <h2 className="mb-2 text-lg font-black">{t('life_soon')}</h2>
          <div className="grid grid-cols-2 gap-3">
            {soon.map((s) => (
              <div key={s.slug} className="card overflow-hidden" aria-disabled>
                <Scene name={s.scene} className="block h-20 w-full" dim />
                <div className="flex items-center gap-1.5 p-2.5 text-sm font-black leading-tight">
                  <Icon name="lock" size={16} className="shrink-0 opacity-60" /> <span className="opacity-70">{tr(s.title)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      </div>
      <p className="muted mx-4 mt-6 rounded-2xl bg-muted p-3 text-xs font-semibold leading-snug">{t('life_disclaimer')}</p>
    </div>
  );
}
