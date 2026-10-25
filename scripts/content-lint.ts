/**
 * Автоматичні перевірки навчального контенту (структура, повтори, діакритика, відповідність аудіо й відповіді).
 *   node --import tsx scripts/content-lint.ts [out.txt]
 * Мовну правильність і однозначність цей скрипт не доводить — лише підсвічує місця для ручної перевірки.
 */
import { writeFileSync } from 'node:fs';
import { normalize, stripDiacritics, spreadByType, type I18n } from '@polski-go/shared';
import { CITY_CONTENT } from '../apps/server/src/content/seed';
import { PLACEMENT, EXAM_A1 } from '../apps/server/src/content/exams';
import { VOCAB } from '../apps/server/src/content/vocab';
import { MISSIONS } from '../apps/server/src/content/missions';
import type { LessonSeed } from '../apps/server/src/content/types';

type Ex = { type: string; skill: string; data: Record<string, any>; explanation?: I18n };
type Ref = { city: string; lesson: string; i: number; ex: Ex };

const refs: Ref[] = [];
const lessons: { city: string; l: LessonSeed }[] = [];
for (const c of CITY_CONTENT) for (const r of c.routes) for (const l of r.lessons) { lessons.push({ city: c.city, l }); l.exercises.forEach((ex, i) => refs.push({ city: c.city, lesson: l.slug, i, ex: ex as Ex })); }
for (const l of [PLACEMENT, EXAM_A1]) { lessons.push({ city: 'exams', l }); l.exercises.forEach((ex, i) => refs.push({ city: 'exams', lesson: l.slug, i, ex: ex as Ex })); }

const out: string[] = [];
const section = (title: string, rows: string[]) => { out.push(`\n## ${title} (${rows.length})`, ...rows); };
const id = (r: Ref) => `${r.lesson}#${r.i}`;
const txt = (x: unknown): string => (typeof x === 'string' ? x : x && typeof x === 'object' && 'uk' in (x as object) ? (x as I18n).uk : '');

// ── 1. Відсутні переклади в I18n-полях ──
const missing: string[] = [];
const walk = (v: unknown, path: string, where: string) => {
  if (Array.isArray(v)) return v.forEach((x, i) => walk(x, `${path}[${i}]`, where));
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>;
    if ('uk' in o || 'ru' in o || 'en' in o) {
      for (const k of ['uk', 'ru', 'en']) if (typeof o[k] !== 'string' || !(o[k] as string).trim()) missing.push(`${where} ${path}.${k}`);
      return;
    }
    for (const [k, x] of Object.entries(o)) walk(x, path ? `${path}.${k}` : k, where);
  }
};
for (const r of refs) walk(r.ex, '', id(r));
for (const { l } of lessons) for (const k of ['title', 'topic', 'explanation'] as const) walk(l[k], k, l.slug);
section('Відсутні переклади', missing);

// ── 2. Аудіо не збігається з правильною відповіддю ──
const audio: string[] = [];
for (const r of refs) {
  const d = r.ex.data;
  if (r.ex.type === 'LISTENING') {
    const ok = d.options.find((o: any) => o.id === d.answer);
    if (normalize(txt(ok?.text)) !== normalize(d.audioText)) audio.push(`${id(r)} audio «${d.audioText}» ≠ відповідь «${txt(ok?.text)}»`);
  }
  if (r.ex.type === 'DICTATION' && normalize(d.accepted[0]) !== normalize(d.audioText)) audio.push(`${id(r)} диктант «${d.audioText}» ≠ accepted[0] «${d.accepted[0]}»`);
  if (r.ex.type === 'WORD_TRANSLATION' && d.pl && d.audioText && normalize(d.pl) !== normalize(d.audioText)) audio.push(`${id(r)} слово «${d.pl}» ≠ аудіо «${d.audioText}»`);
}
section('Аудіо ≠ відповідь', audio);

// ── 3. Структура: порожні тексти, однакові варіанти, ___ у пропуску, токени ──
const struct: string[] = [];
for (const r of refs) {
  const d = r.ex.data;
  if (Array.isArray(d.options)) {
    const texts = d.options.map((o: any) => normalize(txt(o.text)));
    if (new Set(texts).size !== texts.length) struct.push(`${id(r)} однакові варіанти після нормалізації: ${texts.join(' / ')}`);
    if (texts.some((x: string) => !x)) struct.push(`${id(r)} порожній варіант`);
    if (d.options.filter((o: any) => o.id === d.answer).length !== 1) struct.push(`${id(r)} відповідь не вказує на один варіант`);
    if (r.ex.type !== 'FIND_ERROR' && r.ex.type !== 'ODD_ONE_OUT' && d.options.length < 3) struct.push(`${id(r)} лише ${d.options.length} варіанти`);
  }
  if (r.ex.type === 'FILL_GAP' && (String(d.pl).match(/___/g) ?? []).length !== 1) struct.push(`${id(r)} пропуск має бути рівно один: ${d.pl}`);
  if (Array.isArray(d.accepted) && d.accepted.some((a: string) => !a.trim())) struct.push(`${id(r)} порожня прийнята відповідь`);
  if (r.ex.type === 'ODD_ONE_OUT' && !txt(d.question)) struct.push(`${id(r)} «зайве» без критерію`);
  if (['FIND_ERROR', 'ODD_ONE_OUT'].includes(r.ex.type) && !r.ex.explanation) struct.push(`${id(r)} ${r.ex.type} без пояснення`);
}
section('Структура', struct);

// ── 4. Діакритика: слова, що збігаються зі словником без знаків, але написані інакше ──
const dict = new Map<string, Set<string>>();
const addWord = (w: string) => { const n = w.toLowerCase(); if (!/[ąćęłńóśźż]/.test(n)) return; const k = stripDiacritics(n); if (!dict.has(k)) dict.set(k, new Set()); dict.get(k)!.add(n); };
for (const v of VOCAB) { v.pl.split(/[\s,.!?;:()«»„”"]+/).forEach(addWord); for (const e of v.examples ?? []) e.pl.split(/[\s,.!?;:()«»„”"]+/).forEach(addWord); }
// Слова, що законно існують і без знаків (інше значення) — не помилка.
const ALSO_PLAIN = new Set(['laska', 'pan', 'tak', 'ze', 'sie', 'co', 'czy', 'a', 'o', 'z', 'na', 'w', 'i', 'kot', 'las', 'mam', 'pies', 'stol', 'go', 'je', 'ja', 'ta', 'te', 'to', 'zle', 'dzis', 'bede', 'moze', 'juz', 'zona', 'pol', 'sa', 'ida', 'kon', 'koncu', 'lato', 'stoj', 'pole', 'raz', 'rak', 'swieta', 'kasa', 'sol', 'lza']);
const diac: string[] = [];
const plFields = (r: Ref): string[] => {
  const d = r.ex.data;
  const xs: string[] = [d.pl, d.audioText, d.text, d.passage, ...(d.accepted ?? []), ...(d.answer && Array.isArray(d.answer) ? d.answer : [])].filter((x) => typeof x === 'string');
  if (Array.isArray(d.options)) for (const o of d.options) if (typeof o.text === 'string') xs.push(o.text);
  if (Array.isArray(d.pairs)) for (const p of d.pairs) xs.push(p.pl);
  if (Array.isArray(d.steps)) for (const s of d.steps) { xs.push(s.npc); for (const o of s.options ?? []) xs.push(o.text); }
  return xs;
};
for (const r of refs) {
  if (['FIND_ERROR'].includes(r.ex.type)) continue; // помилка в реченні навмисна
  for (const s of plFields(r)) for (const raw of s.split(/[\s,.!?;:()«»„”"—–\-/]+/)) {
    const w = raw.toLowerCase();
    if (!w || /[ąćęłńóśźż]/.test(w) || ALSO_PLAIN.has(w)) continue;
    const cand = dict.get(w);
    if (cand) diac.push(`${id(r)} «${raw}» → можливо ${[...cand].join(' / ')}  (${s.slice(0, 70)})`);
  }
}
section('Можливі пропущені діакритики', diac);

// ── 5. Кирилиця або змішані алфавіти в польських полях ──
const cyr: string[] = [];
for (const r of refs) for (const s of plFields(r)) if (/[а-яіїєґё]/i.test(s) && r.ex.type !== 'MATCH_PAIRS') cyr.push(`${id(r)} кирилиця в польському тексті: ${s}`);
section('Кирилиця в польських полях', cyr);

// ── 6. Повтори: точні, нормалізовані, однаковий запит з тією ж відповіддю ──
const norm = (v: any): any => {
  if (typeof v === 'string') return normalize(v);
  if (Array.isArray(v)) return v.map(norm);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).filter(([k]) => !['id', 'answer', 'l', 'r'].includes(k)).sort(([a], [b]) => a.localeCompare(b)).map(([k, x]) => [k, norm(x)]));
  return v;
};
const promptOf = (r: Ref): string => {
  const d = r.ex.data;
  const ans = Array.isArray(d.options) ? txt(d.options.find((o: any) => o.id === d.answer)?.text) : Array.isArray(d.accepted) ? d.accepted[0] : Array.isArray(d.answer) ? d.answer.join(' ') : d.text ?? '';
  const prompt = d.pl ?? d.audioText ?? txt(d.translation) ?? txt(d.source) ?? txt(d.question) ?? d.text ?? '';
  return `${r.ex.type}|${normalize(String(prompt))}|${normalize(String(ans))}`;
};
const groups = new Map<string, Ref[]>();
const pgroups = new Map<string, Ref[]>();
for (const r of refs) {
  if (r.ex.type === 'MATCH_PAIRS' || r.ex.type === 'DIALOGUE' || r.ex.type === 'SITUATION') continue;
  const d = norm(r.ex.data);
  if (Array.isArray(d.options)) d.options.sort((a: any, b: any) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  const k = JSON.stringify([r.ex.type, d]);
  groups.set(k, [...(groups.get(k) ?? []), r]);
  const pk = promptOf(r);
  pgroups.set(pk, [...(pgroups.get(pk) ?? []), r]);
}
section('Точні/нормалізовані дублікати', [...groups.values()].filter((g) => g.length > 1).map((g) => g.map(id).join('  =  ')));
section('Той самий запит і відповідь (інші варіанти)', [...pgroups.entries()].filter(([, g]) => g.length > 1 && new Set(g.map((r) => JSON.stringify(norm(r.ex.data)))).size > 1).map(([k, g]) => `${k.slice(0, 90)}  ←  ${g.map(id).join(', ')}`));

// ── 7. Одна польська фраза як ціль у багатьох завданнях ──
const targets = new Map<string, Ref[]>();
for (const r of refs) {
  const d = r.ex.data;
  const t = r.ex.type === 'PRONUNCIATION' ? d.text : r.ex.type === 'DICTATION' ? d.audioText : r.ex.type === 'LISTENING' ? d.audioText : ['BUILD_SENTENCE', 'WORD_ORDER'].includes(r.ex.type) ? d.answer.join(' ') : r.ex.type === 'SENTENCE_TRANSLATION' ? d.accepted[0] : null;
  if (!t) continue;
  const k = normalize(t);
  targets.set(k, [...(targets.get(k) ?? []), r]);
}
section('Фраза-ціль у 3+ завданнях', [...targets.entries()].filter(([, g]) => g.length >= 3).map(([k, g]) => `«${k}» ×${g.length}: ${g.map((r) => `${id(r)}(${r.ex.type})`).join(', ')}`));

// ── 8. Серії однакової механіки після розподілу ──
const runs: string[] = [];
for (const { l } of lessons) {
  const order = spreadByType(l.exercises as never[]) as Ex[];
  let run = 1;
  for (let i = 1; i < order.length; i++) { run = order[i].type === order[i - 1].type ? run + 1 : 1; if (run > 3) runs.push(`${l.slug}: ${order[i].type} ×${run}`); }
}
section('Серії механік > 3', runs);

// ── 9. Завдання без пояснення за типами ──
const noExpl = new Map<string, number>();
for (const r of refs) if (!r.ex.explanation) noExpl.set(r.ex.type, (noExpl.get(r.ex.type) ?? 0) + 1);
section('Без авторського пояснення (за типом)', [...noExpl.entries()].map(([k, n]) => `${k}: ${n}`));

// ── 10. Місії: зайві варіанти, порожні поля ──
const mis: string[] = [];
for (const m of MISSIONS) for (const [i, s] of m.steps.entries()) {
  if (s.options && s.options.filter((o) => o.ok).length !== 1) mis.push(`${m.slug}#${i} правильних варіантів: ${s.options.filter((o) => o.ok).length}`);
  if (s.kind === 'listen' && s.line && s.options && !s.options.some((o) => o.ok && o.pl && normalize(o.pl) === normalize(s.line!.pl)) && s.options.every((o) => o.pl)) mis.push(`${m.slug}#${i} аудіо «${s.line.pl}» не збігається з правильним варіантом`);
}
section('Місії', mis);

const counts = new Map<string, number>();
for (const r of refs) counts.set(r.city, (counts.get(r.city) ?? 0) + 1);
out.unshift(`# Content lint — ${refs.length} завдань: ${[...counts.entries()].map(([c, n]) => `${c} ${n}`).join(', ')}; місій ${MISSIONS.length}`);
const file = process.argv[2] ?? 'content-lint.txt';
writeFileSync(file, out.join('\n'));
console.log(out.filter((l) => l.startsWith('#')).join('\n'));
