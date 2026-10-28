/**
 * Польсько-український словник (з російськими та англійськими перекладами).
 * pron — наближена транскрипція кирилицею для україномовних користувачів.
 */
import type { Cefr, I18n } from '@polski-go/shared';
import { t } from './builders';
import { LIFE_VOCAB } from './vocab-life';
import { EDU_VOCAB } from './vocab-education';
import { KRAKOW_VOCAB } from './vocab-krakow';
import { WARSZAWA_VOCAB } from './vocab-warszawa';
import { KATOWICE_VOCAB } from './vocab-katowice';
import { OPOLE_VOCAB } from './vocab-opole';
import { POZNAN_VOCAB } from './vocab-poznan';
import { LODZ_VOCAB } from './vocab-lodz';
import { WROCLAW_VOCAB } from './vocab-wroclaw';

export type VocabSeed = {
  pl: string;
  pos: string;
  tr: I18n;
  pron: string;
  cefr: Cefr;
  topics: string[];
  emoji?: string;
  forms?: Record<string, string>;
  examples?: { pl: string; tr: I18n }[];
};

const v = (
  pl: string,
  pos: string,
  tr: I18n,
  pron: string,
  cefr: Cefr,
  topics: string[],
  emoji?: string,
  examples?: { pl: string; tr: I18n }[],
  forms?: Record<string, string>,
): VocabSeed => ({ pl, pos, tr, pron, cefr, topics, emoji, examples, forms });

const ex = (pl: string, tr: I18n) => ({ pl, tr });

export { TOPICS } from './topics';

const BYC = { ja: 'jestem', ty: 'jesteś', 'on/ona': 'jest', my: 'jesteśmy', wy: 'jesteście', oni: 'są' };
const MIEC = { ja: 'mam', ty: 'masz', 'on/ona': 'ma', my: 'mamy', wy: 'macie', oni: 'mają' };

export const VOCAB: VocabSeed[] = [
  // ── Привітання ──
  v('cześć', 'interj', t('привіт; бувай', 'привет; пока', 'hi; bye'), 'чешьчь', 'A0', ['greetings'], '👋', [
    ex('Cześć, Ania!', t('Привіт, Аню!', 'Привет, Аня!', 'Hi, Ania!')),
  ]),
  v('dzień dobry', 'phrase', t('добрий день; доброго ранку', 'добрый день; доброе утро', 'good morning; good afternoon'), 'джєнь добри', 'A0', ['greetings'], '☀️', [
    ex('Dzień dobry, pani Kasiu!', t('Добрий день, пані Касю!', 'Добрый день, пани Кася!', 'Good morning, Mrs Kasia!')),
  ]),
  v('dobry wieczór', 'phrase', t('добрий вечір', 'добрый вечер', 'good evening'), 'добри в\'єчур', 'A0', ['greetings'], '🌆'),
  v('dobranoc', 'interj', t('на добраніч', 'спокойной ночи', 'good night'), 'добраноц', 'A0', ['greetings'], '🌙'),
  v('do widzenia', 'phrase', t('до побачення', 'до свидания', 'goodbye'), 'до відзеня', 'A0', ['greetings'], '🚪', [
    ex('Dziękuję, do widzenia!', t('Дякую, до побачення!', 'Спасибо, до свидания!', 'Thank you, goodbye!')),
  ]),
  v('na razie', 'phrase', t('бувай, до зустрічі', 'пока', 'see you'), 'на разє', 'A0', ['greetings', 'slang'], '✌️'),
  v('jak się masz?', 'phrase', t('як справи?', 'как дела?', 'how are you?'), 'як шє маш', 'A0', ['greetings', 'people'], '🙂', [
    ex('Cześć! Jak się masz? — Dobrze, dziękuję.', t('Привіт! Як справи? — Добре, дякую.', 'Привет! Как дела? — Хорошо, спасибо.', 'Hi! How are you? — Fine, thanks.')),
  ]),
  v('dobrze', 'adv', t('добре', 'хорошо', 'well, fine'), 'добже', 'A0', ['greetings', 'phrases'], '👍'),
  v('miło mi', 'phrase', t('приємно (познайомитися)', 'приятно (познакомиться)', 'nice to meet you'), 'міло мі', 'A0', ['greetings', 'people'], '🤝'),

  // ── Ввічливість ──
  v('proszę', 'phrase', t('будь ласка; прошу', 'пожалуйста; прошу', 'please; here you are'), 'проше', 'A0', ['phrases'], '🙏', [
    ex('Kawę, proszę.', t('Каву, будь ласка.', 'Кофе, пожалуйста.', 'A coffee, please.')),
  ]),
  v('dziękuję', 'phrase', t('дякую', 'спасибо', 'thank you'), 'дженкує', 'A0', ['phrases'], '💛', [
    ex('Dziękuję bardzo!', t('Дуже дякую!', 'Большое спасибо!', 'Thank you very much!')),
  ]),
  v('przepraszam', 'phrase', t('вибачте; перепрошую', 'извините', 'sorry; excuse me'), 'пшепрашам', 'A0', ['phrases'], '😔', [
    ex('Przepraszam, gdzie jest dworzec?', t('Перепрошую, де вокзал?', 'Извините, где вокзал?', 'Excuse me, where is the station?')),
  ]),
  v('nie ma za co', 'phrase', t('нема за що', 'не за что', 'you\'re welcome'), 'нє ма за цо', 'A0', ['phrases'], '😊'),
  v('tak', 'particle', t('так', 'да', 'yes'), 'так', 'A0', ['phrases'], '✅'),
  v('nie', 'particle', t('ні; не', 'нет; не', 'no; not'), 'нє', 'A0', ['phrases'], '❌'),
  v('smacznego', 'interj', t('смачного', 'приятного аппетита', 'enjoy your meal'), 'смачнего', 'A0', ['phrases', 'restaurants'], '🍽️'),

  // ── Знайомство ──
  v('mam na imię', 'phrase', t('мене звати', 'меня зовут', 'my name is'), 'мам на імє', 'A0', ['people'], '🏷️', [
    ex('Mam na imię Olek.', t('Мене звати Олек.', 'Меня зовут Олек.', 'My name is Olek.')),
  ]),
  v('imię', 'noun', t('ім\'я', 'имя', 'first name'), 'імє', 'A0', ['people', 'documents'], '🏷️', undefined, { gen: 'imienia', pl: 'imiona' }),
  v('nazwisko', 'noun', t('прізвище', 'фамилия', 'surname'), 'назвіско', 'A0', ['people', 'documents'], '📝', undefined, { gen: 'nazwiska' }),
  v('być', 'verb', t('бути', 'быть', 'to be'), 'биць', 'A0', ['grammar', 'people'], '🧍', [
    ex('Jestem z Ukrainy.', t('Я з України.', 'Я из Украины.', 'I am from Ukraine.')),
  ], BYC),
  v('mieć', 'verb', t('мати', 'иметь', 'to have'), 'м\'єчь', 'A0', ['grammar'], '🤲', [
    ex('Mam brata.', t('У мене є брат.', 'У меня есть брат.', 'I have a brother.')),
  ], MIEC),
  v('ja', 'pron', t('я', 'я', 'I'), 'я', 'A0', ['grammar'], '🙋'),
  v('ty', 'pron', t('ти', 'ты', 'you'), 'ти', 'A0', ['grammar'], '👉'),
  v('on', 'pron', t('він', 'он', 'he'), 'он', 'A0', ['grammar'], '👨'),
  v('ona', 'pron', t('вона', 'она', 'she'), 'она', 'A0', ['grammar'], '👩'),
  v('skąd', 'adv', t('звідки', 'откуда', 'where from'), 'сконт', 'A0', ['people'], '🧭', [
    ex('Skąd jesteś?', t('Звідки ти?', 'Откуда ты?', 'Where are you from?')),
  ]),
  v('gdzie', 'adv', t('де', 'где', 'where'), 'гдзє', 'A0', ['people', 'travel'], '📍'),
  v('Polska', 'noun', t('Польща', 'Польша', 'Poland'), 'польска', 'A0', ['people', 'travel'], '🇵🇱', undefined, { gen: 'Polski', loc: 'Polsce' }),
  v('Ukraina', 'noun', t('Україна', 'Украина', 'Ukraine'), 'украіна', 'A0', ['people'], '🇺🇦', undefined, { gen: 'Ukrainy', loc: 'Ukrainie' }),
  v('Białoruś', 'noun', t('Білорусь', 'Беларусь', 'Belarus'), 'бялорусь', 'A0', ['people'], undefined, [ex('Jestem z Białorusi, z Mińska.', t('Я з Білорусі, з Мінська.', 'Я из Беларуси, из Минска.', 'I am from Belarus, from Minsk.'))], { gen: 'Białorusi', loc: 'Białorusi' }),
  v('mieszkać', 'verb', t('жити (мешкати)', 'жить (проживать)', 'to live'), 'м\'єшкачь', 'A0', ['people', 'home'], '🏠', [
    ex('Mieszkam w Warszawie.', t('Я живу у Варшаві.', 'Я живу в Варшаве.', 'I live in Warsaw.')),
  ], { ja: 'mieszkam', ty: 'mieszkasz', 'on/ona': 'mieszka', my: 'mieszkamy', wy: 'mieszkacie', oni: 'mieszkają' }),
  v('mówić', 'verb', t('говорити', 'говорить', 'to speak'), 'мувічь', 'A0', ['people'], '🗣️', [
    ex('Mówię trochę po polsku.', t('Я трохи говорю польською.', 'Я немного говорю по-польски.', 'I speak a little Polish.')),
  ], { ja: 'mówię', ty: 'mówisz', 'on/ona': 'mówi', my: 'mówimy', wy: 'mówicie', oni: 'mówią' }),
  v('po polsku', 'phrase', t('польською', 'по-польски', 'in Polish'), 'по польску', 'A0', ['people'], '🇵🇱'),
  v('rozumieć', 'verb', t('розуміти', 'понимать', 'to understand'), 'розум\'єчь', 'A0', ['people', 'phrases'], '💡', [
    ex('Nie rozumiem.', t('Я не розумію.', 'Я не понимаю.', 'I don\'t understand.')),
  ], { ja: 'rozumiem', ty: 'rozumiesz', 'on/ona': 'rozumie', my: 'rozumiemy', wy: 'rozumiecie', oni: 'rozumieją' }),
  v('trochę', 'adv', t('трохи', 'немного', 'a little'), 'трохе', 'A0', ['phrases'], '🤏'),
  v('rok', 'noun', t('рік', 'год', 'year'), 'рок', 'A0', ['numbers', 'daily'], '📅', [
    ex('Mam dwadzieścia lat.', t('Мені двадцять років.', 'Мне двадцать лет.', 'I am twenty years old.')),
  ], { gen: 'roku', '2-4': 'lata', '5+': 'lat' }),

  // ── Числа ──
  v('zero', 'num', t('нуль', 'ноль', 'zero'), 'зеро', 'A0', ['numbers'], '0️⃣'),
  v('jeden', 'num', t('один', 'один', 'one'), 'єден', 'A0', ['numbers'], '1️⃣'),
  v('dwa', 'num', t('два', 'два', 'two'), 'два', 'A0', ['numbers'], '2️⃣'),
  v('trzy', 'num', t('три', 'три', 'three'), 'тши', 'A0', ['numbers'], '3️⃣'),
  v('cztery', 'num', t('чотири', 'четыре', 'four'), 'чтери', 'A0', ['numbers'], '4️⃣'),
  v('pięć', 'num', t('п\'ять', 'пять', 'five'), 'п\'єнчь', 'A0', ['numbers'], '5️⃣'),
  v('sześć', 'num', t('шість', 'шесть', 'six'), 'шешьчь', 'A0', ['numbers'], '6️⃣'),
  v('siedem', 'num', t('сім', 'семь', 'seven'), 'шедем', 'A0', ['numbers'], '7️⃣'),
  v('osiem', 'num', t('вісім', 'восемь', 'eight'), 'ошем', 'A0', ['numbers'], '8️⃣'),
  v('dziewięć', 'num', t('дев\'ять', 'девять', 'nine'), 'дзєв\'єнчь', 'A0', ['numbers'], '9️⃣'),
  v('dziesięć', 'num', t('десять', 'десять', 'ten'), 'дзєшєнчь', 'A0', ['numbers'], '🔟'),
  v('jedenaście', 'num', t('одинадцять', 'одиннадцать', 'eleven'), 'єденашьчє', 'A0', ['numbers']),
  v('dwanaście', 'num', t('дванадцять', 'двенадцать', 'twelve'), 'дванашьчє', 'A0', ['numbers']),
  v('piętnaście', 'num', t('п\'ятнадцять', 'пятнадцать', 'fifteen'), 'п\'єтнашьчє', 'A0', ['numbers']),
  v('dwadzieścia', 'num', t('двадцять', 'двадцать', 'twenty'), 'двадзєшьчя', 'A0', ['numbers']),
  v('trzydzieści', 'num', t('тридцять', 'тридцать', 'thirty'), 'тшидзєшьчі', 'A1', ['numbers']),
  v('pięćdziesiąt', 'num', t('п\'ятдесят', 'пятьдесят', 'fifty'), 'п\'єньдзєшьонт', 'A1', ['numbers']),
  v('sto', 'num', t('сто', 'сто', 'one hundred'), 'сто', 'A1', ['numbers'], '💯'),

  // ── Сім'я ──
  v('rodzina', 'noun', t('сім\'я, родина', 'семья', 'family'), 'роджіна', 'A0', ['family'], '👨‍👩‍👧', [
    ex('To jest moja rodzina.', t('Це моя сім\'я.', 'Это моя семья.', 'This is my family.')),
  ], { gen: 'rodziny' }),
  v('mama', 'noun', t('мама', 'мама', 'mum'), 'мама', 'A0', ['family'], '👩', undefined, { acc: 'mamę', gen: 'mamy' }),
  v('tata', 'noun', t('тато', 'папа', 'dad'), 'тата', 'A0', ['family'], '👨', undefined, { acc: 'tatę', gen: 'taty' }),
  v('brat', 'noun', t('брат', 'брат', 'brother'), 'брат', 'A0', ['family'], '👦', [
    ex('Mam starszego brata.', t('У мене є старший брат.', 'У меня есть старший брат.', 'I have an older brother.')),
  ], { acc: 'brata', gen: 'brata', pl: 'bracia' }),
  v('siostra', 'noun', t('сестра', 'сестра', 'sister'), 'шостра', 'A0', ['family'], '👧', undefined, { acc: 'siostrę', gen: 'siostry' }),
  v('syn', 'noun', t('син', 'сын', 'son'), 'син', 'A0', ['family'], '👶', undefined, { acc: 'syna' }),
  v('córka', 'noun', t('донька', 'дочь', 'daughter'), 'цурка', 'A0', ['family'], '👧', undefined, { acc: 'córkę' }),
  v('dziecko', 'noun', t('дитина', 'ребёнок', 'child'), 'джєцко', 'A0', ['family'], '🧒', undefined, { pl: 'dzieci' }),
  v('babcia', 'noun', t('бабуся', 'бабушка', 'grandma'), 'бабця', 'A0', ['family'], '👵', undefined, { acc: 'babcię' }),
  v('dziadek', 'noun', t('дідусь', 'дедушка', 'grandpa'), 'джядек', 'A0', ['family'], '👴', undefined, { acc: 'dziadka' }),
  v('mąż', 'noun', t('чоловік (у шлюбі)', 'муж', 'husband'), 'монж', 'A0', ['family'], '🤵', undefined, { acc: 'męża' }),
  v('żona', 'noun', t('дружина', 'жена', 'wife'), 'жона', 'A0', ['family'], '👰', undefined, { acc: 'żonę' }),
  v('rodzice', 'noun', t('батьки', 'родители', 'parents'), 'роджіце', 'A0', ['family'], '👫'),

  // ── Дім ──
  v('dom', 'noun', t('дім', 'дом', 'house; home'), 'дом', 'A0', ['home'], '🏠', [
    ex('To jest mój dom.', t('Це мій дім.', 'Это мой дом.', 'This is my house.')),
  ], { gen: 'domu', loc: 'domu' }),
  v('mieszkanie', 'noun', t('квартира', 'квартира', 'flat, apartment'), 'м\'єшкане', 'A0', ['home', 'rent'], '🏢', [
    ex('Szukam mieszkania.', t('Я шукаю квартиру.', 'Я ищу квартиру.', 'I am looking for a flat.')),
  ], { gen: 'mieszkania', loc: 'mieszkaniu' }),
  v('pokój', 'noun', t('кімната', 'комната', 'room'), 'покуй', 'A0', ['home', 'rent'], '🛏️', undefined, { gen: 'pokoju' }),
  v('kuchnia', 'noun', t('кухня', 'кухня', 'kitchen'), 'кухня', 'A0', ['home'], '🍳', undefined, { loc: 'kuchni' }),
  v('łazienka', 'noun', t('ванна кімната', 'ванная', 'bathroom'), 'вазєнка', 'A0', ['home', 'rent'], '🛁'),
  v('kot', 'noun', t('кіт', 'кот', 'cat'), 'кот', 'A0', ['home'], '🐱', [
    ex('Mam kota.', t('У мене є кіт.', 'У меня есть кот.', 'I have a cat.')),
  ], { acc: 'kota', gen: 'kota' }),
  v('pies', 'noun', t('пес, собака', 'собака', 'dog'), 'п\'єс', 'A0', ['home'], '🐶', [
    ex('To jest pies.', t('Це пес.', 'Это собака.', 'This is a dog.')),
  ], { acc: 'psa', gen: 'psa' }),
  v('dywan', 'noun', t('килим (не диван!)', 'ковёр (не диван!)', 'carpet'), 'диван', 'A0', ['home'], '🟥', [
    ex('Kot śpi na dywanie.', t('Кіт спить на килимі.', 'Кот спит на ковре.', 'The cat sleeps on the carpet.')),
  ]),
  v('kanapa', 'noun', t('диван', 'диван', 'sofa'), 'канапа', 'A0', ['home'], '🛋️'),
  v('duży', 'adj', t('великий', 'большой', 'big'), 'дужи', 'A0', ['home'], '🐘', undefined, { f: 'duża', n: 'duże' }),
  v('mały', 'adj', t('малий', 'маленький', 'small'), 'мави', 'A0', ['home'], '🐭', undefined, { f: 'mała', n: 'małe' }),

  // ── День і тиждень ──
  v('dzisiaj', 'adv', t('сьогодні', 'сегодня', 'today'), 'джішяй', 'A0', ['daily'], '📆'),
  v('jutro', 'adv', t('завтра', 'завтра', 'tomorrow'), 'ютро', 'A0', ['daily'], '⏭️'),
  v('wczoraj', 'adv', t('вчора', 'вчера', 'yesterday'), 'вчорай', 'A0', ['daily'], '⏮️'),
  v('poniedziałek', 'noun', t('понеділок', 'понедельник', 'Monday'), 'понєджявек', 'A0', ['daily'], '1️⃣'),
  v('wtorek', 'noun', t('вівторок', 'вторник', 'Tuesday'), 'вторек', 'A0', ['daily'], '2️⃣'),
  v('środa', 'noun', t('середа', 'среда', 'Wednesday'), 'шьрода', 'A0', ['daily'], '3️⃣', undefined, { acc: 'środę' }),
  v('czwartek', 'noun', t('четвер', 'четверг', 'Thursday'), 'чвартек', 'A0', ['daily'], '4️⃣'),
  v('piątek', 'noun', t('п\'ятниця', 'пятница', 'Friday'), 'п\'йонтек', 'A0', ['daily'], '5️⃣'),
  v('sobota', 'noun', t('субота', 'суббота', 'Saturday'), 'собота', 'A0', ['daily'], '6️⃣', undefined, { acc: 'sobotę' }),
  v('niedziela', 'noun', t('неділя', 'воскресенье', 'Sunday'), 'нєджєля', 'A0', ['daily'], '7️⃣', undefined, { acc: 'niedzielę' }),

  // ── Кафе, їжа, ресторан ──
  v('kawa', 'noun', t('кава', 'кофе', 'coffee'), 'кава', 'A0', ['cafe', 'food'], '☕', [
    ex('Poproszę kawę z mlekiem.', t('Каву з молоком, будь ласка.', 'Кофе с молоком, пожалуйста.', 'A coffee with milk, please.')),
  ], { acc: 'kawę', gen: 'kawy' }),
  v('herbata', 'noun', t('чай', 'чай', 'tea'), 'хербата', 'A0', ['cafe', 'food'], '🍵', undefined, { acc: 'herbatę', gen: 'herbaty' }),
  v('woda', 'noun', t('вода', 'вода', 'water'), 'вода', 'A0', ['cafe', 'food'], '💧', undefined, { acc: 'wodę', gen: 'wody' }),
  v('mleko', 'noun', t('молоко', 'молоко', 'milk'), 'млеко', 'A0', ['cafe', 'food', 'shopping'], '🥛', undefined, { ins: 'mlekiem', gen: 'mleka' }),
  v('sok', 'noun', t('сік', 'сок', 'juice'), 'сок', 'A0', ['cafe', 'food'], '🧃'),
  v('ciasto', 'noun', t('торт, пиріг; тісто', 'пирог, торт', 'cake'), 'чясто', 'A0', ['cafe', 'food'], '🍰'),
  v('chleb', 'noun', t('хліб', 'хлеб', 'bread'), 'хлєб', 'A0', ['food', 'shopping'], '🍞'),
  v('bułka', 'noun', t('булочка', 'булочка', 'bread roll'), 'бувка', 'A0', ['food', 'shopping'], '🥐', undefined, { acc: 'bułkę' }),
  v('ser', 'noun', t('сир', 'сыр', 'cheese'), 'сер', 'A0', ['food', 'shopping'], '🧀'),
  v('jabłko', 'noun', t('яблуко', 'яблоко', 'apple'), 'ябко', 'A0', ['food', 'shopping'], '🍎'),
  v('zupa', 'noun', t('суп', 'суп', 'soup'), 'зупа', 'A0', ['food', 'restaurants'], '🍲', undefined, { acc: 'zupę' }),
  v('pierogi', 'noun', t('вареники', 'вареники', 'dumplings'), 'п\'єроґі', 'A0', ['food', 'restaurants'], '🥟'),
  v('poproszę', 'phrase', t('дайте, будь ласка; попрошу', 'дайте, пожалуйста', 'I\'d like…, please'), 'попроше', 'A0', ['cafe', 'shopping', 'restaurants'], '🙋', [
    ex('Poproszę herbatę.', t('Чай, будь ласка.', 'Чай, пожалуйста.', 'A tea, please.')),
  ]),
  v('rachunek', 'noun', t('рахунок (у ресторані)', 'счёт', 'bill'), 'рахунек', 'A1', ['restaurants', 'bank'], '🧾', [
    ex('Poproszę rachunek.', t('Рахунок, будь ласка.', 'Счёт, пожалуйста.', 'The bill, please.')),
  ]),
  v('kelner', 'noun', t('офіціант', 'официант', 'waiter'), 'кельнер', 'A1', ['restaurants'], '🤵', undefined, { f: 'kelnerka' }),
  v('chcieć', 'verb', t('хотіти', 'хотеть', 'to want'), 'хчєчь', 'A1', ['grammar', 'restaurants'], '🤩', [
    ex('Chcę zamówić pierogi.', t('Я хочу замовити вареники.', 'Я хочу заказать вареники.', 'I want to order pierogi.')),
  ], { ja: 'chcę', ty: 'chcesz', 'on/ona': 'chce', my: 'chcemy', wy: 'chcecie', oni: 'chcą' }),
  v('na wynos', 'phrase', t('з собою (на виніс)', 'с собой', 'to go, takeaway'), 'на винос', 'A1', ['cafe'], '🥡'),
  v('na miejscu', 'phrase', t('на місці (тут)', 'здесь, на месте', 'for here'), 'на м\'єйсцу', 'A1', ['cafe'], '🪑'),

  // ── Магазин ──
  v('sklep', 'noun', t('магазин (не склеп!)', 'магазин', 'shop'), 'склеп', 'A0', ['shopping'], '🏪', [
    ex('Idę do sklepu.', t('Я йду в магазин.', 'Я иду в магазин.', 'I am going to the shop.')),
  ], { gen: 'sklepu', loc: 'sklepie' }),
  v('ile kosztuje?', 'phrase', t('скільки коштує?', 'сколько стоит?', 'how much is it?'), 'іле коштує', 'A0', ['shopping'], '💰'),
  v('złoty', 'noun', t('злотий', 'злотый', 'zloty'), 'звоти', 'A0', ['shopping', 'bank', 'numbers'], '🪙', [
    ex('To kosztuje pięć złotych.', t('Це коштує п\'ять злотих.', 'Это стоит пять злотых.', 'It costs five zlotys.')),
  ], { '2-4': 'złote', '5+': 'złotych' }),
  v('grosz', 'noun', t('грош (1/100 злотого)', 'грош', 'grosz (1/100 zloty)'), 'грош', 'A1', ['shopping', 'bank'], '🪙', undefined, { '2-4': 'grosze', '5+': 'groszy' }),
  v('karta', 'noun', t('картка', 'карта', 'card'), 'карта', 'A0', ['shopping', 'bank'], '💳', [
    ex('Płacę kartą.', t('Я плачу карткою.', 'Я плачу картой.', 'I pay by card.')),
  ], { ins: 'kartą' }),
  v('gotówka', 'noun', t('готівка', 'наличные', 'cash'), 'готувка', 'A1', ['shopping', 'bank'], '💵', undefined, { ins: 'gotówką' }),
  v('torba', 'noun', t('сумка, пакет', 'сумка, пакет', 'bag'), 'торба', 'A0', ['shopping'], '🛍️', undefined, { acc: 'torbę' }),
  v('paragon', 'noun', t('чек', 'чек', 'receipt'), 'параґон', 'A1', ['shopping'], '🧾'),
  v('drogi', 'adj', t('дорогий', 'дорогой', 'expensive'), 'дроґі', 'A1', ['shopping'], '💎', undefined, { f: 'droga' }),
  v('tani', 'adj', t('дешевий', 'дешёвый', 'cheap'), 'тані', 'A1', ['shopping'], '🏷️', undefined, { f: 'tania' }),

  // ── Транспорт і подорожі ──
  v('autobus', 'noun', t('автобус', 'автобус', 'bus'), 'аутобус', 'A0', ['transport'], '🚌'),
  v('tramwaj', 'noun', t('трамвай', 'трамвай', 'tram'), 'трамвай', 'A0', ['transport'], '🚋'),
  v('pociąg', 'noun', t('потяг', 'поезд', 'train'), 'почьонк', 'A0', ['transport', 'travel'], '🚆', [
    ex('Pociąg do Gdańska odjeżdża z peronu drugiego.', t('Потяг до Гданська відправляється з другої платформи.', 'Поезд в Гданьск отправляется со второй платформы.', 'The train to Gdańsk leaves from platform two.')),
  ]),
  v('bilet', 'noun', t('квиток', 'билет', 'ticket'), 'білет', 'A0', ['transport', 'travel'], '🎫', [
    ex('Poproszę bilet normalny.', t('Звичайний квиток, будь ласка.', 'Обычный билет, пожалуйста.', 'A standard ticket, please.')),
  ]),
  v('przystanek', 'noun', t('зупинка', 'остановка', 'stop (bus/tram)'), 'пшистанек', 'A1', ['transport'], '🚏'),
  v('dworzec', 'noun', t('вокзал', 'вокзал', 'station'), 'двожец', 'A1', ['transport', 'travel'], '🚉', undefined, { gen: 'dworca' }),
  v('peron', 'noun', t('платформа', 'платформа', 'platform'), 'перон', 'A1', ['transport', 'travel'], '🛤️'),
  v('prosto', 'adv', t('прямо', 'прямо', 'straight on'), 'просто', 'A1', ['travel', 'transport'], '⬆️'),
  v('w lewo', 'phrase', t('ліворуч', 'налево', 'left'), 'в лєво', 'A1', ['travel', 'transport'], '⬅️'),
  v('w prawo', 'phrase', t('праворуч', 'направо', 'right'), 'в право', 'A1', ['travel', 'transport'], '➡️'),

  // ── Робота ──
  v('praca', 'noun', t('робота', 'работа', 'work, job'), 'праца', 'A0', ['work', 'factory'], '💼', [
    ex('Szukam pracy.', t('Я шукаю роботу.', 'Я ищу работу.', 'I am looking for a job.')),
  ], { gen: 'pracy' }),
  v('pracować', 'verb', t('працювати', 'работать', 'to work'), 'працовачь', 'A0', ['work'], '👷', [
    ex('Pracuję w magazynie.', t('Я працюю на складі.', 'Я работаю на складе.', 'I work in a warehouse.')),
  ], { ja: 'pracuję', ty: 'pracujesz', 'on/ona': 'pracuje', my: 'pracujemy', wy: 'pracujecie', oni: 'pracują' }),
  v('umowa', 'noun', t('договір', 'договор', 'contract'), 'умова', 'A1', ['work', 'documents', 'rent'], '📄', [
    ex('Mam umowę o pracę.', t('У мене трудовий договір.', 'У меня трудовой договор.', 'I have an employment contract.')),
  ]),
  v('zmiana', 'noun', t('зміна (на роботі)', 'смена', 'shift'), 'змяна', 'A1', ['factory', 'work'], '🔁', [
    ex('Jutro mam nocną zmianę.', t('Завтра в мене нічна зміна.', 'Завтра у меня ночная смена.', 'Tomorrow I have a night shift.')),
  ]),
  v('magazyn', 'noun', t('склад', 'склад', 'warehouse'), 'маґазин', 'A1', ['factory', 'work'], '📦'),
  v('kierownik', 'noun', t('керівник', 'руководитель', 'manager'), 'кєровнік', 'A1', ['work', 'factory'], '🧑‍💼'),
  v('wypłata', 'noun', t('зарплата (виплата)', 'зарплата', 'pay, wages'), 'випвата', 'A1', ['work', 'bank'], '💸'),

  // ── Здоров'я ──
  v('lekarz', 'noun', t('лікар', 'врач', 'doctor'), 'лєкаж', 'A1', ['medicine'], '🩺', [
    ex('Muszę iść do lekarza.', t('Мені треба йти до лікаря.', 'Мне нужно к врачу.', 'I need to see a doctor.')),
  ], { gen: 'lekarza' }),
  v('apteka', 'noun', t('аптека', 'аптека', 'pharmacy'), 'аптека', 'A1', ['medicine'], '💊'),
  v('boli mnie', 'phrase', t('у мене болить', 'у меня болит', 'it hurts / I have a pain'), 'болі мнє', 'A1', ['medicine'], '🤕', [
    ex('Boli mnie głowa.', t('У мене болить голова.', 'У меня болит голова.', 'I have a headache.')),
  ]),
  v('recepta', 'noun', t('рецепт (від лікаря)', 'рецепт', 'prescription'), 'рецепта', 'A1', ['medicine'], '📋'),

  // ── Документи, ужонд, банк ──
  v('urząd', 'noun', t('установа, ужонд', 'учреждение, ужонд', 'office (government)'), 'ужонт', 'A1', ['urzad', 'documents'], '🏛️', undefined, { gen: 'urzędu' }),
  v('wniosek', 'noun', t('заява', 'заявление', 'application'), 'вньосек', 'A1', ['urzad', 'documents'], '📝', [
    ex('Chcę złożyć wniosek o kartę pobytu.', t('Я хочу подати заяву на карту побиту.', 'Я хочу подать заявление на карту побыту.', 'I want to apply for a residence card.')),
  ]),
  v('karta pobytu', 'noun', t('карта побиту (посвідка на проживання)', 'карта побыту (вид на жительство)', 'residence card'), 'карта побиту', 'A1', ['urzad', 'documents'], '🪪'),
  v('termin', 'noun', t('дата, запис, термін', 'дата, запись, срок', 'appointment; deadline'), 'термін', 'A1', ['urzad', 'medicine'], '🗓️'),
  v('konto', 'noun', t('рахунок (у банку); акаунт', 'счёт (в банке)', 'bank account'), 'конто', 'A1', ['bank'], '🏦', [
    ex('Chcę otworzyć konto.', t('Я хочу відкрити рахунок.', 'Я хочу открыть счёт.', 'I want to open an account.')),
  ]),
  v('przelew', 'noun', t('переказ', 'перевод', 'bank transfer'), 'пшелєв', 'A1', ['bank'], '🔄'),
  v('bankomat', 'noun', t('банкомат', 'банкомат', 'ATM'), 'банкомат', 'A0', ['bank'], '🏧'),

  // ── Сленг ──
  v('spoko', 'interj', t('нормально, спокійно, ок', 'нормально, ок', 'cool, no worries'), 'споко', 'A1', ['slang'], '😎', [
    ex('Spoko, nie ma problemu.', t('Спокійно, нема проблем.', 'Спокойно, без проблем.', 'Cool, no problem.')),
  ]),
  v('siema', 'interj', t('здоров, привіт (розм.)', 'здорово, привет (разг.)', 'hey (informal)'), 'шєма', 'A1', ['slang', 'greetings'], '🤙'),
  v('luz', 'noun', t('спокуха, без напрягу', 'расслабься, без напряга', 'chill, relax'), 'луз', 'A1', ['slang'], '🏖️'),
  v('hajs', 'noun', t('гроші (сленг)', 'деньги (сленг)', 'cash, dough (slang)'), 'хайс', 'B1', ['slang'], '💰'),

  // ── Іспит ──
  v('egzamin', 'noun', t('іспит', 'экзамен', 'exam'), 'еґзамін', 'A1', ['exam_b1'], '📚'),
  v('certyfikat', 'noun', t('сертифікат', 'сертификат', 'certificate'), 'цертифікат', 'B1', ['exam_b1', 'documents'], '🎓'),
  ...LIFE_VOCAB,
  ...EDU_VOCAB,
  ...KRAKOW_VOCAB,
  ...WARSZAWA_VOCAB,
  ...LODZ_VOCAB,
  ...KATOWICE_VOCAB,
  ...OPOLE_VOCAB,
  ...POZNAN_VOCAB,
  ...WROCLAW_VOCAB,
];
