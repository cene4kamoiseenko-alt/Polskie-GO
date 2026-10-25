/**
 * Варшава 4.0: додаткові завдання до перших уроків (дописуються в кінець — старі завдання та їхній порядок
 * не змінюються, тож ID у вже засіяній БД стабільні), фінальна місія локації «Перше знайомство»
 * і розширення іспиту міста матеріалом усіх шести локацій.
 */
import {
  t, wordChoice, pictureChoice, reverseChoice, fillGap, listen, findError, oddOne, reading,
  translate, dictation, build, wordOrder, match, speak, dialogue,
} from './builders';
import type { LessonSeed } from './types';

const ANIA = { name: 'Ania', emoji: '👩🏼', role: t('студентка з Варшави', 'студентка из Варшавы', 'a student from Warsaw') };
const ZENON = { name: 'Pan Zenon', emoji: '👴🏻', role: t('сусід, літній пан', 'сосед, пожилой пан', 'an elderly neighbour') };
const INFO = { name: 'Pani z informacji', emoji: '👩🏻‍💼', role: t('довідка на вокзалі', 'справочная на вокзале', 'station information desk') };
const TURYSTA = { name: 'Turysta', emoji: '🧔🏻', role: t('турист із мапою', 'турист с картой', 'a tourist with a map') };

// ───────────── waw-1-czesc: +7 ─────────────
export const WAW1_MORE = [
  reading('reading.greetings', 'Wiadomość od Ani: „Cześć! Co słychać? Do zobaczenia jutro na uczelni. Na razie!”',
    t('Коли Аня хоче зустрітися?', 'Когда Аня хочет встретиться?', 'When does Ania want to meet?'),
    [t('Завтра', 'Завтра', 'Tomorrow'), t('Сьогодні ввечері', 'Сегодня вечером', 'This evening'), t('У неділю', 'В воскресенье', 'On Sunday')],
    t('**Do zobaczenia jutro** — до зустрічі завтра.', '**Do zobaczenia jutro** — до встречи завтра.', '**Do zobaczenia jutro** — see you tomorrow.')),
  fillGap('usage.formality', 'O 20:00 w hotelu: „___, mam rezerwację.”', ['Dobry wieczór', 'Dobranoc', 'Cześć'],
    t('О 20:00 у готелі: «Добрий вечір, у мене бронювання.»', 'В 20:00 в отеле: «Добрый вечер, у меня бронь.»', 'At 8 pm in a hotel: "Good evening, I have a booking."'),
    t('Увечері з незнайомими — **Dobry wieczór**. **Dobranoc** кажуть лише перед сном.', 'Вечером с незнакомыми — **Dobry wieczór**. **Dobranoc** говорят только перед сном.', 'In the evening with strangers say **Dobry wieczór**. **Dobranoc** is only for bedtime.')),
  wordChoice('vocab.greetings', 'Do zobaczenia', [t('До зустрічі', 'До встречи', 'See you'), t('Добрий вечір', 'Добрый вечер', 'Good evening'), t('Будь ласка', 'Пожалуйста', 'Please')]),
  listen('listening.greetings', 'Cześć, co słychać?', ['Cześć, co słychać?', 'Cześć, co to jest?', 'Dzień dobry, co słychać?']),
  build('grammar.greetings', 'Dzień dobry, pani Ewo', t('Добрий день, пані Єво', 'Добрый день, пани Ева', 'Good morning, Mrs Ewa'), ['cześć', 'pan'], [],
    t('До старших і незнайомих — **pan / pani** + ім\'я в кличному відмінку: Ewa → **pani Ewo**.', 'К старшим и незнакомым — **pan / pani** + имя в звательном падеже: Ewa → **pani Ewo**.', 'To older people and strangers use **pan / pani** + vocative: Ewa → **pani Ewo**.')),
  translate('writing.greetings', t('Привіт, до зустрічі!', 'Привет, до встречи!', 'Hi, see you!'), ['Cześć, do zobaczenia', 'Hej, do zobaczenia']),
  dialogue('situation.neighbour-hello', ZENON, [
    { npc: 'Dzień dobry!', tr: t('Добрий день!', 'Добрый день!', 'Good morning!'),
      choose: [['Dzień dobry, panie Zenonie!', t('Добрий день, пане Зеноне!', 'Добрый день, пан Зенон!', 'Good morning, Mr Zenon!')], ['Cześć, stary!', t('Привіт, старий!', 'Привет, старик!', 'Hey, old man!')]],
      feedback: t('Зі старшим сусідом — формально: **Dzień dobry** + **pan** (panie Zenonie).', 'Со старшим соседом — формально: **Dzień dobry** + **pan** (panie Zenonie).', 'With an older neighbour be formal: **Dzień dobry** + **pan** (panie Zenonie).') },
    { npc: 'Do widzenia, miłego dnia!', tr: t('До побачення, гарного дня!', 'До свидания, хорошего дня!', 'Goodbye, have a nice day!'),
      choose: [['Do widzenia, nawzajem!', t('До побачення, навзаєм!', 'До свидания, и вам!', 'Goodbye, you too!')], ['Dobranoc, smacznego!', t('На добраніч, смачного!', 'Спокойной ночи, приятного аппетита!', 'Good night, enjoy your meal!')]],
      feedback: t('На побажання відповідають **nawzajem** — навзаєм.', 'На пожелание отвечают **nawzajem** — и вам того же.', 'Reply to a wish with **nawzajem** — you too.') },
  ], { situation: true, scene: t('Ранок. На сходах зустрічаєш літнього сусіда пана Зенона.', 'Утро. На лестнице встречаешь пожилого соседа пана Зенона.', 'Morning. You meet your elderly neighbour Mr Zenon on the stairs.') }),
];

// ───────────── waw-2-uprzejmosc: +7 ─────────────
export const WAW2_MORE = [
  wordChoice('vocab.politeness', 'Nie wiem', [t('Не знаю', 'Не знаю', 'I don\'t know'), t('Не розумію', 'Не понимаю', 'I don\'t understand'), t('Не хочу', 'Не хочу', 'I don\'t want')]),
  reverseChoice('vocab.politeness', t('Говоріть, будь ласка, повільніше.', 'Говорите, пожалуйста, медленнее.', 'Please speak more slowly.'), ['Proszę mówić wolniej.', 'Proszę mówić głośno.', 'Proszę nie mówić.']),
  fillGap('usage.politeness', 'Przepraszam, czy może pan ___?', ['powtórzyć', 'powtarzam', 'powtórzę'], t('Перепрошую, можете повторити?', 'Извините, можете повторить?', 'Sorry, could you repeat?'),
    t('Після **może pan** — інфінітив: **powtórzyć**.', 'После **może pan** — инфинитив: **powtórzyć**.', 'After **może pan** use the infinitive: **powtórzyć**.')),
  listen('listening.politeness', 'Proszę mówić wolniej', ['Proszę mówić wolniej', 'Proszę mówić głośniej', 'Proszę iść wolniej']),
  oddOne('vocab.politeness', ['proszę', 'dziękuję', 'przepraszam', 'pomidor'], 3,
    t('Три — «чарівні слова», а **pomidor** — помідор.', 'Три — «волшебные слова», а **pomidor** — помидор.', 'Three are "magic words"; **pomidor** is a tomato.'), t("Що НЕ є ввічливим словом для прохання, подяки чи вибачення?", "Что НЕ является словом просьбы, благодарности или извинения?", "Which is NOT an expression for a request, thanks or an apology?")),
  dialogue('situation.info-fast', INFO, [
    { npc: 'Pociąg do Gdańska odjeżdża z peronu czwartego, przy torze dwunastym.', tr: t('Потяг до Гданська відправляється з четвертої платформи, колія дванадцята.', 'Поезд до Гданьска отправляется с четвёртой платформы, путь двенадцатый.', 'The train to Gdańsk leaves from platform four, track twelve.'),
      choose: [['Przepraszam, nie rozumiem. Proszę mówić wolniej.', t('Вибачте, не розумію. Говоріть повільніше.', 'Извините, не понимаю. Говорите медленнее.', 'Sorry, I don\'t understand. Please speak more slowly.')], ['Dziękuję, dobranoc!', t('Дякую, на добраніч!', 'Спасибо, спокойной ночи!', 'Thanks, good night!')]],
      feedback: t('Щось незрозуміло? Так і скажи: **Nie rozumiem. Proszę mówić wolniej.**', 'Что-то непонятно? Так и скажи: **Nie rozumiem. Proszę mówić wolniej.**', 'Didn\'t get it? Say so: **Nie rozumiem. Proszę mówić wolniej.**') },
    { npc: 'Peron cztery. Tor dwanaście.', tr: t('Платформа чотири. Колія дванадцять.', 'Платформа четыре. Путь двенадцать.', 'Platform four. Track twelve.'),
      choose: [['Dziękuję bardzo!', t('Дуже дякую!', 'Большое спасибо!', 'Thank you very much!')], ['Nie ma za co.', t('Нема за що.', 'Не за что.', 'You\'re welcome.')]],
      feedback: t('Тобі допомогли — подякуй. **Nie ma za co** відповідають на «дякую».', 'Тебе помогли — поблагодари. **Nie ma za co** отвечают на «спасибо».', 'You were helped — say thanks. **Nie ma za co** is the reply to thanks.') },
    { npc: 'Proszę bardzo. Szczęśliwej podróży!', tr: t('Прошу. Щасливої дороги!', 'Пожалуйста. Счастливого пути!', 'You\'re welcome. Have a good trip!') },
  ], { situation: true, scene: t('Довідка на вокзалі. Працівниця говорить дуже швидко.', 'Справочная на вокзале. Сотрудница говорит очень быстро.', 'The station information desk. The clerk speaks very fast.') }),
  dictation('writing.politeness', 'Nie ma za co', t('Нема за що', 'Не за что', 'You\'re welcome')),
];

// ───────────── waw-3-imie: +7 ─────────────
export const WAW3_MORE = [
  wordChoice('vocab.intro', 'Jak się pan nazywa?', [t('Як вас звати? (до чоловіка)', 'Как вас зовут? (к мужчине)', 'What is your name? (to a man)'), t('Як ваші справи?', 'Как ваши дела?', 'How are you?'), t('Звідки ви?', 'Откуда вы?', 'Where are you from?')]),
  fillGap('grammar.intro', '— Jak masz na imię? — ___ Oksana.', ['Jestem', 'Jest', 'Jesteś'], t('— Як тебе звати? — Я Оксана.', '— Как тебя зовут? — Я Оксана.', '— What\'s your name? — I\'m Oksana.'),
    t('Про себе: **jestem** (я є).', 'О себе: **jestem** (я есть).', 'About yourself: **jestem** (I am).')),
  reading('reading.form', 'FORMULARZ · Imię: Taras · Nazwisko: Kowalenko · Kraj: Ukraina · Miasto: Warszawa',
    t('Яке прізвище в Тараса?', 'Какая фамилия у Тараса?', 'What is Taras\'s surname?'), ['Kowalenko', 'Taras', 'Warszawa'],
    t('**Nazwisko** — прізвище, **imię** — ім\'я.', '**Nazwisko** — фамилия, **imię** — имя.', '**Nazwisko** is the surname, **imię** the first name.')),
  match('vocab.intro', [
    ['imię', t('ім\'я', 'имя', 'first name')],
    ['nazwisko', t('прізвище', 'фамилия', 'surname')],
    ['miło mi', t('приємно', 'приятно', 'nice to meet you')],
    ['dobrze', t('добре', 'хорошо', 'fine')],
  ]),
  listen('listening.intro', 'Nazywam się Nowak, Anna Nowak', ['Nazywam się Nowak, Anna Nowak', 'Nazywam się Nowak, Hanna Nowak', 'Mam na imię Anna, Anna Nowak']),
  findError('writing.diacritics', ['Mam', 'na', 'imie', 'Taras'], 2, t('Мене звати Тарас.', 'Меня зовут Тарас.', 'My name is Taras.'),
    t('Пиши з літерою **ę**: **imię**. Без неї слово читається неправильно.', 'Пиши с буквой **ę**: **imię**. Без неё слово читается неправильно.', 'Write it with **ę**: **imię**.')),
  wordOrder('grammar.intro', 'Jak masz na imię', t('Як тебе звати?', 'Как тебя зовут?', 'What\'s your name?')),
];

// ───────────── waw-4-skad: +7 ─────────────
export const WAW4_MORE = [
  wordChoice('vocab.origin', 'po ukraińsku', [t('українською', 'по-украински', 'in Ukrainian'), t('у Польщі', 'в Польше', 'in Poland'), t('з України', 'из Украины', 'from Ukraine')]),
  fillGap('grammar.origin', 'Pochodzę ___ Charkowa.', ['z', 'w', 'na'], t('Я родом з Харкова.', 'Я родом из Харькова.', 'I come from Kharkiv.'),
    t('**pochodzić z** + родовий: z Charkowa.', '**pochodzić z** + родительный: z Charkowa.', '**pochodzić z** + genitive: z Charkowa.')),
  reverseChoice('vocab.origin', t('Я говорю англійською.', 'Я говорю по-английски.', 'I speak English.'), ['Mówię po angielsku.', 'Mówię w angielsku.', 'Mówię angielskim.'],
    t('Мова — **po** + **-sku**: po angielsku, po polsku, po ukraińsku.', 'Язык — **po** + **-sku**: po angielsku, po polsku, po ukraińsku.', 'Languages: **po** + **-sku**: po angielsku, po polsku.')),
  listen('listening.origin', 'Jestem z Ukrainy, z Kijowa', ['Jestem z Ukrainy, z Kijowa', 'Jestem z Ukrainy, z Kowla', 'Jestem z Polski, z Kijowa']),
  dialogue('dialogue.origin', ANIA, [
    { npc: 'Mówisz po polsku?', tr: t('Ти говориш польською?', 'Ты говоришь по-польски?', 'Do you speak Polish?'),
      choose: [['Trochę. Ale dobrze mówię po angielsku.', t('Трохи. Але добре говорю англійською.', 'Немного. Но хорошо говорю по-английски.', 'A little. But I speak English well.')], ['Mam na imię Taras.', t('Мене звати Тарас.', 'Меня зовут Тарас.', 'My name is Taras.')]],
      feedback: t('Ania питає про мову. Відповідай: **Trochę…**', 'Аня спрашивает о языке. Отвечай: **Trochę…**', 'Ania asks about languages. Answer: **Trochę…**') },
    { npc: 'Super! A skąd jesteś?', tr: t('Супер! А звідки ти?', 'Супер! А откуда ты?', 'Great! Where are you from?'),
      choose: [['Jestem z Ukrainy, ze Lwowa.', t('Я з України, зі Львова.', 'Я из Украины, из Львова.', 'I\'m from Ukraine, from Lviv.')], ['Jestem w Warszawie.', t('Я у Варшаві.', 'Я в Варшаве.', 'I\'m in Warsaw.')]],
      feedback: t('**Skąd?** → **z** + родовий: **ze Lwowa**.', '**Skąd?** → **z** + родительный: **ze Lwowa**.', '**Skąd?** → **z** + genitive: **ze Lwowa**.') },
    { npc: 'Lwów jest piękny! Witaj w Warszawie!', tr: t('Львів гарний! Ласкаво просимо до Варшави!', 'Львов красивый! Добро пожаловать в Варшаву!', 'Lviv is beautiful! Welcome to Warsaw!') },
  ]),
  oddOne('vocab.origin', ['po polsku', 'po angielsku', 'po ukraińsku', 'po południu'], 3,
    t('Три — мови, а **po południu** — після обіду.', 'Три — языки, а **po południu** — после обеда.', 'Three are languages; **po południu** means in the afternoon.'), t("Який вираз означає час, а не мову?", "Какое выражение обозначает время, а не язык?", "Which expression refers to time rather than a language?")),
  wordOrder('grammar.origin', 'Mówię po angielsku i trochę po polsku', t('Я говорю англійською і трохи польською.', 'Я говорю по-английски и немного по-польски.', 'I speak English and a little Polish.')),
];

// ───────────── Місія локації «Перше знайомство» ─────────────
export const WAW_P5_MISJA: LessonSeed = {
  slug: 'waw-p5-misja',
  title: t('Місія: перша зустріч у Варшаві', 'Миссия: первая встреча в Варшаве', 'Mission: first meeting in Warsaw'),
  topic: t('Фінальна місія локації «Перше знайомство»', 'Финальная миссия локации «Первое знакомство»', 'Final mission of "First meeting"'),
  cefr: 'A0',
  difficulty: 3,
  explanation: t(
    'Фінальна місія першої локації. Перший день у Варшаві: зустріч з Анею — партнеркою з мовного обміну.\nЗнадобиться: привітання й прощання, **Miło mi**, **Skąd jesteś? — Jestem z…**, **Nie rozumiem / Proszę mówić wolniej**, **Do zobaczenia**.\nЩоб пройти місію, потрібно щонайменше 70% правильних відповідей.',
    'Финальная миссия первой локации. Первый день в Варшаве: встреча с Аней — партнёром по языковому обмену.\nПригодится: приветствия и прощания, **Miło mi**, **Skąd jesteś? — Jestem z…**, **Nie rozumiem / Proszę mówić wolniej**, **Do zobaczenia**.\nЧтобы пройти миссию, нужно не меньше 70% правильных ответов.',
    'The final mission of the first location. You have just arrived in Warsaw and meet Ania, your language-exchange partner.\nYou will need greetings and goodbyes, **Miło mi**, **Skąd jesteś? — Jestem z…**, **Nie rozumiem / Proszę mówić wolniej**, **Do zobaczenia**.\nYou need at least 70% correct answers to pass.',
  ),
  examples: [{ pl: 'Cześć, miło mi! Jestem z Ukrainy i mówię trochę po polsku.', tr: t('Привіт, приємно! Я з України й трохи говорю польською.', 'Привет, приятно! Я из Украины и немного говорю по-польски.', 'Hi, nice to meet you! I\'m from Ukraine and I speak a little Polish.') }],
  words: [],
  exercises: [
    match('vocab.greetings', [
      ['cześć', t('привіт', 'привет', 'hi')],
      ['do zobaczenia', t('до зустрічі', 'до встречи', 'see you')],
      ['przepraszam', t('вибачте', 'извините', 'sorry')],
      ['nie rozumiem', t('не розумію', 'не понимаю', 'I don\'t understand')],
      ['miło mi', t('приємно', 'приятно', 'nice to meet you')],
    ]),
    reading('reading.message', 'SMS od Ani: „Czekam w kawiarni obok wyjścia z metra Centrum. Mam czerwoną kurtkę. Do zobaczenia!”',
      t('Як упізнати Аню?', 'Как узнать Аню?', 'How will you recognise Ania?'),
      [t('Червона куртка', 'Красная куртка', 'A red jacket'), t('Синя сумка', 'Синяя сумка', 'A blue bag'), t('Окуляри', 'Очки', 'Glasses')]),
    reading('reading.message', 'SMS od Ani: „Czekam w kawiarni obok wyjścia z metra Centrum. Mam czerwoną kurtkę. Do zobaczenia!”',
      t('Де вона чекає?', 'Где она ждёт?', 'Where is she waiting?'),
      [t('У кав\'ярні біля виходу з метро', 'В кафе у выхода из метро', 'In a café by the metro exit'), t('На пероні', 'На платформе', 'On the platform'), t('Удома', 'Дома', 'At home')]),
    dialogue('situation.mission-meet', ANIA, [
      { npc: 'Cześć! To ty piszesz ze mną na Telegramie o wymianie językowej?', tr: t('Привіт! Це ти пишеш мені в Telegram про мовний обмін?', 'Привет! Это ты пишешь мне в Telegram про языковой обмен?', 'Hi! Are you the one messaging me on Telegram about a language exchange?'),
        choose: [['Tak, to ja! Cześć, miło mi!', t('Так, це я! Привіт, приємно!', 'Да, это я! Привет, приятно!', 'Yes, that\'s me! Hi, nice to meet you!')], ['Nie, dziękuję, dobranoc.', t('Ні, дякую, на добраніч.', 'Нет, спасибо, спокойной ночи.', 'No thanks, good night.')]],
        feedback: t('Це твоя зустріч — привітайся: **Tak, to ja! Miło mi!**', 'Это твоя встреча — поздоровайся: **Tak, to ja! Miło mi!**', 'This is your meeting — say hello: **Tak, to ja! Miło mi!**') },
      { npc: 'Mnie też miło! Jestem Ania. Skąd jesteś?', tr: t('Мені теж приємно! Я Аня. Звідки ти?', 'Мне тоже приятно! Я Аня. Откуда ты?', 'Nice to meet you too! I\'m Ania. Where are you from?'),
        choose: [['Jestem z Ukrainy, z Odessy.', t('Я з України, з Одеси.', 'Я из Украины, из Одессы.', 'I\'m from Ukraine, from Odesa.')], ['Mam dwadzieścia lat.', t('Мені двадцять років.', 'Мне двадцать лет.', 'I\'m twenty.')]],
        feedback: t('**Skąd** — звідки. Відповідь: **Jestem z…**', '**Skąd** — откуда. Ответ: **Jestem z…**', '**Skąd** means where from. Answer: **Jestem z…**') },
      { npc: 'A od kiedy jesteś w Warszawie?', tr: t('А відколи ти у Варшаві?', 'А с каких пор ты в Варшаве?', 'And since when have you been in Warsaw?'),
        choose: [['Dopiero od wczoraj.', t('Лише з учора.', 'Только со вчера.', 'Only since yesterday.')], ['Do widzenia.', t('До побачення.', 'До свидания.', 'Goodbye.')]],
        feedback: t('Питання «відколи?» — відповідай: **od wczoraj** (з учора).', 'Вопрос «с каких пор?» — отвечай: **od wczoraj** (со вчера).', 'The question is "since when?" — answer **od wczoraj** (since yesterday).') },
      { npc: 'To witaj w Warszawie!', tr: t('Тоді ласкаво просимо до Варшави!', 'Тогда добро пожаловать в Варшаву!', 'Then welcome to Warsaw!') },
    ], { situation: true, scene: t('Місія, крок 1: кав\'ярня біля станції метро Centrum. За столиком — дівчина в червоній куртці.', 'Миссия, шаг 1: кафе у станции метро Centrum. За столиком — девушка в красной куртке.', 'Mission, step 1: a café by Centrum metro station. A woman in a red jacket sits at a table.') }),
    wordChoice('vocab.greetings', 'Witaj w Warszawie!', [t('Ласкаво просимо до Варшави!', 'Добро пожаловать в Варшаву!', 'Welcome to Warsaw!'), t('Бувай, Варшаво!', 'Пока, Варшава!', 'Bye, Warsaw!'), t('Варшава зачинена', 'Варшава закрыта', 'Warsaw is closed')]),
    fillGap('grammar.genitive', 'Jestem z ___, z Odessy.', ['Ukrainy', 'Ukraina', 'Ukrainie'], t('Я з України, з Одеси.', 'Я из Украины, из Одессы.', 'I\'m from Ukraine, from Odesa.'),
      t('**z** + родовий: Ukraina → **z Ukrainy**, Odessa → **z Odessy**.', '**z** + родительный: Ukraina → **z Ukrainy**, Odessa → **z Odessy**.', '**z** + genitive: **z Ukrainy**, **z Odessy**.')),
    listen('listening.intro', 'Miło mi, jestem Ania', ['Miło mi, jestem Ania', 'Miło mi, jestem Hania', 'Mało mi, jestem Ania']),
    dialogue('situation.mission-stranger', ZENON, [
      { npc: 'Przepraszam, czy wie pan albo pani, gdzie tu jest poczta?', tr: t('Перепрошую, ви не знаєте, де тут пошта?', 'Извините, вы не знаете, где здесь почта?', 'Excuse me, do you know where the post office is?'),
        choose: [['Przepraszam, nie rozumiem. Czy może pan powtórzyć wolniej?', t('Вибачте, не розумію. Можете повторити повільніше?', 'Извините, не понимаю. Можете повторить медленнее?', 'Sorry, I don\'t understand. Could you repeat more slowly?')], ['Jestem z Odessy.', t('Я з Одеси.', 'Я из Одессы.', 'I\'m from Odesa.')]],
        feedback: t('Незрозуміло — попроси: **Czy może pan powtórzyć wolniej?**', 'Непонятно — попроси: **Czy może pan powtórzyć wolniej?**', 'Didn\'t catch it — ask: **Czy może pan powtórzyć wolniej?**') },
      { npc: 'Gdzie jest poczta?', tr: t('Де пошта?', 'Где почта?', 'Where is the post office?'),
        choose: [['Niestety nie wiem, przepraszam.', t('На жаль, не знаю, вибачте.', 'К сожалению, не знаю, извините.', 'Sorry, I don\'t know.')], ['Dobranoc!', t('На добраніч!', 'Спокойной ночи!', 'Good night!')]],
        feedback: t('Не знаєш — так і скажи ввічливо: **Niestety nie wiem.**', 'Не знаешь — так и скажи вежливо: **Niestety nie wiem.**', 'If you don\'t know, say so politely: **Niestety nie wiem.**') },
      { npc: 'Nic nie szkodzi. Dziękuję!', tr: t('Нічого страшного. Дякую!', 'Ничего страшного. Спасибо!', 'No problem. Thank you!') },
    ], { situation: true, scene: t('Місія, крок 2: дорогою до кав\'ярні тебе зупиняє літній пан.', 'Миссия, шаг 2: по дороге в кафе тебя останавливает пожилой пан.', 'Mission, step 2: on your way to the café an elderly man stops you.') }),
    fillGap('usage.politeness', 'Czy może pan mówić ___?', ['wolniej', 'wolny', 'wolno'], t('Чи можете ви говорити повільніше?', 'Вы можете говорить медленнее?', 'Could you speak more slowly?'),
      t('«Повільніше» — **wolniej**.', '«Медленнее» — **wolniej**.', '"More slowly" is **wolniej**.')),
    reverseChoice('vocab.politeness', t('Я не знаю.', 'Я не знаю.', 'I don\'t know.'), ['Nie wiem.', 'Nie mam.', 'Nie jestem.']),
    findError('grammar.genitive', ['Jestem', 'z', 'Odessa'], 2, t('Я з Одеси.', 'Я из Одессы.', 'I\'m from Odesa.'),
      t('Після **z** — родовий: **z Odessy**.', 'После **z** — родительный: **z Odessy**.', 'After **z** use the genitive: **z Odessy**.')),
    build('grammar.intro', 'Jestem z Ukrainy i mówię trochę po polsku', t('Я з України й трохи говорю польською', 'Я из Украины и немного говорю по-польски', 'I\'m from Ukraine and speak a little Polish'), ['polski', 'jest']),
    wordOrder('grammar.intro', 'Do zobaczenia jutro w kawiarni', t('До зустрічі завтра в кав\'ярні.', 'До встречи завтра в кафе.', 'See you tomorrow at the café.')),
    oddOne('vocab.greetings', ['Na razie', 'Do zobaczenia', 'Do widzenia', 'Dziękuję'], 3,
      t('Три — прощання, а **Dziękuję** — дякую.', 'Три — прощания, а **Dziękuję** — спасибо.', 'Three are goodbyes; **Dziękuję** means thank you.'), t("Який вираз означає подяку, а не прощання?", "Какое выражение означает благодарность, а не прощание?", "Which expression gives thanks rather than says goodbye?")),
    translate('writing.intro', t('Приємно, я з України.', 'Приятно, я из Украины.', 'Nice to meet you, I\'m from Ukraine.'), ['Miło mi, jestem z Ukrainy', 'Miło mi. Jestem z Ukrainy']),
    dialogue('situation.mission-bye', ANIA, [
      { npc: 'Muszę już iść na zajęcia. Spotkamy się jutro?', tr: t('Мені вже треба на пари. Зустрінемося завтра?', 'Мне уже пора на пары. Встретимся завтра?', 'I have to go to class. Shall we meet tomorrow?'),
        choose: [['Tak, chętnie! Do zobaczenia jutro!', t('Так, залюбки! До зустрічі завтра!', 'Да, с удовольствием! До встречи завтра!', 'Yes, gladly! See you tomorrow!')], ['Nie rozumiem, dobranoc.', t('Не розумію, на добраніч.', 'Не понимаю, спокойной ночи.', 'I don\'t understand, good night.')]],
        feedback: t('Погодься на зустріч: **Do zobaczenia jutro!**', 'Согласись на встречу: **Do zobaczenia jutro!**', 'Agree to meet: **Do zobaczenia jutro!**') },
      { npc: 'Super! Na razie!', tr: t('Супер! Бувай!', 'Супер! Пока!', 'Great! See you!'),
        choose: [['Na razie! Dziękuję za kawę!', t('Бувай! Дякую за каву!', 'Пока! Спасибо за кофе!', 'See you! Thanks for the coffee!')], ['Dzień dobry!', t('Добрий день!', 'Добрый день!', 'Good morning!')]],
        feedback: t('Прощаються: **Na razie!**', 'Прощаются: **Na razie!**', 'This is goodbye: **Na razie!**') },
      { npc: 'Nie ma za co!', tr: t('Нема за що!', 'Не за что!', 'You\'re welcome!') },
    ], { situation: true, scene: t('Місія, крок 3: зустріч добігає кінця.', 'Миссия, шаг 3: встреча подходит к концу.', 'Mission, step 3: the meeting is coming to an end.') }),
    listen('listening.greetings', 'Do zobaczenia jutro!', ['Do zobaczenia jutro!', 'Do widzenia jutro!', 'Dzień dobry jutro!']),
    wordChoice('vocab.time', 'Dopiero od wczoraj', [t('Лише з учора', 'Только со вчера', 'Only since yesterday'), t('Уже давно', 'Уже давно', 'For a long time'), t('До завтра', 'До завтра', 'Until tomorrow')]),
    pictureChoice('vocab.greetings', 'Dobranoc', [
      ['🌙', t('на добраніч (перед сном)', 'спокойной ночи (перед сном)', 'good night (before sleep)')], ['☀️', t('добрий день', 'добрый день', 'good morning')], ['🌆', t('добрий вечір', 'добрый вечер', 'good evening')], ['👋', t('привіт', 'привет', 'hi')],
    ]),
    fillGap('usage.formality', 'Do pani w urzędzie: „___, dziękuję!”', ['Do widzenia', 'Na razie', 'Cześć'], t('Пані в установі: «До побачення, дякую!»', 'Пани в учреждении: «До свидания, спасибо!»', 'To a clerk: "Goodbye, thank you!"'),
      t('В установі — формально: **Do widzenia**.', 'В учреждении — формально: **Do widzenia**.', 'In an office be formal: **Do widzenia**.')),
    dictation('writing.intro', 'Skąd jesteś', t('Звідки ти?', 'Откуда ты?', 'Where are you from?')),
    speak('speaking.intro', 'Cześć, miło mi! Jestem z Ukrainy.', t('Привіт, приємно! Я з України.', 'Привет, приятно! Я из Украины.', 'Hi, nice to meet you! I\'m from Ukraine.')),
  ],
};

// ───────────── waw-5-liczby: +7 ─────────────
export const WAW5_MORE = [
  wordChoice('vocab.numbers', 'osiem', [t('8', '8', '8'), t('6', '6', '6'), t('18', '18', '18')]),
  fillGap('vocab.numbers', 'dziesięć, dziewięć, osiem, ___, sześć', ['siedem', 'pięć', 'cztery'], t('десять, дев\'ять, вісім, …, шість', 'десять, девять, восемь, …, шесть', 'ten, nine, eight, …, six')),
  reading('reading.numbers', 'Kartka od właściciela: Mieszkanie nr 7 · Piętro 3 · Kod do domofonu: 2-5-9',
    t('Який код домофона?', 'Какой код домофона?', 'What is the intercom code?'), ['259', '357', '739'],
    t('**Kod do domofonu**: dwa, pięć, dziewięć.', '**Kod do domofonu**: dwa, pięć, dziewięć.', '**Kod do domofonu**: two, five, nine.')),
  listen('listening.numbers', 'Peron drugi, tor szósty', ['Peron drugi, tor szósty', 'Peron trzeci, tor szósty', 'Peron drugi, tor siódmy'],
    t('Номери платформ кажуть порядковими: **drugi** (другий), **szósty** (шостий).', 'Номера платформ называют порядковыми: **drugi** (второй), **szósty** (шестой).', 'Platforms use ordinals: **drugi** (second), **szósty** (sixth).')),
  oddOne('vocab.numbers', ['jeden', 'dwa', 'trzy', 'tak'], 3, t('**tak** — так, а не число.', '**tak** — да, а не число.', '**tak** means yes, not a number.'), t("Яке слово НЕ є числівником?", "Какое слово НЕ является числительным?", "Which word is NOT a number?")),
  build('vocab.numbers', 'Mój numer to pięć, sześć, siedem', t('Мій номер — п\'ять, шість, сім', 'Мой номер — пять, шесть, семь', 'My number is five, six, seven'), ['szósty']),
  translate('writing.numbers', t('три, чотири, п\'ять', 'три, четыре, пять', 'three, four, five'), ['trzy, cztery, pięć', 'trzy cztery pięć']),
];

// ───────────── waw-6-wiek: +7 ─────────────
export const WAW6_MORE = [
  listen('listening.numbers', 'siedemnaście', ['siedemnaście', 'siedemdziesiąt', 'siedem']),
  reverseChoice('vocab.numbers', t('18 — вісімнадцять', '18 — восемнадцать', '18 — eighteen'), ['osiemnaście', 'osiemdziesiąt', 'osiem']),
  fillGap('grammar.age', 'Syn ma rok, a córka pięć ___.', ['lat', 'lata', 'roku'], t('Синові рік, а доньці п\'ять років.', 'Сыну год, а дочке пять лет.', 'The son is one and the daughter is five.'),
    t('Для 5–21 → **lat**: pięć lat.', 'Для 5–21 → **lat**: pięć lat.', '5–21 → **lat**: pięć lat.')),
  reading('reading.age', 'Rodzina Kowalskich: tata Marek — 45 lat, mama Ola — 41 lat, syn Kuba — 12 lat, córka Zosia — 3 lata.',
    t('Скільки років Зосі?', 'Сколько лет Зосе?', 'How old is Zosia?'), ['3', '12', '41']),
  dialogue('dialogue.siblings', ANIA, [
    { npc: 'Masz rodzeństwo?', tr: t('У тебе є брати чи сестри?', 'У тебя есть братья или сёстры?', 'Do you have siblings?'),
      choose: [['Tak, mam brata. On ma piętnaście lat.', t('Так, маю брата. Йому п\'ятнадцять.', 'Да, у меня есть брат. Ему пятнадцать.', 'Yes, I have a brother. He\'s fifteen.')], ['Tak, mam dwadzieścia lat.', t('Так, мені двадцять.', 'Да, мне двадцать.', 'Yes, I\'m twenty.')]],
      feedback: t('Питання про братів і сестер: **Mam brata / siostrę…**', 'Вопрос о братьях и сёстрах: **Mam brata / siostrę…**', 'It\'s about siblings: **Mam brata / siostrę…**') },
    { npc: 'A ja mam siostrę. Ona ma dwanaście lat.', tr: t('А в мене сестра. Їй дванадцять.', 'А у меня сестра. Ей двенадцать.', 'And I have a sister. She\'s twelve.') },
  ]),
  match('vocab.numbers', [
    ['jedenaście', t('11', '11', '11')],
    ['czternaście', t('14', '14', '14')],
    ['szesnaście', t('16', '16', '16')],
    ['dziewiętnaście', t('19', '19', '19')],
  ]),
  wordOrder('grammar.age', 'Moja siostra ma dwanaście lat', t('Моїй сестрі дванадцять років.', 'Моей сестре двенадцать лет.', 'My sister is twelve.')),
];

// ───────────── waw-boss: +15 (усі шість локацій) ─────────────
export const WAW_BOSS_MORE = [
  listen('listening.transport', 'Następna stacja: Świętokrzyska', ['Następna stacja: Świętokrzyska', 'Następna stacja: Centrum', 'Ostatnia stacja: Świętokrzyska']),
  fillGap('grammar.tickets', 'Poproszę bilet ___ normalny.', ['dwudziestominutowy', 'dwadzieścia minut', 'dwudziesty'], t('Звичайний 20-хвилинний квиток, будь ласка.', 'Обычный 20-минутный билет, пожалуйста.', 'A full-fare 20-minute ticket, please.'),
    t('Тип квитка — прикметник: **dwudziestominutowy**.', 'Тип билета — прилагательное: **dwudziestominutowy**.', 'The ticket type is an adjective: **dwudziestominutowy**.')),
  wordChoice('vocab.transport', 'przejście podziemne', [t('підземний перехід', 'подземный переход', 'underpass'), t('підземна стоянка', 'подземная парковка', 'underground car park'), t('пересадка', 'пересадка', 'transfer')]),
  reading('reading.prices', 'WARZYWNIAK (ceny przykładowe) · pomidory 9,99 zł/kg · ogórki 6 zł/kg · ziemniaki 3,50 zł/kg',
    t('Скільки коштує кілограм огірків?', 'Сколько стоит килограмм огурцов?', 'How much is a kilo of cucumbers?'), ['6 zł', '9,99 zł', '3,50 zł']),
  fillGap('grammar.prices', 'To kosztuje pięć ___.', ['złotych', 'złote', 'złoty'], t('Це коштує п\'ять злотих.', 'Это стоит пять злотых.', 'It costs five złoty.'),
    t('Для 5–21 → **złotych**.', 'Для 5–21 → **złotych**.', '5–21 → **złotych**.')),
  dialogue('dialogue.boss-directions', TURYSTA, [
    { npc: 'Przepraszam, którędy na plac Zamkowy?', tr: t('Перепрошую, як пройти на Замкову площу?', 'Извините, как пройти на Замковую площадь?', 'Excuse me, which way to Castle Square?'),
      choose: [['Proszę iść prosto, a potem w lewo.', t('Ідіть прямо, а потім ліворуч.', 'Идите прямо, а потом налево.', 'Go straight, then left.')], ['Poproszę kawę z mlekiem.', t('Каву з молоком, будь ласка.', 'Кофе с молоком, пожалуйста.', 'Coffee with milk, please.')]],
      feedback: t('Турист питає дорогу — поясни: **prosto, w lewo…**', 'Турист спрашивает дорогу — объясни: **prosto, w lewo…**', 'A tourist asks the way — explain: **prosto, w lewo…**') },
    { npc: 'Dziękuję! Daleko?', tr: t('Дякую! Далеко?', 'Спасибо! Далеко?', 'Thanks! Is it far?'),
      choose: [['Nie, pięć minut pieszo.', t('Ні, п\'ять хвилин пішки.', 'Нет, пять минут пешком.', 'No, five minutes on foot.')], ['Tak, mam pięć lat.', t('Так, мені п\'ять років.', 'Да, мне пять лет.', 'Yes, I\'m five.')]],
      feedback: t('Відстань: **pięć minut pieszo**.', 'Расстояние: **pięć minut pieszo**.', 'Distance: **pięć minut pieszo**.') },
  ]),
  reverseChoice('vocab.directions', t('на перехресті', 'на перекрёстке', 'at the junction'), ['na skrzyżowaniu', 'na światłach', 'na rogu']),
  fillGap('grammar.cafe', 'Poproszę ___ z mlekiem.', ['kawę', 'kawa', 'kawy'], t('Каву з молоком, будь ласка.', 'Кофе с молоком, пожалуйста.', 'Coffee with milk, please.'),
    t('**Poproszę** + знахідний: kawa → **kawę**.', '**Poproszę** + винительный: kawa → **kawę**.', '**Poproszę** + accusative: kawa → **kawę**.')),
  listen('listening.cafe', 'Na miejscu czy na wynos?', ['Na miejscu czy na wynos?', 'Na miejscu czy na zewnątrz?', 'Tu czy tam?']),
  findError('grammar.numerals', ['Poproszę', 'dwa', 'bułki'], 1, t('Дві булочки, будь ласка.', 'Две булочки, пожалуйста.', 'Two rolls, please.'),
    t('**bułka** — жіночий рід → **dwie** bułki.', '**bułka** — женский род → **dwie** bułki.', '**bułka** is feminine → **dwie** bułki.')),
  reading('reading.notice', 'OGŁOSZENIE · Szanowni Mieszkańcy! W sobotę od 9:00 do 12:00 nie będzie wody. Administracja',
    t('Коли не буде води?', 'Когда не будет воды?', 'When will there be no water?'),
    [t('У суботу з 9:00 до 12:00', 'В субботу с 9:00 до 12:00', 'On Saturday 9:00–12:00'), t('У неділю', 'В воскресенье', 'On Sunday'), t('Щодня вранці', 'Каждый день утром', 'Every morning')]),
  wordChoice('vocab.home', 'domofon', [t('домофон', 'домофон', 'intercom'), t('мобільний', 'мобильный', 'mobile phone'), t('ліфт', 'лифт', 'lift')]),
  fillGap('grammar.time', 'Spotkajmy się ___ sobotę.', ['w', 'we', 'na'], t('Зустріньмося в суботу.', 'Встретимся в субботу.', 'Let\'s meet on Saturday.'),
    t('Дні тижня: **w** + знахідний: w sobotę (але **we** wtorek).', 'Дни недели: **w** + винительный: w sobotę (но **we** wtorek).', 'Days: **w** + accusative: w sobotę (but **we** wtorek).')),
  build('grammar.sentence', 'Umówmy się na kawę w niedzielę', t('Домовмося на каву в неділю', 'Договоримся на кофе в воскресенье', 'Let\'s meet for coffee on Sunday'), ['niedziela', 'kawa']),
  translate('writing.home', t('Я живу в п\'ятій квартирі.', 'Я живу в пятой квартире.', 'I live in flat number five.'), ['Mieszkam pod piątką', 'Mieszkam pod numerem pięć', 'Mieszkam w mieszkaniu numer pięć']),
];
