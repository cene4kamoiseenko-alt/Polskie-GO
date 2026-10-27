/**
 * Словник Катовіце (розширення курсу): поїздки регіоном і дієслова руху з префіксами, самокат і таксі,
 * посилки й пошта, оренда квартири й поломки, дзвінки, ввічливі прохання, загублені речі.
 * Кожне слово має природний приклад із перекладом. Приблизне прочитання будується за правилами (pron.ts).
 */
import { polishCyrillic, type Cefr } from '@polski-go/shared';
import { t } from './builders';
import type { VocabSeed } from './vocab';

type Ex = [pl: string, uk: string, ru: string, en: string];

const w = (pl: string, pos: string, cefr: Cefr, uk: string, ru: string, en: string, topics: string[], ex: Ex, forms?: Record<string, string>): VocabSeed => ({
  pl, pos, tr: t(uk, ru, en), pron: polishCyrillic(pl, 'uk').replace(/́/g, ''), cefr, topics, forms,
  examples: [{ pl: ex[0], tr: t(ex[1], ex[2], ex[3]) }],
});

export const KATOWICE_VOCAB: VocabSeed[] = [
  // ── Поїздка регіоном ──
  w('podróż', 'noun', 'A1', 'подорож, поїздка', 'путешествие, поездка', 'journey, trip', ['travel'],
    ['Podróż pociągiem do Gliwic trwa około pół godziny.', 'Поїздка потягом до Гливиць триває близько пів години.', 'Поездка на поезде в Гливице длится около получаса.', 'The train journey to Gliwice takes about half an hour.'], { gen: 'podróży' }),
  w('trwać', 'verb', 'A2', 'тривати', 'длиться', 'to last, to take (time)', ['time', 'travel'],
    ['Koncert trwa dwie godziny.', 'Концерт триває дві години.', 'Концерт длится два часа.', 'The concert lasts two hours.'], { on: 'trwa' }),
  w('pół godziny', 'phrase', 'A1', 'пів години', 'полчаса', 'half an hour', ['time'],
    ['Następny pociąg jest za pół godziny.', 'Наступний потяг за пів години.', 'Следующий поезд через полчаса.', 'The next train is in half an hour.']),

  // ── Приїхати, виїхати, увійти ──
  w('przyjechać', 'verb', 'A1', 'приїхати', 'приехать', 'to arrive (by vehicle)', ['travel'],
    ['Przyjadę do Katowic w piątek wieczorem.', 'Я приїду до Катовіце в п\'ятницю ввечері.', 'Я приеду в Катовице в пятницу вечером.', 'I\'ll arrive in Katowice on Friday evening.'], { ja: 'przyjadę' }),
  w('wyjechać', 'verb', 'A2', 'виїхати, поїхати', 'уехать, выехать', 'to leave (by vehicle)', ['travel'],
    ['Wyjadę z domu o szóstej.', 'Я виїду з дому о шостій.', 'Я выеду из дома в шесть.', 'I\'ll leave home at six.'], { ja: 'wyjadę' }),
  w('przyjść', 'verb', 'A1', 'прийти', 'прийти', 'to come (on foot)', ['travel', 'people'],
    ['Przyjdę do ciebie po pracy.', 'Я прийду до тебе після роботи.', 'Я приду к тебе после работы.', 'I\'ll come over after work.'], { ja: 'przyjdę' }),
  w('wyjść', 'verb', 'A1', 'вийти', 'выйти', 'to go out, to leave (on foot)', ['travel', 'daily'],
    ['Wyjdę z biura o piątej.', 'Я вийду з офісу о п\'ятій.', 'Я выйду из офиса в пять.', 'I\'ll leave the office at five.'], { ja: 'wyjdę' }),
  w('wejść', 'verb', 'A1', 'увійти, зайти', 'войти, зайти', 'to enter, to come in', ['travel', 'daily'],
    ['Proszę wejść, drzwi są otwarte.', 'Заходьте, двері відчинені.', 'Входите, дверь открыта.', 'Please come in, the door is open.'], { ja: 'wejdę' }),

  // ── Самокат і велосипед ──
  w('hulajnoga', 'noun', 'A2', 'самокат', 'самокат', 'scooter', ['transport', 'city'],
    ['Jeżdżę do pracy hulajnogą elektryczną.', 'Я їжджу на роботу електросамокатом.', 'Я езжу на работу на электросамокате.', 'I ride an e-scooter to work.'], { ins: 'hulajnogą' }),
  w('ścieżka rowerowa', 'noun', 'A2', 'велодоріжка', 'велодорожка', 'cycle path', ['transport', 'city'],
    ['Jedź ścieżką rowerową, nie chodnikiem.', 'Їдь велодоріжкою, а не тротуаром.', 'Едь по велодорожке, а не по тротуару.', 'Ride on the cycle path, not the pavement.']),
  w('zaparkować', 'verb', 'A2', 'припаркувати', 'припарковать', 'to park', ['transport'],
    ['Gdzie mogę zaparkować hulajnogę?', 'Де я можу припаркувати самокат?', 'Где я могу припарковать самокат?', 'Where can I park the scooter?'], { ja: 'zaparkuję' }),
  w('pieszy', 'noun', 'A2', 'пішохід', 'пешеход', 'pedestrian', ['city', 'transport'],
    ['Na chodniku pierwszeństwo mają piesi.', 'На тротуарі перевагу мають пішоходи.', 'На тротуаре преимущество у пешеходов.', 'Pedestrians have priority on the pavement.'], { pl: 'piesi' }),
  w('chodnik', 'noun', 'A2', 'тротуар', 'тротуар', 'pavement, sidewalk', ['city'],
    ['Rowery nie mogą stać na środku chodnika.', 'Велосипеди не можуть стояти посеред тротуару.', 'Велосипеды не могут стоять посреди тротуара.', 'Bikes can\'t be left in the middle of the pavement.'], { loc: 'na chodniku' }),

  // ── Таксі ──
  w('zamówić', 'verb', 'A1', 'замовити', 'заказать', 'to order, to book', ['transport', 'restaurants'],
    ['Zamówię taksówkę przez aplikację.', 'Я замовлю таксі через застосунок.', 'Я закажу такси через приложение.', 'I\'ll book a taxi through the app.'], { ja: 'zamówię' }),
  w('kurs', 'noun', 'A2', 'поїздка (таксі)', 'поездка (на такси)', 'ride, fare (taxi)', ['transport'],
    ['Ile kosztuje kurs na dworzec?', 'Скільки коштує поїздка до вокзалу?', 'Сколько стоит поездка до вокзала?', 'How much is a ride to the station?']),
  w('zatrzymać się', 'verb', 'A2', 'зупинитися', 'остановиться', 'to stop', ['transport'],
    ['Proszę się tu zatrzymać.', 'Зупиніться, будь ласка, тут.', 'Остановитесь, пожалуйста, здесь.', 'Please stop here.'], { ja: 'zatrzymam się' }),
  w('zawieźć', 'verb', 'A2', 'завезти, відвезти', 'отвезти', 'to drive (someone somewhere)', ['transport'],
    ['Czy może mnie pan zawieźć na lotnisko?', 'Чи можете ви відвезти мене в аеропорт?', 'Можете отвезти меня в аэропорт?', 'Could you drive me to the airport?'], { ja: 'zawiozę' }),

  // ── Посилки й пошта ──
  w('kurier', 'noun', 'A1', 'кур\'єр', 'курьер', 'courier', ['parcel'],
    ['Kurier przyjedzie między dziesiątą a dwunastą.', 'Кур\'єр приїде між десятою і дванадцятою.', 'Курьер приедет между десятью и двенадцатью.', 'The courier will come between ten and twelve.']),
  w('poczta', 'noun', 'A1', 'пошта', 'почта', 'post office', ['parcel', 'city'],
    ['Idę na pocztę wysłać list.', 'Я йду на пошту надіслати лист.', 'Я иду на почту отправить письмо.', 'I\'m going to the post office to send a letter.'], { loc: 'na poczcie' }),
  w('nadać', 'verb', 'A2', 'відправити (посилку, лист)', 'отправить (посылку, письмо)', 'to send, to post', ['parcel'],
    ['Chcę nadać paczkę do Ukrainy.', 'Я хочу відправити посилку в Україну.', 'Я хочу отправить посылку в Украину.', 'I want to send a parcel to Ukraine.'], { ja: 'nadam' }),
  w('list', 'noun', 'A1', 'лист', 'письмо', 'letter', ['parcel'],
    ['Wysyłam list do babci.', 'Я надсилаю лист бабусі.', 'Я отправляю письмо бабушке.', 'I\'m sending a letter to my grandma.'], { gen: 'listu' }),
  w('list polecony', 'noun', 'A2', 'рекомендований лист', 'заказное письмо', 'registered letter', ['parcel', 'documents'],
    ['To jest list polecony z urzędu.', 'Це рекомендований лист з установи.', 'Это заказное письмо из учреждения.', 'This is a registered letter from a public office.']),
  w('koperta', 'noun', 'A1', 'конверт', 'конверт', 'envelope', ['parcel'],
    ['Poproszę dużą kopertę.', 'Дайте, будь ласка, великий конверт.', 'Дайте, пожалуйста, большой конверт.', 'A large envelope, please.'], { acc: 'kopertę' }),

  // ── Оренда квартири ──
  w('wynająć', 'verb', 'A2', 'винайняти, орендувати', 'снять, арендовать', 'to rent', ['rent', 'home'],
    ['Chcę wynająć mieszkanie blisko centrum.', 'Я хочу винайняти квартиру недалеко від центру.', 'Я хочу снять квартиру недалеко от центра.', 'I want to rent a flat near the centre.'], { ja: 'wynajmę' }),
  w('kawalerka', 'noun', 'A2', 'однокімнатна квартира (студія)', 'однокомнатная квартира (студия)', 'studio flat', ['rent', 'home'],
    ['Kawalerka ma jeden pokój, kuchnię i łazienkę.', 'Однокімнатна квартира — це одна кімната, кухня й ванна.', 'В однокомнатной квартире одна комната, кухня и ванная.', 'A studio flat has one room, a kitchen and a bathroom.']),
  w('czynsz', 'noun', 'A2', 'орендна плата, квартплата', 'арендная плата, квартплата', 'rent', ['rent'],
    ['Czynsz płacę do dziesiątego każdego miesiąca.', 'Квартплату я плачу до десятого числа кожного місяця.', 'Квартплату я плачу до десятого числа каждого месяца.', 'I pay the rent by the tenth of every month.'], { gen: 'czynszu' }),
  w('kaucja', 'noun', 'B1', 'застава (за квартиру)', 'залог (за квартиру)', 'deposit', ['rent'],
    ['Kaucja wynosi dwa tysiące złotych.', 'Застава становить дві тисячі злотих.', 'Залог составляет две тысячи злотых.', 'The deposit is two thousand złoty.'], { acc: 'kaucję' }),
  w('media', 'noun', 'A2', 'комунальні послуги', 'коммунальные услуги', 'utilities', ['rent'],
    ['Czynsz nie obejmuje mediów: prądu, gazu i wody.', 'Квартплата не включає комунальних: світла, газу й води.', 'Квартплата не включает коммунальные: свет, газ и воду.', 'The rent doesn\'t include utilities: electricity, gas and water.'], { gen: 'mediów' }),
  w('umeblowany', 'adj', 'A2', 'мебльований, з меблями', 'меблированный, с мебелью', 'furnished', ['rent', 'home'],
    ['Mieszkanie jest umeblowane.', 'Квартира з меблями.', 'Квартира с мебелью.', 'The flat is furnished.'], { f: 'umeblowana' }),
  w('właściciel', 'noun', 'A2', 'власник', 'владелец', 'owner, landlord', ['rent'],
    ['Właściciel mieszkania mieszka w Gliwicach.', 'Власник квартири живе в Гливицях.', 'Владелец квартиры живёт в Гливице.', 'The landlord lives in Gliwice.'], { f: 'właścicielka' }),

  // ── Поломки ──
  w('zepsuty', 'adj', 'A2', 'зламаний, зіпсований', 'сломанный, испорченный', 'broken', ['home'],
    ['Pralka jest zepsuta.', 'Пральна машина зламана.', 'Стиральная машина сломана.', 'The washing machine is broken.'], { f: 'zepsuta' }),
  w('pralka', 'noun', 'A1', 'пральна машина', 'стиральная машина', 'washing machine', ['home'],
    ['Pralka stoi w łazience.', 'Пральна машина стоїть у ванній.', 'Стиральная машина стоит в ванной.', 'The washing machine is in the bathroom.']),
  w('kran', 'noun', 'A2', 'кран', 'кран', 'tap, faucet', ['home'],
    ['Kran w kuchni cieknie.', 'Кран на кухні протікає.', 'Кран на кухне течёт.', 'The kitchen tap is leaking.']),
  w('ogrzewanie', 'noun', 'A2', 'опалення', 'отопление', 'heating', ['home', 'rent'],
    ['Ogrzewanie nie działa i w mieszkaniu jest zimno.', 'Опалення не працює, і в квартирі холодно.', 'Отопление не работает, и в квартире холодно.', 'The heating isn\'t working and the flat is cold.']),
  w('prąd', 'noun', 'A2', 'електрика, струм', 'электричество, ток', 'electricity, power', ['home', 'rent'],
    ['Od rana nie ma prądu.', 'З ранку немає світла.', 'С утра нет света.', 'There\'s been no power since the morning.'], { gen: 'prądu' }),
  w('naprawić', 'verb', 'A2', 'полагодити, відремонтувати', 'починить, отремонтировать', 'to repair, to fix', ['home'],
    ['Hydraulik naprawi kran jutro.', 'Сантехнік полагодить кран завтра.', 'Сантехник починит кран завтра.', 'The plumber will fix the tap tomorrow.'], { ja: 'naprawię' }),
  w('hydraulik', 'noun', 'A2', 'сантехнік', 'сантехник', 'plumber', ['home', 'work'],
    ['Hydraulik przyjdzie jutro o dziewiątej.', 'Сантехнік прийде завтра о дев\'ятій.', 'Сантехник придёт завтра в девять.', 'The plumber will come tomorrow at nine.']),

  // ── Дзвінки ──
  w('zadzwonić', 'verb', 'A1', 'подзвонити', 'позвонить', 'to call, to phone', ['phrases'],
    ['Zadzwonię do ciebie wieczorem.', 'Я подзвоню тобі ввечері.', 'Я позвоню тебе вечером.', 'I\'ll call you in the evening.'], { ja: 'zadzwonię' }),
  w('oddzwonić', 'verb', 'A2', 'передзвонити', 'перезвонить', 'to call back', ['phrases'],
    ['Nie mogę teraz rozmawiać, oddzwonię za godzinę.', 'Я не можу зараз говорити, передзвоню за годину.', 'Я не могу сейчас говорить, перезвоню через час.', 'I can\'t talk now, I\'ll call back in an hour.'], { ja: 'oddzwonię' }),
  w('wiadomość', 'noun', 'A1', 'повідомлення', 'сообщение', 'message', ['phrases'],
    ['Wyślij mi wiadomość z adresem.', 'Надішли мені повідомлення з адресою.', 'Пришли мне сообщение с адресом.', 'Send me a message with the address.'], { pl: 'wiadomości' }),
  w('numer telefonu', 'noun', 'A1', 'номер телефону', 'номер телефона', 'phone number', ['phrases', 'documents'],
    ['Podasz mi swój numer telefonu?', 'Даси мені свій номер телефону?', 'Дашь мне свой номер телефона?', 'Will you give me your phone number?']),
  w('zaraz', 'adv', 'A1', 'зараз, за хвилинку', 'сейчас, через минутку', 'in a moment', ['time'],
    ['Zaraz wracam!', 'Зараз повернуся!', 'Сейчас вернусь!', 'Back in a moment!']),

  // ── Ввічливі прохання ──
  w('przeszkadzać', 'verb', 'A2', 'заважати', 'мешать', 'to disturb, to bother', ['phrases'],
    ['Przepraszam, że przeszkadzam.', 'Перепрошую, що заважаю.', 'Простите, что беспокою.', 'Sorry to bother you.'], { ja: 'przeszkadzam' }),
  w('z przyjemnością', 'phrase', 'A2', 'із задоволенням', 'с удовольствием', 'with pleasure', ['phrases'],
    ['Z przyjemnością ci pomogę.', 'Я із задоволенням тобі допоможу.', 'Я с удовольствием тебе помогу.', 'I\'ll gladly help you.']),
  w('niestety', 'adv', 'A1', 'на жаль', 'к сожалению', 'unfortunately', ['phrases'],
    ['Niestety nie mogę jutro przyjść.', 'На жаль, я не можу завтра прийти.', 'К сожалению, я не могу завтра прийти.', 'Unfortunately I can\'t come tomorrow.']),
  w('chętnie', 'adv', 'A1', 'охоче, залюбки', 'охотно, с радостью', 'gladly', ['phrases'],
    ['Chętnie pójdę z tobą na koncert.', 'Я залюбки піду з тобою на концерт.', 'Я с радостью пойду с тобой на концерт.', 'I\'d love to go to the concert with you.']),

  // ── Загубив, знайшов ──
  w('zgubić', 'verb', 'A1', 'загубити', 'потерять', 'to lose', ['daily'],
    ['Uważaj, żeby nie zgubić kluczy.', 'Будь уважним, щоб не загубити ключі.', 'Будь внимателен, чтобы не потерять ключи.', 'Be careful not to lose the keys.']),
  w('znaleźć', 'verb', 'A1', 'знайти', 'найти', 'to find', ['daily'],
    ['Nie mogę znaleźć portfela.', 'Я не можу знайти гаманець.', 'Я не могу найти кошелёк.', 'I can\'t find my wallet.'], { ja: 'znajdę' }),
  w('portfel', 'noun', 'A1', 'гаманець', 'кошелёк', 'wallet', ['daily'],
    ['Portfel jest w plecaku.', 'Гаманець у рюкзаку.', 'Кошелёк в рюкзаке.', 'The wallet is in the backpack.'], { gen: 'portfela' }),
  w('dokumenty', 'noun', 'A1', 'документи', 'документы', 'documents, ID', ['documents'],
    ['W portfelu mam wszystkie dokumenty.', 'У гаманці в мене всі документи.', 'В кошельке у меня все документы.', 'I have all my documents in my wallet.'], { gen: 'dokumentów' }),
  w('biuro rzeczy znalezionych', 'noun', 'A2', 'бюро знахідок', 'бюро находок', 'lost property office', ['city', 'documents'],
    ['Zapytaj w biurze rzeczy znalezionych.', 'Запитай у бюро знахідок.', 'Спроси в бюро находок.', 'Ask at the lost property office.']),

  // ── Повторення ──
  w('chyba', 'adv', 'A1', 'мабуть, здається', 'наверное, кажется', 'probably, I think', ['phrases'],
    ['Chyba będzie padać.', 'Мабуть, буде дощ.', 'Кажется, будет дождь.', 'I think it\'s going to rain.']),
  w('może', 'adv', 'A1', 'може, можливо', 'может, возможно', 'maybe', ['phrases'],
    ['Może pójdziemy do Spodka?', 'Може, підемо в Сподек?', 'Может, пойдём в Сподек?', 'Maybe we could go to the Spodek?']),
];
