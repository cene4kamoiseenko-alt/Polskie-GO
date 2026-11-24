/**
 * «Карточки бота» (docs/superpowers/specs/2026-11-24-engagement-design.md): одно сообщение бота в день — возвращение, новичок, миссия
 * недели приходят вместо вопроса дня. Здесь: включить / выключить, «как увидит игрок» и «прислать себе», отчёт по видам со сторожем
 * «отпугиваем?» (выключили карточки и заблокировали бота за 48 часов), мост «вопрос дня → разминка», первый урок новичков.
 */
import { useState } from 'react';
import { api } from './api';
import { Funnel } from './charts';
import { useFeedback } from './feedback';
import { Badge, Card, DataTable, Empty, LoadError, PageHeader, Segmented, Skeleton, fmt, useLoad, type Col } from './ui';

type Kind = 'newcomer' | 'comeback' | 'mission';
type Lang = 'ru' | 'uk' | 'en';
type KindStats = { sent: number; delivered: number; opened: number; studiedSameDay: number; optedOut48h: number; blocked48h: number };
type Preview = { text: string; buttons: string[]; imageUrl: string };
type Overview = {
  state: { enabled: boolean };
  days: number;
  kinds: Record<Kind, KindStats>;
  bridge: { answered: number; warmupStarted: number; warmupFinished: number };
  firstLesson: { opened: number; answered1: number; reached4: number; finished: number; dropAt: { index: number; type: string; n: number }[] };
  previews: Record<Lang, Record<Kind, Preview>>;
};

const KINDS: { kind: Kind; title: string; when: string }[] = [
  { kind: 'comeback', title: 'Возвращение', when: 'на 7-й и 14-й день без занятий, подарок 50 злотков' },
  { kind: 'newcomer', title: 'Новичок', when: 'на 1-й и 3-й день, пока первый урок не пройден (не больше 2)' },
  { kind: 'mission', title: 'Миссия недели', when: 'по субботам — активным игрокам, которые 14 дней не открывали миссий' },
];
const TYPE_NAMES: Record<string, string> = {
  WORD_TRANSLATION: 'перевод слова', PICTURE_WORD: 'слово по картинке', LISTENING: 'аудирование', MATCH_PAIRS: 'пары', FILL_GAP: 'вставка слова',
  DICTATION: 'диктант', READING: 'чтение', SENTENCE_TRANSLATION: 'перевод предложения', BUILD_SENTENCE: 'сборка предложения', PRONUNCIATION: 'произношение',
  DIALOGUE: 'диалог', SITUATION: 'ситуация', WORD_ORDER: 'порядок слов', FIND_ERROR: 'найди ошибку', ODD_ONE_OUT: 'лишнее слово',
};
const pct = (a: number, b: number) => (b ? `${Math.round((a * 100) / b)} %` : '—');
/** Доля выключивших или заблокировавших бота выше 5 % — красным: карточки, похоже, отпугивают. */
const alarm = (a: number, b: number) => b > 0 && a / b > 0.05;
const TEST_KEY = 'pg_admin_test_recipient';
const readTest = () => {
  try {
    return localStorage.getItem(TEST_KEY) ?? '';
  } catch {
    return '';
  }
};
const saveTest = (v: string) => {
  try {
    localStorage.setItem(TEST_KEY, v);
  } catch {
    /* приватное окно */
  }
};

type Row = KindStats & { kind: Kind; title: string };

export function EngageCards({ superadmin }: { superadmin: boolean }) {
  const [days, setDays] = useState(30);
  const [lang, setLang] = useState<Lang>('ru');
  const { data: o, error, loading, reload } = useLoad(() => api<Overview>(`/engage?days=${days}`), [days]);
  const { confirm, run, ask, toast } = useFeedback();

  const setEnabled = async (enabled: boolean) => {
    const ok = await confirm(
      enabled
        ? { title: 'Включить карточки бота?', body: 'Человек по-прежнему получает одно сообщение в день: карточка приходит вместо вопроса дня. Тем, кто сегодня был в игре, карточки не приходят.', confirm: 'Включить' }
        : { title: 'Выключить карточки бота?', body: 'Со следующей минуты всем снова приходит только вопрос дня.', confirm: 'Выключить', danger: true },
    );
    if (ok && (await run(() => api('/engage/state', { method: 'PATCH', body: { enabled } }), enabled ? 'Карточки включены' : 'Карточки выключены'))) reload();
  };
  const sendMe = async (kind: Kind) => {
    let who = readTest();
    if (!who) {
      const v = await ask({ title: 'Прислать себе', label: 'Ваш Telegram ID или @username', confirm: 'Отправить', placeholder: '@username' });
      if (!v) return;
      who = v;
    }
    try {
      await api('/engage/test', { body: { who, kind, lang } });
      saveTest(who);
      toast('Карточка отправлена');
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  if (error) return <LoadError error={error} retry={reload} />;
  const rows: Row[] = o ? KINDS.map((k) => ({ ...o.kinds[k.kind], kind: k.kind, title: k.title })) : [];
  const cols: Col<Row>[] = [
    { key: 'title', label: 'Карточка', render: (r) => <b>{r.title}</b> },
    { key: 'sent', label: 'Отправлено', render: (r) => fmt(r.sent), align: 'right' },
    { key: 'delivered', label: 'Дошло', render: (r) => fmt(r.delivered), align: 'right' },
    { key: 'opened', label: 'Открыли', render: (r) => `${fmt(r.opened)} · ${pct(r.opened, r.delivered)}`, align: 'right' },
    { key: 'studied', label: 'Занимались в тот же день', render: (r) => `${fmt(r.studiedSameDay)} · ${pct(r.studiedSameDay, r.delivered)}`, align: 'right' },
    { key: 'opted', label: 'Выключили за 48 ч', render: (r) => <Badge tone={alarm(r.optedOut48h, r.delivered) ? 'red' : 'gray'}>{`${fmt(r.optedOut48h)} · ${pct(r.optedOut48h, r.delivered)}`}</Badge> },
    { key: 'blocked', label: 'Заблокировали за 48 ч', render: (r) => <Badge tone={alarm(r.blocked48h, r.delivered) ? 'red' : 'gray'}>{`${fmt(r.blocked48h)} · ${pct(r.blocked48h, r.delivered)}`}</Badge> },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Карточки бота"
        subtitle="Одно сообщение в день: возвращение, новичок или миссия недели приходят вместо вопроса дня"
        actions={<Segmented label="Период" value={days} onChange={setDays} options={[[7, '7 дней'], [30, '30 дней'], [90, '90 дней']]} />}
      />

      <Card title={o ? `Карточки бота: ${o.state.enabled ? 'включены' : 'выключены'}` : 'Карточки бота'} subtitle="Пока выключены, всем приходит только вопрос дня">
        {!o ? (
          <Skeleton className="h-10" />
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone={o.state.enabled ? 'green' : 'gray'} data-engage-state={o.state.enabled ? 'on' : 'off'}>
              {o.state.enabled ? 'Включены' : 'Выключены'}
            </Badge>
            {superadmin ? (
              <button className={o.state.enabled ? 'btn-d' : 'btn-p'} data-engage-toggle onClick={() => void setEnabled(!o.state.enabled)}>
                {o.state.enabled ? 'Выключить' : 'Включить'}
              </button>
            ) : (
              <span className="text-sm text-slate-400">Включает главный администратор</span>
            )}
          </div>
        )}
      </Card>

      <Card title="Как увидит игрок" subtitle="Образцы с примерными цифрами" actions={<Segmented label="Язык" value={lang} onChange={setLang} options={[['ru', 'RU'], ['uk', 'UK'], ['en', 'EN']]} />}>
        {!o ? (
          <Skeleton className="h-64" />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {KINDS.map((k) => {
              const pv = o.previews[lang][k.kind];
              return (
                <figure key={k.kind} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5" data-engage-preview={k.kind}>
                  <img src={pv.imageUrl} alt="" className="aspect-square w-full object-cover" loading="lazy" />
                  <figcaption className="space-y-2 p-3">
                    <div className="text-xs font-bold uppercase tracking-wide text-slate-400">{k.title}</div>
                    <p className="whitespace-pre-line text-sm leading-snug">{pv.text}</p>
                    <div className="space-y-1.5">
                      {pv.buttons.map((b) => (
                        <div key={b} className="rounded-lg bg-sky-500/15 px-2 py-1.5 text-center text-xs font-bold text-sky-200">
                          {b}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-400">Когда: {k.when}</p>
                    <button className="btn-s w-full" onClick={() => void sendMe(k.kind)}>
                      Прислать себе
                    </button>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        )}
      </Card>

      <Card title="Как сработали" subtitle={`за ${days} дн. · красным — больше 5 % выключили или заблокировали бота: стоит выключить и разобраться`} data-engage-kinds>
        <DataTable cols={cols} rows={o ? rows : null} rowKey={(r) => r.kind} loading={loading && !o} caption="Карточки бота по видам" />
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Мост: вопрос дня → разминка" subtitle="после ответа первая кнопка — разминка на 5 заданий в игре">
          {!o ? (
            <Skeleton className="h-32" />
          ) : o.bridge.answered ? (
            <Funnel
              steps={[
                { label: 'Ответили на вопрос дня', value: o.bridge.answered },
                { label: 'Открыли разминку', value: o.bridge.warmupStarted, base: o.bridge.answered },
                { label: 'Закончили разминку', value: o.bridge.warmupFinished, base: o.bridge.answered },
              ]}
            />
          ) : (
            <Empty>За период на вопрос дня ещё не отвечали.</Empty>
          )}
        </Card>
        <Card title="Первый урок новичков: где бросают" subtitle="первый урок зарегистрированных за период (новичку — короткая версия)">
          {!o ? (
            <Skeleton className="h-32" />
          ) : o.firstLesson.opened ? (
            <div className="space-y-3">
              <Funnel
                steps={[
                  { label: 'Открыли первый урок', value: o.firstLesson.opened },
                  { label: 'Ответили на 1-е задание', value: o.firstLesson.answered1, base: o.firstLesson.opened },
                  { label: 'Дошли до 4-го задания', value: o.firstLesson.reached4, base: o.firstLesson.opened },
                  { label: 'Закончили урок', value: o.firstLesson.finished, base: o.firstLesson.opened },
                ]}
              />
              {o.firstLesson.dropAt.length > 0 && (
                <div className="text-sm">
                  <div className="mb-1 font-bold">Чаще всего уходят</div>
                  <ul className="space-y-1 text-slate-300">
                    {o.firstLesson.dropAt.map((d) => (
                      <li key={`${d.index}-${d.type}`}>
                        на задании №{d.index + 1} ({TYPE_NAMES[d.type] ?? d.type}) — {fmt(d.n)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <Empty>За период новички ещё не открывали уроков.</Empty>
          )}
        </Card>
      </div>
    </div>
  );
}
