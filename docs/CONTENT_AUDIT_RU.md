# Аудит учебного контента — журнал правок

Как проверялось: полная выгрузка (`node --import tsx scripts/content-dump.ts <dir>`), автоматический линтер
(`node --import tsx scripts/content-lint.ts <file>`) и ручное чтение каждого задания: польский, переводы uk/ru/en,
соответствие вопроса и ответа, единственность правильного варианта, объяснение, повторы.
ID упражнения в журнале — `урок#порядок` (порядок = номер в уроке, с нуля; он же ключ строки в БД).

## 2026-10-28 — «туповатые» варианты, Беларусь, сленг (пункты 4, 5, 8, 10 владельца)

Принцип: неправильный вариант — это ошибка, которую реально делает ученик (падеж, род, регистр, похожее слово,
калька с украинского/русского), а не шутка вроде «Dobranoc» на кассе или «Poproszę Gdańsk». Каждый такой вариант
получил разбор на трёх языках: почему это неверно и как сказать правильно.

Доставка в БД — новый механизм `apps/server/src/content/task-edits.ts` (`TASK_EDITS`, `LESSON_EDITS`): правка по
стабильному id задания (`e_<урок>_<номер>`), строка обновляется только если в БД ещё старый текст (точное совпадение
type/skill/data/explanation) — правки из админки и прогресс не трогаются, повтор ничего не меняет. Файл генерирует
`node --import tsx scripts/task-edits.ts snapshot|diff <file.json>`; тест `apps/server/test/task-edits.test.ts`.

### Уроки (29 заданий, 3 текста уроков)
- Абсурдные реплики → правдоподобные ошибки: `waw-1-czesc#16` (Na razie, nawzajem — регистр со старшим),
  `waw-2-uprzejmosc#8` (Dziękuję вместо Przepraszam), `waw-3-imie#7` (Nazywa się — о другом, не о себе),
  `waw-4-skad#14` (po polski вместо po polsku), `waw-c1-centralna#11` (kiedy вместо którędy),
  `waw-c2-bilety#10` (билет на 20 минут при пересадке), `waw-boss#10` (Cześć с незнакомой соседкой),
  `lodz-2-dwuznaki#0` (do szkoła), `krk-r1-miasto#15` (kto/co), `krk-r2-orientacja#15` (obok kawiarnia — падеж),
  `krk-r4-droga#8` (do Wawel), `krk-boss#9` (Proszę bardzo на «Smacznego»), `opo-1-siema#0` (официальный тон с другом),
  `wro-1-kawa#9` (na miejsce), `wro-2-zabka#8` (Tak, to wszystko), `wro-4-restauracja#8` (sok jabłkowa),
  `pzn-2-koziolki#6` (Ile czasu вместо Ile razy).
- WORD_TRANSLATION `waw-2-uprzejmosc#11`: «Proszę nie mówić» → близкие по смыслу «głośniej / szybciej».
- «Найди лишнее» с очевидным ответом (помидор среди слов вежливости, кот среди чисел, бабушка среди комнат, часы,
  октябрь среди мест, сумка) → настоящий критерий: `waw-2-uprzejmosc#14`, `waw-5-liczby#5` (нечётное число),
  `krk-3-dom#7` (lodówka — вещь, не часть квартиры), `wro-boss#6`, `pzn-2-koziolki#8`, `pzn-8-weekend#8`.

### Беларусь рядом с Украиной (пункт 4)
- `waw-4-skad`: объяснение и пример («Jestem z Białorusi, z Mińska»), перевод `#8` «Я з Білорусі», лишнее `#15`
  с **po białorusku**; словарь: **Białoruś** (z Białorusi), **po białorusku**.
- `lodz-4-oni-one#8` «One są z Białorusi», `lodz-boss#3` «My jesteśmy z Białorusi», входной тест `placement-test#3`
  «Jestem z Białorusi» (дистракторы Białoruś / Białorusią).
- Грамматика «Dopełniacz»: Białoruś → z **Białorusi**; `krk-3-dom` (en): «false friends for Ukrainian, Belarusian
  and Russian speakers»; подсказки ИИ-помощника — «Ukrainians and Belarusians».

### Миссии (пункт 10, только код — миссии в БД не хранятся)
19 вариантов заменены: «Скільки вам років?» → «Ви можете мені допомогти?» (кто кому помогает); «Z wodą» →
«Z sos czosnkowy»; «Smacznego/Dobranoc/Nie ma za co» не к месту → na miejsce / na wynosie / paragon вместо rachunek /
«To wszystkie» / «Proszę bardzo» на чек / «Paragonu, poproszę»; «Poproszę Gdańsk» → «jak dojść do Gdańska» (пешком,
а надо dojechać); «Szerokiej drogi» → «Na zdrowie!» и «Wzajemnie, szerokiej drogi!»; трамвай: «do dworzec»;
«ze śmietana»; «Nie, proszę» и «następny raz»; «z serom» (калька «с сыром»); «przystanek nocny tramwaj»;
«Czy … są mięso?»; «Na jedną stronę»; «gdzie jest szampony?».

### Сленг (пункт 8)
Раздел «Żywy polski» — 56 выражений вместо 26 и новая группа «Деньги и работа»: Hejka, Pa/Papa, Mordo, Stary,
Szefie, Typ, Dzban (грубо), Git/Gituwa, Essa, Ogień, No weź, O matko, Dramat, Ściema, XD, Rel, Wkręcasz mnie?,
Na bank, W sumie, Wpadnij, Sorki, Dzięki, Kasa, Hajs, Stówa/dycha, Fajrant, Robota, Jestem na L4, Spadaj (грубо),
Weź przestań. У каждого — регистр, с кем можно, ситуация, диалог и нейтральная замена; тест следит, чтобы
нейтральные замены не повторялись (тренажёр не показывает два одинаковых варианта).

## Варшава — проверено 499 заданий (26 уроков) + экзамен

### Неоднозначные задания
- `waw-1-czesc#6` «Найди лишнее: Cześć / Dzień dobry / Dobry wieczór / Dobranoc» — критерий спорный (cześć и приветствие, и прощание).
  → пропуск в контексте: «— Idę już spać. — ___!» (Dobranoc / Dzień dobry / Dobry wieczór) с объяснением.
- `waw-p5-misja#8` «Czy może pan mówić ___?» — вариант **wolno** тоже грамматичен («медленно»). → дистрактор заменён на **wolność**, объяснение разбирает все три слова.
- `waw-f3-gusty#13`, `waw-f4-misja#12`, `waw-n1-sasiad#12` — вопрос «Найди лишнее» прямо называл ответ («Где покупают лекарства?»).
  → настоящий критерий: «Какое слово НЕ описывает вкус?», «Какое место НЕ связано с едой?», «Что НЕ является частью жилого дома?».

### Принимались не все правильные ответы
- `waw-2-uprzejmosc#6` сборка «Dziękuję bardzo» → принимается и **Bardzo dziękuję**.
- `waw-3-imie#8` «Меня зовут Оля» → добавлено **Nazywam się Ola**.
- `waw-4-skad#6` → **Trochę mówię po polsku**; `waw-4-skad#8` → **Pochodzę z Ukrainy**; `waw-p5-misja#11` → порядок «trochę mówię».
- `waw-6-wiek#8` → **Mam 20 lat** (цифрами).
- `waw-k3-zakupy#14` плитка **kilo** была «ловушкой», хотя «Poproszę kilo ziemniaków» правильно → принимается как вариант, объяснение дополнено.
- `waw-k3-zakupy#15` → «Dzisiaj ogórki są w promocji», «Ogórki dzisiaj są w promocji».
- `waw-boss#26` → оба порядка «w niedzielę na kawę».

### Ошибки и неестественный польский, логика
- `waw-p5-misja#7` «Przepraszam, czy wie pan albo pani, gdzie…» — неестественно. → «Przepraszam bardzo, gdzie tu jest najbliższa poczta?»
- `waw-c3-metro#11` «еду не в ту сторону» → совет «выйдите на Świętokrzyskiej» противоречил ситуации. → «wysiąść na następnej stacji, wrócić na Świętokrzyską i tam przesiąść się…».
- `waw-f2-piekarnia#9` сумма 7 + 4 + 4 названа «trzynaście» → **piętnaście złotych**.
- `waw-p5-misja#19` перевод «Пани в учреждении: …» не соответствовал польскому «Do pani w urzędzie» (говорит пользователь). Исправлено.
- `waw-boss#10` «Jestem Ewa, pani sąsiadka» (к женщине) и затем «Skąd pan jest?» (к мужчине) — противоречие и навязанный род. → «Jestem Ewa, mieszkam obok» / «A skąd jesteś?».
- Урок `waw-5-liczby`: украинское объяснение «ę в конце слова звучит как е: pięć → «п'єнчь»» противоречило примеру → «ę перед согласным звучит как „ен“».
- `waw-c4-misja` (объяснение): «вийди на Нових Світах» → «на станції Nowy Świat-Uniwersytet».
- `waw-s1-zabytki#11`, `waw-k3/k4` — уточнены объяснения (узгодження «маю свій пакет», «міські об'єкти»).

### Обращение к пользователю без навязанного рода
- `waw-2-uprzejmosc#8` «Ты случайно толкнул…» → «ты случайно наталкиваешься…»; подсказка «Если случайно кого-то заденешь…».
- `waw-3-imie#7` реплика пользователя «Mam na imię Taras» → «Mam na imię Bobek» (как в остальных диалогах).

### Повторы → заменены новыми заданиями
- `waw-5-liczby#14` повторял вопрос `#5` того же урока («какое слово не число») → новое: «0 — нуль» → **zero**.
- `waw-c4-misja#0` «tramwaj» (дубль Кракова, не по теме метро) → **biletomat** (квитковий автомат / банкомат / паркомат).
- `waw-c4-misja#5` почти дубль `c1#5` («Gdzie jest…») → оплата: «W biletomacie można płacić kartą albo ___» (gotówką).
- `waw-c4-misja#18` то же предложение, что `c3#14` → «Сідай у M2 у напрямку Брудна» (Wsiądź do M2 w kierunku Bródna).
- `waw-boss#12` диктант «Miło mi» (третий раз) → «Bez cukru, proszę»; `#15` «przejście podziemne» (дубль c1) → «bilet dobowy»;
  `#17` «To kosztuje pięć ___» (дубль Вроцлава и входного теста) → «…dwadzieścia cztery ___» (правило 22–24);
  `#20` «Poproszę ___ z mlekiem» (дубль экзамена Вроцлава) → «Poproszę małą ___ bez cukru»; `#21` «Na miejscu czy na wynos?» (ещё в двух городах) → «Kartą czy telefonem?».

## Добавлено (без удаления и переноса заданий)
- Миссия `urzad-pesel` «Первый визит в urząd» (Варшава, 7 шагов: номерок, табло со stanowisko, просьба подать
  wniosek o PESEL, документы, поле «Data urodzenia», подтверждение, прощание) и достижение `pierwszy-urzad`.
  Примечание в миссии: порядок, документы и сроки зависят от учреждения — это учебная сцена, а не инструкция.
  Новые слова словаря: numerek, stanowisko, data urodzenia, potwierdzenie. Прогресс пользователей не затронут:
  всё добавляется по новым slug (seed без перезаписи).
- Скрини тем міста (по одной на тему с обычными уроками): +30 XP и +15 Złotki один раз, когда пройдены все уроки
  темы; значения в game_config (`routeChestXp`, `routeChestZlotki`). Тем, кто уже прошёл темы, сундук доступен
  сразу (открывается один раз).
- Подсказки произношения строятся из написания (`packages/shared/src/pron.ts`) вместо показа ручного поля `pron`
  в квадратных скобках как будто это транскрипция; поле `pron` в базе сохранено. Сверка генератора с ручными
  прочтениями: 338 из 578 совпадают дословно, остальные отличаются соглашением (ł → «в», а не «л»; ś → «сь»).

## Фактическая картина маршрутов (V9 §10, 2026-10-26)

Команда: `node --import tsx scripts/route-stats.ts`. Ориентир V9 для полного города: 16–18 обычных уроков, 12–16 заданий
в уроке, повторение, итоговая проверка.

| Город | Тем | Уроков | Экзамен | Заданий в уроке (мин–макс, ср.) | Механик | CEFR |
|---|---|---|---|---|---|---|
| Warszawa | 7 | 25 | да | 17–23, 18.8 | 16 | A0/A1 |
| Łódź | 7 | 16 | да | 12–16, 14.6 | 15 | A0/A1/A2 |
| Kraków | 11 | 40 | да | 10–23, 18.3 | 16 | A0/A1 |
| Katowice | 3 | 4 | да | 11–12, 11.8 | 11 | A1/A2 |
| Opole | 2 | 4 | да | 11–12, 11.3 | 11 | A1/A2 |
| Wrocław | 4 | 4 | да | 10–11, 10.5 | 13 | A1 |
| Остальные 14 городов | 0 | 0 | — | — | — | — |

Выводы:
- **Łódź доведена** до ориентира (было 8 уроков, у L1/L3/L4 по 11 заданий).
- **Katowice, Opole, Wrocław** — по 4 урока по 10–12 заданий: следующие по очереди. Уроки короче 12 заданий:
  `kat-2-isc-jechac`, `opo-1…3`, все 4 урока Вроцлава.
- **Warszawa и Kraków** длиннее ориентира (17–23 задания, миссии 20–30). Это решение этапа 3.0 (тест «локации 3–6 уроков,
  урок 15–20 заданий»). Обрезать их нельзя без `force`: seed без него не удаляет лишние задания из уже засеянной БД,
  а у пользователей по ним есть прогресс. Оставлены как есть.
- 14 городов без уроков: `hasContent: false`, в шторке «Уроки готовятся» (V9 этап 5).

## Стандарт города: 8 уроков и экзамен, по 12 заданий (решение владельца, 2026-10-28)

Владелец: «Краков уменьши… не делай города огромные по прохождению заданий, у всех городов одинаковое количество уроков и тестов».
Было: Warszawa 25 уроков (17–23 задания), Kraków 40 (10–23), Łódź и Wrocław по 16, Katowice 13, Opole 10, Poznań 8.
Стало во всех семи городах: **8 уроков + экзамен, в каждом уроке и экзамене ровно 12 заданий** (96 + 12 на город).
Пункт V9 «16–18 уроков в городе» этим решением заменён.

Как сделано (`apps/server/src/content/city-standard.ts`, SQL — `standardSql()` в `seed.ts`):
- Файлы городов не тронуты. План города перечисляет темы, уроки и **номера заданий по старому порядку**, которые остаются.
  Ниже в журнале номера `урок#порядок` до 2026-10-28 — старые; новый номер = позиция старого номера в списке плана.
- Урок вне плана — `ARCHIVED` (исчезает с карты, прогресс и XP учеников остаются). Тема без уроков — `ARCHIVED`.
- Лишние задания урока переносятся в служебный урок `archiwum-zadan` (ARCHIVED, без темы). **Ни одна строка не удаляется**,
  ответы учеников (`exercise_attempts`) остаются связаны со своими заданиями. Оставшиеся сохраняют свои ID и встают на позиции 0…11.
- Короткие уроки (Kraków 1–5, Wrocław 1–4, Opole 1–3, `kat-2`, экзамены Katowice, Opole, Wrocław) получили 1–2 новых задания в конце;
  у `krk-boss` одно задание заменено на «obok kościoła» (тема Rynku).
- Квиток к экзамену — 8 уроков (`ticket_lessons` снижается только если больше).
- Тест `city-standard.test.ts`: база, засеянная до стандарта (как production), с настоящими учениками → новый seed:
  опубликованное совпадает с чистой базой до ID и позиций, ни одно задание не удалено, прогресс и ответы те же,
  незавершённый урок (17 заданий) доходит до конца, повторный seed ничего не меняет.

Что осталось в городах:
| Город | Уроки | В архиве |
|---|---|---|
| Warszawa | приветствия, вежливость, имя, откуда ты; числа 0–10, возраст; вокзал, билеты | метро, покупки, Старый город, кафе, соседи, миссии |
| Łódź | буквы, sz/cz/rz; профессии, oni/one; где работаешь, первый день на складе (BHP); который час, утро | поиск работы, собеседование, график, отпуск, здоровье, повторение |
| Kraków | семья, mieć, дом, дни недели, być; город, ориентиры, как пройти | вокзал, Żabka, ресторан, трамвай, отель, университет |
| Katowice | транспорт, iść/jechać, wiedzieć/znać, tę/tą; przyjechać, такси; аренда, поломка | самокат, почта, звонки, просьбы, потерянные вещи |
| Opole | siema, реакции, ogarniać, nic/nikt; выходные, приглашение; концерт, конкурс | «по-моему», песня |
| Wrocław | кофе, Żabka, цены, ресторан; одежда, примерочная; подарок, сравнение | возврат, рынок, список, цены до 1000, бронь, вкусы, гномы, повторение |
| Poznań | без архива: из 5 уроков убрано по одному заданию, из экзамена — два (город ещё не выкладывался) | — |

Темы из архива вернутся в своих городах маршрута: здоровье и аптека — Białystok, работа и собеседование — Szczecin, почта — Lublin.

## Poznań — первый город после Вроцлава с уроками (2026-10-28)
- Раньше уроков не было. Город был на карте «в подготовке». Кто сдал Вроцлав, получал Познань открытой как «скоро» и оставался в Вроцлаве. Теперь такие ученики переходят в Познань (`journey.ts` и `STRANDED_CURRENT_CITY_SQL` в seed, тест `new-cities.test.ts`).
- Файлы: `poznan.ts` (5 тем: 8 уроков и экзамен, по 12 заданий), `vocab-poznan.ts` (48 новых слов, у каждого пример). Общий помощник словарей — `vocab-city.ts`. Темы словаря `calendar`, `nature`, `sport` добавлены в `TOPICS`.
- Грамматика без повторов того, что было в Łódź, Kraków, Katowice, Opole, Wrocław:
  - L1 `pzn-1-skad-dokad` (A1): **z** + родительный / **w** + местный / **do** + родительный с названиями городов, **we Wrocławiu**.
  - L2 `pzn-2-koziolki` (A1): легенда о козликах (1551), **Ile razy?** — raz / dwa razy / dwanaście razy, w południe, codziennie.
  - L3 `pzn-3-miesiace` (A1): месяцы со строчной буквы; **w** + местный (w lipcu, **we wrześniu**, w lutym — как прилагательное).
  - L4 `pzn-4-daty` (A1): **Którego jest dzisiaj?**, порядковое и месяц в родительном (jedenastego listopada); 11 ноября и rogale świętomarcińskie. Оба ответа «jedenasty / jedenastego listopada» принимаются.
  - L5 `pzn-5-zajmuje-sie` (A2): **zajmować się / interesować się** + творительный (logistyką, sportem).
  - L6 `pzn-6-targi` (A2): Международная Познанская ярмарка (с 1921), **targi** только во множественном (na targach ≠ na targu), **prosić o** + винительный, вежливый регистр pan / pani.
  - L7 `pzn-7-musze-moge` (A1): **musieć / móc** + инфинитив, спряжение, отказ «nie mogę, bo muszę…».
  - L8 `pzn-8-weekend` (A1): повторение. Озеро Мальта (**nad** jezioro), Stary Browar, стадион «Лех», региональное **pyry z gzikiem**.
  - Экзамен `pzn-boss`: 12 заданий по всем темам.
- Проверки 2026-10-28:
  - content-lint без новых находок. Ложные срабатывания диакритики занесены в `PLAIN_OK` с причиной. Это `zajmuje` (3-е лицо), `logistyka` (именительный), `dwunasta`, `maja`.
  - `scripts/lesson-render-check.ts poznan`: 101 задание (до стандарта) × ru/uk × 320/360/390/430 — 0 замечаний.
  - Картинки вариантов — только ключи пиктограмм приложения (тест `visual-keys`).
- Нужна проверка носителем.

## Zielona Góra — «Праздники и традиции», A2 (2026-10-28)
- Файлы: `zielona-gora.ts` (4 темы: 8 уроков и экзамен, по 12 заданий), `vocab-zielona-gora.ts` (56 слов, у каждого пример). Тема словаря `holidays` добавлена в `TOPICS`.
- Грамматика A2 без повторов прежних городов:
  - L1 `zg-1-zyczenia`: **życzyć** + кому + родительный (zdrowia, szczęścia, sukcesów), Sto lat, Gratulacje ≠ поздравление с днём рождения.
  - L2 `zg-2-imieniny`: именины; **дательный** местоимений (mi, ci, mu, jej) и имён (Ani, Piotrowi); **jej ≠ ją**.
  - L3 `zg-3-wigilia`: **прошедшее время** (byłem / byłam, jedliśmy), Wigilia: opłatek, 12 блюд, пустое место для гостя; jemy **karpia**.
  - L4 `zg-4-sylwester`: **будущее** będę / będziemy + инфинитив (ошибка «będziemy oglądamy» как дистрактор), w Sylwestra, o północy.
  - L5 `zg-5-wielkanoc`: **винительный** (kiełbasę) и множественное (pisanki, pięć pisanek), święconka, śmigus-dyngus; православная Пасха в другую дату.
  - L6 `zg-6-dni-wolne`: государственные праздники, **niedziela handlowa**, согласование otwarty / zamknięty; 2 мая — не выходной.
  - L7 `zg-7-winobranie`: опыт — **kiedyś, już, jeszcze nie, nigdy nie** (двойное отрицание), Winobranie, bachusiki.
  - L8 `zg-8-kartka`: **звательный падеж** в открытке (Droga Magdo!, Kochana Babciu!, Drogi Tomku!, Panie Zbigniewie!), подписи Pozdrawiam / Ściskam / Z poważaniem. Сначала был урок о приглашениях — заменён: эту тему уже ведёт Ополе (`opo-6-zaproszenie`).
  - Экзамен `zg-boss`: 12 заданий по всем темам.
- Неправильные варианты — реальные ошибки: «Gratuluję urodzin», «Kupmy ją kwiaty», «karp» вместо «karpia», «pięć pisanki», «Nie, nigdy byłem», «Kochana Babcia!», «Szanowny Pan!», «Z poważaniem» бабушке.

## Gorzów Wielkopolski — «Погода и природа», A2 (2026-10-28)
- Файлы: `gorzow.ts` (4 темы: 8 уроков и экзамен, по 12 заданий), `vocab-gorzow.ts` (49 слов). Описание города на карте исправлено: было «финальная остановка… перед экзаменом B2», хотя это 9-й город уровня A2 (`cities.ts`, обновляется seed).
- Грамматика:
  - L1 `gorz-1-pogoda`: **jest zimno / ciepło** (наречие ≠ прилагательное), pada deszcz, wieje wiatr, **świeci** słońce (не «pada słońce»).
  - L2 `gorz-2-pory-roku`: **zimą, latem** (не «w lato»), lubię **wiosnę**.
  - L3 `gorz-3-prognoza`: **będzie padać**, **stopień / stopnie / stopni**, około **pięciu**; burza = гроза.
  - L4 `gorz-4-ubierz-sie`: повелительное **weź, załóż**, **jeśli** + будущее, wezmę ≠ weź.
  - L5 `gorz-5-przyroda`: **nad morze / nad morzem** (калька «na morze»), **w lesie**, przyroda ≠ przygoda.
  - L6 `gorz-6-cieplej`: **cieplej, zimniej, lepiej, gorzej + niż** («jak» — разговорная ошибка), cieplej ≠ cieplejszy, gorzej ≠ gorąco.
  - L7 `gorz-7-wycieczka`: **z wami / z tobą**, rowerem, **wypożyczyć ≠ pożyczyć**.
  - L8 `gorz-8-segregacja`: сортировка мусора по цветам, **do żółtego** pojemnika, **nie wyrzucaj baterii**.
  - Экзамен `gorz-boss`: 12 заданий.
- Новые картинки вариантов (облако, снежинка, туман, зонт, палатка, гроздь, ёлка, свеча…) получили пиктограммы Lucide (тест `visual-keys`).
- Нужна проверка носителем.

## Gdańsk — «Путешествия и отдых», A2 (2026-10-28)
- Файлы: `gdansk.ts` (4 темы: 8 уроков и экзамен, по 12 заданий), `vocab-gdansk.ts` (32 слова; opóźnienie уже было в словаре).
- Темы не повторяют Варшаву (городские билеты), Катовице (транспорт, поломки «nie ma + родительный»), Вроцлав (покупки, сравнительная степень).
  - L1 `gda-1-pociag`: **z peronu trzeciego** (родительный порядкового), odjeżdża / przyjeżdża, **ma … minut opóźnienia**, miejscówka.
  - L2 `gda-2-nocleg`: **na trzy noce / na pięć nocy**, **od piątku do niedzieli**, za dobę, na **jedną** noc.
  - L3 `gda-3-warto`: **warto + инфинитив**, превосходная степень (najstarszy, największy, najlepszy; najpierw — не она), Żuraw, Długi Targ.
  - L4 `gda-4-plaza`: **można / nie wolno / trzeba + się**, флаги на пляже; pływam — без się.
  - L5 `gda-5-zgubilem`: бюро находок, **винительный прилагательного** (czarny plecak, czarną torbę).
  - L6 `gda-6-lotnisko`: **opóźniony / odwołany** по роду, opóźniony **o godzinę** (не «na godzinę»), na czas ≠ na czasie.
  - L7 `gda-7-historia`: **годы** (w 1980 roku, od 2004 roku; z 2004 roku — «датированный»), Westerplatte, «Солидарность».
  - L8 `gda-8-trojmiasto`: **безличное się** (jak się jedzie, kupuje się, tu się nie pali), SKM, z Gdańska do Gdyni.
  - Экзамен `gda-boss`: 12 заданий.
- Факты сверены: Żuraw — средневековый портовый кран (Национальный морской музей); забастовка на верфи — август 1980, Лех Валенса — электрик, президент с 1990; Польша в НАТО с 1999, в ЕС с 2004; мол в Сопоте — самый длинный деревянный в Европе; Гдыня — самый молодой город Тримяста.
- Нужна проверка носителем.

## Gdynia — «Спорт и хобби», A2 (2026-10-28)
- Файлы: `gdynia.ts` (4 темы: 8 уроков и экзамен, по 12 заданий), `vocab-gdynia.ts` (43 слова; basen, rower, szatnia, bramka, kamizelka, plecy, codziennie, często, nigdy уже были в словаре).
- Темы не повторяют Познань (interesować się — там один пример в экзамене; здесь в L8 другой), Гданьск (пляж, kąpać się), Лодзь (здоровье — там у врача, здесь спортивная травма и boli / bolą).
  - L1 `gdy-1-grac`: **grać w + винительный** (w piłkę, w tenisa, w szachy) ≠ **grać na + предложный** (na gitarze, na pianinie); od trzech lat.
  - L2 `gdy-2-uprawiam`: **uprawiać sport**, **chodzić na + винительный** (na basen, na jogę) ≠ **jeździć na + предложный** (na nartach, na rolkach); chodzę na basen ≠ pływam w basenie.
  - L3 `gdy-3-jak-czesto`: **raz / dwa razy / pięć razy** w tygodniu, **co + винительный** (co sobotę), czasem, rzadko; **nigdy nie** (двойное отрицание); wczoraj — не «как часто».
  - L4 `gdy-4-silownia`: karnet **na miesiąc / na trzy miesiące / na pięć miesięcy**, klucz **do szafki**, **czy mogę + инфинитив**, z trenerem.
  - L5 `gdy-5-mecz`: **kibicować + дательный без «za»** (Arce, Lechii, Polsce), **dwa do jednego**, remis, **przegrać z + творительный**, strzelić gola; ложный друг drużyna ≠ «дружина» (жена — żona).
  - L6 `gdy-6-zeglarstwo`: **отглагольные существительные на -nie** (pływanie, bieganie, żeglowanie) как подлежащее; lubię pływać = lubię pływanie; **nauczyć się + инфинитив**; «Dar Pomorza».
  - L7 `gdy-7-kontuzja`: **boli / bolą mnie** (не «boli mi»), plecy — только множественное, skręciłem / skręciłam kostkę, **musisz odpocząć**.
  - L8 `gdy-8-hobby`: w wolnym czasie, **interesuję się + творительный**, **повелительное на -my** (zagrajmy, chodźmy, spotkajmy się) ≠ будущее zagramy.
  - Экзамен `gdy-boss`: 12 заданий.
- Факты: Arka Gdynia и Lechia Gdańsk — настоящие клубы; счёт матча в чтении — учебный, не реальный матч. «Dar Pomorza» — парусник-музей в Гдыне. Цены абонемента и курса — учебные.
- Нужна проверка носителем.

## Szczecin — «Работа и профессии», A2 (2026-10-28)
- Файлы: `szczecin.ts` (4 темы: 8 уроков и экзамен, по 12 заданий), `vocab-szczecin.ts` (40 слов; woleć и zamienić się уже были в словаре).
- Темы сверены с опубликованными уроками: Łódź (być + творительный, BHP), Poznań (zajmować się, targi), Katowice (czy może pan) не повторяются.
  - L1 `szc-1-ogloszenie`: объявление — **zatrudnimy / szukamy kierowców** (-ów), **szukać + родительный** (pielęgniarek), wymagania / oferujemy, od zaraz; kierowca ≠ kierownik.
  - L2 `szc-2-cv`: **jako + именительный** (≠ jestem kierowcą), **przez** + винительный / **od** + родительный, jak ≠ jako; CV с белорусским и русским как родными.
  - L3 `szc-3-rozmowa`: собеседование — **pan / pani + 3-е лицо**, ответ в 1-м; jestem punktualny (не «punktualnie»); odpowiedzialny ≠ odpowiedni.
  - L4 `szc-4-umowa`: **tysiąc / tysiące / tysięcy**, brutto / netto, okres próbny, umowa na czas określony / nieokreślony, wypowiedzenie ≠ wypowiedź.
  - L5 `szc-5-port`: **предложный с чередованием**: w porcie, na statku, w stoczni, na Odrze; wypływa z ≠ wpływa do.
  - L6 `szc-6-moglbys`: **mógłbyś / mogłabyś / moglibyście**, czy mógłby pan; zamienić się zmianami, zastąpić.
  - L7 `szc-7-spoznienie`: **bo / ponieważ**, przepraszam **za** + винительный, spóźnię się; L4 онлайн.
  - L8 `szc-8-podwyzka`: **chciałbym, wolałbym, mógłbym**; rozmawiać o + предложный ≠ pytać o + винительный; awans ≠ аванс (zaliczka).
  - Экзамен `szc-boss`: 12 заданий.
- Нужна проверка носителем.

## Łódź — уроки 9–16: время, утро, график, здоровье, повторение (2026-10-26)
- Файл `lodz-zycie.ts`, три новые темы перед экзаменом: `lodz-dzien` «День і графік» (L9–L12), `lodz-zdrowie`
  «Здоров'я» (L13–L15), `lodz-powtorka` «Повторення: вечір у Лодзі» (L16). 8 уроков, 15–16 заданий, 13–14 разных типов заданий в уроке.
  - L9 `lodz-9-ktora-godzina` (A1): Która jest godzina?, **o** + местный (o ósmej), **wpół do** + родительный,
    kwadrans po / za kwadrans, punktualnie, spóźnić się **o** dziesięć minut (дистрактор «na» — калька).
  - L10 `lodz-10-poranek` (A1): возвратные глаголы, **się** не в начале предложения, najpierw / potem, brać prysznic.
  - L11 `lodz-11-grafik` (A2): zaczynać / kończyć, **od … do** + родительный, часы до 24 (czternasta), pensja ≠ пенсия
    (emerytura), nadgodziny, umowa o pracę / umowa zlecenie («Mam umowę zlecenie»).
  - L12 `lodz-12-urlop` (A2): Czy mogę…?, urlop (20 или 26 дней по стажу, 4 дня — urlop na żądanie), mieć wolne,
    potrzebuję **dnia wolnego**, zamienić się ze mną zmianą, звательный **Panie Tomaszu**.
  - L13 `lodz-13-boli-mnie` (A1): **boli** mnie głowa / **bolą** mnie plecy, mam + винительный (gorączkę),
    jestem chory / chora, нейтрально по роду — **Źle się czuję**.
  - L14 `lodz-14-przychodnia` (A2): rejestracja, zapisać się do lekarza, termin, PESEL, skierowanie, zwolnienie
    lekarskie (L4, электронно).
  - L15 `lodz-15-apteka` (A2): coś **na** + винительный (na kaszel — не «от»), bez recepty, e-recepta (код + PESEL),
    dwa razy dziennie, po jedzeniu, 2 tabletki / 20 tabletek.
  - L16 `lodz-16-plany` (A2, повторение): spotkać się, do kina / do restauracji, na film, плюс повтор времени, графика,
    самочувствия и выходного из L9–L15.
- Все 47 слов словаря Лодзи, которые ещё не были в уроках, теперь в уроках (77 из 77).
- Обращение к ученику без навязанного рода: собеседники говорят на «ты» или безлично («Proszę wpisać…»); формы
  chory / chora даются как грамматика. Пояснение экзамена «Перевір усе, що вивчив» заменено на «Перевір усе з Лодзі».
- Экзамен `lodz-boss`: +6 заданий в конец (время, się, график, боль, «do środy», «coś na ból głowy») — 18 заданий.
  Порядок старых заданий не меняется: новые вставляются по новым номерам (seed `ON CONFLICT DO NOTHING`).
  Тема и пояснение экзамена и описание `lodz-egzamin` обновляются в засеянной БД через `TEXT_FIXES` (только если там
  ещё старый текст из кода). Тема города в `cities.ts` («Звуки, робота, час і здоров'я») — seed обновляет всегда.
- L1, L3, L4: по одному заданию в конец (было 11, стало 12): listen «źle / żle / zle», listen «Mój tata jest kierowcą»,
  reverseChoice «Oni / One / Ono są z Polski».
- Картинки-варианты (`pictureChoice`) для «prysznic», «ząb», «tabletka» заменены выбором перевода: пиктограмм душа,
  зуба и таблетки на клиенте нет (тест `visual-keys`).
- **Доступ к экзамену.** Билет растёт 8 → 16 (seed). `LEGACY_CITY_LESSONS` теперь хранит снимки уроков до каждого
  расширения: для Лодзи — L1–L4 и L1–L8. Снимок открывает экзамен, если все его уроки пройдены раньше `created_at`
  самого раннего урока вне снимка. Итог: кто прошёл L1–L8 до появления L9–L16, сохраняет экзамен; кто проходит после —
  проходит 16 уроков. Сданные экзамены и открытые города не трогаются; L9 открыт сразу после L8.
  Тесты: `legacy-exam-access` (+1: второй снимок, до и после), `lodz-expansion` (16 уроков по очереди через API,
  экзамен только после шестнадцатого; оба расширения после старых уроков).
- content-lint: 4 ложных «пропущенных диакритика» (3-е лицо: Marek **pije**, Oleh **zostaje**, Kto **chce**) — в
  `PLAIN_OK`. Из stash перенесена правка запроса в «тот же запрос и ответ»: пустая строка обрывала цепочку `??`, и у
  READING / ODD_ONE_OUT / SENTENCE_TRANSLATION запрос всегда был пустым — группа «тот же запрос» сократилась 21 → 11
  настоящих совпадений, новых уроков среди них нет.
- Фонетика: озвучка новых фраз не прослушивалась (см. `docs/POLISH_TTS_BENCHMARK.md`).

## Łódź — тема «Praca w Łodzi» (2026-10-26)
- Новая тема `lodz-praca` (перед `lodz-egzamin`), 4 урока по 16 заданий = 64 задания:
  `lodz-5-gdzie-pracujesz` (pracować, w + местный, na budowie), `lodz-6-szukam-pracy` (szukać + родительный,
  объявление: brutto/netto, pełny etat), `lodz-7-rozmowa` (umieć + инфинитив, znać + винительный, od kiedy),
  `lodz-8-pierwszy-dzien` (BHP: kask, kamizelka; trzeba / nie wolno; «Proszę + инфинитив»).
  Словарь: `vocab-lodz.ts`, 77 слов (работа, склад, время, город); новая тема словаря `time`.
  Пиктограмма 🏭 → factory.
- Редактура перед подключением: L8 — вопрос по тексту «Що обов'язково в цеху?» (была опечатка и смешение языков);
  L8 — объяснение «używać + родительный всегда» (было неверное «после отрицания»); L7 — в диалоге убрано прошедшее
  время, которое ещё не проходили (`pracowałem` → `mam dwa lata doświadczenia`); L5 — «В политехническом университете».
- Обрезано до 16 заданий на урок по новой норме 12–16 (уроки ещё не выходили, у пользователей прогресса по ним нет):
  L5 −4 (wordChoice «fabryka» дублировал pictureChoice того же слова; второй grammar `pracujesz`; listen
  «siostra jest pielęgniarką» — творительный ещё не объяснялся; второй reading по тому же тексту), L6 −3 (reading про
  prawo jazdy, listen «pół etatu», wordOrder «Wysyłam CV…»), L8 −2 (reading «где аптечка» — слово уже в match,
  wordOrder «Wyjście awaryjne…»).
- Билет: в Лодзи 8 обычных уроков, `ticket_lessons` 4 → 8 при seed (значение только растёт).
- Старые уроки Лодзи (`lodz-1…lodz-4`) записаны в `LEGACY_CITY_LESSONS`. Правило уточнено для всех городов:
  экзамен по старым урокам остаётся открытым только у тех, кто прошёл их **до** появления новых уроков города
  (`first_completed_at` ≤ самого раннего `created_at` нового урока). Раньше правило не смотрело на время, и любой
  новый ученик после старых уроков (Варшава — 6 из 26) сразу получал экзамен, пропуская остальной маршрут.
  Влияние на прогресс: у тех, кто прошёл старые уроки до расширения, ничего не меняется; уже сданные экзамены и
  открытые города не трогаются; у тех, кто прошёл старые уроки после расширения и ещё не сдавал экзамен, экзамен
  снова откроется после всех обычных уроков города (так и задумывалось).
- Тест `apps/server/test/lodz-expansion.test.ts`: уроки 1–8 открываются по очереди и проходятся через API, экзамен
  только после восьмого; правило старых уроков с учётом времени.
- content-lint: ложные «одинаковые варианты» в заданиях на ударение (`her-BA-ta` / `HER-ba-ta`) — линтер больше не
  нормализует регистр для навыка `pronunciation.stress`; `pracuje` / `karta` — законные формы без диакритики.

## Łódź: этаж, уровни CEFR словаря, разбор content-lint (2026-10-26, вторая итерация)

### Как правки доходят до уже засеянной БД
Seed без `force` вставляет с `ON CONFLICT DO NOTHING`, поэтому правка контент-файла сама по себе меняет только новые базы.
- Задания — `EXERCISE_FIXES` (`exercise-fixes.ts`, +7 записей): `UPDATE` по (урок, порядок) только если type, skill, data
  и explanation в строке всё ещё равны старой версии из кода.
- Словарь — новый механизм `VOCAB_FIXES` (`vocab-fixes.ts`) и `vocabFixSql()` в `seed.ts`: `UPDATE vocabulary_entries`
  по (pl, pos) только если колонка (`cefr` или `examples`) всё ещё равна старому значению. Правки уровня строятся из
  `LODZ_CEFR`, поэтому код и правка не расходятся; content-lint сверяет это.
- ID не меняются (`e_<hash(slug)>_<order>`, `v_<hash(pl|pos)>`), правки из админки не перезаписываются, повторный запуск
  ничего не меняет. Проверено на D1 (Miniflare) вне тестового набора: база засеяна seed-ом из `HEAD`, затем выполнен новый
  seed. Изменилось 54 из 55 строк словаря и 6 из 7 заданий (по одной строке заранее «правил редактор»: `kask` = B2,
  `opo-boss#2` — они остались как есть). Повторный прогон: 0 изменений. Число слов (659), заданий (1558) и связей
  урок–слово (563) не изменилось.

### Этаж: `biuro` — «Biuro jest na trzecim piętrze.»
- Было: uk «на четвертому поверсі», ru «на четвёртом этаже», en «on the third floor». Ученик видел «trzecim = четвёртый»
  без объяснения, а английский перевод называл другое число, чем русский и украинский.
- Поля для примечания у примера нет (`examples: { pl, tr }[]`), поэтому пояснение вошло в сам перевод: польское число
  переводится буквально, а наш счёт объясняется рядом, без польских слов внутри русской и украинской фразы (кроме
  термина parter в скобках). Счёт от parter объясняется раньше Лодзи — в Варшаве (`waw-n1-sasiad#16`), потом в Кракове
  (`krk-h2-pokoj`).
- Стало: uk «Офіс на третьому поверсі — у Польщі перший поверх (parter) не рахують, тож у нас це четвертий.»;
  ru «Офис на третьем этаже — в Польше первый этаж (parter) не считают, так что по-нашему это четвёртый.»;
  en «The office is on the third floor (the ground floor, parter, is not counted).» Все три называют то же число, что
  и польский (третий), и объясняют, почему по нашему счёту это четвёртый (в английском британский счёт совпадает с польским).
- В заданиях `lodz-praca.ts` этажи и `piętro` не встречаются (проверено поиском); `biuro` там только как место работы.
  В БД — через `VOCAB_FIXES` (колонка `examples`).

### Łódź: уровни CEFR словаря (77 слов)
Раньше всем 77 словам ставился `A1` одной строкой. Теперь уровень задаётся по слову в `LODZ_CEFR` (`vocab-lodz.ts`).

Где используется `cefr` слова: подпись и сортировка в «Словнике» (`/vocab` сортирует по cefr, затем по pl), фильтр
`/vocab?cefr=` и фильтр в админке; подбор дистракторов в практике берёт только A0 — затронутых слов там нет. Допустимые
значения — `CEFR_LEVELS` (A0, A1, A2, B1, B2), их проверяет content-lint.

**Критерий** (правила сверху вниз, слово получает уровень первого сработавшего):
- Основание: дескрипторы CEFR (Council of Europe, 2001; Companion Volume, 2020) — «Vocabulary range» и глобальная шкала:
  A1 — отдельные слова и фразы для конкретных ситуаций; A2 — рутинные бытовые ситуации, в числе тем непосредственной
  значимости прямо названа сфера найма (employment); B1 — работа, путешествия, текущие события с перифразом.
  Тематический объём уровней по стандартам государственных экзаменов PKPJPO (certyfikatpolski.pl) пословно **не сверялся**:
  сайт из рабочей среды недоступен (защита Cloudflare, HTTP 403). Пограничные слова вынесены в список на проверку ниже.
- Внутренние ориентиры курса: профессии из `lodz-3-zawody` (nauczyciel, kierowca, sprzedawca, lekarz) и lekarz / apteka /
  recepta в словаре уже стоят как A1.

| Правило | Уровень | Слова |
|---|---|---|
| B1-1 термины трудового права и оплаты | B1 | umowa o pracę, umowa zlecenie, pełny etat, nadgodziny, brutto, netto |
| B1-2 служебные и медицинские документы, обозначения | B1 | zwolnienie lekarskie, skierowanie, wyjście awaryjne |
| B1-3 абстрактные понятия и процедура найма | B1 | doświadczenie, rozmowa kwalifikacyjna |
| B1-4 договорённость: возвратный сов. вид + z kimś + na coś | B1 | zamienić się |
| A2-1 сфера найма (CEFR A2: employment) | A2 | firma, oferta pracy, CV, agencja pracy, stawka, na godzinę, pensja, grafik, urlop, wolne, dzień wolny, prawo jazdy, od kiedy, budowa, magazynier |
| A2-2 узкая лексика рабочего места | A2 | kask, rękawice, kamizelka, szatnia, apteczka |
| A2-3 здоровье сверх «boli mnie + часть тела»: симптомы, поликлиника, аптека, дозировка; gardło; plecy (только мн. ч.: bolą mnie plecy) | A2 | gardło, plecy, gorączka, kaszel, katar, przychodnia, rejestracja, tabletka, syrop, bez recepty, dwa razy dziennie, po jedzeniu |
| A2-4 форма выше A1: совершенный вид, менее частотные возвратные глаголы распорядка, сравнительная степень | A2 | zacząć, spóźnić się, spotkać się, budzić się, golić się, wcześniej |
| A2-5 время и город | A2 | wpół do (+ родительный порядкового), kwadrans, punktualnie, deptak |
| A1 конкретная частотная лексика бытовой сферы | A1 | fabryka, biuro, szpital, restauracja, kino, film, kucharz, pielęgniarka, szukać, umieć, zaczynać, kończyć, myć się, ubierać się, prysznic, głowa, brzuch, noga, ząb, chory, temperatura, godzina, uwaga |

**Итог: A1 — 23, A2 — 42, B1 — 12** (всего 77). При ближайшем seed в существующей БД уровень сменят 54 слова (A1 → A2/B1),
если редактор не менял их вручную.

**На лингвистическую проверку** (соседний уровень тоже защитим): firma, kucharz, pielęgniarka, umieć, temperatura,
wolne, dzień wolny, od kiedy (A1 или A2); kask, rękawice, kamizelka (A2 по частотности при простой форме); pensja, stawka,
pełny etat, nadgodziny, doświadczenie, zamienić się, apteczka (A2 или B1).

**Следствия, не исправленные в этой правке:**
- Уроки `lodz-5…8` и город Łódź остаются `A1`, хотя их лексика — A1–B1. `lessons.cefr` при прохождении поднимает
  `languageLevel` ученика (`maxCefr`), поэтому смена уровня урока — решение продукта, а не правка словаря.
- Остальной словарь (≈580 слов) размечен по уроку, а не по слову: например, kierownik, faktura, wypłata, wniosek,
  karta pobytu стоят как A1, хотя по тому же критерию это A2–B1. Не менялось; рекомендуется отдельный проход.
- Из 77 слов Лодзи в уроках используется 30; остальные 47 (здоровье, аптека, утро, время, Piotrkowska, часть рабочих
  тем) пока есть только в словаре — под будущие уроки города (§11 мастер-промпта: «словарь не полностью связан с
  упражнениями»).
- Примеры словаря с прошедшим временем мужского рода (Wysłałem CV…, Skręciłem nogę…, miałem…, dostałem…) — прошедшее
  в уроках Лодзи ещё не вводилось, а форма навязывает род. Вынесено на лингвистическую проверку.

### content-lint: разбор находок (было → стало)
Линтер теперь печатает в консоль число находок по каждой категории (раньше заголовки категорий отфильтровывались, и
вывод выглядел как «ничего нет» при коде 0). Код выхода по-прежнему 0 — это отчёт.

**Аудио ≠ ответ: 4 → 0 — ложное срабатывание.** `waw-5-liczby#8`, `wro-3-ceny#5`, `wro-boss#4`, `exam-a1#11`:
задание «услышь число словами — выбери цифрами» («Razem czterdzieści pięć złotych» → «45 zł»), текстовое сравнение
тут не годится. Это не allowlist: линтер переводит польские числительные из аудио в числа и сверяет их с цифрами ответа
(и наличие «złot…», если в ответе «zł»). Все 4 совпали по значению; неверная цифра в ответе снова даст находку.

**Возможные пропущенные диакритики: 55 → 0 — все ложные** (48 пар «задание — слово»; словарь линтера знает только формы
с ą/ę и помечает любую совпадающую без знаков). Каждая пара проверена в контексте и внесена в `PLAIN_OK` с причиной.
Ключ — «задание слово», поэтому та же форма в другом задании снова попадёт в отчёт; запись, которая перестала
срабатывать, выводится отдельной категорией «Застарілі записи allowlist».
- Именительный падеж или совпадающая с ним форма (32): woda (не орудный wodą) — `krk-d3-bilet#7`, `krk-z1-produkty#4/#13/#16`,
  `krk-z2-ceny#5/#9`, `krk-z5-misja#4/#12/#18`, `waw-k4-misja#3`, `wro-1-kawa#0/#6`; niegazowana — `krk-z5-misja#4`;
  jedna stacja — `waw-c3-metro#11`, `waw-c4-misja#2/#3`; karta miejska — `waw-c2-bilety#2`; poczta — `waw-p5-misja#7`;
  cisza nocna — `waw-n2-blok#3/#4/#7`, `waw-n4-misja#4/#6`; zupa pomidorowa — `krk-re1-dania#10`, `wro-boss#8`;
  zimna — `krk-re3-kelner#5/#10`, `waw-f3-gusty#6`; pomoc (существительное, винительный = именительный; pomóc — глагол) —
  `waw-s4-misja#8`, `krk-r4-droga#8`, `opo-1-siema#4`, `waw-n4-misja#17`.
- 3-е лицо ед. ч. (7): chce — `exam-a1#3`, `waw-f4-misja#3`, `wro-4-restauracja#4`; pije — `waw-f3-gusty#9/#10`;
  kupuje — `kat-4-te-ta#0`; zostaje — `lodz-1-alfabet#0`.
- Намеренный неверный вариант на падеж (6): `waw-f1-kawa#4` cytryna, `krk-z1-produkty#7` и `krk-z5-misja#5` woda,
  `krk-z1-produkty#14` и `krk-z5-misja#3` «Poproszę kanapka i woda.» (неверная реплика в диалоге), `krk-re2-zamawianie#4` pomidorowa.
- Различение букв (3): `lodz-1-alfabet#6` zaba (ż / ź / z), `lodz-2-dwuznaki#2` и `lodz-boss#1` reka (rz / r / ż).

**Кириллица в польских полях: 2 → 0 — подтверждённая ошибка, исправлено.** Подсказка контекста стояла внутри польского
предложения и только по-украински — пользователи ru/en видели украинский текст:
- `opo-3-ogarniac#4` «(Колезі) Spóźnię się 5 minut, ___ to za mnie?» → польское поле без подсказки; контекст перенесён в
  перевод на трёх языках: «Колезі: …» / «Коллеге: …» / «To a colleague: …».
- `opo-boss#2` «(Лист до керівниці) Dzień dobry, niestety ___ …» → так же: «Лист до керівниці: …» / «Письмо
  руководительнице: …» / «Email to your manager: …».
Варианты, ответ и пояснение не менялись.

**Точные и нормализованные дубликаты: 5 → 0 — подтверждённые повторы, заменены копии во входном тесте и экзамене**
(уроки — основной материал, тест и экзамен их только копировали). Навык и позиция в тесте те же:
- `placement-test#0` «Dziękuję» (= `waw-2-uprzejmosc#0`) → «Do widzenia»: До побачення / Добрий вечір / Дякую.
- `placement-test#4` «To jest ___ siostra» (= `krk-1-rodzina#5`) → найди ошибку «To jest moja mieszkanie»: mieszkanie —
  средний род, хотя «квартира» — женского; ловит перенос рода из родного языка. С объяснением.
- `placement-test#6` «Poproszę ___» kawę (= `wro-1-kawa#4`) → выбери предложение: «Czytam książkę.» / książka / książką. С объяснением.
- `placement-test#7` «To kosztuje pięć ___» (= `wro-3-ceny#2`) → выбери предложение: «Mam pięć biletów.» / bilety / bilet. С объяснением.
- `exam-a1#14` «Рахунок, будь ласка» (= `wro-4-restauracja#9`) → «Вибачте, де тут аптека?» →
  «Przepraszam, gdzie tu jest apteka» (+ варианты порядка tu/tutaj и без «tu»).
Попутно ушла находка «Серии механик > 3» (5 → 0): во входном тесте было 8 FILL_GAP из 10, теперь 5 и не больше двух
подряд. «Фраза-цель в 3+ заданиях» для «poproszę rachunek»: ×4 → ×3 (остались `krk-re4-rachunek#15`,
`wro-4-restauracja#6` и `#9` — не трогались, это другая категория).

**Что происходит с прогрессом при заменах.** Ничего не удаляется и не переносится. ID строк заданий прежние, число
заданий во входном тесте (10) и экзамене (17) прежнее. История ответов (`attempts`) хранит тип и навык на момент ответа.
Незавершённые сессии доигрываются по своему снимку заданий. Уже полученный `placementLevel` и лучший результат экзамена
не пересчитываются. У тех, кто ошибся в старой версии задания, повторение ошибок (`review_schedule`, тип EXERCISE)
покажет новое задание того же навыка в той же строке.

**Ключи словаря: новая проверка в content-lint, 0 находок.** Проверяется: каждое слово из `words` уроков (включая
`lodz-5…8`, вход и экзамен) и из шагов миссий есть в словаре; `pl` уникален (seed ищет слово урока по `pl`); уровень
входит в `CEFR_LEVELS`; ключи `LODZ_CEFR` существуют; каждая запись `VOCAB_FIXES` указывает на существующее слово, а её
новое значение совпадает с кодом. Справочно (не находки): 32 тега тем словаря в 229 записях отсутствуют в `TOPICS`
(station, directions, tickets, trains, shop, culture…) — фильтр словаря по теме их не показывает; вне этой задачи.

**Не разбирались в этой итерации** (числа не изменились, кроме указанного выше): «Тот же запрос и ответ» 21,
«Фраза-цель в 3+» 4, «Миссии» 11 (по два правильных варианта в шаге), «Без авторского пояснения» по типам (FILL_GAP
23 → 20: три новых задания входного теста идут с объяснением).
Замечено попутно: в диалогах неверная реплика подписана переводом «(помилка у відмінку)» — подпись подсказывает ответ.
