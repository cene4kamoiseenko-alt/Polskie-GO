# Мастера экрана «Квесты» (пакет владельца 2026-11-01)

Владелец прислал скриншоты экрана с заглушками и семь новых картинок («Замени на наши новые картинки»). Здесь лежат мастера (WebP, качество 94; исходники — PNG владельца), из которых собираются ассеты приложения
(`node scripts/build-quests-art.mjs`, `node scripts/build-pass-art.mjs`).

| Файл | Размер | Куда |
|---|---|---|
| `hero_krakow_barista_2x1.webp` | 1774×887 | баннер «Квесты»: Бобек-бариста с кофе на площади в Кракове (`hero.webp`) |
| `life_sklep24_16x9.webp` | 1672×941 | миниатюра «Польский в жизни»: Sklep 24h, Бобек машет рукой (`life.webp`) |
| `story_warszawa_dworzec_16x9.webp` | 1672×941 | квест `s-warszawa-dworzec` «Бобр прибывает в Варшаву» |
| `story_krakow_mieszkanie_16x9.webp` | 1672×941 | квест `s-krakow-mieszkanie` «Бобр ищет квартиру» |
| `story_wroclaw_zgubiony_16x9.webp` | 1672×941 | квест `s-wroclaw-zgubiony` «Бобр потерялся во Вроцлаве» |

Два кадра с названиями на картинке — «Polskie Boże Narodzenie» и «Поездка в Energylandię» — лежат в `docs/design/v19/pass/` (`season_swieta_16x9.webp`, `season_energylandia_16x9.webp`): это обложки сезонов пропуска
«Польское Рождество» и «Поездка в Energylandię» (календарь сезонов `/pass`), а не картинки квестов.
