/**
 * Вопрос дня в админке: план публикаций на 30 дней (с «как увидит игрок»), прошедшие 7 дней, охват и скорость отправки,
 * банк вопросов со статистикой, отчёт по дню (кому дошло, кто ответил, что выбрал, верно ли) и блок в карточке игрока.
 */
import { and, desc, eq, gte, inArray, isNotNull, lt, lte, ne, sql, type SQL } from 'drizzle-orm';
import type { UiLang } from '@polski-go/shared';
import { db } from '../db';
import { botContacts, botQuizRounds, dailyQuizPlan, dailyQuizQuestions, dailyQuizSends, notificationLog, users } from '../db/schema';
import { botImageUrl } from '../bot/catalog';
import { allPeople, dailyAudience, dailyEligibility, personByTelegramId, personLang, personLevel, type DailyPerson, type Eligibility } from '../bot/daily/audience';
import { ensurePlan, planRange } from '../bot/daily/plan';
import { DAILY_PER_RUN } from '../bot/daily/send';
import { addDays, DAILY_LEVELS, dailyDiag, isDayEditable, isSendingDay, PLAN_DAYS, readDailyRun, readDailyState, readDailyTick, sendWindow, warsawDay, type DailyLevel, type DailyState } from '../bot/daily/state';
import { dailyQuestionView, plainText } from '../bot/daily/views';
import { CATEGORY_NAMES, optionsOf, QUESTION_BY_ID, QUIZ_QUESTIONS, type QuizQuestion } from '../bot/quiz/questions';
import { isQuizScene, QUIZ_SCENES, quizSceneFile, SCENE_LABELS, type QuizScene } from '../bot/quiz/scenes';

const HISTORY_DAYS = 7;
const PAGE = 100;

const sceneOf = (image: string, q?: QuizQuestion): QuizScene => (isQuizScene(image) ? image : (q?.image ?? 'mieszkanie'));
export const imageUrlOf = (scene: QuizScene) => botImageUrl(quizSceneFile(scene));

/** Вопрос для админки на одном языке. */
export function questionCard(q: QuizQuestion, lang: UiLang) {
  return {
    id: q.id,
    level: q.cefr,
    category: q.category,
    categoryName: CATEGORY_NAMES[q.category][lang],
    kind: q.kind,
    image: q.image,
    prompt: q.prompt[lang],
    options: optionsOf(q, lang),
    answer: q.answer,
    explain: q.explain[lang],
  };
}

/** «Как увидит игрок»: подпись без разметки и подписи кнопок (как у игрока без серии). */
function preview(q: QuizQuestion, lang: UiLang) {
  const view = dailyQuestionView(q, [0, 1, 2, 3], lang, '0'.repeat(32), { streak: null, returning: false, hasUser: true });
  return { text: plainText(view.text), buttons: view.keyboard.inline_keyboard.flat().map((b) => b.text) };
}

/** Счётчики отправок по дню и уровню. */
async function sendStats(where: SQL) {
  return db
    .select({
      day: dailyQuizSends.day,
      level: dailyQuizSends.level,
      sent: sql<number>`count(*)`,
      delivered: sql<number>`sum(CASE WHEN ${dailyQuizSends.status} = 'SENT' THEN 1 ELSE 0 END)`,
      blocked: sql<number>`sum(CASE WHEN ${dailyQuizSends.status} = 'BLOCKED' THEN 1 ELSE 0 END)`,
      noChat: sql<number>`sum(CASE WHEN ${dailyQuizSends.status} = 'NO_CHAT' THEN 1 ELSE 0 END)`,
      failed: sql<number>`sum(CASE WHEN ${dailyQuizSends.status} IN ('FAILED', 'UNKNOWN') THEN 1 ELSE 0 END)`,
      answered: sql<number>`sum(CASE WHEN ${dailyQuizSends.answeredAt} IS NOT NULL THEN 1 ELSE 0 END)`,
      correct: sql<number>`sum(CASE WHEN ${dailyQuizSends.correct} = 1 THEN 1 ELSE 0 END)`,
    })
    .from(dailyQuizSends)
    .where(where)
    .groupBy(dailyQuizSends.day, dailyQuizSends.level);
}
const num = (v: unknown) => Number(v ?? 0);

export async function dailyOverview(lang: UiLang, now = new Date()) {
  const today = warsawDay(now);
  await ensurePlan(today);
  const from = addDays(today, -HISTORY_DAYS);
  const [state, run, tickAt, audience, rows, stats] = await Promise.all([
    readDailyState(),
    readDailyRun(),
    readDailyTick(),
    dailyAudience(),
    planRange(from, HISTORY_DAYS + PLAN_DAYS),
    sendStats(and(gte(dailyQuizSends.day, from), lt(dailyQuizSends.day, today))!),
  ]);
  const byDay = new Map<string, typeof rows>();
  for (const r of rows) byDay.set(r.day, [...(byDay.get(r.day) ?? []), r]);
  const item = (r: (typeof rows)[number]) => {
    const q = QUESTION_BY_ID.get(r.questionId);
    const scene = sceneOf(r.image, q);
    return {
      level: r.level,
      questionId: r.questionId,
      image: scene,
      imageUrl: imageUrlOf(scene),
      edited: !!r.editedBy,
      question: q ? questionCard(q, lang) : null,
      preview: q ? preview(q, lang) : null,
    };
  };
  const plan = Array.from({ length: PLAN_DAYS }, (_, i) => {
    const day = addDays(today, i);
    const items = (byDay.get(day) ?? []).sort((a, b) => a.level.localeCompare(b.level));
    return { day, sendAt: state.sendAt, skipped: items.some((r) => r.skipped), editable: isDayEditable(day, today, run), items: items.map(item) };
  });
  const history = Array.from({ length: HISTORY_DAYS }, (_, i) => addDays(today, -1 - i)).map((day) => {
    const items = (byDay.get(day) ?? []).sort((a, b) => a.level.localeCompare(b.level));
    return {
      day,
      skipped: items.some((r) => r.skipped),
      levels: items.map((r) => {
        const s = stats.find((x) => x.day === day && x.level === r.level);
        return { ...item(r), sent: num(s?.sent), delivered: num(s?.delivered), answered: num(s?.answered), correct: num(s?.correct) };
      }),
    };
  });
  const scenes = QUIZ_SCENES.map((id) => ({ id, label: SCENE_LABELS[id][lang], imageUrl: imageUrlOf(id) }));
  return { state, run, today, diag: dailyDiag(state, run, tickAt, now), rate: { perRun: DAILY_PER_RUN, perHour: DAILY_PER_RUN * 60 }, audience, scenes, plan, history };
}

/** Банк вопросов со статистикой: сколько раз был вопросом дня, сколько ответов (вопрос дня + /quiz за 30 дней) и % верных. */
export async function dailyQuestions(lang: UiLang, now = new Date()) {
  const today = warsawDay(now);
  const [disabled, usage, daily, quiz] = await Promise.all([
    db.select().from(dailyQuizQuestions),
    db
      .select({ id: dailyQuizPlan.questionId, times: sql<number>`count(DISTINCT ${dailyQuizPlan.day})`, last: sql<string>`max(${dailyQuizPlan.day})` })
      .from(dailyQuizPlan)
      .where(and(lte(dailyQuizPlan.day, today), eq(dailyQuizPlan.skipped, false)))
      .groupBy(dailyQuizPlan.questionId),
    db
      .select({ id: dailyQuizSends.questionId, n: sql<number>`count(*)`, right: sql<number>`sum(CASE WHEN ${dailyQuizSends.correct} = 1 THEN 1 ELSE 0 END)` })
      .from(dailyQuizSends)
      .where(isNotNull(dailyQuizSends.answeredAt))
      .groupBy(dailyQuizSends.questionId),
    db
      .select({ id: botQuizRounds.questionId, n: sql<number>`count(*)`, right: sql<number>`sum(CASE WHEN ${botQuizRounds.correct} = 1 THEN 1 ELSE 0 END)` })
      .from(botQuizRounds)
      .where(and(eq(botQuizRounds.status, 'ANSWERED'), inArray(botQuizRounds.source, ['command', 'push', 'next'])))
      .groupBy(botQuizRounds.questionId),
  ]);
  const off = new Set(disabled.filter((d) => d.disabled).map((d) => d.questionId));
  const use = new Map(usage.map((u) => [u.id, u]));
  const answers = new Map<string, { n: number; right: number }>();
  for (const r of [...daily, ...quiz]) {
    const prev = answers.get(r.id) ?? { n: 0, right: 0 };
    answers.set(r.id, { n: prev.n + num(r.n), right: prev.right + num(r.right) });
  }
  return QUIZ_QUESTIONS.map((q) => {
    const a = answers.get(q.id);
    return {
      ...questionCard(q, lang),
      disabled: off.has(q.id),
      timesDaily: num(use.get(q.id)?.times),
      lastDaily: use.get(q.id)?.last ?? null,
      answered: a?.n ?? 0,
      correctPct: a && a.n ? Math.round((a.right * 100) / a.n) : null,
    };
  });
}

export const DAY_FILTERS = ['all', 'answered', 'not_answered', 'wrong', 'failed', 'not_sent'] as const;
export type DayFilter = (typeof DAY_FILTERS)[number];

/**
 * Почему человеку в этот день вопрос не отправлялся (владелец 2026-11-15: «не понятно, кому пришёл, а кому нет»):
 * причина исключения (audience.ts) или состояние рассылки. off — рассылка выключена / ещё не началась / день пропущен;
 * waiting — человек получит, но очередь ещё не дошла (или окно отправки закрылось раньше). Для прошлых дней исключение — нынешнее.
 */
export type NotSentReason = Exclude<Eligibility, 'ok'> | 'off' | 'waiting';

/** Что бот прислал человеку в этот день вместо вопроса (или вместе с ним): напоминание о занятии, приглашение к быстрому вопросу. */
export type InsteadMessage = { kind: 'reminder' | 'quiz_invite'; status: string; template: string | null; at: number | null; replacedByDaily: boolean };

async function insteadFor(userIds: string[], day: string): Promise<Map<string, InsteadMessage[]>> {
  const out = new Map<string, InsteadMessage[]>();
  const ids = [...new Set(userIds)];
  for (let i = 0; i < ids.length; i += 90) {
    const rows = await db
      .select()
      .from(notificationLog)
      .where(and(inArray(notificationLog.userId, ids.slice(i, i + 90)), eq(notificationLog.day, day), inArray(notificationLog.kind, ['daily_reminder', 'quiz_invite'])));
    for (const r of rows) {
      const list = out.get(r.userId) ?? [];
      list.push({
        kind: r.kind === 'quiz_invite' ? 'quiz_invite' : 'reminder',
        status: r.status,
        template: r.template,
        at: (r.sentAt ?? r.updatedAt ?? r.createdAt)?.getTime() ?? null,
        replacedByDaily: r.status === 'SKIPPED' && r.error === 'daily_quiz',
      });
      out.set(r.userId, list);
    }
  }
  return out;
}

/** Рассылка в этот день вообще шла (включена, день наступил, не пропущен). */
async function dayIsSending(state: DailyState, day: string) {
  if (!isSendingDay(state, day)) return false;
  const plan = await planRange(day, 1);
  return !plan.some((r) => r.skipped);
}

function notSentReason(p: DailyPerson, sending: boolean): NotSentReason {
  const e = dailyEligibility(p);
  if (e !== 'ok') return e;
  return sending ? 'waiting' : 'off';
}

export async function dayReport(day: string, lang: UiLang, filter: DayFilter, after: number | null) {
  const [plan, stats, state, people, sentIds] = await Promise.all([
    planRange(day, 1),
    sendStats(eq(dailyQuizSends.day, day)),
    readDailyState(),
    allPeople(),
    db.select({ t: dailyQuizSends.telegramId }).from(dailyQuizSends).where(eq(dailyQuizSends.day, day)),
  ]);
  const levels = DAILY_LEVELS.map((level: DailyLevel) => {
    const r = plan.find((p) => p.level === level);
    const q = r ? QUESTION_BY_ID.get(r.questionId) : undefined;
    const s = stats.find((x) => x.level === level);
    return {
      level,
      questionId: r?.questionId ?? null,
      prompt: q?.prompt[lang] ?? null,
      imageUrl: r ? imageUrlOf(sceneOf(r.image, q)) : null,
      skipped: r?.skipped ?? false,
      sent: num(s?.sent),
      delivered: num(s?.delivered),
      blocked: num(s?.blocked),
      noChat: num(s?.noChat),
      failed: num(s?.failed),
      answered: num(s?.answered),
      correct: num(s?.correct),
    };
  });
  // Кто в этот день вопрос не получал и почему: все люди бота и приложения минус те, кому отправка была.
  // Рассылку могли остановить посреди дня: тогда остальным вопрос уже не уйдёт — «рассылка не шла», а не «в очереди».
  const sending = state.enabled && ((await dayIsSending(state, day)) || sentIds.length > 0);
  const sentSet = new Set(sentIds.map((r) => r.t));
  const notSent = people.filter((p) => !sentSet.has(p.telegramId));
  const notSentBy: Record<NotSentReason, number> = { off: 0, waiting: 0, banned: 0, opted_out: 0, blocked: 0, no_chat: 0, paused: 0 };
  for (const p of notSent) notSentBy[notSentReason(p, sending)]++;
  const summary = { people: people.length, sent: sentSet.size, notSent: notSent.length, notSentBy, sending, enabled: state.enabled, startDay: state.startDay };

  if (filter === 'not_sent') {
    const page = notSent.filter((p) => after === null || p.telegramId > after).slice(0, PAGE);
    const instead = await insteadFor(page.flatMap((p) => (p.userId ? [p.userId] : [])), day);
    return {
      day,
      levels,
      summary,
      rows: page.map((p) => ({
        telegramId: p.telegramId,
        userId: p.userId,
        name: p.firstName,
        username: p.username,
        level: personLevel(p),
        lang: personLang(p),
        status: 'NOT_SENT',
        reason: notSentReason(p, sending),
        error: null,
        sentAt: null,
        answeredAt: null,
        chosenText: null,
        correct: null,
        instead: p.userId ? (instead.get(p.userId) ?? []) : [],
      })),
      more: page.length === PAGE ? page[page.length - 1].telegramId : null,
    };
  }

  const cond: SQL[] = [eq(dailyQuizSends.day, day)];
  if (after !== null) cond.push(sql`${dailyQuizSends.telegramId} > ${after}`);
  if (filter === 'answered') cond.push(isNotNull(dailyQuizSends.answeredAt));
  if (filter === 'not_answered') cond.push(eq(dailyQuizSends.status, 'SENT'), sql`${dailyQuizSends.answeredAt} IS NULL`);
  if (filter === 'wrong') cond.push(eq(dailyQuizSends.correct, false));
  if (filter === 'failed') cond.push(ne(dailyQuizSends.status, 'SENT'), ne(dailyQuizSends.status, 'PENDING'));
  const rows = await db
    .select({
      s: dailyQuizSends,
      appName: users.firstName,
      appUsername: users.username,
      botName: botContacts.firstName,
      botUsername: botContacts.username,
    })
    .from(dailyQuizSends)
    .leftJoin(users, eq(users.telegramId, dailyQuizSends.telegramId))
    .leftJoin(botContacts, eq(botContacts.telegramId, dailyQuizSends.telegramId))
    .where(and(...cond))
    .orderBy(dailyQuizSends.telegramId)
    .limit(PAGE);
  const instead = await insteadFor(rows.flatMap((r) => (r.s.userId ? [r.s.userId] : [])), day);
  return {
    day,
    levels,
    summary,
    rows: rows.map(({ s, appName, appUsername, botName, botUsername }) => {
      const q = QUESTION_BY_ID.get(s.questionId);
      return {
        telegramId: s.telegramId,
        userId: s.userId,
        name: appName || botName || '',
        username: appUsername || botUsername || null,
        level: s.level,
        lang: s.lang,
        status: s.status as string,
        reason: null as NotSentReason | null,
        error: s.error,
        sentAt: s.sentAt?.getTime() ?? null,
        answeredAt: s.answeredAt?.getTime() ?? null,
        chosenText: q && s.chosen !== null ? (optionsOf(q, lang)[s.chosen] ?? null) : null,
        correct: s.correct,
        instead: s.userId ? (instead.get(s.userId) ?? []) : [],
      };
    }),
    more: rows.length === PAGE ? rows[rows.length - 1].s.telegramId : null,
  };
}

const clock = (ms: number) => new Date(ms).toLocaleTimeString('ru-RU', { timeZone: 'Europe/Warsaw', hour: '2-digit', minute: '2-digit' });
const dmy = (day: string) => `${day.slice(8, 10)}.${day.slice(5, 7)}`;
const REASON_TEXT: Record<Exclude<Eligibility, 'ok'>, string> = {
  banned: 'Человек заблокирован в админке — бот ему ничего не шлёт.',
  opted_out: 'Человек сам выключил вопрос дня: кнопка «🔕 Не присылать», команда /stop или выключатель в приложении.',
  blocked: 'Человек заблокировал бота в Telegram — сообщения не доходят, пока он снова не напишет боту.',
  no_chat: 'Telegram не разрешает боту писать первым: человек открыл игру по ссылке и ни разу не нажал «Start» в чате с ботом (и не давал разрешение в приложении).',
  paused: 'Пауза: три вопроса дня подряд остались без ответа. Снимется сама, как только человек напишет боту или откроет приложение.',
};
const TEMPLATE_TEXT: Record<string, string> = { lesson: '«пора на урок»', streak: '«не потеряй серию»', return: '«давно не виделись»', quiz: 'быстрый вопрос' };

function insteadLines(list: InsteadMessage[]): string[] {
  return list.map((m) => {
    const at = m.at ? ` в ${clock(m.at)}` : '';
    if (m.kind === 'quiz_invite') return m.status === 'SENT' ? `Пришло приглашение к быстрому вопросу${at} (обычное приглашение в бот, не вопрос дня).` : `Приглашение к быстрому вопросу не дошло (${m.status}).`;
    if (m.replacedByDaily) return 'Напоминание о занятии не отправлялось: его заменил вопрос дня.';
    const tpl = m.template ? ` ${TEMPLATE_TEXT[m.template] ?? m.template}` : '';
    return m.status === 'SENT' ? `Пришло обычное напоминание о занятии${tpl}${at}.` : `Напоминание о занятии${tpl} не дошло (${m.status}).`;
  });
}

/** Найти человека по telegram id, @нику или имени: до 10 совпадений. */
export async function findPeople(who: string) {
  const q = who.trim().replace(/^@/, '');
  if (!q) return [];
  if (/^\d+$/.test(q)) {
    const p = await personByTelegramId(Number(q));
    return p ? [p] : [];
  }
  const like = `%${q.toLowerCase()}%`;
  const ids = await db.all<{ t: number }>(sql`
    SELECT telegram_id AS t FROM users WHERE telegram_id > 0 AND (lower(coalesce(username, '')) LIKE ${like} OR lower(coalesce(first_name, '')) LIKE ${like})
    UNION SELECT telegram_id AS t FROM bot_contacts WHERE lower(coalesce(username, '')) LIKE ${like} OR lower(coalesce(first_name, '')) LIKE ${like}
    LIMIT 10`);
  const out: DailyPerson[] = [];
  for (const { t } of ids) {
    const p = await personByTelegramId(Number(t));
    if (p) out.push(p);
  }
  return out;
}

/**
 * «Почему мне не пришёл вопрос дня?» — разбор по одному человеку за день: состояние рассылки, исключение, отправка и ответ,
 * что пришло вместо вопроса, и итог одной фразой (владелец 2026-11-15: «вопрос не пришёл, а пришло обычное приглашение в игру»).
 */
export async function explainPerson(who: string, day: string, lang: UiLang, now = new Date()) {
  const found = await findPeople(who);
  const [state, run] = await Promise.all([readDailyState(), readDailyRun()]);
  const sending = await dayIsSending(state, day);
  const today = warsawDay(now);
  const results = [];
  for (const p of found) {
    const send = (await db.select().from(dailyQuizSends).where(and(eq(dailyQuizSends.day, day), eq(dailyQuizSends.telegramId, p.telegramId))))[0];
    const instead = p.userId ? ((await insteadFor([p.userId], day)).get(p.userId) ?? []) : [];
    const eligibility = dailyEligibility(p);
    const steps: string[] = [];
    let verdict: string;
    let tone: 'green' | 'gold' | 'red' | 'gray';
    if (send) {
      const q = QUESTION_BY_ID.get(send.questionId);
      const chosen = q && send.chosen !== null ? optionsOf(q, lang)[send.chosen] : null;
      if (send.status === 'SENT') {
        steps.push(`Вопрос дня (${send.level}) ушёл${send.sentAt ? ` в ${clock(send.sentAt.getTime())}` : ''}.`);
        if (send.answeredAt) {
          verdict = `Получил(а) вопрос дня и ответил(а) ${send.correct ? 'верно' : 'неверно'}${chosen ? ` — выбрал(а) «${chosen}»` : ''}.`;
          tone = send.correct ? 'green' : 'gold';
          steps.push(`Ответ в ${clock(send.answeredAt.getTime())}: ${send.correct ? 'верно ✓' : 'неверно ✗'}${chosen ? ` («${chosen}»)` : ''}.`);
        } else {
          verdict = 'Получил(а) вопрос дня, но пока не ответил(а).';
          tone = 'gold';
        }
      } else if (send.status === 'PENDING') {
        verdict = 'Вопрос как раз отправляется.';
        tone = 'gray';
      } else {
        const why = send.status === 'BLOCKED' ? 'человек заблокировал бота' : send.status === 'NO_CHAT' ? 'Telegram не даёт боту писать первым (человек не нажимал «Start» в боте)' : `ошибка Telegram${send.error ? `: ${send.error}` : ''}`;
        verdict = `Бот пытался отправить вопрос, но он не дошёл: ${why}.`;
        tone = 'red';
      }
    } else if (!state.enabled) {
      verdict = 'Вопрос дня не пришёл, потому что рассылка вопроса дня выключена — сейчас он не уходит никому.';
      tone = 'red';
      steps.push('Пока рассылка выключена, бот шлёт обычные напоминания о занятии (в час, который игрок выбрал в приложении) и приглашения к быстрому вопросу в 13:00. Включить рассылку — кнопка «Запустить» вверху этой страницы.');
    } else if (state.startDay && day < state.startDay) {
      verdict = `Рассылка начнётся с ${dmy(state.startDay)} — в этот день вопрос дня ещё не отправлялся.`;
      tone = 'gray';
    } else if (!sending) {
      verdict = 'Этот день пропущен в плане публикаций — вопрос дня в этот день не отправлялся.';
      tone = 'gray';
    } else if (eligibility !== 'ok') {
      verdict = `Вопрос дня этому человеку не отправляется. ${REASON_TEXT[eligibility]}`;
      tone = 'red';
    } else if (day === today) {
      const w = sendWindow(state, day);
      const done = run?.day === day && run.done;
      if (now < w.from) {
        verdict = `Получит сегодня: отправка начнётся в ${clock(w.from.getTime())} по Варшаве.`;
        tone = 'gray';
      } else if (now > w.to || done) {
        verdict = done ? 'Отправка сегодня закончилась, а этого человека в ней не было — возможно, он появился позже, чем прошла очередь.' : 'Окно отправки сегодня закрылось, а очередь до этого человека не дошла.';
        tone = 'red';
      } else {
        verdict = 'Отправка идёт — очередь до этого человека ещё не дошла.';
        tone = 'gray';
      }
    } else {
      verdict = 'В этот день вопрос этому человеку не отправлялся (очередь не дошла или он появился позже).';
      tone = 'gray';
    }
    steps.push(...insteadLines(instead));
    if (!p.userId) steps.push('Этот человек есть только в боте — в приложение он не заходил.');
    results.push({
      telegramId: p.telegramId,
      userId: p.userId,
      name: p.firstName,
      username: p.username,
      level: personLevel(p),
      lang: personLang(p),
      eligibility,
      send: send ? { status: send.status, sentAt: send.sentAt?.getTime() ?? null, answeredAt: send.answeredAt?.getTime() ?? null, correct: send.correct } : null,
      instead,
      verdict,
      tone,
      steps,
    });
  }
  return { day, state, people: results };
}

/** Карточка игрока: вопросы дня за последние 14 дней. */
export async function userDailyQuiz(telegramId: number, lang: UiLang, now = new Date()) {
  const rows = await db
    .select()
    .from(dailyQuizSends)
    .where(and(eq(dailyQuizSends.telegramId, telegramId), gte(dailyQuizSends.day, addDays(warsawDay(now), -13))))
    .orderBy(desc(dailyQuizSends.day));
  return rows.map((s) => ({
    day: s.day,
    questionId: s.questionId,
    prompt: QUESTION_BY_ID.get(s.questionId)?.prompt[lang] ?? s.questionId,
    status: s.status,
    answeredAt: s.answeredAt?.getTime() ?? null,
    correct: s.correct,
  }));
}
