# Незавершённые ассеты — точный перечень

Файл создаётся командой `node --import tsx scripts/unfinished-assets.ts` из кода и манифестов (`scripts/lib/unfinished-assets.ts`); вручную не правится. `apps/server/test/unfinished-assets.test.ts` падает, если документ разошёлся с `CITY_ART`, `SCENE_ART`, манифестами бота и гардероба.

Итого: **2** городских фонов, **5** сцен бота, **14** сцен миссий с Бобеком в кадре (нужны версии без Бобека), **17** фонов миссий без Бобека (готовых нет), **26** слоёв Бобека для двух этапов, **23** вещей гардероба без ресурса. Ничего из этого не подменено случайной картинкой: приложение и бот честно показывают «в подготовке» или нейтральный кадр.

## 1. Фоны городов: 2 временных (interim)

Общие требования: отдельный оригинал одного города (не коллаж, не увеличенная вырезка) — ≥ 1536×1024 (3:2) или ≥ 1774×887 (2:1), лучше 2880×1440; PNG или WebP без потерь; без текста, логотипов, Бобека и людей крупным планом; ориентир — в центральных 60 % ширины; левая нижняя треть — спокойный передний план; стиль «Premium 2.5D cartoon travel-game environment, cinematic golden-hour lighting, colorful Polish architecture, high detail, vibrant colors, crisp edges». Как подключить мастер — `docs/CITY_ART_INVENTORY.md`, «Как заменить на мастер-файл».

Приоритет: 1 — рисовать первым (порядок маршрута: раньше город — раньше его видят игроки). Промпты для ChatGPT — `docs/CHATGPT_ART_PROMPTS_RU.md`, пакет A. Ни один кадр не увеличивается до нужного размера: пока мастера нет, город остаётся interim.

| № | city_id | Город | Приоритет | Сейчас в приложении | Проверка текущего кадра | Что нарисовать | Куда положить мастер |
|---|---|---|---|---|---|---|---|
| 1 | `rzeszow` | Жешув | 4 | 1460×668, interim: Rynek з ратушею і парасольками кав’ярень | Rynek с ратушей и зонтами совпадает (условно); фонтана и дворца Любомирских нет. 1460×668. | Rynek с ратушей и фонтаном, зонтики кафе, дворец Любомирских на заднем плане. | `docs/design/a10/cities/city-rzeszow.webp` |
| 2 | `zakopane` | Закопане | 6 | 1640×688, interim: Татри, дерев’яні будинки в снігу | Татры и деревянные дома совпадают; Гевонт не узнаётся, Krupówki и фуникулёра нет. 1640×688, детали 0,42 (на грани увеличения). | Гора Гевонт, деревянные виллы в стиле закопане, улица Krupówki, фуникулёр на Губалувку; снег и золотой час. | `docs/design/a10/cities/city-zakopane.webp` |

## 2. Сцены бота: 5 недостающих

Пока исходника нет, бот шлёт нейтральные кадры `commands/*` (они существуют, резкие, без размытых полос; `apps/server/test/bot-image-fallback.test.ts` проверяет это) и не ссылается на несуществующие файлы. Файлы кладутся в `apps/web/public/bot/`: JPEG 1280×720 и `@640` 640×360 (`node scripts/build-bot-images.mjs`, проверка — `npm run assets`). Мастер от 1920×1080. На картинках не должно быть живых данных: чисел XP, серии, названий городов, штампов, образцов вопросов.

| № | scene | Где нужна | Файлы | Почему нет | Что нарисовать |
|---|---|---|---|---|---|
| 1 | `map` | /map | `scenes/ru/map.jpg`<br>`scenes/neutral/map.jpg` | нет исходника: в комплекте 2026-10-27 нет доски карты; ru/map.jpg снят как мыльный, остаётся commands/map.jpg (резкий, без карты) | Бобек в красной толстовке с рюкзаком держит развёрнутую бумажную карту Польши с метками городов на площади Старого города в золотой час. Горы, море и города узнаваемы по силуэтам. Без текста; в ru-версии заголовок «КАРТА» в стиле досок a10. |
| 2 | `correct_answer` | /quiz (правильный ответ) | `scenes/neutral/correct-answer.jpg`<br>`scenes/ru/correct-answer.jpg` | доска tg-correct-answer.webp содержит «+20 XP», а QUIZ_XP = 10 | Зелёная галочка в круге, конфетти, радостный Бобек. Без таблички «+N XP»: сумма всегда из QUIZ_XP в тексте. |
| 3 | `quick_question` | /quiz (приглашение) | `scenes/neutral/quick-question.jpg`<br>`scenes/ru/quick-question.jpg` | доска tg-quick-question.webp содержит образец вопроса «Jak się nazywa ten sklep?» с вариантами: рядом с настоящим вопросом он вводит в заблуждение | Секундомер, вопросительные знаки, лампочка, задумчивый Бобек. Без образца вопроса и вариантов ответа. |
| 4 | `travel_passport` | нет команды в боте | `scenes/neutral/passport.jpg` | доска tg-travel-passport.webp содержит фиксированные штампы Warszawa, Kraków, Wrocław, Gdańsk, Poznań, Zakopane: выглядят как полученные; потребителя в боте нет | Раскрытый паспорт путешественника с пустыми местами под штампы, глобус, открытки; без названий городов. Штампы пользователя отрисовывать в Mini App по данным. |
| 5 | `lesson_complete` | нет сообщения в боте | `scenes/neutral/lesson-complete.jpg` | доска tg-lesson-complete.webp содержит «+15 XP» и карточку «WARSZAWA»: не совпадает с наградой урока (20 XP + 5 за верное + 10 за идеал) | Бобек со звездой и свитком, конфетти. Без числа XP и без названия города. |

## 3. Сцены миссий: 14 временных кадров с Бобеком внутри, нужны мастера без Бобека

Подробности, дефекты кадров и способ замены — `docs/SCENE_ART_INVENTORY.md`. Мастер: 2:1 ≥ 2880×1440 и 16:9 ≥ 1920×1080, тот же свет и архитектура, **без Бобека**; Бобека рисует отдельный рендерер образа. После замены в `SCENE_ART`: `bakedBobek: false`, `status: 'final'`, реальный `native`, пустой `defects`.

| № | scene_id | Место | Файл в приложении | Рождённый размер | Дефекты кадра |
|---|---|---|---|---|---|
| 1 | `store-zabka` | Żabka | `apps/web/src/assets/scenes/zabka.webp` | 632×316 | у лапі кава й табличка «Gorąca kawa», а в місії Бобек замовляє хот-дог і воду |
| 2 | `store-biedronka` | Biedronka | `apps/web/src/assets/scenes/biedronka.webp` | 632×316 | нет |
| 3 | `store-rossmann` | Rossmann | `apps/web/src/assets/scenes/rossmann.webp` | 550×275 | написи «KOSMETYKI» і «HIGIENA» над стелажами перекручені (читаються як «HIGIEŃYIE»), червона табличка за ними нечитабельна |
| 4 | `parcel-inpost` | InPost | `apps/web/src/assets/scenes/inpost.webp` | 550×275 | панель справа обрізана: слова «Szybko», «Wygodnie» не вміщаються в кадр |
| 5 | `fuel-orlen` | ORLEN | `apps/web/src/assets/scenes/orlen.webp` | 644×322 | для місії orlen-coffee не підходить: Бобек заправляє авто, а не купує каву |
| 6 | `clinic-registration` | Przychodnia | `apps/web/src/assets/scenes/przychodnia.webp` | 1536×768 | нет |
| 7 | `office-first-day` | Biuro | `apps/web/src/assets/scenes/biuro.webp` | 1536×768 | за вікном Варшава (Палац культури, колона Сигізмунда), а місія — у Вроцлаві; руку Бобекові тисне колега-чоловік, а зустрічає його в місії керівниця Pani Agnieszka |
| 8 | `street-zapiekanki` | Zapiekanki | `apps/web/src/assets/scenes/zapiekanki.webp` | 1536×768 | на тлі Ринок і Маріацький костел, а місія — на Plac Nowy (Казімєж) |
| 9 | `flat-keys` | Mieszkanie | `apps/web/src/assets/scenes/mieszkanie.webp` | 1536×768 | нет |
| 10 | `bakery-pierniki` | Pierniki | `apps/web/src/assets/scenes/pierniki.webp` | 1536×768 | нет |
| 11 | `milk-bar` | Bar mleczny | `apps/web/src/assets/scenes/bar-mleczny.webp` | 1672×836 | нет |
| 12 | `station-pkp` | PKP | `apps/web/src/assets/scenes/pkp.webp` | 1536×768 | над перонами табличка WROCŁAW і вроцлавська готика, а Бобек у місії купує квиток на Warszawa Centralna |
| 13 | `store-lidl` | Lidl | `apps/web/src/assets/scenes/lidl.webp` | 1536×768 | Бобек біля входу, а в місії він платить на касі самообслуговування |
| 14 | `tram-stop` | Tramwaj | `apps/web/src/assets/scenes/tramwaj.webp` | 1536×768 | нет |

### Фоны всех миссий: 17 (17 активных + 0 «скоро»), готовых нет

Экран миссии собирается из трёх слоёв: **фон** (этот список) + **Бобек в выбранном образе** (накладывается справа внизу, ~30 % ширины) + **интерфейс** (кнопка «закрыть» слева вверху, текст под кадром). Поэтому на фоне: показано действие игрока, правый нижний угол свободен, **Бобека нет**, текста нет, кроме настоящих вывесок заведения. Формат как у магазинов: 2:1 ≥ 2880×1440. Источник — `MISSION_BACKGROUND_BRIEF` в `packages/shared/src/sceneArt.ts`.

| № | mission.slug | Миссия | Сейчас | Действие игрока | Что нарисовать (без Бобека) |
|---|---|---|---|---|---|
| 1 | `zabka-first-order` | Первый заказ в Żabce | store-zabka (interim, Бобек в кадре) | заказывает хот-дог и воду у кассы | Интерьер Żabki: касса с гриль-витриной хот-догов, холодильник с водой, кассирша за прилавком; вечерний свет с улицы. |
| 2 | `krakow-pierogi` | Pierogi в Кракове | SVG «cafe-pierogi» | заказывает pierogi в pierogarni | Маленькая pierogarnia у Рынка в Кракове: прилавок с тарелками pierogów, меню-доска без читаемых цен, повар в окне выдачи. |
| 3 | `biedronka-breakfast` | Завтрак из Biedronki | store-biedronka (interim, Бобек в кадре) | ищет parówki и сравнивает цены за килограмм | Зал Biedronki: холодильная полка с parówkami и сыром, ценники без цифр, тележка на переднем плане слева. |
| 4 | `orlen-coffee` | Кофе на ORLEN | SVG «petrol-station» | покупает кофе с собой в Stop Cafe | Стойка Stop Cafe внутри станции ORLEN: кофемашина, стаканчики навынос, кассир; за окном колонки и дорога на Гданьск. |
| 5 | `orlen-pump` | Колонка номер три | fuel-orlen (interim, Бобек в кадре) | заправил машину на колонке № 3 и идёт платить | Колонки ORLEN, на одной заметен номер 3, машина с открытым лючком; вход в кассу на заднем плане. |
| 6 | `paczkomat` | Посылка ждёт | parcel-inpost (interim, Бобек в кадре) | забирает посылку из ячейки по коду | Paczkomat InPost целиком в кадре: экран с полем кода, одна открытая ячейка с коробкой; без обрезанных надписей. |
| 7 | `first-tram` | Первый трамвай | tram-stop (interim, Бобек в кадре) | покупает билет в автомате на трамвайной остановке во Вроцлаве | Остановка во Вроцлаве: билетный автомат, табло прибытия без читаемого времени, подъезжает сине-белый трамвай. |
| 8 | `train-wroclaw` | Билет до Вроцлава | station-pkp (interim, Бобек в кадре) | покупает билет до Вроцлава в кассе вокзала | Касса Warszawa Centralna: окошко с кассиршей, табло отправлений без читаемых часов, перрон за стеклом. |
| 9 | `bar-mleczny` | Обед в молочном баре | milk-bar (interim, Бобек в кадре) | заказывает обед в молочном баре | Bar mleczny: окно выдачи, подносы, тарелки с супом и pierogami, меню-доска без цен; простые столы. |
| 10 | `torun-bakery` | Утро в пекарне | bakery-pierniki (interim, Бобек в кадре) | покупает пряники и булочки в пекарне Торуня | Пекарня-кондитерская в Торуне: витрина с piernikami и булками, продавщица за прилавком, кирпичная готика за окном. |
| 11 | `kazimierz-zapiekanka` | Вечер на Казимеже | street-zapiekanki (interim, Бобек в кадре) | заказывает zapiekankę на Plac Nowy | Окошко с zapiekankami на Plac Nowy в Кракове вечером: круглый павильон, гирлянды, очередь без лиц крупным планом. |
| 12 | `lidl-list` | Список покупок в Lidlе | store-lidl (interim, Бобек в кадре) | покупает продукты по списку и платит на кассе самообслуживания | Lidl: касса самообслуживания с экраном и сканером, корзина с продуктами из списка; полки на заднем плане. |
| 13 | `rossmann-basics` | Rossmann: самое нужное | store-rossmann (interim, Бобек в кадре) | покупает средства гигиены после переезда | Зал Rossmann: полки с гелями, зубной пастой, шампунями; вывески отделов написаны правильно или без текста. |
| 14 | `urzad-pesel` | Первый визит в urząd | SVG «office» | подаёт документы на PESEL сотруднице в окошке | Urząd: окошко обслуживания с сотрудницей, талон очереди в автомате, бланк заявления на стойке; не городская площадь и не фасад. |
| 15 | `landlord` | Разговор с хозяйкой квартиры | flat-keys (interim, Бобек в кадре) | разговаривает с хозяйкой о квартире | Гостиная съёмной квартиры: ключи на столе, счётчики в коридоре, хозяйка с папками у двери. |
| 16 | `first-workday` | Первый день на работе | office-first-day (interim, Бобек в кадре) | первый день на работе | Офис или склад: стойка ресепшена, бейдж и шкафчик для вещей, коллега показывает дорогу. |
| 17 | `doctor-appointment` | Запись к врачу | clinic-registration (interim, Бобек в кадре) | записывается к врачу в регистратуре | Регистратура поликлиники: окошко, календарь записи без читаемых дат, скамейка ожидания; не аптека. |

## 4. Слои Бобека (единый рендерер, ADR-005)

Список строит `missingForMilestone` из манифеста образа. Слои — живописные PNG/WebP на общем холсте 1024 с якорями; делает владелец или Opus по листам эталона. Пока слоёв нет, вещи не рисуются и не продаются (`visual_pending`).

### etalon-1: 18 частей

| № | Владелец | Часть | Слот | Ракурс | Поза | Необязательно |
|---|---|---|---|---|---|---|
| 1 | `base` | `shadow` | base | front | * | нет |
| 2 | `base` | `tail` | base | front | * | нет |
| 3 | `base` | `legs` | base | front | front-idle | нет |
| 4 | `base` | `legs` | base | front | front-wave | нет |
| 5 | `base` | `torso` | base | front | front-idle | нет |
| 6 | `base` | `torso` | base | front | front-wave | нет |
| 7 | `base` | `ears` | base | front | * | нет |
| 8 | `base` | `head` | base | front | * | нет |
| 9 | `base` | `tuft` | base | front | * | нет |
| 10 | `base` | `face` | base | front | front-idle | нет |
| 11 | `base` | `face` | base | front | front-wave | нет |
| 12 | `hoodie-red` | `torso` | top | front | front-idle | нет |
| 13 | `hoodie-red` | `torso` | top | front | front-wave | нет |
| 14 | `cap-red` | `hat` | headwear | front | * | нет |
| 15 | `backpack-travel` | `pack` | backpack | front | * | нет |
| 16 | `backpack-travel` | `straps` | backpack | front | * | да |
| 17 | `sneakers-white` | `shoe-l` | shoes | front | * | нет |
| 18 | `sneakers-white` | `shoe-r` | shoes | front | * | нет |

### etalon-2: 8 частей

| № | Владелец | Часть | Слот | Ракурс | Поза | Необязательно |
|---|---|---|---|---|---|---|
| 1 | `costume-barista` | `torso` | top | front | front-idle | нет |
| 2 | `costume-barista` | `torso` | top | front | front-wave | нет |
| 3 | `costume-barista` | `prop` | accessory | front | * | нет |
| 4 | `costume-chef` | `torso` | top | front | front-idle | нет |
| 5 | `costume-chef` | `torso` | top | front | front-wave | нет |
| 6 | `costume-chef` | `scarf` | neck | front | * | нет |
| 7 | `costume-chef` | `prop` | accessory | front | * | нет |
| 8 | `hat-chef` | `hat` | headwear | front | * | нет |

Каталог гардероба (`assets/wardrobe/WARDROBE_CATALOG.json`): вещей 32; без ресурса — **23**, цельные картинки или вшиты в базовый образ («требует переделки») — **9**, готовых слоёв — 0.

Без ресурса: `cap-green`, `cap-red`, `beanie-blue`, `hat-chef`, `hat-krasnal`, `crown-gold`, `glasses-round`, `glasses-sun`, `glasses-star`, `scarf-pl`, `scarf-ua`, `scarf-green`, `jacket-denim`, `jacket-rain`, `vest-krakowiak`, `backpack-map`, `sneakers-white`, `boots-mountain`, `flag-pl`, `camera`, `map-paper`, `obwarzanek`, `costume-syrenka`.

Требуют переделки в слои: `hoodie-red`, `backpack-travel`, `costume-dragon`, `costume-barista`, `costume-chef`, `costume-conductor`, `costume-krasnal`, `costume-artist`, `costume-winter`.

