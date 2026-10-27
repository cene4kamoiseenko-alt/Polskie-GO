/**
 * Webhook бота целиком: настоящая база (Miniflare D1), Bot API подменён.
 * Девять команд, неизвестные команды, первый и повторный /start, реферальная ссылка, дубли update_id,
 * запасной путь sendMessage, группы, согласие и /stop, сбой базы, языки, Stars не затронуты (game.test.ts).
 */
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { and, eq } from 'drizzle-orm';
import { dayKey, tr, levelFromXp } from '@polski-go/shared';
import { bindDb, db } from '../src/db';
import { friendships, notificationLog, playerProgress, quests, userQuests, userSettings, users } from '../src/db/schema';
import { setEnv } from '../src/env';
import { COMMANDS, COMMAND_IMAGES, COMMAND_LANDING } from '../src/bot/catalog';
import { COPY } from '../src/bot/copy';
import { getJourney } from '../src/services/journey';
import { disposeEnv, getEnv, login, request } from './helpers';
import { fakeTelegram, tgError, type TgCall } from './tg-fake';

const BASE = 'https://polski.example/app/?v=1';
const ORIGIN = 'https://polski.example';

beforeAll(async () => {
  const { env } = await getEnv();
  env.WEB_APP_URL = BASE;
  env.TELEGRAM_BOT_USERNAME = 'Polski_Go_Bot';
  env.TELEGRAM_APP_SHORT_NAME = 'app';
});
afterAll(disposeEnv);
afterEach(() => vi.unstubAllGlobals());

let upd = 1000;
type From = { id: number; first_name: string; language_code?: string };
const from = (id: number, language_code = 'uk', first_name = `User${id}`): From => ({ id, first_name, language_code });
const update = (f: From, text: string, chat: { id?: number; type?: string } = {}) => ({
  update_id: ++upd,
  message: { message_id: upd, chat: { id: chat.id ?? f.id, type: chat.type ?? 'private' }, from: f, text },
});
const hook = (body: unknown, secret = 'hook-secret') => request('POST', '/telegram/webhook', body, { 'x-telegram-bot-api-secret-token': secret });
/** Сообщение боту: возвращает ответ webhook и вызовы Bot API (без служебных). */
async function say(f: From, text: string, chat?: { id?: number; type?: string }, script?: Parameters<typeof fakeTelegram>[0]) {
  const calls = fakeTelegram(script);
  const res = await hook(update(f, text, chat));
  return { res, calls };
}
const buttons = (call: TgCall) => (call.params.reply_markup.inline_keyboard as { text: string; web_app?: { url: string }; url?: string }[][]).flat();
const urls = (call: TgCall) => buttons(call).map((b) => b.web_app?.url ?? b.url);
const screenUrl = (screen: string) => (screen === 'home' ? BASE : `${ORIGIN}/app/?v=1&bot_screen=${screen}`);

/** Зарегистрированный пользователь; onboarded — прошёл знакомство. */
async function registered(opts: { lang?: string; onboarded?: boolean } = {}) {
  const u = await login();
  if (opts.lang) await db.update(userSettings).set({ uiLanguage: opts.lang }).where(eq(userSettings.userId, u.user.id));
  if (opts.onboarded) await db.update(users).set({ onboardedAt: new Date() }).where(eq(users.id, u.user.id));
  return u;
}

describe('девять команд: фото, подпись и настоящие кнопки Mini App', () => {
  it.each(COMMANDS)('/%s — sendPhoto с нужной картинкой, подписью ≤ 1024 и кнопками с bot_screen', async (command) => {
    const u = await registered({ lang: 'ru', onboarded: true });
    const { res, calls } = await say(from(u.telegramId, 'ru'), `/${command}`);
    expect(res.status).toBe(200);
    // После карточки /start и /help ставится панель быстрых кнопок (отдельное сообщение).
    expect(calls.map((c) => c.method)).toEqual(command === 'start' || command === 'help' ? ['sendPhoto', 'sendMessage'] : ['sendPhoto']);
    const call = calls[0];
    expect(call.method).toBe('sendPhoto');
    expect(call.params.photo).toBe(`${ORIGIN}/bot/commands/${COMMAND_IMAGES[command]}`);
    expect(call.params.parse_mode).toBe('HTML');
    expect(call.params.caption.length).toBeLessThanOrEqual(1024);
    expect(call.params.chat_id).toBe(u.telegramId);
    // Первая кнопка ведёт на главный экран команды; все кнопки — web_app с HTTPS и сохранённым путём/параметрами базового адреса.
    for (const b of buttons(call)) expect(b.web_app?.url).toMatch(/^https:\/\/polski\.example\/app\/\?v=1/);
    expect(urls(call)[0]).toBe(screenUrl(COMMAND_LANDING[command] === 'home' && command === 'start' ? 'learn' : COMMAND_LANDING[command]));
    for (const url of urls(call)) {
      const screen = new URL(url!).searchParams.get('bot_screen');
      expect(screen === null || ['learn', 'map', 'dictionary', 'slang', 'quests', 'profile', 'achievements', 'settings', 'grammar'].includes(screen)).toBe(true);
    }
  });

  it('тексты из ТЗ: /start новичку — приветствие с именем, три кнопки', async () => {
    const f = from(8_100_001, 'ru', 'Оля');
    const { calls } = await say(f, '/start');
    expect(calls.map((c) => c.method)).toEqual(['sendPhoto', 'sendMessage']);
    expect(calls[0].params.caption).toMatch(/^🇵🇱 Cześć, Оля! 👋\n\nЯ Бобек! 🦫 Твой друг и проводник по Польше\./);
    expect(calls[0].params.caption).toContain('Gotowy? No to jedziemy! 🚀');
    expect(buttons(calls[0]).map((b) => b.text)).toEqual(['🚀 Начать путешествие', '📚 Мои уроки', '🗺 Карта Польши']);
    expect(urls(calls[0])).toEqual([BASE, screenUrl('learn'), screenUrl('map')]);
    // Новичок без записи в базе: бот ничего не создаёт.
    expect(await db.query.users.findFirst({ where: eq(users.telegramId, f.id) })).toBeUndefined();
  });

  it.each([
    ['/map', ['🗺 Открыть карту', '📚 Мои уроки'], ['map', 'learn']],
    ['/words', ['📖 Открыть словарь', '😎 Польский сленг', '🧩 Грамматика'], ['dictionary', 'slang', 'grammar']],
    ['/quests', ['🎯 Мои задания', '🏆 Достижения', '📚 Пойти на урок'], ['quests', 'achievements', 'learn']],
    ['/settings', ['⚙️ Открыть настройки', '📚 Вернуться к урокам'], ['settings', 'learn']],
    ['/help', ['🚀 Открыть POLSKI GO', '📚 Начать урок', '⚙️ Настройки'], ['home', 'learn', 'settings']],
    ['/stop', ['⚙️ Настроить напоминания', '📚 Продолжить обучение'], ['settings', 'learn']],
  ])('%s — подписи и переходы кнопок как в ТЗ', async (command, labels, screens) => {
    const { calls } = await say(from(8_100_002, 'ru'), command);
    expect(buttons(calls[0]).map((b) => b.text)).toEqual(labels);
    expect(urls(calls[0])).toEqual((screens as string[]).map(screenUrl));
  });

  it('/help перечисляет восемь команд', async () => {
    const { calls } = await say(from(8_100_003, 'ru'), '/help');
    for (const c of ['/start', '/lesson', '/map', '/words', '/quests', '/profile', '/settings', '/stop']) expect(calls[0].params.caption).toContain(c);
  });
});

describe('язык ответа', () => {
  it('настройка пользователя важнее языка Telegram, затем язык Telegram, затем украинский', async () => {
    const ru = await registered({ lang: 'ru' });
    expect((await say(from(ru.telegramId, 'pl'), '/start')).calls[0].params.caption).toContain('Я Бобек!');
    expect((await say(from(8_100_010, 'pl'), '/start')).calls[0].params.caption).toContain('Jestem Bobek!');
    expect((await say(from(8_100_011, 'en-GB'), '/start')).calls[0].params.caption).toContain('I’m Bobek!');
    expect((await say(from(8_100_012, 'de'), '/start')).calls[0].params.caption).toContain('Твій друг і провідник Польщею');
    expect((await say(from(8_100_013, 'uk'), '/map')).calls[0].params.caption).toContain('Сьогодні Бобек кличе');
  });
});

describe('первый и повторный /start, реферальные ссылки', () => {
  it('после знакомства — возвращение с реальным следующим уроком; прогресс не сбрасывается', async () => {
    const u = await registered({ lang: 'ru', onboarded: true });
    const before = await db.select().from(playerProgress).where(eq(playerProgress.userId, u.user.id));
    const { calls } = await say(from(u.telegramId, 'ru'), '/start');
    expect(calls[0].params.caption).toMatch(/^🇵🇱 Witaj z powrotem, User\d+! 🦫/);
    expect(calls[0].params.caption).toContain('Продолжим там, где остановились?');
    expect(buttons(calls[0])[0].text).toBe('▶️ Продолжить обучение');
    expect(urls(calls[0])[0]).toBe(screenUrl('learn'));
    const journey = await getJourney(u.user.id);
    expect(calls[0].params.caption).toContain(`«${tr(journey.nextLesson!.title as never, 'ru')}»`);
    expect(await db.select().from(playerProgress).where(eq(playerProgress.userId, u.user.id))).toEqual(before);
  });

  it('/start ref_КОД: реферера записывает сервер по подписанному webhook, startapp в кнопке сохраняется', async () => {
    const inviter = await registered();
    const code = inviter.user.referralCode;
    const f = from(8_100_100, 'uk');
    const { calls } = await say(f, `/start ref_${code}`);
    const created = await db.query.users.findFirst({ where: eq(users.telegramId, f.id) });
    expect(created?.referredById).toBe(inviter.user.id);
    expect(await db.query.friendships.findFirst({ where: and(eq(friendships.requesterId, inviter.user.id), eq(friendships.addresseeId, created!.id)) })).toMatchObject({ status: 'ACCEPTED' });
    // Главная кнопка несёт параметр startapp (как раньше), экранный параметр её не заменяет.
    expect(urls(calls[0])[0]).toBe(`${BASE}&startapp=ref_${code}`);
    expect(urls(calls[0])[1]).toBe(screenUrl('learn'));
    expect(urls(calls[0])[1]).not.toContain('startapp');
    // Новичок: знакомство ещё не пройдено, поэтому приветствие, а не возвращение.
    expect(calls[0].params.caption).toContain('Я Бобек!');

    // Повторные ссылки реферера не меняют; вход в приложение даёт того же пользователя.
    await say(f, `/start ref_${inviter.user.referralCode}`);
    const other = await registered();
    await say(f, `/start ref_${other.user.referralCode}`);
    expect((await db.query.users.findFirst({ where: eq(users.telegramId, f.id) }))?.referredById).toBe(inviter.user.id);
  });

  it('несуществующий код и чужой мусор в параметре: пользователь без реферера, параметр не попадает в адрес', async () => {
    const f = from(8_100_101, 'uk');
    await say(f, '/start ref_ZZZZZZZZ');
    expect((await db.query.users.findFirst({ where: eq(users.telegramId, f.id) }))?.referredById).toBeNull();
    const { calls } = await say(from(8_100_102), '/start <script>alert(1)</script>');
    expect(urls(calls[0])[0]).toBe(BASE);
    const ok = await say(from(8_100_103), '/start promo-2026_A');
    expect(urls(ok.calls[0])[0]).toBe(`${BASE}&startapp=promo-2026_A`);
  });

  it('/start ref_… в группе ничего не регистрирует', async () => {
    const inviter = await registered();
    const f = from(8_100_104);
    await say(f, `/start@Polski_Go_Bot ref_${inviter.user.referralCode}`, { id: -500, type: 'supergroup' });
    expect(await db.query.users.findFirst({ where: eq(users.telegramId, f.id) })).toBeUndefined();
  });
});

describe('/lesson, /quests, /profile — только реальные данные', () => {
  it('/lesson называет реальный следующий урок и город; без пользователя — универсальный текст', async () => {
    const u = await registered({ lang: 'uk', onboarded: true });
    const { calls } = await say(from(u.telegramId, 'uk'), '/lesson');
    const journey = await getJourney(u.user.id);
    const city = journey.cities.find((c) => c.id === journey.currentCityId)!;
    expect(calls[0].params.caption).toContain(`📍 Наступний урок: «${tr(journey.nextLesson!.title as never, 'uk')}» — ${tr(city.name as never, 'uk')}`);
    const none = await say(from(8_100_200, 'uk'), '/lesson');
    expect(none.calls[0].params.caption).not.toContain('📍');
    expect(none.calls[0].params.caption).toContain('Czas na polski');
  });

  it('/quests показывает только назначенные на сегодня активные задания с их наградой', async () => {
    const u = await registered({ lang: 'uk', onboarded: true });
    const empty = await say(from(u.telegramId, 'uk'), '/quests');
    expect(empty.calls[0].params.caption).not.toMatch(/XP|•/);
    const quest = (await db.select().from(quests).where(eq(quests.kind, 'DAILY')).limit(1))[0];
    await db.insert(userQuests).values({ userId: u.user.id, questId: quest.id, periodKey: dayKey(new Date(), 'Europe/Warsaw'), progress: 1, status: 'ACTIVE' });
    const { calls } = await say(from(u.telegramId, 'uk'), '/quests');
    expect(calls[0].params.caption).toContain(`• ${tr(quest.title, 'uk')} — 1/${quest.target}${quest.xpReward ? ` · +${quest.xpReward} XP` : ''}`);
    // Выполненное и забранное в список активных не попадает.
    await db.update(userQuests).set({ status: 'CLAIMED' }).where(eq(userQuests.userId, u.user.id));
    expect((await say(from(u.telegramId, 'uk'), '/quests')).calls[0].params.caption).not.toContain('•');
  });

  it('/profile: настоящие уровень, XP, серия, уроки; без прогресса — приглашение, а не нули', async () => {
    const u = await registered({ lang: 'ru', onboarded: true });
    const fresh = await say(from(u.telegramId, 'ru'), '/profile');
    expect(fresh.calls[0].params.caption).toContain('Твои достижения появятся после первых уроков');
    expect(fresh.calls[0].params.caption).not.toMatch(/XP|⭐|🔥/);
    expect(buttons(fresh.calls[0]).map((b) => b.text)).toEqual(['👤 Мой профиль', '🏆 Достижения', '📚 Начать первый урок']);

    const today = dayKey(new Date(), 'Europe/Warsaw');
    await db.update(playerProgress).set({ xpTotal: 250, lessonsCompleted: 4, streakCurrent: 3, lastActiveDay: today }).where(eq(playerProgress.userId, u.user.id));
    const { calls } = await say(from(u.telegramId, 'ru'), '/profile');
    const caption: string = calls[0].params.caption;
    expect(caption).toContain(`⭐ Уровень игрока: ${levelFromXp(250).level}`);
    expect(caption).toContain('⚡ Всего XP: 250');
    expect(caption).toContain('🔥 Серия дней: 3');
    expect(caption).toContain('📚 Пройдено уроков: 4');
    expect(buttons(calls[0]).map((b) => b.text)).toEqual(['👤 Мой профиль', '🏆 Достижения', '📚 Продолжить обучение']);

    const unknown = await say(from(8_100_300, 'ru'), '/profile');
    expect(unknown.calls[0].params.caption).toContain('Твои достижения появятся после первых уроков');
  });
});

describe('неизвестные команды, группы, блокировка', () => {
  it('неизвестная команда и обычный текст в личном чате — справка', async () => {
    for (const text of ['/nope', '/start2', 'привет, бот']) {
      const { calls } = await say(from(8_100_400, 'ru'), text);
      expect(calls).toHaveLength(1);
      expect(calls[0].params.photo).toBe(`${ORIGIN}/bot/commands/help.jpg`);
      expect(calls[0].params.caption).toContain('Jak grać?');
    }
  });

  it('в группе: ссылка на Mini App вместо web_app, чужие команды и обычный текст игнорируются', async () => {
    const group = { id: -1001, type: 'supergroup' };
    const { calls } = await say(from(8_100_410, 'ru'), '/lesson@polski_go_bot', group);
    expect(calls).toHaveLength(1);
    expect(calls[0].params.chat_id).toBe(-1001);
    expect(buttons(calls[0]).every((b) => !b.web_app)).toBe(true);
    expect(urls(calls[0])).toEqual(['https://t.me/Polski_Go_Bot/app?startapp=screen_learn', 'https://t.me/Polski_Go_Bot/app?startapp=screen_map', 'https://t.me/Polski_Go_Bot/app?startapp=screen_dictionary']);
    expect((await say(from(8_100_410), '/lesson@another_bot', group)).calls).toHaveLength(0);
    expect((await say(from(8_100_410), 'просто текст', group)).calls).toHaveLength(0);
    expect((await say(from(8_100_410, 'ru'), '/help', group)).calls[0].params.reply_markup.inline_keyboard[0][0].url).toBe('https://t.me/Polski_Go_Bot/app');
  });

  it('забаненному пользователю бот не отвечает', async () => {
    const u = await registered();
    await db.update(users).set({ isBanned: true }).where(eq(users.id, u.user.id));
    expect((await say(from(u.telegramId), '/start')).calls).toHaveLength(0);
  });

  it('неверный секрет webhook — 401, ничего не отправляется', async () => {
    const calls = fakeTelegram();
    expect((await hook(update(from(8_100_420), '/start'), 'wrong')).status).toBe(401);
    expect(calls).toHaveLength(0);
  });
});

describe('доставка: фото, запасной текст, повторные обновления', () => {
  it('фото недоступно (400) — тот же текст и те же кнопки обычным сообщением', async () => {
    const { res, calls } = await say(from(8_100_500, 'ru'), '/map', undefined, (c) => (c.method === 'sendPhoto' ? tgError(400, 'Bad Request: failed to get HTTP URL content') : undefined));
    expect(res.status).toBe(200);
    expect(calls.map((c) => c.method)).toEqual(['sendPhoto', 'sendMessage']);
    expect(calls[1].params.text).toBe(calls[0].params.caption);
    expect(calls[1].params.reply_markup).toEqual(calls[0].params.reply_markup);
    expect(calls[1].params.parse_mode).toBe('HTML');
  });

  it('бот заблокирован (403): запасного сообщения нет, webhook отвечает 200 без повторов', async () => {
    const { res, calls } = await say(from(8_100_501), '/map', undefined, () => tgError(403, 'Forbidden: bot was blocked by the user'));
    expect(res.status).toBe(200);
    expect(calls).toHaveLength(1);
  });

  it('оба запроса отклонены (400): без бесконечных повторов, 200', async () => {
    const { res, calls } = await say(from(8_100_502), '/map', undefined, () => tgError(400, 'Bad Request: can\'t parse entities'));
    expect(res.status).toBe(200);
    expect(calls.map((c) => c.method)).toEqual(['sendPhoto', 'sendMessage']);
  });

  it('тот же update_id второй раз не отвечает вдруге', async () => {
    const body = update(from(8_100_510, 'ru'), '/help');
    const first = fakeTelegram();
    expect((await hook(body)).status).toBe(200);
    expect(first.map((c) => c.method)).toEqual(['sendPhoto', 'sendMessage']);
    const second = fakeTelegram();
    const again = await hook(body);
    expect(again.status).toBe(200);
    expect(again.body).toMatchObject({ duplicate: true });
    expect(second).toHaveLength(0);
  });

  it('временный сбой Telegram (502 / 429 / обрыв сети): 503, метка снимается, повтор того же update_id отвечает', async () => {
    for (const fail of [tgError(502, 'Bad Gateway'), tgError(429, 'Too Many Requests: retry after 3', 3), new Error('network lost')]) {
      const body = update(from(8_100_520, 'ru'), '/help');
      const failing = fakeTelegram(() => fail);
      expect((await hook(body)).status).toBe(503);
      expect(failing.length).toBeGreaterThanOrEqual(1);
      const retry = fakeTelegram();
      expect((await hook(body)).status).toBe(200);
      expect(retry.map((c) => c.method)).toEqual(['sendPhoto', 'sendMessage']);
    }
  });

  it('длинный текст: короткая подпись к фото и отдельное сообщение с кнопками', async () => {
    const { sendCard } = await import('../src/bot/send');
    const calls = fakeTelegram();
    const text = `Заголовок 🦫\n\n${'длинная строка. '.repeat(120)}`;
    await sendCard({ chatId: 1 }, { text, buttons: [{ label: 'ОК', screen: 'map' }] }, 'map.jpg');
    expect(calls.map((c) => c.method)).toEqual(['sendPhoto', 'sendMessage']);
    expect(calls[0].params.caption).toBe('Заголовок 🦫');
    expect(calls[0].params.reply_markup).toBeUndefined();
    expect(calls[1].params.reply_markup.inline_keyboard[0][0].web_app.url).toBe(screenUrl('map'));
  });
});

describe('согласие на уведомления и /stop', () => {
  it('/stop выключает только напоминания: прогресс, язык, час и журнал не тронуты', async () => {
    const u = await registered({ lang: 'ru', onboarded: true });
    await db.update(userSettings).set({ notificationsEnabled: true, reminderHour: 19 }).where(eq(userSettings.userId, u.user.id));
    await db.insert(notificationLog).values({ userId: u.user.id, kind: 'daily_reminder', day: '2026-10-01', status: 'SENT' });
    const progress = await db.select().from(playerProgress).where(eq(playerProgress.userId, u.user.id));
    const { calls } = await say(from(u.telegramId, 'ru'), '/stop');
    expect(calls[0].method).toBe('sendPhoto');
    expect(calls[0].params.photo).toBe(`${ORIGIN}/bot/commands/stop.jpg`);
    expect(calls[0].params.caption).toContain('🔕 Напоминания отключены.');
    const settings = (await db.select().from(userSettings).where(eq(userSettings.userId, u.user.id)))[0];
    expect(settings).toMatchObject({ notificationsEnabled: false, reminderHour: 19, uiLanguage: 'ru' });
    expect(await db.select().from(playerProgress).where(eq(playerProgress.userId, u.user.id))).toEqual(progress);
    expect(await db.select().from(notificationLog).where(eq(notificationLog.userId, u.user.id))).toHaveLength(1);
    // Кнопка «Настроить напоминания» только открывает настройки приложения и ничего не включает.
    expect(urls(calls[0])[0]).toBe(screenUrl('settings'));
    expect((await db.select().from(userSettings).where(eq(userSettings.userId, u.user.id)))[0].notificationsEnabled).toBe(false);
  });

  it('/stop у незнакомого пользователя отвечает и ничего не создаёт', async () => {
    const f = from(8_100_600, 'ru');
    const { calls } = await say(f, '/stop');
    expect(calls[0].params.caption).toContain('Напоминания отключены');
    expect(await db.query.users.findFirst({ where: eq(users.telegramId, f.id) })).toBeUndefined();
  });
});

describe('сбой базы данных', () => {
  async function withBrokenDb<T>(run: () => Promise<T>): Promise<T> {
    const { env } = await getEnv();
    const broken = new Proxy({}, { get: () => () => { throw new Error('D1 is down'); } }) as unknown as D1Database;
    const real = env.DB;
    env.DB = broken;
    try {
      return await run();
    } finally {
      env.DB = real;
      setEnv(env);
      bindDb(real);
    }
  }
  const post = (f: From, text: string) => {
    const calls = fakeTelegram();
    return { calls, done: withBrokenDb(() => hook(update(f, text))) };
  };

  it('/help и /start отвечают без персональных данных', async () => {
    const help = post(from(8_100_700, 'ru'), '/help');
    expect((await help.done).status).toBe(200);
    expect(help.calls.map((c) => c.method)).toEqual(['sendPhoto', 'sendMessage']);
    const start = post(from(8_100_701, 'ru', 'Оля'), '/start');
    await start.done;
    expect(start.calls[0].params.caption).toContain('Cześć, Оля!');
  });

  it('/stop честно сообщает о неудаче и не обещает отключение', async () => {
    const stop = post(from(8_100_702, 'ru'), '/stop');
    expect((await stop.done).status).toBe(200);
    expect(stop.calls).toHaveLength(1);
    expect(stop.calls[0].method).toBe('sendMessage');
    expect(stop.calls[0].params.text).toBe(COPY.ru.stopFailed);
    expect(stop.calls[0].params.text).not.toContain('отключены.');
  });

  it('/profile не выдаёт сбой за «ещё нет прогресса»', async () => {
    const p = post(from(8_100_703, 'ru'), '/profile');
    await p.done;
    expect(p.calls[0].params.caption).toContain('Не удалось загрузить прогресс');
    expect(p.calls[0].params.caption).not.toContain('появятся после первых уроков');
  });
});

describe('WEB_APP_URL, заданный не по форме: бот не молчит', () => {
  const restore = async () => {
    const { env } = await getEnv();
    env.WEB_APP_URL = BASE;
  };
  afterEach(restore);

  it.each([
    ['без схемы', 'polski.example/app', 'https://polski.example/app'],
    ['с http на боевом адресе', 'http://polski.example/app', 'https://polski.example/app'],
    ['с пробелами и переводом строки', '  https://polski.example/app \n', 'https://polski.example/app'],
    ['с протокол-относительным адресом', '//polski.example/app', 'https://polski.example/app'],
  ])('адрес %s: фото уходит с https-адреса, кнопки ведут на https', async (_name, raw, expectedBase) => {
    const { env } = await getEnv();
    env.WEB_APP_URL = raw;
    const { res, calls } = await say(from(8_200_001, 'ru'), '/lesson');
    expect(res.status).toBe(200);
    expect(calls).toHaveLength(1);
    expect(calls[0].method).toBe('sendPhoto');
    expect(calls[0].params.photo).toBe('https://polski.example/bot/commands/lesson.jpg');
    expect(urls(calls[0])).toContain(`${expectedBase}?bot_screen=learn`);
  });

  it('локальный адрес без схемы остаётся http, фото не отправляется', async () => {
    const { env } = await getEnv();
    env.WEB_APP_URL = 'localhost:5173';
    const { calls } = await say(from(8_200_002, 'ru'), '/help');
    expect(calls[0].method).toBe('sendMessage');
    expect(urls(calls[0])).toContain('http://localhost:5173/?bot_screen=settings');
  });
});


describe('постоянная панель быстрых кнопок', () => {
  // Один вход на все проверки: вход ограничен по частоте, а панели нужен только существующий пользователь.
  let shared: Awaited<ReturnType<typeof registered>>;
  beforeAll(async () => {
    shared = await registered({ lang: 'ru', onboarded: true });
  });
  const panelOf = (calls: TgCall[]) => calls.find((c) => c.method === 'sendMessage' && c.params.reply_markup?.keyboard)!;
  const labels = (call: TgCall) => (call.params.reply_markup.keyboard as { text: string }[][]).map((row) => row.map((b) => b.text));

  it.each([
    ['ru', ['📚 Урок', '🗺 Карта', '📖 Слова'], ['🎯 Задания', '🏆 Профиль', '⚙️ Настройки']],
    ['uk', ['📚 Урок', '🗺 Карта', '📖 Слова'], ['🎯 Завдання', '🏆 Профіль', '⚙️ Налаштування']],
    ['pl', ['📚 Lekcja', '🗺 Mapa', '📖 Słowa'], ['🎯 Zadania', '🏆 Profil', '⚙️ Ustawienia']],
    ['en', ['📚 Lesson', '🗺 Map', '📖 Words'], ['🎯 Tasks', '🏆 Profile', '⚙️ Settings']],
  ])('/start на %s: после карточки приходит панель из двух рядов по три кнопки, закреплённая', async (lang, row1, row2) => {
    const { calls } = await say(from(8_300_000 + row1.length + lang.length, lang), '/start');
    expect(calls.map((c) => c.method)).toEqual(['sendPhoto', 'sendMessage']);
    const panel = panelOf(calls);
    expect(labels(panel)).toEqual([row1, row2]);
    expect(panel.params.reply_markup).toMatchObject({ resize_keyboard: true, is_persistent: true });
    expect(panel.params.text).toContain('👇');
  });

  it('/help тоже ставит панель; остальные команды и обычный текст — нет', async () => {
    const u = shared;
    expect((await say(from(u.telegramId, 'ru'), '/help')).calls.some((c) => c.params.reply_markup?.keyboard)).toBe(true);
    for (const text of ['/lesson', '/map', '/words', '/quests', '/profile', '/settings', '/stop', '/nonsense', 'просто текст']) {
      const { calls } = await say(from(u.telegramId, 'ru'), text);
      expect(calls.some((c) => c.params.reply_markup?.keyboard), text).toBe(false);
    }
  });

  it('в группе панель не ставится', async () => {
    const { calls } = await say(from(8_300_100, 'ru'), '/start', { id: -100123, type: 'supergroup' });
    expect(calls.some((c) => c.params.reply_markup?.keyboard)).toBe(false);
  });

  it.each([
    ['📚 Урок', 'lesson'],
    ['🗺 Карта', 'map'],
    ['📖 Слова', 'words'],
    ['🎯 Задания', 'quests'],
    ['🏆 Профиль', 'profile'],
    ['⚙️ Настройки', 'settings'],
    ['🗺 Mapa', 'map'],
    ['🎯 Tasks', 'quests'],
    ['🏆 Профіль', 'profile'],
  ])('нажатие «%s» отвечает карточкой /%s с картинкой и кнопками Mini App', async (label, command) => {
    const u = shared;
    const { res, calls } = await say(from(u.telegramId, 'ru'), label);
    expect(res.status).toBe(200);
    expect(calls).toHaveLength(1);
    expect(calls[0].method).toBe('sendPhoto');
    expect(calls[0].params.photo).toBe(`${ORIGIN}/bot/commands/${COMMAND_IMAGES[command as keyof typeof COMMAND_IMAGES]}`);
    expect(urls(calls[0]).length).toBeGreaterThan(0);
  });

  it('подпись панели в группе не считается командой, текст рядом с подписью — тоже', async () => {
    const group = await say(from(8_300_200, 'ru'), '🗺 Карта', { id: -100321, type: 'group' });
    expect(group.calls).toHaveLength(0);
    const u = shared;
    const extra = await say(from(u.telegramId, 'ru'), '🗺 Карта пожалуйста');
    expect(extra.calls[0].params.photo).toBe(`${ORIGIN}/bot/commands/help.jpg`);
  });

  it('сбой отправки панели не ломает ответ и не повторяет карточку', async () => {
    const calls = fakeTelegram((call) => (call.method === 'sendMessage' ? tgError(502, 'Bad Gateway') : undefined));
    const res = await hook(update(from(8_300_300, 'ru'), '/start'));
    expect(res.status).toBe(200);
    expect(calls.map((c) => c.method)).toEqual(['sendPhoto', 'sendMessage']);
  });

  it('заблокированный пользователь не получает панель', async () => {
    const u = await registered({ lang: 'ru', onboarded: true });
    await db.update(users).set({ isBanned: true }).where(eq(users.id, u.user.id));
    const { calls } = await say(from(u.telegramId, 'ru'), '/start');
    expect(calls).toHaveLength(0);
  });
});
