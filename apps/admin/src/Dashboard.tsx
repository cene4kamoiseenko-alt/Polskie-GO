/**
 * «Обзор» админки (обновление 2026-11-12): главные показатели с динамикой к прошлому периоду, графики по дням, воронка новичков,
 * откуда пришли игроки, где они оказались после входного теста, напоминания бота, ошибки за сутки. Данные — /admin/insights и /admin/dashboard.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from './api';
import { Bars, DayBars, Funnel } from './charts';
import { Card, Empty, Kpi, PageHeader, Segmented, Skeleton, fmt, useLoad } from './ui';

type Pair = { now: number; prev: number };
type Insights = {
  days: number;
  tz: string;
  from: string;
  to: string;
  daily: { days: string[]; signups: number[]; active: number[]; lessons: number[]; stars: number[] };
  totals: { signups: Pair; active: Pair; lessons: Pair; stars: Pair };
  funnel: { total: number; onboarded: number; lesson: number; returnable: number; returned: number; paid: number };
  sources: { key: string; count: number }[];
  placement: { noTest: number; warszawa: number; lodz: number; krakow: number };
  selfLevels: { key: string; count: number }[];
  languages: { key: string; count: number }[];
  reminders: { days: { day: string; sent: number; failed: number; blocked: number; skipped: number }[]; enabled: number; telegramUsers: number; quizInvites: number };
};

/** Понятное название источника: метка /start из рекламы, приглашение, гость. */
export function sourceLabel(key: string) {
  if (key === 'ref') return 'по приглашению друга';
  if (key === 'guest') return 'вне Telegram (Android / браузер)';
  if (key === 'none') return 'без метки (открыл сам)';
  if (key === 'quiz') return 'ссылка на быстрый вопрос /quiz';
  if (key === 'other') return 'прочие метки';
  if (key.startsWith('ref_')) return 'по приглашению друга';
  if (key.startsWith('screen_')) return `ссылка на экран «${key.slice(7)}»`;
  return `метка «${key}»`;
}

const LANG: Record<string, string> = { uk: 'украинский', ru: 'русский', en: 'английский', none: 'не выбран' };
const LEVEL: Record<string, string> = { A0: 'A0 — с нуля', A1: 'A1', A2: 'A2', B1: 'B1', B2: 'B2', C1: 'C1', none: 'не указан' };

function AudienceCard() {
  const { data } = useLoad<any>(() => api('/audience').catch(() => null), []);
  const s = data?.summary;
  if (!s) return null;
  return (
    <Link to="/audience" className="panel group flex flex-wrap items-center justify-between gap-3 p-4 transition hover:border-sky/40" data-audience-card>
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-soft text-lg" aria-hidden>🤝</span>
        <div>
          <div className="font-bold text-night">Аудитория бота</div>
          <div className="text-sm text-slate-600">
            Всего <b>{s.total}</b> · новые за сутки <b>{s.new1}</b>, за 7 дней <b>{s.new7}</b> · открыли приложение <b>{s.app}</b> · только бот <b>{s.botOnly}</b>
            {s.blocked > 0 && <> · заблокировали бота <b>{s.blocked}</b></>}
          </div>
        </div>
      </div>
      <span className="link text-sm">открыть список →</span>
    </Link>
  );
}

function ErrorsCard({ data }: { data?: { total: Record<string, number>; items: { kind: string; message: string; count: number }[] } }) {
  if (!data) return null;
  const sum = data.total.server + data.total.client + data.total.csp;
  return (
    <Link to="/errors" className="panel flex flex-wrap items-center justify-between gap-3 p-4 transition hover:border-coral/40" data-app-errors>
      <div className="flex items-center gap-3">
        <span className={`grid h-10 w-10 place-items-center rounded-xl text-lg ${sum ? 'bg-coral-soft' : 'bg-brand-soft'}`} aria-hidden>{sum ? '⚠️' : '✅'}</span>
        <div>
          <div className="font-bold text-night">Ошибки за 24 часа</div>
          <div className="text-sm text-slate-600">
            {sum ? (
              <>
                сервер <b>{data.total.server}</b> · приложение <b>{data.total.client}</b> · безопасность <b>{data.total.csp}</b>
                {data.items[0] && <span className="text-slate-500"> · последняя: {data.items[0].message.slice(0, 60)}</span>}
              </>
            ) : (
              'нет — всё спокойно'
            )}
          </div>
        </div>
      </div>
      <span className="link text-sm">журнал ошибок →</span>
    </Link>
  );
}

/** `analytics` — графики, воронка и источники: главному администратору и поддержке. Редактор контента видит сводку по урокам. */
export default function Dashboard({ analytics = true }: { analytics?: boolean }) {
  const [days, setDays] = useState(30);
  const ins = useLoad<Insights | null>(() => (analytics ? api(`/insights?days=${days}`) : Promise.resolve(null)), [days, analytics]);
  const dash = useLoad<any>(() => api('/dashboard'), []);
  const i = ins.data;
  const d = dash.data;
  const error = ins.error || dash.error;
  const placementTotal = i ? i.placement.warszawa + i.placement.lodz + i.placement.krakow : 0;
  return (
    <div className="space-y-5" aria-busy={ins.loading}>
      <PageHeader
        title="Обзор"
        subtitle={!analytics ? 'Сводка по урокам и заданиям' : i ? `${days} дн.: ${i.from.split('-').reverse().join('.')} — ${i.to.split('-').reverse().join('.')} · дни по Варшаве` : 'Загрузка…'}
        actions={analytics && <Segmented label="Период" value={days} onChange={setDays} options={[[7, '7 дней'], [30, '30 дней'], [90, '90 дней']]} />}
      />
      {error && <p className="rounded-xl bg-coral-soft px-4 py-3 text-sm text-[#b42336]">{error}</p>}
      {i ? (
        <div className={`grid grid-cols-2 gap-3 transition-opacity xl:grid-cols-4 ${ins.loading ? 'opacity-60' : ''}`} data-kpi>
          <Kpi label="Новые игроки" icon="🆕" tone="brand" value={fmt(i.totals.signups.now)} now={i.totals.signups.now} prev={i.totals.signups.prev} hint={`к прошлым ${days} дн.`} />
          <Kpi label="Активные игроки" icon="🔥" tone="sky" value={fmt(i.totals.active.now)} now={i.totals.active.now} prev={i.totals.active.prev} hint="хоть раз занимались" />
          <Kpi label="Пройдено уроков" icon="📘" tone="night" value={fmt(i.totals.lessons.now)} now={i.totals.lessons.now} prev={i.totals.lessons.prev} />
          <Kpi label="Доход, Stars" icon="⭐" tone="gold" value={`⭐ ${fmt(i.totals.stars.now)}`} now={i.totals.stars.now} prev={i.totals.stars.prev} hint={d ? `всего ⭐ ${fmt(d.revenueAllStars)}` : undefined} />
        </div>
      ) : analytics ? (
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{[0, 1, 2, 3].map((k) => <Skeleton key={k} className="h-[118px]" />)}</div>
      ) : (
        <p className="rounded-xl bg-sky-soft px-4 py-3 text-sm text-[#0f6aa6]" data-editor-note>
          Графики, воронка новичков, источники и журнал ошибок доступны главному администратору и поддержке.
        </p>
      )}

      {analytics && (
        <div className="grid gap-3 lg:grid-cols-2">
          <AudienceCard />
          <ErrorsCard data={d?.appErrors ?? undefined} />
        </div>
      )}

      {d && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Kpi compact label="Всего аккаунтов" value={fmt(d.users)} tone="night" hint={`активны за сутки ${d.active1} · за 7 дн. ${d.active7}`} />
          <Kpi compact label="Premium сейчас" value={fmt(d.premium)} tone="gold" hint={`платежей за 30 дн. ${d.payments30}`} />
          <Kpi compact label="Возвращаются" value={`${d.retention.d1 == null ? '—' : `${d.retention.d1}%`} / ${d.retention.d7 == null ? '—' : `${d.retention.d7}%`}`} tone="sky" hint="на 2-й день / через неделю (90 дн.)" />
          <Kpi compact label="Средний игрок" value={`${fmt(d.avgXp)} XP`} tone="brand" hint={`${d.avgLessons} уроков · ${d.avgWords} слов`} />
        </div>
      )}

      {i && (
        <div className={`space-y-5 transition-opacity ${ins.loading ? 'opacity-60' : ''}`}>
          <div className="grid gap-4 xl:grid-cols-2">
            <Card title="Новые игроки по дням" subtitle="регистрации в приложении (Telegram и вне его)">
              <DayBars label="Регистрации" days={i.daily.days} series={[{ label: 'новые', color: '#1fb57e', values: i.daily.signups }]} unit="новых" />
            </Card>
            <Card title="Активные игроки по дням" subtitle="кто хоть раз занимался в этот день">
              <DayBars label="Активные игроки" days={i.daily.days} series={[{ label: 'активные', color: '#1d8fd6', values: i.daily.active }]} unit="игроков" />
            </Card>
            <Card title="Пройдено уроков по дням">
              <DayBars label="Уроки" days={i.daily.days} series={[{ label: 'уроки', color: '#0e2746', values: i.daily.lessons }]} unit="уроков" />
            </Card>
            <Card title="Доход по дням" subtitle="успешные платежи Telegram Stars">
              <DayBars label="Доход" days={i.daily.days} series={[{ label: 'Stars', color: '#e39a14', values: i.daily.stars }]} unit="⭐" />
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card title="Воронка новичков" subtitle={`зарегистрировались за ${days} дн.`} data-funnel-card>
              {i.funnel.total ? (
                <Funnel
                  steps={[
                    { label: 'Зарегистрировались', value: i.funnel.total },
                    { label: 'Прошли знакомство', value: i.funnel.onboarded, base: i.funnel.total },
                    { label: 'Закончили урок', value: i.funnel.lesson, base: i.funnel.total },
                    { label: 'Вернулись на следующий день', value: i.funnel.returned, base: i.funnel.returnable, hint: '(без зарегистрированных сегодня)' },
                    { label: 'Купили Premium', value: i.funnel.paid, base: i.funnel.total },
                  ]}
                />
              ) : (
                <Empty>За этот период новых игроков нет</Empty>
              )}
            </Card>
            <Card title="Откуда пришли" subtitle="первая метка /start в боте; реклама — ваши метки (например, ad_tiktok)" data-sources-card>
              <Bars items={i.sources.map((s) => ({ key: s.key, label: sourceLabel(s.key), value: s.count }))} empty="За этот период новых игроков нет" />
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <Card title="Входной тест" subtitle="где оказались новички после теста" data-placement-card>
              <Bars
                items={[
                  { key: 'w', label: 'Варшава (ниже 50 %)', value: i.placement.warszawa, color: '#1fb57e' },
                  { key: 'l', label: 'Лодзь (50–79 %)', value: i.placement.lodz, color: '#1d8fd6' },
                  { key: 'k', label: 'Краков (80 % и выше)', value: i.placement.krakow, color: '#e39a14' },
                ]}
                empty="Никто из новичков не проходил тест"
              />
              <p className="mt-3 text-xs text-slate-500">
                Прошли тест <b>{placementTotal}</b> из {fmt(i.funnel.total)} · без теста <b>{i.placement.noTest}</b>
              </p>
            </Card>
            <Card title="Заявленный уровень" subtitle="ответ на шаге знакомства">
              <Bars items={i.selfLevels.map((x) => ({ key: x.key, label: LEVEL[x.key] ?? x.key, value: x.count, color: '#0e2746' }))} empty="Нет данных" />
            </Card>
            <Card title="Язык интерфейса" subtitle="новички периода">
              <Bars items={i.languages.map((x) => ({ key: x.key, label: LANG[x.key] ?? x.key, value: x.count, color: '#e5485b' }))} empty="Нет данных" />
            </Card>
          </div>

          <Card
            title="Напоминания бота"
            subtitle="ежедневное напоминание о занятиях: доставлено, не доставлено, бот заблокирован"
            data-reminders-card
          >
            <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(220px,1fr)]">
              <DayBars
                label="Напоминания"
                days={i.reminders.days.map((r) => r.day)}
                series={[
                  { label: 'доставлено', color: '#1fb57e', values: i.reminders.days.map((r) => r.sent) },
                  { label: 'не доставлено', color: '#e39a14', values: i.reminders.days.map((r) => r.failed) },
                  { label: 'бот заблокирован', color: '#e5485b', values: i.reminders.days.map((r) => r.blocked) },
                ]}
              />
              <dl className="grid content-start gap-3 text-sm">
                {(
                  [
                    ['Доставлено за период', i.reminders.days.reduce((s, r) => s + r.sent, 0), 'text-[#13784f]'],
                    ['Не доставлено', i.reminders.days.reduce((s, r) => s + r.failed, 0), 'text-[#9a6200]'],
                    ['Бот заблокирован', i.reminders.days.reduce((s, r) => s + r.blocked, 0), 'text-[#b42336]'],
                    ['Пропущено (уже позанимались)', i.reminders.days.reduce((s, r) => s + r.skipped, 0), 'text-slate-600'],
                  ] as [string, number, string][]
                ).map(([k, v, c]) => (
                  <div key={k} className="flex items-baseline justify-between gap-3 border-b border-line pb-2">
                    <dt className="text-slate-500">{k}</dt>
                    <dd className={`font-bold ${c}`}>{fmt(v)}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-xs text-slate-500 lg:col-start-2">
                Напоминания включены у <b className="text-night">{fmt(i.reminders.enabled)}</b> из {fmt(i.reminders.telegramUsers)} игроков Telegram. Приглашений к быстрому вопросу за период: <b className="text-night">{fmt(i.reminders.quizInvites)}</b>.
              </p>
            </div>
          </Card>
        </div>
      )}

      {d && (
        <div className="grid gap-4 xl:grid-cols-2">
          <Card title="Популярные уроки" subtitle="сколько игроков прошли" bodyClass="p-0">
            <table className="w-full">
              <tbody>
                {d.topLessons.map((l: any) => (
                  <tr key={l.slug} className="border-b border-line last:border-0">
                    <td className="td">{l.title?.ru || l.title?.uk}</td>
                    <td className="td text-right font-bold">{l.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!d.topLessons.length && <div className="p-4"><Empty>Пока никто не прошёл ни одного урока</Empty></div>}
          </Card>
          <Card title="Самые трудные задания" subtitle="где чаще всего ошибаются (от 3 попыток)" bodyClass="p-0">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="th">Урок</th>
                  <th className="th">Тип</th>
                  <th className="th text-right">Ошибок</th>
                </tr>
              </thead>
              <tbody>
                {d.errors.map((e: any) => (
                  <tr key={e.exerciseId} className="border-t border-line">
                    <td className="td">
                      <Link className="link" to={`/r/exercises/${e.exerciseId}`}>{e.lesson}</Link>
                    </td>
                    <td className="td text-slate-500">{e.type}</td>
                    <td className="td text-right font-bold">
                      {e.rate}% <span className="font-normal text-slate-500">({e.wrong}/{e.total})</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!d.errors.length && <div className="p-4"><Empty>Пока мало ответов для выводов</Empty></div>}
          </Card>
        </div>
      )}
    </div>
  );
}
