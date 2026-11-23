/**
 * «Источники трафика» (2026-11-23, сервер — services/traffic.ts): откуда приходят люди — TikTok, Instagram, Telegram, реклама,
 * YouTube, приглашение друга, сайт/Android, без метки. Владелец: «Нужно понимать, откуда человек зашёл в бота».
 *
 * На странице: доля каналов за период, новые люди по дням (стопка по каналам), воронка каждого канала до оплаты, ссылки с метками
 * (создать, скопировать, расход и цена одного пришедшего, архив), метки без ссылки и лента последних пришедших (обновляется сама).
 * Цвета каналов — палитра навыка dataviz (8 оттенков, проверены на тёмной панели #0d1630: контраст ≥ 3:1, различимы при дальтонизме
 * у соседних в стопке), «без метки» — нейтральный серый. Канал всегда подписан словом — цвет только помогает.
 */
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { api } from './api';
import { DayBars } from './charts';
import { useFeedback } from './feedback';
import { Badge, Card, Delta, Empty, Field, LoadError, PageHeader, Segmented, Skeleton, ago, cx, fmt, useLoad } from './ui';

export type ChannelKey = 'telegram' | 'ads' | 'tiktok' | 'web' | 'instagram' | 'invite' | 'other' | 'youtube' | 'direct';

/** Порядок — как в проверенной палитре (соседние в стопке различимы); «без метки» — последней, серой. */
export const CHANNELS: Record<ChannelKey, { label: string; color: string; icon: string; hint: string; prefix?: string }> = {
  telegram: { label: 'Telegram', color: '#3987e5', icon: '✈️', hint: 'канал, посты, чаты, кнопки бота', prefix: 'tg' },
  ads: { label: 'Реклама', color: '#d95926', icon: '📢', hint: 'платная: Telegram Ads, TikTok Ads, Meta…', prefix: 'ad' },
  tiktok: { label: 'TikTok', color: '#199e70', icon: '🎵', hint: 'видео, шапка профиля, комментарии', prefix: 'tt' },
  web: { label: 'Сайт / Android', color: '#c98500', icon: '🌐', hint: 'вход вне Telegram', prefix: 'web' },
  instagram: { label: 'Instagram', color: '#d55181', icon: '📸', hint: 'reels, сторис, шапка профиля', prefix: 'ig' },
  invite: { label: 'Приглашение друга', color: '#008300', icon: '🤝', hint: 'ссылка ref_ из приложения' },
  other: { label: 'Другие метки', color: '#9085e9', icon: '🏷️', hint: 'метка не похожа ни на один канал', prefix: 'x' },
  youtube: { label: 'YouTube', color: '#e66767', icon: '▶️', hint: 'видео и shorts', prefix: 'yt' },
  direct: { label: 'Без метки', color: '#64748b', icon: '🔎', hint: 'нашли бота сами или метка не дошла' },
};
export const CHANNEL_ORDER = Object.keys(CHANNELS) as ChannelKey[];
const LINK_CHANNELS = CHANNEL_ORDER.filter((c) => c !== 'invite' && c !== 'direct');

type Funnel = { people: number; bot: number; app: number; onboarded: number; lesson: number; returnable: number; returned: number; paid: number; stars: number; blocked: number };
type TrafficLink = { id: string; code: string; channel: ChannelKey; title: string; note: string | null; cost: number | null; createdAt: string; archivedAt: string | null; urls: { bot: string; app: string; web: string }; period: Funnel; allTime: Funnel };
type Report = {
  period: { days: number; from: string; to: string };
  total: Funnel;
  channels: ({ key: ChannelKey; prev: number } & Funnel)[];
  days: string[];
  daily: { key: ChannelKey; values: number[] }[];
  links: TrafficLink[];
  loose: { param: string; channel: ChannelKey; people: number }[];
  recent: { telegramId: number; userId: string | null; name: string | null; username: string | null; param: string | null; via: string; at: string; channel: ChannelKey; onboarded: boolean; blocked: boolean }[];
  hints: { bot: string; app: string };
};

const pct = (n: number, of: number) => (of > 0 ? Math.round((n / of) * 100) : 0);
const VIA: Record<string, string> = { bot: 'в боте', app: 'в приложении', web: 'на сайте' };

export function ChannelChip({ k, children }: { k: ChannelKey; children?: ReactNode }) {
  const c = CHANNELS[k] ?? CHANNELS.other;
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold text-slate-800" style={{ borderColor: `${c.color}88`, background: `${c.color}22` }}>
      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: c.color, boxShadow: `0 0 8px ${c.color}` }} aria-hidden />
      <span className="truncate">{children ?? c.label}</span>
    </span>
  );
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

export default function Traffic({ superadmin }: { superadmin: boolean }) {
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const { data, error, loading, reload } = useLoad<Report>(() => api(`/traffic?days=${days}`), [days]);
  // Лента «последние пришедшие» и цифры обновляются сами раз в минуту, пока вкладка видна.
  useEffect(() => {
    const t = window.setInterval(() => { if (document.visibilityState === 'visible') reload(); }, 60_000);
    return () => window.clearInterval(t);
  }, [reload]);
  const [draft, setDraft] = useState<{ channel: ChannelKey; code?: string } | null>(null);

  return (
    <div className="space-y-4" data-traffic>
      <PageHeader
        title="Источники трафика"
        subtitle="Откуда приходят люди: TikTok, реклама, Telegram, приглашения друзей. Первое касание — /start в боте или вход в приложение."
        actions={<Segmented label="Период" value={days} options={[[7, '7 дней'], [30, '30 дней'], [90, '90 дней']]} onChange={setDays} />}
      />
      {error && <LoadError error={error} retry={reload} />}
      {!data && !error && <Skeleton className="h-64" />}
      {data && (
        <>
          <Overview r={data} />
          <ChannelGrid r={data} />
          <Card title="Новые люди по дням" subtitle={`по каналу первого касания · ${data.period.from.slice(8)}.${data.period.from.slice(5, 7)} — ${data.period.to.slice(8)}.${data.period.to.slice(5, 7)}, дни по Варшаве`} data-traffic-daily>
            <DayBars label="Новые люди по каналам" days={data.days} series={data.daily.filter((d) => d.values.some(Boolean)).map((d) => ({ label: CHANNELS[d.key].label, color: CHANNELS[d.key].color, values: d.values }))} />
          </Card>
          <FunnelTable r={data} />
          <Links r={data} superadmin={superadmin} reload={reload} draft={draft} setDraft={setDraft} />
          {data.loose.length > 0 && (
            <Card title="Метки без ссылки" subtitle="люди пришли с меткой, которой нет среди ваших ссылок: канал определён по началу кода" data-traffic-loose>
              <ul className="divide-y divide-line">
                {data.loose.map((x) => (
                  <li key={x.param} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                    <span className="flex min-w-0 items-center gap-2"><code className="rounded bg-surface-2 px-1.5 py-0.5 text-xs">{x.param}</code><ChannelChip k={x.channel} /></span>
                    <span className="flex items-center gap-3"><b className="text-night">{fmt(x.people)}</b>
                      {superadmin && /^[a-z0-9][a-z0-9_-]{1,39}$/.test(x.param) && <button type="button" className="text-xs font-bold text-sky-700" onClick={() => { setDraft({ channel: x.channel === 'direct' || x.channel === 'invite' ? 'other' : x.channel, code: x.param }); document.getElementById('traffic-new-link')?.scrollIntoView({ behavior: 'smooth' }); }}>сделать ссылкой</button>}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          <Recent r={data} loading={loading} />
          <HowTo hints={data.hints} />
        </>
      )}
    </div>
  );
}

/** Главная панель: сколько пришло за период и полоса долей каналов. */
function Overview({ r }: { r: Report }) {
  const prevTotal = r.channels.reduce((n, c) => n + c.prev, 0);
  const shown = r.channels.filter((c) => c.people > 0);
  const t = r.total;
  return (
    <section className="panel relative overflow-hidden p-5" data-traffic-overview>
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-40 blur-3xl" style={{ background: 'radial-gradient(circle, #22d3ee 0%, transparent 70%)' }} aria-hidden />
      <div className="pointer-events-none absolute -bottom-28 left-1/3 h-56 w-56 rounded-full opacity-30 blur-3xl" style={{ background: 'radial-gradient(circle, #5b5ff7 0%, transparent 70%)' }} aria-hidden />
      <div className="relative grid gap-5 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)]">
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-wider text-slate-500">Пришли за {r.period.days} дн.</div>
          <div className="neon-num mt-1 text-[44px] font-black leading-none tracking-tight">{fmt(t.people)}</div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500"><Delta now={t.people} prev={prevTotal} /> к прошлым {r.period.days} дн.</div>
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div><dt className="text-xs text-slate-500">Открыли приложение</dt><dd className="font-bold text-night">{fmt(t.app)} <span className="text-xs font-normal text-slate-500">{pct(t.app, t.people)} %</span></dd></div>
            <div><dt className="text-xs text-slate-500">Прошли урок</dt><dd className="font-bold text-night">{fmt(t.lesson)} <span className="text-xs font-normal text-slate-500">{pct(t.lesson, t.people)} %</span></dd></div>
            <div><dt className="text-xs text-slate-500">Оплатили Premium</dt><dd className="font-bold text-night">{fmt(t.paid)} <span className="text-xs font-normal text-slate-500">⭐ {fmt(t.stars)}</span></dd></div>
            <div><dt className="text-xs text-slate-500">Заблокировали бота</dt><dd className="font-bold text-night">{fmt(t.blocked)}</dd></div>
          </dl>
        </div>
        <div className="min-w-0">
          <div className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-slate-500">Доля каналов</div>
          {t.people === 0 ? (
            <Empty>За этот период новых людей нет. Создайте ссылку ниже и поставьте её в TikTok, Instagram или рекламу.</Empty>
          ) : (
            <>
              <div className="flex h-5 w-full gap-[2px] overflow-hidden rounded-full bg-surface-2" role="img" aria-label={shown.map((c) => `${CHANNELS[c.key].label}: ${c.people}`).join(', ')}>
                {shown.map((c) => (
                  <span key={c.key} className="h-full first:rounded-l-full last:rounded-r-full" style={{ width: `${(c.people / t.people) * 100}%`, minWidth: 4, background: CHANNELS[c.key].color, boxShadow: `0 0 14px -2px ${CHANNELS[c.key].color}` }} title={`${CHANNELS[c.key].label}: ${c.people}`} />
                ))}
              </div>
              <ul className="mt-3 grid gap-x-4 gap-y-1.5 sm:grid-cols-2" data-traffic-legend>
                {shown.sort((a, b) => b.people - a.people).map((c) => (
                  <li key={c.key} className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex min-w-0 items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: CHANNELS[c.key].color }} aria-hidden /><span className="truncate text-slate-700">{CHANNELS[c.key].label}</span></span>
                    <span className="whitespace-nowrap"><b className="text-night">{fmt(c.people)}</b> <span className="text-xs text-slate-500">{pct(c.people, t.people)} %</span></span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

/** Карточки каналов: пришли, рост, сколько дошли до приложения и до оплаты. */
function ChannelGrid({ r }: { r: Report }) {
  const list = [...r.channels].sort((a, b) => b.people - a.people || CHANNEL_ORDER.indexOf(a.key) - CHANNEL_ORDER.indexOf(b.key));
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3" data-traffic-channels>
      {list.map((c) => {
        const ch = CHANNELS[c.key];
        const dim = c.people === 0 && c.prev === 0;
        return (
          <div key={c.key} className={cx('panel relative overflow-hidden p-4', dim && 'opacity-70')} data-channel={c.key}>
            <span className="absolute inset-y-0 left-0 w-1" style={{ background: ch.color, boxShadow: `0 0 16px ${ch.color}` }} aria-hidden />
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[15px] font-bold text-night"><span aria-hidden>{ch.icon}</span>{ch.label}</div>
                <div className="truncate text-xs text-slate-500">{ch.hint}</div>
              </div>
              <div className="text-right">
                <div className="neon-num text-[26px] font-black leading-none">{fmt(c.people)}</div>
                <div className="mt-1"><Delta now={c.people} prev={c.prev} /></div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <Mini label="приложение" value={c.app} of={c.people} />
              <Mini label="урок" value={c.lesson} of={c.people} />
              <Mini label="Premium" value={c.paid} of={c.people} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Mini({ label, value, of }: { label: string; value: number; of: number }) {
  return (
    <div className="rounded-lg bg-surface-2/70 px-1.5 py-1.5">
      <div className="font-bold text-night">{fmt(value)}{of > 0 && <span className="ml-1 text-[11px] font-semibold text-slate-500">{pct(value, of)} %</span>}</div>
      <div className="text-[11px] text-slate-500">{label}</div>
    </div>
  );
}

const STEPS: [keyof Funnel, string, string][] = [
  ['people', 'Пришли', 'первое касание за период'],
  ['bot', 'В боте', 'нажали «Старт» в боте'],
  ['app', 'Приложение', 'открыли Mini App или сайт'],
  ['onboarded', 'Знакомство', 'прошли первые экраны'],
  ['lesson', 'Урок', 'закончили хотя бы один урок'],
  ['returned', 'Вернулись', 'занимались в другой день (из тех, кто пришёл до сегодня)'],
  ['paid', 'Premium', 'оплатили хотя бы раз'],
  ['blocked', 'Блок бота', 'заблокировали бота'],
];

/** Воронка каждого канала: число и доля от пришедших. */
function FunnelTable({ r }: { r: Report }) {
  const rows = r.channels.filter((c) => c.people > 0).sort((a, b) => b.people - a.people);
  const cell = (f: Funnel, k: keyof Funnel) => {
    const base = k === 'returned' ? f.returnable : f.people;
    return (
      <td key={k} className="td whitespace-nowrap text-right">
        <b className="text-night">{fmt(f[k])}</b>
        {k !== 'people' && base > 0 && <span className="ml-1 text-xs text-slate-500">{pct(f[k], base)} %</span>}
      </td>
    );
  };
  return (
    <Card title="Воронка по каналам" subtitle="из пришедших за период: сколько дошли до каждого шага; «Вернулись» — от пришедших до сегодня" bodyClass="p-0" data-traffic-funnel>
      {rows.length === 0 ? (
        <div className="p-4"><Empty>Нет пришедших за период</Empty></div>
      ) : (
        // Таблица шире телефона: область прокрутки доступна с клавиатуры (axe: scrollable-region-focusable).
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Воронка по каналам, прокручивается вбок">
          <table className="w-full min-w-[860px] text-sm">
            <caption className="sr-only">Воронка по каналам</caption>
            <thead>
              <tr className="text-left text-xs text-slate-500">
                <th className="th">Канал</th>
                {STEPS.map(([k, label, hint]) => <th key={k} className="th text-right" title={hint}>{label}</th>)}
                <th className="th text-right" title="Telegram Stars от этих людей">Stars</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.key} className="border-t border-line">
                  <td className="td"><ChannelChip k={c.key} /></td>
                  {STEPS.map(([k]) => cell(c, k))}
                  <td className="td text-right">⭐ {fmt(c.stars)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-line font-semibold">
                <td className="td">Всего</td>
                {STEPS.map(([k]) => cell(r.total, k))}
                <td className="td text-right">⭐ {fmt(r.total.stars)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

/** Ссылки с метками: создать, скопировать, расход и цена одного пришедшего, архив. */
function Links({ r, superadmin, reload, draft, setDraft }: { r: Report; superadmin: boolean; reload: () => void; draft: { channel: ChannelKey; code?: string } | null; setDraft: (d: { channel: ChannelKey; code?: string } | null) => void }) {
  const { run, toast, ask } = useFeedback();
  const [archived, setArchived] = useState(false);
  const list = r.links.filter((l) => !!l.archivedAt === archived);
  const copy = async (text: string, what: string) => {
    const ok = await copyText(text);
    toast(ok ? `${what} скопирована` : 'Не удалось скопировать — выделите ссылку вручную', ok ? 'ok' : 'error');
  };
  const edit = async (l: TrafficLink) => {
    const cost = await ask({ title: `Расход на «${l.title}»`, label: 'Сколько потрачено на эту ссылку, zł (пусто — не считать)', initial: l.cost != null ? String(l.cost) : '', optional: true, confirm: 'Сохранить' });
    if (cost === null) return;
    const v = cost.trim() === '' ? null : Number(cost.replace(',', '.'));
    if (v !== null && !(v >= 0)) return toast('Нужна сумма числом', 'error');
    if (await run(() => api(`/traffic/links/${l.id}`, { method: 'PATCH', body: { cost: v } }), 'Расход сохранён')) reload();
  };
  const rename = async (l: TrafficLink) => {
    const title = await ask({ title: 'Название ссылки', label: 'Как назвать (видно только в админке)', initial: l.title, confirm: 'Сохранить' });
    if (!title?.trim()) return;
    if (await run(() => api(`/traffic/links/${l.id}`, { method: 'PATCH', body: { title } }), 'Название сохранено')) reload();
  };
  const archive = async (l: TrafficLink, on: boolean) => {
    if (await run(() => api(`/traffic/links/${l.id}`, { method: 'PATCH', body: { archived: on } }), on ? 'Ссылка в архиве — люди по ней всё равно считаются' : 'Ссылка снова в списке')) reload();
  };
  return (
    <Card
      title="Ссылки с метками"
      subtitle="ставьте их в TikTok, Instagram, рекламу, посты канала — и видно, сколько людей пришло по каждой"
      actions={<Segmented label="Какие ссылки" value={archived ? 'a' : 'n'} options={[['n', 'Рабочие'], ['a', 'Архив']]} onChange={(v) => setArchived(v === 'a')} />}
      data-traffic-links
    >
      {superadmin && <NewLink key={`${draft?.channel}-${draft?.code}`} initial={draft} onCreated={() => { setDraft(null); reload(); }} />}
      {list.length === 0 ? (
        <div className="mt-3"><Empty>{archived ? 'В архиве пусто' : 'Ссылок пока нет. Создайте первую — например, для шапки профиля в TikTok.'}</Empty></div>
      ) : (
        <ul className="mt-3 space-y-3">
          {list.map((l) => {
            const ch = CHANNELS[l.channel] ?? CHANNELS.other;
            const per = l.cost != null && l.allTime.people > 0 ? l.cost / l.allTime.people : null;
            return (
              <li key={l.id} className="rounded-2xl border border-line bg-surface-2/40 p-3.5" data-link={l.code}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2"><span className="font-bold text-night">{l.title}</span><ChannelChip k={l.channel} /></div>
                    <div className="mt-0.5 text-xs text-slate-500">метка <code className="rounded bg-surface-2 px-1">{l.code}</code>{l.note ? ` · ${l.note}` : ''}</div>
                  </div>
                  <div className="flex gap-4 text-right text-sm">
                    <div><div className="neon-num text-xl font-black leading-none">{fmt(l.period.people)}</div><div className="text-[11px] text-slate-500">за {r.period.days} дн.</div></div>
                    <div><div className="text-xl font-black leading-none text-night">{fmt(l.allTime.people)}</div><div className="text-[11px] text-slate-500">всего</div></div>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                  <span>приложение: <b className="text-night">{fmt(l.allTime.app)}</b> ({pct(l.allTime.app, l.allTime.people)} %)</span>
                  <span>урок: <b className="text-night">{fmt(l.allTime.lesson)}</b></span>
                  <span>Premium: <b className="text-night">{fmt(l.allTime.paid)}</b> · ⭐ {fmt(l.allTime.stars)}</span>
                  {l.cost != null && <span>расход: <b className="text-night">{fmt(l.cost)} zł</b>{per != null && <> · <b style={{ color: ch.color === '#64748b' ? undefined : '#ffd27a' }}>{per.toFixed(2)} zł</b> за человека</>}</span>}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" className="btn-p min-h-10 px-3 py-1.5 text-sm" onClick={() => copy(l.urls.bot, 'Ссылка в бота')} data-copy="bot">Скопировать: в бота</button>
                  <button type="button" className="btn-s min-h-10 px-3 py-1.5 text-sm" onClick={() => copy(l.urls.app, 'Ссылка в приложение')} data-copy="app">в приложение</button>
                  <button type="button" className="btn-s min-h-10 px-3 py-1.5 text-sm" onClick={() => copy(l.urls.web, 'Ссылка на сайт')} data-copy="web">на сайт</button>
                  {superadmin && (
                    <>
                      <button type="button" className="btn-s min-h-10 px-3 py-1.5 text-sm" onClick={() => edit(l)}>Расход</button>
                      <button type="button" className="btn-s min-h-10 px-3 py-1.5 text-sm" onClick={() => rename(l)}>Переименовать</button>
                      <button type="button" className="btn-s min-h-10 px-3 py-1.5 text-sm" onClick={() => archive(l, !l.archivedAt)}>{l.archivedAt ? 'Вернуть' : 'В архив'}</button>
                    </>
                  )}
                </div>
                <div className="mt-2 break-all font-mono text-[11px] text-slate-500">{l.urls.bot}</div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

/** Новая ссылка: канал → код подсказывается сам (tt_, ig_, ad_…), название, расход. */
function NewLink({ initial, onCreated }: { initial: { channel: ChannelKey; code?: string } | null; onCreated: () => void }) {
  const { run, toast } = useFeedback();
  const [channel, setChannel] = useState<ChannelKey>(initial?.channel ?? 'tiktok');
  const [title, setTitle] = useState('');
  const [code, setCode] = useState(initial?.code ?? '');
  const [cost, setCost] = useState('');
  const [busy, setBusy] = useState(false);
  const [made, setMade] = useState<TrafficLink | null>(null);
  const suggestion = useMemo(() => `${CHANNELS[channel].prefix ?? 'x'}_${Math.random().toString(36).slice(2, 6)}`, [channel]);
  const finalCode = (code || suggestion).trim().toLowerCase();
  const valid = /^[a-z0-9][a-z0-9_-]{1,39}$/.test(finalCode);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return toast('Напишите название ссылки', 'error');
    if (!valid) return toast('Метка: латиница, цифры, _ и -, от 2 до 40 знаков', 'error');
    const c = cost.trim() === '' ? null : Number(cost.replace(',', '.'));
    if (c !== null && !(c >= 0)) return toast('Расход — числом, в злотых', 'error');
    setBusy(true);
    let created: TrafficLink | null = null;
    const ok = await run(async () => { created = await api<TrafficLink>('/traffic/links', { body: { channel, title: title.trim(), code: finalCode, cost: c } }); }, 'Ссылка создана');
    setBusy(false);
    if (ok && created) {
      setMade(created);
      setTitle('');
      setCode('');
      setCost('');
      onCreated();
    }
  };
  return (
    <form id="traffic-new-link" onSubmit={submit} className="rounded-2xl border border-dashed border-[#22d3ee66] bg-[#22d3ee0d] p-3.5" data-new-link>
      <div className="mb-2 text-sm font-bold text-night">Новая ссылка</div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Field label="Канал">
          <select className="inp" value={channel} onChange={(e) => setChannel(e.target.value as ChannelKey)}>
            {LINK_CHANNELS.map((k) => <option key={k} value={k}>{CHANNELS[k].icon} {CHANNELS[k].label}</option>)}
          </select>
        </Field>
        <Field label="Название" hint="видно только в админке">
          <input className="inp" value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} placeholder="TikTok — шапка профиля" />
        </Field>
        <Field label="Метка" hint="латиница, цифры, _ и -">
          <input className="inp font-mono" value={code} maxLength={40} onChange={(e) => setCode(e.target.value)} placeholder={suggestion} aria-invalid={!!code && !valid} />
        </Field>
        <Field label="Расход, zł" hint="по желанию: посчитаем цену человека">
          <input className="inp" inputMode="decimal" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0" />
        </Field>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="submit" className="btn-p" disabled={busy}>{busy ? 'Создаю…' : 'Создать ссылку'}</button>
        <span className="text-xs text-slate-500">Будет: <code className="break-all">t.me/…?start={finalCode}</code></span>
      </div>
      {made && (
        <div className="mt-3 rounded-xl bg-surface-2 p-3 text-sm" role="status">
          Готово: <b>{made.title}</b>. Ссылка в бота: <code className="break-all">{made.urls.bot}</code>
          <button type="button" className="ml-2 font-bold text-sky-700" onClick={async () => { const ok = await copyText(made.urls.bot); toast(ok ? 'Ссылка скопирована' : 'Не удалось скопировать', ok ? 'ok' : 'error'); }}>скопировать</button>
        </div>
      )}
    </form>
  );
}

/** Лента последних пришедших (обновляется раз в минуту). */
function Recent({ r, loading }: { r: Report; loading: boolean }) {
  return (
    <Card title="Последние пришедшие" subtitle="первое касание: кто, откуда и что успел — обновляется раз в минуту" actions={<span className={cx('inline-flex items-center gap-1.5 text-xs font-semibold', loading ? 'text-sky-700' : 'text-emerald-700')}><span className={cx('h-2 w-2 rounded-full', loading ? 'bg-sky-400' : 'animate-pulse bg-emerald-400')} aria-hidden />{loading ? 'обновляю' : 'в эфире'}</span>} bodyClass="p-0" data-traffic-recent>
      {r.recent.length === 0 ? (
        <div className="p-4"><Empty>Пока никого</Empty></div>
      ) : (
        <ul className="divide-y divide-line">
          {r.recent.map((x) => {
            const who = x.name || (x.username ? `@${x.username}` : x.telegramId < 0 ? 'Гость' : `id ${x.telegramId}`);
            return (
              <li key={x.telegramId} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-sm">
                <span className="w-20 shrink-0 text-xs text-slate-500">{ago(Date.parse(x.at))}</span>
                <span className="min-w-0 flex-1 truncate font-semibold text-night">{x.userId ? <Link className="hover:underline" to={`/users/${x.userId}`}>{who}</Link> : who}</span>
                <ChannelChip k={x.channel}>{CHANNELS[x.channel].label}{x.param && x.channel !== 'invite' ? ` · ${x.param}` : ''}</ChannelChip>
                <span className="text-xs text-slate-500">{VIA[x.via] ?? x.via}</span>
                {x.blocked ? <Badge tone="red">бот заблокирован</Badge> : x.onboarded ? <Badge tone="green">в приложении</Badge> : x.userId ? <Badge tone="sky">открыл</Badge> : <Badge>только бот</Badge>}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

function HowTo({ hints }: { hints: { bot: string; app: string } }) {
  return (
    <details className="panel p-4 text-sm" data-traffic-howto>
      <summary className="cursor-pointer font-bold text-night">Как это работает</summary>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-slate-700">
        <li>Создайте ссылку: канал, название и метку (например, <code>tt_bio</code> для шапки TikTok, <code>ad_meta_nov</code> для рекламы).</li>
        <li>Поставьте её туда, откуда должны прийти люди. «В бота» — <code>t.me/{hints.bot}?start=метка</code>: человек увидит приветствие бота, и бот сможет присылать напоминания. «В приложение» — <code>t.me/{hints.bot}/{hints.app}?startapp=метка</code>: сразу открывается игра.</li>
        <li>Каждый человек считается один раз — по первому касанию. Если он сначала нашёл бота сам, а в первые сутки пришёл по ссылке, засчитывается ссылка.</li>
        <li>Метки работают и без ссылки в админке: всё, что начинается с <code>tt_</code>, — TikTok, <code>ig_</code> — Instagram, <code>tg_</code> — Telegram, <code>ad_</code> — реклама, <code>yt_</code> — YouTube. Приглашения друзей (<code>ref_…</code>) считаются сами.</li>
        <li>Укажите расход на ссылку — увидите цену одного пришедшего в злотых.</li>
      </ol>
    </details>
  );
}
