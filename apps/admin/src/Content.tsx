/**
 * Контент (города, маршруты, уроки, упражнения, слова, квесты, достижения, вещи, тарифы) — обновление 2026-11-13.
 * Список: статусы цветными метками, отбор по статусу и типу, поиск, страницы по 100. Редактор: подписи полей, понятные значения
 * в списках выбора, «Сохранить» внизу экрана всегда под рукой, предупреждение о несохранённых изменениях, удаление через подтверждение.
 */
import { useEffect, useId, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api, upload } from './api';
import { useFeedback } from './feedback';
import { EXERCISE_TEMPLATES, type Field as FieldDef, type ResourceDef } from './resources';
import { Badge, Card, DataTable, LoadError, PageHeader, Skeleton, cx, fmt, useLoad, type Col, type Tone } from './ui';

const get = (o: any, path: string) => path.split('.').reduce((a, k) => a?.[k], o);

const STATUS: Record<string, [string, Tone]> = { PUBLISHED: ['опубликовано', 'green'], DRAFT: ['черновик', 'gray'], REVIEW: ['на проверке', 'gold'], ARCHIVED: ['в архиве', 'gray'] };
/** Понятные подписи значений в списках выбора; само значение не меняется. */
const OPTION_RU: Record<string, string> = {
  PUBLISHED: 'опубликовано',
  DRAFT: 'черновик',
  REVIEW: 'на проверке',
  ARCHIVED: 'в архиве',
  LESSON: 'урок',
  BOSS: 'босс темы',
  EXAM: 'экзамен города',
  PLACEMENT: 'входной тест',
  DAILY: 'ежедневный',
  WEEKLY: 'недельный',
  STORY: 'сюжетный',
  EVENT: 'событие',
  common: 'обычная',
  rare: 'редкая',
  epic: 'эпическая',
  legendary: 'легендарная',
};
const FILTER_RU: Record<string, string> = { cityId: 'город', routeId: 'маршрут', lessonId: 'урок', questId: 'квест', kind: 'тип', status: 'статус', type: 'тип', cefr: 'уровень', slot: 'слот' };
/** Где сервер умеет искать (по slug / слову / названию по-польски). */
const SEARCHABLE = new Set(['cities', 'routes', 'lessons', 'vocabulary', 'quests', 'achievements', 'items']);
/** Вложенные списки: из строки родителя — к детям. */
const CHILDREN: Record<string, [string, string, (r: any) => boolean][]> = {
  cities: [['routes', 'маршруты', () => true]],
  routes: [['lessons', 'уроки', () => true]],
  lessons: [['exercises', 'упражнения', () => true]],
  quests: [['questSteps', 'этапы', (r) => r.kind === 'STORY']],
};
const CHILD_FILTER: Record<string, string> = { routes: 'cityId', lessons: 'routeId', exercises: 'lessonId', questSteps: 'questId' };
const PAGE = 100;

function Cell({ v, i18n }: { v: unknown; i18n?: boolean }) {
  if (v == null || v === '') return <span className="text-slate-400">—</span>;
  if (typeof v === 'string' && STATUS[v]) return <Badge tone={STATUS[v][1]}>{STATUS[v][0]}</Badge>;
  if (i18n && typeof v === 'object') return <>{(v as any).ru || (v as any).uk || ''}</>;
  if (typeof v === 'boolean') return v ? <span aria-label="да">✓</span> : <span className="text-slate-400" aria-label="нет">—</span>;
  if (Array.isArray(v)) return <>{v.join(', ')}</>;
  if (typeof v === 'object') return <span className="font-mono text-xs text-slate-500">{JSON.stringify(v).slice(0, 80)}</span>;
  // Тип урока или квеста (LESSON, DAILY…) — словом; типы упражнений (WORD_TRANSLATION…) остаются как есть: их знают редакторы.
  return <>{typeof v === 'string' && /^[A-Z]+$/.test(v) && OPTION_RU[v] ? OPTION_RU[v] : String(v)}</>;
}

export function ResourceList({ def }: { def: ResourceDef }) {
  const [params, setParams] = useSearchParams();
  const qs = params.toString();
  const skip = Number(params.get('skip') ?? 0) || 0;
  const { data, error, loading, reload } = useLoad<{ items: any[]; total: number }>(() => api(`/resources/${def.name}?take=${PAGE}&${qs}`), [def.name, qs]);
  const [search, setSearch] = useState(params.get('search') ?? '');
  useEffect(() => setSearch(params.get('search') ?? ''), [def.name]); // eslint-disable-line react-hooks/exhaustive-deps
  const setParam = (k: string, v: string | null) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    next.delete('skip');
    setParams(next);
  };
  const setSkip = (n: number) => {
    const next = new URLSearchParams(params);
    if (n > 0) next.set('skip', String(n));
    else next.delete('skip');
    setParams(next);
  };
  const idOf = (r: any) => r[def.idField ?? 'id'];
  // Отбор по полю-списку (статус, тип, уровень, слот) — выпадающим списком; по родителю (город, урок…) — меткой с крестиком.
  const selectFilters = (def.filters ?? []).map((k) => def.fields.find((f) => f.name === k)).filter((f): f is Extract<FieldDef, { type: 'select' }> => f?.type === 'select');
  const refFilters = (def.filters ?? []).filter((k) => params.get(k) && !selectFilters.some((f) => f.name === k));
  const childOf = CHILD_FILTER[def.name];
  const parentName = childOf && data?.items[0] ? (get(data.items[0], 'city.namePl') ?? get(data.items[0], 'route.slug')) : null;

  const cols: Col<any>[] = [
    ...def.columns.map(
      (c, i): Col<any> => ({
        key: c.key,
        label: c.label || <span className="sr-only">Значок</span>,
        className: cx('max-w-xs truncate', i === 0 && 'font-semibold'),
        render: (r) =>
          // Первая содержательная колонка — ссылка на запись: удобно открыть щелчком по названию.
          i === def.columns.findIndex((x) => x.label) ? (
            <Link className="link" to={`/r/${def.name}/${idOf(r)}`}>
              <Cell v={get(r, c.key)} i18n={c.i18n} />
            </Link>
          ) : (
            <Cell v={get(r, c.key)} i18n={c.i18n} />
          ),
      }),
    ),
    {
      key: '_actions',
      label: <span className="sr-only">Действия</span>,
      className: 'whitespace-nowrap text-right',
      render: (r) => (
        <span className="inline-flex items-center gap-3">
          {(CHILDREN[def.name] ?? [])
            .filter(([, , show]) => show(r))
            .map(([child, label]) => (
              <Link key={child} className="link" to={`/r/${child}?${CHILD_FILTER[child]}=${r.id}`}>
                {label}
                {child === 'lessons' && r._count?.lessons != null ? ` (${r._count.lessons})` : child === 'exercises' && r._count?.exercises != null ? ` (${r._count.exercises})` : ''}
              </Link>
            ))}
          <Link className="link" to={`/r/${def.name}/${idOf(r)}`}>
            изменить
          </Link>
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title={def.title}
        subtitle={data ? `${fmt(data.total)} ${data.total === 1 ? 'запись' : 'записей'}${parentName ? ` · ${FILTER_RU[childOf] ?? ''} ${parentName}` : ''}` : undefined}
        actions={
          <Link className="btn-p" to={`/r/${def.name}/new${qs ? `?${qs}` : ''}`}>
            + Добавить
          </Link>
        }
      />
      <Card bodyClass="p-0" data-resource-list={def.name}>
        <div className="flex flex-wrap items-end gap-3 border-b border-line p-4">
          {SEARCHABLE.has(def.name) && (
            <form
              role="search"
              className="flex items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                setParam('search', search.trim() || null);
              }}
            >
              <label className="text-xs font-semibold text-slate-600">
                Поиск
                <input className="inp mt-1 w-56" type="search" placeholder="slug или слово" value={search} onChange={(e) => setSearch(e.target.value)} />
              </label>
              <button className="btn-s">Найти</button>
            </form>
          )}
          {selectFilters.map((f) => (
            <label key={f.name} className="text-xs font-semibold text-slate-600">
              {FILTER_RU[f.name] ?? f.label}
              <select className="inp mt-1 min-w-36" value={params.get(f.name) ?? ''} onChange={(e) => setParam(f.name, e.target.value || null)}>
                <option value="">все</option>
                {f.options.map((o) => (
                  <option key={o} value={o}>
                    {OPTION_RU[o] ?? o}
                  </option>
                ))}
              </select>
            </label>
          ))}
          {refFilters.map((k) => (
            <span key={k} className="chip chip-on">
              {FILTER_RU[k] ?? k}: {k === childOf && parentName ? parentName : 'выбран'}
              <button className="ml-1 rounded-full px-1 hover:bg-white/20" aria-label={`Убрать отбор: ${FILTER_RU[k] ?? k}`} onClick={() => setParam(k, null)}>
                ✕
              </button>
            </span>
          ))}
          {[...params.keys()].some((k) => k !== 'skip') && (
            <button className="btn-s" onClick={() => (setSearch(''), setParams({}))}>
              Сбросить всё
            </button>
          )}
        </div>
        {error && (
          <div className="p-4">
            <LoadError error={error} retry={reload} />
          </div>
        )}
        <DataTable cols={cols} rows={data?.items} loading={loading} rowKey={(r) => idOf(r)} empty="Ничего не найдено" caption={def.title} />
        {data && data.total > PAGE && (
          <nav className="flex flex-wrap items-center justify-between gap-2 border-t border-line p-3 text-sm" aria-label="Страницы">
            <span className="text-slate-500">
              {fmt(skip + 1)}–{fmt(Math.min(skip + PAGE, data.total))} из {fmt(data.total)}
            </span>
            <span className="flex gap-2">
              <button className="btn-s" disabled={skip === 0} onClick={() => setSkip(Math.max(0, skip - PAGE))}>
                ← Назад
              </button>
              <button className="btn-s" disabled={skip + PAGE >= data.total} onClick={() => setSkip(skip + PAGE)}>
                Дальше →
              </button>
            </span>
          </nav>
        )}
      </Card>
    </div>
  );
}

// ───────────── Редактор записи ─────────────

const LANG_LABEL: [string, string][] = [
  ['uk', 'Українська'],
  ['ru', 'Русский'],
  ['en', 'English'],
];

function I18nInput({ id, value, onChange, multiline }: { id: string; value: any; onChange: (v: any) => void; multiline?: boolean }) {
  const v = value ?? {};
  return (
    <div className="grid gap-2 md:grid-cols-3" role="group" aria-labelledby={`${id}-label`}>
      {LANG_LABEL.map(([l, name]) => (
        <label key={l} className="text-xs font-semibold text-slate-500">
          {name}
          {l === 'uk' && <span className="text-[#b42336]"> *</span>}
          {multiline ? (
            <textarea className="inp mt-1 min-h-24" value={v[l] ?? ''} onChange={(e) => onChange({ ...v, [l]: e.target.value })} />
          ) : (
            <input className="inp mt-1" value={v[l] ?? ''} onChange={(e) => onChange({ ...v, [l]: e.target.value })} />
          )}
        </label>
      ))}
    </div>
  );
}

function RefSelect({ id, field, value, onChange }: { id: string; field: Extract<FieldDef, { type: 'ref' }>; value: any; onChange: (v: any) => void }) {
  const { data } = useLoad<{ items: any[] }>(() => api(`/resources/${field.resource}?take=500`), [field.resource]);
  return (
    <select id={id} className="inp" value={value ?? ''} onChange={(e) => onChange(e.target.value || null)}>
      {field.nullable !== false && <option value="">— не выбрано —</option>}
      {!data && value && <option value={value}>загрузка…</option>}
      {data?.items.map((r) => (
        <option key={r.id} value={r.id}>
          {get(r, field.display)}
        </option>
      ))}
    </select>
  );
}

function JsonInput({ id, value, onChange }: { id: string; value: any; onChange: (v: any) => void }) {
  const [text, setText] = useState(() => JSON.stringify(value ?? null, null, 2));
  const [err, setErr] = useState('');
  return (
    <div>
      <textarea
        id={id}
        spellCheck={false}
        aria-invalid={!!err}
        aria-describedby={err ? `${id}-err` : undefined}
        className={cx('inp min-h-48 font-mono text-xs leading-relaxed', err && '!border-[#c9334a]')}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          try {
            onChange(JSON.parse(e.target.value));
            setErr('');
          } catch (x) {
            setErr((x as Error).message);
          }
        }}
      />
      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs">
        {err ? (
          <span id={`${id}-err`} className="text-[#b42336]">
            Ошибка в JSON: {err}
          </span>
        ) : (
          <span className="text-slate-500">JSON без ошибок</span>
        )}
        <button type="button" className="link" disabled={!!err} onClick={() => setText(JSON.stringify(JSON.parse(text), null, 2))}>
          выровнять
        </button>
      </div>
    </div>
  );
}

function FieldInput({ id, field, value, onChange }: { id: string; field: FieldDef; value: any; onChange: (v: any) => void }) {
  switch (field.type) {
    case 'text':
      return <input id={id} className="inp" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
    case 'textarea':
      return <textarea id={id} className="inp min-h-24" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
    case 'number':
      return <input id={id} className="inp max-w-40" type="number" value={value ?? 0} onChange={(e) => onChange(Number(e.target.value))} />;
    case 'bool':
      return (
        <label className="inline-flex items-center gap-2 pt-2 text-sm">
          <input id={id} type="checkbox" className="h-5 w-5 accent-[#127a53]" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
          {value ? 'да' : 'нет'}
        </label>
      );
    case 'select':
      return (
        <select id={id} className="inp max-w-72" value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
          {field.options.map((o) => (
            <option key={o} value={o}>
              {OPTION_RU[o] ? `${OPTION_RU[o]} (${o})` : o}
            </option>
          ))}
        </select>
      );
    case 'i18n':
      return <I18nInput id={id} value={value} onChange={onChange} multiline={field.name === 'explanation' || field.name === 'description'} />;
    case 'tags':
      return <input id={id} className="inp" value={(value ?? []).join(', ')} onChange={(e) => onChange(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} />;
    case 'ref':
      return <RefSelect id={id} field={field} value={value} onChange={onChange} />;
    case 'asset':
      return (
        <div className="flex flex-wrap items-center gap-2">
          <input id={id} className="inp min-w-0 flex-1" value={value ?? ''} onChange={(e) => onChange(e.target.value || null)} placeholder="/uploads/…" />
          <label className="btn-s cursor-pointer whitespace-nowrap">
            ⬆ Загрузить файл
            <input type="file" accept="image/*,audio/*,application/json" className="sr-only" onChange={async (e) => e.target.files?.[0] && onChange(await upload(e.target.files[0]))} />
          </label>
          {value && /\.(png|jpe?g|webp|gif)$/.test(String(value)) && <img src={value} className="h-12 w-12 rounded-lg object-cover ring-1 ring-line" alt="Загруженное изображение" />}
          {value && /\.(mp3|ogg|wav|webm)$/.test(String(value)) && <audio src={value} controls className="h-9" />}
        </div>
      );
    case 'json':
      return <JsonInput id={id} value={value} onChange={onChange} />;
  }
}

export function ResourceEdit({ def }: { def: ResourceDef }) {
  const { id } = useParams();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const { run, confirm, toast } = useFeedback();
  const uid = useId();
  const isNew = id === 'new';
  const [form, setForm] = useState<Record<string, any> | null>(null);
  const [saved, setSaved] = useState('');
  const [loadErr, setLoadErr] = useState('');
  const [key, setKey] = useState(0);
  const [busy, setBusy] = useState(false);

  // Опоздавший ответ (переход на другую запись, повторный запуск эффекта) не должен затирать форму, которую уже правят.
  useEffect(() => {
    let live = true;
    setForm(null);
    setLoadErr('');
    if (isNew) {
      const pre = Object.fromEntries([...params.entries()].filter(([k]) => def.filters?.includes(k)));
      const f = { ...def.defaults, ...pre };
      setForm(f);
      setSaved(JSON.stringify(f));
    } else
      api(`/resources/${def.name}/${id}`)
        .then((f) => {
          if (!live) return;
          setForm(f);
          setSaved(JSON.stringify(f));
        })
        .catch((e) => live && setLoadErr(e.message));
    return () => {
      live = false;
    };
  }, [id, def]); // eslint-disable-line react-hooks/exhaustive-deps

  const dirty = useMemo(() => !!form && JSON.stringify(form) !== saved, [form, saved]);
  // Закрыть вкладку с несохранёнными изменениями — браузер переспросит.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  if (loadErr) return <LoadError error={loadErr} />;
  if (!form) return <Skeleton className="h-96" />;
  const set = (name: string, v: any) => setForm((f) => ({ ...f!, [name]: v }));
  const payload = () => {
    const out: Record<string, any> = {};
    for (const f of def.fields) {
      let v = form[f.name];
      if (f.type === 'i18n' && v && !v.uk) v = f.name === 'explanation' && def.name === 'exercises' ? null : v;
      out[f.name] = v ?? (f.type === 'i18n' ? null : v);
    }
    return out;
  };
  const save = async () => {
    setBusy(true);
    let created: any = null;
    const ok = await run(async () => {
      created = isNew ? await api(`/resources/${def.name}`, { body: payload() }) : await api(`/resources/${def.name}/${id}`, { method: 'PATCH', body: payload() });
    }, 'Сохранено');
    setBusy(false);
    if (!ok) return;
    setSaved(JSON.stringify(form));
    if (isNew && created) nav(`/r/${def.name}/${created[def.idField ?? 'id']}`, { replace: true });
  };
  const remove = async () => {
    if (!(await confirm({ title: 'Удалить запись?', body: 'Удаление нельзя отменить. Если запись нужна позже, лучше поставьте статус «в архиве».', confirm: 'Удалить', danger: true }))) return;
    if (await run(() => api(`/resources/${def.name}/${id}`, { method: 'DELETE' }), 'Запись удалена')) nav(`/r/${def.name}`, { replace: true });
  };
  const back = async () => {
    if (dirty && !(await confirm({ title: 'Уйти без сохранения?', body: 'Изменения на этой странице пропадут.', confirm: 'Уйти', danger: true }))) return;
    nav(-1);
  };
  const title = isNew ? 'Новая запись' : String(form.namePl ?? form.slug ?? form.pl ?? form.code ?? form.title?.ru ?? form.title?.uk ?? form.title ?? 'Запись');
  const statusTag = form.status && STATUS[form.status];

  return (
    <div className="max-w-5xl space-y-5 pb-24">
      <div>
        <button className="link text-sm" onClick={back}>
          ← {def.title}
        </button>
      </div>
      <PageHeader
        title={title}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            {def.title}
            {statusTag && <Badge tone={statusTag[1]}>{statusTag[0]}</Badge>}
          </span>
        }
        actions={
          !isNew &&
          (CHILDREN[def.name] ?? [])
            .filter(([, , show]) => show(form))
            .map(([child, label]) => (
              <Link key={child} className="btn-s" to={`/r/${child}?${CHILD_FILTER[child]}=${id}`}>
                {label[0].toUpperCase() + label.slice(1)} →
              </Link>
            ))
        }
      />
      {def.name === 'exercises' && (
        <div className="panel flex flex-wrap items-center gap-3 border-sky/30 bg-sky-soft/40 p-4 text-sm">
          <span>
            <b>Шаблон данных</b> для типа <span className="font-mono">{form.type}</span>: заполненный пример, чтобы не писать JSON с нуля.
          </span>
          <button
            type="button"
            className="btn-s"
            onClick={async () => {
              if (form.data && Object.keys(form.data).length && !(await confirm({ title: 'Заменить данные шаблоном?', body: 'Текущие данные упражнения пропадут.', confirm: 'Заменить' }))) return;
              set('data', EXERCISE_TEMPLATES[form.type] ?? {});
              setKey((k) => k + 1);
              toast('Шаблон вставлен — замените примеры своими словами');
            }}
          >
            Вставить шаблон
          </button>
          <span className="text-xs text-slate-600">Правильный ответ хранится в данных и не уходит игроку до проверки.</span>
        </div>
      )}
      <Card bodyClass="divide-y divide-line" key={key} data-resource-edit={def.name}>
        {def.fields.map((f) => {
          const fid = `${uid}-${f.name}`;
          return (
            <div key={f.name} className="grid gap-1.5 px-5 py-4 md:grid-cols-[220px_1fr] md:items-start md:gap-4">
              <label id={`${fid}-label`} htmlFor={f.type === 'i18n' ? undefined : fid} className="text-sm font-semibold text-slate-700 md:pt-2">
                {f.label}
              </label>
              <FieldInput id={fid} field={f} value={form[f.name]} onChange={(v) => set(f.name, v)} />
            </div>
          );
        })}
      </Card>
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-white/95 px-4 py-3 shadow-[0_-8px_24px_-12px_rgb(16_24_40/0.2)] backdrop-blur md:left-60">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3">
          <button className="btn-p" disabled={busy || (!dirty && !isNew)} onClick={save} data-save>
            {busy ? 'Сохранение…' : isNew ? 'Создать' : 'Сохранить'}
          </button>
          {!isNew && (
            <button className="btn-s text-[#b42336]" onClick={remove}>
              Удалить
            </button>
          )}
          <span className="text-sm text-slate-500" aria-live="polite">
            {dirty ? 'Есть несохранённые изменения' : isNew ? '' : 'Все изменения сохранены'}
          </span>
        </div>
      </div>
    </div>
  );
}
