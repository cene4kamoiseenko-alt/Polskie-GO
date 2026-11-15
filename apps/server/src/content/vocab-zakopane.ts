/**
 * Словник Закопаного (B2, фінал): культура й подорожі. Гори й погода (przełęcz, halny, lawina, kolejka linowa, zagrożenie, ostrzeżenie), górale й традиції
 * (góral, gwara, baca, bacówka, ciupaga, redyk), Крупівки (kicz, targować się, gwarny, nachalny, stragan, rękodzieło), Віткацій і мистецтво (twórca, dzieło,
 * malarz, zainspirowany, uznawany za, nurt, awangarda), лижі (wyciąg, stok, instruktor, zjazd, narciarz, snowboard), поїздка й офіційні листи (pensjonat,
 * zakwaterowanie, anulować, opłata, w związku z, z powodu), дискусія про туризм (owszem, niemniej, ochrona przyrody, turystyka masowa, korzyść, zaleta, wpływ)
 * і прощання (wspomnienie, pożegnanie, wdzięczny, podziękować, spełnić marzenie, na zakończenie).
 * Слова oscypek, pamiątka, deptak, karnet, kask, nocleg, rezerwacja, zameldować się, mgła, ratownik, podsumować, marzenie, przyroda вже є в словнику.
 */
import { w } from './vocab-city';
import type { VocabSeed } from './vocab';

export const ZAKOPANE_VOCAB: VocabSeed[] = [
  // ── Гори й погода ──
  w('przełęcz', 'noun', 'B2', 'гірський перевал', 'горный перевал', 'mountain pass', ['nature', 'travel'],
    ['Z przełęczy widać dolinę i schronisko poniżej.', 'З перевалу видно долину й притулок внизу.', 'С перевала видна долина и приют внизу.', 'From the pass you can see the valley and the hut below.'], { gen: 'przełęczy', pl: 'przełęcze' }),
  w('halny', 'noun', 'B2', 'гальний — теплий сильний гірський вітер (фен)', 'гальный — тёплый сильный горный ветер (фён)', 'halny — a warm, strong mountain wind (foehn)', ['nature', 'weather'],
    ['Podczas halnego kolejka linowa nie kursuje.', 'Під час гальнего канатна дорога не їздить.', 'Во время гальнего канатная дорога не ходит.', 'The cable car does not run when the halny is blowing.'], { gen: 'halnego' }),
  w('lawina', 'noun', 'B2', 'лавина', 'лавина', 'avalanche', ['nature', 'travel'],
    ['Zimą w Tatrach grozi lawina.', 'Узимку в Татрах загрожує лавина.', 'Зимой в Татрах грозит лавина.', 'In winter there is a risk of an avalanche in the Tatras.'], { gen: 'lawiny', instr: 'lawiną' }),
  w('kolejka linowa', 'phrase', 'B2', 'канатна дорога', 'канатная дорога', 'cable car', ['travel', 'city'],
    ['Kolejką linową wjeżdżamy na Kasprowy Wierch.', 'Канатною дорогою ми піднімаємося на Каспровий Верх.', 'На канатной дороге мы поднимаемся на Каспровы-Верх.', 'We take the cable car up to Kasprowy Wierch.']),
  w('zagrożenie', 'noun', 'B2', 'небезпека, загроза', 'опасность, угроза', 'danger, hazard', ['nature', 'phrases'],
    ['Obowiązuje trzeci stopień zagrożenia lawinowego.', 'Діє третій ступінь лавинної небезпеки.', 'Действует третья степень лавинной опасности.', 'Avalanche danger level three is in force.'], { gen: 'zagrożenia' }),
  w('ostrzeżenie', 'noun', 'B2', 'попередження, застереження', 'предупреждение', 'warning', ['phrases', 'nature'],
    ['Przed wyjściem w góry sprawdź ostrzeżenia o pogodzie.', 'Перш ніж іти в гори, перевір попередження про погоду.', 'Прежде чем идти в горы, проверь предупреждения о погоде.', 'Check the weather warnings before heading into the mountains.'], { gen: 'ostrzeżenia', pl: 'ostrzeżenia' }),

  // ── Górale й традиції ──
  w('góral', 'noun', 'B2', 'горянин (мешканець Підгалля)', 'горец (житель Подгалья)', 'highlander (from Podhale)', ['culture', 'people'],
    ['Górale mówią własną gwarą i dbają o tradycje.', 'Горяни розмовляють власним говором і дбають про традиції.', 'Горцы говорят на собственном говоре и берегут традиции.', 'The highlanders speak their own dialect and look after their traditions.'], { gen: 'górala', pl: 'górale' }),
  w('gwara', 'noun', 'B2', 'говір, діалект', 'говор, диалект', 'dialect', ['culture', 'phrases'],
    ['Na Podhalu słychać gwarę góralską.', 'На Підгаллі чути гірський говір.', 'На Подгалье слышен горский говор.', 'You can hear the highland dialect in Podhale.'], { gen: 'gwary', instr: 'gwarą' }),
  w('baca', 'noun', 'B2', 'баца — головний пастух отари', 'баца — главный пастух отары', 'baca — the head shepherd', ['culture', 'people'],
    ['Baca decyduje, kiedy owce wychodzą na halę.', 'Баца вирішує, коли вівці виходять на полонину.', 'Баца решает, когда овцы выходят на гору-пастбище.', 'The baca decides when the sheep go up to the pasture.'], { gen: 'bacy', pl: 'bacowie' }),
  w('bacówka', 'noun', 'B2', 'бацівка — пастуша хата на пасовищі', 'бацувка — пастушья хижина на пастбище', 'bacówka — a shepherd’s hut', ['culture', 'travel'],
    ['W bacówce robi się oscypki z mleka owczego.', 'У бацівці з овечого молока роблять осципки.', 'В бацувке делают осципки из овечьего молока.', 'Oscypek cheeses are made from sheep’s milk in the bacówka.'], { gen: 'bacówki', loc: 'bacówce' }),
  w('ciupaga', 'noun', 'B2', 'ціпага — гірська палиця з обухом', 'ципага — горский посох с топориком', 'ciupaga — a highlander’s walking axe', ['culture', 'travel'],
    ['Ciupaga to laska górali z metalowym toporkiem.', 'Ціпага — це палиця горян із металевою сокирою.', 'Ципага — это посох горцев с металлическим топориком.', 'The ciupaga is a highlander’s stick with a small metal axe head.'], { gen: 'ciupagi', acc: 'ciupagę' }),
  w('redyk', 'noun', 'B2', 'редик — весняний вихід овець на полонини', 'редык — весеннее восхождение овец на пастбища', 'redyk — the spring drive of sheep to the pastures', ['culture', 'holidays'],
    ['Wiosenny redyk przyciąga tłumy turystów.', 'Весняний редик приваблює натовпи туристів.', 'Весенний редык привлекает толпы туристов.', 'The spring redyk attracts crowds of tourists.'], { gen: 'redyku' }),

  // ── Крупівки ──
  w('kicz', 'noun', 'B2', 'кітч, несмак', 'кич, безвкусица', 'kitsch', ['shopping', 'culture'],
    ['Na straganach jest sporo kiczu, ale zdarza się też ładne rękodzieło.', 'На ятках багато кітчу, але трапляється й гарне рукоділля.', 'На прилавках много кича, но попадается и красивое рукоделие.', 'There is plenty of kitsch at the stalls, but also some fine handicraft.'], { gen: 'kiczu' }),
  w('targować się', 'verb', 'B2', 'торгуватися', 'торговаться', 'to haggle', ['shopping', 'phrases'],
    ['Na straganach można targować się o cenę.', 'На ятках можна торгуватися про ціну.', 'На прилавках можно торговаться о цене.', 'You can haggle over the price at the stalls.'], { ja: 'targuję się', past: 'targował się' }),
  w('gwarny', 'adj', 'B2', 'гамірний, багатолюдний', 'шумный, многолюдный', 'bustling, noisy', ['city', 'phrases'],
    ['Wieczorem deptak jest gwarny i pełen ludzi.', 'Увечері пішохідна вулиця гамірна й повна людей.', 'Вечером пешеходная улица шумная и полна людей.', 'In the evening the promenade is bustling and full of people.'], { f: 'gwarna', n: 'gwarne' }),
  w('nachalny', 'adj', 'B2', 'нав’язливий', 'навязчивый', 'pushy, obtrusive', ['shopping', 'people'],
    ['Nachalni sprzedawcy zaczepiają przechodniów.', 'Нав’язливі продавці чіпляють перехожих.', 'Навязчивые продавцы пристают к прохожим.', 'Pushy vendors approach passers-by.'], { f: 'nachalna', n: 'nachalne' }),
  w('stragan', 'noun', 'B2', 'ятка, прилавок', 'прилавок, лоток', 'market stall', ['shopping', 'city'],
    ['Na straganie kupiłem ręcznie robiony sweter.', 'На ятці я купив светр ручної роботи.', 'На прилавке я купил свитер ручной работы.', 'I bought a hand-made sweater at a stall.'], { gen: 'straganu', loc: 'straganie', pl: 'stragany' }),
  w('rękodzieło', 'noun', 'B2', 'рукоділля, вироби ручної роботи', 'рукоделие, изделия ручной работы', 'handicraft', ['shopping', 'culture'],
    ['Najlepsze rękodzieło kupisz na bocznych straganach.', 'Найкраще рукоділля купиш на бічних ятках.', 'Лучшее рукоделие купишь на боковых прилавках.', 'You can buy the best handicraft at the side stalls.'], { gen: 'rękodzieła' }),

  // ── Віткацій і мистецтво ──
  w('twórca', 'noun', 'B2', 'творець, автор', 'создатель, автор', 'creator, originator', ['culture', 'people'],
    ['Stanisław Witkiewicz był twórcą stylu zakopiańskiego.', 'Станіслав Віткевич був творцем закопанського стилю.', 'Станислав Виткевич был создателем закопанского стиля.', 'Stanisław Witkiewicz was the creator of the Zakopane style.'], { gen: 'twórcy', pl: 'twórcy' }),
  w('dzieło', 'noun', 'B2', 'твір (мистецтва)', 'произведение (искусства)', 'a work (of art)', ['culture', 'phrases'],
    ['W muzeum wiszą dzieła znanych polskich artystów.', 'У музеї висять твори відомих польських митців.', 'В музее висят произведения известных польских художников.', 'The museum displays works by well-known Polish artists.'], { gen: 'dzieła', pl: 'dzieła' }),
  w('malarz', 'noun', 'B2', 'художник-живописець', 'художник-живописец', 'painter', ['culture', 'people'],
    ['Witkacy był malarzem, pisarzem i filozofem.', 'Віткацій був живописцем, письменником і філософом.', 'Виткаций был живописцем, писателем и философом.', 'Witkacy was a painter, a writer and a philosopher.'], { gen: 'malarza', pl: 'malarze' }),
  w('zainspirowany', 'adj', 'B2', 'натхненний, під впливом (чогось)', 'вдохновлённый (чем-то)', 'inspired (by something)', ['culture', 'phrases'],
    ['Zainspirowany górami, namalował serię pejzaży.', 'Натхненний горами, він намалював серію пейзажів.', 'Вдохновлённый горами, он написал серию пейзажей.', 'Inspired by the mountains, he painted a series of landscapes.'], { f: 'zainspirowana', n: 'zainspirowane' }),
  w('uznawany za', 'phrase', 'B2', 'вважається (кимось)', 'считается (кем-то)', 'regarded as', ['culture', 'phrases'],
    ['Jest uznawany za jednego z najważniejszych twórców awangardy.', 'Його вважають одним із найважливіших творців авангарду.', 'Его считают одним из важнейших создателей авангарда.', 'He is regarded as one of the most important creators of the avant-garde.']),
  w('nurt', 'noun', 'B2', 'течія, напрям (у мистецтві)', 'течение, направление (в искусстве)', 'a current, a trend (in art)', ['culture'],
    ['To jeden z najciekawszych nurtów w sztuce dwudziestego wieku.', 'Це одна з найцікавіших течій у мистецтві двадцятого століття.', 'Это одно из интереснейших течений в искусстве двадцатого века.', 'It is one of the most interesting currents in twentieth-century art.'], { gen: 'nurtu' }),
  w('awangarda', 'noun', 'B2', 'авангард', 'авангард', 'the avant-garde', ['culture'],
    ['Awangarda przełamywała dawne zasady w sztuce.', 'Авангард ламав давні правила в мистецтві.', 'Авангард ломал прежние правила в искусстве.', 'The avant-garde broke the old rules of art.'], { gen: 'awangardy' }),

  // ── Лижі ──
  w('wyciąg', 'noun', 'B2', 'витяг, підйомник (на лижному схилі)', 'подъёмник (на лыжном склоне)', 'ski lift', ['travel', 'sport'],
    ['Przy dolnej stacji wyciągu stoi długa kolejka.', 'Біля нижньої станції витягу стоїть довга черга.', 'У нижней станции подъёмника стоит длинная очередь.', 'There is a long queue at the bottom station of the lift.'], { gen: 'wyciągu', pl: 'wyciągi' }),
  w('stok', 'noun', 'B2', 'схил (для катання)', 'склон (для катания)', 'ski slope', ['travel', 'sport'],
    ['Na stoku obowiązują zasady bezpieczeństwa.', 'На схилі діють правила безпеки.', 'На склоне действуют правила безопасности.', 'Safety rules apply on the slope.'], { gen: 'stoku', loc: 'stoku' }),
  w('instruktor', 'noun', 'B2', 'інструктор', 'инструктор', 'instructor', ['sport', 'people'],
    ['Instruktor pokazał nam, jak bezpiecznie hamować.', 'Інструктор показав нам, як безпечно гальмувати.', 'Инструктор показал нам, как безопасно тормозить.', 'The instructor showed us how to brake safely.'], { gen: 'instruktora', pl: 'instruktorzy' }),
  w('zjazd', 'noun', 'B2', 'спуск (зі схилу)', 'спуск (со склона)', 'a run, a descent', ['sport', 'travel'],
    ['Pierwszy zjazd z górnej stacji był najtrudniejszy.', 'Перший спуск від верхньої станції був найважчим.', 'Первый спуск от верхней станции был самым трудным.', 'The first run from the upper station was the hardest.'], { gen: 'zjazdu' }),
  w('narciarz', 'noun', 'B2', 'лижник', 'лыжник', 'skier', ['sport', 'people'],
    ['Doświadczeni narciarze jeżdżą poza wyznaczonymi trasami.', 'Досвідчені лижники їздять поза визначеними трасами.', 'Опытные лыжники ездят вне обозначенных трасс.', 'Experienced skiers go beyond the marked runs.'], { gen: 'narciarza', pl: 'narciarze' }),
  w('snowboard', 'noun', 'B2', 'сноуборд', 'сноуборд', 'snowboard', ['sport'],
    ['Wypożyczył snowboard na cały tydzień.', 'Він узяв сноуборд напрокат на цілий тиждень.', 'Он взял сноуборд напрокат на всю неделю.', 'He rented a snowboard for the whole week.'], { gen: 'snowboardu' }),

  // ── Поїздка й офіційні листи ──
  w('pensjonat', 'noun', 'B2', 'пансіонат, невеликий готель', 'пансионат, небольшая гостиница', 'guesthouse', ['travel', 'city'],
    ['Zarezerwowaliśmy pokój w pensjonacie pod Giewontem.', 'Ми забронювали кімнату в пансіонаті під Гевонтом.', 'Мы забронировали комнату в пансионате под Гевонтом.', 'We booked a room in a guesthouse below Giewont.'], { gen: 'pensjonatu', loc: 'pensjonacie' }),
  w('zakwaterowanie', 'noun', 'B2', 'розміщення, проживання', 'размещение, проживание', 'accommodation', ['travel', 'documents'],
    ['Cena obejmuje zakwaterowanie i śniadania.', 'У ціну входять проживання й сніданки.', 'В цену входят проживание и завтраки.', 'The price includes accommodation and breakfasts.'], { gen: 'zakwaterowania' }),
  w('anulować', 'verb', 'B2', 'скасувати (бронювання)', 'отменить (бронь)', 'to cancel', ['travel', 'documents'],
    ['Muszę anulować rezerwację z powodu choroby.', 'Мушу скасувати бронювання через хворобу.', 'Мне нужно отменить бронь из-за болезни.', 'I have to cancel the booking because of illness.'], { ja: 'anuluję', past: 'anulował' }),
  w('opłata', 'noun', 'B2', 'плата, збір', 'плата, сбор', 'fee, charge', ['documents', 'shopping'],
    ['Opłata za pokój obejmuje podatek miejscowy.', 'Плата за кімнату включає місцевий податок.', 'Плата за комнату включает местный налог.', 'The room fee includes the local tax.'], { gen: 'opłaty', pl: 'opłaty' }),
  w('w związku z', 'phrase', 'B2', 'у зв’язку з (+ орудний)', 'в связи с (+ творительный)', 'in connection with (+ instrumental)', ['documents', 'phrases'],
    ['W związku z remontem pensjonat będzie zamknięty.', 'У зв’язку з ремонтом пансіонат буде зачинений.', 'В связи с ремонтом пансионат будет закрыт.', 'The guesthouse will be closed owing to renovation.']),
  w('z powodu', 'phrase', 'B2', 'через, з причини (+ родовий)', 'из-за, по причине (+ родительный)', 'because of (+ genitive)', ['documents', 'phrases'],
    ['Z powodu choroby nie mogę przyjechać.', 'Через хворобу я не можу приїхати.', 'Из-за болезни я не могу приехать.', 'I cannot come because of illness.']),

  // ── Дискусія про туризм ──
  w('owszem', 'adv', 'B2', 'звісно, так (із застереженням)', 'разумеется, да (с оговоркой)', 'indeed, admittedly', ['phrases'],
    ['Owszem, szlaki są zatłoczone, ale widoki są warte wysiłku.', 'Звісно, стежки переповнені, але краєвиди варті зусиль.', 'Разумеется, тропы переполнены, но виды стоят усилий.', 'Admittedly the trails are crowded, but the views are worth the effort.']),
  w('niemniej', 'adv', 'B2', 'проте, тим не менш', 'тем не менее', 'nevertheless', ['phrases'],
    ['Ochrona przyrody jest ważna, niemniej mieszkańcy potrzebują dochodów.', 'Охорона природи важлива, проте мешканцям потрібні доходи.', 'Охрана природы важна, тем не менее жителям нужны доходы.', 'Nature protection matters, nevertheless the residents need an income.']),
  w('ochrona przyrody', 'phrase', 'B2', 'охорона природи', 'охрана природы', 'nature protection', ['nature', 'phrases'],
    ['Ochrona przyrody jest zadaniem parku narodowego.', 'Охорона природи — завдання національного парку.', 'Охрана природы — задача национального парка.', 'Nature protection is the task of the national park.']),
  w('turystyka masowa', 'phrase', 'B2', 'масовий туризм', 'массовый туризм', 'mass tourism', ['travel', 'phrases'],
    ['Turystyka masowa zmienia charakter górskich miejscowości.', 'Масовий туризм змінює характер гірських містечок.', 'Массовый туризм меняет характер горных городков.', 'Mass tourism changes the character of mountain towns.']),
  w('korzyść', 'noun', 'B2', 'вигода, користь', 'выгода, польза', 'benefit, advantage', ['phrases', 'work'],
    ['Turystyka przynosi mieszkańcom wiele korzyści.', 'Туризм приносить мешканцям багато вигод.', 'Туризм приносит жителям много выгод.', 'Tourism brings the residents many benefits.'], { gen: 'korzyści', pl: 'korzyści' }),
  w('zaleta', 'noun', 'B2', 'перевага, достоїнство', 'преимущество, достоинство', 'advantage, merit', ['phrases'],
    ['Największą zaletą tego miejsca jest cisza.', 'Найбільша перевага цього місця — тиша.', 'Главное достоинство этого места — тишина.', 'The greatest advantage of this place is the quiet.'], { gen: 'zalety', pl: 'zalety' }),
  w('wpływ', 'noun', 'B2', 'вплив', 'влияние', 'influence, impact', ['phrases'],
    ['Turystyka ma duży wpływ na przyrodę Tatr.', 'Туризм має великий вплив на природу Татр.', 'Туризм оказывает большое влияние на природу Татр.', 'Tourism has a great impact on the nature of the Tatras.'], { gen: 'wpływu' }),

  // ── Прощання ──
  w('wspomnienie', 'noun', 'B2', 'спогад', 'воспоминание', 'a memory', ['phrases', 'family'],
    ['Zabieram z Polski wiele pięknych wspomnień.', 'Я забираю з Польщі багато гарних спогадів.', 'Я увожу из Польши много прекрасных воспоминаний.', 'I am taking many beautiful memories away from Poland.'], { gen: 'wspomnienia', pl: 'wspomnienia' }),
  w('pożegnanie', 'noun', 'B2', 'прощання', 'прощание', 'a farewell', ['phrases', 'family'],
    ['Na pożegnanie obiecał, że jeszcze wróci.', 'На прощання він пообіцяв, що ще повернеться.', 'На прощание он пообещал, что ещё вернётся.', 'As a farewell he promised that he would come back.'], { gen: 'pożegnania' }),
  w('wdzięczny', 'adj', 'B2', 'вдячний', 'благодарный', 'grateful', ['phrases', 'family'],
    ['Jestem wdzięczny wszystkim za cierpliwość.', 'Я вдячний усім за терпіння.', 'Я благодарен всем за терпение.', 'I am grateful to everyone for their patience.'], { f: 'wdzięczna', n: 'wdzięczne' }),
  w('podziękować', 'verb', 'B2', 'подякувати (комусь за щось)', 'поблагодарить (кого-то за что-то)', 'to thank (someone for something)', ['phrases', 'family'],
    ['Chciałbym podziękować wszystkim za pomoc.', 'Я хотів би подякувати всім за допомогу.', 'Я хотел бы поблагодарить всех за помощь.', 'I would like to thank everyone for their help.'], { ja: 'podziękuję', past: 'podziękował' }),
  w('spełnić marzenie', 'phrase', 'B2', 'здійснити мрію', 'осуществить мечту', 'to fulfil a dream', ['phrases', 'family'],
    ['Dzięki tej podróży spełniłem swoje marzenie.', 'Завдяки цій подорожі я здійснив свою мрію.', 'Благодаря этому путешествию я осуществил свою мечту.', 'This journey let me fulfil my dream.']),
  w('na zakończenie', 'phrase', 'B2', 'наприкінці, на завершення', 'в завершение, напоследок', 'in closing', ['phrases'],
    ['Na zakończenie pozwolę sobie podziękować wszystkim.', 'Наприкінці дозвольте мені подякувати всім.', 'В завершение позвольте мне поблагодарить всех.', 'In closing, allow me to thank everyone.']),
];
