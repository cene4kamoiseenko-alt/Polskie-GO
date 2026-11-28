/**
 * Гдыня — трудные версии уроков (2026-11-28, docs/LEVELS_RU.md, ТЗ 1.0, этап 2). Город спорта и хобби: футбол и гитара, бассейн
 * и лыжи, частота тренировок, абонемент в спортзал, матч «Арки», парусный спорт, травма, хобби. Те же герои (сосед Kuba, подруга
 * Zosia, администратор клуба, болельщик Bartek, инструктор pani Ewa, доктор Lis, Michał). Все уроки города — A2, поэтому B1 и B2:
 *  • B1 — опыт во времени (od kiedy, zacząć / przestać, grywać), условное наклонение (gdybym…, -łbym), «zdarza mi się», просьбы
 *    и жалобы (czy mógłbym, zawiesić karnet), рассказ о матче в прошедшем (wygrać z, zremisować), отглагольные существительные
 *    с предлогами (po skończeniu, zamiast), история травмы, предпочтения (wolę… niż, mam bzika na punkcie);
 *  • B2 — фразеология (grać pierwsze skrzypce, grać komuś na nerwach, to nie wchodzi w grę), книжный язык здоровья (sprzyja,
 *    przyczynia się do), частота (bywać, z rzadka), договор (okres wypowiedzenia, przysługuje mi), комментарий к матчу (gdyby nie…),
 *    правила и условия (w razie, niezależnie od), медицинские формулы (zalecono mi, przeciwwskazania), эссе о хобби (odskocznia od).
 * Правила качества — docs/EXERCISE_QUALITY.md. Аудирования и диктанта в версиях нет (нужна озвучка). Польский текст написан
 * по нормам языка, но проверка носителем ещё не проводилась (docs/ROADMAP_1_0.md).
 */
import { t, fillGap, reading, dialogue, reverseChoice, build, findError, match } from '../builders';
import type { LessonLevels } from '../types';

const KUBA = { name: 'Kuba', emoji: '🧑🏻', role: t('сусід, грає у футбол', 'сосед, играет в футбол', 'a neighbour who plays football') };
const ZOSIA = { name: 'Zosia', emoji: '👩🏻', role: t('подруга з курсу польської', 'подруга с курса польского', 'a friend from Polish class') };
const RECEPCJA = { name: 'Pani w recepcji', emoji: '👩🏼‍💼', role: t('адміністраторка спортклубу', 'администратор спортклуба', 'gym receptionist') };
const BARTEK = { name: 'Bartek', emoji: '👨🏻', role: t('уболівальник «Арки»', 'болельщик «Арки»', 'an Arka fan') };
const EWA = { name: 'Pani Ewa', emoji: '👩🏼', role: t('інструкторка вітрильного спорту', 'инструктор по парусному спорту', 'a sailing instructor') };
const LEKARKA = { name: 'Doktor Lis', emoji: '👩🏻‍⚕️', role: t('лікарка в травмпункті', 'врач в травмпункте', 'an A&E doctor') };
const MICHAL = { name: 'Michał', emoji: '👨🏻', role: t('новий знайомий із клубу', 'новый знакомый из клуба', 'a new friend from the club') };

// ───────────────────────────── gdy-1-grac: Граю у футбол і на гітарі (урок A2) ─────────────────────────────
const GDY1: LessonLevels = {
  B1: {
    explanation: t(
      'Гра в часі — з якого часу, коли почав і коли кинув:\n• **od kiedy grasz?** — **gram od** pięciu **lat** / **od dziecka** (od + родовий);\n• почав — **zacząłem / zaczęłam grać** w tenisa, **kiedy miałem** dziesięć lat;\n• кинув — **przestałem grać** w piłkę **po kontuzji** (przestać + інфінітив);\n• **grywać** — грати час від часу: **grywam** w szachy z dziadkiem;\n• один раз, одна партія — доконаний вид **zagrać**: **zagrajmy** jedną partię.',
      'Игра во времени — с какого времени, когда начал и когда бросил:\n• **od kiedy grasz?** — **gram od** pięciu **lat** / **od dziecka** (od + родительный);\n• начал — **zacząłem / zaczęłam grać** w tenisa, **kiedy miałem** dziesięć lat;\n• бросил — **przestałem grać** w piłkę **po kontuzji** (przestać + инфинитив);\n• **grywać** — играть время от времени: **grywam** w szachy z dziadkiem;\n• один раз, одна партия — совершенный вид **zagrać**: **zagrajmy** jedną partię.',
      'Playing over time — since when, when you started and stopped:\n• **od kiedy grasz?** — **gram od** pięciu **lat** / **od dziecka** (od + genitive);\n• started — **zacząłem / zaczęłam grać** w tenisa, **kiedy miałem** dziesięć lat;\n• stopped — **przestałem grać** w piłkę **po kontuzji** (przestać + infinitive);\n• **grywać** — to play now and then: **grywam** w szachy z dziadkiem;\n• one game — perfective **zagrać**: **zagrajmy** jedną partię.',
    ),
    examples: [
      { pl: 'Zacząłem grać na gitarze, kiedy miałem dwanaście lat.', tr: t('Я почав грати на гітарі, коли мені було дванадцять.', 'Я начал играть на гитаре, когда мне было двенадцать.', 'I started playing the guitar when I was twelve.') },
      { pl: 'Przestałam grać w siatkówkę po studiach, ale grywam czasem na plaży.', tr: t('Я кинула грати у волейбол після навчання, але часом граю на пляжі.', 'Я бросила играть в волейбол после учёбы, но иногда играю на пляже.', 'I stopped playing volleyball after university, but I still play on the beach now and then.') },
    ],
    exercises: [
      dialogue('dialogue.hobby', KUBA, [
        {
          npc: 'Słyszałem, że świetnie grasz na gitarze. Od kiedy grasz?',
          tr: t('Я чув, що ти чудово граєш на гітарі. Відколи граєш?', 'Я слышал, что ты отлично играешь на гитаре. С каких пор играешь?', 'I heard you play the guitar really well. Since when?'),
          choose: [
            ['Od dziecka. Zacząłem grać, kiedy miałem osiem lat.', t('З дитинства. Я почав грати, коли мені було вісім.', 'С детства. Я начал играть, когда мне было восемь.', 'Since I was a kid. I started at eight.')],
            ['Od dziecka. Zacząłem grać, kiedy miałem osiem roków.', t('(вік у роках — **lat**: osiem **lat**; «roków» не буває)', '(возраст в годах — **lat**: osiem **lat**; «roków» не бывает)', '(age in years is **lat**: osiem **lat**)')],
            ['Od dziecka. Zacząłem granie, kiedy miałem osiem lat.', t('(zacząć + **інфінітив**: zacząłem **grać**)', '(zacząć + **инфинитив**: zacząłem **grać**)', '(zacząć + **infinitive**: zacząłem **grać**)')],
          ],
          feedback: t('**Zacząłem grać**, **kiedy miałem** osiem **lat**.', '**Zacząłem grać**, **kiedy miałem** osiem **lat**.', '**Zacząłem grać**, **kiedy miałem** osiem **lat**.'),
        },
        {
          npc: 'A w piłkę jeszcze grasz? Kiedyś byłeś w drużynie szkolnej.',
          tr: t('А у футбол ще граєш? Колись ти був у шкільній команді.', 'А в футбол ещё играешь? Когда-то ты был в школьной команде.', 'Do you still play football? You used to be on the school team.'),
          choose: [
            ['Przestałem grać po kontuzji, ale grywam czasem z kolegami.', t('Я кинув після травми, але часом граю з друзями.', 'Я бросил после травмы, но иногда играю с друзьями.', 'I stopped after an injury, but I play with friends now and then.')],
            ['Przestałem grać po kontuzji, ale gram czasem z kolegom.', t('(z + орудний: **z kolegami**; «z kolegom» — помилка)', '(z + творительный: **z kolegami**; «z kolegom» — ошибка)', '(z + instrumental: **z kolegami**)')],
            ['Przestałem grania po kontuzji, ale grywam czasem z kolegami.', t('(przestać + **інфінітив**: przestałem **grać**)', '(przestać + **инфинитив**: przestałem **grać**)', '(przestać + **infinitive**: przestałem **grać**)')],
          ],
          feedback: t('**Przestać grać**; **grywać** — час від часу.', '**Przestać grać**; **grywać** — время от времени.', '**Przestać grać**; **grywać** — now and then.'),
        },
      ]),
      fillGap('grammar.hobby', 'Gram w szachy ___ siedmiu lat, nauczył mnie dziadek.', ['od', 'przez', 'za', 'po'],
        t('Я граю в шахи з семи років, мене навчив дідусь.', 'Я играю в шахматы с семи лет, меня научил дедушка.', 'I’ve played chess since I was seven; my grandpa taught me.'),
        t('З якого часу — **od** + родовий: **od** siedmiu lat.', 'С какого времени — **od** + родительный: **od** siedmiu lat.', 'Since when — **od** + genitive.')),
      fillGap('grammar.hobby', 'Po studiach przestałam ___ w siatkówkę.', ['grać', 'zagrać', 'granie', 'gram'],
        t('Після навчання я перестала грати у волейбол.', 'После учёбы я перестала играть в волейбол.', 'After university I stopped playing volleyball.'),
        t('przestać + недоконаний інфінітив: przestałam **grać**.', 'przestać + несовершенный инфинитив: przestałam **grać**.', 'przestać + imperfective infinitive.')),
      fillGap('grammar.hobby', 'Mamy jeszcze kwadrans — ___ jedną partię szachów?', ['zagramy', 'gramy', 'zagraliśmy', 'grywamy'],
        t('У нас ще чверть години — зіграємо одну партію в шахи?', 'У нас ещё четверть часа — сыграем одну партию в шахматы?', 'We still have a quarter of an hour — shall we play one game of chess?'),
        t('Одна партія — доконаний вид: **zagramy**.', 'Одна партия — совершенный вид: **zagramy**.', 'One game — perfective **zagramy**.')),
      reading('reading.hobby', 'Marta gra na skrzypcach od dziecka. W liceum przestała ćwiczyć, bo nie miała czasu. Rok temu znowu zaczęła grać — teraz grywa w amatorskiej orkiestrze w Gdyni, zwykle w czwartki.',
        t('Що зараз робить Марта?', 'Что сейчас делает Марта?', 'What does Marta do now?'),
        [t('час від часу грає в аматорському оркестрі', 'время от времени играет в любительском оркестре', 'she plays in an amateur orchestra now and then'), t('кинула скрипку ще в ліцеї й більше не грає', 'бросила скрипку ещё в лицее и больше не играет', 'she gave up the violin in high school for good'), t('щодня займається зі скрипкою по кілька годин', 'каждый день занимается на скрипке по несколько часов', 'she practises the violin for hours every day')],
        t('«**znowu zaczęła grać — teraz grywa** w amatorskiej orkiestrze»: grywać — час від часу.', '«**znowu zaczęła grać — teraz grywa** w amatorskiej orkiestrze»: grywać — время от времени.', '“**znowu zaczęła grać — teraz grywa**”: grywać means now and then.')),
      reverseChoice('vocab.hobby', t('Я час від часу граю в теніс із братом.', 'Я время от времени играю в теннис с братом.', 'I play tennis with my brother now and then.'),
        ['Grywam w tenisa z bratem.', 'Zagrałem w tenisa z bratem.', 'Gram na tenisie z bratem.'],
        t('Час від часу — **grywać**; спорт — **w** + знахідний.', 'Время от времени — **grywać**; спорт — **w** + винительный.', 'Now and then — **grywać**.')),
      findError('grammar.hobby', ['Zaczęłam', 'grać', 'na', 'pianino', 'w', 'szkole'], 3,
        t('Я почала грати на піаніно в школі.', 'Я начала играть на пианино в школе.', 'I started playing the piano at school.'),
        t('Інструмент — **na** + місцевий: na **pianinie**.', 'Инструмент — **na** + предложный: na **pianinie**.', 'Instrument: na **pianinie** (locative).')),
      build('grammar.hobby', 'Przestałem grać w piłkę po kontuzji kolana', t('Я кинув грати у футбол після травми коліна', 'Я бросил играть в футбол после травмы колена', 'I stopped playing football after a knee injury'), ['granie', 'na']),
      match('vocab.hobby', [
        ['od dziecka', t('з дитинства', 'с детства', 'since childhood')],
        ['grywać', t('грати час від часу', 'играть время от времени', 'to play now and then')],
        ['przestać grać', t('кинути грати', 'бросить играть', 'to stop playing')],
        ['zagrać partię', t('зіграти партію', 'сыграть партию', 'to play one game')],
      ]),
    ],
  },
  B2: {
    explanation: t(
      'Фразеологія з «grać»: так говорять у новинах і на роботі, не лише про спорт:\n• **grać pierwsze skrzypce** — бути головним, задавати тон;\n• **grać komuś na nerwach** — діяти на нерви;\n• **to nie wchodzi w grę** — про це не може бути мови;\n• **grać na zwłokę** — тягнути час;\n• **gra nie jest warta świeczki** — гра не варта свічок;\n• **grać do jednej bramki** — діяти разом, в одних інтересах.',
      'Фразеология с «grać»: так говорят в новостях и на работе, не только о спорте:\n• **grać pierwsze skrzypce** — быть главным, задавать тон;\n• **grać komuś na nerwach** — действовать на нервы;\n• **to nie wchodzi w grę** — об этом не может быть и речи;\n• **grać na zwłokę** — тянуть время;\n• **gra nie jest warta świeczki** — игра не стоит свеч;\n• **grać do jednej bramki** — действовать заодно, в общих интересах.',
      'Idioms with «grać» — used in news and at work, not only about sport:\n• **grać pierwsze skrzypce** — to call the tune, be the leading figure;\n• **grać komuś na nerwach** — to get on someone’s nerves;\n• **to nie wchodzi w grę** — that’s out of the question;\n• **grać na zwłokę** — to play for time;\n• **gra nie jest warta świeczki** — the game isn’t worth the candle;\n• **grać do jednej bramki** — to pull in the same direction.',
    ),
    examples: [
      { pl: 'W naszym zespole pierwsze skrzypce gra Kuba — to on układa setlistę.', tr: t('У нашому гурті тон задає Куба — це він складає сет-лист.', 'В нашей группе тон задаёт Куба — это он составляет сет-лист.', 'Kuba calls the tune in our band — he puts the setlist together.') },
      { pl: 'Odwołanie koncertu w ostatniej chwili nie wchodzi w grę.', tr: t('Скасування концерту в останню мить — про це не може бути мови.', 'Отмена концерта в последний момент — об этом не может быть и речи.', 'Cancelling the gig at the last minute is out of the question.') },
    ],
    exercises: [
      dialogue('dialogue.hobby', KUBA, [
        {
          npc: 'Sąsiad znowu ćwiczy na perkusji o północy. Co o tym myślisz?',
          tr: t('Сусід знову грає на барабанах опівночі. Що ти про це думаєш?', 'Сосед опять играет на барабанах в полночь. Что ты об этом думаешь?', 'The neighbour is drumming at midnight again. What do you think?'),
          choose: [
            ['Szczerze? Gra mi już na nerwach — porozmawiam z nim jutro.', t('Чесно? Мене це вже дратує — поговорю з ним завтра.', 'Честно? Меня это уже бесит — поговорю с ним завтра.', 'Honestly? It’s getting on my nerves — I’ll talk to him tomorrow.')],
            ['Szczerze? Gra mi już pierwsze skrzypce — porozmawiam z nim jutro.', t('(**grać pierwsze skrzypce** — бути головним, а не дратувати)', '(**grać pierwsze skrzypce** — быть главным, а не раздражать)', '(**grać pierwsze skrzypce** means to lead, not to annoy)')],
            ['Szczerze? Gra mi już na zwłokę — porozmawiam z nim jutro.', t('(**grać na zwłokę** — тягнути час)', '(**grać na zwłokę** — тянуть время)', '(**grać na zwłokę** — to play for time)')],
          ],
          feedback: t('**Grać komuś na nerwach** — дратувати.', '**Grać komuś na nerwach** — раздражать.', '**Grać komuś na nerwach** — to annoy.'),
        },
        {
          npc: 'Może po prostu zadzwonimy na policję?',
          tr: t('Може, просто подзвонимо в поліцію?', 'Может, просто позвоним в полицию?', 'Maybe we just call the police?'),
          choose: [
            ['To nie wchodzi w grę — najpierw spróbujmy się dogadać.', t('Про це не може бути мови — спершу спробуймо домовитися.', 'Об этом не может быть и речи — сначала попробуем договориться.', 'That’s out of the question — let’s try to sort it out first.')],
            ['To nie wchodzi do gry — najpierw spróbujmy się dogadać.', t('(стала фраза: **nie wchodzi w grę**, з «w»)', '(устойчивая фраза: **nie wchodzi w grę**, с «w»)', '(set phrase: **nie wchodzi w grę**)')],
            ['To nie gra w grę — najpierw spróbujmy się dogadać.', t('(дієслово у фразі — **wchodzić**: nie **wchodzi** w grę)', '(глагол во фразе — **wchodzić**: nie **wchodzi** w grę)', '(the verb is **wchodzić**: nie **wchodzi** w grę)')],
          ],
          feedback: t('**To nie wchodzi w grę** — категорична відмова.', '**To nie wchodzi w grę** — категорический отказ.', '**To nie wchodzi w grę** — a firm no.'),
        },
      ]),
      fillGap('vocab.idioms', 'Zarząd gra na ___, bo nie chce podjąć decyzji przed wyborami.', ['zwłokę', 'zwłoce', 'nerwach', 'bramkę'],
        t('Правління тягне час, бо не хоче ухвалювати рішення до виборів.', 'Правление тянет время, потому что не хочет принимать решение до выборов.', 'The board is playing for time because it doesn’t want to decide before the elections.'),
        t('Тягнути час — **grać na zwłokę** (знахідний).', 'Тянуть время — **grać na zwłokę** (винительный).', 'To play for time — **grać na zwłokę** (accusative).')),
      fillGap('vocab.idioms', 'Jeśli trener i zarząd nie będą grać do jednej ___, klub spadnie z ligi.', ['bramki', 'drużyny', 'piłki', 'gry'],
        t('Якщо тренер і правління не діятимуть разом, клуб вилетить із ліги.', 'Если тренер и правление не будут действовать заодно, клуб вылетит из лиги.', 'If the coach and the board don’t pull together, the club will be relegated.'),
        t('Діяти разом — **grać do jednej bramki**.', 'Действовать заодно — **grać do jednej bramki**.', 'Pull together — **grać do jednej bramki**.')),
      fillGap('vocab.idioms', 'Bilet za trzysta złotych na mecz towarzyski? Gra nie jest warta ___.', ['świeczki', 'świec', 'świeczkę', 'świecy'],
        t('Квиток за триста злотих на товариський матч? Гра не варта свічок.', 'Билет за триста злотых на товарищеский матч? Игра не стоит свеч.', 'Three hundred złoty for a friendly? The game isn’t worth the candle.'),
        t('Польською — одна свічечка, родовий: **warta świeczki** (не «świec», як у «не варта свічок»).', 'По-польски — одна свечка, родительный: **warta świeczki** (не «świec», как в «не стоит свеч»).', 'Polish uses one small candle, genitive: **warta świeczki**.')),
      reading('reading.idioms', 'W orkiestrze miejskiej od lat pierwsze skrzypce gra dyrygent Nowak. Młodzi muzycy narzekają, że gra im na nerwach, bo nie słucha ich pomysłów. Dyrektor teatru gra na zwłokę i nie chce się wtrącać przed końcem sezonu.',
        t('Як поводиться директор театру?', 'Как ведёт себя директор театра?', 'How does the theatre director behave?'),
        [t('тягне час і не втручається до кінця сезону', 'тянет время и не вмешивается до конца сезона', 'he plays for time and won’t step in before the season ends'), t('сам керує оркестром замість диригента', 'сам руководит оркестром вместо дирижёра', 'he runs the orchestra himself instead of the conductor'), t('підтримує молодих музикантів проти диригента', 'поддерживает молодых музыкантов против дирижёра', 'he backs the young musicians against the conductor')],
        t('«Dyrektor **gra na zwłokę** i nie chce się wtrącać» — тягне час.', '«Dyrektor **gra na zwłokę** i nie chce się wtrącać» — тянет время.', '“Dyrektor **gra na zwłokę**” — he is playing for time.')),
      reverseChoice('vocab.idioms', t('Тут тон задає капітан, а не тренер.', 'Здесь тон задаёт капитан, а не тренер.', 'Here the captain calls the tune, not the coach.'),
        ['Tu pierwsze skrzypce gra kapitan, a nie trener.', 'Tu na nerwach gra kapitan, a nie trener.', 'Tu do jednej bramki gra kapitan, a nie trener.'],
        t('Бути головним — **grać pierwsze skrzypce**.', 'Быть главным — **grać pierwsze skrzypce**.', 'To lead — **grać pierwsze skrzypce**.')),
      findError('vocab.idioms', ['Ten', 'hałas', 'gra', 'mi', 'na', 'nerwy'], 5,
        t('Цей шум діє мені на нерви.', 'Этот шум действует мне на нервы.', 'This noise gets on my nerves.'),
        t('Стала фраза — місцевий: grać komuś na **nerwach**.', 'Устойчивая фраза — предложный: grać komuś na **nerwach**.', 'Set phrase: na **nerwach** (locative).')),
      build('vocab.idioms', 'Przeprowadzka w środku sezonu nie wchodzi w grę', t('Переїзд посеред сезону — про це не може бути мови', 'Переезд посреди сезона — об этом не может быть и речи', 'Moving in the middle of the season is out of the question'), ['do', 'gra']),
      match('vocab.idioms', [
        ['grać pierwsze skrzypce', t('задавати тон', 'задавать тон', 'to call the tune')],
        ['grać na zwłokę', t('тягнути час', 'тянуть время', 'to play for time')],
        ['grać do jednej bramki', t('діяти разом', 'действовать заодно', 'to pull together')],
        ['nie wchodzić w grę', t('бути неможливим', 'быть исключённым', 'to be out of the question')],
      ]),
    ],
  },
};

// ───────────────────────────── gdy-2-uprawiam: Басейн, спортзал, лижі (урок A2) ─────────────────────────────
const GDY2: LessonLevels = {
  B1: {
    explanation: t(
      'Плани й поради щодо спорту:\n• умовний спосіб — **gdybym miał(a) czas, chodził(a)bym na basen** (якби… то б…);\n• порада — **powinieneś / powinnaś zacząć biegać**; **warto** + інфінітив: **warto** jeździć na rowerze;\n• записатися — **zapisać się na** + знахідний: **zapisałam się na** jogę / **na** kurs pływania;\n• відтоді як — **odkąd zacząłem biegać, czuję się lepiej**.',
      'Планы и советы про спорт:\n• условное наклонение — **gdybym miał(a) czas, chodził(a)bym na basen** (если бы… то…);\n• совет — **powinieneś / powinnaś zacząć biegać**; **warto** + инфинитив: **warto** jeździć na rowerze;\n• записаться — **zapisać się na** + винительный: **zapisałam się na** jogę / **na** kurs pływania;\n• с тех пор как — **odkąd zacząłem biegać, czuję się lepiej**.',
      'Plans and advice about sport:\n• conditional — **gdybym miał(a) czas, chodził(a)bym na basen** (if I had time, I would…);\n• advice — **powinieneś / powinnaś zacząć biegać**; **warto** + infinitive: **warto** jeździć na rowerze;\n• to sign up — **zapisać się na** + accusative: **zapisałam się na** jogę / **na** kurs pływania;\n• ever since — **odkąd zacząłem biegać, czuję się lepiej**.',
    ),
    examples: [
      { pl: 'Gdybym mieszkał bliżej morza, pływałbym codziennie.', tr: t('Якби я жив ближче до моря, плавав би щодня.', 'Если бы я жил ближе к морю, плавал бы каждый день.', 'If I lived closer to the sea, I’d swim every day.') },
      { pl: 'Odkąd zapisałam się na jogę, mniej boli mnie kręgosłup.', tr: t('Відколи я записалася на йогу, у мене менше болить хребет.', 'С тех пор как я записалась на йогу, у меня меньше болит позвоночник.', 'Since I signed up for yoga, my back hurts less.') },
    ],
    exercises: [
      dialogue('dialogue.sport', ZOSIA, [
        {
          npc: 'Ciągle mówisz, że chcesz zacząć coś uprawiać. Co cię powstrzymuje?',
          tr: t('Ти весь час кажеш, що хочеш почати чимось займатися. Що тебе стримує?', 'Ты всё время говоришь, что хочешь начать чем-то заниматься. Что тебя останавливает?', 'You keep saying you want to take up a sport. What’s stopping you?'),
          choose: [
            ['Gdybym miał więcej czasu, chodziłbym na basen trzy razy w tygodniu.', t('Якби в мене було більше часу, я ходив би на басейн тричі на тиждень.', 'Если бы у меня было больше времени, я ходил бы в бассейн три раза в неделю.', 'If I had more time, I’d go to the pool three times a week.')],
            ['Gdybym mam więcej czasu, chodziłbym na basen trzy razy w tygodniu.', t('(після **gdyby** — форма на -ł: gdybym **miał**)', '(после **gdyby** — форма на -ł: gdybym **miał**)', '(after **gdyby** use the -ł form: gdybym **miał**)')],
            ['Gdybym miał więcej czasu, chodzę na basen trzy razy w tygodniu.', t('(у наслідку теж умовний спосіб: **chodziłbym**)', '(в следствии тоже условное наклонение: **chodziłbym**)', '(the result clause is conditional too: **chodziłbym**)')],
          ],
          feedback: t('**Gdybym miał…, chodziłbym…** — обидві частини умовні.', '**Gdybym miał…, chodziłbym…** — обе части условные.', 'Both parts are conditional.'),
        },
        {
          npc: 'To może zacznij od czegoś krótkiego? Na przykład joga w środy.',
          tr: t('То, може, почни з чогось короткого? Наприклад, йога по середах.', 'Тогда, может, начни с чего-то короткого? Например, йога по средам.', 'Then why not start with something short? Yoga on Wednesdays, say.'),
          choose: [
            ['Dobry pomysł, jutro zapiszę się na jogę.', t('Гарна ідея, завтра запишуся на йогу.', 'Хорошая идея, завтра запишусь на йогу.', 'Good idea, I’ll sign up for yoga tomorrow.')],
            ['Dobry pomysł, jutro zapiszę się do jogi.', t('(записатися на заняття — **zapisać się na** + знахідний)', '(записаться на занятия — **zapisać się na** + винительный)', '(sign up for a class — **zapisać się na**)')],
            ['Dobry pomysł, jutro zapiszę się na jodze.', t('(після **na** тут знахідний: na **jogę**)', '(после **na** здесь винительный: na **jogę**)', '(here **na** takes the accusative: na **jogę**)')],
          ],
          feedback: t('**Zapisać się na jogę / na kurs**.', '**Zapisać się na jogę / na kurs**.', '**Zapisać się na jogę**.'),
        },
      ]),
      fillGap('grammar.conditional', 'Gdybyś regularnie ćwiczyła, nie ___ cię plecy.', ['bolałyby', 'bolą', 'bolały', 'będą bolały'],
        t('Якби ти регулярно тренувалася, у тебе не боліла б спина.', 'Если бы ты регулярно тренировалась, у тебя не болела бы спина.', 'If you exercised regularly, your back wouldn’t hurt.'),
        t('Наслідок у умовному способі: **bolałyby** (plecy — множина).', 'Следствие в условном наклонении: **bolałyby** (plecy — множественное).', 'Conditional result: **bolałyby** (plecy is plural).')),
      fillGap('grammar.sport', 'Warto ___ na rowerze do pracy — oszczędzasz czas i pieniądze.', ['jeździć', 'jeździsz', 'jazda', 'jeżdżąc'],
        t('Варто їздити на роботу велосипедом — економиш час і гроші.', 'Стоит ездить на работу на велосипеде — экономишь время и деньги.', 'It’s worth cycling to work — you save time and money.'),
        t('**Warto** + інфінітив: warto **jeździć**.', '**Warto** + инфинитив: warto **jeździć**.', '**Warto** + infinitive.')),
      fillGap('grammar.sport', '___ zacząłem biegać, lepiej śpię i mam więcej energii.', ['Odkąd', 'Dopóki', 'Zanim', 'Chociaż'],
        t('Відколи я почав бігати, краще сплю й маю більше енергії.', 'С тех пор как я начал бегать, я лучше сплю и у меня больше энергии.', 'Ever since I started running, I sleep better and have more energy.'),
        t('Відтоді як — **odkąd**.', 'С тех пор как — **odkąd**.', 'Ever since — **odkąd**.')),
      reading('reading.sport', 'Pan Tomasz pracuje przy komputerze dziesięć godzin dziennie. Lekarz powiedział mu, że powinien się więcej ruszać. Pan Tomasz zapisał się na basen, ale chodzi tylko w soboty. Mówi, że gdyby klub był otwarty wcześniej rano, pływałby przed pracą.',
        t('Чому пан Томаш не плаває перед роботою?', 'Почему пан Томаш не плавает перед работой?', 'Why doesn’t Mr Tomasz swim before work?'),
        [t('клуб відчиняється надто пізно', 'клуб открывается слишком поздно', 'the club opens too late'), t('лікар заборонив йому плавати вранці', 'врач запретил ему плавать по утрам', 'the doctor told him not to swim in the morning'), t('він працює за комп’ютером із самого ранку', 'он работает за компьютером с самого утра', 'he works at the computer from early morning')],
        t('«**gdyby klub był otwarty wcześniej rano, pływałby** przed pracą» — умова не виконується: клуб відчиняється пізно.', '«**gdyby klub był otwarty wcześniej rano, pływałby** przed pracą» — условие не выполняется: клуб открывается поздно.', '“**gdyby klub był otwarty wcześniej rano, pływałby**” — the condition isn’t met: the club opens late.')),
      reverseChoice('grammar.sport', t('Тобі варто записатися на курс плавання.', 'Тебе стоит записаться на курс плавания.', 'You should sign up for a swimming course.'),
        ['Powinieneś zapisać się na kurs pływania.', 'Powinieneś zapisać się do kursu pływania.', 'Powinieneś zapisywać się na kursie pływania.'],
        t('**Zapisać się na kurs** (знахідний).', '**Zapisać się na kurs** (винительный).', '**Zapisać się na kurs**.')),
      findError('grammar.conditional', ['Gdybym', 'miała', 'narty', 'jeżdżę', 'w', 'góry'], 3,
        t('Якби в мене були лижі, я їздила б у гори.', 'Если бы у меня были лыжи, я ездила бы в горы.', 'If I had skis, I’d go to the mountains.'),
        t('Наслідок — умовний спосіб: **jeździłabym**.', 'Следствие — условное наклонение: **jeździłabym**.', 'Result clause: **jeździłabym**.')),
      build('grammar.conditional', 'Gdybym miał czas, chodziłbym na siłownię', t('Якби в мене був час, я ходив би в спортзал', 'Если бы у меня было время, я ходил бы в спортзал', 'If I had time, I’d go to the gym'), ['chodzę', 'mam'], ['Chodziłbym na siłownię, gdybym miał czas'],
        t('Обидві частини умовні: **gdybym miał… chodziłbym**.', 'Обе части условные: **gdybym miał… chodziłbym**.', 'Both clauses are conditional.')),
      match('grammar.sport', [
        ['zapisać się na jogę', t('записатися на йогу', 'записаться на йогу', 'to sign up for yoga')],
        ['warto biegać', t('варто бігати', 'стоит бегать', 'it’s worth running')],
        ['odkąd ćwiczę', t('відколи я тренуюся', 'с тех пор как я тренируюсь', 'ever since I’ve been training')],
        ['powinnaś odpocząć', t('тобі слід відпочити', 'тебе следует отдохнуть', 'you should rest')],
      ]),
    ],
  },
  B2: {
    explanation: t(
      'Мова статей про здоров’я й спорт:\n• **sprzyjać** + давальний — сприяти: ruch **sprzyja zdrowiu**;\n• **przyczyniać się do** + родовий — спричинятися до: siedzący tryb życia **przyczynia się do** otyłości;\n• **im więcej…, tym…** — чим більше…, тим…: **im więcej** się ruszamy, **tym** lepiej śpimy;\n• безособово — **zaleca się** + інфінітив: **zaleca się** 150 minut ruchu tygodniowo;\n• **wbrew pozorom** — всупереч очікуванням, насправді.',
      'Язык статей о здоровье и спорте:\n• **sprzyjać** + дательный — способствовать: ruch **sprzyja zdrowiu**;\n• **przyczyniać się do** + родительный — вести к: siedzący tryb życia **przyczynia się do** otyłości;\n• **im więcej…, tym…** — чем больше…, тем…: **im więcej** się ruszamy, **tym** lepiej śpimy;\n• безлично — **zaleca się** + инфинитив: **zaleca się** 150 minut ruchu tygodniowo;\n• **wbrew pozorom** — вопреки ожиданиям, на самом деле.',
      'The language of health and fitness articles:\n• **sprzyjać** + dative — to be good for: ruch **sprzyja zdrowiu**;\n• **przyczyniać się do** + genitive — to contribute to: siedzący tryb życia **przyczynia się do** otyłości;\n• **im więcej…, tym…** — the more…, the…: **im więcej** się ruszamy, **tym** lepiej śpimy;\n• impersonal — **zaleca się** + infinitive: **zaleca się** 150 minut ruchu tygodniowo;\n• **wbrew pozorom** — contrary to appearances.',
    ),
    examples: [
      { pl: 'Wbrew pozorom pływanie przyczynia się do spadku wagi wolniej niż bieganie.', tr: t('Всупереч очікуванням плавання сприяє схудненню повільніше, ніж біг.', 'Вопреки ожиданиям плавание способствует снижению веса медленнее, чем бег.', 'Contrary to appearances, swimming helps you lose weight more slowly than running.') },
      { pl: 'Im wcześniej zaczniemy ćwiczyć, tym łatwiej będzie utrzymać kondycję.', tr: t('Чим раніше почнемо тренуватися, тим легше буде тримати форму.', 'Чем раньше начнём тренироваться, тем легче будет держать форму.', 'The sooner we start training, the easier it’ll be to stay fit.') },
    ],
    exercises: [
      dialogue('dialogue.sport', ZOSIA, [
        {
          npc: 'Przeczytałam, że wystarczy chodzić na spacery. Siłownia to strata czasu?',
          tr: t('Я прочитала, що досить ходити на прогулянки. Спортзал — це марнування часу?', 'Я прочитала, что достаточно гулять. Спортзал — это потеря времени?', 'I read that walking is enough. Is the gym a waste of time?'),
          choose: [
            ['Wbrew pozorom nie — ćwiczenia siłowe sprzyjają zdrowiu kości.', t('Всупереч очікуванням ні — силові вправи корисні для кісток.', 'Вопреки ожиданиям нет — силовые упражнения полезны для костей.', 'Contrary to appearances, no — strength training is good for your bones.')],
            ['Wbrew pozorom nie — ćwiczenia siłowe sprzyjają zdrowie kości.', t('(**sprzyjać** + давальний: sprzyjają **zdrowiu**)', '(**sprzyjać** + дательный: sprzyjają **zdrowiu**)', '(**sprzyjać** + dative: **zdrowiu**)')],
            ['Wbrew pozorów nie — ćwiczenia siłowe sprzyjają zdrowiu kości.', t('(стала фраза — **wbrew pozorom**, давальний)', '(устойчивая фраза — **wbrew pozorom**, дательный)', '(set phrase: **wbrew pozorom**)')],
          ],
          feedback: t('**Wbrew pozorom**; **sprzyjać** + давальний.', '**Wbrew pozorom**; **sprzyjać** + дательный.', '**Wbrew pozorom**; **sprzyjać** + dative.'),
        },
        {
          npc: 'A ile trzeba się ruszać, żeby to miało sens?',
          tr: t('А скільки треба рухатися, щоб це мало сенс?', 'А сколько нужно двигаться, чтобы это имело смысл?', 'And how much do you need to move for it to make sense?'),
          choose: [
            ['Zaleca się przynajmniej sto pięćdziesiąt minut ruchu tygodniowo.', t('Рекомендують щонайменше сто п’ятдесят хвилин руху на тиждень.', 'Рекомендуется не меньше ста пятидесяти минут движения в неделю.', 'At least 150 minutes of exercise a week is recommended.')],
            ['Zaleca się przynajmniej sto pięćdziesiąt minut ruchu tygodniowych.', t('(**tygodniowo** — прислівник: «на тиждень»)', '(**tygodniowo** — наречие: «в неделю»)', '(**tygodniowo** is an adverb: “weekly”)')],
            ['Zalecają się przynajmniej sto pięćdziesiąt minut ruchu tygodniowo.', t('(безособова форма — **zaleca się**, однина)', '(безличная форма — **zaleca się**, единственное)', '(impersonal **zaleca się**, singular)')],
          ],
          feedback: t('**Zaleca się** + іменник / інфінітив.', '**Zaleca się** + существительное / инфинитив.', '**Zaleca się** — impersonal.'),
        },
      ]),
      fillGap('grammar.formal', 'Siedzący tryb życia przyczynia się do ___ chorób serca.', ['rozwoju', 'rozwój', 'rozwojem', 'rozwojowi'],
        t('Сидячий спосіб життя сприяє розвитку хвороб серця.', 'Сидячий образ жизни способствует развитию болезней сердца.', 'A sedentary lifestyle contributes to the development of heart disease.'),
        t('**przyczyniać się do** + родовий: do **rozwoju**.', '**przyczyniać się do** + родительный: do **rozwoju**.', '**przyczyniać się do** + genitive.')),
      fillGap('grammar.formal', 'Im dłużej odkładamy pierwszy trening, ___ trudniej się zmobilizować.', ['tym', 'to', 'więc', 'tak'],
        t('Чим довше відкладаємо перше тренування, тим важче себе змусити.', 'Чем дольше откладываем первую тренировку, тем труднее себя заставить.', 'The longer we put off the first workout, the harder it is to get going.'),
        t('Пара **im…, tym…**.', 'Пара **im…, tym…**.', 'The pair **im…, tym…**.')),
      fillGap('grammar.formal', 'Osobom po sześćdziesiątce ___ się ćwiczenia w wodzie zamiast biegania.', ['zaleca', 'zalecają', 'zaleci', 'zalecano by'],
        t('Людям після шістдесяти рекомендують вправи у воді замість бігу.', 'Людям после шестидесяти рекомендуют упражнения в воде вместо бега.', 'Over-sixties are advised to exercise in water instead of running.'),
        t('Безособово в теперішньому: **zaleca się**.', 'Безлично в настоящем: **zaleca się**.', 'Impersonal present: **zaleca się**.')),
      reading('reading.formal', 'Z badań Uniwersytetu Gdańskiego wynika, że regularna aktywność fizyczna sprzyja koncentracji. Im więcej ruchu w ciągu dnia, tym lepsze wyniki w testach pamięci. Wbrew pozorom krótkie, dziesięciominutowe spacery dają podobny efekt jak godzina na siłowni.',
        t('Що дослідження каже про короткі прогулянки?', 'Что исследование говорит о коротких прогулках?', 'What does the study say about short walks?'),
        [t('дають ефект, схожий на годину в спортзалі', 'дают эффект, похожий на час в спортзале', 'they work about as well as an hour at the gym'), t('корисні лише в поєднанні зі спортзалом', 'полезны только в сочетании со спортзалом', 'they only help when combined with the gym'), t('погіршують результати тестів пам’яті', 'ухудшают результаты тестов памяти', 'they lower memory test scores')],
        t('«**Wbrew pozorom** krótkie spacery **dają podobny efekt** jak godzina na siłowni».', '«**Wbrew pozorom** krótkie spacery **dają podobny efekt** jak godzina na siłowni».', '“**Wbrew pozorom** krótkie spacery **dają podobny efekt**”.')),
      reverseChoice('grammar.formal', t('Чим більше ми рухаємося, тим краще спимо.', 'Чем больше мы двигаемся, тем лучше спим.', 'The more we move, the better we sleep.'),
        ['Im więcej się ruszamy, tym lepiej śpimy.', 'Im więcej się ruszamy, to lepiej śpimy.', 'Czym więcej się ruszamy, tym lepiej śpimy.'],
        t('Пара **im…, tym…**; «czym» — русизм.', 'Пара **im…, tym…**; «czym» — калька с русского.', 'The pair **im…, tym…**.')),
      findError('grammar.formal', ['Ruch', 'na', 'świeżym', 'powietrzu', 'sprzyja', 'zdrowie'], 5,
        t('Рух на свіжому повітрі сприяє здоров’ю.', 'Движение на свежем воздухе способствует здоровью.', 'Exercise in the fresh air is good for your health.'),
        t('**sprzyjać** + давальний: sprzyja **zdrowiu**.', '**sprzyjać** + дательный: sprzyja **zdrowiu**.', '**sprzyjać** + dative: **zdrowiu**.')),
      build('grammar.formal', 'Zaleca się co najmniej pół godziny ruchu dziennie', t('Рекомендують щонайменше пів години руху на день', 'Рекомендуется не меньше получаса движения в день', 'At least half an hour of exercise a day is recommended'), ['zalecają', 'dzienny']),
      match('grammar.formal', [
        ['sprzyjać zdrowiu', t('сприяти здоров’ю', 'способствовать здоровью', 'to be good for health')],
        ['przyczyniać się do otyłości', t('спричинятися до ожиріння', 'вести к ожирению', 'to contribute to obesity')],
        ['wbrew pozorom', t('всупереч очікуванням', 'вопреки ожиданиям', 'contrary to appearances')],
        ['zaleca się', t('рекомендується', 'рекомендуется', 'it is recommended')],
      ]),
    ],
  },
};

// ───────────────────────────── gdy-3-jak-czesto: Як часто? (урок A2) ─────────────────────────────
const GDY3: LessonLevels = {
  B1: {
    explanation: t(
      'Звички тоді й тепер:\n• колись — **kiedyś** + недоконаний минулий: **kiedyś biegałem** codziennie, **a teraz** biegam raz w tygodniu;\n• буває — **zdarza mi się** + інфінітив: **zdarza mi się** opuścić trening;\n• **coraz częściej / coraz rzadziej** — дедалі частіше / рідше;\n• **co drugi dzień** — через день; **przynajmniej / co najmniej raz** — принаймні раз.',
      'Привычки тогда и сейчас:\n• раньше — **kiedyś** + несовершенный прошедший: **kiedyś biegałem** codziennie, **a teraz** biegam raz w tygodniu;\n• бывает — **zdarza mi się** + инфинитив: **zdarza mi się** opuścić trening;\n• **coraz częściej / coraz rzadziej** — всё чаще / всё реже;\n• **co drugi dzień** — через день; **przynajmniej / co najmniej raz** — хотя бы раз.',
      'Habits then and now:\n• used to — **kiedyś** + imperfective past: **kiedyś biegałem** codziennie, **a teraz** biegam raz w tygodniu;\n• it happens — **zdarza mi się** + infinitive: **zdarza mi się** opuścić trening;\n• **coraz częściej / coraz rzadziej** — more and more / less and less often;\n• **co drugi dzień** — every other day; **przynajmniej / co najmniej raz** — at least once.',
    ),
    examples: [
      { pl: 'Kiedyś grałam w kosza co weekend, a teraz zdarza mi się zagrać raz w miesiącu.', tr: t('Колись я грала в баскетбол щовихідних, а тепер буває, що граю раз на місяць.', 'Раньше я играла в баскетбол каждые выходные, а теперь бывает, что играю раз в месяц.', 'I used to play basketball every weekend; now I play maybe once a month.') },
      { pl: 'Biegam co drugi dzień, przynajmniej pięć kilometrów.', tr: t('Я бігаю через день, щонайменше п’ять кілометрів.', 'Я бегаю через день, как минимум пять километров.', 'I run every other day, at least five kilometres.') },
    ],
    exercises: [
      dialogue('dialogue.frequency', MICHAL, [
        {
          npc: 'Dawno cię nie widziałem w klubie. Przestałeś trenować?',
          tr: t('Давно тебе не бачив у клубі. Ти перестав тренуватися?', 'Давно тебя не видел в клубе. Ты перестал тренироваться?', 'Haven’t seen you at the club for ages. Have you stopped training?'),
          choose: [
            ['Nie, ale przychodzę coraz rzadziej — mam dużo pracy.', t('Ні, але приходжу дедалі рідше — багато роботи.', 'Нет, но прихожу всё реже — много работы.', 'No, but I come less and less — lots of work.')],
            ['Nie, ale przychodzę coraz rzadko — mam dużo pracy.', t('(з «coraz» — вищий ступінь: **coraz rzadziej**)', '(с «coraz» — сравнительная степень: **coraz rzadziej**)', '(with «coraz» use the comparative: **rzadziej**)')],
            ['Nie, ale przychodzę coraz więcej rzadko — mam dużo pracy.', t('(вищий ступінь одним словом: **rzadziej**)', '(сравнительная степень одним словом: **rzadziej**)', '(one-word comparative: **rzadziej**)')],
          ],
          feedback: t('**Coraz rzadziej / coraz częściej**.', '**Coraz rzadziej / coraz częściej**.', '**Coraz rzadziej / częściej**.'),
        },
        {
          npc: 'Rozumiem. A opuszczasz też sobotnie biegi?',
          tr: t('Розумію. А суботні пробіжки теж пропускаєш?', 'Понимаю. А субботние пробежки тоже пропускаешь?', 'I see. Do you skip the Saturday runs too?'),
          choose: [
            ['Zdarza mi się, ale staram się biegać przynajmniej raz w tygodniu.', t('Буває, але намагаюся бігати принаймні раз на тиждень.', 'Бывает, но стараюсь бегать хотя бы раз в неделю.', 'Sometimes, but I try to run at least once a week.')],
            ['Zdarzam się, ale staram się biegać przynajmniej raz w tygodniu.', t('(безособово: **zdarza mi się**, «мені трапляється»)', '(безлично: **zdarza mi się**, «со мной бывает»)', '(impersonal: **zdarza mi się**)')],
            ['Zdarza mnie się, ale staram się biegać przynajmniej raz w tygodniu.', t('(давальний: zdarza **mi** się)', '(дательный: zdarza **mi** się)', '(dative: zdarza **mi** się)')],
          ],
          feedback: t('**Zdarza mi się** — давальний «mi».', '**Zdarza mi się** — дательный «mi».', '**Zdarza mi się** — dative «mi».'),
        },
      ]),
      fillGap('grammar.frequency', 'Kiedyś ___ na siłownię codziennie, ale po przeprowadzce przestałem.', ['chodziłem', 'poszedłem', 'chodzę', 'pójdę'],
        t('Колись я ходив у спортзал щодня, але після переїзду перестав.', 'Раньше я ходил в спортзал каждый день, но после переезда перестал.', 'I used to go to the gym every day, but I stopped after moving.'),
        t('Звичка в минулому — недоконаний: **chodziłem**.', 'Привычка в прошлом — несовершенный: **chodziłem**.', 'Past habit — imperfective **chodziłem**.')),
      fillGap('grammar.frequency', 'Trenujemy co ___ dzień: poniedziałek, środa, piątek.', ['drugi', 'dwa', 'druga', 'drugie'],
        t('Ми тренуємося через день: понеділок, середа, п’ятниця.', 'Мы тренируемся через день: понедельник, среда, пятница.', 'We train every other day: Monday, Wednesday, Friday.'),
        t('Через день — **co drugi dzień** (dzień — чол. рід).', 'Через день — **co drugi dzień** (dzień — мужской род).', 'Every other day — **co drugi dzień**.')),
      fillGap('grammar.frequency', 'Zdarza mi się ___ trening, kiedy pada deszcz.', ['opuścić', 'opuszczam', 'opuściłem', 'opuszczenie'],
        t('Буває, що я пропускаю тренування, коли йде дощ.', 'Бывает, что я пропускаю тренировку, когда идёт дождь.', 'Sometimes I skip training when it rains.'),
        t('**zdarza mi się** + інфінітив: **opuścić**.', '**zdarza mi się** + инфинитив: **opuścić**.', '**zdarza mi się** + infinitive.')),
      reading('reading.frequency', 'Ankieta klubu „Arka Fit”: 40% członków ćwiczy co najmniej trzy razy w tygodniu, 35% — raz albo dwa razy, a reszta przychodzi coraz rzadziej. Najczęściej opuszczają treningi osoby, które pracują na zmiany.',
        t('Хто найчастіше пропускає тренування?', 'Кто чаще всего пропускает тренировки?', 'Who skips training most often?'),
        [t('люди, які працюють позмінно', 'люди, работающие посменно', 'people who work shifts'), t('ті, хто тренується тричі на тиждень', 'те, кто тренируется трижды в неделю', 'those who train three times a week'), t('нові члени клубу', 'новые члены клуба', 'new club members')],
        t('«**Najczęściej opuszczają** treningi osoby, które **pracują na zmiany**».', '«**Najczęściej opuszczają** treningi osoby, które **pracują na zmiany**».', '“**Najczęściej opuszczają** treningi osoby, które **pracują na zmiany**”.')),
      reverseChoice('grammar.frequency', t('Колись я плавав щодня, а тепер — раз на тиждень.', 'Раньше я плавал каждый день, а теперь — раз в неделю.', 'I used to swim every day; now it’s once a week.'),
        ['Kiedyś pływałem codziennie, a teraz raz w tygodniu.', 'Kiedyś popłynąłem codziennie, a teraz raz w tygodniu.', 'Kiedyś pływam codziennie, a teraz raz w tygodniu.'],
        t('Звичка в минулому — **pływałem** (недоконаний).', 'Привычка в прошлом — **pływałem** (несовершенный).', 'Past habit — **pływałem**.')),
      findError('grammar.frequency', ['Ćwiczę', 'przynajmniej', 'trzy', 'raz', 'w', 'tygodniu'], 3,
        t('Я тренуюся щонайменше тричі на тиждень.', 'Я тренируюсь как минимум три раза в неделю.', 'I train at least three times a week.'),
        t('Після «trzy» — **razy**: trzy **razy**.', 'После «trzy» — **razy**: trzy **razy**.', 'After «trzy»: **razy**.')),
      build('grammar.frequency', 'Coraz częściej jeżdżę do pracy rowerem', t('Я дедалі частіше їжджу на роботу велосипедом', 'Я всё чаще езжу на работу на велосипеде', 'I cycle to work more and more often'), ['często', 'rower']),
      match('grammar.frequency', [
        ['co drugi dzień', t('через день', 'через день', 'every other day')],
        ['coraz rzadziej', t('дедалі рідше', 'всё реже', 'less and less often')],
        ['zdarza mi się', t('буває, що я', 'бывает, что я', 'I sometimes')],
        ['przynajmniej raz', t('принаймні раз', 'хотя бы раз', 'at least once')],
      ]),
    ],
  },
  B2: {
    explanation: t(
      'Тонкі відтінки частоти:\n• **bywać** — бувати регулярно: **bywam** na siłowni, ale bez planu;\n• **z rzadka / od czasu do czasu** — зрідка, час від часу;\n• **systematycznie / nieregularnie** — систематично / нерегулярно;\n• **ani razu** — жодного разу (із «nie»): **nie** byłem tam **ani razu**;\n• розмовне **na okrągło** — без кінця: gada o fitnessie **na okrągło**;\n• **zdarzało się, że…** — бувало, що…',
      'Тонкие оттенки частоты:\n• **bywać** — бывать регулярно: **bywam** na siłowni, ale bez planu;\n• **z rzadka / od czasu do czasu** — изредка, время от времени;\n• **systematycznie / nieregularnie** — систематически / нерегулярно;\n• **ani razu** — ни разу (с «nie»): **nie** byłem tam **ani razu**;\n• разговорное **na okrągło** — без конца: gada o fitnessie **na okrągło**;\n• **zdarzało się, że…** — бывало, что…',
      'Fine shades of frequency:\n• **bywać** — to be somewhere regularly: **bywam** na siłowni, ale bez planu;\n• **z rzadka / od czasu do czasu** — rarely, from time to time;\n• **systematycznie / nieregularnie** — systematically / irregularly;\n• **ani razu** — not even once (with «nie»): **nie** byłem tam **ani razu**;\n• colloquial **na okrągło** — non-stop: gada o fitnessie **na okrągło**;\n• **zdarzało się, że…** — it used to happen that…',
    ),
    examples: [
      { pl: 'Na treningach bywam nieregularnie, a na zawodach nie byłem ani razu.', tr: t('На тренуваннях я буваю нерегулярно, а на змаганнях не був жодного разу.', 'На тренировках я бываю нерегулярно, а на соревнованиях не был ни разу.', 'I turn up to training irregularly and I’ve never once been to a competition.') },
      { pl: 'Zdarzało się, że trenowaliśmy na okrągło przez cały weekend.', tr: t('Бувало, що ми тренувалися без кінця всі вихідні.', 'Бывало, что мы тренировались без конца все выходные.', 'There were times we trained non-stop all weekend.') },
    ],
    exercises: [
      dialogue('dialogue.frequency', MICHAL, [
        {
          npc: 'Trener pyta, czy w tym sezonie będziesz trenować na poważnie.',
          tr: t('Тренер питає, чи цього сезону ти тренуватимешся серйозно.', 'Тренер спрашивает, будешь ли ты в этом сезоне тренироваться всерьёз.', 'The coach is asking if you’ll train seriously this season.'),
          choose: [
            ['Chciałbym, ale na razie bywam w klubie nieregularnie.', t('Хотів би, але поки що буваю в клубі нерегулярно.', 'Хотел бы, но пока бываю в клубе нерегулярно.', 'I’d like to, but for now I turn up irregularly.')],
            ['Chciałbym, ale na razie bywam w klubie nieregularny.', t('(як? — прислівник: **nieregularnie**)', '(как? — наречие: **nieregularnie**)', '(how? — adverb **nieregularnie**)')],
            ['Chciałbym, ale na razie bywam do klubu nieregularnie.', t('(бувати де? — **w** klubie, місцевий)', '(бывать где? — **w** klubie, предложный)', '(be where? — **w** klubie)')],
          ],
          feedback: t('**Bywać w** klubie, **nieregularnie**.', '**Bywać w** klubie, **nieregularnie**.', '**Bywać w** klubie.'),
        },
        {
          npc: 'A na sparingach? Trener mówi, że cię nie widział.',
          tr: t('А на спарингах? Тренер каже, що тебе не бачив.', 'А на спаррингах? Тренер говорит, что тебя не видел.', 'And at the sparring sessions? The coach says he hasn’t seen you.'),
          choose: [
            ['Ma rację, w tym miesiącu nie byłem tam ani razu.', t('Має рацію, цього місяця я там не був жодного разу.', 'Он прав, в этом месяце я там не был ни разу.', 'He’s right — I haven’t been once this month.')],
            ['Ma rację, w tym miesiącu byłem tam ani razu.', t('(з **ani razu** — заперечення: **nie byłem**)', '(с **ani razu** — отрицание: **nie byłem**)', '(**ani razu** needs **nie**)')],
            ['Ma rację, w tym miesiącu nie byłem tam ani raz.', t('(жодного разу — родовий: **ani razu**)', '(ни разу — родительный: **ani razu**)', '(genitive: **ani razu**)')],
          ],
          feedback: t('**Nie… ani razu** — подвійне заперечення.', '**Nie… ani razu** — двойное отрицание.', '**Nie… ani razu** — double negation.'),
        },
      ]),
      fillGap('vocab.frequency', 'Na koncerty chodzę tylko od czasu do ___ — nie mam na to pieniędzy.', ['czasu', 'razu', 'chwili', 'dnia'],
        t('На концерти я ходжу лише час від часу — немає на це грошей.', 'На концерты я хожу только время от времени — нет на это денег.', 'I only go to gigs from time to time — I can’t afford it.'),
        t('Стала фраза — **od czasu do czasu**.', 'Устойчивая фраза — **od czasu do czasu**.', 'Set phrase: **od czasu do czasu**.')),
      fillGap('vocab.frequency', 'Mój brat mówi o swoim nowym rowerze na ___ — już nie mogę tego słuchać.', ['okrągło', 'okrągły', 'kółko', 'zawsze'],
        t('Мій брат говорить про свій новий велосипед без кінця — я вже не можу цього слухати.', 'Мой брат говорит о своём новом велосипеде без конца — я уже не могу это слушать.', 'My brother talks about his new bike non-stop — I can’t listen any more.'),
        t('Розмовне «без кінця» — **na okrągło**.', 'Разговорное «без конца» — **na okrągło**.', 'Colloquial “non-stop” — **na okrągło**.')),
      fillGap('vocab.frequency', 'W zeszłym sezonie ___ się, że odwoływano mecze z powodu mgły.', ['zdarzało', 'zdarza', 'zdarzy', 'zdarzałoby'],
        t('Минулого сезону бувало, що матчі скасовували через туман.', 'В прошлом сезоне бывало, что матчи отменяли из-за тумана.', 'Last season matches were sometimes called off because of fog.'),
        t('Повторюване в минулому — **zdarzało się, że…**', 'Повторяющееся в прошлом — **zdarzało się, że…**', 'Repeated in the past — **zdarzało się**.')),
      reading('reading.frequency', 'Raport klubu żeglarskiego: większość członków bywa na przystani systematycznie, w każdą sobotę. Z rzadka pojawiają się osoby z dalszych miejscowości. Zdarzało się, że zimą przystań stała pusta przez cały tydzień.',
        t('Що звіт каже про людей із дальших місцевостей?', 'Что отчёт говорит о людях из дальних мест?', 'What does the report say about people from further away?'),
        [t('вони з’являються зрідка', 'они появляются изредка', 'they turn up rarely'), t('вони приходять щосуботи', 'они приходят каждую субботу', 'they come every Saturday'), t('їх ніколи не буває взимку', 'их никогда не бывает зимой', 'they never come in winter')],
        t('«**Z rzadka pojawiają się** osoby z dalszych miejscowości» — z rzadka = зрідка.', '«**Z rzadka pojawiają się** osoby z dalszych miejscowości» — z rzadka = изредка.', '“**Z rzadka pojawiają się**” — z rzadka means rarely.')),
      reverseChoice('vocab.frequency', t('Я жодного разу не пропустив тренування.', 'Я ни разу не пропустил тренировку.', 'I haven’t missed a single training session.'),
        ['Ani razu nie opuściłem treningu.', 'Ani razu opuściłem treningu.', 'Ani raz nie opuściłem treningu.'],
        t('**Nie… ani razu** — і заперечення, і родовий.', '**Nie… ani razu** — и отрицание, и родительный.', '**Nie… ani razu**.')),
      findError('vocab.frequency', ['Na', 'basenie', 'bywam', 'systematyczny', 'od', 'roku'], 3,
        t('У басейні я буваю систематично вже рік.', 'В бассейне я бываю систематически уже год.', 'I’ve been going to the pool regularly for a year.'),
        t('Як? — прислівник: **systematycznie**.', 'Как? — наречие: **systematycznie**.', 'Adverb: **systematycznie**.')),
      build('vocab.frequency', 'Od czasu do czasu bywam na meczach Arki', t('Час від часу я буваю на матчах «Арки»', 'Время от времени я бываю на матчах «Арки»', 'Now and then I go to Arka matches'), ['razu', 'bywać']),
      match('vocab.frequency', [
        ['bywać', t('бувати регулярно', 'бывать регулярно', 'to frequent')],
        ['z rzadka', t('зрідка', 'изредка', 'rarely')],
        ['na okrągło', t('без кінця', 'без конца', 'non-stop')],
        ['ani razu', t('жодного разу', 'ни разу', 'not once')],
      ]),
    ],
  },
};

// ───────────────────────────── gdy-4-silownia: Абонемент у спортзал (урок A2) ─────────────────────────────
const GDY4: LessonLevels = {
  B1: {
    explanation: t(
      'Прохання й скарги на рецепції:\n• ввічливо — умовний спосіб: **czy mógłbym / mogłabym** + інфінітив; безособово — **czy dałoby się** + інфінітив;\n• абонемент — **zawiesić karnet na** + знахідний (na dwa tygodnie), **przedłużyć karnet**;\n• скарга — **nie działa** + називний (prysznic nie działa), **brakuje** + родовий (brakuje ręczników);\n• причина — **w związku z** + орудний: w związku z wyjazdem.',
      'Просьбы и жалобы на ресепшене:\n• вежливо — условное наклонение: **czy mógłbym / mogłabym** + инфинитив; безлично — **czy dałoby się** + инфинитив;\n• абонемент — **zawiesić karnet na** + винительный (na dwa tygodnie), **przedłużyć karnet**;\n• жалоба — **nie działa** + именительный (prysznic nie działa), **brakuje** + родительный (brakuje ręczników);\n• причина — **w związku z** + творительный: w związku z wyjazdem.',
      'Requests and complaints at reception:\n• politely — the conditional: **czy mógłbym / mogłabym** + infinitive; impersonal — **czy dałoby się** + infinitive;\n• membership — **zawiesić karnet na** + accusative (na dwa tygodnie), **przedłużyć karnet**;\n• complaints — **nie działa** + nominative (prysznic nie działa), **brakuje** + genitive (brakuje ręczników);\n• reason — **w związku z** + instrumental: w związku z wyjazdem.',
    ),
    examples: [
      { pl: 'Czy mógłbym zawiesić karnet na dwa tygodnie? Wyjeżdżam służbowo.', tr: t('Чи міг би я призупинити абонемент на два тижні? Я їду у відрядження.', 'Мог бы я приостановить абонемент на две недели? Я уезжаю в командировку.', 'Could I freeze my membership for two weeks? I’m away on business.') },
      { pl: 'W szatni znowu brakuje wieszaków, a suszarka nie działa.', tr: t('У роздягальні знову бракує вішаків, а фен не працює.', 'В раздевалке опять не хватает вешалок, а фен не работает.', 'The changing room is short of hangers again, and the hairdryer doesn’t work.') },
    ],
    exercises: [
      dialogue('dialogue.gym', RECEPCJA, [
        {
          npc: 'Dzień dobry, w czym mogę pomóc?',
          tr: t('Добрий день, чим можу допомогти?', 'Добрый день, чем могу помочь?', 'Good morning, how can I help?'),
          choose: [
            ['Czy mógłbym zawiesić karnet na miesiąc? Wyjeżdżam do pracy za granicę.', t('Чи міг би я призупинити абонемент на місяць? Я їду працювати за кордон.', 'Мог бы я приостановить абонемент на месяц? Я уезжаю работать за границу.', 'Could I freeze my membership for a month? I’m going abroad for work.')],
            ['Czy mógłbym zawiesić karnet za miesiąc? Wyjeżdżam do pracy za granicę.', t('(на який термін — **na** + знахідний; «za miesiąc» — через місяць)', '(на какой срок — **na** + винительный; «za miesiąc» — через месяц)', '(for how long — **na**; «za miesiąc» means “in a month”)')],
            ['Czy mogłem zawiesić karnet na miesiąc? Wyjeżdżam do pracy za granicę.', t('(ввічливе прохання — умовний: **mógłbym**; «mogłem» — минулий час)', '(вежливая просьба — условное: **mógłbym**; «mogłem» — прошедшее время)', '(a polite request uses the conditional **mógłbym**)')],
          ],
          feedback: t('**Czy mógłbym zawiesić karnet na miesiąc?**', '**Czy mógłbym zawiesić karnet na miesiąc?**', '**Czy mógłbym zawiesić karnet na miesiąc?**'),
        },
        {
          npc: 'Oczywiście, zawieszenie kosztuje dziesięć złotych. Coś jeszcze?',
          tr: t('Звісно, призупинення коштує десять злотих. Щось іще?', 'Конечно, приостановка стоит десять злотых. Что-нибудь ещё?', 'Of course, a freeze costs ten złoty. Anything else?'),
          choose: [
            ['Tak, w męskiej szatni nie działa prysznic i brakuje ręczników.', t('Так, у чоловічій роздягальні не працює душ і бракує рушників.', 'Да, в мужской раздевалке не работает душ и не хватает полотенец.', 'Yes, the shower in the men’s changing room is broken and there are no towels.')],
            ['Tak, w męskiej szatni nie działa prysznic i brakuje ręczniki.', t('(**brakuje** + родовий: brakuje **ręczników**)', '(**brakuje** + родительный: brakuje **ręczników**)', '(**brakuje** + genitive: **ręczników**)')],
            ['Tak, w męskiej szatni nie działają prysznic i brakuje ręczników.', t('(prysznic — однина: nie **działa**)', '(prysznic — единственное число: nie **działa**)', '(prysznic is singular: nie **działa**)')],
          ],
          feedback: t('**Nie działa** + називний; **brakuje** + родовий.', '**Nie działa** + именительный; **brakuje** + родительный.', '**Nie działa** + nominative; **brakuje** + genitive.'),
        },
      ]),
      fillGap('grammar.requests', 'W szatni od tygodnia brakuje ___ na ubrania.', ['wieszaków', 'wieszaki', 'wieszakami', 'wieszakach'],
        t('У роздягальні вже тиждень бракує вішаків для одягу.', 'В раздевалке уже неделю не хватает вешалок для одежды.', 'The changing room has been short of clothes hangers for a week.'),
        t('**Brakuje** + родовий множини: **wieszaków**.', '**Brakuje** + родительный множественного: **wieszaków**.', '**Brakuje** + genitive plural.')),
      fillGap('grammar.requests', '___ z wyjazdem chciałabym zawiesić karnet do końca lipca.', ['W związku', 'Z powodu', 'Dzięki', 'Ze względu'],
        t('У зв’язку з від’їздом я хотіла б призупинити абонемент до кінця липня.', 'В связи с отъездом я хотела бы приостановить абонемент до конца июля.', 'Because I’m going away, I’d like to freeze my membership until the end of July.'),
        t('Після пропуску стоїть **z** + орудний — підходить лише **w związku z**. (Z powodu + родовий, ze względu **na**.)', 'После пропуска стоит **z** + творительный — подходит только **w związku z**. (Z powodu + родительный, ze względu **na**.)', 'The gap is followed by **z** + instrumental — only **w związku z** fits.')),
      fillGap('grammar.requests', 'Czy ___ się zapisać na trening z trenerem jeszcze dziś?', ['dałoby', 'dałby', 'dałaby', 'dałyby'],
        t('Чи можна було б записатися на тренування з тренером ще сьогодні?', 'Можно было бы записаться на тренировку с тренером ещё сегодня?', 'Would it be possible to book a session with a trainer today?'),
        t('Безособово — середній рід: **czy dałoby się**.', 'Безлично — средний род: **czy dałoby się**.', 'Impersonal — neuter: **czy dałoby się**.')),
      reading('reading.gym', 'Regulamin klubu „Arka Fit”: karnet można zawiesić raz w roku, najwyżej na trzy tygodnie. Zawieszenie kosztuje 10 zł. Jeśli w szatni czegoś brakuje albo sprzęt nie działa, prosimy o zgłoszenie w recepcji.',
        t('На скільки щонайбільше можна призупинити абонемент?', 'На сколько максимум можно приостановить абонемент?', 'What is the longest you can freeze a membership for?'),
        [t('на три тижні, раз на рік', 'на три недели, раз в год', 'three weeks, once a year'), t('на три місяці, щокварталу', 'на три месяца, каждый квартал', 'three months, every quarter'), t('на скільки завгодно за 10 злотих', 'на сколько угодно за 10 злотых', 'as long as you like for 10 złoty')],
        t('«karnet można zawiesić **raz w roku, najwyżej na trzy tygodnie**».', '«karnet można zawiesić **raz w roku, najwyżej na trzy tygodnie**».', '“**raz w roku, najwyżej na trzy tygodnie**” — once a year, three weeks at most.')),
      reverseChoice('grammar.requests', t('Чи могла б я заплатити карткою?', 'Могла бы я заплатить картой?', 'Could I pay by card?'),
        ['Czy mogłabym zapłacić kartą?', 'Czy mogłabym zapłacić kartę?', 'Czy mogłam zapłacić kartą?'],
        t('Ввічливо — **mogłabym**; чим — орудний: **kartą**.', 'Вежливо — **mogłabym**; чем — творительный: **kartą**.', 'Polite **mogłabym**; instrumental **kartą**.')),
      findError('grammar.requests', ['Prysznic', 'w', 'szatni', 'znowu', 'nie', 'działają'], 5,
        t('Душ у роздягальні знову не працює.', 'Душ в раздевалке опять не работает.', 'The shower in the changing room is broken again.'),
        t('Prysznic — однина: nie **działa**.', 'Prysznic — единственное число: nie **działa**.', 'Prysznic is singular: nie **działa**.')),
      build('grammar.requests', 'Czy mógłbym zawiesić karnet na dwa tygodnie', t('Чи міг би я призупинити абонемент на два тижні', 'Мог бы я приостановить абонемент на две недели', 'Could I freeze my membership for two weeks'), ['za', 'mogę'], ['Czy mógłbym na dwa tygodnie zawiesić karnet'],
        t('Ввічливо — **mógłbym**; на який термін — **na** + знахідний.', 'Вежливо — **mógłbym**; на какой срок — **na** + винительный.', 'Polite **mógłbym**; duration — **na** + accusative.')),
      match('vocab.gym', [
        ['zawiesić karnet', t('призупинити абонемент', 'приостановить абонемент', 'to freeze a membership')],
        ['przedłużyć karnet', t('продовжити абонемент', 'продлить абонемент', 'to renew a membership')],
        ['brakuje ręczników', t('бракує рушників', 'не хватает полотенец', 'there are no towels')],
        ['czy dałoby się', t('чи можна було б', 'можно было бы', 'would it be possible')],
      ]),
    ],
  },
  B2: {
    explanation: t(
      'Мова договору й претензії:\n• розірвати — **wypowiedzieć umowę** з дотриманням **okresu wypowiedzenia** (терміну попередження);\n• **zgodnie z** + орудний — згідно з: zgodnie z regulaminem;\n• **przysługuje mi** + називний — мені належить: zwrot, zniżka;\n• стягнути — **pobrać opłatę**; безособово: **pobrano ode mnie** opłatę **za** + знахідний;\n• відмовитися — **zrezygnować z** + родовий: z karnetu; **kara umowna** — штраф за договором.',
      'Язык договора и претензии:\n• расторгнуть — **wypowiedzieć umowę** с соблюдением **okresu wypowiedzenia** (срока предупреждения);\n• **zgodnie z** + творительный — согласно: zgodnie z regulaminem;\n• **przysługuje mi** + именительный — мне положено: zwrot, zniżka;\n• списать — **pobrać opłatę**; безлично: **pobrano ode mnie** opłatę **za** + винительный;\n• отказаться — **zrezygnować z** + родительный: z karnetu; **kara umowna** — штраф по договору.',
      'Contract and complaint language:\n• to terminate — **wypowiedzieć umowę** with the **okres wypowiedzenia** (notice period);\n• **zgodnie z** + instrumental — in accordance with: zgodnie z regulaminem;\n• **przysługuje mi** + nominative — I am entitled to: zwrot, zniżka;\n• to charge — **pobrać opłatę**; impersonal: **pobrano ode mnie** opłatę **za** + accusative;\n• to cancel — **zrezygnować z** + genitive: z karnetu; **kara umowna** — a contractual penalty.',
    ),
    examples: [
      { pl: 'Zgodnie z regulaminem umowę można wypowiedzieć z zachowaniem miesięcznego okresu wypowiedzenia.', tr: t('Згідно з правилами договір можна розірвати з дотриманням місячного терміну попередження.', 'Согласно правилам договор можно расторгнуть с соблюдением месячного срока предупреждения.', 'Under the rules the contract can be terminated with one month’s notice.') },
      { pl: 'Pobrano ode mnie opłatę za marzec, choć zrezygnowałem z karnetu w lutym.', tr: t('З мене стягнули плату за березень, хоча я відмовився від абонемента в лютому.', 'С меня списали плату за март, хотя я отказался от абонемента в феврале.', 'I was charged for March, although I cancelled my membership in February.') },
    ],
    exercises: [
      dialogue('dialogue.gym', RECEPCJA, [
        {
          npc: 'Rozumiem, że chce pan zrezygnować z karnetu. Ma pan umowę roczną.',
          tr: t('Я так розумію, ви хочете відмовитися від абонемента. У вас річний договір.', 'Я так понимаю, вы хотите отказаться от абонемента. У вас годовой договор.', 'I understand you want to cancel your membership. You have an annual contract.'),
          choose: [
            ['Tak, chciałbym wypowiedzieć umowę z zachowaniem okresu wypowiedzenia.', t('Так, я хотів би розірвати договір із дотриманням терміну попередження.', 'Да, я хотел бы расторгнуть договор с соблюдением срока предупреждения.', 'Yes, I’d like to terminate the contract with the notice period.')],
            ['Tak, chciałbym wypowiedzieć umowę z zachowaniem okresu wypowiedzeniem.', t('(чого — родовий: okresu **wypowiedzenia**)', '(чего — родительный: okresu **wypowiedzenia**)', '(genitive: okresu **wypowiedzenia**)')],
            ['Tak, chciałbym wypowiedzieć się umowę z zachowaniem okresu wypowiedzenia.', t('(розірвати договір — без «się»; **wypowiedzieć się** — висловитися)', '(расторгнуть договор — без «się»; **wypowiedzieć się** — высказаться)', '(no «się»: **wypowiedzieć się** means to express an opinion)')],
          ],
          feedback: t('**Wypowiedzieć umowę** з дотриманням **okresu wypowiedzenia**.', '**Wypowiedzieć umowę** с соблюдением **okresu wypowiedzenia**.', '**Wypowiedzieć umowę** with notice.'),
        },
        {
          npc: 'Okres wypowiedzenia wynosi miesiąc. Czy coś jeszcze?',
          tr: t('Термін попередження — місяць. Щось іще?', 'Срок предупреждения — месяц. Что-нибудь ещё?', 'The notice period is one month. Anything else?'),
          choose: [
            ['Tak. W lutym pobrano ode mnie podwójną opłatę — przysługuje mi zwrot.', t('Так. У лютому з мене стягнули подвійну плату — мені належить повернення.', 'Да. В феврале с меня списали двойную плату — мне положен возврат.', 'Yes. In February I was charged twice — I’m entitled to a refund.')],
            ['Tak. W lutym pobrano ode mnie podwójną opłatę — przysługuję mi zwrot.', t('(що належить — zwrot, 3-тя особа: **przysługuje**)', '(что положено — zwrot, 3-е лицо: **przysługuje**)', '(the subject is zwrot: **przysługuje**)')],
            ['Tak. W lutym pobrano mi podwójną opłatę — przysługuje mi zwrot.', t('(з кого стягнули — **od** + родовий: **ode mnie**)', '(с кого списали — **od** + родительный: **ode mnie**)', '(charged to whom — **ode mnie**)')],
          ],
          feedback: t('**Pobrano ode mnie** opłatę; **przysługuje mi** zwrot.', '**Pobrano ode mnie** opłatę; **przysługuje mi** zwrot.', '**Pobrano ode mnie**; **przysługuje mi**.'),
        },
      ]),
      fillGap('register.contract', 'Zgodnie ___ regulaminem opłata za zawieszenie karnetu wynosi 10 zł.', ['z', 'do', 'wobec', 'według'],
        t('Згідно з правилами плата за призупинення абонемента — 10 злотих.', 'Согласно правилам плата за приостановку абонемента — 10 злотых.', 'Under the rules a membership freeze costs 10 złoty.'),
        t('**Zgodnie z** + орудний: zgodnie **z** regulaminem.', '**Zgodnie z** + творительный: zgodnie **z** regulaminem.', '**Zgodnie z** + instrumental.')),
      fillGap('register.contract', 'Klient może zrezygnować ___ usług w ciągu 14 dni bez podania przyczyny.', ['z', 'od', 'do', 'o'],
        t('Клієнт може відмовитися від послуг протягом 14 днів без пояснення причин.', 'Клиент может отказаться от услуг в течение 14 дней без объяснения причин.', 'Customers can cancel the services within 14 days without giving a reason.'),
        t('Відмовитися — **zrezygnować z** + родовий (не «od»).', 'Отказаться — **zrezygnować z** + родительный (не «od»).', 'To cancel — **zrezygnować z** + genitive.')),
      fillGap('register.contract', 'W razie wypowiedzenia umowy przed upływem pół roku klub ma prawo ___ karę umowną.', ['naliczyć', 'naliczy', 'naliczenia', 'naliczył'],
        t('У разі розірвання договору раніше ніж за пів року клуб має право нарахувати штраф.', 'При расторжении договора раньше чем через полгода клуб вправе начислить штраф.', 'If the contract is terminated within six months, the club may charge a penalty.'),
        t('**Mieć prawo** + інфінітив: ma prawo **naliczyć**.', '**Mieć prawo** + инфинитив: ma prawo **naliczyć**.', '**Mieć prawo** + infinitive.')),
      reading('reading.contract', 'Fragment umowy: „Umowa zostaje zawarta na 12 miesięcy. Każdej ze stron przysługuje prawo jej wypowiedzenia z zachowaniem miesięcznego okresu wypowiedzenia. W razie wypowiedzenia przed upływem 6 miesięcy klub nalicza opłatę w wysokości jednej miesięcznej raty”.',
        t('Що буде, якщо розірвати договір через чотири місяці?', 'Что будет, если расторгнуть договор через четыре месяца?', 'What happens if you terminate after four months?'),
        [t('клуб нарахує плату в розмірі одного місячного внеску', 'клуб начислит плату в размере одного месячного взноса', 'the club charges one monthly instalment'), t('договір не можна розірвати раніше ніж за рік', 'договор нельзя расторгнуть раньше чем через год', 'the contract cannot be ended before a year is up'), t('клуб поверне гроші за всі місяці', 'клуб вернёт деньги за все месяцы', 'the club refunds every month paid')],
        t('«**W razie wypowiedzenia przed upływem 6 miesięcy** klub nalicza opłatę w wysokości jednej miesięcznej raty».', '«**W razie wypowiedzenia przed upływem 6 miesięcy** klub nalicza opłatę w wysokości jednej miesięcznej raty».', '“**W razie wypowiedzenia przed upływem 6 miesięcy**…” — one monthly instalment.')),
      reverseChoice('register.contract', t('Мені належить студентська знижка.', 'Мне положена студенческая скидка.', 'I’m entitled to a student discount.'),
        ['Przysługuje mi zniżka studencka.', 'Przysługuję mi zniżka studencka.', 'Przysługuje mnie zniżkę studencką.'],
        t('**Przysługuje** + давальний (mi) + називний (zniżka).', '**Przysługuje** + дательный (mi) + именительный (zniżka).', '**Przysługuje** + dative + nominative.')),
      findError('register.contract', ['Pobrano', 'ode', 'mnie', 'opłatę', 'za', 'marca'], 5,
        t('З мене стягнули плату за березень.', 'С меня списали плату за март.', 'I was charged for March.'),
        t('Плата за що — **za** + знахідний: za **marzec**.', 'Плата за что — **za** + винительный: za **marzec**.', '**Za** + accusative: za **marzec**.')),
      build('register.contract', 'Wypowiadam umowę z zachowaniem okresu wypowiedzenia', t('Розриваю договір із дотриманням терміну попередження', 'Расторгаю договор с соблюдением срока предупреждения', 'I am terminating the contract with notice'), ['wypowiedzeniem', 'się'], [],
        t('Офіційна формула: **wypowiadam umowę z zachowaniem okresu wypowiedzenia**.', 'Официальная формула: **wypowiadam umowę z zachowaniem okresu wypowiedzenia**.', 'The standard formula for giving notice.')),
      match('register.contract', [
        ['okres wypowiedzenia', t('термін попередження', 'срок предупреждения', 'notice period')],
        ['kara umowna', t('штраф за договором', 'штраф по договору', 'contractual penalty')],
        ['przysługuje mi', t('мені належить', 'мне положено', 'I am entitled to')],
        ['zgodnie z regulaminem', t('згідно з правилами', 'согласно правилам', 'under the rules')],
      ]),
    ],
  },
};

// ───────────────────────────── gdy-5-mecz: Ідемо на матч (урок A2) ─────────────────────────────
const GDY5: LessonLevels = {
  B1: {
    explanation: t(
      'Розповідь про матч у минулому:\n• результат — Arka **wygrała z** Lechią (z + орудний) **dwa do jednego**; mecz **zakończył się remisem** (орудний);\n• хід гри — недоконаний: Arka **prowadziła** jeden do zera, **przegrywaliśmy** do przerwy;\n• поворот — доконаний: Lechia **wyrównała**, **strzeliliśmy** dwa gole, bramkarz **obronił** rzut karny;\n• коли — **w drugiej połowie**, **w ostatniej minucie** (місцевий).',
      'Рассказ о матче в прошедшем:\n• результат — Arka **wygrała z** Lechią (z + творительный) **dwa do jednego**; mecz **zakończył się remisem** (творительный);\n• ход игры — несовершенный: Arka **prowadziła** jeden do zera, **przegrywaliśmy** do przerwy;\n• поворот — совершенный: Lechia **wyrównała**, **strzeliliśmy** dwa gole, bramkarz **obronił** rzut karny;\n• когда — **w drugiej połowie**, **w ostatniej minucie** (предложный).',
      'Telling a match story in the past:\n• result — Arka **wygrała z** Lechią (z + instrumental) **dwa do jednego**; mecz **zakończył się remisem** (instrumental);\n• the run of play — imperfective: Arka **prowadziła** jeden do zera, **przegrywaliśmy** do przerwy;\n• turning points — perfective: Lechia **wyrównała**, **strzeliliśmy** dwa gole, bramkarz **obronił** rzut karny;\n• when — **w drugiej połowie**, **w ostatniej minucie** (locative).',
    ),
    examples: [
      { pl: 'Arka prowadziła jeden do zera, ale w ostatniej minucie Lechia wyrównała.', tr: t('«Арка» вела 1:0, але на останній хвилині «Лехія» зрівняла рахунок.', '«Арка» вела 1:0, но на последней минуте «Лехия» сравняла счёт.', 'Arka were 1–0 up, but Lechia equalised in the last minute.') },
      { pl: 'Mecz zakończył się remisem, choć nasi atakowali przez całą drugą połowę.', tr: t('Матч закінчився внічию, хоча наші атакували весь другий тайм.', 'Матч закончился вничью, хотя наши атаковали весь второй тайм.', 'The match ended in a draw, though our side attacked for the whole second half.') },
    ],
    exercises: [
      dialogue('dialogue.match', BARTEK, [
        {
          npc: 'Byłeś wczoraj na meczu? Jak się skończył?',
          tr: t('Ти був учора на матчі? Як він закінчився?', 'Ты был вчера на матче? Чем он закончился?', 'Were you at the match yesterday? How did it end?'),
          choose: [
            ['Byłem! Arka wygrała z Lechią dwa do jednego.', t('Був! «Арка» виграла в «Лехії» 2:1.', 'Был! «Арка» выиграла у «Лехии» 2:1.', 'I was! Arka beat Lechia 2–1.')],
            ['Byłem! Arka wygrała nad Lechią dwa do jednego.', t('(перемогти когось — **wygrać z** + орудний; «nad» — калька)', '(победить кого-то — **wygrać z** + творительный; «nad» — калька)', '(to beat someone — **wygrać z**, not «nad»)')],
            ['Byłem! Arka wygrała z Lechii dwa do jednego.', t('(z + орудний: **z Lechią**)', '(z + творительный: **z Lechią**)', '(z + instrumental: **z Lechią**)')],
          ],
          feedback: t('**Wygrać z** + орудний; рахунок — **dwa do jednego**.', '**Wygrać z** + творительный; счёт — **dwa do jednego**.', '**Wygrać z** + instrumental.'),
        },
        {
          npc: 'Słyszałem, że długo przegrywaliście. Co się stało?',
          tr: t('Я чув, що ви довго програвали. Що сталося?', 'Я слышал, что вы долго проигрывали. Что случилось?', 'I heard you were losing for a long time. What happened?'),
          choose: [
            ['Lechia prowadziła do przerwy, ale w drugiej połowie strzeliliśmy dwa gole.', t('«Лехія» вела до перерви, але в другому таймі ми забили два голи.', '«Лехия» вела до перерыва, но во втором тайме мы забили два гола.', 'Lechia led at half-time, but we scored twice in the second half.')],
            ['Lechia prowadziła do przerwy, ale w drugiej połowie strzelaliśmy dwa gole.', t('(забили — результат, доконаний: **strzeliliśmy**)', '(забили — результат, совершенный: **strzeliliśmy**)', '(a result needs the perfective: **strzeliliśmy**)')],
            ['Lechia prowadziła do przerwy, ale w drugiej połowy strzeliliśmy dwa gole.', t('(коли — **w** + місцевий: w drugiej **połowie**)', '(когда — **w** + предложный: w drugiej **połowie**)', '(**w** + locative: **połowie**)')],
          ],
          feedback: t('Хід гри — **prowadziła**; результат — **strzeliliśmy**.', 'Ход игры — **prowadziła**; результат — **strzeliliśmy**.', 'Process — **prowadziła**; result — **strzeliliśmy**.'),
        },
      ]),
      fillGap('grammar.match', 'Mecz zakończył się ___ jeden do jednego.', ['remisem', 'remis', 'remisu', 'remisie'],
        t('Матч закінчився внічию 1:1.', 'Матч закончился вничью 1:1.', 'The match ended in a 1–1 draw.'),
        t('**Zakończyć się** + орудний: **remisem**.', '**Zakończyć się** + творительный: **remisem**.', '**Zakończyć się** + instrumental.')),
      fillGap('grammar.match', 'W ostatniej minucie Lechia ___ i było jeden do jednego.', ['wyrównała', 'wyrównywała', 'wyrówna', 'wyrównają'],
        t('На останній хвилині «Лехія» зрівняла рахунок, і стало 1:1.', 'На последней минуте «Лехия» сравняла счёт, и стало 1:1.', 'Lechia equalised in the last minute to make it 1–1.'),
        t('Одна подія в минулому — доконаний: **wyrównała**.', 'Одно событие в прошлом — совершенный: **wyrównała**.', 'A single past event — perfective **wyrównała**.')),
      fillGap('grammar.match', 'Bramkarz Arki obronił rzut karny w ___ minucie.', ['dziewięćdziesiątej', 'dziewięćdziesiąta', 'dziewięćdziesiątą', 'dziewięćdziesięciu'],
        t('Воротар «Арки» відбив пенальті на дев’яностій хвилині.', 'Вратарь «Арки» отразил пенальти на девяностой минуте.', 'Arka’s keeper saved a penalty in the ninetieth minute.'),
        t('**W** + місцевий: w **dziewięćdziesiątej** minucie.', '**W** + предложный: w **dziewięćdziesiątej** minucie.', '**W** + locative ordinal.')),
      reading('reading.match', 'Relacja: Arka Gdynia zremisowała u siebie z Lechią Gdańsk 2:2. Do przerwy goście prowadzili dwa do zera. W drugiej połowie Arka strzeliła dwa gole, a w ostatniej minucie jej bramkarz obronił rzut karny.',
        t('Хто вів у рахунку після першого тайму?', 'Кто вёл в счёте после первого тайма?', 'Who was leading at half-time?'),
        [t('гості — «Лехія»', 'гости — «Лехия»', 'the visitors, Lechia'), t('«Арка», 2:0', '«Арка», 2:0', 'Arka, 2–0'), t('була нічия', 'была ничья', 'it was level')],
        t('«Arka zremisowała **u siebie**» — отже, гості — «Лехія»; «**do przerwy goście prowadzili**».', '«Arka zremisowała **u siebie**» — значит, гости — «Лехия»; «**do przerwy goście prowadzili**».', '“Arka drew **at home**”, so the visitors were Lechia; “**do przerwy goście prowadzili**”.')),
      reverseChoice('grammar.match', t('Ми програли «Лехії» 0:3.', 'Мы проиграли «Лехии» 0:3.', 'We lost 0–3 to Lechia.'),
        ['Przegraliśmy z Lechią zero do trzech.', 'Przegraliśmy Lechii zero do trzech.', 'Przegraliśmy z Lechią zero na trzy.'],
        t('Програти комусь — **przegrać z** + орудний; рахунок — **do** + родовий.', 'Проиграть кому-то — **przegrać z** + творительный; счёт — **do** + родительный.', '**Przegrać z** + instrumental; score with **do**.')),
      findError('grammar.match', ['Do', 'przerwy', 'Arka', 'prowadziła', 'jeden', 'do', 'zero'], 6,
        t('До перерви «Арка» вела 1:0.', 'До перерыва «Арка» вела 1:0.', 'Arka led 1–0 at half-time.'),
        t('Рахунок — **do** + родовий: jeden do **zera**.', 'Счёт — **do** + родительный: jeden do **zera**.', 'Score: **do** + genitive — **zera**.')),
      build('grammar.match', 'Arka wygrała z Lechią w ostatniej minucie', t('«Арка» виграла в «Лехії» на останній хвилині', '«Арка» выиграла у «Лехии» на последней минуте', 'Arka beat Lechia in the last minute'), ['Lechię', 'nad'], ['W ostatniej minucie Arka wygrała z Lechią'],
        t('**Wygrać z** + орудний; **w** + місцевий.', '**Wygrać z** + творительный; **w** + предложный.', '**Wygrać z** + instrumental.')),
      match('vocab.match', [
        ['prowadzić jeden do zera', t('вести 1:0', 'вести 1:0', 'to lead 1–0')],
        ['wyrównać', t('зрівняти рахунок', 'сравнять счёт', 'to equalise')],
        ['rzut karny', t('пенальті', 'пенальти', 'penalty')],
        ['do przerwy', t('до перерви', 'до перерыва', 'by half-time')],
      ]),
    ],
  },
  B2: {
    explanation: t(
      'Мова спортивного коментаря:\n• **gdyby nie** + називний — якби не: **gdyby nie bramkarz**, przegralibyśmy;\n• **przesądzić o** + місцевий — вирішити: gol przesądził **o wyniku**;\n• заперечення — родовий: **nie wykorzystali rzutu karnego**, **sędzia nie uznał bramki**;\n• оцінка — **zasłużone zwycięstwo**, **o włos** (ледь-ледь), **przeważać** (мати перевагу);\n• **spalony** — офсайд, **doliczony czas** — компенсований час.',
      'Язык спортивного комментария:\n• **gdyby nie** + именительный — если бы не: **gdyby nie bramkarz**, przegralibyśmy;\n• **przesądzić o** + предложный — решить: gol przesądził **o wyniku**;\n• отрицание — родительный: **nie wykorzystali rzutu karnego**, **sędzia nie uznał bramki**;\n• оценка — **zasłużone zwycięstwo**, **o włos** (чуть-чуть), **przeważać** (иметь преимущество);\n• **spalony** — офсайд, **doliczony czas** — компенсированное время.',
      'The language of match commentary:\n• **gdyby nie** + nominative — if it weren’t for: **gdyby nie bramkarz**, przegralibyśmy;\n• **przesądzić o** + locative — to decide: gol przesądził **o wyniku**;\n• negation takes the genitive: **nie wykorzystali rzutu karnego**, **sędzia nie uznał bramki**;\n• evaluation — **zasłużone zwycięstwo**, **o włos** (by a whisker), **przeważać** (to dominate);\n• **spalony** — offside, **doliczony czas** — stoppage time.',
    ),
    examples: [
      { pl: 'Gdyby nie bramkarz, Arka przegrałaby to spotkanie wysoko.', tr: t('Якби не воротар, «Арка» програла б цей матч із великим рахунком.', 'Если бы не вратарь, «Арка» проиграла бы этот матч с крупным счётом.', 'If it weren’t for the keeper, Arka would have lost heavily.') },
      { pl: 'Gol w doliczonym czasie przesądził o wyniku meczu.', tr: t('Гол у компенсований час вирішив результат матчу.', 'Гол в компенсированное время решил исход матча.', 'A goal in stoppage time decided the match.') },
    ],
    exercises: [
      dialogue('dialogue.match', BARTEK, [
        {
          npc: 'Ale nerwy! Jak oceniasz ten mecz?',
          tr: t('Ну й нерви! Як оцінюєш цей матч?', 'Ну и нервы! Как оцениваешь этот матч?', 'What a nail-biter! How do you rate the match?'),
          choose: [
            ['Gdyby nie nasz bramkarz, przegralibyśmy wysoko.', t('Якби не наш воротар, ми програли б із великим рахунком.', 'Если бы не наш вратарь, мы проиграли бы с крупным счётом.', 'If it weren’t for our keeper, we’d have lost heavily.')],
            ['Gdyby nie naszego bramkarza, przegralibyśmy wysoko.', t('(після **gdyby nie** — називний: nasz bramkarz)', '(после **gdyby nie** — именительный: nasz bramkarz)', '(after **gdyby nie** use the nominative)')],
            ['Gdyby nie nasz bramkarz, przegraliśmy wysoko.', t('(наслідок — умовний: **przegralibyśmy**)', '(следствие — условное: **przegralibyśmy**)', '(the result is conditional: **przegralibyśmy**)')],
          ],
          feedback: t('**Gdyby nie** + називний, далі умовний спосіб.', '**Gdyby nie** + именительный, дальше условное наклонение.', '**Gdyby nie** + nominative, then the conditional.'),
        },
        {
          npc: 'A ten gol w doliczonym czasie?',
          tr: t('А той гол у компенсований час?', 'А тот гол в компенсированное время?', 'And that stoppage-time goal?'),
          choose: [
            ['To on przesądził o wyniku — zwycięstwo było w pełni zasłużone.', t('Саме він вирішив результат — перемога була цілком заслужена.', 'Именно он решил исход — победа была вполне заслуженной.', 'That decided it — the win was fully deserved.')],
            ['To on przesądził o wynik — zwycięstwo było w pełni zasłużone.', t('(**przesądzić o** + місцевий: o **wyniku**)', '(**przesądzić o** + предложный: o **wyniku**)', '(**przesądzić o** + locative: **wyniku**)')],
            ['To on przesądził wyniku — zwycięstwo było w pełni zasłużone.', t('(потрібен прийменник: przesądzić **o** wyniku)', '(нужен предлог: przesądzić **o** wyniku)', '(the preposition **o** is required)')],
          ],
          feedback: t('**Przesądzić o wyniku**.', '**Przesądzić o wyniku**.', '**Przesądzić o wyniku**.'),
        },
      ]),
      fillGap('register.sport', 'Napastnik nie wykorzystał ___ karnego w pierwszej połowie.', ['rzutu', 'rzut', 'rzutem', 'rzucie'],
        t('Нападник не реалізував пенальті в першому таймі.', 'Нападающий не реализовал пенальти в первом тайме.', 'The striker missed a penalty in the first half.'),
        t('Заперечення — родовий: nie wykorzystał **rzutu** karnego.', 'Отрицание — родительный: nie wykorzystał **rzutu** karnego.', 'Negation takes the genitive: **rzutu**.')),
      fillGap('register.sport', 'Sędzia nie uznał ___ z powodu spalonego.', ['bramki', 'bramkę', 'bramka', 'bramce'],
        t('Суддя не зарахував гол через офсайд.', 'Судья не засчитал гол из-за офсайда.', 'The referee disallowed the goal for offside.'),
        t('Заперечення — родовий: nie uznał **bramki**.', 'Отрицание — родительный: nie uznał **bramki**.', 'Negation takes the genitive: **bramki**.')),
      fillGap('register.sport', 'Arka wygrała o ___ — rywale trafili w słupek w ostatniej sekundzie.', ['włos', 'włosy', 'włosem', 'krok'],
        t('«Арка» виграла ледь-ледь — суперники влучили в стійку на останній секунді.', '«Арка» выиграла чудом — соперники попали в штангу на последней секунде.', 'Arka won by a whisker — the opponents hit the post in the final second.'),
        t('Стала фраза **o włos** — ледь-ледь, на волосину.', 'Устойчивая фраза **o włos** — чуть-чуть, на волосок.', 'Set phrase **o włos** — by a whisker.')),
      reading('reading.sport', 'Komentarz po meczu: „Gdyby nie fatalny błąd obrońcy w 70. minucie, Arka utrzymałaby prowadzenie. Rywale przeważali przez większość meczu, ale to nasza drużyna stworzyła więcej sytuacji. Wyrównujący gol padł zresztą po spalonym, którego sędzia nie zauważył”.',
        t('Чому, на думку коментатора, «Арка» не втримала перевагу?', 'Почему, по мнению комментатора, «Арка» не удержала преимущество?', 'Why, according to the commentator, did Arka not hold on to the lead?'),
        [t('через грубу помилку захисника', 'из-за грубой ошибки защитника', 'because of a terrible defensive error'), t('бо суперники створили більше моментів', 'потому что соперники создали больше моментов', 'because the opponents created more chances'), t('бо суддя скасував гол «Арки»', 'потому что судья отменил гол «Арки»', 'because the referee disallowed an Arka goal')],
        t('«**Gdyby nie fatalny błąd obrońcy**… Arka utrzymałaby prowadzenie». Більше моментів створила саме «Арка».', '«**Gdyby nie fatalny błąd obrońcy**… Arka utrzymałaby prowadzenie». Больше моментов создала как раз «Арка».', '“**Gdyby nie fatalny błąd obrońcy**…” — and it was Arka who created more chances.')),
      reverseChoice('register.sport', t('Ця перемога була цілком заслуженою.', 'Эта победа была вполне заслуженной.', 'This win was fully deserved.'),
        ['To zwycięstwo było w pełni zasłużone.', 'To zwycięstwo było w pełni zasłużonym.', 'Ta zwycięstwo była w pełni zasłużona.'],
        t('Zwycięstwo — середній рід; прикметник після «było» — називний: **zasłużone**.', 'Zwycięstwo — средний род; прилагательное после «było» — именительный: **zasłużone**.', 'Zwycięstwo is neuter; the adjective stays nominative: **zasłużone**.')),
      findError('register.sport', ['Gdyby', 'nie', 'błędu', 'obrońcy', 'wygralibyśmy'], 2,
        t('Якби не помилка захисника, ми виграли б.', 'Если бы не ошибка защитника, мы бы выиграли.', 'If it weren’t for the defender’s mistake, we’d have won.'),
        t('Після **gdyby nie** — називний: **błąd**.', 'После **gdyby nie** — именительный: **błąd**.', 'After **gdyby nie** — nominative: **błąd**.')),
      build('register.sport', 'Gdyby nie sędzia, wygralibyśmy ten mecz', t('Якби не суддя, ми виграли б цей матч', 'Если бы не судья, мы бы выиграли этот матч', 'If it weren’t for the referee, we’d have won this match'), ['sędziego', 'wygraliśmy'], ['Wygralibyśmy ten mecz, gdyby nie sędzia'],
        t('**Gdyby nie** + називний: sędzia; наслідок — **wygralibyśmy**.', '**Gdyby nie** + именительный: sędzia; следствие — **wygralibyśmy**.', '**Gdyby nie** + nominative; conditional result.')),
      match('register.sport', [
        ['zasłużone zwycięstwo', t('заслужена перемога', 'заслуженная победа', 'a deserved win')],
        ['o włos', t('ледь-ледь', 'чуть-чуть', 'by a whisker')],
        ['spalony', t('офсайд', 'офсайд', 'offside')],
        ['doliczony czas', t('компенсований час', 'компенсированное время', 'stoppage time')],
      ]),
    ],
  },
};

// ───────────────────────────── gdy-6-zeglarstwo: Під вітрилом (урок A2) ─────────────────────────────
const GDY6: LessonLevels = {
  B1: {
    explanation: t(
      'Віддієслівні іменники після прийменників — у потрібному відмінку:\n• **po** + місцевий: **po skończeniu** kursu;\n• **przed** + орудний: **przed wypłynięciem**;\n• **zamiast / do / bez** + родовий: **zamiast siedzenia** w domu, zatoka nadaje się **do żeglowania**, **bez** kamizelki;\n• **przy** + місцевий: **przy silnym wietrze**;\n• навчити когось — **nauczyć kogoś** + родовий або інфінітив: Ewa **nauczyła mnie żeglowania / żeglować**; сам — **nauczyć się**.',
      'Отглагольные существительные после предлогов — в нужном падеже:\n• **po** + предложный: **po skończeniu** kursu;\n• **przed** + творительный: **przed wypłynięciem**;\n• **zamiast / do / bez** + родительный: **zamiast siedzenia** w domu, zatoka nadaje się **do żeglowania**, **bez** kamizelki;\n• **przy** + предложный: **przy silnym wietrze**;\n• научить кого-то — **nauczyć kogoś** + родительный или инфинитив: Ewa **nauczyła mnie żeglowania / żeglować**; самому — **nauczyć się**.',
      'Verbal nouns after prepositions take the required case:\n• **po** + locative: **po skończeniu** kursu;\n• **przed** + instrumental: **przed wypłynięciem**;\n• **zamiast / do / bez** + genitive: **zamiast siedzenia** w domu, zatoka nadaje się **do żeglowania**, **bez** kamizelki;\n• **przy** + locative: **przy silnym wietrze**;\n• to teach someone — **nauczyć kogoś** + genitive or infinitive: Ewa **nauczyła mnie żeglowania / żeglować**; to learn — **nauczyć się**.',
    ),
    examples: [
      { pl: 'Po skończeniu kursu dostaniecie patent żeglarza jachtowego.', tr: t('Після закінчення курсу ви отримаєте посвідчення яхтового стерновика.', 'После окончания курса вы получите удостоверение яхтенного рулевого.', 'After the course you’ll get a yacht sailor’s licence.') },
      { pl: 'Pani Ewa nauczyła mnie żeglowania w jedno lato.', tr: t('Пані Ева навчила мене ходити під вітрилом за одне літо.', 'Пани Эва научила меня ходить под парусом за одно лето.', 'Ewa taught me to sail in a single summer.') },
    ],
    exercises: [
      dialogue('dialogue.sailing', EWA, [
        {
          npc: 'Witamy na przystani! Pływał pan już kiedyś na jachcie?',
          tr: t('Вітаємо на пристані! Ви вже колись ходили на яхті?', 'Добро пожаловать на пристань! Вы уже когда-нибудь ходили на яхте?', 'Welcome to the marina! Have you ever sailed a yacht?'),
          choose: [
            ['Nie, ale zamiast siedzenia w domu chciałbym nauczyć się żeglowania.', t('Ні, але замість сидіти вдома я хотів би навчитися ходити під вітрилом.', 'Нет, но вместо того чтобы сидеть дома, я хотел бы научиться ходить под парусом.', 'No, but instead of sitting at home I’d like to learn to sail.')],
            ['Nie, ale zamiast siedzeniem w domu chciałbym nauczyć się żeglowania.', t('(**zamiast** + родовий: zamiast **siedzenia**)', '(**zamiast** + родительный: zamiast **siedzenia**)', '(**zamiast** + genitive: **siedzenia**)')],
            ['Nie, ale zamiast siedzenia w domu chciałbym nauczyć żeglowania.', t('(навчитися самому — **nauczyć się**; «nauczyć» — навчити когось)', '(научиться самому — **nauczyć się**; «nauczyć» — научить кого-то)', '(to learn yourself — **nauczyć się**)')],
          ],
          feedback: t('**Zamiast siedzenia**; **nauczyć się żeglowania**.', '**Zamiast siedzenia**; **nauczyć się żeglowania**.', '**Zamiast siedzenia**; **nauczyć się żeglowania**.'),
        },
        {
          npc: 'Świetnie. Co trzeba zrobić przed wypłynięciem?',
          tr: t('Чудово. Що треба зробити перед виходом у море?', 'Отлично. Что нужно сделать перед выходом в море?', 'Great. What do you need to do before setting off?'),
          choose: [
            ['Przed wypłynięciem trzeba założyć kamizelkę i sprawdzić pogodę.', t('Перед виходом треба вдягнути жилет і перевірити погоду.', 'Перед выходом нужно надеть жилет и проверить погоду.', 'Before setting off you put on a life jacket and check the weather.')],
            ['Przed wypłynięcia trzeba założyć kamizelkę i sprawdzić pogodę.', t('(**przed** + орудний: przed **wypłynięciem**)', '(**przed** + творительный: przed **wypłynięciem**)', '(**przed** + instrumental: **wypłynięciem**)')],
            ['Przed wypłynięciem trzeba zakładać się kamizelkę i sprawdzić pogodę.', t('(вдягнути жилет — **założyć kamizelkę**, без «się»)', '(надеть жилет — **założyć kamizelkę**, без «się»)', '(no «się»: **założyć kamizelkę**)')],
          ],
          feedback: t('**Przed wypłynięciem** — орудний.', '**Przed wypłynięciem** — творительный.', '**Przed wypłynięciem** — instrumental.'),
        },
      ]),
      fillGap('grammar.verbal-nouns', 'Po ___ kursu dostaniesz patent żeglarza.', ['skończeniu', 'skończenie', 'skończenia', 'skończeniem'],
        t('Після закінчення курсу ти отримаєш посвідчення яхтсмена.', 'После окончания курса ты получишь удостоверение яхтсмена.', 'After finishing the course you’ll get a sailing licence.'),
        t('**Po** + місцевий: po **skończeniu**.', '**Po** + предложный: po **skończeniu**.', '**Po** + locative.')),
      fillGap('grammar.verbal-nouns', 'Ta zatoka świetnie nadaje się do ___.', ['żeglowania', 'żeglowanie', 'żeglowaniem', 'żeglować'],
        t('Ця затока чудово підходить для вітрильного спорту.', 'Этот залив отлично подходит для парусного спорта.', 'This bay is perfect for sailing.'),
        t('**Nadawać się do** + родовий: do **żeglowania**.', '**Nadawać się do** + родительный: do **żeglowania**.', '**Nadawać się do** + genitive.')),
      fillGap('grammar.verbal-nouns', 'Nigdy nie wypływaj bez ___ ratunkowej!', ['kamizelki', 'kamizelka', 'kamizelkę', 'kamizelce'],
        t('Ніколи не виходь у море без рятувального жилета!', 'Никогда не выходи в море без спасательного жилета!', 'Never set off without a life jacket!'),
        t('**Bez** + родовий: bez **kamizelki**.', '**Bez** + родительный: bez **kamizelki**.', '**Bez** + genitive.')),
      reading('reading.sailing', 'Ogłoszenie przystani: „Kurs żeglarski dla dorosłych — dwa tygodnie, codziennie od 9:00. Po ukończeniu kursu można zdawać egzamin na patent. Przy silnym wietrze zajęcia odbywają się w sali: zamiast pływania mamy wtedy naukę węzłów”.',
        t('Що відбувається на курсі в сильний вітер?', 'Что происходит на курсе при сильном ветре?', 'What happens on the course when it’s very windy?'),
        [t('заняття в залі — вчать вузли', 'занятия в зале — учат узлы', 'lessons move indoors to learn knots'), t('курс скасовують на цей день', 'курс отменяют на этот день', 'the course is cancelled for the day'), t('плавають лише з інструктором', 'плавают только с инструктором', 'you sail only with an instructor')],
        t('«**Przy silnym wietrze** zajęcia odbywają się **w sali**: zamiast pływania mamy wtedy **naukę węzłów**».', '«**Przy silnym wietrze** zajęcia odbywają się **w sali**: zamiast pływania mamy wtedy **naukę węzłów**».', '“**Przy silnym wietrze** … **w sali** … **naukę węzłów**”.')),
      reverseChoice('grammar.verbal-nouns', t('Пані Ева навчила мене керувати яхтою.', 'Пани Эва научила меня управлять яхтой.', 'Ewa taught me how to steer a yacht.'),
        ['Pani Ewa nauczyła mnie sterowania jachtem.', 'Pani Ewa nauczyła mi sterowania jachtem.', 'Pani Ewa nauczyła mnie sterowanie jachtem.'],
        t('Кого — знахідний: **mnie**; чого — родовий: **sterowania**.', 'Кого — винительный: **mnie**; чему — родительный: **sterowania**.', 'Whom — **mnie**; what — genitive **sterowania**.')),
      findError('grammar.verbal-nouns', ['Przy', 'silny', 'wietrze', 'nie', 'wypływamy'], 1,
        t('У сильний вітер ми не виходимо в море.', 'При сильном ветре мы не выходим в море.', 'We don’t go out in strong winds.'),
        t('**Przy** + місцевий: przy **silnym** wietrze.', '**Przy** + предложный: przy **silnym** wietrze.', '**Przy** + locative: **silnym**.')),
      build('grammar.verbal-nouns', 'Po skończeniu kursu zdam egzamin na patent', t('Після закінчення курсу я складу іспит на посвідчення', 'После окончания курса я сдам экзамен на удостоверение', 'After the course I’ll pass the licence exam'), ['skończenie', 'zdaję'], [],
        t('**Po** + місцевий: po **skończeniu**; результат — доконаний: **zdam**.', '**Po** + предложный: po **skończeniu**; результат — совершенный: **zdam**.', '**Po skończeniu**; perfective **zdam**.')),
      match('vocab.sailing', [
        ['przystań', t('пристань', 'пристань', 'marina')],
        ['kamizelka ratunkowa', t('рятувальний жилет', 'спасательный жилет', 'life jacket')],
        ['węzeł', t('вузол', 'узел', 'knot')],
        ['wypłynięcie', t('вихід у море', 'выход в море', 'setting sail')],
      ]),
    ],
  },
  B2: {
    explanation: t(
      'Правила безпеки й умови:\n• **w razie** + родовий — у разі: **w razie wywrotki**, w razie złej pogody;\n• **niezależnie od** + родовий — незалежно від: niezależnie od pogody;\n• умова — **pod warunkiem, że** / **o ile**: popłyniemy, **o ile** wiatr **nie przekroczy** pięciu stopni;\n• обов’язок — **należy** + інфінітив; **obowiązkowe jest noszenie** kamizelki;\n• **wyposażony w** + знахідний: jacht jest wyposażony **w radio**.',
      'Правила безопасности и условия:\n• **w razie** + родительный — в случае: **w razie wywrotki**, w razie złej pogody;\n• **niezależnie od** + родительный — независимо от: niezależnie od pogody;\n• условие — **pod warunkiem, że** / **o ile**: popłyniemy, **o ile** wiatr **nie przekroczy** pięciu stopni;\n• обязанность — **należy** + инфинитив; **obowiązkowe jest noszenie** kamizelki;\n• **wyposażony w** + винительный: jacht jest wyposażony **w radio**.',
      'Safety rules and conditions:\n• **w razie** + genitive — in the event of: **w razie wywrotki**, w razie złej pogody;\n• **niezależnie od** + genitive — regardless of: niezależnie od pogody;\n• conditions — **pod warunkiem, że** / **o ile**: popłyniemy, **o ile** wiatr **nie przekroczy** pięciu stopni;\n• duty — **należy** + infinitive; **obowiązkowe jest noszenie** kamizelki;\n• **wyposażony w** + accusative: jacht jest wyposażony **w radio**.',
    ),
    examples: [
      { pl: 'W razie wywrotki należy zostać przy łodzi i czekać na pomoc.', tr: t('У разі перекидання слід залишатися біля човна й чекати на допомогу.', 'В случае опрокидывания следует оставаться у лодки и ждать помощи.', 'If you capsize, stay with the boat and wait for help.') },
      { pl: 'Wypłyniemy jutro, pod warunkiem, że wiatr nie przekroczy pięciu stopni w skali Beauforta.', tr: t('Вийдемо завтра за умови, що вітер не перевищить п’яти балів за шкалою Бофорта.', 'Выйдем завтра при условии, что ветер не превысит пяти баллов по шкале Бофорта.', 'We’ll set sail tomorrow, provided the wind stays below force five.') },
    ],
    exercises: [
      dialogue('dialogue.sailing', EWA, [
        {
          npc: 'Pogoda się psuje. Płyniemy jutro czy nie?',
          tr: t('Погода псується. Завтра виходимо чи ні?', 'Погода портится. Завтра выходим или нет?', 'The weather’s turning. Are we sailing tomorrow or not?'),
          choose: [
            ['Płyniemy, o ile wiatr nie przekroczy pięciu stopni.', t('Виходимо, якщо вітер не перевищить п’яти балів.', 'Выходим, если ветер не превысит пяти баллов.', 'We sail, as long as the wind stays under force five.')],
            ['Płyniemy, o ile wiatr nie przekroczył pięciu stopni.', t('(умова на майбутнє — майбутній час: nie **przekroczy**)', '(условие на будущее — будущее время: nie **przekroczy**)', '(a future condition needs the future: **przekroczy**)')],
            ['Płyniemy, o ile wiatr nie przekroczy pięć stopni.', t('(після заперечення — родовий: **pięciu stopni**)', '(после отрицания — родительный: **pięciu stopni**)', '(negation takes the genitive: **pięciu stopni**)')],
          ],
          feedback: t('**O ile** + майбутній; заперечення — родовий.', '**O ile** + будущее; отрицание — родительный.', '**O ile** + future; genitive after negation.'),
        },
        {
          npc: 'A jeśli łódź się wywróci?',
          tr: t('А якщо човен перекинеться?', 'А если лодка перевернётся?', 'And if the boat capsizes?'),
          choose: [
            ['W razie wywrotki należy zostać przy łodzi i czekać na pomoc.', t('У разі перекидання слід залишатися біля човна й чекати на допомогу.', 'В случае опрокидывания нужно оставаться у лодки и ждать помощи.', 'If you capsize, stay with the boat and wait for help.')],
            ['W razie wywrotka należy zostać przy łodzi i czekać na pomoc.', t('(**w razie** + родовий: w razie **wywrotki**)', '(**w razie** + родительный: w razie **wywrotki**)', '(**w razie** + genitive: **wywrotki**)')],
            ['W razie wywrotki należy zostać przy łódź i czekać na pomoc.', t('(**przy** + місцевий: przy **łodzi**)', '(**przy** + предложный: przy **łodzi**)', '(**przy** + locative: **łodzi**)')],
          ],
          feedback: t('**W razie wywrotki** — родовий; **przy łodzi** — місцевий.', '**W razie wywrotki** — родительный; **przy łodzi** — предложный.', '**W razie wywrotki**; **przy łodzi**.'),
        },
      ]),
      fillGap('register.rules', 'Noszenie kamizelki jest obowiązkowe ___ od umiejętności pływania.', ['niezależnie', 'niezależny', 'niezależna', 'bez względu'],
        t('Носити жилет обов’язково незалежно від уміння плавати.', 'Носить жилет обязательно независимо от умения плавать.', 'Wearing a life jacket is compulsory regardless of swimming ability.'),
        t('Прислівник + **od**: **niezależnie od**. («Bez względu» — з **na**.)', 'Наречие + **od**: **niezależnie od**. («Bez względu» — с **na**.)', 'Adverb + **od**: **niezależnie od**.')),
      fillGap('register.rules', 'Jacht jest wyposażony ___ radio i tratwę ratunkową.', ['w', 'z', 'do', 'na'],
        t('Яхта обладнана радіо й рятувальним плотом.', 'Яхта оборудована радио и спасательным плотом.', 'The yacht is equipped with a radio and a life raft.'),
        t('**Wyposażony w** + знахідний: w radio i **tratwę**.', '**Wyposażony w** + винительный: w radio i **tratwę**.', '**Wyposażony w** + accusative.')),
      fillGap('register.rules', 'Przed wypłynięciem ___ sprawdzić prognozę pogody.', ['należy', 'należą', 'należny', 'należeć'],
        t('Перед виходом у море слід перевірити прогноз погоди.', 'Перед выходом в море следует проверить прогноз погоды.', 'Check the forecast before setting off.'),
        t('Безособовий обов’язок — **należy** + інфінітив.', 'Безличная обязанность — **należy** + инфинитив.', 'Impersonal duty — **należy** + infinitive.')),
      reading('reading.rules', 'Regulamin przystani: „Korzystanie z łodzi jest dozwolone wyłącznie w kamizelce, niezależnie od wieku i doświadczenia. W razie pogorszenia pogody należy niezwłocznie wrócić do portu. Osoby niepełnoletnie mogą wypływać pod warunkiem, że na pokładzie jest instruktor”.',
        t('За якої умови неповнолітні можуть виходити в море?', 'При каком условии несовершеннолетние могут выходить в море?', 'On what condition may minors go out on the water?'),
        [t('якщо на борту є інструктор', 'если на борту есть инструктор', 'if an instructor is on board'), t('якщо в них є досвід', 'если у них есть опыт', 'if they are experienced'), t('лише в добру погоду', 'только в хорошую погоду', 'only in good weather')],
        t('«Osoby niepełnoletnie mogą wypływać **pod warunkiem, że na pokładzie jest instruktor**».', '«Osoby niepełnoletnie mogą wypływać **pod warunkiem, że na pokładzie jest instruktor**».', '“**pod warunkiem, że na pokładzie jest instruktor**”.')),
      reverseChoice('register.rules', t('Незалежно від погоди ми виходимо о дев’ятій.', 'Независимо от погоды мы выходим в девять.', 'Whatever the weather, we set off at nine.'),
        ['Niezależnie od pogody wypływamy o dziewiątej.', 'Niezależnie pogody wypływamy o dziewiątej.', 'Niezależnie od pogodę wypływamy o dziewiątej.'],
        t('**Niezależnie od** + родовий: od **pogody**.', '**Niezależnie od** + родительный: od **pogody**.', '**Niezależnie od** + genitive.')),
      findError('register.rules', ['Każdy', 'jacht', 'jest', 'wyposażony', 'na', 'radio'], 4,
        t('Кожна яхта обладнана радіо.', 'Каждая яхта оборудована радио.', 'Every yacht is equipped with a radio.'),
        t('**Wyposażony w** + знахідний: **w** radio.', '**Wyposażony w** + винительный: **w** radio.', '**Wyposażony w** + accusative.')),
      build('register.rules', 'W razie burzy należy natychmiast wrócić do portu', t('У разі грози слід негайно повернутися до порту', 'В случае грозы следует немедленно вернуться в порт', 'In a storm, return to port immediately'), ['burza', 'należą'], [],
        t('**W razie** + родовий: **burzy**; **należy** + інфінітив.', '**W razie** + родительный: **burzy**; **należy** + инфинитив.', '**W razie** + genitive; **należy** + infinitive.')),
      match('register.rules', [
        ['w razie wywrotki', t('у разі перекидання', 'в случае опрокидывания', 'in the event of capsizing')],
        ['o ile', t('якщо, за умови що', 'если, при условии что', 'as long as')],
        ['wyposażony w', t('обладнаний', 'оборудованный', 'equipped with')],
        ['niezwłocznie', t('негайно', 'незамедлительно', 'without delay')],
      ]),
    ],
  },
};

// ───────────────────────────── gdy-7-kontuzja: Болить коліно (урок A2) ─────────────────────────────
const GDY7: LessonLevels = {
  B1: {
    explanation: t(
      'Історія травми в лікаря:\n• як сталося — доконаний минулий: **poślizgnąłem się**, **upadłem**, **uderzyłem się w** kolano (w + знахідний — частина тіла);\n• що зараз — давальний «mi»: **spuchła mi** kostka, **zrobiło mi się** słabo;\n• з якого часу — **boli mnie od** wczoraj / **od** trzech dni;\n• у лікаря — **zrobić prześwietlenie**, **założyć gips**, **przepisać** maść.',
      'История травмы у врача:\n• как случилось — совершенный прошедший: **poślizgnąłem się**, **upadłem**, **uderzyłem się w** kolano (w + винительный — часть тела);\n• что сейчас — дательный «mi»: **spuchła mi** kostka, **zrobiło mi się** słabo;\n• с какого времени — **boli mnie od** wczoraj / **od** trzech dni;\n• у врача — **zrobić prześwietlenie**, **założyć gips**, **przepisać** maść.',
      'Telling a doctor about an injury:\n• what happened — perfective past: **poślizgnąłem się**, **upadłem**, **uderzyłem się w** kolano (w + accusative for the body part);\n• how it is now — dative «mi»: **spuchła mi** kostka, **zrobiło mi się** słabo;\n• since when — **boli mnie od** wczoraj / **od** trzech dni;\n• at the doctor’s — **zrobić prześwietlenie**, **założyć gips**, **przepisać** maść.',
    ),
    examples: [
      { pl: 'Poślizgnąłem się na schodach i uderzyłem się w kolano.', tr: t('Я посковзнувся на сходах і вдарився коліном.', 'Я поскользнулся на лестнице и ударился коленом.', 'I slipped on the stairs and banged my knee.') },
      { pl: 'Spuchła mi kostka i boli mnie od wczoraj.', tr: t('У мене опухла кісточка, і болить із учорашнього дня.', 'У меня распухла лодыжка, и болит со вчерашнего дня.', 'My ankle has swollen up and it’s been hurting since yesterday.') },
    ],
    exercises: [
      dialogue('dialogue.doctor', LEKARKA, [
        {
          npc: 'Co się stało?',
          tr: t('Що сталося?', 'Что случилось?', 'What happened?'),
          choose: [
            ['Poślizgnąłem się na boisku i uderzyłem się w kolano.', t('Я посковзнувся на полі й ударився коліном.', 'Я поскользнулся на поле и ударился коленом.', 'I slipped on the pitch and banged my knee.')],
            ['Poślizgnąłem się na boisku i uderzyłem się o kolano.', t('(частина тіла — **w** + знахідний; «o» — об що: o słupek)', '(часть тела — **w** + винительный; «o» — обо что: o słupek)', '(body part — **w**; «o» is what you hit against)')],
            ['Poślizgnąłem się na boisku i uderzyłem się w kolanie.', t('(**w** + знахідний: w **kolano**)', '(**w** + винительный: w **kolano**)', '(**w** + accusative: **kolano**)')],
          ],
          feedback: t('**Uderzyłem się w kolano**.', '**Uderzyłem się w kolano**.', '**Uderzyłem się w kolano**.'),
        },
        {
          npc: 'Od kiedy boli? Coś jeszcze pan zauważył?',
          tr: t('Відколи болить? Ви ще щось помітили?', 'С каких пор болит? Вы ещё что-то заметили?', 'How long has it hurt? Anything else?'),
          choose: [
            ['Boli mnie od wczoraj i spuchła mi kostka.', t('Болить із учора, і в мене опухла кісточка.', 'Болит со вчера, и у меня распухла лодыжка.', 'Since yesterday, and my ankle is swollen.')],
            ['Boli mnie od wczoraj i spuchła mnie kostka.', t('(у кого опухла — давальний: **mi**)', '(у кого распухла — дательный: **mi**)', '(dative: **mi**)')],
            ['Boli mi od wczoraj i spuchła mi kostka.', t('(болить — **boli mnie**, знахідний)', '(болит — **boli mnie**, винительный)', '(**boli mnie** — accusative)')],
          ],
          feedback: t('**Boli mnie**, але **spuchła mi**.', '**Boli mnie**, но **spuchła mi**.', '**Boli mnie**, but **spuchła mi**.'),
        },
      ]),
      fillGap('vocab.injury', 'Trzeba zrobić ___, żeby sprawdzić, czy kość nie jest złamana.', ['prześwietlenie', 'przeziębienie', 'przepisanie', 'przejście'],
        t('Треба зробити рентген, щоб перевірити, чи кістка не зламана.', 'Нужно сделать рентген, чтобы проверить, не сломана ли кость.', 'An X-ray is needed to check whether the bone is broken.'),
        t('Рентген — **prześwietlenie**; przeziębienie — застуда.', 'Рентген — **prześwietlenie**; przeziębienie — простуда.', 'An X-ray is **prześwietlenie**; przeziębienie is a cold.')),
      fillGap('vocab.injury', 'Wczoraj na treningu ___ mi się słabo.', ['zrobiło', 'zrobił', 'zrobiła', 'zrobili'],
        t('Учора на тренуванні мені стало погано.', 'Вчера на тренировке мне стало плохо.', 'I felt faint at training yesterday.'),
        t('Безособово — середній рід: **zrobiło mi się** słabo.', 'Безлично — средний род: **zrobiło mi się** słabo.', 'Impersonal — neuter: **zrobiło mi się**.')),
      fillGap('vocab.injury', 'Pani doktor ___ mi maść i tabletki przeciwbólowe.', ['przepisała', 'opisała', 'wpisała', 'podpisała'],
        t('Пані лікарка виписала мені мазь і знеболювальні таблетки.', 'Врач выписала мне мазь и обезболивающие таблетки.', 'The doctor prescribed me an ointment and painkillers.'),
        t('Виписати ліки — **przepisać**.', 'Выписать лекарство — **przepisać**.', 'To prescribe — **przepisać**.')),
      reading('reading.injury', 'Karta informacyjna: „Pacjent zgłosił się z bólem prawej kostki po upadku na boisku. Kostka spuchnięta. Wykonano prześwietlenie — kość nie jest złamana. Zalecenia: odpoczynek, zimne okłady, przez dwa tygodnie bez treningów”.',
        t('Що показав рентген?', 'Что показал рентген?', 'What did the X-ray show?'),
        [t('кістка не зламана', 'кость не сломана', 'the bone isn’t broken'), t('перелом правої кісточки', 'перелом правой лодыжки', 'a broken right ankle'), t('що потрібен гіпс на два тижні', 'что нужен гипс на две недели', 'that a cast is needed for two weeks')],
        t('«Wykonano prześwietlenie — **kość nie jest złamana**». Два тижні — це перерва в тренуваннях, а не гіпс.', '«Wykonano prześwietlenie — **kość nie jest złamana**». Две недели — это перерыв в тренировках, а не гипс.', '“**kość nie jest złamana**”; the two weeks are a break from training, not a cast.')),
      reverseChoice('vocab.injury', t('Я підвернув кісточку, коли біг на автобус.', 'Я подвернул лодыжку, когда бежал на автобус.', 'I sprained my ankle running for the bus.'),
        ['Skręciłem kostkę, kiedy biegłem na autobus.', 'Skręcałem kostkę, kiedy biegłem na autobus.', 'Skręciłem się kostkę, kiedy biegłem na autobus.'],
        t('Одна подія — доконаний **skręciłem**, без «się»; тло — **biegłem**.', 'Одно событие — совершенный **skręciłem**, без «się»; фон — **biegłem**.', 'One event — perfective **skręciłem**; background — **biegłem**.')),
      findError('vocab.injury', ['Złamałem', 'rękę', 'i', 'mam', 'gips', 'na', 'miesiąca'], 6,
        t('Я зламав руку, і в мене гіпс на місяць.', 'Я сломал руку, и у меня гипс на месяц.', 'I broke my arm and I’m in a cast for a month.'),
        t('На який термін — **na** + знахідний: na **miesiąc**.', 'На какой срок — **na** + винительный: na **miesiąc**.', 'Duration — **na** + accusative.')),
      build('vocab.injury', 'Po meczu spuchła mi kostka', t('Після матчу в мене опухла кісточка', 'После матча у меня распухла лодыжка', 'My ankle swelled up after the match'), ['mnie', 'spuchłem'], ['Spuchła mi kostka po meczu'],
        t('У кого — давальний: **mi**; підмет — **kostka**.', 'У кого — дательный: **mi**; подлежащее — **kostka**.', 'Dative **mi**; the subject is **kostka**.')),
      match('vocab.injury', [
        ['prześwietlenie', t('рентген', 'рентген', 'X-ray')],
        ['spuchnąć', t('опухнути', 'распухнуть', 'to swell up')],
        ['poślizgnąć się', t('посковзнутися', 'поскользнуться', 'to slip')],
        ['maść', t('мазь', 'мазь', 'ointment')],
      ]),
    ],
  },
  B2: {
    explanation: t(
      'Медичні формули й рекомендації:\n• **zalecić komuś** + знахідний / інфінітив: lekarz **zalecił mi odpoczynek**; безособово — **zalecono mi**;\n• **unikać** + родовий: unikać **wysiłku**, **biegania**;\n• **przeciwwskazania do** + родовий: do **wysiłku fizycznego**;\n• направлення — **skierowanie do** лікаря (do ortopedy), **na** процедуру (na rehabilitację);\n• **zwolnienie lekarskie** — лікарняний; **wrócić do pełnej sprawności** — повністю відновитися.',
      'Медицинские формулы и рекомендации:\n• **zalecić komuś** + винительный / инфинитив: lekarz **zalecił mi odpoczynek**; безлично — **zalecono mi**;\n• **unikać** + родительный: unikać **wysiłku**, **biegania**;\n• **przeciwwskazania do** + родительный: do **wysiłku fizycznego**;\n• направление — **skierowanie do** врача (do ortopedy), **na** процедуру (na rehabilitację);\n• **zwolnienie lekarskie** — больничный; **wrócić do pełnej sprawności** — полностью восстановиться.',
      'Medical formulas and advice:\n• **zalecić komuś** + accusative / infinitive: lekarz **zalecił mi odpoczynek**; impersonal — **zalecono mi**;\n• **unikać** + genitive: unikać **wysiłku**, **biegania**;\n• **przeciwwskazania do** + genitive: do **wysiłku fizycznego**;\n• referrals — **skierowanie do** a doctor (do ortopedy), **na** a treatment (na rehabilitację);\n• **zwolnienie lekarskie** — sick leave; **wrócić do pełnej sprawności** — to recover fully.',
    ),
    examples: [
      { pl: 'Lekarz zalecił mi oszczędzanie nogi i skierował mnie na rehabilitację.', tr: t('Лікар порадив мені берегти ногу й направив на реабілітацію.', 'Врач посоветовал мне беречь ногу и направил на реабилитацию.', 'The doctor told me to rest my leg and referred me for physio.') },
      { pl: 'Do pełnej sprawności wrócę najwcześniej za sześć tygodni.', tr: t('Повністю відновлюся щонайменше за шість тижнів.', 'Полностью восстановлюсь не раньше чем через шесть недель.', 'I’ll be fully fit in six weeks at the earliest.') },
    ],
    exercises: [
      dialogue('dialogue.doctor', LEKARKA, [
        {
          npc: 'Uraz jest poważniejszy, niż myślałam. Ma pan jakieś pytania?',
          tr: t('Травма серйозніша, ніж я думала. Маєте якісь запитання?', 'Травма серьёзнее, чем я думала. Есть вопросы?', 'The injury is worse than I thought. Any questions?'),
          choose: [
            ['Czy są przeciwwskazania do jazdy na rowerze?', t('Чи є протипоказання до їзди на велосипеді?', 'Есть ли противопоказания к езде на велосипеде?', 'Is cycling off-limits?')],
            ['Czy są przeciwwskazania na jazdę na rowerze?', t('(**przeciwwskazania do** + родовий)', '(**przeciwwskazania do** + родительный)', '(**przeciwwskazania do** + genitive)')],
            ['Czy są przeciwwskazania do jazda na rowerze?', t('(**do** + родовий: do **jazdy**)', '(**do** + родительный: do **jazdy**)', '(**do** + genitive: **jazdy**)')],
          ],
          feedback: t('**Przeciwwskazania do jazdy**.', '**Przeciwwskazania do jazdy**.', '**Przeciwwskazania do jazdy**.'),
        },
        {
          npc: 'Przez miesiąc proszę unikać wysiłku. Wystawię panu zwolnienie.',
          tr: t('Місяць прошу уникати навантажень. Я випишу вам лікарняний.', 'Месяц, пожалуйста, избегайте нагрузок. Я выпишу вам больничный.', 'Please avoid exertion for a month. I’ll give you a sick note.'),
          choose: [
            ['Dziękuję. Czy dostanę też skierowanie do ortopedy?', t('Дякую. А направлення до ортопеда я теж отримаю?', 'Спасибо. А направление к ортопеду я тоже получу?', 'Thank you. Will I also get a referral to an orthopaedist?')],
            ['Dziękuję. Czy dostanę też skierowanie na ortopedę?', t('(до лікаря — **do** + родовий; «na» — на процедуру)', '(к врачу — **do** + родительный; «na» — на процедуру)', '(to a doctor — **do**; «na» is for treatments)')],
            ['Dziękuję. Czy dostanę też skierowanie do ortopedą?', t('(**do** + родовий: do **ortopedy**)', '(**do** + родительный: do **ortopedy**)', '(**do** + genitive: **ortopedy**)')],
          ],
          feedback: t('**Skierowanie do ortopedy**.', '**Skierowanie do ortopedy**.', '**Skierowanie do ortopedy**.'),
        },
      ]),
      fillGap('register.medical', 'Przez dwa tygodnie należy unikać ___ fizycznego.', ['wysiłku', 'wysiłek', 'wysiłkiem', 'wysiłkowi'],
        t('Два тижні слід уникати фізичних навантажень.', 'Две недели следует избегать физических нагрузок.', 'Avoid physical exertion for two weeks.'),
        t('**Unikać** + родовий: **wysiłku**.', '**Unikać** + родительный: **wysiłku**.', '**Unikać** + genitive.')),
      fillGap('register.medical', 'Lekarz ___ mi odpoczynek i zimne okłady.', ['zalecił', 'zalecił się', 'polecił się', 'zalecono'],
        t('Лікар порадив мені відпочинок і холодні компреси.', 'Врач рекомендовал мне отдых и холодные компрессы.', 'The doctor recommended rest and cold compresses.'),
        t('З підметом «lekarz» — **zalecił**; «zalecono» — без підмета.', 'С подлежащим «lekarz» — **zalecił**; «zalecono» — без подлежащего.', 'With the subject «lekarz» — **zalecił**; «zalecono» has no subject.')),
      fillGap('register.medical', 'Dostałem zwolnienie lekarskie ___ tydzień.', ['na', 'za', 'do', 'od'],
        t('Я отримав лікарняний на тиждень.', 'Я получил больничный на неделю.', 'I got a week’s sick leave.'),
        t('На який термін — **na** + знахідний: **na tydzień**.', 'На какой срок — **na** + винительный: **na tydzień**.', 'Duration — **na** + accusative.')),
      reading('reading.medical', 'Zalecenia po urazie kolana: „Przez cztery tygodnie należy unikać biegania i skoków. Jazda na rowerze stacjonarnym jest dozwolona od trzeciego tygodnia. Przeciwwskazaniem do powrotu do treningów jest utrzymujący się obrzęk. Kontrola u ortopedy za miesiąc”.',
        t('Коли можна їздити на велотренажері?', 'Когда можно ездить на велотренажёре?', 'When is the exercise bike allowed?'),
        [t('з третього тижня', 'с третьей недели', 'from the third week'), t('лише через чотири тижні', 'только через четыре недели', 'only after four weeks'), t('після контролю в ортопеда', 'после осмотра у ортопеда', 'after the orthopaedic check-up')],
        t('«Jazda na rowerze stacjonarnym jest dozwolona **od trzeciego tygodnia**».', '«Jazda na rowerze stacjonarnym jest dozwolona **od trzeciego tygodnia**».', '“**od trzeciego tygodnia**” — from the third week.')),
      reverseChoice('register.medical', t('Мені порадили уникати бігу.', 'Мне посоветовали избегать бега.', 'I was advised to avoid running.'),
        ['Zalecono mi unikanie biegania.', 'Zalecono mnie unikanie biegania.', 'Zaleciło mi unikanie biegania.'],
        t('Безособово — **zalecono**; кому — давальний: **mi**.', 'Безлично — **zalecono**; кому — дательный: **mi**.', 'Impersonal **zalecono**; dative **mi**.')),
      findError('register.medical', ['Lekarz', 'skierował', 'mnie', 'do', 'rehabilitację'], 3,
        t('Лікар направив мене на реабілітацію.', 'Врач направил меня на реабилитацию.', 'The doctor referred me for physiotherapy.'),
        t('На процедуру — **na** + знахідний: **na** rehabilitację; «do» — до лікаря.', 'На процедуру — **na** + винительный: **na** rehabilitację; «do» — к врачу.', 'For a treatment — **na**; «do» is for a doctor.')),
      build('register.medical', 'Wrócę do pełnej sprawności za sześć tygodni', t('Я повністю відновлюся за шість тижнів', 'Я полностью восстановлюсь через шесть недель', 'I’ll be fully fit in six weeks'), ['pełną', 'przez'], ['Za sześć tygodni wrócę do pełnej sprawności'],
        t('**Wrócić do** + родовий: do **pełnej sprawności**; коли — **za** sześć tygodni.', '**Wrócić do** + родительный: do **pełnej sprawności**; когда — **za** sześć tygodni.', '**Wrócić do** + genitive; **za** = in.')),
      match('register.medical', [
        ['zwolnienie lekarskie', t('лікарняний', 'больничный', 'sick leave')],
        ['skierowanie', t('направлення', 'направление', 'referral')],
        ['przeciwwskazanie', t('протипоказання', 'противопоказание', 'contraindication')],
        ['obrzęk', t('набряк', 'отёк', 'swelling')],
      ]),
    ],
  },
};

// ───────────────────────────── gdy-8-hobby: Хобі й вільний час (урок A2) ─────────────────────────────
const GDY8: LessonLevels = {
  B1: {
    explanation: t(
      'Уподобання й пропозиції:\n• що краще — **wolę** + знахідний / інфінітив **niż** (та сама форма) або **od** + родовий: wolę jazz **od rocka**, wolę czytać **niż** oglądać;\n• захоплення — **mam bzika na punkcie** + родовий: fotografii; **pasjonuje mnie** + називний: fotografia;\n• запросити — **Masz ochotę na** + знахідний? **Co powiesz na** + знахідний? **Może poszlibyśmy**…?\n• відповісти — **chętnie** / **niestety nie dam rady**.',
      'Предпочтения и предложения:\n• что лучше — **wolę** + винительный / инфинитив **niż** (та же форма) или **od** + родительный: wolę jazz **od rocka**, wolę czytać **niż** oglądać;\n• увлечение — **mam bzika na punkcie** + родительный: fotografii; **pasjonuje mnie** + именительный: fotografia;\n• пригласить — **Masz ochotę na** + винительный? **Co powiesz na** + винительный? **Może poszlibyśmy**…?\n• ответить — **chętnie** / **niestety nie dam rady**.',
      'Preferences and invitations:\n• preferring — **wolę** + accusative / infinitive **niż** (same form) or **od** + genitive: wolę jazz **od rocka**, wolę czytać **niż** oglądać;\n• passions — **mam bzika na punkcie** + genitive: fotografii; **pasjonuje mnie** + nominative: fotografia;\n• inviting — **Masz ochotę na** + accusative? **Co powiesz na** + accusative? **Może poszlibyśmy**…?\n• answering — **chętnie** / **niestety nie dam rady**.',
    ),
    examples: [
      { pl: 'Wolę grać w planszówki niż siedzieć przed telewizorem.', tr: t('Я більше люблю грати в настільні ігри, ніж сидіти перед телевізором.', 'Я больше люблю играть в настольные игры, чем сидеть перед телевизором.', 'I’d rather play board games than sit in front of the TV.') },
      { pl: 'Mam bzika na punkcie starych aparatów fotograficznych.', tr: t('Я схиблений на старих фотоапаратах.', 'Я помешан на старых фотоаппаратах.', 'I’m crazy about old cameras.') },
    ],
    exercises: [
      dialogue('dialogue.hobby', MICHAL, [
        {
          npc: 'Masz ochotę na kino w piątek?',
          tr: t('Маєш бажання піти в кіно в п’ятницю?', 'Хочешь в кино в пятницу?', 'Fancy the cinema on Friday?'),
          choose: [
            ['Szczerze? Wolę spacer nad morzem niż kino.', t('Чесно? Я більше хочу прогулятися біля моря, ніж у кіно.', 'Честно? Мне больше хочется погулять у моря, чем в кино.', 'Honestly? I’d rather walk by the sea than go to the cinema.')],
            ['Szczerze? Wolę spaceru nad morzem niż kino.', t('(**wolę** + знахідний: wolę **spacer**)', '(**wolę** + винительный: wolę **spacer**)', '(**wolę** + accusative: **spacer**)')],
            ['Szczerze? Wolę spacer nad morzem od kino.', t('(**od** + родовий: od **kina**; або «niż kino»)', '(**od** + родительный: od **kina**; или «niż kino»)', '(**od** + genitive: **kina**, or «niż kino»)')],
          ],
          feedback: t('**Wolę spacer niż kino** = **wolę spacer od kina**.', '**Wolę spacer niż kino** = **wolę spacer od kina**.', '**Wolę spacer niż kino** = **od kina**.'),
        },
        {
          npc: 'A czym się teraz interesujesz? Ciągle robisz zdjęcia.',
          tr: t('А чим ти зараз захоплюєшся? Весь час фотографуєш.', 'А чем ты сейчас увлекаешься? Всё время фотографируешь.', 'So what are you into now? You’re always taking photos.'),
          choose: [
            ['Mam bzika na punkcie fotografii — co weekend jeżdżę z aparatem nad morze.', t('Я схиблений на фотографії — щовихідних їжджу з фотоапаратом до моря.', 'Я помешан на фотографии — каждые выходные езжу с фотоаппаратом к морю.', 'I’m crazy about photography — every weekend I take my camera to the sea.')],
            ['Mam bzika na punkt fotografii — co weekend jeżdżę z aparatem nad morze.', t('(стала фраза — місцевий: **na punkcie**)', '(устойчивая фраза — предложный: **na punkcie**)', '(set phrase: **na punkcie**)')],
            ['Mam bzika na punkcie fotografią — co weekend jeżdżę z aparatem nad morze.', t('(**na punkcie** + родовий: **fotografii**)', '(**na punkcie** + родительный: **fotografii**)', '(**na punkcie** + genitive: **fotografii**)')],
          ],
          feedback: t('**Mam bzika na punkcie** + родовий.', '**Mam bzika na punkcie** + родительный.', '**Mam bzika na punkcie** + genitive.'),
        },
      ]),
      fillGap('grammar.preferences', 'Co powiesz ___ wspólny wypad na rowery w sobotę?', ['na', 'o', 'za', 'do'],
        t('Що скажеш про спільну велопрогулянку в суботу?', 'Что скажешь насчёт совместной велопрогулки в субботу?', 'How about a bike trip together on Saturday?'),
        t('Пропозиція — **Co powiesz na** + знахідний.', 'Предложение — **Co powiesz na** + винительный.', 'Suggestion — **Co powiesz na** + accusative.')),
      fillGap('grammar.preferences', 'Od dwóch lat pasjonuje mnie ___.', ['fotografia', 'fotografią', 'fotografii', 'fotografię'],
        t('Уже два роки мене захоплює фотографія.', 'Уже два года меня увлекает фотография.', 'Photography has fascinated me for two years.'),
        t('Тут фотографія — підмет: **pasjonuje mnie fotografia** (називний).', 'Здесь фотография — подлежащее: **pasjonuje mnie fotografia** (именительный).', 'Here photography is the subject — nominative.')),
      fillGap('grammar.preferences', 'Zdecydowanie wolę jazz ___ rocka.', ['od', 'niż', 'z', 'nad'],
        t('Я однозначно більше люблю джаз, ніж рок.', 'Я определённо больше люблю джаз, чем рок.', 'I definitely prefer jazz to rock.'),
        t('Після пропуску — родовий **rocka**: підходить лише **od**. (Niż — та сама форма: niż rock.)', 'После пропуска — родительный **rocka**: подходит только **od**. (Niż — та же форма: niż rock.)', 'The genitive **rocka** needs **od** (with niż it would be «niż rock»).')),
      reading('reading.hobby', 'Wpis na forum: „Kiedyś grałem w gry komputerowe po kilka godzin dziennie. Dziś wolę planszówki — mam ich ponad sto i mam bzika na punkcie gier strategicznych. W każdy czwartek spotykamy się w kawiarni przy bulwarze. Co powiecie na wspólną grę w ten czwartek?”',
        t('Що автор пропонує читачам форуму?', 'Что автор предлагает читателям форума?', 'What does the author suggest to forum readers?'),
        [t('зіграти разом у четвер у кав’ярні', 'сыграть вместе в четверг в кафе', 'playing together on Thursday at the café'), t('купити в нього настільні ігри', 'купить у него настольные игры', 'buying his board games'), t('пограти онлайн у комп’ютерну гру', 'поиграть онлайн в компьютерную игру', 'playing a computer game online')],
        t('«**Co powiecie na wspólną grę w ten czwartek?**» — у кав’ярні біля бульвару.', '«**Co powiecie na wspólną grę w ten czwartek?**» — в кафе у бульвара.', '“**Co powiecie na wspólną grę w ten czwartek?**”')),
      reverseChoice('grammar.preferences', t('Може, підемо разом на концерт?', 'Может, сходим вместе на концерт?', 'Shall we go to a concert together?'),
        ['Może poszlibyśmy razem na koncert?', 'Może poszlibyście razem na koncert?', 'Może poszlibyśmy razem do koncertu?'],
        t('«Ми» — **poszlibyśmy** (poszlibyście — «ви»); куди — **na koncert**.', '«Мы» — **poszlibyśmy** (poszlibyście — «вы»); куда — **na koncert**.', '“We” — **poszlibyśmy**; **na koncert**.')),
      findError('grammar.preferences', ['Od', 'dawna', 'interesuję', 'się', 'historię'], 4,
        t('Я давно цікавлюся історією.', 'Я давно интересуюсь историей.', 'I’ve long been interested in history.'),
        t('**Interesować się** + орудний: **historią**.', '**Interesować się** + творительный: **historią**.', '**Interesować się** + instrumental.')),
      build('grammar.preferences', 'Wolę czytać książki niż oglądać seriale', t('Я більше люблю читати книжки, ніж дивитися серіали', 'Я больше люблю читать книги, чем смотреть сериалы', 'I’d rather read books than watch TV series'), ['od', 'czytanie'], [],
        t('Дві дії — **wolę** + інфінітив **niż** + інфінітив.', 'Два действия — **wolę** + инфинитив **niż** + инфинитив.', 'Two actions — **wolę** + infinitive **niż** + infinitive.')),
      match('grammar.preferences', [
        ['mieć bzika na punkcie', t('бути схибленим на', 'быть помешанным на', 'to be crazy about')],
        ['mieć ochotę na', t('мати бажання', 'хотеть', 'to fancy')],
        ['co powiesz na', t('що скажеш про', 'что скажешь насчёт', 'how about')],
        ['planszówka', t('настільна гра', 'настольная игра', 'board game')],
      ]),
    ],
  },
  B2: {
    explanation: t(
      'Есе про хобі:\n• **odskocznia od** + родовий — віддушина від: odskocznia **od codzienności**;\n• **pozwala mi oderwać się od** + родовий — дає змогу відірватися від;\n• **czerpać przyjemność / satysfakcję z** + родовий;\n• **poświęcać** + знахідний + давальний: poświęcam weekendy **żeglarstwu**;\n• контраст — **o ile** kiedyś…, **o tyle** teraz… (якщо раніше…, то тепер…).',
      'Эссе о хобби:\n• **odskocznia od** + родительный — отдушина от: odskocznia **od codzienności**;\n• **pozwala mi oderwać się od** + родительный — позволяет оторваться от;\n• **czerpać przyjemność / satysfakcję z** + родительный;\n• **poświęcać** + винительный + дательный: poświęcam weekendy **żeglarstwu**;\n• контраст — **o ile** kiedyś…, **o tyle** teraz… (если раньше…, то теперь…).',
      'Writing about a hobby:\n• **odskocznia od** + genitive — an escape from: odskocznia **od codzienności**;\n• **pozwala mi oderwać się od** + genitive — lets me get away from;\n• **czerpać przyjemność / satysfakcję z** + genitive — to take pleasure in;\n• **poświęcać** + accusative + dative: poświęcam weekendy **żeglarstwu**;\n• contrast — **o ile** kiedyś…, **o tyle** teraz… (whereas before…, now…).',
    ),
    examples: [
      { pl: 'Żeglarstwo jest dla mnie odskocznią od codziennych obowiązków.', tr: t('Вітрильний спорт для мене — віддушина від щоденних обов’язків.', 'Парусный спорт для меня — отдушина от повседневных обязанностей.', 'Sailing is my escape from everyday duties.') },
      { pl: 'O ile kiedyś grałem dla wyników, o tyle teraz czerpię z gry czystą przyjemność.', tr: t('Якщо раніше я грав заради результатів, то тепер отримую від гри чисте задоволення.', 'Если раньше я играл ради результатов, то теперь получаю от игры чистое удовольствие.', 'Whereas I used to play for results, now I play purely for the pleasure of it.') },
    ],
    exercises: [
      dialogue('dialogue.hobby', MICHAL, [
        {
          npc: 'Piszę tekst do gazetki klubowej. Czym jest dla ciebie hobby?',
          tr: t('Я пишу текст для клубної газетки. Чим для тебе є хобі?', 'Я пишу текст для клубной газеты. Что для тебя хобби?', 'I’m writing a piece for the club newsletter. What does a hobby mean to you?'),
          choose: [
            ['Przede wszystkim odskocznią od pracy — pozwala mi oderwać się od ekranu.', t('Передусім віддушиною від роботи — дає змогу відірватися від екрана.', 'Прежде всего отдушиной от работы — позволяет оторваться от экрана.', 'Above all an escape from work — it gets me away from the screen.')],
            ['Przede wszystkim odskocznią od pracy — pozwala mi oderwać się z ekranu.', t('(**oderwać się od** + родовий)', '(**oderwać się od** + родительный)', '(**oderwać się od** + genitive)')],
            ['Przede wszystkim odskocznią do pracy — pozwala mi oderwać się od ekranu.', t('(віддушина **від** чогось — **odskocznia od**)', '(отдушина **от** чего-то — **odskocznia od**)', '(an escape **from** — **odskocznia od**)')],
          ],
          feedback: t('**Odskocznia od** і **oderwać się od** — обидва з «od».', '**Odskocznia od** и **oderwać się od** — оба с «od».', 'Both take «od».'),
        },
        {
          npc: 'A ile czasu mu poświęcasz?',
          tr: t('А скільки часу ти йому присвячуєш?', 'А сколько времени ты ему уделяешь?', 'And how much time do you give it?'),
          choose: [
            ['Poświęcam mu prawie każdy weekend i czerpię z tego ogromną satysfakcję.', t('Присвячую йому майже кожні вихідні й отримую від цього величезне задоволення.', 'Уделяю ему почти все выходные и получаю от этого огромное удовлетворение.', 'Nearly every weekend, and I get huge satisfaction from it.')],
            ['Poświęcam go prawie każdy weekend i czerpię z tego ogromną satysfakcję.', t('(чому присвячую — давальний: **mu**)', '(чему уделяю — дательный: **mu**)', '(to what — dative **mu**)')],
            ['Poświęcam mu prawie każdy weekend i czerpię od tego ogromną satysfakcję.', t('(**czerpać z** + родовий: **z tego**)', '(**czerpać z** + родительный: **z tego**)', '(**czerpać z** + genitive)')],
          ],
          feedback: t('**Poświęcać czemuś** czas; **czerpać z** czegoś.', '**Poświęcać czemuś** время; **czerpać z** чего-то.', '**Poświęcać** + dative; **czerpać z**.'),
        },
      ]),
      fillGap('register.essay', 'Wspinaczka to dla mnie świetna ___ od stresu w pracy.', ['odskocznia', 'odpowiedź', 'odległość', 'odwaga'],
        t('Скелелазіння для мене — чудова віддушина від стресу на роботі.', 'Скалолазание для меня — отличная отдушина от стресса на работе.', 'Climbing is a great escape from stress at work for me.'),
        t('Віддушина — **odskocznia od** + родовий.', 'Отдушина — **odskocznia od** + родительный.', 'An escape — **odskocznia od**.')),
      fillGap('register.essay', 'Od lat poświęcam wolne wieczory ___.', ['malarstwu', 'malarstwo', 'malarstwem', 'malarstwa'],
        t('Уже багато років я присвячую вільні вечори живопису.', 'Уже много лет я посвящаю свободные вечера живописи.', 'For years I’ve devoted my free evenings to painting.'),
        t('Чому — давальний: **malarstwu**.', 'Чему — дательный: **malarstwu**.', 'To what — dative **malarstwu**.')),
      fillGap('register.essay', 'O ile w dzieciństwie nie znosiłem czytania, o ___ dziś nie wyobrażam sobie dnia bez książki.', ['tyle', 'ile', 'tak', 'tym'],
        t('Якщо в дитинстві я терпіти не міг читання, то сьогодні не уявляю дня без книжки.', 'Если в детстве я терпеть не мог читать, то сегодня не представляю дня без книги.', 'Whereas as a child I couldn’t stand reading, today I can’t imagine a day without a book.'),
        t('Пара контрасту — **o ile…, o tyle…**', 'Пара контраста — **o ile…, o tyle…**', 'The contrast pair **o ile…, o tyle…**')),
      reading('reading.essay', 'Felieton: „Wielu z nas traktuje hobby jak kolejny obowiązek: liczymy kroki, kilometry i przeczytane strony. Tymczasem pasja ma być odskocznią, a nie źródłem presji. O ile rywalizacja bywa motywująca, o tyle ciągłe porównywanie się z innymi odbiera radość”.',
        t('Про що застерігає автор фейлетону?', 'О чём предостерегает автор фельетона?', 'What does the columnist warn against?'),
        [t('не перетворювати хобі на ще один обов’язок', 'не превращать хобби в ещё одну обязанность', 'turning a hobby into another duty'), t('не займатися спортом без тренера', 'не заниматься спортом без тренера', 'doing sport without a coach'), t('не витрачати на хобі всі вихідні', 'не тратить на хобби все выходные', 'spending every weekend on a hobby')],
        t('«Wielu z nas **traktuje hobby jak kolejny obowiązek**… pasja ma być odskocznią, a nie źródłem presji».', '«Wielu z nas **traktuje hobby jak kolejny obowiązek**… pasja ma być odskocznią, a nie źródłem presji».', '“**traktuje hobby jak kolejny obowiązek**… pasja ma być odskocznią”.')),
      reverseChoice('register.essay', t('Фотографія дає мені змогу відірватися від буденності.', 'Фотография позволяет мне оторваться от повседневности.', 'Photography lets me get away from everyday life.'),
        ['Fotografia pozwala mi oderwać się od codzienności.', 'Fotografia pozwala mnie oderwać się od codzienności.', 'Fotografia pozwala mi oderwać się od codzienność.'],
        t('Кому — давальний: **mi**; від чого — родовий: **codzienności**.', 'Кому — дательный: **mi**; от чего — родительный: **codzienności**.', 'Dative **mi**; genitive **codzienności**.')),
      findError('register.essay', ['Czerpię', 'dużo', 'radości', 'od', 'gry', 'na', 'gitarze'], 3,
        t('Я отримую багато радості від гри на гітарі.', 'Я получаю много радости от игры на гитаре.', 'Playing the guitar gives me a lot of joy.'),
        t('**Czerpać z** + родовий: czerpię radość **z** gry.', '**Czerpać z** + родительный: czerpię radość **z** gry.', '**Czerpać z** + genitive.')),
      build('register.essay', 'Hobby jest dla mnie odskocznią od codzienności', t('Хобі для мене — віддушина від буденності', 'Хобби для меня — отдушина от повседневности', 'A hobby is my escape from everyday life'), ['odskocznia', 'z'], ['Dla mnie hobby jest odskocznią od codzienności'],
        t('Після «jest» — орудний: **odskocznią**; **od** + родовий.', 'После «jest» — творительный: **odskocznią**; **od** + родительный.', 'After «jest» — instrumental **odskocznią**.')),
      match('register.essay', [
        ['odskocznia od', t('віддушина від', 'отдушина от', 'an escape from')],
        ['czerpać satysfakcję z', t('отримувати задоволення від', 'получать удовлетворение от', 'to take satisfaction in')],
        ['poświęcać czas', t('присвячувати час', 'уделять время', 'to devote time')],
        ['oderwać się od', t('відірватися від', 'оторваться от', 'to get away from')],
      ]),
    ],
  },
};

// ───────────────────────────── gdy-boss: Спортивні вихідні (бос A2) ─────────────────────────────
const GDYBOSS: LessonLevels = {
  B1: {
    explanation: t(
      'Повторення Гдині (B1):\n• звички — **grywać**, **przestać grać**, **kiedyś biegałem, a teraz…**, **zdarza mi się**, **coraz częściej**;\n• умовний спосіб — **gdybym miał czas, chodziłbym**…; ввічливо — **czy mógłbym** + інфінітив;\n• матч — **wygrać / przegrać z** + орудний, **prowadzić**, **wyrównać**, **zakończyć się remisem**;\n• віддієслівні іменники — **po skończeniu**, **przed wypłynięciem**, **zamiast siedzenia**;\n• травма — **uderzyłem się w** kolano, **spuchła mi** kostka; уподобання — **wolę… niż / od**, **mam bzika na punkcie**.',
      'Повторение Гдыни (B1):\n• привычки — **grywać**, **przestać grać**, **kiedyś biegałem, a teraz…**, **zdarza mi się**, **coraz częściej**;\n• условное наклонение — **gdybym miał czas, chodziłbym**…; вежливо — **czy mógłbym** + инфинитив;\n• матч — **wygrać / przegrać z** + творительный, **prowadzić**, **wyrównać**, **zakończyć się remisem**;\n• отглагольные существительные — **po skończeniu**, **przed wypłynięciem**, **zamiast siedzenia**;\n• травма — **uderzyłem się w** kolano, **spuchła mi** kostka; предпочтения — **wolę… niż / od**, **mam bzika na punkcie**.',
      'Gdynia review (B1):\n• habits — **grywać**, **przestać grać**, **kiedyś biegałem, a teraz…**, **zdarza mi się**, **coraz częściej**;\n• the conditional — **gdybym miał czas, chodziłbym**…; politely — **czy mógłbym** + infinitive;\n• matches — **wygrać / przegrać z** + instrumental, **prowadzić**, **wyrównać**, **zakończyć się remisem**;\n• verbal nouns — **po skończeniu**, **przed wypłynięciem**, **zamiast siedzenia**;\n• injuries — **uderzyłem się w** kolano, **spuchła mi** kostka; preferences — **wolę… niż / od**, **mam bzika na punkcie**.',
    ),
    examples: [
      { pl: 'Kiedyś grywałem w tenisa, ale przestałem po kontuzji łokcia.', tr: t('Колись я грав у теніс, але кинув після травми ліктя.', 'Когда-то я играл в теннис, но бросил после травмы локтя.', 'I used to play tennis now and then, but I stopped after an elbow injury.') },
      { pl: 'Zamiast siedzenia w domu poszliśmy na mecz Arki.', tr: t('Замість сидіти вдома ми пішли на матч «Арки».', 'Вместо того чтобы сидеть дома, мы пошли на матч «Арки».', 'Instead of staying in, we went to an Arka match.') },
    ],
    exercises: [
      fillGap('vocab.boss', 'Kiedyś grałem w siatkówkę, ale ___ grać po przeprowadzce.', ['przestałem', 'przestawałem', 'przestanę', 'przestaję'],
        t('Колись я грав у волейбол, але кинув після переїзду.', 'Когда-то я играл в волейбол, но бросил после переезда.', 'I used to play volleyball, but I gave up after moving.'),
        t('Одна подія в минулому — доконаний: **przestałem**.', 'Одно событие в прошлом — совершенный: **przestałem**.', 'A single past event — perfective **przestałem**.')),
      fillGap('vocab.boss', 'Gdybym mieszkał bliżej przystani, ___ częściej.', ['żeglowałbym', 'żeglowałem', 'żegluję', 'żeglował'],
        t('Якби я жив ближче до пристані, частіше ходив би під вітрилом.', 'Если бы я жил ближе к пристани, чаще ходил бы под парусом.', 'If I lived closer to the marina, I’d sail more often.'),
        t('Наслідок — умовний спосіб: **żeglowałbym**.', 'Следствие — условное наклонение: **żeglowałbym**.', 'Result clause: **żeglowałbym**.')),
      fillGap('vocab.boss', 'Zamiast ___ w domu poszliśmy na mecz.', ['siedzenia', 'siedzenie', 'siedzeniem', 'siedzeniu'],
        t('Замість сидіти вдома ми пішли на матч.', 'Вместо того чтобы сидеть дома, мы пошли на матч.', 'Instead of staying at home, we went to the match.'),
        t('**Zamiast** + родовий: **siedzenia**.', '**Zamiast** + родительный: **siedzenia**.', '**Zamiast** + genitive.')),
      reverseChoice('vocab.boss', t('Чи міг би я продовжити абонемент ще на місяць?', 'Мог бы я продлить абонемент ещё на месяц?', 'Could I extend my membership by a month?'),
        ['Czy mógłbym przedłużyć karnet o miesiąc?', 'Czy mogłem przedłużyć karnet o miesiąc?', 'Czy mógłbym przedłużyć karnetu o miesiąc?'],
        t('Ввічливо — **mógłbym**; продовжити що — знахідний: **karnet**.', 'Вежливо — **mógłbym**; продлить что — винительный: **karnet**.', 'Polite **mógłbym**; accusative **karnet**.')),
      reading('reading.boss', 'Bobek podsumowuje weekend: „W sobotę rano zapisałem się na kurs żeglarski i zamiast siedzenia w domu cały dzień pływałem po zatoce. Wieczorem poszliśmy z Bartkiem na mecz: Arka przegrywała do przerwy, ale w ostatniej minucie wyrównała. W niedzielę poślizgnąłem się na schodach i spuchła mi kostka, więc zamiast biegania grałem z Kubą w szachy”.',
        t('Чому в неділю Бобек грав у шахи?', 'Почему в воскресенье Бобек играл в шахматы?', 'Why did Bobek play chess on Sunday?'),
        [t('після падіння в нього опухла кісточка', 'после падения у него распухла лодыжка', 'his ankle swelled up after a fall'), t('«Арка» програла матч', '«Арка» проиграла матч', 'Arka lost the match'), t('курс вітрильного спорту скасували', 'курс парусного спорта отменили', 'the sailing course was cancelled')],
        t('«**poślizgnąłem się na schodach i spuchła mi kostka**, więc zamiast biegania grałem… w szachy». «Арка» зіграла внічию.', '«**poślizgnąłem się na schodach i spuchła mi kostka**, więc zamiast biegania grałem… w szachy». «Арка» сыграла вничью.', '“**spuchła mi kostka**, więc zamiast biegania grałem w szachy”; Arka drew.')),
      dialogue('dialogue.boss', KUBA, [
        {
          npc: 'No i jak tam twój sportowy weekend?',
          tr: t('Ну, і як твої спортивні вихідні?', 'Ну и как твои спортивные выходные?', 'So how was your sporty weekend?'),
          choose: [
            ['Super, choć zdarzyło mi się upaść na schodach i skręcić kostkę.', t('Чудово, хоча я впав на сходах і підвернув кісточку.', 'Отлично, хотя я упал на лестнице и подвернул лодыжку.', 'Great, though I fell on the stairs and twisted my ankle.')],
            ['Super, choć zdarzyłem się upaść na schodach i skręcić kostkę.', t('(безособово: **zdarzyło mi się**)', '(безлично: **zdarzyło mi się**)', '(impersonal: **zdarzyło mi się**)')],
            ['Super, choć zdarzyło mi się upaść na schodach i skręcać kostkę.', t('(одна подія — доконаний: **skręcić**)', '(одно событие — совершенный: **skręcić**)', '(one event — perfective **skręcić**)')],
          ],
          feedback: t('**Zdarzyło mi się** + доконаний інфінітив.', '**Zdarzyło mi się** + совершенный инфинитив.', '**Zdarzyło mi się** + perfective infinitive.'),
        },
        {
          npc: 'To co, w przyszłym tygodniu siłownia?',
          tr: t('То що, наступного тижня спортзал?', 'Ну что, на следующей неделе спортзал?', 'So, the gym next week?'),
          choose: [
            ['Wolę basen niż siłownię — dla kostki to lepsze.', t('Я більше хочу в басейн, ніж у спортзал, — для кісточки так краще.', 'Мне больше подходит бассейн, чем спортзал, — для лодыжки так лучше.', 'I’d rather the pool than the gym — it’s better for my ankle.')],
            ['Wolę basen od siłownię — dla kostki to lepsze.', t('(**od** + родовий: od **siłowni**)', '(**od** + родительный: od **siłowni**)', '(**od** + genitive: **siłowni**)')],
            ['Wolę basenu niż siłownię — dla kostki to lepsze.', t('(**wolę** + знахідний: wolę **basen**)', '(**wolę** + винительный: wolę **basen**)', '(**wolę** + accusative: **basen**)')],
          ],
          feedback: t('**Wolę basen niż siłownię** = **od siłowni**.', '**Wolę basen niż siłownię** = **od siłowni**.', '**Wolę basen niż siłownię** = **od siłowni**.'),
        },
      ]),
      findError('vocab.boss', ['Arka', 'wygrała', 'nad', 'Lechią', 'w', 'ostatniej', 'minucie'], 2,
        t('«Арка» виграла в «Лехії» на останній хвилині.', '«Арка» выиграла у «Лехии» на последней минуте.', 'Arka beat Lechia in the last minute.'),
        t('Перемогти когось — **wygrać z** + орудний.', 'Победить кого-то — **wygrać z** + творительный.', 'To beat — **wygrać z**.')),
      build('vocab.boss', 'W drugiej połowie Arka wyrównała po rzucie karnym', t('У другому таймі «Арка» зрівняла рахунок після пенальті', 'Во втором тайме «Арка» сравняла счёт после пенальти', 'Arka equalised from a penalty in the second half'), ['wyrównywała', 'rzut'], ['Arka wyrównała po rzucie karnym w drugiej połowie'],
        t('Результат — **wyrównała**; **po** + місцевий: po **rzucie** karnym.', 'Результат — **wyrównała**; **po** + предложный: po **rzucie** karnym.', 'Perfective **wyrównała**; **po** + locative.')),
      match('vocab.boss', [
        ['grywać', t('грати час від часу', 'играть время от времени', 'to play now and then')],
        ['zawiesić karnet', t('призупинити абонемент', 'приостановить абонемент', 'to freeze a membership')],
        ['wyrównać', t('зрівняти рахунок', 'сравнять счёт', 'to equalise')],
        ['spuchnąć', t('опухнути', 'распухнуть', 'to swell up')],
      ]),
    ],
  },
  B2: {
    explanation: t(
      'Повторення Гдині (B2):\n• фразеологія — **grać pierwsze skrzypce**, **grać na zwłokę**, **to nie wchodzi w grę**;\n• книжна мова — **sprzyjać** + давальний, **przyczyniać się do** + родовий, **zaleca się**, **im…, tym…**;\n• договір — **wypowiedzieć umowę**, **przysługuje mi**, **zgodnie z** + орудний;\n• коментар — **gdyby nie** + називний, **przesądzić o** + місцевий, заперечення + родовий;\n• правила й медицина — **w razie** / **niezależnie od** + родовий, **zalecono mi**, **unikać** + родовий; есе — **odskocznia od**, **czerpać z**.',
      'Повторение Гдыни (B2):\n• фразеология — **grać pierwsze skrzypce**, **grać na zwłokę**, **to nie wchodzi w grę**;\n• книжный язык — **sprzyjać** + дательный, **przyczyniać się do** + родительный, **zaleca się**, **im…, tym…**;\n• договор — **wypowiedzieć umowę**, **przysługuje mi**, **zgodnie z** + творительный;\n• комментарий — **gdyby nie** + именительный, **przesądzić o** + предложный, отрицание + родительный;\n• правила и медицина — **w razie** / **niezależnie od** + родительный, **zalecono mi**, **unikać** + родительный; эссе — **odskocznia od**, **czerpać z**.',
      'Gdynia review (B2):\n• idioms — **grać pierwsze skrzypce**, **grać na zwłokę**, **to nie wchodzi w grę**;\n• formal style — **sprzyjać** + dative, **przyczyniać się do** + genitive, **zaleca się**, **im…, tym…**;\n• contracts — **wypowiedzieć umowę**, **przysługuje mi**, **zgodnie z** + instrumental;\n• commentary — **gdyby nie** + nominative, **przesądzić o** + locative, negation + genitive;\n• rules and medicine — **w razie** / **niezależnie od** + genitive, **zalecono mi**, **unikać** + genitive; essays — **odskocznia od**, **czerpać z**.',
    ),
    examples: [
      { pl: 'Gdyby nie kontuzja kapitana, drużyna walczyłaby o awans.', tr: t('Якби не травма капітана, команда боролася б за вихід до вищої ліги.', 'Если бы не травма капитана, команда боролась бы за выход в высшую лигу.', 'If it weren’t for the captain’s injury, the team would be fighting for promotion.') },
      { pl: 'Niezależnie od wyników kibice bywają na stadionie coraz liczniej.', tr: t('Незалежно від результатів уболівальники приходять на стадіон дедалі численніше.', 'Независимо от результатов болельщики бывают на стадионе всё чаще и всё больше.', 'Whatever the results, more and more fans are turning up at the stadium.') },
    ],
    exercises: [
      fillGap('vocab.boss', 'Gdyby nie ___, nie zdobylibyśmy mistrzostwa.', ['kapitan', 'kapitana', 'kapitanem', 'kapitanowi'],
        t('Якби не капітан, ми не здобули б чемпіонство.', 'Если бы не капитан, мы бы не выиграли чемпионат.', 'If it weren’t for the captain, we wouldn’t have won the title.'),
        t('Після **gdyby nie** — називний: **kapitan**.', 'После **gdyby nie** — именительный: **kapitan**.', 'After **gdyby nie** — nominative.')),
      fillGap('vocab.boss', 'W razie ___ pogody regaty zostaną przełożone.', ['pogorszenia', 'pogorszenie', 'pogorszeniem', 'pogorszeniu'],
        t('У разі погіршення погоди регату перенесуть.', 'В случае ухудшения погоды регату перенесут.', 'If the weather worsens, the regatta will be postponed.'),
        t('**W razie** + родовий: **pogorszenia**.', '**W razie** + родительный: **pogorszenia**.', '**W razie** + genitive.')),
      fillGap('vocab.boss', 'Regularny wysiłek fizyczny sprzyja ___ odporności.', ['wzmocnieniu', 'wzmocnienie', 'wzmocnienia', 'wzmocnieniem'],
        t('Регулярні фізичні навантаження сприяють зміцненню імунітету.', 'Регулярные физические нагрузки способствуют укреплению иммунитета.', 'Regular exercise helps strengthen immunity.'),
        t('**Sprzyjać** + давальний: **wzmocnieniu**.', '**Sprzyjać** + дательный: **wzmocnieniu**.', '**Sprzyjać** + dative.')),
      reverseChoice('vocab.boss', t('Про перенесення матчу не може бути мови.', 'О переносе матча не может быть и речи.', 'Postponing the match is out of the question.'),
        ['Przełożenie meczu nie wchodzi w grę.', 'Przełożenie meczu nie wchodzi do gry.', 'Przełożenie meczu nie gra w grę.'],
        t('Стала фраза: **nie wchodzi w grę**.', 'Устойчивая фраза: **nie wchodzi w grę**.', 'Set phrase: **nie wchodzi w grę**.')),
      reading('reading.boss', 'Sezon Arki w pigułce: „Gdyby nie kontuzja kapitana w październiku, drużyna walczyłaby o awans. Lekarze zalecili mu trzy miesiące przerwy, a klub mimo urazu przedłużył z nim umowę. Kibice bywają na stadionie coraz liczniej, niezależnie od wyników”.',
        t('Як учинив клуб із травмованим капітаном?', 'Как поступил клуб с травмированным капитаном?', 'What did the club do about the injured captain?'),
        [t('продовжив із ним контракт, попри травму', 'продлил с ним контракт, несмотря на травму', 'extended his contract despite the injury'), t('розірвав контракт через травму', 'расторг контракт из-за травмы', 'terminated his contract because of the injury'), t('заборонив йому тренуватися три місяці', 'запретил ему тренироваться три месяца', 'banned him from training for three months')],
        t('«klub **mimo urazu przedłużył z nim umowę**». Три місяці перерви порадили лікарі, а не клуб.', '«klub **mimo urazu przedłużył z nim umowę**». Три месяца перерыва посоветовали врачи, а не клуб.', '“**mimo urazu przedłużył z nim umowę**”; the doctors, not the club, advised the break.')),
      dialogue('dialogue.boss', BARTEK, [
        {
          npc: 'Słyszałeś? Zarząd chce sprzedać naszego najlepszego napastnika.',
          tr: t('Ти чув? Правління хоче продати нашого найкращого нападника.', 'Ты слышал? Правление хочет продать нашего лучшего нападающего.', 'Have you heard? The board wants to sell our best striker.'),
          choose: [
            ['To nie wchodzi w grę — bez niego nie mamy szans na awans.', t('Про це не може бути мови — без нього в нас немає шансів на вихід у вищу лігу.', 'Об этом не может быть и речи — без него у нас нет шансов на выход в высшую лигу.', 'That’s out of the question — without him we have no chance of promotion.')],
            ['To nie wchodzi w grę — bez nim nie mamy szans na awans.', t('(**bez** + родовий: bez **niego**)', '(**bez** + родительный: bez **niego**)', '(**bez** + genitive: **niego**)')],
            ['To nie wchodzi w grę — bez niego nie mamy szans do awansu.', t('(шанс на щось — **szansa na** + знахідний: na awans)', '(шанс на что-то — **szansa na** + винительный: na awans)', '(**szansa na** + accusative)')],
          ],
          feedback: t('**Bez niego**; **szansa na awans**.', '**Bez niego**; **szansa na awans**.', '**Bez niego**; **szansa na awans**.'),
        },
        {
          npc: 'Zarząd twierdzi, że sprzedaż przyczyni się do poprawy finansów.',
          tr: t('Правління каже, що продаж сприятиме поліпшенню фінансів.', 'Правление утверждает, что продажа поможет улучшить финансы.', 'The board says the sale will help the finances.'),
          choose: [
            ['Może i tak, ale gdyby nie on, spadlibyśmy z ligi już w zeszłym sezonie.', t('Може, й так, але якби не він, ми вилетіли б із ліги ще минулого сезону.', 'Может, и так, но если бы не он, мы бы вылетели из лиги ещё в прошлом сезоне.', 'Maybe, but if it weren’t for him we’d have gone down last season.')],
            ['Może i tak, ale gdyby nie jego, spadlibyśmy z ligi już w zeszłym sezonie.', t('(після **gdyby nie** — називний: **on**)', '(после **gdyby nie** — именительный: **on**)', '(after **gdyby nie** — nominative **on**)')],
            ['Może i tak, ale gdyby nie on, spadliśmy z ligi już w zeszłym sezonie.', t('(наслідок — умовний: **spadlibyśmy**)', '(следствие — условное: **spadlibyśmy**)', '(conditional result: **spadlibyśmy**)')],
          ],
          feedback: t('**Gdyby nie on, spadlibyśmy**.', '**Gdyby nie on, spadlibyśmy**.', '**Gdyby nie on, spadlibyśmy**.'),
        },
      ]),
      findError('vocab.boss', ['Lekarz', 'zalecił', 'mi', 'unikać', 'wysiłek'], 4,
        t('Лікар порадив мені уникати навантажень.', 'Врач посоветовал мне избегать нагрузок.', 'The doctor told me to avoid exertion.'),
        t('**Unikać** + родовий: **wysiłku**.', '**Unikać** + родительный: **wysiłku**.', '**Unikać** + genitive.')),
      build('vocab.boss', 'Niezależnie od pogody bywam na przystani w każdą sobotę', t('Незалежно від погоди я буваю на пристані щосуботи', 'Независимо от погоды я бываю на пристани каждую субботу', 'Whatever the weather, I’m at the marina every Saturday'), ['pogoda', 'bywa'], ['W każdą sobotę bywam na przystani niezależnie od pogody'],
        t('**Niezależnie od** + родовий: **pogody**; **bywać** — бувати регулярно.', '**Niezależnie od** + родительный: **pogody**; **bywać** — бывать регулярно.', '**Niezależnie od** + genitive; **bywać** — to frequent.')),
      match('vocab.boss', [
        ['grać pierwsze skrzypce', t('задавати тон', 'задавать тон', 'to call the tune')],
        ['przesądzić o wyniku', t('вирішити результат', 'решить исход', 'to decide the result')],
        ['przysługuje mi', t('мені належить', 'мне положено', 'I am entitled to')],
        ['odskocznia', t('віддушина', 'отдушина', 'an escape')],
      ]),
    ],
  },
};

export const GDYNIA_LEVELS: Record<string, LessonLevels> = {
  'gdy-1-grac': GDY1,
  'gdy-2-uprawiam': GDY2,
  'gdy-3-jak-czesto': GDY3,
  'gdy-4-silownia': GDY4,
  'gdy-5-mecz': GDY5,
  'gdy-6-zeglarstwo': GDY6,
  'gdy-7-kontuzja': GDY7,
  'gdy-8-hobby': GDY8,
  'gdy-boss': GDYBOSS,
};
