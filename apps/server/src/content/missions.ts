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
import { SEASON_MISSIONS } from './seasons';
import { TRAVEL_MISSIONS } from './missions-travel';

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
/** season — місія сезонного пропуску (content/seasons.ts): у загальному списку її немає, лише в пропуску. */
export type MissionCategory = 'shop' | 'food' | 'road' | 'transport' | 'home' | 'work' | 'season';
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
  /** Костюм за перше проходження (slug предмета гардероба). */
  rewardItem?: string;
  /** Сцена Premium: почати можна лише з активним Premium (решта місій — для всіх). */
  premium?: boolean;
  /** Сезон пропуску (slug у SEASONS): доступ — за датами сезону й Premium, див. content/seasons.ts. */
  season?: string;
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
          T(t('Ви можете мені допомогти?', 'Вы можете мне помочь?', 'Can you help me?'), false, t('Так питає покупець. «W czym mogę pomóc?» — «Чим я можу допомогти?»: mogę — я можу.', 'Так спрашивает покупатель. «W czym mogę pomóc?» — «Чем я могу помочь?»: mogę — я могу.', 'That’s the customer’s question. «Mogę pomóc» = I can help.')),
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
          P('Z sos czosnkowy.', false, t('Після «z» — орудний відмінок: z sosem czosnkowym.', 'После «z» — творительный падеж: z sosem czosnkowym.', 'After «z» use the instrumental: z sosem czosnkowym.')),
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
          P('Nie ma za co. Do widzenia!', false, t('«Nie ma za co» — відповідь на «дякую», а тобі пропонують чек. Скажи «Tak, poproszę» або «Nie, dziękuję».', '«Nie ma za co» — ответ на «спасибо», а тебе предлагают чек. Скажи «Tak, poproszę» или «Nie, dziękuję».', '«Nie ma za co» answers “thank you”; she offers a receipt.')),
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
    slug: 'krakow-pierogi', rewardItem: 'costume-chef', category: 'food', tags: ['restaurant'], city: 'krakow', scene: 'cafe-pierogi',
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
          P('Na miejsce, poproszę. Czy mogę prosić menu?', false, t('Де? — місцевий відмінок: na miejscu. «Na miejsce» відповідає на «куди?».', 'Где? — предложный падеж: na miejscu. «Na miejsce» отвечает на «куда?».', 'Where? — locative: na miejscu. «Na miejsce» answers “where to?”.')),
          P('Na wynos, poproszę. Czy mogę prosić menu?', false, t('«Na wynos» — з собою. Ти хочеш поїсти тут: «na miejscu».', '«Na wynos» — с собой. Ты хочешь поесть здесь: «na miejscu».', '«Na wynos» = to go. You want to eat here: «na miejscu».')),
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
          P('Czy w pierogach z kapustą i grzybami są mięso?', false, t('Mięso — однина, тому «jest»: «Czy … jest mięso?»', 'Mięso — единственное число, поэтому «jest»: «Czy … jest mięso?»', 'Mięso is singular, so «jest».')),
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
          P('Poproszę paragon.', false, t('Paragon — касовий чек, його дають після оплати. Щоб заплатити в ресторані, просять rachunek.', 'Paragon — кассовый чек, его дают после оплаты. Чтобы заплатить в ресторане, просят rachunek.', 'A paragon is the receipt you get after paying. To pay, ask for the rachunek.')),
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
        { hint: t('dwadzieścia trzy — 23, czterdzieści — 40.', 'dwadzieścia trzy — 23, czterdzieści — 40.', '23 and 40.'), explain: t('Після 2, 3, 4 кажуть «złote»: dwa złote, dwadzieścia trzy złote; після 5–21 — «złotych».', 'После 2, 3, 4 говорят «złote»: dwa złote, dwadzieścia trzy złote; после 5–21 — «złotych».', 'After 2–4: złote; after 5–21: złotych.'), words: ['dwadzieścia', 'trzy'] }),
      choice('bye', npc('Proszę paragon. Do widzenia!', 'Ось чек. До побачення!', 'Вот чек. До свидания!', 'Here’s your receipt. Goodbye!'),
        t('Попрощайся.', 'Попрощайся.', 'Say goodbye.'),
        [
          P('Dziękuję, do widzenia!', true),
          P('Dzień dobry!', false, t('Це привітання. Прощаються: «Do widzenia!»', 'Это приветствие. Прощаются: «Do widzenia!»', 'That’s a greeting. Say «Do widzenia!»')),
          P('Proszę bardzo, do widzenia!', false, t('«Proszę bardzo» кажуть, коли щось даєш або у відповідь на «дякую». Ти отримав чек — подякуй: «Dziękuję».', '«Proszę bardzo» говорят, когда что-то даёшь или в ответ на «спасибо». Ты получил чек — поблагодари: «Dziękuję».', '«Proszę bardzo» is said when giving something. You got the receipt — say «Dziękuję».')),
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
    slug: 'orlen-coffee', rewardItem: 'costume-barista', category: 'road', tags: ['checkout'], city: 'gdansk', scene: 'petrol-station',
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
          P('Na wynosie, poproszę.', false, t('«Na wynos» не змінюється: na miejscu — тут, na wynos — з собою.', '«Na wynos» не изменяется: na miejscu — здесь, na wynos — с собой.', '«Na wynos» never changes its form.')),
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
          P('Nie, dziękuję. To wszystkie.', false, t('«Wszystkie» — «усі (вони)», множина. «Це все» — «To wszystko».', '«Wszystkie» — «все (они)», множественное число. «Это всё» — «To wszystko».', '«Wszystkie» = all of them. “That’s all” = «To wszystko».')),
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
          P('Przepraszam, jak dojść do Gdańska?', false, t('«Dojść» — дійти пішки. До Ґданська їдуть машиною: «dojechać».', '«Dojść» — дойти пешком. До Гданьска едут на машине: «dojechać».', '«Dojść» = get there on foot. By car: «dojechać».')),
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
          P('Paragonu, poproszę.', false, t('«Poproszę» + знахідний: paragon. Родовий «paragonu» — після заперечення: «nie potrzebuję paragonu».', '«Poproszę» + винительный: paragon. Родительный «paragonu» — после отрицания: «nie potrzebuję paragonu».', '«Poproszę» takes the accusative: paragon. «Paragonu» follows a negation.')),
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
          P('Na zdrowie!', false, t('«Na zdrowie» кажуть після чхання або як тост. «Szerokiej drogi!» — «Щасливої дороги!», подякуй: «Dziękuję!»', '«Na zdrowie» говорят после чиха или как тост. «Szerokiej drogi!» — «Счастливого пути!», поблагодари: «Dziękuję!»', '«Na zdrowie» is for a sneeze or a toast. Just say thanks.')),
          P('Wzajemnie, szerokiej drogi!', false, t('«Szerokiej drogi» бажають тому, хто їде. Касирка лишається на роботі — просто подякуй.', '«Szerokiej drogi» желают тому, кто едет. Кассирша остаётся на работе — просто поблагодари.', 'The cashier isn’t travelling — just say thanks.')),
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
          P('Przepraszam, czy ten tramwaj jedzie do dworzec?', false, t('Після «do» — родовий: do dworca. Або «na dworzec».', 'После «do» — родительный: do dworca. Или «na dworzec».', 'After «do» use the genitive: do dworca — or say «na dworzec».')),
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
    slug: 'train-wroclaw', rewardItem: 'costume-conductor', category: 'transport', tags: [], city: 'warszawa', scene: 'train-station',
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
          P('Na jedną stronę.', false, t('Квиток в один бік — з прийменником w: «w jedną stronę».', 'Билет в одну сторону — с предлогом w: «w jedną stronę».', 'One way = «w jedną stronę» (with w).')),
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
          P('Tak, poproszę placki ze śmietana.', false, t('Після «ze» — орудний відмінок з носовим -ą: ze śmietaną.', 'После «ze» — творительный падеж с носовым -ą: ze śmietaną.', 'After «ze» use the instrumental: ze śmietaną.')),
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
    goal: t('Купи пончики з начинкою, шматок сирника й пакет торунських пряників у подарунок.', 'Купи пончики с начинкой, кусок сырника и пакет торуньских пряников в подарок.', 'Buy doughnuts, cheesecake and a bag of Toruń gingerbread as a gift.'),
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
        t('Візьми пакет пряників у подарунок.', 'Возьми пакет пряников в подарок.', 'Take a bag of gingerbread as a gift.'),
        [
          P('Tak, poproszę torebkę pierników na prezent.', true),
          P('Tak, poproszę torebkę pierniki na prezent.', false, t('Пакет чого? — родовий множини: torebka **pierników**.', 'Пакет чего? — родительный множественного: torebka **pierników**.', 'A bag of what? Genitive plural: **pierników**.')),
          P('Tak, poproszę torebkę pierników na prezentem.', false, t('У подарунок — **na** + знахідний: **na prezent**.', 'В подарок — **na** + винительный: **na prezent**.', 'As a gift: **na prezent** (accusative).')),
        ],
        { hint: t('torebka + родовий множини: piernik → pierników; na prezent — у подарунок.', 'torebka + родительный множественного: piernik → pierników; na prezent — в подарок.', 'torebka + genitive plural; na prezent = as a gift.'), explain: t('«Torebka pierników na prezent» — пакет пряників у подарунок. Після слів кількості (torebka, kilo, pudełko) — родовий: pierników.', '«Torebka pierników na prezent» — пакет пряников в подарок. После слов количества (torebka, kilo, pudełko) — родительный: pierników.', 'After quantity words (torebka, kilo, pudełko) use the genitive: pierników.'), words: ['prezent'] }),
      listen('total', npc('Razem czterdzieści złotych dwadzieścia groszy.', 'Разом сорок злотих двадцять грошів.', 'Итого сорок злотых двадцать грошей.', 'Forty złoty twenty in total.'),
        AMOUNT_TASK,
        [
          T(t('40,20 zł'), true),
          T(t('14,20 zł'), false, t('czternaście = 14, czterdzieści = 40.', 'czternaście = 14, czterdzieści = 40.', 'czternaście = 14.')),
          T(t('40,02 zł'), false, t('dwadzieścia groszy = 20 грошів.', 'dwadzieścia groszy = 20 грошей.', 'dwadzieścia = 20.')),
        ],
        { hint: t('czterdzieści — 40.', 'czterdzieści — 40.', 'czterdzieści = 40.'), explain: t('czterdzieści złotych dwadzieścia groszy = 40,20 zł. Не плутай із czternaście — 14.', 'czterdzieści złotych dwadzieścia groszy = 40,20 zł. Не путай с czternaście — 14.', '40,20 zł; don’t mix up with czternaście (14).'), words: ['dwadzieścia'] }),
    ],
    phrases: [
      ph('Co podać?', 'Що вам подати?', 'Что вам подать?', 'What can I get you?'),
      ph('Poproszę dwa pączki z różą.', 'Два пончики з трояндою, будь ласка.', 'Два пончика с розой, пожалуйста.', 'Two rose doughnuts, please.'),
      ph('I jeszcze kawałek sernika.', 'І ще шматок сирника.', 'И ещё кусок сырника.', 'And a piece of cheesecake.'),
      ph('Poproszę torebkę pierników na prezent.', 'Пакет пряників у подарунок, будь ласка.', 'Пакет пряников в подарок, пожалуйста.', 'A bag of gingerbread as a gift, please.'),
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
          P('Klasyczną, z pieczarkami i z serom.', false, t('Орудний від «ser» — «serem», не «serom» (як «з сиром»).', 'Творительный от «ser» — «serem», не «serom» (как «с сыром»).', 'Instrumental of «ser» is «serem».')),
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
          P('Przepraszam, gdzie jest przystanek nocny tramwaj?', false, t('Зупинка чого? — родовий відмінок: przystanek nocnego tramwaju.', 'Остановка чего? — родительный падеж: przystanek nocnego tramwaju.', 'Stop of what? — genitive: nocnego tramwaju.')),
          P('Przepraszam, gdzie jest przystanek nocnego autobusu?', false, t('Ти шукаєш нічний трамвай (tramwaj), а не автобус.', 'Ты ищешь ночной трамвай (tramwaj), а не автобус.', 'You need the night tram, not a bus.')),
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
        { hint: t('Після 5–21 — родовий множини: jajek.', 'После 5–21 — родительный множественного: jajek.', 'After 5–21: genitive plural jajek.'), explain: t('dwa / trzy / cztery jajka, але pięć, dziesięć jajek.', 'dwa / trzy / cztery jajka, но pięć, dziesięć jajek.', '2–4 jajka, 5–21 jajek.'), words: ['jajko', 'dziesięć'] }),
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
          P('Przepraszam, gdzie jest szampony?', false, t('Szampony — множина, з нею «są». Ти шукаєш один: «gdzie jest szampon?» або «gdzie znajdę szampon?»', 'Szampony — множественное число, с ним «są». Ты ищешь один: «gdzie jest szampon?» или «gdzie znajdę szampon?»', 'Szampony is plural (są). For one: «gdzie jest szampon?»')),
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

  // ───────────── Перший візит до urzędu ─────────────
  {
    slug: 'urzad-pesel', category: 'home', tags: [], city: 'warszawa', scene: 'office',
    npc: { name: 'Pani Ewa', role: t('урядовиця у віконці', 'служащая в окошке', 'clerk at the counter') },
    title: t('Перший візит до urzędu', 'Первый визит в urząd', 'First visit to the urząd'),
    goal: t('Візьми номерок, знайди своє віконце, подай заяву на номер PESEL і ввічливо попрощайся.', 'Возьми номерок, найди своё окошко, подай заявление на номер PESEL и вежливо попрощайся.', 'Take a queue ticket, find your counter, apply for a PESEL number and say goodbye politely.'),
    intro: t('Бобек прийшов до urzędu у Варшаві, щоб отримати номер PESEL.', 'Бобек пришёл в urząd в Варшаве, чтобы получить номер PESEL.', 'Bobek has come to an office in Warsaw to get a PESEL number.'),
    note: t('Порядок, документи й терміни залежать від установи та твоєї ситуації; тут — загальна навчальна сцена.', 'Порядок, документы и сроки зависят от учреждения и твоей ситуации; здесь — общая учебная сцена.', 'Procedures, documents and timing depend on the office and your situation; this is a general practice scene.'),
    minutes: 5, xp: 45, zlotki: 20,
    steps: [
      choice('ticket', narr('W urzędzie stoi automat z numerkami.', 'В urzędzie стоїть автомат із номерками.', 'В urzędzie стоит автомат с номерками.', 'There is a queue-ticket machine in the office.'),
        t('Ти щойно прийшов. Що зробити спочатку?', 'Ты только что пришёл. Что сделать сначала?', 'You’ve just arrived. What do you do first?'),
        [
          T(t('взяти номерок в автоматі', 'взять номерок в автомате', 'take a ticket from the machine'), true),
          T(t('одразу підійти до будь-якого віконця', 'сразу подойти к любому окошку', 'go straight to any counter'), false, t('Зазвичай спершу беруть numerek і чекають, поки номер з’явиться на табло.', 'Обычно сначала берут numerek и ждут, пока номер появится на табло.', 'Usually you take a numerek first and wait for your number on the display.')),
          T(t('стати в кінець будь-якої черги', 'встать в конец любой очереди', 'join the end of any line'), false, t('Номерки для різних справ різні: в автоматі обирають свою справу.', 'Номерки для разных дел разные: в автомате выбирают своё дело.', 'Tickets differ by matter: choose yours on the machine.')),
        ],
        { hint: t('numerek — номерок у черзі.', 'numerek — номерок в очереди.', 'numerek = queue ticket.'), explain: t('«Proszę pobrać numerek» — «Візьміть номерок».', '«Proszę pobrać numerek» — «Возьмите номерок».', '“Proszę pobrać numerek” = “Please take a ticket.”'), words: ['numerek', 'urząd'], tags: ['urzad'] }),
      listen('display', narr('Numer A czterdzieści siedem, stanowisko numer trzy.', 'Номер А47, віконце номер 3.', 'Номер А47, окошко номер 3.', 'Number A47, counter number 3.'),
        t('У тебе номерок A47. Куди йти?', 'У тебя номерок A47. Куда идти?', 'Your ticket is A47. Where do you go?'),
        [
          T(t('до віконця (stanowisko) №3', 'к окошку (stanowisko) №3', 'to counter (stanowisko) 3'), true),
          T(t('до віконця №47', 'к окошку №47', 'to counter 47'), false, t('47 — твій номер у черзі, а stanowisko — номер віконця.', '47 — твой номер в очереди, а stanowisko — номер окошка.', '47 is your queue number; stanowisko is the counter.')),
          T(t('до каси', 'в кассу', 'to the cashier')),
        ],
        { hint: t('stanowisko — віконце, робоче місце.', 'stanowisko — окошко, рабочее место.', 'stanowisko = counter, desk.'), explain: t('На табло показують номер і stanowisko — віконце, куди підійти.', 'На табло показывают номер и stanowisko — окошко, куда подойти.', 'The display shows your number and the counter to go to.'), words: ['stanowisko', 'okienko'], tags: ['urzad'] }),
      choice('purpose', undefined, t('Підійди до віконця й скажи, навіщо прийшов.', 'Подойди к окошку и скажи, зачем пришёл.', 'Go to the counter and say why you came.'),
        [
          P('Dzień dobry, chciałbym złożyć wniosek o numer PESEL.', true),
          P('Dzień dobry, chciałbym kupić numer PESEL.', false, t('PESEL не купують: подають заяву — złożyć wniosek.', 'PESEL не покупают: подают заявление — złożyć wniosek.', 'You don’t buy a PESEL; you apply for it: złożyć wniosek.')),
          P('Cześć, daj mi PESEL.', false, t('Занадто фамільярно: в urzędzie кажуть «Dzień dobry» і звертаються на «pan/pani».', 'Слишком фамильярно: в urzędzie говорят «Dzień dobry» и обращаются на «pan/pani».', 'Too familiar: in an office say “Dzień dobry” and use pan/pani.')),
        ],
        { hint: t('złożyć wniosek — подати заяву.', 'złożyć wniosek — подать заявление.', 'złożyć wniosek = submit an application.'), explain: t('«Chciałbym złożyć wniosek o…» — ввічлива формула (жінка скаже «chciałabym»).', '«Chciałbym złożyć wniosek o…» — вежливая формула (женщина скажет «chciałabym»).', '“Chciałbym złożyć wniosek o…” is polite (a woman says “chciałabym”).'), words: ['wniosek'], tags: ['urzad'] }),
      listen('documents', npc('Poproszę paszport i wypełniony wniosek.', 'Прошу паспорт і заповнену заяву.', 'Пожалуйста, паспорт и заполненное заявление.', 'Your passport and the completed form, please.'),
        t('Що просить урядовиця?', 'Что просит служащая?', 'What does the clerk ask for?'),
        [
          T(t('паспорт і заповнену заяву', 'паспорт и заполненное заявление', 'your passport and the completed form'), true),
          T(t('фото і гроші', 'фото и деньги', 'a photo and money')),
          T(t('договір оренди', 'договор аренды', 'a rental agreement')),
        ],
        { hint: t('wypełniony — заповнений.', 'wypełniony — заполненный.', 'wypełniony = filled in.'), explain: t('«Poproszę…» — ввічливе «дайте, будь ласка…».', '«Poproszę…» — вежливое «дайте, пожалуйста…».', '“Poproszę…” = “May I have…”.'), words: ['paszport', 'wypełnić'], tags: ['urzad'] }),
      choice('form', narr('We wniosku jest pole „Data urodzenia”.', 'У заяві є поле «Дата народження».', 'В заявлении есть поле «Дата рождения».', 'The form has a field “Date of birth”.'),
        t('Що вписати в це поле?', 'Что вписать в это поле?', 'What goes in this field?'),
        [
          T(t('дату народження', 'дату рождения', 'your date of birth'), true),
          T(t('місце народження', 'место рождения', 'your place of birth'), false, t('Місце народження — miejsce urodzenia, а data — це дата.', 'Место рождения — miejsce urodzenia, а data — это дата.', 'Place of birth is miejsce urodzenia; data means date.')),
          T(t('дату приїзду до Польщі', 'дату приезда в Польшу', 'the date you came to Poland')),
        ],
        { hint: t('data — дата, urodzenie — народження.', 'data — дата, urodzenie — рождение.', 'data = date, urodzenie = birth.'), explain: t('Data urodzenia — дата народження, miejsce urodzenia — місце народження.', 'Data urodzenia — дата рождения, miejsce urodzenia — место рождения.', 'Data urodzenia = date of birth.'), words: ['data urodzenia'], tags: ['urzad'] }),
      listen('wait', npc('Proszę chwilę poczekać, zaraz wydrukuję potwierdzenie.', 'Зачекайте хвилинку, зараз роздрукую підтвердження.', 'Подождите минутку, сейчас распечатаю подтверждение.', 'Please wait a moment, I’ll print the confirmation right away.'),
        t('Що сказала урядовиця?', 'Что сказала служащая?', 'What did the clerk say?'),
        [
          T(t('зачекати хвилинку — вона роздрукує підтвердження', 'подождать минутку — она распечатает подтверждение', 'wait a moment — she’ll print a confirmation'), true),
          T(t('прийти завтра', 'прийти завтра', 'come back tomorrow')),
          T(t('заплатити в касі', 'заплатить в кассе', 'pay at the cashier')),
        ],
        { hint: t('chwila — хвилинка, potwierdzenie — підтвердження.', 'chwila — минутка, potwierdzenie — подтверждение.', 'chwila = a moment; potwierdzenie = confirmation.'), explain: t('«Proszę chwilę poczekać» — «Зачекайте хвилинку».', '«Proszę chwilę poczekać» — «Подождите минутку».', '“Proszę chwilę poczekać” = “Please wait a moment.”'), words: ['potwierdzenie', 'czekać'], tags: ['urzad'] }),
      build('bye', undefined, t('Подякуй і попрощайся.', 'Поблагодари и попрощайся.', 'Thank her and say goodbye.'),
        'Dziękuję bardzo, do widzenia.', ['cześć', 'proszę'],
        { hint: t('do widzenia — до побачення.', 'do widzenia — до свидания.', 'do widzenia = goodbye.'), explain: t('В установі прощаються «Do widzenia», а не «Cześć».', 'В учреждении прощаются «Do widzenia», а не «Cześć».', 'In an office, say “Do widzenia”, not “Cześć”.'), words: ['dziękuję', 'do widzenia'], tags: ['urzad'] }),
    ],
    phrases: [
      ph('Proszę pobrać numerek.', 'Візьміть номерок.', 'Возьмите номерок.', 'Please take a ticket.'),
      ph('Chciałbym złożyć wniosek o numer PESEL.', 'Я хотів би подати заяву на номер PESEL.', 'Я хотел бы подать заявление на номер PESEL.', 'I’d like to apply for a PESEL number.'),
      ph('Poproszę paszport.', 'Прошу паспорт.', 'Паспорт, пожалуйста.', 'Your passport, please.'),
      ph('Proszę chwilę poczekać.', 'Зачекайте хвилинку.', 'Подождите минутку.', 'Please wait a moment.'),
      ph('Dziękuję bardzo, do widzenia.', 'Дуже дякую, до побачення.', 'Большое спасибо, до свидания.', 'Thank you very much, goodbye.'),
    ],
  },

  // ───────────── 15. Premium: оренда квартири ─────────────
  {
    slug: 'landlord', premium: true, category: 'home', tags: ['rent'], city: 'krakow', scene: 'flat',
    npc: { name: 'Pani Marta', role: t('власниця квартири', 'владелица квартиры', 'landlady') },
    title: t('Розмова з власницею квартири', 'Разговор с хозяйкой квартиры', 'Talking to the landlady'),
    goal: t('Подивись квартиру, дізнайся ціну й заставу, запитай про прописку й домовся про договір.', 'Посмотри квартиру, узнай цену и залог, спроси о прописке и договорись о договоре.', 'View the flat, find out the rent and deposit, ask about registration and agree on the contract.'),
    intro: t('Бобек знайшов оголошення про двокімнатну квартиру в Кракові й прийшов на перегляд.', 'Бобек нашёл объявление о двухкомнатной квартире в Кракове и пришёл на просмотр.', 'Bobek found an ad for a two-room flat in Kraków and came to see it.'),
    note: t('Czynsz — орендна плата, media — комунальні (світло, газ, вода), kaucja — застава, яку повертають після виїзду. Суми навчальні.', 'Czynsz — арендная плата, media — коммунальные (свет, газ, вода), kaucja — залог, который возвращают после выезда. Суммы учебные.', 'Czynsz is the rent, media are utilities, kaucja is a refundable deposit. Amounts are for practice.'),
    minutes: 5, xp: 50, zlotki: 25,
    steps: [
      listen('welcome', npc('Dzień dobry, jestem Marta, właścicielka mieszkania. Zapraszam, proszę wejść.', 'Добрий день, я Марта, власниця квартири. Прошу, заходьте.', 'Добрый день, я Марта, владелица квартиры. Прошу, заходите.', 'Hello, I’m Marta, the owner of the flat. Please come in.'),
        t('Хто зустрічає Бобека?', 'Кто встречает Бобека?', 'Who meets Bobek?'),
        [
          T(t('Власниця квартири запрошує зайти', 'Владелица квартиры приглашает войти', 'The owner invites him in'), true),
          T(t('Сусід каже, що квартиру вже здали', 'Сосед говорит, что квартиру уже сдали', 'A neighbour says the flat is taken'), false, t('Сусід — «sąsiad». Марта — «właścicielka», власниця, і запрошує: «proszę wejść».', 'Сосед — «sąsiad». Марта — «właścicielka», владелица, и приглашает: «proszę wejść».', 'A neighbour is «sąsiad». Marta is the «właścicielka» and says «proszę wejść».')),
          T(t('Власниця просить прийти завтра', 'Владелица просит прийти завтра', 'The owner asks to come tomorrow'), false, t('«Zapraszam, proszę wejść» — «прошу, заходьте» зараз. «Завтра» — «jutro».', '«Zapraszam, proszę wejść» — «прошу, заходите» сейчас. «Завтра» — «jutro».', '«Proszę wejść» means come in now; tomorrow would be «jutro».')),
        ],
        { hint: t('Właścicielka — власниця (właściciel — власник); proszę wejść — прошу, заходьте.', 'Właścicielka — владелица (właściciel — владелец); proszę wejść — прошу, заходите.', 'Właścicielka / właściciel = owner; proszę wejść = please come in.'), explain: t('«Właścicielka mieszkania» — власниця квартири (чоловік — właściciel). «Zapraszam» — ввічливе «прошу, ласкаво просимо».', '«Właścicielka mieszkania» — владелица квартиры (мужчина — właściciel). «Zapraszam» — вежливое «прошу, добро пожаловать».', '«Właścicielka mieszkania» is the owner of the flat (a man is «właściciel»); «zapraszam» is a polite “welcome”.'), words: ['właściciel', 'mieszkanie'] }),
      choice('people', npc('Mieszkanie ma dwa pokoje, kuchnię i łazienkę. Ile osób będzie tu mieszkać?', 'У квартирі дві кімнати, кухня й ванна. Скільки людей тут житиме?', 'В квартире две комнаты, кухня и ванная. Сколько человек будет здесь жить?', 'Two rooms, a kitchen and a bathroom. How many people will live here?'),
        t('Відповідай на питання власниці.', 'Ответь на вопрос владелицы.', 'Answer the landlady’s question.'),
        [
          P('Tylko ja. Będę mieszkać sam.', true),
          P('Dwie osoby: ja i mój brat.', true),
          P('Mam dwa pokoje.', false, t('Питають «ile osób» — скільки людей, а не скільки кімнат. Відповідь: «Tylko ja» або «Dwie osoby».', 'Спрашивают «ile osób» — сколько человек, а не сколько комнат. Ответ: «Tylko ja» или «Dwie osoby».', '«Ile osób» asks how many people, not rooms.')),
        ],
        { hint: t('Osoba — людина; ile osób — скільки людей.', 'Osoba — человек; ile osób — сколько человек.', 'Osoba = person; ile osób = how many people.'), explain: t('«Ile osób będzie mieszkać?» — «Скільки людей житиме?». «Tylko ja» — «лише я», «dwie osoby» — «двоє».', '«Ile osób będzie mieszkać?» — «Сколько человек будет жить?». «Tylko ja» — «только я», «dwie osoby» — «двое».', '«Tylko ja» = only me; «dwie osoby» = two people.'), words: ['pokój', 'kuchnia', 'łazienka'] }),
      choice('price', undefined,
        t('Запитай, скільки коштує оренда на місяць.', 'Спроси, сколько стоит аренда в месяц.', 'Ask how much the rent is per month.'),
        [
          P('Ile wynosi czynsz miesięcznie?', true),
          P('Ile kosztuje wynajem za miesiąc?', true),
          P('Ile kosztuje bilet miesięczny?', false, t('«Bilet miesięczny» — місячний проїзний. Про квартиру питають «czynsz» або «wynajem».', '«Bilet miesięczny» — месячный проездной. Про квартиру спрашивают «czynsz» или «wynajem».', '«Bilet miesięczny» is a monthly travel pass; for a flat ask about «czynsz».')),
        ],
        { hint: t('Czynsz — орендна плата.', 'Czynsz — арендная плата.', 'Czynsz = rent.'), explain: t('«Ile wynosi czynsz?» — «Скільки становить оренда?». «Wynajem» — винайм.', '«Ile wynosi czynsz?» — «Сколько составляет аренда?». «Wynajem» — наём.', '«Ile wynosi czynsz?» = How much is the rent?'), words: ['czynsz'] }),
      listen('total', npc('Czynsz to dwa tysiące osiemset złotych plus media, mniej więcej trzysta złotych.', 'Оренда — дві тисячі вісімсот злотих плюс комунальні, приблизно триста злотих.', 'Аренда — две тысячи восемьсот злотых плюс коммунальные, примерно триста злотых.', 'The rent is 2,800 złoty plus utilities, about 300 złoty.'),
        t('Скільки разом на місяць? (навчальна сума)', 'Сколько всего в месяц? (учебная сумма)', 'How much per month in total? (practice amount)'),
        [
          T(t('Близько 3100 zł'), true),
          T(t('2800 zł'), false, t('Це лише czynsz. Ще «plus media» — комунальні, близько 300 zł.', 'Это только czynsz. Ещё «plus media» — коммунальные, около 300 zł.', 'That’s only the rent; utilities add about 300 zł.')),
          T(t('Близько 2300 zł'), false, t('«Dwa tysiące osiemset» — 2800, а «trzysta» (300) — це комунальні зверху.', '«Dwa tysiące osiemset» — 2800, а «trzysta» (300) — это коммунальные сверху.', '«Dwa tysiące osiemset» is 2,800; «trzysta» is the utilities on top.')),
        ],
        { hint: t('dwa tysiące osiemset — 2800; trzysta — 300.', 'dwa tysiące osiemset — 2800; trzysta — 300.', 'dwa tysiące osiemset = 2,800; trzysta = 300.'), explain: t('Czynsz 2800 zł + media ≈ 300 zł ≈ 3100 zł на місяць. «Mniej więcej» — приблизно.', 'Czynsz 2800 zł + media ≈ 300 zł ≈ 3100 zł в месяц. «Mniej więcej» — примерно.', '2,800 + about 300 ≈ 3,100 zł. «Mniej więcej» = roughly.'), words: ['media', 'tysiąc'] }),
      choice('deposit', npc('Potrzebuję też kaucji w wysokości jednego czynszu. Kaucja jest zwrotna.', 'Мені потрібна ще застава в розмірі однієї оренди. Застава повертається.', 'Мне нужен ещё залог в размере одной аренды. Залог возвращается.', 'I also need a deposit of one month’s rent. It’s refundable.'),
        t('Що означає «kaucja zwrotna»?', 'Что значит «kaucja zwrotna»?', 'What does «kaucja zwrotna» mean?'),
        [
          T(t('Застава, яку повернуть після виїзду', 'Залог, который вернут после выезда', 'A deposit returned when you move out'), true),
          T(t('Плата агентові, її не повертають', 'Плата агенту, её не возвращают', 'An agent’s fee, not returned'), false, t('Плата агентові — «prowizja». «Zwrotna» означає, що гроші повернуть.', 'Плата агенту — «prowizja». «Zwrotna» значит, что деньги вернут.', 'An agent’s fee is «prowizja»; «zwrotna» means refundable.')),
          T(t('Оплата за перший місяць', 'Оплата за первый месяц', 'The first month’s rent'), false, t('Оплата за перший місяць — «czynsz za pierwszy miesiąc». Kaucja — окремо й повертається.', 'Оплата за первый месяц — «czynsz za pierwszy miesiąc». Kaucja — отдельно и возвращается.', 'The first month is «czynsz za pierwszy miesiąc»; the deposit is separate.')),
        ],
        { hint: t('Zwrotna — та, що повертається.', 'Zwrotna — та, что возвращается.', 'Zwrotna = refundable.'), explain: t('Kaucja — застава. Її повертають після виїзду, якщо квартира в порядку. Prowizja — плата агенції, не повертається.', 'Kaucja — залог. Его возвращают после выезда, если квартира в порядке. Prowizja — плата агентству, не возвращается.', 'Kaucja is a refundable deposit; prowizja is an agency fee.'), words: ['kaucja'] }),
      build('meldunek', undefined, t('Запитай: «Чи можу я тут прописатися?»', 'Спроси: «Могу ли я здесь прописаться?»', 'Ask: “Can I register my address here?”'),
        'Czy mogę się tu zameldować?', ['zamówić', 'zamknąć'],
        { accept: ['Czy mogę się tutaj zameldować?', 'Czy mogę tu się zameldować?'],
          hint: t('Zameldować się — прописатися (зареєструвати адресу).', 'Zameldować się — прописаться (зарегистрировать адрес).', 'Zameldować się = register your address.'),
          explain: t('«Zameldować się» — прописатися за адресою (і заселитися в готель). Не плутай із «zamówić» — замовити, «zamknąć» — зачинити.', '«Zameldować się» — прописаться по адресу (и заселиться в отель). Не путай с «zamówić» — заказать, «zamknąć» — закрыть.', '«Zameldować się» = register (or check in). Not «zamówić» (order) or «zamknąć» (close).') }),
      choice('contract', npc('Oczywiście. Umowę podpiszemy na rok. Pasuje panu?', 'Звісно. Договір підпишемо на рік. Вам підходить?', 'Конечно. Договор подпишем на год. Вам подходит?', 'Of course. We’ll sign the contract for a year. Does that suit you?'),
        t('Відповідай власниці.', 'Ответь владелице.', 'Answer the landlady.'),
        [
          P('Tak, pasuje. Czy mogę najpierw przeczytać umowę?', true),
          P('Wolałbym umowę na pół roku. Czy to możliwe?', true),
          P('Tak, podpiszę bez czytania.', false, t('Договір завжди читають до підпису: строк, застава, хто платить за media.', 'Договор всегда читают до подписи: срок, залог, кто платит за media.', 'Always read the contract first: term, deposit, who pays the utilities.')),
        ],
        { hint: t('Pasuje — підходить; najpierw — спочатку.', 'Pasuje — подходит; najpierw — сначала.', 'Pasuje = suits; najpierw = first.'), explain: t('«Umowa najmu» — договір оренди. Можна погодитися («pasuje») або запропонувати інший строк («wolałbym…»).', '«Umowa najmu» — договор аренды. Можно согласиться («pasuje») или предложить другой срок («wolałbym…»).', '«Umowa najmu» is the lease; agree («pasuje») or suggest another term («wolałbym…»).'), words: ['umowa'] }),
    ],
    phrases: [
      ph('Ile wynosi czynsz miesięcznie?', 'Скільки коштує оренда на місяць?', 'Сколько стоит аренда в месяц?', 'How much is the rent per month?'),
      ph('Czy media są wliczone w czynsz?', 'Чи комунальні входять в оренду?', 'Коммунальные входят в аренду?', 'Are utilities included in the rent?'),
      ph('Kaucja jest zwrotna.', 'Заставу повертають.', 'Залог возвращается.', 'The deposit is refundable.'),
      ph('Czy mogę się tu zameldować?', 'Чи можу я тут прописатися?', 'Могу ли я здесь прописаться?', 'Can I register my address here?'),
      ph('Czy mogę najpierw przeczytać umowę?', 'Чи можу я спочатку прочитати договір?', 'Могу ли я сначала прочитать договор?', 'May I read the contract first?'),
    ],
  },

  // ───────────── 16. Premium: перший день на роботі ─────────────
  {
    slug: 'first-workday', premium: true, category: 'work', tags: ['work'], city: 'wroclaw', scene: 'work',
    npc: { name: 'Pani Agnieszka', role: t('керівниця відділу', 'руководитель отдела', 'team manager') },
    title: t('Перший день на роботі', 'Первый день на работе', 'First day at work'),
    goal: t('Представся керівниці, зрозумій графік, попроси повторити, дізнайся, що робити при хворобі, і попрощайся.', 'Представься руководителю, пойми график, попроси повторить, узнай, что делать при болезни, и попрощайся.', 'Introduce yourself, understand the schedule, ask to repeat, learn the sick-leave rule and say goodbye.'),
    intro: t('Сьогодні в Бобека перший день у логістичній фірмі у Вроцлаві. На рецепції його зустрічає керівниця.', 'Сегодня у Бобека первый день в логистической фирме во Вроцлаве. На ресепшене его встречает руководитель.', 'It’s Bobek’s first day at a logistics company in Wrocław. His manager meets him at reception.'),
    note: t('Правила роботи залежать від фірми й договору; тут — типова навчальна ситуація.', 'Правила работы зависят от фирмы и договора; здесь — типичная учебная ситуация.', 'Rules depend on the company and contract; this is a typical practice situation.'),
    minutes: 5, xp: 50, zlotki: 25,
    steps: [
      listen('welcome', npc('Dzień dobry! Pan jest naszym nowym pracownikiem? Zapraszam, pokażę panu stanowisko pracy.', 'Добрий день! Ви наш новий працівник? Прошу, покажу вам робоче місце.', 'Добрый день! Вы наш новый сотрудник? Прошу, покажу вам рабочее место.', 'Hello! Are you our new employee? Come with me, I’ll show you your workstation.'),
        t('Що каже керівниця?', 'Что говорит руководитель?', 'What does the manager say?'),
        [
          T(t('Питає, чи він новий працівник, і веде до робочого місця', 'Спрашивает, новый ли он сотрудник, и ведёт к рабочему месту', 'She asks if he’s the new employee and shows his workstation'), true),
          T(t('Питає, чи він новий клієнт, і веде на склад', 'Спрашивает, новый ли он клиент, и ведёт на склад', 'She asks if he’s a new client and takes him to the warehouse'), false, t('Pracownik — працівник, klient — клієнт. «Stanowisko pracy» — робоче місце, склад — «magazyn».', 'Pracownik — сотрудник, klient — клиент. «Stanowisko pracy» — рабочее место, склад — «magazyn».', 'Pracownik = employee, klient = client; stanowisko pracy = workstation.')),
          T(t('Каже, що він запізнився', 'Говорит, что он опоздал', 'She says he’s late'), false, t('Про запізнення сказали б «spóźnił się pan». Тут — привітання й запрошення.', 'Об опоздании сказали бы «spóźnił się pan». Здесь — приветствие и приглашение.', 'Being late would be «spóźnił się pan».')),
        ],
        { hint: t('Pracownik — працівник; stanowisko pracy — робоче місце.', 'Pracownik — сотрудник; stanowisko pracy — рабочее место.', 'Pracownik = employee; stanowisko = workstation.'), explain: t('«Nowy pracownik» — новий працівник. «Pokażę panu stanowisko pracy» — покажу вам робоче місце.', '«Nowy pracownik» — новый сотрудник. «Pokażę panu stanowisko pracy» — покажу вам рабочее место.', '«Pokażę panu stanowisko pracy» = I’ll show you your workstation.'), words: ['pracownik', 'stanowisko'] }),
      choice('intro', undefined,
        t('Представся керівниці в перший день.', 'Представься руководителю в первый день.', 'Introduce yourself to the manager on day one.'),
        [
          P('Nazywam się Bobek Bobrowski. Bardzo mi miło.', true),
          P('Cześć, jestem Bobek. Mów mi po imieniu.', false, t('З керівницею в перший день — офіційно, на «pan/pani». На «ти» зазвичай пропонує старший за посадою.', 'С руководителем в первый день — официально, на «pan/pani». На «ты» обычно предлагает старший по должности.', 'With a manager on day one stay formal; the senior person offers first names.')),
          P('Nazywa się Bobek Bobrowski.', false, t('«Nazywa się» — «його звуть». Про себе — «nazywam się».', '«Nazywa się» — «его зовут». О себе — «nazywam się».', '«Nazywa się» is “he is called”; about yourself say «nazywam się».')),
        ],
        { hint: t('Офіційно: «Nazywam się…», «Bardzo mi miło».', 'Официально: «Nazywam się…», «Bardzo mi miło».', 'Formal: «Nazywam się…», «Bardzo mi miło».'), explain: t('На роботі спершу говорять на «pan/pani». Перейти на «ти» («mówić sobie po imieniu») пропонує старший — керівник або старша людина.', 'На работе сначала говорят на «pan/pani». Перейти на «ты» («mówić sobie po imieniu») предлагает старший — руководитель или старший человек.', 'At work people start formal; the senior person suggests first names.'), words: ['nazywam się'] }),
      listen('hours', npc('Pracujemy od ósmej do szesnastej. Przerwa na lunch jest o dwunastej i trwa pół godziny.', 'Працюємо з восьмої до шістнадцятої. Перерва на обід о дванадцятій, триває пів години.', 'Работаем с восьми до шестнадцати. Перерыв на обед в двенадцать, длится полчаса.', 'We work from eight to four. Lunch break is at twelve and lasts half an hour.'),
        t('О котрій закінчується робочий день?', 'Во сколько заканчивается рабочий день?', 'When does the workday end?'),
        [
          T(t('О 16:00'), true),
          T(t('О 12:00'), false, t('«O dwunastej» — перерва на обід, а робота триває «do szesnastej» — до 16:00.', '«O dwunastej» — перерыв на обед, а работа длится «do szesnastej» — до 16:00.', '«O dwunastej» is the lunch break; work ends «do szesnastej», at 16:00.')),
          T(t('О 18:00'), false, t('Szesnasta — 16, osiemnasta — 18. Почули «do szesnastej».', 'Szesnasta — 16, osiemnasta — 18. Прозвучало «do szesnastej».', 'Szesnasta = 16, osiemnasta = 18.')),
        ],
        { hint: t('od… do… — з… до…; szesnasta — 16:00.', 'od… do… — с… до…; szesnasta — 16:00.', 'od… do… = from… to…; szesnasta = 16:00.'), explain: t('Години кажуть порядковими числівниками: od ósmej (з 8:00) do szesnastej (до 16:00). «Pół godziny» — пів години.', 'Часы говорят порядковыми числительными: od ósmej (с 8:00) do szesnastej (до 16:00). «Pół godziny» — полчаса.', 'Times use ordinals: od ósmej do szesnastej. «Pół godziny» = half an hour.'), words: ['przerwa', 'godzina'] }),
      choice('repeat', npc('Tu jest pana komputer. Login i hasło dostanie pan mailem od działu IT.', 'Ось ваш комп’ютер. Логін і пароль отримаєте листом від IT-відділу.', 'Вот ваш компьютер. Логин и пароль получите письмом от IT-отдела.', 'Here’s your computer. You’ll get the login and password by email from IT.'),
        t('Ти не все розчув. Ввічливо попроси повторити.', 'Ты не всё расслышал. Вежливо попроси повторить.', 'You didn’t catch everything. Politely ask her to repeat.'),
        [
          P('Przepraszam, czy może pani powtórzyć?', true),
          P('Przepraszam, nie dosłyszałem. Jeszcze raz, proszę.', true),
          P('Co? Nie rozumiem.', false, t('«Co?» звучить різко, особливо з керівницею. Краще: «Przepraszam, czy może pani powtórzyć?»', '«Co?» звучит резко, особенно с руководителем. Лучше: «Przepraszam, czy może pani powtórzyć?»', '«Co?» sounds rude; say «Przepraszam, czy może pani powtórzyć?»')),
        ],
        { hint: t('Powtórzyć — повторити; nie dosłyszałem — я не розчув.', 'Powtórzyć — повторить; nie dosłyszałem — я не расслышал.', 'Powtórzyć = repeat; nie dosłyszałem = I didn’t catch it.'), explain: t('Ввічливе прохання: «Przepraszam, czy może pani powtórzyć?» Про чоловіка: «czy może pan…».', 'Вежливая просьба: «Przepraszam, czy może pani powtórzyć?» К мужчине: «czy może pan…».', 'Polite: «czy może pani powtórzyć?»; to a man: «czy może pan…».'), words: ['powtórzyć', 'hasło'] }),
      build('jacket', undefined, t('Запитай: «Де я можу залишити куртку?»', 'Спроси: «Где я могу оставить куртку?»', 'Ask: “Where can I leave my jacket?”'),
        'Gdzie mogę zostawić kurtkę?', ['zostać', 'kurtka'],
        { hint: t('Zostawić — залишити щось; після нього — знахідний: kurtkę.', 'Zostawić — оставить что-то; после него — винительный: kurtkę.', 'Zostawić = leave something; then the accusative: kurtkę.'),
          explain: t('«Zostawić» — залишити річ, а «zostać» — залишитися самому. Kurtka → zostawić kurtkę (знахідний відмінок).', '«Zostawić» — оставить вещь, а «zostać» — остаться самому. Kurtka → zostawić kurtkę (винительный падеж).', '«Zostawić» = leave a thing; «zostać» = stay. Kurtka → kurtkę.'), words: ['zostawić', 'kurtka'] }),
      choice('sick', npc('Jeśli będzie pan chory, proszę zadzwonić rano i wziąć od lekarza zwolnienie, czyli L4.', 'Якщо захворієте, зателефонуйте зранку й візьміть у лікаря лікарняний, тобто L4.', 'Если заболеете, позвоните утром и возьмите у врача больничный, то есть L4.', 'If you’re ill, call in the morning and get a sick note (L4) from a doctor.'),
        t('Що треба зробити, якщо захворієш?', 'Что нужно сделать, если заболеешь?', 'What should you do if you get ill?'),
        [
          T(t('Зранку подзвонити й узяти в лікаря лікарняний (L4)', 'Утром позвонить и взять у врача больничный (L4)', 'Call in the morning and get a sick note (L4)'), true),
          T(t('Не приходити, а пояснити наступного дня', 'Не приходить, а объяснить на следующий день', 'Stay home and explain the next day'), false, t('Попросили «zadzwonić rano» — подзвонити зранку того ж дня.', 'Попросили «zadzwonić rano» — позвонить утром того же дня.', 'She asked you to call «rano», that morning.')),
          T(t('Узяти відпустку за власний рахунок', 'Взять отпуск за свой счёт', 'Take unpaid leave'), false, t('Відпустка за власний рахунок — «urlop bezpłatny». При хворобі — лікарняний: «zwolnienie lekarskie», L4.', 'Отпуск за свой счёт — «urlop bezpłatny». При болезни — больничный: «zwolnienie lekarskie», L4.', 'Unpaid leave is «urlop bezpłatny»; for illness it’s L4.')),
        ],
        { hint: t('Zwolnienie (lekarskie) — лікарняний; L4 — його розмовна назва.', 'Zwolnienie (lekarskie) — больничный; L4 — его разговорное название.', 'Zwolnienie lekarskie = sick note; L4 is its everyday name.'), explain: t('L4 — розмовна назва лікарняного (zwolnienie lekarskie). Зараз його оформлює лікар в електронному вигляді.', 'L4 — разговорное название больничного (zwolnienie lekarskie). Сейчас его оформляет врач в электронном виде.', 'L4 is the everyday name for a sick note; doctors issue it electronically.'), words: ['zwolnienie lekarskie', 'chory'] }),
      choice('bye', npc('To wszystko na dziś. Do zobaczenia jutro!', 'На сьогодні все. До завтра!', 'На сегодня всё. До завтра!', 'That’s all for today. See you tomorrow!'),
        t('Подякуй і попрощайся.', 'Поблагодари и попрощайся.', 'Say thanks and goodbye.'),
        [
          P('Dziękuję za pomoc. Do jutra!', true),
          P('Dziękuję, do zobaczenia jutro!', true),
          P('Dobranoc!', false, t('«Dobranoc» кажуть увечері перед сном. Після роботи — «Do widzenia» або «Do jutra».', '«Dobranoc» говорят вечером перед сном. После работы — «Do widzenia» или «Do jutra».', '«Dobranoc» is for bedtime; after work say «Do jutra».')),
        ],
        { hint: t('Do jutra — до завтра.', 'Do jutra — до завтра.', 'Do jutra = see you tomorrow.'), explain: t('«Dziękuję za pomoc» — дякую за допомогу. «Do jutra» / «Do zobaczenia jutro» — до завтра.', '«Dziękuję za pomoc» — спасибо за помощь. «Do jutra» / «Do zobaczenia jutro» — до завтра.', '«Dziękuję za pomoc» = thanks for your help.'), words: ['jutro'] }),
    ],
    phrases: [
      ph('Nazywam się… Bardzo mi miło.', 'Мене звати… Дуже приємно.', 'Меня зовут… Очень приятно.', 'My name is… Nice to meet you.'),
      ph('Przepraszam, czy może pani powtórzyć?', 'Перепрошую, чи можете повторити?', 'Извините, не могли бы вы повторить?', 'Sorry, could you repeat that?'),
      ph('Gdzie mogę zostawić kurtkę?', 'Де я можу залишити куртку?', 'Где я могу оставить куртку?', 'Where can I leave my jacket?'),
      ph('Pracujemy od ósmej do szesnastej.', 'Працюємо з восьмої до шістнадцятої.', 'Работаем с восьми до шестнадцати.', 'We work from eight to four.'),
      ph('Biorę zwolnienie lekarskie (L4).', 'Беру лікарняний (L4).', 'Беру больничный (L4).', 'I’m taking sick leave (L4).'),
    ],
  },

  // ───────────── 17. Premium: запис до лікаря ─────────────
  {
    slug: 'doctor-appointment', premium: true, category: 'home', tags: ['health'], city: 'katowice', scene: 'clinic',
    npc: { name: 'Pani Ewa', role: t('реєстраторка поліклініки', 'регистратор поликлиники', 'clinic receptionist') },
    title: t('Запис до лікаря', 'Запись к врачу', 'Booking a doctor'),
    goal: t('Подзвони в поліклініку, запишися до сімейного лікаря, назви симптоми й уточни, що взяти з собою.', 'Позвони в поликлинику, запишись к семейному врачу, назови симптомы и уточни, что взять с собой.', 'Call the clinic, book a family doctor, describe your symptoms and check what to bring.'),
    intro: t('Бобек застудився й телефонує до поліклініки в Катовицях, щоб записатися до лікаря.', 'Бобек простудился и звонит в поликлинику в Катовице, чтобы записаться к врачу.', 'Bobek has caught a cold and calls a clinic in Katowice to book a doctor.'),
    note: t('Lekarz rodzinny (POZ) — сімейний лікар; з NFZ прийом безкоштовний для застрахованих. Терміни й правила залежать від поліклініки.', 'Lekarz rodzinny (POZ) — семейный врач; с NFZ приём бесплатный для застрахованных. Сроки и правила зависят от поликлиники.', 'A family doctor (POZ) is free for people insured with NFZ; rules depend on the clinic.'),
    minutes: 5, xp: 50, zlotki: 25,
    steps: [
      listen('hello', npc('Przychodnia „Zdrowie”, w czym mogę pomóc?', 'Поліклініка «Здоров’я», чим можу допомогти?', 'Поликлиника «Здоровье», чем могу помочь?', 'Zdrowie clinic, how can I help?'),
        t('Куди подзвонив Бобек?', 'Куда позвонил Бобек?', 'Where did Bobek call?'),
        [
          T(t('У поліклініку', 'В поликлинику', 'A clinic'), true),
          T(t('В аптеку', 'В аптеку', 'A pharmacy'), false, t('Аптека — «apteka». «Przychodnia» — поліклініка, де приймають лікарі.', 'Аптека — «apteka». «Przychodnia» — поликлиника, где принимают врачи.', 'A pharmacy is «apteka»; «przychodnia» is a clinic.')),
          T(t('У приймальне відділення лікарні', 'В приёмное отделение больницы', 'A hospital ER'), false, t('Лікарня — «szpital», приймальне — «izba przyjęć» або SOR. Тут — «przychodnia».', 'Больница — «szpital», приёмное — «izba przyjęć» или SOR. Здесь — «przychodnia».', 'A hospital is «szpital»; the ER is «SOR». Here it’s a «przychodnia».')),
        ],
        { hint: t('Przychodnia — поліклініка.', 'Przychodnia — поликлиника.', 'Przychodnia = clinic.'), explain: t('Przychodnia — поліклініка (амбулаторний прийом). Apteka — аптека, szpital — лікарня.', 'Przychodnia — поликлиника (амбулаторный приём). Apteka — аптека, szpital — больница.', 'Przychodnia = outpatient clinic; apteka = pharmacy; szpital = hospital.'), words: ['przychodnia'] }),
      choice('book', undefined,
        t('Скажи, що хочеш записатися до сімейного лікаря.', 'Скажи, что хочешь записаться к семейному врачу.', 'Say you want to book a family doctor.'),
        [
          P('Chciałbym zapisać się do lekarza rodzinnego.', true),
          P('Chciałbym zapisać lekarza rodzinnego.', false, t('Без «się» виходить «записати лікаря» кудись. Записатися самому — «zapisać się».', 'Без «się» получается «записать врача» куда-то. Записаться самому — «zapisać się».', 'Without «się» it means you register the doctor; you need «zapisać się».')),
          P('Chciałbym zadzwonić do lekarza rodzinnego.', false, t('«Zadzwonić» — подзвонити. Ти вже телефонуєш; треба записатися — «zapisać się».', '«Zadzwonić» — позвонить. Ты уже звонишь; нужно записаться — «zapisać się».', '«Zadzwonić» = to call; you need «zapisać się» (book).')),
        ],
        { hint: t('Zapisać się do lekarza — записатися до лікаря.', 'Zapisać się do lekarza — записаться к врачу.', 'Zapisać się do lekarza = book a doctor.'), explain: t('«Zapisać się do lekarza» — записатися до лікаря. Після «do» — родовий: lekarz → do lekarza.', '«Zapisać się do lekarza» — записаться к врачу. После «do» — родительный: lekarz → do lekarza.', '«Zapisać się do lekarza»; after «do» use the genitive.'), words: ['lekarz', 'zapisać się'] }),
      choice('insurance', npc('Czy jest pan ubezpieczony? Proszę podać numer PESEL.', 'Ви застраховані? Назвіть, будь ласка, номер PESEL.', 'Вы застрахованы? Назовите, пожалуйста, номер PESEL.', 'Are you insured? Please give your PESEL number.'),
        t('Ти працюєш, і роботодавець платить за тебе страховку. Відповідай.', 'Ты работаешь, и работодатель платит за тебя страховку. Ответь.', 'You work and your employer pays your insurance. Answer.'),
        [
          P('Tak, jestem ubezpieczony przez pracodawcę. Mój PESEL to…', true),
          P('Nie, jestem zdrowy.', false, t('Питають про страховку (ubezpieczenie), а не про здоров’я.', 'Спрашивают о страховке (ubezpieczenie), а не о здоровье.', 'They ask about insurance, not your health.')),
          P('Tak, mam paszport.', false, t('Паспорт — це документ, а не страховка. PESEL — твій ідентифікаційний номер.', 'Паспорт — это документ, а не страховка. PESEL — твой идентификационный номер.', 'A passport is not insurance; PESEL is your ID number.')),
        ],
        { hint: t('Ubezpieczony — застрахований; pracodawca — роботодавець.', 'Ubezpieczony — застрахованный; pracodawca — работодатель.', 'Ubezpieczony = insured; pracodawca = employer.'), explain: t('Хто працює за umową o pracę, зазвичай застрахований у NFZ через роботодавця. Реєстрація питає PESEL, щоб перевірити страховку.', 'Кто работает по umowie o pracę, обычно застрахован в NFZ через работодателя. Регистратура спрашивает PESEL, чтобы проверить страховку.', 'Employees are usually insured with NFZ through their employer; reception checks it by PESEL.'), words: ['ubezpieczenie'] }),
      listen('slot', npc('Najbliższy wolny termin jest w czwartek o dziewiątej piętnaście.', 'Найближчий вільний час — у четвер о дев’ятій п’ятнадцять.', 'Ближайшее свободное время — в четверг в девять пятнадцать.', 'The next free slot is on Thursday at 9:15.'),
        t('Коли запис?', 'Когда запись?', 'When is the appointment?'),
        [
          T(t('Четвер, 9:15', 'Четверг, 9:15', 'Thursday, 9:15'), true),
          T(t('Вівторок, 9:15', 'Вторник, 9:15', 'Tuesday, 9:15'), false, t('Czwartek — четвер, wtorek — вівторок.', 'Czwartek — четверг, wtorek — вторник.', 'Czwartek = Thursday, wtorek = Tuesday.')),
          T(t('Четвер, 9:50', 'Четверг, 9:50', 'Thursday, 9:50'), false, t('Piętnaście — 15, pięćdziesiąt — 50.', 'Piętnaście — 15, pięćdziesiąt — 50.', 'Piętnaście = 15, pięćdziesiąt = 50.')),
        ],
        { hint: t('W czwartek — у четвер; dziewiąta piętnaście — 9:15.', 'W czwartek — в четверг; dziewiąta piętnaście — 9:15.', 'W czwartek = on Thursday; dziewiąta piętnaście = 9:15.'), explain: t('«Termin» — тут час запису. «O dziewiątej piętnaście» — о 9:15.', '«Termin» — здесь время записи. «O dziewiątej piętnaście» — в 9:15.', '«Termin» here means an appointment slot.'), words: ['termin', 'czwartek'] }),
      choice('symptoms', npc('A co panu dolega?', 'А що вас турбує?', 'А что вас беспокоит?', 'And what’s the problem?'),
        t('Опиши симптоми.', 'Опиши симптомы.', 'Describe your symptoms.'),
        [
          P('Od trzech dni boli mnie gardło i mam gorączkę.', true),
          P('Od trzech dni jestem gorączka.', false, t('Про температуру кажуть «mam gorączkę» — у мене температура, а не «jestem».', 'О температуре говорят «mam gorączkę» — у меня температура, а не «jestem».', 'Say «mam gorączkę» (I have a fever), not «jestem».')),
          P('Od trzech dni mam gardło.', false, t('Треба сказати, що горло болить: «boli mnie gardło».', 'Нужно сказать, что горло болит: «boli mnie gardło».', 'Say the throat hurts: «boli mnie gardło».')),
        ],
        { hint: t('Boli mnie… — у мене болить…; mam gorączkę — у мене температура.', 'Boli mnie… — у меня болит…; mam gorączkę — у меня температура.', 'Boli mnie… = my … hurts; mam gorączkę = I have a fever.'), explain: t('«Co panu dolega?» — що вас турбує. «Boli mnie gardło» — болить горло, «mam gorączkę» — висока температура, «od trzech dni» — уже три дні.', '«Co panu dolega?» — что вас беспокоит. «Boli mnie gardło» — болит горло, «mam gorączkę» — высокая температура, «od trzech dni» — уже три дня.', '«Boli mnie gardło» = sore throat; «mam gorączkę» = fever; «od trzech dni» = for three days.'), words: ['gardło', 'gorączka'] }),
      build('referral', undefined, t('Запитай: «Чи потрібне мені направлення?»', 'Спроси: «Нужно ли мне направление?»', 'Ask: “Do I need a referral?”'),
        'Czy potrzebuję skierowania?', ['skierowanie', 'potrzebuje'],
        { hint: t('Potrzebować + родовий: skierowanie → skierowania.', 'Potrzebować + родительный: skierowanie → skierowania.', 'Potrzebować + genitive: skierowania.'),
          explain: t('«Potrzebuję» — мені потрібно (я). Після «potrzebować» — родовий відмінок: skierowanie → skierowania. До сімейного лікаря направлення не потрібне, до вузького спеціаліста — часто так.', '«Potrzebuję» — мне нужно (я). После «potrzebować» — родительный падеж: skierowanie → skierowania. К семейному врачу направление не нужно, к узкому специалисту — часто да.', '«Potrzebuję» + genitive: skierowania. A GP needs no referral; specialists often do.'), words: ['skierowanie'] }),
      choice('bring', npc('Do lekarza rodzinnego nie trzeba. Proszę przyjść dziesięć minut wcześniej z dowodem osobistym albo paszportem.', 'До сімейного лікаря не потрібно. Прийдіть, будь ласка, на десять хвилин раніше з посвідченням особи або паспортом.', 'К семейному врачу не нужно. Приходите, пожалуйста, на десять минут раньше с удостоверением личности или паспортом.', 'Not for a family doctor. Please come ten minutes early with an ID card or passport.'),
        t('Підтверди й попрощайся.', 'Подтверди и попрощайся.', 'Confirm and say goodbye.'),
        [
          P('Dobrze, będę dziesięć minut wcześniej z paszportem. Dziękuję, do widzenia!', true),
          P('Dobrze, będę dziesięć minut później. Do widzenia!', false, t('Wcześniej — раніше, później — пізніше. Просять прийти раніше.', 'Wcześniej — раньше, później — позже. Просят прийти раньше.', 'Wcześniej = earlier, później = later.')),
          P('Dobrze, przyjdę za dziesięć minut.', false, t('«Za dziesięć minut» — через десять хвилин, сьогодні. А запис — у четвер, і прийти треба на 10 хвилин раніше.', '«Za dziesięć minut» — через десять минут, сегодня. А запись — в четверг, и прийти надо на 10 минут раньше.', '«Za dziesięć minut» means in ten minutes; the visit is on Thursday, ten minutes early.')),
        ],
        { hint: t('Wcześniej — раніше; dowód osobisty — посвідчення особи.', 'Wcześniej — раньше; dowód osobisty — удостоверение личности.', 'Wcześniej = earlier; dowód osobisty = ID card.'), explain: t('«Dziesięć minut wcześniej» — на десять хвилин раніше. З собою — документ: dowód osobisty або paszport.', '«Dziesięć minut wcześniej» — на десять минут раньше. С собой — документ: dowód osobisty или paszport.', 'Come ten minutes early with an ID or passport.'), words: ['wcześniej', 'paszport'] }),
    ],
    phrases: [
      ph('Chciałbym zapisać się do lekarza rodzinnego.', 'Я хотів би записатися до сімейного лікаря.', 'Я хотел бы записаться к семейному врачу.', 'I’d like to book a family doctor.'),
      ph('Jestem ubezpieczony w NFZ.', 'Я застрахований у NFZ.', 'Я застрахован в NFZ.', 'I’m insured with NFZ.'),
      ph('Boli mnie gardło i mam gorączkę.', 'У мене болить горло й температура.', 'У меня болит горло и температура.', 'I have a sore throat and a fever.'),
      ph('Czy potrzebuję skierowania?', 'Чи потрібне мені направлення?', 'Нужно ли мне направление?', 'Do I need a referral?'),
      ph('Najbliższy wolny termin.', 'Найближчий вільний час.', 'Ближайшее свободное время.', 'The next free slot.'),
    ],
  },
];

/** Місії, що готуються (показуються як «скоро», без можливості почати). */
export const MISSIONS_SOON: { slug: string; category: MissionCategory; scene: string; title: I18n }[] = [];

/** Звичайні місії, Premium-подорожі (content/missions-travel.ts) і місії сезонних пропусків: досягнення, озвучка, seed і перевірки контенту бачать усі. */
MISSIONS.push(...TRAVEL_MISSIONS, ...SEASON_MISSIONS);

export const missionBySlug = (slug: string) => MISSIONS.find((m) => m.slug === slug);
