/**
 * Словник локацій Кракова: вокзал, Żabka, Ринок, ресторан, трамвай, готель, університет, Вавель.
 * Слова з'являються в уроках відповідних локацій і потрапляють у SRS-повторення.
 */
import { t } from './builders';
import type { VocabSeed } from './vocab';

const w = (pl: string, pos: string, uk: string, ru: string, en: string, pron: string, topics: string[], cefr: VocabSeed['cefr'] = 'A1', forms?: Record<string, string>): VocabSeed => ({
  pl, pos, tr: t(uk, ru, en), pron, cefr, topics, forms,
});

export const KRAKOW_VOCAB: VocabSeed[] = [
  // ── Dworzec Główny ──
  w('nazywam się', 'phrase', 'мене звати', 'меня зовут', 'my name is', 'називам щє', ['greetings', 'station'], 'A0'),
  w('jak się masz', 'phrase', 'як справи (до «ти»)', 'как дела (на «ты»)', 'how are you', 'як щє маш', ['greetings', 'station'], 'A0'),
  w('jestem z', 'phrase', 'я з…', 'я из…', 'I am from…', 'єстем з', ['greetings', 'station'], 'A0'),
  w('proszę bardzo', 'phrase', 'будь ласка (коли щось даєш)', 'пожалуйста (когда что-то даёшь)', 'here you are', 'прошє бардзо', ['greetings', 'station'], 'A0'),
  w('wyjście', 'noun', 'вихід', 'выход', 'exit', 'выйшьчє', ['station'], 'A0'),
  w('wejście', 'noun', 'вхід', 'вход', 'entrance', 'вейшьчє', ['station'], 'A0'),
  w('toaleta', 'noun', 'туалет', 'туалет', 'toilet', 'тоалета', ['station'], 'A0'),
  w('informacja', 'noun', 'довідкове бюро; інформація', 'справочное бюро; информация', 'information desk', 'інформацья', ['station'], 'A0'),
  w('kasa', 'noun', 'каса', 'касса', 'ticket office; till', 'каса', ['station', 'shopping'], 'A0'),
  w('bagaż', 'noun', 'багаж', 'багаж', 'luggage', 'баґаж', ['station', 'travel'], 'A1'),
  w('walizka', 'noun', 'валіза', 'чемодан', 'suitcase', 'валізка', ['station', 'travel'], 'A1'),
  w('gdzie jest', 'phrase', 'де знаходиться…', 'где находится…', 'where is…', 'ґдже єст', ['station', 'directions'], 'A0'),
  w('bilet powrotny', 'phrase', 'квиток туди й назад', 'билет туда и обратно', 'return ticket', 'білет повротни', ['station', 'tickets'], 'A1'),
  w('ile kosztuje', 'phrase', 'скільки коштує', 'сколько стоит', 'how much is', 'іле коштує', ['station', 'shopping', 'tickets'], 'A1'),
  w('odjazd', 'noun', 'відправлення', 'отправление', 'departure', 'одьязд', ['station', 'trains'], 'A1', { gen: 'odjazdu' }),
  w('przyjazd', 'noun', 'прибуття', 'прибытие', 'arrival', 'пшиязд', ['station', 'trains'], 'A1', { gen: 'przyjazdu' }),
  w('opóźnienie', 'noun', 'затримка (запізнення потяга)', 'задержка (опоздание поезда)', 'delay', 'опужньєнє', ['station', 'trains'], 'A1', { gen: 'opóźnienia' }),
  w('rozkład jazdy', 'phrase', 'розклад руху', 'расписание движения', 'timetable', 'розкляд язди', ['station', 'trains'], 'A1'),
  w('przesiadka', 'noun', 'пересадка', 'пересадка', 'change (of train)', 'пшесядка', ['station', 'trains'], 'A1'),
  w('na którym peronie', 'phrase', 'на якій платформі', 'на какой платформе', 'on which platform', 'на которим пероньє', ['station', 'trains'], 'A1'),
  // ── Żabka ──
  w('kanapka', 'noun', 'канапка, сендвіч', 'бутерброд, сэндвич', 'sandwich', 'канапка', ['shop', 'food'], 'A0', { acc: 'kanapkę' }),
  w('drożdżówka', 'noun', 'солодка дріжджова булочка', 'сладкая дрожжевая булочка', 'sweet bun', 'дрожджувка', ['shop', 'food'], 'A1', { acc: 'drożdżówkę' }),
  w('jajka', 'noun', 'яйця', 'яйца', 'eggs', 'яйка', ['shop', 'food'], 'A0', { sg: 'jajko' }),
  w('jogurt', 'noun', 'йогурт', 'йогурт', 'yoghurt', 'йоґурт', ['shop', 'food'], 'A0'),
  w('czekolada', 'noun', 'шоколад', 'шоколад', 'chocolate', 'чеколяда', ['shop', 'food'], 'A0', { acc: 'czekoladę' }),
  w('cena', 'noun', 'ціна', 'цена', 'price', 'цена', ['shop'], 'A1'),
  w('promocja', 'noun', 'акція, знижка', 'акция, скидка', 'special offer', 'промоцья', ['shop'], 'A1'),
  w('ile płacę', 'phrase', 'скільки з мене', 'сколько с меня', 'how much do I pay', 'іле плаце', ['shop'], 'A1'),
  w('coś jeszcze', 'phrase', 'щось іще?', 'что-нибудь ещё?', 'anything else?', 'цощь єще', ['shop'], 'A1'),
  w('reklamówka', 'noun', 'пакет (поліетиленовий)', 'пакет (пластиковый)', 'plastic bag', 'рекламувка', ['shop'], 'A1'),
  w('reszta', 'noun', 'решта (здача)', 'сдача', 'change (money)', 'решта', ['shop'], 'A1'),
  w('kartą', 'phrase', 'карткою', 'картой', 'by card', 'картон', ['shop'], 'A1'),
  w('gotówką', 'phrase', 'готівкою', 'наличными', 'in cash', 'ґотувкон', ['shop'], 'A1'),
  w('sos czosnkowy', 'phrase', 'часниковий соус', 'чесночный соус', 'garlic sauce', 'сос чосновий', ['shop', 'food'], 'A1', { ins: 'sosem czosnkowym' }),
  w('ketchup', 'noun', 'кетчуп', 'кетчуп', 'ketchup', 'кетчуп', ['shop', 'food'], 'A0', { ins: 'ketchupem' }),
  w('musztarda', 'noun', 'гірчиця', 'горчица', 'mustard', 'муштарда', ['shop', 'food'], 'A1', { ins: 'musztardą' }),
  w('cebula', 'noun', 'цибуля', 'лук', 'onion', 'цебуля', ['shop', 'food'], 'A1', { gen: 'cebuli' }),
  w('podgrzać', 'verb', 'підігріти', 'подогреть', 'to heat up', 'подґжаць', ['shop', 'food'], 'A1'),
];
