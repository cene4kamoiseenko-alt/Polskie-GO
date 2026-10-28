/**
 * Стандарт міста (рішення власника 2026-10-28): у кожному місті 8 уроків та іспит, у кожному уроці й в іспиті — 12 завдань.
 * Міста, написані до стандарту (Варшава — 25 уроків, Краків — 40, Лодзь і Вроцлав — по 16 …), скорочено тут, а не в їхніх файлах:
 *  • урок поза стандартом архівується (status ARCHIVED у БД): зникає з карти, прогрес і XP учнів лишаються;
 *  • у довгому уроці лишаються 12 завдань зі старими ідентифікаторами, решта переноситься до архівного уроку (рядки не видаляються);
 *  • короткий урок отримує нові завдання в кінці.
 * SQL для наявної БД будує seed.ts (standardSql). Нові міста (Poznań і далі) пишуться одразу за стандартом.
 */
import { t, build, fillGap, findError, listen, oddOne, reading, speak, translate, wordOrder, type ExerciseSeed } from './builders';
// Порядок імпорту міст — як у seed.ts до стандарту: match() нумерує пари глобальним лічильником, тож порядок обчислення модулів
// визначає ідентифікатори пар у вже записаних завданнях. Нові завдання нижче match() не використовують.
import { WARSZAWA } from './warszawa';
import { KRAKOW } from './krakow';
import { WROCLAW } from './wroclaw';
import { LODZ } from './lodz';
import { KATOWICE } from './katowice';
import { OPOLE } from './opole';
import type { CityContent, LessonSeed } from './types';

export const CITY_LESSONS = 8;
export const LESSON_TASKS = 12;

export type CityPlan = {
  /** Теми міста в новому порядку, іспит — останнім. Решта тем архівується. */
  routes: string[];
  /** Уроки, що лишаються: номери завдань за старим порядком (за зростанням) або `true` — усі завдання. */
  keep: Record<string, number[] | true>;
  /** Нові завдання в кінці уроку. */
  add?: Record<string, ExerciseSeed[]>;
};

// ── Нові завдання для коротких уроків ──

const KRK_ADD: Record<string, ExerciseSeed[]> = {
  'krk-1-rodzina': [
    translate('writing.family', t('Це мій син і моя донька.', 'Это мой сын и моя дочь.', 'This is my son and my daughter.'), ['To jest mój syn i moja córka', 'To mój syn i moja córka']),
  ],
  'krk-2-mam': [
    listen('listening.family', 'Mam męża i dwoje dzieci', ['Mam męża i dwoje dzieci', 'Mam brata i dwoje dzieci', 'Ma męża i dwoje dzieci']),
    build('grammar.accusative', 'Mam brata i siostrę', t('У мене є брат і сестра', 'У меня есть брат и сестра', 'I have a brother and a sister'), ['siostra', 'bratem']),
  ],
  'krk-3-dom': [
    translate(
      'writing.home',
      t('Це маленька квартира.', 'Это маленькая квартира.', 'This is a small flat.'),
      ['To jest małe mieszkanie', 'To małe mieszkanie'],
      t('**mieszkanie** — середній рід, тому **małe**.', '**mieszkanie** — средний род, поэтому **małe**.', '**mieszkanie** is neuter, so **małe**.'),
    ),
  ],
  'krk-4-tydzien': [
    build('grammar.days', 'W piątek pracuję, a w sobotę odpoczywam', t('У пʼятницю я працюю, а в суботу відпочиваю', 'В пятницу я работаю, а в субботу отдыхаю', 'On Friday I work and on Saturday I rest'), ['we', 'sobota']),
    speak('speaking.days', 'Dzisiaj jest środa, a jutro czwartek', t('Сьогодні середа, а завтра четвер', 'Сегодня среда, а завтра четверг', 'Today is Wednesday and tomorrow is Thursday')),
  ],
  'krk-5-byc': [
    listen('listening.być', 'Jesteście w domu?', ['Jesteście w domu?', 'Jesteśmy w domu.', 'Jesteś w domu?']),
    wordOrder('grammar.być', 'Mój brat jest w pracy', t('Мій брат на роботі', 'Мой брат на работе', 'My brother is at work')),
  ],
  'krk-boss': [
    fillGap(
      'grammar.prepositions',
      'Babcia mieszka obok ___.',
      ['kościoła', 'kościół', 'kościołem'],
      t('Бабуся живе поруч із костелом.', 'Бабушка живёт рядом с костёлом.', 'Grandma lives next to the church.'),
      t('**obok** + родовий відмінок: obok kościoła.', '**obok** + родительный падеж: obok kościoła.', '**obok** takes the genitive: obok kościoła.'),
    ),
  ],
};

const KAT_ADD: Record<string, ExerciseSeed[]> = {
  'kat-2-isc-jechac': [
    listen(
      'listening.motion',
      'Teraz jadę tramwajem do pracy',
      ['Teraz jadę tramwajem do pracy', 'Teraz idę tramwajem do pracy', 'Teraz jeżdżę tramwajem do pracy'],
      t(
        'Зараз і транспортом — **jadę**. **Idę** — пішки, **jeżdżę** — регулярно.',
        'Сейчас и на транспорте — **jadę**. **Idę** — пешком, **jeżdżę** — регулярно.',
        'Right now by vehicle — **jadę**. **Idę** is on foot, **jeżdżę** is regularly.',
      ),
    ),
  ],
  'kat-boss': [
    reading(
      'reading.boss',
      'Ogłoszenie: Wynajmę kawalerkę blisko Spodka. Mieszkanie jest umeblowane. Czynsz: 1700 zł, media osobno. Kaucja: 1700 zł.',
      t('Скільки коштує застава?', 'Сколько стоит залог?', 'How much is the deposit?'),
      ['1700 zł', '170 zł', '700 zł'],
      t('**Kaucja** — застава: 1700 zł.', '**Kaucja** — залог: 1700 zł.', '**Kaucja** is the deposit: 1700 zł.'),
    ),
  ],
};

const OPO_ADD: Record<string, ExerciseSeed[]> = {
  'opo-1-siema': [
    fillGap(
      'register.slang',
      '— Spotkamy się jutro o piątej? — ___, pasuje mi!',
      ['Spoko', 'Nara', 'Siema'],
      t('— Зустрінемося завтра о пʼятій? — Окей, мені підходить!', '— Встретимся завтра в пять? — Окей, мне подходит!', '— Shall we meet tomorrow at five? — Cool, that works for me!'),
      t('**Spoko** — «окей, без проблем». **Nara** — «бувай», **Siema** — «привіт».', '**Spoko** — «окей, без проблем». **Nara** — «пока», **Siema** — «привет».', '**Spoko** = "cool, no problem". **Nara** = "bye", **Siema** = "hi".'),
    ),
  ],
  'opo-2-reakcje': [
    oddOne(
      'register.slang',
      ['Masakra!', 'Ale przypał!', 'Zarąbiście!', 'Ale wstyd!'],
      2,
      t('**Zarąbiście!** — захоплення («супер!»). Решта — про невдачу або сором.', '**Zarąbiście!** — восторг («супер!»). Остальные — про неудачу или стыд.', '**Zarąbiście!** is delight ("awesome!"). The others are about a failure or embarrassment.'),
      t('Яка реакція позитивна?', 'Какая реакция положительная?', 'Which reaction is positive?'),
    ),
  ],
  'opo-3-ogarniac': [
    listen('listening.slang', 'Wyluzuj, nie spinaj się!', ['Wyluzuj, nie spinaj się!', 'Wyluzuj, nie spiesz się!', 'Wyloguj się, nie spinaj się!']),
  ],
  'opo-boss': [
    fillGap(
      'grammar.boss',
      'Jutro ___ do ciebie na chwilę, dobra?',
      ['wpadnę', 'wpadłem', 'wpadać'],
      t('Завтра заскочу до тебе на хвилинку, добре?', 'Завтра заскочу к тебе на минутку, ладно?', 'I\'ll drop by tomorrow for a moment, OK?'),
      t('**Jutro** — майбутнє: **wpadnę** (доконаний вид).', '**Jutro** — будущее: **wpadnę** (совершенный вид).', '**Jutro** needs the future: **wpadnę** (perfective).'),
    ),
  ],
};

const WRO_ADD: Record<string, ExerciseSeed[]> = {
  'wro-1-kawa': [
    findError(
      'grammar.accusative',
      ['Poproszę', 'kawa', 'z', 'mlekiem'],
      1,
      t('Каву з молоком, будь ласка.', 'Кофе с молоком, пожалуйста.', 'A coffee with milk, please.'),
      t('Після **poproszę** — знахідний відмінок: **kawę**.', 'После **poproszę** — винительный падеж: **kawę**.', 'After **poproszę** use the accusative: **kawę**.'),
    ),
  ],
  'wro-2-zabka': [
    findError(
      'grammar.instrumental',
      ['Zawsze', 'płacę', 'karta'],
      2,
      t('Я завжди плачу карткою.', 'Я всегда плачу картой.', 'I always pay by card.'),
      t('Чим платимо — орудний відмінок: **kartą**, **gotówką**.', 'Чем платим — творительный падеж: **kartą**, **gotówką**.', 'How you pay takes the instrumental: **kartą**, **gotówką**.'),
    ),
  ],
  'wro-3-ceny': [
    build('grammar.sentence', 'Chleb jest tani, a ser jest drogi', t('Хліб дешевий, а сир дорогий', 'Хлеб дешёвый, а сыр дорогой', 'Bread is cheap and cheese is expensive'), ['tania', 'droga']),
    speak('speaking.numbers', 'To kosztuje pięćdziesiąt złotych', t('Це коштує пʼятдесят злотих', 'Это стоит пятьдесят злотых', 'It costs fifty złoty')),
  ],
  'wro-4-restauracja': [
    reading(
      'reading.menu',
      'Kelner: „Dzisiaj mamy zupę pomidorową za czternaście złotych i pierogi za dwadzieścia dwa złote.”',
      t('Скільки коштують вареники?', 'Сколько стоят вареники?', 'How much are the pierogi?'),
      ['22 zł', '14 zł', '12 zł'],
    ),
    speak('speaking.restaurant', 'Poproszę pierogi i rachunek', t('Вареники і рахунок, будь ласка', 'Вареники и счёт, пожалуйста', 'Pierogi and the bill, please')),
  ],
  'wro-boss': [
    fillGap(
      'grammar.boss',
      'Ten sweter jest tańszy ___ tamten.',
      ['niż', 'czy', 'ale'],
      t('Цей светр дешевший, ніж той.', 'Этот свитер дешевле, чем тот.', 'This jumper is cheaper than that one.'),
      t('Порівняння: **tańszy niż…**', 'Сравнение: **tańszy niż…**', 'Comparison: **tańszy niż…**'),
    ),
  ],
};

// ── Плани міст ──

export const CITY_PLANS: [CityContent, CityPlan][] = [
  [
    WARSZAWA,
    {
      // Знайомство → числа → вокзал і квитки. Старе місто, кафе, сусіди й місії — в архіві.
      routes: ['waw-powitania', 'waw-liczby', 'waw-przedstawianie', 'waw-egzamin'],
      keep: {
        'waw-1-czesc': [0, 1, 2, 4, 5, 7, 8, 9, 10, 12, 15, 16],
        'waw-2-uprzejmosc': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 14],
        'waw-3-imie': [0, 1, 2, 3, 4, 6, 7, 8, 9, 12, 13, 15],
        'waw-4-skad': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 14, 15],
        'waw-5-liczby': [0, 1, 2, 3, 4, 5, 6, 8, 9, 12, 15, 16],
        'waw-6-wiek': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 13, 15],
        'waw-c1-centralna': [0, 2, 3, 4, 5, 6, 8, 11, 12, 13, 15, 17],
        'waw-c2-bilety': [0, 2, 3, 4, 5, 6, 8, 10, 12, 13, 15, 17],
        'waw-boss': [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 14],
      },
    },
  ],
  [
    LODZ,
    {
      // Звуки, люди, робота й безпека, час і ранок. Пошук роботи, графік, здоровʼя й повторення — в архіві.
      routes: ['lodz-dzwieki', 'lodz-ludzie', 'lodz-praca', 'lodz-dzien', 'lodz-egzamin'],
      keep: {
        'lodz-1-alfabet': true,
        'lodz-2-dwuznaki': true,
        'lodz-3-zawody': true,
        'lodz-4-oni-one': true,
        'lodz-5-gdzie-pracujesz': [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 15],
        'lodz-8-pierwszy-dzien': [0, 1, 2, 3, 5, 6, 7, 9, 10, 12, 13, 15],
        'lodz-9-ktora-godzina': [0, 1, 2, 3, 4, 5, 6, 7, 9, 10, 12, 14],
        'lodz-10-poranek': [0, 1, 2, 3, 4, 5, 6, 7, 8, 11, 12, 14],
        'lodz-boss': [0, 1, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13],
      },
    },
  ],
  [
    KRAKOW,
    {
      // Сімʼя, дім, тиждень і być, потім прогулянка Ринком. Вокзал, Żabka, ресторан, трамвай, готель, університет — в архіві.
      routes: ['krk-rodzina', 'krk-dom', 'krk-dzien', 'krk-rynek', 'krk-egzamin'],
      keep: {
        'krk-1-rodzina': true,
        'krk-2-mam': true,
        'krk-3-dom': true,
        'krk-4-tydzien': true,
        'krk-5-byc': true,
        'krk-r1-miasto': [0, 2, 3, 6, 7, 8, 9, 12, 13, 15, 16, 17],
        'krk-r2-orientacja': [0, 2, 4, 5, 7, 8, 10, 12, 13, 15, 16, 17],
        'krk-r4-droga': [0, 1, 3, 4, 5, 7, 8, 10, 11, 13, 14, 17],
        'krk-boss': [0, 1, 2, 4, 5, 6, 7, 8, 9, 10, 11],
      },
      add: KRK_ADD,
    },
  ],
  [
    KATOWICE,
    {
      // Транспорт, дієслова руху, пари слів, поїздки й таксі, квартира. Самокат, пошта й дзвінки — в архіві.
      routes: ['kat-ruch', 'kat-pary', 'kat-podroze', 'kat-mieszkanie', 'kat-egzamin'],
      keep: {
        'kat-1-transport': true,
        'kat-2-isc-jechac': true,
        'kat-3-wiedziec-znac': true,
        'kat-4-te-ta': true,
        'kat-5-przyjechac': true,
        'kat-7-taksowka': true,
        'kat-9-wynajem': [0, 1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        'kat-10-awaria': [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12],
        'kat-boss': true,
      },
      add: KAT_ADD,
    },
  ],
  [
    OPOLE,
    {
      // Живий польський, вихідні й запрошення, концерт і конкурс. «Моя думка» і «Пісня» — в архіві.
      routes: ['opo-zywy', 'opo-rozmowy', 'opo-festiwal', 'opo-egzamin'],
      keep: {
        'opo-1-siema': true,
        'opo-2-reakcje': true,
        'opo-3-ogarniac': true,
        'opo-4-nic-nikt': true,
        'opo-5-weekend': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12],
        'opo-6-zaproszenie': [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13],
        'opo-8-koncert': [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 13],
        'opo-10-nagroda': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 13],
        'opo-boss': true,
      },
      add: OPO_ADD,
    },
  ],
  [
    WROCLAW,
    {
      // Кафе, магазин, ціни, ресторан, одяг і примірка, подарунки й порівняння. Ринок, вечір і повторення — в архіві.
      routes: ['wro-kawiarnia', 'wro-sklep', 'wro-restauracja', 'wro-ubrania', 'wro-prezenty', 'wro-egzamin'],
      keep: {
        'wro-1-kawa': true,
        'wro-2-zabka': true,
        'wro-3-ceny': true,
        'wro-4-restauracja': true,
        'wro-5-ubrania': [0, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13],
        'wro-6-przymierzalnia': [0, 1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12],
        'wro-14-prezent': true,
        'wro-15-porownanie': true,
        'wro-boss': true,
      },
      add: WRO_ADD,
    },
  ],
];

/** Номери завдань уроку, що лишаються (за старим порядком). */
export function keptIndexes(lesson: LessonSeed, plan: CityPlan): number[] {
  const k = plan.keep[lesson.slug];
  if (k === undefined) return [];
  return k === true ? lesson.exercises.map((_, i) => i) : k;
}

/** Місто за стандартом: лише теми й уроки з плану, у кожному уроці — вибрані й нові завдання зі сталими ідентифікаторами. */
export function applyPlan(full: CityContent, plan: CityPlan): CityContent {
  const routes = plan.routes.map((slug) => {
    const route = full.routes.find((r) => r.slug === slug);
    if (!route) throw new Error(`${full.city}: тема ${slug} відсутня`);
    const lessons = route.lessons
      .filter((l) => plan.keep[l.slug] !== undefined)
      .map((l): LessonSeed => {
        const kept = keptIndexes(l, plan);
        kept.forEach((n, i) => {
          if (!Number.isInteger(n) || n < 0 || n >= l.exercises.length || (i > 0 && n <= kept[i - 1])) throw new Error(`${l.slug}: номер завдання ${n}`);
        });
        const added = plan.add?.[l.slug] ?? [];
        return {
          ...l,
          exercises: [...kept.map((n) => l.exercises[n]), ...added],
          exerciseIds: [...kept, ...added.map((_, i) => l.exercises.length + i)],
        };
      });
    return { ...route, lessons };
  });
  const known = new Set(full.routes.flatMap((r) => r.lessons.map((l) => l.slug)));
  for (const slug of [...Object.keys(plan.keep), ...Object.keys(plan.add ?? {})]) {
    if (!known.has(slug)) throw new Error(`${full.city}: урок ${slug} відсутній`);
    if (!routes.some((r) => r.lessons.some((l) => l.slug === slug))) throw new Error(`${full.city}: урок ${slug} поза темами плану`);
  }
  return { city: full.city, routes };
}

export const STANDARD_CITIES: CityContent[] = CITY_PLANS.map(([full, plan]) => applyPlan(full, plan));
