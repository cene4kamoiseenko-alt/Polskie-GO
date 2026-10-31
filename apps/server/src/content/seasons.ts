/**
 * Пропуск місяця: сезонні локації з власними місіями (ADR-011).
 *  • Сезон відкритий у свої дати (включно, за поясом учня). Перша місія сезону — для всіх (знайомство з пропуском),
 *    решта — з Premium. Після кінця сезону його місії лишаються в «Архіві пропусків» — лише з Premium.
 *  • Майбутні сезони видно в календарі, почати їх місії не можна.
 *  • Нагорода за весь сезон — досягнення `MISSIONS_TAG:season-<slug>` (content/gamification.ts): Złotki й значок.
 *    Речей-нагород немає, доки для них немає живописних шарів (ADR-005).
 * Місії сезонів — без кроків «послухай»: озвучку генерує лише адмінка, а без аудіо такий крок не пройти.
 * Назви місць і мереж — контекст навчальних ситуацій, без партнерства; ціни, години й правила — навчальні.
 */
import type { I18n } from '@polski-go/shared';
import { t } from './builders';
import type { Mission, MissionLine, MissionOption, MissionStep } from './missions';

export type Season = {
  slug: string;
  /** Перший і останній день сезону, YYYY-MM-DD, включно (за поясом учня). */
  start: string;
  end: string;
  city: string;
  scene: string;
  color: string;
  title: I18n;
  tagline: I18n;
  /** Місії сезону в порядку проходження; перша — відкрита всім. */
  missions: string[];
  /** Досягнення за всі місії сезону (slug у ACHIEVEMENTS). */
  achievement: string;
};

const npc = (pl: string, uk: string, ru: string, en: string): MissionLine => ({ who: 'npc', pl, tr: t(uk, ru, en) });
const narr = (pl: string, uk: string, ru: string, en: string): MissionLine => ({ who: 'narrator', pl, tr: t(uk, ru, en) });
const P = (pl: string, ok = false, why?: I18n): MissionOption => ({ pl, ok, why });
const T = (text: I18n, ok = false, why?: I18n): MissionOption => ({ text, ok, why });
const ph = (pl: string, uk: string, ru: string, en: string) => ({ pl, tr: t(uk, ru, en) });
type Extra = { hint: I18n; explain: I18n; words?: string[]; tags?: string[] };
const choice = (id: string, line: MissionLine | undefined, task: I18n, options: MissionOption[], x: Extra): MissionStep => ({ id, kind: 'choice', line, task, options, ...x });
const build = (id: string, line: MissionLine | undefined, task: I18n, answer: string, extra: string[], x: Extra & { accept?: string[] }): MissionStep => ({
  id, kind: 'build', line, task, answer, extra, ...x,
});

const AMOUNT_TASK = t('Скільки треба заплатити? (навчальна сума)', 'Сколько нужно заплатить? (учебная сумма)', 'How much to pay? (practice amount)');
const PARK_NOTE = t(
  'Energylandia — парк розваг у Заторі (Малопольща), між Краковом і Катовицями. Назва — лише контекст навчальної ситуації, без партнерства; ціни, години й правила в місії — навчальні.',
  'Energylandia — парк развлечений в Заторе (Малопольша), между Краковом и Катовице. Название — лишь контекст учебной ситуации, без партнёрства; цены, часы и правила в миссии — учебные.',
  'Energylandia is an amusement park in Zator (Lesser Poland), between Kraków and Katowice. The name is learning context only, no partnership; prices, hours and rules here are for practice.',
);

const base = { category: 'season' as const, minutes: 4, xp: 45, zlotki: 25 };

// ═════════════════════ Листопад у Познані ═════════════════════
const MARCIN: Mission[] = [
  {
    ...base, slug: 'marcin-rogal', season: 'listopad-poznan', tags: ['season-listopad-poznan', 'store', 'checkout'], city: 'poznan', scene: 'pastry-shop',
    npc: { name: 'Pani Basia', role: t('кондитерка', 'кондитер', 'pastry shop assistant') },
    title: t('Рогалі святого Мартина', 'Рогалики святого Мартина', 'St Martin’s croissants'),
    goal: t('Купи два рогалі на винос, дізнайся ціну й оплати.', 'Купи два рогалика с собой, узнай цену и оплати.', 'Buy two croissants to go, ask the price and pay.'),
    intro: t('11 листопада в Познані до кондитерських стоять черги. Бобек теж став у чергу.', '11 ноября в Познани в кондитерские стоят очереди. Бобек тоже встал в очередь.', 'On 11 November there are queues outside Poznań’s pastry shops. Bobek joins one.'),
    note: t(
      'Rogal świętomarciński — познанський рогалик із начинкою з білого маку й горіхів. Його печуть на 11 листопада, день святого Мартина; назва захищена в ЄС як регіональний продукт. Ціни в місії — навчальні.',
      'Rogal świętomarciński — познанский рогалик с начинкой из белого мака и орехов. Его пекут к 11 ноября, дню святого Мартина; название защищено в ЕС как региональный продукт. Цены в миссии — учебные.',
      'The rogal świętomarciński is Poznań’s croissant filled with white poppy seeds and nuts, baked for St Martin’s Day on 11 November; its name is protected in the EU. Prices here are for practice.',
    ),
    steps: [
      choice('order', npc('Dzień dobry! Co dla pana?', 'Добрий день! Що для вас?', 'Добрый день! Что для вас?', 'Hello! What can I get you?'),
        t('Попроси два рогалі святого Мартина.', 'Попроси два рогалика святого Мартина.', 'Ask for two St Martin’s croissants.'),
        [
          P('Poproszę dwa rogale świętomarcińskie.', true),
          P('Poproszę dwa rogal świętomarciński.', false, t('Після «dwa» — множина: dwa rogale.', 'После «dwa» — множественное число: dwa rogale.', 'After «dwa» use the plural: dwa rogale.')),
          P('Mam dwa rogale świętomarcińskie.', false, t('«Mam» — у мене є. Попросити — «Poproszę…».', '«Mam» — у меня есть. Попросить — «Poproszę…».', '«Mam» means “I have”. To ask, say «Poproszę…».')),
        ],
        { hint: t('Poproszę + скільки + що: dwa rogale.', 'Poproszę + сколько + что: dwa rogale.', 'Poproszę + how many + what: dwa rogale.'),
          explain: t('Dwa, trzy, cztery + множина: rogal → dwa rogale.', 'Dwa, trzy, cztery + множественное число: rogal → dwa rogale.', 'Dwa, trzy, cztery take the plural: rogal → dwa rogale.'), words: ['poproszę', 'rogal'] }),
      choice('takeaway', npc('Proszę bardzo. Na miejscu czy na wynos?', 'Будь ласка. Тут чи з собою?', 'Пожалуйста. Здесь или с собой?', 'Here you are. For here or to go?'),
        t('Ти хочеш узяти рогалі з собою.', 'Ты хочешь взять рогалики с собой.', 'You want to take them with you.'),
        [
          P('Na wynos, poproszę.', true),
          P('Na miejscu, poproszę.', false, t('Na miejscu — тут, у кондитерській. З собою — na wynos.', 'Na miejscu — здесь, в кондитерской. С собой — na wynos.', 'Na miejscu = for here. To go is «na wynos».')),
          P('Do widzenia, poproszę.', false, t('«Do widzenia» — до побачення. Питають, тут чи з собою.', '«Do widzenia» — до свидания. Спрашивают, здесь или с собой.', '«Do widzenia» is goodbye; you’re asked “here or to go”.')),
        ],
        { hint: t('Na wynos — з собою.', 'Na wynos — с собой.', 'Na wynos = to go.'), explain: t('Na miejscu — тут, на місці; na wynos — з собою.', 'Na miejscu — здесь, на месте; na wynos — с собой.', 'Na miejscu = for here, na wynos = to go.'), words: ['na wynos', 'na miejscu'] }),
      build('price', undefined, t('Запитай: «Скільки коштує один рогалик?»', 'Спроси: «Сколько стоит один рогалик?»', 'Ask: “How much is one croissant?”'),
        'Ile kosztuje jeden rogal?', ['kosztują', 'rogale'],
        { hint: t('Ile kosztuje…? — скільки коштує…? Один предмет — kosztuje.', 'Ile kosztuje…? — сколько стоит…? Один предмет — kosztuje.', 'Ile kosztuje…? = how much is…? One item — kosztuje.'),
          explain: t('Одна річ — kosztuje, кілька — kosztują: Ile kosztują rogale?', 'Одна вещь — kosztuje, несколько — kosztują: Ile kosztują rogale?', 'One item — kosztuje, several — kosztują: Ile kosztują rogale?'), words: ['ile kosztuje'] }),
      choice('total', npc('Jeden kosztuje dziesięć złotych, czyli razem dwadzieścia złotych.', 'Один коштує десять злотих, тобто разом двадцять злотих.', 'Один стоит десять злотых, то есть итого двадцать злотых.', 'One is ten złoty, so twenty złoty in total.'),
        AMOUNT_TASK,
        [
          T(t('20 zł'), true),
          T(t('12 zł'), false, t('dwanaście = 12, а тут dwadzieścia = 20.', 'dwanaście = 12, а здесь dwadzieścia = 20.', 'dwanaście = 12, but you heard dwadzieścia = 20.')),
          T(t('10 zł'), false, t('Десять (dziesięć) коштує один рогалик, а в тебе два: razem — разом 20.', 'Десять (dziesięć) стоит один рогалик, а у тебя два: razem — итого 20.', 'Ten (dziesięć) is for one; you have two: razem = 20 in total.')),
        ],
        { hint: t('dziesięć — 10, dwadzieścia — 20, razem — разом.', 'dziesięć — 10, dwadzieścia — 20, razem — итого.', 'dziesięć = 10, dwadzieścia = 20, razem = in total.'),
          explain: t('«Czyli razem» — тобто разом: 2 × 10 = 20 zł.', '«Czyli razem» — то есть итого: 2 × 10 = 20 zł.', '«Czyli razem» = so in total: 2 × 10 = 20 zł.'), words: ['razem', 'dziesięć', 'dwadzieścia'] }),
      choice('pay', npc('Płaci pan kartą czy gotówką?', 'Платите карткою чи готівкою?', 'Платите картой или наличными?', 'Card or cash?'),
        t('Обери, як платити.', 'Выбери, как платить.', 'Choose how to pay.'),
        [
          P('Kartą, poproszę.', true),
          P('Gotówką, proszę.', true),
          P('Tak, płacę.', false, t('Питання «або-або»: kartą (карткою) чи gotówką (готівкою).', 'Вопрос «или-или»: kartą (картой) или gotówką (наличными).', 'It’s either/or: kartą (card) or gotówką (cash).')),
        ],
        { hint: t('Чим платиш? — орудний: kartą, gotówką.', 'Чем платишь? — творительный: kartą, gotówką.', 'Paying with what? — instrumental: kartą, gotówką.'),
          explain: t('Płacić czym? — орудний відмінок: karta → kartą, gotówka → gotówką.', 'Płacić чем? — творительный падеж: karta → kartą, gotówka → gotówką.', 'Płacić + instrumental: karta → kartą, gotówka → gotówką.'), words: ['karta', 'gotówka'] }),
      choice('filling', narr('Rogal świętomarciński ma nadzienie z białego maku i orzechów.', 'Рогалик святого Мартина має начинку з білого маку й горіхів.', 'У рогалика святого Мартина начинка из белого мака и орехов.', 'The St Martin’s croissant is filled with white poppy seeds and nuts.'),
        t('Що всередині рогалика?', 'Что внутри рогалика?', 'What’s inside the croissant?'),
        [
          T(t('Білий мак і горіхи', 'Белый мак и орехи', 'White poppy seeds and nuts'), true),
          T(t('Шинка й сир', 'Ветчина и сыр', 'Ham and cheese'), false, t('Це солодкий рогалик: nadzienie z białego maku — начинка з білого маку.', 'Это сладкий рогалик: nadzienie z białego maku — начинка из белого мака.', 'It’s a sweet pastry: nadzienie z białego maku = white poppy filling.')),
          T(t('Сливове повидло', 'Сливовое повидло', 'Plum jam'), false, t('Повидло — powidła. Тут «z białego maku i orzechów» — з білого маку й горіхів.', 'Повидло — powidła. Здесь «z białego maku i orzechów» — из белого мака и орехов.', 'Plum jam is «powidła»; here it’s white poppy and nuts.')),
        ],
        { hint: t('Mak — мак, orzechy — горіхи.', 'Mak — мак, orzechy — орехи.', 'Mak = poppy seeds, orzechy = nuts.'),
          explain: t('Nadzienie z białego maku i orzechów — начинка з білого маку й горіхів. Z + родовий: z maku.', 'Nadzienie z białego maku i orzechów — начинка из белого мака и орехов. Z + родительный: z maku.', 'Z + genitive: z białego maku i orzechów.'), words: ['mak'] }),
    ],
    phrases: [
      ph('Poproszę dwa rogale świętomarcińskie.', 'Два рогалики святого Мартина, будь ласка.', 'Два рогалика святого Мартина, пожалуйста.', 'Two St Martin’s croissants, please.'),
      ph('Na wynos, poproszę.', 'З собою, будь ласка.', 'С собой, пожалуйста.', 'To go, please.'),
      ph('Ile kosztuje jeden rogal?', 'Скільки коштує один рогалик?', 'Сколько стоит один рогалик?', 'How much is one croissant?'),
      ph('Płacę kartą.', 'Плачу карткою.', 'Плачу картой.', 'I’ll pay by card.'),
    ],
  },
  {
    ...base, slug: 'listopad-swieto', season: 'listopad-poznan', tags: ['season-listopad-poznan'], city: 'poznan', scene: 'old-market',
    npc: { name: 'Pan Zbyszek', role: t('сусід', 'сосед', 'neighbour') },
    title: t('11 листопада', '11 ноября', '11 November'),
    goal: t('Поговори із сусідом про свято: дата, вихідний, де хода.', 'Поговори с соседом о празднике: дата, выходной, где шествие.', 'Talk to your neighbour about the holiday: date, day off, the parade.'),
    intro: t('10 листопада. Сусід Бобека, пан Збишек, вішає на балконі біло-червоний прапор.', '10 ноября. Сосед Бобека, пан Збышек, вешает на балконе бело-красный флаг.', '10 November. Bobek’s neighbour, Pan Zbyszek, is hanging a white-and-red flag on his balcony.'),
    note: t(
      '11 листопада — Національне свято Незалежності: 1918 року Польща відновила незалежність. Це вихідний день, більшість магазинів зачинена. У Познані того ж дня святкують день святого Мартина — з ходою та рогаликами.',
      '11 ноября — Национальный праздник Независимости: в 1918 году Польша восстановила независимость. Это выходной день, большинство магазинов закрыто. В Познани в тот же день празднуют день святого Мартина — с шествием и рогаликами.',
      '11 November is National Independence Day: Poland regained independence in 1918. It’s a public holiday and most shops are closed. Poznań also celebrates St Martin’s Day with a parade and croissants.',
    ),
    steps: [
      choice('flag', npc('Dzień dobry! Jutro wieszamy flagi, bo jutro jest Święto Niepodległości.', 'Добрий день! Завтра вивішуємо прапори, бо завтра свято Незалежності.', 'Добрый день! Завтра вывешиваем флаги, потому что завтра День независимости.', 'Hello! Tomorrow we hang flags because it’s Independence Day.'),
        t('Чому завтра вішають прапори?', 'Почему завтра вешают флаги?', 'Why are flags going up tomorrow?'),
        [
          T(t('Завтра свято — День незалежності', 'Завтра праздник — День независимости', 'Tomorrow is a holiday — Independence Day'), true),
          T(t('Завтра в сусіда день народження', 'Завтра у соседа день рождения', 'It’s the neighbour’s birthday'), false, t('День народження — urodziny. Niepodległość — незалежність.', 'День рождения — urodziny. Niepodległość — независимость.', 'Birthday is «urodziny»; «niepodległość» is independence.')),
          T(t('Учора було свято', 'Вчера был праздник', 'There was a holiday yesterday'), false, t('Jutro — завтра, wczoraj — учора.', 'Jutro — завтра, wczoraj — вчера.', 'Jutro = tomorrow, wczoraj = yesterday.')),
        ],
        { hint: t('Jutro — завтра; niepodległość — незалежність.', 'Jutro — завтра; niepodległość — независимость.', 'Jutro = tomorrow; niepodległość = independence.'),
          explain: t('«Święto Niepodległości» — свято Незалежності, 11 листопада. «Wieszamy flagi» — вивішуємо прапори.', '«Święto Niepodległości» — День независимости, 11 ноября. «Wieszamy flagi» — вывешиваем флаги.', '«Święto Niepodległości» is Independence Day, 11 November. «Wieszamy flagi» — we hang flags.'), words: ['jutro', 'flaga', 'niepodległość'] }),
      build('date', undefined, t('Склади: «Одинадцятого листопада — вихідний день».', 'Составь: «Одиннадцатого ноября — выходной день».', 'Build: “The eleventh of November is a day off.”'),
        'Jedenastego listopada jest dzień wolny.', ['jedenasty', 'listopad'],
        { hint: t('Коли? — родовий: jedenastego listopada.', 'Когда? — родительный: jedenastego listopada.', 'When? — genitive: jedenastego listopada.'),
          explain: t('Коли? — jedenastego listopada (родовий). А «яке сьогодні число?» — Dziś jest jedenasty listopada.', 'Когда? — jedenastego listopada (родительный). А «какое сегодня число?» — Dziś jest jedenasty listopada.', 'When? — jedenastego listopada (genitive). “What’s the date?” — Dziś jest jedenasty listopada.'), words: ['dzień wolny', 'listopad'] }),
      choice('shops', npc('Pamiętaj: w święto sklepy są zamknięte. Zrób zakupy dzisiaj!', 'Пам’ятай: у свято магазини зачинені. Зроби покупки сьогодні!', 'Помни: в праздник магазины закрыты. Сделай покупки сегодня!', 'Remember: shops are closed on the holiday. Do your shopping today!'),
        t('Що радить сусід?', 'Что советует сосед?', 'What does the neighbour advise?'),
        [
          T(t('Купити все сьогодні: у свято магазини зачинені', 'Купить всё сегодня: в праздник магазины закрыты', 'Shop today: shops are closed on the holiday'), true),
          T(t('Піти в магазин завтра', 'Пойти в магазин завтра', 'Go shopping tomorrow'), false, t('Zamknięte — зачинені: завтра магазини не працюють.', 'Zamknięte — закрыты: завтра магазины не работают.', 'Zamknięte = closed: shops don’t open tomorrow.')),
          T(t('Купити прапор у магазині', 'Купить флаг в магазине', 'Buy a flag in a shop'), false, t('Про прапор він не казав. «Zrób zakupy dzisiaj» — зроби покупки сьогодні.', 'О флаге он не говорил. «Zrób zakupy dzisiaj» — сделай покупки сегодня.', 'He said «Zrób zakupy dzisiaj» — do your shopping today.')),
        ],
        { hint: t('Zamknięte — зачинені; dzisiaj — сьогодні.', 'Zamknięte — закрыты; dzisiaj — сегодня.', 'Zamknięte = closed; dzisiaj = today.'),
          explain: t('У державні свята в Польщі більшість магазинів зачинена — покупки роблять напередодні.', 'В государственные праздники в Польше большинство магазинов закрыто — покупки делают накануне.', 'Most Polish shops close on public holidays, so people shop the day before.'), words: ['zamknięty', 'święto'] }),
      choice('parade', undefined,
        t('Запитай, де можна побачити ходу святого Мартина.', 'Спроси, где можно увидеть шествие святого Мартина.', 'Ask where you can see the St Martin’s parade.'),
        [
          P('Gdzie można zobaczyć korowód świętomarciński?', true),
          P('Gdzie można kupić korowód świętomarciński?', false, t('Korowód — хода, її не купують, а дивляться: zobaczyć.', 'Korowód — шествие, его не покупают, а смотрят: zobaczyć.', 'A korowód is a parade: you see it (zobaczyć), not buy it.')),
          P('Gdzie można zobaczył korowód świętomarciński?', false, t('Після «można» — інфінітив: można zobaczyć.', 'После «można» — инфинитив: można zobaczyć.', 'After «można» use the infinitive: można zobaczyć.')),
        ],
        { hint: t('Można + інфінітив: można zobaczyć — можна побачити.', 'Można + инфинитив: można zobaczyć — можно увидеть.', 'Można + infinitive: można zobaczyć.'),
          explain: t('«Gdzie można zobaczyć…?» — де можна побачити…? Korowód — хода, процесія.', '«Gdzie można zobaczyć…?» — где можно увидеть…? Korowód — шествие, процессия.', '«Gdzie można zobaczyć…?» — where can I see…? Korowód = parade.'), words: ['korowód'] }),
      choice('wish', npc('Korowód idzie ulicą Święty Marcin. A potem wszyscy jedzą rogale!', 'Хода йде вулицею Święty Marcin. А потім усі їдять рогалики!', 'Шествие идёт по улице Święty Marcin. А потом все едят рогалики!', 'The parade goes along Święty Marcin street. Then everyone eats croissants!'),
        t('Подякуй сусідові й побажай гарного свята.', 'Поблагодари соседа и пожелай хорошего праздника.', 'Thank the neighbour and wish him a nice holiday.'),
        [
          P('Dziękuję za informację! Miłego świętowania!', true),
          P('Dziękuję za informację! Wesołych Świąt!', false, t('«Wesołych Świąt!» кажуть на Різдво й Великдень. Тут краще: «Miłego świętowania!»', '«Wesołych Świąt!» говорят на Рождество и Пасху. Здесь лучше: «Miłego świętowania!»', '«Wesołych Świąt!» is for Christmas and Easter. Here: «Miłego świętowania!»')),
          P('Dziękuję za informację! Smacznego!', false, t('«Smacznego» — смачного, перед їжею. Побажати свята — «Miłego świętowania!»', '«Smacznego» — приятного аппетита, перед едой. Пожелать праздника — «Miłego świętowania!»', '«Smacznego» is “enjoy your meal”. For a holiday: «Miłego świętowania!»')),
        ],
        { hint: t('Miłego… — гарного…: miłego świętowania.', 'Miłego… — хорошего…: miłego świętowania.', 'Miłego… = have a nice…: miłego świętowania.'),
          explain: t('«Miłego świętowania!» — гарного святкування. «Wesołych Świąt!» — лише на Різдво й Великдень.', '«Miłego świętowania!» — хорошего праздника. «Wesołych Świąt!» — только на Рождество и Пасху.', '«Miłego świętowania!» — enjoy the celebration. «Wesołych Świąt!» is only for Christmas and Easter.'), words: ['dziękuję'] }),
    ],
    phrases: [
      ph('Jutro jest Święto Niepodległości.', 'Завтра свято Незалежності.', 'Завтра День независимости.', 'Tomorrow is Independence Day.'),
      ph('Jedenastego listopada jest dzień wolny.', 'Одинадцятого листопада — вихідний.', 'Одиннадцатого ноября — выходной.', 'The eleventh of November is a day off.'),
      ph('W święto sklepy są zamknięte.', 'У свято магазини зачинені.', 'В праздник магазины закрыты.', 'Shops are closed on the holiday.'),
      ph('Gdzie można zobaczyć korowód?', 'Де можна побачити ходу?', 'Где можно увидеть шествие?', 'Where can I see the parade?'),
      ph('Miłego świętowania!', 'Гарного святкування!', 'Хорошего праздника!', 'Enjoy the celebration!'),
    ],
  },
  {
    ...base, slug: 'andrzejki-wosk', season: 'listopad-poznan', tags: ['season-listopad-poznan'], city: 'poznan', scene: 'flat',
    npc: { name: 'Kasia', role: t('подруга', 'подруга', 'a friend') },
    title: t('Анджейки', 'Анджейки', 'St Andrew’s Eve'),
    goal: t('Прийми запрошення, лий віск і дізнайся своє «майбутнє».', 'Прими приглашение, лей воск и узнай своё «будущее».', 'Accept the invitation, pour wax and learn your “future”.'),
    intro: t('Вечір 29 листопада. Подруга Кася кличе Бобека на анджейки — вечір ворожіння.', 'Вечер 29 ноября. Подруга Кася зовёт Бобека на анджейки — вечер гаданий.', 'The evening of 29 November. Kasia invites Bobek to andrzejki, a fortune-telling night.'),
    note: t(
      'Andrzejki — вечір напередодні дня святого Андрія (30 листопада). Традиційно ворожать: ллють гарячий віск через вушко ключа в холодну воду й угадують майбутнє за тінню застиглої фігурки. Це гра, а не справжнє передбачення.',
      'Andrzejki — вечер накануне дня святого Андрея (30 ноября). Традиционно гадают: льют горячий воск через ушко ключа в холодную воду и угадывают будущее по тени застывшей фигурки. Это игра, а не настоящее предсказание.',
      'Andrzejki is the eve of St Andrew’s Day (30 November). People pour hot wax through a key into cold water and read the future from the shadow of the shape. It’s a game, not a real prediction.',
    ),
    steps: [
      choice('invite', npc('Cześć! Wpadniesz dziś na andrzejki?', 'Привіт! Заскочиш сьогодні на анджейки?', 'Привет! Заглянешь сегодня на анджейки?', 'Hi! Will you drop by for andrzejki tonight?'),
        t('Прийми запрошення й запитай, о котрій.', 'Прими приглашение и спроси, во сколько.', 'Accept and ask what time.'),
        [
          P('Chętnie! O której?', true),
          P('Nie ma za co! O której?', false, t('«Nie ma za co» — нема за що, відповідь на «дякую».', '«Nie ma za co» — не за что, ответ на «спасибо».', '«Nie ma za co» answers “thank you”.')),
          P('Chętnie! Ile kosztuje?', false, t('Це запрошення до подруги, а не покупка. Запитай про час: «O której?»', 'Это приглашение к подруге, а не покупка. Спроси о времени: «O której?»', 'It’s a friend’s invitation, not a purchase. Ask the time: «O której?»')),
        ],
        { hint: t('Chętnie — охоче; o której? — о котрій?', 'Chętnie — с радостью; o której? — во сколько?', 'Chętnie = gladly; o której? = what time?'),
          explain: t('«Chętnie!» — охоче, із радістю. «O której?» — о котрій годині?', '«Chętnie!» — с радостью. «O której?» — во сколько?', '«Chętnie!» = gladly. «O której?» = at what time?'), words: ['chętnie', 'andrzejki'] }),
      choice('bring', npc('O ósmej wieczorem. Przynieś świeczkę, będziemy lać wosk!', 'О восьмій вечора. Принеси свічку, будемо лити віск!', 'В восемь вечера. Принеси свечку, будем лить воск!', 'At eight in the evening. Bring a candle, we’ll pour wax!'),
        t('Що треба принести?', 'Что нужно принести?', 'What should you bring?'),
        [
          T(t('Свічку', 'Свечку', 'A candle'), true),
          T(t('Ключ', 'Ключ', 'A key'), false, t('Ключ (klucz) у Касі вже є; принести треба świeczkę — свічку.', 'Ключ (klucz) у Каси уже есть; принести нужно świeczkę — свечку.', 'Kasia has a key; bring a candle — świeczkę.')),
          T(t('Торт', 'Торт', 'A cake'), false, t('Tort — торт. Кася сказала: «Przynieś świeczkę» — принеси свічку.', 'Tort — торт. Кася сказала: «Przynieś świeczkę» — принеси свечку.', 'Tort is cake. She said «Przynieś świeczkę» — bring a candle.')),
        ],
        { hint: t('Przynieś — принеси; świeczka — свічка.', 'Przynieś — принеси; świeczka — свечка.', 'Przynieś = bring; świeczka = candle.'),
          explain: t('«Przynieś» — наказовий спосіб від przynieść (принести). «O ósmej wieczorem» — о восьмій вечора.', '«Przynieś» — повелительное наклонение от przynieść (принести). «O ósmej wieczorem» — в восемь вечера.', '«Przynieś» is the imperative of przynieść. «O ósmej wieczorem» = at 8 pm.'), words: ['przynieść', 'świeczka', 'wosk'] }),
      build('pour', undefined, t('Скажи: «Я ллю віск через ключ у воду».', 'Скажи: «Я лью воск через ключ в воду».', 'Say: “I’m pouring wax through a key into the water.”'),
        'Leję wosk przez klucz do wody.', ['woda', 'lać'],
        { hint: t('Lać → ja leję. Przez + знахідний, do + родовий.', 'Lać → ja leję. Przez + винительный, do + родительный.', 'Lać → ja leję. Przez + accusative, do + genitive.'),
          explain: t('Lać — лити: ja leję. Przez klucz — через ключ (знахідний). Do wody — у воду (родовий).', 'Lać — лить: ja leję. Przez klucz — через ключ (винительный). Do wody — в воду (родительный).', 'Lać: ja leję. Przez klucz (accusative), do wody (genitive).'), words: ['wosk', 'klucz'] }),
      choice('shadow', npc('Zobacz cień na ścianie! Co widzisz?', 'Подивися на тінь на стіні! Що ти бачиш?', 'Посмотри на тень на стене! Что ты видишь?', 'Look at the shadow on the wall! What do you see?'),
        t('Тінь схожа на корабель. Скажи про це.', 'Тень похожа на корабль. Скажи об этом.', 'The shadow looks like a ship. Say so.'),
        [
          P('Widzę statek!', true),
          P('Widzę statku!', false, t('Widzieć + знахідний: statek (неживий — як у називному).', 'Widzieć + винительный: statek (неодушевлённый — как в именительном).', 'Widzieć + accusative: statek (inanimate, same as nominative).')),
          P('Jestem statek!', false, t('«Jestem» — я є. «Я бачу» — widzę.', '«Jestem» — я есть. «Я вижу» — widzę.', '«Jestem» = I am. “I see” = widzę.')),
        ],
        { hint: t('Widzę — я бачу; statek — корабель.', 'Widzę — я вижу; statek — корабль.', 'Widzę = I see; statek = ship.'),
          explain: t('«Widzę statek» — я бачу корабель. Cień — тінь.', '«Widzę statek» — я вижу корабль. Cień — тень.', '«Widzę statek» = I see a ship. Cień = shadow.'), words: ['statek', 'cień'] }),
      choice('future', npc('Statek? To znaczy, że będziesz dużo podróżować!', 'Корабель? Це означає, що ти будеш багато подорожувати!', 'Корабль? Значит, ты будешь много путешествовать!', 'A ship? That means you’ll travel a lot!'),
        t('Що означає корабель за ворожінням?', 'Что значит корабль по гаданию?', 'What does the ship mean?'),
        [
          T(t('Будеш багато подорожувати', 'Будешь много путешествовать', 'You’ll travel a lot'), true),
          T(t('Будеш працювати на кораблі', 'Будешь работать на корабле', 'You’ll work on a ship'), false, t('Podróżować — подорожувати, а не працювати (pracować).', 'Podróżować — путешествовать, а не работать (pracować).', 'Podróżować = to travel, not to work (pracować).')),
          T(t('Ти вже багато подорожував', 'Ты уже много путешествовал', 'You’ve already travelled a lot'), false, t('Będziesz — майбутній час: «будеш».', 'Będziesz — будущее время: «будешь».', 'Będziesz is the future tense.')),
        ],
        { hint: t('Będziesz + інфінітив — майбутній час.', 'Będziesz + инфинитив — будущее время.', 'Będziesz + infinitive = future.'),
          explain: t('«Będziesz podróżować» — будеш подорожувати (będę, będziesz + інфінітив).', '«Będziesz podróżować» — будешь путешествовать (będę, będziesz + инфинитив).', '«Będziesz podróżować» = you will travel (będę/będziesz + infinitive).'), words: ['podróż', 'przyszłość'] }),
      choice('thanks', npc('I jak, wierzysz we wróżby?', 'Ну що, віриш у ворожіння?', 'Ну как, веришь в гадания?', 'So, do you believe in fortunes?'),
        t('Відповідай із гумором і подякуй за вечір.', 'Ответь с юмором и поблагодари за вечер.', 'Answer with humour and thank her for the evening.'),
        [
          P('Trochę! Dziękuję za super wieczór!', true),
          P('Trochę! Dziękuję za super wieczorem!', false, t('Za + знахідний: za wieczór.', 'Za + винительный: za wieczór.', 'Za + accusative: za wieczór.')),
          P('Trochę! Proszę za super wieczór!', false, t('Дякують словом «dziękuję»: dziękuję za…', 'Благодарят словом «dziękuję»: dziękuję za…', 'To thank, say «dziękuję za…».')),
        ],
        { hint: t('Dziękuję za + знахідний.', 'Dziękuję za + винительный.', 'Dziękuję za + accusative.'),
          explain: t('«Dziękuję za wieczór» — дякую за вечір. Wróżba — ворожіння.', '«Dziękuję za wieczór» — спасибо за вечер. Wróżba — гадание.', '«Dziękuję za wieczór» = thanks for the evening. Wróżba = fortune.'), words: ['wróżba', 'trochę'] }),
    ],
    phrases: [
      ph('Chętnie! O której?', 'Охоче! О котрій?', 'С радостью! Во сколько?', 'Gladly! What time?'),
      ph('Leję wosk przez klucz do wody.', 'Ллю віск через ключ у воду.', 'Лью воск через ключ в воду.', 'I’m pouring wax through a key into the water.'),
      ph('Widzę statek!', 'Я бачу корабель!', 'Я вижу корабль!', 'I see a ship!'),
      ph('Będziesz dużo podróżować.', 'Ти будеш багато подорожувати.', 'Ты будешь много путешествовать.', 'You will travel a lot.'),
      ph('Dziękuję za super wieczór!', 'Дякую за чудовий вечір!', 'Спасибо за отличный вечер!', 'Thanks for a great evening!'),
    ],
  },
];

// ═════════════════════ Польське Різдво ═════════════════════
const SWIETA: Mission[] = [
  {
    ...base, slug: 'jarmark-oscypek', season: 'swieta', tags: ['season-swieta', 'checkout'], city: 'krakow', scene: 'christmas-market',
    npc: { name: 'Pan Józef', role: t('продавець на ярмарку', 'продавец на ярмарке', 'market vendor') },
    title: t('Різдвяний ярмарок', 'Рождественская ярмарка', 'The Christmas market'),
    goal: t('Замов оскипек і чай із малиновим соком, оплати й відповідай на побажання.', 'Закажи оскыпек и чай с малиновым соком, оплати и ответь на поздравление.', 'Order oscypek and tea with raspberry syrup, pay and answer the wishes.'),
    intro: t('Грудневий вечір на Ринку Головному в Кракові. Пахне пряниками й смаженим сиром — це різдвяний ярмарок.', 'Декабрьский вечер на Rynku Głównym в Кракове. Пахнет пряниками и жареным сыром — это рождественская ярмарка.', 'A December evening on Kraków’s main square. It smells of gingerbread and grilled cheese — the Christmas market.'),
    note: t(
      'Jarmark bożonarodzeniowy — різдвяний ярмарок; у Кракові його влаштовують на Головному ринку. Oscypek — копчений сир із гір Підгалля, переважно з овечого молока; на ярмарках його смажать на грилі й подають із журавлиною. Ціни — навчальні.',
      'Jarmark bożonarodzeniowy — рождественская ярмарка; в Кракове её устраивают на Главном рынке. Oscypek — копчёный сыр с гор Подгалья, в основном из овечьего молока; на ярмарках его жарят на гриле и подают с клюквой. Цены — учебные.',
      'A jarmark bożonarodzeniowy is a Christmas market; Kraków holds one on the main square. Oscypek is a smoked cheese from the Podhale mountains, mostly sheep’s milk, grilled and served with cranberry. Prices are for practice.',
    ),
    steps: [
      choice('cheese', npc('Dobry wieczór! Oscypek z grilla, gorący!', 'Добрий вечір! Оскипек із гриля, гарячий!', 'Добрый вечер! Оскыпек с гриля, горячий!', 'Good evening! Grilled oscypek, hot!'),
        t('Попроси оскипек із журавлиною.', 'Попроси оскыпек с клюквой.', 'Ask for oscypek with cranberry.'),
        [
          P('Poproszę oscypek z żurawiną.', true),
          P('Poproszę oscypek z żurawina.', false, t('Після «z» — орудний: z żurawiną.', 'После «z» — творительный: z żurawiną.', 'After «z» use the instrumental: z żurawiną.')),
          P('Mam oscypek z żurawiną.', false, t('«Mam» — у мене є. Попросити — «Poproszę…».', '«Mam» — у меня есть. Попросить — «Poproszę…».', '«Mam» = I have. To ask: «Poproszę…».')),
        ],
        { hint: t('Z + орудний: z żurawiną.', 'Z + творительный: z żurawiną.', 'Z + instrumental: z żurawiną.'),
          explain: t('«Z żurawiną» — із журавлиною: після z (разом із) — орудний відмінок.', '«Z żurawiną» — с клюквой: после z (вместе с) — творительный падеж.', '«Z żurawiną» = with cranberry: z + instrumental.'), words: ['oscypek', 'żurawina', 'jarmark'] }),
      build('tea', undefined, t('Попроси ще чай із малиновим соком.', 'Попроси ещё чай с малиновым соком.', 'Also ask for tea with raspberry syrup.'),
        'Poproszę też herbatę z sokiem malinowym.', ['herbata', 'sok'],
        { hint: t('Poproszę + знахідний: herbatę. Z + орудний: z sokiem malinowym.', 'Poproszę + винительный: herbatę. Z + творительный: z sokiem malinowym.', 'Poproszę + accusative: herbatę. Z + instrumental: z sokiem malinowym.'),
          explain: t('Herbata → herbatę (знахідний). Sok malinowy → z sokiem malinowym (орудний). Też — теж.', 'Herbata → herbatę (винительный). Sok malinowy → z sokiem malinowym (творительный). Też — тоже.', 'Herbata → herbatę (accusative); z sokiem malinowym (instrumental). Też = also.'), words: ['herbata'] }),
      choice('total', npc('Razem dwadzieścia osiem złotych.', 'Разом двадцять вісім злотих.', 'Итого двадцать восемь злотых.', 'Twenty-eight złoty in total.'),
        AMOUNT_TASK,
        [
          T(t('28 zł'), true),
          T(t('38 zł'), false, t('trzydzieści = 30, а тут dwadzieścia = 20 → 28.', 'trzydzieści = 30, а здесь dwadzieścia = 20 → 28.', 'trzydzieści = 30; you heard dwadzieścia = 20 → 28.')),
          T(t('82 zł'), false, t('Одиниці — в кінці: dwadzieścia osiem = 20 + 8 = 28.', 'Единицы — в конце: dwadzieścia osiem = 20 + 8 = 28.', 'Units come last: dwadzieścia osiem = 28.')),
        ],
        { hint: t('dwadzieścia — 20, osiem — 8.', 'dwadzieścia — 20, osiem — 8.', 'dwadzieścia = 20, osiem = 8.'),
          explain: t('Як і в українській: спочатку десятки, потім одиниці. Dwadzieścia osiem = 28.', 'Как и в русском: сначала десятки, потом единицы. Dwadzieścia osiem = 28.', 'Tens first, then units: dwadzieścia osiem = 28.'), words: ['razem', 'dwadzieścia'] }),
      choice('gingerbread', npc('Może jeszcze pierniki? Są z Torunia!', 'Може, ще пряники? Вони з Торуня!', 'Может, ещё пряники? Они из Торуня!', 'Some gingerbread too? It’s from Toruń!'),
        t('Ввічливо відмовся.', 'Вежливо откажись.', 'Politely say no.'),
        [
          P('Nie, dziękuję. To wszystko.', true),
          P('Nie, proszę. To wszystko.', false, t('Відмова — «Nie, dziękuję». «Proszę» — будь ласка / прошу.', 'Отказ — «Nie, dziękuję». «Proszę» — пожалуйста / прошу.', 'To decline: «Nie, dziękuję». «Proszę» means please.')),
          P('Tak, nie, dziękuję.', false, t('«Tak» — так, «nie» — ні: обери одне. Відмова — «Nie, dziękuję».', '«Tak» — да, «nie» — нет: выбери одно. Отказ — «Nie, dziękuję».', '«Tak» = yes, «nie» = no: pick one.')),
        ],
        { hint: t('Nie, dziękuję — ні, дякую. To wszystko — це все.', 'Nie, dziękuję — нет, спасибо. To wszystko — это всё.', 'Nie, dziękuję = no, thanks. To wszystko = that’s all.'),
          explain: t('Toruń славиться пряниками (pierniki). Відмовити ввічливо: «Nie, dziękuję. To wszystko».', 'Торунь славится пряниками (pierniki). Отказать вежливо: «Nie, dziękuję. To wszystko».', 'Toruń is famous for gingerbread (pierniki). Decline: «Nie, dziękuję. To wszystko».'), words: ['piernik'] }),
      choice('wishes', npc('Proszę bardzo. Wesołych Świąt!', 'Прошу дуже. Веселих свят!', 'Пожалуйста. Весёлых праздников!', 'Here you go. Merry Christmas!'),
        t('Відповідай на побажання.', 'Ответь на поздравление.', 'Answer the wishes.'),
        [
          P('Dziękuję, wzajemnie!', true),
          P('Dziękuję, Wesołego Świątu!', false, t('Правильно: «Wesołych Świąt!» — родовий множини (Święta → Świąt).', 'Правильно: «Wesołych Świąt!» — родительный множественного (Święta → Świąt).', 'Correct form: «Wesołych Świąt!» (genitive plural).')),
          P('Dziękuję, smacznego!', false, t('«Smacznego» — смачного. На побажання відповідають: «Wzajemnie!» — взаємно.', '«Smacznego» — приятного аппетита. На поздравление отвечают: «Wzajemnie!» — взаимно.', '«Smacznego» = enjoy your meal. Reply to wishes with «Wzajemnie!»')),
        ],
        { hint: t('Wzajemnie — взаємно.', 'Wzajemnie — взаимно.', 'Wzajemnie = same to you.'),
          explain: t('«Wesołych Świąt!» — веселих свят. Відповідь: «Wzajemnie!» або «Nawzajem!» — взаємно.', '«Wesołych Świąt!» — весёлых праздников. Ответ: «Wzajemnie!» или «Nawzajem!» — взаимно.', 'Reply to «Wesołych Świąt!» with «Wzajemnie!» or «Nawzajem!».'), words: ['Wesołych Świąt', 'wzajemnie'] }),
    ],
    phrases: [
      ph('Poproszę oscypek z żurawiną.', 'Оскипек із журавлиною, будь ласка.', 'Оскыпек с клюквой, пожалуйста.', 'Oscypek with cranberry, please.'),
      ph('Poproszę też herbatę z sokiem malinowym.', 'І чай із малиновим соком, будь ласка.', 'И чай с малиновым соком, пожалуйста.', 'And tea with raspberry syrup, please.'),
      ph('Nie, dziękuję. To wszystko.', 'Ні, дякую. Це все.', 'Нет, спасибо. Это всё.', 'No, thanks. That’s all.'),
      ph('Wesołych Świąt! — Wzajemnie!', 'Веселих свят! — Взаємно!', 'Весёлых праздников! — Взаимно!', 'Merry Christmas! — Same to you!'),
    ],
  },
  {
    ...base, slug: 'wigilia-kolacja', season: 'swieta', tags: ['season-swieta'], city: 'krakow', scene: 'flat',
    npc: { name: 'Pani Magda', role: t('господиня', 'хозяйка дома', 'the host') },
    title: t('Вечеря на Вігілію', 'Ужин в Сочельник', 'Christmas Eve supper'),
    goal: t('Поділися облаткою, побажай добра, запитай про вільне місце й похвали страви.', 'Поделись облаткой, пожелай добра, спроси о свободном месте и похвали блюда.', 'Share the wafer, give wishes, ask about the empty seat and praise the food.'),
    intro: t('24 грудня. Польські друзі запросили Бобека на Вігілію — святкову вечерю напередодні Різдва.', '24 декабря. Польские друзья пригласили Бобека на Вигилию — праздничный ужин в канун Рождества.', '24 December. Polish friends invited Bobek to Wigilia, the Christmas Eve supper.'),
    note: t(
      'Wigilia — вечеря 24 грудня. Починають, коли на небі з’являється перша зірка; перед їжею діляться облаткою (opłatek) і бажають одне одному добра. Традиційно на столі 12 пісних страв — наприклад, barszcz z uszkami і короп — та одне зайве місце для несподіваного гостя.',
      'Wigilia — ужин 24 декабря. Начинают, когда на небе появляется первая звезда; перед едой делятся облаткой (opłatek) и желают друг другу добра. Традиционно на столе 12 постных блюд — например, barszcz z uszkami и карп — и одно лишнее место для неожиданного гостя.',
      'Wigilia is the supper on 24 December. It starts when the first star appears; before eating people share the wafer (opłatek) and exchange wishes. Traditionally there are 12 meatless dishes — like barszcz with uszka and carp — and one extra place for an unexpected guest.',
    ),
    steps: [
      choice('star', npc('Zaczynamy, kiedy na niebie pojawi się pierwsza gwiazdka.', 'Починаємо, коли на небі з’явиться перша зірка.', 'Начинаем, когда на небе появится первая звезда.', 'We start when the first star appears in the sky.'),
        t('Коли почнеться вечеря?', 'Когда начнётся ужин?', 'When does supper start?'),
        [
          T(t('Коли на небі з’явиться перша зірка', 'Когда на небе появится первая звезда', 'When the first star appears'), true),
          T(t('Рівно опівночі', 'Ровно в полночь', 'At midnight'), false, t('Опівночі (o północy) починається Pasterka — нічна меса, а Вігілія — з першою зіркою.', 'В полночь (o północy) начинается Pasterka — ночная месса, а Вигилия — с первой звездой.', 'Midnight is for Pasterka (midnight mass); Wigilia starts with the first star.')),
          T(t('В обід', 'В обед', 'At lunchtime'), false, t('Obiad — обід; Вігілія — це вечеря (kolacja), увечері.', 'Obiad — обед; Вигилия — это ужин (kolacja), вечером.', 'Obiad is lunch; Wigilia is a supper (kolacja) in the evening.')),
        ],
        { hint: t('Gwiazdka — зірочка; pierwsza — перша.', 'Gwiazdka — звёздочка; pierwsza — первая.', 'Gwiazdka = little star; pierwsza = first.'),
          explain: t('«Pierwsza gwiazdka» — перша зірка на небі. З нею починають вігілійну вечерю.', '«Pierwsza gwiazdka» — первая звезда на небе. С ней начинают сочельниковый ужин.', '«Pierwsza gwiazdka» — the first star; Wigilia supper begins with it.'), words: ['Wigilia', 'gwiazda', 'kolacja'] }),
      choice('wafer', npc('Teraz dzielimy się opłatkiem i składamy sobie życzenia.', 'Тепер ділимося облаткою й бажаємо одне одному добра.', 'Теперь делимся облаткой и желаем друг другу добра.', 'Now we share the wafer and exchange wishes.'),
        t('Побажай здоров’я і щастя.', 'Пожелай здоровья и счастья.', 'Wish health and happiness.'),
        [
          P('Życzę ci zdrowia i szczęścia!', true),
          P('Życzę ci zdrowie i szczęście!', false, t('Życzyć + родовий: zdrowia, szczęścia.', 'Życzyć + родительный: zdrowia, szczęścia.', 'Życzyć takes the genitive: zdrowia, szczęścia.')),
          P('Dziękuję ci zdrowia i szczęścia!', false, t('Бажають словом «Życzę…», а «dziękuję» — дякую.', 'Желают словом «Życzę…», а «dziękuję» — спасибо.', 'To wish, say «Życzę…»; «dziękuję» is thanks.')),
        ],
        { hint: t('Życzę ci + родовий.', 'Życzę ci + родительный.', 'Życzę ci + genitive.'),
          explain: t('«Życzę ci zdrowia i szczęścia» — бажаю тобі здоров’я і щастя. Те, чого бажають, — у родовому.', '«Życzę ci zdrowia i szczęścia» — желаю тебе здоровья и счастья. То, чего желают, — в родительном.', '«Życzę ci zdrowia i szczęścia» — what you wish goes in the genitive.'), words: ['opłatek', 'życzenia', 'zdrowie', 'szczęście'] }),
      build('seat', undefined, t('Біля столу є вільне місце. Запитай: «Для кого це вільне місце?»', 'У стола есть свободное место. Спроси: «Для кого это свободное место?»', 'There’s an empty seat. Ask: “Who is this empty seat for?”'),
        'Dla kogo jest to wolne miejsce?', ['kto', 'wolny'],
        { hint: t('Dla + родовий: dla kogo? — для кого?', 'Dla + родительный: dla kogo? — для кого?', 'Dla + genitive: dla kogo? — for whom?'),
          explain: t('«Dla kogo?» — для кого? (kto → kogo). Miejsce — середній рід: to wolne miejsce.', '«Dla kogo?» — для кого? (kto → kogo). Miejsce — средний род: to wolne miejsce.', '«Dla kogo?» — for whom? Miejsce is neuter: to wolne miejsce.'), words: ['wolny', 'miejsce'] }),
      choice('guest', npc('Dla niespodziewanego gościa. Tak każe tradycja.', 'Для несподіваного гостя. Так велить традиція.', 'Для неожиданного гостя. Так велит традиция.', 'For an unexpected guest. That’s the tradition.'),
        t('Для кого це місце?', 'Для кого это место?', 'Who is the seat for?'),
        [
          T(t('Для несподіваного гостя', 'Для неожиданного гостя', 'An unexpected guest'), true),
          T(t('Для Святого Миколая', 'Для Деда Мороза', 'Santa Claus'), false, t('Niespodziewany gość — несподіваний гість, мандрівник.', 'Niespodziewany gość — неожиданный гость, путник.', 'Niespodziewany gość = an unexpected guest.')),
          T(t('Для собаки', 'Для собаки', 'The dog'), false, t('Gość — гість. Місце залишають для людини, яка може постукати в двері.', 'Gość — гость. Место оставляют для человека, который может постучать в дверь.', 'Gość = guest: the seat is for a person who might knock.')),
        ],
        { hint: t('Gość — гість; niespodziewany — несподіваний.', 'Gość — гость; niespodziewany — неожиданный.', 'Gość = guest; niespodziewany = unexpected.'),
          explain: t('Додаткове місце за столом — для несподіваного гостя: «tak każe tradycja» — так велить традиція.', 'Дополнительное место за столом — для неожиданного гостя: «tak każe tradycja» — так велит традиция.', 'The extra place is for an unexpected guest — «tak każe tradycja».'), words: ['gość', 'tradycja'] }),
      choice('soup', npc('Na stole jest dwanaście potraw. Spróbuj barszczu z uszkami!', 'На столі дванадцять страв. Скуштуй борщу з вушками!', 'На столе двенадцать блюд. Попробуй борщ с ушками!', 'There are twelve dishes on the table. Try the barszcz with uszka!'),
        t('Скуштуй і похвали борщ.', 'Попробуй и похвали борщ.', 'Taste and praise the barszcz.'),
        [
          P('Barszcz jest pyszny!', true),
          P('Barszcz jest pyszna!', false, t('Barszcz — чоловічий рід: pyszny.', 'Barszcz — мужской род: pyszny.', 'Barszcz is masculine: pyszny.')),
          P('Barszcz są pyszne!', false, t('Barszcz — один: jest pyszny.', 'Barszcz — один: jest pyszny.', 'One barszcz: jest pyszny.')),
        ],
        { hint: t('Barszcz — він: pyszny.', 'Barszcz — он: pyszny.', 'Barszcz is masculine: pyszny.'),
          explain: t('Прикметник узгоджується з іменником: barszcz (ч.) — pyszny, zupa (ж.) — pyszna.', 'Прилагательное согласуется с существительным: barszcz (м.) — pyszny, zupa (ж.) — pyszna.', 'Adjectives agree: barszcz (m) — pyszny, zupa (f) — pyszna.'), words: ['barszcz', 'uszka', 'pyszny', 'dwanaście'] }),
      choice('carp', npc('A karp? Spróbujesz?', 'А короп? Скуштуєш?', 'А карп? Попробуешь?', 'And the carp? Will you try it?'),
        t('Скажи, що спробуєш, але трохи.', 'Скажи, что попробуешь, но немного.', 'Say you’ll try a little.'),
        [
          P('Chętnie, ale tylko trochę.', true),
          P('Chętnie, ale tylko trochy.', false, t('Trochę — трохи (не змінюється).', 'Trochę — немного (не изменяется).', 'Trochę = a little (doesn’t change).')),
          P('Nie, dziękuję, jestem karp.', false, t('«Jestem karp» — «я короп». Відмовити: «Nie, dziękuję».', '«Jestem karp» — «я карп». Отказать: «Nie, dziękuję».', '«Jestem karp» means “I am a carp”.')),
        ],
        { hint: t('Chętnie — охоче; trochę — трохи.', 'Chętnie — охотно; trochę — немного.', 'Chętnie = gladly; trochę = a little.'),
          explain: t('«Chętnie, ale tylko trochę» — охоче, але лише трохи. Короп — традиційна вігілійна страва.', '«Chętnie, ale tylko trochę» — охотно, но только немного. Карп — традиционное блюдо Вигилии.', '«Chętnie, ale tylko trochę» — gladly, but just a little. Carp is a classic Wigilia dish.'), words: ['karp', 'chętnie', 'trochę'] }),
    ],
    phrases: [
      ph('Życzę ci zdrowia i szczęścia!', 'Бажаю тобі здоров’я і щастя!', 'Желаю тебе здоровья и счастья!', 'I wish you health and happiness!'),
      ph('Dla kogo jest to wolne miejsce?', 'Для кого це вільне місце?', 'Для кого это свободное место?', 'Who is this empty seat for?'),
      ph('Barszcz jest pyszny!', 'Борщ дуже смачний!', 'Борщ очень вкусный!', 'The barszcz is delicious!'),
      ph('Chętnie, ale tylko trochę.', 'Охоче, але лише трохи.', 'С удовольствием, но только немного.', 'Gladly, but just a little.'),
    ],
  },
  {
    ...base, slug: 'sylwester-impreza', season: 'swieta', tags: ['season-swieta'], city: 'krakow', scene: 'flat',
    npc: { name: 'Tomek', role: t('друг', 'друг', 'a friend') },
    title: t('Сильвестр', 'Сильвестр', 'New Year’s Eve'),
    goal: t('Домовся про вечірку, скажи про феєрверки й привітай усіх опівночі.', 'Договорись о вечеринке, скажи про фейерверки и поздравь всех в полночь.', 'Arrange the party, talk about fireworks and greet everyone at midnight.'),
    intro: t('31 грудня. Друг Томек кличе Бобека зустрічати Новий рік — Sylwester.', '31 декабря. Друг Томек зовёт Бобека встречать Новый год — Sylwester.', '31 December. Tomek invites Bobek to see in the New Year — Sylwester.'),
    note: t(
      'Sylwester — новорічна ніч 31 грудня (день святого Сильвестра). Опівночі рахують секунди й бажають одне одному «Szczęśliwego Nowego Roku!» або по-старовинному «Do siego roku!». 1 січня — вихідний.',
      'Sylwester — новогодняя ночь 31 декабря (день святого Сильвестра). В полночь считают секунды и желают друг другу «Szczęśliwego Nowego Roku!» или по-старинному «Do siego roku!». 1 января — выходной.',
      'Sylwester is New Year’s Eve, 31 December (St Sylvester’s Day). At midnight people count down and wish «Szczęśliwego Nowego Roku!» or the old «Do siego roku!». 1 January is a day off.',
    ),
    steps: [
      choice('invite', npc('Co robisz w Sylwestra? Robimy imprezę u mnie!', 'Що робиш на Сильвестра? Робимо вечірку в мене!', 'Что делаешь в Сильвестр? Устраиваем вечеринку у меня!', 'What are you doing on New Year’s Eve? Party at my place!'),
        t('Погодься й запитай, що принести.', 'Согласись и спроси, что принести.', 'Agree and ask what to bring.'),
        [
          P('Super! Co mam przynieść?', true),
          P('Super! Co mam przyniosę?', false, t('Після «mam» — інфінітив: co mam przynieść?', 'После «mam» — инфинитив: co mam przynieść?', 'After «mam» use the infinitive: przynieść.')),
          P('Super! Gdzie jest Sylwester?', false, t('Sylwester — це ніч 31 грудня, а не місце. Запитай, що принести: «Co mam przynieść?»', 'Sylwester — это ночь 31 декабря, а не место. Спроси, что принести: «Co mam przynieść?»', 'Sylwester is a night, not a place. Ask «Co mam przynieść?»')),
        ],
        { hint: t('Co mam + інфінітив? — що мені…?', 'Co mam + инфинитив? — что мне…?', 'Co mam + infinitive? — what should I…?'),
          explain: t('«Co mam przynieść?» — що мені принести? «W Sylwestra» — у новорічну ніч.', '«Co mam przynieść?» — что мне принести? «W Sylwestra» — в новогоднюю ночь.', '«Co mam przynieść?» — what should I bring? «W Sylwestra» — on New Year’s Eve.'), words: ['Sylwester', 'impreza', 'przynieść'] }),
      choice('time', npc('Przynieś coś słodkiego. Zaczynamy o dziewiątej.', 'Принеси щось солодке. Починаємо о дев’ятій.', 'Принеси что-нибудь сладкое. Начинаем в девять.', 'Bring something sweet. We start at nine.'),
        t('О котрій починається вечірка?', 'Во сколько начинается вечеринка?', 'What time does the party start?'),
        [
          T(t('О дев’ятій', 'В девять', 'At nine'), true),
          T(t('О дев’ятнадцятій', 'В девятнадцать', 'At 19:00'), false, t('dziewiętnasta — 19, а dziewiąta — дев’ята.', 'dziewiętnasta — 19, а dziewiąta — девятая.', 'dziewiętnasta = 19, dziewiąta = 9.')),
          T(t('Опівночі', 'В полночь', 'At midnight'), false, t('Опівночі — o północy. Тут — o dziewiątej.', 'В полночь — o północy. Здесь — o dziewiątej.', 'Midnight is «o północy»; here it’s «o dziewiątej».')),
        ],
        { hint: t('O dziewiątej — о дев’ятій.', 'O dziewiątej — в девять.', 'O dziewiątej = at nine.'),
          explain: t('Котра година — порядковий числівник: o dziewiątej — о дев’ятій. Coś słodkiego — щось солодке.', 'Время — порядковое числительное: o dziewiątej — в девять. Coś słodkiego — что-нибудь сладкое.', 'Clock times use ordinals: o dziewiątej. Coś słodkiego = something sweet.'), words: ['słodki', 'godzina'] }),
      build('fireworks', undefined, t('Скажи: «Опівночі будуть феєрверки».', 'Скажи: «В полночь будут фейерверки».', 'Say: “There will be fireworks at midnight.”'),
        'O północy będą fajerwerki.', ['północ', 'będzie'],
        { hint: t('O + місцевий: o północy. Fajerwerki — множина: będą.', 'O + местный: o północy. Fajerwerki — множественное: będą.', 'O + locative: o północy. Fajerwerki is plural: będą.'),
          explain: t('«O północy» — опівночі (місцевий відмінок). Fajerwerki — множина, тому będą (будуть).', '«O północy» — в полночь (местный падеж). Fajerwerki — множественное число, поэтому będą (будут).', '«O północy» = at midnight (locative). Fajerwerki is plural, so będą.'), words: ['północ', 'fajerwerki'] }),
      choice('midnight', npc('Dziesięć, dziewięć, osiem… trzy, dwa, jeden!', 'Десять, дев’ять, вісім… три, два, один!', 'Десять, девять, восемь… три, два, один!', 'Ten, nine, eight… three, two, one!'),
        t('Північ! Привітай усіх із Новим роком.', 'Полночь! Поздравь всех с Новым годом.', 'Midnight! Wish everyone a happy New Year.'),
        [
          P('Szczęśliwego Nowego Roku!', true),
          P('Do siego roku!', true),
          P('Wesołych Świąt!', false, t('«Wesołych Świąt!» — на Різдво. На Новий рік: «Szczęśliwego Nowego Roku!»', '«Wesołych Świąt!» — на Рождество. На Новый год: «Szczęśliwego Nowego Roku!»', '«Wesołych Świąt!» is for Christmas. For New Year: «Szczęśliwego Nowego Roku!»')),
        ],
        { hint: t('Nowy Rok — Новий рік.', 'Nowy Rok — Новый год.', 'Nowy Rok = New Year.'),
          explain: t('Бажають у родовому відмінку (як після «życzę»): Szczęśliwego Nowego Roku! Старовинне — «Do siego roku!».', 'Желают в родительном падеже (как после «życzę»): Szczęśliwego Nowego Roku! Старинное — «Do siego roku!».', 'Wishes use the genitive: Szczęśliwego Nowego Roku! The old form is «Do siego roku!».'), words: ['Nowy Rok', 'Szczęśliwego Nowego Roku', 'do siego roku'] }),
      choice('resolution', npc('Jakie masz postanowienie noworoczne?', 'Яка в тебе новорічна обіцянка?', 'Какое у тебя новогоднее обещание?', 'What’s your New Year’s resolution?'),
        t('Розкажи свою новорічну обіцянку.', 'Расскажи своё новогоднее обещание.', 'Tell him your resolution.'),
        [
          P('W nowym roku będę codziennie uczyć się polskiego!', true),
          P('W nowym roku będę codziennie uczę się polskiego!', false, t('Майбутній час: będę + інфінітив: będę uczyć się.', 'Будущее время: będę + инфинитив: będę uczyć się.', 'Future: będę + infinitive: będę uczyć się.')),
          P('W nowym roku byłem codziennie uczyć się polskiego!', false, t('«Byłem» — минулий час. Обіцянка — майбутнє: będę.', '«Byłem» — прошедшее время. Обещание — будущее: będę.', '«Byłem» is past tense; a resolution needs the future: będę.')),
        ],
        { hint: t('Będę + інфінітив — я буду…', 'Będę + инфинитив — я буду…', 'Będę + infinitive = I will…'),
          explain: t('«Będę codziennie uczyć się polskiego» — я щодня вчитиму польську. Uczyć się + родовий: polskiego.', '«Będę codziennie uczyć się polskiego» — я буду каждый день учить польский. Uczyć się + родительный: polskiego.', '«Będę codziennie uczyć się polskiego»: uczyć się + genitive.'), words: ['codziennie', 'Nowy Rok'] }),
    ],
    phrases: [
      ph('Co mam przynieść?', 'Що мені принести?', 'Что мне принести?', 'What should I bring?'),
      ph('O północy będą fajerwerki.', 'Опівночі будуть феєрверки.', 'В полночь будут фейерверки.', 'There will be fireworks at midnight.'),
      ph('Szczęśliwego Nowego Roku!', 'Щасливого Нового року!', 'С Новым годом!', 'Happy New Year!'),
      ph('Do siego roku!', 'Щасливого Нового року! (старовинне)', 'С Новым годом! (старинное)', 'Happy New Year! (old-fashioned)'),
      ph('W nowym roku będę codziennie uczyć się polskiego.', 'У новому році я щодня вчитиму польську.', 'В новом году я буду каждый день учить польский.', 'In the new year I’ll study Polish every day.'),
    ],
  },
];

// ═════════════════════ Поїздка до парку розваг ═════════════════════
const PARK: Mission[] = [
  {
    ...base, slug: 'park-bilety', season: 'energylandia', tags: ['season-energylandia', 'checkout'], city: 'krakow', scene: 'amusement-park',
    npc: { name: 'Pani Ewa', role: t('касирка', 'кассир', 'cashier') },
    title: t('Квитки до парку', 'Билеты в парк', 'Park tickets'),
    goal: t('Купи звичайний і пільговий квитки, дізнайся години роботи й оплати.', 'Купи обычный и льготный билеты, узнай часы работы и оплати.', 'Buy a regular and a reduced ticket, ask the opening hours and pay.'),
    intro: t('Літо. Бобек із другом-студентом приїхали до найбільшого парку розваг у Польщі. Перший крок — каса.', 'Лето. Бобек с другом-студентом приехали в крупнейший парк развлечений Польши. Первый шаг — касса.', 'Summer. Bobek and a student friend arrive at Poland’s biggest amusement park. First stop: the ticket office.'),
    note: PARK_NOTE,
    steps: [
      choice('tickets', npc('Dzień dobry! Ile biletów?', 'Добрий день! Скільки квитків?', 'Добрый день! Сколько билетов?', 'Hello! How many tickets?'),
        t('Попроси два квитки: один звичайний, один пільговий.', 'Попроси два билета: один обычный, один льготный.', 'Ask for two tickets: one regular, one reduced.'),
        [
          P('Poproszę dwa bilety: jeden normalny i jeden ulgowy.', true),
          P('Poproszę dwa biletów: jeden normalny i jeden ulgowy.', false, t('Після dwa/trzy/cztery — називний множини: dwa bilety. «Biletów» — після pięć і більше.', 'После dwa/trzy/cztery — именительный множественного: dwa bilety. «Biletów» — после pięć и больше.', 'After dwa/trzy/cztery: dwa bilety. «Biletów» comes after pięć and more.')),
          P('Poproszę dwa bilet: normalny i ulgowy.', false, t('Dwa + множина: bilety.', 'Dwa + множественное: bilety.', 'Dwa takes the plural: bilety.')),
        ],
        { hint: t('Dwa bilety; normalny — звичайний, ulgowy — пільговий.', 'Dwa bilety; normalny — обычный, ulgowy — льготный.', 'Dwa bilety; normalny = regular, ulgowy = reduced.'),
          explain: t('2–4 предмети — називний множини (dwa bilety), від 5 — родовий множини (pięć biletów).', '2–4 предмета — именительный множественного (dwa bilety), от 5 — родительный множественного (pięć biletów).', '2–4 items: dwa bilety; 5+: pięć biletów.'), words: ['bilet', 'normalny', 'ulgowy'] }),
      choice('student', npc('Bilet ulgowy jest dla dzieci i studentów. Poproszę legitymację.', 'Пільговий квиток — для дітей і студентів. Покажіть, будь ласка, студентський.', 'Льготный билет — для детей и студентов. Покажите, пожалуйста, студенческий.', 'Reduced tickets are for children and students. Your student card, please.'),
        t('Що просить касирка?', 'Что просит кассир?', 'What does the cashier ask for?'),
        [
          T(t('Студентський квиток (посвідчення)', 'Студенческий билет (удостоверение)', 'A student card'), true),
          T(t('Паспорт', 'Паспорт', 'A passport'), false, t('Legitymacja — посвідчення (студентське чи шкільне), а паспорт — paszport.', 'Legitymacja — удостоверение (студенческое или школьное), а паспорт — paszport.', 'Legitymacja is a student/school card; a passport is «paszport».')),
          T(t('Банківську картку', 'Банковскую карту', 'A bank card'), false, t('Картка — karta. Тут просять legitymację — посвідчення для пільги.', 'Карта — karta. Здесь просят legitymację — удостоверение для льготы.', 'A bank card is «karta»; she wants your «legitymacja».')),
        ],
        { hint: t('Legitymacja — студентський (шкільний) квиток.', 'Legitymacja — студенческий (школьный) билет.', 'Legitymacja = student/school ID.'),
          explain: t('Пільгу (ulga) підтверджують посвідченням — legitymacja studencka чи szkolna.', 'Льготу (ulga) подтверждают удостоверением — legitymacja studencka или szkolna.', 'A reduced fare is confirmed with a legitymacja.'), words: ['legitymacja', 'dziecko'] }),
      build('hours', undefined, t('Запитай: «До котрої відкритий парк?»', 'Спроси: «До скольки открыт парк?»', 'Ask: “Until what time is the park open?”'),
        'Do której jest otwarty park?', ['otwarte', 'godzina'],
        { hint: t('Do której? — до котрої? Park — чоловічий рід: otwarty.', 'Do której? — до скольки? Park — мужской род: otwarty.', 'Do której? — until when? Park is masculine: otwarty.'),
          explain: t('«Do której?» — до котрої (години). Park otwarty, kawiarnia otwarta, sklepy otwarte — узгодження за родом і числом.', '«Do której?» — до скольки (часов). Park otwarty, kawiarnia otwarta, sklepy otwarte — согласование по роду и числу.', '«Do której?» — until what time? Park otwarty / kawiarnia otwarta / sklepy otwarte.'), words: ['park', 'otwarty'] }),
      choice('until', npc('Dzisiaj do dwudziestej pierwszej.', 'Сьогодні до двадцять першої.', 'Сегодня до двадцати одного часа.', 'Today until 9 pm.'),
        t('До котрої відкритий парк? (навчальний час)', 'До скольки открыт парк? (учебное время)', 'Until when is it open? (practice time)'),
        [
          T(t('До 21:00'), true),
          T(t('До 12:00'), false, t('dwunasta — 12, dwudziesta pierwsza — 21.', 'dwunasta — 12, dwudziesta pierwsza — 21.', 'dwunasta = 12, dwudziesta pierwsza = 21.')),
          T(t('До 20:01'), false, t('Dwudziesta pierwsza — це одна година: 21:00.', 'Dwudziesta pierwsza — это один час: 21:00.', 'Dwudziesta pierwsza is one hour: 21:00.')),
        ],
        { hint: t('dwudziesta pierwsza — двадцять перша (21:00).', 'dwudziesta pierwsza — двадцать первый час (21:00).', 'dwudziesta pierwsza = 21:00.'),
          explain: t('Години — порядкові числівники: do dwudziestej pierwszej — до 21:00.', 'Часы — порядковые числительные: do dwudziestej pierwszej — до 21:00.', 'Clock times use ordinals: do dwudziestej pierwszej = until 21:00.'), words: ['godzina'] }),
      choice('pay', npc('Razem sto pięćdziesiąt złotych. Kartą czy gotówką?', 'Разом сто п’ятдесят злотих. Карткою чи готівкою?', 'Итого сто пятьдесят злотых. Картой или наличными?', '150 złoty in total. Card or cash?'),
        t('Заплати карткою.', 'Заплати картой.', 'Pay by card.'),
        [
          P('Kartą, poproszę.', true),
          P('Karta, poproszę.', false, t('Чим платимо? — орудний: kartą.', 'Чем платим? — творительный: kartą.', 'Paying with what? — instrumental: kartą.')),
          P('Gotówka, karta.', false, t('Обери одне й скажи в орудному: kartą або gotówką.', 'Выбери одно и скажи в творительном: kartą или gotówką.', 'Pick one, in the instrumental: kartą or gotówką.')),
        ],
        { hint: t('Kartą — карткою.', 'Kartą — картой.', 'Kartą = by card.'),
          explain: t('Płacić czym? — kartą, gotówką (орудний). Sto pięćdziesiąt — 150.', 'Płacić чем? — kartą, gotówką (творительный). Sto pięćdziesiąt — 150.', 'Płacić + instrumental: kartą, gotówką. Sto pięćdziesiąt = 150.'), words: ['karta', 'razem', 'sto'] }),
    ],
    phrases: [
      ph('Poproszę dwa bilety: jeden normalny i jeden ulgowy.', 'Два квитки, будь ласка: один звичайний і один пільговий.', 'Два билета, пожалуйста: один обычный и один льготный.', 'Two tickets, please: one regular and one reduced.'),
      ph('Do której jest otwarty park?', 'До котрої відкритий парк?', 'До скольки открыт парк?', 'Until what time is the park open?'),
      ph('Kartą, poproszę.', 'Карткою, будь ласка.', 'Картой, пожалуйста.', 'By card, please.'),
    ],
  },
  {
    ...base, slug: 'park-kolejka', season: 'energylandia', tags: ['season-energylandia'], city: 'krakow', scene: 'amusement-park',
    npc: { name: 'Pan Marek', role: t('працівник атракціону', 'работник аттракциона', 'ride attendant') },
    title: t('Черга на гірки', 'Очередь на горки', 'The rollercoaster queue'),
    goal: t('Знайди чергу, дізнайся час очікування й правила, залиш рюкзак і скажи, як тобі.', 'Найди очередь, узнай время ожидания и правила, оставь рюкзак и скажи, как тебе.', 'Find the queue, ask the wait and the rules, leave your backpack and say how it feels.'),
    intro: t('Бобек хоче на найбільші американські гірки. Але де тут черга?', 'Бобек хочет на самые большие американские горки. Но где тут очередь?', 'Bobek wants to ride the biggest rollercoaster. But where’s the queue?'),
    note: PARK_NOTE,
    steps: [
      build('queue', undefined, t('Запитай: «Де черга на американські гірки?»', 'Спроси: «Где очередь на американские горки?»', 'Ask: “Where’s the queue for the rollercoaster?”'),
        'Gdzie jest kolejka do rollercoastera?', ['kolejki', 'rollercoaster'],
        { hint: t('Kolejka do… + родовий: do rollercoastera.', 'Kolejka do… + родительный: do rollercoastera.', 'Kolejka do… + genitive: do rollercoastera.'),
          explain: t('Kolejka — черга (а ще електричка). Черга до чогось — kolejka do + родовий.', 'Kolejka — очередь (а ещё электричка). Очередь к чему-то — kolejka do + родительный.', 'Kolejka = queue (also a local train). Kolejka do + genitive.'), words: ['kolejka'] }),
      choice('wait', npc('Tutaj. Czeka się około czterdziestu minut.', 'Тут. Чекати близько сорока хвилин.', 'Здесь. Ждать около сорока минут.', 'Right here. The wait is about forty minutes.'),
        t('Скільки чекати?', 'Сколько ждать?', 'How long is the wait?'),
        [
          T(t('Близько 40 хвилин', 'Около 40 минут', 'About 40 minutes'), true),
          T(t('Близько 14 хвилин', 'Около 14 минут', 'About 14 minutes'), false, t('czternaście — 14, czterdzieści — 40.', 'czternaście — 14, czterdzieści — 40.', 'czternaście = 14, czterdzieści = 40.')),
          T(t('Близько 4 хвилин', 'Около 4 минут', 'About 4 minutes'), false, t('cztery — 4, czterdzieści — 40.', 'cztery — 4, czterdzieści — 40.', 'cztery = 4, czterdzieści = 40.')),
        ],
        { hint: t('czterdzieści — сорок.', 'czterdzieści — сорок.', 'czterdzieści = forty.'),
          explain: t('«Czeka się» — чекають (безособово). Około czterdziestu minut — близько сорока хвилин (після około — родовий).', '«Czeka się» — ждут (безлично). Około czterdziestu minut — около сорока минут (после około — родительный).', '«Czeka się» = one waits. Około + genitive: około czterdziestu minut.'), words: ['czekać', 'czterdzieści'] }),
      choice('height', npc('Minimalny wzrost to sto dwadzieścia centymetrów.', 'Мінімальний зріст — сто двадцять сантиметрів.', 'Минимальный рост — сто двадцать сантиметров.', 'The minimum height is 120 centimetres.'),
        t('Яке обмеження за зростом? (навчальне правило)', 'Какое ограничение по росту? (учебное правило)', 'What’s the height rule? (practice rule)'),
        [
          T(t('Щонайменше 120 см', 'Минимум 120 см', 'At least 120 cm'), true),
          T(t('Щонайбільше 120 см', 'Максимум 120 см', 'At most 120 cm'), false, t('Minimalny — мінімальний: нижчим за 120 см не можна.', 'Minimalny — минимальный: ниже 120 см нельзя.', 'Minimalny = minimum: under 120 cm can’t ride.')),
          T(t('Щонайменше 102 см', 'Минимум 102 см', 'At least 102 cm'), false, t('sto dwadzieścia — 120; sto dwa — 102.', 'sto dwadzieścia — 120; sto dwa — 102.', 'sto dwadzieścia = 120; sto dwa = 102.')),
        ],
        { hint: t('Wzrost — зріст; minimalny — мінімальний.', 'Wzrost — рост; minimalny — минимальный.', 'Wzrost = height; minimalny = minimum.'),
          explain: t('«Minimalny wzrost to…» — мінімальний зріст — … Sto dwadzieścia = 100 + 20 = 120.', '«Minimalny wzrost to…» — минимальный рост — … Sto dwadzieścia = 100 + 20 = 120.', '«Minimalny wzrost to…» = minimum height is… 120.'), words: ['wzrost', 'sto'] }),
      choice('locker', npc('Plecak trzeba zostawić w szafce przy wejściu.', 'Рюкзак треба залишити в шафці біля входу.', 'Рюкзак нужно оставить в шкафчике у входа.', 'You have to leave your backpack in a locker by the entrance.'),
        t('Запитай, скільки коштує шафка.', 'Спроси, сколько стоит шкафчик.', 'Ask how much the locker costs.'),
        [
          P('Ile kosztuje szafka?', true),
          P('Ile kosztuję szafka?', false, t('«Kosztuję» — «я кошту». Шафка коштує — kosztuje.', '«Kosztuję» — «я стою». Шкафчик стоит — kosztuje.', '«Kosztuję» is “I cost”. The locker: kosztuje.')),
          P('Gdzie kosztuje szafka?', false, t('Gdzie — де. Про ціну: «Ile kosztuje…?»', 'Gdzie — где. О цене: «Ile kosztuje…?»', 'Gdzie = where. Price: «Ile kosztuje…?»')),
        ],
        { hint: t('Ile kosztuje…? — скільки коштує…?', 'Ile kosztuje…? — сколько стоит…?', 'Ile kosztuje…? = how much is…?'),
          explain: t('«Trzeba zostawić» — треба залишити. Szafka — шафка, przy wejściu — біля входу.', '«Trzeba zostawić» — нужно оставить. Szafka — шкафчик, przy wejściu — у входа.', '«Trzeba zostawić» = you must leave. Szafka = locker; przy wejściu = by the entrance.'), words: ['szafka', 'plecak', 'ile kosztuje', 'wejście'] }),
      choice('ride', npc('Szafka jest w cenie biletu. Gotowy? Trzymaj się mocno!', 'Шафка входить у вартість квитка. Готовий? Тримайся міцно!', 'Шкафчик входит в стоимость билета. Готов? Держись крепче!', 'The locker is included in the ticket. Ready? Hold on tight!'),
        t('Ти на гірках! Скажи, що трохи страшно, але супер.', 'Ты на горках! Скажи, что немного страшно, но супер.', 'You’re on the ride! Say you’re a bit scared but it’s great.'),
        [
          P('Trochę się boję, ale jest super!', true),
          P('Trochę boję, ale jest super!', false, t('Bać się — зворотне дієслово: boję się.', 'Bać się — возвратный глагол: boję się.', 'Bać się is reflexive: boję się.')),
          P('Trochę się boisz, ale jest super!', false, t('«Boisz się» — ти боїшся. Про себе: boję się.', '«Boisz się» — ты боишься. О себе: boję się.', '«Boisz się» = you’re afraid. About yourself: boję się.')),
        ],
        { hint: t('Bać się → (ja) boję się.', 'Bać się → (ja) boję się.', 'Bać się → (ja) boję się.'),
          explain: t('«Boję się» — я боюся. «Się» стоїть поруч із дієсловом: trochę się boję або boję się trochę.', '«Boję się» — я боюсь. «Się» стоит рядом с глаголом: trochę się boję или boję się trochę.', '«Boję się» = I’m scared; «się» stays near the verb.'), words: ['bać się', 'trochę'] }),
    ],
    phrases: [
      ph('Gdzie jest kolejka do rollercoastera?', 'Де черга на американські гірки?', 'Где очередь на американские горки?', 'Where’s the queue for the rollercoaster?'),
      ph('Ile się czeka?', 'Скільки чекати?', 'Сколько ждать?', 'How long is the wait?'),
      ph('Ile kosztuje szafka?', 'Скільки коштує шафка?', 'Сколько стоит шкафчик?', 'How much is the locker?'),
      ph('Trochę się boję, ale jest super!', 'Мені трохи страшно, але це супер!', 'Мне немного страшно, но это супер!', 'I’m a bit scared, but it’s great!'),
    ],
  },
  {
    ...base, slug: 'park-zguba', season: 'energylandia', tags: ['season-energylandia'], city: 'krakow', scene: 'amusement-park',
    npc: { name: 'Pani Ola', role: t('працівниця інформації', 'сотрудница информации', 'information desk staff') },
    title: t('Загублений телефон', 'Потерянный телефон', 'The lost phone'),
    goal: t('Скажи, що загубив телефон, опиши його, забери й домовся про зустріч.', 'Скажи, что потерял телефон, опиши его, забери и договорись о встрече.', 'Report a lost phone, describe it, get it back and arrange a meeting.'),
    intro: t('Після гірок Бобек не може знайти телефон. Він іде до пункту інформації.', 'После горок Бобек не может найти телефон. Он идёт в пункт информации.', 'After the ride Bobek can’t find his phone. He goes to the information point.'),
    note: PARK_NOTE,
    steps: [
      choice('lost', npc('Dzień dobry, w czym mogę pomóc?', 'Добрий день, чим можу допомогти?', 'Добрый день, чем могу помочь?', 'Hello, how can I help?'),
        t('Скажи, що загубив телефон.', 'Скажи, что потерял телефон.', 'Say you lost your phone.'),
        [
          P('Przepraszam, zgubiłem telefon.', true),
          P('Przepraszam, zgubię telefon.', false, t('«Zgubię» — загублю (майбутній). Уже загубив — zgubiłem.', '«Zgubię» — потеряю (будущее). Уже потерял — zgubiłem.', '«Zgubię» = I will lose. Already lost: zgubiłem.')),
          P('Przepraszam, znalazłem telefon.', false, t('«Znalazłem» — я знайшов. Загубив — zgubiłem.', '«Znalazłem» — я нашёл. Потерял — zgubiłem.', '«Znalazłem» = I found. Lost = zgubiłem.')),
        ],
        { hint: t('Zgubić → (ja) zgubiłem — я загубив.', 'Zgubić → (ja) zgubiłem — я потерял.', 'Zgubić → zgubiłem = I lost.'),
          explain: t('Минулий час: zgubiłem (чоловік), zgubiłam (жінка).', 'Прошедшее время: zgubiłem (мужчина), zgubiłam (женщина).', 'Past tense: zgubiłem (male), zgubiłam (female).'), words: ['zgubić', 'telefon'] }),
      choice('describe', npc('Jak wygląda telefon?', 'Який вигляд має телефон?', 'Как выглядит телефон?', 'What does the phone look like?'),
        t('Опиши: чорний, у синьому чохлі.', 'Опиши: чёрный, в синем чехле.', 'Describe it: black, in a blue case.'),
        [
          P('Jest czarny, w niebieskim etui.', true),
          P('Jest czarna, w niebieskim etui.', false, t('Telefon — чоловічий рід: czarny.', 'Telefon — мужской род: czarny.', 'Telefon is masculine: czarny.')),
          P('Jest czarny, w niebieski etui.', false, t('W + місцевий відмінок: w niebieskim etui.', 'W + местный падеж: w niebieskim etui.', 'W + locative: w niebieskim etui.')),
        ],
        { hint: t('Telefon — він: czarny. W + місцевий: w niebieskim etui.', 'Telefon — он: czarny. W + местный: w niebieskim etui.', 'Telefon is masculine: czarny. W + locative.'),
          explain: t('Etui — чохол (не змінюється), а прикметник змінюється: w niebieskim etui.', 'Etui — чехол (не изменяется), а прилагательное изменяется: w niebieskim etui.', 'Etui (case) doesn’t change, the adjective does: w niebieskim etui.'), words: ['czarny', 'niebieski'] }),
      build('where', undefined, t('Скажи: «Я був біля входу годину тому».', 'Скажи: «Я был у входа час назад».', 'Say: “I was by the entrance an hour ago.”'),
        'Byłem przy wejściu godzinę temu.', ['wejście', 'godzina'],
        { hint: t('Przy + місцевий: przy wejściu. Godzinę temu — годину тому.', 'Przy + местный: przy wejściu. Godzinę temu — час назад.', 'Przy + locative: przy wejściu. Godzinę temu = an hour ago.'),
          explain: t('«Przy wejściu» — біля входу (місцевий). «Godzinę temu» — годину тому (знахідний + temu).', '«Przy wejściu» — у входа (местный). «Godzinę temu» — час назад (винительный + temu).', '«Przy wejściu» (locative). «Godzinę temu» (accusative + temu).'), words: ['wejście', 'godzina'] }),
      choice('id', npc('Mamy czarny telefon w niebieskim etui! Proszę pokazać dokument.', 'У нас є чорний телефон у синьому чохлі! Покажіть, будь ласка, документ.', 'У нас есть чёрный телефон в синем чехле! Покажите, пожалуйста, документ.', 'We have a black phone in a blue case! Please show your ID.'),
        t('Що треба показати?', 'Что нужно показать?', 'What do you need to show?'),
        [
          T(t('Документ (посвідчення особи)', 'Документ (удостоверение личности)', 'An ID document'), true),
          T(t('Квиток до парку', 'Билет в парк', 'The park ticket'), false, t('Bilet — квиток. Просять dokument — документ.', 'Bilet — билет. Просят dokument — документ.', 'Bilet is a ticket; she asks for a «dokument».')),
          T(t('Пароль від телефону', 'Пароль от телефона', 'The phone’s passcode'), false, t('Пароль від телефону нікому не кажи. Просять dokument — документ.', 'Пароль от телефона никому не сообщай. Просят dokument — документ.', 'Never share your passcode. She asks for a «dokument».')),
        ],
        { hint: t('Dokument — документ; pokazać — показати.', 'Dokument — документ; pokazać — показать.', 'Dokument = ID; pokazać = to show.'),
          explain: t('«Proszę pokazać dokument» — покажіть документ. Пароль чи PIN не просить ніхто з персоналу.', '«Proszę pokazać dokument» — покажите документ. Пароль или PIN персонал не просит.', '«Proszę pokazać dokument» — show your ID. Staff never ask for a passcode or PIN.'), words: ['dokument'] }),
      choice('thanks', npc('Proszę bardzo, to pana telefon.', 'Прошу, це ваш телефон.', 'Пожалуйста, это ваш телефон.', 'Here you are, this is your phone.'),
        t('Подякуй за допомогу.', 'Поблагодари за помощь.', 'Thank her for the help.'),
        [
          P('Bardzo dziękuję za pomoc!', true),
          P('Bardzo dziękuję za pomocy!', false, t('Za + знахідний: za pomoc.', 'Za + винительный: za pomoc.', 'Za + accusative: za pomoc.')),
          P('Proszę bardzo za pomoc!', false, t('«Proszę bardzo» — будь ласка (відповідь). Дякують: «Dziękuję za pomoc».', '«Proszę bardzo» — пожалуйста (ответ). Благодарят: «Dziękuję za pomoc».', '«Proszę bardzo» is “you’re welcome”. Thank with «Dziękuję za pomoc».')),
        ],
        { hint: t('Dziękuję za + знахідний.', 'Dziękuję za + винительный.', 'Dziękuję za + accusative.'),
          explain: t('«Dziękuję za pomoc» — дякую за допомогу. Pomoc у знахідному — така сама форма.', '«Dziękuję za pomoc» — спасибо за помощь. Pomoc в винительном — та же форма.', '«Dziękuję za pomoc»: pomoc looks the same in the accusative.'), words: ['pomoc', 'dziękuję'] }),
      build('meet', undefined, t('Напиши другові: «Зустріньмося біля входу о шостій».', 'Напиши другу: «Встретимся у входа в шесть».', 'Text your friend: “Let’s meet by the entrance at six.”'),
        'Spotkajmy się przy wejściu o szóstej.', ['spotkać', 'sześć'],
        { hint: t('Spotkajmy się — зустріньмося. O szóstej — о шостій.', 'Spotkajmy się — встретимся. O szóstej — в шесть.', 'Spotkajmy się = let’s meet. O szóstej = at six.'),
          explain: t('«Spotkajmy się» — наказовий спосіб для «ми»: давай(те) зустрінемося. «O szóstej» — о шостій (порядковий числівник).', '«Spotkajmy się» — повелительное для «мы»: давай(те) встретимся. «O szóstej» — в шесть (порядковое числительное).', '«Spotkajmy się» = let’s meet. «O szóstej» = at six (ordinal).'), words: ['spotkać się', 'wejście'] }),
    ],
    phrases: [
      ph('Przepraszam, zgubiłem telefon.', 'Перепрошую, я загубив телефон.', 'Извините, я потерял телефон.', 'Excuse me, I’ve lost my phone.'),
      ph('Jest czarny, w niebieskim etui.', 'Він чорний, у синьому чохлі.', 'Он чёрный, в синем чехле.', 'It’s black, in a blue case.'),
      ph('Bardzo dziękuję za pomoc!', 'Щиро дякую за допомогу!', 'Большое спасибо за помощь!', 'Thank you so much for your help!'),
      ph('Spotkajmy się przy wejściu o szóstej.', 'Зустріньмося біля входу о шостій.', 'Встретимся у входа в шесть.', 'Let’s meet by the entrance at six.'),
    ],
  },
];

export const SEASON_MISSIONS: Mission[] = [...MARCIN, ...SWIETA, ...PARK];

export const SEASONS: Season[] = [
  {
    slug: 'listopad-poznan', start: '2026-11-01', end: '2026-11-30', city: 'poznan', scene: 'pastry-shop', color: '#C8502E',
    title: t('Листопад у Познані', 'Ноябрь в Познани', 'November in Poznań'),
    tagline: t('Рогалі святого Мартина, 11 листопада й анджейки.', 'Рогалики святого Мартина, 11 ноября и анджейки.', 'St Martin’s croissants, 11 November and andrzejki.'),
    missions: MARCIN.map((m) => m.slug), achievement: 'sezon-listopad',
  },
  {
    slug: 'swieta', start: '2026-12-01', end: '2026-12-31', city: 'krakow', scene: 'christmas-market', color: '#1F8A5B',
    title: t('Польське Різдво', 'Польское Рождество', 'Christmas in Poland'),
    tagline: t('Ярмарок у Кракові, Вігілія та Сильвестр.', 'Ярмарка в Кракове, Вигилия и Сильвестр.', 'Kraków’s Christmas market, Wigilia and New Year’s Eve.'),
    missions: SWIETA.map((m) => m.slug), achievement: 'sezon-swieta',
  },
  {
    slug: 'energylandia', start: '2027-07-01', end: '2027-07-31', city: 'krakow', scene: 'amusement-park', color: '#6B45D8',
    title: t('Поїздка до Energylandii', 'Поездка в Energylandię', 'A trip to Energylandia'),
    tagline: t('Квитки, черги на гірки й загублений телефон у найбільшому парку розваг Польщі.', 'Билеты, очереди на горки и потерянный телефон в крупнейшем парке развлечений Польши.', 'Tickets, rollercoaster queues and a lost phone at Poland’s biggest amusement park.'),
    missions: PARK.map((m) => m.slug), achievement: 'sezon-park',
  },
];

export const seasonBySlug = (slug: string) => SEASONS.find((s) => s.slug === slug);

export type SeasonState = 'active' | 'upcoming' | 'archive';
/** Стан сезону в день учня (YYYY-MM-DD). */
export const seasonState = (s: Season, day: string): SeasonState => (day < s.start ? 'upcoming' : day > s.end ? 'archive' : 'active');
/** Перша місія сезону — відкрита всім, поки сезон триває. */
export const isFreeSeasonMission = (s: Season, slug: string) => s.missions[0] === slug;
