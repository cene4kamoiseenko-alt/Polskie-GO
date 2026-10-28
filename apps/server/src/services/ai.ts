/**
 * Rozmowa AI — викладач польської на базі Claude.
 * Ключ API — лише на сервері. Ліміти: N запитів на день (Free/Premium) та місячний бюджет токенів.
 */
import Anthropic from '@anthropic-ai/sdk';
import { dayKey, isUiLang, tr, type UiLang } from '@polski-go/shared';
import { and, desc, eq, inArray, like, sql, sum } from 'drizzle-orm';
import { config } from '../env';
import { atomic, db } from '../db';
import { aiConversations, aiUsage, playerProgress, userSettings, vocabularyEntries } from '../db/schema';
import { HttpError, badRequest, forbidden, notFound } from '../lib/errors';
import { getRewards } from './gameConfig';
import { isPremium } from './premium';

export const AI_MODES = {
  chat: { premium: false },
  check: { premium: false },
  explain: { premium: false },
  roleplay: { premium: true },
  exam: { premium: true },
} as const;
export type AiMode = keyof typeof AI_MODES;

export const ROLEPLAYS = ['cafe', 'shop', 'interview', 'doctor', 'airport', 'landlord', 'meeting', 'work', 'urzad', 'train'] as const;

const LANG_NAMES: Record<UiLang, string> = { uk: 'Ukrainian', ru: 'Russian', en: 'English' };

const ROLEPLAY_SCENES: Record<(typeof ROLEPLAYS)[number], string> = {
  cafe: 'You are a barista in a café in Wrocław. The learner is a customer ordering.',
  doctor: 'You are a family doctor (lekarz rodzinny) in Katowice. The learner is a patient describing symptoms.',
  urzad: 'You are a clerk at the Urząd Wojewódzki in Lublin. The learner wants to apply for a residence card (karta pobytu).',
  interview: 'You are an HR manager at a logistics company in Poznań interviewing the learner for a warehouse job.',
  landlord: 'You are a landlady in Kraków showing the learner a flat for rent.',
  shop: 'You are a shop assistant at a small grocery store (sklep spożywczy) in Gdańsk. The learner is buying food and asking about prices.',
  airport: 'You are a check-in agent at Warsaw Chopin Airport. The learner is checking in for a flight and asking about luggage and the gate.',
  meeting: 'You are a friendly Polish neighbour of the same age meeting the learner for the first time at a party in Łódź. Make small talk: names, origin, work, hobbies.',
  work: 'You are the learner\'s new team leader at an office in Wrocław. Talk about tasks, schedule, meetings and ask polite workplace questions.',
  train: 'You are a ticket clerk at Wrocław Główny station. The learner wants to buy a train ticket to Gdańsk.',
};

const MAX_HISTORY = 20;
const MAX_INPUT = 1000;
// Короткі відповіді викладача: ліміт контролює витрати (чат, не довгі тексти).
const MAX_OUTPUT_TOKENS = 1500;

function systemPrompt(opts: { level: string; lang: UiLang; mode: AiMode; scene?: string }) {
  const explainLang = LANG_NAMES[opts.lang];
  const lines = [
    'You are Bobek, the friendly beaver mascot and Polish teacher of the POLSKI GO app.',
    `The learner's confirmed Polish level is ${opts.level} (CEFR). Most learners are Ukrainians and Belarusians living in Poland.`,
    `Write your Polish at or slightly above ${opts.level}: short sentences and common words for A0–A1, richer language for B1–B2.`,
    `Explanations, corrections and grammar notes go in ${explainLang}. Polish examples stay in Polish.`,
    'When the learner writes Polish with mistakes, first reply naturally, then add a short "✏️" section listing each correction (wrong → right) with a one-line reason.',
    'Point out false friends between Ukrainian/Belarusian/Russian and Polish when relevant.',
    'Keep answers compact (under 150 words) and encouraging. Use at most one or two emoji.',
    'Stay on the topic of learning Polish and life in Poland. Politely decline unrelated tasks.',
    'Never claim to issue official certificates or confirm a CEFR level; the app does that through its own exams.',
  ];
  if (opts.mode === 'check') lines.push('Mode: grammar check. Correct the learner\'s text, show the corrected version, then explain each mistake briefly.');
  if (opts.mode === 'explain') lines.push('Mode: explain. Explain the Polish word, phrase or grammar point the learner asks about, with 2–3 example sentences.');
  if (opts.mode === 'exam') lines.push('Mode: exam preparation. Act as an examiner for the Polish state certificate exam at the learner\'s target level. Give one task at a time (reading, grammar, writing or speaking prompt), then evaluate the answer.');
  if (opts.mode === 'roleplay' && opts.scene) {
    lines.push(`Mode: role-play. ${opts.scene} Stay in character and speak Polish. Add corrections in ${explainLang} only in the "✏️" section.`);
  }
  return lines.join('\n');
}

type StoredMessage = { role: 'user' | 'assistant'; content: string; at: string };

let client: Anthropic | null = null;
function getClient() {
  if (!config.anthropicKey) return null;
  client ??= new Anthropic({ apiKey: config.anthropicKey });
  return client;
}

async function monthlyOutputTokens(): Promise<number> {
  const month = dayKey(new Date()).slice(0, 7);
  const [row] = await db.select({ n: sum(aiUsage.tokensOut) }).from(aiUsage).where(like(aiUsage.day, `${month}%`));
  return Number(row?.n ?? 0);
}

export async function listConversations(userId: string) {
  const rows = await db.select().from(aiConversations).where(eq(aiConversations.userId, userId)).orderBy(desc(aiConversations.updatedAt)).limit(20);
  return rows.map((r) => ({ id: r.id, mode: r.mode, title: r.title, updatedAt: r.updatedAt, messages: r.messages }));
}

export async function sendMessage(userId: string, input: { conversationId?: string; mode: AiMode; scene?: string; text: string }) {
  const text = input.text.trim().slice(0, MAX_INPUT);
  if (!text) throw badRequest('empty_message');
  const mode = input.mode;
  const premium = await isPremium(userId);
  if (AI_MODES[mode].premium && !premium) throw forbidden('premium_required');

  const [[settings], [progress], cfg] = await Promise.all([
    db.select().from(userSettings).where(eq(userSettings.userId, userId)),
    db.select().from(playerProgress).where(eq(playerProgress.userId, userId)),
    getRewards(),
  ]);
  const user = { settings, progress };
  const tz = user.settings?.timezone ?? 'Europe/Warsaw';
  const day = dayKey(new Date(), tz);
  const limit = premium ? cfg.premiumAiMessagesPerDay : cfg.freeAiMessagesPerDay;
  const usage = await db.query.aiUsage.findFirst({ where: and(eq(aiUsage.userId, userId), eq(aiUsage.day, day)) });
  if ((usage?.requests ?? 0) >= limit) throw new HttpError(429, 'ai_limit_reached', 'Денний ліміт AI-повідомлень вичерпано');

  let conv = input.conversationId ? await db.query.aiConversations.findFirst({ where: eq(aiConversations.id, input.conversationId) }) : null;
  if (conv && conv.userId !== userId) throw notFound();
  if (!conv) {
    [conv] = await db.insert(aiConversations).values({ userId, mode: input.scene ? `${mode}:${input.scene}` : mode, title: text.slice(0, 60) }).returning();
  }
  const history = (conv.messages as unknown as StoredMessage[]) ?? [];
  const lang: UiLang = isUiLang(user.settings?.uiLanguage) ? user.settings.uiLanguage : 'uk';
  const scene = mode === 'roleplay' ? ROLEPLAY_SCENES[(input.scene ?? 'cafe') as keyof typeof ROLEPLAY_SCENES] ?? ROLEPLAY_SCENES.cafe : undefined;

  const api = getClient();
  let reply: string;
  let tokensIn = 0;
  let tokensOut = 0;
  let offline = false;

  if (!api || (await monthlyOutputTokens()) >= config.aiMonthlyOutputTokens) {
    offline = true;
    reply = await offlineReply(text, lang, !api);
  } else {
    const messages: Anthropic.Beta.BetaMessageParam[] = [
      ...history.slice(-MAX_HISTORY).map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: text },
    ];
    try {
      const response = await api.beta.messages.create({
        model: config.aiModel,
        max_tokens: MAX_OUTPUT_TOKENS,
        // Розмовний чат: низьке зусилля — швидше і дешевше.
        output_config: { effort: 'low' },
        // Якщо модель відмовить через запобіжники — сервер повторить запит на резервній моделі.
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        system: systemPrompt({ level: user.progress?.languageLevel ?? 'A0', lang, mode, scene }),
        messages,
        metadata: { user_id: userId },
      });
      tokensIn = response.usage.input_tokens;
      tokensOut = response.usage.output_tokens;
      if (response.stop_reason === 'refusal') {
        reply = tr({ uk: 'Вибач, на це я не можу відповісти. Давай повернемося до польської! 🦫', ru: 'Извини, на это я не могу ответить. Вернёмся к польскому! 🦫', en: 'Sorry, I can\'t help with that. Let\'s get back to Polish! 🦫' }, lang);
      } else {
        reply = response.content.flatMap((b) => (b.type === 'text' ? [b.text] : [])).join('\n').trim() || '…';
      }
    } catch (e) {
      if (e instanceof Anthropic.RateLimitError) throw new HttpError(503, 'ai_busy', 'AI тимчасово перевантажений');
      if (e instanceof Anthropic.APIError) throw new HttpError(502, 'ai_error', `AI error ${e.status ?? ''}`.trim());
      throw e;
    }
  }

  const now = new Date().toISOString();
  const updated: StoredMessage[] = [...history, { role: 'user' as const, content: text, at: now }, { role: 'assistant' as const, content: reply, at: now }].slice(-60);
  await atomic([
    db
      .update(aiConversations)
      .set({ messages: updated, tokensIn: sql`${aiConversations.tokensIn} + ${tokensIn}`, tokensOut: sql`${aiConversations.tokensOut} + ${tokensOut}`, updatedAt: new Date() })
      .where(eq(aiConversations.id, conv.id)),
    db
      .insert(aiUsage)
      .values({ userId, day, requests: 1, tokensIn, tokensOut })
      .onConflictDoUpdate({
        target: [aiUsage.userId, aiUsage.day],
        set: { requests: sql`${aiUsage.requests} + 1`, tokensIn: sql`${aiUsage.tokensIn} + ${tokensIn}`, tokensOut: sql`${aiUsage.tokensOut} + ${tokensOut}` },
      }),
  ]);

  return { conversationId: conv.id, reply, offline, used: (usage?.requests ?? 0) + 1, limit };
}

/** Відповідь без LLM: чесно повідомляє про обмежений режим і шукає слова у словнику. */
async function offlineReply(text: string, lang: UiLang, notConfigured: boolean): Promise<string> {
  const words = [...new Set(text.toLowerCase().match(/[a-ząćęłńóśźż]+/g) ?? [])].slice(0, 12);
  const found = words.length ? await db.select().from(vocabularyEntries).where(inArray(vocabularyEntries.pl, words)).limit(6) : [];
  const head = notConfigured
    ? tr({ uk: '🦫 AI-викладач зараз працює в обмеженому режимі (сервіс AI не підключено).', ru: '🦫 AI-преподаватель сейчас работает в ограниченном режиме (сервис AI не подключён).', en: '🦫 The AI tutor is in limited mode (the AI service is not connected).' }, lang)
    : tr({ uk: '🦫 Місячний ліміт AI вичерпано, тож я в обмеженому режимі.', ru: '🦫 Месячный лимит AI исчерпан, поэтому я в ограниченном режиме.', en: '🦫 The monthly AI budget is used up, so I\'m in limited mode.' }, lang);
  if (!found.length) {
    return `${head}\n${tr({ uk: 'Поки що можу підказати слова зі словника — напиши польське слово.', ru: 'Пока могу подсказать слова из словаря — напиши польское слово.', en: 'For now I can look up words from the dictionary — type a Polish word.' }, lang)}`;
  }
  const list = found.map((f) => `• ${f.pl} — ${tr(f.translations as never, lang)}`).join('\n');
  return `${head}\n${tr({ uk: 'Ось що я знайшов у словнику:', ru: 'Вот что я нашёл в словаре:', en: 'Here is what I found in the dictionary:' }, lang)}\n${list}`;
}
