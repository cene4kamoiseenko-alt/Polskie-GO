/**
 * Навчальний контент → SQL для D1 (`wrangler d1 execute --file seed.sql`).
 * За замовчуванням додає лише відсутні записи (не перезаписує правки з адмінки).
 * З `force: true` оновлює існуючий контент з репозиторію.
 * Зв'язки задаються підзапитами за slug, тож seed працює і з рядками, створеними в адмінці.
 */
import { DEFAULT_REWARDS } from '@polski-go/shared';
import { resetIds } from './builders';
import { CONTINUATION_TEXT_FIXES } from './continuation-fixes';
import { EXERCISE_FIXES } from './exercise-fixes';
import { LESSON_EDITS, TASK_EDITS } from './task-edits';
import { LESSON_MOVES, ROUTE_ICON_FIXES, TEXT_FIXES } from './fixes';
import { CITIES, REMOVED_CITIES, project } from './cities';
import { VOCAB } from './vocab';
import { VOCAB_FIXES } from './vocab-fixes';
import { CITY_PLANS, STANDARD_CITIES, keptIndexes } from './city-standard';
import { POZNAN } from './poznan';
import { ZIELONA_GORA } from './zielona-gora';
import { GORZOW } from './gorzow';
import { SZCZECIN } from './szczecin';
import { GDANSK } from './gdansk';
import { GDYNIA } from './gdynia';
import { PLACEMENT, EXAM_A1 } from './exams';
import { ACHIEVEMENTS, DAILY_QUESTS, ITEMS, STORY_QUESTS, WEEKLY_QUESTS } from './gamification';
import { MISSIONS } from './missions';
import type { CityContent, LessonSeed } from './types';

/** Міста з уроками за стандартом (city-standard.ts): 8 уроків та іспит, по 12 завдань. */
export const CITY_CONTENT: CityContent[] = [...STANDARD_CITIES, POZNAN, ZIELONA_GORA, GORZOW, SZCZECIN, GDANSK, GDYNIA];
/** Ті самі міста до стандарту — лише для тестів міграції (БД, засіяна до скорочення міст). */
export const PRE_STANDARD_CONTENT: CityContent[] = CITY_PLANS.map(([full]) => full);

/** Нагороди за іспит міста, додані після запуску: [місто, предмет]. Ті, хто вже склав іспит, теж їх отримують. */
const LATE_CITY_REWARDS: [string, string][] = [['wroclaw', 'costume-krasnal']];

type Value = string | number | boolean | null | undefined | object | Raw;
class Raw {
  constructor(public sql: string) {}
}
const raw = (s: string) => new Raw(s);

/** SQL-літерал (рядки екрануються, об'єкти — JSON). */
export function lit(v: Value): string {
  if (v instanceof Raw) return v.sql;
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'boolean') return v ? '1' : '0';
  if (typeof v === 'number') {
    if (!Number.isFinite(v)) throw new Error(`bad number ${v}`);
    return String(v);
  }
  const s = typeof v === 'string' ? v : JSON.stringify(v);
  return `'${s.replace(/'/g, "''")}'`;
}

function hash(s: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < s.length; i++) {
    h1 = Math.imul(h1 ^ s.charCodeAt(i), 16777619);
    h2 = Math.imul(h2 ^ s.charCodeAt(i), 2246822519);
  }
  return (h1 >>> 0).toString(36) + (h2 >>> 0).toString(36);
}

const ref = (table: string, where: Record<string, Value>) =>
  raw(`(SELECT id FROM ${table} WHERE ${Object.entries(where).map(([k, v]) => `${k} = ${lit(v)}`).join(' AND ')})`);

/** INSERT з обробкою конфлікту: ігнорувати (за замовчуванням) або оновити (force). */
function insert(table: string, row: Record<string, Value>, conflict: string[], force: boolean, keepOnUpdate: string[] = []) {
  const cols = Object.keys(row);
  const values = cols.map((c) => lit(row[c])).join(', ');
  const head = `INSERT INTO ${table} (${cols.map((c) => `"${c}"`).join(', ')}) VALUES (${values})`;
  if (!force) return `${head} ON CONFLICT DO NOTHING;`;
  const updates = cols.filter((c) => c !== 'id' && !conflict.includes(c) && !keepOnUpdate.includes(c)).map((c) => `"${c}" = excluded."${c}"`);
  return `${head} ON CONFLICT (${conflict.map((c) => `"${c}"`).join(', ')}) DO ${updates.length ? `UPDATE SET ${updates.join(', ')}` : 'NOTHING'};`;
}

/**
 * Учень склав іспит міста, коли далі не було міст з уроками: наступне місто відкрилося як «скоро», а поточним лишилося
 * пройдене (completeCity не переносить на місто без уроків). Коли в найближчому відкритому непройденому місті з'являються уроки,
 * переносимо поточне місто туди. Ідемпотентно: зачіпає лише тих, у кого поточне місто пройдене і таке місто попереду є.
 */
const NEXT_OPEN_CITY = `(SELECT c.id FROM user_cities uc JOIN cities c ON c.id = uc.city_id
  WHERE uc.user_id = player_progress.user_id AND uc.boss_passed_at IS NULL AND c.status = 'PUBLISHED'
    AND c."order" > (SELECT cur."order" FROM cities cur WHERE cur.id = player_progress.current_city_id)
    AND EXISTS (SELECT 1 FROM lessons l JOIN city_routes r ON r.id = l.route_id WHERE r.city_id = c.id AND l.status = 'PUBLISHED' AND r.status = 'PUBLISHED')
  ORDER BY c."order" LIMIT 1)`;
export const STRANDED_CURRENT_CITY_SQL = `UPDATE player_progress SET current_city_id = ${NEXT_OPEN_CITY}
WHERE EXISTS (SELECT 1 FROM user_cities d WHERE d.user_id = player_progress.user_id AND d.city_id = player_progress.current_city_id AND d.boss_passed_at IS NOT NULL)
  AND ${NEXT_OPEN_CITY} IS NOT NULL;`.replace(/\s+/g, ' ');

const exerciseId = (lessonSlug: string, n: number) => `e_${hash(lessonSlug)}_${n}`;
/** Сталий id завдання уроку (для інструментів правок, scripts/task-edits.ts). */
export const exerciseKey = exerciseId;

/** Рядок вправи: ідентифікатор за сталим номером (exerciseIds), позиція — за порядком в уроці. */
function exerciseSql(lessonSlug: string, l: LessonSeed, i: number, force: boolean) {
  const ex = l.exercises[i];
  return insert(
    'exercises',
    { id: exerciseId(lessonSlug, l.exerciseIds?.[i] ?? i), lesson_id: ref('lessons', { slug: lessonSlug }), order: i, type: ex.type, skill: ex.skill, data: ex.data, explanation: ex.explanation ?? null },
    ['lesson_id', 'order'],
    force,
  );
}

/** Архівний урок для завдань, прибраних зі скорочених уроків: поза картою (без теми) і поза практикою (ARCHIVED). */
export const TASK_ARCHIVE = 'archiwum-zadan';
/** Позиція прибраного завдання в архівному уроці: стала для пари (урок, номер) і не залежить від складу плану. */
export function archiveOrder(lessonSlug: string, n: number): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < lessonSlug.length; i++) h = Math.imul(h ^ lessonSlug.charCodeAt(i), 16777619);
  return ((h >>> 0) % 1_000_000) * 100 + n;
}

/**
 * Скорочення міст до стандарту (city-standard.ts) на наявній БД. Нічого не видаляє й повторно нічого не змінює:
 * теми й уроки поза планом — ARCHIVED; зайві завдання уроку — до архівного уроку; решта завдань — на позиції 0…11 за порядком;
 * нові завдання скорочених уроків вставляються вже після звільнення позицій; квиток міста — не більше нової кількості уроків.
 */
export function standardSql(): string[] {
  const out: string[] = [];
  const archive = ref('lessons', { slug: TASK_ARCHIVE }).sql;
  out.push(
    insert(
      'lessons',
      {
        id: `l_${TASK_ARCHIVE}`, slug: TASK_ARCHIVE, order: 0, kind: 'LESSON',
        title: { uk: 'Архів завдань', ru: 'Архив заданий', en: 'Task archive' },
        topic: { uk: 'Завдання, прибрані з уроків за стандартом міста', ru: 'Задания, убранные из уроков по стандарту города', en: 'Tasks removed from lessons by the city standard' },
        cefr: 'A1', difficulty: 1,
        explanation: { uk: 'Службовий урок: не показується учням.', ru: 'Служебный урок: ученикам не показывается.', en: 'Service lesson: never shown to learners.' },
        examples: [], status: 'ARCHIVED', route_id: null,
      },
      ['slug'],
      false,
    ),
  );
  for (const [full, plan] of CITY_PLANS) {
    // Порядок архівних тем — поза номерами 1…n (унікальний індекс міста), після зсуву на +2000 у циклі міст.
    full.routes.filter((r) => !plan.routes.includes(r.slug)).forEach((r, i) => {
      out.push(`UPDATE city_routes SET status = 'ARCHIVED', "order" = ${1000 + i} WHERE slug = ${lit(r.slug)};`);
    });
    const all = full.routes.flatMap((r) => r.lessons);
    const archived = all.filter((l) => plan.keep[l.slug] === undefined).map((l) => lit(l.slug));
    if (archived.length) out.push(`UPDATE lessons SET status = 'ARCHIVED' WHERE slug IN (${archived.join(', ')}) AND status = 'PUBLISHED';`);
    for (const l of all) {
      if (plan.keep[l.slug] === undefined) continue;
      const lessonId = ref('lessons', { slug: l.slug }).sql;
      const kept = keptIndexes(l, plan);
      for (const n of l.exercises.keys()) {
        if (kept.includes(n)) continue;
        const o = archiveOrder(l.slug, n);
        out.push(
          `UPDATE exercises SET lesson_id = ${archive}, "order" = ${o} WHERE id = ${lit(exerciseId(l.slug, n))} AND lesson_id = ${lessonId} AND NOT EXISTS (SELECT 1 FROM exercises x WHERE x.lesson_id = ${archive} AND x."order" = ${o});`,
        );
      }
      // За зростанням: позиція i вже вільна (прибране завдання перенесене, попереднє — зсунуте); повтор нічого не змінює.
      kept.forEach((n, i) => {
        if (n === i) return;
        out.push(
          `UPDATE exercises SET "order" = ${i} WHERE id = ${lit(exerciseId(l.slug, n))} AND lesson_id = ${lessonId} AND NOT EXISTS (SELECT 1 FROM exercises x WHERE x.lesson_id = ${lessonId} AND x."order" = ${i});`,
        );
      });
    }
    const content = CITY_CONTENT.find((c) => c.city === full.city)!;
    const lessons = content.routes.flatMap((r) => r.lessons);
    // Нові завдання скороченого уроку: у циклі міст їхні позиції ще були зайняті старими завданнями.
    for (const l of lessons) if (plan.add?.[l.slug] && Array.isArray(plan.keep[l.slug])) for (const i of l.exercises.keys()) out.push(exerciseSql(l.slug, l, i, false));
    const regular = lessons.filter((l) => (l.kind ?? 'LESSON') === 'LESSON').length;
    out.push(`UPDATE cities SET ticket_lessons = ${regular} WHERE slug = ${lit(full.city)} AND ticket_lessons > ${regular};`);
  }
  return out;
}

export function buildSeedSql(opts: { force?: boolean; preStandard?: boolean } = {}): string[] {
  const force = !!opts.force;
  const out: string[] = [];
  const cityContent = opts.preStandard ? PRE_STANDARD_CONTENT : CITY_CONTENT;
  resetIds();

  // ── Налаштування гри та тарифи ──
  out.push(`INSERT INTO game_config (key, value) VALUES ('rewards', ${lit(DEFAULT_REWARDS)}) ON CONFLICT DO NOTHING;`);
  const plans = [
    { code: 'MONTH_1', months: 1, price_stars: 250, recurring: true, order: 1, title: { uk: '1 місяць', ru: '1 месяц', en: '1 month', pl: '1 miesiąc' } },
    { code: 'MONTH_3', months: 3, price_stars: 600, recurring: false, order: 2, title: { uk: '3 місяці', ru: '3 месяца', en: '3 months', pl: '3 miesiące' } },
    { code: 'MONTH_12', months: 12, price_stars: 1800, recurring: false, order: 3, title: { uk: '12 місяців', ru: '12 месяцев', en: '12 months', pl: '12 miesięcy' } },
  ];
  for (const p of plans) out.push(insert('subscription_plans', p, ['code'], force));

  // ── Словник ──
  const vocabKey = new Map<string, { pl: string; pos: string }>();
  for (const w of VOCAB) {
    vocabKey.set(w.pl, { pl: w.pl, pos: w.pos });
    out.push(
      insert(
        'vocabulary_entries',
        {
          id: `v_${hash(`${w.pl}|${w.pos}`)}`, pl: w.pl, pos: w.pos, translations: w.tr, pronunciation: w.pron ?? null, cefr: w.cefr,
          topics: w.topics, emoji: w.emoji ?? null, forms: w.forms ?? {}, examples: w.examples ?? [], status: 'PUBLISHED',
        },
        ['pl', 'pos'],
        force,
      ),
    );
  }

  // ── Міста ──
  // Прибрані з маршруту міста: архів і звільнення номера порядку (рядки й прогрес не видаляються).
  for (const [i, slug] of REMOVED_CITIES.entries()) {
    out.push(`UPDATE cities SET status = 'ARCHIVED', "order" = ${1000 + i} WHERE slug = ${lit(slug)};`);
  }
  // Маршрут визначається кодом: порядок, рівень, тема й координати оновлюються при кожному seed.
  // Спершу тимчасово зсуваємо порядок (унікальний індекс), потім ставимо остаточний.
  out.push(`UPDATE cities SET "order" = "order" + 2000 WHERE slug IN (${CITIES.map((c) => lit(c.slug)).join(', ')});`);
  for (const [i, c] of CITIES.entries()) {
    const { x, y } = project(c.lon, c.lat);
    const row = {
      id: `c_${c.slug}`, slug: c.slug, order: i + 1, name_pl: c.namePl, name: c.name, theme: c.theme, description: c.description,
      cefr: c.cefr, map_x: x + (c.dx ?? 0), map_y: y + (c.dy ?? 0), emoji: c.emoji, color: c.color, status: 'PUBLISHED',
    };
    out.push(insert('cities', row, ['slug'], true, force ? [] : ['emoji', 'color', 'status']));
  }

  // ── Уроки ──
  const lessonSql = (l: LessonSeed, order: number, routeSlug: string | null) => {
    out.push(
      insert(
        'lessons',
        {
          id: `l_${l.slug}`, slug: l.slug, order, kind: l.kind ?? 'LESSON', title: l.title, topic: l.topic, cefr: l.cefr, difficulty: l.difficulty,
          explanation: l.explanation, examples: l.examples, status: 'PUBLISHED', route_id: routeSlug ? ref('city_routes', { slug: routeSlug }) : null,
        },
        ['slug'],
        force,
      ),
    );
    const lessonId = ref('lessons', { slug: l.slug });
    // Урок, що лишився без локації (наприклад, локацію додали пізніше), прив'язуємо до неї.
    if (routeSlug) out.push(`UPDATE lessons SET route_id = ${ref('city_routes', { slug: routeSlug }).sql} WHERE slug = ${lit(l.slug)} AND route_id IS NULL;`);
    for (const i of l.exercises.keys()) out.push(exerciseSql(l.slug, l, i, force));
    if (force) {
      out.push(`DELETE FROM exercises WHERE lesson_id = ${lessonId.sql} AND "order" >= ${l.exercises.length};`);
      out.push(`DELETE FROM lesson_words WHERE lesson_id = ${lessonId.sql};`);
    }
    for (const [i, w] of l.words.entries()) {
      const key = vocabKey.get(w);
      if (!key) throw new Error(`Слово "${w}" з уроку ${l.slug} відсутнє у словнику`);
      out.push(insert('lesson_words', { lesson_id: lessonId, entry_id: ref('vocabulary_entries', key), order: i }, ['lesson_id', 'entry_id'], force));
    }
  };

  for (const content of cityContent) {
    const cityId = ref('cities', { slug: content.city });
    let regular = 0;
    // Порядок локацій визначає код (нові локації можуть з'явитися на початку міста):
    // тимчасово зсуваємо порядок (унікальний індекс міста), вставляємо нові, потім ставимо остаточний.
    out.push(`UPDATE city_routes SET "order" = "order" + 2000 WHERE city_id = ${cityId.sql};`);
    for (const [ri, r] of content.routes.entries()) {
      out.push(
        insert('city_routes', { id: `r_${r.slug}`, city_id: cityId, slug: r.slug, order: ri + 1, title: r.title, description: r.description, icon: r.icon, status: 'PUBLISHED' }, ['slug'], force),
      );
      out.push(`UPDATE city_routes SET "order" = ${ri + 1} WHERE slug = ${lit(r.slug)};`);
      for (const [li, l] of r.lessons.entries()) {
        lessonSql(l, li + 1, r.slug);
        if ((l.kind ?? 'LESSON') === 'LESSON') regular++;
      }
    }
    // Квиток до наступного міста: пройти всі звичайні уроки міста + іспит.
    // Без force значення з адмінки не зменшуємо, але нові уроки міста теж мають рахуватися.
    out.push(`UPDATE cities SET ticket_lessons = ${regular} WHERE slug = ${lit(content.city)}${force ? '' : ` AND ticket_lessons < ${regular}`};`);
  }
  lessonSql(PLACEMENT, 0, null);
  lessonSql(EXAM_A1, 0, null);
  out.push(STRANDED_CURRENT_CITY_SQL);

  // ── Явні виправлення текстів (лише якщо в БД досі старе значення з коду) ──
  for (const f of [...TEXT_FIXES, ...CONTINUATION_TEXT_FIXES, ...ROUTE_ICON_FIXES]) {
    out.push(`UPDATE ${f.table} SET "${f.column}" = ${lit(f.to)} WHERE slug = ${lit(f.slug)} AND "${f.column}" = ${lit(f.from)};`);
  }
  // ── Перенесення уроків між локаціями (лише з очікуваної старої локації) ──
  for (const m of LESSON_MOVES) {
    const route = (slug: string) => ref('city_routes', { slug }).sql;
    out.push(`UPDATE lessons SET route_id = ${route(m.to)}, "order" = ${m.order} WHERE slug = ${lit(m.lesson)} AND route_id = ${route(m.from)};`);
  }

  // Exact-match corrections preserve IDs, admin edits, and historical session snapshots.
  out.push(...exerciseFixSql());
  // Правки завдань за сталим id (task-edits.ts): лише там, де в БД досі старий текст.
  out.push(...taskEditSql());
  // Те саме для словника: рівень і приклади оновлюються лише там, де досі старе значення з коду.
  out.push(...vocabFixSql());
  // Стандарт міста — після точкових виправлень: вони адресують завдання за старими позиціями.
  if (!opts.preStandard) out.push(...standardSql());

  // ── Косметика ──
  for (const [i, item] of ITEMS.entries()) {
    out.push(
      insert(
        'cosmetic_items',
        {
          id: `i_${item.slug}`, slug: item.slug, slot: item.slot, name: item.name, asset_key: item.slug, price: item.price, rarity: item.rarity ?? 'common',
          is_premium: !!item.premium, reward_only: !!item.rewardOnly, city_id: item.city ? ref('cities', { slug: item.city }) : null, order: i,
        },
        ['slug'],
        force,
      ),
    );
  }

  // ── Нагороди, додані пізніше: видаємо тим, хто вже виконав умову (ідемпотентно, без зміни інших предметів) ──
  for (const m of MISSIONS) {
    if (!m.rewardItem) continue;
    out.push(
      `INSERT INTO user_inventory (user_id, item_id, source) SELECT um.user_id, ci.id, ${lit(`mission:${m.slug}`)} FROM user_missions um JOIN cosmetic_items ci ON ci.slug = ${lit(m.rewardItem)} WHERE um.mission_slug = ${lit(m.slug)} ON CONFLICT DO NOTHING;`,
    );
  }
  for (const [city, item] of LATE_CITY_REWARDS) {
    out.push(
      `INSERT INTO user_inventory (user_id, item_id, source) SELECT uc.user_id, ci.id, ${lit(`city:${city}`)} FROM user_cities uc JOIN cities c ON c.id = uc.city_id JOIN cosmetic_items ci ON ci.slug = ${lit(item)} WHERE c.slug = ${lit(city)} AND uc.boss_passed_at IS NOT NULL ON CONFLICT DO NOTHING;`,
    );
  }

  // ── Квести ──
  for (const [i, q] of [...DAILY_QUESTS, ...WEEKLY_QUESTS, ...STORY_QUESTS].entries()) {
    out.push(
      insert(
        'quests',
        {
          id: `q_${q.slug}`, slug: q.slug, kind: q.kind, title: q.title, description: q.description, metric: q.metric, target: q.target,
          xp_reward: q.xp, zlotki_reward: q.zlotki, icon: q.icon, city_id: q.city ? ref('cities', { slug: q.city }) : null,
          reward_item_id: q.rewardItem ? ref('cosmetic_items', { slug: q.rewardItem }) : null, order: q.order ?? i,
        },
        ['slug'],
        force,
      ),
    );
    for (const [si, st] of (q.stages ?? []).entries()) {
      out.push(insert('quest_steps', { id: `qs_${hash(q.slug)}_${si}`, quest_id: ref('quests', { slug: q.slug }), order: si, data: st }, ['quest_id', 'order'], force));
    }
  }

  // ── Досягнення ──
  for (const [i, a] of ACHIEVEMENTS.entries()) {
    out.push(
      insert(
        'achievements',
        {
          id: `a_${a.slug}`, slug: a.slug, title: a.title, description: a.description, icon: a.icon, metric: a.metric, threshold: a.threshold,
          zlotki_reward: a.zlotki, reward_item_id: a.rewardItem ? ref('cosmetic_items', { slug: a.rewardItem }) : null, order: i,
        },
        ['slug'],
        force,
      ),
    );
  }

  // Лічильник вправ (lessons.exercise_count) ведуть тригери міграції 0005; перерахунок у кінці seed — страховка
  // від розбіжностей. Пише лише рядки, де число справді відрізняється.
  const realCount = '(SELECT count(*) FROM exercises e WHERE e.lesson_id = lessons.id)';
  out.push(`UPDATE lessons SET exercise_count = ${realCount} WHERE exercise_count <> ${realCount};`);
  return out;
}

/** Safe on an existing database; a second run changes nothing. No global force. */
export function exerciseFixSql(): string[] {
  return EXERCISE_FIXES.map((f) => {
    const old = f.from;
    const next = f.to;
    const target = ref('lessons', { slug: f.lesson }).sql;
    return `UPDATE exercises SET type = ${lit(next.type)}, skill = ${lit(next.skill)}, data = ${lit(next.data)}, explanation = ${lit(next.explanation)} WHERE lesson_id = ${target} AND "order" = ${f.order} AND type = ${lit(old.type)} AND skill = ${lit(old.skill)} AND data = ${lit(old.data)} AND explanation IS ${lit(old.explanation)};`;
  });
}

/**
 * Правки завдань за сталим id: оновлюється лише рядок зі старим текстом (type, skill, data, explanation збігаються точно);
 * тексти уроків — так само, за slug і старим значенням колонки.
 */
export function taskEditSql(): string[] {
  const lessonsSql = LESSON_EDITS.map(
    ({ slug, column, from, to }) => `UPDATE lessons SET "${column}" = ${lit(to as Value)} WHERE slug = ${lit(slug)} AND "${column}" = ${lit(from as Value)};`,
  );
  return [...lessonsSql, ...TASK_EDITS.map(
    ({ lesson, n, from, to }) =>
      `UPDATE exercises SET type = ${lit(to.type)}, skill = ${lit(to.skill)}, data = ${lit(to.data as Value)}, explanation = ${lit(to.explanation as Value)} WHERE id = ${lit(exerciseId(lesson, n))} AND type = ${lit(from.type)} AND skill = ${lit(from.skill)} AND data = ${lit(from.data as Value)} AND explanation IS ${lit(from.explanation as Value)};`,
  )];
}

/** Точкові правки словника: ключ (pl, pos) і старе значення колонки. Безпечно для наявної БД, повтор нічого не змінює. */
export function vocabFixSql(): string[] {
  return VOCAB_FIXES.map(
    (f) => `UPDATE vocabulary_entries SET "${f.column}" = ${lit(f.to)} WHERE pl = ${lit(f.pl)} AND pos = ${lit(f.pos)} AND "${f.column}" = ${lit(f.from)};`,
  );
}
