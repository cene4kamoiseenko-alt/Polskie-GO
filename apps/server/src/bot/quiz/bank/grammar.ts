/** Вопросы бота: грамматика в живых фразах (падежи, предлоги, глаголы). */
import { q, type QuizQuestion } from './types';

export const GRAMMAR_Q: QuizQuestion[] = [
  q({
    id: 'gr-w-krakowie', category: 'grammar', cefr: 'A1', kind: 'preposition', image: 'warszawa-starowka',
    prompt: {
      ru: 'Вставь: «Moja siostra mieszka ___.» (в Гданьске)',
      uk: 'Встав: «Moja siostra mieszka ___.» (у Гданську)',
      en: 'Fill in: «Moja siostra mieszka ___.» (in Gdańsk)',
    },
    options: ['w Gdańsku', 'w Gdańsk', 'w Gdańska', 'na Gdańsku'],
    answer: 0,
    explain: {
      ru: 'Где? — «w» + местный падеж: w Gdańsku, w Krakowie. «W Gdańsk» — калька, «w Gdańska» — родительный (do Gdańska — куда), «na» с названиями городов не употребляют.',
      uk: 'Де? — «w» + місцевий відмінок: w Gdańsku, w Krakowie. «W Gdańsk» — калька, «w Gdańska» — родовий (do Gdańska — куди), «na» з назвами міст не вживають.',
      en: 'Where? — «w» + locative: w Gdańsku, w Krakowie. «W Gdańsk» is a calque, «w Gdańska» uses the genitive (do Gdańska — where to), and cities don\'t take «na».',
    },
  }),
  q({
    id: 'gr-jestem', category: 'grammar', cefr: 'A1', kind: 'verb', image: 'mieszkanie',
    prompt: {
      ru: 'Вставь: «Czy ty ___ dziś w domu?» (быть)',
      uk: 'Встав: «Czy ty ___ dziś w domu?» (бути)',
      en: 'Fill in: «Czy ty ___ dziś w domu?» (to be)',
    },
    options: ['jesteś', 'jest', 'jestem', 'są'],
    answer: 0,
    explain: {
      ru: '«Ty» — 2-е лицо: jesteś. «Jest» — он, она, оно, «jestem» — я, «są» — они.',
      uk: '«Ty» — 2-га особа: jesteś. «Jest» — він, вона, воно, «jestem» — я, «są» — вони.',
      en: '«Ty» is the second person: jesteś. «Jest» is he/she/it, «jestem» — I am, «są» — they are.',
    },
  }),
  q({
    id: 'gr-na-koncert', category: 'grammar', cefr: 'A2', kind: 'preposition', image: 'warszawa-starowka',
    prompt: {
      ru: 'Вставь: «W sobotę idziemy ___ jazzowy.»',
      uk: 'Встав: «W sobotę idziemy ___ jazzowy.»',
      en: 'Fill in: «W sobotę idziemy ___ jazzowy.»',
    },
    options: ['na koncert', 'do koncertu', 'na koncercie', 'w koncert'],
    answer: 0,
    explain: {
      ru: 'На события ходят с «na» + винительный: na koncert, na mecz, na wesele. «Na koncercie» — «на концерте» (где?), «do koncertu» — «до концерта» (по времени), «w koncert» — калька.',
      uk: 'На події ходять із «na» + знахідний: na koncert, na mecz, na wesele. «Na koncercie» — «на концерті» (де?), «do koncertu» — «до концерту» (за часом), «w koncert» — калька.',
      en: 'Events take «na» + accusative: na koncert, na mecz, na wesele. «Na koncercie» means at the concert (where?), «do koncertu» — until the concert, «w koncert» is a calque.',
    },
  }),
  q({
    id: 'gr-o-osiemnastej', category: 'grammar', cefr: 'A2', kind: 'preposition', image: 'stop-cafe',
    prompt: {
      ru: 'Вставь: «Spotykamy się ___.» (в 18:00)',
      uk: 'Встав: «Spotykamy się ___.» (о 18:00)',
      en: 'Fill in: «Spotykamy się ___.» (at 18:00)',
    },
    options: ['o osiemnastej', 'w osiemnastej', 'o osiemnastu', 'o osiemnaście'],
    answer: 0,
    explain: {
      ru: 'Время по часам — «o» + местный падеж порядкового числительного: o osiemnastej (godzinie). «W osiemnastej» — калька с «в 18», «osiemnastu» и «osiemnaście» — количественные числительные, не порядковые.',
      uk: 'Час за годинником — «o» + місцевий відмінок порядкового числівника: o osiemnastej (godzinie). «W osiemnastej» — калька з «в 18», «osiemnastu» і «osiemnaście» — кількісні числівники, не порядкові.',
      en: 'Clock time is «o» + the locative of the ordinal: o osiemnastej (godzinie). «W osiemnastej» is a calque, «osiemnastu» and «osiemnaście» are cardinal numbers, not ordinals.',
    },
  }),
  q({
    id: 'gr-siostre', category: 'grammar', cefr: 'A2', kind: 'complete', image: 'mieszkanie',
    prompt: {
      ru: 'Вставь: «Mam ___ i dwóch braci.» (младшая сестра)',
      uk: 'Встав: «Mam ___ i dwóch braci.» (молодша сестра)',
      en: 'Fill in: «Mam ___ i dwóch braci.» (a younger sister)',
    },
    options: ['młodszą siostrę', 'młodsza siostra', 'młodszej siostry', 'młodszą siostrą'],
    answer: 0,
    explain: {
      ru: '«Mam» требует винительного: młodsza siostra → młodszą siostrę. «Młodszej siostry» — родительный (nie mam siostry), «młodszą siostrą» — творительный (z siostrą).',
      uk: '«Mam» вимагає знахідного: młodsza siostra → młodszą siostrę. «Młodszej siostry» — родовий (nie mam siostry), «młodszą siostrą» — орудний (z siostrą).',
      en: '«Mam» takes the accusative: młodsza siostra → młodszą siostrę. «Młodszej siostry» is the genitive (nie mam siostry), «młodszą siostrą» the instrumental (z siostrą).',
    },
  }),
  q({
    id: 'gr-poszlismy', category: 'grammar', cefr: 'B1', kind: 'verb', image: 'warszawa-starowka',
    prompt: {
      ru: 'Вставь: «Wczoraj ___ z Olą i Markiem do kina.» (мы пошли)',
      uk: 'Встав: «Wczoraj ___ z Olą i Markiem do kina.» (ми пішли)',
      en: 'Fill in: «Wczoraj ___ z Olą i Markiem do kina.» (we went)',
    },
    options: ['poszliśmy', 'poszłyśmy', 'poszli', 'pójdziemy'],
    answer: 0,
    explain: {
      ru: 'В группе есть мужчина (Marek) — мужско-личная форма: poszliśmy. «Poszłyśmy» — только если все в группе женщины, «poszli» — «они пошли», «pójdziemy» — «пойдём».',
      uk: 'У групі є чоловік (Marek) — чоловічо-особова форма: poszliśmy. «Poszłyśmy» — лише якщо всі в групі жінки, «poszli» — «вони пішли», «pójdziemy» — «підемо».',
      en: 'The group includes a man (Marek), so the masculine-personal form: poszliśmy. «Poszłyśmy» is only for an all-female group, «poszli» means "they went", «pójdziemy» — "we will go".',
    },
  }),
];
