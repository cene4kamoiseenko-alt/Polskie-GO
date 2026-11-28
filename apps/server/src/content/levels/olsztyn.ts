/**
 * Ольштын — трудные версии уроков (2026-11-28, docs/LEVELS_RU.md, ТЗ 1.0, этап 2). Город понимания речи: переспросить и уточнить,
 * объявления на вокзале, инфолиния, числа из новостей, озёра, длинные предложения, аудиогид по замку, пересказ услышанного.
 * Те же герои (подруга Ania, сотрудница вокзала, консультант pan Piotr, владелец проката pan Zbyszek, кассир pani Marta).
 * Все уроки города — B1, поэтому версия одна — B2. Аудирования в версиях нет (нужна озвучка) — понимание проверяется чтением
 * официальных текстов и диалогами:
 *  • уточнение и перефраз (czy mógłby pan doprecyzować, innymi słowy, chodzi o), язык объявлений (uprzejmie informujemy,
 *    z przyczyn technicznych), деловой звонок и письмо (dzwonię w sprawie, w nawiązaniu do), статистика (wzrosnąć o / do,
 *    stanowić, co trzeci), правила у воды (kąpielisko strzeżone, przestrzegać, grozi mandat), który во всех падежах и «co» на всё
 *    предложение, язык путеводителя (wzniesiony przez, na zlecenie), язык резюме текста (z badań wynika, nie tyle…, ile…).
 * Правила качества — docs/EXERCISE_QUALITY.md. Польский текст написан по нормам языка, но проверка носителем ещё не проводилась
 * (docs/ROADMAP_1_0.md).
 */
import { t, fillGap, reading, dialogue, reverseChoice, build, findError, match } from '../builders';
import type { LessonLevels } from '../types';

const ANIA = { name: 'Ania', emoji: '👩🏼', role: t('подруга з Ольштина', 'подруга из Ольштына', 'a friend from Olsztyn') };
const INFO = { name: 'Pani z informacji', emoji: '👩🏻‍💼', role: t('працівниця вокзалу', 'сотрудница вокзала', 'a station employee') };
const KONSULTANT = { name: 'Pan Piotr', emoji: '🧑🏻‍💻', role: t('консультант інфолінії', 'консультант инфолинии', 'a helpline adviser') };
const ZBYSZEK = { name: 'Pan Zbyszek', emoji: '🧔🏼', role: t('власник прокату каяків', 'владелец проката каяков', 'a kayak rental owner') };
const MARTA = { name: 'Pani Marta', emoji: '👩🏽‍🏫', role: t('касирка в замку', 'кассир в замке', 'a ticket seller at the castle') };

// ───────────────────────────── ols-1-powtorz: Перепитати (урок B1) ─────────────────────────────
const OLS1: LessonLevels = {
  B2: {
    explanation: t(
      'Уточнити й перефразувати, як у діловій розмові:\n• уточнення — **czy mógłby pan doprecyzować…?**, **co ma pan na myśli?**;\n• перефраз — **innymi słowy…**, **jeśli dobrze zrozumiałem, chodzi o to, że…**; **chodzi o** + знахідний;\n• **czy chodzi panu o** + знахідний? — ви маєте на увазі…?\n• ввічливо перебити — **przepraszam, że przerywam**; не встигаю стежити — **nie nadążam**.',
      'Уточнить и перефразировать, как в деловом разговоре:\n• уточнение — **czy mógłby pan doprecyzować…?**, **co ma pan na myśli?**;\n• перефраз — **innymi słowy…**, **jeśli dobrze zrozumiałem, chodzi o to, że…**; **chodzi o** + винительный;\n• **czy chodzi panu o** + винительный? — вы имеете в виду…?\n• вежливо перебить — **przepraszam, że przerywam**; не успеваю следить — **nie nadążam**.',
      'Clarifying and paraphrasing in a business conversation:\n• asking for detail — **czy mógłby pan doprecyzować…?**, **co ma pan na myśli?**;\n• paraphrasing — **innymi słowy…**, **jeśli dobrze zrozumiałem, chodzi o to, że…**; **chodzi o** + accusative;\n• **czy chodzi panu o** + accusative? — do you mean…?\n• interrupting politely — **przepraszam, że przerywam**; I can’t keep up — **nie nadążam**.',
    ),
    examples: [
      { pl: 'Przepraszam, że przerywam — czy mógłby pan doprecyzować termin dostawy?', tr: t('Вибачте, що перебиваю, — чи не могли б ви уточнити термін доставки?', 'Простите, что перебиваю, — не могли бы вы уточнить срок доставки?', 'Sorry to interrupt — could you be more specific about the delivery date?') },
      { pl: 'Jeśli dobrze zrozumiałem, chodzi o to, że faktura była błędna.', tr: t('Якщо я правильно зрозумів, ідеться про те, що рахунок був помилковий.', 'Если я правильно понял, речь о том, что счёт был ошибочным.', 'If I understood correctly, the point is that the invoice was wrong.') },
    ],
    exercises: [
      dialogue('dialogue.clarify', KONSULTANT, [
        {
          npc: 'Zgodnie z regulaminem zwrot jest możliwy po weryfikacji zgłoszenia przez dział techniczny.',
          tr: t('Згідно з правилами повернення можливе після перевірки заявки технічним відділом.', 'Согласно правилам возврат возможен после проверки заявки техническим отделом.', 'Under the rules a refund is possible once the technical team has verified the claim.'),
          choose: [
            ['Przepraszam, nie nadążam. Czy mógłby pan doprecyzować, ile to potrwa?', t('Вибачте, не встигаю. Чи не могли б ви уточнити, скільки це триватиме?', 'Простите, не успеваю. Не могли бы вы уточнить, сколько это продлится?', 'Sorry, I can’t keep up. Could you be more specific about how long it’ll take?')],
            ['Przepraszam, nie nadążam. Czy mógł pan doprecyzować, ile to potrwa?', t('(ввічливе прохання — умовний: **czy mógłby pan**)', '(вежливая просьба — условное: **czy mógłby pan**)', '(polite request — conditional **mógłby**)')],
            ['Przepraszam, nie nadążam się. Czy mógłby pan doprecyzować, ile to potrwa?', t('(**nie nadążam** — без «się»)', '(**nie nadążam** — без «się»)', '(**nie nadążam** takes no «się»)')],
          ],
          feedback: t('**Nie nadążam**; **czy mógłby pan doprecyzować**.', '**Nie nadążam**; **czy mógłby pan doprecyzować**.', '**Nie nadążam**; **czy mógłby pan doprecyzować**.'),
        },
        {
          npc: 'Do czternastu dni roboczych od daty zgłoszenia.',
          tr: t('До чотирнадцяти робочих днів від дати заявки.', 'До четырнадцати рабочих дней с даты заявки.', 'Up to fourteen working days from the date of the claim.'),
          choose: [
            ['Innymi słowy, pieniądze wrócą najpóźniej za dwa tygodnie?', t('Іншими словами, гроші повернуться щонайпізніше за два тижні?', 'Другими словами, деньги вернутся самое позднее через две недели?', 'In other words, I’ll get the money back within two weeks at most?')],
            ['Innym słowem, pieniądze wrócą najpóźniej za dwa tygodnie?', t('(стала фраза — **innymi słowy**)', '(устойчивая фраза — **innymi słowy**)', '(set phrase: **innymi słowy**)')],
            ['Innymi słowy, pieniądze wrócą najpóźniej przez dwa tygodnie?', t('(через скільки — **za** + знахідний; «przez» — протягом)', '(через сколько — **za** + винительный; «przez» — в течение)', '(in how long — **za**; «przez» means for/during)')],
          ],
          feedback: t('**Innymi słowy…**; **za dwa tygodnie**.', '**Innymi słowy…**; **za dwa tygodnie**.', '**Innymi słowy…**; **za dwa tygodnie**.'),
        },
      ]),
      fillGap('register.clarify', 'Czy chodzi panu o ___ za luty, czy za marzec?', ['fakturę', 'faktura', 'faktury', 'fakturze'],
        t('Ви маєте на увазі рахунок за лютий чи за березень?', 'Вы имеете в виду счёт за февраль или за март?', 'Do you mean the February invoice or the March one?'),
        t('**Chodzi o** + знахідний: o **fakturę**.', '**Chodzi o** + винительный: o **fakturę**.', '**Chodzi o** + accusative.')),
      fillGap('register.clarify', 'Przepraszam, że ___, ale to bardzo ważne.', ['przerywam', 'przerywa', 'przerwę', 'przerywać'],
        t('Вибачте, що перебиваю, але це дуже важливо.', 'Простите, что перебиваю, но это очень важно.', 'Sorry to interrupt, but this is very important.'),
        t('Я перебиваю зараз — **przerywam**.', 'Я перебиваю сейчас — **przerywam**.', 'I’m interrupting now — **przerywam**.')),
      fillGap('register.clarify', 'Nie jestem pewien, co ma pan na ___.', ['myśli', 'myśl', 'myślach', 'myśleć'],
        t('Я не впевнений, що ви маєте на увазі.', 'Я не уверен, что вы имеете в виду.', 'I’m not sure what you mean.'),
        t('Стала фраза — **mieć na myśli** (місцевий).', 'Устойчивая фраза — **mieć na myśli** (предложный).', 'Set phrase: **mieć na myśli**.')),
      reading('reading.clarify', 'Notatka z rozmowy: „Klientka nie nadążała za konsultantem i poprosiła, żeby doprecyzował termin zwrotu. Konsultant wyjaśnił, że chodzi o czternaście dni roboczych od daty zgłoszenia, a nie od daty zakupu. Innymi słowy, pieniądze wrócą do połowy przyszłego miesiąca”.',
        t('Від якої дати рахують 14 робочих днів?', 'От какой даты считают 14 рабочих дней?', 'From what date are the 14 working days counted?'),
        [t('від дати заявки', 'от даты заявки', 'from the date of the claim'), t('від дати покупки', 'от даты покупки', 'from the purchase date'), t('від середини наступного місяця', 'с середины следующего месяца', 'from the middle of next month')],
        t('«chodzi o czternaście dni roboczych **od daty zgłoszenia, a nie od daty zakupu**».', '«chodzi o czternaście dni roboczych **od daty zgłoszenia, a nie od daty zakupu**».', '“**od daty zgłoszenia, a nie od daty zakupu**”.')),
      reverseChoice('register.clarify', t('Якщо я правильно зрозумів, ідеться про заміну товару.', 'Если я правильно понял, речь о замене товара.', 'If I understood correctly, it’s about replacing the product.'),
        ['Jeśli dobrze zrozumiałem, chodzi o wymianę towaru.', 'Jeśli dobrze zrozumiałem, chodzi o wymiana towaru.', 'Jeśli dobrze zrozumiałem, chodzi się o wymianę towaru.'],
        t('**Chodzi o** + знахідний: o **wymianę**; без «się».', '**Chodzi o** + винительный: o **wymianę**; без «się».', '**Chodzi o** + accusative; no «się».')),
      findError('register.clarify', ['Czy', 'mógłby', 'pan', 'doprecyzować,', 'o', 'co', 'chodzi', 'się?'], 7,
        t('Чи не могли б ви уточнити, про що йдеться?', 'Не могли бы вы уточнить, о чём идёт речь?', 'Could you clarify what it’s about?'),
        t('**Chodzi o** — без «się».', '**Chodzi o** — без «się».', '**Chodzi o** takes no «się».')),
      build('register.clarify', 'Czy mógłby pan doprecyzować, co ma pan na myśli', t('Чи не могли б ви уточнити, що маєте на увазі', 'Не могли бы вы уточнить, что вы имеете в виду', 'Could you be more specific about what you mean'), ['może', 'myśl'], [],
        t('Ввічливо — **czy mógłby pan**; **mieć na myśli**.', 'Вежливо — **czy mógłby pan**; **mieć na myśli**.', 'Polite **mógłby**; **mieć na myśli**.')),
      match('register.clarify', [
        ['doprecyzować', t('уточнити', 'уточнить', 'to specify')],
        ['innymi słowy', t('іншими словами', 'другими словами', 'in other words')],
        ['nie nadążam', t('не встигаю стежити', 'не успеваю следить', 'I can’t keep up')],
        ['mieć na myśli', t('мати на увазі', 'иметь в виду', 'to mean')],
      ]),
    ],
  },
};

// ───────────────────────────── ols-2-komunikat: Оголошення (урок B1) ─────────────────────────────
const OLS2: LessonLevels = {
  B2: {
    explanation: t(
      'Мова офіційних оголошень:\n• початок — **Uprzejmie informujemy, że…**; кінець — **Za utrudnienia przepraszamy**;\n• причина — **z przyczyn technicznych**, **w związku z** + орудний: w związku **z awarią trakcji** (контактної мережі);\n• заміна — **komunikacja zastępcza**; pociąg **kursuje według zmienionego rozkładu**;\n• прохання — **prosimy o** + знахідний віддієслівного: o **zachowanie ostrożności**, o **niepozostawianie** bagażu.',
      'Язык официальных объявлений:\n• начало — **Uprzejmie informujemy, że…**; конец — **Za utrudnienia przepraszamy**;\n• причина — **z przyczyn technicznych**, **w związku z** + творительный: w związku **z awarią trakcji** (контактной сети);\n• замена — **komunikacja zastępcza**; pociąg **kursuje według zmienionego rozkładu**;\n• просьба — **prosimy o** + винительный отглагольного: o **zachowanie ostrożności**, o **niepozostawianie** bagażu.',
      'The language of official announcements:\n• opening — **Uprzejmie informujemy, że…**; closing — **Za utrudnienia przepraszamy**;\n• cause — **z przyczyn technicznych**, **w związku z** + instrumental: w związku **z awarią trakcji** (overhead line failure);\n• replacement — **komunikacja zastępcza**; pociąg **kursuje według zmienionego rozkładu**;\n• requests — **prosimy o** + accusative verbal noun: o **zachowanie ostrożności**, o **niepozostawianie** bagażu.',
    ),
    examples: [
      { pl: 'Uprzejmie informujemy, że z przyczyn technicznych pociąg do Gdyni jest opóźniony.', tr: t('Повідомляємо, що з технічних причин потяг до Гдині запізнюється.', 'Сообщаем, что по техническим причинам поезд в Гдыню задерживается.', 'We regret to inform you that the train to Gdynia is delayed for technical reasons.') },
      { pl: 'W związku z awarią trakcji uruchomiono komunikację zastępczą.', tr: t('У зв’язку з аварією контактної мережі запустили автобуси заміни.', 'В связи с аварией контактной сети запустили автобусы замены.', 'Owing to an overhead line failure, replacement buses have been laid on.') },
    ],
    exercises: [
      dialogue('dialogue.station', INFO, [
        {
          npc: 'W czym mogę pomóc?',
          tr: t('Чим можу допомогти?', 'Чем могу помочь?', 'How can I help?'),
          choose: [
            ['Usłyszałem komunikat o awarii trakcji. Czy jest komunikacja zastępcza?', t('Я почув оголошення про аварію контактної мережі. Чи є автобуси заміни?', 'Я услышал объявление об аварии контактной сети. Есть автобусы замены?', 'I heard the announcement about the line failure. Are there replacement buses?')],
            ['Usłyszałem komunikat o awarię trakcji. Czy jest komunikacja zastępcza?', t('(**o** + місцевий: o **awarii**)', '(**o** + предложный: o **awarii**)', '(**o** + locative: **awarii**)')],
            ['Usłyszałem komunikat o awarii trakcji. Czy jest komunikacja zastępowa?', t('(термін — **komunikacja zastępcza**)', '(термин — **komunikacja zastępcza**)', '(the term is **zastępcza**)')],
          ],
          feedback: t('**Komunikat o awarii**; **komunikacja zastępcza**.', '**Komunikat o awarii**; **komunikacja zastępcza**.', '**Komunikat o awarii**; **komunikacja zastępcza**.'),
        },
        {
          npc: 'Tak, autobusy odjeżdżają sprzed dworca co pół godziny.',
          tr: t('Так, автобуси відходять від вокзалу щопівгодини.', 'Да, автобусы отправляются от вокзала каждые полчаса.', 'Yes, buses leave from outside the station every half hour.'),
          choose: [
            ['Dziękuję. A czy pociągi do Gdańska kursują według zmienionego rozkładu?', t('Дякую. А потяги до Гданська курсують за зміненим розкладом?', 'Спасибо. А поезда в Гданьск ходят по изменённому расписанию?', 'Thank you. And are trains to Gdańsk running to an amended timetable?')],
            ['Dziękuję. A czy pociągi do Gdańska kursują według zmienionym rozkładem?', t('(**według** + родовий: **zmienionego rozkładu**)', '(**według** + родительный: **zmienionego rozkładu**)', '(**według** + genitive)')],
            ['Dziękuję. A czy pociągi do Gdańska kursuje według zmienionego rozkładu?', t('(pociągi — множина: **kursują**)', '(pociągi — множественное: **kursują**)', '(plural subject: **kursują**)')],
          ],
          feedback: t('**Kursują według zmienionego rozkładu**.', '**Kursują według zmienionego rozkładu**.', '**Kursują według zmienionego rozkładu**.'),
        },
      ]),
      fillGap('register.announcements', 'Uprzejmie ___, że peron trzeci jest nieczynny.', ['informujemy', 'informuje się', 'poinformujemy się', 'informacja'],
        t('Повідомляємо, що третя платформа не працює.', 'Сообщаем, что третья платформа не работает.', 'Please note that platform three is closed.'),
        t('Стала формула — **uprzejmie informujemy, że…**', 'Устойчивая формула — **uprzejmie informujemy, że…**', 'Set formula: **uprzejmie informujemy**.')),
      fillGap('register.announcements', 'Pociąg odjedzie z opóźnieniem z ___ technicznych.', ['przyczyn', 'przyczyny', 'przyczynami', 'przyczynach'],
        t('Потяг відійде із запізненням з технічних причин.', 'Поезд отправится с опозданием по техническим причинам.', 'The train will leave late for technical reasons.'),
        t('**Z** + родовий множини: z **przyczyn** technicznych.', '**Z** + родительный множественного: z **przyczyn** technicznych.', '**Z** + genitive plural.')),
      fillGap('register.announcements', 'Prosimy o ___ ostrożności podczas wsiadania do pociągu.', ['zachowanie', 'zachowania', 'zachować', 'zachowaniem'],
        t('Просимо бути обережними під час посадки в потяг.', 'Просим соблюдать осторожность при посадке в поезд.', 'Please take care when boarding the train.'),
        t('**Prosić o** + знахідний: o **zachowanie**.', '**Prosić o** + винительный: o **zachowanie**.', '**Prosić o** + accusative.')),
      reading('reading.announcements', 'Komunikat: „Uprzejmie informujemy, że w związku z awarią trakcji między Olsztynem a Iławą pociągi kursują według zmienionego rozkładu. Na odcinku Olsztyn – Morąg uruchomiono komunikację zastępczą. Bilety zachowują ważność w autobusach. Za utrudnienia przepraszamy”.',
        t('Що відбувається з квитками на потяг?', 'Что происходит с билетами на поезд?', 'What happens to train tickets?'),
        [t('вони дійсні в автобусах заміни', 'они действуют в автобусах замены', 'they are valid on the replacement buses'), t('їх треба обміняти в касі', 'их нужно обменять в кассе', 'they must be exchanged at the ticket office'), t('гроші за них повертають', 'деньги за них возвращают', 'they are refunded')],
        t('«**Bilety zachowują ważność w autobusach**» — квитки дійсні.', '«**Bilety zachowują ważność w autobusach**» — билеты действительны.', '“**Bilety zachowują ważność**” — tickets remain valid.')),
      reverseChoice('register.announcements', t('Вибачаємося за незручності.', 'Приносим извинения за неудобства.', 'We apologise for the inconvenience.'),
        ['Za utrudnienia przepraszamy.', 'Za utrudnieniami przepraszamy.', 'Na utrudnienia przepraszamy.'],
        t('Стала формула — **za utrudnienia przepraszamy** (za + знахідний).', 'Устойчивая формула — **za utrudnienia przepraszamy** (za + винительный).', 'Set formula: **za utrudnienia**.')),
      findError('register.announcements', ['W', 'związku', 'z', 'awaria', 'pociąg', 'jest', 'opóźniony'], 3,
        t('У зв’язку з аварією потяг запізнюється.', 'В связи с аварией поезд задерживается.', 'Owing to a breakdown, the train is delayed.'),
        t('**W związku z** + орудний: z **awarią**.', '**W związku z** + творительный: z **awarią**.', '**W związku z** + instrumental.')),
      build('register.announcements', 'Uprzejmie informujemy, że peron jest nieczynny', t('Повідомляємо, що платформа не працює', 'Сообщаем, что платформа не работает', 'Please note that the platform is closed'), ['informuje', 'czynny'], [],
        t('Формула — **uprzejmie informujemy, że…**', 'Формула — **uprzejmie informujemy, że…**', 'Formula: **uprzejmie informujemy**.')),
      match('register.announcements', [
        ['komunikacja zastępcza', t('автобуси заміни', 'автобусы замены', 'replacement transport')],
        ['awaria trakcji', t('аварія контактної мережі', 'авария контактной сети', 'overhead line failure')],
        ['z przyczyn technicznych', t('з технічних причин', 'по техническим причинам', 'for technical reasons')],
        ['zachowywać ważność', t('бути дійсним', 'оставаться действительным', 'to remain valid')],
      ]),
    ],
  },
};

// ───────────────────────────── ols-3-telefon: Інфолінія (урок B1) ─────────────────────────────
const OLS3: LessonLevels = {
  B2: {
    explanation: t(
      'Діловий дзвінок і лист після нього:\n• мета — **dzwonię w sprawie** + родовий: w sprawie **reklamacji**, **zamówienia**;\n• скарга — **złożyć reklamację**; **numer zgłoszenia**; **proszę o pilny kontakt**;\n• лист — **W nawiązaniu do naszej rozmowy telefonicznej…** (на продовження нашої розмови), **W załączniku przesyłam…** (у додатку надсилаю), **Z poważaniem** (з повагою);\n• **zwracam się z prośbą o** + знахідний — звертаюся з проханням.',
      'Деловой звонок и письмо после него:\n• цель — **dzwonię w sprawie** + родительный: w sprawie **reklamacji**, **zamówienia**;\n• жалоба — **złożyć reklamację**; **numer zgłoszenia**; **proszę o pilny kontakt**;\n• письмо — **W nawiązaniu do naszej rozmowy telefonicznej…** (в продолжение нашего разговора), **W załączniku przesyłam…** (во вложении направляю), **Z poważaniem** (с уважением);\n• **zwracam się z prośbą o** + винительный — обращаюсь с просьбой.',
      'A business call and the follow-up email:\n• the reason — **dzwonię w sprawie** + genitive: w sprawie **reklamacji**, **zamówienia**;\n• complaints — **złożyć reklamację**; **numer zgłoszenia** (ticket number); **proszę o pilny kontakt**;\n• the email — **W nawiązaniu do naszej rozmowy telefonicznej…** (further to our call), **W załączniku przesyłam…** (please find attached), **Z poważaniem** (yours sincerely);\n• **zwracam się z prośbą o** + accusative — I am writing to request.',
    ),
    examples: [
      { pl: 'Dzwonię w sprawie reklamacji, którą złożyłem w zeszłym tygodniu.', tr: t('Телефоную щодо скарги, яку подав минулого тижня.', 'Звоню по поводу рекламации, которую подал на прошлой неделе.', 'I’m calling about the complaint I made last week.') },
      { pl: 'W nawiązaniu do naszej rozmowy telefonicznej w załączniku przesyłam skan faktury.', tr: t('На продовження нашої телефонної розмови надсилаю в додатку скан рахунку.', 'В продолжение нашего телефонного разговора направляю во вложении скан счёта.', 'Further to our phone call, please find attached a scan of the invoice.') },
    ],
    exercises: [
      dialogue('dialogue.phone', KONSULTANT, [
        {
          npc: 'Infolinia, Piotr Kowalski, w czym mogę pomóc?',
          tr: t('Інфолінія, Пйотр Ковальський, чим можу допомогти?', 'Инфолиния, Пётр Ковальский, чем могу помочь?', 'Helpline, Piotr Kowalski speaking, how can I help?'),
          choose: [
            ['Dzwonię w sprawie reklamacji pralki, którą złożyłam dwa tygodnie temu.', t('Телефоную щодо скарги на пральну машину, яку подала два тижні тому.', 'Звоню по поводу рекламации стиральной машины, которую подала две недели назад.', 'I’m calling about the washing-machine complaint I made two weeks ago.')],
            ['Dzwonię w sprawę reklamacji pralki, którą złożyłam dwa tygodnie temu.', t('(**w sprawie** + родовий — стала формула)', '(**w sprawie** + родительный — устойчивая формула)', '(set formula: **w sprawie**)')],
            ['Dzwonię w sprawie reklamacji pralki, który złożyłam dwa tygodnie temu.', t('(reklamacja — жіночий рід: **którą**)', '(reklamacja — женский род: **którą**)', '(feminine: **którą**)')],
          ],
          feedback: t('**Dzwonię w sprawie** + родовий.', '**Dzwonię w sprawie** + родительный.', '**Dzwonię w sprawie** + genitive.'),
        },
        {
          npc: 'Rozumiem. Czy ma pani numer zgłoszenia?',
          tr: t('Розумію. У вас є номер заявки?', 'Понимаю. У вас есть номер заявки?', 'I see. Do you have the ticket number?'),
          choose: [
            ['Tak, ale wolałabym, żeby ktoś skontaktował się ze mną pilnie.', t('Так, але я б хотіла, щоб зі мною терміново зв’язалися.', 'Да, но я бы хотела, чтобы со мной срочно связались.', 'Yes, but I’d like someone to contact me urgently.')],
            ['Tak, ale wolałabym, żeby ktoś skontaktuje się ze mną pilnie.', t('(після **żeby** — форма на -ł: **skontaktował**)', '(после **żeby** — форма на -ł: **skontaktował**)', '(after **żeby** — the -ł form)')],
            ['Tak, ale wolałabym, żeby ktoś skontaktował się z mną pilnie.', t('(перед «mn-» — **ze mną**)', '(перед «mn-» — **ze mną**)', '(before «mn-» — **ze mną**)')],
          ],
          feedback: t('**Żeby ktoś skontaktował się ze mną**.', '**Żeby ktoś skontaktował się ze mną**.', '**Żeby ktoś skontaktował się ze mną**.'),
        },
      ]),
      fillGap('register.phone', 'W ___ do naszej rozmowy telefonicznej przesyłam wymagane dokumenty.', ['nawiązaniu', 'nawiązanie', 'nawiązania', 'nawiązując'],
        t('На продовження нашої телефонної розмови надсилаю потрібні документи.', 'В продолжение нашего телефонного разговора направляю нужные документы.', 'Further to our phone call, I am sending the required documents.'),
        t('Формула листа — **w nawiązaniu do** + родовий.', 'Формула письма — **w nawiązaniu do** + родительный.', 'Email formula: **w nawiązaniu do**.')),
      fillGap('register.phone', 'W ___ przesyłam skan paragonu.', ['załączniku', 'załącznik', 'załącznika', 'załączniki'],
        t('У додатку надсилаю скан чека.', 'Во вложении направляю скан чека.', 'Please find attached a scan of the receipt.'),
        t('Де — **w** + місцевий: w **załączniku**.', 'Где — **w** + предложный: w **załączniku**.', '**W** + locative: **załączniku**.')),
      fillGap('register.phone', 'Zwracam się z prośbą o ___ terminu płatności.', ['przedłużenie', 'przedłużenia', 'przedłużeniem', 'przedłużyć'],
        t('Звертаюся з проханням продовжити термін оплати.', 'Обращаюсь с просьбой продлить срок оплаты.', 'I am writing to request an extension of the payment deadline.'),
        t('**Prośba o** + знахідний: o **przedłużenie**.', '**Prośba o** + винительный: o **przedłużenie**.', '**Prośba o** + accusative.')),
      reading('reading.phone', 'E-mail: „Szanowni Państwo, w nawiązaniu do rozmowy telefonicznej z dnia 3 maja zwracam się z prośbą o wymianę uszkodzonego czajnika. W załączniku przesyłam zdjęcie oraz dowód zakupu. Numer zgłoszenia: 4512/24. Proszę o pilny kontakt. Z poważaniem, Anna Wiśniewska”.',
        t('Про що просить авторка листа?', 'О чём просит автор письма?', 'What is the writer asking for?'),
        [t('замінити пошкоджений чайник', 'заменить повреждённый чайник', 'to replace a damaged kettle'), t('повернути гроші за чайник', 'вернуть деньги за чайник', 'a refund for the kettle'), t('надіслати їй номер заявки', 'прислать ей номер заявки', 'to send her the ticket number')],
        t('«zwracam się **z prośbą o wymianę** uszkodzonego czajnika» — заміна, а не повернення грошей.', '«zwracam się **z prośbą o wymianę** uszkodzonego czajnika» — замена, а не возврат денег.', '“**z prośbą o wymianę**” — a replacement, not a refund.')),
      reverseChoice('register.phone', t('Прошу терміново зв’язатися зі мною.', 'Прошу срочно связаться со мной.', 'Please contact me urgently.'),
        ['Proszę o pilny kontakt.', 'Proszę o pilnego kontaktu.', 'Proszę pilny kontakt.'],
        t('**Proszę o** + знахідний: o **pilny kontakt**.', '**Proszę o** + винительный: o **pilny kontakt**.', '**Proszę o** + accusative.')),
      findError('register.phone', ['Dzwonię', 'w', 'sprawie', 'zamówienie', 'numer', 'sto', 'dwa'], 3,
        t('Телефоную щодо замовлення номер сто два.', 'Звоню по поводу заказа номер сто два.', 'I’m calling about order number 102.'),
        t('**W sprawie** + родовий: **zamówienia**.', '**W sprawie** + родительный: **zamówienia**.', '**W sprawie** + genitive.')),
      build('register.phone', 'Dzwonię w sprawie reklamacji, którą złożyłem w maju', t('Телефоную щодо скарги, яку подав у травні', 'Звоню по поводу рекламации, которую подал в мае', 'I’m calling about the complaint I filed in May'), ['sprawę', 'który'], [],
        t('**W sprawie** + родовий; reklamacja — жіночий рід: **którą**.', '**W sprawie** + родительный; reklamacja — женский род: **którą**.', '**W sprawie**; feminine **którą**.')),
      match('register.phone', [
        ['numer zgłoszenia', t('номер заявки', 'номер заявки', 'ticket number')],
        ['w załączniku', t('у додатку', 'во вложении', 'attached')],
        ['z poważaniem', t('з повагою', 'с уважением', 'yours sincerely')],
        ['złożyć reklamację', t('подати скаргу', 'подать рекламацию', 'to file a complaint')],
      ]),
    ],
  },
};

// ───────────────────────────── ols-4-okolo: Числа з новин (урок B1) ─────────────────────────────
const OLS4: LessonLevels = {
  B2: {
    explanation: t(
      'Мова статистики:\n• зміна — **wzrosnąć o** + знахідний (на скільки) / **do** + родовий (до якого рівня): wzrosła **o** 5 procent, **do** 20 procent; **spadek o** + знахідний;\n• частка — **co trzeci** mieszkaniec (кожен третій); **odsetek** + родовий; **stanowić** + знахідний: kobiety **stanowią** 60 procent;\n• порівняння — **w porównaniu z** + орудний: w porównaniu **z zeszłym rokiem**; **niemal dwukrotnie** — майже вдвічі.',
      'Язык статистики:\n• изменение — **wzrosnąć o** + винительный (на сколько) / **do** + родительный (до какого уровня): wzrosła **o** 5 procent, **do** 20 procent; **spadek o** + винительный;\n• доля — **co trzeci** mieszkaniec (каждый третий); **odsetek** + родительный; **stanowić** + винительный: kobiety **stanowią** 60 procent;\n• сравнение — **w porównaniu z** + творительный: w porównaniu **z zeszłym rokiem**; **niemal dwukrotnie** — почти вдвое.',
      'The language of statistics:\n• change — **wzrosnąć o** + accusative (by how much) / **do** + genitive (to what level): wzrosła **o** 5 procent, **do** 20 procent; **spadek o** + accusative;\n• share — **co trzeci** mieszkaniec (one in three); **odsetek** + genitive; **stanowić** + accusative: kobiety **stanowią** 60 procent;\n• comparison — **w porównaniu z** + instrumental: w porównaniu **z zeszłym rokiem**; **niemal dwukrotnie** — almost twice.',
    ),
    examples: [
      { pl: 'W porównaniu z zeszłym rokiem liczba turystów wzrosła o jedną czwartą.', tr: t('Порівняно з минулим роком кількість туристів зросла на чверть.', 'По сравнению с прошлым годом число туристов выросло на четверть.', 'Compared with last year, tourist numbers rose by a quarter.') },
      { pl: 'Co trzeci mieszkaniec Olsztyna dojeżdża do pracy tramwajem.', tr: t('Кожен третій мешканець Ольштина їздить на роботу трамваєм.', 'Каждый третий житель Ольштына ездит на работу на трамвае.', 'One in three Olsztyn residents commutes by tram.') },
    ],
    exercises: [
      dialogue('dialogue.numbers', ANIA, [
        {
          npc: 'Czytałeś raport o turystyce na Warmii? Co tam piszą?',
          tr: t('Ти читав звіт про туризм на Вармії? Що там пишуть?', 'Ты читал отчёт о туризме на Вармии? Что там пишут?', 'Have you read the report on tourism in Warmia? What does it say?'),
          choose: [
            ['Że liczba turystów wzrosła o piętnaście procent w porównaniu z zeszłym rokiem.', t('Що кількість туристів зросла на п’ятнадцять відсотків порівняно з минулим роком.', 'Что число туристов выросло на пятнадцать процентов по сравнению с прошлым годом.', 'That tourist numbers rose by fifteen per cent compared with last year.')],
            ['Że liczba turystów wzrosła na piętnaście procent w porównaniu z zeszłym rokiem.', t('(на скільки — **o** + знахідний; «na» — калька)', '(на сколько — **o** + винительный; «na» — калька)', '(by how much — **o**, not «na»)')],
            ['Że liczba turystów wzrosła o piętnaście procent w porównaniu z zeszły rok.', t('(**w porównaniu z** + орудний: z **zeszłym rokiem**)', '(**w porównaniu z** + творительный: z **zeszłym rokiem**)', '(**z** + instrumental: **zeszłym rokiem**)')],
          ],
          feedback: t('**Wzrosła o** + знахідний; **w porównaniu z** + орудний.', '**Wzrosła o** + винительный; **w porównaniu z** + творительный.', '**Wzrosła o**; **w porównaniu z** + instrumental.'),
        },
        {
          npc: 'A skąd przyjeżdżają?',
          tr: t('А звідки вони приїжджають?', 'А откуда они приезжают?', 'And where do they come from?'),
          choose: [
            ['Turyści z zagranicy stanowią prawie jedną trzecią wszystkich gości.', t('Іноземні туристи становлять майже третину всіх гостей.', 'Иностранные туристы составляют почти треть всех гостей.', 'Foreign visitors make up almost a third of all guests.')],
            ['Turyści z zagranicy stanowią prawie jedna trzecia wszystkich gości.', t('(**stanowić** + знахідний: **jedną trzecią**)', '(**stanowić** + винительный: **jedną trzecią**)', '(**stanowić** + accusative)')],
            ['Turyści z zagranicy stanowi prawie jedną trzecią wszystkich gości.', t('(turyści — множина: **stanowią**)', '(turyści — множественное: **stanowią**)', '(plural: **stanowią**)')],
          ],
          feedback: t('**Stanowić** + знахідний.', '**Stanowić** + винительный.', '**Stanowić** + accusative.'),
        },
      ]),
      fillGap('register.statistics', 'Bezrobocie spadło ___ pięciu procent.', ['do', 'o', 'na', 'w'],
        t('Безробіття знизилося до п’яти відсотків.', 'Безработица снизилась до пяти процентов.', 'Unemployment fell to five per cent.'),
        t('«pięciu procent» — родовий, отже до якого рівня: **do**. (O + знахідний: o pięć procent.)', '«pięciu procent» — родительный, значит до какого уровня: **do**. (O + винительный: o pięć procent.)', 'The genitive «pięciu procent» needs **do** (to what level).')),
      fillGap('register.statistics', '___ trzeci mieszkaniec regionu nie ma samochodu.', ['Co', 'Każdy', 'Na', 'Raz'],
        t('Кожен третій мешканець регіону не має автомобіля.', 'Каждый третий житель региона не имеет машины.', 'One in three residents of the region doesn’t own a car.'),
        t('Кожен третій — **co trzeci** (не «każdy trzeci»).', 'Каждый третий — **co trzeci** (не «każdy trzeci»).', 'One in three — **co trzeci**.')),
      fillGap('register.statistics', 'Odsetek ___ korzystających z rowerów miejskich wzrósł niemal dwukrotnie.', ['osób', 'osoby', 'osobom', 'osobami'],
        t('Частка людей, що користуються міськими велосипедами, зросла майже вдвічі.', 'Доля людей, пользующихся городскими велосипедами, выросла почти вдвое.', 'The share of people using city bikes almost doubled.'),
        t('**Odsetek** + родовий множини: **osób**.', '**Odsetek** + родительный множественного: **osób**.', '**Odsetek** + genitive plural.')),
      reading('reading.statistics', 'Z raportu urzędu: „W porównaniu z 2022 rokiem liczba pasażerów tramwajów w Olsztynie wzrosła o 18 procent — do ponad 20 milionów rocznie. Studenci stanowią około 40 procent pasażerów. Co trzeci ankietowany deklaruje, że zrezygnował z samochodu”.',
        t('На скільки зросла кількість пасажирів трамваїв?', 'На сколько выросло число пассажиров трамваев?', 'By how much did tram ridership grow?'),
        [t('на 18 відсотків', 'на 18 процентов', 'by 18 per cent'), t('на 40 відсотків', 'на 40 процентов', 'by 40 per cent'), t('до 18 мільйонів', 'до 18 миллионов', 'to 18 million')],
        t('«wzrosła **o 18 procent** — **do** ponad 20 milionów»: «o» — на скільки, «do» — до якого рівня; 40 % — частка студентів.', '«wzrosła **o 18 procent** — **do** ponad 20 milionów»: «o» — на сколько, «do» — до какого уровня; 40 % — доля студентов.', '“**o 18 procent**” is the rise; “**do** 20 milionów” the level; 40 % are students.')),
      reverseChoice('register.statistics', t('Жінки становлять більшість працівників.', 'Женщины составляют большинство сотрудников.', 'Women make up the majority of the staff.'),
        ['Kobiety stanowią większość pracowników.', 'Kobiety stanowią większością pracowników.', 'Kobiety składają większość pracowników.'],
        t('**Stanowić** + знахідний: **większość**.', '**Stanowić** + винительный: **większość**.', '**Stanowić** + accusative.')),
      findError('register.statistics', ['Ceny', 'mieszkań', 'wzrosły', 'na', 'dziesięć', 'procent'], 3,
        t('Ціни на квартири зросли на десять відсотків.', 'Цены на квартиры выросли на десять процентов.', 'Flat prices rose by ten per cent.'),
        t('На скільки — **o** + знахідний: **o** dziesięć procent.', 'На сколько — **o** + винительный: **o** dziesięć procent.', 'By how much — **o**.')),
      build('register.statistics', 'W porównaniu z zeszłym rokiem sprzedaż spadła o połowę', t('Порівняно з минулим роком продажі впали вдвічі', 'По сравнению с прошлым годом продажи упали вдвое', 'Compared with last year, sales halved'), ['zeszły', 'na'], ['Sprzedaż spadła o połowę w porównaniu z zeszłym rokiem'],
        t('**W porównaniu z** + орудний; **spaść o** + знахідний: o **połowę**.', '**W porównaniu z** + творительный; **spaść o** + винительный: o **połowę**.', '**W porównaniu z** + instrumental; **o połowę**.')),
      match('register.statistics', [
        ['co trzeci', t('кожен третій', 'каждый третий', 'one in three')],
        ['odsetek', t('частка, відсоток', 'доля, процент', 'percentage')],
        ['niemal dwukrotnie', t('майже вдвічі', 'почти вдвое', 'almost twice')],
        ['stanowić większość', t('становити більшість', 'составлять большинство', 'to make up the majority')],
      ]),
    ],
  },
};

// ───────────────────────────── ols-5-jezioro: Над озером (урок B1) ─────────────────────────────
const OLS5: LessonLevels = {
  B2: {
    explanation: t(
      'Правила біля води й у заповіднику:\n• **kąpielisko strzeżone** — з рятувальником; **niestrzeżone** — без нього;\n• **na terenie** + родовий: na terenie **rezerwatu**, **obszar chroniony** (охоронна територія);\n• **przestrzegać** + родовий: przestrzegać **regulaminu**, **zakazu**;\n• **zabrania się** + родовий віддієслівного: zabrania się **zaśmiecania**, **rozpalania ognisk**;\n• наслідки — **grozi** + називний: za to **grozi mandat** (штраф).',
      'Правила у воды и в заповеднике:\n• **kąpielisko strzeżone** — со спасателем; **niestrzeżone** — без него;\n• **na terenie** + родительный: na terenie **rezerwatu**, **obszar chroniony** (охраняемая территория);\n• **przestrzegać** + родительный: przestrzegać **regulaminu**, **zakazu**;\n• **zabrania się** + родительный отглагольного: zabrania się **zaśmiecania**, **rozpalania ognisk**;\n• последствия — **grozi** + именительный: za to **grozi mandat** (штраф).',
      'Rules by the water and in a reserve:\n• **kąpielisko strzeżone** — with a lifeguard; **niestrzeżone** — without;\n• **na terenie** + genitive: na terenie **rezerwatu**, **obszar chroniony** (protected area);\n• **przestrzegać** + genitive: przestrzegać **regulaminu**, **zakazu**;\n• **zabrania się** + genitive verbal noun: zabrania się **zaśmiecania**, **rozpalania ognisk**;\n• consequences — **grozi** + nominative: za to **grozi mandat** (a fine).',
    ),
    examples: [
      { pl: 'Na terenie rezerwatu zabrania się rozpalania ognisk.', tr: t('На території заповідника забороняється розпалювати багаття.', 'На территории заповедника запрещается разводить костры.', 'Lighting fires is prohibited within the reserve.') },
      { pl: 'Za kąpiel poza kąpieliskiem strzeżonym grozi mandat.', tr: t('За купання поза охоронюваним пляжем загрожує штраф.', 'За купание вне охраняемого пляжа грозит штраф.', 'Swimming outside the supervised area may incur a fine.') },
    ],
    exercises: [
      dialogue('dialogue.lake', ZBYSZEK, [
        {
          npc: 'Kajak na cały dzień? Proszę tylko pamiętać o regulaminie.',
          tr: t('Каяк на цілий день? Тільки пам’ятайте про правила.', 'Каяк на весь день? Только помните о правилах.', 'A kayak for the whole day? Just remember the rules.'),
          choose: [
            ['Oczywiście, będziemy przestrzegać regulaminu. A gdzie wolno się kąpać?', t('Звісно, ми дотримуватимемося правил. А де можна купатися?', 'Конечно, мы будем соблюдать правила. А где можно купаться?', 'Of course, we’ll follow the rules. Where can we swim?')],
            ['Oczywiście, będziemy przestrzegać regulamin. A gdzie wolno się kąpać?', t('(**przestrzegać** + родовий: **regulaminu**)', '(**przestrzegać** + родительный: **regulaminu**)', '(**przestrzegać** + genitive)')],
            ['Oczywiście, będziemy przestrzegać regulaminu. A gdzie wolno kąpać?', t('(купатися — **kąpać się**)', '(купаться — **kąpać się**)', '(to swim — **kąpać się**)')],
          ],
          feedback: t('**Przestrzegać regulaminu**; **kąpać się**.', '**Przestrzegać regulaminu**; **kąpać się**.', '**Przestrzegać regulaminu**; **kąpać się**.'),
        },
        {
          npc: 'Tylko na kąpielisku strzeżonym przy pomoście. Dalej zaczyna się rezerwat.',
          tr: t('Лише на охоронюваному пляжі біля помосту. Далі починається заповідник.', 'Только на охраняемом пляже у мостков. Дальше начинается заповедник.', 'Only at the supervised beach by the jetty. Beyond that is the reserve.'),
          choose: [
            ['Rozumiem. Na terenie rezerwatu nie będziemy przybijać do brzegu.', t('Зрозуміло. На території заповідника ми не приставатимемо до берега.', 'Понятно. На территории заповедника мы не будем причаливать к берегу.', 'Got it. We won’t land on the shore inside the reserve.')],
            ['Rozumiem. Na terenie rezerwat nie będziemy przybijać do brzegu.', t('(**na terenie** + родовий: **rezerwatu**)', '(**na terenie** + родительный: **rezerwatu**)', '(**na terenie** + genitive)')],
            ['Rozumiem. W terenie rezerwatu nie będziemy przybijać do brzegu.', t('(стала формула — **na terenie**)', '(устойчивая формула — **na terenie**)', '(set phrase: **na terenie**)')],
          ],
          feedback: t('**Na terenie rezerwatu**.', '**Na terenie rezerwatu**.', '**Na terenie rezerwatu**.'),
        },
      ]),
      fillGap('register.rules', 'Na terenie parku zabrania się ___.', ['zaśmiecania', 'zaśmiecanie', 'zaśmiecać', 'zaśmiecaniem'],
        t('На території парку забороняється смітити.', 'На территории парка запрещается мусорить.', 'Littering is prohibited in the park.'),
        t('**Zabrania się** + родовий віддієслівного: **zaśmiecania**.', '**Zabrania się** + родительный отглагольного: **zaśmiecania**.', '**Zabrania się** + genitive verbal noun.')),
      fillGap('register.rules', 'Za wjazd motorówką do rezerwatu ___ wysoki mandat.', ['grozi', 'grożą', 'grozić', 'grożono'],
        t('За в’їзд моторним човном у заповідник загрожує високий штраф.', 'За въезд на моторной лодке в заповедник грозит большой штраф.', 'Entering the reserve by motorboat may incur a heavy fine.'),
        t('Що загрожує — mandat (однина): **grozi**.', 'Что грозит — mandat (единственное): **grozi**.', 'Singular subject: **grozi**.')),
      fillGap('register.rules', 'Kąpać się można wyłącznie na kąpielisku ___.', ['strzeżonym', 'strzeżony', 'strzeżonego', 'strzeżonej'],
        t('Купатися можна виключно на охоронюваному пляжі.', 'Купаться можно исключительно на охраняемом пляже.', 'Swimming is allowed only at the supervised beach.'),
        t('**Na** + місцевий: na kąpielisku **strzeżonym**.', '**Na** + предложный: na kąpielisku **strzeżonym**.', '**Na** + locative.')),
      reading('reading.rules', 'Tablica przy jeziorze: „Kąpielisko strzeżone czynne codziennie od 10:00 do 18:00. Poza tymi godzinami kąpiel na własną odpowiedzialność. Na terenie rezerwatu, czyli za żółtymi bojami, obowiązuje zakaz pływania motorówkami i przybijania do brzegu. Za nieprzestrzeganie zakazu grozi mandat do 500 zł”.',
        t('Що заборонено за жовтими буями?', 'Что запрещено за жёлтыми буями?', 'What is banned beyond the yellow buoys?'),
        [t('моторні човни й приставання до берега', 'моторные лодки и причаливание к берегу', 'motorboats and landing on the shore'), t('купання після 18:00', 'купание после 18:00', 'swimming after 6 p.m.'), t('будь-яке плавання на каяках', 'любое катание на каяках', 'any kayaking')],
        t('«za żółtymi bojami, obowiązuje **zakaz pływania motorówkami i przybijania do brzegu**». Після 18:00 купання не заборонене — на власну відповідальність.', '«za żółtymi bojami, obowiązuje **zakaz pływania motorówkami i przybijania do brzegu**». После 18:00 купание не запрещено — на свой страх и риск.', '“**zakaz pływania motorówkami i przybijania do brzegu**”; swimming after 6 is at your own risk, not banned.')),
      reverseChoice('register.rules', t('Ми завжди дотримуємося заборони.', 'Мы всегда соблюдаем запрет.', 'We always respect the ban.'),
        ['Zawsze przestrzegamy zakazu.', 'Zawsze przestrzegamy zakaz.', 'Zawsze przestrzegamy się zakazu.'],
        t('**Przestrzegać** + родовий, без «się»: **zakazu**.', '**Przestrzegać** + родительный, без «się»: **zakazu**.', '**Przestrzegać** + genitive, no «się».')),
      findError('register.rules', ['Na', 'terenie', 'rezerwat', 'nie', 'wolno', 'łowić', 'ryb'], 2,
        t('На території заповідника не можна ловити рибу.', 'На территории заповедника нельзя ловить рыбу.', 'Fishing is not allowed in the reserve.'),
        t('**Na terenie** + родовий: **rezerwatu**.', '**Na terenie** + родительный: **rezerwatu**.', '**Na terenie** + genitive.')),
      build('register.rules', 'Na terenie rezerwatu zabrania się rozpalania ognisk', t('На території заповідника забороняється розпалювати багаття', 'На территории заповедника запрещается разводить костры', 'Lighting fires is prohibited in the reserve'), ['rozpalać', 'rezerwat'], ['Zabrania się rozpalania ognisk na terenie rezerwatu'],
        t('**Na terenie** + родовий; **zabrania się** + родовий віддієслівного.', '**Na terenie** + родительный; **zabrania się** + родительный отглагольного.', '**Na terenie** + genitive; **zabrania się** + genitive.')),
      match('register.rules', [
        ['kąpielisko strzeżone', t('охоронюваний пляж', 'охраняемый пляж', 'supervised beach')],
        ['obszar chroniony', t('охоронна територія', 'охраняемая территория', 'protected area')],
        ['grozi mandat', t('загрожує штраф', 'грозит штраф', 'a fine may be imposed')],
        ['przybić do brzegu', t('пристати до берега', 'причалить к берегу', 'to land on the shore')],
      ]),
    ],
  },
};

// ───────────────────────────── ols-6-ktory: Довгі речення (урок B1) ─────────────────────────────
const OLS6: LessonLevels = {
  B2: {
    explanation: t(
      '**Który** у всіх відмінках і «co» на все речення:\n• відмінок — за роллю в підрядному: człowiek, **którego** znam; firma, **w której** pracuję; ludzie, **z którymi** rozmawiałem;\n• **dzięki któremu / której** (давальний) — завдяки якому;\n• **co** — про все попереднє речення: Spóźnił się, **co** mnie zdziwiło; із запереченням — **czego**: …, **czego** nie rozumiem;\n• узагальнення — **ten, kto…**: **Kto** pyta, **ten** nie błądzi.',
      '**Który** во всех падежах и «co» на всё предложение:\n• падеж — по роли в придаточном: człowiek, **którego** znam; firma, **w której** pracuję; ludzie, **z którymi** rozmawiałem;\n• **dzięki któremu / której** (дательный) — благодаря которому;\n• **co** — о всём предыдущем предложении: Spóźnił się, **co** mnie zdziwiło; с отрицанием — **czego**: …, **czego** nie rozumiem;\n• обобщение — **ten, kto…**: **Kto** pyta, **ten** nie błądzi.',
      '**Który** in every case, and «co» for a whole clause:\n• the case follows its role in the clause: człowiek, **którego** znam; firma, **w której** pracuję; ludzie, **z którymi** rozmawiałem;\n• **dzięki któremu / której** (dative) — thanks to which;\n• **co** refers to the whole previous clause: Spóźnił się, **co** mnie zdziwiło; with negation — **czego**: …, **czego** nie rozumiem;\n• generalising — **ten, kto…**: **Kto** pyta, **ten** nie błądzi.',
    ),
    examples: [
      { pl: 'To jest przewodnik, dzięki któremu poznałam historię Warmii.', tr: t('Це путівник, завдяки якому я пізнала історію Вармії.', 'Это путеводитель, благодаря которому я узнала историю Вармии.', 'This is the guidebook that taught me the history of Warmia.') },
      { pl: 'Pociąg przyjechał na czas, co bardzo nas zaskoczyło.', tr: t('Потяг приїхав вчасно, що нас дуже здивувало.', 'Поезд пришёл вовремя, что нас очень удивило.', 'The train arrived on time, which really surprised us.') },
    ],
    exercises: [
      dialogue('dialogue.relative', ANIA, [
        {
          npc: 'Kto ci polecił tę wypożyczalnię kajaków?',
          tr: t('Хто порадив тобі цей прокат каяків?', 'Кто посоветовал тебе этот прокат каяков?', 'Who recommended this kayak rental to you?'),
          choose: [
            ['Kolega, z którym pracowałem w zeszłym roku w Olsztynie.', t('Колега, з яким я працював минулого року в Ольштині.', 'Коллега, с которым я работал в прошлом году в Ольштыне.', 'A colleague I worked with in Olsztyn last year.')],
            ['Kolega, z który pracowałem w zeszłym roku w Olsztynie.', t('(**z** + орудний: z **którym**)', '(**z** + творительный: z **którym**)', '(**z** + instrumental: **którym**)')],
            ['Kolega, którym pracowałem w zeszłym roku w Olsztynie.', t('(потрібен прийменник: **z którym**)', '(нужен предлог: **z którym**)', '(the preposition is needed: **z którym**)')],
          ],
          feedback: t('Відмінок **który** — за роллю в підрядному: **z którym**.', 'Падеж **który** — по роли в придаточном: **z którym**.', 'The case follows the clause: **z którym**.'),
        },
        {
          npc: 'I jak, było fajnie?',
          tr: t('І як, було класно?', 'И как, было классно?', 'So, was it fun?'),
          choose: [
            ['Bardzo! Kajak się przewrócił, co wszystkich rozbawiło.', t('Дуже! Каяк перекинувся, що всіх розсмішило.', 'Очень! Каяк перевернулся, что всех рассмешило.', 'Very! The kayak capsized, which made everyone laugh.')],
            ['Bardzo! Kajak się przewrócił, który wszystkich rozbawiło.', t('(про все речення — **co**, а не «który»)', '(о всём предложении — **co**, а не «który»)', '(for the whole clause use **co**)')],
            ['Bardzo! Kajak się przewrócił, czego wszystkich rozbawiło.', t('(без заперечення — називний **co**; «czego» — з «nie»)', '(без отрицания — именительный **co**; «czego» — с «nie»)', '(no negation — **co**; «czego» goes with «nie»)')],
          ],
          feedback: t('**…, co** + дієслово — про все попереднє речення.', '**…, co** + глагол — о всём предыдущем предложении.', '**…, co** refers to the whole clause.'),
        },
      ]),
      fillGap('grammar.relative', 'To jest firma, w ___ pracuje mój brat.', ['której', 'którą', 'która', 'którym'],
        t('Це фірма, у якій працює мій брат.', 'Это фирма, в которой работает мой брат.', 'This is the company my brother works for.'),
        t('Firma — жіночий рід; **w** + місцевий: w **której**.', 'Firma — женский род; **w** + предложный: w **której**.', 'Feminine, locative: **której**.')),
      fillGap('grammar.relative', 'Pan Zbyszek, ___ znam od lat, prowadzi wypożyczalnię kajaków.', ['którego', 'który', 'któremu', 'którym'],
        t('Пан Збишек, якого я знаю багато років, тримає прокат каяків.', 'Пан Збышек, которого я знаю много лет, держит прокат каяков.', 'Mr Zbyszek, whom I’ve known for years, runs a kayak rental.'),
        t('Знаю кого — знахідний: **którego**.', 'Знаю кого — винительный: **którego**.', 'Know whom — accusative **którego**.')),
      fillGap('grammar.relative', 'Autobus nie przyjechał, ___ nikt nie potrafił wyjaśnić.', ['czego', 'co', 'który', 'czym'],
        t('Автобус не приїхав, чого ніхто не зміг пояснити.', 'Автобус не пришёл, чего никто не смог объяснить.', 'The bus never came, which nobody could explain.'),
        t('Заперечення «nie potrafił wyjaśnić» — родовий: **czego**.', 'Отрицание «nie potrafił wyjaśnić» — родительный: **czego**.', 'Negation — genitive **czego**.')),
      reading('reading.relative', 'Z bloga: „Olsztyn to miasto, w którym jest aż jedenaście jezior. Mieszkańcy, z którymi rozmawiałam, kąpią się w nich od maja do września, co mnie bardzo zdziwiło. Najbardziej polubiłam jezioro Ukiel, dzięki któremu zaczęłam pływać na kajaku”.',
        t('Що здивувало авторку блогу?', 'Что удивило автора блога?', 'What surprised the blogger?'),
        [t('що мешканці купаються в озерах з травня до вересня', 'что жители купаются в озёрах с мая по сентябрь', 'that locals swim in the lakes from May to September'), t('що в місті одинадцять озер', 'что в городе одиннадцать озёр', 'that the city has eleven lakes'), t('що вона почала плавати на каяку', 'что она начала плавать на каяке', 'that she took up kayaking')],
        t('«kąpią się w nich od maja do września, **co mnie bardzo zdziwiło**» — «co» стосується саме цього.', '«kąpią się w nich od maja do września, **co mnie bardzo zdziwiło**» — «co» относится именно к этому.', '“…od maja do września, **co mnie bardzo zdziwiło**”.')),
      reverseChoice('grammar.relative', t('Це вчителька, завдяки якій я склав іспит.', 'Это учительница, благодаря которой я сдал экзамен.', 'This is the teacher thanks to whom I passed the exam.'),
        ['To nauczycielka, dzięki której zdałem egzamin.', 'To nauczycielka, dzięki którą zdałem egzamin.', 'To nauczycielka, dzięki który zdałem egzamin.'],
        t('**Dzięki** + давальний: dzięki **której** (жіночий рід).', '**Dzięki** + дательный: dzięki **której** (женский род).', '**Dzięki** + dative: **której**.')),
      findError('grammar.relative', ['To', 'są', 'ludzie,', 'z', 'którzy', 'płynęliśmy', 'kajakiem'], 4,
        t('Це люди, з якими ми пливли на каяку.', 'Это люди, с которыми мы плыли на каяке.', 'These are the people we kayaked with.'),
        t('**Z** + орудний множини: z **którymi**.', '**Z** + творительный множественного: z **którymi**.', '**Z** + instrumental plural.')),
      build('grammar.relative', 'Pociąg przyjechał na czas, co nas bardzo zdziwiło', t('Потяг приїхав вчасно, що нас дуже здивувало', 'Поезд пришёл вовремя, что нас очень удивило', 'The train arrived on time, which really surprised us'), ['który', 'czego'], [],
        t('Про все речення — **co**.', 'О всём предложении — **co**.', 'For the whole clause — **co**.')),
      match('grammar.relative', [
        ['dzięki któremu', t('завдяки якому', 'благодаря которому', 'thanks to which')],
        ['w której', t('у якій', 'в которой', 'in which')],
        ['…, co mnie zdziwiło', t('…, що мене здивувало', '…, что меня удивило', '…, which surprised me')],
        ['kto pyta, ten nie błądzi', t('хто питає, той не блукає', 'язык до Киева доведёт', 'it never hurts to ask')],
      ]),
    ],
  },
};

// ───────────────────────────── ols-7-audioprzewodnik: Аудіогід у замку (урок B1) ─────────────────────────────
const OLS7: LessonLevels = {
  B2: {
    explanation: t(
      'Мова путівника й історичних текстів:\n• пасивні дієприкметники — zamek **wzniesiony przez** kapitułę warmińską (przez + знахідний); **przebudowany** w XVI wieku; **zachowany do dziś**;\n• **na zlecenie** + родовий — на замовлення: na zlecenie **biskupa**;\n• **w latach** 1516–1521 — у 1516–1521 роках; **zarządzać** + орудний: zarządzał **zamkiem**;\n• **nawiązywać do** + родовий — посилатися на, перегукуватися з: nawiązuje **do gotyku**.',
      'Язык путеводителя и исторических текстов:\n• страдательные причастия — zamek **wzniesiony przez** kapitułę warmińską (przez + винительный); **przebudowany** w XVI wieku; **zachowany do dziś**;\n• **na zlecenie** + родительный — по заказу: na zlecenie **biskupa**;\n• **w latach** 1516–1521 — в 1516–1521 годах; **zarządzać** + творительный: zarządzał **zamkiem**;\n• **nawiązywać do** + родительный — отсылать к, перекликаться с: nawiązuje **do gotyku**.',
      'The language of guidebooks and history:\n• passive participles — zamek **wzniesiony przez** kapitułę warmińską (przez + accusative); **przebudowany** w XVI wieku; **zachowany do dziś**;\n• **na zlecenie** + genitive — commissioned by: na zlecenie **biskupa**;\n• **w latach** 1516–1521 — in the years 1516–1521; **zarządzać** + instrumental: zarządzał **zamkiem**;\n• **nawiązywać do** + genitive — to echo, refer to: nawiązuje **do gotyku**.',
    ),
    examples: [
      { pl: 'Zamek został wzniesiony przez kapitułę warmińską w XIV wieku.', tr: t('Замок звела вармінська капітула в XIV столітті.', 'Замок был возведён вармийским капитулом в XIV веке.', 'The castle was built by the Warmian Chapter in the 14th century.') },
      { pl: 'W latach 1516–1521 zamkiem zarządzał Mikołaj Kopernik.', tr: t('У 1516–1521 роках замком управляв Миколай Коперник.', 'В 1516–1521 годах замком управлял Николай Коперник.', 'From 1516 to 1521 the castle was run by Nicolaus Copernicus.') },
    ],
    exercises: [
      dialogue('dialogue.castle', MARTA, [
        {
          npc: 'Bilet z audioprzewodnikiem? Trasa trwa około godziny.',
          tr: t('Квиток з аудіогідом? Маршрут триває близько години.', 'Билет с аудиогидом? Маршрут длится около часа.', 'A ticket with the audio guide? The tour takes about an hour.'),
          choose: [
            ['Tak, poproszę. Czy na trasie jest tablica, którą narysował Kopernik?', t('Так, будь ласка. Чи є на маршруті таблиця, яку намалював Коперник?', 'Да, пожалуйста. Есть ли на маршруте таблица, которую нарисовал Коперник?', 'Yes, please. Is the table Copernicus drew on the route?')],
            ['Tak, poproszę. Czy na trasie jest tablica, który narysował Kopernik?', t('(tablica — жіночий рід, знахідний: **którą**)', '(tablica — женский род, винительный: **którą**)', '(feminine accusative: **którą**)')],
            ['Tak, poproszę. Czy na trasie jest tablica, którą narysowana Kopernik?', t('(хто намалював — дієслово: **narysował**)', '(кто нарисовал — глагол: **narysował**)', '(a verb is needed: **narysował**)')],
          ],
          feedback: t('**Tablica, którą narysował Kopernik**.', '**Tablica, którą narysował Kopernik**.', '**Tablica, którą narysował Kopernik**.'),
        },
        {
          npc: 'Tak, na krużgankach. A wie pan, kto zbudował zamek?',
          tr: t('Так, на галереї. А ви знаєте, хто збудував замок?', 'Да, в галерее. А вы знаете, кто построил замок?', 'Yes, in the cloister. And do you know who built the castle?'),
          choose: [
            ['Z tego, co czytałem, został wzniesiony przez kapitułę warmińską.', t('Наскільки я читав, його звела вармінська капітула.', 'Насколько я читал, его возвёл вармийский капитул.', 'From what I’ve read, it was built by the Warmian Chapter.')],
            ['Z tego, co czytałem, został wzniesiony przez kapitułą warmińską.', t('(**przez** + знахідний: **kapitułę**)', '(**przez** + винительный: **kapitułę**)', '(**przez** + accusative)')],
            ['Z tego, co czytałem, został wzniesiony od kapituły warmińskiej.', t('(виконавець у пасиві — **przez**, а не «od»)', '(деятель в пассиве — **przez**, а не «od»)', '(the agent in the passive takes **przez**)')],
          ],
          feedback: t('Пасив: **został wzniesiony przez** + знахідний.', 'Пассив: **został wzniesiony przez** + винительный.', 'Passive agent: **przez** + accusative.'),
        },
      ]),
      fillGap('register.guide', 'Ołtarz wykonano na ___ biskupa warmińskiego.', ['zlecenie', 'zlecenia', 'zleceniu', 'zleceniem'],
        t('Вівтар виготовили на замовлення вармінського єпископа.', 'Алтарь изготовили по заказу вармийского епископа.', 'The altar was made on the commission of the Bishop of Warmia.'),
        t('Стала формула — **na zlecenie** + родовий.', 'Устойчивая формула — **na zlecenie** + родительный.', 'Set phrase: **na zlecenie**.')),
      fillGap('register.guide', 'Kopernik przez kilka lat zarządzał ___ i dobrami kapituły.', ['zamkiem', 'zamek', 'zamku', 'zamkowi'],
        t('Коперник кілька років управляв замком і маєтностями капітули.', 'Коперник несколько лет управлял замком и владениями капитула.', 'For several years Copernicus ran the castle and the chapter’s estates.'),
        t('**Zarządzać** + орудний: **zamkiem**.', '**Zarządzać** + творительный: **zamkiem**.', '**Zarządzać** + instrumental.')),
      fillGap('register.guide', 'Wieża została ___ po pożarze w XVI wieku.', ['przebudowana', 'przebudowany', 'przebudowane', 'przebudowała'],
        t('Вежу перебудували після пожежі в XVI столітті.', 'Башню перестроили после пожара в XVI веке.', 'The tower was rebuilt after a fire in the 16th century.'),
        t('Wieża — жіночий рід: **została przebudowana**.', 'Wieża — женский род: **została przebudowana**.', 'Wieża is feminine: **przebudowana**.')),
      reading('reading.guide', 'Audioprzewodnik: „Zamek Kapituły Warmińskiej wzniesiono w XIV wieku. W latach 1516–1521 zarządzał nim Mikołaj Kopernik, który zorganizował obronę zamku przed Krzyżakami. Na ścianie krużganków zachowała się do dziś tablica astronomiczna jego autorstwa”.',
        t('Що збереглося на стіні галереї?', 'Что сохранилось на стене галереи?', 'What has survived on the cloister wall?'),
        [t('астрономічна таблиця Коперника', 'астрономическая таблица Коперника', 'an astronomical table by Copernicus'), t('план оборони замку', 'план обороны замка', 'the castle’s defence plan'), t('портрет вармінського єпископа', 'портрет вармийского епископа', 'a portrait of the Bishop of Warmia')],
        t('«Na ścianie krużganków **zachowała się do dziś tablica astronomiczna** jego autorstwa».', '«Na ścianie krużganków **zachowała się do dziś tablica astronomiczna** jego autorstwa».', '“**zachowała się do dziś tablica astronomiczna**”.')),
      reverseChoice('register.guide', t('Костел збудовано в готичному стилі.', 'Костёл построен в готическом стиле.', 'The church was built in the Gothic style.'),
        ['Kościół został zbudowany w stylu gotyckim.', 'Kościół został zbudowana w stylu gotyckim.', 'Kościół został zbudowany w styl gotycki.'],
        t('Kościół — чоловічий рід: **zbudowany**; **w** + місцевий: **w stylu gotyckim**.', 'Kościół — мужской род: **zbudowany**; **w** + предложный: **w stylu gotyckim**.', 'Masculine **zbudowany**; locative **w stylu**.')),
      findError('register.guide', ['Zamek', 'został', 'zbudowany', 'przez', 'Krzyżakami'], 4,
        t('Замок збудували хрестоносці.', 'Замок построили крестоносцы.', 'The castle was built by the Teutonic Knights.'),
        t('**Przez** + знахідний: przez **Krzyżaków**.', '**Przez** + винительный: przez **Krzyżaków**.', '**Przez** + accusative.')),
      build('register.guide', 'Zamek został wzniesiony w czternastym wieku', t('Замок звели в чотирнадцятому столітті', 'Замок был возведён в четырнадцатом веке', 'The castle was built in the fourteenth century'), ['wzniesiona', 'wiek'], ['W czternastym wieku został wzniesiony zamek'],
        t('Zamek — чоловічий рід: **wzniesiony**; **w** + місцевий: **w czternastym wieku**.', 'Zamek — мужской род: **wzniesiony**; **w** + предложный: **w czternastym wieku**.', 'Masculine **wzniesiony**; locative **wieku**.')),
      match('register.guide', [
        ['na zlecenie', t('на замовлення', 'по заказу', 'commissioned by')],
        ['krużganki', t('галерея (аркади)', 'галерея (аркады)', 'cloister')],
        ['zachowany do dziś', t('збережений донині', 'сохранившийся до наших дней', 'preserved to this day')],
        ['zarządzać zamkiem', t('управляти замком', 'управлять замком', 'to run a castle')],
      ]),
    ],
  },
};

// ───────────────────────────── ols-8-streszczenie: Переказ (урок B1) ─────────────────────────────
const OLS8: LessonLevels = {
  B2: {
    explanation: t(
      'Стисло й логічно переказати текст:\n• висновок — **Podsumowując,…**; **Z badań / z tekstu wynika, że…**;\n• акцент — **Autor zwraca uwagę na** + знахідний; **Należy podkreślić, że…**;\n• пари сполучників — **zarówno…, jak i…** (як…, так і…); **nie tyle…, ile…** (не стільки…, скільки…);\n• протиставлення — **w odróżnieniu od** + родовий; **natomiast** (натомість); **z kolei** (у свою чергу).',
      'Кратко и логично пересказать текст:\n• вывод — **Podsumowując,…**; **Z badań / z tekstu wynika, że…**;\n• акцент — **Autor zwraca uwagę na** + винительный; **Należy podkreślić, że…**;\n• парные союзы — **zarówno…, jak i…** (как…, так и…); **nie tyle…, ile…** (не столько…, сколько…);\n• противопоставление — **w odróżnieniu od** + родительный; **natomiast** (тогда как); **z kolei** (в свою очередь).',
      'Summarising a text concisely and logically:\n• conclusions — **Podsumowując,…**; **Z badań / z tekstu wynika, że…**;\n• emphasis — **Autor zwraca uwagę na** + accusative; **Należy podkreślić, że…**;\n• paired conjunctions — **zarówno…, jak i…** (both… and…); **nie tyle…, ile…** (not so much… as…);\n• contrast — **w odróżnieniu od** + genitive; **natomiast** (whereas); **z kolei** (in turn).',
    ),
    examples: [
      { pl: 'Z badań wynika, że zarówno studenci, jak i seniorzy coraz częściej wybierają tramwaj.', tr: t('З досліджень випливає, що як студенти, так і пенсіонери дедалі частіше обирають трамвай.', 'Из исследований следует, что как студенты, так и пенсионеры всё чаще выбирают трамвай.', 'Research shows that students and pensioners alike are choosing the tram more and more.') },
      { pl: 'Autor zwraca uwagę nie tyle na koszty, ile na wygodę pasażerów.', tr: t('Автор звертає увагу не стільки на витрати, скільки на зручність пасажирів.', 'Автор обращает внимание не столько на расходы, сколько на удобство пассажиров.', 'The author focuses not so much on costs as on passenger comfort.') },
    ],
    exercises: [
      dialogue('dialogue.summary', ANIA, [
        {
          npc: 'Przeczytałeś ten artykuł o jeziorach? Streść mi go w dwóch zdaniach.',
          tr: t('Ти прочитав ту статтю про озера? Перекажи мені її двома реченнями.', 'Ты прочитал ту статью об озёрах? Перескажи мне её в двух предложениях.', 'Did you read that article about the lakes? Sum it up in two sentences.'),
          choose: [
            ['Z artykułu wynika, że jeziora są czystsze niż dziesięć lat temu.', t('Зі статті випливає, що озера чистіші, ніж десять років тому.', 'Из статьи следует, что озёра чище, чем десять лет назад.', 'The article shows the lakes are cleaner than ten years ago.')],
            ['Z artykułu wynika się, że jeziora są czystsze niż dziesięć lat temu.', t('(**wynika, że** — без «się»)', '(**wynika, że** — без «się»)', '(**wynika, że** — no «się»)')],
            ['Od artykułu wynika, że jeziora są czystsze niż dziesięć lat temu.', t('(**z** + родовий: **z artykułu** wynika)', '(**z** + родительный: **z artykułu** wynika)', '(**z artykułu** wynika)')],
          ],
          feedback: t('**Z artykułu wynika, że…**', '**Z artykułu wynika, że…**', '**Z artykułu wynika, że…**'),
        },
        {
          npc: 'A na co autor zwraca szczególną uwagę?',
          tr: t('А на що автор звертає особливу увагу?', 'А на что автор обращает особое внимание?', 'And what does the author stress in particular?'),
          choose: [
            ['Nie tyle na przepisy, ile na postawę mieszkańców.', t('Не стільки на правила, скільки на поведінку мешканців.', 'Не столько на правила, сколько на поведение жителей.', 'Not so much on the rules as on how residents behave.')],
            ['Nie tyle na przepisy, co na postawę mieszkańców.', t('(пара — **nie tyle…, ile…**; «co» тут розмовне, у тексті — **ile**)', '(пара — **nie tyle…, ile…**; «co» здесь разговорное, в тексте — **ile**)', '(the pair is **nie tyle…, ile…**)')],
            ['Nie tyle na przepisy, ile na postawie mieszkańców.', t('(**zwracać uwagę na** + знахідний: na **postawę**)', '(**zwracać uwagę na** + винительный: na **postawę**)', '(**na** + accusative: **postawę**)')],
          ],
          feedback: t('**Nie tyle…, ile…**; **zwracać uwagę na** + знахідний.', '**Nie tyle…, ile…**; **zwracać uwagę na** + винительный.', '**Nie tyle…, ile…**; **na** + accusative.'),
        },
      ]),
      fillGap('register.summary', '___, nowa linia tramwajowa skróciła czas dojazdu o połowę.', ['Podsumowując', 'Podsumowanie', 'Podsumować', 'Podsumowany'],
        t('Підсумовуючи, нова трамвайна лінія скоротила час доїзду вдвічі.', 'Подводя итог, новая трамвайная линия сократила время в пути вдвое.', 'To sum up, the new tram line halved commuting time.'),
        t('Вступне слово висновку — дієприслівник **podsumowując**.', 'Вводное слово вывода — деепричастие **podsumowując**.', 'The summing-up word is **podsumowując**.')),
      fillGap('register.summary', 'Z ankiety wynika, że ___ młodzi, jak i starsi mieszkańcy są zadowoleni.', ['zarówno', 'tak', 'zarazem', 'równie'],
        t('З опитування випливає, що як молоді, так і старші мешканці задоволені.', 'Из опроса следует, что как молодые, так и пожилые жители довольны.', 'The survey shows that young and older residents alike are satisfied.'),
        t('Пара — **zarówno…, jak i…**', 'Пара — **zarówno…, jak i…**', 'The pair **zarówno…, jak i…**')),
      fillGap('register.summary', 'W ___ od Gdańska Olsztyn nie leży nad morzem, lecz wśród jezior.', ['odróżnieniu', 'różnicy', 'odróżnienie', 'porównaniu'],
        t('На відміну від Гданська, Ольштин лежить не біля моря, а серед озер.', 'В отличие от Гданьска, Ольштын находится не у моря, а среди озёр.', 'Unlike Gdańsk, Olsztyn lies not by the sea but among lakes.'),
        t('На відміну від — **w odróżnieniu od** + родовий. («W porównaniu z» — порівняно з.)', 'В отличие от — **w odróżnieniu od** + родительный. («W porównaniu z» — по сравнению с.)', 'Unlike — **w odróżnieniu od**.')),
      reading('reading.summary', 'Streszczenie raportu: „Raport dotyczy jakości wody w jeziorach Olsztyna. Z badań wynika, że w ciągu dekady poprawiła się ona w dziewięciu z jedenastu jezior. Autorzy zwracają uwagę nie tyle na nowe oczyszczalnie, ile na zmianę zachowań mieszkańców. Należy podkreślić, że w dwóch jeziorach sytuacja się pogorszyła”.',
        t('Що, на думку авторів, найбільше вплинуло на поліпшення?', 'Что, по мнению авторов, больше всего повлияло на улучшение?', 'What do the authors see as the main reason for the improvement?'),
        [t('зміна поведінки мешканців', 'изменение поведения жителей', 'residents changing their behaviour'), t('нові очисні споруди', 'новые очистные сооружения', 'new sewage treatment plants'), t('погіршення в двох озерах', 'ухудшение в двух озёрах', 'the decline in two lakes')],
        t('«nie tyle na nowe oczyszczalnie, **ile na zmianę zachowań mieszkańców**» — головне те, що після «ile».', '«nie tyle na nowe oczyszczalnie, **ile na zmianę zachowań mieszkańców**» — главное то, что после «ile».', '“nie tyle…, **ile na zmianę zachowań**” — the stress falls after «ile».')),
      reverseChoice('register.summary', t('Слід підкреслити, що дослідження тривало два роки.', 'Следует подчеркнуть, что исследование длилось два года.', 'It should be stressed that the study lasted two years.'),
        ['Należy podkreślić, że badanie trwało dwa lata.', 'Należy podkreślać się, że badanie trwało dwa lata.', 'Należy podkreślić, że badanie trwało dwóch lat.'],
        t('**Należy** + інфінітив без «się»; тривало (скільки?) — знахідний: **dwa lata**.', '**Należy** + инфинитив без «się»; длилось (сколько?) — винительный: **dwa lata**.', '**Należy** + infinitive; accusative **dwa lata**.')),
      findError('register.summary', ['Autor', 'zwraca', 'uwagę', 'na', 'problemem', 'hałasu'], 4,
        t('Автор звертає увагу на проблему шуму.', 'Автор обращает внимание на проблему шума.', 'The author draws attention to the noise problem.'),
        t('**Zwracać uwagę na** + знахідний: na **problem**.', '**Zwracać uwagę na** + винительный: na **problem**.', '**Na** + accusative.')),
      build('register.summary', 'Z badań wynika, że mieszkańcy są zadowoleni', t('З досліджень випливає, що мешканці задоволені', 'Из исследований следует, что жители довольны', 'The research shows residents are satisfied'), ['od', 'wynikają'], [],
        t('**Z** + родовий + **wynika, że…**', '**Z** + родительный + **wynika, że…**', '**Z badań wynika, że…**')),
      match('register.summary', [
        ['podsumowując', t('підсумовуючи', 'подводя итог', 'to sum up')],
        ['z kolei', t('у свою чергу', 'в свою очередь', 'in turn')],
        ['nie tyle…, ile…', t('не стільки…, скільки…', 'не столько…, сколько…', 'not so much… as…')],
        ['zwracać uwagę na', t('звертати увагу на', 'обращать внимание на', 'to draw attention to')],
      ]),
    ],
  },
};

// ───────────────────────────── ols-boss: Іспит Ольштина (бос B1) ─────────────────────────────
const OLSBOSS: LessonLevels = {
  B2: {
    explanation: t(
      'Повторення Ольштина (B2):\n• уточнення — **czy mógłby pan doprecyzować**, **innymi słowy**, **chodzi o** + знахідний;\n• оголошення й листи — **uprzejmie informujemy**, **z przyczyn technicznych**, **w sprawie** + родовий, **w nawiązaniu do**, **w załączniku**;\n• статистика — **wzrosnąć o / do**, **co trzeci**, **stanowić** + знахідний;\n• правила — **przestrzegać** + родовий, **na terenie** + родовий, **grozi mandat**;\n• складні речення — **który** у відмінках, **…, co…**; путівник — **wzniesiony przez**; переказ — **z badań wynika**, **nie tyle…, ile…**.',
      'Повторение Ольштына (B2):\n• уточнение — **czy mógłby pan doprecyzować**, **innymi słowy**, **chodzi o** + винительный;\n• объявления и письма — **uprzejmie informujemy**, **z przyczyn technicznych**, **w sprawie** + родительный, **w nawiązaniu do**, **w załączniku**;\n• статистика — **wzrosnąć o / do**, **co trzeci**, **stanowić** + винительный;\n• правила — **przestrzegać** + родительный, **na terenie** + родительный, **grozi mandat**;\n• сложные предложения — **który** в падежах, **…, co…**; путеводитель — **wzniesiony przez**; пересказ — **z badań wynika**, **nie tyle…, ile…**.',
      'Olsztyn review (B2):\n• clarifying — **czy mógłby pan doprecyzować**, **innymi słowy**, **chodzi o** + accusative;\n• notices and emails — **uprzejmie informujemy**, **z przyczyn technicznych**, **w sprawie** + genitive, **w nawiązaniu do**, **w załączniku**;\n• statistics — **wzrosnąć o / do**, **co trzeci**, **stanowić** + accusative;\n• rules — **przestrzegać** + genitive, **na terenie** + genitive, **grozi mandat**;\n• complex sentences — **który** in every case, **…, co…**; guides — **wzniesiony przez**; summaries — **z badań wynika**, **nie tyle…, ile…**.',
    ),
    examples: [
      { pl: 'Uprzejmie informujemy, że z przyczyn technicznych zamek będzie dziś nieczynny.', tr: t('Повідомляємо, що з технічних причин замок сьогодні буде зачинений.', 'Сообщаем, что по техническим причинам замок сегодня будет закрыт.', 'Please note that the castle will be closed today for technical reasons.') },
      { pl: 'Z raportu wynika, że co trzeci turysta wraca na Warmię.', tr: t('Зі звіту випливає, що кожен третій турист повертається на Вармію.', 'Из отчёта следует, что каждый третий турист возвращается на Вармию.', 'The report shows one in three tourists comes back to Warmia.') },
    ],
    exercises: [
      fillGap('vocab.boss', 'Dzwonię w ___ biletu, który kupiłem przez internet.', ['sprawie', 'sprawę', 'sprawy', 'sprawą'],
        t('Телефоную щодо квитка, який купив через інтернет.', 'Звоню по поводу билета, который купил через интернет.', 'I’m calling about a ticket I bought online.'),
        t('Формула — **w sprawie** + родовий.', 'Формула — **w sprawie** + родительный.', 'Formula: **w sprawie** + genitive.')),
      fillGap('vocab.boss', 'Liczba pasażerów wzrosła ___ dwadzieścia procent.', ['o', 'do', 'na', 'w'],
        t('Кількість пасажирів зросла на двадцять відсотків.', 'Число пассажиров выросло на двадцать процентов.', 'Passenger numbers rose by twenty per cent.'),
        t('«dwadzieścia procent» — знахідний, отже на скільки: **o**. («Do» — з родовим: do dwudziestu procent.)', '«dwadzieścia procent» — винительный, значит на сколько: **o**. («Do» — с родительным: do dwudziestu procent.)', 'Accusative «dwadzieścia» — by how much: **o**.')),
      fillGap('vocab.boss', 'Pan Zbyszek, z ___ wypożyczyliśmy kajak, zna każdą zatokę.', ['którym', 'który', 'którego', 'któremu'],
        t('Пан Збишек, у якого ми взяли каяк, знає кожну затоку.', 'Пан Збышек, у которого мы взяли каяк, знает каждый залив.', 'Mr Zbyszek, from whom we rented the kayak, knows every bay.'),
        t('**Z** + орудний: z **którym**.', '**Z** + творительный: z **którym**.', '**Z** + instrumental.')),
      reverseChoice('vocab.boss', t('Іншими словами, ідеться про зміну розкладу.', 'Другими словами, речь идёт об изменении расписания.', 'In other words, it’s about a timetable change.'),
        ['Innymi słowy, chodzi o zmianę rozkładu.', 'Innymi słowy, chodzi o zmiana rozkładu.', 'Innym słowem, chodzi się o zmianę rozkładu.'],
        t('**Chodzi o** + знахідний: o **zmianę**; стала фраза — **innymi słowy**.', '**Chodzi o** + винительный: o **zmianę**; устойчивая фраза — **innymi słowy**.', '**Chodzi o** + accusative; **innymi słowy**.')),
      reading('reading.boss', 'Bobek pisze do Ani: „Najpierw pociąg z Gdyni był opóźniony z przyczyn technicznych. Potem w zamku pani Marta powiedziała, że został wzniesiony przez kapitułę warmińską, a tablicę na krużgankach narysował sam Kopernik. Po południu pływaliśmy kajakiem, ale na terenie rezerwatu nie przybijaliśmy do brzegu, bo grozi za to mandat”.',
        t('Чому Бобек не приставав до берега?', 'Почему Бобек не причаливал к берегу?', 'Why didn’t Bobek land on the shore?'),
        [t('бо на території заповідника за це загрожує штраф', 'потому что на территории заповедника за это грозит штраф', 'because landing in the reserve can mean a fine'), t('бо потяг запізнився', 'потому что поезд опоздал', 'because the train was late'), t('бо замок був зачинений', 'потому что замок был закрыт', 'because the castle was closed')],
        t('«na terenie rezerwatu nie przybijaliśmy do brzegu, **bo grozi za to mandat**».', '«na terenie rezerwatu nie przybijaliśmy do brzegu, **bo grozi za to mandat**».', '“**bo grozi za to mandat**”.')),
      dialogue('dialogue.boss', INFO, [
        {
          npc: 'Uprzejmie informujemy, że pociąg do Gdańska kursuje dziś według zmienionego rozkładu.',
          tr: t('Повідомляємо, що потяг до Гданська курсує сьогодні за зміненим розкладом.', 'Сообщаем, что поезд в Гданьск сегодня ходит по изменённому расписанию.', 'Please note the Gdańsk train is running to an amended timetable today.'),
          choose: [
            ['Przepraszam, nie nadążam. Czy mógłaby pani doprecyzować, o której odjeżdża?', t('Вибачте, не встигаю. Чи не могли б ви уточнити, о котрій він відходить?', 'Простите, не успеваю. Не могли бы вы уточнить, во сколько он отправляется?', 'Sorry, I can’t keep up. Could you tell me exactly when it leaves?')],
            ['Przepraszam, nie nadążam. Czy mogłaby pani doprecyzować, o której odjeżdża?', t('(до жінки — **mogłaby pani**; «mógłaby» — такої форми немає)', '(к женщине — **mogłaby pani**; «mógłaby» — такой формы нет)', '(to a woman — **mogłaby pani**)')],
            ['Przepraszam, nie nadążam. Czy mógłby pani doprecyzować, o której odjeżdża?', t('(до жінки — жіночий рід: **mogłaby pani**)', '(к женщине — женский род: **mogłaby pani**)', '(feminine: **mogłaby pani**)')],
          ],
          feedback: t('До жінки — **czy mogłaby pani…**', 'К женщине — **czy mogłaby pani…**', 'To a woman — **czy mogłaby pani…**'),
        },
        {
          npc: 'O 14:20 z peronu drugiego. Za utrudnienia przepraszamy.',
          tr: t('О 14:20 з другої платформи. Вибачаємося за незручності.', 'В 14:20 со второй платформы. Приносим извинения за неудобства.', 'At 14:20 from platform two. We apologise for the inconvenience.'),
          choose: [
            ['Innymi słowy, odjedzie z czterdziestominutowym opóźnieniem?', t('Іншими словами, він відійде із сорокахвилинним запізненням?', 'Другими словами, он отправится с сорокаминутным опозданием?', 'In other words, it’ll leave forty minutes late?')],
            ['Innymi słowy, odjedzie o czterdziestominutowym opóźnieniem?', t('(із запізненням — **z** + орудний)', '(с опозданием — **z** + творительный)', '(late by — **z** + instrumental)')],
            ['Innymi słowy, odjedzie z czterdziestominutowe opóźnienie?', t('(**z** + орудний: z **opóźnieniem**)', '(**z** + творительный: z **opóźnieniem**)', '(**z** + instrumental)')],
          ],
          feedback: t('**Z opóźnieniem** — орудний.', '**Z opóźnieniem** — творительный.', '**Z opóźnieniem** — instrumental.'),
        },
      ]),
      findError('vocab.boss', ['Turyści', 'stanowią', 'połowa', 'mieszkańców', 'latem'], 2,
        t('Улітку туристи становлять половину мешканців.', 'Летом туристы составляют половину жителей.', 'In summer tourists make up half the population.'),
        t('**Stanowić** + знахідний: **połowę**.', '**Stanowić** + винительный: **połowę**.', '**Stanowić** + accusative.')),
      build('vocab.boss', 'W załączniku przesyłam skan biletu', t('У додатку надсилаю скан квитка', 'Во вложении направляю скан билета', 'Please find attached a scan of the ticket'), ['załącznik', 'bilet'], ['Skan biletu przesyłam w załączniku'],
        t('**W** + місцевий: **w załączniku**; скан чого — родовий: **biletu**.', '**W** + предложный: **w załączniku**; скан чего — родительный: **biletu**.', '**W załączniku**; genitive **biletu**.')),
      match('vocab.boss', [
        ['doprecyzować', t('уточнити', 'уточнить', 'to specify')],
        ['uprzejmie informujemy', t('повідомляємо', 'сообщаем', 'please be informed')],
        ['co trzeci', t('кожен третій', 'каждый третий', 'one in three')],
        ['wzniesiony przez', t('зведений (ким)', 'возведённый (кем)', 'built by')],
      ]),
    ],
  },
};

export const OLSZTYN_LEVELS: Record<string, LessonLevels> = {
  'ols-1-powtorz': OLS1,
  'ols-2-komunikat': OLS2,
  'ols-3-telefon': OLS3,
  'ols-4-okolo': OLS4,
  'ols-5-jezioro': OLS5,
  'ols-6-ktory': OLS6,
  'ols-7-audioprzewodnik': OLS7,
  'ols-8-streszczenie': OLS8,
  'ols-boss': OLSBOSS,
};
