/**
 * Автоматичні перевірки навчального контенту (структура, повтори, діакритика, відповідність аудіо й відповіді).
 *   node --import tsx scripts/content-lint.ts [out.txt]
 * Мовну правильність і однозначність цей скрипт не доводить — лише підсвічує місця для ручної перевірки.
 */
import { writeFileSync } from 'node:fs';
import { CEFR_LEVELS, normalize, stripDiacritics, spreadByType, type I18n } from '@polski-go/shared';
import { CITY_CONTENT } from '../apps/server/src/content/seed';
import { PLACEMENT, EXAM_A1 } from '../apps/server/src/content/exams';
import { TOPICS, VOCAB } from '../apps/server/src/content/vocab';
import { LODZ_CEFR, LODZ_VOCAB } from '../apps/server/src/content/vocab-lodz';
import { VOCAB_FIXES } from '../apps/server/src/content/vocab-fixes';
import { MISSIONS } from '../apps/server/src/content/missions';
import type { LessonSeed } from '../apps/server/src/content/types';

type Ex = { type: string; skill: string; data: Record<string, any>; explanation?: I18n };
type Ref = { city: string; lesson: string; i: number; ex: Ex };

const refs: Ref[] = [];
const lessons: { city: string; l: LessonSeed }[] = [];
for (const c of CITY_CONTENT) for (const r of c.routes) for (const l of r.lessons) { lessons.push({ city: c.city, l }); l.exercises.forEach((ex, i) => refs.push({ city: c.city, lesson: l.slug, i, ex: ex as Ex })); }
for (const l of [PLACEMENT, EXAM_A1]) { lessons.push({ city: 'exams', l }); l.exercises.forEach((ex, i) => refs.push({ city: 'exams', lesson: l.slug, i, ex: ex as Ex })); }

const out: string[] = [];
const summary: string[] = [];
const notes: string[] = [];
const section = (title: string, rows: string[]) => { out.push(`\n## ${title} (${rows.length})`, ...rows); summary.push(`## ${title} (${rows.length})`); };
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
// «Почуй число — обери цифри»: аудіо словами, відповідь цифрами («czterdzieści pięć złotych» → «45 zł»).
// Такі завдання звіряються за значенням: числівники з аудіо перетворюються на числа й порівнюються з цифрами відповіді.
const NUM: Record<string, number> = {
  zero: 0, jeden: 1, jedna: 1, jedno: 1, dwa: 2, dwie: 2, trzy: 3, cztery: 4, piec: 5, szesc: 6, siedem: 7, osiem: 8, dziewiec: 9,
  dziesiec: 10, jedenascie: 11, dwanascie: 12, trzynascie: 13, czternascie: 14, pietnascie: 15, szesnascie: 16, siedemnascie: 17,
  osiemnascie: 18, dziewietnascie: 19, dwadziescia: 20, trzydziesci: 30, czterdziesci: 40, piecdziesiat: 50, szescdziesiat: 60,
  siedemdziesiat: 70, osiemdziesiat: 80, dziewiecdziesiat: 90, sto: 100, dwiescie: 200, trzysta: 300, czterysta: 400, piecset: 500,
  szescset: 600, siedemset: 700, osiemset: 800, dziewiecset: 900, tysiac: 1000,
};
/** Числа, названі словами: «siedem, osiem, dwa» → [7, 8, 2]; «dwadzieścia cztery» → [24]. */
const spokenNumbers = (s: string): number[] => {
  const nums: number[] = [];
  for (const part of s.split(/[,.;:!?]/)) {
    let cur: number | null = null;
    let last = 0;
    for (const raw of part.toLowerCase().split(/\s+/)) {
      const v = NUM[stripDiacritics(raw)];
      if (v === undefined) { if (cur !== null) nums.push(cur); cur = null; continue; }
      // «czterdzieści pięć» = 45: молодший розряд додається до старшого; «siedem osiem» — два окремі числа.
      if (cur !== null && last >= 20 && v < last && String(v).length < String(last).length) { cur += v; last = v; continue; }
      if (cur !== null) nums.push(cur);
      cur = v;
      last = v;
    }
    if (cur !== null) nums.push(cur);
  }
  return nums;
};
const audio: string[] = [];
let audioNumeric = 0;
for (const r of refs) {
  const d = r.ex.data;
  if (r.ex.type === 'LISTENING') {
    const ok = d.options.find((o: any) => o.id === d.answer);
    const answer = txt(ok?.text);
    if (normalize(answer) === normalize(d.audioText)) continue;
    const written = (answer.match(/\d+/g) ?? []).map(Number);
    const spoken = spokenNumbers(d.audioText);
    const sameNumbers = written.length > 0 && written.length === spoken.length && written.every((n, i) => n === spoken[i]);
    const sameCurrency = !/zł/.test(answer) || /złot/i.test(d.audioText);
    if (sameNumbers && sameCurrency) { audioNumeric++; continue; }
    audio.push(`${id(r)} audio «${d.audioText}» ≠ відповідь «${answer}»`);
  }
  if (r.ex.type === 'DICTATION' && normalize(d.accepted[0]) !== normalize(d.audioText)) audio.push(`${id(r)} диктант «${d.audioText}» ≠ accepted[0] «${d.accepted[0]}»`);
  if (r.ex.type === 'WORD_TRANSLATION' && d.pl && d.audioText && normalize(d.pl) !== normalize(d.audioText)) audio.push(`${id(r)} слово «${d.pl}» ≠ аудіо «${d.audioText}»`);
}
section('Аудіо ≠ відповідь', audio);
notes.push(`Аудіо словами ↔ відповідь цифрами: ${audioNumeric} завдань звірено за значенням (числа збігаються)`);

// ── 3. Структура: порожні тексти, однакові варіанти, ___ у пропуску, токени ──
const struct: string[] = [];
for (const r of refs) {
  const d = r.ex.data;
  if (Array.isArray(d.options)) {
    // У завданнях на наголос великі літери й дефіси і є відповіддю (her-BA-ta / HER-ba-ta), тож їх не нормалізуємо.
    const stress = r.ex.skill === 'pronunciation.stress';
    const texts = d.options.map((o: any) => (stress ? txt(o.text).trim() : normalize(txt(o.text))));
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
const ALSO_PLAIN = new Set(['laska', 'pan', 'tak', 'ze', 'sie', 'co', 'czy', 'a', 'o', 'z', 'na', 'w', 'i', 'kot', 'las', 'mam', 'pies', 'stol', 'go', 'je', 'ja', 'ta', 'te', 'to', 'zle', 'dzis', 'bede', 'moze', 'juz', 'zona', 'pol', 'sa', 'ida', 'kon', 'koncu', 'lato', 'stoj', 'pole', 'raz', 'rak', 'swieta', 'kasa', 'sol', 'lza', 'pracuje', 'karta']);
// Перевірені вручну хибні спрацювання (аудит 2026-10-26, docs/CONTENT_AUDIT_RU.md): слово без діакритики тут правильне.
// Ключ — «завдання слово»: та сама форма в іншому завданні знову потрапить у звіт і буде перевірена окремо.
const PLAIN_OK: Record<string, string[]> = {
  'Називний відмінок або форма, що збігається з ним: woda (не wodą — орудний), jedna stacja, cisza nocna, zupa pomidorowa, zupa jest zimna; pomoc — іменник «допомога» (знахідний = називному), pomóc — інше слово, дієслово': [
    'krk-d3-bilet#7 woda', 'krk-z1-produkty#4 woda', 'krk-z1-produkty#13 woda', 'krk-z1-produkty#16 woda', 'krk-z2-ceny#5 woda', 'krk-z2-ceny#9 woda',
    'krk-z5-misja#4 woda', 'krk-z5-misja#4 niegazowana', 'krk-z5-misja#12 woda', 'krk-z5-misja#18 woda', 'waw-k4-misja#3 woda', 'wro-1-kawa#0 woda', 'wro-1-kawa#6 woda',
    'waw-c3-metro#11 jedna', 'waw-c4-misja#2 jedna', 'waw-c4-misja#3 jedna', 'waw-c2-bilety#2 miejska', 'waw-p5-misja#7 poczta',
    'waw-n2-blok#3 nocna', 'waw-n2-blok#4 nocna', 'waw-n2-blok#7 nocna', 'waw-n4-misja#4 nocna', 'waw-n4-misja#6 nocna',
    'krk-re1-dania#10 pomidorowa', 'wro-boss#8 pomidorowa', 'krk-re3-kelner#5 zimna', 'krk-re3-kelner#10 zimna', 'waw-f3-gusty#6 zimna',
    'waw-s4-misja#8 pomoc', 'krk-r4-droga#8 pomoc', 'opo-1-siema#4 pomoc', 'waw-n4-misja#17 pomoc',
    'wro-5-ubrania#3 czerwona', 'wro-5-ubrania#4 czerwona',
  ],
  '3-тя особа однини (on/ona/Kuba/Bobek …): chce, pije, kupuje, zostaje; форма на -ę — це 1-ша особа': [
    'exam-a1#3 chce', 'waw-f4-misja#3 chce', 'wro-4-restauracja#4 chce', 'waw-f3-gusty#9 pije', 'waw-f3-gusty#10 pije', 'kat-4-te-ta#0 kupuje', 'lodz-1-alfabet#0 zostaje',
    'lodz-10-poranek#6 pije', 'lodz-16-plany#5 zostaje', 'lodz-16-plany#6 zostaje', 'lodz-boss#14 chce',
  ],
  'Навмисний неправильний варіант на відмінок (називний замість знахідного чи орудного); правильна відповідь — інший варіант': [
    'waw-f1-kawa#4 cytryna', 'krk-z1-produkty#7 woda', 'krk-z1-produkty#14 woda', 'krk-z5-misja#3 woda', 'krk-z5-misja#5 woda', 'krk-re2-zamawianie#4 pomidorowa',
  ],
  'Називний відмінок у парі, дистракторі чи годині та 3-тя особа: hulajnoga, ścieżka rowerowa, paczka, poczta, dwunasta (12:20), chce, potrzebuje': [
    'kat-6-hulajnoga#2 hulajnoga', 'kat-6-hulajnoga#7 rowerowa', 'kat-6-hulajnoga#9 hulajnoga', 'kat-6-hulajnoga#9 rowerowa',
    'kat-8-poczta#1 paczka', 'kat-8-poczta#2 paczka', 'kat-8-poczta#3 poczta', 'kat-8-poczta#11 poczta', 'kat-8-poczta#8 chce', 'kat-8-poczta#9 potrzebuje',
    'krk-d4-peron#12 dwunasta',
  ],
  'Ополе: навмисний неправильний варіант (називний замість місцевого після o: dwunasta) і жіночий називний jaka («яка музика»), а не знахідний jaką': [
    'opo-5-weekend#5 dwunasta', 'opo-7-zdanie#4 jaka',
  ],
  'Місяць «maja» (родовий від maj: «piętnastego maja», «14 maja») — не дієслово mają': [
    'krk-h1-recepcja#11 maja', 'krk-h1-recepcja#12 maja', 'krk-h5-misja#3 maja', 'krk-u4-biblioteka#10 maja', 'krk-u4-biblioteka#14 maja',
  ],
  'Вправа на розрізнення літер: варіант без діакритики — навмисний дистрактор (ż / z, rz / r)': [
    'lodz-1-alfabet#6 zaba', 'lodz-2-dwuznaki#2 reka', 'lodz-boss#1 reka',
  ],
};
const plainOk = new Map<string, string>();
for (const [why, keys] of Object.entries(PLAIN_OK)) for (const k of keys) plainOk.set(k, why);
const plainOkUsed = new Set<string>();
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
    if (!cand) continue;
    const key = `${id(r)} ${w}`;
    if (plainOk.has(key)) { plainOkUsed.add(key); continue; }
    diac.push(`${id(r)} «${raw}» → можливо ${[...cand].join(' / ')}  (${s.slice(0, 70)})`);
  }
}
section('Можливі пропущені діакритики', diac);
// Запис allowlist, що більше нічого не збігається (завдання змінили чи прибрали), — прибрати або перевірити заново.
section('Застарілі записи allowlist діакритики', [...plainOk.keys()].filter((k) => !plainOkUsed.has(k)));
notes.push(`Діакритика: ${plainOkUsed.size} пар «завдання слово» перевірено вручну як законні форми (PLAIN_OK у скрипті)`);

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
// Текст поля або undefined, якщо поля немає: інакше `??` зупинявся на порожньому рядку, і запит ODD_ONE_OUT / READING /
// SENTENCE_TRANSLATION завжди був «» — у групу потрапляли будь-які завдання з тією самою відповіддю (аудит 2026-10-26).
const field = (x: unknown): string | undefined => (typeof x === 'string' ? x : x && typeof x === 'object' && 'uk' in (x as object) ? (x as I18n).uk : undefined);
const promptOf = (r: Ref): string => {
  const d = r.ex.data;
  const ans = Array.isArray(d.options) ? txt(d.options.find((o: any) => o.id === d.answer)?.text) : Array.isArray(d.accepted) ? d.accepted[0] : Array.isArray(d.answer) ? d.answer.join(' ') : d.text ?? '';
  // «Знайди зайве» — це критерій разом із набором слів; «читання» — текст разом із питанням.
  const prompt =
    r.ex.type === 'ODD_ONE_OUT' ? `${field(d.question) ?? ''} [${d.options.map((o: any) => normalize(txt(o.text))).sort().join(', ')}]`
    : r.ex.type === 'READING' ? `${d.passage} ⟶ ${field(d.question) ?? ''}`
    : d.pl ?? d.audioText ?? field(d.translation) ?? field(d.source) ?? field(d.question) ?? d.text ?? d.image ?? '';
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

// ── 11. Словник: ключі, на які посилаються уроки, місії й seed ──
// seed шукає слово уроку за `pl` (lessonSql падає, якщо слова немає); точкові правки — за (pl, pos).
const vocabRefs: string[] = [];
const byPl = new Map<string, string[]>();
for (const v of VOCAB) byPl.set(v.pl, [...(byPl.get(v.pl) ?? []), v.pos]);
for (const [pl, poses] of byPl) if (poses.length > 1) vocabRefs.push(`словник: «${pl}» має ${poses.length} записи (${poses.join(', ')}) — seed не знає, який узяти для уроку`);
for (const { l } of lessons) for (const w of l.words) if (!byPl.has(w)) vocabRefs.push(`${l.slug}: слово «${w}» відсутнє у словнику`);
for (const m of MISSIONS) for (const [i, s] of m.steps.entries()) for (const w of (s as { words?: string[] }).words ?? []) if (!byPl.has(w)) vocabRefs.push(`${m.slug}#${i}: слово «${w}» відсутнє у словнику`);
const offTopics = new Map<string, number>();
for (const v of VOCAB) {
  if (!(CEFR_LEVELS as readonly string[]).includes(v.cefr)) vocabRefs.push(`словник: «${v.pl}» — невідомий рівень ${v.cefr}`);
  for (const tp of v.topics) if (!(tp in TOPICS)) offTopics.set(tp, (offTopics.get(tp) ?? 0) + 1);
}
// Теги тем поза TOPICS не ламають seed, але фільтр словника за темою їх не показує. Довідково, не знахідка.
notes.push(`Теги тем словника поза TOPICS: ${offTopics.size} тегів у ${[...offTopics.values()].reduce((a, n) => a + n, 0)} записах (${[...offTopics.keys()].slice(0, 6).join(', ')}…)`);
for (const pl of Object.keys(LODZ_CEFR)) if (!LODZ_VOCAB.some((v) => v.pl === pl)) vocabRefs.push(`LODZ_CEFR: «${pl}» немає у словнику Лодзі`);
for (const f of VOCAB_FIXES) {
  const v = VOCAB.find((x) => x.pl === f.pl && x.pos === f.pos);
  if (!v) { vocabRefs.push(`VOCAB_FIXES: немає слова «${f.pl}» (${f.pos})`); continue; }
  const now = f.column === 'cefr' ? v.cefr : v.examples ?? [];
  if (JSON.stringify(now) !== JSON.stringify(f.to)) vocabRefs.push(`VOCAB_FIXES: «${f.pl}».${f.column} у коді не збігається з цільовим значенням правки`);
  if (JSON.stringify(f.from) === JSON.stringify(f.to)) vocabRefs.push(`VOCAB_FIXES: «${f.pl}».${f.column} — старе й нове значення однакові`);
}
section('Словник: відсутні ключі та розбіжності', vocabRefs);
const lodzUsed = new Set(lessons.filter(({ city }) => city === 'lodz').flatMap(({ l }) => l.words));
const lodzLevels = LODZ_VOCAB.reduce<Record<string, number>>((a, v) => ({ ...a, [v.cefr]: (a[v.cefr] ?? 0) + 1 }), {});
notes.push(`Словник Лодзі: ${LODZ_VOCAB.length} слів, рівні ${Object.entries(lodzLevels).map(([k, n]) => `${k} ${n}`).join(', ')}; в уроках Лодзі — ${LODZ_VOCAB.filter((v) => lodzUsed.has(v.pl)).length}, решта лише в словнику`);

const counts = new Map<string, number>();
for (const r of refs) counts.set(r.city, (counts.get(r.city) ?? 0) + 1);
const head = `# Content lint — ${refs.length} завдань: ${[...counts.entries()].map(([c, n]) => `${c} ${n}`).join(', ')}; місій ${MISSIONS.length}`;
out.unshift(head, ...notes.map((n) => `> ${n}`));
const file = process.argv[2] ?? 'content-lint.txt';
writeFileSync(file, out.join('\n'));
// Код виходу завжди 0: це звіт. Числа за категоріями друкуються, щоб «0 помилок» не плутали з «немає попереджень».
console.log([head, ...summary, ...notes.map((n) => `> ${n}`)].join('\n'));
