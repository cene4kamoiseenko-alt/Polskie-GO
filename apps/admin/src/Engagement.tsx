/**
 * «Вовлечённость» (владелец 2026-11-15: «нужен анализ игроков, их заинтересованность… понятно до деталей»).
 * Кто играет и как часто (сегменты и липкость), насколько глубоко (минуты, уроки), что интересно (разделы), когда играют
 * (часы и дни недели), где отваливаются («лестница» уроков), кто самый вовлечённый и кому стоит написать. Данные —
 * GET /api/admin/engagement (apps/server/src/services/admin-engagement.ts). Каждый блок объясняет, как читать цифры.
 */
import { Link } from 'react-router-dom';
import { api } from './api';
import { Funnel } from './charts';
import { Card, Kpi, LoadError, PageHeader, Skeleton, cx, fmt, shortDay, useLoad } from './ui';

export type Segment = 'core' | 'active' | 'at_risk' | 'sleeping' | 'churned' | 'never';
export type EngagementRow = { score: number; segment: Segment; activeDays14: number; activeDays7: number; lastActiveDay: string | null; features: string[] };

/** Сегменты: подпись, цвет, как понимать. Порядок — от самых вовлечённых. */
export const SEG_META: Record<Segment, { label: string; color: string; hint: string }> = {
  core: { label: 'Ядро', color: '#2fd39a', hint: '4+ дня из последних 7 — играют почти каждый день' },
  active: { label: 'Активные', color: '#38b6ff', hint: '1–3 дня за последние 7' },
  at_risk: { label: 'Под угрозой', color: '#f5b83d', hint: 'последний раз 8–14 дней назад — самое время напомнить' },
  sleeping: { label: 'Засыпают', color: '#ff9a5c', hint: 'последний раз 15–30 дней назад' },
  churned: { label: 'Ушли', color: '#ff5d73', hint: 'больше 30 дней без занятий' },
  never: { label: 'Не начали', color: '#8291b8', hint: 'зарегистрировались, но ни одного занятия' },
};
export const SEG_ORDER: Segment[] = ['core', 'active', 'at_risk', 'sleeping', 'churned', 'never'];

const FEATURE_RU: Record<string, string> = {
  lessons: 'Уроки',
  reviews: 'Повторение слов',
  missions: 'Миссии (диалоги в городе)',
  daily_quiz: 'Вопрос дня в боте',
  bot_quiz: 'Быстрый вопрос в боте',
  league: 'Лига (от 20 XP за неделю)',
  shop: 'Покупки в гардеробе',
  friends: 'Друзья (добавили)',
};
export const FEATURE_SHORT: Record<string, string> = { lessons: 'уроки', missions: 'миссии', daily_quiz: 'вопрос дня', league: 'лига' };
const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

type Report = {
  today: string;
  stickiness: { dau: number; wau: number; mau: number; users: number; dauMau: number; wauMau: number };
  segments: Record<Segment, number>;
  depth: { activeUsers: number; daysPerUser: number; minutesPerDay: number; lessonsPerUser: number; xpPerUser: number };
  features: { key: string; users: number; share: number }[];
  hourly: number[];
  weekly: number[];
  ladder: { base: number; steps: { lessons: number; users: number }[] };
  top: { id: string; name: string; username: string | null; activeDays14: number; xp14: number; streak: number }[];
  atRisk: { id: string; name: string; username: string | null; lastActiveDay: string; activeDaysTotal: number; lessons: number }[];
};

/** Оценка вовлечённости 0–100: кольцо с числом и сегмент. */
export function ScoreBadge({ e }: { e: EngagementRow | null | undefined }) {
  if (!e) return <span className="text-slate-500">—</span>;
  const m = SEG_META[e.segment];
  return (
    <span className="inline-flex items-center gap-2" data-engagement={e.segment}>
      <span className="score-ring grid h-9 w-9 shrink-0 place-items-center rounded-full" style={{ ['--p' as string]: e.score, ['--c' as string]: m.color }} title={`Оценка вовлечённости ${e.score} из 100`}>
        <span className="grid h-7 w-7 place-items-center rounded-full bg-surface text-[11px] font-black text-night">{e.score}</span>
      </span>
      <span className="leading-tight">
        <span className="block text-xs font-bold" style={{ color: m.color }}>
          {m.label}
        </span>
        <span className="block text-[11px] text-slate-500">{e.activeDays7} дн. из 7</span>
      </span>
    </span>
  );
}

function SegmentsCard({ r }: { r: Report }) {
  const total = SEG_ORDER.reduce((s, k) => s + r.segments[k], 0);
  return (
    <Card title="Кто как играет" subtitle="Каждый игрок — ровно в одной группе. Нажмите на группу, чтобы увидеть игроков." data-engagement-segments>
      <div className="seg-bar" role="img" aria-label={SEG_ORDER.map((k) => `${SEG_META[k].label}: ${r.segments[k]}`).join(', ')}>
        {SEG_ORDER.filter((k) => r.segments[k] > 0).map((k) => (
          <span key={k} style={{ width: `${(r.segments[k] * 100) / Math.max(1, total)}%`, background: SEG_META[k].color, boxShadow: `0 0 14px -2px ${SEG_META[k].color}` }} />
        ))}
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {SEG_ORDER.map((k) => (
          <Link key={k} to={`/users?filter=${k}`} className="group rounded-xl border border-line px-3 py-2.5 transition hover:border-slate-300" style={{ background: `linear-gradient(135deg, ${SEG_META[k].color}14, transparent)` }} data-segment-link={k}>
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-sm font-bold text-night">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: SEG_META[k].color, boxShadow: `0 0 10px ${SEG_META[k].color}` }} aria-hidden />
                {SEG_META[k].label}
              </span>
              <span className="neon-num text-lg font-black">{fmt(r.segments[k])}</span>
            </div>
            <div className="mt-0.5 flex items-center justify-between gap-2 text-xs text-slate-500">
              <span>{SEG_META[k].hint}</span>
              <span className="shrink-0 font-semibold text-slate-600">{total ? Math.round((r.segments[k] * 100) / total) : 0} %</span>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}

/** Когда играют: 24 часа (насыщенность — число начатых занятий) и дни недели. */
function WhenCard({ r }: { r: Report }) {
  const max = Math.max(1, ...r.hourly);
  const peak = r.hourly.indexOf(Math.max(...r.hourly));
  const wmax = Math.max(1, ...r.weekly);
  return (
    <Card title="Когда играют" subtitle="Начатые занятия за 30 дней по времени Варшавы — удобно выбирать час рассылок" data-engagement-hours>
      <div className="grid grid-cols-12 gap-1 sm:grid-cols-24" role="list" aria-label="Занятия по часам">
        {r.hourly.map((v, h) => (
          <div key={h} role="listitem" className="flex flex-col items-center gap-1" aria-label={`${h}:00 — ${v} занятий`}>
            <span className="heat-cell w-full" style={{ background: v ? `rgb(91 95 247 / ${0.15 + (0.85 * v) / max})` : 'rgb(255 255 255 / 0.04)', boxShadow: v === max && v ? '0 0 14px rgb(91 95 247 / 0.9)' : undefined }} title={`${h}:00 — ${v}`} />
            <span className="text-[10px] tabular-nums text-slate-500">{h}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm text-slate-600">
        {max > 1 || r.hourly[peak] ? (
          <>
            Чаще всего начинают в <b className="text-night">{peak}:00–{peak + 1}:00</b>.
          </>
        ) : (
          'Пока мало данных.'
        )}
      </p>
      <div className="mt-4 grid grid-cols-7 gap-2" aria-label="Занятия по дням недели">
        {r.weekly.map((v, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="flex h-20 w-full items-end overflow-hidden rounded-lg" style={{ background: 'rgb(255 255 255 / 0.04)' }}>
              <div className="w-full rounded-lg" style={{ height: `${(v * 100) / wmax}%`, background: 'linear-gradient(180deg, #22d3ee, #5b5ff7)', boxShadow: '0 0 16px -4px rgb(34 211 238 / 0.8)' }} />
            </div>
            <span className="text-xs font-semibold text-slate-600">{WEEKDAYS[i]}</span>
            <span className="text-[11px] tabular-nums text-slate-500">{fmt(v)}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function Engagement() {
  const { data: r, error, loading, reload } = useLoad(() => api<Report>('/engagement'), []);
  return (
    <div className="space-y-5" data-engagement>
      <PageHeader title="Вовлечённость" subtitle="Кто играет, как часто, сколько времени и что им интересно. Активный день — когда игрок занимался (урок, повторение, миссия). Дни — по Варшаве." />
      {error && <LoadError error={error} retry={reload} />}
      {loading && !r && (
        <div className="grid gap-3 md:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      )}
      {r && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-engagement-kpi>
            <Kpi label="Занимались сегодня" value={fmt(r.stickiness.dau)} icon="⚡" tone="brand" hint="уникальных игроков" />
            <Kpi label="За 7 дней" value={fmt(r.stickiness.wau)} icon="📅" tone="sky" hint={`из ${fmt(r.stickiness.users)} зарегистрированных`} />
            <Kpi label="За 30 дней" value={fmt(r.stickiness.mau)} icon="🗓" tone="night" />
            <Kpi label="Липкость" value={`${r.stickiness.dauMau} %`} icon="🧲" tone="gold" hint="сколько из месячных играют каждый день; 20 % и выше — хорошо" />
          </div>
          <SegmentsCard r={r} />
          <div className="grid gap-5 lg:grid-cols-2">
            <Card title="Глубина за 7 дней" subtitle={`Среди ${fmt(r.depth.activeUsers)} игроков, занимавшихся за неделю`} data-engagement-depth>
              <dl className="grid grid-cols-2 gap-3">
                {(
                  [
                    ['Дней из 7', r.depth.daysPerUser, 'в среднем на игрока'],
                    ['Минут в день', r.depth.minutesPerDay, 'в активный день'],
                    ['Уроков', r.depth.lessonsPerUser, 'на игрока за неделю'],
                    ['XP', r.depth.xpPerUser, 'на игрока за неделю'],
                  ] as const
                ).map(([label, v, hint]) => (
                  <div key={label} className="rounded-xl border border-line px-3 py-2.5" style={{ background: 'rgb(255 255 255 / 0.025)' }}>
                    <dt className="eyebrow">{label}</dt>
                    <dd className="neon-num mt-1 text-2xl font-black">{String(v).replace('.', ',')}</dd>
                    <dd className="text-xs text-slate-500">{hint}</dd>
                  </div>
                ))}
              </dl>
            </Card>
            <Card title="Что интересно" subtitle="Доля игроков недели, кто пользовался разделом" data-engagement-features>
              {r.stickiness.wau ? (
                <ul className="space-y-2.5">
                  {[...r.features]
                    .sort((a, b) => b.share - a.share)
                    .map((f) => {
                      const c = f.share >= 50 ? '#2fd39a' : f.share >= 20 ? '#38b6ff' : '#a78bfa';
                      return (
                        <li key={f.key} data-feature={f.key}>
                          <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                            <span className="font-medium text-slate-700">{FEATURE_RU[f.key] ?? f.key}</span>
                            <span className="whitespace-nowrap">
                              <b className="text-night">{f.share} %</b> <span className="text-xs text-slate-500">{fmt(f.users)} чел.</span>
                            </span>
                          </div>
                          <span className="block h-2 overflow-hidden rounded-full" style={{ background: 'rgb(255 255 255 / 0.05)' }}>
                            <span className="block h-full rounded-full" style={{ width: `${Math.max(f.users ? 2 : 0, f.share)}%`, background: c, boxShadow: `0 0 12px -2px ${c}` }} />
                          </span>
                        </li>
                      );
                    })}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">За неделю никто не занимался</p>
              )}
            </Card>
          </div>
          <WhenCard r={r} />
          <Card title="«Лестница» уроков" subtitle="Сколько игроков прошли N уроков — видно, на каком шаге больше всего бросают" data-engagement-ladder>
            <Funnel steps={r.ladder.steps.map((s, i) => ({ label: `${s.lessons} ${s.lessons === 1 ? 'урок' : s.lessons < 5 ? 'урока' : 'уроков'}`, value: s.users, base: i === 0 ? r.ladder.base : r.ladder.steps[i - 1].users }))} />
          </Card>
          <div className="grid gap-5 lg:grid-cols-2">
            <Card title="Самые вовлечённые" subtitle="Больше всего активных дней за 14 дней" bodyClass="p-0" data-engagement-top>
              <PeopleTable
                rows={r.top.map((p) => ({ id: p.id, name: p.name, username: p.username, a: `${p.activeDays14} дн.`, b: `${fmt(p.xp14)} XP`, c: p.streak ? `🔥 ${p.streak}` : '—' }))}
                heads={['Дней из 14', 'XP за 14 дней', 'Серия']}
                empty="Пока никого"
              />
            </Card>
            <Card title="Под угрозой — стоит написать" subtitle="Играли регулярно, но пропали 8–14 дней назад" bodyClass="p-0" data-engagement-risk>
              <PeopleTable
                rows={r.atRisk.map((p) => ({ id: p.id, name: p.name, username: p.username, a: shortDay(p.lastActiveDay), b: `${p.activeDaysTotal} дн.`, c: `${p.lessons}` }))}
                heads={['Последний раз', 'Всего дней', 'Уроков']}
                empty="Никто не пропал — отлично"
              />
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function PeopleTable({ rows, heads, empty }: { rows: { id: string; name: string; username: string | null; a: string; b: string; c: string }[]; heads: [string, string, string]; empty: string }) {
  if (!rows.length) return <p className="p-4 text-sm text-slate-500">{empty}</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-line">
          <tr>
            <th className="th">Игрок</th>
            {heads.map((h) => (
              <th key={h} className="th text-right">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((p, i) => (
            <tr key={p.id} className="border-b border-line last:border-0">
              <td className="td">
                <span className={cx('mr-2 inline-grid h-6 w-6 place-items-center rounded-full text-[11px] font-black', i < 3 ? 'bg-accent text-white' : 'bg-slate-200 text-slate-700')}>{i + 1}</span>
                <Link className="link" to={`/users/${p.id}`}>
                  {p.name || '—'}
                </Link>
                {p.username && <span className="ml-1 text-xs text-slate-500">@{p.username}</span>}
              </td>
              <td className="td text-right tabular-nums">{p.a}</td>
              <td className="td text-right tabular-nums">{p.b}</td>
              <td className="td text-right tabular-nums">{p.c}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
