# POLSKI GO — следующий этап Mini App

Составлено 2026-10-27 после релиза быстрых вопросов бота (`RELEASE_REPORT.md`). Это план, а не отчёт о сделанном: что из него уже начато, помечено явно.

## 0. Что мешает больше всего (по фактам из кода)

| Проблема | Факт | Где видно |
|---|---|---|
| Уроков почти нет за пределами трёх городов | Warszawa 26, Kraków 41, Łódź 17, Katowice / Opole / Wrocław — по 4 урока + босс, **14 городов из 20 — 0 уроков** | `apps/server/seed.sql` (101 урок, 1689 заданий) |
| Фоны городов неполные | 3 финальных, 15 временных (вырезки с досок, Real-ESRGAN ×4), 2 отсутствуют (Gorzów, Gdynia) | `packages/shared/src/cityArt.ts`, `docs/CITY_ART_INVENTORY.md` |
| Серверная озвучка не подключена | ключей провайдеров нет; клиент говорит польским голосом устройства (на части Android — плохим или никаким) | `docs/POLISH_TTS_BENCHMARK.md` |
| Голос по умолчанию в коде устарел | `pl-PL-Wavenet-A` нет в официальном списке Google (есть Chirp 3: HD ×30, Wavenet-F/G, Standard-F/G) | `apps/server/src/services/tts.ts` `DEFAULT_VOICES` |
| Распознавание речи выключено | Azure и (с 2026-10-27) Google STT в коде, но ни один не включён → микрофонные задания работают в режиме «без проверки» | `apps/server/src/services/stt.ts`, `docs/AUDIO_SETUP_RU.md` |
| Картинки бота с русскими надписями | для uk / pl / en и для `/profile`, `/stop`, серии, возвращения нужны версии без текста | `apps/web/public/bot/scenes/ru/`, `assets/telegram/asset-manifest.json` → `blocked_scenes` |

## 1. Визуальный редизайн (по порядку)

Принцип: единый живописный стиль досок владельца (тёплый свет, мягкие контуры, насыщенные цвета), Бобек — один слоистый персонаж (`useLook`/`BeaverLook`, ADR-005). Не «карточки на градиенте»: у каждого экрана своя сцена.

1. **Экран загрузки** — уже есть вертикальный фон Варшавы (`b2e0604`). Дальше: прогресс как «поезд между городами» (реальная загрузка чанков, без фальшивых процентов), Бобек машет, 3 польские фразы дня с переводом. Цель — первый кадр < 1,5 с на 4G, вес < 150 КБ.
2. **Фоны городов** — раздел 4: мастер-файлы 2880×1440 для 17 городов. Пока их нет, временные кадры остаются, а у Gorzów/Gdynia — векторная сцена с подписью «Оформление: скоро» (так и должно быть, без подмены чужими картинками).
3. **Карта** — путь между городами как железная дорога; открытый / текущий / закрытый город различимы без цвета (иконка + подпись); переход в город — короткий «въезд» (scale + fade 250 мс, без анимации при `reducedMotion`).
4. **Игровые карточки и упражнения** — крупный польский текст, кнопка «🔊» и «🐢» (медленно) у каждой фразы, варианты ответа с буквами, вибрация (Telegram HapticFeedback) на верно/неверно.
5. **Верно / неверно** — нижняя шторка: верно — зелёная с реакцией Бобека, неверно — правильный ответ + короткое объяснение + «повторить позже» (уже уходит в повторения).
6. **Итог урока** — XP, точность, новые слова (с озвучкой), «серия дней», кнопка следующего урока; анимация Бобека — 1 из 4 поз по результату.
7. **Анимации Бобека** — ограниченный набор поз (wave, cheer, think, sad, chef и т.д.) спрайтами WebP, без тяжёлого Lottie на старте; `prefers-reduced-motion` и настройка «меньше анимаций» уже учитываются.
8. **Гардероб, достижения, профиль, Premium** — гардероб M2 (примерка/покупка) готов; дальше — витрина костюмов по городам, достижения с «как получить», профиль с недельной активностью (календарные дни, уже без DST-сдвига), Premium — честное сравнение Free/Premium.
9. **Мобильная адаптация** — 320–430 px, safe-area, клавиатура iOS не перекрывает поле ввода, кнопки ≥ 44 px, прокрутка шторок (e2e A3 это уже проверяет).

## 2. Озвучка: Google Cloud Text-to-Speech

Исследование 2026-10-26 (`docs/POLISH_TTS_BENCHMARK.md`, `tts-catalog.ts`) и проверка 2026-10-27:

* **Голоса pl-PL**: 30 голосов Chirp 3: HD (`pl-PL-Chirp3-HD-Kore`, `-Aoede`, `-Charon`…), `pl-PL-Wavenet-F/G`, `pl-PL-Standard-F/G`. Кандидаты слепого теста: Kore, Aoede, Charon (Chirp 3: HD) + Wavenet-F/G.
* **Цены** (сверить перед оплатой): Chirp 3: HD — 1 млн символов в месяц бесплатно, далее $30 за 1 млн; WaveNet/Standard — 4 млн бесплатно, далее $4. Для всего текущего контента (≈ 2 тыс. фраз, ~ 60–80 тыс. символов на две скорости) это в пределах бесплатного объёма. **Billing не включён и без разрешения владельца включаться не будет.**
* **Ограничения Chirp 3: HD**: SSML не принимается — только обычный текст; скорость — `audioConfig.speakingRate` (0,25–2,0). Код уже так и делает (`input.text` + `speakingRate`), медленная скорость работает без SSML. Паузы в диалогах — отдельный синтез каждой реплики (уже по фразам).
* **Что есть в коде**: провайдер Google/Azure/ElevenLabs, явный выбор `TTS_PROVIDER`, аварийный выключатель `off`, кеш D1 `tts_cache` с ключом `текст|провайдер|модель|голос|скорость|версия`, отпечаток голоса на клиенте, Cache Storage, бюджет и квоты, буквы («W» → «wu»), админка (статус, список голосов, перенос кеша), план слепого теста.
* **Что сделать**:
  1. Владелец создаёт проект Google Cloud, включает Text-to-Speech API, создаёт API-ключ с ограничением «только Text-to-Speech API», кладёт в Cloudflare как Secret `GOOGLE_TTS_API_KEY`; `TTS_PROVIDER=google`, `GOOGLE_TTS_VOICE=pl-PL-Chirp3-HD-Kore` (или победитель слепого теста). Без включённого billing Google синтез не отдаёт — это решение владельца.
  2. Слепой тест 5 голосов на 40 фразах (`scripts/tts-benchmark.ts`, уже готов) — слушает человек.
  3. Предгенерация: прогон всех фраз уроков на обеих скоростях в кеш (админка, частями, с оценкой стоимости до запуска).
  4. R2 вместо D1 для аудио — когда кеш превысит ~ 500 МБ (D1 бесплатно 5 ГБ на всё). R2: 10 ГБ бесплатно, без платы за исходящий трафик. Переход — тот же ключ кеша, другой бэкенд.
  5. Резерв: нет сети/ключа/квоты → голос устройства (только польский), явная подпись «голос устройства».

## 3. Голосовые задания и распознавание речи

* Сейчас: запись WAV 16 кГц в браузере, сервер `/api/speech` → Azure (если `AZURE_STT_ENABLED=true`), сравнение с ожидаемой фразой (`alignSpeechWords`), повтор; без провайдера задание честно помечается «без проверки», XP за непроверенную речь не даётся.
* **Google Speech-to-Text для pl-PL**: 60 минут в месяц бесплатно, далее около $0,016 за минуту (с логированием данных) — сверить перед подключением. Модели v2 (`chirp`) поддерживают польский. Реплика ученика 2–4 с → ~ 0,05 мин, то есть 1200 попыток в бесплатном объёме.
* **Важно**: распознавание слов ≠ оценка произношения. Распознавание отвечает «сказал ли ученик эти слова», но не оценивает фонетику (ś/sz/ć/cz, носовые ą/ę). Фонетическую оценку даёт только Azure Pronunciation Assessment (pl-PL поддерживается) — это отдельный платный режим. В интерфейсе так и называть: «распознано» / «не распознано», без «произношение 92 %».
* **Сделано 2026-10-27 (код и тесты, без реального Google):** провайдер Google STT рядом с Azure — тот же `transcribeSpeech`, явное включение `GOOGLE_STT_ENABLED=true`, ключ `GOOGLE_STT_API_KEY` только на сервере и только в заголовке `X-Goog-Api-Key`, выбор `STT_PROVIDER` (auto/azure/google/off), модель — `GOOGLE_STT_MODEL` по желанию. 6 тестов на подменённом `fetch` (`stt.test.ts`). Подключение владельцем — `docs/AUDIO_SETUP_RU.md`, раздел «Google Speech-to-Text». Ключ Google TTS тоже перенесён из адреса запроса в заголовок.
* Дальше: проверка на телефоне после включения; подсказка по конкретному слову («ś» распознано как «s») — только как «распознано иначе», не как оценка звука.

## 4. Города: полный список и что нужно

Фактическая карта — 20 городов seed (`apps/server/src/content/cities.ts`), тест `city-art.test.ts` сверяет их с `CITY_ART` и файлами. Дубликатов нет (18 файлов — 18 разных md5). Уроки — по `seed.sql`.

| # | Город | Фон | Что на кадре / чего нет | Уроков |
|---|---|---|---|---|
| 1 | Warszawa | final 1440×720 | Старый город, Замковая площадь, колонна Сигизмунда | 26 |
| 2 | Łódź | interim 984×512 | Manufaktura (с вывеской-текстом); **нет Piotrkowska** | 17 |
| 3 | Kraków | final 1440×720 | Rynek, Sukiennice, Mariacki | 41 |
| 4 | Katowice | interim 1176×488 | Spodek | 5 |
| 5 | Opole | interim 1024×520 | ратуша, мост над Одрой | 5 |
| 6 | Wrocław | final 1440×720 | Остров Тумский, гномик; **нет Rynek** | 5 |
| 7 | Poznań | interim 1200×456 | ратуша; козлики не различимы | 0 |
| 8 | Zielona Góra | interim 1472×660 | ратуша, лоза | 0 |
| 9 | Gorzów Wlkp. | **нет файла** | — | 0 |
| 10 | Szczecin | interim 776×504 | Wały Chrobrego (самый мелкий исходник) | 0 |
| 11 | Gdańsk | interim 896×576 | Żuraw | 0 |
| 12 | Gdynia | **нет файла** | — | 0 |
| 13 | Bydgoszcz | interim 1620×668 | зернохранилища над Брдой | 0 |
| 14 | Toruń | interim 1448×668 | готический Старый город | 0 |
| 15 | Olsztyn | interim 1480×660 | замок капитула, озеро | 0 |
| 16 | Białystok | interim 1440×668 | собор; **нет дворца Браницких** | 0 |
| 17 | Lublin | interim 1000×448 | замок | 0 |
| 18 | Rzeszów | interim 1460×668 | Rynek с ратушей | 0 |
| 19 | Kielce | interim 1560×660 | дворец епископов | 0 |
| 20 | Zakopane | interim 1640×688 | Татры, деревянные дома | 0 |

**Города нельзя считать готовыми**: 2 фона отсутствуют, 15 временные. Чужие или случайные картинки вместо них не подставлялись.

### Нужные файлы

`apps/web/src/assets/cities/<slug>.webp` (1440×720 из мастера ≥ 2880×1440, WebP q74–76, ≤ 220 КБ) и `<slug>@640.webp` (≤ 60 КБ). После замены — `status: 'final'` в `CITY_ART` (инструкция в `docs/CITY_ART_INVENTORY.md`).

### Промты (по одному на город)

Общая часть — в начало каждого промта:

> Wide 2:1 cartoon painterly illustration, 2880×1440, warm golden-hour light, vivid saturated colours, soft outlines, cheerful travel-game city card in one consistent style. No text, no letters, no logos, no readable signs, no watermarks, no characters or people in close-up. The main landmark sits in the central 60 % of the width, between 15 % and 85 % of the height. Calm empty foreground (cobblestones, water or grass) in the lower-left third.

| slug | Сюжет (дописать после общей части) |
|---|---|
| `lodz` | Łódź, Poland: Piotrkowska Street — a long pedestrian street of ornate 19th-century Art Nouveau tenement houses with balconies, street lamps, café umbrellas, a rickshaw; in the distance the red-brick chimney of an old textile factory. |
| `katowice` | Katowice, Poland: the flying-saucer-shaped Spodek arena in the centre, the modern NOSPR concert hall and glass towers of the Silesian Museum behind it, a green park and the roundabout bridge in the foreground. |
| `opole` | Opole, Poland: the Market Square with the town hall and its tall square tower, colourful townhouses, and the "Opole Venice" — houses rising straight from the Młynówka canal with a small blue footbridge. |
| `wroclaw` | Wrocław, Poland: the Market Square (Rynek) with the Gothic Old Town Hall with stepped gables and an astronomical clock, colourful townhouses, and a few tiny bronze dwarf statues on the cobblestones. |
| `poznan` | Poznań, Poland: the Renaissance town hall on the Old Market Square with its white arcaded facade and clock tower where two small mechanical goats butt heads, the narrow colourful merchants' houses in front of it. |
| `zielona-gora` | Zielona Góra, Poland: the town hall with its slender tower on the market square, the round Palm House on the hill behind, vineyards on the slopes, bunches of grapes in the foreground. |
| `gorzow` | Gorzów Wielkopolski, Poland: the Warta river embankment with the riverside promenade, the red-brick Gothic Cathedral of the Assumption with its massive square tower, townhouses behind it, the old railway viaduct on the side, small boats on the river. |
| `szczecin` | Szczecin, Poland: Wały Chrobrego — monumental terraces above the Oder with the National Museum and the green-domed provincial office buildings, white ships moored at the river quay, the Pomeranian Dukes' Castle in the distance. |
| `gdansk` | Gdańsk, Poland: the medieval wooden-and-brick Crane (Żuraw) on the Motława river, the colourful narrow facades of Długie Pobrzeże along the quay, a historic sailing ship on the water. |
| `gdynia` | Gdynia, Poland: the harbour seen from the Southern Pier — the white three-masted sailing ship "Dar Pomorza" at the quay, the grey museum destroyer next to it, the modernist Sea Towers skyscraper and port cranes behind, the Baltic Sea and seagulls. |
| `bydgoszcz` | Bydgoszcz, Poland: half-timbered red granaries on the Brda river, the tightrope-walker sculpture balancing on a wire above the river, Mill Island with trees, a small river tram. |
| `torun` | Toruń, Poland: the Gothic Old Town seen from the Vistula — red-brick town hall tower, church spires, city walls and gates along the river, the Copernicus monument on the market square. |
| `olsztyn` | Olsztyn, Poland: the red-brick Castle of the Warmian Chapter with its square tower, the High Gate (Brama Wysoka) of the old town, and a lake with white sails among green forests. |
| `bialystok` | Białystok, Poland: the white baroque Branicki Palace ("Polish Versailles") seen from its French garden — symmetrical facade with a central tower and the griffin gate, trimmed hedges, fountains and flower beds. |
| `lublin` | Lublin, Poland: the Kraków Gate (Brama Krakowska) — a Gothic brick gate tower with a baroque top — leading into the colourful Old Town, with the neo-Gothic castle on the hill in the background. |
| `rzeszow` | Rzeszów, Poland: the Market Square with the town hall with small turrets and the Kościuszko statue, café umbrellas, and the Lubomirski Castle with its bastions behind the old town. |
| `kielce` | Kielce, Poland: the early-baroque Palace of the Kraków Bishops with its three towers and arcaded loggia, the formal Italian garden in front, and the white limestone cliffs of the Kadzielnia reserve in the distance. |
| `zakopane` | Zakopane, Poland: the Giewont peak and the Tatra mountains behind, wooden highlander houses in the Zakopane style with steep shingled roofs, Krupówki street with lanterns, light snow. |
| `warszawa`, `krakow` | уже final; перерисовать только если выбран новый общий стиль. |

## 5. Картинки бота без текста

Комплект «16 images» сделан с русскими надписями; для uk / pl / en и для динамического текста нужны **те же сцены без надписей** (art-only), 1280×720 или больше, JPEG/PNG:

`welcome`, `lessons`, `map`, `words`, `quests`, `profile` (без цифр уровня/XP), `settings` (без списка пунктов), `help`, `reminder` (без «19:00» на часах), `streak` (без цифры 7), `return` (без имени), `quick_question` (без вопроса и вариантов), `correct_answer` (без ответа и «+20 XP»), `shopping`, `food`, `transport`. Подключение — без изменений кода: файлы кладутся в `apps/web/public/bot/commands/` под именами из `catalog.ts`.

## 6. Произношение — известные проблемы

* Голос по умолчанию Google в коде — `pl-PL-Wavenet-A` (нет в официальном списке): перед включением Google задать `GOOGLE_TTS_VOICE` из Chirp 3: HD.
* Голос ElevenLabs по умолчанию — английский готовый голос (Rachel): польский прозвучит с акцентом; выбирать голос из Voice Library (pl).
* Одиночные буквы: «W» читается как название буквы — исправлено (`wu`); предлоги «w/z» в начале фразы не трогаются.
* Голос устройства: на части Android польского голоса нет — тогда кнопка «🔊» честно говорит «нет польского голоса», а не читает русским.
* Медленная скорость — `speakingRate`; при голосе устройства — `rate` Web Speech (качество зависит от устройства).
* Ошибки фонетики (ś/sz, ć/cz, ą/ę) распознавание слов не ловит — см. раздел 3.

## 7. Мобильные приоритеты

1. Первый экран < 1,5 с на 4G (сейчас JS 218 КБ, gzip 70 КБ; фоны городов грузятся лениво).
2. Клавиатура iOS в текстовых заданиях, safe-area снизу, `viewportStableHeight` Telegram.
3. Кнопки ≥ 44 px, шторки прокручиваются (e2e A3), нет горизонтальной прокрутки (e2e на 360/390/430).
4. Аудио на iOS только после жеста пользователя; Cache Storage для фраз урока.
5. Реальная проверка на iPhone и Android в Telegram — **не делалась** (нет устройств в этой среде); чек-лист — `docs/RELEASE_CHECKLIST.md`.

## 8. Кому что

| Задача | Кому | Почему |
|---|---|---|
| Уроки для Katowice / Opole / Wrocław (до 16–18), затем Poznań, Gdańsk… | Sonnet (контент) + проверка Opus | объём текста и упражнений; Opus проверяет грамматику, CEFR и тесты |
| Тексты, переводы ru/uk/en/pl, объяснения | Sonnet | шаблонная работа по готовым образцам |
| Провайдер Google STT, R2-кеш озвучки, предгенерация с бюджетом | Opus | ключи, деньги, безопасность, конкурентность |
| Редизайн экранов (загрузка, карта, карточки, итог) | Sonnet по макетам, ревью Opus | много однотипной вёрстки; Opus — архитектура компонентов и производительность |
| Анимации Бобека, гардероб, слои | Opus (ADR-005) | общая модель персонажа, риск сломать «один Бобек везде» |
| Миграции D1, платежи, webhook, админка | Opus | данные пользователей и деньги |
| Мастер-файлы городов и art-only картинки бота | владелец (генерация по промтам выше), подключение — любой агент | генерацией изображений в этой среде никто не располагает |
