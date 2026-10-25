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
import { LESSON_MOVES, ROUTE_ICON_FIXES, TEXT_FIXES } from './fixes';
import { CITIES, REMOVED_CITIES, project } from './cities';
import { VOCAB } from './vocab';
import { WARSZAWA } from './warszawa';
import { KRAKOW } from './krakow';
import { WROCLAW } from './wroclaw';
import { LODZ } from './lodz';
import { KATOWICE } from './katowice';
import { OPOLE } from './opole';
import { PLACEMENT, EXAM_A1 } from './exams';
import { ACHIEVEMENTS, DAILY_QUESTS, ITEMS, STORY_QUESTS, WEEKLY_QUESTS } from './gamification';
import { MISSIONS } from './missions';
import type { CityContent, LessonSeed } from './types';

export const CITY_CONTENT: CityContent[] = [WARSZAWA, LODZ, KRAKOW, KATOWICE, OPOLE, WROCLAW];

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

export function buildSeedSql(opts: { force?: boolean } = {}): string[] {
  const force = !!opts.force;
  const out: string[] = [];
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
    for (const [i, ex] of l.exercises.entries()) {
      out.push(
        insert(
          'exercises',
          { id: `e_${hash(l.slug)}_${i}`, lesson_id: lessonId, order: i, type: ex.type, skill: ex.skill, data: ex.data, explanation: ex.explanation ?? null },
          ['lesson_id', 'order'],
          force,
        ),
      );
    }
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

  for (const content of CITY_CONTENT) {
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
