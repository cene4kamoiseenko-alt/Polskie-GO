/**
 * Быстрые вопросы бота (/quiz): один вопрос за раз, 20 секунд на ответ, пояснение сразу.
 *
 * Правила:
 *  • тренироваться можно сколько угодно: /quiz и «Следующий вопрос» не ждут паузы. Защита только от спама —
 *    не чаще раза в `QUIZ_MIN_GAP_MS` (двойное нажатие) и не больше `QUIZ_DAILY_CAP` вопросов за местный день;
 *  • XP ограничены: +`QUIZ_XP` только за первые `QUIZ_REWARDED_MAX` верных ответов вовремя за местный день, дальше — без XP;
 *  • пауза `QUIZ_PUSH_GAP_MS` (3 часа) относится только к приглашениям, которые бот присылает сам (`invites.ts`);
 *  • уровень подбирается под ученика (A1–B1), недавние вопросы и тема прошлого вопроса не повторяются.
 * Ответ принимается один раз: строка `bot_quiz_rounds` переходит OPEN → ANSWERED условным UPDATE, поэтому двойное нажатие,
 * повторная доставка Telegram и два одновременных нажатия разных вариантов не дают второго ответа и второй награды.
 * Место в дневном лимите наград тоже занимается условным UPDATE, а XP идёт через `grantXp` с ключом `quiz:<round>`
 * (дневная активность, недельная лига, журнал), задания «Получи N XP» и достижения — Mini App видит их сразу.
 * Серия дней от вопроса не растёт: её продлевают уроки и миссии, а не 20 секунд в чате.
 */
import { and, eq, sql } from 'drizzle-orm';
import { dayKey, shuffle, type UiLang } from '@polski-go/shared';
import { atomic, db } from '../../db';
import { botQuizPlayers, botQuizRounds, newId, playerProgress, userProfiles } from '../../db/schema';
import { botApi, TelegramError } from '../../lib/telegram';
import { evaluateAchievements } from '../../services/achievements';
import { applyQuestEvents } from '../../services/quests';
import { grantXp, loadCtx } from '../../services/rewards';
import { botImageUrl } from '../catalog';
import type { Button } from '../copy';
import type { BotUser } from '../data';
import { escapeHtml as h } from '../html';
import { buildKeyboard, isPhotoProblem, screenUrl } from '../send';
import { QUIZ_COPY, type QuizCopy } from './copy';
import { CATEGORY_NAMES, QUESTION_BY_ID, QUIZ_QUESTIONS, optionsOf, type QuizCategory, type QuizQuestion } from './questions';

/** Сколько верных ответов в местный день дают XP. */
export const QUIZ_REWARDED_MAX = 3;
/** Защита от спама: вопросов за местный день (весь банк — 60, так что тренировке это не мешает). */
export const QUIZ_DAILY_CAP = 30;
/** Два вопроса не чаще, чем раз в 4 секунды (двойное нажатие «Следующий вопрос»). */
export const QUIZ_MIN_GAP_MS = 4_000;
/** Приглашение от бота — не раньше чем через 3 часа после последнего вопроса. */
export const QUIZ_PUSH_GAP_MS = 3 * 3600_000;
export const QUIZ_SECONDS = 20;
/** На экране — 20 секунд; сервер добавляет 10 на доставку нажатия через Telegram. */
export const QUIZ_ON_TIME_MS = 30_000;
export const QUIZ_XP = 10;
const RECENT_KEEP = 40;
/** Варианты длиннее этого не помещаются в кнопку на узком экране: тогда они идут в текст, а кнопки — буквы. */
const BUTTON_TEXT_MAX = 30;
export const LETTERS = ['A', 'B', 'C', 'D', 'E'];

/**
 * Тематические кадры комплекта владельца — с русскими заголовками («ПОКУПКИ»…), поэтому только для русского интерфейса.
 * Для остальных тем и языков вопрос приходит текстом: случайная картинка «не по теме» хуже, чем никакой,
 * а комплект просит не прикладывать фото к каждому сообщению.
 */
const RU_CATEGORY_IMAGES: Partial<Record<QuizCategory, string>> = { shopping: 'ru/shopping.jpg', food: 'ru/food.jpg', transport: 'ru/transport.jpg' };

export function quizImage(question: QuizQuestion, lang: UiLang): string | null {
  return (lang === 'ru' && RU_CATEGORY_IMAGES[question.category]) || null;
}

type Player = typeof botQuizPlayers.$inferSelect;
type Round = typeof botQuizRounds.$inferSelect;

type GateFields = Pick<Player, 'day' | 'dayCount' | 'lastQuestionAt' | 'rewardDay' | 'rewardCount'>;

/** Сколько ещё верных ответов сегодня дадут XP. */
export function rewardsLeft(player: Pick<Player, 'rewardDay' | 'rewardCount'> | null | undefined, day: string): number {
  const used = player && player.rewardDay === day ? player.rewardCount : 0;
  return Math.max(0, QUIZ_REWARDED_MAX - used);
}

export type Gate = { status: 'open'; rewardsLeft: number } | { status: 'busy' } | { status: 'cap' };

/** Можно ли задать вопрос вручную: только защита от спама (двойное нажатие, дневной потолок), без паузы в часы. */
export function quizGate(player: GateFields | null | undefined, day: string, now: Date): Gate {
  if (player && player.day === day && player.dayCount >= QUIZ_DAILY_CAP) return { status: 'cap' };
  if (player?.lastQuestionAt && now.getTime() - player.lastQuestionAt.getTime() < QUIZ_MIN_GAP_MS) return { status: 'busy' };
  return { status: 'open', rewardsLeft: rewardsLeft(player, day) };
}

/** Можно ли боту самому прислать приглашение: прошло 3 часа с последнего вопроса и сегодня ещё есть XP за ответы. */
export function inviteAllowed(player: GateFields | null | undefined, day: string, now: Date): boolean {
  if (player?.lastQuestionAt && now.getTime() - player.lastQuestionAt.getTime() < QUIZ_PUSH_GAP_MS) return false;
  return quizGate(player, day, now).status === 'open' && rewardsLeft(player, day) > 0;
}

const LEVEL_WEIGHTS: Record<'low' | 'mid' | 'high', Record<QuizQuestion['cefr'], number>> = {
  low: { A1: 6, A2: 3, B1: 1 },
  mid: { A1: 2, A2: 5, B1: 3 },
  high: { A1: 1, A2: 4, B1: 5 },
};
const band = (level: string | null) => (level === 'B1' || level === 'B2' ? 'high' : level === 'A2' ? 'mid' : 'low');

/** Вопрос под уровень: без недавних и, если можно, не из темы прошлого вопроса. */
export function pickQuestion(recent: string[], level: string | null, rnd: () => number = Math.random): QuizQuestion {
  const seen = new Set(recent);
  const lastCategory = recent.length ? QUESTION_BY_ID.get(recent[recent.length - 1])?.category : undefined;
  let pool = QUIZ_QUESTIONS.filter((x) => !seen.has(x.id));
  if (!pool.length) pool = QUIZ_QUESTIONS.filter((x) => x.id !== recent[recent.length - 1]);
  const otherTopic = pool.filter((x) => x.category !== lastCategory);
  if (otherTopic.length) pool = otherTopic;
  const weights = LEVEL_WEIGHTS[band(level)];
  const total = pool.reduce((s, x) => s + weights[x.cefr], 0);
  let r = rnd() * total;
  for (const x of pool) {
    r -= weights[x.cefr];
    if (r <= 0) return x;
  }
  return pool[pool.length - 1];
}

/** Уровень ученика: подтверждённый экзаменом, иначе результат вступительного теста или самооценка. */
async function levelOf(userId: string): Promise<string | null> {
  const [p, prof] = await Promise.all([
    db.select({ level: playerProgress.languageLevel }).from(playerProgress).where(eq(playerProgress.userId, userId)).get(),
    db.select({ placement: userProfiles.placementLevel, self: userProfiles.selfLevel }).from(userProfiles).where(eq(userProfiles.userId, userId)).get(),
  ]);
  if (p?.level && p.level !== 'A0') return p.level;
  return prof?.placement ?? prof?.self ?? null;
}

export type QuizTarget = { telegramId: number; chatId: number; lang: UiLang; user: BotUser | null; source: 'command' | 'push' | 'next' };

export type StartResult = { status: 'sent'; roundId: string; questionId: string } | { status: 'busy' } | { status: 'cap' };

/**
 * Задать вопрос. Если сейчас нельзя (двойное нажатие или дневной потолок) — ничего не отправляет и возвращает причину:
 * команда отвечает сообщением (`sendQuizBlocked`), кнопка — всплывающей подсказкой.
 */
export async function startQuiz(t: QuizTarget, now = new Date()): Promise<StartResult> {
  const tz = t.user?.timezone ?? 'Europe/Warsaw';
  const day = dayKey(now, tz);
  const player = await db.select().from(botQuizPlayers).where(eq(botQuizPlayers.telegramId, t.telegramId)).get();
  const gate = quizGate(player, day, now);
  if (gate.status !== 'open') return { status: gate.status };

  const recent = player?.recent ?? [];
  const question = pickQuestion(recent, t.user ? await levelOf(t.user.id).catch(() => null) : null);
  const order = shuffle([...optionsOf(question, t.lang).keys()]);
  const nextRecent = [...recent.filter((id) => id !== question.id), question.id].slice(-RECENT_KEEP);
  const nowMs = now.getTime();

  // Захват места: пройдёт только один из параллельных запросов (условия двойного нажатия и потолка — в самом UPSERT).
  const claimed = await db.all<{ day_count: number }>(sql`
    INSERT INTO bot_quiz_players (telegram_id, push_enabled, day, day_count, last_question_at, answered, correct, ignored_pushes, recent, created_at, updated_at)
    VALUES (${t.telegramId}, 1, ${day}, 1, ${nowMs}, 0, 0, 0, ${JSON.stringify(nextRecent)}, ${nowMs}, ${nowMs})
    ON CONFLICT (telegram_id) DO UPDATE SET
      day_count = CASE WHEN bot_quiz_players.day = excluded.day THEN bot_quiz_players.day_count + 1 ELSE 1 END,
      day = excluded.day,
      last_question_at = excluded.last_question_at,
      recent = excluded.recent,
      ignored_pushes = CASE WHEN ${t.source} = 'push' THEN 0 ELSE bot_quiz_players.ignored_pushes END,
      updated_at = excluded.updated_at
    WHERE (bot_quiz_players.last_question_at IS NULL OR bot_quiz_players.last_question_at <= ${nowMs - QUIZ_MIN_GAP_MS})
      AND (bot_quiz_players.day IS NOT excluded.day OR bot_quiz_players.day_count < ${QUIZ_DAILY_CAP})
    RETURNING day_count`);
  if (!claimed.length) {
    const fresh = await db.select().from(botQuizPlayers).where(eq(botQuizPlayers.telegramId, t.telegramId)).get();
    const again = quizGate(fresh, day, now);
    return { status: again.status === 'cap' ? 'cap' : 'busy' };
  }

  const roundId = newId();
  const revert = async () => {
    // Вопрос не ушёл: возвращаем лимит и паузу (только если с тех пор их никто не менял).
    await atomic([
      db.delete(botQuizRounds).where(eq(botQuizRounds.id, roundId)),
      player
        ? db
            .update(botQuizPlayers)
            .set({ day: player.day, dayCount: player.dayCount, lastQuestionAt: player.lastQuestionAt, recent: player.recent })
            .where(and(eq(botQuizPlayers.telegramId, t.telegramId), eq(botQuizPlayers.lastQuestionAt, now)))
        : db.delete(botQuizPlayers).where(and(eq(botQuizPlayers.telegramId, t.telegramId), eq(botQuizPlayers.lastQuestionAt, now), eq(botQuizPlayers.answered, 0))),
    ]).catch((e) => console.warn('quiz: revert failed', (e as Error).message));
  };
  try {
    await db.insert(botQuizRounds).values({ id: roundId, telegramId: t.telegramId, chatId: t.chatId, questionId: question.id, optionOrder: order, lang: t.lang, source: t.source, status: 'OPEN', sentAt: now });
    const view = questionView(question, order, t.lang, roundId);
    const sent = await sendWithPhoto(t.chatId, view.text, view.keyboard, quizImage(question, t.lang));
    await db.update(botQuizRounds).set({ messageId: sent.messageId, hasPhoto: sent.photo, sentAt: new Date() }).where(eq(botQuizRounds.id, roundId));
  } catch (e) {
    await revert();
    throw e;
  }
  return { status: 'sent', roundId, questionId: question.id };
}

/**
 * Ответ на /quiz, когда вопрос задать нельзя. Двойное нажатие молчит (первый вопрос уже в пути),
 * дневной потолок — сообщение с кнопкой к урокам.
 */
export async function sendQuizBlocked(t: QuizTarget, result: Exclude<StartResult, { status: 'sent' }>) {
  if (result.status === 'busy') return;
  const copy = QUIZ_COPY[t.lang];
  const buttons: Button[] = [{ label: copy.openLesson, screen: 'learn' }];
  await botApi('sendMessage', { chat_id: t.chatId, text: copy.cap(QUIZ_DAILY_CAP), reply_markup: buildKeyboard(buttons, { chatType: 'private' }) });
}

type InlineKeyboard = { inline_keyboard: ({ text: string; callback_data: string } | { text: string; web_app: { url: string } })[][] };

/** Текст вопроса и кнопки вариантов. Длинные варианты — в тексте, кнопки — только буквы. */
export function questionView(question: QuizQuestion, order: number[], lang: UiLang, roundId: string): { text: string; keyboard: InlineKeyboard } {
  const copy = QUIZ_COPY[lang];
  const options = optionsOf(question, lang);
  const shown = order.map((i) => options[i]);
  const short = shown.every((o) => o.length <= BUTTON_TEXT_MAX);
  const text = [
    h(copy.header(CATEGORY_NAMES[question.category][lang], question.cefr)),
    '',
    `<b>${h(question.prompt[lang])}</b>`,
    ...(short ? [] : ['', ...shown.map((o, i) => `<b>${LETTERS[i]}</b> — ${h(o)}`)]),
    '',
    h(copy.choose(QUIZ_SECONDS)),
  ].join('\n');
  const button = (i: number) => ({ text: short ? `${LETTERS[i]} · ${shown[i]}` : LETTERS[i], callback_data: `qa:${roundId}:${i}` });
  const keyboard = { inline_keyboard: short ? shown.map((_, i) => [button(i)]) : [shown.map((_, i) => button(i))] };
  return { text, keyboard };
}

/** Итог ответа: верно / нет / время вышло, правильный вариант, пояснение, XP и сколько ещё ответов сегодня дадут XP. */
export function resultView(round: Round, question: QuizQuestion, opts: { hasUser: boolean; rewardsLeft: number; cap: boolean }): { text: string; keyboard: InlineKeyboard } {
  const lang = round.lang as UiLang;
  const copy = QUIZ_COPY[lang];
  const options = optionsOf(question, lang);
  const letterOf = (optionIndex: number) => LETTERS[round.optionOrder.indexOf(optionIndex)] ?? '?';
  const verdict = !round.onTime ? copy.late : round.correct ? copy.correct : copy.wrong;
  const rewardLine = !opts.hasUser ? [] : [h(opts.rewardsLeft > 0 ? copy.rewardsLeft(opts.rewardsLeft) : copy.rewardsDone)];
  const text = [
    h(copy.header(CATEGORY_NAMES[question.category][lang], question.cefr)),
    `<b>${h(question.prompt[lang])}</b>`,
    '',
    `<b>${h(verdict)}</b>`,
    ...(!round.correct && round.chosen !== null ? [h(copy.yourAnswer(letterOf(round.chosen), options[round.chosen] ?? ''))] : []),
    h(copy.rightAnswer(letterOf(question.answer), options[question.answer])),
    '',
    h(copy.explainTitle),
    h(question.explain[lang]),
    '',
    ...(round.xp > 0 ? [h(copy.xp(round.xp))] : round.correct && round.onTime && !opts.hasUser ? [h(copy.noAccount)] : []),
    ...rewardLine,
  ].join('\n');

  const keyboard: InlineKeyboard = {
    inline_keyboard: [
      [{ text: opts.cap ? copy.tomorrow : copy.nextNow, callback_data: 'qz:next' }],
      [opts.hasUser ? { text: copy.openLesson, web_app: { url: screenUrl('learn') } } : { text: copy.openApp, web_app: { url: screenUrl('home') } }],
    ],
  };
  return { text, keyboard };
}

const pushToggle = (copy: QuizCopy, enabled: boolean) => (enabled ? { text: copy.pushOff, callback_data: 'qz:push:0' } : { text: copy.pushOn, callback_data: 'qz:push:1' });

/** Фото с подписью; если Telegram отверг саму картинку — тот же текст сообщением. */
async function sendWithPhoto(chatId: number, text: string, keyboard: InlineKeyboard, image: string | null): Promise<{ messageId: number | null; photo: boolean }> {
  const photo = image ? botImageUrl(image) : '';
  if (photo.startsWith('https://')) {
    try {
      const msg = await botApi<{ message_id: number }>('sendPhoto', { chat_id: chatId, photo, caption: text, parse_mode: 'HTML', reply_markup: keyboard });
      return { messageId: msg?.message_id ?? null, photo: true };
    } catch (e) {
      if (!isPhotoProblem(e)) throw e;
      console.warn('quiz: photo rejected, sending text', (e as Error).message);
    }
  }
  const msg = await botApi<{ message_id: number }>('sendMessage', { chat_id: chatId, text, parse_mode: 'HTML', reply_markup: keyboard });
  return { messageId: msg?.message_id ?? null, photo: false };
}

/** Заменить вопрос итогом в том же сообщении; если сообщение уже не изменить — прислать итог отдельно. */
async function showResult(round: Round, view: { text: string; keyboard: InlineKeyboard }) {
  if (round.messageId) {
    try {
      await botApi(round.hasPhoto ? 'editMessageCaption' : 'editMessageText', {
        chat_id: round.chatId,
        message_id: round.messageId,
        ...(round.hasPhoto ? { caption: view.text } : { text: view.text }),
        parse_mode: 'HTML',
        reply_markup: view.keyboard,
      });
      return;
    } catch (e) {
      if (e instanceof TelegramError && /not modified/i.test(e.description)) return;
      if (!(e instanceof TelegramError) || e.code !== 400) throw e;
    }
  }
  await botApi('sendMessage', { chat_id: round.chatId, text: view.text, parse_mode: 'HTML', reply_markup: view.keyboard });
}

/**
 * Занять место в дневном лимите наград (не больше `QUIZ_REWARDED_MAX` за местный день).
 * Условный UPDATE: два одновременных верных ответа не займут больше мест, чем есть.
 */
async function claimRewardSlot(telegramId: number, day: string, now: Date): Promise<boolean> {
  const rows = await db.all<{ reward_count: number }>(sql`
    UPDATE bot_quiz_players SET
      reward_count = CASE WHEN reward_day = ${day} THEN reward_count + 1 ELSE 1 END,
      reward_day = ${day},
      updated_at = ${now.getTime()}
    WHERE telegram_id = ${telegramId} AND (reward_day IS NOT ${day} OR reward_count < ${QUIZ_REWARDED_MAX})
    RETURNING reward_count`);
  return rows.length > 0;
}

async function releaseRewardSlot(telegramId: number, day: string) {
  await db
    .run(sql`UPDATE bot_quiz_players SET reward_count = MAX(reward_count - 1, 0) WHERE telegram_id = ${telegramId} AND reward_day = ${day}`)
    .catch((e) => console.warn('quiz: reward slot not released', (e as Error).message));
}

/** XP за верный ответ вовремя: журнал, день, лига, задания «Получи N XP», достижения. Возвращает начисленное (0 — без прогресса). */
async function awardXp(userId: string, roundId: string, now: Date): Promise<number> {
  let ctx;
  try {
    ctx = await loadCtx(userId, now);
  } catch {
    return 0;
  }
  // Ключ на раунд: повторная попытка (сбой после записи) не начислит второй раз.
  const xp = grantXp(ctx, QUIZ_XP, 'quiz', `quiz:${roundId}`);
  if (!xp.granted) return 0;
  const quests = await applyQuestEvents(ctx, { XP: xp.granted });
  await atomic([...xp.stmts, ...quests.stmts]);
  const ach = await evaluateAchievements(userId, null);
  if (ach.stmts.length) await atomic(ach.stmts);
  return xp.granted;
}

export type CallbackQuery = {
  id: string;
  from: { id: number; is_bot?: boolean; language_code?: string; first_name?: string };
  message?: { message_id: number; chat: { id: number; type?: string } };
  data?: string;
};

/** Всплывающая подсказка на нажатие (сбой здесь ничего не ломает: ответ уже записан). */
async function toast(cb: CallbackQuery, text?: string) {
  try {
    await botApi('answerCallbackQuery', { callback_query_id: cb.id, ...(text ? { text } : {}) });
  } catch (e) {
    console.warn('quiz: callback answer failed', (e as Error).message);
  }
}

/** Итог для отправленного вопроса с учётом лимита наград и переключателем приглашений. */
async function resultFor(round: Round, question: QuizQuestion, user: BotUser | null, now: Date) {
  const player = await db.select().from(botQuizPlayers).where(eq(botQuizPlayers.telegramId, round.telegramId)).get();
  const day = dayKey(now, user?.timezone ?? 'Europe/Warsaw');
  const view = resultView(round, question, { hasUser: !!user, rewardsLeft: rewardsLeft(player, day), cap: !!player && player.day === day && player.dayCount >= QUIZ_DAILY_CAP });
  view.keyboard.inline_keyboard.push([pushToggle(QUIZ_COPY[round.lang as UiLang], player?.pushEnabled ?? true)]);
  return view;
}

/** Нажатия inline-кнопок квиза: ответ `qa:<вопрос>:<позиция>`, `qz:go`, `qz:next`, `qz:push:0|1`. */
export async function handleQuizCallback(cb: CallbackQuery, user: BotUser | null, lang: UiLang, now = new Date()): Promise<string> {
  const data = cb.data ?? '';
  const copy = QUIZ_COPY[lang];
  const chat = cb.message?.chat;
  if (!chat || (chat.type && chat.type !== 'private')) {
    await toast(cb, copy.group);
    return 'group';
  }

  const answer = /^qa:([0-9a-f]{32}):(\d)$/.exec(data);
  if (answer) return answerRound(cb, answer[1], Number(answer[2]), user, now);

  if (data === 'qz:go' || data === 'qz:next') {
    const res = await startQuiz({ telegramId: cb.from.id, chatId: chat.id, lang, user, source: data === 'qz:go' ? 'push' : 'next' }, now);
    await toast(cb, res.status === 'cap' ? copy.cap(QUIZ_DAILY_CAP) : undefined);
    return res.status;
  }

  const push = /^qz:push:([01])$/.exec(data);
  if (push) {
    const enabled = push[1] === '1';
    await db
      .insert(botQuizPlayers)
      .values({ telegramId: cb.from.id, pushEnabled: enabled })
      .onConflictDoUpdate({ target: botQuizPlayers.telegramId, set: { pushEnabled: enabled, ignoredPushes: 0, updatedAt: now } });
    await toast(cb, enabled ? copy.pushOnDone : copy.pushOffDone);
    // Кнопка в сообщении меняется на противоположную.
    if (cb.message) {
      const row = cb.message as { message_id: number; chat: { id: number }; reply_markup?: InlineKeyboard };
      const rows = row.reply_markup?.inline_keyboard ?? [];
      if (rows.length) {
        const updated = rows.map((r) => r.map((b) => ('callback_data' in b && b.callback_data.startsWith('qz:push:') ? pushToggle(copy, enabled) : b)));
        await botApi('editMessageReplyMarkup', { chat_id: row.chat.id, message_id: row.message_id, reply_markup: { inline_keyboard: updated } }).catch(() => {});
      }
    }
    return enabled ? 'push_on' : 'push_off';
  }

  await toast(cb, copy.expired);
  return 'unknown';
}

async function answerRound(cb: CallbackQuery, roundId: string, position: number, user: BotUser | null, now: Date): Promise<string> {
  const round = await db.select().from(botQuizRounds).where(eq(botQuizRounds.id, roundId)).get();
  const question = round ? QUESTION_BY_ID.get(round.questionId) : undefined;
  const lang = (round?.lang as UiLang | undefined) ?? 'uk';
  const copy = QUIZ_COPY[lang];
  if (!round || !question) {
    await toast(cb, copy.expired);
    return 'expired';
  }
  if (round.telegramId !== cb.from.id) {
    await toast(cb, copy.notYours);
    return 'not_yours';
  }
  const chosen = round.optionOrder[position];
  if (round.status === 'ANSWERED' || chosen === undefined) {
    // Повторное нажатие или повтор доставки: итог тот же, награды второй раз нет.
    if (round.status === 'ANSWERED') await showResult(round, await resultFor(round, question, user, now));
    await toast(cb, round.status === 'ANSWERED' ? copy.already : copy.expired);
    return 'already';
  }

  const correct = chosen === question.answer;
  const onTime = now.getTime() - round.sentAt.getTime() <= QUIZ_ON_TIME_MS;
  const claimed = await db
    .update(botQuizRounds)
    .set({ status: 'ANSWERED', chosen, correct, onTime, answeredAt: now })
    .where(and(eq(botQuizRounds.id, round.id), eq(botQuizRounds.status, 'OPEN')))
    .returning({ id: botQuizRounds.id });
  if (!claimed.length) {
    const fresh = await db.select().from(botQuizRounds).where(eq(botQuizRounds.id, round.id)).get();
    if (fresh) await showResult(fresh, await resultFor(fresh, question, user, now));
    await toast(cb, copy.already);
    return 'already';
  }

  let xp = 0;
  if (correct && onTime && user) {
    const day = dayKey(now, user.timezone ?? 'Europe/Warsaw');
    if (await claimRewardSlot(cb.from.id, day, now)) {
      try {
        xp = await awardXp(user.id, round.id, now);
      } catch (e) {
        console.warn('quiz: xp not granted', (e as Error).message);
      }
      if (!xp) await releaseRewardSlot(cb.from.id, day);
    }
  }
  await atomic([
    ...(xp ? [db.update(botQuizRounds).set({ xp }).where(eq(botQuizRounds.id, round.id))] : []),
    db
      .update(botQuizPlayers)
      .set({ answered: sql`${botQuizPlayers.answered} + 1`, correct: sql`${botQuizPlayers.correct} + ${correct ? 1 : 0}`, ignoredPushes: 0, updatedAt: now })
      .where(eq(botQuizPlayers.telegramId, cb.from.id)),
  ]);

  const done: Round = { ...round, status: 'ANSWERED', chosen, correct, onTime, answeredAt: now, xp };
  await toast(cb, !onTime ? copy.toastLate : correct ? copy.toastCorrect(xp) : copy.toastWrong);
  await showResult(done, await resultFor(done, question, user, now));
  return !onTime ? 'late' : correct ? 'correct' : 'wrong';
}

