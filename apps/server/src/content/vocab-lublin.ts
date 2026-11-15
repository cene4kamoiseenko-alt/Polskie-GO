/**
 * Словник Любліна (B1): документи та установи. Справа в установі (w sprawie + родовий, załatwić, godziny urzędowania), заява й додатки
 * (złożyć wniosek, załącznik, kopia, podpis, pieczątka, wymagany), особисті дані й дати (obywatelstwo, stan cywilny, PESEL, дата в родовому),
 * карта побуту (ważny do, przedłużyć, wygasnąć, w ciągu + родовий), пошта (awizo, nadawca, adresat, za potwierdzeniem odbioru), банк (saldo,
 * wpłacić, wypłacić, zablokować), договір (zawrzeć, wypowiedzieć, na podstawie, w razie), Люблінська унія й цебуляж.
 * Слова urząd, wniosek, formularz, zaświadczenie, numerek, okienko, kolejka, karta pobytu, konto, przelew, umowa, list polecony, kaucja,
 * przeliterować, nazwisko, data urodzenia, dokument, paszport, termin, zabytek, legenda, ratusz вже є в словнику.
 */
import { w } from './vocab-city';
import type { VocabSeed } from './vocab';

export const LUBLIN_VOCAB: VocabSeed[] = [
  // ── Справа в установі ──
  w('załatwić', 'verb', 'B1', 'владнати, залагодити', 'уладить, решить (вопрос)', 'to sort out, to settle', ['urzad', 'daily'],
    ['Chcę załatwić tę sprawę jeszcze dzisiaj.', 'Я хочу владнати цю справу ще сьогодні.', 'Я хочу уладить это дело ещё сегодня.', 'I want to sort this matter out today.'], { ja: 'załatwię', past: 'załatwił' }),
  w('sprawa', 'noun', 'B1', 'справа, питання', 'дело, вопрос', 'matter, business', ['urzad'],
    ['W jakiej sprawie pan przyszedł?', 'У якій справі ви прийшли?', 'По какому делу вы пришли?', 'What is your business here?'], { gen: 'sprawy', loc: 'sprawie' }),
  w('urzędnik', 'noun', 'B1', 'урядовець, службовець', 'служащий, чиновник', 'clerk, civil servant', ['urzad', 'work'],
    ['Urzędnik sprawdził moje dokumenty.', 'Службовець перевірив мої документи.', 'Служащий проверил мои документы.', 'The clerk checked my documents.'], { gen: 'urzędnika' }),
  w('godziny urzędowania', 'phrase', 'B1', 'години роботи установи', 'часы работы учреждения', 'office hours', ['urzad', 'time'],
    ['Godziny urzędowania są napisane na drzwiach.', 'Години роботи установи написані на дверях.', 'Часы работы учреждения написаны на двери.', 'The office hours are written on the door.']),
  w('poczekać', 'verb', 'B1', 'зачекати, почекати', 'подождать, немного подождать', 'to wait (a moment)', ['daily', 'phrases'],
    ['Proszę poczekać chwilę, zaraz panią obsłużę.', 'Будь ласка, зачекайте хвилинку, зараз я вас обслужу.', 'Подождите минуту, сейчас я вас обслужу.', 'Please wait a moment, I’ll serve you right away.'], { ja: 'poczekam', past: 'poczekał' }),
  w('przyjmować', 'verb', 'B1', 'приймати (відвідувачів)', 'принимать (посетителей)', 'to receive (visitors)', ['urzad', 'work'],
    ['Pani Jolanta przyjmuje od ósmej do piętnastej.', 'Пані Йоланта приймає з восьмої до п’ятнадцятої.', 'Пани Иоланта принимает с восьми до пятнадцати.', 'Ms Jolanta sees visitors from eight to three.'], { ja: 'przyjmuję', past: 'przyjmował' }),

  // ── Заява й додатки ──
  w('złożyć', 'verb', 'B1', 'подати (документи), скласти', 'подать (документы), сложить', 'to submit, to file', ['urzad', 'documents'],
    ['Chcę złożyć wniosek o kartę pobytu.', 'Я хочу подати заяву на карту побуту.', 'Я хочу подать заявление на карту побыта.', 'I want to file an application for a residence card.'], { ja: 'złożę', past: 'złożył' }),
  w('załącznik', 'noun', 'B1', 'додаток, вкладення', 'приложение, вложение', 'attachment, enclosure', ['urzad', 'documents'],
    ['W załączniku wysyłam kopię paszportu.', 'У вкладенні надсилаю копію паспорта.', 'Во вложении отправляю копию паспорта.', 'I am attaching a copy of my passport.'], { gen: 'załącznika', loc: 'załączniku' }),
  w('kopia', 'noun', 'B1', 'копія', 'копия', 'copy', ['urzad', 'documents'],
    ['Proszę przynieść kopię umowy.', 'Будь ласка, принесіть копію договору.', 'Принесите, пожалуйста, копию договора.', 'Please bring a copy of the contract.'], { gen: 'kopii', acc: 'kopię' }),
  w('podpis', 'noun', 'B1', 'підпис', 'подпись', 'signature', ['urzad', 'documents'],
    ['Tutaj jest miejsce na pański podpis.', 'Тут місце для вашого підпису.', 'Здесь место для вашей подписи.', 'This is the place for your signature.'], { gen: 'podpisu' }),
  w('pieczątka', 'noun', 'B1', 'печатка, штамп', 'печать, штамп', 'stamp', ['urzad', 'documents'],
    ['Wniosek jest ważny tylko z pieczątką urzędu.', 'Заява дійсна лише з печаткою установи.', 'Заявление действительно только с печатью учреждения.', 'The application is valid only with the office stamp.'], { gen: 'pieczątki', instr: 'pieczątką' }),
  w('wymagany', 'adj', 'B1', 'необхідний, вимагається', 'необходимый, требуемый', 'required', ['urzad', 'documents'],
    ['Wymagane dokumenty są wymienione na stronie urzędu.', 'Необхідні документи перелічені на сайті установи.', 'Необходимые документы перечислены на сайте учреждения.', 'The required documents are listed on the office website.'], { f: 'wymagana', n: 'wymagane', pl: 'wymagani / wymagane' }),
  w('podpisać', 'verb', 'B1', 'підписати', 'подписать', 'to sign', ['urzad', 'documents'],
    ['Proszę podpisać tutaj, na dole.', 'Будь ласка, підпишіть тут, внизу.', 'Подпишите, пожалуйста, здесь, внизу.', 'Please sign here, at the bottom.'], { ja: 'podpiszę', past: 'podpisał' }),

  // ── Особисті дані й дати ──
  w('obywatelstwo', 'noun', 'B1', 'громадянство', 'гражданство', 'citizenship', ['documents', 'people'],
    ['Jakie ma pan obywatelstwo?', 'Яке у вас громадянство?', 'Какое у вас гражданство?', 'What citizenship do you have?'], { gen: 'obywatelstwa' }),
  w('stan cywilny', 'phrase', 'B1', 'сімейний стан', 'семейное положение', 'marital status', ['documents', 'people'],
    ['W formularzu trzeba podać stan cywilny.', 'У формі треба вказати сімейний стан.', 'В форме нужно указать семейное положение.', 'On the form you have to give your marital status.']),
  w('miejsce urodzenia', 'phrase', 'B1', 'місце народження', 'место рождения', 'place of birth', ['documents'],
    ['W rubryce „miejsce urodzenia” wpisuję: Kijów.', 'У графі «місце народження» я пишу: Київ.', 'В графе «место рождения» я пишу: Киев.', 'In the “place of birth” box I write: Kyiv.']),
  w('adres zameldowania', 'phrase', 'B1', 'адреса реєстрації', 'адрес регистрации', 'registered address', ['documents', 'home'],
    ['Adres zameldowania jest inny niż adres zamieszkania.', 'Адреса реєстрації відрізняється від адреси проживання.', 'Адрес регистрации отличается от адреса проживания.', 'My registered address is different from the address where I live.']),
  w('PESEL', 'noun', 'B1', 'PESEL (особистий номер у Польщі)', 'PESEL (личный номер в Польше)', 'PESEL (Polish personal ID number)', ['documents', 'numbers'],
    ['Numer PESEL składa się z jedenastu cyfr.', 'Номер PESEL складається з одинадцяти цифр.', 'Номер PESEL состоит из одиннадцати цифр.', 'A PESEL number has eleven digits.']),
  w('nazwisko panieńskie', 'phrase', 'B1', 'дівоче прізвище', 'девичья фамилия', 'maiden name', ['documents', 'people'],
    ['Moje nazwisko panieńskie to Kowalska.', 'Моє дівоче прізвище — Ковальська.', 'Моя девичья фамилия — Ковальская.', 'My maiden name is Kowalska.']),

  // ── Карта побуту й терміни ──
  w('ważny', 'adj', 'B1', 'дійсний, чинний; важливий', 'действительный; важный', 'valid; important', ['documents', 'time'],
    ['Moja karta pobytu jest ważna do końca marca.', 'Моя карта побуту дійсна до кінця березня.', 'Моя карта побыта действительна до конца марта.', 'My residence card is valid until the end of March.'], { f: 'ważna', n: 'ważne', pl: 'ważni / ważne' }),
  w('przedłużyć', 'verb', 'B1', 'продовжити', 'продлить', 'to extend, to renew', ['documents', 'urzad'],
    ['Muszę przedłużyć kartę pobytu jeszcze w tym miesiącu.', 'Мені треба продовжити карту побуту ще цього місяця.', 'Мне нужно продлить карту побыта ещё в этом месяце.', 'I have to renew my residence card this month.'], { ja: 'przedłużę', past: 'przedłużył' }),
  w('wygasnąć', 'verb', 'B1', 'втратити чинність, закінчитися', 'утратить силу, истечь', 'to expire', ['documents', 'time'],
    ['Moje zezwolenie wygaśnie pierwszego czerwca.', 'Мій дозвіл втратить чинність першого червня.', 'Моё разрешение истечёт первого июня.', 'My permit expires on the first of June.'], { he: 'wygaśnie', past: 'wygasł' }),
  w('zezwolenie', 'noun', 'B1', 'дозвіл', 'разрешение', 'permit', ['documents', 'urzad'],
    ['Zezwolenie na pobyt czasowy wydaje się na kilka lat.', 'Дозвіл на тимчасове перебування видають на кілька років.', 'Разрешение на временное пребывание выдают на несколько лет.', 'A temporary residence permit is issued for a few years.'], { gen: 'zezwolenia' }),
  w('pobyt', 'noun', 'B1', 'перебування, побут', 'пребывание, проживание', 'stay, residence', ['documents', 'travel'],
    ['W formularzu podaję cel pobytu: praca.', 'У формі я вказую мету перебування: робота.', 'В форме я указываю цель пребывания: работа.', 'On the form I give the purpose of my stay: work.'], { gen: 'pobytu' }),
  w('odciski palców', 'phrase', 'B1', 'відбитки пальців', 'отпечатки пальцев', 'fingerprints', ['documents', 'urzad'],
    ['W urzędzie pobiorą mi odciski palców.', 'В установі в мене візьмуть відбитки пальців.', 'В учреждении у меня снимут отпечатки пальцев.', 'At the office they will take my fingerprints.']),
  w('w ciągu', 'phrase', 'B1', 'протягом, упродовж', 'в течение', 'within', ['urzad', 'time'],
    ['Wniosek trzeba złożyć w ciągu trzydziestu dni.', 'Заяву треба подати протягом тридцяти днів.', 'Заявление нужно подать в течение тридцати дней.', 'The application must be filed within thirty days.']),

  // ── Пошта ──
  w('awizo', 'noun', 'B1', 'повідомлення про посилку (авізо)', 'извещение о посылке (авизо)', 'collection notice', ['parcel', 'daily'],
    ['W skrzynce znalazłem awizo.', 'У поштовій скриньці я знайшов авізо.', 'В почтовом ящике я нашёл авизо.', 'I found a collection notice in my letterbox.']),
  w('nadawca', 'noun', 'B1', 'відправник', 'отправитель', 'sender', ['parcel'],
    ['Nadawcą listu jest Urząd Miasta Lublin.', 'Відправник листа — Міська управа Любліна.', 'Отправитель письма — Городская управа Люблина.', 'The sender of the letter is Lublin City Hall.'], { gen: 'nadawcy', instr: 'nadawcą' }),
  w('adresat', 'noun', 'B1', 'адресат, одержувач', 'адресат, получатель', 'addressee', ['parcel'],
    ['Przesyłkę może odebrać tylko adresat.', 'Відправлення може отримати лише адресат.', 'Отправление может получить только адресат.', 'Only the addressee can collect the parcel.'], { gen: 'adresata' }),
  w('przesyłka', 'noun', 'B1', 'відправлення', 'отправление, посылка', 'parcel, item (mail)', ['parcel'],
    ['Przesyłka czeka na poczcie od wtorku.', 'Відправлення чекає на пошті з вівторка.', 'Отправление ждёт на почте со вторника.', 'The parcel has been waiting at the post office since Tuesday.'], { gen: 'przesyłki', acc: 'przesyłkę' }),
  w('kod pocztowy', 'phrase', 'B1', 'поштовий індекс', 'почтовый индекс', 'postcode', ['parcel', 'city'],
    ['Kod pocztowy w Lublinie zaczyna się od 20.', 'Поштовий індекс у Любліні починається з 20.', 'Почтовый индекс в Люблине начинается с 20.', 'Postcodes in Lublin start with 20.']),
  w('za potwierdzeniem odbioru', 'phrase', 'B1', 'з підтвердженням отримання', 'с подтверждением получения', 'with an acknowledgement of receipt', ['parcel', 'documents'],
    ['Wysyłam list polecony za potwierdzeniem odbioru.', 'Я відправляю рекомендований лист із підтвердженням отримання.', 'Я отправляю заказное письмо с уведомлением о вручении.', 'I am sending a registered letter with an acknowledgement of receipt.']),

  // ── Банк ──
  w('saldo', 'noun', 'B1', 'сальдо, залишок на рахунку', 'сальдо, остаток на счёте', 'balance', ['bank'],
    ['Saldo konta wynosi trzysta złotych.', 'Залишок на рахунку становить триста злотих.', 'Остаток на счёте составляет триста злотых.', 'The account balance is three hundred zloty.'], { gen: 'salda' }),
  w('wpłacić', 'verb', 'B1', 'внести (гроші), покласти на рахунок', 'внести (деньги), положить на счёт', 'to pay in, to deposit', ['bank'],
    ['Chcę wpłacić pieniądze na konto.', 'Я хочу покласти гроші на рахунок.', 'Я хочу положить деньги на счёт.', 'I want to pay money into my account.'], { ja: 'wpłacę', past: 'wpłacił' }),
  w('wypłacić', 'verb', 'B1', 'зняти (гроші), виплатити', 'снять (деньги), выплатить', 'to withdraw, to pay out', ['bank'],
    ['Chcę wypłacić pięćset złotych z bankomatu.', 'Я хочу зняти п’ятсот злотих у банкоматі.', 'Я хочу снять пятьсот злотых в банкомате.', 'I want to withdraw five hundred zloty from the cash machine.'], { ja: 'wypłacę', past: 'wypłacił' }),
  w('karta płatnicza', 'phrase', 'B1', 'платіжна картка', 'платёжная карта', 'payment card', ['bank', 'shopping'],
    ['Karta płatnicza przyszła pocztą.', 'Платіжна картка прийшла поштою.', 'Платёжная карта пришла по почте.', 'The payment card arrived by post.']),
  w('zablokować', 'verb', 'B1', 'заблокувати', 'заблокировать', 'to block', ['bank', 'daily'],
    ['Zgubiłem kartę, proszę ją zablokować.', 'Я загубив картку, будь ласка, заблокуйте її.', 'Я потерял карту, заблокируйте её, пожалуйста.', 'I lost my card, please block it.'], { ja: 'zablokuję', past: 'zablokował' }),
  w('numer konta', 'phrase', 'B1', 'номер рахунку', 'номер счёта', 'account number', ['bank'],
    ['Podaj mi swój numer konta, zrobię przelew.', 'Дай мені свій номер рахунку, я зроблю переказ.', 'Дай мне свой номер счёта, я сделаю перевод.', 'Give me your account number and I’ll make a transfer.']),

  // ── Договір ──
  w('zawrzeć', 'verb', 'B1', 'укласти (договір)', 'заключить (договор)', 'to conclude (a contract)', ['work', 'rent', 'documents'],
    ['Zawarliśmy umowę na rok.', 'Ми уклали договір на рік.', 'Мы заключили договор на год.', 'We concluded a contract for a year.'], { ja: 'zawrę', past: 'zawarł' }),
  w('wypowiedzieć', 'verb', 'B1', 'розірвати (договір), вимовити', 'расторгнуть (договор), произнести', 'to terminate (a contract)', ['work', 'rent'],
    ['Chcę wypowiedzieć umowę najmu.', 'Я хочу розірвати договір оренди.', 'Я хочу расторгнуть договор аренды.', 'I want to terminate the rental agreement.'], { ja: 'wypowiem', past: 'wypowiedział' }),
  w('okres wypowiedzenia', 'phrase', 'B1', 'термін попередження про розірвання', 'срок предупреждения о расторжении', 'notice period', ['work', 'rent'],
    ['Okres wypowiedzenia wynosi jeden miesiąc.', 'Термін попередження про розірвання — один місяць.', 'Срок предупреждения о расторжении — один месяц.', 'The notice period is one month.']),
  w('zobowiązać się', 'verb', 'B1', 'зобов’язатися', 'обязаться', 'to undertake, to commit oneself', ['work', 'rent'],
    ['Najemca zobowiązuje się do terminowego płacenia czynszu.', 'Орендар зобов’язується вчасно платити оренду.', 'Наниматель обязуется вовремя платить арендную плату.', 'The tenant undertakes to pay the rent on time.'], { ja: 'zobowiążę się', past: 'zobowiązał się' }),
  w('na podstawie', 'phrase', 'B1', 'на підставі (чогось)', 'на основании (чего-то)', 'on the basis of', ['documents', 'urzad'],
    ['Na podstawie tej umowy wynajmuję mieszkanie.', 'На підставі цього договору я винаймаю квартиру.', 'На основании этого договора я снимаю квартиру.', 'On the basis of this contract I rent the flat.']),
  w('w razie', 'phrase', 'B1', 'у разі (чогось)', 'в случае (чего-то)', 'in case of', ['phrases', 'documents'],
    ['W razie problemów proszę dzwonić do administratora.', 'У разі проблем телефонуйте адміністратору.', 'В случае проблем звоните администратору.', 'In case of problems, please call the administrator.']),

  // ── Люблін: унія й цебуляж ──
  w('unia', 'noun', 'B1', 'унія, союз', 'уния, союз', 'union', ['city', 'holidays'],
    ['W 1569 roku zawarto w Lublinie unię Polski i Litwy.', 'У 1569 році в Любліні уклали унію Польщі й Литви.', 'В 1569 году в Люблине заключили унию Польши и Литвы.', 'In 1569 the union of Poland and Lithuania was concluded in Lublin.'], { gen: 'unii' }),
  w('sejm', 'noun', 'B1', 'сейм, парламент', 'сейм, парламент', 'the Sejm (parliament)', ['city', 'urzad'],
    ['Sejm obradował w Lublinie przez kilka miesięcy.', 'Сейм засідав у Любліні кілька місяців.', 'Сейм заседал в Люблине несколько месяцев.', 'The Sejm sat in Lublin for several months.'], { gen: 'sejmu' }),
  w('królestwo', 'noun', 'B1', 'королівство', 'королевство', 'kingdom', ['city', 'holidays'],
    ['Polska była wtedy królestwem.', 'Польща тоді була королівством.', 'Польша тогда была королевством.', 'Poland was a kingdom then.'], { instr: 'królestwem' }),
  w('księstwo', 'noun', 'B1', 'князівство', 'княжество', 'duchy', ['city', 'holidays'],
    ['Litwa była wielkim księstwem.', 'Литва була великим князівством.', 'Литва была великим княжеством.', 'Lithuania was a grand duchy.'], { instr: 'księstwem' }),
  w('cebularz', 'noun', 'B1', 'цебуляж (люблінська булочка з цибулею)', 'цебуляж (люблинская булочка с луком)', 'cebularz (Lublin onion roll)', ['food', 'city'],
    ['Cebularz to lubelska bułka z cebulą i makiem.', 'Цебуляж — люблінська булочка з цибулею й маком.', 'Цебуляж — люблинская булочка с луком и маком.', 'Cebularz is a Lublin roll topped with onion and poppy seeds.'], { gen: 'cebularza' }),
  w('Stare Miasto', 'phrase', 'B1', 'Старе місто', 'Старый город', 'the Old Town', ['city', 'travel'],
    ['Wieczorem spacerujemy po Starym Mieście.', 'Увечері ми гуляємо Старим містом.', 'Вечером мы гуляем по Старому городу.', 'In the evening we stroll around the Old Town.']),
];
