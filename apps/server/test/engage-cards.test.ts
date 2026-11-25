/**
 * Карточки бота (docs/superpowers/specs/2026-11-24-engagement-design.md, разделы 3–5): подпись влезает в лимит Telegram, украинский —
 * без русских букв, кнопка ведёт в нужный экран и несёт метку для отчёта, картинка миссии — по категории, «🔕 Не присылать такие
 * сообщения» выключает карточки и меняется на «🔔 Присылать снова».
 */
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { eq } from 'drizzle-orm';
import { db } from '../src/db';
import { engagePeople } from '../src/db/schema';
import { cardSeed, cardVariants, cardView, type CardData } from '../src/bot/engage/views';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const CHANNEL = resolve(__dirname, '../../web/public/channel');
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
  { kind: 'comeback', streakBest: 128, words: 1234, city: 'Gorzów Wielkopolski', gift: 50 },
  { kind: 'comeback', streakBest: 0, words: 0, city: null, gift: null },
  { kind: 'mission', slug: 'zabka-first-order', title: long, minutes: 12, category: 'shop' },
  { kind: 'start' },
];
type Btn = { text: string; web_app?: { url: string }; callback_data?: string };
const buttons = (d: CardData, lang: (typeof LANGS)[number] = 'ru') => cardView(d, lang).keyboard.inline_keyboard.flat() as Btn[];

describe('карточки бота', () => {
  it('подпись влезает в лимит Telegram и в украинском нет русских букв — во всех вариантах', () => {
    for (const d of samples)
      for (const lang of LANGS)
        for (let v = 0; v < cardVariants(d.kind); v++) {
          const { text } = cardView(d, lang, v);
          expect(text.length, `${d.kind} ${lang} v${v}`).toBeLessThanOrEqual(CAPTION_LIMIT);
          expect(text.length, `${d.kind} ${lang} v${v}`).toBeGreaterThan(40);
          if (lang === 'uk') expect(text, `${d.kind} v${v}`).not.toMatch(/[ыэъё]/i);
        }
  });

  it('тексты называют главное: остаток урока, подарок, миссию', () => {
    expect(cardView({ kind: 'newcomer', left: 5 }, 'ru').text).toContain('осталось 5');
    expect(cardView({ kind: 'newcomer', left: null }, 'ru').text).toContain('3 минуты');
    const back = cardView({ kind: 'comeback', streakBest: 12, words: 40, city: 'Kraków', gift: 50 }, 'ru').text;
    expect(back).toContain('Давно не виделись');
    expect(back).toContain('50');
    expect(back).toContain('Kraków');
    expect(cardView({ kind: 'mission', slug: 's', title: 'В аптеке', minutes: 10, category: 'shop' }, 'ru').text).toContain('«В аптеке»');
    // В любом варианте: остаток урока, подарок и город, название миссии — на месте.
    for (let v = 0; v < 3; v++) {
      expect(cardView({ kind: 'newcomer', left: 5 }, 'ru', v).text).toContain('5 заданий');
      const b = cardView({ kind: 'comeback', streakBest: 12, words: 40, city: 'Kraków', gift: 50 }, 'uk', v).text;
      expect(b).toContain('50 злотих');
      expect(b).toContain('Kraków');
      expect(cardView({ kind: 'mission', slug: 's', title: 'Na poczcie', minutes: 12, category: 'home' }, 'en', v).text).toContain('Mission of the week: “Na poczcie”');
    }
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
    // Нажал «Старт», в игру не заходил (владелец 2026-11-25): кнопка открывает игру с меткой card_start.
    const st = urlOf(samples[5]);
    expect(st.searchParams.get('src')).toBe('card_start');
    for (const d of samples) expect(buttons(d).at(-1)!.callback_data).toBe('eg:off');
  });

  it('карточка «Старт» зовёт в игру: первый урок, бесплатно, кнопка «Открыть игру» — во всех языках и вариантах', () => {
    for (let v = 0; v < 3; v++) {
      expect(cardView({ kind: 'start' }, 'ru', v).text, `ru v${v}`).toMatch(/урок/);
      expect(cardView({ kind: 'start' }, 'uk', v).text, `uk v${v}`).toMatch(/урок/);
      expect(cardView({ kind: 'start' }, 'en', v).text, `en v${v}`).toMatch(/lesson/i);
    }
    expect(buttons({ kind: 'start' }, 'ru')[0].text).toMatch(/Открыть игру/);
  });

  it('картинки — из запаса канала (public/channel), миссия — по теме, и все файлы есть', () => {
    const all = new Set<string>();
    for (const d of samples) for (let v = 0; v < 12; v++) all.add(cardView(d, 'ru', v).image);
    for (const cat of ['shop', 'food', 'road', 'transport', 'home', 'work', 'other']) for (let v = 0; v < 12; v++) all.add(cardView({ kind: 'mission', slug: 's', title: 't', minutes: 10, category: cat }, 'ru', v).image);
    for (const img of all) {
      expect(img, img).toMatch(/^channel\/[a-z0-9-]+\.jpg$/);
      expect(existsSync(resolve(CHANNEL, img.slice('channel/'.length))), img).toBe(true);
    }
    const shop = new Set(Array.from({ length: 12 }, (_, v) => cardView({ kind: 'mission', slug: 's', title: 't', minutes: 10, category: 'shop' }, 'ru', v).image));
    expect([...shop].some((x) => /apteka|targ|paczka|bank/.test(x))).toBe(true);
    const work = new Set(Array.from({ length: 12 }, (_, v) => cardView({ kind: 'mission', slug: 's', title: 't', minutes: 10, category: 'work' }, 'ru', v).image));
    expect([...work].every((x) => /praca|rozmowa|budowa|urzad/.test(x))).toBe(true);
  });

  it('у каждой карточки несколько вариантов текста и картинки (владелец 2026-11-24: «картинки всегда одинаковые»)', () => {
    for (const d of samples) {
      const texts = new Set(Array.from({ length: 12 }, (_, v) => cardView(d, 'ru', v).text));
      const images = new Set(Array.from({ length: 12 }, (_, v) => cardView(d, 'ru', v).image));
      expect(texts.size, `${d.kind} тексты`).toBeGreaterThanOrEqual(3);
      expect(images.size, `${d.kind} картинки`).toBeGreaterThanOrEqual(3);
      expect(cardVariants(d.kind)).toBeGreaterThanOrEqual(3);
    }
  });

  it('вариант зависит от человека и дня: в один день у разных людей разные, у одного человека меняются по дням', () => {
    const day = '2026-12-05';
    const people = new Set(Array.from({ length: 10 }, (_, i) => cardSeed(9_000_000 + i, day) % 3));
    expect(people.size).toBeGreaterThan(1);
    const days = new Set(['2026-12-05', '2026-12-06', '2026-12-07'].map((d) => cardSeed(9_000_001, d) % 3));
    expect(days.size).toBeGreaterThan(1);
    expect(cardSeed(9_000_001, day)).toBe(cardSeed(9_000_001, day));
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
