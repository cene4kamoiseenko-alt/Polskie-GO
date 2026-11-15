/**
 * Zakopane — B2, фінал: «Культура і подорожі». Уроки 1–4: гори й погода (дієприслівники на -ąc: idąc, wiedząc, nie patrząc; один підмет), górale й безособове
 * «się» (mówi się gwarą, robi się oscypki, używa się ciupagi), Крупівки (moim zdaniem, zgadzam się z + орудний, targować się o + знахідний, jeśli kupię ≠ gdybym kupił)
 * і Віткацій (дієприкметники namalowany / zainspirowany / uznawany za, znany jako, przez + знахідний). Уроки 5–8 й іспит — zakopane-5-8.ts.
 * Правила якості — docs/EXERCISE_QUALITY.md: у шагах діалогу по три варіанти, неправильні варіанти — різної природи. Словник — vocab-zakopane.ts.
 * Культурні й історичні відомості (Witkacy, styl zakopiański, redyk, ciupaga, Kasprowy Wierch) — для перевірки носієм і довідниками, див. docs/CONTENT_AUDIT_RU.md.
 */
import { t, wordChoice, fillGap, listen, findError, oddOne, reading, translate, grammar, build, match, speak, dialogue } from './builders';
import type { CityContent, LessonSeed } from './types';
import { ZAK_5_8, ZAK_BOSS } from './zakopane-5-8';

const RATOWNIK = { name: 'Pan Marcin', emoji: '👨🏻‍🚒', role: t('гірський рятівник', 'горный спасатель', 'a mountain rescuer') };
const BACA = { name: 'Baca Józef', emoji: '👴🏼', role: t('баца — головний пастух', 'баца — главный пастух', 'a baca — the head shepherd') };
const STRAGANIARKA = { name: 'Pani Ewa', emoji: '🛍️', role: t('продавчиня на ятці', 'продавщица на лотке', 'a market-stall seller') };
const MUZEALNICZKA = { name: 'Pani Joanna', emoji: '👩🏼‍🎨', role: t('екскурсовод у музеї', 'экскурсовод в музее', 'a museum guide') };

const ZAK_1: LessonSeed = {
  slug: 'zak-1-gory',
  title: t('Гори й погода: дієприслівники', 'Горы и погода: деепричастия', 'Mountains and weather: adverbial participles'),
  topic: t(
    'Дієприслівник на -ąc (idąc, wchodząc, wiedząc, nie patrząc) — одночасна дія, той самий підмет; ostrzeżenie przed + орудний, zagrożenie lawinowe, halny, kolejka linowa',
    'Деепричастие на -ąc (idąc, wchodząc, wiedząc, nie patrząc) — одновременное действие, то же подлежащее; ostrzeżenie przed + творительный, zagrożenie lawinowe, halny, kolejka linowa',
    'The adverbial participle in -ąc (idąc, wchodząc, wiedząc, nie patrząc) — simultaneous action, same subject; ostrzeżenie przed + instrumental, zagrożenie lawinowe, halny, kolejka linowa',
  ),
  cefr: 'B2',
  difficulty: 5,
  explanation: t(
    '**Мета:** розповідати про похід у гори стисло, дієприслівником, і розуміти попередження рятівників.\n**Дієприслівник на -ąc** будують від 3-ї особи множини недоконаного виду: **idą → idąc**, **wchodzą → wchodząc**, **wiedzą → wiedząc**. Він означає **одночасну дію того самого підмета**: **Idąc na przełęcz, podziwialiśmy widoki** («ми йшли й милувалися»). Підмет у головному реченні один: *Idąc szlakiem, zaczął padać deszcz* — помилка. Заперечення: **nie patrząc**. Не плутай із прикметниковим **idący** («той, що йде»).\nУ горах: **ostrzeżenie przed lawiną** (**przed** + орудний), **zagrożenie lawinowe** (п’ять ступенів), **halny** — теплий сильний вітер, **kolejka linowa** під час нього не їздить.',
    '**Цель:** коротко, деепричастием, рассказывать о походе в горы и понимать предупреждения спасателей.\n**Деепричастие на -ąc** образуют от 3-го лица множественного числа несовершенного вида: **idą → idąc**, **wchodzą → wchodząc**, **wiedzą → wiedząc**. Оно означает **одновременное действие того же подлежащего**: **Idąc na przełęcz, podziwialiśmy widoki** («мы шли и любовались»). Подлежащее в главном предложении одно: *Idąc szlakiem, zaczął padać deszcz* — ошибка. Отрицание: **nie patrząc**. Не путай с причастием **idący** («тот, кто идёт»).\nВ горах: **ostrzeżenie przed lawiną** (**przed** + творительный), **zagrożenie lawinowe** (пять степеней), **halny** — тёплый сильный ветер, **kolejka linowa** при нём не ходит.',
    '**Goal:** tell about a mountain hike concisely with an adverbial participle and understand the rescuers’ warnings.\n**The -ąc participle** is made from the 3rd person plural of an imperfective verb: **idą → idąc**, **wchodzą → wchodząc**, **wiedzą → wiedząc**. It expresses an **action simultaneous with the main verb and done by the same subject**: **Idąc na przełęcz, podziwialiśmy widoki** (“we walked and admired”). The main clause must have the same subject: *Idąc szlakiem, zaczął padać deszcz* is wrong. Negation: **nie patrząc**. Do not confuse it with the adjectival **idący** (“the one who walks”).\nIn the mountains: **ostrzeżenie przed lawiną** (**przed** + instrumental), **zagrożenie lawinowe** (five levels), **halny** — a warm strong wind, when the **kolejka linowa** does not run.',
  ),
  examples: [
    { pl: 'Idąc na przełęcz, podziwialiśmy widoki Tatr.', tr: t('Ідучи на перевал, ми милувалися краєвидами Татр.', 'Идя на перевал, мы любовались видами Татр.', 'Walking up to the pass, we admired the views of the Tatras.') },
    { pl: 'Wiedząc o zagrożeniu lawinowym, wróciliśmy wcześniej.', tr: t('Знаючи про лавинну небезпеку, ми повернулися раніше.', 'Зная об опасности лавин, мы вернулись раньше.', 'Knowing about the avalanche danger, we came back earlier.') },
  ],
  words: ['przełęcz', 'halny', 'lawina', 'kolejka linowa', 'zagrożenie', 'ostrzeżenie'],
  exercises: [
    dialogue('dialogue.gory', RATOWNIK, [
      {
        npc: 'Jak wam się szło w górach?',
        tr: t('Як вам ішлося в горах?', 'Как вам шлось в горах?', 'How was your walk in the mountains?'),
        choose: [
          ['Idąc szlakiem, podziwialiśmy widoki.', t('Ідучи стежкою, ми милувалися краєвидами.', 'Идя по тропе, мы любовались видами.', 'Walking along the trail, we admired the views.')],
          ['Idąc szlakiem, zaczął padać deszcz.', t('(підмети різні — «ми» й «дощ»; дієприслівник вимагає того самого підмета)', '(подлежащие разные — «мы» и «дождь»; деепричастие требует того же подлежащего)', '(the subjects differ — “we” and “rain”; an adverbial participle needs the same subject)')],
          ['Idący szlakiem, podziwialiśmy widoki.', t('(**idący** — прикметниковий дієприкметник «той, що йде»; одночасна дія — **idąc**)', '(**idący** — причастие «идущий»; одновременное действие — **idąc**)', '(**idący** is the adjectival participle “walking”; a simultaneous action takes **idąc**)')],
        ],
        feedback: t('Одночасна дія того самого підмета — **idąc**.', 'Одновременное действие того же подлежащего — **idąc**.', 'A simultaneous action by the same subject — **idąc**.'),
      },
      {
        npc: 'Czy wiedzieliście o ostrzeżeniu przed lawiną?',
        tr: t('Чи ви знали про попередження щодо лавин?', 'Вы знали о предупреждении о лавинах?', 'Did you know about the avalanche warning?'),
        choose: [
          ['Tak, wiedząc o zagrożeniu, wróciliśmy wcześniej.', t('Так, знаючи про небезпеку, ми повернулися раніше.', 'Да, зная об опасности, мы вернулись раньше.', 'Yes, knowing about the danger, we came back earlier.')],
          ['Tak, wiedzieć o zagrożeniu, wróciliśmy wcześniej.', t('(після коми потрібен дієприслівник **wiedząc**, а не інфінітив)', '(нужно деепричастие **wiedząc**, а не инфинитив)', '(the participle **wiedząc** is needed, not the infinitive)')],
          ['Tak, nie wiedząc o zagrożeniu, wróciliśmy wcześniej.', t('(**nie wiedząc** — «не знаючи»: суперечить відповіді «так»)', '(**nie wiedząc** — «не зная»: противоречит ответу «да»)', '(**nie wiedząc** means “not knowing” — it contradicts “yes”)')],
        ],
        feedback: t('**wiedząc** — «знаючи»; заперечення дало б протилежний зміст.', '**wiedząc** — «зная»; отрицание дало бы обратный смысл.', '**wiedząc** — “knowing”; a negation would reverse the meaning.'),
      },
    ]),
    wordChoice('vocab.gory', 'halny', [t('теплий сильний гірський вітер (фен)', 'тёплый сильный горный ветер (фён)', 'a warm, strong mountain wind (foehn)'), t('сніговий буран', 'снежная метель', 'a snowstorm'), t('густий ранковий туман', 'густой утренний туман', 'thick morning fog')]),
    fillGap('grammar.gory', 'Idąc na przełęcz, my ___ widoki Tatr.', ['podziwialiśmy', 'podziwiali', 'podziwiał'], t('Ідучи на перевал, ми милувалися краєвидами Татр.', 'Идя на перевал, мы любовались видами Татр.', 'Walking up to the pass, we admired the views of the Tatras.'),
      t('Підмет **my** — тому **podziwialiśmy** (той самий, що в дієприслівника).', 'Подлежащее **my** — значит **podziwialiśmy** (то же, что у деепричастия).', 'The subject is **my**, so **podziwialiśmy** (the same as the participle’s).')),
    match('vocab.gory', [
      ['przełęcz', t('гірський перевал', 'горный перевал', 'mountain pass')],
      ['zagrożenie lawinowe', t('лавинна небезпека', 'лавинная опасность', 'avalanche danger')],
      ['kolejka linowa', t('канатна дорога', 'канатная дорога', 'cable car')],
      ['ostrzeżenie', t('попередження, застереження', 'предупреждение', 'a warning')],
    ]),
    grammar('grammar.gory', '___ w góry, zawsze sprawdzam prognozę pogody.', 'iść', ['Idąc'], t('Ідучи в гори, я завжди перевіряю прогноз погоди.', 'Идя в горы, я всегда проверяю прогноз погоды.', 'When I go into the mountains I always check the weather forecast.'),
      t('Одночасна дія — дієприслівник: **Idąc**.', 'Одновременное действие — деепричастие: **Idąc**.', 'A simultaneous action takes the adverbial participle: **Idąc**.')),
    listen('listening.gory', 'Idąc przez przełęcz, usłyszeliśmy ostrzeżenie przed lawiną.', ['Idąc przez przełęcz, usłyszeliśmy ostrzeżenie przed lawiną.', 'Idąc przez przełęcz, usłyszeliśmy ostrzeżenie przed lawinami.', 'Idąc przez przełęcz, usłyszałem ostrzeżenie przed lawiną.']),
    reading('reading.gory', 'Komunikat TOPR: w sobotę w wyższych partiach Tatr wieje halny z prędkością do stu kilometrów na godzinę. Obowiązuje trzeci stopień zagrożenia lawinowego w pięciostopniowej skali. Kolejka linowa na Kasprowy Wierch może zostać wyłączona, gdy wiatr przekroczy sześćdziesiąt kilometrów na godzinę. Turystom zaleca się wybór niższych szlaków oraz zabranie czapki, rękawic i mapy.',
      t('Коли канатну дорогу може бути вимкнено?', 'Когда канатную дорогу могут отключить?', 'When may the cable car be switched off?'),
      [t('коли вітер перевищить шістдесят кілометрів на годину', 'когда ветер превысит шестьдесят километров в час', 'when the wind exceeds sixty kilometres an hour'), t('коли вітер перевищить сто кілометрів на годину', 'когда ветер превысит сто километров в час', 'when the wind exceeds a hundred kilometres an hour'), t('коли лавинна небезпека досягне п’ятого ступеня', 'когда лавинная опасность достигнет пятой степени', 'when the avalanche danger reaches level five')]),
    findError('grammar.gory', ['Patrzący', 'w', 'niebo', 'zaczęliśmy', 'się', 'martwić'], 0, t('Дивлячись у небо, ми почали хвилюватися.', 'Глядя в небо, мы начали волноваться.', 'Looking at the sky, we began to worry.'),
      t('Одночасна дія — дієприслівник **Patrząc**, а не прикметниковий **patrzący**.', 'Одновременное действие — деепричастие **Patrząc**, а не причастие **patrzący**.', 'A simultaneous action takes the adverbial **Patrząc**, not the adjectival **patrzący**.')),
    build('grammar.gory', 'Kolejka linowa nie kursuje bo wieje halny', t('Канатна дорога не їздить, бо дме гальний', 'Канатная дорога не ходит, потому что дует гальный', 'The cable car is not running because the halny is blowing'), ['halna', 'kursują']),
    oddOne('grammar.gory', ['idąc', 'patrząc', 'wiedząc', 'idący'], 3,
      t('**Idący** — прикметниковий дієприкметник («той, що йде»), решта — дієприслівники на **-ąc**.', '**Idący** — причастие («идущий»), остальные — деепричастия на **-ąc**.', '**Idący** is the adjectival participle (“walking”); the rest are adverbial participles in **-ąc**.'),
      t('Яка форма не є дієприслівником на -ąc?', 'Какая форма не является деепричастием на -ąc?', 'Which form is not an adverbial participle in -ąc?')),
    translate('writing.gory', t('Піднімаючись на перевал, ми знали про попередження щодо лавин.', 'Поднимаясь на перевал, мы знали о предупреждении о лавинах.', 'Climbing up to the pass, we knew about the avalanche warning.'),
      ['Wchodząc na przełęcz, wiedzieliśmy o ostrzeżeniu przed lawinami.', 'Wchodząc na przełęcz, wiedzieliśmy o ostrzeżeniu przed lawinami', 'Wchodząc na przełęcz, wiedzieliśmy o ostrzeżeniu przed lawiną.']),
    speak('speaking.gory', 'Idąc szlakiem, zawsze sprawdzam prognozę pogody i ostrzeżenia przed lawinami.', t('Ідучи стежкою, я завжди перевіряю прогноз погоди й попередження щодо лавин.', 'Идя по тропе, я всегда проверяю прогноз погоды и предупреждения о лавинах.', 'Walking a trail I always check the weather forecast and the avalanche warnings.')),
  ],
};

const ZAK_2: LessonSeed = {
  slug: 'zak-2-gorale',
  title: t('Górale й безособове «się»', 'Górale и безличное «się»', 'The highlanders and the impersonal “się”'),
  topic: t(
    'Безособовий зворот: 3-тя особа однини + się (mówi się gwarą, robi się oscypki, jada się, używa się ciupagi + родовий); redyk, bacówka, baca',
    'Безличный оборот: 3-е лицо единственного числа + się (mówi się gwarą, robi się oscypki, jada się, używa się ciupagi + родительный); redyk, bacówka, baca',
    'The impersonal construction: 3rd person singular + się (mówi się gwarą, robi się oscypki, jada się, używa się ciupagi + genitive); redyk, bacówka, baca',
  ),
  cefr: 'B2',
  difficulty: 5,
  explanation: t(
    '**Мета:** розповідати, що «роблять» у певному місці, не називаючи, хто саме.\n**Безособове się**: дієслово в **3-й особі однини** + **się**, без підмета: **Na Podhalu mówi się gwarą**, **W bacówce robi się oscypki**, **U nas na śniadanie je się kanapki**. Об’єкт лишається у **знахідному** (**robi się oscypki**), а дієслова з родовим дають родовий: **używa się ciupagi** (**używać** + родовий), **nie wolno straszyć owiec**. Форми на кшталт *jemy się*, *jesz się* — помилка: **się** тут завжди з 3-ю особою однини.\n**Górale** — мешканці Підгалля; **baca** — головний пастух, **bacówka** — пастуша хата, де роблять **oscypki**; **redyk** — весняний вихід овець на полонини; **ciupaga** — гірська палиця з обухом.',
    '**Цель:** рассказывать, что «делают» в каком-то месте, не называя, кто именно.\n**Безличное się**: глагол в **3-м лице единственного числа** + **się**, без подлежащего: **Na Podhalu mówi się gwarą**, **W bacówce robi się oscypki**, **U nas na śniadanie je się kanapki**. Объект остаётся в **винительном** (**robi się oscypki**), а глаголы с родительным дают родительный: **używa się ciupagi** (**używać** + родительный), **nie wolno straszyć owiec**. Формы вроде *jemy się*, *jesz się* — ошибка: **się** здесь всегда с 3-м лицом единственного числа.\n**Górale** — жители Подгалья; **baca** — главный пастух, **bacówka** — пастушья хижина, где делают **oscypki**; **redyk** — весеннее восхождение овец на пастбища; **ciupaga** — горский посох с топориком.',
    '**Goal:** say what “is done” in a place without saying who does it.\n**The impersonal się**: the verb in the **3rd person singular** + **się**, with no subject: **Na Podhalu mówi się gwarą**, **W bacówce robi się oscypki**, **U nas na śniadanie je się kanapki**. The object stays **accusative** (**robi się oscypki**), and verbs that take the genitive keep it: **używa się ciupagi** (**używać** + genitive), **nie wolno straszyć owiec**. Forms like *jemy się*, *jesz się* are wrong: **się** always goes with the 3rd person singular here.\n**Górale** are the people of Podhale; the **baca** is the head shepherd, the **bacówka** a shepherd’s hut where **oscypki** are made; the **redyk** is the spring drive of sheep to the pastures; the **ciupaga** is a highlander’s walking axe.',
  ),
  examples: [
    { pl: 'W bacówce robi się oscypki z mleka owczego.', tr: t('У бацівці з овечого молока роблять осципки.', 'В бацувке делают осципки из овечьего молока.', 'Oscypki are made from sheep’s milk in the bacówka.') },
    { pl: 'Ciupagi używa się do podpierania podczas marszu i jako ozdoby stroju.', tr: t('Ціпагою користуються для опори під час ходьби й як прикрасою строю.', 'Ципагой пользуются для опоры при ходьбе и как украшением костюма.', 'The ciupaga is used as a support when walking and as part of the costume.') },
  ],
  words: ['góral', 'gwara', 'ciupaga', 'baca', 'bacówka', 'redyk'],
  exercises: [
    dialogue('dialogue.gorale', BACA, [
      {
        npc: 'W bacówce robi się oscypki z mleka owczego. A co u was w domu je się na śniadanie?',
        tr: t('У бацівці з овечого молока роблять осципки. А що в вас удома їдять на сніданок?', 'В бацувке из овечьего молока делают осципки. А что у вас дома едят на завтрак?', 'In the bacówka we make oscypki from sheep’s milk. And what do you have for breakfast at home?'),
        choose: [
          ['U nas na śniadanie je się kanapki i pije się kawę.', t('У нас на сніданок їдять бутерброди й п’ють каву.', 'У нас на завтрак едят бутерброды и пьют кофе.', 'At home we have sandwiches and coffee for breakfast.')],
          ['U nas na śniadanie jeść kanapki i pić kawę.', t('(безособовий зворот — особова форма **je się**, а не інфінітив)', '(безличный оборот — личная форма **je się**, а не инфинитив)', '(the impersonal construction needs a finite form, **je się**, not an infinitive)')],
          ['U nas na śniadanie jemy się kanapki i pijemy się kawę.', t('(**się** стоїть лише з 3-ю особою однини: **je się**, **pije się**)', '(**się** ставится только с 3-м лицом единственного числа: **je się**, **pije się**)', '(**się** goes only with the 3rd person singular: **je się**, **pije się**)')],
        ],
        feedback: t('**je się**, **pije się** — 3-тя особа однини + **się**.', '**je się**, **pije się** — 3-е лицо единственного числа + **się**.', '**je się**, **pije się** — 3rd person singular + **się**.'),
      },
      {
        npc: 'Ciupaga to laska górali ze stalowym toporkiem. Do czego się jej używa?',
        tr: t('Ціпага — це палиця горян зі сталевою сокирою. Для чого нею користуються?', 'Ципага — это посох горцев со стальным топориком. Для чего ею пользуются?', 'The ciupaga is a highlander’s stick with a small steel axe. What is it used for?'),
        choose: [
          ['Używa się jej do podpierania podczas marszu i jako ozdoby stroju.', t('Нею користуються для опори під час ходьби й як прикрасою строю.', 'Ею пользуются для опоры при ходьбе и как украшением костюма.', 'It is used for support when walking and as an ornament of the costume.')],
          ['Używa się ją do podpierania podczas marszu i jako ozdoby stroju.', t('(**używać** + родовий: **jej**, а не знахідний)', '(**używać** + родительный: **jej**, а не винительный)', '(**używać** takes the genitive: **jej**, not the accusative)')],
          ['Używać się jej do podpierania podczas marszu i jako ozdoby stroju.', t('(після питання «do czego się jej używa?» — особова форма **używa się**)', '(после вопроса «do czego się jej używa?» — личная форма **używa się**)', '(a finite form, **używa się**, is needed, not the infinitive)')],
        ],
        feedback: t('**używać** + родовий: **używa się jej**.', '**używać** + родительный: **używa się jej**.', '**używać** + genitive: **używa się jej**.'),
      },
    ]),
    wordChoice('vocab.gorale', 'redyk', [t('весняний вихід овець на полонини', 'весеннее восхождение овец на пастбища', 'the spring drive of sheep to the pastures'), t('весільний танець горян', 'свадебный танец горцев', 'a highlanders’ wedding dance'), t('зимовий ярмарок у Закопаному', 'зимняя ярмарка в Закопане', 'a winter fair in Zakopane')]),
    fillGap('grammar.gorale', 'Na Podhalu ___ oscypki z żurawiną.', ['jada się', 'jadam się', 'jadają się'], t('На Підгаллі їдять осципки з журавлиною.', 'На Подгалье едят осципки с клюквой.', 'In Podhale people eat oscypki with cranberries.'),
      t('Безособове **się**: **jada się** (3-тя особа однини).', 'Безличное **się**: **jada się** (3-е лицо единственного числа).', 'The impersonal **się**: **jada się** (3rd person singular).')),
    match('vocab.gorale', [
      ['góral', t('мешканець Підгалля, горянин', 'житель Подгалья, горец', 'a highlander from Podhale')],
      ['baca', t('головний пастух отари', 'главный пастух отары', 'the head shepherd')],
      ['gwara', t('місцевий говір, діалект', 'местный говор, диалект', 'a local dialect')],
      ['bacówka', t('пастуша хата на пасовищі', 'пастушья хижина на пастбище', 'a shepherd’s hut on the pasture')],
    ]),
    grammar('grammar.gorale', 'Na Podhalu mówi się ___ góralską.', 'gwara', ['gwarą'], t('На Підгаллі говорять гірським говором.', 'На Подгалье говорят горским говором.', 'In Podhale people speak the highland dialect.'),
      t('**mówić** + орудний (чим?): **gwarą**.', '**mówić** + творительный (чем?): **gwarą**.', '**mówić** + instrumental (in what?): **gwarą**.')),
    listen('listening.gorale', 'W bacówce robi się oscypki z mleka owczego.', ['W bacówce robi się oscypki z mleka owczego.', 'W bacówce robi się oscypki z mleka koziego.', 'W bacówce robiło się oscypki z mleka owczego.']),
    reading('reading.gorale', 'Redyk to wiosenne wyjście owiec na górskie hale. Dawniej decydował o nim baca, który znał pogodę i zwyczaje stada. W drodze śpiewa się góralskie pieśni, a po dotarciu na miejsce jada się oscypki prosto z ogniska. Dziś redyk jest przede wszystkim atrakcją turystyczną: odbywa się w maju, a jego uczestnicy mogą kupić ser w bacówce.',
      t('Що роблять у дорозі під час редика?', 'Что делают в дороге во время редыка?', 'What do people do on the way during a redyk?'),
      [t('співають гірські пісні', 'поют горские песни', 'they sing highland songs'), t('грають у карти біля багаття', 'играют в карты у костра', 'they play cards by the fire'), t('продають овець туристам', 'продают овец туристам', 'they sell sheep to tourists')]),
    findError('grammar.gorale', ['W', 'bacówce', 'robi', 'się', 'oscypków', 'z', 'mleka'], 4, t('У бацівці роблять осципки з молока.', 'В бацувке делают осципки из молока.', 'Oscypki are made from milk in the bacówka.'),
      t('Об’єкт безособового зворота — знахідний: **robi się oscypki**.', 'Объект безличного оборота — винительный: **robi się oscypki**.', 'The object of the impersonal construction is accusative: **robi się oscypki**.')),
    build('grammar.gorale', 'Ciupagi używa się do podpierania podczas marszu', t('Ціпагою користуються для опори під час ходьби', 'Ципагой пользуются для опоры при ходьбе', 'The ciupaga is used for support when walking'), ['ciupagę', 'używają']),
    oddOne('grammar.gorale', ['robi się oscypki', 'je się kanapki', 'pije się herbatę', 'jemy się kanapki'], 3,
      t('**się** стоїть із 3-ю особою однини: **je się**.', '**się** ставится с 3-м лицом единственного числа: **je się**.', '**się** goes with the 3rd person singular: **je się**.'),
      t('Яка форма хибна?', 'Какая форма неверна?', 'Which form is wrong?')),
    translate('writing.gorale', t('У бацівці з овечого молока роблять осципки й продають їх туристам.', 'В бацувке из овечьего молока делают осципки и продают их туристам.', 'In the bacówka oscypki are made from sheep’s milk and sold to tourists.'),
      ['W bacówce z mleka owczego robi się oscypki i sprzedaje się je turystom.', 'W bacówce robi się oscypki z mleka owczego i sprzedaje się je turystom.', 'W bacówce z mleka owczego robi się oscypki i sprzedaje się je turystom']),
    speak('speaking.gorale', 'Na Podhalu mówi się gwarą góralską, a w bacówce robi się oscypki.', t('На Підгаллі говорять гірським говором, а в бацівці роблять осципки.', 'На Подгалье говорят горским говором, а в бацувке делают осципки.', 'In Podhale people speak the highland dialect, and oscypki are made in the bacówka.')),
  ],
};

const ZAK_3: LessonSeed = {
  slug: 'zak-3-krupowki',
  title: t('Крупівки: думка, згода, торг', 'Крупувки: мнение, согласие, торг', 'Krupówki: opinions, agreement, haggling'),
  topic: t(
    'Moim zdaniem; zgadzam się z + орудний; mam wątpliwości co do + родовий; zależy od + родовий; targować się o + знахідний; jeśli kupię (реальна умова) ≠ gdybym kupił',
    'Moim zdaniem; zgadzam się z + творительный; mam wątpliwości co do + родительный; zależy od + родительный; targować się o + винительный; jeśli kupię (реальное условие) ≠ gdybym kupił',
    'Moim zdaniem; zgadzam się z + instrumental; mam wątpliwości co do + genitive; zależy od + genitive; targować się o + accusative; jeśli kupię (a real condition) ≠ gdybym kupił',
  ),
  cefr: 'B2',
  difficulty: 5,
  explanation: t(
    '**Мета:** висловити думку, погодитися чи не погодитися й поторгуватися на ятці.\n**Думка:** **moim zdaniem** (фіксований зворот, не *moje zdanie*), **według mnie**, **jestem przekonany, że…**. **Згода:** **zgadzam się z** + орудний (**z panią**, **z nim**, **z tym**), **nie zgadzam się z…**; **sumnivy:** **mam wątpliwości co do** + родовий (**co do jakości**). **Zależy od** + родовий: **to zależy od ceny**.\n**Торг:** **targować się o** + знахідний — **o cenę**; **opuścić cenę** — знизити ціну. Реальна умова — **jeśli** + майбутній доконаний: **Jeśli kupię dwa swetry, czy dostanę rabat?** Нереальна — **gdybym kupił**, **dostałbym**. Рукоділля (**rękodzieło**) на бічних ятках дорожче, ніж **kicz** на головній вулиці.',
    '**Цель:** высказать мнение, согласиться или не согласиться и поторговаться на лотке.\n**Мнение:** **moim zdaniem** (устойчивый оборот, не *moje zdanie*), **według mnie**, **jestem przekonany, że…**. **Согласие:** **zgadzam się z** + творительный (**z panią**, **z nim**, **z tym**), **nie zgadzam się z…**; **сомнения:** **mam wątpliwości co do** + родительный (**co do jakości**). **Zależy od** + родительный: **to zależy od ceny**.\n**Торг:** **targować się o** + винительный — **o cenę**; **opuścić cenę** — снизить цену. Реальное условие — **jeśli** + будущее совершенного вида: **Jeśli kupię dwa swetry, czy dostanę rabat?** Нереальное — **gdybym kupił**, **dostałbym**. Рукоделие (**rękodzieło**) на боковых лотках дороже, чем **kicz** на главной улице.',
    '**Goal:** give an opinion, agree or disagree and haggle at a stall.\n**Opinion:** **moim zdaniem** (a fixed phrase, not *moje zdanie*), **według mnie**, **jestem przekonany, że…**. **Agreement:** **zgadzam się z** + instrumental (**z panią**, **z nim**, **z tym**), **nie zgadzam się z…**; **doubts:** **mam wątpliwości co do** + genitive (**co do jakości**). **Zależy od** + genitive: **to zależy od ceny**.\n**Haggling:** **targować się o** + accusative — **o cenę**; **opuścić cenę** — to lower the price. A real condition takes **jeśli** + perfective future: **Jeśli kupię dwa swetry, czy dostanę rabat?** An unreal one takes **gdybym kupił**, **dostałbym**. **Rękodzieło** at the side stalls costs more than the **kicz** on the main street.',
  ),
  examples: [
    { pl: 'Moim zdaniem Krupówki są zbyt gwarne, ale zgadzam się z panią co do rękodzieła.', tr: t('На мою думку, Крупівки надто гамірні, але щодо рукоділля я погоджуюся з вами.', 'По-моему, Крупувки слишком шумные, но насчёт рукоделия я с вами согласен.', 'In my opinion Krupówki is too noisy, but I agree with you about the handicraft.') },
    { pl: 'Jeśli kupię dwa swetry, czy może pani opuścić cenę?', tr: t('Якщо я куплю два светри, чи можете ви знизити ціну?', 'Если я куплю два свитера, не могли бы вы снизить цену?', 'If I buy two sweaters, could you lower the price?') },
  ],
  words: ['kicz', 'targować się', 'gwarny', 'nachalny', 'stragan', 'rękodzieło'],
  exercises: [
    dialogue('dialogue.krupowki', STRAGANIARKA, [
      {
        npc: 'Krupówki są dziś zbyt komercyjne. Co pan o tym myśli?',
        tr: t('Крупівки сьогодні надто комерційні. Що ви про це думаєте?', 'Крупувки сегодня слишком коммерческие. Что вы об этом думаете?', 'Krupówki is too commercial these days. What do you think?'),
        choose: [
          ['Zgadzam się z panią, chociaż lubię tu spacerować.', t('Я погоджуюся з вами, хоча люблю тут гуляти.', 'Я согласен с вами, хотя люблю здесь гулять.', 'I agree with you, although I like walking here.')],
          ['Zgadzam się z pani, chociaż lubię tu spacerować.', t('(**z** + орудний: **z panią**)', '(**z** + творительный: **z panią**)', '(**z** takes the instrumental: **z panią**)')],
          ['Zgadzam się z panią, chociaż lubię tu spaceruję.', t('(після **lubię** — інфінітив: **spacerować**)', '(после **lubię** — инфинитив: **spacerować**)', '(after **lubię** comes an infinitive: **spacerować**)')],
        ],
        feedback: t('**zgadzać się z** + орудний: **z panią**.', '**zgadzać się z** + творительный: **z panią**.', '**zgadzać się z** + instrumental: **z panią**.'),
      },
      {
        npc: 'Ten ręcznie robiony sweter kosztuje dwieście złotych.',
        tr: t('Цей светр ручної роботи коштує двісті злотих.', 'Этот свитер ручной работы стоит двести злотых.', 'This hand-made sweater costs two hundred zloty.'),
        choose: [
          ['To dość drogo. Czy może pani opuścić cenę, jeśli kupię dwa swetry?', t('Це дорогувато. Чи можете ви знизити ціну, якщо я куплю два светри?', 'Это дороговато. Не могли бы вы снизить цену, если я куплю два свитера?', 'That’s rather expensive. Could you lower the price if I buy two sweaters?')],
          ['To dość drogo. Czy może pani opuścić cenę, jeśli kupiłbym dwa swetry?', t('(реальна умова — **jeśli kupię**; **kupiłbym** — нереальна, з **gdyby**)', '(реальное условие — **jeśli kupię**; **kupiłbym** — нереальное, с **gdyby**)', '(a real condition takes **jeśli kupię**; **kupiłbym** belongs to an unreal one with **gdyby**)')],
          ['To dość drogo. Czy może pani opuścić ceny, jeśli kupię dwa swetry?', t('(**opuścić** + знахідний: **cenę**, не родовий)', '(**opuścić** + винительный: **cenę**, не родительный)', '(**opuścić** takes the accusative: **cenę**, not the genitive)')],
        ],
        feedback: t('Реальна умова — **jeśli kupię**; **opuścić cenę**.', 'Реальное условие — **jeśli kupię**; **opuścić cenę**.', 'A real condition — **jeśli kupię**; **opuścić cenę**.'),
      },
    ]),
    wordChoice('vocab.krupowki', 'nachalny', [t('нав’язливий, надто наполегливий', 'навязчивый, слишком настойчивый', 'pushy, too insistent'), t('рішучий і впевнений у собі', 'решительный и уверенный в себе', 'assertive and self-confident'), t('чесний і добросовісний', 'честный и добросовестный', 'honest and conscientious')]),
    fillGap('grammar.krupowki', 'Na straganach można targować się ___ cenę.', ['o', 'z', 'na'], t('На ятках можна торгуватися про ціну.', 'На лотках можно торговаться о цене.', 'You can haggle over the price at the stalls.'),
      t('**targować się o** + знахідний: **o cenę**.', '**targować się o** + винительный: **o cenę**.', '**targować się o** + accusative: **o cenę**.')),
    match('grammar.krupowki', [
      ['moim zdaniem', t('на мою думку', 'по-моему, на мой взгляд', 'in my opinion')],
      ['jestem przekonany, że', t('я переконаний, що', 'я убеждён, что', 'I am convinced that')],
      ['mam wątpliwości co do', t('маю сумніви щодо', 'у меня сомнения насчёт', 'I have doubts about')],
      ['to zależy od', t('це залежить від', 'это зависит от', 'it depends on')],
    ]),
    grammar('grammar.krupowki', 'Zgadzam się z ___ w tej sprawie.', 'on', ['nim'], t('Я погоджуюся з ним у цій справі.', 'Я согласен с ним в этом деле.', 'I agree with him on this matter.'),
      t('**z** + орудний: **z nim**.', '**z** + творительный: **z nim**.', '**z** + instrumental: **z nim**.')),
    listen('listening.krupowki', 'Moim zdaniem Krupówki są zbyt gwarne, ale mają niepowtarzalny klimat.', ['Moim zdaniem Krupówki są zbyt gwarne, ale mają niepowtarzalny klimat.', 'Moim zdaniem Krupówki nie są gwarne, ale mają niepowtarzalny klimat.', 'Jego zdaniem Krupówki są zbyt gwarne, ale mają niepowtarzalny klimat.']),
    reading('reading.krupowki', 'Krupówki to najbardziej znana ulica Zakopanego. Jedni uważają, że jest zbyt gwarna i pełna kiczu: plastikowych ciupag, sztucznych futer i nachalnych sprzedawców. Inni twierdzą, że bez tej atmosfery miasto straciłoby swój urok. W sklepach przy głównej ulicy ceny są stałe, natomiast na bocznych straganach, gdzie sprzedaje się rękodzieło, można się targować. Dobry sweter z wełny owczej kosztuje tam około trzystu złotych.',
      t('Де, за текстом, можна поторгуватися?', 'Где, по тексту, можно поторговаться?', 'According to the text, where can you haggle?'),
      [t('на бічних ятках', 'на боковых лотках', 'at the side stalls'), t('у магазинах на головній вулиці', 'в магазинах на главной улице', 'in the shops on the main street'), t('у кав’ярнях біля деревʼяних будиночків', 'в кафе у деревянных домиков', 'in the cafés by the wooden houses')]),
    findError('grammar.krupowki', ['Moje', 'zdaniem', 'Krupówki', 'są', 'zbyt', 'gwarne'], 0, t('На мою думку, Крупівки надто гамірні.', 'По-моему, Крупувки слишком шумные.', 'In my opinion Krupówki is too noisy.'),
      t('Фіксований зворот — **Moim zdaniem**.', 'Устойчивый оборот — **Moim zdaniem**.', 'The fixed phrase is **Moim zdaniem**.')),
    build('grammar.krupowki', 'Mam wątpliwości co do jakości tego swetra', t('Я маю сумніви щодо якості цього светра', 'У меня сомнения насчёт качества этого свитера', 'I have doubts about the quality of this sweater'), ['jakość', 'swetrze']),
    oddOne('grammar.krupowki', ['zależy od ceny', 'zależy od jakości', 'zależy od pogody', 'zależy z sezonu'], 3,
      t('**Zależeć od** + родовий: **od sezonu**.', '**Zależeć od** + родительный: **od sezonu**.', '**Zależeć od** + genitive: **od sezonu**.'),
      t('Яка фраза містить помилку?', 'Какое выражение содержит ошибку?', 'Which expression contains a mistake?')),
    translate('writing.krupowki', t('На мою думку, ця вулиця надто гамірна, але щодо рукоділля я з вами погоджуюся.', 'По-моему, эта улица слишком шумная, но насчёт рукоделия я с вами согласен.', 'In my opinion this street is too noisy, but I agree with you about the handicraft.'),
      ['Moim zdaniem ta ulica jest zbyt gwarna, ale zgadzam się z panią co do rękodzieła.', 'Moim zdaniem ta ulica jest zbyt gwarna, ale zgadzam się z panią co do rękodzieła', 'Moim zdaniem ta ulica jest zbyt gwarna, ale zgadzam się z państwem co do rękodzieła.']),
    speak('speaking.krupowki', 'Moim zdaniem na bocznych straganach warto się targować o cenę rękodzieła.', t('На мою думку, на бічних ятках варто торгуватися про ціну рукоділля.', 'По-моему, на боковых лотках стоит торговаться о цене рукоделия.', 'In my opinion it is worth haggling over the price of handicraft at the side stalls.')),
  ],
};

const ZAK_4: LessonSeed = {
  slug: 'zak-4-witkacy',
  title: t('Культура: Віткацій і Закопане', 'Культура: Виткаций и Закопане', 'Culture: Witkacy and Zakopane'),
  topic: t(
    'Дієприкметники: obraz namalowany przez Witkacego (przez + знахідний), zainspirowany górami, uznawany za twórcę (za + знахідний), znany jako malarz; узгодження в роді, числі й відмінку',
    'Причастия: obraz namalowany przez Witkacego (przez + винительный), zainspirowany górami, uznawany za twórcę (za + винительный), znany jako malarz; согласование в роде, числе и падеже',
    'Participles: obraz namalowany przez Witkacego (przez + accusative), zainspirowany górami, uznawany za twórcę (za + accusative), znany jako malarz; agreement in gender, number and case',
  ),
  cefr: 'B2',
  difficulty: 5,
  explanation: t(
    '**Мета:** розповідати про митця й твір, користуючись пасивними дієприкметниками.\n**Пасивний дієприкметник** (**-ny / -ty**) узгоджується з іменником у роді, числі й відмінку: **obraz namalowany**, **portret namalowany**, **dzieło namalowane**, **obrazy namalowane**. Автора вказують через **przez** + знахідний: **namalowany przez Witkacego**. **Uznawany za** + знахідний (**uznawany za twórcę awangardy**), **znany jako** + називний (**znany jako malarz**), **zainspirowany** + орудний (**zainspirowany górami**).\n**Witkacy** (Stanisław Ignacy Witkiewicz) — **malarz**, письменник і філософ, пов’язаний із Закопаним; його батько Stanisław Witkiewicz був **twórcą** стилю закопанського. Течія, у якій працював Віткацій, — польський **авангард** (**nurt** у мистецтві).',
    '**Цель:** рассказывать о художнике и произведении, используя страдательные причастия.\n**Страдательное причастие** (**-ny / -ty**) согласуется с существительным в роде, числе и падеже: **obraz namalowany**, **portret namalowany**, **dzieło namalowane**, **obrazy namalowane**. Автора указывают через **przez** + винительный: **namalowany przez Witkacego**. **Uznawany za** + винительный (**uznawany za twórcę awangardy**), **znany jako** + именительный (**znany jako malarz**), **zainspirowany** + творительный (**zainspirowany górami**).\n**Witkacy** (Станислав Игнаций Виткевич) — **malarz**, писатель и философ, связанный с Закопане; его отец Станислав Виткевич был **twórcą** закопанского стиля. Течение, в котором работал Виткаций, — польский **авангард** (**nurt** в искусстве).',
    '**Goal:** talk about an artist and a work using passive participles.\n**A passive participle** (**-ny / -ty**) agrees with its noun in gender, number and case: **obraz namalowany**, **portret namalowany**, **dzieło namalowane**, **obrazy namalowane**. The author is introduced with **przez** + accusative: **namalowany przez Witkacego**. **Uznawany za** + accusative (**uznawany za twórcę awangardy**), **znany jako** + nominative (**znany jako malarz**), **zainspirowany** + instrumental (**zainspirowany górami**).\n**Witkacy** (Stanisław Ignacy Witkiewicz) was a **malarz**, writer and philosopher tied to Zakopane; his father, Stanisław Witkiewicz, was the **twórca** of the Zakopane style. The current he worked in was the Polish **awangarda** (an art **nurt**).',
  ),
  examples: [
    { pl: 'Witkacy, znany jako malarz i pisarz, jest uznawany za jednego z twórców polskiej awangardy.', tr: t('Віткацій, відомий як художник і письменник, вважається одним із творців польського авангарду.', 'Виткаций, известный как художник и писатель, считается одним из создателей польского авангарда.', 'Witkacy, known as a painter and writer, is regarded as one of the creators of the Polish avant-garde.') },
    { pl: 'W muzeum wisi portret namalowany przez Witkacego w Zakopanem.', tr: t('У музеї висить портрет, намальований Віткацієм у Закопаному.', 'В музее висит портрет, написанный Виткацием в Закопане.', 'A portrait painted by Witkacy in Zakopane hangs in the museum.') },
  ],
  words: ['twórca', 'dzieło', 'malarz', 'zainspirowany', 'uznawany za', 'nurt', 'awangarda'],
  exercises: [
    dialogue('dialogue.witkacy', MUZEALNICZKA, [
      {
        npc: 'Czy zna pan Witkacego? To artysta uznawany za jednego z najważniejszych twórców polskiej awangardy.',
        tr: t('Чи знаєте ви Віткація? Це митець, якого вважають одним із найважливіших творців польського авангарду.', 'Вы знаете Виткация? Это художник, которого считают одним из важнейших создателей польского авангарда.', 'Do you know Witkacy? He is regarded as one of the most important creators of the Polish avant-garde.'),
        choose: [
          ['Tak, widziałem portret namalowany przez Witkacego.', t('Так, я бачив портрет, намальований Віткацієм.', 'Да, я видел портрет, написанный Виткацием.', 'Yes, I have seen a portrait painted by Witkacy.')],
          ['Tak, widziałem portret namalowanego przez Witkacego.', t('(дієприкметник узгоджується з **portret**: **namalowany**)', '(причастие согласуется с **portret**: **namalowany**)', '(the participle agrees with **portret**: **namalowany**)')],
          ['Tak, widziałem portret namalowany od Witkacego.', t('(автора вказують через **przez** + знахідний, а не **od**)', '(автора указывают через **przez** + винительный, а не **od**)', '(the author is introduced with **przez** + accusative, not **od**)')],
        ],
        feedback: t('**portret namalowany przez Witkacego**.', '**portret namalowany przez Witkacego**.', '**portret namalowany przez Witkacego**.'),
      },
      {
        npc: 'Był też autorem sztuk teatralnych. Co pana w nim najbardziej interesuje?',
        tr: t('Він був також автором п’єс. Що вас у ньому найбільше цікавить?', 'Он был также автором пьес. Что вас в нём больше всего интересует?', 'He was also the author of plays. What interests you most about him?'),
        choose: [
          ['Najbardziej interesuje mnie jego awangardowy styl i niezwykłe portrety.', t('Найбільше мене цікавить його авангардний стиль і незвичайні портрети.', 'Больше всего меня интересует его авангардный стиль и необычные портреты.', 'I am most interested in his avant-garde style and unusual portraits.')],
          ['Najbardziej interesuję się jego awangardowy styl i niezwykłe portrety.', t('(**interesuje mnie** + називний, або **interesuję się** + орудний)', '(**interesuje mnie** + именительный, или **interesuję się** + творительный)', '(either **interesuje mnie** + nominative, or **interesuję się** + instrumental)')],
          ['Najbardziej interesuje mnie jego awangardowego stylu i niezwykłych portretów.', t('(підмет — у називному: **styl i portrety**)', '(подлежащее — в именительном: **styl i portrety**)', '(the subject is nominative: **styl i portrety**)')],
        ],
        feedback: t('**interesuje mnie** + підмет у називному.', '**interesuje mnie** + подлежащее в именительном.', '**interesuje mnie** + a nominative subject.'),
      },
    ]),
    wordChoice('vocab.witkacy', 'twórca', [t('творець, автор (чогось)', 'создатель, автор (чего-либо)', 'creator, originator'), t('торговець творами мистецтва', 'торговец произведениями искусства', 'an art dealer'), t('критик, що оцінює виставки', 'критик, оценивающий выставки', 'a critic reviewing exhibitions')]),
    fillGap('grammar.witkacy', 'Witkacy jest uznawany ___ jednego z największych artystów.', ['za', 'jako', 'przez'], t('Віткація вважають одним із найбільших митців.', 'Виткация считают одним из величайших художников.', 'Witkacy is regarded as one of the greatest artists.'),
      t('**uznawany za** + знахідний.', '**uznawany za** + винительный.', '**uznawany za** + accusative.')),
    match('vocab.witkacy', [
      ['malarz', t('художник-живописець', 'художник-живописец', 'a painter')],
      ['dzieło', t('твір (мистецтва)', 'произведение (искусства)', 'a work of art')],
      ['nurt', t('течія, напрям у мистецтві', 'течение, направление в искусстве', 'a current in art')],
      ['zainspirowany', t('натхненний чимось', 'вдохновлённый чем-то', 'inspired by something')],
    ]),
    grammar('grammar.witkacy', 'To obraz ___ przez Witkacego w Zakopanem.', 'namalować', ['namalowany'], t('Це картина, намальована Віткацієм у Закопаному.', 'Это картина, написанная Виткацием в Закопане.', 'This is a picture painted by Witkacy in Zakopane.'),
      t('**obraz** — чоловічий рід: **namalowany**.', '**obraz** — мужской род: **namalowany**.', '**obraz** is masculine: **namalowany**.')),
    listen('listening.witkacy', 'Witkacy był malarzem, pisarzem i filozofem związanym z Zakopanem.', ['Witkacy był malarzem, pisarzem i filozofem związanym z Zakopanem.', 'Witkacy była malarką, pisarką i filozofką związaną z Zakopanem.', 'Witkacy był malarzem, pisarzem i filozofem związanym z Zakopanem od dzieciństwa.']),
    reading('reading.witkacy', 'Stanisław Ignacy Witkiewicz, znany jako Witkacy, był malarzem, pisarzem i filozofem. Mieszkał w Zakopanem, gdzie tworzył portrety, uznawane dziś za jedno z najważniejszych osiągnięć polskiej awangardy. Jego ojciec, Stanisław Witkiewicz, był twórcą stylu zakopiańskiego, czyli architektury zainspirowanej góralskim budownictwem. Dzieła obu artystów można zobaczyć w Muzeum Tatrzańskim.',
      t('Хто був творцем закопанського стилю?', 'Кто был создателем закопанского стиля?', 'Who created the Zakopane style?'),
      [t('батько Віткація', 'отец Виткация', 'Witkacy’s father'), t('сам Віткацій', 'сам Виткаций', 'Witkacy himself'), t('його брат', 'его брат', 'his brother')]),
    findError('grammar.witkacy', ['Zainspirowana', 'górami', 'Witkacy', 'namalował', 'wiele', 'pejzaży'], 0, t('Натхненний горами, Віткацій намалював багато пейзажів.', 'Вдохновлённый горами, Виткаций написал много пейзажей.', 'Inspired by the mountains, Witkacy painted many landscapes.'),
      t('Дієприкметник узгоджується з підметом **Witkacy** (чол. рід): **Zainspirowany**.', 'Причастие согласуется с подлежащим **Witkacy** (муж. род): **Zainspirowany**.', 'The participle agrees with the subject **Witkacy** (masculine): **Zainspirowany**.')),
    build('grammar.witkacy', 'Witkacy jest uznawany za twórcę polskiej awangardy', t('Віткація вважають творцем польського авангарду', 'Виткация считают создателем польского авангарда', 'Witkacy is regarded as a creator of the Polish avant-garde'), ['twórca', 'jako']),
    oddOne('grammar.witkacy', ['znany jako malarz', 'uznawany za twórcę', 'zainspirowany górami', 'znany za malarza'], 3,
      t('**Znany jako** + називний: **znany jako malarz**.', '**Znany jako** + именительный: **znany jako malarz**.', '**Znany jako** + nominative: **znany jako malarz**.'),
      t('Яка фраза містить помилку?', 'Какое выражение содержит ошибку?', 'Which expression contains a mistake?')),
    translate('writing.witkacy', t('Віткацій, відомий як художник і письменник, жив у Закопаному.', 'Виткаций, известный как художник и писатель, жил в Закопане.', 'Witkacy, known as a painter and writer, lived in Zakopane.'),
      ['Witkacy, znany jako malarz i pisarz, mieszkał w Zakopanem.', 'Witkacy, znany jako malarz i pisarz, mieszkał w Zakopanem', 'Witkacy, znany jako malarz i pisarz, żył w Zakopanem.']),
    speak('speaking.witkacy', 'Witkacy jest uznawany za jednego z najważniejszych twórców polskiej awangardy.', t('Віткація вважають одним із найважливіших творців польського авангарду.', 'Виткация считают одним из важнейших создателей польского авангарда.', 'Witkacy is regarded as one of the most important creators of the Polish avant-garde.')),
  ],
};

export const ZAKOPANE: CityContent = {
  city: 'zakopane',
  routes: [
    {
      slug: 'zak-gory',
      title: t('Гори й горяни', 'Горы и горцы', 'Mountains and highlanders'),
      description: t('Idąc na przełęcz…, mówi się gwarą, robi się oscypki', 'Idąc na przełęcz…, mówi się gwarą, robi się oscypki', 'Idąc na przełęcz…, mówi się gwarą, robi się oscypki'),
      icon: 'explore',
      lessons: [ZAK_1, ZAK_2],
    },
    {
      slug: 'zak-kultura',
      title: t('Крупівки й Віткацій', 'Крупувки и Виткаций', 'Krupówki and Witkacy'),
      description: t('Moim zdaniem, zgadzam się z…, obraz namalowany przez…', 'Moim zdaniem, zgadzam się z…, obraz namalowany przez…', 'Moim zdaniem, zgadzam się z…, obraz namalowany przez…'),
      icon: 'shopping',
      lessons: [ZAK_3, ZAK_4],
    },
    {
      slug: 'zak-zima',
      title: t('Зима й поїздка', 'Зима и поездка', 'Winter and the journey'),
      description: t('Zwrócić uwagę na…, brać udział w…, w związku z…, z powodu…', 'Zwrócić uwagę na…, brać udział w…, w związku z…, z powodu…', 'Zwrócić uwagę na…, brać udział w…, w związku z…, z powodu…'),
      icon: 'map-pins',
      lessons: [ZAK_5_8[0], ZAK_5_8[1]],
    },
    {
      slug: 'zak-finisz',
      title: t('Дискусія й прощання', 'Дискуссия и прощание', 'Debate and farewell'),
      description: t('Z jednej strony…, z drugiej strony…, niemniej, na zakończenie', 'Z jednej strony…, z drugiej strony…, niemniej, na zakończenie', 'Z jednej strony…, z drugiej strony…, niemniej, na zakończenie'),
      icon: 'office',
      lessons: [ZAK_5_8[2], ZAK_5_8[3]],
    },
    {
      slug: 'zak-egzamin',
      title: t('Фінальний іспит', 'Финальный экзамен', 'Final exam'),
      description: t('Дієприслівники, безособове się, думка, дієприкметники, дієслова з прийменниками, офіційні листи, дискусія, прощання', 'Деепричастия, безличное się, мнение, причастия, глаголы с предлогами, официальные письма, дискуссия, прощание', 'Adverbial participles, the impersonal się, opinions, participles, verbs with prepositions, formal letters, debate, farewell'),
      icon: 'achievements',
      lessons: [ZAK_BOSS],
    },
  ],
};
