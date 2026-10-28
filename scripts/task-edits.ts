/**
 * Правки готових завдань уроків без втрати прогресу: точкові UPDATE за сталим id завдання (`e_<урок>_<номер>`).
 *
 *   node --import tsx scripts/task-edits.ts snapshot <файл.json>   — знімок завдань ДО правок (поточний код);
 *   …правите завдання прямо у файлах уроків…
 *   node --import tsx scripts/task-edits.ts diff <файл.json>       — переписує apps/server/src/content/task-edits.ts:
 *                                                                    правки на момент знімка + пари «було → стало» для змінених
 *                                                                    завдань і текстів уроків (повторний diff нічого не дублює).
 *
 * Seed застосовує правку лише там, де в БД досі старий текст (exact match type/skill/data/explanation): правки з адмінки
 * не перезаписуються, повтор нічого не змінює, на чистій БД код уже вставляє нову версію. Нові й видалені завдання сюди
 * не потрапляють (для них — стандарт міста, city-standard.ts).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { CITY_CONTENT, PRE_STANDARD_CONTENT, exerciseKey } from '../apps/server/src/content/seed';
import { LESSON_EDITS, TASK_EDITS, type TaskCore } from '../apps/server/src/content/task-edits';
import { EXAM_A1, PLACEMENT } from '../apps/server/src/content/exams';

type Snapshot = Record<string, { lesson: string; n: number; core: TaskCore }>;
/** Тексти уроку, що правляться разом із завданнями (колонки lessons). */
const LESSON_FIELDS = ['title', 'topic', 'explanation', 'examples'] as const;
type LessonSnap = Record<string, Record<(typeof LESSON_FIELDS)[number], unknown>>;

const allLessons = () => [...[...PRE_STANDARD_CONTENT, ...CITY_CONTENT].flatMap((c) => c.routes.flatMap((r) => r.lessons)), PLACEMENT, EXAM_A1];

function lessonTexts(): LessonSnap {
  const out: LessonSnap = {};
  for (const l of allLessons()) out[l.slug] = { title: l.title, topic: l.topic, explanation: l.explanation, examples: l.examples };
  return out;
}

/** Усі завдання з коду (повні уроки до стандарту й уроки за стандартом) за id. */
function current(): Snapshot {
  const out: Snapshot = {};
  const lessons = allLessons();
  for (const l of lessons)
        l.exercises.forEach((ex, i) => {
          const n = l.exerciseIds?.[i] ?? i;
          out[exerciseKey(l.slug, n)] = { lesson: l.slug, n, core: { type: ex.type, skill: ex.skill, data: ex.data, explanation: ex.explanation ?? null } };
        });
  return out;
}

const [cmd, file] = process.argv.slice(2);
if (!file || (cmd !== 'snapshot' && cmd !== 'diff')) throw new Error('usage: task-edits.ts snapshot|diff <file.json>');
if (cmd === 'snapshot') {
  // Правки, що вже є на момент знімка: diff пише їх + нові (повторний diff не дублює).
  writeFileSync(file, JSON.stringify({ tasks: current(), lessons: lessonTexts(), edits: { tasks: TASK_EDITS, lessons: LESSON_EDITS } }));
  console.log(`snapshot: ${Object.keys(current()).length} tasks, ${Object.keys(lessonTexts()).length} lessons → ${file}`);
} else {
  const snap = JSON.parse(readFileSync(file, 'utf8')) as { tasks: Snapshot; lessons: LessonSnap; edits: { tasks: typeof TASK_EDITS; lessons: typeof LESSON_EDITS } };
  const before = snap.tasks;
  const now = current();
  const texts = lessonTexts();
  const lessonAdded: typeof LESSON_EDITS = [];
  for (const [slug, b] of Object.entries(snap.lessons)) {
    const a = texts[slug];
    if (!a) continue;
    for (const f of LESSON_FIELDS) if (JSON.stringify(a[f]) !== JSON.stringify(b[f])) lessonAdded.push({ slug, column: f, from: b[f], to: a[f] });
  }
  const added: typeof TASK_EDITS = [];
  for (const [id, b] of Object.entries(before)) {
    const a = now[id];
    if (!a || JSON.stringify(a.core) === JSON.stringify(b.core)) continue;
    added.push({ lesson: b.lesson, n: b.n, from: b.core, to: a.core });
  }
  const all = [...snap.edits.tasks, ...added];
  const lessonAll = [...snap.edits.lessons, ...lessonAdded];
  const path = new URL('../apps/server/src/content/task-edits.ts', import.meta.url);
  const src = readFileSync(path, 'utf8');
  const head = src.slice(0, src.indexOf('export const TASK_EDITS'));
  writeFileSync(path, `${head}export const TASK_EDITS: TaskEdit[] = ${JSON.stringify(all, null, 1)};\n\nexport const LESSON_EDITS: LessonEdit[] = ${JSON.stringify(lessonAll, null, 1)};\n`);
  console.log(`diff: +${added.length} task edits (${all.length} total), +${lessonAdded.length} lesson text edits (${lessonAll.length} total)`);
  for (const e of added) console.log(`  ${e.lesson}#${e.n} ${e.to.type}`);
  for (const e of lessonAdded) console.log(`  ${e.slug}.${e.column}`);
}
