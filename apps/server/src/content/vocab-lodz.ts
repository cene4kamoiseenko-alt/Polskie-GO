/**
 * Словник Лодзі (розширення курсу): робота й пошук роботи, склад і безпека, графік і зарплата,
 * відпустка й лікарняний, тіло й здоров'я, аптека, ранок і час, вечір на Piotrkowskiej.
 * Кожне слово має природний приклад із перекладом. Приблизне прочитання будується за правилами (pron.ts).
 */
import { polishCyrillic } from '@polski-go/shared';
import { t } from './builders';
import type { VocabSeed } from './vocab';

type Ex = [pl: string, uk: string, ru: string, en: string];

/** Абревіатури читаються за назвами літер, а не за правилами: CV — «це-фау». */
const SPELLED: Record<string, string> = { CV: 'це-фау' };

const w = (pl: string, pos: string, uk: string, ru: string, en: string, topics: string[], ex: Ex, forms?: Record<string, string>): VocabSeed => ({
  pl, pos, tr: t(uk, ru, en), pron: SPELLED[pl] ?? polishCyrillic(pl, 'uk').replace(/́/g, ''), cefr: 'A1', topics, forms,
  examples: [{ pl: ex[0], tr: t(ex[1], ex[2], ex[3]) }],
});

export const LODZ_VOCAB: VocabSeed[] = [
  // ── Де ти працюєш ──
  w('fabryka', 'noun', 'фабрика, завод', 'фабрика, завод', 'factory', ['work', 'factory'],
    ['Mój wujek pracuje w fabryce mebli.', 'Мій дядько працює на меблевій фабриці.', 'Мой дядя работает на мебельной фабрике.', 'My uncle works in a furniture factory.'], { loc: 'w fabryce' }),
  w('biuro', 'noun', 'офіс, бюро', 'офис, бюро', 'office', ['work'],
    ['Biuro jest na trzecim piętrze.', 'Офіс на четвертому поверсі.', 'Офис на четвёртом этаже.', 'The office is on the third floor.'], { loc: 'w biurze' }),
  w('szpital', 'noun', 'лікарня', 'больница', 'hospital', ['work', 'medicine'],
    ['Szpital jest blisko dworca.', 'Лікарня недалеко від вокзалу.', 'Больница недалеко от вокзала.', 'The hospital is near the station.'], { loc: 'w szpitalu' }),
  w('budowa', 'noun', 'будова, будівництво', 'стройка', 'building site', ['work'],
    ['Na budowie trzeba nosić kask.', 'На будові треба носити каску.', 'На стройке нужно носить каску.', 'You have to wear a helmet on a building site.'], { loc: 'na budowie' }),
  w('firma', 'noun', 'фірма, компанія', 'фирма, компания', 'company', ['work'],
    ['To jest mała firma rodzinna.', 'Це маленька сімейна фірма.', 'Это маленькая семейная фирма.', 'It is a small family company.']),
  w('magazynier', 'noun', 'комірник, працівник складу', 'кладовщик, работник склада', 'warehouse worker', ['work', 'factory'],
    ['Magazynier przyjmuje towar rano.', 'Комірник приймає товар зранку.', 'Кладовщик принимает товар утром.', 'The warehouse worker takes in the goods in the morning.']),
  w('pielęgniarka', 'noun', 'медсестра', 'медсестра', 'nurse', ['work', 'medicine'],
    ['Pielęgniarka mierzy mi temperaturę.', 'Медсестра міряє мені температуру.', 'Медсестра измеряет мне температуру.', 'The nurse takes my temperature.']),
  w('kucharz', 'noun', 'кухар', 'повар', 'cook', ['work', 'food'],
    ['Kucharz gotuje zupę pomidorową.', 'Кухар варить томатний суп.', 'Повар варит томатный суп.', 'The cook is making tomato soup.']),

  // ── Шукаю роботу ──
  w('szukać', 'verb', 'шукати', 'искать', 'to look for', ['work'],
    ['Szukam pracy w Łodzi.', 'Я шукаю роботу в Лодзі.', 'Я ищу работу в Лодзи.', 'I\'m looking for a job in Łódź.']),
  w('oferta pracy', 'noun', 'вакансія, пропозиція роботи', 'вакансия, предложение работы', 'job offer', ['work'],
    ['Ta oferta pracy jest na stronie firmy.', 'Ця вакансія — на сайті фірми.', 'Эта вакансия — на сайте фирмы.', 'This job offer is on the company\'s website.']),
  w('CV', 'noun', 'резюме (CV)', 'резюме (CV)', 'CV', ['work', 'documents'],
    ['Wysłałem CV wczoraj wieczorem.', 'Я надіслав резюме вчора ввечері.', 'Я отправил резюме вчера вечером.', 'I sent my CV yesterday evening.']),
  w('doświadczenie', 'noun', 'досвід', 'опыт', 'experience', ['work'],
    ['Mam dwa lata doświadczenia w magazynie.', 'У мене два роки досвіду на складі.', 'У меня два года опыта на складе.', 'I have two years\' experience in a warehouse.']),
  w('agencja pracy', 'noun', 'кадрове агентство', 'кадровое агентство', 'employment agency', ['work'],
    ['Agencja pracy szuka magazynierów.', 'Кадрове агентство шукає працівників складу.', 'Кадровое агентство ищет работников склада.', 'The agency is looking for warehouse workers.']),
  w('pełny etat', 'phrase', 'повна ставка', 'полная ставка', 'full-time job', ['work'],
    ['Szukam pracy na pełny etat.', 'Шукаю роботу на повну ставку.', 'Ищу работу на полную ставку.', 'I\'m looking for a full-time job.']),
  w('na godzinę', 'phrase', 'за годину (погодинно)', 'в час (почасово)', 'per hour', ['work'],
    ['Stawka to trzydzieści złotych na godzinę.', 'Ставка — тридцять злотих за годину.', 'Ставка — тридцать злотых в час.', 'The rate is thirty zlotys per hour.']),
  w('stawka', 'noun', 'ставка (оплати)', 'ставка (оплаты)', 'pay rate', ['work'],
    ['Jaka jest stawka za nadgodziny?', 'Яка ставка за понаднормові?', 'Какая ставка за сверхурочные?', 'What is the overtime rate?']),

  // ── Співбесіда ──
  w('rozmowa kwalifikacyjna', 'noun', 'співбесіда', 'собеседование', 'job interview', ['work'],
    ['Rozmowa kwalifikacyjna jest we wtorek.', 'Співбесіда у вівторок.', 'Собеседование во вторник.', 'The job interview is on Tuesday.']),
  w('prawo jazdy', 'noun', 'посвідчення водія', 'водительские права', 'driving licence', ['work', 'documents'],
    ['Czy ma pan prawo jazdy kategorii B?', 'У вас є посвідчення водія категорії B?', 'У вас есть водительские права категории B?', 'Do you have a category B driving licence?']),
  w('od kiedy', 'phrase', 'з якого часу, відколи', 'с какого времени, с каких пор', 'since when; from when', ['work', 'time'],
    ['Od kiedy może pani zacząć?', 'З якого часу ви можете почати?', 'С какого времени вы можете начать?', 'When can you start?']),
  w('zacząć', 'verb', 'почати', 'начать', 'to start', ['work', 'time'],
    ['Mogę zacząć od poniedziałku.', 'Можу почати з понеділка.', 'Могу начать с понедельника.', 'I can start on Monday.']),
  w('umieć', 'verb', 'уміти', 'уметь', 'to be able to, can (skill)', ['work'],
    ['Umiem obsługiwać wózek widłowy.', 'Я вмію керувати навантажувачем.', 'Я умею управлять погрузчиком.', 'I can operate a forklift.']),

  // ── Перший день: безпека ──
  w('kask', 'noun', 'каска', 'каска', 'safety helmet', ['work', 'factory'],
    ['Kask leży w szafce.', 'Каска лежить у шафці.', 'Каска лежит в шкафчике.', 'The helmet is in the locker.']),
  w('rękawice', 'noun', 'рукавиці', 'перчатки (рабочие)', 'work gloves', ['work', 'factory'],
    ['Bez rękawic nie dotykaj kartonów.', 'Без рукавиць не чіпай коробки.', 'Без перчаток не трогай коробки.', 'Don\'t touch the boxes without gloves.']),
  w('kamizelka', 'noun', 'жилет (світловідбивний)', 'жилет (светоотражающий)', 'hi-vis vest', ['work', 'factory'],
    ['Na hali noszę żółtą kamizelkę.', 'У цеху я ношу жовтий жилет.', 'В цеху я ношу жёлтый жилет.', 'I wear a yellow vest in the hall.']),
  w('szatnia', 'noun', 'роздягальня', 'раздевалка', 'changing room', ['work', 'factory'],
    ['Szatnia jest obok wejścia.', 'Роздягальня поруч із входом.', 'Раздевалка рядом со входом.', 'The changing room is next to the entrance.']),
  w('uwaga', 'noun', 'увага; обережно!', 'внимание; осторожно!', 'attention; watch out!', ['work', 'city'],
    ['Uwaga, wózek jedzie!', 'Обережно, їде навантажувач!', 'Осторожно, едет погрузчик!', 'Watch out, a forklift is coming!']),
  w('wyjście awaryjne', 'noun', 'аварійний вихід', 'аварийный выход', 'emergency exit', ['work', 'city'],
    ['Wyjście awaryjne jest na końcu hali.', 'Аварійний вихід — у кінці цеху.', 'Аварийный выход — в конце цеха.', 'The emergency exit is at the end of the hall.']),
  w('apteczka', 'noun', 'аптечка', 'аптечка', 'first-aid kit', ['work', 'medicine'],
    ['Apteczka wisi przy drzwiach.', 'Аптечка висить біля дверей.', 'Аптечка висит у двери.', 'The first-aid kit hangs by the door.']),

  // ── Зміни й графік ──
  w('grafik', 'noun', 'графік (змін)', 'график (смен)', 'rota, work schedule', ['work', 'time'],
    ['Grafik na przyszły tydzień wisi na tablicy.', 'Графік на наступний тиждень висить на дошці.', 'График на следующую неделю висит на доске.', 'Next week\'s rota is on the board.']),
  w('nadgodziny', 'noun', 'понаднормові години', 'сверхурочные (часы)', 'overtime', ['work'],
    ['W grudniu robimy dużo nadgodzin.', 'У грудні ми працюємо багато понаднормово.', 'В декабре у нас много сверхурочных.', 'We do a lot of overtime in December.']),
  w('zaczynać', 'verb', 'починати', 'начинать', 'to begin, to start (regularly)', ['work', 'time'],
    ['Zaczynam pracę o szóstej.', 'Я починаю роботу о шостій.', 'Я начинаю работу в шесть.', 'I start work at six.']),
  w('kończyć', 'verb', 'закінчувати', 'заканчивать', 'to finish (regularly)', ['work', 'time'],
    ['Kończę o czternastej.', 'Я закінчую о чотирнадцятій.', 'Я заканчиваю в четырнадцать.', 'I finish at two p.m.']),

  // ── Договір і зарплата ──
  w('umowa o pracę', 'noun', 'трудовий договір', 'трудовой договор', 'employment contract', ['work', 'documents'],
    ['Po okresie próbnym dostałem umowę o pracę.', 'Після випробувального терміну я отримав трудовий договір.', 'После испытательного срока я получил трудовой договор.', 'After the trial period I got an employment contract.']),
  w('umowa zlecenie', 'noun', 'договір доручення (цивільно-правовий)', 'договор поручения (гражданско-правовой)', 'contract of mandate (civil-law contract)', ['work', 'documents'],
    ['Na umowie zlecenie nie ma płatnego urlopu.', 'За договором доручення немає оплачуваної відпустки.', 'По договору поручения нет оплачиваемого отпуска.', 'A civil-law contract gives no paid holiday.']),
  w('pensja', 'noun', 'зарплата (місячна)', 'зарплата (месячная)', 'salary', ['work', 'bank'],
    ['Pensja przychodzi dziesiątego.', 'Зарплата приходить десятого числа.', 'Зарплата приходит десятого числа.', 'The salary comes on the tenth.']),
  w('brutto', 'adv', 'брутто (до податків)', 'брутто (до налогов)', 'gross (before tax)', ['work', 'bank'],
    ['W ogłoszeniu jest kwota brutto.', 'В оголошенні вказана сума брутто.', 'В объявлении указана сумма брутто.', 'The ad shows the gross amount.']),
  w('netto', 'adv', 'нетто («на руки»)', 'нетто («на руки»)', 'net (take-home)', ['work', 'bank'],
    ['Na rękę dostaję cztery tysiące netto.', 'На руки я отримую чотири тисячі нетто.', 'На руки я получаю четыре тысячи нетто.', 'I take home four thousand net.']),

  // ── Відпустка й лікарняний ──
  w('urlop', 'noun', 'відпустка', 'отпуск', 'leave, holiday (from work)', ['work'],
    ['W sierpniu biorę dwa tygodnie urlopu.', 'У серпні я беру два тижні відпустки.', 'В августе я беру две недели отпуска.', 'I\'m taking two weeks off in August.']),
  w('wolne', 'noun', 'вихідний, вільний час', 'выходной, свободное время', 'time off', ['work', 'time'],
    ['Jutro mam wolne.', 'Завтра в мене вихідний.', 'Завтра у меня выходной.', 'I have the day off tomorrow.']),
  w('chory', 'adj', 'хворий', 'больной', 'ill, sick', ['medicine'],
    ['Jestem chory i zostaję w domu.', 'Я хворий і залишаюся вдома.', 'Я болен и остаюсь дома.', 'I\'m ill and staying at home.'], { f: 'chora' }),
  w('zwolnienie lekarskie', 'noun', 'лікарняний', 'больничный', 'sick note, sick leave', ['work', 'medicine'],
    ['Lekarz wystawił mi zwolnienie lekarskie na trzy dni.', 'Лікар виписав мені лікарняний на три дні.', 'Врач выписал мне больничный на три дня.', 'The doctor gave me a sick note for three days.']),
  w('dzień wolny', 'noun', 'вихідний день', 'выходной день', 'day off', ['work', 'time'],
    ['Piątek to mój dzień wolny.', 'П\'ятниця — мій вихідний.', 'Пятница — мой выходной.', 'Friday is my day off.']),

  // ── Прохання на роботі ──
  w('wcześniej', 'adv', 'раніше', 'раньше', 'earlier', ['work', 'time'],
    ['Czy mogę dziś wyjść wcześniej?', 'Можна мені сьогодні піти раніше?', 'Можно мне сегодня уйти раньше?', 'Can I leave earlier today?']),
  w('spóźnić się', 'verb', 'запізнитися', 'опоздать', 'to be late', ['work', 'time'],
    ['Przepraszam, spóźnię się dziesięć minut.', 'Вибачте, я запізнюся на десять хвилин.', 'Извините, я опоздаю на десять минут.', 'Sorry, I\'ll be ten minutes late.']),
  w('zamienić się', 'verb', 'помінятися', 'поменяться', 'to swap', ['work'],
    ['Zamienisz się ze mną na sobotę?', 'Поміняєшся зі мною на суботу?', 'Поменяешься со мной на субботу?', 'Will you swap Saturday with me?']),

  // ── Тіло й біль ──
  w('głowa', 'noun', 'голова', 'голова', 'head', ['medicine'],
    ['Od rana boli mnie głowa.', 'З ранку в мене болить голова.', 'С утра у меня болит голова.', 'I\'ve had a headache since the morning.']),
  w('brzuch', 'noun', 'живіт', 'живот', 'stomach, belly', ['medicine'],
    ['Po obiedzie boli mnie brzuch.', 'Після обіду в мене болить живіт.', 'После обеда у меня болит живот.', 'My stomach hurts after lunch.']),
  w('gardło', 'noun', 'горло', 'горло', 'throat', ['medicine'],
    ['Mam katar i boli mnie gardło.', 'У мене нежить і болить горло.', 'У меня насморк и болит горло.', 'I have a runny nose and a sore throat.']),
  w('plecy', 'noun', 'спина', 'спина', 'back', ['medicine'],
    ['Po pracy w magazynie bolą mnie plecy.', 'Після роботи на складі в мене болить спина.', 'После работы на складе у меня болит спина.', 'My back hurts after work in the warehouse.']),
  w('noga', 'noun', 'нога', 'нога', 'leg', ['medicine'],
    ['Skręciłem nogę na schodach.', 'Я підвернув ногу на сходах.', 'Я подвернул ногу на лестнице.', 'I twisted my leg on the stairs.']),
  w('ząb', 'noun', 'зуб', 'зуб', 'tooth', ['medicine'],
    ['Boli mnie ząb, muszę iść do dentysty.', 'У мене болить зуб, треба йти до стоматолога.', 'У меня болит зуб, нужно идти к стоматологу.', 'I have toothache, I need to see a dentist.']),
  w('gorączka', 'noun', 'висока температура, гарячка', 'высокая температура, жар', 'fever', ['medicine'],
    ['Dziecko ma gorączkę od wczoraj.', 'У дитини температура з учора.', 'У ребёнка жар со вчера.', 'The child has had a fever since yesterday.']),

  // ── У лікаря ──
  w('przychodnia', 'noun', 'поліклініка', 'поликлиника', 'outpatient clinic', ['medicine'],
    ['Przychodnia jest czynna do osiemnastej.', 'Поліклініка працює до вісімнадцятої.', 'Поликлиника работает до восемнадцати.', 'The clinic is open until six p.m.']),
  w('rejestracja', 'noun', 'реєстратура', 'регистратура', 'reception (at a clinic)', ['medicine'],
    ['Proszę zapytać w rejestracji.', 'Запитайте, будь ласка, у реєстратурі.', 'Спросите, пожалуйста, в регистратуре.', 'Please ask at reception.']),
  w('kaszel', 'noun', 'кашель', 'кашель', 'cough', ['medicine'],
    ['Mam suchy kaszel od tygodnia.', 'У мене сухий кашель уже тиждень.', 'У меня сухой кашель уже неделю.', 'I\'ve had a dry cough for a week.']),
  w('katar', 'noun', 'нежить', 'насморк', 'runny nose', ['medicine'],
    ['Kiedy mam katar, piję herbatę z miodem.', 'Коли в мене нежить, я п\'ю чай із медом.', 'Когда у меня насморк, я пью чай с мёдом.', 'When I have a runny nose, I drink tea with honey.']),
  w('temperatura', 'noun', 'температура', 'температура', 'temperature', ['medicine'],
    ['Wieczorem miałem trzydzieści osiem stopni temperatury.', 'Увечері в мене було тридцять вісім градусів.', 'Вечером у меня было тридцать восемь градусов.', 'In the evening I had a temperature of thirty-eight.']),
  w('skierowanie', 'noun', 'направлення', 'направление', 'referral', ['medicine', 'documents'],
    ['Do okulisty potrzebuję skierowania?', 'До окуліста мені потрібне направлення?', 'К окулисту мне нужно направление?', 'Do I need a referral to see an eye doctor?']),

  // ── В аптеці ──
  w('tabletka', 'noun', 'таблетка', 'таблетка', 'tablet, pill', ['medicine'],
    ['Proszę brać jedną tabletkę rano.', 'Приймайте по одній таблетці зранку.', 'Принимайте по одной таблетке утром.', 'Take one tablet in the morning.']),
  w('syrop', 'noun', 'сироп', 'сироп', 'syrup', ['medicine'],
    ['Ten syrop jest na kaszel.', 'Цей сироп — від кашлю.', 'Этот сироп — от кашля.', 'This syrup is for coughs.']),
  w('bez recepty', 'phrase', 'без рецепта', 'без рецепта', 'over the counter', ['medicine'],
    ['Ten lek jest bez recepty.', 'Ці ліки продаються без рецепта.', 'Это лекарство продаётся без рецепта.', 'This medicine is available over the counter.']),
  w('dwa razy dziennie', 'phrase', 'двічі на день', 'два раза в день', 'twice a day', ['medicine', 'time'],
    ['Syrop pije się dwa razy dziennie.', 'Сироп п\'ють двічі на день.', 'Сироп пьют два раза в день.', 'You take the syrup twice a day.']),
  w('po jedzeniu', 'phrase', 'після їжі', 'после еды', 'after meals', ['medicine'],
    ['Tabletki proszę brać po jedzeniu.', 'Таблетки приймайте після їжі.', 'Таблетки принимайте после еды.', 'Take the tablets after meals.']),

  // ── Ранок ──
  w('budzić się', 'verb', 'прокидатися', 'просыпаться', 'to wake up', ['daily', 'time'],
    ['W tygodniu budzę się o piątej.', 'Посеред тижня я прокидаюся о п\'ятій.', 'В будни я просыпаюсь в пять.', 'On weekdays I wake up at five.']),
  w('myć się', 'verb', 'митися, вмиватися', 'мыться, умываться', 'to wash (oneself)', ['daily'],
    ['Myję się zimną wodą.', 'Я вмиваюся холодною водою.', 'Я умываюсь холодной водой.', 'I wash in cold water.']),
  w('ubierać się', 'verb', 'одягатися', 'одеваться', 'to get dressed', ['daily'],
    ['Ubieram się szybko i wychodzę.', 'Я швидко одягаюся й виходжу.', 'Я быстро одеваюсь и выхожу.', 'I get dressed quickly and go out.']),
  w('golić się', 'verb', 'голитися', 'бриться', 'to shave', ['daily'],
    ['Golę się co drugi dzień.', 'Я голюся через день.', 'Я бреюсь через день.', 'I shave every other day.']),
  w('prysznic', 'noun', 'душ', 'душ', 'shower', ['daily', 'home'],
    ['Biorę prysznic wieczorem.', 'Я приймаю душ увечері.', 'Я принимаю душ вечером.', 'I take a shower in the evening.']),

  // ── Котра година ──
  w('godzina', 'noun', 'година', 'час', 'hour; o\'clock', ['time'],
    ['Która jest godzina?', 'Котра година?', 'Который час?', 'What time is it?']),
  w('wpół do', 'phrase', 'пів на (половина години)', 'половина (часа)', 'half past (lit. half to)', ['time'],
    ['Jest wpół do ósmej.', 'Зараз пів на восьму (7:30).', 'Сейчас половина восьмого (7:30).', 'It\'s half past seven.']),
  w('kwadrans', 'noun', 'чверть години', 'четверть часа', 'quarter of an hour', ['time'],
    ['Autobus będzie za kwadrans.', 'Автобус буде за чверть години.', 'Автобус будет через четверть часа.', 'The bus will come in a quarter of an hour.']),
  w('punktualnie', 'adv', 'вчасно, точно', 'вовремя, ровно', 'on time, sharp', ['time', 'work'],
    ['Zaczynamy punktualnie o szóstej.', 'Починаємо рівно о шостій.', 'Начинаем ровно в шесть.', 'We start at six sharp.']),

  // ── Вечір на Piotrkowskiej ──
  w('deptak', 'noun', 'пішохідна вулиця', 'пешеходная улица', 'pedestrian street', ['city'],
    ['Piotrkowska to długi deptak w centrum Łodzi.', 'Пйотрковська — довга пішохідна вулиця в центрі Лодзі.', 'Пётрковская — длинная пешеходная улица в центре Лодзи.', 'Piotrkowska is a long pedestrian street in the centre of Łódź.']),
  w('spotkać się', 'verb', 'зустрітися', 'встретиться', 'to meet (up)', ['time', 'people'],
    ['Spotkajmy się pod pomnikiem Tuwima.', 'Зустріньмося біля пам\'ятника Тувіму.', 'Встретимся у памятника Тувиму.', 'Let\'s meet by the Tuwim statue.']),
  w('kino', 'noun', 'кінотеатр, кіно', 'кинотеатр, кино', 'cinema', ['city'],
    ['Kino jest na końcu ulicy.', 'Кінотеатр у кінці вулиці.', 'Кинотеатр в конце улицы.', 'The cinema is at the end of the street.']),
  w('film', 'noun', 'фільм', 'фильм', 'film', ['city'],
    ['Ten film kręcili w Łodzi.', 'Цей фільм знімали в Лодзі.', 'Этот фильм снимали в Лодзи.', 'This film was shot in Łódź.']),
  w('restauracja', 'noun', 'ресторан', 'ресторан', 'restaurant', ['restaurants', 'city'],
    ['Restauracja ma ogródek na podwórku.', 'У ресторану є літній майданчик у дворі.', 'У ресторана есть летняя веранда во дворе.', 'The restaurant has a garden in the courtyard.']),
];
