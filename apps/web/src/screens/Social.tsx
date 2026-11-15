/**
 * Рейтинг (референси «Ліга» і «Друзі»): подіум трійки лідерів на тлі вечірнього Кракова,
 * моя картка з прогресом до наступної ліги, список гравців ліги; вкладка друзів —
 * запрошення, код, додавання за кодом і порівняння. Лише реальні користувачі.
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from '../lib/motion';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGoBack } from '../lib/back';
import { useT, type TKey } from '../i18n';
import { api } from '../lib/api';
import { useMe } from '../lib/queries';
import { haptic, share } from '../lib/telegram';
import { copyText } from '../lib/clipboard';
import { useTabSwipe } from '../lib/swipe';
import { Icon } from '../components/Icon';
import { Beaver } from '../components/Beaver';
import { Art } from '../components/GameArt';
import { CityHero } from '../components/CityHero';
import { UserAvatar } from '../components/Avatars';
import { ReportButton, ReportDialog, type ReportTarget } from '../components/ReportPlayer';
import { Progress, Skeleton, cx, useBackButton, useToast } from '../components/ui';
import { rankFor } from './Home';
import { leagueArt } from '../lib/assets';

type Row = { rank: number; userId: string; name: string; photoUrl: string | null; xp: number; level: number; premium?: boolean; isMe: boolean; league?: string; prize?: number };
type Board = {
  week: string; endsAt?: string; league: string; minXp?: number; prizeMinXp?: number; prizes?: number[]; rows: Row[];
  me?: { xpTotal: number; weekXp?: number; rank?: number; toJoin?: number; toPodium?: number; next: { league: string; at: number } | null };
  lastWeek?: { rank: number; xp: number; zlotki: number; name: string; photoUrl: string | null; isMe: boolean }[];
};
const LEAGUE_COLOR: Record<string, string> = { bronze: '#E39A6B', silver: '#C9D6E6', gold: '#FFC857', diamond: '#7FE3FF' };
type Friend = { id: string; status: string; incoming: boolean; user: { id: string; name: string; photoUrl: string | null; level: number | null; xp: number | null; streak: number | null; languageLevel: string | null } };


/** Место: медали владельца 1–3 (растр, assets/league), дальше — номер в кружке. */
function RankMedal({ rank, size = 36 }: { rank: number; size?: number }) {
  const src = rank >= 1 && rank <= 3 ? leagueArt(`medal-${rank}`) : null;
  if (src) return <img src={src} alt={`#${rank}`} width={size} height={size} className="shrink-0 object-contain drop-shadow-[0_2px_3px_rgb(0_0_0/0.35)]" draggable={false} />;
  return <span className="league-rank-num shrink-0" style={{ width: size, height: size, fontSize: Math.round(size * 0.44) }}>{rank || '—'}</span>;
}

function PlayerAvatar({ row, size, ring }: { row: Row; size: number; ring?: string }) {
  const me = useMe().data;
  if (row.isMe && !row.photoUrl) {
    return (
      <span className="inline-grid shrink-0 place-items-end overflow-hidden rounded-full bg-gradient-to-b from-dawn-sky to-dawn-sand" style={{ width: size, height: size, boxShadow: '0 0 0 3px #FFC857' }}>
        <Beaver size={size * 0.95} animate={false} />
      </span>
    );
  }
  return <UserAvatar url={row.photoUrl} seed={row.userId} size={size} ring={ring ?? (row.isMe ? '#FFC857' : '#36B9FF')} />;
}

/** Подиум недели: вечерний Краков, три пьедестала владельца (золото выше), медаль места в медальоне, корона над аватаром. */
const STEP = { 1: { ring: '#FFC857', avatar: 70, width: '37%' }, 2: { ring: '#C9D6E6', avatar: 54, width: '31.5%' }, 3: { ring: '#E39A6B', avatar: 54, width: '31.5%' } } as const;
function Podium({ rows }: { rows: Row[] }) {
  return (
    <div className="hero-card league-podium relative mx-4 h-[292px]" data-lb-podium>
      <CityHero slug="krakow" color="#F2994A" name="" sign={false} evening skyline height={292} className="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-night/35 via-night/10 to-night/85" />
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(42% 50% at 50% 62%, rgba(255,200,87,0.38), transparent 70%)' }} />
      <div className="absolute inset-x-2 bottom-2.5 flex items-end justify-center">
        {([2, 1, 3] as const).map((place) => {
          const row = rows.find((r) => r.rank === place && r.xp > 0);
          const cfg = STEP[place];
          const crown = leagueArt(`crown-${place}`);
          const pedestal = leagueArt(`pedestal-${place}`);
          const medal = leagueArt(`medal-${place}`);
          return (
            <div key={place} className={cx('league-step relative flex flex-col items-center', place === 1 && 'z-[1] -mx-1')} style={{ width: cfg.width }}>
              <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.08 * place, type: 'spring', stiffness: 220, damping: 17 }} className="relative mb-[-6px] flex flex-col items-center">
                {crown && <img src={crown} alt="" className="league-crown" style={{ width: cfg.avatar * (place === 1 ? 0.72 : 0.66) }} draggable={false} />}
                {row ? (
                  <PlayerAvatar row={row} size={cfg.avatar} ring={cfg.ring} />
                ) : (
                  <span className="grid place-items-center rounded-full border-2 border-dashed border-white/45 bg-night/55 text-xl font-black text-white/60" style={{ width: cfg.avatar, height: cfg.avatar }}>?</span>
                )}
                {row && (
                  <span className="league-name mt-1 max-w-full truncate" style={{ borderColor: cfg.ring }}>
                    {row.isMe ? `★ ${row.name}` : row.name}
                  </span>
                )}
              </motion.div>
              <div className="relative w-full">
                {pedestal && <img src={pedestal} alt="" className="block w-full drop-shadow-[0_8px_10px_rgb(0_0_0/0.45)]" draggable={false} />}
                {medal && <img src={medal} alt={`#${place}`} className="absolute left-1/2 top-[53%] w-[27%] -translate-x-1/2 -translate-y-1/2" draggable={false} />}
              </div>
              {row && !!row.prize && <span className="league-prize-chip mt-1">+{row.prize} zł</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** До конца недели: «2 д 5 ч» или «5 ч 12 мин»; обновляется раз в 30 секунд. */
function useWeekLeft(endsAt?: string) {
  const { t } = useT();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(i);
  }, []);
  if (!endsAt) return '';
  const ms = Math.max(0, new Date(endsAt).getTime() - now);
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  return d > 0 ? t('time_dh', { d, h }) : t('time_hm', { h, m: Math.floor((ms % 3_600_000) / 60_000) });
}

/** Призы недели: 1–3 места медалями, 4–10 — одной плашкой; условие начисления — мелкой строкой. */
function PrizeStrip({ board }: { board: Board }) {
  const { t } = useT();
  const prizes = board.prizes ?? [];
  if (!prizes.length) return null;
  return (
    <div className="lb-prizes relative mx-4 overflow-hidden" data-lb-prizes>
      <div className="flex items-center gap-3">
        {leagueArt('bobek-trophy') && <img src={leagueArt('bobek-trophy')!} alt="" className="-mb-3 -mt-1 w-[64px] shrink-0 drop-shadow-[0_6px_8px_rgb(0_0_0/0.35)]" draggable={false} />}
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-black uppercase tracking-[0.06em] text-[var(--text-muted)]">{t('lb_prizes_title')}</div>
          <p className="mt-0.5 text-[12px] font-bold leading-snug text-[var(--text-muted)]">{t('lb_prize_note', { xp: board.prizeMinXp ?? 100 })}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-1.5">
        {[1, 2, 3].map((place) => (
          <div key={place} className="lb-prize">
            <RankMedal rank={place} size={34} />
            <span className="text-[14px] font-black tabular-nums">+{prizes[place - 1]}</span>
            <span className="text-[10px] font-black text-[var(--text-muted)]">zł</span>
          </div>
        ))}
        <div className="lb-prize">
          {leagueArt('trophy-small') && <img src={leagueArt('trophy-small')!} alt="" width={32} height={30} className="object-contain" draggable={false} />}
          <span className="text-[10.5px] font-black leading-tight text-[var(--text-muted)]">{t('lb_prize_rest')}</span>
          <span className="text-[14px] font-black tabular-nums">+{prizes[3]}</span>
          <span className="text-[10px] font-black text-[var(--text-muted)]">zł</span>
        </div>
      </div>
    </div>
  );
}

/** Победители прошлой недели: соцдоказательство, что призы настоящие. */
function LastWeek({ board }: { board: Board }) {
  const { t } = useT();
  const list = board.lastWeek ?? [];
  if (!list.length) return null;
  return (
    <section className="px-4" data-lb-last-week>
      <h2 className="section-title mb-2">{t('lb_last_week')}</h2>
      <div className="stat-card !block divide-y divide-[var(--hairline)] !p-0">
        {list.map((w) => (
          <div key={w.rank} className="flex items-center gap-2.5 px-3 py-2">
            <RankMedal rank={w.rank} size={28} />
            <UserAvatar url={w.photoUrl} seed={w.name} size={30} />
            <span className={cx('min-w-0 flex-1 truncate text-[14px] font-black', w.isMe && 'text-xp')}>{w.name}</span>
            <span className="shrink-0 text-[12px] font-bold text-[var(--text-muted)]">{w.xp} XP</span>
            <span className="shrink-0 rounded-full bg-xp/20 px-2 py-0.5 text-[12px] font-black text-xp">+{w.zlotki} zł</span>
          </div>
        ))}
      </div>
    </section>
  );
}

const TABS = ['league', 'friends'] as const;

export default function SocialScreen() {
  const { t } = useT();
  const nav = useNavigate();
  const me = useMe().data;
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'friends' ? 'friends' : 'league';
  const qc = useQueryClient();
  const toast = useToast();
  const [code, setCode] = useState('');
  const [reporting, setReporting] = useState<ReportTarget | null>(null);
  const lb = useQuery({ queryKey: ['lb', tab], queryFn: () => api<Board>(`/leaderboard?scope=${tab}`) });
  const friends = useQuery({ queryKey: ['friends'], queryFn: () => api<{ friends: Friend[]; referralCode: string; inviteLink: string }>('/friends'), enabled: tab === 'friends' });
  useBackButton(useGoBack());
  // Свайп по экрану переключает «Лига» ↔ «Друзья» (как вкладки в Квестах и Магазине).
  const swipe = useTabSwipe(TABS, tab, (k) => { haptic.select(); setParams({ tab: k }, { replace: true }); });

  const add = async () => {
    try {
      await api('/friends', { body: { code: code.trim() } });
      haptic.success();
      toast(t('friends_sent'), '🤝');
      setCode('');
      qc.invalidateQueries({ queryKey: ['friends'] });
    } catch (e) {
      toast(t('toast_error', { msg: (e as Error).message }), '⚠️');
    }
  };
  const respond = async (id: string, accept: boolean) => {
    await api(`/friends/${id}/respond`, { body: { accept } });
    qc.invalidateQueries({ queryKey: ['friends'] });
    qc.invalidateQueries({ queryKey: ['lb'] });
  };
  const copy = async (text: string) => {
    // Запасной путь для WebView без navigator.clipboard (lib/clipboard); тост «скопировано» — только если запись удалась.
    const ok = await copyText(text);
    haptic[ok ? 'success' : 'error']();
    toast(ok ? t('friends_copied') : `${t('friends_code')}: ${text}`, ok ? '📋' : '⚠️');
  };

  const rows = lb.data?.rows ?? [];
  const mine = rows.find((r) => r.isMe);
  const leagueName = lb.data ? t(`league_${lb.data.league}` as TKey) : '';
  const others = rows.filter((r) => r.xp > 0 && !r.isMe);
  const next = lb.data?.me?.next;
  const xpTotal = lb.data?.me?.xpTotal ?? 0;
  const weekLeft = useWeekLeft(lb.data?.endsAt);
  const myRank = lb.data?.me?.rank ?? mine?.rank ?? 0;
  const myPrize = mine?.prize ?? 0;
  const prizeMin = lb.data?.prizeMinXp ?? 100;
  // Что сейчас важнее всего игроку: попасть в таблицу, приз за текущее место или сколько до 3-го места.
  const weekLine = !lb.data?.me ? '' : myRank === 0
    ? t('lb_to_join', { xp: lb.data.me.toJoin ?? 0 })
    : myPrize > 0
      ? `${t('lb_in_prizes', { zl: myPrize })}${myRank > 3 && lb.data.me.toPodium ? ` · ${t('lb_to_podium', { xp: lb.data.me.toPodium })}` : ''}`
      : (mine?.xp ?? 0) < prizeMin
        ? t('lb_need_prize_min', { xp: prizeMin })
        : t('lb_to_podium', { xp: lb.data.me.toPodium ?? 0 });

  const MyCard = ({ gold }: { gold?: boolean }) =>
    mine ? (
      <div className={cx('relative mx-4 overflow-hidden rounded-[24px] border-2 p-3', gold ? 'border-xp' : 'border-sky/40')} style={{ background: gold ? 'linear-gradient(135deg,#3A2A10 0%,#1A2340 55%,#122040 100%)' : 'linear-gradient(135deg,#5A3D9A 0%,#2A4D9A 50%,#163A74 100%)', boxShadow: gold ? '0 0 26px -6px rgba(255,200,87,0.7)' : undefined }}>
        <div className="flex items-center gap-3">
          {gold && <RankMedal rank={mine.rank} size={44} />}
          <PlayerAvatar row={mine} size={58} />
          <div className="min-w-0 flex-1">
            <div className="line-clamp-2 text-[17px] font-black leading-tight text-white">{mine.name} <span className="text-xp">({t('lb_you')})</span></div>
            <div className="text-[13px] font-bold text-mist">{t('lb_level_n', { n: mine.level })} · <span className="text-sky">{rankFor(mine.level)}</span></div>
          </div>
          <div className="text-right text-[18px] font-black text-white">{mine.xp} XP{gold && myPrize > 0 && <div className="text-[12px] font-black text-xp">+{myPrize} zł</div>}</div>
        </div>
        {gold && weekLine && (
          <div className="mt-2.5 flex items-center gap-2 rounded-2xl bg-xp/15 px-3 py-2" data-lb-week-status>
            {leagueArt('trophy-small') ? <img src={leagueArt('trophy-small')!} alt="" width={30} height={28} className="shrink-0 object-contain" draggable={false} /> : <Art name="trophy" size={30} />}
            <span className="min-w-0 flex-1 text-[13px] font-black leading-snug text-white">{weekLine}</span>
            {myRank === 0 && (
              <button onClick={() => { haptic.tap(); nav('/learn'); }} className="btn btn-red min-h-0 shrink-0 px-3 py-1.5 text-[12.5px]">{t('lb_play')}</button>
            )}
          </div>
        )}
        <div className="mt-2.5 flex items-center gap-2 rounded-2xl bg-night/55 px-3 py-2">
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-black text-mist">{next ? t('lb_to_next', { league: t(`league_${next.league}` as TKey) }) : t('lb_max_league')}</div>
            {next && (
              <div className="mt-1 flex items-center gap-2">
                <Progress value={xpTotal} max={next.at} height={9} color="linear-gradient(90deg,#FFC857,#FFE38A)" />
                <span className="shrink-0 text-[11px] font-black text-white">{xpTotal} / {next.at}</span>
              </div>
            )}
          </div>
          {leagueArt('shield') ? <img src={leagueArt('shield')!} alt="" width={32} height={34} className="shrink-0 object-contain" draggable={false} /> : <Art name="shield" size={34} label="★" />}
        </div>
      </div>
    ) : null;

  return (
    <div ref={swipe.ref} className="space-y-4 pb-8" data-tab-swipe="social">
      {/* Заголовок і вкладки */}
      <div className="flex items-start gap-2 px-4 pt-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-[28px] font-black leading-none">{tab === 'league' ? t('lb_week_title') : t('lb_title')}</h1>
          <div className="mt-1 flex items-center gap-1.5 text-[13px] font-bold text-[var(--text-muted)]">
            <Icon name="clock" size={15} className="shrink-0" />
            <span className="leading-tight" data-lb-ends>{weekLeft ? t('lb_ends_in', { t: weekLeft }) : leagueName}</span>
          </div>
        </div>
        <div className="flex shrink-0 rounded-full border border-[var(--border)] bg-elev p-1">
          {TABS.map((k) => (
            <button
              key={k}
              onClick={() => { haptic.select(); setParams({ tab: k }, { replace: true }); }}
              className={cx('flex items-center gap-1 rounded-full px-3 py-1.5 text-[13px] font-black transition-colors', tab === k ? (k === 'league' ? 'bg-gradient-to-b from-[#FFD86B] to-[#E39A14] text-[#3A2200] shadow-[0_0_14px_-2px_rgb(255_200_87/0.8)]' : 'bg-gradient-to-b from-[#4FB6FF] to-[#1E6FE0] text-white shadow-[0_0_14px_-2px_rgb(54_185_255/0.8)]') : 'text-[var(--text-muted)]')}
            >
              <Icon name={k === 'league' ? 'trophy' : 'user'} size={15} /> {k === 'league' ? t('lb_league') : t('lb_friends')}
            </button>
          ))}
        </div>
      </div>

      <div key={tab} className={cx('space-y-4', swipe.enter)}>
      {tab === 'league' ? (
        lb.isLoading ? (
          <div className="space-y-3 px-4"><Skeleton className="h-64" /><Skeleton className="h-28" /></div>
        ) : (
          <>
            <Podium rows={rows} />
            <MyCard gold />
            {lb.data && <PrizeStrip board={lb.data} />}
            <section className="px-4">
              <h2 className="mb-2 text-lg font-black">{t('lb_top')}</h2>
              {others.length === 0 ? (
                <div className="stat-card !block p-4 text-center text-sm font-bold text-[var(--text-muted)]">{t('lb_alone')}</div>
              ) : (
                <div className="space-y-2">
                  {others.map((r, i) => (
                    <motion.div key={r.userId} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i, 8) * 0.04 }} className={cx('lb-row relative flex items-center gap-2.5 overflow-hidden px-3 py-2', r.rank === 1 && 'is-gold', r.rank === 3 && 'is-bronze', r.rank === 2 && 'is-silver')}>
                      <RankMedal rank={r.rank} size={38} />
                      <UserAvatar url={r.photoUrl} seed={r.userId} size={44} ring={r.rank === 1 ? '#FFC857' : r.rank === 2 ? '#C9D6E6' : r.rank === 3 ? '#E39A6B' : '#36B9FF'} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1 truncate text-[15px] font-black text-white">
                          <span className="truncate">{r.name}</span>
                          {r.premium && <Icon name="crown" size={15} filled className="shrink-0 text-xp" aria-label="Premium" />}
                        </div>
                        <div className="flex min-w-0 items-center gap-1.5 whitespace-nowrap text-[12px] font-bold text-sky">
                          {r.league && <span className="lb-league-chip shrink-0" style={{ '--chip': LEAGUE_COLOR[r.league] ?? '#36B9FF' } as React.CSSProperties}>{t(`league_short_${r.league}` as TKey)}</span>}
                          <span className="truncate">{t('lb_level_short', { n: r.level })}</span>
                        </div>
                      </div>
                      <span className="relative flex flex-col items-end leading-tight">
                        <span className="text-[16px] font-black text-white">{r.xp} XP</span>
                        {!!r.prize && <span className="text-[11.5px] font-black text-xp">+{r.prize} zł</span>}
                      </span>
                      <ReportButton target={{ id: r.userId, name: r.name }} onOpen={setReporting} />
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
            {lb.data && <LastWeek board={lb.data} />}
            <button onClick={() => nav('/learn')} className="stat-card mx-4 w-[calc(100%-2rem)] !gap-3 !p-3">
              {leagueArt('trophy-small') ? <img src={leagueArt('trophy-small')!} alt="" width={40} height={37} className="shrink-0 object-contain" draggable={false} /> : <Art name="trophy" size={40} />}
              <span className="flex-1 text-left text-[13px] font-bold leading-snug text-mist">{t('lb_footer')}</span>
              <Icon name="chevron-right" size={18} className="text-[var(--text-muted)]" />
            </button>
          </>
        )
      ) : (
        <>
          <MyCard />
          {friends.data ? (
            <div className="mx-4 space-y-3 rounded-[24px] border border-sky/30 bg-gradient-to-b from-[#13305a] to-[#0d2342] p-4 shadow-[var(--shadow-deep)]">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[22px] font-black text-white"><Art name="plane" size={28} /> {t('friends_invite')}</div>
                  <p className="mt-1 text-[14px] font-bold leading-snug text-mist">{t('friends_invite_desc')}</p>
                </div>
                {leagueArt('bobek-phone') ? <img src={leagueArt('bobek-phone')!} alt="" className="-mb-2 -mr-2 -mt-2 w-[104px] shrink-0 drop-shadow-[0_8px_10px_rgb(0_0_0/0.4)]" draggable={false} /> : <Beaver size={86} mood="wave" />}
              </div>
              <ul className="space-y-1.5" data-invite-features>
                {([['icon-book', 'invite_f_lessons'], ['icon-location', 'invite_f_quests'], ['trophy-small', 'invite_f_rewards']] as const).map(([icon, key]) => (
                  <li key={key} className="invite-feature">
                    {leagueArt(icon) && <img src={leagueArt(icon)!} alt="" width={30} height={30} className="shrink-0 object-contain" draggable={false} />}
                    <span>{t(key)}</span>
                    {leagueArt('icon-check') && <img src={leagueArt('icon-check')!} alt="" width={18} height={18} className="ml-auto shrink-0 object-contain" draggable={false} />}
                  </li>
                ))}
              </ul>
              <button className="btn btn-sky w-full text-[17px]" onClick={() => share(friends.data!.inviteLink, t('friends_invite_text'))}>
                <Art name="plane" size={22} /> {t('friends_invite')}
              </button>
              <div className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-night/60 px-3 py-2">
                <span className="text-[14px] font-bold text-mist">{t('friends_code')}:</span>
                <button onClick={() => copy(friends.data!.referralCode)} className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-night/60 px-3 py-1.5 font-mono text-[17px] font-black tracking-wider text-white">
                  {friends.data.referralCode}
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" /></svg>
                </button>
              </div>
              <div className="flex gap-2">
                <input value={code} onChange={(e) => setCode(e.target.value)} placeholder={t('friends_add_ph')} className="min-w-0 flex-1 rounded-2xl border border-[var(--border)] bg-night/60 px-3 py-3 font-bold text-white outline-none placeholder:text-[var(--text-muted)] focus:border-sky" />
                <button className="btn btn-green min-h-[48px] shrink-0 px-3 text-[14px]" disabled={code.trim().length < 4} onClick={add}>
                  + {t('friends_add')}
                </button>
              </div>
            </div>
          ) : (
            <Skeleton className="mx-4 h-56" />
          )}
          {friends.data && friends.data.friends.length === 0 ? (
            <div className="hero-card relative mx-4 h-[260px]">
              <CityHero slug="krakow" color="#F2994A" name="" sign={false} evening height={260} className="absolute inset-0" />
              <div className="absolute inset-0 bg-gradient-to-b from-night/40 to-night/90" />
              <div className="absolute inset-x-0 top-6 flex justify-center">
                <div className="relative">
                  <Beaver size={130} mood="think" />
                  <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2.4 }} className="absolute -right-12 -top-2 grid h-14 w-16 place-items-center rounded-[50%] bg-white ink-sky shadow-lg">
                    <Icon name="user" size={22} /><span className="absolute -bottom-2 left-2 h-3 w-3 rounded-full bg-white" />
                  </motion.span>
                </div>
              </div>
              <div className="absolute inset-x-4 bottom-4 text-center">
                <div className="text-[19px] font-black text-white">{t('friends_empty_title')}</div>
                <div className="text-[14px] font-bold text-mist">{t('friends_empty_text')}</div>
              </div>
            </div>
          ) : friends.data ? (
            <div className="space-y-2 px-4">
              {friends.data.friends.map((f) => (
                <div key={f.id} className="lb-row flex items-center gap-2.5 px-3 py-2.5">
                  <UserAvatar url={f.user.photoUrl} seed={f.user.id} size={44} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[15px] font-black text-white">{f.user.name}</div>
                    <div className="text-[12px] font-bold text-mist">
                      {f.user.level !== null ? <>{t('lb_level_n', { n: f.user.level })} · <Art name="flame" size={14} className="inline-block align-[-2px]" /> {f.user.streak} · {f.user.languageLevel}</> : t('friends_hidden')}
                    </div>
                  </div>
                  {f.incoming ? (
                    <div className="flex gap-1">
                      <button className="btn btn-green min-h-0 px-3 py-1.5 text-xs" onClick={() => respond(f.id, true)}>{t('friends_accept')}</button>
                      <button className="btn btn-ghost min-h-0 px-2.5 py-1.5 text-xs" onClick={() => respond(f.id, false)} aria-label={t('friends_decline')}><Icon name="x" size={16} /></button>
                    </div>
                  ) : f.status === 'PENDING' ? (
                    <span className="text-xs font-black text-[var(--text-muted)]">{t('friends_pending')}</span>
                  ) : (
                    <div className="text-right">
                      <div className="text-[15px] font-black text-white">{f.user.xp ?? '—'} XP</div>
                      {f.user.xp !== null && me && <div className="text-[10.5px] font-bold text-[var(--text-muted)]">{f.user.xp >= me.progress.xpTotal ? '+' : '−'}{t('friends_vs', { n: Math.abs(f.user.xp - me.progress.xpTotal) })}</div>}
                    </div>
                  )}
                  <ReportButton target={{ id: f.user.id, name: f.user.name }} onOpen={setReporting} />
                </div>
              ))}
            </div>
          ) : null}
        </>
      )}
      </div>
      <ReportDialog target={reporting} onClose={() => setReporting(null)} />
    </div>
  );
}
