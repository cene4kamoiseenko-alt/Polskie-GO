/**
 * Очередь озвучки (2026-11-23). Раньше админка сама гоняла /audio/generate по 10 фраз: свернул окно — браузер замораживал
 * страницу, и генерация вставала; выбрать можно было до 200 фраз. Теперь страница только ставит задание (сколько угодно фраз),
 * а сервер озвучивает его частями:
 *  • cron каждую минуту (jobs.ts → runScheduled) — даже когда админка закрыта;
 *  • tick со страницы, пока она открыта, — чтобы было быстрее.
 * Фразы задания захватываются (pending → running), поэтому cron и страница не озвучивают одно и то же; generateBatch к тому же
 * сам не синтезирует файл, который уже есть или делается (audio-library.ts). Сразу работает одно задание — самое старое.
 */
import { and, asc, desc, eq, inArray, lt, sql } from 'drizzle-orm';
import { chunks, db } from '../db';
import { audioJobItems, audioJobs } from '../db/schema';
import { generateBatch, type GenerateItem, type LibraryModel } from './audio-library';
import { notFound } from '../lib/errors';

export type AudioJobInput = { title: string; items: GenerateItem[]; maxCredits: number; rates?: Partial<Record<LibraryModel, number>>; allowOtherVoice?: boolean; createdBy?: string | null };
export type AudioJobView = {
  id: string; title: string; status: string; stopReason: string | null; maxCredits: number; spent: number; total: number;
  processed: number; pending: number; failed: number; results: Record<string, number>; lastError: string | null; createdAt: Date; finishedAt: Date | null;
};

/** Захваченная фраза, которую не отпустили (обрыв запроса), снова в очереди через 10 минут. */
const STALE_MS = 10 * 60_000;
/** Ретраи ElevenLabs (429 / 5xx) — до трёх попыток на фразу. */
const MAX_ATTEMPTS = 3;
/** D1: до 100 параметров в запросе; Drizzle передаёт все 9 столбцов строки — вставка по 10 строк. */
const INSERT_ROWS = 10;

export async function createAudioJob(input: AudioJobInput): Promise<{ id: string; total: number }> {
  const items = [...new Map(input.items.map((i) => [i.id, i])).values()];
  const [job] = await db
    .insert(audioJobs)
    .values({ title: input.title, maxCredits: input.maxCredits, rates: input.rates ?? {}, allowOtherVoice: !!input.allowOtherVoice, total: items.length, createdBy: input.createdBy ?? null })
    .returning({ id: audioJobs.id });
  const inserts = chunks(items, INSERT_ROWS).map((part) => db.insert(audioJobItems).values(part.map((i) => ({ jobId: job.id, unitId: i.id, text: i.text, model: i.model }))));
  for (const batch of chunks(inserts, 50)) await db.batch(batch as never);
  return { id: job.id, total: items.length };
}

/** Задания со счётчиками из самой строки задания (миграция 0028): фразы не перебираются — лимит чтения D1 не тратится на каждый шаг. */
export async function listAudioJobs(limit = 10): Promise<AudioJobView[]> {
  const jobs = await db.select().from(audioJobs).orderBy(desc(audioJobs.createdAt)).limit(limit);
  return jobs.map(view);
}

function view(j: typeof audioJobs.$inferSelect): AudioJobView {
  const processed = j.doneCount + j.failedCount;
  return {
    id: j.id, title: j.title, status: j.status, stopReason: j.stopReason, maxCredits: j.maxCredits, spent: Math.round(j.spent * 100) / 100, total: j.total,
    processed, pending: Math.max(0, j.total - processed), failed: j.failedCount, results: j.results ?? {}, lastError: j.lastError, createdAt: j.createdAt, finishedAt: j.finishedAt,
  };
}

export async function stopAudioJob(id: string, reason = 'admin') {
  const r = await db.update(audioJobs).set({ status: 'stopped', stopReason: reason, updatedAt: new Date() }).where(and(eq(audioJobs.id, id), inArray(audioJobs.status, ['queued', 'running']))).returning({ id: audioJobs.id });
  if (!r.length && !(await db.query.audioJobs.findFirst({ where: eq(audioJobs.id, id), columns: { id: true } }))) throw notFound('audio_job_not_found');
}

/** Продолжить остановленное задание; можно поднять лимит кредитов (после остановки по бюджету). */
export async function resumeAudioJob(id: string, maxCredits?: number) {
  const job = await db.query.audioJobs.findFirst({ where: eq(audioJobs.id, id) });
  if (!job) throw notFound('audio_job_not_found');
  if (job.status !== 'stopped') return;
  await db.update(audioJobs).set({ status: 'queued', stopReason: null, lastError: null, updatedAt: new Date(), ...(maxCredits != null ? { maxCredits } : {}) }).where(eq(audioJobs.id, id));
}

/** Озвучить следующую часть задания (до maxItems фраз). Возвращает задание после прохода. */
export async function tickAudioJob(id: string, maxItems = 10, now = new Date()): Promise<AudioJobView | null> {
  const job = await db.query.audioJobs.findFirst({ where: eq(audioJobs.id, id) });
  if (!job) throw notFound('audio_job_not_found');
  if (job.status === 'queued' || job.status === 'running') await runPart(job, maxItems, now);
  const after = await db.query.audioJobs.findFirst({ where: eq(audioJobs.id, id) });
  return after ? view(after) : null;
}

/** cron: самое старое незавершённое задание — следующая часть. */
export async function processAudioJobs(now = new Date(), opts: { maxItems?: number } = {}) {
  const job = await db.query.audioJobs.findFirst({ where: inArray(audioJobs.status, ['queued', 'running']), orderBy: [asc(audioJobs.createdAt)] });
  if (job) await runPart(job, opts.maxItems ?? 20, now);
}

async function runPart(job: typeof audioJobs.$inferSelect, maxItems: number, now: Date) {
  // Брошенные захваты (запрос оборвался) — снова в очередь.
  await db.update(audioJobItems).set({ status: 'pending', claimedAt: null }).where(and(eq(audioJobItems.jobId, job.id), eq(audioJobItems.status, 'running'), lt(audioJobItems.claimedAt, new Date(now.getTime() - STALE_MS))));
  const next = await db.select({ unitId: audioJobItems.unitId }).from(audioJobItems).where(and(eq(audioJobItems.jobId, job.id), eq(audioJobItems.status, 'pending'))).orderBy(asc(audioJobItems.unitId)).limit(maxItems);
  const claimed = next.length
    ? await db
        .update(audioJobItems)
        .set({ status: 'running', claimedAt: now })
        .where(and(eq(audioJobItems.jobId, job.id), eq(audioJobItems.status, 'pending'), inArray(audioJobItems.unitId, next.map((n) => n.unitId))))
        .returning()
    : [];
  if (!claimed.length) {
    await finishIfEmpty(job.id, now);
    return;
  }
  if (job.status === 'queued') await db.update(audioJobs).set({ status: 'running', updatedAt: now }).where(eq(audioJobs.id, job.id));
  const left = Math.max(0, job.maxCredits - job.spent);
  let results: Awaited<ReturnType<typeof generateBatch>>;
  try {
    results = await generateBatch(claimed.map((c) => ({ id: c.unitId, text: c.text, model: c.model as LibraryModel })), left, job.rates ?? {}, undefined, { allowOtherVoice: job.allowOtherVoice });
  } catch (e) {
    // Настройки (нет ключа, R2, голос не Kamil): задание стоит, пока админ не исправит и не нажмёт «продолжить».
    await release(job.id, claimed.map((c) => c.unitId));
    await db.update(audioJobs).set({ status: 'stopped', stopReason: 'error', lastError: (e as Error).message.slice(0, 300), updatedAt: now }).where(eq(audioJobs.id, job.id));
    return;
  }
  const spent = results.reduce((n, r) => n + r.credits, 0);
  const stmts = [];
  let stop: string | null = null;
  let done = 0;
  let failed = 0;
  const kinds: Record<string, number> = {};
  for (const r of results) {
    const item = claimed.find((c) => c.unitId === r.id)!;
    const where = and(eq(audioJobItems.jobId, job.id), eq(audioJobItems.unitId, r.id));
    if (r.status === 'generated' || r.status === 'adopted' || r.status === 'exists') {
      done++;
      kinds[r.status] = (kinds[r.status] ?? 0) + 1;
      stmts.push(db.update(audioJobItems).set({ status: 'done', result: r.status, error: null }).where(where));
    } else if (r.status === 'budget') {
      stop = 'budget';
      stmts.push(db.update(audioJobItems).set({ status: 'pending', claimedAt: null }).where(where));
    } else if (r.status === 'locked') {
      // Делается другим запуском — вернётся в очередь и при следующем проходе окажется «уже было».
      stmts.push(db.update(audioJobItems).set({ status: 'pending', claimedAt: null }).where(where));
    } else {
      if (/http_40[13]/.test(r.error ?? '')) stop = 'auth';
      const again = r.retryable && item.attempts + 1 < MAX_ATTEMPTS;
      if (!again) {
        failed++;
        kinds.failed = (kinds.failed ?? 0) + 1;
      }
      stmts.push(db.update(audioJobItems).set({ status: again ? 'pending' : 'failed', result: again ? null : 'failed', error: r.error ?? null, attempts: item.attempts + 1, claimedAt: null }).where(where));
    }
  }
  const lastError = results.find((r) => r.status === 'failed')?.error ?? null;
  stmts.push(
    db
      .update(audioJobs)
      .set({
        spent: sql`${audioJobs.spent} + ${spent}`,
        doneCount: sql`${audioJobs.doneCount} + ${done}`,
        failedCount: sql`${audioJobs.failedCount} + ${failed}`,
        // Итоги по видам — прибавкой в JSON на стороне базы: cron и страница могут закончить проход одновременно.
        results: Object.entries(kinds).reduce((acc, [k, n]) => sql`json_set(${acc}, ${`$.${k}`}, coalesce(json_extract(${acc}, ${`$.${k}`}), 0) + ${n})`, sql`${audioJobs.results}`) as unknown as Record<string, number>,
        updatedAt: now,
        ...(lastError ? { lastError } : {}),
        ...(stop ? { status: 'stopped', stopReason: stop } : {}),
      })
      .where(eq(audioJobs.id, job.id)),
  );
  await db.batch(stmts as never);
  if (!stop) await finishIfEmpty(job.id, now);
}

async function release(jobId: string, unitIds: string[]) {
  await db.update(audioJobItems).set({ status: 'pending', claimedAt: null }).where(and(eq(audioJobItems.jobId, jobId), inArray(audioJobItems.unitId, unitIds)));
}

/** Все фразы разобраны (по счётчикам задания, одна строка) — задание выполнено. */
async function finishIfEmpty(jobId: string, now: Date) {
  await db
    .update(audioJobs)
    .set({ status: 'done', finishedAt: now, updatedAt: now })
    .where(and(eq(audioJobs.id, jobId), inArray(audioJobs.status, ['queued', 'running']), sql`${audioJobs.doneCount} + ${audioJobs.failedCount} >= ${audioJobs.total}`));
}
