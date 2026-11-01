# Мастера третьей партии образов Бобека (пакет владельца 2026-11-01)

6 картинок 1254×1254 на светлом фоне (RGB, без прозрачности), поза «машет с картой», кепка с надписью PL. Конвейер вырезает фон и тень
(`scripts/build-bobek-variants.mjs`, серия `refresh`). Кадрирование у каждой картинки своё, поэтому каждая ставится по рамке образа-аналога
(`LIKE` в конвейере): 51 ← 42, 52 ← 16, 53 ← 54, 54 ← 14, 55 ← 44.

| № | Файл | Статус |
|---|---|---|
| 51 | `51_hoodie-red_jacket-denim_cap-red_glasses-round_backpack-green.webp` | подключён: `hoodie-denim-cap-glasses-pack` (с кепкой PL, заменил мастер 42) |
| 52 | `52_hoodie-red_cap-red_glasses-round_scarf-pl_backpack-green.webp` | подключён: `hoodie-cap-glasses-scarf-pack` (заменил мастер 16) |
| 53 | `53_hoodie-red_jacket-rain_cap-red_glasses-round_backpack-green.webp` | подключён: `hoodie-rain-cap-glasses-pack` (новое сочетание) |
| 54 | `54_hoodie-red_cap-red_glasses-round_backpack-green.webp` | подключён: `hoodie-cap-glasses-pack` (заменил мастер 14) |
| 55 | `55_hoodie-red_jacket-rain_glasses-round_backpack-green.webp` | подключён: `hoodie-rain-glasses-pack` (заменил мастер 44) |
| held | `02_alt_jacket-denim_cap_glasses_b.webp` | второй вариант 51; не используется |

Формат хранения: WebP качества 97. Подробнее — `docs/BOBEK_VARIANTS.md`, раздел «Третья партия».
