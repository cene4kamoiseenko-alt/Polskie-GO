/**
 * Lublin: уроки 5–8 (пошта, банк, договір, Люблінська унія) й іспит міста. Уроки 1–4 і збірка міста — lublin.ts.
 */
import { t, wordChoice, fillGap, listen, findError, oddOne, reading, translate, grammar, build, match, speak, dialogue } from './builders';
import type { LessonSeed } from './types';

const URZEDNICZKA = { name: 'Pani Jolanta', emoji: '👩🏼‍💼', role: t('працівниця установи', 'сотрудница учреждения', 'an office clerk') };
const POCZTOWA = { name: 'Pani Ewa', emoji: '👩🏽‍💼', role: t('працівниця пошти', 'сотрудница почты', 'a post office clerk') };
const DORADCA = { name: 'Pan Adam', emoji: '🧑🏼‍💼', role: t('консультант банку', 'консультант банка', 'a bank adviser') };
const WYNAJMUJACA = { name: 'Pani Wanda', emoji: '👵🏼', role: t('власниця квартири', 'владелица квартиры', 'a landlady') };
const PRZEWODNICZKA = { name: 'Pani Agnieszka', emoji: '👩🏻‍🏫', role: t('екскурсовод по Любліну', 'экскурсовод по Люблину', 'a Lublin tour guide') };

const LUB_5: LessonSeed = {
  slug: 'lub-5-poczta',
  title: t('Пошта й відправлення', 'Почта и отправления', 'At the post office'),
  topic: t(
    'Awizo, nadawca i adresat, kod pocztowy; list polecony za potwierdzeniem odbioru; od / do + родовий: list od urzędu, list do pana Nowaka; adres: ul. Lipowa 5/12',
    'Awizo, nadawca i adresat, kod pocztowy; list polecony za potwierdzeniem odbioru; od / do + родительный: list od urzędu, list do pana Nowaka; adres: ul. Lipowa 5/12',
    'Awizo, nadawca and adresat, kod pocztowy; list polecony za potwierdzeniem odbioru; od / do + genitive: list od urzędu, list do pana Nowaka; address: ul. Lipowa 5/12',
  ),
  cefr: 'B1',
  difficulty: 3,
  explanation: t(
    '**Мета:** забрати й відправити лист чи посилку та зрозуміти, що написано в повідомленні.\n**Awizo** — папірець у скриньці: відправлення чекає на пошті. Забрати його може **adresat** (той, кому адресовано), з документом. **Nadawca** — відправник. **Od** + родовий — від кого: **list od urzędu**; **do** + родовий — кому: **list do pana Nowaka**.\n**List polecony** — рекомендований лист; **za potwierdzeniem odbioru** — з підтвердженням отримання (**za** + орудний у сталому виразі).\nАдреса читається так: **ul. Lipowa 5/12, 20-001 Lublin** — «ulica Lipowa pięć, mieszkanie dwanaście, kod dwadzieścia — zero zero jeden, Lublin». Усі індекси Любліна починаються з **20**.',
    '**Цель:** забрать и отправить письмо или посылку и понять, что написано в извещении.\n**Awizo** — бумажка в ящике: отправление ждёт на почте. Забрать его может **adresat** (тот, кому адресовано), с документом. **Nadawca** — отправитель. **Od** + родительный — от кого: **list od urzędu**; **do** + родительный — кому: **list do pana Nowaka**.\n**List polecony** — заказное письмо; **za potwierdzeniem odbioru** — с уведомлением о вручении (**za** + творительный в устойчивом выражении).\nАдрес читается так: **ul. Lipowa 5/12, 20-001 Lublin** — «ulica Lipowa pięć, mieszkanie dwanaście, kod dwadzieścia — zero zero jeden, Lublin». Все индексы Люблина начинаются с **20**.',
    '**Goal:** collect and send a letter or parcel and understand what a notice says.\n**Awizo** is the slip in your letterbox: an item is waiting at the post office. Only the **adresat** (the person it is addressed to) can collect it, with ID. **Nadawca** is the sender. **Od** + genitive means “from”: **list od urzędu**; **do** + genitive means “to”: **list do pana Nowaka**.\n**List polecony** is a registered letter; **za potwierdzeniem odbioru** means “with an acknowledgement of receipt” (**za** + instrumental in a fixed phrase).\nAn address is read like this: **ul. Lipowa 5/12, 20-001 Lublin** — “ulica Lipowa pięć, mieszkanie dwanaście, kod dwadzieścia — zero zero jeden, Lublin”. All Lublin postcodes start with **20**.',
  ),
  examples: [
    { pl: 'W skrzynce znalazłem awizo: przesyłka czeka na poczcie.', tr: t('У скриньці я знайшов авізо: відправлення чекає на пошті.', 'В ящике я нашёл авизо: отправление ждёт на почте.', 'I found a collection notice in my letterbox: a parcel is waiting at the post office.') },
    { pl: 'Wysyłam list polecony za potwierdzeniem odbioru.', tr: t('Я відправляю рекомендований лист із підтвердженням отримання.', 'Я отправляю заказное письмо с уведомлением о вручении.', 'I am sending a registered letter with an acknowledgement of receipt.') },
  ],
  words: ['awizo', 'nadawca', 'adresat', 'przesyłka', 'kod pocztowy', 'za potwierdzeniem odbioru'],
  exercises: [
    dialogue('dialogue.poczta', POCZTOWA, [
      {
        npc: 'Dzień dobry. Czym mogę służyć?',
        tr: t('Добрий день. Чим можу допомогти?', 'Добрый день. Чем могу помочь?', 'Good morning. How can I help?'),
        choose: [
          ['Dzień dobry, dostałem awizo. Przyszedłem odebrać przesyłkę.', t('Добрий день, я отримав авізо. Прийшов забрати відправлення.', 'Добрый день, я получил авизо. Пришёл забрать отправление.', 'Hello, I got a collection notice. I’ve come to collect a parcel.')],
          ['Dzień dobry, dostałem awizo. Przyszedłem odebrać przesyłki.', t('(**odebrać** + знахідний: **przesyłkę**)', '(**odebrać** + винительный: **przesyłkę**)', '(**odebrać** takes the accusative: **przesyłkę**)')],
          ['Dzień dobry, dostałem awizo. Przyszedłem odbierać przesyłkę.', t('(одна дія з метою — доконаний вид: **przyszedłem odebrać**)', '(одно действие с целью — совершенный вид: **przyszedłem odebrać**)', '(one action with a purpose takes the perfective: **przyszedłem odebrać**)')],
        ],
        feedback: t('Мета одноразова — доконаний вид: **odebrać przesyłkę** (знахідний).', 'Цель однократная — совершенный вид: **odebrać przesyłkę** (винительный).', 'A single purpose takes the perfective: **odebrać przesyłkę** (accusative).'),
      },
      {
        npc: 'Poproszę o dowód osobisty. Czy pan jest adresatem?',
        tr: t('Будь ласка, посвідчення особи. Ви адресат?', 'Предъявите, пожалуйста, удостоверение личности. Вы адресат?', 'Your ID, please. Are you the addressee?'),
        choose: [
          ['Tak, list jest do mnie. Nadawcą jest urząd miasta.', t('Так, лист до мене. Відправник — міська управа.', 'Да, письмо мне. Отправитель — городская управа.', 'Yes, the letter is for me. The sender is the city office.')],
          ['Tak, list jest ode mnie. Nadawcą jest urząd miasta.', t('(**ode mnie** — «від мене»; лист адресовано мені: **do mnie**)', '(**ode mnie** — «от меня»; письмо адресовано мне: **do mnie**)', '(**ode mnie** means “from me”; a letter addressed to me is **do mnie**)')],
          ['Tak, list jest do mnie. Nadawca jest urząd miasta.', t('(**jest** + орудний: **Nadawcą jest…**)', '(**jest** + творительный: **Nadawcą jest…**)', '(**jest** takes the instrumental here: **Nadawcą jest…**)')],
        ],
        feedback: t('**do** + родовий — кому адресовано; **od** + родовий — від кого.', '**do** + родительный — кому адресовано; **od** + родительный — от кого.', '**do** + genitive — addressed to; **od** + genitive — from.'),
      },
    ]),
    wordChoice('vocab.poczta', 'awizo', [t('повідомлення про відправлення на пошті', 'извещение об отправлении на почте', 'collection notice'), t('рекомендований лист', 'заказное письмо', 'registered letter'), t('поштова скринька', 'почтовый ящик', 'letterbox')]),
    fillGap('grammar.poczta', 'Ten list jest ___ urzędu, nie do mnie.', ['od', 'do', 'na'], t('Цей лист — від установи, не до мене.', 'Это письмо — от учреждения, не мне.', 'This letter is from the office, not to me.'),
      t('Від кого? — **od** + родовий: **od urzędu**.', 'От кого? — **od** + родительный: **od urzędu**.', 'From whom? — **od** + genitive: **od urzędu**.')),
    match('vocab.poczta', [
      ['nadawca', t('відправник', 'отправитель', 'sender')],
      ['adresat', t('одержувач, адресат', 'получатель, адресат', 'addressee')],
      ['przesyłka', t('відправлення', 'отправление', 'parcel, mail item')],
      ['kod pocztowy', t('поштовий індекс', 'почтовый индекс', 'postcode')],
    ]),
    grammar('grammar.poczta', 'Przesyłka czeka na poczcie od ___.', 'wtorek', ['wtorku'], t('Відправлення чекає на пошті з вівторка.', 'Отправление ждёт на почте со вторника.', 'The parcel has been waiting at the post office since Tuesday.'),
      t('**od** + родовий: **od wtorku**.', '**od** + родительный: **od wtorku**.', '**od** + genitive: **od wtorku**.')),
    listen('listening.poczta', 'Proszę wysłać list na adres: ulica Lipowa pięć, mieszkanie dwanaście.', ['Proszę wysłać list na adres: ulica Lipowa pięć, mieszkanie dwanaście.', 'Proszę wysłać list na adres: ulica Lipowa piętnaście, mieszkanie dwa.', 'Proszę wysłać list na adres: ulica Lipowa pięć, mieszkanie dwadzieścia.']),
    reading('reading.poczta', 'Awizo. Na Pana adres przyszła przesyłka polecona. Nadawca: Sąd Rejonowy w Lublinie. Przesyłka czeka w placówce pocztowej nr 5 przy ulicy Lipowej 8 przez czternaście dni od daty pierwszego awizo. Odbiór: od poniedziałku do piątku w godzinach 8.00–18.00. Prosimy zabrać dokument tożsamości. Po upływie terminu przesyłka wróci do nadawcy.',
      t('Що станеться, якщо не забрати відправлення протягом чотирнадцяти днів?', 'Что произойдёт, если не забрать отправление в течение четырнадцати дней?', 'What happens if you do not collect the item within fourteen days?'),
      [t('воно повернеться до відправника', 'оно вернётся отправителю', 'it will be returned to the sender'), t('його повторно доставлять на адресу', 'его повторно доставят по адресу', 'it will be delivered to your address again'), t('його передадуть до суду', 'его передадут в суд', 'it will be passed to the court')]),
    findError('grammar.poczta', ['Wysyłam', 'list', 'polecony', 'za', 'potwierdzenie', 'odbioru'], 4, t('Я відправляю рекомендований лист із підтвердженням отримання.', 'Я отправляю заказное письмо с уведомлением о вручении.', 'I am sending a registered letter with an acknowledgement of receipt.'),
      t('Сталий вираз: **za potwierdzeniem odbioru** — **za** + орудний.', 'Устойчивое выражение: **za potwierdzeniem odbioru** — **za** + творительный.', 'Fixed phrase: **za potwierdzeniem odbioru** — **za** + instrumental.')),
    build('grammar.poczta', 'Nadawcą listu jest urząd miasta', t('Відправник листа — міська управа', 'Отправитель письма — городская управа', 'The sender of the letter is the city office'), ['nadawca', 'urzędu']),
    oddOne('grammar.poczta', ['list do pana Nowaka', 'paczka do siostry', 'awizo do mieszkańca', 'list od urzędu'], 3,
      t('Три фрази називають одержувача (**do** + родовий), а **od urzędu** — відправника.', 'Три фразы называют получателя (**do** + родительный), а **od urzędu** — отправителя.', 'Three phrases name the recipient (**do** + genitive); **od urzędu** names the sender.'),
      t('Яка фраза називає відправника, а не одержувача?', 'Какая фраза называет отправителя, а не получателя?', 'Which phrase names the sender rather than the recipient?')),
    translate('writing.poczta', t('Я відправляю рекомендований лист із підтвердженням отримання.', 'Я отправляю заказное письмо с уведомлением о вручении.', 'I am sending a registered letter with an acknowledgement of receipt.'),
      ['Wysyłam list polecony za potwierdzeniem odbioru', 'Wysyłam polecony list za potwierdzeniem odbioru', 'Chcę wysłać list polecony za potwierdzeniem odbioru']),
    speak('speaking.poczta', 'Przyszedłem odebrać przesyłkę. Dostałem awizo w skrzynce.', t('Я прийшов забрати відправлення. Я отримав авізо в скриньці.', 'Я пришёл забрать отправление. Я получил авизо в ящике.', 'I’ve come to collect a parcel. I got a collection notice in my letterbox.')),
  ],
};

const LUB_6: LessonSeed = {
  slug: 'lub-6-bank',
  title: t('Банк і картка', 'Банк и карта', 'The bank and your card'),
  topic: t(
    'Założyć konto; wpłacić / wypłacić (доконаний і недоконаний вид); numer konta, saldo; zablokować kartę; ввічливо: chciałbym…, czy mógłbym…?',
    'Założyć konto; wpłacić / wypłacić (совершенный и несовершенный вид); numer konta, saldo; zablokować kartę; вежливо: chciałbym…, czy mógłbym…?',
    'Założyć konto; wpłacić / wypłacić (perfective and imperfective); numer konta, saldo; zablokować kartę; politely: chciałbym…, czy mógłbym…?',
  ),
  cefr: 'B1',
  difficulty: 3,
  explanation: t(
    '**Мета:** відкрити рахунок, внести й зняти гроші, заблокувати втрачену картку.\n**Założyć konto** — відкрити рахунок (знахідний: **konto**). **Wpłacić** — внести **na** рахунок, **wypłacić** — зняти **z** рахунку чи банкомату: **wpłacić pieniądze na konto**, **wypłacić gotówkę z bankomatu**. Повторювану дію називають недоконаним видом: **co miesiąc wpłacam / wypłacam**.\nСуми: **pięćset złotych**, **trzysta czterdzieści złotych** (після 5 і більше — родовий множини). **Saldo** — залишок, **numer konta** — номер рахунку, **karta płatnicza** — платіжна картка. Загубив картку — **proszę ją zablokować**. Ввічливо проси так: **chciałbym…**, **czy mógłbym…?** (умовний спосіб).',
    '**Цель:** открыть счёт, внести и снять деньги, заблокировать потерянную карту.\n**Założyć konto** — открыть счёт (винительный: **konto**). **Wpłacić** — внести **na** счёт, **wypłacić** — снять **z** счёта или банкомата: **wpłacić pieniądze na konto**, **wypłacić gotówkę z bankomatu**. Повторяющееся действие называют несовершенным видом: **co miesiąc wpłacam / wypłacam**.\nСуммы: **pięćset złotych**, **trzysta czterdzieści złotych** (после 5 и больше — родительный множественного). **Saldo** — остаток, **numer konta** — номер счёта, **karta płatnicza** — платёжная карта. Потерял карту — **proszę ją zablokować**. Вежливо проси так: **chciałbym…**, **czy mógłbym…?** (условное наклонение).',
    '**Goal:** open an account, pay in and withdraw money, block a lost card.\n**Założyć konto** — to open an account (accusative: **konto**). **Wpłacić** — to pay in **na** (onto) an account, **wypłacić** — to withdraw **z** (from) an account or a cash machine: **wpłacić pieniądze na konto**, **wypłacić gotówkę z bankomatu**. A repeated action takes the imperfective: **co miesiąc wpłacam / wypłacam**.\nAmounts: **pięćset złotych**, **trzysta czterdzieści złotych** (from five up — genitive plural). **Saldo** is the balance, **numer konta** the account number, **karta płatnicza** a payment card. If you lose your card — **proszę ją zablokować**. Ask politely with **chciałbym…**, **czy mógłbym…?** (the conditional).',
  ),
  examples: [
    { pl: 'Chciałbym założyć konto i dostać kartę płatniczą.', tr: t('Я хотів би відкрити рахунок і отримати платіжну картку.', 'Я хотел бы открыть счёт и получить платёжную карту.', 'I’d like to open an account and get a payment card.') },
    { pl: 'Zgubiłem kartę. Proszę ją zablokować.', tr: t('Я загубив картку. Будь ласка, заблокуйте її.', 'Я потерял карту. Заблокируйте её, пожалуйста.', 'I lost my card. Please block it.') },
  ],
  words: ['saldo', 'wpłacić', 'wypłacić', 'karta płatnicza', 'zablokować', 'numer konta'],
  exercises: [
    dialogue('dialogue.bank', DORADCA, [
      {
        npc: 'Dzień dobry. W czym mogę pomóc?',
        tr: t('Добрий день. Чим можу допомогти?', 'Добрый день. Чем могу помочь?', 'Good morning. How can I help?'),
        choose: [
          ['Dzień dobry, chciałbym założyć konto w złotówkach.', t('Добрий день, я хотів би відкрити рахунок у злотих.', 'Добрый день, я хотел бы открыть счёт в злотых.', 'Hello, I’d like to open an account in zloty.')],
          ['Dzień dobry, chciałbym założę konto w złotówkach.', t('(після **chciałbym** — інфінітив: **założyć**)', '(после **chciałbym** — инфинитив: **założyć**)', '(after **chciałbym** use the infinitive: **założyć**)')],
          ['Dzień dobry, chciałbym założyć konta w złotówkach.', t('(**założyć** + знахідний: **konto**)', '(**założyć** + винительный: **konto**)', '(**założyć** takes the accusative: **konto**)')],
        ],
        feedback: t('**chciałbym** + інфінітив; **założyć konto** (знахідний).', '**chciałbym** + инфинитив; **założyć konto** (винительный).', '**chciałbym** + infinitive; **założyć konto** (accusative).'),
      },
      {
        npc: 'Konto zostało założone. Czy chce pan od razu wpłacić jakąś kwotę?',
        tr: t('Рахунок відкрито. Чи хочете ви одразу внести якусь суму?', 'Счёт открыт. Хотите сразу внести какую-нибудь сумму?', 'The account is open. Would you like to pay in an amount right away?'),
        choose: [
          ['Tak, chcę wpłacić pięćset złotych.', t('Так, я хочу внести п’ятсот злотих.', 'Да, я хочу внести пятьсот злотых.', 'Yes, I’d like to pay in five hundred zloty.')],
          ['Tak, chcę wypłacić pięćset złotych.', t('(**wypłacić** — зняти з рахунку; внести — **wpłacić**)', '(**wypłacić** — снять со счёта; внести — **wpłacić**)', '(**wypłacić** means to withdraw; to pay in is **wpłacić**)')],
          ['Tak, chcę wpłacić pięćset złoty.', t('(після **pięćset** — родовий множини: **złotych**)', '(после **pięćset** — родительный множественного: **złotych**)', '(after **pięćset** use the genitive plural: **złotych**)')],
        ],
        feedback: t('**wpłacić** — на рахунок; **pięćset złotych** — родовий множини.', '**wpłacić** — на счёт; **pięćset złotych** — родительный множественного.', '**wpłacić** — onto the account; **pięćset złotych** — genitive plural.'),
      },
    ]),
    wordChoice('vocab.bank', 'saldo', [t('залишок на рахунку', 'остаток на счёте', 'account balance'), t('відсоток за вкладом', 'процент по вкладу', 'deposit interest'), t('комісія за переказ', 'комиссия за перевод', 'transfer fee')]),
    fillGap('grammar.bank', 'Chcę ___ pieniądze z bankomatu.', ['wypłacić', 'wpłacić', 'zapłacić'], t('Я хочу зняти гроші в банкоматі.', 'Я хочу снять деньги в банкомате.', 'I want to withdraw money from the cash machine.'),
      t('**z** банкомату — зняти: **wypłacić**.', '**z** банкомата — снять: **wypłacić**.', 'Money **from** the machine — to withdraw: **wypłacić**.')),
    match('vocab.bank', [
      ['saldo', t('залишок на рахунку', 'остаток на счёте', 'balance')],
      ['wpłacić', t('внести на рахунок', 'внести на счёт', 'to pay in')],
      ['wypłacić', t('зняти з рахунку', 'снять со счёта', 'to withdraw')],
      ['zablokować', t('заблокувати', 'заблокировать', 'to block')],
    ]),
    grammar('grammar.bank', 'Wczoraj ___ pięćset złotych na konto.', 'wpłacić', ['wpłaciłem', 'wpłaciłam'], t('Вчора я поклав п’ятсот злотих на рахунок.', 'Вчера я положил пятьсот злотых на счёт.', 'Yesterday I paid five hundred zloty into my account.'),
      t('**Wczoraj** — минулий час: **wpłaciłem**.', '**Wczoraj** — прошедшее время: **wpłaciłem**.', '**Wczoraj** needs the past tense: **wpłaciłem**.')),
    listen('listening.bank', 'Saldo mojego konta wynosi trzysta czterdzieści złotych.', ['Saldo mojego konta wynosi trzysta czterdzieści złotych.', 'Saldo mojego konta wynosi czterysta czterdzieści złotych.', 'Saldo mojego konta wynosi trzysta czternaście złotych.']),
    reading('reading.bank', 'Bank Lubelski: Karta kończąca się na 4827 została zablokowana na Pana prośbę. Nowa karta zostanie wysłana na adres do korespondencji w ciągu pięciu dni roboczych. Aby sprawdzić saldo, zaloguj się do aplikacji lub zadzwoń na infolinię.',
      t('Коли клієнт отримає нову картку?', 'Когда клиент получит новую карту?', 'When will the customer get the new card?'),
      [t('протягом п’яти робочих днів', 'в течение пяти рабочих дней', 'within five working days'), t('протягом п’яти календарних днів', 'в течение пяти календарных дней', 'within five calendar days'), t('протягом п’ятнадцяти робочих днів', 'в течение пятнадцати рабочих дней', 'within fifteen working days')]),
    findError('grammar.bank', ['Chcę', 'wypłacić', 'pięćset', 'złoty', 'z', 'bankomatu'], 3, t('Я хочу зняти п’ятсот злотих у банкоматі.', 'Я хочу снять пятьсот злотых в банкомате.', 'I want to withdraw five hundred zloty from the cash machine.'),
      t('Після **pięćset** — родовий множини: **złotych**.', 'После **pięćset** — родительный множественного: **złotych**.', 'After **pięćset** use the genitive plural: **złotych**.')),
    build('grammar.bank', 'Czy mógłbym wypłacić gotówkę z konta', t('Чи міг би я зняти готівку з рахунку', 'Мог бы я снять наличные со счёта', 'Could I withdraw cash from the account'), ['wypłacę', 'kontu']),
    oddOne('grammar.bank', ['wpłacić pieniądze', 'wypłacić gotówkę', 'zablokować kartę', 'zablokować karta'], 3,
      t('**Zablokować** + знахідний: **zablokować kartę**.', '**Zablokować** + винительный: **zablokować kartę**.', '**Zablokować** takes the accusative: **zablokować kartę**.'),
      t('Яке словосполучення неправильне?', 'Какое словосочетание неправильное?', 'Which phrase is wrong?')),
    translate('writing.bank', t('Я загубив картку. Будь ласка, заблокуйте її.', 'Я потерял карту. Заблокируйте её, пожалуйста.', 'I lost my card. Please block it.'),
      ['Zgubiłem kartę. Proszę ją zablokować', 'Zgubiłam kartę. Proszę ją zablokować', 'Zgubiłem kartę, proszę ją zablokować', 'Zgubiłam kartę, proszę ją zablokować']),
    speak('speaking.bank', 'Chciałbym wpłacić pieniądze na konto i sprawdzić saldo.', t('Я хотів би внести гроші на рахунок і перевірити залишок.', 'Я хотел бы внести деньги на счёт и проверить остаток.', 'I’d like to pay money into my account and check the balance.')),
  ],
};

const LUB_7: LessonSeed = {
  slug: 'lub-7-umowa',
  title: t('Договір: права й обов’язки', 'Договор: права и обязанности', 'The contract: rights and duties'),
  topic: t(
    'Zawrzeć i wypowiedzieć umowę, okres wypowiedzenia; zobowiązać się do + родовий; formalne przyimki: na podstawie, w razie + родовий',
    'Zawrzeć i wypowiedzieć umowę, okres wypowiedzenia; zobowiązać się do + родительный; формальные предлоги: na podstawie, w razie + родительный',
    'Zawrzeć and wypowiedzieć umowę, okres wypowiedzenia; zobowiązać się do + genitive; formal prepositions: na podstawie, w razie + genitive',
  ),
  cefr: 'B1',
  difficulty: 4,
  explanation: t(
    '**Мета:** зрозуміти основні пункти договору оренди чи роботи й поставити правильне запитання.\n**Zawrzeć umowę** — укласти договір, **wypowiedzieć umowę** — розірвати його з попередженням; строк — **okres wypowiedzenia** (**jeden miesiąc**, **trzy miesiące**). Сторона **zobowiązuje się do** + родовий: **do płacenia czynszu**, **do terminowej zapłaty**.\nУ документах багато офіційних прийменників з **родовим**: **na podstawie** («на підставі»): **na podstawie umowy**; **w razie** («у разі»): **w razie problemów**, **w razie wypadku**. Типовий пункт: «Umowa zostaje zawarta na czas określony» — договір укладено на визначений строк.',
    '**Цель:** понять основные пункты договора аренды или работы и задать правильный вопрос.\n**Zawrzeć umowę** — заключить договор, **wypowiedzieć umowę** — расторгнуть его с предупреждением; срок — **okres wypowiedzenia** (**jeden miesiąc**, **trzy miesiące**). Сторона **zobowiązuje się do** + родительный: **do płacenia czynszu**, **do terminowej zapłaty**.\nВ документах много официальных предлогов с **родительным**: **na podstawie** («на основании»): **na podstawie umowy**; **w razie** («в случае»): **w razie problemów**, **w razie wypadku**. Типичный пункт: «Umowa zostaje zawarta na czas określony» — договор заключён на определённый срок.',
    '**Goal:** understand the main clauses of a rental or job contract and ask the right question.\n**Zawrzeć umowę** — to conclude a contract, **wypowiedzieć umowę** — to terminate it with notice; the notice period is **okres wypowiedzenia** (**jeden miesiąc**, **trzy miesiące**). A party **zobowiązuje się do** + genitive: **do płacenia czynszu**, **do terminowej zapłaty**.\nOfficial documents use many prepositions with the **genitive**: **na podstawie** (“on the basis of”): **na podstawie umowy**; **w razie** (“in case of”): **w razie problemów**, **w razie wypadku**. A typical clause: “Umowa zostaje zawarta na czas określony” — the contract is concluded for a fixed term.',
  ),
  examples: [
    { pl: 'Na podstawie tej umowy najemca zobowiązuje się do płacenia czynszu.', tr: t('На підставі цього договору орендар зобов’язується платити оренду.', 'На основании этого договора наниматель обязуется платить арендную плату.', 'Under this contract the tenant undertakes to pay the rent.') },
    { pl: 'W razie problemów proszę dzwonić do administratora.', tr: t('У разі проблем телефонуйте адміністратору.', 'В случае проблем звоните администратору.', 'In case of problems, please call the administrator.') },
  ],
  words: ['zawrzeć', 'wypowiedzieć', 'okres wypowiedzenia', 'zobowiązać się', 'na podstawie', 'w razie'],
  exercises: [
    dialogue('dialogue.umowa', WYNAJMUJACA, [
      {
        npc: 'Umowa najmu zostaje zawarta na rok. Czy to panu odpowiada?',
        tr: t('Договір оренди укладається на рік. Вам це підходить?', 'Договор аренды заключается на год. Вас это устраивает?', 'The rental agreement is concluded for a year. Does that suit you?'),
        choose: [
          ['Tak, ale chciałbym wiedzieć, jaki jest okres wypowiedzenia.', t('Так, але я хотів би знати, який термін попередження про розірвання.', 'Да, но я хотел бы знать, каков срок предупреждения о расторжении.', 'Yes, but I’d like to know what the notice period is.')],
          ['Tak, ale chciałbym wiedzieć, jaki jest okres wypowiedzieć.', t('(**okres** + родовий іменника: **wypowiedzenia**, а не інфінітив)', '(**okres** + родительный существительного: **wypowiedzenia**, а не инфинитив)', '(**okres** takes the genitive of a noun: **wypowiedzenia**, not an infinitive)')],
          ['Tak, ale chciałbym wiedzieć, jaki jest okresu wypowiedzenia.', t('(**jaki jest** + називний: **okres**)', '(**jaki jest** + именительный: **okres**)', '(**jaki jest** takes the nominative: **okres**)')],
        ],
        feedback: t('**okres wypowiedzenia** — іменник у родовому; **jaki jest okres** — називний.', '**okres wypowiedzenia** — существительное в родительном; **jaki jest okres** — именительный.', '**okres wypowiedzenia** — a noun in the genitive; **jaki jest okres** — nominative.'),
      },
      {
        npc: 'Okres wypowiedzenia wynosi miesiąc. W razie problemów proszę dzwonić do mnie.',
        tr: t('Термін попередження — місяць. У разі проблем телефонуйте мені.', 'Срок предупреждения — месяц. В случае проблем звоните мне.', 'The notice period is a month. In case of problems, please call me.'),
        choose: [
          ['Dziękuję. Czy mogę wypowiedzieć umowę wcześniej, jeśli znajdę pracę w innym mieście?', t('Дякую. Чи можу я розірвати договір раніше, якщо знайду роботу в іншому місті?', 'Спасибо. Могу ли я расторгнуть договор раньше, если найду работу в другом городе?', 'Thank you. May I terminate the contract earlier if I find a job in another city?')],
          ['Dziękuję. Czy mogę wypowiadać umowę wcześniej, jeśli znajdę pracę w innym mieście?', t('(одна дія — доконаний вид: **wypowiedzieć**)', '(одно действие — совершенный вид: **wypowiedzieć**)', '(a single action takes the perfective: **wypowiedzieć**)')],
          ['Dziękuję. Czy mogę wypowiedzieć umowę wcześniej, jeśli znajdę pracę w innym miasto?', t('(**w** + місцевий: **w innym mieście**)', '(**w** + предложный: **w innym mieście**)', '(**w** takes the locative: **w innym mieście**)')],
        ],
        feedback: t('**jeśli** + майбутній доконаний (**znajdę**); **w innym mieście** — місцевий.', '**jeśli** + будущее совершенного вида (**znajdę**); **w innym mieście** — предложный.', '**jeśli** + perfective future (**znajdę**); **w innym mieście** — locative.'),
      },
    ]),
    wordChoice('vocab.umowa', 'zawrzeć', [t('укласти (договір)', 'заключить (договор)', 'to conclude (a contract)'), t('прочитати (договір)', 'прочитать (договор)', 'to read (a contract)'), t('порушити (договір)', 'нарушить (договор)', 'to breach (a contract)')]),
    fillGap('grammar.umowa', 'Wynajmuję mieszkanie ___ tej umowy.', ['na podstawie', 'na podstawę', 'w podstawie'], t('Я винаймаю квартиру на підставі цього договору.', 'Я снимаю квартиру на основании этого договора.', 'I rent the flat on the basis of this contract.'),
      t('**na podstawie** + родовий — «на підставі».', '**na podstawie** + родительный — «на основании».', '**na podstawie** + genitive means “on the basis of”.')),
    match('vocab.umowa', [
      ['zawrzeć umowę', t('укласти договір', 'заключить договор', 'to conclude a contract')],
      ['wypowiedzieć umowę', t('розірвати договір', 'расторгнуть договор', 'to terminate a contract')],
      ['okres wypowiedzenia', t('термін попередження', 'срок предупреждения', 'notice period')],
      ['w razie', t('у разі', 'в случае', 'in case of')],
    ]),
    grammar('grammar.umowa', 'Najemca zobowiązuje się do płacenia ___ co miesiąc.', 'czynsz', ['czynszu'], t('Орендар зобов’язується щомісяця платити оренду.', 'Наниматель обязуется ежемесячно платить арендную плату.', 'The tenant undertakes to pay the rent every month.'),
      t('**do** + родовий: **do płacenia czynszu**.', '**do** + родительный: **do płacenia czynszu**.', '**do** + genitive: **do płacenia czynszu**.')),
    listen('listening.umowa', 'Okres wypowiedzenia wynosi trzy miesiące.', ['Okres wypowiedzenia wynosi trzy miesiące.', 'Okres wypowiedzenia wynosi jeden miesiąc.', 'Okres wypowiedzenia wynosi trzy tygodnie.']),
    reading('reading.umowa', '§ 1. Wynajmujący oddaje najemcy do używania mieszkanie przy ulicy Lipowej 5/12 w Lublinie. § 2. Umowa zostaje zawarta na czas określony od 1 września do 31 sierpnia. § 3. Najemca zobowiązuje się płacić czynsz w wysokości 2200 zł do dziesiątego dnia każdego miesiąca. § 4. Każda ze stron może wypowiedzieć umowę z zachowaniem jednomiesięcznego okresu wypowiedzenia.',
      t('Що має зробити орендар до десятого числа кожного місяця?', 'Что должен сделать наниматель до десятого числа каждого месяца?', 'What must the tenant do by the tenth of every month?'),
      [t('заплатити оренду', 'заплатить аренду', 'pay the rent'), t('повідомити про розірвання договору', 'сообщить о расторжении договора', 'give notice to terminate'), t('віддати ключі власникові', 'вернуть ключи владельцу', 'return the keys to the landlord')]),
    findError('grammar.umowa', ['Najemca', 'zobowiązuje', 'się', 'do', 'płacenie', 'czynszu'], 4, t('Орендар зобов’язується платити оренду.', 'Наниматель обязуется платить арендную плату.', 'The tenant undertakes to pay the rent.'),
      t('**do** + родовий: **do płacenia**.', '**do** + родительный: **do płacenia**.', '**do** + genitive: **do płacenia**.')),
    build('grammar.umowa', 'W razie problemów proszę dzwonić do administratora', t('У разі проблем телефонуйте адміністратору', 'В случае проблем звоните администратору', 'In case of problems please call the administrator'), ['problemy', 'administrator']),
    oddOne('grammar.umowa', ['na podstawie umowy', 'w razie wypadku', 'zobowiązać się do zapłaty', 'na podstawie umowa'], 3,
      t('Після **na podstawie** — родовий: **na podstawie umowy**.', 'После **na podstawie** — родительный: **na podstawie umowy**.', 'After **na podstawie** use the genitive: **na podstawie umowy**.'),
      t('Яка фраза містить помилку?', 'Какое выражение содержит ошибку?', 'Which expression contains a mistake?')),
    translate('writing.umowa', t('У разі проблем зателефонуйте адміністратору.', 'В случае проблем позвоните администратору.', 'In case of problems, call the administrator.'),
      ['W razie problemów proszę zadzwonić do administratora', 'W razie problemów proszę dzwonić do administratora', 'W razie problemów zadzwoń do administratora', 'W razie problemów niech pan zadzwoni do administratora']),
    speak('speaking.umowa', 'Chcę wypowiedzieć umowę najmu z miesięcznym okresem wypowiedzenia.', t('Я хочу розірвати договір оренди з місячним терміном попередження.', 'Я хочу расторгнуть договор аренды с месячным сроком предупреждения.', 'I want to terminate the rental agreement with a one-month notice period.')),
  ],
};

const LUB_8: LessonSeed = {
  slug: 'lub-8-unia',
  title: t('Люблін і унія 1569 року', 'Люблин и уния 1569 года', 'Lublin and the 1569 union'),
  topic: t(
    'Безособові форми на -no / -to: zawarto, podpisano, zbudowano; w 1569 roku; Unia Lubelska, sejm; Stare Miasto (po Starym Mieście); cebularz',
    'Безличные формы на -no / -to: zawarto, podpisano, zbudowano; w 1569 roku; Unia Lubelska, sejm; Stare Miasto (po Starym Mieście); cebularz',
    'Impersonal forms in -no / -to: zawarto, podpisano, zbudowano; w 1569 roku; Unia Lubelska, sejm; Stare Miasto (po Starym Mieście); cebularz',
  ),
  cefr: 'B1',
  difficulty: 4,
  explanation: t(
    '**Мета:** розповісти про історію міста безособовими формами й зрозуміти короткий текст про Люблінську унію.\nКоли виконавця не називають, у минулому часі вживають безособову форму на **-no / -to**: **zawarto unię** («уклали унію»), **podpisano umowę**, **zbudowano zamek**, **założono miasto**. Підмета немає, об’єкт стоїть у **знахідному**: **zbudowano zamek**, **zawarto unię**.\nУ **1569 roku** (**w tysiąc pięćset sześćdziesiątym dziewiątym roku**) у Любліні **zawarto unię** Королівства Польського й Великого князівства Литовського; **sejm** обговорював її кілька місяців. Старим містом гуляють так: **spacerować po Starym Mieście** (**po** + місцевий). Місцевий смаколик — **cebularz**, булочка з цибулею й маком.',
    '**Цель:** рассказать об истории города безличными формами и понять короткий текст о Люблинской унии.\nКогда исполнителя не называют, в прошедшем времени употребляют безличную форму на **-no / -to**: **zawarto unię** («заключили унию»), **podpisano umowę**, **zbudowano zamek**, **założono miasto**. Подлежащего нет, объект стоит в **винительном**: **zbudowano zamek**, **zawarto unię**.\nВ **1569 году** (**w tysiąc pięćset sześćdziesiątym dziewiątym roku**) в Люблине **zawarto unię** Королевства Польского и Великого княжества Литовского; **sejm** обсуждал её несколько месяцев. По Старому городу гуляют так: **spacerować po Starym Mieście** (**po** + предложный). Местное лакомство — **cebularz**, булочка с луком и маком.',
    '**Goal:** talk about a city’s history with impersonal forms and understand a short text about the Union of Lublin.\nWhen the doer is not named, the past tense uses the impersonal form in **-no / -to**: **zawarto unię** (“a union was concluded”), **podpisano umowę**, **zbudowano zamek**, **założono miasto**. There is no subject and the object stays **accusative**: **zbudowano zamek**, **zawarto unię**.\nIn **1569** (**w tysiąc pięćset sześćdziesiątym dziewiątym roku**) the union of the Kingdom of Poland and the Grand Duchy of Lithuania was concluded in Lublin (**zawarto unię**); the **sejm** debated it for several months. You stroll around the Old Town like this: **spacerować po Starym Mieście** (**po** + locative). The local treat is **cebularz**, a roll with onion and poppy seeds.',
  ),
  examples: [
    { pl: 'W 1569 roku zawarto w Lublinie unię Polski i Litwy.', tr: t('У 1569 році в Любліні уклали унію Польщі й Литви.', 'В 1569 году в Люблине заключили унию Польши и Литвы.', 'In 1569 the union of Poland and Lithuania was concluded in Lublin.') },
    { pl: 'Wieczorem spacerujemy po Starym Mieście i jemy cebularz.', tr: t('Увечері ми гуляємо Старим містом і їмо цебуляж.', 'Вечером мы гуляем по Старому городу и едим цебуляж.', 'In the evening we stroll around the Old Town and eat cebularz.') },
  ],
  words: ['unia', 'sejm', 'królestwo', 'księstwo', 'cebularz', 'Stare Miasto'],
  exercises: [
    dialogue('dialogue.unia', PRZEWODNICZKA, [
      {
        npc: 'Tu, w Lublinie, w 1569 roku zawarto unię Polski i Litwy.',
        tr: t('Тут, у Любліні, 1569 року уклали унію Польщі й Литви.', 'Здесь, в Люблине, в 1569 году заключили унию Польши и Литвы.', 'Here in Lublin, in 1569, the union of Poland and Lithuania was concluded.'),
        choose: [
          ['Ciekawe! A kto ją podpisał?', t('Цікаво! А хто її підписав?', 'Интересно! А кто её подписал?', 'Interesting! And who signed it?')],
          ['Ciekawe! A kto ją podpisano?', t('(безособова форма **podpisano** — без підмета; із **kto** потрібне **podpisał**)', '(безличная форма **podpisano** — без подлежащего; с **kto** нужно **podpisał**)', '(the impersonal **podpisano** has no subject; with **kto** you need **podpisał**)')],
          ['Ciekawe! A kto jej podpisał?', t('(**podpisać** + знахідний: **ją**, а не родовий)', '(**podpisać** + винительный: **ją**, а не родительный)', '(**podpisać** takes the accusative: **ją**, not the genitive)')],
        ],
        feedback: t('Є підмет **kto** — **podpisał**; **podpisano** — без підмета.', 'Есть подлежащее **kto** — **podpisał**; **podpisano** — без подлежащего.', 'With the subject **kto** use **podpisał**; **podpisano** has no subject.'),
      },
      {
        npc: 'Na Starym Mieście stoi też Zamek Lubelski. Zbudowano go w średniowieczu.',
        tr: t('На Старому місті стоїть і Люблінський замок. Його збудували в середньовіччі.', 'На Старом городе стоит и Люблинский замок. Его построили в средневековье.', 'The Lublin Castle also stands in the Old Town. It was built in the Middle Ages.'),
        choose: [
          ['Chętnie pospaceruję po Starym Mieście i zjem cebularz.', t('Залюбки погуляю Старим містом і з’їм цебуляж.', 'С удовольствием погуляю по Старому городу и съем цебуляж.', 'I’ll gladly stroll around the Old Town and eat a cebularz.')],
          ['Chętnie pospaceruję na Starym Mieście i zjem cebularz.', t('(гуляти містом — **po** + місцевий: **po Starym Mieście**)', '(гулять по городу — **po** + предложный: **po Starym Mieście**)', '(strolling around — **po** + locative: **po Starym Mieście**)')],
          ['Chętnie pospaceruję po Stare Miasto i zjem cebularz.', t('(**po** + місцевий: **po Starym Mieście**)', '(**po** + предложный: **po Starym Mieście**)', '(**po** takes the locative: **po Starym Mieście**)')],
        ],
        feedback: t('**spacerować po** + місцевий.', '**spacerować po** + предложный.', '**spacerować po** + locative.'),
      },
    ]),
    wordChoice('vocab.unia', 'sejm', [t('сейм, парламент', 'сейм, парламент', 'the Sejm (parliament)'), t('королівський суд', 'королевский суд', 'royal court'), t('міська рада', 'городской совет', 'city council')]),
    fillGap('grammar.unia', 'W 1569 roku ___ w Lublinie unię.', ['zawarto', 'zawarta', 'zawierać'], t('У 1569 році в Любліні уклали унію.', 'В 1569 году в Люблине заключили унию.', 'In 1569 a union was concluded in Lublin.'),
      t('Безособова форма на **-no** і знахідний: **zawarto unię**.', 'Безличная форма на **-no** и винительный: **zawarto unię**.', 'The impersonal **-no** form with the accusative: **zawarto unię**.')),
    match('vocab.unia', [
      ['unia', t('унія, союз', 'уния, союз', 'union')],
      ['sejm', t('сейм', 'сейм', 'the Sejm')],
      ['królestwo', t('королівство', 'королевство', 'kingdom')],
      ['księstwo', t('князівство', 'княжество', 'duchy')],
    ]),
    grammar('grammar.unia', 'W czternastym wieku ___ w Lublinie zamek.', 'zbudować', ['zbudowano'], t('У чотирнадцятому столітті в Любліні збудували замок.', 'В четырнадцатом веке в Люблине построили замок.', 'In the fourteenth century a castle was built in Lublin.'),
      t('Безособова форма на **-no**: **zbudowano zamek**.', 'Безличная форма на **-no**: **zbudowano zamek**.', 'The impersonal **-no** form: **zbudowano zamek**.')),
    listen('listening.unia', 'W tysiąc pięćset sześćdziesiątym dziewiątym roku zawarto w Lublinie unię.', ['W tysiąc pięćset sześćdziesiątym dziewiątym roku zawarto w Lublinie unię.', 'W tysiąc pięćset siedemdziesiątym dziewiątym roku zawarto w Lublinie unię.', 'W tysiąc pięćset sześćdziesiątym ósmym roku zawarto w Lublinie unię.']),
    reading('reading.unia', 'Unia Lubelska została zawarta w 1569 roku. Połączyła Królestwo Polskie i Wielkie Księstwo Litewskie w jedno państwo, nazywane Rzecząpospolitą Obojga Narodów. Sejm, który obradował w Lublinie, trwał kilka miesięcy. Dziś o tym wydarzeniu przypomina pomnik Unii Lubelskiej na placu Litewskim.',
      t('Що з’єднала Люблінська унія?', 'Что объединила Люблинская уния?', 'What did the Union of Lublin join together?'),
      [t('Королівство Польське й Велике князівство Литовське', 'Королевство Польское и Великое княжество Литовское', 'the Kingdom of Poland and the Grand Duchy of Lithuania'), t('Королівство Польське й Тевтонський орден', 'Королевство Польское и Тевтонский орден', 'the Kingdom of Poland and the Teutonic Order'), t('Королівство Польське й Королівство Угорське', 'Королевство Польское и Королевство Венгерское', 'the Kingdom of Poland and the Kingdom of Hungary')]),
    findError('grammar.unia', ['Latem', '1569', 'roku', 'zawarto', 'w', 'Lublinie', 'unia'], 6, t('Влітку 1569 року в Любліні уклали унію.', 'Летом 1569 года в Люблине заключили унию.', 'In the summer of 1569 a union was concluded in Lublin.'),
      t('Після безособового **zawarto** об’єкт — знахідний: **unię**.', 'После безличного **zawarto** объект — винительный: **unię**.', 'After the impersonal **zawarto** the object is accusative: **unię**.')),
    build('grammar.unia', 'Wieczorem spacerujemy po Starym Mieście', t('Увечері ми гуляємо Старим містом', 'Вечером мы гуляем по Старому городу', 'In the evening we stroll around the Old Town'), ['Starego', 'Miasto']),
    oddOne('grammar.unia', ['zbudowano zamek', 'zawarto unię', 'założono miasto', 'zbudował zamek'], 3,
      t('Три форми безособові (**-no / -to**), а **zbudował** — особова, з підметом.', 'Три формы безличные (**-no / -to**), а **zbudował** — личная, с подлежащим.', 'Three forms are impersonal (**-no / -to**); **zbudował** is a personal form with a subject.'),
      t('Яка форма не є безособовою на -no / -to?', 'Какая форма не является безличной на -no / -to?', 'Which form is not an impersonal -no / -to form?')),
    translate('writing.unia', t('У 1569 році в Любліні уклали унію.', 'В 1569 году в Люблине заключили унию.', 'In 1569 a union was concluded in Lublin.'),
      ['W 1569 roku zawarto w Lublinie unię', 'W tysiąc pięćset sześćdziesiątym dziewiątym roku zawarto w Lublinie unię', 'W Lublinie zawarto unię w 1569 roku', 'W Lublinie zawarto unię w tysiąc pięćset sześćdziesiątym dziewiątym roku']),
    speak('speaking.unia', 'Wieczorem spacerujemy po Starym Mieście i jemy cebularz.', t('Увечері ми гуляємо Старим містом і їмо цебуляж.', 'Вечером мы гуляем по Старому городу и едим цебуляж.', 'In the evening we stroll around the Old Town and eat cebularz.')),
  ],
};

export const LUB_5_8: LessonSeed[] = [LUB_5, LUB_6, LUB_7, LUB_8];

export const LUB_BOSS: LessonSeed = {
  slug: 'lub-boss',
  kind: 'BOSS',
  title: t('Бос: Справа в Любліні', 'Босс: Дело в Люблине', 'Boss: Business in Lublin'),
  topic: t(
    'w sprawie + родовий, wniosek i załączniki, data w dopełniaczu, ważny do, w ciągu + родовий, awizo, od / do, wpłacić / wypłacić, na podstawie, w razie, zawarto',
    'w sprawie + родительный, wniosek i załączniki, data w dopełniaczu, ważny do, w ciągu + родительный, awizo, od / do, wpłacić / wypłacić, na podstawie, w razie, zawarto',
    'w sprawie + genitive, wniosek i załączniki, data w dopełniaczu, ważny do, w ciągu + genitive, awizo, od / do, wpłacić / wypłacić, na podstawie, w razie, zawarto',
  ),
  cefr: 'B1',
  difficulty: 4,
  explanation: t(
    'Перевір усе з Любліна: справу в установі, заяву й додатки, дати й анкету, карту побуту й терміни, пошту, банк, договір і Люблінську унію.',
    'Проверь всё из Люблина: дело в учреждении, заявление и приложения, даты и анкету, карту побыта и сроки, почту, банк, договор и Люблинскую унию.',
    'Check everything from Lublin: a matter at the office, the application and attachments, dates and forms, the residence card and deadlines, the post office, the bank, the contract and the Union of Lublin.',
  ),
  examples: [],
  words: [],
  exercises: [
    dialogue('situation.boss', URZEDNICZKA, [
      {
        npc: 'Dzień dobry. Czym mogę służyć?',
        tr: t('Добрий день. Чим можу допомогти?', 'Добрый день. Чем могу помочь?', 'Good morning. How can I help?'),
        choose: [
          ['Dzień dobry, jestem w sprawie przedłużenia zezwolenia na pobyt.', t('Добрий день, я у справі продовження дозволу на перебування.', 'Добрый день, я по делу продления разрешения на пребывание.', 'Hello, I’m here about renewing my residence permit.')],
          ['Dzień dobry, jestem w sprawie przedłużenie zezwolenia na pobyt.', t('(після **w sprawie** — родовий: **przedłużenia**)', '(после **w sprawie** — родительный: **przedłużenia**)', '(after **w sprawie** use the genitive: **przedłużenia**)')],
          ['Dzień dobry, jestem na sprawie przedłużenia zezwolenia na pobyt.', t('(усталений зворот — **w sprawie**, а не **na sprawie**)', '(устойчивый оборот — **w sprawie**, а не **na sprawie**)', '(the fixed phrase is **w sprawie**, not **na sprawie**)')],
        ],
        feedback: t('**w sprawie** + родовий.', '**w sprawie** + родительный.', '**w sprawie** + genitive.'),
      },
      {
        npc: 'Wniosek trzeba złożyć w ciągu czternastu dni i dołączyć kopię umowy najmu.',
        tr: t('Заяву треба подати протягом чотирнадцяти днів і додати копію договору оренди.', 'Заявление нужно подать в течение четырнадцати дней и приложить копию договора аренды.', 'The application must be filed within fourteen days with a copy of the rental contract attached.'),
        choose: [
          ['Dobrze. Złożę wniosek w ciągu tygodnia i dołączę kopię umowy.', t('Добре. Я подам заяву протягом тижня й додам копію договору.', 'Хорошо. Я подам заявление в течение недели и приложу копию договора.', 'All right. I’ll file within a week and attach a copy of the contract.')],
          ['Dobrze. Złożę wniosek w ciągu tydzień i dołączę kopię umowy.', t('(**w ciągu** + родовий: **tygodnia**)', '(**w ciągu** + родительный: **tygodnia**)', '(**w ciągu** + genitive: **tygodnia**)')],
          ['Dobrze. Złożę wniosek w ciągu tygodnia i dołączę kopii umowy.', t('(**dołączyć** + знахідний: **kopię**)', '(**dołączyć** + винительный: **kopię**)', '(**dołączyć** takes the accusative: **kopię**)')],
        ],
        feedback: t('**w ciągu tygodnia** — родовий; **kopię** — знахідний.', '**w ciągu tygodnia** — родительный; **kopię** — винительный.', '**w ciągu tygodnia** — genitive; **kopię** — accusative.'),
      },
    ], { situation: true, scene: t('Міська управа в Любліні', 'Городская управа в Люблине', 'Lublin City Hall') }),
    fillGap('grammar.boss', 'Urodziłem się dziesiątego ___ tysiąc dziewięćset dziewięćdziesiątego roku.', ['lipca', 'lipiec', 'lipcu'], t('Я народився десятого липня тисяча дев’ятсот дев’яностого року.', 'Я родился десятого июля тысяча девятьсот девяностого года.', 'I was born on the tenth of July, nineteen ninety.'),
      t('Місяць у даті — родовий: **dziesiątego lipca**.', 'Месяц в дате — родительный: **dziesiątego lipca**.', 'The month in a date is genitive: **dziesiątego lipca**.')),
    match('grammar.boss', [
      ['załatwić sprawę', t('владнати справу', 'уладить дело', 'to sort out a matter')],
      ['wypowiedzieć umowę', t('розірвати договір', 'расторгнуть договор', 'to terminate a contract')],
      ['za potwierdzeniem odbioru', t('з підтвердженням отримання', 'с уведомлением о вручении', 'with an acknowledgement of receipt')],
      ['w ciągu', t('протягом', 'в течение', 'within')],
    ]),
    grammar('grammar.boss', 'Wczoraj ___ wniosek w urzędzie.', 'złożyć', ['złożyłem', 'złożyłam'], t('Вчора я подав заяву в установі.', 'Вчера я подал заявление в учреждении.', 'Yesterday I filed an application at the office.'),
      t('**Wczoraj** — минулий час, результат: **złożyłem**.', '**Wczoraj** — прошедшее время, результат: **złożyłem**.', '**Wczoraj** needs the past tense, and a result takes the perfective: **złożyłem**.')),
    listen('listening.boss', 'Proszę podpisać wniosek i przynieść kopię paszportu w ciągu tygodnia.', ['Proszę podpisać wniosek i przynieść kopię paszportu w ciągu tygodnia.', 'Proszę podpisać wniosek i przynieść kopię paszportu w ciągu dwóch tygodni.', 'Proszę podpisać wniosek i przynieść kopię umowy w ciągu tygodnia.']),
    reading('reading.boss', 'Szanowna Pani, w odpowiedzi na wniosek z dnia 3 marca informujemy, że zezwolenie na pobyt zostało przedłużone do 31 grudnia. Odbiór karty możliwy jest od poniedziałku do piątku w godzinach 8:00–15:00 po okazaniu dowodu osobistego. W razie pytań prosimy o kontakt telefoniczny.',
      t('Що треба взяти з собою, щоб забрати картку?', 'Что нужно взять с собой, чтобы забрать карту?', 'What must you bring to collect the card?'),
      [t('посвідчення особи', 'удостоверение личности', 'an ID document'), t('копію договору оренди', 'копию договора аренды', 'a copy of the rental contract'), t('нову фотографію', 'новую фотографию', 'a new photograph')]),
    findError('grammar.boss', ['Karta', 'jest', 'ważna', 'do', 'trzydziesty', 'marca'], 4, t('Карта дійсна до тридцятого березня.', 'Карта действительна до тридцатого марта.', 'The card is valid until the thirtieth of March.'),
      t('Дата після **do** — родовий: **trzydziestego marca**.', 'Дата после **do** — родительный: **trzydziestego marca**.', 'A date after **do** is genitive: **trzydziestego marca**.')),
    wordChoice('vocab.boss', 'adresat', [t('одержувач, адресат', 'получатель, адресат', 'addressee'), t('відправник', 'отправитель', 'sender'), t('кур’єр', 'курьер', 'courier')]),
    build('grammar.boss', 'Chciałbym wypłacić pieniądze z konta', t('Я хотів би зняти гроші з рахунку', 'Я хотел бы снять деньги со счёта', 'I’d like to withdraw money from the account'), ['wpłacić', 'kontem']),
    oddOne('grammar.boss', ['w ciągu tygodnia', 'w ciągu miesiąca', 'w ciągu dwóch dni', 'w ciągu pięć dni'], 3,
      t('Після **w ciągu** — родовий: **w ciągu pięciu dni**.', 'После **w ciągu** — родительный: **w ciągu pięciu dni**.', 'After **w ciągu** use the genitive: **w ciągu pięciu dni**.'),
      t('Яка фраза містить помилку?', 'Какое выражение содержит ошибку?', 'Which expression contains a mistake?')),
    translate('writing.boss', t('Лист від установи прийшов у вівторок. Мені треба подати заяву протягом тридцяти днів.', 'Письмо от учреждения пришло во вторник. Мне нужно подать заявление в течение тридцати дней.', 'The letter from the office came on Tuesday. I have to file an application within thirty days.'),
      ['List od urzędu przyszedł we wtorek. Muszę złożyć wniosek w ciągu trzydziestu dni.', 'List z urzędu przyszedł we wtorek. Muszę złożyć wniosek w ciągu trzydziestu dni.', 'List od urzędu przyszedł we wtorek. Muszę złożyć wniosek w ciągu trzydziestu dni']),
    speak('speaking.boss', 'Jestem w sprawie karty pobytu i chcę złożyć wniosek w ciągu miesiąca.', t('Я у справі карти побуту й хочу подати заяву протягом місяця.', 'Я по делу карты побыта и хочу подать заявление в течение месяца.', 'I’m here about a residence card and I want to file the application within a month.')),
  ],
};
