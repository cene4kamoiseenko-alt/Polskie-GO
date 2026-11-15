/**
 * «Лига» в админке (владелец 2026-11-16: «закончилась неделя — проверь, начислились ли злотувки»).
 * Текущая неделя: кто сейчас в призах и сколько получит, если неделя кончится сейчас. Прошедшие недели: подведена ли
 * (раз в 15 минут в ночь на понедельник по Варшаве), призёры, приз зачислен в кошелёк ✓, поздравление бота (с 9:00 по времени
 * игрока), видел ли игрок окно награды в игре. Данные — GET /api/admin/league (services/league.ts).
 */
import { Link } from 'react-router-dom';
import { api } from './api';
import { Badge, Card, Kpi, LoadError, PageHeader, Skeleton, fmt, useLoad } from './ui';

type Award = { rank: number; userId: string; name: string; username: string | null; xp: number; zlotki: number; credited: boolean; notifiedAt: number | null; seenAt: number | null };
type Report = {
  now: number;
  rules: { minXp: number; prizeMinXp: number; prizes: number[] };
  current: { week: string; endsAt: number; rows: { rank: number; userId: string; name: string; username: string | null; xp: number; prize: number }[] };
  previous: { week: string; settled: boolean };
  weeks: { week: string; settledAt: number; players: number; awards: Award[] }[];
};

const stamp = (ms: number) => new Date(ms).toLocaleString('ru-RU', { timeZone: 'Europe/Warsaw', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
const medal = (rank: number) => (rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}`);
function left(ms: number) {
  const m = Math.max(0, Math.round(ms / 60_000));
  const d = Math.floor(m / 1440);
  const h = Math.floor((m % 1440) / 60);
  return d ? `${d} дн. ${h} ч` : `${h} ч ${m % 60} мин`;
}

function Player({ id, name, username }: { id: string; name: string; username: string | null }) {
  return (
    <span>
      <Link className="link" to={`/users/${id}`}>
        {name || '—'}
      </Link>
      {username && <span className="ml-1 text-xs text-slate-500">@{username}</span>}
    </span>
  );
}

export function League() {
  const { data: r, error, loading, reload } = useLoad(() => api<Report>('/league'), []);
  const last = r?.weeks[0];
  const paid = last ? last.awards.reduce((s, a) => s + (a.credited ? a.zlotki : 0), 0) : 0;
  return (
    <div className="space-y-5" data-league-admin>
      <PageHeader
        title="Лига"
        subtitle={r ? `Неделя по Варшаве: понедельник 00:00 — воскресенье 23:59. В таблице — от ${r.rules.minXp} XP за неделю, приз — от ${r.rules.prizeMinXp} XP: 1 место ${r.rules.prizes[0]}, 2 — ${r.rules.prizes[1]}, 3 — ${r.rules.prizes[2]}, 4–10 — по ${r.rules.prizes[3]} zł.` : 'Итоги недель и призы'}
        actions={
          <button className="btn-s" onClick={reload}>
            Обновить
          </button>
        }
      />
      {error && <LoadError error={error} retry={reload} />}
      {loading && !r && <Skeleton className="h-40" />}
      {r && (
        <>
          {!r.previous.settled && (
            <p className="day-summary is-off text-sm font-bold text-night" data-league-unsettled>
              Неделя {r.previous.week} ещё не подведена. Итоги подводятся автоматически раз в 15 минут в ночь на понедельник — загляните через 15 минут. Если не появится к утру, значит не работает расписание (Cron) у Worker в Cloudflare.
            </p>
          )}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi label="Прошлая неделя" value={last ? last.week : '—'} icon="🏁" tone="night" hint={last ? `подведена ${stamp(last.settledAt)}` : 'ещё не было итогов'} />
            <Kpi label="Участников" value={last ? fmt(last.players) : '—'} icon="👥" tone="sky" hint={`от ${r.rules.minXp} XP за неделю`} />
            <Kpi label="Призёров" value={last ? fmt(last.awards.length) : '—'} icon="🏆" tone="gold" hint={`от ${r.rules.prizeMinXp} XP`} />
            <Kpi label="Выплачено" value={`${fmt(paid)} zł`} icon="💰" tone="brand" hint="зачислено в кошельки" />
          </div>

          {r.weeks.map((w) => (
            <Card key={w.week} title={`Итоги недели ${w.week}`} subtitle={`подведена ${stamp(w.settledAt)} по Варшаве · участников ${fmt(w.players)}`} bodyClass="p-0" data-league-week={w.week}>
              {w.awards.length ? (
                <div className="overflow-x-auto" tabIndex={0} role="region" aria-label={`Призёры недели ${w.week}`}>
                  <table className="w-full">
                    <thead className="border-b border-line">
                      <tr>
                        {['Место', 'Игрок', 'XP за неделю', 'Приз', 'В кошельке', 'Поздравление в боте', 'Окно в игре'].map((h) => (
                          <th key={h} className="th">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {w.awards.map((a) => (
                        <tr key={a.userId} className="border-b border-line last:border-0">
                          <td className="td text-lg">{medal(a.rank)}</td>
                          <td className="td">
                            <Player id={a.userId} name={a.name} username={a.username} />
                          </td>
                          <td className="td tabular-nums">{fmt(a.xp)}</td>
                          <td className="td font-bold tabular-nums text-night">+{fmt(a.zlotki)} zł</td>
                          <td className="td" data-league-credited={a.credited ? 'yes' : 'no'}>
                            {a.credited ? <Badge tone="green">✓ зачислено</Badge> : <Badge tone="red">✗ нет записи</Badge>}
                          </td>
                          <td className="td text-sm">{a.notifiedAt ? <Badge tone="sky">отправлено {stamp(a.notifiedAt)}</Badge> : <Badge tone="gray">ждёт утра (с 9:00)</Badge>}</td>
                          <td className="td text-sm">{a.seenAt ? <Badge tone="green">видел {stamp(a.seenAt)}</Badge> : <span className="text-slate-500">ещё не заходил</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="p-4 text-sm text-slate-600">Призёров нет: никто из первых десяти не набрал {r.rules.prizeMinXp} XP за неделю.</p>
              )}
            </Card>
          ))}

          <Card title={`Сейчас: неделя ${r.current.week}`} subtitle={`до итогов ${left(r.current.endsAt - r.now)} · если неделя закончится сейчас`} bodyClass="p-0" data-league-current>
            {r.current.rows.length ? (
              <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Текущая таблица недели">
                <table className="w-full">
                  <thead className="border-b border-line">
                    <tr>
                      {['Место', 'Игрок', 'XP за неделю', 'Приз сейчас'].map((h) => (
                        <th key={h} className="th">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {r.current.rows.map((x) => (
                      <tr key={x.userId} className="border-b border-line last:border-0">
                        <td className="td text-lg">{medal(x.rank)}</td>
                        <td className="td">
                          <Player id={x.userId} name={x.name} username={x.username} />
                        </td>
                        <td className="td tabular-nums">{fmt(x.xp)}</td>
                        <td className="td tabular-nums">{x.prize ? <b className="text-night">+{fmt(x.prize)} zł</b> : <span className="text-slate-500">нужно {r.rules.prizeMinXp} XP</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="p-4 text-sm text-slate-600">На этой неделе ещё никто не набрал {r.rules.minXp} XP.</p>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
