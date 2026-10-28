/**
 * Точный перечень незавершённых ассетов: собирается из кода и манифестов, а не пишется вручную.
 *   • фоны городов со статусом interim — `CITY_ART` + `assets/cities/CITY_ASSET_MANIFEST.json` (needed_art);
 *   • сцены бота без исходника — `assets/telegram/asset-manifest.json`, раздел blocked_scenes;
 *   • сцены магазинов с Бобеком в кадре — `SCENE_ART`;
 *   • слои Бобека для этапов etalon-1 / etalon-2 — `missingForMilestone` (ядро образа);
 *   • вещи гардероба без ресурса — `assets/wardrobe/WARDROBE_CATALOG.json`.
 * Документ docs/UNFINISHED_ASSETS.md — вывод этой функции; тест apps/server/test/unfinished-assets.test.ts сверяет его с кодом.
 * Обновить документ: node --import tsx scripts/unfinished-assets.ts
 */
import { readFileSync } from 'node:fs';
import { CITY_ART } from '../../packages/shared/src/cityArt';
import { MISSION_BACKGROUND_BRIEF, MISSION_SCENE_ART, SCENE_ART } from '../../packages/shared/src/sceneArt';
import { missingForMilestone } from '../../packages/shared/src/look/validate';
import { CITIES } from '../../apps/server/src/content/cities';
import { MISSIONS, MISSIONS_SOON } from '../../apps/server/src/content/missions';

const read = (root: string, file: string) => JSON.parse(readFileSync(`${root}/${file}`, 'utf8'));

type CityEntry = { city_id: string; name_ru: string; image: { declared_size: string }; needed_art?: { file: string; format: string; scene: string; priority?: number; current_check?: string } };
type Blocked = { scene: string; command: string; reason: string; needed_files: string[]; description: string };
type WardrobeItem = { id: string; category: string; names: { ru: string }; asset_status?: string; status?: string };

export function unfinishedAssets(root: string) {
  const cityManifest = read(root, 'assets/cities/CITY_ASSET_MANIFEST.json') as { cities: CityEntry[] };
  const bySlug = new Map(cityManifest.cities.map((c) => [c.city_id, c]));
  const cities = CITIES.filter((c) => CITY_ART[c.slug]?.status !== 'final').map((c) => {
    const art = CITY_ART[c.slug];
    const m = bySlug.get(c.slug);
    return {
      slug: c.slug,
      name: m?.name_ru ?? c.slug,
      status: art.status,
      current: art.status === 'missing' ? 'нет файла' : `${art.width}×${art.height}`,
      shows: art.shows,
      master: m?.needed_art?.file ?? `docs/design/a10/cities/city-${c.slug}.webp`,
      format: m?.needed_art?.format ?? '2:1, ≥ 2880×1440',
      scene: m?.needed_art?.scene ?? '',
      priority: m?.needed_art?.priority ?? 9,
      check: m?.needed_art?.current_check ?? '',
    };
  });
  const botScenes = (read(root, 'assets/telegram/asset-manifest.json') as { blocked_scenes: Blocked[] }).blocked_scenes;
  const storeScenes = Object.values(SCENE_ART).filter((s) => s.bakedBobek || s.status !== 'final');
  const layers = (['etalon-1', 'etalon-2'] as const).map((id) => ({ id, missing: missingForMilestone(id) }));
  const wardrobe = (read(root, 'assets/wardrobe/WARDROBE_CATALOG.json') as { items: WardrobeItem[] }).items;
  const missions = [...MISSIONS.map((m) => ({ slug: m.slug, scene: m.scene, soon: false, title: m.title.ru ?? m.title.uk })), ...MISSIONS_SOON.map((m) => ({ slug: m.slug, scene: m.scene, soon: true, title: m.title.ru ?? m.title.uk }))].map((m) => {
    const art = SCENE_ART[MISSION_SCENE_ART[m.slug] ?? ''];
    const brief = MISSION_BACKGROUND_BRIEF[m.slug];
    return { ...m, current: art ? `${art.id} (${art.status}, Бобек в кадре)` : `SVG «${m.scene}»`, action: brief?.action ?? '', background: brief?.background ?? '' };
  });
  return { cities, botScenes, storeScenes, missions, layers, wardrobe };
}

const cell = (s: string) => s.replace(/\|/g, '\\|').replace(/\n/g, ' ');

export function buildUnfinishedAssets(root: string): string {
  const { cities, botScenes, storeScenes, missions, layers, wardrobe } = unfinishedAssets(root);
  const lines: string[] = [];
  lines.push('# Незавершённые ассеты — точный перечень');
  lines.push('');
  lines.push('Файл создаётся командой `node --import tsx scripts/unfinished-assets.ts` из кода и манифестов (`scripts/lib/unfinished-assets.ts`); вручную не правится. `apps/server/test/unfinished-assets.test.ts` падает, если документ разошёлся с `CITY_ART`, `SCENE_ART`, манифестами бота и гардероба.');
  lines.push('');
  lines.push(`Итого: **${cities.length}** городских фонов, **${botScenes.length}** сцен бота, **${storeScenes.length}** сцен магазинов (нужны версии без Бобека), **${missions.length}** фонов миссий без Бобека (готовых нет), **${layers.reduce((n, l) => n + l.missing.length, 0)}** слоёв Бобека для двух этапов, **${wardrobe.filter((i) => (i.asset_status ?? i.status) === 'отсутствует').length}** вещей гардероба без ресурса. Ничего из этого не подменено случайной картинкой: приложение и бот честно показывают «в подготовке» или нейтральный кадр.`);
  lines.push('');

  lines.push(`## 1. Фоны городов: ${cities.length} временных (interim)`);
  lines.push('');
  lines.push('Общие требования: отдельный оригинал одного города (не коллаж, не увеличенная вырезка) — ≥ 1536×1024 (3:2) или ≥ 1774×887 (2:1), лучше 2880×1440; PNG или WebP без потерь; без текста, логотипов, Бобека и людей крупным планом; ориентир — в центральных 60 % ширины; левая нижняя треть — спокойный передний план; стиль «Premium 2.5D cartoon travel-game environment, cinematic golden-hour lighting, colorful Polish architecture, high detail, vibrant colors, crisp edges». Как подключить мастер — `docs/CITY_ART_INVENTORY.md`, «Как заменить на мастер-файл».');
  lines.push('');
  lines.push('Приоритет: 1 — рисовать первым (порядок маршрута: раньше город — раньше его видят игроки). Промпты для ChatGPT — `docs/CHATGPT_ART_PROMPTS_RU.md`, пакет A. Ни один кадр не увеличивается до нужного размера: пока мастера нет, город остаётся interim.');
  lines.push('');
  lines.push('| № | city_id | Город | Приоритет | Сейчас в приложении | Проверка текущего кадра | Что нарисовать | Куда положить мастер |');
  lines.push('|---|---|---|---|---|---|---|---|');
  cities.forEach((c, i) => lines.push(`| ${i + 1} | \`${c.slug}\` | ${c.name} | ${c.priority} | ${c.current}, ${c.status}: ${cell(c.shows)} | ${cell(c.check)} | ${cell(c.scene)} | \`${c.master}\` |`));
  lines.push('');

  lines.push(`## 2. Сцены бота: ${botScenes.length} недостающих`);
  lines.push('');
  lines.push('Пока исходника нет, бот шлёт нейтральные кадры `commands/*` (они существуют, резкие, без размытых полос; `apps/server/test/bot-image-fallback.test.ts` проверяет это) и не ссылается на несуществующие файлы. Файлы кладутся в `apps/web/public/bot/`: JPEG 1280×720 и `@640` 640×360 (`node scripts/build-bot-images.mjs`, проверка — `npm run assets`). Мастер от 1920×1080. На картинках не должно быть живых данных: чисел XP, серии, названий городов, штампов, образцов вопросов.');
  lines.push('');
  lines.push('| № | scene | Где нужна | Файлы | Почему нет | Что нарисовать |');
  lines.push('|---|---|---|---|---|---|');
  botScenes.forEach((b, i) => lines.push(`| ${i + 1} | \`${b.scene}\` | ${cell(b.command)} | ${b.needed_files.map((f) => `\`${f}\``).join('<br>')} | ${cell(b.reason)} | ${cell(b.description)} |`));
  lines.push('');

  lines.push(`## 3. Сцены магазинов: ${storeScenes.length} временных кадров, нужны мастера без Бобека`);
  lines.push('');
  lines.push('Подробности, дефекты кадров и способ замены — `docs/SCENE_ART_INVENTORY.md`. Мастер: 2:1 ≥ 2880×1440 и 16:9 ≥ 1920×1080, тот же свет и архитектура, **без Бобека**; Бобека рисует отдельный рендерер образа. После замены в `SCENE_ART`: `bakedBobek: false`, `status: \'final\'`, реальный `native`, пустой `defects`.');
  lines.push('');
  lines.push('| № | scene_id | Бренд | Файл в приложении | Рождённый размер | Дефекты кадра |');
  lines.push('|---|---|---|---|---|---|');
  storeScenes.forEach((s, i) => lines.push(`| ${i + 1} | \`${s.id}\` | ${s.brand} | \`apps/web/src/assets/scenes/${s.file}.webp\` | ${s.native[0]}×${s.native[1]} | ${s.defects.length ? cell(s.defects.join('; ')) : 'нет'} |`));
  lines.push('');
  lines.push(`### Фоны всех миссий: ${missions.length} (${missions.filter((m) => !m.soon).length} активных + ${missions.filter((m) => m.soon).length} «скоро»), готовых нет`);
  lines.push('');
  lines.push('Экран миссии собирается из трёх слоёв: **фон** (этот список) + **Бобек в выбранном образе** (накладывается справа внизу, ~30 % ширины) + **интерфейс** (кнопка «закрыть» слева вверху, текст под кадром). Поэтому на фоне: показано действие игрока, правый нижний угол свободен, **Бобека нет**, текста нет, кроме настоящих вывесок заведения. Формат как у магазинов: 2:1 ≥ 2880×1440. Источник — `MISSION_BACKGROUND_BRIEF` в `packages/shared/src/sceneArt.ts`.');
  lines.push('');
  lines.push('| № | mission.slug | Миссия | Сейчас | Действие игрока | Что нарисовать (без Бобека) |');
  lines.push('|---|---|---|---|---|---|');
  missions.forEach((m, i) => lines.push(`| ${i + 1} | \`${m.slug}\` | ${cell(m.title)}${m.soon ? ' (скоро)' : ''} | ${cell(m.current)} | ${cell(m.action)} | ${cell(m.background)} |`));
  lines.push('');

  lines.push('## 4. Слои Бобека (единый рендерер, ADR-005)');
  lines.push('');
  lines.push('Список строит `missingForMilestone` из манифеста образа. Слои — живописные PNG/WebP на общем холсте 1024 с якорями; делает владелец или Opus по листам эталона. Пока слоёв нет, вещи не рисуются и не продаются (`visual_pending`).');
  lines.push('');
  for (const l of layers) {
    lines.push(`### ${l.id}: ${l.missing.length} частей`);
    lines.push('');
    lines.push('| № | Владелец | Часть | Слот | Ракурс | Поза | Необязательно |');
    lines.push('|---|---|---|---|---|---|---|');
    l.missing.forEach((m, i) => lines.push(`| ${i + 1} | \`${m.owner}\` | \`${m.part}\` | ${m.slot} | ${m.view} | ${m.pose} | ${m.optional ? 'да' : 'нет'} |`));
    lines.push('');
  }
  const none = wardrobe.filter((i) => (i.asset_status ?? i.status) === 'отсутствует');
  const redo = wardrobe.filter((i) => (i.asset_status ?? i.status) === 'требует переделки');
  lines.push(`Каталог гардероба (\`assets/wardrobe/WARDROBE_CATALOG.json\`): вещей ${wardrobe.length}; без ресурса — **${none.length}**, цельные картинки или вшиты в базовый образ («требует переделки») — **${redo.length}**, готовых слоёв — 0.`);
  lines.push('');
  lines.push(`Без ресурса: ${none.map((i) => `\`${i.id}\``).join(', ')}.`);
  lines.push('');
  lines.push(`Требуют переделки в слои: ${redo.map((i) => `\`${i.id}\``).join(', ')}.`);
  lines.push('');
  return lines.join('\n');
}
