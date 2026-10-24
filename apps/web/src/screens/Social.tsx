import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useT, type TKey } from '../i18n';
import { api } from '../lib/api';
import { share } from '../lib/telegram';
import { Card, EmptyState, ScreenHeader, Skeleton, cx, useToast } from '../components/ui';

type Row = { rank: number; userId: string; name: string; photoUrl: string | null; xp: number; level: number; isMe: boolean };
type Friend = { id: string; status: string; incoming: boolean; user: { id: string; name: string; photoUrl: string | null; level: number | null; xp: number | null; streak: number | null; languageLevel: string | null } };

function Avatar({ url, name }: { url: string | null; name: string }) {
  return url ? <img src={url} alt="" className="h-10 w-10 rounded-full object-cover" /> : <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-light font-black text-brand-dark">{name.slice(0, 1)}</div>;
}

export default function SocialScreen() {
  const { t } = useT();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') ?? 'league';
  const qc = useQueryClient();
  const toast = useToast();
  const [code, setCode] = useState('');
  const lb = useQuery({ queryKey: ['lb', tab], queryFn: () => api<{ week: string; league: string; rows: Row[] }>(`/leaderboard?scope=${tab === 'friends' ? 'friends' : 'league'}`), enabled: tab !== 'invite' });
  const friends = useQuery({ queryKey: ['friends'], queryFn: () => api<{ friends: Friend[]; referralCode: string; inviteLink: string }>('/friends') });

  const add = async () => {
    try {
      await api('/friends', { body: { code: code.trim() } });
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

  return (
    <div className="space-y-4 pb-6">
      <ScreenHeader title={t('lb_title')} subtitle={lb.data ? `${t(`league_${lb.data.league}` as TKey)} · ${lb.data.week}` : undefined} />
      <div className="mx-4 grid grid-cols-2 gap-1 rounded-2xl bg-muted p-1">
        {['league', 'friends'].map((k) => (
          <button key={k} onClick={() => setParams({ tab: k })} className={cx('rounded-xl py-2 font-black', tab === k && 'bg-elev shadow')}>
            {k === 'league' ? `🏆 ${t('lb_league')}` : `👥 ${t('lb_friends')}`}
          </button>
        ))}
      </div>

      <div className="px-4">
        {lb.isLoading ? (
          <Skeleton className="h-64" />
        ) : !lb.data?.rows.some((r) => r.xp > 0) ? (
          <EmptyState text={t('lb_empty')} />
        ) : (
          <Card className="divide-y divide-[var(--border)]">
            {lb.data.rows.map((r) => (
              <div key={r.userId} className={cx('flex items-center gap-3 px-3 py-2.5', r.isMe && 'bg-xp/20')}>
                <span className="w-7 text-center font-black">{r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : r.rank || '—'}</span>
                <Avatar url={r.photoUrl} name={r.name} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-black">{r.isMe ? `${r.name} (${t('lb_you')})` : r.name}</div>
                  <div className="muted text-xs font-bold">{t('level')} {r.level}</div>
                </div>
                <span className="font-black text-xp-dark">{r.xp} XP</span>
              </div>
            ))}
          </Card>
        )}
      </div>

      {tab === 'friends' && friends.data && (
        <div className="space-y-3 px-4">
          <Card className="space-y-3 p-4">
            <div className="font-black">{t('friends_invite')}</div>
            <button className="btn btn-sky w-full" onClick={() => share(friends.data!.inviteLink, t('friends_invite_text'))}>
              📨 {t('friends_invite')}
            </button>
            <div className="text-sm font-bold">
              {t('friends_code')}: <span className="select-all rounded-lg bg-muted px-2 py-1 font-black">{friends.data.referralCode}</span>
            </div>
            <div className="flex gap-2">
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder={t('friends_add_ph')} className="min-w-0 flex-1 rounded-xl border-2 border-soft bg-[var(--bg)] px-3 font-bold outline-none" />
              <button className="btn btn-primary min-h-[44px] px-4" disabled={code.trim().length < 4} onClick={add}>
                {t('friends_add')}
              </button>
            </div>
          </Card>
          {friends.data.friends.length === 0 ? (
            <EmptyState text={t('friends_empty')} />
          ) : (
            <Card className="divide-y divide-[var(--border)]">
              {friends.data.friends.map((f) => (
                <div key={f.id} className="flex items-center gap-3 px-3 py-2.5">
                  <Avatar url={f.user.photoUrl} name={f.user.name} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-black">{f.user.name}</div>
                    <div className="muted text-xs font-bold">
                      {f.user.level !== null ? `${t('level')} ${f.user.level} · 🔥 ${f.user.streak} · ${f.user.languageLevel}` : t('friends_hidden')}
                    </div>
                  </div>
                  {f.incoming ? (
                    <div className="flex gap-1">
                      <button className="btn btn-primary min-h-0 px-3 py-1.5 text-xs" onClick={() => respond(f.id, true)}>{t('friends_accept')}</button>
                      <button className="btn btn-ghost min-h-0 px-3 py-1.5 text-xs" onClick={() => respond(f.id, false)}>✕</button>
                    </div>
                  ) : f.status === 'PENDING' ? (
                    <span className="muted text-xs font-black">{t('friends_pending')}</span>
                  ) : (
                    <span className="font-black text-xp-dark">{f.user.xp ?? '—'} XP</span>
                  )}
                </div>
              ))}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
