/**
 * «Ошибки в заданиях» (2026-11-14): игроки жалуются на задание прямо в уроке или миссии. Жалобы сгруппированы по заданию — чем больше,
 * тем выше. Статус группы: новые → в работе → исправлено / отклонено. Снимок задания (что видел игрок) и последний ответ сервер
 * сохранил в момент жалобы, поэтому видно, о чём речь, даже если текст урока потом поменяли.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from './api';
import { useFeedback } from './feedback';
import { Badge, Card, Empty, LoadError, PageHeader, Segmented, Skeleton, Time, useLoad } from './ui';

type Status = 'NEW' | 'REVIEW' | 'FIXED' | 'REJECTED';
type Group = {
  target: string;
  source: string;
  exerciseId: string | null;
  lessonSlug: string | null;
  itemType: string | null;
  status: Status;
  count: number;
  reasons: Record<string, number>;
  lastAt: string;
  note: string | null;
  snapshot: { type: string; where: string; title?: string; texts: string[]; options?: { text: string; correct?: boolean }[]; skill?: string } | null;
  comments: { reason: string; comment: string; lang: string | null; at: string; answer: unknown }[];
};

export const EXERCISE_REASON_RU: Record<string, string> = {
  answer_rejected: 'верный ответ не засчитан',
  answer_accepted: 'засчитан неверный ответ',
  polish_error: 'ошибка в польском',
  translation_error: 'ошибка в переводе',
  unclear: 'непонятное задание',
  too_easy: 'слишком лёгкое',
  audio: 'озвучка',
  other: 'другое',
};
const SOURCE_RU: Record<string, string> = { lesson: 'урок', practice: 'повторение', exam: 'экзамен', placement: 'входной тест', mission: 'миссия' };
const TONE: Record<Status, 'red' | 'gold' | 'green' | 'gray'> = { NEW: 'red', REVIEW: 'gold', FIXED: 'green', REJECTED: 'gray' };
const STATUS_RU: Record<Status, string> = { NEW: 'новая', REVIEW: 'в работе', FIXED: 'исправлено', REJECTED: 'отклонено' };

const plural = (n: number) => (n === 1 ? 'жалоба' : n >= 2 && n <= 4 ? 'жалобы' : 'жалоб');
const answerText = (a: unknown): string => {
  if (a == null) return '';
  const o = a as Record<string, unknown>;
  const body = o.optionId ?? o.text ?? (Array.isArray(o.tokens) ? (o.tokens as string[]).join(' ') : Array.isArray(o.pairs) ? JSON.stringify(o.pairs) : o.step !== undefined ? `шаг ${String(o.step)}: ${String(o.optionId ?? '')}` : o.skipped ? 'пропуск' : JSON.stringify(a));
  return `${String(body)}${o.correct === true ? ' (засчитан)' : o.correct === false ? ' (не засчитан)' : ''}`;
};

export function ExerciseReports({ onChange }: { onChange?: () => void }) {
  const [status, setStatus] = useState<Status>('NEW');
  const { data, error, reload } = useLoad<{ items: Group[] }>(() => api(`/exercise-reports?status=${status}`), [status]);
  const { run, ask } = useFeedback();
  const resolve = async (g: Group, to: Status) => {
    let note: string | undefined;
    if (to === 'FIXED' || to === 'REJECTED') {
      const text = await ask({
        title: to === 'FIXED' ? 'Задание исправлено' : 'Отклонить жалобы',
        body: to === 'FIXED' ? 'Коротко: что поправили (виден только админам).' : 'Почему задание остаётся как есть (виден только админам).',
        label: 'Заметка',
        confirm: to === 'FIXED' ? 'Исправлено' : 'Отклонить',
        optional: true,
      });
      if (text === null) return;
      note = text || undefined;
    }
    const ok = await run(() => api('/exercise-reports/resolve', { body: { target: g.target, status: to, note } }), to === 'REVIEW' ? 'Взято в работу' : to === 'FIXED' ? 'Отмечено исправленным' : 'Жалобы отклонены');
    if (ok) {
      reload();
      onChange?.();
    }
  };
  return (
    <div className="space-y-5">
      <PageHeader
        title="Ошибки в заданиях"
        subtitle="Игроки сообщают об ошибке прямо в уроке или миссии. Больше жалоб на одно задание — выше в списке. Открыть задание можно в редакторе упражнений."
        actions={
          <Segmented
            label="Статус"
            value={status}
            onChange={setStatus}
            options={[['NEW', 'Новые'], ['REVIEW', 'В работе'], ['FIXED', 'Исправлено'], ['REJECTED', 'Отклонено']]}
          />
        }
      />
      {error && <LoadError error={error} retry={reload} />}
      {!data ? (
        <Skeleton className="h-32" />
      ) : !data.items.length ? (
        <Empty>{status === 'NEW' ? 'Новых жалоб на задания нет.' : 'Здесь пока пусто.'}</Empty>
      ) : (
        <div className="space-y-3">
          {data.items.map((g) => (
            <Card key={g.target} data-exercise-report={g.target} bodyClass="space-y-3 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={TONE[g.status]}>{STATUS_RU[g.status]}</Badge>
                <span className="text-sm font-semibold text-night">
                  {g.count} {plural(g.count)}
                </span>
                <span className="text-sm text-slate-600">
                  · {SOURCE_RU[g.source] ?? g.source}
                  {g.lessonSlug ? ` ${g.lessonSlug}` : ''}
                  {g.itemType ? ` · ${g.itemType}` : ''} · последняя <Time v={g.lastAt} />
                </span>
                {g.exerciseId && (
                  <Link className="link ml-auto text-sm" to={`/r/exercises/${g.exerciseId}`}>
                    Открыть задание
                  </Link>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(g.reasons)
                  .sort((a, b) => b[1] - a[1])
                  .map(([r, n]) => (
                    <Badge key={r} tone="sky">
                      {EXERCISE_REASON_RU[r] ?? r} · {n}
                    </Badge>
                  ))}
              </div>
              {g.snapshot && (
                <div className="rounded-xl bg-slate-50 p-3 text-sm">
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">{g.snapshot.where === 'задание сейчас' ? 'Задание сейчас (снимок при жалобе пустой)' : 'Что видел игрок'}</div>
                  {g.snapshot.title && <div className="font-semibold text-night">{g.snapshot.title}</div>}
                  {g.snapshot.texts.map((t, i) => (
                    <div key={i} className="break-words text-slate-800">
                      {t}
                    </div>
                  ))}
                  {g.snapshot.options && (
                    <ul className="mt-1.5 space-y-0.5">
                      {g.snapshot.options.map((o, i) => (
                        <li key={i} className={o.correct ? 'font-semibold text-emerald-700' : 'text-slate-600'}>
                          {o.correct ? '✓' : '·'} {o.text}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              {g.comments.length === 0 && <div className="text-sm text-slate-500">Комментария нет — игрок выбрал только причину.</div>}
              {g.comments.length > 0 && (
                <ul className="space-y-1 text-sm">
                  {g.comments.map((c, i) => (
                    <li key={i} className="rounded-lg border border-line p-2">
                      <div className="text-xs text-slate-500">
                        {EXERCISE_REASON_RU[c.reason] ?? c.reason}
                        {c.lang ? ` · ${c.lang}` : ''} · <Time v={c.at} />
                      </div>
                      {c.comment && <div className="break-words text-slate-800">{c.comment}</div>}
                      {answerText(c.answer) && <div className="break-words text-xs text-slate-600">ответ игрока: {answerText(c.answer)}</div>}
                    </li>
                  ))}
                </ul>
              )}
              {g.note && <div className="text-sm text-slate-600">Заметка: {g.note}</div>}
              <div className="flex flex-wrap gap-2">
                {g.status === 'NEW' && (
                  <button className="btn-s" onClick={() => resolve(g, 'REVIEW')}>
                    Взять в работу
                  </button>
                )}
                {(g.status === 'NEW' || g.status === 'REVIEW') && (
                  <>
                    <button className="btn-p" onClick={() => resolve(g, 'FIXED')}>
                      Исправлено
                    </button>
                    <button className="btn-d" onClick={() => resolve(g, 'REJECTED')}>
                      Отклонить
                    </button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
