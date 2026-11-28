/**
 * Готовность контента (1.0, этап 2; сервер — /api/admin/content-readiness, content/readiness.ts): по каждому городу — сколько трудных
 * версий уроков нужно игрокам с более высоким уровнем, сколько уже есть, каких не хватает и есть ли замечания проверки качества.
 * Отчёт считается из того же контента, что получают игроки, поэтому цифры совпадают с игрой.
 */
import { api } from './api';
import { Badge, Card, DataTable, Kpi, LoadError, PageHeader, fmt, useLoad } from './ui';

type Missing = { slug: string; cefr: string; level: string };
type City = { city: string; name: string; cefr: string | null; lessons: number; need: number; have: number; missing: Missing[]; tasks: number; findings: number; ready: boolean };
type Data = { cities: City[]; totals: { cities: number; ready: number; need: number; have: number; missing: number; tasks: number; findings: number } };

/** «gdy-4-silownia» → «gdy-4»: в списке недостающих коротко, полное имя — во всплывающей подсказке. */
const short = (slug: string) => slug.split('-').slice(0, 2).join('-');

function missingText(c: City) {
  if (!c.missing.length) return <span className="text-slate-500">—</span>;
  const levels = [...new Set(c.missing.map((m) => m.level))].join(', ');
  return (
    <span title={c.missing.map((m) => `${m.slug} → ${m.level}`).join('\n')}>
      {fmt(c.missing.length)} · {levels}
      <span className="ml-1 text-slate-500">({c.missing.slice(0, 3).map((m) => short(m.slug)).join(', ')}{c.missing.length > 3 ? '…' : ''})</span>
    </span>
  );
}

export default function Readiness() {
  const { data, error, loading, reload } = useLoad<Data>(() => api('/content-readiness'), []);
  const t = data?.totals;
  return (
    <div className="space-y-5" data-readiness-page>
      <PageHeader
        title="Готовность контента"
        subtitle="Трудные версии уроков: игрок с уровнем выше уровня урока проходит тот же урок с теорией и заданиями своего уровня. Здесь видно, где версий ещё не хватает."
      />
      {error && <LoadError error={error} retry={reload} />}
      {t && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" data-readiness-kpis>
          <Kpi label="Города готовы" icon="🏙️" tone="brand" value={`${fmt(t.ready)} из ${fmt(t.cities)}`} hint={t.ready === t.cities ? 'все версии на месте' : `осталось городов: ${fmt(t.cities - t.ready)}`} />
          <Kpi label="Версии уроков" icon="📚" tone="sky" value={`${fmt(t.have)} из ${fmt(t.need)}`} hint={t.missing ? `не хватает: ${fmt(t.missing)}` : 'не хватает: 0'} />
          <Kpi label="Заданий в версиях" icon="✍️" tone="gold" value={fmt(t.tasks)} hint="по 8 и больше в каждой версии" />
          <Kpi label="Замечания качества" icon="🔎" tone="night" value={fmt(t.findings)} hint={t.findings ? 'см. столбец «Замечания»' : 'проверка «угадываемости» пройдена'} />
        </div>
      )}
      <Card title="Города" subtitle="В порядке карты. «Нужно» — версии на уровнях выше уровня урока: уроку A2 нужны B1 и B2, уроку B1 — B2, уроку B2 — ни одной.">
        <DataTable<City>
          caption="Готовность версий уроков по городам"
          loading={loading}
          rows={data?.cities}
          rowKey={(c) => c.city}
          empty="Городов нет"
          cols={[
            { key: 'name', label: 'Город', render: (c) => <span className="font-semibold">{c.name}</span> },
            { key: 'cefr', label: 'Уровень', render: (c) => c.cefr ?? '—' },
            { key: 'state', label: 'Состояние', render: (c) => (c.need === 0 ? <Badge tone="gray">версии не нужны</Badge> : c.ready ? <Badge tone="green">готов</Badge> : <Badge tone="gold">в работе</Badge>) },
            { key: 'have', label: 'Есть / нужно', align: 'right', render: (c) => `${fmt(c.have)} / ${fmt(c.need)}` },
            { key: 'missing', label: 'Не хватает', render: missingText },
            { key: 'tasks', label: 'Заданий', align: 'right', render: (c) => fmt(c.tasks) },
            { key: 'findings', label: 'Замечания', align: 'right', render: (c) => (c.findings ? <span className="text-coral">{fmt(c.findings)}</span> : '0') },
          ]}
        />
      </Card>
      <p className="text-sm text-slate-500">Проверка кодом не заменяет чтения носителем языка: она ловит только то, что можно измерить (полноту, число заданий, «угадываемость» вариантов).</p>
    </div>
  );
}
