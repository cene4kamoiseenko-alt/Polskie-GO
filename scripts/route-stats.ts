/**
 * Фактична картина маршрутів (V9 §10): по кожному місту — теми, звичайні уроки, іспит, кількість завдань в уроці,
 * різні механіки й рівні CEFR. Друкує таблицю Markdown; уроки поза орієнтиром 12–16 завдань — окремим списком.
 * Запуск: node --import tsx scripts/route-stats.ts
 */
import { CITY_CONTENT } from '../apps/server/src/content/seed';
import { CITIES } from '../apps/server/src/content/cities';

const TARGET = { lessons: [16, 18], exercises: [12, 16] } as const;

function main() {
  const byCity = new Map(CITY_CONTENT.map((c) => [c.city, c]));
  const rows: string[] = ['| Місто | Тем | Уроків | Іспит | Завдань в уроці (мін–макс, сер.) | Механік | CEFR |', '|---|---|---|---|---|---|---|'];
  const outside: string[] = [];
  for (const city of CITIES) {
    const content = byCity.get(city.slug);
    if (!content) {
      rows.push(`| ${city.namePl} | 0 | 0 | — | — | — | — |`);
      continue;
    }
    const all = content.routes.flatMap((r) => r.lessons);
    const regular = all.filter((l) => (l.kind ?? 'LESSON') === 'LESSON');
    const counts = regular.map((l) => l.exercises.length);
    const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
    const types = new Set(regular.flatMap((l) => l.exercises.map((e) => e.type)));
    const cefr = [...new Set(regular.map((l) => l.cefr))].join('/');
    const mark = regular.length >= TARGET.lessons[0] ? '' : ' ⚠';
    rows.push(`| ${city.namePl} | ${content.routes.length} | ${regular.length}${mark} | ${all.length - regular.length ? 'так' : 'ні'} | ${Math.min(...counts)}–${Math.max(...counts)}, ${avg.toFixed(1)} | ${types.size} | ${cefr} |`);
    const off = regular.filter((l) => l.exercises.length < TARGET.exercises[0] || l.exercises.length > TARGET.exercises[1]);
    if (off.length) outside.push(`- ${city.namePl}: ${off.map((l) => `${l.slug} (${l.exercises.length})`).join(', ')}`);
  }
  console.log(rows.join('\n'));
  console.log(`\n⚠ — менше ${TARGET.lessons[0]} звичайних уроків.\n\nУроки поза ${TARGET.exercises[0]}–${TARGET.exercises[1]} завданнями:\n${outside.join('\n') || '- немає'}`);
}

main();
