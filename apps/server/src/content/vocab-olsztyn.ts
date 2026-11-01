/**
 * Словник Ольштина (B1): розуміння мовлення — перепитати й попросити повільніше (nie dosłyszałem, proszę mówić wolniej),
 * оголошення на вокзалі й у магазині (komunikat, nieczynny, prosimy o…), дзвінки й інфолінія (naciśnij, oddzwonić, przeliterować),
 * числа на слух (około, ponad, najwyżej, procent), озера Вармії (kajak, pomost, kąpielisko, zakaz), довгі описи з który / która / które,
 * замок і аудіогід (zbudowano, założono, słychać), переказ почутого (według, z rozmowy wynika, natomiast).
 * Слова powtórzyć, wolniej, rozumieć, peron, tor, opóźniony, uwaga, zmiana, kasa, oddzwonić, wiadomość, zajęty, litera, jezioro,
 * żaglówka, ratownik, pływać, zamek, wieża, wystawa, przewodnik, zwiedzać, bilet ulgowy, ponieważ, informacja уже є в словнику.
 */
import { w } from './vocab-city';
import type { VocabSeed } from './vocab';

export const OLSZTYN_VOCAB: VocabSeed[] = [
  // ── Перепитати: nie dosłyszałem, proszę mówić wolniej ──
  w('zrozumieć', 'verb', 'A2', 'зрозуміти', 'понять', 'to understand (and get it)', ['daily', 'phrases'],
    ['Nie zrozumiałem komunikatu.', 'Я не зрозумів оголошення.', 'Я не понял объявление.', 'I didn’t understand the announcement.'], { ja: 'zrozumiem', past: 'zrozumiał' }),
  w('głośniej', 'adv', 'A2', 'голосніше', 'громче', 'louder', ['daily', 'phrases'],
    ['Proszę mówić głośniej, tu jest hałas.', 'Говоріть голосніше, тут шумно.', 'Говорите громче, здесь шумно.', 'Please speak louder, it’s noisy here.']),
  w('wyraźnie', 'adv', 'B1', 'чітко, виразно', 'чётко, внятно', 'clearly', ['daily', 'phrases'],
    ['Mówi pani bardzo wyraźnie.', 'Ви говорите дуже чітко.', 'Вы говорите очень внятно.', 'You speak very clearly.']),
  w('znaczyć', 'verb', 'A2', 'означати', 'значить, означать', 'to mean', ['daily', 'phrases'],
    ['Co znaczy to słowo?', 'Що означає це слово?', 'Что значит это слово?', 'What does this word mean?'], { ja: 'znaczę', he: 'znaczy' }),
  w('dosłyszeć', 'verb', 'B1', 'розчути', 'расслышать', 'to catch (hear properly)', ['daily', 'phrases'],
    ['Przepraszam, nie dosłyszałem ostatniego zdania.', 'Вибачте, я не розчув останнє речення.', 'Простите, я не расслышал последнее предложение.', 'Sorry, I didn’t catch the last sentence.'], { ja: 'dosłyszę', past: 'dosłyszał' }),

  // ── Оголошення: komunikat, nieczynny, prosimy o… ──
  w('komunikat', 'noun', 'B1', 'оголошення, повідомлення', 'объявление, сообщение', 'announcement', ['transport', 'city'],
    ['Uwaga, ważny komunikat dla pasażerów!', 'Увага, важливе оголошення для пасажирів!', 'Внимание, важное объявление для пассажиров!', 'Attention, an important announcement for passengers!'], { pl: 'komunikaty' }),
  w('odjechać', 'verb', 'A2', 'від’їхати', 'отправиться, отъехать', 'to depart (of a vehicle)', ['transport'],
    ['Pociąg odjedzie z peronu trzeciego.', 'Потяг від’їде з третьої платформи.', 'Поезд отправится с третьей платформы.', 'The train will leave from platform three.'], { ja: 'odjadę', past: 'odjechał', he: 'odjedzie' }),
  w('nieczynny', 'adj', 'B1', 'не працює, закритий', 'не работает, закрыт', 'closed, out of order', ['shopping', 'city'],
    ['Kasa numer dwa jest nieczynna.', 'Каса номер два не працює.', 'Касса номер два не работает.', 'Checkout number two is closed.'], { f: 'nieczynna' }),
  w('zachować', 'verb', 'B1', 'зберегти, дотримуватися', 'сохранить, соблюдать', 'to keep, to maintain', ['daily', 'phrases'],
    ['Prosimy zachować spokój.', 'Просимо зберігати спокій.', 'Просим сохранять спокойствие.', 'Please remain calm.'], { ja: 'zachowam', past: 'zachował' }),
  w('ostrożność', 'noun', 'B1', 'обережність', 'осторожность', 'caution', ['daily', 'phrases'],
    ['Prosimy o zachowanie ostrożności.', 'Просимо дотримуватися обережності.', 'Просим соблюдать осторожность.', 'Please take care.'], { gen: 'ostrożności' }),
  w('prosić', 'verb', 'A2', 'просити', 'просить', 'to ask, to request', ['phrases', 'daily'],
    ['Prosimy o zajęcie miejsc.', 'Просимо зайняти місця.', 'Просим занять места.', 'Please take your seats.'], { ja: 'proszę', past: 'prosił' }),

  // ── Телефон: naciśnij, oddzwonić, przeliterować ──
  w('infolinia', 'noun', 'B1', 'інфолінія, гаряча лінія', 'инфолиния, горячая линия', 'helpline', ['daily', 'documents'],
    ['Zadzwoń na infolinię, jeśli masz problem.', 'Подзвони на інфолінію, якщо маєш проблему.', 'Позвони на инфолинию, если у тебя проблема.', 'Call the helpline if you have a problem.'], { acc: 'infolinię' }),
  w('naciśnąć', 'verb', 'B1', 'натиснути', 'нажать', 'to press', ['daily'],
    ['Naciśnij jedynkę, aby połączyć się z konsultantem.', 'Натисни одиницю, щоб зв’язатися з консультантом.', 'Нажми единицу, чтобы соединиться с консультантом.', 'Press one to speak to an adviser.'], { ja: 'naciśnę', imp: 'naciśnij' }),
  w('połączenie', 'noun', 'B1', 'з’єднання, дзвінок', 'соединение, звонок', 'connection, call', ['daily'],
    ['Proszę czekać na połączenie z konsultantem.', 'Будь ласка, чекайте з’єднання з консультантом.', 'Пожалуйста, ожидайте соединения с консультантом.', 'Please wait to be connected to an adviser.'], { pl: 'połączenia' }),
  w('rozłączyć', 'verb', 'B1', 'роз’єднати (rozłączyć się — покласти слухавку)', 'разъединить (rozłączyć się — положить трубку)', 'to disconnect (rozłączyć się — to hang up)', ['daily'],
    ['Proszę się nie rozłączać.', 'Будь ласка, не кладіть слухавку.', 'Пожалуйста, не вешайте трубку.', 'Please don’t hang up.'], { ja: 'rozłączę', past: 'rozłączył' }),
  w('kropka', 'noun', 'A2', 'крапка', 'точка', 'dot, full stop', ['daily', 'phrases'],
    ['Mój adres to ania małpa poczta kropka pl.', 'Моя адреса — ania@poczta.pl.', 'Мой адрес — ania@poczta.pl.', 'My address is ania@poczta.pl.'], { pl: 'kropki' }),
  w('małpa', 'noun', 'B1', 'знак @ («равлик»; польською — «мавпа»)', 'знак @ («собака»; по-польски — «обезьяна»)', '@ sign (“monkey” in Polish)', ['daily', 'phrases'],
    ['W adresie e-mail najpierw mówimy małpa, a potem kropka.', 'В адресі пошти кажуть «мавпа», а потім «крапка».', 'В адресе почты говорят «обезьяна», а потом «точка».', 'In an e-mail address we say “małpa” first and “kropka” after it.'], { pl: 'małpy' }),
  w('przeliterować', 'verb', 'B1', 'назвати по літерах', 'назвать по буквам', 'to spell out', ['daily', 'phrases'],
    ['Czy może pan przeliterować nazwisko?', 'Чи не могли б ви назвати прізвище по літерах?', 'Не могли бы вы назвать фамилию по буквам?', 'Could you spell your surname?'], { ja: 'przeliteruję', past: 'przeliterował' }),

  // ── Числа на слух: około, ponad, najwyżej ──
  w('około', 'prep', 'B1', 'близько', 'около, приблизительно', 'about, approximately', ['numbers', 'time'],
    ['Do jeziora jest około pięciu kilometrów.', 'До озера близько п’яти кілометрів.', 'До озера около пяти километров.', 'It’s about five kilometres to the lake.']),
  w('prawie', 'adv', 'A2', 'майже', 'почти', 'almost', ['numbers', 'time'],
    ['Jest prawie dziesiąta.', 'Майже десята.', 'Почти десять.', 'It’s almost ten.']),
  w('ponad', 'prep', 'B1', 'понад, більше ніж', 'более, свыше', 'over, more than', ['numbers'],
    ['Na koncert przyszło ponad tysiąc osób.', 'На концерт прийшло понад тисячу людей.', 'На концерт пришло больше тысячи человек.', 'Over a thousand people came to the concert.']),
  w('najwyżej', 'adv', 'B1', 'щонайбільше, максимум', 'самое большее, максимум', 'at most', ['numbers', 'time'],
    ['To zajmie najwyżej godzinę.', 'Це займе щонайбільше годину.', 'Это займёт максимум час.', 'It will take an hour at most.']),
  w('procent', 'noun', 'A2', 'відсоток', 'процент', 'per cent', ['numbers', 'shopping'],
    ['Bilet jest tańszy o dwadzieścia procent.', 'Квиток дешевший на двадцять відсотків.', 'Билет дешевле на двадцать процентов.', 'The ticket is twenty per cent cheaper.'], { gen: 'procent' }),
  w('połowa', 'noun', 'B1', 'половина', 'половина', 'half', ['numbers'],
    ['Połowa uczniów mieszka za miastem.', 'Половина учнів живе за містом.', 'Половина учеников живёт за городом.', 'Half of the pupils live outside the city.'], { gen: 'połowy' }),

  // ── Озера Вармії: kajak, pomost, kąpielisko ──
  w('brzeg', 'noun', 'B1', 'берег', 'берег', 'shore, bank', ['nature'],
    ['Usiedliśmy na brzegu jeziora.', 'Ми сіли на березі озера.', 'Мы сели на берегу озера.', 'We sat down on the shore of the lake.'], { loc: 'brzegu' }),
  w('pomost', 'noun', 'B1', 'помост, пірс', 'мостки, пирс', 'jetty, pier', ['nature'],
    ['Z pomostu można wejść do wody.', 'З помосту можна зайти у воду.', 'С мостков можно зайти в воду.', 'You can get into the water from the jetty.'], { gen: 'pomostu' }),
  w('kajak', 'noun', 'A2', 'каяк', 'каяк, байдарка', 'kayak', ['nature', 'sport'],
    ['Wypożyczyliśmy kajak na dwie godziny.', 'Ми взяли каяк напрокат на дві години.', 'Мы взяли каяк напрокат на два часа.', 'We rented a kayak for two hours.'], { instr: 'kajakiem' }),
  w('kąpielisko', 'noun', 'B1', 'місце для купання (з охороною)', 'место для купания (с охраной)', 'bathing area', ['nature'],
    ['To kąpielisko jest strzeżone.', 'Це місце для купання під наглядом.', 'Это место для купания охраняется.', 'This bathing area is supervised.']),
  w('wypożyczalnia', 'noun', 'B1', 'прокат', 'прокат, пункт проката', 'rental shop', ['shopping', 'travel'],
    ['Wypożyczalnia kajaków jest przy pomoście.', 'Прокат каяків — біля помосту.', 'Прокат каяков — у мостков.', 'The kayak rental is by the jetty.'], { pl: 'wypożyczalnie' }),
  w('zakaz', 'noun', 'B1', 'заборона', 'запрет', 'ban, prohibition', ['city', 'phrases'],
    ['Uwaga, zakaz kąpieli!', 'Увага, купатися заборонено!', 'Внимание, купаться запрещено!', 'Attention, no swimming!'], { gen: 'zakazu' }),

  // ── Довгі описи: który, która, które ──
  w('który', 'pron', 'B1', 'який, котрий', 'который', 'which, who (relative)', ['grammar'],
    ['To jest jezioro, które lubię najbardziej.', 'Це озеро, яке я люблю найбільше.', 'Это озеро, которое я люблю больше всего.', 'This is the lake I like best.'], { f: 'która', n: 'które', pl: 'którzy / które' }),
  w('mieszkaniec', 'noun', 'B1', 'мешканець', 'житель', 'resident, inhabitant', ['city', 'people'],
    ['Mieszkańcy Olsztyna lubią spacery nad jeziorem.', 'Мешканці Ольштина люблять прогулянки над озером.', 'Жители Ольштына любят прогулки у озера.', 'The residents of Olsztyn like walks by the lake.'], { pl: 'mieszkańcy' }),
  w('szlak', 'noun', 'B1', 'туристичний маршрут', 'туристический маршрут', 'trail', ['nature', 'travel'],
    ['Ten szlak prowadzi przez las nad jezioro.', 'Цей маршрут веде лісом до озера.', 'Этот маршрут ведёт через лес к озеру.', 'This trail leads through the forest to the lake.'], { gen: 'szlaku' }),
  w('ścieżka', 'noun', 'A2', 'стежка, доріжка', 'тропинка, дорожка', 'path', ['nature', 'city'],
    ['Ścieżka rowerowa biegnie wzdłuż brzegu.', 'Велодоріжка тягнеться вздовж берега.', 'Велодорожка идёт вдоль берега.', 'The cycle path runs along the shore.'], { pl: 'ścieżki' }),
  w('kraina', 'noun', 'B1', 'край (місцевість)', 'край (местность)', 'land, region', ['nature', 'travel'],
    ['Mazury to kraina tysiąca jezior.', 'Мазури — край тисячі озер.', 'Мазуры — край тысячи озёр.', 'Masuria is a land of a thousand lakes.'], { gen: 'krainy' }),

  // ── Замок і аудіогід: zbudowano, założono, słychać ──
  w('mur', 'noun', 'B1', 'мур, оборонна стіна', 'стена (оборонная)', 'wall (defensive)', ['city'],
    ['Mury zamku mają ponad sześćset lat.', 'Мурам замку понад шістсот років.', 'Стенам замка больше шестисот лет.', 'The castle walls are over six hundred years old.'], { pl: 'mury' }),
  w('audioprzewodnik', 'noun', 'B1', 'аудіогід', 'аудиогид', 'audio guide', ['travel', 'city'],
    ['Wzięliśmy audioprzewodnik po polsku i po angielsku.', 'Ми взяли аудіогід польською й англійською.', 'Мы взяли аудиогид на польском и английском.', 'We took an audio guide in Polish and English.']),
  w('zbudować', 'verb', 'B1', 'збудувати', 'построить', 'to build', ['city'],
    ['Zamek zbudowano w czternastym wieku.', 'Замок збудовано у чотирнадцятому столітті.', 'Замок построен в четырнадцатом веке.', 'The castle was built in the fourteenth century.'], { ja: 'zbuduję', past: 'zbudował', imp: 'zbudowano' }),
  w('założyć', 'verb', 'B1', 'заснувати', 'основать', 'to found', ['city'],
    ['Miasto założono w 1353 roku.', 'Місто засновано в 1353 році.', 'Город основан в 1353 году.', 'The city was founded in 1353.'], { ja: 'założę', past: 'założył', imp: 'założono' }),
  w('wiek', 'noun', 'A2', 'століття (також: вік)', 'век, столетие (также: возраст)', 'century (also: age)', ['calendar', 'city'],
    ['W czternastym wieku w Olsztynie zbudowano zamek.', 'У чотирнадцятому столітті в Ольштині збудували замок.', 'В четырнадцатом веке в Ольштыне построили замок.', 'In the fourteenth century a castle was built in Olsztyn.'], { loc: 'wieku' }),
  w('słychać', 'verb', 'B1', 'чути(ся)', 'слышно', 'to be audible', ['daily', 'city'],
    ['W sali słychać dźwięk dzwonu.', 'У залі чути звук дзвону.', 'В зале слышен звук колокола.', 'You can hear a bell in the hall.']),
  w('eksponat', 'noun', 'B1', 'експонат', 'экспонат', 'exhibit', ['city', 'travel'],
    ['Najstarszy eksponat pochodzi z czternastego wieku.', 'Найстаріший експонат походить із чотирнадцятого століття.', 'Самый старый экспонат происходит из четырнадцатого века.', 'The oldest exhibit comes from the fourteenth century.'], { pl: 'eksponaty' }),

  // ── Переказ почутого: według, z rozmowy wynika, natomiast ──
  w('według', 'prep', 'B1', 'за, згідно з (+ родовий)', 'по, согласно (+ родительный)', 'according to (+ genitive)', ['grammar', 'phrases'],
    ['Według prognozy jutro będzie padać.', 'За прогнозом завтра буде дощ.', 'Согласно прогнозу завтра будет дождь.', 'According to the forecast it will rain tomorrow.']),
  w('wynikać', 'verb', 'B1', 'випливати', 'следовать, вытекать', 'to follow from', ['grammar', 'phrases'],
    ['Z rozmowy wynika, że spotkanie jest w piątek.', 'З розмови випливає, що зустріч у п’ятницю.', 'Из разговора следует, что встреча в пятницу.', 'It follows from the conversation that the meeting is on Friday.'], { he: 'wynika' }),
  w('podsumować', 'verb', 'B1', 'підсумувати', 'подвести итог', 'to sum up', ['grammar', 'phrases'],
    ['Podsumuję to krótko.', 'Підсумую це коротко.', 'Подведу итог коротко.', 'Let me sum it up briefly.'], { ja: 'podsumuję', past: 'podsumował' }),
  w('dlatego', 'adv', 'A2', 'тому, ось чому', 'поэтому, потому', 'that’s why', ['grammar'],
    ['Pada deszcz, dlatego zostajemy w domu.', 'Іде дощ, тому ми залишаємося вдома.', 'Идёт дождь, поэтому мы остаёмся дома.', 'It’s raining, so we’re staying at home.']),
  w('jednak', 'conj', 'A2', 'проте, однак', 'однако, но', 'however', ['grammar'],
    ['Pogoda była zła, jednak poszliśmy na spacer.', 'Погода була погана, проте ми пішли гуляти.', 'Погода была плохая, однако мы пошли гулять.', 'The weather was bad, but we went for a walk anyway.']),
  w('natomiast', 'conj', 'B1', 'натомість, а ось', 'а вот, тогда как', 'whereas, on the other hand', ['grammar'],
    ['W Olsztynie jest jezioro, natomiast w Warszawie płynie Wisła.', 'В Ольштині є озеро, а у Варшаві тече Вісла.', 'В Ольштыне есть озеро, а в Варшаве течёт Висла.', 'Olsztyn has a lake, whereas the Vistula flows through Warsaw.']),
];
