/**
 * Точна таблиця обсягу контенту по містах (для балансу міст).
 *   node --import tsx scripts/city-balance.ts [--json]
 * Рахує уроки за типом, завдання, частку механік, нові слова, граматичні навички, уроки-місії,
 * сюжетні місії (missions.ts), ticket_lessons (= кількість звичайних уроків, як у seed) і оцінку часу.
 */
import { isMissionSlug } from '@polski-go/shared';
import { CITY_CONTENT } from '../apps/server/src/content/seed';
import { MISSIONS } from '../apps/server/src/content/missions';

/** Орієнтовні секунди на одне завдання за типом (читання/діалог довші). */
const SEC: Record<string, number> = {
  WORD_TRANSLATION: 12, PICTURE_WORD: 10, FILL_GAP: 18, LISTENING: 18, DICTATION: 30, PRONUNCIATION: 25, READING: 45,
  SENTENCE_TRANSLATION: 40, GRAMMAR: 25, BUILD_SENTENCE: 30, WORD_ORDER: 25, MATCH_PAIRS: 30, FIND_ERROR: 20,
  ODD_ONE_OUT: 15, DIALOGUE: 60, SITUATION: 60,
};
const SKILLS: Record<string, string[]> = {
  listening: ['LISTENING', 'DICTATION'],
  speaking: ['PRONUNCIATION'],
  reading: ['READING'],
  writing: ['SENTENCE_TRANSLATION', 'DICTATION'],
  grammar: ['GRAMMAR', 'FILL_GAP', 'FIND_ERROR'],
};

const rows = CITY_CONTENT.map((c) => {
  const lessons = c.routes.flatMap((r) => r.lessons);
  const kinds: Record<string, number> = {};
  const types: Record<string, number> = {};
  const grammarSkills = new Set<string>();
  const words = new Set<string>();
  let total = 0;
  let regular = 0;
  let regularEx = 0;
  let seconds = 0;
  let missionLessons = 0;
  let bossEx = 0;
  for (const l of lessons) {
    const k = l.kind ?? 'LESSON';
    kinds[k] = (kinds[k] ?? 0) + 1;
    if (k === 'LESSON') { regular++; regularEx += l.exercises.length; }
    if (k === 'BOSS') bossEx += l.exercises.length;
    if (isMissionSlug(l.slug)) missionLessons++;
    l.words.forEach((w) => words.add(w));
    for (const ex of l.exercises) {
      total++;
      types[ex.type] = (types[ex.type] ?? 0) + 1;
      seconds += SEC[ex.type] ?? 20;
      if (ex.skill.startsWith('grammar.')) grammarSkills.add(ex.skill);
    }
  }
  const perLesson = lessons.map((l) => l.exercises.length);
  const skillShare = Object.fromEntries(
    Object.entries(SKILLS).map(([k, ts]) => [k, ts.reduce((s, t) => s + (types[t] ?? 0), 0)]),
  );
  return {
    city: c.city, routes: c.routes.length, lessons: lessons.length, kinds, ticket_lessons: regular, total, regularEx, bossEx,
    perLesson: { min: Math.min(...perLesson), max: Math.max(...perLesson), avg: +(total / lessons.length).toFixed(1) },
    words: words.size, grammarTopics: grammarSkills.size, grammar: [...grammarSkills].sort(), missionLessons,
    storyMissions: MISSIONS.filter((m) => m.city === c.city).length, types, skillShare, minutes: Math.round(seconds / 60),
  };
});

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(rows, null, 2));
} else {
  const allTypes = [...new Set(rows.flatMap((r) => Object.keys(r.types)))].sort();
  console.log('| Місто | Локацій | Уроків (L/BOSS) | ticket_lessons | Завдань | Завд./урок min–max (сер.) | Іспит міста | Слів | Грам. навичок | Уроків-місій | Сюж. місій | ≈ хв |');
  console.log('|---|---|---|---|---|---|---|---|---|---|---|---|');
  for (const r of rows) {
    console.log(`| ${r.city} | ${r.routes} | ${r.lessons} (${r.kinds.LESSON ?? 0}/${r.kinds.BOSS ?? 0}) | ${r.ticket_lessons} | ${r.total} | ${r.perLesson.min}–${r.perLesson.max} (${r.perLesson.avg}) | ${r.bossEx} | ${r.words} | ${r.grammarTopics} | ${r.missionLessons} | ${r.storyMissions} | ${r.minutes} |`);
  }
  console.log('\n| Механіка | ' + rows.map((r) => r.city).join(' | ') + ' |');
  console.log('|---|' + rows.map(() => '---').join('|') + '|');
  for (const t of allTypes) console.log(`| ${t} | ` + rows.map((r) => `${r.types[t] ?? 0} (${Math.round(((r.types[t] ?? 0) / r.total) * 100)}%)`).join(' | ') + ' |');
  console.log('\n| Навичка | ' + rows.map((r) => r.city).join(' | ') + ' |');
  console.log('|---|' + rows.map(() => '---').join('|') + '|');
  for (const k of Object.keys(SKILLS)) console.log(`| ${k} | ` + rows.map((r) => r.skillShare[k]).join(' | ') + ' |');
  console.log('\nГраматика по містах:');
  for (const r of rows) console.log(`  ${r.city}: ${r.grammar.join(', ')}`);
}
