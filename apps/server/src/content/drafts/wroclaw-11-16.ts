/**
 * Вроцлав, уроки 11–16 — ЧЕРНОВИК (не подключён к CITY_CONTENT, не попадает в seed).
 * Проверяется тестом apps/server/test/wroclaw-drafts.test.ts. Подключение — задача Sonnet/Opus
 * (см. PROJECT_PROGRESS.md, раздел «Sonnet — следующие задачи»).
 *
 * Маршруты: wro-wieczor (11–13), wro-prezenty (14–15), wro-powtorka (16). Урок 16 — без новых слов.
 */
import { t, wordChoice, reverseChoice, fillGap, listen, picture, findError, oddOne, reading, translate, grammar, dictation, build, match, dialogue } from '../builders';
import type { RouteSeed } from '../types';

export const WROCLAW_DRAFT_ROUTES_11_16: RouteSeed[] = [
  {
    slug: 'wro-wieczor',
    title: t('Вечір у Вроцлаві', 'Вечер во Вроцлаве', 'An evening in Wrocław'),
    description: t('Столик, смаки, гноми на Ринку', 'Столик, вкусы, гномы на Рынке', 'A table, tastes and gnomes on the square'),
    icon: 'cafe',
    lessons: [
      {
        slug: 'wro-11-rezerwacja',
        title: t('Столик на вечір', 'Столик на вечер', 'A table for the evening'),
        topic: t('Бронювання столика, na + знахідний', 'Бронирование столика, na + винительный', 'Booking a table, na + accusative'),
        cefr: 'A2',
        difficulty: 4,
        explanation: t(
          'Щоб забронювати столик, кажуть **Chciałbym zarezerwować stolik**. Кількість людей — **na** + знахідний: **na dwie osoby** (на двох; **osoba** — жіночий рід, тому **dwie**). Прізвище для броні: **Na jakie nazwisko?** — «На яке прізвище?»',
          'Чтобы забронировать столик, говорят **Chciałbym zarezerwować stolik**. Количество людей — **na** + винительный: **na dwie osoby** (на двоих; **osoba** — женский род, поэтому **dwie**). Фамилию для брони спрашивают: **Na jakie nazwisko?** — «На какую фамилию?»',
          'To book a table say **Chciałbym zarezerwować stolik**. For the number of people use **na** + accusative: **na dwie osoby** (for two; **osoba** is feminine, so **dwie**). The name for the booking: **Na jakie nazwisko?** — "In what name?"',
        ),
        examples: [
          { pl: 'Chciałbym zarezerwować stolik na dwie osoby.', tr: t('Я б хотів забронювати столик на двох.', 'Я бы хотел забронировать столик на двоих.', 'I would like to book a table for two.') },
          { pl: 'Na jakie nazwisko?', tr: t('На яке прізвище?', 'На какую фамилию?', 'In what name?') },
        ],
        words: ['zarezerwować', 'rezerwacja', 'stolik', 'osoba', 'na nazwisko', 'chciałbym', 'chciałabym', 'kolacja', 'wolny'],
        exercises: [
          wordChoice('vocab.restaurant', 'zarezerwować', [t('забронювати', 'забронировать', 'to book'), t('замовити', 'заказать', 'to order'), t('заплатити', 'заплатить', 'to pay')]),
          reverseChoice('vocab.restaurant', t('людина, особа', 'человек, персона', 'person'), ['osoba', 'kelner', 'stolik']),
          fillGap('grammar.accusative', 'Chciałbym zarezerwować stolik na ___ osoby.', ['dwie', 'dwa', 'dwóch'], t('Я б хотів забронювати столик на двох.', 'Я бы хотел забронировать столик на двоих.', 'I would like to book a table for two.')),
          fillGap('grammar.accusative', 'Na jakie ___?', ['nazwisko', 'nazwiska', 'nazwisku'], t('На яке прізвище?', 'На какую фамилию?', 'In what name?')),
          listen('listening.restaurant', 'Chciałbym zarezerwować stolik', ['Chciałbym zarezerwować stolik', 'Chciałbym zamówić kolację', 'Chciałbym zapłacić rachunek']),
          findError('grammar.accusative', ['Chciałabym', 'zarezerwować', 'stolik', 'na', 'dwa', 'osoby'], 4, t('Я б хотіла забронювати столик на двох.', 'Я бы хотела забронировать столик на двоих.', 'I would like to book a table for two.'),
            t('**osoba** — жіночий рід: **na dwie osoby**.', '**osoba** — женский род: **na dwie osoby**.', '**osoba** is feminine: **na dwie osoby**.')),
          dialogue('situation.restaurant', { name: 'Pan Tomek', emoji: '🤵🏻', role: t('офіціант', 'официант', 'a waiter') }, [
            {
              npc: 'Dzień dobry! Na ile osób?',
              tr: t('Добрий день! На скільки осіб?', 'Добрый день! На сколько человек?', 'Hello! For how many people?'),
              choose: [
                ['Na dwie osoby, proszę.', t('На дві особи, будь ласка.', 'На двоих, пожалуйста.', 'For two, please.')],
                ['Na dwa osoby, proszę.', t('(помилка у роді)', '(ошибка в роде)', '(wrong gender)')],
              ],
              feedback: t('**osoba** — жіночий рід: **dwie**.', '**osoba** — женский род: **dwie**.', '**osoba** is feminine: **dwie**.'),
            },
          ]),
          build('vocab.restaurant', 'Chciałbym zarezerwować stolik na jutro.', t('Я б хотів забронювати столик на завтра.', 'Я бы хотел забронировать столик на завтра.', 'I would like to book a table for tomorrow.'), ['wolny', 'kolacja']),
          translate('writing.restaurant', t('Чи є вільний столик на сьогодні?', 'Есть ли свободный столик на сегодня?', 'Is there a free table for today?'), ['Czy jest wolny stolik na dzisiaj?', 'Czy jest wolny stolik na dziś?']),
        ],
      },
      {
        slug: 'wro-12-smaki',
        title: t('Смаки', 'Вкусы', 'Tastes'),
        topic: t('Смаки і smakuje mi (давальний відмінок)', 'Вкусы и smakuje mi (дательный падеж)', 'Tastes and smakuje mi (dative)'),
        cefr: 'A2',
        difficulty: 3,
        explanation: t(
          'Щоб сказати, що щось смакує, кажуть **smakuje mi** (мені смакує): **mi** — давальний відмінок. Якщо страв кілька, дієслово у множині: **smakują mi pierogi**.\nСмаки: **słony** (солоний), **ostry** (гострий), **kwaśny** (кислий), **słodki** (солодкий), **gorzki** (гіркий).',
          'Чтобы сказать, что что-то нравится на вкус, говорят **smakuje mi** (мне нравится на вкус): **mi** — дательный падеж. Если блюд несколько, глагол во множественном: **smakują mi pierogi**.\nВкусы: **słony** (солёный), **ostry** (острый), **kwaśny** (кислый), **słodki** (сладкий), **gorzki** (горький).',
          'To say that something tastes good use **smakuje mi** ("it tastes good to me"): **mi** is the dative. For several dishes the verb is plural: **smakują mi pierogi**.\nTastes: **słony** (salty), **ostry** (spicy), **kwaśny** (sour), **słodki** (sweet), **gorzki** (bitter).',
        ),
        examples: [
          { pl: 'Bardzo mi smakuje ten barszcz.', tr: t('Мені дуже смакує цей борщ.', 'Мне очень нравится этот борщ.', 'I really like this borscht.') },
          { pl: 'Ten barszcz jest kwaśny.', tr: t('Цей борщ кислий.', 'Этот борщ кислый.', 'This borscht is sour.') },
        ],
        words: ['słony', 'ostry', 'kwaśny', 'słodki', 'gorzki', 'smakować', 'pyszny', 'danie dnia', 'lody'],
        exercises: [
          wordChoice('vocab.taste', 'słony', [t('солоний', 'соленый', 'salty'), t('солодкий', 'сладкий', 'sweet'), t('гіркий', 'горький', 'bitter')]),
          reverseChoice('vocab.taste', t('гострий', 'острый', 'spicy'), ['ostry', 'słony', 'kwaśny']),
          fillGap('grammar.dative', 'Bardzo ___ smakuje ten barszcz.', ['mi', 'mnie', 'ja'], t('Мені дуже смакує цей борщ.', 'Мне очень нравится этот борщ.', 'I really like this borscht.')),
          findError('grammar.adjectives', ['Barszcz', 'jest', 'kwaśna'], 2, t('Борщ кислий.', 'Борщ кислый.', 'The borscht is sour.'),
            t('**barszcz** — чоловічий рід: **kwaśny**.', '**barszcz** — мужской род: **kwaśny**.', '**barszcz** is masculine: **kwaśny**.')),
          oddOne('vocab.taste', ['lody', 'ciasto', 'deser', 'zupa'], 3, t('**zupa** — суп, несолодка страва. Інші — солодке.', '**zupa** — суп, несладкое блюдо. Остальные — сладкое.', '**zupa** is soup, not sweet. The others are sweet.'), t('Що не солодке?', 'Что не сладкое?', 'Which one is not sweet?')),
          listen('listening.taste', 'Smakuje mi', ['Smakuje mi', 'Smakuje mnie', 'Smakuje ci']),
          build('grammar.dative', 'Te pierogi bardzo mi smakują.', t('Ці вареники мені дуже смакують.', 'Эти пельмени мне очень нравятся.', 'I really like these pierogi.'), ['smakuje', 'kwaśny']),
          translate('writing.taste', t('Мені дуже смакує суп.', 'Мне очень нравится суп.', 'I really like the soup.'), ['Bardzo mi smakuje zupa', 'Zupa bardzo mi smakuje', 'Bardzo mi smakuje zupa.']),
          match('vocab.taste', [['ostry', t('гострий', 'острый', 'spicy')], ['słodki', t('солодкий', 'сладкий', 'sweet')], ['lody', t('морозиво', 'мороженое', 'ice cream')], ['danie dnia', t('страва дня', 'блюдо дня', 'dish of the day')]]),
        ],
      },
      {
        slug: 'wro-13-krasnale',
        title: t('Вроцлавські гноми', 'Вроцлавские гномы', 'Wrocław gnomes'),
        topic: t('Гноми на вулицях, szukać + родовий відмінок', 'Гномы на улицах, szukać + родительный падеж', 'Gnomes in the streets, szukać + genitive'),
        cefr: 'A2',
        difficulty: 3,
        explanation: t(
          'У Вроцлаві сотні бронзових гномів (**krasnale**). Після **szukam** (я шукаю) стоїть родовий відмінок: **Szukam krasnala.**\nДля чоловічих істот знахідний збігається з родовим: **Nie mogę znaleźć tego krasnala.** (Я не можу знайти цього гнома.)',
          'Во Вроцлаве сотни бронзовых гномов (**krasnale**). После **szukam** (я ищу) стоит родительный падеж: **Szukam krasnala.**\nДля мужских одушевлённых существительных винительный совпадает с родительным: **Nie mogę znaleźć tego krasnala.** (Я не могу найти этого гнома.)',
          'Wrocław has hundreds of bronze gnomes (**krasnale**). After **szukam** ("I am looking for") the genitive is used: **Szukam krasnala.**\nFor masculine animate nouns the accusative looks like the genitive: **Nie mogę znaleźć tego krasnala.** ("I can\'t find this gnome.")',
        ),
        examples: [
          { pl: 'Szukam krasnala na Rynku.', tr: t('Шукаю гнома на Ринку.', 'Ищу гнома на Рынке.', 'I am looking for a gnome on the Market Square.') },
          { pl: 'Zrobię zdjęcie tego krasnala.', tr: t('Сфотографую цього гнома.', 'Сфотографирую этого гнома.', 'I will take a photo of this gnome.') },
        ],
        words: ['krasnal', 'wyspa', 'zdjęcie', 'znaleźć', 'most', 'rynek', 'szukać'],
        exercises: [
          wordChoice('vocab.city', 'krasnal', [t('гном', 'гном', 'gnome'), t('міст', 'мост', 'bridge'), t('острів', 'остров', 'island')]),
          fillGap('grammar.genitive', 'Szukam ___.', ['krasnala', 'krasnal', 'krasnalem'], t('Я шукаю гнома.', 'Я ищу гнома.', 'I am looking for a gnome.')),
          reverseChoice('vocab.city', t('фото', 'фото', 'photo'), ['zdjęcie', 'krasnal', 'most']),
          findError('grammar.accusative', ['Nie', 'mogę', 'znaleźć', 'tego', 'krasnal'], 4, t('Я не можу знайти цього гнома.', 'Я не могу найти этого гнома.', 'I can\'t find this gnome.'),
            t('**krasnal** — одушевлений чоловічий рід: знахідний — **krasnala**.', '**krasnal** — одушевлённый мужской род: винительный — **krasnala**.', '**krasnal** is an animate masculine noun: the accusative is **krasnala**.')),
          oddOne('vocab.city', ['most', 'wyspa', 'rynek', 'krasnal'], 3, t('**krasnal** — гном, фігурка, а не місце.', '**krasnal** — гном, фигурка, а не место.', '**krasnal** is a gnome figure, not a place.'), t('Що зайве? (місця)', 'Что лишнее? (места)', 'Which one is not a place?')),
          listen('listening.city', 'Zrobię zdjęcie', ['Zrobię zdjęcie', 'Zrobię zakupy', 'Zrobię rezerwację']),
          translate('writing.city', t('Де можна знайти гнома?', 'Где можно найти гнома?', 'Where can I find the gnome?'), ['Gdzie mogę znaleźć krasnala?', 'Gdzie można znaleźć krasnala?']),
          dictation('writing.city', 'Zrobię zdjęcie tego krasnala.', t('Сфотографую цього гнома.', 'Сфотографирую этого гнома.', 'I will take a photo of this gnome.')),
        ],
      },
    ],
  },
  {
    slug: 'wro-prezenty',
    title: t('Подарунки і порівняння', 'Подарки и сравнения', 'Gifts and comparisons'),
    description: t('Подарунок, «подобається мені» і що краще', 'Подарок, «мне нравится» и что лучше', 'A gift, "I like" and which is better'),
    icon: 'gift',
    lessons: [
      {
        slug: 'wro-14-prezent',
        title: t('Вибираємо подарунок', 'Выбираем подарок', 'Choosing a gift'),
        topic: t('Podoba mi się і dla + родовий відмінок', 'Podoba mi się и dla + родительный падеж', 'Podoba mi się and dla + genitive'),
        cefr: 'A2',
        difficulty: 3,
        explanation: t(
          'Щоб сказати, що щось подобається, кажуть **Podoba mi się…** (мені подобається…): **Podoba mi się ten szalik.** Для множини: **Podobają mi się te buty.**\nДля кого подарунок — **dla** + родовий: **dla mamy** (для мами).',
          'Чтобы сказать, что нравится, говорят **Podoba mi się…** (мне нравится…): **Podoba mi się ten szalik.** Для множественного: **Podobają mi się te buty.**\nДля кого подарок — **dla** + родительный: **dla mamy** (для мамы).',
          'To say you like something use **Podoba mi się…** ("I like…"): **Podoba mi się ten szalik.** With a plural item: **Podobają mi się te buty.**\nFor whom the gift is: **dla** + genitive: **dla mamy** ("for Mum").',
        ),
        examples: [
          { pl: 'To jest prezent dla mamy.', tr: t('Це подарунок для мами.', 'Это подарок для мамы.', 'This is a present for Mum.') },
          { pl: 'Czy może pani to zapakować?', tr: t('Чи можете ви це запакувати?', 'Вы можете это упаковать?', 'Could you wrap this, please?') },
        ],
        words: ['prezent', 'podobać się', 'zapakować', 'wybrać', 'pamiątka'],
        exercises: [
          wordChoice('vocab.gifts', 'prezent', [t('подарунок', 'подарок', 'gift'), t('покупка', 'покупка', 'purchase'), t('чек', 'чек', 'receipt')]),
          fillGap('grammar.dative', 'Podoba ___ się ten szalik.', ['mi', 'mnie', 'ja'], t('Мені подобається цей шарф.', 'Мне нравится этот шарф.', 'I like this scarf.')),
          findError('grammar.dative', ['Podoba', 'mnie', 'się', 'ten', 'szalik'], 1, t('Мені подобається цей шарф.', 'Мне нравится этот шарф.', 'I like this scarf.'),
            t('Після **podoba się** — **mi**, а не **mnie**.', 'После **podoba się** — **mi**, а не **mnie**.', 'After **podoba się** it is **mi**, not **mnie**.')),
          fillGap('grammar.genitive', 'To jest prezent dla ___.', ['mamy', 'mama', 'mamę'], t('Це подарунок для мами.', 'Это подарок для мамы.', 'This is a present for Mum.')),
          reverseChoice('vocab.gifts', t('запакувати', 'упаковать', 'to wrap'), ['zapakować', 'wybrać', 'kupić']),
          build('vocab.gifts', 'Czy może pani to zapakować?', t('Чи можете ви це запакувати?', 'Вы можете это упаковать?', 'Could you wrap this, please?'), ['podobać', 'paragon']),
          dictation('writing.gifts', 'Podobają mi się te buty.', t('Мені подобаються ці черевики.', 'Мне нравятся эти ботинки.', 'I like these shoes.')),
          match('vocab.gifts', [['wybrać', t('вибрати', 'выбрать', 'to choose')], ['pamiątka', t('сувенір', 'сувенир', 'souvenir')], ['zapakować', t('запакувати', 'упаковать', 'to wrap')], ['prezent', t('подарунок', 'подарок', 'gift')]]),
        ],
      },
      {
        slug: 'wro-15-porownanie',
        title: t('Що краще?', 'Что лучше?', 'Which is better?'),
        topic: t('Вищий ступінь прикметників і niż', 'Сравнительная степень прилагательных и niż', 'Comparative adjectives and niż'),
        cefr: 'A2',
        difficulty: 4,
        explanation: t(
          'Вищий ступінь: **tańszy** (дешевший), **droższy** (дорожчий), **lepszy** (кращий), **większy** (більший). Він узгоджується за родом: **tańszy** (чоловічий), **tańsza** (жіночий), **tańsze** (середній рід і множина).\nДля порівняння ставимо **niż**: **Ta kurtka jest tańsza niż tamta.** — «Ця куртка дешевша, ніж та».',
          'Сравнительная степень: **tańszy** (дешевле), **droższy** (дороже), **lepszy** (лучше), **większy** (больше). Она согласуется по роду: **tańszy** (мужской), **tańsza** (женский), **tańsze** (средний род и множественное).\nДля сравнения используем **niż**: **Ta kurtka jest tańsza niż tamta.** — «Эта куртка дешевле, чем та».',
          'Comparative adjectives: **tańszy** (cheaper), **droższy** (more expensive), **lepszy** (better), **większy** (bigger). They agree in gender: **tańszy** (masculine), **tańsza** (feminine), **tańsze** (neuter and plural).\nTo compare use **niż** ("than"): **Ta kurtka jest tańsza niż tamta.** — "This jacket is cheaper than that one."',
        ),
        examples: [
          { pl: 'Ten sweter jest droższy niż tamten.', tr: t('Цей светр дорожчий, ніж той.', 'Этот свитер дороже, чем тот.', 'This sweater is more expensive than that one.') },
          { pl: 'Wolę tę kurtkę, bo jest lepsza.', tr: t('Я вибираю цю куртку, бо вона краща.', 'Я выберу эту куртку, потому что она лучше.', 'I prefer this jacket because it\'s better.') },
        ],
        words: ['tańszy', 'droższy', 'lepszy', 'najlepszy', 'modny', 'wybrać'],
        exercises: [
          wordChoice('vocab.compare', 'tańszy', [t('дешевший', 'дешевле', 'cheaper'), t('дорожчий', 'дороже', 'more expensive'), t('кращий', 'лучше', 'better')]),
          fillGap('grammar.adjectives', 'Ta kurtka jest ___ niż tamta.', ['tańsza', 'tańszy', 'tańsze'], t('Ця куртка дешевша, ніж та.', 'Эта куртка дешевле, чем та.', 'This jacket is cheaper than that one.')),
          reverseChoice('vocab.compare', t('найкращий', 'лучший', 'the best'), ['najlepszy', 'lepszy', 'modny']),
          findError('grammar.adjectives', ['Ten', 'sweter', 'jest', 'droższa', 'niż', 'tamten'], 3, t('Цей светр дорожчий, ніж той.', 'Этот свитер дороже, чем тот.', 'This sweater is more expensive than that one.'),
            t('**sweter** — чоловічий рід: **droższy**.', '**sweter** — мужской род: **droższy**.', '**sweter** is masculine: **droższy**.')),
          oddOne('vocab.compare', ['tańszy', 'droższy', 'lepszy', 'modny'], 3, t('**modny** — звичайна форма, а не вищий ступінь.', '**modny** — обычная форма, а не сравнительная.', '**modny** is in the base form, not the comparative.'), t('Що зайве? (вищий ступінь)', 'Что лишнее? (сравнительная степень)', 'Which one is not a comparative?')),
          build('grammar.adjectives', 'Wolę tę kurtkę, bo jest lepsza.', t('Я вибираю цю куртку, бо вона краща.', 'Я выберу эту куртку, потому что она лучше.', 'I prefer this jacket because it\'s better.'), ['tańszy', 'droższa']),
          listen('listening.compare', 'najlepszy wybór', ['najlepszy wybór', 'najmniejszy wybór', 'najtańszy wybór']),
          match('vocab.compare', [['droższy', t('дорожчий', 'дороже', 'more expensive')], ['tańszy', t('дешевший', 'дешевле', 'cheaper')], ['lepszy', t('кращий', 'лучше', 'better')], ['modny', t('модний', 'модный', 'fashionable')]]),
        ],
      },
    ],
  },
  {
    slug: 'wro-powtorka',
    title: t('Повторення: Вроцлав', 'Повторение: Вроцлав', 'Review: Wrocław'),
    description: t('Усе теми Вроцлава в одному уроці', 'Все темы Вроцлава в одном уроке', 'Every Wrocław topic in one lesson'),
    icon: 'lessons',
    lessons: [
      {
        slug: 'wro-16-powtorka',
        title: t('Повторення Вроцлава', 'Повторение Вроцлава', 'Wrocław review'),
        topic: t('Усі теми уроків 5–15', 'Все темы уроков 5–15', 'All topics of lessons 5–15'),
        cefr: 'A2',
        difficulty: 4,
        explanation: t(
          'Повторюємо все з Вроцлава: одяг і примірку, повернення, ринок і ціни, столик, смаки, гномів, подарунки. Нових слів у цьому уроці немає: усе вже знайоме.',
          'Повторяем всё из Вроцлава: одежда и примерка, возврат, рынок и цены, столик, вкусы, гномы, подарки. Новых слов в этом уроке нет: всё уже знакомо.',
          'We review everything from Wrocław: clothes and fitting rooms, returns, the market and prices, a table, tastes, gnomes and gifts. There are no new words in this lesson: everything is already familiar.',
        ),
        examples: [
          { pl: 'Wczoraj byłam na Hali Targowej.', tr: t('Учора я була на ринку Hala Targowa.', 'Вчера я была на рынке Hala Targowa.', 'Yesterday I was at the Hala Targowa market.') },
        ],
        words: [],
        exercises: [
          reading('reading.review', 'Wczoraj byłam na Hali Targowej. Kupiłam pół kilo truskawek, dwie butelki wody i szalik. Zapłaciłam kartą.',
            t('Як заплатила?', 'Как заплатила?', 'How did she pay?'),
            [t('Карткою', 'Картой', 'By card'), t('Готівкою', 'Наличными', 'In cash'), t('Телефоном', 'Телефоном', 'With a phone')]),
          dialogue('situation.review', { name: 'Pani Magda', emoji: '👩🏼‍💼', role: t('касирка', 'кассирша', 'a cashier') }, [
            {
              npc: 'Płaci pani kartą czy gotówką?',
              tr: t('Ви платите карткою чи готівкою?', 'Вы платите картой или наличными?', 'Will you pay by card or in cash?'),
              choose: [
                ['Kartą, proszę.', t('Карткою, будь ласка.', 'Картой, пожалуйста.', 'By card, please.')],
                ['Kartę, proszę.', t('(помилка у відмінку)', '(ошибка в падеже)', '(wrong case)')],
              ],
              feedback: t('Чим? — **kartą** (орудний відмінок).', 'Чем? — **kartą** (творительный падеж).', 'With what? — **kartą** (instrumental).'),
            },
          ]),
          fillGap('grammar.dative', 'Podoba ___ się ten kolor?', ['ci', 'cię', 'ty'], t('Тобі подобається цей колір?', 'Тебе нравится этот цвет?', 'Do you like this colour?')),
          findError('grammar.numerals', ['Poproszę', 'dwie', 'kawa'], 2, t('Дві кави, будь ласка.', 'Два кофе, пожалуйста.', 'Two coffees, please.'),
            t('Після **dwie** (2–4) — родовий однини: **kawy**.', 'После **dwie** (2–4) — родительный единственного: **kawy**.', 'After **dwie** (2–4) the genitive singular is used: **kawy**.')),
          match('vocab.review', [['paragon', t('чек', 'чек', 'receipt')], ['reszta', t('решта', 'сдача', 'change')], ['rozmiar', t('розмір', 'размер', 'size')], ['przymierzalnia', t('примірочна', 'примерочная', 'fitting room')], ['krasnal', t('гном', 'гном', 'gnome')], ['wyprzedaż', t('розпродаж', 'распродажа', 'sale')]]),
          listen('listening.review', 'Ile kosztuje ta koszula?', ['Ile kosztuje ta koszula?', 'Ile kosztuje ta kolacja?', 'Ile kosztuje ta kawa?']),
          build('vocab.review', 'Czy mogę zapłacić kartą?', t('Чи можна заплатити карткою?', 'Можно заплатить картой?', 'Can I pay by card?'), ['gotówką', 'reszta']),
          translate('writing.review', t('Мені потрібен більший розмір, будь ласка.', 'Мне нужен размер побольше, пожалуйста.', 'I need a bigger size, please.'), ['Szukam większego rozmiaru, proszę.', 'Potrzebuję większego rozmiaru.', 'Szukam większego rozmiaru']),
          dictation('writing.review', 'Chciałbym zarezerwować stolik na dwie osoby.', t('Я б хотів забронювати столик на двох.', 'Я бы хотел забронировать столик на двоих.', 'I would like to book a table for two.')),
        ],
      },
    ],
  },
];
