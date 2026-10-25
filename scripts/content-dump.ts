/**
 * Читабельна вигрузка всього навчального контенту для ручної мовної перевірки.
 *   node --import tsx scripts/content-dump.ts <out-dir>
 * Кожне завдання — блок рядків з ідентифікатором `урок#порядок`, типом, текстом, варіантами (✓ — правильний),
 * перекладами (uk | ru | en) і поясненням. Окремий файл на місто + іспити й місії.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { I18n } from '@polski-go/shared';
import { CITY_CONTENT } from '../apps/server/src/content/seed';
import { PLACEMENT, EXAM_A1 } from '../apps/server/src/content/exams';
import { MISSIONS } from '../apps/server/src/content/missions';
import type { LessonSeed } from '../apps/server/src/content/types';

const out = process.argv[2] ?? 'content-dump';
mkdirSync(out, { recursive: true });

const tri = (x: I18n | string | undefined) => (x === undefined ? '' : typeof x === 'string' ? x : `${x.uk} | ${x.ru} | ${x.en}`);
const one = (x: I18n | string | undefined) => (x === undefined ? '' : typeof x === 'string' ? x : x.uk);

type Opt = { id: string; text: string | I18n; image?: string };
function exercise(slug: string, i: number, ex: { type: string; skill: string; data: Record<string, unknown>; explanation?: I18n }): string {
  const d = ex.data as Record<string, any>;
  const lines = [`[${slug}#${i}] ${ex.type} (${ex.skill})`];
  const add = (k: string, v: string) => v && lines.push(`  ${k}: ${v}`);
  add('q', tri(d.question));
  add('pl', d.pl ?? '');
  add('audio', d.audioText ?? '');
  add('text', d.text ?? '');
  add('image', d.image ?? '');
  add('passage', d.passage ?? '');
  add('tr', tri(d.translation));
  add('src', tri(d.source));
  add('base', d.base ?? '');
  if (Array.isArray(d.options)) {
    add('opts', (d.options as Opt[]).map((o) => `${o.id === d.answer ? '✓' : '·'}${o.image ? o.image + ' ' : ''}${tri(o.text)}`).join('  ‖  '));
  }
  if (Array.isArray(d.accepted)) add('accept', (d.accepted as string[]).join('  ‖  '));
  if (Array.isArray(d.answer)) add('answer', (d.answer as string[]).join(' '));
  if (Array.isArray(d.tokens)) add('tokens', (d.tokens as string[]).join(' · '));
  if (Array.isArray(d.alternatives) && d.alternatives.length) add('alts', (d.alternatives as string[][]).map((a) => a.join(' ')).join('  ‖  '));
  if (Array.isArray(d.pairs)) add('pairs', (d.pairs as { pl: string; tr: I18n }[]).map((p) => `${p.pl} = ${tri(p.tr)}`).join('  ‖  '));
  if (d.npc && Array.isArray(d.steps)) {
    add('npc', `${d.npc.name} — ${one(d.npc.role)}`);
    add('scene', tri(d.scene));
    (d.steps as any[]).forEach((s, si) => {
      lines.push(`  ${si}> ${s.npc}  [${tri(s.npcTr)}]`);
      for (const o of s.options ?? []) lines.push(`     ${o.id === s.answer ? '✓' : '·'} ${o.text}  [${tri(o.tr)}]`);
      if (s.feedback) lines.push(`     fb: ${tri(s.feedback)}`);
    });
  }
  if (ex.explanation) add('expl', tri(ex.explanation));
  return lines.join('\n');
}

function lesson(l: LessonSeed, route?: string): string {
  const head = [
    `=== ${l.slug} (${l.kind ?? 'LESSON'}, ${l.cefr}${route ? `, ${route}` : ''}) — ${tri(l.title)}`,
    `  topic: ${tri(l.topic)}`,
    `  words: ${l.words.join(', ')}`,
    `  explanation.uk: ${l.explanation.uk.replace(/\n/g, ' ⏎ ')}`,
    `  explanation.ru: ${l.explanation.ru.replace(/\n/g, ' ⏎ ')}`,
    `  explanation.en: ${l.explanation.en.replace(/\n/g, ' ⏎ ')}`,
    ...l.examples.map((e) => `  example: ${e.pl} = ${tri(e.tr)}`),
  ];
  return [...head, ...l.exercises.map((ex, i) => exercise(l.slug, i, ex as never))].join('\n') + '\n';
}

let total = 0;
for (const c of CITY_CONTENT) {
  const parts: string[] = [];
  for (const r of c.routes) {
    parts.push(`######## ROUTE ${r.slug} — ${tri(r.title)} — ${tri(r.description)}`);
    for (const l of r.lessons) { parts.push(lesson(l, r.slug)); total += l.exercises.length; }
  }
  writeFileSync(join(out, `${c.city}.txt`), parts.join('\n'));
}
writeFileSync(join(out, 'exams.txt'), [lesson(PLACEMENT), lesson(EXAM_A1)].join('\n'));
total += PLACEMENT.exercises.length + EXAM_A1.exercises.length;

const m = MISSIONS.map((ms) => {
  const lines = [`=== MISSION ${ms.slug} (${ms.city}) — ${tri(ms.title)}`, `  goal: ${tri(ms.goal)}`];
  for (const [si, st] of ms.steps.entries()) {
    lines.push(`  [${ms.slug}#${si}] ${st.kind} — ${tri(st.task)}`);
    if (st.line) lines.push(`    ${st.line.who}${st.line.hidden ? ' (audio)' : ''}: ${st.line.pl}  [${tri(st.line.tr)}]`);
    for (const o of st.options ?? []) lines.push(`    ${o.ok ? '✓' : '·'} ${o.pl ?? tri(o.text)}${o.why ? `  — ${tri(o.why)}` : ''}`);
    if (st.answer) lines.push(`    answer: ${st.answer}${st.accept?.length ? `  ‖ accept: ${st.accept.join(' ‖ ')}` : ''}  ‖ extra: ${(st.extra ?? []).join(' · ')}`);
    lines.push(`    hint: ${tri(st.hint)}`);
    lines.push(`    explain: ${tri(st.explain)}`);
  }
  return lines.join('\n');
});
writeFileSync(join(out, 'missions.txt'), m.join('\n\n'));
console.log('exercises', total, 'missions', MISSIONS.length);
