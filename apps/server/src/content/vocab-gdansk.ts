/**
 * Словник Гданська (A2): потяг і запізнення (opóźnienie, odjeżdżać), готель (nocleg, doba, jednoosobowy), що варто
 * побачити (warto, polecić, widok), пляж (plaża, molo, ratownik), загублені речі (plecak, skórzany), летовище (lot,
 * opóźniony, odwołany), історія й роки (historia, wolność, strajk), Тримісто (kolejka, Trójmiasto).
 * Слова opóźnienie, hotel, pokój, rezerwacja, zarezerwować, recepcja, walizka, bagaż, zgubić, morze, pociąg, peron, lotnisko,
 * paszport, zwiedzać, przewodnik, muzeum, zabytek, noc, rok, pomnik, stocznia, portfel, torba, biuro rzeczy znalezionych
 * уже є в словнику.
 */
import { w } from './vocab-city';
import type { VocabSeed } from './vocab';

export const GDANSK_VOCAB: VocabSeed[] = [
  // ── Потяг ──
  w('wagon', 'noun', 'A2', 'вагон', 'вагон', 'carriage', ['transport', 'travel'],
    ['Mam miejsce w wagonie numer siedem.', 'У мене місце у вагоні номер сім.', 'У меня место в вагоне номер семь.', 'My seat is in carriage seven.'], { loc: 'wagonie' }),
  w('miejscówka', 'noun', 'B1', 'місце з резервацією (у потязі)', 'место с резервацией (в поезде)', 'seat reservation', ['transport', 'travel'],
    ['W Intercity bilet ma miejscówkę.', 'В Intercity квиток має закріплене місце.', 'В Intercity у билета есть резервация места.', 'An Intercity ticket includes a seat reservation.']),
  w('odjeżdżać', 'verb', 'A2', 'відправлятися, від’їжджати', 'отправляться, уезжать', 'to depart', ['transport', 'travel'],
    ['Pociąg odjeżdża z peronu trzeciego.', 'Потяг відправляється з третьої платформи.', 'Поезд отправляется с третьей платформы.', 'The train departs from platform three.'], { ono: 'odjeżdża' }),
  w('przyjeżdżać', 'verb', 'A2', 'прибувати, приїжджати', 'прибывать, приезжать', 'to arrive', ['transport', 'travel'],
    ['Pociąg przyjeżdża do Gdańska o piętnastej.', 'Потяг прибуває до Гданська о п’ятнадцятій.', 'Поезд прибывает в Гданьск в пятнадцать.', 'The train arrives in Gdańsk at three pm.'], { ono: 'przyjeżdża' }),

  // ── Готель ──
  w('nocleg', 'noun', 'A2', 'нічліг, житло на ніч', 'ночлег', 'accommodation (for the night)', ['travel'],
    ['Szukamy noclegu nad morzem.', 'Шукаємо житло біля моря.', 'Ищем жильё у моря.', 'We’re looking for a place to stay by the sea.'], { gen: 'noclegu' }),
  w('doba', 'noun', 'B1', 'доба (у готелі — ніч)', 'сутки (в отеле — ночь)', 'day (24 h); a night at a hotel', ['travel', 'time'],
    ['Pokój kosztuje trzysta złotych za dobę.', 'Номер коштує триста злотих за добу.', 'Номер стоит триста злотых в сутки.', 'The room costs three hundred złoty a night.']),
  w('jednoosobowy', 'adj', 'A2', 'одномісний', 'одноместный', 'single (room)', ['travel'],
    ['Poproszę pokój jednoosobowy.', 'Мені одномісний номер, будь ласка.', 'Мне одноместный номер, пожалуйста.', 'A single room, please.']),

  // ── Що побачити ──
  w('warto', 'adv', 'A2', 'варто', 'стоит, имеет смысл', 'it’s worth', ['travel', 'phrases'],
    ['Warto zobaczyć Długi Targ wieczorem.', 'Варто побачити Довгий Торг увечері.', 'Стоит увидеть Длинный рынок вечером.', 'Długi Targ is worth seeing in the evening.']),
  w('polecić', 'verb', 'A2', 'порадити, рекомендувати', 'посоветовать, порекомендовать', 'to recommend', ['travel', 'phrases'],
    ['Co pan poleca na pierwszy dzień?', 'Що ви порадите на перший день?', 'Что вы посоветуете на первый день?', 'What do you recommend for the first day?'], { on: 'poleca' }),
  w('widok', 'noun', 'A2', 'вид, краєвид', 'вид', 'view', ['travel', 'nature'],
    ['Z wieży jest piękny widok na miasto.', 'З вежі гарний вид на місто.', 'С башни красивый вид на город.', 'There’s a beautiful view of the town from the tower.'], { gen: 'widoku' }),
  w('fontanna', 'noun', 'A2', 'фонтан', 'фонтан', 'fountain', ['city', 'travel'],
    ['Spotkajmy się przy fontannie Neptuna.', 'Зустріньмося біля фонтана Нептуна.', 'Встретимся у фонтана Нептуна.', 'Let’s meet by the Neptune Fountain.'], { loc: 'fontannie' }),

  // ── Пляж ──
  w('plaża', 'noun', 'A1', 'пляж', 'пляж', 'beach', ['travel', 'nature'],
    ['Idziemy na plażę po śniadaniu.', 'Після сніданку йдемо на пляж.', 'После завтрака идём на пляж.', 'We’re going to the beach after breakfast.'], { acc: 'plażę', loc: 'plaży' }),
  w('molo', 'noun', 'B1', 'мол, пірс', 'мол, пирс', 'pier', ['travel'],
    ['Molo w Sopocie to najdłuższe drewniane molo w Europie.', 'Мол у Сопоті — найдовший дерев’яний мол у Європі.', 'Мол в Сопоте — самый длинный деревянный мол в Европе.', 'Sopot pier is the longest wooden pier in Europe.']),
  w('opalać się', 'verb', 'A2', 'засмагати', 'загорать', 'to sunbathe', ['travel'],
    ['Nie opalaj się w południe!', 'Не засмагай опівдні!', 'Не загорай в полдень!', 'Don’t sunbathe at noon!']),
  w('kąpać się', 'verb', 'A2', 'купатися', 'купаться', 'to swim, to bathe', ['travel'],
    ['Przy czerwonej fladze nie wolno się kąpać.', 'При червоному прапорі купатися не можна.', 'При красном флаге купаться нельзя.', 'You can’t swim when the red flag is up.'], { ja: 'kąpię się' }),
  w('ratownik', 'noun', 'A2', 'рятувальник', 'спасатель', 'lifeguard', ['travel', 'people'],
    ['Kąpiemy się tylko tam, gdzie jest ratownik.', 'Купаємося лише там, де є рятувальник.', 'Купаемся только там, где есть спасатель.', 'We only swim where there’s a lifeguard.']),
  w('flaga', 'noun', 'A2', 'прапор', 'флаг', 'flag', ['travel'],
    ['Biała flaga — można się kąpać.', 'Білий прапор — можна купатися.', 'Белый флаг — можно купаться.', 'White flag — swimming allowed.'], { loc: 'fladze' }),

  // ── Загублені речі ──
  w('plecak', 'noun', 'A1', 'рюкзак', 'рюкзак', 'backpack', ['travel'],
    ['Zgubiłem czarny plecak w tramwaju.', 'Я загубив чорний рюкзак у трамваї.', 'Я потерял чёрный рюкзак в трамвае.', 'I lost a black backpack on the tram.']),
  w('skórzany', 'adj', 'B1', 'шкіряний', 'кожаный', 'leather', ['clothes'],
    ['Szukam brązowego skórzanego portfela.', 'Я шукаю коричневий шкіряний гаманець.', 'Я ищу коричневый кожаный кошелёк.', 'I’m looking for a brown leather wallet.'], { f: 'skórzana' }),
  w('telefon', 'noun', 'A1', 'телефон', 'телефон', 'phone', ['phrases'],
    ['Chyba zostawiłem telefon w pociągu.', 'Здається, я залишив телефон у потязі.', 'Кажется, я оставил телефон в поезде.', 'I think I left my phone on the train.']),

  // ── Летовище ──
  w('lot', 'noun', 'A2', 'рейс, політ', 'рейс, полёт', 'flight', ['travel'],
    ['Mój lot do Londynu jest o siódmej.', 'Мій рейс до Лондона о сьомій.', 'Мой рейс в Лондон в семь.', 'My flight to London is at seven.']),
  w('opóźniony', 'adj', 'A2', 'затриманий, із запізненням', 'задержанный, с опозданием', 'delayed', ['travel', 'transport'],
    ['Lot jest opóźniony o godzinę.', 'Рейс затримується на годину.', 'Рейс задерживается на час.', 'The flight is delayed by an hour.'], { f: 'opóźniona' }),
  w('odwołany', 'adj', 'B1', 'скасований', 'отменённый', 'cancelled', ['travel', 'transport'],
    ['Pociąg do Helu jest odwołany.', 'Потяг до Гелю скасовано.', 'Поезд на Хель отменён.', 'The train to Hel is cancelled.'], { f: 'odwołana' }),
  w('bramka', 'noun', 'B1', 'вихід на посадку (gate)', 'выход на посадку', 'gate (airport)', ['travel'],
    ['Boarding jest przy bramce numer dwa.', 'Посадка — біля виходу номер два.', 'Посадка — у выхода номер два.', 'Boarding is at gate two.'], { loc: 'bramce' }),
  w('bagaż podręczny', 'noun', 'A2', 'ручна поклажа', 'ручная кладь', 'hand luggage', ['travel'],
    ['Bagaż podręczny zwykle może ważyć osiem kilogramów.', 'Ручна поклажа зазвичай може важити вісім кілограмів.', 'Ручная кладь обычно может весить восемь килограммов.', 'Hand luggage can usually weigh eight kilos.']),

  // ── Історія ──
  w('historia', 'noun', 'A2', 'історія', 'история', 'history; story', ['city'],
    ['Gdańsk ma bardzo ciekawą historię.', 'Гданськ має дуже цікаву історію.', 'У Гданьска очень интересная история.', 'Gdańsk has a very interesting history.'], { acc: 'historię' }),
  w('wojna', 'noun', 'A2', 'війна', 'война', 'war', ['city'],
    ['Westerplatte to symbol początku drugiej wojny światowej.', 'Вестерплятте — символ початку Другої світової війни.', 'Вестерплатте — символ начала Второй мировой войны.', 'Westerplatte is a symbol of the start of the Second World War.']),
  w('strajk', 'noun', 'B1', 'страйк', 'забастовка', 'strike', ['city', 'work'],
    ['W 1980 roku w stoczni był wielki strajk.', 'У 1980 році на верфі був великий страйк.', 'В 1980 году на верфи была большая забастовка.', 'In 1980 there was a big strike at the shipyard.']),
  w('wolność', 'noun', 'B1', 'свобода', 'свобода', 'freedom', ['city'],
    ['Solidarność walczyła o wolność.', '«Солідарність» боролася за свободу.', '«Солидарность» боролась за свободу.', 'Solidarity fought for freedom.']),

  // ── Тримісто ──
  w('Trójmiasto', 'noun', 'B1', 'Тримісто (Гданськ, Сопот, Гдиня)', 'Труймясто (Гданьск, Сопот, Гдыня)', 'Tricity (Gdańsk, Sopot, Gdynia)', ['city', 'travel'],
    ['Trójmiasto to Gdańsk, Sopot i Gdynia.', 'Тримісто — це Гданськ, Сопот і Гдиня.', 'Труймясто — это Гданьск, Сопот и Гдыня.', 'The Tricity is Gdańsk, Sopot and Gdynia.']),
  w('kolejka', 'noun', 'A2', 'електричка; черга', 'электричка; очередь', 'commuter train; queue', ['transport'],
    ['Do Sopotu jedzie się kolejką SKM.', 'До Сопота їдуть електричкою SKM.', 'В Сопот едут на электричке SKM.', 'You take the SKM train to Sopot.']),
];
