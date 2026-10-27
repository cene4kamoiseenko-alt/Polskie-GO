/**
 * Быстрые вопросы (/quiz) целиком: банк из 60 вопросов, команда → вопрос с кнопками → нажатие (callback_query) →
 * правильный ответ и пояснение → XP в D1 (журнал, день, лига, задание «Получи 100 XP») → видно в Mini App (/api/me).
 * Двойные нажатия, повтор доставки, устаревшие и чужие кнопки, опоздание, лимит наград без запрета тренировки, приглашения cron.
 * Telegram здесь — подмена fetch (`fakeTelegram`): это проверка кода сервера, а не настоящего бота.
 */
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { and, eq, sql } from 'drizzle-orm';
import { dayKey, UI_LANGS } from '@polski-go/shared';
import { db } from '../src/db';
import { botQuizPlayers, botQuizRounds, dailyActivity, notificationLog, playerProgress, quests, userQuests, userSettings, xpEvents } from '../src/db/schema';
import { QUIZ_COPY } from '../src/bot/quiz/copy';
import { inviteHour, sendQuizInvites } from '../src/bot/quiz/invites';
import { inviteAllowed, LETTERS, pickQuestion, questionView, quizGate, QUIZ_DAILY_CAP, QUIZ_MIN_GAP_MS, QUIZ_PUSH_GAP_MS, QUIZ_REWARDED_MAX, QUIZ_XP, resultView, rewardsLeft } from '../src/bot/quiz/engine';
import { CATEGORY_NAMES, QUESTION_BY_ID, QUIZ_QUESTIONS, optionsOf } from '../src/bot/quiz/questions';
import { disposeEnv, getEnv, login, request } from './helpers';
import { fakeTelegram, type TgCall } from './tg-fake';

const ORIGIN = 'https://polski.example';

beforeAll(async () => {
  const { env } = await getEnv();
  env.WEB_APP_URL = `${ORIGIN}/app/`;
  env.TELEGRAM_BOT_USERNAME = 'Polski_Go_Bot';
});
afterAll(disposeEnv);
afterEach(() => vi.unstubAllGlobals());

let upd = 50_000;
const hook = (body: unknown) => request('POST', '/telegram/webhook', body, { 'x-telegram-bot-api-secret-token': 'hook-secret' });
const command = (tg: number, text: string, lang = 'ru', chatType = 'private') =>
  hook({ update_id: ++upd, message: { message_id: upd, chat: { id: chatType === 'private' ? tg : -100500, type: chatType }, from: { id: tg, first_name: 'Ola', language_code: lang }, text } });
const press = (tg: number, data: string, messageId = 1, chatType = 'private', updateId = ++upd) =>
  hook({ update_id: updateId, callback_query: { id: `cb${updateId}`, from: { id: tg, first_name: 'Ola', language_code: 'ru' }, message: { message_id: messageId, chat: { id: chatType === 'private' ? tg : -100500, type: chatType } }, data } });
/** callback_data кнопок вопроса из отправленного сообщения. */
const answerButtons = (call: TgCall) => (call.params.reply_markup.inline_keyboard as { text: string; callback_data?: string }[][]).flat().filter((b) => b.callback_data?.startsWith('qa:'));
const lastRound = async (tg: number) => (await db.select().from(botQuizRounds).where(eq(botQuizRounds.telegramId, tg)).orderBy(sql`sent_at DESC`).limit(1))[0];
/** Позиция кнопки с верным/неверным вариантом для раунда. */
const positionOf = (round: typeof botQuizRounds.$inferSelect, correct: boolean) => {
  const q = QUESTION_BY_ID.get(round.questionId)!;
  return round.optionOrder.findIndex((i) => (i === q.answer) === correct);
};
/** Снять защиту от двойного нажатия (4 секунды) между вопросами в тесте. */
const ageLastQuestion = (tg: number, ms = QUIZ_MIN_GAP_MS + 1) =>
  db.update(botQuizPlayers).set({ lastQuestionAt: new Date(Date.now() - ms) }).where(eq(botQuizPlayers.telegramId, tg));
const ru = async () => {
  const u = await login();
  await db.update(userSettings).set({ uiLanguage: 'ru' }).where(eq(userSettings.userId, u.user.id));
  return u;
};

describe('банк вопросов', () => {
  it('60 вопросов, уникальные id, верный вариант существует, варианты различаются, четыре языка', () => {
    expect(QUIZ_QUESTIONS).toHaveLength(60);
    expect(new Set(QUIZ_QUESTIONS.map((q) => q.id)).size).toBe(60);
    for (const q of QUIZ_QUESTIONS) {
      for (const lang of UI_LANGS) {
        const opts = optionsOf(q, lang);
        expect(opts.length, q.id).toBeGreaterThanOrEqual(3);
        expect(opts.length, q.id).toBeLessThanOrEqual(LETTERS.length);
        expect(new Set(opts).size, `${q.id} ${lang}: duplicate options`).toBe(opts.length);
        expect(opts[q.answer], q.id).toBeTruthy();
        expect(q.prompt[lang].trim().length, `${q.id} prompt ${lang}`).toBeGreaterThan(3);
        expect(q.explain[lang].trim().length, `${q.id} explain ${lang}`).toBeGreaterThan(10);
      }
      expect(CATEGORY_NAMES[q.category]).toBeTruthy();
      expect(['A1', 'A2', 'B1']).toContain(q.cefr);
    }
    const levels = new Set(QUIZ_QUESTIONS.map((q) => q.cefr));
    expect(levels).toEqual(new Set(['A1', 'A2', 'B1']));
  });

  it('язык не смешивается: в объяснениях uk нет русских букв ы/э/ъ, в ru нет украинских і/ї/є/ґ, нет смешения латиницы и кириллицы в слове', () => {
    const mixed = /(?=\S*[A-Za-z])(?=\S*[А-Яа-яІіЇїЄєҐґ])\S+/;
    for (const q of QUIZ_QUESTIONS) {
      expect(q.explain.uk, q.id).not.toMatch(/[ыэъЫЭЪ]/);
      expect(q.explain.ru, q.id).not.toMatch(/[іїєґІЇЄҐ]/);
      for (const lang of ['ru', 'uk'] as const) {
        for (const word of `${q.prompt[lang]} ${q.explain[lang]}`.split(/\s+/)) expect(mixed.test(word.replace(/[«»"'()!?.,:;—-]/g, '')), `${q.id} ${lang}: ${word}`).toBe(false);
      }
    }
  });

  it('сообщение влезает в подпись к фото (≤ 1024), кнопки — в 64 байта callback_data, итог тоже ≤ 1024', () => {
    const roundId = 'f'.repeat(32);
    for (const q of QUIZ_QUESTIONS) {
      for (const lang of UI_LANGS) {
        const order = [...optionsOf(q, lang).keys()].reverse();
        const view = questionView(q, order, lang, roundId);
        expect(view.text.length, `${q.id} ${lang}`).toBeLessThanOrEqual(1024);
        for (const b of view.keyboard.inline_keyboard.flat()) {
          expect(Buffer.byteLength((b as { callback_data: string }).callback_data), q.id).toBeLessThanOrEqual(64);
          expect(b.text.length).toBeLessThanOrEqual(40);
        }
        const round = { id: roundId, telegramId: 1, chatId: 1, messageId: 1, questionId: q.id, optionOrder: order, lang, source: 'command', status: 'ANSWERED' as const, hasPhoto: true, chosen: (q.answer + 1) % order.length, correct: false, onTime: true, xp: 0, sentAt: new Date(), answeredAt: new Date() };
        expect(resultView(round, q, { hasUser: true, rewardsLeft: 2, cap: false }).text.length, `${q.id} ${lang} result`).toBeLessThanOrEqual(1024);
      }
    }
  });

  it('подбор: без недавних вопросов и не из темы прошлого; уровень влияет на долю B1', () => {
    const recent = QUIZ_QUESTIONS.slice(0, 50).map((q) => q.id);
    const last = QUESTION_BY_ID.get(recent.at(-1)!)!;
    for (let i = 0; i < 50; i++) {
      const q = pickQuestion(recent, 'A1');
      expect(recent).not.toContain(q.id);
    }
    const lastCat = QUIZ_QUESTIONS.filter((q) => q.category === last.category);
    for (let i = 0; i < 50; i++) expect(pickQuestion([last.id], null).category).not.toBe(lastCat[0].category);
    const share = (level: string) => Array.from({ length: 400 }, () => pickQuestion([], level)).filter((q) => q.cefr === 'B1').length;
    expect(share('B1')).toBeGreaterThan(share('A1'));
  });
});

describe('правила частоты', () => {
  const day = '2026-10-27';
  const now = new Date('2026-10-27T12:00:00Z');
  const p = (over: Partial<Parameters<typeof quizGate>[0] & object> = {}) => ({ day, dayCount: 1, lastQuestionAt: new Date(now.getTime() - 60_000), rewardDay: day, rewardCount: 0, ...over });

  it('ручная тренировка не ждёт 3 часа: через минуту после вопроса можно следующий; защита только от двойного нажатия и потолка', () => {
    expect(quizGate(p(), day, now)).toEqual({ status: 'open', rewardsLeft: 3 });
    expect(quizGate(p({ lastQuestionAt: new Date(now.getTime() - 1000) }), day, now)).toEqual({ status: 'busy' });
    expect(quizGate(p({ dayCount: QUIZ_DAILY_CAP }), day, now)).toEqual({ status: 'cap' });
    expect(quizGate(p({ dayCount: QUIZ_DAILY_CAP, day: '2026-10-26' }), day, now).status).toBe('open');
    expect(quizGate(null, day, now)).toEqual({ status: 'open', rewardsLeft: QUIZ_REWARDED_MAX });
  });

  it('XP — только за три ответа в день, новый местный день обнуляет счёт', () => {
    expect(rewardsLeft(p({ rewardCount: 2 }), day)).toBe(1);
    expect(rewardsLeft(p({ rewardCount: 3 }), day)).toBe(0);
    expect(rewardsLeft(p({ rewardCount: 3, rewardDay: '2026-10-26' }), day)).toBe(3);
  });

  it('пауза 3 часа — только для приглашений бота, и только пока есть XP за ответы', () => {
    expect(inviteAllowed(p({ lastQuestionAt: new Date(now.getTime() - QUIZ_PUSH_GAP_MS + 60_000) }), day, now)).toBe(false);
    expect(inviteAllowed(p({ lastQuestionAt: new Date(now.getTime() - QUIZ_PUSH_GAP_MS - 60_000) }), day, now)).toBe(true);
    expect(inviteAllowed(p({ lastQuestionAt: new Date(now.getTime() - QUIZ_PUSH_GAP_MS - 60_000), rewardCount: 3 }), day, now)).toBe(false);
    expect(inviteHour(null)).toBe(13);
    expect(inviteHour(13)).toBe(17);
    expect(inviteHour(19)).toBe(13);
  });
});

describe('полный цикл в чате', () => {
  let user: Awaited<ReturnType<typeof ru>>;
  beforeAll(async () => {
    user = await ru();
  });

  it('/quiz → вопрос с кнопками → верный ответ: пояснение, +10 XP в D1 и в Mini App, задание «Получи 100 XP» растёт', async () => {
    const tg = user.telegramId;
    const before = (await user.call('GET', '/api/me')).body;
    // Задание «Сотня XP» на сегодня — чтобы проверить, что XP вопроса в нём засчитываются.
    const xpQuest = (await db.select().from(quests).where(eq(quests.slug, 'd-xp-100')))[0];
    const today = dayKey(new Date(), 'Europe/Warsaw');
    await db.insert(userQuests).values({ userId: user.user.id, questId: xpQuest.id, periodKey: today, progress: 0, status: 'ACTIVE', state: {} }).onConflictDoNothing();

    let calls = fakeTelegram();
    expect((await command(tg, '/quiz')).status).toBe(200);
    expect(calls).toHaveLength(1);
    const sent = calls[0];
    expect(['sendPhoto', 'sendMessage']).toContain(sent.method);
    const round = await lastRound(tg);
    expect(round.status).toBe('OPEN');
    const q = QUESTION_BY_ID.get(round.questionId)!;
    const btns = answerButtons(sent);
    expect(btns.length).toBe(optionsOf(q, 'ru').length);
    expect(btns.every((b) => b.callback_data!.startsWith(`qa:${round.id}:`))).toBe(true);
    if (sent.method === 'sendPhoto') {
      expect(sent.params.photo).toMatch(/^https:\/\/polski\.example\/bot\/ru\/(shopping|food|transport)\.jpg$/);
      expect(['shopping', 'food', 'transport']).toContain(q.category);
    }

    vi.unstubAllGlobals();
    calls = fakeTelegram();
    expect((await press(tg, `qa:${round.id}:${positionOf(round, true)}`, 1000)).status).toBe(200);
    expect(calls.map((c) => c.method)).toEqual(['answerCallbackQuery', round.hasPhoto ? 'editMessageCaption' : 'editMessageText']);
    expect(calls[0].params.text).toContain(`+${QUIZ_XP} XP`);
    const shown = String(calls[1].params.caption ?? calls[1].params.text);
    expect(shown).toContain(QUIZ_COPY.ru.correct);
    expect(shown).toContain(q.explain.ru.slice(0, 20));
    expect(shown).toContain(`+${QUIZ_XP} XP`);
    expect(shown).toContain(QUIZ_COPY.ru.rewardsLeft(2));
    const next = (calls[1].params.reply_markup.inline_keyboard as { callback_data?: string; web_app?: { url: string } }[][]).flat();
    expect(next.some((b) => b.callback_data === 'qz:next')).toBe(true);
    expect(next.some((b) => b.web_app?.url.startsWith('https://polski.example/app/'))).toBe(true);

    const saved = (await db.select().from(botQuizRounds).where(eq(botQuizRounds.id, round.id)))[0];
    expect(saved).toMatchObject({ status: 'ANSWERED', correct: true, onTime: true, xp: QUIZ_XP });
    expect((await db.select().from(xpEvents).where(eq(xpEvents.idempotencyKey, `quiz:${round.id}`))).length).toBe(1);
    const after = (await user.call('GET', '/api/me')).body;
    expect(after.progress.xpTotal - before.progress.xpTotal).toBe(QUIZ_XP);
    const activity = (await db.select().from(dailyActivity).where(and(eq(dailyActivity.userId, user.user.id), eq(dailyActivity.day, today))))[0];
    expect(activity.xp).toBeGreaterThanOrEqual(QUIZ_XP);
    const quest = (await db.select().from(userQuests).where(and(eq(userQuests.userId, user.user.id), eq(userQuests.questId, xpQuest.id), eq(userQuests.periodKey, today))))[0];
    expect(quest.progress).toBe(QUIZ_XP);
    // Серия дней от 20-секундного вопроса не растёт (её продлевают уроки и миссии).
    expect(after.progress.streak).toBe(before.progress.streak);
  });

  it('повторное нажатие, повтор доставки и нажатие другого варианта — ответ и XP не меняются', async () => {
    const tg = user.telegramId;
    await ageLastQuestion(tg);
    fakeTelegram();
    await command(tg, '/quiz');
    const round = await lastRound(tg);
    vi.unstubAllGlobals();
    let calls = fakeTelegram();
    const updateId = ++upd;
    await press(tg, `qa:${round.id}:${positionOf(round, false)}`, 1001, 'private', updateId);
    const xpAfterFirst = (await db.select().from(playerProgress).where(eq(playerProgress.userId, user.user.id)))[0].xpTotal;
    // Тот же update_id ещё раз — Telegram повторил доставку: ни одного вызова Bot API.
    vi.unstubAllGlobals();
    calls = fakeTelegram();
    const dup = await press(tg, `qa:${round.id}:${positionOf(round, true)}`, 1001, 'private', updateId);
    expect(dup.body.duplicate).toBe(true);
    expect(calls).toHaveLength(0);
    // Новое нажатие верного варианта после неверного ответа — «уже засчитан», без XP.
    await press(tg, `qa:${round.id}:${positionOf(round, true)}`, 1001);
    expect(calls.find((c) => c.method === 'answerCallbackQuery')!.params.text).toBe(QUIZ_COPY.ru.already);
    const saved = (await db.select().from(botQuizRounds).where(eq(botQuizRounds.id, round.id)))[0];
    expect(saved).toMatchObject({ correct: false, xp: 0 });
    expect((await db.select().from(playerProgress).where(eq(playerProgress.userId, user.user.id)))[0].xpTotal).toBe(xpAfterFirst);
  });

  it('два одновременных нажатия — один ответ, одна награда', async () => {
    const tg = user.telegramId;
    await ageLastQuestion(tg);
    fakeTelegram();
    await command(tg, '/quiz');
    const round = await lastRound(tg);
    const xp0 = (await db.select().from(playerProgress).where(eq(playerProgress.userId, user.user.id)))[0].xpTotal;
    const right = positionOf(round, true);
    await Promise.all([press(tg, `qa:${round.id}:${right}`), press(tg, `qa:${round.id}:${right}`), press(tg, `qa:${round.id}:${positionOf(round, false)}`)]);
    const saved = (await db.select().from(botQuizRounds).where(eq(botQuizRounds.id, round.id)))[0];
    expect(saved.status).toBe('ANSWERED');
    const gained = (await db.select().from(playerProgress).where(eq(playerProgress.userId, user.user.id)))[0].xpTotal - xp0;
    expect(gained).toBe(saved.correct ? QUIZ_XP : 0);
    expect((await db.select().from(xpEvents).where(eq(xpEvents.idempotencyKey, `quiz:${round.id}`))).length).toBe(saved.correct ? 1 : 0);
  });

  it('после трёх наград в день тренировка продолжается без XP и без паузы в 3 часа', async () => {
    const tg = user.telegramId;
    // Две награды уже есть (первый тест и, возможно, одновременные нажатия): добираем до трёх и проверяем четвёртую.
    for (let i = 0; i < 4; i++) {
      await ageLastQuestion(tg);
      vi.unstubAllGlobals();
      fakeTelegram();
      expect((await command(tg, '/quiz')).status).toBe(200);
      const round = await lastRound(tg);
      expect(round.status).toBe('OPEN');
      await press(tg, `qa:${round.id}:${positionOf(round, true)}`);
    }
    const player = (await db.select().from(botQuizPlayers).where(eq(botQuizPlayers.telegramId, tg)))[0];
    expect(player.rewardCount).toBe(QUIZ_REWARDED_MAX);
    const today = dayKey(new Date(), 'Europe/Warsaw');
    const rounds = await db.select().from(botQuizRounds).where(eq(botQuizRounds.telegramId, tg));
    expect(rounds.filter((r) => r.xp > 0)).toHaveLength(QUIZ_REWARDED_MAX);
    // Следующий верный ответ: «Dobrze!» без XP и строка «бонусы на сегодня получены».
    await ageLastQuestion(tg);
    vi.unstubAllGlobals();
    let calls = fakeTelegram();
    await command(tg, '/quiz');
    const round = await lastRound(tg);
    vi.unstubAllGlobals();
    calls = fakeTelegram();
    await press(tg, `qa:${round.id}:${positionOf(round, true)}`);
    expect(calls[0].params.text).toBe(QUIZ_COPY.ru.toastCorrect(0));
    expect(String(calls[1].params.caption ?? calls[1].params.text)).toContain(QUIZ_COPY.ru.rewardsDone);
    expect((await db.select().from(botQuizRounds).where(eq(botQuizRounds.id, round.id)))[0].xp).toBe(0);
    expect(player.rewardDay).toBe(today);
  });

  it('двойное нажатие «Следующий вопрос» — один вопрос; дневной потолок — сообщение с кнопкой к урокам', async () => {
    const tg = user.telegramId;
    await ageLastQuestion(tg);
    let calls = fakeTelegram();
    await Promise.all([press(tg, 'qz:next'), press(tg, 'qz:next')]);
    expect(calls.filter((c) => c.method === 'sendPhoto' || c.method === 'sendMessage')).toHaveLength(1);

    await db.update(botQuizPlayers).set({ dayCount: QUIZ_DAILY_CAP, lastQuestionAt: new Date(Date.now() - 60_000) }).where(eq(botQuizPlayers.telegramId, tg));
    vi.unstubAllGlobals();
    calls = fakeTelegram();
    await command(tg, '/quiz');
    expect(calls).toHaveLength(1);
    expect(calls[0].method).toBe('sendMessage');
    expect(calls[0].params.text).toContain(String(QUIZ_DAILY_CAP));
    expect(JSON.stringify(calls[0].params.reply_markup)).toContain('bot_screen=learn');
  });

  it('опоздание (больше 30 секунд): пояснение есть, XP нет', async () => {
    const u = await ru();
    fakeTelegram();
    await command(u.telegramId, '/quiz');
    const round = await lastRound(u.telegramId);
    await db.update(botQuizRounds).set({ sentAt: new Date(Date.now() - 60_000) }).where(eq(botQuizRounds.id, round.id));
    vi.unstubAllGlobals();
    const calls = fakeTelegram();
    await press(u.telegramId, `qa:${round.id}:${positionOf(round, true)}`);
    expect(calls[0].params.text).toBe(QUIZ_COPY.ru.toastLate);
    expect(String(calls[1].params.caption ?? calls[1].params.text)).toContain(QUIZ_COPY.ru.late);
    expect((await db.select().from(botQuizRounds).where(eq(botQuizRounds.id, round.id)))[0]).toMatchObject({ onTime: false, xp: 0 });
  });
});

describe('кнопки вне правил', () => {
  it('без аккаунта: вопрос и пояснение есть, XP нет, подсказка зайти в приложение', async () => {
    const tg = 9_400_001;
    fakeTelegram();
    await command(tg, '/quiz', 'en');
    const round = await lastRound(tg);
    vi.unstubAllGlobals();
    const calls = fakeTelegram();
    await press(tg, `qa:${round.id}:${positionOf(round, true)}`);
    expect(String(calls[1].params.caption ?? calls[1].params.text)).toContain(QUIZ_COPY.en.noAccount);
    expect((await db.select().from(botQuizRounds).where(eq(botQuizRounds.id, round.id)))[0].xp).toBe(0);
  });

  it('устаревшая кнопка, чужой вопрос, мусор в данных, группа — подсказка и ничего не меняется', async () => {
    const owner = 9_400_002;
    fakeTelegram();
    await command(owner, '/quiz', 'uk');
    const round = await lastRound(owner);
    vi.unstubAllGlobals();
    const calls = fakeTelegram();
    await press(9_400_003, `qa:${round.id}:0`);
    expect(calls.at(-1)!.params.text).toBe(QUIZ_COPY.uk.notYours);
    await press(owner, `qa:${'0'.repeat(32)}:0`);
    expect(calls.at(-1)!.params.text).toBe(QUIZ_COPY.uk.expired);
    await press(owner, 'garbage');
    expect(calls.at(-1)!.method).toBe('answerCallbackQuery');
    await press(owner, `qa:${round.id}:0`, 1, 'supergroup');
    expect(calls.at(-1)!.params.text).toBe(QUIZ_COPY.ru.group);
    expect((await db.select().from(botQuizRounds).where(eq(botQuizRounds.id, round.id)))[0].status).toBe('OPEN');
  });

  it('в группе /quiz — ссылка в личный чат, вопрос не задаётся', async () => {
    const calls = fakeTelegram();
    await command(9_400_004, '/quiz', 'ru', 'supergroup');
    expect(calls).toHaveLength(1);
    expect(calls[0].params.reply_markup.inline_keyboard[0][0].url).toBe('https://t.me/Polski_Go_Bot?start=quiz');
    expect(await lastRound(9_400_004)).toBeUndefined();
  });

  it('кнопка «Не присылать вопросы» выключает приглашения и меняется на «Присылать»', async () => {
    const tg = 9_400_005;
    const calls = fakeTelegram();
    const res = await hook({
      update_id: ++upd,
      callback_query: { id: 'cbp', from: { id: tg, first_name: 'A', language_code: 'ru' }, data: 'qz:push:0', message: { message_id: 7, chat: { id: tg, type: 'private' }, reply_markup: { inline_keyboard: [[{ text: QUIZ_COPY.ru.pushOff, callback_data: 'qz:push:0' }]] } } },
    });
    expect(res.status).toBe(200);
    expect((await db.select().from(botQuizPlayers).where(eq(botQuizPlayers.telegramId, tg)))[0].pushEnabled).toBe(false);
    const edit = calls.find((c) => c.method === 'editMessageReplyMarkup')!;
    expect(edit.params.reply_markup.inline_keyboard[0][0].callback_data).toBe('qz:push:1');
  });
});

describe('приглашения cron', () => {
  it('один раз в день в 13:00 по местному времени тем, кто уже отвечал; не через 3 часа после вопроса; не после двух игнорирований', async () => {
    const u = await ru();
    const tg = u.telegramId;
    await db.update(userSettings).set({ notificationsEnabled: true, reminderHour: 19, timezone: 'Europe/Warsaw' }).where(eq(userSettings.userId, u.user.id));
    const at13 = new Date('2026-10-27T12:05:00Z'); // 13:05 в Варшаве (CET)
    await db.insert(botQuizPlayers).values({ telegramId: tg, answered: 1, lastQuestionAt: new Date(at13.getTime() - QUIZ_PUSH_GAP_MS - 60_000) });

    let calls = fakeTelegram();
    expect(await sendQuizInvites(new Date('2026-10-27T10:05:00Z'), 10)).toBe(0); // 11:05 — не время
    expect(await sendQuizInvites(at13, 10)).toBe(1);
    const invite = calls.find((c) => c.params.chat_id === tg)!;
    expect(invite.method).toBe('sendMessage');
    expect(JSON.stringify(invite.params.reply_markup)).toContain('qz:go');
    expect(JSON.stringify(invite.params.reply_markup)).toContain('qz:push:0');
    expect(invite.params.text).toContain('/stop');
    // Второй запуск в тот же час — уже было сегодня.
    expect(await sendQuizInvites(new Date(at13.getTime() + 60_000), 10)).toBe(0);
    const log = await db.select().from(notificationLog).where(and(eq(notificationLog.userId, u.user.id), eq(notificationLog.kind, 'quiz_invite')));
    expect(log).toHaveLength(1);
    expect(log[0].status).toBe('SENT');

    // Завтра: вопрос был час назад — пауза 3 часа, приглашения нет.
    const tomorrow = new Date(at13.getTime() + 86_400_000);
    await db.update(botQuizPlayers).set({ lastQuestionAt: new Date(tomorrow.getTime() - 3600_000) }).where(eq(botQuizPlayers.telegramId, tg));
    vi.unstubAllGlobals();
    calls = fakeTelegram();
    expect(await sendQuizInvites(tomorrow, 10)).toBe(0);
    // Два приглашения без ответа подряд — пауза, пока ученик не ответит сам.
    await db.update(botQuizPlayers).set({ lastQuestionAt: new Date(0), ignoredPushes: 2 }).where(eq(botQuizPlayers.telegramId, tg));
    expect(await sendQuizInvites(tomorrow, 10)).toBe(0);
    // Выключил вопросы кнопкой — тоже нет.
    await db.update(botQuizPlayers).set({ ignoredPushes: 0, pushEnabled: false }).where(eq(botQuizPlayers.telegramId, tg));
    expect(await sendQuizInvites(tomorrow, 10)).toBe(0);
    expect(calls.filter((c) => c.params.chat_id === tg)).toHaveLength(0);
  });
});
