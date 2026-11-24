/**
 * Библиотека картинок Бобека для приложения: картинки канала владельца (`apps/web/public/channel/<файл>.jpg`, 1254 px, ~350 КБ)
 * → сжатые WebP в `apps/web/src/assets/library` (реестр — packages/shared/src/libraryArt.ts, LIBRARY_ART):
 *   <файл>.webp      — основная, ширина 1080 (меньше — как есть), для экранов шире 640;
 *   <файл>@640.webp  — узкая для srcset.
 * Пропорции — как у исходника (без обрезки): кадр режет сам экран через object-fit и точку фокуса из реестра.
 *
 *   node --import tsx scripts/build-library-art.ts   (из корня репозитория)
 */
import { mkdirSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { LIBRARY_ART } from "../packages/shared/src/libraryArt";

const root = process.cwd();
const require = createRequire(resolve(root, "package.json"));
const sharp = require("sharp") as typeof import("sharp");
const SRC = resolve(root, "apps/web/public/channel");
const OUT = resolve(root, "apps/web/src/assets/library");
mkdirSync(OUT, { recursive: true });

async function main() {
  for (const file of Object.keys(LIBRARY_ART)) {
    const input = readFileSync(resolve(SRC, `${file}.jpg`));
    for (const [suffix, width] of [
      ["", 1080],
      ["@640", 640],
    ] as const) {
      const out = resolve(OUT, `${file}${suffix}.webp`);
      await sharp(input)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 70, effort: 6, smartSubsample: true })
        .toFile(out);
      if (!suffix)
        console.log(
          `${file.padEnd(16)} ${(statSync(out).size / 1024).toFixed(0).padStart(4)} КБ`,
        );
    }
  }
  console.log(
    `\nготово: ${Object.keys(LIBRARY_ART).length} картинок → apps/web/src/assets/library`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
