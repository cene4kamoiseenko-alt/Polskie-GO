/**
 * Kielce — уроки 5–8 й іспит. Складні речення й który у різних відмінках (легенди Лисої гори: której się bali, w którym, którą widzieli, o której;
 * ponieważ / dlatego / chociaż / zanim), числівники й кількість (wynosi + 2–4 / 5+, kilkanaście, kilkadziesiąt, kilkaset), правила в заповіднику
 * (nie wolno, należy, nie trzeba ≠ nie wolno, obowiązuje zakaz / nakaz + віддієслівний іменник) і легенда мовою B2 (pewnego razu, według legendy,
 * мова непряма: powiedział, że… / zapytał, czy… / kazał, żeby…, пасив został ukryty).
 * Правила якості — docs/EXERCISE_QUALITY.md. Словник — vocab-kielce.ts.
 */
import { t, wordChoice, fillGap, listen, findError, oddOne, reading, translate, grammar, build, match, speak, dialogue } from './builders';
import type { LessonSeed } from './types';

const OPOWIADACZKA = { name: 'Pani Halina', emoji: '👵🏼', role: t('оповідачка легенд', 'рассказчица легенд', 'a storyteller of legends') };
const GORSKI = { name: 'Pan Tomasz', emoji: '🧔🏻', role: t('гірський провідник', 'горный проводник', 'a mountain guide') };
const STRAZNIK = { name: 'Pan Leszek', emoji: '👨🏼‍🌾', role: t('сторож заповідника', 'сторож заповедника', 'a reserve ranger') };
const INFORMACJA = { name: 'Pani Beata', emoji: '🗺️', role: t('працівниця туристичного центру', 'сотрудница туристического центра', 'a tourist-office clerk') };

const KIE_5: LessonSeed = {
  slug: 'kie-5-zlozone',
  title: t('Складні речення: легенди Лисої гори', 'Сложные предложения: легенды Лысой горы', 'Complex sentences: the legends of Łysa Góra'),
  topic: t(
    'który / która / które у різних відмінках (której się bali, w którym, którą widzieli, o której); ponieważ / dlatego / chociaż / zanim',
    'który / która / które в разных падежах (której się bali, w którym, którą widzieli, o której); ponieważ / dlatego / chociaż / zanim',
    'który / która / które in different cases (której się bali, w którym, którą widzieli, o której); ponieważ / dlatego / chociaż / zanim',
  ),
  cefr: 'B2',
  difficulty: 4,
  explanation: t(
    '**Мета:** розповідати легенди складними реченнями й правильно вибирати відмінок слова **który**.\n**Który / która / które** узгоджується за родом і числом зі словом, до якого відноситься, а його **відмінок** задає дієслово чи прийменник у підрядному реченні: **czarownica, której wszyscy się bali** (**bać się** + родовий), **wąwóz, w którym ukrywali się zbójnicy** (**w** + місцевий), **zjawa, którą widziano na szczycie** (знахідний), **jaskinia, o której nikt nie wiedział** (**o** + місцевий).\nЗв’язки: **ponieważ** — бо (причина), **dlatego** — тому (наслідок), **chociaż** — хоча, **zanim** — перш ніж.',
    '**Цель:** рассказывать легенды сложными предложениями и правильно выбирать падеж слова **który**.\n**Który / która / które** согласуется в роде и числе со словом, к которому относится, а его **падеж** задаёт глагол или предлог в придаточном: **czarownica, której wszyscy się bali** (**bać się** + родительный), **wąwóz, w którym ukrywali się zbójnicy** (**w** + предложный), **zjawa, którą widziano na szczycie** (винительный), **jaskinia, o której nikt nie wiedział** (**o** + предложный).\nСвязки: **ponieważ** — потому что (причина), **dlatego** — поэтому (следствие), **chociaż** — хотя, **zanim** — прежде чем.',
    '**Goal:** tell legends in complex sentences and pick the right case of **który**.\n**Który / która / które** agrees in gender and number with the word it refers to, while its **case** is set by the verb or preposition in the relative clause: **czarownica, której wszyscy się bali** (**bać się** + genitive), **wąwóz, w którym ukrywali się zbójnicy** (**w** + locative), **zjawa, którą widziano na szczycie** (accusative), **jaskinia, o której nikt nie wiedział** (**o** + locative).\nLinkers: **ponieważ** — because (reason), **dlatego** — therefore (result), **chociaż** — although, **zanim** — before.',
  ),
  examples: [
    { pl: 'Czarownica, której wszyscy się bali, mieszkała w chatce pod lasem.', tr: t('Відьма, якої всі боялися, жила в хатці під лісом.', 'Ведьма, которой все боялись, жила в хижине под лесом.', 'The witch everyone was afraid of lived in a cottage by the forest.') },
    { pl: 'To jest jaskinia, o której nikt nie wiedział, aż zbójnicy ukryli w niej skarb.', tr: t('Це печера, про яку ніхто не знав, аж поки розбійники не сховали в ній скарб.', 'Это пещера, о которой никто не знал, пока разбойники не спрятали в ней клад.', 'This is a cave nobody knew about until the bandits hid a treasure in it.') },
  ],
  words: ['czarownica', 'miotła', 'klątwa', 'zjawa', 'zbójnik'],
  exercises: [
    dialogue('dialogue.legendy', OPOWIADACZKA, [
      {
        npc: 'Kim była ta czarownica z legendy?',
        tr: t('Ким була ця відьма з легенди?', 'Кем была эта ведьма из легенды?', 'Who was the witch in the legend?'),
        choose: [
          ['To była kobieta, której wszyscy się bali.', t('Це була жінка, якої всі боялися.', 'Это была женщина, которой все боялись.', 'She was a woman everyone was afraid of.')],
          ['To była kobieta, która wszyscy się bali.', t('(**bać się** + родовий: **której**; **która** — називний)', '(**bać się** + родительный: **której**; **która** — именительный)', '(**bać się** takes the genitive: **której**; **która** is nominative)')],
          ['To była kobieta, której wszyscy się bały.', t('(**wszyscy** — чоловічо-особове: **bali się**, а не **bały się**)', '(**wszyscy** — мужско-личное: **bali się**, а не **bały się**)', '(**wszyscy** is virile: **bali się**, not **bały się**)')],
        ],
        feedback: t('**bać się** + родовий: **której**; **wszyscy bali się**.', '**bać się** + родительный: **której**; **wszyscy bali się**.', '**bać się** + genitive: **której**; **wszyscy bali się**.'),
      },
      {
        npc: 'Dlaczego ludzie unikali Łysej Góry w nocy?',
        tr: t('Чому люди уникали Лисої гори вночі?', 'Почему люди избегали Лысой горы ночью?', 'Why did people avoid Łysa Góra at night?'),
        choose: [
          ['Unikali jej, ponieważ wierzyli w dawną klątwę.', t('Вони уникали її, бо вірили в давнє прокляття.', 'Они избегали её, потому что верили в древнее проклятие.', 'They avoided it because they believed in an old curse.')],
          ['Unikali jej, dlatego wierzyli w dawną klątwę.', t('(**dlatego** вводить наслідок, а тут потрібна причина — **ponieważ**)', '(**dlatego** вводит следствие, а здесь нужна причина — **ponieważ**)', '(**dlatego** introduces a result, but a reason is needed here — **ponieważ**)')],
          ['Unikali jej, chociaż wierzyli w dawną klątwę.', t('(**chociaż** — «хоча»: протиставлення, а не причина)', '(**chociaż** — «хотя»: противопоставление, а не причина)', '(**chociaż** means “although”: a contrast, not a reason)')],
        ],
        feedback: t('Причина — **ponieważ**.', 'Причина — **ponieważ**.', 'A reason — **ponieważ**.'),
      },
    ]),
    wordChoice('vocab.legendy', 'klątwa', [t('прокляття', 'проклятие', 'a curse'), t('клятва, присяга', 'клятва, присяга', 'an oath'), t('пророцтво', 'пророчество', 'a prophecy')]),
    fillGap('grammar.legendy', 'To jest wąwóz, w ___ ukrywali się zbójnicy.', ['którym', 'który', 'którego'], t('Це ущелина, у якій ховалися розбійники.', 'Это ущелье, в котором прятались разбойники.', 'This is the ravine where the bandits used to hide.'),
      t('**w** + місцевий: **w którym** (**wąwóz** — чоловічий рід).', '**w** + предложный: **w którym** (**wąwóz** — мужской род).', '**w** + locative: **w którym** (**wąwóz** is masculine).')),
    match('grammar.legendy', [
      ['ponieważ', t('тому що (причина)', 'потому что (причина)', 'because (a reason)')],
      ['dlatego', t('тому (наслідок)', 'поэтому (следствие)', 'therefore (a result)')],
      ['chociaż', t('хоча (протиставлення)', 'хотя (противопоставление)', 'although (a contrast)')],
      ['zanim', t('перш ніж (до того, як)', 'прежде чем (до того, как)', 'before (earlier than)')],
    ]),
    grammar('grammar.legendy', 'To jest zjawa, ___ wszyscy widzieli na szczycie.', 'który', ['którą'], t('Це привид, якого всі бачили на вершині.', 'Это призрак, которого все видели на вершине.', 'This is the ghost everyone saw on the summit.'),
      t('**zjawa** — жіночий рід, знахідний: **którą**.', '**zjawa** — женский род, винительный: **którą**.', '**zjawa** is feminine and the object is accusative: **którą**.')),
    listen('listening.legendy', 'Zbójnicy ukrywali łupy w jaskini, o której nikt nie wiedział.', ['Zbójnicy ukrywali łupy w jaskini, o której nikt nie wiedział.', 'Zbójnicy ukrywali łupy w jaskini, o którym nikt nie wiedział.', 'Zbójnicy ukrywali łupy w jaskiniach, o których nikt nie wiedział.']),
    reading('reading.legendy', 'Według legendy w noc świętojańską na Łysej Górze zbierały się czarownice z całej Polski. Leciały na miotłach, a zbójnicy, którzy ukrywali się w lesie, słyszeli ich śmiech. Kto zobaczył to spotkanie, zostawał przeklęty na wiele lat. Dlatego mieszkańcy okolicznych wsi w tę noc zamykali okna i drzwi.',
      t('Чому мешканці зачиняли вікна й двері?', 'Почему жители закрывали окна и двери?', 'Why did the villagers close their windows and doors?'),
      [t('бо той, хто побачив відьом, міг стати проклятим', 'потому что тот, кто увидел ведьм, мог оказаться проклятым', 'because anyone who saw the witches could be cursed'), t('бо розбійники нападали тоді на села', 'потому что разбойники нападали тогда на деревни', 'because bandits attacked the villages that night'), t('бо відьми заходили до хат по їжу', 'потому что ведьмы заходили в дома за едой', 'because the witches came into houses for food')]),
    findError('grammar.legendy', ['Czarownice', 'leciały', 'nad', 'lasem', 'na', 'miotły'], 5, t('Відьми летіли над лісом на мітлах.', 'Ведьмы летели над лесом на мётлах.', 'The witches flew over the forest on brooms.'),
      t('Спосіб пересування — місцевий: **na miotłach**.', 'Способ передвижения — предложный: **na miotłach**.', 'The means of travel takes the locative: **na miotłach**.')),
    build('grammar.legendy', 'Czarownice leciały nad lasem na miotłach', t('Відьми летіли над лісом на мітлах', 'Ведьмы летели над лесом на мётлах', 'The witches flew over the forest on brooms'), ['miotły', 'lasu']),
    oddOne('grammar.legendy', ['czarownica, która', 'zjawa, która', 'zbójnik, który', 'klątwa, który'], 3,
      t('**klątwa** — жіночий рід, тож **która**.', '**klątwa** — женский род, значит **która**.', '**klątwa** is feminine, so **która**.'),
      t('У якій парі помилка узгодження?', 'В какой паре ошибка согласования?', 'Which pair has an agreement mistake?')),
    translate('writing.legendy', t('Це та печера, про яку всі розповідали, але в якій ніхто не був.', 'Это та пещера, о которой все рассказывали, но в которой никто не был.', 'This is the cave everyone talked about but nobody had been in.'),
      ['To jest ta jaskinia, o której wszyscy opowiadali, ale w której nikt nie był.', 'To jest jaskinia, o której wszyscy opowiadali, ale w której nikt nie był.', 'To jest ta jaskinia, o której wszyscy opowiadali, ale w której nikt nie był']),
    speak('speaking.legendy', 'Czarownica, której wszyscy się bali, mieszkała w chatce pod lasem.', t('Відьма, якої всі боялися, жила в хатці під лісом.', 'Ведьма, которой все боялись, жила в хижине под лесом.', 'The witch everyone was afraid of lived in a cottage by the forest.')),
  ],
};

const KIE_6: LessonSeed = {
  slug: 'kie-6-liczebniki',
  title: t('Числівники й кількість', 'Числительные и количество', 'Numerals and quantity'),
  topic: t(
    'wysokość / długość / głębokość + wynosi; 2–4 (22, 23) + називний, 5+ (12, 20, 25) + родовий; kilkanaście / kilkadziesiąt / kilkaset + родовий',
    'wysokość / długość / głębokość + wynosi; 2–4 (22, 23) + именительный, 5+ (12, 20, 25) + родительный; kilkanaście / kilkadziesiąt / kilkaset + родительный',
    'wysokość / długość / głębokość + wynosi; 2–4 (22, 23) + nominative, 5+ (12, 20, 25) + genitive; kilkanaście / kilkadziesiąt / kilkaset + genitive',
  ),
  cefr: 'B2',
  difficulty: 4,
  explanation: t(
    '**Мета:** називати висоту, довжину й кількість людей, не помиляючись у числівнику.\n**Wysokość / długość / głębokość** + **wynosi**: **Wysokość Łysicy wynosi sześćset dwanaście metrów.** Числівники **2–4** (також **22, 23, 24, 32**…) — іменник у називному множини: **dwa kilometry**, **dwadzieścia dwa kilometry**. Від **5** (а також **12–14**, **20**, **25**…) — родовий множини: **pięć kilometrów**, **dwanaście kilometrów**, **dwadzieścia pięć kilometrów**.\n**Kilkanaście** (11–19), **kilkadziesiąt** (кілька десятків), **kilkaset** (кілька сотень) — далі родовий множини: **kilkanaście osób**, **kilkaset osób**.',
    '**Цель:** называть высоту, длину и количество людей, не ошибаясь в числительном.\n**Wysokość / długość / głębokość** + **wynosi**: **Wysokość Łysicy wynosi sześćset dwanaście metrów.** Числительные **2–4** (также **22, 23, 24, 32**…) — существительное в именительном множественного: **dwa kilometry**, **dwadzieścia dwa kilometry**. Начиная с **5** (а также **12–14**, **20**, **25**…) — родительный множественного: **pięć kilometrów**, **dwanaście kilometrów**, **dwadzieścia pięć kilometrów**.\n**Kilkanaście** (11–19), **kilkadziesiąt** (несколько десятков), **kilkaset** (несколько сотен) — дальше родительный множественного: **kilkanaście osób**, **kilkaset osób**.',
    '**Goal:** state heights, lengths and numbers of people without slipping on the numeral.\n**Wysokość / długość / głębokość** + **wynosi**: **Wysokość Łysicy wynosi sześćset dwanaście metrów.** The numerals **2–4** (also **22, 23, 24, 32**…) take the noun in the nominative plural: **dwa kilometry**, **dwadzieścia dwa kilometry**. From **5** on (also **12–14**, **20**, **25**…) the noun is genitive plural: **pięć kilometrów**, **dwanaście kilometrów**, **dwadzieścia pięć kilometrów**.\n**Kilkanaście** (11–19), **kilkadziesiąt** (several dozen) and **kilkaset** (a few hundred) are followed by the genitive plural: **kilkanaście osób**, **kilkaset osób**.',
  ),
  examples: [
    { pl: 'Ten szlak ma dwadzieścia dwa kilometry, a głębokość jaskini wynosi kilkanaście metrów.', tr: t('Ця стежка має двадцять два кілометри, а глибина печери становить кільканадцять метрів.', 'Эта тропа имеет двадцать два километра, а глубина пещеры составляет больше десяти метров.', 'This trail is twenty-two kilometres long, and the depth of the cave is a dozen or so metres.') },
    { pl: 'Do jaskini wchodzi dziennie kilkaset osób, a do muzeum — kilkadziesiąt.', tr: t('До печери щодня заходить кілька сотень осіб, а до музею — кілька десятків.', 'В пещеру ежедневно заходят несколько сотен человек, а в музей — несколько десятков.', 'A few hundred people enter the cave every day, and several dozen the museum.') },
  ],
  words: ['wysokość', 'długość', 'głębokość', 'kilkanaście', 'kilkadziesiąt', 'kilkaset'],
  exercises: [
    dialogue('dialogue.liczby', GORSKI, [
      {
        npc: 'A ile kilometrów ma drugi szlak?',
        tr: t('А скільки кілометрів має другий шлях?', 'А сколько километров у второго маршрута?', 'And how many kilometres is the second trail?'),
        choose: [
          ['Drugi szlak ma dwadzieścia dwa kilometry.', t('Другий шлях має двадцять два кілометри.', 'Второй маршрут — двадцать два километра.', 'The second trail is twenty-two kilometres.')],
          ['Drugi szlak ma dwadzieścia dwa kilometrów.', t('(**22** закінчується на **2** — іменник у називному множини: **kilometry**)', '(**22** оканчивается на **2** — существительное в именительном множественного: **kilometry**)', '(**22** ends in **2**, so the noun is nominative plural: **kilometry**)')],
          ['Drugi szlak ma dwadzieścia dwóch kilometry.', t('(числівник у називному: **dwadzieścia dwa**, а не **dwóch**)', '(числительное в именительном: **dwadzieścia dwa**, а не **dwóch**)', '(the numeral is nominative: **dwadzieścia dwa**, not **dwóch**)')],
        ],
        feedback: t('**22** → **dwadzieścia dwa kilometry**.', '**22** → **dwadzieścia dwa kilometry**.', '**22** → **dwadzieścia dwa kilometry**.'),
      },
      {
        npc: 'Jaka jest wysokość Łysicy?',
        tr: t('Яка висота Лисиці?', 'Какова высота Лысицы?', 'How high is Łysica?'),
        choose: [
          ['Wysokość Łysicy wynosi sześćset dwanaście metrów.', t('Висота Лисиці становить шістсот дванадцять метрів.', 'Высота Лысицы составляет шестьсот двенадцать метров.', 'The height of Łysica is six hundred and twelve metres.')],
          ['Wysokość Łysicy wynosi sześćset dwanaście metry.', t('(після **dwanaście** іменник у родовому множини: **metrów**)', '(после **dwanaście** существительное в родительном множественного: **metrów**)', '(after **dwanaście** the noun is genitive plural: **metrów**)')],
          ['Wysokość Łysicy wynosi sześciuset dwunastu metrów.', t('(після **wynosi** числівник — у називному: **sześćset dwanaście**)', '(после **wynosi** числительное — в именительном: **sześćset dwanaście**)', '(after **wynosi** the numeral is nominative: **sześćset dwanaście**)')],
        ],
        feedback: t('**wynosi** + називний числівник + родовий множини: **sześćset dwanaście metrów**.', '**wynosi** + числительное в именительном + родительный множественного: **sześćset dwanaście metrów**.', '**wynosi** + a nominative numeral + genitive plural: **sześćset dwanaście metrów**.'),
      },
    ]),
    wordChoice('vocab.liczby', 'kilkadziesiąt', [t('кілька десятків (20–90)', 'несколько десятков (20–90)', 'several dozen (20–90)'), t('кільканадцять (11–19)', 'больше десяти, до двадцати (11–19)', 'a dozen or so (11–19)'), t('кілька сотень', 'несколько сотен', 'a few hundred')]),
    fillGap('grammar.liczby', 'Na szczyt wchodzi codziennie kilkaset ___.', ['osób', 'osoby', 'osoba'], t('На вершину щодня підіймається кілька сотень осіб.', 'На вершину ежедневно поднимаются несколько сотен человек.', 'A few hundred people climb to the summit every day.'),
      t('Після **kilkaset** — родовий множини: **osób**.', 'После **kilkaset** — родительный множественного: **osób**.', 'After **kilkaset** use the genitive plural: **osób**.')),
    match('grammar.liczby', [
      ['kilkanaście osób', t('від 11 до 19 осіб', 'от 11 до 19 человек', 'between 11 and 19 people')],
      ['kilkadziesiąt osób', t('кілька десятків осіб', 'несколько десятков человек', 'several dozen people')],
      ['kilkaset osób', t('кілька сотень осіб', 'несколько сотен человек', 'a few hundred people')],
      ['kilka osób', t('кілька осіб (2–5)', 'несколько человек (2–5)', 'a few people (2–5)')],
    ]),
    grammar('grammar.liczby', 'Ten szlak ma dwadzieścia ___ długości.', 'kilometr', ['kilometrów'], t('Ця стежка має двадцять кілометрів завдовжки.', 'Эта тропа имеет двадцать километров в длину.', 'This trail is twenty kilometres long.'),
      t('Після **20** (від п’яти й далі) — родовий множини: **kilometrów**.', 'После **20** (от пяти и далее) — родительный множественного: **kilometrów**.', 'After **20** (five and up) use the genitive plural: **kilometrów**.')),
    listen('listening.liczby', 'Dziś do jaskini weszło kilkadziesiąt osób, a wczoraj kilkaset.', ['Dziś do jaskini weszło kilkadziesiąt osób, a wczoraj kilkaset.', 'Dziś do jaskini weszło kilkanaście osób, a wczoraj kilkaset.', 'Dziś do jaskini weszło kilkadziesiąt osób, a wczoraj kilkanaście.']),
    reading('reading.liczby', 'Grupa wędrowców wyrusza w poniedziałek rano. Cały szlak ma sześćdziesiąt kilometrów. Codziennie grupa chce przejść piętnaście kilometrów, ale w czwartek, gdy ma padać deszcz, tylko dziesięć. Wędrowcy nocują w schroniskach.',
      t('Якого дня група закінчить шлях?', 'В какой день группа закончит маршрут?', 'On which day will the group finish the trail?'),
      [t('у п’ятницю', 'в пятницу', 'on Friday'), t('у четвер', 'в четверг', 'on Thursday'), t('у суботу', 'в субботу', 'on Saturday')]),
    findError('grammar.liczby', ['Wczoraj', 'na', 'szczyt', 'weszło', 'dwadzieścia', 'trzy', 'osób'], 6, t('Вчора на вершину зійшло двадцять три особи.', 'Вчера на вершину поднялись двадцать три человека.', 'Yesterday twenty-three people climbed to the summit.'),
      t('**23** закінчується на **3** — називний множини: **osoby**.', '**23** оканчивается на **3** — именительный множественного: **osoby**.', '**23** ends in **3**, so the noun is nominative plural: **osoby**.')),
    build('grammar.liczby', 'Długość tego szlaku wynosi dwanaście kilometrów', t('Довжина цього шляху становить дванадцять кілометрів', 'Длина этого маршрута составляет двенадцать километров', 'The length of this trail is twelve kilometres'), ['kilometry', 'dwunastu']),
    oddOne('grammar.liczby', ['dwa kilometry', 'trzy kilometry', 'cztery kilometry', 'pięć kilometry'], 3,
      t('Від **5** — родовий множини: **pięć kilometrów**.', 'Начиная с **5** — родительный множественного: **pięć kilometrów**.', 'From **5** on use the genitive plural: **pięć kilometrów**.'),
      t('Яка фраза містить помилку?', 'Какое выражение содержит ошибку?', 'Which expression contains a mistake?')),
    translate('writing.liczby', t('Вчора на вершину зійшло кілька сотень людей, а сьогодні — кільканадцять.', 'Вчера на вершину поднялись несколько сотен человек, а сегодня — человек пятнадцать.', 'Yesterday a few hundred people climbed to the summit, and today a dozen or so.'),
      ['Wczoraj na szczyt weszło kilkaset osób, a dzisiaj kilkanaście.', 'Wczoraj na szczyt weszło kilkaset osób, a dziś kilkanaście.', 'Wczoraj na szczyt weszło kilkaset ludzi, a dzisiaj kilkanaście.']),
    speak('speaking.liczby', 'Wysokość Łysicy wynosi sześćset dwanaście metrów, a ten szlak ma dwadzieścia dwa kilometry.', t('Висота Лисиці становить шістсот дванадцять метрів, а ця стежка має двадцять два кілометри.', 'Высота Лысицы составляет шестьсот двенадцать метров, а эта тропа — двадцать два километра.', 'The height of Łysica is six hundred and twelve metres, and this trail is twenty-two kilometres.')),
  ],
};

const KIE_7: LessonSeed = {
  slug: 'kie-7-bezosobowe',
  title: t('Правила в заповіднику', 'Правила в заповеднике', 'Rules in the reserve'),
  topic: t(
    'nie wolno + інфінітив, należy + інфінітив, nie trzeba / nie musisz ≠ nie wolno, obowiązuje zakaz / nakaz + віддієслівний іменник, zabronić + родовий',
    'nie wolno + инфинитив, należy + инфинитив, nie trzeba / nie musisz ≠ nie wolno, obowiązuje zakaz / nakaz + отглагольное существительное, zabronić + родительный',
    'nie wolno + infinitive, należy + infinitive, nie trzeba / nie musisz ≠ nie wolno, obowiązuje zakaz / nakaz + verbal noun, zabronić + genitive',
  ),
  cefr: 'B2',
  difficulty: 4,
  explanation: t(
    '**Мета:** розуміти й формулювати правила та заборони в заповіднику.\n**Дозволено / заборонено:** **nie wolno** + інфінітив — заборонено (**nie wolno zrywać roślin**), **wolno** — дозволено. **Należy** + інфінітив — слід (**psy należy prowadzić na smyczy**).\nНе плутай: **nie trzeba / nie musisz** — не обов’язково (але можна), **nie wolno ci** — заборонено.\n**Obowiązuje** + називний: **obowiązuje zakaz rozpalania ognisk**, **obowiązuje nakaz prowadzenia psa na smyczy** — після **zakaz / nakaz** стоїть родовий віддієслівного іменника на **-nia / -cia**. Влада: **zabroniła wstępu** (**zabronić** + родовий).',
    '**Цель:** понимать и формулировать правила и запреты в заповеднике.\n**Разрешено / запрещено:** **nie wolno** + инфинитив — запрещено (**nie wolno zrywać roślin**), **wolno** — разрешено. **Należy** + инфинитив — следует (**psy należy prowadzić na smyczy**).\nНе путай: **nie trzeba / nie musisz** — не обязательно (но можно), **nie wolno ci** — запрещено.\n**Obowiązuje** + именительный: **obowiązuje zakaz rozpalania ognisk**, **obowiązuje nakaz prowadzenia psa na smyczy** — после **zakaz / nakaz** стоит родительный отглагольного существительного на **-nia / -cia**. Власти: **zabroniła wstępu** (**zabronić** + родительный).',
    '**Goal:** understand and phrase rules and bans in a nature reserve.\n**Allowed / forbidden:** **nie wolno** + infinitive — forbidden (**nie wolno zrywać roślin**), **wolno** — allowed. **Należy** + infinitive — one should (**psy należy prowadzić na smyczy**).\nDo not mix up **nie trzeba / nie musisz** (not necessary, but allowed) and **nie wolno ci** (forbidden).\n**Obowiązuje** + nominative: **obowiązuje zakaz rozpalania ognisk**, **obowiązuje nakaz prowadzenia psa na smyczy** — after **zakaz / nakaz** comes the genitive of a verbal noun in **-nia / -cia**. The authorities: **zabroniła wstępu** (**zabronić** + genitive).',
  ),
  examples: [
    { pl: 'W rezerwacie nie wolno rozpalać ognisk, a psy należy prowadzić na smyczy.', tr: t('У заповіднику не можна розпалювати багаття, а собак слід водити на повідку.', 'В заповеднике нельзя разжигать костры, а собак следует водить на поводке.', 'In the reserve you may not light fires, and dogs must be kept on a lead.') },
    { pl: 'Po burzy władze zabroniły wstępu do jaskini.', tr: t('Після бурі влада заборонила вхід до печери.', 'После бури власти запретили вход в пещеру.', 'After the storm the authorities banned entry to the cave.') },
  ],
  words: ['obowiązywać', 'należy', 'wolno', 'zabronić', 'nakaz'],
  exercises: [
    dialogue('dialogue.zasady', STRAZNIK, [
      {
        npc: 'Uwaga: po burzy władze zabroniły wstępu do jaskini. Pamiętaj też, że w rezerwacie nie wolno zrywać roślin.',
        tr: t('Увага: після бурі влада заборонила вхід до печери. Пам’ятайте також, що в заповіднику не можна зривати рослини.', 'Внимание: после бури власти запретили вход в пещеру. Помните также, что в заповеднике нельзя срывать растения.', 'Attention: after the storm the authorities banned entry to the cave. Remember too that you may not pick plants in the reserve.'),
        choose: [
          ['Rozumiem, nie będę zrywać żadnych roślin.', t('Розумію, я не зриватиму жодних рослин.', 'Понимаю, я не буду срывать никаких растений.', 'I understand, I won’t pick any plants.')],
          ['Rozumiem, nie będę zerwać żadnych roślin.', t('(**nie będę** + інфінітив **недоконаного** виду: **zrywać**)', '(**nie będę** + инфинитив **несовершенного** вида: **zrywać**)', '(**nie będę** takes an **imperfective** infinitive: **zrywać**)')],
          ['Rozumiem, nie będę zrywać żadne rośliny.', t('(після заперечення — родовий: **żadnych roślin**)', '(после отрицания — родительный: **żadnych roślin**)', '(after a negation use the genitive: **żadnych roślin**)')],
        ],
        feedback: t('**nie będę zrywać żadnych roślin**: недоконаний інфінітив і родовий після заперечення.', '**nie będę zrywać żadnych roślin**: несовершенный инфинитив и родительный после отрицания.', '**nie będę zrywać żadnych roślin**: an imperfective infinitive and the genitive after a negation.'),
      },
      {
        npc: 'Czy mogę rozbić namiot przy szlaku?',
        tr: t('Чи можу я поставити намет біля стежки?', 'Могу ли я поставить палатку у тропы?', 'May I pitch a tent by the trail?'),
        choose: [
          ['Nie, w rezerwacie nie wolno biwakować.', t('Ні, у заповіднику не можна ночувати просто неба.', 'Нет, в заповеднике нельзя устраивать бивак.', 'No, camping is not allowed in the reserve.')],
          ['Nie, w rezerwacie nie wolno biwakowanie.', t('(**nie wolno** + інфінітив, а не іменник)', '(**nie wolno** + инфинитив, а не существительное)', '(**nie wolno** takes an infinitive, not a noun)')],
          ['Nie, w rezerwacie nie trzeba biwakować.', t('(**nie trzeba** — «не обов’язково», а не «заборонено»)', '(**nie trzeba** — «не обязательно», а не «запрещено»)', '(**nie trzeba** means “not necessary”, not “forbidden”)')],
        ],
        feedback: t('Заборона — **nie wolno** + інфінітив.', 'Запрет — **nie wolno** + инфинитив.', 'A ban — **nie wolno** + infinitive.'),
      },
    ]),
    wordChoice('vocab.zasady', 'nakaz', [t('припис, обов’язкова вимога', 'предписание, обязательное требование', 'an order, a requirement'), t('заборона', 'запрет', 'a ban'), t('штраф', 'штраф', 'a fine')]),
    fillGap('grammar.zasady', 'W rezerwacie obowiązuje zakaz ___ ognisk.', ['rozpalania', 'rozpalać', 'rozpalanie'], t('У заповіднику діє заборона розпалювати багаття.', 'В заповеднике действует запрет разжигать костры.', 'In the reserve it is forbidden to light fires.'),
      t('**zakaz** + родовий віддієслівного іменника: **zakaz rozpalania**.', '**zakaz** + родительный отглагольного существительного: **zakaz rozpalania**.', '**zakaz** + the genitive of a verbal noun: **zakaz rozpalania**.')),
    match('grammar.zasady', [
      ['nie musisz', t('тобі не обов’язково', 'тебе не обязательно', 'you don’t have to')],
      ['nie wolno ci', t('тобі заборонено', 'тебе запрещено', 'you are not allowed to')],
      ['powinieneś', t('тобі варто, слід', 'тебе стоит, следует', 'you should')],
      ['musisz', t('ти мусиш, обов’язково', 'ты должен, обязательно', 'you must')],
    ]),
    grammar('grammar.zasady', 'W rezerwacie obowiązuje nakaz ___ psa na smyczy.', 'prowadzić', ['prowadzenia'], t('У заповіднику діє припис вести собаку на повідку.', 'В заповеднике действует предписание вести собаку на поводке.', 'In the reserve dogs must be kept on a lead.'),
      t('**nakaz** + родовий віддієслівного іменника: **nakaz prowadzenia**.', '**nakaz** + родительный отглагольного существительного: **nakaz prowadzenia**.', '**nakaz** + the genitive of a verbal noun: **nakaz prowadzenia**.')),
    listen('listening.zasady', 'Zgodnie z regulaminem nie wolno rozpalać ognisk ani zbierać grzybów.', ['Zgodnie z regulaminem nie wolno rozpalać ognisk ani zbierać grzybów.', 'Zgodnie z regulaminem nie warto rozpalać ognisk ani zbierać grzybów.', 'Zgodnie z regulaminem nie wolno rozpalać ogniska ani zbierać grzybów.']),
    reading('reading.zasady', 'REGULAMIN REZERWATU. Na terenie rezerwatu obowiązuje zakaz rozpalania ognisk, biwakowania, zrywania roślin oraz zbierania skał i minerałów. Psy należy prowadzić na smyczy. Ścieżkami wolno chodzić tylko w godzinach od 8:00 do 20:00. W razie wypadku należy zadzwonić pod numer alarmowy 112.',
      t('Що дозволено в заповіднику?', 'Что разрешено в заповеднике?', 'What is allowed in the reserve?'),
      [t('прогулянка з собакою на повідку о дев’ятій ранку', 'прогулка с собакой на поводке в девять утра', 'a walk with a dog on a lead at nine in the morning'), t('нічліг у наметі на одну ніч', 'ночлег в палатке на одну ночь', 'a night in a tent'), t('взяти на згадку невеликий камінь', 'взять на память небольшой камень', 'taking a small stone as a souvenir')]),
    findError('grammar.zasady', ['Psy', 'należy', 'prowadzić', 'na', 'smycz', 'w', 'rezerwacie'], 4, t('Собак слід водити на повідку в заповіднику.', 'Собак следует водить на поводке в заповеднике.', 'Dogs must be kept on a lead in the reserve.'),
      t('«На повідку» — місцевий: **na smyczy**.', '«На поводке» — предложный: **na smyczy**.', '“On a lead” takes the locative: **na smyczy**.')),
    build('grammar.zasady', 'W rezerwacie nie wolno rozpalać ognisk', t('У заповіднику не можна розпалювати багаття', 'В заповеднике нельзя разжигать костры', 'You may not light fires in the reserve'), ['rozpalanie', 'ogniska']),
    oddOne('grammar.zasady', ['obowiązuje zakaz wstępu', 'obowiązuje nakaz noszenia kasku', 'obowiązuje zakaz palenia', 'obowiązuje zakazu parkowania'], 3,
      t('Після **obowiązuje** — називний: **obowiązuje zakaz parkowania**.', 'После **obowiązuje** — именительный: **obowiązuje zakaz parkowania**.', 'After **obowiązuje** use the nominative: **obowiązuje zakaz parkowania**.'),
      t('Яка фраза містить помилку?', 'Какое выражение содержит ошибку?', 'Which expression contains a mistake?')),
    translate('writing.zasady', t('У заповіднику не можна розпалювати багаття, а собак слід водити на повідку.', 'В заповеднике нельзя разжигать костры, а собак следует водить на поводке.', 'In the reserve you may not light fires, and dogs must be kept on a lead.'),
      ['W rezerwacie nie wolno rozpalać ognisk, a psy należy prowadzić na smyczy.', 'W rezerwacie nie wolno rozpalać ognisk, a psy należy prowadzić na smyczy', 'W rezerwacie nie wolno rozpalać ognisk, a psy trzeba prowadzić na smyczy.']),
    speak('speaking.zasady', 'W rezerwacie obowiązuje zakaz biwakowania i nakaz prowadzenia psa na smyczy.', t('У заповіднику діє заборона ночувати в наметах і припис вести собаку на повідку.', 'В заповеднике действует запрет ночевать в палатках и предписание вести собаку на поводке.', 'In the reserve camping is forbidden and dogs must be kept on a lead.')),
  ],
};

const KIE_8: LessonSeed = {
  slug: 'kie-8-legenda',
  title: t('Легенда мовою B2', 'Легенда на языке B2', 'A legend at B2 level'),
  topic: t(
    'pewnego razu, według legendy, od tamtej pory, wkrótce potem; мова непряма: powiedział, że… / zapytał, czy… / kazał, żeby…; пасив został ukryty',
    'pewnego razu, według legendy, od tamtej pory, wkrótce potem; косвенная речь: powiedział, że… / zapytał, czy… / kazał, żeby…; пассив został ukryty',
    'pewnego razu, według legendy, od tamtej pory, wkrótce potem; reported speech: powiedział, że… / zapytał, czy… / kazał, żeby…; the passive został ukryty',
  ),
  cefr: 'B2',
  difficulty: 4,
  explanation: t(
    '**Мета:** розповісти легенду й переказати чужі слова.\n**Зачин і зв’язки:** **pewnego razu** — одного разу, **według legendy** — за легендою, **od tamtej pory** — відтоді, **wkrótce potem** — незабаром після того.\n**Непряма мова:** «Skarb znajdzie tylko dobry człowiek» → **Powiedział, że skarb znajdzie tylko dobry człowiek.** (**że** + те саме речення); «Czy skarb istnieje?» → **Zapytał, czy skarb istnieje.** (не *jeśli*); «Wróć do domu!» → **Kazał mu wrócić do domu** або **Kazał, żeby wrócił do domu.** (наказ і прохання — **żeby**).\nПасив: **Skarb został ukryty w klasztorze** — **został** + дієприкметник, що узгоджується з підметом за родом.',
    '**Цель:** рассказать легенду и пересказать чужие слова.\n**Зачин и связки:** **pewnego razu** — однажды, **według legendy** — по легенде, **od tamtej pory** — с тех пор, **wkrótce potem** — вскоре после этого.\n**Косвенная речь:** «Skarb znajdzie tylko dobry człowiek» → **Powiedział, że skarb znajdzie tylko dobry człowiek.** (**że** + то же предложение); «Czy skarb istnieje?» → **Zapytał, czy skarb istnieje.** (не *jeśli*); «Wróć do domu!» → **Kazał mu wrócić do domu** или **Kazał, żeby wrócił do domu.** (приказ и просьба — **żeby**).\nПассив: **Skarb został ukryty w klasztorze** — **został** + причастие, согласованное с подлежащим в роде.',
    '**Goal:** tell a legend and report what others said.\n**Openers and linkers:** **pewnego razu** — once upon a time, **według legendy** — according to legend, **od tamtej pory** — since then, **wkrótce potem** — soon after.\n**Reported speech:** “Skarb znajdzie tylko dobry człowiek” → **Powiedział, że skarb znajdzie tylko dobry człowiek.** (**że** + the same sentence); “Czy skarb istnieje?” → **Zapytał, czy skarb istnieje.** (not *jeśli*); “Wróć do domu!” → **Kazał mu wrócić do domu** or **Kazał, żeby wrócił do domu.** (orders and requests take **żeby**).\nThe passive: **Skarb został ukryty w klasztorze** — **został** + a participle agreeing with the subject in gender.',
  ),
  examples: [
    { pl: 'Według legendy skarb został ukryty w klasztorze, a od tamtej pory nikt go nie znalazł.', tr: t('За легендою, скарб було заховано в монастирі, і відтоді ніхто його не знайшов.', 'По легенде, клад был спрятан в монастыре, и с тех пор никто его не нашёл.', 'According to legend the treasure was hidden in the monastery, and since then nobody has found it.') },
    { pl: 'Mnich zapytał pasterza, czy naprawdę chce znaleźć skarb.', tr: t('Монах запитав пастуха, чи справді він хоче знайти скарб.', 'Монах спросил пастуха, правда ли он хочет найти клад.', 'The monk asked the shepherd whether he really wanted to find the treasure.') },
  ],
  words: ['według legendy', 'pewnego razu', 'przepowiednia', 'sabat', 'klasztor', 'mnich'],
  exercises: [
    dialogue('dialogue.legenda', OPOWIADACZKA, [
      {
        npc: 'Zacznijcie opowiadać legendę o pasterzu z Łysej Góry. Jak ją zaczniecie?',
        tr: t('Почніть розповідати легенду про пастуха з Лисої гори. Як ви її почнете?', 'Начните рассказывать легенду о пастухе с Лысой горы. Как вы её начнёте?', 'Start telling the legend of the shepherd from Łysa Góra. How will you begin?'),
        choose: [
          ['Pewnego razu na Łysą Górę wszedł młody pasterz.', t('Одного разу на Лису гору зійшов молодий пастух.', 'Однажды на Лысую гору поднялся молодой пастух.', 'Once upon a time a young shepherd climbed Łysa Góra.')],
          ['Pewien raz na Łysą Górę wszedł młody pasterz.', t('(усталений зачин — **pewnego razu**, а не *pewien raz*)', '(устойчивый зачин — **pewnego razu**, а не *pewien raz*)', '(the fixed opener is **pewnego razu**, not *pewien raz*)')],
          ['Pewnego razu na Łysej Górze wszedł młody pasterz.', t('(**wejść na** + знахідний: **na Łysą Górę**; місцевий означав би «де?»)', '(**wejść na** + винительный: **na Łysą Górę**; предложный означал бы «где?»)', '(**wejść na** takes the accusative: **na Łysą Górę**; the locative would mean “where”)')],
        ],
        feedback: t('**Pewnego razu** + **wejść na** + знахідний.', '**Pewnego razu** + **wejść na** + винительный.', '**Pewnego razu** + **wejść na** + accusative.'),
      },
      {
        npc: 'A co powiedział mnich, kiedy pasterz zapytał go o skarb?',
        tr: t('А що сказав монах, коли пастух запитав його про скарб?', 'А что сказал монах, когда пастух спросил его о кладе?', 'And what did the monk say when the shepherd asked him about the treasure?'),
        choose: [
          ['Mnich powiedział, że skarb znajdzie tylko ktoś o czystym sercu.', t('Монах сказав, що скарб знайде лише той, хто має чисте серце.', 'Монах сказал, что клад найдёт только тот, у кого чистое сердце.', 'The monk said that only someone with a pure heart would find the treasure.')],
          ['Mnich powiedział, żeby skarb znajdzie tylko ktoś o czystym sercu.', t('(**żeby** виражає наказ; передаючи твердження, вживаємо **że**)', '(**żeby** выражает приказ; при пересказе утверждения употребляем **że**)', '(**żeby** expresses an order; to report a statement use **że**)')],
          ['Mnich powiedział, że skarb znajdę tylko ktoś o czystym sercu.', t('(дієслово узгоджується з підметом **ktoś**: **znajdzie**, а не *znajdę*)', '(глагол согласуется с подлежащим **ktoś**: **znajdzie**, а не *znajdę*)', '(the verb agrees with the subject **ktoś**: **znajdzie**, not *znajdę*)')],
        ],
        feedback: t('Переказ твердження — **że**.', 'Пересказ утверждения — **że**.', 'Reporting a statement — **że**.'),
      },
    ]),
    wordChoice('vocab.legenda', 'przepowiednia', [t('пророцтво, передбачення', 'пророчество, предсказание', 'a prophecy'), t('прислів’я', 'пословица', 'a proverb'), t('казка, оповідання', 'сказка, рассказ', 'a fairy tale, a story')]),
    fillGap('grammar.legenda', 'Pasterz zapytał mnicha, ___ skarb naprawdę istnieje.', ['czy', 'jeśli', 'ponieważ'], t('Пастух запитав монаха, чи скарб справді існує.', 'Пастух спросил монаха, существует ли клад на самом деле.', 'The shepherd asked the monk whether the treasure really existed.'),
      t('Непряме питання «так / ні» вводить **czy** (не *jeśli*).', 'Косвенный вопрос «да / нет» вводится словом **czy** (не *jeśli*).', 'An indirect yes / no question is introduced by **czy** (not *jeśli*).')),
    match('grammar.legenda', [
      ['pewnego razu', t('одного разу', 'однажды', 'once upon a time')],
      ['od tamtej pory', t('відтоді', 'с тех пор', 'since then')],
      ['wkrótce potem', t('незабаром після того', 'вскоре после этого', 'soon afterwards')],
      ['według legendy', t('за легендою', 'по легенде', 'according to legend')],
    ]),
    grammar('grammar.legenda', 'Według legendy skarb został ___ w klasztorze.', 'ukryć', ['ukryty'], t('За легендою, скарб було заховано в монастирі.', 'По легенде, клад был спрятан в монастыре.', 'According to legend the treasure was hidden in the monastery.'),
      t('Пасив: **został ukryty** — дієприкметник узгоджується з **skarb** (чоловічий рід).', 'Пассив: **został ukryty** — причастие согласуется с **skarb** (мужской род).', 'The passive **został ukryty** — the participle agrees with **skarb** (masculine).')),
    listen('listening.legenda', 'Według legendy mnich ukrył skarb w klasztorze na szczycie góry.', ['Według legendy mnich ukrył skarb w klasztorze na szczycie góry.', 'Według legendy mnisi ukryli skarb w klasztorze na szczycie góry.', 'Według legendy mnich ukrył skarb w klasztorze u stóp góry.']),
    reading('reading.legenda', 'Starsi ludzie mówili, że w noc świętojańską na Łysej Górze odbywa się sabat czarownic, ale pewnego razu na szczyt wszedł młody pasterz, który szukał zagubionej owcy. Wieczorem spotkał starego mnicha. Mnich powiedział, że w klasztorze ukryto skarb, ale znajdzie go tylko ten, kto nie szuka złota. Pasterz zapytał, czy skarb naprawdę istnieje. Mnich uśmiechnął się i wskazał mu drogę do domu. Rano pasterz znalazł owcę i zrozumiał, że to ona była jego skarbem.',
      t('Що зрозумів пастух?', 'Что понял пастух?', 'What did the shepherd understand?'),
      [t('що його вівця була для нього справжнім скарбом', 'что его овца была для него настоящим сокровищем', 'that his sheep was the real treasure for him'), t('що монах сховав золото в монастирі', 'что монах спрятал золото в монастыре', 'that the monk had hidden gold in the monastery'), t('що скарб можна знайти лише в Іванову ніч', 'что клад можно найти только в ночь на Ивана Купалу', 'that the treasure can be found only on Midsummer night')]),
    findError('grammar.legenda', ['Mnich', 'kazał', 'pasterzowi', 'że', 'wrócił', 'do', 'domu'], 3, t('Монах наказав пастухові, щоб той повернувся додому.', 'Монах велел пастуху, чтобы тот вернулся домой.', 'The monk told the shepherd to go back home.'),
      t('Наказ у непрямій мові — **żeby**: **kazał, żeby wrócił**.', 'Приказ в косвенной речи — **żeby**: **kazał, żeby wrócił**.', 'An order in reported speech takes **żeby**: **kazał, żeby wrócił**.')),
    build('grammar.legenda', 'Mnich kazał pasterzowi wrócić do domu', t('Монах наказав пастухові повернутися додому', 'Монах велел пастуху вернуться домой', 'The monk told the shepherd to go back home'), ['pasterza', 'żeby']),
    oddOne('grammar.legenda', ['powiedział, że przyjdzie', 'zapytał, czy przyjdzie', 'kazał mu, żeby przyszedł', 'prosił, że przyjdzie'], 3,
      t('Прохання вводить **żeby**: **prosił, żeby przyszedł**.', 'Просьбу вводит **żeby**: **prosił, żeby przyszedł**.', 'A request is introduced by **żeby**: **prosił, żeby przyszedł**.'),
      t('Яка фраза хибна?', 'Какая фраза неверна?', 'Which phrase is wrong?')),
    translate('writing.legenda', t('Пастух запитав монаха, чи скарб справді існує, а монах відповів, що знайде його лише добра людина.', 'Пастух спросил монаха, существует ли клад на самом деле, а монах ответил, что найдёт его только добрый человек.', 'The shepherd asked the monk whether the treasure really existed, and the monk answered that only a good person would find it.'),
      ['Pasterz zapytał mnicha, czy skarb naprawdę istnieje, a mnich odpowiedział, że znajdzie go tylko dobry człowiek.', 'Pasterz zapytał mnicha, czy skarb naprawdę istnieje, a mnich odpowiedział, że znajdzie go tylko dobra osoba.', 'Pasterz zapytał mnicha, czy skarb naprawdę istnieje, a mnich odpowiedział, że znajdzie go tylko dobry człowiek']),
    speak('speaking.legenda', 'Według legendy pewnego razu młody pasterz spotkał na Łysej Górze starego mnicha.', t('За легендою, одного разу молодий пастух зустрів на Лисій горі старого монаха.', 'По легенде, однажды молодой пастух встретил на Лысой горе старого монаха.', 'According to legend, once upon a time a young shepherd met an old monk on Łysa Góra.')),
  ],
};

export const KIE_5_8: LessonSeed[] = [KIE_5, KIE_6, KIE_7, KIE_8];

export const KIE_BOSS: LessonSeed = {
  slug: 'kie-boss',
  kind: 'BOSS',
  title: t('Бос: Кельці й Свентокшиський край', 'Босс: Кельце и Свентокшиский край', 'Boss: Kielce and the Świętokrzyskie region'),
  topic: t(
    'відмінки з прийменниками, вид дієслова, który у різних відмінках, умовний спосіб, числівники, nie wolno / należy, мова непряма',
    'падежи с предлогами, вид глагола, który в разных падежах, условное наклонение, числительные, nie wolno / należy, косвенная речь',
    'cases after prepositions, verb aspect, który in different cases, the conditional, numerals, nie wolno / należy, reported speech',
  ),
  cefr: 'B2',
  difficulty: 4,
  explanation: t(
    'Перевір усе з Кельців: відмінки на маршруті, вид дієслова, розповідь про минуле, умовний спосіб, складні речення, числівники, правила в заповіднику й легенду.',
    'Проверь всё из Кельце: падежи на маршруте, вид глагола, рассказ о прошлом, условное наклонение, сложные предложения, числительные, правила в заповеднике и легенду.',
    'Check everything from Kielce: cases on a route, verb aspect, telling about the past, the conditional, complex sentences, numerals, rules in a reserve and a legend.',
  ),
  examples: [],
  words: [],
  exercises: [
    dialogue('situation.boss', INFORMACJA, [
      {
        npc: 'Dzień dobry. Dokąd chciałby pan dzisiaj pojechać?',
        tr: t('Добрий день. Куди б ви хотіли сьогодні поїхати?', 'Добрый день. Куда вы хотели бы сегодня поехать?', 'Good morning. Where would you like to go today?'),
        choose: [
          ['Chciałbym pojechać do jaskini Raj, a jutro na Święty Krzyż.', t('Я хотів би поїхати до печери Рай, а завтра на Святий Хрест.', 'Я хотел бы поехать в пещеру Рай, а завтра на Святой Крест.', 'I’d like to go to the Raj Cave, and tomorrow to Święty Krzyż.')],
          ['Chciałbym pojechać w jaskini Raj, a jutro na Święty Krzyż.', t('(**do** + родовий: **do jaskini**; **w** — місцевий, «де?»)', '(**do** + родительный: **do jaskini**; **w** — предложный, «где?»)', '(“where to” takes **do** + genitive: **do jaskini**; **w** is the locative, “where”)')],
          ['Chciałbym pojechałbym do jaskini Raj, a jutro na Święty Krzyż.', t('(**chciałbym** + інфінітив: **pojechać**, а не друга умовна форма)', '(**chciałbym** + инфинитив: **pojechać**, а не вторая условная форма)', '(**chciałbym** takes an infinitive: **pojechać**, not a second conditional form)')],
        ],
        feedback: t('**chciałbym** + інфінітив; **do** + родовий.', '**chciałbym** + инфинитив; **do** + родительный.', '**chciałbym** + infinitive; **do** + genitive.'),
      },
      {
        npc: 'W jaskini obowiązuje kilka zasad. Proszę pamiętać, że nie wolno wchodzić do bocznych korytarzy.',
        tr: t('У печері діє кілька правил. Прошу пам’ятати, що не можна заходити до бічних коридорів.', 'В пещере действует несколько правил. Прошу помнить, что нельзя заходить в боковые коридоры.', 'A few rules apply in the cave. Please remember that you may not enter the side passages.'),
        choose: [
          ['Dobrze, nie będę tam wchodzić. Czy mogę robić zdjęcia?', t('Добре, я не заходитиму туди. Чи можна робити фото?', 'Хорошо, я не буду туда заходить. Можно ли делать снимки?', 'All right, I won’t go in there. May I take photos?')],
          ['Dobrze, nie będę tam wejść. Czy mogę robić zdjęcia?', t('(**nie będę** + недоконаний інфінітив: **wchodzić**)', '(**nie będę** + несовершенный инфинитив: **wchodzić**)', '(**nie będę** takes an imperfective infinitive: **wchodzić**)')],
          ['Dobrze, nie musiałem tam wchodzić. Czy mogę robić zdjęcia?', t('(**nie musiałem** — минулий час: «мені не довелося», а не обіцянка)', '(**nie musiałem** — прошедшее время: «мне не пришлось», а не обещание)', '(**nie musiałem** is past — “I did not have to”, not a promise)')],
        ],
        feedback: t('Обіцянка не робити — **nie będę** + недоконаний інфінітив.', 'Обещание не делать — **nie będę** + несовершенный инфинитив.', 'A promise not to do something — **nie będę** + imperfective infinitive.'),
      },
    ], { situation: true, scene: t('Туристичний центр у Кельцях', 'Туристический центр в Кельце', 'The tourist information centre in Kielce') }),
    fillGap('grammar.boss', 'Dąb Bartek jest drzewem, ___ wiek szacuje się na siedemset lat.', ['którego', 'którym', 'której'], t('Дуб Бартек — це дерево, вік якого оцінюють у сімсот років.', 'Дуб Бартек — это дерево, возраст которого оценивают в семьсот лет.', 'The Bartek oak is a tree whose age is estimated at seven hundred years.'),
      t('**wiek drzewa** — родовий: **którego wiek**.', '**wiek drzewa** — родительный: **którego wiek**.', '“the age of the tree” is a genitive: **którego wiek**.')),
    match('grammar.boss', [
      ['wbrew zakazowi', t('всупереч забороні', 'вопреки запрету', 'despite the ban')],
      ['dzięki przewodnikowi', t('завдяки провідникові', 'благодаря проводнику', 'thanks to the guide')],
      ['od dawna', t('давно (і досі)', 'давно (и до сих пор)', 'for a long time (and still)')],
      ['gdyby nie', t('якби не', 'если бы не', 'if it weren’t for')],
    ]),
    grammar('grammar.boss', 'Wczoraj w końcu ___ na szczyt Łysicy.', 'wejść', ['weszliśmy'], t('Вчора ми нарешті зійшли на вершину Лисиці.', 'Вчера мы наконец поднялись на вершину Лысицы.', 'Yesterday we finally climbed to the summit of Łysica.'),
      t('Результат («w końcu») — доконаний вид, минулий час: **weszliśmy**.', 'Результат («w końcu») — совершенный вид, прошедшее время: **weszliśmy**.', 'A result (“w końcu”) takes the perfective past: **weszliśmy**.')),
    listen('listening.boss', 'Gdyby nie przewodniczka, nie zobaczylibyśmy jaskini, o której opowiadano w całym regionie.', ['Gdyby nie przewodniczka, nie zobaczylibyśmy jaskini, o której opowiadano w całym regionie.', 'Gdyby nie przewodnik, nie zobaczylibyśmy jaskini, o której opowiadano w całym regionie.', 'Gdyby nie przewodniczka, nie zobaczylibyśmy jaskini, o której opowiadano w całej Polsce.']),
    reading('reading.boss', 'Szanowni Państwo, w sobotę o dziesiątej wyruszamy z dolnej bramy Kadzielni na całodzienną wycieczkę. Trasa ma dwadzieścia dwa kilometry i prowadzi przez wąwóz, obok dębu Bartka aż do opactwa na Świętym Krzyżu. Należy zabrać wodę, ciepłą bluzę i wygodne buty. Psów nie wolno zabierać do rezerwatu. Jeśli w sobotę będzie padać, wycieczka odbędzie się w niedzielę o tej samej godzinie.',
      t('Що станеться, якщо в суботу падатиме дощ?', 'Что произойдёт, если в субботу будет идти дождь?', 'What will happen if it rains on Saturday?'),
      [t('екскурсія відбудеться в неділю о тій самій годині', 'экскурсия состоится в воскресенье в тот же час', 'the trip will take place on Sunday at the same time'), t('екскурсія буде коротшою на десять кілометрів', 'экскурсия будет короче на десять километров', 'the trip will be ten kilometres shorter'), t('екскурсія відбудеться лише в заповіднику', 'экскурсия пройдёт только в заповеднике', 'the trip will take place only in the reserve')]),
    findError('grammar.boss', ['Gdybym', 'miałem', 'czas', 'pojechałbym', 'na', 'Święty', 'Krzyż'], 1, t('Якби я мав час, поїхав би на Святий Хрест.', 'Если бы у меня было время, я поехал бы на Святой Крест.', 'If I had time I would go to Święty Krzyż.'),
      t('Після **gdybym** закінчення особи вже є: **miał**.', 'После **gdybym** окончание лица уже есть: **miał**.', 'After **gdybym** the person ending is already there: **miał**.')),
    wordChoice('vocab.boss', 'zwiedzanie', [t('огляд пам’яток, екскурсія', 'осмотр достопримечательностей, экскурсия', 'sightseeing'), t('візит до лікаря', 'визит к врачу', 'a visit to the doctor'), t('прогулянка на велосипеді', 'прогулка на велосипеде', 'a bike ride')]),
    build('grammar.boss', 'Nie wolno wchodzić do bocznych korytarzy', t('Не можна заходити до бічних коридорів', 'Нельзя заходить в боковые коридоры', 'You may not enter the side passages'), ['wejść', 'boczne']),
    oddOne('grammar.boss', ['dwa kilometry', 'dwadzieścia dwa kilometry', 'dwanaście kilometrów', 'dwadzieścia dwa kilometrów'], 3,
      t('**22** закінчується на **2** — іменник у називному множини: **kilometry**.', '**22** оканчивается на **2** — существительное в именительном множественного: **kilometry**.', '**22** ends in **2**, so the noun is nominative plural: **kilometry**.'),
      t('Яка фраза містить помилку?', 'Какое выражение содержит ошибку?', 'Which expression contains a mistake?')),
    translate('writing.boss', t('Якби в нас було більше часу, ми б побачили дуб Бартек, про який усі розповідають.', 'Если бы у нас было больше времени, мы бы увидели дуб Бартек, о котором все рассказывают.', 'If we had more time we would see the Bartek oak that everyone talks about.'),
      ['Gdybyśmy mieli więcej czasu, zobaczylibyśmy dąb Bartek, o którym wszyscy opowiadają.', 'Gdybyśmy mieli więcej czasu, zobaczylibyśmy dąb Bartek, o którym wszyscy opowiadają', 'Gdybyśmy mieli więcej czasu, zobaczylibyśmy dąb Bartek, o którym wszyscy mówią']),
    speak('speaking.boss', 'Gdybym miał więcej czasu, pojechałbym do jaskini Raj, o której opowiadał mi przewodnik.', t('Якби я мав більше часу, я б поїхав до печери Рай, про яку мені розповідав провідник.', 'Если бы у меня было больше времени, я бы поехал в пещеру Рай, о которой мне рассказывал проводник.', 'If I had more time I would go to the Raj Cave that the guide told me about.')),
  ],
};
