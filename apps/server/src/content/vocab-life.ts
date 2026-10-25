/**
 * Словник для місій «Польська в житті»: страви, магазини, дорога, транспорт, посилки.
 * Слова потрапляють у словник користувача після місії і далі повторюються за інтервалами.
 */
import { t } from './builders';
import type { VocabSeed } from './vocab';

const w = (pl: string, pos: string, uk: string, ru: string, en: string, pron: string, topics: string[], forms?: Record<string, string>): VocabSeed => ({
  pl, pos, tr: t(uk, ru, en), pron, cefr: 'A1', topics, forms,
});

export const LIFE_VOCAB: VocabSeed[] = [
  // ── Urząd: номерок, віконце, заява ──
  w('numerek', 'noun', 'номерок (у черзі)', 'номерок (в очереди)', 'queue ticket', 'нумерек', ['urzad']),
  w('stanowisko', 'noun', 'віконце, робоче місце', 'окошко, рабочее место', 'desk, counter', 'становіско', ['urzad']),
  w('data urodzenia', 'phrase', 'дата народження', 'дата рождения', 'date of birth', 'дата уродзеня', ['urzad', 'documents']),
  w('potwierdzenie', 'noun', 'підтвердження', 'подтверждение', 'confirmation', 'потф\'єрдзенє', ['urzad', 'documents']),

  // ── Польські страви ──
  w('żurek', 'noun', 'журек (кислий суп на житній заквасці)', 'журек (кислый суп на ржаной закваске)', 'żurek (sour rye soup)', 'журек', ['dishes', 'food']),
  w('bigos', 'noun', 'біґос (тушкована капуста з м\'ясом)', 'бигос (тушёная капуста с мясом)', 'bigos (hunter\'s stew)', 'біґос', ['dishes', 'food'], { gen: 'bigosu' }),
  w('parówki', 'noun', 'сосиски (паровки)', 'сосиски', 'frankfurters', 'парувкі', ['dishes', 'shopping'], { sg: 'parówka' }),
  w('placki ziemniaczane', 'noun', 'картопляні оладки (деруни)', 'картофельные оладьи (драники)', 'potato pancakes', 'плацкі жємнячане', ['dishes', 'food']),
  w('zapiekanka', 'noun', 'запіканка (запечений багет)', 'запеканка (запечённый багет)', 'zapiekanka (toasted baguette)', 'зап\'єканка', ['dishes', 'food'], { acc: 'zapiekankę' }),
  w('pączek', 'noun', 'пончик', 'пончик', 'doughnut', 'пончек', ['dishes', 'food'], { pl: 'pączki' }),
  w('sernik', 'noun', 'сирник (польський чізкейк)', 'польский чизкейк', 'cheesecake', 'сернік', ['dishes', 'food'], { gen: 'sernika' }),
  w('kompot', 'noun', 'компот', 'компот', 'fruit drink (kompot)', 'компот', ['food']),

  // ── Pierogi та кафе ──
  w('menu', 'noun', 'меню', 'меню', 'menu', 'мену', ['restaurants', 'pierogi']),
  w('ruskie', 'adj', 'руські (pierogi з картоплею і сиром)', 'русские (pierogi с картошкой и творогом)', 'ruskie (potato & cheese pierogi)', 'рускє', ['pierogi', 'food']),
  w('z mięsem', 'phrase', 'з м\'ясом', 'с мясом', 'with meat', 'з м\'єнсем', ['pierogi', 'food']),
  w('z kapustą i grzybami', 'phrase', 'з капустою і грибами', 'с капустой и грибами', 'with cabbage and mushrooms', 'з капустон і ґжибамі', ['pierogi', 'food']),
  w('bez mięsa', 'phrase', 'без м\'яса', 'без мяса', 'without meat', 'без м\'єнса', ['pierogi', 'food']),
  w('gotowane', 'adj', 'варені', 'варёные', 'boiled', 'ґотоване', ['pierogi', 'food']),
  w('smażone', 'adj', 'смажені', 'жареные', 'fried', 'смажоне', ['pierogi', 'food']),
  w('porcja', 'noun', 'порція', 'порция', 'portion', 'порцья', ['pierogi', 'restaurants'], { acc: 'porcję' }),
  w('ze śmietaną', 'phrase', 'зі сметаною', 'со сметаной', 'with sour cream', 'зе сьм\'єтанон', ['food', 'pierogi']),
  w('uczulony', 'adj', 'алергічний (маю алергію)', 'с аллергией', 'allergic', 'учулони', ['restaurants', 'medicine'], { f: 'uczulona' }),
  w('orzechy', 'noun', 'горіхи', 'орехи', 'nuts', 'ожехи', ['food']),

  // ── Магазин ──
  w('hot dog', 'noun', 'хот-дог', 'хот-дог', 'hot dog', 'хот доґ', ['shopping', 'food'], { acc: 'hot doga' }),
  w('sos', 'noun', 'соус', 'соус', 'sauce', 'сос', ['food'], { ins: 'sosem', gen: 'sosu' }),
  w('gazowana', 'adj', 'газована', 'газированная', 'sparkling', 'ґазована', ['shopping', 'food']),
  w('niegazowana', 'adj', 'негазована', 'негазированная', 'still', 'нєґазована', ['shopping', 'food']),
  w('razem', 'adv', 'разом (загалом)', 'вместе, итого', 'together, in total', 'разем', ['shopping', 'phrases']),
  w('to wszystko', 'phrase', 'це все', 'это всё', 'that\'s all', 'то вшистко', ['shopping', 'phrases']),
  w('lodówka', 'noun', 'холодильник', 'холодильник', 'fridge', 'лодувка', ['shopping', 'home'], { loc: 'lodówce' }),
  w('obok', 'prep', 'поруч, біля', 'рядом, возле', 'next to', 'обок', ['shopping', 'city']),
  w('pomidor', 'noun', 'помідор', 'помидор', 'tomato', 'помідор', ['food', 'shopping'], { pl: 'pomidory' }),
  w('kilogram', 'noun', 'кілограм', 'килограмм', 'kilogram', 'кілоґрам', ['shopping', 'numbers']),
  w('masło', 'noun', 'масло (вершкове)', 'сливочное масло', 'butter', 'масво', ['food', 'shopping']),
  w('jajko', 'noun', 'яйце', 'яйцо', 'egg', 'яйко', ['food', 'shopping'], { pl: 'jajka', gen_pl: 'jajek' }),
  w('ryż', 'noun', 'рис', 'рис', 'rice', 'риж', ['food', 'shopping']),
  w('nabiał', 'noun', 'молочні продукти', 'молочные продукты', 'dairy', 'набяв', ['shopping']),
  w('płyn do naczyń', 'noun', 'засіб для миття посуду', 'средство для мытья посуды', 'washing-up liquid', 'пвин до начинь', ['shopping', 'home']),
  w('alejka', 'noun', 'прохід (між полицями)', 'проход (между полками)', 'aisle', 'алейка', ['shopping'], { loc: 'alejce' }),
  w('kasa samoobsługowa', 'noun', 'каса самообслуговування', 'касса самообслуживания', 'self-checkout', 'каса самообсвуґова', ['shopping']),
  w('pasta do zębów', 'noun', 'зубна паста', 'зубная паста', 'toothpaste', 'паста до зембув', ['shopping']),
  w('szampon', 'noun', 'шампунь', 'шампунь', 'shampoo', 'шампон', ['shopping']),
  w('mydło', 'noun', 'мило', 'мыло', 'soap', 'мидво', ['shopping', 'home']),
  w('kawałek', 'noun', 'шматок', 'кусок', 'piece', 'кававек', ['food', 'shopping'], { gen: 'kawałka' }),
  w('pieczarki', 'noun', 'печериці (шампіньйони)', 'шампиньоны', 'button mushrooms', 'п\'єчаркі', ['food'], { ins: 'pieczarkami' }),
  w('keczup', 'noun', 'кетчуп', 'кетчуп', 'ketchup', 'кечуп', ['food'], { gen: 'keczupu', ins: 'keczupem' }),
  w('czekać', 'verb', 'чекати', 'ждать', 'to wait', 'чекачь', ['phrases'], { ja: 'czekam', ty: 'czekasz', 'on/ona': 'czeka' }),
  w('okienko', 'noun', 'віконце (видачі)', 'окошко (выдачи)', 'counter window', 'окєнко', ['restaurants', 'urzad']),

  // ── Дорога і заправка ──
  w('dystrybutor', 'noun', 'паливна колонка', 'топливная колонка', 'fuel pump', 'дистрибутор', ['road']),
  w('benzyna', 'noun', 'бензин', 'бензин', 'petrol', 'бензина', ['road']),
  w('faktura', 'noun', 'рахунок-фактура', 'счёт-фактура', 'VAT invoice', 'фактура', ['road', 'work'], { acc: 'fakturę' }),
  w('zbliżeniowo', 'adv', 'безконтактно', 'бесконтактно', 'contactless', 'збліжєньово', ['shopping', 'bank']),
  w('szerokiej drogi', 'phrase', 'щасливої дороги', 'счастливого пути', 'have a safe trip', 'шерокєй дроґі', ['road', 'phrases']),
  w('dojechać', 'verb', 'доїхати', 'доехать', 'to get to (by vehicle)', 'доєхачь', ['road', 'transport']),
  w('autostrada', 'noun', 'автострада', 'автомагистраль', 'motorway', 'аутострада', ['road'], { acc: 'autostradę' }),
  w('potem', 'adv', 'потім', 'потом', 'then, later', 'потем', ['phrases', 'city']),

  // ── Посилки ──
  w('paczka', 'noun', 'посилка', 'посылка', 'parcel', 'пачка', ['parcel'], { acc: 'paczkę' }),
  w('paczkomat', 'noun', 'поштомат (Paczkomat)', 'постамат (Paczkomat)', 'parcel locker', 'пачкомат', ['parcel'], { loc: 'Paczkomacie' }),
  w('kod odbioru', 'phrase', 'код отримання', 'код получения', 'pickup code', 'код одбьору', ['parcel']),
  w('skrytka', 'noun', 'скринька, комірка', 'ячейка', 'locker compartment', 'скритка', ['parcel']),
  w('odebrać', 'verb', 'забрати, отримати', 'забрать, получить', 'to collect', 'одебрачь', ['parcel'], { past_m: 'odebrałem', past_f: 'odebrałam' }),
  w('ciężki', 'adj', 'важкий', 'тяжёлый', 'heavy', 'чєнжкі', ['parcel'], { f: 'ciężka' }),

  // ── Міський транспорт і поїзд ──
  w('normalny', 'adj', 'звичайний (повний квиток)', 'обычный (полный билет)', 'full-fare', 'нормальни', ['transport']),
  w('ulgowy', 'adj', 'пільговий', 'льготный', 'reduced-fare', 'ульґови', ['transport']),
  w('jednorazowy', 'adj', 'разовий', 'разовый', 'single (ticket)', 'єдноразови', ['transport']),
  w('skasować', 'verb', 'прокомпостувати', 'прокомпостировать', 'to validate (a ticket)', 'скасовачь', ['transport']),
  w('następny przystanek', 'phrase', 'наступна зупинка', 'следующая остановка', 'next stop', 'настемпни пшистанек', ['transport']),
  w('wysiadać', 'verb', 'виходити (з транспорту)', 'выходить (из транспорта)', 'to get off', 'висядачь', ['transport'], { ja: 'wysiadam' }),
  w('przesiąść się', 'verb', 'пересісти', 'пересесть', 'to change (lines)', 'пшесьйонсьчь сє', ['transport']),
  w('w jedną stronę', 'phrase', 'в один бік', 'в одну сторону', 'one-way', 'в єдном строне', ['transport', 'travel']),
  w('tam i z powrotem', 'phrase', 'туди й назад', 'туда и обратно', 'return (there and back)', 'там і з повротем', ['transport', 'travel']),
  w('przy oknie', 'phrase', 'біля вікна', 'у окна', 'by the window', 'пши окнє', ['transport', 'travel']),
  w('tor', 'noun', 'колія', 'путь (на вокзале)', 'track', 'тор', ['transport', 'travel']),
];

/** Вирази теми pierogi (досягнення «Pierogowy ekspert»). */
export const PIEROGI_PHRASES = ['pierogi', 'ruskie', 'z mięsem', 'z kapustą i grzybami', 'bez mięsa', 'gotowane', 'smażone', 'menu', 'porcja', 'rachunek', 'na miejscu', 'żurek'];

/** Вісім польських страв (досягнення «Łowca smaków»): тег кроку місії → назва. */
export const DISHES = ['pierogi', 'zurek', 'parowki', 'bigos', 'placki', 'zapiekanka', 'paczki', 'sernik'] as const;
