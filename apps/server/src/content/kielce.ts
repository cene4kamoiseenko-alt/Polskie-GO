/**
 * Kielce — B2: «Закріплення знань» на матеріалі Свентокшиського краю. Уроки 1–4: відмінки з прийменниками на одному маршруті (Kadzielnia: do + родовий,
 * w / na + місцевий, przez + знахідний, nad + орудний, ze szczytu; wzdłuż, mimo, dzięki, wbrew), вид дієслова (печера Raj: przez godzinę, nie wchodzić, nagle odkryć,
 * zacząć zwiedzać), розповідь про минуле (палац єпископів і музей іграшок: od + родовий + теперішній час, w siedemnastym wieku, dawniej, родовий після заперечення)
 * й умовний спосіб (Dymarki, Dąb Bartek, Święty Krzyż: gdybym miał → pojechałbym, żeby + інфінітив, gdyby nie + називний, pojechalibyśmy / pojechałybyśmy).
 * Правила якості — docs/EXERCISE_QUALITY.md: у шагах діалогу по три варіанти, неправильні варіанти — різної природи (відмінок, вид, час, значення).
 * Словник — vocab-kielce.ts. Тест — new-cities.test.ts. Уроки 5–8 й іспит — kielce-5-8.ts.
 */
import { t, wordChoice, fillGap, listen, findError, oddOne, reading, translate, grammar, build, match, speak, dialogue } from './builders';
import type { CityContent, LessonSeed } from './types';
import { KIE_5_8, KIE_BOSS } from './kielce-5-8';

const PRZEWODNIK = { name: 'Pan Zbigniew', emoji: '👨🏼', role: t('провідник по Кельцях', 'гид по Кельце', 'a guide in Kielce') };
const PRZEWODNICZKA = { name: 'Pani Dorota', emoji: '👩🏻', role: t('провідниця по печері', 'проводница по пещере', 'a cave guide') };
const KASJERKA = { name: 'Pani Agnieszka', emoji: '👩🏽', role: t('касирка музею', 'кассир музея', 'a museum ticket clerk') };
const DORADCZYNI = { name: 'Pani Ewa', emoji: '🧳', role: t('консультантка туристичного центру', 'консультант туристического центра', 'a tourist-office adviser') };

const KIE_1: LessonSeed = {
  slug: 'kie-1-przypadki',
  title: t('Відмінки на одному маршруті', 'Падежи на одном маршруте', 'Cases on one route'),
  topic: t(
    'do / z / od + родовий, w / na + місцевий, przez + знахідний, nad / pod + орудний; ze szczytu; wzdłuż, mimo + родовий, dzięki, wbrew + давальний',
    'do / z / od + родительный, w / na + предложный, przez + винительный, nad / pod + творительный; ze szczytu; wzdłuż, mimo + родительный, dzięki, wbrew + дательный',
    'do / z / od + genitive, w / na + locative, przez + accusative, nad / pod + instrumental; ze szczytu; wzdłuż, mimo + genitive, dzięki, wbrew + dative',
  ),
  cefr: 'B2',
  difficulty: 4,
  explanation: t(
    '**Мета:** на одному маршруті повторити відмінки з прийменниками й не плутати «куди?», «де?» та «звідки?».\n**Куди?** — **do** + родовий: **do kamieniołomu**; **na** + знахідний: **na szczyt**; **przez** + знахідний: **przez wąwóz**. **Де?** — **w / na** + місцевий: **w amfiteatrze**, **na szczycie**; **nad / pod** + орудний: **nad skałami**. **Звідки?** — **z / od** + родовий: **ze szczytu** (перед групою приголосних — **ze**, а не **z**).\nПрийменники B2: **wzdłuż** + родовий (**wzdłuż szlaku**), **mimo** + родовий (**mimo deszczu**), **dzięki** + давальний (**dzięki przewodnikowi**), **wbrew** + давальний (**wbrew zakazowi**).',
    '**Цель:** на одном маршруте повторить падежи с предлогами и не путать «куда?», «где?» и «откуда?».\n**Куда?** — **do** + родительный: **do kamieniołomu**; **na** + винительный: **na szczyt**; **przez** + винительный: **przez wąwóz**. **Где?** — **w / na** + предложный: **w amfiteatrze**, **na szczycie**; **nad / pod** + творительный: **nad skałami**. **Откуда?** — **z / od** + родительный: **ze szczytu** (перед группой согласных — **ze**, а не **z**).\nПредлоги B2: **wzdłuż** + родительный (**wzdłuż szlaku**), **mimo** + родительный (**mimo deszczu**), **dzięki** + дательный (**dzięki przewodnikowi**), **wbrew** + дательный (**wbrew zakazowi**).',
    '**Goal:** revise the cases after prepositions on one route and keep “where to?”, “where?” and “from where?” apart.\n**Where to?** — **do** + genitive: **do kamieniołomu**; **na** + accusative: **na szczyt**; **przez** + accusative: **przez wąwóz**. **Where?** — **w / na** + locative: **w amfiteatrze**, **na szczycie**; **nad / pod** + instrumental: **nad skałami**. **From where?** — **z / od** + genitive: **ze szczytu** (before a consonant cluster use **ze**, not **z**).\nB2 prepositions: **wzdłuż** + genitive (**wzdłuż szlaku**), **mimo** + genitive (**mimo deszczu**), **dzięki** + dative (**dzięki przewodnikowi**), **wbrew** + dative (**wbrew zakazowi**).',
  ),
  examples: [
    { pl: 'Szlak prowadzi z centrum Kielc do kamieniołomu na Kadzielni.', tr: t('Стежка веде з центру Кельців до кар’єру на Кадзельні.', 'Тропа ведёт из центра Кельце к карьеру на Кадзельне.', 'The trail leads from the centre of Kielce to the quarry on Kadzielnia.') },
    { pl: 'Ze szczytu widać cały rezerwat, a pod nami — amfiteatr.', tr: t('З вершини видно весь заповідник, а під нами — амфітеатр.', 'С вершины виден весь заповедник, а под нами — амфитеатр.', 'From the summit you can see the whole reserve, and below us the amphitheatre.') },
  ],
  words: ['kamieniołom', 'amfiteatr', 'skała', 'rezerwat', 'wąwóz', 'szczyt'],
  exercises: [
    dialogue('dialogue.kadzielnia', PRZEWODNIK, [
      {
        npc: 'Spotykamy się o dziesiątej przy dolnej bramie. Dokąd najpierw pójdziemy?',
        tr: t('Зустрічаємося о десятій біля нижньої брами. Куди ми підемо спершу?', 'Встречаемся в десять у нижних ворот. Куда мы пойдём сначала?', 'We meet at ten by the lower gate. Where shall we go first?'),
        choose: [
          ['Najpierw pójdziemy do kamieniołomu, a potem do amfiteatru.', t('Спершу підемо до кар’єру, а потім до амфітеатру.', 'Сначала пойдём к карьеру, а потом к амфитеатру.', 'First we’ll go to the quarry, then to the amphitheatre.')],
          ['Najpierw pójdziemy do kamieniołom, a potem do amfiteatr.', t('(**do** + родовий: **do kamieniołomu**, **do amfiteatru**)', '(**do** + родительный: **do kamieniołomu**, **do amfiteatru**)', '(**do** + genitive: **do kamieniołomu**, **do amfiteatru**)')],
          ['Najpierw pójdziemy w kamieniołomie, potem w amfiteatrze.', t('(питання «куди?» — **do** + родовий; місцевий відповідає на «де?»)', '(вопрос «куда?» — **do** + родительный; предложный отвечает на «где?»)', '(“where to?” takes **do** + genitive; the locative answers “where?”)')],
        ],
        feedback: t('**Куди?** — **do** + родовий.', '**Куда?** — **do** + родительный.', '**Where to?** — **do** + genitive.'),
      },
      {
        npc: 'Na szczycie jest punkt widokowy. Skąd widać cały rezerwat?',
        tr: t('На вершині є оглядовий майданчик. Звідки видно весь заповідник?', 'На вершине есть смотровая площадка. Откуда виден весь заповедник?', 'There is a viewing point on the summit. Where can you see the whole reserve from?'),
        choose: [
          ['Cały rezerwat widać ze szczytu.', t('Весь заповідник видно з вершини.', 'Весь заповедник виден с вершины.', 'You can see the whole reserve from the summit.')],
          ['Cały rezerwat widać z szczytu.', t('(перед групою приголосних **sz-cz** — **ze**: **ze szczytu**)', '(перед группой согласных **sz-cz** — **ze**: **ze szczytu**)', '(before the consonant cluster **sz-cz** use **ze**: **ze szczytu**)')],
          ['Cały rezerwat widać przez szczyt.', t('(**przez** + знахідний — «крізь, через»; «звідки?» — **z / ze** + родовий)', '(**przez** + винительный — «сквозь, через»; «откуда?» — **z / ze** + родительный)', '(**przez** + accusative means “through”; “from where?” takes **z / ze** + genitive)')],
        ],
        feedback: t('**Звідки?** — **ze szczytu**.', '**Откуда?** — **ze szczytu**.', '**From where?** — **ze szczytu**.'),
      },
    ]),
    wordChoice('vocab.kadzielnia', 'wąwóz', [t('ущелина, яр', 'ущелье, овраг', 'ravine, gorge'), t('кар’єр', 'карьер', 'quarry'), t('скеля', 'скала', 'rock face')]),
    fillGap('grammar.kadzielnia', 'Koncert odbędzie się w ___ na Kadzielni.', ['amfiteatrze', 'amfiteatr', 'amfiteatru'], t('Концерт відбудеться в амфітеатрі на Кадзельні.', 'Концерт состоится в амфитеатре на Кадзельне.', 'The concert will take place in the amphitheatre on Kadzielnia.'),
      t('**w** + місцевий: **w amfiteatrze** (чергування **tr → trz**).', '**w** + предложный: **w amfiteatrze** (чередование **tr → trz**).', '**w** + locative: **w amfiteatrze** (the **tr → trz** alternation).')),
    match('grammar.kadzielnia', [
      ['wzdłuż szlaku', t('уздовж стежки', 'вдоль тропы', 'along the trail')],
      ['wbrew zakazowi', t('всупереч забороні', 'вопреки запрету', 'despite the ban')],
      ['dzięki przewodnikowi', t('завдяки провідникові', 'благодаря проводнику', 'thanks to the guide')],
      ['mimo deszczu', t('незважаючи на дощ', 'несмотря на дождь', 'despite the rain')],
    ]),
    grammar('grammar.kadzielnia', 'Szlak biegnie nad ___ i schodzi do wąwozu.', 'skała', ['skałami'], t('Стежка йде над скелями й спускається до ущелини.', 'Тропа идёт над скалами и спускается к ущелью.', 'The trail runs above the rocks and goes down into the ravine.'),
      t('**nad** + орудний (місце): **nad skałami**.', '**nad** + творительный (место): **nad skałami**.', '**nad** + instrumental (location): **nad skałami**.')),
    listen('listening.kadzielnia', 'Z centrum Kielc idziemy do kamieniołomu na Kadzielni.', ['Z centrum Kielc idziemy do kamieniołomu na Kadzielni.', 'Z centrum Kielc jedziemy do kamieniołomu na Kadzielni.', 'Z centrum Kielc idziemy do kamieniołomów na Kadzielni.']),
    reading('reading.kadzielnia', 'Kadzielnia to dawny kamieniołom wapienia w samym centrum Kielc. Dziś działa tu rezerwat geologiczny i amfiteatr na kilka tysięcy widzów. Szlak edukacyjny prowadzi od dolnej bramy przez wąwóz na szczyt, skąd widać całe miasto. Wstęp na teren rezerwatu jest bezpłatny, ale po zmroku bramę zamykają.',
      t('Którędy prowadzi szlak edukacyjny?', 'Каким путём ведёт образовательная тропа?', 'Which way does the educational trail lead?'),
      [t('від нижньої брами через ущелину на вершину', 'от нижних ворот через ущелье на вершину', 'from the lower gate through the ravine to the summit'), t('від вершини через амфітеатр до нижньої брами', 'от вершины через амфитеатр к нижним воротам', 'from the summit through the amphitheatre to the lower gate'), t('навколо кар’єру назад до нижньої брами', 'вокруг карьера назад к нижним воротам', 'around the quarry back to the lower gate')]),
    findError('grammar.kadzielnia', ['Szlak', 'prowadzi', 'przez', 'wąwozie', 'na', 'szczyt'], 3, t('Стежка веде через ущелину на вершину.', 'Тропа ведёт через ущелье на вершину.', 'The trail leads through the ravine to the summit.'),
      t('**przez** + знахідний: **przez wąwóz** (а не місцевий).', '**przez** + винительный: **przez wąwóz** (а не предложный).', '**przez** takes the accusative: **przez wąwóz**, not the locative.')),
    build('grammar.kadzielnia', 'Ze szczytu widać cały rezerwat', t('З вершини видно весь заповідник', 'С вершины виден весь заповедник', 'From the summit you can see the whole reserve'), ['szczyt', 'całego']),
    oddOne('grammar.kadzielnia', ['do kamieniołomu', 'do amfiteatru', 'do rezerwatu', 'do szczyta'], 3,
      t('Родовий від **szczyt** — **szczytu** (як **kamieniołomu**, **amfiteatru**, **rezerwatu**), а не **szczyta**.', 'Родительный от **szczyt** — **szczytu** (как **kamieniołomu**, **amfiteatru**, **rezerwatu**), а не **szczyta**.', 'The genitive of **szczyt** is **szczytu** (like **kamieniołomu**, **amfiteatru**, **rezerwatu**), not **szczyta**.'),
      t('Яка форма хибна?', 'Какая форма неверна?', 'Which form is wrong?')),
    translate('writing.kadzielnia', t('З вершини видно весь заповідник і кар’єр.', 'С вершины виден весь заповедник и карьер.', 'From the summit you can see the whole reserve and the quarry.'),
      ['Ze szczytu widać cały rezerwat i kamieniołom.', 'Ze szczytu widać cały rezerwat i kamieniołom', 'Ze szczytu widać cały rezerwat oraz kamieniołom']),
    speak('speaking.kadzielnia', 'Z centrum idziemy do kamieniołomu, a stamtąd przez wąwóz na szczyt.', t('З центру йдемо до кар’єру, а звідти через ущелину на вершину.', 'Из центра идём к карьеру, а оттуда через ущелье на вершину.', 'From the centre we walk to the quarry, and from there through the ravine to the summit.')),
  ],
};

const KIE_2: LessonSeed = {
  slug: 'kie-2-aspekt',
  title: t('Вид дієслова: печера Рай', 'Вид глагола: пещера Рай', 'Verb aspect: the Raj Cave'),
  topic: t(
    'недоконаний вид — тривалість і повторюваність (przez godzinę, codziennie), доконаний — результат і разова подія (nagle, w końcu); zacząć / skończyć + недоконаний інфінітив; nie + недоконаний у забороні',
    'несовершенный вид — длительность и повторяемость (przez godzinę, codziennie), совершенный — результат и разовое событие (nagle, w końcu); zacząć / skończyć + несовершенный инфинитив; nie + несовершенный в запрете',
    'imperfective for duration and repetition (przez godzinę, codziennie), perfective for a result or a single event (nagle, w końcu); zacząć / skończyć + imperfective infinitive; nie + imperfective in a ban',
  ),
  cefr: 'B2',
  difficulty: 4,
  explanation: t(
    '**Мета:** упевнено вибирати вид дієслова в розповіді про похід до печери.\n**Недоконаний** — процес, тривалість, повторюваність: **zwiedzaliśmy przez godzinę**, **codziennie schodzimy**. **Доконаний** — результат або разова подія: **nagle odkryliśmy**, **w końcu weszliśmy**.\nПісля **zacząć / skończyć / przestać** — лише недоконаний інфінітив: **zaczęliśmy zwiedzać**. У забороні — недоконаний: **Nie wchodźcie tam!**; **kazała nam nie wchodzić**.\nЧасові прийменники: **przez godzinę** (тривалість), **w godzinę** (за годину, до результату), **od godziny** (уже годину), **za godzinę** (через годину).',
    '**Цель:** уверенно выбирать вид глагола в рассказе о походе в пещеру.\n**Несовершенный** — процесс, длительность, повторяемость: **zwiedzaliśmy przez godzinę**, **codziennie schodzimy**. **Совершенный** — результат или разовое событие: **nagle odkryliśmy**, **w końcu weszliśmy**.\nПосле **zacząć / skończyć / przestać** — только несовершенный инфинитив: **zaczęliśmy zwiedzać**. В запрете — несовершенный: **Nie wchodźcie tam!**; **kazała nam nie wchodzić**.\nПредлоги времени: **przez godzinę** (длительность), **w godzinę** (за час, до результата), **od godziny** (уже час), **za godzinę** (через час).',
    '**Goal:** choose the verb aspect confidently when telling the story of a cave trip.\n**Imperfective** — process, duration, repetition: **zwiedzaliśmy przez godzinę**, **codziennie schodzimy**. **Perfective** — a result or a single event: **nagle odkryliśmy**, **w końcu weszliśmy**.\nAfter **zacząć / skończyć / przestać** use only the imperfective infinitive: **zaczęliśmy zwiedzać**. In a ban use the imperfective: **Nie wchodźcie tam!**; **kazała nam nie wchodzić**.\nTime phrases: **przez godzinę** (duration), **w godzinę** (within an hour, to completion), **od godziny** (for an hour already), **za godzinę** (in an hour).',
  ),
  examples: [
    { pl: 'Przez godzinę schodziliśmy w głąb jaskini, aż nagle odkryliśmy tajemniczy korytarz.', tr: t('Цілу годину ми спускалися вглиб печери, аж раптом виявили таємничий коридор.', 'Целый час мы спускались вглубь пещеры, пока вдруг не обнаружили таинственный коридор.', 'For an hour we went down into the cave until we suddenly discovered a mysterious passage.') },
    { pl: 'Przewodniczka kazała nam nie wchodzić do wąskiego korytarza.', tr: t('Провідниця наказала нам не заходити до вузького коридору.', 'Проводница велела нам не заходить в узкий коридор.', 'The guide told us not to enter the narrow passage.') },
  ],
  words: ['jaskinia', 'wyprawa', 'skarb', 'tajemniczy', 'odkryć', 'korytarz'],
  exercises: [
    dialogue('dialogue.raj', PRZEWODNICZKA, [
      {
        npc: 'Jak długo zwiedzaliście wczoraj jaskinię?',
        tr: t('Як довго ви вчора оглядали печеру?', 'Как долго вы вчера осматривали пещеру?', 'How long did you spend visiting the cave yesterday?'),
        choose: [
          ['Zwiedzaliśmy ją prawie dwie godziny.', t('Ми оглядали її майже дві години.', 'Мы осматривали её почти два часа.', 'We spent almost two hours visiting it.')],
          ['Zwiedziliśmy ją prawie dwie godziny.', t('(доконаний вид не поєднується з тривалістю «дві години» — потрібен недоконаний)', '(совершенный вид не сочетается с длительностью «два часа» — нужен несовершенный)', '(the perfective does not go with a duration like “two hours” — the imperfective is needed)')],
          ['Zwiedzamy ją prawie dwie godziny.', t('(питання про вчора — минулий час, а не теперішній)', '(вопрос про вчера — прошедшее время, а не настоящее)', '(the question is about yesterday, so the past tense, not the present)')],
        ],
        feedback: t('Тривалість — **недоконаний** вид: **zwiedzaliśmy**.', 'Длительность — **несовершенный** вид: **zwiedzaliśmy**.', 'Duration calls for the **imperfective**: **zwiedzaliśmy**.'),
      },
      {
        npc: 'A czy często tu schodzicie?',
        tr: t('А чи часто ви сюди спускаєтеся?', 'А часто ли вы сюда спускаетесь?', 'And do you often come down here?'),
        choose: [
          ['Nie, schodzimy tu tylko w weekendy.', t('Ні, ми спускаємося сюди тільки на вихідних.', 'Нет, мы спускаемся сюда только по выходным.', 'No, we only come down here at weekends.')],
          ['Nie, zejdziemy tu tylko w weekendy.', t('(повторюваність — недоконаний вид; доконаний **zejdziemy** — разова дія)', '(повторяемость — несовершенный вид; совершенный **zejdziemy** — разовое действие)', '(repetition needs the imperfective; the perfective **zejdziemy** is a single act)')],
          ['Nie, zeszliśmy tu tylko w weekendy.', t('(**zeszliśmy** — доконаний минулий: одна подія, а не звичка)', '(**zeszliśmy** — совершенное прошедшее: одно событие, а не привычка)', '(**zeszliśmy** is a perfective past — one event, not a habit)')],
        ],
        feedback: t('Звичка — **недоконаний** вид: **schodzimy**.', 'Привычка — **несовершенный** вид: **schodzimy**.', 'A habit takes the **imperfective**: **schodzimy**.'),
      },
    ]),
    wordChoice('vocab.raj', 'odkryć', [t('відкрити, виявити (щось нове)', 'открыть, обнаружить (что-то новое)', 'to discover'), t('відкрити (двері, вікно)', 'открыть (дверь, окно)', 'to open (a door, a window)'), t('прикрити, накрити', 'прикрыть, накрыть', 'to cover')]),
    fillGap('grammar.raj', 'Po wejściu do jaskini zaczęliśmy ___ tajemnicze korytarze.', ['zwiedzać', 'zwiedzić', 'zwiedzimy'], t('Після входу до печери ми почали оглядати таємничі коридори.', 'После входа в пещеру мы начали осматривать таинственные коридоры.', 'After entering the cave we began to explore the mysterious passages.'),
      t('Після **zacząć** — недоконаний інфінітив: **zwiedzać**.', 'После **zacząć** — несовершенный инфинитив: **zwiedzać**.', 'After **zacząć** use the imperfective infinitive: **zwiedzać**.')),
    match('grammar.raj', [
      ['przez godzinę', t('протягом години (тривалість)', 'в течение часа (длительность)', 'for an hour (duration)')],
      ['w godzinę', t('за годину (до результату)', 'за час (до результата)', 'within an hour (to completion)')],
      ['od godziny', t('уже годину (відтоді й досі)', 'уже час (с тех пор и до сих пор)', 'for an hour already (and still)')],
      ['za godzinę', t('через годину (у майбутньому)', 'через час (в будущем)', 'in an hour’s time (future)')],
    ]),
    grammar('grammar.raj', 'Kiedy doszliśmy do końca korytarza, nagle ___ ukrytą salę.', 'odkryć', ['odkryliśmy'], t('Коли ми дійшли до кінця коридору, раптом виявили приховану залу.', 'Когда мы дошли до конца коридора, вдруг обнаружили скрытый зал.', 'When we reached the end of the passage we suddenly discovered a hidden chamber.'),
      t('Разова несподівана подія — доконаний вид, минулий час: **odkryliśmy**.', 'Разовое неожиданное событие — совершенный вид, прошедшее время: **odkryliśmy**.', 'A single sudden event takes the perfective past: **odkryliśmy**.')),
    listen('listening.raj', 'Nie wchodźcie do tego korytarza, jest bardzo wąski i ciemny.', ['Nie wchodźcie do tego korytarza, jest bardzo wąski i ciemny.', 'Nie wejdźcie do tego korytarza, jest bardzo wąski i ciemny.', 'Nie wchodźcie do tego korytarza, jest bardzo wąski i zimny.']),
    reading('reading.raj', 'Jaskinia Raj leży niedaleko Kielc. Trasa turystyczna trwa około czterdziestu minut i prowadzi wąskimi korytarzami do kilku sal. Zwiedzanie odbywa się tylko z przewodnikiem, a grupy liczą najwyżej piętnaście osób. W jaskini jest chłodno nawet latem, dlatego warto zabrać ciepłą bluzę. Fotografowanie jest dozwolone, ale bez lampy błyskowej.',
      t('Dlaczego warto zabrać ciepłą bluzę?', 'Почему стоит взять тёплую кофту?', 'Why is it worth taking a warm top?'),
      [t('бо в печері прохолодно навіть улітку', 'потому что в пещере прохладно даже летом', 'because it is cool in the cave even in summer'), t('бо група чекає надворі понад годину', 'потому что группа ждёт снаружи больше часа', 'because the group waits outside for over an hour'), t('бо без неї до печери не пускають', 'потому что без неё в пещеру не пускают', 'because you are not allowed in without one')]),
    findError('grammar.raj', ['Przewodniczka', 'kazała', 'nam', 'nie', 'wejść', 'do', 'korytarza'], 4, t('Провідниця наказала нам не заходити до коридору.', 'Проводница велела нам не заходить в коридор.', 'The guide told us not to enter the passage.'),
      t('Заборона — недоконаний вид: **nie wchodzić**.', 'Запрет — несовершенный вид: **nie wchodzić**.', 'A ban takes the imperfective: **nie wchodzić**.')),
    build('grammar.raj', 'Zaczęliśmy zwiedzać jaskinię o dziesiątej', t('Ми почали оглядати печеру о десятій', 'Мы начали осматривать пещеру в десять', 'We began to explore the cave at ten'), ['zwiedzić', 'dziesiąta']),
    oddOne('grammar.raj', ['przez dwie godziny schodziliśmy', 'w dwie godziny zeszliśmy', 'codziennie schodzimy', 'nagle schodziliśmy'], 3,
      t('**Nagle** (разова подія) вимагає доконаного виду: **nagle zeszliśmy**.', '**Nagle** (разовое событие) требует совершенного вида: **nagle zeszliśmy**.', '**Nagle** (a single event) needs the perfective: **nagle zeszliśmy**.'),
      t('Яка фраза використовує вид дієслова хибно?', 'Какое выражение использует вид глагола неверно?', 'Which expression uses the wrong aspect?')),
    translate('writing.raj', t('Ми зайшли до печери й раптом побачили таємничий коридор.', 'Мы вошли в пещеру и вдруг увидели таинственный коридор.', 'We entered the cave and suddenly saw a mysterious passage.'),
      ['Weszliśmy do jaskini i nagle zobaczyliśmy tajemniczy korytarz.', 'Weszliśmy do jaskini i nagle zobaczyliśmy tajemniczy korytarz', 'Weszliśmy do jaskini i nagle zobaczyliśmy tajemnicze korytarze']),
    speak('speaking.raj', 'Przewodniczka kazała nam nie wchodzić do tego wąskiego korytarza.', t('Провідниця наказала нам не заходити до цього вузького коридору.', 'Проводница велела нам не заходить в этот узкий коридор.', 'The guide told us not to go into this narrow passage.')),
  ],
};

const KIE_3: LessonSeed = {
  slug: 'kie-3-czasy',
  title: t('Розповідь про минуле: палац і музей', 'Рассказ о прошлом: дворец и музей', 'Telling about the past: palace and museum'),
  topic: t(
    'od + родовий + теперішній час (działa od dwudziestu lat), w siedemnastym wieku, dawniej / kiedyś / dopiero co / do tej pory, родовий після заперечення (nie zwiedziłem pałacu), bywali (чоловічо-особова форма)',
    'od + родительный + настоящее время (działa od dwudziestu lat), w siedemnastym wieku, dawniej / kiedyś / dopiero co / do tej pory, родительный после отрицания (nie zwiedziłem pałacu), bywali (мужско-личная форма)',
    'od + genitive + present tense (działa od dwudziestu lat), w siedemnastym wieku, dawniej / kiedyś / dopiero co / do tej pory, genitive after negation (nie zwiedziłem pałacu), bywali (virile form)',
  ),
  cefr: 'B2',
  difficulty: 4,
  explanation: t(
    '**Мета:** розповісти про минуле міста й про те, що триває й досі.\n**Від якого часу?** — **od** + родовий і **теперішній час**: **Mieszkam tu od trzech lat**, **Muzeum działa od dwudziestu lat** (а не «mieszkałem od…»).\nСтоліття — у місцевому: **w siedemnastym wieku**; епоха: **w średniowieczu**. Минуле: **dawniej**, **kiedyś**; **do tej pory** — досі; **dopiero co** — щойно; **od dawna** — давно й досі.\nПісля заперечення об’єкт — у родовому: **Jeszcze nie zwiedziłem tego pałacu**. Чоловічо-особове мн.: **biskupi bywali** (не **bywały**).',
    '**Цель:** рассказать о прошлом города и о том, что продолжается до сих пор.\n**С какого времени?** — **od** + родительный и **настоящее время**: **Mieszkam tu od trzech lat**, **Muzeum działa od dwudziestu lat** (а не «mieszkałem od…»).\nВек — в предложном: **w siedemnastym wieku**; эпоха: **w średniowieczu**. Прошлое: **dawniej**, **kiedyś**; **do tej pory** — до сих пор; **dopiero co** — только что; **od dawna** — давно и до сих пор.\nПосле отрицания объект — в родительном: **Jeszcze nie zwiedziłem tego pałacu**. Мужско-личное мн.: **biskupi bywali** (не **bywały**).',
    '**Goal:** talk about the city’s past and about what still goes on today.\n**Since when?** — **od** + genitive and the **present tense**: **Mieszkam tu od trzech lat**, **Muzeum działa od dwudziestu lat** (not “mieszkałem od…”).\nA century takes the locative: **w siedemnastym wieku**; an era: **w średniowieczu**. The past: **dawniej**, **kiedyś**; **do tej pory** — until now; **dopiero co** — just now; **od dawna** — for a long time and still.\nAfter a negation the object is genitive: **Jeszcze nie zwiedziłem tego pałacu**. Virile plural: **biskupi bywali** (not **bywały**).',
  ),
  examples: [
    { pl: 'Muzeum Zabawek działa w Kielcach od dwudziestu lat.', tr: t('Музей іграшок працює в Кельцях уже двадцять років.', 'Музей игрушек работает в Кельце уже двадцать лет.', 'The Toy Museum has been open in Kielce for twenty years.') },
    { pl: 'W średniowieczu Kielce były małą osadą, a pałac biskupi powstał dopiero w siedemnastym wieku.', tr: t('У середньовіччі Кельце були невеликим поселенням, а палац єпископів з’явився лише у XVII столітті.', 'В средневековье Кельце были небольшим поселением, а дворец епископов появился только в XVII веке.', 'In the Middle Ages Kielce was a small settlement, and the bishops’ palace appeared only in the seventeenth century.') },
  ],
  words: ['pałac', 'biskup', 'średniowiecze', 'zabawka', 'zwiedzanie'],
  exercises: [
    dialogue('dialogue.palac', KASJERKA, [
      {
        npc: 'Od jak dawna mieszka pan w Kielcach?',
        tr: t('Як давно ви живете в Кельцях?', 'Как давно вы живёте в Кельце?', 'How long have you lived in Kielce?'),
        choose: [
          ['Mieszkam tu od trzech lat.', t('Я живу тут уже три роки.', 'Я живу здесь уже три года.', 'I have lived here for three years.')],
          ['Mieszkałem tu od trzech lat.', t('(**od** + теперішній час: ви живете тут і досі)', '(**od** + настоящее время: вы живёте здесь и сейчас)', '(**od** takes the present tense: you still live here)')],
          ['Mieszkam tu od trzy lata.', t('(**od** + родовий: **od trzech lat**)', '(**od** + родительный: **od trzech lat**)', '(**od** + genitive: **od trzech lat**)')],
        ],
        feedback: t('**od** + родовий + теперішній час: **mieszkam od trzech lat**.', '**od** + родительный + настоящее время: **mieszkam od trzech lat**.', '**od** + genitive + present tense: **mieszkam od trzech lat**.'),
      },
      {
        npc: 'Zwiedza pan też pałac biskupów. Kiedy go zbudowano?',
        tr: t('Ви оглядаєте й палац єпископів. Коли його збудували?', 'Вы осматриваете и дворец епископов. Когда его построили?', 'You are also visiting the bishops’ palace. When was it built?'),
        choose: [
          ['Zbudowano go w siedemnastym wieku.', t('Його збудували у сімнадцятому столітті.', 'Его построили в семнадцатом веке.', 'It was built in the seventeenth century.')],
          ['Zbudowano go w siedemnasty wiek.', t('(століття — у місцевому: **w siedemnastym wieku**)', '(век — в предложном: **w siedemnastym wieku**)', '(a century takes the locative: **w siedemnastym wieku**)')],
          ['Zbudowano go od siedemnastego wieku.', t('(**od** — «починаючи з»; на питання «коли?» — **w** + місцевий)', '(**od** — «начиная с»; на вопрос «когда?» — **w** + предложный)', '(**od** means “since”; “when?” takes **w** + locative)')],
        ],
        feedback: t('Століття — **w** + місцевий: **w siedemnastym wieku**.', 'Век — **w** + предложный: **w siedemnastym wieku**.', 'A century takes **w** + locative: **w siedemnastym wieku**.'),
      },
    ]),
    wordChoice('vocab.palac', 'średniowiecze', [t('середньовіччя', 'средневековье', 'the Middle Ages'), t('Відродження', 'Возрождение', 'the Renaissance'), t('бароко', 'барокко', 'the Baroque')]),
    fillGap('grammar.palac', 'Muzeum Zabawek działa w Kielcach od ___ lat.', ['dwudziestu', 'dwadzieścia', 'dwudziestym'], t('Музей іграшок працює в Кельцях уже двадцять років.', 'Музей игрушек работает в Кельце уже двадцать лет.', 'The Toy Museum has been open in Kielce for twenty years.'),
      t('**od** + родовий: **od dwudziestu lat**.', '**od** + родительный: **od dwudziestu lat**.', '**od** + genitive: **od dwudziestu lat**.')),
    match('grammar.palac', [
      ['kiedyś', t('колись (у минулому)', 'когда-то (в прошлом)', 'once, at some time in the past')],
      ['od dawna', t('давно (і досі)', 'давно (и до сих пор)', 'for a long time (and still)')],
      ['dopiero co', t('щойно, тільки-но', 'только что', 'just now')],
      ['do tej pory', t('досі, до цього часу', 'до сих пор, до этого времени', 'until now, so far')],
    ]),
    grammar('grammar.palac', 'Dawniej w tym pałacu często ___ biskupi.', 'bywać', ['bywali'], t('Колись у цьому палаці часто бували єпископи.', 'Когда-то в этом дворце часто бывали епископы.', 'Bishops often used to stay at this palace.'),
      t('**biskupi** — чоловічо-особовий множини: **bywali**.', '**biskupi** — мужско-личное множественное: **bywali**.', '**biskupi** is a virile plural: **bywali**.')),
    listen('listening.palac', 'Pałac zwiedzaliśmy dwie godziny, a muzeum tylko pół godziny.', ['Pałac zwiedzaliśmy dwie godziny, a muzeum tylko pół godziny.', 'Pałac zwiedzaliśmy trzy godziny, a muzeum tylko pół godziny.', 'Pałac zwiedzaliśmy dwie godziny, a muzeum prawie godzinę.']),
    reading('reading.palac', 'W Muzeum Zabawek zobaczysz zabawki z różnych epok: drewniane konie, lalki z porcelany i pierwsze samochodziki na kluczyk. Zwiedzanie z przewodnikiem trwa godzinę, a dzieci mogą potem same pobawić się w specjalnej sali. W poniedziałki muzeum jest nieczynne, a w pierwszą niedzielę miesiąca wstęp jest bezpłatny.',
      t('Коли вхід до музею безкоштовний?', 'Когда вход в музей бесплатный?', 'When is admission to the museum free?'),
      [t('у першу неділю місяця', 'в первое воскресенье месяца', 'on the first Sunday of the month'), t('щопонеділка', 'каждый понедельник', 'every Monday'), t('в останню суботу місяця', 'в последнюю субботу месяца', 'on the last Saturday of the month')]),
    findError('grammar.palac', ['Jeszcze', 'nie', 'zwiedziłem', 'tego', 'pałac'], 4, t('Я ще не оглядав цього палацу.', 'Я ещё не осматривал этот дворец.', 'I haven’t visited this palace yet.'),
      t('Після заперечення — родовий: **tego pałacu**.', 'После отрицания — родительный: **tego pałacu**.', 'After a negation use the genitive: **tego pałacu**.')),
    build('grammar.palac', 'Zwiedzanie muzeum zabawek trwa godzinę', t('Огляд музею іграшок триває годину', 'Осмотр музея игрушек длится час', 'Visiting the toy museum takes an hour'), ['zabawki', 'godzina']),
    oddOne('grammar.palac', ['w siedemnastym wieku', 'w średniowieczu', 'w osiemnastym wieku', 'w dziewiętnasty wiek'], 3,
      t('Століття — у місцевому: **w dziewiętnastym wieku**.', 'Век — в предложном: **w dziewiętnastym wieku**.', 'A century takes the locative: **w dziewiętnastym wieku**.'),
      t('Яка фраза містить помилку?', 'Какое выражение содержит ошибку?', 'Which expression contains a mistake?')),
    translate('writing.palac', t('Я працюю в музеї вже п’ять років і ще ніколи не бачив такого палацу.', 'Я работаю в музее уже пять лет и ещё никогда не видел такого дворца.', 'I have worked in the museum for five years and I have never seen such a palace.'),
      ['Pracuję w muzeum od pięciu lat i jeszcze nigdy nie widziałem takiego pałacu.', 'Pracuję w muzeum od pięciu lat i jeszcze nigdy nie widziałem takiego pałacu', 'Pracuję w muzeum od pięciu lat i nigdy nie widziałem takiego pałacu']),
    speak('speaking.palac', 'Muzeum Zabawek działa w Kielcach od dwudziestu lat.', t('Музей іграшок працює в Кельцях уже двадцять років.', 'Музей игрушек работает в Кельце уже двадцать лет.', 'The Toy Museum has been open in Kielce for twenty years.')),
  ],
};

const KIE_4: LessonSeed = {
  slug: 'kie-4-warunkowy',
  title: t('Умовний спосіб: Бартек і Святий Хрест', 'Условное наклонение: Бартек и Святой Крест', 'The conditional: Bartek and Święty Krzyż'),
  topic: t(
    'gdybym miał → pojechałbym (без подвійного -em / -m), gdyby nie + називний, żeby + інфінітив (та сама особа), pojechalibyśmy / pojechałybyśmy, nie *pojechałbyśmy',
    'gdybym miał → pojechałbym (без двойного -em / -m), gdyby nie + именительный, żeby + инфинитив (то же лицо), pojechalibyśmy / pojechałybyśmy, не *pojechałbyśmy',
    'gdybym miał → pojechałbym (no double -em / -m), gdyby nie + nominative, żeby + infinitive (same subject), pojechalibyśmy / pojechałybyśmy, not *pojechałbyśmy',
  ),
  cefr: 'B2',
  difficulty: 4,
  explanation: t(
    '**Мета:** будувати умовні речення про поїздку до Дімарок, дуба Бартека й абатства на Святому Хресті.\n**Умовний спосіб** = минула форма на **-ł- / -li-** + **by** + закінчення особи: **pojechałbym**, **pojechałabym**, **pojechalibyśmy** (група з чоловіком), **pojechałybyśmy** (самі жінки). Після **gdyby** закінчення особи вже є в **gdybym / gdybyś / gdybyśmy**, тож дієслово без нього: **Gdybym miał czas** (не *miałem*), **pojechałbym**.\n**Gdyby nie** + називний: **Gdyby nie przewodnik, nie dotarlibyśmy na szczyt.** Мета з тим самим підметом — **żeby + інфінітив**: **Pielgrzymi jadą tam, żeby zobaczyć opactwo.**',
    '**Цель:** строить условные предложения о поездке в Дымарки, к дубу Бартек и в аббатство на Святом Кресте.\n**Условное наклонение** = форма прошедшего на **-ł- / -li-** + **by** + окончание лица: **pojechałbym**, **pojechałabym**, **pojechalibyśmy** (группа с мужчиной), **pojechałybyśmy** (только женщины). После **gdyby** окончание лица уже есть в **gdybym / gdybyś / gdybyśmy**, поэтому глагол без него: **Gdybym miał czas** (не *miałem*), **pojechałbym**.\n**Gdyby nie** + именительный: **Gdyby nie przewodnik, nie dotarlibyśmy na szczyt.** Цель при том же подлежащем — **żeby + инфинитив**: **Pielgrzymi jadą tam, żeby zobaczyć opactwo.**',
    '**Goal:** build conditional sentences about a trip to Dymarki, the Bartek oak and the abbey on Święty Krzyż.\n**The conditional** = the past form in **-ł- / -li-** + **by** + a personal ending: **pojechałbym**, **pojechałabym**, **pojechalibyśmy** (a group with a man), **pojechałybyśmy** (women only). After **gdyby** the personal ending is already in **gdybym / gdybyś / gdybyśmy**, so the verb has none: **Gdybym miał czas** (not *miałem*), **pojechałbym**.\n**Gdyby nie** + nominative: **Gdyby nie przewodnik, nie dotarlibyśmy na szczyt.** A purpose with the same subject takes **żeby + infinitive**: **Pielgrzymi jadą tam, żeby zobaczyć opactwo.**',
  ),
  examples: [
    { pl: 'Gdybym miał cały dzień, pojechałbym na Święty Krzyż.', tr: t('Якби в мене був цілий день, я б поїхав на Святий Хрест.', 'Если бы у меня был целый день, я бы поехал на Святой Крест.', 'If I had a whole day, I would go to Święty Krzyż.') },
    { pl: 'Gdybyśmy mieli więcej czasu, zobaczylibyśmy też dawną hutę żelaza.', tr: t('Якби ми мали більше часу, то побачили б ще й колишню залізоплавильну гуту.', 'Если бы у нас было больше времени, мы увидели бы ещё и бывшую железоплавильную гуту.', 'If we had more time we would also see the former ironworks.') },
  ],
  words: ['żelazo', 'huta', 'dąb', 'opactwo', 'pielgrzym'],
  exercises: [
    dialogue('dialogue.dab', DORADCZYNI, [
      {
        npc: 'Gdyby pan miał cały wolny dzień, dokąd by pan pojechał?',
        tr: t('Якби у вас був цілий вільний день, куди б ви поїхали?', 'Если бы у вас был целый свободный день, куда бы вы поехали?', 'If you had a whole free day, where would you go?'),
        choose: [
          ['Gdybym miał cały dzień, pojechałbym na Święty Krzyż.', t('Якби в мене був цілий день, я б поїхав на Святий Хрест.', 'Если бы у меня был целый день, я бы поехал на Святой Крест.', 'If I had a whole day, I would go to Święty Krzyż.')],
          ['Gdybym miałem cały dzień, pojechałbym na Święty Krzyż.', t('(після **gdybym** закінчення особи вже є — **miał**, а не *miałem*)', '(после **gdybym** окончание лица уже есть — **miał**, а не *miałem*)', '(**gdybym** already carries the person ending — **miał**, not *miałem*)')],
          ['Gdybym miał cały dzień, pojadę na Święty Krzyż.', t('(у головній частині — умовний спосіб: **pojechałbym**, а не майбутній час)', '(в главной части — условное наклонение: **pojechałbym**, а не будущее время)', '(the main clause needs the conditional: **pojechałbym**, not the future)')],
        ],
        feedback: t('**Gdybym miał…, pojechałbym…**', '**Gdybym miał…, pojechałbym…**', '**Gdybym miał…, pojechałbym…**'),
      },
      {
        npc: 'A po co ludzie jadą na Święty Krzyż?',
        tr: t('А навіщо люди їдуть на Святий Хрест?', 'А зачем люди едут на Святой Крест?', 'And why do people go to Święty Krzyż?'),
        choose: [
          ['Pielgrzymi jadą tam, żeby zobaczyć stare opactwo.', t('Прочани їдуть туди, щоб побачити старе абатство.', 'Паломники едут туда, чтобы увидеть старое аббатство.', 'Pilgrims go there to see the old abbey.')],
          ['Pielgrzymi jadą tam, żeby widzą stare opactwo.', t('(після **żeby** при тому самому підметі — інфінітив, а не теперішній час)', '(после **żeby** при том же подлежащем — инфинитив, а не настоящее время)', '(after **żeby** with the same subject use the infinitive, not the present tense)')],
          ['Pielgrzymi jadą tam, bo zobaczyć stare opactwo.', t('(**bo** вводить причину з особовою формою, а не інфінітив)', '(**bo** вводит причину с личной формой, а не инфинитив)', '(**bo** introduces a reason with a finite verb, not an infinitive)')],
        ],
        feedback: t('Мета при тому самому підметі — **żeby + інфінітив**.', 'Цель при том же подлежащем — **żeby + инфинитив**.', 'A purpose with the same subject — **żeby + infinitive**.'),
      },
    ]),
    wordChoice('vocab.dab', 'huta', [t('залізоплавильний чи сталеливарний завод', 'железоплавильный или сталелитейный завод', 'ironworks, steelworks'), t('хата, хатина', 'хата, домик', 'a hut, a cottage'), t('шахта, копальня', 'шахта, рудник', 'a mine')]),
    fillGap('grammar.dab', 'Gdyby nie ___, nie dotarlibyśmy na szczyt.', ['przewodnik', 'przewodnika', 'przewodnikowi'], t('Якби не провідник, ми б не дійшли до вершини.', 'Если бы не проводник, мы бы не дошли до вершины.', 'If it weren’t for the guide, we would not have reached the summit.'),
      t('**gdyby nie** + називний: **gdyby nie przewodnik**.', '**gdyby nie** + именительный: **gdyby nie przewodnik**.', '**gdyby nie** + nominative: **gdyby nie przewodnik**.')),
    match('grammar.dab', [
      ['pojechałbym', t('я б поїхав', 'я бы поехал', 'I would go (male speaker)')],
      ['pojechałabym', t('я б поїхала', 'я бы поехала', 'I would go (female speaker)')],
      ['pojechalibyśmy', t('ми б поїхали (група з чоловіком)', 'мы бы поехали (группа с мужчиной)', 'we would go (a group with a man)')],
      ['pojechałyby', t('вони б поїхали (лише жінки)', 'они бы поехали (только женщины)', 'they would go (women only)')],
    ]),
    grammar('grammar.dab', 'Gdybyśmy ___ samochód, pojechalibyśmy do Zagnańska.', 'mieć', ['mieli'], t('Якби в нас була машина, ми б поїхали до Загнаньська.', 'Если бы у нас была машина, мы бы поехали в Загнаньск.', 'If we had a car we would go to Zagnańsk.'),
      t('**gdybyśmy** уже має закінчення особи: **mieli** (без *-śmy*).', '**gdybyśmy** уже имеет окончание лица: **mieli** (без *-śmy*).', '**gdybyśmy** already has the person ending: **mieli** (without *-śmy*).')),
    listen('listening.dab', 'Gdybym miał więcej czasu, odwiedziłbym też opactwo na Świętym Krzyżu.', ['Gdybym miał więcej czasu, odwiedziłbym też opactwo na Świętym Krzyżu.', 'Gdyby miał więcej czasu, odwiedziłby też opactwo na Świętym Krzyżu.', 'Gdybym miał więcej czasu, odwiedzałbym też opactwo na Świętym Krzyżu.']),
    reading('reading.dab', 'Dąb Bartek rośnie we wsi Bartków niedaleko Zagnańska, kilkanaście kilometrów od Kielc. Według różnych szacunków ma od sześciuset do siedmiuset lat i należy do najstarszych drzew w Polsce. Chociaż jego pień jest częściowo pusty, dąb wciąż żyje i co roku wypuszcza nowe liście. Obok drzewa stoi tablica z informacjami dla turystów.',
      t('Скільки років, за різними оцінками, має дуб Бартек?', 'Сколько лет, по разным оценкам, дубу Бартек?', 'How old is the Bartek oak, according to different estimates?'),
      [t('від шестисот до семисот років', 'от шестисот до семисот лет', 'between six and seven hundred years'), t('від трьохсот до чотирьохсот років', 'от трёхсот до четырёхсот лет', 'between three and four hundred years'), t('від тисячі до тисячі двохсот років', 'от тысячи до тысячи двухсот лет', 'between one thousand and twelve hundred years')]),
    findError('grammar.dab', ['Pielgrzymi', 'idą', 'na', 'szczyt', 'żeby', 'zobaczyli', 'opactwo'], 5, t('Прочани йдуть на вершину, щоб побачити абатство.', 'Паломники идут на вершину, чтобы увидеть аббатство.', 'The pilgrims walk to the summit to see the abbey.'),
      t('Мета при тому самому підметі — **żeby zobaczyć**.', 'Цель при том же подлежащем — **żeby zobaczyć**.', 'A purpose with the same subject — **żeby zobaczyć**.')),
    build('grammar.dab', 'Gdybym miał czas pojechałbym zobaczyć dąb Bartek', t('Якби я мав час, поїхав би подивитися на дуб Бартек', 'Если бы у меня было время, я поехал бы посмотреть на дуб Бартек', 'If I had time I would go to see the Bartek oak'), ['miałem', 'pojadę']),
    oddOne('grammar.dab', ['pojechałbym', 'pojechałabym', 'pojechalibyśmy', 'pojechałbyśmy'], 3,
      t('Такої форми немає: **pojechalibyśmy** (група з чоловіком) або **pojechałybyśmy** (самі жінки).', 'Такой формы нет: **pojechalibyśmy** (группа с мужчиной) или **pojechałybyśmy** (только женщины).', 'There is no such form: **pojechalibyśmy** (a group with a man) or **pojechałybyśmy** (women only).'),
      t('Яка форма не існує?', 'Какой формы не существует?', 'Which form does not exist?')),
    translate('writing.dab', t('Якби ми мали машину, поїхали б до Загнаньська й побачили б дуб Бартек.', 'Если бы у нас была машина, мы поехали бы в Загнаньск и увидели бы дуб Бартек.', 'If we had a car, we would go to Zagnańsk and see the Bartek oak.'),
      ['Gdybyśmy mieli samochód, pojechalibyśmy do Zagnańska i zobaczylibyśmy dąb Bartek.', 'Gdybyśmy mieli samochód, pojechalibyśmy do Zagnańska i zobaczylibyśmy dąb Bartek', 'Gdybyśmy mieli samochód, to pojechalibyśmy do Zagnańska i zobaczylibyśmy dąb Bartek.']),
    speak('speaking.dab', 'Gdybym miał więcej czasu, pojechałbym na Święty Krzyż.', t('Якби я мав більше часу, я б поїхав на Святий Хрест.', 'Если бы у меня было больше времени, я бы поехал на Святой Крест.', 'If I had more time I would go to Święty Krzyż.')),
  ],
};

export const KIELCE: CityContent = {
  city: 'kielce',
  routes: [
    {
      slug: 'kie-miasto',
      title: t('Кадзельня й печера', 'Кадзельня и пещера', 'Kadzielnia and the cave'),
      description: t('Przypadki z przyimkami, aspekt czasownika, jaskinia Raj', 'Przypadki z przyimkami, aspekt czasownika, jaskinia Raj', 'Przypadki z przyimkami, aspekt czasownika, jaskinia Raj'),
      icon: 'explore',
      lessons: [KIE_1, KIE_2],
    },
    {
      slug: 'kie-historia',
      title: t('Палац і Святий Хрест', 'Дворец и Святой Крест', 'The palace and Święty Krzyż'),
      description: t('Od + родовий, dawniej, tryb warunkowy, gdyby nie', 'Od + родительный, dawniej, tryb warunkowy, gdyby nie', 'Od + genitive, dawniej, tryb warunkowy, gdyby nie'),
      icon: 'receipt-check',
      lessons: [KIE_3, KIE_4],
    },
    {
      slug: 'kie-legendy',
      title: t('Лиса гора й легенди', 'Лысая гора и легенды', 'Łysa Góra and legends'),
      description: t('Zdania złożone, który / która / które, liczebniki', 'Zdania złożone, który / która / które, liczebniki', 'Zdania złożone, który / która / które, liczebniki'),
      icon: 'shopping',
      lessons: [KIE_5_8[0], KIE_5_8[1]],
    },
    {
      slug: 'kie-zasady',
      title: t('Заповідник і легенда', 'Заповедник и легенда', 'The reserve and the legend'),
      description: t('Nie wolno, należy, nakaz, mowa zależna, według legendy', 'Nie wolno, należy, nakaz, mowa zależna, według legendy', 'Nie wolno, należy, nakaz, mowa zależna, według legendy'),
      icon: 'office',
      lessons: [KIE_5_8[2], KIE_5_8[3]],
    },
    {
      slug: 'kie-egzamin',
      title: t('Іспит Кельців', 'Экзамен Кельце', 'Kielce exam'),
      description: t('Відмінки, вид, час, умовний спосіб, складні речення, числівники, заборони, розповідь', 'Падежи, вид, время, условное наклонение, сложные предложения, числительные, запреты, рассказ', 'Cases, aspect, tenses, the conditional, complex sentences, numerals, bans, storytelling'),
      icon: 'achievements',
      lessons: [KIE_BOSS],
    },
  ],
};
