/**
 * Картинки к вопросам бота (вопрос дня, /quiz): 16 полноразмерных сцен миссий → JPEG 1280×720 в apps/web/public/bot/quiz/.
 *
 *   node scripts/build-quiz-images.mjs && node scripts/validate-assets.mjs --write-versions
 *
 * Источник — оригиналы кадров (docs/design/a12|a16/missions/*_original.webp, 1536×1024; bar mleczny 1672×941).
 * Вырезка 16:9 (1536×864) берётся вокруг той же области, что и вырезка 2:1 в приложении (packages/shared/src/sceneArtNotes.ts,
 * `source.top`), чуть выше и ниже неё. Только уменьшение Lanczos: без растяжения, без заливки полос.
 * Список сцен совпадает с QUIZ_SCENES (apps/server/src/bot/quiz/scenes.ts) — это проверяет apps/server/test/quiz-bank.test.ts.
 */
import { mkdirSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const ROOT = new URL('../', import.meta.url);
const OUT = new URL('apps/web/public/bot/quiz/', ROOT);
const W = 1280;
const H = 720;

/** сцена → оригинал, верх вырезки 2:1 в приложении (px оригинала) и, если нужно, сколько срезать с боков (тёмная кромка оригинала). */
const SCENES = {
  'bar-mleczny': ['docs/design/a12/missions/bar-mleczny_original.webp', 10],
  biuro: ['docs/design/a12/missions/biuro_original.webp', 110],
  cukiernia: ['docs/design/a16/missions/cukiernia_original.webp', 80],
  lidl: ['docs/design/a12/missions/lidl_original.webp', 150],
  'lotnisko-lot': ['docs/design/a16/missions/lotnisko-lot_original.webp', 150],
  mieszkanie: ['docs/design/a12/missions/mieszkanie_original.webp', 60],
  pierniki: ['docs/design/a12/missions/pierniki_original.webp', 60],
  pierogarnia: ['docs/design/a16/missions/pierogarnia_original.webp', 180],
  pkp: ['docs/design/a12/missions/pkp_original.webp', 10, 16],
  przychodnia: ['docs/design/a12/missions/przychodnia_original.webp', 40],
  'recepcja-narty': ['docs/design/a16/missions/recepcja-narty_original.webp', 90],
  'stop-cafe': ['docs/design/a16/missions/stop-cafe_original.webp', 80],
  tramwaj: ['docs/design/a12/missions/tramwaj_original.webp', 80],
  urzad: ['docs/design/a16/missions/urzad_original.webp', 100],
  'warszawa-starowka': ['docs/design/a16/missions/warszawa-starowka_original.webp', 160],
  zapiekanki: ['docs/design/a12/missions/zapiekanki_original.webp', 50],
};

mkdirSync(OUT, { recursive: true });
for (const [scene, [file, top2x1, inset = 0]] of Object.entries(SCENES)) {
  const input = new URL(file, ROOT).pathname;
  const meta = await sharp(input).metadata();
  const width = meta.width - 2 * inset;
  const height = meta.height;
  if (width < W) throw new Error(`${file}: ширина ${width} меньше ${W} — не растягиваем`);
  const cropH = Math.round((width * 9) / 16);
  let img = sharp(input);
  if (cropH < height || inset) {
    // Вырезка 2:1 занимает width/2 по высоте; 16:9 выше на (cropH − width/2) — добавляем поровну сверху и снизу.
    const extra = Math.round((cropH - width / 2) / 2);
    const top = Math.min(Math.max(top2x1 - extra, 0), height - cropH);
    img = img.extract({ left: inset, top, width, height: cropH });
  }
  const jpeg = await img.resize(W, H, { fit: 'fill', kernel: 'lanczos3' }).jpeg({ quality: 88, chromaSubsampling: '4:4:4', mozjpeg: true }).toBuffer();
  const target = new URL(`${scene}.jpg`, OUT);
  writeFileSync(target, jpeg);
  console.log(`quiz/${scene}.jpg  ${W}×${H}  ${(statSync(target).size / 1024).toFixed(0)} KB  ← ${file} (${width}×${height})`);
}
