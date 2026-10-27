/**
 * Сравнительный лист картинок Telegram-бота: BEFORE (что раздаёт production) / AFTER (что шлёт текущий код).
 *
 *   node --import tsx scripts/telegram-before-after.ts [git-ref-production]
 *
 * BEFORE берётся из git по ссылке production (по умолчанию origin/claude/polski-go-telegram-app-r8helf — то, что
 * задеплоено), AFTER — файлы apps/web/public/bot по функциям catalog.ts / quiz engine. Для каждого кадра — реальный размер,
 * ширина мыльных полос и доля мелких деталей (scripts/lib/image-quality.mjs).
 * Результат (docs/qa/telegram-images/):
 *   before-after.jpg   — все случаи, где кадр поменялся, BEFORE слева, AFTER справа;
 *   edges-100.jpg      — /words (скриншот владельца): левый и правый края 1:1, BEFORE сверху, AFTER снизу;
 *   preview.html       — каждый кадр, который бот может отправить, в 100 % (1280×720) с замерами;
 *   report.json        — замеры по каждому случаю.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { UI_LANGS, type UiLang } from '@polski-go/shared';
import { COMMANDS, commandImage, reminderImage, startBackImage, type CommandName } from '../apps/server/src/bot/catalog';
import { quizImage } from '../apps/server/src/bot/quiz/engine';
import { QUIZ_QUESTIONS } from '../apps/server/src/bot/quiz/questions';
import { analyseImage, qualityProblems } from './lib/image-quality.mjs';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const ROOT = new URL('../', import.meta.url).pathname;
const OUT = `${ROOT}docs/qa/telegram-images/`;
const PROD_REF = process.argv[2] ?? 'origin/claude/polski-go-telegram-app-r8helf';
const prodSha = execFileSync('git', ['rev-parse', '--short', PROD_REF], { cwd: ROOT }).toString().trim();

/** Карта production (catalog.ts на PROD_REF): русские ru/*.jpg для семи команд, ru/reminder.jpg в 19:00, ru/* в квизе. */
const PROD_RU: Partial<Record<CommandName, string>> = {
  start: 'ru/welcome.jpg', lesson: 'ru/lessons.jpg', map: 'ru/map.jpg', words: 'ru/words.jpg',
  quests: 'ru/quests.jpg', settings: 'ru/settings.jpg', help: 'ru/help.jpg',
};
const PROD_COMMAND: Record<CommandName, string> = {
  start: 'start.jpg', lesson: 'lesson.jpg', map: 'map.jpg', words: 'words.jpg', quests: 'quests.jpg',
  profile: 'profile.jpg', settings: 'settings.jpg', help: 'help.jpg', stop: 'stop.jpg',
};
const prodCommand = (c: CommandName, lang: UiLang) => (lang === 'ru' && PROD_RU[c]) || `commands/${PROD_COMMAND[c]}`;
const PROD_QUIZ_RU: Record<string, string> = { shopping: 'ru/shopping.jpg', food: 'ru/food.jpg', transport: 'ru/transport.jpg' };

type Case = { label: string; langs: string; before: string | null; after: string | null };

function cases(): Case[] {
  const all: Case[] = [];
  const push = (label: string, perLang: (lang: UiLang) => [string | null, string | null]) => {
    const byPair = new Map<string, UiLang[]>();
    for (const lang of UI_LANGS) {
      const key = JSON.stringify(perLang(lang));
      byPair.set(key, [...(byPair.get(key) ?? []), lang]);
    }
    for (const [key, langs] of byPair) {
      const [before, after] = JSON.parse(key) as [string | null, string | null];
      all.push({ label, langs: langs.join(' '), before, after });
    }
  };
  for (const c of COMMANDS) push(`/${c}`, (lang) => [prodCommand(c, lang), commandImage(c, lang)]);
  push('/start (вернулся)', (lang) => [prodCommand('start', lang), startBackImage(lang)]);
  push('напоминание «урок» 19:00', (lang) => [lang === 'ru' ? 'ru/reminder.jpg' : 'commands/reminder-lesson.jpg', reminderImage('lesson')]);
  push('напоминание «урок» другое время', () => ['commands/reminder-lesson.jpg', reminderImage('lesson')]);
  push('напоминание «серия»', () => ['commands/reminder-streak.jpg', reminderImage('streak')]);
  push('напоминание «возвращение»', () => ['commands/reminder-return.jpg', reminderImage('return')]);
  for (const category of ['shopping', 'food', 'transport'] as const) {
    const q = QUIZ_QUESTIONS.find((x) => x.category === category)!;
    push(`/quiz ${category}`, (lang) => [lang === 'ru' ? PROD_QUIZ_RU[category] : null, quizImage(q, lang)]);
  }
  const loyalty = QUIZ_QUESTIONS.find((x) => x.id === 'shop-loyalty')!;
  // В production вопрос shop-loyalty шёл без картинки у uk/pl/en; Biedronka была только в неопубликованных коммитах.
  push('/quiz shop-loyalty', (lang) => [lang === 'ru' ? PROD_QUIZ_RU.shopping : null, quizImage(loyalty, lang)]);
  return all;
}

const prodFile = (file: string) => execFileSync('git', ['show', `${PROD_REF}:apps/web/public/bot/${file}`], { cwd: ROOT, maxBuffer: 64 << 20 });
const localFile = (file: string) => readFileSync(`${ROOT}apps/web/public/bot/${file}`);
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function measure(bytes: Buffer | null) {
  if (!bytes) return null;
  const q = await analyseImage(bytes);
  return { ...q, problems: qualityProblems(q) };
}

const TW = 576;
const TH = 324;
const LABEL_W = 300;
const ROW_H = TH + 70;

const text = (w: number, h: number, lines: { t: string; size?: number; color?: string; bold?: boolean }[], bg = '#ffffff') => {
  let y = 0;
  const body = lines
    .map((l) => {
      y += (l.size ?? 18) + 8;
      return `<text x="10" y="${y}" font-family="DejaVu Sans, Arial" font-size="${l.size ?? 18}" fill="${l.color ?? '#111'}"${l.bold ? ' font-weight="bold"' : ''}>${esc(l.t)}</text>`;
    })
    .join('');
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="${bg}"/>${body}</svg>`);
};

const verdict = (m: Awaited<ReturnType<typeof measure>>) => {
  if (!m) return { t: 'картинки нет — сообщение текстом', color: '#555' };
  const bands = m.bandLeft + m.bandRight > 0;
  return {
    t: `${m.width}×${m.height} · полосы ${m.bandLeft}/${m.bandRight} px · детали ${m.detail.toFixed(2)}${bands ? ' · МЫЛЬНЫЕ ПОЛОСЫ' : m.detail < 0.44 ? ' · увеличен' : ' · OK'}`,
    color: bands ? '#c00' : m.detail < 0.44 ? '#b36b00' : '#0a7a2a',
  };
};

async function thumb(bytes: Buffer | null) {
  if (!bytes) return sharp({ create: { width: TW, height: TH, channels: 3, background: '#e8e8e8' } }).composite([{ input: text(TW, TH, [{ t: '— без картинки —', size: 22, color: '#666' }], '#e8e8e8') }]).png().toBuffer();
  return sharp(bytes).resize(TW, TH, { fit: 'fill' }).png().toBuffer();
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const list = cases();
  const changed = list.filter((c) => c.before !== c.after);
  const report: unknown[] = [];
  const rows: Buffer[] = [];
  for (const c of list) {
    const before = c.before ? prodFile(c.before) : null;
    const after = c.after ? localFile(c.after) : null;
    const mb = await measure(before);
    const ma = await measure(after);
    report.push({ case: c.label, langs: c.langs, before: c.before, after: c.after, beforeQuality: mb, afterQuality: ma });
    if (c.before === c.after) continue;
    const vb = verdict(mb);
    const va = verdict(ma);
    const row = await sharp({ create: { width: LABEL_W + 2 * TW + 30, height: ROW_H, channels: 3, background: '#ffffff' } })
      .composite([
        { input: text(LABEL_W, ROW_H, [{ t: c.label, size: 20, bold: true }, { t: c.langs, size: 16, color: '#555' }]), left: 0, top: 0 },
        { input: await thumb(before), left: LABEL_W, top: 0 },
        { input: await thumb(after), left: LABEL_W + TW + 30, top: 0 },
        { input: text(TW, 66, [{ t: `BEFORE: ${c.before ?? '—'}`, size: 15 }, { t: vb.t, size: 15, color: vb.color, bold: true }]), left: LABEL_W, top: TH + 2 },
        { input: text(TW, 66, [{ t: `AFTER: ${c.after ?? '—'}`, size: 15 }, { t: va.t, size: 15, color: va.color, bold: true }]), left: LABEL_W + TW + 30, top: TH + 2 },
      ])
      .png()
      .toBuffer();
    rows.push(row);
  }
  const width = LABEL_W + 2 * TW + 30;
  const header = text(width, 90, [
    { t: `POLSKI GO · Telegram · BEFORE = production (${prodSha}) · AFTER = текущий код`, size: 22, bold: true },
    { t: `Показаны только случаи, где кадр меняется: ${changed.length} из ${list.length}. Кадры уменьшены до ${TW}×${TH}; замеры — по файлам 1280×720.`, size: 16, color: '#444' },
    { t: 'полосы — ширина мыльной полосы у левого/правого края (px); детали < 0,44 — кадр увеличен из маленького', size: 16, color: '#444' },
  ]);
  const sheet = await sharp({ create: { width, height: 90 + rows.length * (ROW_H + 10), channels: 3, background: '#f2f2f2' } })
    .composite([{ input: header, left: 0, top: 0 }, ...rows.map((input, i) => ({ input, left: 0, top: 90 + i * (ROW_H + 10) }))])
    .jpeg({ quality: 82 })
    .toBuffer();
  writeFileSync(`${OUT}before-after.jpg`, sheet);

  // /words из скриншота владельца: края 1:1.
  const wb = prodFile(prodCommand('words', 'ru'));
  const wa = localFile(commandImage('words', 'ru'));
  const strip = (b: Buffer, left: number) => sharp(b).extract({ left, top: 0, width: 320, height: 720 }).png().toBuffer();
  const edgeW = 4 * 320 + 3 * 16;
  const edges = await sharp({ create: { width: edgeW, height: 2 * (720 + 60), channels: 3, background: '#ffffff' } })
    .composite([
      { input: text(edgeW, 56, [{ t: `/words, русский · BEFORE ${prodCommand('words', 'ru')} (production): левый край 0–320 px и правый 960–1280 px в 100 %`, size: 18, bold: true, color: '#c00' }]), left: 0, top: 0 },
      { input: await strip(wb, 0), left: 0, top: 60 },
      { input: await strip(wb, 960), left: 320 + 16, top: 60 },
      { input: text(edgeW, 56, [{ t: `/words, русский · AFTER ${commandImage('words', 'ru')}: те же края в 100 %`, size: 18, bold: true, color: '#0a7a2a' }]), left: 0, top: 780 },
      { input: await strip(wa, 0), left: 0, top: 840 },
      { input: await strip(wa, 960), left: 320 + 16, top: 840 },
      { input: text(2 * 320 + 16, 700, [
        { t: 'BEFORE:', size: 20, bold: true },
        { t: '  слева и справа по ~90 px растянутой', size: 18 },
        { t: '  размытой копии; кадр в середине', size: 18 },
        { t: '  увеличен (детали 0,35)', size: 18 },
        { t: '', size: 10 },
        { t: 'AFTER:', size: 20, bold: true },
        { t: '  полный кадр доски владельца 1672×941,', size: 18 },
        { t: '  только уменьшен до 1280×720;', size: 18 },
        { t: '  полос 0 px, детали 0,50', size: 18 },
      ]), left: 2 * 320 + 32, top: 60 },
    ])
    .jpeg({ quality: 88 })
    .toBuffer();
  writeFileSync(`${OUT}edges-100.jpg`, edges);

  // Предпросмотр 1:1 каждого кадра, который бот может отправить.
  const sendable = [...new Set(list.map((c) => c.after).filter((f): f is string => Boolean(f)))].sort();
  const cards = [];
  for (const file of sendable) {
    const m = (await measure(localFile(file)))!;
    const usedBy = list.filter((c) => c.after === file).map((c) => `${c.label} (${c.langs})`);
    cards.push(`<section><h2>${esc(file)}</h2><p>${m.width}×${m.height} · полосы ${m.bandLeft}/${m.bandRight} px · края ${m.edgeLeft}%/${m.edgeRight}% · детали ${m.detail.toFixed(2)} · ${m.problems.length ? esc(m.problems.join('; ')) : 'без мыльных полос'}</p><p class="use">${esc(usedBy.join(' · '))}</p><div class="frame"><img src="../../../apps/web/public/bot/${esc(file)}" width="1280" height="720" alt="${esc(file)}"></div></section>`);
  }
  writeFileSync(
    `${OUT}preview.html`,
    `<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Telegram кадры 1:1</title>
<style>body{font:15px/1.4 system-ui,sans-serif;margin:16px;background:#f4f4f4;color:#111}section{margin:0 0 32px}h2{font-size:17px;margin:0 0 4px}.use{color:#555}.frame{overflow-x:auto;background:#fff;border:1px solid #ccc;padding:0;width:max-content;max-width:100%}.frame img{display:block;width:1280px;height:720px;max-width:none}</style>
<h1>POLSKI GO · кадры Telegram в 100 % (${sendable.length})</h1><p>Каждый файл, который текущий код может отправить на любом языке. Ширина 1280 px без масштабирования: прокрутите вбок, чтобы увидеть правый край. Замеры — scripts/lib/image-quality.mjs. BEFORE/AFTER — before-after.jpg и edges-100.jpg рядом.</p>
${cards.join('\n')}
</html>\n`,
  );
  writeFileSync(`${OUT}report.json`, `${JSON.stringify({ production: { ref: PROD_REF, sha: prodSha }, cases: report }, null, 2)}\n`);
  console.log(`before-after.jpg: ${changed.length} изменённых случаев из ${list.length}; preview.html: ${sendable.length} кадров; production ${prodSha}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
