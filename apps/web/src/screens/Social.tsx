/**
 * Рейтинг (референси «Ліга» і «Друзі»): подіум трійки лідерів на тлі вечірнього Кракова,
 * моя картка з прогресом до наступної ліги, список гравців ліги; вкладка друзів —
 * запрошення, код, додавання за кодом і порівняння. Лише реальні користувачі.
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from '../lib/motion';
import { useCallback, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGoBack } from '../lib/back';
import { useT, type TKey } from '../i18n';
import { api } from '../lib/api';
import { useMe } from '../lib/queries';
import { haptic, share } from '../lib/telegram';
import { Icon } from '../components/Icon';
import { Beaver } from '../components/Beaver';
import { Art } from '../components/GameArt';
import { CityHero } from '../components/CityHero';
import { UserAvatar } from '../components/Avatars';
import { Progress, Skeleton, cx, useBackButton, useToast } from '../components/ui';
import { rankFor } from './Home';

type Row = { rank: number; userId: string; name: string; photoUrl: string | null; xp: number; level: number; premium?: boolean; isMe: boolean };
type Board = { week: string; league: string; rows: Row[]; me?: { xpTotal: number; next: { league: string; at: number } | null } };
type Friend = { id: string; status: string; incoming: boolean; user: { id: string; name: string; photoUrl: string | null; level: number | null; xp: number | null; streak: number | null; languageLevel: string | null } };

const PLACE = { 1: { ring: '#FFC857', ped: 'linear-gradient(180deg,#8A5A2B,#4A2E14)', h: 86 }, 2: { ring: '#C9D6E6', ped: 'linear-gradient(180deg,#4F5F7A,#2A3448)', h: 64 }, 3: { ring: '#E39A6B', ped: 'linear-gradient(180deg,#7A4630,#3E2216)', h: 52 } } as const;

function RankShield({ rank }: { rank: number }) {
  if (rank === 2 || rank === 3) {
    const [a, b] = rank === 2 ? ['#E8EEF6', '#8C9DB3'] : ['#F2B48A', '#B0612F'];
    return (
      <svg viewBox="0 0 40 44" width="34" height="38" aria-hidden>
        <path d="M20 2 L37 8 V22 C37 32 29 39 20 42 C11 39 3 32 3 22 V8 Z" fill={a} stroke="#0E2240" strokeWidth="2.4" />
        <path d="M20 7 L32 11.5 V22 C32 29 26.5 34 20 36.5 C13.5 34 8 29 8 22 V11.5 Z" fill={b} />
        <text x="20" y="28" textAnchor="middle" fontSize="16" fontWeight="900" fill="#fff" fontFamily="Nunito, system-ui, sans-serif">{rank}</text>
      </svg>
    );
  }
  return <span className="w-[34px] text-center text-[18px] font-black text-mist">{rank || '—'}</span>;
}

function PlayerAvatar({ row, size }: { row: Row; size: number }) {
  const me = useMe().data;
  if (row.isMe && !row.photoUrl) {
    return (
      <span className="inline-grid shrink-0 place-items-end overflow-hidden rounded-full bg-gradient-to-b from-dawn-sky to-dawn-sand" style={{ width: size, height: size, boxShadow: '0 0 0 3px #FFC857' }}>
        <Beaver size={size * 0.95} animate={false} />
      </span>
    );
  }
  return <UserAvatar url={row.photoUrl} seed={row.userId} size={size} ring={row.isMe ? '#FFC857' : '#36B9FF'} />;
}

function Podium({ rows }: { rows: Row[] }) {
  const me = useMe().data;
  const order = [2, 1, 3];
  return (
    <div className="hero-card relative mx-4 h-[268px]">
      <CityHero slug="krakow" color="#F2994A" name="" sign={false} evening skyline height={268} className="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-night/45 via-night/15 to-night/90" />
      {/* вечірні вогні міста й прожектор над першим місцем */}
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(38% 46% at 50% 58%, rgba(255,200,87,0.42), transparent 70%)' }} />
      {[[14, 38], [24, 54], [70, 30], [82, 50], [60, 44], [36, 26], [90, 36]].map(([x, y], i) => (
        <span key={i} className="pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-[#FFD983] shadow-[0_0_8px_3px_rgba(255,200,87,0.55)]" style={{ left: `${x}%`, top: `${y}%`, opacity: 0.75 }} />
      ))}
      {/* прапори з короною */}
      {[0, 1].map((i) => (
        <svg key={i} viewBox="0 0 40 90" className={cx('absolute top-3 w-9', i ? 'right-3' : 'left-3')} aria-hidden>
          <rect x="18" y="0" width="4" height="10" fill="#C9A24A" />
          <path d="M4 10 H36 V78 L20 66 L4 78 Z" fill={i ? '#7A2440' : '#2A3E7A'} stroke="#C9A24A" strokeWidth="2" />
          <path d="M12 34 l4 6 4 -9 4 9 4 -6 -2 10 h-12 z" fill="#FFC857" />
        </svg>
      ))}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-center gap-1.5 px-6">
        {order.map((place) => {
          const row = rows.find((r) => r.rank === place && r.xp > 0);
          const cfg = PLACE[place as 1 | 2 | 3];
          const big = place === 1;
          return (
            <div key={place} className="flex flex-1 flex-col items-center">
              <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 * place, type: 'spring', stiffness: 220, damping: 16 }} className="relative mb-1 flex flex-col items-center">
                {row ? (
                  row.isMe && !row.photoUrl && big ? (
                    <Beaver size={112} mood="cheer" />
                  ) : (
                    <PlayerAvatar row={row} size={big ? 78 : 60} />
                  )
                ) : (
                  <span className="grid place-items-center rounded-full border-2 border-dashed border-white/40 bg-night/50 text-xl font-black text-white/60" style={{ width: big ? 72 : 56, height: big ? 72 : 56 }}>?</span>
                )}
                {row && <span className="mt-1 max-w-[100px] truncate rounded-full bg-night/75 px-2 py-0.5 text-[11px] font-black text-white">{row.premium ? '👑 ' : ''}{row.isMe ? `★ ${row.name}` : row.name}</span>}
              </motion.div>
              <div className="relative flex w-full items-start justify-center rounded-t-2xl border-x-2 border-t-2 pt-2" style={{ height: cfg.h, background: cfg.ped, borderColor: cfg.ring, boxShadow: big ? '0 0 26px -4px rgba(255,200,87,0.7)' : undefined }}>
                <span className="grid h-9 w-9 place-items-center rounded-full border-2 text-[17px] font-black text-white" style={{ borderColor: cfg.ring, background: 'rgba(0,0,0,0.25)' }}>{place}</span>
                {big && (
                  <svg viewBox="0 0 120 40" className="pointer-events-none absolute -top-5 left-1/2 w-[120%] -translate-x-1/2" aria-hidden>
                    {/* лавровий вінок */}
                    {[0, 1, 2, 3, 4].map((i) => (
                      <g key={i}>
                        <ellipse cx={22 + i * 6} cy={30 - i * 4.2} rx="5" ry="2.4" fill="#FFC857" transform={`rotate(${-40 + i * 8} ${22 + i * 6} ${30 - i * 4.2})`} />
                        <ellipse cx={98 - i * 6} cy={30 - i * 4.2} rx="5" ry="2.4" fill="#FFC857" transform={`rotate(${40 - i * 8} ${98 - i * 6} ${30 - i * 4.2})`} />
                      </g>
                    ))}
                  </svg>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SocialScreen() {
  const { t } = useT();
  const nav = useNavigate();
  const me = useMe().data;
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'friends' ? 'friends' : 'league';
  const qc = useQueryClient();
  const toast = useToast();
  const [code, setCode] = useState('');
  const lb = useQuery({ queryKey: ['lb', tab], queryFn: () => api<Board>(`/leaderboard?scope=${tab}`) });
  const friends = useQuery({ queryKey: ['friends'], queryFn: () => api<{ friends: Friend[]; referralCode: string; inviteLink: string }>('/friends'), enabled: tab === 'friends' });
  useBackButton(useGoBack());

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
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* буфер обміну недоступний у деяких WebView — код усе одно видно на екрані */
    }
    haptic.select();
    toast(t('friends_copied'), '📋');
  };

  const rows = lb.data?.rows ?? [];
  const mine = rows.find((r) => r.isMe);
  const leagueName = lb.data ? t(`league_${lb.data.league}` as TKey) : '';
  const others = rows.filter((r) => r.xp > 0 && !r.isMe);
  const next = lb.data?.me?.next;
  const xpTotal = lb.data?.me?.xpTotal ?? 0;

  const MyCard = ({ gold }: { gold?: boolean }) =>
    mine ? (
      <div className={cx('relative mx-4 overflow-hidden rounded-[24px] border-2 p-3', gold ? 'border-xp' : 'border-sky/40')} style={{ background: gold ? 'linear-gradient(135deg,#3A2A10 0%,#1A2340 55%,#122040 100%)' : 'linear-gradient(135deg,#5A3D9A 0%,#2A4D9A 50%,#163A74 100%)', boxShadow: gold ? '0 0 26px -6px rgba(255,200,87,0.7)' : undefined }}>
        <div className="flex items-center gap-3">
          {gold && <Art name="medal-gold" size={46} label={mine.rank ? String(mine.rank) : '—'} />}
          <PlayerAvatar row={mine} size={58} />
          <div className="min-w-0 flex-1">
            <div className="line-clamp-2 text-[17px] font-black leading-tight text-white">{mine.name} <span className="text-xp">({t('lb_you')})</span></div>
            <div className="text-[13px] font-bold text-mist">{t('lb_level_n', { n: mine.level })} · <span className="text-sky">{rankFor(mine.level)}</span></div>
          </div>
          <div className="text-right text-[18px] font-black text-white">{mine.xp} XP</div>
        </div>
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
          <Art name="shield" size={34} label="★" />
        </div>
      </div>
    ) : null;

  return (
    <div className="space-y-4 pb-8">
      {/* Заголовок і вкладки */}
      <div className="safe-top flex items-start gap-2 px-4 pt-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-[30px] font-black leading-none">{t('lb_title')}</h1>
          <div className="mt-1 flex items-center gap-1.5 text-[13px] font-bold text-[var(--text-muted)]">
            <Art name="medal-bronze" size={18} /> <span className="leading-tight">{leagueName}{lb.data ? ` · ${t('lb_week_n', { n: Number(lb.data.week.split('W')[1] ?? 0) || lb.data.week })}` : ''}</span>
          </div>
        </div>
        <div className="flex shrink-0 rounded-full border border-[var(--border)] bg-elev p-1">
          {(['league', 'friends'] as const).map((k) => (
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

      {tab === 'league' ? (
        lb.isLoading ? (
          <div className="space-y-3 px-4"><Skeleton className="h-64" /><Skeleton className="h-28" /></div>
        ) : (
          <>
            <Podium rows={rows} />
            <MyCard gold />
            <section className="px-4">
              <h2 className="mb-2 text-lg font-black">{t('lb_top')}</h2>
              {others.length === 0 ? (
                <div className="stat-card !block p-4 text-center text-sm font-bold text-[var(--text-muted)]">{t('lb_alone')}</div>
              ) : (
                <div className="space-y-2">
                  {others.map((r, i) => (
                    <motion.div key={r.userId} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i, 8) * 0.04 }} className={cx('lb-row relative flex items-center gap-2.5 overflow-hidden px-3 py-2', r.rank === 3 && 'is-bronze', r.rank === 2 && 'is-silver')}>
                      <svg viewBox="0 0 160 40" className="pointer-events-none absolute bottom-0 right-0 h-full w-40 opacity-25" aria-hidden><path d="M0 40 V30 h14 V18 l6 -8 l6 8 v12 h12 V8 l5 -8 l5 8 v22 h16 v-12 h14 v12 h20 V14 l6 -6 l6 6 v16 h12 V40 Z" fill="#7FA8D8" /></svg>
                      <RankShield rank={r.rank} />
                      <UserAvatar url={r.photoUrl} seed={r.userId} size={44} ring={r.rank === 2 ? '#C9D6E6' : r.rank === 3 ? '#E39A6B' : '#36B9FF'} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1 truncate text-[15px] font-black text-white">
                          <span className="truncate">{r.name}</span>
                          {r.premium && <Icon name="crown" size={15} filled className="shrink-0 text-xp" aria-label="Premium" />}
                        </div>
                        <div className="text-[12px] font-bold text-sky">{t('lb_level_n', { n: r.level })}</div>
                      </div>
                      <span className="relative text-[16px] font-black text-white">{r.xp} XP</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
            <button onClick={() => nav('/learn')} className="stat-card mx-4 w-[calc(100%-2rem)] !gap-3 !p-3">
              <Art name="trophy" size={40} />
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
                <Beaver size={86} mood="wave" />
              </div>
              <button className="btn btn-sky w-full text-[17px]" onClick={() => share(friends.data!.inviteLink, t('friends_invite_text'))}>
                <Art name="plane" size={22} /> {t('friends_invite')}
              </button>
              <div className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-night/60 px-3 py-2">
                <span className="text-[14px] font-bold text-mist">{t('friends_code')}:</span>
                <button onClick={() => copy(friends.data!.referralCode)} className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-elev px-3 py-1.5 font-mono text-[17px] font-black tracking-wider text-white">
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
                </div>
              ))}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
