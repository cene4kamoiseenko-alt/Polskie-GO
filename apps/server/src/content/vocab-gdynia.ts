/**
 * Словник Гдині (A2): грати в / на (grać w piłkę, grać na gitarze), заняття спортом (chodzić na basen, jeździć na
 * nartach), частота (raz w tygodniu, rzadko), абонемент у спортзал (karnet), матч (kibicować + давальний), вітрильний
 * спорт і віддієслівні іменники (pływanie, bieganie), травма (boli mnie kolano), хобі й вільний час.
 * Слова basen, rower, szatnia, zajęcia, zapisać się, wygrać, bramka, stadion, kurs, kamizelka, plecy, zbierać,
 * śpiewać, codziennie, często, nigdy, zawsze, mieć czas, umówić się, spotkać się уже є в словнику.
 */
import { w } from './vocab-city';
import type { VocabSeed } from './vocab';

export const GDYNIA_VOCAB: VocabSeed[] = [
  // ── Грати в / на ──
  w('grać', 'verb', 'A1', 'грати', 'играть', 'to play', ['sport', 'music'],
    ['W sobotę gramy w piłkę.', 'У суботу ми граємо у футбол.', 'В субботу мы играем в футбол.', 'On Saturday we play football.'], { ja: 'gram', ty: 'grasz' }),
  w('piłka nożna', 'noun', 'A1', 'футбол', 'футбол', 'football', ['sport'],
    ['Piłka nożna to najpopularniejszy sport w Polsce.', 'Футбол — найпопулярніший спорт у Польщі.', 'Футбол — самый популярный спорт в Польше.', 'Football is the most popular sport in Poland.']),
  w('tenis', 'noun', 'A1', 'теніс', 'теннис', 'tennis', ['sport'],
    ['Grasz w tenisa?', 'Ти граєш у теніс?', 'Ты играешь в теннис?', 'Do you play tennis?'], { acc: 'tenisa' }),
  w('szachy', 'noun', 'A1', 'шахи', 'шахматы', 'chess', ['sport'],
    ['Dziadek uczy mnie grać w szachy.', 'Дідусь учить мене грати в шахи.', 'Дедушка учит меня играть в шахматы.', 'Grandpa is teaching me to play chess.']),
  w('gitara', 'noun', 'A1', 'гітара', 'гитара', 'guitar', ['music'],
    ['Gram na gitarze od trzech lat.', 'Я граю на гітарі вже три роки.', 'Я играю на гитаре уже три года.', 'I’ve been playing the guitar for three years.'], { loc: 'gitarze' }),
  w('pianino', 'noun', 'A2', 'піаніно', 'пианино', 'piano', ['music'],
    ['Córka gra na pianinie.', 'Донька грає на піаніно.', 'Дочка играет на пианино.', 'My daughter plays the piano.'], { loc: 'pianinie' }),

  // ── Спорт ──
  w('sport', 'noun', 'A1', 'спорт', 'спорт', 'sport', ['sport'],
    ['Jaki sport lubisz?', 'Який спорт ти любиш?', 'Какой спорт ты любишь?', 'What sport do you like?']),
  w('uprawiać', 'verb', 'A2', 'займатися (спортом)', 'заниматься (спортом)', 'to do (a sport)', ['sport'],
    ['Uprawiam sport trzy razy w tygodniu.', 'Я займаюся спортом тричі на тиждень.', 'Я занимаюсь спортом три раза в неделю.', 'I do sport three times a week.'], { ja: 'uprawiam' }),
  w('siłownia', 'noun', 'A1', 'спортзал (тренажерний)', 'тренажёрный зал', 'gym', ['sport'],
    ['Po pracy idę na siłownię.', 'Після роботи йду в спортзал.', 'После работы иду в спортзал.', 'After work I go to the gym.'], { acc: 'siłownię', loc: 'siłowni' }),
  w('joga', 'noun', 'A2', 'йога', 'йога', 'yoga', ['sport'],
    ['W czwartek chodzę na jogę.', 'У четвер я ходжу на йогу.', 'В четверг я хожу на йогу.', 'On Thursdays I go to yoga.'], { acc: 'jogę' }),
  w('pływać', 'verb', 'A1', 'плавати', 'плавать', 'to swim', ['sport'],
    ['Umiesz pływać?', 'Ти вмієш плавати?', 'Ты умеешь плавать?', 'Can you swim?'], { ja: 'pływam' }),
  w('biegać', 'verb', 'A1', 'бігати', 'бегать', 'to run, to jog', ['sport'],
    ['Biegam rano nad morzem.', 'Я бігаю вранці біля моря.', 'Я бегаю утром у моря.', 'I go running by the sea in the morning.'], { ja: 'biegam' }),
  w('narty', 'noun', 'A2', 'лижі', 'лыжи', 'skis', ['sport'],
    ['Zimą jeździmy na nartach w Tatrach.', 'Взимку ми катаємося на лижах у Татрах.', 'Зимой мы катаемся на лыжах в Татрах.', 'In winter we ski in the Tatras.'], { loc: 'nartach' }),
  w('rolki', 'noun', 'A2', 'ролики', 'ролики', 'rollerblades', ['sport'],
    ['Na bulwarze jeżdżę na rolkach.', 'На бульварі я катаюся на роликах.', 'На бульваре я катаюсь на роликах.', 'I rollerblade on the seafront.'], { loc: 'rolkach' }),

  // ── Частота ──
  w('raz w tygodniu', 'phrase', 'A2', 'раз на тиждень', 'раз в неделю', 'once a week', ['time', 'sport'],
    ['Na basen chodzę raz w tygodniu.', 'У басейн я ходжу раз на тиждень.', 'В бассейн я хожу раз в неделю.', 'I go to the pool once a week.']),
  w('co tydzień', 'phrase', 'A2', 'щотижня', 'каждую неделю', 'every week', ['time'],
    ['Co tydzień gramy w siatkówkę.', 'Щотижня ми граємо у волейбол.', 'Каждую неделю мы играем в волейбол.', 'We play volleyball every week.']),
  w('rzadko', 'adv', 'A2', 'рідко', 'редко', 'rarely', ['time'],
    ['Rzadko oglądam telewizję.', 'Я рідко дивлюся телевізор.', 'Я редко смотрю телевизор.', 'I rarely watch TV.']),
  w('czasem', 'adv', 'A2', 'іноді', 'иногда', 'sometimes', ['time'],
    ['Czasem biegam z kolegą.', 'Іноді я бігаю з колегою.', 'Иногда я бегаю с коллегой.', 'Sometimes I run with a friend.']),

  // ── Спортзал ──
  w('karnet', 'noun', 'A2', 'абонемент', 'абонемент', 'membership pass', ['sport', 'shopping'],
    ['Karnet na siłownię kosztuje sto pięćdziesiąt złotych miesięcznie.', 'Абонемент у спортзал коштує сто п’ятдесят злотих на місяць.', 'Абонемент в спортзал стоит сто пятьдесят злотых в месяц.', 'A gym pass costs 150 złoty a month.']),
  w('trener', 'noun', 'A2', 'тренер', 'тренер', 'coach, trainer', ['sport', 'people'],
    ['Trener pokazał mi nowe ćwiczenia.', 'Тренер показав мені нові вправи.', 'Тренер показал мне новые упражнения.', 'The trainer showed me some new exercises.'], { f: 'trenerka' }),
  w('szafka', 'noun', 'A2', 'шафка (у роздягальні)', 'шкафчик', 'locker', ['sport'],
    ['Klucz do szafki dostaniesz w recepcji.', 'Ключ від шафки отримаєш на рецепції.', 'Ключ от шкафчика получишь на ресепшене.', 'You’ll get the locker key at reception.'], { gen: 'szafki' }),
  w('ćwiczyć', 'verb', 'A2', 'тренуватися, вправлятися', 'тренироваться, заниматься', 'to exercise, to practise', ['sport'],
    ['Ćwiczę w domu dwadzieścia minut dziennie.', 'Я тренуюся вдома двадцять хвилин на день.', 'Я занимаюсь дома двадцать минут в день.', 'I exercise at home for twenty minutes a day.'], { ja: 'ćwiczę' }),

  // ── Матч ──
  w('mecz', 'noun', 'A1', 'матч', 'матч', 'match, game', ['sport'],
    ['Idziemy w niedzielę na mecz Arki.', 'У неділю йдемо на матч «Арки».', 'В воскресенье идём на матч «Арки».', 'On Sunday we’re going to the Arka match.']),
  w('kibicować', 'verb', 'B1', 'вболівати (за кого)', 'болеть (за кого)', 'to support (a team)', ['sport'],
    ['Komu kibicujesz?', 'За кого ти вболіваєш?', 'За кого ты болеешь?', 'Which team do you support?'], { ja: 'kibicuję' }),
  w('drużyna', 'noun', 'A2', 'команда', 'команда', 'team', ['sport'],
    ['Nasza drużyna wygrała dwa do jednego.', 'Наша команда виграла два — один.', 'Наша команда выиграла два — один.', 'Our team won two–one.']),
  w('wynik', 'noun', 'A2', 'рахунок, результат', 'счёт, результат', 'score, result', ['sport'],
    ['Jaki jest wynik?', 'Який рахунок?', 'Какой счёт?', 'What’s the score?']),
  w('remis', 'noun', 'B1', 'нічия', 'ничья', 'draw', ['sport'],
    ['Mecz zakończył się remisem.', 'Матч закінчився внічию.', 'Матч закончился вничью.', 'The match ended in a draw.']),
  w('przegrać', 'verb', 'A2', 'програти', 'проиграть', 'to lose (a game)', ['sport'],
    ['Przegraliśmy z Lechią jeden do trzech.', 'Ми програли «Лехії» один — три.', 'Мы проиграли «Лехии» один — три.', 'We lost to Lechia one–three.']),
  w('strzelić gola', 'phrase', 'B1', 'забити гол', 'забить гол', 'to score a goal', ['sport'],
    ['W ostatniej minucie strzelił gola!', 'На останній хвилині він забив гол!', 'На последней минуте он забил гол!', 'He scored in the last minute!']),

  // ── Вітрильний спорт ──
  w('żeglować', 'verb', 'B1', 'ходити під вітрилом', 'ходить под парусом', 'to sail', ['sport', 'travel'],
    ['Latem żeglujemy po Zatoce Gdańskiej.', 'Влітку ми ходимо під вітрилом по Гданській затоці.', 'Летом мы ходим под парусом по Гданьскому заливу.', 'In summer we sail on the Bay of Gdańsk.'], { my: 'żeglujemy' }),
  w('żaglówka', 'noun', 'B1', 'вітрильний човен', 'парусная лодка', 'sailing boat', ['sport', 'travel'],
    ['Wypożyczyliśmy żaglówkę na cały dzień.', 'Ми взяли напрокат вітрильний човен на цілий день.', 'Мы взяли напрокат парусную лодку на весь день.', 'We rented a sailing boat for the whole day.']),
  w('pływanie', 'noun', 'A2', 'плавання', 'плавание', 'swimming', ['sport'],
    ['Pływanie to dobry sport na plecy.', 'Плавання — добрий спорт для спини.', 'Плавание — хороший спорт для спины.', 'Swimming is good for your back.']),
  w('bieganie', 'noun', 'A2', 'біг', 'бег', 'running', ['sport'],
    ['Bieganie mnie relaksuje.', 'Біг мене розслабляє.', 'Бег меня расслабляет.', 'Running relaxes me.']),

  // ── Травма ──
  w('kolano', 'noun', 'A2', 'коліно', 'колено', 'knee', ['medicine'],
    ['Po meczu boli mnie kolano.', 'Після матчу в мене болить коліно.', 'После матча у меня болит колено.', 'My knee hurts after the match.']),
  w('kostka', 'noun', 'B1', 'щиколотка', 'лодыжка', 'ankle', ['medicine'],
    ['Skręciłem kostkę na treningu.', 'Я підвернув ногу на тренуванні.', 'Я подвернул ногу на тренировке.', 'I sprained my ankle at training.']),
  w('boleć', 'verb', 'A2', 'боліти', 'болеть', 'to hurt', ['medicine'],
    ['Bolą mnie nogi po bieganiu.', 'Після бігу в мене болять ноги.', 'После бега у меня болят ноги.', 'My legs hurt after running.'], { ono: 'boli', oni: 'bolą' }),
  w('odpocząć', 'verb', 'A2', 'відпочити', 'отдохнуть', 'to rest', ['sport', 'medicine'],
    ['Musisz odpocząć tydzień.', 'Тобі треба відпочити тиждень.', 'Тебе нужно отдохнуть неделю.', 'You need to rest for a week.']),

  // ── Хобі ──
  w('hobby', 'noun', 'A1', 'хобі', 'хобби', 'hobby', ['sport', 'phrases'],
    ['Moje hobby to fotografia.', 'Моє хобі — фотографія.', 'Моё хобби — фотография.', 'My hobby is photography.']),
  w('wolny czas', 'phrase', 'A2', 'вільний час', 'свободное время', 'free time', ['sport', 'time'],
    ['Co robisz w wolnym czasie?', 'Що ти робиш у вільний час?', 'Что ты делаешь в свободное время?', 'What do you do in your free time?']),
  w('czytać', 'verb', 'A1', 'читати', 'читать', 'to read', ['phrases'],
    ['Wieczorem czytam książki.', 'Увечері я читаю книжки.', 'Вечером я читаю книги.', 'In the evening I read books.'], { ja: 'czytam' }),
  w('gotować', 'verb', 'A1', 'готувати (їжу)', 'готовить (еду)', 'to cook', ['food'],
    ['W weekend lubię gotować.', 'На вихідних я люблю готувати.', 'На выходных я люблю готовить.', 'I like cooking at the weekend.'], { ja: 'gotuję' }),
  w('tańczyć', 'verb', 'A1', 'танцювати', 'танцевать', 'to dance', ['music'],
    ['Chodzimy tańczyć salsę.', 'Ми ходимо танцювати сальсу.', 'Мы ходим танцевать сальсу.', 'We go salsa dancing.'], { ja: 'tańczę' }),
  w('fotografować', 'verb', 'B1', 'фотографувати', 'фотографировать', 'to take photos', ['phrases'],
    ['Lubię fotografować statki w porcie.', 'Я люблю фотографувати кораблі в порту.', 'Я люблю фотографировать корабли в порту.', 'I like photographing ships in the port.'], { ja: 'fotografuję' }),
];
