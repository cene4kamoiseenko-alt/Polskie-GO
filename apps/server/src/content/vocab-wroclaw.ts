/**
 * Словник Вроцлава (розширення курсу, уроки 5–16): одяг і кольори, примірочна й розміри, повернення й обмін,
 * ринок Hala Targowa (вага, упаковки), список покупок, ціни до тисячі, бронювання столика, смаки,
 * вроцлавські гноми, подарунок, порівняння «дешевший / кращий».
 * Кожне слово має природний приклад із перекладом. Приблизне прочитання будується за правилами (pron.ts).
 */
import { polishCyrillic, type Cefr } from '@polski-go/shared';
import { t } from './builders';
import type { VocabSeed } from './vocab';

type Ex = [pl: string, uk: string, ru: string, en: string];

/**
 * Рівень CEFR — за складністю самого слова: побутові предмети, кольори, базові дієслова — A1;
 * повернення й гарантія, вищий ступінь прикметників, умовний спосіб, рідкісні упаковки й смаки — A2.
 */
const WROCLAW_CEFR: Record<string, Cefr> = {
  przymierzalnia: 'A2', przymierzyć: 'A2', pasować: 'A2', większy: 'A2', mniejszy: 'A2', wygodny: 'A2',
  zwrócić: 'A2', wymienić: 'A2', reklamacja: 'A2', wyprzedaż: 'A2', zepsuty: 'A2', gwarancja: 'A2', zniżka: 'A2',
  deko: 'A2', puszka: 'A2', śmietana: 'A2', 'po ile?': 'A2', drobne: 'A2', rozmienić: 'A2',
  zarezerwować: 'A2', chciałbym: 'A2', chciałabym: 'A2', 'na nazwisko': 'A2', kwaśny: 'A2', 'danie dnia': 'A2',
  krasnal: 'A2', 'podobać się': 'A2', zapakować: 'A2', tańszy: 'A2', droższy: 'A2', lepszy: 'A2', najlepszy: 'A2', modny: 'A2', wybrać: 'A2',
};

const w = (pl: string, pos: string, uk: string, ru: string, en: string, topics: string[], ex: Ex, forms?: Record<string, string>): VocabSeed => ({
  pl, pos, tr: t(uk, ru, en), pron: polishCyrillic(pl, 'uk').replace(/́/g, ''), cefr: WROCLAW_CEFR[pl] ?? 'A1', topics, forms,
  examples: [{ pl: ex[0], tr: t(ex[1], ex[2], ex[3]) }],
});

export const WROCLAW_VOCAB: VocabSeed[] = [
  // ── Одяг і кольори ──
  w('sukienka', 'noun', 'сукня', 'платье', 'dress', ['clothes', 'shopping'],
    ['Ta sukienka jest za krótka.', 'Ця сукня закоротка.', 'Это платье слишком короткое.', 'This dress is too short.'], { acc: 'sukienkę' }),
  w('spodnie', 'noun', 'штани', 'брюки', 'trousers', ['clothes', 'shopping'],
    ['Szukam czarnych spodni.', 'Шукаю чорні штани.', 'Ищу чёрные брюки.', 'I\'m looking for black trousers.'], { gen: 'spodni' }),
  w('koszula', 'noun', 'сорочка', 'рубашка', 'shirt', ['clothes', 'shopping'],
    ['Do pracy noszę białą koszulę.', 'На роботу я ношу білу сорочку.', 'На работу я ношу белую рубашку.', 'I wear a white shirt to work.'], { acc: 'koszulę' }),
  w('sweter', 'noun', 'светр', 'свитер', 'sweater', ['clothes', 'shopping'],
    ['W zimie noszę ciepły sweter.', 'Узимку я ношу теплий светр.', 'Зимой я ношу тёплый свитер.', 'In winter I wear a warm sweater.'], { gen: 'swetra' }),
  w('buty', 'noun', 'взуття, черевики', 'обувь, ботинки', 'shoes', ['clothes', 'shopping'],
    ['Te buty są bardzo wygodne.', 'Це взуття дуже зручне.', 'Эти ботинки очень удобные.', 'These shoes are very comfortable.'], { sg: 'but', gen: 'butów' }),
  w('kurtka', 'noun', 'куртка', 'куртка', 'jacket', ['clothes', 'shopping'],
    ['Weź kurtkę, bo pada deszcz.', 'Візьми куртку, бо йде дощ.', 'Возьми куртку, потому что идёт дождь.', 'Take a jacket, it\'s raining.'], { acc: 'kurtkę' }),
  w('szalik', 'noun', 'шарф', 'шарф', 'scarf', ['clothes', 'shopping'],
    ['Kupuję szalik dla taty.', 'Купую шарф для тата.', 'Покупаю шарф для папы.', 'I\'m buying a scarf for my dad.']),
  w('torebka', 'noun', 'сумочка', 'сумочка', 'handbag', ['clothes', 'shopping'],
    ['Mama ma nową skórzaną torebkę.', 'У мами нова шкіряна сумочка.', 'У мамы новая кожаная сумочка.', 'Mum has a new leather handbag.'], { acc: 'torebkę' }),
  w('kolor', 'noun', 'колір', 'цвет', 'colour', ['clothes', 'shopping'],
    ['Jaki kolor pan woli?', 'Який колір ви волієте?', 'Какой цвет вы предпочитаете?', 'Which colour do you prefer?']),
  w('czerwony', 'adj', 'червоний', 'красный', 'red', ['clothes', 'shopping'],
    ['Wybieram czerwoną sukienkę.', 'Обираю червону сукню.', 'Выбираю красное платье.', 'I\'m choosing the red dress.'], { f: 'czerwona', n: 'czerwone' }),
  w('czarny', 'adj', 'чорний', 'чёрный', 'black', ['clothes', 'shopping'],
    ['Czarny płaszcz pasuje do wszystkiego.', 'Чорне пальто пасує до всього.', 'Чёрное пальто подходит ко всему.', 'A black coat goes with everything.'], { f: 'czarna', n: 'czarne' }),
  w('biały', 'adj', 'білий', 'белый', 'white', ['clothes', 'shopping'],
    ['Na wesele kupuję białą koszulę.', 'На весілля купую білу сорочку.', 'На свадьбу покупаю белую рубашку.', 'I\'m buying a white shirt for the wedding.'], { f: 'biała', n: 'białe' }),

  // ── Примірочна і розмір ──
  w('rozmiar', 'noun', 'розмір', 'размер', 'size', ['clothes', 'shopping'],
    ['Jaki rozmiar pani nosi? — M.', 'Який розмір ви носите? — M.', 'Какой размер вы носите? — M.', 'What size do you wear? — M.']),
  w('przymierzalnia', 'noun', 'примірочна', 'примерочная', 'fitting room', ['clothes', 'shopping'],
    ['Przymierzalnia jest obok kasy.', 'Примірочна біля каси.', 'Примерочная рядом с кассой.', 'The fitting room is next to the till.'], { loc: 'w przymierzalni' }),
  w('przymierzyć', 'verb', 'приміряти', 'примерить', 'to try on', ['clothes', 'shopping'],
    ['Czy mogę przymierzyć tę kurtkę?', 'Чи можна приміряти цю куртку?', 'Можно примерить эту куртку?', 'Can I try on this jacket?']),
  w('za duży', 'phrase', 'завеликий', 'слишком большой', 'too big', ['clothes', 'shopping'],
    ['Ten sweter jest za duży.', 'Цей светр завеликий.', 'Этот свитер слишком большой.', 'This sweater is too big.'], { f: 'za duża', n: 'za duże' }),
  w('za mały', 'phrase', 'замалий', 'слишком маленький', 'too small', ['clothes', 'shopping'],
    ['Buty są za małe.', 'Черевики замалі.', 'Ботинки слишком маленькие.', 'The shoes are too small.'], { f: 'za mała', n: 'za małe' }),
  w('pasować', 'verb', 'пасувати, підходити (за розміром)', 'подходить (по размеру), идти', 'to fit, to suit', ['clothes', 'shopping'],
    ['Ta kurtka dobrze na pana pasuje.', 'Ця куртка вам добре пасує.', 'Эта куртка вам хорошо подходит.', 'This jacket fits you well.'], { on: 'pasuje', oni: 'pasują' }),
  w('większy', 'adj', 'більший', 'больше, побольше', 'bigger', ['clothes', 'shopping'],
    ['Poproszę większy rozmiar.', 'Дайте, будь ласка, більший розмір.', 'Дайте, пожалуйста, размер побольше.', 'A bigger size, please.']),
  w('mniejszy', 'adj', 'менший', 'меньше, поменьше', 'smaller', ['clothes', 'shopping'],
    ['Czy jest mniejszy rozmiar?', 'Чи є менший розмір?', 'Есть размер поменьше?', 'Is there a smaller size?']),
  w('wygodny', 'adj', 'зручний', 'удобный', 'comfortable', ['clothes', 'shopping'],
    ['Szukam wygodnych butów do chodzenia.', 'Шукаю зручне взуття для ходьби.', 'Ищу удобную обувь для ходьбы.', 'I\'m looking for comfortable walking shoes.'], { f: 'wygodna', n: 'wygodne' }),

  // ── Повернення, обмін, знижки ──
  w('zwrócić', 'verb', 'повернути (товар)', 'вернуть (товар)', 'to return (an item)', ['shopping'],
    ['Chcę zwrócić te spodnie.', 'Хочу повернути ці штани.', 'Хочу вернуть эти брюки.', 'I want to return these trousers.']),
  w('wymienić', 'verb', 'обміняти', 'обменять', 'to exchange', ['shopping'],
    ['Czy mogę wymienić sweter na mniejszy?', 'Чи можна обміняти светр на менший?', 'Можно обменять свитер на поменьше?', 'Can I exchange the sweater for a smaller one?']),
  w('reklamacja', 'noun', 'рекламація, скарга на брак', 'рекламация, жалоба на брак', 'complaint (about a faulty item)', ['shopping'],
    ['Składam reklamację, bo zamek jest zepsuty.', 'Подаю рекламацію, бо замок зламаний.', 'Подаю рекламацию, потому что молния сломана.', 'I\'m filing a complaint because the zip is broken.'], { acc: 'reklamację' }),
  w('wyprzedaż', 'noun', 'розпродаж', 'распродажа', 'sale', ['shopping'],
    ['Na wyprzedaży wszystko jest o połowę tańsze.', 'На розпродажі все вдвічі дешевше.', 'На распродаже всё в два раза дешевле.', 'In the sale everything is half price.'], { loc: 'na wyprzedaży' }),
  w('zepsuty', 'adj', 'зламаний, зіпсований', 'сломанный, испорченный', 'broken, faulty', ['shopping'],
    ['Zamek w kurtce jest zepsuty.', 'Блискавка на куртці зламана.', 'Молния на куртке сломана.', 'The zip on the jacket is broken.'], { f: 'zepsuta', n: 'zepsute' }),
  w('gwarancja', 'noun', 'гарантія', 'гарантия', 'warranty', ['shopping'],
    ['Buty mają dwa lata gwarancji.', 'На взуття два роки гарантії.', 'На обувь два года гарантии.', 'The shoes have a two-year warranty.']),
  w('zniżka', 'noun', 'знижка', 'скидка', 'discount', ['shopping'],
    ['Studenci mają dziesięć procent zniżki.', 'Студенти мають десять відсотків знижки.', 'У студентов скидка десять процентов.', 'Students get a ten percent discount.'], { gen: 'zniżki' }),

  // ── Ринок: вага й упаковка ──
  w('targ', 'noun', 'ринок, базар', 'рынок, базар', 'market', ['shopping', 'food'],
    ['W sobotę kupuję warzywa na targu.', 'У суботу купую овочі на ринку.', 'В субботу покупаю овощи на рынке.', 'On Saturdays I buy vegetables at the market.'], { loc: 'na targu' }),
  w('kilo', 'noun', 'кіло, кілограм (розм.)', 'кило, килограмм (разг.)', 'a kilo', ['shopping', 'numbers'],
    ['Poproszę kilo ziemniaków.', 'Кілограм картоплі, будь ласка.', 'Килограмм картошки, пожалуйста.', 'A kilo of potatoes, please.']),
  w('deko', 'noun', 'декаграм (10 г, розм.)', 'декаграмм (10 г, разг.)', 'decagram (10 g)', ['shopping', 'numbers'],
    ['Poproszę dwadzieścia deko sera.', '200 грамів сиру, будь ласка.', '200 граммов сыра, пожалуйста.', '200 grams of cheese, please.']),
  w('butelka', 'noun', 'пляшка', 'бутылка', 'bottle', ['shopping', 'food'],
    ['Poproszę butelkę wody.', 'Пляшку води, будь ласка.', 'Бутылку воды, пожалуйста.', 'A bottle of water, please.'], { acc: 'butelkę' }),
  w('puszka', 'noun', 'бляшанка', 'банка (жестяная)', 'can, tin', ['shopping', 'food'],
    ['Kupuję dwie puszki pomidorów.', 'Купую дві бляшанки помідорів.', 'Покупаю две банки помидоров.', 'I\'m buying two tins of tomatoes.'], { pl: 'puszki' }),
  w('truskawki', 'noun', 'полуниці', 'клубника', 'strawberries', ['food', 'shopping'],
    ['Truskawki są dziś bardzo słodkie.', 'Полуниці сьогодні дуже солодкі.', 'Клубника сегодня очень сладкая.', 'The strawberries are very sweet today.'], { sg: 'truskawka', gen: 'truskawek' }),
  w('śmietana', 'noun', 'сметана', 'сметана', 'sour cream', ['food', 'shopping'],
    ['Pierogi ze śmietaną, poproszę.', 'Вареники зі сметаною, будь ласка.', 'Вареники со сметаной, пожалуйста.', 'Pierogi with sour cream, please.'], { gen: 'śmietany' }),
  w('szynka', 'noun', 'шинка', 'ветчина', 'ham', ['food', 'shopping'],
    ['Poproszę piętnaście deko szynki.', '150 грамів шинки, будь ласка.', '150 граммов ветчины, пожалуйста.', '150 grams of ham, please.'], { gen: 'szynki' }),
  w('po ile?', 'phrase', 'почому?', 'почём?', 'how much (each / per kilo)?', ['shopping'],
    ['Po ile są truskawki? — Dwanaście złotych za kilo.', 'Почому полуниці? — Дванадцять злотих за кіло.', 'Почём клубника? — Двенадцать злотых за кило.', 'How much are the strawberries? — Twelve zlotys a kilo.']),

  // ── Список покупок ──
  w('potrzebować', 'verb', 'потребувати, мені треба', 'нуждаться, мне нужно', 'to need', ['shopping'],
    ['Potrzebuję mąki i cukru.', 'Мені потрібні борошно і цукор.', 'Мне нужны мука и сахар.', 'I need flour and sugar.'], { ja: 'potrzebuję', ty: 'potrzebujesz' }),
  w('dużo', 'adv', 'багато', 'много', 'a lot, much', ['shopping'],
    ['W koszyku jest dużo owoców.', 'У кошику багато фруктів.', 'В корзине много фруктов.', 'There\'s a lot of fruit in the basket.']),
  w('mało', 'adv', 'мало', 'мало', 'little, few', ['shopping'],
    ['Mamy mało czasu.', 'У нас мало часу.', 'У нас мало времени.', 'We have little time.']),
  w('zakupy', 'noun', 'покупки', 'покупки', 'shopping', ['shopping'],
    ['Robię zakupy w sobotę rano.', 'Я роблю покупки в суботу зранку.', 'Я делаю покупки в субботу утром.', 'I do the shopping on Saturday morning.'], { gen: 'zakupów' }),
  w('koszyk', 'noun', 'кошик', 'корзина', 'basket', ['shopping'],
    ['Weź koszyk, mamy dużo zakupów.', 'Візьми кошик, у нас багато покупок.', 'Возьми корзину, у нас много покупок.', 'Grab a basket, we have a lot to buy.']),
  w('lista zakupów', 'phrase', 'список покупок', 'список покупок', 'shopping list', ['shopping'],
    ['Zapomniałem listy zakupów!', 'Я забув список покупок!', 'Я забыл список покупок!', 'I forgot the shopping list!']),
  w('mąka', 'noun', 'борошно', 'мука', 'flour', ['food', 'shopping'],
    ['Do naleśników potrzebuję mąki i mleka.', 'Для млинців мені треба борошно і молоко.', 'Для блинов мне нужны мука и молоко.', 'I need flour and milk for pancakes.'], { gen: 'mąki' }),
  w('sól', 'noun', 'сіль', 'соль', 'salt', ['food', 'shopping'],
    ['Zupa potrzebuje trochę soli.', 'Супу треба трохи солі.', 'Супу нужно немного соли.', 'The soup needs a little salt.'], { gen: 'soli' }),

  // ── Ціни до тисячі, гроші ──
  w('dwieście', 'num', 'двісті', 'двести', 'two hundred', ['numbers'],
    ['Kurtka kosztuje dwieście złotych.', 'Куртка коштує двісті злотих.', 'Куртка стоит двести злотых.', 'The jacket costs two hundred zlotys.']),
  w('trzysta', 'num', 'триста', 'триста', 'three hundred', ['numbers'],
    ['Buty kosztowały trzysta złotych.', 'Черевики коштували триста злотих.', 'Ботинки стоили триста злотых.', 'The shoes cost three hundred zlotys.']),
  w('pięćset', 'num', 'п\'ятсот', 'пятьсот', 'five hundred', ['numbers'],
    ['Mam tylko banknot pięćset złotych.', 'У мене тільки купюра п\'ятсот злотих.', 'У меня только купюра пятьсот злотых.', 'I only have a five-hundred-zloty note.']),
  w('tysiąc', 'num', 'тисяча', 'тысяча', 'thousand', ['numbers'],
    ['Nowy telefon kosztuje ponad tysiąc złotych.', 'Новий телефон коштує понад тисячу злотих.', 'Новый телефон стоит больше тысячи злотых.', 'A new phone costs over a thousand zlotys.']),
  w('drobne', 'noun', 'дрібні гроші, дрібняки', 'мелочь, мелкие деньги', 'small change', ['shopping', 'numbers'],
    ['Przepraszam, nie mam drobnych.', 'Вибачте, у мене немає дрібних.', 'Извините, у меня нет мелочи.', 'Sorry, I have no small change.'], { gen: 'drobnych' }),
  w('rozmienić', 'verb', 'розміняти', 'разменять', 'to break (a note)', ['shopping', 'numbers'],
    ['Czy może pan rozmienić sto złotych?', 'Чи можете розміняти сто злотих?', 'Можете разменять сто злотых?', 'Could you break a hundred-zloty note?']),

  // ── Столик, вечеря ──
  w('zarezerwować', 'verb', 'забронювати', 'забронировать', 'to book, to reserve', ['restaurants'],
    ['Chcę zarezerwować stolik na sobotę.', 'Хочу забронювати столик на суботу.', 'Хочу забронировать столик на субботу.', 'I\'d like to book a table for Saturday.']),
  w('chciałbym', 'verb', 'я хотів би (чол.)', 'я хотел бы (муж.)', 'I would like (said by a man)', ['restaurants', 'phrases'],
    ['Chciałbym zamówić stolik dla dwóch osób.', 'Я хотів би замовити столик на двох.', 'Я хотел бы заказать столик на двоих.', 'I\'d like to book a table for two.']),
  w('chciałabym', 'verb', 'я хотіла б (жін.)', 'я хотела бы (жен.)', 'I would like (said by a woman)', ['restaurants', 'phrases'],
    ['Chciałabym zapłacić kartą.', 'Я хотіла б заплатити карткою.', 'Я хотела бы заплатить картой.', 'I\'d like to pay by card.']),
  w('osoba', 'noun', 'особа, людина', 'человек, персона', 'person', ['restaurants', 'people'],
    ['Stolik dla czterech osób, proszę.', 'Столик на чотирьох, будь ласка.', 'Столик на четверых, пожалуйста.', 'A table for four, please.'], { gen_pl: 'osób' }),
  w('kolacja', 'noun', 'вечеря', 'ужин', 'dinner, supper', ['restaurants', 'food'],
    ['Zapraszam cię na kolację.', 'Запрошую тебе на вечерю.', 'Приглашаю тебя на ужин.', 'I\'m inviting you to dinner.'], { acc: 'kolację' }),
  w('na nazwisko', 'phrase', 'на прізвище', 'на фамилию', 'under the name', ['restaurants'],
    ['Mam rezerwację na nazwisko Kowalczuk.', 'У мене бронювання на прізвище Ковальчук.', 'У меня бронь на фамилию Ковальчук.', 'I have a reservation under the name Kowalczuk.']),

  // ── Смаки ──
  w('słony', 'adj', 'солоний', 'солёный', 'salty', ['food', 'restaurants'],
    ['Ta zupa jest za słona.', 'Цей суп пересолений.', 'Этот суп пересолен.', 'This soup is too salty.'], { f: 'słona', n: 'słone' }),
  w('ostry', 'adj', 'гострий', 'острый', 'spicy, hot', ['food', 'restaurants'],
    ['Nie lubię ostrego jedzenia.', 'Я не люблю гостру їжу.', 'Я не люблю острую еду.', 'I don\'t like spicy food.'], { f: 'ostra', n: 'ostre' }),
  w('kwaśny', 'adj', 'кислий', 'кислый', 'sour', ['food', 'restaurants'],
    ['Żurek jest trochę kwaśny.', 'Журек трохи кислий.', 'Журек немного кислый.', 'Żurek is a little sour.'], { f: 'kwaśna', n: 'kwaśne' }),
  w('lody', 'noun', 'морозиво', 'мороженое', 'ice cream', ['food', 'cafe'],
    ['Na deser poproszę lody czekoladowe.', 'На десерт шоколадне морозиво, будь ласка.', 'На десерт шоколадное мороженое, пожалуйста.', 'Chocolate ice cream for dessert, please.'], { gen: 'lodów' }),
  w('danie dnia', 'phrase', 'страва дня', 'блюдо дня', 'dish of the day', ['restaurants'],
    ['Danie dnia to schabowy z ziemniakami.', 'Страва дня — відбивна з картоплею.', 'Блюдо дня — отбивная с картошкой.', 'The dish of the day is a pork cutlet with potatoes.']),

  // ── Гноми ──
  w('krasnal', 'noun', 'гном (вроцлавський)', 'гном (вроцлавский)', 'gnome (Wrocław\'s bronze gnomes)', ['city', 'travel'],
    ['We Wrocławiu jest ponad sześćset krasnali.', 'У Вроцлаві понад шістсот гномів.', 'Во Вроцлаве больше шестисот гномов.', 'There are over six hundred gnomes in Wrocław.'], { gen: 'krasnala', gen_pl: 'krasnali' }),
  w('wyspa', 'noun', 'острів', 'остров', 'island', ['city', 'travel'],
    ['Na Wyspie Słodowej siedzą studenci.', 'На острові Слодовому сидять студенти.', 'На острове Слодовом сидят студенты.', 'Students hang out on Słodowa Island.'], { loc: 'na wyspie' }),
  w('zdjęcie', 'noun', 'фото, світлина', 'фото, снимок', 'photo', ['city', 'travel'],
    ['Zrób mi zdjęcie z krasnalem!', 'Сфотографуй мене з гномом!', 'Сфотографируй меня с гномом!', 'Take a photo of me with the gnome!'], { pl: 'zdjęcia' }),
  w('znaleźć', 'verb', 'знайти', 'найти', 'to find', ['city', 'phrases'],
    ['Nie mogę znaleźć tego krasnala.', 'Не можу знайти цього гнома.', 'Не могу найти этого гнома.', 'I can\'t find this gnome.'], { ja: 'znajdę', past_m: 'znalazłem', past_f: 'znalazłam' }),
  w('ładny', 'adj', 'гарний, гарненький', 'красивый, симпатичный', 'pretty, nice', ['city', 'clothes'],
    ['Jaki ładny krasnal!', 'Який гарненький гном!', 'Какой симпатичный гном!', 'What a pretty gnome!'], { f: 'ładna', n: 'ładne' }),

  // ── Подарунок ──
  w('prezent', 'noun', 'подарунок', 'подарок', 'present, gift', ['shopping'],
    ['Szukam prezentu dla mamy.', 'Шукаю подарунок для мами.', 'Ищу подарок для мамы.', 'I\'m looking for a present for my mum.'], { gen: 'prezentu' }),
  w('podobać się', 'verb', 'подобатися', 'нравиться', 'to like (something seen)', ['shopping', 'phrases'],
    ['Ta torebka bardzo mi się podoba.', 'Ця сумочка мені дуже подобається.', 'Эта сумочка мне очень нравится.', 'I really like this handbag.'], { on: 'podoba się', oni: 'podobają się' }),
  w('zapakować', 'verb', 'запакувати', 'упаковать', 'to wrap (up)', ['shopping'],
    ['Czy może pani zapakować to na prezent?', 'Чи можете запакувати це як подарунок?', 'Можете упаковать это как подарок?', 'Could you gift-wrap it?']),

  // ── Порівняння ──
  w('tańszy', 'adj', 'дешевший', 'дешевле, более дешёвый', 'cheaper', ['shopping'],
    ['Ten sweter jest tańszy niż tamten.', 'Цей светр дешевший, ніж той.', 'Этот свитер дешевле, чем тот.', 'This sweater is cheaper than that one.'], { f: 'tańsza', n: 'tańsze' }),
  w('droższy', 'adj', 'дорожчий', 'дороже, более дорогой', 'more expensive', ['shopping'],
    ['Skórzana kurtka jest droższa.', 'Шкіряна куртка дорожча.', 'Кожаная куртка дороже.', 'The leather jacket is more expensive.'], { f: 'droższa', n: 'droższe' }),
  w('lepszy', 'adj', 'кращий', 'лучше, лучший', 'better', ['shopping'],
    ['Ta kawa jest lepsza niż w Żabce.', 'Ця кава краща, ніж у Żabce.', 'Этот кофе лучше, чем в Żabka.', 'This coffee is better than at Żabka.'], { f: 'lepsza', n: 'lepsze' }),
  w('najlepszy', 'adj', 'найкращий', 'самый лучший', 'the best', ['shopping'],
    ['To najlepsze pierogi we Wrocławiu!', 'Це найкращі вареники у Вроцлаві!', 'Это лучшие вареники во Вроцлаве!', 'These are the best pierogi in Wrocław!'], { f: 'najlepsza', n: 'najlepsze' }),
  w('modny', 'adj', 'модний', 'модный', 'fashionable', ['clothes', 'shopping'],
    ['W tym roku modny jest kolor zielony.', 'Цього року модний зелений колір.', 'В этом году модный зелёный цвет.', 'Green is in fashion this year.'], { f: 'modna', n: 'modne' }),
  w('wybrać', 'verb', 'обрати, вибрати', 'выбрать', 'to choose', ['shopping'],
    ['Nie mogę wybrać: czerwona czy czarna?', 'Не можу обрати: червона чи чорна?', 'Не могу выбрать: красная или чёрная?', 'I can\'t choose: the red one or the black one?'], { ja: 'wybiorę' }),
];
