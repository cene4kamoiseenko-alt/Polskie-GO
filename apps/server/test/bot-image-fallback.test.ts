/**
 * Отсутствующая или отвергнутая картинка никогда не ломает отправку бота.
 *  1. Каждый путь картинки, который бот может запросить на любом языке (команды, возвращение, напоминания, быстрые вопросы),
 *     существует в apps/web/public/bot, является JPEG 1280×720 и проверен по самому файлу (scripts/lib/image-quality.mjs):
 *     без мыльных боковых полос и не увеличен из маленького кадра (кроме мягкого запасного из soft_fallback манифеста).
 *     Сцены без файла в боте не подключены: блокированные сцены (assets/telegram/asset-manifest.json, blocked_scenes)
 *     показывают нейтральные кадры commands/*, а не несуществующие адреса.
 *  2. Девять команд × четыре языка: если Telegram отвергает фото (400 / 404, «wrong type of the web page content», «failed to get
 *     HTTP URL content»), приходит тот же текст и те же кнопки обычным сообщением, webhook отвечает 200.
 *  3. Быстрый вопрос с картинкой (только русский: доски категорий): отказ по фото → текстовый вопрос, раунд открыт и без фото.
 *     У uk / pl / en картинок к вопросам нет — вопрос уходит текстом.
 *  4. Адрес не HTTPS (локальная разработка) → фото не запрашивается, сообщение уходит текстом.
 * Telegram здесь — подмена fetch (`fakeTelegram`): проверка кода сервера, а не настоящей доставки.
 */
import { existsSync, readFileSync } from 'node:fs';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { eq } from 'drizzle-orm';
import { UI_LANGS, type UiLang } from '@polski-go/shared';
import { db } from '../src/db';
import { botQuizPlayers, botQuizRounds } from '../src/db/schema';
import { COMMANDS, REMINDER_IMAGES, commandImage, reminderImage, startBackImage } from '../src/bot/catalog';
import { getBindings, setEnv } from '../src/env';
import { quizImage, startQuiz } from '../src/bot/quiz/engine';
import { QUIZ_QUESTIONS } from '../src/bot/quiz/questions';
import { sendCard } from '../src/bot/send';
import { disposeEnv, getEnv, request } from './helpers';
import { jpegSize } from './image-size';
import { analyseImage, qualityProblems } from '../../../scripts/lib/image-quality.mjs';
import { fakeTelegram, tgError } from './tg-fake';

const ORIGIN = 'https://polski.example';
const PUBLIC_BOT = new URL('../../web/public/bot/', import.meta.url);
const MANIFEST = JSON.parse(readFileSync(new URL('../../../assets/telegram/asset-manifest.json', import.meta.url), 'utf8')) as {
  soft_fallback: { file: string; reason: string }[];
};

beforeAll(async () => {
  const { env } = await getEnv();
  env.WEB_APP_URL = `${ORIGIN}/`;
  env.TELEGRAM_BOT_USERNAME = 'Polski_Go_Bot';
  env.TELEGRAM_APP_SHORT_NAME = 'app';
});
afterAll(disposeEnv);
afterEach(() => vi.unstubAllGlobals());

/** Все файлы, которые бот может отправить на любом языке. */
function sendableFiles(): Set<string> {
  const files = new Set<string>();
  for (const lang of UI_LANGS) {
    for (const command of COMMANDS) files.add(commandImage(command, lang));
    files.add(startBackImage(lang));
  }
  for (const kind of Object.keys(REMINDER_IMAGES) as (keyof typeof REMINDER_IMAGES)[]) files.add(reminderImage(kind));
  for (const q of QUIZ_QUESTIONS) for (const lang of UI_LANGS) {
    const image = quizImage(q, lang);
    if (image) files.add(image);
  }
  return files;
}

describe('каждая картинка бота существует и проверена по файлу', () => {
  it('команды, возвращение, напоминания и быстрые вопросы на всех языках → реальные JPEG 1280×720', () => {
    const files = sendableFiles();
    expect(files.size).toBeGreaterThanOrEqual(18);
    for (const file of files) {
      const url = new URL(file, PUBLIC_BOT);
      expect(existsSync(url), `${file}: файла нет`).toBe(true);
      const bytes = readFileSync(url);
      expect(jpegSize(bytes), file).toEqual({ width: 1280, height: 720 });
      expect(bytes.length, `${file} < 10 МБ (лимит sendPhoto)`).toBeLessThan(10 * 1024 * 1024);
      if (file.startsWith('scenes/')) expect(existsSync(new URL(file.replace(/\.jpg$/, '@640.jpg'), PUBLIC_BOT)), `${file}: нет @640`).toBe(true);
    }
  });

  it('ни в одном отправляемом кадре нет мыльных боковых полос и увеличения маленькой картинки', async () => {
    const soft = new Set(MANIFEST.soft_fallback.map((s) => s.file));
    for (const file of sendableFiles()) {
      const q = await analyseImage(readFileSync(new URL(file, PUBLIC_BOT)));
      expect(qualityProblems(q, { softAllowed: soft.has(file) }), `${file}: ${JSON.stringify(q)}`).toEqual([]);
      expect(q.bandLeft + q.bandRight, `${file}: полосы`).toBe(0);
    }
  });

  it('проверка ловит то, что было в production: размытые полосы по бокам и увеличенный маленький кадр', async () => {
    const sharp = (await import('sharp')).default;
    const original = readFileSync(new URL('scenes/ru/words.jpg', PUBLIC_BOT));
    // Как старые ru/*.jpg: кадр уже экрана, а по бокам растянутая размытая копия.
    const inner = await sharp(original).resize(1100, 720, { fit: 'fill' }).toBuffer();
    const blurred = await sharp(original).resize(1280, 720, { fit: 'fill' }).blur(18).toBuffer();
    const padded = await sharp(blurred).composite([{ input: inner, left: 90, top: 0 }]).jpeg({ quality: 88 }).toBuffer();
    const pq = await analyseImage(padded);
    expect(pq.bandLeft, JSON.stringify(pq)).toBeGreaterThanOrEqual(80);
    expect(pq.bandRight, JSON.stringify(pq)).toBeGreaterThanOrEqual(80);
    expect(qualityProblems(pq).length).toBeGreaterThan(0);
    // Как вырезка из коллажа: 512×288, увеличенная до 1280×720.
    const upscaled = await sharp(await sharp(original).resize(512, 288).toBuffer()).resize(1280, 720, { kernel: 'lanczos3' }).jpeg({ quality: 90 }).toBuffer();
    const uq = await analyseImage(upscaled);
    expect(qualityProblems(uq), JSON.stringify(uq)).toEqual([expect.stringMatching(/увеличен из маленького кадра/)]);
    // Исходный полнокадровый кадр проходит.
    expect(qualityProblems(await analyseImage(original))).toEqual([]);
  });
});

describe('Telegram отверг фото: тот же текст и кнопки сообщением, без ошибок', () => {
  const REJECTIONS = [
    () => tgError(400, 'Bad Request: failed to get HTTP URL content'),
    () => tgError(400, 'Bad Request: wrong type of the web page content'),
    () => tgError(400, 'Bad Request: wrong file identifier/HTTP URL specified'),
    () => tgError(404, 'Not Found'),
  ];
  let id = 8_200_000;
  let upd = 90_000;
  const cases = COMMANDS.flatMap((command) => UI_LANGS.map((lang) => [command, lang] as const));

  it.each(cases)('/%s на %s', async (command, lang) => {
    const reject = REJECTIONS[++id % REJECTIONS.length];
    const calls = fakeTelegram((c) => (c.method === 'sendPhoto' ? reject() : undefined));
    const res = await request('POST', '/telegram/webhook', {
      update_id: ++upd,
      message: { message_id: upd, chat: { id, type: 'private' }, from: { id, first_name: `User${id}`, language_code: lang }, text: `/${command}` },
    }, { 'x-telegram-bot-api-secret-token': 'hook-secret' });
    expect(res.status).toBe(200);
    expect(calls[0].method).toBe('sendPhoto');
    expect(calls[1].method, 'после отказа фото — обычное сообщение').toBe('sendMessage');
    expect(calls[1].params.text).toBe(calls[0].params.caption);
    expect(calls[1].params.reply_markup).toEqual(calls[0].params.reply_markup);
    expect(calls.filter((c) => c.method === 'sendPhoto'), 'фото не повторяется').toHaveLength(1);
  });
});

describe('быстрый вопрос с картинкой', () => {
  /** Игрок, которому осталось только вопросы с картинкой для языка: так выбор не случаен. */
  async function playerWithOnlyPhotoQuestions(telegramId: number, lang: UiLang) {
    const photo = QUIZ_QUESTIONS.filter((q) => quizImage(q, lang));
    expect(photo.length).toBeGreaterThan(0);
    const filler = QUIZ_QUESTIONS.filter((q) => !quizImage(q, lang));
    // Последним в списке — вопрос из другой темы, чтобы выбор «не той же темы» не отсеял вопросы с картинкой.
    const last = filler.find((q) => !photo.some((p) => p.category === q.category)) ?? filler[0];
    const recent = [...filler.filter((q) => q.id !== last.id), last].map((q) => q.id);
    await db.insert(botQuizPlayers).values({ telegramId, recent, day: '2000-01-01', dayCount: 0 });
  }

  it.each([['ru', 40]] as const)('%s: отказ по фото → вопрос текстом, раунд открыт без фото', async (lang, offset) => {
    const telegramId = 8_300_000 + offset;
    await playerWithOnlyPhotoQuestions(telegramId, lang);
    const calls = fakeTelegram((c) => (c.method === 'sendPhoto' ? tgError(400, 'Bad Request: failed to get HTTP URL content') : undefined));
    const result = await startQuiz({ telegramId, chatId: telegramId, lang, user: null, source: 'command' });
    expect(result.status).toBe('sent');
    expect(calls.map((c) => c.method)).toEqual(['sendPhoto', 'sendMessage']);
    expect(calls[1].params.text).toBe(calls[0].params.caption);
    expect(calls[1].params.reply_markup).toEqual(calls[0].params.reply_markup);
    const round = (await db.select().from(botQuizRounds).where(eq(botQuizRounds.telegramId, telegramId)))[0];
    expect(round).toMatchObject({ status: 'OPEN', hasPhoto: false });
  });

  it.each(['uk', 'pl', 'en'] as const)('%s: картинок к вопросам нет — вопрос уходит текстом', async (lang) => {
    expect(QUIZ_QUESTIONS.filter((q) => quizImage(q, lang))).toEqual([]);
    const telegramId = 8_300_060 + UI_LANGS.indexOf(lang);
    const calls = fakeTelegram();
    const result = await startQuiz({ telegramId, chatId: telegramId, lang, user: null, source: 'command' });
    expect(result.status).toBe('sent');
    expect(calls.map((c) => c.method)).toEqual(['sendMessage']);
  });

  it('блокировка бота (403) картинкой не маскируется: вопрос не остаётся «открытым»', async () => {
    const telegramId = 8_300_050;
    await playerWithOnlyPhotoQuestions(telegramId, 'ru');
    const calls = fakeTelegram(() => tgError(403, 'Forbidden: bot was blocked by the user'));
    await expect(startQuiz({ telegramId, chatId: telegramId, lang: 'ru', user: null, source: 'command' })).rejects.toThrow();
    expect(calls).toHaveLength(1);
    expect(await db.select().from(botQuizRounds).where(eq(botQuizRounds.telegramId, telegramId))).toHaveLength(0);
  });
});

describe('адрес приложения без HTTPS', () => {
  it('фото не запрашивается: сообщение уходит текстом, причина записана', async () => {
    const before = getBindings();
    setEnv({ ...before, WEB_APP_URL: 'http://localhost:5173/' });
    try {
      const calls = fakeTelegram();
      const sent = await sendCard({ chatId: 1 }, { text: 'Текст карточки', buttons: [{ label: 'ОК', screen: 'home' }] }, 'commands/help.jpg');
      expect(calls.map((c) => c.method)).toEqual(['sendMessage']);
      expect(sent).toMatchObject({ method: 'sendMessage', photoError: 'image url is not https' });
    } finally {
      setEnv(before);
    }
  });
});
