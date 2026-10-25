/**
 * Варшава · локація 3 — Числа й прості покупки (продовження уроків 0–10 і 11–20).
 * Десятки до 100, ціни (złoty / złote / złotych, grosz / grosze / groszy), «Po ile…?», pół kilo + родовий,
 * базар і крамниця біля дому, місія «Перший кошик продуктів». Ціни — навчальні приклади.
 */
import {
  t, wordChoice, pictureChoice, reverseChoice, fillGap, listen, findError, oddOne, reading,
  translate, dictation, build, wordOrder, match, speak, dialogue,
} from './builders';
import type { LessonSeed } from './types';

const JADZIA = { name: 'Pani Jadzia', emoji: '👵🏼', role: t('продавчиня на ринку', 'продавщица на рынке', 'market stallholder') };
const MIREK = { name: 'Pan Mirek', emoji: '👨🏻‍🌾', role: t('продавець в овочевій крамниці', 'продавец в овощной лавке', 'greengrocer') };
const KIOSK = { name: 'Pan z kiosku', emoji: '🧔🏻‍♂️', role: t('продавець у кіоску', 'продавец в киоске', 'kiosk seller') };
const ELA = { name: 'Pani Ela', emoji: '👩🏻', role: t('касирка в крамниці біля дому', 'кассир в магазине у дома', 'cashier at the local shop') };

const STALL = 'HALA — STOISKO PANI JADZI (ceny przykładowe) · ziemniaki 3 zł/kg · ogórki 7 zł/kg · jabłka 5 zł/kg · pomidory 12 zł/kg (w promocji: 9 zł)';
const RECEIPT = 'PARAGON · Ziemniaki 1 kg 3,00 · Ogórki 0,5 kg 3,50 · Chleb 6,00 · Mleko 4,00 · Jajka 10 szt. 12,00 · SUMA 28,50 zł';

export const WAW_K3: LessonSeed = {
  slug: 'waw-k3-zakupy',
  title: t('На ринку й у крамниці', 'На рынке и в магазине', 'At the market and the shop'),
  topic: t('Десятки до 100, złoty / złote / złotych, Po ile…?, pół kilo', 'Десятки до 100, złoty / złote / złotych, Po ile…?, pół kilo', 'Tens to 100, złoty forms, Po ile…?, half a kilo'),
  cefr: 'A1',
  difficulty: 2,
  explanation: t(
    'Десятки: 20 **dwadzieścia**, 30 **trzydzieści**, 40 **czterdzieści**, 50 **pięćdziesiąt**, 60 **sześćdziesiąt**, 70 **siedemdziesiąt**, 80 **osiemdziesiąt**, 90 **dziewięćdziesiąt**, 100 **sto**. 25 = dwadzieścia pięć.\nЦіни: 1 **złoty**, 2–4 **złote**, для 5–21 — **złotych** (22 złote, 25 złotych). Гроші: 1 **grosz**, 2–4 **grosze**, для 5–21 — **groszy**.\n**Ile kosztuje…?** — про одне, **Ile kosztują…?** — про кілька. На ринку часто питають: **Po ile są pomidory?** — По чому помідори?\n**pół kilo / kilogram** + родовий: pół kilo jabłek, kilogram ziemniaków — запам\'ятай як готові фрази.\n**Coś jeszcze? — To wszystko.** — Щось іще? — Це все.\nУ Варшаві є критий ринок **Hala Mirowska**: овочі, фрукти, квіти.',
    'Десятки: 20 **dwadzieścia**, 30 **trzydzieści**, 40 **czterdzieści**, 50 **pięćdziesiąt**, 60 **sześćdziesiąt**, 70 **siedemdziesiąt**, 80 **osiemdziesiąt**, 90 **dziewięćdziesiąt**, 100 **sto**. 25 = dwadzieścia pięć.\nЦены: 1 **złoty**, 2–4 **złote**, для 5–21 — **złotych** (22 złote, 25 złotych). Гроши: 1 **grosz**, 2–4 **grosze**, для 5–21 — **groszy**.\n**Ile kosztuje…?** — об одном, **Ile kosztują…?** — о нескольких. На рынке часто спрашивают: **Po ile są pomidory?** — Почём помидоры?\n**pół kilo / kilogram** + родительный: pół kilo jabłek, kilogram ziemniaków — запомни как готовые фразы.\n**Coś jeszcze? — To wszystko.** — Что-нибудь ещё? — Это всё.\nВ Варшаве есть крытый рынок **Hala Mirowska**: овощи, фрукты, цветы.',
    'Tens: 20 **dwadzieścia**, 30 **trzydzieści**, 40 **czterdzieści**, 50 **pięćdziesiąt**, 60 **sześćdziesiąt**, 70 **siedemdziesiąt**, 80 **osiemdziesiąt**, 90 **dziewięćdziesiąt**, 100 **sto**. 25 = dwadzieścia pięć.\nPrices: 1 **złoty**, 2–4 **złote**, 5–21 **złotych** (22 złote, 25 złotych). Coins: 1 **grosz**, 2–4 **grosze**, 5–21 **groszy**.\n**Ile kosztuje…?** — for one thing, **Ile kosztują…?** — for several. At a market people ask **Po ile są pomidory?** — How much are the tomatoes?\n**pół kilo / kilogram** + genitive: pół kilo jabłek, kilogram ziemniaków — learn them as chunks.\n**Coś jeszcze? — To wszystko.** — Anything else? — That\'s all.\nWarsaw has a covered market, **Hala Mirowska**: vegetables, fruit, flowers.',
  ),
  examples: [{ pl: 'Po ile są ogórki? — Siedem złotych za kilo.', tr: t('По чому огірки? — Сім злотих за кіло.', 'Почём огурцы? — Семь злотых за кило.', 'How much are the cucumbers? — Seven złoty a kilo.') }],
  words: ['kosztować', 'warzywniak', 'kiosk', 'ziemniak', 'ogórek', 'pół kilo', 'w promocji', 'tanio', 'drogo', 'czterdzieści', 'sześćdziesiąt', 'siedemdziesiąt', 'osiemdziesiąt', 'dziewięćdziesiąt'],
  exercises: [
    wordChoice('vocab.shop', 'warzywniak', [t('овочева крамниця', 'овощная лавка', 'greengrocer\'s'), t('пекарня', 'пекарня', 'bakery'), t('аптека', 'аптека', 'pharmacy')]),
    wordChoice('vocab.numbers', 'siedemdziesiąt', [t('70', '70', '70'), t('17', '17', '17'), t('7', '7', '7')]),
    reverseChoice('vocab.shop', t('По чому помідори?', 'Почём помидоры?', 'How much are the tomatoes?'), ['Po ile są pomidory?', 'Gdzie są pomidory?', 'Czy są pomidory?']),
    match('vocab.numbers', [
      ['czterdzieści', t('40', '40', '40')],
      ['sześćdziesiąt', t('60', '60', '60')],
      ['osiemdziesiąt', t('80', '80', '80')],
      ['dziewięćdziesiąt', t('90', '90', '90')],
    ]),
    fillGap('grammar.prices', 'Te pomidory kosztują dwa ___.', ['złote', 'złotych', 'złoty'], t('Ці помідори коштують два злоті.', 'Эти помидоры стоят два злотых.', 'These tomatoes cost two złoty.'),
      t('2, 3, 4 → **złote**.', '2, 3, 4 → **złote**.', '2, 3, 4 → **złote**.')),
    fillGap('grammar.prices', 'Chleb kosztuje sześć ___.', ['złotych', 'złote', 'złoty'], t('Хліб коштує шість злотих.', 'Хлеб стоит шесть злотых.', 'Bread costs six złoty.'),
      t('Для 5–21 → **złotych**.', 'Для 5–21 → **złotych**.', '5–21 → **złotych**.')),
    fillGap('grammar.prices', 'Ile ___ ogórki?', ['kosztują', 'kosztuje', 'kosztować'], t('Скільки коштують огірки?', 'Сколько стоят огурцы?', 'How much are the cucumbers?'),
      t('Кілька огірків → **kosztują**.', 'Несколько огурцов → **kosztują**.', 'Several → **kosztują**.')),
    listen('listening.prices', 'Razem czterdzieści siedem złotych', ['Razem czterdzieści siedem złotych', 'Razem czterdzieści siedem groszy', 'Razem siedemdziesiąt siedem złotych']),
    listen('listening.prices', 'Pół kilo jabłek, proszę', ['Pół kilo jabłek, proszę', 'Kilo jabłek, proszę', 'Pół kilo pomidorów, proszę']),
    reading('reading.stall', STALL, t('Скільки коштують помідори за акцією?', 'Сколько стоят помидоры по акции?', 'How much are the tomatoes on sale?'), ['9 zł', '12 zł', '7 zł'],
      t('**w promocji: 9 zł** — ціна за акцією.', '**w promocji: 9 zł** — цена по акции.', '**w promocji: 9 zł** — the sale price.')),
    reading('reading.stall', STALL, t('Що найдешевше?', 'Что дешевле всего?', 'What is the cheapest?'),
      [t('Картопля', 'Картошка', 'Potatoes'), t('Огірки', 'Огурцы', 'Cucumbers'), t('Яблука', 'Яблоки', 'Apples')]),
    dialogue('situation.market', JADZIA, [
      { npc: 'Dzień dobry! Co podać?', tr: t('Добрий день! Що подати?', 'Добрый день! Что подать?', 'Hello! What can I get you?'),
        choose: [['Dzień dobry, po ile są ogórki?', t('Добрий день, по чому огірки?', 'Добрый день, почём огурцы?', 'Hello, how much are the cucumbers?')], ['Dzień dobry, którędy do metra?', t('Добрий день, як пройти до метро?', 'Добрый день, как пройти к метро?', 'Hello, which way to the metro?')]],
        feedback: t('Ти на ринку — спитай ціну: **Po ile są…?**', 'Ты на рынке — спроси цену: **Po ile są…?**', 'You\'re at a market — ask the price: **Po ile są…?**') },
      { npc: 'Siedem złotych za kilo. Świeże, z rana!', tr: t('Сім злотих за кіло. Свіжі, зранку!', 'Семь злотых за кило. Свежие, с утра!', 'Seven złoty a kilo. Fresh this morning!'),
        choose: [['To poproszę pół kilo.', t('Тоді пів кіло, будь ласка.', 'Тогда полкило, пожалуйста.', 'Then half a kilo, please.')], ['To poproszę peron drugi.', t('Тоді другу платформу, будь ласка.', 'Тогда вторую платформу, пожалуйста.', 'Then platform two, please.')]],
        feedback: t('Скажи, скільки хочеш: **pół kilo**.', 'Скажи, сколько хочешь: **pół kilo**.', 'Say how much: **pół kilo**.') },
      { npc: 'Proszę bardzo. Coś jeszcze?', tr: t('Прошу. Щось іще?', 'Пожалуйста. Что-нибудь ещё?', 'Here you are. Anything else?'),
        choose: [['Jeszcze kilogram ziemniaków. To wszystko.', t('Ще кілограм картоплі. Це все.', 'Ещё килограмм картошки. Это всё.', 'A kilo of potatoes too. That\'s all.')], ['Nie rozumiem, dobranoc.', t('Не розумію, на добраніч.', 'Не понимаю, спокойной ночи.', 'I don\'t understand, good night.')]],
        feedback: t('Додай покупку й закінчи: **To wszystko.**', 'Добавь покупку и закончи: **To wszystko.**', 'Add an item and finish: **To wszystko.**') },
      { npc: 'Razem sześć złotych pięćdziesiąt groszy.', tr: t('Разом шість злотих п\'ятдесят грошів.', 'Вместе шесть злотых пятьдесят грошей.', 'Six złoty fifty altogether.') },
    ], { situation: true, scene: t('Хала Мирівська. Пані Ядзя розкладає свіжі огірки.', 'Хала Мировска. Пани Ядзя раскладывает свежие огурцы.', 'Hala Mirowska market. Pani Jadzia is laying out fresh cucumbers.') }),
    findError('grammar.prices', ['To', 'kosztuje', 'pięć', 'złote'], 3, t('Це коштує п\'ять злотих.', 'Это стоит пять злотых.', 'It costs five złoty.'),
      t('Для 5–21 → **złotych**.', 'Для 5–21 → **złotych**.', '5–21 → **złotych**.')),
    oddOne('vocab.food', ['ziemniak', 'ogórek', 'pomidor', 'kiosk'], 3,
      t('Три — овочі, а **kiosk** — кіоск.', 'Три — овощи, а **kiosk** — киоск.', 'Three are vegetables; **kiosk** is a kiosk.'), t("Що НЕ є овочем?", "Что НЕ является овощем?", "Which is NOT a vegetable?")),
    build('grammar.shop', 'Poproszę kilogram ziemniaków', t('Кілограм картоплі, будь ласка', 'Килограмм картошки, пожалуйста', 'A kilo of potatoes, please'), ['ziemniaki', 'kilo'], ['Poproszę kilo ziemniaków'],
      t('**kilogram / kilo** + родовий множини: **ziemniaków**.', '**kilogram / kilo** + родительный множественного: **ziemniaków**.', '**kilogram / kilo** + genitive plural: **ziemniaków**.')),
    wordOrder('grammar.shop', 'Ogórki są dzisiaj w promocji', t('Огірки сьогодні в акції.', 'Огурцы сегодня по акции.', 'Cucumbers are on sale today.'), undefined, ['Dzisiaj ogórki są w promocji', 'Ogórki dzisiaj są w promocji']),
    translate('writing.prices', t('Скільки це коштує?', 'Сколько это стоит?', 'How much is it?'), ['Ile to kosztuje', 'Ile kosztuje']),
    speak('speaking.shop', 'Po ile są pomidory?', t('По чому помідори?', 'Почём помидоры?', 'How much are the tomatoes?')),
  ],
};

export const WAW_K4: LessonSeed = {
  slug: 'waw-k4-misja',
  title: t('Місія: перший кошик продуктів', 'Миссия: первая корзина продуктов', 'Mission: the first basket of groceries'),
  topic: t('Фінальна місія локації «Числа й прості покупки»', 'Финальная миссия локации «Числа и простые покупки»', 'Final mission of "Numbers & simple shopping"'),
  cefr: 'A1',
  difficulty: 3,
  explanation: t(
    'Фінальна місія локації. У тебе список покупок і 50 злотих. Зайди в кіоск, в овочеву крамницю й у крамницю біля дому — і не вийди за бюджет.\nЗнадобиться: ціни (**złote / złotych**, **grosze / groszy**), **Po ile…? / Ile kosztuje…?**, **pół kilo**, **Coś jeszcze? — To wszystko**, **kartą / gotówką**.\nЦіни — навчальні приклади. Потрібно щонайменше 70% правильних відповідей.',
    'Финальная миссия локации. У тебя список покупок и 50 злотых. Зайди в киоск, в овощную лавку и в магазин у дома — и уложись в бюджет.\nПригодится: цены (**złote / złotych**, **grosze / groszy**), **Po ile…? / Ile kosztuje…?**, **pół kilo**, **Coś jeszcze? — To wszystko**, **kartą / gotówką**.\nЦены — учебные примеры. Нужно не меньше 70% правильных ответов.',
    'The final mission. You have a shopping list and 50 złoty. Visit a kiosk, a greengrocer\'s and the local shop — and stay within budget.\nYou will need prices (**złote / złotych**, **grosze / groszy**), **Po ile…? / Ile kosztuje…?**, **pół kilo**, **Coś jeszcze? — To wszystko**, **kartą / gotówką**.\nPrices are examples. You need at least 70% correct answers.',
  ),
  examples: [{ pl: 'Poproszę kilogram jabłek i pół kilo pomidorów. To wszystko.', tr: t('Кілограм яблук і пів кіло помідорів, будь ласка. Це все.', 'Килограмм яблок и полкило помидоров, пожалуйста. Это всё.', 'A kilo of apples and half a kilo of tomatoes, please. That\'s all.') }],
  words: [],
  exercises: [
    match('vocab.numbers', [
      ['dwadzieścia', t('20', '20', '20')],
      ['trzydzieści', t('30', '30', '30')],
      ['pięćdziesiąt', t('50', '50', '50')],
      ['siedemdziesiąt', t('70', '70', '70')],
      ['sto', t('100', '100', '100')],
    ]),
    reading('reading.list', 'LISTA ZAKUPÓW: 1 kg ziemniaków, pół kilo ogórków, chleb, mleko, 10 jajek · Budżet: 50 zł',
      t('Скільки яєць треба купити?', 'Сколько яиц нужно купить?', 'How many eggs do you need?'), ['10', '1', '50']),
    dialogue('situation.kiosk', KIOSK, [
      { npc: 'Słucham?', tr: t('Слухаю.', 'Слушаю.', 'Yes?'),
        choose: [['Poproszę wodę niegazowaną i bilet dwudziestominutowy.', t('Негазовану воду й 20-хвилинний квиток, будь ласка.', 'Негазированную воду и 20-минутный билет, пожалуйста.', 'Still water and a 20-minute ticket, please.')], ['Poproszę pokój dwuosobowy.', t('Двомісний номер, будь ласка.', 'Двухместный номер, пожалуйста.', 'A double room, please.')]],
        feedback: t('У кіоску купують воду, квитки, газети: **Poproszę wodę… i bilet…**', 'В киоске покупают воду, билеты, газеты: **Poproszę wodę… i bilet…**', 'Kiosks sell water, tickets, newspapers: **Poproszę wodę… i bilet…**') },
      { npc: 'Razem siedem złotych czterdzieści groszy.', tr: t('Разом сім злотих сорок грошів.', 'Вместе семь злотых сорок грошей.', 'Seven złoty forty altogether.'),
        choose: [['Proszę, dziesięć złotych.', t('Прошу, десять злотих.', 'Вот, десять злотых.', 'Here, ten złoty.')], ['Proszę, dziesięć groszy.', t('Прошу, десять грошів.', 'Вот, десять грошей.', 'Here, ten groszy.')]],
        feedback: t('7,40 зл — потрібні **злоті**, а не гроші: dziesięć złotych.', '7,40 зл — нужны **злотые**, а не гроши: dziesięć złotych.', '7.40 zł needs **złoty**, not groszy: dziesięć złotych.') },
      { npc: 'Dwa sześćdziesiąt reszty. Dziękuję!', tr: t('Дві шістдесят решти. Дякую!', 'Два шестьдесят сдачи. Спасибо!', 'Two sixty change. Thank you!') },
    ], { situation: true, scene: t('Місія, крок 1: кіоск біля зупинки.', 'Миссия, шаг 1: киоск у остановки.', 'Mission, step 1: a kiosk by the stop.') }),
    fillGap('grammar.prices', 'Woda kosztuje cztery ___.', ['złote', 'złotych', 'złoty'], t('Вода коштує чотири злоті.', 'Вода стоит четыре злотых.', 'Water costs four złoty.'),
      t('2–4 → **złote**.', '2–4 → **złote**.', '2–4 → **złote**.')),
    listen('listening.prices', 'Dwa złote sześćdziesiąt groszy reszty', ['Dwa złote sześćdziesiąt groszy reszty', 'Dwa złote szesnaście groszy reszty', 'Dwanaście złotych sześćdziesiąt groszy reszty']),
    dialogue('situation.greengrocer', MIREK, [
      { npc: 'Dzień dobry! Czym mogę służyć?', tr: t('Добрий день! Чим можу допомогти?', 'Добрый день! Чем могу помочь?', 'Hello! How can I help?'),
        choose: [['Dzień dobry, po ile są jabłka?', t('Добрий день, по чому яблука?', 'Добрый день, почём яблоки?', 'Hello, how much are the apples?')], ['Dzień dobry, mam dwadzieścia lat.', t('Добрий день, мені двадцять років.', 'Добрый день, мне двадцать лет.', 'Hello, I\'m twenty.')]],
        feedback: t('Спитай ціну: **po ile są jabłka?**', 'Спроси цену: **po ile są jabłka?**', 'Ask the price: **po ile są jabłka?**') },
      { npc: 'Pięć złotych za kilo.', tr: t('П\'ять злотих за кіло.', 'Пять злотых за кило.', 'Five złoty a kilo.'),
        choose: [['Poproszę kilogram. Czy pomidory są w promocji?', t('Кілограм, будь ласка. Помідори в акції?', 'Килограмм, пожалуйста. Помидоры по акции?', 'A kilo, please. Are the tomatoes on sale?')], ['Poproszę pięć złotych.', t('П\'ять злотих, будь ласка.', 'Пять злотых, пожалуйста.', 'Five złoty, please.')]],
        feedback: t('Купуєш яблука: **Poproszę kilogram.**', 'Покупаешь яблоки: **Poproszę kilogram.**', 'You\'re buying apples: **Poproszę kilogram.**') },
      { npc: 'Tak, dziś dziewięć złotych za kilo.', tr: t('Так, сьогодні дев\'ять злотих за кіло.', 'Да, сегодня девять злотых за кило.', 'Yes, nine złoty a kilo today.'),
        choose: [['To poproszę też pół kilo pomidorów.', t('Тоді ще пів кіло помідорів.', 'Тогда ещё полкило помидоров.', 'Then half a kilo of tomatoes too.')], ['To poproszę też pół kilo peronu.', t('(безглуздо)', '(бессмыслица)', '(nonsense)')]],
        feedback: t('**pół kilo** + родовий: **pomidorów**.', '**pół kilo** + родительный: **pomidorów**.', '**pół kilo** + genitive: **pomidorów**.') },
      { npc: 'Proszę bardzo, smacznego!', tr: t('Прошу, смачного!', 'Пожалуйста, приятного аппетита!', 'Here you go, enjoy!') },
    ], { situation: true, scene: t('Місія, крок 2: овочева крамниця на розі.', 'Миссия, шаг 2: овощная лавка на углу.', 'Mission, step 2: the greengrocer\'s on the corner.') }),
    reading('reading.receipt', RECEIPT, t('Скільки разом?', 'Сколько всего?', 'What is the total?'), ['28,50 zł', '50 zł', '12 zł']),
    reading('reading.receipt', RECEIPT, t('Скільки залишилося з 50 злотих?', 'Сколько осталось из 50 злотых?', 'How much is left of the 50 złoty?'), ['21,50 zł', '28,50 zł', '22,50 zł'],
      t('50 − 28,50 = **21,50 zł**.', '50 − 28,50 = **21,50 zł**.', '50 − 28.50 = **21.50 zł**.')),
    wordChoice('vocab.shop', 'To wszystko', [t('Це все', 'Это всё', 'That\'s all'), t('Це дешево', 'Это дёшево', 'That\'s cheap'), t('Це дорого', 'Это дорого', 'That\'s expensive')]),
    reverseChoice('vocab.shop', t('дешево', 'дёшево', 'cheap'), ['tanio', 'drogo', 'dużo']),
    findError('grammar.prices', ['Jajka', 'kosztuje', 'dwanaście', 'złotych'], 1, t('Яйця коштують дванадцять злотих.', 'Яйца стоят двенадцать злотых.', 'The eggs cost twelve złoty.'),
      t('Кілька яєць → **kosztują**.', 'Несколько яиц → **kosztują**.', 'Several eggs → **kosztują**.')),
    fillGap('grammar.shop', 'Poproszę pół kilo ___.', ['pomidorów', 'pomidory', 'pomidor'], t('Пів кіло помідорів, будь ласка.', 'Полкило помидоров, пожалуйста.', 'Half a kilo of tomatoes, please.'),
      t('Після **pół kilo** — родовий множини: **pomidorów**.', 'После **pół kilo** — родительный множественного: **pomidorów**.', 'After **pół kilo** use the genitive plural: **pomidorów**.')),
    oddOne('vocab.shop', ['tanio', 'drogo', 'w promocji', 'na peronie'], 3,
      t('Три — про ціну, а **na peronie** — на платформі.', 'Три — о цене, а **na peronie** — на платформе.', 'Three are about prices; **na peronie** means on the platform.'), t("Який вираз позначає місце, а не ціну?", "Какое выражение обозначает место, а не цену?", "Which expression describes a place rather than a price?")),
    pictureChoice('vocab.food', 'ogórek', [
      ['🥒', t('огірок', 'огурец', 'cucumber')], ['🍅', t('помідор', 'помидор', 'tomato')], ['🥔', t('картопля', 'картошка', 'potato')], ['🍎', t('яблуко', 'яблоко', 'apple')],
    ]),
    build('grammar.prices', 'Razem dwadzieścia osiem złotych pięćdziesiąt groszy', t('Разом двадцять вісім злотих п\'ятдесят грошів', 'Вместе двадцать восемь злотых пятьдесят грошей', 'Twenty-eight złoty fifty altogether'), ['złote', 'grosze']),
    wordOrder('grammar.shop', 'Czy jajka są świeże', t('Чи свіжі яйця?', 'Яйца свежие?', 'Are the eggs fresh?')),
    listen('listening.numbers', 'sto dwadzieścia', ['sto dwadzieścia', 'sto dwanaście', 'dwieście dwadzieścia']),
    dialogue('situation.local-shop', ELA, [
      { npc: 'Torba potrzebna?', tr: t('Пакет потрібен?', 'Пакет нужен?', 'Do you need a bag?'),
        choose: [['Nie, dziękuję, mam swoją.', t('Ні, дякую, маю свій.', 'Нет, спасибо, у меня свой.', 'No thanks, I have my own.')], ['Tak, poproszę peron.', t('Так, платформу, будь ласка.', 'Да, платформу, пожалуйста.', 'Yes, a platform, please.')]],
        feedback: t('Питають про пакет (torba): **mam swoją** — маю свій.', 'Спрашивают про пакет: **mam swoją** — у меня своя.', 'They ask about a bag: **mam swoją** — I have my own.') },
      { npc: 'Kartą czy gotówką?', tr: t('Карткою чи готівкою?', 'Картой или наличными?', 'Card or cash?'),
        choose: [['Kartą, proszę.', t('Карткою, будь ласка.', 'Картой, пожалуйста.', 'By card, please.')], ['Dwa lata.', t('Два роки.', 'Два года.', 'Two years.')]],
        feedback: t('Відповідай про оплату: **kartą** чи **gotówką**.', 'Отвечай об оплате: **kartą** или **gotówką**.', 'Answer about payment: **kartą** or **gotówką**.') },
      { npc: 'Proszę, paragon. Miłego dnia!', tr: t('Прошу, чек. Гарного дня!', 'Вот чек. Хорошего дня!', 'Here\'s your receipt. Have a nice day!') },
    ], { situation: true, scene: t('Місія, крок 3: каса в крамниці біля дому.', 'Миссия, шаг 3: касса в магазине у дома.', 'Mission, step 3: the checkout at the local shop.') }),
    translate('writing.shop', t('Пів кіло яблук, будь ласка.', 'Полкило яблок, пожалуйста.', 'Half a kilo of apples, please.'), ['Poproszę pół kilo jabłek', 'Pół kilo jabłek, proszę', 'Proszę pół kilo jabłek']),
    dictation('writing.prices', 'Ile kosztują jajka', t('Скільки коштують яйця?', 'Сколько стоят яйца?', 'How much are the eggs?')),
    wordChoice('vocab.numbers', 'dziewięćdziesiąt', [t('90', '90', '90'), t('19', '19', '19'), t('9', '9', '9')]),
    speak('speaking.shop', 'Poproszę kilogram jabłek i to wszystko', t('Кілограм яблук, будь ласка, і це все', 'Килограмм яблок, пожалуйста, и это всё', 'A kilo of apples, please, and that\'s all')),
  ],
};
