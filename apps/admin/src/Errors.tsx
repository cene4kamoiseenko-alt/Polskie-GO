/**
 * Журнал ошибок (обновление админки 2026-11-12): сервер, Mini App у игроков, нарушения CSP — за сутки, неделю или месяц, с отбором по виду.
 * Для уже разобранных записей — короткое пояснение, что это и опасно ли; кнопка «Скопировать» — чтобы переслать запись разработчику целиком.
 */
import { useState } from 'react';
import { api } from './api';
import { Card, Empty, PageHeader, Segmented, cx, fmt, useLoad } from './ui';

type Item = { kind: 'server' | 'client' | 'csp'; message: string; path: string | null; count: number; lastAt: string; detail: string | null };
type Data = { hours: number; total: Record<string, number>; items: Item[] };

const KIND: Record<string, [string, string]> = { server: ['Сервер', 'badge-red'], client: ['Приложение', 'badge-gold'], csp: ['Безопасность (CSP)', 'badge-sky'] };

/**
 * Пояснения к записям, которые уже разобраны. Неизвестная запись — без пояснения: её стоит переслать разработчику.
 * `fixedAt` — когда исправление уже точно у игроков (выкладка плюс запас на открытые старые вкладки). Запись свежее этого момента —
 * значит, исправление помогло не до конца: вместо «исправлено» показываем предупреждение.
 */
type Known = { test: (e: Item) => boolean; tone: 'ok' | 'info'; text: string; fixedAt?: string };
const KNOWN: Known[] = [
  { test: (e) => e.message.startsWith('wrong_step'), tone: 'ok', fixedAt: '2026-11-12T03:00:00Z', text: 'Повторный тап в диалоге урока. Исправлено 12.11.2026: кнопки блокируются до следующей реплики.' },
  { test: (e) => e.kind === 'csp' && e.message.startsWith('media-src data'), tone: 'ok', fixedAt: '2026-11-10T06:00:00Z', text: 'Тихий звук, которым приложение «будит» динамик на iPhone. Политика исправлена 10.11.2026.' },
  { test: (e) => e.kind === 'csp' && e.message.startsWith('img-src https://t.me'), tone: 'info', text: 'Фото профиля из Telegram: t.me перенаправляет картинку на свой CDN. Безвредно — фото показывается (CSP пока только сообщает). Нужен адрес CDN, чтобы добавить его в политику.' },
  { test: (e) => /network_error|Failed to fetch|Load failed|NetworkError/i.test(e.message), tone: 'info', text: 'Обрыв связи у игрока (метро, плохая сеть). Обычно это не ошибка приложения; тревожно, только если записей вдруг стало много.' },
  { test: (e) => /dynamically imported module|ChunkLoadError|Importing a module script failed/i.test(e.message), tone: 'info', text: 'Игрок открыл старую версию приложения сразу после выкладки. Проходит после перезапуска Mini App.' },
];

const TONE = { ok: ['✓ ', 'bg-brand-soft text-[#13784f]'], info: ['ℹ︎ ', 'bg-sky-soft text-[#0f6aa6]'], warn: ['⚠︎ ', 'bg-coral-soft text-[#b42336]'] } as const;

function Hint({ e }: { e: Item }) {
  const k = KNOWN.find((x) => x.test(e));
  if (!k) return null;
  const again = k.fixedAt !== undefined && Date.parse(e.lastAt) > Date.parse(k.fixedAt);
  const [mark, cls] = TONE[again ? 'warn' : k.tone];
  return (
    <p className={cx('mt-2 rounded-lg px-3 py-2 text-xs', cls)} data-error-hint={again ? 'again' : k.tone}>
      {mark}
      {again ? `${k.text} Но эта запись появилась уже после исправления — скопируйте её и перешлите разработчику.` : k.text}
    </p>
  );
}

function CopyButton({ e }: { e: Item }) {
  const [done, setDone] = useState(false);
  const text = [`${KIND[e.kind]?.[0] ?? e.kind}: ${e.message}`, e.path ?? '', e.detail ?? '', `${e.count} раз, последняя ${new Date(e.lastAt).toLocaleString('ru-RU')}`].filter(Boolean).join('\n');
  return (
    <button
      type="button"
      className="btn-s !px-2.5 !py-1 text-xs"
      aria-label="Скопировать запись целиком"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {
          prompt('Скопируйте текст ошибки', text);
        }
      }}
    >
      {done ? '✓ Скопировано' : 'Скопировать'}
    </button>
  );
}

export default function Errors() {
  const [hours, setHours] = useState(24);
  const [kind, setKind] = useState<'all' | 'server' | 'client' | 'csp'>('all');
  const { data, error, loading } = useLoad<Data>(() => api(`/errors?hours=${hours}&kind=${kind}`), [hours, kind]);
  const sum = data ? data.total.server + data.total.client + data.total.csp : 0;
  return (
    <div className="space-y-5">
      <PageHeader
        title="Ошибки"
        subtitle="Сбои сервера, ошибки приложения у игроков и нарушения политики безопасности. Повторы склеиваются, записи хранятся 30 дней."
        actions={
          <>
            <Segmented label="Период" value={hours} onChange={setHours} options={[[24, 'Сутки'], [168, 'Неделя'], [720, 'Месяц']]} />
            <Segmented label="Вид" value={kind} onChange={setKind} options={[['all', 'Все'], ['server', 'Сервер'], ['client', 'Приложение'], ['csp', 'Безопасность']]} />
          </>
        }
      />
      {error && <p className="rounded-xl bg-coral-soft px-4 py-3 text-sm text-[#b42336]">{error}</p>}
      {data && (
        <div className="flex flex-wrap gap-2 text-sm" data-error-totals>
          <span className="badge badge-red">сервер {fmt(data.total.server)}</span>
          <span className="badge badge-gold">приложение {fmt(data.total.client)}</span>
          <span className="badge badge-sky">безопасность {fmt(data.total.csp)}</span>
          {!sum && <span className="badge badge-green">за этот период ошибок нет</span>}
        </div>
      )}
      <Card bodyClass="divide-y divide-line" className={loading && data ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
        {loading && !data && <p className="p-4 text-sm text-slate-500">Загрузка…</p>}
        {data && !data.items.length && (
          <div className="p-4">
            <Empty>Записей нет</Empty>
          </div>
        )}
        {data?.items.map((e, i) => (
          <article key={`${e.kind}-${e.message}-${i}`} className="p-4" data-error-row>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <span className={cx('badge', KIND[e.kind]?.[1] ?? 'badge-gray')}>{KIND[e.kind]?.[0] ?? e.kind}</span>
                <code className="break-all font-mono text-[13px] font-semibold text-night">{e.message}</code>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="badge badge-gray">×{e.count}</span>
                <span>{new Date(e.lastAt).toLocaleString('ru-RU')}</span>
                <CopyButton e={e} />
              </div>
            </div>
            {e.path && <div className="mt-1 text-xs text-slate-500">где: {e.path}</div>}
            <Hint e={e} />
            {e.detail && (
              <details className="mt-2">
                <summary className="cursor-pointer text-xs font-semibold text-slate-500">подробности</summary>
                <pre className="mt-1 overflow-x-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-2 text-[11px] text-slate-600">{e.detail}</pre>
              </details>
            )}
          </article>
        ))}
      </Card>
    </div>
  );
}
