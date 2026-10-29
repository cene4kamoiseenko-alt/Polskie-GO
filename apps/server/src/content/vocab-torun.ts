/**
 * Словник Торуня (B1): майбутній час (będę + інфінітив / -ł, доконаний zrobię), плани й наміри (zamierzam, mam zamiar),
 * кар'єра й навчання (zostać + орудний, zdać egzamin), гроші й поїздки (oszczędzać, polecieć), умова й імовірність
 * (jeżeli + майбутній, na pewno, prawdopodobnie, mam nadzieję), обіцянки й домовленості, Торунь (Kopernik, pierniki).
 * Слова plan, jutro, awans, kurs, egzamin, zarezerwować, prognoza, pogoda, jeśli, chyba, umówić się, termin, zaproszenie,
 * wakacje, urlop, walizka, emerytura, podwyżka уже є в словнику.
 */
import { w } from './vocab-city';
import type { VocabSeed } from './vocab';

export const TORUN_VOCAB: VocabSeed[] = [
  // ── Що робитимеш: będę + інфінітив ──
  w('planować', 'verb', 'A2', 'планувати', 'планировать', 'to plan', ['time', 'daily'],
    ['Co planujesz na weekend?', 'Що плануєш на вихідні?', 'Что планируешь на выходные?', 'What are you planning for the weekend?'], { ja: 'planuję', past: 'planował' }),
  w('przyszły', 'adj', 'A2', 'наступний (тиждень, рік)', 'следующий (неделя, год)', 'next (week, year)', ['time', 'calendar'],
    ['W przyszłym tygodniu będę pracować w domu.', 'Наступного тижня я працюватиму вдома.', 'На следующей неделе я буду работать дома.', 'Next week I’ll be working from home.'], { f: 'przyszła', loc: 'przyszłym' }),
  w('pojutrze', 'adv', 'A2', 'післязавтра', 'послезавтра', 'the day after tomorrow', ['time', 'calendar'],
    ['Pojutrze jedziemy do Torunia.', 'Післязавтра ми їдемо до Торуня.', 'Послезавтра мы едем в Торунь.', 'We’re going to Toruń the day after tomorrow.']),
  w('wkrótce', 'adv', 'B1', 'незабаром', 'скоро, вскоре', 'soon', ['time'],
    ['Wkrótce zacznę nową pracę.', 'Незабаром я почну нову роботу.', 'Скоро я начну новую работу.', 'I’ll start a new job soon.']),
  w('niedługo', 'adv', 'A2', 'скоро, незабаром', 'скоро', 'soon, before long', ['time'],
    ['Niedługo będą wakacje.', 'Скоро будуть канікули.', 'Скоро будут каникулы.', 'The holidays are coming soon.']),

  // ── Зроблю: доконаний майбутній ──
  w('zrobić', 'verb', 'A1', 'зробити', 'сделать', 'to do, to make (and finish)', ['daily'],
    ['Zrobię to jutro rano.', 'Я зроблю це завтра вранці.', 'Я сделаю это завтра утром.', 'I’ll do it tomorrow morning.'], { ja: 'zrobię', past: 'zrobił' }),
  w('spróbować', 'verb', 'A2', 'спробувати', 'попробовать', 'to try', ['daily'],
    ['Spróbuję zadzwonić jeszcze raz.', 'Я спробую подзвонити ще раз.', 'Я попробую позвонить ещё раз.', 'I’ll try calling once more.'], { ja: 'spróbuję', past: 'spróbował' }),
  w('postanowić', 'verb', 'B1', 'вирішити, постановити', 'решить (для себя)', 'to decide, to resolve', ['daily'],
    ['Postanowiłam, że od jutra będę biegać.', 'Я вирішила, що з завтра бігатиму.', 'Я решила, что с завтрашнего дня буду бегать.', 'I’ve decided I’ll start running tomorrow.'], { ja: 'postanowię', past: 'postanowił' }),
  w('zdecydować', 'verb', 'B1', 'вирішити (зробити вибір)', 'решить (сделать выбор)', 'to decide (to choose)', ['daily', 'work'],
    ['Jeszcze nie zdecydowałem, gdzie pojadę.', 'Я ще не вирішив, куди поїду.', 'Я ещё не решил, куда поеду.', 'I haven’t decided yet where I’ll go.'], { ja: 'zdecyduję', past: 'zdecydował' }),
  w('decyzja', 'noun', 'B1', 'рішення', 'решение', 'decision', ['work', 'daily'],
    ['To była trudna decyzja.', 'Це було важке рішення.', 'Это было трудное решение.', 'It was a difficult decision.'], { pl: 'decyzje' }),

  // ── Наміри й мрії ──
  w('zamierzać', 'verb', 'B1', 'мати намір, збиратися', 'намереваться, собираться', 'to intend', ['daily'],
    ['Zamierzam zostać w Polsce na dłużej.', 'Я маю намір залишитися в Польщі надовше.', 'Я собираюсь остаться в Польше подольше.', 'I intend to stay in Poland for longer.'], { ja: 'zamierzam' }),
  w('zamiar', 'noun', 'B1', 'намір', 'намерение', 'intention', ['daily'],
    ['Mam zamiar zapisać się na kurs.', 'Я маю намір записатися на курс.', 'Я собираюсь записаться на курс.', 'I’m planning to sign up for a course.']),
  w('marzenie', 'noun', 'B1', 'мрія', 'мечта', 'dream', ['daily'],
    ['Moim marzeniem jest dom nad jeziorem.', 'Моя мрія — будинок біля озера.', 'Моя мечта — дом у озера.', 'My dream is a house by a lake.'], { pl: 'marzenia' }),
  w('marzyć', 'verb', 'B1', 'мріяти', 'мечтать', 'to dream (of)', ['daily'],
    ['Marzę o podróży do Japonii.', 'Я мрію про подорож до Японії.', 'Я мечтаю о поездке в Японию.', 'I dream of a trip to Japan.'], { ja: 'marzę', past: 'marzył' }),
  w('cel', 'noun', 'B1', 'мета, ціль', 'цель', 'goal, aim', ['work', 'daily'],
    ['Mój cel na ten rok to poziom B2.', 'Моя мета на цей рік — рівень B2.', 'Моя цель на этот год — уровень B2.', 'My goal for this year is level B2.'], { pl: 'cele' }),

  // ── Кар'єра й навчання ──
  w('kariera', 'noun', 'B1', 'кар’єра', 'карьера', 'career', ['work'],
    ['Chcę zrobić karierę w IT.', 'Я хочу зробити кар’єру в IT.', 'Я хочу сделать карьеру в IT.', 'I want to build a career in IT.']),
  w('osiągnąć', 'verb', 'B1', 'досягти', 'достичь', 'to achieve, to reach', ['work'],
    ['Na pewno osiągniesz swój cel.', 'Ти точно досягнеш своєї мети.', 'Ты точно достигнешь своей цели.', 'You’ll definitely reach your goal.'], { ja: 'osiągnę', past: 'osiągnął' }),
  w('zdać', 'verb', 'A2', 'скласти (іспит)', 'сдать (экзамен)', 'to pass (an exam)', ['work', 'documents'],
    ['Jeżeli zdam egzamin, dostanę certyfikat.', 'Якщо я складу іспит, отримаю сертифікат.', 'Если я сдам экзамен, получу сертификат.', 'If I pass the exam, I’ll get a certificate.'], { ja: 'zdam', past: 'zdał' }),
  w('zostać', 'verb', 'A2', 'стати (ким); залишитися', 'стать (кем); остаться', 'to become; to stay', ['work', 'daily'],
    ['W przyszłości zostanę lekarzem.', 'У майбутньому я стану лікарем.', 'В будущем я стану врачом.', 'In the future I’ll become a doctor.'], { ja: 'zostanę', past: 'został' }),
  w('awansować', 'verb', 'B1', 'отримати підвищення', 'получить повышение', 'to be promoted', ['work'],
    ['Jeśli wszystko pójdzie dobrze, awansuję w maju.', 'Якщо все піде добре, мене підвищать у травні.', 'Если всё пойдёт хорошо, меня повысят в мае.', 'If all goes well, I’ll be promoted in May.'], { ja: 'awansuję', past: 'awansował' }),
  w('zmienić', 'verb', 'A2', 'змінити', 'сменить, изменить', 'to change', ['work', 'daily'],
    ['W przyszłym roku chcę zmienić pracę.', 'Наступного року я хочу змінити роботу.', 'В следующем году я хочу сменить работу.', 'Next year I want to change jobs.'], { ja: 'zmienię', past: 'zmienił' }),

  // ── Гроші й поїздки ──
  w('oszczędzać', 'verb', 'B1', 'заощаджувати', 'копить, экономить', 'to save (money)', ['bank', 'shopping'],
    ['Oszczędzam na nowy samochód.', 'Я заощаджую на нову машину.', 'Я коплю на новую машину.', 'I’m saving for a new car.'], { ja: 'oszczędzam', past: 'oszczędzał' }),
  w('wydawać', 'verb', 'B1', 'витрачати (гроші)', 'тратить (деньги)', 'to spend (money)', ['bank', 'shopping'],
    ['W tym miesiącu wydam mniej.', 'Цього місяця я витрачу менше.', 'В этом месяце я потрачу меньше.', 'This month I’ll spend less.'], { ja: 'wydaję', past: 'wydawał' }),
  w('polecieć', 'verb', 'A2', 'полетіти', 'полететь', 'to fly (somewhere)', ['travel', 'transport'],
    ['W lipcu polecimy do Hiszpanii.', 'У липні ми полетимо до Іспанії.', 'В июле мы полетим в Испанию.', 'In July we’ll fly to Spain.'], { ja: 'polecę', past: 'poleciał' }),
  w('samolot', 'noun', 'A1', 'літак', 'самолёт', 'plane', ['travel', 'transport'],
    ['Samolot do Gdańska odlatuje o szóstej.', 'Літак до Гданська вилітає о шостій.', 'Самолёт в Гданьск вылетает в шесть.', 'The plane to Gdańsk leaves at six.'], { loc: 'samolocie', inst: 'samolotem' }),
  w('spakować', 'verb', 'A2', 'спакувати', 'упаковать, собрать (вещи)', 'to pack', ['travel'],
    ['Spakuję walizkę wieczorem.', 'Я спакую валізу ввечері.', 'Я соберу чемодан вечером.', 'I’ll pack my suitcase in the evening.'], { ja: 'spakuję', past: 'spakował' }),
  w('remont', 'noun', 'B1', 'ремонт', 'ремонт', 'renovation', ['home', 'rent'],
    ['Po wakacjach zrobimy remont kuchni.', 'Після відпустки ми зробимо ремонт кухні.', 'После отпуска мы сделаем ремонт кухни.', 'After the holidays we’ll renovate the kitchen.']),
  w('przeprowadzka', 'noun', 'B1', 'переїзд', 'переезд', 'move (house)', ['home', 'rent'],
    ['Przeprowadzka będzie w sobotę.', 'Переїзд буде в суботу.', 'Переезд будет в субботу.', 'The move is on Saturday.']),

  // ── Якщо… і наскільки певно ──
  w('jeżeli', 'conj', 'B1', 'якщо', 'если', 'if', ['grammar'],
    ['Jeżeli będzie ładnie, pójdziemy nad Wisłę.', 'Якщо буде гарна погода, ми підемо на Віслу.', 'Если будет хорошая погода, мы пойдём на Вислу.', 'If the weather’s nice, we’ll go to the Vistula.']),
  w('na pewno', 'phrase', 'A2', 'точно, напевно', 'точно, наверняка', 'definitely, for sure', ['phrases'],
    ['Na pewno przyjdę na twoje urodziny.', 'Я точно прийду на твій день народження.', 'Я точно приду на твой день рождения.', 'I’ll definitely come to your birthday.']),
  w('prawdopodobnie', 'adv', 'B1', 'імовірно', 'вероятно', 'probably', ['phrases'],
    ['Prawdopodobnie jutro będzie padać.', 'Імовірно, завтра падатиме дощ.', 'Вероятно, завтра будет дождь.', 'It will probably rain tomorrow.']),
  w('pewnie', 'adv', 'A2', 'мабуть; звісно', 'наверное; конечно', 'probably; sure', ['phrases'],
    ['Pewnie się spóźnię, bo jest korek.', 'Мабуть, я спізнюся, бо затор.', 'Наверное, я опоздаю, потому что пробка.', 'I’ll probably be late — there’s a traffic jam.']),
  w('nadzieja', 'noun', 'B1', 'надія', 'надежда', 'hope', ['phrases'],
    ['Mam nadzieję, że się zobaczymy.', 'Сподіваюся, що ми побачимося.', 'Надеюсь, что мы увидимся.', 'I hope we’ll see each other.']),

  // ── Обіцянки й домовленості ──
  w('obiecać', 'verb', 'B1', 'пообіцяти', 'пообещать', 'to promise', ['daily'],
    ['Obiecuję, że oddam ci książkę w piątek.', 'Обіцяю, що поверну тобі книжку в п’ятницю.', 'Обещаю, что верну тебе книгу в пятницу.', 'I promise I’ll give you the book back on Friday.'], { ja: 'obiecam', past: 'obiecał' }),
  w('obietnica', 'noun', 'B1', 'обіцянка', 'обещание', 'promise', ['daily'],
    ['Dotrzymam obietnicy.', 'Я дотримаю обіцянки.', 'Я сдержу обещание.', 'I’ll keep my promise.']),
  w('kalendarz', 'noun', 'A2', 'календар', 'календарь', 'calendar', ['calendar', 'work'],
    ['Sprawdzę w kalendarzu, czy mam czas.', 'Я перевірю в календарі, чи маю час.', 'Я проверю в календаре, есть ли у меня время.', 'I’ll check my calendar to see if I’m free.'], { loc: 'kalendarzu' }),
  w('pomysł', 'noun', 'A2', 'ідея', 'идея', 'idea', ['daily'],
    ['Mam pomysł: pojedźmy do Torunia!', 'У мене є ідея: поїхали до Торуня!', 'У меня есть идея: поехали в Торунь!', 'I’ve got an idea: let’s go to Toruń!'], { pl: 'pomysły' }),
  w('radzić', 'verb', 'B1', 'радити', 'советовать', 'to advise', ['daily'],
    ['Radzę ci kupić bilet wcześniej.', 'Раджу тобі купити квиток заздалегідь.', 'Советую тебе купить билет заранее.', 'I advise you to buy the ticket early.'], { ja: 'radzę', past: 'radził' }),
  w('szansa', 'noun', 'B1', 'шанс', 'шанс', 'chance', ['daily', 'work'],
    ['Masz duże szanse na tę pracę.', 'У тебе великі шанси на цю роботу.', 'У тебя большие шансы на эту работу.', 'You have a good chance of getting this job.'], { pl: 'szanse' }),

  // ── Торунь: Коперник і пряники ──
  w('gwiazda', 'noun', 'A2', 'зірка', 'звезда', 'star', ['nature'],
    ['Wieczorem będziemy oglądać gwiazdy w planetarium.', 'Увечері ми дивитимемося на зірки в планетарії.', 'Вечером мы будем смотреть на звёзды в планетарии.', 'In the evening we’ll watch the stars at the planetarium.'], { pl: 'gwiazdy' }),
  w('planeta', 'noun', 'B1', 'планета', 'планета', 'planet', ['nature'],
    ['Ziemia krąży wokół Słońca jak inne planety.', 'Земля обертається навколо Сонця, як інші планети.', 'Земля вращается вокруг Солнца, как другие планеты.', 'The Earth goes round the Sun like other planets.'], { pl: 'planety' }),
  w('niebo', 'noun', 'A2', 'небо', 'небо', 'sky', ['nature'],
    ['Dziś w nocy niebo będzie czyste.', 'Сьогодні вночі небо буде чисте.', 'Сегодня ночью небо будет ясным.', 'Tonight the sky will be clear.'], { loc: 'niebie' }),
  w('astronom', 'noun', 'B1', 'астроном', 'астроном', 'astronomer', ['work', 'city'],
    ['Mikołaj Kopernik był astronomem z Torunia.', 'Миколай Коперник був астрономом із Торуня.', 'Николай Коперник был астрономом из Торуня.', 'Nicolaus Copernicus was an astronomer from Toruń.'], { inst: 'astronomem' }),
  w('piernik', 'noun', 'A2', 'пряник', 'пряник', 'gingerbread', ['food', 'city'],
    ['Kupię pierniki dla całej rodziny.', 'Я куплю пряники для всієї родини.', 'Я куплю пряники для всей семьи.', 'I’ll buy gingerbread for the whole family.'], { pl: 'pierniki', gen: 'piernika' }),
  w('przyszłość', 'noun', 'B1', 'майбутнє', 'будущее', 'the future', ['time'],
    ['W przyszłości chcę mieszkać w Toruniu.', 'У майбутньому я хочу жити в Торуні.', 'В будущем я хочу жить в Торуни.', 'In the future I want to live in Toruń.'], { loc: 'przyszłości' }),
];
