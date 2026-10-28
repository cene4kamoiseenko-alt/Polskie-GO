/**
 * Словник Гожува-Великопольського (A2): погода (jest zimno, pada deszcz), пори року (zimą, latem), прогноз
 * і градуси (stopnie / stopni), одяг за погодою (weź, załóż, jeśli), природа (nad rzeką, w lesie), порівняння
 * (cieplej niż), поїздка за місто, сортування сміття. Слова kurtka, szalik, buty, sweter, temperatura, rzeka,
 * jezioro, most, rower, spacer, śmieci, kosz, segregować, plastik, papier, szkło, butelka, wypożyczyć уже є в словнику.
 */
import { w } from './vocab-city';
import type { VocabSeed } from './vocab';

export const GORZOW_VOCAB: VocabSeed[] = [
  // ── Погода ──
  w('pogoda', 'noun', 'A1', 'погода', 'погода', 'weather', ['nature'],
    ['Jaka jest dzisiaj pogoda?', 'Яка сьогодні погода?', 'Какая сегодня погода?', 'What’s the weather like today?']),
  w('słońce', 'noun', 'A1', 'сонце', 'солнце', 'sun', ['nature'],
    ['Świeci słońce.', 'Світить сонце.', 'Светит солнце.', 'The sun is shining.']),
  w('słonecznie', 'adv', 'A1', 'сонячно', 'солнечно', 'sunny', ['nature'],
    ['Jutro będzie słonecznie.', 'Завтра буде сонячно.', 'Завтра будет солнечно.', 'It will be sunny tomorrow.']),
  w('deszcz', 'noun', 'A1', 'дощ', 'дождь', 'rain', ['nature'],
    ['Pada deszcz, weź parasol.', 'Іде дощ, візьми парасолю.', 'Идёт дождь, возьми зонт.', 'It’s raining, take an umbrella.'], { gen: 'deszczu' }),
  w('śnieg', 'noun', 'A1', 'сніг', 'снег', 'snow', ['nature'],
    ['W nocy padał śnieg.', 'Уночі падав сніг.', 'Ночью шёл снег.', 'It snowed during the night.'], { gen: 'śniegu' }),
  w('wiatr', 'noun', 'A1', 'вітер', 'ветер', 'wind', ['nature'],
    ['Wieje silny wiatr.', 'Дме сильний вітер.', 'Дует сильный ветер.', 'A strong wind is blowing.'], { gen: 'wiatru' }),
  w('zimno', 'adv', 'A1', 'холодно', 'холодно', 'cold (it is cold)', ['nature'],
    ['Dzisiaj jest bardzo zimno.', 'Сьогодні дуже холодно.', 'Сегодня очень холодно.', 'It’s very cold today.']),
  w('ciepło', 'adv', 'A1', 'тепло', 'тепло', 'warm (it is warm)', ['nature'],
    ['W maju jest już ciepło.', 'У травні вже тепло.', 'В мае уже тепло.', 'It’s already warm in May.']),
  w('pochmurno', 'adv', 'A2', 'хмарно', 'облачно', 'cloudy', ['nature'],
    ['Rano było pochmurno.', 'Уранці було хмарно.', 'Утром было облачно.', 'It was cloudy in the morning.']),
  w('padać', 'verb', 'A1', 'падати; іти (про дощ, сніг)', 'падать; идти (о дожде, снеге)', 'to fall; to rain / snow', ['nature'],
    ['Po południu będzie padać.', 'Після обіду буде дощ.', 'После обеда будет дождь.', 'It will rain in the afternoon.'], { ono: 'pada' }),

  // ── Пори року ──
  w('wiosna', 'noun', 'A1', 'весна', 'весна', 'spring', ['nature', 'calendar'],
    ['Wiosną wszystko kwitnie.', 'Навесні все цвіте.', 'Весной всё цветёт.', 'In spring everything blooms.'], { ins: 'wiosną' }),
  w('lato', 'noun', 'A1', 'літо', 'лето', 'summer', ['nature', 'calendar'],
    ['Latem jeździmy nad morze.', 'Влітку ми їздимо на море.', 'Летом мы ездим на море.', 'In summer we go to the seaside.'], { ins: 'latem', loc: 'lecie' }),
  w('jesień', 'noun', 'A1', 'осінь', 'осень', 'autumn', ['nature', 'calendar'],
    ['Jesienią liście są żółte.', 'Восени листя жовте.', 'Осенью листья жёлтые.', 'In autumn the leaves are yellow.'], { ins: 'jesienią' }),
  w('zima', 'noun', 'A1', 'зима', 'зима', 'winter', ['nature', 'calendar'],
    ['Zimą często pada śnieg.', 'Взимку часто падає сніг.', 'Зимой часто идёт снег.', 'In winter it often snows.'], { ins: 'zimą' }),
  w('liść', 'noun', 'A2', 'листок', 'лист (на дереве)', 'leaf', ['nature'],
    ['Na drzewach są już zielone liście.', 'На деревах уже зелене листя.', 'На деревьях уже зелёные листья.', 'There are already green leaves on the trees.'], { pl: 'liście' }),
  w('gorąco', 'adv', 'A1', 'спекотно, гаряче', 'жарко', 'hot (it is hot)', ['nature'],
    ['W lipcu jest gorąco.', 'У липні спекотно.', 'В июле жарко.', 'It’s hot in July.']),
  w('mróz', 'noun', 'A2', 'мороз', 'мороз', 'frost', ['nature'],
    ['W nocy był mróz, minus dziesięć stopni.', 'Уночі був мороз, мінус десять градусів.', 'Ночью был мороз, минус десять градусов.', 'There was a frost at night, minus ten degrees.'], { gen: 'mrozu' }),

  // ── Прогноз ──
  w('prognoza', 'noun', 'A2', 'прогноз', 'прогноз', 'forecast', ['nature'],
    ['Słyszałeś prognozę pogody na jutro?', 'Ти чув прогноз погоди на завтра?', 'Ты слышал прогноз погоды на завтра?', 'Did you hear the forecast for tomorrow?'], { acc: 'prognozę' }),
  w('stopień', 'noun', 'A2', 'градус', 'градус', 'degree', ['nature', 'numbers'],
    ['Jutro będzie dwadzieścia stopni.', 'Завтра буде двадцять градусів.', 'Завтра будет двадцать градусов.', 'It will be twenty degrees tomorrow.'], { pl: 'stopnie', gen_pl: 'stopni' }),
  w('burza', 'noun', 'A2', 'гроза', 'гроза', 'thunderstorm', ['nature'],
    ['Po południu będzie burza.', 'Після обіду буде гроза.', 'После обеда будет гроза.', 'There will be a thunderstorm in the afternoon.']),
  w('mgła', 'noun', 'A2', 'туман', 'туман', 'fog', ['nature', 'road'],
    ['Rano była gęsta mgła.', 'Уранці був густий туман.', 'Утром был густой туман.', 'There was thick fog in the morning.']),
  w('chmura', 'noun', 'A2', 'хмара', 'туча, облако', 'cloud', ['nature'],
    ['Na niebie nie ma ani jednej chmury.', 'На небі немає жодної хмари.', 'На небе нет ни одного облака.', 'There isn’t a single cloud in the sky.'], { pl: 'chmury' }),
  w('upał', 'noun', 'A2', 'спека', 'жара', 'heatwave, heat', ['nature'],
    ['W sierpniu był upał, trzydzieści pięć stopni.', 'У серпні була спека, тридцять п’ять градусів.', 'В августе была жара, тридцать пять градусов.', 'In August there was a heatwave, thirty-five degrees.']),

  // ── Одяг за погодою ──
  w('parasol', 'noun', 'A1', 'парасоля', 'зонт', 'umbrella', ['nature', 'clothes'],
    ['Weź parasol, będzie padać.', 'Візьми парасолю, буде дощ.', 'Возьми зонт, будет дождь.', 'Take an umbrella, it’s going to rain.'], { gen: 'parasola' }),
  w('czapka', 'noun', 'A1', 'шапка', 'шапка', 'hat, cap', ['clothes'],
    ['Załóż czapkę, jest mróz.', 'Надінь шапку, мороз.', 'Надень шапку, мороз.', 'Put on a hat, it’s freezing.'], { acc: 'czapkę' }),
  w('rękawiczki', 'noun', 'A2', 'рукавички', 'перчатки', 'gloves', ['clothes'],
    ['Zgubiłem rękawiczki w tramwaju.', 'Я загубив рукавички в трамваї.', 'Я потерял перчатки в трамвае.', 'I lost my gloves on the tram.'], { gen: 'rękawiczek' }),
  w('płaszcz', 'noun', 'A2', 'пальто', 'пальто', 'coat', ['clothes'],
    ['Ten płaszcz jest ciepły i nieprzemakalny.', 'Це пальто тепле й непромокальне.', 'Это пальто тёплое и непромокаемое.', 'This coat is warm and waterproof.']),
  w('jeśli', 'conj', 'A2', 'якщо', 'если', 'if', ['phrases'],
    ['Jeśli będzie ładnie, pójdziemy na spacer.', 'Якщо буде гарно, підемо на прогулянку.', 'Если будет хорошая погода, пойдём гулять.', 'If the weather is nice, we’ll go for a walk.']),
  w('mokry', 'adj', 'A2', 'мокрий', 'мокрый', 'wet', ['nature'],
    ['Wróciłem z deszczu cały mokry.', 'Я повернувся з дощу весь мокрий.', 'Я вернулся из-под дождя весь мокрый.', 'I came back from the rain soaking wet.']),

  // ── Природа ──
  w('las', 'noun', 'A1', 'ліс', 'лес', 'forest', ['nature'],
    ['W lesie jest cicho.', 'У лісі тихо.', 'В лесу тихо.', 'It’s quiet in the forest.'], { loc: 'lesie', gen: 'lasu' }),
  w('park', 'noun', 'A1', 'парк', 'парк', 'park', ['nature', 'city'],
    ['Mieszkam blisko parku.', 'Я живу близько від парку.', 'Я живу рядом с парком.', 'I live near the park.'], { gen: 'parku' }),
  w('drzewo', 'noun', 'A1', 'дерево', 'дерево', 'tree', ['nature'],
    ['Pod drzewem jest ławka.', 'Під деревом є лавка.', 'Под деревом есть скамейка.', 'There is a bench under the tree.'], { pl: 'drzewa' }),
  w('ptak', 'noun', 'A1', 'птах', 'птица', 'bird', ['nature'],
    ['Rano śpiewają ptaki.', 'Уранці співають птахи.', 'Утром поют птицы.', 'Birds sing in the morning.'], { pl: 'ptaki' }),
  w('góry', 'noun', 'A1', 'гори', 'горы', 'mountains', ['nature', 'travel'],
    ['Zimą jeździmy w góry.', 'Взимку ми їздимо в гори.', 'Зимой мы ездим в горы.', 'In winter we go to the mountains.'], { loc: 'górach' }),
  w('morze', 'noun', 'A1', 'море', 'море', 'sea', ['nature', 'travel'],
    ['W lipcu jedziemy nad morze.', 'У липні ми їдемо на море.', 'В июле мы едем на море.', 'In July we’re going to the seaside.'], { ins: 'morzem' }),
  w('przyroda', 'noun', 'A2', 'природа', 'природа', 'nature', ['nature'],
    ['Lubię przyrodę i ciszę.', 'Я люблю природу й тишу.', 'Я люблю природу и тишину.', 'I love nature and quiet.']),

  // ── Порівняння ──
  w('niż', 'conj', 'A2', 'ніж', 'чем', 'than', ['grammar'],
    ['Dzisiaj jest cieplej niż wczoraj.', 'Сьогодні тепліше, ніж учора.', 'Сегодня теплее, чем вчера.', 'It’s warmer today than yesterday.']),
  w('cieplej', 'adv', 'A2', 'тепліше', 'теплее', 'warmer', ['nature', 'grammar'],
    ['W kuchni jest cieplej niż w pokoju.', 'На кухні тепліше, ніж у кімнаті.', 'На кухне теплее, чем в комнате.', 'It’s warmer in the kitchen than in the room.']),
  w('zimniej', 'adv', 'A2', 'холодніше', 'холоднее', 'colder', ['nature', 'grammar'],
    ['Wieczorem będzie zimniej.', 'Увечері буде холодніше.', 'Вечером будет холоднее.', 'It will be colder in the evening.']),
  w('lepiej', 'adv', 'A2', 'краще', 'лучше', 'better', ['grammar', 'phrases'],
    ['Czuję się już lepiej.', 'Я вже почуваюся краще.', 'Я уже чувствую себя лучше.', 'I already feel better.']),
  w('gorzej', 'adv', 'A2', 'гірше', 'хуже', 'worse', ['grammar', 'phrases'],
    ['Dzisiaj czuję się gorzej niż wczoraj.', 'Сьогодні я почуваюся гірше, ніж учора.', 'Сегодня я чувствую себя хуже, чем вчера.', 'I feel worse today than yesterday.']),

  // ── Поїздка ──
  w('wycieczka', 'noun', 'A2', 'поїздка, екскурсія', 'поездка, экскурсия', 'trip, outing', ['travel', 'nature'],
    ['W sobotę jedziemy na wycieczkę rowerową.', 'У суботу ми їдемо на велопрогулянку.', 'В субботу мы едем на велопрогулку.', 'On Saturday we’re going on a bike trip.'], { acc: 'wycieczkę' }),
  w('namiot', 'noun', 'A2', 'намет', 'палатка', 'tent', ['travel', 'nature'],
    ['Śpimy w namiocie nad jeziorem.', 'Ми спимо в наметі біля озера.', 'Мы спим в палатке у озера.', 'We sleep in a tent by the lake.'], { loc: 'namiocie' }),
  w('ognisko', 'noun', 'A2', 'вогнище', 'костёр', 'campfire', ['travel', 'nature'],
    ['Wieczorem robimy ognisko i pieczemy kiełbaski.', 'Увечері розпалюємо вогнище й печемо ковбаски.', 'Вечером разводим костёр и жарим колбаски.', 'In the evening we make a campfire and roast sausages.']),
  w('grzyb', 'noun', 'A2', 'гриб', 'гриб', 'mushroom', ['nature', 'food'],
    ['We wrześniu w lesie jest dużo grzybów.', 'У вересні в лісі багато грибів.', 'В сентябре в лесу много грибов.', 'In September there are lots of mushrooms in the forest.'], { pl: 'grzyby', gen_pl: 'grzybów' }),
  w('zbierać', 'verb', 'A2', 'збирати', 'собирать', 'to pick, to collect', ['nature'],
    ['Babcia zbiera grzyby i jagody.', 'Бабуся збирає гриби та ягоди.', 'Бабушка собирает грибы и ягоды.', 'Grandma picks mushrooms and berries.'], { ono: 'zbiera' }),

  // ── Сміття ──
  w('pojemnik', 'noun', 'A2', 'контейнер', 'контейнер', 'bin, container', ['home'],
    ['Szkło wyrzucamy do zielonego pojemnika.', 'Скло ми викидаємо в зелений контейнер.', 'Стекло мы выбрасываем в зелёный контейнер.', 'We throw glass into the green bin.'], { gen: 'pojemnika' }),
  w('worek', 'noun', 'A2', 'мішок', 'мешок', 'bag, sack', ['home'],
    ['Plastik wrzucamy do żółtego worka.', 'Пластик ми кидаємо в жовтий мішок.', 'Пластик мы бросаем в жёлтый мешок.', 'We put plastic into the yellow bag.'], { gen: 'worka' }),
  w('wyrzucać', 'verb', 'A2', 'викидати', 'выбрасывать', 'to throw away', ['home'],
    ['Nie wyrzucaj baterii do kosza!', 'Не викидай батарейки у смітник!', 'Не выбрасывай батарейки в мусорку!', 'Don’t throw batteries in the bin!'], { ty: 'wyrzucasz' }),
];
