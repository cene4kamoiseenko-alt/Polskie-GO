import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import type { I18n } from '@polski-go/shared';
import { useT } from '../i18n';
import { useMe, useQuests, useRefreshAll } from '../lib/queries';
import { houseQuery, houseRoom, stateScene } from '../lib/house';
import { missionsQuery } from './MissionCard';
import { SeasonCover } from './MissionScene';
import { Art } from './GameArt';
import { todayBanner } from '../lib/premiumBanner';
import { ApiError, api } from '../lib/api';
import { haptic } from '../lib/telegram';
import { sfx } from '../lib/audio';
import { AnimatePresence, motion, useReducedMotion } from '../lib/motion';
import { RewardModal, type Reward } from './game';
import { useToast } from './ui';

type Receipt = { xp?: number; zlotki?: number; granted?: number; loyaltyBonus?: number; item?: { name: I18n } | null };

/** One server-backed invitation. Claims use the existing idempotent reward endpoints. */
export function HomeEvent() {
  const { t, tr } = useT();
  const nav = useNavigate();
  const me = useMe().data!;
  const house = useQuery(houseQuery);
  const quests = useQuests();
  const missions = useQuery(missionsQuery);
  const refresh = useRefreshAll();
  const toast = useToast();
  const reduced = useReducedMotion();
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [claimedKind, setClaimedKind] = useState<string | null>(null);
  const [reward, setReward] = useState<Reward | null>(null);
  const season = missions.data?.pass.current;
  const st = house.data;
  const home = st?.home ?? me.outfit.home;
  const room = houseRoom(home, stateScene(home, st));
  const gift = me.premium.active && me.premium.giftReady;
  const chest = quests.data?.chest;
  const chestReady = !!chest?.ready && !chest.claimed;
  const bonusReady = !!st?.goalDone && !st.claimed;
  const kind = gift ? 'gift' : chestReady ? 'chest' : bonusReady ? 'bonus' : season ? 'season' : 'house';
  const claimable = kind === 'gift' || kind === 'chest' || kind === 'bonus';
  const path = kind === 'gift' ? '/premium' : kind === 'chest' ? '/quests' : kind === 'season' ? '/pass' : '/house';
  const title = gift ? t('home_gift_ready') : chestReady ? t('home_big_reward') : bonusReady ? t('house_bonus_ready_d', { n: st!.bonus }) : season ? tr(season.title) : t('compact_visit_bobek');
  const subtitle = claimable ? t('compact_reward_ready') : kind === 'season' ? t('compact_season_invite') : t('compact_house_invite');
  const banner = gift ? todayBanner() : null;
  useEffect(() => setClaimedKind(null), [kind]);

  const act = async () => {
    if (!claimable) { haptic.tap(); nav(path); return; }
    if (lock.current || claimedKind === kind) return;
    lock.current = true;
    setBusy(true);
    try {
      const endpoint = kind === 'bonus' ? '/house/bonus' : kind === 'chest' ? '/quests/daily-chest/claim' : '/premium/gift';
      const receipt = await api<Receipt>(endpoint, { method: 'POST', body: {} });
      setClaimedKind(kind);
      setReward({
        title: t(kind === 'bonus' ? 'house_bonus_t' : kind === 'chest' ? 'home_big_reward' : 'prem_gift_title'),
        xp: receipt.xp ?? 0,
        zlotki: (receipt.granted ?? receipt.zlotki ?? 0) + (receipt.loyaltyBonus ?? 0),
        extra: receipt.item ? [{ icon: 'gift', text: tr(receipt.item.name) }] : undefined,
      });
      haptic.success();
      sfx.coin();
      // A refresh failure must not turn a successful grant into a failed receipt.
      await refresh().catch(() => undefined);
    } catch (error) {
      if (error instanceof ApiError && error.code === 'already_claimed') {
        setClaimedKind(kind);
        toast(t('home_claimed'));
      } else toast(t('toast_error', { msg: (error as Error).message }));
      await refresh().catch(() => undefined);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };

  return <>
    <section className="mx-4" data-home-event={kind}>
      <div className="compact-section-heading"><h2>{t('compact_at_bobeks')}</h2><button type="button" onClick={() => nav('/world')}>{t('nav_world')} <span aria-hidden="true">→</span></button></div>
      <AnimatePresence initial={false} mode="wait">
        <motion.article key={kind} className="home-event-card" initial={reduced ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={reduced ? undefined : { opacity: 0, y: -4 }} transition={{ duration: reduced ? 0 : .18 }}>
          <button type="button" className="home-event-image" aria-label={title} onClick={() => nav(path)}>
            {kind === 'season' && season ? <SeasonCover season={season} className="absolute inset-0 h-full w-full" /> : banner ? <img src={banner.src} srcSet={banner.srcSet} alt="" /> : room ? <img src={room.src} srcSet={room.srcSet} sizes="150px" alt="" /> : <Art name="house" size={90} />}
            {claimable && <span className="home-event-ready"><Art name={kind === 'bonus' ? 'coin' : 'gift'} size={26} /></span>}
          </button>
          <div className="home-event-copy"><span className="home-event-kicker">{t(kind === 'season' ? 'pass_title' : kind === 'house' || kind === 'bonus' ? 'house_title' : 'compact_ready')}</span><button type="button" className="home-event-title" onClick={() => nav(path)}>{title}</button><span>{subtitle}</span>
            <button type="button" className="home-event-action" data-home-claim={claimable ? kind : undefined} aria-busy={busy} disabled={busy || claimedKind === kind} onClick={() => void act()}>{t(busy ? 'loading' : claimedKind === kind ? 'home_claimed' : claimable ? 'home_claim' : 'compact_open')} <span aria-hidden="true">{claimable ? '✓' : '→'}</span></button>
          </div>
        </motion.article>
      </AnimatePresence>
    </section>
    <RewardModal reward={reward} onClose={() => setReward(null)} />
  </>;
}
