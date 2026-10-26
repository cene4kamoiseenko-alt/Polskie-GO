# Фоны городов — инвентарь

Состояние на 2026-10-26 (V9, этап 5). Источник правды в коде — `CITY_ART` в `packages/shared/src/cityArt.ts`; тест `apps/server/test/city-art.test.ts` сверяет его с 20 городами seed, с файлами и с этим документом.

Статусы:

- **final** — финальная иллюстрация.
- **interim** — временный кадр с доски владельца: фрагмент панели без Бобека и подписи, увеличенный Real-ESRGAN ×4. Узнаваем, но детализация ниже мастер-файла. Заменяется мастером без правок кода (см. «Как заменить»).
- **missing** — файла нет. Клиент рисует общую векторную сцену, а в шторке города пишет «Оформление: скоро». Отсутствие файла не выдаётся за готовую графику.

Итог: **3 final, 15 interim, 2 missing** (Gorzów, Gdynia — их нет на досках владельца).

## Таблица

Файлы лежат в `apps/web/src/assets/cities/`. Варианты — основной `<slug>.webp` и `<slug>@640.webp` (640 px по ширине) для миниатюр и `srcset`. Вес — основной / 640.

| slug | Исходник | Варианты | Размер | Вес, КБ | Источник / права | Статус | Что изображено; чего нет |
|---|---|---|---|---|---|---|---|
| `warszawa` | архив владельца | webp, @640 | 1440×720 | 140 / 38 | владелец проекта | final | Старый город, Замковая площадь, колонна Сигизмунда |
| `lodz` | доска 1, панель «Łódź» | webp, @640 | 984×512 | 55 / 33 | владелец; апскейл BSD-3 | interim | Manufaktura: фасад с вывеской, памятник; нет Piotrkowska |
| `krakow` | архив владельца | webp, @640 | 1440×720 | 194 / 52 | владелец проекта | final | Rynek, Sukiennice, Mariacki |
| `katowice` | доска 1, «Katowice» | webp, @640 | 1176×488 | 49 / 24 | владелец; апскейл BSD-3 | interim | Spodek на фоне высоток |
| `opole` | доска 1, «Opole» | webp, @640 | 1024×520 | 56 / 33 | владелец; апскейл BSD-3 | interim | Ратуша, каменицы, мост над Одрой |
| `wroclaw` | архив владельца | webp, @640 | 1440×720 | 168 / 49 | владелец проекта | final | Остров Тумский: собор, Тумский мост, гномик; нет Rynek |
| `poznan` | доска 1, «Poznań» | webp, @640 | 1200×456 | 48 / 23 | владелец; апскейл BSD-3 | interim | Ратуша и каменицы Старого Рынка; козлики не различимы |
| `zielona-gora` | доска 2, «Zielona Góra» | webp, @640 | 1472×660 | 114 / 46 | владелец; апскейл BSD-3 | interim | Ратуша с башней, площадь, виноградная лоза |
| `gorzow` | — | — | — | — | — | missing | Нужны Варта и центр города (промпт ниже) |
| `szczecin` | доска 1, «Szczecin» | webp, @640 | 776×504 | 45 / 35 | владелец; апскейл BSD-3 | interim | Wały Chrobrego над Одрой, корабли; самый узкий кадр |
| `gdansk` | доска 1, «Gdańsk» | webp, @640 | 896×576 | 46 / 32 | владелец; апскейл BSD-3 | interim | Żuraw над Мотлавой |
| `gdynia` | — | — | — | — | — | missing | Нужен порт (промпт ниже) |
| `bydgoszcz` | доска 2, «Bydgoszcz» | webp, @640 | 1620×668 | 140 / 49 | владелец; апскейл BSD-3 | interim | Фахверковые зернохранилища над Брдой, теплоход |
| `torun` | доска 2, «Toruń» | webp, @640 | 1448×668 | 92 / 37 | владелец; апскейл BSD-3 | interim | Готический Старый город над Вислой, ратуша |
| `olsztyn` | доска 2, «Olsztyn» | webp, @640 | 1480×660 | 94 / 36 | владелец; апскейл BSD-3 | interim | Замок вармийского капитула, озеро с парусами |
| `bialystok` | доска 2, «Białystok» | webp, @640 | 1440×668 | 96 / 40 | владелец; апскейл BSD-3 | interim | Архикафедральный собор и белая башня; **нет дворца Браницких** |
| `lublin` | доска 1, «Lublin» | webp, @640 | 1000×448 | 42 / 25 | владелец; апскейл BSD-3 | interim | Люблинский замок (неоготический фасад с воротами) |
| `rzeszow` | доска 2, «Rzeszów» | webp, @640 | 1460×668 | 114 / 46 | владелец; апскейл BSD-3 | interim | Rynek с ратушей и зонтиками кафе |
| `kielce` | доска 2, «Kielce» | webp, @640 | 1560×660 | 96 / 35 | владелец; апскейл BSD-3 | interim | Дворец краковских епископов |
| `zakopane` | доска 2, «Zakopane» | webp, @640 | 1640×688 | 136 / 48 | владелец; апскейл BSD-3 | interim | Татры, деревянные дома в снегу |

Права:

- **Архив владельца** — панорамы из архива проверки владельца (коммит `4cfc451`), WebP q74.
- **Доски** — `docs/design/a8/city-backgrounds-1.webp` и `-2.webp` (сжатые копии). Оригиналы PNG 1448×1086 пришли в сообщении владельца. Это иллюстрации владельца проекта.
- **Апскейлер** — Real-ESRGAN, модель в ONNX `TheGuy444/Real-ESRGAN-ONNX`, лицензия BSD-3-Clause. Платные сервисы генерации не использовались.

Стиль: три `final` — более «живописные» в золотом часе; кадры досок ярче и мультяшнее. Единый стиль будет после замены `interim` мастер-файлами в стиле досок или после перерисовки трёх `final`.

## Где используются

`cityArtImage(slug)` (`apps/web/src/lib/assets.ts`) отдаёт `src` и `srcSet` (640 и основной файл). Нет файла → общая векторная сцена.

| Место | Компонент | Высота, px | Загрузка |
|---|---|---|---|
| Главная, герой текущего города | `CityHero` | 256 | `eager` (первый экран) |
| Главная, «Город дня» | `CityHero` | 150 | `lazy`, `sizes=55vw` |
| Главная, плитки быстрого старта | `<img>` | 142 | `lazy`, только @640 |
| Уроки, баннер города | `CityHero` | 176 | `eager` |
| Карта, миниатюра текущего города | `CityBanner` | 56 | `lazy`, `sizes=80px` → @640 |
| Карта, шторка города | `CityBanner` | 140 | `lazy` |
| Паспорт, штамп города | `CityBanner` | 140 | `lazy` |
| Урок, сцена (`LessonStage`) | `CityBanner` | 176 | `lazy` |
| Профиль, «Друзья» | `CityHero` | 150–268 | `lazy`; Kraków — по умолчанию |

При запуске файлы городов не грузятся: `import.meta.glob` даёт только URL. Картинка запрашивается, когда её `<img>` попадает на экран.

## Как сделаны interim-кадры

1. Панель города вырезается из доски (координаты на оригинале 1448×1086):
   - доска 1: столбцы (13–716), (732–1435); строки (90–281), (289–479), (487–675), (683–856), (864–1062). Города по строкам: warszawa/krakow, wroclaw/lodz, gdansk/poznan, szczecin/lublin, katowice/opole.
   - доска 2: столбцы (12–716), (731–1435); строки (114–293), (303–482), (493–670), (682–861), (871–1057). Города: bialystok/torun, rzeszow/kielce, olsztyn/zielona-gora, bydgoszcz/czestochowa, zakopane/gliwice. Częstochowa и Gliwice не входят в маршрут.
2. Внутри панели берётся кадр без Бобека и плашки с названием. Ориентир — в центре кадра, потому что баннеры обрезают по центру (`object-cover`). Кадры (x0, y0, x1, y1 в координатах панели):

   | Город | Кадр |
   |---|---|
   | lodz | 450, 22, 696, 150 |
   | katowice | 316, 4, 610, 126 |
   | opole | 440, 6, 696, 136 |
   | szczecin | 502, 6, 696, 132 |
   | lublin | 380, 4, 630, 116 |
   | gdansk | 472, 6, 696, 150 |
   | poznan | 330, 4, 630, 118 |
   | bialystok | 300, 6, 660, 173 |
   | torun | 330, 6, 692, 173 |
   | rzeszow | 300, 6, 665, 173 |
   | kielce | 290, 6, 680, 171 |
   | olsztyn | 290, 6, 660, 171 |
   | zielona-gora | 312, 6, 680, 171 |
   | bydgoszcz | 275, 6, 680, 173 |
   | zakopane | 280, 6, 690, 178 |

3. Real-ESRGAN ×4 тайлами 128 px с перекрытием 12 px (onnxruntime, CPU) → WebP q76; вариант 640 px — Lanczos, WebP q76.
4. Проверка: лист «как в приложении» (главная 1.5:1 и баннер 2.6:1) для каждого города. Ориентир узнаётся в обоих.

Ограничение: у Szczecin, Gdańsk, Lublin, Łódź исходный кадр меньше 260 px по ширине. На экране 3× DPR браузер дополнительно увеличивает их примерно в 1.5 раза. Это видно на крупном плане, поэтому кадры остаются `interim`.

## Как заменить на мастер-файл

1. Мастер: не меньше 2880×1440 (2:1), PNG или WebP без потерь.
2. Положить в `apps/web/src/assets/cities/<slug>.webp`, уменьшив до 1440×720, WebP q74–76. Рядом — `<slug>@640.webp`.
3. В `CITY_ART` поставить `status: 'final'`, `width`, `height`, обновить `shows`; убрать `gap`, если ориентир теперь есть.
4. Обновить строку таблицы выше. `npm test` проверит размер, вес (основной ≤ 220 КБ, @640 ≤ 60 КБ) и статус.

## Требования к недостающим и слабым кадрам

Общие для всех:

- Формат 2:1, мастер ≥ 2880×1440. Без текста, логотипов, вывесок с брендами, водяных знаков.
- Без Бобека и людей крупным планом: персонажа приложение рисует отдельно.
- Ориентир — в центральных 60 % ширины, от 15 до 85 % высоты. Баннеры режут кадр от 1.5:1 до 2.6:1 по центру.
- Левая нижняя треть — спокойный передний план (мостовая, вода, трава): там стоит Бобек на главной.
- Стиль досок `city-backgrounds`: яркая мультяшная живопись, тёплый закатный свет, мягкие контуры, насыщенное небо с облаками.
- Реальное место узнаётся по силуэту. Не рисовать «условный европейский город».

### gorzow

Gorzów Wielkopolski: Варта и центр города.

> Wide 2:1 cartoon painterly illustration, warm golden-hour light, vivid saturated colours, soft outlines, in the style of a cheerful travel-game city card. Gorzów Wielkopolski, Poland: the Warta river embankment (Bulwar Nadwarciański) with the riverside promenade in the foreground, the red-brick Gothic Cathedral of the Assumption with its massive square tower in the centre, old townhouses of the city centre behind it, the old railway bridge viaduct on the side, a few small boats on the river, trees and street lamps. No text, no logos, no people in close-up, no characters. Calm empty promenade in the lower-left third.

### gdynia

Gdynia: порт.

> Wide 2:1 cartoon painterly illustration, warm golden-hour light, vivid saturated colours, soft outlines, in the style of a cheerful travel-game city card. Gdynia, Poland: the sea harbour seen from the Southern Pier (Molo Południowe) — the white three-masted sailing ship "Dar Pomorza" moored at the quay in the centre, the grey museum destroyer next to it, the modernist Sea Towers skyscraper and port cranes in the background, the Baltic Sea and seagulls. No text, no logos, no flags with readable text, no characters. Calm empty quay in the lower-left third.

### bialystok

Нужен кадр с дворцом Браницких. Сейчас `interim` показывает собор.

> Wide 2:1 cartoon painterly illustration, warm golden-hour light, vivid saturated colours, soft outlines, in the style of a cheerful travel-game city card. Białystok, Poland: the white baroque Branicki Palace ("Polish Versailles") seen from its French garden — symmetrical white facade with a central tower and griffin gate, trimmed hedges, fountains and flower beds in the foreground. No text, no logos, no characters. Calm garden path in the lower-left third.
