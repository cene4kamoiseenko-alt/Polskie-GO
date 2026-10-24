/**
 * Місії «Польська в житті»: короткі історії з метою та послідовними кроками.
 * Назви мереж і магазинів — лише контекст навчальних ситуацій (без партнерства);
 * усі ціни — навчальні, не актуальні.
 *
 * Типи кроків:
 *  - listen — репліку спершу чути без тексту, треба обрати зміст;
 *  - choice — відповісти співрозмовнику, обравши фразу;
 *  - build  — скласти фразу зі слів.
 * Помилка показує пояснення і дає спробувати ще раз (історія не починається заново).
 */
import type { I18n } from '@polski-go/shared';
import { t } from './builders';

export type MissionLine = { who: 'npc' | 'beaver' | 'narrator'; pl: string; tr: I18n; hidden?: boolean };
export type MissionOption = { pl?: string; text?: I18n; ok: boolean; why?: I18n };
export type MissionStep = {
  id: string;
  kind: 'listen' | 'choice' | 'build';
  line?: MissionLine;
  task: I18n;
  options?: MissionOption[];
  /** build: правильна фраза (і допустимі варіанти) та зайві слова-пастки. */
  answer?: string;
  accept?: string[];
  extra?: string[];
  hint: I18n;
  explain: I18n;
  /** Слова словника, що потрапляють у повторення після місії. */
  words?: string[];
  /** Теги ситуацій для досягнень: city-transport, dish:<страва>. */
  tags?: string[];
};
export type MissionCategory = 'shop' | 'food' | 'road' | 'transport' | 'home' | 'work';
export type Mission = {
  slug: string;
  category: MissionCategory;
  /** store — магазинна місія; checkout — діалог покупки на касі. */
  tags: string[];
  city: string;
  scene: string;
  npc: { name: string; role: I18n };
  title: I18n;
  goal: I18n;
  intro: I18n;
  /** Довідка: що це за місце чи страва (перевірені факти). */
  note?: I18n;
  minutes: number;
  xp: number;
  zlotki: number;
  steps: MissionStep[];
  phrases: { pl: string; tr: I18n }[];
};

const npc = (pl: string, uk: string, ru: string, en: string, hidden = false): MissionLine => ({ who: 'npc', pl, tr: t(uk, ru, en), hidden });
const narr = (pl: string, uk: string, ru: string, en: string): MissionLine => ({ who: 'narrator', pl, tr: t(uk, ru, en) });
const P = (pl: string, ok = false, why?: I18n): MissionOption => ({ pl, ok, why });
const T = (text: I18n, ok = false, why?: I18n): MissionOption => ({ text, ok, why });
const ph = (pl: string, uk: string, ru: string, en: string) => ({ pl, tr: t(uk, ru, en) });
type Extra = { hint: I18n; explain: I18n; words?: string[]; tags?: string[] };
const listen = (id: string, line: MissionLine, task: I18n, options: MissionOption[], x: Extra): MissionStep => ({ id, kind: 'listen', line: { ...line, hidden: true }, task, options, ...x });
const choice = (id: string, line: MissionLine | undefined, task: I18n, options: MissionOption[], x: Extra): MissionStep => ({ id, kind: 'choice', line, task, options, ...x });
const build = (id: string, line: MissionLine | undefined, task: I18n, answer: string, extra: string[], x: Extra & { accept?: string[] }): MissionStep => ({
  id, kind: 'build', line, task, answer, extra, ...x,
});

const AMOUNT_TASK = t('Скільки треба заплатити? (навчальна сума)', 'Сколько нужно заплатить? (учебная сумма)', 'How much to pay? (practice amount)');

export const MISSIONS: Mission[] = [
  // ───────────── 1. Żabka ─────────────
  {
    slug: 'zabka-first-order', category: 'shop', tags: ['store', 'checkout'], city: 'warszawa', scene: 'shop-corner',
    npc: { name: 'Ola', role: t('касирка', 'кассирша', 'cashier') },
    title: t('Перше замовлення в Żabce', 'Первый заказ в Żabce', 'First order at Żabka'),
    goal: t('Замов хот-дог і воду, зрозумій суму та оплати.', 'Закажи хот-дог и воду, пойми сумму и оплати.', 'Order a hot dog and water, understand the total and pay.'),
    intro: t('Бобек зголоднів дорогою до зупинки й зайшов у маленький магазин біля дому.', 'Бобек проголодался по дороге к остановке и зашёл в маленький магазин у дома.', 'Bobek got hungry on the way to the stop and popped into a small shop.'),
    note: t('Żabka — мережа невеликих магазинів біля дому; там часто купують перекус і каву. Назва — лише контекст навчальної ситуації.', 'Żabka — сеть небольших магазинов у дома; там часто покупают перекус и кофе. Название — лишь контекст учебной ситуации.', 'Żabka is a chain of small convenience stores. The name is used only as learning context.'),
    minutes: 4, xp: 40, zlotki: 20,
    steps: [
      listen('greet', npc('Dzień dobry! W czym mogę pomóc?', 'Добрий день! Чим можу допомогти?', 'Добрый день! Чем могу помочь?', 'Hello! How can I help?'),
        t('Послухай касирку. Що вона питає?', 'Послушай кассиршу. Что она спрашивает?', 'Listen to the cashier. What does she ask?'),
        [
          T(t('Чим можу допомогти?', 'Чем могу помочь?', 'How can I help?'), true),
          T(t('Вам потрібен пакет?', 'Вам нужен пакет?', 'Do you need a bag?'), false, t('Про пакет питають наприкінці покупки.', 'О пакете спрашивают в конце покупки.', 'They ask about a bag at the end.')),
          T(t('Скільки вам років?', 'Сколько вам лет?', 'How old are you?')),
        ],
        { hint: t('Ключові слова: «mogę pomóc» — можу допомогти.', 'Ключевые слова: «mogę pomóc» — могу помочь.', 'Key words: «mogę pomóc» — can help.'), explain: t('«W czym mogę pomóc?» — типове питання продавця: «Чим можу допомогти?»', '«W czym mogę pomóc?» — типичный вопрос продавца: «Чем могу помочь?»', '«W czym mogę pomóc?» is the typical shop assistant question.'), words: ['dzień dobry'] }),
      build('order', undefined, t('Склади замовлення: «Хот-дог і воду, будь ласка».', 'Составь заказ: «Хот-дог и воду, пожалуйста».', 'Build the order: “A hot dog and water, please.”'),
        'Poproszę hot doga i wodę.', ['woda', 'hot dog'],
        { hint: t('Починай з «Poproszę…», далі знахідний відмінок: wodę, hot doga.', 'Начни с «Poproszę…», дальше винительный падеж: wodę, hot doga.', 'Start with «Poproszę…», then the accusative: wodę, hot doga.'),
          explain: t('Після «poproszę» — знахідний відмінок: woda → wodę, hot dog → hot doga (так кажуть у розмові).', 'После «poproszę» — винительный падеж: woda → wodę, hot dog → hot doga (так говорят в разговоре).', 'After «poproszę» use the accusative: woda → wodę, hot dog → hot doga.'),
          words: ['poproszę', 'hot dog', 'woda'] }),
      choice('sauce', npc('Z jakim sosem?', 'З яким соусом?', 'С каким соусом?', 'Which sauce?'),
        t('Касирка питає про соус. Відповідай.', 'Кассирша спрашивает о соусе. Ответь.', 'The cashier asks about the sauce. Answer.'),
        [
          P('Z sosem czosnkowym, poproszę.', true),
          P('Bez sosu, dziękuję.', true),
          P('Z wodą.', false, t('Вода — це напій, а питають про соус (sos).', 'Вода — это напиток, а спрашивают о соусе (sos).', 'Water is a drink; she asks about the sauce (sos).')),
        ],
        { hint: t('Sos — соус. «Z sosem…» або «Bez sosu».', 'Sos — соус. «Z sosem…» или «Bez sosu».', 'Sos = sauce. «Z sosem…» or «Bez sosu».'), explain: t('«Z jakim sosem?» — «З яким соусом?». Можна обрати соус (z sosem czosnkowym — з часниковим) або відмовитися (bez sosu).', '«Z jakim sosem?» — «С каким соусом?». Можно выбрать соус (z sosem czosnkowym — с чесночным) или отказаться (bez sosu).', '«Z jakim sosem?» — “Which sauce?” Choose one or say «bez sosu».'), words: ['sos'] }),
      choice('water', npc('Woda gazowana czy niegazowana?', 'Вода газована чи негазована?', 'Вода газированная или негазированная?', 'Sparkling or still water?'),
        t('Обери воду.', 'Выбери воду.', 'Choose the water.'),
        [
          P('Niegazowana, poproszę.', true),
          P('Gazowana, poproszę.', true),
          P('Tak, poproszę.', false, t('Це питання «або-або»: треба обрати gazowana (газована) чи niegazowana (негазована).', 'Это вопрос «или-или»: нужно выбрать gazowana (газированная) или niegazowana (негазированная).', 'It’s an either/or question: pick gazowana or niegazowana.')),
        ],
        { hint: t('«czy» тут означає «чи/або».', '«czy» здесь значит «или».', '«czy» here means “or”.'), explain: t('gazowana — газована, niegazowana — без газу.', 'gazowana — газированная, niegazowana — без газа.', 'gazowana = sparkling, niegazowana = still.'), words: ['gazowana', 'niegazowana'] }),
      listen('total', npc('Razem dwanaście złotych pięćdziesiąt groszy.', 'Разом дванадцять злотих п’ятдесят грошів.', 'Итого двенадцать злотых пятьдесят грошей.', 'Twelve złoty fifty in total.'),
        AMOUNT_TASK,
        [
          T(t('12,50 zł'), true),
          T(t('20,50 zł'), false, t('dwadzieścia = 20, а тут dwanaście = 12.', 'dwadzieścia = 20, а здесь dwanaście = 12.', 'dwadzieścia = 20, but you heard dwanaście = 12.')),
          T(t('2,50 zł'), false, t('dwa = 2, а dwanaście = 12.', 'dwa = 2, а dwanaście = 12.', 'dwa = 2, dwanaście = 12.')),
        ],
        { hint: t('dwanaście — 12, pięćdziesiąt — 50.', 'dwanaście — 12, pięćdziesiąt — 50.', 'dwanaście = 12, pięćdziesiąt = 50.'), explain: t('«Razem» — разом, загалом. dwanaście złotych pięćdziesiąt groszy = 12,50 zł.', '«Razem» — итого. dwanaście złotych pięćdziesiąt groszy = 12,50 zł.', '«Razem» = in total. 12,50 zł.'), words: ['razem', 'dwanaście', 'pięćdziesiąt', 'złoty', 'grosz'] }),
      choice('pay', npc('Kartą czy gotówką?', 'Карткою чи готівкою?', 'Картой или наличными?', 'Card or cash?'),
        t('Обери спосіб оплати.', 'Выбери способ оплаты.', 'Choose how to pay.'),
        [
          P('Kartą.', true),
          P('Gotówką.', true),
          P('Kartę.', false, t('Відповідаємо орудним відмінком: płacę kartą / gotówką.', 'Отвечаем творительным падежом: płacę kartą / gotówką.', 'Use the instrumental: kartą / gotówką.')),
        ],
        { hint: t('Як у питанні: kartą чи gotówką.', 'Как в вопросе: kartą или gotówką.', 'Same form as the question: kartą or gotówką.'), explain: t('Płacić (czym?) kartą — карткою, gotówką — готівкою.', 'Płacić (чем?) kartą — картой, gotówką — наличными.', 'Pay (with what?) kartą / gotówką.'), words: ['karta', 'gotówka'] }),
      choice('bye', npc('Proszę bardzo. Paragon?', 'Прошу. Чек потрібен?', 'Пожалуйста. Чек нужен?', 'Here you go. Receipt?'),
        t('Заверши діалог ввічливо.', 'Заверши диалог вежливо.', 'End the conversation politely.'),
        [
          P('Nie, dziękuję. Miłego dnia!', true),
          P('Tak, poproszę. Do widzenia!', true),
          P('Smacznego!', false, t('«Smacznego» кажуть тому, хто їсть. Касирці подякуй: «Dziękuję!»', '«Smacznego» говорят тому, кто ест. Кассирше скажи «Dziękuję!»', '«Smacznego» is said to someone eating. Thank the cashier instead.')),
        ],
        { hint: t('Подякуй (dziękuję) і попрощайся.', 'Поблагодари (dziękuję) и попрощайся.', 'Say thanks (dziękuję) and goodbye.'), explain: t('Paragon — чек. «Miłego dnia!» — «Гарного дня!»', 'Paragon — чек. «Miłego dnia!» — «Хорошего дня!»', 'Paragon = receipt. «Miłego dnia!» = Have a nice day!'), words: ['paragon', 'dziękuję', 'do widzenia'] }),
    ],
    phrases: [
      ph('W czym mogę pomóc?', 'Чим можу допомогти?', 'Чем могу помочь?', 'How can I help?'),
      ph('Poproszę hot doga i wodę.', 'Хот-дог і воду, будь ласка.', 'Хот-дог и воду, пожалуйста.', 'A hot dog and water, please.'),
      ph('Z sosem czosnkowym.', 'З часниковим соусом.', 'С чесночным соусом.', 'With garlic sauce.'),
      ph('Woda niegazowana.', 'Негазована вода.', 'Негазированная вода.', 'Still water.'),
      ph('Kartą czy gotówką?', 'Карткою чи готівкою?', 'Картой или наличными?', 'Card or cash?'),
      ph('Miłego dnia!', 'Гарного дня!', 'Хорошего дня!', 'Have a nice day!'),
    ],
  },

  // ───────────── 2. Pierogi w Krakowie ─────────────
  {
    slug: 'krakow-pierogi', category: 'food', tags: ['restaurant'], city: 'krakow', scene: 'cafe-pierogi',
    npc: { name: 'Marta', role: t('офіціантка', 'официантка', 'waitress') },
    title: t('Pierogi у Кракові', 'Pierogi в Кракове', 'Pierogi in Kraków'),
    goal: t('Попроси меню, обери начинку, замов żurek і попроси рахунок.', 'Попроси меню, выбери начинку, закажи żurek и попроси счёт.', 'Ask for the menu, choose a filling, order żurek and ask for the bill.'),
    intro: t('Бобек зайшов у маленьку pierogarnię біля Старого міста. Пахне смаженою цибулькою!', 'Бобек зашёл в маленькую pierogarnię у Старого города. Пахнет жареным луком!', 'Bobek walks into a small pierogi bar near the Old Town.'),
    note: t('Pierogi — польські вареники. «Ruskie» — з картоплею, сиром twaróg і цибулею; назва пов’язана з історичною Руссю (Галичиною), а не з Росією.', 'Pierogi — польские вареники. «Ruskie» — с картошкой, творогом и луком; название связано с исторической Русью (Галицией), а не с Россией.', 'Pierogi ruskie are filled with potato, twaróg cheese and onion; the name refers to historical Ruthenia.'),
    minutes: 5, xp: 45, zlotki: 20,
    steps: [
      choice('table', npc('Dzień dobry! Na miejscu czy na wynos?', 'Добрий день! Тут чи з собою?', 'Добрый день! Здесь или с собой?', 'Hello! For here or to go?'),
        t('Ти хочеш поїсти тут і подивитися меню.', 'Ты хочешь поесть здесь и посмотреть меню.', 'You want to eat here and see the menu.'),
        [
          P('Na miejscu, poproszę. Czy mogę prosić menu?', true),
          P('Poproszę rachunek.', false, t('Рахунок просять наприкінці. Спершу — меню: «Czy mogę prosić menu?»', 'Счёт просят в конце. Сначала — меню: «Czy mogę prosić menu?»', 'The bill comes at the end. First ask for the menu.')),
          P('Dobranoc!', false, t('«Dobranoc» — «на добраніч», так прощаються перед сном.', '«Dobranoc» — «спокойной ночи», так прощаются перед сном.', '«Dobranoc» means good night.')),
        ],
        { hint: t('na miejscu — тут, на місці; menu — меню.', 'na miejscu — здесь; menu — меню.', 'na miejscu = for here.'), explain: t('«Na miejscu czy na wynos?» — «Тут чи з собою?». «Czy mogę prosić menu?» — «Можна меню?»', '«Na miejscu czy na wynos?» — «Здесь или с собой?». «Czy mogę prosić menu?» — «Можно меню?»', '«Czy mogę prosić menu?» = May I have the menu?'), words: ['na miejscu', 'menu'] }),
      listen('fillings', npc('Mamy pierogi ruskie, z mięsem i z kapustą i grzybami.', 'Маємо pierogi руські, з м’ясом і з капустою та грибами.', 'У нас pierogi русские, с мясом и с капустой и грибами.', 'We have ruskie, meat, and cabbage-and-mushroom pierogi.'),
        t('Які начинки назвала офіціантка?', 'Какие начинки назвала официантка?', 'Which fillings did she list?'),
        [
          T(t('картопля із сиром, м’ясо, капуста з грибами', 'картошка с творогом, мясо, капуста с грибами', 'potato & cheese, meat, cabbage & mushrooms'), true),
          T(t('вишня, полуниця, чорниця', 'вишня, клубника, черника', 'cherry, strawberry, blueberry')),
          T(t('риба, курка, сир', 'рыба, курица, сыр', 'fish, chicken, cheese')),
        ],
        { hint: t('Почуй «z mięsem» і «z kapustą i grzybami».', 'Услышь «z mięsem» и «z kapustą i grzybami».', 'Listen for «z mięsem» and «z kapustą i grzybami».'), explain: t('ruskie — з картоплею та сиром, z mięsem — з м’ясом, z kapustą i grzybami — з капустою і грибами.', 'ruskie — с картошкой и творогом, z mięsem — с мясом, z kapustą i grzybami — с капустой и грибами.', 'ruskie = potato & cheese, z mięsem = meat, z kapustą i grzybami = cabbage & mushrooms.'),
          words: ['pierogi', 'ruskie', 'z mięsem', 'z kapustą i grzybami'], tags: ['dish:pierogi'] }),
      choice('meat', undefined, t('Бобек не їсть м’яса. Запитай, чи є м’ясо в pierogi з капустою і грибами.', 'Бобек не ест мяса. Спроси, есть ли мясо в pierogi с капустой и грибами.', 'Bobek doesn’t eat meat. Ask if the cabbage pierogi contain meat.'),
        [
          P('Czy w pierogach z kapustą i grzybami jest mięso?', true),
          P('Gdzie jest mięso?', false, t('Так питають, де лежить м’ясо. Потрібно: «Czy w … jest mięso?» — «Чи є в … м’ясо?»', 'Так спрашивают, где лежит мясо. Нужно: «Czy w … jest mięso?»', 'That asks where the meat is. Use «Czy w … jest mięso?»')),
          P('Mam mięso.', false, t('«Mam mięso» — «У мене є м’ясо».', '«Mam mięso» — «У меня есть мясо».', '«Mam mięso» = I have meat.')),
        ],
        { hint: t('Питання починається з «Czy…».', 'Вопрос начинается с «Czy…».', 'The question starts with «Czy…».'), explain: t('«Czy» перетворює речення на питання так/ні: «Czy … jest mięso?» — «Чи є … м’ясо?»', '«Czy» делает вопрос да/нет: «Czy … jest mięso?» — «Есть ли … мясо?»', '«Czy» makes a yes/no question.'), words: ['bez mięsa'], tags: ['dish:pierogi'] }),
      choice('cooking', npc('Nie, są bez mięsa. Porcja to osiem sztuk. Gotowane czy smażone?', 'Ні, вони без м’яса. Порція — вісім штук. Варені чи смажені?', 'Нет, они без мяса. Порция — восемь штук. Варёные или жареные?', 'No, they are meat-free. A portion is eight. Boiled or fried?'),
        t('Обери, як приготувати pierogi.', 'Выбери, как приготовить pierogi.', 'Choose how to have them cooked.'),
        [
          P('Smażone, poproszę.', true),
          P('Gotowane, poproszę.', true),
          P('Z mięsem.', false, t('Питають про спосіб приготування: gotowane — варені, smażone — смажені.', 'Спрашивают о способе приготовления: gotowane — варёные, smażone — жареные.', 'She asks how they are cooked: gotowane or smażone.')),
        ],
        { hint: t('gotowane — варені, smażone — смажені.', 'gotowane — варёные, smażone — жареные.', 'gotowane = boiled, smażone = fried.'), explain: t('Pierogi подають варені (gotowane) або підсмажені (smażone).', 'Pierogi подают варёные (gotowane) или поджаренные (smażone).', 'Pierogi come boiled or fried.'), words: ['porcja', 'gotowane', 'smażone'], tags: ['dish:pierogi'] }),
      build('zurek', undefined, t('Замов ще суп żurek: «І ще żurek, будь ласка».', 'Закажи ещё суп żurek: «И ещё żurek, пожалуйста».', 'Also order żurek: “And a żurek too, please.”'),
        'I jeszcze żurek, poproszę.', ['żurku', 'jest'],
        { hint: t('«I jeszcze…» — «І ще…»', '«I jeszcze…» — «И ещё…»', '«I jeszcze…» = and also…'), explain: t('Żurek — кислий суп на заквасці з житнього борошна, часто з білою ковбасою та яйцем.', 'Żurek — кислый суп на закваске из ржаной муки, часто с белой колбасой и яйцом.', 'Żurek is a sour rye soup, often with white sausage and egg.'),
          words: ['żurek'], tags: ['dish:zurek'], accept: ['I jeszcze poproszę żurek.'] }),
      choice('allergy', npc('Czy coś jeszcze?', 'Щось іще?', 'Что-нибудь ещё?', 'Anything else?'),
        t('Навчальна ситуація: скажи, що в тебе алергія на горіхи.', 'Учебная ситуация: скажи, что у тебя аллергия на орехи.', 'Practice: say you are allergic to nuts.'),
        [
          P('Jestem uczulony na orzechy.', true),
          P('Jestem uczulona na orzechy.', true),
          P('Mam orzechy.', false, t('«Mam orzechy» — «У мене є горіхи». Алергія: «jestem uczulony / uczulona na…».', '«Mam orzechy» — «У меня есть орехи». Аллергия: «jestem uczulony / uczulona na…».', '«Mam orzechy» = I have nuts.')),
        ],
        { hint: t('uczulony (він) / uczulona (вона) na + знахідний.', 'uczulony (он) / uczulona (она) na + винительный.', 'uczulony (m) / uczulona (f) na + accusative.'), explain: t('Чоловік каже «jestem uczulony», жінка — «jestem uczulona». Обидва варіанти правильні.', 'Мужчина говорит «jestem uczulony», женщина — «jestem uczulona». Оба варианта верны.', 'Men say uczulony, women uczulona.'), words: ['uczulony', 'orzechy'] }),
      choice('bill', narr('Pierogi były pyszne!', 'Pierogi були смачнющі!', 'Pierogi были очень вкусные!', 'The pierogi were delicious!'),
        t('Ти поїв. Попроси рахунок.', 'Ты поел. Попроси счёт.', 'You’ve eaten. Ask for the bill.'),
        [
          P('Poproszę rachunek.', true),
          P('Poproszę menu.', false, t('Меню вже не потрібне — проси rachunek (рахунок).', 'Меню уже не нужно — проси rachunek (счёт).', 'You need the bill (rachunek), not the menu.')),
          P('Smacznego!', false, t('«Smacznego» бажають перед їжею іншим людям.', '«Smacznego» желают другим перед едой.', '«Smacznego» is said before others eat.')),
        ],
        { hint: t('rachunek — рахунок.', 'rachunek — счёт.', 'rachunek = bill.'), explain: t('«Poproszę rachunek» — «Рахунок, будь ласка».', '«Poproszę rachunek» — «Счёт, пожалуйста».', '«Poproszę rachunek» = The bill, please.'), words: ['rachunek'] }),
    ],
    phrases: [
      ph('Czy mogę prosić menu?', 'Можна меню?', 'Можно меню?', 'May I have the menu?'),
      ph('Pierogi ruskie', 'Pierogi з картоплею і сиром', 'Pierogi с картошкой и творогом', 'Potato & cheese pierogi'),
      ph('Czy w pierogach jest mięso?', 'Чи є м’ясо в pierogi?', 'Есть ли мясо в pierogi?', 'Is there meat in the pierogi?'),
      ph('Smażone, poproszę.', 'Смажені, будь ласка.', 'Жареные, пожалуйста.', 'Fried, please.'),
      ph('I jeszcze żurek, poproszę.', 'І ще żurek, будь ласка.', 'И ещё żurek, пожалуйста.', 'And a żurek too, please.'),
      ph('Jestem uczulony na orzechy.', 'У мене алергія на горіхи.', 'У меня аллергия на орехи.', 'I am allergic to nuts.'),
      ph('Poproszę rachunek.', 'Рахунок, будь ласка.', 'Счёт, пожалуйста.', 'The bill, please.'),
    ],
  },

  // ───────────── 3. Biedronka ─────────────
  {
    slug: 'biedronka-breakfast', category: 'shop', tags: ['store', 'checkout'], city: 'poznan', scene: 'supermarket',
    npc: { name: 'Pan Tomek', role: t('працівник магазину', 'сотрудник магазина', 'shop assistant') },
    title: t('Сніданок з Biedronki', 'Завтрак из Biedronki', 'Breakfast from Biedronka'),
    goal: t('Знайди parówki, порівняй ціни за кілограм і розрахуйся на касі.', 'Найди parówki, сравни цены за килограмм и рассчитайся на кассе.', 'Find parówki, compare prices per kilo and pay.'),
    intro: t('Ранок у Познані. Бобек купує все для сніданку: parówki, помідори, хліб і масло.', 'Утро в Познани. Бобек покупает всё для завтрака: parówki, помидоры, хлеб и масло.', 'Morning in Poznań. Bobek buys breakfast.'),
    note: t('Biedronka — мережа супермаркетів. Parówki — тонкі сосиски, які купують упаковками й варять або гріють на сніданок. Ціни в місії навчальні.', 'Biedronka — сеть супермаркетов. Parówki — тонкие сосиски, которые покупают упаковками и варят на завтрак. Цены в миссии учебные.', 'Biedronka is a supermarket chain. Parówki are thin sausages bought in packs. Prices are for practice.'),
    minutes: 5, xp: 45, zlotki: 20,
    steps: [
      choice('where', undefined, t('Запитай працівника, де parówki.', 'Спроси сотрудника, где parówki.', 'Ask the assistant where the parówki are.'),
        [
          P('Przepraszam, gdzie są parówki?', true),
          P('Przepraszam, gdzie jest parówki?', false, t('Parówki — множина, тому «są»: «gdzie są parówki?»', 'Parówki — множественное число, поэтому «są»: «gdzie są parówki?»', 'Parówki is plural, so use «są».')),
          P('Poproszę parówki.', false, t('Ти не біля прилавка — спершу запитай, де вони: «Gdzie są…?»', 'Ты не у прилавка — сначала спроси, где они: «Gdzie są…?»', 'You are not at a counter — ask where they are.')),
        ],
        { hint: t('Для множини: gdzie są…?', 'Для множественного числа: gdzie są…?', 'Plural: gdzie są…?'), explain: t('gdzie jest + однина, gdzie są + множина.', 'gdzie jest + единственное, gdzie są + множественное.', 'jest for singular, są for plural.'), words: ['parówki', 'przepraszam', 'gdzie'], tags: ['dish:parowki'] }),
      listen('fridge', npc('Parówki są w lodówce, obok sera.', 'Parówki в холодильнику, поруч із сиром.', 'Parówki в холодильнике, рядом с сыром.', 'The parówki are in the fridge, next to the cheese.'),
        t('Де лежать parówki?', 'Где лежат parówki?', 'Where are the parówki?'),
        [
          T(t('у холодильнику, поруч із сиром', 'в холодильнике, рядом с сыром', 'in the fridge, next to the cheese'), true),
          T(t('біля хліба, на полиці', 'у хлеба, на полке', 'by the bread, on a shelf')),
          T(t('біля каси', 'у кассы', 'by the checkout')),
        ],
        { hint: t('lodówka — холодильник, obok — поруч.', 'lodówka — холодильник, obok — рядом.', 'lodówka = fridge, obok = next to.'), explain: t('w lodówce — у холодильнику; obok sera — поруч із сиром.', 'w lodówce — в холодильнике; obok sera — рядом с сыром.', 'w lodówce = in the fridge; obok sera = next to the cheese.'), words: ['lodówka', 'obok', 'ser'], tags: ['dish:parowki'] }),
      choice('compare', narr('Parówki A: 9,99 zł za 400 g. Parówki B: 7,49 zł za 250 g.', 'Parówki A: 9,99 zł за 400 г. Parówki B: 7,49 zł за 250 г.', 'Parówki A: 9,99 zł за 400 г. Parówki B: 7,49 zł за 250 г.', 'Parówki A: 9.99 zł for 400 g. Parówki B: 7.49 zł for 250 g.'),
        t('Що дешевше за кілограм? (навчальні ціни)', 'Что дешевле за килограмм? (учебные цены)', 'Which is cheaper per kilo? (practice prices)'),
        [
          T(t('A — приблизно 25 zł за кілограм', 'A — примерно 25 zł за килограмм', 'A — about 25 zł per kilo'), true),
          T(t('B — приблизно 30 zł за кілограм', 'B — примерно 30 zł за килограмм', 'B — about 30 zł per kilo'), false, t('B: 7,49 zł × 4 ≈ 29,96 zł/кг. A: 9,99 zł × 2,5 ≈ 24,98 zł/кг — дешевше.', 'B: 7,49 zł × 4 ≈ 29,96 zł/кг. A: 9,99 zł × 2,5 ≈ 24,98 zł/кг — дешевле.', 'B ≈ 29.96 zł/kg, A ≈ 24.98 zł/kg.')),
          T(t('однаково', 'одинаково', 'the same')),
        ],
        { hint: t('Порахуй ціну за 1000 г: A × 2,5, B × 4.', 'Посчитай цену за 1000 г: A × 2,5, B × 4.', 'Scale to 1000 g: A × 2.5, B × 4.'), explain: t('На цінниках у Польщі часто є ціна за кілограм — «cena za kg». Так легко порівнювати.', 'На ценниках в Польше часто указана цена за килограмм — «cena za kg».', 'Price tags often show «cena za kg».'), words: ['kilogram'] }),
      listen('tomatoes', npc('Pomidory kosztują osiem złotych za kilogram.', 'Помідори коштують вісім злотих за кілограм.', 'Помидоры стоят восемь злотых за килограмм.', 'Tomatoes cost eight złoty per kilo.'),
        t('Скільки коштують помідори? (навчальна ціна)', 'Сколько стоят помидоры? (учебная цена)', 'How much are the tomatoes? (practice price)'),
        [
          T(t('8 zł за кілограм', '8 zł за килограмм', '8 zł per kilo'), true),
          T(t('18 zł за кілограм', '18 zł за килограмм', '18 zł per kilo'), false, t('osiem = 8, osiemnaście = 18.', 'osiem = 8, osiemnaście = 18.', 'osiem = 8, osiemnaście = 18.')),
          T(t('8 zł за штуку', '8 zł за штуку', '8 zł each'), false, t('«za kilogram» — за кілограм, а не за штуку.', '«za kilogram» — за килограмм, а не за штуку.', '«za kilogram» = per kilo.')),
        ],
        { hint: t('osiem — 8.', 'osiem — 8.', 'osiem = 8.'), explain: t('osiem złotych za kilogram — 8 zł за кілограм.', 'osiem złotych za kilogram — 8 zł за килограмм.', '8 zł per kilo.'), words: ['pomidor', 'osiem'] }),
      build('more', undefined, t('Склади: «Візьму ще хліб і масло».', 'Составь: «Возьму ещё хлеб и масло».', 'Build: “I’ll also take bread and butter.”'),
        'Wezmę jeszcze chleb i masło.', ['chleba', 'masła'],
        { hint: t('wezmę — візьму, далі знахідний: chleb, masło (не змінюються).', 'wezmę — возьму, дальше винительный: chleb, masło (не меняются).', 'wezmę = I’ll take; chleb, masło stay the same.'), explain: t('Після «wezmę» — знахідний відмінок. Для chleb і masło він збігається з називним.', 'После «wezmę» — винительный падеж. Для chleb и masło он совпадает с именительным.', 'After «wezmę» use accusative; chleb and masło don’t change.'), words: ['chleb', 'masło'] }),
      choice('bag', npc('Torba potrzebna?', 'Пакет потрібен?', 'Пакет нужен?', 'Need a bag?'),
        t('Відповідай касирці.', 'Ответь кассирше.', 'Answer the cashier.'),
        [
          P('Nie, dziękuję, mam swoją.', true),
          P('Tak, poproszę jedną.', true),
          P('Tak, poproszę jeden.', false, t('Torba — жіночий рід: jedna torba → poproszę jedną.', 'Torba — женский род: jedna torba → poproszę jedną.', 'Torba is feminine: poproszę jedną.')),
        ],
        { hint: t('torba — вона (жіночий рід).', 'torba — она (женский род).', 'torba is feminine.'), explain: t('«Mam swoją» — «Маю свою». Torba — пакет або сумка.', '«Mam swoją» — «У меня своя». Torba — пакет или сумка.', '«Mam swoją» = I have my own.'), words: ['torba'] }),
      listen('total', npc('Razem dwadzieścia trzy złote czterdzieści groszy.', 'Разом двадцять три злоті сорок грошів.', 'Итого двадцать три злотых сорок грошей.', 'Twenty-three złoty forty in total.'),
        AMOUNT_TASK,
        [
          T(t('23,40 zł'), true),
          T(t('33,40 zł'), false, t('trzydzieści = 30, а тут dwadzieścia = 20.', 'trzydzieści = 30, а здесь dwadzieścia = 20.', 'trzydzieści = 30, but you heard dwadzieścia = 20.')),
          T(t('23,14 zł'), false, t('czterdzieści = 40, czternaście = 14.', 'czterdzieści = 40, czternaście = 14.', 'czterdzieści = 40, czternaście = 14.')),
        ],
        { hint: t('dwadzieścia trzy — 23, czterdzieści — 40.', 'dwadzieścia trzy — 23, czterdzieści — 40.', '23 and 40.'), explain: t('Після 2, 3, 4 кажуть «złote»: dwa złote, dwadzieścia trzy złote; після 5+ — «złotych».', 'После 2, 3, 4 говорят «złote»: dwa złote, dwadzieścia trzy złote; после 5+ — «złotych».', 'After 2–4: złote; after 5+: złotych.'), words: ['dwadzieścia', 'trzy'] }),
      choice('bye', npc('Proszę paragon. Do widzenia!', 'Ось чек. До побачення!', 'Вот чек. До свидания!', 'Here’s your receipt. Goodbye!'),
        t('Попрощайся.', 'Попрощайся.', 'Say goodbye.'),
        [
          P('Dziękuję, do widzenia!', true),
          P('Dzień dobry!', false, t('Це привітання. Прощаються: «Do widzenia!»', 'Это приветствие. Прощаются: «Do widzenia!»', 'That’s a greeting. Say «Do widzenia!»')),
          P('Smacznego!', false, t('«Smacznego» — «Смачного», не для прощання.', '«Smacznego» — «Приятного аппетита».', '«Smacznego» = enjoy your meal.')),
        ],
        { hint: t('do widzenia — до побачення.', 'do widzenia — до свидания.', 'do widzenia = goodbye.'), explain: t('«Dziękuję, do widzenia!» — універсальне прощання в магазині.', '«Dziękuję, do widzenia!» — универсальное прощание в магазине.', 'A universal goodbye in a shop.'), words: ['do widzenia'] }),
    ],
    phrases: [
      ph('Przepraszam, gdzie są parówki?', 'Перепрошую, де сосиски?', 'Извините, где сосиски?', 'Excuse me, where are the frankfurters?'),
      ph('w lodówce, obok sera', 'у холодильнику, поруч із сиром', 'в холодильнике, рядом с сыром', 'in the fridge, next to the cheese'),
      ph('osiem złotych za kilogram', 'вісім злотих за кілограм', 'восемь злотых за килограмм', 'eight złoty per kilo'),
      ph('Wezmę jeszcze chleb i masło.', 'Візьму ще хліб і масло.', 'Возьму ещё хлеб и масло.', 'I’ll also take bread and butter.'),
      ph('Nie, dziękuję, mam swoją.', 'Ні, дякую, маю свою.', 'Нет, спасибо, у меня своя.', 'No thanks, I have my own.'),
    ],
  },

  // ───────────── 4. Кава на ORLEN ─────────────
  {
    slug: 'orlen-coffee', category: 'road', tags: ['checkout'], city: 'gdansk', scene: 'petrol-station',
    npc: { name: 'Pan Marek', role: t('касир на заправці', 'кассир на заправке', 'station cashier') },
    title: t('Кава на ORLEN', 'Кофе на ORLEN', 'Coffee at ORLEN'),
    goal: t('Купи каву з собою і запитай дорогу до Ґданська.', 'Купи кофе с собой и спроси дорогу до Гданьска.', 'Buy a coffee to go and ask the way to Gdańsk.'),
    intro: t('Бобек їде до моря й зупинився на заправці перепочити.', 'Бобек едет к морю и остановился на заправке передохнуть.', 'Bobek is driving to the sea and stops at a petrol station.'),
    note: t('ORLEN — польська мережа автозаправок; тут — лише контекст навчальної ситуації.', 'ORLEN — польская сеть автозаправок; здесь — лишь контекст учебной ситуации.', 'ORLEN is a Polish fuel station chain, used here only as context.'),
    minutes: 4, xp: 40, zlotki: 20,
    steps: [
      build('coffee', undefined, t('Попроси: «Велику каву з молоком, будь ласка».', 'Попроси: «Большой кофе с молоком, пожалуйста».', 'Ask: “A large coffee with milk, please.”'),
        'Poproszę dużą kawę z mlekiem.', ['duża', 'mleko'],
        { hint: t('Знахідний: duża kawa → dużą kawę; z + орудний: mlekiem.', 'Винительный: duża kawa → dużą kawę; z + творительный: mlekiem.', 'Accusative dużą kawę; z mlekiem.'), explain: t('Poproszę + знахідний: dużą kawę. «Z mlekiem» — з молоком (орудний відмінок).', 'Poproszę + винительный: dużą kawę. «Z mlekiem» — с молоком.', 'Poproszę dużą kawę z mlekiem.'), words: ['kawa', 'duży', 'mleko'] }),
      choice('togo', npc('Na miejscu czy na wynos?', 'Тут чи з собою?', 'Здесь или с собой?', 'For here or to go?'),
        t('Ти поспішаєш у дорогу.', 'Ты спешишь в дорогу.', 'You are in a hurry.'),
        [
          P('Na wynos, poproszę.', true),
          P('Z mlekiem.', false, t('Питають, тут чи з собою: na miejscu / na wynos.', 'Спрашивают, здесь или с собой: na miejscu / na wynos.', 'They ask: for here or to go.')),
          P('Nie ma za co.', false, t('«Nie ma za co» — відповідь на «дякую».', '«Nie ma za co» — ответ на «спасибо».', '«Nie ma za co» answers “thank you”.')),
        ],
        { hint: t('na wynos — з собою.', 'na wynos — с собой.', 'na wynos = to go.'), explain: t('na wynos — з собою, na miejscu — на місці.', 'na wynos — с собой, na miejscu — на месте.', 'na wynos = to go, na miejscu = for here.'), words: ['na wynos'] }),
      listen('offer', npc('Coś jeszcze? Może hot dog do kawy?', 'Щось іще? Може, хот-дог до кави?', 'Что-нибудь ещё? Может, хот-дог к кофе?', 'Anything else? A hot dog with your coffee?'),
        t('Що пропонує касир?', 'Что предлагает кассир?', 'What is the cashier offering?'),
        [
          T(t('хот-дог до кави', 'хот-дог к кофе', 'a hot dog with the coffee'), true),
          T(t('пакет', 'пакет', 'a bag')),
          T(t('чек', 'чек', 'a receipt')),
        ],
        { hint: t('Почуй «hot dog do kawy».', 'Услышь «hot dog do kawy».', 'Listen for «hot dog do kawy».'), explain: t('«Coś jeszcze?» — «Щось іще?». «Może…?» — «Може…?»', '«Coś jeszcze?» — «Что-нибудь ещё?». «Może…?» — «Может…?»', '«Coś jeszcze?» = anything else?'), words: ['hot dog'] }),
      choice('thatsall', undefined, t('Відмовся: тобі вистачить кави.', 'Откажись: тебе хватит кофе.', 'Decline: coffee is enough.'),
        [
          P('Nie, dziękuję. To wszystko.', true),
          P('Nie ma za co.', false, t('«Nie ma za co» — відповідь на «дякую». Тут: «To wszystko» — «Це все».', '«Nie ma za co» — ответ на «спасибо». Здесь: «To wszystko» — «Это всё».', 'Say «To wszystko» = that’s all.')),
          P('Tak, wszystko.', false, t('Звучить як «так, усе» — касир не зрозуміє, хочеш ти хот-дог чи ні.', 'Звучит как «да, всё» — кассир не поймёт, хочешь ли ты хот-дог.', 'Ambiguous — say «Nie, dziękuję. To wszystko.»')),
        ],
        { hint: t('to wszystko — це все.', 'to wszystko — это всё.', 'to wszystko = that’s all.'), explain: t('«To wszystko» — стандартна фраза, щоб завершити замовлення.', '«To wszystko» — стандартная фраза, чтобы завершить заказ.', 'Standard phrase to finish an order.'), words: ['to wszystko'] }),
      listen('total', npc('Dziewięć złotych dziewięćdziesiąt groszy.', 'Дев’ять злотих дев’яносто грошів.', 'Девять злотых девяносто грошей.', 'Nine złoty ninety.'),
        AMOUNT_TASK,
        [
          T(t('9,90 zł'), true),
          T(t('19,90 zł'), false, t('dziewiętnaście = 19, а тут dziewięć = 9.', 'dziewiętnaście = 19, а здесь dziewięć = 9.', 'dziewiętnaście = 19, you heard dziewięć = 9.')),
          T(t('9,19 zł'), false, t('dziewięćdziesiąt = 90, dziewiętnaście = 19.', 'dziewięćdziesiąt = 90, dziewiętnaście = 19.', 'dziewięćdziesiąt = 90.')),
        ],
        { hint: t('dziewięć — 9, dziewięćdziesiąt — 90.', 'dziewięć — 9, dziewięćdziesiąt — 90.', '9 and 90.'), explain: t('dziewięć złotych dziewięćdziesiąt groszy = 9,90 zł.', 'dziewięć złotych dziewięćdziesiąt groszy = 9,90 zł.', '9,90 zł.'), words: ['dziewięć'] }),
      choice('way', undefined, t('Запитай, як доїхати до Ґданська.', 'Спроси, как доехать до Гданьска.', 'Ask how to get to Gdańsk.'),
        [
          P('Przepraszam, jak dojechać do Gdańska?', true),
          P('Przepraszam, jak dojechać do Gdańsk?', false, t('Після «do» — родовий відмінок: Gdańsk → do Gdańska.', 'После «do» — родительный падеж: Gdańsk → do Gdańska.', 'After «do» use the genitive: do Gdańska.')),
          P('Poproszę Gdańsk.', false, t('Місто не купують 🙂 Запитай: «Jak dojechać do…?»', 'Город не покупают 🙂 Спроси: «Jak dojechać do…?»', 'You can’t buy a city 🙂 Ask «Jak dojechać do…?»')),
        ],
        { hint: t('do + родовий: do Gdańska, do Krakowa.', 'do + родительный: do Gdańska, do Krakowa.', 'do + genitive.'), explain: t('«Jak dojechać do…?» — «Як доїхати до…?» (транспортом).', '«Jak dojechać do…?» — «Как доехать до…?»', '«Jak dojechać do…?» = how do I get to…?'), words: ['dojechać'] }),
      listen('directions', npc('Proszę jechać prosto, a potem w prawo na autostradę.', 'Їдьте прямо, а потім праворуч на автостраду.', 'Поезжайте прямо, а потом направо на автостраду.', 'Go straight, then right onto the motorway.'),
        t('Куди треба їхати?', 'Куда нужно ехать?', 'Which way?'),
        [
          T(t('прямо, потім праворуч на автостраду', 'прямо, потом направо на автостраду', 'straight, then right onto the motorway'), true),
          T(t('ліворуч, потім прямо', 'налево, потом прямо', 'left, then straight'), false, t('w prawo — праворуч, w lewo — ліворуч.', 'w prawo — направо, w lewo — налево.', 'w prawo = right, w lewo = left.')),
          T(t('назад до міста', 'обратно в город', 'back to town')),
        ],
        { hint: t('prosto — прямо, potem — потім, w prawo — праворуч.', 'prosto — прямо, potem — потом, w prawo — направо.', 'prosto, potem, w prawo.'), explain: t('autostrada — автострада. «Proszę jechać…» — ввічливе «Їдьте…».', 'autostrada — автострада. «Proszę jechać…» — вежливое «Поезжайте…».', '«Proszę jechać…» = please drive…'), words: ['prosto', 'w prawo', 'potem', 'autostrada'] }),
    ],
    phrases: [
      ph('Poproszę dużą kawę z mlekiem.', 'Велику каву з молоком, будь ласка.', 'Большой кофе с молоком, пожалуйста.', 'A large coffee with milk, please.'),
      ph('Na wynos, poproszę.', 'З собою, будь ласка.', 'С собой, пожалуйста.', 'To go, please.'),
      ph('To wszystko.', 'Це все.', 'Это всё.', 'That’s all.'),
      ph('Jak dojechać do Gdańska?', 'Як доїхати до Ґданська?', 'Как доехать до Гданьска?', 'How do I get to Gdańsk?'),
    ],
  },

  // ───────────── 5. Колонка номер три ─────────────
  {
    slug: 'orlen-pump', category: 'road', tags: ['checkout'], city: 'gdansk', scene: 'petrol-station',
    npc: { name: 'Pani Kasia', role: t('касирка на заправці', 'кассирша на заправке', 'station cashier') },
    title: t('Колонка номер три', 'Колонка номер три', 'Pump number three'),
    goal: t('Назви номер колонки, обери чек або фактуру й оплати пальне.', 'Назови номер колонки, выбери чек или фактуру и оплати топливо.', 'Name your pump, choose receipt or invoice and pay for fuel.'),
    intro: t('Бобек заправив авто друга на колонці №3 і йде до каси.', 'Бобек заправил машину друга на колонке №3 и идёт к кассе.', 'Bobek filled up at pump 3 and goes to pay.'),
    note: t('Касири часто називають колонки розмовно: jedynka, dwójka, trójka… Сума в місії навчальна.', 'Кассиры часто называют колонки разговорно: jedynka, dwójka, trójka… Сумма в миссии учебная.', 'Cashiers often say jedynka, dwójka, trójka… The amount is for practice.'),
    minutes: 3, xp: 35, zlotki: 15,
    steps: [
      listen('which', npc('Dzień dobry! Który dystrybutor?', 'Добрий день! Яка колонка?', 'Добрый день! Какая колонка?', 'Hello! Which pump?'),
        t('Що питає касирка?', 'Что спрашивает кассирша?', 'What is she asking?'),
        [
          T(t('Яка колонка?', 'Какая колонка?', 'Which pump?'), true),
          T(t('Який бензин?', 'Какой бензин?', 'Which fuel?')),
          T(t('Яка картка?', 'Какая карта?', 'Which card?')),
        ],
        { hint: t('dystrybutor — паливна колонка.', 'dystrybutor — топливная колонка.', 'dystrybutor = fuel pump.'), explain: t('«Który dystrybutor?» — «Яка колонка?»', '«Który dystrybutor?» — «Какая колонка?»', '«Który dystrybutor?» = Which pump?'), words: ['dystrybutor'] }),
      choice('three', undefined, t('Ти заправлявся на колонці №3. Відповідай.', 'Ты заправлялся на колонке №3. Ответь.', 'You used pump 3. Answer.'),
        [
          P('Numer trzy.', true),
          P('Trójka.', true),
          P('Trzydzieści.', false, t('trzydzieści = 30. Колонка три: «numer trzy» або розмовно «trójka».', 'trzydzieści = 30. Колонка три: «numer trzy» или разговорно «trójka».', 'trzydzieści = 30. Say «numer trzy» or «trójka».')),
        ],
        { hint: t('trzy — 3.', 'trzy — 3.', 'trzy = 3.'), explain: t('«Numer trzy» і розмовне «trójka» означають колонку №3.', '«Numer trzy» и разговорное «trójka» означают колонку №3.', 'Both mean pump 3.'), words: ['trzy'] }),
      listen('fuel', npc('Benzyna, sto pięćdziesiąt złotych.', 'Бензин, сто п’ятдесят злотих.', 'Бензин, сто пятьдесят злотых.', 'Petrol, one hundred fifty złoty.'),
        t('Що і на яку суму? (навчальна сума)', 'Что и на какую сумму? (учебная сумма)', 'What and how much? (practice amount)'),
        [
          T(t('бензин, 150 zł', 'бензин, 150 zł', 'petrol, 150 zł'), true),
          T(t('дизель, 150 zł', 'дизель, 150 zł', 'diesel, 150 zł'), false, t('Benzyna — бензин. Дизель — «olej napędowy» (ON).', 'Benzyna — бензин. Дизель — «olej napędowy» (ON).', 'Benzyna = petrol; diesel is «olej napędowy».')),
          T(t('бензин, 115 zł', 'бензин, 115 zł', 'petrol, 115 zł'), false, t('sto piętnaście = 115, а sto pięćdziesiąt = 150.', 'sto piętnaście = 115, а sto pięćdziesiąt = 150.', 'sto piętnaście = 115.')),
        ],
        { hint: t('sto — 100, pięćdziesiąt — 50.', 'sto — 100, pięćdziesiąt — 50.', '100 + 50.'), explain: t('sto pięćdziesiąt = 150.', 'sto pięćdziesiąt = 150.', '150.'), words: ['benzyna', 'sto', 'pięćdziesiąt'] }),
      choice('receipt', npc('Paragon czy faktura?', 'Чек чи фактура?', 'Чек или фактура?', 'Receipt or invoice?'),
        t('Тобі потрібен звичайний чек.', 'Тебе нужен обычный чек.', 'You need a normal receipt.'),
        [
          P('Paragon, poproszę.', true),
          P('Fakturę, poproszę.', false, t('Фактуру беруть для фірми — для неї потрібен NIP (податковий номер). Тобі вистачить paragonu.', 'Фактуру берут для фирмы — для неё нужен NIP (налоговый номер). Тебе хватит paragonu.', 'An invoice is for companies and needs a NIP tax number.')),
          P('Paragon czy faktura.', false, t('Не повторюй питання — обери одне.', 'Не повторяй вопрос — выбери одно.', 'Don’t repeat the question — choose one.')),
        ],
        { hint: t('paragon — звичайний чек.', 'paragon — обычный чек.', 'paragon = receipt.'), explain: t('Paragon — касовий чек. Faktura — рахунок-фактура для фірми (потрібен NIP).', 'Paragon — кассовый чек. Faktura — счёт-фактура для фирмы (нужен NIP).', 'Paragon = receipt; faktura = VAT invoice (needs NIP).'), words: ['paragon', 'faktura'] }),
      choice('card', npc('Płaci pan kartą?', 'Ви платите карткою?', 'Вы платите картой?', 'Paying by card?'),
        t('Відповідай: так, карткою, безконтактно.', 'Ответь: да, картой, бесконтактно.', 'Say: yes, by card, contactless.'),
        [
          P('Tak, kartą. Zbliżeniowo.', true),
          P('Tak, karta.', false, t('Чим платиш? — орудний відмінок: kartą.', 'Чем платишь? — творительный падеж: kartą.', 'Use the instrumental: kartą.')),
          P('Tak, gotówka.', false, t('Ти хотів платити карткою. І форма — gotówką.', 'Ты хотел платить картой. И форма — gotówką.', 'You wanted to pay by card.')),
        ],
        { hint: t('zbliżeniowo — безконтактно.', 'zbliżeniowo — бесконтактно.', 'zbliżeniowo = contactless.'), explain: t('«Płacę kartą zbliżeniowo» — «Плачу карткою безконтактно».', '«Płacę kartą zbliżeniowo» — «Плачу картой бесконтактно».', 'I pay contactless.'), words: ['karta', 'zbliżeniowo'] }),
      choice('trip', npc('Dziękuję. Szerokiej drogi!', 'Дякую. Щасливої дороги!', 'Спасибо. Счастливого пути!', 'Thank you. Safe travels!'),
        t('Що означає «Szerokiej drogi!» і як відповісти?', 'Что значит «Szerokiej drogi!» и как ответить?', 'What does «Szerokiej drogi!» mean and how to reply?'),
        [
          P('Dziękuję, do widzenia!', true),
          P('Smacznego!', false, t('«Szerokiej drogi!» — «Щасливої дороги!». Подякуй: «Dziękuję!»', '«Szerokiej drogi!» — «Счастливого пути!». Поблагодари: «Dziękuję!»', 'It means “safe travels”. Say thanks.')),
          P('Dobranoc!', false, t('«Dobranoc» — «на добраніч».', '«Dobranoc» — «спокойной ночи».', '«Dobranoc» = good night.')),
        ],
        { hint: t('Подякуй і попрощайся.', 'Поблагодари и попрощайся.', 'Thank and say bye.'), explain: t('«Szerokiej drogi!» дослівно «широкої дороги» — побажання щасливої дороги.', '«Szerokiej drogi!» дословно «широкой дороги» — пожелание счастливого пути.', 'Literally “wide road” — a wish for a safe trip.'), words: ['szerokiej drogi'] }),
    ],
    phrases: [
      ph('Który dystrybutor?', 'Яка колонка?', 'Какая колонка?', 'Which pump?'),
      ph('Numer trzy.', 'Номер три.', 'Номер три.', 'Number three.'),
      ph('Paragon, poproszę.', 'Чек, будь ласка.', 'Чек, пожалуйста.', 'A receipt, please.'),
      ph('Płacę kartą zbliżeniowo.', 'Плачу карткою безконтактно.', 'Плачу картой бесконтактно.', 'I pay contactless.'),
      ph('Szerokiej drogi!', 'Щасливої дороги!', 'Счастливого пути!', 'Safe travels!'),
    ],
  },

  // ───────────── 6. Посилка чекає ─────────────
  {
    slug: 'paczkomat', category: 'home', tags: [], city: 'warszawa', scene: 'parcel-locker',
    npc: { name: 'Pani Ewa', role: t('сусідка', 'соседка', 'neighbour') },
    title: t('Посилка чекає', 'Посылка ждёт', 'Your parcel is waiting'),
    goal: t('Зрозумій SMS, введи код і забери посилку з поштомату.', 'Пойми SMS, введи код и забери посылку из постамата.', 'Understand the SMS, enter the code and collect the parcel.'),
    intro: t('Бобек замовив нові навушники. Приходить SMS польською…', 'Бобек заказал новые наушники. Приходит SMS на польском…', 'Bobek ordered headphones. An SMS arrives in Polish…'),
    note: t('Paczkomat — автомат для посилок; назва — торгова марка компанії InPost. Тут — лише навчальна ситуація, код вигаданий.', 'Paczkomat — автомат для посылок; название — торговая марка компании InPost. Здесь — лишь учебная ситуация, код выдуман.', 'Paczkomat is InPost’s parcel locker brand; the code here is made up.'),
    minutes: 4, xp: 40, zlotki: 20,
    steps: [
      choice('sms', narr('Twoja paczka czeka w Paczkomacie WAW123. Kod odbioru: 482915.', 'Твоя посилка чекає в поштоматі WAW123. Код отримання: 482915.', 'Твоя посылка ждёт в постамате WAW123. Код получения: 482915.', 'Your parcel is waiting in locker WAW123. Pickup code: 482915.'),
        t('Що написано в SMS?', 'Что написано в SMS?', 'What does the SMS say?'),
        [
          T(t('посилка чекає в поштоматі, код отримання 482915', 'посылка ждёт в постамате, код получения 482915', 'the parcel is in the locker, code 482915'), true),
          T(t('посилку доставлять завтра', 'посылку доставят завтра', 'the parcel arrives tomorrow'), false, t('«czeka» — чекає вже зараз.', '«czeka» — ждёт уже сейчас.', '«czeka» = is waiting now.')),
          T(t('треба доплатити за посилку', 'нужно доплатить за посылку', 'you must pay extra')),
        ],
        { hint: t('czeka — чекає, kod odbioru — код отримання.', 'czeka — ждёт, kod odbioru — код получения.', 'czeka = waits; kod odbioru = pickup code.'), explain: t('paczka — посилка, kod odbioru — код отримання.', 'paczka — посылка, kod odbioru — код получения.', 'paczka = parcel; kod odbioru = pickup code.'), words: ['paczka', 'paczkomat', 'kod odbioru', 'czekać'] }),
      choice('screen', narr('Wpisz numer telefonu i kod odbioru.', 'Введи номер телефону і код отримання.', 'Введи номер телефона и код получения.', 'Enter your phone number and pickup code.'),
        t('Що просить екран поштомату?', 'Что просит экран постамата?', 'What does the screen ask for?'),
        [
          T(t('номер телефону і код отримання', 'номер телефона и код получения', 'phone number and pickup code'), true),
          T(t('адресу та ім’я', 'адрес и имя', 'address and name')),
          T(t('PIN-код картки', 'PIN-код карты', 'card PIN'), false, t('Картка тут не потрібна — посилка вже оплачена.', 'Карта здесь не нужна — посылка уже оплачена.', 'No card needed here.')),
        ],
        { hint: t('wpisz — введи.', 'wpisz — введи.', 'wpisz = enter.'), explain: t('«Wpisz» — «введи» (наказовий спосіб від wpisać).', '«Wpisz» — «введи» (повелительное наклонение от wpisać).', '«Wpisz» = type in.') }),
      listen('code', { who: 'beaver', pl: 'Kod: cztery, osiem, dwa, dziewięć, jeden, pięć.', tr: t('Код: чотири, вісім, два, дев’ять, один, п’ять.', 'Код: четыре, восемь, два, девять, один, пять.', 'Code: four, eight, two, nine, one, five.') },
        t('Бобек диктує код. Обери те, що почув.', 'Бобек диктует код. Выбери то, что услышал.', 'Bobek reads the code. Pick what you heard.'),
        [
          T(t('482915'), true),
          T(t('482519'), false, t('Наприкінці: dziewięć (9), jeden (1), pięć (5).', 'В конце: dziewięć (9), jeden (1), pięć (5).', 'The end is 9, 1, 5.')),
          T(t('428915'), false, t('Спочатку: cztery (4), osiem (8), dwa (2).', 'Сначала: cztery (4), osiem (8), dwa (2).', 'It starts 4, 8, 2.')),
        ],
        { hint: t('Слухай по одній цифрі.', 'Слушай по одной цифре.', 'One digit at a time.'), explain: t('cztery 4, osiem 8, dwa 2, dziewięć 9, jeden 1, pięć 5.', 'cztery 4, osiem 8, dwa 2, dziewięć 9, jeden 1, pięć 5.', '4-8-2-9-1-5.'), words: ['cztery', 'osiem', 'dwa', 'dziewięć', 'jeden', 'pięć'] }),
      choice('open', narr('Skrytka otwarta. Zamknij drzwiczki po odebraniu paczki.', 'Комірка відкрита. Зачини дверцята, коли забереш посилку.', 'Ячейка открыта. Закрой дверцу, когда заберёшь посылку.', 'Locker open. Close the door after collecting the parcel.'),
        t('Що треба зробити?', 'Что нужно сделать?', 'What should you do?'),
        [
          T(t('забрати посилку й зачинити дверцята', 'забрать посылку и закрыть дверцу', 'take the parcel and close the door'), true),
          T(t('оплатити посилку', 'оплатить посылку', 'pay for the parcel')),
          T(t('надіслати посилку назад', 'отправить посылку обратно', 'send it back')),
        ],
        { hint: t('zamknij — зачини, po odebraniu — після отримання.', 'zamknij — закрой, po odebraniu — после получения.', 'zamknij = close.'), explain: t('skrytka — комірка поштомату, drzwiczki — дверцята.', 'skrytka — ячейка постамата, drzwiczki — дверца.', 'skrytka = locker compartment.'), words: ['skrytka', 'odebrać'] }),
      choice('neighbour', npc('Dzień dobry! Odebrał pan już paczkę?', 'Добрий день! Ви вже забрали посилку?', 'Добрый день! Вы уже забрали посылку?', 'Hello! Have you collected your parcel?'),
        t('Відповідай сусідці: так, уже забрав.', 'Ответь соседке: да, уже забрал.', 'Tell her: yes, I have.'),
        [
          P('Tak, już odebrałem. Dziękuję!', true),
          P('Tak, już odebrałam. Dziękuję!', true),
          P('Tak, odbiorę jutro.', false, t('«odbiorę jutro» — «заберу завтра». А ти вже забрав: «odebrałem / odebrałam».', '«odbiorę jutro» — «заберу завтра». А ты уже забрал: «odebrałem / odebrałam».', '«odbiorę jutro» = I’ll collect tomorrow.')),
        ],
        { hint: t('Минулий час: odebrałem (він) / odebrałam (вона).', 'Прошедшее время: odebrałem (он) / odebrałam (она).', 'Past: odebrałem (m) / odebrałam (f).'), explain: t('Чоловік: «odebrałem», жінка: «odebrałam».', 'Мужчина: «odebrałem», женщина: «odebrałam».', 'Men: odebrałem; women: odebrałam.'), words: ['odebrać'] }),
      build('heavy', undefined, t('Склади: «Посилка дуже важка».', 'Составь: «Посылка очень тяжёлая».', 'Build: “The parcel is very heavy.”'),
        'Paczka jest bardzo ciężka.', ['ciężki', 'są'],
        { hint: t('paczka — жіночий рід, тому ciężka.', 'paczka — женский род, поэтому ciężka.', 'paczka is feminine: ciężka.'), explain: t('Прикметник узгоджується з іменником: paczka (вона) → ciężka.', 'Прилагательное согласуется: paczka (она) → ciężka.', 'Adjective agrees: ciężka.'), words: ['ciężki'] }),
    ],
    phrases: [
      ph('Twoja paczka czeka.', 'Твоя посилка чекає.', 'Твоя посылка ждёт.', 'Your parcel is waiting.'),
      ph('kod odbioru', 'код отримання', 'код получения', 'pickup code'),
      ph('Skrytka otwarta.', 'Комірка відкрита.', 'Ячейка открыта.', 'The locker is open.'),
      ph('Już odebrałem paczkę.', 'Я вже забрав посилку.', 'Я уже забрал посылку.', 'I’ve already collected the parcel.'),
    ],
  },

  // ───────────── 7. Перший трамвай ─────────────
  {
    slug: 'first-tram', category: 'transport', tags: [], city: 'wroclaw', scene: 'tram-stop',
    npc: { name: 'Pani Zofia', role: t('пасажирка', 'пассажирка', 'passenger') },
    title: t('Перший трамвай', 'Первый трамвай', 'First tram ride'),
    goal: t('Купи квиток, прокомпостуй його, зрозумій оголошення й пересядь.', 'Купи билет, прокомпостируй его, пойми объявление и пересядь.', 'Buy and validate a ticket, understand announcements and change trams.'),
    intro: t('Бобек хоче поїхати трамваєм до вокзалу у Вроцлаві.', 'Бобек хочет поехать на трамвае к вокзалу во Вроцлаве.', 'Bobek wants to take a tram to the station in Wrocław.'),
    note: t('Правила й тарифи в кожному місті свої; тут — загальна навчальна ситуація.', 'Правила и тарифы в каждом городе свои; здесь — общая учебная ситуация.', 'Rules and fares differ by city; this is a general practice scene.'),
    minutes: 5, xp: 45, zlotki: 20,
    steps: [
      choice('fare', narr('Bilet normalny czy ulgowy?', 'Квиток звичайний чи пільговий?', 'Билет обычный или льготный?', 'Full-fare or reduced ticket?'),
        t('Ти дорослий без права на пільги. Що обрати в автоматі?', 'Ты взрослый без права на льготы. Что выбрать в автомате?', 'You’re an adult with no discount. Which one?'),
        [
          T(t('normalny'), true),
          T(t('ulgowy'), false, t('Ulgowy — пільговий (для студентів, школярів та інших, хто має право на знижку).', 'Ulgowy — льготный (для студентов, школьников и других, у кого есть право на скидку).', 'Ulgowy is for those entitled to a discount.')),
        ],
        { hint: t('ulga — пільга.', 'ulga — льгота.', 'ulga = discount.'), explain: t('normalny — повний квиток, ulgowy — пільговий.', 'normalny — полный билет, ulgowy — льготный.', 'normalny = full fare, ulgowy = reduced.'), words: ['bilet', 'normalny', 'ulgowy'], tags: ['city-transport'] }),
      choice('type', narr('Bilet jednorazowy czy dobowy?', 'Квиток разовий чи добовий?', 'Билет разовый или суточный?', 'Single or 24-hour ticket?'),
        t('Ти їдеш лише один раз.', 'Ты едешь только один раз.', 'You’re making one trip.'),
        [
          T(t('jednorazowy'), true),
          T(t('dobowy'), false, t('Dobowy — на добу (24 години). Для однієї поїздки — jednorazowy.', 'Dobowy — на сутки (24 часа). Для одной поездки — jednorazowy.', 'Dobowy = 24-hour.')),
        ],
        { hint: t('jeden raz — один раз.', 'jeden raz — один раз.', 'jeden raz = once.'), explain: t('jednorazowy — разовий, dobowy — добовий.', 'jednorazowy — разовый, dobowy — суточный.', 'jednorazowy = single.'), words: ['jednorazowy'], tags: ['city-transport'] }),
      choice('validate', narr('W tramwaju: „Proszę skasować bilet”.', 'У трамваї: «Прокомпостуйте квиток».', 'В трамвае: «Прокомпостируйте билет».', 'On the tram: “Please validate your ticket.”'),
        t('У тебе паперовий квиток. Що зробити?', 'У тебя бумажный билет. Что сделать?', 'You have a paper ticket. What do you do?'),
        [
          T(t('прокомпостувати квиток у валідаторі', 'прокомпостировать билет в валидаторе', 'validate it in the machine'), true),
          T(t('віддати квиток водієві', 'отдать билет водителю', 'give it to the driver')),
          T(t('нічого, квиток уже дійсний', 'ничего, билет уже действует', 'nothing, it’s already valid'), false, t('Паперовий квиток зазвичай треба skasować одразу після входу.', 'Бумажный билет обычно нужно skasować сразу после входа.', 'Paper tickets usually must be validated on boarding.')),
        ],
        { hint: t('skasować — прокомпостувати.', 'skasować — прокомпостировать.', 'skasować = validate.'), explain: t('«Skasować bilet» — прокомпостувати квиток у kasowniku.', '«Skasować bilet» — прокомпостировать билет в kasowniku.', 'Validate in the kasownik.'), words: ['skasować'], tags: ['city-transport'] }),
      listen('next', narr('Następny przystanek: Rynek.', 'Наступна зупинка: Ринок.', 'Следующая остановка: Рынок.', 'Next stop: Market Square.'),
        t('Яка наступна зупинка?', 'Какая следующая остановка?', 'What is the next stop?'),
        [
          T(t('Rynek'), true),
          T(t('Dworzec Główny')),
          T(t('Plac Grunwaldzki')),
        ],
        { hint: t('Następny przystanek — наступна зупинка.', 'Następny przystanek — следующая остановка.', 'Następny przystanek = next stop.'), explain: t('Так оголошують зупинки в трамваях і автобусах.', 'Так объявляют остановки в трамваях и автобусах.', 'That’s how stops are announced.'), words: ['następny przystanek', 'przystanek'], tags: ['city-transport'] }),
      choice('ask', undefined, t('Запитай пасажирку, чи цей трамвай їде до вокзалу.', 'Спроси пассажирку, едет ли этот трамвай к вокзалу.', 'Ask if this tram goes to the station.'),
        [
          P('Przepraszam, czy ten tramwaj jedzie na dworzec?', true),
          P('Przepraszam, czy ten tramwaj jedzie na dworcu?', false, t('Напрямок: na + знахідний — na dworzec. «Na dworcu» — «на вокзалі» (місце).', 'Направление: na + винительный — na dworzec. «Na dworcu» — «на вокзале» (место).', 'Direction: na dworzec; «na dworcu» = at the station.')),
          P('Gdzie jest tramwaj?', false, t('Ти вже в трамваї 🙂 Запитай, чи він їде на dworzec.', 'Ты уже в трамвае 🙂 Спроси, едет ли он na dworzec.', 'You’re already on it 🙂')),
        ],
        { hint: t('Куди? — na + знахідний.', 'Куда? — na + винительный.', 'Where to? — na + accusative.'), explain: t('«Czy ten tramwaj jedzie na dworzec?» — «Чи їде цей трамвай до вокзалу?»', '«Czy ten tramwaj jedzie na dworzec?» — «Едет ли этот трамвай к вокзалу?»', 'Does this tram go to the station?'), words: ['tramwaj', 'dworzec'], tags: ['city-transport'] }),
      listen('change', npc('Nie, musi pan wysiąść i przesiąść się na siódemkę.', 'Ні, вам треба вийти й пересісти на сімку.', 'Нет, вам нужно выйти и пересесть на семёрку.', 'No, you need to get off and change to the number 7.'),
        t('Що порадила пасажирка?', 'Что посоветовала пассажирка?', 'What did she advise?'),
        [
          T(t('вийти й пересісти на трамвай №7', 'выйти и пересесть на трамвай №7', 'get off and change to tram 7'), true),
          T(t('їхати до кінцевої', 'ехать до конечной', 'ride to the end')),
          T(t('купити ще один квиток', 'купить ещё один билет', 'buy another ticket')),
        ],
        { hint: t('siódemka — розмовно «сімка», лінія №7.', 'siódemka — разговорно «семёрка», линия №7.', 'siódemka = line 7.'), explain: t('wysiąść — вийти, przesiąść się — пересісти. Лінії часто називають розмовно: siódemka, ósemka…', 'wysiąść — выйти, przesiąść się — пересесть. Линии часто называют разговорно: siódemka, ósemka…', 'wysiąść = get off; przesiąść się = change.'), words: ['przesiąść się', 'siedem'], tags: ['city-transport'] }),
      build('getoff', undefined, t('Пропусти тебе до дверей: «Перепрошую, я виходжу».', 'Попроси пропустить к двери: «Извините, я выхожу».', 'Make your way out: “Excuse me, I’m getting off.”'),
        'Przepraszam, wysiadam.', ['wysiąść', 'jestem'],
        { hint: t('wysiadam — я виходжу.', 'wysiadam — я выхожу.', 'wysiadam = I’m getting off.'), explain: t('Ввічлива фраза в переповненому транспорті: «Przepraszam, wysiadam».', 'Вежливая фраза в переполненном транспорте: «Przepraszam, wysiadam».', 'Polite phrase on a crowded tram.'), words: ['wysiadać', 'przepraszam'], tags: ['city-transport'] }),
    ],
    phrases: [
      ph('Bilet normalny, jednorazowy.', 'Звичайний разовий квиток.', 'Обычный разовый билет.', 'A full-fare single ticket.'),
      ph('Proszę skasować bilet.', 'Прокомпостуйте квиток.', 'Прокомпостируйте билет.', 'Please validate your ticket.'),
      ph('Następny przystanek: Rynek.', 'Наступна зупинка: Ринок.', 'Следующая остановка: Рынок.', 'Next stop: Market Square.'),
      ph('Czy ten tramwaj jedzie na dworzec?', 'Чи їде цей трамвай до вокзалу?', 'Едет ли этот трамвай к вокзалу?', 'Does this tram go to the station?'),
      ph('Przepraszam, wysiadam.', 'Перепрошую, я виходжу.', 'Извините, я выхожу.', 'Excuse me, I’m getting off.'),
    ],
  },

  // ───────────── 8. Квиток до Вроцлава ─────────────
  {
    slug: 'train-wroclaw', category: 'transport', tags: [], city: 'warszawa', scene: 'train-station',
    npc: { name: 'Pan Adam', role: t('касир на вокзалі', 'кассир на вокзале', 'ticket clerk') },
    title: t('Квиток до Вроцлава', 'Билет до Вроцлава', 'A ticket to Wrocław'),
    goal: t('Купи квиток на потрібний час, обери місце й знайди перон.', 'Купи билет на нужное время, выбери место и найди перрон.', 'Buy a ticket, choose a seat and find the platform.'),
    intro: t('Бобек на вокзалі Warszawa Centralna. Наступна зупинка подорожі — Вроцлав!', 'Бобек на вокзале Warszawa Centralna. Следующая остановка путешествия — Вроцлав!', 'Bobek is at Warszawa Centralna. Next stop: Wrocław!'),
    note: t('На польських вокзалах указують і перон (платформу), і tor (колію). Ціна в місії навчальна.', 'На польских вокзалах указывают и перрон (платформу), и tor (путь). Цена в миссии учебная.', 'Stations show both peron (platform) and tor (track). The price is for practice.'),
    minutes: 5, xp: 45, zlotki: 20,
    steps: [
      build('ticket', undefined, t('Попроси квиток: «Квиток до Вроцлава, будь ласка».', 'Попроси билет: «Билет до Вроцлава, пожалуйста».', 'Ask: “A ticket to Wrocław, please.”'),
        'Poproszę bilet do Wrocławia.', ['Wrocław', 'na'],
        { hint: t('do + родовий: Wrocław → do Wrocławia.', 'do + родительный: Wrocław → do Wrocławia.', 'do + genitive: do Wrocławia.'), explain: t('Після «do» — родовий відмінок: do Wrocławia, do Krakowa, do Gdańska.', 'После «do» — родительный падеж: do Wrocławia, do Krakowa, do Gdańska.', 'do Wrocławia.'), words: ['bilet', 'pociąg'] }),
      listen('when', npc('Na kiedy? Na dzisiaj?', 'На коли? На сьогодні?', 'На когда? На сегодня?', 'For when? Today?'),
        t('Що питає касир?', 'Что спрашивает кассир?', 'What does the clerk ask?'),
        [
          T(t('На коли? На сьогодні?', 'На когда? На сегодня?', 'For when? Today?'), true),
          T(t('Куди? До Вроцлава?', 'Куда? До Вроцлава?', 'Where? To Wrocław?')),
          T(t('Скільки квитків?', 'Сколько билетов?', 'How many tickets?')),
        ],
        { hint: t('kiedy — коли, dzisiaj — сьогодні.', 'kiedy — когда, dzisiaj — сегодня.', 'kiedy = when, dzisiaj = today.'), explain: t('«Na kiedy?» — «На коли?»', '«Na kiedy?» — «На когда?»', '«Na kiedy?» = for when?'), words: ['dzisiaj'] }),
      choice('time', npc('Jest pociąg o czternastej dziesięć.', 'Є потяг о чотирнадцятій десять.', 'Есть поезд в четырнадцать десять.', 'There’s a train at 14:10.'),
        t('Скажи: так, на 14:10.', 'Скажи: да, на 14:10.', 'Say: yes, the 14:10.'),
        [
          P('Tak, na czternastą dziesięć, poproszę.', true),
          P('Tak, o czternaście dziesięć.', false, t('Години — порядкові числівники: czternasta (чотирнадцята).', 'Часы — порядковые числительные: czternasta.', 'Hours use ordinal numbers: czternasta.')),
          P('Tak, jutro.', false, t('jutro — завтра, а потяг сьогодні.', 'jutro — завтра, а поезд сегодня.', 'jutro = tomorrow.')),
        ],
        { hint: t('Час кажуть порядковими: pierwsza, druga… czternasta.', 'Время говорят порядковыми: pierwsza, druga… czternasta.', 'Time uses ordinals.'), explain: t('«o czternastej dziesięć» — о 14:10; «na czternastą dziesięć» — на 14:10.', '«o czternastej dziesięć» — в 14:10; «na czternastą dziesięć» — на 14:10.', 'o czternastej dziesięć = at 14:10.') }),
      choice('way', npc('W jedną stronę czy tam i z powrotem?', 'В один бік чи туди й назад?', 'В одну сторону или туда и обратно?', 'One way or return?'),
        t('Бобек далі поїде в Познань, тож квиток лише в один бік.', 'Бобек дальше поедет в Познань, так что билет только в одну сторону.', 'Bobek continues to Poznań — one way only.'),
        [
          P('W jedną stronę.', true),
          P('Tam i z powrotem.', false, t('Назад Бобек не повертається — він їде далі маршрутом.', 'Обратно Бобек не возвращается — он едет дальше по маршруту.', 'Bobek isn’t coming back.')),
          P('W prawo.', false, t('«W prawo» — праворуч. Тут питають: в один бік чи туди й назад.', '«W prawo» — направо. Здесь спрашивают: в одну сторону или туда и обратно.', '«W prawo» = to the right.')),
        ],
        { hint: t('w jedną stronę — в один бік.', 'w jedną stronę — в одну сторону.', 'w jedną stronę = one way.'), explain: t('w jedną stronę — в один бік; tam i z powrotem — туди й назад.', 'w jedną stronę — в одну сторону; tam i z powrotem — туда и обратно.', 'one way / return.'), words: ['w jedną stronę', 'tam i z powrotem'] }),
      choice('seat', npc('Miejsce przy oknie czy przy przejściu?', 'Місце біля вікна чи біля проходу?', 'Место у окна или у прохода?', 'Window or aisle seat?'),
        t('Бобек хоче дивитися у вікно.', 'Бобек хочет смотреть в окно.', 'Bobek wants to look out of the window.'),
        [
          P('Przy oknie, poproszę.', true),
          P('Przy przejściu, poproszę.', false, t('przy przejściu — біля проходу, а Бобек хоче біля вікна (przy oknie).', 'przy przejściu — у прохода, а Бобек хочет у окна (przy oknie).', 'przy przejściu = aisle.')),
          P('Na oknie, poproszę.', false, t('«Na oknie» — «на вікні» 🙂 Правильно: «przy oknie» — біля вікна.', '«Na oknie» — «на окне» 🙂 Правильно: «przy oknie».', '«Na oknie» = on the window 🙂')),
        ],
        { hint: t('przy — біля.', 'przy — у, возле.', 'przy = by.'), explain: t('przy oknie — біля вікна; przy przejściu — біля проходу.', 'przy oknie — у окна; przy przejściu — у прохода.', 'window / aisle.'), words: ['przy oknie'] }),
      listen('platform', npc('Pociąg odjeżdża z peronu czwartego, tor drugi.', 'Потяг відправляється з четвертого перону, колія друга.', 'Поезд отправляется с четвёртого перрона, путь второй.', 'The train leaves from platform four, track two.'),
        t('Звідки відправляється потяг?', 'Откуда отправляется поезд?', 'Where does the train leave from?'),
        [
          T(t('перон 4, колія 2', 'перрон 4, путь 2', 'platform 4, track 2'), true),
          T(t('перон 2, колія 4', 'перрон 2, путь 4', 'platform 2, track 4'), false, t('peron czwarty — перон 4, tor drugi — колія 2.', 'peron czwarty — перрон 4, tor drugi — путь 2.', 'peron 4, tor 2.')),
          T(t('перон 14', 'перрон 14', 'platform 14')),
        ],
        { hint: t('czwarty — четвертий, drugi — другий.', 'czwarty — четвёртый, drugi — второй.', 'czwarty = 4th, drugi = 2nd.'), explain: t('peron — платформа, tor — колія біля неї.', 'peron — платформа, tor — путь у неё.', 'peron = platform, tor = track.'), words: ['peron', 'tor'] }),
      listen('total', npc('Razem osiemdziesiąt dziewięć złotych.', 'Разом вісімдесят дев’ять злотих.', 'Итого восемьдесят девять злотых.', 'Eighty-nine złoty in total.'),
        AMOUNT_TASK,
        [
          T(t('89 zł'), true),
          T(t('98 zł'), false, t('osiemdziesiąt dziewięć = 80 + 9 = 89.', 'osiemdziesiąt dziewięć = 80 + 9 = 89.', '80 + 9 = 89.')),
          T(t('19 zł'), false, t('dziewiętnaście = 19, а тут osiemdziesiąt dziewięć = 89.', 'dziewiętnaście = 19, а здесь osiemdziesiąt dziewięć = 89.', '19 is dziewiętnaście.')),
        ],
        { hint: t('osiemdziesiąt — 80.', 'osiemdziesiąt — 80.', 'osiemdziesiąt = 80.'), explain: t('Десятки + одиниці: osiemdziesiąt (80) dziewięć (9).', 'Десятки + единицы: osiemdziesiąt (80) dziewięć (9).', 'Tens then units.'), words: ['dziewięć'] }),
    ],
    phrases: [
      ph('Poproszę bilet do Wrocławia.', 'Квиток до Вроцлава, будь ласка.', 'Билет до Вроцлава, пожалуйста.', 'A ticket to Wrocław, please.'),
      ph('na czternastą dziesięć', 'на 14:10', 'на 14:10', 'for 14:10'),
      ph('W jedną stronę.', 'В один бік.', 'В одну сторону.', 'One way.'),
      ph('Przy oknie, poproszę.', 'Біля вікна, будь ласка.', 'У окна, пожалуйста.', 'Window seat, please.'),
      ph('peron czwarty, tor drugi', 'перон 4, колія 2', 'перрон 4, путь 2', 'platform 4, track 2'),
    ],
  },

  // ───────────── 9. Молочний бар ─────────────
  {
    slug: 'bar-mleczny', category: 'food', tags: ['restaurant'], city: 'warszawa', scene: 'milk-bar',
    npc: { name: 'Pani Basia', role: t('касирка в барі', 'кассирша в баре', 'bar cashier') },
    title: t('Обід у молочному барі', 'Обед в молочном баре', 'Lunch at a milk bar'),
    goal: t('Прочитай меню, замов страву та компот і забери замовлення біля віконця.', 'Прочитай меню, закажи блюдо и компот и забери заказ у окошка.', 'Read the menu, order a dish and kompot, collect at the window.'),
    intro: t('Бобек шукає недорогий домашній обід і заходить у bar mleczny.', 'Бобек ищет недорогой домашний обед и заходит в bar mleczny.', 'Bobek looks for a cheap home-style lunch.'),
    note: t('Bar mleczny — недорога їдальня з домашньою польською кухнею. Такі бари були дуже поширені в XX столітті й працюють досі.', 'Bar mleczny — недорогая столовая с домашней польской кухней. Такие бары были очень распространены в XX веке и работают до сих пор.', 'A bar mleczny is a cheap canteen serving Polish home cooking.'),
    minutes: 4, xp: 40, zlotki: 20,
    steps: [
      choice('menu', narr('Menu: bigos, placki ziemniaczane, pierogi, zupa pomidorowa.', 'Меню: біґос, картопляні оладки, pierogi, томатний суп.', 'Меню: бигос, картофельные оладьи, pierogi, томатный суп.', 'Menu: bigos, potato pancakes, pierogi, tomato soup.'),
        t('Що з меню — картопляні оладки (деруни)?', 'Что из меню — картофельные оладьи (драники)?', 'Which item is potato pancakes?'),
        [
          P('placki ziemniaczane', true),
          P('bigos', false, t('Bigos — тушкована квашена й свіжа капуста з м’ясом і грибами.', 'Bigos — тушёная квашеная и свежая капуста с мясом и грибами.', 'Bigos is stewed sauerkraut with meat and mushrooms.')),
          P('zupa pomidorowa', false, t('Zupa pomidorowa — томатний суп.', 'Zupa pomidorowa — томатный суп.', 'Tomato soup.')),
        ],
        { hint: t('ziemniak — картопля.', 'ziemniak — картошка.', 'ziemniak = potato.'), explain: t('Placki ziemniaczane — смажені картопляні оладки, схожі на деруни; їх їдять зі сметаною або з цукром.', 'Placki ziemniaczane — жареные картофельные оладьи, похожие на драники; их едят со сметаной или с сахаром.', 'Fried potato pancakes, served with sour cream or sugar.'), words: ['placki ziemniaczane', 'bigos', 'zupa'], tags: ['dish:placki', 'dish:bigos'] }),
      build('order', undefined, t('Замов: «Біґос і компот, будь ласка».', 'Закажи: «Бигос и компот, пожалуйста».', 'Order: “Bigos and kompot, please.”'),
        'Poproszę bigos i kompot.', ['bigosu', 'kompotu'],
        { hint: t('Після poproszę: bigos, kompot — без змін.', 'После poproszę: bigos, kompot — без изменений.', 'bigos, kompot stay the same.'), explain: t('Для неживих іменників чоловічого роду знахідний = називний: bigos, kompot.', 'Для неодушевлённых существительных мужского рода винительный = именительный: bigos, kompot.', 'Inanimate masculine: accusative = nominative.'), words: ['kompot', 'bigos'], tags: ['dish:bigos'] }),
      listen('soldout', npc('Bigos się skończył. Może placki?', 'Біґос закінчився. Може, оладки?', 'Бигос закончился. Может, оладьи?', 'The bigos has run out. Pancakes maybe?'),
        t('Що сказала касирка?', 'Что сказала кассирша?', 'What did the cashier say?'),
        [
          T(t('біґос закінчився, може, оладки?', 'бигос закончился, может, оладьи?', 'bigos is gone, pancakes maybe?'), true),
          T(t('біґос гарячий, обережно', 'бигос горячий, осторожно', 'the bigos is hot, careful')),
          T(t('біґос коштує дорожче', 'бигос стоит дороже', 'bigos costs more')),
        ],
        { hint: t('skończył się — закінчився.', 'skończył się — закончился.', 'skończył się = ran out.'), explain: t('«Się skończył» — «закінчився». «Może…?» — «Може…?»', '«Się skończył» — «закончился». «Może…?» — «Может…?»', '«Się skończył» = has run out.'), tags: ['dish:bigos'] }),
      choice('pancakes', undefined, t('Погодься: оладки зі сметаною.', 'Согласись: оладьи со сметаной.', 'Agree: pancakes with sour cream.'),
        [
          P('Tak, poproszę placki ze śmietaną.', true),
          P('Tak, poproszę placki z śmietaną.', false, t('Перед групою приголосних «śm» кажуть «ze»: ze śmietaną.', 'Перед группой согласных «śm» говорят «ze»: ze śmietaną.', 'Before «śm» use «ze»: ze śmietaną.')),
          P('Nie ma za co.', false, t('«Nie ma za co» — відповідь на «дякую».', '«Nie ma za co» — ответ на «спасибо».', 'That answers “thank you”.')),
        ],
        { hint: t('z → ze перед важкою групою приголосних.', 'z → ze перед тяжёлой группой согласных.', 'z → ze before consonant clusters.'), explain: t('ze śmietaną — зі сметаною (як укр. «зі»).', 'ze śmietaną — со сметаной (как рус. «со»).', 'ze śmietaną = with sour cream.'), words: ['ze śmietaną', 'placki ziemniaczane'], tags: ['dish:placki'] }),
      listen('total', npc('Razem osiemnaście złotych.', 'Разом вісімнадцять злотих.', 'Итого восемнадцать злотых.', 'Eighteen złoty in total.'),
        AMOUNT_TASK,
        [
          T(t('18 zł'), true),
          T(t('80 zł'), false, t('osiemdziesiąt = 80, osiemnaście = 18.', 'osiemdziesiąt = 80, osiemnaście = 18.', 'osiemdziesiąt = 80.')),
          T(t('8 zł'), false, t('osiem = 8, osiemnaście = 18.', 'osiem = 8, osiemnaście = 18.', 'osiem = 8.')),
        ],
        { hint: t('-naście — 11–19.', '-naście — 11–19.', '-naście = teens.'), explain: t('Закінчення -naście дає числа 11–19: osiemnaście = 18.', 'Окончание -naście даёт числа 11–19: osiemnaście = 18.', '-naście forms 11–19.'), words: ['osiem'] }),
      choice('window', npc('Numer czterdzieści dwa. Proszę odebrać przy okienku.', 'Номер сорок два. Заберіть біля віконця.', 'Номер сорок два. Заберите у окошка.', 'Number forty-two. Please collect at the window.'),
        t('Що робити далі?', 'Что делать дальше?', 'What next?'),
        [
          T(t('дочекатися номера 42 і забрати страву біля віконця', 'дождаться номера 42 и забрать блюдо у окошка', 'wait for number 42 and collect at the window'), true),
          T(t('сісти — страву принесуть до столу', 'сесть — блюдо принесут к столу', 'sit down — it’ll be brought over'), false, t('«Proszę odebrać przy okienku» — забрати самому біля віконця.', '«Proszę odebrać przy okienku» — забрать самому у окошка.', 'Collect it yourself.')),
          T(t('заплатити ще раз', 'заплатить ещё раз', 'pay again')),
        ],
        { hint: t('odebrać — забрати, okienko — віконце.', 'odebrać — забрать, okienko — окошко.', 'odebrać = collect.'), explain: t('czterdzieści dwa = 42. У молочних барах страву зазвичай забирають самі.', 'czterdzieści dwa = 42. В молочных барах блюдо обычно забирают сами.', 'You usually collect it yourself.'), words: ['okienko', 'odebrać'] }),
    ],
    phrases: [
      ph('placki ziemniaczane', 'картопляні оладки', 'картофельные оладьи', 'potato pancakes'),
      ph('Poproszę bigos i kompot.', 'Біґос і компот, будь ласка.', 'Бигос и компот, пожалуйста.', 'Bigos and kompot, please.'),
      ph('Bigos się skończył.', 'Біґос закінчився.', 'Бигос закончился.', 'The bigos has run out.'),
      ph('placki ze śmietaną', 'оладки зі сметаною', 'оладьи со сметаной', 'pancakes with sour cream'),
      ph('Proszę odebrać przy okienku.', 'Заберіть біля віконця.', 'Заберите у окошка.', 'Please collect at the window.'),
    ],
  },

  // ───────────── 10. Пекарня в Торуні ─────────────
  {
    slug: 'torun-bakery', category: 'shop', tags: ['store', 'checkout'], city: 'torun', scene: 'bakery',
    npc: { name: 'Pani Jola', role: t('продавчиня', 'продавщица', 'shop assistant') },
    title: t('Ранок у пекарні', 'Утро в пекарне', 'Morning at the bakery'),
    goal: t('Купи пончики з начинкою, шматок сирника й ввічливо відмовся від пряників.', 'Купи пончики с начинкой, кусок сырника и вежливо откажись от пряников.', 'Buy doughnuts and cheesecake, politely decline gingerbread.'),
    intro: t('Торунь пахне пряниками. Бобек заходить у пекарню-кондитерську.', 'Торунь пахнет пряниками. Бобек заходит в пекарню-кондитерскую.', 'Toruń smells of gingerbread.'),
    note: t('Торунь славиться пряниками (pierniki) ще з середньовіччя. Pączki особливо популярні в Tłusty czwartek — Жирний четвер перед Великим постом.', 'Торунь славится пряниками (pierniki) ещё со Средневековья. Pączki особенно популярны в Tłusty czwartek — Жирный четверг перед Великим постом.', 'Toruń has been famous for gingerbread since the Middle Ages; pączki are a Fat Thursday treat.'),
    minutes: 4, xp: 40, zlotki: 20,
    steps: [
      choice('donuts', npc('Dzień dobry! Co podać?', 'Добрий день! Що вам подати?', 'Добрый день! Что вам подать?', 'Hello! What can I get you?'),
        t('Попроси два пончики.', 'Попроси два пончика.', 'Ask for two doughnuts.'),
        [
          P('Poproszę dwa pączki.', true),
          P('Poproszę dwa pączka.', false, t('Після 2, 3, 4 — називний множини: dwa pączki.', 'После 2, 3, 4 — именительный множественного: dwa pączki.', 'After 2–4: dwa pączki.')),
          P('Poproszę dwie pączki.', false, t('Pączek — чоловічий рід, тому «dwa». «Dwie» — для жіночого роду: dwie bułki.', 'Pączek — мужской род, поэтому «dwa». «Dwie» — для женского рода: dwie bułki.', 'Pączek is masculine: dwa.')),
        ],
        { hint: t('pączek → pączki (множина).', 'pączek → pączki (множественное).', 'pączek → pączki.'), explain: t('Pączek — пончик без дірки, найчастіше з повидлом із троянди або з іншою начинкою.', 'Pączek — пончик без дырки, чаще всего с повидлом из розы или другой начинкой.', 'A filled doughnut without a hole.'), words: ['pączek', 'dwa'], tags: ['dish:paczki'] }),
      listen('filling', npc('Z różą czy z budyniem?', 'З трояндою чи із заварним кремом?', 'С розой или с заварным кремом?', 'Rose jam or custard?'),
        t('Що питає продавчиня?', 'Что спрашивает продавщица?', 'What is she asking?'),
        [
          T(t('з трояндовим повидлом чи з кремом?', 'с розовым повидлом или с кремом?', 'rose jam or custard?'), true),
          T(t('з цукром чи без?', 'с сахаром или без?', 'with sugar or without?')),
          T(t('великі чи маленькі?', 'большие или маленькие?', 'big or small?')),
        ],
        { hint: t('róża — троянда, budyń — заварний крем (пудинг).', 'róża — роза, budyń — заварной крем (пудинг).', 'róża = rose, budyń = custard.'), explain: t('Pączki з повидлом із пелюсток троянди — польська класика.', 'Pączki с повидлом из лепестков розы — польская классика.', 'Rose-jam pączki are a Polish classic.'), tags: ['dish:paczki'] }),
      choice('choose', undefined, t('Обери начинку.', 'Выбери начинку.', 'Choose the filling.'),
        [
          P('Z różą, poproszę.', true),
          P('Z budyniem, poproszę.', true),
          P('Z róża.', false, t('z + орудний відмінок: z różą.', 'z + творительный падеж: z różą.', 'z + instrumental: z różą.')),
        ],
        { hint: t('Як у питанні: z różą / z budyniem.', 'Как в вопросе: z różą / z budyniem.', 'Same as the question.'), explain: t('z różą — з трояндою, z budyniem — з кремом (орудний відмінок).', 'z różą — с розой, z budyniem — с кремом (творительный падеж).', 'Instrumental after z.'), tags: ['dish:paczki'] }),
      build('cheesecake', undefined, t('Склади: «І ще шматок сирника».', 'Составь: «И ещё кусок сырника».', 'Build: “And a piece of cheesecake too.”'),
        'I jeszcze kawałek sernika.', ['sernik', 'kawałka'],
        { hint: t('kawałek + родовий: sernik → sernika.', 'kawałek + родительный: sernik → sernika.', 'kawałek + genitive.'), explain: t('Sernik — польський чізкейк із сиру twaróg. Після «kawałek» — родовий: kawałek sernika.', 'Sernik — польский чизкейк из творога. После «kawałek» — родительный: kawałek sernika.', 'Sernik is a twaróg cheesecake.'), words: ['sernik', 'kawałek'], tags: ['dish:sernik'] }),
      choice('pierniki', npc('A może pierniki? To specjalność Torunia.', 'А може, пряники? Це торунська спеціальність.', 'А может, пряники? Это торуньская специальность.', 'Maybe some gingerbread? It’s Toruń’s speciality.'),
        t('Ввічливо відмовся — пряники купиш наступного разу.', 'Вежливо откажись — пряники купишь в следующий раз.', 'Politely decline — next time.'),
        [
          P('Nie, dziękuję. Może następnym razem.', true),
          P('Nie ma za co.', false, t('«Nie ma za co» — «нема за що», відповідь на подяку.', '«Nie ma za co» — «не за что», ответ на благодарность.', 'That answers “thank you”.')),
          P('Tak, nie.', false, t('Незрозуміло 🙂 Скажи: «Nie, dziękuję».', 'Непонятно 🙂 Скажи: «Nie, dziękuję».', 'Unclear 🙂 Say «Nie, dziękuję».')),
        ],
        { hint: t('następnym razem — наступного разу.', 'następnym razem — в следующий раз.', 'następnym razem = next time.'), explain: t('«Może następnym razem» — «Може, наступного разу» — м’яка відмова.', '«Może następnym razem» — «Может, в следующий раз» — мягкий отказ.', 'A soft refusal.') }),
      listen('total', npc('Razem czternaście złotych dwadzieścia groszy.', 'Разом чотирнадцять злотих двадцять грошів.', 'Итого четырнадцать злотых двадцать грошей.', 'Fourteen złoty twenty in total.'),
        AMOUNT_TASK,
        [
          T(t('14,20 zł'), true),
          T(t('40,20 zł'), false, t('czterdzieści = 40, czternaście = 14.', 'czterdzieści = 40, czternaście = 14.', 'czterdzieści = 40.')),
          T(t('14,02 zł'), false, t('dwadzieścia groszy = 20 грошів.', 'dwadzieścia groszy = 20 грошей.', 'dwadzieścia = 20.')),
        ],
        { hint: t('czternaście — 14.', 'czternaście — 14.', 'czternaście = 14.'), explain: t('czternaście złotych dwadzieścia groszy = 14,20 zł.', 'czternaście złotych dwadzieścia groszy = 14,20 zł.', '14,20 zł.'), words: ['dwadzieścia'] }),
    ],
    phrases: [
      ph('Co podać?', 'Що вам подати?', 'Что вам подать?', 'What can I get you?'),
      ph('Poproszę dwa pączki z różą.', 'Два пончики з трояндою, будь ласка.', 'Два пончика с розой, пожалуйста.', 'Two rose doughnuts, please.'),
      ph('I jeszcze kawałek sernika.', 'І ще шматок сирника.', 'И ещё кусок сырника.', 'And a piece of cheesecake.'),
      ph('Może następnym razem.', 'Може, наступного разу.', 'Может, в следующий раз.', 'Maybe next time.'),
    ],
  },

  // ───────────── 11. Вечір на Казимежі ─────────────
  {
    slug: 'kazimierz-zapiekanka', category: 'food', tags: [], city: 'krakow', scene: 'street-food',
    npc: { name: 'Pan Paweł', role: t('продавець', 'продавец', 'vendor') },
    title: t('Вечір на Казимежі', 'Вечер на Казимеже', 'An evening in Kazimierz'),
    goal: t('Замов запіканку з потрібними добавками й дізнайся, як дістатися додому нічним трамваєм.', 'Закажи запеканку с нужными добавками и узнай, как добраться домой ночным трамваем.', 'Order a zapiekanka and find the night tram home.'),
    intro: t('Вечір у Кракові. На площі Plac Nowy черга до віконець із запіканками.', 'Вечер в Кракове. На площади Plac Nowy очередь к окошкам с запеканками.', 'Evening in Kraków, a queue for zapiekanki at Plac Nowy.'),
    note: t('Zapiekanka — половинка багета, запечена з печерицями й сиром. На Plac Nowy у Казимежі їх продають у круглому павільйоні Okrąglak.', 'Zapiekanka — половинка багета, запечённая с шампиньонами и сыром. На Plac Nowy в Казимеже их продают в круглом павильоне Okrąglak.', 'A halved baguette baked with mushrooms and cheese; sold at the round Okrąglak pavilion on Plac Nowy.'),
    minutes: 4, xp: 40, zlotki: 20,
    steps: [
      listen('greet', npc('Dobry wieczór! Jaka zapiekanka?', 'Добрий вечір! Яку запіканку?', 'Добрый вечер! Какую запеканку?', 'Good evening! Which zapiekanka?'),
        t('Що сказав продавець?', 'Что сказал продавец?', 'What did the vendor say?'),
        [
          T(t('Добрий вечір! Яку запіканку?', 'Добрый вечер! Какую запеканку?', 'Good evening! Which zapiekanka?'), true),
          T(t('Добрий день! Скільки запіканок?', 'Добрый день! Сколько запеканок?', 'Hello! How many?')),
          T(t('На добраніч!', 'Спокойной ночи!', 'Good night!')),
        ],
        { hint: t('Dobry wieczór — добрий вечір.', 'Dobry wieczór — добрый вечер.', 'Dobry wieczór = good evening.'), explain: t('«Jaka zapiekanka?» — «Яка запіканка?» (з чим).', '«Jaka zapiekanka?» — «Какая запеканка?» (с чем).', 'Which kind?'), words: ['dobry wieczór', 'zapiekanka'], tags: ['dish:zapiekanka'] }),
      choice('classic', undefined, t('Замов класичну: з печерицями та сиром.', 'Закажи классическую: с шампиньонами и сыром.', 'Order the classic: mushrooms and cheese.'),
        [
          P('Klasyczną, z pieczarkami i serem.', true),
          P('Klasyczna, z pieczarki i ser.', false, t('z + орудний відмінок: z pieczarkami i serem.', 'z + творительный падеж: z pieczarkami i serem.', 'z + instrumental.')),
          P('Bez zapiekanki.', false, t('Так ти відмовляєшся від запіканки 🙂', 'Так ты отказываешься от запеканки 🙂', 'That refuses the zapiekanka 🙂')),
        ],
        { hint: t('pieczarki → z pieczarkami, ser → z serem.', 'pieczarki → z pieczarkami, ser → z serem.', 'z pieczarkami, z serem.'), explain: t('Знахідний «klasyczną» (яку?), далі z + орудний.', 'Винительный «klasyczną» (какую?), дальше z + творительный.', 'Accusative, then z + instrumental.'), words: ['pieczarki', 'ser', 'zapiekanka'], tags: ['dish:zapiekanka'] }),
      choice('ketchup', npc('Z keczupem?', 'З кетчупом?', 'С кетчупом?', 'With ketchup?'),
        t('Відповідай.', 'Ответь.', 'Answer.'),
        [
          P('Tak, z keczupem.', true),
          P('Bez keczupu, poproszę.', true),
          P('Bez keczup.', false, t('bez + родовий: bez keczupu.', 'bez + родительный: bez keczupu.', 'bez + genitive: bez keczupu.')),
        ],
        { hint: t('z + орудний, bez + родовий.', 'z + творительный, bez + родительный.', 'z + instr., bez + gen.'), explain: t('z keczupem — з кетчупом; bez keczupu — без кетчупу.', 'z keczupem — с кетчупом; bez keczupu — без кетчупа.', 'with / without ketchup.'), words: ['keczup'], tags: ['dish:zapiekanka'] }),
      build('wait', undefined, t('Запитай: «Скільки треба чекати?»', 'Спроси: «Сколько нужно ждать?»', 'Ask: “How long is the wait?”'),
        'Ile trzeba czekać?', ['czekam', 'kosztuje'],
        { hint: t('ile — скільки, trzeba — треба.', 'ile — сколько, trzeba — нужно.', 'ile = how much, trzeba = need to.'), explain: t('«Ile trzeba czekać?» — «Скільки треба чекати?»', '«Ile trzeba czekać?» — «Сколько нужно ждать?»', 'How long do I wait?'), words: ['czekać'] }),
      listen('minutes', npc('Pięć minut.', 'П’ять хвилин.', 'Пять минут.', 'Five minutes.'),
        t('Скільки чекати?', 'Сколько ждать?', 'How long?'),
        [
          T(t('5 хвилин', '5 минут', '5 minutes'), true),
          T(t('15 хвилин', '15 минут', '15 minutes'), false, t('piętnaście = 15, pięć = 5.', 'piętnaście = 15, pięć = 5.', 'piętnaście = 15.')),
          T(t('50 хвилин', '50 минут', '50 minutes'), false, t('pięćdziesiąt = 50.', 'pięćdziesiąt = 50.', 'pięćdziesiąt = 50.')),
        ],
        { hint: t('pięć — 5.', 'pięć — 5.', 'pięć = 5.'), explain: t('pięć minut — 5 хвилин.', 'pięć minut — 5 минут.', '5 minutes.'), words: ['pięć'] }),
      choice('night', undefined, t('Пізно. Запитай, де зупинка нічного трамвая.', 'Поздно. Спроси, где остановка ночного трамвая.', 'It’s late. Ask where the night tram stop is.'),
        [
          P('Przepraszam, gdzie jest przystanek nocnego tramwaju?', true),
          P('Przepraszam, kiedy jest noc?', false, t('«Коли ніч?» 🙂 Тобі потрібна зупинка: «Gdzie jest przystanek…?»', '«Когда ночь?» 🙂 Тебе нужна остановка: «Gdzie jest przystanek…?»', '“When is night?” 🙂')),
          P('Poproszę tramwaj.', false, t('Трамвай не замовляють 🙂 Запитай, де зупинка.', 'Трамвай не заказывают 🙂 Спроси, где остановка.', 'You can’t order a tram 🙂')),
        ],
        { hint: t('przystanek — зупинка, nocny — нічний.', 'przystanek — остановка, nocny — ночной.', 'przystanek = stop, nocny = night.'), explain: t('przystanek nocnego tramwaju — зупинка нічного трамвая (родовий відмінок).', 'przystanek nocnego tramwaju — остановка ночного трамвая.', 'Night tram stop.'), words: ['przystanek', 'tramwaj'], tags: ['city-transport'] }),
    ],
    phrases: [
      ph('Jaka zapiekanka?', 'Яку запіканку?', 'Какую запеканку?', 'Which zapiekanka?'),
      ph('z pieczarkami i serem', 'з печерицями та сиром', 'с шампиньонами и сыром', 'with mushrooms and cheese'),
      ph('Bez keczupu, poproszę.', 'Без кетчупу, будь ласка.', 'Без кетчупа, пожалуйста.', 'No ketchup, please.'),
      ph('Ile trzeba czekać?', 'Скільки треба чекати?', 'Сколько нужно ждать?', 'How long is the wait?'),
    ],
  },

  // ───────────── 12. Lidl ─────────────
  {
    slug: 'lidl-list', category: 'shop', tags: ['store', 'checkout'], city: 'poznan', scene: 'supermarket',
    npc: { name: 'Pani Agata', role: t('працівниця магазину', 'сотрудница магазина', 'shop assistant') },
    title: t('Список покупок у Lidlu', 'Список покупок в Lidlе', 'Shopping list at Lidl'),
    goal: t('Прочитай список, знайди відділи й розрахуйся на касі самообслуговування.', 'Прочитай список, найди отделы и рассчитайся на кассе самообслуживания.', 'Read the list, find aisles and use the self-checkout.'),
    intro: t('Сусід по квартирі дав Бобеку список покупок польською.', 'Сосед по квартире дал Бобеку список покупок на польском.', 'Bobek’s flatmate gave him a shopping list in Polish.'),
    note: t('Lidl — мережа супермаркетів; тут — лише контекст навчальної ситуації. Ціна навчальна.', 'Lidl — сеть супермаркетов; здесь — лишь контекст учебной ситуации. Цена учебная.', 'Lidl is a supermarket chain, used as learning context.'),
    minutes: 5, xp: 45, zlotki: 20,
    steps: [
      choice('list', narr('Lista: mleko, jajka, ryż, pomidory, płyn do naczyń.', 'Список: молоко, яйця, рис, помідори, засіб для посуду.', 'Список: молоко, яйца, рис, помидоры, средство для посуды.', 'List: milk, eggs, rice, tomatoes, washing-up liquid.'),
        t('Що зі списку — засіб для миття посуду?', 'Что из списка — средство для мытья посуды?', 'Which item is washing-up liquid?'),
        [
          P('płyn do naczyń', true),
          P('ryż', false, t('ryż — рис.', 'ryż — рис.', 'ryż = rice.')),
          P('jajka', false, t('jajka — яйця.', 'jajka — яйца.', 'jajka = eggs.')),
        ],
        { hint: t('naczynia — посуд.', 'naczynia — посуда.', 'naczynia = dishes.'), explain: t('płyn — рідина, do naczyń — для посуду.', 'płyn — жидкость, do naczyń — для посуды.', 'płyn do naczyń = washing-up liquid.'), words: ['płyn do naczyń', 'jajko', 'ryż', 'mleko'] }),
      choice('dairy', narr('Działy: Pieczywo · Nabiał · Chemia · Owoce i warzywa', 'Відділи: Хліб · Молочне · Побутова хімія · Фрукти й овочі', 'Отделы: Хлеб · Молочное · Бытовая химия · Фрукты и овощи', 'Sections: Bread · Dairy · Household · Fruit & veg'),
        t('У якому відділі шукати молоко?', 'В каком отделе искать молоко?', 'Where do you find milk?'),
        [
          P('Nabiał', true),
          P('Pieczywo', false, t('Pieczywo — хліб і випічка.', 'Pieczywo — хлеб и выпечка.', 'Pieczywo = bread.')),
          P('Chemia', false, t('Chemia — побутова хімія (там і płyn do naczyń).', 'Chemia — бытовая химия (там и płyn do naczyń).', 'Chemia = household products.')),
        ],
        { hint: t('nabiał — молочні продукти.', 'nabiał — молочные продукты.', 'nabiał = dairy.'), explain: t('Nabiał — молочні продукти: mleko, ser, jogurt, masło.', 'Nabiał — молочные продукты: mleko, ser, jogurt, masło.', 'Dairy products.'), words: ['nabiał'] }),
      choice('rice', undefined, t('Запитай працівницю, де рис.', 'Спроси сотрудницу, где рис.', 'Ask where the rice is.'),
        [
          P('Przepraszam, gdzie jest ryż?', true),
          P('Przepraszam, gdzie są ryż?', false, t('Ryż — однина, тому «jest».', 'Ryż — единственное число, поэтому «jest».', 'Ryż is singular: jest.')),
          P('Gdzie ryżu?', false, t('Бракує дієслова: «Gdzie jest ryż?»', 'Не хватает глагола: «Gdzie jest ryż?»', 'Missing the verb.')),
        ],
        { hint: t('однина → jest.', 'единственное → jest.', 'singular → jest.'), explain: t('gdzie jest + однина.', 'gdzie jest + единственное.', 'jest + singular.'), words: ['ryż', 'gdzie'] }),
      listen('aisle', npc('Ryż jest w alejce numer pięć, obok makaronu.', 'Рис у проході номер п’ять, поруч із макаронами.', 'Рис в проходе номер пять, рядом с макаронами.', 'Rice is in aisle five, next to the pasta.'),
        t('Де рис?', 'Где рис?', 'Where is the rice?'),
        [
          T(t('у проході №5, поруч із макаронами', 'в проходе №5, рядом с макаронами', 'aisle 5, next to the pasta'), true),
          T(t('у проході №15, біля хліба', 'в проходе №15, у хлеба', 'aisle 15, by the bread'), false, t('pięć = 5, piętnaście = 15.', 'pięć = 5, piętnaście = 15.', 'pięć = 5.')),
          T(t('біля каси', 'у кассы', 'by the checkout')),
        ],
        { hint: t('alejka — прохід між полицями.', 'alejka — проход между полками.', 'alejka = aisle.'), explain: t('w alejce numer pięć — у проході №5; obok makaronu — поруч із макаронами.', 'w alejce numer pięć — в проходе №5; obok makaronu — рядом с макаронами.', 'aisle 5, next to pasta.'), words: ['alejka', 'obok', 'pięć'] }),
      build('eggs', undefined, t('Склади: «Беру десять яєць».', 'Составь: «Беру десять яиц».', 'Build: “I’m taking ten eggs.”'),
        'Biorę dziesięć jajek.', ['jajka', 'dziesięciu'],
        { hint: t('Після 5+ — родовий множини: jajek.', 'После 5+ — родительный множественного: jajek.', 'After 5+: genitive plural jajek.'), explain: t('dwa / trzy / cztery jajka, але pięć, dziesięć jajek.', 'dwa / trzy / cztery jajka, но pięć, dziesięć jajek.', '2–4 jajka, 5+ jajek.'), words: ['jajko', 'dziesięć'] }),
      choice('selfcheckout', narr('Kasa samoobsługowa: „Zeskanuj produkt”.', 'Каса самообслуговування: «Відскануй товар».', 'Касса самообслуживания: «Отсканируй товар».', 'Self-checkout: “Scan the item.”'),
        t('Що просить каса?', 'Что просит касса?', 'What does the machine ask?'),
        [
          T(t('відсканувати товар', 'отсканировать товар', 'scan the item'), true),
          T(t('покликати касира', 'позвать кассира', 'call a cashier')),
          T(t('покласти товар назад на полицю', 'вернуть товар на полку', 'put the item back')),
        ],
        { hint: t('zeskanuj — відскануй.', 'zeskanuj — отсканируй.', 'zeskanuj = scan.'), explain: t('kasa samoobsługowa — каса самообслуговування; produkt — товар.', 'kasa samoobsługowa — касса самообслуживания; produkt — товар.', 'self-checkout; produkt = item.'), words: ['kasa samoobsługowa'] }),
      listen('total', narr('Do zapłaty: trzydzieści jeden złotych sześćdziesiąt groszy.', 'До сплати: тридцять один злотий шістдесят грошів.', 'К оплате: тридцать один злотый шестьдесят грошей.', 'To pay: thirty-one złoty sixty.'),
        AMOUNT_TASK,
        [
          T(t('31,60 zł'), true),
          T(t('13,60 zł'), false, t('trzynaście = 13, trzydzieści jeden = 31.', 'trzynaście = 13, trzydzieści jeden = 31.', 'trzynaście = 13.')),
          T(t('31,16 zł'), false, t('sześćdziesiąt = 60, szesnaście = 16.', 'sześćdziesiąt = 60, szesnaście = 16.', 'sześćdziesiąt = 60.')),
        ],
        { hint: t('trzydzieści — 30, sześćdziesiąt — 60.', 'trzydzieści — 30, sześćdziesiąt — 60.', '30 and 60.'), explain: t('«Do zapłaty» — «до сплати». trzydzieści jeden złotych sześćdziesiąt groszy = 31,60 zł.', '«Do zapłaty» — «к оплате». 31,60 zł.', '«Do zapłaty» = amount due.'), words: ['trzydzieści', 'jeden'] }),
    ],
    phrases: [
      ph('płyn do naczyń', 'засіб для миття посуду', 'средство для мытья посуды', 'washing-up liquid'),
      ph('Nabiał', 'Молочні продукти', 'Молочные продукты', 'Dairy'),
      ph('Gdzie jest ryż?', 'Де рис?', 'Где рис?', 'Where is the rice?'),
      ph('Biorę dziesięć jajek.', 'Беру десять яєць.', 'Беру десять яиц.', 'I’m taking ten eggs.'),
      ph('Zeskanuj produkt.', 'Відскануй товар.', 'Отсканируй товар.', 'Scan the item.'),
    ],
  },

  // ───────────── 13. Rossmann ─────────────
  {
    slug: 'rossmann-basics', category: 'shop', tags: ['store', 'checkout'], city: 'wroclaw', scene: 'drugstore',
    npc: { name: 'Pani Natalia', role: t('консультантка', 'консультант', 'shop assistant') },
    title: t('Rossmann: найнеобхідніше', 'Rossmann: самое нужное', 'Rossmann: the essentials'),
    goal: t('Купи зубну пасту, шампунь і мило, зрозумій консультантку й оплати карткою.', 'Купи зубную пасту, шампунь и мыло, пойми консультанта и оплати картой.', 'Buy toothpaste, shampoo and soap and pay by card.'),
    intro: t('Бобек щойно переїхав у нову квартиру — треба купити засоби гігієни.', 'Бобек только что переехал в новую квартиру — нужно купить средства гигиены.', 'Bobek just moved in and needs toiletries.'),
    note: t('Rossmann — мережа магазинів косметики та побутових товарів; тут — лише контекст навчальної ситуації. Ціна навчальна.', 'Rossmann — сеть магазинов косметики и бытовых товаров; здесь — лишь контекст учебной ситуации. Цена учебная.', 'Rossmann is a drugstore chain, used as learning context.'),
    minutes: 4, xp: 40, zlotki: 20,
    steps: [
      choice('list', narr('Bobek potrzebuje: pasta do zębów, szampon, mydło.', 'Бобеку потрібні: зубна паста, шампунь, мило.', 'Бобеку нужны: зубная паста, шампунь, мыло.', 'Bobek needs: toothpaste, shampoo, soap.'),
        t('Що таке «pasta do zębów»?', 'Что такое «pasta do zębów»?', 'What is «pasta do zębów»?'),
        [
          T(t('зубна паста', 'зубная паста', 'toothpaste'), true),
          T(t('макарони', 'макароны', 'pasta (food)'), false, t('Макарони — makaron. «Pasta do zębów» — паста для зубів.', 'Макароны — makaron. «Pasta do zębów» — паста для зубов.', 'Pasta (food) is makaron.')),
          T(t('шампунь', 'шампунь', 'shampoo')),
        ],
        { hint: t('zęby — зуби.', 'zęby — зубы.', 'zęby = teeth.'), explain: t('pasta do zębów — зубна паста; szampon — шампунь; mydło — мило.', 'pasta do zębów — зубная паста; szampon — шампунь; mydło — мыло.', 'toothpaste, shampoo, soap.'), words: ['pasta do zębów', 'szampon', 'mydło'] }),
      choice('find', undefined, t('Запитай, де знайти шампунь.', 'Спроси, где найти шампунь.', 'Ask where to find shampoo.'),
        [
          P('Przepraszam, gdzie znajdę szampon?', true),
          P('Przepraszam, gdzie znajdę szamponu?', false, t('znaleźć (що?) — знахідний: szampon.', 'znaleźć (что?) — винительный: szampon.', 'Accusative: szampon.')),
          P('Szampon jest jest gdzie?', false, t('Порядок слів: «Gdzie jest szampon?» або «Gdzie znajdę szampon?»', 'Порядок слов: «Gdzie jest szampon?» или «Gdzie znajdę szampon?»', 'Word order.')),
        ],
        { hint: t('znajdę — знайду.', 'znajdę — найду.', 'znajdę = I’ll find.'), explain: t('«Gdzie znajdę…?» — «Де я знайду…?» — дуже природне питання в магазині.', '«Gdzie znajdę…?» — «Где я найду…?» — очень естественный вопрос в магазине.', 'Natural shop question.'), words: ['szampon', 'gdzie'] }),
      listen('where', npc('Szampony są na końcu sklepu, po lewej stronie.', 'Шампуні в кінці магазину, ліворуч.', 'Шампуни в конце магазина, слева.', 'Shampoos are at the back of the shop, on the left.'),
        t('Де шампуні?', 'Где шампуни?', 'Where are the shampoos?'),
        [
          T(t('у кінці магазину, ліворуч', 'в конце магазина, слева', 'at the back, on the left'), true),
          T(t('біля входу, праворуч', 'у входа, справа', 'by the entrance, on the right'), false, t('na końcu — у кінці; po lewej — ліворуч.', 'na końcu — в конце; po lewej — слева.', 'na końcu = at the end; po lewej = left.')),
          T(t('на другому поверсі', 'на втором этаже', 'upstairs')),
        ],
        { hint: t('po lewej stronie — ліворуч.', 'po lewej stronie — слева.', 'po lewej = on the left.'), explain: t('na końcu sklepu — у кінці магазину; po lewej stronie — з лівого боку.', 'na końcu sklepu — в конце магазина; po lewej stronie — с левой стороны.', 'at the back, on the left.'), words: ['sklep'] }),
      listen('skin', npc('Szuka pan czegoś dla skóry wrażliwej?', 'Ви шукаєте щось для чутливої шкіри?', 'Вы ищете что-то для чувствительной кожи?', 'Are you looking for something for sensitive skin?'),
        t('Що питає консультантка?', 'Что спрашивает консультант?', 'What is she asking?'),
        [
          T(t('чи шукаєш щось для чутливої шкіри', 'ищешь ли ты что-то для чувствительной кожи', 'if you need something for sensitive skin'), true),
          T(t('чи маєш картку магазину', 'есть ли у тебя карта магазина', 'if you have a store card')),
          T(t('чи потрібен пакет', 'нужен ли пакет', 'if you need a bag')),
        ],
        { hint: t('skóra — шкіра, wrażliwa — чутлива.', 'skóra — кожа, wrażliwa — чувствительная.', 'skóra = skin.'), explain: t('«Szuka pan czegoś…?» — ввічливе «Ви шукаєте щось…?»', '«Szuka pan czegoś…?» — вежливое «Вы ищете что-то…?»', 'Polite question.') }),
      build('card', undefined, t('Запитай на касі: «Чи можу я заплатити карткою?»', 'Спроси на кассе: «Могу ли я заплатить картой?»', 'Ask: “Can I pay by card?”'),
        'Czy mogę zapłacić kartą?', ['karta', 'płacę'],
        { hint: t('Czy mogę… — Чи можу я…', 'Czy mogę… — Могу ли я…', 'Czy mogę… = Can I…'), explain: t('mogę + інфінітив: mogę zapłacić. Чим? — kartą.', 'mogę + инфинитив: mogę zapłacić. Чем? — kartą.', 'mogę + infinitive.'), words: ['karta'] }),
      listen('total', npc('Dwadzieścia siedem złotych dziewięćdziesiąt dziewięć groszy.', 'Двадцять сім злотих дев’яносто дев’ять грошів.', 'Двадцать семь злотых девяносто девять грошей.', 'Twenty-seven złoty ninety-nine.'),
        AMOUNT_TASK,
        [
          T(t('27,99 zł'), true),
          T(t('72,99 zł'), false, t('dwadzieścia siedem = 27, а siedemdziesiąt dwa = 72.', 'dwadzieścia siedem = 27, а siedemdziesiąt dwa = 72.', '27, not 72.')),
          T(t('27,19 zł'), false, t('dziewięćdziesiąt dziewięć = 99.', 'dziewięćdziesiąt dziewięć = 99.', '99 groszy.')),
        ],
        { hint: t('dwadzieścia siedem — 27.', 'dwadzieścia siedem — 27.', '27.'), explain: t('27,99 zł — dwadzieścia siedem złotych dziewięćdziesiąt dziewięć groszy.', '27,99 zł — dwadzieścia siedem złotych dziewięćdziesiąt dziewięć groszy.', '27,99 zł.'), words: ['siedem', 'dwadzieścia'] }),
    ],
    phrases: [
      ph('pasta do zębów, szampon, mydło', 'зубна паста, шампунь, мило', 'зубная паста, шампунь, мыло', 'toothpaste, shampoo, soap'),
      ph('Gdzie znajdę szampon?', 'Де знайти шампунь?', 'Где найти шампунь?', 'Where can I find shampoo?'),
      ph('na końcu sklepu, po lewej stronie', 'у кінці магазину, ліворуч', 'в конце магазина, слева', 'at the back, on the left'),
      ph('Czy mogę zapłacić kartą?', 'Чи можу я заплатити карткою?', 'Могу ли я заплатить картой?', 'Can I pay by card?'),
    ],
  },
];

/** Місії, що готуються (показуються як «скоро», без можливості почати). */
export const MISSIONS_SOON: { slug: string; category: MissionCategory; scene: string; title: I18n }[] = [
  { slug: 'landlord', category: 'home', scene: 'flat', title: t('Розмова з власником квартири', 'Разговор с хозяином квартиры', 'Talking to the landlord') },
  { slug: 'first-workday', category: 'work', scene: 'work', title: t('Перший день на роботі', 'Первый день на работе', 'First day at work') },
  { slug: 'doctor-appointment', category: 'home', scene: 'clinic', title: t('Запис до лікаря', 'Запись к врачу', 'Booking a doctor') },
];

export const missionBySlug = (slug: string) => MISSIONS.find((m) => m.slug === slug);
