/**
 * Словник сезонних пропусків (content/seasons.ts): листопад у Познані (rogale świętomarcińskie, 11 листопада, andrzejki),
 * польське Різдво (jarmark, Wigilia, Sylwester), поїздка до парку розваг. Слова Wigilia, opłatek, karp, barszcz, choinka,
 * Sylwester, Nowy Rok, fajerwerki, północ, korowód, święto, bilet, ulgowy, kolejka, szafka вже є в словнику — тут не повторюються.
 */
import { w } from './vocab-city';
import type { VocabSeed } from './vocab';

export const SEASON_VOCAB: VocabSeed[] = [
  // ── Листопад у Познані ──
  w('rogal', 'noun', 'A2', 'рогалик', 'рогалик', 'crescent roll', ['food', 'holidays'],
    ['W Poznaniu jemy rogale świętomarcińskie.', 'У Познані ми їмо рогалики святого Мартина.', 'В Познани мы едим рогалики святого Мартина.', 'In Poznań we eat St Martin’s croissants.'], { pl: 'rogale', gen: 'rogala' }),
  w('niepodległość', 'noun', 'B1', 'незалежність', 'независимость', 'independence', ['holidays', 'calendar'],
    ['Jedenastego listopada świętujemy odzyskanie niepodległości.', 'Одинадцятого листопада ми святкуємо відновлення незалежності.', 'Одиннадцатого ноября мы празднуем восстановление независимости.', 'On 11 November we celebrate regaining independence.'], { gen: 'niepodległości' }),
  w('andrzejki', 'noun', 'A2', 'анджейки (вечір ворожіння 29 листопада)', 'анджейки (вечер гаданий 29 ноября)', 'St Andrew’s Eve (fortune-telling night, 29 November)', ['holidays', 'calendar'],
    ['Na andrzejki lejemy wosk przez klucz.', 'На анджейки ми ллємо віск через ключ.', 'На анджейки мы льём воск через ключ.', 'On St Andrew’s Eve we pour wax through a key.']),
  w('wosk', 'noun', 'B1', 'віск', 'воск', 'wax', ['holidays'],
    ['Gorący wosk wlewamy do zimnej wody.', 'Гарячий віск виливаємо в холодну воду.', 'Горячий воск выливаем в холодную воду.', 'We pour hot wax into cold water.'], { gen: 'wosku' }),
  w('wróżba', 'noun', 'B1', 'ворожіння, передбачення', 'гадание, предсказание', 'fortune, prediction', ['holidays'],
    ['To tylko zabawa, nie prawdziwa wróżba.', 'Це лише гра, а не справжнє ворожіння.', 'Это просто игра, а не настоящее гадание.', 'It’s just a game, not a real fortune.'], { pl: 'wróżby' }),
  w('cień', 'noun', 'A2', 'тінь', 'тень', 'shadow', ['holidays', 'nature'],
    ['Cień na ścianie wygląda jak statek.', 'Тінь на стіні схожа на корабель.', 'Тень на стене похожа на корабль.', 'The shadow on the wall looks like a ship.'], { gen: 'cienia' }),
  w('przynieść', 'verb', 'A2', 'принести', 'принести', 'to bring', ['phrases'],
    ['Co mam przynieść na imprezę?', 'Що мені принести на вечірку?', 'Что мне принести на вечеринку?', 'What should I bring to the party?'], { ja: 'przyniosę', imp: 'przynieś' }),

  // ── Польське Різдво ──
  w('jarmark', 'noun', 'A2', 'ярмарок', 'ярмарка', 'fair, market', ['holidays', 'shopping'],
    ['W grudniu na rynku jest jarmark bożonarodzeniowy.', 'У грудні на площі працює різдвяний ярмарок.', 'В декабре на площади работает рождественская ярмарка.', 'In December there is a Christmas market on the square.'], { loc: 'jarmarku' }),
  w('oscypek', 'noun', 'A2', 'оскипек (копчений гірський сир)', 'оскыпек (копчёный горный сыр)', 'oscypek (smoked mountain cheese)', ['food', 'holidays'],
    ['Oscypek z grilla jest pyszny z żurawiną.', 'Оскипек з гриля смачний із журавлиною.', 'Оскыпек с гриля вкусный с клюквой.', 'Grilled oscypek is delicious with cranberry.'], { gen: 'oscypka' }),
  w('żurawina', 'noun', 'A2', 'журавлина', 'клюква', 'cranberry', ['food'],
    ['Poproszę oscypek z żurawiną.', 'Оскипек із журавлиною, будь ласка.', 'Оскыпек с клюквой, пожалуйста.', 'Oscypek with cranberry, please.'], { ins: 'żurawiną' }),
  w('uszka', 'noun', 'A2', 'вушка (маленькі вареники з грибами до борщу)', 'ушки (маленькие пельмени с грибами к борщу)', 'uszka (small mushroom dumplings)', ['holidays', 'food', 'dishes'],
    ['Na Wigilię jemy barszcz z uszkami.', 'На Святвечір ми їмо борщ із вушками.', 'В Сочельник мы едим борщ с ушками.', 'On Christmas Eve we eat barszcz with uszka.'], { ins: 'uszkami' }),
  w('Wesołych Świąt', 'phrase', 'A1', 'веселих свят (з Різдвом)', 'весёлых праздников (с Рождеством)', 'Merry Christmas', ['holidays', 'phrases'],
    ['Wesołych Świąt i szczęśliwego Nowego Roku!', 'Веселих свят і щасливого Нового року!', 'Весёлых праздников и счастливого Нового года!', 'Merry Christmas and a happy New Year!']),
  w('wzajemnie', 'adv', 'A1', 'взаємно', 'взаимно', 'likewise, same to you', ['phrases', 'holidays'],
    ['— Wesołych Świąt! — Wzajemnie!', '— Веселих свят! — Взаємно!', '— Весёлых праздников! — Взаимно!', '— Merry Christmas! — Same to you!']),
  w('Szczęśliwego Nowego Roku', 'phrase', 'A1', 'щасливого Нового року', 'с Новым годом', 'Happy New Year', ['holidays', 'phrases'],
    ['O północy mówimy: Szczęśliwego Nowego Roku!', 'Опівночі ми кажемо: «Щасливого Нового року!»', 'В полночь мы говорим: «С Новым годом!»', 'At midnight we say: Happy New Year!']),
  w('do siego roku', 'phrase', 'B1', 'щасливого Нового року (старовинне побажання)', 'с Новым годом (старинное пожелание)', 'Happy New Year (old-fashioned wish)', ['holidays', 'phrases'],
    ['W Sylwestra życzymy sobie: Do siego roku!', 'У новорічну ніч бажаємо одне одному: «Do siego roku!»', 'В новогоднюю ночь желаем друг другу: «Do siego roku!»', 'On New Year’s Eve we wish each other: Do siego roku!']),

  // ── Парк розваг ──
  w('wzrost', 'noun', 'A2', 'зріст', 'рост', 'height (of a person)', ['people'],
    ['Minimalny wzrost to sto dwadzieścia centymetrów.', 'Мінімальний зріст — сто двадцять сантиметрів.', 'Минимальный рост — сто двадцать сантиметров.', 'The minimum height is 120 centimetres.'], { gen: 'wzrostu' }),
  w('bać się', 'verb', 'A2', 'боятися', 'бояться', 'to be afraid', ['phrases'],
    ['Trochę się boję, ale jest super!', 'Мені трохи страшно, але це супер!', 'Мне немного страшно, но это супер!', 'I’m a bit scared, but it’s great!'], { ja: 'boję się', ty: 'boisz się' }),
  w('dokument', 'noun', 'A1', 'документ', 'документ', 'document, ID', ['documents'],
    ['Proszę pokazać dokument.', 'Покажіть, будь ласка, документ.', 'Покажите, пожалуйста, документ.', 'Please show your ID.'], { gen: 'dokumentu' }),
  w('pomoc', 'noun', 'A1', 'допомога', 'помощь', 'help', ['phrases'],
    ['Dziękuję za pomoc!', 'Дякую за допомогу!', 'Спасибо за помощь!', 'Thanks for your help!'], { gen: 'pomocy' }),
];
