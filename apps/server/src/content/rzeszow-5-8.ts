/**
 * Rzeszów: уроки 5–8 (штраф і паркування, поліція, рекламація, місто й Долина авіації) й іспит міста. Уроки 1–4 і збірка міста — rzeszow.ts.
 */
import { t, wordChoice, fillGap, listen, findError, oddOne, reading, translate, grammar, build, match, speak, dialogue } from './builders';
import type { LessonSeed } from './types';

const POLICJANT = { name: 'Sierżant Nowak', emoji: '👮🏻', role: t('поліцейський', 'полицейский', 'a police officer') };
const POLICJANTKA = { name: 'Aspirant Kowalczyk', emoji: '👮🏼‍♀️', role: t('поліцейська', 'полицейская', 'a police officer') };
const SPRZEDAWCA = { name: 'Pan Robert', emoji: '🧑🏻‍💼', role: t('продавець у магазині електроніки', 'продавец в магазине электроники', 'an electronics shop assistant') };
const PRZEWODNIK = { name: 'Pan Tomasz', emoji: '🧔🏻', role: t('екскурсовод по Жешуву', 'экскурсовод по Жешуву', 'a Rzeszów tour guide') };
const MIEJSKA = { name: 'Pani Katarzyna', emoji: '👩🏼‍💼', role: t('працівниця міської управи', 'сотрудница городской управы', 'a city hall clerk') };

const RZE_5: LessonSeed = {
  slug: 'rze-5-mandat',
  title: t('Штраф і паркування', 'Штраф и парковка', 'Fines and parking'),
  topic: t(
    'Zostać ukarany mandatem; przekroczyć prędkość o + знахідний; nie zauważyłem znaku (родовий після заперечення); odwołać się od + родовий; parkomat, strefa płatnego parkowania',
    'Zostać ukarany mandatem; przekroczyć prędkość o + винительный; nie zauważyłem znaku (родительный после отрицания); odwołać się od + родительный; parkomat, strefa płatnego parkowania',
    'Zostać ukarany mandatem; przekroczyć prędkość o + accusative; nie zauważyłem znaku (genitive after negation); odwołać się od + genitive; parkomat, strefa płatnego parkowania',
  ),
  cefr: 'B2',
  difficulty: 4,
  explanation: t(
    '**Мета:** порозумітися при штрафі й з паркуванням та оскаржити рішення.\n**Mandat** — штраф. Зазвичай кажуть **dostałem mandat**; в офіційній мові — пасив: **zostałem ukarany mandatem** (**ukarać** + орудний) **w wysokości stu złotych** (**w wysokości** + родовий). Перевищити швидкість **o** + знахідний: **przekroczyłem prędkość o dwadzieścia kilometrów na godzinę**. За це дають **punkty karne**.\n**Заперечення вимагає родового**: **zauważyłem znak** → **nie zauważyłem znaku**. Оскаржити рішення: **odwołać się od** + родовий — **od tej decyzji**. У **strefie płatnego parkowania** квиток купують у **parkomacie** (**parkomat**), а мешканці беруть **abonament**.',
    '**Цель:** объясниться при штрафе и с парковкой и обжаловать решение.\n**Mandat** — штраф. Говорят **dostałem mandat**; в официальной речи — пассив: **zostałem ukarany mandatem** (**ukarać** + творительный) **w wysokości stu złotych** (**w wysokości** + родительный). Превысить скорость **o** + винительный: **przekroczyłem prędkość o dwadzieścia kilometrów na godzinę**. За это дают **punkty karne**.\n**Отрицание требует родительного**: **zauważyłem znak** → **nie zauważyłem znaku**. Обжаловать решение: **odwołać się od** + родительный — **od tej decyzji**. В **strefie płatnego parkowania** билет покупают в **parkomacie** (**parkomat**), а жители берут **abonament**.',
    '**Goal:** cope with a fine and with parking, and appeal a decision.\n**Mandat** means a fine. People say **dostałem mandat**; officially it is the passive: **zostałem ukarany mandatem** (**ukarać** + instrumental) **w wysokości stu złotych** (**w wysokości** + genitive). To exceed the speed limit **o** + accusative: **przekroczyłem prędkość o dwadzieścia kilometrów na godzinę**. You also get **punkty karne**.\n**Negation takes the genitive**: **zauważyłem znak** → **nie zauważyłem znaku**. To appeal: **odwołać się od** + genitive — **od tej decyzji**. In a **strefa płatnego parkowania** you buy a ticket at a **parkomat**, and residents buy an **abonament**.',
  ),
  examples: [
    { pl: 'Zostałem ukarany mandatem za przekroczenie prędkości o dwadzieścia kilometrów na godzinę.', tr: t('Мене покарали штрафом за перевищення швидкості на двадцять кілометрів на годину.', 'Меня оштрафовали за превышение скорости на двадцать километров в час.', 'I was fined for exceeding the speed limit by twenty kilometres an hour.') },
    { pl: 'W strefie płatnego parkowania bilet kupuje się w parkomacie.', tr: t('У зоні платного паркування квиток купують у паркоматі.', 'В зоне платной парковки билет покупают в паркомате.', 'In a paid parking zone you buy a ticket at the parking meter.') },
  ],
  words: ['punkty karne', 'przekroczyć', 'prędkość', 'odwołać się', 'parkomat', 'strefa płatnego parkowania', 'abonament'],
  exercises: [
    dialogue('dialogue.mandat', POLICJANT, [
      {
        npc: 'Przekroczył pan prędkość o trzydzieści kilometrów na godzinę. Poproszę prawo jazdy.',
        tr: t('Ви перевищили швидкість на тридцять кілометрів на годину. Прошу посвідчення водія.', 'Вы превысили скорость на тридцать километров в час. Предъявите права.', 'You exceeded the speed limit by thirty kilometres an hour. Your driving licence, please.'),
        choose: [
          ['Przepraszam, nie zauważyłem znaku ograniczenia prędkości.', t('Перепрошую, я не помітив знака обмеження швидкості.', 'Извините, я не заметил знака ограничения скорости.', 'Sorry, I didn’t notice the speed limit sign.')],
          ['Przepraszam, nie zauważyłem znak ograniczenia prędkości.', t('(після заперечення — родовий: **nie zauważyłem znaku**)', '(после отрицания — родительный: **nie zauważyłem znaku**)', '(after a negation use the genitive: **nie zauważyłem znaku**)')],
          ['Przepraszam, nie zauważam znaku ograniczenia prędkości.', t('(подія вже сталася — минулий час: **nie zauważyłem**)', '(событие уже произошло — прошедшее время: **nie zauważyłem**)', '(it has already happened — the past tense: **nie zauważyłem**)')],
        ],
        feedback: t('Після заперечення — родовий: **nie zauważyłem znaku**.', 'После отрицания — родительный: **nie zauważyłem znaku**.', 'After a negation — the genitive: **nie zauważyłem znaku**.'),
      },
      {
        npc: 'Dostanie pan mandat w wysokości stu złotych i dwa punkty karne.',
        tr: t('Ви отримаєте штраф у розмірі ста злотих і два штрафні бали.', 'Вы получите штраф в размере ста злотых и два штрафных балла.', 'You will get a fine of one hundred zloty and two penalty points.'),
        choose: [
          ['Rozumiem. Czy mogę się odwołać od tej decyzji?', t('Розумію. Чи можу я оскаржити це рішення?', 'Понимаю. Могу ли я обжаловать это решение?', 'I understand. May I appeal against this decision?')],
          ['Rozumiem. Czy mogę się odwołać z tej decyzji?', t('(**odwołać się od** + родовий)', '(**odwołać się od** + родительный)', '(**odwołać się od** + genitive)')],
          ['Rozumiem. Czy mogę odwołać od tej decyzji?', t('(**odwołać się** — зворотне: потрібне **się**)', '(**odwołać się** — возвратное: нужно **się**)', '(**odwołać się** is reflexive: it needs **się**)')],
        ],
        feedback: t('**odwołać się od** + родовий.', '**odwołać się od** + родительный.', '**odwołać się od** + genitive.'),
      },
    ]),
    wordChoice('vocab.mandat', 'punkty karne', [t('штрафні бали', 'штрафные баллы', 'penalty points'), t('бали за екзамен', 'баллы за экзамен', 'exam points'), t('бонусні бали', 'бонусные баллы', 'bonus points')]),
    fillGap('grammar.mandat', 'Zostałem ukarany mandatem za przekroczenie ___.', ['prędkości', 'prędkość', 'prędkością'], t('Мене покарали штрафом за перевищення швидкості.', 'Меня оштрафовали за превышение скорости.', 'I was fined for exceeding the speed limit.'),
      t('Після іменника від дієслова **przekroczenie** — родовий: **przekroczenie prędkości**.', 'После существительного от глагола **przekroczenie** — родительный: **przekroczenie prędkości**.', 'After the verbal noun **przekroczenie** use the genitive: **przekroczenie prędkości**.')),
    match('vocab.mandat', [
      ['przekroczyć prędkość', t('перевищити швидкість', 'превысить скорость', 'to exceed the speed limit')],
      ['parkomat', t('паркомат', 'паркомат', 'parking meter')],
      ['strefa płatnego parkowania', t('зона платного паркування', 'зона платной парковки', 'paid parking zone')],
      ['odwołać się', t('оскаржити', 'обжаловать', 'to appeal')],
    ]),
    grammar('grammar.mandat', 'Dostałem mandat w wysokości ___ złotych.', 'sto', ['stu'], t('Я отримав штраф у розмірі ста злотих.', 'Я получил штраф в размере ста злотых.', 'I got a fine of one hundred zloty.'),
      t('**w wysokości** + родовий: **stu złotych**.', '**w wysokości** + родительный: **stu złotych**.', '**w wysokości** + genitive: **stu złotych**.')),
    listen('listening.mandat', 'Przekroczyłem prędkość o dwadzieścia kilometrów na godzinę.', ['Przekroczyłem prędkość o dwadzieścia kilometrów na godzinę.', 'Przekroczyłem prędkość o dwanaście kilometrów na godzinę.', 'Przekroczyłem prędkość o dwadzieścia pięć kilometrów na godzinę.']),
    reading('reading.mandat', 'W strefie płatnego parkowania obowiązuje opłata od poniedziałku do piątku w godzinach 8:00–18:00. Bilet kupuje się w parkomacie albo w aplikacji w telefonie. Mieszkańcy centrum mogą wykupić abonament, który jest tańszy niż płacenie za każdy postój. Kto nie zapłaci, otrzymuje wezwanie do uiszczenia opłaty dodatkowej; można się od niego odwołać w ciągu czternastu dni.',
      t('Коли діє платне паркування?', 'Когда действует платная парковка?', 'When is parking charged?'),
      [t('з понеділка по п’ятницю, 8:00–18:00', 'с понедельника по пятницу, 8:00–18:00', 'Monday to Friday, 8 a.m.–6 p.m.'), t('щодня, 8:00–20:00', 'ежедневно, 8:00–20:00', 'every day, 8 a.m.–8 p.m.'), t('лише у вихідні, 8:00–18:00', 'только по выходным, 8:00–18:00', 'weekends only, 8 a.m.–6 p.m.')]),
    findError('grammar.mandat', ['Kierowca', 'przekroczył', 'prędkość', 'z', 'czterdzieści', 'kilometrów', 'na', 'godzinę'], 3, t('Водій перевищив швидкість на сорок кілометрів на годину.', 'Водитель превысил скорость на сорок километров в час.', 'The driver exceeded the speed limit by forty kilometres an hour.'),
      t('Перевищити швидкість **o** + знахідний: **o czterdzieści kilometrów**.', 'Превысить скорость **o** + винительный: **o czterdzieści kilometrów**.', 'To exceed the limit **o** + accusative: **o czterdzieści kilometrów**.')),
    build('grammar.mandat', 'Mieszkańcy centrum mogą wykupić abonament', t('Мешканці центру можуть придбати абонемент', 'Жители центра могут купить абонемент', 'Residents of the centre can buy a season permit'), ['abonamentu', 'muszą']),
    oddOne('grammar.mandat', ['ukarać mandatem', 'ukarać grzywną', 'ukarać upomnieniem', 'ukarać mandat'], 3,
      t('**Ukarać** + орудний: **ukarać mandatem**.', '**Ukarać** + творительный: **ukarać mandatem**.', '**Ukarać** + instrumental: **ukarać mandatem**.'),
      t('Яке словосполучення неправильне?', 'Какое словосочетание неправильное?', 'Which phrase is wrong?')),
    translate('writing.mandat', t('Мене покарали штрафом за перевищення швидкості. Чи можу я оскаржити це рішення?', 'Меня оштрафовали за превышение скорости. Могу ли я обжаловать это решение?', 'I was fined for speeding. May I appeal against this decision?'),
      ['Zostałem ukarany mandatem za przekroczenie prędkości. Czy mogę się odwołać od tej decyzji?', 'Zostałem ukarany mandatem za przekroczenie prędkości. Czy mogę odwołać się od tej decyzji?', 'Dostałem mandat za przekroczenie prędkości. Czy mogę się odwołać od tej decyzji?', 'Dostałem mandat za przekroczenie prędkości. Czy mogę odwołać się od tej decyzji?']),
    speak('speaking.mandat', 'W strefie płatnego parkowania bilet kupuje się w parkomacie.', t('У зоні платного паркування квиток купують у паркоматі.', 'В зоне платной парковки билет покупают в паркомате.', 'In a paid parking zone you buy a ticket at the parking meter.')),
  ],
};

const RZE_6: LessonSeed = {
  slug: 'rze-6-policja',
  title: t('Поліція й екстрена допомога', 'Полиция и экстренная помощь', 'The police and emergencies'),
  topic: t(
    'Skradziono mi portfel (безособове -no + давальний); zgłosić kradzież; nie widziałem żadnego… (родовий після заперечення); gdyby ktoś coś widział; numery 112, 997, 998, 999',
    'Skradziono mi portfel (безличное -no + дательный); zgłosić kradzież; nie widziałem żadnego… (родительный после отрицания); gdyby ktoś coś widział; номера 112, 997, 998, 999',
    'Skradziono mi portfel (impersonal -no + dative); zgłosić kradzież; nie widziałem żadnego… (genitive after negation); gdyby ktoś coś widział; numbers 112, 997, 998, 999',
  ),
  cefr: 'B2',
  difficulty: 4,
  explanation: t(
    '**Мета:** заявити про крадіжку чи пригоду й викликати допомогу.\nНомери: **112** — єдиний номер для всіх служб, **997** — поліція, **998** — пожежна служба (**straż pożarna**), **999** — швидка допомога.\nЯк розповісти: **Skradziono mi portfel** — безособова форма на **-no** (хто вкрав — невідомо), особа, якої стосується, — у **давальному** (**mi**), об’єкт — у знахідному (**portfel**). Подібно: **włamano się do mieszkania**. **Zgłosić kradzież** — заявити про крадіжку; поліцейський спише **protokół**; ти — **poszkodowany** (потерпілий), а той, хто бачив, — **świadek**.\nПісля заперечення — родовий: **nie widziałem żadnego wypadku**. Прохання до свідків: **Gdyby ktoś coś widział, proszę zadzwonić** (**gdyby** + минулий час).',
    '**Цель:** заявить о краже или происшествии и вызвать помощь.\nНомера: **112** — единый номер для всех служб, **997** — полиция, **998** — пожарная служба (**straż pożarna**), **999** — скорая помощь.\nКак рассказать: **Skradziono mi portfel** — безличная форма на **-no** (кто украл — неизвестно), касающееся тебя лицо — в **дательном** (**mi**), объект — в винительном (**portfel**). Похоже: **włamano się do mieszkania**. **Zgłosić kradzież** — заявить о краже; полицейский составит **protokół**; ты — **poszkodowany** (пострадавший), а тот, кто видел, — **świadek**.\nПосле отрицания — родительный: **nie widziałem żadnego wypadku**. Просьба к свидетелям: **Gdyby ktoś coś widział, proszę zadzwonić** (**gdyby** + прошедшее время).',
    '**Goal:** report a theft or an incident and call for help.\nNumbers: **112** is the single number for all services, **997** the police, **998** the fire brigade (**straż pożarna**), **999** the ambulance.\nHow to say it: **Skradziono mi portfel** — an impersonal **-no** form (the thief is unknown), the person affected is in the **dative** (**mi**), the object is accusative (**portfel**). Similar: **włamano się do mieszkania**. **Zgłosić kradzież** — to report a theft; the officer writes up a **protokół**; you are the **poszkodowany** (victim) and anyone who saw it is a **świadek**.\nAfter a negation — the genitive: **nie widziałem żadnego wypadku**. A call for witnesses: **Gdyby ktoś coś widział, proszę zadzwonić** (**gdyby** + the past-tense form).',
  ),
  examples: [
    { pl: 'Skradziono mi portfel w autobusie, chcę zgłosić kradzież.', tr: t('У мене вкрали гаманець в автобусі, я хочу заявити про крадіжку.', 'У меня украли кошелёк в автобусе, я хочу заявить о краже.', 'My wallet was stolen on the bus, I want to report the theft.') },
    { pl: 'Gdyby ktoś coś widział, proszę zadzwonić pod numer 997.', tr: t('Якби хтось щось бачив, прошу зателефонувати за номером 997.', 'Если кто-то что-то видел, просим позвонить по номеру 997.', 'If anyone saw anything, please call 997.') },
  ],
  words: ['kradzież', 'zgłosić', 'świadek', 'protokół', 'poszkodowany', 'straż pożarna'],
  exercises: [
    dialogue('dialogue.policja', POLICJANTKA, [
      {
        npc: 'Dzień dobry. Co się stało?',
        tr: t('Добрий день. Що сталося?', 'Добрый день. Что случилось?', 'Good morning. What happened?'),
        choose: [
          ['Skradziono mi portfel w autobusie. Chcę zgłosić kradzież.', t('У мене вкрали гаманець в автобусі. Я хочу заявити про крадіжку.', 'У меня украли кошелёк в автобусе. Я хочу заявить о краже.', 'My wallet was stolen on the bus. I want to report the theft.')],
          ['Skradziono mnie portfel w autobusie. Chcę zgłosić kradzież.', t('(кому? — давальний: **mi**)', '(кому? — дательный: **mi**)', '(to whom? — the dative **mi**)')],
          ['Skradziono mi portfela w autobusie. Chcę zgłosić kradzież.', t('(об’єкт після **skradziono** — знахідний: **portfel**)', '(объект после **skradziono** — винительный: **portfel**)', '(the object after **skradziono** is accusative: **portfel**)')],
        ],
        feedback: t('**skradziono** + давальний (**mi**) + знахідний (**portfel**).', '**skradziono** + дательный (**mi**) + винительный (**portfel**).', '**skradziono** + dative (**mi**) + accusative (**portfel**).'),
      },
      {
        npc: 'Czy widział pan sprawcę?',
        tr: t('Чи бачили ви того, хто це зробив?', 'Вы видели того, кто это сделал?', 'Did you see the perpetrator?'),
        choose: [
          ['Nie, nie widziałem żadnego podejrzanego.', t('Ні, я не бачив жодного підозрюваного.', 'Нет, я не видел ни одного подозрительного.', 'No, I didn’t see anyone suspicious.')],
          ['Nie, nie widziałem żadnego podejrzany.', t('(після заперечення — родовий: **żadnego podejrzanego**)', '(после отрицания — родительный: **żadnego podejrzanego**)', '(after a negation use the genitive: **żadnego podejrzanego**)')],
          ['Nie, nie widzę żadnego podejrzanego.', t('(подія була в минулому — **nie widziałem**)', '(событие было в прошлом — **nie widziałem**)', '(it happened in the past — **nie widziałem**)')],
        ],
        feedback: t('Після заперечення — родовий; про минуле — **widziałem**.', 'После отрицания — родительный; о прошлом — **widziałem**.', 'After a negation — the genitive; about the past — **widziałem**.'),
      },
    ]),
    wordChoice('vocab.policja', 'poszkodowany', [t('потерпілий', 'пострадавший', 'victim'), t('підозрюваний', 'подозреваемый', 'suspect'), t('свідок', 'свидетель', 'witness')]),
    fillGap('grammar.policja', 'Policjant spisał ___ zgłoszenia.', ['protokół', 'protokołu', 'protokołem'], t('Поліцейський склав протокол заяви.', 'Полицейский составил протокол заявления.', 'The police officer wrote up a record of the report.'),
      t('**spisać** + знахідний: **protokół**.', '**spisać** + винительный: **protokół**.', '**spisać** takes the accusative: **protokół**.')),
    match('vocab.policja', [
      ['kradzież', t('крадіжка', 'кража', 'theft')],
      ['świadek', t('свідок', 'свидетель', 'witness')],
      ['poszkodowany', t('потерпілий', 'пострадавший', 'victim')],
      ['straż pożarna', t('пожежна служба', 'пожарная служба', 'fire brigade')],
    ]),
    grammar('grammar.policja', 'Nie widziałem ___ wypadku.', 'żaden', ['żadnego'], t('Я не бачив жодної аварії.', 'Я не видел ни одной аварии.', 'I did not see any accident.'),
      t('Після заперечення — родовий: **żadnego wypadku**.', 'После отрицания — родительный: **żadnego wypadku**.', 'After a negation — the genitive: **żadnego wypadku**.')),
    listen('listening.policja', 'Skradziono mi portfel w autobusie numer dziesięć.', ['Skradziono mi portfel w autobusie numer dziesięć.', 'Skradziono mi portfel w autobusie numer dwanaście.', 'Skradziono mi plecak w autobusie numer dziesięć.']),
    reading('reading.policja', 'Komenda Miejska Policji w Rzeszowie prosi o pomoc. W nocy z soboty na niedzielę włamano się do kilku samochodów zaparkowanych przy jednej ulicy. Skradziono radia i torby. Gdyby ktoś widział coś podejrzanego, prosimy o kontakt pod numerem 997 lub 112. Świadkowie mogą pozostać anonimowi.',
      t('Що вкрали з автомобілів?', 'Что украли из автомобилей?', 'What was stolen from the cars?'),
      [t('радіоприймачі й сумки', 'радиоприёмники и сумки', 'radios and bags'), t('колеса й акумулятори', 'колёса и аккумуляторы', 'wheels and batteries'), t('документи й ключі', 'документы и ключи', 'documents and keys')]),
    findError('grammar.policja', ['Skradziono', 'mi', 'portfela', 'w', 'autobusie'], 2, t('У мене вкрали гаманець в автобусі.', 'У меня украли кошелёк в автобусе.', 'My wallet was stolen on the bus.'),
      t('Безособове **-no** + знахідний: **portfel**.', 'Безличное **-no** + винительный: **portfel**.', 'The impersonal **-no** takes the accusative: **portfel**.')),
    build('grammar.policja', 'Chcę zgłosić kradzież roweru', t('Я хочу заявити про крадіжку велосипеда', 'Я хочу заявить о краже велосипеда', 'I want to report the theft of a bicycle'), ['zgłoszę', 'rower']),
    oddOne('grammar.policja', ['999 — pogotowie ratunkowe', '998 — straż pożarna', '112 — numer alarmowy', '997 — straż pożarna'], 3,
      t('**997** — поліція; пожежна служба — **998**.', '**997** — полиция; пожарная служба — **998**.', '**997** is the police; the fire brigade is **998**.'),
      t('Яке твердження неправильне?', 'Какое утверждение неправильное?', 'Which statement is wrong?')),
    translate('writing.policja', t('У мене вкрали гаманець. Я хочу заявити про крадіжку.', 'У меня украли кошелёк. Я хочу заявить о краже.', 'My wallet was stolen. I want to report the theft.'),
      ['Skradziono mi portfel. Chcę zgłosić kradzież.', 'Ukradziono mi portfel. Chcę zgłosić kradzież.', 'Skradziono mi portfel. Chciałbym zgłosić kradzież.', 'Ukradziono mi portfel. Chciałbym zgłosić kradzież.', 'Skradziono mi portfel. Chciałabym zgłosić kradzież.', 'Ukradziono mi portfel. Chciałabym zgłosić kradzież.']),
    speak('speaking.policja', 'Skradziono mi portfel w autobusie i chcę zgłosić kradzież.', t('У мене вкрали гаманець в автобусі, і я хочу заявити про крадіжку.', 'У меня украли кошелёк в автобусе, и я хочу заявить о краже.', 'My wallet was stolen on the bus and I want to report the theft.')),
  ],
};

const RZE_7: LessonSeed = {
  slug: 'rze-7-reklamacja',
  title: t('Рекламація й права споживача', 'Рекламация и права потребителя', 'Complaints and consumer rights'),
  topic: t(
    'Reklamować towar z wadą; rękojmia i gwarancja; odstąpić od umowy w ciągu czternastu dni; gdyby + минулий час: gdyby miał wadę, mógłbym…; chyba że, o ile',
    'Reklamować towar z wadą; rękojmia i gwarancja; odstąpić od umowy w ciągu czternastu dni; gdyby + прошедшее время: gdyby miał wadę, mógłbym…; chyba że, o ile',
    'Reklamować towar z wadą; rękojmia and gwarancja; odstąpić od umowy w ciągu czternastu dni; gdyby + the past form: gdyby miał wadę, mógłbym…; chyba że, o ile',
  ),
  cefr: 'B2',
  difficulty: 5,
  explanation: t(
    '**Мета:** подати рекламацію, повернути товар і говорити умовно.\nЯкщо товар має **wadę** (дефект), покупець може його **reklamować**: у Польщі продавець відповідає за вади за **rękojmią** — це закон, він діє два роки; **gwarancja** — добровільна обіцянка виробника чи продавця. Купівлю в інтернеті можна **odstąpić od umowy** в межах чотирнадцяти днів без пояснень; **zwrot** грошей — теж у межах чотирнадцяти днів.\n**Умовний спосіб.** **Gdyby** + форма минулого часу, а в головному реченні — умовне **-by-**: **Gdyby towar miał wadę, mógłbym go zareklamować.** Двічі **-by** не ставимо (**gdyby miał**, а не ~~gdyby miałby~~). **Chyba że** — «хіба що»: **zwrot jest możliwy, chyba że towar został zniszczony**. **O ile** — «за умови, що».',
    '**Цель:** подать рекламацию, вернуть товар и говорить об условиях.\nЕсли товар имеет **wadę** (дефект), покупатель может его **reklamować**: в Польше продавец отвечает за недостатки по **rękojmi** — это закон, он действует два года; **gwarancja** — добровольное обещание производителя или продавца. Покупку в интернете можно **odstąpić od umowy** в течение четырнадцати дней без объяснений; **zwrot** денег — тоже в течение четырнадцати дней.\n**Условное наклонение.** **Gdyby** + форма прошедшего времени, а в главном предложении — условное **-by-**: **Gdyby towar miał wadę, mógłbym go zareklamować.** Дважды **-by** не ставят (**gdyby miał**, а не ~~gdyby miałby~~). **Chyba że** — «разве что»: **zwrot jest możliwy, chyba że towar został zniszczony**. **O ile** — «при условии, что».',
    '**Goal:** make a complaint, return goods and talk about conditions.\nIf goods have a **wada** (defect), the buyer can **reklamować** them: in Poland the seller is liable for defects under the **rękojmia** — it is statutory and lasts two years; a **gwarancja** is a voluntary promise by the maker or seller. A purchase made online can be withdrawn from (**odstąpić od umowy**) within fourteen days without a reason; the **zwrot** of the money also takes up to fourteen days.\n**The conditional.** **Gdyby** + the past-tense form, and the main clause carries the conditional **-by-**: **Gdyby towar miał wadę, mógłbym go zareklamować.** We do not use **-by** twice (**gdyby miał**, not ~~gdyby miałby~~). **Chyba że** means “unless”: **zwrot jest możliwy, chyba że towar został zniszczony**. **O ile** means “provided that”.',
  ),
  examples: [
    { pl: 'Gdyby towar miał wadę, mógłbym go zareklamować.', tr: t('Якби товар мав дефект, я міг би подати рекламацію.', 'Если бы у товара был дефект, я мог бы подать рекламацию.', 'If the goods had a defect, I could make a complaint.') },
    { pl: 'Zwrot jest możliwy w ciągu czternastu dni, chyba że towar został zniszczony.', tr: t('Повернення можливе протягом чотирнадцяти днів, хіба що товар зіпсовано.', 'Возврат возможен в течение четырнадцати дней, разве что товар испорчен.', 'A return is possible within fourteen days unless the goods have been destroyed.') },
  ],
  words: ['zwrot', 'rękojmia', 'odstąpić od umowy', 'wada', 'reklamować', 'konsument'],
  exercises: [
    dialogue('dialogue.reklamacja', SPRZEDAWCA, [
      {
        npc: 'Dzień dobry. W czym mogę pomóc?',
        tr: t('Добрий день. Чим можу допомогти?', 'Добрый день. Чем могу помочь?', 'Good morning. How can I help?'),
        choose: [
          ['Dzień dobry. Kupiłem u państwa telefon, który ma wadę. Chciałbym go zareklamować.', t('Добрий день. Я купив у вас телефон, який має дефект. Я хотів би подати на нього рекламацію.', 'Добрый день. Я купил у вас телефон, у которого дефект. Я хотел бы подать на него рекламацию.', 'Hello. I bought a phone from you and it has a defect. I’d like to make a complaint.')],
          ['Dzień dobry. Kupiłem u państwa telefon, która ma wadę. Chciałbym go zareklamować.', t('(**telefon** — чоловічий рід: **który**)', '(**telefon** — мужской род: **który**)', '(**telefon** is masculine: **który**)')],
          ['Dzień dobry. Kupiłem u państwa telefon, który ma wadę. Chciałbym go zareklamuję.', t('(**chciałbym** + інфінітив: **zareklamować**)', '(**chciałbym** + инфинитив: **zareklamować**)', '(**chciałbym** + infinitive: **zareklamować**)')],
        ],
        feedback: t('Рід відносного займенника — за іменником: **telefon … który**; **chciałbym** + інфінітив.', 'Род относительного местоимения — по существительному: **telefon … który**; **chciałbym** + инфинитив.', 'The relative pronoun agrees with the noun: **telefon … który**; **chciałbym** + infinitive.'),
      },
      {
        npc: 'Czy telefon był używany?',
        tr: t('Телефоном користувалися?', 'Телефоном пользовались?', 'Has the phone been used?'),
        choose: [
          ['Tak, używałem go dwa miesiące, ale wada pojawiła się od razu.', t('Так, я користувався ним два місяці, але вада з’явилася одразу.', 'Да, я пользовался им два месяца, но дефект появился сразу.', 'Yes, I used it for two months, but the defect appeared right away.')],
          ['Tak, używam go dwa miesiące, ale wada pojawiła się od razu.', t('(мова про минуле — **używałem**)', '(речь о прошлом — **używałem**)', '(this is about the past — **używałem**)')],
          ['Tak, używałem go dwa miesiące, ale wada pojawi się od razu.', t('(вада вже з’явилася — минулий час: **pojawiła się**)', '(дефект уже появился — прошедшее время: **pojawiła się**)', '(the defect has already appeared — the past tense: **pojawiła się**)')],
        ],
        feedback: t('Увесь розповідь — про минуле: **używałem … pojawiła się**.', 'Весь рассказ — о прошлом: **używałem … pojawiła się**.', 'The whole account is in the past: **używałem … pojawiła się**.'),
      },
    ]),
    wordChoice('vocab.reklamacja', 'rękojmia', [t('відповідальність продавця за вади товару за законом', 'ответственность продавца за недостатки товара по закону', 'the seller’s statutory liability for defects'), t('добровільна гарантія виробника', 'добровольная гарантия производителя', 'the manufacturer’s voluntary guarantee'), t('повернення грошей за квиток', 'возврат денег за билет', 'a ticket refund')]),
    fillGap('grammar.reklamacja', 'Zwrot jest możliwy, ___ towar został zniszczony.', ['chyba że', 'chociaż', 'ponieważ'], t('Повернення можливе, хіба що товар зіпсовано.', 'Возврат возможен, разве что товар испорчен.', 'A return is possible unless the goods have been destroyed.'),
      t('**Chyba że** — «хіба що» (виняток).', '**Chyba że** — «разве что» (исключение).', '**Chyba że** means “unless” (an exception).')),
    match('vocab.reklamacja', [
      ['zwrot towaru', t('повернення товару', 'возврат товара', 'returning goods')],
      ['rękojmia', t('відповідальність продавця за вади', 'ответственность продавца за недостатки', 'seller’s liability for defects')],
      ['odstąpić od umowy', t('відмовитися від договору', 'отказаться от договора', 'to withdraw from a contract')],
      ['wada', t('вада, дефект', 'дефект, недостаток', 'defect')],
    ]),
    grammar('grammar.reklamacja', 'Gdyby telefon ___ wadę, mógłbym go zareklamować.', 'mieć', ['miał'], t('Якби телефон мав дефект, я міг би подати рекламацію.', 'Если бы у телефона был дефект, я мог бы подать рекламацию.', 'If the phone had a defect, I could make a complaint.'),
      t('**Gdyby** + форма минулого часу: **miał**.', '**Gdyby** + форма прошедшего времени: **miał**.', '**Gdyby** + the past-tense form: **miał**.')),
    listen('listening.reklamacja', 'Zwrot towaru jest możliwy w ciągu czternastu dni.', ['Zwrot towaru jest możliwy w ciągu czternastu dni.', 'Zwrot towaru jest możliwy w ciągu czterdziestu dni.', 'Zwrot towaru jest możliwy w ciągu czterech dni.']),
    reading('reading.reklamacja', 'Jeśli kupiłeś towar przez internet, możesz odstąpić od umowy w ciągu czternastu dni bez podawania przyczyny. Sprzedawca zwraca pieniądze w ciągu czternastu dni od otrzymania oświadczenia, ale koszt odesłania towaru zwykle ponosi kupujący. Jeśli towar ma wadę, możesz go reklamować na podstawie rękojmi przez dwa lata od zakupu. Gwarancja jest dobrowolna i zależy od producenta.',
      t('Хто зазвичай платить за відправлення товару назад при відмові від договору?', 'Кто обычно платит за отправку товара обратно при отказе от договора?', 'Who usually pays for sending the goods back when you withdraw from the contract?'),
      [t('покупець', 'покупатель', 'the buyer'), t('продавець', 'продавец', 'the seller'), t('кур’єрська служба', 'курьерская служба', 'the courier company')]),
    findError('grammar.reklamacja', ['Mogę', 'odstąpić', 'z', 'umowy', 'w', 'ciągu', 'czternastu', 'dni'], 2, t('Я можу відмовитися від договору протягом чотирнадцяти днів.', 'Я могу отказаться от договора в течение четырнадцати дней.', 'I can withdraw from the contract within fourteen days.'),
      t('**Odstąpić od** + родовий: **od umowy**.', '**Odstąpić od** + родительный: **od umowy**.', '**Odstąpić od** + genitive: **od umowy**.')),
    build('grammar.reklamacja', 'Zwrot jest możliwy w ciągu czternastu dni', t('Повернення можливе протягом чотирнадцяти днів', 'Возврат возможен в течение четырнадцати дней', 'A return is possible within fourteen days'), ['czternaście', 'dniach']),
    oddOne('grammar.reklamacja', ['rękojmia — odpowiada sprzedawca', 'gwarancja — daje producent lub sprzedawca', 'odstąpienie od umowy — w ciągu czternastu dni', 'rękojmia — jest dobrowolna'], 3,
      t('**Rękojmia** wynika z ustawy i jest obowiązkowa; dobrowolna jest **gwarancja**.', '**Rękojmia** вытекает из закона и обязательна; добровольна **gwarancja**.', '**Rękojmia** comes from the law and is mandatory; **gwarancja** is the voluntary one.'),
      t('Яке твердження неправильне?', 'Какое утверждение неправильное?', 'Which statement is wrong?')),
    translate('writing.reklamacja', t('Якби я знав про дефект, я б не купив цей телефон.', 'Если бы я знал о дефекте, я бы не купил этот телефон.', 'If I had known about the defect I would not have bought this phone.'),
      ['Gdybym wiedział o wadzie, nie kupiłbym tego telefonu.', 'Gdybym wiedział o wadzie, nie kupiłbym tego telefonu', 'Gdybym wiedziała o wadzie, nie kupiłabym tego telefonu.', 'Gdybym wiedziała o wadzie, nie kupiłabym tego telefonu']),
    speak('speaking.reklamacja', 'Chcę zareklamować telefon, który ma wadę fabryczną.', t('Я хочу подати рекламацію на телефон із заводським дефектом.', 'Я хочу подать рекламацию на телефон с заводским дефектом.', 'I want to make a complaint about a phone with a factory defect.')),
  ],
};

const RZE_8: LessonSeed = {
  slug: 'rze-8-rzeszow',
  title: t('Жешув: авіація й підземелля', 'Жешув: авиация и подземелья', 'Rzeszów: aviation and cellars'),
  topic: t(
    'Dolina Lotnicza, Podziemna Trasa; zdania względne: miasto, w którym…; trasa, która…; położony nad, znany z + родовий',
    'Dolina Lotnicza, Podziemna Trasa; придаточные определительные: miasto, w którym…; trasa, która…; położony nad, znany z + родительный',
    'Dolina Lotnicza, Podziemna Trasa; relative clauses: miasto, w którym…; trasa, która…; położony nad, znany z + genitive',
  ),
  cefr: 'B2',
  difficulty: 4,
  explanation: t(
    '**Мета:** розповісти про місто складними реченнями й зрозуміти туристичний текст.\n**Rzeszów** лежить **nad rzeką Wisłok**; регіон називають **Doliną Lotniczą** — тут з довоєнних часів діють авіаційні заводи; місто відоме **z przemysłu lotniczego** (**znany z** + родовий) і вважається **innowacyjnym**. Під ринком проходить **Podziemna Trasa Turystyczna** — маршрут старими **piwnicami** кам’яниць.\n**Відносні речення** з **który / która / które**: рід і число — за іменником, відмінок — за роллю в підрядному: **miasto, w którym mieszkam** (**w** + місцевий), **trasa, która prowadzi pod rynkiem** (підмет — називний), **piwnice, w których dawniej przechowywano towary**. Дієприкметники **położony** і **znany** узгоджуються з іменником: **miasto jest położone**, **trasa jest znana**.',
    '**Цель:** рассказать о городе сложными предложениями и понять туристический текст.\n**Rzeszów** лежит **nad rzeką Wisłok**; регион называют **Doliną Lotniczą** — здесь с довоенных времён работают авиационные заводы; город известен **z przemysłu lotniczego** (**znany z** + родительный) и считается **innowacyjnym**. Под рынком проходит **Podziemna Trasa Turystyczna** — маршрут по старым **piwnicom** каменных домов.\n**Определительные предложения** с **który / która / które**: род и число — по существительному, падеж — по роли в придаточном: **miasto, w którym mieszkam** (**w** + предложный), **trasa, która prowadzi pod rynkiem** (подлежащее — именительный), **piwnice, w których dawniej przechowywano towary**. Причастия **położony** и **znany** согласуются с существительным: **miasto jest położone**, **trasa jest znana**.',
    '**Goal:** talk about the city in complex sentences and understand a tourist text.\n**Rzeszów** lies **nad rzeką Wisłok**; the region is called the **Dolina Lotnicza** (Aviation Valley) — aircraft plants have worked here since before the war; the city is **znany z przemysłu lotniczego** (**znany z** + genitive) and counts as **innowacyjny**. Under the market square runs the **Podziemna Trasa Turystyczna** — a route through the old **piwnice** of the townhouses.\n**Relative clauses** with **który / która / które**: gender and number follow the noun, the case follows the role in the clause: **miasto, w którym mieszkam** (**w** + locative), **trasa, która prowadzi pod rynkiem** (subject — nominative), **piwnice, w których dawniej przechowywano towary**. The participles **położony** and **znany** agree with the noun: **miasto jest położone**, **trasa jest znana**.',
  ),
  examples: [
    { pl: 'Rzeszów, położony nad rzeką Wisłok, jest znany z przemysłu lotniczego.', tr: t('Жешув, розташований на річці Віслок, відомий авіаційною промисловістю.', 'Жешув, расположенный на реке Вислок, известен авиационной промышленностью.', 'Rzeszów, situated on the Wisłok river, is known for its aviation industry.') },
    { pl: 'Trasa, która prowadzi pod rynkiem, przebiega przez dawne piwnice kamienic.', tr: t('Маршрут, що веде під ринком, проходить крізь колишні підвали кам’яниць.', 'Маршрут, который ведёт под рынком, проходит через бывшие подвалы домов.', 'The route that leads under the market square runs through the old cellars of the townhouses.') },
  ],
  words: ['dolina', 'lotniczy', 'piwnica', 'trasa', 'innowacyjny', 'położony', 'podziemny'],
  exercises: [
    dialogue('dialogue.rzeszow', PRZEWODNIK, [
      {
        npc: 'Witamy w Rzeszowie! Pod rynkiem prowadzi słynna Podziemna Trasa Turystyczna.',
        tr: t('Вітаємо в Жешуві! Під ринком веде відомий Підземний туристичний маршрут.', 'Добро пожаловать в Жешув! Под рынком проходит знаменитый Подземный туристический маршрут.', 'Welcome to Rzeszów! The famous Underground Tourist Route runs beneath the market square.'),
        choose: [
          ['Ciekawe! A jak nazywa się trasa, która prowadzi pod rynkiem?', t('Цікаво! А як називається маршрут, що веде під ринком?', 'Интересно! А как называется маршрут, который ведёт под рынком?', 'Interesting! And what is the route called that runs under the market square?')],
          ['Ciekawe! A jak nazywa się trasa, który prowadzi pod rynkiem?', t('(**trasa** — жіночий рід: **która**)', '(**trasa** — женский род: **która**)', '(**trasa** is feminine: **która**)')],
          ['Ciekawe! A jak nazywa się trasa, w której prowadzi pod rynkiem?', t('(тут **trasa** — підмет підрядного: називний **która**, без прийменника)', '(здесь **trasa** — подлежащее придаточного: именительный **która**, без предлога)', '(here **trasa** is the subject of the clause: nominative **która**, no preposition)')],
        ],
        feedback: t('Рід — за іменником (**trasa → która**), відмінок — за роллю: підмет → називний.', 'Род — по существительному (**trasa → która**), падеж — по роли: подлежащее → именительный.', 'Gender follows the noun (**trasa → która**), the case follows the role: subject → nominative.'),
      },
      {
        npc: 'Rzeszów jest znany z przemysłu lotniczego. Czy interesuje pana lotnictwo?',
        tr: t('Жешув відомий авіаційною промисловістю. Чи цікавить вас авіація?', 'Жешув известен авиационной промышленностью. Вас интересует авиация?', 'Rzeszów is known for its aviation industry. Are you interested in aviation?'),
        choose: [
          ['Tak, interesuję się lotnictwem od dzieciństwa.', t('Так, я цікавлюся авіацією з дитинства.', 'Да, я интересуюсь авиацией с детства.', 'Yes, I have been interested in aviation since childhood.')],
          ['Tak, interesuję się lotnictwo od dzieciństwa.', t('(**interesować się** + орудний: **lotnictwem**)', '(**interesować się** + творительный: **lotnictwem**)', '(**interesować się** + instrumental: **lotnictwem**)')],
          ['Tak, interesuję lotnictwem od dzieciństwa.', t('(**interesować się** — зворотне: потрібне **się**)', '(**interesować się** — возвратное: нужно **się**)', '(**interesować się** is reflexive: it needs **się**)')],
        ],
        feedback: t('**interesować się** + орудний.', '**interesować się** + творительный.', '**interesować się** + instrumental.'),
      },
    ]),
    wordChoice('vocab.rzeszow', 'piwnica', [t('підвал', 'подвал', 'cellar'), t('сходовий майданчик', 'лестничная площадка', 'a stairwell landing'), t('внутрішній двір', 'внутренний двор', 'a courtyard')]),
    fillGap('grammar.rzeszow', 'To miasto, w ___ mieszkam od dziesięciu lat, jest innowacyjne.', ['którym', 'który', 'którego'], t('Це місто, в якому я живу вже десять років, інноваційне.', 'Этот город, в котором я живу уже десять лет, инновационный.', 'This city, in which I have lived for ten years, is innovative.'),
      t('**mieszkać w** + місцевий: **w którym**.', '**mieszkać w** + предложный: **w którym**.', '**mieszkać w** + locative: **w którym**.')),
    match('vocab.rzeszow', [
      ['dolina', t('долина', 'долина', 'valley')],
      ['lotniczy', t('авіаційний', 'авиационный', 'aviation (adj.)')],
      ['położony', t('розташований', 'расположенный', 'situated')],
      ['podziemny', t('підземний', 'подземный', 'underground')],
    ]),
    grammar('grammar.rzeszow', 'Piwnice, w ___ dawniej przechowywano towary, są dziś atrakcją.', 'który', ['których'], t('Підвали, у яких колись зберігали товари, сьогодні є атракцією.', 'Подвалы, в которых раньше хранили товары, сегодня — достопримечательность.', 'The cellars in which goods used to be stored are an attraction today.'),
      t('**Piwnice** — множина, **w** + місцевий: **w których**.', '**Piwnice** — множественное число, **w** + предложный: **w których**.', '**Piwnice** is plural, and **w** takes the locative: **w których**.')),
    listen('listening.rzeszow', 'Rzeszów jest położony nad rzeką Wisłok i znany z przemysłu lotniczego.', ['Rzeszów jest położony nad rzeką Wisłok i znany z przemysłu lotniczego.', 'Rzeszów jest położony nad rzeką Wisła i znany z przemysłu lotniczego.', 'Rzeszów jest położony nad rzeką Wisłok i znany z przemysłu motoryzacyjnego.']),
    reading('reading.rzeszow', 'Rzeszów, stolica województwa podkarpackiego, to jedno z najszybciej rozwijających się miast Polski. Region nazywany jest Doliną Lotniczą, bo od czasów przedwojennych działają tu zakłady lotnicze, a dziś pracują w nich tysiące osób. Pod rynkiem znajduje się Podziemna Trasa Turystyczna: kilkaset metrów korytarzy łączących dawne piwnice kamienic. Zwiedzanie trwa około czterdziestu minut.',
      t('Звідки назва «Авіаційна долина»?', 'Откуда название «Авиационная долина»?', 'Where does the name “Aviation Valley” come from?'),
      [t('в регіоні з довоєнних часів діють авіаційні заводи', 'в регионе с довоенных времён работают авиационные заводы', 'aircraft plants have worked in the region since before the war'), t('місто лежить у долині річки Віслок', 'город лежит в долине реки Вислок', 'the city lies in the valley of the Wisłok river'), t('у долині розташований великий аеропорт', 'в долине расположен большой аэропорт', 'a large airport stands in the valley')]),
    findError('grammar.rzeszow', ['Podziemna', 'trasa', 'przebiega', 'pod', 'rynek', 'miasta'], 4, t('Підземний маршрут проходить під ринком міста.', 'Подземный маршрут проходит под рынком города.', 'The underground route runs beneath the city’s market square.'),
      t('**pod** + орудний (місце): **pod rynkiem**.', '**pod** + творительный (место): **pod rynkiem**.', '**pod** + instrumental (location): **pod rynkiem**.')),
    build('grammar.rzeszow', 'Rzeszów jest znany z przemysłu lotniczego', t('Жешув відомий авіаційною промисловістю', 'Жешув известен авиационной промышленностью', 'Rzeszów is known for its aviation industry'), ['przemysł', 'na']),
    oddOne('grammar.rzeszow', ['miasto, w którym mieszkam', 'trasa, która prowadzi pod rynkiem', 'piwnice, w których przechowywano towary', 'ulica, które prowadzi do centrum'], 3,
      t('**Ulica** — жіночий рід: **która prowadzi**.', '**Ulica** — женский род: **która prowadzi**.', '**Ulica** is feminine: **która prowadzi**.'),
      t('Яка фраза містить помилку?', 'Какое выражение содержит ошибку?', 'Which expression contains a mistake?')),
    translate('writing.rzeszow', t('Місто, в якому я живу, відоме авіаційною промисловістю.', 'Город, в котором я живу, известен авиационной промышленностью.', 'The city I live in is known for its aviation industry.'),
      ['Miasto, w którym mieszkam, jest znane z przemysłu lotniczego.', 'Miasto, w którym mieszkam, jest znane z przemysłu lotniczego', 'Miasto, w którym mieszkam, słynie z przemysłu lotniczego.']),
    speak('speaking.rzeszow', 'Podziemna trasa przebiega przez dawne piwnice kamienic pod rynkiem.', t('Підземний маршрут проходить крізь колишні підвали кам’яниць під ринком.', 'Подземный маршрут проходит через бывшие подвалы домов под рынком.', 'The underground route runs through the old cellars of the townhouses beneath the market square.')),
  ],
};

export const RZE_5_8: LessonSeed[] = [RZE_5, RZE_6, RZE_7, RZE_8];

export const RZE_BOSS: LessonSeed = {
  slug: 'rze-boss',
  kind: 'BOSS',
  title: t('Бос: Справи в Жешуві', 'Босс: Дела в Жешуве', 'Boss: Errands in Rzeszów'),
  topic: t(
    'przysługiwać + давальний, ubiegać się o, zostać + дієприкметник, złożenie zeznania, żebym…, czy…, ukarać mandatem, nie zauważyłem znaku, skradziono mi, gdyby miał, który / która',
    'przysługiwać + дательный, ubiegać się o, zostać + причастие, złożenie zeznania, żebym…, czy…, ukarać mandatem, nie zauważyłem znaku, skradziono mi, gdyby miał, który / która',
    'przysługiwać + dative, ubiegać się o, zostać + a participle, złożenie zeznania, żebym…, czy…, ukarać mandatem, nie zauważyłem znaku, skradziono mi, gdyby miał, który / która',
  ),
  cefr: 'B2',
  difficulty: 5,
  explanation: t(
    'Перевір усе з Жешува: лікар і NFZ, ZUS, податки, школу, штрафи, поліцію, рекламацію та місто.',
    'Проверь всё из Жешува: врач и NFZ, ZUS, налоги, школу, штрафы, полицию, рекламацию и город.',
    'Check everything from Rzeszów: the doctor and the NFZ, ZUS, taxes, school, fines, the police, complaints and the city.',
  ),
  examples: [],
  words: [],
  exercises: [
    dialogue('situation.boss', MIEJSKA, [
      {
        npc: 'Dzień dobry. Czym mogę służyć?',
        tr: t('Добрий день. Чим можу допомогти?', 'Добрый день. Чем могу помочь?', 'Good morning. How can I help?'),
        choose: [
          ['Dzień dobry, ubiegam się o zasiłek rodzinny.', t('Добрий день, я подаю заяву на сімейну допомогу.', 'Добрый день, я подаю заявление на семейное пособие.', 'Hello, I’m applying for a family allowance.')],
          ['Dzień dobry, ubiegam się zasiłek rodzinny.', t('(**ubiegać się o** — потрібен прийменник **o**)', '(**ubiegać się o** — нужен предлог **o**)', '(**ubiegać się o** needs the preposition **o**)')],
          ['Dzień dobry, ubiegam o zasiłek rodzinny.', t('(**ubiegać się** — зворотне: потрібне **się**)', '(**ubiegać się** — возвратное: нужно **się**)', '(**ubiegać się** is reflexive: it needs **się**)')],
        ],
        feedback: t('**ubiegać się o** + знахідний.', '**ubiegać się o** + винительный.', '**ubiegać się o** + accusative.'),
      },
      {
        npc: 'Czy ma pan ubezpieczenie zdrowotne i skierowanie do specjalisty?',
        tr: t('Чи є у вас медичне страхування й направлення до спеціаліста?', 'Есть ли у вас медицинская страховка и направление к специалисту?', 'Do you have health insurance and a referral to a specialist?'),
        choose: [
          ['Tak, mam. Lekarz rodzinny wystawił mi też e-receptę.', t('Так, є. Сімейний лікар виписав мені також е-рецепт.', 'Да, есть. Семейный врач выписал мне также э-рецепт.', 'Yes, I do. My family doctor also issued me an e-prescription.')],
          ['Tak, mam. Lekarz rodzinny wystawiłem mi też e-receptę.', t('(підмет — **lekarz**: **wystawił**)', '(подлежащее — **lekarz**: **wystawił**)', '(the subject is **lekarz**: **wystawił**)')],
          ['Tak, mam. Lekarz rodzinny wystawił mnie też e-receptę.', t('(кому? — давальний: **mi**)', '(кому? — дательный: **mi**)', '(to whom? — the dative **mi**)')],
        ],
        feedback: t('Підмет — **lekarz** → **wystawił**; кому? — **mi**.', 'Подлежащее — **lekarz** → **wystawił**; кому? — **mi**.', 'The subject is **lekarz** → **wystawił**; to whom? — **mi**.'),
      },
    ], { situation: true, scene: t('Міська управа в Жешуві', 'Городская управа в Жешуве', 'Rzeszów City Hall') }),
    fillGap('grammar.boss', 'Zostałem ukarany ___ za przekroczenie prędkości.', ['mandatem', 'mandat', 'mandatu'], t('Мене покарали штрафом за перевищення швидкості.', 'Меня наказали штрафом за превышение скорости.', 'I was punished with a fine for speeding.'),
      t('**ukarać** + орудний: **mandatem**.', '**ukarać** + творительный: **mandatem**.', '**ukarać** + instrumental: **mandatem**.')),
    match('grammar.boss', [
      ['przysługiwać', t('належати (за правом)', 'полагаться (по праву)', 'to be entitled to')],
      ['zeznanie podatkowe', t('податкова декларація', 'налоговая декларация', 'tax return')],
      ['odstąpić od umowy', t('відмовитися від договору', 'отказаться от договора', 'to withdraw from a contract')],
      ['świadek', t('свідок', 'свидетель', 'witness')],
    ]),
    grammar('grammar.boss', 'Nie widziałem ___ świadka.', 'żaden', ['żadnego'], t('Я не бачив жодного свідка.', 'Я не видел ни одного свидетеля.', 'I did not see any witness.'),
      t('Після заперечення — родовий: **żadnego świadka**.', 'После отрицания — родительный: **żadnego świadka**.', 'After a negation — the genitive: **żadnego świadka**.')),
    listen('listening.boss', 'Skradziono mi portfel i chcę zgłosić kradzież na policji.', ['Skradziono mi portfel i chcę zgłosić kradzież na policji.', 'Skradziono mi plecak i chcę zgłosić kradzież na policji.', 'Skradziono mi portfel i chcę zgłosić włamanie na policji.']),
    reading('reading.boss', 'Szanowny Panie, informujemy, że Pana wniosek o zasiłek został rozpatrzony pozytywnie. Zasiłek zostanie wypłacony na wskazane konto w ciągu czternastu dni. Od decyzji przysługuje odwołanie w ciągu czternastu dni od jej doręczenia. W razie pytań prosimy o kontakt z infolinią.',
      t('Протягом якого часу можна оскаржити рішення?', 'В течение какого времени можно обжаловать решение?', 'How long do you have to appeal against the decision?'),
      [t('чотирнадцять днів від отримання', 'четырнадцать дней с момента получения', 'fourteen days from receiving it'), t('сім днів від отримання', 'семь дней с момента получения', 'seven days from receiving it'), t('місяць від виплати', 'месяц с момента выплаты', 'a month from the payment')]),
    findError('grammar.boss', ['Zapytał', 'czy', 'mogę', 'się', 'odwołać', 'z', 'decyzji'], 5, t('Він запитав, чи можу я оскаржити рішення.', 'Он спросил, могу ли я обжаловать решение.', 'He asked whether I could appeal against the decision.'),
      t('**Odwołać się od** + родовий: **od decyzji**.', '**Odwołać się od** + родительный: **od decyzji**.', '**Odwołać się od** + genitive: **od decyzji**.')),
    wordChoice('vocab.boss', 'świadek', [t('свідок', 'свидетель', 'witness'), t('потерпілий', 'пострадавший', 'victim'), t('підозрюваний', 'подозреваемый', 'suspect')]),
    build('grammar.boss', 'Nie zauważyłem znaku ograniczenia prędkości', t('Я не помітив знака обмеження швидкості', 'Я не заметил знака ограничения скорости', 'I did not notice the speed limit sign'), ['znak', 'zauważam']),
    oddOne('grammar.boss', ['zostać ukarany mandatem', 'zostać zapisany do szkoły', 'zostać wypłacony na konto', 'zostać zapisać do szkoły'], 3,
      t('Після **zostać** — дієприкметник: **zostać zapisany**, а не інфінітив.', 'После **zostać** — причастие: **zostać zapisany**, а не инфинитив.', 'After **zostać** comes a participle: **zostać zapisany**, not an infinitive.'),
      t('Яка фраза містить помилку?', 'Какое выражение содержит ошибку?', 'Which expression contains a mistake?')),
    translate('writing.boss', t('Вчителька попросила, щоб я пояснив відсутність сина в електронному щоденнику.', 'Учительница попросила, чтобы я объяснил отсутствие сына в электронном дневнике.', 'The teacher asked me to excuse my son’s absence in the electronic register.'),
      ['Nauczycielka poprosiła, żebym usprawiedliwił nieobecność syna w dzienniku elektronicznym', 'Nauczycielka poprosiła, żebym usprawiedliwiła nieobecność syna w dzienniku elektronicznym', 'Wychowawca poprosił, żebym usprawiedliwił nieobecność syna w dzienniku elektronicznym', 'Wychowawca poprosił, żebym usprawiedliwiła nieobecność syna w dzienniku elektronicznym']),
    speak('speaking.boss', 'Gdyby towar miał wadę, mógłbym go zareklamować w ciągu dwóch lat.', t('Якби товар мав дефект, я міг би подати рекламацію протягом двох років.', 'Если бы у товара был дефект, я мог бы подать рекламацию в течение двух лет.', 'If the goods had a defect, I could make a complaint within two years.')),
  ],
};
