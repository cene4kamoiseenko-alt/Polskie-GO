/**
 * «Сообщить об ошибке в задании» (решение владельца 2026-11-14). Игрок жалуется на задание из урока, повторения, экзамена, входного
 * теста или миссии: ответ верный, но не засчитан; засчитан неверный; ошибка в польском или переводе; задание неясное; слишком лёгкое
 * (ответ угадывается без польского); не звучит озвучка; другое.
 *
 * Клиент шлёт только ссылку на задание (сессия + ключ либо миссия + шаг), причину и необязательный комментарий. «Снимок» задания
 * (что видел игрок) и последний ответ игрока сервер берёт сам — из своей сессии и журнала попыток, поэтому подделать содержимое жалобы
 * нельзя, а админке не нужно гадать, о каком задании речь, даже если текст урока потом поменяли.
 *
 *  • Один игрок — одна жалоба на одно задание: повтор обновляет причину и комментарий и снова открывает жалобу;
 *  • не больше MAX_EXERCISE_REPORTS_PER_DAY новых жалоб в сутки (повтор по тому же заданию не считается новой);
 *  • разбирает админка («Ошибки в заданиях»): жалобы сгруппированы по заданию, статус NEW → REVIEW → FIXED или REJECTED.
 */
import { and, desc, eq, gt, inArray, sql } from 'drizzle-orm';
import type { ExerciseItem, I18n } from '@polski-go/shared';
import { db } from '../db';
import { EXERCISE_REPORT_REASONS, EXERCISE_REPORT_STATUS, exerciseAttempts, exerciseReports, exercises, learningSessions, lessons, userSettings } from '../db/schema';
import { MISSIONS } from '../content/missions';
import { HttpError, notFound } from '../lib/errors';

export type ExerciseReportReason = (typeof EXERCISE_REPORT_REASONS)[number];
export type ExerciseReportStatus = (typeof EXERCISE_REPORT_STATUS)[number];

export const MAX_EXERCISE_REPORTS_PER_DAY = 20;
export const EXERCISE_REPORT_COMMENT_MAX = 500;

/** Что видел игрок: тип задания, видимые тексты и варианты (верный отмечен). Без персональных данных. */
export type ExerciseSnapshot = {
  type: string;
  /** Откуда задание: урок / экзамен / повторение / миссия. */
  where: string;
  title?: string;
  texts: string[];
  options?: { text: string; correct?: boolean }[];
  skill?: string;
};

export type ExerciseReportRef =
  | { sessionId: string; key: string }
  | { mission: string; step: string };

const clip = (s: unknown, n = 240): string => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, n);
const ru = (v: unknown): string => {
  if (typeof v === 'string') return clip(v);
  const o = (v ?? {}) as Partial<I18n>;
  return clip(o.ru ?? o.uk ?? o.en ?? '');
};

/** Поля данных задания, которые игрок видит на экране (польская фраза, перевод, вопрос, текст, озвучиваемая фраза). */
const TEXT_FIELDS = ['pl', 'source', 'translation', 'prompt', 'question', 'text', 'passage', 'audioText', 'sentence', 'target', 'title', 'base'] as const;

/** Снимок задания сессии: тексты, варианты, отметка верного. Устойчив к любому типу данных (лишнее просто пропускается). */
export function snapshotOfItem(item: ExerciseItem, where: string): ExerciseSnapshot {
  const d = (item.data ?? {}) as unknown as Record<string, unknown>;
  const texts = TEXT_FIELDS.map((f) => (d[f] !== undefined ? ru(d[f]) : '')).filter(Boolean);
  const snap: ExerciseSnapshot = { type: item.type, where, texts: [...new Set(texts)].slice(0, 6), skill: item.skill };
  const options = d.options as { id?: string; text?: unknown }[] | undefined;
  if (Array.isArray(options)) {
    snap.options = options.slice(0, 8).map((o) => ({ text: ru(o?.text ?? o), correct: d.answer !== undefined ? o?.id === d.answer : undefined }));
  }
  const steps = d.steps as { npc?: unknown; options?: { text?: unknown; id?: string }[]; answer?: string }[] | undefined;
  if (Array.isArray(steps) && steps.length) {
    snap.texts = steps.slice(0, 6).map((s) => ru(s.npc));
    const first = steps[0];
    if (Array.isArray(first?.options)) snap.options = first.options.slice(0, 6).map((o) => ({ text: ru(o?.text ?? o), correct: o?.id === first.answer }));
  }
  const tokens = d.tokens as unknown[] | undefined;
  if (Array.isArray(tokens)) snap.texts = [...snap.texts, `слова: ${tokens.slice(0, 20).map((x) => clip(x, 30)).join(' ')}`];
  const answer = d.answer;
  if (Array.isArray(answer)) snap.texts = [...snap.texts, `верно: ${answer.map((x) => clip(x, 30)).join(' ')}`];
  // Перевод, диктант, грамматика: принимаемые ответы (первые три).
  const accepted = d.accepted;
  if (Array.isArray(accepted) && accepted.length) snap.texts = [...snap.texts, `верно: ${accepted.slice(0, 3).map((x) => clip(x, 120)).join(' / ')}`];
  // «Соедини пары» (2026-11-23): без пар снимок был пустым — админка не видела, о каком переводе жалоба.
  const pairs = d.pairs as { pl?: unknown; tr?: unknown }[] | undefined;
  if (Array.isArray(pairs)) snap.options = pairs.slice(0, 10).map((p) => ({ text: `${clip(p?.pl, 80)} — ${ru(p?.tr)}` }));
  return snap;
}

/** Снимок пустой (жалоба до 2026-11-23 на «пары» и т. п.) — собрать заново из текущего задания, чтобы админка видела, о чём речь. */
const emptySnapshot = (s: ExerciseSnapshot | null) => !s || (!s.texts?.length && !s.options?.length);

/** Снимок шага миссии. */
export function snapshotOfMission(mission: (typeof MISSIONS)[number], step: (typeof MISSIONS)[number]['steps'][number]): ExerciseSnapshot {
  const options = step.options?.map((o) => ({ text: clip(o.pl ?? ru(o.text)), correct: o.ok }));
  const texts = [ru(step.task), step.line?.pl ? clip(step.line.pl) : '', step.answer ? `верно: ${clip(step.answer)}` : ''].filter(Boolean);
  return { type: `MISSION_${step.kind.toUpperCase()}`, where: 'миссия', title: ru(mission.title), texts, options };
}

const WHERE_BY_MODE: Record<string, string> = { LESSON: 'урок', REVIEW: 'повторение', MISTAKES: 'мои ошибки', FIVE_MIN: '5 минут', SPEED: 'быстрый раунд', GRAMMAR: 'грамматика', EXAM: 'экзамен', PLACEMENT: 'входной тест' };

type Source = 'lesson' | 'practice' | 'exam' | 'placement' | 'mission';
const SOURCE_BY_MODE = (mode: string, kind: string | null): Source => (mode === 'LESSON' ? (kind === 'EXAM' ? 'exam' : 'lesson') : mode === 'EXAM' ? 'exam' : mode === 'PLACEMENT' ? 'placement' : 'practice');

export type ReportInput = { ref: ExerciseReportRef; reason: ExerciseReportReason; comment?: string };

/** Принять жалобу. Повтор по тому же заданию обновляет запись (и снова открывает её). */
export async function reportExercise(userId: string, input: ReportInput): Promise<{ ok: true; updated: boolean }> {
  const comment = input.comment?.trim().slice(0, EXERCISE_REPORT_COMMENT_MAX) || null;
  if (input.reason === 'other' && (!comment || comment.length < 3)) throw new HttpError(400, 'comment_required', 'Describe the problem');

  let target: string;
  let source: Source;
  let exerciseId: string | null = null;
  let lessonSlug: string | null = null;
  let itemType: string;
  let snapshot: ExerciseSnapshot;
  let answer: unknown = null;

  if ('sessionId' in input.ref) {
    const s = (await db.select().from(learningSessions).where(eq(learningSessions.id, input.ref.sessionId)))[0];
    if (!s || s.userId !== userId) throw notFound('session_not_found');
    const key = input.ref.key;
    const item = (s.items as ExerciseItem[]).find((i) => i.key === key);
    if (!item) throw notFound('item_not_found');
    const lesson = s.lessonId ? (await db.select({ slug: lessons.slug, kind: lessons.kind }).from(lessons).where(eq(lessons.id, s.lessonId)))[0] : undefined;
    source = SOURCE_BY_MODE(s.mode, lesson?.kind ?? null);
    exerciseId = item.exerciseId ?? null;
    lessonSlug = lesson?.slug ?? null;
    itemType = item.type;
    // Цель — само задание (одно на всех игроков), а не сессия: так жалобы разных игроков складываются в одну строку админки.
    target = exerciseId ? `exercise:${exerciseId}` : `item:${item.key}`;
    snapshot = snapshotOfItem(item, WHERE_BY_MODE[s.mode] ?? s.mode.toLowerCase());
    const last = (
      await db
        .select({ answer: exerciseAttempts.answer, isCorrect: exerciseAttempts.isCorrect })
        .from(exerciseAttempts)
        .where(and(eq(exerciseAttempts.userId, userId), eq(exerciseAttempts.sessionId, s.id), eq(exerciseAttempts.itemKey, key)))
        .orderBy(desc(exerciseAttempts.createdAt))
        .limit(1)
    )[0];
    if (last) answer = { ...(typeof last.answer === 'object' && last.answer ? (last.answer as object) : { value: last.answer }), correct: last.isCorrect };
  } else {
    const mission = MISSIONS.find((m) => m.slug === (input.ref as { mission: string }).mission);
    const step = mission?.steps.find((x) => x.id === (input.ref as { step: string }).step);
    if (!mission || !step) throw notFound('mission_step_not_found');
    source = 'mission';
    lessonSlug = mission.slug;
    itemType = `MISSION_${step.kind.toUpperCase()}`;
    target = `mission:${step.id}`;
    snapshot = snapshotOfMission(mission, step);
  }

  const existing = (await db.select({ id: exerciseReports.id }).from(exerciseReports).where(and(eq(exerciseReports.userId, userId), eq(exerciseReports.target, target))))[0];
  if (!existing) {
    const since = new Date(Date.now() - 86_400_000);
    const recent = (await db.select({ n: sql<number>`count(*)` }).from(exerciseReports).where(and(eq(exerciseReports.userId, userId), gt(exerciseReports.createdAt, since))))[0];
    if ((recent?.n ?? 0) >= MAX_EXERCISE_REPORTS_PER_DAY) throw new HttpError(429, 'too_many_reports', 'Too many reports today');
  }
  const lang = (await db.select({ l: userSettings.uiLanguage }).from(userSettings).where(eq(userSettings.userId, userId)))[0]?.l ?? null;
  const now = new Date();
  const values = { userId, target, source, exerciseId, lessonSlug, itemType, reason: input.reason, comment, answer, snapshot, uiLang: lang, createdAt: now, updatedAt: now };
  await db
    .insert(exerciseReports)
    .values(values)
    .onConflictDoUpdate({
      target: [exerciseReports.userId, exerciseReports.target],
      set: { reason: input.reason, comment, answer, snapshot, uiLang: lang, status: 'NEW', updatedAt: now, resolvedAt: null },
    });
  return { ok: true, updated: !!existing };
}

export type ExerciseReportGroup = {
  target: string;
  source: Source;
  exerciseId: string | null;
  lessonSlug: string | null;
  itemType: string | null;
  status: ExerciseReportStatus;
  count: number;
  reasons: Record<string, number>;
  lastAt: string;
  note: string | null;
  snapshot: ExerciseSnapshot | null;
  comments: { reason: string; comment: string; lang: string | null; at: string; answer: unknown }[];
};

/** Жалобы, сгруппированные по заданию: чем больше жалоб, тем выше. Статус группы — самый «открытый» из её жалоб. */
export async function listExerciseReports(status: ExerciseReportStatus | 'ALL' = 'NEW'): Promise<ExerciseReportGroup[]> {
  const rows = await db
    .select({
      target: exerciseReports.target,
      count: sql<number>`count(*)`,
      last: sql<number>`max(${exerciseReports.updatedAt})`,
    })
    .from(exerciseReports)
    .where(status === 'ALL' ? undefined : eq(exerciseReports.status, status))
    .groupBy(exerciseReports.target)
    .orderBy(desc(sql`count(*)`), desc(sql`max(${exerciseReports.updatedAt})`))
    .limit(100);
  if (!rows.length) return [];
  const all = await db
    .select()
    .from(exerciseReports)
    .where(and(inArray(exerciseReports.target, rows.map((r) => r.target)), status === 'ALL' ? undefined : eq(exerciseReports.status, status)))
    .orderBy(desc(exerciseReports.updatedAt))
    .limit(600);
  const by = new Map<string, (typeof all)[number][]>();
  for (const r of all) by.set(r.target, [...(by.get(r.target) ?? []), r]);
  const rebuild = [...new Set(rows.map((g) => by.get(g.target)?.[0]).filter((h) => h?.exerciseId && emptySnapshot(h.snapshot as ExerciseSnapshot | null)).map((h) => h!.exerciseId!))];
  const fresh = new Map(
    (rebuild.length ? await db.select({ id: exercises.id, type: exercises.type, skill: exercises.skill, data: exercises.data }).from(exercises).where(inArray(exercises.id, rebuild)) : []).map((e) => [
      e.id,
      snapshotOfItem({ key: e.id, type: e.type, skill: e.skill, data: e.data } as unknown as ExerciseItem, 'задание сейчас'),
    ]),
  );
  return rows.map((g) => {
    const list = by.get(g.target) ?? [];
    const head = list[0];
    const reasons: Record<string, number> = {};
    for (const r of list) reasons[r.reason] = (reasons[r.reason] ?? 0) + 1;
    return {
      target: g.target,
      source: head.source,
      exerciseId: head.exerciseId,
      lessonSlug: head.lessonSlug,
      itemType: head.itemType,
      status: head.status,
      count: Number(g.count),
      reasons,
      lastAt: new Date(Number(g.last)).toISOString(),
      note: list.find((r) => r.adminNote)?.adminNote ?? null,
      snapshot: emptySnapshot(head.snapshot as ExerciseSnapshot | null) && head.exerciseId && fresh.has(head.exerciseId) ? fresh.get(head.exerciseId)! : ((head.snapshot as ExerciseSnapshot | null) ?? null),
      comments: list
        .filter((r) => r.comment || r.answer)
        .slice(0, 5)
        .map((r) => ({ reason: r.reason, comment: r.comment ?? '', lang: r.uiLang, at: r.updatedAt?.toISOString() ?? r.createdAt.toISOString(), answer: r.answer })),
    };
  });
}

/** Сменить статус всех жалоб на задание. Возвращает, сколько жалоб затронуто. */
export async function resolveExerciseReports(target: string, status: ExerciseReportStatus, note?: string): Promise<number> {
  const now = new Date();
  const rows = await db
    .update(exerciseReports)
    .set({ status, adminNote: note?.trim().slice(0, 500) || null, updatedAt: now, resolvedAt: status === 'FIXED' || status === 'REJECTED' ? now : null })
    .where(eq(exerciseReports.target, target))
    .returning({ id: exerciseReports.id });
  if (!rows.length) throw notFound('no_reports');
  return rows.length;
}

/** Сколько заданий ждут разбора (для значка в меню админки). */
export async function newExerciseReportTargets(): Promise<number> {
  const r = (await db.select({ n: sql<number>`count(DISTINCT ${exerciseReports.target})` }).from(exerciseReports).where(eq(exerciseReports.status, 'NEW')))[0];
  return Number(r?.n ?? 0);
}
