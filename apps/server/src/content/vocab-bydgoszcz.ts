/**
 * Словник Бидгоща (B1): минулий час у множині (byliśmy / byłyśmy, oni byli / one były), вид у минулому (czytałem /
 * przeczytałem), дитинство (kiedyś, na wsi, na podwórku), рух у минулому (poszedłem, pojechałem, dwa lata temu),
 * розповідь (najpierw, nagle, w końcu, zanim), біографія (urodziłem się, przeprowadziłem się), непряма мова (powiedział,
 * że…; zapytał, czy…), легенди міста (Łuczniczka, Pan Twardowski, Wyspa Młyńska).
 * Слова czytać, wczoraj, weekend, impreza, odwiedzić, zacząć, czytać, książka, film, kiedyś, dziecko, babcia, dziadek, pójść,
 * przyjechać, wyjechać, potem, szkoła, legenda, dawno temu, rzeka, most, wyspa, kamienica, rynek, historia, sąsiad уже є в словнику.
 */
import { w } from './vocab-city';
import type { VocabSeed } from './vocab';

export const BYDGOSZCZ_VOCAB: VocabSeed[] = [
  // ── Вихідні: минулий час у множині ──
  w('spędzić', 'verb', 'B1', 'провести (час)', 'провести (время)', 'to spend (time)', ['daily', 'time'],
    ['Jak spędziliście weekend?', 'Як ви провели вихідні?', 'Как вы провели выходные?', 'How did you spend the weekend?'], { past: 'spędził' }),
  w('wrócić', 'verb', 'A2', 'повернутися', 'вернуться', 'to come back', ['daily', 'travel'],
    ['Wróciliśmy do domu bardzo późno.', 'Ми повернулися додому дуже пізно.', 'Мы вернулись домой очень поздно.', 'We got home very late.'], { past: 'wrócił' }),
  w('zmęczony', 'adj', 'A2', 'втомлений', 'уставший', 'tired', ['daily', 'medicine'],
    ['Po imprezie wszyscy byli zmęczeni.', 'Після вечірки всі були втомлені.', 'После вечеринки все были уставшими.', 'Everyone was tired after the party.'], { f: 'zmęczona', pl: 'zmęczeni' }),
  w('przedwczoraj', 'adv', 'A2', 'позавчора', 'позавчера', 'the day before yesterday', ['time'],
    ['Przedwczoraj byłyśmy w operze.', 'Позавчора ми (жінки) були в опері.', 'Позавчера мы (женщины) были в опере.', 'The day before yesterday we went to the opera.']),
  w('zeszły', 'adj', 'A2', 'минулий (тиждень, рік)', 'прошлый (неделя, год)', 'last (week, year)', ['time'],
    ['W zeszłym tygodniu padał deszcz.', 'Минулого тижня падав дощ.', 'На прошлой неделе шёл дождь.', 'It rained last week.'], { f: 'zeszła', loc: 'zeszłym' }),

  // ── Вид у минулому ──
  w('przeczytać', 'verb', 'B1', 'прочитати', 'прочитать', 'to read (to the end)', ['daily'],
    ['Przeczytałam tę książkę w dwa dni.', 'Я прочитала цю книжку за два дні.', 'Я прочитала эту книгу за два дня.', 'I read the whole book in two days.'], { past: 'przeczytał' }),
  w('pisać', 'verb', 'A1', 'писати', 'писать', 'to write', ['daily'],
    ['Pisałem list do babci, kiedy zadzwoniłaś.', 'Я писав листа бабусі, коли ти подзвонила.', 'Я писал письмо бабушке, когда ты позвонила.', 'I was writing to Grandma when you called.'], { ja: 'piszę', past: 'pisał' }),
  w('napisać', 'verb', 'A2', 'написати', 'написать', 'to write (and finish)', ['daily', 'work'],
    ['Napisałem już raport.', 'Я вже написав звіт.', 'Я уже написал отчёт.', 'I’ve already written the report.'], { past: 'napisał' }),
  w('oglądać', 'verb', 'A1', 'дивитися (фільм, матч)', 'смотреть (фильм, матч)', 'to watch', ['daily'],
    ['Oglądaliśmy mecz do północy.', 'Ми дивилися матч до півночі.', 'Мы смотрели матч до полуночи.', 'We watched the match until midnight.'], { ja: 'oglądam', past: 'oglądał' }),
  w('obejrzeć', 'verb', 'B1', 'подивитися (до кінця)', 'посмотреть (до конца)', 'to watch (to the end)', ['daily'],
    ['Obejrzałaś ten film do końca?', 'Ти подивилася цей фільм до кінця?', 'Ты досмотрела этот фильм до конца?', 'Did you watch the film to the end?'], { past: 'obejrzał' }),
  w('skończyć', 'verb', 'A2', 'закінчити', 'закончить', 'to finish', ['daily', 'work'],
    ['Skończyłeś już pracę?', 'Ти вже закінчив роботу?', 'Ты уже закончил работу?', 'Have you finished work yet?'], { past: 'skończył' }),

  // ── Дитинство ──
  w('dzieciństwo', 'noun', 'B1', 'дитинство', 'детство', 'childhood', ['family'],
    ['W dzieciństwie mieszkałem u dziadków.', 'У дитинстві я жив у дідуся й бабусі.', 'В детстве я жил у бабушки с дедушкой.', 'As a child I lived with my grandparents.'], { loc: 'dzieciństwie' }),
  w('wieś', 'noun', 'A2', 'село', 'деревня, село', 'village, countryside', ['home', 'nature'],
    ['Każde wakacje spędzałam na wsi.', 'Кожні канікули я проводила в селі.', 'Каждые каникулы я проводила в деревне.', 'I spent every summer holiday in the countryside.'], { loc: 'wsi' }),
  w('podwórko', 'noun', 'B1', 'подвір’я, двір', 'двор', 'courtyard, backyard', ['home'],
    ['Graliśmy w piłkę na podwórku.', 'Ми грали у футбол на подвір’ї.', 'Мы играли в футбол во дворе.', 'We played football in the yard.'], { loc: 'podwórku' }),
  w('bawić się', 'verb', 'A2', 'гратися, розважатися', 'играть, веселиться', 'to play (kids), to have fun', ['family'],
    ['Dzieci bawiły się do wieczora.', 'Діти гралися до вечора.', 'Дети играли до вечера.', 'The children played until evening.'], { past: 'bawił się' }),
  w('wtedy', 'adv', 'A2', 'тоді', 'тогда', 'then, at that time', ['time'],
    ['Miałem wtedy dziesięć lat.', 'Мені тоді було десять років.', 'Мне тогда было десять лет.', 'I was ten at the time.']),

  // ── Рух у минулому ──
  w('pojechać', 'verb', 'A2', 'поїхати', 'поехать', 'to go (by vehicle)', ['travel', 'transport'],
    ['W sobotę pojechaliśmy nad Brdę.', 'У суботу ми поїхали на Брду.', 'В субботу мы поехали на Брду.', 'On Saturday we went to the Brda river.'], { past: 'pojechał' }),
  w('temu', 'adv', 'A2', 'тому (два роки тому)', 'назад (два года назад)', 'ago', ['time'],
    ['Przyjechałam do Polski dwa lata temu.', 'Я приїхала до Польщі два роки тому.', 'Я приехала в Польшу два года назад.', 'I came to Poland two years ago.']),
  w('niedawno', 'adv', 'B1', 'нещодавно', 'недавно', 'recently, not long ago', ['time'],
    ['Niedawno przeprowadziliśmy się do Bydgoszczy.', 'Нещодавно ми переїхали до Бидгоща.', 'Недавно мы переехали в Быдгощ.', 'We moved to Bydgoszcz recently.']),
  w('ostatnio', 'adv', 'B1', 'останнім часом; минулого разу', 'в последнее время; в прошлый раз', 'lately; last time', ['time'],
    ['Ostatnio rzadko chodzę do kina.', 'Останнім часом я рідко ходжу в кіно.', 'В последнее время я редко хожу в кино.', 'I rarely go to the cinema lately.']),

  // ── Розповідь ──
  w('najpierw', 'adv', 'A2', 'спочатку', 'сначала', 'first', ['time', 'phrases'],
    ['Najpierw zjedliśmy obiad, potem poszliśmy na spacer.', 'Спочатку ми пообідали, потім пішли на прогулянку.', 'Сначала мы пообедали, потом пошли гулять.', 'First we had lunch, then we went for a walk.']),
  w('nagle', 'adv', 'B1', 'раптом', 'вдруг', 'suddenly', ['phrases'],
    ['Nagle zgasło światło.', 'Раптом згасло світло.', 'Вдруг погас свет.', 'Suddenly the lights went out.']),
  w('w końcu', 'phrase', 'B1', 'нарешті, зрештою', 'наконец, в конце концов', 'finally, in the end', ['phrases'],
    ['W końcu znaleźliśmy hotel.', 'Нарешті ми знайшли готель.', 'Наконец мы нашли гостиницу.', 'In the end we found a hotel.']),
  w('zanim', 'conj', 'B1', 'перш ніж', 'прежде чем', 'before', ['phrases', 'grammar'],
    ['Zanim wyszedłem, zamknąłem okno.', 'Перш ніж вийти, я зачинив вікно.', 'Прежде чем выйти, я закрыл окно.', 'Before I left, I closed the window.']),
  w('wypadek', 'noun', 'B1', 'аварія, нещасний випадок', 'авария, несчастный случай', 'accident', ['transport', 'medicine'],
    ['Na moście był wypadek.', 'На мосту була аварія.', 'На мосту была авария.', 'There was an accident on the bridge.'], { gen: 'wypadku' }),
  w('zdarzyć się', 'verb', 'B1', 'статися, трапитися', 'случиться, произойти', 'to happen', ['phrases'],
    ['To zdarzyło się w zeszłą sobotę.', 'Це сталося минулої суботи.', 'Это случилось в прошлую субботу.', 'It happened last Saturday.'], { past: 'zdarzyło się' }),
  w('stać się', 'verb', 'B1', 'статися', 'случиться', 'to happen', ['phrases'],
    ['Co się stało?', 'Що сталося?', 'Что случилось?', 'What happened?'], { past: 'stało się' }),

  // ── Біографія ──
  w('urodzić się', 'verb', 'A2', 'народитися', 'родиться', 'to be born', ['family', 'documents'],
    ['Urodziłam się w Grodnie w 1998 roku.', 'Я народилася в Гродні 1998 року.', 'Я родилась в Гродно в 1998 году.', 'I was born in Grodno in 1998.'], { past: 'urodził się' }),
  w('przeprowadzić się', 'verb', 'B1', 'переїхати (на нове місце)', 'переехать (на новое место)', 'to move (house)', ['home', 'rent'],
    ['Przeprowadziliśmy się do Polski w 2022 roku.', 'Ми переїхали до Польщі 2022 року.', 'Мы переехали в Польшу в 2022 году.', 'We moved to Poland in 2022.'], { past: 'przeprowadził się' }),
  w('studia', 'noun', 'A2', 'навчання у виші', 'учёба в вузе', 'university studies', ['work', 'documents'],
    ['Po studiach zacząłem pracować w banku.', 'Після навчання в університеті я почав працювати в банку.', 'После учёбы в вузе я начал работать в банке.', 'After university I started working at a bank.'], { gen: 'studiów', loc: 'studiach' }),
  w('ślub', 'noun', 'A2', 'весілля, шлюб', 'свадьба, брак', 'wedding', ['family'],
    ['Wzięli ślub w zeszłym roku.', 'Вони одружилися минулого року.', 'Они поженились в прошлом году.', 'They got married last year.'], { gen: 'ślubu' }),
  w('emerytura', 'noun', 'B1', 'пенсія', 'пенсия', 'retirement; pension', ['work', 'documents'],
    ['Dziadek przeszedł na emeryturę w 2015 roku.', 'Дідусь вийшов на пенсію 2015 року.', 'Дедушка вышел на пенсию в 2015 году.', 'Grandpa retired in 2015.'], { acc: 'emeryturę' }),

  // ── Непряма мова ──
  w('powiedzieć', 'verb', 'A2', 'сказати', 'сказать', 'to say, to tell', ['phrases'],
    ['Marta powiedziała, że jest zmęczona.', 'Марта сказала, що втомилася.', 'Марта сказала, что устала.', 'Marta said she was tired.'], { past: 'powiedział' }),
  w('zapytać', 'verb', 'A2', 'запитати', 'спросить', 'to ask', ['phrases'],
    ['Szef zapytał, czy mam czas.', 'Шеф запитав, чи маю я час.', 'Шеф спросил, есть ли у меня время.', 'The boss asked if I had time.'], { past: 'zapytał' }),
  w('odpowiedzieć', 'verb', 'B1', 'відповісти', 'ответить', 'to answer', ['phrases'],
    ['Odpowiedziałem, że przyjdę jutro.', 'Я відповів, що прийду завтра.', 'Я ответил, что приду завтра.', 'I answered that I’d come tomorrow.'], { past: 'odpowiedział' }),
  w('podobno', 'adv', 'B1', 'кажуть, нібито', 'говорят, якобы', 'apparently, reportedly', ['phrases'],
    ['Podobno nowy sąsiad jest muzykiem.', 'Кажуть, новий сусід — музикант.', 'Говорят, новый сосед — музыкант.', 'Apparently the new neighbour is a musician.']),
  w('plotka', 'noun', 'B1', 'плітка', 'сплетня, слух', 'rumour, gossip', ['phrases', 'people'],
    ['To tylko plotka, nie wierz w to.', 'Це лише плітка, не вір у це.', 'Это просто слух, не верь.', 'It’s just a rumour, don’t believe it.']),

  // ── Легенди Бидгоща ──
  w('opowiadać', 'verb', 'A2', 'розповідати', 'рассказывать', 'to tell (a story)', ['phrases'],
    ['Babcia opowiadała nam legendy.', 'Бабуся розповідала нам легенди.', 'Бабушка рассказывала нам легенды.', 'Grandma used to tell us legends.'], { ja: 'opowiadam', past: 'opowiadał' }),
  w('opowiedzieć', 'verb', 'B1', 'розповісти', 'рассказать', 'to tell (to the end)', ['phrases'],
    ['Opowiedz mi, co się stało.', 'Розкажи мені, що сталося.', 'Расскажи мне, что случилось.', 'Tell me what happened.'], { past: 'opowiedział' }),
  w('diabeł', 'noun', 'B1', 'чорт, диявол', 'чёрт, дьявол', 'devil', ['city'],
    ['Twardowski podpisał umowę z diabłem.', 'Твардовський підписав угоду з чортом.', 'Твардовский подписал договор с чёртом.', 'Twardowski signed a pact with the devil.'], { ins: 'diabłem' }),
  w('czarnoksiężnik', 'noun', 'B1', 'чорнокнижник, чарівник', 'чернокнижник, колдун', 'sorcerer', ['city'],
    ['Pan Twardowski był czarnoksiężnikiem.', 'Пан Твардовський був чорнокнижником.', 'Пан Твардовский был чернокнижником.', 'Master Twardowski was a sorcerer.'], { ins: 'czarnoksiężnikiem' }),
  w('łuczniczka', 'noun', 'B1', 'лучниця', 'лучница', 'archer (woman)', ['city'],
    ['Łuczniczka stoi w parku od 1910 roku.', 'Лучниця стоїть у парку з 1910 року.', 'Лучница стоит в парке с 1910 года.', 'The Archer statue has stood in the park since 1910.']),
  w('młyn', 'noun', 'B1', 'млин', 'мельница', 'mill', ['city'],
    ['Na Wyspie Młyńskiej kiedyś pracowały młyny.', 'На Млиновому острові колись працювали млини.', 'На Мельничном острове когда-то работали мельницы.', 'Mills once worked on Mill Island.'], { pl: 'młyny' }),
  w('opera', 'noun', 'A2', 'опера, оперний театр', 'опера, оперный театр', 'opera, opera house', ['city', 'music'],
    ['Opera Nova stoi nad Brdą.', 'Опера Нова стоїть над Брдою.', 'Опера Нова стоит на берегу Брды.', 'Opera Nova stands on the Brda.'], { loc: 'operze' }),
  w('figurka', 'noun', 'B1', 'фігурка', 'фигурка', 'figurine', ['city'],
    ['W oknie kamienicy pokazuje się figurka Pana Twardowskiego.', 'У вікні кам’яниці з’являється фігурка пана Твардовського.', 'В окне дома появляется фигурка пана Твардовского.', 'A figure of Master Twardowski appears in a window on the square.']),
];
