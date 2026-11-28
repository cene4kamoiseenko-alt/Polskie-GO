/**
 * Скорость (1.0, этап 1.2; сервер — /api/admin/perf, services/perf.ts): насколько быстро приложение у игроков и где тормозит.
 * Запуск и открытие урока — замеры в приложении у игроков; API — выборка запросов к серверу (доля 5 %, медленные и ошибки — всегда);
 * ошибки — из журнала ошибок по видам (бот — серверные ошибки webhook, фоновые задачи — cron).
 */
import { useState } from 'react';
import { api } from './api';
import { Card, DataTable, Kpi, LoadError, PageHeader, Segmented, fmt, useLoad } from './ui';

type Stat = { n: number; p50: number | null; p95: number | null; p99: number | null };
type Route = Stat & { route: string; d1p95: number | null; d1Calls: number; errors: number };
type Data = {
  hours: number;
  sampleRate: number;
  total: Stat;
  api: Route[];
  client: { start: { cold: Stat; warm: Stat }; lesson: Stat };
  errors: { api: number; bot: number; client: number; job: number; csp: number };
};

const ms = (v: number | null) => (v == null ? '—' : v >= 1000 ? `${(v / 1000).toFixed(1).replace('.', ',')} с` : `${fmt(v)} мс`);
const pair = (s: Stat) => (s.n ? `${ms(s.p50)} · ${ms(s.p95)}` : 'нет данных');
const few = (s: Stat) => (s.n ? `замеров: ${fmt(s.n)}${s.n < 20 ? ' — пока мало, цифре верить рано' : ''}` : 'появится после первых запусков');

export default function Speed() {
  const [hours, setHours] = useState(24);
  const { data, error, loading, reload } = useLoad<Data>(() => api(`/perf?hours=${hours}`), [hours]);
  const err = data?.errors;
  return (
    <div className="space-y-5" data-speed-page>
      <PageHeader
        title="Скорость"
        subtitle="Как быстро приложение работает у игроков: запуск, открытие урока, ответы сервера. Цифры: медиана · 95-й процентиль (95 % игроков быстрее)."
        actions={<Segmented label="Период" value={hours} onChange={setHours} options={[[1, 'Час'], [24, 'Сутки'], [168, 'Неделя']]} />}
      />
      {error && <LoadError error={error} retry={reload} />}
      {data && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" data-speed-kpis>
          <Kpi label="Повторный запуск" icon="⚡" tone="brand" value={pair(data.client.start.warm)} hint={few(data.client.start.warm)} />
          <Kpi label="Первый запуск" icon="📲" tone="sky" value={pair(data.client.start.cold)} hint={few(data.client.start.cold)} />
          <Kpi label="Открытие урока" icon="📘" tone="gold" value={pair(data.client.lesson)} hint={few(data.client.lesson)} />
          <Kpi label="Ответ сервера" icon="🛰️" tone="night" value={pair(data.total)} hint={data.total.n ? `p99 ${ms(data.total.p99)} · выборка ${Math.round(data.sampleRate * 100)} %` : 'нет запросов в выборке'} />
        </div>
      )}
      {err && (
        <div className="flex flex-wrap gap-2 text-sm" data-speed-errors>
          <span className="badge badge-red">сервер {fmt(err.api)}</span>
          <span className="badge badge-red">бот {fmt(err.bot)}</span>
          <span className="badge badge-gold">приложение {fmt(err.client)}</span>
          <span className="badge badge-sky">фоновые задачи {fmt(err.job)}</span>
          {!err.api && !err.bot && !err.client && !err.job && <span className="badge badge-green">ошибок за период нет</span>}
        </div>
      )}
      <Card title="Запросы к серверу" subtitle="Самые медленные сверху. «Обращений к базе» — сколько раз запрос ходит в базу: каждое обращение добавляет задержку.">
        <DataTable<Route>
          caption="Скорость запросов к серверу"
          loading={loading}
          rows={data?.api}
          rowKey={(r) => r.route}
          empty="За период запросов в выборке нет"
          cols={[
            { key: 'route', label: 'Запрос', render: (r) => <code className="font-mono text-[12px]">{r.route}</code> },
            { key: 'n', label: 'Замеров', align: 'right', render: (r) => fmt(r.n) },
            { key: 'p50', label: 'Медиана', align: 'right', render: (r) => ms(r.p50) },
            { key: 'p95', label: 'p95', align: 'right', render: (r) => ms(r.p95) },
            { key: 'p99', label: 'p99', align: 'right', render: (r) => ms(r.p99) },
            { key: 'd1', label: 'Ожидание базы, p95', align: 'right', render: (r) => ms(r.d1p95) },
            { key: 'calls', label: 'Обращений к базе', align: 'right', render: (r) => String(r.d1Calls).replace('.', ',') },
            { key: 'err', label: 'Ошибок', align: 'right', render: (r) => (r.errors ? <span className="text-coral">{fmt(r.errors)}</span> : '0') },
          ]}
        />
      </Card>
    </div>
  );
}
