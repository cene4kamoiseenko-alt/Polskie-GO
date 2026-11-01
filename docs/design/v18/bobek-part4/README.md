# Мастера четвёртой партии образов Бобека (пакет владельца 2026-11-01)

14 картинок 1254×1254 на светлом фоне (без альфа-канала), поза `wave`: джинсовая куртка и жёлтый дождевик **без худи** (куртка и худи делят слот `top`),
с красной вязаной шапкой (`beanie-red`, новая вещь каталога), кепкой, круглыми очками и рюкзаком. Конвейер вырезает фон заливкой от края
(`scripts/build-bobek-variants.mjs`, серия `bare`, `clean: 'matte'`) и ставит каждую картинку линией ног на линию wave (`snapBottom`).

| № | Файл | Набор вещей | Статус |
|---|---|---|---|
| 71 | `71_jacket-denim.webp` | джинсовая | подключён: `denim` |
| 72 | `72_jacket-denim_glasses-round.webp` | джинсовая + очки | подключён: `denim-glasses` |
| 73 | `73_jacket-denim_beanie-red.webp` | джинсовая + шапка | подключён: `denim-beanie` (шапка без помпона) |
| 74 | `74_jacket-denim_cap-red.webp` | джинсовая + кепка | подключён: `denim-cap` |
| 75 | `75_jacket-denim_backpack-green.webp` | джинсовая + рюкзак | подключён: `denim-pack`, заменил мастер 41 (худи под курткой) |
| 76 | `76_jacket-denim_beanie-red_glasses-round_backpack-green.webp` | джинсовая + шапка + очки + рюкзак | подключён: `denim-beanie-glasses-pack` |
| 78 | `78_hoodie-red_jacket-denim_cap-red_glasses-round.webp` | джинсовая + кепка + очки, **худи под курткой** | подключён: `hoodie-denim-cap-glasses` (образа без худи для этого набора нет) |
| 79 | `79_jacket-rain_glasses-round.webp` | дождевик + очки | подключён: `rain-glasses` |
| 80 | `80_jacket-rain_beanie-red.webp` | дождевик + шапка | подключён: `rain-beanie` |
| 81 | `81_jacket-rain.webp` | дождевик | подключён: `rain` |
| 82 | `82_jacket-rain_cap-red.webp` | дождевик + кепка | подключён: `rain-cap` |
| 83 | `83_jacket-rain_backpack-green.webp` | дождевик + рюкзак | подключён: `rain-pack`, заменил мастер 43 (серые заклёпки, худи под курткой) |
| 84 | `84_jacket-rain_beanie-red_glasses-round_backpack-green.webp` | дождевик + шапка + очки + рюкзак | подключён: `rain-beanie-glasses-pack` |
| held | `held/77_hoodie-red_jacket-denim_beanie-red.webp` | джинсовая + шапка, худи под курткой, шапка с помпоном | не используется: тот же набор, что 73; взят 73 (без худи, как вся семья без худи) |

Формат хранения: WebP качества 97 (в PNG по 1,6–2,1 МБ). Подробнее — `docs/BOBEK_VARIANTS.md`, раздел «Четвёртая партия».
