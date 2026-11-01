/**
 * Словник Білостока (B1): повсякденні ситуації — зворотні дієслова в розпорядку дня (spieszyć się, spotykać się z, kłaść się),
 * дієслова з відмінками (cieszyć się z + родовий, martwić się o + знахідний, przyzwyczaić się do + родовий), лікар (boli mnie…,
 * czuję się, dolegać), аптека (dawkowanie, bez recepty, po jedzeniu), перукар (umówić się do fryzjera, ostrzyc się), ремонт
 * (telefon zepsuł się, rozładować się), Біловезька пуща і зубр (najstarszy, największy, jeden z…), Заменгоф і есперанто
 * (urodził się, stworzył, chociaż), кухня Підляшшя (kartacze, babka ziemniaczana).
 * Слова wstawać, skierowanie, bez recepty, po jedzeniu, budzić się, ubierać się, myć się, spóźnić się, bać się, interesować się, urodzić się, umówić się, boleć, kaszel, katar, gorączka,
 * gardło, recepta, tabletka, syrop, uczulony, naprawić, zepsuty, gwarancja, paragon, wymienić, odebrać, park, las, termin, szlak, przewodnik,
 * zakaz вже є в словнику.
 */
import { w } from './vocab-city';
import type { VocabSeed } from './vocab';

export const BIALYSTOK_VOCAB: VocabSeed[] = [
  // ── Ранок і поспіх: зворотні дієслова ──
  w('spieszyć się', 'verb', 'A2', 'поспішати', 'спешить', 'to be in a hurry', ['daily'],
    ['Spieszę się, bo za dziesięć minut mam pociąg.', 'Я поспішаю, бо за десять хвилин у мене потяг.', 'Я спешу, потому что через десять минут у меня поезд.', 'I’m in a hurry because my train leaves in ten minutes.'], { ja: 'spieszę się', past: 'spieszył się' }),
  w('spotykać się', 'verb', 'A2', 'зустрічатися', 'встречаться', 'to meet (up)', ['daily', 'people'],
    ['W piątki spotykam się z przyjaciółmi w kawiarni.', 'У пʼятницю я зустрічаюся з друзями в кафе.', 'По пятницам я встречаюсь с друзьями в кафе.', 'On Fridays I meet my friends at a café.'], { ja: 'spotykam się', past: 'spotykał się' }),
  w('kłaść się', 'verb', 'B1', 'лягати', 'ложиться', 'to lie down, to go to bed', ['daily'],
    ['Zwykle kładę się spać przed północą.', 'Зазвичай я лягаю спати до півночі.', 'Обычно я ложусь спать до полуночи.', 'I usually go to bed before midnight.'], { ja: 'kładę się', past: 'kładł się' }),
  w('pomylić się', 'verb', 'B1', 'помилитися', 'ошибиться', 'to make a mistake', ['daily', 'phrases'],
    ['Przepraszam, pomyliłem się: spotkanie jest we wtorek.', 'Вибачте, я помилився: зустріч у вівторок.', 'Извините, я ошибся: встреча во вторник.', 'Sorry, I made a mistake: the meeting is on Tuesday.'], { ja: 'pomylę się', past: 'pomylił się' }),

  // ── Дієслова з відмінками ──
  w('cieszyć się', 'verb', 'B1', 'радіти', 'радоваться', 'to be glad', ['daily', 'phrases'],
    ['Cieszę się z twojego sukcesu.', 'Я радію твоєму успіху.', 'Я радуюсь твоему успеху.', 'I’m happy about your success.'], { ja: 'cieszę się', past: 'cieszył się' }),
  w('martwić się', 'verb', 'B1', 'турбуватися, непокоїтися', 'беспокоиться', 'to worry', ['daily', 'phrases'],
    ['Martwię się o zdrowie babci.', 'Я турбуюся про здоровʼя бабусі.', 'Я беспокоюсь о здоровье бабушки.', 'I’m worried about my grandmother’s health.'], { ja: 'martwię się', past: 'martwił się' }),
  w('przyzwyczaić się', 'verb', 'B1', 'звикнути', 'привыкнуть', 'to get used to', ['daily', 'phrases'],
    ['Szybko przyzwyczaiłem się do nowej pracy.', 'Я швидко звик до нової роботи.', 'Я быстро привык к новой работе.', 'I quickly got used to the new job.'], { ja: 'przyzwyczaję się', past: 'przyzwyczaił się' }),
  w('śmiać się', 'verb', 'A2', 'сміятися', 'смеяться', 'to laugh', ['daily'],
    ['Nie śmiej się z mojego akcentu!', 'Не смійся з мого акценту!', 'Не смейся над моим акцентом!', 'Don’t laugh at my accent!'], { ja: 'śmieję się', past: 'śmiał się' }),
  w('zgodzić się', 'verb', 'B1', 'погодитися', 'согласиться', 'to agree', ['daily', 'phrases'],
    ['Zgodziłem się z nim, że to dobry pomysł.', 'Я погодився з ним, що це добра ідея.', 'Я согласился с ним, что это хорошая идея.', 'I agreed with him that it’s a good idea.'], { ja: 'zgodzę się', past: 'zgodził się' }),

  // ── Лікар ──
  w('przeziębienie', 'noun', 'B1', 'застуда', 'простуда', 'a cold', ['medicine'],
    ['Mam przeziębienie i kaszel od trzech dni.', 'У мене застуда й кашель уже три дні.', 'У меня простуда и кашель уже три дня.', 'I’ve had a cold and a cough for three days.'], { gen: 'przeziębienia' }),
  w('dolegać', 'verb', 'B1', 'турбувати (про недугу), боліти', 'беспокоить (о недуге)', 'to ail, to be the trouble', ['medicine'],
    ['Co panu dolega?', 'Що вас турбує?', 'Что вас беспокоит?', 'What seems to be the trouble?'], { he: 'dolega' }),
  w('czuć się', 'verb', 'A2', 'почуватися', 'чувствовать себя', 'to feel (well, ill)', ['medicine', 'daily'],
    ['Czuję się słabo od rana.', 'Я почуваюся кепсько з ранку.', 'Я плохо себя чувствую с утра.', 'I’ve felt weak since this morning.'], { ja: 'czuję się', past: 'czuł się' }),
  w('objaw', 'noun', 'B1', 'симптом', 'симптом', 'symptom', ['medicine'],
    ['Gorączka i kaszel to typowe objawy grypy.', 'Температура й кашель — типові симптоми грипу.', 'Температура и кашель — типичные симптомы гриппа.', 'A fever and a cough are typical flu symptoms.'], { pl: 'objawy' }),
  w('zbadać', 'verb', 'B1', 'оглянути, обстежити', 'осмотреть, обследовать', 'to examine', ['medicine'],
    ['Doktor zbada cię i sprawdzi gardło.', 'Лікар огляне тебе й перевірить горло.', 'Врач осмотрит тебя и проверит горло.', 'The doctor will examine you and check your throat.'], { ja: 'zbadam', past: 'zbadał' }),

  // ── Аптека ──
  w('krople', 'noun', 'A2', 'краплі', 'капли', 'drops', ['medicine'],
    ['Te krople do nosa bierze się trzy razy dziennie.', 'Ці краплі для носа приймають тричі на день.', 'Эти капли для носа принимают три раза в день.', 'You take these nose drops three times a day.']),
  w('ulotka', 'noun', 'B1', 'інструкція-вкладка до ліків', 'вкладыш-инструкция к лекарству', 'package leaflet', ['medicine'],
    ['Przeczytaj ulotkę przed pierwszą tabletką.', 'Прочитай інструкцію перед першою таблеткою.', 'Прочитай инструкцию перед первой таблеткой.', 'Read the leaflet before the first tablet.'], { acc: 'ulotkę' }),
  w('dawkowanie', 'noun', 'B1', 'дозування', 'дозировка', 'dosage', ['medicine'],
    ['Dawkowanie: dwa razy dziennie po jednej tabletce.', 'Дозування: двічі на день по одній таблетці.', 'Дозировка: два раза в день по одной таблетке.', 'Dosage: one tablet twice a day.']),
  w('lek', 'noun', 'A2', 'ліки, препарат', 'лекарство, препарат', 'medicine, drug', ['medicine'],
    ['Ten lek kupisz w każdej aptece.', 'Ці ліки можна купити в будь-якій аптеці.', 'Это лекарство можно купить в любой аптеке.', 'You can buy this medicine at any pharmacy.'], { pl: 'leki' }),

  // ── Перукар і записи ──
  w('fryzjer', 'noun', 'A2', 'перукар', 'парикмахер', 'hairdresser', ['daily'],
    ['Umówiłem się do fryzjera na sobotę.', 'Я записався до перукаря на суботу.', 'Я записался к парикмахеру на субботу.', 'I booked a hairdresser for Saturday.'], { gen: 'fryzjera' }),
  w('wizyta', 'noun', 'A2', 'візит, запис на прийом', 'визит, приём (по записи)', 'appointment, visit', ['daily', 'medicine'],
    ['Mam wizytę u dentysty o dziesiątej.', 'У мене візит до стоматолога о десятій.', 'У меня приём у стоматолога в десять.', 'I have a dentist appointment at ten.'], { pl: 'wizyty' }),
  w('strzyżenie', 'noun', 'B1', 'стрижка (послуга)', 'стрижка (услуга)', 'haircut (the service)', ['daily'],
    ['Ile kosztuje strzyżenie męskie?', 'Скільки коштує чоловіча стрижка?', 'Сколько стоит мужская стрижка?', 'How much is a men’s haircut?'], { gen: 'strzyżenia' }),
  w('ostrzyc się', 'verb', 'B1', 'підстригтися', 'подстричься', 'to get a haircut', ['daily'],
    ['Chcę się ostrzyc, ale nie za krótko.', 'Я хочу підстригтися, але не надто коротко.', 'Я хочу подстричься, но не слишком коротко.', 'I want a haircut, but not too short.'], { ja: 'ostrzygę się', past: 'ostrzygł się' }),
  w('włosy', 'noun', 'A1', 'волосся', 'волосы', 'hair', ['daily'],
    ['Mam długie włosy i chcę je skrócić.', 'У мене довге волосся, і я хочу його вкоротити.', 'У меня длинные волосы, и я хочу их укоротить.', 'I have long hair and want to shorten it.']),
  w('wolny termin', 'phrase', 'A2', 'вільний час для запису', 'свободное время для записи', 'a free slot', ['daily', 'phrases'],
    ['Czy jest wolny termin w piątek?', 'Чи є вільний час у пʼятницю?', 'Есть ли свободное время в пятницу?', 'Is there a free slot on Friday?']),

  // ── Ремонт ──
  w('zepsuć się', 'verb', 'B1', 'зламатися', 'сломаться', 'to break down', ['daily'],
    ['Mój telefon zepsuł się wczoraj wieczorem.', 'Мій телефон зламався вчора ввечері.', 'Мой телефон сломался вчера вечером.', 'My phone broke down last night.'], { ja: 'zepsuję się', past: 'zepsuł się' }),
  w('naprawa', 'noun', 'B1', 'ремонт', 'ремонт', 'repair', ['daily', 'shopping'],
    ['Naprawa zajmie trzy dni robocze.', 'Ремонт займе три робочі дні.', 'Ремонт займёт три рабочих дня.', 'The repair will take three working days.'], { gen: 'naprawy' }),
  w('serwis', 'noun', 'B1', 'сервіс, майстерня', 'сервис, мастерская', 'service centre', ['shopping', 'daily'],
    ['Oddam laptopa do serwisu.', 'Віддам ноутбук у сервіс.', 'Отдам ноутбук в сервис.', 'I’ll take the laptop to a service centre.'], { gen: 'serwisu' }),
  w('bateria', 'noun', 'A2', 'батарея, акумулятор', 'батарея, аккумулятор', 'battery', ['daily', 'shopping'],
    ['Bateria w telefonie szybko się rozładowuje.', 'Батарея в телефоні швидко розряджається.', 'Батарея в телефоне быстро разряжается.', 'The phone battery drains quickly.']),
  w('rozładować się', 'verb', 'B1', 'розрядитися', 'разрядиться', 'to run flat', ['daily'],
    ['Telefon rozładował się w drodze do pracy.', 'Телефон розрядився по дорозі на роботу.', 'Телефон разрядился по дороге на работу.', 'The phone ran out of battery on the way to work.'], { ja: 'rozładuję się', past: 'rozładował się' }),
  w('pęknięty', 'adj', 'B1', 'тріснутий', 'треснувший', 'cracked', ['daily'],
    ['Mam pęknięty ekran i nie działa dotyk.', 'У мене тріснутий екран, і не працює сенсор.', 'У меня треснувший экран, и не работает сенсор.', 'I have a cracked screen and the touch doesn’t work.'], { f: 'pęknięta' }),

  // ── Пуща і зубр ──
  w('żubr', 'noun', 'A2', 'зубр', 'зубр', 'European bison', ['nature'],
    ['Żubr to największy ssak lądowy w Europie.', 'Зубр — найбільший наземний ссавець в Європі.', 'Зубр — самое крупное наземное млекопитающее в Европе.', 'The bison is the largest land mammal in Europe.'], { pl: 'żubry' }),
  w('puszcza', 'noun', 'B1', 'пуща', 'пуща', 'primeval forest', ['nature'],
    ['Puszcza Białowieska to jeden z najstarszych lasów w Europie.', 'Біловезька пуща — один з найстаріших лісів Європи.', 'Беловежская пуща — один из старейших лесов Европы.', 'The Białowieża Forest is one of the oldest forests in Europe.'], { gen: 'puszczy' }),
  w('chroniony', 'adj', 'B1', 'охоронюваний', 'охраняемый', 'protected', ['nature'],
    ['Żubr jest gatunkiem chronionym.', 'Зубр — охоронюваний вид.', 'Зубр — охраняемый вид.', 'The bison is a protected species.'], { f: 'chroniona' }),
  w('największy', 'adj', 'A2', 'найбільший', 'самый большой', 'the biggest', ['nature', 'grammar'],
    ['To największe jezioro w okolicy.', 'Це найбільше озеро в окрузі.', 'Это самое большое озеро в округе.', 'It’s the biggest lake in the area.'], { f: 'największa', n: 'największe' }),
  w('najstarszy', 'adj', 'A2', 'найстаріший', 'самый старый', 'the oldest', ['nature', 'grammar'],
    ['To najstarszy las w tym regionie.', 'Це найстаріший ліс у цьому регіоні.', 'Это самый старый лес в этом регионе.', 'It’s the oldest forest in this region.'], { f: 'najstarsza', n: 'najstarsze' }),
  w('ssak', 'noun', 'B1', 'ссавець', 'млекопитающее', 'mammal', ['nature'],
    ['Wilk i żubr to ssaki.', 'Вовк і зубр — ссавці.', 'Волк и зубр — млекопитающие.', 'The wolf and the bison are mammals.'], { pl: 'ssaki' }),

  // ── Заменгоф, Підляшшя ──
  w('esperanto', 'noun', 'B1', 'есперанто', 'эсперанто', 'Esperanto', ['people', 'city'],
    ['Esperanto stworzył Ludwik Zamenhof.', 'Есперанто створив Людвік Заменгоф.', 'Эсперанто создал Людвик Заменгоф.', 'Esperanto was created by Ludwik Zamenhof.']),
  w('stworzyć', 'verb', 'B1', 'створити', 'создать', 'to create', ['people', 'city'],
    ['Chciał stworzyć język dla wszystkich ludzi.', 'Він хотів створити мову для всіх людей.', 'Он хотел создать язык для всех людей.', 'He wanted to create a language for everyone.'], { ja: 'stworzę', past: 'stworzył' }),
  w('wydać', 'verb', 'B1', 'видати (книжку)', 'издать (книгу)', 'to publish', ['people', 'city'],
    ['W 1887 roku wydał pierwszy podręcznik esperanta.', 'У 1887 році він видав перший підручник есперанто.', 'В 1887 году он издал первый учебник эсперанто.', 'In 1887 he published the first Esperanto textbook.'], { ja: 'wydam', past: 'wydał' }),
  w('chociaż', 'conj', 'B1', 'хоча', 'хотя', 'although', ['grammar'],
    ['Chociaż pada deszcz, idziemy na spacer.', 'Хоча йде дощ, ми йдемо гуляти.', 'Хотя идёт дождь, мы идём гулять.', 'Although it’s raining, we’re going for a walk.']),
  w('kartacze', 'noun', 'B1', 'картачі (картопляні зрази)', 'картачи (картофельные зразы)', 'kartacze (potato dumplings)', ['food', 'dishes'],
    ['W Białymstoku zamów kartacze ze skwarkami.', 'У Білостоку замов картачі зі шкварками.', 'В Белостоке закажи картачи со шкварками.', 'In Białystok, order kartacze with crackling.'], { sg: 'kartacz' }),
  w('babka ziemniaczana', 'phrase', 'B1', 'картопляна бабка (запіканка)', 'картофельная бабка (запеканка)', 'potato babka (a baked potato dish)', ['food', 'dishes'],
    ['Babka ziemniaczana to typowa potrawa z Podlasia.', 'Картопляна бабка — типова страва Підляшшя.', 'Картофельная бабка — типичное блюдо Подляшья.', 'Potato babka is a typical dish from Podlasie.']),
];
