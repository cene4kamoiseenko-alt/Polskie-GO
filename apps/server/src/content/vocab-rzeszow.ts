/**
 * Словник Жешува (B2): державні послуги. Лікар і NFZ (skierowanie do specjalisty, e-recepta, refundacja, przysługiwać + давальний),
 * ZUS і допомога (składka, zasiłek, ubiegać się o + знахідний), річна податкова декларація (rozliczenie, ulga, zwrot podatku), школа
 * й дитсадок (zapisać, usprawiedliwić nieobecność, непряма мова), штрафи й паркування (przekroczyć prędkość, odwołać się od + родовий,
 * parkomat), поліція й екстрена допомога (zgłosić kradzież, skradziono mi, świadek, protokół), рекламація й права споживача
 * (rękojmia, odstąpić od umowy, wada), Жешув (Dolina Lotnicza, Podziemna Trasa, położony nad, znany z + родовий).
 * Слова skierowanie, recepta, przychodnia, rejestracja, kolejka, zwolnienie lekarskie, emerytura, podatek, mandat, reklamacja, gwarancja,
 * paragon, naprawa, policja, lotnisko, samolot, muzeum, rynek, ratusz, kamienica, wystawa, wypadek, pomoc, prawo jazdy вже є в словнику.
 */
import { w } from './vocab-city';
import type { VocabSeed } from './vocab';

export const RZESZOW_VOCAB: VocabSeed[] = [
  // ── Лікар і NFZ ──
  w('specjalista', 'noun', 'B2', 'спеціаліст, лікар-фахівець', 'специалист, врач-специалист', 'specialist', ['medicine'],
    ['Lekarz rodzinny wystawił mi skierowanie do specjalisty.', 'Сімейний лікар виписав мені направлення до спеціаліста.', 'Семейный врач выписал мне направление к специалисту.', 'My family doctor gave me a referral to a specialist.'], { gen: 'specjalisty' }),
  w('ubezpieczenie zdrowotne', 'phrase', 'B2', 'медичне страхування', 'медицинская страховка', 'health insurance', ['medicine', 'documents'],
    ['Mam ubezpieczenie zdrowotne, więc wizyta jest bezpłatna.', 'У мене є медичне страхування, тож візит безкоштовний.', 'У меня есть медицинская страховка, поэтому приём бесплатный.', 'I have health insurance, so the appointment is free.']),
  w('e-recepta', 'noun', 'B2', 'електронний рецепт', 'электронный рецепт', 'e-prescription', ['medicine'],
    ['Lekarz wystawił e-receptę, kod dostałem w SMS-ie.', 'Лікар виписав е-рецепт, код я отримав в SMS.', 'Врач выписал э-рецепт, код я получил в SMS.', 'The doctor issued an e-prescription and I got the code by text message.'], { gen: 'e-recepty', acc: 'e-receptę' }),
  w('refundacja', 'noun', 'B2', 'відшкодування (вартості ліків)', 'возмещение (стоимости лекарств)', 'reimbursement', ['medicine'],
    ['Ten lek jest objęty refundacją, więc zapłacę mniej.', 'Цей препарат охоплений відшкодуванням, тож я заплачу менше.', 'Этот препарат покрывается возмещением, поэтому я заплачу меньше.', 'This medicine is reimbursed, so I will pay less.'], { gen: 'refundacji', instr: 'refundacją' }),
  w('pilny', 'adj', 'B2', 'терміновий', 'срочный', 'urgent', ['medicine', 'phrases'],
    ['To pilny przypadek: potrzebuję wizyty dzisiaj.', 'Це терміновий випадок: мені потрібен візит сьогодні.', 'Это срочный случай: мне нужен приём сегодня.', 'It is an urgent case: I need an appointment today.'], { f: 'pilna', n: 'pilne', pl: 'pilni / pilne' }),
  w('lekarz rodzinny', 'phrase', 'B2', 'сімейний лікар', 'семейный врач', 'family doctor', ['medicine'],
    ['Najpierw trzeba iść do lekarza rodzinnego.', 'Спершу треба йти до сімейного лікаря.', 'Сначала нужно идти к семейному врачу.', 'First you have to see your family doctor.']),

  // ── ZUS і допомога ──
  w('składka', 'noun', 'B2', 'внесок (до ZUS)', 'взнос (в ZUS)', 'contribution (to social insurance)', ['work', 'documents'],
    ['Pracodawca odprowadza składki do ZUS-u.', 'Роботодавець сплачує внески до ZUS.', 'Работодатель перечисляет взносы в ZUS.', 'The employer pays contributions to ZUS.'], { gen: 'składki', acc: 'składkę' }),
  w('zasiłek', 'noun', 'B2', 'допомога, виплата', 'пособие', 'benefit, allowance', ['work', 'documents'],
    ['Po urodzeniu dziecka przysługuje zasiłek.', 'Після народження дитини належить допомога.', 'После рождения ребёнка полагается пособие.', 'After a baby is born you are entitled to an allowance.'], { gen: 'zasiłku' }),
  w('zasiłek chorobowy', 'phrase', 'B2', 'допомога по хворобі', 'пособие по болезни', 'sick pay', ['work', 'medicine'],
    ['Na zwolnieniu lekarskim dostaję zasiłek chorobowy.', 'На лікарняному я отримую допомогу по хворобі.', 'На больничном я получаю пособие по болезни.', 'On sick leave I receive sick pay.']),
  w('świadczenie', 'noun', 'B2', 'виплата, соціальна допомога', 'выплата, социальное пособие', 'benefit, payment', ['documents', 'work'],
    ['To świadczenie przysługuje rodzicom dzieci do osiemnastego roku życia.', 'Ця виплата належить батькам дітей до вісімнадцяти років.', 'Эта выплата полагается родителям детей до восемнадцати лет.', 'This benefit is paid to parents of children up to the age of eighteen.'], { gen: 'świadczenia' }),
  w('ubiegać się', 'verb', 'B2', 'добиватися, подавати заяву (про)', 'добиваться, подавать заявку (на)', 'to apply for', ['documents', 'work'],
    ['Ubiegam się o zasiłek rodzinny.', 'Я подаю заяву на сімейну допомогу.', 'Я подаю заявку на семейное пособие.', 'I am applying for a family allowance.'], { ja: 'ubiegam się', past: 'ubiegał się' }),
  w('przysługiwać', 'verb', 'B2', 'належати (комусь), бути покладеним', 'полагаться, принадлежать (кому-то)', 'to be due to, to be entitled to', ['documents', 'work'],
    ['Zasiłek przysługuje osobom, które mają umowę o pracę.', 'Допомога належить особам, які мають трудовий договір.', 'Пособие полагается лицам, у которых есть трудовой договор.', 'The benefit is due to people with an employment contract.'], { he: 'przysługuje', past: 'przysługiwał' }),

  // ── Податки ──
  w('rozliczenie', 'noun', 'B2', 'розрахунок, декларування', 'расчёт, декларирование', 'settlement, tax return', ['documents', 'work'],
    ['Rozliczenie roczne trzeba złożyć do końca kwietnia.', 'Річну декларацію треба подати до кінця квітня.', 'Годовую декларацию нужно подать до конца апреля.', 'The annual tax return must be filed by the end of April.'], { gen: 'rozliczenia' }),
  w('zeznanie podatkowe', 'phrase', 'B2', 'податкова декларація', 'налоговая декларация', 'tax return', ['documents']
    , ['Zeznanie podatkowe można złożyć przez internet.', 'Податкову декларацію можна подати через інтернет.', 'Налоговую декларацию можно подать через интернет.', 'A tax return can be filed online.']),
  w('ulga', 'noun', 'B2', 'пільга, знижка', 'льгота, скидка', 'tax relief, allowance', ['documents', 'work'],
    ['Na dziecko przysługuje ulga podatkowa.', 'На дитину належить податкова пільга.', 'На ребёнка полагается налоговая льгота.', 'You are entitled to a tax relief for a child.'], { gen: 'ulgi', acc: 'ulgę' }),
  w('zwrot podatku', 'phrase', 'B2', 'повернення податку', 'возврат налога', 'tax refund', ['documents'],
    ['Zwrot podatku wpłynie na konto w ciągu miesiąca.', 'Повернення податку надійде на рахунок протягом місяця.', 'Возврат налога поступит на счёт в течение месяца.', 'The tax refund will arrive in your account within a month.']),
  w('dochód', 'noun', 'B2', 'дохід', 'доход', 'income', ['documents', 'work'],
    ['Mój dochód w tym roku był niższy niż w zeszłym.', 'Мій дохід цього року був нижчим, ніж торік.', 'Мой доход в этом году был ниже, чем в прошлом.', 'My income this year was lower than last year.'], { gen: 'dochodu' }),
  w('urząd skarbowy', 'phrase', 'B2', 'податкова інспекція', 'налоговая инспекция', 'tax office', ['urzad', 'documents'],
    ['Urząd skarbowy odpowiada na pytania także przez infolinię.', 'Податкова інспекція відповідає на запитання й через інфолінію.', 'Налоговая инспекция отвечает на вопросы и по инфолинии.', 'The tax office answers questions by helpline too.']),

  // ── Школа й дитсадок ──
  w('przedszkole', 'noun', 'B2', 'дитячий садок', 'детский сад', 'kindergarten', ['daily', 'family'],
    ['Córka chodzi do przedszkola od września.', 'Донька ходить до дитсадка з вересня.', 'Дочь ходит в детский сад с сентября.', 'My daughter has been going to kindergarten since September.'], { gen: 'przedszkola', loc: 'przedszkolu' }),
  w('zapisać', 'verb', 'B2', 'записати (до школи, на курс)', 'записать (в школу, на курс)', 'to enrol, to write down', ['daily', 'documents'],
    ['Chcę zapisać syna do pierwszej klasy.', 'Я хочу записати сина до першого класу.', 'Я хочу записать сына в первый класс.', 'I want to enrol my son in the first class.'], { ja: 'zapiszę', past: 'zapisał' }),
  w('usprawiedliwić', 'verb', 'B2', 'виправдати (відсутність), пояснити', 'оправдать (отсутствие), объяснить', 'to excuse (an absence)', ['daily', 'phrases'],
    ['Proszę usprawiedliwić nieobecność mojego syna.', 'Будь ласка, вважайте відсутність мого сина поважною.', 'Пожалуйста, считайте отсутствие моего сына уважительным.', 'Please excuse my son’s absence.'], { ja: 'usprawiedliwię', past: 'usprawiedliwił' }),
  w('nieobecność', 'noun', 'B2', 'відсутність', 'отсутствие', 'absence', ['daily', 'work'],
    ['Nieobecność należy usprawiedliwić w ciągu tygodnia.', 'Відсутність треба пояснити протягом тижня.', 'Отсутствие нужно объяснить в течение недели.', 'An absence must be excused within a week.'], { gen: 'nieobecności', acc: 'nieobecność' }),
  w('zebranie', 'noun', 'B2', 'збори, зустріч', 'собрание', 'meeting', ['daily', 'work'],
    ['W czwartek jest zebranie z rodzicami.', 'У четвер збори з батьками.', 'В четверг собрание с родителями.', 'On Thursday there is a parents’ meeting.'], { gen: 'zebrania' }),
  w('wychowawca', 'noun', 'B2', 'класний керівник, вихователь', 'классный руководитель, воспитатель', 'form tutor', ['daily', 'work'],
    ['Wychowawca klasy zaprosił rodziców na rozmowę.', 'Класний керівник запросив батьків на розмову.', 'Классный руководитель пригласил родителей на разговор.', 'The form tutor invited the parents for a talk.'], { gen: 'wychowawcy' }),
  w('dziennik elektroniczny', 'phrase', 'B2', 'електронний щоденник, журнал', 'электронный дневник, журнал', 'electronic register', ['daily', 'documents'],
    ['Oceny widać w dzienniku elektronicznym.', 'Оцінки видно в електронному щоденнику.', 'Оценки видно в электронном дневнике.', 'You can see the grades in the electronic register.']),

  // ── Штрафи й паркування ──
  w('punkty karne', 'phrase', 'B2', 'штрафні бали', 'штрафные баллы', 'penalty points', ['transport', 'documents'],
    ['Za przekroczenie prędkości dostał mandat i punkty karne.', 'За перевищення швидкості він отримав штраф і штрафні бали.', 'За превышение скорости он получил штраф и штрафные баллы.', 'He got a fine and penalty points for speeding.']),
  w('przekroczyć', 'verb', 'B2', 'перевищити, перетнути', 'превысить, пересечь', 'to exceed, to cross', ['transport', 'documents'],
    ['Przekroczyłem prędkość o dwadzieścia kilometrów na godzinę.', 'Я перевищив швидкість на двадцять кілометрів на годину.', 'Я превысил скорость на двадцать километров в час.', 'I exceeded the speed limit by twenty kilometres an hour.'], { ja: 'przekroczę', past: 'przekroczył' }),
  w('prędkość', 'noun', 'B2', 'швидкість', 'скорость', 'speed', ['transport'],
    ['W mieście obowiązuje ograniczenie prędkości do pięćdziesięciu kilometrów na godzinę.', 'У місті діє обмеження швидкості до п’ятдесяти кілометрів на годину.', 'В городе действует ограничение скорости до пятидесяти километров в час.', 'In towns there is a speed limit of fifty kilometres an hour.'], { gen: 'prędkości' }),
  w('odwołać się', 'verb', 'B2', 'оскаржити, подати апеляцію', 'обжаловать, подать апелляцию', 'to appeal', ['documents', 'urzad'],
    ['Od tej decyzji można się odwołać w ciągu czternastu dni.', 'Це рішення можна оскаржити протягом чотирнадцяти днів.', 'Это решение можно обжаловать в течение четырнадцати дней.', 'You can appeal against this decision within fourteen days.'], { ja: 'odwołam się', past: 'odwołał się' }),
  w('parkomat', 'noun', 'B2', 'паркомат', 'паркомат', 'parking meter', ['transport', 'city'],
    ['Bilet parkingowy kupuję w parkomacie.', 'Паркувальний квиток я купую в паркоматі.', 'Парковочный билет я покупаю в паркомате.', 'I buy a parking ticket at the parking meter.'], { gen: 'parkomatu', loc: 'parkomacie' }),
  w('strefa płatnego parkowania', 'phrase', 'B2', 'зона платного паркування', 'зона платной парковки', 'paid parking zone', ['transport', 'city'],
    ['W centrum jest strefa płatnego parkowania.', 'У центрі є зона платного паркування.', 'В центре есть зона платной парковки.', 'There is a paid parking zone in the centre.']),
  w('abonament', 'noun', 'B2', 'абонемент, місячний квиток', 'абонемент, месячный билет', 'season pass, subscription', ['transport', 'shopping'],
    ['Mieszkańcy centrum mogą kupić abonament parkingowy.', 'Мешканці центру можуть купити паркувальний абонемент.', 'Жители центра могут купить парковочный абонемент.', 'Residents of the centre can buy a parking pass.'], { gen: 'abonamentu', acc: 'abonament' }),

  // ── Поліція й екстрена допомога ──
  w('kradzież', 'noun', 'B2', 'крадіжка', 'кража', 'theft', ['daily', 'city'],
    ['Chcę zgłosić kradzież roweru.', 'Я хочу заявити про крадіжку велосипеда.', 'Я хочу заявить о краже велосипеда.', 'I want to report the theft of a bicycle.'], { gen: 'kradzieży' }),
  w('zgłosić', 'verb', 'B2', 'заявити, повідомити', 'заявить, сообщить', 'to report', ['daily', 'urzad'],
    ['Zgłosiłem kradzież na policji.', 'Я заявив про крадіжку в поліції.', 'Я заявил о краже в полиции.', 'I reported the theft to the police.'], { ja: 'zgłoszę', past: 'zgłosił' }),
  w('świadek', 'noun', 'B2', 'свідок', 'свидетель', 'witness', ['daily', 'city'],
    ['Świadek widział, jak złodziej uciekał.', 'Свідок бачив, як злодій тікав.', 'Свидетель видел, как вор убегал.', 'A witness saw the thief running away.'], { gen: 'świadka' }),
  w('protokół', 'noun', 'B2', 'протокол', 'протокол', 'report, record', ['documents', 'urzad'],
    ['Policjant spisał protokół zgłoszenia.', 'Поліцейський склав протокол заяви.', 'Полицейский составил протокол заявления.', 'The police officer wrote up a record of the report.'], { gen: 'protokołu' }),
  w('poszkodowany', 'noun', 'B2', 'потерпілий', 'пострадавший', 'victim, injured party', ['daily', 'city'],
    ['Poszkodowany dostał kopię protokołu.', 'Потерпілий отримав копію протоколу.', 'Пострадавший получил копию протокола.', 'The victim received a copy of the record.'], { gen: 'poszkodowanego', pl: 'poszkodowani' }),
  w('straż pożarna', 'phrase', 'B2', 'пожежна служба', 'пожарная служба', 'fire brigade', ['city', 'daily'],
    ['Straż pożarna przyjechała w kilka minut.', 'Пожежна служба приїхала за кілька хвилин.', 'Пожарная служба приехала за несколько минут.', 'The fire brigade arrived within a few minutes.']),

  // ── Рекламація й права споживача ──
  w('zwrot', 'noun', 'B2', 'повернення', 'возврат', 'return, refund', ['shopping', 'documents'],
    ['Zwrot towaru jest możliwy w ciągu czternastu dni.', 'Повернення товару можливе протягом чотирнадцяти днів.', 'Возврат товара возможен в течение четырнадцати дней.', 'Returning the goods is possible within fourteen days.'], { gen: 'zwrotu' }),
  w('rękojmia', 'noun', 'B2', 'відповідальність продавця за вади (rękojmia)', 'ответственность продавца за недостатки (rękojmia)', 'statutory warranty (seller’s liability)', ['shopping', 'documents'],
    ['Sprzedawca odpowiada za wady na podstawie rękojmi.', 'Продавець відповідає за вади на підставі rękojmia.', 'Продавец отвечает за недостатки на основании rękojmia.', 'The seller is liable for defects under the statutory warranty.'], { gen: 'rękojmi', instr: 'rękojmią' }),
  w('odstąpić od umowy', 'phrase', 'B2', 'відмовитися від договору', 'отказаться от договора', 'to withdraw from a contract', ['shopping', 'documents'],
    ['Konsument może odstąpić od umowy zawartej przez internet.', 'Споживач може відмовитися від договору, укладеного через інтернет.', 'Потребитель может отказаться от договора, заключённого через интернет.', 'A consumer may withdraw from a contract concluded online.']),
  w('wada', 'noun', 'B2', 'вада, дефект', 'дефект, недостаток', 'defect', ['shopping'],
    ['Telefon ma wadę fabryczną.', 'Телефон має заводський дефект.', 'У телефона заводской дефект.', 'The phone has a factory defect.'], { gen: 'wady', acc: 'wadę' }),
  w('reklamować', 'verb', 'B2', 'подавати рекламацію на, скаржитися на товар', 'предъявлять рекламацию, жаловаться на товар', 'to make a complaint about goods', ['shopping'],
    ['Jeśli towar ma wadę, możesz go reklamować.', 'Якщо товар має дефект, ти можеш подати на нього рекламацію.', 'Если у товара есть дефект, ты можешь подать на него рекламацию.', 'If the goods are defective, you can make a complaint.'], { ja: 'reklamuję', past: 'reklamował' }),
  w('konsument', 'noun', 'B2', 'споживач', 'потребитель', 'consumer', ['shopping', 'documents'],
    ['Konsument ma prawo do zwrotu towaru.', 'Споживач має право на повернення товару.', 'Потребитель имеет право на возврат товара.', 'A consumer has the right to return goods.'], { gen: 'konsumenta' }),

  // ── Жешув ──
  w('dolina', 'noun', 'B2', 'долина', 'долина', 'valley', ['nature', 'city'],
    ['Dolina Lotnicza to region przemysłu lotniczego.', 'Авіаційна долина — регіон авіаційної промисловості.', 'Авиационная долина — регион авиационной промышленности.', 'Aviation Valley is a region of the aerospace industry.'], { gen: 'doliny' }),
  w('lotniczy', 'adj', 'B2', 'авіаційний', 'авиационный', 'aviation (adj.)', ['city', 'work'],
    ['Przemysł lotniczy daje pracę tysiącom ludzi.', 'Авіаційна промисловість дає роботу тисячам людей.', 'Авиационная промышленность даёт работу тысячам людей.', 'The aviation industry gives work to thousands of people.'], { f: 'lotnicza', n: 'lotnicze' }),
  w('piwnica', 'noun', 'B2', 'підвал', 'подвал', 'cellar', ['city', 'home'],
    ['Pod rynkiem są dawne piwnice kamienic.', 'Під ринком є колишні підвали кам’яниць.', 'Под рынком находятся бывшие подвалы домов.', 'Under the market square there are the old cellars of the townhouses.'], { gen: 'piwnicy', pl: 'piwnice' }),
  w('trasa', 'noun', 'B2', 'маршрут, траса', 'маршрут, трасса', 'route', ['travel', 'city'],
    ['Podziemna trasa prowadzi pod rynkiem.', 'Підземний маршрут веде під ринком.', 'Подземный маршрут ведёт под рынком.', 'The underground route leads under the market square.'], { gen: 'trasy' }),
  w('innowacyjny', 'adj', 'B2', 'інноваційний', 'инновационный', 'innovative', ['city', 'work'],
    ['Rzeszów jest uważany za innowacyjne miasto.', 'Жешув вважають інноваційним містом.', 'Жешув считают инновационным городом.', 'Rzeszów is regarded as an innovative city.'], { f: 'innowacyjna', n: 'innowacyjne' }),
  w('położony', 'adj', 'B2', 'розташований', 'расположенный', 'situated', ['city', 'travel'],
    ['Miasto jest położone nad rzeką Wisłok.', 'Місто розташоване на річці Віслок.', 'Город расположен на реке Вислок.', 'The city is situated on the Wisłok river.'], { f: 'położona', n: 'położone' }),
  w('podziemny', 'adj', 'B2', 'підземний', 'подземный', 'underground', ['city', 'travel'],
    ['Podziemna trasa jest otwarta codziennie.', 'Підземний маршрут відкритий щодня.', 'Подземный маршрут открыт ежедневно.', 'The underground route is open every day.'], { f: 'podziemna', n: 'podziemne' }),
];
