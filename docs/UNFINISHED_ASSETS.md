# Незавершённые ассеты — точный перечень

Файл создаётся командой `node --import tsx scripts/unfinished-assets.ts` из кода и манифестов (`scripts/lib/unfinished-assets.ts`); вручную не правится. `apps/server/test/unfinished-assets.test.ts` падает, если документ разошёлся с `CITY_ART`, `SCENE_ART`, манифестами бота и гардероба.

Итого: **10** городских фонов, **11** сцен бота, **5** сцен магазинов (нужны версии без Бобека), **26** слоёв Бобека для двух этапов, **23** вещей гардероба без ресурса. Ничего из этого не подменено случайной картинкой: приложение и бот честно показывают «в подготовке» или нейтральный кадр.

## 1. Фоны городов: 10 временных (interim)

Общие требования: 2:1, мастер 2880×1440 (минимум 1774×887; PNG или WebP без потерь), без текста, логотипов, Бобека и людей крупным планом; ориентир — в центральных 60 % ширины; левая нижняя треть — спокойный передний план; стиль «Premium 2.5D cartoon travel-game environment, cinematic golden-hour lighting, colorful Polish architecture, high detail, vibrant colors, crisp edges». Как подключить мастер — `docs/CITY_ART_INVENTORY.md`, «Как заменить на мастер-файл».

Приоритет: 1 — рисовать первым (город с уроками, самый слабый кадр или неверная достопримечательность). Ни один кадр не увеличивается до нужного размера: пока мастера нет, город остаётся interim.

| № | city_id | Город | Приоритет | Сейчас в приложении | Проверка текущего кадра | Что нарисовать | Куда положить мастер |
|---|---|---|---|---|---|---|---|
| 1 | `katowice` | Катовице | 1 | 1176×488, interim: Spodek на тлі хмарочосів | Spodek узнаваем; высотки условные, копра и NOSPR нет. 1176×488 (2,4:1), детали 0,46. Приоритет 1: единственный временный фон города с уроками (7 маршрутов, 13 уроков, экзамен) — его видят игроки. | Spodek (арена-«НЛО») на закате; рядом шахтный копёр музея Силезии и красно-кирпичный NOSPR; современные высотки Rondo. | `docs/design/a10/cities/city-katowice.webp` |
| 2 | `zielona-gora` | Зелёна-Гура | 5 | 1472×660, interim: Ратуша з вежею, площа, виноградна лоза | Ратуша с башней и виноград совпадают; статуи Бахуса нет. 1472×660. | Рынок с ратушей и башней, виноградные склоны, статуя Бахуса; тёплый вечер, гроздья винограда на переднем плане. | `docs/design/a10/cities/city-zielona-gora.webp` |
| 3 | `szczecin` | Щецин | 2 | 776×504, interim: Wały Chrobrego над Одрою, кораблі | Самый маленький кадр: 776×504, соотношение 1,54 вместо 2:1 — в приложении обрезается и увеличивается. Террасы Wały Chrobrego угадываются условно (здание с куполом, суда), Замка Померанских князей и Филармонии нет. | Wały Chrobrego над Одрой с террасами, Замок Померанских князей, белое здание Филармонии, корабли на реке. | `docs/design/a10/cities/city-szczecin.webp` |
| 4 | `bydgoszcz` | Быдгощ | 5 | 1620×668, interim: Фахверкові зерносховища над Брдою, теплохід | Фахверковые спихлеры над Брдой совпадают; моста-фермы и «Przechodzący przez rzekę» нет. 1620×668. | Остров Млынска: фахверковые зернохранилища над Брдой, мост-ферма, лодки, «Przechodzący przez rzekę»; без людей крупным планом. | `docs/design/a10/cities/city-bydgoszcz.webp` |
| 5 | `torun` | Торунь | 5 | 1448×668, interim: Готичне Старе місто над Віслою, ратуша | Кирпичная готика над Вислой совпадает; памятника Копернику и Кривой башни на кадре не видно. 1448×668. | Готическая Староместская ратуша, памятник Копернику, Кривая башня, городская стена на берегу Вислы; пряничный мотив на переднем плане. | `docs/design/a10/cities/city-torun.webp` |
| 6 | `olsztyn` | Ольштын | 3 | 1480×660, interim: Замок вармійської капітули, озеро з вітрилами | Достопримечательность не совпадает: на кадре две одинаковые башни и стена над озером с парусами; у замка вармийской капитулы одна высокая квадратная башня, стоит над рекой Лыной, Высокой брамы нет. | Замок вармийской капитулы, Высокая брама, река Лына, озеро Укель с парусами. | `docs/design/a10/cities/city-olsztyn.webp` |
| 7 | `lublin` | Люблин | 4 | 1000×448, interim: Люблінський замок (неоготичний фасад з брамою) | Неоготический фасад замка с брамой совпадает, но кадр маленький: 1000×448 (2,2:1). Краковских ворот и Трибунала нет. | Краковские ворота, неоготический Люблинский замок, площадь Старого Города с Трибуналом; вечерний свет. | `docs/design/a10/cities/city-lublin.webp` |
| 8 | `rzeszow` | Жешув | 5 | 1460×668, interim: Rynek з ратушею і парасольками кав’ярень | Rynek с ратушей и зонтами совпадает (условно); фонтана и дворца Любомирских нет. 1460×668. | Rynek с ратушей и фонтаном, зонтики кафе, дворец Любомирских на заднем плане. | `docs/design/a10/cities/city-rzeszow.webp` |
| 9 | `kielce` | Кельце | 5 | 1560×660, interim: Палац краківських єпископів | Дворец епископов с зелёными шлемами башен совпадает (условно); собора и Kadzielni нет. 1560×660. | Дворец краковских епископов с садом, кафедральный собор, амфитеатр Kadzielnia в известняковом карьере. | `docs/design/a10/cities/city-kielce.webp` |
| 10 | `zakopane` | Закопане | 5 | 1640×688, interim: Татри, дерев’яні будинки в снігу | Татры и деревянные дома совпадают; Гевонт не узнаётся, Krupówki и фуникулёра нет. 1640×688, детали 0,42 (на грани увеличения). | Гора Гевонт, деревянные виллы в стиле закопане, улица Krupówki, фуникулёр на Губалувку; снег и золотой час. | `docs/design/a10/cities/city-zakopane.webp` |

## 2. Сцены бота: 11 недостающих

Пока исходника нет, бот шлёт нейтральные кадры `commands/*` (они существуют, резкие, без размытых полос; `apps/server/test/bot-image-fallback.test.ts` проверяет это) и не ссылается на несуществующие файлы. Файлы кладутся в `apps/web/public/bot/`: JPEG 1280×720 и `@640` 640×360 (`node scripts/build-bot-images.mjs`, проверка — `npm run assets`). Мастер от 1920×1080. На картинках не должно быть живых данных: чисел XP, серии, названий городов, штампов, образцов вопросов.

| № | scene | Где нужна | Файлы | Почему нет | Что нарисовать |
|---|---|---|---|---|---|
| 1 | `map` | /map | `scenes/ru/map.jpg`<br>`scenes/neutral/map.jpg` | нет исходника: в комплекте 2026-10-27 нет доски карты; ru/map.jpg снят как мыльный, остаётся commands/map.jpg (резкий, без карты) | Бобек в красной толстовке с рюкзаком держит развёрнутую бумажную карту Польши с метками городов на площади Старого города в золотой час. Горы, море и города узнаваемы по силуэтам. Без текста; в ru-версии заголовок «КАРТА» в стиле досок a10. |
| 2 | `quests` | /quests | `scenes/ru/quests.jpg`<br>`scenes/neutral/quests.jpg` | нет исходника: commands/quests.jpg — дубль /lesson с польской плашкой, ru/quests.jpg снят как мыльный | Бобек радуется рядом с доской-чеклистом с галочками без слов, кубком и подарком. Тёплое освещение, польская кофейня. Без чисел и XP. |
| 3 | `profile` | /profile | `scenes/ru/profile.jpg`<br>`scenes/neutral/profile.jpg` | нет исходника: плашка «TWOJA SERIA!» (commands/profile.jpg) снята 2026-10-27, /profile временно показывает нейтральный кадр старта commands/start.jpg | Бобек перед рамкой-карточкой профиля и полкой значков (значки без надписей). Без уровня, XP и серии. |
| 4 | `help` | /help | `scenes/ru/help.jpg`<br>`scenes/neutral/help.jpg` | нет исходника: ru/help.jpg снят как мыльный, commands/help.jpg остаётся для всех языков — без полос, но мягкий (детали 0,40, soft_fallback) | Бобек у информационной стойки со знаком вопроса в облачке и картой. Без табличек с названиями городов. |
| 5 | `reminder_lesson` | напоминание «урок» | `scenes/neutral/reminder-lesson.jpg` | нет исходника: ru/reminder.jpg (часы 19:00, мыльные полосы) снят; commands/reminder-lesson.jpg — дубль /lesson | Бобек за столом с открытой тетрадью и будильником без читаемого времени (стрелки без цифр), вечерний тёплый свет. Без часов 19:00. |
| 6 | `streak` | напоминание «серия» | `scenes/neutral/streak.jpg`<br>`scenes/ru/streak.jpg` | доска tg-streak.webp содержит статическую «7» и календарь с отмеченными днями: показывать как серию пользователя нельзя | Огонёк и календарь без цифр и без отмеченных дней; Бобек в радостной позе. Число дней всегда в тексте сообщения. |
| 7 | `correct_answer` | /quiz (правильный ответ) | `scenes/neutral/correct-answer.jpg`<br>`scenes/ru/correct-answer.jpg` | доска tg-correct-answer.webp содержит «+20 XP», а QUIZ_XP = 10 | Зелёная галочка в круге, конфетти, радостный Бобек. Без таблички «+N XP»: сумма всегда из QUIZ_XP в тексте. |
| 8 | `quick_question` | /quiz (приглашение) | `scenes/neutral/quick-question.jpg`<br>`scenes/ru/quick-question.jpg` | доска tg-quick-question.webp содержит образец вопроса «Jak się nazywa ten sklep?» с вариантами: рядом с настоящим вопросом он вводит в заблуждение | Секундомер, вопросительные знаки, лампочка, задумчивый Бобек. Без образца вопроса и вариантов ответа. |
| 9 | `travel_passport` | нет команды в боте | `scenes/neutral/passport.jpg` | доска tg-travel-passport.webp содержит фиксированные штампы Warszawa, Kraków, Wrocław, Gdańsk, Poznań, Zakopane: выглядят как полученные; потребителя в боте нет | Раскрытый паспорт путешественника с пустыми местами под штампы, глобус, открытки; без названий городов. Штампы пользователя отрисовывать в Mini App по данным. |
| 10 | `lesson_complete` | нет сообщения в боте | `scenes/neutral/lesson-complete.jpg` | доска tg-lesson-complete.webp содержит «+15 XP» и карточку «WARSZAWA»: не совпадает с наградой урока (20 XP + 5 за верное + 10 за идеал) | Бобек со звездой и свитком, конфетти. Без числа XP и без названия города. |
| 11 | `neutral_for_uk_pl_en` | все команды для uk / pl / en | `scenes/neutral/start.jpg`<br>`scenes/neutral/lesson.jpg`<br>`scenes/neutral/words.jpg`<br>`scenes/neutral/settings.jpg`<br>`scenes/neutral/stop.jpg`<br>`scenes/neutral/return.jpg` | нет исходника: у uk / pl / en остаются commands/*.jpg; в них только три разных основы кадра (закат с логотипом, кофейня, справка), четыре пары дублей и плашки «CZAS NA POLSKI!», «TWOJA SERIA!», «BOBEK CZEKA!» | Те же композиции, что у досок a10, но без заголовков и подписей (чистая картинка), по одной уникальной сцене на команду; мастер от 1920×1080. |

## 3. Сцены магазинов: 5 временных кадров, нужны мастера без Бобека

Подробности, дефекты кадров и способ замены — `docs/SCENE_ART_INVENTORY.md`. Мастер: 2:1 ≥ 2880×1440 и 16:9 ≥ 1920×1080, тот же свет и архитектура, **без Бобека**; Бобека рисует отдельный рендерер образа. После замены в `SCENE_ART`: `bakedBobek: false`, `status: 'final'`, реальный `native`, пустой `defects`.

| № | scene_id | Бренд | Файл в приложении | Рождённый размер | Дефекты кадра |
|---|---|---|---|---|---|
| 1 | `store-zabka` | Żabka | `apps/web/src/assets/scenes/zabka.webp` | 632×316 | нет |
| 2 | `store-biedronka` | Biedronka | `apps/web/src/assets/scenes/biedronka.webp` | 632×316 | нет |
| 3 | `store-rossmann` | Rossmann | `apps/web/src/assets/scenes/rossmann.webp` | 550×275 | написи «KOSMETYKI» і «HIGIENA» над стелажами перекручені (читаються як «HIGIEŃYIE»), червона табличка за ними нечитабельна |
| 4 | `parcel-inpost` | InPost | `apps/web/src/assets/scenes/inpost.webp` | 550×275 | панель справа обрізана: слова «Szybko», «Wygodnie» не вміщаються в кадр |
| 5 | `fuel-orlen` | ORLEN | `apps/web/src/assets/scenes/orlen.webp` | 644×322 | нет |

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

