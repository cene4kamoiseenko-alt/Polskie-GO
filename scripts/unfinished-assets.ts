/**
 * Перечень незавершённых ассетов → docs/UNFINISHED_ASSETS.md.
 *   node --import tsx scripts/unfinished-assets.ts            записать документ
 *   node --import tsx scripts/unfinished-assets.ts --check    только проверить, что документ совпадает с кодом (код 1, если нет)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildUnfinishedAssets } from './lib/unfinished-assets';

const root = process.cwd();
const file = resolve(root, 'docs/UNFINISHED_ASSETS.md');
const text = buildUnfinishedAssets(root) + '\n';

if (process.argv.includes('--check')) {
  const same = readFileSync(file, 'utf8') === text;
  console.log(same ? 'docs/UNFINISHED_ASSETS.md совпадает с кодом и манифестами' : 'docs/UNFINISHED_ASSETS.md устарел: node --import tsx scripts/unfinished-assets.ts');
  process.exit(same ? 0 : 1);
}
writeFileSync(file, text);
console.log(`записано ${file}`);
