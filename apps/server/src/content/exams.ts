/**
 * Внутрішні тести: вхідний (placement) і пробний іспит A1.
 * Це тренувальні тести POLSKI GO, а не державна сертифікація.
 */
import { t, atLevel, fillGap, listen, reading, translate, grammar, dictation, wordChoice, reverseChoice, findError, build } from './builders';
import type { LessonSeed } from './types';

export const PLACEMENT: LessonSeed = {
  slug: 'placement-test',
  kind: 'PLACEMENT',
  title: t('Вхідний тест', 'Входной тест', 'Placement test'),
  topic: t('Визначимо, з чого почати', 'Определим, с чего начать', 'Let\'s find your starting point'),
  cefr: 'A1',
  difficulty: 2,
  explanation: t(
    '10 коротких завдань від простих до складніших. Результат — лише рекомендація, з якого міста почати. Підтверджений рівень польської ти отримаєш, склавши іспити.',
    '10 коротких заданий от простых к сложным. Результат — лишь рекомендация, с какого города начать. Подтверждённый уровень польского ты получишь, сдав экзамены.',
    '10 short tasks from easy to harder. The result is only a recommendation of where to start. Your confirmed Polish level comes from passing exams.',
  ),
  examples: [],
  words: [],
  // #0, #4, #6, #7 замінено (аудит 2026-10-26): були точними копіями завдань уроків waw-2-uprzejmosc#0,
  // krk-1-rodzina#5, wro-1-kawa#4, wro-3-ceny#2. Навик і місце в тесті ті самі; у БД — через EXERCISE_FIXES.
  exercises: [
    wordChoice('vocab.greetings', 'Do widzenia', [t('До побачення', 'До свидания', 'Goodbye'), t('Добрий вечір', 'Добрый вечер', 'Good evening'), t('Дякую', 'Спасибо', 'Thank you')]),
    wordChoice('vocab.numbers', 'siedem', [t('7', '7', '7'), t('6', '6', '6'), t('17', '17', '17')]),
    fillGap('grammar.intro', 'Mam na ___ Ola.', ['imię', 'nazwisko', 'lat'], t('Мене звати Оля.', 'Меня зовут Оля.', 'My name is Ola.')),
    fillGap('grammar.genitive', 'Jestem z ___.', ['Białorusi', 'Białoruś', 'Białorusią'], t('Я з Білорусі.', 'Я из Беларуси.', 'I\'m from Belarus.')),
    findError('grammar.gender', ['To', 'jest', 'moja', 'mieszkanie'], 2, t('Це моя квартира.', 'Это моя квартира.', 'This is my flat.'),
      t('**mieszkanie** — середній рід (закінчення **-e**), тому **moje mieszkanie**, хоча «квартира» — жіночого роду.', '**mieszkanie** — средний род (окончание **-e**), поэтому **moje mieszkanie**, хотя «квартира» — женского рода.', '**mieszkanie** is neuter (ending **-e**), so it is **moje mieszkanie**.')),
    fillGap('grammar.być', 'Oni ___ w domu.', ['są', 'jest', 'jesteśmy'], t('Вони вдома.', 'Они дома.', 'They are at home.')),
    reverseChoice('grammar.accusative', t('Я читаю книжку.', 'Я читаю книгу.', 'I\'m reading a book.'), ['Czytam książkę.', 'Czytam książka.', 'Czytam książką.'],
      t('**czytać** + знахідний відмінок: książka → **książkę**.', '**czytać** + винительный падеж: książka → **książkę**.', '**czytać** takes the accusative: książka → **książkę**.')),
    reverseChoice('grammar.numerals', t('У мене п\'ять квитків.', 'У меня пять билетов.', 'I have five tickets.'), ['Mam pięć biletów.', 'Mam pięć bilety.', 'Mam pięć bilet.'],
      t('Після 5–21 — родовий відмінок множини: **pięć biletów**.', 'После 5–21 — родительный падеж множественного числа: **pięć biletów**.', 'After 5–21 use the genitive plural: **pięć biletów**.')),
    fillGap('grammar.past', 'Wczoraj ___ w kinie.', ['byłem', 'jestem', 'będę'], t('Вчора я був у кіно.', 'Вчера я был в кино.', 'Yesterday I was at the cinema.')),
    fillGap('grammar.instrumental', 'Jestem ___.', ['nauczycielem', 'nauczyciel', 'nauczyciela'], t('Я вчитель.', 'Я учитель.', 'I am a teacher.')),
  ],
};

/**
 * Входной тест v2 (владелец 2026-11-16: «не слишком лёгкий, без метода исключения, вопросы A0…B2, определить реальный уровень»).
 * Блоки A0 (чтение букв), A1, A2, B1, B2 по 3 вопроса; блок сдан при 2 из 3, несданный блок заканчивает тест (shared/levels.ts).
 * Вопросы не решаются через русский или украинский: варианты — польские формы одного слова, «ложные друзья»
 * (sklep ≠ склеп, uroda ≠ урод), ловушки русской логики (moja mieszkanie, poszła вместо poszłam, «три года» → od trzech lat).
 * У каждого вопроса есть «Не знаю» (приложение): угадывать не нужно. Порядок вопросов — по блокам, не перемешивается.
 */
export const PLACEMENT_V2: LessonSeed = {
  slug: 'placement-test-v2',
  kind: 'PLACEMENT',
  title: t('Вхідний тест', 'Входной тест', 'Placement test'),
  topic: t('Визначимо твій рівень', 'Определим твой уровень', "Let's find your level"),
  cefr: 'A1',
  difficulty: 3,
  explanation: t(
    'До 15 коротких завдань: від читання літер до рівня B2. Тест зупиниться, коли стане надто складно. Не знаєш — натисни «Не знаю»: вгадувати не треба, від цього залежить, якого рівня будуть твої завдання.',
    'До 15 коротких заданий: от чтения букв до уровня B2. Тест остановится, когда станет слишком сложно. Не знаешь — нажми «Не знаю»: угадывать не нужно, от этого зависит, какого уровня будут твои задания.',
    "Up to 15 short tasks: from reading letters to B2. The test stops when it gets too hard. Don't know? Tap “I don't know” — no need to guess: it decides the level of your tasks.",
  ),
  examples: [],
  words: [],
  exercises: [
    // ── A0: чтение букв ──
    atLevel('A0', reading('alphabet.letters', 'ł — łapa, mały, było', t('Як читається польська «ł»?', 'Как читается польская «ł»?', 'How is Polish “ł” pronounced?'),
      [t('Як англійське w (коротке «у»)', 'Как английское w (короткое «у»)', 'Like English w'), t('Як «л»', 'Как «л»', 'Like English l'), t('Як «ль»', 'Как «ль»', 'Like a soft l')],
      t('**ł** читається як англійське **w**: łapa [уапа], było [биуо].', '**ł** читается как английское **w**: łapa [уапа], było [быуо].', '**ł** sounds like English **w**: łapa [wapa].'))),
    atLevel('A0', reading('alphabet.letters', 'ó — mój, góra, który', t('Як читається «ó»?', 'Как читается «ó»?', 'How is “ó” pronounced?'),
      [t('Як «у»', 'Как «у»', 'Like “u”'), t('Як «о»', 'Как «о»', 'Like “o”'), t('Як «йо»', 'Как «ё»', 'Like “yo”')],
      t('**ó** читається так само, як **u**: mój [муй], góra [гура].', '**ó** читается так же, как **u**: mój [муй], góra [гура].', '**ó** sounds the same as **u**: mój [muy], góra [gura].'))),
    atLevel('A0', reading('alphabet.digraphs', 'szczotka', t('Як читається це слово?', 'Как читается это слово?', 'How is this word pronounced?'),
      [t('щотка', 'щотка', 'shchotka'), t('шотка', 'шотка', 'shotka'), t('чотка', 'чотка', 'chotka')],
      t('**sz** — «ш», **cz** — «ч», разом **szcz** — «шч»: szczotka [шчотка].', '**sz** — «ш», **cz** — «ч», вместе **szcz** — «шч»: szczotka [шчотка].', '**sz** = sh, **cz** = ch, together **szcz** = shch.'))),
    // ── A1 ──
    atLevel('A1', fillGap('grammar.gender', 'To jest ___ mieszkanie.', ['moje', 'moja', 'mój'], t('Це моя квартира.', 'Это моя квартира.', 'This is my flat.'),
      t('**mieszkanie** — середній рід (на **-e**), тому **moje**, хоча «квартира» — жіночого роду.', '**mieszkanie** — средний род (на **-e**), поэтому **moje**, хотя «квартира» — женского рода.', '**mieszkanie** is neuter (ends in **-e**): **moje**.'))),
    atLevel('A1', wordChoice('vocab.false_friends', 'sklep', [t('магазин', 'магазин', 'shop'), t('склеп (гробниця)', 'склеп (гробница)', 'crypt'), t('погріб', 'погреб', 'cellar')],
      t('**sklep** — магазин: sklep spożywczy — продуктовий магазин.', '**sklep** — магазин: sklep spożywczy — продуктовый магазин.', '**sklep** means shop.'))),
    atLevel('A1', fillGap('grammar.accusative', 'Lubię ___ z mlekiem.', ['kawę', 'kawa', 'kawy'], t('Люблю каву з молоком.', 'Люблю кофе с молоком.', 'I like coffee with milk.'),
      t('**lubić** + знахідний відмінок: kawa → **kawę**.', '**lubić** + винительный падеж: kawa → **kawę**.', '**lubić** takes the accusative: kawa → **kawę**.'))),
    // ── A2 ──
    atLevel('A2', fillGap('grammar.past', 'Wczoraj ___ do kina z koleżanką.', ['poszłam', 'poszła', 'poszedłem', 'pójdę'], t('Учора я (Анна) ходила в кіно з подругою.', 'Вчера я (Анна) ходила в кино с подругой.', 'Yesterday I (Anna) went to the cinema with a friend.'),
      t('Я — жінка, минулий час: **poszłam** (-łam). **poszła** — «вона пішла».', 'Я — женщина, прошедшее время: **poszłam** (-łam). **poszła** — «она пошла».', 'Female speaker, past tense: **poszłam**; **poszła** means “she went”.'))),
    atLevel('A2', fillGap('grammar.genitive', 'Niestety nie mam dziś ___.', ['czasu', 'czas', 'czasem', 'czasie'], t('На жаль, сьогодні в мене немає часу.', 'К сожалению, сегодня у меня нет времени.', "Unfortunately I don't have time today."),
      t('Після **nie mam** — родовий відмінок: czas → **czasu**.', 'После **nie mam** — родительный падеж: czas → **czasu**.', 'After **nie mam** use the genitive: **czasu**.'))),
    atLevel('A2', fillGap('grammar.comparative', 'Nasze nowe mieszkanie jest ___ niż stare.', ['większe', 'większy', 'więcej', 'największe'], t('Наша нова квартира більша, ніж стара.', 'Наша новая квартира больше, чем старая.', 'Our new flat is bigger than the old one.'),
      t('Порівняння прикметника: duże → **większe** (середній рід, як mieszkanie; większy — чоловічий). **więcej** — «більше» про кількість.', 'Сравнение прилагательного: duże → **większe** (средний род, как mieszkanie; większy — мужской). **więcej** — «больше» о количестве.', 'Comparative adjective: **większe** (neuter like mieszkanie; większy is masculine). **więcej** means “more” (amount).'))),
    // ── B1 ──
    atLevel('B1', fillGap('grammar.conditional', 'Gdybym wiedział wcześniej, ___ ci o tym.', ['powiedziałbym', 'powiedziałby', 'powiedziałabym', 'powiem'], t('Якби я знав раніше, я б тобі про це сказав.', 'Если бы я знал раньше, я бы тебе об этом сказал.', 'If I had known earlier, I would have told you.'),
      t('Умовний спосіб, «я» (чоловік, як wiedział): **powiedziałbym**. powiedziałby — «він сказав би», powiedziałabym — жінка.', 'Условное наклонение, «я» (мужчина, как wiedział): **powiedziałbym**. powiedziałby — «он сказал бы», powiedziałabym — женщина.', 'Conditional, first person masculine (like wiedział): **powiedziałbym**.'))),
    atLevel('B1', fillGap('grammar.numerals', 'Mieszkam w Polsce od ___ lat.', ['trzech', 'trzy', 'trzema', 'trzeciego'], t('Я живу в Польщі вже три роки.', 'Я живу в Польше уже три года.', "I've been living in Poland for three years."),
      t('**od** + родовий відмінок: od **trzech** lat — «вже три роки».', '**od** + родительный падеж: od **trzech** lat — «уже три года».', '**od** takes the genitive: od **trzech** lat.'))),
    atLevel('B1', wordChoice('vocab.false_friends', 'uroda', [t('краса', 'красота', 'beauty'), t('потворність', 'уродство', 'ugliness'), t('урожай', 'урожай', 'harvest')],
      t('**uroda** — краса, зовнішність: ładna uroda — гарна зовнішність.', '**uroda** — красота, внешность: ładna uroda — красивая внешность.', '**uroda** means beauty, looks.'))),
    // ── B2 ──
    atLevel('B2', wordChoice('vocab.idioms', 'Mieć muchy w nosie', [t('бути не в гуморі', 'быть не в духе', 'to be in a bad mood'), t('бути застудженим', 'быть простуженным', 'to have a cold'), t('пхати носа в чужі справи', 'совать нос в чужие дела', 'to poke your nose into others’ business')],
      t('**mieć muchy w nosie** — дутися, бути не в гуморі.', '**mieć muchy w nosie** — дуться, быть не в духе.', '**mieć muchy w nosie** — to be sulky, in a bad mood.'))),
    atLevel('B2', fillGap('grammar.cases', 'Bardzo zależy mi na ___.', ['tej pracy', 'tę pracę', 'tą pracą', 'ta praca'], t('Мені дуже важлива ця робота.', 'Мне очень важна эта работа.', 'This job really matters to me.'),
      t('**zależy mi na** + місцевий відмінок: na **tej pracy**.', '**zależy mi na** + предложный (местный) падеж: na **tej pracy**.', '**zależy mi na** takes the locative: **tej pracy**.'))),
    atLevel('B2', fillGap('grammar.verbal_nouns', 'Uprzejmie proszę o ___ dokumentów do piątku.', ['przesłanie', 'przesłaniu', 'przesłania', 'przesłać'], t('Прошу надіслати документи до п’ятниці.', 'Прошу прислать документы до пятницы.', 'Please send the documents by Friday.'),
      t('**prosić o** + знахідний відмінок: o **przesłanie** (а не «o przesłaniu», як у російському «прошу о…»).', '**prosić o** + винительный падеж: o **przesłanie** (а не «o przesłaniu», как в русском «прошу о…»).', '**prosić o** takes the accusative: o **przesłanie**.'))),
  ],
};

export const EXAM_A1: LessonSeed = {
  slug: 'exam-a1',
  kind: 'EXAM',
  title: t('Пробний іспит A1', 'Пробный экзамен A1', 'Mock exam A1'),
  topic: t('Граматика, лексика, читання, аудіювання, письмо', 'Грамматика, лексика, чтение, аудирование, письмо', 'Grammar, vocabulary, reading, listening, writing'),
  cefr: 'A1',
  difficulty: 4,
  explanation: t(
    'Внутрішній тренувальний іспит POLSKI GO рівня A1. Щоб підтвердити рівень A1 у застосунку, потрібно **70%**.\nЦе не державний сертифікат — але хороша перевірка перед ним.',
    'Внутренний тренировочный экзамен POLSKI GO уровня A1. Чтобы подтвердить уровень A1 в приложении, нужно **70%**.\nЭто не государственный сертификат — но хорошая проверка перед ним.',
    'An internal POLSKI GO practice exam at A1. You need **70%** to confirm A1 in the app.\nThis is not a state certificate — but a good check before one.',
  ),
  examples: [],
  words: [],
  exercises: [
    // Граматика і лексика
    fillGap('grammar.genitive', 'Nie mam ___.', ['brata', 'brat', 'bratem'], t('У мене немає брата.', 'У меня нет брата.', 'I don\'t have a brother.'),
      t('Після заперечення **nie mam** — родовий відмінок: **brata**.', 'После отрицания **nie mam** — родительный падеж: **brata**.', 'After **nie mam** use the genitive: **brata**.')),
    grammar('grammar.być', 'Wy ___ z Polski?', 'być', ['jesteście'], t('Ви з Польщі?', 'Вы из Польши?', 'Are you from Poland?'), t('wy **jesteście**.', 'wy **jesteście**.', 'wy **jesteście**.')),
    grammar('grammar.mieć', 'Oni ___ duże mieszkanie.', 'mieć', ['mają'], t('У них велика квартира.', 'У них большая квартира.', 'They have a big flat.'), t('oni **mają**.', 'oni **mają**.', 'oni **mają**.')),
    grammar('grammar.chcieć', 'Ona ___ kawę.', 'chcieć', ['chce'], t('Вона хоче каву.', 'Она хочет кофе.', 'She wants coffee.'), t('ona **chce**.', 'ona **chce**.', 'ona **chce**.')),
    fillGap('grammar.locative', 'Mieszkam w ___.', ['Krakowie', 'Kraków', 'Krakowa'], t('Я живу в Кракові.', 'Я живу в Кракове.', 'I live in Kraków.')),
    fillGap('grammar.days', 'Pracuję w ___.', ['sobotę', 'sobota', 'soboty'], t('Я працюю в суботу.', 'Я работаю в субботу.', 'I work on Saturday.')),
    findError('grammar.numerals', ['To', 'kosztuje', 'dwa', 'złotych'], 3, t('Це коштує два злотих.', 'Это стоит два злотых.', 'It costs two zlotys.'),
      t('Після 2–4: **złote**.', 'После 2–4: **złote**.', 'After 2–4: **złote**.')),
    // Читання
    reading('reading.exam', 'Ogłoszenie: Wynajmę pokój w Krakowie. Pokój jest duży, kuchnia i łazienka są wspólne. Cena: 1200 zł miesięcznie. Telefon: 600 100 200.',
      t('Що є спільним?', 'Что является общим?', 'What is shared?'),
      [t('Кухня і ванна', 'Кухня и ванная', 'Kitchen and bathroom'), t('Кімната і кухня', 'Комната и кухня', 'The room and the kitchen'), t('Ванна і балкон', 'Ванная и балкон', 'The bathroom and a balcony')],
      t('**kuchnia i łazienka są wspólne** — кухня і ванна спільні.', '**kuchnia i łazienka są wspólne** — кухня и ванная общие.', '**kuchnia i łazienka są wspólne** — shared kitchen and bathroom.')),
    reading('reading.exam', 'Ogłoszenie: Wynajmę pokój w Krakowie. Pokój jest duży, kuchnia i łazienka są wspólne. Cena: 1200 zł miesięcznie. Telefon: 600 100 200.',
      t('Скільки коштує кімната?', 'Сколько стоит комната?', 'How much is the room?'),
      [t('1200 зл на місяць', '1200 зл в месяц', '1200 zł per month'), t('600 зл на місяць', '600 зл в месяц', '600 zł per month'), t('1200 зл на тиждень', '1200 зл в неделю', '1200 zł per week')]),
    reading('reading.exam', 'Cześć Marta! Jutro jest sobota. Idziemy do kawiarni? Czekam na Ciebie o 10:00 na Rynku. Ola',
      t('Коли зустріч?', 'Когда встреча?', 'When is the meeting?'),
      [t('Завтра о 10:00', 'Завтра в 10:00', 'Tomorrow at 10:00'), t('Сьогодні о 10:00', 'Сегодня в 10:00', 'Today at 10:00'), t('У неділю', 'В воскресенье', 'On Sunday')]),
    // Аудіювання
    listen('listening.exam', 'Pociąg do Gdańska odjeżdża z peronu drugiego.', ['Pociąg do Gdańska odjeżdża z peronu drugiego.', 'Pociąg do Krakowa odjeżdża z peronu drugiego.', 'Autobus do Gdańska odjeżdża z przystanku.']),
    listen('listening.exam', 'Razem dwadzieścia cztery złote', ['24 zł', '42 zł', '20 zł']),
    listen('listening.exam', 'Przepraszam, nie rozumiem. Proszę mówić wolniej.', ['Przepraszam, nie rozumiem. Proszę mówić wolniej.', 'Przepraszam, rozumiem. Proszę mówić szybciej.', 'Dziękuję, rozumiem wszystko.']),
    // Письмо
    translate('writing.exam', t('Я з України і живу в Польщі.', 'Я из Украины и живу в Польше.', 'I am from Ukraine and I live in Poland.'), ['Jestem z Ukrainy i mieszkam w Polsce']),
    // Замінено (аудит 2026-10-26): «Рахунок, будь ласка» дослівно повторювало wro-4-restauracja#9.
    translate('writing.exam', t('Вибачте, де тут аптека?', 'Извините, где здесь аптека?', 'Excuse me, where is the pharmacy here?'),
      ['Przepraszam, gdzie tu jest apteka', 'Przepraszam, gdzie jest tu apteka', 'Przepraszam, gdzie tutaj jest apteka', 'Przepraszam, gdzie jest apteka']),
    dictation('writing.exam', 'Mam na imię Anna i mam dwadzieścia lat', t('Мене звати Анна, і мені двадцять років', 'Меня зовут Анна, и мне двадцать лет', 'My name is Anna and I am twenty')),
    build('grammar.sentence', 'W niedzielę jestem u babci', t('У неділю я в бабусі', 'В воскресенье я у бабушки', 'On Sunday I am at grandma\'s'), ['niedziela'], ['Jestem u babci w niedzielę']),
  ],
};
