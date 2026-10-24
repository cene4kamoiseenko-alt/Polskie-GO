import type { FastifyInstance } from 'fastify';
import type { ExerciseItem, ChoiceData, TextData, OrderData, MatchData, PronunciationData, DialogueData } from '@polski-go/shared';
import { buildApp } from '../src/app';
import { prisma } from '../src/db';
import { signInitData } from '../src/lib/telegram';

let app: FastifyInstance | null = null;
export async function getApp() {
  app ??= await buildApp();
  return app;
}

let nextId = 5_000_000 + Math.floor(Math.random() * 1_000_000);

/** Створює користувача через справжній вхід Telegram (підписані initData). */
export async function login(extra: Record<string, string> = {}) {
  const a = await getApp();
  const id = nextId++;
  const initData = signInitData(
    { auth_date: String(Math.floor(Date.now() / 1000)), query_id: 'AAH', user: JSON.stringify({ id, first_name: `User${id}`, language_code: 'uk' }), ...extra },
    process.env.TELEGRAM_BOT_TOKEN!,
  );
  const res = await a.inject({ method: 'POST', url: '/api/auth/telegram', payload: { initData } });
  if (res.statusCode !== 200) throw new Error(res.body);
  const token = res.json().token as string;
  const user = await prisma.user.findUniqueOrThrow({ where: { telegramId: BigInt(id) } });
  const call = async (method: 'GET' | 'POST' | 'PATCH' | 'DELETE', url: string, payload?: unknown) => {
    const r = await a.inject({ method, url, payload: payload as never, headers: { authorization: `Bearer ${token}` } });
    return { status: r.statusCode, body: r.body ? r.json() : null };
  };
  return { token, user, telegramId: id, call };
}

/** Правильні відповіді для вправи (з серверного знімка сесії). */
export function correctAnswers(item: ExerciseItem): unknown[] {
  const d = item.data;
  switch (item.type) {
    case 'SENTENCE_TRANSLATION':
    case 'DICTATION':
    case 'GRAMMAR':
      return [{ text: (d as TextData).accepted[0] }];
    case 'BUILD_SENTENCE':
    case 'WORD_ORDER':
      return [{ tokens: (d as OrderData).answer }];
    case 'MATCH_PAIRS':
      return [{ pairs: (d as MatchData).pairs.map((p) => [p.l, p.r]) }];
    case 'PRONUNCIATION':
      return [{ transcript: (d as PronunciationData).text }];
    case 'DIALOGUE':
    case 'SITUATION':
      return (d as DialogueData).steps.flatMap((s, i) => (s.options?.length ? [{ step: i, optionId: s.answer }] : []));
    default:
      return [{ optionId: (d as ChoiceData).answer }];
  }
}

export function wrongAnswer(item: ExerciseItem): unknown {
  switch (item.type) {
    case 'SENTENCE_TRANSLATION':
    case 'DICTATION':
    case 'GRAMMAR':
      return { text: 'zzz' };
    case 'BUILD_SENTENCE':
    case 'WORD_ORDER':
      return { tokens: ['zzz'] };
    case 'MATCH_PAIRS':
      return { pairs: [] };
    case 'PRONUNCIATION':
      return { transcript: 'zzz' };
    case 'DIALOGUE':
    case 'SITUATION': {
      const s = (item.data as DialogueData).steps.findIndex((x) => x.options?.length);
      const step = (item.data as DialogueData).steps[s];
      return { step: s, optionId: step.options!.find((o) => o.id !== step.answer)!.id };
    }
    default: {
      const c = item.data as ChoiceData;
      return { optionId: c.options.find((o) => o.id !== c.answer)!.id };
    }
  }
}

/** Пройти сесію повністю (правильно або з помилками), обходячи анти-бот затримку. */
export async function playSession(call: Awaited<ReturnType<typeof login>>['call'], sessionId: string, opts: { wrong?: number } = {}) {
  const s = await prisma.learningSession.findUniqueOrThrow({ where: { id: sessionId } });
  const items = s.items as unknown as ExerciseItem[];
  let wrongLeft = opts.wrong ?? 0;
  for (const item of items) {
    if (wrongLeft > 0) {
      wrongLeft--;
      const w = await call('POST', `/api/sessions/${sessionId}/answer`, { key: item.key, answer: wrongAnswer(item) });
      if (w.status !== 200) throw new Error(JSON.stringify(w.body));
      if (item.type === 'DIALOGUE' || item.type === 'SITUATION') {
        for (const a of correctAnswers(item)) await call('POST', `/api/sessions/${sessionId}/answer`, { key: item.key, answer: a });
      }
      continue;
    }
    for (const a of correctAnswers(item)) {
      const r = await call('POST', `/api/sessions/${sessionId}/answer`, { key: item.key, answer: a });
      if (r.status !== 200 || !r.body.correct) throw new Error(`${item.type}: ${JSON.stringify(r.body)}`);
    }
  }
  await prisma.learningSession.update({ where: { id: sessionId }, data: { startedAt: new Date(Date.now() - 10 * 60_000) } });
  return call('POST', `/api/sessions/${sessionId}/finish`);
}

export async function lessonId(slug: string) {
  return (await prisma.lesson.findUniqueOrThrow({ where: { slug } })).id;
}
