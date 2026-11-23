/**
 * Миссия для подписчиков канала @polskigoo (2026-11-23, docs/superpowers/specs/2026-11-23-channel-mission-design.md):
 * открывается после проверки подписки ботом (services/channel.ts), остаётся открытой навсегда.
 *
 * «Тайна Твардовского» — квест-комната (pokój zagadek) в подвале у Рынка в Кракове по легенде о пане Твардовском:
 * шляхтич-чернокнижник продал душу дьяволу; тот должен был забрать его в Риме, а поймал в корчме «Rzym».
 * Три действия: ресепшен → библиотека алхимика (полки górna/środkowa/dolna, записка с «oraz», шифр, загадка, замок) →
 * поворот (неверный код, «дьявол») → финал (корчма «Rzym», выход, фото, отзыв, новая бронь).
 * Шаги — без «послушай» (озвучку генерирует только админка). Заведение вымышленное; время и коды — учебные.
 */
import type { I18n } from '@polski-go/shared';
import { t } from './builders';
import type { Mission, MissionLine, MissionOption, MissionStep } from './missions';

const npc = (pl: string, uk: string, ru: string, en: string): MissionLine => ({ who: 'npc', pl, tr: t(uk, ru, en) });
/** Реплика друга или «дьявола» — с именем говорящего (MissionLine.name). */
const say = (name: string, pl: string, uk: string, ru: string, en: string): MissionLine => ({ who: 'npc', name, pl, tr: t(uk, ru, en) });
const narr = (pl: string, uk: string, ru: string, en: string): MissionLine => ({ who: 'narrator', pl, tr: t(uk, ru, en) });
const P = (pl: string, ok = false, why?: I18n): MissionOption => ({ pl, ok, why });
const T = (text: I18n, ok = false, why?: I18n): MissionOption => ({ text, ok, why });
const ph = (pl: string, uk: string, ru: string, en: string) => ({ pl, tr: t(uk, ru, en) });
type Extra = { hint: I18n; explain: I18n; words?: string[]; tags?: string[] };
const choice = (id: string, line: MissionLine | undefined, task: I18n, options: MissionOption[], x: Extra): MissionStep => ({ id, kind: 'choice', line, task, options, ...x });
const build = (id: string, line: MissionLine | undefined, task: I18n, answer: string, extra: string[], x: Extra & { accept?: string[] }): MissionStep => ({
  id, kind: 'build', line, task, answer, extra, ...x,
});

export const CHANNEL_MISSIONS: Mission[] = [
  {
    slug: 'escape-twardowski', channel: true, category: 'road', tags: ['escape-room'], city: 'krakow', scene: 'castle',
    npc: { name: 'Pan Michał', role: t('ведучий квест-кімнати', 'ведущий квест-комнаты', 'escape room game master') },
    title: t('Таємниця Твардовського', 'Тайна Твардовского', 'Twardowski’s Secret'),
    goal: t(
      'Вийди з квест-кімнати за 60 хвилин: зрозумій правила, розгадай польські загадки й шифри, відповідай «дияволу» і встигни до кінця часу.',
      'Выберись из квест-комнаты за 60 минут: пойми правила, разгадай польские загадки и шифры, ответь «дьяволу» и успей до конца времени.',
      'Escape the room in 60 minutes: understand the rules, crack Polish riddles and ciphers, answer the “devil” and beat the clock.',
    ),
    intro: t(
      'Субота в Кракові. Ола забронювала квест-кімнату в підвалі біля Ринку — «Pracownia Twardowskiego». Троє друзів, шістдесят хвилин і всі загадки — польською.',
      'Суббота в Кракове. Ола забронировала квест-комнату в подвале у Рынка — «Pracownia Twardowskiego». Трое друзей, шестьдесят минут и все загадки — по-польски.',
      'Saturday in Kraków. Ola has booked an escape room in a cellar by the Main Square — “Pracownia Twardowskiego”. Three friends, sixty minutes, every riddle in Polish.',
    ),
    note: t(
      'Pan Twardowski — герой краківської легенди: шляхтич-чорнокнижник, який продав душу дияволу. Диявол мав забрати його в Римі, але спіймав у корчмі «Rzym»; Твардовський утік на Місяць. Pokój zagadek (escape room) — кімната, з якої виходять, розгадавши загадки. Заклад вигаданий.',
      'Pan Twardowski — герой краковской легенды: шляхтич-чернокнижник, продавший душу дьяволу. Дьявол должен был забрать его в Риме, но поймал в корчме «Rzym»; Твардовский сбежал на Луну. Pokój zagadek (escape room) — комната, из которой выходят, разгадав загадки. Заведение вымышленное.',
      'Pan Twardowski is the hero of a Kraków legend: a nobleman-sorcerer who sold his soul to the devil. The devil was to take him in Rome but caught him at an inn called “Rzym”; Twardowski escaped to the Moon. A pokój zagadek is an escape room. The venue is fictional.',
    ),
    minutes: 20, xp: 60, zlotki: 30,
    steps: [
      // ───────────── Akt I. Recepcja ─────────────
      choice('booking', npc('Dzień dobry! Witamy w „Pracowni Twardowskiego”. Na jakie nazwisko jest rezerwacja?', 'Добрий день! Вітаємо в «Майстерні Твардовського». На яке прізвище бронювання?', 'Добрый день! Добро пожаловать в «Мастерскую Твардовского». На какую фамилию бронь?', 'Hello! Welcome to “Twardowski’s Workshop”. What name is the booking under?'),
        t('Бронювала Ола Новак. Скажи, на яке прізвище бронь.', 'Бронировала Ола Новак. Скажи, на какую фамилию бронь.', 'Ola Nowak made the booking. Say whose name it’s under.'),
        [
          P('Rezerwacja jest na nazwisko Nowak.', true),
          P('Rezerwacja jest na imię Nowak.', false, t('«Imię» — ім’я (Ola). Прізвище — «nazwisko».', '«Imię» — имя (Ola). Фамилия — «nazwisko».', '«Imię» is a first name (Ola). A surname is «nazwisko».')),
          P('Rezerwacja ma nazwisko Nowak.', false, t('Кажуть «rezerwacja jest na nazwisko…» — бронь на прізвище; «ma» — має.', 'Говорят «rezerwacja jest na nazwisko…» — бронь на фамилию; «ma» — имеет.', 'The phrase is «rezerwacja jest na nazwisko…»; «ma» means “has”.')),
        ],
        { hint: t('Na nazwisko — на прізвище.', 'Na nazwisko — на фамилию.', 'Na nazwisko = under the name.'),
          explain: t('«Rezerwacja na nazwisko Nowak» — бронювання на прізвище Новак. Так кажуть у ресторані, готелі й на квесті.', '«Rezerwacja na nazwisko Nowak» — бронь на фамилию Новак. Так говорят в ресторане, отеле и на квесте.', '«Rezerwacja na nazwisko Nowak» = a booking under the name Nowak — used in restaurants, hotels, escape rooms.'), words: ['rezerwacja', 'nazwisko'] }),
      choice('time', npc('Zgadza się: sobota, godzina siedemnasta, trzy osoby. Macie sześćdziesiąt minut.', 'Усе так: субота, сімнадцята година, три особи. У вас шістдесят хвилин.', 'Всё верно: суббота, семнадцать часов, три человека. У вас шестьдесят минут.', 'That’s right: Saturday, 5 p.m., three people. You have sixty minutes.'),
        t('Скільки часу має команда?', 'Сколько времени у команды?', 'How much time does the team have?'),
        [
          T(t('60 хвилин', '60 минут', '60 minutes'), true),
          T(t('16 хвилин', '16 минут', '16 minutes'), false, t('«Sześćdziesiąt» — 60; шістнадцять — «szesnaście».', '«Sześćdziesiąt» — 60; шестнадцать — «szesnaście».', '«Sześćdziesiąt» = 60; sixteen is «szesnaście».')),
          T(t('17 хвилин', '17 минут', '17 minutes'), false, t('«Godzina siedemnasta» — це час початку (17:00), а не тривалість.', '«Godzina siedemnasta» — это время начала (17:00), а не длительность.', '«Godzina siedemnasta» is the start time (5 p.m.), not the length.')),
        ],
        { hint: t('Sześć — 6, sześćdziesiąt — 60.', 'Sześć — 6, sześćdziesiąt — 60.', 'Sześć = 6, sześćdziesiąt = 60.'),
          explain: t('Десятки на -dziesiąt: sześćdziesiąt = 60. Число на -naście — це 11–19: szesnaście = 16.', 'Десятки на -dziesiąt: sześćdziesiąt = 60. Число на -naście — это 11–19: szesnaście = 16.', 'Tens end in -dziesiąt: sześćdziesiąt = 60; -naście is 11–19: szesnaście = 16.'), words: ['minuta', 'godzina'] }),
      choice('rules', npc('Zasady są proste: telefony zostawiacie w szafce, niczego nie otwieracie siłą, a wyjście awaryjne jest zawsze otwarte.', 'Правила прості: телефони залишаєте в шафці, нічого не відкриваєте силою, а аварійний вихід завжди відчинений.', 'Правила простые: телефоны оставляете в шкафчике, ничего не открываете силой, а запасной выход всегда открыт.', 'The rules are simple: phones go in the locker, don’t force anything open, and the emergency exit is always open.'),
        t('Чого НЕ можна робити в кімнаті?', 'Чего НЕЛЬЗЯ делать в комнате?', 'What must you NOT do in the room?'),
        [
          T(t('Відкривати щось силою', 'Открывать что-то силой', 'Force anything open'), true),
          T(t('Залишати телефони в шафці', 'Оставлять телефоны в шкафчике', 'Leave phones in the locker'), false, t('Це якраз треба зробити: «telefony zostawiacie w szafce».', 'Это как раз нужно сделать: «telefony zostawiacie w szafce».', 'That’s required: «telefony zostawiacie w szafce».')),
          T(t('Виходити аварійним виходом', 'Выходить через запасной выход', 'Use the emergency exit'), false, t('«Wyjście awaryjne jest zawsze otwarte» — ним можна вийти будь-коли.', '«Wyjście awaryjne jest zawsze otwarte» — им можно выйти в любой момент.', '«Wyjście awaryjne jest zawsze otwarte» — you can always leave that way.')),
        ],
        { hint: t('Niczego nie otwieracie siłą — нічого не відкриваєте силою.', 'Niczego nie otwieracie siłą — ничего не открываете силой.', 'Niczego nie otwieracie siłą = don’t force anything open.'),
          explain: t('Siła — сила; «siłą» — силою (орудний). Після заперечення — родовий: «niczego nie otwieracie».', 'Siła — сила; «siłą» — силой (творительный). После отрицания — родительный: «niczego nie otwieracie».', 'Siła = force; «siłą» = by force. After negation, genitive: «niczego».'), words: ['szafka', 'wyjście'] }),
      choice('radio', npc('To jest krótkofalówka. Macie trzy podpowiedzi. Jeśli utkniecie, wołajcie mnie.', 'Це рація. У вас три підказки. Якщо застрягнете, кличте мене.', 'Это рация. У вас три подсказки. Если застрянете, зовите меня.', 'This is a walkie-talkie. You have three hints. If you get stuck, call me.'),
        t('Що дав ведучий і скільки в команди підказок?', 'Что дал ведущий и сколько у команды подсказок?', 'What did the host give you, and how many hints do you have?'),
        [
          T(t('Рацію; три підказки', 'Рацию; три подсказки', 'A walkie-talkie; three hints'), true),
          T(t('Ліхтарик; три підказки', 'Фонарик; три подсказки', 'A torch; three hints'), false, t('Ліхтарик — «latarka». «Krótkofalówka» — рація: через неї кличуть ведучого.', 'Фонарик — «latarka». «Krótkofalówka» — рация: через неё зовут ведущего.', 'A torch is «latarka». «Krótkofalówka» is a walkie-talkie.')),
          T(t('Рацію; тридцять підказок', 'Рацию; тридцать подсказок', 'A walkie-talkie; thirty hints'), false, t('«Trzy» — три; тридцять — «trzydzieści».', '«Trzy» — три; тридцать — «trzydzieści».', '«Trzy» = three; thirty is «trzydzieści».')),
        ],
        { hint: t('Podpowiedź — підказка; trzy podpowiedzi — три підказки.', 'Podpowiedź — подсказка; trzy podpowiedzi — три подсказки.', 'Podpowiedź = hint; trzy podpowiedzi = three hints.'),
          explain: t('«Jeśli utkniecie» — якщо застрягнете (utknąć — застрягти). «Wołajcie mnie» — кличте мене.', '«Jeśli utkniecie» — если застрянете (utknąć — застрять). «Wołajcie mnie» — зовите меня.', '«Jeśli utkniecie» = if you get stuck; «wołajcie mnie» = call me.'), words: ['podpowiedź'] }),
      build('team', npc('Ostatnie pytanie: jak nazywa się wasza drużyna?', 'Останнє питання: як називається ваша команда?', 'Последний вопрос: как называется ваша команда?', 'Last question: what’s your team called?'),
        t('Скажи: «Наша команда називається Bobry».', 'Скажи: «Наша команда называется Bobry».', 'Say: “Our team is called Bobry.”'),
        'Nasza drużyna nazywa się Bobry.', ['nazywam', 'jest'],
        { hint: t('Nazywać się — називатися: drużyna nazywa się…', 'Nazywać się — называться: drużyna nazywa się…', 'Nazywać się = to be called: drużyna nazywa się…'),
          explain: t('Про себе — «nazywam się», про команду (вона) — «nazywa się». Drużyna — команда (у грі, спорті).', 'О себе — «nazywam się», о команде (она) — «nazywa się». Drużyna — команда (в игре, спорте).', '“I am called” is «nazywam się»; the team (she) «nazywa się». Drużyna = team.'), words: ['drużyna'] }),
      choice('legend', npc('Mistrz Twardowski sprzedał duszę diabłu. Przed ucieczką ukrył w pracowni klucz. Za godzinę diabeł wraca — musicie wyjść przed nim!', 'Майстер Твардовський продав душу дияволу. Перед утечею сховав у майстерні ключ. За годину диявол повертається — ви маєте вийти раніше за нього!', 'Мастер Твардовский продал душу дьяволу. Перед побегом спрятал в мастерской ключ. Через час дьявол вернётся — вы должны выйти раньше него!', 'Master Twardowski sold his soul to the devil. Before fleeing he hid a key in the workshop. In an hour the devil returns — get out before he does!'),
        t('Яке завдання в команди?', 'Какая задача у команды?', 'What is the team’s goal?'),
        [
          T(t('Знайти ключ і вийти, поки не повернувся диявол', 'Найти ключ и выйти, пока не вернулся дьявол', 'Find the key and leave before the devil returns'), true),
          T(t('Знайти диявола за годину', 'Найти дьявола за час', 'Find the devil within an hour'), false, t('«Diabeł wraca» — диявол повертається сам; шукати треба «klucz» — ключ.', '«Diabeł wraca» — дьявол возвращается сам; искать нужно «klucz» — ключ.', '«Diabeł wraca» — the devil comes back by himself; you look for «klucz», the key.')),
          T(t('Віддати ключ дияволу', 'Отдать ключ дьяволу', 'Give the key to the devil'), false, t('«Musicie wyjść przed nim» — треба вийти раніше за нього, а не віддавати ключ.', '«Musicie wyjść przed nim» — нужно выйти раньше него, а не отдавать ключ.', '«Musicie wyjść przed nim» = you must get out before him.')),
        ],
        { hint: t('Ukrył klucz — сховав ключ; wyjść przed nim — вийти раніше за нього.', 'Ukrył klucz — спрятал ключ; wyjść przed nim — выйти раньше него.', 'Ukrył klucz = hid the key; wyjść przed nim = leave before him.'),
          explain: t('«Za godzinę» — через годину (у майбутньому). «Przed nim» — перед ним, раніше за нього.', '«Za godzinę» — через час (в будущем). «Przed nim» — перед ним, раньше него.', '«Za godzinę» = in an hour; «przed nim» = before him.'), words: ['klucz', 'diabeł', 'legenda'] }),

      // ───────────── Akt II. Biblioteka alchemika ─────────────
      choice('room', narr('Drzwi się zamykają. Pokój wygląda jak stara biblioteka: regał z trzema półkami, biurko pod oknem, skrzynia przy drzwiach i zegar nad kominkiem.', 'Двері зачиняються. Кімната схожа на стару бібліотеку: стелаж із трьома полицями, письмовий стіл під вікном, скриня біля дверей і годинник над каміном.', 'Дверь закрывается. Комната похожа на старую библиотеку: стеллаж с тремя полками, письменный стол под окном, сундук у двери и часы над камином.', 'The door shuts. The room looks like an old library: a bookcase with three shelves, a desk under the window, a chest by the door and a clock above the fireplace.'),
        t('Де стоїть письмовий стіл?', 'Где стоит письменный стол?', 'Where is the desk?'),
        [
          T(t('Під вікном', 'Под окном', 'Under the window'), true),
          T(t('Біля дверей', 'У двери', 'By the door'), false, t('Біля дверей — «skrzynia», скриня. «Biurko pod oknem» — стіл під вікном.', 'У двери — «skrzynia», сундук. «Biurko pod oknem» — стол под окном.', 'By the door is the chest («skrzynia»). «Biurko pod oknem» = desk under the window.')),
          T(t('Над каміном', 'Над камином', 'Above the fireplace'), false, t('Над каміном — годинник: «zegar nad kominkiem».', 'Над камином — часы: «zegar nad kominkiem».', 'Above the fireplace is the clock: «zegar nad kominkiem».')),
        ],
        { hint: t('Pod — під, nad — над, przy — біля.', 'Pod — под, nad — над, przy — у/возле.', 'Pod = under, nad = above, przy = by.'),
          explain: t('Pod i nad + орудний: pod oknem, nad kominkiem. Przy + місцевий: przy drzwiach.', 'Pod и nad + творительный: pod oknem, nad kominkiem. Przy + предложный: przy drzwiach.', 'Pod/nad + instrumental (pod oknem, nad kominkiem); przy + locative (przy drzwiach).'), words: ['biurko', 'okno', 'półka'] }),
      choice('note', narr('Na biurku leży kartka: „Otwórz szufladę pod oknem oraz skrzynię przy drzwiach.”', 'На столі лежить записка: «Відкрий шухляду під вікном, а також скриню біля дверей».', 'На столе лежит записка: «Открой ящик под окном, а также сундук у двери».', 'A note lies on the desk: “Open the drawer under the window as well as the chest by the door.”'),
        t('Що означає «oraz» у записці?', 'Что значит «oraz» в записке?', 'What does «oraz» mean in the note?'),
        [
          T(t('«І, а також» — треба відкрити і шухляду, і скриню', '«И, а также» — нужно открыть и ящик, и сундук', '“And, as well as” — open both the drawer and the chest'), true),
          T(t('«Або» — досить відкрити щось одне', '«Или» — достаточно открыть что-то одно', '“Or” — opening one is enough'), false, t('«Або» — «albo» чи «lub». «Oraz» нічого не дає на вибір, а додає.', '«Или» — «albo» или «lub». «Oraz» не даёт выбора, а добавляет.', '“Or” is «albo»/«lub». «Oraz» adds, it doesn’t offer a choice.')),
          T(t('«Але» — скриню не відкривати', '«Но» — сундук не открывать', '“But” — don’t open the chest'), false, t('«Але» — «ale». «Oraz» нічого не забороняє: шухляду та скриню.', '«Но» — «ale». «Oraz» ничего не запрещает: ящик и сундук.', '“But” is «ale». «Oraz» forbids nothing: drawer and chest.')),
        ],
        { hint: t('Oraz — книжне «і, а також»; у розмові частіше просто «i».', 'Oraz — книжное «и, а также»; в разговоре чаще просто «i».', 'Oraz = formal “and, as well as”; in speech people usually say «i».'),
          explain: t('«Oraz» трапляється в записках, правилах, оголошеннях і листах: «paszport oraz zdjęcie». Значить те саме, що «i».', '«Oraz» встречается в записках, правилах, объявлениях и письмах: «paszport oraz zdjęcie». Значит то же, что «i».', '«Oraz» appears in notes, rules, announcements and letters: «paszport oraz zdjęcie». Same meaning as «i».'), words: ['oraz', 'szuflada', 'skrzynia'] }),
      choice('drawer', say('Ola', 'W szufladzie jest list i lupa. W liście jest napisane: „Szukaj księgi na górnej półce.”', 'У шухляді лист і лупа. У листі написано: «Шукай книгу на верхній полиці».', 'В ящике письмо и лупа. В письме написано: «Ищи книгу на верхней полке».', 'In the drawer there’s a letter and a magnifying glass. The letter says: “Look for the book on the top shelf.”'),
        t('Ола відкрила шухляду й читає лист. Де шукати книгу?', 'Ола открыла ящик и читает письмо. Где искать книгу?', 'Ola opens the drawer and reads the letter. Where should you look for the book?'),
        [
          T(t('На верхній полиці', 'На верхней полке', 'On the top shelf'), true),
          T(t('На нижній полиці', 'На нижней полке', 'On the bottom shelf'), false, t('Нижня — «dolna». «Górna» — верхня (góra — гора, верх).', 'Нижняя — «dolna». «Górna» — верхняя (góra — гора, верх).', 'Bottom is «dolna». «Górna» = top (góra = mountain, top).')),
          T(t('На середній полиці', 'На средней полке', 'On the middle shelf'), false, t('Середня — «środkowa». «Górna» — верхня.', 'Средняя — «środkowa». «Górna» — верхняя.', 'Middle is «środkowa». «Górna» = top.')),
        ],
        { hint: t('Góra — верх → górny, górna — верхній, верхня.', 'Góra — верх → górny, górna — верхний, верхняя.', 'Góra = top → górny/górna = upper.'),
          explain: t('Górny (верхній), dolny (нижній), środkowy (середній) — прикметники: na górnej półce, na dolnej półce, na środkowej półce.', 'Górny (верхний), dolny (нижний), środkowy (средний) — прилагательные: na górnej półce, na dolnej półce, na środkowej półce.', 'Górny (upper), dolny (lower), środkowy (middle): na górnej / dolnej / środkowej półce.'), words: ['górny', 'półka', 'książka'] }),
      choice('shelf', say('Kuba', 'Jestem najwyższy, sięgnę. Która półka? Ta na dole?', 'Я найвищий, дістану. Яка полиця? Та, що внизу?', 'Я самый высокий, достану. Какая полка? Та, что внизу?', 'I’m the tallest, I’ll reach it. Which shelf? The one at the bottom?'),
        t('Куба питає. Скажи, що не на нижній, а на верхній полиці.', 'Куба спрашивает. Скажи, что не на нижней, а на верхней полке.', 'Kuba asks. Say it’s not the bottom shelf but the top one.'),
        [
          P('Nie na dolnej, tylko na górnej półce.', true),
          P('Nie na dolna, tylko na górna półka.', false, t('Після «na» (де?) — місцевий відмінок: na dolnej, na górnej półce.', 'После «na» (где?) — предложный падеж: na dolnej, na górnej półce.', 'After «na» (where?) use the locative: na dolnej, na górnej półce.')),
          P('Nie na górnej, tylko na dolnej półce.', false, t('Навпаки: у листі — «na górnej półce», на верхній.', 'Наоборот: в письме — «na górnej półce», на верхней.', 'It’s the other way round: the letter says «na górnej półce».')),
        ],
        { hint: t('Na + місцевий: półka → na półce; górna → na górnej.', 'Na + предложный: półka → na półce; górna → na górnej.', 'Na + locative: półka → na półce; górna → na górnej.'),
          explain: t('«Nie…, tylko…» — не…, а… Прикметник жіночого роду в місцевому: -ej (na dolnej, na górnej).', '«Nie…, tylko…» — не…, а… Прилагательное женского рода в предложном: -ej (na dolnej, na górnej).', '«Nie…, tylko…» = not…, but… Feminine adjectives in the locative end in -ej.'), words: ['dolny', 'górny'] }),
      choice('cipher', narr('Kuba zdejmuje grubą księgę. W środku jest kartka z szyfrem: 19 – 13 – 15 – 11. Pod spodem: A = 1, B = 2, C = 3…', 'Куба знімає товсту книгу. Усередині — аркуш із шифром: 19 – 13 – 15 – 11. Унизу: A = 1, B = 2, C = 3…', 'Куба снимает толстую книгу. Внутри — листок с шифром: 19 – 13 – 15 – 11. Внизу: A = 1, B = 2, C = 3…', 'Kuba takes down a thick book. Inside is a cipher: 19 – 13 – 15 – 11. Below: A = 1, B = 2, C = 3…'),
        t('Розшифруй слово (латинська абетка: A = 1, B = 2…).', 'Расшифруй слово (латинский алфавит: A = 1, B = 2…).', 'Decode the word (Latin alphabet: A = 1, B = 2…).'),
        [
          T(t('SMOK'), true),
          T(t('SMOG'), false, t('Остання цифра — 11, це K. G — сьома літера (7).', 'Последняя цифра — 11, это K. G — седьмая буква (7).', 'The last number is 11 = K; G is 7.')),
          T(t('SROK'), false, t('Друга цифра — 13, це M. R — 18.', 'Вторая цифра — 13, это M. R — 18.', 'The second number is 13 = M; R is 18.')),
        ],
        { hint: t('K — 11-та літера, M — 13-та, O — 15-та, S — 19-та.', 'K — 11-я буква, M — 13-я, O — 15-я, S — 19-я.', 'K is the 11th letter, M the 13th, O the 15th, S the 19th.'),
          explain: t('Smok — дракон. Smok Wawelski — ще одна краківська легенда: дракон під Вавелем.', 'Smok — дракон. Smok Wawelski — ещё одна краковская легенда: дракон под Вавелем.', 'Smok = dragon. The Wawel Dragon is another Kraków legend.'), words: ['smok'] }),
      choice('dragon', say('Ola', 'Smok! Na środkowej półce stoi figurka smoka. Coś jest pod nią!', 'Дракон! На середній полиці стоїть фігурка дракона. Під нею щось є!', 'Дракон! На средней полке стоит фигурка дракона. Под ней что-то есть!', 'A dragon! There’s a dragon figurine on the middle shelf. Something’s under it!'),
        t('Ола помітила фігурку. Де вона стоїть?', 'Ола заметила фигурку. Где она стоит?', 'Ola spots the figurine. Where is it?'),
        [
          T(t('На середній полиці', 'На средней полке', 'On the middle shelf'), true),
          T(t('На верхній полиці', 'На верхней полке', 'On the top shelf'), false, t('Верхня — «górna». «Środkowa» — середня (środek — середина).', 'Верхняя — «górna». «Środkowa» — средняя (środek — середина).', 'Top is «górna». «Środkowa» = middle (środek = centre).')),
          T(t('Під полицею', 'Под полкой', 'Under the shelf'), false, t('«Pod nią» — щось лежить під фігуркою; сама фігурка — «na środkowej półce».', '«Pod nią» — что-то лежит под фигуркой; сама фигурка — «na środkowej półce».', '«Pod nią» — something is under the figurine; the figurine is «na środkowej półce».')),
        ],
        { hint: t('Środek — середина → środkowy, środkowa — середній, середня.', 'Środek — середина → środkowy, środkowa — средний, средняя.', 'Środek = middle → środkowy/środkowa = middle.'),
          explain: t('Три полиці: górna (верхня), środkowa (середня), dolna (нижня). У місцевому: na górnej, na środkowej, na dolnej.', 'Три полки: górna (верхняя), środkowa (средняя), dolna (нижняя). В предложном: na górnej, na środkowej, na dolnej.', 'Three shelves: górna, środkowa, dolna; locative: na górnej / środkowej / dolnej.'), words: ['środkowy', 'smok'] }),
      choice('riddle', narr('Pod figurką leży mały klucz do skrzyni. W skrzyni jest szkatułka zamknięta na kłódkę z trzema cyframi oraz zagadka: „Mam wskazówki, ale nie jestem detektywem. Mam tarczę, ale nie jestem rycerzem.”', 'Під фігуркою — маленький ключ від скрині. У скрині — скринька на кодовому замку з трьома цифрами, а також загадка: «Маю стрілки (і підказки), але я не детектив. Маю циферблат (і щит), але я не лицар».', 'Под фигуркой — маленький ключ от сундука. В сундуке — шкатулка на кодовом замке с тремя цифрами, а также загадка: «У меня есть стрелки (и подсказки), но я не детектив. У меня есть циферблат (и щит), но я не рыцарь».', 'Under the figurine is a small key to the chest. Inside: a box with a three-digit padlock, and a riddle: “I have hands (and clues), but I’m no detective. I have a face (and a shield), but I’m no knight.”'),
        t('Розгадай загадку.', 'Разгадай загадку.', 'Solve the riddle.'),
        [
          P('To zegar.', true),
          P('To kominek.', false, t('У каміна немає ні «wskazówek» (стрілок), ні «tarczy» (циферблата).', 'У камина нет ни «wskazówek» (стрелок), ни «tarczy» (циферблата).', 'A fireplace has neither «wskazówki» (hands) nor a «tarcza» (face).')),
          P('To lupa.', false, t('Лупа — для детектива, але «wskazówki» й «tarcza» — стрілки й циферблат годинника.', 'Лупа — для детектива, но «wskazówki» и «tarcza» — стрелки и циферблат часов.', 'A magnifier suits a detective, but «wskazówki» and «tarcza» are a clock’s hands and face.')),
        ],
        { hint: t('Wskazówki — стрілки годинника і підказки; tarcza — циферблат і щит.', 'Wskazówki — стрелки часов и подсказки; tarcza — циферблат и щит.', 'Wskazówki = clock hands / clues; tarcza = clock face / shield.'),
          explain: t('Гра слів: «wskazówka» — і підказка, і стрілка; «tarcza» — і щит лицаря, і циферблат. Відповідь — zegar, годинник.', 'Игра слов: «wskazówka» — и подсказка, и стрелка; «tarcza» — и щит рыцаря, и циферблат. Ответ — zegar, часы.', 'Wordplay: «wskazówka» is a clue and a clock hand; «tarcza» a shield and a clock face. Answer: zegar.'), words: ['zagadka', 'kłódka', 'zegar'] }),
      choice('clock', narr('Zegar nad kominkiem stoi. Jest na nim za kwadrans trzecia.', 'Годинник над каміном стоїть. На ньому за чверть третя.', 'Часы над камином стоят. На них без четверти три.', 'The clock above the fireplace has stopped. It shows a quarter to three.'),
        t('Яку годину показує годинник?', 'Какое время показывают часы?', 'What time does the clock show?'),
        [
          T(t('2:45'), true),
          T(t('3:15'), false, t('3:15 — «kwadrans po trzeciej». «Za kwadrans trzecia» — за чверть третя, 2:45.', '3:15 — «kwadrans po trzeciej». «Za kwadrans trzecia» — без четверти три, 2:45.', '3:15 is «kwadrans po trzeciej»; «za kwadrans trzecia» = 2:45.')),
          T(t('3:45'), false, t('3:45 — «za kwadrans czwarta». Тут «trzecia» → 2:45.', '3:45 — «za kwadrans czwarta». Здесь «trzecia» → 2:45.', '3:45 is «za kwadrans czwarta»; here it’s «trzecia» → 2:45.')),
        ],
        { hint: t('Kwadrans — чверть години; za kwadrans — за чверть до…', 'Kwadrans — четверть часа; za kwadrans — без четверти…', 'Kwadrans = a quarter hour; za kwadrans = a quarter to…'),
          explain: t('«Za kwadrans trzecia» — до третьої лишилася чверть години: 2:45. «Kwadrans po trzeciej» — 3:15.', '«Za kwadrans trzecia» — до трёх осталась четверть часа: 2:45. «Kwadrans po trzeciej» — 3:15.', '«Za kwadrans trzecia» = 2:45; «kwadrans po trzeciej» = 3:15.'), words: ['zegar', 'godzina'] }),
      choice('twist', narr('Kuba od razu wpisuje kod z zegara: dwa, cztery, pięć. Kłódka piszczy. Z krótkofalówki słychać: „Błędny kod! Kłódka jest zablokowana na pięć minut.”', 'Куба одразу вводить код із годинника: два, чотири, п’ять. Замок пищить. З рації чути: «Неправильний код! Замок заблоковано на п’ять хвилин».', 'Куба сразу вводит код с часов: два, четыре, пять. Замок пищит. Из рации слышно: «Неверный код! Замок заблокирован на пять минут».', 'Kuba instantly types the code from the clock: two, four, five. The padlock beeps. The walkie-talkie crackles: “Wrong code! The padlock is locked for five minutes.”'),
        t('Що сталося?', 'Что случилось?', 'What happened?'),
        [
          T(t('Код неправильний, замок заблоковано на 5 хвилин', 'Код неверный, замок заблокирован на 5 минут', 'Wrong code — the lock is blocked for 5 minutes'), true),
          T(t('Код правильний, але треба почекати 5 хвилин', 'Код правильный, но надо подождать 5 минут', 'Right code, but you must wait 5 minutes'), false, t('«Błędny kod» — неправильний код (błąd — помилка).', '«Błędny kod» — неверный код (błąd — ошибка).', '«Błędny kod» = wrong code (błąd = mistake).')),
          T(t('Замок зламався, гра закінчилася', 'Замок сломался, игра окончена', 'The lock broke and the game is over'), false, t('«Zablokowana na pięć minut» — заблокована лише на п’ять хвилин.', '«Zablokowana na pięć minut» — заблокирован только на пять минут.', '«Zablokowana na pięć minut» = blocked for just five minutes.')),
        ],
        { hint: t('Błąd — помилка → błędny — помилковий, неправильний.', 'Błąd — ошибка → błędny — ошибочный, неверный.', 'Błąd = mistake → błędny = wrong.'),
          explain: t('«Na pięć minut» — на п’ять хвилин (на який час?). «Od razu» — одразу.', '«Na pięć minut» — на пять минут (на какое время?). «Od razu» — сразу.', '«Na pięć minut» = for five minutes; «od razu» = straight away.'), words: ['kod', 'błąd'] }),
      choice('calm', say('Ola', 'Kuba, co ty zrobiłeś?! Teraz nie zdążymy!', 'Кубо, що ти наробив?! Тепер не встигнемо!', 'Куба, что ты наделал?! Теперь не успеем!', 'Kuba, what have you done?! Now we won’t make it!'),
        t('Ола панікує. Заспокой її: «Нічого страшного, у нас ще є час».', 'Ола паникует. Успокой её: «Ничего страшного, у нас ещё есть время».', 'Ola panics. Calm her down: “It’s fine, we still have time.”'),
        [
          P('Nic się nie stało, mamy jeszcze czas.', true),
          P('Nic nie stało, mamy jeszcze czasu.', false, t('Правильно «nic się nie stało» (з «się»), а «mamy» + знахідний: czas.', 'Правильно «nic się nie stało» (с «się»), а «mamy» + винительный: czas.', 'It’s «nic się nie stało» (with «się»), and «mamy» + accusative: czas.')),
          P('Wszystko się stało, nie mamy czasu.', false, t('Це навпаки: «усе сталося, у нас немає часу» — лише налякає Олу.', 'Это наоборот: «всё случилось, у нас нет времени» — только напугает Олу.', 'That’s the opposite — “everything happened, we have no time”.')),
        ],
        { hint: t('Nic się nie stało — нічого страшного (дослівно: нічого не сталося).', 'Nic się nie stało — ничего страшного (дословно: ничего не случилось).', 'Nic się nie stało = no harm done.'),
          explain: t('«Nic się nie stało» — так заспокоюють і відповідають на «przepraszam». «Zdążyć» — встигнути: «nie zdążymy» — не встигнемо.', '«Nic się nie stało» — так успокаивают и отвечают на «przepraszam». «Zdążyć» — успеть: «nie zdążymy» — не успеем.', '«Nic się nie stało» calms people and answers «przepraszam». «Zdążyć» = to make it in time.'), words: ['czas'] }),
      choice('ask-hint', undefined,
        t('Попроси ведучого про підказку по рації — ввічливо.', 'Попроси ведущего о подсказке по рации — вежливо.', 'Politely ask the host for a hint over the walkie-talkie.'),
        [
          P('Panie Michale, czy możemy prosić o podpowiedź?', true),
          P('Pan Michał, daj podpowiedź!', false, t('До ведучого — «Panie Michale» (кличний відмінок) і ввічливо «czy możemy prosić…», а не «daj!».', 'К ведущему — «Panie Michale» (звательный падеж) и вежливо «czy możemy prosić…», а не «daj!».', 'Address him as «Panie Michale» (vocative) and ask «czy możemy prosić…», not «daj!».')),
          P('Panie Michale, czy możemy prosić podpowiedź?', false, t('Просять «o» + знахідний: prosić o podpowiedź.', 'Просят «o» + винительный: prosić o podpowiedź.', 'You ask «o» + accusative: prosić o podpowiedź.')),
        ],
        { hint: t('Prosić o coś — просити про щось; Panie Michale — пане Міхале.', 'Prosić o coś — просить о чём-то; Panie Michale — пан Михал (обращение).', 'Prosić o coś = ask for something; Panie Michale = Mr Michał (address).'),
          explain: t('Звертаючись до чоловіка, кажуть «Panie» + ім’я в кличному: Michał → Michale, Tomasz → Tomaszu.', 'Обращаясь к мужчине, говорят «Panie» + имя в звательном: Michał → Michale, Tomasz → Tomaszu.', 'Addressing a man: «Panie» + vocative name: Michał → Michale.'), words: ['podpowiedź'] }),
      choice('hint', npc('Oczywiście. Zegar to fałszywy trop! Policzcie książki na górnej, środkowej i dolnej półce — w tej kolejności.', 'Звісно. Годинник — хибний слід! Порахуйте книги на верхній, середній і нижній полиці — саме в такому порядку.', 'Конечно. Часы — ложный след! Посчитайте книги на верхней, средней и нижней полке — именно в таком порядке.', 'Of course. The clock is a red herring! Count the books on the top, middle and bottom shelf — in that order.'),
        t('Що порадив пан Михал?', 'Что посоветовал пан Михал?', 'What did Mr Michał advise?'),
        [
          T(t('Порахувати книги на кожній полиці: верхня, середня, нижня', 'Посчитать книги на каждой полке: верхняя, средняя, нижняя', 'Count the books on each shelf: top, middle, bottom'), true),
          T(t('Ще раз увести час із годинника', 'Ещё раз ввести время с часов', 'Enter the time from the clock again'), false, t('«Zegar to fałszywy trop» — годинник — хибний слід, він не допоможе.', '«Zegar to fałszywy trop» — часы — ложный след, они не помогут.', '«Zegar to fałszywy trop» — the clock is a red herring.')),
          T(t('Порахувати самі полиці', 'Посчитать сами полки', 'Count the shelves themselves'), false, t('Рахувати треба «książki» — книги на кожній полиці.', 'Считать нужно «książki» — книги на каждой полке.', 'You count «książki» — the books on each shelf.')),
        ],
        { hint: t('Fałszywy trop — хибний слід; w tej kolejności — у такому порядку.', 'Fałszywy trop — ложный след; w tej kolejności — в таком порядке.', 'Fałszywy trop = red herring; w tej kolejności = in this order.'),
          explain: t('«Policzcie» — порахуйте (policzyć). Порядок важливий: górna → środkowa → dolna.', '«Policzcie» — посчитайте (policzyć). Порядок важен: górna → środkowa → dolna.', '«Policzcie» = count (plural). Order matters: górna → środkowa → dolna.'), words: ['książka', 'górny', 'dolny'] }),
      choice('count', narr('Na górnej półce stoją cztery książki, na środkowej leży jedna (obok smoka), a na dolnej stoi siedem.', 'На верхній полиці стоять чотири книги, на середній лежить одна (біля дракона), а на нижній стоять сім.', 'На верхней полке стоят четыре книги, на средней лежит одна (рядом с драконом), а на нижней стоят семь.', 'Four books stand on the top shelf, one lies on the middle one (next to the dragon), and seven stand on the bottom one.'),
        t('Блокування скінчилося. Який код?', 'Блокировка закончилась. Какой код?', 'The lock is free again. What’s the code?'),
        [
          T(t('417'), true),
          T(t('714'), false, t('Порядок — górna → środkowa → dolna, тобто 4, 1, 7.', 'Порядок — górna → środkowa → dolna, то есть 4, 1, 7.', 'The order is górna → środkowa → dolna: 4, 1, 7.')),
          T(t('471'), false, t('На середній — одна (jedna), на нижній — сім (siedem): 4, 1, 7.', 'На средней — одна (jedna), на нижней — семь (siedem): 4, 1, 7.', 'Middle has one (jedna), bottom has seven (siedem): 4, 1, 7.')),
        ],
        { hint: t('Cztery — 4, jedna — 1, siedem — 7.', 'Cztery — 4, jedna — 1, siedem — 7.', 'Cztery = 4, jedna = 1, siedem = 7.'),
          explain: t('Верхня (górna) — 4, середня (środkowa) — 1, нижня (dolna) — 7. Код: 417.', 'Верхняя (górna) — 4, средняя (środkowa) — 1, нижняя (dolna) — 7. Код: 417.', 'Top (górna) 4, middle (środkowa) 1, bottom (dolna) 7: 417.'), words: ['środkowy', 'kłódka'] }),
      choice('devil', say('Diabeł', 'Kto śmie wchodzić do pracowni Twardowskiego?! Kim jesteście?', 'Хто сміє заходити до майстерні Твардовського?! Хто ви такі?', 'Кто смеет входить в мастерскую Твардовского?! Кто вы такие?', 'Who dares enter Twardowski’s workshop?! Who are you?'),
        t('Замок відкрився — і раптом згасло світло. Заходить хтось у чорній накидці з рогами. Відповідай від усієї команди.', 'Замок открылся — и вдруг погас свет. Входит кто-то в чёрном плаще с рогами. Ответь от всей команды.', 'The padlock opens — and the lights go out. Someone in a black cape with horns walks in. Answer for the whole team.'),
        [
          P('Jesteśmy drużyną Bobry i szukamy klucza.', true),
          P('Jesteśmy drużyna Bobry i szukamy klucz.', false, t('Після «jesteśmy» — орудний: drużyną; «szukać» + родовий: klucza.', 'После «jesteśmy» — творительный: drużyną; «szukać» + родительный: klucza.', 'After «jesteśmy» use the instrumental (drużyną); «szukać» takes the genitive (klucza).')),
          P('Jestem drużyną Bobry i szukam klucza.', false, t('Вас троє: «jesteśmy… szukamy» (ми), а не «jestem… szukam» (я).', 'Вас трое: «jesteśmy… szukamy» (мы), а не «jestem… szukam» (я).', 'There are three of you: «jesteśmy… szukamy» (we), not «jestem» (I).')),
        ],
        { hint: t('Być + орудний: jesteśmy drużyną. Szukać + родовий: szukamy klucza.', 'Być + творительный: jesteśmy drużyną. Szukać + родительный: szukamy klucza.', 'Być + instrumental; szukać + genitive.'),
          explain: t('Хто ми? — орудний: «jesteśmy drużyną». Шукати що? — родовий: «szukamy klucza».', 'Кто мы? — творительный: «jesteśmy drużyną». Искать что? — родительный: «szukamy klucza».', 'Who are we? instrumental: «jesteśmy drużyną». Looking for what? genitive: «szukamy klucza».'), words: ['drużyna', 'szukać', 'klucz'] }),
      choice('deal', say('Diabeł', 'Dam wam ostatni klucz, jeśli odpowiecie na moje pytanie. Ale uwaga: macie tylko jedną szansę!', 'Дам вам останній ключ, якщо відповісте на моє питання. Але увага: у вас лише один шанс!', 'Дам вам последний ключ, если ответите на мой вопрос. Но внимание: у вас только один шанс!', 'I’ll give you the last key if you answer my question. But careful: you only get one chance!'),
        t('Яка умова «диявола»?', 'Какое условие у «дьявола»?', 'What is the “devil’s” condition?'),
        [
          T(t('Ключ — за правильну відповідь, спроба лише одна', 'Ключ — за правильный ответ, попытка только одна', 'The key for a right answer — only one try'), true),
          T(t('Ключ — за гроші', 'Ключ — за деньги', 'The key for money'), false, t('«Jeśli odpowiecie na moje pytanie» — якщо відповісте на питання; про гроші ні слова.', '«Jeśli odpowiecie na moje pytanie» — если ответите на вопрос; о деньгах ни слова.', '«Jeśli odpowiecie na moje pytanie» — nothing about money.')),
          T(t('Ключ — за три спроби', 'Ключ — за три попытки', 'The key — three tries'), false, t('«Tylko jedną szansę» — лише один шанс.', '«Tylko jedną szansę» — только один шанс.', '«Tylko jedną szansę» = only one chance.')),
        ],
        { hint: t('Jeśli — якщо; odpowiedzieć na pytanie — відповісти на питання.', 'Jeśli — если; odpowiedzieć na pytanie — ответить на вопрос.', 'Jeśli = if; odpowiedzieć na pytanie = answer a question.'),
          explain: t('Відповідають «na pytanie» — на питання (na + знахідний). «Uwaga!» — увага!', 'Отвечают «na pytanie» — на вопрос (na + винительный). «Uwaga!» — внимание!', 'You answer «na pytanie» (na + accusative). «Uwaga!» = careful!'), words: ['szansa', 'klucz'] }),
      choice('question', say('Diabeł', 'Miałem zabrać Twardowskiego w Rzymie. Gdzie go w końcu złapałem?', 'Я мав забрати Твардовського в Римі. Де ж я його зрештою спіймав?', 'Я должен был забрать Твардовского в Риме. Где же я его в конце концов поймал?', 'I was supposed to take Twardowski in Rome. Where did I finally catch him?'),
        t('Ола шепоче: «У легенді була корчма…» Відповідай.', 'Ола шепчет: «В легенде была корчма…» Ответь.', 'Ola whispers: “In the legend there was an inn…” Answer.'),
        [
          P('W karczmie, która nazywała się „Rzym”.', true),
          P('W Rzymie, we Włoszech.', false, t('Пастка! Диявол мав забрати його в Римі, а спіймав у корчмі під назвою «Rzym».', 'Ловушка! Дьявол должен был забрать его в Риме, а поймал в корчме под названием «Rzym».', 'A trap! He was meant to be taken in Rome but was caught at an inn called «Rzym».')),
          P('Na Księżycu.', false, t('На Місяць Твардовський утік — саме там диявол його й не спіймав.', 'На Луну Твардовский сбежал — именно там дьявол его и не поймал.', 'Twardowski escaped to the Moon — that’s where the devil did NOT catch him.')),
        ],
        { hint: t('Karczma — корчма, заїзд; Rzym — Рим.', 'Karczma — корчма, постоялый двор; Rzym — Рим.', 'Karczma = inn; Rzym = Rome.'),
          explain: t('У легенді Твардовський уникав Риму, але зайшов до корчми, що називалася «Rzym», — там диявол його й схопив.', 'В легенде Твардовский избегал Рима, но зашёл в корчму, которая называлась «Rzym», — там дьявол его и схватил.', 'In the legend Twardowski avoided Rome but entered an inn named «Rzym» — and the devil grabbed him there.'), words: ['karczma'] }),
      choice('moon', say('Diabeł', 'Grrr… Zgadza się. Ale Twardowski i tak uciekł mi na Księżyc! Bierzcie klucz i znikajcie!', 'Гррр… Правильно. Але Твардовський однаково втік від мене на Місяць! Беріть ключ і зникайте!', 'Гррр… Верно. Но Твардовский всё равно сбежал от меня на Луну! Берите ключ и исчезайте!', 'Grrr… Correct. But Twardowski still escaped from me to the Moon! Take the key and vanish!'),
        t('Куди, за легендою, утік Твардовський?', 'Куда, по легенде, сбежал Твардовский?', 'Where, according to the legend, did Twardowski escape to?'),
        [
          T(t('На Місяць', 'На Луну', 'To the Moon'), true),
          T(t('До Риму', 'В Рим', 'To Rome'), false, t('«Rzym» — це назва корчми. Утік він «na Księżyc» — на Місяць.', '«Rzym» — это название корчмы. Сбежал он «na Księżyc» — на Луну.', '«Rzym» is the inn’s name. He fled «na Księżyc» — to the Moon.')),
          T(t('У гори', 'В горы', 'To the mountains'), false, t('Гори — «góry». «Księżyc» — Місяць.', 'Горы — «góry». «Księżyc» — Луна.', 'Mountains are «góry». «Księżyc» = the Moon.')),
        ],
        { hint: t('Księżyc — Місяць (на небі).', 'Księżyc — Луна.', 'Księżyc = the Moon.'),
          explain: t('Кажуть, у повний місяць на ньому видно Твардовського. «Znikajcie!» — зникайте!', 'Говорят, в полнолуние на ней видно Твардовского. «Znikajcie!» — исчезайте!', 'They say you can see Twardowski on the full Moon. «Znikajcie!» = vanish!'), words: ['księżyc'] }),

      // ───────────── Akt III. Wyjście ─────────────
      choice('escape', npc('Gratulacje! Wyszliście dwie minuty przed końcem. To świetny wynik!', 'Вітаю! Ви вийшли за дві хвилини до кінця. Це чудовий результат!', 'Поздравляю! Вы вышли за две минуты до конца. Это отличный результат!', 'Congratulations! You got out two minutes before the end. That’s a great result!'),
        t('Коли команда вийшла?', 'Когда команда вышла?', 'When did the team get out?'),
        [
          T(t('За 2 хвилини до кінця', 'За 2 минуты до конца', '2 minutes before the end'), true),
          T(t('Через 2 хвилини після кінця', 'Через 2 минуты после конца', '2 minutes after the end'), false, t('«Przed końcem» — до кінця; після — «po końcu».', '«Przed końcem» — до конца; после — «po końcu».', '«Przed końcem» = before the end; after is «po końcu».')),
          T(t('За 12 хвилин до кінця', 'За 12 минут до конца', '12 minutes before the end'), false, t('«Dwie minuty» — дві хвилини; дванадцять — «dwanaście».', '«Dwie minuty» — две минуты; двенадцать — «dwanaście».', '«Dwie minuty» = two minutes; twelve is «dwanaście».')),
        ],
        { hint: t('Przed końcem — до кінця; wynik — результат.', 'Przed końcem — до конца; wynik — результат.', 'Przed końcem = before the end; wynik = result.'),
          explain: t('«Przed» + орудний: przed końcem. «Dwie minuty» — після 2, 3, 4 хвилини — «minuty».', '«Przed» + творительный: przed końcem. «Dwie minuty» — после 2, 3, 4 минуты — «minuty».', '«Przed» + instrumental: przed końcem. After 2–4: «minuty».'), words: ['minuta'] }),
      build('photo', npc('Zrobić wam pamiątkowe zdjęcie z tabliczką „Uciekliśmy!”?', 'Зробити вам фото на пам’ять із табличкою «Ми втекли!»?', 'Сделать вам фото на память с табличкой «Мы сбежали!»?', 'Shall I take a souvenir photo of you with the “We escaped!” sign?'),
        t('Скажи: «Так, будь ласка, фото з табличкою».', 'Скажи: «Да, пожалуйста, фото с табличкой».', 'Say: “Yes, please — a photo with the sign.”'),
        'Tak, poproszę zdjęcie z tabliczką.', ['tabliczka', 'zdjęcia'],
        { hint: t('Poproszę + знахідний: zdjęcie. Z + орудний: z tabliczką.', 'Poproszę + винительный: zdjęcie. Z + творительный: z tabliczką.', 'Poproszę + accusative; z + instrumental: z tabliczką.'),
          explain: t('Tabliczka → z tabliczką (орудний). Zdjęcie в знахідному не змінюється: poproszę zdjęcie.', 'Tabliczka → z tabliczką (творительный). Zdjęcie в винительном не меняется: poproszę zdjęcie.', 'Tabliczka → z tabliczką (instrumental); zdjęcie stays the same in the accusative.'), words: ['zdjęcie'] }),
      choice('review', npc('Będzie nam bardzo miło, jeśli zostawicie opinię w internecie.', 'Нам буде дуже приємно, якщо залишите відгук в інтернеті.', 'Нам будет очень приятно, если вы оставите отзыв в интернете.', 'We’d be really happy if you left a review online.'),
        t('Про що просить ведучий?', 'О чём просит ведущий?', 'What does the host ask for?'),
        [
          T(t('Залишити відгук в інтернеті', 'Оставить отзыв в интернете', 'Leave a review online'), true),
          T(t('Залишити речі в шафці', 'Оставить вещи в шкафчике', 'Leave your things in the locker'), false, t('«Opinia» — відгук. Шафка була на початку гри.', '«Opinia» — отзыв. Шкафчик был в начале игры.', '«Opinia» = review. The locker was at the start.')),
          T(t('Прийти завтра ще раз', 'Прийти завтра ещё раз', 'Come back tomorrow'), false, t('Про наступний візит не йшлося: «zostawić opinię» — залишити відгук.', 'О следующем визите речи не было: «zostawić opinię» — оставить отзыв.', 'Nothing about a next visit: «zostawić opinię» = leave a review.')),
        ],
        { hint: t('Opinia — відгук, думка; zostawić — залишити.', 'Opinia — отзыв, мнение; zostawić — оставить.', 'Opinia = review, opinion; zostawić = leave.'),
          explain: t('«Zostawić opinię» — залишити відгук (opinia → opinię, знахідний). «Będzie nam miło» — нам буде приємно.', '«Zostawić opinię» — оставить отзыв (opinia → opinię, винительный). «Będzie nam miło» — нам будет приятно.', '«Zostawić opinię» = leave a review; «będzie nam miło» = we’d be glad.'), words: ['opinia'] }),
      build('opinion', undefined,
        t('Напиши короткий відгук: «Чудові загадки, а також приємний ведучий!»', 'Напиши короткий отзыв: «Отличные загадки, а также приятный ведущий!»', 'Write a short review: “Great riddles as well as a nice host!”'),
        'Świetne zagadki oraz miły prowadzący!', ['ale', 'miłe'],
        { hint: t('У письмовому відгуку «і» часто пишуть як «oraz».', 'В письменном отзыве «и» часто пишут как «oraz».', 'In a written review “and” is often «oraz».'),
          explain: t('Zagadki — множина, тому «świetne»; prowadzący — він, тому «miły». «Oraz» — книжне «і».', 'Zagadki — множественное число, поэтому «świetne»; prowadzący — он, поэтому «miły». «Oraz» — книжное «и».', 'Zagadki is plural → «świetne»; prowadzący is masculine → «miły». «Oraz» = formal “and”.'), words: ['zagadka', 'oraz'] }),
      choice('next', npc('Mamy jeszcze pokój „Smok Wawelski” na dolnym poziomie. Zarezerwować wam termin?', 'У нас є ще кімната «Вавельський дракон» на нижньому рівні. Забронювати вам час?', 'У нас есть ещё комната «Вавельский дракон» на нижнем уровне. Забронировать вам время?', 'We also have the “Wawel Dragon” room on the lower level. Shall I book you a slot?'),
        t('Забронюй на наступну суботу, на ту саму годину.', 'Забронируй на следующую субботу, на то же время.', 'Book for next Saturday at the same time.'),
        [
          P('Tak, poproszę na przyszłą sobotę, na tę samą godzinę.', true),
          P('Tak, poproszę na przyszła sobota, na ta sama godzina.', false, t('Na + знахідний: na przyszłą sobotę, na tę samą godzinę.', 'Na + винительный: na przyszłą sobotę, na tę samą godzinę.', 'Na + accusative: na przyszłą sobotę, na tę samą godzinę.')),
          P('Tak, poproszę na zeszłą sobotę, na tę samą godzinę.', false, t('«Zeszła sobota» — минула субота. Бронюють наперед: «przyszłą».', '«Zeszła sobota» — прошлая суббота. Бронируют наперёд: «przyszłą».', '«Zeszła sobota» = last Saturday. You book ahead: «przyszłą».')),
        ],
        { hint: t('Przyszły — наступний; zeszły — минулий.', 'Przyszły — следующий; zeszły — прошлый.', 'Przyszły = next; zeszły = last.'),
          explain: t('«Na dolnym poziomie» — на нижньому рівні (dolny). Na + знахідний — на який день: na przyszłą sobotę.', '«Na dolnym poziomie» — на нижнем уровне (dolny). Na + винительный — на какой день: na przyszłą sobotę.', '«Na dolnym poziomie» = on the lower level (dolny). Na + accusative for the day booked.'), words: ['przyszły', 'sobota', 'dolny'] }),
      choice('cafe', say('Ola', 'Najlepsza była zagadka z zegarem! A tobie co się najbardziej podobało?', 'Найкраща була загадка з годинником! А тобі що найбільше сподобалося?', 'Лучшей была загадка с часами! А тебе что больше всего понравилось?', 'The clock riddle was the best! What did you like most?'),
        t('Увечері друзі в кав’ярні на Ринку. Відповідай Олі: найбільше сподобався диявол.', 'Вечером друзья в кафе на Рынке. Ответь Оле: больше всего понравился дьявол.', 'That evening the friends are in a café on the Main Square. Tell Ola you liked the devil most.'),
        [
          P('Mnie najbardziej podobał się diabeł!', true),
          P('Ja najbardziej podobałem się diabeł!', false, t('«Podobać się» — як «подобатися»: «mnie podobał się…», а не «ja».', '«Podobać się» — как «нравиться»: «mnie podobał się…», а не «ja».', '«Podobać się» works like “to please”: «mnie podobał się…», not «ja».')),
          P('Mnie najbardziej podobała się diabeł!', false, t('Diabeł — він, тож «podobał się».', 'Diabeł — он, поэтому «podobał się».', 'Diabeł is masculine → «podobał się».')),
        ],
        { hint: t('Mnie się podoba — мені подобається.', 'Mnie się podoba — мне нравится.', 'Mnie się podoba = I like it.'),
          explain: t('Хто сподобався — підмет: diabeł (він) → podobał się; zagadka (вона) → podobała się. Кому — «mnie», «tobie».', 'Кто понравился — подлежащее: diabeł (он) → podobał się; zagadka (она) → podobała się. Кому — «mnie», «tobie».', 'The liked thing is the subject: diabeł → podobał się; zagadka → podobała się. To whom: «mnie», «tobie».'), words: ['podobać się', 'diabeł'] }),
    ],
    phrases: [
      ph('Rezerwacja jest na nazwisko Nowak.', 'Бронювання на прізвище Новак.', 'Бронь на фамилию Новак.', 'The booking is under the name Nowak.'),
      ph('Czy możemy prosić o podpowiedź?', 'Чи можемо попросити підказку?', 'Можно попросить подсказку?', 'Could we have a hint?'),
      ph('Nie na dolnej, tylko na górnej półce.', 'Не на нижній, а на верхній полиці.', 'Не на нижней, а на верхней полке.', 'Not on the bottom shelf, but on the top one.'),
      ph('Otwórz szufladę oraz skrzynię.', 'Відкрий шухляду, а також скриню.', 'Открой ящик, а также сундук.', 'Open the drawer as well as the chest.'),
      ph('Nic się nie stało, mamy jeszcze czas.', 'Нічого страшного, у нас ще є час.', 'Ничего страшного, у нас ещё есть время.', 'No harm done, we still have time.'),
      ph('Zegar to fałszywy trop.', 'Годинник — хибний слід.', 'Часы — ложный след.', 'The clock is a red herring.'),
    ],
  },
];
