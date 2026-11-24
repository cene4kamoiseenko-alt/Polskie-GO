/**
 * Карточки бота (docs/superpowers/specs/2026-11-24-engagement-design.md, разделы 3–5): подпись влезает в лимит Telegram, украинский —
 * без русских букв, кнопка ведёт в нужный экран и несёт метку для отчёта, картинка миссии — по категории, «🔕 Не присылать такие
 * сообщения» выключает карточки и меняется на «🔔 Присылать снова».
 */
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { eq } from 'drizzle-orm';
import { db } from '../src/db';
import { engagePeople } from '../src/db/schema';
import { cardView, type CardData } from '../src/bot/engage/views';
import { handleEngageCallback } from '../src/bot/engage/callbacks';
import { CAPTION_LIMIT } from '../src/bot/send';
import { disposeEnv, getEnv } from './helpers';
import { fakeTelegram } from './tg-fake';

beforeAll(async () => {
  const { env } = await getEnv();
  env.WEB_APP_URL = 'https://polski.example/app/';
  env.TELEGRAM_BOT_USERNAME = 'Polski_Go_Bot';
});
afterAll(disposeEnv);
afterEach(() => vi.unstubAllGlobals());

const LANGS = ['uk', 'ru', 'en'] as const;
const long = 'Ż'.repeat(60);
const samples: CardData[] = [
  { kind: 'newcomer', left: null },
  { kind: 'newcomer', left: 5 },
  { kind: 'comeback', streakBest: 128, words: 1234, city: 'Gorzów Wielkopolski' },
  { kind: 'comeback', streakBest: 0, words: 0, city: null },
  { kind: 'mission', slug: 'zabka-first-order', title: long, minutes: 12, category: 'shop' },
];
type Btn = { text: string; web_app?: { url: string }; callback_data?: string };
const buttons = (d: CardData, lang: (typeof LANGS)[number] = 'ru') => cardView(d, lang).keyboard.inline_keyboard.flat() as Btn[];

describe('карточки бота', () => {
  it('подпись влезает в лимит Telegram и в украинском нет русских букв', () => {
    for (const d of samples)
      for (const lang of LANGS) {
        const { text } = cardView(d, lang);
        expect(text.length, `${d.kind} ${lang}`).toBeLessThanOrEqual(CAPTION_LIMIT);
        expect(text.length, `${d.kind} ${lang}`).toBeGreaterThan(40);
        if (lang === 'uk') expect(text, d.kind).not.toMatch(/[ыэъё]/i);
      }
  });

  it('тексты называют главное: остаток урока, подарок, миссию', () => {
    expect(cardView({ kind: 'newcomer', left: 5 }, 'ru').text).toContain('осталось 5');
    expect(cardView({ kind: 'newcomer', left: null }, 'ru').text).toContain('3 минуты');
    const back = cardView({ kind: 'comeback', streakBest: 12, words: 40, city: 'Kraków' }, 'ru').text;
    expect(back).toContain('Давно не виделись');
    expect(back).toContain('50');
    expect(back).toContain('Kraków');
    expect(cardView({ kind: 'mission', slug: 's', title: 'В аптеке', minutes: 10, category: 'shop' }, 'ru').text).toContain('«В аптеке»');
  });

  it('кнопка ведёт в нужный экран и несёт метку', () => {
    const urlOf = (d: CardData) => new URL(buttons(d)[0].web_app!.url);
    const nc = urlOf(samples[0]);
    expect(nc.searchParams.get('bot_screen')).toBe('continue');
    expect(nc.searchParams.get('src')).toBe('card_newcomer');
    const cb = urlOf(samples[2]);
    expect(cb.searchParams.get('bot_screen')).toBeNull();
    expect(cb.searchParams.get('src')).toBe('card_comeback');
    const ms = urlOf(samples[4]);
    expect(ms.searchParams.get('bot_screen')).toBe('life');
    expect(ms.searchParams.get('src')).toBe('card_mission');
    for (const d of samples) expect(buttons(d).at(-1)!.callback_data).toBe('eg:off');
  });

  it('картинка: миссия — по категории, остальные — свои', () => {
    const img = (category: string) => cardView({ kind: 'mission', slug: 's', title: 't', minutes: 10, category }, 'ru').image;
    expect(img('shop')).toBe('cards/mission-shop.jpg');
    expect(img('road')).toBe('cards/mission-road.jpg');
    expect(img('transport')).toBe('cards/mission-road.jpg');
    expect(img('home')).toBe('cards/mission-home.jpg');
    expect(img('work')).toBe('cards/mission-work.jpg');
    expect(img('food')).toBe('cards/mission.jpg');
    expect(cardView(samples[0], 'ru', 0).image).toBe('cards/newcomer-1.jpg');
    expect(cardView(samples[0], 'ru', 1).image).toBe('cards/newcomer-2.jpg');
    expect(cardView(samples[2], 'ru', 3).image).toBe('cards/comeback-2.jpg');
  });

  it('«Не присылать такие сообщения» выключает карточки, «Присылать снова» — включает', async () => {
    const tg = 9_200_001;
    const tgCalls = fakeTelegram();
    const message = { message_id: 55, chat: { id: tg, type: 'private' }, reply_markup: cardView(samples[2], 'ru').keyboard };
    expect(await handleEngageCallback({ id: 'cb1', from: { id: tg }, message, data: 'eg:off' }, 'ru')).toBe('engage_off');
    expect((await db.select().from(engagePeople).where(eq(engagePeople.telegramId, tg)))[0].optedOutAt).toBeInstanceOf(Date);
    const edit = tgCalls.find((c) => c.method === 'editMessageReplyMarkup')!;
    const flat = (edit.params.reply_markup.inline_keyboard as Btn[][]).flat();
    expect(flat.at(-1)!.callback_data).toBe('eg:on');
    expect(flat[0].web_app?.url).toContain('src=card_comeback');
    expect(tgCalls.find((c) => c.method === 'answerCallbackQuery')!.params.text).toBe('Больше не пришлю такие сообщения');

    fakeTelegram();
    expect(await handleEngageCallback({ id: 'cb2', from: { id: tg }, message, data: 'eg:on' }, 'ru')).toBe('engage_on');
    expect((await db.select().from(engagePeople).where(eq(engagePeople.telegramId, tg)))[0].optedOutAt).toBeNull();
    expect(await handleEngageCallback({ id: 'cb3', from: { id: tg }, message, data: 'qz:next' }, 'ru')).toBeNull();
  });
});
