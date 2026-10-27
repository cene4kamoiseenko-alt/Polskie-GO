/**
 * Staging не может задеть production: отдельный конфиг (Worker, база D1, без cron), сторож конфигурации ловит каждое нарушение,
 * а код staging игнорирует токен бота, которого нет в STAGING_BOT_ID — ни Bot API, ни webhook, ни рассылок, ни входа боевого бота.
 * Это проверка кода и конфигурации. Деплой на Cloudflare из этой среды не выполнялся; шаги для владельца — docs/STAGING.md.
 */
import { readFileSync } from 'node:fs';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../src/app';
import { botIdOfToken, config, getBindings, setEnv, type Bindings } from '../src/env';
import { botApi } from '../src/lib/telegram';
import { runScheduled } from '../src/jobs';
import { checkRepo, checkStagingConfig, checkStagingScripts, parseJsonc, STAGING_DB } from '../../../scripts/staging-guard.mjs';
import { disposeEnv, getEnv } from './helpers';
import { fakeTelegram } from './tg-fake';

const root = new URL('../../../', import.meta.url).pathname.replace(/\/$/, '');
const prodText = readFileSync(`${root}/wrangler.jsonc`, 'utf8');
const stgText = readFileSync(`${root}/wrangler.staging.jsonc`, 'utf8');
const pkg = JSON.parse(readFileSync(`${root}/package.json`, 'utf8'));
/** Конфиг staging с правкой: текст → объект → правка → JSON (комментарии не нужны). */
const mutated = (fn: (c: any) => void) => {
  const c = parseJsonc(stgText);
  fn(c);
  return JSON.stringify(c);
};

let base: Bindings;
beforeAll(async () => {
  base = (await getEnv()).env;
});
afterAll(disposeEnv);
afterEach(() => {
  vi.unstubAllGlobals();
  setEnv(base);
});

const stagingEnv = (extra: Partial<Bindings> = {}) => setEnv({ ...base, ENVIRONMENT: 'staging', ...extra });

describe('конфигурация staging', () => {
  it('файлы репозитория проходят сторож: свой Worker, своя база, без cron, без боевых секретов', () => {
    expect(checkRepo(root)).toEqual([]);
    const stg = parseJsonc(stgText);
    const prod = parseJsonc(prodText);
    expect(stg.name).toBe('polskie-go-staging');
    expect(stg.name).not.toBe(prod.name);
    expect(stg.d1_databases).toEqual([{ binding: 'DB', database_name: STAGING_DB, migrations_dir: 'apps/server/migrations' }]);
    expect(prod.d1_databases[0].database_name).toBe('polski-go');
    expect(stg.triggers).toEqual({ crons: [] });
    expect(prod.triggers.crons.length).toBeGreaterThan(0);
    expect(stg.vars.ENVIRONMENT).toBe('staging');
    expect(prod.vars.ENVIRONMENT).toBe('production');
    // Боевой конфиг не изменён: никакого блока env, который меняет поведение production-деплоя.
    expect(prod.env).toBeUndefined();
  });

  it.each([
    ['тот же Worker', (c: any) => (c.name = 'polskie-go'), 'совпадает с production'],
    ['имя без staging', (c: any) => (c.name = 'polskie-go-test'), 'не содержит «staging»'],
    ['база production', (c: any) => (c.d1_databases[0].database_name = 'polski-go'), 'совпадает с базой production'],
    ['чужая база', (c: any) => (c.d1_databases[0].database_name = 'polski-go-other'), 'ожидается'],
    ['cron унаследован (не задан)', (c: any) => delete c.triggers, 'cron staging'],
    ['cron включён', (c: any) => (c.triggers.crons = ['*/15 * * * *']), 'cron staging'],
    ['ENVIRONMENT=production', (c: any) => (c.vars.ENVIRONMENT = 'production'), 'ENVIRONMENT'],
    ['токен бота в vars', (c: any) => (c.vars.TELEGRAM_BOT_TOKEN = '123:abc'), 'секретоподобный'],
    ['платная озвучка', (c: any) => (c.vars.TTS_PROVIDER = 'google'), 'TTS_PROVIDER'],
    ['маршрут на боевой домен', (c: any) => (c.routes = [{ pattern: 'polski.example/*', zone_id: 'x' }]), 'routes'],
    ['чужая привязка KV', (c: any) => (c.kv_namespaces = [{ binding: 'KV', id: 'prod' }]), 'kv_namespaces'],
    ['другой main', (c: any) => (c.main = 'apps/server/src/other.ts'), 'main staging'],
    ['другие assets', (c: any) => (c.assets.directory = 'other'), 'assets staging'],
  ])('сторож ловит: %s', (_name, change, expected) => {
    const problems = checkStagingConfig(mutated(change), prodText);
    expect(problems.join('\n')).toContain(expected);
  });

  it('одинаковый database_id у staging и production — отказ', () => {
    const prod = JSON.stringify({ ...parseJsonc(prodText), d1_databases: [{ binding: 'DB', database_name: 'polski-go', database_id: 'same-id' }] });
    const problems = checkStagingConfig(mutated((c) => (c.d1_databases[0].database_id = 'same-id')), prod);
    expect(problems.join('\n')).toContain('database_id staging совпадает');
  });

  it('npm-команды: каждый wrangler с -c wrangler.staging.jsonc и базой staging, сторож первым; production-команда не тронута', () => {
    expect(checkStagingScripts(pkg)).toEqual([]);
    expect(pkg.scripts['deploy:cf']).toBe('(wrangler d1 time-travel info polski-go --json || true) && wrangler d1 migrations apply polski-go --remote && wrangler deploy && wrangler d1 execute polski-go --remote --file apps/server/seed.sql --yes');
    const broken = (patch: Record<string, string>) => checkStagingScripts({ scripts: { ...pkg.scripts, ...patch } }).join('\n');
    expect(broken({ 'deploy:staging': 'node scripts/staging-guard.mjs && wrangler deploy' })).toContain('без -c wrangler.staging.jsonc');
    expect(broken({ 'deploy:staging': 'node scripts/staging-guard.mjs && wrangler d1 migrations apply polski-go --remote -c wrangler.staging.jsonc' })).toContain('не называет базу');
    expect(broken({ 'deploy:staging': 'wrangler deploy -c wrangler.staging.jsonc' })).toContain('не начинается со сторожа');
    expect(broken({ 'deploy:staging': 'wrangler deploy -c wrangler.staging.jsonc && node scripts/staging-guard.mjs' })).toContain('после wrangler');
    expect(broken({ 'deploy:cf': 'wrangler deploy --env staging' })).toContain('production');
  });
});

describe('код staging: боевой бот недоступен', () => {
  const PROD_TOKEN = '555555:PRODUCTION_TOKEN';

  it('id бота — часть токена до двоеточия', () => {
    expect(botIdOfToken(PROD_TOKEN)).toBe('555555');
    expect(botIdOfToken('')).toBe('');
  });

  it('staging без STAGING_BOT_ID и с чужим id: токена «нет», в production он действует как раньше', () => {
    stagingEnv({ TELEGRAM_BOT_TOKEN: PROD_TOKEN });
    expect(config.isStaging).toBe(true);
    expect(config.botToken).toBe('');
    expect(config.botBlockedInStaging).toBe(true);
    stagingEnv({ TELEGRAM_BOT_TOKEN: PROD_TOKEN, STAGING_BOT_ID: '999999' });
    expect(config.botToken).toBe('');
    stagingEnv({ TELEGRAM_BOT_TOKEN: PROD_TOKEN, STAGING_BOT_ID: '555555' });
    expect(config.botToken).toBe(PROD_TOKEN);
    expect(config.botBlockedInStaging).toBe(false);
    // Production и test STAGING_BOT_ID не смотрят.
    setEnv({ ...base, ENVIRONMENT: 'production', TELEGRAM_BOT_TOKEN: PROD_TOKEN, STAGING_BOT_ID: '1' });
    expect(config.botToken).toBe(PROD_TOKEN);
    expect(config.botBlockedInStaging).toBe(false);
  });

  it('botApi в staging не доходит до сети: ни webhook, ни сообщения, ни платежи', async () => {
    stagingEnv({ TELEGRAM_BOT_TOKEN: PROD_TOKEN });
    const calls = fakeTelegram();
    for (const method of ['setWebhook', 'deleteWebhook', 'sendMessage', 'sendPhoto', 'createInvoiceLink', 'setMyCommands']) {
      await expect(botApi(method, {}), method).rejects.toThrow(/ignored in staging/);
    }
    expect(calls).toHaveLength(0);
  });

  it('отдельный тестовый бот (id совпал) работает: запрос уходит', async () => {
    stagingEnv({ TELEGRAM_BOT_TOKEN: '777777:STAGING_BOT', STAGING_BOT_ID: '777777' });
    const calls = fakeTelegram();
    await botApi('getMe', {});
    expect(calls.map((c) => c.method)).toEqual(['getMe']);
  });

  it('cron-задача в staging с чужим токеном ничего не отправляет', async () => {
    stagingEnv({ TELEGRAM_BOT_TOKEN: PROD_TOKEN });
    const calls = fakeTelegram();
    await runScheduled(new Date('2026-11-03T08:05:00Z'));
    expect(calls).toHaveLength(0);
  });

  it('staging требует SESSION_SECRET от 32 знаков (как production), вход без Telegram — только по явному DEV_AUTH', () => {
    stagingEnv({ SESSION_SECRET: 'short' });
    expect(() => config.sessionSecret).toThrow(/SESSION_SECRET/);
    stagingEnv({ SESSION_SECRET: 'x'.repeat(32) });
    expect(config.sessionSecret).toHaveLength(32);
    stagingEnv({ DEV_AUTH: undefined });
    expect(config.devAuth).toBe(false);
    stagingEnv({ DEV_AUTH: 'true' });
    expect(config.devAuth).toBe(true);
    setEnv({ ...base, ENVIRONMENT: 'production', DEV_AUTH: 'true' });
    expect(config.devAuth, 'в production вход без Telegram по-прежнему выключен').toBe(false);
  });

  it('CORS в staging строгий (только CORS_ORIGINS), /api/health называет окружение', async () => {
    const app = buildApp();
    const env = { ...base, ENVIRONMENT: 'staging', CORS_ORIGINS: 'https://stg.example' } as Bindings;
    const foreign = await app.request('/api/health', { headers: { origin: 'https://evil.example' } }, env);
    expect(foreign.headers.get('access-control-allow-origin')).toBeNull();
    const own = await app.request('/api/health', { headers: { origin: 'https://stg.example' } }, env);
    expect(own.headers.get('access-control-allow-origin')).toBe('https://stg.example');
    expect(((await own.json()) as { environment: string }).environment).toBe('staging');
    setEnv(getBindings() as Bindings);
  });
});
