/**
 * Отправка вопроса дня: отдельный cron раз в минуту (свой вызов Worker и свой лимит подзапросов), не больше DAILY_PER_RUN вызовов
 * Bot API за запуск. Порядок одного запуска:
 *  1. рассылка включена, день наступил, сейчас окно отправки (от времени рассылки 4 часа), день не пропущен в плане;
 *  2. ход дня (курсор по telegram_id) — в app_state, сохраняется по ходу запуска и в конце; новый день — с начала, «done» — до завтра
 *     ничего не делаем; непредвиденная ошибка на человеке останавливает запуск на нём (курсор остаётся перед ним, повтор в следующую минуту);
 *  3. кандидаты по курсору (до 100), правило «кто получает» (audience.ts); захват (день, человек) INSERT … ON CONFLICT DO NOTHING —
 *     два пересёкшихся запуска не пришлют одному человеку два вопроса;
 *  4. раунд bot_quiz_rounds (source 'daily', без таймера) → фото сцены с вопросом → SENT; ошибка Telegram записывается:
 *     403 «blocked» — BLOCKED (и bot_contacts.blocked_at), 403 «can't initiate» / 400 «chat not found» — NO_CHAT, 429 — захват снимается
 *     и запуск заканчивается (повтор в следующую минуту), неизвестный результат сети — UNKNOWN (не повторяем), прочее — FAILED.
 */
import { and, eq, lt } from 'drizzle-orm';
import { dayDiff, dayKey, effectiveStreak, shuffle, type UiLang } from '@polski-go/shared';
import { db } from '../../db';
import { botQuizRounds, dailyQuizPeople, dailyQuizSends, newId } from '../../db/schema';
import { badRequest } from '../../lib/errors';
import { TelegramError } from '../../lib/telegram';
import { recordBotBlocked } from '../../services/bot-audience';
import { sendWithPhoto } from '../quiz/engine';
import { QUESTION_BY_ID } from '../quiz/questions';
import { isQuizScene, quizSceneFile, type QuizScene } from '../quiz/scenes';
import { dailyEligibility, personLang, personLevel, scanPeople, type DailyPerson } from './audience';
import { ensurePlan, planDay, type PlanRow } from './plan';
import { DAILY_LEVELS, isSendingDay, readDailyRun, readDailyState, sendWindow, warsawDay, writeDailyRun, type DailyLevel } from './state';
import { dailyQuestionView, type DailyExtra } from './views';

export const DAILY_CRON = '* * * * *';
/** Вызовов Bot API за минутный запуск (бесплатный Worker — 50 подзапросов; запас на запасной текст без фото). */
export const DAILY_PER_RUN = 40;
/** Сколько кандидатов читать за запуск. */
const SCAN = 100;
const LEASE_MS = 5 * 60_000;
/** Курсор дня сохраняется каждые столько обработанных людей: оборванный запуск (лимит Worker) не заставит следующий начинать заново. */
const CURSOR_EVERY = 8;

/** Сегодня идёт рассылка вопроса дня (включена, день наступил, не пропущен): для напоминаний и приглашений /quiz. */
export async function dailyReplacesReminders(now: Date): Promise<boolean> {
  const state = await readDailyState();
  const today = warsawDay(now);
  if (!isSendingDay(state, today)) return false;
  const plan = await planDay(today);
  return !DAILY_LEVELS.some((l) => plan[l]?.skipped);
}

/** Строка серии в вопросе: у игрока приложения серия ≥ 2 и сегодня он ещё не занимался, или «давно не виделись» (3+ дня). */
function extraFor(p: DailyPerson, now: Date): DailyExtra {
  if (!p.userId) return { streak: null, returning: false, hasUser: false };
  const today = dayKey(now, p.timezone ?? 'Europe/Warsaw');
  if (p.lastActiveDay === today) return { streak: null, returning: false, hasUser: true };
  const streak = effectiveStreak(p.streakCurrent ?? 0, p.lastActiveDay, today);
  const returning = !!p.lastActiveDay && dayDiff(p.lastActiveDay, today) >= 3;
  return { streak: streak >= 2 ? streak : null, returning, hasUser: true };
}

type Outcome = 'sent' | 'dup' | 'failed' | 'rate_limited';

async function sendTo(p: DailyPerson, row: PlanRow, day: string, now: Date, stats: { calls: number }): Promise<Outcome> {
  const q = QUESTION_BY_ID.get(row.questionId);
  if (!q) return 'failed';
  const level = personLevel(p);
  const lang = personLang(p);
  const claimed = await db
    .insert(dailyQuizSends)
    .values({ day, telegramId: p.telegramId, userId: p.userId, level, lang, questionId: q.id, status: 'PENDING', leaseUntil: new Date(now.getTime() + LEASE_MS), createdAt: now })
    .onConflictDoNothing()
    .returning({ day: dailyQuizSends.day });
  if (!claimed.length) return 'dup';
  const roundId = newId();
  const order = shuffle([0, 1, 2, 3]);
  const image = isQuizScene(row.image) ? row.image : q.image;
  const where = and(eq(dailyQuizSends.day, day), eq(dailyQuizSends.telegramId, p.telegramId));
  try {
    await db.insert(botQuizRounds).values({ id: roundId, telegramId: p.telegramId, chatId: p.telegramId, questionId: q.id, optionOrder: order, lang, source: 'daily', status: 'OPEN', sentAt: now });
    const view = dailyQuestionView(q, order, lang, roundId, extraFor(p, now));
    const sent = await sendWithPhoto(p.telegramId, view.text, view.keyboard, quizSceneFile(image), stats);
    // Активность с прошлой отправки (писал боту, открывал приложение) обнуляет счёт пропусков: этот вопрос — первый без ответа.
    const active = Math.max(p.contactSeenAt?.getTime() ?? 0, p.appSeenAt?.getTime() ?? 0) > (p.lastSentAt?.getTime() ?? 0);
    const ignored = !p.lastSentAt || active ? 1 : p.ignored + 1;
    await db.batch([
      db.update(botQuizRounds).set({ messageId: sent.messageId, hasPhoto: sent.photo }).where(eq(botQuizRounds.id, roundId)),
      db.update(dailyQuizSends).set({ status: 'SENT', roundId, sentAt: now, leaseUntil: null }).where(where),
      db
        .insert(dailyQuizPeople)
        .values({ telegramId: p.telegramId, ignored, lastSentAt: now })
        .onConflictDoUpdate({ target: dailyQuizPeople.telegramId, set: { ignored, lastSentAt: now, updatedAt: now } }),
    ]);
    return 'sent';
  } catch (e) {
    await db.delete(botQuizRounds).where(eq(botQuizRounds.id, roundId)).catch(() => {});
    const tg = e instanceof TelegramError ? e : null;
    if (tg?.code === 429) {
      await db.delete(dailyQuizSends).where(where).catch(() => {});
      return 'rate_limited';
    }
    const desc = tg?.description ?? '';
    const status =
      tg && tg.code === 403 && /initiate/i.test(desc)
        ? 'NO_CHAT'
        : tg && tg.code === 400 && /chat not found/i.test(desc)
          ? 'NO_CHAT'
          : tg?.code === 403
            ? 'BLOCKED'
            : tg?.ambiguous
              ? 'UNKNOWN'
              : 'FAILED';
    console.warn('daily quiz: not delivered', p.telegramId, status, (e as Error).message);
    await db.update(dailyQuizSends).set({ status, error: String((e as Error).message ?? e).slice(0, 200), leaseUntil: null }).where(where).catch(() => {});
    if (status === 'BLOCKED') await recordBotBlocked({ id: p.telegramId, first_name: p.firstName }, true, now).catch(() => {});
    if (status === 'NO_CHAT')
      await db
        .insert(dailyQuizPeople)
        .values({ telegramId: p.telegramId, noChatAt: now })
        .onConflictDoUpdate({ target: dailyQuizPeople.telegramId, set: { noChatAt: now, updatedAt: now } })
        .catch(() => {});
    return 'failed';
  }
}

/** Один минутный запуск. Возвращает, сколько вопросов ушло и сколько было вызовов Bot API. */
export async function runDailyQuizTick(now = new Date(), budget = DAILY_PER_RUN): Promise<{ sent: number; calls: number }> {
  const out = { sent: 0, calls: 0 };
  if (budget <= 0) return out;
  const state = await readDailyState();
  const today = warsawDay(now);
  if (!isSendingDay(state, today)) return out;
  const { from, to } = sendWindow(state, today);
  if (now < from || now >= to) return out;
  const prev = await readDailyRun();
  const run = prev && prev.day === today ? { ...prev } : { day: today, cursor: 0, done: false, startedAt: now.getTime() };
  if (run.done) return out;
  let plan = await planDay(today);
  if (DAILY_LEVELS.some((l) => !plan[l])) {
    await ensurePlan(today, 1);
    plan = await planDay(today);
  }
  if (DAILY_LEVELS.some((l) => plan[l]?.skipped)) return out;

  // Воркер мог упасть после захвата: результат неизвестен, повторно не шлём.
  await db
    .update(dailyQuizSends)
    .set({ status: 'UNKNOWN', error: 'lease_expired', leaseUntil: null })
    .where(and(eq(dailyQuizSends.status, 'PENDING'), lt(dailyQuizSends.leaseUntil, now)));

  const stats = { calls: 0 };
  const people = await scanPeople(run.cursor, SCAN);
  let processed = 0;
  let stopped = false;
  for (const p of people) {
    if (stats.calls >= budget) break;
    if (dailyEligibility(p) === 'ok') {
      let outcome: Outcome;
      try {
        outcome = await sendTo(p, plan[personLevel(p) as DailyLevel]!, today, now, stats);
      } catch (e) {
        // Сбой базы или лимит запросов Worker на самом захвате: человека не пропускаем, курсор остаётся перед ним.
        console.error('daily quiz: tick stopped', p.telegramId, (e as Error).message);
        stopped = true;
        break;
      }
      if (outcome === 'rate_limited') {
        stopped = true;
        break;
      }
      if (outcome === 'sent') out.sent++;
    }
    processed++;
    run.cursor = p.telegramId;
    if (processed % CURSOR_EVERY === 0) await writeDailyRun(run).catch(() => {});
  }
  if (!stopped && processed === people.length && people.length < SCAN) run.done = true;
  await writeDailyRun(run);
  out.calls = stats.calls;
  return out;
}

/** «Прислать себе» из админки: вопрос дня из плана на день и уровень, с пометкой «пробная отправка»; в статистику не идёт. */
export async function sendDailyTest(telegramId: number, lang: UiLang, day: string, level: DailyLevel): Promise<void> {
  let row = (await planDay(day))[level];
  if (!row) {
    await ensurePlan(day, 1);
    row = (await planDay(day))[level];
  }
  const q = row && QUESTION_BY_ID.get(row.questionId);
  if (!row || !q) throw badRequest('no_plan_day');
  const roundId = newId();
  const order = shuffle([0, 1, 2, 3]);
  await db.insert(botQuizRounds).values({ id: roundId, telegramId, chatId: telegramId, questionId: q.id, optionOrder: order, lang, source: 'test', status: 'OPEN', sentAt: new Date() });
  const view = dailyQuestionView(q, order, lang, roundId, { streak: null, returning: false, hasUser: true, test: true });
  try {
    const sent = await sendWithPhoto(telegramId, view.text, view.keyboard, quizSceneFile((isQuizScene(row.image) ? row.image : q.image) as QuizScene));
    await db.update(botQuizRounds).set({ messageId: sent.messageId, hasPhoto: sent.photo }).where(eq(botQuizRounds.id, roundId));
  } catch (e) {
    await db.delete(botQuizRounds).where(eq(botQuizRounds.id, roundId)).catch(() => {});
    if (e instanceof TelegramError && (e.code === 403 || (e.code === 400 && /chat not found/i.test(e.description)))) throw badRequest('bot_blocked');
    throw e;
  }
}
