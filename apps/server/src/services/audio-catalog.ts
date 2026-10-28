/**
 * Каталог аудіобібліотеки: усі польські тексти, які застосунок може озвучити, з джерелами й пріоритетом.
 * Джерела — база (словник, опубліковані уроки та їхні вправи, сюжетні квести) і контент у коді, якого в базі немає
 * (місії, граматика, сленг, паспорт, фрази екранів). Однакова вимова (audioNorm) — одна одиниця й один MP3.
 * Каталог будується однаково в CLI (scripts/audio-library.ts на засіяній копії бази) і в Worker (адмінка).
 */
import { createHash } from 'node:crypto';
import { asc, eq } from 'drizzle-orm';
import { AUDIO_LIBRARY_VERSION, CEFR_LEVELS, audioKind, audioNorm, exerciseSpeakables, isLoneLetter, speechText, type SpeakRole } from '@polski-go/shared';
import { db } from '../db';
import { cities, cityRoutes, exercises, lessons, questSteps, quests, vocabularyEntries } from '../db/schema';
import { GRAMMAR } from '../content/grammar';
import { MISSIONS } from '../content/missions';
import { PASSPORT } from '../content/passport';
import { SLANG } from '../content/slang';

/**
 * Пріоритет генерації (порядок власника): 1 слова словника, 2 польські слова й речення уроків, 3 питання й відповіді вправ,
 * 4 діалоги й місії, 5 граматичні приклади, 6 додаткові вирази й тематичні словники, 7 інтерфейс і Бобек.
 */
// Підписи — російською, як в адмінці й звітах власника.
export const AUDIO_GROUPS = {
  1: 'Слова словаря',
  2: 'Слова и предложения уроков',
  3: 'Вопросы и ответы упражнений',
  4: 'Диалоги, миссии и истории',
  5: 'Грамматические примеры',
  6: 'Дополнительные выражения и тематические словари',
  7: 'Интерфейс и Бобек',
} as const;
export type AudioGroup = keyof typeof AUDIO_GROUPS;

/** Фрази екранів, які озвучуються кнопкою (Onboarding.tsx, Settings.tsx). Змінюються разом із екранами. */
export const UI_PHRASES = [
  { text: 'Cześć! Jestem Bobek. Razem nauczymy się polskiego!', usage: 'ui:onboarding' },
  { text: 'Dzień dobry! Dziękuję, do widzenia.', usage: 'ui:settings-voice-check' },
];

type Use = { text: string; group: AudioGroup; sub: number; order: number; usage: string; role?: SpeakRole };

export type AudioUnit = {
  /** sha256(audioNorm) — стабільний id і частина ключа R2. */
  id: string;
  norm: string;
  /** Текст, що йде в синтез: найчастіший варіант написання (за рівності — з великої літери). */
  text: string;
  kind: ReturnType<typeof audioKind>;
  group: AudioGroup;
  /** Порядок у черзі: група, підгрупа, порядок міста й уроку на маршруті. */
  rank: number;
  chars: number;
  usages: string[];
};

export const audioId = (norm: string) => createHash('sha256').update(norm).digest('hex');
/** Ключ об'єкта R2: голос у шляху — файли іншого голосу ніколи не підмішуються. */
export const audioObjectKey = (id: string, voiceId: string, version = AUDIO_LIBRARY_VERSION) => `pl/${version}/${voiceId}/${id.slice(0, 2)}/${id}.mp3`;
export const ttsChars = (text: string) => [...speechText(text)].length;

const ROLE_SUB: Record<SpeakRole, number> = { prompt: 0, passage: 1, option: 0, feedback: 1, pair: 2, token: 3, alt: 6, combo: 8, npc: 0, reply: 1 };
const ROLE_GROUP: Record<SpeakRole, AudioGroup> = { prompt: 2, passage: 2, option: 3, feedback: 3, pair: 3, token: 3, alt: 3, combo: 3, npc: 4, reply: 4 };

/** Усі використання текстів (до злиття). Порядок міст і уроків — як на маршруті, щоб ранні уроки отримали звук першими. */
export async function collectAudioUses(): Promise<Use[]> {
  const uses: Use[] = [];
  const push = (text: unknown, group: AudioGroup, sub: number, order: number, usage: string, role?: SpeakRole) => {
    if (typeof text !== 'string' || !speechText(text) || isLoneLetter(text)) return;
    uses.push({ text, group, sub, order, usage, role });
  };

  const [vocab, lessonRows, exerciseRows, questRows] = await Promise.all([
    db.select({ pl: vocabularyEntries.pl, cefr: vocabularyEntries.cefr, examples: vocabularyEntries.examples, audioUrl: vocabularyEntries.audioUrl }).from(vocabularyEntries).where(eq(vocabularyEntries.status, 'PUBLISHED')),
    db
      .select({ id: lessons.id, slug: lessons.slug, order: lessons.order, examples: lessons.examples, routeOrder: cityRoutes.order, cityOrder: cities.order })
      .from(lessons)
      .leftJoin(cityRoutes, eq(cityRoutes.id, lessons.routeId))
      .leftJoin(cities, eq(cities.id, cityRoutes.cityId))
      .where(eq(lessons.status, 'PUBLISHED')),
    db
      .select({ lessonId: exercises.lessonId, order: exercises.order, type: exercises.type, data: exercises.data })
      .from(exercises)
      .innerJoin(lessons, eq(lessons.id, exercises.lessonId))
      .where(eq(lessons.status, 'PUBLISHED'))
      .orderBy(asc(exercises.order)),
    db.select({ slug: quests.slug, order: questSteps.order, data: questSteps.data }).from(questSteps).innerJoin(quests, eq(quests.id, questSteps.questId)),
  ]);

  // Порядок уроку на маршруті: місто → маршрут → урок. Уроки без маршруту (граматичні тощо) — після міст.
  const lessonOrder = new Map<string, { slug: string; order: number }>();
  for (const l of lessonRows) lessonOrder.set(l.id, { slug: l.slug, order: ((l.cityOrder ?? 99) * 100 + (l.routeOrder ?? 99)) * 1000 + l.order });

  for (const v of vocab) {
    // Слово із власним записом (audioUrl) звучить записом; синтез — лише запасний варіант, тому нижче в черзі.
    // Слова — від простих до складних: A0 → B2.
    const level = Math.max(0, CEFR_LEVELS.indexOf(v.cefr as (typeof CEFR_LEVELS)[number]));
    push(v.pl, 1, v.audioUrl ? 9 : 0, level, `vocab:${v.pl}`);
    for (const e of v.examples) push(e.pl, 6, 0, level, `vocab-example:${v.pl}`);
  }
  for (const l of lessonRows) {
    const o = lessonOrder.get(l.id)!;
    l.examples.forEach((e, i) => push(e.pl, 2, 2, o.order, `lesson:${l.slug}/example#${i}`));
  }
  for (const e of exerciseRows) {
    const o = lessonOrder.get(e.lessonId);
    if (!o) continue;
    for (const s of exerciseSpeakables(e.type, e.data as Record<string, unknown>)) {
      push(s.text, ROLE_GROUP[s.role], ROLE_SUB[s.role], o.order * 100 + e.order, `lesson:${o.slug}#${e.order}:${s.role}`, s.role);
    }
  }
  for (const q of questRows) {
    const nodes = (q.data as { nodes?: Record<string, { pl?: string }> }).nodes ?? {};
    for (const [id, n] of Object.entries(nodes)) push(n.pl, 4, 3, q.order, `quest:${q.slug}/${q.order}/${id}`);
  }
  MISSIONS.forEach((m, mi) => {
    for (const s of m.steps) if (s.line) push(s.line.pl, 4, 2, mi * 100, `mission:${m.slug}/${s.id}`);
    m.phrases.forEach((p, i) => push(p.pl, 6, 2, mi * 100, `mission:${m.slug}/phrase#${i}`));
  });
  GRAMMAR.forEach((g, gi) => g.examples.forEach((e, i) => push(e.pl, 5, 0, gi, `grammar:${g.slug}#${i}`)));
  SLANG.forEach((s, si) => {
    push(s.pl, 6, 4, si, `slang:${s.id}`);
    push(s.dialogue.a, 6, 5, si, `slang:${s.id}/a`);
    push(s.dialogue.b, 6, 5, si, `slang:${s.id}/b`);
    push(s.neutral.pl.split(' / ')[0], 6, 5, si, `slang:${s.id}/neutral`);
  });
  Object.entries(PASSPORT).forEach(([city, p], i) => push(p.postcard.pl, 6, 6, i, `passport:${city}`));
  UI_PHRASES.forEach((p, i) => push(p.text, 7, 0, i, p.usage));
  return uses;
}

/** Злиття за однаковою вимовою: одна одиниця на audioNorm, найвищий пріоритет серед усіх використань. */
export function mergeAudioUses(uses: Use[]): AudioUnit[] {
  const byNorm = new Map<string, { uses: Use[]; variants: Map<string, number> }>();
  for (const u of uses) {
    const norm = audioNorm(u.text);
    if (!norm) continue;
    let e = byNorm.get(norm);
    if (!e) byNorm.set(norm, (e = { uses: [], variants: new Map() }));
    e.uses.push(u);
    const v = speechText(u.text);
    e.variants.set(v, (e.variants.get(v) ?? 0) + 1);
  }
  const units: AudioUnit[] = [];
  for (const [norm, e] of byNorm) {
    const text = [...e.variants.entries()].sort((a, b) => b[1] - a[1] || Number(/^\p{Lu}/u.test(b[0])) - Number(/^\p{Lu}/u.test(a[0])) || a[0].localeCompare(b[0], 'pl'))[0][0];
    const best = e.uses.reduce((a, b) => (a.group * 10 + a.sub < b.group * 10 + b.sub || (a.group * 10 + a.sub === b.group * 10 + b.sub && a.order < b.order) ? a : b));
    units.push({
      id: audioId(norm),
      norm,
      text,
      kind: audioKind(text, best.role),
      group: best.group,
      rank: (best.group * 10 + best.sub) * 1e9 + best.order,
      chars: ttsChars(text),
      usages: [...new Set(e.uses.map((u) => u.usage))].sort(),
    });
  }
  return units.sort((a, b) => a.rank - b.rank || a.norm.localeCompare(b.norm, 'pl'));
}

export async function buildAudioCatalog(): Promise<AudioUnit[]> {
  return mergeAudioUses(await collectAudioUses());
}
