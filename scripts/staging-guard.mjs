// Сторож staging: падает, если wrangler.staging.jsonc может задеть production — общая база D1, общий Worker, cron, боевые секреты в vars,
// маршруты на боевом домене, чужие привязки (KV, R2, очереди…) или если npm-команды staging зовут wrangler без -c wrangler.staging.jsonc.
//   node scripts/staging-guard.mjs        проверка файлов репозитория (код 1 при проблемах); её первой запускает `npm run deploy:staging`
// Логика вынесена в функции: apps/server/test/staging.test.ts проверяет и сами файлы, и то, что сторож ловит каждое нарушение.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const STAGING_CONFIG = 'wrangler.staging.jsonc';
export const STAGING_DB = 'polski-go-staging';

/** JSONC → объект: убирает // и /* *​/ комментарии вне строк и висячие запятые. */
export function parseJsonc(text) {
  let out = '';
  let inString = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      out += ch;
      if (ch === '\\') out += text[++i];
      else if (ch === '"') inString = false;
    } else if (ch === '"') {
      inString = true;
      out += ch;
    } else if (ch === '/' && text[i + 1] === '/') {
      while (i < text.length && text[i] !== '\n') i++;
      out += '\n';
    } else if (ch === '/' && text[i + 1] === '*') {
      i += 2;
      while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) i++;
      i++;
    } else out += ch;
  }
  return JSON.parse(out.replace(/,(\s*[}\]])/g, '$1'));
}

/** Ключи верхнего уровня, которые staging вправе иметь. Остальные привязки (kv, r2, queues, services, ai…) могли бы указывать на ресурсы production. */
const ALLOWED_KEYS = new Set(['$schema', 'name', 'main', 'compatibility_date', 'compatibility_flags', 'observability', 'workers_dev', 'assets', 'd1_databases', 'triggers', 'vars', 'keep_vars']);
const SECRET_LIKE = /TOKEN|SECRET|KEY|PASSWORD|WEBHOOK|SETUP/i;

/** Проблемы конфигурации staging относительно production (пустой список — всё в порядке). */
export function checkStagingConfig(stagingText, productionText) {
  const problems = [];
  let stg;
  let prod;
  try {
    stg = parseJsonc(stagingText);
    prod = parseJsonc(productionText);
  } catch (e) {
    return [`конфигурация не разбирается: ${e.message}`];
  }
  const dbs = (c) => (Array.isArray(c.d1_databases) ? c.d1_databases : []);

  if (!stg.name || stg.name === prod.name) problems.push(`имя Worker staging «${stg.name}» совпадает с production «${prod.name}»`);
  else if (!/staging/.test(stg.name)) problems.push(`имя Worker staging «${stg.name}» не содержит «staging»`);

  const stgDb = dbs(stg);
  if (stgDb.length !== 1 || stgDb[0].binding !== 'DB') problems.push('в staging должна быть ровно одна база с привязкой DB');
  for (const d of stgDb) {
    if (d.database_name !== STAGING_DB) problems.push(`база staging «${d.database_name}», ожидается «${STAGING_DB}»`);
    for (const p of dbs(prod)) {
      if (d.database_name === p.database_name) problems.push(`база staging «${d.database_name}» совпадает с базой production`);
      if (d.database_id && p.database_id && d.database_id === p.database_id) problems.push('database_id staging совпадает с database_id production');
    }
    if (d.preview_database_id && dbs(prod).some((p) => p.database_id && p.database_id === d.preview_database_id)) problems.push('preview_database_id staging указывает на базу production');
  }

  if (!stg.triggers || !Array.isArray(stg.triggers.crons) || stg.triggers.crons.length !== 0) problems.push('cron staging должен быть задан явно и пуст: он переустанавливает webhook бота и шлёт нагадування');

  const vars = stg.vars ?? {};
  if (vars.ENVIRONMENT !== 'staging') problems.push(`vars.ENVIRONMENT staging = «${vars.ENVIRONMENT}», нужно «staging»`);
  for (const k of Object.keys(vars)) if (SECRET_LIKE.test(k)) problems.push(`в vars staging секретоподобный ключ «${k}»: секреты кладутся через wrangler secret put -c ${STAGING_CONFIG}`);
  for (const k of ['TTS_PROVIDER', 'STT_PROVIDER']) if (vars[k] !== 'off') problems.push(`vars.${k} staging должен быть «off» (платные сервисы)`);
  if (prod.vars?.ENVIRONMENT !== 'production') problems.push('в wrangler.jsonc ENVIRONMENT не «production»');

  for (const k of Object.keys(stg)) if (!ALLOWED_KEYS.has(k)) problems.push(`в staging лишний ключ «${k}»: привязки и маршруты могут указывать на production`);
  for (const k of ['route', 'routes', 'zone_id', 'account_id']) if (k in stg) problems.push(`в staging задан «${k}»`);

  // Одинаковая среда выполнения: staging проверяет тот же код.
  if (stg.main !== prod.main) problems.push(`main staging «${stg.main}» отличается от production «${prod.main}»`);
  if (stg.compatibility_date !== prod.compatibility_date) problems.push('compatibility_date staging отличается от production');
  if (JSON.stringify(stg.compatibility_flags) !== JSON.stringify(prod.compatibility_flags)) problems.push('compatibility_flags staging отличаются от production');
  if (JSON.stringify(stg.assets) !== JSON.stringify(prod.assets)) problems.push('assets staging отличаются от production');
  return problems;
}

/** Проблемы npm-команд: каждый wrangler в staging-командах идёт с -c wrangler.staging.jsonc и базой staging; production-команды staging не упоминают. */
export function checkStagingScripts(pkg) {
  const problems = [];
  const scripts = pkg.scripts ?? {};
  const names = Object.keys(scripts).filter((k) => /^(deploy:staging|staging:)/.test(k));
  if (!names.includes('deploy:staging') || !names.includes('staging:check')) problems.push('нет команд deploy:staging и staging:check');
  for (const name of names) {
    for (const step of scripts[name].split('&&').map((s) => s.trim())) {
      if (!/\bwrangler\b/.test(step)) continue;
      if (!step.includes(`-c ${STAGING_CONFIG}`)) problems.push(`${name}: «${step}» без -c ${STAGING_CONFIG}`);
      if (/\bd1\b/.test(step) && !new RegExp(`\\b${STAGING_DB}\\b`).test(step)) problems.push(`${name}: «${step}» не называет базу ${STAGING_DB}`);
      if (/\bd1\b/.test(step) && /\bpolski-go\b(?!-)/.test(step)) problems.push(`${name}: «${step}» называет базу production`);
    }
  }
  if (!/staging-guard/.test(scripts['deploy:staging'] ?? '')) problems.push('deploy:staging не начинается со сторожа');
  const deploy = scripts['deploy:staging'] ?? '';
  if (deploy.includes('staging-guard') && deploy.indexOf('staging-guard') > deploy.indexOf('wrangler')) problems.push('сторож запускается после wrangler');
  for (const name of ['deploy:cf']) if (/staging/.test(scripts[name] ?? '')) problems.push(`${name} (production) упоминает staging`);
  return problems;
}

export function checkRepo(root) {
  const read = (f) => readFileSync(`${root}/${f}`, 'utf8');
  return [...checkStagingConfig(read(STAGING_CONFIG), read('wrangler.jsonc')), ...checkStagingScripts(JSON.parse(read('package.json')))];
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const problems = checkRepo(process.cwd());
  if (problems.length) {
    console.error(`STAGING НЕБЕЗОПАСЕН (${problems.length}):\n- ${problems.join('\n- ')}`);
    process.exit(1);
  }
  console.log(`staging: конфигурация и команды безопасны (Worker polskie-go-staging, база ${STAGING_DB}, без cron, боевой токен бота не принимается)`);
}
