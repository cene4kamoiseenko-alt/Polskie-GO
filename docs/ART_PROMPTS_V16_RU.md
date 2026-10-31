# POLSKI GO — единый стиль v16: что уже готово, что перерисовать, промпты

Эталон стиля — два листа владельца от 2026-10-31 (позы, эмоции, костюмы, аксессуары, детали для анимации, примеры миссий): живописный 2.5D-мультяшный Бобек и сцены — мягкий объём, тёплый золотой свет, насыщенные цвета, чёткие края. Векторные (SVG) фоны, нарисованные кодом, владельцу не подошли и в приложение не вошли.

## 1. Уже в этом стиле — используется как есть

| Что | Где в приложении | Размер | Что сделано |
|---|---|---|---|
| Бобек: 14 поз (`wave`, `greet`, `think`, `doubt`, `correct`, `support`, `victory`, `celebrate`, `read`, `travel`, `front`, `three-quarter`, `side`, `back`) | везде, где Бобек | 512–1024 px, прозрачный фон | `wave`, `read`, `celebrate` заменены мастерами владельца 1024×1024 (тот же рисунок, кадр совпадает; раньше было 768) |
| 7 костюмов (`artist`, `barista`, `chef`, `conductor`, `dragon`, `krasnal`, `winter`) и сцены карточек | гардероб, примерка | 512 px | без изменений |
| 24 иконки разделов (`map`, `passport`, `quests`, `streak`, `zlotki`…) | главная, навигация, профиль | 256 px | без изменений |
| 24 вещи гардероба (кепки, шарфы, очки, худи…) | гардероб | 256 px | без изменений |
| Панорамы 20 городов (18 финальных, Rzeszów и Zakopane — временные) | карта, шторка города | 2:1 | см. `docs/CITY_ART_INVENTORY.md` |
| 14 фонов миссий (Żabka, Biedronka, ORLEN колонка, Rossmann, InPost, трамвай, PKP, bar mleczny, Toruń, zapiekanki, Lidl, квартира, офис, поликлиника) | экран и карточка миссии | 1440×720 | стиль верный, но **Бобек нарисован в кадре** — см. п. 2 |

## 2. Не в стиле или не годится — что сделать

| № | Что | Где сейчас | Проблема | Что сделать | Формат файла |
|---|---|---|---|---|---|
| 1 | 12 фонов миссий: `krakow-pierogi`, `orlen-coffee`, `urzad-pesel` + 9 миссий пропуска месяца | экран миссии, карточки, `/pass` | векторная SVG-сцена | **нарисовать** (промпты — п. 3) | PNG/WebP 2880×1440 (2:1), без Бобека |
| 2 | 14 фонов миссий из п. 1 таблицы выше | экран миссии | Бобек в кадре: выбранный костюм не виден, поверх нельзя положить второго Бобека; у части — дефекты (`docs/SCENE_ART_INVENTORY.md`) | **перерисовать без Бобека** (те же промпты — п. 3) | 2880×1440 |
| 3 | Обложки сезонов в `/pass` и карточка пропуска на главной | `/pass`, главная | векторная сцена | возьмём фон первой миссии сезона, когда он будет готов (`marcin-rogal`, `jarmark-oscypek`, `park-bilety`) — отдельно рисовать не нужно | — |
| 4 | Медали достижений (44 достижения, 38 значков) | «Достижения», профиль, пропуск | векторные SVG-медали | **нарисовать** набор значков в стиле иконок (золото/серебро/бронза, без текста) | PNG 512×512, прозрачный фон |
| 5 | Штампы паспорта (20 городов) | «Паспорт» | векторные SVG | **нарисовать** круглые штампы с символом города, без текста | PNG 512×512, прозрачный |
| 6 | Фоны тем уроков, обложки маршрутов в «Учиться», фоны историй | урок, «Учиться», истории | векторные SVG-сцены (магазин, кафе, квартира, вокзал…) | после фонов миссий подставлю их же по смыслу; недостающие — дорисовать по списку, который дам после | 2880×1440 |
| 7 | Шапка экрана «Задания» (силуэт города) | «Задания» | векторный силуэт | заменить фрагментом панорамы города или нарисовать баннер | 2:1 |
| 8 | Пиктограммы слов в словаре | «Словарь», уроки | векторные пиктограммы | низкий приоритет: сотни слов; можно оставить | — |
| 9 | 12 стикеров из архива (`08_BOBEK_STICKERS`) | пока нигде | 130–160 px: только для значков ≤ 50 px; без костюма пользователя | для крупного показа нужны те же позы в 1024 (п. 4) | PNG 1024×1024 |
| 10 | Ваши листы-референсы (позы, эмоции, костюмы, аксессуары, детали) | — | элементы ~100–150 px на размытом фоне, без прозрачности: вырезать нельзя без потери качества | каждый нужный элемент — отдельным файлом с прозрачным фоном | позы 1024, аксессуары/эмоции 512 |
| 11 | 6 макетов карточек и 5 макетов Premium из архива | — | 260–582 px, Бобек и текст впечатаны | только как референс; текст и статусы уже свёрстаны в React | — |

## 3. Промпты — 26 фонов миссий

Каждый фон — **отдельная картинка** 2:1. Нужен файл 2880×1440 (минимум 1774×887); приложение само уменьшит до 1440×720 и 640×320. Название файла — `slug` миссии, например `krakow-pierogi.png`. Если генератор не умеет 2:1 — делайте 3:2 (1536×1024) с запасом сверху и снизу: я обрежу до 2:1 без растягивания.

Общий блок стиля — вставлять **в начало каждого** промпта:

```
Premium 2.5D cartoon mobile-game background in the POLSKI GO style: soft painterly 3D render, warm golden-hour sunlight, vibrant saturated colors, crisp clean edges, cozy rich detail, Polish setting. Wide 2:1 landscape composition, eye-level camera. Keep the lower-right third of the frame calm and empty (floor or pavement only) — a character will be placed there later. NO beaver, NO mascot, NO animals, NO user-interface elements (no buttons, badges, XP, timers, icons), NO watermark, NO readable prices or times. Text only on the sign named below, spelled exactly.
```

Дальше — сцена (вставлять после блока стиля):

| № | slug | Сцена (что дописать к блоку стиля) |
|---|---|---|
| 1 | `zabka-first-order` | Interior of a Żabka convenience store in the evening: checkout counter with a glowing glass hot-dog roller grill, a glass fridge full of water bottles on the left, a friendly cashier woman in a green shirt behind the counter, warm street light through the window. Sign text: "Żabka". |
| 2 | `krakow-pierogi` | Inside a small pierogarnia next to the Main Square in Kraków: wooden counter with plates of golden pierogi, a cook in a white chef hat handing a plate through the kitchen pass-through window, chalkboard menu with drawings of pierogi and no prices, Bolesławiec pottery on shelves, window view of Sukiennice and St. Mary's Basilica. Sign text: "PIEROGARNIA". |
| 3 | `biedronka-breakfast` | Biedronka supermarket aisle: open refrigerated shelf with packs of parówki sausages, cheese and yogurts, yellow price tags without numbers, a shopping cart in the left foreground, bright store lighting. Sign text: "Biedronka". |
| 4 | `orlen-coffee` | Stop Cafe coffee counter inside an ORLEN petrol station shop: espresso machine with steam, stacks of take-away cups, a cashier in a red uniform handing a coffee cup, menu lightboxes with coffee pictures and no prices, big window showing fuel pumps under the red canopy and a road. Sign text: "Stop Cafe". |
| 5 | `orlen-pump` | ORLEN petrol station forecourt on a sunny day: red and white fuel pumps under the canopy, one pump clearly marked with the number 3, a car next to it with its fuel door open, the station shop entrance with glass doors in the background. Sign text: "ORLEN". |
| 6 | `paczkomat` | A complete yellow InPost parcel locker on a city street, fully in frame and not cropped: touch screen with an empty code-entry field, one locker door open with a cardboard parcel inside, pavement and colorful tenement houses behind. Sign text: "InPost". |
| 7 | `first-tram` | Tram stop in Wrocław: glass shelter, a ticket vending machine, an arrival display with dots instead of readable times, a modern blue-and-white tram arriving, Wrocław old-town tenements and the Gothic town hall in the background. No sign text. |
| 8 | `train-wroclaw` | Ticket office hall at Warszawa Centralna: a ticket window with a cashier behind glass handing a ticket, a departure board with dots instead of readable times, a platform with a train visible through the big glass wall. Sign text: "Kasa biletowa". |
| 9 | `bar-mleczny` | Polish milk bar (bar mleczny) interior: serving window with a smiling older cook in a white apron handing a bowl of soup, trays with plates of soup and pierogi, menu board without prices, simple tables and chairs, lace curtain on the window. Sign text: "Bar mleczny". |
| 10 | `torun-bakery` | Bakery-confectionery in Toruń: glass display case full of heart-shaped gingerbread pierniki with white icing and fresh buns, a saleswoman behind the counter holding a paper bag, shelves with gingerbread tins, red-brick Gothic old town through the window. Sign text: "Pierniki". |
| 11 | `kazimierz-zapiekanka` | Plac Nowy in Kraków's Kazimierz district in the evening: the round market pavilion (Okrąglak) with small takeaway windows selling zapiekanki under striped awnings, a vendor handing a long zapiekanka, string lights, a few people queuing seen from behind (no close-up faces). Sign text: "Zapiekanki". |
| 12 | `lidl-list` | Lidl store: self-checkout kiosks with a touch screen and a barcode scanner, a shopping basket with bread, milk, apples and eggs on the bagging area, a paper shopping list, shelves in the background. Sign text: "Lidl". |
| 13 | `rossmann-basics` | Rossmann drugstore aisle: shelves with shower gels, shampoos and toothpaste, a red shopping basket in the foreground. Aisle signs without text. Sign text: "ROSSMANN". |
| 14 | `urzad-pesel` | Polish city office (urząd) customer service hall: service windows numbered 1, 2, 3; a clerk woman behind glass at window 2, an application form and a pen on the counter, a queue ticket machine, waiting chairs, a Polish flag. Not a facade, not a square. Sign text: "Urząd Miasta". |
| 15 | `landlord` | Bright living room of a rented flat: keys on the coffee table, utility meters on the hallway wall, the landlady standing at the door holding folders, sofa and plants, sunlight through the window. No sign text. |
| 16 | `first-workday` | First day at work in an office in Wrocław: reception desk with a visitor badge on a lanyard, metal lockers, a female manager pointing the way down the corridor, Wrocław rooftops through the window (not Warsaw). Sign text: "Recepcja". |
| 17 | `doctor-appointment` | Clinic registration desk (not a pharmacy): reception window with a registrar in teal scrubs, a wall appointment calendar with colored marks and no readable dates, a waiting bench, plants. Sign text: "Rejestracja". |
| 18 | `marcin-rogal` | Pastry shop in Poznań on 11 November: display case with large St. Martin's croissants (rogale świętomarcińskie) with white glaze and chopped nuts, a saleswoman behind the counter, white-and-red bunting, autumn evening outside with Polish flags on the houses. Sign text: "Cukiernia". |
| 19 | `listopad-swieto` | Courtyard of an old tenement house in Poznań on Independence Day: a neighbour on a balcony with a white-and-red Polish flag, November trees with orange leaves, cobblestones, through the gate arch a street with flags. No sign text. |
| 20 | `andrzejki-wosk` | Cozy room on Andrzejki evening: bowl of cold water, a big old key, a lit candle, the shadow of a wax figure on the wall, a girlfriend sitting at the table smiling, warm candlelight, night through the window. No sign text. |
| 21 | `jarmark-oscypek` | Christmas market on Rynek Główny in Kraków at night: wooden market hut with a grill of smoked oscypek cheeses and jars of cranberry jam, a vendor in a winter hat, string lights, snow falling, St. Mary's Basilica covered in snow behind. Sign text: "Oscypki". |
| 22 | `wigilia-kolacja` | Polish Christmas Eve (Wigilia) dinner table: white tablecloth, opłatek wafer on a plate, red barszcz with uszka dumplings, carp on a platter, one empty extra place setting, Christmas tree with lights, the first star in the window. No sign text. |
| 23 | `sylwester-impreza` | New Year's Eve party in a flat with a big window over the night city: colorful fireworks outside, a wall clock near midnight without numbers, streamers and balloons, glasses of orange juice on the table. No sign text. |
| 24 | `park-bilety` | Entrance of a big amusement park in summer (generic, no park logos): ticket booths with windows, turnstiles, a roller coaster and a Ferris wheel in the distance, colorful bunting. Sign text: "Bilety". |
| 25 | `park-kolejka` | Queue area of a roller coaster: zig-zag queue railings, a height-check measuring stick at the entrance without numbers, lockers for backpacks, coaster cars passing overhead, people queuing seen from behind. No sign text. |
| 26 | `park-zguba` | Amusement park information point: counter with a staff woman holding a found smartphone, a lost-and-found box, a park map on the wall without readable text, the entrance nearby with a Ferris wheel visible outside. Sign text: "Informacja". |

Порядок: сначала 1–3 из списка владельца (`krakow-pierogi`, `orlen-coffee`, `urzad-pesel`), потом остальные базовые, потом сезоны (ноябрь → декабрь → июль).

## 4. Промпты — позы Бобека (для крупного показа и анимации)

Общий блок — в начало каждого:

```
The POLSKI GO beaver mascot "Bobek", exactly the same character as the reference: soft orange-brown fur, cream muzzle, big shiny dark eyes, pink cheeks and inner ears, exactly two front teeth, red hoodie with a white "PL" on the chest, dark green travel backpack, wide flat beaver tail with a cross-hatch texture. Same head and paw proportions in every pose. Premium 2.5D cartoon, soft painterly 3D render, crisp edges. Full body including feet and tail, not cropped, centered, on a fully transparent background, 1024×1024 PNG. No text, no shadow on the ground.
```

Есть в приложении: машет (`wave`), радуется (`celebrate`, `victory`), с книгой (`read`), думает (`think`), сомневается (`doubt`), поддерживает (`support`), путешествует с картой (`travel`, `greet`). **Нужны новые:**

| Поза (файл) | Что дописать |
|---|---|
| `coffee` | holding a take-away coffee cup in one paw, happy |
| `checkout` | paying at a shop counter, holding a bank card out with one paw |
| `parcel` | carrying a cardboard parcel with both paws |
| `teach` | explaining, pointing up with one finger, a small light bulb above the head |
| `surprised` | surprised face, mouth open, paws raised |
| `tired` | sleepy, eyes half closed, yawning |
| `reward` | holding a golden trophy cup up proudly |
| `map` | holding an open paper map with both paws, looking at it |
| `laptop` | sitting and typing on a laptop |
| `heart` | hugging a red heart |
| `cool` | wearing sunglasses, thumbs up |
| `sleep` | sleeping on a pillow |

## 5. Для смены костюмов на всех позах (анимация и гардероб)

Целая поза одной картинкой не позволяет переодевать Бобека. Для гардероба нужен набор **деталей на общем холсте 1024×1024 в одной позиции**: голова, тело без одежды, левая и правая лапы, ноги, хвост, рюкзак, худи, отдельно варианты глаз и рта (как в разделе «Детали для анимации» вашего листа). Каждая деталь — отдельный PNG с прозрачным фоном, лежит ровно на своём месте холста (не обрезана по краю детали). Для каждой вещи гардероба — такой же слой на том же холсте. Сейчас прототип есть на 5 позах (`apps/web/src/dev/look-proto`), в продакшене — целые позы.

## 6. Как прислать

Архивом в чат: фоны — `<slug>.png` (п. 3), позы — `<поза>.png` (п. 4), детали — `<деталь>.png` (п. 5). Я проверю размер и прозрачность, уменьшу до размеров доставки (без увеличения), подключу по `slug` и обновлю статусы и документы (`packages/shared/src/sceneArt.ts`, `docs/SCENE_ART_INVENTORY.md`, `docs/UNFINISHED_ASSETS.md`).
