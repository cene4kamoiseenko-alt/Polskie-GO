/**
 * Варшава · локація 2 — Warszawa Centralna й транспорт.
 * Вокзал (Gdzie jest / Gdzie są, Którędy do…?), квитки на міський транспорт (зони, час, karta miejska),
 * метро M1/M2 і пересадка на Świętokrzyskiej (наказовий спосіб), місія «З вокзалу на Старе Місто».
 * Ціни та розклад — навчальні приклади; актуальну схему варто перевірити на сайті перевізника.
 */
import {
  t, wordChoice, pictureChoice, reverseChoice, fillGap, listen, findError, oddOne, reading,
  translate, dictation, build, wordOrder, match, speak, dialogue,
} from './builders';
import type { LessonSeed } from './types';

const ANIA = { name: 'Ania', emoji: '👩🏼', role: t('студентка з Варшави', 'студентка из Варшавы', 'a student from Warsaw') };
const TOMASZ = { name: 'Pan Tomasz', emoji: '👨🏻‍💼', role: t('працівник довідки', 'сотрудник справочной', 'information desk clerk') };
const BASIA = { name: 'Pani Basia', emoji: '👩🏻‍🦳', role: t('пасажирка метро', 'пассажирка метро', 'a metro passenger') };
const ADAM = { name: 'Pan Adam', emoji: '🧑🏻', role: t('пасажир', 'пассажир', 'a passenger') };
const MACHINE = { name: 'Biletomat', emoji: '🎫', role: t('квитковий автомат', 'билетный автомат', 'ticket machine') };

const BOARD = 'TABLICA ODJAZDÓW (przykład) · 10:15 Kraków Główny — peron 2 · 10:22 Gdańsk Główny — peron 4 · 10:30 Poznań Główny — peron 1';
const MACHINE_PRICES = 'BILETOMAT (ceny przykładowe) · 20-minutowy: 3,40 zł · 75-minutowy: 4,40 zł · dobowy: 15 zł · weekendowy: 24 zł · ulgowe: ok. 50%';
const METRO_MAP = 'LINIA M1: Kabaty … Politechnika – Centrum – Świętokrzyska – Ratusz Arsenał … Młociny · LINIA M2: Bemowo … Rondo ONZ – Świętokrzyska – Nowy Świat-Uniwersytet … Bródno';
const PLAN = 'PLAN OD ANI: 1) Z Centralnej idź przejściem podziemnym do metra Centrum. 2) M1 w kierunku Młocin — jedna stacja. 3) Na Świętokrzyskiej przesiądź się na M2 w kierunku Bródna. 4) Wysiądź na Nowym Świecie i idź Krakowskim Przedmieściem na plac Zamkowy.';

const C1: LessonSeed = {
  slug: 'waw-c1-centralna',
  title: t('На вокзалі Warszawa Centralna', 'На вокзале Warszawa Centralna', 'At Warszawa Centralna'),
  topic: t('Gdzie jest…? / Gdzie są…? Którędy do metra? Перехід, ескалатор, табло', 'Gdzie jest…? / Gdzie są…? Którędy do metra? Переход, эскалатор, табло', 'Gdzie jest…? / Gdzie są…? Which way to the metro? Underpass, escalator, board'),
  cefr: 'A0',
  difficulty: 1,
  explanation: t(
    '**Warszawa Centralna** — головний вокзал столиці, платформи в нього під землею. Поруч — Палац культури і станція метро **Centrum**, до неї веде **przejście podziemne** (підземний перехід).\n**Gdzie jest…?** — про одне: Gdzie jest wyjście? **Gdzie są…?** — про кілька: Gdzie są kasy?\n**Którędy do metra?** — Як пройти до метро? (**do** + родовий: metro → do metra)\n**schody ruchome** — ескалатор, **tablica odjazdów** — табло відправлень, **na górę / na dół** — нагору / вниз.',
    '**Warszawa Centralna** — главный вокзал столицы, платформы у него под землёй. Рядом — Дворец культуры и станция метро **Centrum**, к ней ведёт **przejście podziemne** (подземный переход).\n**Gdzie jest…?** — об одном: Gdzie jest wyjście? **Gdzie są…?** — о нескольких: Gdzie są kasy?\n**Którędy do metra?** — Как пройти к метро? (**do** + родительный: metro → do metra)\n**schody ruchome** — эскалатор, **tablica odjazdów** — табло отправлений, **na górę / na dół** — наверх / вниз.',
    '**Warszawa Centralna** is the capital\'s main station; its platforms are underground. Next to it are the Palace of Culture and **Centrum** metro station, reached by a **przejście podziemne** (underpass).\n**Gdzie jest…?** — for one thing: Gdzie jest wyjście? **Gdzie są…?** — for several: Gdzie są kasy?\n**Którędy do metra?** — Which way to the metro? (**do** + genitive: metro → do metra)\n**schody ruchome** — escalator, **tablica odjazdów** — departures board, **na górę / na dół** — up / down.',
  ),
  examples: [{ pl: 'Przepraszam, którędy do metra? — Przejściem podziemnym w prawo.', tr: t('Перепрошую, як пройти до метро? — Підземним переходом праворуч.', 'Извините, как пройти к метро? — Подземным переходом направо.', 'Excuse me, which way to the metro? — Through the underpass to the right.') }],
  words: ['stacja', 'przejście podziemne', 'schody ruchome', 'tablica', 'wyjście', 'informacja', 'którędy'],
  exercises: [
    wordChoice('vocab.station', 'przejście podziemne', [t('підземний перехід', 'подземный переход', 'underpass'), t('пішохідний перехід', 'пешеходный переход', 'pedestrian crossing'), t('вихід', 'выход', 'exit')]),
    wordChoice('vocab.station', 'schody ruchome', [t('ескалатор', 'эскалатор', 'escalator'), t('звичайні сходи', 'обычная лестница', 'stairs'), t('ліфт', 'лифт', 'lift')]),
    reverseChoice('vocab.station', t('Як пройти до метро?', 'Как пройти к метро?', 'Which way to the metro?'), ['Którędy do metra?', 'Kiedy jest metro?', 'Czy to jest metro?']),
    match('vocab.station', [
      ['tablica', t('табло', 'табло', 'board')],
      ['wyjście', t('вихід', 'выход', 'exit')],
      ['informacja', t('довідка', 'справочная', 'information')],
      ['stacja', t('станція', 'станция', 'station')],
    ]),
    fillGap('grammar.where', 'Gdzie ___ kasy biletowe?', ['są', 'jest', 'to'], t('Де квиткові каси?', 'Где билетные кассы?', 'Where are the ticket offices?'),
      t('Кілька кас → **są**.', 'Несколько касс → **są**.', 'Several ticket offices → **są**.')),
    fillGap('grammar.where', 'Gdzie ___ wyjście do metra?', ['jest', 'są', 'jesteś'], t('Де вихід до метро?', 'Где выход к метро?', 'Where is the way out to the metro?'),
      t('Один вихід → **jest**.', 'Один выход → **jest**.', 'One exit → **jest**.')),
    listen('listening.station', 'Wyjście do metra jest na dole', ['Wyjście do metra jest na dole', 'Wyjście do metra jest na górze', 'Wejście do metra jest na dole']),
    listen('listening.station', 'Proszę zjechać schodami ruchomymi', ['Proszę zjechać schodami ruchomymi', 'Proszę wjechać windą', 'Proszę iść schodami']),
    reading('reading.board', BOARD, t('З якої платформи потяг до Гданська?', 'С какой платформы поезд до Гданьска?', 'Which platform is the Gdańsk train?'), ['4', '2', '1']),
    reading('reading.board', BOARD, t('О котрій потяг до Познані?', 'Во сколько поезд до Познани?', 'What time is the Poznań train?'), ['10:30', '10:15', '10:22']),
    oddOne('vocab.station', ['peron', 'tor', 'kasa', 'pomidor'], 3,
      t('Три — про вокзал, а **pomidor** — помідор.', 'Три — о вокзале, а **pomidor** — помидор.', 'Three are about the station; **pomidor** is a tomato.')),
    dialogue('situation.centralna', TOMASZ, [
      { npc: 'Dzień dobry, w czym mogę pomóc?', tr: t('Добрий день, чим можу допомогти?', 'Добрый день, чем могу помочь?', 'Hello, how can I help?'),
        choose: [['Dzień dobry, którędy do metra?', t('Добрий день, як пройти до метро?', 'Добрый день, как пройти к метро?', 'Hello, which way to the metro?')], ['Dzień dobry, poproszę kawę.', t('Добрий день, каву, будь ласка.', 'Добрый день, кофе, пожалуйста.', 'Hello, a coffee, please.')]],
        feedback: t('Це довідка, не кав\'ярня. Спитай дорогу: **Którędy do metra?**', 'Это справочная, не кафе. Спроси дорогу: **Którędy do metra?**', 'This is information, not a café. Ask the way: **Którędy do metra?**') },
      { npc: 'Proszę iść przejściem podziemnym w prawo, a potem schodami ruchomymi na dół.', tr: t('Ідіть підземним переходом праворуч, а потім ескалатором униз.', 'Идите подземным переходом направо, а потом на эскалаторе вниз.', 'Go through the underpass to the right, then take the escalator down.'),
        choose: [['Czy to daleko?', t('Це далеко?', 'Это далеко?', 'Is it far?')], ['Mam na imię Ania.', t('Мене звати Аня.', 'Меня зовут Аня.', 'My name is Ania.')]],
        feedback: t('Можна уточнити відстань: **Czy to daleko?**', 'Можно уточнить расстояние: **Czy to daleko?**', 'Ask about the distance: **Czy to daleko?**') },
      { npc: 'Nie, to trzy minuty pieszo.', tr: t('Ні, це три хвилини пішки.', 'Нет, это три минуты пешком.', 'No, it\'s three minutes on foot.'),
        choose: [['Dziękuję bardzo!', t('Дуже дякую!', 'Большое спасибо!', 'Thank you very much!')], ['Dobranoc!', t('На добраніч!', 'Спокойной ночи!', 'Good night!')]],
        feedback: t('Подякуй: **Dziękuję bardzo!**', 'Поблагодари: **Dziękuję bardzo!**', 'Say thanks: **Dziękuję bardzo!**') },
      { npc: 'Proszę bardzo!', tr: t('Прошу!', 'Пожалуйста!', 'You\'re welcome!') },
    ], { situation: true, scene: t('Потяг щойно прибув на підземну платформу. Тобі треба до метро.', 'Поезд только что прибыл на подземную платформу. Тебе нужно к метро.', 'The train has just pulled into an underground platform. You need the metro.') }),
    findError('grammar.where', ['Gdzie', 'jest', 'kasy'], 1, t('Де каси?', 'Где кассы?', 'Where are the ticket offices?'),
      t('Кілька кас → **są**: Gdzie są kasy?', 'Несколько касс → **są**: Gdzie są kasy?', 'Several → **są**: Gdzie są kasy?')),
    build('grammar.where', 'Gdzie jest wyjście na ulicę', t('Де вихід на вулицю?', 'Где выход на улицу?', 'Where is the exit to the street?'), ['są', 'wejście']),
    wordOrder('grammar.where', 'Którędy do Pałacu Kultury', t('Як пройти до Палацу культури?', 'Как пройти к Дворцу культуры?', 'Which way to the Palace of Culture?')),
    translate('writing.station', t('Де довідка?', 'Где справочная?', 'Where is the information desk?'), ['Gdzie jest informacja', 'Przepraszam, gdzie jest informacja']),
    dictation('writing.station', 'Gdzie są schody ruchome', t('Де ескалатор?', 'Где эскалатор?', 'Where is the escalator?')),
    speak('speaking.station', 'Przepraszam, którędy do metra?', t('Перепрошую, як пройти до метро?', 'Извините, как пройти к метро?', 'Excuse me, which way to the metro?')),
  ],
};

const C2: LessonSeed = {
  slug: 'waw-c2-bilety',
  title: t('Квитки на міський транспорт', 'Билеты на городской транспорт', 'City transport tickets'),
  topic: t('Квитки на час, зони, normalny / ulgowy, karta miejska, doładować', 'Билеты на время, зоны, normalny / ulgowy, karta miejska, doładować', 'Time tickets, zones, full / reduced fare, city card, top up'),
  cefr: 'A1',
  difficulty: 2,
  explanation: t(
    'У Варшаві один квиток діє в метро, трамваях, автобусах і міських електричках **SKM** — у межах часу й зони.\nКвитки на час: **20-minutowy**, **75-minutowy** (з пересадками), **dobowy** (24 h), **weekendowy**. Зони: **strefa 1** — місто, **strefa 1+2** — з передмістям.\n**normalny** — звичайний, **ulgowy** — пільговий (з документом).\n**karta miejska** — міська картка для довгих квитків (30 або 90 днів), її **doładowuje się** — поповнюють.\nПаперовий квиток компостуй одразу після посадки; квиток у застосунку активуй до посадки. Ціни у вправах — приклади.',
    'В Варшаве один билет действует в метро, трамваях, автобусах и городских электричках **SKM** — в пределах времени и зоны.\nБилеты на время: **20-minutowy**, **75-minutowy** (с пересадками), **dobowy** (24 h), **weekendowy**. Зоны: **strefa 1** — город, **strefa 1+2** — с пригородом.\n**normalny** — обычный, **ulgowy** — льготный (с документом).\n**karta miejska** — городская карта для длинных билетов (30 или 90 дней), её **doładowuje się** — пополняют.\nБумажный билет компостируй сразу после посадки; билет в приложении активируй до посадки. Цены в упражнениях — примеры.',
    'In Warsaw one ticket works on the metro, trams, buses and **SKM** city trains — within its time and zone.\nTime tickets: **20-minutowy**, **75-minutowy** (with transfers), **dobowy** (24 h), **weekendowy**. Zones: **strefa 1** — the city, **strefa 1+2** — with the suburbs.\n**normalny** — full fare, **ulgowy** — reduced (with ID).\n**karta miejska** — city card for long tickets (30 or 90 days); you **top it up** (doładować).\nValidate a paper ticket straight after boarding; activate an app ticket before boarding. Prices are examples.',
  ),
  examples: [{ pl: 'Weź bilet na 75 minut, będzie przesiadka.', tr: t('Бери квиток на 75 хвилин, буде пересадка.', 'Бери билет на 75 минут, будет пересадка.', 'Get a 75-minute ticket, there\'ll be a transfer.') }],
  words: ['strefa', 'karta miejska', 'doładować', 'bilet', 'ulgowy', 'normalny'],
  exercises: [
    wordChoice('vocab.tickets', 'strefa', [t('зона', 'зона', 'zone'), t('станція', 'станция', 'station'), t('зміна', 'смена', 'shift')]),
    wordChoice('vocab.tickets', 'doładować', [t('поповнити (картку)', 'пополнить (карту)', 'to top up'), t('завантажити застосунок', 'скачать приложение', 'to download an app'), t('купити нову', 'купить новую', 'to buy a new one')]),
    reverseChoice('vocab.tickets', t('міська картка', 'городская карта', 'city card'), ['karta miejska', 'karta płatnicza', 'mapa miasta']),
    match('vocab.tickets', [
      ['bilet dobowy', t('на 24 години', 'на 24 часа', 'for 24 hours')],
      ['bilet weekendowy', t('на вихідні', 'на выходные', 'for the weekend')],
      ['strefa', t('зона', 'зона', 'zone')],
      ['ulgowy', t('пільговий', 'льготный', 'reduced')],
    ]),
    fillGap('grammar.tickets', 'Poproszę bilet dobowy ___.', ['ulgowy', 'ulgowa', 'ulgowe'], t('Пільговий добовий квиток, будь ласка.', 'Льготный суточный билет, пожалуйста.', 'A reduced 24-hour ticket, please.'),
      t('**bilet** — чоловічий рід → **ulgowy**.', '**bilet** — мужской род → **ulgowy**.', '**bilet** is masculine → **ulgowy**.')),
    fillGap('grammar.tickets', 'Muszę ___ kartę miejską.', ['doładować', 'doładowanie', 'doładowana'], t('Мені треба поповнити міську картку.', 'Мне нужно пополнить городскую карту.', 'I need to top up my city card.'),
      t('Після **muszę** — інфінітив: **doładować**.', 'После **muszę** — инфинитив: **doładować**.', 'After **muszę** use the infinitive: **doładować**.')),
    listen('listening.tickets', 'Bilet dwudziestominutowy kosztuje trzy złote czterdzieści groszy', ['Bilet dwudziestominutowy kosztuje trzy złote czterdzieści groszy', 'Bilet dwudziestominutowy kosztuje cztery złote czterdzieści groszy', 'Bilet dwudziestominutowy kosztuje trzy złote dwadzieścia groszy']),
    listen('listening.tickets', 'Ten bilet jest ważny w pierwszej strefie', ['Ten bilet jest ważny w pierwszej strefie', 'Ten bilet jest ważny w drugiej strefie', 'Ten bilet nie jest ważny w pierwszej strefie']),
    reading('reading.machine', MACHINE_PRICES, t('Скільки коштує 75-хвилинний квиток?', 'Сколько стоит 75-минутный билет?', 'How much is a 75-minute ticket?'), ['4,40 zł', '3,40 zł', '15 zł']),
    reading('reading.machine', MACHINE_PRICES, t('Ти їдеш 40 хвилин із пересадкою. Який квиток підходить?', 'Ты едешь 40 минут с пересадкой. Какой билет подходит?', 'You ride 40 minutes with a transfer. Which ticket fits?'),
      [t('75-хвилинний', '75-минутный', '75-minute'), t('20-хвилинний', '20-минутный', '20-minute'), t('Жоден', 'Никакой', 'None')],
      t('20 хвилин замало — бери **75-minutowy**.', '20 минут мало — бери **75-minutowy**.', '20 minutes is too short — take the **75-minutowy**.')),
    dialogue('situation.tickets', ANIA, [
      { npc: 'Jedziemy metrem na Stare Miasto. Masz bilet?', tr: t('Їдемо метро на Старе Місто. Маєш квиток?', 'Едем на метро в Старый город. У тебя есть билет?', 'We\'re taking the metro to the Old Town. Got a ticket?'),
        choose: [['Nie mam. Jaki bilet kupić?', t('Не маю. Який квиток купити?', 'Нет. Какой билет купить?', 'No. Which ticket should I buy?')], ['Tak, mam rezerwację.', t('Так, маю бронювання.', 'Да, у меня бронь.', 'Yes, I have a booking.')]],
        feedback: t('Квитка немає — спитай, який купити: **Jaki bilet kupić?**', 'Билета нет — спроси, какой купить: **Jaki bilet kupić?**', 'No ticket — ask which to buy: **Jaki bilet kupić?**') },
      { npc: 'Weź bilet na 75 minut, będzie przesiadka.', tr: t('Бери квиток на 75 хвилин, буде пересадка.', 'Бери билет на 75 минут, будет пересадка.', 'Get a 75-minute ticket, there\'ll be a transfer.'),
        choose: [['Dobrze. Normalny czy ulgowy?', t('Добре. Звичайний чи пільговий?', 'Хорошо. Обычный или льготный?', 'OK. Full fare or reduced?')], ['Dobrze, poproszę żurek.', t('Добре, журек, будь ласка.', 'Хорошо, журек, пожалуйста.', 'OK, the żurek, please.')]],
        feedback: t('Уточни тип квитка: **normalny czy ulgowy?**', 'Уточни тип билета: **normalny czy ulgowy?**', 'Ask about the fare type: **normalny czy ulgowy?**') },
      { npc: 'Normalny. Ulgowy jest tylko z legitymacją.', tr: t('Звичайний. Пільговий — лише з посвідченням.', 'Обычный. Льготный — только с удостоверением.', 'Full fare. Reduced is only with an ID.'),
        choose: [['Jasne, kupię normalny w biletomacie.', t('Зрозуміло, куплю звичайний в автоматі.', 'Понятно, куплю обычный в автомате.', 'Sure, I\'ll buy a full fare at the machine.')], ['Jasne, mam dwadzieścia lat.', t('Зрозуміло, мені двадцять.', 'Понятно, мне двадцать.', 'Sure, I\'m twenty.')]],
        feedback: t('Скажи, що купиш: **kupię normalny**.', 'Скажи, что купишь: **kupię normalny**.', 'Say what you\'ll buy: **kupię normalny**.') },
      { npc: 'Super, to idziemy!', tr: t('Супер, тоді ходімо!', 'Супер, тогда пошли!', 'Great, let\'s go!') },
    ], { situation: true, scene: t('Ви з Анею біля входу в метро Centrum.', 'Вы с Аней у входа в метро Centrum.', 'You and Ania are at the entrance to Centrum metro.') }),
    oddOne('vocab.tickets', ['dobowy', 'weekendowy', 'dwudziestominutowy', 'zielony'], 3,
      t('Три — види квитків, а **zielony** — зелений.', 'Три — виды билетов, а **zielony** — зелёный.', 'Three are ticket types; **zielony** means green.')),
    findError('grammar.tickets', ['Poproszę', 'bilet', 'ulgowa'], 2, t('Пільговий квиток, будь ласка.', 'Льготный билет, пожалуйста.', 'A reduced ticket, please.'),
      t('**bilet** → **ulgowy**.', '**bilet** → **ulgowy**.', '**bilet** → **ulgowy**.')),
    build('grammar.tickets', 'Czy ten bilet jest ważny w metrze', t('Чи дійсний цей квиток у метро?', 'Действителен ли этот билет в метро?', 'Is this ticket valid on the metro?'), ['metro', 'ważna']),
    wordOrder('grammar.tickets', 'Bilet dobowy jest ważny dwadzieścia cztery godziny', t('Добовий квиток діє двадцять чотири години.', 'Суточный билет действует двадцать четыре часа.', 'A 24-hour ticket is valid for twenty-four hours.')),
    translate('writing.tickets', t('Мені треба поповнити міську картку.', 'Мне нужно пополнить городскую карту.', 'I need to top up my city card.'), ['Muszę doładować kartę miejską', 'Muszę doładować kartę']),
    pictureChoice('vocab.transport', 'metro', [
      ['🚇', t('метро', 'метро', 'metro')], ['🚋', t('трамвай', 'трамвай', 'tram')], ['🚌', t('автобус', 'автобус', 'bus')], ['🚆', t('потяг', 'поезд', 'train')],
    ]),
    speak('speaking.tickets', 'Poproszę bilet na 75 minut, normalny', t('Звичайний квиток на 75 хвилин, будь ласка', 'Обычный билет на 75 минут, пожалуйста', 'A full-fare 75-minute ticket, please')),
  ],
};

const C3: LessonSeed = {
  slug: 'waw-c3-metro',
  title: t('Метро й пересадка', 'Метро и пересадка', 'The metro and transfers'),
  topic: t('M1 і M2, Wsiądź / Wysiądź / Przesiądź się, na stacji, Następna stacja…', 'M1 и M2, Wsiądź / Wysiądź / Przesiądź się, na stacji, Następna stacja…', 'M1 and M2, get on / off / change, at the station, next station…'),
  cefr: 'A1',
  difficulty: 2,
  explanation: t(
    'У Варшаві дві лінії метро: **M1** (північ — південь, кінцеві Młociny і Kabaty) та **M2** (захід — схід). Пересадка між ними — на станції **Świętokrzyska**.\n**Wsiądź do M1 w kierunku Młocin.** — Сідай у M1 у напрямку Млоцин. **Wysiądź na stacji Świętokrzyska.** — Вийди на станції Świętokrzyska. **Przesiądź się na M2.** — Пересядь на M2.\nПорада до «ти» — наказовий спосіб: wsiąść → **wsiądź**, wysiąść → **wysiądź**, przesiąść się → **przesiądź się**, jechać → **jedź**.\nПізно вночі в будні частіше їздять **autobusy nocne** — лінії з літерою N.\nЯкщо їдеш не туди: **Chyba jadę w złą stronę.** — Здається, я їду не в той бік.',
    'В Варшаве две линии метро: **M1** (север — юг, конечные Młociny и Kabaty) и **M2** (запад — восток). Пересадка между ними — на станции **Świętokrzyska**.\n**Wsiądź do M1 w kierunku Młocin.** — Садись в M1 в сторону Млоцин. **Wysiądź na stacji Świętokrzyska.** — Выйди на станции Świętokrzyska. **Przesiądź się na M2.** — Пересядь на M2.\nСовет на «ты» — повелительное наклонение: wsiąść → **wsiądź**, wysiąść → **wysiądź**, przesiąść się → **przesiądź się**, jechać → **jedź**.\nПоздно ночью в будни чаще ездят **autobusy nocne** — линии с буквой N.\nЕсли едешь не туда: **Chyba jadę w złą stronę.** — Кажется, я еду не в ту сторону.',
    'Warsaw has two metro lines: **M1** (north–south, termini Młociny and Kabaty) and **M2** (west–east). You change between them at **Świętokrzyska**.\n**Wsiądź do M1 w kierunku Młocin.** — Get on M1 towards Młociny. **Wysiądź na stacji Świętokrzyska.** — Get off at Świętokrzyska. **Przesiądź się na M2.** — Change to M2.\nAdvice to "ty" uses the imperative: wsiąść → **wsiądź**, wysiąść → **wysiądź**, przesiąść się → **przesiądź się**, jechać → **jedź**.\nLate at night on weekdays it\'s often **autobusy nocne** — lines marked N.\nIf you\'re going the wrong way: **Chyba jadę w złą stronę.**',
  ),
  examples: [{ pl: 'Wsiądź do M1 w kierunku Młocin i przesiądź się na Świętokrzyskiej.', tr: t('Сідай у M1 у напрямку Млоцин і пересядь на Świętokrzyskiej.', 'Садись в M1 в сторону Млоцин и пересядь на Świętokrzyskiej.', 'Take M1 towards Młociny and change at Świętokrzyska.') }],
  words: ['wsiąść', 'wysiąść', 'przesiadka', 'zgubić się', 'autobus nocny', 'linia'],
  exercises: [
    wordChoice('vocab.metro', 'przesiadka', [t('пересадка', 'пересадка', 'transfer'), t('посадка', 'посадка', 'boarding'), t('зупинка', 'остановка', 'stop')]),
    wordChoice('vocab.metro', 'wsiąść', [t('сісти (в транспорт)', 'сесть (в транспорт)', 'to get on'), t('вийти', 'выйти', 'to get off'), t('пересісти', 'пересесть', 'to change')]),
    reverseChoice('vocab.metro', t('Вийди на наступній станції.', 'Выйди на следующей станции.', 'Get off at the next station.'), ['Wysiądź na następnej stacji.', 'Wsiądź na następnej stacji.', 'Wejdź na następną stację.']),
    match('vocab.metro', [
      ['Młociny', t('кінцева M1 на півночі', 'конечная M1 на севере', 'M1 northern terminus')],
      ['Kabaty', t('кінцева M1 на півдні', 'конечная M1 на юге', 'M1 southern terminus')],
      ['Świętokrzyska', t('пересадка M1 ↔ M2', 'пересадка M1 ↔ M2', 'M1 ↔ M2 transfer')],
      ['autobus nocny', t('нічний автобус', 'ночной автобус', 'night bus')],
    ]),
    fillGap('grammar.imperative', '___ do M1 w kierunku Kabat.', ['Wsiądź', 'Wsiadam', 'Wsiąść'], t('Сідай у M1 у напрямку Кабат.', 'Садись в M1 в сторону Кабат.', 'Get on M1 towards Kabaty.'),
      t('Порада до «ти» → наказовий: **wsiądź**.', 'Совет на «ты» → повелительное: **wsiądź**.', 'Advice to "ty" → imperative: **wsiądź**.')),
    fillGap('grammar.locative', 'Wysiądź na ___ Świętokrzyska.', ['stacji', 'stacja', 'stację'], t('Вийди на станції Świętokrzyska.', 'Выйди на станции Świętokrzyska.', 'Get off at Świętokrzyska station.'),
      t('**na** + місцевий: stacja → **na stacji**.', '**na** + предложный: stacja → **na stacji**.', '**na** + locative: stacja → **na stacji**.')),
    fillGap('grammar.imperative', 'Na Świętokrzyskiej ___ się na M2.', ['przesiądź', 'przesiadka', 'przesiąść'], t('На Świętokrzyskiej пересядь на M2.', 'На Świętokrzyskiej пересядь на M2.', 'At Świętokrzyska change to M2.'),
      t('Наказовий від przesiąść się → **przesiądź się**.', 'Повелительное от przesiąść się → **przesiądź się**.', 'Imperative of przesiąść się → **przesiądź się**.')),
    listen('listening.metro', 'Następna stacja: Ratusz Arsenał', ['Następna stacja: Ratusz Arsenał', 'Następna stacja: Politechnika', 'Ostatnia stacja: Ratusz Arsenał']),
    listen('listening.metro', 'Uwaga, drzwi zamykają się', ['Uwaga, drzwi zamykają się', 'Uwaga, drzwi otwierają się', 'Uwaga, schody nie działają']),
    reading('reading.metro-map', METRO_MAP, t('Де пересадка з M1 на M2?', 'Где пересадка с M1 на M2?', 'Where do you change from M1 to M2?'), ['Świętokrzyska', 'Centrum', 'Politechnika']),
    reading('reading.metro-map', METRO_MAP, t('Яка станція M2 іде після Świętokrzyska в бік Bródna?', 'Какая станция M2 идёт после Świętokrzyska в сторону Bródna?', 'Which M2 station comes after Świętokrzyska towards Bródno?'), ['Nowy Świat-Uniwersytet', 'Rondo ONZ', 'Centrum']),
    dialogue('situation.lost-metro', BASIA, [
      { npc: 'Mogę w czymś pomóc?', tr: t('Можу чимось допомогти?', 'Могу чем-то помочь?', 'Can I help?'),
        choose: [['Tak, chyba jadę w złą stronę. Jak dojechać na Nowy Świat?', t('Так, здається, я їду не туди. Як доїхати до Нового Світу?', 'Да, кажется, я еду не туда. Как доехать до Нового Света?', 'Yes, I think I\'m going the wrong way. How do I get to Nowy Świat?')], ['Tak, mam bilet dobowy.', t('Так, маю добовий квиток.', 'Да, у меня суточный билет.', 'Yes, I have a 24-hour ticket.')]],
        feedback: t('Поясни проблему: **chyba jadę w złą stronę**.', 'Объясни проблему: **chyba jadę w złą stronę**.', 'Explain the problem: **chyba jadę w złą stronę**.') },
      { npc: 'Proszę wysiąść na Świętokrzyskiej i przesiąść się na M2 w kierunku Bródna.', tr: t('Вийдіть на Świętokrzyskiej і пересядьте на M2 у напрямку Брудна.', 'Выйдите на Świętokrzyskiej и пересядьте на M2 в сторону Брудно.', 'Get off at Świętokrzyska and change to M2 towards Bródno.'),
        choose: [['Czyli potem tylko jedna stacja?', t('Тобто потім лише одна станція?', 'То есть потом только одна станция?', 'So then just one station?')], ['Czyli autobus nocny?', t('Тобто нічний автобус?', 'То есть ночной автобус?', 'So a night bus?')]],
        feedback: t('Уточни маршрут: **Czyli potem tylko jedna stacja?**', 'Уточни маршрут: **Czyli potem tylko jedna stacja?**', 'Check the route: **Czyli potem tylko jedna stacja?**') },
      { npc: 'Tak, jedna stacja. Powodzenia!', tr: t('Так, одна станція. Успіхів!', 'Да, одна станция. Удачи!', 'Yes, one station. Good luck!'),
        choose: [['Dziękuję, bardzo mi pani pomogła!', t('Дякую, ви мені дуже допомогли!', 'Спасибо, вы мне очень помогли!', 'Thank you, you\'ve been a great help!')], ['Nie ma za co.', t('Нема за що.', 'Не за что.', 'You\'re welcome.')]],
        feedback: t('Тобі допомогли — подякуй: **bardzo mi pani pomogła**.', 'Тебе помогли — поблагодари: **bardzo mi pani pomogła**.', 'You were helped — say thanks: **bardzo mi pani pomogła**.') },
    ], { situation: true, scene: t('Вагон метро. Схоже, поїзд іде не в той бік, і пані поруч питає, чи потрібна допомога.', 'Вагон метро. Похоже, поезд идёт не в ту сторону, и рядом пани спрашивает, нужна ли помощь.', 'A metro car. It looks like the train is going the wrong way, and a woman nearby asks if you need help.') }),
    findError('grammar.locative', ['Wysiądź', 'na', 'stacja', 'Centrum'], 2, t('Вийди на станції Centrum.', 'Выйди на станции Centrum.', 'Get off at Centrum station.'),
      t('**na** + місцевий → **na stacji**.', '**na** + предложный → **na stacji**.', '**na** + locative → **na stacji**.')),
    oddOne('vocab.metro', ['wsiąść', 'wysiąść', 'przesiąść się', 'zjeść'], 3,
      t('Три — про поїздку, а **zjeść** — з\'їсти.', 'Три — о поездке, а **zjeść** — съесть.', 'Three are about riding; **zjeść** means to eat.')),
    build('grammar.metro', 'Wsiądź do metra w kierunku Młocin', t('Сідай у метро в напрямку Млоцин', 'Садись в метро в сторону Млоцин', 'Get on the metro towards Młociny'), ['Młociny', 'wsiadam']),
    wordOrder('grammar.metro', 'Przesiadka jest na stacji Świętokrzyska', t('Пересадка — на станції Świętokrzyska.', 'Пересадка — на станции Świętokrzyska.', 'The transfer is at Świętokrzyska station.')),
    translate('writing.metro', t('Де пересадка на M2?', 'Где пересадка на M2?', 'Where is the transfer to M2?'), ['Gdzie jest przesiadka na M2', 'Gdzie jest przesiadka na drugą linię']),
    speak('speaking.metro', 'Przepraszam, jak dojechać na Nowy Świat?', t('Перепрошую, як доїхати до Нового Світу?', 'Извините, как доехать до Нового Света?', 'Excuse me, how do I get to Nowy Świat?')),
  ],
};

const C4: LessonSeed = {
  slug: 'waw-c4-misja',
  title: t('Місія: з вокзалу на Старе Місто', 'Миссия: с вокзала в Старый город', 'Mission: from the station to the Old Town'),
  topic: t('Фінальна місія локації «Warszawa Centralna й транспорт»', 'Финальная миссия локации «Warszawa Centralna и транспорт»', 'Final mission of "Warszawa Centralna & transport"'),
  cefr: 'A1',
  difficulty: 3,
  explanation: t(
    'Фінальна місія локації. Аня чекає тебе на Замковій площі. Пройди з вокзалу до метро, купи квиток, зроби пересадку на Świętokrzyskiej і вийди на Нових Світах — далі пішки Krakowskim Przedmieściem.\nЗнадобиться: **Którędy do…?**, квитки на час, **wsiądź / wysiądź / przesiądź się**, **na stacji**, **w kierunku…**\nМаршрут навчальний — перед поїздкою перевір актуальну схему. Потрібно щонайменше 70% правильних відповідей.',
    'Финальная миссия локации. Аня ждёт тебя на Замковой площади. Пройди с вокзала к метро, купи билет, сделай пересадку на Świętokrzyskiej и выйди на Nowy Świat — дальше пешком по Krakowskie Przedmieście.\nПригодится: **Którędy do…?**, билеты на время, **wsiądź / wysiądź / przesiądź się**, **na stacji**, **w kierunku…**\nМаршрут учебный — перед поездкой проверь актуальную схему. Нужно не меньше 70% правильных ответов.',
    'The final mission. Ania is waiting at Castle Square. Get from the station to the metro, buy a ticket, change at Świętokrzyska and get off at Nowy Świat — then walk along Krakowskie Przedmieście.\nYou will need **Którędy do…?**, time tickets, **wsiądź / wysiądź / przesiądź się**, **na stacji**, **w kierunku…**\nThe route is a training example — check the current map before travelling. You need at least 70% correct answers.',
  ),
  examples: [{ pl: 'Na Świętokrzyskiej przesiądź się na M2 w kierunku Bródna.', tr: t('На Świętokrzyskiej пересядь на M2 у напрямку Брудна.', 'На Świętokrzyskiej пересядь на M2 в сторону Брудно.', 'At Świętokrzyska change to M2 towards Bródno.') }],
  words: [],
  exercises: [
    pictureChoice('vocab.transport', 'tramwaj', [
      ['🚋', t('трамвай', 'трамвай', 'tram')], ['🚌', t('автобус', 'автобус', 'bus')], ['🚇', t('метро', 'метро', 'metro')], ['🚕', t('таксі', 'такси', 'taxi')],
    ]),
    match('vocab.transport', [
      ['przejście podziemne', t('підземний перехід', 'подземный переход', 'underpass')],
      ['schody ruchome', t('ескалатор', 'эскалатор', 'escalator')],
      ['przesiadka', t('пересадка', 'пересадка', 'transfer')],
      ['strefa', t('зона', 'зона', 'zone')],
      ['wyjście', t('вихід', 'выход', 'exit')],
    ]),
    reading('reading.plan', PLAN, t('Скільки станцій треба проїхати на M1?', 'Сколько станций проехать на M1?', 'How many M1 stations do you ride?'),
      [t('Одну', 'Одну', 'One'), t('Дві', 'Две', 'Two'), t('Чотири', 'Четыре', 'Four')]),
    reading('reading.plan', PLAN, t('Куди йти після виходу з метро?', 'Куда идти после выхода из метро?', 'Where do you go after leaving the metro?'),
      [t('Krakowskim Przedmieściem на Замкову площу', 'По Krakowskie Przedmieście на Замковую площадь', 'Along Krakowskie Przedmieście to Castle Square'), t('Назад на вокзал', 'Назад на вокзал', 'Back to the station'), t('На нічний автобус', 'На ночной автобус', 'To a night bus')]),
    dialogue('situation.machine-buy', MACHINE, [
      { npc: 'Wybierz rodzaj biletu.', tr: t('Обери тип квитка.', 'Выбери тип билета.', 'Choose a ticket type.'),
        choose: [['Bilet 75-minutowy, normalny.', t('75-хвилинний, звичайний.', '75-минутный, обычный.', '75-minute, full fare.')], ['Bilet miesięczny do Krakowa.', t('Місячний до Кракова.', 'Месячный до Кракова.', 'A monthly ticket to Kraków.')]],
        feedback: t('Буде пересадка — потрібен квиток на час: **75-minutowy**.', 'Будет пересадка — нужен билет на время: **75-minutowy**.', 'There\'s a transfer — you need a time ticket: **75-minutowy**.') },
      { npc: 'Do zapłaty: 4,40 zł. Wybierz sposób płatności.', tr: t('До сплати: 4,40 zł. Обери спосіб оплати.', 'К оплате: 4,40 zł. Выбери способ оплаты.', 'To pay: 4.40 zł. Choose a payment method.'),
        choose: [['Kartą.', t('Карткою.', 'Картой.', 'By card.')], ['Na razie.', t('Бувай.', 'Пока.', 'See you.')]],
        feedback: t('Обери оплату: **kartą** або **gotówką**.', 'Выбери оплату: **kartą** или **gotówką**.', 'Choose: **kartą** or **gotówką**.') },
      { npc: 'Dziękujemy. Odbierz bilet.', tr: t('Дякуємо. Забери квиток.', 'Спасибо. Заберите билет.', 'Thank you. Take your ticket.') },
    ], { situation: true, scene: t('Місія, крок 1: автомат із квитками біля входу в метро Centrum.', 'Миссия, шаг 1: билетный автомат у входа в метро Centrum.', 'Mission, step 1: a ticket machine at the entrance to Centrum metro.') }),
    fillGap('grammar.where', 'Gdzie ___ wejście do metra?', ['jest', 'są', 'było'], t('Де вхід до метро?', 'Где вход в метро?', 'Where is the metro entrance?'),
      t('Один вхід → **jest**.', 'Один вход → **jest**.', 'One entrance → **jest**.')),
    listen('listening.metro', 'Stacja Świętokrzyska, przesiadka na linię M2', ['Stacja Świętokrzyska, przesiadka na linię M2', 'Stacja Świętokrzyska, przesiadka na linię M1', 'Stacja Centrum, przesiadka na linię M2']),
    fillGap('grammar.imperative', 'Na Świętokrzyskiej ___ z M1.', ['wysiądź', 'wysiadka', 'wysiąść'], t('На Świętokrzyskiej вийди з M1.', 'На Świętokrzyskiej выйди из M1.', 'At Świętokrzyska get off M1.'),
      t('Порада → наказовий: **wysiądź**.', 'Совет → повелительное: **wysiądź**.', 'Advice → imperative: **wysiądź**.')),
    wordChoice('vocab.metro', 'w kierunku Bródna', [t('у напрямку Брудна', 'в сторону Брудно', 'towards Bródno'), t('біля Брудна', 'возле Брудно', 'near Bródno'), t('з Брудна', 'из Брудно', 'from Bródno')]),
    dialogue('situation.wrong-way', ADAM, [
      { npc: 'Następna stacja: Politechnika.', tr: t('Наступна станція: Політехніка.', 'Следующая станция: Политехника.', 'Next station: Politechnika.'),
        choose: [['Ojej, chyba jadę w złą stronę!', t('Ой, здається, я їду не туди!', 'Ой, кажется, я еду не туда!', 'Oh no, I think I\'m going the wrong way!')], ['Super, jestem na miejscu!', t('Супер, я на місці!', 'Супер, я на месте!', 'Great, I\'m there!')]],
        feedback: t('Політехніка — на південь від Centrum, а тобі треба на північ, до Świętokrzyskiej. Ти їдеш не туди.', 'Политехника — к югу от Centrum, а тебе нужно на север, к Świętokrzyskiej. Ты едешь не туда.', 'Politechnika is south of Centrum; you need to go north to Świętokrzyska.') },
      { npc: 'Proszę wysiąść i wsiąść do pociągu w kierunku Młocin.', tr: t('Вийдіть і сядьте в потяг у напрямку Млоцин.', 'Выйдите и садитесь в поезд в сторону Млоцин.', 'Get off and take the train towards Młociny.'),
        choose: [['Dziękuję! Wysiadam na Politechnice.', t('Дякую! Виходжу на Політехніці.', 'Спасибо! Выхожу на Политехнике.', 'Thanks! I\'ll get off at Politechnika.')], ['Dziękuję, mam pięć lat.', t('Дякую, мені п\'ять років.', 'Спасибо, мне пять лет.', 'Thanks, I\'m five.')]],
        feedback: t('Скажи, що виходиш: **Wysiadam na Politechnice.**', 'Скажи, что выходишь: **Wysiadam na Politechnice.**', 'Say you\'re getting off: **Wysiadam na Politechnice.**') },
      { npc: 'Nie ma sprawy!', tr: t('Без проблем!', 'Без проблем!', 'No problem!') },
    ], { situation: true, scene: t('Місія, крок 2: ти в метро M1. Поруч стоїть уважний пасажир.', 'Миссия, шаг 2: ты в метро M1. Рядом стоит внимательный пассажир.', 'Mission, step 2: you\'re on M1. An attentive passenger stands nearby.') }),
    findError('grammar.metro', ['Przesiądź', 'się', 'na', 'M2', 'w', 'kierunek', 'Bródna'], 5, t('Пересядь на M2 у напрямку Брудна.', 'Пересядь на M2 в сторону Брудно.', 'Change to M2 towards Bródno.'),
      t('Сталий вираз: **w kierunku** + родовий.', 'Устойчивое выражение: **w kierunku** + родительный.', 'Fixed phrase: **w kierunku** + genitive.')),
    reverseChoice('vocab.station', t('Як пройти до виходу?', 'Как пройти к выходу?', 'Which way to the exit?'), ['Którędy do wyjścia?', 'Którędy do wejścia?', 'Kiedy jest wyjście?']),
    oddOne('vocab.transport', ['metro', 'tramwaj', 'autobus', 'pierogi'], 3,
      t('Три — транспорт, а **pierogi** — вареники.', 'Три — транспорт, а **pierogi** — вареники.', 'Three are transport; **pierogi** are dumplings.')),
    build('grammar.metro', 'Wysiądź na stacji Nowy Świat-Uniwersytet', t('Вийди на станції Nowy Świat-Uniwersytet', 'Выйди на станции Nowy Świat-Uniwersytet', 'Get off at Nowy Świat-Uniwersytet'), ['stacja', 'wsiądź']),
    wordOrder('grammar.metro', 'Idź Krakowskim Przedmieściem na plac Zamkowy', t('Іди Krakowskim Przedmieściem на Замкову площу.', 'Иди по Krakowskie Przedmieście на Замковую площадь.', 'Walk along Krakowskie Przedmieście to Castle Square.')),
    dialogue('situation.arrived', ANIA, [
      { npc: 'Halo! Gdzie jesteś?', tr: t('Алло! Де ти?', 'Алло! Где ты?', 'Hello! Where are you?'),
        choose: [['Jestem na placu Zamkowym, przy kolumnie.', t('Я на Замковій площі, біля колони.', 'Я на Замковой площади, у колонны.', 'I\'m at Castle Square, by the column.')], ['Jestem z Odessy.', t('Я з Одеси.', 'Я из Одессы.', 'I\'m from Odesa.')]],
        feedback: t('**Gdzie?** — місце: **na placu Zamkowym**.', '**Gdzie?** — место: **na placu Zamkowym**.', '**Gdzie?** asks for a place: **na placu Zamkowym**.') },
      { npc: 'Super, widzę cię! Idę!', tr: t('Супер, бачу тебе! Іду!', 'Супер, вижу тебя! Иду!', 'Great, I can see you! Coming!') },
    ], { situation: true, scene: t('Місія, крок 3: ти на місці й телефонуєш Ані.', 'Миссия, шаг 3: ты на месте и звонишь Ане.', 'Mission, step 3: you\'re there and call Ania.') }),
    listen('listening.metro', 'Proszę odsunąć się od krawędzi peronu', ['Proszę odsunąć się od krawędzi peronu', 'Proszę usiąść na peronie', 'Proszę kupić bilet na peronie']),
    fillGap('grammar.tickets', 'Bilet na 75 minut, ___, proszę.', ['normalny', 'normalna', 'normalne'], t('Квиток на 75 хвилин, звичайний, будь ласка.', 'Билет на 75 минут, обычный, пожалуйста.', 'A 75-minute ticket, full fare, please.'),
      t('**bilet** → **normalny**.', '**bilet** → **normalny**.', '**bilet** → **normalny**.')),
    translate('writing.metro', t('Сідай у метро в напрямку Млоцин.', 'Садись в метро в сторону Млоцин.', 'Get on the metro towards Młociny.'), ['Wsiądź do metra w kierunku Młocin']),
    dictation('writing.metro', 'Następna stacja Centrum', t('Наступна станція — Centrum', 'Следующая станция — Centrum', 'Next station: Centrum')),
    wordChoice('vocab.transport', 'autobus nocny', [t('нічний автобус', 'ночной автобус', 'night bus'), t('автобус на вокзал', 'автобус на вокзал', 'bus to the station'), t('туристичний автобус', 'туристический автобус', 'tour bus')]),
    speak('speaking.metro', 'Przepraszam, którędy do wyjścia na plac Zamkowy?', t('Перепрошую, як пройти до виходу на Замкову площу?', 'Извините, как пройти к выходу на Замковую площадь?', 'Excuse me, which way to the exit for Castle Square?')),
  ],
};

export const WAW_CENTRALNA_LESSONS: LessonSeed[] = [C1, C2, C3, C4];
