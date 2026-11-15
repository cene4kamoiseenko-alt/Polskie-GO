/**
 * Zakopane — уроки 5–8 й фінальний іспит. Лижі й дієслова з прийменниками (zwrócić uwagę na + знахідний, brać udział w + місцевий, przygotować się do + родовий,
 * obawiać się + родовий, liczyć na + знахідний), поїздка й офіційний лист (w związku z + орудний, z powodu + родового, prosić o + знахідний, anulować rezerwację,
 * zwrot opłaty), дискусія про туризм (z jednej strony… z drugiej strony…, owszem… niemniej…, nie tylko… lecz także, zarówno… jak i, szkodzić / przynosić korzyść + давальний)
 * та прощання (podziękować + давальний za + знахідний, dzięki + давальний, tęsknić za + орудний, spełnić marzenie). Уроки 1–4 і збірка міста — zakopane.ts.
 * Правила якості — docs/EXERCISE_QUALITY.md. Словник — vocab-zakopane.ts.
 */
import { t, wordChoice, fillGap, listen, findError, oddOne, reading, translate, grammar, build, match, speak, dialogue } from './builders';
import type { LessonSeed } from './types';

const INSTRUKTOR = { name: 'Pan Kamil', emoji: '👨🏽', role: t('лижний інструктор', 'лыжный инструктор', 'a ski instructor') };
const RECEPCJONISTKA = { name: 'Pani Zofia', emoji: '🏨', role: t('адміністраторка пансіонату', 'администратор пансионата', 'a guesthouse receptionist') };
const PROWADZACY = { name: 'Pan Adam', emoji: '👨🏻‍💼', role: t('ведучий радіодискусії', 'ведущий радиодискуссии', 'a radio debate host') };
const KASIA = { name: 'Kasia', emoji: '👩🏼', role: t('подруга з Польщі', 'подруга из Польши', 'a friend from Poland') };

const ZAK_5: LessonSeed = {
  slug: 'zak-5-narty',
  title: t('Зима: лижі й дієслова з прийменниками', 'Зима: лыжи и глаголы с предлогами', 'Winter: skiing and verbs with prepositions'),
  topic: t(
    'zwrócić uwagę na + знахідний; brać udział w + місцевий; przygotować się do + родовий; obawiać się + родовий; liczyć na + знахідний; wyciąg, stok, zjazd',
    'zwrócić uwagę na + винительный; brać udział w + предложный; przygotować się do + родительный; obawiać się + родительный; liczyć na + винительный; wyciąg, stok, zjazd',
    'zwrócić uwagę na + accusative; brać udział w + locative; przygotować się do + genitive; obawiać się + genitive; liczyć na + accusative; wyciąg, stok, zjazd',
  ),
  cefr: 'B2',
  difficulty: 5,
  explanation: t(
    '**Мета:** записатися на курс, домовитися з інструктором і зрозуміти правила на схилі.\nНа рівні B2 прийменник і відмінок треба вчити разом із дієсловом: **zwrócić uwagę na** + знахідний (**na błędy**), **brać udział w** + місцевий (**w kursie**, **w zawodach**), **przygotować się do** + родовий (**do zjazdu**), **obawiać się** + родовий (**obawiam się upadku**, без прийменника), **liczyć na** + знахідний (**na pomoc**), **zależeć od** + родовий.\nНа схилі: **wyciąg** — підйомник, **stok** — схил, **zjazd** — спуск, **karnet** — абонемент на підйомники; для підлітків — **nakaz jazdy w kasku**.',
    '**Цель:** записаться на курс, договориться с инструктором и понять правила на склоне.\nНа уровне B2 предлог и падеж нужно учить вместе с глаголом: **zwrócić uwagę na** + винительный (**na błędy**), **brać udział w** + предложный (**w kursie**, **w zawodach**), **przygotować się do** + родительный (**do zjazdu**), **obawiać się** + родительный (**obawiam się upadku**, без предлога), **liczyć na** + винительный (**na pomoc**), **zależeć od** + родительный.\nНа склоне: **wyciąg** — подъёмник, **stok** — склон, **zjazd** — спуск, **karnet** — абонемент на подъёмники; для подростков — **nakaz jazdy w kasku**.',
    '**Goal:** sign up for a course, agree things with an instructor and understand the rules on the slope.\nAt B2 you learn the preposition and case together with the verb: **zwrócić uwagę na** + accusative (**na błędy**), **brać udział w** + locative (**w kursie**, **w zawodach**), **przygotować się do** + genitive (**do zjazdu**), **obawiać się** + genitive (**obawiam się upadku**, no preposition), **liczyć na** + accusative (**na pomoc**), **zależeć od** + genitive.\nOn the slope: **wyciąg** is the lift, **stok** the slope, **zjazd** the run, **karnet** the lift pass; for teenagers there is a **nakaz jazdy w kasku**.',
  ),
  examples: [
    { pl: 'Instruktor zwrócił uwagę na błędy narciarzy.', tr: t('Інструктор звернув увагу на помилки лижників.', 'Инструктор обратил внимание на ошибки лыжников.', 'The instructor drew the skiers’ attention to their mistakes.') },
    { pl: 'Chcę wziąć udział w kursie i przygotować się do pierwszego zjazdu.', tr: t('Я хочу взяти участь у курсі й підготуватися до першого спуску.', 'Я хочу принять участие в курсе и подготовиться к первому спуску.', 'I want to take part in the course and get ready for my first run.') },
  ],
  words: ['wyciąg', 'stok', 'instruktor', 'zjazd', 'narciarz', 'snowboard'],
  exercises: [
    dialogue('dialogue.narty', INSTRUKTOR, [
      {
        npc: 'Na stoku proszę zwracać uwagę na innych narciarzy. Czy chce pan wziąć udział w kursie dla początkujących?',
        tr: t('На схилі прошу зважати на інших лижників. Чи хочете ви взяти участь у курсі для початківців?', 'На склоне прошу обращать внимание на других лыжников. Хотите принять участие в курсе для начинающих?', 'On the slope please watch out for other skiers. Would you like to take part in the beginners’ course?'),
        choose: [
          ['Tak, chcę wziąć udział w kursie i przygotować się do pierwszego zjazdu.', t('Так, хочу взяти участь у курсі й підготуватися до першого спуску.', 'Да, хочу принять участие в курсе и подготовиться к первому спуску.', 'Yes, I want to take part in the course and get ready for my first run.')],
          ['Tak, chcę wziąć udział kursu i przygotować się do pierwszego zjazdu.', t('(**brać udział w** + місцевий: **w kursie**)', '(**brać udział w** + предложный: **w kursie**)', '(**brać udział w** takes the locative: **w kursie**)')],
          ['Tak, chcę wziąć udział w kursie i przygotować do pierwszego zjazdu.', t('(**przygotować się** — зворотне: потрібне **się**)', '(**przygotować się** — возвратное: нужно **się**)', '(**przygotować się** is reflexive: it needs **się**)')],
        ],
        feedback: t('**wziąć udział w** + місцевий; **przygotować się do** + родовий.', '**wziąć udział w** + предложный; **przygotować się do** + родительный.', '**wziąć udział w** + locative; **przygotować się do** + genitive.'),
      },
      {
        npc: 'Czy obawia się pan zjazdu z tego stoku?',
        tr: t('Чи боїтеся ви спуску з цього схилу?', 'Вы боитесь спуска с этого склона?', 'Are you afraid of skiing down this slope?'),
        choose: [
          ['Trochę obawiam się zjazdu, ale liczę na pomoc instruktora.', t('Трохи боюся спуску, але розраховую на допомогу інструктора.', 'Немного боюсь спуска, но рассчитываю на помощь инструктора.', 'I’m a little afraid of the run, but I count on the instructor’s help.')],
          ['Trochę obawiam się zjazd, ale liczę na pomoc instruktora.', t('(**obawiać się** + родовий: **zjazdu**)', '(**obawiać się** + родительный: **zjazdu**)', '(**obawiać się** takes the genitive: **zjazdu**)')],
          ['Trochę obawiam się zjazdu, ale liczę pomoc instruktora.', t('(**liczyć na** + знахідний: потрібне **na**)', '(**liczyć na** + винительный: нужно **na**)', '(**liczyć na** needs the preposition **na**)')],
        ],
        feedback: t('**obawiać się** + родовий; **liczyć na** + знахідний.', '**obawiać się** + родительный; **liczyć na** + винительный.', '**obawiać się** + genitive; **liczyć na** + accusative.'),
      },
    ]),
    wordChoice('vocab.narty', 'wyciąg', [t('підйомник, що вивозить лижників на схил', 'подъёмник, вывозящий лыжников на склон', 'a lift that takes skiers up the slope'), t('абонемент на кілька днів катання', 'абонемент на несколько дней катания', 'a pass for several days of skiing'), t('схил, призначений для спуску', 'склон, предназначенный для спуска', 'a slope marked out for skiing')]),
    fillGap('grammar.narty', 'Chcę wziąć udział ___ zawodach narciarskich.', ['w', 'na', 'do'], t('Я хочу взяти участь у лижних змаганнях.', 'Я хочу принять участие в лыжных соревнованиях.', 'I want to take part in the ski competition.'),
      t('**brać udział w** + місцевий: **w zawodach**.', '**brać udział w** + предложный: **w zawodach**.', '**brać udział w** + locative: **w zawodach**.')),
    match('vocab.narty', [
      ['wyciąg', t('підйомник на схилі', 'подъёмник на склоне', 'a ski lift')],
      ['stok', t('схил для катання', 'склон для катания', 'a ski slope')],
      ['zjazd', t('спуск зі схилу', 'спуск со склона', 'a run, a descent')],
      ['zwrócić uwagę na', t('звернути увагу на', 'обратить внимание на', 'to draw attention to')],
    ]),
    grammar('grammar.narty', 'Obawiam się ___ na stoku.', 'upadek', ['upadku'], t('Я боюся впасти на схилі.', 'Я боюсь упасть на склоне.', 'I am afraid of falling on the slope.'),
      t('**obawiać się** + родовий: **upadku**.', '**obawiać się** + родительный: **upadku**.', '**obawiać się** + genitive: **upadku**.')),
    listen('listening.narty', 'Instruktor zwrócił uwagę na zły stan stoku.', ['Instruktor zwrócił uwagę na zły stan stoku.', 'Instruktor zwracał uwagę na zły stan stoku.', 'Instruktor zwrócił uwagę na zły stan stoków.']),
    reading('reading.narty', 'Regulamin stoku: karnet dzienny na wyciągi kosztuje 180 zł, a karnet czterogodzinny — 140 zł. Dzieci do ósmego roku życia jeżdżą bezpłatnie pod opieką dorosłego. Obowiązuje nakaz jazdy w kasku dla osób poniżej osiemnastego roku życia, a dorosłym zaleca się jego używanie. Instruktorzy zwracają uwagę na bezpieczeństwo i zachęcają do udziału w kursie dla początkujących, który odbywa się codziennie o dziesiątej.',
      t('Хто за правилами мусить їздити в шоломі?', 'Кто по правилам обязан ездить в шлеме?', 'According to the rules, who has to ski with a helmet?'),
      [t('особи молодші за вісімнадцять років', 'лица младше восемнадцати лет', 'people under eighteen'), t('усі лижники без винятку', 'все лыжники без исключения', 'all skiers without exception'), t('лише діти до восьми років', 'только дети до восьми лет', 'only children up to eight')]),
    findError('grammar.narty', ['Instruktor', 'zwrócił', 'uwagę', 'do', 'błędy', 'narciarzy'], 3, t('Інструктор звернув увагу на помилки лижників.', 'Инструктор обратил внимание на ошибки лыжников.', 'The instructor drew the skiers’ attention to their mistakes.'),
      t('**Zwrócić uwagę na** + знахідний: **na błędy**.', '**Zwrócić uwagę na** + винительный: **na błędy**.', '**Zwrócić uwagę na** + accusative: **na błędy**.')),
    build('grammar.narty', 'Chciałbym przygotować się do pierwszego zjazdu', t('Я хотів би підготуватися до першого спуску', 'Я хотел бы подготовиться к первому спуску', 'I would like to get ready for my first run'), ['pierwszy', 'na']),
    oddOne('grammar.narty', ['brać udział w zawodach', 'zwracać uwagę na stok', 'obawiać się upadku', 'liczyć o pomoc'], 3,
      t('**Liczyć na** + знахідний: **liczyć na pomoc**.', '**Liczyć na** + винительный: **liczyć na pomoc**.', '**Liczyć na** + accusative: **liczyć na pomoc**.'),
      t('Яка фраза містить помилку?', 'Какое выражение содержит ошибку?', 'Which expression contains a mistake?')),
    translate('writing.narty', t('Я хочу взяти участь у курсі й готуюся до першого спуску.', 'Я хочу принять участие в курсе и готовлюсь к первому спуску.', 'I want to take part in the course and I am getting ready for my first run.'),
      ['Chcę wziąć udział w kursie i przygotowuję się do pierwszego zjazdu.', 'Chcę wziąć udział w kursie i przygotowuję się do pierwszego zjazdu', 'Chciałbym wziąć udział w kursie i przygotowuję się do pierwszego zjazdu.']),
    speak('speaking.narty', 'Instruktor zwraca uwagę na bezpieczeństwo, a ja liczę na jego pomoc.', t('Інструктор звертає увагу на безпеку, а я розраховую на його допомогу.', 'Инструктор обращает внимание на безопасность, а я рассчитываю на его помощь.', 'The instructor pays attention to safety, and I count on his help.')),
  ],
};

const ZAK_6: LessonSeed = {
  slug: 'zak-6-podroz',
  title: t('Поїздка: бронювання й офіційний лист', 'Поездка: бронирование и официальное письмо', 'The trip: bookings and a formal letter'),
  topic: t(
    'w związku z + орудний; z powodu + родовий; prosić o + знахідний (prosimy o potwierdzenie); anulować rezerwację; zwrot opłaty; pensjonat, zakwaterowanie',
    'w związku z + творительный; z powodu + родительный; prosić o + винительный (prosimy o potwierdzenie); anulować rezerwację; zwrot opłaty; pensjonat, zakwaterowanie',
    'w związku z + instrumental; z powodu + genitive; prosić o + accusative (prosimy o potwierdzenie); anulować rezerwację; zwrot opłaty; pensjonat, zakwaterowanie',
  ),
  cefr: 'B2',
  difficulty: 5,
  explanation: t(
    '**Мета:** забронювати нічліг, скасувати поїздку й написати чи зрозуміти офіційний лист.\n**W związku z** + **орудний** — «у зв’язку з»: **w związku z rezerwacją**, **w związku z remontem**. **Z powodu** + **родовий** — «через»: **z powodu choroby**, **z powodu deszczu**. Різниця: **w związku z** — офіційний вступ до листа, **z powodu** — причина.\nПрохання: **prosimy o** + знахідний (**o potwierdzenie rezerwacji** — після **potwierdzenie** родовий). **Anulować rezerwację** — скасувати бронювання, **zwrot opłaty** — повернення плати. У листі: **Szanowni Państwo, w związku z…, informujemy, że…**; **zakwaterowanie** — розміщення в **pensjonacie**.',
    '**Цель:** забронировать ночлег, отменить поездку и написать или понять официальное письмо.\n**W związku z** + **творительный** — «в связи с»: **w związku z rezerwacją**, **w związku z remontem**. **Z powodu** + **родительный** — «из-за»: **z powodu choroby**, **z powodu deszczu**. Разница: **w związku z** — официальное начало письма, **z powodu** — причина.\nПросьба: **prosimy o** + винительный (**o potwierdzenie rezerwacji** — после **potwierdzenie** родительный). **Anulować rezerwację** — отменить бронь, **zwrot opłaty** — возврат платы. В письме: **Szanowni Państwo, w związku z…, informujemy, że…**; **zakwaterowanie** — размещение в **pensjonacie**.',
    '**Goal:** book a place to stay, cancel a trip and write or understand a formal letter.\n**W związku z** + **instrumental** means “in connection with”: **w związku z rezerwacją**, **w związku z remontem**. **Z powodu** + **genitive** means “because of”: **z powodu choroby**, **z powodu deszczu**. The difference: **w związku z** is the formal opening of a letter, **z powodu** gives the reason.\nRequests: **prosimy o** + accusative (**o potwierdzenie rezerwacji** — the genitive follows **potwierdzenie**). **Anulować rezerwację** — to cancel a booking, **zwrot opłaty** — a refund of the fee. In a letter: **Szanowni Państwo, w związku z…, informujemy, że…**; **zakwaterowanie** is the accommodation in a **pensjonat**.',
  ),
  examples: [
    { pl: 'W związku z remontem pensjonat będzie zamknięty od dziesiątego do czternastego grudnia.', tr: t('У зв’язку з ремонтом пансіонат буде зачинений з десятого по чотирнадцяте грудня.', 'В связи с ремонтом пансионат будет закрыт с десятого по четырнадцатое декабря.', 'Owing to renovation the guesthouse will be closed from 10 to 14 December.') },
    { pl: 'Z powodu choroby muszę anulować rezerwację i proszę o zwrot opłaty.', tr: t('Через хворобу я мушу скасувати бронювання й прошу повернути плату.', 'Из-за болезни я должен отменить бронь и прошу вернуть плату.', 'Because of illness I have to cancel the booking and ask for a refund of the fee.') },
  ],
  words: ['pensjonat', 'zakwaterowanie', 'anulować', 'opłata', 'w związku z', 'z powodu'],
  exercises: [
    dialogue('dialogue.podroz', RECEPCJONISTKA, [
      {
        npc: 'Pensjonat „Pod Giewontem”, słucham.',
        tr: t('Пансіонат «Під Гевонтом», слухаю.', 'Пансионат «Под Гевонтом», слушаю.', 'Pension “Pod Giewontem”, how can I help?'),
        choose: [
          ['Dzień dobry, dzwonię w związku z rezerwacją na przyszły weekend.', t('Добрий день, телефоную у зв’язку з бронюванням на наступні вихідні.', 'Добрый день, звоню в связи с бронированием на следующие выходные.', 'Hello, I’m calling about the booking for next weekend.')],
          ['Dzień dobry, dzwonię w związku rezerwacji na przyszły weekend.', t('(**w związku z** — потрібен прийменник **z**)', '(**w związku z** — нужен предлог **z**)', '(**w związku z** needs the preposition **z**)')],
          ['Dzień dobry, dzwonię w związku z rezerwację na przyszły weekend.', t('(**w związku z** + орудний: **z rezerwacją**)', '(**w związku z** + творительный: **z rezerwacją**)', '(**w związku z** takes the instrumental: **z rezerwacją**)')],
        ],
        feedback: t('**w związku z** + орудний.', '**w związku z** + творительный.', '**w związku z** + instrumental.'),
      },
      {
        npc: 'Rozumiem. Czy potwierdza pan termin?',
        tr: t('Розумію. Чи підтверджуєте ви термін?', 'Понимаю. Вы подтверждаете срок?', 'I see. Do you confirm the dates?'),
        choose: [
          ['Niestety, z powodu choroby muszę anulować rezerwację. Czy otrzymam zwrot opłaty?', t('На жаль, через хворобу мушу скасувати бронювання. Чи отримаю я повернення плати?', 'К сожалению, из-за болезни я должен отменить бронь. Получу ли я возврат платы?', 'Unfortunately, because of illness I have to cancel the booking. Will I get a refund?')],
          ['Niestety, z powodu chorobą muszę anulować rezerwację. Czy otrzymam zwrot opłaty?', t('(**z powodu** + родовий: **z powodu choroby**)', '(**z powodu** + родительный: **z powodu choroby**)', '(**z powodu** takes the genitive: **z powodu choroby**)')],
          ['Niestety, z powodu choroby muszę anulować rezerwacji. Czy otrzymam zwrot opłaty?', t('(**anulować** + знахідний: **rezerwację**)', '(**anulować** + винительный: **rezerwację**)', '(**anulować** takes the accusative: **rezerwację**)')],
        ],
        feedback: t('**z powodu** + родовий; **anulować** + знахідний.', '**z powodu** + родительный; **anulować** + винительный.', '**z powodu** + genitive; **anulować** + accusative.'),
      },
    ]),
    wordChoice('vocab.podroz', 'anulować', [t('скасувати, визнати недійсним (бронювання)', 'отменить, признать недействительным (бронь)', 'to cancel'), t('підтвердити (бронювання)', 'подтвердить (бронь)', 'to confirm'), t('продовжити (термін перебування)', 'продлить (срок пребывания)', 'to extend (a stay)')]),
    fillGap('grammar.podroz', 'Czy otrzymam zwrot ___?', ['opłaty', 'opłatę', 'opłata'], t('Чи отримаю я повернення плати?', 'Получу ли я возврат платы?', 'Will I get a refund of the fee?'),
      t('Після **zwrot** — родовий: **zwrot opłaty**.', 'После **zwrot** — родительный: **zwrot opłaty**.', 'After **zwrot** use the genitive: **zwrot opłaty**.')),
    match('vocab.podroz', [
      ['zakwaterowanie', t('розміщення, проживання', 'размещение, проживание', 'accommodation')],
      ['opłata', t('плата, збір', 'плата, сбор', 'a fee')],
      ['anulować', t('скасувати', 'отменить', 'to cancel')],
      ['z powodu', t('через, з причини', 'из-за, по причине', 'because of')],
    ]),
    grammar('grammar.podroz', 'Z powodu ___ nie mogę przyjechać.', 'choroba', ['choroby'], t('Через хворобу я не можу приїхати.', 'Из-за болезни я не могу приехать.', 'I cannot come because of illness.'),
      t('**z powodu** + родовий: **choroby**.', '**z powodu** + родительный: **choroby**.', '**z powodu** + genitive: **choroby**.')),
    listen('listening.podroz', 'Prosimy o potwierdzenie rezerwacji w ciągu trzech dni.', ['Prosimy o potwierdzenie rezerwacji w ciągu trzech dni.', 'Prosimy o potwierdzenie rezerwacji w ciągu trzydziestu dni.', 'Prosimy o potwierdzenie rezerwacji w ciągu trzech tygodni.']),
    reading('reading.podroz', 'Szanowni Państwo, w związku z remontem dachu zakwaterowanie w pensjonacie w terminie 10–14 grudnia nie będzie możliwe. Z powodu tej zmiany oferujemy Państwu zwrot całej opłaty albo przeniesienie rezerwacji na styczeń. Prosimy o odpowiedź w ciągu pięciu dni roboczych. Rezerwacja, której nie anulują Państwo do tego czasu, zostanie przeniesiona automatycznie.',
      t('Що станеться, якщо гість не відповість протягом п’яти робочих днів?', 'Что произойдёт, если гость не ответит в течение пяти рабочих дней?', 'What will happen if the guest does not answer within five working days?'),
      [t('бронювання автоматично перенесуть на січень', 'бронь автоматически перенесут на январь', 'the booking will be moved automatically to January'), t('бронювання скасують із повним поверненням плати', 'бронь отменят с полным возвратом платы', 'the booking will be cancelled with a full refund'), t('бронювання залишиться на грудень', 'бронь останется на декабрь', 'the booking will stay in December')]),
    findError('grammar.podroz', ['Prosimy', 'o', 'potwierdzenie', 'rezerwacja', 'w', 'ciągu', 'trzech', 'dni'], 3, t('Просимо підтвердити бронювання протягом трьох днів.', 'Просим подтвердить бронь в течение трёх дней.', 'Please confirm the booking within three days.'),
      t('Після **potwierdzenie** — родовий: **rezerwacji**.', 'После **potwierdzenie** — родительный: **rezerwacji**.', 'After **potwierdzenie** use the genitive: **rezerwacji**.')),
    build('grammar.podroz', 'W związku z remontem pensjonat będzie zamknięty', t('У зв’язку з ремонтом пансіонат буде зачинений', 'В связи с ремонтом пансионат будет закрыт', 'Owing to renovation the guesthouse will be closed'), ['remontu', 'z']),
    oddOne('grammar.podroz', ['w związku z remontem', 'w związku z chorobą', 'w związku z wyjazdem', 'w związku z wyjazd'], 3,
      t('**W związku z** + орудний: **z wyjazdem**.', '**W związku z** + творительный: **z wyjazdem**.', '**W związku z** + instrumental: **z wyjazdem**.'),
      t('Яка фраза містить помилку?', 'Какое выражение содержит ошибку?', 'Which expression contains a mistake?')),
    translate('writing.podroz', t('У зв’язку з хворобою я хотів би скасувати бронювання й отримати повернення плати.', 'В связи с болезнью я хотел бы отменить бронь и получить возврат платы.', 'Because of illness I would like to cancel the booking and get a refund.'),
      ['W związku z chorobą chciałbym anulować rezerwację i otrzymać zwrot opłaty.', 'W związku z chorobą chciałbym anulować rezerwację i otrzymać zwrot opłaty', 'W związku z chorobą chciałabym anulować rezerwację i otrzymać zwrot opłaty.']),
    speak('speaking.podroz', 'Dzwonię w związku z rezerwacją i chciałbym ją anulować z powodu choroby.', t('Телефоную у зв’язку з бронюванням і хотів би його скасувати через хворобу.', 'Звоню в связи с бронированием и хотел бы отменить его из-за болезни.', 'I’m calling about my booking and I would like to cancel it because of illness.')),
  ],
};

const ZAK_7: LessonSeed = {
  slug: 'zak-7-opinia',
  title: t('Дискусія про туризм', 'Дискуссия о туризме', 'A debate about tourism'),
  topic: t(
    'z jednej strony… z drugiej strony…; owszem…, niemniej…; nie tylko… lecz także; zarówno… jak i; szkodzić + давальний; przynosić korzyść + давальний; mieć wpływ na + знахідний',
    'z jednej strony… z drugiej strony…; owszem…, niemniej…; nie tylko… lecz także; zarówno… jak i; szkodzić + дательный; przynosić korzyść + дательный; mieć wpływ na + винительный',
    'z jednej strony… z drugiej strony…; owszem…, niemniej…; nie tylko… lecz także; zarówno… jak i; szkodzić + dative; przynosić korzyść + dative; mieć wpływ na + accusative',
  ),
  cefr: 'B2',
  difficulty: 5,
  explanation: t(
    '**Мета:** брати участь у дискусії: наводити аргументи, визнавати правоту співрозмовника й заперечувати.\n**Структура:** **z jednej strony… z drugiej strony…** («з одного боку… з іншого…»); **owszem, … niemniej…** («звісно, … проте…»); **nie tylko… lecz także…**; **zarówno A, jak i B** (обидва — в одному відмінку: **zarówno turyści, jak i mieszkańcy**).\n**Керування:** **szkodzić** + давальний (**szkodzi przyrodzie**), **przynosić korzyść** + давальний (**przynosi korzyść mieszkańcom**), **mieć wpływ na** + знахідний (**ma wpływ na rozwój**). Слова: **turystyka masowa**, **ochrona przyrody**, **zaleta**, **korzyść**.',
    '**Цель:** участвовать в дискуссии: приводить аргументы, признавать правоту собеседника и возражать.\n**Структура:** **z jednej strony… z drugiej strony…** («с одной стороны… с другой…»); **owszem, … niemniej…** («разумеется, … однако…»); **nie tylko… lecz także…**; **zarówno A, jak i B** (оба — в одном падеже: **zarówno turyści, jak i mieszkańcy**).\n**Управление:** **szkodzić** + дательный (**szkodzi przyrodzie**), **przynosić korzyść** + дательный (**przynosi korzyść mieszkańcom**), **mieć wpływ na** + винительный (**ma wpływ na rozwój**). Слова: **turystyka masowa**, **ochrona przyrody**, **zaleta**, **korzyść**.',
    '**Goal:** take part in a debate: give arguments, concede a point and object.\n**Structure:** **z jednej strony… z drugiej strony…** (“on the one hand… on the other…”); **owszem, … niemniej…** (“admittedly, … nevertheless…”); **nie tylko… lecz także…**; **zarówno A, jak i B** (both in the same case: **zarówno turyści, jak i mieszkańcy**).\n**Government:** **szkodzić** + dative (**szkodzi przyrodzie**), **przynosić korzyść** + dative (**przynosi korzyść mieszkańcom**), **mieć wpływ na** + accusative (**ma wpływ na rozwój**). Words: **turystyka masowa**, **ochrona przyrody**, **zaleta**, **korzyść**.',
  ),
  examples: [
    { pl: 'Z jednej strony turystyka masowa przynosi korzyści mieszkańcom, z drugiej szkodzi przyrodzie.', tr: t('З одного боку, масовий туризм приносить вигоди мешканцям, з іншого — шкодить природі.', 'С одной стороны, массовый туризм приносит выгоды жителям, с другой — вредит природе.', 'On the one hand mass tourism benefits the residents, on the other it harms nature.') },
    { pl: 'Ochrona przyrody jest ważna, niemniej mieszkańcy potrzebują dochodów.', tr: t('Охорона природи важлива, проте мешканцям потрібні доходи.', 'Охрана природы важна, тем не менее жителям нужны доходы.', 'Nature protection is important, nevertheless the residents need an income.') },
  ],
  words: ['owszem', 'niemniej', 'ochrona przyrody', 'turystyka masowa', 'korzyść', 'zaleta', 'wpływ'],
  exercises: [
    dialogue('dialogue.opinia', PROWADZACY, [
      {
        npc: 'Czy turystyka masowa szkodzi Tatrom?',
        tr: t('Чи шкодить масовий туризм Татрам?', 'Вредит ли массовый туризм Татрам?', 'Does mass tourism harm the Tatras?'),
        choose: [
          ['Z jednej strony przynosi korzyści gospodarce, z drugiej strony szkodzi przyrodzie.', t('З одного боку, приносить вигоди економіці, з іншого — шкодить природі.', 'С одной стороны, приносит выгоды экономике, с другой — вредит природе.', 'On the one hand it benefits the economy, on the other it harms nature.')],
          ['Z jednej strony przynosi korzyści gospodarce, z drugiej strony szkodzi przyrody.', t('(**szkodzić** + давальний: **przyrodzie**)', '(**szkodzić** + дательный: **przyrodzie**)', '(**szkodzić** takes the dative: **przyrodzie**)')],
          ['Z jednej strony przynosi korzyści gospodarki, z drugiej strony szkodzi przyrodzie.', t('(**przynosić korzyści** + давальний: **gospodarce**)', '(**przynosić korzyści** + дательный: **gospodarce**)', '(**przynosić korzyści** takes the dative: **gospodarce**)')],
        ],
        feedback: t('**szkodzić** і **przynosić korzyści** — давальний.', '**szkodzić** и **przynosić korzyści** — дательный.', '**szkodzić** and **przynosić korzyści** — the dative.'),
      },
      {
        npc: 'Czy ochrona przyrody jest ważniejsza niż zysk z turystyki?',
        tr: t('Чи охорона природи важливіша за прибуток від туризму?', 'Важнее ли охрана природы, чем прибыль от туризма?', 'Is nature protection more important than the profit from tourism?'),
        choose: [
          ['Owszem, jest ważna, niemniej mieszkańcy też potrzebują dochodów.', t('Звісно, вона важлива, проте мешканцям теж потрібні доходи.', 'Разумеется, она важна, тем не менее жителям тоже нужны доходы.', 'Admittedly it is important, nevertheless the residents also need an income.')],
          ['Owszem, jest ważna, niemniej mieszkańców też potrzebują dochodów.', t('(підмет — у називному: **mieszkańcy**)', '(подлежащее — в именительном: **mieszkańcy**)', '(the subject is nominative: **mieszkańcy**)')],
          ['Owszem, jest ważna, niemniej mieszkańcy też potrzebuje dochodów.', t('(дієслово узгоджується з підметом у множині: **potrzebują**)', '(глагол согласуется с подлежащим во мн. числе: **potrzebują**)', '(the verb agrees with a plural subject: **potrzebują**)')],
        ],
        feedback: t('Підмет у називному, дієслово — у множині.', 'Подлежащее в именительном, глагол — во множественном.', 'A nominative subject and a plural verb.'),
      },
    ]),
    wordChoice('vocab.opinia', 'owszem', [t('звісно, так (із застереженням)', 'разумеется, да (с оговоркой)', 'indeed, admittedly'), t('навпаки, зовсім ні', 'наоборот, совсем нет', 'on the contrary'), t('можливо, хтозна', 'возможно, кто знает', 'perhaps, who knows')]),
    fillGap('grammar.opinia', 'Nie tylko korzyści, ___ także koszty.', ['lecz', 'ani', 'oraz'], t('Не тільки вигоди, а й витрати.', 'Не только выгоды, но и расходы.', 'Not only benefits but also costs.'),
      t('**nie tylko…, lecz także…** — пара сполучників.', '**nie tylko…, lecz także…** — пара союзов.', '**nie tylko…, lecz także…** — a pair of conjunctions.')),
    match('vocab.opinia', [
      ['zaleta', t('перевага, достоїнство', 'преимущество, достоинство', 'an advantage')],
      ['korzyść', t('вигода, користь', 'выгода, польза', 'a benefit')],
      ['wpływ', t('вплив', 'влияние', 'influence')],
      ['niemniej', t('проте, тим не менш', 'тем не менее', 'nevertheless')],
    ]),
    grammar('grammar.opinia', 'Zarówno turyści, jak i ___ czerpią korzyści z sezonu.', 'mieszkaniec', ['mieszkańcy'], t('І туристи, і мешканці отримують вигоди від сезону.', 'И туристы, и жители получают выгоды от сезона.', 'Both tourists and residents gain from the season.'),
      t('**zarówno… jak i…** — обидва в називному: **mieszkańcy**.', '**zarówno… jak i…** — оба в именительном: **mieszkańcy**.', '**zarówno… jak i…** — both in the nominative: **mieszkańcy**.')),
    listen('listening.opinia', 'Nie tylko turyści, lecz także mieszkańcy czerpią korzyści z sezonu.', ['Nie tylko turyści, lecz także mieszkańcy czerpią korzyści z sezonu.', 'Nie tylko turyści, lecz także mieszkańcy tracą korzyści z sezonu.', 'Nie tylko turyści, lecz także mieszkańcy czerpią korzyść z sezonu.']),
    reading('reading.opinia', 'Zakopane odwiedza rocznie kilka milionów turystów. Zwolennicy turystyki masowej podkreślają, że przynosi ona korzyści zarówno miastu, jak i mieszkańcom: tworzy miejsca pracy i finansuje inwestycje. Przeciwnicy zwracają uwagę na zadeptane szlaki, hałas i ceny, których nie mogą zapłacić lokalni mieszkańcy. Niektórzy eksperci proponują kompromis: limit wejść na najpopularniejsze trasy i droższe bilety w szczycie sezonu.',
      t('Який компроміс пропонують деякі експерти?', 'Какой компромисс предлагают некоторые эксперты?', 'What compromise do some experts propose?'),
      [t('ліміт входів на найпопулярніші маршрути й дорожчі квитки в розпал сезону', 'лимит входов на самые популярные маршруты и более дорогие билеты в разгар сезона', 'a limit on entries to the most popular trails and dearer tickets at the peak of the season'), t('повне закриття стежок узимку', 'полное закрытие троп зимой', 'closing the trails completely in winter'), t('заборона будувати нові готелі', 'запрет строить новые гостиницы', 'a ban on building new hotels')]),
    findError('grammar.opinia', ['Ma', 'ona', 'duży', 'wpływ', 'do', 'przyrodę'], 4, t('Вона має великий вплив на природу.', 'Она оказывает большое влияние на природу.', 'It has a great influence on nature.'),
      t('**Mieć wpływ na** + знахідний: **na przyrodę**.', '**Mieć wpływ na** + винительный: **na przyrodę**.', '**Mieć wpływ na** + accusative: **na przyrodę**.')),
    build('grammar.opinia', 'Z jednej strony turystyka przynosi korzyści gospodarce', t('З одного боку, туризм приносить вигоди економіці', 'С одной стороны, туризм приносит выгоды экономике', 'On the one hand tourism benefits the economy'), ['korzyść', 'gospodarka']),
    oddOne('grammar.opinia', ['przynosi korzyść mieszkańcom', 'szkodzi przyrodzie', 'ma wpływ na rozwój', 'pomaga przyrody'], 3,
      t('**Pomagać** + давальний: **pomaga przyrodzie**.', '**Pomagać** + дательный: **pomaga przyrodzie**.', '**Pomagać** + dative: **pomaga przyrodzie**.'),
      t('Яка фраза містить помилку?', 'Какое выражение содержит ошибку?', 'Which expression contains a mistake?')),
    translate('writing.opinia', t('З одного боку, масовий туризм приносить вигоди мешканцям, з іншого — шкодить природі.', 'С одной стороны, массовый туризм приносит выгоды жителям, с другой — вредит природе.', 'On the one hand mass tourism benefits the residents, on the other it harms nature.'),
      ['Z jednej strony turystyka masowa przynosi korzyści mieszkańcom, z drugiej szkodzi przyrodzie.', 'Z jednej strony turystyka masowa przynosi korzyści mieszkańcom, z drugiej strony szkodzi przyrodzie.', 'Z jednej strony turystyka masowa przynosi korzyści mieszkańcom, z drugiej szkodzi przyrodzie']),
    speak('speaking.opinia', 'Ochrona przyrody ma duży wpływ na rozwój regionu, niemniej mieszkańcy potrzebują dochodów.', t('Охорона природи має великий вплив на розвиток регіону, проте мешканцям потрібні доходи.', 'Охрана природы оказывает большое влияние на развитие региона, тем не менее жителям нужны доходы.', 'Nature protection has a great influence on the region’s development, nevertheless the residents need an income.')),
  ],
};

const ZAK_8: LessonSeed = {
  slug: 'zak-8-pozegnanie',
  title: t('Прощання з Польщею', 'Прощание с Польшей', 'Farewell to Poland'),
  topic: t(
    'podziękować + давальний za + знахідний; wdzięczny za + знахідний; dzięki + давальний; tęsknić za + орудний; spełnić marzenie; na zakończenie, pozwolę sobie',
    'podziękować + дательный za + винительный; wdzięczny za + винительный; dzięki + дательный; tęsknić za + творительный; spełnić marzenie; na zakończenie, pozwolę sobie',
    'podziękować + dative za + accusative; wdzięczny za + accusative; dzięki + dative; tęsknić za + instrumental; spełnić marzenie; na zakończenie, pozwolę sobie',
  ),
  cefr: 'B2',
  difficulty: 5,
  explanation: t(
    '**Мета:** сказати прощальне слово, подякувати й підбити підсумок подорожі.\n**Дякувати:** **podziękować** + **давальний** **za** + знахідний — **podziękować wszystkim za pomoc**; **być wdzięcznym za** + знахідний; **dzięki** + давальний — «завдяки»: **dzięki wam**, **dzięki mojej nauczycielce**. **Tęsknić za** + **орудний**: **będę tęsknić za górami**.\nУрочисті формули: **Na zakończenie pozwolę sobie podziękować wszystkim…**; **spełnić marzenie**; **zabieram ze sobą wspomnienia**; **jeszcze tu wrócę**. Дякуємо й ми: ти пройшов шлях від першого «dzień dobry» до B2 — **gratulacje!**',
    '**Цель:** произнести прощальное слово, поблагодарить и подвести итог путешествию.\n**Благодарить:** **podziękować** + **дательный** **za** + винительный — **podziękować wszystkim za pomoc**; **być wdzięcznym za** + винительный; **dzięki** + дательный — «благодаря»: **dzięki wam**, **dzięki mojej nauczycielce**. **Tęsknić za** + **творительный**: **będę tęsknić za górami**.\nТоржественные формулы: **Na zakończenie pozwolę sobie podziękować wszystkim…**; **spełnić marzenie**; **zabieram ze sobą wspomnienia**; **jeszcze tu wrócę**. Спасибо и тебе: ты прошёл путь от первого «dzień dobry» до B2 — **gratulacje!**',
    '**Goal:** give a farewell speech, say thank you and sum up the journey.\n**Thanking:** **podziękować** + **dative** **za** + accusative — **podziękować wszystkim za pomoc**; **być wdzięcznym za** + accusative; **dzięki** + dative — “thanks to”: **dzięki wam**, **dzięki mojej nauczycielce**. **Tęsknić za** + **instrumental**: **będę tęsknić za górami**.\nFormal phrases: **Na zakończenie pozwolę sobie podziękować wszystkim…**; **spełnić marzenie**; **zabieram ze sobą wspomnienia**; **jeszcze tu wrócę**. Thank you too: you have come from your first “dzień dobry” to B2 — **gratulacje!**',
  ),
  examples: [
    { pl: 'Na zakończenie pozwolę sobie podziękować wszystkim za pomoc i cierpliwość.', tr: t('Наприкінці дозвольте мені подякувати всім за допомогу й терпіння.', 'В завершение позвольте мне поблагодарить всех за помощь и терпение.', 'In closing, allow me to thank everyone for their help and patience.') },
    { pl: 'Dzięki wam spełniłem marzenie o Polsce.', tr: t('Завдяки вам я здійснив мрію про Польщу.', 'Благодаря вам я осуществил мечту о Польше.', 'Thanks to you I fulfilled my dream about Poland.') },
  ],
  words: ['wspomnienie', 'pożegnanie', 'wdzięczny', 'podziękować', 'spełnić marzenie', 'na zakończenie'],
  exercises: [
    dialogue('dialogue.pozegnanie', KASIA, [
      {
        npc: 'Jutro wyjeżdżasz z Polski. Co chciałbyś powiedzieć na pożegnanie?',
        tr: t('Завтра ти їдеш з Польщі. Що б ти хотів сказати на прощання?', 'Завтра ты уезжаешь из Польши. Что бы ты хотел сказать на прощание?', 'Tomorrow you leave Poland. What would you like to say in farewell?'),
        choose: [
          ['Chciałbym podziękować wszystkim za pomoc i za cierpliwość.', t('Я хотів би подякувати всім за допомогу й за терпіння.', 'Я хотел бы поблагодарить всех за помощь и за терпение.', 'I would like to thank everyone for their help and patience.')],
          ['Chciałbym podziękować wszystkich za pomoc i za cierpliwość.', t('(**podziękować** + давальний: **wszystkim**)', '(**podziękować** + дательный: **wszystkim**)', '(**podziękować** takes the dative: **wszystkim**)')],
          ['Chciałbym podziękować wszystkim na pomoc i na cierpliwość.', t('(**podziękować za** + знахідний: **za pomoc**)', '(**podziękować za** + винительный: **za pomoc**)', '(**podziękować za** + accusative: **za pomoc**)')],
        ],
        feedback: t('**podziękować** + давальний **za** + знахідний.', '**podziękować** + дательный **za** + винительный.', '**podziękować** + dative **za** + accusative.'),
      },
      {
        npc: 'Co zabierzesz ze sobą z Zakopanego?',
        tr: t('Що ти забереш із собою із Закопаного?', 'Что ты заберёшь с собой из Закопане?', 'What will you take with you from Zakopane?'),
        choose: [
          ['Zabiorę wspomnienia i będę tęsknić za górami.', t('Заберу спогади й сумуватиму за горами.', 'Заберу воспоминания и буду скучать по горам.', 'I’ll take the memories and I’ll miss the mountains.')],
          ['Zabiorę wspomnienia i będę tęsknić górami.', t('(**tęsknić za** + орудний: потрібне **za**)', '(**tęsknić za** + творительный: нужно **za**)', '(**tęsknić za** needs the preposition **za**)')],
          ['Zabiorę wspomnienia i będę tęsknić za góry.', t('(**tęsknić za** + орудний: **za górami**)', '(**tęsknić za** + творительный: **za górami**)', '(**tęsknić za** takes the instrumental: **za górami**)')],
        ],
        feedback: t('**tęsknić za** + орудний.', '**tęsknić za** + творительный.', '**tęsknić za** + instrumental.'),
      },
    ]),
    wordChoice('vocab.pozegnanie', 'pożegnanie', [t('прощання, слова на відході', 'прощание, слова на прощание', 'a farewell'), t('привітання гостей', 'приветствие гостей', 'a welcome of guests'), t('зустріч після довгої розлуки', 'встреча после долгой разлуки', 'a reunion after a long separation')]),
    fillGap('grammar.pozegnanie', 'Dzięki ___ nauczycielce mówię dziś po polsku.', ['mojej', 'moja', 'moją'], t('Завдяки моїй вчительці я сьогодні говорю польською.', 'Благодаря моей учительнице я сегодня говорю по-польски.', 'Thanks to my teacher I speak Polish today.'),
      t('**dzięki** + давальний: **mojej nauczycielce**.', '**dzięki** + дательный: **mojej nauczycielce**.', '**dzięki** + dative: **mojej nauczycielce**.')),
    match('vocab.pozegnanie', [
      ['trzymaj się', t('бувай, бережи себе', 'пока, береги себя', 'take care')],
      ['do zobaczenia', t('до побачення', 'до свидания', 'see you')],
      ['wszystkiego dobrego', t('усього найкращого', 'всего наилучшего', 'all the best')],
      ['na zakończenie', t('наприкінці, на завершення', 'в завершение, напоследок', 'in closing')],
    ]),
    grammar('grammar.pozegnanie', 'Wczoraj dzięki wam ___ marzenie o Polsce.', 'spełnić', ['spełniłem'], t('Вчора завдяки вам я здійснив мрію про Польщу.', 'Вчера благодаря вам я осуществил мечту о Польше.', 'Yesterday, thanks to you, I fulfilled my dream about Poland.'),
      t('**Wczoraj** — минулий час, результат: **spełniłem**.', '**Wczoraj** — прошедшее время, результат: **spełniłem**.', '**Wczoraj** needs the past tense, and a result takes the perfective: **spełniłem**.')),
    listen('listening.pozegnanie', 'Na zakończenie pozwolę sobie podziękować wszystkim za wspólną podróż.', ['Na zakończenie pozwolę sobie podziękować wszystkim za wspólną podróż.', 'Na zakończenie pozwolę sobie podziękować wszystkim za wspólną pracę.', 'Na zakończenie pozwolę sobie podziękować wszystkich za wspólną podróż.']),
    reading('reading.pozegnanie', 'Droga Kasiu, jutro wracam do domu, ale wiem, że ta podróż zostanie ze mną na zawsze. Zaczęła się w Warszawie, gdzie bałem się zamówić kawę po polsku, a skończyła w Zakopanem, gdzie targowałem się na straganie o ręcznie robiony sweter. Jestem wdzięczny wszystkim, którzy cierpliwie ze mną rozmawiali, nawet gdy popełniałem błędy. Gdyby nie wy, nigdy nie spełniłbym tego marzenia. Obiecuję, że jeszcze tu wrócę.',
      t('Чому автор листа вдячний?', 'Почему автор письма благодарен?', 'Why is the author of the letter grateful?'),
      [t('усім, хто терпляче з ним розмовляв, навіть коли він помилявся', 'всем, кто терпеливо с ним разговаривал, даже когда он ошибался', 'to everyone who talked to him patiently, even when he made mistakes'), t('за допомогу в купівлі светра на ятці', 'за помощь в покупке свитера на лотке', 'for help buying a sweater at the stall'), t('за організацію всієї подорожі', 'за организацию всего путешествия', 'for organising the whole trip')]),
    findError('grammar.pozegnanie', ['Jestem', 'bardzo', 'wdzięczny', 'na', 'waszą', 'pomoc'], 3, t('Я дуже вдячний за вашу допомогу.', 'Я очень благодарен за вашу помощь.', 'I am very grateful for your help.'),
      t('**Wdzięczny za** + знахідний: **za waszą pomoc**.', '**Wdzięczny za** + винительный: **za waszą pomoc**.', '**Wdzięczny za** + accusative: **za waszą pomoc**.')),
    build('grammar.pozegnanie', 'Dzięki wam spełniłem swoje marzenie', t('Завдяки вам я здійснив свою мрію', 'Благодаря вам я осуществил свою мечту', 'Thanks to you I fulfilled my dream'), ['spełnić', 'wami']),
    oddOne('grammar.pozegnanie', ['dziękuję za pomoc', 'jestem wdzięczny za wsparcie', 'dziękuję ci za cierpliwość', 'dziękuję ci na cierpliwość'], 3,
      t('**Dziękować za** + знахідний: **za cierpliwość**.', '**Dziękować za** + винительный: **za cierpliwość**.', '**Dziękować za** + accusative: **za cierpliwość**.'),
      t('Яка фраза містить помилку?', 'Какое выражение содержит ошибку?', 'Which expression contains a mistake?')),
    translate('writing.pozegnanie', t('Наприкінці хочу подякувати всім за допомогу. Завдяки вам я здійснив свою мрію.', 'В завершение хочу поблагодарить всех за помощь. Благодаря вам я осуществил свою мечту.', 'In closing I want to thank everyone for their help. Thanks to you I fulfilled my dream.'),
      ['Na zakończenie chcę podziękować wszystkim za pomoc. Dzięki wam spełniłem swoje marzenie.', 'Na zakończenie chcę podziękować wszystkim za pomoc. Dzięki wam spełniłam swoje marzenie.', 'Na zakończenie chciałbym podziękować wszystkim za pomoc. Dzięki wam spełniłem swoje marzenie.']),
    speak('speaking.pozegnanie', 'Dzięki wam spełniłem marzenie i obiecuję, że jeszcze tu wrócę.', t('Завдяки вам я здійснив мрію й обіцяю, що ще повернуся сюди.', 'Благодаря вам я осуществил мечту и обещаю, что ещё вернусь сюда.', 'Thanks to you I fulfilled a dream and I promise I will come back.')),
  ],
};

export const ZAK_5_8: LessonSeed[] = [ZAK_5, ZAK_6, ZAK_7, ZAK_8];

export const ZAK_BOSS: LessonSeed = {
  slug: 'zak-boss',
  kind: 'BOSS',
  title: t('Бос: Фінал у Закопаному', 'Босс: Финал в Закопане', 'Boss: The finale in Zakopane'),
  topic: t(
    'дієприслівник на -ąc, безособове się, думка й згода, дієприкметники, дієслова з прийменниками, w związku z / z powodu, дискусія, подяка й прощання',
    'деепричастие на -ąc, безличное się, мнение и согласие, причастия, глаголы с предлогами, w związku z / z powodu, дискуссия, благодарность и прощание',
    'the -ąc participle, the impersonal się, opinions and agreement, participles, verbs with prepositions, w związku z / z powodu, debate, thanks and farewell',
  ),
  cefr: 'B2',
  difficulty: 5,
  explanation: t(
    'Остання перевірка: гори й погода, górale, Крупівки, Віткацій, лижі, офіційний лист, дискусія про туризм і прощання. Після неї ти — на рівні B2. Gratulacje!',
    'Последняя проверка: горы и погода, górale, Крупувки, Виткаций, лыжи, официальное письмо, дискуссия о туризме и прощание. После неё ты — на уровне B2. Gratulacje!',
    'The last check: mountains and weather, the górale, Krupówki, Witkacy, skiing, a formal letter, a debate about tourism and the farewell. After it you are at B2 level. Gratulacje!',
  ),
  examples: [],
  words: [],
  exercises: [
    dialogue('situation.boss', KASIA, [
      {
        npc: 'Przyjechałam cię pożegnać na dworcu. Co najlepiej zapamiętałeś z podróży?',
        tr: t('Я приїхала попрощатися з тобою на вокзалі. Що ти найкраще запам’ятав із подорожі?', 'Я приехала проводить тебя на вокзал. Что ты лучше всего запомнил из поездки?', 'I came to see you off at the station. What do you remember best from the journey?'),
        choose: [
          ['Wchodząc na przełęcz, myślałem o wszystkich, którzy mi pomogli.', t('Піднімаючись на перевал, я думав про всіх, хто мені допоміг.', 'Поднимаясь на перевал, я думал обо всех, кто мне помог.', 'Climbing up to the pass I thought of everyone who had helped me.')],
          ['Wchodzący na przełęcz, myślałem o wszystkich, którzy mi pomogli.', t('(одночасна дія — дієприслівник **wchodząc**, а не **wchodzący**)', '(одновременное действие — деепричастие **wchodząc**, а не **wchodzący**)', '(a simultaneous action takes the adverbial **wchodząc**, not **wchodzący**)')],
          ['Wchodząc na przełęcz, myślałem o wszystkich, którym mi pomogli.', t('(підмет підрядного — **którzy** у називному)', '(подлежащее придаточного — **którzy** в именительном)', '(the subject of the clause is **którzy**, nominative)')],
        ],
        feedback: t('Дієприслівник **wchodząc**; підмет підрядного — **którzy**.', 'Деепричастие **wchodząc**; подлежащее придаточного — **którzy**.', 'The adverbial **wchodząc**; the clause’s subject is **którzy**.'),
      },
      {
        npc: 'Wrócisz kiedyś do Zakopanego?',
        tr: t('Чи повернешся колись до Закопаного?', 'Вернёшься ли когда-нибудь в Закопане?', 'Will you ever come back to Zakopane?'),
        choose: [
          ['Na pewno wrócę, żeby wziąć udział w redyku.', t('Неодмінно повернуся, щоб узяти участь у редику.', 'Обязательно вернусь, чтобы принять участие в редыке.', 'I’ll definitely be back to take part in a redyk.')],
          ['Na pewno wrócę, żeby wziąć udział redyku.', t('(**brać udział w** + місцевий: **w redyku**)', '(**brać udział w** + предложный: **w redyku**)', '(**brać udział w** takes the locative: **w redyku**)')],
          ['Na pewno wrócę, żeby wezmę udział w redyku.', t('(мета з тим самим підметом — **żeby** + інфінітив)', '(цель при том же подлежащем — **żeby** + инфинитив)', '(a purpose with the same subject takes **żeby** + infinitive)')],
        ],
        feedback: t('**żeby** + інфінітив; **wziąć udział w** + місцевий.', '**żeby** + инфинитив; **wziąć udział w** + предложный.', '**żeby** + infinitive; **wziąć udział w** + locative.'),
      },
    ], { situation: true, scene: t('Вокзал у Закопаному', 'Вокзал в Закопане', 'Zakopane railway station') }),
    fillGap('grammar.boss', 'Dzięki ___ przewodnikowi dotarliśmy na szczyt.', ['naszemu', 'nasz', 'naszego'], t('Завдяки нашому провідникові ми дійшли до вершини.', 'Благодаря нашему проводнику мы дошли до вершины.', 'Thanks to our guide we reached the summit.'),
      t('**dzięki** + давальний: **naszemu przewodnikowi**.', '**dzięki** + дательный: **naszemu przewodnikowi**.', '**dzięki** + dative: **naszemu przewodnikowi**.')),
    match('grammar.boss', [
      ['w związku z', t('у зв’язку з', 'в связи с', 'in connection with')],
      ['z powodu', t('через, з причини', 'из-за, по причине', 'because of')],
      ['niemniej', t('проте, тим не менш', 'тем не менее', 'nevertheless')],
      ['uznawany za', t('вважається (кимось)', 'считается (кем-то)', 'regarded as')],
    ]),
    grammar('grammar.boss', 'W tym tygodniu obawiam się ___.', 'lawina', ['lawiny'], t('Цього тижня я боюся лавини.', 'На этой неделе я боюсь лавины.', 'This week I am afraid of an avalanche.'),
      t('**obawiać się** + родовий: **lawiny**.', '**obawiać się** + родительный: **lawiny**.', '**obawiać się** + genitive: **lawiny**.')),
    listen('listening.boss', 'Idąc szlakiem, zwróciliśmy uwagę na ostrzeżenie przed halnym.', ['Idąc szlakiem, zwróciliśmy uwagę na ostrzeżenie przed halnym.', 'Idąc szlakiem, zwróciliśmy uwagę na ostrzeżenie przed lawiną.', 'Idąc szlakiem, zwracaliśmy uwagę na ostrzeżenie przed halnym.']),
    reading('reading.boss', 'Szanowny Panie, w związku z Pana rezerwacją informujemy, że zakwaterowanie w pensjonacie jest możliwe od piętnastej. Z powodu remontu schodów prosimy o korzystanie z wejścia od strony ogrodu. Opłatę za pobyt należy uregulować do trzech dni przed przyjazdem; w razie anulowania rezerwacji zwracamy ją w całości, jeśli rezygnacja nastąpi nie później niż siedem dni przed terminem.',
      t('Коли гість отримає назад усю плату?', 'Когда гость получит обратно всю плату?', 'When will the guest get the whole fee back?'),
      [t('якщо відмовиться щонайпізніше за сім днів до терміну', 'если откажется не позднее чем за семь дней до срока', 'if they cancel at least seven days before the date'), t('якщо відмовиться щонайпізніше за три дні до терміну', 'если откажется не позднее чем за три дня до срока', 'if they cancel at least three days before the date'), t('завжди, незалежно від терміну відмови', 'всегда, независимо от срока отказа', 'always, whatever the date of cancellation')]),
    findError('grammar.boss', ['Na', 'straganach', 'można', 'targować', 'się', 'z', 'cenę'], 5, t('На ятках можна торгуватися про ціну.', 'На лотках можно торговаться о цене.', 'You can haggle over the price at the stalls.'),
      t('**targować się o** + знахідний: **o cenę**.', '**targować się o** + винительный: **o cenę**.', '**targować się o** + accusative: **o cenę**.')),
    wordChoice('vocab.boss', 'zaleta', [t('перевага, добра сторона чогось', 'преимущество, хорошая сторона чего-то', 'an advantage'), t('недолік, слабке місце', 'недостаток, слабое место', 'a drawback'), t('витрата, видаток', 'расход, затрата', 'an expense')]),
    build('grammar.boss', 'Dzięki naszemu przewodnikowi dotarliśmy na szczyt', t('Завдяки нашому провідникові ми дійшли до вершини', 'Благодаря нашему проводнику мы дошли до вершины', 'Thanks to our guide we reached the summit'), ['nasz', 'przewodnik']),
    oddOne('grammar.boss', ['w związku z remontem', 'z powodu choroby', 'dzięki pomocy', 'z powodu chorobą'], 3,
      t('**Z powodu** + родовий: **z powodu choroby**.', '**Z powodu** + родительный: **z powodu choroby**.', '**Z powodu** + genitive: **z powodu choroby**.'),
      t('Яка фраза містить помилку?', 'Какое выражение содержит ошибку?', 'Which expression contains a mistake?')),
    translate('writing.boss', t('Ідучи горами, ми знали, що наступного року знову сюди повернемося.', 'Идя по горам, мы знали, что в следующем году снова сюда вернёмся.', 'Walking through the mountains we knew we would come back here next year.'),
      ['Idąc przez góry, wiedzieliśmy, że wrócimy tu w przyszłym roku.', 'Idąc górami, wiedzieliśmy, że wrócimy tu w przyszłym roku.', 'Idąc przez góry, wiedzieliśmy, że wrócimy tu w przyszłym roku']),
    speak('speaking.boss', 'Na zakończenie chciałbym podziękować wszystkim, dzięki którym spełniłem swoje marzenie.', t('Наприкінці я хотів би подякувати всім, завдяки кому здійснив свою мрію.', 'В завершение я хотел бы поблагодарить всех, благодаря кому осуществил свою мечту.', 'In closing I would like to thank everyone thanks to whom I fulfilled my dream.')),
  ],
};
