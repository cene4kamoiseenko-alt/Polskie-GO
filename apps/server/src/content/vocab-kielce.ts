/**
 * Словник Кельців (B2): закріплення знань на матеріалі Свентокшиського краю. Кадзельня (kamieniołom, amfiteatr, rezerwat, wąwóz, szczyt),
 * печера Рай (jaskinia, wyprawa, skarb, odkryć), палац єпископів і музей іграшок (pałac, biskup, średniowiecze, zwiedzanie), легенди про Лису гору
 * (czarownica, miotła, klątwa, zbójnik), Дімарки і Бартек (żelazo, huta, dąb, opactwo, pielgrzym), числа й кількість (wysokość, długość,
 * kilkanaście, kilkadziesiąt), правила в заповіднику (obowiązywać, wolno, zabronić, nakaz) і оповідь (według legendy, pewnego razu, sabat).
 * Слова legenda, ścieżka, szlak, podobno, według, chociaż, ponieważ, dlatego, noc, burza, odbudować, założyć, kościół, wojna, wystawa, zabytek вже є в словнику.
 */
import { w } from './vocab-city';
import type { VocabSeed } from './vocab';

export const KIELCE_VOCAB: VocabSeed[] = [
  // ── Кадзельня ──
  w('kamieniołom', 'noun', 'B2', 'кар’єр', 'карьер', 'quarry', ['city', 'nature'],
    ['Kadzielnia to dawny kamieniołom wapienia w centrum Kielc.', 'Кадзельня — колишній вапняковий кар’єр у центрі Кельців.', 'Кадзельня — бывший известняковый карьер в центре Кельце.', 'Kadzielnia is a former limestone quarry in the centre of Kielce.'], { gen: 'kamieniołomu' }),
  w('amfiteatr', 'noun', 'B2', 'амфітеатр', 'амфитеатр', 'amphitheatre', ['city', 'music'],
    ['W amfiteatrze odbywają się koncerty i festiwale.', 'В амфітеатрі відбуваються концерти й фестивалі.', 'В амфитеатре проходят концерты и фестивали.', 'Concerts and festivals are held in the amphitheatre.'], { gen: 'amfiteatru', loc: 'amfiteatrze' }),
  w('skała', 'noun', 'B2', 'скеля', 'скала', 'rock, cliff', ['nature'],
    ['Nad ścieżką wiszą wysokie skały.', 'Над стежкою нависають високі скелі.', 'Над тропой нависают высокие скалы.', 'High cliffs hang over the path.'], { gen: 'skały', pl: 'skały' }),
  w('rezerwat', 'noun', 'B2', 'заповідник', 'заповедник', 'nature reserve', ['nature'],
    ['Ten rezerwat chroni rzadkie skały i rośliny.', 'Цей заповідник охороняє рідкісні скелі й рослини.', 'Этот заповедник охраняет редкие скалы и растения.', 'This reserve protects rare rocks and plants.'], { gen: 'rezerwatu', loc: 'rezerwacie' }),
  w('wąwóz', 'noun', 'B2', 'ущелина, яр', 'ущелье, овраг', 'ravine, gorge', ['nature'],
    ['Szlak prowadzi przez wąwóz do szczytu.', 'Стежка веде через ущелину до вершини.', 'Тропа ведёт через ущелье к вершине.', 'The trail leads through a ravine to the summit.'], { gen: 'wąwozu', instr: 'wąwozem' }),
  w('szczyt', 'noun', 'B2', 'вершина', 'вершина', 'summit, peak', ['nature', 'travel'],
    ['Z punktu widokowego na szczycie widać całe miasto.', 'З оглядового майданчика на вершині видно все місто.', 'С смотровой площадки на вершине виден весь город.', 'From the viewing point at the summit you can see the whole city.'], { gen: 'szczytu', loc: 'szczycie' }),

  // ── Печера Рай ──
  w('jaskinia', 'noun', 'B2', 'печера', 'пещера', 'cave', ['nature', 'travel'],
    ['W jaskini jest chłodno nawet latem.', 'У печері прохолодно навіть улітку.', 'В пещере прохладно даже летом.', 'It is cool in the cave even in summer.'], { gen: 'jaskini', loc: 'jaskini' }),
  w('wyprawa', 'noun', 'B2', 'експедиція, похід', 'экспедиция, поход', 'expedition, trip', ['travel'],
    ['Wyprawa do jaskini trwała cały dzień.', 'Експедиція до печери тривала цілий день.', 'Экспедиция в пещеру длилась целый день.', 'The expedition to the cave lasted all day.'], { gen: 'wyprawy', acc: 'wyprawę' }),
  w('skarb', 'noun', 'B2', 'скарб', 'сокровище, клад', 'treasure', ['holidays', 'travel'],
    ['Według legendy w jaskini ukryto skarb.', 'За легендою, у печері сховано скарб.', 'По легенде, в пещере спрятан клад.', 'According to legend a treasure was hidden in the cave.'], { gen: 'skarbu' }),
  w('tajemniczy', 'adj', 'B2', 'таємничий', 'таинственный', 'mysterious', ['phrases', 'travel'],
    ['Odkryliśmy tajemniczy korytarz.', 'Ми відкрили таємничий коридор.', 'Мы обнаружили таинственный коридор.', 'We discovered a mysterious passage.'], { f: 'tajemnicza', n: 'tajemnicze' }),
  w('odkryć', 'verb', 'B2', 'відкрити, виявити', 'открыть, обнаружить', 'to discover', ['travel', 'daily'],
    ['Chcę odkryć nowe miejsca w regionie.', 'Я хочу відкрити нові місця в регіоні.', 'Я хочу открыть новые места в регионе.', 'I want to discover new places in the region.'], { ja: 'odkryję', past: 'odkrył' }),
  w('korytarz', 'noun', 'B2', 'коридор, хід', 'коридор, ход', 'corridor, passage', ['home', 'travel'],
    ['Wąski korytarz prowadzi do największej sali.', 'Вузький коридор веде до найбільшої зали.', 'Узкий коридор ведёт в самый большой зал.', 'A narrow passage leads to the largest chamber.'], { gen: 'korytarza', pl: 'korytarze' }),

  // ── Палац єпископів і музей іграшок ──
  w('pałac', 'noun', 'B2', 'палац', 'дворец', 'palace', ['city', 'travel'],
    ['Pałac Biskupów Krakowskich w Kielcach pochodzi z siedemnastego wieku.', 'Палац краківських єпископів у Кельцях походить із сімнадцятого століття.', 'Дворец краковских епископов в Кельце относится к семнадцатому веку.', 'The Palace of the Kraków Bishops in Kielce dates from the seventeenth century.'], { gen: 'pałacu' }),
  w('biskup', 'noun', 'B2', 'єпископ', 'епископ', 'bishop', ['city', 'holidays'],
    ['Biskup zbudował pałac w centrum miasta.', 'Єпископ збудував палац у центрі міста.', 'Епископ построил дворец в центре города.', 'The bishop built a palace in the centre of the city.'], { gen: 'biskupa', pl: 'biskupi' }),
  w('średniowiecze', 'noun', 'B2', 'середньовіччя', 'средневековье', 'the Middle Ages', ['city', 'holidays'],
    ['W średniowieczu Kielce były małą osadą.', 'У середньовіччі Кельце були невеликим поселенням.', 'В средневековье Кельце были небольшим поселением.', 'In the Middle Ages Kielce was a small settlement.'], { gen: 'średniowiecza', loc: 'średniowieczu' }),
  w('zabawka', 'noun', 'B2', 'іграшка', 'игрушка', 'toy', ['shopping', 'family'],
    ['W muzeum zobaczysz zabawki z całego świata.', 'У музеї ти побачиш іграшки з усього світу.', 'В музее ты увидишь игрушки со всего мира.', 'In the museum you will see toys from all over the world.'], { gen: 'zabawki', pl: 'zabawki' }),
  w('zwiedzanie', 'noun', 'B2', 'огляд, екскурсія', 'осмотр, экскурсия', 'sightseeing, visit', ['travel', 'city'],
    ['Zwiedzanie muzeum zajmuje półtorej godziny.', 'Огляд музею займає півтори години.', 'Осмотр музея занимает полтора часа.', 'Visiting the museum takes an hour and a half.'], { gen: 'zwiedzania' }),

  // ── Легенди про Лису гору ──
  w('czarownica', 'noun', 'B2', 'відьма', 'ведьма', 'witch', ['holidays', 'phrases'],
    ['Według legendy na Łysej Górze zbierały się czarownice.', 'За легендою, на Лисій горі збиралися відьми.', 'По легенде, на Лысой горе собирались ведьмы.', 'According to legend witches gathered on Łysa Góra.'], { gen: 'czarownicy', pl: 'czarownice' }),
  w('miotła', 'noun', 'B2', 'мітла', 'метла', 'broom', ['home', 'holidays'],
    ['Czarownice latały na miotłach.', 'Відьми літали на мітлах.', 'Ведьмы летали на мётлах.', 'The witches flew on brooms.'], { gen: 'miotły', loc: 'miotłach' }),
  w('klątwa', 'noun', 'B2', 'прокляття', 'проклятие', 'curse', ['holidays'],
    ['Na zamku ciążyła dawna klątwa.', 'На замку лежало давнє прокляття.', 'На замке лежало древнее проклятие.', 'An old curse lay on the castle.'], { gen: 'klątwy' }),
  w('zjawa', 'noun', 'B2', 'привид', 'призрак', 'ghost, apparition', ['holidays'],
    ['Podobno w nocy widziano tu zjawę.', 'Кажуть, уночі тут бачили привида.', 'Говорят, ночью здесь видели призрак.', 'They say an apparition was seen here at night.'], { gen: 'zjawy', acc: 'zjawę' }),
  w('zbójnik', 'noun', 'B2', 'розбійник', 'разбойник', 'bandit, robber', ['holidays', 'people'],
    ['Zbójnicy ukrywali łupy w lesie.', 'Розбійники ховали здобич у лісі.', 'Разбойники прятали добычу в лесу.', 'The bandits hid their loot in the forest.'], { gen: 'zbójnika', pl: 'zbójnicy' }),

  // ── Дімарки, Бартек, Святий Хрест ──
  w('żelazo', 'noun', 'B2', 'залізо', 'железо', 'iron', ['work', 'holidays'],
    ['Dawni mieszkańcy regionu wytapiali żelazo w piecach.', 'Давні мешканці регіону виплавляли залізо в печах.', 'Древние жители региона выплавляли железо в печах.', 'The early inhabitants of the region smelted iron in furnaces.'], { gen: 'żelaza' }),
  w('huta', 'noun', 'B2', 'металургійний завод, гута', 'металлургический завод, гута', 'ironworks, mill', ['work', 'city'],
    ['W okolicy była kiedyś huta żelaza.', 'Поблизу колись була залізоплавильна гута.', 'Неподалёку когда-то была железоплавильная гута.', 'There used to be an ironworks in the area.'], { gen: 'huty' }),
  w('dąb', 'noun', 'B2', 'дуб', 'дуб', 'oak', ['nature'],
    ['Dąb Bartek jest jednym z najstarszych drzew w Polsce.', 'Дуб Бартек — одне з найстаріших дерев у Польщі.', 'Дуб Бартек — одно из старейших деревьев в Польше.', 'The Bartek oak is one of the oldest trees in Poland.'], { gen: 'dębu', pl: 'dęby' }),
  w('opactwo', 'noun', 'B2', 'абатство', 'аббатство', 'abbey', ['city', 'holidays'],
    ['Opactwo na Świętym Krzyżu przyciąga pielgrzymów.', 'Абатство на Святому Хресті приваблює прочан.', 'Аббатство на Святом Кресте привлекает паломников.', 'The abbey on Święty Krzyż attracts pilgrims.'], { gen: 'opactwa', loc: 'opactwie' }),
  w('pielgrzym', 'noun', 'B2', 'прочанин, паломник', 'паломник', 'pilgrim', ['holidays', 'people'],
    ['Pielgrzymi idą na szczyt pieszo.', 'Прочани йдуть на вершину пішки.', 'Паломники идут на вершину пешком.', 'The pilgrims walk to the summit.'], { gen: 'pielgrzyma', pl: 'pielgrzymi' }),

  // ── Числа й кількість ──
  w('wysokość', 'noun', 'B2', 'висота', 'высота', 'height', ['numbers', 'nature'],
    ['Wysokość Łysicy wynosi sześćset dwanaście metrów.', 'Висота Лисиці становить шістсот дванадцять метрів.', 'Высота Лысицы составляет шестьсот двенадцать метров.', 'The height of Łysica is six hundred and twelve metres.'], { gen: 'wysokości', instr: 'wysokością' }),
  w('długość', 'noun', 'B2', 'довжина', 'длина', 'length', ['numbers', 'nature'],
    ['Długość szlaku wynosi dwanaście kilometrów.', 'Довжина стежки становить дванадцять кілометрів.', 'Длина тропы составляет двенадцать километров.', 'The length of the trail is twelve kilometres.'], { gen: 'długości' }),
  w('głębokość', 'noun', 'B2', 'глибина', 'глубина', 'depth', ['numbers', 'nature'],
    ['Głębokość jaskini wynosi kilkanaście metrów.', 'Глибина печери становить кільканадцять метрів.', 'Глубина пещеры составляет больше десяти метров.', 'The depth of the cave is a dozen or so metres.'], { gen: 'głębokości' }),
  w('kilkanaście', 'num', 'B2', 'кільканадцять (від 11 до 19)', 'больше десяти, до двадцати', 'a dozen or so (11–19)', ['numbers'],
    ['Na wycieczkę przyszło kilkanaście osób.', 'На екскурсію прийшло кільканадцять осіб.', 'На экскурсию пришло человек пятнадцать.', 'A dozen or so people came on the trip.']),
  w('kilkadziesiąt', 'num', 'B2', 'кілька десятків', 'несколько десятков', 'several dozen', ['numbers'],
    ['W grupie było kilkadziesiąt turystów.', 'У групі було кілька десятків туристів.', 'В группе было несколько десятков туристов.', 'There were several dozen tourists in the group.']),
  w('kilkaset', 'num', 'B2', 'кілька сотень', 'несколько сотен', 'a few hundred', ['numbers'],
    ['Do jaskini wchodzi dziennie kilkaset osób.', 'До печери щодня заходить кілька сотень осіб.', 'В пещеру ежедневно заходят несколько сотен человек.', 'A few hundred people enter the cave every day.']),

  // ── Правила в заповіднику ──
  w('obowiązywać', 'verb', 'B2', 'діяти, бути чинним', 'действовать, быть в силе', 'to be in force', ['documents', 'nature'],
    ['W rezerwacie obowiązuje zakaz wstępu poza szlakiem.', 'У заповіднику діє заборона заходити поза стежкою.', 'В заповеднике действует запрет заходить за пределы тропы.', 'In the reserve it is forbidden to leave the trail.'], { he: 'obowiązuje', past: 'obowiązywał' }),
  w('należy', 'phrase', 'B2', 'слід, треба (безособово)', 'следует, нужно (безлично)', 'one should, it is necessary', ['documents', 'phrases'],
    ['Należy iść tylko wyznaczonymi ścieżkami.', 'Слід ходити лише визначеними стежками.', 'Следует ходить только по обозначенным тропам.', 'One should walk only on the marked paths.']),
  w('wolno', 'adv', 'B2', 'можна, дозволено', 'можно, разрешено', 'it is allowed', ['documents', 'phrases'],
    ['W rezerwacie nie wolno zrywać roślin.', 'У заповіднику не можна зривати рослини.', 'В заповеднике нельзя срывать растения.', 'You may not pick plants in the reserve.']),
  w('zabronić', 'verb', 'B2', 'заборонити', 'запретить', 'to forbid', ['documents', 'nature'],
    ['Władze zabroniły wstępu na teren kamieniołomu.', 'Влада заборонила вхід на територію кар’єру.', 'Власти запретили вход на территорию карьера.', 'The authorities banned entry to the quarry area.'], { ja: 'zabronię', past: 'zabronił' }),
  w('nakaz', 'noun', 'B2', 'припис, наказ', 'предписание, приказ', 'order, requirement', ['documents', 'nature'],
    ['Obowiązuje nakaz prowadzenia psa na smyczy.', 'Діє припис вести собаку на повідку.', 'Действует предписание водить собаку на поводке.', 'Dogs must be kept on a lead.'], { gen: 'nakazu' }),

  // ── Оповідь ──
  w('według legendy', 'phrase', 'B2', 'за легендою', 'по легенде', 'according to legend', ['holidays', 'phrases'],
    ['Według legendy na Łysej Górze spotykały się czarownice.', 'За легендою, на Лисій горі зустрічалися відьми.', 'По легенде, на Лысой горе встречались ведьмы.', 'According to legend, witches met on Łysa Góra.']),
  w('pewnego razu', 'phrase', 'B2', 'одного разу', 'однажды', 'once upon a time', ['holidays', 'phrases'],
    ['Pewnego razu na szczyt wszedł młody pasterz.', 'Одного разу на вершину зійшов молодий пастух.', 'Однажды на вершину поднялся молодой пастух.', 'Once upon a time a young shepherd climbed to the summit.']),
  w('przepowiednia', 'noun', 'B2', 'пророцтво', 'предсказание', 'prophecy', ['holidays'],
    ['Stara przepowiednia mówiła o ukrytym skarbie.', 'Давнє пророцтво розповідало про прихований скарб.', 'Старое предсказание говорило о спрятанном сокровище.', 'An old prophecy spoke of a hidden treasure.'], { gen: 'przepowiedni' }),
  w('sabat', 'noun', 'B2', 'шабаш', 'шабаш', 'witches’ sabbath', ['holidays'],
    ['Co roku w noc świętojańską czarownice urządzały sabat.', 'Щороку в ніч на Івана Купала відьми влаштовували шабаш.', 'Каждый год в ночь на Ивана Купалу ведьмы устраивали шабаш.', 'Every year on Midsummer night the witches held a sabbath.'], { gen: 'sabatu', acc: 'sabat' }),
  w('klasztor', 'noun', 'B2', 'монастир', 'монастырь', 'monastery', ['city', 'holidays'],
    ['Na szczycie stoi dawny klasztor.', 'На вершині стоїть колишній монастир.', 'На вершине стоит бывший монастырь.', 'A former monastery stands on the summit.'], { gen: 'klasztoru' }),
  w('mnich', 'noun', 'B2', 'монах', 'монах', 'monk', ['holidays', 'people'],
    ['Mnisi mieszkali tu przez wiele stuleci.', 'Ченці жили тут багато століть.', 'Монахи жили здесь много столетий.', 'Monks lived here for many centuries.'], { gen: 'mnicha', pl: 'mnisi' }),
];
