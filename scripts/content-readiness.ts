/**
 * Готовность контента (1.0, этап 2): трудные версии уроков по городам — сколько нужно, есть, чего не хватает, заданий, замечаний качества.
 *
 *   node --import tsx scripts/content-readiness.ts           — таблица по городам
 *   node --import tsx scripts/content-readiness.ts --missing — + список недостающих версий
 *   node --import tsx scripts/content-readiness.ts --strict  — код 1, если чего-то не хватает или есть замечания
 *
 * Тот же расчёт показывает админка («Контент → Готовность», GET /api/admin/content-readiness): apps/server/src/content/readiness.ts.
 */
import { CITY_CONTENT } from '../apps/server/src/content/seed';
import { contentReadiness } from '../apps/server/src/content/readiness';

const args = process.argv.slice(2);
const r = contentReadiness(CITY_CONTENT);
console.log('город'.padEnd(20), 'ур.', 'есть/нужно'.padStart(11), 'нет'.padStart(4), 'заданий'.padStart(8), 'замеч.'.padStart(7), ' состояние');
for (const c of r.cities) {
  const state = c.need === 0 ? 'версии не нужны' : c.ready ? 'готов' : 'в работе';
  console.log(c.name.padEnd(20), (c.cefr ?? '–').padEnd(3), `${c.have}/${c.need}`.padStart(11), String(c.missing.length).padStart(4), String(c.tasks).padStart(8), String(c.findings).padStart(7), ' ' + state);
  if (args.includes('--missing')) for (const m of c.missing) console.log('   ', m.slug, `(${m.cefr}) → ${m.level}`);
}
const t = r.totals;
console.log(`\nготовы ${t.ready} из ${t.cities} городов; версий ${t.have} из ${t.need} (нет ${t.missing}); заданий ${t.tasks}; замечаний ${t.findings}`);
if (args.includes('--strict') && (t.missing || t.findings)) process.exit(1);
