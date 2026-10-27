/**
 * Прототип единого Бобека в браузере (Chromium, не Telegram): шесть шагов владельца на /__look-prototype.
 *   1 худи → 2 синяя куртка → 3 кепка → 4 очки → 5 змах лапой → 6 перезапуск страницы, комплект на месте.
 * Проверяет: data-look-items после каждого шага; у большого Бобека идут CSS-анимации (look-wave, look-blink), лапа
 * и рукав поворачиваются; после перезагрузки тот же комплект и поза; на 320 px нет горизонтальной прокрутки.
 * Снимки: docs/qa/look-prototype/steps.jpg (шаги), blink.jpg (веки), wave.gif (5 с: змах и моргание).
 *
 * Запуск: node --import tsx scripts/look-prototype-screens.ts
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { chromiumPath, startStand } from './lib/stand';

const root = process.cwd();
const require = createRequire(root + '/package.json');
const sharp = require('sharp');
const OUT = resolve(root, 'docs/qa/look-prototype');
const failures: string[] = [];
const check = (ok: unknown, what: string) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) failures.push(what);
};

async function main() {
  const { chromium } = require('playwright') as typeof import('playwright');
  const stand = await startStand({ ui: 'dev' });
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: chromiumPath(chromium), args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const frames = mkdtempSync(join(tmpdir(), 'look-proto-'));
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'ru-RU' });
    const p = await context.newPage();
    await p.goto(`${stand.base}/__look-prototype`);
    await p.evaluate(() => localStorage.removeItem('pg_look_prototype_v1'));
    await p.reload();
    const big = p.locator('[data-look-prototype] .beaver-look').first();
    await big.waitFor({ timeout: 20_000 });
    await p.waitForTimeout(800);
    const items = () => big.getAttribute('data-look-items');
    const shots: Buffer[] = [];
    const shot = async () => shots.push(await big.screenshot());

    check((await items()) === 'backpack-travel hoodie-red', `1. стандартное худи: ${await items()}`);
    check((await big.getAttribute('data-look-mode')) === 'layered', '1. режим layered (слои на общем холсте, а не цельная картинка)');
    const imgsDecoded = await big.locator('img').evaluateAll((els) => (els as HTMLImageElement[]).every((e) => e.complete && e.naturalWidth > 0));
    check(imgsDecoded, '1. все слои декодированы');
    await shot();

    const step = async (n: number, expect: string, what: string) => {
      await p.locator(`[data-proto-step="${n}"]`).click();
      await p.waitForTimeout(700);
      const got = await items();
      check(got === expect, `${n}. ${what}: ${got}`);
      await shot();
    };
    await step(2, 'backpack-travel jacket-denim', 'синяя куртка вместо худи');
    const topLayers = await big.locator('img[data-look-slot="top"]').evaluateAll((els) => els.map((e) => e.getAttribute('data-look-owner')));
    check(topLayers.length > 0 && topLayers.every((o) => o === 'jacket-denim'), '2. слой верха один — куртка, худи снято');
    await step(3, 'backpack-travel cap-red jacket-denim', 'кепка на голове');
    await step(4, 'backpack-travel cap-red glasses-round jacket-denim', 'очки');
    await step(5, 'backpack-travel cap-red glasses-round jacket-denim', 'змах лапой, комплект тот же');
    check((await big.getAttribute('data-look-pose')) === 'wave', '5. поза wave');
    check(await big.evaluate((el) => el.classList.contains('is-live')), '5. Бобек «живой» (.is-live): анимации включены');
    const wave = big.locator('img.look-motion-wave');
    check((await wave.count()) === 2, `5. двигаются лапа и рукав выбранного верха: ${await wave.count()} слоя`);
    const anim = await wave.first().evaluate((el) => getComputedStyle(el).animationName);
    check(anim === 'look-wave', `5. CSS-анимация лапы: ${anim}`);
    const t1 = await wave.first().evaluate((el) => getComputedStyle(el).transform);
    await p.waitForTimeout(450);
    const t2 = await wave.first().evaluate((el) => getComputedStyle(el).transform);
    check(t1 !== t2, '5. лапа действительно поворачивается (transform меняется во времени)');
    const blinkAnim = await big.locator('img.look-motion-blink').first().evaluate((el) => getComputedStyle(el).animationName);
    check(blinkAnim === 'look-blink', `моргание: ${blinkAnim}`);

    // 5 секунд кадров для GIF: змах и одно моргание (цикл 4,6 с).
    const card = p.locator('[data-look-prototype] .card').first();
    for (let i = 0; i < 50; i++) {
      await card.screenshot({ path: join(frames, `f${String(i).padStart(3, '0')}.png`), scale: 'css' });
      await p.waitForTimeout(60);
    }

    // Веки отдельным снимком: показать слой моргания принудительно.
    await p.addStyleTag({ content: '.look-motion-blink{animation:none!important;opacity:1!important}.look-motion-wave{animation:none!important}' });
    await p.waitForTimeout(200);
    await sharp(await big.screenshot()).jpeg({ quality: 88 }).toFile(join(OUT, 'blink.jpg'));

    // 6. Перезапуск: комплект и поза на месте.
    await p.reload();
    await big.waitFor({ timeout: 20_000 });
    await p.waitForTimeout(800);
    check((await items()) === 'backpack-travel cap-red glasses-round jacket-denim', `6. после перезапуска тот же комплект: ${await items()}`);
    check((await big.getAttribute('data-look-pose')) === 'wave', '6. и та же поза');
    check((await p.locator('[data-proto-restored]').count()) === 1, '6. страница сообщает, что комплект восстановлен');
    await shot();

    // Анимационные состояния: тот же комплект в каждой позе.
    for (const s of ['idle', 'happy', 'think', 'celebrate']) {
      await p.locator(`[data-proto-state-btn="${s}"]`).click();
      await p.waitForTimeout(500);
      check((await items()) === 'backpack-travel cap-red glasses-round jacket-denim', `состояние ${s}: комплект тот же`);
    }

    // 320 px: без горизонтальной прокрутки.
    await p.setViewportSize({ width: 320, height: 700 });
    await p.waitForTimeout(400);
    check(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), '320 px: нет горизонтальной прокрутки');

    // Лист шагов.
    const W = 300;
    const H = 360;
    const tiles = await Promise.all(shots.map((b) => sharp(b).resize(W, H, { fit: 'contain', background: '#eef3f8' }).png().toBuffer()));
    const labels = ['1 худи', '2 синяя куртка', '3 кепка', '4 очки', '5 змах', '6 после перезапуска'];
    const label = (t: string) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="34"><rect width="100%" height="100%" fill="#ffffff"/><text x="10" y="24" font-family="DejaVu Sans" font-size="18" font-weight="bold" fill="#111">${t}</text></svg>`);
    await sharp({ create: { width: W * tiles.length, height: H + 34, channels: 3, background: '#ffffff' } })
      .composite(tiles.flatMap((input, i) => [{ input, left: i * W, top: 34 }, { input: label(labels[i] ?? ''), left: i * W, top: 0 }]))
      .jpeg({ quality: 86 })
      .toFile(join(OUT, 'steps.jpg'));
    const list = readdirSync(frames).filter((f) => f.endsWith('.png')).sort();
    check(list.length === 50, `кадров для GIF: ${list.length}`);
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '10', '-i', join(frames, 'f%03d.png'), '-vf', 'scale=300:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=4', '-loop', '0', join(OUT, 'wave.gif')]);
    await context.close();
  } finally {
    rmSync(frames, { recursive: true, force: true });
    await browser.close();
    await stand.stop();
  }
  console.log(failures.length ? `\nОШИБОК: ${failures.length}\n- ${failures.join('\n- ')}` : '\nвсе проверки пройдены');
  process.exit(failures.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
